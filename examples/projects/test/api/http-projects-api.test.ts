import { createAgentFlowClient, proxyAdapter } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { createHttpProjectsApi } from '../../src/api/http-projects-api.js';
import { isProjectsError } from '../../src/api/projects-api.js';
import { TEST_IDS } from '../support/ids.js';
import { scriptedFetch } from '../support/scripted-fetch.js';
import { aProject, aSection, aTask } from '../support/fixtures.js';

const BASE = 'http://projects.memory/agentflow/api';
const api = (script: ReturnType<typeof scriptedFetch>) =>
  createHttpProjectsApi({ client: createAgentFlowClient({ baseUrl: BASE, auth: proxyAdapter(), fetch: script.fetch, maxRetries: 0 }), ids: TEST_IDS, apiUrl: (p) => BASE + p, personId: 'me', now: () => new Date('2026-10-21T03:00:00Z') });
const page = (items: unknown[], next: string | null = null) => ({ status: 200, body: { items, next_cursor: next, prev_cursor: null } });
const wire = (id: string, body: Record<string, unknown>) => ({ id, org_id: 'o', entity_id: TEST_IDS.entities.task, body, version: 1, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-02T00:00:00Z' });

describe('the HTTP ProjectsApi', () => {
  it('pages a board and stops at 2,000 tasks', async () => {
    const full = (n: number) => Array.from({ length: 200 }, (_, i) => wire(`t${n}-${i}`, { title: 'x', project: 'p', status: 'todo' }));
    const script = scriptedFetch([...Array.from({ length: 10 }, (_, i) => page(full(i), i < 9 ? `c${i}` : 'more'))]);
    const result = await api(script).boardTasks({ project: 'p', done: 'hide', cancelled: false });
    expect(result.tasks).toHaveLength(2000);
    expect(result.truncated).toBe(true);
    expect(script.requests[0]).toMatchObject({ method: 'POST', path: `/entities/${TEST_IDS.entities.task}/records/query`, body: { filter: { field_filters: [{ field: 'project', op: 'eq', value: 'p' }, { field: 'status', op: 'in', value: ['todo', 'doing'] }] }, limit: 200, cursor: null } });
  });

  it('asks for done tasks inside the window, those not stamped yet, and cancelled ones only when shown', async () => {
    const script = scriptedFetch([page([]), page([]), page([]), page([])]);
    await api(script).boardTasks({ project: 'p', done: '7', cancelled: true });
    expect(script.requests.map((r) => (r.body as { filter: { field_filters: unknown[] } }).filter.field_filters.slice(1))).toEqual([
      [{ field: 'status', op: 'in', value: ['todo', 'doing'] }],
      [{ field: 'status', op: 'eq', value: 'done' }, { field: 'completed_at', op: 'is_empty' }],
      [{ field: 'status', op: 'eq', value: 'done' }, { field: 'completed_at', op: 'gte', value: '2026-10-14T03:00:00.000Z' }],
      [{ field: 'status', op: 'eq', value: 'cancelled' }],
    ]);
  });

  it('asks for every done task in one read when the window is all of them', async () => {
    const script = scriptedFetch([page([]), page([])]);
    await api(script).boardTasks({ project: 'p', done: 'all', cancelled: false });
    expect(script.requests.map((r) => (r.body as { filter: { field_filters: unknown[] } }).filter.field_filters.slice(1))).toEqual([
      [{ field: 'status', op: 'in', value: ['todo', 'doing'] }],
      [{ field: 'status', op: 'eq', value: 'done' }],
    ]);
  });

  it('lists a task once when its stamp lands between the two done reads', async () => {
    const done = wire('d1', { title: 'x', project: 'p', status: 'done' });
    const script = scriptedFetch([page([]), page([done]), page([{ ...done, body: { ...done.body, completed_at: '2026-10-21T02:59:00Z' } }])]);
    const result = await api(script).boardTasks({ project: 'p', done: '30', cancelled: false });
    expect(result.tasks.map((t) => t.id)).toEqual(['d1']);
    expect(result.truncated).toBe(false);
  });

  it('keeps to the budget across the done reads, and says the board is cut short', async () => {
    const many = (prefix: string, n: number, status: string) => Array.from({ length: n }, (_, i) => wire(`${prefix}${i}`, { title: 'x', project: 'p', status }));
    const live = Array.from({ length: 9 }, (_, i) => page(many(`l${i}-`, 200, 'todo'), `c${i}`));
    const script = scriptedFetch([...live, page(many('l9-', 150, 'todo')), page(many('u', 30, 'done')), page(many('s', 40, 'done'))]);
    const result = await api(script).boardTasks({ project: 'p', done: '30', cancelled: false });
    expect(result.tasks).toHaveLength(2000);
    expect(result.tasks.filter((t) => t.id.startsWith('u'))).toHaveLength(30);
    expect(result.tasks.filter((t) => t.id.startsWith('s'))).toHaveLength(20);
    expect(result.truncated).toBe(true);
  });

  it('patches with the updated_at it read, and turns a stale write into stale', async () => {
    const script = scriptedFetch([{ status: 409, body: { type: 'STALE_VERSION', title: 'Conflict', status: 409, request_id: 'r' } }]);
    const task = aTask({ id: 't1', updatedAt: '2026-10-02T00:00:00Z' });
    const error = await api(script).updateTask(task, { title: 'new' }).catch((e) => e);
    expect(isProjectsError(error, 'stale')).toBe(true);
    expect(script.requests[0]).toMatchObject({ method: 'PATCH', path: `/entities/${TEST_IDS.entities.task}/records/t1`, body: { changes: { title: 'new' }, expected_updated_at: '2026-10-02T00:00:00Z' } });
  });

  it('carries the server reason on a refusal', async () => {
    const script = scriptedFetch([
      { status: 422, body: { type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Unprocessable Entity', status: 422, request_id: 'r', detail: '1 record rule(s) refused the write', field_errors: [{ path: '/title', message: 'Only the owner or a project manager changes this', rule: '0190f8f4-0000-7000-8000-0000000000a1' }], extensions: { field_errors: { source: 'record' } } } },
      { status: 422, body: { type: 'STAGE_TRANSITION_NOT_ALLOWED', title: 'Invalid', status: 422, request_id: 'r', detail: 'limited to: the work\'s holder' } },
    ]);
    const a = await api(script).updateTask(aTask(), { title: 'x' }).catch((e) => e);
    const b = await api(script).updateTask(aTask(), { status: 'done' }).catch((e) => e);
    expect([a.kind, a.reason]).toEqual(['refused', 'Only the owner or a project manager changes this']);
    expect([b.kind, b.reason]).toEqual(['refused', "limited to: the work's holder"]);
  });

  it('sets a sub-label and its base status in one write', async () => {
    const script = scriptedFetch([{ status: 200, body: wire('t1', { title: 'x', project: 'p', status: 'doing', label: 'l1' }) }]);
    await api(script).updateTask(aTask({ id: 't1', status: 'todo' }), { label: 'l1', status: 'doing' });
    expect(script.requests[0]!.body).toMatchObject({ changes: { label: 'l1', status: 'doing' } });
  });

  it('edits the checklist through list-ops with new item ids', async () => {
    const script = scriptedFetch([{ status: 200, body: wire('t1', { checklist: [] }) }]);
    await api(script).checklist(aTask({ id: 't1' }), [{ op: 'add', text: 'Viết test', after: null }, { op: 'set', id: 'i1', done: true }]);
    const body = script.requests[0]!.body as { field: string; ops: { op: string; id?: string; values?: unknown; after?: unknown }[] };
    expect(script.requests[0]!.path).toBe(`/entities/${TEST_IDS.entities.task}/records/t1/list-ops`);
    expect(body.field).toBe('checklist');
    expect(body.ops[0]).toMatchObject({ op: 'add', values: { text: 'Viết test', done: false }, after: null });
    expect(body.ops[0]!.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.ops[1]).toEqual({ op: 'set', id: 'i1', values: { done: true } });
  });

  it('creates with the create form, then patches what the form does not hold', async () => {
    const created = wire('t9', { title: 'Mới', project: 'p' });
    const script = scriptedFetch([{ status: 201, body: created }, { status: 200, body: wire('t9', { title: 'Mới', project: 'p', collaborators: ['c'] }) }]);
    await api(script).createTask({ project: 'p', title: 'Mới', due: '2026-10-30', priority: 'high', collaborators: ['c'], primary: 'u2' });
    expect(script.requests[0]).toMatchObject({ method: 'POST', body: { form_payload: { title: 'Mới', project: 'p', due: '2026-10-30', priority: 'high' }, work: { assign: [{ kind: 'user', id: 'u2' }] } } });
    expect(script.requests[1]).toMatchObject({ method: 'PATCH', body: { changes: { collaborators: ['c'] }, expected_updated_at: created.updated_at } });
  });

  it('sends the position in the follow-up write, with the collaborators, and makes none when neither is given', async () => {
    const created = wire('t9', { title: 'Mới', project: 'p' });
    const script = scriptedFetch([
      { status: 201, body: created }, { status: 200, body: wire('t9', { title: 'Mới', project: 'p', collaborators: ['c'], position: -1024 }) },
      { status: 201, body: wire('t10', { title: 'Chỉ vị trí', project: 'p' }) }, { status: 200, body: wire('t10', { title: 'Chỉ vị trí', project: 'p', position: 512 }) },
      { status: 201, body: wire('t11', { title: 'Không gì thêm', project: 'p' }) },
    ]);
    const first = await api(script).createTask({ project: 'p', title: 'Mới', collaborators: ['c'], position: -1024 });
    await api(script).createTask({ project: 'p', title: 'Chỉ vị trí', position: 512 });
    await api(script).createTask({ project: 'p', title: 'Không gì thêm', position: null });
    expect(script.requests.map((r) => r.method)).toEqual(['POST', 'PATCH', 'POST', 'PATCH', 'POST']);
    expect((script.requests[0]!.body as { form_payload: Record<string, unknown> }).form_payload).not.toHaveProperty('position');
    expect(script.requests[1]).toMatchObject({ body: { changes: { collaborators: ['c'], position: -1024 }, expected_updated_at: created.updated_at } });
    expect((script.requests[3]!.body as { changes: Record<string, unknown> }).changes).toEqual({ position: 512 });
    expect(first.position).toBe(-1024);
  });

  it('answers partial, with the created task, when the follow-up write for the position fails', async () => {
    const script = scriptedFetch([
      { status: 201, body: wire('t9', { title: 'Mới', project: 'p' }) },
      { status: 409, body: { type: 'STALE_VERSION', title: 'Conflict', status: 409, detail: 'STALE_VERSION: entity_record.updated_at does not match expected_updated_at' } },
    ]);
    const error = await api(script).createTask({ project: 'p', title: 'Mới', position: -1024 }).catch((e) => e);
    expect(error).toMatchObject({ kind: 'partial', underlying: 'stale', task: { id: 't9' } });
  });

  it('builds My Work from two task queries, /work, and a read of each claimable task', async () => {
    const item = (over: Record<string, unknown>) => ({ status: 'active', priority: null, live: true, due_at: null, started_at: null, claimed_by_user_id: null, assigned_user_ids: ['me'], assigned_group_ids: [], assigned_unit_ids: [], clock: null, ...over });
    const script = scriptedFetch([
      page([wire('a', { title: 'A', project: 'p', status: 'doing', claimed_by: 'me' })]),
      page([wire('b', { title: 'B', project: 'p', status: 'todo', collaborators: ['me'] })]),
      page([item({ id: 'w1', entity_id: 'wf', title: 'Duyệt', due_at: '2026-10-22T00:00:00Z', claimed_by_user_id: 'me', step: { workflow: { id: 'x', name: 'Mua sắm' }, step: { key: 'k', label: 'Duyệt đề xuất' }, kind: 'human', signs: false, subject: null } }), item({ id: 'a', entity_id: TEST_IDS.entities.task, title: 'A', claimed_by_user_id: 'me' })]),
      page([item({ id: 'c', entity_id: TEST_IDS.entities.task, title: 'C' }), item({ id: 'w2', entity_id: 'wf', title: 'Ký', assigned_user_ids: [], assigned_group_ids: ['g1'], step: { workflow: { id: 'x', name: 'Mua sắm' }, step: { key: 'k2', label: 'Ký hợp đồng' }, kind: 'human', signs: false, subject: null } })]),
      { status: 200, body: wire('c', { title: 'C', project: 'p', status: 'todo' }) },
    ]);
    const work = await api(script).myWork('me');
    expect(work.primary.map((t) => t.id)).toEqual(['a']);
    expect(work.collaborating.map((t) => t.id)).toEqual(['b']);
    expect(work.claimableTasks.map((t) => t.id)).toEqual(['c']);
    expect(work.workflow).toEqual([
      { id: 'w1', entityId: 'wf', title: 'Duyệt đề xuất', workflow: 'Mua sắm', step: 'Duyệt đề xuất', due: '2026-10-22', groups: [], claimable: false },
      { id: 'w2', entityId: 'wf', title: 'Ký hợp đồng', workflow: 'Mua sắm', step: 'Ký hợp đồng', due: null, groups: ['g1'], claimable: true },
    ]);
    const filters = (i: number) => (script.requests[i]!.body as { filter: { field_filters: unknown[] } }).filter.field_filters;
    const open = [{ field: 'status', op: 'in', value: ['todo', 'doing'] }, { field: 'frozen', op: 'ne', value: true }];
    expect(filters(0)).toEqual([{ field: 'claimed_by', op: 'eq', value: 'me' }, ...open]);
    // A list of references takes `in`; the real server refuses `contains` on one.
    expect(filters(1)).toEqual([{ field: 'collaborators', op: 'in', value: ['me'] }, ...open]);
    expect(script.requests.slice(2, 4).map((r) => r.search)).toEqual(['?view=mine&live=true&limit=200', '?view=claimable&live=true&limit=200']);
    expect(script.requests[4]).toMatchObject({ method: 'GET', path: `/entities/${TEST_IDS.entities.task}/records/c` });
    expect(script.requests).toHaveLength(5);
  });

  it('links a download and reads a preview as a Blob', async () => {
    const script = scriptedFetch([{ status: 200, blob: new Blob(['%PDF-1.7'], { type: 'application/pdf' }) }]);
    const projects = api(script);
    expect(projects.fileUrl('a 1')).toBe(`${BASE}/attachments/a%201/download`);
    const blob = await projects.fileBlob('a1');
    expect(blob.type).toBe('application/pdf');
    expect(script.requests[0]).toMatchObject({ method: 'GET', path: '/attachments/a1/download', search: '' });
  });

  it('maps a network failure to offline and a 404 to not_found', async () => {
    const script = scriptedFetch([{ throws: new TypeError('Failed to fetch') }, { status: 404, body: { type: 'NOT_FOUND', title: 'Not found', status: 404, request_id: 'r' } }]);
    expect((await api(script).task('t').catch((e) => e)).kind).toBe('offline');
    expect((await api(script).task('t').catch((e) => e)).kind).toBe('not_found');
  });

  it('keeps the created task when the follow-up write fails', async () => {
    const created = wire('t9', { title: 'Mới', project: 'p' });
    const script = scriptedFetch([{ status: 201, body: created }, { status: 422, body: { type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Invalid', status: 422, request_id: 'r', detail: 'not a member' } }]);
    const error = await api(script).createTask({ project: 'p', title: 'Mới', collaborators: ['c'] }).catch((e) => e);
    expect(isProjectsError(error, 'partial')).toBe(true);
    expect([error.task.id, error.underlying, error.reason]).toEqual(['t9', 'refused', 'not a member']);
  });

  it('deletes with the updated_at it read', async () => {
    const script = scriptedFetch([{ status: 204 }, { status: 204 }]);
    await api(script).deleteTask(aTask({ id: 't1', updatedAt: '2026-10-02T00:00:00Z' }));
    await api(script).deleteSection(aSection({ id: 's1', updatedAt: '2026-10-03T00:00:00Z' }));
    expect(script.requests[0]).toMatchObject({ method: 'DELETE', path: `/entities/${TEST_IDS.entities.task}/records/t1`, search: '?expected_updated_at=2026-10-02T00%3A00%3A00Z' });
    expect(script.requests[1]).toMatchObject({ method: 'DELETE', path: `/entities/${TEST_IDS.entities.section}/records/s1`, search: '?expected_updated_at=2026-10-03T00%3A00%3A00Z' });
  });

  it('reassigns held work and assigns unheld work', async () => {
    const script = scriptedFetch([{ status: 204 }, { status: 204 }]);
    await api(script).assign(aTask({ id: 't1', holder: 'me' }), 'u2');
    await api(script).assign(aTask({ id: 't2', holder: null }), 'u2');
    expect(script.requests[0]).toMatchObject({ method: 'POST', path: `/entities/${TEST_IDS.entities.task}/records/t1/work/reassign`, body: { user_id: 'u2' } });
    expect(script.requests[1]).toMatchObject({ method: 'POST', path: `/entities/${TEST_IDS.entities.task}/records/t2/work/assign`, body: { assign: [{ kind: 'user', id: 'u2' }] } });
  });

  it('reads the viewer\'s roles from the groups, a 404 meaning not a member', async () => {
    const group = (members: string[]) => ({ status: 200, body: { id: 'g', members: members.map((id) => ({ id })) } });
    const notFound = { status: 404, body: { type: 'NOT_FOUND', title: 'Not found', status: 404, request_id: 'r' } };
    const script = scriptedFetch([group(['me']), notFound]);
    expect(await api(script).viewer()).toEqual({ id: 'me', projectCreator: true, projectAdmin: false });
    expect(script.requests.map((r) => r.path).sort()).toEqual([`/groups/${TEST_IDS.groups.creators}`, `/groups/${TEST_IDS.groups.admins}`]);
    const failing = scriptedFetch([group(['me']), { status: 500, body: { type: 'INTERNAL', title: 'Broken', status: 500, request_id: 'r' } }]);
    expect(isProjectsError(await api(failing).viewer().catch((e) => e), 'failed')).toBe(true);
  });

  it('falls back to the problem title when a refusal has no field error or detail', async () => {
    const script = scriptedFetch([{ status: 422, body: { type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Không được phép', status: 422, request_id: 'r' } }]);
    const error = await api(script).updateTask(aTask(), { title: 'x' }).catch((e) => e);
    expect([error.kind, error.reason]).toEqual(['refused', 'Không được phép']);
  });

  it('calls a new record in a status the stage model does not start in invalid, and a missing record not found', async () => {
    const script = scriptedFetch([
      { status: 422, body: { type: 'STAGE_INITIAL_STATUS_INVALID', title: 'Unprocessable Entity', status: 422, request_id: 'r', detail: 'STAGE_INITIAL_STATUS_INVALID: a record can enter the stage model only in: todo' } },
      { status: 404, body: { type: 'ENTITY_RECORD_NOT_FOUND', title: 'Not Found', status: 404, request_id: 'r', detail: 'not found: entity_record t' } },
    ]);
    const a = await api(script).updateTask(aTask(), { status: 'doing' }).catch((e) => e);
    expect([a.kind, a.code]).toEqual(['invalid', 'STAGE_INITIAL_STATUS_INVALID']);
    expect((await api(script).task('t').catch((e) => e)).kind).toBe('not_found');
  });

  it('gives people the sentence of a reason, without the code the server puts in front of it', async () => {
    const script = scriptedFetch([
      { status: 422, body: { type: 'STAGE_TRANSITION_NOT_ALLOWED', title: 'Unprocessable Entity', status: 422, request_id: 'r', detail: "STAGE_TRANSITION_NOT_ALLOWED: the move from 'doing' to 'done' is limited to: the work's holder" } },
      { status: 422, body: { type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, request_id: 'r', detail: 'VALIDATION_ERROR: required fields cannot be emptied: title' } },
    ]);
    const moved = await api(script).updateTask(aTask(), { status: 'done' }).catch((e) => e);
    expect([moved.kind, moved.reason]).toEqual(['refused', "the move from 'doing' to 'done' is limited to: the work's holder"]);
    const emptied = await api(script).updateTask(aTask(), { title: '' }).catch((e) => e);
    expect([emptied.kind, emptied.reason]).toEqual(['invalid', 'required fields cannot be emptied: title']);
  });

  it('calls a value the field itself refuses invalid, not refused, and keeps its reason', async () => {
    const script = scriptedFetch([{ status: 422, body: {
      type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, request_id: 'r', detail: '1 field constraint(s) refused the write',
      field_errors: [{ path: '/checklist', message: 'has more entries than this field allows', rule: 'maxItems' }],
    } }]);
    const error = await api(script).checklist(aTask(), [{ op: 'add', text: 'x', after: null }]).catch((e) => e);
    expect([error.kind, error.code, error.reason]).toEqual(['invalid', 'VALIDATION_ERROR', 'has more entries than this field allows']);
  });

  describe('projects, units, sections and labels', () => {
    const projectWire = (id: string, body: Record<string, unknown>) => ({ ...wire(id, body), entity_id: TEST_IDS.entities.project });
    const labelWire = (id: string, body: Record<string, unknown>) => ({ ...wire(id, body), entity_id: TEST_IDS.entities.task_label, updated_at: '2026-10-05T00:00:00Z' });
    const input = { name: 'Dự án mới', description: 'Mô tả', unit: 'u1', managers: ['me'], members: ['a', 'b'] };

    it('creates a project with the create form alone when no grouping is chosen', async () => {
      const script = scriptedFetch([{ status: 201, body: projectWire('p1', { name: 'Dự án mới', managers: ['me'], members: ['a', 'b'] }) }]);
      const created = await api(script).createProject(input);
      expect(script.requests).toHaveLength(1);
      expect(script.requests[0]).toMatchObject({
        method: 'POST', path: `/entities/${TEST_IDS.entities.project}/records`,
        body: { form_payload: { name: 'Dự án mới', description: 'Mô tả', unit: 'u1', managers: ['me'], members: ['a', 'b'] } },
      });
      expect(Object.keys((script.requests[0]!.body as { form_payload: object }).form_payload).sort()).toEqual(['description', 'managers', 'members', 'name', 'unit']);
      expect(created).toMatchObject({ id: 'p1', managers: ['me'] });
    });

    it('sets the default grouping in a follow-up write with the version it just got', async () => {
      const made = projectWire('p1', { name: 'Dự án mới' });
      const script = scriptedFetch([{ status: 201, body: made }, { status: 200, body: projectWire('p1', { name: 'Dự án mới', default_group_by: 'status' }) }]);
      const created = await api(script).createProject({ ...input, defaultGroupBy: 'status' });
      expect(script.requests[1]).toMatchObject({
        method: 'PATCH', path: `/entities/${TEST_IDS.entities.project}/records/p1`,
        body: { changes: { default_group_by: 'status' }, expected_updated_at: made.updated_at },
      });
      expect(created.defaultGroupBy).toBe('status');
    });

    it('answers partial, with the created project, when the grouping is refused', async () => {
      const script = scriptedFetch([
        { status: 201, body: projectWire('p1', { name: 'Dự án mới' }) },
        { status: 422, body: { type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Invalid', status: 422, request_id: 'r', detail: 'not allowed' } },
      ]);
      const error = await api(script).createProject({ ...input, defaultGroupBy: 'section' }).catch((e) => e);
      expect(error).toMatchObject({ kind: 'partial', underlying: 'refused', reason: 'not allowed', project: { id: 'p1', name: 'Dự án mới' } });
    });

    it('patches a project with its updated_at, mapping the grouping to its wire name', async () => {
      const script = scriptedFetch([{ status: 200, body: projectWire('p1', { name: 'Mới', default_group_by: 'owner' }) }]);
      const project = aProject({ id: 'p1', updatedAt: '2026-10-02T00:00:00Z' });
      const updated = await api(script).updateProject(project, { name: 'Mới', defaultGroupBy: 'owner', managers: ['me'] });
      expect(script.requests[0]).toMatchObject({
        method: 'PATCH', path: `/entities/${TEST_IDS.entities.project}/records/p1`,
        body: { changes: { name: 'Mới', default_group_by: 'owner', managers: ['me'] }, expected_updated_at: '2026-10-02T00:00:00Z' },
      });
      expect(updated.defaultGroupBy).toBe('owner');
    });

    it('can clear the default grouping, and turns a stale project write into stale', async () => {
      const script = scriptedFetch([
        { status: 200, body: projectWire('p1', { name: 'x' }) },
        { status: 409, body: { type: 'STALE_VERSION', title: 'Conflict', status: 409, request_id: 'r' } },
      ]);
      await api(script).updateProject(aProject({ id: 'p1' }), { defaultGroupBy: null });
      expect((script.requests[0]!.body as { changes: object }).changes).toEqual({ default_group_by: null });
      const error = await api(script).updateProject(aProject({ id: 'p1' }), { name: 'y' }).catch((e) => e);
      expect(isProjectsError(error, 'stale')).toBe(true);
    });

    it('pages the units by name and maps them', async () => {
      const unit = (id: string, name: string, code: string) => ({ id, name, code, parent_id: null, archived: false, archived_at: null, depth: 0, ancestor_names: [], created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' });
      const script = scriptedFetch([page([unit('u1', 'Kỹ thuật', 'KT')], 'next'), page([unit('u2', 'Kinh doanh', 'KD')])]);
      const units = await api(script).units();
      expect(units).toEqual([{ id: 'u1', name: 'Kỹ thuật', code: 'KT' }, { id: 'u2', name: 'Kinh doanh', code: 'KD' }]);
      expect(script.requests[0]).toMatchObject({ method: 'GET', path: '/units' });
      const first = new URLSearchParams(script.requests[0]!.search);
      expect([first.get('sort'), first.get('dir'), first.get('limit')]).toEqual(['name', 'asc', '200']);
      expect(new URLSearchParams(script.requests[1]!.search).get('cursor')).toBe('next');
    });

    it('posts a section with a description only when there is one', async () => {
      const section = (body: Record<string, unknown>) => ({ ...wire('s1', body), entity_id: TEST_IDS.entities.section });
      const script = scriptedFetch([{ status: 201, body: section({ project: 'p', name: 'A' }) }, { status: 201, body: section({ project: 'p', name: 'B', description: 'Mô tả' }) }, { status: 201, body: section({ project: 'p', name: 'C' }) }]);
      await api(script).createSection('p', 'A', 1024);
      const described = await api(script).createSection('p', 'B', 2048, 'Mô tả');
      await api(script).createSection('p', 'C', 3072, '');
      expect(script.requests[0]).toMatchObject({ body: { form_payload: { project: 'p', name: 'A', position: 1024 } } });
      expect((script.requests[0]!.body as { form_payload: object }).form_payload).toEqual({ project: 'p', name: 'A', position: 1024 });
      expect((script.requests[1]!.body as { form_payload: object }).form_payload).toEqual({ project: 'p', name: 'B', position: 2048, description: 'Mô tả' });
      expect((script.requests[2]!.body as { form_payload: object }).form_payload).toEqual({ project: 'p', name: 'C', position: 3072 });
      expect(described.description).toBe('Mô tả');
    });

    it('creates and renames a label with the version it read', async () => {
      const script = scriptedFetch([
        { status: 201, body: labelWire('l1', { name: 'Chờ duyệt', base_status: 'doing' }) },
        { status: 200, body: labelWire('l1', { name: 'Đang duyệt', base_status: 'doing' }) },
      ]);
      const created = await api(script).createLabel('Chờ duyệt', 'doing');
      const renamed = await api(script).updateLabel(created, { name: 'Đang duyệt' });
      expect(script.requests[0]).toMatchObject({ method: 'POST', path: `/entities/${TEST_IDS.entities.task_label}/records`, body: { form_payload: { name: 'Chờ duyệt', base_status: 'doing' } } });
      expect(script.requests[1]).toMatchObject({
        method: 'PATCH', path: `/entities/${TEST_IDS.entities.task_label}/records/l1`,
        body: { changes: { name: 'Đang duyệt' }, expected_updated_at: '2026-10-05T00:00:00Z' },
      });
      expect(renamed).toMatchObject({ name: 'Đang duyệt', baseStatus: 'doing' });
    });

    it('deletes a label with its updated_at, answering how many tasks lost it', async () => {
      const summary = {
        cascade_depth: 0,
        cleared_by_field: [{ count: 3, entity_id: TEST_IDS.entities.task, ref_field: 'label' }],
        cleared_count: 3,
        deleted_by_entity: [{ count: 1, entity_id: TEST_IDS.entities.task_label }],
        deleted_count: 1,
        trash_batch_id: '01a14b30-39cc-7490-bdd3-39b78a13b36c',
      };
      const script = scriptedFetch([{ status: 204 }, { status: 200, body: summary }]);
      const label = { id: 'l1', updatedAt: '2026-10-05T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' as const };
      expect(await api(script).deleteLabel(label)).toEqual({ cleared: 0 });
      expect(await api(script).deleteLabel(label)).toEqual({ cleared: 3 });
      expect(script.requests[0]).toMatchObject({ method: 'DELETE', path: `/entities/${TEST_IDS.entities.task_label}/records/l1`, search: '?expected_updated_at=2026-10-05T00%3A00%3A00Z' });
    });

    it('turns a refused label delete into forbidden, with the server reason', async () => {
      const refusal = {
        detail: 'ENTITY_RECORD_CASCADE_FORBIDDEN: deleting this record would change records you cannot edit',
        extensions: { cascade_forbidden: { by_entity: [{ count: 1, entity_id: TEST_IDS.entities.task, ref_field: 'label' }], hidden: false } },
        instance: `/api/v1/entities/${TEST_IDS.entities.task_label}/records/l1`,
        request_id: '01a14b3038087950a6dcab3850dd2eea',
        status: 403,
        title: 'Forbidden',
        type: 'ENTITY_RECORD_CASCADE_FORBIDDEN',
      };
      const script = scriptedFetch([{ status: 403, body: refusal }]);
      const label = { id: 'l1', updatedAt: '2026-10-05T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' as const };
      const error = await api(script).deleteLabel(label).catch((e) => e);
      expect(error).toMatchObject({
        kind: 'forbidden', status: 403, code: 'ENTITY_RECORD_CASCADE_FORBIDDEN', reason: 'deleting this record would change records you cannot edit',
        cascade: { forbidden: 1 },
      });
    });

    it('carries how many records a refused delete would not let the deleter change, summed over the entities', async () => {
      const script = scriptedFetch([{
        status: 403,
        body: {
          detail: 'ENTITY_RECORD_CASCADE_FORBIDDEN: deleting this record would change records you cannot edit',
          extensions: { cascade_forbidden: { by_entity: [
            { count: 2, entity_id: TEST_IDS.entities.task, ref_field: 'label' }, { count: 3, entity_id: TEST_IDS.entities.task, ref_field: 'label' },
          ], hidden: false } },
          request_id: 'r', status: 403, title: 'Forbidden', type: 'ENTITY_RECORD_CASCADE_FORBIDDEN',
        },
      }]);
      const label = { id: 'l1', updatedAt: '2026-10-05T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' as const };
      expect(await api(script).deleteLabel(label).catch((e) => e)).toMatchObject({ cascade: { forbidden: 5 } });
    });

    it('carries how many records a too large delete would touch, and the most one delete may', async () => {
      const script = scriptedFetch([{
        status: 422,
        body: {
          detail: 'ENTITY_RECORD_CASCADE_TOO_LARGE: deleting this record would touch 501 records; the limit is 500',
          extensions: { cascade: { found: 501, cap: 500 } },
          request_id: 'r', status: 422, title: 'Unprocessable', type: 'ENTITY_RECORD_CASCADE_TOO_LARGE',
        },
      }]);
      const label = { id: 'l1', updatedAt: '2026-10-05T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' as const };
      expect(await api(script).deleteLabel(label).catch((e) => e)).toMatchObject({ code: 'ENTITY_RECORD_CASCADE_TOO_LARGE', cascade: { found: 501, cap: 500 } });
    });

    it('carries no cascade facts for a refusal that has none', async () => {
      const script = scriptedFetch([{ status: 403, body: { detail: 'no', request_id: 'r', status: 403, title: 'Forbidden', type: 'ENTITY_ACCESS_DENIED' } }]);
      const label = { id: 'l1', updatedAt: '2026-10-05T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' as const };
      expect((await api(script).deleteLabel(label).catch((e) => e)).cascade).toBeUndefined();
    });
  });
});
