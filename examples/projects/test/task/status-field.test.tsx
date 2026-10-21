// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOA, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';
import { LOGIN_DESIGN, recordingPatches, seeded } from './support.js';

const vi_ = TEXT.vi;
const STATUS_WORDS = [vi_.statusTodo, vi_.statusDoing, vi_.statusDone, vi_.statusCancelled];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });

async function open(you: string, title: string, prepare?: (s: ReturnType<typeof seeded>) => void) {
  const s = seeded(you);
  prepare?.(s);
  const writes = recordingPatches();
  const id = s.task(title);
  const view = renderProjects(<App />, { fake: s.fake, lang: 'vi', path: `/t/${id}`, api: writes.api });
  const drawer = await screen.findByRole('dialog', { name: title });
  const field = drawer.querySelector<HTMLElement>('[data-field="status"]')!;
  const button = (word: string) => within(field).getByRole('button', { name: word });
  return { ...s, ...view, id, drawer, field, button, patches: writes.patches };
}

describe('the status field', () => {
  it('has four buttons, with the current status pressed', async () => {
    const { field } = await open(HOA, LOGIN_DESIGN);
    const group = within(field).getByRole('group', { name: vi_.status });
    const buttons = STATUS_WORDS.map((w) => within(group).getByRole('button', { name: w }));
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false', 'false']);
  });

  it("shows each status's sub-labels under it, and picking one of another status moves the task in one write", async () => {
    const { field, patches, stored, id, label } = await open(HOA, 'Xây dựng API đăng nhập');
    const todoLabels = within(field).getByRole('group', { name: `${vi_.subLabels}: ${vi_.statusTodo}` });
    expect(within(todoLabels).getByRole('button', { name: 'Ưu tiên tuần' }).getAttribute('aria-pressed')).toBe('true');
    const doingLabels = within(field).getByRole('group', { name: `${vi_.subLabels}: ${vi_.statusDoing}` });
    fireEvent.click(within(doingLabels).getByRole('button', { name: 'Chờ duyệt' }));
    await waitFor(() => expect(stored(id).status).toBe('doing'));
    expect(stored(id).label).toBe(label('Chờ duyệt'));
    expect(patches).toEqual([{ status: 'doing', label: label('Chờ duyệt') }]);
  });

  it('offers Bị chặn under Đang làm only, and it toggles blocked alone', async () => {
    const doing = await open(HOA, LOGIN_DESIGN);
    const toggle = within(doing.field).getByRole('button', { name: vi_.blocked });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle.closest('[data-status-column]')?.getAttribute('data-status-column')).toBe('doing');
    fireEvent.click(toggle);
    await waitFor(() => expect(doing.stored(doing.id).blocked).toBe(true));
    expect(doing.patches).toEqual([{ blocked: true }]);
    doing.unmount();

    const todo = await open(HOA, 'Xây dựng API đăng nhập');
    expect(within(todo.field).queryByRole('button', { name: vi_.blocked })).toBeNull();
  });

  it('locks Hoàn thành for anyone but the primary, saying why', async () => {
    const { field, button, patches } = await open(MINH, LOGIN_DESIGN);
    const done = button(vi_.statusDone);
    expect(done.getAttribute('aria-disabled')).toBe('true');
    hoverTooltips();
    expect((done.closest('af-tooltip') as HTMLElement & { text: string }).text).toBe(vi_.onlyPrimaryCompletes);
    expect(field.querySelector(`[id="${done.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.onlyPrimaryCompletes);
    fireEvent.click(done);
    await settle();
    expect(patches).toEqual([]);
  });

  it('completes the task in one write for its primary, from Chưa làm and from Đang làm, with the toast', async () => {
    const fromTodo = await open(HOA, 'Xây dựng API đăng nhập');
    fireEvent.click(fromTodo.button(vi_.statusDone));
    await waitFor(() => expect(fromTodo.stored(fromTodo.id).status).toBe('done'));
    // Its label belongs to Chưa làm, so the same write clears it.
    expect(fromTodo.patches).toEqual([{ status: 'done', label: null }]);
    await waitFor(() => expect(fromTodo.toasts()).toContain(vi_.taskCompleted));
    fromTodo.unmount();

    const fromDoing = await open(HOA, 'Mua văn phòng phẩm');
    fireEvent.click(fromDoing.button(vi_.statusDone));
    await waitFor(() => expect(fromDoing.stored(fromDoing.id).status).toBe('done'));
    expect(fromDoing.patches).toEqual([{ status: 'done' }]);
    await waitFor(() => expect(fromDoing.toasts()).toContain(vi_.taskCompleted));
  });

  it('moves Đang làm back to Chưa làm for a collaborator', async () => {
    const title = 'Tích hợp cổng thanh toán';
    const { button, patches, stored, id } = await open(HOA, title, (s) => {
      s.fake.server.write('task', s.task(title), { status: 'doing' }, MINH);
    });
    expect(button(vi_.statusDoing).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button(vi_.statusTodo));
    await waitFor(() => expect(stored(id).status).toBe('todo'));
    expect(patches).toEqual([{ status: 'todo' }]);
  });

  it('unblocks a blocked task in the same write that moves it out of Đang làm', async () => {
    const { button, patches, stored, id } = await open(HOA, 'Thiết kế luồng thanh toán');
    fireEvent.click(button(vi_.statusTodo));
    await waitFor(() => expect(stored(id).status).toBe('todo'));
    expect(stored(id).blocked).toBe(false);
    expect(patches).toEqual([{ status: 'todo', blocked: false }]);
  });

  it('clears a Đang làm sub-label in the same write that completes the task', async () => {
    const { button, patches, stored, id, toasts } = await open(HOA, LOGIN_DESIGN);
    fireEvent.click(button(vi_.statusDone));
    await waitFor(() => expect(stored(id).status).toBe('done'));
    expect(stored(id).label).toBeUndefined();
    expect(patches).toEqual([{ status: 'done', label: null }]);
    expect(toasts()).not.toContain(vi_.saveFailed);
  });

  it("shows the server's reason when it refuses, and puts the status back", async () => {
    const { button, fake, toasts, stored, id } = await open(HOA, 'Xây dựng API đăng nhập');
    fake.server.failNext('PATCH', /\/records\//, 422, {
      type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, detail: 'refused',
      field_errors: [{ path: '/status', message: 'Máy chủ không cho chuyển trạng thái này', rule: 'r' }],
    });
    fireEvent.click(button(vi_.statusDoing));
    await waitFor(() => expect(toasts()).toContain('Máy chủ không cho chuyển trạng thái này'));
    expect(button(vi_.statusTodo).getAttribute('aria-pressed')).toBe('true');
    expect(stored(id).status).toBe('todo');
  });

  it("says a move the stage model refuses in the module's words, not the platform's English", async () => {
    const { button, fake, toasts, stored, id } = await open(HOA, 'Xây dựng API đăng nhập');
    fake.server.failNext('PATCH', /\/records\//, 422, {
      type: 'STAGE_TRANSITION_NOT_ALLOWED', title: 'Unprocessable Entity', status: 422,
      detail: "STAGE_TRANSITION_NOT_ALLOWED: the move from todo to doing is limited to: the work's holder",
    });
    fireEvent.click(button(vi_.statusDoing));
    await waitFor(() => expect(toasts()).toContain(vi_.refusedStageMove));
    expect(toasts().some((t) => t.includes("work's holder"))).toBe(false);
    expect(stored(id).status).toBe('todo');
  });

  it('asks before cancelling, and Quay lại leaves the task as it was', async () => {
    const { button, drawer, patches } = await open(HOA, LOGIN_DESIGN);
    fireEvent.click(button(vi_.statusCancelled));
    const confirm = drawer.querySelector('af-confirm') as HTMLElement & { open: boolean; confirmLabel: string; strings: { cancel?: string } };
    await waitFor(() => expect(confirm.open).toBe(true));
    expect(confirm.confirmLabel).toBe(vi_.cancelTask);
    expect(confirm.strings.cancel).toBe(vi_.goBack);
    act(() => { confirm.dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' } })); });
    await waitFor(() => expect(confirm.open).toBe(false));
    expect(patches).toEqual([]);
  });

  it('cancels through the confirm, unblocking and clearing what the move leaves behind', async () => {
    const { button, drawer, patches, stored, id } = await open(HOA, 'Thiết kế luồng thanh toán');
    fireEvent.click(button(vi_.statusCancelled));
    const confirm = drawer.querySelector('af-confirm') as HTMLElement & { open: boolean };
    await waitFor(() => expect(confirm.open).toBe(true));
    act(() => { confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(stored(id).status).toBe('cancelled'));
    expect(patches).toEqual([{ status: 'cancelled', blocked: false }]);
  });
});
