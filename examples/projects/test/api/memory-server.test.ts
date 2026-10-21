import { applyListOps, createAgentFlowClient, proxyAdapter, type components, type ListItem, type ListOp } from '@reflexify/agentflow-sdk';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CREATE_FORM_FIELDS, createMemoryServer, RULE_IDS, WORKFLOW_DELAY_MS, type Change, type Seed, type SeedRecord, type SeedUnit } from '../../src/api/memory-server.js';
import { appObjectsFor } from '../../src/shared/app-objects.js';
import { TEST_IDS } from '../support/ids.js';

type WireRecord = components['schemas']['EntityRecord'];
type FieldFilter = components['schemas']['RecordFieldFilter'];

const BASE = 'http://projects.memory/agentflow/api';
const NOW = new Date('2026-10-16T03:00:00Z');
const E = TEST_IDS.entities;
const person = (n: number) => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const MANAGER = person(1);
const HOLDER = person(2);
const MEMBER = person(3);
const HELPER = person(4);
const OUTSIDER = person(5);
const ADMIN = person(6);
const P1 = 'p0000000-0000-4000-8000-000000000001';
const P2 = 'p0000000-0000-4000-8000-000000000002';
const S1 = 's0000000-0000-4000-8000-000000000001';
const WF_HELD = 'w0000000-0000-4000-8000-000000000001';
const WF_POOL = 'w0000000-0000-4000-8000-000000000002';

const at = (days: number) => new Date(NOW.getTime() + days * 86_400_000).toISOString();
const rec = (id: string, body: Record<string, unknown>, createdBy: string, createdAt: string, offeredTo?: string[]): SeedRecord =>
  ({ id, body, createdBy, createdAt, ...(offeredTo ? { offeredTo } : {}) });

function seed(): Seed {
  return {
    ids: TEST_IDS,
    people: [
      { id: MANAGER, name: 'Minh', email: 'minh@example.com' }, { id: HOLDER, name: 'Hoa', email: 'hoa@example.com' },
      { id: MEMBER, name: 'Mai', email: null }, { id: HELPER, name: 'Tuấn', email: 'tuan@example.com' },
      { id: OUTSIDER, name: 'Khoa', email: 'khoa@example.com' }, { id: ADMIN, name: 'Lan', email: 'lan@example.com' },
    ],
    groups: { users: [MANAGER, HOLDER, MEMBER, HELPER, OUTSIDER, ADMIN], creators: [ADMIN], admins: [ADMIN] },
    records: {
      project: [
        rec(P1, { name: 'One', managers: [MANAGER], members: [HOLDER, MEMBER], status: 'active' }, MANAGER, at(-30)),
        rec(P2, { name: 'Two', managers: [OUTSIDER], members: [], status: 'active' }, OUTSIDER, at(-30)),
      ],
      section: [rec(S1, { project: P1, name: 'Thiết kế', position: 1024 }, MANAGER, at(-30))],
      task: [
        rec('ta', { title: 'a', project: P1, status: 'todo', claimed_by: HOLDER, collaborators: [HELPER], due: '2026-10-20', position: 1 }, HOLDER, at(-4)),
        rec('tb', { title: 'b', project: P1, status: 'doing', collaborators: [], due: '2026-10-25', position: 2 }, MEMBER, at(-3), [MEMBER]),
        rec('tc', { title: 'c', project: P1, status: 'done', completed_at: '2026-10-10T00:00:00.000Z', position: 3 }, HOLDER, at(-2)),
        rec('td', { title: 'd', project: P1, status: 'cancelled' }, HOLDER, at(-1)),
        rec('te', { title: 'e', project: P2, status: 'todo', claimed_by: OUTSIDER }, OUTSIDER, at(-1)),
      ],
    },
    workflowTasks: [
      { id: WF_HELD, workflow: { id: 'wf1', name: 'Mua sắm' }, step: { key: 'approve', label: 'Duyệt đề xuất mua sắm' }, claimedBy: HOLDER, users: [HOLDER], groups: [], dueAt: at(1), startedAt: at(-1) },
      { id: WF_POOL, workflow: { id: 'wf1', name: 'Mua sắm' }, step: { key: 'receive', label: 'Xác nhận nhận hàng' }, claimedBy: null, users: [], groups: [TEST_IDS.groups.users], dueAt: null, startedAt: at(-1) },
    ],
    files: [{ id: 'f1', name: 'so-do.png', type: 'image/png', bytes: new Uint8Array([137, 80, 78, 71]) }],
  };
}

function setup(as = MANAGER, workflowDelay?: number | 'manual') {
  const server = createMemoryServer(seed(), { now: () => NOW, workflowDelay });
  server.actAs(as);
  const client = createAgentFlowClient({ baseUrl: BASE, auth: proxyAdapter(), fetch: server.fetch, maxRetries: 0 });
  return { server, client };
}
type Setup = ReturnType<typeof setup>;

const query = async ({ client }: Setup, entity: string, filters: FieldFilter[], extra: Partial<components['schemas']['RecordQueryRequest']> = {}) => {
  const r = await client.POST('/entities/{entity_id}/records/query', {
    params: { path: { entity_id: entity } }, body: { filter: { field_filters: filters }, limit: 200, ...extra },
  });
  return r;
};
const titles = async (s: Setup, filters: FieldFilter[], extra: Partial<components['schemas']['RecordQueryRequest']> = {}) =>
  ((await query(s, E.task, filters, extra)).data?.items ?? []).map((r) => r.body.title);
const get = (s: Setup, entity: string, id: string) =>
  s.client.GET('/entities/{entity_id}/records/{record_id}', { params: { path: { entity_id: entity, record_id: id } } });
const patch = (s: Setup, id: string, changes: Record<string, unknown>, expected?: string) => {
  const current = s.server.records('task').find((r) => r.id === id);
  return s.client.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id: E.task, record_id: id } },
    body: { changes, expected_updated_at: expected ?? current?.updated_at ?? '' },
  });
};
const createTask = (s: Setup, payload: Record<string, unknown>, work?: { assign: { kind: 'user'; id: string }[] }) =>
  s.client.POST('/entities/{entity_id}/records', { params: { path: { entity_id: E.task } }, body: { form_payload: payload, ...(work ? { work } : {}) } });
const body = (s: Setup, id: string) => s.server.records('task').find((r) => r.id === id)?.body ?? null;
const workPath = (id: string) => ({ params: { path: { entity_id: E.task, record_id: id } } });
const work = async (s: Setup, view: 'mine' | 'claimable') =>
  (await s.client.GET('/work', { params: { query: { view, live: true, limit: 200 } } })).data!.items;

