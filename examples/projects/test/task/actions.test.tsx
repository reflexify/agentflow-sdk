// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import type { ProjectsApi, TaskChanges } from '../../src/api/projects-api.js';
import { createSeed, HOA, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { LAUNCH, LOGIN_DESIGN } from './support.js';

const vi_ = TEXT.vi;
const BLOCKED = 'Thiết kế luồng thanh toán';
const CANCELLED = 'Viết kịch bản kiểm thử';
const DONE = 'Thu thập yêu cầu từ khách hàng';
const LE_MINH = '00000000-0000-4000-8000-000000000077';
const ORIGIN_TASK = '40000000-0000-4000-8000-000000000077';

type Confirm = HTMLElement & { open: boolean; heading: string; message: string; confirmLabel: string; danger: boolean; busy: boolean; strings: { cancel?: string } };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });

async function open(you: string, title: string, opts: {
  prepare?: (fake: ReturnType<typeof createFakeProjects>, id: string) => void;
  seed?: ReturnType<typeof createSeed>;
  path?: (launch: string, id: string) => string;
} = {}) {
  const fake = createFakeProjects({ you, ...(opts.seed ? { seed: opts.seed } : {}) });
  const launch = fake.server.records('project').find((r) => r.body.name === LAUNCH)!.id;
  const id = fake.server.records('task').find((r) => r.body.title === title)!.id;
  opts.prepare?.(fake, id);
  const patches: TaskChanges[] = [];
  const deletes: string[] = [];
  const api = (a: ProjectsApi): ProjectsApi => ({
    ...a,
    updateTask: (task, changes) => {
      patches.push(changes);
      return a.updateTask(task, changes);
    },
    deleteTask: (task) => {
      deletes.push(task.id);
      return a.deleteTask(task);
    },
  });
  const stored = () => fake.server.records('task').find((r) => r.id === id)?.body;
  const view = renderProjects(<App />, { fake, lang: 'vi', path: opts.path ? opts.path(launch, id) : `/p/${launch}/t/${id}`, api });
  const drawer = await screen.findByRole('dialog', { name: title });
  const actions = () => drawer.querySelector<HTMLElement>('[data-part="actions"]');
  const action = (name: string) => (actions() ? within(actions()!).queryByRole('button', { name }) : null);
  const openConfirm = () => [...actions()!.querySelectorAll<Confirm>('af-confirm')].find((c) => c.open) ?? null;
  return { ...view, fake, id, launch, drawer, actions, action, openConfirm, stored, patches, deletes };
}

