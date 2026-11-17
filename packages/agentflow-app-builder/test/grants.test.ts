import { describe, expect, it } from "vitest";
import { entityGrants } from "../src/entity.js";
import type { EntitySource } from "../src/invariants.js";
import { graph, restricted, servicePrincipal, startGrants, workflow } from "../src/workflow.js";

const USERS = "ffffffff-0000-0000-0000-000000000001";

const project: EntitySource = {
  key: "project",
  fields: [
    { key: "name", type: "text" },
    { key: "managers", type: "reference_list", target_entity_id: USERS },
  ],
};

const lifecycle = { status_field: "status", categories: { todo: "active", done: "done" } };

const task = (extra: object = {}): EntitySource => ({
  key: "task",
  fields: [
    { key: "project", type: "reference", target_entity_id: "${entity:project}" },
    { key: "title", type: "text" },
    { key: "status", type: "enum", enum_values: ["todo", "done"] },
    { key: "collaborators", type: "reference_list", target_entity_id: USERS },
  ],
  work: { lifecycle, assignable: { claim: "readers", rules: [] } },
  ...extra,
});

const fields = new Map([["project", project], ["task", task()]]);
const where = "entities/task.json";
const grantsOf = (grants: object[]) => entityGrants(task({ access: { mode: "restricted", grants } }), "task", where, fields);
const everyone = (operations: object[]) => ({ principal: { kind: "everyone" }, operations });
const group = (operations: object[]) => ({ principal: { kind: "group", id: "${param:staff_group_id}" }, operations });

