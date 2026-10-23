import { at, isObject, onlyMembers, refuse } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";

const W = "package-manifest.json";
const TTL_MAX = 1440;
const LABEL_MAX = 80;
const LOCALE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const KEY = /^[a-z][a-z0-9_]*$/;

const labelOk = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "" && [...value].length <= LABEL_MAX;

// `built` maps each entity the package builds to its field keys. Given, it is what the labels are checked
// against, so a typo in a key is refused here and not shown later as a name that never appears. `skillKeys`
// are the package's own skills (the stems of config/skills/*.SKILL.md); given, an offer of any other is refused.
export function assistantOf(
  source: unknown,
  built?: ReadonlyMap<string, ReadonlySet<string>>,
  skillKeys?: ReadonlySet<string>,
): Record<string, unknown> {
  const pointer = "/assistant";
  if (!isObject(source)) refuse(W, pointer, "must be an object");
  onlyMembers(source, CONFIG_MEMBERS.assistant!, W, pointer);
  const out: Record<string, unknown> = {};
  if ("proposal_ttl_minutes" in source) {
    const minutes = source.proposal_ttl_minutes;
    if (typeof minutes !== "number" || !Number.isInteger(minutes) || minutes < 1 || minutes > TTL_MAX) {
      refuse(W, at(pointer, "proposal_ttl_minutes"), `must be a whole number of minutes from 1 to ${TTL_MAX}`);
    }
    out.proposal_ttl_minutes = minutes;
  }
  if ("labels" in source) out.labels = labelsOf(source.labels, at(pointer, "labels"), built);
  if ("skills" in source) out.skills = skillsOf(source.skills, at(pointer, "skills"), skillKeys);
  return out;
}

// The package's own skills it offers the organization's default agent. A skill left out stays with the
// package's own agents.
function skillsOf(source: unknown, pointer: string, skillKeys: ReadonlySet<string> | undefined): string[] {
  const keys = Array.isArray(source) ? source : undefined;
  if (!keys || !keys.every((key) => typeof key === "string" && KEY.test(key)) || new Set(keys).size !== keys.length) {
    refuse(W, pointer, "must be distinct skill keys like create_project");
  }
  if (skillKeys) {
    keys.forEach((key, index) => {
      if (!skillKeys.has(key)) refuse(W, at(pointer, String(index)), `offers skill ${key}, which config/skills does not have`);
    });
  }
  return keys as string[];
}

function labelsOf(
  source: unknown,
  pointer: string,
  built: ReadonlyMap<string, ReadonlySet<string>> | undefined,
): Record<string, unknown> {
  if (!isObject(source)) refuse(W, pointer, "must be an object");
  const out: Record<string, unknown> = {};
  for (const [locale, entities] of Object.entries(source)) {
    const here = at(pointer, locale);
    if (!LOCALE.test(locale)) refuse(W, here, "must be a language like vi or pt-BR");
    if (!isObject(entities)) refuse(W, here, "must be an object");
    const byEntity: Record<string, unknown> = {};
    for (const [entity, labels] of Object.entries(entities)) {
      const there = at(here, entity);
      if (!KEY.test(entity)) refuse(W, there, "must be a key like task");
      if (built && !built.has(entity)) refuse(W, there, "names no entity the package builds");
      byEntity[entity] = entityLabelsOf(labels, there, built?.get(entity));
    }
    out[locale] = byEntity;
  }
  return out;
}

function entityLabelsOf(source: unknown, pointer: string, fieldKeys: ReadonlySet<string> | undefined): Record<string, unknown> {
  if (!isObject(source)) refuse(W, pointer, "must be an object");
  onlyMembers(source, CONFIG_MEMBERS.assistant_labels!, W, pointer);
  const out: Record<string, unknown> = {};
  if ("name" in source) {
    if (!labelOk(source.name)) refuse(W, at(pointer, "name"), `must be 1 to ${LABEL_MAX} characters`);
    out.name = source.name;
  }
  if ("fields" in source) {
    const where = at(pointer, "fields");
    if (!isObject(source.fields)) refuse(W, where, "must be an object");
    const fields: Record<string, string> = {};
    for (const [key, label] of Object.entries(source.fields)) {
      const here = at(where, key);
      if (!KEY.test(key)) refuse(W, here, "must be a key like due_date");
      if (fieldKeys && !fieldKeys.has(key)) refuse(W, here, "names no field of the entity");
      if (!labelOk(label)) refuse(W, here, `must be 1 to ${LABEL_MAX} characters`);
      fields[key] = label;
    }
    out.fields = fields;
  }
  return out;
}
