// The package's access grants, record rules and stage models, as the in-memory AgentFlow enforces them. Written from
// `config/entities/*.json`, and on purpose not from the module's own `model/roles.ts`: a mistake shared by the two
// would pass every test that runs the module on this server.

export type EntityKey = 'project' | 'section' | 'task' | 'task_label';
export type Body = Record<string, unknown>;
export type Read = (entity: EntityKey, id: string) => Body | null;

/** One record rule a write broke: its key, the field it is anchored on (none for a rule about the whole record), its message. */
export interface Violation { rule: string; field?: string; message: string }

/**
 * Why a write is refused, decided in the real server's order:
 * - 404 `ENTITY_RECORD_NOT_FOUND`: the actor may not read the record, or may read it but holds no grant to write it.
 *   The two are told apart nowhere, so a refusal never says the record exists.
 * - 403 `ENTITY_ACCESS_DENIED`: a create no scope covers, or a move to a parent that does not name the writer.
 * - 422 `STAGE_TRANSITION_NOT_ALLOWED` or `STAGE_INITIAL_STATUS_INVALID`, with `detail`: the stage model.
 * - 422 `ENTITY_VALIDATION_RULE_FAILED`: every record rule the write broke, in `violations`.
 *
 * `detail` is the sentence alone; the wire puts the code in front of it.
 */
export interface Refusal { status: 422 | 404 | 403; type: string; detail?: string; violations?: Violation[] }

export type Operation = 'read' | 'create' | 'update' | 'delete' | 'assign';
export interface Groups { admins: string[]; creators?: string[] }

/** The names the groups go by, which a refusal that names a mover uses. */
export const GROUP_NAMES = { users: 'Người dùng Projects', creators: 'Người tạo project', admins: 'Quản trị Projects' } as const;

const LIVE = new Set(['todo', 'doing']);
const people = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const ref = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

export const isLive = (status: unknown) => LIVE.has(String(status));

function parent(body: Body, read: Read): Body | null {
  const id = ref(body.project);
  return id ? read('project', id) : null;
}

/** Whether `actor` may do `op` on a record with this body: the grants each entity's `access` block lists. */
export function may(op: Operation, entity: EntityKey, actor: string, body: Body, read: Read, groups: Groups): boolean {
  const admin = groups.admins.includes(actor);
  if (entity === 'task_label') return op === 'read' || admin;
  if (entity === 'project') {
    const manager = people(body.managers).includes(actor);
    const member = people(body.members).includes(actor);
    switch (op) {
      case 'read': return manager || member || admin;
      case 'create': return (groups.creators ?? []).includes(actor);
      case 'update': return manager || admin;
      case 'delete': return admin;
      case 'assign': return false;
    }
  }
  const project = parent(body, read);
  const manager = people(project?.managers).includes(actor);
  const member = people(project?.members).includes(actor);
  if (entity === 'section') return op === 'read' ? manager || member || admin : op !== 'assign' && manager;
  const collaborator = people(body.collaborators).includes(actor);
  switch (op) {
    case 'read': return manager || member || collaborator || admin;
    case 'create': return manager || member;
    case 'update': return manager || member || collaborator;
    case 'delete':
    case 'assign': return manager;
  }
}

export function canRead(entity: EntityKey, actor: string, body: Body, read: Read, admins: string[]): boolean {
  return may('read', entity, actor, body, read, { admins });
}

function same(a: unknown, b: unknown): boolean {
  const x = a === undefined ? null : a;
  const y = b === undefined ? null : b;
  if (x === y) return true;
  if (Array.isArray(x) && Array.isArray(y)) return x.length === y.length && x.every((v, i) => same(v, y[i]));
  if (x && y && typeof x === 'object' && typeof y === 'object' && !Array.isArray(x) && !Array.isArray(y)) {
    const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
    return [...keys].every((k) => same((x as Body)[k], (y as Body)[k]));
  }
  return false;
}

const violation = (rule: string, field: string | undefined, message: string): Violation =>
  ({ rule, ...(field ? { field } : {}), message });
const broke = (violations: Violation[]): Refusal | null =>
  violations.length ? { status: 422, type: 'ENTITY_VALIDATION_RULE_FAILED', violations } : null;
const stage = (type: string, detail: string): Refusal => ({ status: 422, type, detail });

export interface Judged { entity: EntityKey; actor: string; before: Body | null; after: Body; read: Read; admins: string[]; creators?: string[] }

/** A stage model: its initial statuses, and for each move the movers, by how a refusal describes them. */
interface StageModel { initial: string[]; moves: Record<string, { name: string; admits: (j: Judged) => boolean }[]> }

/** The work's holder, as the actor test reads it: the person `claimed_by` names, while the work is live. A done task keeps its `claimed_by`. */
const holds = (body: Body | null | undefined, actor: string) => !!body && isLive(body.status) && ref(body.claimed_by) === actor;
const holder = { name: "the work's holder", admits: (j: Judged) => holds(j.before, j.actor) };
const collaborator = { name: "someone in 'collaborators'", admits: (j: Judged) => people(j.before?.collaborators).includes(j.actor) };
const taskManager = {
  name: "someone in 'project' › 'managers'",
  admits: (j: Judged) => people(parent(j.before ?? j.after, j.read)?.managers).includes(j.actor),
};
const projectManager = { name: "someone in 'managers'", admits: (j: Judged) => people(j.before?.managers).includes(j.actor) };
const projectAdmin = { name: `a member of group '${GROUP_NAMES.admins}'`, admits: (j: Judged) => j.admins.includes(j.actor) };