describe('records queries', () => {
  it('filters with eq, ne, in, contains, is_empty, is_not_empty and gte', async () => {
    const s = setup();
    expect(await titles(s, [{ field: 'status', op: 'eq', value: 'todo' }, { field: 'project', op: 'eq', value: P1 }])).toEqual(['a']);
    expect((await titles(s, [{ field: 'status', op: 'ne', value: 'todo' }])).sort()).toEqual(['b', 'c', 'd']);
    expect((await titles(s, [{ field: 'status', op: 'in', value: ['todo', 'doing'] }])).sort()).toEqual(['a', 'b']);
    expect(await titles(s, [{ field: 'collaborators', op: 'in', value: [HELPER, OUTSIDER] }])).toEqual(['a']);
    expect(await titles(s, [{ field: 'collaborators', op: 'in', value: [OUTSIDER] }])).toEqual([]);
    expect(await titles(s, [{ field: 'title', op: 'contains', value: 'A' }])).toEqual(['a']);
    expect(await titles(s, [{ field: 'status', op: 'in', value: [] }])).toEqual([]);
    expect((await titles(s, [{ field: 'claimed_by', op: 'is_empty' }])).sort()).toEqual(['b', 'c', 'd']);
    expect(await titles(s, [{ field: 'claimed_by', op: 'is_not_empty' }])).toEqual(['a']);
    expect(await titles(s, [{ field: 'completed_at', op: 'gte', value: '2026-10-09T03:00:00.000Z' }])).toEqual(['c']);
    expect(await titles(s, [{ field: 'completed_at', op: 'gte', value: '2026-10-10T00:00:01.000Z' }])).toEqual([]);
    expect(await titles(s, [{ field: 'due', op: 'gte', value: '2026-10-21' }])).toEqual(['b']);
  });

  it('refuses contains on a list of references, as the real server does', async () => {
    const r = await query(setup(), E.task, [{ field: 'collaborators', op: 'contains', value: HELPER }]);
    expect(r.response.status).toBe(400);
    expect(r.error).toEqual({
      type: 'VALIDATION_ERROR', title: 'Bad Request', status: 400, request_id: 'memory',
      detail: "VALIDATION_ERROR: operator not valid for field 'collaborators' of this type",
    });
  });

  it('answers an empty in with no items', async () => {
    const r = await query(setup(), E.task, [{ field: 'status', op: 'in', value: [] }]);
    expect([r.response.status, r.data]).toEqual([200, { items: [], next_cursor: null, prev_cursor: null }]);
  });

  it('pages with limit and a next_cursor', async () => {
    const s = setup();
    const first = (await query(s, E.task, [], { sort: 'title', dir: 'asc', limit: 3 })).data!;
    expect(first.items.map((r) => r.body.title)).toEqual(['a', 'b', 'c']);
    expect(first.next_cursor).toEqual(expect.any(String));
    const second = (await query(s, E.task, [], { sort: 'title', dir: 'asc', limit: 3, cursor: first.next_cursor })).data!;
    expect(second.items.map((r) => r.body.title)).toEqual(['d']);
    expect(second.next_cursor).toBeNull();
  });

  it('sorts by a field, created_at or updated_at, either way, with nulls last', async () => {
    const s = setup();
    const p1 = [{ field: 'project', op: 'eq', value: P1 } as FieldFilter];
    expect(await titles(s, p1, { sort: 'position', dir: 'asc' })).toEqual(['a', 'b', 'c', 'd']);
    expect(await titles(s, p1, { sort: 'position', dir: 'desc' })).toEqual(['c', 'b', 'a', 'd']);
    expect(await titles(s, p1, { sort: 'created_at', dir: 'asc' })).toEqual(['a', 'b', 'c', 'd']);
    expect(await titles(s, p1, { sort: 'created_at', dir: 'desc' })).toEqual(['d', 'c', 'b', 'a']);
    await patch(s, 'tb', { title: 'b' });
    expect((await titles(s, p1, { sort: 'updated_at', dir: 'desc' }))[0]).toBe('b');
    expect(await titles(s, p1, { sort: 'completed_at', dir: 'desc' })).toEqual(expect.arrayContaining(['c']));
    expect((await titles(s, p1, { sort: 'completed_at', dir: 'asc' }))[0]).toBe('c');
  });

  it('answers 400 UNMODELLED_FILTER for an op it does not model', async () => {
    const r = await query(setup(), E.task, [{ field: 'title', op: 'starts_with', value: 'a' }]);
    expect(r.response.status).toBe(400);
    expect(r.error).toMatchObject({ type: 'UNMODELLED_FILTER' });
  });

  it('lists only what the actor may read, and answers 404 to a read or a write of anything else', async () => {
    const s = setup(HELPER);
    expect(await titles(s, [])).toEqual(['a']);
    expect((await get(s, E.task, 'tb')).response.status).toBe(404);
    expect((await patch(s, 'tb', { title: 'x' })).response.status).toBe(404);
    expect((await get(s, E.project, P1)).response.status).toBe(404);
    s.server.actAs(OUTSIDER);
    expect((await get(s, E.task, 'ta')).response.status).toBe(404);
    expect((await patch(s, 'ta', { title: 'x' })).response.status).toBe(404);
    expect(body(s, 'ta')!.title).toBe('a');
  });

  it('answers /app/objects with the seed ids', async () => {
    const r = await setup().client.GET('/app/objects');
    expect(r.data).toEqual(appObjectsFor(TEST_IDS));
  });
});

