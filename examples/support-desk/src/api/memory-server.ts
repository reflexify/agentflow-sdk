// An in-memory AgentFlow that answers the published routes the desk calls, in the
// published shapes, with the behaviour the desk depends on. Not a model of the platform:
// anything the desk does not call answers 404, and an unmodelled filter answers 400.
import type { components } from '@reflexify/agentflow-sdk';
import { ENTITY_KEYS, type DeskIds, type EntityKey, type WorkflowKey } from '../../shared/contract.js';
import { appObjectsFor } from '../../shared/app-objects.js';
import { instantMs } from '../model/instant.js';
import { givenName, nextPriority, splitRedraft } from '../model/text-tools.js';
import type { Priority } from '../model/types.js';

type WireRecord = components['schemas']['EntityRecord'];
type FieldFilter = components['schemas']['RecordFieldFilter'];
type Instance = components['schemas']['WorkflowInstance'];
/** What the desk reads of a run: the members `HttpDeskApi.toRun` uses. */
type RunView = Pick<Instance, 'id' | 'status' | 'output_payload' | 'error_message' | 'outcome_label'>;

export type Change =
  | { kind: 'record'; entity: EntityKey; id: string; ticketId: string | null }
  | { kind: 'task' };

export interface SeedTask {
  id: string; ticketId: string; nodeId: string; status: 'open' | 'claimed' | 'completed';
  claimedBy: string | null; dueAt: string | null; createdAt: string;
}
export interface SeedRecord { id: string; body: Record<string, unknown>; createdAt?: string; updatedAt?: string; createdBy?: string }
export interface Seed {
  ids: DeskIds;
  callerId: string;
  people: { id: string; displayName: string; email: string }[];
  /** Members of the Support admins group: the only people who may create or change an Autopilot rule. */
  autopilotAdmins: string[];
  records: Partial<Record<EntityKey, SeedRecord[]>>;
  files: Record<string, string>;
  tasks: SeedTask[];
}

export interface MemoryRun { id: string; workflow: WorkflowKey; subjectId: string; params: Record<string, unknown> }

export interface MemoryServer {
  fetch(request: Request): Promise<Response>;
  onChange(listener: (change: Change) => void): () => void;
  actAs(userId: string): void;
  write(entity: EntityKey, id: string | null, body: Record<string, unknown>): WireRecord;
  /** Deletes a record, as `DELETE /entities/{e}/records/{id}` would; for a test that removes one mid-run. */
  remove(entity: EntityKey, id: string): void;
  /** Registers an uploaded file by name, as `POST /attachments` would; for jsdom tests, whose FormData Node's fetch can't read. */
  addFile(name: string): string;
  records(entity: EntityKey): WireRecord[];
  tasks(): SeedTask[];
  runs(): MemoryRun[];
  /** Finishes every run still going, at once, and resolves when none is left. */
  settle(): Promise<void>;
  /**
   * Scripts how the next Draft reply run ends, for the endings this server otherwise never produces. "Not saved"
   * is what the real workflow ends when the draft or the conversation moved during the agent's turn: nothing is
   * written. "failed" is a run that dies. Only that one run is scripted.
   */
  nextDraftOutcome(outcome: 'Not saved' | 'failed'): void;
}

const DISPLAY: Record<EntityKey, string> = {
  ticket: 'number', reply: 'key', note: 'body', contact: 'name', canned_reply: 'name', autopilot_rule: 'intent',
};
const UNIQUE: Partial<Record<EntityKey, string>> = { reply: 'key', contact: 'email', autopilot_rule: 'intent' };
const REFS: Partial<Record<EntityKey, [string, EntityKey | 'user'][]>> = {
  ticket: [['requester', 'contact'], ['possible_duplicate_of', 'ticket']],
  reply: [['ticket', 'ticket'], ['author_user', 'user']],
  note: [['ticket', 'ticket'], ['author_user', 'user']],
};
/** What storage fills in on create, from the entity definitions. */
const DEFAULTS: Partial<Record<EntityKey, Record<string, unknown>>> = {
  ticket: { status: 'new', priority: 'normal' },
  reply: { autopilot: 'none' },
  note: { kind: 'staff' },
  autopilot_rule: { enabled: false, mode: 'shadow', min_confidence: 0.9, disclose: true },
};
/**
 * The fields `filter.q` looks in. The installer marks a text field searchable unless its definition says otherwise
 * (`default_capabilities`), so this is every text field in `config/entities/*.json`, not only the ones that say
 * `"searchable": true`; a test reads the files and fails when this list drifts from them.
 */
