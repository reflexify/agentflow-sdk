export type RunDoneStatus = 'completed' | 'failed' | 'cancelled';
/** What every frame of a followed run carries, whatever its kind. */
export interface RunFrameBase {
    /** The run that published the frame: the followed run, or a run under it. */
    run: string;
    /** The followed run's root, or the run itself when nothing started it. */
    root?: string;
    /** The followed run, as `followRun` was given it. */
    follow: string;
    /** The step's id; empty on `run.done`. */
    step: string;
    /** The For Each item of the run that published the frame; null outside a For Each. */
    iteration: number | null;
    /** Rises with each attempt at the step: a retry, a resume after a park, a takeover. */
    attempt: number;
    segment: number;
    /** 0 at `step.started`, then one more per frame of the same run, step, iteration and attempt; null on a `run.done` built from the run's row. */
    seq: number | null;
    /** Opaque: where to resume just past this frame. Null on a `run.done` built from the run's row. */
    cursor: string | null;
}
export type RunFrame = RunFrameBase & ({
    type: 'step.started';
    label?: string;
    reply: boolean;
    node?: string;
    streamed: boolean;
} | {
    type: 'text.delta';
    text: string;
    turn?: number;
} | {
    type: 'step.activity';
    label?: string;
} | {
    type: 'step.done';
} | {
    type: 'step.abandoned';
} | {
    type: 'run.done';
    status: RunDoneStatus;
});
export type FollowRefusal = 'invalid' | 'too_many' | 'not_found' | 'unsupported';
/**
 * The follow's own news. `follow` is the value as it was sent. After `follow.refused` or `follow.ended` the follow
 * yields nothing more. At `follow.lagged` frames were lost and the follow goes on: read the stored run.
 */
export type FollowState = {
    type: 'follow.refused';
    follow: string;
    reason: FollowRefusal;
} | {
    type: 'follow.ended';
    follow: string;
} | {
    type: 'follow.lagged';
    follow: string;
};
export type RunFollowItem = RunFrame | FollowState;
/** A run's frames as they arrive. Ends after `follow.ended` or `follow.refused`, or when the channel stops. */
export interface RunFollow extends AsyncIterable<RunFollowItem> {
    /** Drops the follow's frames at once and ends the iteration. */
    close(): void;
}
export interface RunFollower {
    /**
     * Follows a run on the channel's stream: its steps' starts and ends, an Agent step's words as the model writes
     * them, and its end. A run that no other run started brings the runs under it too, each frame naming its own `run`.
     * `after` resumes just past a frame's `cursor`. Read a step's output from the stored run at `run.done`: an Agent
     * step's `step.done` can arrive before its output is stored.
     */
    followRun(runId: string, options?: {
        after?: string;
    }): RunFollow;
}
export type RunStepStatus = 'running' | 'done' | 'stopped';
export interface RunStepState {
    step: string;
    iteration: number | null;
    attempt: number;
    segment: number;
    status: RunStepStatus;
    node?: string;
    label?: string;
    reply: boolean;
    streamed: boolean;
    /** The last workflow tool call's label: `null` for a call with none, absent before the first call. */
    activity?: string | null;
    /** The attempt's words so far. */
    text: string;
    /** False when some of the attempt's words were lost: read the stored run for its text. */
    textKnown: boolean;
    /** The last `seq` seen in this attempt. */
    seq: number | null;
}
export interface RunFramesRun {
    run: string;
    root?: string;
    status: 'running' | RunDoneStatus;
    /** Keyed by `stepKey(step, iteration)`, in the order each step first appeared. */
    steps: Readonly<Record<string, RunStepState>>;
}
export interface RunFramesState {
    /** Keyed by run id, in the order each run first appeared. */
    runs: Readonly<Record<string, RunFramesRun>>;
    /** A `follow.lagged` arrived: frames were lost, so read the stored run. */
    lagged: boolean;
}
/** The key of a step in `RunFramesRun.steps`. */
export declare function stepKey(step: string, iteration: number | null): string;
/**
 * Folds one item of a followed run into each step's live state and each run's outcome, returning a new state and
 * leaving `state` as it was. For each run, step and iteration it keeps the highest attempt and drops every frame of
 * a lower one, and a higher attempt, or a later segment, starts the step's words afresh: every dispatch of an Agent
 * step is a new attempt, and one that resumes a saved tape replays its earlier words after its start. The words are
 * known while the attempt's frames arrive from `seq` 1 with no gap; a first frame past `seq` 1, a gap, or
 * `follow.lagged` marks them unknown. A run's frames after its `run.done` are ignored.
 */
export declare function reduceRunFrames(state: RunFramesState | undefined, item: RunFollowItem): RunFramesState;
//# sourceMappingURL=frames.d.ts.map