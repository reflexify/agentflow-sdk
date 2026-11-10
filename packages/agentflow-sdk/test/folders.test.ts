import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { bearerAdapter, createAgentFlowClient, fileSetEnvelope, folderSources } from '../src/index.js';
import type { FolderSources, components } from '../src/index.js';
import { startMockApi } from './support/mock-api.js';
import type { MockApi } from './support/mock-api.js';

type Schemas = components['schemas'];

const WORKFLOW = '0190f5a0-0000-7000-8000-0000000000d1';
const VERSION = '0190f5a0-0000-7000-8000-0000000000d2';
const WATCHED = '0190f5a0-0000-7000-8000-0000000000d3';
const PAGE = 2;
const MAX_FILE_BYTES = 100;

interface StoredSet {
  name: string;
  complete: boolean;
  files: Schemas['UploadSetFile'][];
}

/** The upload-set operations as the API answers them, over sets held in memory. */
function uploadSetApi() {
  const sets = new Map<string, StoredSet>();
  /** Every call in arrival order: `declare`, `upload <path>`, `list`, `complete`, `delete <id>`, and the others by route. */
  const calls: string[] = [];
  const bodies: unknown[] = [];
  let partOrder: string[] = [];

  const problem = (status: number, type: string) =>
    new Response(JSON.stringify({ type, title: type, status }), { status, headers: { 'content-type': 'application/problem+json' } });
  const view = (id: string, set: StoredSet): Schemas['UploadSet'] => ({
    id,
    name: set.name,
    complete: set.complete,
    file_count: set.files.length,
    stored_count: set.files.filter((f) => f.stored).length,
    refused: set.files.flatMap((f) => (f.refused_reason ? [{ path: f.path, reason: f.refused_reason }] : [])),
  });
  const byPath = (a: { path: string }, b: { path: string }) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

  function seed(files: { path: string; byte_size: number; stored?: boolean }[]): string {
    const id = crypto.randomUUID();
    sets.set(id, {
      name: 'seeded',
      complete: false,
      files: files.map((f) => ({ path: f.path, byte_size: f.byte_size, stored: f.stored ?? false, refused_reason: null })).sort(byPath),
    });
    return id;
  }

  async function respond(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/v1', '');
    const route = `${request.method} ${path}`;
    const [, id, tail] = /^\/upload-sets\/([^/]+)(\/.*)?$/.exec(path) ?? [];
    const set = id ? sets.get(id) : undefined;

    if (route === 'POST /upload-sets') {
      calls.push('declare');
      const body = (await request.json()) as Schemas['CreateUploadSetRequest'];
      const created: StoredSet = {
        name: body.name,
        complete: false,
        files: body.files
          .map((f) => ({ ...f, stored: false, refused_reason: f.byte_size > MAX_FILE_BYTES ? 'FILE_TOO_LARGE' : null }))
          .sort(byPath),
      };
      const newId = crypto.randomUUID();
      sets.set(newId, created);
      return Response.json(view(newId, created), { status: 201 });
    }
    if (id && !set) return problem(404, 'NOT_FOUND');
    if (set && request.method === 'POST' && tail === '/files') {
      const form = await request.formData();
      partOrder = [...form.keys()];
      const file = form.get('file');
      const entry = set.files.find((f) => f.path === form.get('path'));
      calls.push(`upload ${String(form.get('path'))}`);
      if (!(file instanceof File) || !entry || entry.refused_reason || entry.byte_size !== file.size) return problem(400, 'VALIDATION_ERROR');
      if (set.complete) return problem(409, 'CONFLICT');
      if (entry.stored) return Response.json(entry);
      entry.stored = true;
      return Response.json(entry, { status: 201 });
    }
    if (set && request.method === 'GET' && tail === '/files') {
      calls.push('list');
      const after = url.searchParams.get('cursor');
      const rest = set.files.filter((f) => after === null || f.path > after);
      const items = rest.slice(0, PAGE);
      return Response.json({ items, next_cursor: rest.length > PAGE ? items[PAGE - 1].path : null, prev_cursor: null });
    }
    if (set && request.method === 'POST' && tail === '/complete') {
      calls.push('complete');
      if (set.files.some((f) => !f.stored && !f.refused_reason)) return problem(409, 'CONFLICT');
      set.complete = true;
      return Response.json(view(id, set));
    }
    if (set && request.method === 'DELETE' && !tail) {
      calls.push(`delete ${id}`);
      sets.delete(id);
      return new Response(null, { status: 204 });
    }

    calls.push(`${route}${url.search}`);
    if (request.method === 'POST') bodies.push(await request.json());
    if (path === '/watched-folders') {
      return Response.json({ items: [{ id: WATCHED, name: 'Scans', source: 'sftp', status: 'open', entry_count: 3, last_scan_at: null }] });
    }
    if (path.endsWith('/subfolders')) {
      return Response.json({ items: [{ name: 'PN-001', path: 'batch/PN-001', file_count: 2, settled_count: 2 }], next_cursor: 'n2', prev_cursor: null });
    }
    return Response.json({
      field: 'scans',
      grain: 'folder',
      depth: 1,
      group_count: 1,
      item_count: 2,
      excluded_count: 0,
      excluded_by_reason: {},
      loose_file_count: 0,
      sample_keys: ['PN-001'],
      refusal: null,
    });
  }

  return { sets, calls, bodies, seed, respond, partOrder: () => partOrder };
}

