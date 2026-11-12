import { AgentFlowError, ok } from './errors.js';
import { paginate } from './paginate.js';
export function fileSetEnvelope(fileSetId, path) {
    return path === undefined ? { $fileSet: fileSetId } : { $fileSet: fileSetId, path };
}
/** How many files an upload sends at once. Exported for the module's tests; the package index does not re-export it. */
export const UPLOADS_IN_FLIGHT = 4;
// A dropped folder is read through the browser's entry API, a file and a directory at a time; this many are asked for at once.
const READS_IN_FLIGHT = 8;
const LIST_PAGE = 200;
/** A directory's entries. A browser hands them over a batch at a time, and an empty batch at the end. */
async function entriesOf(directory) {
    const reader = directory.createReader();
    const entries = [];
    for (;;) {
        const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
        if (batch.length === 0)
            return entries;
        entries.push(...batch);
    }
}
/**
 * Runs at most `max` tasks at once, the rest in the order they were asked for. Once a task fails, none that has not begun
 * is begun: each fails with the first failure, which is the one its caller is already being told.
 */
function limitTo(max) {
    let running = 0;
    let failed = null;
    const waiting = [];
    return async (task) => {
        // A task that finishes hands its place to the next one waiting, so `running` is not counted down and up again.
        if (running < max)
            running++;
        else
            await new Promise((resolve) => waiting.push(resolve));
        try {
            if (failed)
                throw failed.error;
            return await task();
        }
        catch (error) {
            failed ??= { error };
            throw error;
        }
        finally {
            const next = waiting.shift();
            if (next)
                next();
            else
                running--;
        }
    };
}
/**
 * The files under an entry, in the order the directories list them. A place is held for one file's read or one
 * directory's listing and never across a directory's children, so a deep folder cannot use every place up waiting on itself.
 */
