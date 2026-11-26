import {
  reduceRunFrames,
  type FollowRefusal,
  type RunDoneStatus,
  type RunFollowItem,
  type RunFramesRun,
  type RunFramesState,
  type RunStepStatus,
} from '@reflexify/agentflow-sdk';
import { fill, isVi, type KitStrings } from './text.js';

export type { RunDoneDetail, RunFollowDetail } from './element-types.js';

/** A step's title for `af-run-stream`, by the step's id in the followed run's workflow. */
export interface RunStreamStep { id: string; title: string }

/**
 * The steps that start other runs, whose runs the element draws under them. A frame's `iteration` is set, item 0 included,
 * only on a For Each item's run, so a run with one is a For Each's and a run without one is a Call's or an Agent step's.
 */
const ITEM_PARENTS = new Set(['for_each']);
const RUN_PARENTS = new Set(['call_workflow', 'agent']);
/** A For Each with more items than this draws them as a count. */
const ITEMS_SHOWN = 5;

export interface RunSourceSnapshot {
  state: RunFramesState;
  /** The followed run, as the frames name it; null before the first frame. */
  follow: string | null;
  /** Set once the source said `follow.ended` or `follow.refused`, or stopped. */
  ended: 'ended' | 'refused' | null;
  refusal: FollowRefusal | null;
  /** A run under the followed one, by the step that started it: `<run> <stepKey>`. Chosen when the run first shows a step and such a step is running. */
  parents: Readonly<Record<string, string>>;
  /** Each step's place in the order steps started, by `<run> <stepKey>`: the newest running parent step of the run's kind takes a new run. */
  started: Readonly<Record<string, number>>;
}

type Listener = (item: RunFollowItem | null) => void;

/**
 * Reads one source to its end, whoever draws it. An element that is moved, or drawn again after its source was set, reads
 * the same snapshot rather than a second iteration of the source, which would lose whatever the first had taken.
 */
export class RunSourceReader {
  snapshot: RunSourceSnapshot = { state: { runs: {}, lagged: false }, follow: null, ended: null, refusal: null, parents: {}, started: {} };
  private readonly listeners = new Set<Listener>();
  private count = 0;

