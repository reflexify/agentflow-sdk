// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsError } from '../../src/api/projects-api.js';
import { HOA } from '../../src/api/seed.js';
import { TaskCard } from '../../src/board/TaskCard.js';
import { MyWork } from '../../src/mywork/MyWork.js';
import { TEXT, t } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';

const vi_ = TEXT.vi;
/** A card's tick, whose name carries the card's title. */
const tickIn = (card: HTMLElement) =>
  within(card).getByRole('button', { name: t('vi', 'completeTask', { title: card.getAttribute('aria-label')! }) });
const rowRoles = () =>
  [...document.querySelectorAll('[data-task], [data-work]')].map((row) => row.querySelector('[data-part="role"]')?.textContent ?? '');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

describe('My Work', () => {
  it('shows two numbers, never summed', async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    expect(await screen.findByText(vi_.myWorkProjectCount.replace('{n}', '5'))).toBeTruthy();
    expect(screen.getByText(vi_.myWorkWorkflowCount.replace('{n}', '1'))).toBeTruthy();
    expect(screen.queryByText(vi_.myWorkProjectCount.replace('{n}', '6'))).toBeNull();
  });

  it('groups by due date into the five groups, with claimable work apart', async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    const groups = await screen.findAllByRole('region');
    expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual([
      vi_.dueOverdue, vi_.dueToday, vi_.dueThisWeek, vi_.dueLater, vi_.dueNone, vi_.claimable,
    ]);
  });

  it("marks each project task with Hoa's role and each workflow task with Mở form", async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    const links = await screen.findAllByRole('link', { name: vi_.openForm });
    for (const link of links) expect(link.getAttribute('href')).toMatch(/^\/inbox\?record=.+&entity=.+$/);
    for (const link of links) expect(within(link.closest('[data-work]') as HTMLElement).getByText(vi_.roleWorkflow)).toBeTruthy();
    const roles = rowRoles();
    expect(roles).toContain(vi_.rolePrimary);
    expect(roles).toContain(vi_.roleWorkflow);
  });

  it('shows every row with no role chip chosen, and narrows to the chosen ones', async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    await screen.findAllByRole('region');
    const all = rowRoles();
    fireEvent.click(screen.getByRole('button', { name: vi_.roleWorkflow }));
    await waitFor(() => expect(new Set(rowRoles())).toEqual(new Set([vi_.roleWorkflow])));
    fireEvent.click(screen.getByRole('button', { name: vi_.rolePrimary }));
    await waitFor(() => expect(new Set(rowRoles())).toEqual(new Set([vi_.roleWorkflow, vi_.rolePrimary])));
    fireEvent.click(screen.getByRole('button', { name: vi_.roleWorkflow }));
    fireEvent.click(screen.getByRole('button', { name: vi_.rolePrimary }));
    await waitFor(() => expect(rowRoles()).toEqual(all));
    fireEvent.change(screen.getByRole('combobox', { name: vi_.sortBy }), { target: { value: 'created' } });
    expect(screen.getByRole('combobox', { name: vi_.sortBy })).toHaveProperty('value', 'created');
  });

  it('opens a task in a drawer over My Work', async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    const card = (await screen.findAllByRole('article')).find((a) => a.hasAttribute('data-task'))!;
    fireEvent.click(within(card).getByRole('button', { name: card.getAttribute('aria-label')! }));
    expect(window.location.pathname).toBe(`/mine/t/${card.getAttribute('data-task')}`);
  });

  it('completes a to-do task with one write when its primary ticks it', async () => {
    const { fake, toasts } = renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    const todo = fake.server.records('task').find((r) => r.body.claimed_by === HOA && r.body.status === 'todo' && r.body.frozen !== true)!;
    const card = await waitFor(() => {
      const found = document.querySelector<HTMLElement>(`[data-task="${todo.id}"]`);
      expect(found).not.toBeNull();
      return found!;
    });
    fireEvent.click(tickIn(card));
    await waitFor(() => expect(fake.server.records('task').find((r) => r.id === todo.id)!.body.status).toBe('done'));
    await waitFor(() => expect(toasts()).toContain(vi_.taskCompleted));
  });

  it('never shows a done, cancelled or frozen task', async () => {
    const { fake } = renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    await screen.findAllByRole('region');
    const hidden = fake.server.records('task').filter((r) => ['done', 'cancelled'].includes(String(r.body.status)) || r.body.frozen === true);
    for (const r of hidden) expect(screen.queryByText(String(r.body.title))).toBeNull();
  });

  it('claims a task from Có thể nhận', async () => {
    const { fake } = renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    const claimable = await screen.findByRole('region', { name: vi_.claimable });
    fireEvent.click(within(claimable).getAllByRole('button', { name: vi_.claim })[0]!);
    await waitFor(() => expect(fake.server.records('task').some((r) => r.body.claimed_by === HOA && r.body.title === 'Chuẩn bị tài liệu bàn giao')).toBe(true));
  });

  it('says so when there is nothing', async () => {
    renderProjects(<MyWork />, { you: 'nobody', lang: 'vi' });
    expect(await screen.findByText(vi_.emptyWork)).toBeTruthy();
  });
});

