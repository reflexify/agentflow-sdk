import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import type { FileItem } from '../../src/kit/index.js';
import { settle, shadow, watchDocumentListeners } from '../support.js';

type Recorded = { __value?: unknown; __validity?: ValidityStateFlags };
type UploadEl = HTMLElement & { items: FileItem[]; internals: Recorded };

async function upload(attributes: Record<string, string>, items: FileItem[] = []) {
  document.body.innerHTML = '';
  const el = document.createElement('af-file-upload') as UploadEl;
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  el.items = items;
  document.body.append(el);
  await settle();
  return el;
}
const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const parts = (el: Element, name: string) => [...shadow(el).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const heard = (el: HTMLElement, type: string) => {
  const seen: unknown[] = [];
  el.addEventListener(type, (e) => seen.push((e as CustomEvent).detail));
  return seen;
};
const file = (name: string, size = 3, type = '') => new File(['x'.repeat(size)], name, { type });

// A browser's drop is preceded by a drag over the zone, both carrying the files.
async function drop(el: HTMLElement, files: File[]) {
  const dataTransfer = new DataTransfer();
  for (const f of files) dataTransfer.items.add(f);
  const zone = part(el, 'dropzone')!;
  for (const type of ['dragenter', 'dragover', 'drop']) {
    zone.dispatchEvent(Object.assign(new Event(type, { bubbles: true, cancelable: true, composed: true }), { dataTransfer }));
  }
  await settle();
}

const ITEMS: FileItem[] = [
  { id: 'f1', name: 'contract.pdf', size: 1536, status: 'done', href: 'https://files.example/f1' },
  { id: 'f2', name: 'photo.png', size: 2_400_000, status: 'uploading', progress: 40 },
  { id: 'f3', name: 'notes.txt', size: 512, status: 'failed', error: 'The server refused the file.' },
];

describe('<af-file-upload>', () => {
  it('emits files-add once with every file dropped, and keeps none of them', async () => {
    const el = await upload({ multiple: '' });
    const added = heard(el, 'files-add');
    const files = [file('a.pdf'), file('b.png', 5, 'image/png')];
    await drop(el, files);
    expect(added).toHaveLength(1);
    expect((added[0] as { files: File[] }).files).toEqual(files);
    // Dropping the same files again is a new drop, not a duplicate of files the element held.
    await drop(el, files);
    expect(added).toHaveLength(2);
    expect(parts(el, 'item')).toHaveLength(0);
  });

  it('refuses a drop whole when a file is not of an accepted type, and accepts one by its extension', async () => {
    const el = await upload({ accept: '.pdf', multiple: '' });
    const added = heard(el, 'files-add');
    await drop(el, [file('a.pdf'), file('notes.txt', 3, 'text/plain')]);
    expect(added).toEqual([]);
    expect(part(el, 'notice')!.getAttribute('role')).toBe('status');
    expect(part(el, 'notice')!.getAttribute('aria-live')).toBe('polite');
    expect(part(el, 'notice')!.textContent).toBe('notes.txt is not an allowed type.');

    const pdf = file('scan.pdf');
    await drop(el, [pdf]);
    expect(added).toEqual([{ files: [pdf] }]);
  });

  it('names the count, not the type, when a drop is over the limit and one of its files is of the wrong type', async () => {
    const capped = await upload({ accept: '.pdf', 'max-files': '3' });
    const added = heard(capped, 'files-add');
    await drop(capped, [file('1.pdf'), file('2.pdf'), file('3.pdf'), file('notes.txt', 3, 'text/plain')]);
    expect(part(capped, 'notice')!.textContent).toBe('At most 3 files.');

    const single = await upload({ accept: '.pdf' });
    added.length = 0;
    const alone = heard(single, 'files-add');
    await drop(single, [file('1.pdf'), file('notes.txt', 3, 'text/plain')]);
    expect(part(single, 'notice')!.textContent).toBe('One file only.');
    expect([...added, ...alone]).toEqual([]);
  });

  it('refuses more files than max-files, and accepts a file of no bytes', async () => {
    const el = await upload({ 'max-files': '3', locale: 'vi' });
    const added = heard(el, 'files-add');
    await drop(el, [file('1.pdf'), file('2.pdf'), file('3.pdf'), file('4.pdf')]);
    expect(added).toEqual([]);
    expect(part(el, 'notice')!.textContent).toBe('Tối đa 3 tệp.');

    const empty = file('empty.pdf', 0);
    await drop(el, [empty]);
    expect(added).toEqual([{ files: [empty] }]);
  });

  it('adds a file dropped twice at once, and says so', async () => {
    const el = await upload({ multiple: '' });
    const added = heard(el, 'files-add');
    const twice = () => new File(['x'], 'a.pdf', { lastModified: 1 });
    const once = file('b.pdf');
    await drop(el, [twice(), once, twice()]);
    expect(added).toHaveLength(1);
    expect((added[0] as { files: File[] }).files.map((f) => f.name)).toEqual(['a.pdf', 'b.pdf']);
    expect(part(el, 'notice')!.textContent).toBe('a.pdf appears more than once; it was added once.');

    const vi_ = await upload({ multiple: '', locale: 'vi' });
    await drop(vi_, [twice(), twice()]);
    expect(part(vi_, 'notice')!.textContent).toBe('a.pdf xuất hiện nhiều lần; chỉ thêm một lần.');
  });

  it('draws a row for each item, with its name, size, progress, failure and remove button', async () => {
    const el = await upload({}, ITEMS);
    const rows = parts(el, 'item');
    expect(rows).toHaveLength(3);
    const name = (row: HTMLElement) => row.querySelector<HTMLElement>('[part~="name"]')!;
    expect(rows.map((row) => name(row).textContent)).toEqual(['contract.pdf', 'photo.png', 'notes.txt']);
    expect(name(rows[0]!).getAttribute('href')).toBe('https://files.example/f1');
    expect(name(rows[0]!).getAttribute('target')).toBe('_blank');
    expect(name(rows[1]!).hasAttribute('href')).toBe(false);
    expect(rows.map((row) => row.querySelector('[part~="size"]')!.textContent)).toEqual(['1.5 kB', '2.3 MB', '512 B']);

    expect(rows.map((row) => !!row.querySelector('[part~="progress"]'))).toEqual([false, true, false]);
    const bar = rows[1]!.querySelector('[part~="progress"]')!;
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-label')).toBe('Uploading…');

    const failed = rows[2]!.querySelector<HTMLElement>('[part~="status"]')!;
    expect(failed.textContent).toBe('Failed');
    expect(failed.title).toBe('The server refused the file.');
    expect(rows.map((row) => !!row.querySelector('[part~="status"]'))).toEqual([false, false, true]);

    const removes = rows.map((row) => row.querySelector<HTMLButtonElement>('[part~="remove"]')!);
    expect(removes.map((b) => b.disabled)).toEqual([false, true, false]);
    expect(removes[0]!.getAttribute('aria-label')).toBe('Remove file: contract.pdf');
    expect(rows.map((row) => !!row.querySelector('[part~="icon"]'))).toEqual([true, true, true]);
  });

  it('draws an image preview in place of the icon, and the size in the language of the element', async () => {
    const el = await upload({ locale: 'vi' }, [
      { id: 'p', name: 'photo.png', size: 1536, status: 'done', preview: 'data:image/png;base64,AA==' },
      { id: 'q', name: 'note.txt', size: 1023, status: 'done' },
    ]);
    const [row, small] = parts(el, 'item');
    expect(row!.querySelector('[part~="icon"]')).toBeNull();
    expect(row!.querySelector('[part~="preview"]')!.getAttribute('src')).toBe('data:image/png;base64,AA==');
    expect(row!.querySelector('[part~="size"]')!.textContent).toBe('1,5 kB');
    expect(small!.querySelector('[part~="size"]')!.textContent).toBe('1.023 B');
  });

  it('emits remove with the id from a row’s remove button', async () => {
    const el = await upload({}, ITEMS);
    const removed = heard(el, 'remove');
    parts(el, 'remove')[2]!.click();
    parts(el, 'remove')[1]!.click();
    expect(removed).toEqual([{ id: 'f3' }]);
  });

  it('follows the items the page sets', async () => {
    const el = await upload({}, ITEMS.slice(0, 1));
    expect(parts(el, 'item')).toHaveLength(1);
    el.items = ITEMS;
    await settle();
    expect(parts(el, 'item')).toHaveLength(3);
  });

  it('hides the drop zone and every remove button when readonly, and keeps the rows', async () => {
    const el = await upload({ readonly: '' }, ITEMS);
    expect(part(el, 'dropzone')).toBeNull();
    expect(parts(el, 'remove')).toEqual([]);
    expect(parts(el, 'item')).toHaveLength(3);
  });

  it('says how many files it takes, and offers the browse word inside a keyboard-reachable drop zone', async () => {
    const one = await upload({});
    const zone = part(one, 'dropzone')!;
    expect(zone.getAttribute('role')).toBe('button');
    expect(zone.tabIndex).toBe(0);
    expect(zone.contains(part(one, 'trigger'))).toBe(true);
    expect(zone.textContent).toContain('Drop a file here, or');
    expect(part(one, 'trigger')!.textContent).toBe('browse');
    expect(part(one, 'hint')!.textContent).toBe('One file only.');
    one.focus();
    expect(shadow(one).activeElement).toBe(zone);

    const many = await upload({ multiple: '', locale: 'vi' });
    expect(part(many, 'dropzone')!.textContent).toContain('Thả tệp vào đây, hoặc');
    expect(part(many, 'trigger')!.textContent).toBe('chọn tệp');
    expect(part(many, 'hint')!.textContent).toBe('Có thể thêm nhiều tệp.');
  });

  it('names its drop zone by label, and describes it with the text it shows', async () => {
    const plain = await upload({});
    expect(part(plain, 'dropzone')!.getAttribute('aria-label')).toBe('Drop a file here, or browse');
    expect(part(plain, 'dropzone')!.getAttribute('aria-describedby')).toBe('af-hint');

    const el = await upload({ label: 'Hồ sơ', description: 'PDF only.' });
    const zone = part(el, 'dropzone')!;
    expect(zone.getAttribute('aria-label')).toBe('Hồ sơ');
    const described = zone.getAttribute('aria-describedby')!.split(' ');
    const read = (id: string) => shadow(el).getElementById(id)!.textContent;
    expect(described.map(read)).toEqual(['Drop a file here, or browse', 'One file only.', 'PDF only.']);
    expect(zone.textContent).toContain('Drop a file here, or');
  });

  describe('replace', () => {
    const held: FileItem[] = [{ id: 'f1', name: 'contract.pdf', size: 1536, status: 'done' }];

    it('takes a new single file in place of the held one, with or without max-files', async () => {
      for (const extra of [{}, { 'max-files': '1' }] as Record<string, string>[]) {
        const el = await upload({ replace: '', ...extra }, held);
        const added = heard(el, 'files-add');
        const next = file('amended.pdf');
        await drop(el, [next]);
        expect(added).toEqual([{ files: [next] }]);
        expect(part(el, 'notice')!.textContent).toBe('');
      }
    });

    it('still judges the one file it takes: its type, and a second file in the same pick', async () => {
      const el = await upload({ replace: '', 'max-files': '1', accept: '.pdf' }, held);
      const added = heard(el, 'files-add');
      await drop(el, [file('notes.txt', 3, 'text/plain')]);
      expect(part(el, 'notice')!.textContent).toBe('notes.txt is not an allowed type.');
      await drop(el, [file('a.pdf'), file('b.pdf')]);
      expect(part(el, 'notice')!.textContent).toBe('One file only.');
      expect(added).toEqual([]);
    });

    it('is refused, without replace, when max-files is one and a file is held', async () => {
      const el = await upload({ 'max-files': '1' }, held);
      const added = heard(el, 'files-add');
      await drop(el, [file('amended.pdf')]);
      expect(added).toEqual([]);
      expect(part(el, 'notice')!.textContent).toBe('One file only.');
    });
  });

  it('submits the id of each done item under its name, and is missing a value when required with none done', async () => {
    const el = await upload({ name: 'attachments', required: '' }, ITEMS);
    expect([...(el.internals.__value as FormData)]).toEqual([['attachments', 'f1']]);
    expect(el.internals.__validity).toEqual({});

    const pending = await upload({ name: 'attachments', required: '' }, ITEMS.slice(1));
    expect([...(pending.internals.__value as FormData)]).toEqual([]);
    expect(pending.internals.__validity).toEqual({ valueMissing: true });
  });

  it('keeps a drop on a disabled zone from reaching the browser, and emits nothing', async () => {
    const el = await upload({ multiple: '', disabled: '' });
    const added = heard(el, 'files-add');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file('a.pdf'));
    const dropped = Object.assign(new Event('drop', { bubbles: true, cancelable: true, composed: true }), { dataTransfer });
    part(el, 'dropzone')!.dispatchEvent(dropped);
    await settle();
    expect(dropped.defaultPrevented).toBe(true);
    expect(added).toEqual([]);
  });

  it('cancels a drag over and a drop on a zone inside a disabled fieldset, as on a disabled one, and emits nothing', async () => {
    const el = await upload({ multiple: '' });
    (el as unknown as { formDisabledCallback(disabled: boolean): void }).formDisabledCallback(true);
    await settle();
    const added = heard(el, 'files-add');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file('a.pdf'));
    for (const type of ['dragover', 'drop']) {
      const event = Object.assign(new Event(type, { bubbles: true, cancelable: true, composed: true }), { dataTransfer });
      part(el, 'dropzone')!.dispatchEvent(event);
      expect(event.defaultPrevented, type).toBe(true);
    }
    await settle();
    expect(added).toEqual([]);
  });

  it('empties the hidden file input after each pick, accepted or refused, so the same file can be picked again', async () => {
    const el = await upload({ accept: '.pdf', multiple: '' });
    const input = shadow(el).querySelector<HTMLInputElement>('input[type="file"]')!;
    const writes: string[] = [];
    Object.defineProperty(input, 'value', { configurable: true, get: () => 'C:\\fakepath\\a.pdf', set: (v: string) => writes.push(v) });
    const pick = async (picked: File[]) => {
      Object.defineProperty(input, 'files', { configurable: true, value: picked });
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      await settle();
    };
    await pick([file('a.pdf')]);
    expect(writes).toEqual(['']);
    await pick([file('notes.txt', 3, 'text/plain')]);
    expect(writes).toEqual(['', '']);
  });

  it('adds no listener of its own to document or window, dragged over and dropped on', async () => {
    const watch = watchDocumentListeners(() => true);
    try {
      const el = await upload({ multiple: '', accept: '.pdf' });
      await drop(el, [file('a.pdf')]);
      await drop(el, [file('b.txt')]);
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });
});
