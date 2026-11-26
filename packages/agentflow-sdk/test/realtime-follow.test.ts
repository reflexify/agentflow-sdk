import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createAgentFlowClient, createRealtimeChannel, proxyAdapter, reduceRunFrames, stepKey } from '../src/index.js';
import type {
  RealtimeChannel,
  RunFollow,
  RunFollower,
  RunFollowItem,
  RunFrame,
  RunFramesState,
  RunStepState,
  TurnFollow,
  TurnFollowItem,
} from '../src/index.js';

const BASE = 'https://app.test/agentflow/api';
const RUN = '0190f0a8-1b2c-7d3e-8f40-0000000000a1';
const OTHER = '0190f0a8-1b2c-7d3e-8f40-0000000000a2';
const CHILD = '0190f0a8-1b2c-7d3e-8f40-0000000000c1';
const ITEM_2 = '0190f0a8-1b2c-7d3e-8f40-0000000000c2';

/** A stream the test writes to, one per connection, that knows whether the channel still holds it. */
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
    end: () => {
      state.open = false;
      controller.close();
    },
  };
}

type Answer = (request: Request) => Response;

function setup(answers: Answer[] = []) {
  const requests: Request[] = [];
  const streams: ReturnType<typeof stream>[] = [];
  let mostOpen = 0;
  const fetch = vi.fn(async (request: Request) => {
    requests.push(request);
    const next = answers.shift();
    if (next) return next(request);
    const s = stream();
    streams.push(s);
    mostOpen = Math.max(mostOpen, streams.filter((x) => x.state.open).length);
    return s.response;
  });
  const auth = proxyAdapter();
  const client = createAgentFlowClient({ baseUrl: BASE, auth, fetch });
  const channel = createRealtimeChannel({ baseUrl: BASE, auth, client, fetch, random: () => 1 });
  return {
    channel,
    requests,
    streams,
    mostOpen: () => mostOpen,
    last: () => streams[streams.length - 1]!,
    /** Answers the next stream request with `answer` in place of a stream. */
    answerNext: (answer: Answer) => answers.push(answer),
  };
}

const follows = (request: Request | undefined) => new URL(request!.url).searchParams.getAll('follow');

let cursor = 0;
/** One `event: frame` as W1 sends it, with a fresh cursor unless one is given. */
function frame(follow: string, fields: Record<string, unknown>): string {
  cursor += 1;
  const data = {
    run: follow,
    root: follow,
    follow,
    step: 'draft',
    iteration: null,
    attempt: 1,
    segment: 0,
    seq: 0,
    cursor: `c${cursor}`,
    ...fields,
  };
  return `event: frame\ndata: ${JSON.stringify(data)}\n\n`;
}

const control = (type: string, follow: string, extra: Record<string, unknown> = {}) =>
  `event: ${type}\ndata: ${JSON.stringify({ type, follow, ...extra })}\n\n`;

/** Reads what a follow has queued so far, and whether it has ended. */
async function drain(follow: RunFollow): Promise<{ items: RunFollowItem[]; ended: boolean }> {
  await vi.advanceTimersByTimeAsync(0);
  const iterator = follow[Symbol.asyncIterator]();
  const items: RunFollowItem[] = [];
  for (;;) {
    // A queued item settles `next()` at once; a follow with nothing queued loses the race.
    const pending = Promise.resolve().then(() => 'pending' as const);
    const next = await Promise.race([iterator.next(), pending]);
    if (next === 'pending') return { items, ended: false };
    if (next.done) return { items, ended: true };
    items.push(next.value);
  }
}

const types = (items: RunFollowItem[]) => items.map((item) => item.type);

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

type Harness = ReturnType<typeof setup>;
const tick = () => vi.advanceTimersByTimeAsync(0);