  constructor(source: AsyncIterable<RunFollowItem>) {
    void this.read(source);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async read(source: AsyncIterable<RunFollowItem>): Promise<void> {
    try {
      for await (const item of source) {
        this.apply(item);
        if (this.snapshot.ended) return;
      }
    } catch {
      // A source that throws has ended; the page reads the stored run.
    }
    if (!this.snapshot.ended) {
      this.snapshot = { ...this.snapshot, ended: 'ended' };
      this.tell(null);
    }
  }

  private apply(item: RunFollowItem): void {
    const before = this.snapshot;
    const state = reduceRunFrames(before.state, item);
    let { follow, ended, refusal, parents, started } = before;
    if (item.type === 'follow.ended') ended = 'ended';
    else if (item.type === 'follow.refused') {
      ended = 'refused';
      refusal = item.reason;
    } else if (item.type !== 'follow.lagged') follow ??= item.follow;
    if (state !== before.state) ({ parents, started } = this.place(state, before.state, follow, parents, started));
    this.snapshot = { state, follow, ended, refusal, parents, started };
    this.tell(item);
  }

  private place(state: RunFramesState, previous: RunFramesState, follow: string | null, parents: Readonly<Record<string, string>>, started: Readonly<Record<string, number>>) {
    let nextStarted: Record<string, number> | undefined;
    for (const [id, run] of Object.entries(state.runs)) {
      if (run === previous.runs[id]) continue;
      for (const [key, step] of Object.entries(run.steps)) {
        if (step.status !== 'running') continue;
        const was = previous.runs[id]?.steps[key];
        if (was && was.status === 'running' && was.attempt === step.attempt) continue;
        nextStarted ??= { ...started };
        nextStarted[`${id} ${key}`] = ++this.count;
      }
    }
    const order = nextStarted ?? started;
    let nextParents: Record<string, string> | undefined;
    for (const [id, run] of Object.entries(state.runs)) {
      if (id === follow || parents[id] || Object.keys(run.steps).length === 0) continue;
      const parent = newestParent(state, order, id);
      if (!parent) continue;
      nextParents ??= { ...parents };
      nextParents[id] = parent;
    }
    return { parents: nextParents ?? parents, started: order };
  }

  private tell(item: RunFollowItem | null): void {
    for (const listener of this.listeners) listener(item);
  }
}

function newestParent(state: RunFramesState, started: Readonly<Record<string, number>>, child: string): string | null {
  const kinds = itemOf(state.runs[child]!) === null ? RUN_PARENTS : ITEM_PARENTS;
  let best: string | null = null;
  let bestAt = -1;
  for (const [id, run] of Object.entries(state.runs)) {
    if (id === child || run.status !== 'running') continue;
    for (const [key, step] of Object.entries(run.steps)) {
      if (step.status !== 'running' || !step.node || !kinds.has(step.node)) continue;
      const at = started[`${id} ${key}`] ?? 0;
      if (at > bestAt) {
        best = `${id} ${key}`;
        bestAt = at;
      }
    }
  }
  return best;
}

const readers = new WeakMap<object, RunSourceReader>();

/** The one reader of `source`. */
export function readerOf(source: AsyncIterable<RunFollowItem>): RunSourceReader {
  let reader = readers.get(source);
  if (!reader) {
    reader = new RunSourceReader(source);
    readers.set(source, reader);
  }
  return reader;
}

export interface DrawnStep {
  /** `<run> <stepKey>`, unique on the page. */
  key: string;
  title: string;
  status: RunStepStatus;
  attempt: number;
  /** The tool the step is running now: a label, the kit's words for a tool with none, or null for none. */
  activity: string | null;
  /** The words to draw, or null: a step that is not streamed, or whose words were lost and are read from the stored run. */
  text: string | null;
  /** The runs this step started, each with its steps. */
  runs: DrawnRun[];
  /** Set in place of `runs` when a For Each started more than `ITEMS_SHOWN` items. */
  items: { total: number; done: number; running: number; failed: number } | null;
}

export interface DrawnRun {
  run: string;
  /** The For Each item, for a run a For Each started; null otherwise. */
  item: number | null;
  status: 'running' | RunDoneStatus;
  steps: DrawnStep[];
}

export interface DrawnStream {
  /** The followed run, or null before its first frame. */
  root: DrawnRun | null;
  /** Runs under the followed one not yet placed under the step that started them. */
  loose: DrawnRun[];
  outcome: RunDoneStatus | null;
}

const KINDS: Record<'en' | 'vi', Record<string, string>> = {
  en: {
    start: 'Start', end: 'End', human: 'Human task', agent: 'Agent', auto_number: 'Auto number', decision: 'Decision', email: 'Send email',
    webhook: 'Call webhook', document: 'Generate document', for_each: 'For each', group_files: 'Group files', extract_text: 'Doc Extractor',
    signature: 'Signature', fork: 'Fork', join: 'Join', set_variable: 'Set variable', entity_record: 'Entity record', entity_relationship: 'Relationship',
    integration: 'Connected app', sql_query: 'SQL query', call_workflow: 'Call workflow', image: 'Generate image', code: 'Code', learn: 'Learn',
    notify: 'Notify', message: 'Send a message',
  },
  vi: {
    start: 'Bắt đầu', end: 'Kết thúc', human: 'Việc của người', agent: 'Tác tử', auto_number: 'Đánh số tự động', decision: 'Rẽ nhánh', email: 'Gửi email',
    webhook: 'Gọi webhook', document: 'Tạo tài liệu', for_each: 'Lặp từng mục', group_files: 'Gom tệp', extract_text: 'Trích xuất tài liệu',
    signature: 'Ký', fork: 'Tách nhánh', join: 'Gộp nhánh', set_variable: 'Gán biến', entity_record: 'Bản ghi', entity_relationship: 'Quan hệ',
    integration: 'Ứng dụng kết nối', sql_query: 'Truy vấn SQL', call_workflow: 'Gọi quy trình', image: 'Tạo ảnh', code: 'Mã', learn: 'Học',
    notify: 'Thông báo', message: 'Gửi tin nhắn',
  },
};

/** Folds a snapshot into what the element draws: the followed run's steps in the order they first appeared, each with the runs it started. */
export function drawStream(snapshot: RunSourceSnapshot, steps: readonly RunStreamStep[] | null, text: Required<KitStrings>, locale: string | null): DrawnStream {
  const { state, follow, parents } = snapshot;
  const titles = new Map((steps ?? []).map((s) => [s.id, s.title]));
  const kinds = KINDS[isVi(locale) ? 'vi' : 'en'];
  const children = new Map<string, string[]>();
  for (const [child, parent] of Object.entries(parents)) children.set(parent, [...(children.get(parent) ?? []), child]);
  const drawn = new Set<string>();

  const drawRun = (run: RunFramesRun, item: number | null): DrawnRun => {
    drawn.add(run.run);
    const own = run.run === follow;
    return {
      run: run.run,
      item,
      status: run.status,
      steps: Object.entries(run.steps).map(([key, step]) => {
        const global = `${run.run} ${key}`;
        // A step the frames left running in a run that has ended lost its end: the run's outcome says how it went.
        const status: RunStepStatus = step.status === 'running' && run.status !== 'running' ? (run.status === 'completed' ? 'done' : 'stopped') : step.status;
        const under = (children.get(global) ?? []).map((id) => state.runs[id]).filter((r): r is RunFramesRun => !!r);
        const each = step.node === 'for_each';
        const runs = under.map((r) => drawRun(r, each ? itemOf(r) : null));
        if (each) runs.sort((a, b) => (a.item ?? 0) - (b.item ?? 0));
        const items = each && runs.length > ITEMS_SHOWN ? count(runs) : null;
        return {
          key: global,
          title: (own ? titles.get(step.step) : undefined) || step.label || (step.node ? kinds[step.node] : undefined) || step.node || step.step,
          status,
          attempt: step.attempt,
          activity: status === 'running' && step.activity !== undefined ? (step.activity ?? text.runStreamTool) : null,
          text: step.streamed && step.textKnown && step.text ? step.text : null,
          runs: items ? [] : runs,
          items,
        };
      }),
    };
  };

  const rootRun = follow ? state.runs[follow] : undefined;
  const root = rootRun ? drawRun(rootRun, null) : null;
  const loose = Object.values(state.runs)
    .filter((r) => !drawn.has(r.run) && r.run !== follow && Object.keys(r.steps).length > 0)
    .map((r) => drawRun(r, null));
  const outcome = rootRun && rootRun.status !== 'running' ? rootRun.status : null;
  return { root, loose, outcome };
}

function itemOf(run: RunFramesRun): number | null {
  for (const step of Object.values(run.steps)) if (step.iteration !== null) return step.iteration;
  return null;
}

function count(runs: DrawnRun[]) {
  let done = 0;
  let running = 0;
  let failed = 0;
  for (const run of runs) {
    if (run.status === 'running') running++;
    else if (run.status === 'completed') done++;
    else failed++;
  }
  return { total: runs.length, done, running, failed };
}

/** What the live region says for a change: each step of the followed run that ended, then the run's end. Never a word. */
export function announcements(stream: DrawnStream, said: Set<string>, text: Required<KitStrings>): string[] {
  const out: string[] = [];
  for (const step of stream.root?.steps ?? []) {
    if (step.status === 'running') continue;
    const key = `${step.key} ${step.attempt} ${step.status}`;
    if (said.has(key)) continue;
    said.add(key);
    out.push(fill(step.status === 'done' ? text.runStreamStepDone : text.runStreamStepStopped, { step: step.title }));
  }
  if (stream.outcome && !said.has('run')) {
    said.add('run');
    out.push(outcomeText(stream.outcome, text));
  }
  return out;
}

export function outcomeText(status: RunDoneStatus, text: Required<KitStrings>): string {
  return status === 'completed' ? text.runStreamCompleted : status === 'failed' ? text.runStreamFailed : text.runStreamCancelled;
}
