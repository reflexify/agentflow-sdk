// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { createSeed, HOA, MAI, MINH } from '../../src/api/seed.js';
import { formatBytes } from '../../src/model/format.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { useNodeUploads } from '../support/uploads.js';
import { LAUNCH, recordingPatches } from './support.js';

const vi_ = TEXT.vi;
const PAYMENT = 'Tích hợp cổng thanh toán';
const PDF_ID = '60000000-0000-4000-8000-000000000099';

let made: string[] = [];
let revoked: string[] = [];
useNodeUploads();
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
  made = [];
  revoked = [];
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
    const url = `blob:preview/${made.length + 1}`;
    made.push(url);
    return url;
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((url: string) => { revoked.push(url); });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** The seed with a PDF beside the payment task's image. */
function withPdf() {
  const seed = createSeed(TEST_NOW);
  seed.files.push({ id: PDF_ID, name: 'bao-gia-cong-thanh-toan.pdf', type: 'application/pdf', bytes: new TextEncoder().encode('%PDF-1.4 bao gia') });
  const task = seed.records.task!.find((r) => r.body.title === PAYMENT)!;
  task.body.attachments = [...(task.body.attachments as string[]), PDF_ID];
  return seed;
}

async function open(you: string, opts: { pdf?: boolean } = {}) {
  const fake = createFakeProjects({ you, ...(opts.pdf ? { seed: withPdf() } : {}) });
  const writes = recordingPatches();
  const launch = fake.server.records('project').find((r) => r.body.name === LAUNCH)!.id;
  const id = fake.server.records('task').find((r) => r.body.title === PAYMENT)!.id;
  const stored = () => fake.server.records('task').find((r) => r.id === id)!.body;
  const view = renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}/t/${id}`, api: writes.api });
  const drawer = await screen.findByRole('dialog', { name: PAYMENT });
  const field = drawer.querySelector<HTMLElement>('[data-field="attachments"]')!;
  return { ...view, fake, id, drawer, field, stored, patches: writes.patches, launch };
}

const fileRow = (field: HTMLElement, id: string) => field.querySelector<HTMLElement>(`[data-file="${id}"]`);

describe('the attachments', () => {
  it('uploads a dropped file, then adds it to the task beside the files it had', async () => {
    const { field, stored, patches, fake } = await open(HOA);
    const before = stored().attachments as string[];
    const zone = field.querySelector<HTMLElement>('[data-part="dropzone"]')!;
    const file = new File(['%PDF-1.4 bien ban'], 'bien-ban-hop.pdf', { type: 'application/pdf' });
    fireEvent.dragOver(zone, { dataTransfer: { files: [file], types: ['Files'] } });
    expect(zone.hasAttribute('data-over')).toBe(true);
    fireEvent.drop(zone, { dataTransfer: { files: [file], types: ['Files'] } });
    await waitFor(() => expect(stored().attachments as string[]).toHaveLength(2));
    const now = stored().attachments as string[];
    expect(now[0]).toBe(before[0]);
    expect(patches).toEqual([{ attachments: now }]);
    expect((await fake.api.attachment(now[1]!)).name).toBe('bien-ban-hop.pdf');
    expect(await within(field).findByRole('link', { name: 'bien-ban-hop.pdf' })).toBeTruthy();
    expect(zone.hasAttribute('data-over')).toBe(false);
  });

  it('also uploads a file chosen from the picker', async () => {
    const { field, stored } = await open(MINH);
    const input = within(field).getByLabelText(vi_.dropFiles) as HTMLInputElement;
    const file = new File(['hello'], 'ghi-chu.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(stored().attachments as string[]).toHaveLength(2));
  });

  it('lists each file by name and size, the name a download link', async () => {
    const { field, fake, id } = await open(HOA);
    const fileId = (fake.server.records('task').find((r) => r.id === id)!.body.attachments as string[])[0]!;
    const meta = await fake.api.attachment(fileId);
    const row = await waitFor(() => {
      const r = fileRow(field, fileId);
      expect(r?.textContent).toContain(formatBytes(meta.size, 'vi'));
      return r!;
    });
    const link = within(row).getByRole('link', { name: 'so-do-thanh-toan.png' }) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(fake.api.fileUrl(fileId));
  });

  it('previews an image and a PDF from the file read as a Blob, never from the download link', async () => {
    const { field, fake, id } = await open(HOA, { pdf: true });
    const [image, pdf] = fake.server.records('task').find((r) => r.id === id)!.body.attachments as string[];
    const img = await waitFor(() => {
      const found = field.querySelector<HTMLImageElement>(`[data-preview="${image}"] img`);
      expect(found).not.toBeNull();
      return found!;
    });
    const frame = await waitFor(() => {
      const found = field.querySelector<HTMLIFrameElement>(`[data-preview="${pdf}"] iframe`);
      expect(found).not.toBeNull();
      return found!;
    });
    const calls = vi.mocked(URL.createObjectURL).mock.calls.map(([b]) => b as Blob);
    expect(calls.map((b) => Object.prototype.toString.call(b))).toEqual(['[object Blob]', '[object Blob]']);
    const typeOf = (src: string) => calls[made.indexOf(src)]!.type;
    expect(typeOf(img.getAttribute('src')!)).toBe('image/png');
    expect(typeOf(frame.getAttribute('src')!)).toBe('application/pdf');
    expect(img.getAttribute('src')).not.toBe(fake.api.fileUrl(image!));
    expect(frame.getAttribute('src')).not.toBe(fake.api.fileUrl(pdf!));
    expect(frame.getAttribute('title')).toBe('bao-gia-cong-thanh-toan.pdf');
    expect(img.getAttribute('alt')).toBe('so-do-thanh-toan.png');
  });

  it('gives back every object URL it made when the drawer closes', async () => {
    const { field, drawer } = await open(HOA, { pdf: true });
    await waitFor(() => expect(field.querySelectorAll('[data-preview] img, [data-preview] iframe')).toHaveLength(2));
    expect(revoked).toEqual([]);
    fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }));
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    expect(made).toHaveLength(2);
    expect([...revoked].sort()).toEqual([...made].sort());
  });

  it('shows a member who is no participant the files, and no drop zone', async () => {
    const { field, fake, id } = await open(MAI);
    expect(field.querySelector('[data-part="dropzone"]')).toBeNull();
    expect(field.querySelector('input[type="file"]')).toBeNull();
    const fileId = (fake.server.records('task').find((r) => r.id === id)!.body.attachments as string[])[0]!;
    await waitFor(() => expect(fileRow(field, fileId)).not.toBeNull());
    hoverTooltips(field);
    const hint = field.querySelector('af-tooltip') as (HTMLElement & { text: string }) | null;
    expect(hint?.text).toBe(vi_.onlyParticipants);
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
  });
});
