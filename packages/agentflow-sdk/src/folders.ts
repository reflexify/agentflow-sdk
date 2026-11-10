import type { AgentFlowClient } from './client.js';
import type { CursorPage } from './cursor-list.js';
import { AgentFlowError, ok } from './errors.js';
import type { components } from './generated/public.js';
import { paginate } from './paginate.js';

type Schemas = components['schemas'];

/** What one unit of work is when a file field is given a folder, as a workflow's input contract says it per field. */
export type SlotFolder = Schemas['SlotFolder'];
export type WatchedFolder = Schemas['WatchedFolder'];
export type Subfolder = Schemas['WatchedSubfolder'];
export type FolderPreview = Schemas['FolderLaunchPreview'];
/** A declared file the server will not store, and why (`FILE_TOO_LARGE`). */
export type RefusedFile = Schemas['UploadSetRefusedFile'];

/**
 * The value a launch takes for a file field bound to a folder: a watched folder or an upload set, and optionally one folder
 * inside a watched folder. The API refuses any other key.
 */
export interface FileSetEnvelope {
  $fileSet: string;
  /** A folder inside a watched folder, as a path from its root: the run takes only what is under it. */
  path?: string;
}

export function fileSetEnvelope(fileSetId: string, path?: string): FileSetEnvelope {
  return path === undefined ? { $fileSet: fileSetId } : { $fileSet: fileSetId, path };
}

export interface UploadProgress {
  /** Files of the set that are stored, counting those stored before a resumed upload began. */
  stored: number;
  /** Files the set will hold: those declared, less those the server refused. */
  total: number;
}

export interface UploadOptions {
  /** What the person calls the set, at most 200 characters. */
  name: string;
  /**
   * An upload set an earlier, interrupted upload announced. When the files given now are exactly the ones it declared, by path
   * and size, only those not yet stored are uploaded. Otherwise that set is deleted and the upload starts as a new one.
   */
  resumeSetId?: string;
  /** Called with a new set's id as soon as it exists, before any file is uploaded: keep it to resume after a reload. */
  onSetCreated?: (setId: string) => void;
  onProgress?: (progress: UploadProgress) => void;
  /** Aborting stops the upload, and deletes the set when this call created it. */
  signal?: AbortSignal;
}

export interface UploadResult {
  /** The value to launch with: the completed upload set. */
  value: FileSetEnvelope;
  /** The files left out of the set, which is complete without them. */
  refused: RefusedFile[];
}

export interface FolderSources {
  /** The watched folders the caller may use. */
  watched(): Promise<WatchedFolder[]>;
  /** The folders directly inside a watched folder, or inside the folder at `path`, a page at a time in name order. */
  subfolders(setId: string, path?: string, cursor?: string | null): Promise<CursorPage<Subfolder>>;
  /** What a launch binding `value` to a field of the workflow's start form would take, without starting anything. */
  preview(workflowId: string, field: string, value: FileSetEnvelope, versionId?: string): Promise<FolderPreview>;
  /**
   * Uploads a folder from the person's computer into an upload set, each file at its path inside the folder. The folder's own
   * name is not part of a path, so the folders directly inside it are the first level a launch groups by.
   *
   * `files` is what a folder input (`webkitdirectory`) selected, or the entries of a drop
   * (`DataTransferItem.webkitGetAsEntry()`). Several entries dropped together keep their own names as the first level.
   * Dropped entries are read a few at a time, and the files keep the order their directories list them in.
   *
   * The files an operating system keeps in a folder for itself are left out at any depth: `.DS_Store`, `Thumbs.db` and
   * `desktop.ini`, whatever the case of the name.
   *
   * An upload that fails leaves its set in place to be resumed with `resumeSetId`.
   */
  uploadFolder(files: File[] | FileSystemEntry[], opts: UploadOptions): Promise<UploadResult>;
  /**
   * Uploads plain files into an upload set as one folder, `files/`, so a launch reads them as it reads a folder of files.
   * A name given more than once keeps the first as it is and numbers the later ones before the extension, in the order given,
   * skipping any number another file's name already has: `scan.pdf`, `scan (2).pdf`, `scan (3).pdf`.
   */
  uploadFiles(files: File[], opts: UploadOptions): Promise<UploadResult>;
  /** Deletes an upload set and the files stored in it, which frees one of the person's few unfinished sets. */
  deleteSet(setId: string): Promise<void>;
}

