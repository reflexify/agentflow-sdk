// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { ProjectsError, type ProjectsApi } from '../../src/api/projects-api.js';
import { HOA, MINH } from '../../src/api/seed.js';
import { Board, useBoardDrop } from '../../src/board/Board.js';
import { useBoardData, type BoardData } from '../../src/board/useBoardData.js';
import { STEP } from '../../src/model/positions.js';
import type { Query } from '../../src/shell/route.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';

const vi_ = TEXT.vi;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

type Drop = ReturnType<typeof useBoardDrop>;
type Write = { op: 'task'; id: string; changes: object } | { op: 'section'; id: string; changes: object };

function seeded(you: string) {
  const fake = createFakeProjects({ you });
  const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
  const section = (name: string) => fake.server.records('section').find((r) => r.body.name === name)!;
  const task = (title: string) => fake.server.records('task').find((r) => r.body.title === title)!;
  const writes: Write[] = [];
  /** `failAt`: the task write, counted from 1, that is refused; `gate`: what every task write waits for first. */
  const control: { failAt: number | null; gate: Promise<void> | null } = { failAt: null, gate: null };
  const api = (inner: ProjectsApi): ProjectsApi => ({
    ...inner,
    updateTask: async (t, changes) => {
      writes.push({ op: 'task', id: t.id, changes });
      if (control.gate) await control.gate;
      if (writes.length === control.failAt) throw new ProjectsError('refused', 422, 'ENTITY_VALIDATION_RULE_FAILED', 'Bị từ chối');
      return inner.updateTask(t, changes);
    },
    updateSection: (s, changes) => {
      writes.push({ op: 'section', id: s.id, changes });
      return inner.updateSection(s, changes);
    },
  });
  return { fake, launch, section, task, writes, api, control };
}

/** The board, and beside it a probe holding its own drop handler over the same board data. */
function harness(projectId: string, query: Query) {
  const drop: { current: Drop | null } = { current: null };
  function Probe({ data }: { data: BoardData }) {
    drop.current = useBoardDrop(data);
    return null;
  }
  function Harness() {
    const data = useBoardData(projectId, query);
    if (data.state !== 'ready') return null;
    return (
      <>
        <Board data={data} />
        <Probe data={data} />
      </>
    );
  }
  return { ui: <Harness />, drop };
}

const columnOf = (title: string) =>
  [...document.querySelectorAll('.board > li > section')].find((s) => s.querySelector('.column-name')?.textContent === title) as HTMLElement;
const titlesIn = (title: string) => [...(columnOf(title)?.querySelectorAll('.column-list [data-part="title"]') ?? [])].map((b) => b.textContent);
const columnTitles = () => [...document.querySelectorAll('.board > li > section .column-name')].map((n) => n.textContent);

const card = (id: string, column: string) => ({ id, data: { current: { kind: 'card', column } } });
const column = (key: string) => ({ id: `column:${key}`, data: { current: { kind: 'column', column: key } } });
const header = (id: string) => ({ id: `section:${id}`, data: { current: { kind: 'section' } } });

async function renderDrop(you: string, query: Partial<Query>, setup?: (s: ReturnType<typeof seeded>) => void, given?: ReturnType<typeof seeded>) {
  const s = given ?? seeded(you);
  setup?.(s);
  const { ui, drop } = harness(s.launch, { view: 'board', group: null, done: '30', cancelled: false, ...query });
  const view = renderProjects(ui, { fake: s.fake, api: s.api, lang: 'vi', path: `/p/${s.launch}` });
  await waitFor(() => expect(document.querySelectorAll('.board [data-task]').length).toBeGreaterThan(0));
  await waitFor(() => expect(drop.current).not.toBeNull());
  return { ...s, view, drop: () => drop.current! };
}

