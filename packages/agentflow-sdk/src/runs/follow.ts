import type { AuthAdapter } from '../auth.js';
import { AgentFlowError } from '../errors.js';
import type { RequestFetch } from '../fetch.js';
import type { RunFollowItem, RunFrame } from '../realtime/frames.js';
import { readSse } from '../realtime/sse.js';

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
export const FOLLOW_IDLE_TIMEOUT_MS = 40_000;
/** The wait on a reconnect answered `429` or `503` whose `Retry-After` cannot be read, as cross-origin hides it. */
export const FOLLOW_RETRY_AFTER_DEFAULT_S = 5;
const RECONNECT_MAX_MS = 30_000;

const FRAME_TYPES = new Set(['step.started', 'text.delta', 'step.activity', 'step.done', 'step.abandoned', 'run.done']);

/**
 * The first open of a run's stream was answered `429` (the caller already holds six event streams) or `503` (the
 * server holds as many as it serves). `retryAfter` is the server's `Retry-After` in seconds, or 5 when it cannot be
 * read.
 */
export class RunStreamBusyError extends AgentFlowError {
  constructor(
    status: number,
    code: string,
    readonly retryAfter: number,
    detail?: string,
    requestId?: string,
  ) {
    super(status, code, detail, requestId);
    this.name = 'RunStreamBusyError';
  }
}

function retryAfterSeconds(response: Response): number {
  const header = response.headers.get('retry-after')?.trim();
  const seconds = header ? Number(header) : Number.NaN;
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : FOLLOW_RETRY_AFTER_DEFAULT_S;
}

async function refusal(response: Response): Promise<AgentFlowError> {
  const problem = (await response.json().catch(() => ({}))) as { type?: string; detail?: string; request_id?: string };
  const code = problem.type ?? `HTTP_${response.status}`;
  if (response.status === 429 || response.status === 503) {
    return new RunStreamBusyError(response.status, code, retryAfterSeconds(response), problem.detail, problem.request_id);
  }
  return new AgentFlowError(response.status, code, problem.detail, problem.request_id);
}

const backoff = (failures: number) => Math.min(RECONNECT_MAX_MS, 1000 * 2 ** (failures - 1));

/** Resolves after `ms`, or at once when `signal` aborts. */
function pause(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const done = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal?.addEventListener('abort', done, { once: true });
  });
}

function parseFrame(data: string): RunFrame | undefined {
  try {
    const parsed = JSON.parse(data) as Record<string, unknown> | null;
    if (typeof parsed !== 'object' || parsed === null) return undefined;
    if (typeof parsed.type !== 'string' || !FRAME_TYPES.has(parsed.type)) return undefined;
    return parsed as unknown as RunFrame;
  } catch {
    return undefined;
  }
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
export async function* follow(
  transport: RunFollowTransport,
  runId: string,
  options: RunFollowOptions = {},
): AsyncGenerator<RunFollowItem, void, undefined> {
  const send: RequestFetch = transport.fetch ?? ((request) => globalThis.fetch(request));
  const { signal } = options;
  const query = options.after === undefined ? '' : `?${new URLSearchParams({ after: options.after })}`;
  const url = `${transport.baseUrl}/instances/${encodeURIComponent(runId)}/stream${query}`;
  const ended: RunFollowItem = { type: 'follow.ended', follow: runId };
  let position: string | undefined;
  let opened = false;
  let failures = 0;
  // The followed run's own `run.done` arrived: the stream is over even if `end` was lost with the connection.
  let done = false;
  let delay = 0;

  for (;;) {
    if (delay > 0) await pause(delay, signal);
    delay = 0;
    if (signal?.aborted) return;
    const controller = new AbortController();
    const stop = () => controller.abort();
    signal?.addEventListener('abort', stop, { once: true });
    let response: Response | undefined;
    try {
      try {
        const headers = new Headers(await transport.auth.headers());
        headers.set('accept', 'text/event-stream');
        if (position !== undefined) headers.set('last-event-id', position);
        response = await send(
          new Request(url, { headers, credentials: transport.auth.credentials, signal: controller.signal }),
        );
      } catch (error) {
        if (signal?.aborted) return;
        if (!opened) throw error;
        delay = backoff(++failures);
        continue;
      }
      if (!response.ok || !response.body) {
        if (response.ok) {
          void response.body?.cancel().catch(() => undefined);
          delay = backoff(++failures);
          continue;
        }
        if (!opened) throw await refusal(response);
        void response.body?.cancel().catch(() => undefined);
        if (response.status === 429 || response.status === 503) {
          delay = retryAfterSeconds(response) * 1000;
        } else if (response.status === 404) {
          yield { type: 'follow.refused', follow: runId, reason: 'not_found' };
          return;
        } else if (response.status >= 500) {
          delay = backoff(++failures);
        } else {
          throw await refusal(response);
        }
        continue;
      }

      opened = true;
      failures = 0;
      const body = response.body;
      let idle: ReturnType<typeof setTimeout> | undefined;
      const armIdle = () => {
        if (idle !== undefined) clearTimeout(idle);
        idle = setTimeout(stop, FOLLOW_IDLE_TIMEOUT_MS);
      };
      armIdle();
      let heard = false;
      try {
        for await (const event of readSse(body, controller.signal, armIdle)) {
          heard = true;
          switch (event.event) {
            case 'frame': {
              const frame = parseFrame(event.data);
              if (!frame) break;
              if (event.id !== undefined) position = event.id;
              if (frame.type === 'run.done' && frame.run.toLowerCase() === runId.toLowerCase()) done = true;
              yield frame;
              break;
            }
            case 'lagged':
              yield { type: 'follow.lagged', follow: runId };
              break;
            case 'end':
              yield ended;
              return;
            case 'access_revoked':
              yield { type: 'follow.refused', follow: runId, reason: 'not_found' };
              return;
          }
        }
      } catch {
        // The connection dropped mid-read: reopen from the last cursor.
      } finally {
        if (idle !== undefined) clearTimeout(idle);
        controller.abort();
        void body.cancel().catch(() => undefined);
      }
      if (signal?.aborted) return;
      if (done) {
        yield ended;
        return;
      }
      // A response that closes before saying anything would otherwise be reopened in a tight loop.
      if (!heard) delay = backoff(++failures);
    } finally {
      signal?.removeEventListener('abort', stop);
    }
  }
}
