import { createAgentFlowClient, proxyAdapter } from '@reflexify/agentflow-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEMO_IDS } from '../../src/api/demo-ids.js';
import { isDeskError } from '../../src/api/desk-api.js';
import { createHttpDeskApi } from '../../src/api/http-desk-api.js';
import { POLL_INTERVAL_MS } from '../../src/model/timing.js';
import type { Reply } from '../../src/model/types.js';
import { json, problem, scriptedFetch, type Answer } from '../support/scripted-fetch.js';
import { page, wire } from '../support/wire.js';

const E = DEMO_IDS.entities;
const W = DEMO_IDS.workflows;

function api(answers: Answer[]) {
  const s = scriptedFetch(answers);
  const client = createAgentFlowClient({
    baseUrl: 'http://desk.test/agentflow/api', auth: proxyAdapter(), fetch: s.fetch, maxRetries: 0,
  });
  const apiUrl = (path: string) => `http://desk.test/agentflow/api${path}`;
  return { api: createHttpDeskApi({ client, ids: DEMO_IDS, apiUrl }), requests: s.requests };
}

const WT = '0190c0de-0000-7000-8000-0000000000f1';
const line = (over: Record<string, unknown>) => ({
  id: 't1', entity_id: WT, title: null, status: 'active', priority: 'normal', live: true, claimed_by_user_id: null,
  assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [], due_at: '2026-10-06T13:00:00Z',
  started_at: '2026-10-06T09:00:00Z', clock: null,
  step: {
    workflow: { id: W.handling, name: 'Handling' }, step: { key: 'handle_high', label: 'Handle ticket' },
    kind: 'human', signs: false, subject: { entity_id: E.ticket, record_id: 'k1', label: 'TK-1' },
  },
  ...over,
});
const stepOf = (over: Record<string, unknown>) => ({ ...line({}).step, ...over });

const instance = (over: Record<string, unknown>) => ({
  id: 'i1', status: 'completed', output_payload: null, error_message: null, outcome_label: null, ...over,
});

