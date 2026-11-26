import { type FollowRefusal, type RunDoneStatus, type RunFollowItem, type RunFramesState, type RunStepStatus } from '@reflexify/agentflow-sdk';
import { type KitStrings } from './text.js';
export type { RunDoneDetail, RunFollowDetail } from './element-types.js';
/** A step's title for `af-run-stream`, by the step's id in the followed run's workflow. */
export interface RunStreamStep {
    id: string;
    title: string;
}
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
export declare class RunSourceReader {
    snapshot: RunSourceSnapshot;
    private readonly listeners;
    private count;
    constructor(source: AsyncIterable<RunFollowItem>);
    subscribe(listener: Listener): () => void;
    private read;
    private apply;
    private place;
    private tell;
}
/** The one reader of `source`. */
export declare function readerOf(source: AsyncIterable<RunFollowItem>): RunSourceReader;
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
    items: {
        total: number;
        done: number;
        running: number;
        failed: number;
    } | null;
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
/** Folds a snapshot into what the element draws: the followed run's steps in the order they first appeared, each with the runs it started. */
export declare function drawStream(snapshot: RunSourceSnapshot, steps: readonly RunStreamStep[] | null, text: Required<KitStrings>, locale: string | null): DrawnStream;
/** What the live region says for a change: each step of the followed run that ended, then the run's end. Never a word. */
export declare function announcements(stream: DrawnStream, said: Set<string>, text: Required<KitStrings>): string[];
export declare function outcomeText(status: RunDoneStatus, text: Required<KitStrings>): string;
//# sourceMappingURL=run-stream.d.ts.map