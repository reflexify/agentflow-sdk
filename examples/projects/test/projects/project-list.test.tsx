// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { createSeed, HOA, KHOA, LAN, MAI, MINH, PEOPLE } from '../../src/api/seed.js';
import { ProjectList } from '../../src/projects/ProjectList.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';

const vi_ = TEXT.vi;
const LAUNCH = 'Ra mắt ứng dụng';
const WAREHOUSE = 'Nâng cấp kho';
const OFFICE = 'Văn phòng';
const CLOSED = 'Kế hoạch quý 3';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

function show(you: string) {
  const fake = createFakeProjects({ you });
  const view = renderProjects(<ProjectList onCreate={vi.fn()} />, { fake, lang: 'vi', path: '/projects' });
  const record = (name: string) => fake.server.records('project').find((r) => r.body.name === name)!;
  const card = async (name: string) => (await screen.findByText(name)).closest('article') as HTMLElement;
  return { fake, view, record, card };
}

describe('the project list', () => {
  it('shows a project with its status, its managers and the counts the rollups hold', async () => {
    const { record, card } = show(MINH);
    const launch = within(await card(LAUNCH));
    expect(launch.getByText(vi_.projectActive)).toBeTruthy();
    const minh = PEOPLE.find((p) => p.id === MINH)!;
    expect(launch.getByTitle(minh.name).textContent).toBe('TM');
    const body = record(LAUNCH).body;
    expect(Number(body.tasks_todo) + Number(body.tasks_doing) + Number(body.tasks_done)).toBeGreaterThan(0);
    for (const [label, rollup] of [[vi_.statusTodo, 'tasks_todo'], [vi_.statusDoing, 'tasks_doing'], [vi_.statusDone, 'tasks_done']] as const) {
      const count = launch.getByText(label).closest('.project-count')!;
      expect(count.querySelector('dd')!.textContent).toBe(String(body[rollup] ?? 0));
    }
  });

  it('lists the running and paused projects by default, and a closed one once the filter adds it', async () => {
    const { card } = show(MINH);
    await card(LAUNCH);
    const filter = screen.getByRole('group', { name: vi_.projectStatusFilter });
    const chips = within(filter).getAllByRole('button').map((b) => [b.textContent, b.getAttribute('aria-pressed')]);
    expect(chips).toEqual([[vi_.projectActive, 'true'], [vi_.projectPaused, 'true'], [vi_.projectClosed, 'false']]);
    expect(screen.getByText(WAREHOUSE)).toBeTruthy();
    expect(screen.queryByText(CLOSED)).toBeNull();

    fireEvent.click(within(filter).getByRole('button', { name: vi_.projectClosed }));
    const closed = within(await card(CLOSED));
    expect(closed.getByText(vi_.projectClosed)).toBeTruthy();
    expect(screen.getByText(LAUNCH)).toBeTruthy();
  });

  it('narrows to one status, and keeps the last one chosen', async () => {
    const { card } = show(MINH);
    await card(LAUNCH);
    const filter = screen.getByRole('group', { name: vi_.projectStatusFilter });
    fireEvent.click(within(filter).getByRole('button', { name: vi_.projectPaused }));
    await waitFor(() => expect(screen.queryByText(WAREHOUSE)).toBeNull());
    expect(await screen.findByText(LAUNCH)).toBeTruthy();
    fireEvent.click(within(filter).getByRole('button', { name: vi_.projectActive }));
    expect(within(filter).getByRole('button', { name: vi_.projectActive }).getAttribute('aria-pressed')).toBe('true');
  });

  it('lists every project to a project admin who is in none', async () => {
    const { card } = show(LAN);
    await card(LAUNCH);
    for (const name of [LAUNCH, OFFICE, WAREHOUSE]) expect(screen.getByText(name)).toBeTruthy();
  });

  it('says so to someone who is in no project', async () => {
    show(KHOA);
    expect(await screen.findByText(vi_.noProjects)).toBeTruthy();
    expect(document.querySelector('article')).toBeNull();
  });

  it('does not tell a member whose only project is closed that they are in none', async () => {
    const seed = createSeed(TEST_NOW);
    seed.records.project = seed.records.project!.filter((p) => p.body.status === 'closed');
    const fake = createFakeProjects({ you: HOA, seed });
    renderProjects(<ProjectList onCreate={vi.fn()} />, { fake, lang: 'vi', path: '/projects' });
    expect(await screen.findByText(vi_.noProjectsMatch)).toBeTruthy();
    expect(screen.queryByText(vi_.noProjects)).toBeNull();
    fireEvent.click(within(screen.getByRole('group', { name: vi_.projectStatusFilter })).getByRole('button', { name: vi_.projectClosed }));
    expect(await screen.findByText(CLOSED)).toBeTruthy();
  });

  it('says no project matches when a narrowed filter matches none of the projects the viewer is in', async () => {
    const { card } = show(MAI);
    await card(OFFICE);
    const filter = screen.getByRole('group', { name: vi_.projectStatusFilter });
    fireEvent.click(within(filter).getByRole('button', { name: vi_.projectClosed }));
    fireEvent.click(within(filter).getByRole('button', { name: vi_.projectActive }));
    fireEvent.click(within(filter).getByRole('button', { name: vi_.projectPaused }));
    expect(await screen.findByText(vi_.noProjectsMatch)).toBeTruthy();
    expect(screen.queryByText(vi_.noProjects)).toBeNull();
    expect(document.querySelector('article')).toBeNull();
  });

  it('offers a project creator an enabled Tạo project, and a member none', async () => {
    const onCreate = vi.fn();
    const fake = createFakeProjects({ you: MAI });
    renderProjects(<ProjectList onCreate={onCreate} />, { fake, lang: 'vi', path: '/projects' });
    await screen.findByText(OFFICE);
    const create = screen.getByRole('button', { name: vi_.createProject });
    expect(create.getAttribute('aria-disabled')).toBeNull();
    fireEvent.click(create);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/projects');
  });

  it('locks Tạo project with its reason while offline', async () => {
    const onCreate = vi.fn();
    const fake = createFakeProjects({ you: MAI });
    const { live } = renderProjects(<ProjectList onCreate={onCreate} />, { fake, lang: 'vi', path: '/projects' });
    await screen.findByText(OFFICE);
    act(() => live.setStatus('offline'));
    await waitFor(() => expect(screen.getByRole('button', { name: vi_.createProject }).getAttribute('aria-disabled')).toBe('true'));
    const create = screen.getByRole('button', { name: vi_.createProject });
    hoverTooltips();
    expect((create.closest('af-tooltip') as HTMLElement & { text: string }).text).toBe(vi_.offlineLocked);
    fireEvent.click(create);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('shows a project admin Nhãn trạng thái, which opens the label settings, and a member does not', async () => {
    const lan = show(LAN);
    await lan.card(LAUNCH);
    fireEvent.click(screen.getByRole('button', { name: vi_.labelSettings }));
    expect(window.location.pathname).toBe('/settings/labels');
    lan.view.unmount();

    show(MINH);
    await screen.findByText(LAUNCH);
    expect(screen.queryByRole('button', { name: vi_.labelSettings })).toBeNull();
  });

  it('gives a member no Tạo project', async () => {
    const { card } = show(HOA);
    await card(LAUNCH);
    expect(screen.queryByRole('button', { name: vi_.createProject })).toBeNull();
  });

  it('opens the project when its card is clicked', async () => {
    const { card, record } = show(MINH);
    fireEvent.click(within(await card(LAUNCH)).getByRole('button', { name: LAUNCH }));
    expect(window.location.pathname).toBe(`/p/${record(LAUNCH).id}`);
  });
});
