import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
export type AppObject = components['schemas']['AppObject'];
export type AppObjectsBody = components['schemas']['AppObjects'];
export interface AppObjectsOptions {
    /** How long after a fetch the page coming back into view rechecks. Default 30 000 ms; 0 turns the recheck off. */
    recheckAfterMs?: number;
}
export interface AppObjects {
    /** The last answer, or null before the first. */
    readonly current: AppObjectsBody | null;
    /** The cached answer while it is current; otherwise one fetch, shared by every caller waiting. */
    load(): Promise<AppObjectsBody>;
    /** Fetch now, whatever the cache holds. */
    refresh(): Promise<AppObjectsBody>;
    /** The object with this logical key (`'entity:ticket'`): the app's own first, then a bound one, then an exported one, unless `source` picks. Null when absent. Throws before the first load. */
    find(logicalKey: string, opts?: {
        source?: AppObject['source'];
    }): AppObject | null;
    /** The object's id, or null when it is absent, off, or has none (a field or a relationship). */
    id(logicalKey: string, opts?: {
        source?: AppObject['source'];
    }): string | null;
    /** Whether the object is present, not off, and its contract satisfies `version`. */
    satisfies(logicalKey: string, version: string, opts?: {
        source?: AppObject['source'];
    }): boolean;
    /** Told after each answer whose revision differs from the one before. Subscribing turns on the refetch on a greater revision and the recheck on return. */
    subscribe(listener: (body: AppObjectsBody) => void): () => void;
}
/** The one cache for this client. Any client works; one made by `createAgentFlowClient` also refetches on a greater `AgentFlow-App-Revision`. `opts` apply to the first call per client only. */
export declare function getAppObjects(client: AgentFlowClient, opts?: AppObjectsOptions): AppObjects;
//# sourceMappingURL=objects.d.ts.map