describe('My Work cards', () => {
  it('locks the tick for a collaborator and writes nothing when it is pressed', async () => {
    const writes: string[] = [];
    const { fake } = renderProjects(<MyWork />, {
      you: HOA,
      lang: 'vi',
      api: (api) => ({ ...api, updateTask: (task, changes) => { writes.push(task.id); return api.updateTask(task, changes); } }),
    });
    await screen.findAllByRole('region');
    const record = fake.server.records('task').find((r) => r.body.title === 'Tích hợp cổng thanh toán')!;
    const tick = tickIn(document.querySelector(`[data-task="${record.id}"]`) as HTMLElement);
    expect(tick.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(tick);
    await act(async () => { await Promise.resolve(); });
    expect(writes).toEqual([]);
  });

  it('names the groups a claimable workflow task is offered to', async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    const claimable = await screen.findByRole('region', { name: vi_.claimable });
    await waitFor(() => expect(claimable.querySelector('[data-work] [data-part="groups"]')?.textContent).toBeTruthy());
  });

  it('writes one update when the tick is pressed twice', async () => {
    const writes: string[] = [];
    const { fake } = renderProjects(<MyWork />, {
      you: HOA,
      lang: 'vi',
      api: (api) => ({ ...api, updateTask: (task, changes) => { writes.push(task.id); return api.updateTask(task, changes); } }),
    });
    const todo = fake.server.records('task').find((r) => r.body.claimed_by === HOA && r.body.status === 'todo' && r.body.frozen !== true)!;
    await screen.findAllByRole('region');
    const tick = tickIn(document.querySelector(`[data-task="${todo.id}"]`) as HTMLElement);
    fireEvent.click(tick);
    fireEvent.click(tick);
    await waitFor(() => expect(fake.server.records('task').find((r) => r.id === todo.id)!.body.status).toBe('done'));
    expect(writes).toEqual([todo.id]);
  });

  it('shows the server\'s reason when it refuses a tick, and keeps the row as it was', async () => {
    const reason = 'Không được hoàn thành lúc này';
    const { fake, toasts } = renderProjects(<MyWork />, {
      you: HOA,
      lang: 'vi',
      api: (api) => ({ ...api, updateTask: () => Promise.reject(new ProjectsError('refused', 422, 'ENTITY_VALIDATION_RULE_FAILED', reason)) }),
    });
    const todo = fake.server.records('task').find((r) => r.body.claimed_by === HOA && r.body.status === 'todo' && r.body.frozen !== true)!;
    await screen.findAllByRole('region');
    const card = document.querySelector(`[data-task="${todo.id}"]`) as HTMLElement;
    fireEvent.click(tickIn(card));
    await waitFor(() => expect(toasts()).toContain(reason));
    expect(document.querySelector(`[data-task="${todo.id}"]`)).not.toBeNull();
    expect(fake.server.records('task').find((r) => r.id === todo.id)!.body.status).toBe('todo');
  });

  it('says a claim someone else got to first in its own words, and keeps the row where it was', async () => {
    const reason = 'already claimed by 0190c0de-0000-7000-8000-000000000001';
    const { fake, toasts } = renderProjects(<MyWork />, {
      you: HOA,
      lang: 'vi',
      api: (api) => ({ ...api, claim: () => Promise.reject(new ProjectsError('conflict', 409, 'WORK_ALREADY_CLAIMED', reason)) }),
    });
    const claimable = await screen.findByRole('region', { name: vi_.claimable });
    fireEvent.click(within(claimable).getAllByRole('button', { name: vi_.claim })[0]!);
    await waitFor(() => expect(toasts()).toContain(vi_.refusedAlreadyClaimed));
    expect(toasts()).not.toContain(reason);
    expect(within(screen.getByRole('region', { name: vi_.claimable })).getAllByRole('button', { name: vi_.claim })).not.toHaveLength(0);
    expect(fake.server.records('task').some((r) => r.body.title === 'Chuẩn bị tài liệu bàn giao' && r.body.claimed_by)).toBe(false);
  });

  it('leaves the claim button to the server for work offered to someone outside the project', async () => {
    const { fake } = renderProjects(<div />, { you: HOA, lang: 'vi' });
    const unheld = fake.server.records('task').find((r) => r.body.title === 'Chuẩn bị tài liệu bàn giao')!;
    const task = await fake.api.task(unheld.id);
    const project = { ...(await fake.api.project(task.project)), members: [], managers: [] };
    const card = (claimOffered: boolean) => (
      <TaskCard task={task} project={project} people={new Map()} labels={[]} today="2026-10-21" claimOffered={claimOffered} onOpen={() => {}} onTick={() => {}} onClaim={() => {}} />
    );
    const view = renderProjects(card(true), { fake, lang: 'vi' });
    expect((await screen.findByRole('button', { name: vi_.claim })).getAttribute('aria-disabled')).toBeNull();
    view.unmount();
    renderProjects(card(false), { fake, lang: 'vi' });
    expect((await screen.findByRole('button', { name: vi_.claim })).getAttribute('aria-disabled')).toBe('true');
  });

  it('says nothing matches when filters hide every row, and not that there is nothing to do', async () => {
    renderProjects(<MyWork />, { you: HOA, lang: 'vi' });
    await screen.findAllByRole('region');
    fireEvent.change(screen.getByRole('combobox', { name: vi_.filterProject }), {
      target: { value: [...screen.getByRole('combobox', { name: vi_.filterProject }).querySelectorAll('option')].find((o) => o.textContent === 'Văn phòng')!.value },
    });
    fireEvent.click(screen.getByRole('button', { name: vi_.roleWorkflow }));
    expect(await screen.findByText(vi_.emptyWorkFiltered)).toBeTruthy();
    expect(screen.queryByText(vi_.emptyWork)).toBeNull();
  });

  it('shows the error and a retry when the project list fails, not a spinner for ever', async () => {
    renderProjects(<MyWork />, {
      you: HOA,
      lang: 'vi',
      api: (api) => ({ ...api, projects: () => Promise.reject(new ProjectsError('failed', 500, 'INTERNAL', null)) }),
    });
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: vi_.retry })).toBeTruthy();
  });
});
