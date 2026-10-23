import { describe, expect, it } from "vitest";
import { entityInvariants, type EntitySource } from "../src/invariants.js";

const USERS = "ffffffff-0000-0000-0000-000000000001";
const UNITS = "ffffffff-0000-0000-0000-000000000003";

const project: EntitySource = {
  key: "project",
  fields: [
    { key: "name", type: "text" },
    { key: "managers", type: "reference_list", target_entity_id: USERS },
    { key: "status", type: "enum", enum_values: ["open", "closed"] },
  ],
};

const task = (extra: object = {}): EntitySource => ({
  key: "task",
  fields: [
    { key: "project", type: "reference", target_entity_id: "${entity:project}" },
    { key: "title", type: "text" },
    { key: "status", type: "enum", enum_values: ["todo", { value: "doing", label: "Doing" }, "done", "cancelled"] },
    { key: "collaborators", type: "reference_list", target_entity_id: USERS },
    { key: "lead", type: "reference", target_entity_id: USERS },
    { key: "unit", type: "reference", target_entity_id: UNITS },
    { key: "priority", type: "enum", enum_values: ["high", "low"] },
  ],
  ...extra,
});

const params = new Map([
  ["automation_group", "group_ref"],
  ["lead_user", "user_ref"],
  ["desk", "unit_ref"],
  ["sla", "sla_policy_ref"],
  ["ladder", "escalation_policy_ref"],
  ["runner", "service_principal_ref"],
]);
const entities = new Map([["project", project], ["task", task()]]);
const where = "entities/task.json";

const lifecycle = { status_field: "status", categories: { todo: "active", doing: "active", done: "done", cancelled: "cancelled" } };
const assignable = { lifecycle, assignable: { claim: "readers", rules: [{ on: "start", assign: [{ kind: "dynamic", source: { type: "creator" } }] }] } };

const run = (extra: object) => entityInvariants(task(extra), params, entities, where);
const refusal = (extra: object) => () => run(extra);
const leaf = (l: object) => ({ rules: [{ key: "r", message: "m", condition: { join: "and", leaves: [l] } }] });
const actor = (test: object) => leaf({ kind: "write", write: { op: "actor", test } });
const mover = (m: object) => ({ stage_model: { status_field: "status", transitions: [{ from: "todo", to: "doing", movers: [m] }] } });

