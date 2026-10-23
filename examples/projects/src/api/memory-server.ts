// An in-memory AgentFlow that answers the published routes the module calls, in the published shapes, with the
// behaviour the module depends on: the package's access, rules and stage model (memory-rules.ts), the task's work, the
// completion stamp its armed workflow writes, and the rollups. Not a model of the platform: anything the module does
// not call answers 404, and an unmodelled filter answers 400.
import { applyListOps, ListOpError, newItemId, type components, type ListItem, type ListOp } from '@reflexify/agentflow-sdk';
import type { WireRecord } from '../model/records.js';
import { appObjectsFor, type ProjectIds } from '../shared/app-objects.js';
import { COMMENT_BODY_MAX, COMMENT_FILES_MAX, matchesPerson, peopleIn, renderBody, restoreLabels, type Resolver, type StoredComment } from './memory-comments.js';
import {
  GROUP_NAMES, isLive, judgeAccess, judgeMove, judgeRules, may, type Body, type EntityKey, type Judged, type Operation, type Refusal,
} from './memory-rules.js';

export type { EntityKey } from './memory-rules.js';
/** `comment: true` is a change to the record's thread alone (the platform's `comment.*` events). */
export type Change = { entity: EntityKey; id: string; kind: 'created' | 'updated' | 'deleted'; comment?: boolean };
/** `notify: false` is a write whose live event never arrives. */
export type WriteOptions = { notify?: boolean };

export interface SeedRecord {
  id: string; body: Record<string, unknown>; createdBy: string; createdAt: string;
  /** For a task: who its work is offered to, which `GET /work?view=claimable` lists it to while nobody holds it. */
  offeredTo?: string[];
}
/** An organisation unit, which the module only lists. The rest of the platform's unit (its tree, its archive) is filled in flat and live. */
export interface SeedUnit { id: string; name: string; code: string | null }
export interface SeedFile { id: string; name: string; type: string; bytes: Uint8Array }
/** A workflow step's task, which the module only lists. */
export interface SeedWorkflowTask {
  id: string; workflow: { id: string; name: string }; step: { key: string; label: string };
  claimedBy: string | null; users: string[]; groups: string[]; dueAt: string | null; startedAt: string;
}
/** A comment on a seeded record. */
export interface SeedComment { id: string; record: string; author: string; body: string; at: string; editedAt?: string; files?: string[] }
export interface Seed {
  ids: ProjectIds;
  people: { id: string; name: string; email: string | null }[];
  groups: Record<'users' | 'creators' | 'admins', string[]>;
  records: Partial<Record<EntityKey, SeedRecord[]>>;
  workflowTasks: SeedWorkflowTask[];
  files: SeedFile[];
  units?: SeedUnit[];
  comments?: SeedComment[];
}

export interface MemoryServer {
  fetch(request: Request): Promise<Response>;
  onChange(listener: (c: Change) => void): () => void;
  actAs(userId: string): void;
  /** The viewer is an app that is not told names: every person mentioned reads as restricted. */
  withholdNames(on: boolean): void;
  /** Another person's or the platform's write: no rules, but the stamp, the work, the rollups and the live event. */
  write(entity: EntityKey, id: string | null, body: Record<string, unknown>, by?: string, opts?: WriteOptions): WireRecord;
  remove(entity: EntityKey, id: string, opts?: WriteOptions): void;
  records(entity: EntityKey): WireRecord[];
  /** The next request whose method and path (after `/api`) match answers `status` with `body`, and does nothing else. */
  failNext(method: string, pathPattern: RegExp, status: number, body: object): void;
  /**
   * Lands every write the package's workflows still owe: the completion stamp, a freeze or an unfreeze. On the real
   * server each is a run of its own, landing a moment after the write that started it has answered; here each waits
   * `workflowDelay`, and this lands them now.
   */
  drain(): Promise<void>;
}

type FieldFilter = components['schemas']['RecordFieldFilter'];
type QueryRequest = components['schemas']['RecordQueryRequest'];
type WorkLine = components['schemas']['WorkListItem'];

/** The fake's own Workflow task entity: the module never names it, every workflow line carries it. */
export const MEMORY_WORKFLOW_TASK_ENTITY_ID = '0190c0de-0000-7000-8000-0000000000f2';

const ENTITY_KEYS: readonly EntityKey[] = ['project', 'section', 'task', 'task_label'];
/** The package turns comments on for these two; its tasks close theirs while frozen. */
const COMMENTABLE: ReadonlySet<EntityKey> = new Set(['task', 'project']);
const ENTITY_LABEL: Record<EntityKey, string> = { project: 'Project', section: 'Section', task: 'Task', task_label: 'Task label' };
const CHECKLIST_MAX = 20;
/** How many records one delete may touch, itself and the records it clears together: the platform's default. */
const CASCADE_MAX_RECORDS = 500;
/** What storage fills in on create, from the entity definitions. */
const DEFAULTS: Record<EntityKey, Body> = {
  project: { status: 'active' },
  section: {},
  task: { status: 'todo', blocked: false, priority: 'medium', show_checklist_on_card: false, origin: 'manual', frozen: false },
  task_label: {},
};
const REQUIRED: Record<EntityKey, string[]> = {
  project: ['name', 'managers'], section: ['project', 'name'], task: ['title', 'project'], task_label: ['name', 'base_status'],
};
/**
 * The entity fields each create form binds. A create maps its payload through these alone, as the real route does: a
 * key the form does not bind is dropped, not refused.
 */
export const CREATE_FORM_FIELDS: Record<EntityKey, readonly string[]> = {
  project: ['name', 'description', 'managers', 'members', 'unit'],
  section: ['project', 'name', 'description', 'position'],
  task: ['title', 'project', 'section', 'priority', 'due', 'description', 'checklist', 'origin'],
  task_label: ['name', 'base_status'],
};
/** Fields the platform writes: the work's holder, formulas and rollups. */
const COMPUTED: Record<EntityKey, string[]> = {
  project: ['tasks_todo', 'tasks_doing', 'tasks_done'],
  section: ['tasks_done', 'tasks_total'],
  task: ['claimed_by', 'checklist_done', 'checklist_total'],
  task_label: [],
};
/** Fields that hold a list of references: a filter on one takes `in` (any of the values) or emptiness, never `contains`. */
const REFERENCE_LISTS: Record<EntityKey, readonly string[]> = {
  project: ['managers', 'members'], section: [], task: ['collaborators'], task_label: [],
};
/**
 * The id each rule has once installed. A field error names a rule by that id, which a reader cannot interpret; these
 * are fixed so a test can name one, and opaque so nothing reads meaning into them.
 */
export const RULE_IDS: Record<string, string> = Object.fromEntries([
  'content_by_owner_or_manager', 'board_by_participants', 'blocked_only_while_doing', 'label_matches_status',
  'section_in_project', 'frozen_is_frozen', 'project_is_fixed', 'no_task_in_closed_project', 'base_status_is_fixed',
].map((key, i) => [key, `0190f8f4-0000-7000-8000-${String(0xa01 + i).padStart(12, '0')}`]));
const DISPLAY: Record<EntityKey, string> = { project: 'name', section: 'name', task: 'title', task_label: 'name' };
const REFS: Partial<Record<EntityKey, [string, EntityKey][]>> = {
  task: [['project', 'project'], ['section', 'section'], ['label', 'task_label']],
  section: [['project', 'project']],
};
const WORK_PRIORITY: Record<string, string> = { low: 'low', medium: 'normal', high: 'high', urgent: 'urgent' };
const TITLES: Record<number, string> = {
  400: 'Bad Request', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
// As the real server's envelope: a member that has no value is left out, not sent as null.
const problem = (status: number, type: string, extra: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ type, title: TITLES[status] ?? 'Error', status, request_id: 'memory', ...extra }), {
    status, headers: { 'content-type': 'application/problem+json' },
  });

/** Field errors as the record routes write them: entity keys as JSON Pointers, under `source: record`. */
const fieldErrors = (type: string, detail: string, errors: { path: string; message: string; rule: string }[]) =>
  problem(422, type, { detail, field_errors: errors, extensions: { field_errors: { source: 'record' } } });

/**
 * A refusal the server's domain raises: a conflict, a denial or an unprocessable request. Its `detail` is the error's
 * text, which puts the code in front of the sentence.
 */
const domain = (status: number, type: string, sentence: string, extra: Record<string, unknown> = {}) =>
  problem(status, type, { detail: `${type}: ${sentence}`, ...extra });
