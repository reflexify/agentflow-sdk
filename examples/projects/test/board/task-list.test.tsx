// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { ProjectsError } from '../../src/api/projects-api.js';
import { HOA, LAN, MINH } from '../../src/api/seed.js';
import { formatCount } from '../../src/model/format.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW, toasts } from '../support/render.js';

const vi_ = TEXT.vi;
const here = () => window.location.pathname + window.location.search;
const captions = () => [...document.querySelectorAll('table caption')].map((c) => c.textContent);
const tableOf = (name: string) => [...document.querySelectorAll('table')].find((t) => t.querySelector('caption')?.textContent === name)!;
const titlesIn = (table: HTMLTableElement) => [...table.querySelectorAll('tbody [data-part="title"]')].map((b) => b.textContent);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

function seeded(you = MINH) {
  const fake = createFakeProjects({ you });
  const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
  const task = (title: string) => fake.server.records('task').find((r) => r.body.title === title)!.id;
  return { fake, launch, task };
}

describe('the task list', () => {
  it('groups the way the board does, one table to a group', async () => {
    const { fake, launch } = seeded();
    const view = renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']));
    expect(titlesIn(tableOf('Thiết kế'))).toEqual(['Thiết kế màn hình đăng nhập', 'Thiết kế luồng thanh toán']);
    // Done tasks follow the open ones, newest completion first, as in the board's fold.
    expect(titlesIn(tableOf('Phân tích'))).toEqual(['Viết tài liệu đặc tả', 'Thu thập yêu cầu từ khách hàng']);
    expect(titlesIn(tableOf('Kiểm thử'))).toEqual(['Chuẩn bị tài liệu bàn giao']);
    view.unmount();

    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list&group=status&cancelled=1` });
    await waitFor(() => expect(captions()).toEqual([vi_.statusTodo, vi_.statusDoing, vi_.statusDone, vi_.statusCancelled]));
    expect(titlesIn(tableOf(vi_.statusCancelled))).toEqual(['Viết kịch bản kiểm thử']);
    const heads = [...document.querySelectorAll('.list-group h3')];
    // The fold button is named "Chưa làm, 3": the comma is for screen readers only.
    expect(heads.map((h) => within(h as HTMLElement).getByRole('button').textContent)).toEqual([
      `${vi_.statusTodo}, 3`, `${vi_.statusDoing}, 2`, `${vi_.statusDone}, 2`, `${vi_.statusCancelled}, 1`,
    ]);
    expect(heads[0]!.querySelector('.sr-only')?.textContent).toBe(', ');
  });

  it('formats a group count for the language', () => {
    expect(formatCount(1200, 'vi')).toBe('1.200');
    expect(formatCount(1200, 'en')).toBe('1,200');
  });

  it('has the columns title, primary, status, label, due, priority and checklist, in that order', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    for (const table of document.querySelectorAll('table')) {
      const heads = [...table.querySelectorAll('thead th')];
      expect(heads.map((h) => h.textContent)).toEqual([
        vi_.colTitle, vi_.colPrimary, vi_.colStatus, vi_.colLabel, vi_.colDue, vi_.colPriority, vi_.colChecklist,
      ]);
      for (const h of heads) expect(h.getAttribute('scope')).toBe('col');
    }
  });

  it("fills each cell from the task, the row's title naming it", async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    const row = screen.getByRole('row', { name: /Thiết kế màn hình đăng nhập/ });
    const cells = within(row).getAllByRole('cell');
    expect(within(within(row).getByRole('rowheader')).getByRole('button').textContent).toBe('Thiết kế màn hình đăng nhập');
    expect(within(cells[0]!).getByText('Lê Thị Hoa')).toBeTruthy();
    expect(cells[1]!.textContent).toBe(vi_.statusDoing);
    expect(cells[2]!.textContent).toBe('Chờ duyệt');
    expect(cells[3]!.querySelector('time')?.getAttribute('dateTime')).toBe('2026-10-21');
    expect(cells[3]!.textContent).toBe(vi_.dueToday);
    expect(cells[4]!.textContent).toBe(vi_.priorityHigh);
    expect(within(cells[5]!).getByText('2/5')).toBeTruthy();

    const blocked = screen.getByRole('row', { name: /Thiết kế luồng thanh toán/ });
    const due = within(blocked).getAllByRole('cell')[3]!;
    expect(due.querySelector('time')?.getAttribute('data-overdue')).toBe('true');
    // Overdue is said in words for a screen reader, not only by colour and an icon.
    expect(due.querySelector('time .sr-only')?.textContent).toBe('Quá hạn 2 ngày');
    expect(due.textContent).toBe('19/10Quá hạn 2 ngày');
    expect(within(row).getAllByRole('cell')[3]!.querySelector('.sr-only')).toBeNull();
    expect(within(blocked).getAllByRole('cell')[2]!.textContent).toBe(vi_.blocked);
    expect(within(blocked).getAllByRole('cell')[4]!.textContent).toBe(vi_.priorityUrgent);
  });

  it('opens the drawer of a row on a click anywhere in it, keeping the list behind', async () => {
    const { fake, launch, task } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    fireEvent.click(screen.getByRole('row', { name: /Thiết kế màn hình đăng nhập/ }));
    expect(here()).toBe(`/p/${launch}/t/${task('Thiết kế màn hình đăng nhập')}?view=list`);
    expect(await screen.findByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' })).toBeTruthy();
    expect(document.querySelectorAll('table')).toHaveLength(4);
    await waitFor(() => expect(screen.getByRole('row', { name: /Thiết kế màn hình đăng nhập/ }).getAttribute('data-selected')).toBe('true'));
  });

  it('opens the drawer from the title button, once', async () => {
    const { fake, launch, task } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    const before = window.history.length;
    fireEvent.click(screen.getByRole('button', { name: 'Thiết kế luồng thanh toán' }));
    expect(here()).toBe(`/p/${launch}/t/${task('Thiết kế luồng thanh toán')}?view=list`);
    expect(window.history.length).toBe(before + 1);
  });

  it('has nothing to drag', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    expect(document.querySelector('[aria-roledescription="sortable"]')).toBeNull();
    expect(document.querySelector('[draggable="true"]')).toBeNull();
  });

  it('folds a group away and back', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    const fold = within(document.querySelector('.list-group h3')!.parentElement!).getByRole('button', { expanded: true });
    fireEvent.click(fold);
    expect(fold.getAttribute('aria-expanded')).toBe('false');
    expect(tableOf('Phân tích').closest('[hidden]')).not.toBeNull();
    fireEvent.click(fold);
    expect(tableOf('Phân tích').closest('[hidden]')).toBeNull();
  });

  it('offers Nhận task on a row with no primary owner, and claims it', async () => {
    const { fake, launch, task } = seeded(HOA);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    const row = screen.getByRole('row', { name: /Chuẩn bị tài liệu bàn giao/ });
    fireEvent.click(within(row).getByRole('button', { name: vi_.claim }));
    expect(here()).toBe(`/p/${launch}?view=list`);
    await waitFor(() => expect(fake.server.records('task').find((r) => r.id === task('Chuẩn bị tài liệu bàn giao'))!.body.claimed_by).toBe(HOA));
    await waitFor(() => expect(within(within(screen.getByRole('row', { name: /Chuẩn bị tài liệu bàn giao/ })).getAllByRole('cell')[0]!).getByText('Lê Thị Hoa')).toBeTruthy());
  });
});

describe('claiming from the list', () => {
  const primaryCell = (title: string) => within(screen.getByRole('row', { name: new RegExp(title) })).getAllByRole('cell')[0]!;
  const TITLE = 'Chuẩn bị tài liệu bàn giao';

  it('shows the row taken before the server answers, and claims once on a double press', async () => {
    const { fake, launch } = seeded(HOA);
    let release!: () => void;
    let calls = 0;
    renderProjects(<App />, {
      fake, lang: 'vi', path: `/p/${launch}?view=list`,
      api: (api) => ({ ...api, claim: async (task) => { calls++; await new Promise<void>((r) => { release = r; }); return api.claim(task); } }),
    });
    await waitFor(() => expect(captions()).toHaveLength(4));
    const button = within(primaryCell(TITLE)).getByRole('button', { name: vi_.claim });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(within(primaryCell(TITLE)).getByText('Lê Thị Hoa')).toBeTruthy());
    expect(calls).toBe(1);
    release();
    await waitFor(() => expect(fake.server.records('task').find((r) => r.body.title === TITLE)!.body.claimed_by).toBe(HOA));
  });

  it("puts the row back and says the server's reason when the claim is refused", async () => {
    const { fake, launch } = seeded(HOA);
    renderProjects(<App />, {
      fake, lang: 'vi', path: `/p/${launch}?view=list`,
      api: (api) => ({ ...api, claim: () => Promise.reject(new ProjectsError('refused', 422, 'VALIDATION_ERROR', 'Task này đã có người nhận')) }),
    });
    await waitFor(() => expect(captions()).toHaveLength(4));
    fireEvent.click(within(primaryCell(TITLE)).getByRole('button', { name: vi_.claim }));
    await waitFor(() => expect(toasts()).toContain('Task này đã có người nhận'));
    expect(within(primaryCell(TITLE)).getByRole('button', { name: vi_.claim })).toBeTruthy();
  });

  it('locks Nhận task with the reason for someone who is not in the project', async () => {
    const fake = createFakeProjects({ you: LAN });
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}?view=list` });
    await waitFor(() => expect(captions()).toHaveLength(4));
    const button = within(primaryCell(TITLE)).getByRole('button', { name: vi_.claim });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    const reason = button.getAttribute('aria-describedby')!;
    expect(document.getElementById(reason)?.textContent).toBe(vi_.onlyMembersClaim);
  });
});

