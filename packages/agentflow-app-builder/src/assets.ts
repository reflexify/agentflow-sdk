import fs from "node:fs";
import path from "node:path";
import { at, clip, isObject, onlyMembers, readJson, refuse, translate, type ObjectEntry } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
import { memoryReferences, memorySaveOf } from "./memory.js";

const FRONTMATTER_LINE = new RegExp(`^(${CONFIG_MEMBERS.skill_frontmatter!.join("|")}): (\\S.*?)\\s*$`);

export function agentObject(configDir: string, key: string): ObjectEntry {
  const where = `agents/${key}.json`;
  const { key: own, ...rest } = readJson(path.join(configDir, where));
  if (own !== key) refuse(where, "/key", `is ${own}, not ${key}`);
  const body = translate(rest, where, "", { memorySave: memorySaveOf }) as Record<string, unknown>;
  if (body.read_limit !== undefined) readLimit(body.read_limit, where);
  return [`agent:${key}`, body];
}

const READ_OPERATIONS = ["read", "list"];

function readLimit(limit: unknown, where: string): void {
  const base = "/read_limit";
  if (!isObject(limit)) refuse(where, base, "must be an object");
  onlyMembers(limit, CONFIG_MEMBERS.read_limit!, where, base);
  if (!Array.isArray(limit.entities)) refuse(where, at(base, "entities"), "must be a list of entities");
  const seen = new Set<unknown>();
  if (limit.memory_types !== undefined) memoryReferences(limit.memory_types, where, at(base, "memory_types"), "@obj:memory_type:", 200, "memory types");
  limit.entities.forEach((entry: unknown, i: number) => {
    const here = at(at(base, "entities"), i);
    if (!isObject(entry)) refuse(where, here, "must be an object");
    onlyMembers(entry, CONFIG_MEMBERS.read_limit_entity!, where, here);
    const entity = entry.entity;
    if (typeof entity !== "string" || !entity.startsWith("@obj:entity:")) {
      refuse(where, at(here, "entity"), "must be an entity reference, written ${entity:<key>}");
    }
    if (seen.has(entity)) refuse(where, at(here, "entity"), "this entity is named twice: name it once, with all its operations");
    seen.add(entity);
    const operations = entry.operations;
    const opsAt = at(here, "operations");
    if (!Array.isArray(operations) || operations.length === 0) refuse(where, opsAt, "must list at least one of read or list");
    operations.forEach((op: unknown, j: number) => {
      if (typeof op !== "string" || !READ_OPERATIONS.includes(op)) refuse(where, at(opsAt, j), "an operation must be read or list");
      if (operations.indexOf(op) !== j) refuse(where, at(opsAt, j), `${op} is named twice`);
    });
  });
}

// The builder reads each frontmatter line as a plain `key: value`, so a value YAML would read as anything but text is
// refused, and the refusal names the rule: a quoted description, or a `: ` inside one, is the usual cause.
function lineRule(line: string): string {
  return /^(?:name|description):\s*$/.test(line.trim())
    ? "has no value after the key"
    : 'does not start with "name: " or "description: " (the frontmatter holds only these two keys, one line each)';
}

function valueRule(value: string): string | undefined {
  const first = /^["'|>&*!#%@`[{?:,\]}-]/.exec(value)?.[0];
  if (first) {
    return `has a value that starts with ${first === '"' || first === "'" ? "a quote" : `"${first}"`}, which is YAML syntax: begin the value with a plain word and leave the quotes out`;
  }
  if (value.includes(": ")) return 'has a value that holds ": ", which YAML reads as a new key: reword it, for example with a dash or a comma instead of the colon';
  if (value.includes(" #")) return 'has a value that holds " #", which YAML reads as a comment: reword it';
  if (value.endsWith(":")) return 'has a value that ends with ":": end it with a word or a full stop';
  return undefined;
}

// Reads a SKILL.md as the installer does: the frontmatter between the first two `---` lines, then the
// body after the closing line's break, untouched.
export function skillObject(configDir: string, fileName: string): ObjectEntry {
  const where = `skills/${fileName}`;
  const lines = fs.readFileSync(path.join(configDir, where), "utf8").replace(/^\uFEFF/, "").split(/(?<=\n)/);
  const delimiter = (line: string): boolean => line.replace(/[ \t\r\n]+$/, "") === "---";
  if (!delimiter(lines[0] ?? "")) refuse(where, "", "must start with a --- line");
  const close = lines.findIndex((line, i) => i > 0 && delimiter(line));
  if (close < 0) refuse(where, "", "its frontmatter is not closed by a --- line");
  const front: Record<string, string> = {};
  for (const line of lines.slice(1, close)) {
    const m = FRONTMATTER_LINE.exec(line);
    const broken = m ? valueRule(m[2]!) : lineRule(line);
    if (broken) {
      refuse(where, "", `frontmatter line is not a plain "name: value" or "description: value", because it ${broken}: ${clip(line.trim())}`);
    }
    front[m![1]!] = m![2]!;
  }
  if (!front.name || !front.description) refuse(where, "", "frontmatter needs a name and a description");
  const local = front.name.replaceAll("-", "_");
  if (fileName !== `${local}.SKILL.md`) refuse(where, "", `is named for ${front.name}, so it must be ${local}.SKILL.md`);
  return [`skill:${local}`, { description: front.description, body: lines.slice(close + 1).join("") }];
}