const channelRows: [string, (h: Harness) => Promise<void>][] = [
  [
    'one follow reopens the stream with it and yields its frames',
    async ({ channel, requests, streams, last }) => {
      await tick();
      streams[0]!.push('id: 7\n\n');
      const follow = channel.followRun(RUN);
      await tick();
      expect(requests).toHaveLength(2);
      expect(follows(requests[0])).toEqual([]);
      expect(follows(requests[1])).toEqual([RUN]);
      expect(requests[1]!.headers.get('last-event-id')).toBe('7');
      expect(streams[0]!.state.open).toBe(false);
      last().push(frame(RUN, { type: 'step.started', node: 'agent', reply: false, streamed: true }));
      last().push(frame(RUN, { type: 'text.delta', text: 'Hi', seq: 1 }));
      const { items, ended } = await drain(follow);
      expect(types(items)).toEqual(['step.started', 'text.delta']);
      expect(ended).toBe(false);
    },
  ],
  [
    'a second follow reopens with both, the first at its latest cursor, and loses no event',
    async ({ channel, requests, last }) => {
      const events: number[] = [];
      channel.onEvent((e) => events.push(e.position));
      await tick();
      const first = channel.followRun(RUN, { after: 'c0' });
      await tick();
      expect(follows(requests[1])).toEqual([`${RUN}:c0`]);
      last().push('id: 8\nevent: record.updated\ndata: {"position":8}\n\n');
      last().push(frame(RUN, { type: 'step.started', streamed: false, reply: false, cursor: 'k1' }));
      await tick();
      const second = channel.followRun(OTHER);
      await tick();
      expect(follows(requests[2])).toEqual([`${RUN}:k1`, OTHER]);
      expect(requests[2]!.headers.get('last-event-id')).toBe('8');
      last().push('id: 9\nevent: record.updated\ndata: {"position":9}\n\n');
      last().push(frame(RUN, { type: 'step.done', seq: 1, cursor: 'k2' }));
      last().push(frame(OTHER, { type: 'step.started', streamed: false, reply: false }));
      expect(types((await drain(first)).items)).toEqual(['step.started', 'step.done']);
      expect(types((await drain(second)).items)).toEqual(['step.started']);
      expect(events).toEqual([8, 9]);
    },
  ],
  [
    'follows added in one task share one reopen, and a follow of a run already followed adds none',
    async ({ channel, requests, last }) => {
      await tick();
      const a = channel.followRun(RUN);
      channel.followRun(OTHER);
      await tick();
      expect(requests).toHaveLength(2);
      expect(follows(requests[1])).toEqual([RUN, OTHER]);
      const b = channel.followRun(RUN.toUpperCase());
      await tick();
      expect(requests).toHaveLength(2);
      last().push(frame(RUN, { type: 'step.started', streamed: false, reply: false }));
      expect((await drain(a)).items).toHaveLength(1);
      expect((await drain(b)).items).toHaveLength(1);
    },
  ],
  [
    'a closed follow drops its frames at once, keeps the stream, and is left out of the next reopen',
    async ({ channel, requests, last }) => {
      await tick();
      const follow = channel.followRun(RUN);
      await tick();
      follow.close();
      last().push(frame(RUN, { type: 'step.started', streamed: false, reply: false }));
      await tick();
      expect(requests).toHaveLength(2);
      expect(await drain(follow)).toEqual({ items: [], ended: true });
      channel.followRun(OTHER);
      await tick();
      expect(follows(requests[2])).toEqual([OTHER]);
    },
  ],
  [
    'follow.ended ends the iterator after the run.done before it',
    async ({ channel, last }) => {
      await tick();
      const follow = channel.followRun(RUN);
      await tick();
      last().push(frame(RUN, { type: 'run.done', step: '', attempt: 0, status: 'completed' }));
      last().push(control('follow.ended', RUN));
      const { items, ended } = await drain(follow);
      expect(types(items)).toEqual(['run.done', 'follow.ended']);
      expect(ended).toBe(true);
    },
  ],
  [
    'follow.refused ends the iterator, matched by the value as sent, and the channel stays live',
    async ({ channel, last }) => {
      await tick();
      const follow = channel.followRun(RUN, { after: 'c9' });
      await tick();
      last().push(control('follow.refused', `${RUN}:c9`, { reason: 'not_found' }));
      last().push('id: 3\nevent: record.updated\ndata: {"position":3}\n\n');
      const events: number[] = [];
      channel.onEvent((e) => events.push(e.position));
      const { items, ended } = await drain(follow);
      expect(items).toEqual([{ type: 'follow.refused', follow: `${RUN}:c9`, reason: 'not_found' }]);
      expect(ended).toBe(true);
      expect(events).toEqual([3]);
      expect(channel.status()).toBe('live');
    },
  ],
  [
    'follow.lagged is yielded and the follow goes on',
    async ({ channel, last }) => {
      await tick();
      const follow = channel.followRun(RUN);
      await tick();
      last().push(control('follow.lagged', RUN));
      last().push(frame(RUN, { type: 'step.done', seq: 4 }));
      const { items, ended } = await drain(follow);
      expect(types(items)).toEqual(['follow.lagged', 'step.done']);
      expect(ended).toBe(false);
    },
  ],
  [
    'a dropped connection reopens with every follow at its latest cursor',
    async ({ channel, requests, last }) => {
      await tick();
      channel.followRun(RUN);
      channel.followRun(OTHER, { after: 'o1' });
      await tick();
      last().push('retry: 1000\n\n');
      last().push(frame(RUN, { type: 'step.started', streamed: false, reply: false, cursor: 'r5' }));
      await tick();
      last().end();
      await vi.advanceTimersByTimeAsync(1000);
      expect(follows(requests[2])).toEqual([`${RUN}:r5`, `${OTHER}:o1`]);
    },
  ],
  [
    'a seventh stream is never opened: the old request closes before the new one opens',
    async ({ channel, requests, mostOpen }) => {
      await tick();
      const ids = Array.from({ length: 8 }, (_, i) => `0190f0a8-1b2c-7d3e-8f40-00000000010${i}`);
      for (const id of ids) {
        channel.followRun(id);
        await tick();
      }
      expect(requests).toHaveLength(9);
      expect(follows(requests[8])).toEqual(ids);
      expect(mostOpen()).toBe(1);
    },
  ],
  [
    'a 400 to a stream with follows reopens without them, ends each as unsupported, and events still arrive',
    async ({ channel, requests, streams, last, answerNext }) => {
      await tick();
      const events: number[] = [];
      channel.onEvent((e) => events.push(e.position));
      requests.length = 0;
      const answered = streams.length;
      const statuses: string[] = [];
      channel.onStatus((s) => statuses.push(s));
      answerNext(
        () =>
          new Response(JSON.stringify({ error: { code: 'UNKNOWN_QUERY_PARAMETER' } }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          }),
      );
      const a = channel.followRun(RUN);
      const b = channel.followRun(OTHER);
      await tick();
      expect(follows(requests[0])).toEqual([RUN, OTHER]);
      expect(follows(requests[1])).toEqual([]);
      expect(streams.length).toBe(answered + 1);
      last().push('id: 5\nevent: record.updated\ndata: {"position":5}\n\n');
      const first = await drain(a);
      const second = await drain(b);
      expect(first).toEqual({ items: [{ type: 'follow.refused', follow: RUN, reason: 'unsupported' }], ended: true });
      expect(second.items).toEqual([{ type: 'follow.refused', follow: OTHER, reason: 'unsupported' }]);
      expect(events).toEqual([5]);
      expect(statuses).toEqual([]);
    },
  ],
  [
    'a run id that is not a UUID is refused as invalid and opens nothing',
    async ({ channel, requests }) => {
      await tick();
      const follow = channel.followRun('not-a-run');
      await tick();
      expect(requests).toHaveLength(1);
      expect(await drain(follow)).toEqual({
        items: [{ type: 'follow.refused', follow: 'not-a-run', reason: 'invalid' }],
        ended: true,
      });
    },
  ],
  [
    'a built run.done with a null cursor keeps the last cursor for a reopen before follow.ended',
    async ({ channel, requests, last }) => {
      await tick();
      const follow = channel.followRun(RUN);
      await tick();
      last().push(frame(RUN, { type: 'step.done', cursor: 'last' }));
      last().push(frame(RUN, { type: 'run.done', step: '', attempt: 0, seq: null, cursor: null, status: 'failed' }));
      await tick();
      channel.followRun(OTHER);
      await tick();
      expect(follows(requests[2])).toEqual([`${RUN}:last`, OTHER]);
      expect(types((await drain(follow)).items)).toEqual(['step.done', 'run.done']);
    },
  ],
  [
    'a frame that does not parse, or of a kind this build does not know, is dropped and the stream stays',
    async ({ channel, requests, last }) => {
      await tick();
      const follow = channel.followRun(RUN);
      await tick();
      last().push('event: frame\ndata: {not json\n\n');
      last().push('event: frame\ndata: null\n\n');
      last().push('event: follow.ended\ndata: 7\n\n');
      last().push(frame(RUN, { type: 'step.mystery' }));
      last().push(frame(RUN, { type: 'step.done' }));
      await tick();
      expect(types((await drain(follow)).items)).toEqual(['step.done']);
      expect(requests).toHaveLength(2);
    },
  ],
  [
    'closing the channel ends every follow',
    async ({ channel }) => {
      await tick();
      const follow = channel.followRun(RUN);
      await tick();
      channel.close();
      expect(await drain(follow)).toEqual({ items: [], ended: true });
    },
  ],
];

