import { at, isObject, onlyMembers, refuse, translate } from "./core.js";
import { CONFIG_MEMBERS, kindsOf } from "./members.js";

export interface EntitySource {
  key: string;
  fields: Record<string, unknown>[];
  [member: string]: unknown;
}

type Field = Record<string, unknown>;
type Json = Record<string, unknown>;

const KEY = /^[a-z](?:[a-z0-9]|_(?!_)){0,39}$/;
const CLOCK_KEY = /^[a-z][a-z0-9_]{0,23}$/;
const PARAM = /^\$\{param:([a-z][a-z0-9_-]*)\}$/;
const ENTITY = /^\$\{entity:([a-z][a-z0-9_-]*)\}$/;

const USERS = "ffffffff-0000-0000-0000-000000000001";
const GROUPS = "ffffffff-0000-0000-0000-000000000002";
const UNITS = "ffffffff-0000-0000-0000-000000000003";

const LIFECYCLE_FIELDS = { work_state: "enum", work_started_at: "datetime", done_at: "datetime" };
const ASSIGNABLE_FIELDS = {
  assigned_users: "reference_list", assigned_groups: "reference_list", assigned_units: "reference_list",
  claimed_by: "reference", assigned_at: "datetime", claimed_at: "datetime", minutes_to_claim: "number",
  minutes_to_done: "number",
};
const CLOCK_FIELDS = { state: "enum", outcome: "enum", due_at: "datetime", breached_at: "datetime", stopped_at: "datetime", minutes: "number" };
const SEEDED_TARGETS: Record<string, string> = {
  assigned_users: USERS, claimed_by: USERS, assigned_groups: GROUPS, assigned_units: UNITS,
};

const DATE_UNITS = ["days", "weeks", "months", "years"];
const CATEGORIES = ["none", "active", "waiting", "done", "cancelled"];
const PRIORITIES = ["urgent", "high", "normal", "low"];

const oneOf = (options: readonly string[]): string => `one of ${options.join(", ")}`;
const named = (value: unknown): string => (typeof value === "string" ? value : JSON.stringify(value));

// The fields the platform seeds on an entity for its `work`, each a system field of its type.
function seededFields(work: unknown): Map<string, Field> {
  const out = new Map<string, Field>();
  if (!isObject(work)) return out;
  const add = (fields: Record<string, string>, prefix = ""): void => {
    for (const [key, type] of Object.entries(fields)) {
      const body: Field = { type, system: true };
      if (Object.hasOwn(SEEDED_TARGETS, key)) body.target_entity_id = SEEDED_TARGETS[key];
      out.set(`${prefix}${key}`, body);
    }
  };
  if (isObject(work.lifecycle)) add(LIFECYCLE_FIELDS);
  if (isObject(work.assignable)) add(ASSIGNABLE_FIELDS);
  const clocks = isObject(work.deadline) && Array.isArray(work.deadline.clocks) ? work.deadline.clocks : [];
  for (const clock of clocks) if (isObject(clock) && typeof clock.key === "string") add(CLOCK_FIELDS, `${clock.key}_`);
  return out;
}

// Every field key a record of the entity carries: the entity's own and the ones its work seeds.
export function fieldKeysOf(file: EntitySource): Set<string> {
  const own = (Array.isArray(file.fields) ? file.fields : []).flatMap((f) => (isObject(f) && typeof f.key === "string" ? [f.key] : []));
  return new Set([...seededFields(file.work).keys(), ...own]);
}

const people = (field: Field): boolean =>
  (field.type === "reference" || field.type === "reference_list") &&
  [USERS, GROUPS, UNITS].includes(field.target_entity_id as string);

// A unit field names people too, but the platform routes no work through one.
const routes = (field: Field): boolean => people(field) && field.target_entity_id !== UNITS;

function enumValues(field: Field): Set<string> {
  const values = Array.isArray(field.enum_values) ? field.enum_values : [];
  return new Set(
    values
      .map((value) => (typeof value === "string" ? value : isObject(value) ? value.value : undefined))
      .filter((value): value is string => typeof value === "string"),
  );
}

