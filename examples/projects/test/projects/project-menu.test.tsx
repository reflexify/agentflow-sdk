// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import type { ProjectChanges } from '../../src/model/types.js';
import { HOA, LAN, MAI, MINH } from '../../src/api/seed.js';
import type { MenuItem } from '../../src/kit/elements.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { TEST_NOW, renderProjects } from '../support/render.js';
import { seeded } from '../task/support.js';

const vi_ = TEXT.vi;
const LAUNCH = 'Ra mắt ứng dụng';
const Q3 = 'Kế hoạch quý 3';
const WAREHOUSE = 'Nâng cấp kho';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type MenuEl = HTMLElement & { items: MenuItem[]; label: string };
type ConfirmEl = HTMLElement & { open: boolean; heading: string; message: string; confirmLabel: string; strings: { cancel?: string } | null };

const menu = () => document.querySelector<MenuEl>('header af-menu');
const choose = (id: string) => act(() => { menu()!.dispatchEvent(new CustomEvent('select', { detail: { id }, bubbles: true })); });
const labels = () => menu()!.items.map((i) => i.label);
const confirm = () => document.querySelector<ConfirmEl>('header af-confirm')!;

/** The page of `name` as `you`, with every project patch recorded. */
async function open(you: string, name: string, opts: { menu?: boolean } = {}) {
  const s = seeded(you);
  const patches: ProjectChanges[] = [];
  const view = renderProjects(<App />, {
    fake: s.fake, lang: 'vi', path: `/p/${s.project(name)}`,
    api: (api: ProjectsApi) => ({ ...api, updateProject: (project, changes) => { patches.push(changes); return api.updateProject(project, changes); } }),
  });
  await waitFor(() => expect(document.querySelector('header')?.textContent).toContain(name));
  if (opts.menu !== false) await waitFor(() => expect(menu()).not.toBeNull());
  const stored = () => s.fake.server.records('project').find((r) => r.id === s.project(name))!.body;
  return { ...s, ...view, patches, stored };
}