describe('followRun', () => {
  it.each(channelRows)('%s', async (_name, row) => {
    const h = setup();
    await row(h);
    h.channel.close();
  });
});

const TURN = '0190f0a8-1b2c-7d3e-8f40-0000000000d1';

const turnFrame = (seq: number | null, frame: Record<string, unknown>) =>
  `event: turn\ndata: ${JSON.stringify({ turn: TURN, seq, frame })}\n\n`;

async function drainTurn(follow: TurnFollow): Promise<{ items: TurnFollowItem[]; ended: boolean }> {
  return (await drain(follow as unknown as RunFollow)) as unknown as { items: TurnFollowItem[]; ended: boolean };
}

const turnRows: [string, (h: Harness) => Promise<void>][] = [
  [
    'a turn rides the stream as turn:<id>:<seq> beside a run, and resumes past the last seq it drew',
    async ({ channel, requests, last }) => {
      await tick();
      const turn = channel.followTurn(TURN);
      await tick();
      expect(follows(requests[1])).toEqual([`turn:${TURN}:0`]);
      last().push(turnFrame(1, { type: 'turn_started' }));
      last().push(turnFrame(2, { type: 'text_delta', content: 'Hi' }));
      await tick();
      channel.followRun(RUN);
      await tick();
      expect(follows(requests[2])).toEqual([RUN, `turn:${TURN}:2`]);
      last().push(turnFrame(3, { type: 'done' }));
      last().push(control('follow.ended', `turn:${TURN}:2`));
      expect(await drainTurn(turn)).toEqual({
        items: [
          { type: 'turn', turn: TURN, seq: 1, frame: { type: 'turn_started' } },
          { type: 'turn', turn: TURN, seq: 2, frame: { type: 'text_delta', content: 'Hi' } },
          { type: 'turn', turn: TURN, seq: 3, frame: { type: 'done' } },
          { type: 'follow.ended', follow: `turn:${TURN}:2` },
        ],
        ended: true,
      });
    },
  ],
  [
    'an error frame with a null seq keeps the cursor, and a refusal ends the turn with its reason',
    async ({ channel, requests, last }) => {
      await tick();
      const turn = channel.followTurn(TURN, { after: 4 });
      await tick();
      expect(follows(requests[1])).toEqual([`turn:${TURN}:4`]);
      last().push(turnFrame(null, { type: 'error', code: 'log_unavailable' }));
      last().push(control('follow.refused', `turn:${TURN}:4`, { reason: 'purged' }));
      const { items, ended } = await drainTurn(turn);
      expect(items.map((item) => (item.type === 'turn' ? item.seq : item.type))).toEqual([null, 'follow.refused']);
      expect(items[1]).toEqual({ type: 'follow.refused', follow: `turn:${TURN}:4`, reason: 'purged' });
      expect(ended).toBe(true);
    },
  ],
  [
    'an API older than follows ends a turn unsupported, as it ends a run',
    async ({ channel, answerNext }) => {
      await tick();
      answerNext(() => new Response(null, { status: 400 }));
      const turn = channel.followTurn(TURN);
      const run = channel.followRun(RUN);
      await tick();
      expect((await drainTurn(turn)).items).toEqual([
        { type: 'follow.refused', follow: `turn:${TURN}:0`, reason: 'unsupported' },
      ]);
      expect(types((await drain(run)).items)).toEqual(['follow.refused']);
    },
  ],
  [
    'a turn counts toward the stream\'s follows, and one that is not a UUID is refused without a request',
    async ({ channel, requests }) => {
      await tick();
      for (let i = 0; i < 16; i += 1) channel.followRun(`0190f0a8-1b2c-7d3e-8f40-${String(i).padStart(12, '0')}`);
      expect((await drainTurn(channel.followTurn(TURN))).items).toEqual([
        { type: 'follow.refused', follow: `turn:${TURN}:0`, reason: 'too_many' },
      ]);
      expect((await drainTurn(channel.followTurn('nope'))).items).toEqual([
        { type: 'follow.refused', follow: 'turn:nope:0', reason: 'invalid' },
      ]);
      await tick();
      expect(follows(requests[requests.length - 1]).some((value) => value.startsWith('turn:'))).toBe(false);
    },
  ],
];

