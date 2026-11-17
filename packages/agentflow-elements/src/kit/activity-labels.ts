import { scanToken } from './mention-token.js';
import { fill, type KitStrings } from './text.js';

type Text = Required<KitStrings>;

// The phrase for each line of a record's activity: a verb phrase that follows the actor's name and names its own object, as the
// record page's feed words them. A type missing here is drawn as the generic line, except a work type, which is an update of the work.
const LABEL: Record<string, keyof KitStrings> = {
  'record.created': 'activityRecordCreated',
  'record.updated': 'activityRecordUpdated',
  'record.stage.transitioned': 'activityRecordStageTransitioned',
  'record.series.raised': 'activityRecordSeriesRaised',
  'instance.started': 'activityInstanceStarted',
  'instance.completed': 'activityInstanceCompleted',
  'instance.failed': 'activityInstanceFailed',
  'instance.cancelled': 'activityInstanceCancelled',
  'instance.paused': 'activityInstancePaused',
  'instance.resumed': 'activityInstanceResumed',
  'instance.retried': 'activityInstanceRetried',
  'instance.archived': 'activityInstanceArchived',
  'instance.unarchived': 'activityInstanceUnarchived',
  'task.created': 'activityTaskCreated',
  'task.opened': 'activityTaskOpened',
  'task.claimed': 'activityTaskClaimed',
  'task.reassigned': 'activityTaskReassigned',
  'task.action_taken': 'activityTaskActionTaken',
  'task.submitted': 'activityTaskSubmitted',
  'task.rejected': 'activityTaskRejected',
  'task.cancelled': 'activityTaskCancelled',
  'task.escalated': 'activityTaskEscalated',
  'task.signed': 'activityTaskSigned',
  'task.signing_cancelled': 'activityTaskSigningCancelled',
  'task.signing_failed': 'activityTaskSigningFailed',
  'node_run.started': 'activityNodeRunStarted',
  'node_run.completed': 'activityNodeRunCompleted',
  'node_run.failed': 'activityNodeRunFailed',
  'node_run.waiting': 'activityNodeRunWaiting',
  'agent.started': 'activityAgentStarted',
  'agent.succeeded': 'activityAgentSucceeded',
  'agent.failed': 'activityAgentFailed',
  'agent.mcp_call': 'activityAgentMcpCall',
  'work.started': 'activityWorkStarted',
  'work.assigned': 'activityWorkAssigned',
  'work.claimed': 'activityWorkClaimed',
  'work.released': 'activityWorkReleased',
  'work.reassigned': 'activityWorkReassigned',
  'work.completed': 'activityWorkCompleted',
  'work.unassignable': 'activityWorkUnassignable',
  'work.too_many_people': 'activityWorkTooManyPeople',
  'work.clock_started': 'activityWorkClockStarted',
  'work.clock_paused': 'activityWorkClockPaused',
  'work.clock_resumed': 'activityWorkClockResumed',
  'work.clock_breached': 'activityWorkClockBreached',
  'work.clock_stopped': 'activityWorkClockStopped',
  'work.clock_cancelled': 'activityWorkClockCancelled',
  'work.clock_escalated': 'activityWorkClockEscalated',
  'work.recipient_skipped': 'activityWorkRecipientSkipped',
  'work.audience_suppressed': 'activityWorkAudienceSuppressed',
  'work.cancelled': 'activityWorkCancelled',
  'work.withdrawn': 'activityWorkWithdrawn',
  'work.unassigned': 'activityWorkUnassigned',
};

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

function str(payload: unknown, key: string): string {
  const value = isObject(payload) ? payload[key] : undefined;
  return typeof value === 'string' ? value.trim() : '';
}

/** Whether the kit has a phrase of its own for the type: the page may draw the generic line differently. */
export function hasActivityLabel(eventType: string): boolean {
  return eventType in LABEL || eventType.startsWith('work.');
}

/**
 * The words for one line, in `text`'s language. Three types take a name out of the payload and read without one when it is
 * not there, as it is not on a run's line.
 */
export function activityLabel(eventType: string, text: Text, payload?: unknown): string {
  if (eventType === 'task.action_taken') {
    const action = str(payload, 'action_label') || str(payload, 'action');
    return action ? fill(text.activityTaskActionTaken, { action }) : text.activityTaskActionTakenUnknown;
  }
  if (eventType === 'task.reassigned') return fill(text.activityTaskReassigned, { name: str(payload, 'to_user_name') || text.activityTaskReassignFallback });
  if (eventType === 'record.series.raised') {
    const name = str(payload, 'name');
    return name ? fill(text.activityRecordSeriesRaised, { name }) : text.activityRecordSeriesRaisedUnnamed;
  }
  const key = LABEL[eventType];
  if (key) return text[key];
  return eventType.startsWith('work.') ? text.activityWorkOther : text.activity;
}

