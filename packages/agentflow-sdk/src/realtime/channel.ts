import type { AuthAdapter } from '../auth.js';
import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import type { RequestFetch } from '../fetch.js';
import type { FollowRefusal, RunFollow, RunFollower, RunFollowItem, RunFrame } from './frames.js';
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
export type RealtimeNudge =
  | { type: 'notification'; id?: string; event_kind?: string }
  | { type: 'task_list_changed' }
  | { type: 'run_advanced' }
  | { type: 'thread_list_changed' };

/**
 * One item of an assistant turn's follow: a frame of the turn's log with its `seq`, null on the server's own `error`
 * frame, or the follow's own news. `frame` is the assistant's stream event as the turn's log holds it. After
 * `follow.refused` or `follow.ended` the follow yields nothing more.
 * @internal AgentFlow's own frontend is the only reader: the assistant's routes are internal and a person's session's alone.
 */
export type TurnFollowItem =
  | { type: 'turn'; turn: string; seq: number | null; frame: unknown }
  | { type: 'follow.refused'; follow: string; reason: FollowRefusal | 'never_recorded' | 'purged' }
  | { type: 'follow.ended'; follow: string };

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
  followTurn(turnId: string, options?: { after?: number }): TurnFollow;
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

export const PRESENCE_HEARTBEAT_MS = 20_000;
export const RECONNECT_MAX_MS = 30_000;
/** A live connection that has sent nothing, keep-alives included, for this long is dropped and reopened. */
export const IDLE_TIMEOUT_MS = 45_000;

/** A stream carries at most this many follows; the server refuses the rest with `too_many`. */
export const FOLLOWS_MAX = 16;

type Outcome = 'ended' | 'reauthenticate' | 'revoked' | 'failed' | 'unsupported' | { retryAfterMs: number };

const FRAME_TYPES = new Set(['step.started', 'text.delta', 'step.activity', 'step.done', 'step.abandoned', 'run.done']);

const RUN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One run or turn followed on the stream, shared by every follow of it. */
interface Followed<T> {
  /** A run's frame cursor, or a turn's last `seq`. */
  cursor: string | undefined;
  handles: Set<FollowHandle<T>>;
}

/** One `followRun` or `followTurn` call's queue: what the stream hands it waits here until its consumer reads. */
class FollowHandle<T> implements AsyncIterable<T> {
  private readonly items: T[] = [];
  private waiting: ((result: IteratorResult<T>) => void) | undefined;
  private finished = false;

  constructor(private readonly onClose: (handle: FollowHandle<T>) => void) {}

  push(item: T): void {
    if (this.finished) return;
    const waiting = this.waiting;
    if (waiting) {
      this.waiting = undefined;
      waiting({ value: item, done: false });
    } else {
      this.items.push(item);
    }
  }

  /** No more items after those already queued. */
  finish(): void {
    if (this.finished) return;
    this.finished = true;
    const waiting = this.waiting;
    this.waiting = undefined;
    waiting?.({ value: undefined, done: true });
  }

  close(): void {
    this.items.length = 0;
    this.finish();
    this.onClose(this);
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        const item = this.items.shift();
        if (item) return Promise.resolve({ value: item, done: false });
        if (this.finished) return Promise.resolve({ value: undefined, done: true });
        return new Promise((resolve) => {
          this.waiting = resolve;
        });
      },
      return: () => {
        this.close();
        return Promise.resolve({ value: undefined, done: true });
      },
    };
  }
}

/** Surfaces an error without unwinding the caller: it reaches the host's error reporting, not the channel. */
function report(error: unknown): void {
  queueMicrotask(() => {
    throw error;
  });
}

/** A turn's key among the follows, beside the runs', which are bare ids. */
const TURN = 'turn:';

