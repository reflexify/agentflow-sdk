import { describe, expect, it } from 'vitest';
import { canRead, judgeWrite, may, type Body, type EntityKey } from '../../src/api/memory-rules.js';

const MANAGER = 'manager';
const MEMBER = 'member';
const HOLDER = 'holder';
const HELPER = 'helper';
const ADMIN = 'admin';
const OUTSIDER = 'outsider';
const ADMINS = [ADMIN];

const world: Record<EntityKey, Record<string, Body>> = {
  project: {
    p1: { name: 'One', managers: [MANAGER], members: [MEMBER, HOLDER], status: 'active' },
    p2: { name: 'Two', managers: [OUTSIDER], members: [], status: 'active' },
    closed: { name: 'Closed', managers: [MANAGER], members: [MEMBER], status: 'closed' },
  },
  section: {
    s1: { project: 'p1', name: 'Thiết kế' },
    s2: { project: 'p2', name: 'Elsewhere' },
  },
  task_label: {
    waiting: { name: 'Chờ duyệt', base_status: 'doing' },
    week: { name: 'Ưu tiên tuần', base_status: 'todo' },
  },
  task: {},
};
const read = (entity: EntityKey, id: string) => world[entity][id] ?? null;

const task = (over: Body = {}): Body => ({
  title: 'Task', project: 'p1', status: 'todo', blocked: false, claimed_by: HOLDER, collaborators: [HELPER], ...over,
});

const update = (actor: string, before: Body, changes: Body) =>
  judgeWrite({ entity: 'task', actor, before, after: { ...before, ...changes }, read, admins: ADMINS });
const create = (actor: string, after: Body) => judgeWrite({ entity: 'task', actor, before: null, after, read, admins: ADMINS });
const first = (r: ReturnType<typeof update>) => r?.violations?.[0];

describe('content_by_owner_or_manager', () => {
  it('refuses a member who does not hold the task, on the title', () => {
    expect(update(MEMBER, task(), { title: 'renamed' })).toEqual({
      status: 422, type: 'ENTITY_VALIDATION_RULE_FAILED',
      violations: [{ rule: 'content_by_owner_or_manager', field: 'title', message: 'Only the owner or a project manager changes this' }],
    });
    for (const field of ['description', 'due', 'priority', 'collaborators']) {
      expect(first(update(MEMBER, task(), { [field]: field === 'collaborators' ? [MEMBER] : 'x' }))?.field, field).toBe('title');
    }
  });

  it('lets the holder and a manager change it', () => {
    expect(update(HOLDER, task(), { title: 'renamed' })).toBeNull();
    expect(update(MANAGER, task(), { title: 'renamed' })).toBeNull();
  });

  it('counts the holder only while the work is live: a done task keeps its claimed_by, not its owner\'s rights', () => {
    expect(first(update(HOLDER, task({ status: 'done' }), { title: 'renamed' }))?.rule).toBe('content_by_owner_or_manager');
    expect(update(MANAGER, task({ status: 'done' }), { title: 'renamed' })).toBeNull();
  });

  it('refuses a collaborator too', () => {
    expect(first(update(HELPER, task(), { title: 'renamed' }))?.message).toBe('Only the owner or a project manager changes this');
  });
});

describe('board_by_participants', () => {
  it('refuses a member who is not a participant, on every board field', () => {
    const changes: Body[] = [
      { label: 'week' }, { section: 's1' }, { position: 5 }, { checklist: [{ id: 'i1', text: 'x', done: false }] }, { attachments: ['f1'] },
    ];
    for (const c of changes) {
      expect(update(MEMBER, task(), c), JSON.stringify(c)).toEqual({
        status: 422, type: 'ENTITY_VALIDATION_RULE_FAILED',
        violations: [{ rule: 'board_by_participants', field: 'label', message: 'Only the owner, a collaborator or a project manager changes this' }],
      });
    }
  });

  it('lets a collaborator, the holder and a manager change them', () => {
    for (const actor of [HELPER, HOLDER, MANAGER]) expect(update(actor, task(), { position: 7 }), actor).toBeNull();
  });
});

