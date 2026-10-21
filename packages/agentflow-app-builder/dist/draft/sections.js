import { at, isObject, objectPath } from "../core.js";
import { entityPicker } from "./entities.js";
import { parameter, unsentinel, unsupported, shown } from "./unsentinel.js";
const WORKFLOW_MEMBERS = [
    "schemaVersion", "name", "description", "runAs", "exposedSteps", "inputSchema", "outputSchema", "variables",
    "transaction", "start", "end", "nodes", "edges",
];
const TRIGGER_MEMBERS = ["workflow", "kind", "enabled", "config"];
const ACTION_MEMBERS = ["workflow", "label", "scope", "mode", "visible_when", "input_map", "tone", "icon"];
const START_SUFFIX = /^_(?:[2-9]|[1-9][0-9]+)$/;
const M = "manifest.json";
const only = (body, allowed, where) => {
    for (const key of Object.keys(body))
        if (!allowed.includes(key))
            unsupported(where, at("", key), "a member the builder does not write");
};
function workflowOf(value, where, pointer) {
    const m = typeof value === "string" ? /^@obj:workflow:([a-z][a-z0-9_]*)$/.exec(value) : null;
    if (!m)
        unsupported(where, pointer, `not a workflow of the package: ${shown(value)}`);
    return m[1];
}
// The nodes as the builder's input before `finishNode`: a Code step's source back in a file of its own, an
// Email step's connection back as the Resend account it names.
function unfinish(value, workflow, code, where, pointer) {
    if (Array.isArray(value))
        value.forEach((item, i) => unfinish(item, workflow, code, where, at(pointer, i)));
    else if (isObject(value)) {
        const node = value;
        if (typeof node.node_type === "string" && isObject(node.parameters)) {
            const p = node.parameters;
            if (node.node_type === "code" && typeof p.source === "string") {
                const file = `code/${workflow}-${String(node.id)}.js`;
                if (code.has(file) && code.get(file) !== p.source) {
                    unsupported(where, at(at(pointer, "parameters"), "source"), `two Code steps of ${workflow} named ${String(node.id)}`);
                }
                code.set(file, p.source);
                p.source = { $file: file };
            }
            if (node.node_type === "email" && isObject(p.email) && typeof p.email.connection === "string") {
                p.email.connection = { provider: "resend", externalAccountId: p.email.connection };
            }
        }
        for (const [key, item] of Object.entries(node))
            unfinish(item, workflow, code, where, at(pointer, key));
    }
}
function calledBy(value, out) {
    if (typeof value === "string") {
        const m = /^@obj:workflow:([a-z][a-z0-9_]*)$/.exec(value);
        if (m)
            out.add(m[1]);
    }
    else if (Array.isArray(value))
        value.forEach((item) => calledBy(item, out));
    else if (isObject(value))
        Object.values(value).forEach((item) => calledBy(item, out));
}
// The inverse of `startGrants`: `start_<key>`, `start_<key>_2`, … are the start access's groups in order.
function startAccess(draft, key) {
    const groups = [];
    draft.grants.forEach((grant, i) => {
        if (grant.workflow !== `@obj:workflow:${key}`)
            return;
        const here = `/grants/${i}`;
        const suffix = typeof grant.key === "string" && grant.key.startsWith(`start_${key}`) ? grant.key.slice(`start_${key}`.length) : undefined;
        const position = suffix === "" ? 1 : suffix && START_SUFFIX.test(suffix) ? Number(suffix.slice(1)) : 0;
        if (position === 0)
            unsupported(M, at(here, "key"), `a start grant of ${key} is start_${key} or start_${key}_<n>, n from 2`);
        if (Object.keys(grant).sort().join() !== "key,to,workflow")
            unsupported(M, here, "a start grant names only its key, its group and its workflow");
        draft.takeGrant(i);
        groups.push([position, parameter(grant.to, M, at(here, "to"))]);
    });
    groups.sort((a, b) => a[0] - b[0]);
    groups.forEach(([position], i) => {
        if (position !== i + 1)
            unsupported(M, "/grants", `the start grants of ${key} skip start_${key}_${i + 1}`);
    });
    return { mode: "restricted", group_ids: groups.map(([, group]) => group) };
}
// The inverse of `workflowObject` and `startGrants`.
export function workflowSource(draft, key, entities = []) {
    const where = objectPath(`workflow:${key}`);
    const body = draft.take(`workflow:${key}`);
    only(body, WORKFLOW_MEMBERS, where);
    let runAs;
    if (body.runAs === "initiator")
        runAs = { policy: "initiator" };
    else
        runAs = { policy: "service_principal", service_principal_id: parameter(body.runAs, where, "/runAs") };
    const code = new Map();
    const nodes = structuredClone(body.nodes);
    unfinish(nodes, key, code, where, "/nodes");
    const calls = new Set();
    calledBy(body.nodes, calls);
    calls.delete(key);
    const graph = { schemaVersion: body.schemaVersion, start: body.start, end: body.end };
    graph.nodes = unsentinel(nodes, where, "/nodes");
    graph.edges = unsentinel(body.edges, where, "/edges");
    if ("variables" in body)
        graph.variables = unsentinel(body.variables, where, "/variables");
    if ("transaction" in body)
        graph.transaction = body.transaction;
    const source = { key };
    if ("name" in body)
        source.name = body.name;
    if ("description" in body)
        source.description = body.description;
    source.run_as = runAs;
    source.start_access = startAccess(draft, key);
    source.input_schema = "inputSchema" in body ? unsentinel(body.inputSchema, where, "/inputSchema", { "x-entity": entityPicker(entities) }) : null;
    source.output_schema = "outputSchema" in body ? unsentinel(body.outputSchema, where, "/outputSchema") : null;
    source.graph = graph;
    const exposed = Array.isArray(body.exposedSteps) ? body.exposedSteps : [];
    return { key, source, exposed, code, calls };
}
// The inverse of `triggerObject`.
export function triggerSource(draft, name) {
    const where = objectPath(`trigger:${name}`);
    const body = draft.take(`trigger:${name}`);
    only(body, TRIGGER_MEMBERS, where);
    if (!isObject(body.config))
        unsupported(where, "/config", "a trigger's config is an object");
    const connected = body.kind === "connected_app";
    const config = {};
    for (const [key, value] of Object.entries(body.config)) {
        if (connected && key === "account") {
            config.provider = "resend";
            config.external_account_id = parameter(value, where, at("/config", key));
        }
        else
            config[key] = unsentinel(value, where, at("/config", key));
    }
    return { workflow: workflowOf(body.workflow, where, "/workflow"), kind: body.kind, config };
}
// The inverse of `actionObject`, for the action `<entity>/<key>`.
export function actionSource(draft, scoped) {
    const where = objectPath(`entity_action:${scoped}`);
    const body = draft.take(`entity_action:${scoped}`);
    only(body, ACTION_MEMBERS, where);
    const [entity, key] = scoped.split("/");
    const action = { key, workflow_id: unsentinel(body.workflow, where, "/workflow") };
    for (const member of ACTION_MEMBERS.slice(1)) {
        if (member in body)
            action[member] = unsentinel(body[member], where, at("", member));
    }
    return { entity, action };
}
// Publish order: the manifest's order, moved so a workflow comes after every workflow it calls.
export function publishOrder(workflows) {
    const byKey = new Map(workflows.map((w) => [w.key, w]));
    const order = [];
    const state = new Map();
    const visit = (key) => {
        if (state.has(key))
            return;
        state.set(key, 1);
        for (const callee of byKey.get(key)?.calls ?? [])
            if (byKey.has(callee))
                visit(callee);
        state.set(key, 2);
        order.push(key);
    };
    for (const w of workflows)
        visit(w.key);
    return order;
}
//# sourceMappingURL=sections.js.map