class Invariants {
  private readonly assignable: boolean;

  constructor(
    private readonly file: EntitySource,
    private readonly params: Map<string, string>,
    private readonly entities: Map<string, EntitySource>,
    private readonly where: string,
  ) {
    this.assignable = isObject(file.work) && isObject(file.work.assignable);
  }

  private fail(pointer: string, message: string): never {
    return refuse(this.where, pointer, message);
  }

  private object(value: unknown, pointer: string, members: readonly string[]): Json {
    if (!isObject(value)) this.fail(pointer, "must be an object");
    onlyMembers(value, members, this.where, pointer);
    return value;
  }

  private record(value: unknown, pointer: string): Json {
    if (!isObject(value)) this.fail(pointer, "must be an object");
    return value;
  }

  private array(value: unknown, pointer: string): unknown[] {
    if (!Array.isArray(value)) this.fail(pointer, "must be an array");
    return value;
  }

  private text(value: unknown, pointer: string, max: number): void {
    if (typeof value !== "string" || value.length < 1 || value.length > max) {
      this.fail(pointer, `a string of 1 to ${max} characters`);
    }
  }

  private declared(entity: string): Map<string, Field> {
    const source = entity === this.file.key ? this.file : this.entities.get(entity);
    const fields = source && Array.isArray(source.fields) ? source.fields : [];
    return new Map(fields.filter((f) => isObject(f) && typeof f.key === "string").map((f) => [f.key as string, f]));
  }

  private fieldsOf(entity: string): Map<string, Field> {
    const source = entity === this.file.key ? this.file : this.entities.get(entity);
    return new Map([...seededFields(source?.work), ...this.declared(entity)]);
  }

  private fieldIn(entity: string, key: unknown, pointer: string): Field {
    if (typeof key !== "string") this.fail(pointer, "must be a field key");
    return this.fieldsOf(entity).get(key) ?? this.fail(pointer, `${key} is not a field of ${entity}`);
  }

  // An own field, or one the entity's work seeds.
  private own(key: unknown, pointer: string): Field {
    return this.fieldIn(this.file.key, key, pointer);
  }

  // An own field the entity declares itself, never one its work seeds.
  private declaredOwn(key: unknown, pointer: string): Field {
    if (typeof key !== "string") this.fail(pointer, "must be a field key");
    const field = this.declared(this.file.key).get(key);
    if (field) return field;
    if (seededFields(this.file.work).has(key)) this.fail(pointer, `${key} is a field the work seeds, not one of the entity's own`);
    return this.fail(pointer, `${key} is not a field of ${this.file.key}`);
  }

  private ownEnum(key: unknown, pointer: string): Set<string> {
    const field = this.declaredOwn(key, pointer);
    if (field.type !== "enum") this.fail(pointer, `${key as string} is not an enum field of ${this.file.key}`);
    return enumValues(field);
  }

  private valueOf(values: Set<string>, of: string, value: unknown, pointer: string): void {
    if (typeof value !== "string" || !values.has(value)) this.fail(pointer, `${named(value)} is not a value of ${of}`);
  }

  // The package entity that the own single reference `key` points at.
  private parentOf(key: unknown, pointer: string): string {
    const reference = this.own(key, pointer);
    const target = ENTITY.exec(reference.target_entity_id as string)?.[1];
    if (reference.type !== "reference" || !target || !this.entities.has(target)) {
      this.fail(pointer, `${key as string} is not a single reference to an entity of the package`);
    }
    return target;
  }

  private ownOrHop(key: unknown, pointer: string): void {
    if (typeof key !== "string" || !key.includes(".")) {
      this.own(key, pointer);
      return;
    }
    const dot = key.indexOf(".");
    this.fieldIn(this.parentOf(key.slice(0, dot), pointer), key.slice(dot + 1), pointer);
  }

  private parameter(value: unknown, type: string, pointer: string): void {
    const key = typeof value === "string" ? PARAM.exec(value)?.[1] : undefined;
    if (!key) this.fail(pointer, "must be a ${param:key}");
    if (this.params.get(key) !== type) this.fail(pointer, `${key} is not ${/^[aeio]/.test(type) ? "an" : "a"} ${type} parameter`);
  }