describe('the stage model', () => {
  const move = (actor: string, from: string, to: string) => update(actor, task({ status: from }), { status: to });
  const refused = (r: ReturnType<typeof move>) => r?.status === 422 && r.type === 'STAGE_TRANSITION_NOT_ALLOWED' && !!r.detail;

  it('lets only the holder complete a task, from todo and from doing', () => {
    for (const from of ['todo', 'doing']) {
      expect(move(HOLDER, from, 'done'), from).toBeNull();
      for (const actor of [MANAGER, HELPER, MEMBER]) expect(refused(move(actor, from, 'done')), `${actor} ${from}`).toBe(true);
    }
  });

  it('moves between todo and doing for the holder, collaborators and managers', () => {
    for (const [from, to] of [['todo', 'doing'], ['doing', 'todo']] as const) {
      for (const actor of [HOLDER, HELPER, MANAGER]) expect(move(actor, from, to), `${actor} ${from}`).toBeNull();
      expect(refused(move(MEMBER, from, to))).toBe(true);
    }
  });

  it('reopens a done task and restores a cancelled one for managers only', () => {
    expect(move(MANAGER, 'done', 'doing')).toBeNull();
    expect(move(MANAGER, 'cancelled', 'todo')).toBeNull();
    for (const actor of [HOLDER, HELPER, MEMBER]) {
      expect(refused(move(actor, 'done', 'doing')), actor).toBe(true);
      expect(refused(move(actor, 'cancelled', 'todo')), actor).toBe(true);
    }
  });

  it('cancels a live task for the holder and managers', () => {
    for (const from of ['todo', 'doing']) {
      expect(move(HOLDER, from, 'cancelled')).toBeNull();
      expect(move(MANAGER, from, 'cancelled')).toBeNull();
      expect(refused(move(HELPER, from, 'cancelled'))).toBe(true);
      expect(refused(move(MEMBER, from, 'cancelled'))).toBe(true);
    }
  });

  it('has no move from done to cancelled for anyone', () => {
    for (const actor of [HOLDER, HELPER, MANAGER, MEMBER]) expect(refused(move(actor, 'done', 'cancelled')), actor).toBe(true);
  });

  it('starts every task in todo', () => {
    expect(create(MEMBER, task({ status: 'todo' }))).toBeNull();
    expect(create(MEMBER, task({ status: 'doing' }))).toEqual({
      status: 422, type: 'STAGE_INITIAL_STATUS_INVALID', detail: 'a record can enter the stage model only in: todo',
    });
  });

  it('says which move it refused and who may make it', () => {
    expect(move(MEMBER, 'todo', 'done')?.detail).toBe("the move from 'todo' to 'done' is limited to: the work's holder");
    expect(move(MEMBER, 'todo', 'doing')?.detail)
      .toBe("the move from 'todo' to 'doing' is limited to: the work's holder, someone in 'collaborators', someone in 'project' › 'managers'");
    expect(move(MANAGER, 'done', 'cancelled')?.detail).toBe("no transition from 'done' to 'cancelled'");
  });

  it('judges the move before any rule', () => {
    const frozen = task({ frozen: true });
    expect(update(MANAGER, frozen, { status: 'done' })).toMatchObject({ type: 'STAGE_TRANSITION_NOT_ALLOWED' });
    expect(update(HOLDER, frozen, { status: 'done' })).toMatchObject({ type: 'ENTITY_VALIDATION_RULE_FAILED' });
  });
});