describe('tasks', () => {
  it('lists the live Handling tasks of My Work, due first, and keeps only the Handle ticket steps of tickets', async () => {
    const { api: a, requests } = api([json(200, {
      items: [
        line({}),
        line({ id: 't2', claimed_by_user_id: 'u1' }),
        line({ id: 't3', step: stepOf({ subject: null }) }),
        line({ id: 't4', step: stepOf({ step: { key: 'review_something_else', label: 'Review' } }) }),
        line({ id: 't5', step: stepOf({ workflow: { id: 'another-workflow', name: 'Other' } }) }),
        line({ id: 't6', step: undefined }),
      ],
      next_cursor: null, prev_cursor: null,
    })]);
    const tasks = await a.handlingTasks();
    const q = requests[0]!.url.searchParams;
    expect(requests[0]!.url.pathname).toBe('/agentflow/api/work');
    expect([q.get('view'), q.get('live'), q.get('sort'), q.get('dir')]).toEqual(['all', 'true', 'due_at', 'asc']);
    expect(tasks).toEqual([
      { id: 't1', entityId: WT, ticketId: 'k1', nodeId: 'handle_high', status: 'open', claimedByUserId: null, dueAt: '2026-10-06T13:00:00Z', createdAt: '2026-10-06T09:00:00Z' },
      { id: 't2', entityId: WT, ticketId: 'k1', nodeId: 'handle_high', status: 'claimed', claimedByUserId: 'u1', dueAt: '2026-10-06T13:00:00Z', createdAt: '2026-10-06T09:00:00Z' },
    ]);
  });

  it('keeps each of the four Handle ticket pools', async () => {
    const nodes = ['handle_urgent', 'handle_high', 'handle_normal', 'handle_low'];
    const { api: a } = api([json(200, {
      items: nodes.map((node_id, i) => line({ id: `t${i}`, step: stepOf({ step: { key: node_id, label: 'Handle ticket' } }) })),
      next_cursor: null, prev_cursor: null,
    })]);
    expect((await a.handlingTasks()).map((t) => t.nodeId)).toEqual(nodes);
  });

  it('follows the cursor past a page of unrelated work to the Handling tasks behind it, keeping the query', async () => {
    const unrelated = (n: number) => line({ id: `u${n}`, step: stepOf({ workflow: { id: 'another-workflow', name: 'Other' } }) });
    const { api: a, requests } = api([
      json(200, { items: [unrelated(1), unrelated(2), line({ id: 't0', step: undefined })], next_cursor: 'c2', prev_cursor: null }),
      json(200, { items: [line({ id: 't1' })], next_cursor: null, prev_cursor: null }),
    ]);
    const tasks = await a.handlingTasks();
    expect(tasks.map((t) => t.id)).toEqual(['t1']);
    expect(requests).toHaveLength(2);
    const [first, second] = requests.map((r) => r.url.searchParams);
    expect(first!.get('cursor')).toBeNull();
    expect(second!.get('cursor')).toBe('c2');
    for (const q of [first!, second!]) {
      expect([q.get('view'), q.get('live'), q.get('sort'), q.get('dir'), q.get('limit')]).toEqual(['all', 'true', 'due_at', 'asc', '200']);
    }
  });

  it('stops when the server repeats a cursor, and lists no task twice', async () => {
    const unrelated = line({ id: 'u1', step: stepOf({ workflow: { id: 'another-workflow', name: 'Other' } }) });
    const repeat = () => json(200, { items: [line({ id: 't1' })], next_cursor: 'c2', prev_cursor: null });
    const { api: a, requests } = api([
      json(200, { items: [unrelated], next_cursor: 'c2', prev_cursor: null }),
      repeat(), repeat(), repeat(), repeat(), repeat(),
    ]);
    const tasks = await a.handlingTasks();
    expect(tasks.map((t) => t.id)).toEqual(['t1']);
    expect(requests).toHaveLength(2);
  });

  it('lists a task once when a later page carries it again under a new cursor', async () => {
    const { api: a, requests } = api([
      json(200, { items: [line({ id: 't1' }), line({ id: 't2' })], next_cursor: 'c2', prev_cursor: null }),
      json(200, { items: [line({ id: 't2' }), line({ id: 't3' })], next_cursor: null, prev_cursor: null }),
    ]);
    expect((await a.handlingTasks()).map((t) => t.id)).toEqual(['t1', 't2', 't3']);
    expect(requests).toHaveLength(2);
  });

  it('stops at 200 matching tasks, not at the end of the page that reached them', async () => {
    const many = (from: number, n: number) => Array.from({ length: n }, (_, i) => line({ id: `t${from + i}` }));
    const { api: a, requests } = api([
      json(200, { items: many(0, 150), next_cursor: 'c2', prev_cursor: null }),
      json(200, { items: many(150, 100), next_cursor: 'c3', prev_cursor: null }),
      json(200, { items: many(250, 10), next_cursor: null, prev_cursor: null }),
    ]);
    const tasks = await a.handlingTasks();
    expect(tasks).toHaveLength(200);
    expect(tasks.at(-1)!.id).toBe('t199');
    expect(requests).toHaveLength(2);
  });

  it('submits the chosen action with the person who chose it, and names the run the step answers', async () => {
    const { api: a, requests } = api([json(200, { record_id: 't1', entity_id: WT, step_status: 'submitted', run: { id: 'run-1' } })]);
    expect(await a.submit({ id: 't1', entityId: WT }, 'waiting', 'u1')).toBe('run-1');
    expect(requests[0]).toMatchObject({ method: 'POST', body: { payload: { _action: 'waiting', by_user: 'u1' } } });
    expect(requests[0]!.url.pathname).toBe(`/agentflow/api/entities/${WT}/records/t1/step/submit`);
  });

  it('claims, releases and hands a task over through its record', async () => {
    const work = { record_id: 't1', active: true, claimed_by_user_id: null, claimed_at: null, assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [] };
    const { api: a, requests } = api([json(200, work), json(200, work), json(200, work)]);
    const t = { id: 't1', entityId: WT };
    await a.claim(t);
    await a.release(t);
    await a.handOver(t, 'u2');
    expect(requests.map((r) => r.url.pathname)).toEqual([
      `/agentflow/api/entities/${WT}/records/t1/work/claim`,
      `/agentflow/api/entities/${WT}/records/t1/work/release`,
      `/agentflow/api/entities/${WT}/records/t1/work/reassign`,
    ]);
    expect(requests[2]).toMatchObject({ method: 'POST', body: { user_id: 'u2' } });
  });
});

