import path from "node:path";
import { at, clip, isObject, onlyMembers, parameterOf, readEmbeddedText, refuse, translate, REQUIRED_ENTITIES, type ObjectEntry } from "./core.js";
import { undeclaredInputs } from "./code-inputs.js";
import { CONFIG_MEMBERS, kindsOf } from "./members.js";
import { xEntity, type Grant } from "./entity.js";
import { checkConnectionUse, classifiedByUnit, nameableKeysOf, SYSTEM_FIELDS, type Connections, type EntitySource } from "./invariants.js";
import { openDefect } from "./notifications.js";

export interface WorkflowSource {
  key: string;
  name: string;
  description: string;
  run_as: any;
  start_access: any;
  input_schema?: unknown;
  output_schema?: unknown;
  // Ships the workflow switched on as a tool for MCP and A2A clients. Only an installation's first copy takes it:
  // after that the organization owns the switch.
  tool_enabled?: boolean;
  graph: any;
}

export interface TriggerSource {
  workflow: string;
  kind: string;
  enabled?: boolean;
  config: Record<string, unknown>;
}

export interface ActionSource {
  entity: string;
  action: Record<string, any>;
}

export const INITIATOR = { policy: "initiator" };
export const NOBODY = { mode: "restricted", group_ids: [] };

export const servicePrincipal = (paramKey: string) => ({
  policy: "service_principal",
  service_principal_id: `\${param:${paramKey}}`,
});

export const restricted = (...groupParams: string[]) => ({
  mode: "restricted",
  group_ids: groupParams.map((p) => `\${param:${p}}`),
});

export const ref = (value: string) => ({ kind: "reference", value });
export const tpl = (value: string) => ({ kind: "template", value });
// An empty string is also sent as `valueJson`: a literal whose `value` is blank
// reads as a binding nobody filled in.
export const lit = (v: unknown) =>
  typeof v === "string"
    ? v === ""
      ? { kind: "literal", value: v, valueJson: v }
      : { kind: "literal", value: v }
    : { kind: "literal", valueJson: v };
// `copy` gives the record its own copy of a file another record holds; without it such a file is refused.
export const bind = (field: string, b: object, options: { copy?: boolean } = {}) => ({
  field,
  ...b,
  ...(options.copy ? { copy: true } : {}),
});
export const NOW = tpl("{{ now() }}");

export function node(id: string, name: string, nodeType: string, params?: Record<string, unknown>, settings?: Record<string, unknown>) {
  return { id, name, node_type: nodeType, parameters: { id, label: name, ...params } as Record<string, any>, settings: settings ?? {} };
}

export function start({ subject, params }: { subject?: string; params?: boolean } = {}) {
  return node("start", "Start", "start", {
    inputContract: {
      subject: subject ? { kind: "entity", entityId: subject, arity: "single" } : { kind: "none" },
      params: params ? { kind: "schema" } : { kind: "none" },
    },
  });
}

// An End output's value is a string the platform emits, resolves or renders; a literal carried only as JSON
// (lit(true), lit(3)) has none, and the install refuses the step.
export function end(id: string, name: string, outcome?: string, outputs?: unknown) {
  const where = `end step ${id}`;
  if (outputs !== undefined) {
    if (!isObject(outputs)) refuse(where, "/parameters/outputMapping", "an object of named outputs");
    for (const [key, output] of Object.entries(outputs)) {
      const here = at("/parameters/outputMapping", key);
      if (isObject(output) && output.kind === "literal" && typeof output.value !== "string") {
        refuse(where, here, `an End output is a string, so write lit("${String(output.valueJson)}"), not lit(${JSON.stringify(output.valueJson)})`);
      }
      if (!isObject(output) || typeof output.value !== "string") refuse(where, here, "ref(...), tpl(...) or a string lit(...)");
    }
  }
  const p: Record<string, unknown> = {};
  if (outcome) p.outcomeLabel = outcome;
  if (outputs) p.outputMapping = outputs;
  return node(id, name, "end", p);
}

export const getById = (id: string, name: string, entity: string, idPath: string) =>
  node(id, name, "entity_record", { operation: "get", entityId: entity, recordIdExpr: ref(idPath) });

// One record found through an alternate key, without a write: `body` binds the key's fields. Its output is
// `nodes.<id>.output.found` and `.record`.
export const getByKey = (id: string, name: string, entity: string, matchKey: string, body: unknown) =>
  node(id, name, "entity_record", { operation: "get", entityId: entity, matchBy: "key", matchKey, body });

// The key an object of package `packageId` gets when it is installed. A path names a profile inverse, or a field
// the package adds to another package's entity, by it, since nothing rewrites a key inside a path at install.
export function installedKey(packageId: string, key: string): string {
  if (typeof packageId !== "string" || !packageId.includes("/")) refuse("installedKey", "", `${JSON.stringify(packageId)} is not a package id`);
  return `${packageId.replace(/[/-]/g, "_")}__${key}`;
}

export function search(
  id: string,
  name: string,
  entity: string,
  filters: unknown,
  { sort, dir, limit, fields }: { sort?: unknown; dir?: unknown; limit?: number; fields?: string[] } = {},
) {
  const p: Record<string, unknown> = { operation: "search", entityId: entity, filters };
  if (sort) p.sort = sort;
  if (dir) p.dir = dir;
  if (limit) p.limit = limit;
  // Only the named fields come back, and only they count against an agent that reads the result.
  if (fields) p.fields = fields;
  return node(id, name, "entity_record", p);
}

export const flt = (field: string, op: string, value: unknown) => ({ field, op, value });

// Where a record an Entity Record step creates is filed, on an entity classified by unit. The creator's unit is the
// default and writes nothing; a trigger's record passes its own unit on; a unit comes from a context path holding one
// or a unit_ref parameter, never from an id, which is one organization's.
export type DestinationUnit =
  | { from: "creator" }
  | { from: "trigger" }
  | { from: "unit"; unit: string };

export interface DestinationOptions {
  destinationUnit?: DestinationUnit;
}

const UNIT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIT_PARAMETER = /^\$\{param:[a-z][a-z0-9_-]*\}$/;
const DESTINATION_SOURCES = ["creator", "trigger", "unit"];

function destinationOf(where: string, options: unknown): { destinationUnit: Record<string, unknown> } | Record<string, never> {
  checkOptions(where, "", options, ["destinationUnit"]);
  const destination = (options as DestinationOptions).destinationUnit ?? { from: "creator" };
  const pointer = "/parameters/destinationUnit";
  if (!isObject(destination) || !("from" in destination)) {
    refuse(where, pointer, `write { from: "creator" | "trigger" | "unit" }, not ${shown(destination)}`);
  }
  onlyMembers(destination, CONFIG_MEMBERS.destination_unit!, where, pointer);
  if (!DESTINATION_SOURCES.includes(destination.from as string)) refuse(where, at(pointer, "from"), `one of ${DESTINATION_SOURCES.join(", ")}`);
  if (destination.from !== "unit") {
    if ("unit" in destination) refuse(where, at(pointer, "unit"), `from: "${destination.from as string}" names no unit`);
    return destination.from === "creator" ? {} : { destinationUnit: { mode: "inherit_trigger" } };
  }
  const unit = destination.unit;
  const unitAt = at(pointer, "unit");
  if (typeof unit !== "string" || unit === "") refuse(where, unitAt, "name the unit: a context path such as nodes.batch.output.record.unit, or ${param:key} of a unit_ref parameter");
  if (UNIT_ID.test(unit)) refuse(where, unitAt, "a package never names an organization's unit: bind a context path or a unit_ref parameter");
  if (unit.includes("${") && !UNIT_PARAMETER.test(unit)) refuse(where, unitAt, `a unit is a context path or \${param:key}, not ${clip(unit)}`);
  return { destinationUnit: { mode: "unit", unitId: UNIT_PARAMETER.test(unit) ? lit(unit) : ref(unit) } };
}

export const create = (id: string, name: string, entity: string, body: unknown, options: DestinationOptions = {}) =>
  node(id, name, "entity_record", {
    operation: "create",
    entityId: entity,
    body,
    ...destinationOf(`create step ${id}`, options),
  });

export function update(
  id: string,
  name: string,
  entity: string,
  idPath: string,
  body: unknown,
  { expect, check }: { expect?: unknown; check?: unknown } = {},
) {
  const p: Record<string, unknown> = { operation: "update", entityId: entity, recordIdExpr: ref(idPath), body };
  if (expect) p.expect = expect;
  if (check) p.conversationCheck = check;
  return node(id, name, "entity_record", p);
}

export const updateMany = (id: string, name: string, entity: string, filters: unknown, body: unknown) =>
  node(id, name, "entity_record", { operation: "update_many", entityId: entity, filters, body });

