import path from "node:path";
import { at, clip, isObject, onlyMembers, parameterOf, readEmbeddedText, refuse, translate } from "./core.js";
import { undeclaredInputs } from "./code-inputs.js";
import { CONFIG_MEMBERS, kindsOf } from "./members.js";
import { xEntity } from "./entity.js";
import { checkConnectionUse, classifiedByUnit } from "./invariants.js";
import { openDefect } from "./notifications.js";
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
// An End output's value is a string the platform emits, resolves or renders; a literal carried only as JSON
// (lit(true), lit(3)) has none, and the install refuses the step.
export function end(id, name, outcome, outputs) {
    const where = `end step ${id}`;
    if (outputs !== undefined) {
        if (!isObject(outputs))
            refuse(where, "/parameters/outputMapping", "an object of named outputs");
        for (const [key, output] of Object.entries(outputs)) {
            const here = at("/parameters/outputMapping", key);
            if (isObject(output) && output.kind === "literal" && typeof output.value !== "string") {
                refuse(where, here, `an End output is a string, so write lit("${String(output.valueJson)}"), not lit(${JSON.stringify(output.valueJson)})`);
            }
            if (!isObject(output) || typeof output.value !== "string")
                refuse(where, here, "ref(...), tpl(...) or a string lit(...)");
        }
    }
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
const UNIT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIT_PARAMETER = /^\$\{param:[a-z][a-z0-9_-]*\}$/;
const DESTINATION_SOURCES = ["creator", "trigger", "unit"];
function destinationOf(where, options) {
    checkOptions(where, "", options, ["destinationUnit"]);
    const destination = options.destinationUnit ?? { from: "creator" };
    const pointer = "/parameters/destinationUnit";
    if (!isObject(destination) || !("from" in destination)) {
        refuse(where, pointer, `write { from: "creator" | "trigger" | "unit" }, not ${shown(destination)}`);
    }
    onlyMembers(destination, CONFIG_MEMBERS.destination_unit, where, pointer);
    if (!DESTINATION_SOURCES.includes(destination.from))
        refuse(where, at(pointer, "from"), `one of ${DESTINATION_SOURCES.join(", ")}`);
    if (destination.from !== "unit") {
        if ("unit" in destination)
            refuse(where, at(pointer, "unit"), `from: "${destination.from}" names no unit`);
        return destination.from === "creator" ? {} : { destinationUnit: { mode: "inherit_trigger" } };
    }
    const unit = destination.unit;
    const unitAt = at(pointer, "unit");
    if (typeof unit !== "string" || unit === "")
        refuse(where, unitAt, "name the unit: a context path such as nodes.batch.output.record.unit, or ${param:key} of a unit_ref parameter");
    if (UNIT_ID.test(unit))
        refuse(where, unitAt, "a package never names an organization's unit: bind a context path or a unit_ref parameter");
    if (unit.includes("${") && !UNIT_PARAMETER.test(unit))
        refuse(where, unitAt, `a unit is a context path or \${param:key}, not ${clip(unit)}`);
    return { destinationUnit: { mode: "unit", unitId: UNIT_PARAMETER.test(unit) ? lit(unit) : ref(unit) } };
}
export const create = (id, name, entity, body, options = {}) => node(id, name, "entity_record", {
    operation: "create",
    entityId: entity,
    body,
    ...destinationOf(`create step ${id}`, options),
});
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
// A Fork starts all its arms at once, one edge each, named arm_1, arm_2 and so on. Publish pairs it with the nearest
// Join that every arm reaches; the Join waits for all of them and has no options.
export function fork(id, name, armEdges) {
    const where = `fork step ${id}`;
    if (!Array.isArray(armEdges) || armEdges.length < 2 || armEdges.some((e) => typeof e !== "string" || e === "")) {
        refuse(where, "/parameters/arms", `a Fork has at least two arms, each one edge id, not ${shown(armEdges)}`);
    }
    const twice = armEdges.find((e, i) => armEdges.indexOf(e) !== i);
    if (twice !== undefined)
        refuse(where, "/parameters/arms", `edge ${twice} is named twice; each arm has an edge of its own`);
    return node(id, name, "fork", { arms: armEdges.map((edge, i) => ({ id: `arm_${i + 1}`, edgeIds: [edge] })) });
}
export const join = (id, name) => node(id, name, "join");
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
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const WEBHOOK_AUTH = {
    bearer: ["kind", "secret"],
    api_key_header: ["kind", "secret", "header"],
    basic: ["kind", "secret", "username"],
};
// The designer's words for a body row: a reference is a `variable`, a template a `literal`, and a typed
// literal a `literal_json`, which is sent as it is.
function bodyRow(where, pointer, key, binding) {
    if (!isObject(binding) || !["reference", "template", "literal"].includes(binding.kind)) {
        refuse(where, pointer, `a body value is ref(...), tpl(...) or lit(...), not ${shown(binding)}`);
    }
    if (binding.kind === "reference")
        return { key, kind: "variable", value: binding.value };
    if (binding.kind === "template")
        return { key, kind: "literal", value: binding.value };
    const value = "valueJson" in binding ? binding.valueJson : binding.value;
    return { key, kind: "literal_json", value: JSON.stringify(value), valueJson: value };
}
// A secret is a `secret_ref` parameter of the package: the step sends its value and the package never holds it.
function webhookAuth(where, pointer, auth) {
    const shapes = '{ kind: "bearer", secret }, { kind: "api_key_header", secret, header } or { kind: "basic", secret, username }';
    if (!isObject(auth) || typeof auth.kind !== "string" || !Object.hasOwn(WEBHOOK_AUTH, auth.kind)) {
        refuse(where, at(pointer, "kind"), `auth is ${shapes}, not ${shown(auth)}`);
    }
    const members = WEBHOOK_AUTH[auth.kind];
    onlyMembers(auth, members, where, pointer);
    for (const member of members.slice(1)) {
        if (typeof auth[member] !== "string" || auth[member] === "")
            refuse(where, pointer, `a ${auth.kind} auth names its ${member}: { ${members.join(", ")} }`);
    }
    return {
        kind: auth.kind,
        secretId: `\${param:${auth.secret}}`,
        ...(auth.kind === "api_key_header" ? { headerName: auth.header } : {}),
        ...(auth.kind === "basic" ? { username: auth.username } : {}),
    };
}
// An HTTP request, in the config the designer writes. `url` and header values are templates. A string body is
// sent as text and an object of bindings as JSON; none is sent without one. The output is
// `{ success, status, response, attempts }`, `response` the JSON answer (null past 1 MiB or when it is not JSON).
export function webhook(id, name, options, settings) {
    const where = `webhook step ${id}`;
    const base = "/parameters";
    const config = at(base, "webhook");
    checkOptions(where, base, options, ["url", "method", "headers", "body", "auth", "retries"], [
        wireName("bodyMode", "body"),
        wireName("bodyTemplate", "body"),
        wireName("secretId", "auth: { secret }"),
    ]);
    const { url, method, headers, body, auth, retries } = options;
    if (typeof url !== "string" || url.trim() === "") {
        refuse(where, at(config, "url"), `a webhook sends to a URL, such as "https://api.example.com/v1/{{ subject.record.code }}", not ${shown(url)}`);
    }
    if (method !== undefined)
        oneOf(where, at(config, "method"), "method", HTTP_METHODS, method);
    if (headers !== undefined && (!isObject(headers) || Object.values(headers).some((v) => typeof v !== "string"))) {
        refuse(where, at(config, "headers"), `headers map a header's name to a string or a template, not ${shown(headers)}`);
    }
    if (retries !== undefined && (!Number.isInteger(retries) || retries < 0)) {
        refuse(where, at(base, "retries"), `retries is a whole number of attempts after the first, not ${shown(retries)}`);
    }
    const written = { url, method: method ?? "POST" };
    if (headers !== undefined)
        written.headers = headers;
    if (body === undefined)
        written.bodyMode = "none";
    else if (typeof body === "string")
        Object.assign(written, { bodyMode: "text", body });
    else if (isObject(body)) {
        const rows = at(config, "bodyTemplate");
        written.bodyMode = "object";
        written.bodyTemplate = Object.entries(body).map(([key, binding], i) => bodyRow(where, at(rows, i), key, binding));
    }
    else
        refuse(where, at(config, "body"), `body is a string or an object of ref(...), tpl(...) and lit(...), not ${shown(body)}`);
    if (auth !== undefined)
        written.auth = webhookAuth(where, at(config, "auth"), auth);
    return node(id, name, "webhook", { webhook: written, ...(retries === undefined ? {} : { retries }) }, settings);
}
// A file's text as the step's output: `text` for one file (`mode: "single"`, the default), `items[].text` for a
// list. A template that only needs the text can read `{{ content(<file>) }}` without a step.
export function extractText(id, name, source, options = {}, settings) {
    const where = `extract_text step ${id}`;
    const base = "/parameters";
    checkOptions(where, base, options, ["mode", "format", "onOversize"], [wireName("on_oversize", "onOversize")]);
    if (typeof source !== "string" || source.trim() === "") {
        refuse(where, at(base, "source"), `extract_text reads the file at a path, such as subject.record.<file field> or input.item, not ${shown(source)}`);
    }
    const { mode, format, onOversize } = options;
    if (mode !== undefined)
        oneOf(where, at(base, "mode"), "mode", ["single", "multi"], mode);
    if (format !== undefined)
        oneOf(where, at(base, "format"), "format", ["markdown", "text"], format);
    if (onOversize !== undefined)
        oneOf(where, at(base, "onOversize"), "onOversize", ["fail", "truncate"], onOversize);
    return node(id, name, "extract_text", {
        source,
        mode: mode ?? "single",
        ...(format === undefined ? {} : { format }),
        ...(onOversize === undefined ? {} : { onOversize }),
    }, settings);
}
const SEARCH_OPERATORS = ["eq", "neq", "contains", "starts_with", "gt", "lt", "known", "unknown"];
// A read or a write on the connection the `connection_ref` parameter `connection` names. A mapping is
// [provider field, binding], and on a search [field, binding, operator] (eq when left out).
export function integration(id, name, options, settings) {
    const where = `integration step ${id}`;
    const base = "/parameters";
    checkOptions(where, base, options, ["connection", "operation", "objectType", "identityField", "mappings", "delivery", "captureTo", "associations", "safeFieldPaths"], [
        ["provider", "a package names the account with connection: \"<connection_ref parameter>\"; the installer writes the provider"],
        wireName("externalAccountId", "connection"),
    ]);
    const { connection, operation, objectType, identityField, mappings, delivery, captureTo, associations, safeFieldPaths } = options;
    if (typeof connection !== "string" || connection === "" || connection.includes("{")) {
        refuse(where, at(base, "connection"), `connection is the key of a connection_ref parameter, such as "erp", not ${shown(connection)}`);
    }
    oneOf(where, at(base, "operation"), "operation", ["get", "search", "upsert"], operation);
    if (typeof objectType !== "string" || objectType === "")
        refuse(where, at(base, "objectType"), `objectType is the provider's object, such as "vendor", not ${shown(objectType)}`);
    if (operation !== "search" && (typeof identityField !== "string" || identityField === "")) {
        refuse(where, at(base, "identityField"), "a get and an upsert name the field they key on, such as identityField: \"email\"");
    }
    if (delivery !== undefined) {
        if (operation !== "upsert")
            refuse(where, at(base, "delivery"), "only an upsert has a delivery; a read always answers inside the step");
        oneOf(where, at(base, "delivery"), "delivery", ["queued", "inline"], delivery);
    }
    const written = (mappings ?? []).map((entry, i) => {
        const here = at(at(base, "mappings"), i);
        if (!Array.isArray(entry) || typeof entry[0] !== "string" || !isObject(entry[1])) {
            refuse(where, here, `a mapping is [provider field, ref(...) | tpl(...) | lit(...)], not ${shown(entry)}`);
        }
        const [target, binding, operator] = entry;
        if (operator !== undefined) {
            if (operation !== "search")
                refuse(where, at(here, "operator"), "only a search compares with an operator; a get and an upsert key on equality");
            oneOf(where, at(here, "operator"), "operator", SEARCH_OPERATORS, operator);
        }
        return { target, ...binding, ...(operator === undefined ? {} : { operator }) };
    });
    // An upsert finds the provider's record by the value it writes to its identity field.
    if (operation === "upsert" && !written.some((m) => m.target === identityField)) {
        refuse(where, at(base, "mappings"), `an upsert maps a value to its identity field ${identityField}: [${shown(identityField)}, ref(...)]`);
    }
    if (captureTo !== undefined && (typeof captureTo !== "string" || !/^(vars|input)\./.test(captureTo))) {
        refuse(where, at(base, "captureTo"), `captureTo is a path under vars. or input., such as "vars.vendor", not ${shown(captureTo)}`);
    }
    return node(id, name, "integration", {
        connection: `\${param:${connection}}`,
        operation,
        objectType,
        ...(identityField === undefined ? {} : { identityField }),
        ...(written.length ? { mappings: written } : {}),
        ...(delivery === undefined ? {} : { delivery }),
        ...(associations === undefined ? {} : { associations }),
        ...(captureTo === undefined ? {} : { captureTo }),
        ...(safeFieldPaths === undefined ? {} : { safeFieldPaths }),
    }, settings);
}
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
export const upsert = (id, name, entity, matchKey, body, options = {}) => node(id, name, "entity_record", {
    operation: "upsert",
    entityId: entity,
    matchBy: "key",
    matchKey,
    body,
    ...destinationOf(`upsert step ${id}`, options),
});
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
// Every literal `var` path a JSONLogic condition names, at any depth.
function varPaths(value, out = []) {
    if (Array.isArray(value))
        for (const item of value)
            varPaths(item, out);
    else if (value && typeof value === "object") {
        for (const [key, arg] of Object.entries(value)) {
            const path = key === "var" ? (Array.isArray(arg) ? arg[0] : arg) : undefined;
            if (typeof path === "string" && path !== "")
                out.push(path);
            else
                varPaths(arg, out);
        }
    }
    return out;
}
// What publish refuses of a Human step's end condition that the graph alone shows: a step inside a loop's body (its
// run is about the item, not the record), and a read of anything but a top-level field of the run's record. Unlike a
// Decision's, the condition may use any JSONLogic operator: AgentFlow's designer shows it read only.
function checkEndWhen(where, n, inBody) {
    const endWhen = n.parameters?.endWhen;
    if (!endWhen)
        return;
    if (inBody)
        throw new Error(`${where}: ${n.id} has an endWhen, which a step inside a For each body cannot have`);
    for (const path of varPaths(endWhen.condition)) {
        const field = /^subject\.record\.([^.[\]]+)$/.exec(path)?.[1];
        if (field === undefined || field === "id" || field === "metadata") {
            throw new Error(`${where}: ${n.id}'s endWhen reads ${path}; an end condition may read only a field of the run's record, as subject.record.<field> (not id or metadata)`);
        }
    }
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
// The step kinds publish admits inside a loop (`loop_kind_allowed` in the engine's execution plan). The others
// repeat a write on a second lap, start runs of their own, or cannot sit inside a loop.
const LOOP_KINDS = [
    "human", "agent", "decision", "document", "email", "webhook", "set_variable", "fork", "join", "extract_text",
    "image", "learn", "entity_relationship", "code", "notify",
];
// Whether a step follows one of several edges on each visit, so an edge it owns is not followed every time.
const chooses = (n) => n.node_type === "decision" || n.node_type === "human" || (n.node_type === "signature" && n.parameters?.onDecline?.kind === "branch");
// Tarjan's strongly connected components of the steps `ids` names, the grouping publish finds loops by.
function stronglyConnected(ids, out) {
    const inside = new Set(ids);
    let next = 0;
    const index = new Map();
    const low = new Map();
    const stack = [];
    const held = new Set();
    const groups = [];
    const connect = (v) => {
        index.set(v, next);
        low.set(v, next);
        next += 1;
        stack.push(v);
        held.add(v);
        for (const e of out.get(v) ?? []) {
            if (!inside.has(e.to))
                continue;
            if (!index.has(e.to)) {
                connect(e.to);
                low.set(v, Math.min(low.get(v), low.get(e.to)));
            }
            else if (held.has(e.to))
                low.set(v, Math.min(low.get(v), index.get(e.to)));
        }
        if (low.get(v) !== index.get(v))
            return;
        const group = [];
        let w;
        do {
            w = stack.pop();
            held.delete(w);
            group.push(w);
        } while (w !== v);
        groups.push(group);
    };
    for (const id of ids)
        if (!index.has(id))
            connect(id);
    return groups;
}
const cyclic = (ids, out) => stronglyConnected(ids, out).some((group) => group.length > 1 || (out.get(group[0]) ?? []).some((e) => e.to === group[0]));
// A loop publish runs: entered at one step, the header, and with no second loop inside it.
function checkLoops(where, g, ids, out) {
    const kinds = new Map(g.nodes.map((n) => [n.id, n.node_type]));
    for (const group of stronglyConnected(ids, out)) {
        if (!cyclic(group, out))
            continue;
        const members = new Set(group);
        const through = ids.filter((id) => members.has(id));
        const named = through.join(", ");
        for (const id of through) {
            const kind = kinds.get(id);
            if (!LOOP_KINDS.includes(kind)) {
                throw new Error(`${where}: ${id} (${kind}) is inside the loop through ${named}; a loop holds only ${LOOP_KINDS.join(", ")} steps: ` +
                    "move it out of the loop, or repeat it over items with a For Each");
            }
        }
        const entries = new Set();
        for (const e of g.edges)
            if (members.has(e.to) && !members.has(e.from))
                entries.add(e.to);
        for (const id of through)
            if (id === g.start || !g.edges.some((e) => e.to === id))
                entries.add(id);
        if (entries.size !== 1) {
            throw new Error(`${where}: the loop through ${named} is entered at ${through.filter((id) => entries.has(id)).join(", ")}; route every entry through one step`);
        }
        const [header] = entries;
        const forward = new Map();
        for (const e of g.edges) {
            if (!members.has(e.from) || !members.has(e.to) || e.to === header)
                continue;
            if (!forward.has(e.from))
                forward.set(e.from, []);
            forward.get(e.from).push(e);
        }
        if (cyclic(through, forward)) {
            throw new Error(`${where}: the loop through ${named} holds another loop; loops do not nest: flatten them, or repeat over items with a For Each`);
        }
    }
}
// What publish refuses of a Fork/Join region that needs no pairing to see. Publish also pairs each Fork with the
// Join that every arm reaches, and refuses arms that share a step or a Join step that does not run once per arm.
function checkRegions(where, g, out) {
    const byId = new Map(g.nodes.map((n) => [n.id, n]));
    const reached = (from) => {
        const seen = new Set();
        const queue = [from];
        while (queue.length)
            for (const e of out.get(queue.shift()) ?? [])
                if (!seen.has(e.to))
                    seen.add(e.to), queue.push(e.to);
        return seen;
    };
    const forks = g.nodes.filter((n) => n.node_type === "fork");
    const afterForks = new Set(forks.flatMap((f) => [...reached(f.id)]));
    for (const f of forks) {
        if (![...reached(f.id)].some((id) => byId.get(id)?.node_type === "join")) {
            throw new Error(`${where}: Fork ${f.id} reaches no Join; a Fork's arms meet again at a Join`);
        }
    }
    for (const j of g.nodes.filter((n) => n.node_type === "join")) {
        if (!afterForks.has(j.id))
            throw new Error(`${where}: Join ${j.id} has no Fork before it`);
        for (const e of g.edges.filter((edge) => edge.to === j.id)) {
            const from = byId.get(e.from);
            if (chooses(from)) {
                throw new Error(`${where}: ${from.id} (${from.node_type}) feeds Join ${j.id} directly on ${e.id}; let its edges meet at one plain step, such as a Set Variable, before the Join`);
            }
        }
    }
}
// A Fork's arms, one edge each and each to a step of its own; their edges are the ones it owns.
function forkEdges(where, n, edgeTo) {
    const arms = Array.isArray(n.parameters.arms) ? n.parameters.arms : [];
    if (arms.length < 2)
        throw new Error(`${where}: Fork ${n.id} has ${arms.length} arm${arms.length === 1 ? "" : "s"}; a Fork has at least two`);
    const armTo = new Map();
    for (const arm of arms) {
        const wired = Array.isArray(arm?.edgeIds) ? arm.edgeIds : [];
        if (wired.length !== 1)
            throw new Error(`${where}: Fork ${n.id} arm ${arm?.id} wires ${wired.length} edges; an arm wires exactly one`);
        const to = edgeTo.get(wired[0]);
        if (to === undefined)
            continue;
        if (armTo.has(to))
            throw new Error(`${where}: Fork ${n.id} sends arms ${armTo.get(to)} and ${arm.id} to ${to}; each arm goes to a step of its own`);
        armTo.set(to, arm.id);
    }
    return arms.map((arm) => arm.edgeIds[0]);
}
// The rules publish enforces that are easiest to break by hand: one outbound
// edge per plain step, branch, action and arm edges owned by their node, a
// routed Signature step's signed path beside its decline route, everything
// reachable, loops publish can run (see checkLoops), the Fork/Join refusals
// checkRegions can see, Decision conditions the designer can round-trip, and what an end condition may read.
// The paths publish reads as one path each and refuses when they name no step: an Entity Record step's record id (get
// and update), body, filters and `q`; a Set Variable step's assignments; a Decision's conditions; a For each step's
// list; and an Email step's list when it sends one message per item (in single mode publish ignores a `listSource`
// the designer kept). A path anywhere else is left to publish, which judges some positions more loosely.
function readPaths(n) {
    const p = n.parameters;
    if (!isObject(p))
        return [];
    const refs = (bindings) => (Array.isArray(bindings) ? bindings : [bindings]).flatMap((b) => isObject(b) && b.kind === "reference" && typeof b.value === "string" ? [b.value] : []);
    switch (n.node_type) {
        case "entity_record":
            return [
                ...(p.operation === "get" || p.operation === "update" ? refs(p.recordIdExpr) : []),
                ...refs(p.body),
                ...(Array.isArray(p.filters) ? p.filters.flatMap((f) => refs(f?.value)) : []),
                ...refs(p.q),
            ];
        case "set_variable":
            return refs(p.assignments);
        case "decision":
            return Array.isArray(p.branches) ? p.branches.flatMap((b) => (b?.when ? varPaths(b.when) : [])) : [];
        case "for_each":
            return typeof p.listSource === "string" ? [p.listSource] : [];
        case "email":
            return isObject(p.email) && p.email.perItemMode === true && typeof p.email.listSource === "string" ? [p.email.listSource] : [];
        default:
            return [];
    }
}
// Publish refuses such a path that names a step its graph does not have, as it renders nothing on every run. A loop's
// body is a graph of its own and reads the steps around the loop as `parent.nodes.<id>`.
function checkStepPaths(where, g, outer) {
    const ids = g.nodes.map((n) => n.id);
    for (const n of g.nodes) {
        for (const path of readPaths(n)) {
            const own = /^nodes\.([^.[\]]+)/.exec(path)?.[1];
            if (own !== undefined && !ids.includes(own)) {
                const hint = outer?.includes(own) ? `; a loop's body reads the step around it as parent.nodes.${own}` : "";
                throw new Error(`${where}: ${n.id} reads ${path}, and ${own} is not a step of this graph${hint}`);
            }
            const around = /^parent\.nodes\.([^.[\]]+)/.exec(path)?.[1];
            if (around !== undefined && outer !== undefined && !outer.includes(around)) {
                throw new Error(`${where}: ${n.id} reads ${path}, and ${around} is not a step of the graph around the loop`);
            }
        }
    }
}
export function checkGraph(where, g, inBody = false, outer) {
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
    const edgeTo = new Map(g.edges.map((e) => [e.id, e.to]));
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
            checkEndWhen(where, n, inBody);
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
        if (n.node_type === "fork")
            owned = forkEdges(where, n, edgeTo);
        if (n.node_type === "join") {
            const extra = Object.keys(n.parameters ?? {}).find((member) => member !== "id" && member !== "label");
            if (extra !== undefined)
                throw new Error(`${where}: Join ${n.id} takes no ${extra}; a Join waits for every arm`);
        }
        if (n.node_type === "for_each")
            checkGraph(`${where}.${n.id}.body`, n.parameters.body, true, ids);
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
    const seen = new Set([g.start]);
    const queue = [g.start];
    while (queue.length)
        for (const e of out.get(queue.shift()) ?? [])
            if (!seen.has(e.to))
                seen.add(e.to), queue.push(e.to);
    const unreachable = ids.filter((id) => !seen.has(id));
    if (unreachable.length)
        throw new Error(`${where}: unreachable ${unreachable}`);
    checkLoops(where, g, ids, out);
    checkRegions(where, g, out);
    checkStepPaths(where, g, inBody ? outer : undefined);
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
// The first platform month whose builds read a Human step's page; an older one drops it unread.
export const TASK_PAGES_PLATFORM = "2027.02";
// Every step, at any loop depth, that carries a page, with its pointer.
function pagedSteps(nodes) {
    const found = [];
    eachNode(nodes, (node, pointer) => void (node.parameters?.page != null && found.push({ node, pointer })), "/graph/nodes");
    return found;
}
export const holdsTaskPage = (graph) => pagedSteps(graph).length > 0;
// Refuses a page publish would refuse: one on a step that is not Human, without the package's ui, at a path that is
// no module path, or in a mode other than redirect (embedded is reserved).
export function checkTaskPages(nodes, hasUi, where) {
    for (const { node, pointer } of pagedSteps(nodes)) {
        const here = at(at(pointer, "parameters"), "page");
        const page = node.parameters.page;
        if (node.node_type !== "human")
            refuse(where, here, "page belongs on a Human step");
        const defect = openDefect(typeof page?.path === "string" ? page.path : "", hasUi);
        if (defect !== undefined)
            refuse(where, here, defect);
        if (page.mode !== "redirect")
            refuse(where, here, "mode must be redirect");
    }
}
// Refuses an Entity Record step, at any loop depth, whose body binds unit on an entity of the package classified by
// unit, as AgentFlow refuses the package when it verifies it. On any other entity unit is a field like another.
export function checkUnitWrites(where, nodes, sources) {
    eachNode(nodes, (node, pointer) => {
        if (node.node_type !== "entity_record")
            return;
        const { entityId, body } = node.parameters ?? {};
        const own = typeof entityId === "string" && entityId.startsWith("@obj:entity:") ? sources.get(entityId.slice("@obj:entity:".length)) : undefined;
        if (!own || !classifiedByUnit(own) || !Array.isArray(body))
            return;
        body.forEach((binding, i) => {
            if (isObject(binding) && binding.field === "unit") {
                refuse(where, at(at(at(pointer, "parameters"), "body"), i), "`unit` is set by the platform from the creator's unit or the step's destinationUnit; a package never writes it");
            }
        });
    }, "/graph/nodes");
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
// A Set Variable target as publish judges it: a letter or underscore, then letters, digits and underscores.
const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
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
    if (node.node_type === "set_variable" && Array.isArray(node.parameters?.assignments)) {
        node.parameters.assignments.forEach((assignment, i) => {
            const target = assignment?.target;
            if (typeof target === "string" && VARIABLE_NAME.test(target.trim()))
                return;
            const here = at(at(at(at(pointer, "parameters"), "assignments"), i), "target");
            const bare = typeof target === "string" && target.startsWith("vars.") ? target.slice("vars.".length) : undefined;
            refuse(where, here, bare !== undefined && VARIABLE_NAME.test(bare)
                ? `${shown(target)} names the variable with its prefix: write ${shown(bare)}, which a later step reads as vars.${bare}`
                : `${shown(target)} is not a variable name: a letter or underscore, then letters, digits and underscores, and no dot (publish refuses it as set_variable.target_invalid)`);
        });
    }
    if (node.node_type === "email" && node.parameters?.email && "connection" in node.parameters.email) {
        const connection = node.parameters.email.connection;
        const here = at(at(at(pointer, "parameters"), "email"), "connection");
        if (typeof connection !== "string" || !connection.startsWith("@param:")) {
            refuse(where, here, "an Email step names its connection with connection: ${param:…}, a connection_ref parameter of the package");
        }
        checkConnectionUse(connections, "email_step", connection.slice("@param:".length), where, here);
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
        node.parameters.source = readEmbeddedText(path.join(configDir, source.$file));
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
    if (w.tool_enabled !== undefined && typeof w.tool_enabled !== "boolean")
        refuse(where, "/tool_enabled", "must be true or false");
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
    if (w.tool_enabled === true)
        body.toolEnabled = true;
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
        if (connected && (key === "provider" || key === "external_account_id")) {
            refuse(where, at("/config", key), `a connected_app trigger names its connection with connection: \${param:…}, not ${key}`);
        }
        if (connected && key === "connection") {
            config.account = parameterOf(value, where, at("/config", key));
            checkConnectionUse(connections, "trigger", config.account.slice("@param:".length), where, at("/config", key));
        }
        else
            config[key] = translate(value, where, at("/config", key));
    }
    if (connected && !("account" in config))
        refuse(where, "/config", "a connected_app trigger names its connection with connection: ${param:…}");
    if (trigger.kind === "entity_record")
        checkMappingFroms(trigger.config?.input_mappings, where);
    return { workflow: `@obj:workflow:${trigger.workflow}`, kind: trigger.kind, enabled: false, config };
}
// The metadata of a record change a mapping may copy, as `event.event.<key>`.
const EVENT_META = ["record_id", "entity_id", "change_kind", "changed", "occurred_at", "trigger_depth"];
// What the install refuses of a record trigger's mapping: a `from` that is not under `event.`, the whole event, and an
// `event.event.<x>` that is neither a before-value nor one of the metadata keys. A connected_app trigger's mapping is
// read with or without the prefix, so it is not judged here.
function checkMappingFroms(mappings, where) {
    if (!Array.isArray(mappings))
        return;
    mappings.forEach((mapping, i) => {
        const here = at(at("/config/input_mappings", i), "from");
        const from = isObject(mapping) && typeof mapping.from === "string" ? mapping.from.trim() : undefined;
        if (from === undefined)
            refuse(where, here, "a mapping's from is a path under event.");
        if (from === "event" || from === "event.event" || from === "event.event.previous") {
            refuse(where, here, `${from} is not a value: map a field (event.<field>), a before-value (event.event.previous.<field>) or ${EVENT_META.map((key) => `event.event.${key}`).join(", ")}`);
        }
        const rest = from.startsWith("event.") ? from.slice("event.".length) : undefined;
        if (!rest)
            refuse(where, here, `${from} does not start with event.: a field is event.<field>, as event.${from}`);
        const meta = rest.startsWith("event.") ? rest.slice("event.".length) : undefined;
        if (meta !== undefined && !(meta.startsWith("previous.") && meta.length > "previous.".length) && !EVENT_META.includes(meta)) {
            refuse(where, here, `${from} names no field, before-value or event metadata: a before-value is event.event.previous.<field>, and the metadata is ${EVENT_META.map((key) => `event.event.${key}`).join(", ")}`);
        }
    });
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