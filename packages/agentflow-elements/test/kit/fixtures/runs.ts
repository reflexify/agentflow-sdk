import type { RunFollowItem } from '@reflexify/agentflow-sdk';

// Recorded runs for `af-run-stream`, as a follow yields them: the unit tests, the gallery and the browser e2e play the same ones.

export const ROOT = '0190c0de-0000-7000-8000-00000000a000';

interface At { run?: string; iteration?: number | null; attempt?: number; segment?: number; seq?: number | null }

/** Builds a run's frames, numbering `seq` per run, step, iteration and attempt as the bus does. */
export function recorder(follow = ROOT) {
  const seqs = new Map<string, number>();
  const base = (step: string, at: At, first: boolean) => {
    const run = at.run ?? follow;
    const iteration = at.iteration ?? null;
    const attempt = at.attempt ?? 1;
    const key = `${run} ${step} ${iteration} ${attempt}`;
    const seq = at.seq !== undefined ? at.seq : first ? 0 : (seqs.get(key) ?? 0) + 1;
    if (seq !== null) seqs.set(key, seq);
    return { run, root: follow, follow, step, iteration, attempt, segment: at.segment ?? 0, seq, cursor: seq === null ? null : `c-${key}-${seq}` };
  };
  return {
    started: (step: string, node: string, more: At & { label?: string; streamed?: boolean } = {}): RunFollowItem => ({
      ...base(step, more, true), type: 'step.started', label: more.label, reply: false, node, streamed: more.streamed ?? false,
    }),
    delta: (step: string, text: string, more: At = {}): RunFollowItem => ({ ...base(step, more, false), type: 'text.delta', text }),
    activity: (step: string, label?: string, more: At = {}): RunFollowItem => ({ ...base(step, more, false), type: 'step.activity', label }),
    done: (step: string, more: At = {}): RunFollowItem => ({ ...base(step, more, false), type: 'step.done' }),
    abandoned: (step: string, more: At = {}): RunFollowItem => ({ ...base(step, more, false), type: 'step.abandoned' }),
    runDone: (status: 'completed' | 'failed' | 'cancelled', more: { run?: string; built?: boolean } = {}): RunFollowItem => ({
      run: more.run ?? follow, root: follow, follow, step: '', iteration: null, attempt: 0, segment: 0,
      seq: more.built ? null : 0, cursor: more.built ? null : `c-${more.run ?? follow}-done`, type: 'run.done', status,
    }),
    ended: (): RunFollowItem => ({ type: 'follow.ended', follow }),
    lagged: (): RunFollowItem => ({ type: 'follow.lagged', follow }),
    refused: (reason: 'invalid' | 'too_many' | 'not_found' | 'unsupported'): RunFollowItem => ({ type: 'follow.refused', follow, reason }),
  };
}

/** The draft step's words, as the model wrote them. */
export const DRAFT_WORDS = ['Dear Ms. Lan, ', 'your **order 1042** ', 'ships on Monday. ', 'We are sorry ', 'for the wait.'];

/** Three steps in turn: a record read, an Agent step that calls a tool and writes its words, a notification; then the outcome. */
export function threeSteps(): RunFollowItem[] {
  const r = recorder();
  return [
    r.started('load', 'entity_record', { label: 'Load the order' }),
    r.done('load'),
    r.started('draft', 'agent', { label: 'Draft the reply', streamed: true }),
    r.activity('draft', 'Looking up the shipment'),
    ...DRAFT_WORDS.map((w) => r.delta('draft', w)),
    r.done('draft'),
    r.started('notify', 'notify', { label: 'Tell the customer' }),
    r.done('notify'),
    r.runDone('completed'),
    r.ended(),
  ];
}

/** A For Each of `count` items, each its own run with one step. */
export function forEach(count: number): RunFollowItem[] {
  const r = recorder();
  const items: RunFollowItem[] = [r.started('each', 'for_each', { label: 'Check each invoice' })];
  for (let i = 0; i < count; i++) {
    const run = `0190c0de-0000-7000-8000-0000000001${String(i).padStart(2, '0')}`;
    items.push(r.started('check', 'code', { run, iteration: i, label: 'Check the total' }), r.done('check', { run, iteration: i }), r.runDone('completed', { run }));
  }
  items.push(r.done('each'), r.runDone('completed'), r.ended());
  return items;
}

/** A source that yields `items` with `gap` ms between them, then ends. */
export function played(items: readonly RunFollowItem[], gap = 0): AsyncIterable<RunFollowItem> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const item of items) {
        if (gap > 0) await new Promise((done) => setTimeout(done, gap));
        yield item;
      }
    },
  };
}

/** A source the test feeds one item at a time. */
export function fed(): { source: AsyncIterable<RunFollowItem>; push(...items: RunFollowItem[]): void; end(): void } {
  const queue: RunFollowItem[] = [];
  let wake: (() => void) | null = null;
  let over = false;
  return {
    source: {
      async *[Symbol.asyncIterator]() {
        for (;;) {
          while (queue.length > 0) yield queue.shift()!;
          if (over) return;
          await new Promise<void>((done) => (wake = done));
        }
      },
    },
    push(...items) {
      queue.push(...items);
      wake?.();
    },
    end() {
      over = true;
      wake?.();
    },
  };
}