  private filter(rule: unknown, pointer: string, mayHop: boolean): void {
    const filter = this.object(rule, pointer, CONFIG_MEMBERS.filter!);
    const check = (key: unknown, keyAt: string): void => {
      if (mayHop) return this.ownOrHop(key, keyAt);
      if (typeof key === "string" && key.includes(".")) {
        this.fail(keyAt, `${key} reads through a reference, which only a field leaf may`);
      }
      this.own(key, keyAt);
    };
    check(filter.field, at(pointer, "field"));
    const value = filter.value;
    if (!isObject(value)) return;
    const marker = Object.keys(value).find((name) => name.startsWith("$"));
    if (marker === undefined) return;
    const valueAt = at(pointer, "value");
    onlyMembers(value, [marker], this.where, valueAt);
    const payloadAt = at(valueAt, marker);
    const payload = value[marker];
    if (marker === "$field") check(payload, payloadAt);
    else if (marker === "$bind") {
      if (typeof payload !== "string") this.fail(payloadAt, "must be a string");
    } else if (marker === "$date") {
      const date = this.object(payload, payloadAt, CONFIG_MEMBERS.date!);
      if (!Number.isInteger(date.offset)) this.fail(at(payloadAt, "offset"), "a whole number");
      if (!DATE_UNITS.includes(date.unit as string)) this.fail(at(payloadAt, "unit"), oneOf(DATE_UNITS));
    } else this.fail(payloadAt, `a marker the platform does not read: ${oneOf(["$field", "$bind", "$date"])}`);
  }

  private actor(value: unknown, pointer: string): void {
    if (!isObject(value)) this.fail(pointer, "must be an object");
    const kind = value.kind as string;
    if (!kindsOf("actor").includes(kind)) this.fail(at(pointer, "kind"), oneOf(kindsOf("actor")));
    if (kind === "is_holder" && !this.assignable) this.fail(at(pointer, "kind"), "is_holder needs work.assignable");
    onlyMembers(value, CONFIG_MEMBERS[`actor.${kind}`]!, this.where, pointer);
    if (kind === "in_field") {
      const fieldAt = at(pointer, "field");
      if (!people(this.own(value.field, fieldAt))) this.fail(fieldAt, `${value.field as string} is not a people field`);
    } else if (kind === "in_parent_field") {
      const parent = this.parentOf(value.field, at(pointer, "field"));
      const parentAt = at(pointer, "parent_field");
      if (!people(this.fieldIn(parent, value.parent_field, parentAt))) {
        this.fail(parentAt, `${value.parent_field as string} is not a people field`);
      }
    } else if (kind === "in_group") this.parameter(value.group_id, "group_ref", at(pointer, "group_id"));
  }

  private leaf(value: unknown, pointer: string): void {
    if (!isObject(value)) this.fail(pointer, "must be an object");
    if (value.kind === "field") {
      onlyMembers(value, CONFIG_MEMBERS.leaf_field!, this.where, pointer);
      return this.filter(value.rule, at(pointer, "rule"), true);
    }
    if (value.kind !== "write") this.fail(at(pointer, "kind"), oneOf(["field", "write"]));
    onlyMembers(value, CONFIG_MEMBERS.leaf_write!, this.where, pointer);
    const writeAt = at(pointer, "write");
    if (!isObject(value.write)) this.fail(writeAt, "must be an object");
    const write = value.write;
    const op = write.op as string;
    if (!kindsOf("write").includes(op)) this.fail(at(writeAt, "op"), oneOf(kindsOf("write")));
    onlyMembers(write, CONFIG_MEMBERS[`write.${op}`]!, this.where, writeAt);
    if ("negate" in write && typeof write.negate !== "boolean") this.fail(at(writeAt, "negate"), "true or false");
    if (op === "changed") this.own(write.field, at(writeAt, "field"));
    else if (op === "changed_any") {
      const fieldsAt = at(writeAt, "fields");
      this.array(write.fields, fieldsAt).forEach((field, i) => this.own(field, at(fieldsAt, i)));
    } else if (op === "was") this.filter(write.rule, at(writeAt, "rule"), false);
    else if (op === "actor") this.actor(write.test, at(writeAt, "test"));
  }

