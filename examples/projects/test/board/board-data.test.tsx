// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import type { BoardScope } from '../../src/api/projects-api.js';
import { MINH } from '../../src/api/seed.js';
import { useBoardData, type BoardData } from '../../src/board/useBoardData.js';
import { App } from '../../src/shell/App.js';
import type { Query } from '../../src/shell/route.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';

const vi_ = TEXT.vi;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

/** A component that only reads `useBoardData`, and what it last returned. */
function probe(projectId: string, query: Query) {
  const seen: { current: BoardData | null } = { current: null };
  function Probe() {
    seen.current = useBoardData(projectId, query);
    return null;
  }
  return { ui: createElement(Probe), seen };
}

const QUERY: Query = { view: 'board', group: null, done: '30', cancelled: false };

/** A project of Minh's holding `n` open tasks, written the way any other record is. */
function crowded(n: number) {
  const fake = createFakeProjects({ you: MINH });
  const project = fake.server.write('project', null, { name: 'Đông task', managers: [MINH], members: [], status: 'active', default_group_by: 'status' }, MINH).id;
  for (let i = 1; i <= n; i++) {
    fake.server.write('task', null, { title: `Task ${i}`, project, status: 'todo', position: i * 1024 }, MINH, { notify: false });
  }
  return { fake, project };
}

describe('useBoardData', () => {
  it('asks the board for the done window and the cancelled choice in the address', async () => {
    const fake = createFakeProjects({ you: MINH });
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    const scopes: BoardScope[] = [];
    const { ui, seen } = probe(launch, { ...QUERY, done: '7', cancelled: true });
    renderProjects(ui, {
      fake,
      api: (api) => ({ ...api, boardTasks: (scope) => { scopes.push(scope); return api.boardTasks(scope); } }),
    });
    await waitFor(() => expect(seen.current?.state).toBe('ready'));
    expect(scopes).toContainEqual({ project: launch, done: '7', cancelled: true });
    expect(scopes.every((s) => s.done === '7' && s.cancelled)).toBe(true);
    expect(seen.current!.groupBy).toBe('section');
    expect(seen.current!.columns.map((c) => c.label)).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']);
    expect(seen.current!.truncated).toBe(false);
  });

  it('groups by the address before the project', async () => {
    const fake = createFakeProjects({ you: MINH });
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    const { ui, seen } = probe(launch, { ...QUERY, group: 'status' });
    renderProjects(ui, { fake });
    await waitFor(() => expect(seen.current?.state).toBe('ready'));
    expect(seen.current!.groupBy).toBe('status');
    expect(seen.current!.columns.map((c) => c.key)).toEqual(['status:todo', 'status:doing', 'status:done']);
  });

  it('says when a read fails, and reads again on retry', async () => {
    const fake = createFakeProjects({ you: MINH });
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    let failures = 1;
    const { ui, seen } = probe(launch, QUERY);
    renderProjects(ui, {
      fake,
      api: (api) => ({ ...api, sections: (project) => (failures-- > 0 ? Promise.reject(new Error('down')) : api.sections(project)) }),
    });
    await waitFor(() => expect(seen.current?.state).toBe('error'));
    expect(seen.current!.error).toBeTruthy();
    seen.current!.retry();
    await waitFor(() => expect(seen.current?.state).toBe('ready'));
  });

  it('marks the board truncated past 2,000 tasks, and the tab says so', async () => {
    const { fake, project } = crowded(2001);
    const { ui, seen } = probe(project, QUERY);
    const first = renderProjects(ui, { fake });
    await waitFor(() => expect(seen.current?.state).toBe('ready'), { timeout: 5000 });
    expect(seen.current!.truncated).toBe(true);
    expect(seen.current!.columns.flatMap((c) => c.tasks)).toHaveLength(2000);
    first.unmount();

    renderProjects(createElement(App), { fake, lang: 'vi', path: `/p/${project}` });
    expect(await screen.findByText(vi_.truncatedNotice, {}, { timeout: 5000 })).toBeTruthy();
    expect(vi_.truncatedNotice).toBe('Đang hiện 2.000 task đầu tiên');
    // The board renders all 2,000 cards, which outlasts the default timeout on a loaded machine.
  }, 20_000);

  it('says nothing of truncation for a board that fits', async () => {
    const fake = createFakeProjects({ you: MINH });
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    renderProjects(createElement(App), { fake, lang: 'vi', path: `/p/${launch}` });
    await screen.findByRole('tab', { name: vi_.viewList });
    await waitFor(() => expect(document.querySelector('[data-placeholder="board"], .board')).not.toBeNull());
    expect(screen.queryByText(vi_.truncatedNotice)).toBeNull();
  });
});