describe('record writes', () => {
  it('refuses a PATCH with an old expected_updated_at as STALE_VERSION', async () => {
    const s = setup(HOLDER);
    const read = s.server.records('task').find((r) => r.id === 'ta')!;
    expect((await patch(s, 'ta', { title: 'first' }, read.updated_at)).response.status).toBe(200);
    const late = await patch(s, 'ta', { title: 'second' }, read.updated_at);
    expect(late.response.status).toBe(409);
    expect(late.error).toMatchObject({ type: 'STALE_VERSION', detail: 'STALE_VERSION: entity_record.updated_at does not match expected_updated_at' });
    expect(body(s, 'ta')!.title).toBe('first');
  });

  it('answers a rule refusal as the record routes do, one field error per broken rule', async () => {
    const s = setup(MEMBER);
    const one = await patch(s, 'ta', { title: 'renamed' });
    expect(one.response.status).toBe(422);
    expect(one.error).toEqual({
      type: 'ENTITY_VALIDATION_RULE_FAILED', title: 'Unprocessable Entity', status: 422, request_id: 'memory',
      detail: '1 record rule(s) refused the write',
      field_errors: [{ path: '/title', message: 'Only the owner or a project manager changes this', rule: RULE_IDS.content_by_owner_or_manager }],
      extensions: { field_errors: { source: 'record' } },
    });
    const two = await patch(s, 'ta', { title: 'renamed', position: 9 });
    expect(two.error).toMatchObject({
      detail: '2 record rule(s) refused the write',
      field_errors: [{ path: '/title', rule: RULE_IDS.content_by_owner_or_manager }, { path: '/label', rule: RULE_IDS.board_by_participants }],
    });
  });

  it('anchors a rule about the whole record on the empty pointer', async () => {
    const s = setup(HOLDER);
    s.server.write('task', 'ta', { frozen: true }, undefined, { notify: false });
    expect((await patch(s, 'ta', { title: 'x' })).error).toMatchObject({
      type: 'ENTITY_VALIDATION_RULE_FAILED', field_errors: [{ path: '', rule: RULE_IDS.frozen_is_frozen, message: 'This task is frozen because its project is closed' }],
    });
  });

  it('answers a move refusal with a detail and no field errors', async () => {
    const move = await patch(setup(MEMBER), 'ta', { status: 'done' });
    expect(move.response.status).toBe(422);
    expect(move.error).toEqual({ type: 'STAGE_TRANSITION_NOT_ALLOWED', title: 'Unprocessable Entity', status: 422, request_id: 'memory', detail: expect.any(String) });
  });

  it('makes a new task\'s creator its holder, and offers its work to them', async () => {
    const s = setup(MEMBER);
    const created = await createTask(s, { title: 'new', project: P1 });
    expect(created.response.status).toBe(201);
    expect(created.data!.body).toMatchObject({ title: 'new', status: 'todo', claimed_by: MEMBER, priority: 'medium', blocked: false });
    expect(created.data!.created_by).toBe(MEMBER);
    await s.client.POST('/entities/{entity_id}/records/{record_id}/work/release', workPath(created.data!.id));
    expect((await work(s, 'claimable')).map((w) => w.id)).toContain(created.data!.id);
  });

  it('drops a position named on create, which the create form does not bind, and stores it from the follow-up write', async () => {
    const s = setup(MEMBER);
    const created = await createTask(s, { title: 'first', project: P1, position: -1024 });
    expect(created.response.status).toBe(201);
    expect(created.data!.body).not.toHaveProperty('position');
    const placed = await patch(s, created.data!.id, { position: -1024 }, created.data!.updated_at);
    expect(placed.response.status).toBe(200);
    expect(placed.data!.body.position).toBe(-1024);
  });

  it('creates with an assignee, who then holds the work', async () => {
    const s = setup(MANAGER);
    const created = await createTask(s, { title: 'theirs', project: P1 }, { assign: [{ kind: 'user', id: HOLDER }] });
    expect(created.data!.body.claimed_by).toBe(HOLDER);
  });

  it('refuses a new task in a project the actor is not in', async () => {
    const s = setup(HELPER);
    const r = await createTask(s, { title: 'x', project: P1 });
    expect(r.response.status).toBe(403);
  });

  it('deletes with the expected_updated_at, for a manager only; anyone else reads it as missing', async () => {
    const s = setup(HOLDER);
    const del = (expected: string) => s.client.DELETE('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: E.task, record_id: 'ta' }, query: { expected_updated_at: expected } },
    });
    const read = s.server.records('task').find((r) => r.id === 'ta')!;
    const denied = await del('2020-01-01T00:00:00.000Z');
    expect([denied.response.status, denied.error?.type]).toEqual([404, 'ENTITY_RECORD_NOT_FOUND']);
    s.server.actAs(MANAGER);
    const late = await del('2020-01-01T00:00:00.000Z');
    expect([late.response.status, late.error?.type]).toEqual([409, 'STALE_VERSION']);
    expect((await del(read.updated_at)).response.status).toBe(204);
    expect(body(s, 'ta')).toBeNull();
  });

  it('answers a missing record and an unknown entity each with its own not-found code', async () => {
    const s = setup();
    expect((await get(s, E.task, 'nope')).error).toMatchObject({ type: 'ENTITY_RECORD_NOT_FOUND', detail: 'not found: entity_record nope' });
    expect((await get(s, 'no-entity', 'ta')).error).toMatchObject({ type: 'ENTITY_NOT_FOUND', detail: 'not found: entity no-entity' });
  });

  it('answers a readable record written without the grant as missing, before the version check', async () => {
    const s = setup(ADMIN);
    expect((await get(s, E.task, 'ta')).response.status).toBe(200);
    const r = await patch(s, 'ta', { title: 'x' }, '2020-01-01T00:00:00.000Z');
    expect([r.response.status, r.error?.type]).toEqual([404, 'ENTITY_RECORD_NOT_FOUND']);
  });

  it('requires expected_updated_at on a PATCH and a DELETE, and compares it as an instant', async () => {
    const s = setup(HOLDER);
    const bare = await s.server.fetch(new Request(`${BASE}/entities/${E.task}/records/ta`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ changes: { title: 'x' } }),
    }));
    expect(bare.status).toBe(400);
    expect(await bare.json()).toMatchObject({ type: 'MALFORMED_JSON', field_errors: [{ path: 'expected_updated_at', rule: 'type' }] });
    const noQuery = await s.server.fetch(new Request(`${BASE}/entities/${E.task}/records/ta`, { method: 'DELETE' }));
    expect([noQuery.status, (await noQuery.json()).type]).toEqual([400, 'INVALID_QUERY_PARAMETER']);
    const read = s.server.records('task').find((r) => r.id === 'ta')!;
    const offset = new Date(Date.parse(read.updated_at)).toISOString().replace('Z', '+00:00');
    expect((await patch(s, 'ta', { title: 'same moment' }, offset)).response.status).toBe(200);
  });

  it('refuses a PATCH that clears a required field', async () => {
    const r = await patch(setup(HOLDER), 'ta', { title: null });
    expect(r.error).toMatchObject({ type: 'VALIDATION_ERROR', detail: "VALIDATION_ERROR: required field 'title' cannot be cleared" });
  });

  it('creates from what the create form binds, and drops any other key, as the real form mapping does', async () => {
    const r = await createTask(setup(MEMBER), { title: 'x', project: P1, status: 'doing', collaborators: [HELPER], claimed_by: HELPER, checklist_total: 9 });
    expect(r.response.status).toBe(201);
    expect(r.data!.body).toMatchObject({ title: 'x', status: 'todo', claimed_by: MEMBER, checklist_total: 0 });
    expect(r.data!.body).not.toHaveProperty('collaborators');
  });

  it('gives a new project no board grouping of its own, so its board falls back on whether it has sections', () => {
    const created = setup(ADMIN).server.write('project', null, { name: 'Mới', managers: [ADMIN] });
    expect(created.body.status).toBe('active');
    expect(created.body).not.toHaveProperty('default_group_by');
  });

  it("binds on create exactly the fields each entity's create form binds", () => {
    for (const key of Object.keys(CREATE_FORM_FIELDS) as (keyof typeof CREATE_FORM_FIELDS)[]) {
      const config = JSON.parse(readFileSync(new URL(`../../config/entities/${key}.json`, import.meta.url), 'utf8')) as {
        create_form: { schema: { properties: Record<string, { 'x-entityField'?: string }> } };
      };
      const bound = Object.values(config.create_form.schema.properties).flatMap((p) => (p['x-entityField'] ? [p['x-entityField']] : []));
      expect([...CREATE_FORM_FIELDS[key]].sort(), key).toEqual(bound.sort());
    }
  });

  it('refuses to delete a project its tasks and sections still point to', async () => {
    const s = setup(ADMIN);
    const project = s.server.records('project').find((r) => r.id === P1)!;
    const r = await s.client.DELETE('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: E.project, record_id: P1 }, query: { expected_updated_at: project.updated_at } },
    });
    expect(r.response.status).toBe(409);
    expect(r.error).toMatchObject({
      type: 'ENTITY_RECORD_IN_USE', detail: 'ENTITY_RECORD_IN_USE: 5 record(s) still reference this record',
      extensions: { record_in_use: { total: 5, withheld: 0, entities: [{ entity_id: E.task, count: 4 }, { entity_id: E.section, count: 1 }] } },
    });
  });

  it('lets a test make the next matching request fail', async () => {
    const s = setup(HOLDER);
    s.server.failNext('PATCH', /records/, 422, { type: 'VALIDATION_ERROR', title: 'Invalid', status: 422, request_id: 'memory' });
    expect((await patch(s, 'ta', { title: 'x' })).response.status).toBe(422);
    expect(body(s, 'ta')!.title).toBe('a');
    expect((await patch(s, 'ta', { title: 'x' })).response.status).toBe(200);
  });
});