/** A record, entity or other object that is missing, or that the caller may not see: the two read the same. */
const notFound = (kind: string, id: string) => {
  const type = kind === 'entity_record' ? 'ENTITY_RECORD_NOT_FOUND' : kind === 'entity' ? 'ENTITY_NOT_FOUND' : 'NOT_FOUND';
  return problem(404, type, { detail: `not found: ${kind} ${id}` });
};
const stale = () => domain(409, 'STALE_VERSION', 'entity_record.updated_at does not match expected_updated_at');

/**
 * A refusal in the shape the real server answers it. Every violated rule is one field error, anchored on its field or,
 * for a rule about the whole record, on the empty pointer, and names its rule by the rule's opaque id.
 */
function refuse(r: Refusal, recordId: string): Response {
  if (r.violations?.length) {
    return fieldErrors(r.type, `${r.violations.length} record rule(s) refused the write`, r.violations.map((v) => ({
      path: v.field ? `/${v.field}` : '', message: v.message, rule: RULE_IDS[v.rule] ?? v.rule,
    })));
  }
  if (r.status === 404) return notFound('entity_record', recordId);
  return domain(r.status, r.type, r.detail ?? '');
}
/** A value the field's own constraints refuse: `VALIDATION_ERROR`, as storage answers it. */
const fieldError = (field: string, rule: string, message: string) =>
  fieldErrors('VALIDATION_ERROR', '1 field constraint(s) refused the write', [{ path: `/${field}`, message, rule }]);

/** A body or query that does not match the operation: the extractors' 400, naming the member it missed. */
const unreadable = (where: 'body' | 'query', member: string, problemText: string) => {
  const [type, detail] = where === 'body'
    ? ['MALFORMED_JSON', `the request body does not match this operation: ${problemText}`]
    : ['INVALID_QUERY_PARAMETER', `query parameter \`${member}\` is not valid: ${problemText}`];
  return problem(400, type, { detail, field_errors: [{ path: member, message: detail, rule: 'type' }] });
};
/** `expected_updated_at` as an instant, or why it cannot be one. */
function expectedInstant(v: unknown): { ms: number } | { problem: string } {
  if (v === undefined || v === null) return { problem: 'missing field `expected_updated_at`' };
  const ms = typeof v === 'string' && ISO_INSTANT.test(v) ? Date.parse(v) : Number.NaN;
  return Number.isNaN(ms) ? { problem: 'input contains invalid characters' } : { ms };
}

/** The users a work assignment names; the fake models no group or unit assignee. */
function assignedUsers(v: unknown): string[] {
  const list = Array.isArray(v) ? (v as { kind?: unknown; id?: unknown }[]) : [];
  return list.filter((a) => a.kind === 'user' && typeof a.id === 'string').map((a) => a.id as string);
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T/;

/** Strings compare as ISO text, except two instants, which compare as the moments they name. */
function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  const x = String(a);
  const y = String(b);
  if (ISO_INSTANT.test(x) && ISO_INSTANT.test(y)) {
    const [mx, my] = [Date.parse(x), Date.parse(y)];
    if (!Number.isNaN(mx) && !Number.isNaN(my)) return mx - my;
  }
  return x < y ? -1 : x > y ? 1 : 0;
}

/** A sort's order: as `compare`, except that text which names no instant sorts as Vietnamese readers expect. */
function order(a: unknown, b: unknown): number {
  const text = typeof a === 'string' && typeof b === 'string' && !(ISO_INSTANT.test(a) && ISO_INSTANT.test(b));
  return text ? (a as string).localeCompare(b as string, 'vi') : compare(a, b);
}

function equal(a: unknown, b: unknown): boolean {
  if (isEmpty(a) && (b === null || b === undefined)) return true;
  if (typeof a === 'string' && typeof b === 'string' && ISO_INSTANT.test(a) && ISO_INSTANT.test(b)) return compare(a, b) === 0;
  return a === b;
}

/** A filter the memory server does not model. It answers 400; any other error is the server's own bug. */
class UnmodelledFilter extends Error {}

function matches(body: Body, f: FieldFilter): boolean {
  const v = body[f.field];
  switch (f.op) {
    case 'eq': return equal(v, f.value);
    case 'ne': return !equal(v, f.value);
    // On a list field, any of the values in the list; on any other, the value is one of them.
    case 'in': {
      const values: unknown[] = Array.isArray(f.value) ? f.value : [];
      return Array.isArray(v) ? v.some((x) => values.includes(x)) : values.some((x) => equal(v, x));
    }
    case 'contains':
      if (Array.isArray(v)) return v.includes(f.value);
      return typeof v === 'string' && typeof f.value === 'string' && v.toLowerCase().includes(f.value.toLowerCase());
    case 'is_empty': return isEmpty(v);
    case 'is_not_empty': return !isEmpty(v);
    case 'gte': return !isEmpty(v) && compare(v, f.value) >= 0;
    case 'gt': return !isEmpty(v) && compare(v, f.value) > 0;
    case 'lte': return !isEmpty(v) && compare(v, f.value) <= 0;
    case 'lt': return !isEmpty(v) && compare(v, f.value) < 0;
    default: throw new UnmodelledFilter(`the memory server does not model the ${f.op} filter`);
  }
}

function page<T>(rows: T[], cursor: string | null | undefined, limit: number) {
  const offset = Number(cursor ?? 0) || 0;
  return { items: rows.slice(offset, offset + limit), next_cursor: offset + limit < rows.length ? String(offset + limit) : null, prev_cursor: null };
}

/** A checklist as storage keeps it: every item with an id. */
function withItemIds(v: unknown): ListItem[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    const o = (item && typeof item === 'object' ? item : {}) as Body;
    return { ...o, id: typeof o.id === 'string' && o.id ? o.id : newItemId() };
  });
}

type ResolvedMention = components['schemas']['ResolvedMention'];
type MentionItem = components['schemas']['MentionMenuItem'];

/** The text fields that may hold mentions, and the list columns that may. */
const MENTION_TEXT: Partial<Record<EntityKey, readonly string[]>> = { task: ['description'], project: ['description'] };
const MENTION_COLUMNS: Partial<Record<EntityKey, Record<string, string>>> = { task: { checklist: 'text' } };
const FIELD_LABEL: Record<string, string> = { description: 'Mô tả', checklist: 'Checklist' };
const TOKEN = /@\[((?:\\.|[^\]\\])*)\]\(mention:((?:user|record)(?:\/[0-9a-fA-F-]{36}){1,2})\)/g;
const escapeLabel = (label: string) => label.replace(/[\\[\]]/g, (c) => `\\${c}`);
const unescapeLabel = (label: string) => label.replace(/\\(.)/g, '$1');
const tokenOf = (ref: string, label: string) => `@[${escapeLabel(label)}](mention:${ref})`;
/** Lower case without accents, so "hoa" finds "Hòa" and "dang" finds "Đăng". */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
/** Every word typed starts some word of the target. */
function startsWords(target: string, q: string): boolean {
  const words = fold(target).split(/\s+/).filter(Boolean);
  return fold(q).split(/\s+/).filter(Boolean).every((w) => words.some((x) => x.startsWith(w)));
}
const MENU_PEOPLE = 3;
const MENU_RECORDS = 3;
const MENU_ALONE = 8;
const MENU_RECENT = 4;

/** How long the package's workflows take to land their writes by default: about what a run takes on the real server. */
export const WORKFLOW_DELAY_MS = 800;

export interface MemoryServerOptions {
  now?: () => Date;
  /**
   * How long a workflow's write waits after the write that started it, in milliseconds; `'manual'` holds every one
   * until `drain()`. Default `WORKFLOW_DELAY_MS`.
   */
  workflowDelay?: number | 'manual';
}