async function walk(entry, path, limit) {
    if (entry.isFile) {
        return [{ path, file: await limit(() => new Promise((resolve, reject) => entry.file(resolve, reject))) }];
    }
    const children = await limit(() => entriesOf(entry));
    return (await Promise.all(children.map((child) => walk(child, path ? `${path}/${child.name}` : child.name, limit)))).flat();
}
// Files an operating system writes into every folder it shows. Uploaded, one would land in each dossier.
const OS_FILES = new Set(['.ds_store', 'thumbs.db', 'desktop.ini']);
const isOsFile = (path) => OS_FILES.has(path.slice(path.lastIndexOf('/') + 1).toLowerCase());
async function folderFiles(files) {
    const limit = limitTo(READS_IN_FLIGHT);
    const found = await Promise.all(files.map(async (item) => {
        if ('isDirectory' in item)
            return walk(item, files.length === 1 && item.isDirectory ? '' : item.name, limit);
        // `webkitRelativePath` starts with the picked folder's own name; a file picked on its own has none.
        const below = item.webkitRelativePath.indexOf('/');
        return [{ path: below < 0 ? item.name : item.webkitRelativePath.slice(below + 1), file: item }];
    }));
    return found.flat().filter(({ path }) => !isOsFile(path));
}
function plainFiles(files) {
    const taken = new Set(files.map((file) => file.name));
    const seen = new Set();
    return files.map((file) => {
        let name = file.name;
        if (seen.has(name)) {
            const dot = name.lastIndexOf('.');
            const [stem, extension] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
            for (let n = 2; taken.has(name); n++)
                name = `${stem} (${n})${extension}`;
            taken.add(name);
        }
        seen.add(name);
        return { path: `files/${name}`, file };
    });
}
/** Sources of the folders a launch can take: the organization's watched folders, and folders or files from the person's computer. */
export function folderSources(client) {
    async function deleteSet(setId) {
        await ok(client.DELETE('/upload-sets/{file_set_id}', { params: { path: { file_set_id: setId } } }));
    }
    /** The declared files of the set being resumed, or null when it is not the set these files would declare. */
    async function resumable(setId, picked, signal) {
        const declared = [];
        try {
            const pages = paginate((cursor) => ok(client.GET('/upload-sets/{file_set_id}/files', { params: { path: { file_set_id: setId }, query: { cursor, limit: LIST_PAGE } }, signal })));
            for await (const file of pages)
                declared.push(file);
        }
        catch (error) {
            if (error instanceof AgentFlowError && error.status === 404)
                return null;
            throw error;
        }
        if (declared.length === picked.size && declared.every((file) => picked.get(file.path)?.size === file.byte_size))
            return declared;
        // A set that differs can never be completed with these files, and it holds one of the person's few unfinished sets.
        // One the server will not delete is left: the new upload does not depend on it.
        await deleteSet(setId).catch((error) => {
            if (!(error instanceof AgentFlowError))
                throw error;
        });
        return null;
    }
    async function upload(files, opts) {
        const { signal } = opts;
        signal?.throwIfAborted();
        const picked = new Map(files.map(({ path, file }) => [path, file]));
        const resumed = opts.resumeSetId ? await resumable(opts.resumeSetId, picked, signal) : null;
        let setId;
        let refused;
        let stored;
        let missing;
        if (resumed) {
            setId = opts.resumeSetId;
            refused = resumed.flatMap((file) => (file.refused_reason ? [{ path: file.path, reason: file.refused_reason }] : []));
            stored = resumed.filter((file) => file.stored).length;
            missing = resumed.filter((file) => !file.stored && !file.refused_reason).map((file) => file.path);
        }
        else {
            const declared = files.map(({ path, file }) => ({ path, byte_size: file.size }));
            const set = await ok(client.POST('/upload-sets', { body: { name: opts.name, files: declared }, signal }));
            setId = set.id;
            refused = set.refused;
            stored = 0;
            const left = new Set(refused.map((file) => file.path));
            missing = declared.map((file) => file.path).filter((path) => !left.has(path));
        }
        const total = stored + missing.length;
        try {
            if (!resumed)
                opts.onSetCreated?.(setId);
            opts.onProgress?.({ stored, total });
            let next = 0;
            let failed = false;
            const worker = async () => {
                while (!failed && !signal?.aborted && next < missing.length) {
                    const path = missing[next++];
                    const form = new FormData();
                    // The server checks the path before it reads the file, so the path is sent first.
                    form.append('path', path);
                    form.append('file', picked.get(path));
                    try {
                        await ok(client.POST('/upload-sets/{file_set_id}/files', {
                            params: { path: { file_set_id: setId } },
                            body: form,
                            signal,
                        }));
                    }
                    catch (error) {
                        failed = true;
                        throw error;
                    }
                    stored += 1;
                    opts.onProgress?.({ stored, total });
                }
            };
            // Every upload in flight has ended before this returns or throws, so a delete that follows races none of them.
            const ended = await Promise.allSettled(Array.from({ length: UPLOADS_IN_FLIGHT }, worker));
            const failure = ended.find((end) => end.status === 'rejected');
            if (failure)
                throw failure.reason;
            signal?.throwIfAborted();
            await ok(client.POST('/upload-sets/{file_set_id}/complete', { params: { path: { file_set_id: setId } }, signal }));
        }
        catch (error) {
            if (!resumed && signal?.aborted)
                await deleteSet(setId).catch(() => undefined);
            throw error;
        }
        return { value: fileSetEnvelope(setId), refused };
    }
    return {
        async watched() {
            return (await ok(client.GET('/watched-folders'))).items;
        },
        subfolders(setId, path, cursor) {
            return ok(client.GET('/watched-folders/{file_set_id}/subfolders', {
                params: { path: { file_set_id: setId }, query: { path, cursor: cursor ?? undefined } },
            }));
        },
        preview(workflowId, field, value, versionId) {
            return ok(client.POST('/workflows/{workflow_id}/folder-preview', {
                params: { path: { workflow_id: workflowId } },
                body: { field, file_set_id: value.$fileSet, path: value.path, version_id: versionId },
            }));
        },
        async uploadFolder(files, opts) {
            return upload(await folderFiles(files), opts);
        },
        async uploadFiles(files, opts) {
            return upload(plainFiles(files), opts);
        },
        deleteSet,
    };
}
//# sourceMappingURL=folders.js.map