describe('list-ops', () => {
  const ops = (s: Setup, list: ListOp[]) =>
    s.client.POST('/entities/{entity_id}/records/{record_id}/list-ops', { ...workPath('ta'), body: { field: 'checklist', ops: list } });

  it('applies add, set, move and remove as the SDK does', async () => {
    const s = setup(HOLDER);
    const list: ListOp[] = [
      { op: 'add', id: 'i1', values: { text: 'one', done: false }, after: null },
      { op: 'add', id: 'i2', values: { text: 'two', done: false }, after: 'i1' },
      { op: 'add', id: 'i3', values: { text: 'three', done: false } },
      { op: 'set', id: 'i2', values: { done: true } },
      { op: 'move', id: 'i3', after: null },
      { op: 'remove', id: 'i1' },
    ];
    const r = await ops(s, list);
    expect(r.response.status).toBe(200);
    expect(r.data!.body.checklist).toEqual(applyListOps([], list));
    expect(r.data!.body).toMatchObject({ checklist_done: 1, checklist_total: 2 });
  });

  it('refuses a 21st item', async () => {
    const s = setup(HOLDER);
    const twenty: ListOp[] = Array.from({ length: 20 }, (_, i) => ({ op: 'add', id: `i${i}`, values: { text: `item ${i}`, done: false } }));
    expect((await ops(s, twenty)).response.status).toBe(200);
    const r = await ops(s, [{ op: 'add', id: 'more', values: { text: 'one more', done: false }, after: null }]);
    expect(r.response.status).toBe(422);
    expect(r.error).toEqual({
      type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, request_id: 'memory', detail: '1 field constraint(s) refused the write',
      field_errors: [{ path: '/checklist', message: 'has more entries than this field allows', rule: 'maxItems' }],
      extensions: { field_errors: { source: 'record' } },
    });
    expect((body(s, 'ta')!.checklist as ListItem[]).length).toBe(20);
  });

  it('judges the change by the rules', async () => {
    const r = await ops(setup(MEMBER), [{ op: 'add', values: { text: 'x', done: false } }]);
    expect(r.error).toMatchObject({ type: 'ENTITY_VALIDATION_RULE_FAILED', field_errors: [{ rule: RULE_IDS.board_by_participants, message: 'Only the owner, a collaborator or a project manager changes this' }] });
  });
});

describe('work', () => {
  it('claims, assigns, reassigns and releases, changing claimed_by', async () => {
    const s = setup(HOLDER);
    expect((await s.client.POST('/entities/{entity_id}/records/{record_id}/work/release', workPath('ta'))).data).toMatchObject({ record_id: 'ta', claimed_by_user_id: null });
    expect(body(s, 'ta')!.claimed_by).toBeUndefined();
    s.server.actAs(MEMBER);
    expect((await s.client.POST('/entities/{entity_id}/records/{record_id}/work/claim', workPath('ta'))).response.status).toBe(200);
    expect(body(s, 'ta')!.claimed_by).toBe(MEMBER);
    expect((await s.client.POST('/entities/{entity_id}/records/{record_id}/work/reassign', { ...workPath('ta'), body: { user_id: HOLDER } })).response.status).toBe(200);
    expect(body(s, 'ta')!.claimed_by).toBe(HOLDER);
    s.server.actAs(MANAGER);
    await s.client.POST('/entities/{entity_id}/records/{record_id}/work/release', workPath('ta'));
    const assigned = await s.client.POST('/entities/{entity_id}/records/{record_id}/work/assign', { ...workPath('ta'), body: { assign: [{ kind: 'user', id: MEMBER }] } });
    expect(assigned.data).toMatchObject({ claimed_by_user_id: MEMBER, assigned_user_ids: [MEMBER] });
    expect(body(s, 'ta')!.claimed_by).toBe(MEMBER);
  });

  it('refuses a member who may read the task every work operation on someone else\'s work', async () => {
    const s = setup(MEMBER);
    const op = (verb: 'assign' | 'reassign' | 'release', b?: object) =>
      s.client.POST(`/entities/{entity_id}/records/{record_id}/work/${verb}` as '/entities/{entity_id}/records/{record_id}/work/release', { ...workPath('ta'), ...(b ? { body: b } : {}) } as never);
    for (const [verb, b] of [['assign', { assign: [{ kind: 'user', id: MEMBER }] }], ['reassign', { user_id: MEMBER }], ['release', undefined]] as const) {
      const r = await op(verb, b);
      expect([r.response.status, (r.error as { type?: string } | undefined)?.type], verb).toEqual([403, 'ENTITY_ACCESS_DENIED']);
    }
    expect(body(s, 'ta')!.claimed_by).toBe(HOLDER);
  });

  it('hands unheld work on for a manager only, and only to an active member', async () => {
    const s = setup(MEMBER);
    const reassign = (to: string) => s.client.POST('/entities/{entity_id}/records/{record_id}/work/reassign', { ...workPath('tb'), body: { user_id: to } });
    expect((await reassign(HOLDER)).error).toMatchObject({ type: 'ENTITY_ACCESS_DENIED', detail: 'ENTITY_ACCESS_DENIED: you may not hand this work on' });
    s.server.actAs(MANAGER);
    expect((await reassign('nobody')).error).toMatchObject({ type: 'WORK_REASSIGN_TARGET_INVALID' });
    expect((await reassign(HOLDER)).response.status).toBe(200);
    expect(body(s, 'tb')!.claimed_by).toBe(HOLDER);
  });

  it('offers assigned work to the assignee', async () => {
    const s = setup(MANAGER);
    await s.client.POST('/entities/{entity_id}/records/{record_id}/work/assign', { ...workPath('tb'), body: { assign: [{ kind: 'user', id: HOLDER }] } });
    s.server.actAs(HOLDER);
    await s.client.POST('/entities/{entity_id}/records/{record_id}/work/release', workPath('tb'));
    expect((await work(s, 'claimable')).map((w) => w.id)).toContain('tb');
    s.server.actAs(MEMBER);
    expect((await work(s, 'claimable')).map((w) => w.id)).not.toContain('tb');
  });

  it('lets only a manager assign, and refuses to claim work someone holds or that has ended', async () => {
    const s = setup(MEMBER);
    const refused = await s.client.POST('/entities/{entity_id}/records/{record_id}/work/assign', { ...workPath('tb'), body: { assign: [{ kind: 'user', id: MEMBER }] } });
    expect([refused.response.status, refused.error?.type]).toEqual([403, 'ENTITY_ACCESS_DENIED']);
    const held = await s.client.POST('/entities/{entity_id}/records/{record_id}/work/claim', workPath('ta'));
    expect([held.response.status, held.error?.type]).toEqual([409, 'WORK_ALREADY_CLAIMED']);
    s.server.actAs(HOLDER);
    const again = await s.client.POST('/entities/{entity_id}/records/{record_id}/work/claim', workPath('ta'));
    expect(again.error).toMatchObject({ type: 'WORK_ALREADY_CLAIMED', detail: `WORK_ALREADY_CLAIMED: already claimed by ${HOLDER}` });
    s.server.actAs(MEMBER);
    const ended = await s.client.POST('/entities/{entity_id}/records/{record_id}/work/claim', workPath('tc'));
    expect([ended.response.status, ended.error?.type]).toEqual([409, 'WORK_NOT_ACTIVE']);
    s.server.actAs(OUTSIDER);
    expect((await s.client.POST('/entities/{entity_id}/records/{record_id}/work/claim', workPath('tb'))).response.status).toBe(404);
  });
});

