import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RunFollowItem } from '@reflexify/agentflow-sdk';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';
import { DRAFT_WORDS, fed, forEach, played, recorder, threeSteps } from './fixtures/runs.js';

type StreamElement = HTMLElement & { source: AsyncIterable<RunFollowItem> | null; steps: { id: string; title: string }[] | null; locale: string | null };

function draw(props: Partial<StreamElement>) {
  const el = document.createElement('af-run-stream') as StreamElement;
  const heard: { type: string; detail: unknown }[] = [];
  for (const type of ['af-run-done', 'af-run-follow']) el.addEventListener(type, (e) => heard.push({ type, detail: (e as CustomEvent).detail }));
  Object.assign(el, { locale: 'en', ...props });
  document.body.append(el);
  return { el, heard };
}

const parts = (el: Element, name: string) => [...shadow(el).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const words = (node: Element | null) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
/** Each drawn step of the followed run as `title: state`, and `title: state [words]` where it draws words. */
function drawn(el: Element): string[] {
  const list = shadow(el).querySelector('.af-kit > ol.steps');
  return [...(list?.children ?? [])].map((li) => {
    const head = `${words(li.querySelector('[part~="title"]'))}: ${li.getAttribute('data-status')}`;
    const body = [...li.children].find((c) => c.classList.contains('body'));
    const said = [...(body?.children ?? [])].find((c) => c.getAttribute('part') === 'words') as (HTMLElement & { value?: string }) | undefined;
    return said ? `${head} [${said.value}]` : head;
  });
}
/** The runs drawn under each step of the followed run, each as its item's name and its steps' titles. */
function childrenOf(el: Element): Record<string, string[]> {
  const list = shadow(el).querySelector('.af-kit > ol.steps');
  return Object.fromEntries([...(list?.children ?? [])].map((li) => [
    words(li.querySelector('[part~="title"]')),
    [...li.querySelectorAll('[part~="child"]')].map((c) => [...c.querySelectorAll('[part~="item"], [part~="title"]')].map(words).join(' ')),
  ]));
}
const outcome = (el: Element) => words(parts(el, 'outcome')[0] ?? null);
const region = (el: Element) => words(parts(el, 'status')[0] ?? null);

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const R = recorder();
const CHILD = '0190c0de-0000-7000-8000-0000000000c1';

// Each row plays a recorded run into the element and reads what it drew once the source ends.
const ROWS: { name: string; items: RunFollowItem[]; steps: string[]; outcome: string; extra?: (el: StreamElement) => void }[] = [
  {
    name: 'a three-step run: each step done in turn, the second with its words, and the outcome',
    items: threeSteps(),
    steps: ['Load the order: done', `Draft the reply: done [${DRAFT_WORDS.join('')}]`, 'Tell the customer: done'],
    outcome: 'The run completed',
  },
  {
    name: 'a streamed step with activity: the tool it runs now under its title, its words so far, and no outcome yet',
    items: [R.started('draft', 'agent', { label: 'Draft', streamed: true }), R.delta('draft', 'Hello '), R.activity('draft', 'Searching orders'), R.delta('draft', 'there')],
    steps: ['Draft: running [Hello there]'],
    outcome: '',
    extra: (el) => expect(parts(el, 'activity').map(words)).toEqual(['Searching orders']),
  },
  {
    name: 'a tool with no label reads as using a tool',
    items: [R.started('draft', 'agent', { label: 'Draft', streamed: true }), R.activity('draft')],
    steps: ['Draft: running'],
    outcome: '',
    extra: (el) => expect(parts(el, 'activity').map(words)).toEqual(['Using a tool']),
  },
  {
    name: 'a streamed step whose deltas never arrive: its label and state, and no words, not an empty answer',
    items: (() => {
      const r = recorder();
      return [r.started('draft', 'agent', { label: 'Draft', streamed: true }), r.done('draft', { seq: 4 }), r.runDone('completed'), r.ended()];
    })(),
    steps: ['Draft: done'],
    outcome: 'The run completed',
    extra: (el) => expect(parts(el, 'words')).toHaveLength(0),
  },
  {
    name: 'a reader the words are withheld from: the activity past a seq gap draws the title, the tool and the state, and no words or note',
    items: (() => {
      const r = recorder();
      return [r.started('draft', 'agent', { label: 'Draft', streamed: true }), r.activity('draft', 'Searching orders', { seq: 4 })];
    })(),
    steps: ['Draft: running'],
    outcome: '',
    extra: (el) => {
      expect(parts(el, 'activity').map(words)).toEqual(['Searching orders']);
      expect(parts(el, 'words')).toHaveLength(0);
      expect(parts(el, 'note')).toHaveLength(0);
    },
  },
  {
    name: 'a first frame past seq 1 draws no tail as the whole answer',
    items: (() => {
      const r = recorder();
      return [r.delta('draft', 'the end of it', { seq: 3 })];
    })(),
    steps: ['draft: running'],
    outcome: '',
    extra: (el) => expect(parts(el, 'words')).toHaveLength(0),
  },
  {
    name: 'a stopped step and its retry: the abandoned attempt voids its words and the retry draws its own',
    items: (() => {
      const r = recorder();
      return [
        r.started('draft', 'agent', { label: 'Draft', streamed: true }), r.delta('draft', 'half an answ'), r.abandoned('draft'),
        r.started('draft', 'agent', { label: 'Draft', streamed: true, attempt: 2 }), r.delta('draft', 'A whole answer.', { attempt: 2 }),
      ];
    })(),
    steps: ['Draft: running [A whole answer.]'],
    outcome: '',
  },
  {
    name: 'a stopped step with no retry, and the run failed',
    items: (() => {
      const r = recorder();
      return [r.started('draft', 'agent', { label: 'Draft', streamed: true }), r.delta('draft', 'half'), r.abandoned('draft'), r.runDone('failed'), r.ended()];
    })(),
    steps: ['Draft: stopped'],
    outcome: 'The run failed',
    extra: (el) => expect(parts(el, 'words')).toHaveLength(0),
  },
  {
    name: 'a Fork: the branches interleave and each step keeps its own state, in the order each first appeared',
    items: (() => {
      const r = recorder();
      return [
        r.started('split', 'fork'), r.done('split'),
        r.started('a', 'agent', { label: 'Branch A', streamed: true }), r.started('b', 'code', { label: 'Branch B' }),
        r.delta('a', 'from a'), r.done('b'), r.delta('a', ' and more'), r.done('a'),
        r.started('merge', 'join'), r.done('merge'), r.runDone('completed'), r.ended(),
      ];
    })(),
    steps: ['Fork: done', 'Branch A: done [from a and more]', 'Branch B: done', 'Join: done'],
    outcome: 'The run completed',
  },
  {
    name: 'a For Each of 20 items collapses its items to a count',
    items: forEach(20),
    steps: ['Check each invoice: done'],
    outcome: 'The run completed',
    extra: (el) => {
      expect(parts(el, 'items').map(words)).toEqual(['20 items 20 done, 0 running, 0 stopped']);
      expect(parts(el, 'child')).toHaveLength(0);
    },
  },
  {
    name: 'a For Each of three items draws each item with its steps, in item order',
    items: forEach(3),
    steps: ['Check each invoice: done'],
    outcome: 'The run completed',
    extra: (el) => {
      expect(parts(el, 'item').map(words)).toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect(parts(el, 'child').map((c) => words(c.querySelector('[part~="title"]')))).toEqual(['Check the total', 'Check the total', 'Check the total']);
    },
  },
  {
    name: 'a Call child sharing a step id with the root stays a step of its own run',
    items: (() => {
      const r = recorder();
      return [
        r.started('step', 'call_workflow', { label: 'Call the checker' }),
        r.started('step', 'code', { run: CHILD, label: 'Inside the checker' }), r.done('step', { run: CHILD }), r.runDone('completed', { run: CHILD }),
        r.done('step'), r.runDone('completed'), r.ended(),
      ];
    })(),
    steps: ['Call the checker: done'],
    outcome: 'The run completed',
    extra: (el) => expect(parts(el, 'child').map((c) => words(c.querySelector('[part~="title"]')))).toEqual(['Inside the checker']),
  },
  {
    name: 'a Fork running a For Each and a later Agent step: the items, item 0 among them, stay under the For Each',
    items: (() => {
      const r = recorder();
      const items = [r.started('split', 'fork'), r.done('split'), r.started('each', 'for_each', { label: 'Each invoice' }), r.started('ask', 'agent', { label: 'Ask the model', streamed: true })];
      for (let i = 0; i < 3; i++) {
        const run = `0190c0de-0000-7000-8000-0000000002${String(i).padStart(2, '0')}`;
        items.push(r.started('check', 'code', { run, iteration: i, label: 'Check' }), r.done('check', { run, iteration: i }), r.runDone('completed', { run }));
      }
      return items;
    })(),
    steps: ['Fork: done', 'Each invoice: running', 'Ask the model: running'],
    outcome: '',
    extra: (el) => {
      expect(childrenOf(el)).toEqual({ Fork: [], 'Each invoice': ['Item 1 Check', 'Item 2 Check', 'Item 3 Check'], 'Ask the model': [] });
    },
  },
  {
    name: 'a Fork running an Agent step and a later For Each: the Agent step’s tool run, which has no item, stays under the Agent step',
    items: (() => {
      const r = recorder();
      return [
        r.started('split', 'fork'), r.done('split'), r.started('ask', 'agent', { label: 'Ask the model', streamed: true }), r.started('each', 'for_each', { label: 'Each invoice' }),
        r.started('lookup', 'code', { run: CHILD, label: 'Look up' }),
      ];
    })(),
    steps: ['Fork: done', 'Ask the model: running', 'Each invoice: running'],
    outcome: '',
    extra: (el) => expect(childrenOf(el)).toEqual({ Fork: [], 'Ask the model': ['Look up'], 'Each invoice': [] }),
  },
  {
    name: 'a run under the followed one that published nothing but its end is not drawn: the stored run places it',
    items: (() => {
      const r = recorder();
      return [r.started('step', 'call_workflow', { label: 'Call' }), r.runDone('failed', { run: CHILD }), r.abandoned('step'), r.runDone('failed'), r.ended()];
    })(),
    steps: ['Call: stopped'],
    outcome: 'The run failed',
    extra: (el) => expect(parts(el, 'child')).toHaveLength(0),
  },
  {
    name: 'a follow.lagged: a running streamed step drops its words, which the stored run holds, and keeps its state',
    items: (() => {
      const r = recorder();
      return [r.started('load', 'entity_record', { label: 'Load' }), r.done('load'), r.started('draft', 'agent', { label: 'Draft', streamed: true }), r.delta('draft', 'some words'), r.lagged(), r.delta('draft', ' more')];
    })(),
    steps: ['Load: done', 'Draft: running'],
    outcome: '',
    extra: (el) => expect(parts(el, 'words')).toHaveLength(0),
  },
  {
    name: 'a run already over: only its built run.done, then the follow ends',
    items: (() => {
      const r = recorder();
      return [r.runDone('cancelled', { built: true }), r.ended()];
    })(),
    steps: [],
    outcome: 'The run was cancelled',
  },
];

describe('<af-run-stream>', () => {
  for (const row of ROWS) {
    it(row.name, async () => {
      const { el } = draw({ source: played(row.items) });
      await vi.waitFor(() => expect(drawn(el)).toEqual(row.steps), { timeout: 5000 });
      await vi.waitFor(() => expect(outcome(el)).toBe(row.outcome), { timeout: 5000 });
      row.extra?.(el);
    });
  }

  it('titles the followed run’s steps from steps, and only those: a child’s step of the same id keeps its own label', async () => {
    const r = recorder();
    const items = [
      r.started('check', 'call_workflow', { label: 'check' }),
      r.started('check', 'code', { run: CHILD, label: 'Child check' }),
    ];
    const { el } = draw({ source: played(items), steps: [{ id: 'check', title: 'Kiểm tra' }], locale: 'vi' });
    await vi.waitFor(() => expect(drawn(el)).toEqual(['Kiểm tra: running']));
    expect(parts(el, 'child').map((c) => words(c.querySelector('[part~="title"]')))).toEqual(['Child check']);
    expect(words(parts(el, 'state')[0]!)).toBe('Đang chạy');
  });

  it('says each step’s end and the outcome once in the polite region, never a word, and sends af-run-done once with the status', async () => {
    const feed = fed();
    const { el, heard } = draw({ source: feed.source });
    await settle();
    const status = parts(el, 'status')[0]!;
    expect(status.getAttribute('role')).toBe('status');
    const said: string[] = [];
    const items = threeSteps();
    for (const item of items) {
      feed.push(item);
      await new Promise((done) => setTimeout(done, 120));
      if (region(el) && said.at(-1) !== region(el)) said.push(region(el));
    }
    expect(said).toEqual(['Load the order: done', 'Draft the reply: done', 'Tell the customer: done', 'The run completed']);
    for (const word of DRAFT_WORDS) expect(said.join(' ')).not.toContain(word.trim());
    expect(heard).toEqual([{ type: 'af-run-done', detail: { status: 'completed' } }, { type: 'af-run-follow', detail: { state: 'ended' } }]);
  });

  it('says a step’s end again when it reads as the one before: two untitled Agent steps each end in the region', async () => {
    const r = recorder();
    const feed = fed();
    const { el } = draw({ source: feed.source });
    feed.push(r.started('a', 'agent'), r.done('a'));
    await vi.waitFor(() => expect(region(el)).toBe('Agent: done'));
    let changes = 0;
    new MutationObserver((records) => (changes += records.length)).observe(parts(el, 'status')[0]!, { subtree: true, childList: true, characterData: true });
    feed.push(r.started('b', 'agent'), r.done('b'));
    await vi.waitFor(() => expect(changes).toBeGreaterThan(0));
    expect(region(el)).toBe('Agent: done');
  });

  it('sends af-run-done for the followed run only, and af-run-follow for a refusal, drawing a note in place of steps', async () => {
    const r = recorder();
    const child = draw({ source: played([r.started('s', 'call_workflow'), r.started('x', 'code', { run: CHILD }), r.runDone('completed', { run: CHILD })]) });
    await vi.waitFor(() => expect(parts(child.el, 'child')).toHaveLength(1));
    expect(child.heard).toEqual([]);

    const refused = draw({ source: played([recorder().refused('not_found')]) });
    await vi.waitFor(() => expect(parts(refused.el, 'note').map(words)).toEqual(['Live progress is not available for this run.']));
    expect(refused.heard).toEqual([{ type: 'af-run-follow', detail: { state: 'refused', reason: 'not_found' } }]);
  });

  it('reads a source once: an element moved, or a second element given the same source, draws what was read without reading it again', async () => {
    const feed = fed();
    let reads = 0;
    const counted = { [Symbol.asyncIterator]: () => (reads++, feed.source[Symbol.asyncIterator]()) };
    const { el, heard } = draw({ source: counted });
    feed.push(...threeSteps().slice(0, 4));
    await vi.waitFor(() => expect(drawn(el)).toEqual(['Load the order: done', 'Draft the reply: running']));
    el.remove();
    await new Promise((done) => setTimeout(done, 0));
    document.body.append(el);
    const other = draw({ source: counted });
    feed.push(...threeSteps().slice(4));
    await vi.waitFor(() => expect(outcome(el)).toBe('The run completed'));
    await vi.waitFor(() => expect(drawn(other.el)).toEqual(drawn(el)));
    expect(reads).toBe(1);
    expect(heard.filter((h) => h.type === 'af-run-done')).toHaveLength(1);
  });

  it('waits for the run before its first frame, and draws nothing for no source', async () => {
    const feed = fed();
    const { el } = draw({ source: feed.source });
    await vi.waitFor(() => expect(parts(el, 'note').map(words)).toEqual(['Waiting for the run to start']));
    const none = draw({ source: null });
    await new Promise((done) => setTimeout(done, 0));
    expect(shadow(none.el).querySelector('ol')).toBeNull();
    expect(parts(none.el, 'note')).toHaveLength(0);
  });
});
