import { describe, expect, it, vi } from 'vitest';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import { applyDrop, DropWriteFailed, planDrop, planSectionDrop, type DropPlan, type DropWrite } from '../../src/board/drag.js';
import { columnsFor, type Column } from '../../src/model/grouping.js';
import { byPosition, STEP } from '../../src/model/positions.js';
import type { GroupBy, Section, Task, TaskLabel } from '../../src/model/types.js';
import { aProject, aSection, aTask, viewer } from '../support/fixtures.js';

const project = aProject({ managers: ['m'], members: ['b', 'h'] });
const labels: TaskLabel[] = [{ id: 'review', updatedAt: '2026-10-01T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' }];
const design = aSection({ project: project.id, name: 'Thiết kế', position: 1024 });
const build = aSection({ project: project.id, name: 'Phát triển', position: 2048 });
const sections = [design, build];

const task = (over: Partial<Task>) => aTask({ project: project.id, holder: 'b', collaborators: ['c'], ...over });

function columns(groupBy: GroupBy, tasks: Task[], showCancelled = false): Column[] {
  return columnsFor(groupBy, tasks, { sections, people: new Map(), today: '2026-10-21', showCancelled });
}
const col = (cols: Column[], key: string) => cols.find((c) => c.key === key)!;

function plan(groupBy: GroupBy, tasks: Task[], moving: Task, fromKey: string, toKey: string, index: number, who = 'm', extra: { online?: boolean; showCancelled?: boolean } = {}): DropPlan {
  const cols = columns(groupBy, tasks, extra.showCancelled);
  return planDrop({
    groupBy, from: col(cols, fromKey), to: col(cols, toKey), task: moving, index, viewer: viewer(who), project, labels,
    online: extra.online ?? true,
  });
}

describe('planning a drop by status', () => {
  const todo = task({ status: 'todo', position: 1024 });
  const doing = task({ status: 'doing', position: 1024 });

  it('refuses a drop into Hoàn thành for everyone, the primary included', () => {
    for (const who of ['m', 'b', 'c']) {
      expect(plan('status', [todo, doing], todo, 'status:todo', 'status:done', 0, who)).toEqual({ refuse: 'completeByTick' });
    }
  });

  it('asks before a drop into Đã huỷ, with one write', () => {
    expect(plan('status', [todo, doing], todo, 'status:todo', 'status:cancelled', 0, 'm', { showCancelled: true }))
      .toEqual({ confirm: 'cancel', writes: [{ kind: 'task', task: todo, changes: { status: 'cancelled', position: STEP } }] });
  });

  it('lets a collaborator move a card to Đang làm, and refuses a member who is no participant', () => {
    expect(plan('status', [todo, doing], todo, 'status:todo', 'status:doing', 1, 'c'))
      .toEqual({ writes: [{ kind: 'task', task: todo, changes: { status: 'doing', position: 1024 + STEP } }] });
    expect(plan('status', [todo, doing], todo, 'status:todo', 'status:doing', 1, 'h')).toEqual({ refuse: 'onlyParticipants' });
  });

  it('clears blocked, and a label of another status, in the same write', () => {
    const blocked = task({ status: 'doing', blocked: true, position: 2048 });
    expect(plan('status', [todo, blocked], blocked, 'status:doing', 'status:todo', 0, 'b'))
      .toEqual({ writes: [{ kind: 'task', task: blocked, changes: { status: 'todo', blocked: false, position: 0 } }] });
    const labelled = task({ status: 'doing', label: 'review', position: 2048 });
    expect(plan('status', [todo, labelled], labelled, 'status:doing', 'status:todo', 1, 'b'))
      .toEqual({ writes: [{ kind: 'task', task: labelled, changes: { status: 'todo', label: null, position: 1024 + STEP } }] });
  });

  it('leaves a done task to be reopened into Đang làm by a manager only', () => {
    const done = task({ status: 'done', position: 1024 });
    expect(plan('status', [done], done, 'status:done', 'status:doing', 0, 'm'))
      .toEqual({ writes: [{ kind: 'task', task: done, changes: { status: 'doing', position: STEP } }] });
    expect(plan('status', [done], done, 'status:done', 'status:doing', 0, 'c')).toEqual({ refuse: 'onlyManagers' });
    expect(plan('status', [done], done, 'status:done', 'status:todo', 0, 'm')).toEqual({ refuse: 'wrongStatus' });
  });

  it('restores a cancelled task into Chưa làm for a manager only', () => {
    const cancelled = task({ status: 'cancelled', position: 1024 });
    expect(plan('status', [cancelled], cancelled, 'status:cancelled', 'status:todo', 0, 'm', { showCancelled: true }))
      .toEqual({ writes: [{ kind: 'task', task: cancelled, changes: { status: 'todo', position: STEP } }] });
    expect(plan('status', [cancelled], cancelled, 'status:cancelled', 'status:todo', 0, 'b', { showCancelled: true })).toEqual({ refuse: 'onlyManagers' });
  });
});