describe('followTurn', () => {
  it.each(turnRows)('%s', async (_name, row) => {
    const h = setup();
    await row(h);
    h.channel.close();
  });
});

type Kind = { type: RunFrame['type'] } & Record<string, unknown>;

/** A frame as the reducer receives it, under the root `RUN`. */
function f(
  run: string,
  step: string,
  attempt: number,
  seq: number | null,
  kind: Kind,
  more: Partial<RunFrame> = {},
): RunFrame {
  const base = { run, root: RUN, follow: RUN, step, iteration: null, attempt, segment: 0, seq, cursor: null };
  return { ...base, ...kind, ...more } as RunFrame;
}
const started = (run: string, step: string, attempt: number, more: Partial<RunFrame> = {}) =>
  f(run, step, attempt, 0, { type: 'step.started', node: 'agent', reply: false, streamed: true }, more);
const delta = (
  run: string,
  step: string,
  attempt: number,
  seq: number,
  text: string,
  turn = 1,
  more: Partial<RunFrame> = {},
) => f(run, step, attempt, seq, { type: 'text.delta', text, turn }, more);
const done = (run: string, step: string, attempt: number, seq: number, more: Partial<RunFrame> = {}) =>
  f(run, step, attempt, seq, { type: 'step.done' }, more);
const runDone = (run: string, status: 'completed' | 'failed' | 'cancelled', seq: number | null = 0) =>
  f(run, '', 0, seq, { type: 'run.done', status });