describe('the project menu', () => {
  it("offers a manager of an active project Chỉnh sửa project, Tạm dừng and Đóng project, all open", async () => {
    await open(MINH, LAUNCH);
    expect(labels()).toEqual([vi_.editProject, vi_.pauseProject, vi_.closeProject]);
    expect(menu()!.items.every((i) => !i.disabled)).toBe(true);
    expect(menu()!.label).toBe(vi_.projectMenu);
  });

  it('offers a paused project Tiếp tục and Đóng project beside Chỉnh sửa project', async () => {
    await open(MAI, WAREHOUSE);
    expect(labels()).toEqual([vi_.editProject, vi_.resumeProject, vi_.closeProject]);
  });

  it('offers a closed project Mở lại only', async () => {
    await open(MINH, Q3);
    expect(labels()).toEqual([vi_.reopenProject]);
    expect(menu()!.items[0]!.disabled).toBeFalsy();
  });

  it('lets a project admin who does not manage the project move it, and locks Chỉnh sửa project for managers', async () => {
    await open(LAN, LAUNCH);
    const [edit, pause, close] = menu()!.items;
    expect(edit).toMatchObject({ label: vi_.editProject, disabled: true, reason: vi_.onlyManagers });
    expect(pause!.disabled).toBeFalsy();
    expect(close!.disabled).toBeFalsy();
  });

  it('lets that admin reopen a closed project', async () => {
    const { stored } = await open(LAN, Q3);
    expect(labels()).toEqual([vi_.reopenProject]);
    choose('reopen');
    await waitFor(() => expect(stored().status).toBe('active'));
  });

  it('is not shown to a member', async () => {
    await open(HOA, LAUNCH, { menu: false });
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(menu()).toBeNull();
    expect(screen.queryByRole('button', { name: vi_.projectMenu })).toBeNull();
  });

  it('is not shown away from a project page', async () => {
    renderProjects(<App />, { lang: 'vi', path: '/projects', you: MINH });
    await screen.findByText(LAUNCH);
    expect(menu()).toBeNull();
  });

  it('pauses a project and resumes it, showing the paused badge in between, without a toast', async () => {
    const { stored, patches, toasts } = await open(MINH, LAUNCH);
    choose('pause');
    await waitFor(() => expect(stored().status).toBe('paused'));
    expect(await screen.findByText(vi_.projectPaused)).toBeTruthy();
    await waitFor(() => expect(labels()).toEqual([vi_.editProject, vi_.resumeProject, vi_.closeProject]));
    choose('resume');
    await waitFor(() => expect(stored().status).toBe('active'));
    await waitFor(() => expect(screen.queryByText(vi_.projectPaused)).toBeNull());
    expect(patches).toEqual([{ status: 'paused' }, { status: 'active' }]);
    expect(toasts()).toEqual([]);
  });

  it('asks before closing, and Quay lại writes nothing', async () => {
    const { patches } = await open(MINH, LAUNCH);
    choose('close');
    await waitFor(() => expect(confirm().open).toBe(true));
    expect(confirm()).toMatchObject({ heading: vi_.closeProject, message: vi_.closeProjectConfirm, confirmLabel: vi_.closeProject });
    expect(confirm().strings).toMatchObject({ cancel: vi_.goBack });
    act(() => { confirm().dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' } })); });
    await waitFor(() => expect(confirm().open).toBe(false));
    expect(patches).toEqual([]);
  });

  it('closes a project once confirmed: the closed banner shows and every write locks', async () => {
    const { stored, patches, toasts } = await open(MINH, LAUNCH);
    choose('close');
    await waitFor(() => expect(confirm().open).toBe(true));
    expect(patches).toEqual([]);
    act(() => { confirm().dispatchEvent(new CustomEvent('confirm')); });
    await waitFor(() => expect(stored().status).toBe('closed'));
    expect(patches).toEqual([{ status: 'closed' }]);
    const banner = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('.closed-banner');
      expect(el).toBeTruthy();
      return el!;
    });
    expect(within(banner).getByText(vi_.closedReadOnly)).toBeTruthy();
    await waitFor(() => expect(confirm().open).toBe(false));
    const create = screen.getByRole('button', { name: vi_.createTask });
    expect(create.getAttribute('aria-disabled')).toBe('true');
    expect(labels()).toEqual([vi_.reopenProject]);
    expect(toasts()).toEqual([]);
  });

  it('reopens a closed project from the menu', async () => {
    const { stored } = await open(MINH, Q3);
    choose('reopen');
    await waitFor(() => expect(stored().status).toBe('active'));
    await waitFor(() => expect(document.querySelector('.closed-banner')).toBeNull());
    expect(labels()).toEqual([vi_.editProject, vi_.pauseProject, vi_.closeProject]);
  });

  it("shows the server's reason in a toast when it refuses a move, and leaves the project as it was", async () => {
    const { fake, toasts, stored } = await open(MINH, LAUNCH);
    fake.server.failNext('PATCH', /\/records\//, 422, {
      type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Unprocessable Entity', status: 422, detail: 'refused',
      field_errors: [{ path: '/status', message: 'Còn task đang làm dở', rule: 'r' }],
    });
    choose('pause');
    await waitFor(() => expect(toasts()).toContain('Còn task đang làm dở'));
    expect(stored().status).toBe('active');
    expect(screen.queryByText(vi_.projectPaused)).toBeNull();
    expect(labels()).toEqual([vi_.editProject, vi_.pauseProject, vi_.closeProject]);
  });

  it('keeps a refused close from leaving the project closed, and says why', async () => {
    const { fake, toasts, stored } = await open(MINH, LAUNCH);
    fake.server.failNext('PATCH', /\/records\//, 422, {
      type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Unprocessable Entity', status: 422, detail: 'refused',
      field_errors: [{ path: '/status', message: 'Còn task chưa xong', rule: 'r' }],
    });
    choose('close');
    await waitFor(() => expect(confirm().open).toBe(true));
    act(() => { confirm().dispatchEvent(new CustomEvent('confirm')); });
    await waitFor(() => expect(toasts()).toContain('Còn task chưa xong'));
    expect(stored().status).toBe('active');
    await waitFor(() => expect(confirm().open).toBe(false));
    expect(document.querySelector('.closed-banner')).toBeNull();
  });

  it('says a stale move in a toast and reads the project again', async () => {
    const { fake, toasts, stored, project } = await open(MINH, LAUNCH);
    fake.server.write('project', project(LAUNCH), { ...stored(), description: 'Mô tả mới' }, MAI, { notify: false });
    choose('pause');
    await waitFor(() => expect(toasts()).toContain(vi_.projectStale));
    expect(stored().status).toBe('active');
  });

  it('opens Chỉnh sửa project as a drawer on the right', async () => {
    await open(MINH, LAUNCH);
    choose('edit');
    const drawer = await screen.findByRole('dialog', { name: vi_.editProject });
    expect(drawer.classList.contains('drawer')).toBe(true);
    expect(fireEvent.click(within(drawer).getByRole('button', { name: vi_.close }))).toBe(true);
    await waitFor(() => expect(drawer.isConnected).toBe(false));
  });
});
