import { AgentFlowError, ok, paginate, type AgentFlowClient, type components } from '@reflexify/agentflow-sdk';
import { HANDLING_STEPS, type DeskIds, type EntityKey } from '../../shared/contract.js';
import { toCanned, toContact, toNote, toReply, toRule, toTicket } from '../model/records.js';
import { POLL_INTERVAL_MS } from '../model/timing.js';
import type { DeskRecord, Person } from '../model/types.js';
import { DeskError, type DeskApi, type DeskErrorKind, type QueueTask, type RunResult } from './desk-api.js';

type WireRecord = components['schemas']['EntityRecord'];
type FieldFilter = components['schemas']['RecordFieldFilter'];
type Instance = components['schemas']['WorkflowInstance'];
type WorkLine = components['schemas']['WorkListItem'];
type StepAnswer = components['schemas']['RecordStep'];

const PAGE = 200;
/** The most Handling tasks the queue holds. */
const QUEUE_LIMIT = 200;
const MAX_PAGES = 10;

export function fromWire(r: WireRecord): DeskRecord {
  return {
    id: r.id,
    version: r.version,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
    createdBy: r.created_by ?? null,
    body: r.body,
    refLabels: r.ref_labels ?? {},
    fileLabels: r.file_labels ?? {},
  };
}

export function toDeskError(e: unknown): DeskError {
  if (e instanceof DeskError) return e;
  if (!(e instanceof AgentFlowError)) {
    return new DeskError('offline', 0, 'NETWORK', e instanceof Error ? e.message : String(e));
  }
  // A problem's `type` may be a bare code or a URI ending in one.
  const code = e.code.split('/').pop() ?? e.code;
  const kind: DeskErrorKind =
    e.status === 401 ? 'signed_out'
    : e.status === 403 ? 'forbidden'
    : e.status === 404 || e.status === 410 ? 'not_found'
    : e.status === 409 && code === 'STALE_VERSION' ? 'stale'
    : e.status === 409 ? 'conflict'
    : e.status === 400 || e.status === 422 ? 'invalid'
    : 'failed';
  return new DeskError(kind, e.status, code, e.detail);
}

async function call<T>(request: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  try {
    return await ok(request);
  } catch (e) {
    throw toDeskError(e);
  }
}

const eq = (field: string, value: unknown): FieldFilter => ({ field, op: 'eq', value });

function toRun(i: Instance): RunResult {
  if (i.status === 'completed' || i.status === 'failed' || i.status === 'cancelled') {
    const output = i.output_payload && typeof i.output_payload === 'object' ? (i.output_payload as Record<string, unknown>) : {};
    return { state: 'done', runId: i.id, status: i.status, output, outcome: i.outcome_label ?? null, error: i.error_message ?? null };
  }
  return { state: 'running', runId: i.id };
}

const HANDLING_NODES: readonly string[] = HANDLING_STEPS;

/** A My Work line, when it is a live "Handle ticket" task of a ticket. */
function toTask(l: WorkLine, ids: DeskIds): QueueTask | null {
  const step = l.step;
  if (!step || step.workflow.id !== ids.workflows.handling || !HANDLING_NODES.includes(step.step.key)) return null;
  if (step.subject?.entity_id !== ids.entities.ticket) return null;
  return {
    id: l.id,
    entityId: l.entity_id,
    ticketId: step.subject.record_id,
    nodeId: step.step.key,
    status: l.claimed_by_user_id ? 'claimed' : 'open',
    claimedByUserId: l.claimed_by_user_id ?? null,
    dueAt: l.due_at ?? null,
    createdAt: l.started_at ?? '',
  };
}

const abortError = () => new DOMException('The wait was cancelled.', 'AbortError');

/** Waits `ms`, or rejects at once if `signal` aborts, clearing the timer either way. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const onAbort = () => { clearTimeout(timer); reject(abortError()); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** `promise`, unless `signal` aborts first. For a read the connection may not cut short itself. */
function until<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const onAbort = () => reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