  rules(value: unknown, pointer: string): void {
    const rules = this.array(value, pointer);
    if (rules.length > 50) this.fail(pointer, "at most 50 rules");
    const keys = new Set<unknown>();
    rules.forEach((item, i) => {
      const here = at(pointer, i);
      const rule = this.object(item, here, CONFIG_MEMBERS.rules!);
      if (typeof rule.key !== "string" || !KEY.test(rule.key)) this.fail(at(here, "key"), "not a key");
      if (keys.has(rule.key)) this.fail(at(here, "key"), `${rule.key} is the key of an earlier rule`);
      keys.add(rule.key);
      if ("name" in rule) this.text(rule.name, at(here, "name"), 120);
      this.text(rule.message, at(here, "message"), 300);
      if ("enabled" in rule && typeof rule.enabled !== "boolean") this.fail(at(here, "enabled"), "true or false");
      if ("field" in rule) this.own(rule.field, at(here, "field"));
      const conditionAt = at(here, "condition");
      const condition = this.object(rule.condition, conditionAt, CONFIG_MEMBERS.condition!);
      if ("join" in condition && !["and", "or"].includes(condition.join as string)) {
        this.fail(at(conditionAt, "join"), oneOf(["and", "or"]));
      }
      const leavesAt = at(conditionAt, "leaves");
      const leaves = this.array(condition.leaves, leavesAt);
      if (leaves.length < 1 || leaves.length > 20) this.fail(leavesAt, "1 to 20 leaves");
      leaves.forEach((leaf, j) => this.leaf(leaf, at(leavesAt, j)));
    });
  }

  stageModel(value: unknown, pointer: string): void {
    const model = this.object(value, pointer, CONFIG_MEMBERS.stage_model!);
    const status = model.status_field as string;
    const values = this.ownEnum(status, at(pointer, "status_field"));
    if ("initial_statuses" in model) {
      const initialAt = at(pointer, "initial_statuses");
      this.array(model.initial_statuses, initialAt).forEach((s, i) => this.valueOf(values, status, s, at(initialAt, i)));
    }
    const transitionsAt = at(pointer, "transitions");
    this.array(model.transitions, transitionsAt).forEach((item, i) => {
      const here = at(transitionsAt, i);
      const transition = this.object(item, here, CONFIG_MEMBERS.transition!);
      this.valueOf(values, status, transition.from, at(here, "from"));
      this.valueOf(values, status, transition.to, at(here, "to"));
      if ("required_fields" in transition) {
        const requiredAt = at(here, "required_fields");
        this.array(transition.required_fields, requiredAt).forEach((f, j) => this.own(f, at(requiredAt, j)));
      }
      if ("movers" in transition) {
        const moversAt = at(here, "movers");
        this.array(transition.movers, moversAt).forEach((m, j) => this.actor(m, at(moversAt, j)));
      }
    });
  }