describe("entityGrants", () => {
  it("emits one Everyone grant with record scopes per operation", () => {
    const parent = { kind: "parent_field", field: "project", parent_field: "managers" };
    const own = { kind: "field", field: "collaborators" };
    expect(grantsOf([everyone([{ operation: "read", record_scopes: [parent, own] }, { operation: "assign", record_scopes: [parent] }])])).toEqual([
      { key: "task_everyone", to: "everyone", entity: "@obj:entity:task", record_scopes: { read: [parent, own], assign: [parent] } },
    ]);
  });

  it("emits operations and record scopes together, and a group grant as before", () => {
    const own = { kind: "field", field: "collaborators" };
    expect(grantsOf([
      everyone([{ operation: "read", record_scopes: [own] }, { operation: "list", scope: "organization" }]),
      group([{ operation: "update", scope: "organization" }, { operation: "read", record_scopes: [{ kind: "work" }] }]),
    ])).toEqual([
      { key: "task_everyone", to: "everyone", entity: "@obj:entity:task", operations: { list: "organization" }, record_scopes: { read: [own] } },
      { key: "task_staff", to: "@param:staff_group_id", entity: "@obj:entity:task", operations: { update: "organization" }, record_scopes: { read: [{ kind: "work" }] } },
    ]);
  });

  it("emits a group grant carrying both operations and record scopes", () => {
    const own = { kind: "field", field: "collaborators" };
    expect(grantsOf([group([{ operation: "list", scope: "organization" }, { operation: "read", record_scopes: [own] }])])).toEqual([
      { key: "task_staff", to: "@param:staff_group_id", entity: "@obj:entity:task", operations: { list: "organization" }, record_scopes: { read: [own] } },
    ]);
  });

  it("refuses what verification refuses", () => {
    const g = (grants: object[]) => () => grantsOf(grants);
    expect(g([everyone([{ operation: "read", scope: "own" }]), everyone([{ operation: "list", scope: "own" }])]))
      .toThrow("entities/task.json#/access/grants/1: a second Everyone grant on task");
    expect(g([everyone([{ operation: "create", record_scopes: [{ kind: "field", field: "collaborators" }] }])]))
      .toThrow("on create only a parent_field scope");
    expect(g([everyone([{ operation: "create", record_scopes: [{ kind: "work" }] }])])).toThrow("on create only a parent_field scope");
    expect(g([everyone([{ operation: "read", record_scopes: [{ kind: "field", field: "title" }] }])]))
      .toThrow("title is not a people field of task");
    expect(g([everyone([{ operation: "read", record_scopes: [{ kind: "field", field: "assigned_users" }] }])]))
      .toThrow("assigned_users is a field the work seeds");
    expect(g([everyone([{ operation: "read", record_scopes: [{ kind: "parent_field", field: "project", parent_field: "name" }] }])]))
      .toThrow("name is not a people field of project");
    expect(g([everyone([{ operation: "read", record_scopes: [{ kind: "parent_field", field: "title", parent_field: "managers" }] }])]))
      .toThrow("title is not a single reference to an entity of the package");
    expect(g([everyone([{ operation: "read", record_scopes: [{ kind: "parent_field", field: "project", parent_field: "assigned_users" }] }])]))
      .toThrow("entities/task.json#/access/grants/0/operations/0/record_scopes/0/parent_field: assigned_users is not a people field of project");
    expect(g([everyone([])])).toThrow("entities/task.json#/access/grants/0/operations: an array of at least one operation");
    expect(g([{ principal: { kind: "everyone", id: "${param:g}" }, operations: [{ operation: "read", scope: "own" }] }]))
      .toThrow("an Everyone grant names no id");
    expect(g([everyone([{ operation: "read" }])])).toThrow("an operation needs a scope, record_scopes or both");
    expect(g([everyone([{ operation: "read", record_scopes: [] }])])).toThrow("at least one scope");
    expect(g([everyone([{ operation: "read", record_scopes: [{ kind: "team" }] }])])).toThrow("one of field, parent_field, work");
    expect(g([everyone([{ operation: "peek", scope: "own" }])])).toThrow("one of read, list, create, update, delete, assign");
    expect(g([{ principal: { kind: "service", id: "${param:runner}" }, operations: [{ operation: "read", scope: "own" }] }]))
      .toThrow("a package grants to a group or everyone only");
    expect(g([{ ...everyone([{ operation: "read", scope: "own" }]), design: true }])).toThrow("never carries design authority");
    expect(g([{ ...everyone([{ operation: "read", scope: "own" }]), design: false }])).not.toThrow();
    expect(g([group([{ operation: "read", record_scopes: [{ kind: "work" }] }])])).not.toThrow();
  });

  it("refuses a group grant whose parameter is not a declared group_ref", () => {
    const grants = [group([{ operation: "read", scope: "organization" }])];
    const file = task({ access: { mode: "restricted", grants } });
    const at = "entities/task.json#/access/grants/0/principal/id";
    expect(() => entityGrants(file, "task", where, fields, new Map([["staff_group_id", "group_ref"]]))).not.toThrow();
    expect(() => entityGrants(file, "task", where, fields, new Map([["staff_group_id", "user_ref"]]))).toThrow(`${at}: staff_group_id is not a group_ref parameter`);
    expect(() => entityGrants(file, "task", where, fields, new Map())).toThrow(`${at}: staff_group_id is not a group_ref parameter`);
    expect(() => entityGrants(task({ access: { mode: "restricted", grants: [everyone([{ operation: "read", scope: "own" }])] } }), "task", where, fields, new Map())).not.toThrow();
  });

  it("refuses a work scope on an entity without work.assignable", () => {
    const plain = task({ work: { lifecycle }, access: { mode: "restricted", grants: [everyone([{ operation: "read", record_scopes: [{ kind: "work" }] }])] } });
    expect(() => entityGrants(plain, "task", where, fields)).toThrow("a work scope needs work.assignable");
  });

  it("refuses a grant key AgentFlow would refuse, naming what the build formed it from", () => {
    const access = (grant: object) => task({ access: { mode: "restricted", grants: [grant] } });
    const read = [{ operation: "read", scope: "organization" }];
    const onEntity = (entity: string, grant: object) => () => entityGrants(access(grant), entity, where, fields);
    const groupOf = (parameter: string) => ({ principal: { kind: "group", id: `\${param:${parameter}}` }, operations: read });
    const starters = (key: string) => () =>
      startGrants(workflow(key, "W", "", servicePrincipal("p"), restricted("a", "b"), graph("W", [], [])));
    const cases: [string, () => unknown, string | null][] = [
      ["a group grant of 52", onEntity("purchase_requisition_line_item", groupOf("procurement_reviewers_group_id")),
        "entities/task.json#/access/grants/0: grant purchase_requisition_line_item_procurement_reviewers is 52 characters, " +
        "formed from entity purchase_requisition_line_item and parameter procurement_reviewers_group_id, and AgentFlow " +
        "takes a grant key of at most 40: shorten the entity key or the parameter key"],
      ["a group grant of exactly 40", onEntity("purchase_requisition_line_item", groupOf("reviewers_group_id")), null],
      ["an Everyone grant of 43", onEntity("purchase_requisition_line_item_one", everyone(read)),
        "grant purchase_requisition_line_item_one_everyone is 43 characters, formed from entity " +
        "purchase_requisition_line_item_one and everyone, and AgentFlow takes a grant key of at most 40: shorten the entity key"],
      ["a doubled underscore", onEntity("task_", groupOf("staff_group_id")),
        "grant task__staff, formed from entity task_ and parameter staff_group_id, is not a key AgentFlow takes"],
      ["a second start grant of 42", starters("approve_purchase_requisition_lines"),
        "workflow approve_purchase_requisition_lines#/start_access/group_ids/1: grant start_approve_purchase_requisition_lines_2 " +
        "is 42 characters, formed from workflow approve_purchase_requisition_lines, and AgentFlow takes a grant key of at most 40: " +
        "shorten the workflow key"],
      ["start grants of 40 and less", starters("approve_purchase_requisition_row"), null],
    ];
    for (const [label, run, refusal] of cases) {
      if (refusal === null) expect(run, label).not.toThrow();
      else expect(run, label).toThrow(refusal);
    }
  });
});
