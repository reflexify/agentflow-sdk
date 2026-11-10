import { describe, expect, it, vi, type Mock } from 'vitest';
import type { FileSetEnvelope, FolderPreview, FolderSources, SlotFolder, Subfolder, UploadOptions, UploadResult, WatchedFolder } from '@reflexify/agentflow-sdk';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentListeners } from '../support.js';

type SourceEl = HTMLElement & { sources: FolderSources; workflow: string; field: string; version?: string; folder: SlotFolder; locale?: string; offer?: string[] | null };

const WATCHED: WatchedFolder[] = [
  { id: 'ws1', name: 'Court scans', source: 'sftp', status: 'open', entry_count: 1234, last_scan_at: '2026-11-09T02:00:00Z' },
  { id: 'ws2', name: 'Archive', source: 'sftp', status: 'open', entry_count: 8, last_scan_at: null },
];
const sub = (path: string, files = 4): Subfolder => ({ name: path.split('/').pop()!, path, file_count: files, settled_count: files });
const PREVIEW: FolderPreview = {
  field: 'files', grain: 'folder', depth: 1, group_count: 12, item_count: 1340, sample_keys: ['HS-481', 'HS-482'],
  loose_file_count: 0, excluded_count: 0, excluded_by_reason: {}, refusal: null,
};

type Stub = { [K in keyof FolderSources]: Mock<FolderSources[K]> };
function stubSources(over: Partial<Stub> = {}): Stub {
  return {
    watched: vi.fn<FolderSources['watched']>(async () => WATCHED),
    subfolders: vi.fn<FolderSources['subfolders']>(async (_set, path, cursor) => {
      if (path === 'batch-11') return { items: [sub('batch-11/north'), sub('batch-11/south')], next_cursor: null };
      if (path) return { items: [], next_cursor: null };
      return cursor ? { items: [sub('batch-12')], next_cursor: null } : { items: [sub('batch-10'), sub('batch-11', 40)], next_cursor: 'c2' };
    }),
    preview: vi.fn<FolderSources['preview']>(async () => PREVIEW),
    uploadFolder: vi.fn<FolderSources['uploadFolder']>(async (_files, opts) => {
      opts.onSetCreated?.('set-1');
      return { value: { $fileSet: 'set-1' }, refused: [] };
    }),
    uploadFiles: vi.fn<FolderSources['uploadFiles']>(async (_files, opts) => {
      opts.onSetCreated?.('set-f');
      return { value: { $fileSet: 'set-f' }, refused: [] };
    }),
    deleteSet: vi.fn<FolderSources['deleteSet']>(async () => {}),
    ...over,
  };
}