describe('the field rules', () => {
  it('blocks a task only while it is in progress', () => {
    expect(update(HOLDER, task({ status: 'todo' }), { blocked: true })).toMatchObject({ violations: [{ field: 'blocked', message: 'Only a task in progress can be blocked' }] });
    expect(update(HOLDER, task({ status: 'doing' }), { blocked: true })).toBeNull();
    expect(update(HOLDER, task({ status: 'doing', blocked: true }), { status: 'todo' })).toMatchObject({ violations: [{ message: 'Only a task in progress can be blocked' }] });
    expect(update(HOLDER, task({ status: 'doing', blocked: true }), { status: 'todo', blocked: false })).toBeNull();
  });

  it('keeps a label to its own status', () => {
    expect(update(HOLDER, task({ status: 'todo' }), { label: 'waiting' })).toMatchObject({ violations: [{ field: 'label', message: 'The label belongs to another status' }] });
    expect(update(HOLDER, task({ status: 'todo' }), { label: 'week' })).toBeNull();
    expect(update(HOLDER, task({ status: 'todo' }), { label: 'waiting', status: 'doing' })).toBeNull();
  });

  it('keeps a section to its own project', () => {
    expect(update(HOLDER, task(), { section: 's2' })).toMatchObject({ violations: [{ field: 'section', message: 'The section belongs to another project' }] });
    expect(update(HOLDER, task(), { section: 's1' })).toBeNull();
  });

  it('refuses every update of a frozen task', () => {
    const frozen = task({ frozen: true });
    for (const actor of [HOLDER, MANAGER]) {
      expect(update(actor, frozen, { title: 'x' })).toEqual({
        status: 422, type: 'ENTITY_VALIDATION_RULE_FAILED',
        violations: [{ rule: 'frozen_is_frozen', message: 'This task is frozen because its project is closed' }],
      });
      expect(first(update(actor, frozen, { status: 'cancelled' }))?.message).toBe('This task is frozen because its project is closed');
    }
  });

  it('takes no new task in a closed project', () => {
    expect(create(MANAGER, task({ project: 'closed' }))).toMatchObject({ violations: [{ field: 'project', message: 'A closed project takes no new tasks' }] });
  });

  it('reports every rule a write breaks, in the package\'s order', () => {
    const r = update(MEMBER, task({ status: 'todo' }), { title: 'x', position: 9, blocked: true });
    expect(r?.violations?.map((v) => v.rule)).toEqual(['content_by_owner_or_manager', 'board_by_participants', 'blocked_only_while_doing']);
    const frozen = update(MANAGER, task({ frozen: true }), { section: 's2' });
    expect(frozen?.violations?.map((v) => v.rule)).toEqual(['section_in_project', 'frozen_is_frozen']);
  });

  it('never moves a task to another project', () => {
    expect(update(MANAGER, task(), { project: 'closed' })).toMatchObject({ violations: [{ field: 'project', message: 'A record cannot move to another project' }] });
  });
});

