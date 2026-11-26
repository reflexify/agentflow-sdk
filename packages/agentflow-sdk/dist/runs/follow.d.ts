import type { AuthAdapter } from '../auth.js';
import { AgentFlowError } from '../errors.js';
import type { RequestFetch } from '../fetch.js';
import type { RunFollowItem } from '../realtime/frames.js';
/** The transport `createRealtimeChannel` takes: pass the `baseUrl` and `auth` given to `createAgentFlowClient`. */
export interface RunFollowTransport {
    /** The API base, as the typed client takes it: `https://<host>/api/v1`. */
    baseUrl: string;
    auth: AuthAdapter;
    /** `globalThis.fetch` when omitted. */
    fetch?: RequestFetch;
}
export interface RunFollowOptions {
    /** Resume just past the frame whose `cursor` this is. */
    after?: string;
    /** Aborting it closes the connection and ends the iteration. */
    signal?: AbortSignal;
}
/** The server sends a keep-alive every 20 s; a connection silent for twice that is dropped and reopened. */
export declare const FOLLOW_IDLE_TIMEOUT_MS = 40000;
/** The wait on a reconnect answered `429` or `503` whose `Retry-After` cannot be read, as cross-origin hides it. */
export declare const FOLLOW_RETRY_AFTER_DEFAULT_S = 5;
/**
 * The first open of a run's stream was answered `429` (the caller already holds six event streams) or `503` (the
 * server holds as many as it serves). `retryAfter` is the server's `Retry-After` in seconds, or 5 when it cannot be
 * read.
 */
export declare class RunStreamBusyError extends AgentFlowError {
    readonly retryAfter: number;
    constructor(status: number, code: string, retryAfter: number, detail?: string, requestId?: string);
}
/**
 * Follows one run from a script, a server or a page that holds no event stream, through
 * `GET /instances/{instance_id}/stream`, with a bearer token in Node 18 or later or in a browser. Yields the run's
 * frames (`step.started`, `text.delta`, `step.activity`, `step.done`, `step.abandoned`, then `run.done`), each naming
 * its own `run`, since a run brings the runs under it the caller may trace; `follow.lagged` when frames were lost,
 * after which it goes on live and the stored run says what was missed; and ends after `follow.ended`, which follows
 * the run's `run.done`, or `follow.refused` with `not_found` when the caller may no longer trace the run. A run already
 * over yields its `run.done` and `follow.ended` at once.
 *
 * A dropped connection, or one silent past twice the server's 20 s keep-alive, is reopened from the last frame's
 * cursor with `Last-Event-ID`, so no frame repeats; a reopen answered `429` or `503` waits out `Retry-After`. The
 * first open throws instead: `RunStreamBusyError` with `retryAfter` when the caller already holds six event streams,
 * and `AgentFlowError` for any other refusal, `404` for a run the caller may not trace among them. A reopen answered
 * `401`, `403` or another `4xx` other than `404` and `429` throws `AgentFlowError` too, mid-iteration. Aborting
 * `signal`, or leaving the loop, closes the connection.
 *
 * On an installed app's token it yields the steps and `run.done` and never a step's words, and that client cannot
 * read the run's output afterwards: `GET /instances/{instance_id}` refuses an app a run that holds content. Any
 * other caller reads a step's output from `GET /instances/{instance_id}` after `run.done`.
 */
export declare function follow(transport: RunFollowTransport, runId: string, options?: RunFollowOptions): AsyncGenerator<RunFollowItem, void, undefined>;
//# sourceMappingURL=follow.d.ts.map