  work(value: unknown, pointer: string): void {
    const parts = CONFIG_MEMBERS.work!;
    const work = this.object(value, pointer, parts);
    if (Object.keys(work).length === 0) this.fail(pointer, `names at least one of ${parts.join(", ")}`);
    for (const [part, needs] of [["assignable", "lifecycle"], ["work_surface", "assignable"], ["deadline", "lifecycle"]] as const) {
      if (part in work && !(needs in work)) this.fail(at(pointer, part), `needs work.${needs}`);
    }
    if (!("lifecycle" in work)) return;

    const lifecycleAt = at(pointer, "lifecycle");
    const lifecycle = this.object(work.lifecycle, lifecycleAt, CONFIG_MEMBERS.lifecycle!);
    const status = lifecycle.status_field as string;
    const statuses = this.ownEnum(status, at(lifecycleAt, "status_field"));
    const categoriesAt = at(lifecycleAt, "categories");
    const categories = this.record(lifecycle.categories, categoriesAt);
    for (const [value, category] of Object.entries(categories)) {
      if (!CATEGORIES.includes(category as string)) this.fail(at(categoriesAt, value), oneOf(CATEGORIES));
    }
    const categorized = Object.keys(categories);
    if (categorized.length !== statuses.size || !categorized.every((v) => statuses.has(v))) {
      this.fail(categoriesAt, `must name exactly the values of ${status}`);
    }
    const statusList = (list: unknown, listAt: string): void =>
      this.array(list, listAt).forEach((s, i) => this.valueOf(statuses, status, s, at(listAt, i)));

    if ("assignable" in work) this.assignableOf(work.assignable, at(pointer, "assignable"), statusList);
    if ("work_surface" in work) {
      const surfaceAt = at(pointer, "work_surface");
      const surface = this.object(work.work_surface, surfaceAt, CONFIG_MEMBERS.work_surface!);
      if ("priority" in surface) {
        const priorityAt = at(surfaceAt, "priority");
        const priority = this.object(surface.priority, priorityAt, CONFIG_MEMBERS.priority!);
        const options = this.ownEnum(priority.field, at(priorityAt, "field"));
        if ("values" in priority) {
          const valuesAt = at(priorityAt, "values");
          const values = this.record(priority.values, valuesAt);
          for (const [option, mapped] of Object.entries(values)) {
            this.valueOf(options, priority.field as string, option, at(valuesAt, option));
            if (!PRIORITIES.includes(mapped as string)) this.fail(at(valuesAt, option), oneOf(PRIORITIES));
          }
        }
      }
    }
    if ("deadline" in work) this.deadline(work.deadline, at(pointer, "deadline"), statusList);
  }

  private assignableOf(value: unknown, pointer: string, statusList: (list: unknown, at: string) => void): void {
    const assignable = this.object(value, pointer, CONFIG_MEMBERS.assignable!);
    if ("claim" in assignable && !["candidates", "readers"].includes(assignable.claim as string)) {
      this.fail(at(pointer, "claim"), oneOf(["candidates", "readers"]));
    }
    if (!("rules" in assignable)) return;
    const rulesAt = at(pointer, "rules");
    const rules = this.array(assignable.rules, rulesAt);
    if (rules.length > 50) this.fail(rulesAt, "at most 50 rules");
    rules.forEach((item, i) => {
      const here = at(rulesAt, i);
      const rule = this.object(item, here, CONFIG_MEMBERS.assign_rule!);
      const onAt = at(here, "on");
      if (isObject(rule.on)) {
        onlyMembers(rule.on, CONFIG_MEMBERS.assign_on!, this.where, onAt);
        const enter = rule.on.enter;
        if (!Array.isArray(enter) || enter.length === 0) this.fail(at(onAt, "enter"), "a list of one or more statuses");
        statusList(enter, at(onAt, "enter"));
      } else if (rule.on !== "start") this.fail(onAt, `"start" or {"enter": [statuses]}`);
      if ("when" in rule && !isObject(rule.when)) this.fail(at(here, "when"), "must be an object");
      const assignAt = at(here, "assign");
      const assign = this.array(rule.assign, assignAt);
      if (assign.length < 1 || assign.length > 50) this.fail(assignAt, "1 to 50 assignees");
      assign.forEach((assignee, j) => this.assignee(assignee, at(assignAt, j), true));
    });
  }

