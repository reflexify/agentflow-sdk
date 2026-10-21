// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { ProjectsError } from '../../src/api/projects-api.js';
import { HOA, KHOA, LAN, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';

const vi_ = TEXT.vi;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

function seeded(you: string) {
  const fake = createFakeProjects({ you });
  const project = (name: string) => fake.server.records('project').find((r) => r.body.name === name)!.id;
  const task = (title: string) => fake.server.records('task').find((r) => r.body.title === title)!.id;
  return { fake, project, task };
}

const crumbs = () => screen.getByRole('navigation').textContent;
const LAUNCH = 'Ra mắt ứng dụng';

describe('the shell', () => {
  it('shows the breadcrumb on a project page', async () => {
    const { fake, project } = seeded(MINH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project(LAUNCH)}` });
    await waitFor(() => expect(crumbs()).toBe(`${vi_.breadcrumbProjects} › ${LAUNCH}`));
  });

  it('shows the same Không tìm thấy for a project that does not exist and one the viewer cannot read, naming neither', async () => {
    const own = seeded(MINH);
    renderProjects(<App />, { fake: own.fake, lang: 'vi', path: '/p/00000000-0000-4000-8000-000000009999' });
    expect(await screen.findByText(vi_.notFound)).toBeTruthy();
    expect(document.body.textContent).not.toContain(LAUNCH);
  });

  it('never names a project or task to someone outside it', async () => {
    const outside = seeded(KHOA);
    const launch = outside.project(LAUNCH);
    const title = 'Thiết kế màn hình đăng nhập';
    for (const path of [`/p/${launch}`, `/t/${outside.task(title)}`, `/p/${launch}/t/${outside.task(title)}`]) {
      const view = renderProjects(<App />, { fake: outside.fake, lang: 'vi', path });
      expect(await screen.findByText(vi_.notFound)).toBeTruthy();
      expect(screen.getAllByText(vi_.notFound)).toHaveLength(1);
      expect(document.body.textContent).not.toContain(LAUNCH);
      expect(document.body.textContent).not.toContain(title);
      view.unmount();
    }
  });

  it('opens /t/<task> over the task\'s project once the task has loaded', async () => {
    const { fake, task } = seeded(MINH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/t/${task('Thiết kế màn hình đăng nhập')}` });
    expect(await screen.findByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' })).toBeTruthy();
    expect(document.querySelector('[data-screen="project"]')).not.toBeNull();
    await waitFor(() => expect(crumbs()).toBe(`${vi_.breadcrumbProjects} › ${LAUNCH}`));
  });

  it('keeps My Work behind a drawer opened from it, and closing the drawer goes back to /', async () => {
    const { fake, task } = seeded(HOA);
    renderProjects(<App />, { fake, lang: 'vi', path: `/mine/t/${task('Thiết kế màn hình đăng nhập')}` });
    const drawer = await screen.findByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    const behind = document.querySelector('[data-screen="mywork"]');
    expect(behind).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: vi_.close }));
    expect(window.location.pathname).toBe('/');
    await waitFor(() => expect(drawer.isConnected).toBe(false));
    expect(document.querySelector('[data-screen="mywork"]')).toBe(behind);
  });

  it('says so while offline', async () => {
    const { fake } = seeded(MINH);
    const { live } = renderProjects(<App />, { fake, lang: 'vi' });
    await screen.findByRole('navigation');
    expect(screen.queryByText(vi_.offlineBanner)).toBeNull();
    act(() => live.setStatus('offline'));
    expect(await screen.findByText(vi_.offlineBanner)).toBeTruthy();
    act(() => live.setStatus('live'));
    await waitFor(() => expect(screen.queryByText(vi_.offlineBanner)).toBeNull());
  });

  it('shows a project list that fails to load with its reason and Thử lại, which loads it again', async () => {
    const { fake } = seeded(MINH);
    let calls = 0;
    renderProjects(<App />, {
      fake, lang: 'vi', path: '/projects',
      api: (api) => ({
        ...api,
        projects: (statuses) => (++calls === 1 ? Promise.reject(new ProjectsError('failed', 500, 'INTERNAL', 'Máy chủ đang bận')) : api.projects(statuses)),
      }),
    });
    expect(await screen.findByText('Máy chủ đang bận')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: vi_.retry }));
    expect(await screen.findByText(LAUNCH)).toBeTruthy();
    expect(calls).toBe(2);
  });
});