interface PickedFile {
  path: string;
  file: File;
}

const UPLOADS_IN_FLIGHT = 4;
// A dropped folder is read through the browser's entry API, a file and a directory at a time; this many are asked for at once.
const READS_IN_FLIGHT = 8;
const LIST_PAGE = 200;

/** A directory's entries. A browser hands them over a batch at a time, and an empty batch at the end. */
async function entriesOf(directory: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = directory.createReader();
  const entries: FileSystemEntry[] = [];
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
    if (batch.length === 0) return entries;
    entries.push(...batch);
  }
}

type Limit = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Runs at most `max` tasks at once, the rest in the order they were asked for. Once a task fails, none that has not begun
 * is begun: each fails with the first failure, which is the one its caller is already being told.
 */
function limitTo(max: number): Limit {
  let running = 0;
  let failed: { error: unknown } | null = null;
  const waiting: (() => void)[] = [];
  return async (task) => {
    // A task that finishes hands its place to the next one waiting, so `running` is not counted down and up again.
    if (running < max) running++;
    else await new Promise<void>((resolve) => waiting.push(resolve));
    try {
      if (failed) throw failed.error;
      return await task();
    } catch (error) {
      failed ??= { error };
      throw error;
    } finally {
      const next = waiting.shift();
      if (next) next();
      else running--;
    }
  };
}

/**
 * The files under an entry, in the order the directories list them. A place is held for one file's read or one
 * directory's listing and never across a directory's children, so a deep folder cannot use every place up waiting on itself.
 */
async function walk(entry: FileSystemEntry, path: string, limit: Limit): Promise<PickedFile[]> {
  if (entry.isFile) {
    return [{ path, file: await limit(() => new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject))) }];
  }
  const children = await limit(() => entriesOf(entry as FileSystemDirectoryEntry));
  return (await Promise.all(children.map((child) => walk(child, path ? `${path}/${child.name}` : child.name, limit)))).flat();
}

// Files an operating system writes into every folder it shows. Uploaded, one would land in each dossier.
const OS_FILES: ReadonlySet<string> = new Set(['.ds_store', 'thumbs.db', 'desktop.ini']);
const isOsFile = (path: string) => OS_FILES.has(path.slice(path.lastIndexOf('/') + 1).toLowerCase());

async function folderFiles(files: File[] | FileSystemEntry[]): Promise<PickedFile[]> {
  const limit = limitTo(READS_IN_FLIGHT);
  const found = await Promise.all(
    files.map(async (item): Promise<PickedFile[]> => {
      if ('isDirectory' in item) return walk(item, files.length === 1 && item.isDirectory ? '' : item.name, limit);
      // `webkitRelativePath` starts with the picked folder's own name; a file picked on its own has none.
      const below = item.webkitRelativePath.indexOf('/');
      return [{ path: below < 0 ? item.name : item.webkitRelativePath.slice(below + 1), file: item }];
    }),
  );
  return found.flat().filter(({ path }) => !isOsFile(path));
}

function plainFiles(files: File[]): PickedFile[] {
  const taken = new Set(files.map((file) => file.name));
  const seen = new Set<string>();
  return files.map((file) => {
    let name = file.name;
    if (seen.has(name)) {
      const dot = name.lastIndexOf('.');
      const [stem, extension] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
      for (let n = 2; taken.has(name); n++) name = `${stem} (${n})${extension}`;
      taken.add(name);
    }
    seen.add(name);
    return { path: `files/${name}`, file };
  });
}

