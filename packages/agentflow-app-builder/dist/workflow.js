import fs from "node:fs";
import path from "node:path";
import { at, clip, isObject, onlyMembers, parameterOf, refuse, translate } from "./core.js";
import { undeclaredInputs } from "./code-inputs.js";
import { CONFIG_MEMBERS, kindsOf } from "./members.js";
import { xEntity } from "./entity.js";
import { checkConnectionUse } from "./invariants.js";
export const INITIATOR = { policy: "initiator" };
export const NOBODY = { mode: "restricted", group_ids: [] };
export const servicePrincipal = (paramKey) => ({
    policy: "service_principal",
    service_principal_id: `\${param:${paramKey}}`,
});
export const restricted = (...groupParams) => ({
    mode: "restricted",
    group_ids: groupParams.map((p) => `\${param:${p}}`),
});
export const ref = (value) => ({ kind: "reference", value });
export const tpl = (value) => ({ kind: "template", value });
// An empty string is also sent as `valueJson`: a literal whose `value` is blank
// reads as a binding nobody filled in.
export const lit = (v) => typeof v === "string"
    ? v === ""
        ? { kind: "literal", value: v, valueJson: v }
        : { kind: "literal", value: v }
    : { kind: "literal", valueJson: v };
// `copy` gives the record its own copy of a file another record holds; without it such a file is refused.
export const bind = (field, b, options = {}) => ({
    field,
    ...b,
    ...(options.copy ? { copy: true } : {}),
});
export const NOW = tpl("{{ now() }}");
export function node(id, name, nodeType, params, settings) {
    return { id, name, node_type: nodeType, parameters: { id, label: name, ...params }, settings: settings ?? {} };
}
export function start({ subject, params } = {}) {
    return node("start", "Start", "start", {
        inputContract: {
            subject: subject ? { kind: "entity", entityId: subject, arity: "single" } : { kind: "none" },
            params: params ? { kind: "schema" } : { kind: "none" },
        },
    });
}
export function end(id, name, outcome, outputs) {
    const p = {};
    if (outcome)
        p.outcomeLabel = outcome;
    if (outputs)
        p.outputMapping = outputs;
    return node(id, name, "end", p);
}
export const getById = (id, name, entity, idPath) => node(id, name, "entity_record", { operation: "get", entityId: entity, recordIdExpr: ref(idPath) });
export function search(id, name, entity, filters, { sort, dir, limit, fields } = {}) {
    const p = { operation: "search", entityId: entity, filters };
    if (sort)
        p.sort = sort;
    if (dir)
        p.dir = dir;
    if (limit)
        p.limit = limit;
    // Only the named fields come back, and only they count against an agent that reads the result.
    if (fields)
        p.fields = fields;
    return node(id, name, "entity_record", p);
}
export const flt = (field, op, value) => ({ field, op, value });
export const create = (id, name, entity, body) => node(id, name, "entity_record", { operation: "create", entityId: entity, body });
export function update(id, name, entity, idPath, body, { expect, check } = {}) {
    const p = { operation: "update", entityId: entity, recordIdExpr: ref(idPath), body };
    if (expect)
        p.expect = expect;
    if (check)
        p.conversationCheck = check;
    return node(id, name, "entity_record", p);
}
export const updateMany = (id, name, entity, filters, body) => node(id, name, "entity_record", { operation: "update_many", entityId: entity, filters, body });
// A parameter is a whole string value, never part of one. A text parameter that a template needs, such as
// the inbound domain in a Reply-To, is read into a variable by this first step, and the template reads
// `{{ vars.<name> }}`. A variable's declared default is not used because a workflow started by a Call
// Workflow step does not seed its declared variables. The value is a literal, so a name holding `{{` is
// never rendered as a template.
export const readParameters = (...names) => node("params", "Read the app's parameters", "set_variable", {
    assignments: names.map((name) => ({ target: name, kind: "literal", valueJson: `\${param:${name}}` })),
});
export const decision = (id, name, branches) => node(id, name, "decision", { branches });
export const when = (edge, cond) => ({ edgeIds: [edge], when: cond });
export const otherwise = (edge) => ({ edgeIds: [edge], default: true });
const shown = (value) => clip(JSON.stringify(value) ?? String(value));
const wireName = (wire, option) => [wire, `write ${option}, not ${wire}`];
function checkOptions(where, pointer, options, allowed, refused = []) {
    if (!isObject(options))
        refuse(where, pointer, `expected { ${allowed.join(", ")} }, not ${shown(options)}`);
    for (const [member, message] of refused) {
        if (Object.hasOwn(options, member) && !allowed.includes(member))
            refuse(where, at(pointer, member), message);
    }
    onlyMembers(options, allowed, where, pointer);
}
export const doc = {
    template: (id, templateRef, options = {}) => {
        checkOptions("doc.template", "", options, ["fieldMapping", "filename"], [wireName("filenameTemplate", "filename")]);
        const { fieldMapping, filename } = options;
        return {
            id,
            source: "renderDocumentTemplate",
            documentTemplateId: templateRef,
            fieldMapping: fieldMapping ?? {},
            ...(filename === undefined ? {} : { filenameTemplate: filename }),
        };
    },
    upstream: (id, nodeId, documentId) => ({
        id,
        source: "upstreamFile",
        attachment: { nodeId, documentId },
    }),
    review: (id, reviewDocumentId) => ({ id, source: "reviewDocument", reviewDocumentId }),
};
// The platform climbs at most this many supervisors and clamps a larger number silently.
const MAX_MANAGER_LEVELS = 5;
function dynamicSigner(source, relation = { type: "direct" }) {
    const built = { kind: "dynamic", source, relation };
    // Not enumerable: manager builds the signer and is never part of what is written.
    Object.defineProperty(built, "manager", {
        enumerable: false,
        value: (levels) => {
            if (!Number.isInteger(levels) || levels < 1 || levels > MAX_MANAGER_LEVELS) {
                refuse("signer", "/relation/levels", `levels must be a whole number from 1 to ${MAX_MANAGER_LEVELS}, not ${shown(levels)}`);
            }
            return dynamicSigner(source, { type: "manager", levels });
        },
    });
    return built;
}
export const signer = {
    initiator: () => dynamicSigner({ type: "initiator" }),
    field: (path) => {
        if (typeof path !== "string" || path.trim() === "") {
            refuse("signer", "/source/path", `signer.field needs the path of a person field, such as subject.record.owner, not ${shown(path)}`);
        }
        return dynamicSigner({ type: "fieldUser", path });
    },
    stepActor: (nodeId) => {
        if (typeof nodeId !== "string" || nodeId.trim() === "") {
            refuse("signer", "/source/nodeId", `signer.stepActor needs the id of an earlier step, not ${shown(nodeId)}`);
        }
        return dynamicSigner({ type: "taskActor", nodeId });
    },
    previousActor: () => dynamicSigner({ type: "previousTaskActor" }),
    user: (paramKey) => ({ kind: "user", id: `\${param:${paramKey}}` }),
};
const SIGNING_METHODS = ["server_email", "client_cert"];
const SIGNING_ROUTINGS = ["parallel", "sequential"];
function oneOf(where, pointer, member, allowed, value) {
    if (typeof value !== "string" || !allowed.includes(value)) {
        refuse(where, pointer, `${member} must be ${allowed.map((a) => `"${a}"`).join(" or ")}, not ${shown(value)}`);
    }
}
function checkDocuments(where, pointer, documents, signatureStep) {
    if (!Array.isArray(documents))
        refuse(where, pointer, "documents must be a list of doc.template(...), doc.upstream(...) or doc.review(...)");
    if (signatureStep && documents.length === 0) {
        refuse(where, pointer, "a Signature step signs at least one document: pass doc.template(...) or doc.upstream(...)");
    }
    const seen = new Set();
    documents.forEach((document, i) => {
        if (signatureStep && document?.source === "reviewDocument") {
            refuse(where, at(pointer, i), "doc.review reads a Human step's review document, which a Signature step has none of: use doc.template or doc.upstream");
        }
        if (seen.has(document?.id))
            refuse(where, at(at(pointer, i), "id"), `document id ${document.id} is used twice; each document needs its own id`);
        seen.add(document?.id);
    });
}
function declineRoute(where, pointer, decline, withAction) {
    if (decline === undefined || decline === "fail")
        return undefined;
    const allowed = withAction ? '"fail", { edge: "<edge id>" } or { action: "<action id>" }' : '"fail" or { edge: "<edge id>" }';
    const keys = decline && typeof decline === "object" && !Array.isArray(decline) ? Object.keys(decline) : [];
    if (!withAction && keys.length === 1 && keys[0] === "action") {
        refuse(where, pointer, `a Signature step declines to ${allowed}; { action } belongs to a Human step's signing()`);
    }
    if (keys.length !== 1 || !(keys[0] === "edge" || (withAction && keys[0] === "action"))) {
        refuse(where, pointer, `onDecline must be ${allowed}, not ${shown(decline)}; the builder has no "continue"`);
    }
    const key = keys[0];
    const id = decline[key];
    if (typeof id !== "string" || id === "") {
        refuse(where, pointer, `onDecline { ${key} } names ${key === "edge" ? "an edge" : "an action"} id, not ${shown(id)}`);
    }
    return key === "edge" ? { kind: "branch", edgeIds: [id] } : { kind: "action", actionId: id };
}
export function signature(id, name, options) {
    const where = `signature step ${id}`;
    const base = "/parameters";
    checkOptions(where, base, options, ["documents", "signers", "method", "routing", "onDecline", "certVisible", "task"], [
        wireName("signingMethod", "method"),
        wireName("taskName", "task: { name }"),
        wireName("taskDescription", "task: { description }"),
        [
            "failOnSignerFailure",
            "the builder never writes failOnSignerFailure: a Signature step fails when its envelope fails, and onDecline: { edge } routes a decline",
        ],
    ]);
    const { documents, signers, method, routing, onDecline, certVisible, task } = options;
    checkDocuments(where, at(base, "documents"), documents, true);
    if (!Array.isArray(signers) || signers.length === 0) {
        refuse(where, at(base, "signers"), "a Signature step needs at least one signer: { role, who: signer.initiator() }");
    }
    if (method !== undefined)
        oneOf(where, at(base, "signingMethod"), "method", SIGNING_METHODS, method);
    if (routing !== undefined)
        oneOf(where, at(base, "routing"), "routing", SIGNING_ROUTINGS, routing);
    const route = declineRoute(where, at(base, "onDecline"), onDecline, false);
    const roles = new Set();
    if (task !== undefined)
        checkOptions(where, at(base, "task"), task, ["name", "description"]);
    const written = signers.map((entry, i) => {
        const here = at(at(base, "signers"), i);
        checkOptions(where, here, entry, ["role", "who", "order"], [
            wireName("roleKey", "role"),
            wireName("routingOrder", "order"),
            wireName("recipient", "who"),
            wireName("signer", "who"),
        ]);
        const { role, who, order } = entry;
        if (typeof role !== "string" || role.trim() === "") {
            refuse(where, at(here, "roleKey"), "a signer's role is the template's signature-block role, and cannot be empty");
        }
        if (!isObject(who) || (who.kind !== "user" && who.kind !== "dynamic")) {
            refuse(where, at(here, "recipient"), `a signer's who is signer.initiator(), signer.field(path), signer.stepActor(nodeId), signer.previousActor() or signer.user(paramKey), not ${shown(who)}`);
        }
        if (roles.has(role))
            refuse(where, at(here, "roleKey"), `role ${role} is used twice; each signer needs its own role`);
        roles.add(role);
        if (order === undefined && routing === "sequential") {
            refuse(where, at(here, "routingOrder"), "sequential routing needs each signer's order, a positive whole number: { role, who, order: 1 }");
        }
        if (order !== undefined && (!Number.isInteger(order) || order < 1)) {
            refuse(where, at(here, "routingOrder"), `order must be a positive whole number, not ${shown(order)}`);
        }
        return {
            roleKey: role,
            routingOrder: order ?? 1,
            recipient: { kind: "internal", assignment: { candidates: [who] } },
        };
    });
    return node(id, name, "signature", {
        documents,
        signers: written,
        signingMethod: method ?? "server_email",
        routing: routing ?? "parallel",
        ...(certVisible === undefined ? {} : { certVisible }),
        ...(route ? { onDecline: route } : {}),
        ...(task?.name === undefined ? {} : { taskName: task.name }),
        ...(task?.description === undefined ? {} : { taskDescription: task.description }),
    });
}
export function signing(options = {}) {
    const where = "signing";
    checkOptions(where, "", options, ["documents", "method", "certVisible", "signedAction", "onDecline"], [
        wireName("signingMethod", "method"),
        wireName("signedActionId", "signedAction"),
    ]);
    const { documents, method, certVisible, signedAction, onDecline } = options;
    checkDocuments(where, "/documents", documents ?? [], false);
    if (method !== undefined)
        oneOf(where, "/signingMethod", "method", SIGNING_METHODS, method);
    const route = declineRoute(where, "/onDecline", onDecline, true);
    if (signedAction !== undefined && typeof onDecline === "object" && "action" in onDecline && onDecline.action === signedAction) {
        refuse(where, "/onDecline", `onDecline { action } names ${shown(signedAction)}, which is the signedAction; a decline takes another action`);
    }
    return {
        documents: documents ?? [],
        signingMethod: method ?? "server_email",
        ...(certVisible === undefined ? {} : { certVisible }),
        ...(signedAction === undefined ? {} : { signedActionId: signedAction }),
        ...(route ? { onDecline: route } : {}),
    };
}
export const signedFiles = (stepId) => ref(`nodes.${stepId}.output.generated_files`);
export const signingStatus = (stepId) => ref(`nodes.${stepId}.output.status`);
export const setvar = (id, name, assignments) => node(id, name, "set_variable", { assignments: assignments.map(([target, b]) => ({ target, ...b })) });
// `subjectSource` is a path the engine reads as the called run's record id. Any other shape builds and installs, and
// then fails the step on every run, so it is refused here.
export function call(id, name, workflow, subjectSource, inputs = [], settings) {
    if (subjectSource != null && typeof subjectSource !== "string") {
        refuse(`call step ${id}`, "/parameters/subjectSource", `subjectSource is the path of the called run's record id, such as "subject.record_id" or "nodes.<id>.output.record.id", or leave it out to pass the caller's own record; not ${shown(subjectSource)}`);
    }
    const p = { workflowId: workflow, inputBindings: inputs.map(([target, b]) => ({ target, ...b })) };
    if (subjectSource)
        p.subjectSource = subjectSource;
    return node(id, name, "call_workflow", p, settings);
}
export const code = (id, name, file, inputs, outputSchema) => node(id, name, "code", {
    language: "javascript",
    source: { $file: file },
    inputs: inputs.map(([n, b]) => ({ name: n, ...b })),
    outputSchema,
    timeoutSecs: 10,
});
// The first platform month whose builds read a package's notification kinds and its Notify steps.
export const NOTIFICATIONS_PLATFORM = "2026.11";
export const recipient = {
    field: (path) => ({ type: "field", path }),
    user: (paramKey) => ({ type: "user", user_id: `\${param:${paramKey}}` }),
    group: (paramKey) => ({ type: "group", group_id: `\${param:${paramKey}}` }),
    initiator: () => ({ type: "initiator" }),
};
export const notify = (id, name, notification, recipients, options = {}) => node(id, name, "notify", { notification, recipients, except: options.except ?? [] });
export const edges = (...triples) => triples.map(([id, from, to]) => ({ id, from, to }));
export const upsert = (id, name, entity, matchKey, body) => node(id, name, "entity_record", { operation: "upsert", entityId: entity, matchBy: "key", matchKey, body });
export function graph(name, nodes, edgeList, transaction) {
    const g = {
        schemaVersion: "1.0",
        name,
        start: "start",
        end: nodes.filter((n) => n.node_type === "end").map((n) => n.id),
        nodes,
        edges: edgeList,
    };
    if (transaction)
        g.transaction = transaction;
    return g;
}
export const workflow = (key, name, description, runAs, startAccess, g, inputSchema = null) => ({
    key,
    name,
    description,
    run_as: runAs,
    start_access: startAccess,
    input_schema: inputSchema,
    output_schema: null,
    graph: g,
});
const DECOMPILABLE = new Set(["==", "!=", "<", "<=", ">", ">=", "!!", "!"]);
function checkLeaf(where, c) {
    const [[op, args]] = Object.entries(c);
    if (!DECOMPILABLE.has(op))
        throw new Error(`${where}: operator ${op} is not one the designer round-trips`);
    if (!Array.isArray(args) || !args[0] || !("var" in args[0]))
        throw new Error(`${where}: compare a var: ${JSON.stringify(c)}`);
    if (op !== "!!" && op !== "!" && args[1] && typeof args[1] === "object" && "var" in args[1]) {
        throw new Error(`${where}: two vars compared; go through a Set Variable step: ${JSON.stringify(c)}`);
    }
}
export function checkCondition(where, cond) {
    const [[op, args]] = Object.entries(cond);
    if (op === "and" || op === "or")
        args.forEach((a) => checkLeaf(where, a));
    else
        checkLeaf(where, cond);
}
// The first platform month whose builds follow a signing step's decline route; an older one drops it unread.
export const DECLINE_ROUTE_PLATFORM = "2026.11";
const routedEdges = (route) => (route?.kind === "branch" && Array.isArray(route.edgeIds) ? route.edgeIds : []);
// A Signature step with a decline route owns those edges, and has exactly one more: the signed path.
function checkSignedPath(where, n, outbound) {
    const routed = routedEdges(n.parameters.onDecline);
    for (const e of routed) {
        if (!outbound.has(e))
            throw new Error(`${where}: ${n.id} routes a decline to ${e}, which is not an edge leaving it`);
    }
    const signed = [...outbound].filter((e) => !routed.includes(e));
    if (signed.length !== 1) {
        throw new Error(`${where}: ${n.id} (signature) has its decline route ${routed} and ${signed.length} other outbound edges; the signed path is exactly one`);
    }
}
// The rules publish enforces that are easiest to break by hand: one outbound
// edge per plain step, branch and action edges owned by their node, a routed
// Signature step's signed path beside its decline route, everything
// reachable, no loops (a loop may not hold an Entity Record step), and Decision
// conditions the designer can round-trip.
export function checkGraph(where, g) {
    const ids = g.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length)
        throw new Error(`${where}: duplicate node ids`);
    if (new Set(g.edges.map((e) => e.id)).size !== g.edges.length)
        throw new Error(`${where}: duplicate edge ids`);
    const out = new Map();
    for (const e of g.edges) {
        if (!ids.includes(e.from) || !ids.includes(e.to))
            throw new Error(`${where}: edge ${e.id} names a missing node`);
        if (!out.has(e.from))
            out.set(e.from, []);
        out.get(e.from).push(e);
    }
    for (const n of g.nodes) {
        const mine = new Set((out.get(n.id) ?? []).map((e) => e.id));
        if (n.node_type === "end") {
            if (mine.size)
                throw new Error(`${where}: End ${n.id} has outbound edges`);
            continue;
        }
        let owned = null;
        if (n.node_type === "decision") {
            owned = n.parameters.branches.flatMap((b) => b.edgeIds);
            n.parameters.branches.forEach((b) => b.when && checkCondition(`${where}.${n.id}`, b.when));
        }
        if (n.node_type === "human") {
            const then = n.parameters.endWhen?.then;
            const acted = n.parameters.actions.flatMap((a) => a.edgeIds);
            const declined = routedEdges(n.parameters.signing?.onDecline);
            for (const e of declined) {
                if (acted.includes(e))
                    throw new Error(`${where}: ${n.id} routes a decline to ${e}, which an action already owns`);
            }
            // A deadline's timeout branch owns its edges, as publish counts them.
            const timedOut = (n.parameters.escalation?.levels ?? []).flatMap((level) => {
                const target = level?.action?.kind === "autoAdvance" ? level.action.target : undefined;
                return target?.kind === "timeoutBranch" && Array.isArray(target.edgeIds) ? target.edgeIds : [];
            });
            owned = [...acted, ...declined, ...timedOut, ...(then?.kind === "branch" ? then.edgeIds ?? [] : [])];
        }
        if (n.node_type === "for_each")
            checkGraph(`${where}.${n.id}.body`, n.parameters.body);
        if (owned) {
            const same = owned.length === mine.size && owned.every((e) => mine.has(e));
            if (!same)
                throw new Error(`${where}: ${n.id} owns ${owned} but has ${[...mine]}`);
        }
        else if (n.node_type === "signature" && routedEdges(n.parameters?.onDecline).length) {
            checkSignedPath(where, n, mine);
        }
        else if (mine.size !== 1) {
            throw new Error(`${where}: ${n.id} (${n.node_type}) has ${mine.size} outbound edges`);
        }
    }
    const state = new Map();
    const visit = (u) => {
        state.set(u, 1);
        for (const e of out.get(u) ?? []) {
            if (state.get(e.to) === 1)
                throw new Error(`${where}: loop through ${u} -> ${e.to}`);
            if (!state.has(e.to))
                visit(e.to);
        }
        state.set(u, 2);
    };
    visit(g.start);
    const unreachable = ids.filter((id) => !state.has(id));
    if (unreachable.length)
        throw new Error(`${where}: unreachable ${unreachable}`);
}
function eachNode(value, visit, pointer) {
    if (Array.isArray(value))
        value.forEach((item, i) => eachNode(item, visit, at(pointer, i)));
    else if (value && typeof value === "object") {
        if (typeof value.node_type === "string")
            visit(value, pointer);
        for (const [key, item] of Object.entries(value))
            eachNode(item, visit, at(pointer, key));
    }
}
// Whether any step, at any loop depth, carries a decline route.
export function holdsDeclineRoute(nodes) {
    let found = false;
    eachNode(nodes, (node) => {
        const holder = node.node_type === "signature" ? node.parameters : node.node_type === "human" ? node.parameters?.signing : undefined;
        if (holder?.onDecline != null)
            found = true;
    }, "");
    return found;
}
// Every Notify step, at any loop depth, with its pointer.
function notifySteps(nodes) {
    const found = [];
    eachNode(nodes, (node, pointer) => void (node.node_type === "notify" && found.push({ node, pointer })), "/graph/nodes");
    return found;
}
export const holdsNotify = (nodes) => notifySteps(nodes).length > 0;
const MAX_NOTIFY_SOURCES = 10;
// Refuses a Notify step publish would refuse for its source lists, one that names a kind the package does not
// declare, and a member the step or a source does not have: AgentFlow reads a stored step leniently, so a misspelt
// `except` would otherwise leave out nobody.
export function checkNotify(where, nodes, declared) {
    for (const { node, pointer } of notifySteps(nodes)) {
        const parameters = at(pointer, "parameters");
        if (isObject(node.parameters))
            onlyMembers(node.parameters, CONFIG_MEMBERS.notify, where, parameters);
        const kind = node.parameters?.notification;
        if (typeof kind !== "string" || !declared.has(kind)) {
            refuse(where, at(parameters, "notification"), `${clip(String(kind))} is not a notification kind of the package's notifications member`);
        }
        for (const [member, min] of [["recipients", 1], ["except", 0]]) {
            const sources = node.parameters?.[member];
            if (member === "except" && sources === undefined)
                continue;
            if (!Array.isArray(sources))
                refuse(where, at(parameters, member), "must be an array of sources");
            if (sources.length < min)
                refuse(where, at(parameters, member), "names at least one source");
            if (sources.length > MAX_NOTIFY_SOURCES)
                refuse(where, at(parameters, member), `names ${sources.length} sources, at most ${MAX_NOTIFY_SOURCES}`);
            sources.forEach((source, i) => {
                const sourceAt = at(at(parameters, member), i);
                if (!isObject(source))
                    refuse(where, sourceAt, "must be a source object");
                const type = source.type;
                const types = kindsOf("notify_source");
                if (typeof type !== "string" || !types.includes(type)) {
                    refuse(where, at(sourceAt, "type"), `${clip(String(type))} is not a source type: ${types.join(", ")}`);
                }
                onlyMembers(source, CONFIG_MEMBERS[`notify_source.${type}`], where, sourceAt);
            });
        }
    }
}
// Every signing method the steps use, at any loop depth: a Signature step, or a Human step with a signing block.
// A step that names none signs by server_email.
export function signingMethodsIn(nodes) {
    const methods = new Set();
    eachNode(nodes, (node) => {
        const holder = node.node_type === "signature" ? node.parameters : node.node_type === "human" ? node.parameters?.signing : undefined;
        if (node.node_type === "signature" || holder != null)
            methods.add(typeof holder?.signingMethod === "string" ? holder.signingMethod : "server_email");
    }, "");
    return methods;
}
// Every list of documents a step's documentTemplateId sits in, as the platform reads a graph's references, and
// whether only a document that renders a template names one.
const TEMPLATE_LISTS = {
    document: [[["documents"], false]],
    signature: [[["documents"], true]],
    human: [[["reviewDocuments"], false], [["signing", "documents"], true]],
};
// Runs on the translated nodes, so a Code source holding `${` is never read as a reference.
function finishNode(node, where, pointer, configDir, connections) {
    for (const [list, renderedOnly] of TEMPLATE_LISTS[node.node_type] ?? []) {
        const documents = list.reduce((value, member) => value?.[member], node.parameters);
        if (!Array.isArray(documents))
            continue;
        documents.forEach((document, i) => {
            // A signing document names a template only when it renders one; its other sources carry none.
            if (renderedOnly && document?.source !== "renderDocumentTemplate")
                return;
            const id = document?.documentTemplateId;
            if (id == null || (typeof id === "string" && id.startsWith("@obj:document_template:")))
                return;
            const here = at(at([...list].reduce((p, member) => at(p, member), at(pointer, "parameters")), i), "documentTemplateId");
            refuse(where, here, `name the template with \${document_template:<key>}, not ${clip(typeof id === "string" ? id : JSON.stringify(id))}`);
        });
    }
    if (node.node_type === "email" && node.parameters?.email && "connection" in node.parameters.email) {
        const connection = node.parameters.email.connection;
        const here = at(at(at(pointer, "parameters"), "email"), "connection");
        const shape = connection && typeof connection === "object" ? Object.keys(connection).sort().join() : "";
        if (shape !== "externalAccountId,provider" || connection.provider !== "resend"
            || typeof connection.externalAccountId !== "string" || !connection.externalAccountId.startsWith("@param:")) {
            refuse(where, here, `an Email connection the builder has no rule for: ${clip(JSON.stringify(connection))}`);
        }
        checkConnectionUse(connections, "email_step", connection.externalAccountId.slice("@param:".length), where, here);
        node.parameters.email.connection = connection.externalAccountId;
    }
    if (node.node_type === "integration") {
        const parameters = at(pointer, "parameters");
        for (const member of ["provider", "externalAccountId"]) {
            if (member in (node.parameters ?? {})) {
                refuse(where, at(parameters, member), `a package names an Integration step's account with connection: \${param:…}, not ${member}`);
            }
        }
        const connection = node.parameters?.connection;
        const here = at(parameters, "connection");
        if (typeof connection !== "string" || !connection.startsWith("@param:")) {
            refuse(where, here, "an Integration step names its account with connection: ${param:…}, a connection_ref parameter of the package");
        }
        checkConnectionUse(connections, "integration_step", connection.slice("@param:".length), where, here);
    }
    if (node.node_type === "code") {
        const here = at(at(pointer, "parameters"), "source");
        const source = node.parameters?.source;
        if (!source || typeof source !== "object" || Object.keys(source).join() !== "$file" || typeof source.$file !== "string") {
            refuse(where, here, "a Code source must be {\"$file\": \"code/…\"}");
        }
        node.parameters.source = fs.readFileSync(path.join(configDir, source.$file), "utf8");
        const declared = (Array.isArray(node.parameters.inputs) ? node.parameters.inputs : []).map((input) => String(input?.name));
        const language = node.parameters.language === "python" ? "python" : "javascript";
        const missing = undeclaredInputs(node.parameters.source, language, declared);
        if (missing.length > 0) {
            refuse(where, here, `${source.$file} reads ${missing.join(", ")}, which the step does not declare (declared: ${declared.join(", ") || "none"}): ` +
                `declare each under inputs, or ask with "<name>" in inputs before reading it`);
        }
    }
}
export function workflowObject(w, configDir, exposed = {}, entities = [], connections = new Map()) {
    const where = `workflow ${w.key}`;
    onlyMembers(w, CONFIG_MEMBERS.workflow, where, "");
    const g = w.graph;
    onlyMembers(g, CONFIG_MEMBERS.graph, where, "/graph");
    let runAs;
    if (w.run_as?.policy === "initiator")
        runAs = "initiator";
    else if (w.run_as?.policy === "service_principal")
        runAs = parameterOf(w.run_as.service_principal_id, where, "/run_as/service_principal_id");
    else
        refuse(where, "/run_as", `a run-as policy the builder has no rule for: ${clip(JSON.stringify(w.run_as))}`);
    const nodes = translate(g.nodes, where, "/graph/nodes");
    const edges = translate(g.edges, where, "/graph/edges");
    eachNode(nodes, (node, pointer) => finishNode(node, where, pointer, configDir, connections), "/graph/nodes");
    const exposedSteps = exposed[w.key] ?? [];
    for (const id of exposedSteps) {
        if (!nodes.some((n) => n.id === id && n.node_type === "human"))
            refuse(where, "/graph/nodes", `exposed step ${id} is not a human step`);
    }
    const body = { schemaVersion: g.schemaVersion, name: w.name, description: w.description, runAs, exposedSteps };
    if (w.input_schema)
        body.inputSchema = translate(w.input_schema, where, "/input_schema", { "x-entity": xEntity(entities) });
    if (w.output_schema)
        body.outputSchema = translate(w.output_schema, where, "/output_schema");
    if (g.variables)
        body.variables = translate(g.variables, where, "/graph/variables");
    if (g.transaction)
        body.transaction = g.transaction;
    return { ...body, start: g.start, end: g.end, nodes, edges };
}
export function startGrants(w) {
    const where = `workflow ${w.key}`;
    onlyMembers(w.start_access, CONFIG_MEMBERS.start_access, where, "/start_access");
    if (w.start_access.mode !== "restricted") {
        refuse(where, "/start_access/mode", "a package cannot let everyone start a workflow");
    }
    return w.start_access.group_ids.map((id, i) => ({
        key: `start_${w.key}${i ? `_${i + 1}` : ""}`,
        to: parameterOf(id, where, at("/start_access/group_ids", i)),
        workflow: `@obj:workflow:${w.key}`,
    }));
}
export function triggerObject(name, trigger, workflowKeys, connections = new Map()) {
    const where = `trigger ${name}`;
    onlyMembers(trigger, CONFIG_MEMBERS.trigger, where, "");
    if (!workflowKeys.has(trigger.workflow))
        refuse(where, "/workflow", `${trigger.workflow} is not a workflow of the package`);
    const connected = trigger.kind === "connected_app";
    const config = {};
    for (const [key, value] of Object.entries(trigger.config)) {
        if (connected && key === "provider") {
            if (value !== "resend")
                refuse(where, at("/config", key), `a connected_app trigger on ${clip(JSON.stringify(value))}: the package's connection parameter is Resend's`);
            continue;
        }
        if (connected && key === "external_account_id") {
            config.account = parameterOf(value, where, at("/config", key));
            checkConnectionUse(connections, "trigger", config.account.slice("@param:".length), where, at("/config", key));
        }
        else
            config[key] = translate(value, where, at("/config", key));
    }
    if (connected && !("account" in config))
        refuse(where, "/config", "a connected_app trigger names no external_account_id");
    return { workflow: `@obj:workflow:${trigger.workflow}`, kind: trigger.kind, enabled: false, config };
}
export function actionObject(name, entry, workflowKeys, entities) {
    const where = `action ${name}`;
    onlyMembers(entry, CONFIG_MEMBERS.action, where, "");
    const action = entry.action;
    onlyMembers(action, CONFIG_MEMBERS.action_body, where, "/action");
    if (!entities.includes(entry.entity))
        refuse(where, "/entity", `${entry.entity} is not an entity of the package`);
    if (typeof action.key !== "string" || action.key === "")
        refuse(where, "/action/key", "a non-empty string");
    const body = { workflow: translate(action.workflow_id, where, "/action/workflow_id") };
    const target = /^@obj:workflow:(.+)$/.exec(body.workflow);
    if (!target || !workflowKeys.has(target[1]))
        refuse(where, "/action/workflow_id", `${action.workflow_id} is not a workflow of the package`);
    for (const member of ["label", "scope", "mode", "visible_when", "input_map", "tone", "icon"]) {
        if (member in action)
            body[member] = translate(action[member], where, at("/action", member));
    }
    return [`entity_action:${entry.entity}/${action.key}`, body];
}
//# sourceMappingURL=workflow.js.map