interface Actor { kind?: string | null; display_name?: string | null }

/** The name drawn for an actor; one with none is the kind it is, and anyone else is someone. */
export function actorName(actor: Actor | null | undefined, text: Text): string {
  const name = typeof actor?.display_name === 'string' ? actor.display_name.trim() : '';
  if (name) return name;
  if (actor?.kind === 'agent') return text.activityActorAgent;
  if (actor?.kind === 'system') return text.activityActorSystem;
  return text.activityActorSomeone;
}

const TONE: Record<string, string> = { user: 'person', agent: 'agent', system: 'system', admin: 'admin', api_key: 'api' };

/** The timeline's `data-kind` for an actor's kind; none for a kind it has no colour for. */
export function actorTone(kind: string | null | undefined): string | null {
  return (kind && TONE[kind]) || null;
}

// A list item's label is the person's own text and may hold mention tokens. The feed carries no map to resolve them by, so
// each reads as a restricted record: the label in the token is the author's, and may be stale.
function plain(value: string, text: Text): string {
  if (!value.includes('](mention:')) return value;
  let out = '';
  let at = 0;
  while (at < value.length) {
    const start = value.indexOf('@[', at);
    if (start < 0) return out + value.slice(at);
    out += value.slice(at, start);
    const token = scanToken(value.slice(start));
    out += token ? `@${text.mentionRestricted}` : '@[';
    at = start + (token ? token.raw.length : 2);
  }
  return out;
}

function show(value: unknown, text: Text): string {
  if (value === true) return text.activityListYes;
  if (value === false) return text.activityListNo;
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map((v) => show(v, text)).join(', ');
  if (isObject(value)) return '—';
  return plain(String(value), text);
}

const MAX_PER_LIST = 5;

function listLines(raw: unknown, fields: Record<string, string>, text: Text): string[] {
  if (!isObject(raw)) return [];
  const lines: string[] = [];
  for (const [key, entry] of Object.entries(raw)) {
    if (!isObject(entry) || !Array.isArray(entry.changes)) continue;
    const field = typeof entry.label === 'string' && entry.label ? entry.label : fieldLabel(key, fields);
    const changes = entry.changes.filter(isObject);
    for (const change of changes.slice(0, MAX_PER_LIST)) {
      const item = typeof change.label === 'string' ? plain(change.label, text) : text.activityListUntitled;
      if (change.kind === 'changed') {
        lines.push(fill(text.activityListChanged, { field, item, column: String(change.column ?? ''), from: show(change.from, text), to: show(change.to, text) }));
      } else if (change.kind === 'added') lines.push(fill(text.activityListAdded, { field, item }));
      else if (change.kind === 'removed') lines.push(fill(text.activityListRemoved, { field, item }));
      else if (change.kind === 'moved') lines.push(fill(text.activityListMoved, { field, item }));
    }
    const total = typeof entry.total === 'number' ? Math.max(entry.total, changes.length) : changes.length;
    const shown = Math.min(changes.length, MAX_PER_LIST);
    if (total > shown) lines.push(fill(text.activityListMore, { count: total - shown }));
  }
  return lines;
}

function fieldLabel(key: string, fields: Record<string, string>): string {
  const label = Object.hasOwn(fields, key) ? fields[key] : undefined;
  return typeof label === 'string' && label.trim() ? label : key;
}

/**
 * The lines under a line of the feed: the fields an update changed and what happened to a list's items, or a stage move's
 * `from → to`. A key with no label in `fields` is drawn as it is.
 */
export function changeLines(eventType: string, payload: unknown, fields: Record<string, string> | null | undefined, text: Text): string[] {
  if (!isObject(payload)) return [];
  const labels = isObject(fields) ? (fields as Record<string, string>) : {};
  if (eventType === 'record.stage.transitioned') {
    const end = (value: unknown) => (typeof value === 'string' && value !== '' ? value : '—');
    return [`${end(payload.from)} → ${end(payload.to)}`];
  }
  if (eventType !== 'record.updated') return [];
  const changed = Array.isArray(payload.changed) ? payload.changed.filter((key): key is string => typeof key === 'string') : [];
  const lines = changed.length > 0 ? [fill(text.activityChanged, { fields: changed.map((key) => fieldLabel(key, labels)).join(', ') })] : [];
  return [...lines, ...listLines(payload.list_changes, labels, text)];
}