export function createRealtimeChannel(opts: RealtimeOptions): RealtimeChannel & RunFollower & TurnFollower {
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
  // Keyed by the run id in lower case, as the server names it in a frame's `follow`.
  const follows = new Map<string, Followed<RunFollowItem>>();
  // Keyed by `turn:` and the turn id in lower case.
  const turns = new Map<string, Followed<TurnFollowItem>>();
  // Set while a reopen for follows added in this task is queued.
  let reopenQueued = false;
  // The live follows the request in hand was sent with; unset until it is sent.
  let carried: Set<string> | undefined;

  const subscribe = <T>(set: Set<T>, listener: T) => {
    set.add(listener);
    return () => void set.delete(listener);
  };
  /** In its own `try`: a listener that throws costs neither the others nor the channel. */
  const guarded = (call: () => void) => {
    try {
      call();
    } catch (error) {
      report(error);
    }
  };
  const notify = <T>(set: Set<T>, call: (listener: T) => void) => {
    for (const listener of [...set]) guarded(() => call(listener));
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
    for (const [run, followed] of follows) {
      params.append('follow', followed.cursor === undefined ? run : `${run}:${followed.cursor}`);
    }
    for (const [turn, followed] of turns) params.append('follow', `${turn}:${followed.cursor ?? '0'}`);
    const query = params.toString();
    return `${opts.baseUrl}/events/stream${query ? `?${query}` : ''}`;
  }

  /** Ends a follow on every handle of it, after handing each `last`. */
  function endFollowIn<T>(map: Map<string, Followed<T>>, key: string, last?: T): void {
    const followed = map.get(key);
    if (!followed) return;
    map.delete(key);
    carried?.delete(key);
    for (const handle of followed.handles) {
      if (last) handle.push(last);
      handle.finish();
    }
  }

  function endFollow(key: string, last?: RunFollowItem | TurnFollowItem): void {
    if (key.startsWith(TURN)) endFollowIn(turns, key, last as TurnFollowItem | undefined);
    else endFollowIn(follows, key, last as RunFollowItem | undefined);
  }

  function refuse(key: string, reason: FollowRefusal): void {
    const turn = turns.get(key);
    const followed = follows.get(key);
    const raw = turn
      ? `${key}:${turn.cursor ?? '0'}`
      : followed?.cursor === undefined
        ? key
        : `${key}:${followed.cursor}`;
    endFollow(key, { type: 'follow.refused', follow: raw, reason });
  }

  /** The follow a control frame names: its value as sent, a run id with an optional cursor or `turn:<id>:<seq>`. */
  const followOf = (value: unknown) => {
    if (typeof value !== 'string') return undefined;
    const parts = value.toLowerCase().split(':');
    return parts[0] === 'turn' ? `${TURN}${parts[1] ?? ''}` : parts[0];
  };

  /** One frame of a follow, parsed in its own `try` so a bad one costs nothing but itself. */
  function onFollowFrame(event: string, data: string): void {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(data) as Record<string, unknown>;
    } catch {
      return;
    }
    if (typeof parsed !== 'object' || parsed === null) return;
    if (event === 'turn') {
      const key = typeof parsed.turn === 'string' ? `${TURN}${parsed.turn.toLowerCase()}` : undefined;
      const followed = key === undefined ? undefined : turns.get(key);
      if (!followed || !('frame' in parsed)) return;
      const seq = typeof parsed.seq === 'number' ? parsed.seq : null;
      if (seq !== null) followed.cursor = String(seq);
      const item: TurnFollowItem = { type: 'turn', turn: parsed.turn as string, seq, frame: parsed.frame };
      for (const handle of followed.handles) handle.push(item);
      return;
    }
    if (event === 'frame') {
      if (typeof parsed.type !== 'string' || !FRAME_TYPES.has(parsed.type)) return;
      const run = typeof parsed.follow === 'string' ? parsed.follow.toLowerCase() : undefined;
      const followed = run === undefined ? undefined : follows.get(run);
      if (!followed) return;
      const frame = parsed as unknown as RunFrame;
      if (typeof frame.cursor === 'string') followed.cursor = frame.cursor;
      for (const handle of followed.handles) handle.push(frame);
      return;
    }
    const key = followOf(parsed.follow);
    if (key === undefined || !(follows.has(key) || turns.has(key))) return;
    const item = { ...parsed, type: event } as RunFollowItem | TurnFollowItem;
    if (event === 'follow.lagged') {
      for (const handle of follows.get(key)?.handles ?? []) handle.push(item as RunFollowItem);
    } else {
      endFollow(key, item);
    }
  }

  /** Reopens the stream with every live follow, once for all the follows added in this task. */
  function queueReopen(): void {
    if (reopenQueued) return;
    reopenQueued = true;
    queueMicrotask(() => {
      reopenQueued = false;
      if (stopped || follows.size + turns.size === 0) return;
      // Waiting out a delay: the next attempt carries the follows anyway, and a `Retry-After` must be honoured.
      if (wake) return;
      // Not sent yet: it will carry every follow.
      if (!carried) return;
      const sent = carried;
      if ([...follows.keys(), ...turns.keys()].every((key) => sent.has(key))) return;
      restart = true;
      abort?.abort();
    });
  }

  function followRun(runId: string, options: { after?: string } = {}): RunFollow {
    const run = runId.toLowerCase();
    const handle: FollowHandle<RunFollowItem> = new FollowHandle((closed) => {
      const followed = follows.get(run);
      if (!followed?.handles.delete(closed)) return;
      if (followed.handles.size > 0) return;
      // The stream still carries it until the next reopen; its frames are dropped from now on.
      follows.delete(run);
      carried?.delete(run);
    });
    if (stopped) {
      handle.finish();
      return handle;
    }
    if (!RUN_ID.test(runId)) {
      handle.push({ type: 'follow.refused', follow: runId, reason: 'invalid' });
      handle.finish();
      return handle;
    }
    const existing = follows.get(run);
    if (existing) {
      existing.handles.add(handle);
      return handle;
    }
    if (follows.size + turns.size >= FOLLOWS_MAX) {
      handle.push({ type: 'follow.refused', follow: runId, reason: 'too_many' });
      handle.finish();
      return handle;
    }
    follows.set(run, { cursor: options.after, handles: new Set([handle]) });
    queueReopen();
    return handle;
  }

  function followTurn(turnId: string, options: { after?: number } = {}): TurnFollow {
    const key = `${TURN}${turnId.toLowerCase()}`;
    const handle: FollowHandle<TurnFollowItem> = new FollowHandle((closed) => {
      const followed = turns.get(key);
      if (!followed?.handles.delete(closed)) return;
      if (followed.handles.size > 0) return;
      turns.delete(key);
      carried?.delete(key);
    });
    const raw = `${key}:${options.after ?? 0}`;
    if (stopped) {
      handle.finish();
      return handle;
    }
    if (!RUN_ID.test(turnId)) {
      handle.push({ type: 'follow.refused', follow: raw, reason: 'invalid' });
      handle.finish();
      return handle;
    }
    const existing = turns.get(key);
    if (existing) {
      existing.handles.add(handle);
      return handle;
    }
    if (follows.size + turns.size >= FOLLOWS_MAX) {
      handle.push({ type: 'follow.refused', follow: raw, reason: 'too_many' });
      handle.finish();
      return handle;
    }
    const after = options.after;
    turns.set(key, {
      cursor: after !== undefined && after > 0 ? String(Math.floor(after)) : undefined,
      handles: new Set([handle]),
    });
    queueReopen();
    return handle;
  }

  async function connect(): Promise<Outcome> {
    const controller = new AbortController();
    abort = controller;
    let followed: string[] = [];
    let response: Response;
    try {
      // `auth.headers()` can fail (a token refresh while offline): that is a failed connection.
      const headers = new Headers(await opts.auth.headers());
      headers.set('accept', 'text/event-stream');
      if (position !== undefined) headers.set('last-event-id', position);
      if (controller.signal.aborted) return 'failed';
      followed = [...follows.keys(), ...turns.keys()];
      carried = new Set(followed);
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
      // An API older than follows refuses the parameter: end the follows this request carried and keep the events.
      if (response.status === 400 && followed.length > 0) {
        for (const run of followed) refuse(run, 'unsupported');
        return 'unsupported';
      }
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
    guarded(() => opts.onOpen?.());
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
          case 'notification':
          case 'task_list_changed':
          case 'run_advanced':
          case 'thread_list_changed': {
            const onNudge = opts.onNudge;
            if (!onNudge) break;
            const nudge = { ...JSON.parse(frame.data), type: frame.event } as RealtimeNudge;
            guarded(() => onNudge(nudge));
            break;
          }
          case 'frame':
          case 'turn':
          case 'follow.refused':
          case 'follow.ended':
          case 'follow.lagged':
            onFollowFrame(frame.event, frame.data);
            break;
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

  function endFollows(): void {
    for (const key of [...follows.keys(), ...turns.keys()]) endFollow(key);
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
        carried = undefined;
        const lived = liveSince === undefined ? 0 : Date.now() - liveSince;
        liveSince = undefined;
        if (stopped) return;
        if (outcome === 'revoked') {
          stopped = true;
          // No `DELETE`: the caller lost access, so it would be refused; presence lapses on its own.
          unwatch(false);
          endFollows();
          setStatus('polling');
          notify(revokedListeners, (listener) => listener());
          return;
        }
        if (restart || outcome === 'unsupported') continue;
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
    followRun,
    followTurn,
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
      endFollows();
      abort?.abort();
      wake?.();
    },
  };
}
