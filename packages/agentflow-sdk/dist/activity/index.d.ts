import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
import type { PublicEvent } from '../realtime/channel.js';
/** One line of a record's activity: who did what and when. No field's value, except a readable list's item changes, which carry the changed column's before and after values. */
export type ActivityEvent = components['schemas']['ActivityEvent'];
export type ActivityActor = components['schemas']['ActivityActor'];
/** A page of a record's activity, newest first. */
export type RecordActivityPage = components['schemas']['RecordActivityPage'];
/** What the feed filters by: field changes, stage moves, creation, the record's runs, and its work trail. */
export type ActivityKind = 'field' | 'stage' | 'record' | 'run' | 'work';
export declare const ACTIVITY_KINDS: readonly ActivityKind[];
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
export declare function list(client: AgentFlowClient, params: ActivityListParams): Promise<RecordActivityPage>;
/** The kind a line of the feed, or an event of the stream, belongs to; null for a type the feed never shows. */
export declare function kindOf(event_type: string): ActivityKind | null;
/**
 * Whether an event from the stream may change the record's feed: one about the record itself (a record or work subject, whose
 * id is the record's) or about one of its runs, which the caller names in `knownRuns` because an instance subject carries the
 * run's id and not the record's.
 */
export declare function isAbout(event: PublicEvent, record: {
    entity_id: string;
    record_id: string;
}, knownRuns: ReadonlySet<string>): boolean;
//# sourceMappingURL=index.d.ts.map