describe('planning a drop by another grouping', () => {
  it('by section, sets the section and the position', () => {
    const a = task({ section: design.id, position: 1024 });
    const b = task({ section: build.id, position: 1024 });
    expect(plan('section', [a, b], a, `section:${design.id}`, `section:${build.id}`, 0, 'c'))
      .toEqual({ writes: [{ kind: 'task', task: a, changes: { section: build.id, position: 0 } }] });
  });

  it("by owner, a manager's drop assigns and a non-manager's is refused", () => {
    const a = task({ holder: 'b', position: 1024 });
    const b = task({ holder: 'h', position: 1024 });
    expect(plan('owner', [a, b], a, 'owner:b', 'owner:h', 1, 'm')).toEqual({
      writes: [{ kind: 'holder', task: a, user: 'h' }, { kind: 'task', task: a, changes: { position: 1024 + STEP } }],
    });
    expect(plan('owner', [a, b], a, 'owner:b', 'owner:none', 0, 'm'))
      .toEqual({ writes: [{ kind: 'holder', task: a, user: null }, { kind: 'task', task: a, changes: { position: STEP } }] });
    expect(plan('owner', [a, b], a, 'owner:b', 'owner:h', 1, 'b')).toEqual({ refuse: 'onlyManagers' });
  });

  it('by due, refuses every drop between columns, and only reorders within one', () => {
    const a = task({ due: '2026-10-21', position: 1024 });
    const b = task({ due: '2026-10-21', position: 2048 });
    const c = task({ due: '2026-10-22', position: 1024 });
    expect(plan('due', [a, b, c], a, 'due:today', 'due:this_week', 0)).toEqual({ refuse: 'dueNotDroppable' });
    expect(plan('due', [a, b, c], a, 'due:today', 'due:today', 1))
      .toEqual({ writes: [{ kind: 'task', task: a, changes: { position: 2048 + STEP } }] });
  });

  it('by priority, sets the priority and the position', () => {
    const a = task({ priority: 'low', position: 1024 });
    expect(plan('priority', [a], a, 'priority:low', 'priority:urgent', 0, 'b'))
      .toEqual({ writes: [{ kind: 'task', task: a, changes: { priority: 'urgent', position: STEP } }] });
    expect(plan('priority', [a], a, 'priority:low', 'priority:none', 0, 'b'))
      .toEqual({ writes: [{ kind: 'task', task: a, changes: { priority: null, position: STEP } }] });
    expect(plan('priority', [a], a, 'priority:low', 'priority:urgent', 0, 'c')).toEqual({ refuse: 'onlyOwnerOrManager' });
  });
});

describe('planning a drop within one column', () => {
  const a = task({ status: 'todo', position: 1024 });
  const b = task({ status: 'todo', position: 2048 });
  const c = task({ status: 'todo', position: 3072 });

  it('writes only the position', () => {
    expect(plan('status', [a, b, c], a, 'status:todo', 'status:todo', 1, 'c'))
      .toEqual({ writes: [{ kind: 'task', task: a, changes: { position: 2560 } }] });
    expect(plan('status', [a, b, c], c, 'status:todo', 'status:todo', 0, 'c'))
      .toEqual({ writes: [{ kind: 'task', task: c, changes: { position: 0 } }] });
  });

  it('writes nothing when the card lands where it was', () => {
    expect(plan('status', [a, b, c], b, 'status:todo', 'status:todo', 1, 'c')).toEqual({ writes: [] });
  });

  it('renumbers the column first, one write per card, below its lowest position, then moves the card, when the gap is too tight', () => {
    const x = task({ status: 'todo', position: 1 });
    const y = task({ status: 'todo', position: 1 + 1e-7 });
    const z = task({ status: 'todo', position: 9 });
    expect(plan('status', [x, y, z], z, 'status:todo', 'status:todo', 1)).toEqual({
      writes: [
        { kind: 'task', task: x, changes: { position: 1 - 3 * STEP } },
        { kind: 'task', task: y, changes: { position: 1 - 2 * STEP } },
        { kind: 'task', task: z, changes: { position: 1 - STEP } },
        { kind: 'task', task: z, changes: { position: 1 - 2.5 * STEP } },
      ],
    });
  });

  it('refuses a member who is no participant', () => {
    expect(plan('status', [a, b, c], a, 'status:todo', 'status:todo', 2, 'h')).toEqual({ refuse: 'onlyParticipants' });
  });

  it("refuses a renumber that would move a card the viewer may not move", () => {
    const x = task({ status: 'todo', position: 1, collaborators: [] });
    const y = task({ status: 'todo', position: 1 + 1e-7, collaborators: [] });
    const z = task({ status: 'todo', position: 9 });
    expect(plan('status', [x, y, z], z, 'status:todo', 'status:todo', 1, 'c')).toEqual({ refuse: 'onlyParticipants' });
  });
});