describe('dropping a card on the board', () => {
  const addInAnalysis = ({ fake, launch, section }: ReturnType<typeof seeded>) => {
    fake.server.write('task', null, {
      title: 'Phỏng vấn người dùng', project: launch, section: section('Phân tích').id, status: 'todo', position: 4096, claimed_by: MINH,
    }, MINH);
  };

  it('moves a card to another section, which the server then holds', async () => {
    const s = await renderDrop(MINH, { group: 'section' }, addInAnalysis);
    await waitFor(() => expect(titlesIn('Phân tích')).toEqual(['Phỏng vấn người dùng']));
    const moving = s.task('Phỏng vấn người dùng');
    const analysis = `section:${s.section('Phân tích').id}`;
    const design = `section:${s.section('Thiết kế').id}`;

    await act(() => s.drop().onDragEnd({ active: card(moving.id, analysis), over: column(design) }));

    expect(s.fake.server.records('task').find((r) => r.id === moving.id)!.body.section).toBe(s.section('Thiết kế').id);
    expect(s.writes).toEqual([{ op: 'task', id: moving.id, changes: { section: s.section('Thiết kế').id, position: 2048 + STEP } }]);
    await waitFor(() => expect(titlesIn('Thiết kế')).toEqual(['Thiết kế màn hình đăng nhập', 'Thiết kế luồng thanh toán', 'Phỏng vấn người dùng']));
    expect(titlesIn('Phân tích')).toEqual([]);
  });

  it('puts the card back and says why when the server refuses the drop', async () => {
    const s = await renderDrop(MINH, { group: 'section' }, addInAnalysis);
    await waitFor(() => expect(titlesIn('Phân tích')).toEqual(['Phỏng vấn người dùng']));
    const moving = s.task('Phỏng vấn người dùng');
    const analysis = `section:${s.section('Phân tích').id}`;
    const design = `section:${s.section('Thiết kế').id}`;
    s.fake.server.failNext('PATCH', /records/, 422, {
      type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Unprocessable Entity', status: 422, request_id: 'memory',
      detail: '1 record rule(s) refused the write',
      field_errors: [{ path: '/section', message: 'The section belongs to another project', rule: '0190f8f4-0000-7000-8000-0000000000a1' }],
    });

    await act(() => s.drop().onDragEnd({ active: card(moving.id, analysis), over: column(design) }));

    expect(s.fake.server.records('task').find((r) => r.id === moving.id)!.body.section).toBe(s.section('Phân tích').id);
    await waitFor(() => expect(titlesIn('Phân tích')).toEqual(['Phỏng vấn người dùng']));
    expect(titlesIn('Thiết kế')).not.toContain('Phỏng vấn người dùng');
    await waitFor(() => expect(s.view.toasts()).toContain('The section belongs to another project'));
    expect(s.drop().rolledBack.has(moving.id)).toBe(true);
  });

  it('refuses a drop the viewer may not make before writing, and says why', async () => {
    const s = await renderDrop(HOA, { group: 'status' });
    const moving = s.task('Tích hợp cổng thanh toán');
    await act(() => s.drop().onDragEnd({ active: card(moving.id, 'status:todo'), over: column('status:done') }));
    expect(s.writes).toEqual([]);
    await waitFor(() => expect(s.view.toasts()).toContain(vi_.completeByTick));
  });

  it('asks before a drop into Đã huỷ, and writes only once confirmed', async () => {
    const s = await renderDrop(MINH, { group: 'status', cancelled: true });
    const moving = s.task('Tích hợp cổng thanh toán');
    await waitFor(() => expect(titlesIn(vi_.statusTodo)).toContain('Tích hợp cổng thanh toán'));

    await act(() => s.drop().onDragEnd({ active: card(moving.id, 'status:todo'), over: column('status:cancelled') }));
    expect(s.drop().pending).toMatchObject({ confirm: 'cancel', writes: [{ kind: 'task', changes: { status: 'cancelled' } }] });
    await waitFor(() => expect(titlesIn(vi_.statusCancelled)).toContain('Tích hợp cổng thanh toán'));
    expect(s.writes).toEqual([]);

    act(() => s.drop().cancelPending());
    expect(s.drop().pending).toBeNull();
    expect(s.writes).toEqual([]);
    await waitFor(() => expect(titlesIn(vi_.statusTodo)).toContain('Tích hợp cổng thanh toán'));
    expect(titlesIn(vi_.statusCancelled)).not.toContain('Tích hợp cổng thanh toán');

    await act(() => s.drop().onDragEnd({ active: card(moving.id, 'status:todo'), over: column('status:cancelled') }));
    await act(() => s.drop().confirmPending());
    expect(s.drop().pending).toBeNull();
    expect(s.writes).toEqual([{ op: 'task', id: moving.id, changes: { status: 'cancelled', position: expect.any(Number) } }]);
    expect(s.fake.server.records('task').find((r) => r.id === moving.id)!.body.status).toBe('cancelled');
    await waitFor(() => expect(titlesIn(vi_.statusCancelled)).toContain('Tích hợp cổng thanh toán'));
  });
});

