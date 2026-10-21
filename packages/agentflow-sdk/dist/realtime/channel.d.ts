import type { AuthAdapter } from '../auth.js';
import type { AgentFlowClient } from '../client.js';
import type { RequestFetch } from '../fetch.js';
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
}
export declare const PRESENCE_HEARTBEAT_MS = 20000;
export declare const RECONNECT_MAX_MS = 30000;
/** A live connection that has sent nothing, keep-alives included, for this long is dropped and reopened. */
export declare const IDLE_TIMEOUT_MS = 45000;
export declare function createRealtimeChannel(opts: RealtimeOptions): RealtimeChannel;
//# sourceMappingURL=channel.d.ts.map