describe('a closed project', () => {
  const closedBanner = () => waitFor(() => {
    const el = document.querySelector<HTMLElement>('.closed-banner');
    expect(el).toBeTruthy();
    return el!;
  });
  const lockedReason = (button: HTMLElement) => {
    hoverTooltips();
    return (button.closest('af-tooltip') as (HTMLElement & { text: string }) | null)?.text;
  };

  it('tells its manager it is read only and offers Mở lại, and locks Tạo task', async () => {
    const { fake, project } = seeded(MINH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project('Kế hoạch quý 3')}` });
    const banner = await closedBanner();
    expect(within(banner).getByText(vi_.closedReadOnly)).toBeTruthy();
    expect(within(banner).getByRole('button', { name: vi_.reopenProject })).toBeTruthy();
    expect(screen.getByText(vi_.projectClosed)).toBeTruthy();
    const create = screen.getByRole('button', { name: vi_.createTask });
    expect(create.getAttribute('aria-disabled')).toBe('true');
    expect(lockedReason(create)).toBe(vi_.projectClosedLocked);
    // The kit's tooltip cannot describe a slotted button, so the reason sits beside it for a screen reader.
    expect(document.getElementById(create.getAttribute('aria-describedby')!)?.textContent).toBe(vi_.projectClosedLocked);
  });

  it('gives a member no reopen button', async () => {
    const { fake, project } = seeded(HOA);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project('Kế hoạch quý 3')}` });
    const banner = await closedBanner();
    expect(within(banner).getByText(vi_.closedReadOnly)).toBeTruthy();
    expect(within(banner).queryByRole('button', { name: vi_.reopenProject })).toBeNull();
  });

  it('says so inside the drawer of one of its tasks, opened from My Work', async () => {
    const { fake, task } = seeded(HOA);
    renderProjects(<App />, { fake, lang: 'vi', path: `/mine/t/${task('Báo cáo ngân sách quý 3')}` });
    const drawer = await screen.findByRole('dialog', { name: 'Báo cáo ngân sách quý 3' });
    expect(await within(drawer).findByText(vi_.closedReadOnly, { selector: '.closed-banner strong' })).toBeTruthy();
    expect(within(drawer).queryByRole('button', { name: vi_.reopenProject })).toBeNull();
  });

  it('says so inside the drawer over its own page too, with Mở lại for its manager', async () => {
    const { fake, project, task } = seeded(MINH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project('Kế hoạch quý 3')}/t/${task('Báo cáo ngân sách quý 3')}` });
    const drawer = await screen.findByRole('dialog', { name: 'Báo cáo ngân sách quý 3' });
    expect(await within(drawer).findByText(vi_.closedReadOnly, { selector: '.closed-banner strong' })).toBeTruthy();
    expect(within(drawer).getByRole('button', { name: vi_.reopenProject })).toBeTruthy();
  });

  it('shows no closed banner in the drawer of an open project\'s task', async () => {
    const { fake, task } = seeded(HOA);
    renderProjects(<App />, { fake, lang: 'vi', path: `/mine/t/${task('Thiết kế màn hình đăng nhập')}` });
    await screen.findByRole('dialog', { name: 'Thiết kế màn hình đăng nhập' });
    // Long enough for the drawer's project read, which the memory server answers at once.
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    expect(screen.queryByText(vi_.closedReadOnly)).toBeNull();
  });

  it('shows a paused project\'s status and lets a member create a task', async () => {
    const { fake, project } = seeded(MINH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${project('Nâng cấp kho')}` });
    expect(await screen.findByText(vi_.projectPaused)).toBeTruthy();
    expect(screen.getByRole('button', { name: vi_.createTask }).getAttribute('aria-disabled')).not.toBe('true');
    expect(screen.queryByText(vi_.closedReadOnly)).toBeNull();
  });
});

