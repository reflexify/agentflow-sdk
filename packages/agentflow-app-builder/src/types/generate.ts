import { CliError, SealError } from "../errors.js";
import { parseJsonFile } from "../seal/payload.js";
import { byKey, docLine, literal, propertyName, quote, schemaToTs } from "./schema.js";

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {});

const OBJECT_FILE = /^objects\/([^/]+)\/(.+)\.json$/;

/** The manifest and each object's body by logical key (`objects/entity_field/case__title.json` is `entity_field:case/title`). */
export function payloadObjects(files: Map<string, Uint8Array>): { manifest: unknown; objects: Map<string, unknown> } {
  const manifestBytes = files.get("manifest.json");
  if (!manifestBytes) throw new SealError("SEAL_MANIFEST_MISSING", "manifest.json is missing", ["manifest.json"]);
  const objects = new Map<string, unknown>();
  for (const [file, bytes] of files) {
    const match = OBJECT_FILE.exec(file);
    if (match) objects.set(`${match[1]}:${match[2]!.replaceAll("__", "/")}`, parseJsonFile(file, bytes));
  }
  return { manifest: parseJsonFile("manifest.json", manifestBytes), objects };
}

const SCALAR_FIELDS: Record<string, string> = {
  text: "string",
  long_text: "string",
  email: "string",
  url: "string",
  phone: "string",
  date: "string",
  datetime: "string",
  reference: "string",
  number: "number",
  integer: "number",
  currency: "number",
  decimal: "number",
  boolean: "boolean",
};

const enumUnion = (body: Record<string, unknown>): string => {
  const values = Array.isArray(body.enum_values) ? body.enum_values.map((option) => record(option).value) : [];
  return values.length ? values.map(literal).join(" | ") : "never";
};

function fieldType(body: Record<string, unknown>): string {
  const type = body.type;
  if (typeof type !== "string") return "unknown";
  if (SCALAR_FIELDS[type]) return SCALAR_FIELDS[type]!;
  switch (type) {
    case "enum":
      return enumUnion(body);
    case "multi_select":
      return `(${enumUnion(body)})[]`;
    case "reference_list":
      return "string[]";
    case "formula":
      return typeof body.formula_result_type === "string" ? (SCALAR_FIELDS[body.formula_result_type] ?? "unknown") : "unknown";
    // Code mode renders the number into text; Number mode stores the integer.
    case "auto_number":
      return typeof body.auto_number_format === "string" ? "string" : "number";
    default:
      return "unknown";
  }
}

const deprecated = (body: unknown): boolean => record(body).deprecated === true;

const keyUnion = (keys: string[]): string => (keys.length ? keys.map(quote).join(" | ") : "never");

function block(lines: string[]): string {
  return lines.length ? `{\n${lines.join("\n")}\n}` : "{}";
}

const FIELD_REF = "@obj:entity_field:";

/** `GET /app/objects` never lists these, so a key for one could only ever resolve to nothing. */
const UNLISTED = new Set(["agent", "skill", "memory_type", "memory_relationship"]);
/** The installer derives no contract for these, so the server reports a null `contract_version`. */
const NO_CONTRACT = new Set(["dashboard", "trigger", "client"]);

/** The text of `src/generated/app.ts` for a package: its manifest and each object's body by logical key. */
export function generateTypes(manifest: unknown, objects: Map<string, unknown>): string {
  const m = record(manifest);
  if (typeof m.id !== "string" || typeof m.version !== "string") {
    throw new SealError("SEAL_MANIFEST_INVALID", "manifest.json has no string id and version", ["manifest.json"]);
  }
  const { id, version } = m;
  const listed = (Array.isArray(m.objects) ? m.objects : [])
    .map((object) => record(object))
    .filter((object): object is { key: string; kind: string } => typeof object.key === "string" && typeof object.kind === "string")
    .sort((a, b) => byKey(a.key, b.key));
  const body = (key: string): Record<string, unknown> => {
    if (!objects.has(key)) throw new CliError("PACKAGE_MISSING", `package/ has no body for ${key}: run pnpm build`);
    return record(objects.get(key));
  };

  const entries: string[] = [];
  const entities: string[] = [];
  const workflows: string[] = [];
  for (const { key, kind } of listed) {
    if (UNLISTED.has(kind)) continue;
    if (deprecated(body(key))) entries.push("  /** @deprecated */");
    entries.push(`  ${quote(key)}: { kind: ${quote(kind)}, contractVersion: ${NO_CONTRACT.has(kind) ? "null" : quote(version)} },`);
    const local = key.slice(key.indexOf(":") + 1);
    if (kind === "entity") entities.push(local);
    if (kind === "workflow") workflows.push(local);
  }

  const entityLines: string[] = [];
  for (const entity of entities) {
    const entityBody = body(`entity:${entity}`);
    const fieldKeys = (Array.isArray(entityBody.fields) ? entityBody.fields : [])
      .filter((ref): ref is string => typeof ref === "string" && ref.startsWith(FIELD_REF))
      .map((ref) => ref.slice(FIELD_REF.length))
      .sort(byKey);
    const fields: string[] = [];
    for (const fieldKey of fieldKeys) {
      const fieldBody = body(`entity_field:${fieldKey}`);
      if (deprecated(fieldBody)) fields.push("    /** @deprecated */");
      const type = fieldType(fieldBody);
      fields.push(`    ${propertyName(fieldKey.slice(fieldKey.lastIndexOf("/") + 1))}?: ${type === "unknown" ? type : `${type} | null`};`);
    }
    if (deprecated(entityBody)) entityLines.push("  /** @deprecated */");
    entityLines.push(`  ${propertyName(entity)}: ${fields.length ? `{\n${fields.join("\n")}\n  }` : "{}"};`);
  }

  const workflowLines: string[] = [];
  for (const workflow of workflows) {
    const workflowBody = body(`workflow:${workflow}`);
    const schema = workflowBody.inputSchema;
    if (deprecated(workflowBody)) workflowLines.push("  /** @deprecated */");
    workflowLines.push(`  ${propertyName(workflow)}: ${schema === undefined || schema === null ? "Record<string, never>" : schemaToTs(schema, "  ")};`);
  }

  return [
    `// Generated by \`agentflow-app types\` from ${id} ${version}. Do not edit; run \`agentflow-app types\` again.`,
    ...(listed.some(({ kind }) => kind === "memory_type" || kind === "memory_relationship")
      ? [
          "// Agents, skills, memory types and memory relationships are not listed: `getAppObjects` never answers for",
          "// them. A dashboard, a trigger or a client has no contract, so its `contractVersion` is null and `satisfies`",
          "// is false for it.",
        ]
      : [
          "// Agents and skills are not listed: `getAppObjects` never answers for them. A dashboard, a trigger or a",
          "// client has no contract, so its `contractVersion` is null and `satisfies` is false for it.",
        ]),
    "",
    `export const PACKAGE = { id: ${quote(id)}, version: ${quote(version)} } as const;`,
    "",
    docLine("Every object of the package, with the version of the contract this code was written against."),
    `export const OBJECTS = ${block(entries)} as const;`,
    "",
    "export type LogicalKey = keyof typeof OBJECTS;",
    `export type EntityKey = ${keyUnion(entities)};`,
    `export type WorkflowKey = ${keyUnion(workflows)};`,
    "",
    docLine("The value of each field of each entity, as a record carries it."),
    `export interface EntityFields ${block(entityLines)}`,
    "",
    docLine("What starting each workflow takes."),
    `export interface WorkflowInputs ${block(workflowLines)}`,
    "",
  ].join("\n");
}