  private assignee(value: unknown, pointer: string, mayBeDynamic: boolean): void {
    if (!isObject(value)) this.fail(pointer, "must be an object");
    const kinds = mayBeDynamic ? ["user", "group", "unit", "dynamic"] : ["user", "group", "unit"];
    if (!kinds.includes(value.kind as string)) this.fail(at(pointer, "kind"), oneOf(kinds));
    if (value.kind === "user" || value.kind === "group") {
      onlyMembers(value, CONFIG_MEMBERS.assignee_principal!, this.where, pointer);
      return this.parameter(value.id, `${value.kind}_ref`, at(pointer, "id"));
    }
    if (value.kind === "unit") {
      onlyMembers(value, CONFIG_MEMBERS.assignee_unit!, this.where, pointer);
      const anchorAt = at(pointer, "anchor");
      const anchor = this.object(value.anchor, anchorAt, CONFIG_MEMBERS.anchor!);
      if (anchor.type !== "fixed") this.fail(at(anchorAt, "type"), oneOf(["fixed"]));
      this.parameter(anchor.unit_id, "unit_ref", at(anchorAt, "unit_id"));
      if ("reach" in value && !["unit", "subtree"].includes(value.reach as string)) this.fail(at(pointer, "reach"), oneOf(["unit", "subtree"]));
      if ("group" in value) this.parameter(value.group, "group_ref", at(pointer, "group"));
      return;
    }
    onlyMembers(value, CONFIG_MEMBERS.assignee_dynamic!, this.where, pointer);
    const sourceAt = at(pointer, "source");
    if (!isObject(value.source)) this.fail(sourceAt, "must be an object");
    const source = value.source;
    let field: Field | undefined;
    if (source.type === "creator") onlyMembers(source, CONFIG_MEMBERS.source_creator!, this.where, sourceAt);
    else if (source.type === "field") {
      onlyMembers(source, CONFIG_MEMBERS.source_field!, this.where, sourceAt);
      field = this.declaredOwn(source.key, at(sourceAt, "key"));
      if (!routes(field)) this.fail(at(sourceAt, "key"), `${source.key as string} is not a field work can be routed through`);
    } else this.fail(at(sourceAt, "type"), oneOf(["creator", "field"]));
    if ("relation" in value) {
      const relationAt = at(pointer, "relation");
      if (!isObject(value.relation)) this.fail(relationAt, "must be an object");
      const relation = value.relation;
      if (relation.type === "direct") onlyMembers(relation, CONFIG_MEMBERS.relation_direct!, this.where, relationAt);
      else if (relation.type === "manager") {
        onlyMembers(relation, CONFIG_MEMBERS.relation_manager!, this.where, relationAt);
        const levels = relation.levels;
        if (!Number.isInteger(levels) || (levels as number) < 1 || (levels as number) > 5) {
          this.fail(at(relationAt, "levels"), "a whole number from 1 to 5");
        }
        if (field && !(field.type === "reference" && field.target_entity_id === USERS)) {
          this.fail(relationAt, "a manager is read through a single reference to a user");
        }
      } else this.fail(at(relationAt, "type"), oneOf(["direct", "manager"]));
    }
    if ("fallback" in value) {
      const fallbackAt = at(pointer, "fallback");
      const fallback = this.array(value.fallback, fallbackAt);
      if (fallback.length > 50) this.fail(fallbackAt, "at most 50 assignees");
      fallback.forEach((item, i) => this.assignee(item, at(fallbackAt, i), false));
    }
  }

  private deadline(value: unknown, pointer: string, statusList: (list: unknown, at: string) => void): void {
    const deadline = this.object(value, pointer, CONFIG_MEMBERS.deadline!);
    const clocksAt = at(pointer, "clocks");
    const clocks = this.array(deadline.clocks, clocksAt);
    if (clocks.length < 1 || clocks.length > 5) this.fail(clocksAt, "1 to 5 clocks");
    clocks.forEach((item, i) => {
      const here = at(clocksAt, i);
      const clock = this.object(item, here, CONFIG_MEMBERS.clock!);
      if (typeof clock.key !== "string" || !CLOCK_KEY.test(clock.key)) this.fail(at(here, "key"), "not a clock key");
      this.text(clock.label, at(here, "label"), 80);
      const startAt = at(here, "start");
      if (!isObject(clock.start)) this.fail(startAt, "must be an object");
      if (clock.start.on === "work_start") onlyMembers(clock.start, CONFIG_MEMBERS.clock_start_work!, this.where, startAt);
      else if (clock.start.on === "enter") {
        onlyMembers(clock.start, CONFIG_MEMBERS.clock_start_enter!, this.where, startAt);
        statusList(clock.start.statuses, at(startAt, "statuses"));
      } else this.fail(at(startAt, "on"), oneOf(["work_start", "enter"]));
      if ("pause_in" in clock) statusList(clock.pause_in, at(here, "pause_in"));
      if ("stop" in clock) {
        const stopAt = at(here, "stop");
        const stop = this.object(clock.stop, stopAt, CONFIG_MEMBERS.clock_stop!);
        if ("statuses" in stop) statusList(stop.statuses, at(stopAt, "statuses"));
        if ("field" in stop) this.declaredOwn(stop.field, at(stopAt, "field"));
      }
      this.parameter(clock.sla_policy, "sla_policy_ref", at(here, "sla_policy"));
      if ("escalation_policy" in clock) this.parameter(clock.escalation_policy, "escalation_policy_ref", at(here, "escalation_policy"));
    });
  }