// The platform's cap on one Code step's source, counted in UTF-8 bytes (MAX_SOURCE_BYTES in the workflow engine's
// Code node). It is per step: a file two steps use is counted for each.
export const CODE_SOURCE_MAX_BYTES = 256 * 1024;

export interface CreateManyOptions extends DestinationOptions {
  itemAlias?: string;
  indexAlias?: string;
}

// One record per element of the list at `items`. The body reads the element as `item.<field>`, or under
// `itemAlias`; the platform caps a step at 5,000 elements and writes all of them or none.
export function createMany(id: string, name: string, entity: string, items: string, body: unknown, options: CreateManyOptions = {}) {
  const where = `create_many step ${id}`;
  checkOptions(where, "", options, ["itemAlias", "indexAlias", "destinationUnit"]);
  const { itemAlias, indexAlias, destinationUnit } = options;
  const p: Record<string, unknown> = { operation: "create_many", entityId: entity, items: ref(items), body };
  if (itemAlias !== undefined) p.itemAlias = itemAlias;
  if (indexAlias !== undefined) p.indexAlias = indexAlias;
  return node(id, name, "entity_record", { ...p, ...destinationOf(where, destinationUnit === undefined ? {} : { destinationUnit }) });
}

export interface UpdateEachOptions {
  itemAlias?: string;
  indexAlias?: string;
  expect?: unknown;
}

// Each element of the list at `items` names one record, by the path `idPath`, and the values to write to it. The
// element is read as `item.<field>`, or under `itemAlias`, in `idPath`, the body and `expect`. The step writes all of
// them or none: a record named twice, one not found, or an `expect` that no longer holds fails it. It shares
// update_many's cap of 5,000.
export function updateEach(
  id: string,
  name: string,
  entity: string,
  items: string,
  idPath: string,
  body: unknown,
  options: UpdateEachOptions = {},
) {
  checkOptions(`update_each step ${id}`, "", options, ["itemAlias", "indexAlias", "expect"]);
  const { itemAlias, indexAlias, expect } = options;
  const p: Record<string, unknown> = { operation: "update_each", entityId: entity, items: ref(items), recordIdExpr: ref(idPath), body };
  if (itemAlias !== undefined) p.itemAlias = itemAlias;
  if (indexAlias !== undefined) p.indexAlias = indexAlias;
  if (expect !== undefined) p.expect = expect;
  return node(id, name, "entity_record", p);
}

// A parameter is a whole string value, never part of one. A text parameter that a template needs, such as
// the inbound domain in a Reply-To, is read into a variable by this first step, and the template reads
// `{{ vars.<name> }}`. A variable's declared default is not used because a workflow started by a Call
// Workflow step does not seed its declared variables. The value is a literal, so a name holding `{{` is
// never rendered as a template.
export const readParameters = (...names: string[]) =>
  node("params", "Read the app's parameters", "set_variable", {
    assignments: names.map((name) => ({ target: name, kind: "literal", valueJson: `\${param:${name}}` })),
  });

export const decision = (id: string, name: string, branches: unknown[]) => node(id, name, "decision", { branches });
export const when = (edge: string, cond: unknown) => ({ edgeIds: [edge], when: cond });
export const otherwise = (edge: string) => ({ edgeIds: [edge], default: true });

// A Fork starts all its arms at once, one edge each, named arm_1, arm_2 and so on. Publish pairs it with the nearest
// Join that every arm reaches; the Join waits for all of them and has no options.
export function fork(id: string, name: string, armEdges: string[]) {
  const where = `fork step ${id}`;
  if (!Array.isArray(armEdges) || armEdges.length < 2 || armEdges.some((e) => typeof e !== "string" || e === "")) {
    refuse(where, "/parameters/arms", `a Fork has at least two arms, each one edge id, not ${shown(armEdges)}`);
  }
  const twice = armEdges.find((e, i) => armEdges.indexOf(e) !== i);
  if (twice !== undefined) refuse(where, "/parameters/arms", `edge ${twice} is named twice; each arm has an edge of its own`);
  return node(id, name, "fork", { arms: armEdges.map((edge, i) => ({ id: `arm_${i + 1}`, edgeIds: [edge] })) });
}

export const join = (id: string, name: string) => node(id, name, "join");

export type SigningDocument =
  | { id: string; source: "renderDocumentTemplate"; documentTemplateId: string; fieldMapping: Record<string, unknown>; filenameTemplate?: string }
  | { id: string; source: "upstreamFile"; attachment: { nodeId: string; documentId: string } }
  | { id: string; source: "reviewDocument"; reviewDocumentId: string };

const shown = (value: unknown): string => clip(JSON.stringify(value) ?? String(value));

// A build module is plain JavaScript, so the types protect no one, and an option the builder has no rule for
// would be dropped silently. A name the wire format uses is refused with the option that means it.
type Refusal = [member: string, message: string];
const wireName = (wire: string, option: string): Refusal => [wire, `write ${option}, not ${wire}`];

function checkOptions(where: string, pointer: string, options: unknown, allowed: readonly string[], refused: Refusal[] = []): void {
  if (!isObject(options)) refuse(where, pointer, `expected { ${allowed.join(", ")} }, not ${shown(options)}`);
  for (const [member, message] of refused) {
    if (Object.hasOwn(options, member) && !allowed.includes(member)) refuse(where, at(pointer, member), message);
  }
  onlyMembers(options, allowed, where, pointer);
}

