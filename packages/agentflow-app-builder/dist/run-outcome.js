import { at, clip, isObject, onlyMembers, refuse, translate } from "./core.js";
// A run-outcome trigger starts its workflow, a cleanup, when a top-level run of a workflow it watches ends badly.
export const RUN_OUTCOME = "run_outcome";
export const RUN_OUTCOME_PLATFORM = "2027.11";
export const RUN_OUTCOMES = ["failed", "paused_on_access", "cancelled"];
const DEFAULT_OUTCOMES = ["failed"];
// A watched workflow is written as `${workflow:<key>}`, as a Call step or an action names one, or as its bare key, as
// the trigger's own `workflow` is.
function watchedKey(value, workflowKeys, where, pointer) {
    if (typeof value !== "string")
        refuse(where, pointer, "a workflow of the package, as ${workflow:<key>} or its key");
    const written = translate(value, where, pointer);
    const key = written.startsWith("@obj:workflow:") ? written.slice("@obj:workflow:".length) : written.startsWith("@") ? undefined : written;
    if (key === undefined || !workflowKeys.has(key))
        refuse(where, pointer, `${clip(value)} is not a workflow of the package`);
    return key;
}
function list(value, where, pointer) {
    if (!Array.isArray(value) || value.length === 0)
        refuse(where, pointer, "a list of at least one");
    return value;
}
function onlyOnce(items, where, pointer) {
    items.forEach((item, i) => {
        if (items.indexOf(item) !== i)
            refuse(where, at(pointer, i), `${String(item)} is listed twice`);
    });
    return items;
}
export function runOutcomeWatch(name, trigger, workflowKeys) {
    const where = `trigger ${name}`;
    const config = trigger.config;
    if (!isObject(config))
        refuse(where, "/config", "an object with workflows and, optionally, outcomes");
    onlyMembers(config, ["workflows", "outcomes"], where, "/config");
    const watched = onlyOnce(list(config.workflows, where, "/config/workflows").map((w, i) => watchedKey(w, workflowKeys, where, at("/config/workflows", i))), where, "/config/workflows");
    const written = config.outcomes === undefined ? DEFAULT_OUTCOMES : list(config.outcomes, where, "/config/outcomes");
    const outcomes = onlyOnce(written.map((o, i) => {
        if (!RUN_OUTCOMES.includes(o))
            refuse(where, at("/config/outcomes", i), `${clip(String(o))} is not an outcome: ${RUN_OUTCOMES.join(", ")}`);
        return o;
    }), where, "/config/outcomes");
    return { watched, outcomes: [...outcomes].sort() };
}
const runOutcomeTriggers = (triggers) => Object.keys(triggers)
    .sort()
    .filter((name) => triggers[name].kind === RUN_OUTCOME)
    .map((name) => [name, triggers[name]]);
export const holdsRunOutcome = (triggers) => runOutcomeTriggers(triggers).length > 0;
// One line per watched workflow that a run-outcome trigger of the package starts, as AgentFlow's lint warns
// (run_outcome_watches_cleanup): a run such a trigger starts never fires one, and while a workflow's trigger is on a hand
// start or an entity action's launch is refused with WORKFLOW_STARTS_FROM_TRIGGER, so only a batch run over records
// starts it.
export function runOutcomeWarnings(triggers, workflowKeys) {
    const watching = runOutcomeTriggers(triggers);
    const starter = new Map(watching.map(([name, t]) => [t.workflow, name]));
    return watching.flatMap(([name, t]) => runOutcomeWatch(name, t, workflowKeys).watched.flatMap((key) => {
        const by = starter.get(key);
        if (by === undefined)
            return [];
        const [how, so] = by === name
            ? ["the workflow it starts itself", `"${name}" fires for it only for a batch run's runs`]
            : [`which trigger "${by}" starts when a run ends badly`, `"${name}" fires for it only while "${by}" is off, or for a batch run's runs`];
        return [
            `trigger "${name}": watches ${key}, ${how}. A run a run-outcome trigger starts never fires one, and while "${by}" is on nobody starts ${key} by hand except as a batch run over records, so ${so}: leave ${key} out of config.workflows`,
        ];
    }));
}
// What a built workflow's runs are about, as its start step declares it. A start that declares no subject can still be
// handed one by a dispatcher, so nothing is known of its runs.
function subjectOf(body) {
    const start = body.nodes.find((n) => n.node_type === "start");
    const declared = start?.parameters?.inputContract?.subject;
    if (!isObject(declared))
        return "undecided";
    if (declared.kind === "entity") {
        if (declared.arity === "multiple")
            return "set";
        return typeof declared.entityId === "string" ? { record: declared.entityId } : "undecided";
    }
    return declared.kind === "external" ? "external" : "undecided";
}
const entityName = (sentinel) => sentinel.replace(/^@[a-z.]+:entity:/, "");
const described = (subject) => typeof subject === "object" ? `a record of ${entityName(subject.record)}` : subject === "set" ? "a set of records" : "an external object";
// Refuses a run-outcome trigger whose cleanup's start refuses every fire with SUBJECT_BINDING_MISMATCH, as AgentFlow's
// lint does (run_outcome_subject_mismatch). A fire hands the cleanup the ended run's record, or nothing. A start that
// takes a set refuses every fire. One that takes an external object refuses each fire of a watched workflow whose runs
// are about a record, and starts with no subject otherwise. One that takes a record of one entity refuses each fire of a
// watched workflow whose runs are about another entity's record or a set. A watched workflow that declares an external
// object is judged against neither: started by hand with no subject, its run takes the first record it creates as its
// subject, and that record is handed on. Starts are compared by the entity reference each writes.
export function checkRunOutcomeSubjects(triggers, workflows) {
    const keys = new Set(workflows.keys());
    for (const [name, t] of runOutcomeTriggers(triggers)) {
        const where = `trigger ${name}`;
        const takes = subjectOf(workflows.get(t.workflow));
        if (takes === "undecided")
            continue;
        if (takes === "set") {
            refuse(where, "/workflow", `${t.workflow}'s start takes a set of records, and the trigger starts it about the ended run's record or about nothing, so every start fails with SUBJECT_BINDING_MISMATCH: declare one record of an entity, an external object, or no subject, on ${t.workflow}'s start`);
        }
        runOutcomeWatch(name, t, keys).watched.forEach((key, i) => {
            const about = subjectOf(workflows.get(key));
            if (about === "undecided" || about === "external")
                return;
            if (takes === "external" ? typeof about !== "object" : typeof about === "object" && about.record === takes.record)
                return;
            refuse(where, at("/config/workflows", i), `runs of ${key} are about ${described(about)}, and ${t.workflow}'s start takes ${described(takes)}, so every start the trigger makes for ${key} fails with SUBJECT_BINDING_MISMATCH: watch ${key} from a trigger whose workflow takes what its runs are about, or declare no subject on ${t.workflow}'s start`);
        });
    }
}
//# sourceMappingURL=run-outcome.js.map