export const SEARCHABLE: Record<EntityKey, readonly string[]> = {
  ticket: ['subject', 'pending_token', 'summary', 'intent'],
  reply: ['body', 'key', 'subject', 'in_reply_to', 'references', 'from_address', 'to', 'cc', 'outbound_id', 'provider_id', 'ai_body', 'citations', 'intent'],
  note: ['body', 'mentions'],
  contact: ['email', 'name', 'organization', 'locale', 'notes'],
  canned_reply: ['name', 'category', 'body'],
  autopilot_rule: ['intent'],
};
/** The record the workflow is about, which its start route checks the subject against. */
const SUBJECT_ENTITY: Record<WorkflowKey, EntityKey> = {
  handling: 'ticket', draft_reply: 'ticket', send_reply: 'reply', accept_message: 'reply', move_message: 'reply',
};
/** Datetime fields compare as instants: the real ones may be written in the org's zone. */
const DATETIME_FIELDS: ReadonlySet<string> = new Set(['posted_at', 'last_customer_at', 'pending_since', 'first_replied_at', 'escalated_at']);
/** Workflows whose start access admits nobody: the engine starts them, a person never does. */
const NOBODY_MAY_START: readonly WorkflowKey[] = ['handling'];
const SLA_HOURS: Record<Priority, number> = { urgent: 1, high: 4, normal: 8, low: 24 };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const problem = (status: number, type: string, detail?: string) =>
  new Response(JSON.stringify({ type, title: type, status, detail: detail ?? null, request_id: 'memory' }), {
    status, headers: { 'content-type': 'application/problem+json' },
  });

function isEmpty(v: unknown) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

/** A filter the memory server does not model. It answers 400; any other error is the server's own bug. */
class UnmodelledFilter extends Error {}

function matches(r: WireRecord, f: FieldFilter): boolean {
  const v = r.body[f.field];
  const s = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x));
  // A datetime is compared as an instant; anything else as text.
  const order = (a: unknown, b: unknown): number => {
    const ms = DATETIME_FIELDS.has(f.field) ? [instantMs(a), instantMs(b)] : [null, null];
    return ms[0] !== null && ms[1] !== null ? ms[0] - ms[1] : s(a).localeCompare(s(b));
  };
  switch (f.op) {
    case 'eq': return DATETIME_FIELDS.has(f.field) && !isEmpty(v) ? order(v, f.value) === 0 : v === f.value;
    case 'ne': return !(DATETIME_FIELDS.has(f.field) && !isEmpty(v) ? order(v, f.value) === 0 : v === f.value);
    case 'in': return Array.isArray(f.value) && f.value.includes(v);
    case 'contains': return s(v).toLowerCase().includes(s(f.value).toLowerCase());
    case 'gte': return !isEmpty(v) && order(v, f.value) >= 0;
    case 'lte': return !isEmpty(v) && order(v, f.value) <= 0;
    case 'is_empty': return isEmpty(v);
    case 'is_not_empty': return !isEmpty(v);
    default: throw new UnmodelledFilter(`the memory server does not model the ${f.op} filter`);
  }
}

/**
 * A held message's subject as its own ticket's: without reply prefixes and the ticket number the
 * sender guessed. A port of `config/code/clean-subject.js`, which Move runs; a test holds the two together.
 */
export function cleanSubject(subject: unknown): string {
  let clean = (typeof subject === 'string' ? subject.trim() : '').replace(/\[(TK-\d{4}-\d+)\]/gi, ' ');
  for (;;) {
    const next = clean.replace(/^\s*(re|fwd?|aw|sv)\s*:\s*/i, '');
    if (next === clean) break;
    clean = next;
  }
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean || '(no subject)';
}

/** How a run ended: its End step's values and outcome label, or a failure no End step reached. */
type Ended = { output: Record<string, unknown>; outcome: string | null } | { failed: string };

/** The fake's own Workflow task entity: the desk never names it, every line and write carries it. */
export const MEMORY_WORKFLOW_TASK_ENTITY_ID = '0190c0de-0000-7000-8000-0000000000f1';