export const doc = {
  template: (
    id: string,
    templateRef: string,
    options: { fieldMapping?: Record<string, unknown>; filename?: string } = {},
  ): SigningDocument => {
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
  upstream: (id: string, nodeId: string, documentId: string): SigningDocument => ({
    id,
    source: "upstreamFile",
    attachment: { nodeId, documentId },
  }),
  review: (id: string, reviewDocumentId: string): SigningDocument => ({ id, source: "reviewDocument", reviewDocumentId }),
};

interface UserSigner {
  kind: "user";
  id: string;
}

interface DynamicSigner {
  kind: "dynamic";
  source: { type: "initiator" } | { type: "fieldUser"; path: string } | { type: "taskActor"; nodeId: string } | { type: "previousTaskActor" };
  relation: { type: "direct" } | { type: "manager"; levels: number };
  manager(levels: number): DynamicSigner;
}

export type Signer = UserSigner | DynamicSigner;

// The platform climbs at most this many supervisors and clamps a larger number silently.
const MAX_MANAGER_LEVELS = 5;

function dynamicSigner(source: DynamicSigner["source"], relation: DynamicSigner["relation"] = { type: "direct" }): DynamicSigner {
  const built = { kind: "dynamic", source, relation } as DynamicSigner;
  // Not enumerable: manager builds the signer and is never part of what is written.
  Object.defineProperty(built, "manager", {
    enumerable: false,
    value: (levels: number) => {
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
  field: (path: string) => {
    if (typeof path !== "string" || path.trim() === "") {
      refuse("signer", "/source/path", `signer.field needs the path of a person field, such as subject.record.owner, not ${shown(path)}`);
    }
    return dynamicSigner({ type: "fieldUser", path });
  },
  stepActor: (nodeId: string) => {
    if (typeof nodeId !== "string" || nodeId.trim() === "") {
      refuse("signer", "/source/nodeId", `signer.stepActor needs the id of an earlier step, not ${shown(nodeId)}`);
    }
    return dynamicSigner({ type: "taskActor", nodeId });
  },
  previousActor: () => dynamicSigner({ type: "previousTaskActor" }),
  user: (paramKey: string): UserSigner => ({ kind: "user", id: `\${param:${paramKey}}` }),
};

export type SignatureDecline = "fail" | { edge: string };
export type SigningDecline = SignatureDecline | { action: string };

export interface SignatureOptions {
  documents: SigningDocument[];
  signers: { role: string; who: Signer; order?: number }[];
  method?: "server_email" | "client_cert";
  routing?: "parallel" | "sequential";
  onDecline?: SignatureDecline;
  certVisible?: boolean;
  task?: { name?: string; description?: string };
}

export interface SigningOptions {
  documents?: SigningDocument[];
  method?: "server_email" | "client_cert";
  certVisible?: boolean;
  signedAction?: string;
  onDecline?: SigningDecline;
}

const SIGNING_METHODS = ["server_email", "client_cert"];
const SIGNING_ROUTINGS = ["parallel", "sequential"];

function oneOf(where: string, pointer: string, member: string, allowed: string[], value: unknown): void {
  if (typeof value !== "string" || !allowed.includes(value)) {
    refuse(where, pointer, `${member} must be ${allowed.map((a) => `"${a}"`).join(" or ")}, not ${shown(value)}`);
  }
}

function checkDocuments(where: string, pointer: string, documents: unknown, signatureStep: boolean): void {
  if (!Array.isArray(documents)) refuse(where, pointer, "documents must be a list of doc.template(...), doc.upstream(...) or doc.review(...)");
  if (signatureStep && documents.length === 0) {
    refuse(where, pointer, "a Signature step signs at least one document: pass doc.template(...) or doc.upstream(...)");
  }
  const seen = new Set<string>();
  documents.forEach((document: SigningDocument, i: number) => {
    if (signatureStep && document?.source === "reviewDocument") {
      refuse(where, at(pointer, i), "doc.review reads a Human step's review document, which a Signature step has none of: use doc.template or doc.upstream");
    }
    if (seen.has(document?.id)) refuse(where, at(at(pointer, i), "id"), `document id ${document.id} is used twice; each document needs its own id`);
    seen.add(document?.id);
  });
}

function declineRoute(where: string, pointer: string, decline: unknown, withAction: boolean): object | undefined {
  if (decline === undefined || decline === "fail") return undefined;
  const allowed = withAction ? '"fail", { edge: "<edge id>" } or { action: "<action id>" }' : '"fail" or { edge: "<edge id>" }';
  const keys = decline && typeof decline === "object" && !Array.isArray(decline) ? Object.keys(decline) : [];
  if (!withAction && keys.length === 1 && keys[0] === "action") {
    refuse(where, pointer, `a Signature step declines to ${allowed}; { action } belongs to a Human step's signing()`);
  }
  if (keys.length !== 1 || !(keys[0] === "edge" || (withAction && keys[0] === "action"))) {
    refuse(where, pointer, `onDecline must be ${allowed}, not ${shown(decline)}; the builder has no "continue"`);
  }
  const key = keys[0]!;
  const id = (decline as Record<string, unknown>)[key];
  if (typeof id !== "string" || id === "") {
    refuse(where, pointer, `onDecline { ${key} } names ${key === "edge" ? "an edge" : "an action"} id, not ${shown(id)}`);
  }
  return key === "edge" ? { kind: "branch", edgeIds: [id] } : { kind: "action", actionId: id };
}

export function signature(id: string, name: string, options: SignatureOptions) {
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
  if (method !== undefined) oneOf(where, at(base, "signingMethod"), "method", SIGNING_METHODS, method);
  if (routing !== undefined) oneOf(where, at(base, "routing"), "routing", SIGNING_ROUTINGS, routing);
  const route = declineRoute(where, at(base, "onDecline"), onDecline, false);
  const roles = new Set<string>();
  if (task !== undefined) checkOptions(where, at(base, "task"), task, ["name", "description"]);
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
      refuse(
        where,
        at(here, "recipient"),
        `a signer's who is signer.initiator(), signer.field(path), signer.stepActor(nodeId), signer.previousActor() or signer.user(paramKey), not ${shown(who)}`,
      );
    }
    if (roles.has(role)) refuse(where, at(here, "roleKey"), `role ${role} is used twice; each signer needs its own role`);
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

export function signing(options: SigningOptions = {}) {
  const where = "signing";
  checkOptions(where, "", options, ["documents", "method", "certVisible", "signedAction", "onDecline"], [
    wireName("signingMethod", "method"),
    wireName("signedActionId", "signedAction"),
  ]);
  const { documents, method, certVisible, signedAction, onDecline } = options;
  checkDocuments(where, "/documents", documents ?? [], false);
  if (method !== undefined) oneOf(where, "/signingMethod", "method", SIGNING_METHODS, method);
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

export const signedFiles = (stepId: string) => ref(`nodes.${stepId}.output.generated_files`);
export const signingStatus = (stepId: string) => ref(`nodes.${stepId}.output.status`);

export const setvar = (id: string, name: string, assignments: [string, object][]) =>
  node(id, name, "set_variable", { assignments: assignments.map(([target, b]) => ({ target, ...b })) });

// `subjectSource` is a path the engine reads as the called run's record id. Any other shape builds and installs, and
// then fails the step on every run, so it is refused here.
export function call(
  id: string,
  name: string,
  workflow: string,
  subjectSource?: string | null,
  inputs: [string, object][] = [],
  settings?: Record<string, unknown>,
) {
  if (subjectSource != null && typeof subjectSource !== "string") {
    refuse(
      `call step ${id}`,
      "/parameters/subjectSource",
      `subjectSource is the path of the called run's record id, such as "subject.record_id" or "nodes.<id>.output.record.id", or leave it out to pass the caller's own record; not ${shown(subjectSource)}`,
    );
  }
  const p: Record<string, unknown> = { workflowId: workflow, inputBindings: inputs.map(([target, b]) => ({ target, ...b })) };
  if (subjectSource) p.subjectSource = subjectSource;
  return node(id, name, "call_workflow", p, settings);
}

export const code = (id: string, name: string, file: string, inputs: [string, object][], outputSchema: unknown) =>
  node(id, name, "code", {
    language: "javascript",
    source: { $file: file },
    inputs: inputs.map(([n, b]) => ({ name: n, ...b })),
    outputSchema,
    timeoutSecs: 10,
  });

type Binding = { kind?: unknown; value?: unknown; valueJson?: unknown };

export type WebhookAuth =
  | { kind: "bearer"; secret: string }
  | { kind: "api_key_header"; secret: string; header: string }
  | { kind: "basic"; secret: string; username: string };

export interface WebhookOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string | Record<string, Binding>;
  auth?: WebhookAuth;
  retries?: number;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const WEBHOOK_AUTH: Record<string, string[]> = {
  bearer: ["kind", "secret"],
  api_key_header: ["kind", "secret", "header"],
  basic: ["kind", "secret", "username"],
};

// The designer's words for a body row: a reference is a `variable`, a template a `literal`, and a typed
// literal a `literal_json`, which is sent as it is.
function bodyRow(where: string, pointer: string, key: string, binding: Binding): object {
  if (!isObject(binding) || !["reference", "template", "literal"].includes(binding.kind as string)) {
    refuse(where, pointer, `a body value is ref(...), tpl(...) or lit(...), not ${shown(binding)}`);
  }
  if (binding.kind === "reference") return { key, kind: "variable", value: binding.value };
  if (binding.kind === "template") return { key, kind: "literal", value: binding.value };
  const value = "valueJson" in binding ? binding.valueJson : binding.value;
  return { key, kind: "literal_json", value: JSON.stringify(value), valueJson: value };
}

// A secret is a `secret_ref` parameter of the package: the step sends its value and the package never holds it.
function webhookAuth(where: string, pointer: string, auth: unknown): object {
  const shapes = '{ kind: "bearer", secret }, { kind: "api_key_header", secret, header } or { kind: "basic", secret, username }';
  if (!isObject(auth) || typeof auth.kind !== "string" || !Object.hasOwn(WEBHOOK_AUTH, auth.kind)) {
    refuse(where, at(pointer, "kind"), `auth is ${shapes}, not ${shown(auth)}`);
  }
  const members = WEBHOOK_AUTH[auth.kind as string]!;
  onlyMembers(auth, members, where, pointer);
  for (const member of members.slice(1)) {
    if (typeof auth[member] !== "string" || auth[member] === "") refuse(where, pointer, `a ${auth.kind} auth names its ${member}: { ${members.join(", ")} }`);
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
export function webhook(id: string, name: string, options: WebhookOptions, settings?: Record<string, unknown>) {
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
  if (method !== undefined) oneOf(where, at(config, "method"), "method", HTTP_METHODS, method);
  if (headers !== undefined && (!isObject(headers) || Object.values(headers).some((v) => typeof v !== "string"))) {
    refuse(where, at(config, "headers"), `headers map a header's name to a string or a template, not ${shown(headers)}`);
  }
  if (retries !== undefined && (!Number.isInteger(retries) || retries < 0)) {
    refuse(where, at(base, "retries"), `retries is a whole number of attempts after the first, not ${shown(retries)}`);
  }
  const written: Record<string, unknown> = { url, method: method ?? "POST" };
  if (headers !== undefined) written.headers = headers;
  if (body === undefined) written.bodyMode = "none";
  else if (typeof body === "string") Object.assign(written, { bodyMode: "text", body });
  else if (isObject(body)) {
    const rows = at(config, "bodyTemplate");
    written.bodyMode = "object";
    written.bodyTemplate = Object.entries(body).map(([key, binding], i) => bodyRow(where, at(rows, i), key, binding as Binding));
  } else refuse(where, at(config, "body"), `body is a string or an object of ref(...), tpl(...) and lit(...), not ${shown(body)}`);
  if (auth !== undefined) written.auth = webhookAuth(where, at(config, "auth"), auth);
  return node(id, name, "webhook", { webhook: written, ...(retries === undefined ? {} : { retries }) }, settings);
}

export interface ExtractTextOptions {
  mode?: "single" | "multi";
  format?: "markdown" | "text";
  onOversize?: "fail" | "truncate";
}

// A file's text as the step's output: `text` for one file (`mode: "single"`, the default), `items[].text` for a
// list. A template that only needs the text can read `{{ content(<file>) }}` without a step.
export function extractText(id: string, name: string, source: string, options: ExtractTextOptions = {}, settings?: Record<string, unknown>) {
  const where = `extract_text step ${id}`;
  const base = "/parameters";
  checkOptions(where, base, options, ["mode", "format", "onOversize"], [wireName("on_oversize", "onOversize")]);
  if (typeof source !== "string" || source.trim() === "") {
    refuse(where, at(base, "source"), `extract_text reads the file at a path, such as subject.record.<file field> or input.item, not ${shown(source)}`);
  }
  const { mode, format, onOversize } = options;
  if (mode !== undefined) oneOf(where, at(base, "mode"), "mode", ["single", "multi"], mode);
  if (format !== undefined) oneOf(where, at(base, "format"), "format", ["markdown", "text"], format);
  if (onOversize !== undefined) oneOf(where, at(base, "onOversize"), "onOversize", ["fail", "truncate"], onOversize);
  return node(id, name, "extract_text", {
    source,
    mode: mode ?? "single",
    ...(format === undefined ? {} : { format }),
    ...(onOversize === undefined ? {} : { onOversize }),
  }, settings);
}

export interface IntegrationOptions {
  connection: string;
  operation: "get" | "search" | "upsert";
  objectType: string;
  identityField?: string;
  mappings?: ([string, object] | [string, object, string])[];
  delivery?: "queued" | "inline";
  captureTo?: string;
  associations?: { toObjectType: string; idSource: string }[];
  safeFieldPaths?: string[];
}

const SEARCH_OPERATORS = ["eq", "neq", "contains", "starts_with", "gt", "lt", "known", "unknown"];

// A read or a write on the connection the `connection_ref` parameter `connection` names. A mapping is
// [provider field, binding], and on a search [field, binding, operator] (eq when left out).
export function integration(id: string, name: string, options: IntegrationOptions, settings?: Record<string, unknown>) {
  const where = `integration step ${id}`;
  const base = "/parameters";
  checkOptions(
    where,
    base,
    options,
    ["connection", "operation", "objectType", "identityField", "mappings", "delivery", "captureTo", "associations", "safeFieldPaths"],
    [
      ["provider", "a package names the account with connection: \"<connection_ref parameter>\"; the installer writes the provider"],
      wireName("externalAccountId", "connection"),
    ],
  );
  const { connection, operation, objectType, identityField, mappings, delivery, captureTo, associations, safeFieldPaths } = options;
  if (typeof connection !== "string" || connection === "" || connection.includes("{")) {
    refuse(where, at(base, "connection"), `connection is the key of a connection_ref parameter, such as "erp", not ${shown(connection)}`);
  }
  oneOf(where, at(base, "operation"), "operation", ["get", "search", "upsert"], operation);
  if (typeof objectType !== "string" || objectType === "") refuse(where, at(base, "objectType"), `objectType is the provider's object, such as "vendor", not ${shown(objectType)}`);
  if (operation !== "search" && (typeof identityField !== "string" || identityField === "")) {
    refuse(where, at(base, "identityField"), "a get and an upsert name the field they key on, such as identityField: \"email\"");
  }
  if (delivery !== undefined) {
    if (operation !== "upsert") refuse(where, at(base, "delivery"), "only an upsert has a delivery; a read always answers inside the step");
    oneOf(where, at(base, "delivery"), "delivery", ["queued", "inline"], delivery);
  }
  const written = (mappings ?? []).map((entry, i) => {
    const here = at(at(base, "mappings"), i);
    if (!Array.isArray(entry) || typeof entry[0] !== "string" || !isObject(entry[1])) {
      refuse(where, here, `a mapping is [provider field, ref(...) | tpl(...) | lit(...)], not ${shown(entry)}`);
    }
    const [target, binding, operator] = entry;
    if (operator !== undefined) {
      if (operation !== "search") refuse(where, at(here, "operator"), "only a search compares with an operator; a get and an upsert key on equality");
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

export type NotifySource =
  | { type: "field"; path: string }
  | { type: "user"; user_id: string }
  | { type: "group"; group_id: string }
  | { type: "initiator" };

// The first platform month whose builds read a package's notification kinds and its Notify steps.
export const NOTIFICATIONS_PLATFORM = "2026.11";

export const recipient = {
  field: (path: string): NotifySource => ({ type: "field", path }),
  user: (paramKey: string): NotifySource => ({ type: "user", user_id: `\${param:${paramKey}}` }),
  group: (paramKey: string): NotifySource => ({ type: "group", group_id: `\${param:${paramKey}}` }),
  initiator: (): NotifySource => ({ type: "initiator" }),
};

export const notify = (id: string, name: string, notification: string, recipients: NotifySource[], options: { except?: NotifySource[] } = {}) =>
  node(id, name, "notify", { notification, recipients, except: options.except ?? [] });

export const edges = (...triples: [string, string, string][]) => triples.map(([id, from, to]) => ({ id, from, to }));

export const upsert = (id: string, name: string, entity: string, matchKey: string, body: unknown, options: DestinationOptions = {}) =>
  node(id, name, "entity_record", {
    operation: "upsert",
    entityId: entity,
    matchBy: "key",
    matchKey,
    body,
    ...destinationOf(`upsert step ${id}`, options),
  });

export function graph(name: string, nodes: { id: string; node_type: string }[], edgeList: unknown[], transaction?: unknown) {
  const g: Record<string, unknown> = {
    schemaVersion: "1.0",
    name,
    start: "start",
    end: nodes.filter((n) => n.node_type === "end").map((n) => n.id),
    nodes,
    edges: edgeList,
  };
  if (transaction) g.transaction = transaction;
  return g;
}

export const workflow = (
  key: string,
  name: string,
  description: string,
  runAs: unknown,
  startAccess: unknown,
  g: unknown,
  inputSchema: unknown = null,
): WorkflowSource => ({
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

function checkLeaf(where: string, c: any): void {
  const [[op, args]] = Object.entries(c) as [string, any][];
  if (!DECOMPILABLE.has(op!)) throw new Error(`${where}: operator ${op} is not one the designer round-trips`);
  if (!Array.isArray(args) || !args[0] || !("var" in args[0])) throw new Error(`${where}: compare a var: ${JSON.stringify(c)}`);
  if (op !== "!!" && op !== "!" && args[1] && typeof args[1] === "object" && "var" in args[1]) {
    throw new Error(`${where}: two vars compared; go through a Set Variable step: ${JSON.stringify(c)}`);
  }
}

export function checkCondition(where: string, cond: any): void {
  const [[op, args]] = Object.entries(cond) as [string, any][];
  if (op === "and" || op === "or") args.forEach((a: unknown) => checkLeaf(where, a));
  else checkLeaf(where, cond);
}

// Every literal `var` path a JSONLogic condition names, at any depth.
function varPaths(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) for (const item of value) varPaths(item, out);
  else if (value && typeof value === "object") {
    for (const [key, arg] of Object.entries(value)) {
      const path = key === "var" ? (Array.isArray(arg) ? arg[0] : arg) : undefined;
      if (typeof path === "string" && path !== "") out.push(path);
      else varPaths(arg, out);
    }
  }
  return out;
}

// What publish refuses of a Human step's end condition that the graph alone shows: a step inside a loop's body (its
// run is about the item, not the record), and a read of anything but a top-level field of the run's record. Unlike a
// Decision's, the condition may use any JSONLogic operator: AgentFlow's designer shows it read only.
function checkEndWhen(where: string, n: any, inBody: boolean): void {
  const endWhen = n.parameters?.endWhen;
  if (!endWhen) return;
  if (inBody) throw new Error(`${where}: ${n.id} has an endWhen, which a step inside a For each body cannot have`);
  for (const path of varPaths(endWhen.condition)) {
    const field = /^subject\.record\.([^.[\]]+)$/.exec(path)?.[1];
    if (field === undefined || field === "id" || field === "metadata") {
      throw new Error(`${where}: ${n.id}'s endWhen reads ${path}; an end condition may read only a field of the run's record, as subject.record.<field> (not id or metadata)`);
    }
  }
}

// The first platform month whose builds follow a signing step's decline route; an older one drops it unread.
export const DECLINE_ROUTE_PLATFORM = "2026.11";

const routedEdges = (route: any): string[] => (route?.kind === "branch" && Array.isArray(route.edgeIds) ? route.edgeIds : []);

// A Signature step with a decline route owns those edges, and has exactly one more: the signed path.
function checkSignedPath(where: string, n: any, outbound: Set<string>): void {
  const routed = routedEdges(n.parameters.onDecline);
  for (const e of routed) {
    if (!outbound.has(e)) throw new Error(`${where}: ${n.id} routes a decline to ${e}, which is not an edge leaving it`);
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
  "image", "learn", "entity_relationship", "code", "notify", "entity_record",
];

// The operations an Entity Record step may have inside a loop (`loop_record_operation` in the engine), none of them
// with a conversation check. A lap re-run after a failure repeats its write: an update guarded by `expect` skips the
// second, and a create or a bulk write would repeat.
const LOOP_RECORD_OPERATIONS = ["get", "search", "update"];

// A write checked against a conversation turn is refused inside a loop as well: with its Agent step before the loop,
// every lap after the first finds the write already made from that turn and writes nothing.
const recordOperation = (n: any): string =>
  (n.parameters?.conversationCheck != null ? `${n.parameters?.operation ?? "get"} with a conversation check` : n.parameters?.operation ?? "get");

// Whether a step follows one of several edges on each visit, so an edge it owns is not followed every time.
const chooses = (n: any): boolean =>
  n.node_type === "decision" || n.node_type === "human" || (n.node_type === "signature" && n.parameters?.onDecline?.kind === "branch");

// Tarjan's strongly connected components of the steps `ids` names, the grouping publish finds loops by.
function stronglyConnected(ids: string[], out: Map<string, any[]>): string[][] {
  const inside = new Set(ids);
  let next = 0;
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const held = new Set<string>();
  const groups: string[][] = [];
  const connect = (v: string): void => {
    index.set(v, next);
    low.set(v, next);
    next += 1;
    stack.push(v);
    held.add(v);
    for (const e of out.get(v) ?? []) {
      if (!inside.has(e.to)) continue;
      if (!index.has(e.to)) {
        connect(e.to);
        low.set(v, Math.min(low.get(v)!, low.get(e.to)!));
      } else if (held.has(e.to)) low.set(v, Math.min(low.get(v)!, index.get(e.to)!));
    }
    if (low.get(v) !== index.get(v)) return;
    const group: string[] = [];
    let w: string;
    do {
      w = stack.pop()!;
      held.delete(w);
      group.push(w);
    } while (w !== v);
    groups.push(group);
  };
  for (const id of ids) if (!index.has(id)) connect(id);
  return groups;
}

const cyclic = (ids: string[], out: Map<string, any[]>): boolean =>
  stronglyConnected(ids, out).some((group) => group.length > 1 || (out.get(group[0]!) ?? []).some((e) => e.to === group[0]));

// A loop publish runs: entered at one step, the header, and with no second loop inside it.
function checkLoops(where: string, g: any, ids: string[], out: Map<string, any[]>): void {
  const kinds = new Map<string, string>(g.nodes.map((n: any) => [n.id, n.node_type]));
  for (const group of stronglyConnected(ids, out)) {
    if (!cyclic(group, out)) continue;
    const members = new Set(group);
    const through = ids.filter((id) => members.has(id));
    const named = through.join(", ");
    for (const id of through) {
      const kind = kinds.get(id)!;
      if (!LOOP_KINDS.includes(kind)) {
        throw new Error(
          `${where}: ${id} (${kind}) is inside the loop through ${named}; a loop holds only ${LOOP_KINDS.join(", ")} steps: ` +
            "move it out of the loop, or repeat it over items with a For Each",
        );
      }
      const step = g.nodes.find((n: any) => n.id === id);
      if (kind === "entity_record" && !LOOP_RECORD_OPERATIONS.includes(recordOperation(step))) {
        throw new Error(
          `${where}: ${id} (entity_record ${recordOperation(step)}) is inside the loop through ${named}; a record step in a loop ` +
            `gets, searches or updates one record (${LOOP_RECORD_OPERATIONS.join(", ")}) with no conversation check, since a lap run again after a failure ` +
            "would repeat it: move it out of the loop, or repeat it over items with a For Each",
        );
      }
    }
    const entries = new Set<string>();
    for (const e of g.edges) if (members.has(e.to) && !members.has(e.from)) entries.add(e.to);
    for (const id of through) if (id === g.start || !g.edges.some((e: any) => e.to === id)) entries.add(id);
    if (entries.size !== 1) {
      throw new Error(`${where}: the loop through ${named} is entered at ${through.filter((id) => entries.has(id)).join(", ")}; route every entry through one step`);
    }
    const [header] = entries;
    const forward = new Map<string, any[]>();
    for (const e of g.edges) {
      if (!members.has(e.from) || !members.has(e.to) || e.to === header) continue;
      if (!forward.has(e.from)) forward.set(e.from, []);
      forward.get(e.from)!.push(e);
    }
    if (cyclic(through, forward)) {
      throw new Error(`${where}: the loop through ${named} holds another loop; loops do not nest: flatten them, or repeat over items with a For Each`);
    }
  }
}

// What publish refuses of a Fork/Join region that needs no pairing to see. Publish also pairs each Fork with the
// Join that every arm reaches, and refuses arms that share a step or a Join step that does not run once per arm.
function checkRegions(where: string, g: any, out: Map<string, any[]>): void {
  const byId = new Map<string, any>(g.nodes.map((n: any) => [n.id, n]));
  const reached = (from: string): Set<string> => {
    const seen = new Set<string>();
    const queue = [from];
    while (queue.length) for (const e of out.get(queue.shift()!) ?? []) if (!seen.has(e.to)) seen.add(e.to), queue.push(e.to);
    return seen;
  };
  const forks = g.nodes.filter((n: any) => n.node_type === "fork");
  const afterForks = new Set(forks.flatMap((f: any) => [...reached(f.id)]));
  for (const f of forks) {
    if (![...reached(f.id)].some((id) => byId.get(id)?.node_type === "join")) {
      throw new Error(`${where}: Fork ${f.id} reaches no Join; a Fork's arms meet again at a Join`);
    }
  }
  for (const j of g.nodes.filter((n: any) => n.node_type === "join")) {
    if (!afterForks.has(j.id)) throw new Error(`${where}: Join ${j.id} has no Fork before it`);
    for (const e of g.edges.filter((edge: any) => edge.to === j.id)) {
      const from = byId.get(e.from);
      if (chooses(from)) {
        throw new Error(
          `${where}: ${from.id} (${from.node_type}) feeds Join ${j.id} directly on ${e.id}; let its edges meet at one plain step, such as a Set Variable, before the Join`,
        );
      }
    }
  }
}

// A Fork's arms, one edge each and each to a step of its own; their edges are the ones it owns.
function forkEdges(where: string, n: any, edgeTo: Map<string, string>): string[] {
  const arms: any[] = Array.isArray(n.parameters.arms) ? n.parameters.arms : [];
  if (arms.length < 2) throw new Error(`${where}: Fork ${n.id} has ${arms.length} arm${arms.length === 1 ? "" : "s"}; a Fork has at least two`);
  const armTo = new Map<string, string>();
  for (const arm of arms) {
    const wired: unknown[] = Array.isArray(arm?.edgeIds) ? arm.edgeIds : [];
    if (wired.length !== 1) throw new Error(`${where}: Fork ${n.id} arm ${arm?.id} wires ${wired.length} edges; an arm wires exactly one`);
    const to = edgeTo.get(wired[0] as string);
    if (to === undefined) continue;
    if (armTo.has(to)) throw new Error(`${where}: Fork ${n.id} sends arms ${armTo.get(to)} and ${arm.id} to ${to}; each arm goes to a step of its own`);
    armTo.set(to, arm.id);
  }
  return arms.map((arm) => arm.edgeIds[0]);
}

// The rules publish enforces that are easiest to break by hand: one outbound
// edge per plain step, branch, action and arm edges owned by their node, a
// routed Signature step's signed path beside its decline route, everything
// reachable, loops publish can run (see checkLoops), the Fork/Join refusals
// checkRegions can see, Decision conditions the designer can round-trip, and what an end condition may read.
// The paths publish reads as one path each and refuses when they name no step, or one not upstream: an Entity Record
// step's record id (get, update and update_each), a create_many or update_each step's list, body, filters and `q`; a Set Variable step's assignments; a Decision's
// conditions; a For each step's list; and an Email step's list when it sends one message per item (in single mode
// publish ignores a `listSource` the designer kept). A path anywhere else is left to publish, which judges some
// positions more loosely. Each comes with its pointer from the step.
function readPaths(n: any): [path: string, pointer: string][] {
  const p = n.parameters;
  if (!isObject(p)) return [];
  const one = (b: unknown, pointer: string): [string, string][] =>
    isObject(b) && b.kind === "reference" && typeof b.value === "string" ? [[b.value, at(pointer, "value")]] : [];
  const refs = (bindings: unknown, pointer: string): [string, string][] =>
    Array.isArray(bindings) ? bindings.flatMap((b, i) => one(b, at(pointer, i))) : one(bindings, pointer);
  switch (n.node_type) {
    case "entity_record":
      return [
        ...(p.operation === "get" || p.operation === "update" || p.operation === "update_each" ? refs(p.recordIdExpr, "/parameters/recordIdExpr") : []),
        ...(p.operation === "create_many" || p.operation === "update_each" ? refs(p.items, "/parameters/items") : []),
        ...refs(p.body, "/parameters/body"),
        ...(Array.isArray(p.filters) ? p.filters.flatMap((f: any, i: number) => refs(f?.value, `/parameters/filters/${i}/value`)) : []),
        ...refs(p.q, "/parameters/q"),
      ];
    case "set_variable":
      return refs(p.assignments, "/parameters/assignments");
    case "decision":
      return Array.isArray(p.branches)
        ? p.branches.flatMap((b: any, i: number) => (b?.when ? varPaths(b.when).map((v): [string, string] => [v, `/parameters/branches/${i}/when`]) : []))
        : [];
    case "for_each":
      return typeof p.listSource === "string" ? [[p.listSource, "/parameters/listSource"]] : [];
    case "email":
      return isObject(p.email) && p.email.perItemMode === true && typeof p.email.listSource === "string"
        ? [[p.email.listSource, "/parameters/email/listSource"]]
        : [];
    default:
      return [];
  }
}

// The steps each step of a graph comes after on some path of its edges, a loop's back edge included. Publish resolves
// a step's output only for such a step: an upstream one on any path, even if this run did not take it. Mirrors
// compute_ancestors in backend/crates/reflexify-workflows/src/validate.rs.
function upstreamOf(g: any): Map<string, Set<string>> {
  const preds = new Map<string, string[]>();
  for (const e of g.edges) preds.set(e.to, [...(preds.get(e.to) ?? []), e.from]);
  return new Map(
    g.nodes.map((n: any) => {
      const seen = new Set<string>();
      const stack = [...(preds.get(n.id) ?? [])];
      while (stack.length) {
        const p = stack.pop()!;
        if (!seen.has(p)) seen.add(p), stack.push(...(preds.get(p) ?? []));
      }
      return [n.id, seen];
    }),
  );
}

// The graph around a loop's body: its steps, and the steps upstream of the For each step, which a `parent.nodes.<id>`
// in the body is judged against.
interface Around {
  ids: string[];
  upstream: Set<string>;
  loop: string;
}

// Publish refuses such a path that names a step its graph does not have, as it renders nothing on every run, and one
// that names a step not upstream of its reader, whose output is not there yet. A loop's body is a graph of its own and
// reads the steps around the loop as `parent.nodes.<id>`.
function checkStepPaths(where: string, g: any, outer: Around | undefined, pointer: string, upstream: Map<string, Set<string>>): void {
  const ids: string[] = g.nodes.map((n: any) => n.id);
  g.nodes.forEach((n: any, i: number) => {
    for (const [path, from] of readPaths(n)) {
      const here = `${pointer}/nodes/${i}${from}`;
      const own = /^nodes\.([^.[\]]+)/.exec(path)?.[1];
      if (own !== undefined && !ids.includes(own)) {
        const hint = outer?.ids.includes(own) ? `; a loop's body reads the step around it as parent.nodes.${own}` : "";
        refuse(where, here, `${n.id} reads ${path}, and ${own} is not a step of this graph${hint}`);
      }
      if (own !== undefined && !upstream.get(n.id)!.has(own)) {
        refuse(where, here, `${n.id} reads ${path}, but no edge path leads from ${own} to ${n.id}, so ${own} has not run when ${n.id} reads it`);
      }
      const around = /^parent\.nodes\.([^.[\]]+)/.exec(path)?.[1];
      if (around !== undefined && outer !== undefined) {
        if (!outer.ids.includes(around)) refuse(where, here, `${n.id} reads ${path}, and ${around} is not a step of the graph around the loop`);
        if (!outer.upstream.has(around)) {
          refuse(where, here, `${n.id} reads ${path}, but no edge path leads from ${around} to the For each step ${outer.loop}, so ${around} has not run when the loop starts`);
        }
      }
    }
  });
}

// `where` names the graph in a refusal that has no pointer, a loop's body as `<where>.<id>.body`; `rootWhere` names the
// workflow in one that has, as its pointer starts at the workflow's root.
export function checkGraph(where: string, g: any, inBody = false, outer?: Around, pointer = "/graph", rootWhere = where): void {
  const ids: string[] = g.nodes.map((n: any) => n.id);
  if (new Set(ids).size !== ids.length) throw new Error(`${where}: duplicate node ids`);
  if (new Set(g.edges.map((e: any) => e.id)).size !== g.edges.length) throw new Error(`${where}: duplicate edge ids`);
  const out = new Map<string, any[]>();
  for (const e of g.edges) {
    if (!ids.includes(e.from) || !ids.includes(e.to)) throw new Error(`${where}: edge ${e.id} names a missing node`);
    if (!out.has(e.from)) out.set(e.from, []);
    out.get(e.from)!.push(e);
  }
  const edgeTo = new Map<string, string>(g.edges.map((e: any) => [e.id, e.to]));
  const upstream = upstreamOf(g);
  for (const [i, n] of (g.nodes as any[]).entries()) {
    const mine = new Set((out.get(n.id) ?? []).map((e) => e.id));
    if (n.node_type === "end") {
      if (mine.size) throw new Error(`${where}: End ${n.id} has outbound edges`);
      continue;
    }
    let owned: string[] | null = null;
    if (n.node_type === "decision") {
      owned = n.parameters.branches.flatMap((b: any) => b.edgeIds);
      n.parameters.branches.forEach((b: any) => b.when && checkCondition(`${where}.${n.id}`, b.when));
    }
    if (n.node_type === "human") {
      checkEndWhen(where, n, inBody);
      const then = n.parameters.endWhen?.then;
      const acted: string[] = n.parameters.actions.flatMap((a: any) => a.edgeIds);
      const declined = routedEdges(n.parameters.signing?.onDecline);
      for (const e of declined) {
        if (acted.includes(e)) throw new Error(`${where}: ${n.id} routes a decline to ${e}, which an action already owns`);
      }
      // A deadline's timeout branch owns its edges, as publish counts them.
      const timedOut: string[] = (n.parameters.escalation?.levels ?? []).flatMap((level: any) => {
        const target = level?.action?.kind === "autoAdvance" ? level.action.target : undefined;
        return target?.kind === "timeoutBranch" && Array.isArray(target.edgeIds) ? target.edgeIds : [];
      });
      owned = [...acted, ...declined, ...timedOut, ...(then?.kind === "branch" ? then.edgeIds ?? [] : [])];
    }
    if (n.node_type === "fork") owned = forkEdges(where, n, edgeTo);
    if (n.node_type === "join") {
      const extra = Object.keys(n.parameters ?? {}).find((member) => member !== "id" && member !== "label");
      if (extra !== undefined) throw new Error(`${where}: Join ${n.id} takes no ${extra}; a Join waits for every arm`);
    }
    if (n.node_type === "for_each") {
      const around = { ids, upstream: upstream.get(n.id)!, loop: n.id };
      checkGraph(`${where}.${n.id}.body`, n.parameters.body, true, around, `${pointer}/nodes/${i}/parameters/body`, rootWhere);
    }
    if (owned) {
      const same = owned.length === mine.size && owned.every((e) => mine.has(e));
      if (!same) throw new Error(`${where}: ${n.id} owns ${owned} but has ${[...mine]}`);
    } else if (n.node_type === "signature" && routedEdges(n.parameters?.onDecline).length) {
      checkSignedPath(where, n, mine);
    } else if (mine.size !== 1) {
      throw new Error(`${where}: ${n.id} (${n.node_type}) has ${mine.size} outbound edges`);
    }
  }
  const seen = new Set<string>([g.start]);
  const queue: string[] = [g.start];
  while (queue.length) for (const e of out.get(queue.shift()!) ?? []) if (!seen.has(e.to)) seen.add(e.to), queue.push(e.to);
  const unreachable = ids.filter((id) => !seen.has(id));
  if (unreachable.length) throw new Error(`${where}: unreachable ${unreachable}`);
  checkLoops(where, g, ids, out);
  checkRegions(where, g, out);
  checkStepPaths(rootWhere, g, inBody ? outer : undefined, pointer, upstream);
}

function eachNode(value: any, visit: (node: any, pointer: string) => void, pointer: string): void {
  if (Array.isArray(value)) value.forEach((item, i) => eachNode(item, visit, at(pointer, i)));
  else if (value && typeof value === "object") {
    if (typeof value.node_type === "string") visit(value, pointer);
    for (const [key, item] of Object.entries(value)) eachNode(item, visit, at(pointer, key));
  }
}

// Whether any step, at any loop depth, carries a decline route.
export function holdsDeclineRoute(nodes: unknown): boolean {
  let found = false;
  eachNode(
    nodes,
    (node) => {
      const holder = node.node_type === "signature" ? node.parameters : node.node_type === "human" ? node.parameters?.signing : undefined;
      if (holder?.onDecline != null) found = true;
    },
    "",
  );
  return found;
}

// The first platform month whose builds read a Human step's page; an older one drops it unread.
export const TASK_PAGES_PLATFORM = "2027.02";

// Every step, at any loop depth, that carries a page, with its pointer.
function pagedSteps(nodes: unknown): { node: any; pointer: string }[] {
  const found: { node: any; pointer: string }[] = [];
  eachNode(nodes, (node, pointer) => void (node.parameters?.page != null && found.push({ node, pointer })), "/graph/nodes");
  return found;
}

export const holdsTaskPage = (graph: unknown): boolean => pagedSteps(graph).length > 0;

// Refuses a page publish would refuse: one on a step that is not Human, without the package's ui, at a path that is
// no module path, or in a mode other than redirect (embedded is reserved).
export function checkTaskPages(nodes: unknown, hasUi: boolean, where: string): void {
  for (const { node, pointer } of pagedSteps(nodes)) {
    const here = at(at(pointer, "parameters"), "page");
    const page = node.parameters.page;
    if (node.node_type !== "human") refuse(where, here, "page belongs on a Human step");
    const defect = openDefect(typeof page?.path === "string" ? page.path : "", hasUi);
    if (defect !== undefined) refuse(where, here, defect);
    if (page.mode !== "redirect") refuse(where, here, "mode must be redirect");
  }
}

// Refuses an Entity Record step, at any loop depth, whose body binds unit on an entity of the package classified by
// unit, as AgentFlow refuses the package when it verifies it. On any other entity unit is a field like another.
export function checkUnitWrites(where: string, nodes: unknown, sources: ReadonlyMap<string, EntitySource>): void {
  eachNode(
    nodes,
    (node, pointer) => {
      if (node.node_type !== "entity_record") return;
      const { entityId, body } = node.parameters ?? {};
      const own = typeof entityId === "string" && entityId.startsWith("@obj:entity:") ? sources.get(entityId.slice("@obj:entity:".length)) : undefined;
      if (!own || !classifiedByUnit(own) || !Array.isArray(body)) return;
      body.forEach((binding: unknown, i: number) => {
        if (isObject(binding) && binding.field === "unit") {
          refuse(where, at(at(at(pointer, "parameters"), "body"), i), "`unit` is set by the platform from the creator's unit or the step's destinationUnit; a package never writes it");
        }
      });
    },
    "/graph/nodes",
  );
}

// Refuses a search, at any loop depth, on an entity of the package whose `fields` names a key the entity does not
// have, as publish refuses it. The entity has the fields it declares, the ones its work seeds, `name`, which the
// install adds when it declares none, the platform's system fields and, classified by unit, `unit`. A search on a
// dependency's entity or a built-in one is left to publish. Mirrors search_field_issues in
// backend/crates/reflexify-workflows/src/commands/workflows/publish.rs.
export function checkSearchFields(where: string, nodes: unknown, sources: ReadonlyMap<string, EntitySource>): void {
  eachNode(
    nodes,
    (node, pointer) => {
      if (node.node_type !== "entity_record" || node.parameters?.operation !== "search") return;
      const { entityId, fields } = node.parameters;
      const own = typeof entityId === "string" && entityId.startsWith("@obj:entity:") ? sources.get(entityId.slice("@obj:entity:".length)) : undefined;
      // A key that is no string fails the step's parse, and publish then checks none of its keys.
      if (!own || !Array.isArray(fields) || !fields.every((field) => typeof field === "string")) return;
      const known = new Set([...nameableKeysOf(own), ...SYSTEM_FIELDS]);
      fields.forEach((field: string, i: number) => {
        const key = field.trim();
        if (key !== "" && !known.has(key)) {
          refuse(where, at(at(at(pointer, "parameters"), "fields"), i), `${clip(key)} is not a field of entity:${own.key}, and a search returns only fields its entity has`);
        }
      });
    },
    "/graph/nodes",
  );
}

// Every Notify step, at any loop depth, with its pointer.
function notifySteps(nodes: unknown): { node: any; pointer: string }[] {
  const found: { node: any; pointer: string }[] = [];
  eachNode(nodes, (node, pointer) => void (node.node_type === "notify" && found.push({ node, pointer })), "/graph/nodes");
  return found;
}

export const holdsNotify = (nodes: unknown): boolean => notifySteps(nodes).length > 0;

const MAX_NOTIFY_SOURCES = 10;

// Refuses a Notify step publish would refuse for its source lists, one that names a kind the package does not
// declare, and a member the step or a source does not have: AgentFlow reads a stored step leniently, so a misspelt
// `except` would otherwise leave out nobody.
export function checkNotify(where: string, nodes: unknown, declared: ReadonlySet<string>): void {
  for (const { node, pointer } of notifySteps(nodes)) {
    const parameters = at(pointer, "parameters");
    if (isObject(node.parameters)) onlyMembers(node.parameters, CONFIG_MEMBERS.notify!, where, parameters);
    const kind = node.parameters?.notification;
    if (typeof kind !== "string" || !declared.has(kind)) {
      refuse(where, at(parameters, "notification"), `${clip(String(kind))} is not a notification kind of the package's notifications member`);
    }
    for (const [member, min] of [["recipients", 1], ["except", 0]] as const) {
      const sources = node.parameters?.[member];
      if (member === "except" && sources === undefined) continue;
      if (!Array.isArray(sources)) refuse(where, at(parameters, member), "must be an array of sources");
      if (sources.length < min) refuse(where, at(parameters, member), "names at least one source");
      if (sources.length > MAX_NOTIFY_SOURCES) refuse(where, at(parameters, member), `names ${sources.length} sources, at most ${MAX_NOTIFY_SOURCES}`);
      sources.forEach((source: unknown, i: number) => {
        const sourceAt = at(at(parameters, member), i);
        if (!isObject(source)) refuse(where, sourceAt, "must be a source object");
        const type = source.type;
        const types = kindsOf("notify_source");
        if (typeof type !== "string" || !types.includes(type)) {
          refuse(where, at(sourceAt, "type"), `${clip(String(type))} is not a source type: ${types.join(", ")}`);
        }
        onlyMembers(source, CONFIG_MEMBERS[`notify_source.${type}`]!, where, sourceAt);
      });
    }
  }
}

// Every signing method the steps use, at any loop depth: a Signature step, or a Human step with a signing block.
// A step that names none signs by server_email.
export function signingMethodsIn(nodes: unknown): Set<string> {
  const methods = new Set<string>();
  eachNode(
    nodes,
    (node) => {
      const holder = node.node_type === "signature" ? node.parameters : node.node_type === "human" ? node.parameters?.signing : undefined;
      if (node.node_type === "signature" || holder != null) methods.add(typeof holder?.signingMethod === "string" ? holder.signingMethod : "server_email");
    },
    "",
  );
  return methods;
}

// Every list of documents a step's documentTemplateId sits in, as the platform reads a graph's references, and
// whether only a document that renders a template names one.
const TEMPLATE_LISTS: Record<string, [string[], boolean][]> = {
  document: [[["documents"], false]],
  signature: [[["documents"], true]],
  human: [[["reviewDocuments"], false], [["signing", "documents"], true]],
};

// A Set Variable target as publish judges it: a letter or underscore, then letters, digits and underscores.
const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Runs on the translated nodes, so a Code source holding `${` is never read as a reference.
function finishNode(node: any, where: string, pointer: string, configDir: string, connections: Connections): void {
  for (const [list, renderedOnly] of TEMPLATE_LISTS[node.node_type] ?? []) {
    const documents = list.reduce((value: any, member) => value?.[member], node.parameters);
    if (!Array.isArray(documents)) continue;
    documents.forEach((document: any, i: number) => {
      // A signing document names a template only when it renders one; its other sources carry none.
      if (renderedOnly && document?.source !== "renderDocumentTemplate") return;
      const id = document?.documentTemplateId;
      if (id == null || (typeof id === "string" && id.startsWith("@obj:document_template:"))) return;
      const here = at(at([...list].reduce((p, member) => at(p, member), at(pointer, "parameters")), i), "documentTemplateId");
      refuse(where, here, `name the template with \${document_template:<key>}, not ${clip(typeof id === "string" ? id : JSON.stringify(id))}`);
    });
  }
  if (node.node_type === "set_variable" && Array.isArray(node.parameters?.assignments)) {
    node.parameters.assignments.forEach((assignment: any, i: number) => {
      const target = assignment?.target;
      if (typeof target === "string" && VARIABLE_NAME.test(target.trim())) return;
      const here = at(at(at(at(pointer, "parameters"), "assignments"), i), "target");
      const bare = typeof target === "string" && target.startsWith("vars.") ? target.slice("vars.".length) : undefined;
      refuse(
        where,
        here,
        bare !== undefined && VARIABLE_NAME.test(bare)
          ? `${shown(target)} names the variable with its prefix: write ${shown(bare)}, which a later step reads as vars.${bare}`
          : `${shown(target)} is not a variable name: a letter or underscore, then letters, digits and underscores, and no dot (publish refuses it as set_variable.target_invalid)`,
      );
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
    const bytes = Buffer.byteLength(node.parameters.source, "utf8");
    if (bytes > CODE_SOURCE_MAX_BYTES) {
      refuse(
        where,
        here,
        `${source.$file} is ${bytes} bytes; a Code step's source may be at most ${CODE_SOURCE_MAX_BYTES.toLocaleString("en-US")} bytes (256 KiB), ` +
          `and the platform refuses a larger one when the workflow is published: bundle less into this step, or split it`,
      );
    }
    const declared = (Array.isArray(node.parameters.inputs) ? node.parameters.inputs : []).map((input: { name?: unknown }) => String(input?.name));
    const language = node.parameters.language === "python" ? "python" : "javascript";
    const missing = undeclaredInputs(node.parameters.source, language, declared);
    if (missing.length > 0) {
      refuse(
        where,
        here,
        `${source.$file} reads ${missing.join(", ")}, which the step does not declare (declared: ${declared.join(", ") || "none"}): ` +
          `declare each under inputs, or ask with "<name>" in inputs before reading it`,
      );
    }
  }
}

// A step names a built-in entity (Users, Groups, units) by its reserved id, as an entity's reference field does, and
// the package carries it as the required entity it is. Anything else is translated as every other string is.
function stepEntity(value: unknown, where: string, pointer: string): unknown {
  if (typeof value === "string" && Object.hasOwn(REQUIRED_ENTITIES, value)) return `@req:entity:${REQUIRED_ENTITIES[value]}`;
  return translate(value, where, pointer, { entityId: stepEntity });
}

export function workflowObject(
  w: WorkflowSource,
  configDir: string,
  exposed: Record<string, string[]> = {},
  entities: readonly string[] = [],
  connections: Connections = new Map(),
): Record<string, unknown> {
  const where = `workflow ${w.key}`;
  onlyMembers(w, CONFIG_MEMBERS.workflow!, where, "");
  const g = w.graph;
  onlyMembers(g, CONFIG_MEMBERS.graph!, where, "/graph");
  if (w.tool_enabled !== undefined && typeof w.tool_enabled !== "boolean") refuse(where, "/tool_enabled", "must be true or false");

  let runAs: string;
  if (w.run_as?.policy === "initiator") runAs = "initiator";
  else if (w.run_as?.policy === "service_principal") runAs = parameterOf(w.run_as.service_principal_id, where, "/run_as/service_principal_id");
  else refuse(where, "/run_as", `a run-as policy the builder has no rule for: ${clip(JSON.stringify(w.run_as))}`);

  const nodes = translate(g.nodes, where, "/graph/nodes", { entityId: stepEntity }) as any[];
  const edges = translate(g.edges, where, "/graph/edges");
  eachNode(nodes, (node, pointer) => finishNode(node, where, pointer, configDir, connections), "/graph/nodes");

  const exposedSteps = exposed[w.key] ?? [];
  for (const id of exposedSteps) {
    if (!nodes.some((n) => n.id === id && n.node_type === "human")) refuse(where, "/graph/nodes", `exposed step ${id} is not a human step`);
  }

  const body: Record<string, unknown> = { schemaVersion: g.schemaVersion, name: w.name, description: w.description, runAs, exposedSteps };
  if (w.tool_enabled === true) body.toolEnabled = true;
  if (w.input_schema) body.inputSchema = translate(w.input_schema, where, "/input_schema", { "x-entity": xEntity(entities) });
  if (w.output_schema) body.outputSchema = translate(w.output_schema, where, "/output_schema");
  if (g.variables) body.variables = translate(g.variables, where, "/graph/variables");
  if (g.transaction) body.transaction = g.transaction;
  return { ...body, start: g.start, end: g.end, nodes, edges };
}

export function startGrants(w: WorkflowSource): Grant[] {
  const where = `workflow ${w.key}`;
  onlyMembers(w.start_access, CONFIG_MEMBERS.start_access!, where, "/start_access");
  if (w.start_access.mode !== "restricted") {
    refuse(where, "/start_access/mode", "a package cannot let everyone start a workflow");
  }
  return w.start_access.group_ids.map((id: unknown, i: number) => ({
    key: `start_${w.key}${i ? `_${i + 1}` : ""}`,
    to: parameterOf(id, where, at("/start_access/group_ids", i)),
    workflow: `@obj:workflow:${w.key}`,
  }));
}

export function triggerObject(
  name: string,
  trigger: TriggerSource,
  workflowKeys: ReadonlySet<string>,
  connections: Connections = new Map(),
): Record<string, unknown> {
  const where = `trigger ${name}`;
  onlyMembers(trigger, CONFIG_MEMBERS.trigger!, where, "");
  if (!workflowKeys.has(trigger.workflow)) refuse(where, "/workflow", `${trigger.workflow} is not a workflow of the package`);
  const connected = trigger.kind === "connected_app";
  const config: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(trigger.config)) {
    if (connected && (key === "provider" || key === "external_account_id")) {
      refuse(where, at("/config", key), `a connected_app trigger names its connection with connection: \${param:…}, not ${key}`);
    }
    if (connected && key === "connection") {
      config.account = parameterOf(value, where, at("/config", key));
      checkConnectionUse(connections, "trigger", (config.account as string).slice("@param:".length), where, at("/config", key));
    }
    else config[key] = translate(value, where, at("/config", key));
  }
  if (connected && !("account" in config)) refuse(where, "/config", "a connected_app trigger names its connection with connection: ${param:…}");
  if (trigger.kind === "entity_record") checkMappingFroms(trigger.config?.input_mappings, where);
  return { workflow: `@obj:workflow:${trigger.workflow}`, kind: trigger.kind, enabled: false, config };
}

// The metadata of a record change a mapping may copy, as `event.event.<key>`.
const EVENT_META = ["record_id", "entity_id", "change_kind", "changed", "occurred_at", "trigger_depth"];

// What the install refuses of a record trigger's mapping: a `from` that is not under `event.`, the whole event, and an
// `event.event.<x>` that is neither a before-value nor one of the metadata keys. A connected_app trigger's mapping is
// read with or without the prefix, so it is not judged here.
function checkMappingFroms(mappings: unknown, where: string): void {
  if (!Array.isArray(mappings)) return;
  mappings.forEach((mapping, i) => {
    const here = at(at("/config/input_mappings", i), "from");
    const from = isObject(mapping) && typeof mapping.from === "string" ? mapping.from.trim() : undefined;
    if (from === undefined) refuse(where, here, "a mapping's from is a path under event.");
    if (from === "event" || from === "event.event" || from === "event.event.previous") {
      refuse(where, here, `${from} is not a value: map a field (event.<field>), a before-value (event.event.previous.<field>) or ${EVENT_META.map((key) => `event.event.${key}`).join(", ")}`);
    }
    const rest = from.startsWith("event.") ? from.slice("event.".length) : undefined;
    if (!rest) refuse(where, here, `${from} does not start with event.: a field is event.<field>, as event.${from}`);
    const meta = rest.startsWith("event.") ? rest.slice("event.".length) : undefined;
    if (meta !== undefined && !(meta.startsWith("previous.") && meta.length > "previous.".length) && !EVENT_META.includes(meta)) {
      refuse(where, here, `${from} names no field, before-value or event metadata: a before-value is event.event.previous.<field>, and the metadata is ${EVENT_META.map((key) => `event.event.${key}`).join(", ")}`);
    }
  });
}

export function actionObject(
  name: string,
  entry: ActionSource,
  workflowKeys: ReadonlySet<string>,
  entities: readonly string[],
): ObjectEntry {
  const where = `action ${name}`;
  onlyMembers(entry, CONFIG_MEMBERS.action!, where, "");
  const action = entry.action;
  onlyMembers(action, CONFIG_MEMBERS.action_body!, where, "/action");
  if (!entities.includes(entry.entity)) refuse(where, "/entity", `${entry.entity} is not an entity of the package`);
  if (typeof action.key !== "string" || action.key === "") refuse(where, "/action/key", "a non-empty string");
  const body: Record<string, unknown> = { workflow: translate(action.workflow_id, where, "/action/workflow_id") };
  const target = /^@obj:workflow:(.+)$/.exec(body.workflow as string);
  if (!target || !workflowKeys.has(target[1]!)) refuse(where, "/action/workflow_id", `${action.workflow_id} is not a workflow of the package`);
  for (const member of ["label", "scope", "mode", "visible_when", "input_map", "tone", "icon"]) {
    if (member in action) body[member] = translate(action[member], where, at("/action", member));
  }
  return [`entity_action:${entry.entity}/${action.key}`, body];
}