export function createMemoryServer(seed: Seed, opts: MemoryServerOptions = {}): MemoryServer {
  const now = opts.now ?? (() => new Date());
  const ids = seed.ids;
  const entityOf = new Map(ENTITY_KEYS.map((k) => [ids.entities[k], k] as const));
  const groupOf = new Map(Object.entries(ids.groups).map(([k, v]) => [v, k as keyof Seed['groups']] as const));
  const store = new Map<EntityKey, Map<string, WireRecord>>(ENTITY_KEYS.map((k) => [k, new Map()]));
  /** Who each task's work is offered to: what the routing rule or the last assignment named. */
  const offered = new Map<string, string[]>();
  const files = new Map(seed.files.map((f) => [f.id, { ...f, uploadedAt: now().toISOString() }]));
  const comments = new Map<string, StoredComment[]>();
  let commentSeq = 0;
  /** A comment create's answer by its Idempotency-Key, which a repeat gets again instead of a second comment. */
  const commentReplays = new Map<string, { status: number; body: unknown }>();
  const workflowTasks = seed.workflowTasks.map((t) => ({ ...t }));
  const unitStamp = now().toISOString();
  const units = (seed.units ?? []).map((u) => ({
    id: u.id, name: u.name, code: u.code, parent_id: null, depth: 0, ancestor_names: [] as string[], archived: false, archived_at: null,
    created_at: unitStamp, updated_at: unitStamp,
  }));
  const listeners = new Set<(c: Change) => void>();
  const failures: { method: string; pattern: RegExp; status: number; body: object }[] = [];
  let actor = seed.people[0]?.id ?? '';
  let lastStamp = Number.NEGATIVE_INFINITY;
  /** What each person mentioned last, newest first, as `record/<entity id>/<record id>`. */
  const recents = new Map<string, string[]>();
  /** Whether people's names are withheld from the viewer, as from an installed app whose ceiling lists none. */
  let withholdNames = false;

  function resolveMention(ref: string, viewer: string): ResolvedMention | null {
    const [kind, a, b] = ref.split('/');
    if (kind === 'user') {
      if (withholdNames) return { state: 'restricted', kind: 'user' };
      const person = seed.people.find((x) => x.id === a);
      return person ? { state: 'ok', kind: 'user', id: a!, label: person.name } : { state: 'deleted', kind: 'user' };
    }
    if (kind !== 'record') return null;
    const k = entityOf.get(a ?? '');
    if (!k) return { state: 'restricted', kind: 'record' };
    const r = store.get(k)!.get(b ?? '');
    if (!r) return { state: 'deleted', kind: 'record' };
    if (!allowed('read', k, r.body, viewer)) return { state: 'restricted', kind: 'record' };
    return {
      state: 'ok', kind: 'record', id: b!, entity_id: a!, entity_label: ENTITY_NAMES[k], label: String(r.body[DISPLAY[k]] ?? ''),
      href: `/entities/${a}/records/${b}`,
    };
  }

  /** One text as `viewer` reads it: a record they may not read, or a deleted one, keeps no label, and a deleted person keeps theirs. */
  function maskText(text: string, viewer: string, map: Record<string, ResolvedMention>): string {
    return text.replace(TOKEN, (whole, _label: string, ref: string) => {
      const found = resolveMention(ref, viewer);
      if (!found) return whole;
      map[ref] = found;
      if (found.state === 'ok') return tokenOf(ref, found.label);
      return found.state === 'deleted' && found.kind === 'user' ? whole : tokenOf(ref, '');
    });
  }

  /** Each text of a record that may hold a mention, as `[field, item id or null]`. */
  function mentionTexts(k: EntityKey, body: Body): { field: string; item: string | null; text: string }[] {
    const out: { field: string; item: string | null; text: string }[] = [];
    for (const field of MENTION_TEXT[k] ?? []) if (typeof body[field] === 'string') out.push({ field, item: null, text: body[field] as string });
    for (const [field, column] of Object.entries(MENTION_COLUMNS[k] ?? {})) {
      for (const item of Array.isArray(body[field]) ? (body[field] as Body[]) : []) {
        if (typeof item?.[column] === 'string') out.push({ field, item: String(item.id ?? ''), text: item[column] as string });
      }
    }
    return out;
  }

  /** A record as `viewer` reads it, with the `mentions` map of what its texts name. */
  function maskBody(k: EntityKey, body: Body, viewer: string): { body: Body; mentions: Record<string, ResolvedMention> } {
    const mentions: Record<string, ResolvedMention> = {};
    const out: Body = { ...body };
    for (const field of MENTION_TEXT[k] ?? []) if (typeof body[field] === 'string') out[field] = maskText(body[field] as string, viewer, mentions);
    for (const [field, column] of Object.entries(MENTION_COLUMNS[k] ?? {})) {
      if (!Array.isArray(body[field])) continue;
      out[field] = (body[field] as Body[]).map((item) =>
        typeof item?.[column] === 'string' ? { ...item, [column]: maskText(item[column] as string, viewer, mentions) } : item);
    }
    return { body: out, mentions };
  }

  /**
   * A write's texts with every label the server's own: a person's name or a readable record's title, whatever the client
   * sent. A target the writer cannot resolve takes the label the stored text has for it at the same place (the same
   * field or list item), else none: a masked token a client sends back never blanks or forges a stored label.
   */
  function deriveLabels(k: EntityKey, before: Body | null, changes: Body): Body {
    const out: Body = { ...changes };
    const previous = new Map<string, string>();
    for (const t of before ? mentionTexts(k, before) : []) {
      for (const m of t.text.matchAll(TOKEN)) previous.set(`${t.field}#${t.item ?? ''}#${m[2]!}`, unescapeLabel(m[1]!));
    }
    const derive = (text: string, place: string) => text.replace(TOKEN, (whole, _label: string, ref: string) => {
      const found = resolveMention(ref, actor);
      if (!found) return whole;
      return tokenOf(ref, found.state === 'ok' ? found.label : (previous.get(`${place}#${ref}`) ?? ''));
    });
    for (const field of MENTION_TEXT[k] ?? []) if (typeof out[field] === 'string') out[field] = derive(out[field] as string, `${field}#`);
    for (const [field, column] of Object.entries(MENTION_COLUMNS[k] ?? {})) {
      if (!Array.isArray(out[field])) continue;
      out[field] = (out[field] as Body[]).map((item) =>
        typeof item?.[column] === 'string' ? { ...item, [column]: derive(item[column] as string, `${field}#${String(item.id ?? '')}`) } : item);
    }
    return out;
  }

  /** The records the actor just mentioned in a stored record, newest first, for the menu's recent group. */
  function remember(k: EntityKey, body: Body) {
    for (const t of mentionTexts(k, body)) {
      for (const m of t.text.matchAll(TOKEN)) {
        const ref = m[2]!;
        if (!ref.startsWith('record/') || resolveMention(ref, actor)?.state !== 'ok') continue;
        recents.set(actor, [ref, ...(recents.get(actor) ?? []).filter((x) => x !== ref)].slice(0, 20));
      }
    }
  }

  function menu(q: URLSearchParams): Response {
    const entity = entityOf.get(q.get('entity_id') ?? '');
    const recordId = q.get('record_id');
    const target = entity && recordId ? store.get(entity)!.get(recordId) : undefined;
    const text = q.get('q') ?? '';
    const group = q.get('group');
    const limit = Number(q.get('limit') ?? 0);
    const cap = (alone: number, usual: number) => (limit >= 1 ? Math.min(limit, 8) : group ? alone : usual);
    const groups: components['schemas']['MentionMenuGroup'][] = [];
    const recordItem = (k: EntityKey, r: WireRecord, matched?: string): MentionItem => ({
      kind: 'record', id: r.id, entity_id: ids.entities[k], entity_label: ENTITY_NAMES[k], label: String(r.body[DISPLAY[k]] ?? ''),
      ...(matched ? { matched_field: matched } : {}),
    });
    if (!text.trim()) {
      const items: MentionItem[] = [];
      for (const ref of recents.get(actor) ?? []) {
        const [, eid, rid] = ref.split('/');
        const k = entityOf.get(eid ?? '');
        const r = k ? store.get(k)!.get(rid ?? '') : undefined;
        if (k && r && allowed('read', k, r.body)) items.push(recordItem(k, r));
        if (items.length >= MENU_RECENT) break;
      }
      if (items.length) groups.push({ key: 'recent', label: 'Recent', items });
      return json({ groups, unsearched: [] });
    }
    if (!group || group === 'people') {
      const people = seed.people
        .filter((p) => (!entity || !target || allowed('read', entity, target.body, p.id)) && (startsWords(p.name, text) || (p.email !== null && fold(p.email).startsWith(fold(text.trim())))))
        .map((p): MentionItem => ({ kind: 'user', id: p.id, name: p.name, email: p.email, is_self: p.id === actor, will_be_notified: !!target && p.id !== actor }));
      const shown = people.slice(0, cap(MENU_ALONE, MENU_PEOPLE));
      if (shown.length) groups.push({ key: 'people', label: 'People', items: shown, ...(group === 'people' ? { total: people.length } : {}) });
    }
    if (group !== 'people') {
      for (const k of ENTITY_KEYS) {
        const key = `entity:${ids.entities[k]}`;
        if (group && group !== key) continue;
        const hits = [...store.get(k)!.values()]
          .filter((r) => allowed('read', k, r.body) && !(r.id === recordId && k === entity) && startsWords(String(r.body[DISPLAY[k]] ?? ''), text))
          .sort((a, b) => String(a.body[DISPLAY[k]]).localeCompare(String(b.body[DISPLAY[k]]), 'vi'));
        if (!hits.length) continue;
        const shown = hits.slice(0, cap(MENU_ALONE, MENU_RECORDS));
        groups.push({
          key, label: ENTITY_NAMES[k], items: shown.map((r) => recordItem(k, r)),
          ...(hits.length > shown.length ? { more: hits.length - shown.length } : {}), ...(group ? { total: hits.length } : {}),
        });
      }
    }
    // The demo has fewer entities than the menu searches at once, so none is left unsearched.
    return json({ groups, unsearched: [] });
  }

  /** The records and fields that mention one record, among those `actor` may read, one row per source. */
  function mentionedIn(entity: EntityKey, id: string): { items: Record<string, unknown>[] } {
    const ref = `record/${ids.entities[entity]}/${id}`;
    const rows: { at: string; row: Record<string, unknown> }[] = [];
    for (const k of ENTITY_KEYS) {
      for (const r of store.get(k)!.values()) {
        if (!allowed('read', k, r.body)) continue;
        const named = (text: string) => [...text.matchAll(TOKEN)].filter((m) => m[2]!.toLowerCase() === ref.toLowerCase()).length;
        const hits = mentionTexts(k, r.body).filter((t) => named(t.text) > 0);
        const inComments = COMMENTABLE.has(k) ? (comments.get(r.id) ?? []).filter((c) => named(c.body) > 0) : [];
        if (!hits.length && !inComments.length) continue;
        const count = hits.reduce((n, t) => n + named(t.text), 0) + inComments.reduce((n, c) => n + named(c.body), 0);
        const at = inComments.reduce((latest, c) => (c.createdAt > latest ? c.createdAt : latest), r.updated_at);
        rows.push({
          at,
          row: {
            record_id: r.id, entity_id: ids.entities[k], entity_label: ENTITY_NAMES[k], label: String(r.body[DISPLAY[k]] ?? ''),
            places: [
              ...(inComments.length ? [{ kind: 'comment' }] : []),
              ...[...new Set(hits.map((h) => h.field))].map((f) => ({ kind: 'field', key: f, label: FIELD_LABEL[f] ?? f })),
            ],
            count, last_at: at, last_author: r.created_by ? nameOf(r.created_by) : null,
          },
        });
      }
    }
    return { items: rows.sort((a, b) => b.at.localeCompare(a.at)).map((x) => x.row) };
  }

  // The clock, but strictly increasing, so two writes in one millisecond still differ for the version check.
  const stamp = () => {
    lastStamp = Math.max(lastStamp + 1, now().getTime());
    return new Date(lastStamp).toISOString();
  };
  const raw = (k: EntityKey, id: string): Body | null => store.get(k)!.get(id)?.body ?? null;
  const groups = { admins: seed.groups.admins, creators: seed.groups.creators };
  const allowed = (op: Operation, k: EntityKey, body: Body, who = actor) => may(op, k, who, body, raw, groups);
  const nameOf = (userId: string) => seed.people.find((p) => p.id === userId)?.name ?? null;
  const membersOf = (groupId: string): string[] => {
    const key = groupOf.get(groupId);
    return key ? seed.groups[key] : [];
  };

  function announce(change: Change, notify: boolean) {
    if (notify) for (const l of listeners) l(change);
  }

  /** What a reader sees of a record: its body, and the names of the records and files it points to that they may read. */
  function decorate(k: EntityKey, r: WireRecord, viewer: string | null): WireRecord {
    const ref_labels: Record<string, Record<string, string | null>> = {};
    for (const [field, target] of REFS[k] ?? []) {
      const id = r.body[field];
      if (typeof id !== 'string' || !id) continue;
      const t = raw(target, id);
      const visible = t && (viewer === null || allowed('read', target, t, viewer));
      ref_labels[field] = { [id]: visible && typeof t[DISPLAY[target]] === 'string' ? (t[DISPLAY[target]] as string) : null };
    }
    const masked = viewer === null ? null : maskBody(k, r.body, viewer);
    const out: WireRecord = { ...r, body: masked ? masked.body : { ...r.body }, ref_labels };
    if (masked && Object.keys(masked.mentions).length > 0) out.mentions = masked.mentions;
    if (k === 'task' && Array.isArray(r.body.attachments)) {
      out.file_labels = { attachments: Object.fromEntries((r.body.attachments as string[]).map((a) => [a, files.get(a)?.name ?? null])) };
    }
    return out;
  }

  /**
   * Recomputes every rollup and names the parents whose values moved. As on the real server, the recompute writes the
   * parent's body without a new `updated_at` or version, and announces it as an update of its own.
   */
  function recomputeRollups(): Change[] {
    const tasks = [...store.get('task')!.values()].map((t) => t.body);
    const moved: Change[] = [];
    const apply = (k: EntityKey, r: WireRecord, values: Body) => {
      if (Object.entries(values).some(([key, v]) => r.body[key] !== v)) moved.push({ entity: k, id: r.id, kind: 'updated' });
      Object.assign(r.body, values);
    };
    for (const p of store.get('project')!.values()) {
      const mine = tasks.filter((t) => t.project === p.id);
      apply('project', p, {
        tasks_todo: mine.filter((t) => t.status === 'todo').length,
        tasks_doing: mine.filter((t) => t.status === 'doing').length,
        tasks_done: mine.filter((t) => t.status === 'done').length,
      });
    }
    for (const sec of store.get('section')!.values()) {
      const mine = tasks.filter((t) => t.section === sec.id);
      apply('section', sec, {
        tasks_done: mine.filter((t) => t.status === 'done').length,
        tasks_total: mine.filter((t) => t.status !== 'cancelled').length,
      });
    }
    return moved;
  }

  function checklistFormulas(body: Body) {
    const list = Array.isArray(body.checklist) ? (body.checklist as Body[]) : [];
    body.checklist_done = list.filter((i) => i.done === true).length;
    body.checklist_total = list.length;
  }

  /**
   * What follows a task's status in the same write on the real server: the work starts with its creator as holder (the
   * routing rule), and restarts the same way on a reopen or a restore. Work that ends keeps `claimed_by`: the person who
   * held it. A write that names `claimed_by` itself keeps it.
   */
  function taskEffects(id: string, before: Body | null, after: Body, creator: string | null, holderGiven: boolean) {
    const was = before ? String(before.status ?? '') : null;
    const is = String(after.status ?? '');
    const start = () => {
      if (!holderGiven) {
        if (creator) after.claimed_by = creator;
        else delete after.claimed_by;
      }
      offered.set(id, creator ? [creator] : []);
    };
    if (was === null ? isLive(is) : was !== is && !isLive(was) && isLive(is)) start();
    checklistFormulas(after);
  }

  /** The workflows' writes still to land, in order, each with the timer that lands it and every one owed before it. */
  const owed: { write: () => void; timer: ReturnType<typeof setTimeout> | null }[] = [];
  const delay = opts.workflowDelay ?? WORKFLOW_DELAY_MS;
  function later(write: () => void) {
    const entry: (typeof owed)[number] = { write, timer: null };
    if (delay !== 'manual') entry.timer = setTimeout(() => land(entry), delay);
    owed.push(entry);
  }
  /** Lands what is owed, in order, up to `last`, or all of it. */
  function land(last?: (typeof owed)[number]) {
    while (owed.length) {
      const next = owed.shift()!;
      if (next.timer !== null) clearTimeout(next.timer);
      next.write();
      if (next === last) break;
    }
  }

  /**
   * The package's stamp_completion workflow: an update that moves a task into or out of `done` starts a run, which reads
   * the task as it is by then and stamps `completed_at` if it is done, or clears it if not.
   */
  function stampCompletion(id: string, notify: boolean) {
    later(() => {
      const t = store.get('task')!.get(id);
      if (!t) return;
      if (t.body.status === 'done') save('task', id, { completed_at: now().toISOString() }, null, notify);
      else if ('completed_at' in t.body) save('task', id, { completed_at: null }, null, notify);
    });
  }

  /** Stores a write, runs what follows it, and tells the listeners. No access or rule check: callers decide those. */
  function save(k: EntityKey, id: string | null, changes: Body, by: string | null, notify: boolean, extra?: { offerTo?: string[] }): WireRecord {
    const table = store.get(k)!;
    const existing = id ? table.get(id) : undefined;
    const body: Body = { ...(existing?.body ?? {}), ...changes };
    for (const [key, v] of Object.entries(changes)) if (v === null) delete body[key];
    if (k === 'task' && 'checklist' in changes) body.checklist = withItemIds(body.checklist);
    const at = stamp();
    const recordId = existing?.id ?? id ?? crypto.randomUUID();
    const createdBy = existing ? (existing.created_by ?? null) : by;
    if (k === 'task') {
      taskEffects(recordId, existing?.body ?? null, body, createdBy, 'claimed_by' in changes);
      if (extra?.offerTo) offered.set(recordId, extra.offerTo);
    }
    const r: WireRecord = existing
      ? { ...existing, body, version: existing.version + 1, updated_at: at }
      : { id: recordId, entity_id: ids.entities[k], org_id: 'org', body, version: 1, created_at: at, updated_at: at, created_by: createdBy };
    table.set(r.id, r);
    if (k === 'project' && existing) freezeOnClose(r.id, existing.body, r.body, notify);
    if (k === 'task' && existing && existing.body.status !== r.body.status && (existing.body.status === 'done' || r.body.status === 'done')) {
      stampCompletion(r.id, notify);
    }
    const moved = k === 'task' || k === 'project' ? recomputeRollups() : [];
    announce({ entity: k, id: r.id, kind: existing ? 'updated' : 'created' }, notify);
    for (const c of moved) announce(c, notify);
    return r;
  }

  /** The package's freeze and unfreeze workflows: a closed project's tasks are frozen until it reopens. Each is a run. */
  function freezeOnClose(projectId: string, before: Body, after: Body, notify: boolean) {
    if (before.status === after.status) return;
    const frozen = after.status === 'closed' ? true : before.status === 'closed' ? false : null;
    if (frozen === null) return;
    later(() => {
      for (const t of [...store.get('task')!.values()]) {
        if (t.body.project === projectId && t.body.frozen !== frozen) save('task', t.id, { frozen }, null, notify);
      }
    });
  }

  /** The records that point at this one through a field that is cleared when it goes, as `on_target_delete: clear` does. */
  function clearsOf(k: EntityKey, id: string): { child: EntityKey; field: string; rows: WireRecord[] }[] {
    const refs: [EntityKey, string][] = k === 'section' ? [['task', 'section']] : k === 'task_label' ? [['task', 'label']] : [];
    return refs
      .map(([child, field]) => ({ child, field, rows: [...store.get(child)!.values()].filter((c) => c.body[field] === id) }))
      .filter((g) => g.rows.length > 0);
  }

  /** Deletes a record and clears what pointed at it; answers how many records it cleared, by entity and field. */
  function drop(k: EntityKey, id: string, notify: boolean): { child: EntityKey; field: string; count: number }[] {
    const table = store.get(k)!;
    if (!table.delete(id)) return [];
    offered.delete(id);
    comments.delete(id);
    const cleared = clearsOf(k, id);
    for (const { child, field, rows } of cleared) {
      for (const c of rows) save(child, c.id, { [field]: null }, null, notify);
    }
    const moved = recomputeRollups();
    announce({ entity: k, id, kind: 'deleted' }, notify);
    for (const c of moved) announce(c, notify);
    return cleared.map((g) => ({ child: g.child, field: g.field, count: g.rows.length }));
  }

  for (const k of ENTITY_KEYS) {
    for (const s of seed.records[k] ?? []) {
      const body: Body = { ...DEFAULTS[k], ...s.body };
      if (k === 'task') {
        body.checklist = withItemIds(body.checklist);
        checklistFormulas(body);
        offered.set(s.id, s.offeredTo ?? [s.createdBy]);
      }
      const updatedAt = typeof body.completed_at === 'string' && body.completed_at > s.createdAt ? body.completed_at : s.createdAt;
      store.get(k)!.set(s.id, {
        id: s.id, entity_id: ids.entities[k], org_id: 'org', body, version: 1, created_at: s.createdAt, updated_at: updatedAt, created_by: s.createdBy,
      });
    }
  }
  recomputeRollups();
  for (const c of seed.comments ?? []) {
    const list = comments.get(c.record) ?? [];
    list.push({ id: c.id, record: c.record, author: c.author, body: c.body, createdAt: c.at, editedAt: c.editedAt ?? null, files: c.files ?? [], seq: ++commentSeq });
    comments.set(c.record, list);
  }

  function resolver(): Resolver {
    return {
      person: nameOf,
      record(entityId, recordId) {
        const k = entityOf.get(entityId);
        const r = k ? store.get(k)!.get(recordId) : undefined;
        if (!k || !r) return 'deleted';
        if (!allowed('read', k, r.body)) return 'restricted';
        const label = r.body[DISPLAY[k]];
        return { entityLabel: ENTITY_LABEL[k], label: typeof label === 'string' ? label : '' };
      },
    };
  }

  /** A thread as the actor reads it: comments are record-level, so reading the record is enough to read and write them. */
  function commentView(k: EntityKey, r: WireRecord, c: StoredComment, closed: boolean) {
    const rendered = renderBody(c.body, resolver());
    return {
      id: c.id, author: { id: c.author, name: nameOf(c.author) ?? '' }, body: rendered.body, mentions: rendered.mentions,
      created_at: c.createdAt, ...(c.editedAt ? { edited_at: c.editedAt } : {}),
      can_edit: !closed && c.author === actor,
      can_delete: !closed && (c.author === actor || allowed('update', k, r.body)),
      files: c.files.flatMap((id) => {
        const f = files.get(id);
        return f ? [{ id, name: f.name, byte_size: f.bytes.byteLength, content_type: f.type }] : [];
      }),
    };
  }

  const unnotifiedOf = (k: EntityKey, r: WireRecord, added: string[]) =>
    added.flatMap((id) => {
      const name = nameOf(id);
      return name !== null && !allowed('read', k, r.body, id) ? [{ user_id: id, name }] : [];
    });

  async function commentsRoute(k: EntityKey, r: WireRecord | undefined, readable: boolean, parts: string[], request: Request): Promise<Response> {
    const method = request.method;
    const q = new URL(request.url).searchParams;
    if (!r || !readable) return notFound('entity_record', parts[3] ?? '');
    if (!COMMENTABLE.has(k)) return domain(409, 'COMMENTS_DISABLED', 'this entity takes no comments');
    const closed = k === 'task' && r.body.frozen === true;
    const thread = comments.get(r.id) ?? [];
    const announceComment = () => announce({ entity: k, id: r.id, kind: 'updated', comment: true }, true);
    const view = (c: StoredComment) => commentView(k, r, c, closed);

    if (parts.length === 5 && method === 'GET') {
      const limit = Number(q.get('limit') ?? 50);
      if (!Number.isInteger(limit) || limit < 1) return unreadable('query', 'limit', 'must be a whole number from 1');
      const cursor = q.get('cursor');
      const before = q.get('before');
      if (cursor && before) return unreadable('query', 'before', 'cursor and before cannot be sent together');
      const at = (id: string) => thread.findIndex((c) => c.id === id);
      const size = Math.min(limit, 100);
      let from: number;
      let to: number;
      if (cursor) {
        const i = at(cursor);
        if (i < 0) return problem(400, 'CURSOR_INVALID', { detail: 'the cursor names no comment' });
        from = i + 1;
        to = Math.min(thread.length, from + size);
      } else {
        const i = before ? at(before) : thread.length;
        if (i < 0) return problem(400, 'CURSOR_INVALID', { detail: 'the cursor names no comment' });
        to = i;
        from = Math.max(0, to - size);
      }
      const items = thread.slice(from, to);
      return json({
        items: items.map(view), total: thread.length, closed, can_comment: !closed,
        ...(!cursor && !before ? {} : to < thread.length ? { next_cursor: items.at(-1)?.id } : {}),
        ...(from > 0 && items[0] ? { prev_cursor: items[0].id } : {}),
      });
    }

    const refuseWrite = () => (closed ? domain(409, 'COMMENTS_CLOSED', 'the record\'s comments are closed') : null);
    const checked = (body: unknown, attachments: unknown, needText: boolean): Response | { text: string | null; files: string[] | null } => {
      const text = typeof body === 'string' ? body : null;
      const ids = Array.isArray(attachments) ? (attachments as string[]) : null;
      if (needText && text === null) return unreadable('body', 'body', 'missing field `body`');
      if (text !== null && Array.from(text).length > COMMENT_BODY_MAX) return domain(422, 'COMMENT_TOO_LONG', 'the comment is too long');
      if (ids && ids.length > COMMENT_FILES_MAX) return domain(422, 'COMMENT_TOO_MANY_FILES', 'too many files');
      for (const id of ids ?? []) if (!files.has(id)) return domain(422, 'VALIDATION_ERROR', `attachment ${id} was not found`);
      return { text, files: ids };
    };

    if (parts.length === 5 && method === 'POST') {
      const idempotencyKey = request.headers.get('idempotency-key');
      const replay = idempotencyKey ? commentReplays.get(`${actor}:${idempotencyKey}`) : undefined;
      if (replay) return json(replay.body, replay.status);
      const closedRefusal = refuseWrite();
      if (closedRefusal) return closedRefusal;
      const b = await request.json() as Body;
      const done = checked(b.body, b.attachment_ids ?? [], true);
      if (done instanceof Response) return done;
      if (!done.text!.trim() && (done.files ?? []).length === 0) return domain(422, 'COMMENT_EMPTY', 'a comment needs text or a file');
      const stored: StoredComment = {
        id: crypto.randomUUID(), record: r.id, author: actor, body: done.text!, createdAt: stamp(), editedAt: null, files: done.files ?? [], seq: ++commentSeq,
      };
      comments.set(r.id, [...thread, stored]);
      announceComment();
      const answer = { comment: view(stored), unnotified: unnotifiedOf(k, r, peopleIn(stored.body)) };
      if (idempotencyKey) commentReplays.set(`${actor}:${idempotencyKey}`, { status: 201, body: answer });
      return json(answer, 201);
    }

    const target = thread.find((c) => c.id === parts[5]);
    if (parts.length === 6 && (method === 'PATCH' || method === 'DELETE')) {
      const closedRefusal = refuseWrite();
      if (closedRefusal) return closedRefusal;
      let version = 0;
      if (method === 'PATCH') {
        const match = request.headers.get('if-match');
        if (!match) return problem(428, 'PRECONDITION_REQUIRED', { detail: 'If-Match names the comment\'s version' });
        version = Date.parse(match.replace(/^"|"$/g, ''));
        if (Number.isNaN(version)) return problem(400, 'BAD_REQUEST', { detail: 'If-Match is not an RFC 3339 timestamp' });
      }
      if (!target) return domain(404, 'COMMENT_NOT_FOUND', 'no such comment');
      if (method === 'DELETE') {
        if (target.author !== actor && !allowed('update', k, r.body)) return domain(403, 'COMMENT_NOT_AUTHOR', 'only its author or an editor of the record may delete a comment');
        comments.set(r.id, thread.filter((c) => c !== target));
        announceComment();
        return new Response(null, { status: 204 });
      }
      if (target.author !== actor) return domain(403, 'COMMENT_NOT_AUTHOR', 'only the author may edit a comment');
      if (version !== Date.parse(target.editedAt ?? target.createdAt)) return stale();
      const b = await request.json() as Body;
      if (b.body === undefined && b.attachment_ids === undefined) return domain(422, 'VALIDATION_ERROR', 'a patch names body, attachment_ids or both');
      const done = checked(b.body, b.attachment_ids, false);
      if (done instanceof Response) return done;
      const body = done.text === null ? target.body : restoreLabels(done.text, target.body);
      const nextFiles = done.files ?? target.files;
      if (!body.trim() && nextFiles.length === 0) return domain(422, 'COMMENT_EMPTY', 'a comment needs text or a file');
      const had = new Set(peopleIn(target.body));
      Object.assign(target, { body, files: nextFiles, editedAt: stamp() });
      announceComment();
      return json({ comment: view(target), unnotified: unnotifiedOf(k, r, peopleIn(body).filter((id) => !had.has(id))) });
    }
    return problem(404, 'NOT_FOUND', { detail: `${method} ${parts.join('/')} is not modelled` });
  }

  /** None of the platform's own fields may be sent. */
  function refuseComputed(k: EntityKey, changes: Body): Response | null {
    const computed = COMPUTED[k].find((f) => f in changes);
    return computed ? fieldError(computed, 'read_only', 'is set by the platform') : null;
  }

  /**
   * The write's tail, in the real order: the stage gate, then required fields (a create leaves none empty; an update
   * clears none, which `PATCH` refuses before any of this), then list limits, then every broken record rule together.
   */
  function judgeTail(j: Judged, touched: string[], recordId: string): Response | null {
    const moved = judgeMove(j);
    if (moved) return refuse(moved, recordId);
    const required = REQUIRED[j.entity].filter((f) => (j.before ? touched.includes(f) : true) && isEmpty(j.after[f]));
    if (required.length) {
      return domain(422, 'VALIDATION_ERROR', `missing required fields: ${required.join(', ')}`);
    }
    if (j.entity === 'task' && touched.includes('checklist')) {
      const had = Array.isArray(j.before?.checklist) ? (j.before.checklist as unknown[]).length : 0;
      const has = Array.isArray(j.after.checklist) ? (j.after.checklist as unknown[]).length : 0;
      // A list already over its limit may still shrink or be edited; only growth past it is refused.
      if (has > CHECKLIST_MAX && has > had) return fieldError('checklist', 'maxItems', 'has more entries than this field allows');
    }
    const rules = judgeRules(j);
    return rules ? refuse(rules, recordId) : null;
  }
  const judged = (k: EntityKey, before: Body | null, after: Body): Judged => ({ entity: k, actor, before, after, read: raw, ...groups });

  function query(k: EntityKey, req: QueryRequest): Response {
    const listOp = (req.filter?.field_filters ?? []).find((f) => f.op === 'contains' && REFERENCE_LISTS[k].includes(f.field));
    if (listOp) {
      return problem(400, 'VALIDATION_ERROR', { detail: `VALIDATION_ERROR: operator not valid for field '${listOp.field}' of this type` });
    }
    let rows = [...store.get(k)!.values()].filter((r) => allowed('read', k, r.body));
    for (const f of req.filter?.field_filters ?? []) rows = rows.filter((r) => matches(r.body, f));
    const sort = req.sort ?? 'updated_at';
    const dir = req.dir === 'desc' ? -1 : 1;
    const key = (r: WireRecord) => (sort === 'created_at' || sort === 'updated_at' ? r[sort] : r.body[sort]);
    rows.sort((a, b) => {
      const [x, y] = [key(a), key(b)];
      // Nulls last, whichever way.
      if (isEmpty(x) !== isEmpty(y)) return isEmpty(x) ? 1 : -1;
      const c = isEmpty(x) ? 0 : dir * order(x, y);
      return c || a.id.localeCompare(b.id);
    });
    const p = page(rows, req.cursor, req.limit ?? 50);
    return json({ ...p, items: p.items.map((r) => decorate(k, r, actor)) });
  }

  function workItem(t: WireRecord) {
    return {
      record_id: t.id, active: isLive(t.body.status), claimed_by_user_id: (t.body.claimed_by as string | undefined) ?? null,
      claimed_at: t.body.claimed_by ? t.updated_at : null,
      assigned_user_ids: offered.get(t.id) ?? [], assigned_group_ids: [], assigned_unit_ids: [],
    };
  }

  function workLines(view: string): WorkLine[] {
    const mine = view !== 'claimable';
    const tasks: WorkLine[] = [...store.get('task')!.values()]
      .filter((t) => isLive(t.body.status) && allowed('read', 'task', t.body))
      .filter((t) => (mine ? t.body.claimed_by === actor : !t.body.claimed_by && (offered.get(t.id) ?? []).includes(actor)))
      .map((t) => ({
        id: t.id, entity_id: ids.entities.task, title: typeof t.body.title === 'string' ? t.body.title : null, status: 'active',
        priority: WORK_PRIORITY[String(t.body.priority)] ?? null, live: true,
        claimed_by_user_id: (t.body.claimed_by as string | undefined) ?? null,
        assigned_user_ids: offered.get(t.id) ?? [], assigned_group_ids: [], assigned_unit_ids: [],
        due_at: null, started_at: t.created_at, clock: null,
      }));
    const steps: WorkLine[] = workflowTasks
      .filter((w) => (mine
        ? w.claimedBy === actor
        : !w.claimedBy && (w.users.includes(actor) || w.groups.some((g) => membersOf(g).includes(actor)))))
      .map((w) => ({
        id: w.id, entity_id: MEMORY_WORKFLOW_TASK_ENTITY_ID, title: w.step.label, status: 'active', priority: 'normal', live: true,
        claimed_by_user_id: w.claimedBy, assigned_user_ids: w.users, assigned_group_ids: w.groups, assigned_unit_ids: [],
        due_at: w.dueAt, started_at: w.startedAt, clock: null,
        step: { workflow: w.workflow, step: w.step, kind: 'human' as const, signs: false, subject: null },
      }));
    return [...tasks, ...steps].sort((a, b) => String(a.started_at).localeCompare(String(b.started_at)) || a.id.localeCompare(b.id));
  }

  /** A work operation, once the record is known to be readable: the real operations' checks, in their order. */
  async function workRoute(r: WireRecord, verb: string, read: () => Promise<Body>): Promise<Response> {
    if (!['claim', 'assign', 'reassign', 'release'].includes(verb)) return notFound('entity_record', r.id);
    const holder = typeof r.body.claimed_by === 'string' ? r.body.claimed_by : null;
    const body = verb === 'assign' || verb === 'reassign' ? await read() : {};
    if (!isLive(r.body.status)) return domain(409, 'WORK_NOT_ACTIVE', "this record's work is not live");
    const mayAssign = allowed('assign', 'task', r.body);
    let changes: Body;
    let offerTo: string[] | undefined;
    switch (verb) {
      case 'claim':
        // The entity's claim setting is `readers`: anyone who may read the task may take unheld work. A retried claim by
        // the holder is refused like anyone else's.
        if (holder) return domain(409, 'WORK_ALREADY_CLAIMED', `already claimed by ${holder}`);
        changes = { claimed_by: actor };
        break;
      case 'assign':
        if (!mayAssign) return domain(403, 'ENTITY_ACCESS_DENIED', 'you may not assign this work');
        offerTo = assignedUsers(body.assign);
        // An assignment that names exactly one person claims the work for them at once.
        changes = { claimed_by: offerTo.length === 1 ? offerTo[0] : null };
        break;
      case 'reassign': {
        if (holder !== actor && !mayAssign) return domain(403, 'ENTITY_ACCESS_DENIED', 'you may not hand this work on');
        const to = typeof body.user_id === 'string' ? body.user_id : '';
        if (!seed.people.some((p) => p.id === to)) {
          return domain(422, 'WORK_REASSIGN_TARGET_INVALID', 'work can only be handed to an active member');
        }
        changes = { claimed_by: to };
        break;
      }
      default:
        if (!holder) return domain(403, 'WORK_NOT_CLAIMANT', 'nobody holds this work');
        if (holder !== actor && !mayAssign) return domain(403, 'ENTITY_ACCESS_DENIED', 'you may not release work someone else holds');
        changes = { claimed_by: null };
    }
    return json(workItem(save('task', r.id, changes, null, true, offerTo ? { offerTo } : undefined)));
  }

  async function route(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(url.pathname.indexOf('/api/') + 4);
    const parts = path.split('/').filter(Boolean);
    const method = request.method;
    const read = async () => (await request.json()) as Body;
    const q = url.searchParams;

    const failure = failures.findIndex((f) => f.method === method && f.pattern.test(path));
    if (failure >= 0) {
      const [f] = failures.splice(failure, 1);
      return new Response(JSON.stringify(f!.body), { status: f!.status, headers: { 'content-type': 'application/problem+json' } });
    }

    if (method === 'GET' && path === '/app/objects') return json(appObjectsFor(ids));

    if (method === 'GET' && parts[0] === 'groups' && parts.length === 2) {
      // Anyone in the organization reads a group and its members.
      const key = groupOf.get(parts[1]!);
      if (!key) return notFound('group', parts[1]!);
      const members = seed.groups[key].map((id) => {
        const p = seed.people.find((x) => x.id === id);
        return { id, display_name: p?.name ?? id, email: p?.email ?? '', added_at: '2026-01-01T00:00:00Z' };
      });
      return json({
        id: parts[1], org_id: 'org', name: GROUP_NAMES[key], description: null, member_count: members.length, members,
        created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
      });
    }

    if (method === 'GET' && path === '/users') {
      const group = q.get('group_id');
      const people = seed.people.filter((p) => !group || membersOf(group).includes(p.id));
      const p = page(people, q.get('cursor'), Number(q.get('limit') ?? 50));
      return json({ ...p, items: p.items.map((u) => ({ id: u.id, display_name: u.name, email: u.email ?? '', is_active: true })) });
    }

    if (method === 'GET' && path === '/identities') {
      const list = (name: string) => (q.get(name) ?? '').split(',').filter(Boolean);
      const users = list('user_ids').flatMap((id) => {
        const name = nameOf(id);
        return name === null ? [] : [{ id, name }];
      });
      const named = list('group_ids').flatMap((id) => {
        const key = groupOf.get(id);
        return key ? [{ id, name: GROUP_NAMES[key] }] : [];
      });
      return json({ users, groups: named, service_principals: [] });
    }

    if (method === 'GET' && path === '/mentions/people') {
      const k = entityOf.get(q.get('entity_id') ?? '');
      const r = k ? store.get(k)!.get(q.get('record_id') ?? '') : undefined;
      if (!k || !r || !allowed('read', k, r.body)) return notFound('entity_record', q.get('record_id') ?? '');
      const limit = Number(q.get('limit') ?? 8);
      if (!Number.isInteger(limit) || limit < 1 || limit > 8) return unreadable('query', 'limit', 'must be between 1 and 8');
      const typed = (q.get('q') ?? '').slice(0, 64);
      const items = seed.people
        .filter((p) => matchesPerson(typed, p.name, p.email) && allowed('read', k, r.body, p.id))
        .slice(0, limit)
        .map((p) => ({ id: p.id, name: p.name, ...(p.email ? { email: p.email } : {}), is_self: p.id === actor }));
      return json({ items });
    }

    if (method === 'GET' && path === '/units') {
      const sort = q.get('sort') ?? 'name';
      if (sort !== 'name') return unreadable('query', 'sort', `the memory server sorts units by name only, not by ${sort}`);
      const dir = q.get('dir') === 'desc' ? -1 : 1;
      const rows = [...units].sort((a, b) => dir * a.name.localeCompare(b.name, 'vi') || a.id.localeCompare(b.id));
      return json(page(rows, q.get('cursor'), Number(q.get('limit') ?? 50)));
    }

    if (method === 'GET' && path === '/mentions') return menu(q);

    if (method === 'GET' && path === '/work') {
      return json(page(workLines(q.get('view') ?? 'mine'), q.get('cursor'), Number(q.get('limit') ?? 50)));
    }

    if (parts[0] === 'entities' && parts[2] === 'records') {
      const k = entityOf.get(parts[1] ?? '');
      if (!k) return notFound('entity', parts[1] ?? '');
      const table = store.get(k)!;

      if (parts.length === 4 && parts[3] === 'query' && method === 'POST') return query(k, (await read()) as QueryRequest);

      if (parts.length === 3 && method === 'POST') {
        const b = await read();
        const bound = new Set(CREATE_FORM_FIELDS[k]);
        const payload = deriveLabels(k, null, Object.fromEntries(Object.entries((b.form_payload ?? {}) as Body).filter(([key, v]) => v !== null && bound.has(key))));
        const after: Body = { ...DEFAULTS[k], ...(k === 'project' ? { managers: [actor] } : {}), ...payload };
        const j = judged(k, null, after);
        const denied = judgeAccess(j);
        if (denied) return refuse(denied, '');
        const work = b.work as { assign?: unknown } | undefined;
        let offerTo: string[] | undefined;
        if (work) {
          if (k !== 'task') return domain(422, 'WORK_CONTRACT_NOT_ENABLED', 'this entity does not follow Assignable');
          if (!allowed('assign', 'task', after)) return domain(403, 'ENTITY_ACCESS_DENIED', 'you may not assign this work');
          offerTo = assignedUsers(work.assign);
        }
        const tail = judgeTail(j, Object.keys(after), '');
        if (tail) return tail;
        if (offerTo) {
          if (!isLive(after.status)) {
            return domain(409, 'WORK_NOT_ACTIVE', 'the record is created in a status where its work is not live, so it cannot be assigned');
          }
          // The request's assignment replaces what the routing rule named; one person holds it at once.
          after.claimed_by = offerTo.length === 1 ? offerTo[0] : null;
        }
        const created = save(k, null, after, actor, true, offerTo ? { offerTo } : undefined);
        remember(k, created.body);
        return json(decorate(k, created, actor), 201);
      }

      const id = parts[3] ?? '';
      const r = table.get(id);
      const readable = !!r && allowed('read', k, r.body);

      if (parts[4] === 'comments' && (parts.length === 5 || parts.length === 6)) return commentsRoute(k, r, readable, parts, request);

      if (parts.length === 4 && method === 'GET') return readable ? json(decorate(k, r!, actor)) : notFound('entity_record', id);

      if (parts.length === 4 && method === 'PATCH') {
        const b = await read();
        const expected = expectedInstant(b.expected_updated_at);
        if ('problem' in expected) return unreadable('body', 'expected_updated_at', expected.problem);
        const changes = deriveLabels(k, r?.body ?? null, (b.changes ?? {}) as Body);
        // The patch command refuses a cleared required field before it looks the record up, so before any access check.
        const cleared = Object.entries(changes).find(([key, v]) => REQUIRED[k].includes(key) && isEmpty(v));
        if (cleared) return domain(422, 'VALIDATION_ERROR', `required field '${cleared[0]}' cannot be cleared`);
        if (!r || !readable) return notFound('entity_record', id);
        const after: Body = { ...r.body, ...changes };
        for (const [key, v] of Object.entries(changes)) if (v === null) delete after[key];
        const j = judged(k, r.body, after);
        const denied = judgeAccess(j);
        if (denied) return refuse(denied, id);
        if (expected.ms !== Date.parse(r.updated_at)) return stale();
        const tail = refuseComputed(k, changes) ?? judgeTail(j, Object.keys(changes), id);
        if (tail) return tail;
        const patched = save(k, r.id, changes, null, true);
        remember(k, patched.body);
        return json(decorate(k, patched, actor));
      }

      if (parts.length === 4 && method === 'DELETE') {
        const expected = expectedInstant(q.get('expected_updated_at') ?? undefined);
        if ('problem' in expected) return unreadable('query', 'expected_updated_at', expected.problem);
        // Deleting without the grant reads as a record that is not there.
        if (!r || !readable || !allowed('delete', k, r.body)) return notFound('entity_record', id);
        if (expected.ms !== Date.parse(r.updated_at)) return stale();
        if (k === 'project') {
          const blockers = (['task', 'section'] as const).map((child) => ({
            child, rows: [...store.get(child)!.values()].filter((c) => c.body.project === r.id),
          })).filter((g) => g.rows.length > 0);
          const total = blockers.reduce((n, g) => n + g.rows.length, 0);
          if (total > 0) {
            return domain(409, 'ENTITY_RECORD_IN_USE', `${total} record(s) still reference this record`, {
              extensions: {
                record_in_use: {
                  total,
                  entities: blockers.map((g) => ({
                    entity_id: ids.entities[g.child], entity_name: ENTITY_NAMES[g.child], count: g.rows.length,
                    samples: g.rows.slice(0, 3).map((c) => ({
                      record_id: c.id,
                      label: allowed('read', g.child, c.body) && typeof c.body[DISPLAY[g.child]] === 'string' ? c.body[DISPLAY[g.child]] : null,
                    })),
                  })),
                  withheld: 0,
                },
              },
            });
          }
        }
        const clears = clearsOf(k, r.id);
        const clearing = clears.reduce((n, g) => n + g.rows.length, 0);
        if (1 + clearing > CASCADE_MAX_RECORDS) {
          return domain(422, 'ENTITY_RECORD_CASCADE_TOO_LARGE', `deleting this record would touch ${1 + clearing} records; the limit is ${CASCADE_MAX_RECORDS}`, {
            extensions: { cascade: { found: 1 + clearing, cap: CASCADE_MAX_RECORDS } },
          });
        }
        // A clear is a write by the deleter: all of them or none.
        const forbidden = clears
          .map((g) => ({
            count: g.rows.filter((c) => judgeAccess(judged(g.child, c.body, { ...c.body, [g.field]: null })) !== null).length,
            entity_id: ids.entities[g.child],
            ref_field: g.field,
          }))
          .filter((g) => g.count > 0);
        if (forbidden.length) {
          return domain(403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', 'deleting this record would change records you cannot edit', {
            extensions: { cascade_forbidden: { by_entity: forbidden, hidden: false } },
          });
        }
        const cleared = drop(k, r.id, true);
        if (cleared.length === 0) return new Response(null, { status: 204 });
        return json({
          cascade_depth: 0,
          cleared_by_field: cleared.map((g) => ({ count: g.count, entity_id: ids.entities[g.child], ref_field: g.field })),
          cleared_count: cleared.reduce((n, g) => n + g.count, 0),
          deleted_by_entity: [{ count: 1, entity_id: ids.entities[k] }],
          deleted_count: 1,
          trash_batch_id: crypto.randomUUID(),
        });
      }

      if (parts.length === 5 && parts[4] === 'mentioned-in' && method === 'GET') {
        if (!r || !readable) return notFound('entity_record', id);
        const found = mentionedIn(k, id);
        return json({ items: found.items, next_cursor: null, prev_cursor: null });
      }

      if (parts.length === 5 && parts[4] === 'list-ops' && method === 'POST') {
        const b = await read();
        if (!r || !readable) return notFound('entity_record', id);
        if (k !== 'task' || b.field !== 'checklist') {
          return domain(422, 'FIELD_NOT_LIST', `field \`${String(b.field)}\` is not a list`);
        }
        const denied = judgeAccess(judged(k, r.body, r.body));
        if (denied) return refuse(denied, id);
        const current = withItemIds(r.body.checklist);
        let next: ListItem[];
        try {
          next = applyListOps(current, (b.ops ?? []) as ListOp[]);
        } catch (e) {
          if (e instanceof ListOpError) return domain(422, e.code, e.message);
          throw e;
        }
        const derived = deriveLabels(k, r.body, { checklist: next }).checklist as ListItem[];
        const tail = judgeTail(judged(k, r.body, { ...r.body, checklist: derived }), ['checklist'], id);
        if (tail) return tail;
        const listed = save(k, r.id, { checklist: derived }, null, true);
        remember(k, listed.body);
        return json(decorate(k, listed, actor));
      }

      if (parts.length === 6 && parts[4] === 'work' && method === 'POST') {
        if (k !== 'task' || !r || !readable) return notFound('entity_record', id);
        return workRoute(r, parts[5]!, read);
      }
    }

    if (method === 'POST' && path === '/attachments') {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) return problem(422, 'FILE_REQUIRED');
      const id = crypto.randomUUID();
      const stored = { id, name: file.name, type: file.type || 'application/octet-stream', bytes: new Uint8Array(await file.arrayBuffer()), uploadedAt: stamp() };
      files.set(id, stored);
      return json(metadata(stored), 201);
    }
    if (method === 'GET' && parts[0] === 'attachments' && (parts.length === 2 || (parts.length === 3 && parts[2] === 'download'))) {
      const f = files.get(parts[1]!);
      if (!f) return notFound('attachment', parts[1]!);
      if (parts.length === 2) return json(metadata(f));
      return new Response(f.bytes.slice(), {
        status: 200,
        headers: { 'content-type': f.type, 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}` },
      });
    }

    return problem(404, 'NOT_FOUND', { detail: `${method} ${path} is not modelled` });
  }

  return {
    // Only a filter it doesn't model is the caller's to hear about. Any other error is the server's own, and it throws,
    // so a test can't pass on a mistake made here.
    async fetch(request) {
      try {
        return await route(request);
      } catch (e) {
        if (e instanceof UnmodelledFilter) return problem(400, 'UNMODELLED_FILTER', { detail: e.message });
        throw e;
      }
    },
    onChange(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    actAs(userId) { actor = userId; },
    withholdNames(on) { withholdNames = on; },
    write(entity, id, body, by, writeOpts) {
      const exists = id !== null && store.get(entity)!.has(id);
      return decorate(entity, save(entity, id, exists ? body : { ...DEFAULTS[entity], ...body }, by ?? null, writeOpts?.notify !== false), null);
    },
    remove(entity, id, writeOpts) { drop(entity, id, writeOpts?.notify !== false); },
    records: (entity) => [...store.get(entity)!.values()].map((r) => decorate(entity, r, null)),
    failNext(method, pathPattern, status, body) { failures.push({ method: method.toUpperCase(), pattern: pathPattern, status, body }); },
    async drain() { land(); },
  };
}

const ENTITY_NAMES: Record<EntityKey, string> = { project: 'Project', section: 'Section', task: 'Task', task_label: 'Task label' };

const metadata = (f: { id: string; name: string; type: string; bytes: Uint8Array; uploadedAt: string }) => ({
  id: f.id, original_filename: f.name, byte_size: f.bytes.byteLength, content_type: f.type, uploaded_at: f.uploadedAt,
});