describe('ending and restarting', () => {
  it('ends the work on done, keeping its holder, stamps completed_at a tick later, and gives a reopened task back to its creator', async () => {
    const s = setup(MANAGER);
    await s.client.POST('/entities/{entity_id}/records/{record_id}/work/reassign', { ...workPath('ta'), body: { user_id: MEMBER } });
    s.server.actAs(MEMBER);
    const done = await patch(s, 'ta', { status: 'done' });
    expect(done.response.status).toBe(200);
    expect(done.data!.body).toMatchObject({ status: 'done', claimed_by: MEMBER });
    expect(done.data!.body.completed_at).toBeUndefined();
    await s.server.drain();
    expect(body(s, 'ta')).toMatchObject({ status: 'done', claimed_by: MEMBER, completed_at: NOW.toISOString() });
    expect((await work(s, 'mine')).map((w) => w.id)).not.toContain('ta');
    s.server.actAs(MANAGER);
    expect((await patch(s, 'ta', { status: 'doing' })).response.status).toBe(200);
    await s.server.drain();
    expect(body(s, 'ta')!.completed_at).toBeUndefined();
    expect(body(s, 'ta')!.claimed_by).toBe(HOLDER);
  });

  it('makes the done response stale once the stamp lands, and a write after a re-read goes through', async () => {
    const s = setup(HOLDER);
    const seen: Change[] = [];
    s.server.onChange((c) => seen.push(c));
    const done = await patch(s, 'ta', { status: 'done' });
    expect(seen.filter((c) => c.entity === 'task')).toHaveLength(1);
    await s.server.drain();
    expect(seen.filter((c) => c.entity === 'task')).toEqual([{ entity: 'task', id: 'ta', kind: 'updated' }, { entity: 'task', id: 'ta', kind: 'updated' }]);
    const late = await patch(s, 'ta', { priority: 'high' }, done.data!.updated_at);
    expect([late.response.status, late.error?.type]).toEqual([409, 'STALE_VERSION']);
    s.server.actAs(MANAGER);
    const fresh = await get(s, E.task, 'ta');
    expect((await patch(s, 'ta', { priority: 'high' }, fresh.data!.updated_at)).response.status).toBe(200);
  });

  it('lands the stamp by itself once its delay has passed, without a drain', async () => {
    const s = setup(HOLDER, 40);
    await patch(s, 'ta', { status: 'done' });
    await new Promise((r) => setTimeout(r, 10));
    expect(body(s, 'ta')!.completed_at).toBeUndefined();
    await new Promise((r) => setTimeout(r, 60));
    expect(body(s, 'ta')!.completed_at).toBe(NOW.toISOString());
  });

  it('holds the stamp until a drain when its delay is manual', async () => {
    const s = setup(HOLDER, 'manual');
    await patch(s, 'ta', { status: 'done' });
    await new Promise((r) => setTimeout(r, 30));
    expect(body(s, 'ta')!.completed_at).toBeUndefined();
    await s.server.drain();
    expect(body(s, 'ta')!.completed_at).toBe(NOW.toISOString());
  });

  it('waits about as long as a run on the real server by default', () => {
    expect(WORKFLOW_DELAY_MS).toBe(800);
  });

  it('ends the work of a cancelled task, without a completed_at, and restarts it on restore', async () => {
    const s = setup(HOLDER);
    expect((await patch(s, 'ta', { status: 'cancelled' })).response.status).toBe(200);
    await s.server.drain();
    expect(body(s, 'ta')!.claimed_by).toBe(HOLDER);
    expect(body(s, 'ta')!.completed_at).toBeUndefined();
    expect((await work(s, 'mine')).map((w) => w.id)).not.toContain('ta');
    s.server.actAs(MANAGER);
    expect((await patch(s, 'ta', { status: 'todo' })).response.status).toBe(200);
    expect(body(s, 'ta')!.claimed_by).toBe(HOLDER);
    expect((await patch(s, 'tc', { status: 'doing' })).response.status).toBe(200);
    await s.server.drain();
    expect(body(s, 'tc')!.completed_at).toBeUndefined();
    expect(body(s, 'tc')!.claimed_by).toBe(HOLDER);
  });
});

describe('rollups', () => {
  const counts = (s: Setup) => {
    const p = s.server.records('project').find((r) => r.id === P1)!.body;
    const sec = s.server.records('section').find((r) => r.id === S1)!.body;
    return { todo: p.tasks_todo, doing: p.tasks_doing, done: p.tasks_done, sectionDone: sec.tasks_done, sectionTotal: sec.tasks_total };
  };

  it('counts a project\'s and a section\'s tasks on every task write', async () => {
    const s = setup(HOLDER);
    expect(counts(s)).toEqual({ todo: 1, doing: 1, done: 1, sectionDone: 0, sectionTotal: 0 });
    await patch(s, 'ta', { section: S1 });
    expect(counts(s)).toMatchObject({ sectionDone: 0, sectionTotal: 1 });
    await patch(s, 'ta', { status: 'done' });
    expect(counts(s)).toEqual({ todo: 0, doing: 1, done: 2, sectionDone: 1, sectionTotal: 1 });
    s.server.write('task', null, { title: 'by someone', project: P1, section: S1, status: 'cancelled' }, MANAGER);
    expect(counts(s)).toMatchObject({ sectionTotal: 1 });
    s.server.write('task', null, { title: 'by someone', project: P1, section: S1, status: 'doing' }, MANAGER);
    expect(counts(s)).toEqual({ todo: 0, doing: 2, done: 2, sectionDone: 1, sectionTotal: 2 });
    s.server.remove('task', 'ta');
    expect(counts(s)).toEqual({ todo: 0, doing: 2, done: 1, sectionDone: 0, sectionTotal: 1 });
  });
});