const bytes = (size: number) => new Uint8Array(size);

/** A file as a folder input hands it over: named, with its path from the picked folder's parent. */
function picked(relativePath: string, size = 3): File {
  const file = new File([bytes(size)], relativePath.split('/').pop()!);
  Object.defineProperty(file, 'webkitRelativePath', { value: relativePath });
  return file;
}

/** `read`, when given, stands in for the browser's own read, so a test can hold a file open and count the reads. */
function fileEntry(name: string, size = 3, read: (hand: () => void, fail: (error: unknown) => void) => void = (hand) => hand()): FileSystemEntry {
  const entry = {
    isFile: true,
    isDirectory: false,
    name,
    file: (done: (file: File) => void, fail: (error: unknown) => void) => read(() => done(new File([bytes(size)], name)), fail),
  };
  return entry as unknown as FileSystemEntry;
}

/** A dropped directory, read as a browser reads one: a batch at a time, and an empty batch at the end. */
function dirEntry(name: string, children: FileSystemEntry[]): FileSystemEntry {
  const entry = {
    isFile: false,
    isDirectory: true,
    name,
    createReader() {
      let at = 0;
      return {
        readEntries(done: (batch: FileSystemEntry[]) => void) {
          const batch = children.slice(at, at + 2);
          at += batch.length;
          done(batch);
        },
      };
    },
  };
  return entry as unknown as FileSystemEntry;
}