describe('dropping a section header', () => {
  it('moves the section after the next one, with one write between the next one and the one after', async () => {
    const s = await renderDrop(MINH, { group: 'section' });
    expect(columnTitles()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']);
    const analysis = s.section('Phân tích');

    await act(() => s.drop().onDragEnd({ active: header(analysis.id), over: header(s.section('Thiết kế').id) }));

    expect(s.writes).toEqual([{ op: 'section', id: analysis.id, changes: { position: (2048 + 3072) / 2 } }]);
    expect(s.section('Phân tích').body.position).toBe(2560);
    await waitFor(() => expect(columnTitles()).toEqual(['Thiết kế', 'Phân tích', 'Phát triển', 'Kiểm thử']));
  });

  it('is refused to someone who does not manage the project', async () => {
    const s = await renderDrop(HOA, { group: 'section' });
    await act(() => s.drop().onDragEnd({ active: header(s.section('Phân tích').id), over: header(s.section('Thiết kế').id) }));
    expect(s.writes).toEqual([]);
    await waitFor(() => expect(s.view.toasts()).toContain(vi_.onlyManagers));
    expect(columnTitles()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử']);
  });
});

describe('a drop between two cards too close to halve', () => {
  const tighten = ({ fake, task }: ReturnType<typeof seeded>) => {
    fake.server.write('task', task('Thiết kế màn hình đăng nhập').id, { position: 1 }, MINH, { notify: false });
    fake.server.write('task', task('Thiết kế luồng thanh toán').id, { position: 1 + 1e-7 }, MINH, { notify: false });
  };
  const stored = (s: ReturnType<typeof seeded>, section: string) =>
    s.fake.server.records('task')
      .filter((r) => r.body.section === s.section(section).id && r.body.status !== 'done')
      .sort((a, b) => (a.body.position as number) - (b.body.position as number))
      .map((r) => r.body.title);

  it('renumbers the column, one write per card, then lands the card, and the order holds after a reload', async () => {
    const s = await renderDrop(MINH, { group: 'section' }, tighten);
    const login = s.task('Thiết kế màn hình đăng nhập');
    const payment = s.task('Thiết kế luồng thanh toán');
    const moving = s.task('Xây dựng API đăng nhập');
    const design = s.section('Thiết kế').id;

    await act(() => s.drop().onDragEnd({ active: card(moving.id, `section:${s.section('Phát triển').id}`), over: card(payment.id, `section:${design}`) }));

    expect(s.writes).toEqual([
      { op: 'task', id: login.id, changes: { position: 1 - 2 * STEP } },
      { op: 'task', id: payment.id, changes: { position: 1 - STEP } },
      { op: 'task', id: moving.id, changes: { section: design, position: 1 - 1.5 * STEP } },
    ]);
    const order = ['Thiết kế màn hình đăng nhập', 'Xây dựng API đăng nhập', 'Thiết kế luồng thanh toán'];
    expect(stored(s, 'Thiết kế')).toEqual(order);
    expect(s.fake.server.records('task').filter((r) => [login.id, payment.id, moving.id].includes(r.id)).map((r) => [r.body.title, r.body.position]))
      .toEqual(expect.arrayContaining([['Thiết kế màn hình đăng nhập', -2047], ['Thiết kế luồng thanh toán', -1023], ['Xây dựng API đăng nhập', -1535]]));
    await waitFor(() => expect(titlesIn('Thiết kế')).toEqual(order));

    s.view.unmount();
    await renderDrop(MINH, { group: 'section' }, undefined, s);
    await waitFor(() => expect(titlesIn('Thiết kế')).toEqual(order));
  });

  it('keeps the stored order when a renumbering write is refused partway, and says so', async () => {
    const s = await renderDrop(MINH, { group: 'section' }, tighten);
    const payment = s.task('Thiết kế luồng thanh toán');
    const moving = s.task('Xây dựng API đăng nhập');
    const design = s.section('Thiết kế').id;
    s.control.failAt = 2;

    await act(() => s.drop().onDragEnd({ active: card(moving.id, `section:${s.section('Phát triển').id}`), over: card(payment.id, `section:${design}`) }));

    expect(s.writes).toHaveLength(2);
    const before = ['Thiết kế màn hình đăng nhập', 'Thiết kế luồng thanh toán'];
    expect(stored(s, 'Thiết kế')).toEqual(before);
    await waitFor(() => expect(titlesIn('Thiết kế')).toEqual(before));
    expect(titlesIn('Phát triển')).toContain('Xây dựng API đăng nhập');
    await waitFor(() => expect(s.view.toasts()).toContain('Bị từ chối'));
  });
});

describe('two drops of one card', () => {
  it('ignores the second while the first is still being written', async () => {
    const s = await renderDrop(MINH, { group: 'section' });
    const moving = s.task('Xây dựng API đăng nhập');
    const build = `section:${s.section('Phát triển').id}`;
    let open!: () => void;
    s.control.gate = new Promise<void>((resolve) => { open = resolve; });

    let first!: Promise<void>;
    act(() => { first = s.drop().onDragEnd({ active: card(moving.id, build), over: column(`section:${s.section('Thiết kế').id}`) }); });
    await waitFor(() => expect(s.writes).toHaveLength(1));
    // The card already shows in Thiết kế, and is picked up from there.
    await waitFor(() => expect(titlesIn('Thiết kế')).toContain('Xây dựng API đăng nhập'));
    await act(() => s.drop().onDragEnd({ active: card(moving.id, `section:${s.section('Thiết kế').id}`), over: column(`section:${s.section('Kiểm thử').id}`) }));
    expect(s.writes).toHaveLength(1);

    open();
    await act(() => first);
    expect(s.fake.server.records('task').find((r) => r.id === moving.id)!.body.section).toBe(s.section('Thiết kế').id);
  });
});