const fold = (items: RunFollowItem[]): RunFramesState =>
  items.reduce<RunFramesState | undefined>(reduceRunFrames, undefined) ?? { runs: {}, lagged: false };
const stepOf = (state: RunFramesState, run: string, step: string, iteration: number | null = null): RunStepState =>
  state.runs[run]!.steps[stepKey(step, iteration)]!;
/** Text, whether it is known, and status of one step. */
const shown = (s: RunStepState) => ({ text: s.text, known: s.textKnown, status: s.status, attempt: s.attempt });

const reducerRows: [string, RunFollowItem[], (state: RunFramesState) => void][] = [
  [
    'a Fork whose branches interleave keeps each step apart',
    [
      started(RUN, 'a', 1),
      started(RUN, 'b', 1),
      delta(RUN, 'a', 1, 1, 'one '),
      delta(RUN, 'b', 1, 1, 'uno '),
      delta(RUN, 'a', 1, 2, 'two'),
      done(RUN, 'b', 1, 2),
      delta(RUN, 'b', 1, 2, 'late'),
    ],
    (state) => {
      expect(shown(stepOf(state, RUN, 'a'))).toEqual({ text: 'one two', known: true, status: 'running', attempt: 1 });
      expect(stepOf(state, RUN, 'b').status).toBe('done');
      expect(Object.keys(state.runs[RUN]!.steps)).toEqual([stepKey('a', null), stepKey('b', null)]);
    },
  ],
  [
    'a For Each item is its own run with its iteration',
    [
      started(CHILD, 'body', 1, { iteration: 0 }),
      started(ITEM_2, 'body', 1, { iteration: 1 }),
      delta(ITEM_2, 'body', 1, 1, 'second', 1, { iteration: 1 }),
      delta(CHILD, 'body', 1, 1, 'first', 1, { iteration: 0 }),
    ],
    (state) => {
      expect(stepOf(state, CHILD, 'body', 0).text).toBe('first');
      expect(stepOf(state, ITEM_2, 'body', 1).text).toBe('second');
    },
  ],
  [
    "a Call child's step that shares the root's step id stays a step of its own run",
    [
      started(RUN, 'draft', 1),
      started(CHILD, 'draft', 1),
      delta(CHILD, 'draft', 1, 1, 'child'),
      delta(RUN, 'draft', 1, 1, 'root'),
    ],
    (state) => {
      expect(stepOf(state, RUN, 'draft').text).toBe('root');
      expect(stepOf(state, CHILD, 'draft').text).toBe('child');
      expect(state.runs[CHILD]!.root).toBe(RUN);
    },
  ],
  [
    'an overtaken attempt: a takeover starts afresh and the stalled attempt is dropped',
    [
      started(RUN, 'draft', 1),
      delta(RUN, 'draft', 1, 1, 'stale '),
      started(RUN, 'draft', 2),
      delta(RUN, 'draft', 1, 2, 'more stale'),
      f(RUN, 'draft', 1, 3, { type: 'step.abandoned' }),
      delta(RUN, 'draft', 2, 1, 'fresh'),
    ],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({ text: 'fresh', known: true, status: 'running', attempt: 2 }),
  ],
  [
    'a later segment starts the words afresh',
    [
      started(RUN, 'reply', 1),
      delta(RUN, 'reply', 1, 1, 'first bubble'),
      delta(RUN, 'reply', 1, 2, 'second bubble', 1, { segment: 1 }),
    ],
    (state) =>
      expect(stepOf(state, RUN, 'reply')).toMatchObject({ text: 'second bubble', segment: 1, textKnown: true }),
  ],
  [
    'an attempt whose start was lost and whose first frame is seq 1 has known text',
    [delta(RUN, 'draft', 1, 1, 'Hello '), delta(RUN, 'draft', 1, 2, 'world')],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({
        text: 'Hello world',
        known: true,
        status: 'running',
        attempt: 1,
      }),
  ],
  [
    'an attempt whose first frame is a delta past seq 1 reads unknown',
    [delta(RUN, 'draft', 1, 2, 'world')],
    (state) => expect(stepOf(state, RUN, 'draft').textKnown).toBe(false),
  ],
  [
    'an attempt whose first frame is an activity past seq 1 reads unknown, whatever deltas follow',
    [f(RUN, 'draft', 1, 3, { type: 'step.activity' }), delta(RUN, 'draft', 1, 4, 'tail only')],
    (state) => expect(stepOf(state, RUN, 'draft')).toMatchObject({ text: 'tail only', textKnown: false }),
  ],
  [
    'an attempt whose first frame is its end past seq 1 reads unknown',
    [done(RUN, 'draft', 1, 7)],
    (state) => expect(stepOf(state, RUN, 'draft')).toMatchObject({ status: 'done', textKnown: false }),
  ],
  [
    'a seq gap inside a streamed attempt reads unknown',
    [started(RUN, 'draft', 1), delta(RUN, 'draft', 1, 1, 'a'), delta(RUN, 'draft', 1, 3, 'c')],
    (state) => expect(stepOf(state, RUN, 'draft').textKnown).toBe(false),
  ],
  [
    "an unstreamed step's end numbered by another process is no gap",
    [
      f(RUN, 'check', 1, 0, { type: 'step.started', node: 'decision', reply: false, streamed: false }),
      f(RUN, 'check', 1, 0, { type: 'step.done' }),
    ],
    (state) => expect(stepOf(state, RUN, 'check')).toMatchObject({ status: 'done', textKnown: true, node: 'decision' }),
  ],
  [
    'a built run.done with a null seq ends the run and opens no gap',
    [
      started(RUN, 'draft', 1),
      delta(RUN, 'draft', 1, 1, 'all'),
      done(RUN, 'draft', 1, 2),
      runDone(RUN, 'failed', null),
    ],
    (state) => {
      expect(state.runs[RUN]!.status).toBe('failed');
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({ text: 'all', known: true, status: 'done', attempt: 1 });
    },
  ],
  [
    "a step.abandoned after run.done is ignored, and a child's frames after the root's run.done still count",
    [
      started(RUN, 'draft', 1),
      runDone(RUN, 'cancelled'),
      f(RUN, 'draft', 1, 1, { type: 'step.abandoned' }),
      started(CHILD, 'inner', 1),
    ],
    (state) => {
      expect(stepOf(state, RUN, 'draft').status).toBe('running');
      expect(state.runs[CHILD]!.status).toBe('running');
      expect(stepOf(state, CHILD, 'inner').status).toBe('running');
    },
  ],
  [
    "a step.abandoned voids its own attempt's words",
    [started(RUN, 'draft', 1), delta(RUN, 'draft', 1, 1, 'gone'), f(RUN, 'draft', 1, 2, { type: 'step.abandoned' })],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({ text: '', known: true, status: 'stopped', attempt: 1 }),
  ],
  [
    'step.activity keeps the last tool label, null for one with none',
    [
      started(RUN, 'draft', 1, { label: 'Drafting' } as Partial<RunFrame>),
      f(RUN, 'draft', 1, 1, { type: 'step.activity', label: 'Looking up the order' }),
      f(RUN, 'draft', 1, 2, { type: 'step.activity' }),
    ],
    (state) => expect(stepOf(state, RUN, 'draft')).toMatchObject({ label: 'Drafting', activity: null }),
  ],
  [
    'follow.lagged marks a running streamed step unknown and the state lagged',
    [started(RUN, 'draft', 1), delta(RUN, 'draft', 1, 1, 'x'), { type: 'follow.lagged', follow: RUN }],
    (state) => {
      expect(state.lagged).toBe(true);
      expect(stepOf(state, RUN, 'draft').textKnown).toBe(false);
    },
  ],
  // An Agent step that parks on a workflow tool and resumes: every dispatch is a new attempt, and a resume replays
  // the saved tape's words as turn 0 right after its start. The stored output is the resumed attempt's text.
  [
    'a park and resume draws the stored output once',
    [
      started(RUN, 'draft', 1),
      delta(RUN, 'draft', 1, 1, 'Let me check. '),
      started(RUN, 'draft', 2),
      delta(RUN, 'draft', 2, 1, 'Let me check. ', 0),
      delta(RUN, 'draft', 2, 2, 'It shipped.', 2),
      done(RUN, 'draft', 2, 3),
    ],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({
        text: 'Let me check. It shipped.',
        known: true,
        status: 'done',
        attempt: 2,
      }),
  ],
  [
    'a park and resume whose second start was lost: the replay at seq 1 still starts afresh',
    [
      started(RUN, 'draft', 1),
      delta(RUN, 'draft', 1, 1, 'Let me check. '),
      delta(RUN, 'draft', 2, 1, 'Let me check. ', 0),
      delta(RUN, 'draft', 2, 2, 'It shipped.', 2),
    ],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({
        text: 'Let me check. It shipped.',
        known: true,
        status: 'running',
        attempt: 2,
      }),
  ],
  [
    'a dispatch retried after a crash mid-call shows the retry alone',
    [
      started(RUN, 'draft', 1),
      delta(RUN, 'draft', 1, 1, 'Half an ans'),
      started(RUN, 'draft', 2),
      delta(RUN, 'draft', 2, 1, 'A whole answer.'),
    ],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({
        text: 'A whole answer.',
        known: true,
        status: 'running',
        attempt: 2,
      }),
  ],
  [
    "a late delta of attempt 1 after attempt 2's start is dropped",
    [
      started(RUN, 'draft', 1),
      started(RUN, 'draft', 2),
      delta(RUN, 'draft', 1, 1, 'stale'),
      delta(RUN, 'draft', 2, 1, 'new'),
    ],
    (state) => expect(stepOf(state, RUN, 'draft').text).toBe('new'),
  ],
  [
    'a resume whose start and replay were both lost reads unknown',
    [
      started(RUN, 'draft', 1),
      delta(RUN, 'draft', 1, 1, 'Let me check. '),
      delta(RUN, 'draft', 2, 3, 'It shipped.', 3),
    ],
    (state) =>
      expect(shown(stepOf(state, RUN, 'draft'))).toEqual({
        text: 'It shipped.',
        known: false,
        status: 'running',
        attempt: 2,
      }),
  ],
];

