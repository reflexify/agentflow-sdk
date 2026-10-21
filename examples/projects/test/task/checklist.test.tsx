// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChecklistOp, ProjectsApi, TaskChanges } from '../../src/api/projects-api.js';
import { HOA, MAI } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { t, TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { LAUNCH, LOGIN_DESIGN, seeded } from './support.js';

const vi_ = TEXT.vi;
const up = (text: string) => t('vi', 'moveUp', { text });
const down = (text: string) => t('vi', 'moveDown', { text });
const removeName = (text: string) => t('vi', 'removeItem', { text });

/** Each checklist call waits for the test to let it through, in order. */
function gates() {
  const waiting: (() => void)[] = [];
  let opened = 0;
  return {
    hold: () => new Promise<void>((r) => { if (opened > 0) { opened--; r(); } else waiting.push(r); }),
    release: () => { const next = waiting.shift(); if (next) next(); else opened++; },
    waiting: () => waiting.length,
  };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });
type Item = { id: string; text: string; done: boolean };
const items = (n: number) => Array.from({ length: n }, (_, i) => ({ text: `Mục ${i + 1}`, done: false }));

async function open(you: string, title: string, prepare?: (s: ReturnType<typeof seeded>) => void, hold?: () => Promise<void>) {
  const s = seeded(you);
  prepare?.(s);
  const ops: ChecklistOp[][] = [];
  const patches: TaskChanges[] = [];
  const api = (a: ProjectsApi): ProjectsApi => ({
    ...a,
    checklist: async (task, o) => {
      ops.push(o);
      await hold?.();
      return a.checklist(task, o);
    },
    updateTask: (task, changes) => {
      patches.push(changes);
      return a.updateTask(task, changes);
    },
  });
  const id = s.task(title);
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/p/${s.project(LAUNCH)}/t/${id}`, api });
  const drawer = await screen.findByRole('dialog', { name: title });
  const field = drawer.querySelector<HTMLElement>('[data-field="checklist"]')!;
  const list = () => (s.stored(id).checklist as Item[]);
  const row = (text: string) => field.querySelector<HTMLElement>(`[data-item="${list().find((i) => i.text === text)!.id}"]`)!;
  const count = () => field.querySelector('[data-part="count"]')!.textContent;
  return { ...s, ...view, id, drawer, field, ops, patches, list, row, count };
}

describe('the checklist', () => {
  it('counts the done items in its head', async () => {
    const { field, count } = await open(HOA, LOGIN_DESIGN);
    expect(within(field).getByRole('heading', { name: vi_.checklist })).toBeTruthy();
    expect(count()).toBe('2/5');
  });

  it('ticks an item with one write, and the count follows before the server answers', async () => {
    let release = () => {};
    const held = new Promise<void>((r) => { release = r; });
    const { field, ops, list, count, id, stored } = await open(HOA, LOGIN_DESIGN, undefined, () => held);
    const item = list().find((i) => i.text === 'Thiết kế trạng thái lỗi')!;
    const box = within(field).getByRole('checkbox', { name: 'Thiết kế trạng thái lỗi' });
    expect(box.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(box);
    await waitFor(() => expect(count()).toBe('3/5'));
    expect(box.getAttribute('aria-checked')).toBe('true');
    expect((stored(id).checklist as Item[]).find((i) => i.id === item.id)!.done).toBe(false);
    release();
    await waitFor(() => expect((stored(id).checklist as Item[]).find((i) => i.id === item.id)!.done).toBe(true));
    expect(ops).toEqual([[{ op: 'set', id: item.id, done: true }]]);
    expect(count()).toBe('3/5');
  });

  it("edits an item's text in place", async () => {
    const { field, ops, list, id, stored } = await open(HOA, LOGIN_DESIGN);
    const item = list().find((i) => i.text === 'Gửi duyệt')!;
    const box = within(field).getByRole('textbox', { name: t('vi', 'checklistItem', { text: 'Gửi duyệt' }) });
    expect((box as HTMLInputElement).value).toBe('Gửi duyệt');
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Gửi duyệt cho quản lý' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect((stored(id).checklist as Item[]).find((i) => i.id === item.id)!.text).toBe('Gửi duyệt cho quản lý'));
    expect(ops).toEqual([[{ op: 'set', id: item.id, text: 'Gửi duyệt cho quản lý' }]]);
  });

  it('puts the text back on Escape and writes nothing', async () => {
    const { field, ops } = await open(HOA, LOGIN_DESIGN);
    const box = within(field).getByDisplayValue('Gửi duyệt') as HTMLInputElement;
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: 'Nháp' } });
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(box.value).toBe('Gửi duyệt');
    fireEvent.blur(box);
    await settle();
    expect(ops).toEqual([]);
  });

  it('moves an item up and down, each after the item it lands behind, and the pressed arrow keeps focus', async () => {
    const { ops, list, row, id, stored } = await open(HOA, LOGIN_DESIGN);
    const [first, second, third, fourth] = list();
    act(() => within(row(second!.text)).getByRole('button', { name: up(second!.text) }).focus());
    fireEvent.click(within(row(second!.text)).getByRole('button', { name: up(second!.text) }));
    await waitFor(() => expect((stored(id).checklist as Item[])[0]!.id).toBe(second!.id));
    // At the top its ↑ is locked and keeps focus, so pressing again sends nothing back down.
    const top = within(row(second!.text)).getByRole('button', { name: up(second!.text) });
    await waitFor(() => expect(document.activeElement).toBe(top));
    expect(top.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(top);
    await settle();
    expect(ops).toHaveLength(1);
    act(() => within(row(third!.text)).getByRole('button', { name: down(third!.text) }).focus());
    fireEvent.click(within(row(third!.text)).getByRole('button', { name: down(third!.text) }));
    await waitFor(() => expect((stored(id).checklist as Item[]).map((i) => i.id)).toEqual(
      [second!.id, first!.id, fourth!.id, third!.id, list()[4]!.id],
    ));
    expect(ops).toEqual([
      [{ op: 'move', id: second!.id, after: null }],
      [{ op: 'move', id: third!.id, after: fourth!.id }],
    ]);
    await waitFor(() => expect(document.activeElement).toBe(within(row(third!.text)).getByRole('button', { name: down(third!.text) })));
  });

  it("keeps a later change on screen when an earlier one's answer lands first", async () => {
    const g = gates();
    const { field, ops, list, row, id, stored } = await open(HOA, LOGIN_DESIGN, undefined, g.hold);
    const [first, second, third] = list();
    const order = () => [...field.querySelectorAll('[data-item]')].map((li) => li.getAttribute('data-item'));
    const upOf = () => within(row(third!.text)).getByRole('button', { name: up(third!.text) });
    act(() => upOf().focus());
    fireEvent.click(upOf());
    await waitFor(() => expect(order().slice(0, 3)).toEqual([first!.id, third!.id, second!.id]));
    fireEvent.click(upOf());
    await waitFor(() => expect(order().slice(0, 3)).toEqual([third!.id, first!.id, second!.id]));
    fireEvent.click(within(field).getByRole('checkbox', { name: 'Gửi duyệt' }));
    await waitFor(() => expect(within(field).getByRole('checkbox', { name: 'Gửi duyệt' }).getAttribute('aria-checked')).toBe('true'));
    // The first move is answered while the second and the tick still wait: both stay on screen.
    g.release();
    await waitFor(() => expect(ops).toHaveLength(2));
    expect((stored(id).checklist as Item[]).map((i) => i.id).slice(0, 3)).toEqual([first!.id, third!.id, second!.id]);
    await settle();
    expect(order().slice(0, 3)).toEqual([third!.id, first!.id, second!.id]);
    expect(within(field).getByRole('checkbox', { name: 'Gửi duyệt' }).getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(upOf());
    g.release();
    g.release();
    await waitFor(() => expect(ops).toHaveLength(3));
    await waitFor(() => expect((stored(id).checklist as Item[]).find((i) => i.text === 'Gửi duyệt')!.done).toBe(true));
    expect((stored(id).checklist as Item[]).map((i) => i.id).slice(0, 3)).toEqual([third!.id, first!.id, second!.id]);
    expect(order().slice(0, 3)).toEqual([third!.id, first!.id, second!.id]);
  });

  it('saves an item being edited, and one being added, when the browser goes back with focus in it', async () => {
    const { field, drawer, list, id, stored, project } = await open(HOA, LOGIN_DESIGN);
    const item = list().find((i) => i.text === 'Gửi duyệt')!;
    const box = within(field).getByDisplayValue('Gửi duyệt');
    act(() => box.focus());
    fireEvent.change(box, { target: { value: 'Gửi duyệt lần cuối' } });
    act(() => {
      window.history.pushState(null, '', `/p/${project(LAUNCH)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    await waitFor(() => expect((stored(id).checklist as Item[]).find((i) => i.id === item.id)!.text).toBe('Gửi duyệt lần cuối'));

    window.history.pushState(null, '', `/p/${project(LAUNCH)}/t/${id}`);
    act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });
    const again = await screen.findByRole('dialog', { name: LOGIN_DESIGN });
    const checklist = again.querySelector<HTMLElement>('[data-field="checklist"]')!;
    fireEvent.click(within(checklist).getByRole('button', { name: vi_.addItem }));
    const adding = within(checklist).getByRole('textbox', { name: vi_.addItem });
    await waitFor(() => expect(document.activeElement).toBe(adding));
    fireEvent.change(adding, { target: { value: 'Mục thêm lúc đóng' } });
    act(() => {
      window.history.pushState(null, '', `/p/${project(LAUNCH)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => expect(again.isConnected).toBe(false));
    await waitFor(() => expect((stored(id).checklist as Item[]).map((i) => i.text)).toContain('Mục thêm lúc đóng'));
  });

  it('locks a new item\'s tools, saying why, until the server has stored it', async () => {
    const g = gates();
    const { field, id, stored } = await open(HOA, LOGIN_DESIGN, undefined, g.hold);
    fireEvent.click(within(field).getByRole('button', { name: vi_.addItem }));
    const box = within(field).getByRole('textbox', { name: vi_.addItem });
    fireEvent.change(box, { target: { value: 'Chờ lưu' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    const pending = await waitFor(() => {
      const li = [...field.querySelectorAll<HTMLElement>('[data-item]')].find((r) => r.textContent?.includes('Chờ lưu'));
      expect(li).toBeTruthy();
      return li!;
    });
    const tool = within(pending).getByRole('button', { name: removeName('Chờ lưu') });
    expect(tool.getAttribute('aria-disabled')).toBe('true');
    expect(field.querySelector(`[id="${tool.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.itemSaving);
    g.release();
    await waitFor(() => expect((stored(id).checklist as Item[]).map((i) => i.text)).toContain('Chờ lưu'));
  });

  it('removes an item, with no confirm', async () => {
    const { ops, list, row, id, stored, drawer } = await open(HOA, LOGIN_DESIGN);
    const item = list().find((i) => i.text === 'Chọn bảng màu')!;
    fireEvent.click(within(row(item.text)).getByRole('button', { name: removeName(item.text) }));
    await waitFor(() => expect((stored(id).checklist as Item[]).map((i) => i.id)).not.toContain(item.id));
    expect(ops).toEqual([[{ op: 'remove', id: item.id }]]);
    expect([...drawer.querySelectorAll('af-confirm')].some((c) => (c as HTMLElement & { open: boolean }).open)).toBe(false);
  });

  it('adds an item after the last one with Thêm mục', async () => {
    const { field, ops, list, id, stored } = await open(HOA, LOGIN_DESIGN);
    const last = list()[4]!;
    fireEvent.click(within(field).getByRole('button', { name: vi_.addItem }));
    const box = within(field).getByRole('textbox', { name: vi_.addItem });
    await waitFor(() => expect(document.activeElement).toBe(box));
    fireEvent.change(box, { target: { value: 'Bàn giao bản thiết kế' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect((stored(id).checklist as Item[]).map((i) => i.text)).toContain('Bàn giao bản thiết kế'));
    expect(ops).toEqual([[{ op: 'add', text: 'Bàn giao bản thiết kế', after: last.id }]]);
    expect((stored(id).checklist as Item[]).at(-1)!.text).toBe('Bàn giao bản thiết kế');
    await waitFor(() => expect(within(field).getByDisplayValue('Bàn giao bản thiết kế')).toBeTruthy());
  });

  it('refuses a twenty-first item before any call, saying tối đa 20 mục', async () => {
    const { field, ops } = await open(HOA, LOGIN_DESIGN, (s) => {
      s.fake.server.write('task', s.task(LOGIN_DESIGN), { ...s.record(LOGIN_DESIGN).body, checklist: items(20) }, HOA);
    });
    const add = within(field).getByRole('button', { name: vi_.addItem });
    expect(add.getAttribute('aria-disabled')).toBe('true');
    expect(field.querySelector(`[id="${add.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.checklistMax);
    hoverTooltips();
    expect((add.closest('af-tooltip') as HTMLElement & { text: string }).text).toBe(vi_.checklistMax);
    fireEvent.click(add);
    await settle();
    expect(within(field).queryByRole('textbox', { name: vi_.addItem })).toBeNull();
    expect(ops).toEqual([]);
  });

  it('says tối đa 20 mục when the server refuses a twenty-first item the drawer did not know of', async () => {
    const { field, fake, id, record, stored, toasts } = await open(HOA, LOGIN_DESIGN, (s) => {
      s.fake.server.write('task', s.task(LOGIN_DESIGN), { ...s.record(LOGIN_DESIGN).body, checklist: items(19) }, HOA);
    });
    fake.server.write('task', id, { ...record(LOGIN_DESIGN).body, checklist: [...(stored(id).checklist as Item[]), { text: 'Mục của Minh', done: false }] }, HOA, { notify: false });
    fireEvent.click(within(field).getByRole('button', { name: vi_.addItem }));
    const box = within(field).getByRole('textbox', { name: vi_.addItem });
    fireEvent.change(box, { target: { value: 'Mục thứ hai mươi mốt' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(toasts()).toContain(vi_.checklistMax));
    expect(toasts()).not.toContain('has more entries than this field allows');
    expect((stored(id).checklist as Item[])).toHaveLength(20);
    // The drawer reads the task again and then knows it is full.
    await waitFor(() => expect(within(field).getByRole('button', { name: vi_.addItem }).getAttribute('aria-disabled')).toBe('true'));
    expect(within(field).queryByDisplayValue('Mục thứ hai mươi mốt')).toBeNull();
  });

  it('turns Hiện trên thẻ on and off', async () => {
    const { field, patches, id, stored } = await open(HOA, LOGIN_DESIGN);
    const toggle = within(field).getByRole('switch', { name: vi_.showOnCard });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);
    await waitFor(() => expect(toggle.getAttribute('aria-checked')).toBe('false'));
    await waitFor(() => expect(stored(id).show_checklist_on_card).toBe(false));
    expect(patches).toEqual([{ showChecklistOnCard: false }]);
  });

  it('is read only to a member who is no participant, saying who may change it', async () => {
    const { field, ops, patches } = await open(MAI, LOGIN_DESIGN);
    expect(within(field).queryAllByRole('textbox')).toHaveLength(0);
    expect(within(field).queryByRole('button', { name: /^Lên:/ })).toBeNull();
    expect(within(field).queryByRole('button', { name: /^Xoá:/ })).toBeNull();
    const box = within(field).getByRole('checkbox', { name: 'Thiết kế trạng thái lỗi' });
    expect(box.getAttribute('aria-disabled')).toBe('true');
    expect(field.querySelector(`[id="${box.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.onlyParticipants);
    fireEvent.click(box);
    expect(box.getAttribute('aria-checked')).toBe('false');
    const add = within(field).getByRole('button', { name: vi_.addItem });
    expect(add.getAttribute('aria-disabled')).toBe('true');
    expect(field.querySelector(`[id="${add.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.onlyParticipants);
    fireEvent.click(add);
    const toggle = within(field).getByRole('switch', { name: vi_.showOnCard });
    expect(toggle.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(toggle);
    await settle();
    expect(ops).toEqual([]);
    expect(patches).toEqual([]);
  });
});
