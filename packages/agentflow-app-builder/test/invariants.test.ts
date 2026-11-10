import { describe, expect, it } from "vitest";
import { checkModulePage, entityInvariants, extensionBody, type EntitySource, type PackageAccess } from "../src/invariants.js";

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

  it("refuses a routing condition that is not one JSONLogic operator", () => {
    const routed = (when: unknown) => ({ work: { lifecycle, assignable: { claim: "readers", rules: [
      { on: "start", when, assign: [{ kind: "group", id: "${param:automation_group}" }] }] } } });
    const at = `${where}#/work/assignable/rules/0/when`;
    for (const ok of [{ "==": [{ var: "title" }, "x"] }, { and: [{ "==": [{ var: "title" }, "x"] }, { "!=": [{ var: "status" }, "done"] }] }]) {
      expect(() => run(routed(ok)), JSON.stringify(ok)).not.toThrow();
    }
    expect(refusal(routed({ join: "and", leaves: [{ kind: "field", rule: { field: "title", op: "eq", value: "x" } }] })))
      .toThrow(`${at}: one JSONLogic operator, such as {"==": [{"var": "<field>"}, <value>]}, not 2 (join, leaves): a rule's condition is written differently`);
    expect(refusal(routed({ and: [{ "==": [{ var: "title" }, "x"], "!=": [{ var: "status" }, "done"] }] })))
      .toThrow(`${at}/and/0: one JSONLogic operator, such as {"==": [{"var": "<field>"}, <value>]}, not 2 (!=, ==)`);
    expect(refusal(routed({}))).toThrow(`${at}: one JSONLogic operator, such as {"==": [{"var": "<field>"}, <value>]}, not none`);
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
    const noViewer = "a condition on a record has no viewer, so a $bind belongs only in a view's preset";
    const viewer = { $bind: "viewer.id" };
    expect(refusal(leaf({ kind: "field", rule: { field: "title", op: "eq", value: viewer } })))
      .toThrow(`${at}/rule/value/$bind: ${noViewer}`);
    expect(refusal(leaf({ kind: "write", write: { op: "was", rule: { field: "title", op: "eq", value: viewer } } })))
      .toThrow(`${at}/write/rule/value/$bind: ${noViewer}`);
    expect(refusal({ comments: { enabled: true, closed_when: { leaves: [{ kind: "field", rule: { field: "title", op: "eq", value: viewer } }] } } }))
      .toThrow(`${where}#/comments/closed_when/leaves/0/rule/value/$bind: ${noViewer}`);
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

  it("holds the document contract to the fields the platform lets it name, and seeds its three fields", () => {
    const doc = (extract: unknown[], context: unknown[] = []) => ({ work: { lifecycle, document: { extract_fields: extract, context_fields: context } } });
    const at = `${where}#/work/document`;
    expect(() => run(doc(["title", "priority"], ["status", "lead", "owner", "created_at", "document_status", "work_state"]))).not.toThrow();
    expect(() => run({ work: { document: {} } })).not.toThrow();
    expect(() => run({ work: { document: { extract_fields: ["title"] } }, ...leaf({ kind: "field", rule: { field: "document_status", op: "eq", value: "ready" } }) })).not.toThrow();
    for (const [bad, message] of [
      [doc(["nope"]), `${at}/extract_fields/0: nope is not a field the entity declares`],
      [doc(["status"]), `${at}/extract_fields/0: status is the lifecycle's status field`],
      [doc(["lead"]), `${at}/extract_fields/0: lead is a reference field`],
      [doc(["title", "document_status"]), `${at}/extract_fields/1: document_status is a field the platform writes`],
      [doc(["owner"]), `${at}/extract_fields/0: owner is a field the platform writes`],
      [doc(["unit"]), `${at}/extract_fields/0: unit is a field the platform writes`],
      [doc([], ["nope"]), `${at}/context_fields/0: nope is not a field of task`],
      [doc([3]), `${at}/extract_fields/0: must be a field key`],
      [{ work: { document: { extract_fields: "title" } } }, `${at}/extract_fields: must be an array`],
      [{ work: { document: { fields: [] } } }, `${at}/fields: a member the builder has no rule for`],
    ] as const) {
      expect(refusal(bad), message).toThrow(message);
    }
    const file = task({ work: { document: {} } });
    (file.fields as object[]).push({ key: "document_file", type: "file" });
    expect(() => entityInvariants(file, params, entities, where)).toThrow(`${where}#/fields/7/key: document_file is a field the work seeds`);
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
      module_page: "/items/{{ record_id }}",
      deadline: { clocks: [{ key: "due", label: "Due", start: { on: "enter", statuses: ["todo"] }, pause_in: ["doing"],
        stop: { statuses: [], field: "title" }, sla_policy: "${param:sla}", escalation_policy: "${param:ladder}" }] },
    };
    const out = run({ work });
    expect(JSON.stringify(out.work)).toContain('"unit_id":"@param:desk"');
    expect(JSON.stringify(out.work)).toContain('"sla_policy":"@param:sla"');
    expect(JSON.stringify(out.work)).toContain('"module_page":"/items/{{ record_id }}"');
  });

  it("takes a pool at the record's unit only on an entity that classifies its records", () => {
    const pool = { kind: "unit", anchor: { type: "record_unit" } };
    const routed = (assignee: object, extra: object = {}) => ({
      work: { lifecycle, assignable: { rules: [{ on: "start", assign: [assignee] }] } },
      ...extra,
    });
    expect(() => run(routed(pool, { requires_unit_classification: true }))).not.toThrow();
    expect(JSON.stringify(run(routed(pool, { requires_unit_classification: true })).work)).toContain('"anchor":{"type":"record_unit"}');
    const anchorAt = `${where}#/work/assignable/rules/0/assign/0/anchor`;
    for (const extra of [{}, { requires_unit_classification: false }]) {
      expect(refusal(routed(pool, extra))).toThrow(`${anchorAt}/type: a pool anchored at the record's unit needs requires_unit_classification: true on the entity`);
    }
    expect(refusal(routed({ kind: "unit", anchor: { type: "record_unit", unit_id: "${param:desk}" } }, { requires_unit_classification: true })))
      .toThrow(`${anchorAt}/unit_id: a pool at the record's unit names no unit`);
    expect(refusal(routed({ kind: "unit", anchor: { type: "nearest" } }, { requires_unit_classification: true })))
      .toThrow(`${anchorAt}/type: one of fixed, record_unit`);
  });

  it("refuses work the platform would", () => {
    const at = `${where}#/work`;
    const withRule = (assignee: object, on: unknown = "start") => ({ work: { lifecycle, assignable: { rules: [{ on, assign: [assignee] }] } } });
    const rule0 = `${at}/assignable/rules/0`;
    expect(refusal({ work: {} })).toThrow(`${at}: names at least one of lifecycle, assignable, work_surface, deadline, document`);
    expect(refusal({ work: { lifecycle, colour: 1 } })).toThrow(`${at}/colour: a member the builder has no rule for`);
    expect(refusal({ work: { assignable: {} } })).toThrow(`${at}/assignable: needs work.lifecycle`);
    expect(refusal({ work: { lifecycle, work_surface: {} } })).toThrow(`${at}/work_surface: needs work.assignable`);
    expect(refusal({ work: { deadline: { clocks: [] } } })).toThrow(`${at}/deadline: needs work.lifecycle`);
    for (const page of ["items/{{ record_id }}", "/a/{{ record_id }}/{{ record_id }}", "/a/{{record_id}}"]) {
      expect(refusal({ work: { ...assignable, work_surface: {}, module_page: page } }), page)
        .toThrow(`${at}/module_page: a module path such as /items/{{ record_id }}`);
    }
    expect(refusal({ work: { lifecycle, assignable: {}, module_page: "/a/{{ record_id }}" } })).toThrow(`${at}/module_page: needs work.work_surface`);
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

  it("refuses a module page in a package without ui", () => {
    const page = task({ work: { ...assignable, work_surface: {}, module_page: "/t/{{ record_id }}" } });
    expect(() => checkModulePage(page, false, where)).toThrow(`${where}#/work/module_page: needs the package's ui`);
    expect(() => checkModulePage(page, true, where)).not.toThrow();
    expect(() => checkModulePage(task(), false, where)).not.toThrow();
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

// A sourced ERP package: purchase orders with lines, vendors, items and goods receipts that point at a
// purchase order line, every one read through the `erp` connection.
describe("an entity's source", () => {
  type Files = Record<string, any>;
  const erpParams = new Map([["erp", "connection_ref"], ["erp2", "connection_ref"], ["title_text", "text"]]);

  const erp = (): Files => ({
    purchase_order: {
      key: "purchase_order",
      fields: [
        { key: "po_number", type: "text" },
        { key: "ordered_on", type: "date" },
        { key: "total", type: "number" },
        { key: "status", type: "enum", enum_values: ["draft", "open", { value: "closed", label: "Closed" }] },
        { key: "vendor", type: "reference", target_entity_id: "${entity:vendor}" },
        { key: "calc", type: "formula", formula_expression: "1", formula_result_type: "number" },
        { key: "serial", type: "auto_number", auto_number_scope: "x", auto_number_format: "PO-{n}" },
      ],
      source: {
        connection: "${param:erp}",
        stream: "purchase_order",
        fields: {
          po_number: { from: "number" },
          ordered_on: { from: "order_date" },
          total: { from: "amount_total" },
          status: { from: "status", values: { pending_approval: "draft", other: "open" } },
          vendor: { ref: "${entity:vendor}", key: ["company_erp_id", "vendor_erp_id"] },
        },
        lines: {
          entity: "${entity:po_line}",
          from: "lines",
          key: ["erp_line_id"],
          parent: "purchase_order",
          fields: {
            item: { ref: "${entity:item}", key: ["^company_erp_id", "item_erp_id"] },
            qty: { from: "qty_ordered" },
            taxes: { from: "taxes", items: { rate: { from: "rate" }, code: { from: "code" } } },
          },
        },
        on_delete: "delete",
      },
    },
    po_line: {
      key: "po_line",
      fields: [
        { key: "purchase_order", type: "reference", target_entity_id: "${entity:purchase_order}", required: true },
        { key: "item", type: "reference", target_entity_id: "${entity:item}" },
        { key: "qty", type: "number" },
        { key: "taxes", type: "list", item_fields: [
          { key: "rate", label: "Rate", type: "number" },
          { key: "code", label: "Code", type: "enum", enum_values: [{ value: "vat" }, { value: "none" }] },
        ] },
      ],
    },
    vendor: {
      key: "vendor",
      fields: [{ key: "name", type: "text" }],
      source: { connection: "${param:erp}", stream: "vendor", fields: { name: { from: "name" } }, on_delete: "delete" },
    },
    item: {
      key: "item",
      fields: [{ key: "name", type: "text" }],
      source: { connection: "${param:erp}", stream: "item", fields: { name: { from: "name" } }, on_delete: "delete" },
    },
    receipt: {
      key: "receipt",
      fields: [
        { key: "po_line", type: "reference", target_entity_id: "${entity:po_line}" },
        { key: "voided", type: "boolean" },
        { key: "note", type: "text" },
      ],
      source: {
        connection: "${param:erp}",
        stream: "goods_receipt",
        fields: { po_line: { ref: "${entity:po_line}", key: ["company_erp_id", "po_erp_id"], line: ["line_erp_id"] } },
        on_delete: { flag: "voided" },
      },
    },
  });

  const field = (files: Files, entity: string, key: string): any => files[entity].fields.find((f: any) => f.key === key);
  const run = (files: Files, only?: string, packages: ReadonlySet<string> = new Set()) => {
    const entities = new Map<string, EntitySource>(Object.entries(files));
    const out: Record<string, ReturnType<typeof entityInvariants>> = {};
    for (const [key, file] of entities) {
      if (only === undefined || only === key) out[key] = entityInvariants(file, erpParams, entities, `entities/${key}.json`, new Map(), packages);
    }
    return out;
  };
  // Where the first refusal lands, as `file#pointer`, or "accepted".
  const refusedAt = (files: Files, packages: ReadonlySet<string> = new Set()): string => {
    try {
      run(files, undefined, packages);
    } catch (error) {
      const message = (error as Error).message;
      return message.slice(0, message.indexOf(": "));
    }
    return "accepted";
  };

  it("passes a source with lines and references through, translating the parameter and the entities", () => {
    const out = run(erp());
    expect(out.purchase_order!.source).toEqual({
      connection: "@param:erp",
      stream: "purchase_order",
      fields: {
        po_number: { from: "number" },
        ordered_on: { from: "order_date" },
        total: { from: "amount_total" },
        status: { from: "status", values: { pending_approval: "draft", other: "open" } },
        vendor: { ref: "@obj:entity:vendor", key: ["company_erp_id", "vendor_erp_id"] },
      },
      lines: {
        entity: "@obj:entity:po_line",
        from: "lines",
        key: ["erp_line_id"],
        parent: "purchase_order",
        fields: {
          item: { ref: "@obj:entity:item", key: ["^company_erp_id", "item_erp_id"] },
          qty: { from: "qty_ordered" },
          taxes: { from: "taxes", items: { rate: { from: "rate" }, code: { from: "code" } } },
        },
      },
      on_delete: "delete",
    });
    expect(out.receipt!.source).toMatchObject({ on_delete: { flag: "voided" }, fields: { po_line: { line: ["line_erp_id"] } } });
    expect(out.po_line).toEqual({});
  });

  it("accepts what verification accepts", () => {
    const accepted: [string, (files: Files) => void][] = [
      ["comments beside a source", (f) => { f.vendor.comments = { enabled: true }; }],
      ["an empty key part", (f) => { f.purchase_order.source.fields.vendor.key = ["", "vendor_erp_id"]; }],
      ["a source with no lines", (f) => {
        delete f.purchase_order.source.lines;
        f.receipt.source.fields = {};
      }],
      ["empty rules, which declare nothing, on an entity a source fills", (f) => { f.vendor.rules = []; }],
      ["the stream read through two connections", (f) => {
        f.vendor_copy = { ...f.vendor, key: "vendor_copy", source: { ...f.vendor.source, connection: "${param:erp2}" } };
      }],
      ["an enum value that is an option, bare or labelled", (f) => {
        f.purchase_order.source.fields.status.values = { a: "draft", b: "closed" };
      }],
    ];
    for (const [name, mutate] of accepted) {
      const files = erp();
      mutate(files);
      expect(refusedAt(files), name).toBe("accepted");
    }
  });

  const DEP_VENDOR = "${dep:rfx/erp-core#entity:vendor}";
  const DEP_LINE = "${dep:rfx/erp-core#entity:purchase_order_line}";
  const dependsOnVendor = (f: Files): void => {
    f.purchase_order.source.fields.vendor.ref = DEP_VENDOR;
    field(f, "purchase_order", "vendor").target_entity_id = DEP_VENDOR;
  };
  const required = new Set(["rfx/erp-core"]);

  it("takes a required package's entity on trust, as a ref and as the lines entity", () => {
    const files = erp();
    dependsOnVendor(files);
    expect(refusedAt(files, required)).toBe("accepted");
    expect(run(files, "purchase_order", required).purchase_order!.source).toMatchObject({
      fields: { vendor: { ref: "@dep:rfx/erp-core#entity:vendor" } },
    });
    const lines = erp();
    lines.purchase_order.source.lines.entity = DEP_LINE;
    lines.receipt.source.fields = {};
    lines.purchase_order.source.lines.parent = "nope";
    lines.purchase_order.source.lines.fields = { whatever: { from: "x" }, item: { ref: DEP_VENDOR, key: ["^company_erp_id", "i"] } };
    expect(refusedAt(lines, required)).toBe("accepted");
    lines.purchase_order.source.lines.from = "^lines";
    expect(refusedAt(lines, required)).toBe("entities/purchase_order.json#/source/lines/from");
  });
  it("refuses a dependency reference the field does not name, and one to another package", () => {
    const files = erp();
    dependsOnVendor(files);
    field(files, "purchase_order", "vendor").target_entity_id = "${entity:vendor}";
    expect(refusedAt(files, required)).toBe("entities/purchase_order.json#/source/fields/vendor/ref");
    dependsOnVendor(files);
    expect(refusedAt(files, new Set(["acme/other"]))).toBe("entities/purchase_order.json#/source/fields/vendor/ref");
  });

  type Case = [name: string, mutate: (files: Files) => void, entity: string, pointer: string];
  const verification: Case[] = [
    ["a: an undeclared parameter", (f) => { f.purchase_order.source.connection = "${param:nope}"; }, "purchase_order", "/source/connection"],
    ["a: a parameter that is no connection", (f) => { f.purchase_order.source.connection = "${param:title_text}"; }, "purchase_order", "/source/connection"],
    ["b: a ref to an entity the package lacks", (f) => { f.purchase_order.source.fields.vendor.ref = "${entity:ghost}"; }, "purchase_order", "/source/fields/vendor/ref"],
    ["b: a ref to a package's entity that the package does not require", (f) => { dependsOnVendor(f); }, "purchase_order", "/source/fields/vendor/ref"],
    ["b: a lines entity of a package the package does not require", (f) => { f.purchase_order.source.lines.entity = DEP_LINE; }, "purchase_order", "/source/lines/entity"],
    ["b: a lines entity the package lacks", (f) => { f.purchase_order.source.lines.entity = "${entity:ghost}"; }, "purchase_order", "/source/lines/entity"],
    ["b: a lines ref to an entity the package lacks", (f) => { f.purchase_order.source.lines.fields.item.ref = "${entity:ghost}"; }, "purchase_order", "/source/lines/fields/item/ref"],
    ["c: a mapped field the entity lacks", (f) => { f.purchase_order.source.fields.nope = { from: "x" }; }, "purchase_order", "/source/fields/nope"],
    ["c: a mapped line field the lines entity lacks", (f) => { f.purchase_order.source.lines.fields.nope = { from: "x" }; }, "purchase_order", "/source/lines/fields/nope"],
    ["c: a parent the lines entity lacks", (f) => { f.purchase_order.source.lines.parent = "nope"; }, "purchase_order", "/source/lines/parent"],
    ["c: a parent that points at another entity", (f) => { field(f, "po_line", "purchase_order").target_entity_id = "${entity:vendor}"; }, "purchase_order", "/source/lines/parent"],
    ["d: a copy into a reference", (f) => { f.purchase_order.source.fields.vendor = { from: "x" }; }, "purchase_order", "/source/fields/vendor/from"],
    ["d: a copy into a formula", (f) => { f.purchase_order.source.fields.calc = { from: "x" }; }, "purchase_order", "/source/fields/calc/from"],
    ["d: a copy into an auto number", (f) => { f.purchase_order.source.fields.serial = { from: "x" }; }, "purchase_order", "/source/fields/serial/from"],
    ["d: a copy into a list", (f) => { f.purchase_order.source.lines.fields.taxes = { from: "taxes" }; }, "purchase_order", "/source/lines/fields/taxes/from"],
    ["d: a ref into a text field", (f) => { f.purchase_order.source.fields.po_number = { ref: "${entity:vendor}", key: ["a"] }; }, "purchase_order", "/source/fields/po_number/ref"],
    ["d: a ref into a reference to another entity", (f) => { field(f, "purchase_order", "vendor").target_entity_id = "${entity:item}"; }, "purchase_order", "/source/fields/vendor/ref"],
    ["d: items into a field that is no list", (f) => {
      f.purchase_order.source.fields.total = { from: "x", items: { a: { from: "b" } } };
    }, "purchase_order", "/source/fields/total/items"],
    ["d: an item the list lacks", (f) => { f.purchase_order.source.lines.fields.taxes.items.nope = { from: "x" }; }, "purchase_order", "/source/lines/fields/taxes/items/nope"],
    ["d: a parent path on a record's own field key", (f) => {
      f.purchase_order.source.fields.vendor.key = ["^company_erp_id", "vendor_erp_id"];
    }, "purchase_order", "/source/fields/vendor/key"],
    ["d: a parent path on a record's own line key", (f) => { f.receipt.source.fields.po_line.line = ["^line_erp_id"]; }, "receipt", "/source/fields/po_line/line"],
    ["d: a parent path on a record's own copy", (f) => { f.purchase_order.source.fields.po_number.from = "^number"; }, "purchase_order", "/source/fields/po_number/from"],
    ["d: a parent path on the list of lines", (f) => { f.purchase_order.source.lines.from = "^lines"; }, "purchase_order", "/source/lines/from"],
    ["d: a parent path on a list item", (f) => {
      f.purchase_order.source.lines.fields.taxes.items.rate.from = "^rate";
    }, "purchase_order", "/source/lines/fields/taxes/items/rate/from"],
    ["e: a value that is no option", (f) => { f.purchase_order.source.fields.status.values = { draft: "nonexistent" }; }, "purchase_order", "/source/fields/status/values/draft"],
    ["e: an item value that is no option", (f) => {
      f.purchase_order.source.lines.fields.taxes.items.code = { from: "code", values: { V: "vat/inclusive" } };
    }, "purchase_order", "/source/lines/fields/taxes/items/code/values/V"],
    ["e: values into a field that is no enum", (f) => { f.purchase_order.source.fields.po_number = { from: "n", values: { a: "b" } }; }, "purchase_order", "/source/fields/po_number/values"],
    ["f: rules on the entity", (f) => {
      f.purchase_order.rules = [{ key: "r", message: "m", condition: { join: "and", leaves: [{ kind: "write", write: { op: "is_new" } }] } }];
    }, "purchase_order", "/rules"],
    ["f: a stage model on the lines entity", (f) => { f.po_line.stage_model = { status_field: "qty", transitions: [] }; }, "po_line", "/stage_model"],
    ["f: work on the entity", (f) => { f.vendor.work = { lifecycle: { status_field: "name", categories: {} } }; }, "vendor", "/work"],
    ["f: a create form on the entity", (f) => { f.purchase_order.create_form = { name: "PO", schema: {} }; }, "purchase_order", "/create_form"],
    ["g: a required reference the source writes", (f) => { field(f, "purchase_order", "vendor").required = true; }, "purchase_order", "/source/fields/vendor"],
    ["h: two entities on one connection and stream", (f) => { f.vendor.source.stream = "purchase_order"; }, "vendor", "/source/stream"],
    ["i: a flag on a field that is no boolean", (f) => { f.receipt.source.on_delete = { flag: "note" }; }, "receipt", "/source/on_delete/flag"],
    ["i: a flag on a field the entity lacks", (f) => { f.receipt.source.on_delete = { flag: "nope" }; }, "receipt", "/source/on_delete/flag"],
    ["j: a ref target on another connection", (f) => { f.vendor.source.connection = "${param:erp2}"; }, "purchase_order", "/source/fields/vendor/ref"],
    ["j: a ref target with no source", (f) => { delete f.vendor.source; }, "purchase_order", "/source/fields/vendor/ref"],
    ["j: a lines ref target with no source", (f) => { delete f.item.source; }, "purchase_order", "/source/lines/fields/item/ref"],
    ["k: a lines entity that has a source of its own", (f) => {
      f.po_line.source = { connection: "${param:erp}", stream: "po_line", fields: { qty: { from: "q" } }, on_delete: "delete" };
    }, "purchase_order", "/source/lines/entity"],
    ["l: a lines entity that another source already fills", (f) => {
      f.vendor.source.lines = { entity: "${entity:po_line}", from: "lines", key: ["k"], parent: "purchase_order", fields: {} };
    }, "vendor", "/source/lines/entity"],
    ["m: a lines entity that is the entity itself", (f) => { f.purchase_order.source.lines.entity = "${entity:purchase_order}"; }, "purchase_order", "/source/lines/entity"],
  ];

  it.each(verification)("refuses, as verification does: %s", (_name, mutate, entity, pointer) => {
    const files = erp();
    mutate(files);
    expect(refusedAt(files)).toBe(`entities/${entity}.json#${pointer}`);
  });

  const shape: Case[] = [
    ["an unknown member", (f) => { f.vendor.source.extra = 1; }, "vendor", "/source/extra"],
    ["a connection that is no parameter token", (f) => { f.vendor.source.connection = "erp"; }, "vendor", "/source/connection"],
    ["a stream with a capital", (f) => { f.vendor.source.stream = "Vendor"; }, "vendor", "/source/stream"],
    ["an on_delete that archives", (f) => { f.vendor.source.on_delete = "archive"; }, "vendor", "/source/on_delete"],
    ["a flag with something beside it", (f) => { f.vendor.source.on_delete = { flag: "voided", extra: true }; }, "vendor", "/source/on_delete/extra"],
    ["a field key with a capital", (f) => { f.vendor.source.fields = { Name: { from: "a" } }; }, "vendor", "/source/fields/Name"],
    ["a path with a capital", (f) => { f.vendor.source.fields.name = { from: "Name" }; }, "vendor", "/source/fields/name/from"],
    ["a path with an empty segment", (f) => { f.vendor.source.fields.name = { from: "a..b" }; }, "vendor", "/source/fields/name/from"],
    ["a path that is only a caret", (f) => { f.vendor.source.fields.name = { from: "^" }; }, "vendor", "/source/fields/name/from"],
    ["a mapping that copies and refers", (f) => {
      f.vendor.source.fields.name = { from: "a", ref: "${entity:item}", key: ["a"] };
    }, "vendor", "/source/fields/name/from"],
    ["items with no list to read", (f) => { f.vendor.source.fields.name = { items: { a: { from: "b" } } }; }, "vendor", "/source/fields/name"],
    ["items that nest items", (f) => {
      f.vendor.source.fields.name = { from: "a", items: { a: { from: "b", items: {} } } };
    }, "vendor", "/source/fields/name/items/a/items"],
    ["items that name nothing", (f) => { f.vendor.source.fields.name = { from: "a", items: {} }; }, "vendor", "/source/fields/name/items"],
    ["a value that is no string", (f) => { f.vendor.source.fields.name = { from: "a", values: { a: 1 } }; }, "vendor", "/source/fields/name/values/a"],
    ["a ref to something that is no entity", (f) => { f.vendor.source.fields.name = { ref: "${workflow:item}", key: ["a"] }; }, "vendor", "/source/fields/name/ref"],
    ["a ref with no key", (f) => { f.vendor.source.fields.name = { ref: "${entity:item}", key: [] }; }, "vendor", "/source/fields/name/key"],
    ["a key part that is only a caret", (f) => { f.vendor.source.fields.name = { ref: "${entity:item}", key: ["^"] }; }, "vendor", "/source/fields/name/key/0"],
    ["a source with no stream", (f) => { delete f.vendor.source.stream; }, "vendor", "/source"],
    ["a source with no on_delete", (f) => { delete f.vendor.source.on_delete; }, "vendor", "/source"],
    ["a source with no fields", (f) => { delete f.vendor.source.fields; }, "vendor", "/source"],
    ["a source with no connection", (f) => { delete f.vendor.source.connection; }, "vendor", "/source"],
    ["lines with no parent", (f) => { delete f.purchase_order.source.lines.parent; }, "purchase_order", "/source/lines"],
    ["lines with an empty key", (f) => { f.purchase_order.source.lines.key = []; }, "purchase_order", "/source/lines/key"],
  ];

  it.each(shape)("refuses a shape the package schema refuses: %s", (_name, mutate, entity, pointer) => {
    const files = erp();
    mutate(files);
    expect(refusedAt(files)).toBe(`entities/${entity}.json#${pointer}`);
  });

  it("a connection parameter's category must be one a source reads through", () => {
    const refusal = (category: string | undefined) => {
      const entities = new Map<string, EntitySource>(Object.entries(erp()));
      return () =>
        entityInvariants(entities.get("vendor")!, erpParams, entities, "entities/vendor.json", new Map([["erp", category]]));
    };
    for (const category of ["erp", "crm", undefined]) expect(refusal(category)).not.toThrow();
    expect(refusal("email")).toThrow(
      "entities/vendor.json#/source/connection: erp is an email connection, which a source cannot read through (crm or erp)",
    );
  });

  it("names what it refused", () => {
    const files = erp();
    files.purchase_order.source.fields.nope = { from: "x" };
    expect(() => run(files)).toThrow("entities/purchase_order.json#/source/fields/nope: nope is not a field of purchase_order");
    const lines = erp();
    lines.po_line.rules = [{ key: "r" }];
    expect(() => run(lines)).toThrow("entities/po_line.json#/rules: ");
  });
});

describe("a field the app queries", () => {
  const withField = (field: object) => () =>
    entityInvariants({ ...task(), fields: [...task().fields, { key: "stage", type: "text", ...field }] }, params, entities, where);

  it("is accepted on its own and with a recommendedSecured that is false", () => {
    expect(withField({ queriedByApp: true })).not.toThrow();
    expect(withField({ queriedByApp: true, recommendedSecured: false })).not.toThrow();
    expect(withField({ queriedByApp: false, recommendedSecured: true })).not.toThrow();
  });

  it("is refused with recommendedSecured, at the member that says the app queries it", () => {
    expect(withField({ queriedByApp: true, recommendedSecured: true })).toThrow(
      "entities/task.json#/fields/7/queriedByApp: a field the app filters or sorts on cannot also be recommended for securing",
    );
  });
});

// The fields a dependent package adds to an entity another package owns, each copied from a custom field of the
// record the target holds.
describe("an entity extension", () => {
  type Extension = Record<string, any>;
  const access: PackageAccess = new Map([["rfx/erp-core", new Set(["entity:vendor", "entity:item"])], ["acme/other", new Set<string>()]]);
  const where = "entity_extensions/vendor_risk.json";

  const extension = (): Extension => ({
    key: "vendor_risk",
    extends: "${dep:rfx/erp-core#entity:vendor}",
    fields: [
      {
        key: "risk_rating",
        type: "enum",
        label: "Risk rating",
        description: "How risky the vendor is",
        enum_values: [{ value: "low", label: "Low" }, "high"],
        recommendedSecured: true,
      },
    ],
    source: { fields: { risk_rating: { from: "custom.risk_rating", values: { L: "low", H: "high" } } } },
  });
  const build = (body: Extension, stem = "vendor_risk", packages: PackageAccess = access) => extensionBody(body, stem, where, packages);
  // Where the first refusal lands, as `file#pointer`, or "accepted".
  const refusedAt = (mutate: (body: Extension) => void): string => {
    const body = extension();
    mutate(body);
    try {
      build(body);
    } catch (error) {
      const message = (error as Error).message;
      return message.slice(0, message.indexOf(": "));
    }
    return "accepted";
  };

  it("is written as the package form, with the target as a dependency sentinel", () => {
    expect(build(extension())).toEqual({
      key: "vendor_risk",
      extends: "@dep:rfx/erp-core#entity:vendor",
      fields: [
        {
          key: "risk_rating",
          type: "enum",
          label: "Risk rating",
          description: "How risky the vendor is",
          enum_values: [{ value: "low", label: "Low" }, "high"],
          recommendedSecured: true,
        },
      ],
      source: { fields: { risk_rating: { from: "custom.risk_rating", values: { L: "low", H: "high" } } } },
    });
  });

  it("accepts what verification accepts", () => {
    const accepted: [string, (body: Extension) => void][] = [
      ["a field with no label, no description and no flag", (b) => { b.fields[0] = { key: "risk_rating", type: "enum", enum_values: ["low", "high"] }; }],
      ["an enum copied with no values", (b) => { delete b.source.fields.risk_rating.values; }],
      ["a target of another of the package's dependencies", (b) => { b.extends = "${dep:rfx/erp-core#entity:item}"; }],
      ...["text", "number", "boolean", "date", "datetime"].map((type): [string, (body: Extension) => void] => [
        `a ${type} field`,
        (b) => { b.fields[0] = { key: "risk_rating", type, description: "d" }; b.source.fields.risk_rating = { from: "custom.risk_rating" }; },
      ]),
      ["two fields, each mapped", (b) => {
        b.fields.push({ key: "tier", type: "text" });
        b.source.fields.tier = { from: "custom.vendor_tier" };
      }],
      ["a custom key of one letter or forty characters", (b) => {
        b.source.fields.risk_rating.from = `custom.${"a".repeat(40)}`;
      }],
    ];
    for (const [name, mutate] of accepted) expect(refusedAt(mutate), name).toBe("accepted");
  });

  type Case = [name: string, mutate: (body: Extension) => void, pointer: string];
  const sourceOf = (b: Extension): Extension => b.source.fields.risk_rating;
  const refusals: Case[] = [
    ["an extension member outside the four", (b) => { b.rules = []; }, "/rules"],
    ["a name for the extension", (b) => { b.name = "Vendor risk"; }, "/name"],
    ["a key that is no key", (b) => { b.key = "Vendor__Risk"; }, "/key"],
    ["no source", (b) => { delete b.source; }, "/source"],
    ["no target", (b) => { delete b.extends; }, "/extends"],
    ["no fields member", (b) => { delete b.fields; }, "/fields"],
    ["a target that is no dependency reference", (b) => { b.extends = "vendor"; }, "/extends"],
    ["a target in the package itself", (b) => { b.extends = "${entity:vendor}"; }, "/extends"],
    ["a target that is no entity", (b) => { b.extends = "${dep:rfx/erp-core#workflow:vendor}"; }, "/extends"],
    ["a target key that holds a double underscore", (b) => { b.extends = "${dep:rfx/erp-core#entity:vendor__x}"; }, "/extends"],
    ["a target of a package the manifest does not require", (b) => { b.extends = "${dep:rfx/missing#entity:vendor}"; }, "/extends"],
    ["a target of a required package with no access entry for it", (b) => { b.extends = "${dep:rfx/erp-core#entity:purchase_order}"; }, "/extends"],
    ["a target of a package that declares no access at all", (b) => { b.extends = "${dep:acme/other#entity:vendor}"; }, "/extends"],
    ["no field", (b) => { b.fields = []; }, "/fields"],
    ["fields that are no list", (b) => { b.fields = {}; }, "/fields"],
    ["a field that is no object", (b) => { b.fields[0] = "risk_rating"; }, "/fields/0"],
    ["a field with a member it lacks", (b) => { b.fields[0].searchable = true; }, "/fields/0/searchable"],
    ["a required field", (b) => { b.fields[0].required = true; }, "/fields/0/required"],
    ["a formula", (b) => { b.fields[0].formula_expression = "1"; }, "/fields/0/formula_expression"],
    ["a default", (b) => { b.fields[0].default = "low"; }, "/fields/0/default"],
    ["a field with no key", (b) => { delete b.fields[0].key; }, "/fields/0/key"],
    ["a field key that holds a double underscore", (b) => { b.fields[0].key = "risk__rating"; }, "/fields/0/key"],
    ["a field key with a capital", (b) => { b.fields[0].key = "Risk"; }, "/fields/0/key"],
    ["a key two fields share", (b) => { b.fields.push({ ...b.fields[0] }); }, "/fields/1/key"],
    ["a field with no type", (b) => { delete b.fields[0].type; }, "/fields/0/type"],
    ["a list field", (b) => { b.fields[0].type = "list"; }, "/fields/0/type"],
    ["a reference field", (b) => { b.fields[0].type = "reference"; }, "/fields/0/type"],
    ["a formula field", (b) => { b.fields[0].type = "formula"; }, "/fields/0/type"],
    ["an enum with no options", (b) => { delete b.fields[0].enum_values; }, "/fields/0/enum_values"],
    ["an enum with an empty list of options", (b) => { b.fields[0].enum_values = []; }, "/fields/0/enum_values"],
    ["options that are no list", (b) => { b.fields[0].enum_values = "low"; }, "/fields/0/enum_values"],
    ["options on a field that is no enum", (b) => { b.fields[0].type = "text"; }, "/fields/0/enum_values"],
    ["an empty list of options on a field that is no enum", (b) => { b.fields[0] = { key: "risk_rating", type: "text", enum_values: [] }; }, "/fields/0/enum_values"],
    ["an option that is neither a string nor an object", (b) => { b.fields[0].enum_values.push(1); }, "/fields/0/enum_values/2"],
    ["an option with a member it lacks", (b) => { b.fields[0].enum_values[0].weight = 1; }, "/fields/0/enum_values/0/weight"],
    ["an option with no value", (b) => { b.fields[0].enum_values[0] = { label: "Low" }; }, "/fields/0/enum_values/0/value"],
    ["a label that is null", (b) => { b.fields[0].label = null; }, "/fields/0/label"],
    ["a label that is no string", (b) => { b.fields[0].label = []; }, "/fields/0/label"],
    ["a description that is null", (b) => { b.fields[0].description = null; }, "/fields/0/description"],
    ["a flag that is no boolean", (b) => { b.fields[0].recommendedSecured = "yes"; }, "/fields/0/recommendedSecured"],
    ["a field with no mapping", (b) => { b.fields.push({ key: "tier", type: "text" }); }, "/fields/1"],
    ["a source with a member beside fields", (b) => { b.source.connection = "${param:erp}"; }, "/source/connection"],
    ["a source that names a stream", (b) => { b.source.stream = "vendor"; }, "/source/stream"],
    ["a source with no mappings", (b) => { b.source = {}; }, "/source/fields"],
    ["a source with an empty list of mappings", (b) => { b.source.fields = {}; }, "/source/fields"],
    ["a mapping naming no field", (b) => { b.source.fields.other = { from: "custom.other" }; }, "/source/fields/other"],
    ["a mapping that is no object", (b) => { b.source.fields.risk_rating = "custom.risk_rating"; }, "/source/fields/risk_rating"],
    ["a mapping with no path", (b) => { delete sourceOf(b).from; }, "/source/fields/risk_rating"],
    ["a canonical path", (b) => { sourceOf(b).from = "name"; }, "/source/fields/risk_rating/from"],
    ["a path that reads the parent", (b) => { sourceOf(b).from = "^custom.risk_rating"; }, "/source/fields/risk_rating/from"],
    ["a path below the custom key", (b) => { sourceOf(b).from = "custom.a.b"; }, "/source/fields/risk_rating/from"],
    ["a custom key with a capital", (b) => { sourceOf(b).from = "custom.Bad"; }, "/source/fields/risk_rating/from"],
    ["a custom key that holds a double underscore", (b) => { sourceOf(b).from = "custom.a__b"; }, "/source/fields/risk_rating/from"],
    ["a custom key of forty-one characters", (b) => { sourceOf(b).from = `custom.${"a".repeat(41)}`; }, "/source/fields/risk_rating/from"],
    ["a path that is no string", (b) => { sourceOf(b).from = 1; }, "/source/fields/risk_rating/from"],
    ["a reference mapping", (b) => { b.source.fields.risk_rating = { ref: "${dep:rfx/erp-core#entity:vendor}", key: ["x"] }; }, "/source/fields/risk_rating"],
    ["a list mapping", (b) => { b.source.fields.risk_rating = { from: "custom.x", items: { a: { from: "a" } } }; }, "/source/fields/risk_rating"],
    ["a mapping member a copy lacks", (b) => { sourceOf(b).key = ["x"]; }, "/source/fields/risk_rating/key"],
    ["values that are no object", (b) => { sourceOf(b).values = "low"; }, "/source/fields/risk_rating/values"],
    ["a value that is no string", (b) => { sourceOf(b).values.M = 1; }, "/source/fields/risk_rating/values/M"],
    ["a value that lands on no option", (b) => { sourceOf(b).values.M = "medium"; }, "/source/fields/risk_rating/values/M"],
    ["values into a field that is no enum", (b) => { b.fields[0] = { key: "risk_rating", type: "text" }; }, "/source/fields/risk_rating/values"],
  ];
  it.each(refusals)("refuses %s", (_name, mutate, pointer) => {
    expect(refusedAt(mutate)).toBe(`${where}#${pointer}`);
  });

  it("is filed under the key it names", () => {
    expect(() => build(extension(), "other")).toThrow(`${where}#/key: is vendor_risk, not other`);
  });

  it("names what it refused", () => {
    expect(() => build({ ...extension(), extends: "${dep:rfx/missing#entity:vendor}" })).toThrow(
      "rfx/missing is not in the manifest's requires.packages",
    );
    expect(() => build({ ...extension(), extends: "${dep:rfx/erp-core#entity:purchase_order}" })).toThrow(
      "declares no access to entity:purchase_order",
    );
    expect(() => build({ ...extension(), fields: [{ key: "risk_rating", type: "list" }] })).toThrow(
      `${where}#/fields/0/type: one of text, number, boolean, date, datetime, enum`,
    );
  });
});
