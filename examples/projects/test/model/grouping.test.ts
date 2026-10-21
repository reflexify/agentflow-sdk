import { describe, expect, it } from 'vitest';
import { columnsFor, defaultGroup, dropChanges, topOf } from '../../src/model/grouping.js';
import { toTask } from '../../src/model/records.js';
import type { Person } from '../../src/model/types.js';
import { t } from '../../src/text.js';
import { aProject, aSection, aTask } from '../support/fixtures.js';

const people = new Map<string, Person>([
  ['p1', { id: 'p1', name: 'Zoe', email: null }],
  ['p2', { id: 'p2', name: 'An', email: null }],
]);
const ctx = (over = {}) => ({ sections: [], people, today: '2026-10-21', showCancelled: false, ...over });
const titles = (columns: ReturnType<typeof columnsFor>) => columns.map((c) => c.label ?? t('vi', c.title!));
const ids = (tasks: { id: string }[]) => tasks.map((x) => x.id);

describe('columns by status', () => {
  const tasks = [
    aTask({ id: 'todo', status: 'todo', position: 2 }),
    aTask({ id: 'todo-first', status: 'todo', position: 1 }),
    aTask({ id: 'doing', status: 'doing' }),
    aTask({ id: 'done', status: 'done', completedAt: '2026-10-20T00:00:00.000Z' }),
    aTask({ id: 'off', status: 'cancelled' }),
  ];
  it('has four columns in order, cancelled only when shown, and done is not a drop target', () => {
    expect(titles(columnsFor('status', tasks, ctx()))).toEqual(['Chưa làm', 'Đang làm', 'Hoàn thành']);
    const columns = columnsFor('status', tasks, ctx({ showCancelled: true }));
    expect(titles(columns)).toEqual(['Chưa làm', 'Đang làm', 'Hoàn thành', 'Đã huỷ']);
    expect(columns.map((c) => c.droppable)).toEqual([true, true, false, true]);
    expect(columns.map((c) => ids(c.tasks))).toEqual([['todo-first', 'todo'], ['doing'], ['done'], ['off']]);
    expect(columns.every((c) => c.done.length === 0)).toBe(true);
  });
});

describe('columns by section', () => {
  const sections = [aSection({ id: 's2', name: 'Build', position: 2048 }), aSection({ id: 's1', name: 'Design', position: 1024 }), aSection({ id: 's3', name: 'Empty', position: 3072 })];
  it('puts tasks without a section first only when there are some, then the sections by position', () => {
    const none = columnsFor('section', [aTask({ section: 's1' })], ctx({ sections }));
    expect(titles(none)).toEqual(['Design', 'Build', 'Empty']);
    const withLoose = columnsFor('section', [aTask({ id: 'loose' }), aTask({ section: 's1' })], ctx({ sections }));
    expect(titles(withLoose)).toEqual(['Chưa có hạng mục', 'Design', 'Build', 'Empty']);
    expect(ids(withLoose[0]!.tasks)).toEqual(['loose']);
  });
  it('folds done tasks into each column, newest completion first, and orders cards by position', () => {
    const tasks = [
      aTask({ id: 'b', section: 's1', position: 2 }),
      aTask({ id: 'a', section: 's1', position: 1 }),
      aTask({ id: 'old', section: 's1', status: 'done', completedAt: '2026-10-01T00:00:00.000Z' }),
      aTask({ id: 'new', section: 's1', status: 'done', completedAt: '2026-10-19T00:00:00.000Z' }),
    ];
    const design = columnsFor('section', tasks, ctx({ sections })).find((c) => c.sectionId === 's1')!;
    expect(ids(design.tasks)).toEqual(['a', 'b']);
    expect(ids(design.done)).toEqual(['new', 'old']);
    expect(design.droppable).toBe(true);
  });
  it('treats a section that is not in the list as no section', () => {
    const columns = columnsFor('section', [aTask({ id: 'ghost', section: 'gone' })], ctx({ sections }));
    expect(ids(columns[0]!.tasks)).toEqual(['ghost']);
  });
});

describe('columns by owner', () => {
  it('has no primary first, then one column per holder ordered by name', () => {
    const tasks = [aTask({ id: 'z', holder: 'p1' }), aTask({ id: 'a', holder: 'p2' }), aTask({ id: 'free' })];
    const columns = columnsFor('owner', tasks, ctx());
    expect(titles(columns)).toEqual(['Chưa có người chính', 'An', 'Zoe']);
    expect(columns.map((c) => c.personId)).toEqual([null, 'p2', 'p1']);
    expect(columns.map((c) => ids(c.tasks))).toEqual([['free'], ['a'], ['z']]);
  });
});