describe('a project\'s tabs', () => {
  const tabs = () => screen.getByRole('tablist', { name: vi_.projectTabs });
  const tab = (name: string) => within(tabs()).getByRole('tab', { name });

  it('shows Task and Thành viên as af-tabs, selected by the route', async () => {
    const { fake, project } = seeded(MINH);
    const id = project(LAUNCH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${id}` });
    await screen.findByRole('tablist', { name: vi_.projectTabs });
    expect(tabs().classList.contains('af-tabs')).toBe(true);
    expect(within(tabs()).getAllByRole('tab').map((t) => t.textContent)).toEqual([vi_.tabTasks, vi_.tabMembers]);
    expect(tab(vi_.tabTasks).getAttribute('aria-selected')).toBe('true');
    expect(tab(vi_.tabMembers).getAttribute('aria-selected')).toBe('false');
    expect(tab(vi_.tabMembers).tabIndex).toBe(-1);

    fireEvent.click(tab(vi_.tabMembers));
    expect(window.location.pathname).toBe(`/p/${id}/members`);
    await waitFor(() => expect(tab(vi_.tabMembers).getAttribute('aria-selected')).toBe('true'));
    expect(tab(vi_.tabTasks).getAttribute('aria-selected')).toBe('false');
    expect(document.querySelector('.tasks-tab')).toBeNull();

    fireEvent.click(tab(vi_.tabTasks));
    expect(window.location.pathname).toBe(`/p/${id}`);
    await waitFor(() => expect(document.querySelector('.tasks-tab')).not.toBeNull());
  });

  it('moves between the tabs with the arrow keys, Home and End, as the view tabs do', async () => {
    const { fake, project } = seeded(MINH);
    const id = project(LAUNCH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${id}` });
    await screen.findByRole('tablist', { name: vi_.projectTabs });
    tab(vi_.tabTasks).focus();
    fireEvent.keyDown(tab(vi_.tabTasks), { key: 'ArrowRight' });
    expect(window.location.pathname).toBe(`/p/${id}/members`);
    expect(document.activeElement).toBe(tab(vi_.tabMembers));
    fireEvent.keyDown(tab(vi_.tabMembers), { key: 'ArrowRight' });
    expect(window.location.pathname).toBe(`/p/${id}`);
    expect(document.activeElement).toBe(tab(vi_.tabTasks));
    fireEvent.keyDown(tab(vi_.tabTasks), { key: 'End' });
    expect(window.location.pathname).toBe(`/p/${id}/members`);
    fireEvent.keyDown(tab(vi_.tabMembers), { key: 'Home' });
    expect(window.location.pathname).toBe(`/p/${id}`);
    fireEvent.keyDown(tab(vi_.tabTasks), { key: 'ArrowLeft' });
    expect(window.location.pathname).toBe(`/p/${id}/members`);
  });

  it('opens the Members tab from its address, and leaves the Tasks tab\'s query behind', async () => {
    const { fake, project } = seeded(MINH);
    const id = project(LAUNCH);
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${id}/members?view=list` });
    await waitFor(() => expect(tab(vi_.tabMembers).getAttribute('aria-selected')).toBe('true'));
    expect(screen.queryByRole('tablist', { name: vi_.viewSwitch })).toBeNull();
  });

  it('opens the label settings at /settings/labels', async () => {
    const { fake } = seeded(LAN);
    renderProjects(<App />, { fake, lang: 'vi', path: '/settings/labels' });
    await waitFor(() => expect(document.querySelector('[data-screen="labels"]')).not.toBeNull());
    expect(crumbs()).toBe(`${vi_.breadcrumbProjects} › ${vi_.labelSettings}`);
  });
});
