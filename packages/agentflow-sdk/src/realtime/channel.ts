import type { AuthAdapter } from '../auth.js';
import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import type { RequestFetch } from '../fetch.js';
import { readSse } from './sse.js';

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

export const PRESENCE_HEARTBEAT_MS = 20_000;
export const RECONNECT_MAX_MS = 30_000;
/** A live connection that has sent nothing, keep-alives included, for this long is dropped and reopened. */
export const IDLE_TIMEOUT_MS = 45_000;

type Outcome = 'ended' | 'reauthenticate' | 'revoked' | 'failed' | { retryAfterMs: number };

/** Surfaces an error without unwinding the caller: it reaches the host's error reporting, not the channel. */
function report(error: unknown): void {
  queueMicrotask(() => {
    throw error;
  });
}

export function createRealtimeChannel(opts: RealtimeOptions): RealtimeChannel {
  const send: RequestFetch = opts.fetch ?? ((request) => globalThis.fetch(request));
  const random = opts.random ?? Math.random;
  const pollingAfter = opts.pollingAfter ?? 3;
  const statusListeners = new Set<(status: RealtimeStatus) => void>();
  const eventListeners = new Set<(event: PublicEvent) => void>();
  const refetchListeners = new Set<() => void>();
  const presenceListeners = new Set<(presence: RecordPresence) => void>();
  const revokedListeners = new Set<() => void>();

  let status: RealtimeStatus = 'connecting';
  let position: string | undefined;
  let failures = 0;
  let connectedBefore = false;
  let stopped = false;
  let retryMs = 3000;
  let abort: AbortController | undefined;
  // When the stream in hand went live; unset while there is none.
  let liveSince: number | undefined;
  // Set only while the loop waits out a delay.
  let wake: (() => void) | undefined;
  // `retry()` dropped the attempt in hand: reconnect without a delay or a failure.
  let restart = false;
  let watched: RealtimeTarget | null = null;
  // Bumped whenever the watched record changes or the channel stops, so a beat belonging to an
  // earlier one can tell and drop what it got back.
  let generation = 0;
  let heartbeat: ReturnType<typeof setTimeout> | undefined;
  // Presence requests go one at a time, in order: a beat can never land after the `DELETE` that
  // followed it, nor overlap the next beat.
  let presenceQueue: Promise<void> = Promise.resolve();

  const subscribe = <T>(set: Set<T>, listener: T) => {
    set.add(listener);
    return () => void set.delete(listener);
  };
  /** Each listener in its own `try`: one that throws costs neither the others nor the channel. */
  const notify = <T>(set: Set<T>, call: (listener: T) => void) => {
    for (const listener of [...set]) {
      try {
        call(listener);
      } catch (error) {
        report(error);
      }
    }
  };
  const setStatus = (next: RealtimeStatus) => {
    if (next === status) return;
    status = next;
    notify(statusListeners, (listener) => listener(next));
  };
  const refetch = () => notify(refetchListeners, (listener) => listener());

  function streamUrl(): string {
    const params = new URLSearchParams();
    for (const type of opts.types ?? []) params.append('types', type);
    if (opts.presence) params.set('presence', 'true');
    const query = params.toString();
    return `${opts.baseUrl}/events/stream${query ? `?${query}` : ''}`;
  }

  async function connect(): Promise<Outcome> {
    const controller = new AbortController();
    abort = controller;
    let response: Response;
    try {
      // `auth.headers()` can fail (a token refresh while offline): that is a failed connection.
      const headers = new Headers(await opts.auth.headers());
      headers.set('accept', 'text/event-stream');
      if (position !== undefined) headers.set('last-event-id', position);
      if (controller.signal.aborted) return 'failed';
      response = await send(
        new Request(streamUrl(), { headers, credentials: opts.auth.credentials, signal: controller.signal }),
      );
    } catch {
      return 'failed';
    }
    // Dropped while the response was on its way, by a `fetch` that does not honour its signal.
    if (!response.ok || !response.body || controller.signal.aborted) {
      // No stream to read: release the connection instead of leaving the body unread.
      void response.body?.cancel().catch(() => undefined);
      if (controller.signal.aborted) return 'failed';
      if (response.status === 429 || response.status === 503) {
        const seconds = Number(response.headers.get('retry-after'));
        return { retryAfterMs: Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : RECONNECT_MAX_MS };
      }
      return response.status === 401 || response.status === 403 ? 'revoked' : 'failed';
    }

    liveSince = Date.now();
    if (connectedBefore && position === undefined) refetch();
    connectedBefore = true;
    failures = 0;
    setStatus('live');
    // The server sends a keep-alive every 20 seconds, so a connection that has said nothing for
    // longer is dead without having closed (a laptop that slept, a network that changed): `read()`
    // would wait for ever. Aborting ends the frames, and the loop reconnects and resumes.
    let idle: ReturnType<typeof setTimeout> | undefined;
    const armIdle = () => {
      if (idle !== undefined) clearTimeout(idle);
      idle = setTimeout(() => controller.abort(), IDLE_TIMEOUT_MS);
    };
    armIdle();
    try {
      for await (const frame of readSse(response.body, controller.signal, armIdle)) {
        if (frame.retry !== undefined) retryMs = frame.retry;
        switch (frame.event) {
          case 'refetch':
          case 'context_changed':
            // The position is stale: resuming from it would only be answered with `refetch` again.
            position = undefined;
            refetch();
            break;
          case 'access_revoked':
            return 'revoked';
          case 'reauthenticate':
            return 'reauthenticate';
          case 'presence': {
            if (frame.data === '') break;
            const presence = JSON.parse(frame.data) as RecordPresence;
            notify(presenceListeners, (listener) => listener(presence));
            break;
          }
          default:
            if (frame.id !== undefined) {
              position = frame.id;
              if (frame.data !== '') {
                const event = JSON.parse(frame.data) as PublicEvent;
                notify(eventListeners, (listener) => listener(event));
              }
            }
        }
      }
    } catch {
      // The connection dropped, or a frame was not JSON; the loop reconnects and resumes.
    } finally {
      if (idle !== undefined) clearTimeout(idle);
      controller.abort();
    }
    return 'ended';
  }

  function backoff(attempt: number): number {
    const ceiling = Math.min(RECONNECT_MAX_MS, 1000 * 2 ** attempt);
    return ceiling / 2 + (random() * ceiling) / 2;
  }

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        wake = undefined;
        resolve();
      };
      const timer = setTimeout(done, ms);
      wake = done;
    });
  }

  async function loop(): Promise<void> {
    while (!stopped) {
      try {
        restart = false;
        liveSince = undefined;
        const outcome = await connect();
        const lived = liveSince === undefined ? 0 : Date.now() - liveSince;
        liveSince = undefined;
        if (stopped) return;
        if (outcome === 'revoked') {
          stopped = true;
          // No `DELETE`: the caller lost access, so it would be refused; presence lapses on its own.
          unwatch(false);
          setStatus('polling');
          notify(revokedListeners, (listener) => listener());
          return;
        }
        if (restart) continue;
        // A token already inside the server's lead time gets `reauthenticate` the moment the stream
        // opens: reconnecting at once would repeat that every round trip until it expires.
        if (outcome === 'reauthenticate' && lived >= retryMs) continue;
        let delay: number;
        if (outcome === 'ended' || outcome === 'reauthenticate') {
          delay = retryMs;
        } else {
          failures += 1;
          delay = typeof outcome === 'object' ? outcome.retryAfterMs : backoff(failures);
        }
        setStatus(failures >= pollingAfter ? 'polling' : 'connecting');
        if (restart) continue;
        await wait(delay);
      } catch (error) {
        // Nothing above is expected to throw; if it does, the channel must not end with it.
        report(error);
        if (stopped) return;
        failures += 1;
        await wait(backoff(failures));
      }
    }
  }

  function enqueue(task: () => Promise<void>): Promise<void> {
    presenceQueue = presenceQueue.then(task).catch(() => undefined);
    return presenceQueue;
  }

  async function beat(target: RealtimeTarget, gen: number): Promise<void> {
    // Queued behind a request for a record since left, or after `close()`: nothing to say any more.
    if (gen !== generation) return;
    try {
      const presence = await ok(
        opts.client.POST('/entities/{entity_id}/records/{record_id}/presence', {
          params: { path: { entity_id: target.entityId, record_id: target.recordId } },
        }),
      );
      if (gen === generation) notify(presenceListeners, (listener) => listener(presence));
    } catch {
      // The next heartbeat tries again; presence lapses on its own.
    }
  }

  async function leave(target: RealtimeTarget): Promise<void> {
    try {
      await opts.client.DELETE('/entities/{entity_id}/records/{record_id}/presence', {
        params: { path: { entity_id: target.entityId, record_id: target.recordId } },
      });
    } catch {
      // Presence lapses 45 seconds after the last heartbeat anyway.
    }
  }

  /** Stops heartbeating, and says the caller has left the record unless `leaving` is false. */
  function unwatch(leaving: boolean): void {
    generation += 1;
    if (heartbeat !== undefined) clearTimeout(heartbeat);
    heartbeat = undefined;
    const left = watched;
    watched = null;
    if (leaving && left) void enqueue(() => leave(left));
  }

  /** One beat, then the next 20 seconds after it settles, so a slow request never overlaps its successor. */
  function heartbeats(target: RealtimeTarget, gen: number): void {
    void enqueue(() => beat(target, gen)).then(() => {
      if (gen !== generation) return;
      heartbeat = setTimeout(() => heartbeats(target, gen), PRESENCE_HEARTBEAT_MS);
    });
  }

  function watch(target: RealtimeTarget | null): void {
    if (stopped) return;
    if (watched?.entityId === target?.entityId && watched?.recordId === target?.recordId) return;
    unwatch(true);
    if (target) {
      watched = target;
      heartbeats(target, generation);
    }
  }

  void loop();

  return {
    status: () => status,
    onStatus: (listener) => subscribe(statusListeners, listener),
    onEvent: (listener) => subscribe(eventListeners, listener),
    onRefetch: (listener) => subscribe(refetchListeners, listener),
    onPresence: (listener) => subscribe(presenceListeners, listener),
    onRevoked: (listener) => subscribe(revokedListeners, listener),
    watch,
    retry: () => {
      if (stopped) return;
      if (wake) {
        failures = 0;
        wake();
      } else if (liveSince === undefined) {
        failures = 0;
        restart = true;
        abort?.abort();
      }
    },
    close: () => {
      stopped = true;
      unwatch(true);
      abort?.abort();
      wake?.();
    },
  };
}