async function mount(sources: FolderSources, attributes: Record<string, string> = {}, folder: SlotFolder = { grain: 'folder', depth: 1 }) {
  document.body.innerHTML = '';
  const el = document.createElement('af-folder-source') as SourceEl;
  for (const [name, value] of Object.entries({ workflow: 'wf1', field: 'files', ...attributes })) el.setAttribute(name, value);
  el.sources = sources;
  el.folder = folder;
  document.body.append(el);
  await settle();
  return el;
}
const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const parts = (el: Element, name: string) => [...shadow(el).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const texts = (el: Element, name: string) => parts(el, name).map((p) => p.textContent!.replace(/\s+/g, ' ').trim());
function heard<T = unknown>(el: HTMLElement, type: string) {
  const seen: T[] = [];
  el.addEventListener(type, (e) => seen.push((e as CustomEvent<T>).detail));
  return seen;
}
async function choose(el: Element, source: 'files' | 'computer' | 'watched') {
  const radio = shadow(el).querySelector<HTMLInputElement>(`[part~="source"] input[value="${source}"]`)!;
  radio.click();
  await settle();
}
const picker = (el: Element) => shadow(el).querySelector<HTMLInputElement>('input[type="file"]')!;
async function pick(el: Element, files: File[]) {
  const input = picker(el);
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await settle();
}
function inFolder(path: string) {
  const file = new File(['x'], path.split('/').pop()!);
  Object.defineProperty(file, 'webkitRelativePath', { value: path });
  return file;
}
const row = (el: Element, name: string) => parts(el, 'folder').find((r) => r.querySelector('[part~="choose"]')!.textContent!.includes(name))!;
async function press(target: HTMLElement | null | undefined) {
  target!.click();
  await settle();
}
type Dropped = { isFile: boolean; isDirectory: boolean; name: string; createReader?: () => { readEntries(done: (batch: Dropped[]) => void): void } };
/** A dropped folder as the browser hands it over: its entries a batch at a time, and an empty batch at the end. */
function dir(name: string, children: Dropped[]): Dropped {
  return { isFile: false, isDirectory: true, name, createReader: () => {
    let read = false;
    return { readEntries: (done) => { const batch = read ? [] : children; read = true; done(batch); } };
  } };
}
const fileEntry = (name: string): Dropped => ({ isFile: true, isDirectory: false, name });
async function drop(el: Element, entries: Dropped[]) {
  const dataTransfer = { types: ['Files'], files: [], dropEffect: 'none', items: entries.map((entry) => ({ kind: 'file', webkitGetAsEntry: () => entry, getAsFile: () => new File(['x'], entry.name) })) };
  const events = ['dragenter', 'dragover', 'drop'].map((type) => Object.assign(new Event(type, { bubbles: true, cancelable: true, composed: true }), { dataTransfer }));
  for (const event of events) part(el, 'dropzone')!.dispatchEvent(event);
  await settle();
  return events;
}
const refusedWith = (status: number, detail: string, code = 'VALIDATION_ERROR') => Object.assign(new Error(`${code}: ${detail}`), { status, code, detail });
/** A promise the test settles by hand, so it decides when an upload ends. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => ((resolve = res), (reject = rej)));
  return { promise, resolve, reject };
}

describe('<af-folder-source>', () => {
  it('offers files, a computer folder and a watched folder, and browses into a watched folder', async () => {
    const sources = stubSources();
    const el = await mount(sources);
    const changes = heard<{ value: FileSetEnvelope | null; preview: FolderPreview | null }>(el, 'af-folder-change');
    expect(part(el, 'sources')!.getAttribute('role')).toBe('radiogroup');
    expect(texts(el, 'source')).toEqual(['Files', 'Folder from this computer', 'Watched folder']);

    // A field that takes folders starts on the folder from this computer, whose input picks a directory.
    expect(shadow(el).querySelector<HTMLInputElement>('[part~="source"] input:checked')!.value).toBe('computer');
    expect(picker(el).hasAttribute('webkitdirectory')).toBe(true);
    expect(part(el, 'hint')!.textContent).toBe('Each folder directly inside it is one item.');
    await choose(el, 'files');
    expect(picker(el).hasAttribute('webkitdirectory')).toBe(false);
    expect(picker(el).multiple).toBe(true);
    expect(sources.watched).not.toHaveBeenCalled();

    await choose(el, 'watched');
    expect(sources.watched).toHaveBeenCalledTimes(1);
    expect(texts(el, 'choose')).toEqual(['Court scans 1,234 files', 'Archive 8 files']);
    expect(texts(el, 'crumb')).toEqual(['Watched folders']);

    await press(row(el, 'Court scans').querySelector<HTMLElement>('[part~="open"]'));
    expect(sources.subfolders).toHaveBeenLastCalledWith('ws1', undefined, null);
    expect(texts(el, 'crumb')).toEqual(['Watched folders', 'Court scans']);
    expect(texts(el, 'choose')).toEqual(['batch-10 4 files', 'batch-11 40 files']);
    await press(part(el, 'more'));
    expect(sources.subfolders).toHaveBeenLastCalledWith('ws1', undefined, 'c2');
    expect(texts(el, 'choose')).toEqual(['batch-10 4 files', 'batch-11 40 files', 'batch-12 4 files']);
    expect(part(el, 'more')).toBeNull();

    await press(row(el, 'batch-11').querySelector<HTMLElement>('[part~="open"]'));
    expect(sources.subfolders).toHaveBeenLastCalledWith('ws1', 'batch-11', null);
    expect(texts(el, 'crumb')).toEqual(['Watched folders', 'Court scans', 'batch-11']);
    expect(sources.preview).not.toHaveBeenCalled();

    // Choosing a folder is what yields a value: the watched folder and the path browsed to.
    await press(row(el, 'north').querySelector<HTMLElement>('[part~="choose"]'));
    expect(sources.preview).toHaveBeenLastCalledWith('wf1', 'files', { $fileSet: 'ws1', path: 'batch-11/north' }, undefined);
    expect(changes).toStrictEqual([{ value: { $fileSet: 'ws1', path: 'batch-11/north' }, preview: PREVIEW }]);
    expect(row(el, 'north').querySelector('[part~="choose"]')!.getAttribute('aria-pressed')).toBe('true');
    expect(row(el, 'south').querySelector('[part~="choose"]')!.getAttribute('aria-pressed')).toBe('false');
    expect(part(el, 'chosen')!.textContent).toContain('Court scans / batch-11 / north');

    // A folder with none inside says so, and the way back up is the path. The watched folder itself is a value with no path.
    await press(row(el, 'north').querySelector<HTMLElement>('[part~="open"]'));
    expect(part(el, 'empty')!.textContent).toBe('No folders inside.');
    await press(parts(el, 'crumb')[0]);
    await press(row(el, 'Court scans').querySelector<HTMLElement>('[part~="choose"]'));
    expect(changes.at(-1)).toStrictEqual({ value: { $fileSet: 'ws1' }, preview: PREVIEW });
    expect(sources.watched).toHaveBeenCalledTimes(1);
  });

  it("offers only the sources a page names, and starts on the first of them when the field's own is left out", async () => {
    // A page that takes plain files its own way leaves them out: a field that reads files would otherwise start there.
    const el = await mount(stubSources(), {}, { grain: 'file' });
    expect(shadow(el).querySelector<HTMLInputElement>('[part~="source"] input:checked')!.value).toBe('files');
    el.offer = ['watched', 'computer'];
    await settle();
    // In the element's own order, whatever order the page wrote.
    expect(texts(el, 'source')).toEqual(['Folder from this computer', 'Watched folder']);
    expect(shadow(el).querySelector<HTMLInputElement>('[part~="source"] input:checked')!.value).toBe('computer');
    expect(picker(el).hasAttribute('webkitdirectory')).toBe(true);

    // A list that names no source the element has offers all of them, as no list does.
    el.offer = ['tape'];
    await settle();
    expect(texts(el, 'source')).toEqual(['Files', 'Folder from this computer', 'Watched folder']);
    el.offer = null;
    await settle();
    expect(texts(el, 'source')).toEqual(['Files', 'Folder from this computer', 'Watched folder']);
  });

  it('uploads a picked folder, announcing the set before it completes', async () => {
    const upload = deferred<UploadResult>();
    let given: UploadOptions | undefined;
    const sources = stubSources({
      uploadFolder: vi.fn<FolderSources['uploadFolder']>((_files, opts) => {
        given = opts;
        return upload.promise;
      }),
    });
    const el = await mount(sources, { version: 'v7' });
    const started = heard(el, 'af-folder-upload-started');
    const progress = heard(el, 'af-folder-progress');
    const changes = heard(el, 'af-folder-change');
    const files = [inFolder('batch/HS-481/p1.pdf'), inFolder('batch/HS-481/p2.pdf'), inFolder('batch/HS-482/p1.pdf')];

    await pick(el, files);
    expect(sources.uploadFolder).toHaveBeenCalledTimes(1);
    expect(sources.uploadFolder.mock.calls[0]![0]).toEqual(files);
    expect(given!.name).toBe('batch');
    expect(given!.resumeSetId).toBeUndefined();
    expect(given!.signal).toBeInstanceOf(AbortSignal);

    given!.onSetCreated!('set-9');
    given!.onProgress!({ stored: 1, total: 3 });
    await settle();
    expect(started).toEqual([{ setId: 'set-9' }]);
    expect(progress).toEqual([{ stored: 1, total: 3 }]);
    expect(changes).toEqual([]);
    const bar = part(el, 'progress') as HTMLProgressElement;
    expect([bar.value, bar.max]).toEqual([1, 3]);
    expect(bar.getAttribute('aria-valuetext')).toBe('1 of 3 files uploaded');
    expect(part(el, 'dropzone')!.getAttribute('aria-disabled')).toBe('true');
    expect(sources.preview).not.toHaveBeenCalled();

    upload.resolve({ value: { $fileSet: 'set-9' }, refused: [{ path: 'HS-482/big.tif', reason: 'FILE_TOO_LARGE' }] });
    await settle();
    expect(sources.preview).toHaveBeenCalledWith('wf1', 'files', { $fileSet: 'set-9' }, 'v7');
    expect(changes).toEqual([{ value: { $fileSet: 'set-9' }, preview: PREVIEW }]);
    expect(part(el, 'progress')).toBeNull();
    expect(part(el, 'chosen')!.textContent).toContain('batch');
    expect(part(el, 'preview')!.textContent).toContain('1 file was too large to upload and is left out.');

    // Plain files go through the files upload; picking again withdraws the value until the new one is ready.
    await choose(el, 'files');
    const plain = [new File(['x'], 'a.pdf'), new File(['x'], 'b.pdf')];
    await pick(el, plain);
    expect(sources.uploadFiles.mock.calls[0]![0]).toEqual(plain);
    expect(sources.uploadFiles.mock.calls[0]![1].name).toBe('a.pdf +1');
    expect(changes.slice(1)).toEqual([{ value: null, preview: null }, { value: { $fileSet: 'set-f' }, preview: PREVIEW }]);
    expect(started).toEqual([{ setId: 'set-9' }, { setId: 'set-f' }]);
  });

  it('resumes the set it is given, and announces a new one when the folder differs', async () => {
    const files = [inFolder('batch/HS-481/p1.pdf')];
    // The same folder: the upload continues in the set, which is not announced again.
    const same = stubSources({ uploadFolder: vi.fn<FolderSources['uploadFolder']>(async (_files, opts) => ({ value: { $fileSet: opts.resumeSetId! }, refused: [] })) });
    let el = await mount(same, { 'resume-set': 'set-old' });
    let started = heard(el, 'af-folder-upload-started');
    const changes = heard<{ value: FileSetEnvelope | null }>(el, 'af-folder-change');
    expect(part(el, 'hint')!.textContent).toContain('Choose the same folder to continue the upload that was interrupted.');
    await pick(el, files);
    expect(same.uploadFolder.mock.calls[0]![1].resumeSetId).toBe('set-old');
    expect(started).toEqual([]);
    expect(changes.map((c) => c.value)).toEqual([{ $fileSet: 'set-old' }]);
    // A set that is complete is not resumed by the next pick.
    await pick(el, files);
    expect(same.uploadFolder.mock.calls[1]![1].resumeSetId).toBeUndefined();

    // Another folder: the upload starts a new set, announced as the first was. One that stops is continued by Try again.
    let attempt = 0;
    const other = stubSources({
      uploadFolder: vi.fn<FolderSources['uploadFolder']>(async (_files, opts) => {
        if (attempt++ === 0) {
          opts.onSetCreated?.('set-new');
          throw new Error('offline');
        }
        return { value: { $fileSet: opts.resumeSetId! }, refused: [] };
      }),
    });
    el = await mount(other, { 'resume-set': 'set-old' });
    started = heard(el, 'af-folder-upload-started');
    await pick(el, files);
    expect(other.uploadFolder.mock.calls[0]![1].resumeSetId).toBe('set-old');
    expect(started).toEqual([{ setId: 'set-new' }]);
    expect(part(el, 'notice')!.textContent).toContain('The upload stopped. Try again to continue where it left off.');
    expect(other.preview).not.toHaveBeenCalled();

    await press(part(el, 'retry'));
    expect(other.uploadFolder.mock.calls[1]![0]).toEqual(files);
    expect(other.uploadFolder.mock.calls[1]![1].resumeSetId).toBe('set-new');
    expect(other.preview).toHaveBeenCalledWith('wf1', 'files', { $fileSet: 'set-new' }, undefined);
    expect(part(el, 'retry')).toBeNull();

    // Cancel stops the upload through its signal. The set that upload made goes with it, so the next pick resumes nothing.
    const hung = stubSources({
      uploadFolder: vi.fn<FolderSources['uploadFolder']>((_files, opts) => {
        opts.onSetCreated?.('set-hung');
        return new Promise(() => {});
      }),
    });
    el = await mount(hung);
    await pick(el, files);
    await press(part(el, 'cancel'));
    expect(hung.uploadFolder.mock.calls[0]![1].signal!.aborted).toBe(true);
    expect(part(el, 'progress')).toBeNull();
    expect(part(el, 'dropzone')!.hasAttribute('aria-disabled')).toBe(false);
    await pick(el, files);
    expect(hung.uploadFolder.mock.calls[1]![1].resumeSetId).toBeUndefined();

    // An upload does not outlive the element.
    el.remove();
    await settle();
    expect(hung.uploadFolder.mock.calls[1]![1].signal!.aborted).toBe(true);
  });

  it("shows a refusal no retry can pass as one, with nothing to try again, and hands the page the server's words", async () => {
    const REFUSED = 'This was refused, and trying again will not change that.';
    const files = [inFolder('batch/HS-481/p1.pdf')];
    const sources = stubSources();
    let el = await mount(sources);
    const errors = heard(el, 'af-folder-error');
    const changes = heard(el, 'af-folder-change');

    // Refused before a set exists: nothing to delete, nothing to resume.
    sources.uploadFolder.mockRejectedValueOnce(refusedWith(422, 'You already have 5 unfinished upload sets; finish or delete one first.'));
    await pick(el, files);
    expect(part(el, 'notice')!.textContent).toBe(REFUSED);
    expect(part(el, 'retry')).toBeNull();
    expect(sources.deleteSet).not.toHaveBeenCalled();
    expect(errors).toEqual([{ during: 'upload', status: 422, code: 'VALIDATION_ERROR', message: 'You already have 5 unfinished upload sets; finish or delete one first.' }]);

    // Refused after this upload made a set: the set can never complete, so it is deleted and never offered again.
    sources.uploadFolder.mockImplementationOnce(async (_files, opts) => {
      opts.onSetCreated?.('set-x');
      throw refusedWith(413, 'A file is larger than the server stores.');
    });
    await pick(el, files);
    expect(sources.deleteSet).toHaveBeenCalledWith('set-x');
    expect(part(el, 'retry')).toBeNull();
    await pick(el, files);
    expect(sources.uploadFolder.mock.lastCall![1].resumeSetId).toBeUndefined();

    // One a retry can pass keeps its offer, and the page hears it too, with no status.
    sources.uploadFolder.mockRejectedValueOnce(new Error('offline'));
    await pick(el, files);
    expect(part(el, 'retry')).not.toBeNull();
    expect(errors.at(-1)).toEqual({ during: 'upload', status: null, code: null, message: 'offline' });
    // A busy server is not a refusal.
    sources.uploadFolder.mockRejectedValueOnce(refusedWith(429, 'Slow down.'));
    await pick(el, files);
    expect(part(el, 'retry')).not.toBeNull();

    // The same for the check of the launch: the value stands, without a preview and without a retry.
    sources.preview.mockRejectedValueOnce(refusedWith(404, 'The workflow has no field files.', 'NOT_FOUND'));
    await choose(el, 'watched');
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(part(el, 'notice')!.textContent).toBe(REFUSED);
    expect(part(el, 'retry')).toBeNull();
    expect(changes.at(-1)).toEqual({ value: { $fileSet: 'ws2' }, preview: null });
    expect(errors.at(-1)).toEqual({ during: 'preview', status: 404, code: 'NOT_FOUND', message: 'The workflow has no field files.' });

    // And for the list of folders.
    el = await mount(stubSources({ watched: vi.fn<FolderSources['watched']>(async () => Promise.reject(refusedWith(403, 'You may not use watched folders.'))) }));
    await choose(el, 'watched');
    const alert = shadow(el).querySelector('[role="alert"]')!;
    expect(alert.textContent!.trim()).toBe(REFUSED);
    expect(alert.querySelector('button')).toBeNull();

    // Refused while resuming a set the page named: it is not offered again, and it is not this element's to delete.
    const given = stubSources();
    const resumed = await mount(given, { 'resume-set': 'set-old' });
    given.uploadFolder.mockRejectedValueOnce(refusedWith(409, 'Batch is complete and takes no more files.'));
    await pick(resumed, files);
    expect(given.uploadFolder.mock.lastCall![1].resumeSetId).toBe('set-old');
    expect(part(resumed, 'notice')!.textContent).toBe(REFUSED);
    await pick(resumed, files);
    expect(given.uploadFolder.mock.lastCall![1].resumeSetId).toBeUndefined();
    expect(given.deleteSet).not.toHaveBeenCalled();
  });

  it('keeps focus in the element when an upload ends, fails or is cancelled', async () => {
    const focused = (el: Element) => shadow(el).activeElement;
    let upload = deferred<UploadResult>();
    const sources = stubSources({ uploadFolder: vi.fn<FolderSources['uploadFolder']>(() => upload.promise) });
    const el = await mount(sources);
    const files = [inFolder('batch/HS-481/p1.pdf')];

    await pick(el, files);
    part(el, 'cancel')!.focus();
    upload.reject(new Error('offline'));
    await settle();
    expect(focused(el)).toBe(part(el, 'retry'));

    // Try again puts focus on Cancel, which goes when the upload ends.
    upload = deferred<UploadResult>();
    await press(part(el, 'retry'));
    expect(focused(el)).toBe(part(el, 'cancel'));
    upload.resolve({ value: { $fileSet: 'set-1' }, refused: [] });
    await settle();
    expect(focused(el)).toBe(part(el, 'dropzone'));

    // With the drop zone out of sight, the chosen source takes it.
    upload = deferred<UploadResult>();
    await pick(el, files);
    el.offer = ['watched'];
    await settle();
    part(el, 'cancel')!.focus();
    await press(part(el, 'cancel'));
    expect(focused(el)).toBe(shadow(el).querySelector('[part~="source"] input:checked'));
  });

  it('checks the launch again when its version changes while a check is still out', async () => {
    const first = deferred<FolderPreview>();
    const second = deferred<FolderPreview>();
    const sources = stubSources();
    sources.preview.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const el = await mount(sources, { version: 'v1' });
    const changes = heard(el, 'af-folder-change');
    await choose(el, 'watched');
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    el.version = 'v2';
    await settle();
    expect(sources.preview.mock.calls.map((call) => call[3])).toEqual(['v1', 'v2']);
    const forV2 = { ...PREVIEW, group_count: 3 };
    first.resolve({ ...PREVIEW, refusal: { code: 'UPLOAD_SET_INCOMPLETE', message: 'old' } });
    second.resolve(forV2);
    await settle();
    expect(changes).toEqual([{ value: { $fileSet: 'ws2' }, preview: forV2 }]);
    expect(part(el, 'refusal')).toBeNull();
  });

  it('shows every left-out reason with its count', async () => {
    const preview: FolderPreview = {
      ...PREVIEW, group_count: 1043, item_count: 20860, loose_file_count: 318, excluded_count: 41,
      excluded_by_reason: { NOT_IN_A_FOLDER: 1, NOT_SETTLED: 22, NO_MARKER: 9, TOO_MANY_FILES: 3, BELOW_MIN_ITEMS: 2, ABOVE_MAX_ITEMS: 1, FILE_TOO_LARGE: 2, SOMETHING_NEW: 1 },
    };
    const sources = stubSources({ preview: vi.fn<FolderSources['preview']>(async () => preview) });
    const el = await mount(sources);
    await choose(el, 'watched');
    await press(row(el, 'Court scans').querySelector<HTMLElement>('[part~="choose"]'));
    expect(texts(el, 'count')).toEqual(['Folders 1,043', 'Files 20,860', 'Left out 41']);
    expect(part(el, 'sample')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Starting with HS-481, HS-482');
    // Loose files are one left-out unit however many they are, so their own count is the one shown.
    expect(Object.fromEntries(parts(el, 'reason').map((r) => [r.dataset.code, r.textContent!.replace(/\s+/g, ' ').trim()]))).toEqual({
      NOT_IN_A_FOLDER: 'Files that are in no folder 318',
      NOT_SETTLED: 'Still being copied in, so not ready 22',
      NO_MARKER: 'Not marked as complete yet 9',
      TOO_MANY_FILES: 'Too many files in one folder 3',
      BELOW_MIN_ITEMS: 'Fewer files than this field takes 2',
      ABOVE_MAX_ITEMS: 'More files than this field takes 1',
      FILE_TOO_LARGE: 'Holds a file too large to store 2',
      SOMETHING_NEW: 'Another reason (SOMETHING_NEW) 1',
    });
    expect(part(el, 'refusal')).toBeNull();

    // A refusal is the reason the launch would not start, in the kit's words and the page's language.
    sources.preview.mockResolvedValueOnce({ ...PREVIEW, group_count: 0, item_count: 0, excluded_count: 3, refusal: { code: 'UPLOAD_SET_INCOMPLETE', message: 'upload set is not complete' } });
    el.locale = 'vi';
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(part(el, 'refusal')!.getAttribute('role')).toBe('alert');
    expect(part(el, 'refusal')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Không thể khởi chạy Chưa tải lên xong');
    expect(texts(el, 'count')).toEqual(['Thư mục 0', 'Tệp 0', 'Bị loại ra 3']);
    sources.preview.mockResolvedValueOnce({ ...PREVIEW, group_count: 0, refusal: { code: 'FILE_SET_NO_READY_GROUPS', message: 'none of the 3 folders in `Court scans` can be processed yet: 3 NOT_SETTLED' } });
    await press(row(el, 'Court scans').querySelector<HTMLElement>('[part~="choose"]'));
    expect(part(el, 'refusal')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Không thể khởi chạy Chưa có gì trong đó sẵn sàng để chạy');

    // A preview that cannot be read leaves the value, without one, and offers to check again.
    const changes = heard(el, 'af-folder-change');
    sources.preview.mockRejectedValueOnce(new Error('offline'));
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(changes.at(-1)).toEqual({ value: { $fileSet: 'ws2' }, preview: null });
    expect(part(el, 'notice')!.textContent).toContain('Không kiểm tra được những gì sẽ được chạy.');
    await press(part(el, 'retry'));
    expect(changes.at(-1)).toEqual({ value: { $fileSet: 'ws2' }, preview });
  });

  it('announces progress and the outcome to assistive technology', async () => {
    const upload = deferred<UploadResult>();
    let given: UploadOptions | undefined;
    const sources = stubSources({
      uploadFolder: vi.fn<FolderSources['uploadFolder']>((_files, opts) => {
        given = opts;
        return upload.promise;
      }),
    });
    const el = await mount(sources);
    const notice = part(el, 'notice')!;
    expect([notice.getAttribute('role'), notice.textContent]).toEqual(['status', '']);

    await pick(el, [inFolder('batch/HS-481/p1.pdf')]);
    expect(notice.textContent).toBe('Preparing the upload…');
    // What is only spoken repeats what the eye already has, so it takes no room.
    expect(notice.hasAttribute('data-spoken')).toBe(true);
    // A quarter at a time: a folder of thousands of files is not read out file by file.
    const said = async (stored: number) => {
      given!.onProgress!({ stored, total: 8 });
      await settle();
      return notice.textContent;
    };
    expect(await said(1)).toBe('Preparing the upload…');
    expect(await said(2)).toBe('2 of 8 files uploaded');
    expect(await said(3)).toBe('2 of 8 files uploaded');
    expect(await said(8)).toBe('8 of 8 files uploaded');

    upload.resolve({ value: { $fileSet: 'set-9' }, refused: [{ path: 'HS-482/big.tif', reason: 'FILE_TOO_LARGE' }] });
    await settle();
    expect(notice.textContent).toBe('The upload is complete. What a launch would take: Folders 12, Files 1,340. 1 file was too large to upload and is left out.');
    expect(notice.hasAttribute('data-spoken')).toBe(true);

    // A watched folder's check ends in what it found too. A refusal is an alert, which speaks for itself.
    await choose(el, 'watched');
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(notice.textContent).toBe('What a launch would take: Folders 12, Files 1,340.');
    // A check of the same choice that ends in a refusal leaves none of the earlier counts to be read beside it.
    sources.preview.mockResolvedValueOnce({ ...PREVIEW, refusal: { code: 'UPLOAD_SET_INCOMPLETE', message: 'not complete' } });
    el.version = 'v2';
    await settle();
    expect(part(el, 'refusal')).not.toBeNull();
    expect(notice.textContent).toBe('');
    sources.preview.mockResolvedValueOnce({ ...PREVIEW, refusal: { code: 'UPLOAD_SET_INCOMPLETE', message: 'not complete' } });
    await press(row(el, 'Court scans').querySelector<HTMLElement>('[part~="choose"]'));
    expect(notice.textContent).toBe('');

    // A failure is shown as well as spoken.
    sources.preview.mockRejectedValueOnce(new Error('offline'));
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(notice.textContent).toBe('What a launch would take could not be checked.');
    expect(notice.hasAttribute('data-spoken')).toBe(false);
  });

  it('speaks the page language for every refusal code it knows, and one sentence otherwise', async () => {
    const OTHER = 'Yêu cầu này bị từ chối, và thử lại cũng không thay đổi được.';
    const KNOWN: [string, string][] = [
      ['FILE_SET_NO_READY_GROUPS', 'Chưa có gì trong đó sẵn sàng để chạy'],
      ['UPLOAD_SET_ALREADY_LAUNCHED', 'Đã có một lượt chạy bắt đầu từ lượt tải lên này; hãy tải tệp lên lại để chạy lượt khác'],
      ['UPLOAD_SET_INCOMPLETE', 'Chưa tải lên xong'],
      ['FILE_SET_SLOT_HAS_OTHER_CONSUMERS', 'Quy trình này đọc trường theo cách không dùng được thư mục'],
      ['FILE_SET_MARKER_NEEDS_FOLDER_GRAIN', 'Thư mục này chờ tệp đánh dấu hoàn tất, còn quy trình này chạy từng tệp một'],
      ['FILE_SET_IN_USE', 'Một lượt chạy chưa xong vẫn đang đọc nó'],
    ];
    const sources = stubSources();
    const el = await mount(sources, { locale: 'vi' });
    const errors = heard(el, 'af-folder-error');
    await choose(el, 'watched');
    const check = () => press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    const banner = () => part(el, 'refusal')!.querySelector('.af-banner-description')!.textContent;

    for (const [code, words] of KNOWN) {
      // The refusal a launch would answer, which the preview carries, and the same code on a call that was refused.
      sources.preview.mockResolvedValueOnce({ ...PREVIEW, refusal: { code, message: 'the server, in English' } });
      await check();
      expect([code, banner()]).toEqual([code, words]);
      sources.preview.mockRejectedValueOnce(refusedWith(422, 'the server, in English', code));
      await check();
      expect([code, part(el, 'notice')!.textContent]).toEqual([code, words]);
      expect(part(el, 'retry')).toBeNull();
      // The page still gets the server's own sentence, with the code to tell refusals apart by.
      expect(errors.at(-1)).toEqual({ during: 'preview', status: 422, code, message: 'the server, in English' });
    }

    sources.preview.mockResolvedValueOnce({ ...PREVIEW, refusal: { code: 'FOREACH_FAN_OUT_EXCEEDED', message: 'Too many folders to run at once.' } });
    await check();
    expect(banner()).toBe(OTHER);
    // A code the kit words as a reason a folder is left out is not one it words as a refusal.
    sources.preview.mockResolvedValueOnce({ ...PREVIEW, refusal: { code: 'TOO_MANY_FILES', message: 'Too many files.' } });
    await check();
    expect(banner()).toBe(OTHER);
    sources.preview.mockRejectedValueOnce(refusedWith(403, 'You may not launch this workflow.', 'FORBIDDEN'));
    await check();
    expect(part(el, 'notice')!.textContent).toBe(OTHER);
    expect(errors.at(-1)).toEqual({ during: 'preview', status: 403, code: 'FORBIDDEN', message: 'You may not launch this workflow.' });

    // The language follows the page after the refusal, as every other string does.
    el.locale = 'en';
    await settle();
    expect(part(el, 'notice')!.textContent).toBe('This was refused, and trying again will not change that.');
  });

  it('locks the watched rows and the sources while an upload runs', async () => {
    const sources = stubSources({ uploadFolder: vi.fn<FolderSources['uploadFolder']>(() => new Promise(() => {})) });
    const el = await mount(sources);
    const locks = (name: string) => [...shadow(el).querySelectorAll<HTMLButtonElement | HTMLInputElement>(name)].map((control) => control.disabled);
    await pick(el, [inFolder('batch/HS-481/p1.pdf')]);
    expect(locks('[part~="source"] input')).toEqual([true, true, true]);

    // A page that takes the drop zone away mid-upload shows the watched folders, none of which can be chosen or opened.
    el.offer = ['watched'];
    await settle();
    expect(locks('[part~="choose"], [part~="open"], [part~="crumb"]')).toEqual([true, true, true, true, true]);
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(sources.uploadFolder.mock.calls[0]![1].signal!.aborted).toBe(false);
    expect(sources.preview).not.toHaveBeenCalled();

    await press(part(el, 'cancel'));
    expect(locks('[part~="source"] input, [part~="choose"], [part~="open"], [part~="crumb"]')).toEqual([false, false, false, false, false, false]);
  });

  it('says an empty folder holds nothing to upload, without asking the server', async () => {
    const EMPTY = 'That folder holds no files, so there is nothing to upload.';
    const sources = stubSources();
    const el = await mount(sources);
    const cases: [string, () => Promise<unknown>][] = [
      ['picked', () => pick(el, [])],
      // What the operating system keeps in every folder it shows is never uploaded, so a folder of only that is empty.
      ['picked, holding only a system file', () => pick(el, [inFolder('batch/.DS_Store')])],
      ['dropped', () => drop(el, [dir('batch', [])])],
      ['dropped, holding only empty folders and a system file', () => drop(el, [dir('batch', [dir('HS-481', []), fileEntry('Thumbs.db')])])],
    ];
    for (const [name, act] of cases) {
      await choose(el, 'computer');
      await act();
      expect([name, part(el, 'notice')!.textContent]).toEqual([name, EMPTY]);
      expect(part(el, 'notice')!.dataset.tone).toBe('danger');
      // Choosing a source again clears the notice, so the next case hears its own.
      await choose(el, 'files');
      expect(part(el, 'notice')!.textContent).toBe('');
    }
    expect(sources.uploadFolder).not.toHaveBeenCalled();

    // A file anywhere below is enough.
    await choose(el, 'computer');
    const batch = dir('batch', [dir('HS-481', [fileEntry('p1.pdf')])]);
    await drop(el, [batch]);
    expect(sources.uploadFolder.mock.calls[0]![0]).toEqual([batch]);
  });

  it('says it has nothing to read from when no sources are given', async () => {
    const NONE = 'Files cannot be chosen here: nothing is connected to read them from.';
    const el = await mount(null as never);
    const opened = vi.spyOn(picker(el), 'click');
    await press(part(el, 'dropzone'));
    expect(opened).not.toHaveBeenCalled();
    expect(part(el, 'notice')!.textContent).toBe(NONE);
    await choose(el, 'files');
    expect(part(el, 'notice')!.textContent).toBe('');
    await drop(el, [fileEntry('a.pdf')]);
    expect(part(el, 'notice')!.textContent).toBe(NONE);
    await choose(el, 'watched');
    expect(part(el, 'empty')!.textContent).toBe(NONE);

    // Given sources later, it reads from them.
    const sources = stubSources();
    el.sources = sources;
    await settle();
    expect(texts(el, 'choose')).toEqual(['Court scans 1,234 files', 'Archive 8 files']);
  });

  it('adds no listener of its own to document or window', async () => {
    const watch = watchDocumentListeners(() => true);
    try {
      const sources = stubSources();
      const el = await mount(sources);
      // A dropped folder is handed on as the entry the browser gave, and the drop never falls through to the page.
      const folder = { isFile: false, isDirectory: true, name: 'batch' };
      const events = await drop(el, [folder]);
      expect(events.slice(1).map((e) => e.defaultPrevented)).toEqual([true, true]);
      expect(sources.uploadFolder.mock.calls[0]![0]).toEqual([folder]);
      expect(sources.uploadFolder.mock.calls[0]![1].name).toBe('batch');
      // Single files are not a folder: refused with a notice, and nothing is uploaded.
      await drop(el, [fileEntry('a.pdf')]);
      expect(sources.uploadFolder).toHaveBeenCalledTimes(1);
      expect(part(el, 'notice')!.textContent).toContain('Drop a folder here, not single files.');
      await choose(el, 'watched');
      await press(row(el, 'Court scans').querySelector<HTMLElement>('[part~="open"]'));
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  it('says when it is busy: from a pick or a choice until the value is known, the upload fails or the person cancels', async () => {
    const said = (el: HTMLElement) => {
      const seen: unknown[] = [];
      el.addEventListener('af-folder-busy', (e) => seen.push((e as CustomEvent<{ busy: boolean }>).detail.busy));
      el.addEventListener('af-folder-change', (e) => seen.push((e as CustomEvent<{ value: unknown }>).detail.value));
      return seen;
    };
    const files = [inFolder('batch-12/HS-481/p1.pdf')];

    // Nothing is announced before the set exists, and a big folder's set takes a while to declare.
    const hung = stubSources({ uploadFolder: vi.fn<FolderSources['uploadFolder']>(() => new Promise(() => {})) });
    let el = await mount(hung);
    let seen = said(el);
    await pick(el, files);
    expect(seen).toEqual([true]);
    await press(part(el, 'cancel'));
    expect(seen).toEqual([true, false]);

    // It stays busy through the check that follows the upload, and the value is known before it ends.
    el = await mount(stubSources());
    seen = said(el);
    await pick(el, files);
    expect(seen).toEqual([true, { $fileSet: 'set-1' }, false]);
    await choose(el, 'watched');
    await press(row(el, 'Archive').querySelector<HTMLElement>('[part~="choose"]'));
    expect(seen.slice(3)).toEqual([null, true, { $fileSet: 'ws2' }, false]);

    el = await mount(stubSources({ uploadFolder: vi.fn<FolderSources['uploadFolder']>(async () => { throw new Error('offline'); }) }));
    seen = said(el);
    await pick(el, files);
    expect(seen).toEqual([true, false]);
  });
});
