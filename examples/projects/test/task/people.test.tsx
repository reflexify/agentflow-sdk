// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOA, MAI, MINH, TUAN } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { pickPerson, renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { LOGIN_DESIGN, recordingPatches, seeded } from './support.js';

const vi_ = TEXT.vi;
const HANDOVER = 'Chuẩn bị tài liệu bàn giao';
const API = 'Xây dựng API đăng nhập';
const PAYMENT = 'Tích hợp cổng thanh toán';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type Picker = HTMLElement & { people: { id: string }[]; value: string | string[] | null; multiple: boolean };

async function open(you: string, title: string) {
  const s = seeded(you);
  const writes = recordingPatches();
  const id = s.task(title);
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/t/${id}`, api: writes.api });
  const drawer = await screen.findByRole('dialog', { name: title });
  const row = (field: 'primary' | 'collaborators') => drawer.querySelector<HTMLElement>(`[data-field="${field}"]`)!;
  const picker = (field: 'primary' | 'collaborators') => row(field).querySelector('af-person-picker') as Picker | null;
  return { ...s, ...view, id, drawer, row, picker, patches: writes.patches };
}

describe('Người chính', () => {
  it('offers a member Nhận task while nobody holds the task, and shows them once they have taken it', async () => {
    const { row, stored, id, picker } = await open(HOA, HANDOVER);
    expect(picker('primary')).toBeNull();
    fireEvent.click(within(row('primary')).getByRole('button', { name: vi_.claim }));
    await waitFor(() => expect(stored(id).claimed_by).toBe(HOA));
    expect(await within(row('primary')).findByRole('img', { name: 'Lê Thị Hoa' })).toBeTruthy();
    expect(within(row('primary')).queryByRole('button', { name: vi_.claim })).toBeNull();
  });

  it('shows the viewer as primary as soon as they take the task, before the server answers', async () => {
    const s = seeded(HOA);
    let answer!: () => void;
    const id = s.task(HANDOVER);
    renderProjects(<App />, {
      fake: s.fake, lang: 'vi', path: `/t/${id}`,
      api: (api) => ({ ...api, claim: (t) => new Promise<void>((resolve, reject) => { answer = () => void api.claim(t).then(resolve, reject); }) }),
    });
    const drawer = await screen.findByRole('dialog', { name: HANDOVER });
    const row = drawer.querySelector<HTMLElement>('[data-field="primary"]')!;
    fireEvent.click(within(row).getByRole('button', { name: vi_.claim }));
    expect(await within(row).findByRole('img', { name: 'Lê Thị Hoa' })).toBeTruthy();
    expect(s.stored(id).claimed_by).toBeUndefined();
    answer();
    await waitFor(() => expect(s.stored(id).claimed_by).toBe(HOA));
  });

  it('sends one claim for two presses of Nhận task in one tick', async () => {
    const s = seeded(HOA);
    const id = s.task(HANDOVER);
    let claims = 0;
    const view = renderProjects(<App />, {
      fake: s.fake, lang: 'vi', path: `/t/${id}`,
      api: (api) => ({ ...api, claim: (t) => { claims += 1; return api.claim(t); } }),
    });
    const drawer = await screen.findByRole('dialog', { name: HANDOVER });
    const button = within(drawer.querySelector<HTMLElement>('[data-field="primary"]')!).getByRole('button', { name: vi_.claim });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(s.stored(id).claimed_by).toBe(HOA));
    await new Promise((r) => setTimeout(r, 50));
    expect(claims).toBe(1);
    expect(view.toasts()).toEqual([]);
  });

  it('puts Nhận task back and flashes the field when the claim is refused', async () => {
    const s = seeded(HOA);
    const id = s.task(HANDOVER);
    s.fake.server.failNext('POST', /\/work\/claim$/, 409, { type: 'WORK_ALREADY_CLAIMED', title: 'Conflict', status: 409, detail: 'WORK_ALREADY_CLAIMED: Người khác vừa nhận task này' });
    const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/t/${id}` });
    const drawer = await screen.findByRole('dialog', { name: HANDOVER });
    const row = () => drawer.querySelector<HTMLElement>('[data-field="primary"]')!;
    fireEvent.click(within(row()).getByRole('button', { name: vi_.claim }));
    await waitFor(() => expect(view.toasts()).toContain('Người khác vừa nhận task này'));
    await waitFor(() => expect(row().hasAttribute('data-rolled-back')).toBe(true));
    expect(within(row()).getByRole('button', { name: vi_.claim })).toBeTruthy();
    expect(within(row()).queryByRole('img', { name: 'Lê Thị Hoa' })).toBeNull();
  });

  it("gives a manager a picker of the project's managers and members, and picking someone hands the task to them", async () => {
    const { picker, stored, id } = await open(MINH, HANDOVER);
    const el = picker('primary')!;
    expect(el.multiple).toBe(false);
    expect(el.people.map((p) => p.id).sort()).toEqual([MINH, HOA, MAI].sort());
    pickPerson(el, MAI);
    await waitFor(() => expect(stored(id).claimed_by).toBe(MAI));
  });

  it('reassigns a held task when a manager picks someone else', async () => {
    const { picker, stored, id } = await open(MINH, LOGIN_DESIGN);
    expect(picker('primary')!.value).toBe(HOA);
    pickPerson(picker('primary')!, MAI);
    await waitFor(() => expect(stored(id).claimed_by).toBe(MAI));
  });

  it('shows a member who is no manager the primary by name, with no picker', async () => {
    const { row, picker } = await open(MAI, LOGIN_DESIGN);
    expect(picker('primary')).toBeNull();
    expect(within(row('primary')).getByText('Lê Thị Hoa')).toBeTruthy();
  });
});

describe('Người phối hợp', () => {
  it("is a multiple picker of the project's people for the primary, writing collaborators", async () => {
    const { picker, patches, stored, id } = await open(HOA, API);
    const el = picker('collaborators')!;
    expect(el.multiple).toBe(true);
    expect(el.value).toEqual([TUAN]);
    // Tuấn is on no project, but he collaborates here, so the picker can still show him.
    expect(el.people.map((p) => p.id).sort()).toEqual([MINH, HOA, MAI, TUAN].sort());
    pickPerson(el, [TUAN, MAI]);
    await waitFor(() => expect(stored(id).collaborators).toEqual([TUAN, MAI]));
    expect(patches).toEqual([{ collaborators: [TUAN, MAI] }]);
  });

  it('is a picker for a manager too', async () => {
    const { picker, stored, id } = await open(MINH, LOGIN_DESIGN);
    pickPerson(picker('collaborators')!, [MAI]);
    await waitFor(() => expect(stored(id).collaborators).toEqual([MAI]));
  });

  it('is read only for anyone else, saying who may change it', async () => {
    const { row, picker } = await open(MAI, PAYMENT);
    expect(picker('collaborators')).toBeNull();
    expect(within(row('collaborators')).getByText('Lê Thị Hoa')).toBeTruthy();
    hoverTooltips(row('collaborators'));
    expect((row('collaborators').querySelector('af-tooltip') as HTMLElement & { text: string }).text).toBe(vi_.onlyOwnerOrManager);
  });
});