/** Sources of the folders a launch can take: the organization's watched folders, and folders or files from the person's computer. */
export function folderSources(client: AgentFlowClient): FolderSources {
  async function deleteSet(setId: string): Promise<void> {
    await ok(client.DELETE('/upload-sets/{file_set_id}', { params: { path: { file_set_id: setId } } }));
  }

  /** The declared files of the set being resumed, or null when it is not the set these files would declare. */
  async function resumable(setId: string, picked: Map<string, File>, signal?: AbortSignal): Promise<Schemas['UploadSetFile'][] | null> {
    const declared: Schemas['UploadSetFile'][] = [];
    try {
      const pages = paginate((cursor) =>
        ok(client.GET('/upload-sets/{file_set_id}/files', { params: { path: { file_set_id: setId }, query: { cursor, limit: LIST_PAGE } }, signal })),
      );
      for await (const file of pages) declared.push(file);
    } catch (error) {
      if (error instanceof AgentFlowError && error.status === 404) return null;
      throw error;
    }
    if (declared.length === picked.size && declared.every((file) => picked.get(file.path)?.size === file.byte_size)) return declared;
    // A set that differs can never be completed with these files, and it holds one of the person's few unfinished sets.
    // One the server will not delete is left: the new upload does not depend on it.
    await deleteSet(setId).catch((error: unknown) => {
      if (!(error instanceof AgentFlowError)) throw error;
    });
    return null;
  }

  async function upload(files: PickedFile[], opts: UploadOptions): Promise<UploadResult> {
    const { signal } = opts;
    signal?.throwIfAborted();
    const picked = new Map(files.map(({ path, file }) => [path, file]));
    const resumed = opts.resumeSetId ? await resumable(opts.resumeSetId, picked, signal) : null;

    let setId: string;
    let refused: RefusedFile[];
    let stored: number;
    let missing: string[];
    if (resumed) {
      setId = opts.resumeSetId!;
      refused = resumed.flatMap((file) => (file.refused_reason ? [{ path: file.path, reason: file.refused_reason }] : []));
      stored = resumed.filter((file) => file.stored).length;
      missing = resumed.filter((file) => !file.stored && !file.refused_reason).map((file) => file.path);
    } else {
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
      if (!resumed) opts.onSetCreated?.(setId);
      opts.onProgress?.({ stored, total });

      let next = 0;
      let failed = false;
      const worker = async () => {
        while (!failed && !signal?.aborted && next < missing.length) {
          const path = missing[next++];
          const form = new FormData();
          // The server checks the path before it reads the file, so the path is sent first.
          form.append('path', path);
          form.append('file', picked.get(path)!);
          try {
            await ok(
              client.POST('/upload-sets/{file_set_id}/files', {
                params: { path: { file_set_id: setId } },
                body: form as unknown as Schemas['UploadSetFileUpload'],
                signal,
              }),
            );
          } catch (error) {
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
      if (failure) throw failure.reason;
      signal?.throwIfAborted();

      await ok(client.POST('/upload-sets/{file_set_id}/complete', { params: { path: { file_set_id: setId } }, signal }));
    } catch (error) {
      if (!resumed && signal?.aborted) await deleteSet(setId).catch(() => undefined);
      throw error;
    }
    return { value: fileSetEnvelope(setId), refused };
  }

  return {
    async watched() {
      return (await ok(client.GET('/watched-folders'))).items;
    },
    subfolders(setId, path, cursor) {
      return ok(
        client.GET('/watched-folders/{file_set_id}/subfolders', {
          params: { path: { file_set_id: setId }, query: { path, cursor: cursor ?? undefined } },
        }),
      );
    },
    preview(workflowId, field, value, versionId) {
      return ok(
        client.POST('/workflows/{workflow_id}/folder-preview', {
          params: { path: { workflow_id: workflowId } },
          body: { field, file_set_id: value.$fileSet, path: value.path, version_id: versionId },
        }),
      );
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
