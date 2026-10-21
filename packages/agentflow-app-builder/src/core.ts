import fs from "node:fs";
import path from "node:path";

export interface Manifest {
  parameters: { key: string }[];
  requires: { entities: { key: string }[] };
  [k: string]: unknown;
}

export type ObjectEntry = [key: string, body: unknown];

export type Special = Record<string, (value: unknown, where: string, pointer: string) => unknown>;

export const REQUIRED_ENTITIES: Record<string, "user" | "org_unit"> = {
  "ffffffff-0000-0000-0000-000000000001": "user",
  "ffffffff-0000-0000-0000-000000000003": "org_unit",
};

const REFERENCE = /^\$\{(entity|workflow|agent|skill|param|dashboard):([a-z][a-z0-9_-]*)\}$/;
const SCOPED_REFERENCE = /^\$\{(entity_view):([a-z][a-z0-9_]*\/[a-z][a-z0-9_]*)\}$/;

export function refuse(where: string, pointer: string, message: string): never {
  throw new Error(`${where}#${pointer}: ${message}`);
}

export const clip = (text: string): string => (text.length > 80 ? `${text.slice(0, 80)}...` : text);

export const at = (pointer: string, key: string | number): string =>
  `${pointer}/${String(key).replaceAll("~", "~0").replaceAll("/", "~1")}`;

export const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function readJson(file: string): any {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: ${(error as Error).message}`);
  }
}

export function onlyMembers(value: object, allowed: readonly string[], where: string, pointer: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) refuse(where, at(pointer, key), "a member the builder has no rule for");
  }
}

function sentinel(kind: string, key: string, where: string, pointer: string): string {
  if (kind !== "skill" && key.includes("-")) refuse(where, pointer, `${kind} key ${key} holds a hyphen`);
  if (kind === "param") return `@param:${key}`;
  if (kind === "skill") return `@obj:skill:${key.replaceAll("-", "_")}`;
  return `@obj:${kind}:${key}`;
}

// A string that is a whole `${kind:key}` reference becomes its sentinel. `special` maps a member name to a
// function that translates that member's value instead, wherever the member occurs.
export function translate(value: unknown, where: string, pointer: string, special: Special = {}): unknown {
  if (typeof value === "string") {
    const reference = REFERENCE.exec(value) ?? SCOPED_REFERENCE.exec(value);
    if (reference) return sentinel(reference[1]!, reference[2]!, where, pointer);
    if (value.includes("${")) refuse(where, pointer, `an authoring reference the builder does not know: ${clip(value)}`);
    if (value.startsWith("@")) refuse(where, pointer, `a string starting with @ reads as a sentinel: ${clip(value)}`);
    return value;
  }
  if (Array.isArray(value)) return value.map((item, index) => translate(item, where, at(pointer, index), special));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (key.includes("${")) refuse(where, at(pointer, key), "a member name holding a reference");
      out[key] = Object.hasOwn(special, key)
        ? special[key]!(item, where, at(pointer, key))
        : translate(item, where, at(pointer, key), special);
    }
    return out;
  }
  return value;
}

export function parameterOf(value: unknown, where: string, pointer: string): string {
  const out = translate(value, where, pointer);
  if (typeof out !== "string" || !out.startsWith("@param:")) refuse(where, pointer, "must be a ${param:key}");
  return out;
}

export function targetEntity(value: unknown, where: string, pointer: string): string {
  if (Object.hasOwn(REQUIRED_ENTITIES, value as string)) return `@req:entity:${REQUIRED_ENTITIES[value as string]}`;
  const out = translate(value, where, pointer) as string;
  if (!out.startsWith("@obj:entity:")) refuse(where, pointer, `not an entity reference or a reserved entity id: ${clip(value as string)}`);
  return out;
}

export const kindOf = (key: string): string => key.slice(0, key.indexOf(":"));

export const objectPath = (key: string): string =>
  `objects/${kindOf(key)}/${key.slice(kindOf(key).length + 1).replace("/", "__")}.json`;

// Every sentinel must name an object of the package, a declared parameter or a required entity.
export function checkReferences(objects: ObjectEntry[], manifest: Manifest): void {
  const keys = new Set(objects.map(([key]) => key));
  const parameters = new Set(manifest.parameters.map((p) => p.key));
  const required = new Set(manifest.requires.entities.map((e) => `entity:${e.key}`));
  const scan = (value: unknown, where: string, pointer: string): void => {
    if (typeof value === "string") {
      if (!value.startsWith("@")) return;
      const m = /^@(obj|obj\.key|req|req\.key|param):(.+)$/.exec(value);
      const known = m && (m[1] === "param" ? parameters : m[1]!.startsWith("obj") ? keys : required).has(m[2]!);
      if (!known) refuse(where, pointer, `${clip(value)} names no object, parameter or required entity of the package`);
    } else if (Array.isArray(value)) value.forEach((item, i) => scan(item, where, at(pointer, i)));
    else if (value && typeof value === "object") for (const [k, item] of Object.entries(value)) scan(item, where, at(pointer, k));
  };
  scan(manifest, "manifest.json", "");
  for (const [key, body] of objects) scan(body, objectPath(key), "");
}

export function renderFiles(manifest: object, objects: ObjectEntry[]): Record<string, string> {
  const files: Record<string, string> = {};
  const write = (rel: string, value: unknown): void => {
    files[rel] = `${JSON.stringify(value, null, 2)}\n`;
  };
  write("manifest.json", manifest);
  for (const [key, body] of objects) write(objectPath(key), body);
  return files;
}

export function writeFiles(packageDir: string, files: Record<string, string>): number {
  fs.rmSync(path.join(packageDir, "manifest.json"), { force: true });
  fs.rmSync(path.join(packageDir, "objects"), { recursive: true, force: true });
  for (const [rel, text] of Object.entries(files)) {
    const target = path.join(packageDir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  return Object.keys(files).length;
}
