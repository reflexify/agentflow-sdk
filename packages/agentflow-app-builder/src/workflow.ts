import fs from "node:fs";
import path from "node:path";
import { at, clip, onlyMembers, parameterOf, refuse, translate, type ObjectEntry } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
import { xEntity, type Grant } from "./entity.js";

export interface WorkflowSource {
  key: string;
  name: string;
  description: string;
  run_as: any;
  start_access: any;
  input_schema?: unknown;
  output_schema?: unknown;
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
export const lit = (v: unknown) => (typeof v === "string" ? { kind: "literal", value: v } : { kind: "literal", valueJson: v });
export const bind = (field: string, b: object) => ({ field, ...b });
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

export function end(id: string, name: string, outcome?: string, outputs?: unknown) {
  const p: Record<string, unknown> = {};
  if (outcome) p.outcomeLabel = outcome;
  if (outputs) p.outputMapping = outputs;
  return node(id, name, "end", p);
}

export const getById = (id: string, name: string, entity: string, idPath: string) =>
  node(id, name, "entity_record", { operation: "get", entityId: entity, recordIdExpr: ref(idPath) });

export function search(
  id: string,
  name: string,
  entity: string,
  filters: unknown,
  { sort, dir, limit }: { sort?: unknown; dir?: unknown; limit?: number } = {},
) {
  const p: Record<string, unknown> = { operation: "search", entityId: entity, filters };
  if (sort) p.sort = sort;
  if (dir) p.dir = dir;
  if (limit) p.limit = limit;
  return node(id, name, "entity_record", p);
}

export const flt = (field: string, op: string, value: unknown) => ({ field, op, value });

export const create = (id: string, name: string, entity: string, body: unknown) =>
  node(id, name, "entity_record", { operation: "create", entityId: entity, body });

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

export const setvar = (id: string, name: string, assignments: [string, object][]) =>
  node(id, name, "set_variable", { assignments: assignments.map(([target, b]) => ({ target, ...b })) });

export function call(
  id: string,
  name: string,
  workflow: string,
  subjectSource?: unknown,
  inputs: [string, object][] = [],
  settings?: Record<string, unknown>,
) {
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

export const edges = (...triples: [string, string, string][]) => triples.map(([id, from, to]) => ({ id, from, to }));

export const upsert = (id: string, name: string, entity: string, matchKey: string, body: unknown) =>
  node(id, name, "entity_record", { operation: "upsert", entityId: entity, matchBy: "key", matchKey, body });

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

// The rules publish enforces that are easiest to break by hand: one outbound
// edge per plain step, branch and action edges owned by their node, everything
// reachable, no loops (a loop may not hold an Entity Record step), and Decision
// conditions the designer can round-trip.
export function checkGraph(where: string, g: any): void {
  const ids: string[] = g.nodes.map((n: any) => n.id);
  if (new Set(ids).size !== ids.length) throw new Error(`${where}: duplicate node ids`);
  if (new Set(g.edges.map((e: any) => e.id)).size !== g.edges.length) throw new Error(`${where}: duplicate edge ids`);
  const out = new Map<string, any[]>();
  for (const e of g.edges) {
    if (!ids.includes(e.from) || !ids.includes(e.to)) throw new Error(`${where}: edge ${e.id} names a missing node`);
    if (!out.has(e.from)) out.set(e.from, []);
    out.get(e.from)!.push(e);
  }
  for (const n of g.nodes) {
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
    if (n.node_type === "human") owned = n.parameters.actions.flatMap((a: any) => a.edgeIds);
    if (n.node_type === "for_each") checkGraph(`${where}.${n.id}.body`, n.parameters.body);
    if (owned) {
      const same = owned.length === mine.size && owned.every((e) => mine.has(e));
      if (!same) throw new Error(`${where}: ${n.id} owns ${owned} but has ${[...mine]}`);
    } else if (mine.size !== 1) {
      throw new Error(`${where}: ${n.id} (${n.node_type}) has ${mine.size} outbound edges`);
    }
  }
  const state = new Map<string, number>();
  const visit = (u: string): void => {
    state.set(u, 1);
    for (const e of out.get(u) ?? []) {
      if (state.get(e.to) === 1) throw new Error(`${where}: loop through ${u} -> ${e.to}`);
      if (!state.has(e.to)) visit(e.to);
    }
    state.set(u, 2);
  };
  visit(g.start);
  const unreachable = ids.filter((id) => !state.has(id));
  if (unreachable.length) throw new Error(`${where}: unreachable ${unreachable}`);
}

function eachNode(value: any, visit: (node: any, pointer: string) => void, pointer: string): void {
  if (Array.isArray(value)) value.forEach((item, i) => eachNode(item, visit, at(pointer, i)));
  else if (value && typeof value === "object") {
    if (typeof value.node_type === "string") visit(value, pointer);
    for (const [key, item] of Object.entries(value)) eachNode(item, visit, at(pointer, key));
  }
}

// Every list of documents a step's documentTemplateId sits in, as the platform reads a graph's references, and
// whether only a document that renders a template names one.
const TEMPLATE_LISTS: Record<string, [string[], boolean][]> = {
  document: [[["documents"], false]],
  signature: [[["documents"], true]],
  human: [[["reviewDocuments"], false], [["signing", "documents"], true]],
};

// Runs on the translated nodes, so a Code source holding `${` is never read as a reference.
function finishNode(node: any, where: string, pointer: string, configDir: string): void {
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
  if (node.node_type === "email" && node.parameters?.email && "connection" in node.parameters.email) {
    const connection = node.parameters.email.connection;
    const here = at(at(at(pointer, "parameters"), "email"), "connection");
    const shape = connection && typeof connection === "object" ? Object.keys(connection).sort().join() : "";
    if (shape !== "externalAccountId,provider" || connection.provider !== "resend"
      || typeof connection.externalAccountId !== "string" || !connection.externalAccountId.startsWith("@param:")) {
      refuse(where, here, `an Email connection the builder has no rule for: ${clip(JSON.stringify(connection))}`);
    }
    node.parameters.email.connection = connection.externalAccountId;
  }
  if (node.node_type === "code") {
    const here = at(at(pointer, "parameters"), "source");
    const source = node.parameters?.source;
    if (!source || typeof source !== "object" || Object.keys(source).join() !== "$file" || typeof source.$file !== "string") {
      refuse(where, here, "a Code source must be {\"$file\": \"code/…\"}");
    }
    node.parameters.source = fs.readFileSync(path.join(configDir, source.$file), "utf8");
  }
}

export function workflowObject(w: WorkflowSource, configDir: string, exposed: Record<string, string[]> = {}, entities: readonly string[] = []): Record<string, unknown> {
  const where = `workflow ${w.key}`;
  onlyMembers(w, CONFIG_MEMBERS.workflow!, where, "");
  const g = w.graph;
  onlyMembers(g, CONFIG_MEMBERS.graph!, where, "/graph");

  let runAs: string;
  if (w.run_as?.policy === "initiator") runAs = "initiator";
  else if (w.run_as?.policy === "service_principal") runAs = parameterOf(w.run_as.service_principal_id, where, "/run_as/service_principal_id");
  else refuse(where, "/run_as", `a run-as policy the builder has no rule for: ${clip(JSON.stringify(w.run_as))}`);

  const nodes = translate(g.nodes, where, "/graph/nodes") as any[];
  const edges = translate(g.edges, where, "/graph/edges");
  eachNode(nodes, (node, pointer) => finishNode(node, where, pointer, configDir), "/graph/nodes");

  const exposedSteps = exposed[w.key] ?? [];
  for (const id of exposedSteps) {
    if (!nodes.some((n) => n.id === id && n.node_type === "human")) refuse(where, "/graph/nodes", `exposed step ${id} is not a human step`);
  }

  const body: Record<string, unknown> = { schemaVersion: g.schemaVersion, name: w.name, description: w.description, runAs, exposedSteps };
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

export function triggerObject(name: string, trigger: TriggerSource, workflowKeys: ReadonlySet<string>): Record<string, unknown> {
  const where = `trigger ${name}`;
  onlyMembers(trigger, CONFIG_MEMBERS.trigger!, where, "");
  if (!workflowKeys.has(trigger.workflow)) refuse(where, "/workflow", `${trigger.workflow} is not a workflow of the package`);
  const connected = trigger.kind === "connected_app";
  const config: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(trigger.config)) {
    if (connected && key === "provider") {
      if (value !== "resend") refuse(where, at("/config", key), `a connected_app trigger on ${clip(JSON.stringify(value))}: the package's connection parameter is Resend's`);
      continue;
    }
    if (connected && key === "external_account_id") config.account = parameterOf(value, where, at("/config", key));
    else config[key] = translate(value, where, at("/config", key));
  }
  if (connected && !("account" in config)) refuse(where, "/config", "a connected_app trigger names no external_account_id");
  return { workflow: `@obj:workflow:${trigger.workflow}`, kind: trigger.kind, enabled: false, config };
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