describe('any drop', () => {
  it('is refused offline', () => {
    const a = task({ status: 'todo', position: 1024 });
    expect(plan('status', [a], a, 'status:todo', 'status:doing', 0, 'm', { online: false })).toEqual({ refuse: 'offlineLocked' });
    expect(plan('owner', [a], a, 'owner:b', 'owner:none', 0, 'b', { online: false })).toEqual({ refuse: 'offlineLocked' });
    expect(plan('status', [a], a, 'status:todo', 'status:todo', 0, 'm', { online: false })).toEqual({ refuse: 'offlineLocked' });
  });
});

describe('planning a section drop', () => {
  const s1 = aSection({ project: project.id, name: 'A', position: 1024 });
  const s2 = aSection({ project: project.id, name: 'B', position: 2048 });
  const s3 = aSection({ project: project.id, name: 'C', position: 3072 });
  const drop = (list: Section[], moving: Section, index: number, who = 'm', online = true) =>
    planSectionDrop({ sections: list, section: moving, index, viewer: viewer(who), project, online });

  it('moves a section after the next one with one write, halfway', () => {
    expect(drop([s1, s2, s3], s1, 1)).toEqual({ writes: [{ kind: 'section', section: s1, position: 2560 }] });
  });

  it('renumbers the sections first when the gap is too tight', () => {
    const t1 = aSection({ project: project.id, name: 'A', position: 1 });
    const t2 = aSection({ project: project.id, name: 'B', position: 1 + 1e-7 });
    const t3 = aSection({ project: project.id, name: 'C', position: 9 });
    expect(drop([t3, t1, t2], t3, 1)).toEqual({
      writes: [
        { kind: 'section', section: t1, position: 1 - 3 * STEP },
        { kind: 'section', section: t2, position: 1 - 2 * STEP },
        { kind: 'section', section: t3, position: 1 - STEP },
        { kind: 'section', section: t3, position: 1 - 2.5 * STEP },
      ],
    });
  });

  it('writes nothing when the section lands where it was', () => {
    expect(drop([s1, s2, s3], s2, 1)).toEqual({ writes: [] });
  });

  it('is refused to a non-manager and offline', () => {
    expect(drop([s1, s2, s3], s1, 1, 'b')).toEqual({ refuse: 'onlyManagers' });
    expect(drop([s1, s2, s3], s1, 1, 'm', false)).toEqual({ refuse: 'offlineLocked' });
  });
});

