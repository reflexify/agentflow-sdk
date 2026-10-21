import { AgentFlowError, newItemId, ok, paginate, type AgentFlowClient, type components, type ListOp } from '@reflexify/agentflow-sdk';
import type { ProjectIds } from '../shared/app-objects.js';
import { doneSince, todayIn, viewerTimeZone } from '../model/dates.js';
import { toLabel, toProject, toSection, toTask, toUnit, type WireRecord } from '../model/records.js';
import type { Attachment, Person, Section, Task, Unit, WorkflowTask } from '../model/types.js';
import {
  ProjectsError,
  type BoardScope,
  type CascadeFacts,
  type ChecklistOp,
  type MyWork,
  type NewTask,
  type ProjectsApi,
  type ProjectsErrorKind,
  type TaskChanges,
} from './projects-api.js';

type FieldFilter = components['schemas']['RecordFieldFilter'];
type WorkLine = components['schemas']['WorkListItem'];
type EntityKey = keyof ProjectIds['entities'];

const PAGE = 200;
const BOARD_BUDGET = 2000;
const MAX_PAGES = 10;
const LIVE = ['todo', 'doing'];

/** What a refused cascading delete says in numbers: `extensions` is read here, as the SDK's error drops it. */
function cascadeOf(extensions: unknown): CascadeFacts | undefined {
  const ext = extensions as { cascade_forbidden?: { by_entity?: { count?: unknown }[] }; cascade?: { found?: unknown; cap?: unknown } } | null | undefined;
  const facts: CascadeFacts = {};
  const groups = ext?.cascade_forbidden?.by_entity;
  if (Array.isArray(groups)) facts.forbidden = groups.reduce((n, g) => n + (typeof g?.count === 'number' ? g.count : 0), 0);
  if (typeof ext?.cascade?.found === 'number') facts.found = ext.cascade.found;
  if (typeof ext?.cascade?.cap === 'number') facts.cap = ext.cascade.cap;
  return Object.keys(facts).length > 0 ? facts : undefined;
}

function toProjectsError(e: unknown, title?: string, extensions?: unknown): ProjectsError {
  if (!(e instanceof AgentFlowError)) return new ProjectsError('offline', 0, 'NETWORK', null, e instanceof Error ? e.message : String(e));
  // A problem's `type` may be a bare code or a URI ending in one.
  const code = e.code.split('/').pop() ?? e.code;
  const picked = (e.fieldErrors?.[0] as { message?: string } | undefined)?.message ?? e.detail ?? title ?? null;
  // A domain refusal's detail starts with its code ("STAGE_TRANSITION_NOT_ALLOWED: the move …"); people read the sentence.
  const reason = picked === null ? null : picked.replace(/^[A-Z][A-Z0-9_]+:\s*/, '') || picked;
  const kind: ProjectsErrorKind =
    e.status === 401 ? 'signed_out'
    : e.status === 403 ? 'forbidden'
    : e.status === 404 || e.status === 410 ? 'not_found'
    : e.status === 409 && code === 'STALE_VERSION' ? 'stale'
    : e.status === 409 ? 'conflict'
    : e.status === 422 && (code === 'ENTITY_VALIDATION_RULE_FAILED' || code === 'STAGE_TRANSITION_NOT_ALLOWED') && reason ? 'refused'
    : e.status === 400 || e.status === 422 ? 'invalid'
    : 'failed';
  return new ProjectsError(kind, e.status, code, reason, e.detail ?? e.message, null, null, null, cascadeOf(extensions));
}

/** `ok()` on a call, with every failure turned into a `ProjectsError`. The problem's title is read here, as `ok` drops it. */
async function call<T>(request: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  try {
    const result = await request;
    try {
      return await ok(Promise.resolve(result));
    } catch (e) {
      const problem = result.error as { title?: unknown; extensions?: unknown } | undefined;
      throw toProjectsError(e, typeof problem?.title === 'string' && problem.title ? problem.title : undefined, problem?.extensions);
    }
  } catch (e) {
    throw e instanceof ProjectsError ? e : toProjectsError(e);
  }
}

const eq = (field: string, value: unknown): FieldFilter => ({ field, op: 'eq', value });
const isLive = (t: Task) => (t.status === 'todo' || t.status === 'doing') && !t.frozen;

function toWorkflowTask(l: WorkLine, claimable: boolean): WorkflowTask | null {
  if (!l.step) return null;
  const label = l.step.step.label || l.title || '';
  return {
    id: l.id,
    entityId: l.entity_id,
    title: label,
    workflow: l.step.workflow.name,
    step: l.step.step.label,
    due: l.due_at ? todayIn(viewerTimeZone(), new Date(l.due_at)) : null,
    groups: l.assigned_group_ids,
    claimable,
  };
}