  // One record scope of a grant on this entity, as the platform's package verification reads it.
  recordScope(operation: string, value: unknown, pointer: string): Json {
    const scope = this.object(value, pointer, CONFIG_MEMBERS.record_scope!);
    const kind = scope.kind;
    if (!kindsOf("record_scope").includes(kind as string)) this.fail(at(pointer, "kind"), oneOf(kindsOf("record_scope")));
    onlyMembers(scope, CONFIG_MEMBERS[`record_scope.${kind as string}`]!, this.where, pointer);
    if (operation === "create" && kind !== "parent_field") this.fail(pointer, "on create only a parent_field scope");
    const fieldAt = at(pointer, "field");
    if (kind === "work") {
      if (!this.assignable) this.fail(at(pointer, "kind"), "a work scope needs work.assignable");
    } else if (kind === "field") {
      if (!people(this.declaredOwn(scope.field, fieldAt))) {
        this.fail(fieldAt, `${scope.field as string} is not a people field of ${this.file.key}`);
      }
    } else {
      const parent = this.parentOf(scope.field, fieldAt);
      const parentAt = at(pointer, "parent_field");
      const declared = typeof scope.parent_field === "string" ? this.declared(parent).get(scope.parent_field) : undefined;
      if (!declared || !people(declared)) {
        this.fail(parentAt, `${named(scope.parent_field)} is not a people field of ${parent}`);
      }
    }
    return { ...scope };
  }

  // No own field may take a key the entity's work seeds.
  seededClash(): void {
    const seeded = seededFields(this.file.work);
    const fields: unknown[] = Array.isArray(this.file.fields) ? this.file.fields : [];
    fields.forEach((field, i) => {
      if (isObject(field) && seeded.has(field.key as string)) this.fail(at(at("/fields", i), "key"), `${field.key as string} is a field the work seeds`);
    });
  }
}

// The entity's rules, stage model and work, checked as the platform's package verification checks them
// and translated. Only the members the entity declares come back.
export function entityInvariants(
  file: EntitySource,
  params: Map<string, string>,
  entities: Map<string, EntitySource>,
  where: string,
): { rules?: unknown; stage_model?: unknown; work?: unknown } {
  const check = new Invariants(file, params, entities, where);
  const out: { rules?: unknown; stage_model?: unknown; work?: unknown } = {};
  if (file.work !== undefined) {
    check.work(file.work, "/work");
    check.seededClash();
  }
  if (file.rules !== undefined) check.rules(file.rules, "/rules");
  if (file.stage_model !== undefined) check.stageModel(file.stage_model, "/stage_model");
  if (file.rules !== undefined) out.rules = translate(file.rules, where, "/rules");
  if (file.stage_model !== undefined) out.stage_model = translate(file.stage_model, where, "/stage_model");
  if (file.work !== undefined) out.work = translate(file.work, where, "/work");
  return out;
}

export function grantRecordScope(
  file: EntitySource,
  entities: Map<string, EntitySource>,
  where: string,
  operation: string,
  scope: unknown,
  pointer: string,
): unknown {
  return new Invariants(file, new Map(), entities, where).recordScope(operation, scope, pointer);
}