describe('closing a project', () => {
  it('freezes its tasks, and unfreezes them when it reopens, as the package\'s workflows do', async () => {
    const s = setup(MANAGER);
    const project = () => s.server.records('project').find((r) => r.id === P1)!;
    const status = (to: string) => s.client.PATCH('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: E.project, record_id: P1 } }, body: { changes: { status: to }, expected_updated_at: project().updated_at },
    });
    expect((await status('closed')).response.status).toBe(200);
    const read = s.server.records('task').find((r) => r.id === 'ta')!;
    expect(body(s, 'ta')!.frozen).toBe(false);
    await s.server.drain();
    expect(['ta', 'tb', 'tc', 'td'].map((t) => body(s, t)!.frozen)).toEqual([true, true, true, true]);
    expect(s.server.records('task').find((r) => r.id === 'ta')!.updated_at > read.updated_at).toBe(true);
    expect(body(s, 'te')!.frozen).toBe(false);
    expect((await patch(s, 'ta', { title: 'x' })).error).toMatchObject({ field_errors: [{ message: 'This task is frozen because its project is closed' }] });
    expect((await createTask(s, { title: 'late', project: P1 })).error).toMatchObject({ field_errors: [{ path: '/project', message: 'A closed project takes no new tasks' }] });
    expect((await status('active')).response.status).toBe(200);
    await s.server.drain();
    expect(body(s, 'ta')!.frozen).toBe(false);
  });

  it('moves a project only along its stage model, for its managers and the admins', async () => {
    const s = setup(HOLDER);
    const project = () => s.server.records('project').find((r) => r.id === P1)!;
    const status = (to: string) => s.client.PATCH('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: E.project, record_id: P1 } }, body: { changes: { status: to }, expected_updated_at: project().updated_at },
    });
    expect([(await status('paused')).response.status, (await status('paused')).error?.type]).toEqual([404, 'ENTITY_RECORD_NOT_FOUND']);
    s.server.actAs(ADMIN);
    expect((await status('paused')).response.status).toBe(200);
    expect((await status('closed')).response.status).toBe(200);
    expect((await status('paused')).error).toMatchObject({ type: 'STAGE_TRANSITION_NOT_ALLOWED' });
  });
});

describe('people', () => {
  it('lists a group\'s members to anyone in the organization, and answers 404 for no such group', async () => {
    const s = setup(MEMBER);
    const g = await s.client.GET('/groups/{group_id}', { params: { path: { group_id: TEST_IDS.groups.admins } } });
    expect(g.response.status).toBe(200);
    expect(g.data!.members.map((m) => m.id)).toEqual([ADMIN]);
    expect((await s.client.GET('/groups/{group_id}', { params: { path: { group_id: 'nope' } } })).response.status).toBe(404);
  });

  it('filters users by group', async () => {
    const s = setup();
    const r = await s.client.GET('/users', { params: { query: { group_id: TEST_IDS.groups.creators, is_active: true } } });
    expect(r.data!.items.map((u) => [u.id, u.display_name])).toEqual([[ADMIN, 'Lan']]);
    const all = await s.client.GET('/users', { params: { query: { group_id: TEST_IDS.groups.users, limit: 4 } } });
    expect(all.data!.items).toHaveLength(4);
    expect(all.data!.next_cursor).toEqual(expect.any(String));
  });

  it('names users and groups', async () => {
    const r = await setup().client.GET('/identities', { params: { query: { user_ids: `${HOLDER},${HELPER},nobody`, group_ids: TEST_IDS.groups.users } } });
    expect(r.data!.users).toEqual([{ id: HOLDER, name: 'Hoa' }, { id: HELPER, name: 'Tuấn' }]);
    expect(r.data!.groups.map((g) => g.id)).toEqual([TEST_IDS.groups.users]);
  });
});

describe('/work', () => {
  it('lists the live tasks and the workflow tasks the actor holds', async () => {
    const s = setup(HOLDER);
    const mine = await work(s, 'mine');
    expect(mine.map((w) => w.id).sort()).toEqual(['ta', WF_HELD].sort());
    expect(mine.find((w) => w.id === 'ta')).toMatchObject({ entity_id: E.task, claimed_by_user_id: HOLDER, live: true });
    expect(mine.find((w) => w.id === WF_HELD)?.step).toMatchObject({ workflow: { name: 'Mua sắm' }, step: { label: 'Duyệt đề xuất mua sắm' } });
  });

  it('lists unheld work offered to the actor or one of their groups, and never work offered to someone else', async () => {
    const s = setup(MEMBER);
    expect((await work(s, 'claimable')).map((w) => w.id).sort()).toEqual(['tb', WF_POOL].sort());
    s.server.actAs(HOLDER);
    expect((await work(s, 'claimable')).map((w) => w.id)).toEqual([WF_POOL]);
  });
});

describe('attachments', () => {
  it('stores a file, reads its metadata back, and downloads it as an attachment', async () => {
    const s = setup();
    const form = new FormData();
    form.append('file', new File([new Uint8Array([1, 2, 3])], 'báo cáo.pdf', { type: 'application/pdf' }));
    const up = await s.client.POST('/attachments', { body: { file: '' }, bodySerializer: () => form });
    expect(up.response.status).toBe(201);
    expect(up.data).toMatchObject({ original_filename: 'báo cáo.pdf', byte_size: 3, content_type: 'application/pdf' });
    const meta = await s.client.GET('/attachments/{attachment_id}', { params: { path: { attachment_id: up.data!.id } } });
    expect(meta.data).toEqual(up.data);
    const download = await s.server.fetch(new Request(`${BASE}/attachments/${up.data!.id}/download`));
    expect(download.headers.get('content-type')).toBe('application/pdf');
    expect(download.headers.get('content-disposition')).toMatch(/^attachment/);
    expect([...new Uint8Array(await download.arrayBuffer())]).toEqual([1, 2, 3]);
  });

  it('names a task\'s files in file_labels', async () => {
    const s = setup(HOLDER);
    const r = await patch(s, 'ta', { attachments: ['f1'] });
    expect((r.data as WireRecord).file_labels).toEqual({ attachments: { f1: 'so-do.png' } });
  });
});