describe('reduceRunFrames', () => {
  it.each(reducerRows)('%s', (_name, items, check) => check(fold(items)));

  it('leaves the state it was given as it was', () => {
    const before = fold([started(RUN, 'draft', 1)]);
    const snapshot = JSON.stringify(before);
    reduceRunFrames(before, delta(RUN, 'draft', 1, 1, 'x'));
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

describe('the channel type', () => {
  it('is still a RealtimeChannel, and a RealtimeChannel with only its own members still compiles', () => {
    const auth = proxyAdapter();
    const fetch = async () => new Response(null, { status: 502 });
    const channel = createRealtimeChannel({
      baseUrl: BASE,
      auth,
      client: createAgentFlowClient({ baseUrl: BASE, auth, fetch }),
      fetch,
    });
    const narrow: RealtimeChannel = channel;
    expectTypeOf(channel).toMatchTypeOf<RealtimeChannel & RunFollower>();
    const fake: RealtimeChannel = {
      status: () => 'live',
      onStatus: () => () => undefined,
      onEvent: () => () => undefined,
      onRefetch: () => () => undefined,
      onPresence: () => () => undefined,
      onRevoked: () => () => undefined,
      watch: () => undefined,
      retry: () => undefined,
      close: () => undefined,
    };
    expectTypeOf(fake).not.toHaveProperty('followRun');
    expectTypeOf(fake).not.toHaveProperty('followTurn');
    narrow.close();
  });
});