export function createHttpDeskApi(opts: {
  client: AgentFlowClient;
  ids: DeskIds;
  /** An absolute URL for a published operation's path, under the API `client` calls, that the browser can open itself. */
  apiUrl: (path: string) => string;
  now?: () => Date;
}): DeskApi {
  const { client, ids } = opts;
  const now = opts.now ?? (() => new Date());
  const entity_id = (k: EntityKey) => ids.entities[k];

  const query = (k: EntityKey, filters: FieldFilter[], sort: string, dir: 'asc' | 'desc', more: { limit?: number; q?: string; cursor?: string | null } = {}) =>
    call(client.POST('/entities/{entity_id}/records/query', {
      params: { path: { entity_id: entity_id(k) } },
      body: {
        filter: { field_filters: filters, ...(more.q ? { q: more.q } : {}) },
        sort, dir, limit: more.limit ?? PAGE, cursor: more.cursor ?? null,
      },
    }));

  async function queryAll(k: EntityKey, filters: FieldFilter[], sort: string, dir: 'asc' | 'desc') {
    const records: DeskRecord[] = [];
    let cursor: string | null = null;
    for (let i = 0; i < MAX_PAGES; i++) {
      const p = await query(k, filters, sort, dir, { cursor });
      records.push(...p.items.map(fromWire));
      cursor = p.next_cursor ?? null;
      if (!cursor) return { records, capped: false };
    }
    return { records, capped: true };
  }

  const get = async (k: EntityKey, id: string) =>
    fromWire(await call(client.GET('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: entity_id(k), record_id: id } },
    })));

  const list = async (k: EntityKey) =>
    (await call(client.GET('/entities/{entity_id}/records', {
      params: { path: { entity_id: entity_id(k) }, query: { limit: PAGE } },
    }))).items.map(fromWire);

  const create = async (k: EntityKey, payload: Record<string, unknown>) =>
    fromWire(await call(client.POST('/entities/{entity_id}/records', {
      params: { path: { entity_id: entity_id(k) } },
      body: { form_payload: payload },
    })));

  const patch = async (k: EntityKey, id: string, updatedAt: string, changes: Record<string, unknown>) =>
    fromWire(await call(client.PATCH('/entities/{entity_id}/records/{record_id}', {
      params: { path: { entity_id: entity_id(k), record_id: id } },
      body: { changes, expected_updated_at: updatedAt },
    })));

  const count = async (k: EntityKey, filters: FieldFilter[]) =>
    (await call(client.POST('/entities/{entity_id}/records/count', {
      params: { path: { entity_id: entity_id(k) } },
      body: { filter: { field_filters: filters } },
    }))).count;

  const statusFilter = (f: { status: string[]; requesterId?: string }): FieldFilter[] => [
    { field: 'status', op: 'in', value: f.status },
    ...(f.requesterId ? [eq('requester', f.requesterId)] : []),
  ];

  const read = async (runId: string, signal?: AbortSignal) =>
    toRun(await call(client.GET('/instances/{instance_id}', { params: { path: { instance_id: runId } }, signal })));

  return {
    async me() {
      const c = await call(client.GET('/caller'));
      return { id: c.id, displayName: c.display_name, email: c.email, permissions: c.permissions, orgName: c.org_name };
    },

    async people() {
      const p = await call(client.GET('/users', {
        params: { query: { group_id: ids.supportGroupId, is_active: true, limit: 200 } },
      }));
      // An app is told only the user fields its package lists, so each is optional on the wire.
      return p.items.map((u): Person => ({ id: u.id, displayName: u.display_name ?? '', email: u.email ?? null }));
    },

    async handlingTasks() {
      // My Work lists every kind of work, so a page may hold none of the desk's tasks: the cursor is
      // followed until the queue's own bound is met or the work runs out.
      const tasks: QueueTask[] = [];
      const listed = new Set<string>();
      const lines = paginate((cursor) => call(client.GET('/work', {
        params: { query: { view: 'all', live: true, sort: 'due_at', dir: 'asc', limit: QUEUE_LIMIT, ...(cursor ? { cursor } : {}) } },
      })));
      for await (const line of lines) {
        const task = toTask(line, ids);
        if (!task || listed.has(task.id)) continue;
        listed.add(task.id);
        tasks.push(task);
        if (tasks.length >= QUEUE_LIMIT) break;
      }
      return tasks;
    },

    async claim(task) {
      await call(client.POST('/entities/{entity_id}/records/{record_id}/work/claim', { params: { path: { entity_id: task.entityId, record_id: task.id } } }));
    },
    async release(task) {
      await call(client.POST('/entities/{entity_id}/records/{record_id}/work/release', { params: { path: { entity_id: task.entityId, record_id: task.id } } }));
    },
    async handOver(task, userId) {
      await call(client.POST('/entities/{entity_id}/records/{record_id}/work/reassign', {
        params: { path: { entity_id: task.entityId, record_id: task.id } }, body: { user_id: userId },
      }));
    },
    async submit(task, action, byUserId) {
      const step: StepAnswer = await call(client.POST('/entities/{entity_id}/records/{record_id}/step/submit', {
        params: { path: { entity_id: task.entityId, record_id: task.id } },
        body: { payload: { _action: action, by_user: byUserId } },
      }));
      return step.run.id;
    },

    ticket: async (id) => toTicket(await get('ticket', id)),
    async tickets(filter, limit = PAGE) {
      return (await query('ticket', statusFilter(filter), 'updated_at', 'desc', { limit })).items.map((r) => toTicket(fromWire(r)));
    },
    countTickets: (filter) => count('ticket', statusFilter(filter)),
    updateTicket: async (t, changes) => toTicket(await patch('ticket', t.id, t.updatedAt, changes)),

    async thread(ticketId) {
      const [replies, notes] = await Promise.all([
        queryAll('reply', [eq('ticket', ticketId)], 'posted_at', 'asc'),
        queryAll('note', [eq('ticket', ticketId)], 'created_at', 'asc'),
      ]);
      return { replies: replies.records.map(toReply), notes: notes.records.map(toNote) };
    },
    async drafts() {
      return (await query('reply', [eq('status', 'draft')], 'updated_at', 'desc')).items.map((r) => toReply(fromWire(r)));
    },
    async heldMessages() {
      const p = await query('reply', [eq('author_kind', 'unverified'), eq('status', 'received')], 'posted_at', 'desc');
      return p.items.map((r) => toReply(fromWire(r)));
    },
    reply: async (id) => toReply(await get('reply', id)),
    async createDraft(input) {
      return toReply(await create('reply', {
        ticket: input.ticketId, key: `draft:${input.ticketId}`, status: 'draft', author_kind: 'agent',
        author_user: input.authorUserId, body: input.body, posted_at: now().toISOString(),
      }));
    },
    async saveDraft(draft, changes, authorUserId) {
      return toReply(await patch('reply', draft.id, draft.updatedAt, { ...changes, author_user: authorUserId }));
    },

    async createNote(input) {
      return toNote(await create('note', {
        ticket: input.ticketId, kind: input.kind, body: input.body, author_user: input.authorUserId,
        ...(input.mentions?.length ? { mentions: input.mentions.join(',') } : {}),
      }));
    },
    async mentions(userId) {
      const p = await query('note', [{ field: 'mentions', op: 'contains', value: userId }], 'created_at', 'desc', { limit: 50 });
      return p.items.map((r) => toNote(fromWire(r)));
    },

    contact: async (id) => toContact(await get('contact', id)),
    async contacts(q, cursor = null) {
      const p = await query('contact', [], 'updated_at', 'desc', { limit: 50, q, cursor });
      return { items: p.items.map((r) => toContact(fromWire(r))), nextCursor: p.next_cursor ?? null };
    },
    countContacts: () => count('contact', []),
    createContact: async (input) => toContact(await create('contact', { ...input })),
    updateContact: async (c, changes) => toContact(await patch('contact', c.id, c.updatedAt, changes)),

    cannedReplies: async () => (await list('canned_reply')).map(toCanned),
    autopilotRules: async () => (await list('autopilot_rule')).map(toRule),
    async setAutopilotMode(intent, mode, existing) {
      if (!existing) {
        return toRule(await create('autopilot_rule', { intent, enabled: mode !== 'off', mode: mode === 'off' ? 'shadow' : mode }));
      }
      const changes = mode === 'off' ? { enabled: false } : { enabled: true, mode };
      return toRule(await patch('autopilot_rule', existing.id, existing.updatedAt, changes));
    },
    async aiReplies(since) {
      const { records, capped } = await queryAll(
        'reply', [{ field: 'posted_at', op: 'gte', value: since }, { field: 'ai_body', op: 'is_not_empty' }], 'posted_at', 'desc',
      );
      return { replies: records.map(toReply), capped };
    },

    async start(workflow, subjectId, params, waitMs) {
      const instance = await call(client.POST('/workflows/{workflow_id}/instances', {
        params: { path: { workflow_id: ids.workflows[workflow] } },
        body: {
          name: `Support desk · ${workflow} · ${now().toISOString()}`,
          subject: { kind: 'record', record_id: subjectId },
          params,
          ...(waitMs === null ? {} : { wait_ms: waitMs }),
        },
      }));
      return toRun(instance as Instance);
    },
    run: (runId) => read(runId),
    async waitForRun(runId, { timeoutMs, intervalMs = POLL_INTERVAL_MS, signal }) {
      const startedAt = Date.now();
      for (;;) {
        if (signal?.aborted) throw abortError();
        // `until` rejects the moment the signal fires, before the read it cut short can fail as a dropped network.
        const result = await until(read(runId, signal), signal);
        const left = timeoutMs - (Date.now() - startedAt);
        if (result.state === 'done' || left <= 0) return result;
        await sleep(Math.min(intervalMs, left), signal);
      }
    },

    async upload(file) {
      const form = new FormData();
      form.append('file', file, file.name);
      const meta = await call(client.POST('/attachments', {
        body: { file: '' },
        bodySerializer: () => form,
      }));
      return { id: meta.id, name: meta.original_filename };
    },
    downloadUrl: (attachmentId) => opts.apiUrl(`/attachments/${encodeURIComponent(attachmentId)}/download`),
  };
}
