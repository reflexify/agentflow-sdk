import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAgentFlowClient, createRealtimeChannel, IDLE_TIMEOUT_MS, proxyAdapter } from '../src/index.js';
import type { RealtimeOptions, RealtimeStatus } from '../src/index.js';

const BASE = 'https://app.test/agentflow/api';
const ENTITY = '0190f0a8-1b2c-7d3e-8f40-123456789abc';
const RECORD = '0190f0a8-1b2c-7d3e-8f40-123456789abd';
const OTHER = '0190f0a8-1b2c-7d3e-8f40-123456789abe';

/** A stream the test writes to, one per connection. */
function stream() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start: (c) => { controller = c; } });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } }),
    push: (text: string) => controller.enqueue(encoder.encode(text)),
    end: () => controller.close(),
  };
}

type Answer = (request: Request) => Response | Promise<Response>;

interface Extra {
  /** Overrides for the channel's own options. */
  channel?: Partial<RealtimeOptions>;
  /** Answers every presence request, in place of an immediate `200`. */
  presence?: Answer;
}

/** A pending promise the test settles later, for a request that should be slow. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

/** The `200` a presence request gets by default: the record named in its path, and one viewer. */
function presenceReply(request: Request): Response {
  const record = /\/records\/([^/]+)\/presence$/.exec(new URL(request.url).pathname)?.[1] ?? RECORD;
  return new Response(JSON.stringify({ entity_id: ENTITY, record_id: record, viewers: ['u1'] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function setup(answers: Answer[], extra: Extra = {}) {
  const requests: Request[] = [];
  const streams: ReturnType<typeof stream>[] = [];
  const fetch = vi.fn(async (request: Request) => {
    requests.push(request);
    const path = new URL(request.url).pathname;
    if (path.endsWith('/presence')) return (extra.presence ?? presenceReply)(request);
    const next = answers.shift();
    if (next) return next(request);
    const s = stream();
    streams.push(s);
    return s.response;
  });
  const auth = proxyAdapter();
  const client = createAgentFlowClient({ baseUrl: BASE, auth, fetch });
  const channel = createRealtimeChannel({
    baseUrl: BASE,
    auth,
    client,
    fetch,
    presence: true,
    random: () => 1,
    ...extra.channel,
  });
  return { channel, requests, streams, fetch };
}

const streamRequests = (requests: Request[]) =>
  requests.filter((r) => new URL(r.url).pathname.endsWith('/events/stream'));

const presenceRequests = (requests: Request[]) =>
  requests.filter((r) => new URL(r.url).pathname.endsWith('/presence'));

/** Errors the channel hands to the host through `queueMicrotask` instead of throwing them itself. */
function captureReports(): unknown[] {
  const reported: unknown[] = [];
  vi.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
    try {
      callback();
    } catch (error) {
      reported.push(error);
    }
  });
  return reported;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('createRealtimeChannel', () => {
  it('emits events and resumes after the last one when the stream ends', async () => {
    const { channel, requests, streams } = setup([]);
    const seen: number[] = [];
    channel.onEvent((e) => seen.push(e.position));
    await vi.advanceTimersByTimeAsync(0);
    expect(channel.status()).toBe('live');
    streams[0]!.push('retry: 3000\n\nid: 41\nevent: record.updated\ndata: {"position":41}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).toEqual([41]);
    streams[0]!.end();
    await vi.advanceTimersByTimeAsync(3000);
    const second = streamRequests(requests)[1]!;
    expect(second.headers.get('last-event-id')).toBe('41');
    expect(new URL(second.url).searchParams.get('presence')).toBe('true');
    channel.close();
  });

  it('asks for a refetch on refetch, on context_changed and after reconnecting with nothing to resume from', async () => {
    const { channel, streams } = setup([]);
    const refetches = vi.fn();
    channel.onRefetch(refetches);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('event: refetch\ndata: {"type":"refetch"}\n\nevent: context_changed\ndata: {}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(refetches).toHaveBeenCalledTimes(2);
    streams[0]!.end();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(refetches).toHaveBeenCalledTimes(3);
    channel.close();
  });

  it('reads polling after three failed connections, and retry reconnects at once', async () => {
    const failed = () => new Response(null, { status: 502 });
    const { channel, requests } = setup([failed, failed, failed, failed]);
    const statuses: RealtimeStatus[] = [];
    channel.onStatus((s) => statuses.push(s));
    // The attempts fail at 0, 2, 6 and 14 s; the fourth leaves a 16 s wait, which `retry` cuts short.
    await vi.advanceTimersByTimeAsync(20_000);
    expect(statuses).toContain('polling');
    expect(channel.status()).toBe('polling');
    const before = streamRequests(requests).length;
    expect(before).toBe(4);
    channel.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests).length).toBe(before + 1);
    expect(channel.status()).toBe('live');
    channel.close();
  });

  it('does nothing on retry while the stream is live', async () => {
    const { channel, requests } = setup([]);
    await vi.advanceTimersByTimeAsync(0);
    expect(channel.status()).toBe('live');
    channel.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(1);
    expect(channel.status()).toBe('live');
    channel.close();
  });

  it('drops an attempt still awaiting its response on retry, and tries again at once', async () => {
    const hang: Answer = (request) =>
      new Promise((_resolve, reject) => {
        request.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    const { channel, requests } = setup([hang]);
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(1);
    expect(channel.status()).toBe('connecting');
    channel.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(2);
    expect(channel.status()).toBe('live');
    channel.close();
  });

  it('retry cuts a backoff short and does not count against the failures', async () => {
    const failed = () => new Response(null, { status: 502 });
    const { channel, requests } = setup([failed]);
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(1);
    expect(channel.status()).toBe('connecting');
    channel.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(2);
    expect(channel.status()).toBe('live');
    channel.close();
  });

  it('stops for good when access is revoked', async () => {
    const { channel, requests, streams } = setup([]);
    const revoked = vi.fn();
    channel.onRevoked(revoked);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('event: access_revoked\ndata: {"type":"access_revoked"}\n\n');
    await vi.advanceTimersByTimeAsync(120_000);
    expect(revoked).toHaveBeenCalledOnce();
    expect(streamRequests(requests)).toHaveLength(1);
  });

  it('reconnects at once when asked to reauthenticate on a connection that has lived a while', async () => {
    const { channel, requests, streams } = setup([]);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(5_000);
    streams[0]!.push('event: reauthenticate\ndata: {}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(2);
    channel.close();
  });

  it('waits the retry interval before reconnecting on a reauthenticate that arrives as the stream opens', async () => {
    const { channel, requests, streams } = setup([]);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('retry: 3000\n\nevent: reauthenticate\ndata: {}\n\n');
    await vi.advanceTimersByTimeAsync(2_900);
    expect(streamRequests(requests)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(streamRequests(requests)).toHaveLength(2);
    // Each fresh connection that is told the same again waits as long; none spins.
    streams[1]!.push('event: reauthenticate\ndata: {}\n\n');
    await vi.advanceTimersByTimeAsync(2_900);
    expect(streamRequests(requests)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(200);
    expect(streamRequests(requests)).toHaveLength(3);
    channel.close();
  });

  it('heartbeats the watched record every 20 seconds and leaves it when the target changes', async () => {
    const { channel, requests } = setup([]);
    const presence = vi.fn();
    channel.onPresence(presence);
    channel.watch({ entityId: ENTITY, recordId: RECORD });
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(40_000);
    const beats = requests.filter((r) => r.method === 'POST' && r.url.endsWith(`/records/${RECORD}/presence`));
    expect(beats).toHaveLength(3);
    expect(presence).toHaveBeenCalledWith({ entity_id: ENTITY, record_id: RECORD, viewers: ['u1'] });
    channel.watch({ entityId: ENTITY, recordId: OTHER });
    await vi.advanceTimersByTimeAsync(0);
    expect(requests.some((r) => r.method === 'DELETE' && r.url.endsWith(`/records/${RECORD}/presence`))).toBe(true);
    channel.close();
  });

  it('stops heartbeating when access is revoked, and ignores watch afterwards', async () => {
    const { channel, requests, streams } = setup([]);
    channel.watch({ entityId: ENTITY, recordId: RECORD });
    await vi.advanceTimersByTimeAsync(0);
    expect(presenceRequests(requests)).toHaveLength(1);
    streams[0]!.push('event: access_revoked\ndata: {"type":"access_revoked"}\n\n');
    await vi.advanceTimersByTimeAsync(60_000);
    // Neither another beat nor a `DELETE`, which the caller could no longer make.
    expect(presenceRequests(requests)).toHaveLength(1);
    channel.watch({ entityId: ENTITY, recordId: OTHER });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(presenceRequests(requests)).toHaveLength(1);
    channel.close();
    await vi.advanceTimersByTimeAsync(0);
    expect(presenceRequests(requests)).toHaveLength(1);
  });

  it('never has two heartbeats in flight, however slow the first is', async () => {
    const slow = deferred<Response>();
    let answered = 0;
    const { channel, requests } = setup([], {
      presence: (request) => (answered++ === 0 ? slow.promise : presenceReply(request)),
    });
    const presence = vi.fn();
    channel.onPresence(presence);
    channel.watch({ entityId: ENTITY, recordId: RECORD });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(presenceRequests(requests)).toHaveLength(1);
    expect(presence).not.toHaveBeenCalled();
    slow.resolve(presenceReply(requests[0]!));
    await vi.advanceTimersByTimeAsync(0);
    expect(presence).toHaveBeenCalledOnce();
    expect(presenceRequests(requests)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(presenceRequests(requests)).toHaveLength(2);
    channel.close();
  });

  it('leaves a record only after its in-flight heartbeat lands, and drops what that heartbeat returns', async () => {
    const slow = deferred<Response>();
    let answered = 0;
    const { channel, requests } = setup([], {
      presence: (request) => (answered++ === 0 ? slow.promise : presenceReply(request)),
    });
    const presence = vi.fn();
    channel.onPresence(presence);
    channel.watch({ entityId: ENTITY, recordId: RECORD });
    await vi.advanceTimersByTimeAsync(0);
    channel.watch({ entityId: ENTITY, recordId: OTHER });
    await vi.advanceTimersByTimeAsync(0);
    expect(presenceRequests(requests).map((r) => r.method)).toEqual(['POST']);
    slow.resolve(presenceReply(requests[0]!));
    await vi.advanceTimersByTimeAsync(0);
    expect(presenceRequests(requests).map((r) => `${r.method} ${r.url.split('/records/')[1]}`)).toEqual([
      `POST ${RECORD}/presence`,
      `DELETE ${RECORD}/presence`,
      `POST ${OTHER}/presence`,
    ]);
    expect(presence).toHaveBeenCalledOnce();
    expect(presence).toHaveBeenCalledWith({ entity_id: ENTITY, record_id: OTHER, viewers: ['u1'] });
    channel.close();
  });

  it('drops a heartbeat that lands after close, and still leaves the record', async () => {
    const slow = deferred<Response>();
    let answered = 0;
    const { channel, requests } = setup([], {
      presence: (request) => (answered++ === 0 ? slow.promise : presenceReply(request)),
    });
    const presence = vi.fn();
    channel.onPresence(presence);
    channel.watch({ entityId: ENTITY, recordId: RECORD });
    await vi.advanceTimersByTimeAsync(0);
    channel.close();
    slow.resolve(presenceReply(requests[0]!));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(presence).not.toHaveBeenCalled();
    expect(presenceRequests(requests).map((r) => r.method)).toEqual(['POST', 'DELETE']);
  });

  it('sends no Last-Event-ID after a refetch, whose position is stale', async () => {
    const { channel, requests, streams } = setup([]);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('id: 41\nevent: record.updated\ndata: {"position":41}\n\n');
    streams[0]!.push('event: refetch\ndata: {"type":"refetch"}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.end();
    await vi.advanceTimersByTimeAsync(30_000);
    const second = streamRequests(requests)[1]!;
    expect(second.headers.has('last-event-id')).toBe(false);
    channel.close();
  });

  it('only moves the position on an id-bearing frame with no data', async () => {
    const { channel, requests, streams } = setup([]);
    const seen = vi.fn();
    channel.onEvent(seen);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('id: 9\nevent: record.updated\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).not.toHaveBeenCalled();
    streams[0]!.end();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(streamRequests(requests)[1]!.headers.get('last-event-id')).toBe('9');
    channel.close();
  });

  it('waits out Retry-After on a 429 or 503 and then reconnects', async () => {
    const busy = () => new Response(null, { status: 429, headers: { 'retry-after': '7' } });
    const { channel, requests } = setup([busy]);
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(6_900);
    expect(streamRequests(requests)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(streamRequests(requests)).toHaveLength(2);
    expect(channel.status()).toBe('live');
    channel.close();
  });

  it('keeps going when a status listener throws, and reports the error to the host', async () => {
    const reported = captureReports();
    const { channel, requests, streams } = setup([]);
    channel.onStatus(() => {
      throw new Error('status boom');
    });
    const seen: number[] = [];
    channel.onEvent((e) => seen.push(e.position));
    await vi.advanceTimersByTimeAsync(0);
    expect(channel.status()).toBe('live');
    expect(reported).toEqual([new Error('status boom')]);
    streams[0]!.push('id: 5\nevent: record.updated\ndata: {"position":5}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).toEqual([5]);
    // Still reconnects, and only the one stream was ever opened until the server ended it.
    expect(streamRequests(requests)).toHaveLength(1);
    streams[0]!.end();
    await vi.advanceTimersByTimeAsync(3_000);
    expect(streamRequests(requests)).toHaveLength(2);
    channel.close();
  });

  it('keeps the connection and the other listeners when a refetch or event listener throws', async () => {
    const reported = captureReports();
    const { channel, requests, streams } = setup([]);
    const first = vi.fn(() => {
      throw new Error('refetch boom');
    });
    const second = vi.fn();
    channel.onRefetch(first);
    channel.onRefetch(second);
    const events = vi.fn();
    channel.onEvent(() => {
      throw new Error('event boom');
    });
    channel.onEvent(events);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('event: refetch\ndata: {"type":"refetch"}\n\n');
    streams[0]!.push('id: 8\nevent: record.updated\ndata: {"position":8}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(events).toHaveBeenCalledOnce();
    expect(reported).toEqual([new Error('refetch boom'), new Error('event boom')]);
    // The server's keep-alives, so the connection does not read as dead.
    for (let beat = 0; beat < 3; beat += 1) {
      await vi.advanceTimersByTimeAsync(20_000);
      streams[0]!.push(': keep-alive\n\n');
    }
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(1);
    channel.close();
  });

  it('keeps going when a revoked listener throws', async () => {
    const reported = captureReports();
    const { channel, streams } = setup([]);
    const other = vi.fn();
    channel.onRevoked(() => {
      throw new Error('revoked boom');
    });
    channel.onRevoked(other);
    await vi.advanceTimersByTimeAsync(0);
    streams[0]!.push('event: access_revoked\ndata: {"type":"access_revoked"}\n\n');
    await vi.advanceTimersByTimeAsync(0);
    expect(other).toHaveBeenCalledOnce();
    expect(reported).toEqual([new Error('revoked boom')]);
  });

  it('treats auth.headers() failing as a failed connection, and connects once it recovers', async () => {
    const reported = captureReports();
    const headers = vi.fn<() => Promise<Record<string, string>>>();
    headers.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({});
    const { channel, requests } = setup([], { channel: { auth: { headers, credentials: 'same-origin' } } });
    await vi.advanceTimersByTimeAsync(0);
    expect(streamRequests(requests)).toHaveLength(0);
    expect(channel.status()).toBe('connecting');
    // The first failure waits backoff(1) = 2 s (the jitter source is pinned to 1).
    await vi.advanceTimersByTimeAsync(2_000);
    expect(streamRequests(requests)).toHaveLength(1);
    expect(channel.status()).toBe('live');
    expect(reported).toEqual([]);
    channel.close();
  });

  it('counts a 404 as a failure: polling after three, and it keeps retrying', async () => {
    const off = () => new Response(null, { status: 404 });
    const { channel, requests } = setup([off, off, off, off, off, off, off, off]);
    const statuses: RealtimeStatus[] = [];
    channel.onStatus((s) => statuses.push(s));
    await vi.advanceTimersByTimeAsync(0);
    expect(channel.status()).toBe('connecting');
    await vi.advanceTimersByTimeAsync(120_000);
    expect(statuses).toContain('polling');
    expect(streamRequests(requests).length).toBeGreaterThan(3);
    channel.close();
  });

  describe('a connection that goes quiet', () => {
    it('is dropped and reopened, resuming by position, after the idle timeout', async () => {
      const { channel, requests, streams } = setup([]);
      await vi.advanceTimersByTimeAsync(0);
      expect(channel.status()).toBe('live');
      streams[0]!.push('retry: 3000\n\nid: 41\nevent: record.updated\ndata: {"position":41}\n\n');
      await vi.advanceTimersByTimeAsync(0);
      // Nothing more arrives, not even a keep-alive: a half-open connection reads like this.
      await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS - 1_000);
      expect(streamRequests(requests)).toHaveLength(1);
      expect(channel.status()).toBe('live');
      await vi.advanceTimersByTimeAsync(1_000);
      expect(channel.status()).toBe('connecting');
      await vi.advanceTimersByTimeAsync(3_000);
      expect(streamRequests(requests)).toHaveLength(2);
      expect(streamRequests(requests)[1]!.headers.get('last-event-id')).toBe('41');
      expect(channel.status()).toBe('live');
      channel.close();
    });

    it('reconnects without a position when none was seen, and does not count the drop as a failure', async () => {
      const { channel, requests } = setup([]);
      await vi.advanceTimersByTimeAsync(0);
      // Three quiet connections in a row would read `polling` if each counted against the channel.
      for (let round = 1; round <= 3; round += 1) {
        await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS + 3_000);
        expect(streamRequests(requests)).toHaveLength(round + 1);
        expect(channel.status()).toBe('live');
      }
      expect(streamRequests(requests)[3]!.headers.has('last-event-id')).toBe(false);
      channel.close();
    });

    it('stays open while keep-alive comments arrive within the idle timeout', async () => {
      const { channel, requests, streams } = setup([]);
      await vi.advanceTimersByTimeAsync(0);
      for (let beat = 0; beat < 12; beat += 1) {
        await vi.advanceTimersByTimeAsync(20_000);
        streams[0]!.push(': keep-alive\n\n');
        await vi.advanceTimersByTimeAsync(0);
      }
      expect(streamRequests(requests)).toHaveLength(1);
      expect(channel.status()).toBe('live');
      channel.close();
    });

    it('leaves no timer behind once the channel is closed', async () => {
      const { channel, streams } = setup([]);
      await vi.advanceTimersByTimeAsync(0);
      streams[0]!.push(': keep-alive\n\n');
      await vi.advanceTimersByTimeAsync(0);
      channel.close();
      await vi.advanceTimersByTimeAsync(0);
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