describe('changes', () => {
  it('calls the listeners once for every write through fetch', async () => {
    const s = setup(HOLDER);
    const seen: Change[] = [];
    s.server.onChange((c) => seen.push(c));
    await patch(s, 'ta', { title: 'x' });
    await s.client.POST('/entities/{entity_id}/records/{record_id}/list-ops', { ...workPath('ta'), body: { field: 'checklist', ops: [{ op: 'add', values: { text: 'x', done: false } }] } });
    await s.client.POST('/entities/{entity_id}/records/{record_id}/work/release', workPath('ta'));
    expect(seen).toEqual([
      { entity: 'task', id: 'ta', kind: 'updated' }, { entity: 'task', id: 'ta', kind: 'updated' }, { entity: 'task', id: 'ta', kind: 'updated' },
    ]);
  });

  it('announces a parent whose rollup a task write moved, after the task, without a new version', async () => {
    const s = setup(HOLDER);
    const seen: Change[] = [];
    s.server.onChange((c) => seen.push(c));
    const project = () => s.server.records('project').find((r) => r.id === P1)!;
    const before = project();
    await patch(s, 'ta', { section: S1 });
    const created = await createTask(s, { title: 'new', project: P1 });
    await patch(s, 'ta', { status: 'done' });
    expect(seen).toEqual([
      { entity: 'task', id: 'ta', kind: 'updated' }, { entity: 'section', id: S1, kind: 'updated' },
      { entity: 'task', id: created.data!.id, kind: 'created' }, { entity: 'project', id: P1, kind: 'updated' },
      { entity: 'task', id: 'ta', kind: 'updated' }, { entity: 'project', id: P1, kind: 'updated' }, { entity: 'section', id: S1, kind: 'updated' },
    ]);
    expect([project().updated_at, project().version]).toEqual([before.updated_at, before.version]);
  });

  it('calls them for server.write and server.remove, unless told not to', () => {
    const { server } = setup();
    const seen: Change[] = [];
    const stop = server.onChange((c) => seen.push(c));
    const before = server.records('task').find((r) => r.id === 'ta')!;
    const written = server.write('task', 'ta', { title: 'quiet' }, HOLDER, { notify: false });
    expect(seen).toEqual([]);
    expect(written.updated_at > before.updated_at).toBe(true);
    server.write('task', 'ta', { title: 'loud' });
    server.remove('task', 'tb');
    server.remove('task', 'tc', { notify: false });
    expect(seen).toEqual([
      { entity: 'task', id: 'ta', kind: 'updated' }, { entity: 'task', id: 'tb', kind: 'deleted' }, { entity: 'project', id: P1, kind: 'updated' },
    ]);
    stop();
    server.write('task', 'ta', { title: 'unheard' });
    expect(seen).toHaveLength(3);
  });
});

describe('projects', () => {
  const entityPath = (entity: string, id?: string) => `${BASE}/entities/${entity}/records${id ? `/${id}` : ''}`;
  const send = (s: Setup, method: string, url: string, body?: unknown) =>
    s.server.fetch(new Request(url, { method, headers: { 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }));
  const stored = (s: Setup, entity: 'project' | 'task_label', id: string) => s.server.records(entity).find((r) => r.id === id)!;
  const patchRecord = (s: Setup, entity: 'project' | 'task_label', id: string, changes: Record<string, unknown>) =>
    send(s, 'PATCH', entityPath(E[entity], id), { changes, expected_updated_at: stored(s, entity, id).updated_at });
  const createProject = (s: Setup, payload: Record<string, unknown>) => send(s, 'POST', entityPath(E.project), { form_payload: payload });

  it('stores the managers a create names, and the creator when it names none', async () => {
    const named = setup(ADMIN);
    const created = await createProject(named, { name: 'Ra mắt', managers: [HOLDER], members: [MEMBER], unit: 'u1', default_group_by: 'status' });
    expect(created.status).toBe(201);
    expect((await created.json()).body).toEqual({
      name: 'Ra mắt', managers: [HOLDER], members: [MEMBER], unit: 'u1', status: 'active',
      tasks_todo: 0, tasks_doing: 0, tasks_done: 0,
    });
    const bare = await createProject(setup(ADMIN), { name: 'Một mình' });
    expect((await bare.json()).body).toMatchObject({ name: 'Một mình', managers: [ADMIN], status: 'active' });
  });

  it('refuses a create by anyone outside the creators group, as the entity with no create scope does', async () => {
    const refused = await createProject(setup(HOLDER), { name: 'x', managers: [HOLDER] });
    expect(refused.status).toBe(403);
    expect(await refused.json()).toEqual({
      type: 'ENTITY_ACCESS_DENIED', title: 'Forbidden', status: 403, request_id: 'memory',
      detail: 'ENTITY_ACCESS_DENIED: no create scope covers this entity for the acting principal',
    });
  });

  it('refuses a section to the creator of a project that leaves them out as a manager', async () => {
    const s = setup(ADMIN);
    const made = await (await createProject(s, { name: 'Không quản lý', managers: [HOLDER] })).json();
    const section = await send(s, 'POST', entityPath(E.section), { form_payload: { project: made.id, name: 'Phân tích' } });
    expect(section.status).toBe(403);
    expect(await section.json()).toEqual({
      type: 'ENTITY_ACCESS_DENIED', title: 'Forbidden', status: 403, request_id: 'memory',
      detail: 'ENTITY_ACCESS_DENIED: no parent this record points to names you in a field your create scope follows',
    });
  });

  it('refuses to clear the managers, without field errors, and changes nothing', async () => {
    const s = setup(MANAGER);
    const refused = await patchRecord(s, 'project', P1, { managers: [] });
    expect(refused.status).toBe(422);
    expect(await refused.json()).toEqual({
      type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, request_id: 'memory',
      detail: "VALIDATION_ERROR: required field 'managers' cannot be cleared",
    });
    expect(stored(s, 'project', P1).body.managers).toEqual([MANAGER]);
  });

  it('judges a cleared required field before access, as the patch command does', async () => {
    const s = setup(HOLDER);
    expect((await patchRecord(s, 'project', P1, { managers: [] })).status).toBe(422);
    expect((await patchRecord(s, 'project', P1, { name: 'x' })).status).toBe(404);
  });

  it('answers a member\'s patch as a record that is not there, and a manager\'s who steps down with a 404 on the next read', async () => {
    const s = setup(HOLDER);
    const member = await patchRecord(s, 'project', P1, { name: 'x' });
    expect(member.status).toBe(404);
    expect(await member.json()).toEqual({
      type: 'ENTITY_RECORD_NOT_FOUND', title: 'Not Found', status: 404, request_id: 'memory', detail: `not found: entity_record ${P1}`,
    });
    s.server.actAs(MANAGER);
    expect((await patchRecord(s, 'project', P1, { managers: [ADMIN] })).status).toBe(200);
    expect((await send(s, 'GET', entityPath(E.project, P1))).status).toBe(404);
  });
});

describe('labels', () => {
  const entityPath = (entity: string, id?: string) => `${BASE}/entities/${entity}/records${id ? `/${id}` : ''}`;
  const L_USED = 'l0000000-0000-4000-8000-000000000001';
  const L_SPARE = 'l0000000-0000-4000-8000-000000000002';

  function labelled(as: string, uses = 1) {
    const s = setup(as);
    s.server.write('task_label', L_USED, { name: 'Chờ duyệt', base_status: 'todo' }, ADMIN, { notify: false });
    s.server.write('task_label', L_SPARE, { name: 'Không dùng', base_status: 'todo' }, ADMIN, { notify: false });
    for (let i = 0; i < uses; i++) s.server.write('task', `lt${i}`, { title: `t${i}`, project: P1, status: 'todo', label: L_USED }, MANAGER, { notify: false });
    return s;
  }
  const remove = (s: Setup, id: string) => {
    const label = s.server.records('task_label').find((r) => r.id === id)!;
    return s.server.fetch(new Request(`${entityPath(E.task_label, id)}?expected_updated_at=${encodeURIComponent(label.updated_at)}`, { method: 'DELETE' }));
  };
  const makeManager = (s: Setup, who: string) =>
    s.server.write('project', P1, { managers: [MANAGER, who] }, undefined, { notify: false });

  it('refuses a delete that would change a task the deleter cannot edit, with the platform\'s body, and changes nothing', async () => {
    const s = labelled(ADMIN);
    const seen: Change[] = [];
    s.server.onChange((c) => seen.push(c));
    const refused = await remove(s, L_USED);
    expect(refused.status).toBe(403);
    expect(await refused.json()).toEqual({
      type: 'ENTITY_RECORD_CASCADE_FORBIDDEN', title: 'Forbidden', status: 403, request_id: 'memory',
      detail: 'ENTITY_RECORD_CASCADE_FORBIDDEN: deleting this record would change records you cannot edit',
      extensions: { cascade_forbidden: { by_entity: [{ count: 1, entity_id: E.task, ref_field: 'label' }], hidden: false } },
    });
    expect(body(s, 'lt0')!.label).toBe(L_USED);
    expect(s.server.records('task_label').map((r) => r.id)).toContain(L_USED);
    expect(seen).toEqual([]);
  });

  it('counts only the tasks the deleter cannot edit', async () => {
    const s = labelled(ADMIN, 3);
    s.server.write('task', 'lt1', { project: P2 }, OUTSIDER, { notify: false });
    s.server.write('project', P2, { managers: [OUTSIDER, ADMIN] }, undefined, { notify: false });
    const refused = await (await remove(s, L_USED)).json();
    expect(refused.extensions.cascade_forbidden.by_entity).toEqual([{ count: 2, entity_id: E.task, ref_field: 'label' }]);
  });

  it('clears the label from the tasks the deleter may edit, and answers what it cleared', async () => {
    const s = labelled(ADMIN, 2);
    makeManager(s, ADMIN);
    const seen: Change[] = [];
    s.server.onChange((c) => seen.push(c));
    const done = await remove(s, L_USED);
    expect(done.status).toBe(200);
    expect(await done.json()).toEqual({
      cascade_depth: 0,
      cleared_by_field: [{ count: 2, entity_id: E.task, ref_field: 'label' }],
      cleared_count: 2,
      deleted_by_entity: [{ count: 1, entity_id: E.task_label }],
      deleted_count: 1,
      trash_batch_id: expect.any(String),
    });
    expect([body(s, 'lt0')!.label, body(s, 'lt0')!.status]).toEqual([undefined, 'todo']);
    expect(seen).toEqual(expect.arrayContaining([
      { entity: 'task', id: 'lt0', kind: 'updated' }, { entity: 'task', id: 'lt1', kind: 'updated' }, { entity: 'task_label', id: L_USED, kind: 'deleted' },
    ]));
  });

  it('answers 204 to a label no task uses', async () => {
    const s = labelled(ADMIN);
    const done = await remove(s, L_SPARE);
    expect([done.status, await done.text()]).toEqual([204, '']);
  });

  it('refuses a delete that would touch more than 500 records, and writes nothing', async () => {
    const s = labelled(ADMIN, 500);
    makeManager(s, ADMIN);
    const seen: Change[] = [];
    s.server.onChange((c) => seen.push(c));
    const refused = await remove(s, L_USED);
    expect(refused.status).toBe(422);
    expect(await refused.json()).toEqual({
      type: 'ENTITY_RECORD_CASCADE_TOO_LARGE', title: 'Unprocessable Entity', status: 422, request_id: 'memory',
      detail: 'ENTITY_RECORD_CASCADE_TOO_LARGE: deleting this record would touch 501 records; the limit is 500',
      extensions: { cascade: { found: 501, cap: 500 } },
    });
    expect(s.server.records('task').filter((r) => r.body.label === L_USED)).toHaveLength(500);
    expect(seen).toEqual([]);
  });

  it('counts the label itself against the 500: the label and 499 tasks are just inside', async () => {
    const s = labelled(ADMIN, 499);
    makeManager(s, ADMIN);
    const done = await remove(s, L_USED);
    expect(done.status).toBe(200);
    expect((await done.json()).cleared_count).toBe(499);
  });

  it('judges the size before who may edit', async () => {
    const s = labelled(ADMIN, 500);
    expect((await remove(s, L_USED)).status).toBe(422);
  });

  it('is written by admins only: anyone else cannot create it and reads a rename or a delete as a record that is not there', async () => {
    const s = labelled(MANAGER);
    const create = await s.server.fetch(new Request(entityPath(E.task_label), {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ form_payload: { name: 'Mới', base_status: 'todo' } }),
    }));
    expect(create.status).toBe(403);
    const label = s.server.records('task_label').find((r) => r.id === L_SPARE)!;
    const rename = await s.server.fetch(new Request(entityPath(E.task_label, L_SPARE), {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ changes: { name: 'Đổi' }, expected_updated_at: label.updated_at }),
    }));
    expect(rename.status).toBe(404);
    expect((await remove(s, L_SPARE)).status).toBe(404);
  });
});

