import type { AuthAdapter } from './auth.js';
/** The transport-level fetch openapi-fetch actually calls: always with a single `Request`, never a string/URL. */
export type RequestFetch = (input: Request) => Promise<Response>;
/** A fetch that authenticates, keys idempotent writes, and retries only when repeating is safe. */
export declare function agentflowFetch(opts: {
    baseUrl: string;
    auth: AuthAdapter;
    fetch: RequestFetch;
    maxRetries: number;
}): (input: Request) => Promise<Response>;
//# sourceMappingURL=fetch.d.ts.map