describe("entityInvariants", () => {
  it("passes a rule, a stage model and work through, translating the group parameter", () => {
    const out = entityInvariants(task({
      rules: [{ key: "frozen_is_frozen", message: "Frozen", condition: { join: "and", leaves: [
        { kind: "write", write: { op: "is_update" } },
        { kind: "write", write: { op: "actor", negate: true, test: { kind: "in_group", group_id: "${param:automation_group}" } } } ] } }],
      stage_model: { status_field: "status", initial_statuses: ["todo"], transitions: [
        { from: "doing", to: "done", required_fields: [], movers: [{ kind: "is_holder" }] }] },
      work: { lifecycle: { status_field: "status", categories: { todo: "active", doing: "active", done: "done", cancelled: "cancelled" } },
              assignable: { claim: "readers", rules: [{ on: "start", assign: [{ kind: "dynamic", source: { type: "creator" } }] }] } },
    }), params, entities, "entities/task.json");
    expect(JSON.stringify(out.rules)).toContain('"group_id":"@param:automation_group"');
    expect(out.work).toBeDefined();
  });

  it("refuses what verification would", () => {
    const refusal = (extra: object) => () => entityInvariants(task(extra), params, entities, "entities/task.json");
    expect(refusal({ rules: [{ key: "Bad", message: "m", condition: { leaves: [{ kind: "write", write: { op: "is_new" } }] } }] }))
      .toThrow("entities/task.json#/rules/0/key: not a key");
    expect(refusal({ rules: [{ key: "a", message: "m", condition: { leaves: [{ kind: "write", write: { op: "changed", field: "nope" } }] } }] }))
      .toThrow("entities/task.json#/rules/0/condition/leaves/0/write/field: nope is not a field of task");
    expect(refusal({ rules: [{ key: "a", message: "m", condition: { leaves: [{ kind: "write", write: { op: "actor", test: { kind: "in_group", group_id: "${param:project_users_missing}" } } }] } }] }))
      .toThrow("is not a group_ref parameter");
    expect(refusal({ stage_model: { status_field: "status", transitions: [{ from: "todo", to: "gone" }] } }))
      .toThrow("entities/task.json#/stage_model/transitions/0/to: gone is not a value of status");
    expect(refusal({ work: { lifecycle: { status_field: "status", categories: { todo: "active" } } } }))
      .toThrow("entities/task.json#/work/lifecycle/categories: must name exactly the values of status");
    expect(refusal({ stage_model: { status_field: "status", transitions: [{ from: "todo", to: "doing", movers: [{ kind: "is_holder" }] }] } }))
      .toThrow("is_holder needs work.assignable");
  });

  it("returns only the members the entity declares", () => {
    expect(run({})).toEqual({});
    expect(Object.keys(run({ stage_model: { status_field: "status", transitions: [] } }))).toEqual(["stage_model"]);
  });

  it("accepts the shapes the platform accepts", () => {
    for (const ok of [
      leaf({ kind: "field", rule: { field: "project.name", op: "is_not_empty", value: null } }),
      leaf({ kind: "field", rule: { field: "title", op: "eq", value: { $field: "project.name" } } }),
      leaf({ kind: "field", rule: { field: "title", op: "lt", value: { $date: { offset: -18, unit: "years" } } } }),
      leaf({ kind: "field", rule: { field: "title", op: "eq", value: { a: 1 } } }),
      leaf({ kind: "field", rule: { field: "title", op: "is_empty" } }),
      leaf({ kind: "write", write: { op: "changed_any", fields: ["title", "status"] } }),
      leaf({ kind: "write", write: { op: "was", rule: { field: "status", op: "eq", value: "done" } } }),
      actor({ kind: "is_owner" }),
      actor({ kind: "is_elevated_run" }),
      actor({ kind: "in_field", field: "collaborators" }),
      actor({ kind: "in_parent_field", field: "project", parent_field: "managers" }),
      { rules: [{ key: "r", name: "R", message: "m", field: "title", enabled: false, condition: { join: "or", leaves: [{ kind: "write", write: { op: "is_new" } }] } }] },
      mover({ kind: "in_group", group_id: "${param:automation_group}" }),
    ]) expect(() => run(ok), JSON.stringify(ok)).not.toThrow();
  });

  it("refuses a rule's own shape", () => {
    const rule = { key: "r", message: "m", condition: { leaves: [{ kind: "write", write: { op: "is_new" } }] } };
    expect(refusal({ rules: [rule, rule] })).toThrow(`${where}#/rules/1/key: r is the key of an earlier rule`);
    expect(refusal({ rules: [{ ...rule, colour: "red" }] })).toThrow(`${where}#/rules/0/colour: a member the builder has no rule for`);
    expect(refusal({ rules: [{ ...rule, field: "nope" }] })).toThrow(`${where}#/rules/0/field: nope is not a field of task`);
    expect(refusal({ rules: [{ ...rule, message: "" }] })).toThrow(`${where}#/rules/0/message: a string of 1 to 300 characters`);
    expect(refusal({ rules: [{ ...rule, condition: { join: "xor", leaves: rule.condition.leaves } }] }))
      .toThrow(`${where}#/rules/0/condition/join: one of and, or`);
    expect(refusal({ rules: [{ ...rule, condition: { leaves: [] } }] })).toThrow(`${where}#/rules/0/condition/leaves: 1 to 20 leaves`);
    expect(refusal({ rules: Array.from({ length: 51 }, (_, i) => ({ ...rule, key: `r${i}` })) })).toThrow(`${where}#/rules: at most 50 rules`);
  });

  it("refuses a leaf the platform would", () => {
    const at = `${where}#/rules/0/condition/leaves/0`;
    expect(refusal(leaf({ kind: "field", rule: { field: "project.nope", op: "is_empty", value: null } })))
      .toThrow(`${at}/rule/field: nope is not a field of project`);
    expect(refusal(leaf({ kind: "field", rule: { field: "collaborators.name", op: "is_empty", value: null } })))
      .toThrow(`${at}/rule/field: collaborators is not a single reference to an entity of the package`);
    expect(refusal(leaf({ kind: "field", rule: { field: "title", op: "eq", value: { $field: "nope" } } })))
      .toThrow(`${at}/rule/value/$field: nope is not a field of task`);
    expect(refusal(leaf({ kind: "write", write: { op: "was", rule: { field: "project.name", op: "is_empty", value: null } } })))
      .toThrow(`${at}/write/rule/field: project.name reads through a reference, which only a field leaf may`);
    expect(refusal(leaf({ kind: "write", write: { op: "changed_any", fields: ["title", "nope"] } })))
      .toThrow(`${at}/write/fields/1: nope is not a field of task`);
    expect(refusal(leaf({ kind: "write", write: { op: "is_new", field: "title" } }))).toThrow(`${at}/write/field: a member the builder has no rule for`);
    expect(refusal(leaf({ kind: "write", field: "title", write: { op: "is_new" } }))).toThrow(`${at}/field: a member the builder has no rule for`);
    expect(refusal(leaf({ kind: "write", write: { op: "renamed" } }))).toThrow(`${at}/write/op: one of is_new, is_update, changed, changed_any, was, actor`);
    expect(refusal(leaf({ kind: "rule" }))).toThrow(`${at}/kind: one of field, write`);
    expect(refusal(leaf({ kind: "field", rule: { field: "title", op: "eq", value: "x", negate: true } })))
      .toThrow(`${at}/rule/negate: a member the builder has no rule for`);
    expect(refusal(leaf({ kind: "write", write: { op: "actor", negated: true, test: { kind: "is_owner" } } })))
      .toThrow(`${at}/write/negated: a member the builder has no rule for`);
    expect(refusal(leaf({ kind: "write", write: { op: "actor", negate: "yes", test: { kind: "is_owner" } } })))
      .toThrow(`${at}/write/negate: true or false`);
    for (const value of [{ $field: "status", extra: 1 }, { $fields: "status" }, { $date: { offset: -1, unit: "fortnights" } },
      { $date: { offset: -1, unit: "days", extra: 1 } }, { $date: { offset: 1.5, unit: "days" } }, { $bind: 3 }]) {
      expect(refusal(leaf({ kind: "field", rule: { field: "title", op: "eq", value } })), JSON.stringify(value)).toThrow(`${at}/rule/value`);
    }
  });

  it("refuses an actor test the platform would", () => {
    const at = `${where}#/rules/0/condition/leaves/0/write/test`;
    expect(refusal(actor({ kind: "is_holder" }))).toThrow(`${at}/kind: is_holder needs work.assignable`);
    expect(refusal(actor({ kind: "in_field", field: "title" }))).toThrow(`${at}/field: title is not a people field`);
    expect(refusal(actor({ kind: "in_field", field: "nope" }))).toThrow(`${at}/field: nope is not a field of task`);
    expect(refusal(actor({ kind: "in_parent_field", field: "collaborators", parent_field: "managers" })))
      .toThrow(`${at}/field: collaborators is not a single reference to an entity of the package`);
    expect(refusal(actor({ kind: "in_parent_field", field: "project", parent_field: "nope" })))
      .toThrow(`${at}/parent_field: nope is not a field of project`);
    expect(refusal(actor({ kind: "in_parent_field", field: "project", parent_field: "name" })))
      .toThrow(`${at}/parent_field: name is not a people field`);
    expect(refusal(actor({ kind: "in_group", group_id: "${param:runner}" }))).toThrow(`${at}/group_id: runner is not a group_ref parameter`);
    expect(refusal(actor({ kind: "in_group", group_id: "1f0c6a2e-7f5d-4a3b-9c1e-2b3d4e5f6a7b" }))).toThrow(`${at}/group_id: must be a \${param:key}`);
    expect(refusal(actor({ kind: "in_group", group_id: "${param:automation_group}", negate: true }))).toThrow(`${at}/negate: a member the builder has no rule for`);
    expect(refusal(actor({ kind: "is_superuser" }))).toThrow(`${at}/kind: one of is_owner, is_elevated_run, is_holder, in_field, in_parent_field, in_group`);
    expect(refusal({ work: assignable, ...actor({ kind: "is_holder", field: "collaborators" }) })).toThrow(`${at}/field: a member the builder has no rule for`);
  });

  it("refuses a stage model the platform would", () => {
    const at = `${where}#/stage_model`;
    expect(refusal({ stage_model: { status_field: "title", transitions: [] } })).toThrow(`${at}/status_field: title is not an enum field of task`);
    expect(refusal({ stage_model: { status_field: "nope", transitions: [] } })).toThrow(`${at}/status_field: nope is not a field of task`);
    expect(refusal({ stage_model: { status_field: "status", initial_statuses: ["x"], transitions: [] } }))
      .toThrow(`${at}/initial_statuses/0: x is not a value of status`);
    expect(refusal({ stage_model: { status_field: "status", transitions: [{ from: "x", to: "done" }] } }))
      .toThrow(`${at}/transitions/0/from: x is not a value of status`);
    expect(refusal({ stage_model: { status_field: "status", transitions: [{ from: "todo", to: "done", required_fields: ["nope"] }] } }))
      .toThrow(`${at}/transitions/0/required_fields/0: nope is not a field of task`);
    expect(refusal(mover({ kind: "in_group", group_id: "${param:automation_group}", extra: 1 })))
      .toThrow(`${at}/transitions/0/movers/0/extra: a member the builder has no rule for`);
    expect(refusal({ stage_model: { status_field: "status", transitions: [{ from: "todo", to: "done", via: "x" }] } }))
      .toThrow(`${at}/transitions/0/via: a member the builder has no rule for`);
    expect(refusal({ stage_model: { status_field: "status" } })).toThrow(`${at}/transitions: must be an array`);
    expect(refusal({ work: assignable, stage_model: { status_field: "work_state", transitions: [] } }))
      .toThrow(`${at}/status_field: work_state is a field the work seeds, not one of the entity's own`);
  });

  it("unlocks the holder and the seeded fields with the work that seeds them", () => {
    const claimed = leaf({ kind: "field", rule: { field: "claimed_by", op: "is_not_empty", value: null } });
    const changedClaim = leaf({ kind: "write", write: { op: "changed_any", fields: ["claimed_by", "work_state"] } });
    const state = leaf({ kind: "field", rule: { field: "work_state", op: "eq", value: "active" } });
    for (const ok of [actor({ kind: "is_holder" }), mover({ kind: "is_holder" }), claimed, changedClaim, state, actor({ kind: "in_field", field: "assigned_users" })]) {
      expect(() => run({ work: assignable, ...ok }), JSON.stringify(ok)).not.toThrow();
    }
    expect(() => run({ work: { lifecycle }, ...state })).not.toThrow();
    for (const bad of [claimed, changedClaim]) {
      expect(refusal(bad)).toThrow("claimed_by is not a field of task");
      expect(refusal({ work: { lifecycle }, ...bad })).toThrow("claimed_by is not a field of task");
    }
    expect(refusal({ work: { lifecycle }, ...actor({ kind: "is_holder" }) })).toThrow("is_holder needs work.assignable");
    const clock = { key: "due", label: "Due", start: { on: "work_start" }, sla_policy: "${param:sla}" };
    expect(() => run({ work: { lifecycle, deadline: { clocks: [clock] } }, ...leaf({ kind: "field", rule: { field: "due_due_at", op: "is_empty" } }) })).not.toThrow();
  });

  it("refuses an own field that takes a key the work seeds", () => {
    const file = task({ work: assignable });
    (file.fields as object[]).push({ key: "claimed_at", type: "datetime" });
    expect(() => entityInvariants(file, params, entities, where)).toThrow(`${where}#/fields/7/key: claimed_at is a field the work seeds`);
    expect(() => run({ work: { lifecycle } })).not.toThrow();
  });

  it("refuses a hop to a field the other entity's work does not seed", () => {
    expect(refusal(leaf({ kind: "field", rule: { field: "project.claimed_by", op: "is_empty" } }))).toThrow("claimed_by is not a field of project");
    const seeded = new Map([...entities, ["project", { ...project, work: { lifecycle: { status_field: "status", categories: { open: "active", closed: "done" } }, assignable: {} } }]]);
    expect(() => entityInvariants(task(leaf({ kind: "field", rule: { field: "project.claimed_by", op: "is_empty" } })), params, seeded, where)).not.toThrow();
  });

  it("accepts the full work the platform accepts", () => {
    const work = {
      lifecycle,
      assignable: {
        claim: "candidates",
        rules: [
          { on: "start", assign: [{ kind: "group", id: "${param:automation_group}" }] },
          { on: { enter: ["doing"] }, when: { "==": [{ var: "title" }, "x"] }, assign: [
            { kind: "user", id: "${param:lead_user}" },
            { kind: "unit", anchor: { type: "fixed", unit_id: "${param:desk}" }, reach: "subtree", group: "${param:automation_group}" },
            { kind: "dynamic", source: { type: "field", key: "lead" }, relation: { type: "manager", levels: 2 }, fallback: [{ kind: "user", id: "${param:lead_user}" }] },
            { kind: "dynamic", source: { type: "field", key: "collaborators" }, relation: { type: "direct" } },
            { kind: "dynamic", source: { type: "creator" }, relation: { type: "manager", levels: 1 } },
          ] },
        ],
      },
      work_surface: { priority: { field: "priority", values: { high: "urgent", low: "low" } } },
      deadline: { clocks: [{ key: "due", label: "Due", start: { on: "enter", statuses: ["todo"] }, pause_in: ["doing"],
        stop: { statuses: [], field: "title" }, sla_policy: "${param:sla}", escalation_policy: "${param:ladder}" }] },
    };
    const out = run({ work });
    expect(JSON.stringify(out.work)).toContain('"unit_id":"@param:desk"');
    expect(JSON.stringify(out.work)).toContain('"sla_policy":"@param:sla"');
  });

  it("refuses work the platform would", () => {
    const at = `${where}#/work`;
    const withRule = (assignee: object, on: unknown = "start") => ({ work: { lifecycle, assignable: { rules: [{ on, assign: [assignee] }] } } });
    const rule0 = `${at}/assignable/rules/0`;
    expect(refusal({ work: {} })).toThrow(`${at}: names at least one of lifecycle, assignable, work_surface, deadline`);
    expect(refusal({ work: { lifecycle, colour: 1 } })).toThrow(`${at}/colour: a member the builder has no rule for`);
    expect(refusal({ work: { assignable: {} } })).toThrow(`${at}/assignable: needs work.lifecycle`);
    expect(refusal({ work: { lifecycle, work_surface: {} } })).toThrow(`${at}/work_surface: needs work.assignable`);
    expect(refusal({ work: { deadline: { clocks: [] } } })).toThrow(`${at}/deadline: needs work.lifecycle`);
    expect(refusal({ work: { lifecycle: { status_field: "title", categories: {} } } })).toThrow(`${at}/lifecycle/status_field: title is not an enum field of task`);
    expect(refusal({ work: { lifecycle: { ...lifecycle, categories: { ...lifecycle.categories, archived: "done" } } } }))
      .toThrow(`${at}/lifecycle/categories: must name exactly the values of status`);
    expect(refusal({ work: { lifecycle: { ...lifecycle, categories: { ...lifecycle.categories, done: "finished" } } } }))
      .toThrow(`${at}/lifecycle/categories/done: one of none, active, waiting, done, cancelled`);
    expect(refusal({ work: { lifecycle, assignable: { claim: "anyone" } } })).toThrow(`${at}/assignable/claim: one of candidates, readers`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "creator" } }, { enter: ["gone"] })))
      .toThrow(`${rule0}/on/enter/0: gone is not a value of status`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "creator" } }, "finish"))).toThrow(`${rule0}/on: "start" or {"enter": [statuses]}`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "field", key: "title" } })))
      .toThrow(`${rule0}/assign/0/source/key: title is not a field work can be routed through`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "field", key: "unit" } })))
      .toThrow(`${rule0}/assign/0/source/key: unit is not a field work can be routed through`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "field", key: "nope" } })))
      .toThrow(`${rule0}/assign/0/source/key: nope is not a field of task`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "field", key: "collaborators" }, relation: { type: "manager", levels: 1 } })))
      .toThrow(`${rule0}/assign/0/relation: a manager is read through a single reference to a user`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "creator" }, relation: { type: "manager", levels: 6 } })))
      .toThrow(`${rule0}/assign/0/relation/levels: a whole number from 1 to 5`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "manager" } }))).toThrow(`${rule0}/assign/0/source/type: one of creator, field`);
    expect(refusal(withRule({ kind: "dynamic", source: { type: "creator" }, fallback: [{ kind: "dynamic", source: { type: "creator" } }] })))
      .toThrow(`${rule0}/assign/0/fallback/0/kind: one of user, group, unit`);
    expect(refusal(withRule({ kind: "user", id: "${param:automation_group}" }))).toThrow(`${rule0}/assign/0/id: automation_group is not a user_ref parameter`);
    expect(refusal(withRule({ kind: "group", id: "${param:lead_user}" }))).toThrow(`${rule0}/assign/0/id: lead_user is not a group_ref parameter`);
    expect(refusal(withRule({ kind: "unit", anchor: { type: "fixed", unit_id: "${param:lead_user}" } })))
      .toThrow(`${rule0}/assign/0/anchor/unit_id: lead_user is not a unit_ref parameter`);
    expect(refusal(withRule({ kind: "robot" }))).toThrow(`${rule0}/assign/0/kind: one of user, group, unit, dynamic`);
    expect(refusal({ work: { lifecycle, assignable: { rules: [{ on: "start", assign: [] }] } } })).toThrow(`${rule0}/assign: 1 to 50 assignees`);
    expect(refusal({ work: { ...assignable, work_surface: { priority: { field: "title" } } } }))
      .toThrow(`${at}/work_surface/priority/field: title is not an enum field of task`);
    expect(refusal({ work: { ...assignable, work_surface: { priority: { field: "priority", values: { medium: "normal" } } } } }))
      .toThrow(`${at}/work_surface/priority/values/medium: medium is not a value of priority`);
    expect(refusal({ work: { ...assignable, work_surface: { priority: { field: "priority", values: { high: "critical" } } } } }))
      .toThrow(`${at}/work_surface/priority/values/high: one of urgent, high, normal, low`);
    const clock = { key: "due", label: "Due", start: { on: "work_start" }, sla_policy: "${param:sla}" };
    const clocks = (c: object) => ({ work: { lifecycle, deadline: { clocks: [{ ...clock, ...c }] } } });
    const c0 = `${at}/deadline/clocks/0`;
    expect(refusal(clocks({ sla_policy: "${param:ladder}" }))).toThrow(`${c0}/sla_policy: ladder is not a sla_policy_ref parameter`);
    expect(refusal(clocks({ escalation_policy: "${param:sla}" }))).toThrow(`${c0}/escalation_policy: sla is not an escalation_policy_ref parameter`);
    expect(refusal(clocks({ pause_in: ["gone"] }))).toThrow(`${c0}/pause_in/0: gone is not a value of status`);
    expect(refusal(clocks({ stop: { field: "nope" } }))).toThrow(`${c0}/stop/field: nope is not a field of task`);
    expect(refusal(clocks({ start: { on: "enter", statuses: ["gone"] } }))).toThrow(`${c0}/start/statuses/0: gone is not a value of status`);
    expect(refusal(clocks({ key: "Due" }))).toThrow(`${c0}/key: not a clock key`);
  });

  it("entity comments passes through and refuses unknown members", () => {
    const comments = { enabled: true, closed_when: { join: "and", leaves: [{ kind: "field", rule: { field: "title", op: "eq", value: "x" } }] } };
    expect(run({ comments }).comments).toEqual(comments);
    expect(run({ comments: { enabled: false } }).comments).toEqual({ enabled: false });
    expect(run({}).comments).toBeUndefined();
    expect(refusal({ comments: { enabled: true, nope: 1 } })).toThrow("nope");
    expect(refusal({ comments: {} })).toThrow(`${where}#/comments/enabled`);
  });

  it("closed_when names declared fields with field leaves only", () => {
    const closed = (l: object) => ({ comments: { enabled: true, closed_when: { leaves: [l] } } });
    expect(refusal(closed({ kind: "field", rule: { field: "nope", op: "eq", value: 1 } }))).toThrow("nope is not a field of task");
    expect(refusal(closed({ kind: "field", rule: { field: "project.name", op: "is_not_empty" } }))).toThrow("reads through a reference");
    expect(refusal(closed({ kind: "write", write: { op: "is_new" } }))).toThrow("a field leaf");
  });
});