describe('applying a drop', () => {
  function fakeApi() {
    const calls: string[] = [];
    const api = {
      updateTask: vi.fn(async (t: Task, changes: object) => { calls.push(`update ${t.id} ${t.updatedAt} ${JSON.stringify(changes)}`); return t; }),
      updateSection: vi.fn(async (s: Section, changes: object) => { calls.push(`section ${s.id} ${JSON.stringify(changes)}`); return s; }),
      assign: vi.fn(async (t: Task, user: string) => { calls.push(`assign ${t.id} ${user}`); }),
      release: vi.fn(async (t: Task) => { calls.push(`release ${t.id}`); }),
      task: vi.fn(async (id: string) => { calls.push(`read ${id}`); return task({ id, updatedAt: 'fresh' }); }),
    };
    return { api: api as unknown as ProjectsApi, calls };
  }

  it('runs the writes in order, one per card, and stops at the first refusal', async () => {
    const x = task({ position: 1 });
    const y = task({ position: 2 });
    const { api, calls } = fakeApi();
    await applyDrop(api, { writes: [
      { kind: 'task', task: x, changes: { position: STEP } },
      { kind: 'task', task: y, changes: { position: 2 * STEP } },
    ] });
    expect(calls).toEqual([`update ${x.id} ${x.updatedAt} {"position":${STEP}}`, `update ${y.id} ${y.updatedAt} {"position":${2 * STEP}}`]);

    const failing = fakeApi();
    (failing.api.updateTask as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(async (t: Task) => t)
      .mockRejectedValueOnce(new Error('refused'));
    const thrown = await applyDrop(failing.api, { writes: [
      { kind: 'task', task: x, changes: { position: STEP } },
      { kind: 'task', task: y, changes: { position: 2 * STEP } },
      { kind: 'task', task: x, changes: { position: 3 * STEP } },
    ] }).catch((e: unknown) => e);
    expect(thrown).toBeInstanceOf(DropWriteFailed);
    expect((thrown as DropWriteFailed).write).toMatchObject({ task: y });
    expect((thrown as DropWriteFailed).message).toBe('refused');
    expect(failing.api.updateTask).toHaveBeenCalledTimes(2);
  });

  it('assigns or releases, then reads the task again before writing its position', async () => {
    const a = task({ position: 1 });
    const { api, calls } = fakeApi();
    await applyDrop(api, { writes: [{ kind: 'holder', task: a, user: 'h' }, { kind: 'task', task: a, changes: { position: STEP } }] });
    expect(calls).toEqual([`assign ${a.id} h`, `read ${a.id}`, `update ${a.id} fresh {"position":${STEP}}`]);
    const second = fakeApi();
    await applyDrop(second.api, { writes: [{ kind: 'holder', task: a, user: null }] });
    expect(second.calls).toEqual([`release ${a.id}`]);
  });

  it('writes sections', async () => {
    const s = aSection({ position: 1 });
    const { api, calls } = fakeApi();
    await applyDrop(api, { writes: [{ kind: 'section', section: s, position: 1536 }] });
    expect(calls).toEqual([`section ${s.id} {"position":1536}`]);
  });
});

describe('a renumber cut short', () => {
  /** Runs `writes` against a store of positions, refusing the write numbered `failAt`, and returns the stored order. */
  async function storedOrder<T extends { id: string; position: number | null; createdAt?: string }>(items: T[], writes: DropWrite[], failAt: number) {
    const store = new Map(items.map((i) => [i.id, { ...i }] as const));
    let n = 0;
    const write = (id: string, position: number | null | undefined) => {
      if (n++ === failAt) throw new Error('refused');
      if (position !== undefined) store.get(id)!.position = position;
    };
    const api = {
      updateTask: async (t: Task, changes: { position?: number | null }) => { write(t.id, changes.position); return t; },
      updateSection: async (sec: Section, changes: { position?: number | null }) => { write(sec.id, changes.position); return sec; },
    } as unknown as ProjectsApi;
    await applyDrop(api, { writes }).catch(() => undefined);
    const stamped = [...store.values()].map((i) => ({ ...i, createdAt: i.createdAt ?? '' }));
    return stamped.sort(byPosition).map((i) => i.id);
  }

  const stamp = (n: number) => `2026-10-0${n}T00:00:00Z`;

  it('leaves the stored order of the cards as it was, whichever write fails', async () => {
    const a = task({ status: 'todo', position: 1, createdAt: stamp(1) });
    const b = task({ status: 'todo', position: 1 + 1e-7, createdAt: stamp(2) });
    const c = task({ status: 'todo', position: 5, createdAt: stamp(3) });
    const d = task({ status: 'todo', position: null, createdAt: stamp(4) });
    const e = task({ status: 'todo', position: null, createdAt: stamp(5) });
    const column = [a, b, c, d, e];
    const original = column.map((t) => t.id);

    const within = plan('status', column, c, 'status:todo', 'status:todo', 1) as { writes: DropWrite[] };
    expect(within.writes).toHaveLength(6);
    for (let k = 0; k < within.writes.length; k++) expect(await storedOrder(column, within.writes, k), `write ${k} refused`).toEqual(original);
    expect(await storedOrder(column, within.writes, -1)).toEqual([a.id, c.id, b.id, d.id, e.id]);

    const m = task({ status: 'doing', position: 1, createdAt: stamp(6) });
    const across = plan('status', [...column, m], m, 'status:doing', 'status:todo', 1) as { writes: DropWrite[] };
    expect(across.writes).toHaveLength(6);
    for (let k = 0; k < across.writes.length; k++) {
      expect((await storedOrder(column, across.writes.slice(0, 5), k)), `write ${k} refused`).toEqual(original);
    }
  });

  it('leaves the stored order of the sections as it was, whichever write fails', async () => {
    const s1 = aSection({ project: project.id, name: 'A', position: 1 });
    const s2 = aSection({ project: project.id, name: 'B', position: 1 + 1e-7 });
    const s3 = aSection({ project: project.id, name: 'C', position: 9 });
    const s4 = aSection({ project: project.id, name: 'D', position: 20 });
    const list = [s1, s2, s3, s4];
    const moved = planSectionDrop({ sections: list, section: s4, index: 1, viewer: viewer('m'), project, online: true }) as { writes: DropWrite[] };
    expect(moved.writes).toHaveLength(5);
    for (let k = 0; k < moved.writes.length; k++) {
      expect(await storedOrder(list, moved.writes, k), `write ${k} refused`).toEqual([s1.id, s2.id, s3.id, s4.id]);
    }
    expect(await storedOrder(list, moved.writes, -1)).toEqual([s1.id, s4.id, s2.id, s3.id]);
  });
});