describe('columns by due date', () => {
  it('has the five buckets in order, none a drop target', () => {
    const tasks = [
      aTask({ id: 'late', due: '2026-10-01' }), aTask({ id: 'now', due: '2026-10-21' }), aTask({ id: 'sun', due: '2026-10-25' }),
      aTask({ id: 'mon', due: '2026-10-26' }), aTask({ id: 'open' }),
    ];
    const columns = columnsFor('due', tasks, ctx());
    expect(titles(columns)).toEqual(['Quá hạn', 'Hôm nay', 'Tuần này', 'Sau tuần này', 'Chưa có hạn']);
    expect(columns.map((c) => ids(c.tasks))).toEqual([['late'], ['now'], ['sun'], ['mon'], ['open']]);
    expect(columns.some((c) => c.droppable)).toBe(false);
  });
});

describe('columns by priority', () => {
  it('runs urgent to low, then not set', () => {
    const tasks = [aTask({ id: 'l', priority: 'low' }), aTask({ id: 'u', priority: 'urgent' }), aTask({ id: 'n', priority: null })];
    const columns = columnsFor('priority', tasks, ctx());
    expect(titles(columns)).toEqual(['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp', 'Chưa đặt']);
    expect(columns.map((c) => ids(c.tasks))).toEqual([['u'], [], [], ['l'], ['n']]);
    const fromWire = toTask({ id: 'w', entity_id: 'e', org_id: 'o', version: 1, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z', body: { priority: null } });
    expect(ids(columnsFor('priority', [fromWire], ctx())[4]!.tasks)).toEqual(['w']);
  });
});

describe('what a drop changes', () => {
  it('follows the grouping', () => {
    const status = columnsFor('status', [], ctx());
    expect(dropChanges('status', status[1]!)).toEqual({ status: 'doing' });
    expect(dropChanges('status', status[2]!)).toBeNull();
    const sections = columnsFor('section', [aTask()], ctx({ sections: [aSection({ id: 's1' })] }));
    expect(dropChanges('section', sections[0]!)).toEqual({ section: null });
    expect(dropChanges('section', sections[1]!)).toEqual({ section: 's1' });
    const owner = columnsFor('owner', [aTask({ holder: 'p1' })], ctx());
    expect(dropChanges('owner', owner[1]!)).toEqual({ holder: 'p1' });
    expect(dropChanges('owner', owner[0]!)).toEqual({ holder: null });
    const priority = columnsFor('priority', [], ctx());
    expect(dropChanges('priority', priority[1]!)).toEqual({ priority: 'high' });
    expect(dropChanges('priority', priority[4]!)).toEqual({ priority: null });
    expect(dropChanges('due', columnsFor('due', [], ctx())[0]!)).toBeNull();
  });
});

describe('the default grouping', () => {
  it('uses the project setting, else sections when there are some, else status', () => {
    expect(defaultGroup(aProject({ defaultGroupBy: 'owner' }), [])).toBe('owner');
    expect(defaultGroup(aProject(), [aSection()])).toBe('section');
    expect(defaultGroup(aProject(), [])).toBe('status');
  });
});

describe('the top of the column a new task joins', () => {
  const s1 = aSection({ id: 's1', position: 1024 });
  const s2 = aSection({ id: 's2', position: 2048 });
  const tasks = [
    aTask({ id: 'a', section: 's1', status: 'todo', position: 1024 }),
    aTask({ id: 'b', section: 's1', status: 'doing', position: 512 }),
    aTask({ id: 'c', section: 's2', status: 'todo', position: -3000 }),
    aTask({ id: 'd', section: 's1', status: 'done', position: -9000 }),
  ];
  const draft = aTask({ id: 'new', status: 'todo', position: null });

  it('goes above the first card of its own section, not of another', () => {
    expect(topOf('section', tasks, { ...draft, section: 's1' }, ctx({ sections: [s1, s2] }))).toBe(512 - 1024);
    expect(topOf('section', tasks, { ...draft, section: 's2' }, ctx({ sections: [s1, s2] }))).toBe(-3000 - 1024);
  });

  it('goes above the first card of its status when grouped by status', () => {
    expect(topOf('status', tasks, { ...draft, section: 's1' }, ctx({ sections: [s1, s2] }))).toBe(-3000 - 1024);
  });

  it('names no position for a column with no other open card, and goes above cards that have no position yet', () => {
    expect(topOf('section', tasks, { ...draft, section: null }, ctx({ sections: [s1, s2] }))).toBeNull();
    expect(topOf('section', [aTask({ id: 'd2', section: null, status: 'done', position: 1 })], { ...draft, section: null }, ctx())).toBeNull();
    expect(topOf('section', [aTask({ id: 'x', section: null, position: null })], { ...draft, section: null }, ctx())).toBe(1024);
  });

  it('goes above the first card of its priority when grouped by priority', () => {
    const byPriority = [
      aTask({ id: 'm', priority: 'medium', position: 300 }),
      aTask({ id: 'h', priority: 'high', position: -50 }),
    ];
    expect(topOf('priority', byPriority, { ...draft, priority: 'medium' }, ctx())).toBe(300 - 1024);
    expect(topOf('priority', byPriority, { ...draft, priority: null }, ctx())).toBeNull();
  });
});