describe('the drawer actions', () => {
  it('cancels a task for its primary after a confirm, clearing what the move leaves behind', async () => {
    const { action, openConfirm, patches, stored } = await open(HOA, BLOCKED);
    fireEvent.click(action(vi_.cancelTask)!);
    const confirm = await waitFor(() => {
      const c = openConfirm();
      expect(c).not.toBeNull();
      return c!;
    });
    expect(confirm.heading).toBe(vi_.cancelTaskHeading);
    expect(confirm.confirmLabel).toBe(vi_.cancelTask);
    expect(confirm.danger).toBe(false);
    expect(confirm.strings.cancel).toBe(vi_.goBack);
    act(() => { confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(stored()!.status).toBe('cancelled'));
    expect(patches).toEqual([{ status: 'cancelled', blocked: false }]);
  });

  it('offers Huỷ task to a manager too, and Quay lại writes nothing', async () => {
    const { action, openConfirm, patches } = await open(MINH, LOGIN_DESIGN);
    fireEvent.click(action(vi_.cancelTask)!);
    const confirm = await waitFor(() => openConfirm()!);
    act(() => { confirm.dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' } })); });
    await waitFor(() => expect(openConfirm()).toBeNull());
    await settle();
    expect(patches).toEqual([]);
  });

  it('restores a cancelled task to Chưa làm for a manager, with no confirm', async () => {
    const { action, openConfirm, patches, stored } = await open(MINH, CANCELLED);
    expect(action(vi_.cancelTask)).toBeNull();
    fireEvent.click(action(vi_.restoreTask)!);
    expect(openConfirm()).toBeNull();
    await waitFor(() => expect(stored()!.status).toBe('todo'));
    expect(patches).toEqual([{ status: 'todo' }]);
  });

  it('locks Khôi phục for the primary of a cancelled task, saying only managers may', async () => {
    const { action, actions, stored, patches } = await open(HOA, CANCELLED, {
      prepare: (fake, id) => { fake.server.write('task', id, { ...fake.server.records('task').find((r) => r.id === id)!.body, claimed_by: HOA }, MINH); },
    });
    expect(stored()!.claimed_by).toBe(HOA);
    const restore = action(vi_.restoreTask)!;
    expect(restore.getAttribute('aria-disabled')).toBe('true');
    expect(actions()!.querySelector(`[id="${restore.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.onlyManagers);
    fireEvent.click(restore);
    await settle();
    expect(patches).toEqual([]);
    expect(stored()!.status).toBe('cancelled');
  });

  it('reopens a done task to Đang làm for a manager, and locks Mở lại for anyone else', async () => {
    const manager = await open(MINH, DONE);
    fireEvent.click(manager.action(vi_.reopenTask)!);
    await waitFor(() => expect(manager.stored()!.status).toBe('doing'));
    expect(manager.patches).toEqual([{ status: 'doing' }]);
    manager.unmount();

    const member = await open(HOA, 'Viết tài liệu đặc tả');
    const reopen = member.action(vi_.reopenTask)!;
    expect(reopen.getAttribute('aria-disabled')).toBe('true');
    expect(member.actions()!.querySelector(`[id="${reopen.getAttribute('aria-describedby')}"]`)?.textContent).toBe(vi_.onlyManagers);
    expect(member.action(vi_.deleteTask)).toBeNull();
  });

  it('deletes for a manager after a danger confirm, closes the drawer and says so', async () => {
    const { action, openConfirm, stored, drawer, launch, toasts, deletes, id } = await open(MINH, LOGIN_DESIGN);
    fireEvent.click(action(vi_.deleteTask)!);
    const confirm = await waitFor(() => openConfirm()!);
    expect(confirm.heading).toBe(vi_.deleteTaskHeading);
    expect(confirm.message).toBe(vi_.deleteTaskMessage);
    expect(confirm.confirmLabel).toBe(vi_.confirmDeleteTask);
    expect(confirm.danger).toBe(true);
    expect(confirm.strings.cancel).toBe(vi_.goBack);
    act(() => { confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} })); });
    await waitFor(() => expect(stored()).toBeUndefined());
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    expect(window.location.pathname).toBe(`/p/${launch}`);
    await waitFor(() => expect(toasts()).toContain(vi_.taskDeleted));
    expect(toasts()).not.toContain(vi_.taskGone);
    expect(deletes).toEqual([id]);
  });

  it('deletes once however many times the confirm is pressed', async () => {
    const { action, openConfirm, stored, deletes, id } = await open(MINH, LOGIN_DESIGN);
    fireEvent.click(action(vi_.deleteTask)!);
    const confirm = await waitFor(() => openConfirm()!);
    act(() => {
      confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} }));
      confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} }));
      confirm.dispatchEvent(new CustomEvent('confirm', { detail: {} }));
    });
    await waitFor(() => expect(stored()).toBeUndefined());
    await settle();
    expect(deletes).toEqual([id]);
  });

  it('shows Xoá to managers only', async () => {
    const { action } = await open(HOA, LOGIN_DESIGN);
    expect(action(vi_.cancelTask)).not.toBeNull();
    expect(action(vi_.deleteTask)).toBeNull();
  });

  it('says who created the task, when, and from where', async () => {
    const seed = createSeed(TEST_NOW);
    seed.people.push({ id: LE_MINH, name: 'Lê Minh', email: null });
    seed.groups.users.push(LE_MINH);
    const launch = seed.records.project!.find((r) => r.body.name === LAUNCH)!.id;
    seed.records.task!.push({
      id: ORIGIN_TASK, body: { title: 'Rà soát hợp đồng', project: launch, status: 'todo', origin: 'manual' },
      createdBy: LE_MINH, createdAt: '2026-10-01T02:00:00Z',
    });
    const { drawer } = await open(MINH, 'Rà soát hợp đồng', { seed });
    expect(drawer.querySelector('[data-part="origin"]')!.textContent).toBe('Tạo bởi Lê Minh lúc 01/10/2026 09:00 · qua Thủ công');
    expect(drawer.querySelector('[data-part="origin"] time')!.getAttribute('datetime')).toBe('2026-10-01T02:00:00Z');
  });

  it("links to the task's project from the crumb, a real link a plain click follows inside the module", async () => {
    const { drawer, launch } = await open(HOA, LOGIN_DESIGN, { path: (_, id) => `/mine/t/${id}` });
    const crumb = drawer.querySelector<HTMLElement>('.drawer-crumb')!;
    const link = await within(crumb).findByRole('link', { name: LAUNCH });
    expect(link.getAttribute('href')).toBe(`/p/${launch}`);
    expect(within(drawer).queryByRole('button', { name: /project/i })).toBeNull();
    fireEvent.click(link);
    await waitFor(() => expect(window.location.pathname).toBe(`/p/${launch}`));
  });
});