describe('folder sources', () => {
  let api: MockApi;
  let server: ReturnType<typeof uploadSetApi>;
  let sources: FolderSources;
  /** The most file uploads the client had unanswered at once. */
  let mostInFlight: number;

  const paths = (id: string) => server.sets.get(id)!.files.map((f) => f.path);
  const uploads = () =>
    server.calls
      .filter((call) => call.startsWith('upload '))
      .map((call) => call.slice('upload '.length))
      .sort();

  beforeAll(async () => {
    api = await startMockApi();
  });
  afterAll(() => api.close());

  beforeEach(() => {
    server = uploadSetApi();
    api.respond = server.respond;
    api.requests.length = 0;
    mostInFlight = 0;
    let inFlight = 0;
    const client = createAgentFlowClient({
      baseUrl: `${api.baseUrl}/api/v1`,
      auth: bearerAdapter(async () => 't'),
      fetch: async (request) => {
        const upload = request.method === 'POST' && request.url.endsWith('/files');
        if (!upload) return fetch(request);
        mostInFlight = Math.max(mostInFlight, ++inFlight);
        try {
          return await fetch(request);
        } finally {
          inFlight--;
        }
      },
    });
    sources = folderSources(client);
  });

  it('rebuilds relative paths from a picked or dropped folder', async () => {
    // What the operating system keeps in each folder for itself is not the person's, in a picked folder or a dropped one.
    const fromPicker = await sources.uploadFolder(
      [picked('batch/.DS_Store'), picked('batch/PN-001/scan.pdf'), picked('batch/PN-001/Thumbs.db'), picked('batch/PN-002/a/b.pdf'), picked('batch/loose.pdf')],
      { name: 'batch' },
    );
    expect(paths(fromPicker.value.$fileSet)).toEqual(['PN-001/scan.pdf', 'PN-002/a/b.pdf', 'loose.pdf']);

    const dropped = dirEntry('batch', [
      dirEntry('PN-001', [fileEntry('scan.pdf'), fileEntry('form.pdf'), fileEntry('Desktop.ini'), fileEntry('id.pdf')]),
      dirEntry('PN-002', [dirEntry('a', [fileEntry('b.pdf'), fileEntry('.ds_store')])]),
      fileEntry('loose.pdf'),
      fileEntry('THUMBS.DB'),
    ]);
    const fromDrop = await sources.uploadFolder([dropped], { name: 'batch' });
    expect(paths(fromDrop.value.$fileSet)).toEqual(['PN-001/form.pdf', 'PN-001/id.pdf', 'PN-001/scan.pdf', 'PN-002/a/b.pdf', 'loose.pdf']);

    // Several things dropped together have no one folder whose name to drop, so each keeps its own.
    const several = await sources.uploadFolder([dirEntry('PN-001', [fileEntry('scan.pdf')]), dirEntry('PN-002', [fileEntry('scan.pdf')])], {
      name: 'two',
    });
    expect(paths(several.value.$fileSet)).toEqual(['PN-001/scan.pdf', 'PN-002/scan.pdf']);
  });

  it("reads a dropped folder's files a few at a time", async () => {
    let reading = 0;
    let mostReading = 0;
    // A read that answers a turn later, as a browser's does, so the reads the walk has out at once can be counted.
    const slow = (name: string) =>
      fileEntry(name, 3, (hand) => {
        mostReading = Math.max(mostReading, ++reading);
        setTimeout(() => {
          reading--;
          hand();
        }, 0);
      });
    const names = Array.from({ length: 12 }, (_, i) => `f${String(i).padStart(2, '0')}.pdf`);
    const dropped = dirEntry('batch', [dirEntry('PN-001', names.map(slow)), dirEntry('PN-002', [dirEntry('a', names.map(slow))]), slow('loose.pdf')]);

    const result = await sources.uploadFolder([dropped], { name: 'batch' });

    expect(mostReading).toBe(8);
    expect(paths(result.value.$fileSet)).toEqual([...names.map((name) => `PN-001/${name}`), ...names.map((name) => `PN-002/a/${name}`), 'loose.pdf']);
  });

  it('starts no further read once one has failed', async () => {
    let started = 0;
    const unreadable = new Error('NotReadableError');
    const names = Array.from({ length: 30 }, (_, i) => `f${i}.pdf`);
    const failing = names.map((name, i) =>
      fileEntry(name, 3, (hand, fail) => {
        started++;
        setTimeout(() => (i === 0 ? fail(unreadable) : hand()), 0);
      }),
    );

    await expect(sources.uploadFolder([dirEntry('batch', failing)], { name: 'batch' })).rejects.toBe(unreadable);
    // The reads already out when the first one failed finish; the rest of the folder is never asked for.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(started).toBe(8);
    expect(server.calls).toEqual([]);
  });

  it('declares, announces the set, uploads and completes', async () => {
    // A file with nothing in it is a file of the folder like any other.
    const files = [...['a', 'b', 'c', 'd', 'e', 'f'].map((name) => picked(`batch/${name}.pdf`)), picked('batch/empty.pdf', 0)];
    const events: string[] = [];
    const progress: { stored: number; total: number }[] = [];

    const result = await sources.uploadFolder(files, {
      name: 'batch',
      onSetCreated: (id) => events.push(`created ${id} after ${server.calls.join(',')}`),
      onProgress: (p) => progress.push(p),
    });

    const id = result.value.$fileSet;
    expect(result).toEqual({ value: { $fileSet: id }, refused: [] });
    expect(events).toEqual([`created ${id} after declare`]);
    expect(api.requests.find((r) => r.method === 'POST' && r.path === '/api/v1/upload-sets')?.idempotencyKey).toBeTruthy();
    expect(server.partOrder()).toEqual(['path', 'file']);
    expect(uploads()).toEqual(['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf', 'e.pdf', 'empty.pdf', 'f.pdf']);
    expect(mostInFlight).toBe(4);
    expect(progress).toEqual([0, 1, 2, 3, 4, 5, 6, 7].map((stored) => ({ stored, total: 7 })));
    expect(server.calls.at(-1)).toBe('complete');
    expect(server.sets.get(id)).toMatchObject({ name: 'batch', complete: true });
    expect(server.sets.get(id)!.files.find((f) => f.path === 'empty.pdf')).toMatchObject({ byte_size: 0, stored: true });
  });

  it('resumes a set by uploading only the missing paths', async () => {
    const id = server.seed([
      { path: 'PN-001/a.pdf', byte_size: 3, stored: true },
      { path: 'PN-001/b.pdf', byte_size: 4 },
      { path: 'PN-002/c.pdf', byte_size: 5, stored: true },
      { path: 'PN-002/d.pdf', byte_size: 6 },
      { path: 'PN-003/e.pdf', byte_size: 7, stored: true },
      // A backslash is a character of a name, not a separator: the path is matched and sent as it was declared.
      { path: 'PN-003/a\\b.pdf', byte_size: 8 },
    ]);
    const files = [
      picked('batch/PN-001/a.pdf', 3),
      picked('batch/PN-001/b.pdf', 4),
      picked('batch/PN-002/c.pdf', 5),
      picked('batch/PN-002/d.pdf', 6),
      picked('batch/PN-003/e.pdf', 7),
      picked('batch/PN-003/a\\b.pdf', 8),
    ];
    const created: string[] = [];
    const progress: { stored: number; total: number }[] = [];

    const result = await sources.uploadFolder(files, {
      name: 'batch',
      resumeSetId: id,
      onSetCreated: (set) => created.push(set),
      onProgress: (p) => progress.push(p),
    });

    expect(result).toEqual({ value: { $fileSet: id }, refused: [] });
    expect(created).toEqual([]);
    expect(server.calls).not.toContain('declare');
    expect(uploads()).toEqual(['PN-001/b.pdf', 'PN-002/d.pdf', 'PN-003/a\\b.pdf']);
    expect(progress).toEqual([
      { stored: 3, total: 6 },
      { stored: 4, total: 6 },
      { stored: 5, total: 6 },
      { stored: 6, total: 6 },
    ]);
    expect(server.sets.get(id)?.complete).toBe(true);
  });

  it('starts a new set when the re-picked folder differs from the one it was resuming', async () => {
    const mismatches: { name: string; declared: { path: string; byte_size: number }[] }[] = [
      { name: 'a size', declared: [{ path: 'a.pdf', byte_size: 3 }, { path: 'b.pdf', byte_size: 9 }] },
      { name: 'a path', declared: [{ path: 'a.pdf', byte_size: 3 }, { path: 'z.pdf', byte_size: 3 }] },
      { name: 'one more file', declared: [{ path: 'a.pdf', byte_size: 3 }, { path: 'b.pdf', byte_size: 3 }, { path: 'c.pdf', byte_size: 3 }] },
    ];
    for (const { name, declared } of mismatches) {
      const old = server.seed(declared.map((f) => ({ ...f, stored: f.path === 'a.pdf' })));
      const created: string[] = [];

      const result = await sources.uploadFolder([picked('batch/a.pdf'), picked('batch/b.pdf')], {
        name: 'batch',
        resumeSetId: old,
        onSetCreated: (id) => created.push(id),
      });

      const id = result.value.$fileSet;
      expect(id, name).not.toBe(old);
      expect(created, name).toEqual([id]);
      expect(server.sets.has(old), name).toBe(false);
      expect(server.sets.get(id), name).toMatchObject({ complete: true, files: [{ path: 'a.pdf', stored: true }, { path: 'b.pdf', stored: true }] });
    }

    // A set that is already gone is nothing to resume, and nothing to delete.
    const gone = crypto.randomUUID();
    const result = await sources.uploadFolder([picked('batch/a.pdf')], { name: 'batch', resumeSetId: gone });
    expect(server.sets.get(result.value.$fileSet)?.complete).toBe(true);
    expect(server.calls).not.toContain(`delete ${gone}`);
  });

  it('puts plain files under one folder', async () => {
    const named = (name: string) => new File([bytes(3)], name);

    const result = await sources.uploadFiles([named('scan.pdf'), named('scan.pdf'), named('scan (2).pdf'), named('notes'), named('notes')], {
      name: 'Files',
    });

    expect(result.value).toEqual({ $fileSet: result.value.$fileSet });
    expect(paths(result.value.$fileSet)).toEqual(['files/notes', 'files/notes (2)', 'files/scan (2).pdf', 'files/scan (3).pdf', 'files/scan.pdf']);
    expect(server.sets.get(result.value.$fileSet)?.complete).toBe(true);
  });

  it('reports declared files the server refused', async () => {
    const result = await sources.uploadFolder([picked('batch/small.pdf'), picked('batch/huge.pdf', MAX_FILE_BYTES + 1)], { name: 'batch' });

    expect(result.refused).toEqual([{ path: 'huge.pdf', reason: 'FILE_TOO_LARGE' }]);
    expect(uploads()).toEqual(['small.pdf']);
    expect(server.sets.get(result.value.$fileSet)?.complete).toBe(true);

    // Resuming tells them again, from the set's own list.
    const id = server.seed([{ path: 'small.pdf', byte_size: 3 }]);
    server.sets.get(id)!.files.push({ path: 'x-huge.pdf', byte_size: 500, stored: false, refused_reason: 'FILE_TOO_LARGE' });
    const resumed = await sources.uploadFolder([picked('batch/small.pdf'), picked('batch/x-huge.pdf', 500)], { name: 'batch', resumeSetId: id });
    expect(resumed).toEqual({ value: { $fileSet: id }, refused: [{ path: 'x-huge.pdf', reason: 'FILE_TOO_LARGE' }] });
  });

  it('deletes the set it created when the upload is aborted, and leaves one it was resuming', async () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f'].map((name) => picked(`batch/${name}.pdf`));
    const abort = new AbortController();
    let created = '';

    const upload = sources.uploadFolder(files, {
      name: 'batch',
      signal: abort.signal,
      onSetCreated: (id) => {
        created = id;
      },
      onProgress: ({ stored }) => {
        if (stored === 1) abort.abort();
      },
    });

    await expect(upload).rejects.toMatchObject({ name: 'AbortError' });
    expect(server.calls).toContain(`delete ${created}`);
    expect(server.calls).not.toContain('complete');

    const resumed = server.seed(files.map((file) => ({ path: file.name, byte_size: file.size })));
    const again = new AbortController();
    await expect(
      sources.uploadFolder(files, {
        name: 'batch',
        resumeSetId: resumed,
        signal: again.signal,
        onProgress: ({ stored }) => {
          if (stored === 1) again.abort();
        },
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(server.sets.has(resumed)).toBe(true);
  });

  it('leaves the set for resume when an upload fails for another reason than an abort', async () => {
    let failing = true;
    api.respond = (request) => {
      if (failing && request.method === 'POST' && request.url.endsWith('/files')) {
        failing = false;
        server.calls.push('upload refused');
        return new Response(JSON.stringify({ type: 'INTERNAL', title: 'INTERNAL', status: 500 }), {
          status: 500,
          headers: { 'content-type': 'application/problem+json' },
        });
      }
      return server.respond(request);
    };
    // The first upload is the one refused. The others asked for with it are sent only once the client has its answer, so
    // any upload after those four would be one begun in spite of the failure.
    let refusalRead!: () => void;
    const refused = new Promise<void>((resolve) => (refusalRead = resolve));
    let first = true;
    const client = createAgentFlowClient({
      baseUrl: `${api.baseUrl}/api/v1`,
      auth: bearerAdapter(async () => 't'),
      fetch: async (request) => {
        if (!(request.method === 'POST' && request.url.endsWith('/files'))) return fetch(request);
        if (!first) {
          await refused;
          return fetch(request);
        }
        first = false;
        const response = await fetch(request);
        const body = await response.text();
        refusalRead();
        return new Response(body, { status: response.status, headers: response.headers });
      },
    });
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((name) => picked(`batch/${name}.pdf`));
    let created = '';

    const upload = folderSources(client).uploadFolder(files, {
      name: 'batch',
      onSetCreated: (id) => {
        created = id;
      },
    });

    await expect(upload).rejects.toMatchObject({ name: 'AgentFlowError', status: 500 });
    expect(server.calls.filter((call) => call.startsWith('upload '))).toHaveLength(4);
    expect(server.calls).not.toContain('complete');
    expect(server.calls).not.toContain(`delete ${created}`);
    expect(server.sets.get(created)).toMatchObject({ complete: false });

    // The same folder picked again finishes the set, sending only what it still lacks.
    server.calls.length = 0;
    const resumed = await sources.uploadFolder(files, { name: 'batch', resumeSetId: created });
    expect(resumed.value).toEqual({ $fileSet: created });
    expect(uploads()).toHaveLength(5);
    expect(server.sets.get(created)).toMatchObject({ complete: true });
  });

  it('lists watched folders, browses one and previews a launch', async () => {
    expect((await sources.watched()).map((folder) => folder.id)).toEqual([WATCHED]);

    const page = await sources.subfolders(WATCHED, 'batch', 'n1');
    expect(page).toMatchObject({ items: [{ path: 'batch/PN-001' }], next_cursor: 'n2' });
    await sources.subfolders(WATCHED);

    await sources.preview(WORKFLOW, 'scans', fileSetEnvelope(WATCHED, 'batch'), VERSION);
    const preview = await sources.preview(WORKFLOW, 'scans', fileSetEnvelope(WATCHED));
    expect(preview.group_count).toBe(1);

    expect(server.calls).toEqual([
      'GET /watched-folders',
      `GET /watched-folders/${WATCHED}/subfolders?path=batch&cursor=n1`,
      `GET /watched-folders/${WATCHED}/subfolders`,
      `POST /workflows/${WORKFLOW}/folder-preview`,
      `POST /workflows/${WORKFLOW}/folder-preview`,
    ]);
    expect(server.bodies).toEqual([
      { field: 'scans', file_set_id: WATCHED, path: 'batch', version_id: VERSION },
      { field: 'scans', file_set_id: WATCHED },
    ]);

    await sources.deleteSet(server.seed([{ path: 'a.pdf', byte_size: 3 }]));
    expect(server.sets.size).toBe(0);
  });
});