describe('access', () => {
  it('reads a task as its project managers and members, its collaborators and the admins', () => {
    const t = task();
    for (const actor of [MANAGER, MEMBER, HOLDER, HELPER, ADMIN]) expect(canRead('task', actor, t, read, ADMINS), actor).toBe(true);
    expect(canRead('task', OUTSIDER, t, read, ADMINS)).toBe(false);
  });

  it('reads a section as its project managers and members, and the admins', () => {
    const s = world.section.s1!;
    for (const actor of [MANAGER, MEMBER, ADMIN]) expect(canRead('section', actor, s, read, ADMINS), actor).toBe(true);
    for (const actor of [HELPER, OUTSIDER]) expect(canRead('section', actor, s, read, ADMINS), actor).toBe(false);
  });

  it('reads a project as its managers and members, and the admins', () => {
    const p = world.project.p1!;
    for (const actor of [MANAGER, MEMBER, ADMIN]) expect(canRead('project', actor, p, read, ADMINS), actor).toBe(true);
    for (const actor of [HELPER, OUTSIDER]) expect(canRead('project', actor, p, read, ADMINS), actor).toBe(false);
  });

  it('answers a write to a task the actor cannot read as not found', () => {
    expect(update(OUTSIDER, task(), { title: 'x' })).toEqual({ status: 404, type: 'ENTITY_RECORD_NOT_FOUND' });
  });

  it('answers a write without the grant as not found too, though the actor may read the record', () => {
    expect(update(ADMIN, task(), { title: 'x' })).toEqual({ status: 404, type: 'ENTITY_RECORD_NOT_FOUND' });
  });

  it('judges access before any rule', () => {
    expect(update(OUTSIDER, task({ frozen: true }), { title: 'x' })?.status).toBe(404);
  });

  it('lets a member create a task in their project, and nobody else', () => {
    expect(create(MEMBER, task())).toBeNull();
    for (const actor of [HELPER, ADMIN]) {
      expect(create(actor, task()), actor).toEqual({
        status: 403, type: 'ENTITY_ACCESS_DENIED', detail: 'no parent this record points to names you in a field your create scope follows',
      });
    }
  });

  it('refuses moving a task to a project that does not name the writer', () => {
    expect(update(MANAGER, task(), { project: 'p2' })).toEqual({
      status: 403, type: 'ENTITY_ACCESS_DENIED', detail: '`project`: the record may not be moved to a parent that does not name you',
    });
  });
});

describe('the grants on projects and labels', () => {
  const CREATORS = [ADMIN, 'creator'];
  const project = (actor: string, before: Body | null, after: Body) =>
    judgeWrite({ entity: 'project', actor, before, after, read, admins: ADMINS, creators: CREATORS });
  const label = (actor: string, before: Body | null, after: Body) =>
    judgeWrite({ entity: 'task_label', actor, before, after, read, admins: ADMINS, creators: CREATORS });

  it('lets only the creators group create a project, and says no create scope covers it to anyone else', () => {
    const body = { name: 'Mới', managers: ['creator'], status: 'active' };
    expect(project('creator', null, body)).toBeNull();
    expect(project(ADMIN, null, body)).toBeNull();
    expect(project(MANAGER, null, body)).toEqual({
      status: 403, type: 'ENTITY_ACCESS_DENIED', detail: 'no create scope covers this entity for the acting principal',
    });
  });

  it('lets a project\'s managers and the admins edit it, and reads a member\'s edit as a record that is not there', () => {
    const before = world.project.p1!;
    const after = { ...before, name: 'Đổi tên' };
    expect(project(MANAGER, before, after)).toBeNull();
    expect(project(ADMIN, before, after)).toBeNull();
    expect(project(MEMBER, before, after)).toEqual({ status: 404, type: 'ENTITY_RECORD_NOT_FOUND' });
    expect(project(OUTSIDER, before, after)).toEqual({ status: 404, type: 'ENTITY_RECORD_NOT_FOUND' });
  });

  it('lets only an admin create, rename or delete a label', () => {
    const before = world.task_label.week!;
    expect(label(ADMIN, null, { name: 'Mới', base_status: 'todo' })).toBeNull();
    expect(label(MANAGER, null, { name: 'Mới', base_status: 'todo' })).toMatchObject({ status: 403, type: 'ENTITY_ACCESS_DENIED' });
    expect(label(ADMIN, before, { ...before, name: 'Đổi' })).toBeNull();
    expect(label(MANAGER, before, { ...before, name: 'Đổi' })).toEqual({ status: 404, type: 'ENTITY_RECORD_NOT_FOUND' });
    expect(may('delete', 'task_label', ADMIN, before, read, { admins: ADMINS })).toBe(true);
    expect(may('delete', 'task_label', MANAGER, before, read, { admins: ADMINS })).toBe(false);
  });

  it('lets anyone read a label', () => {
    expect(may('read', 'task_label', OUTSIDER, world.task_label.week!, read, { admins: ADMINS })).toBe(true);
  });
});