export function createMemoryServer(
  seed: Seed,
  opts: { now?: () => Date; draftDelayMs?: number; atomicDelayMs?: number } = {},
): MemoryServer {
  const now = opts.now ?? (() => new Date());
  const draftDelay = opts.draftDelayMs ?? 0;
  const atomicDelay = opts.atomicDelayMs ?? 0;
  const ids = seed.ids;
  const entityOf = new Map(ENTITY_KEYS.map((k) => [ids.entities[k], k] as const));
  const workflowOf = new Map(Object.entries(ids.workflows).map(([k, v]) => [v, k as WorkflowKey] as const));
  const store = new Map<EntityKey, Map<string, WireRecord>>(ENTITY_KEYS.map((k) => [k, new Map()]));
  const files = new Map(Object.entries(seed.files));
  const tasks: SeedTask[] = seed.tasks.map((t) => ({ ...t }));
  const runs: MemoryRun[] = [];
  const instances = new Map<string, RunView>();
  /** The Handling run behind each task, and the customer message it was started for (what Mark solved and Mark waiting expect unchanged). */
  const taskRuns = new Map<string, { instanceId: string; customerAt: number | null }>();
  const listeners = new Set<(c: Change) => void>();
  const pending = new Set<Promise<void>>();
  const sleepers = new Set<() => void>();
  let flushing = 0;
  let caller = seed.callerId;
  let lastStamp = Number.NEGATIVE_INFINITY;
  let ticketSeq = 500;
  let scriptedDraft: 'Not saved' | 'failed' | null = null;

  // The clock, but strictly increasing, so two writes in one millisecond still differ for the
  // version check. It stays on the clock instead of drifting ahead of it.
  const stamp = () => {
    lastStamp = Math.max(lastStamp + 1, now().getTime());
    return new Date(lastStamp).toISOString();
  };
  const nameOf = (userId: string) => seed.people.find((p) => p.id === userId)?.displayName ?? null;

  /** Waits like a worker would: a macrotask at least, or `ms`; `settle()` cuts every wait short. */
  function pause(ms: number): Promise<void> {
    if (flushing > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const wake = () => { clearTimeout(timer); sleepers.delete(wake); resolve(); };
      const timer = setTimeout(wake, ms);
      sleepers.add(wake);
    });
  }

  function label(k: EntityKey | 'user', id: string): string | null {
    if (k === 'user') return nameOf(id);
    const r = store.get(k)!.get(id);
    const v = r?.body[DISPLAY[k]];
    return typeof v === 'string' ? v : null;
  }

  function decorate(k: EntityKey, r: WireRecord): WireRecord {
    const ref_labels: Record<string, Record<string, string | null>> = {};
    for (const [field, target] of REFS[k] ?? []) {
      const id = r.body[field];
      if (typeof id === 'string' && id) ref_labels[field] = { [id]: label(target, id) };
    }
    const file_labels: Record<string, Record<string, string | null>> = {};
    if (Array.isArray(r.body.attachments)) {
      file_labels.attachments = Object.fromEntries((r.body.attachments as string[]).map((a) => [a, files.get(a) ?? null]));
    }
    return { ...r, ref_labels, file_labels };
  }

  function ticketOf(k: EntityKey, r: WireRecord): string | null {
    if (k === 'ticket') return r.id;
    return k === 'reply' || k === 'note' ? (typeof r.body.ticket === 'string' ? r.body.ticket : null) : null;
  }

  function announce(change: Change) {
    for (const l of listeners) l(change);
  }

  function put(k: EntityKey, id: string | null, body: Record<string, unknown>, by: string | null): WireRecord {
    const table = store.get(k)!;
    const existing = id ? table.get(id) : undefined;
    const at = stamp();
    const merged = { ...(existing?.body ?? {}), ...body };
    for (const [key, v] of Object.entries(body)) if (v === null) delete merged[key];
    const r: WireRecord = existing
      ? { ...existing, body: merged, version: existing.version + 1, updated_at: at }
      : {
          id: id ?? crypto.randomUUID(), entity_id: ids.entities[k], org_id: 'org', body: merged, version: 1,
          created_at: at, updated_at: at, created_by: by,
        };
    table.set(r.id, r);
    const ticketId = ticketOf(k, r);
    announce({ kind: 'record', entity: k, id: r.id, ticketId });
    // A message moved to another ticket changes both conversations.
    const was = existing ? ticketOf(k, existing) : null;
    if (was && was !== ticketId) announce({ kind: 'record', entity: k, id: r.id, ticketId: was });
    if (k === 'ticket') handlingTrigger(existing, r);
    return r;
  }

  /**
   * Handling's trigger: an update that changes `last_customer_at`, `priority` or `escalated_at` starts a run on
   * a new or open ticket, which opens a task in its priority's pool. A ticket whose task is still
   * open or claimed has a run waiting on the person, so the event is held until the task is marked.
   */
  function handlingTrigger(before: WireRecord | undefined, after: WireRecord) {
    if (!before) return; // the trigger listens for updates; a new ticket's first write is not one
    const changed = ['last_customer_at', 'priority', 'escalated_at'].some((f) => before.body[f] !== after.body[f]);
    const handleable = after.body.status === 'new' || after.body.status === 'open';
    const active = tasks.some((t) => t.ticketId === after.id && (t.status === 'open' || t.status === 'claimed'));
    if (!changed || !handleable || active) return;
    openTask(after.id, (after.body.priority as Priority) ?? 'normal');
    announce({ kind: 'task' });
  }

  for (const k of ENTITY_KEYS) {
    for (const s of seed.records[k] ?? []) {
      store.get(k)!.set(s.id, {
        id: s.id, entity_id: ids.entities[k], org_id: 'org', body: { ...s.body }, version: 1,
        created_at: s.createdAt ?? now().toISOString(), updated_at: s.updatedAt ?? s.createdAt ?? now().toISOString(),
        created_by: s.createdBy ?? null,
      });
    }
  }

  /** Starts the Handling run a task belongs to: it waits on the person until the task is marked. */
  function trackRun(t: SeedTask) {
    const id = crypto.randomUUID();
    instances.set(id, { id, status: 'running', output_payload: null, error_message: null, outcome_label: null });
    taskRuns.set(t.id, { instanceId: id, customerAt: instantMs(store.get('ticket')!.get(t.ticketId)?.body.last_customer_at) });
  }
  /** The run ends when the task is marked, however it was marked. */
  function endRun(t: SeedTask, outcome: string, output: Record<string, unknown> = {}) {
    const run = taskRuns.get(t.id);
    if (run) {
      instances.set(run.instanceId, {
        id: run.instanceId, status: 'completed', output_payload: output, error_message: null, outcome_label: outcome,
      });
    }
  }
  for (const t of tasks) trackRun(t);

  /** Alternate keys compare exactly, as storage's do: `ANA@example.com` is not `ana@example.com`. */
  function taken(k: EntityKey, body: Record<string, unknown>, except?: string) {
    const field = UNIQUE[k];
    if (!field || isEmpty(body[field])) return false;
    const want = String(body[field]);
    return [...store.get(k)!.values()].some((r) => r.id !== except && String(r.body[field] ?? '') === want);
  }

  const find = (k: EntityKey, field: string, value: unknown) =>
    [...store.get(k)!.values()].find((r) => r.body[field] === value);

  function eventNote(ticketId: string, body: string, byUser: unknown) {
    put('note', null, { ticket: ticketId, kind: 'event', body, ...(typeof byUser === 'string' ? { author_user: byUser } : {}) }, null);
  }

  function openTask(ticketId: string, priority: Priority) {
    const task: SeedTask = {
      id: crypto.randomUUID(), ticketId, nodeId: `handle_${priority}`, status: 'open', claimedBy: null,
      dueAt: new Date(now().getTime() + SLA_HOURS[priority] * 3_600_000).toISOString(), createdAt: stamp(),
    };
    tasks.push(task);
    trackRun(task);
  }

  // ---- workflows: what Plan 3's workflows write --------------------------------------------

  function sendReply(subjectId: string, params: Record<string, unknown>): Ended {
    const draft = store.get('reply')!.get(subjectId);
    if (!draft) return { failed: `Entity record ${subjectId} not found` };
    // A person's claim holds the version they saw and the `draft` status, so a draft that
    // changed or is no longer a draft skips for the one reason: `changed`.
    const changed = draft.body.status !== 'draft' || (typeof params.version === 'number' && params.version !== draft.version);
    if (changed) return { output: { status: 'skipped', skip_reason: 'changed', outbound_id: '' }, outcome: null };
    const outbound = crypto.randomUUID();
    const ai = typeof draft.body.ai_body === 'string' ? draft.body.ai_body.trim() : '';
    put('reply', draft.id, {
      status: 'sent', author_kind: 'agent', author_user: caller, posted_at: now().toISOString(),
      key: `outbound:${outbound}`, outbound_id: outbound,
      ai_unchanged: ai !== '' && ai === String(draft.body.body ?? '').trim(),
    }, caller);
    const ticketId = String(draft.body.ticket);
    const ticket = store.get('ticket')!.get(ticketId);
    if (ticket) put('ticket', ticketId, { pending_token: `outbound:${outbound}`, first_replied_at: ticket.body.first_replied_at ?? now().toISOString() }, null);
    return { output: { status: 'sent', skip_reason: '', outbound_id: outbound }, outcome: null };
  }

  /** The stand-in for the drafting agent. Like the real save, it leaves `author_user` alone. */
  function draftReply(ticketId: string, params: Record<string, unknown>): Ended {
    const existing = find('reply', 'key', `draft:${ticketId}`);
    const ticket = store.get('ticket')!.get(ticketId);
    // The text to revise comes with the instruction, as the desk sends it; a run without it works from the saved draft.
    const { instruction, draft: carried } = splitRedraft(String(params.instruction ?? ''));
    const contact = store.get('contact')!.get(String(ticket?.body.requester ?? ''));
    const name = typeof contact?.body.name === 'string' ? contact.body.name : '';
    const first = (name.includes('@') ? null : givenName(name, typeof contact?.body.locale === 'string' ? contact.body.locale : null)) ?? 'there';
    const base = carried
      ?? (typeof existing?.body.body === 'string' && existing.body.body
        ? existing.body.body
        : `Hi ${first},\n\nThanks for writing. I'm looking into this now and will get back to you shortly.\n\nLinden Books Support`);
    const text = redraftText(base, instruction);
    const saved = put('reply', existing?.id ?? null, {
      ticket: ticketId, key: `draft:${ticketId}`, status: 'draft', author_kind: 'bot', posted_at: now().toISOString(),
      body: text, ai_body: text,
      citations: existing?.body.citations ?? '[]',
      intent: existing?.body.intent ?? ticket?.body.intent ?? 'other',
      intent_confidence: existing?.body.intent_confidence ?? 0.5,
      autopilot: 'none',
    }, null);
    return { output: { reply: text, draft: saved.id, skipped: false }, outcome: 'Drafted' };
  }

  /** The Draft reply child that Accept and Move wait for; a draft that can't be made doesn't undo them. */
  async function draftAfter(ticketId: string) {
    await pause(draftDelay);
    try { draftReply(ticketId, {}); } catch { /* the message is in; the person can press Generate reply */ }
  }

  function accept(subjectId: string): string | null {
    const r = store.get('reply')!.get(subjectId);
    if (!r || r.body.author_kind !== 'unverified') return null;
    put('reply', r.id, { author_kind: 'customer' }, caller);
    put('ticket', String(r.body.ticket), { status: 'open', last_customer_at: now().toISOString(), pending_token: `customer:${r.id}` }, null);
    return String(r.body.ticket);
  }

  function move(subjectId: string): string | null {
    const r = store.get('reply')!.get(subjectId);
    if (!r || r.body.author_kind !== 'unverified') return null;
    const from = String(r.body.from_address ?? '');
    const contact = find('contact', 'email', from) ?? put('contact', null, { email: from, name: from }, null);
    const ticket = put('ticket', null, {
      number: `TK-2026-0${ticketSeq++}`, subject: cleanSubject(r.body.subject), requester: contact.id,
      status: 'new', priority: 'normal',
    }, null);
    put('reply', r.id, { ticket: ticket.id, author_kind: 'customer' }, caller);
    put('ticket', ticket.id, { status: 'open', last_customer_at: now().toISOString(), pending_token: `customer:${r.id}` }, null);
    return ticket.id;
  }

  async function execute(workflow: WorkflowKey, subjectId: string, params: Record<string, unknown>): Promise<Ended> {
    switch (workflow) {
      case 'draft_reply': {
        const scripted = scriptedDraft;
        scriptedDraft = null;
        await pause(draftDelay);
        if (scripted === 'failed') return { failed: 'Scripted failure: the drafting agent stopped' };
        if (scripted === 'Not saved') return { output: { reply: '', draft: '', skipped: true }, outcome: 'Not saved' };
        return draftReply(subjectId, params);
      }
      case 'send_reply':
        await pause(atomicDelay);
        return sendReply(subjectId, params);
      case 'accept_message': {
        await pause(atomicDelay);
        const ticketId = accept(subjectId);
        if (!ticketId) return { output: {}, outcome: 'Already decided' };
        await draftAfter(ticketId);
        return { output: {}, outcome: 'Accepted' };
      }
      case 'move_message': {
        await pause(atomicDelay);
        const ticketId = move(subjectId);
        if (!ticketId) return { output: {}, outcome: 'Already decided' };
        await draftAfter(ticketId);
        return { output: { ticket_id: ticketId }, outcome: 'Moved' };
      }
      case 'handling':
        return { failed: 'Handling is started by its trigger, not by a person' };
    }
  }

  /**
   * Starts a run that finishes later, as the real ones do: Send's claim and Move's apply are atomic
   * workflows only a worker runs, Accept and Move wait for a Draft reply, and Draft reply is an agent
   * turn. The start answers `running`; `GET /instances/{id}` serves the end.
   */
  function startRun(workflow: WorkflowKey, subjectId: string, params: Record<string, unknown>): RunView {
    const id = crypto.randomUUID();
    runs.push({ id, workflow, subjectId, params });
    const running: RunView = { id, status: 'running', output_payload: null, error_message: null, outcome_label: null };
    instances.set(id, running);
    const job: Promise<void> = (async () => {
      let ended: Ended;
      try {
        ended = await execute(workflow, subjectId, params);
      } catch (e) {
        ended = { failed: e instanceof Error ? e.message : String(e) };
      }
      instances.set(id, 'failed' in ended
        ? { ...running, status: 'failed', error_message: ended.failed }
        : { ...running, status: 'completed', output_payload: ended.output, outcome_label: ended.outcome });
    })().finally(() => pending.delete(job));
    pending.add(job);
    return running;
  }

  // ---- routes -------------------------------------------------------------------------------

  function query(k: EntityKey, body: components['schemas']['RecordQueryRequest']) {
    let rows = [...store.get(k)!.values()];
    for (const f of body.filter?.field_filters ?? []) rows = rows.filter((r) => matches(r, f));
    const q = body.filter?.q?.toLowerCase();
    if (q) {
      const fields = SEARCHABLE[k];
      rows = rows.filter((r) => fields.some((f) => typeof r.body[f] === 'string' && r.body[f].toLowerCase().includes(q)));
    }
    const sort = body.sort ?? 'updated_at';
    const key = (r: WireRecord) => String(sort === 'updated_at' || sort === 'created_at' ? r[sort] : (r.body[sort] ?? ''));
    const byInstant = DATETIME_FIELDS.has(sort);
    rows.sort((a, b) => {
      const ms = byInstant ? (instantMs(key(a)) ?? 0) - (instantMs(key(b)) ?? 0) : 0;
      return ms || key(a).localeCompare(key(b)) || a.id.localeCompare(b.id);
    });
    if (body.dir === 'desc') rows.reverse();
    const offset = Number(body.cursor ?? 0);
    const limit = body.limit ?? 50;
    const items = rows.slice(offset, offset + limit).map((r) => decorate(k, r));
    return { rows, page: { items, next_cursor: offset + limit < rows.length ? String(offset + limit) : null, prev_cursor: null } };
  }

  const mayWriteRules = () => seed.autopilotAdmins.includes(caller);

  async function route(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(url.pathname.indexOf('/api/') + 4);
    const parts = path.split('/').filter(Boolean);
    const method = request.method;
    const body = async () => (await request.json()) as Record<string, unknown>;

    if (method === 'GET' && path === '/caller') {
      const p = seed.people.find((x) => x.id === caller)!;
      return json({
        id: p.id, kind: 'user', display_name: p.displayName, email: p.email, org_id: 'org', org_name: 'Linden Books',
        // A Support role: no `deployment.admin`. Autopilot rules answer to the Support admins group instead.
        app: null, permissions: ['entity.read', 'entity.list', 'entity.write'],
      });
    }
    if (method === 'GET' && path === '/app/objects') return json(appObjectsFor(ids));
    if (method === 'GET' && path === '/users') {
      return json({
        items: seed.people.map((p) => ({ id: p.id, display_name: p.displayName, email: p.email, is_active: true })),
        next_cursor: null, prev_cursor: null,
      });
    }
    if (method === 'GET' && path === '/work') {
      // My Work as the platform answers it for the caller: live Handling tasks open to anyone in
      // the pool, and the caller's own. The fake keeps no other work.
      const items = tasks
        .filter((t) => t.status === 'open' || (t.status === 'claimed' && t.claimedBy === caller))
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))
        .map((t) => ({
          id: t.id, entity_id: MEMORY_WORKFLOW_TASK_ENTITY_ID, title: null, status: 'active', priority: 'normal', live: true,
          claimed_by_user_id: t.claimedBy, assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [],
          due_at: t.dueAt, started_at: t.createdAt, clock: null,
          step: {
            workflow: { id: ids.workflows.handling, name: 'Handling' }, step: { key: t.nodeId, label: 'Handle ticket' },
            kind: 'human', signs: false, subject: { entity_id: ids.entities.ticket, record_id: t.ticketId, label: null },
          },
        }));
      return json({ items, next_cursor: null, prev_cursor: null });
    }
    if (parts[0] === 'entities' && parts[1] === MEMORY_WORKFLOW_TASK_ENTITY_ID && parts[2] === 'records' && method === 'POST') {
      const t = tasks.find((x) => x.id === parts[3]);
      if (!t) return problem(404, 'NOT_FOUND');
      // A task already marked is no longer active work: the platform answers a lost race with a conflict.
      if (t.status === 'completed') return problem(409, 'WORK_NOT_ACTIVE');
      const verb = `${parts[4]}/${parts[5]}`;
      const work = () => json({
        record_id: t.id, active: true, claimed_by_user_id: t.claimedBy, claimed_at: t.claimedBy ? stamp() : null,
        assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [],
      });
      if (verb === 'work/claim') {
        if (t.status === 'claimed' && t.claimedBy !== caller) return problem(409, 'WORK_ALREADY_CLAIMED');
        Object.assign(t, { status: 'claimed', claimedBy: caller });
        announce({ kind: 'task' });
        return work();
      }
      if (verb === 'work/release') {
        // Someone else's hold needs an Assign scope, which this fake never grants; no hold at all has no claimant.
        if (t.claimedBy !== caller) return problem(403, t.claimedBy ? 'ENTITY_ACCESS_DENIED' : 'WORK_NOT_CLAIMANT');
        Object.assign(t, { status: 'open', claimedBy: null });
        announce({ kind: 'task' });
        return work();
      }
      if (verb === 'work/reassign') {
        if (t.claimedBy !== caller) return problem(403, 'ENTITY_ACCESS_DENIED');
        t.claimedBy = String((await body()).user_id);
        announce({ kind: 'task' });
        return work();
      }
      if (verb === 'step/submit') {
        if (t.claimedBy !== caller) return problem(403, 'WORK_NOT_CLAIMANT');
        const payload = ((await body()).payload ?? {}) as Record<string, unknown>;
        if (payload._action !== 'solved' && payload._action !== 'waiting' && payload._action !== 'escalate') {
          return problem(400, 'HUMAN_ACTION_UNKNOWN');
        }
        t.status = 'completed';
        const ticket = store.get('ticket')!.get(t.ticketId)!;
        const run = taskRuns.get(t.id);
        // Solved and Waiting write with `expect: last_customer_at`: when the customer wrote after the task opened,
        // the write skips, the run ends there, and the held message's start opens a fresh task.
        const wroteMeanwhile = payload._action !== 'escalate' && run !== undefined
          && instantMs(ticket.body.last_customer_at) !== run.customerAt;
        if (wroteMeanwhile) {
          endRun(t, 'Customer wrote meanwhile', { skipped: true });
          if (ticket.body.status === 'new' || ticket.body.status === 'open') {
            openTask(t.ticketId, (ticket.body.priority as Priority) ?? 'normal');
          }
        } else if (payload._action === 'solved') {
          put('ticket', t.ticketId, { status: 'solved' }, caller);
          eventNote(t.ticketId, 'Marked solved', payload.by_user);
          endRun(t, 'Done');
        } else if (payload._action === 'waiting') {
          put('ticket', t.ticketId, { status: 'pending', pending_since: now().toISOString() }, caller);
          eventNote(t.ticketId, 'Marked waiting on customer', payload.by_user);
          endRun(t, 'Done');
        } else {
          endRun(t, 'Done');
          // The task is already marked, so the stamp (and the priority below urgent) restarts Handling,
          // which opens a task in the pool: at urgent, where the priority has nowhere higher to go, the
          // stamp alone does it.
          const was = (ticket.body.priority as Priority) ?? 'normal';
          const next = nextPriority(was);
          put('ticket', t.ticketId, { priority: next, escalated_at: now().toISOString() }, caller);
          eventNote(
            t.ticketId,
            was === 'urgent' ? 'Escalated: already urgent, reopened in the urgent pool' : `Escalated: priority raised to ${next}`,
            payload.by_user,
          );
        }
        announce({ kind: 'task' });
        // The finished panel, as the platform answers a submit: the desk reads the run it names.
        return json({
          record_id: t.id, entity_id: MEMORY_WORKFLOW_TASK_ENTITY_ID, kind: 'human', signs: false,
          step_status: 'submitted', signed: false,
          run: { id: run?.instanceId ?? '', workflow_id: ids.workflows.handling, workflow_name: 'Handling', step_key: t.nodeId, step_label: 'Handle ticket' },
          subject: { entity_id: ids.entities.ticket, record_id: t.ticketId, label: null },
        });
      }
      return problem(404, 'NOT_FOUND');
    }
    if (parts[0] === 'entities' && parts[2] === 'records') {
      const k = entityOf.get(parts[1] ?? '');
      if (!k) return problem(404, 'NOT_FOUND');
      if (parts.length === 3 && method === 'GET') {
        return json(query(k, { limit: Number(url.searchParams.get('limit') ?? 50) }).page);
      }
      if (parts[3] === 'query' && method === 'POST') {
        return json(query(k, (await body()) as components['schemas']['RecordQueryRequest']).page);
      }
      if (parts[3] === 'count' && method === 'POST') {
        const b = (await body()) as components['schemas']['RecordCountRequest'];
        return json({ count: query(k, { filter: b.filter, limit: 1_000_000 }).rows.length, capped: false });
      }
      if (parts.length === 3 && method === 'POST') {
        const payload = ((await body()).form_payload ?? {}) as Record<string, unknown>;
        if (k === 'autopilot_rule' && !mayWriteRules()) return problem(403, 'FORBIDDEN');
        // Optional text fields refuse `null` on create; clearing a value is a PATCH.
        const nulled = Object.entries(payload).find(([, v]) => v === null);
        if (nulled) return problem(422, 'VALIDATION_ERROR', `${nulled[0]} must not be null`);
        if (taken(k, payload)) return problem(409, 'ENTITY_NATURAL_KEY_CONFLICT');
        const number = k === 'ticket' ? { number: `TK-2026-0${ticketSeq++}` } : {};
        return json(decorate(k, put(k, null, { ...DEFAULTS[k], ...number, ...payload }, caller)), 201);
      }
      const r = parts[3] ? store.get(k)!.get(parts[3]) : undefined;
      if (parts.length === 4 && method === 'GET') return r ? json(decorate(k, r)) : problem(404, 'NOT_FOUND');
      if (parts.length === 4 && method === 'PATCH') {
        if (!r) return problem(404, 'NOT_FOUND');
        const b = await body();
        if (k === 'autopilot_rule' && !mayWriteRules()) return problem(403, 'FORBIDDEN');
        if (b.expected_updated_at !== r.updated_at) return problem(409, 'STALE_VERSION');
        const changes = (b.changes ?? {}) as Record<string, unknown>;
        if (taken(k, changes, r.id)) return problem(409, 'ENTITY_NATURAL_KEY_CONFLICT');
        return json(decorate(k, put(k, r.id, changes, caller)));
      }
    }
    if (parts[0] === 'workflows' && parts[2] === 'instances' && method === 'POST') {
      const workflow = workflowOf.get(parts[1] ?? '');
      if (!workflow) return problem(404, 'NOT_FOUND');
      if (NOBODY_MAY_START.includes(workflow)) return problem(403, 'FORBIDDEN');
      const b = (await body()) as components['schemas']['StartInstanceBody'];
      if (b.subject?.kind !== 'record') return problem(422, 'SUBJECT_REQUIRED');
      // Every desk workflow declares its subject entity, and the start route refuses anything else.
      if (!store.get(SUBJECT_ENTITY[workflow])!.has(b.subject.record_id)) return problem(422, 'SUBJECT_BINDING_MISMATCH');
      const instance = startRun(workflow, b.subject.record_id, (b.params ?? {}) as Record<string, unknown>);
      // Every run here outlives the start, so a start that waited answers 202, and one that didn't, 201.
      return json(instance, b.wait_ms && b.wait_ms > 0 ? 202 : 201);
    }
    if (parts[0] === 'instances' && parts.length === 2 && method === 'GET') {
      const i = instances.get(parts[1]!);
      return i ? json(i) : problem(404, 'NOT_FOUND');
    }
    if (method === 'POST' && path === '/attachments') {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) return problem(422, 'FILE_REQUIRED');
      const id = crypto.randomUUID();
      files.set(id, file.name);
      return json({ id, original_filename: file.name, byte_size: file.size, content_type: file.type, uploaded_at: stamp() }, 201);
    }
    return problem(404, 'NOT_FOUND', `${method} ${path} is not modelled`);
  }

  return {
    // Only a filter it doesn't model is the caller's to hear about. Any other error is the server's
    // own, and it throws, so a test can't pass on a mistake made here.
    async fetch(request) {
      try {
        return await route(request);
      } catch (e) {
        if (e instanceof UnmodelledFilter) return problem(400, 'UNMODELLED_FILTER', e.message);
        throw e;
      }
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    actAs(userId) { caller = userId; },
    write(entity, id, body) { return put(entity, id, body, null); },
    remove(entity, id) {
      const r = store.get(entity)!.get(id);
      if (!r || !store.get(entity)!.delete(id)) return;
      announce({ kind: 'record', entity, id, ticketId: ticketOf(entity, r) });
    },
    addFile(name) {
      const id = crypto.randomUUID();
      files.set(id, name);
      return id;
    },
    records: (entity) => [...store.get(entity)!.values()].map((r) => decorate(entity, r)),
    tasks: () => tasks.map((t) => ({ ...t })),
    runs: () => [...runs],
    nextDraftOutcome(outcome) { scriptedDraft = outcome; },
    async settle() {
      flushing++;
      try {
        while (pending.size) {
          for (const wake of [...sleepers]) wake();
          await Promise.all([...pending]);
        }
      } finally {
        flushing--;
      }
    },
  };
}

/** The demo's stand-in for the drafting agent: a visible, deterministic change per instruction. */
export function redraftText(body: string, instruction: string): string {
  const paras = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const i = instruction.toLowerCase();
  if (i.trim() === '') return paras.join('\n\n');
  if (i.includes('shorter')) {
    const middle = (paras[1] ?? '').split(/(?<=[.!?])\s+/)[0] ?? '';
    return [paras[0], middle, paras.at(-1)].filter((p, n, all) => p && all.indexOf(p) === n).join('\n\n');
  }
  if (i.includes('friendlier')) return [...paras.slice(0, -1), 'Thanks so much for your patience!', paras.at(-1)].join('\n\n');
  if (i.includes('formal')) return paras.join('\n\n').replace(/^Hi /, 'Dear ');
  if (i.includes('vietnamese')) return `Chào bạn,\n\n${paras.slice(1, -1).join('\n\n')}\n\nĐội hỗ trợ Linden Books`;
  return [...paras.slice(0, -1), `(${instruction.trim()})`, paras.at(-1)].join('\n\n');
}