describe('records', () => {
  it('queries tickets by status, newest change first, and maps them', async () => {
    const { api: a, requests } = api([json(200, page([wire('k1', { number: 'TK-1', status: 'open' })]))]);
    const tickets = await a.tickets({ status: ['new', 'open'] });
    expect(requests[0]!.url.pathname).toBe(`/agentflow/api/entities/${E.ticket}/records/query`);
    expect(requests[0]!.body).toMatchObject({
      filter: { field_filters: [{ field: 'status', op: 'in', value: ['new', 'open'] }] }, sort: 'updated_at', dir: 'desc',
    });
    expect(tickets[0]).toMatchObject({ id: 'k1', number: 'TK-1', status: 'open' });
  });

  it('reads a thread as two queries by ticket, pages included', async () => {
    // The two queries run in parallel, so answer by what is asked, not by order.
    const route: Answer = async (req) => {
      const body = (await req.clone().json()) as { sort: string; cursor: string | null };
      if (body.sort === 'created_at') return json(200, page([wire('n1', { ticket: 'k1', kind: 'staff', body: 'n' })]))(req);
      return body.cursor === 'c2'
        ? json(200, page([wire('r2', { ticket: 'k1', body: 'b' })]))(req)
        : json(200, page([wire('r1', { ticket: 'k1', body: 'a' })], 'c2'))(req);
    };
    const { api: a, requests } = api([route, route, route]);
    const { replies, notes } = await a.thread('k1');
    expect(replies.map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(notes.map((n) => n.id)).toEqual(['n1']);
    const bodies = requests.map((r) => r.body as Record<string, unknown>);
    expect(bodies.find((b) => b.cursor === 'c2')).toMatchObject({ sort: 'posted_at', dir: 'asc' });
    expect(bodies.find((b) => b.sort === 'created_at')).toMatchObject({ filter: { field_filters: [{ field: 'ticket', op: 'eq', value: 'k1' }] } });
  });

  it('creates a draft under the ticket\'s draft key, and reports a taken key as a conflict', async () => {
    const { api: a, requests } = api([problem(409, 'ENTITY_NATURAL_KEY_CONFLICT')]);
    const error = await a.createDraft({ ticketId: 'k1', body: 'Hi', authorUserId: 'u1' }).catch((e) => e);
    expect(requests[0]!.body).toMatchObject({
      form_payload: { ticket: 'k1', key: 'draft:k1', status: 'draft', author_kind: 'agent', author_user: 'u1', body: 'Hi' },
    });
    expect(isDeskError(error, 'conflict')).toBe(true);
    expect(error.code).toBe('ENTITY_NATURAL_KEY_CONFLICT');
  });

  it('saves a draft against the version it read, names the writer, and reports a stale save', async () => {
    const draft = { id: 'r1', updatedAt: '2026-10-06T10:00:00Z' } as Reply;
    const { api: a, requests } = api([json(200, wire('r1', { body: 'v2' }, { updated_at: '2026-10-06T10:01:00Z', version: 2 })), problem(409, 'STALE_VERSION')]);
    const saved = await a.saveDraft(draft, { body: 'v2' }, 'u1');
    expect(saved).toMatchObject({ body: 'v2', version: 2, updatedAt: '2026-10-06T10:01:00Z' });
    expect(requests[0]).toMatchObject({
      method: 'PATCH', body: { changes: { body: 'v2', author_user: 'u1' }, expected_updated_at: '2026-10-06T10:00:00Z' },
    });
    const stale = await a.saveDraft(draft, { body: 'v3' }, 'u1').catch((e) => e);
    expect(isDeskError(stale, 'stale')).toBe(true);
  });

  it('writes note mentions as comma-separated ids', async () => {
    const { api: a, requests } = api([json(201, wire('n1', { ticket: 'k1', kind: 'staff', body: '@Bo', mentions: 'u2' }))]);
    await a.createNote({ ticketId: 'k1', kind: 'staff', body: '@Bo', authorUserId: 'u1', mentions: ['u2'] });
    expect(requests[0]!.body).toMatchObject({ form_payload: { ticket: 'k1', kind: 'staff', body: '@Bo', author_user: 'u1', mentions: 'u2' } });
  });

  it('creates a rule the first time an intent is switched on, and patches it after', async () => {
    const rule = wire('p1', { intent: 'order_status', enabled: true, mode: 'shadow' });
    const { api: a, requests } = api([json(201, rule), json(200, wire('p1', { intent: 'order_status', enabled: false, mode: 'shadow' }))]);
    const created = await a.setAutopilotMode('order_status', 'shadow', null);
    expect(requests[0]!.body).toMatchObject({ form_payload: { intent: 'order_status', enabled: true, mode: 'shadow' } });
    await a.setAutopilotMode('order_status', 'off', created);
    expect(requests[1]).toMatchObject({ method: 'PATCH', body: { changes: { enabled: false } } });
  });
});

describe('workflows', () => {
  it('starts a run on a record and returns the End values when it finishes in time', async () => {
    const { api: a, requests } = api([json(200, instance({
      output_payload: { status: 'sent', skip_reason: '' },
    }))]);
    const result = await a.start('send_reply', 'r1', { version: 4 }, 8000);
    expect(requests[0]!.url.pathname).toBe(`/agentflow/api/workflows/${W.send_reply}/instances`);
    expect(requests[0]!.body).toMatchObject({
      subject: { kind: 'record', record_id: 'r1' }, params: { version: 4 }, wait_ms: 8000,
    });
    expect(typeof (requests[0]!.body as { name: unknown }).name).toBe('string');
    expect(result).toEqual({
      state: 'done', runId: 'i1', status: 'completed', output: { status: 'sent', skip_reason: '' }, outcome: null, error: null,
    });
  });

  it('carries the End step\'s outcome label, which tells the Accept and Move endings apart', async () => {
    const { api: a } = api([
      json(200, instance({ id: 'i3', outcome_label: 'Already decided', output_payload: null })),
      json(200, instance({ id: 'i4', outcome_label: 'Moved', output_payload: { ticket_id: 'k9' } })),
    ]);
    expect(await a.start('accept_message', 'r1', {}, 5000)).toEqual({
      state: 'done', runId: 'i3', status: 'completed', output: {}, outcome: 'Already decided', error: null,
    });
    expect(await a.start('move_message', 'r2', {}, 5000)).toMatchObject({ outcome: 'Moved', output: { ticket_id: 'k9' } });
  });

  it('reports a failed run with its message and no output', async () => {
    const { api: a } = api([json(200, instance({ status: 'failed', error_message: 'record not found' }))]);
    expect(await a.start('send_reply', 'r1', {}, 8000)).toEqual({
      state: 'done', runId: 'i1', status: 'failed', output: {}, outcome: null, error: 'record not found',
    });
  });

  it('reports a run still going, and sends no wait when none was asked for', async () => {
    const { api: a, requests } = api([json(201, { id: 'i2', status: 'running' })]);
    expect(await a.start('draft_reply', 'k1', { instruction: 'Shorter' }, null)).toEqual({ state: 'running', runId: 'i2' });
    expect(requests[0]!.body).not.toHaveProperty('wait_ms');
  });

  it('reports a run the platform answers 202 for as still going', async () => {
    const { api: a } = api([json(202, { id: 'i5', status: 'running' })]);
    expect(await a.start('send_reply', 'r1', { version: 1 }, 8000)).toEqual({ state: 'running', runId: 'i5' });
  });

  it('reads a run again by its id', async () => {
    const { api: a, requests } = api([json(200, instance({ outcome_label: 'Drafted', output_payload: { draft: 'r7', skipped: false } }))]);
    expect(await a.run('i1')).toMatchObject({ state: 'done', outcome: 'Drafted', output: { draft: 'r7', skipped: false } });
    expect(requests[0]!.url.pathname).toBe('/agentflow/api/instances/i1');
  });
});

describe('waiting for a run', () => {
  afterEach(() => vi.useRealTimers());

  it('polls until the run leaves running and returns its end', async () => {
    const running = json(200, { id: 'i1', status: 'running' });
    const { api: a, requests } = api([running, running, json(200, instance({ outcome_label: 'Moved', output_payload: { ticket_id: 'k9' } }))]);
    const result = await a.waitForRun('i1', { timeoutMs: 5_000, intervalMs: 1 });
    expect(result).toMatchObject({ state: 'done', status: 'completed', outcome: 'Moved', output: { ticket_id: 'k9' } });
    expect(requests.map((r) => r.url.pathname)).toEqual(Array(3).fill('/agentflow/api/instances/i1'));
  });

  it('gives back the last answer when the time is up, polling every interval until then', async () => {
    vi.useFakeTimers();
    const running = json(200, { id: 'i1', status: 'running' });
    const { api: a, requests } = api(Array.from({ length: 20 }, () => running));
    const waiting = a.waitForRun('i1', { timeoutMs: 2_000, intervalMs: 500 });
    await vi.advanceTimersByTimeAsync(2_000);
    expect(await waiting).toEqual({ state: 'running', runId: 'i1' });
    expect(requests).toHaveLength(5); // at 0, 500, 1000, 1500 and 2000 ms
  });

  it('does not sleep past the deadline', async () => {
    vi.useFakeTimers();
    const running = json(200, { id: 'i1', status: 'running' });
    const { api: a, requests } = api(Array.from({ length: 20 }, () => running));
    const waiting = a.waitForRun('i1', { timeoutMs: 700, intervalMs: 500 });
    await vi.advanceTimersByTimeAsync(700);
    expect(await waiting).toEqual({ state: 'running', runId: 'i1' });
    expect(requests).toHaveLength(3); // at 0, 500 and 700 ms
  });

  it('polls every POLL_INTERVAL_MS unless told otherwise', async () => {
    vi.useFakeTimers();
    const running = json(200, { id: 'i1', status: 'running' });
    const { api: a, requests } = api(Array.from({ length: 20 }, () => running));
    const waiting = a.waitForRun('i1', { timeoutMs: POLL_INTERVAL_MS * 2 + 100 });
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2 + 100);
    await waiting;
    expect(POLL_INTERVAL_MS).toBe(500);
    expect(requests).toHaveLength(4); // at 0, 500, 1000 and 1100 ms
  });

  it('stops at once on a failed poll, naming what went wrong', async () => {
    const { api: a } = api([problem(404, 'NOT_FOUND')]);
    const error = await a.waitForRun('gone', { timeoutMs: 1_000, intervalMs: 1 }).catch((e) => e);
    expect(isDeskError(error, 'not_found')).toBe(true);
  });
});