const STAGE_MODELS: Partial<Record<EntityKey, StageModel>> = {
  task: {
    initial: ['todo'],
    moves: {
      'todo>doing': [holder, collaborator, taskManager],
      'doing>todo': [holder, collaborator, taskManager],
      'doing>done': [holder],
      'todo>done': [holder],
      'done>doing': [taskManager],
      'todo>cancelled': [holder, taskManager],
      'doing>cancelled': [holder, taskManager],
      'cancelled>todo': [taskManager],
    },
  },
  project: {
    initial: ['active'],
    moves: Object.fromEntries(['active>paused', 'paused>active', 'active>closed', 'paused>closed', 'closed>active']
      .map((m) => [m, [projectManager, projectAdmin]])),
  },
};

/** Access, as the record guard decides it before anything else. */
export function judgeAccess({ entity, actor, before, after, read, admins, creators }: Judged): Refusal | null {
  const groups: Groups = { admins, creators };
  if (!before) {
    if (may('create', entity, actor, after, read, groups)) return null;
    // A child entity grants every person a create scoped to the parent; a project or a label, to a group only.
    const detail = entity === 'task' || entity === 'section'
      ? 'no parent this record points to names you in a field your create scope follows'
      : 'no create scope covers this entity for the acting principal';
    return { status: 403, type: 'ENTITY_ACCESS_DENIED', detail };
  }
  if (!may('read', entity, actor, before, read, groups) || !may('update', entity, actor, before, read, groups)) {
    return { status: 404, type: 'ENTITY_RECORD_NOT_FOUND' };
  }
  if ((entity === 'task' || entity === 'section') && !same(before.project, after.project)
    && !may('update', entity, actor, after, read, groups)) {
    return { status: 403, type: 'ENTITY_ACCESS_DENIED', detail: '`project`: the record may not be moved to a parent that does not name you' };
  }
  return null;
}

/** The stage gate: a new record's status, or the move, and who may make it. */
export function judgeMove(j: Judged): Refusal | null {
  const model = STAGE_MODELS[j.entity];
  if (!model) return null;
  const to = String(j.after.status ?? '');
  if (!j.before) {
    return model.initial.includes(to)
      ? null
      : stage('STAGE_INITIAL_STATUS_INVALID', `a record can enter the stage model only in: ${model.initial.join(', ')}`);
  }
  const from = String(j.before.status ?? '');
  if (from === to) return null;
  const movers = model.moves[`${from}>${to}`];
  if (!movers) return stage('STAGE_TRANSITION_NOT_ALLOWED', `no transition from '${from}' to '${to}'`);
  if (movers.some((m) => m.admits(j))) return null;
  return stage('STAGE_TRANSITION_NOT_ALLOWED', `the move from '${from}' to '${to}' is limited to: ${movers.map((m) => m.name).join(', ')}`);
}

/** Every record rule the write breaks, in the order the package declares them. */
export function judgeRules({ entity, actor, before, after, read }: Judged): Refusal | null {
  const changed = (field: string) => !!before && !same(before[field], after[field]);
  if (entity === 'section') {
    return broke(changed('project') ? [violation('project_is_fixed', 'project', 'A record cannot move to another project')] : []);
  }
  if (entity === 'task_label') {
    return broke(changed('base_status') ? [violation('base_status_is_fixed', 'base_status', "A label's base status cannot change")] : []);
  }
  if (entity !== 'task') return null;

  // Actor tests read the record as stored, before this write.
  const stored = before ?? after;
  const project = parent(stored, read);
  const is = {
    holder: holds(stored, actor),
    collaborator: people(stored.collaborators).includes(actor),
    manager: people(project?.managers).includes(actor),
  };
  const out: Violation[] = [];
  if (before && ['title', 'description', 'due', 'priority', 'collaborators'].some(changed) && !is.holder && !is.manager) {
    out.push(violation('content_by_owner_or_manager', 'title', 'Only the owner or a project manager changes this'));
  }
  if (before && ['label', 'blocked', 'section', 'position', 'checklist', 'attachments'].some(changed)
    && !is.holder && !is.collaborator && !is.manager) {
    out.push(violation('board_by_participants', 'label', 'Only the owner, a collaborator or a project manager changes this'));
  }
  if (after.blocked === true && after.status !== 'doing') out.push(violation('blocked_only_while_doing', 'blocked', 'Only a task in progress can be blocked'));
  const labelId = ref(after.label);
  const label = labelId ? read('task_label', labelId) : null;
  if (label && label.base_status !== after.status) out.push(violation('label_matches_status', 'label', 'The label belongs to another status'));
  const sectionId = ref(after.section);
  const section = sectionId ? read('section', sectionId) : null;
  if (section && section.project !== after.project) out.push(violation('section_in_project', 'section', 'The section belongs to another project'));
  if (before && before.frozen === true) out.push(violation('frozen_is_frozen', undefined, 'This task is frozen because its project is closed'));
  if (changed('project')) out.push(violation('project_is_fixed', 'project', 'A record cannot move to another project'));
  if (!before && project?.status === 'closed') out.push(violation('no_task_in_closed_project', 'project', 'A closed project takes no new tasks'));
  return broke(out);
}

/**
 * The real server's verdict on a write: access, then the stage gate, then every broken rule together. `before` is null
 * for a create; `after` is the whole body as it would be stored. The server checks required fields and list limits
 * between the gate and the rules, as the real write does.
 */
export function judgeWrite(input: Judged): Refusal | null {
  return judgeAccess(input) ?? judgeMove(input) ?? judgeRules(input);
}
