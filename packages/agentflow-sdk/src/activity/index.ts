import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import type { components } from '../generated/public.js';
import type { PublicEvent } from '../realtime/channel.js';

/** One line of a record's activity: who did what and when. No field's value, except a readable list's item changes, which carry the changed column's before and after values. */
export type ActivityEvent = components['schemas']['ActivityEvent'];
export type ActivityActor = components['schemas']['ActivityActor'];
/** A page of a record's activity, newest first. */
export type RecordActivityPage = components['schemas']['RecordActivityPage'];

/** What the feed filters by: field changes, stage moves, creation, the record's runs, and its work trail. */
export type ActivityKind = 'field' | 'stage' | 'record' | 'run' | 'work';

export const ACTIVITY_KINDS: readonly ActivityKind[] = ['field', 'stage', 'record', 'run', 'work'];

export interface ActivityListParams {
  /** The entity of the record. */
  entity_id: string;
  record_id: string;
  /** Only these kinds; every kind when absent or empty. */
  kinds?: ActivityKind[];
  /** The `next_cursor` of the previous page, taken with the same `kinds`. */
  cursor?: string;
  /** 1 to 100; 50 when absent. */
  limit?: number;
}

/** A record's activity, newest first. `next_cursor` reads the older lines; `prev_cursor` is always null. */
export async function list(client: AgentFlowClient, params: ActivityListParams): Promise<RecordActivityPage> {
  const query: { kinds?: string; cursor?: string; limit?: number } = {};
  if (params.kinds && params.kinds.length > 0) query.kinds = params.kinds.join(',');
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit !== undefined) query.limit = params.limit;
  return ok(
    client.GET('/entities/{entity_id}/records/{record_id}/activity', {
      params: { path: { entity_id: params.entity_id, record_id: params.record_id }, query },
    }),
  );
}

const RUN_PREFIXES = ['instance.', 'task.', 'node_run.', 'agent.'];

/** The kind a line of the feed, or an event of the stream, belongs to; null for a type the feed never shows. */
export function kindOf(event_type: string): ActivityKind | null {
  if (event_type === 'record.updated') return 'field';
  if (event_type === 'record.stage.transitioned') return 'stage';
  if (event_type === 'record.created' || event_type === 'record.series.raised') return 'record';
  if (event_type.startsWith('work.')) return 'work';
  if (RUN_PREFIXES.some((prefix) => event_type.startsWith(prefix))) return 'run';
  return null;
}

/**
 * Whether an event from the stream may change the record's feed: one about the record itself (a record or work subject, whose
 * id is the record's) or about one of its runs, which the caller names in `knownRuns` because an instance subject carries the
 * run's id and not the record's.
 */
export function isAbout(event: PublicEvent, record: { entity_id: string; record_id: string }, knownRuns: ReadonlySet<string>): boolean {
  const { kind, id } = event.subject;
  if (kind === 'record' || kind === 'work') return id === record.record_id;
  if (kind === 'instance') return knownRuns.has(id);
  return false;
}