describe('giving up on a wait', () => {
  afterEach(() => vi.useRealTimers());
  const abortError = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

  it('stops polling and leaves no timer behind when aborted between reads', async () => {
    vi.useFakeTimers();
    const running = json(200, { id: 'i1', status: 'running' });
    const { api: a, requests } = api(Array.from({ length: 20 }, () => running));
    const controller = new AbortController();
    const waiting = a.waitForRun('i1', { timeoutMs: 60_000, intervalMs: 500, signal: controller.signal });
    const outcome = waiting.catch((e) => e);
    await vi.advanceTimersByTimeAsync(600);
    expect(requests).toHaveLength(2);
    controller.abort();
    expect(abortError(await outcome)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(requests).toHaveLength(2);
  });

  it('rejects at once when it was aborted before it began, without reading the run', async () => {
    const { api: a, requests } = api([]);
    const controller = new AbortController();
    controller.abort();
    const error = await a.waitForRun('i1', { timeoutMs: 1_000, signal: controller.signal }).catch((e) => e);
    expect(abortError(error)).toBe(true);
    expect(requests).toHaveLength(0);
  });

  it('rejects while a read is still in flight, though the connection ignores the abort', async () => {
    const { api: a } = api([() => new Promise<Response>(() => {})]);
    const controller = new AbortController();
    const outcome = a.waitForRun('i1', { timeoutMs: 1_000, signal: controller.signal }).catch((e) => e);
    await new Promise((resolve) => setTimeout(resolve, 5));
    controller.abort();
    expect(abortError(await outcome)).toBe(true);
  });

  it('names an abort as an abort even when the read it interrupts fails as a dropped network does', async () => {
    const controller = new AbortController();
    const { api: a } = api([() => { controller.abort(); throw new TypeError('The operation was aborted'); }]);
    const error = await a.waitForRun('i1', { timeoutMs: 1_000, signal: controller.signal }).catch((e) => e);
    expect(abortError(error)).toBe(true);
  });

  it('still returns a run that ends, when a signal was given and never fired', async () => {
    const { api: a } = api([json(200, instance({ outcome_label: 'Moved' }))]);
    const result = await a.waitForRun('i1', { timeoutMs: 1_000, signal: new AbortController().signal });
    expect(result).toMatchObject({ state: 'done', outcome: 'Moved' });
  });
});

describe('errors and files', () => {
  it('names a lost session, a refusal and a dropped network', async () => {
    const { api: a } = api([
      problem(401, 'NOT_SIGNED_IN'),
      problem(403, 'FORBIDDEN'),
      () => { throw new TypeError('Failed to fetch'); },
    ]);
    expect((await a.me().catch((e) => e)).kind).toBe('signed_out');
    expect((await a.me().catch((e) => e)).kind).toBe('forbidden');
    expect((await a.me().catch((e) => e)).kind).toBe('offline');
  });

  it('uploads a file as multipart, and links a download under the API the desk is given', async () => {
    const { api: a, requests } = api([json(201, {
      id: 'a1', original_filename: 'receipt.pdf', byte_size: 10, content_type: 'application/pdf', uploaded_at: '2026-10-06T10:00:00Z',
    })]);
    const ref = await a.upload(new File(['%PDF'], 'receipt.pdf', { type: 'application/pdf' }));
    expect(ref).toEqual({ id: 'a1', name: 'receipt.pdf' });
    expect(requests[0]!.contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(a.downloadUrl('a1')).toBe('http://desk.test/agentflow/api/attachments/a1/download');
    expect(a.downloadUrl('a b/c')).toBe('http://desk.test/agentflow/api/attachments/a%20b%2Fc/download');
  });
});