const toAttachment = (m: components['schemas']['AttachmentMetadata']): Attachment => ({
  id: m.id, name: m.original_filename, size: m.byte_size, type: m.content_type, uploadedAt: m.uploaded_at,
});

export function createHttpProjectsApi(opts: {
  client: AgentFlowClient;
  ids: ProjectIds;
  /** An absolute URL for a published operation's path, under the API `client` calls, that the browser can open itself. */
  apiUrl: (path: string) => string;
  /** The signed-in person, from `host.context.person.id`. */
  personId: string;
  now?: () => Date;
}): ProjectsApi {
  const { client, ids } = opts;
  const now = opts.now ?? (() => new Date());
  const entity = (k: EntityKey) => ids.entities[k];

  const query = (k: EntityKey, filters: FieldFilter[], sort: string, dir: 'asc' | 'desc', cursor?: string) =>
    call(client.POST('/entities/{entity_id}/records/query', {
      params: { path: { entity_id: entity(k) } },
      body: { filter: { field_filters: filters }, sort, dir, limit: PAGE, cursor: cursor ?? null },
    }));

  async function queryAll(k: EntityKey, filters: FieldFilter[], sort: string, dir: 'asc' | 'desc'): Promise<WireRecord[]> {
    const records: WireRecord[] = [];
    let seen: string | undefined;
    for (let i = 0; i < MAX_PAGES; i++) {
      const p = await query(k, filters, sort, dir, seen);
      records.push(...p.items);
      seen = p.next_cursor ?? undefined;
      if (!seen) break;
    }
    return records;
  }

  const get = (k: EntityKey, id: string) =>
    call(client.GET('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: entity(k), record_id: id } },
    }));

  const create = (k: EntityKey, payload: Record<string, unknown>, work?: { assign: { kind: 'user'; id: string }[] }) =>
    call(client.POST('/entities/{entity_id}/records', {
      params: { path: { entity_id: entity(k) } },
      body: { form_payload: payload, ...(work ? { work } : {}) },
    }));

  const patch = (k: EntityKey, id: string, updatedAt: string, changes: Record<string, unknown>) =>
    call(client.PATCH('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: entity(k), record_id: id } },
      body: { changes, expected_updated_at: updatedAt },
    }));

  const remove = async (k: EntityKey, id: string, updatedAt: string) => {
    await call(client.DELETE('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: entity(k), record_id: id }, query: { expected_updated_at: updatedAt } },
    }));
  };

  const taskPath = (task: Pick<Task, 'id'>) => ({ path: { entity_id: entity('task'), record_id: task.id } });

  const work = (view: 'mine' | 'claimable') =>
    paginate((cursor) => call(client.GET('/work', {
      params: { query: { view, live: true, limit: PAGE, ...(cursor ? { cursor } : {}) } },
    })));

  const isMember = async (group: string) => {
    try {
      const g = await call(client.GET('/groups/{group_id}', { params: { path: { group_id: group } } }));
      return g.members.some((m) => m.id === opts.personId);
    } catch (e) {
      if (e instanceof ProjectsError && e.kind === 'not_found') return false;
      throw e;
    }
  };

  const open: FieldFilter[] = [
    { field: 'status', op: 'in', value: LIVE },
    { field: 'frozen', op: 'ne', value: true },
  ];

  const api: ProjectsApi = {
    async viewer() {
      const [projectCreator, projectAdmin] = await Promise.all([isMember(ids.groups.creators), isMember(ids.groups.admins)]);
      return { id: opts.personId, projectAdmin, projectCreator };
    },

    async people() {
      const people: Person[] = [];
      const users = paginate((cursor) => call(client.GET('/users', {
        params: { query: { group_id: ids.groups.users, is_active: true, limit: PAGE, ...(cursor ? { cursor } : {}) } },
      })));
      for await (const u of users) {
        // An app is told only the user fields its package lists, so each may be missing on the wire.
        people.push({ id: u.id, name: u.display_name || u.email || u.id, email: u.email || null });
      }
      return people;
    },

    async names({ users = [], groups = [] }) {
      const names = { users: new Map<string, string>(), groups: new Map<string, string>() };
      if (users.length === 0 && groups.length === 0) return names;
      const r = await call(client.GET('/identities', {
        params: { query: { ...(users.length ? { user_ids: users.join(',') } : {}), ...(groups.length ? { group_ids: groups.join(',') } : {}) } },
      }));
      for (const u of r.users) names.users.set(u.id, u.name);
      for (const g of r.groups) names.groups.set(g.id, g.name);
      return names;
    },

    async projects(statuses) {
      return (await queryAll('project', [{ field: 'status', op: 'in', value: statuses }], 'name', 'asc')).map(toProject);
    },
    project: async (id) => toProject(await get('project', id)),
    async sections(project) {
      return (await queryAll('section', [eq('project', project)], 'position', 'asc')).map(toSection);
    },
    async labels() {
      return (await queryAll('task_label', [], 'name', 'asc')).map(toLabel);
    },

    async boardTasks(scope: BoardScope) {
      const project = eq('project', scope.project);
      const queries: { filters: FieldFilter[]; sort: string; dir: 'asc' | 'desc' }[] = [
        { filters: [project, { field: 'status', op: 'in', value: LIVE }], sort: 'position', dir: 'asc' },
      ];
      if (scope.done !== 'hide') {
        const done: FieldFilter[] = [project, eq('status', 'done')];
        if (scope.done === 'all') {
          queries.push({ filters: done, sort: 'completed_at', dir: 'desc' });
        } else {
          // A task completed a moment ago has no stamp yet: the package's workflow writes it after the move has answered.
          queries.push({ filters: [...done, { field: 'completed_at', op: 'is_empty' }], sort: 'updated_at', dir: 'desc' });
          queries.push({ filters: [...done, { field: 'completed_at', op: 'gte', value: doneSince(scope.done, now()) }], sort: 'completed_at', dir: 'desc' });
        }
      }
      if (scope.cancelled) queries.push({ filters: [project, eq('status', 'cancelled')], sort: 'position', dir: 'asc' });

      const tasks: Task[] = [];
      // The stamp can land between two reads, so one task can answer both of the done window's.
      const seen = new Set<string>();
      let truncated = false;
      for (const q of queries) {
        if (tasks.length >= BOARD_BUDGET) { truncated = true; break; }
        let cursor: string | undefined;
        do {
          const p = await query('task', q.filters, q.sort, q.dir, cursor);
          let read = 0;
          for (; read < p.items.length && tasks.length < BOARD_BUDGET; read++) {
            const t = toTask(p.items[read]!);
            if (seen.has(t.id)) continue;
            seen.add(t.id);
            tasks.push(t);
          }
          cursor = p.next_cursor ?? undefined;
          if (tasks.length >= BOARD_BUDGET) {
            truncated = truncated || read < p.items.length || cursor !== undefined;
            break;
          }
        } while (cursor);
      }
      return { tasks, truncated };
    },

    task: async (id) => toTask(await get('task', id)),

    async myWork(viewerId): Promise<MyWork> {
      const me = viewerId;
      const primary = (await queryAll('task', [eq('claimed_by', me), ...open], 'position', 'asc')).map(toTask);
      const collaborating = (await queryAll('task', [{ field: 'collaborators', op: 'in', value: [me] }, ...open], 'position', 'asc'))
        .map(toTask)
        .filter((t) => t.holder !== me);

      const workflow: WorkflowTask[] = [];
      for await (const line of work('mine')) {
        const t = toWorkflowTask(line, false);
        if (t) workflow.push(t);
      }

      const claimableTasks: Task[] = [];
      for await (const line of work('claimable')) {
        const t = toWorkflowTask(line, true);
        if (t) { workflow.push(t); continue; }
        if (line.entity_id !== ids.entities.task) continue;
        try {
          const task = await api.task(line.id);
          if (isLive(task)) claimableTasks.push(task);
        } catch (e) {
          if (!(e instanceof ProjectsError && e.kind === 'not_found')) throw e;
        }
      }
      return { primary, collaborating, claimableTasks, workflow };
    },

    async createTask(input: NewTask) {
      const payload: Record<string, unknown> = { title: input.title, project: input.project };
      if (input.section) payload.section = input.section;
      if (input.priority) payload.priority = input.priority;
      if (input.due) payload.due = input.due;
      const created = await create('task', payload, input.primary ? { assign: [{ kind: 'user', id: input.primary }] } : undefined);
      // What the create form does not hold goes in one follow-up write: the form shows people only what they fill in.
      const rest: Record<string, unknown> = {};
      if (input.collaborators?.length) rest.collaborators = input.collaborators;
      if (typeof input.position === 'number') rest.position = input.position;
      if (Object.keys(rest).length === 0) return toTask(created);
      try {
        return toTask(await patch('task', created.id, created.updated_at, rest));
      } catch (e) {
        if (!(e instanceof ProjectsError)) throw e;
        throw new ProjectsError('partial', e.status, e.code, e.reason, e.message, toTask(created), e.kind);
      }
    },

    async updateTask(task, changes: TaskChanges) {
      const { showChecklistOnCard, ...rest } = changes;
      const body: Record<string, unknown> = { ...rest };
      if (showChecklistOnCard !== undefined) body.show_checklist_on_card = showChecklistOnCard;
      for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];
      return toTask(await patch('task', task.id, task.updatedAt, body));
    },

    async checklist(task, ops: ChecklistOp[]) {
      const wire = ops.map((op): ListOp => {
        if (op.op === 'add') return { op: 'add', id: newItemId(), values: { text: op.text, done: false }, after: op.after };
        if (op.op === 'set') {
          return { op: 'set', id: op.id, values: { ...(op.text !== undefined ? { text: op.text } : {}), ...(op.done !== undefined ? { done: op.done } : {}) } };
        }
        return op;
      });
      return toTask(await call(client.POST('/entities/{entity_id}/records/{record_id}/list-ops', {
        params: taskPath(task),
        body: { field: 'checklist', ops: wire },
      })));
    },

    async claim(task) {
      await call(client.POST('/entities/{entity_id}/records/{record_id}/work/claim', { params: taskPath(task) }));
    },
    async assign(task, userId) {
      if (task.holder) {
        await call(client.POST('/entities/{entity_id}/records/{record_id}/work/reassign', { params: taskPath(task), body: { user_id: userId } }));
      } else {
        await call(client.POST('/entities/{entity_id}/records/{record_id}/work/assign', {
          params: taskPath(task), body: { assign: [{ kind: 'user', id: userId }] },
        }));
      }
    },
    async release(task) {
      await call(client.POST('/entities/{entity_id}/records/{record_id}/work/release', { params: taskPath(task) }));
    },
    deleteTask: (task) => remove('task', task.id, task.updatedAt),

    async createSection(project, name, position, description) {
      return toSection(await create('section', { project, name, position, ...(description ? { description } : {}) }));
    },
    async updateSection(section: Section, changes) {
      return toSection(await patch('section', section.id, section.updatedAt, { ...changes }));
    },
    deleteSection: (section) => remove('section', section.id, section.updatedAt),

    async createProject(input) {
      const created = await create('project', {
        name: input.name,
        description: input.description,
        ...(input.unit ? { unit: input.unit } : {}),
        managers: input.managers,
        members: input.members,
      });
      // The create form does not hold the grouping, so it goes in one follow-up write.
      if (!input.defaultGroupBy) return toProject(created);
      try {
        return toProject(await patch('project', created.id, created.updated_at, { default_group_by: input.defaultGroupBy }));
      } catch (e) {
        if (!(e instanceof ProjectsError)) throw e;
        throw new ProjectsError('partial', e.status, e.code, e.reason, e.message, null, e.kind, toProject(created));
      }
    },
    async updateProject(project, changes) {
      const { defaultGroupBy, ...rest } = changes;
      const body: Record<string, unknown> = { ...rest };
      if (defaultGroupBy !== undefined) body.default_group_by = defaultGroupBy;
      for (const key of Object.keys(body)) if (body[key] === undefined) delete body[key];
      return toProject(await patch('project', project.id, project.updatedAt, body));
    },

    async units() {
      const units: Unit[] = [];
      const pages = paginate((cursor) => call(client.GET('/units', {
        params: { query: { sort: 'name', dir: 'asc', limit: PAGE, ...(cursor ? { cursor } : {}) } },
      })));
      for await (const u of pages) units.push(toUnit(u));
      return units;
    },

    async createLabel(name, baseStatus) {
      return toLabel(await create('task_label', { name, base_status: baseStatus }));
    },
    async updateLabel(label, changes) {
      return toLabel(await patch('task_label', label.id, label.updatedAt, { name: changes.name }));
    },
    async deleteLabel(label) {
      const summary = await call(client.DELETE('/entities/{entity_id}/records/{record_id}', {
        params: { path: { entity_id: entity('task_label'), record_id: label.id }, query: { expected_updated_at: label.updatedAt } },
      }));
      return { cleared: summary?.cleared_count ?? 0 };
    },

    async upload(file) {
      const form = new FormData();
      form.append('file', file, file.name);
      return toAttachment(await call(client.POST('/attachments', { body: { file: '' }, bodySerializer: () => form })));
    },
    async attachment(id) {
      return toAttachment(await call(client.GET('/attachments/{attachment_id}', { params: { path: { attachment_id: id } } })));
    },
    fileUrl: (id) => opts.apiUrl(`/attachments/${encodeURIComponent(id)}/download`),
    fileBlob: (id) =>
      call(client.GET('/attachments/{attachment_id}/download', { params: { path: { attachment_id: id } }, parseAs: 'blob' })) as Promise<Blob>,
  };
  return api;
}