describe('the Tasks tab', () => {
  it('shows Chưa có task with Tạo task in a project with no tasks, in both views', async () => {
    const fake = createFakeProjects({ you: MINH });
    const empty = fake.server.write('project', null, { name: 'Dự án trống', managers: [MINH], members: [], status: 'active', default_group_by: 'status' }, MINH).id;
    const view = renderProjects(<App />, { fake, lang: 'vi', path: `/p/${empty}?view=list` });
    const state = (await screen.findByText(vi_.noTasks)).closest('.state') as HTMLElement;
    expect(within(state).getByRole('button', { name: vi_.createTask })).toBeTruthy();
    expect(document.querySelector('table')).toBeNull();
    view.unmount();

    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${empty}` });
    expect(await screen.findByText(vi_.noTasks)).toBeTruthy();
    expect(vi_.noTasks).toBe('Chưa có task');
    expect(TEXT.en.noTasks).toBe('No tasks yet');
  });

  it('says no task matches when every task is left out by the done window, and Chưa có task once the window shows them', async () => {
    const fake = createFakeProjects({ you: MINH });
    const project = fake.server.write('project', null, { name: 'Đã xong cả', managers: [MINH], members: [], status: 'active', default_group_by: 'status' }, MINH).id;
    fake.server.write('task', null, { title: 'Việc cũ', project, status: 'done', position: 1024, completed_at: '2026-08-01T00:00:00Z' }, MINH);
    await fake.server.drain();
    const view = renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project}?view=list` });
    expect(await screen.findByText(vi_.noTasksMatch)).toBeTruthy();
    expect(screen.queryByText(vi_.noTasks)).toBeNull();
    expect(vi_.noTasksMatch).toBe('Không có task nào khớp bộ lọc');
    expect(TEXT.en.noTasksMatch).toBe('No tasks match these filters');
    view.unmount();

    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project}?view=list&done=all` });
    await waitFor(() => expect(captions()).toContain(vi_.statusDone));
    expect(titlesIn(tableOf(vi_.statusDone))).toEqual(['Việc cũ']);
  });

  it('shows the column skeleton under the toolbar while the board loads', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}`, api: (api) => ({ ...api, boardTasks: () => new Promise(() => {}) }) });
    const tabs = await screen.findByRole('tablist', { name: vi_.viewSwitch });
    const skeleton = document.querySelector('.tasks-tab .state.loading') as HTMLElement;
    expect(skeleton.getAttribute('data-kind')).toBe('columns');
    expect(tabs.compareDocumentPosition(skeleton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the read failure with Thử lại, and reads again', async () => {
    const { fake, launch } = seeded();
    let fail = true;
    renderProjects(<App />, {
      fake, lang: 'vi', path: `/p/${launch}?view=list`,
      api: (api) => ({ ...api, boardTasks: (scope) => (fail ? Promise.reject(new Error('down')) : api.boardTasks(scope)) }),
    });
    const alert = await screen.findByRole('alert');
    fail = false;
    fireEvent.click(within(alert).getByRole('button', { name: vi_.retry }));
    await waitFor(() => expect(captions()).toHaveLength(4));
  });
});
