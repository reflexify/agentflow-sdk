/** The key of a step in `RunFramesRun.steps`. */
export function stepKey(step, iteration) {
    return `${iteration ?? '-'}:${step}`;
}
const EMPTY = { runs: {}, lagged: false };
function laggedState(state) {
    const runs = {};
    for (const [id, run] of Object.entries(state.runs)) {
        let steps;
        for (const [key, step] of Object.entries(run.steps)) {
            if (step.status !== 'running' || !step.streamed || !step.textKnown)
                continue;
            steps ??= { ...run.steps };
            steps[key] = { ...step, textKnown: false };
        }
        runs[id] = steps ? { ...run, steps } : run;
    }
    return { runs, lagged: true };
}
/**
 * Folds one item of a followed run into each step's live state and each run's outcome, returning a new state and
 * leaving `state` as it was. For each run, step and iteration it keeps the highest attempt and drops every frame of
 * a lower one, and a higher attempt, or a later segment, starts the step's words afresh: every dispatch of an Agent
 * step is a new attempt, and one that resumes a saved tape replays its earlier words after its start. The words are
 * known while the attempt's frames arrive from `seq` 1 with no gap; a first frame past `seq` 1, a gap, or
 * `follow.lagged` marks them unknown. A run's frames after its `run.done` are ignored.
 */
export function reduceRunFrames(state, item) {
    const current = state ?? EMPTY;
    switch (item.type) {
        case 'follow.lagged':
            return laggedState(current);
        case 'follow.ended':
        case 'follow.refused':
            return current;
    }
    const frame = item;
    const run = current.runs[frame.run] ?? { run: frame.run, status: 'running', steps: {} };
    if (run.status !== 'running')
        return current;
    const withRun = (next) => ({
        ...current,
        runs: { ...current.runs, [frame.run]: next },
    });
    if (frame.type === 'run.done')
        return withRun({ ...run, root: run.root ?? frame.root, status: frame.status });
    const key = stepKey(frame.step, frame.iteration);
    const previous = run.steps[key];
    if (previous && frame.attempt < previous.attempt)
        return current;
    const fresh = !previous || frame.attempt > previous.attempt;
    let step;
    if (fresh) {
        step = {
            step: frame.step,
            iteration: frame.iteration,
            attempt: frame.attempt,
            segment: frame.segment,
            status: 'running',
            node: previous?.node,
            label: previous?.label,
            reply: previous?.reply ?? false,
            streamed: previous?.streamed ?? false,
            text: '',
            textKnown: true,
            seq: null,
        };
    }
    else if (frame.segment > previous.segment) {
        step = { ...previous, segment: frame.segment, text: '', textKnown: true };
    }
    else {
        step = { ...previous };
    }
    const seq = frame.seq;
    if (seq !== null) {
        if (step.seq === null) {
            // A lost `step.started` alone costs nothing; a first frame past seq 1 means others were lost too.
            if (frame.type !== 'step.started' && seq > 1)
                step.textKnown = false;
        }
        else if ((step.streamed || frame.type === 'text.delta') && seq !== step.seq + 1) {
            step.textKnown = false;
        }
        step.seq = seq;
    }
    switch (frame.type) {
        case 'step.started':
            step.status = 'running';
            step.node = frame.node;
            step.label = frame.label;
            step.reply = frame.reply;
            step.streamed = frame.streamed;
            break;
        case 'text.delta':
            step.streamed = true;
            step.text += frame.text;
            break;
        case 'step.activity':
            step.activity = frame.label ?? null;
            break;
        case 'step.done':
            step.status = 'done';
            break;
        case 'step.abandoned':
            step.status = 'stopped';
            step.text = '';
            step.textKnown = true;
            break;
    }
    return withRun({ ...run, root: run.root ?? frame.root, steps: { ...run.steps, [key]: step } });
}
//# sourceMappingURL=frames.js.map