import { describe, expect, it } from 'vitest';
import { toLabel, toProject, toSection, toTask, toUnit, type WireRecord } from '../../src/model/records.js';

const wire = (body: Record<string, unknown>, extra: Partial<WireRecord> = {}): WireRecord => ({
  id: 'r1', entity_id: 'e1', org_id: 'o1', version: 3, created_at: '2026-10-01T08:00:00Z', updated_at: '2026-10-02T09:00:00Z', body, ...extra,
});

describe('a task from the wire', () => {
  it('maps every field', () => {
    const task = toTask(wire({
      title: 'Ship it', project: 'p1', section: 's1', position: 2048, description: '**hi**', status: 'doing', blocked: true,
      label: 'l1', collaborators: ['u2', 'u3'], priority: 'urgent', due: '2026-10-30',
      checklist: [{ id: 'c1', text: 'one', done: true }, { id: 'c2', text: 'two', done: false }],
      show_checklist_on_card: true, origin: 'assistant', completed_at: '2026-10-05T03:00:00.000Z', frozen: true,
      claimed_by: 'u1', attachments: ['f1', 'f2'],
    }, { created_by: 'u9', file_labels: { attachments: { f1: 'a.pdf', f2: 'b.png' } } }));
    expect(task).toEqual({
      id: 'r1', version: 3, updatedAt: '2026-10-02T09:00:00Z', createdAt: '2026-10-01T08:00:00Z', createdBy: 'u9',
      title: 'Ship it', project: 'p1', section: 's1', position: 2048, description: '**hi**', status: 'doing', blocked: true,
      label: 'l1', collaborators: ['u2', 'u3'], priority: 'urgent', due: '2026-10-30',
      checklist: [{ id: 'c1', text: 'one', done: true }, { id: 'c2', text: 'two', done: false }],
      showChecklistOnCard: true, origin: 'assistant', completedAt: '2026-10-05T03:00:00.000Z', frozen: true,
      holder: 'u1', attachments: ['f1', 'f2'], fileNames: { f1: 'a.pdf', f2: 'b.png' }, mentions: {},
    });
  });
  it('reads an empty body as the package defaults', () => {
    expect(toTask(wire({}))).toEqual({
      id: 'r1', version: 3, updatedAt: '2026-10-02T09:00:00Z', createdAt: '2026-10-01T08:00:00Z', createdBy: null,
      title: '', project: '', section: null, position: null, description: '', status: 'todo', blocked: false, label: null,
      collaborators: [], priority: null, due: null, checklist: [], showChecklistOnCard: false, origin: 'manual',
      completedAt: null, frozen: false, holder: null, attachments: [], fileNames: {}, mentions: {},
    });
  });
  it('reads an absent or null priority as not set', () => {
    expect(toTask(wire({ priority: null })).priority).toBeNull();
    expect(toTask(wire({})).priority).toBeNull();
    expect(toTask(wire({ priority: 'low' })).priority).toBe('low');
  });
  it('ignores values of the wrong kind', () => {
    const task = toTask(wire({ status: 'nonsense', priority: 7, collaborators: 'u1', due: 5, claimed_by: '', checklist: [null, { text: 'no id' }] }));
    expect([task.status, task.priority, task.collaborators, task.due, task.holder, task.checklist]).toEqual(['todo', null, [], null, null, []]);
  });
  it('keeps a due date as the day it names, and a completion as one instant', () => {
    const task = toTask(wire({ due: '2026-10-30T20:00:00Z', completed_at: '2026-10-05T10:00:00+07:00' }));
    expect([task.due, task.completedAt]).toEqual(['2026-10-30', '2026-10-05T03:00:00.000Z']);
  });
  it('leaves out a file with no name', () => {
    expect(toTask(wire({}, { file_labels: { attachments: { f1: null, f2: 'x.txt' } } })).fileNames).toEqual({ f2: 'x.txt' });
  });
});

describe('a project from the wire', () => {
  it('maps its fields and rollups', () => {
    expect(toProject(wire({
      name: 'Launch', description: 'd', managers: ['u1'], members: ['u2'], status: 'paused', unit: 'unit1',
      default_group_by: 'owner', tasks_todo: 4, tasks_doing: 2, tasks_done: 9,
    }))).toEqual({
      id: 'r1', version: 3, updatedAt: '2026-10-02T09:00:00Z', name: 'Launch', description: 'd', managers: ['u1'], members: ['u2'],
      status: 'paused', unit: 'unit1', defaultGroupBy: 'owner', counts: { todo: 4, doing: 2, done: 9 },
      mentions: {},
    });
  });
  it('reads an empty body as active with nothing counted', () => {
    expect(toProject(wire({}))).toMatchObject({ status: 'active', managers: [], members: [], unit: null, defaultGroupBy: null, counts: { todo: 0, doing: 0, done: 0 } });
  });
});

describe('a section and a label from the wire', () => {
  it('maps a section with its rollups', () => {
    expect(toSection(wire({ project: 'p1', name: 'Design', description: 'd', position: 1024, tasks_done: 2, tasks_total: 5 })))
      .toEqual({ id: 'r1', updatedAt: '2026-10-02T09:00:00Z', project: 'p1', name: 'Design', description: 'd', position: 1024, done: 2, total: 5 });
    expect(toSection(wire({}))).toMatchObject({ position: null, done: 0, total: 0 });
  });
  it('maps a label', () => {
    expect(toLabel(wire({ name: 'Chờ duyệt', base_status: 'doing' }))).toEqual({ id: 'r1', updatedAt: '2026-10-02T09:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' });
  });
  it('maps a unit, a missing code being null', () => {
    expect(toUnit({ id: 'u1', name: 'Phòng Kỹ thuật', code: 'KT' })).toEqual({ id: 'u1', name: 'Phòng Kỹ thuật', code: 'KT' });
    expect(toUnit({ id: 'u2', name: 'Phòng Mới' })).toEqual({ id: 'u2', name: 'Phòng Mới', code: null });
  });
});
