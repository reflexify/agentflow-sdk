import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentFlowError, bearerAdapter, runs, RunStreamBusyError } from '../src/index.js';
import type { RunFollowItem } from '../src/index.js';

const BASE = 'https://agentflow.test/api/v1';
const RUN = '0190f0a8-1b2c-7d3e-8f40-0000000000a1';
const CHILD = '0190f0a8-1b2c-7d3e-8f40-0000000000c1';

/** One response body the test writes to, which knows whether the helper still holds it. */
function stream() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const state = { open: true };
  const body = new ReadableStream<Uint8Array>({
    start: (c) => {
      controller = c;
    },
    cancel: () => {
      state.open = false;
    },
  });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } }),
    state,
    push: (text: string) => controller.enqueue(encoder.encode(text)),
    drop: () => {
      state.open = false;
      controller.close();
    },
  };
}

type Answer = () => Response;

/** A fake run stream: each request gets the next queued answer, or a fresh body the row writes to. */
function server() {
  const requests: Request[] = [];
  const streams: ReturnType<typeof stream>[] = [];
  const answers: Answer[] = [];
  const fetch = vi.fn(async (request: Request) => {
    requests.push(request);
    const answer = answers.shift();
    if (answer) return answer();
    const s = stream();
    streams.push(s);
    return s.response;
  });
  return {
    fetch,
    requests,
    streams,
    last: () => streams[streams.length - 1]!,
    answerNext: (answer: Answer) => answers.push(answer),
  };
}

let seq = 0;
/** One `event: frame` as `stream_instance` writes it: its cursor as the SSE id, unless `id` is null. */
function frame(fields: Record<string, unknown>, id: string | null = `n${++seq}`): string {
  const data = {
    run: RUN,
    root: RUN,
    follow: RUN,
    step: 'draft',
    iteration: null,
    attempt: 1,
    segment: 0,
    seq: id === null ? null : 0,
    cursor: id,
    ...fields,
  };
  return `${id === null ? '' : `id: ${id}\n`}event: frame\ndata: ${JSON.stringify(data)}\n\n`;
}
const control = (type: string) => `event: ${type}\ndata: ${JSON.stringify({ type })}\n\n`;
const started = (id?: string) => frame({ type: 'step.started', reply: false, streamed: true }, id);
const delta = (text: string, id?: string) => frame({ type: 'text.delta', text, turn: 1 }, id);
const runDone = (id?: string | null) => frame({ type: 'run.done', step: '', status: 'completed' }, id);
const busy = (retryAfter?: string, status = 429) => () =>
  new Response(JSON.stringify({ type: 'EVENT_STREAMS_PER_CALLER_EXCEEDED', detail: 'six streams' }), {
    status,
    headers: { 'content-type': 'application/problem+json', ...(retryAfter ? { 'retry-after': retryAfter } : {}) },
  });

const tick = () => vi.advanceTimersByTimeAsync(0);

/** Reads the follow in the background, as a script's `for await` would. */
function consume(iterable: AsyncIterable<RunFollowItem>) {
  const items: RunFollowItem[] = [];
  const outcome = { done: false, error: undefined as unknown };
  void (async () => {
    try {
      for await (const item of iterable) items.push(item);
    } catch (error) {
      outcome.error = error;
    }
    outcome.done = true;
  })();
  return { items, outcome };
}

type Server = ReturnType<typeof server>;

interface Row {
  name: string;
  drive: (s: Server, abort: AbortController) => Promise<void>;
  /** Each item's `type`, with a frame's `text` or `status` after a colon. */
  items: string[];
  /** The `Last-Event-ID` each request sent, null for none. */
  lastEventIds: (string | null)[];
  error?: (error: unknown) => void;
}

