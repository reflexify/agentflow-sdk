import { at, clip, isObject, refuse } from "./core.js";
import { fieldOf, type EntitySource } from "./invariants.js";

const EMPTINESS = ["is_empty", "is_not_empty"];
const NUMBER_OPS = ["eq", "ne", "gt", "gte", "lt", "lte", "between", "range_any"];
const OPS_BY_TYPE: Record<string, readonly string[]> = {
  number: NUMBER_OPS,
  date: [...NUMBER_OPS, "within"],
  datetime: [...NUMBER_OPS, "within"],
  enum: ["eq", "ne", "in", "not_in"],
  reference: ["eq", "ne", "in", "not_in"],
  boolean: ["eq", "ne"],
  text: ["eq", "ne", "contains", "not_contains", "starts_with", "ends_with"],
  multi_select: ["in", "not_in"],
  reference_list: ["in", "not_in"],
  file: [],
  list: [],
  formula: [],
};
const FORMULA_RESULTS = ["text", "number", "boolean", "date", "datetime"];
const MAX_RANGE_ANY_INTERVALS = 20;
const MAX_LAST_N_DAYS = 3660;
const WINDOWS = ["today", "this_month", "this_quarter", "this_year"];
const LAST_N_DAYS = /^last_([1-9][0-9]*)_days$/;
const SYSTEM_TARGETS = new Set([
  "ffffffff-0000-0000-0000-000000000001",
  "ffffffff-0000-0000-0000-000000000002",
  "ffffffff-0000-0000-0000-000000000003",
]);
const ENTITY_REFERENCE = /^\$\{entity:([a-z][a-z0-9_-]*)\}$/;

export interface FilterSurface {
  entityKey: string;
  file: EntitySource;
  sources: ReadonlyMap<string, EntitySource>;
  where: string;
  // A preset rule may carry a $bind and cannot hop through a reference; a fixed filter is the other way round.
  preset: boolean;
}

type Field = Record<string, unknown>;

// What a field compares as: a formula as its result type, an auto-number as a number or as the text it renders.
function effectiveType(field: Field): string | undefined {
  const type = field.type;
  if (typeof type !== "string") return undefined;
  if (type === "formula") return typeof field.formula_result_type === "string" && FORMULA_RESULTS.includes(field.formula_result_type) ? field.formula_result_type : "formula";
  if (type === "auto_number") return typeof field.auto_number_format === "string" ? "text" : "number";
  return type;
}

function windowIsValid(slug: string): boolean {
  if (WINDOWS.includes(slug)) return true;
  const days = LAST_N_DAYS.exec(slug);
  return days !== null && Number(days[1]) <= MAX_LAST_N_DAYS;
}

function checkValue(op: string, value: unknown, where: string, pointer: string): void {
  if (typeof value === "string" && value.startsWith("${")) return;
  if (op === "in" || op === "not_in") {
    if (!Array.isArray(value)) refuse(where, pointer, `${op} takes an array of values`);
  } else if (op === "between") {
    if (!Array.isArray(value) || value.length !== 2) refuse(where, pointer, "between takes a [low, high] array");
  } else if (op === "within") {
    if (typeof value !== "string") refuse(where, pointer, "within takes a date-window slug");
    if (!windowIsValid(value as string)) {
      refuse(where, pointer, `${clip(String(value))} is not a date window: use today, this_month, this_quarter, this_year or last_<n>_days (n from 1 to ${MAX_LAST_N_DAYS}, no leading zero)`);
    }
  } else if (op === "range_any") {
    if (!Array.isArray(value)) refuse(where, pointer, "range_any takes an array of [from, to] intervals");
    const intervals = value as unknown[];
    if (intervals.length > MAX_RANGE_ANY_INTERVALS) refuse(where, pointer, `range_any takes at most ${MAX_RANGE_ANY_INTERVALS} intervals`);
    intervals.forEach((interval, i) => {
      const here = at(pointer, i);
      if (!Array.isArray(interval) || interval.length !== 2) refuse(where, here, "an interval is a [from, to] pair");
      const [from, to] = interval as unknown[];
      for (const bound of [from, to]) if (bound !== null && typeof bound !== "number") refuse(where, here, "an interval's bounds are numbers or null");
      if (from === null && to === null) refuse(where, here, "an interval needs at least one bound");
    });
  }
}

function checkOperator(field: Field, key: string, op: string, entityKey: string, where: string, pointer: string): void {
  const type = effectiveType(field);
  if (type === undefined || !Object.hasOwn(OPS_BY_TYPE, type)) return;
  const allowed = [...(OPS_BY_TYPE[type] ?? []), ...EMPTINESS];
  if (!allowed.includes(op)) {
    refuse(where, pointer, `${op} does not suit ${key} of ${entityKey}, a field of type ${type}: use ${allowed.join(", ")}`);
  }
}

function hop(key: string, surface: FilterSurface, pointer: string): { file: EntitySource; field: string; entityKey: string } | undefined {
  const dot = key.indexOf(".");
  const { entityKey, file, sources, where } = surface;
  if (surface.preset) refuse(where, pointer, `${key} goes through a reference: a preset filters the view's own fields, so put it on the view's filters`);
  const via = fieldOf(file, key.slice(0, dot));
  if (!via) refuse(where, pointer, `${key.slice(0, dot)} is not a field of ${entityKey}`);
  if (via!.type !== "reference" && via!.type !== "reference_list") refuse(where, pointer, `${key.slice(0, dot)} is not a reference field of ${entityKey}, so it has no target to filter through`);
  const target = via!.target_entity_id;
  if (typeof target === "string" && SYSTEM_TARGETS.has(target)) {
    refuse(where, pointer, `${key.slice(0, dot)} refers to users, groups or units, whose fields a filter cannot reach: filter on ${key.slice(0, dot)} itself`);
  }
  const named = typeof target === "string" ? ENTITY_REFERENCE.exec(target)?.[1] : undefined;
  const targetFile = named === undefined ? undefined : sources.get(named);
  return targetFile && named ? { file: targetFile, field: key.slice(dot + 1), entityKey: named } : undefined;
}

export function checkFilterRule(rule: unknown, surface: FilterSurface, pointer: string): void {
  const { where, entityKey } = surface;
  if (!isObject(rule)) refuse(where, pointer, "must be an object");
  const fieldAt = at(pointer, "field");
  if (typeof rule.field !== "string" || rule.field === "") refuse(where, fieldAt, "a field key");
  const opAt = at(pointer, "op");
  if (typeof rule.op !== "string") refuse(where, opAt, "an operator");
  const key = rule.field as string;
  const op = rule.op as string;
  const value = rule.value;
  const valueAt = at(pointer, "value");

  let owner: { file: EntitySource; field: string; entityKey: string } | undefined = { file: surface.file, field: key, entityKey };
  if (key.includes(".")) owner = hop(key, surface, fieldAt);
  if (owner) {
    const field = fieldOf(owner.file, owner.field);
    if (!field) refuse(where, fieldAt, `${owner.field} is not a field of ${owner.entityKey}`);
    checkOperator(field!, key, op, owner.entityKey, where, opAt);
  }
  const bound = isObject(value) && "$bind" in value;
  if (bound && !surface.preset) {
    refuse(where, valueAt, "a fixed filter compares as written and never resolves $bind: put the filter in a preset in config.presets");
  }
  if (!bound) checkValue(op, value, where, valueAt);
}
