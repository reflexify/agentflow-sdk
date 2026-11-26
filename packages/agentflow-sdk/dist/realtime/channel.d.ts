import type { AuthAdapter } from '../auth.js';
import type { AgentFlowClient } from '../client.js';
import type { RequestFetch } from '../fetch.js';
import type { FollowRefusal, RunFollower } from './frames.js';
export type RealtimeStatus = 'connecting' | 'live' | 'polling';
/** One event, in the envelope webhooks and `GET /events` carry. */
export interface PublicEvent {
    id: string;
    type: string;
    occurred_at: string;
    org_id: string;
    position: number;
    subject: {
        kind: string;
        id: string;
        entity_id?: string | null;
        instance_id?: string | null;
        workflow_id?: string | null;
        parent_instance_id?: string | null;
    };
    changed_fields?: string[];
    record_version?: number;
    /** A `comment.*` event: the comment it is about. */
    comment_id?: string | null;
}
export interface RecordPresence {
    entity_id: string;
    record_id: string;
    /** User ids of the people with the record open. */
    viewers: string[];
}
export interface RealtimeTarget {
    entityId: string;
    recordId: string;
}
/**
 * A reason to read the notification feed, the task lists or the conversation lists again. Only a person's own session stream sends
 * these frames, with no SSE id, so they never move the channel's position.
 * @internal AgentFlow's own frontend is the only reader.
 */
export type RealtimeNudge = {
    type: 'notification';
    id?: string;
    event_kind?: string;
} | {
    type: 'task_list_changed';
} | {
    type: 'run_advanced';
} | {
    type: 'thread_list_changed';
};
/**
 * One item of an assistant turn's follow: a frame of the turn's log with its `seq`, null on the server's own `error`
 * frame, or the follow's own news. `frame` is the assistant's stream event as the turn's log holds it. After
 * `follow.refused` or `follow.ended` the follow yields nothing more.
 * @internal AgentFlow's own frontend is the only reader: the assistant's routes are internal and a person's session's alone.
 */
export type TurnFollowItem = {
    type: 'turn';
    turn: string;
    seq: number | null;
    frame: unknown;
} | {
    type: 'follow.refused';
    follow: string;
    reason: FollowRefusal | 'never_recorded' | 'purged';
} | {
    type: 'follow.ended';
    follow: string;
};
/** @internal */
export interface TurnFollow extends AsyncIterable<TurnFollowItem> {
    /** Drops the follow's frames at once and ends the iteration. */
    close(): void;
}
/** @internal AgentFlow's own frontend is the only reader. */
export interface TurnFollower {
    /**
     * Follows an assistant turn on the channel's stream, as `follow=turn:<turn id>:<seq>`, from just past the frame
     * `after` names (0, the start, when omitted). It counts toward the stream's follows. Only a person's own session is
     * answered with the turn's frames; anything else is refused `invalid`.
     */
    followTurn(turnId: string, options?: {
        after?: number;
    }): TurnFollow;
}
export interface RealtimeChannel {
    status(): RealtimeStatus;
    onStatus(listener: (status: RealtimeStatus) => void): () => void;
    onEvent(listener: (event: PublicEvent) => void): () => void;
    /** What the page shows may be stale: refetch it. */
    onRefetch(listener: () => void): () => void;
    onPresence(listener: (presence: RecordPresence) => void): () => void;
    /** The caller lost access; the channel has stopped. */
    onRevoked(listener: () => void): () => void;
    /** Heartbeat presence on this record while it is open; `null` leaves it. */
    watch(target: RealtimeTarget | null): void;
    /**
     * Reconnect now instead of waiting out the backoff. Cuts a wait short and drops an attempt
     * still awaiting its response; does nothing while the stream is live.
     */
    retry(): void;
    close(): void;
}
export interface RealtimeOptions {
    /** The API base the typed client uses: `/api/v1` in AgentFlow, `<basePath>/api` behind the SDK proxy. */
    baseUrl: string;
    auth: AuthAdapter;
    client: AgentFlowClient;
    fetch?: RequestFetch;
    /** Only these event types; all when omitted. */
    types?: string[];
    /** Also receive presence frames. */
    presence?: boolean;
    /** Failed connections in a row before the status reads `polling`. Default 3. */
    pollingAfter?: number;
    /** For tests: the jitter source. */
    random?: () => number;
    /**
     * Hears the nudge frames, which are dropped without it.
     * @internal AgentFlow's own frontend is the only reader.
     */
    onNudge?: (nudge: RealtimeNudge) => void;
    /**
     * Called each time a response goes live, a reconnect and a `retry()` included.
     * @internal AgentFlow's own frontend is the only reader.
     */
    onOpen?: () => void;
}
export declare const PRESENCE_HEARTBEAT_MS = 20000;
export declare const RECONNECT_MAX_MS = 30000;
/** A live connection that has sent nothing, keep-alives included, for this long is dropped and reopened. */
export declare const IDLE_TIMEOUT_MS = 45000;
/** A stream carries at most this many follows; the server refuses the rest with `too_many`. */
export declare const FOLLOWS_MAX = 16;
export declare function createRealtimeChannel(opts: RealtimeOptions): RealtimeChannel & RunFollower & TurnFollower;
//# sourceMappingURL=channel.d.ts.map