describe('units', () => {
  const unit = (n: number, name: string, code: string | null): SeedUnit => ({ id: `u0000000-0000-4000-8000-00000000000${n}`, name, code });
  const withUnits = (units: SeedUnit[]) => {
    const server = createMemoryServer({ ...seed(), units }, { now: () => NOW });
    server.actAs(HOLDER);
    return createAgentFlowClient({ baseUrl: BASE, auth: proxyAdapter(), fetch: server.fetch, maxRetries: 0 });
  };
  const SEEDED = [unit(1, 'Phòng Hành chính', 'HC'), unit(2, 'Khối Kinh doanh', 'KD'), unit(3, 'Khối Kỹ thuật', null)];

  it('lists the units sorted by name, in the platform\'s shape, to anyone', async () => {
    const r = await withUnits(SEEDED).GET('/units', { params: { query: { sort: 'name', dir: 'asc', limit: 200 } } });
    expect(r.response.status).toBe(200);
    expect(r.data).toEqual({
      items: [SEEDED[1], SEEDED[2], SEEDED[0]].map((u) => ({
        id: u.id, name: u.name, code: u.code, parent_id: null, depth: 0, ancestor_names: [], archived: false, archived_at: null,
        created_at: expect.any(String), updated_at: expect.any(String),
      })),
      next_cursor: null, prev_cursor: null,
    });
  });

  it('sorts either way and pages', async () => {
    const client = withUnits(SEEDED);
    const first = (await client.GET('/units', { params: { query: { sort: 'name', dir: 'desc', limit: 2 } } })).data!;
    expect(first.items.map((u) => u.code)).toEqual(['HC', null]);
    expect(first.next_cursor).toEqual(expect.any(String));
    const second = (await client.GET('/units', { params: { query: { sort: 'name', dir: 'desc', limit: 2, cursor: first.next_cursor! } } })).data!;
    expect(second.items.map((u) => u.code)).toEqual(['KD']);
    expect(second.next_cursor).toBeNull();
  });

  it('lists none when the seed has none', async () => {
    expect((await withUnits([]).GET('/units')).data!.items).toEqual([]);
  });
});