const said = (item: RunFollowItem) => {
  if (item.type === 'text.delta') return `${item.type}:${item.text}`;
  if (item.type === 'run.done') return `${item.type}:${item.status}`;
  if (item.type === 'follow.refused') return `${item.type}:${item.reason}`;
  return item.type;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('runs.follow', () => {
  const rows: Row[] = [
    {
      name: 'a whole run',
      drive: async (s) => {
        await tick();
        s.last().push(started() + delta('Hel') + delta('lo') + frame({ type: 'step.done' }));
        s.last().push(frame({ type: 'step.started', run: CHILD, reply: false, streamed: false }));
        s.last().push(frame({ type: 'run.done', run: CHILD, step: '', status: 'completed' }));
        s.last().push(runDone() + control('end'));
      },
      items: [
        'step.started',
        'text.delta:Hel',
        'text.delta:lo',
        'step.done',
        'step.started',
        'run.done:completed',
        'run.done:completed',
        'follow.ended',
      ],
      lastEventIds: [null],
    },
    {
      name: 'a dropped connection resumes by Last-Event-ID',
      drive: async (s) => {
        await tick();
        s.last().push(started('n1') + delta('Hel', 'n2'));
        s.last().drop();
        await tick();
        s.last().push(delta('lo', 'n3') + runDone('n4') + control('end'));
      },
      items: ['step.started', 'text.delta:Hel', 'text.delta:lo', 'run.done:completed', 'follow.ended'],
      lastEventIds: [null, 'n2'],
    },
    {
      name: '`lagged` is yielded as follow.lagged and the follow goes on',
      drive: async (s) => {
        await tick();
        s.last().push(started() + control('lagged') + delta('lo') + runDone() + control('end'));
      },
      items: ['step.started', 'follow.lagged', 'text.delta:lo', 'run.done:completed', 'follow.ended'],
      lastEventIds: [null],
    },
    {
      name: '`end` is yielded as follow.ended and nothing after it',
      drive: async (s) => {
        await tick();
        s.last().push(runDone() + control('end') + started());
      },
      items: ['run.done:completed', 'follow.ended'],
      lastEventIds: [null],
    },
    {
      name: 'a 429 at the first open throws, with Retry-After',
      drive: async (s) => {
        s.answerNext(busy('7'));
        await tick();
      },
      items: [],
      lastEventIds: [null],
      error: (error) => {
        expect(error).toBeInstanceOf(RunStreamBusyError);
        expect(error).toBeInstanceOf(AgentFlowError);
        expect(error).toMatchObject({ status: 429, code: 'EVENT_STREAMS_PER_CALLER_EXCEEDED', retryAfter: 7 });
      },
    },
    {
      name: 'a 503 at the first open whose Retry-After is hidden throws with 5',
      drive: async (s) => {
        s.answerNext(busy(undefined, 503));
        await tick();
      },
      items: [],
      lastEventIds: [null],
      error: (error) => expect(error).toMatchObject({ status: 503, retryAfter: 5 }),
    },
    {
      name: 'a 404 at the first open throws',
      drive: async (s) => {
        s.answerNext(() => new Response(JSON.stringify({ type: 'NOT_FOUND' }), { status: 404 }));
        await tick();
      },
      items: [],
      lastEventIds: [null],
      error: (error) => {
        expect(error).not.toBeInstanceOf(RunStreamBusyError);
        expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' });
      },
    },
    {
      name: 'a 429 on a reconnect waits Retry-After, and 5 s when hidden',
      drive: async (s) => {
        await tick();
        s.last().push(started('n1'));
        s.answerNext(busy('3'));
        s.answerNext(busy());
        s.last().drop();
        await tick();
        expect(s.requests).toHaveLength(2);
        await vi.advanceTimersByTimeAsync(2_999);
        expect(s.requests).toHaveLength(2);
        await vi.advanceTimersByTimeAsync(1);
        expect(s.requests).toHaveLength(3);
        await vi.advanceTimersByTimeAsync(4_999);
        expect(s.requests).toHaveLength(3);
        await vi.advanceTimersByTimeAsync(1);
        s.last().push(runDone('n2') + control('end'));
      },
      items: ['step.started', 'run.done:completed', 'follow.ended'],
      lastEventIds: [null, 'n1', 'n1', 'n1'],
    },
    {
      name: 'an aborted signal closes the connection and ends the iteration',
      drive: async (s, abort) => {
        await tick();
        s.last().push(started());
        await tick();
        abort.abort();
        await tick();
        expect(s.last().state.open).toBe(false);
        await vi.advanceTimersByTimeAsync(60_000);
      },
      items: ['step.started'],
      lastEventIds: [null],
    },
    {
      name: 'a run already over yields its built run.done and ends',
      drive: async (s) => {
        await tick();
        s.last().push(runDone(null) + control('end'));
      },
      items: ['run.done:completed', 'follow.ended'],
      lastEventIds: [null],
    },
    {
      name: 'a connection silent past twice the keep-alive is reopened',
      drive: async (s) => {
        await tick();
        s.last().push(started('n1'));
        await vi.advanceTimersByTimeAsync(20_000);
        s.last().push(': keep-alive\n\n');
        await vi.advanceTimersByTimeAsync(39_999);
        expect(s.requests).toHaveLength(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(s.streams[0]!.state.open).toBe(false);
        await tick();
        expect(s.requests).toHaveLength(2);
        s.last().push(runDone('n2') + control('end'));
      },
      items: ['step.started', 'run.done:completed', 'follow.ended'],
      lastEventIds: [null, 'n1'],
    },
    {
      name: '`access_revoked` ends the follow as refused',
      drive: async (s) => {
        await tick();
        s.last().push(started() + control('access_revoked'));
      },
      items: ['step.started', 'follow.refused:not_found'],
      lastEventIds: [null],
    },
    {
      name: 'a connection lost after the run.done ends without reopening',
      drive: async (s) => {
        await tick();
        s.last().push(runDone('n1'));
        s.last().drop();
        await vi.advanceTimersByTimeAsync(60_000);
      },
      items: ['run.done:completed', 'follow.ended'],
      lastEventIds: [null],
    },
  ];

  for (const row of rows) {
    it(row.name, async () => {
      const s = server();
      const abort = new AbortController();
      const auth = bearerAdapter(async () => 'afs_token');
      const { items, outcome } = consume(runs.follow({ baseUrl: BASE, auth, fetch: s.fetch }, RUN, { signal: abort.signal }));
      await row.drive(s, abort);
      await tick();
      expect(outcome.done).toBe(true);
      if (row.error) row.error(outcome.error);
      else expect(outcome.error).toBeUndefined();
      expect(items.map(said)).toEqual(row.items);
      expect(s.requests.map((r) => r.headers.get('last-event-id'))).toEqual(row.lastEventIds);
      for (const request of s.requests) {
        expect(request.url).toBe(`${BASE}/instances/${RUN}/stream`);
        expect(request.headers.get('authorization')).toBe('Bearer afs_token');
      }
      expect(s.streams.every((x) => !x.state.open)).toBe(true);
    });
  }

  it('sends `after` on the URL and leaves the client and its retries out', async () => {
    const s = server();
    const auth = bearerAdapter(async () => 'afs_token');
    const { outcome } = consume(runs.follow({ baseUrl: BASE, auth, fetch: s.fetch }, RUN, { after: 'n9' }));
    await tick();
    s.last().push(runDone(null) + control('end'));
    await tick();
    expect(outcome.done).toBe(true);
    expect(s.requests[0]!.url).toBe(`${BASE}/instances/${RUN}/stream?after=n9`);
    expect(s.requests[0]!.headers.get('accept')).toBe('text/event-stream');
  });
});
