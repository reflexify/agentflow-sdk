import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { entityObjects } from "../src/entity.js";
import { merge } from "../src/index.js";
import { fieldOf, nameableKeysOf, type EntitySource } from "../src/invariants.js";
import { bind, create, edges, end, graph, lit, node, restricted, servicePrincipal, start, update, updateMany, upsert, workflow } from "../src/workflow.js";

const entity = (extra: Record<string, unknown> = {}): EntitySource => ({
  key: "case",
  name: "Case",
  fields: [{ key: "title", type: "text", label: "Title" }],
  views: [],
  access: { mode: "everyone", grants: [] },
  ...extra,
});

const build = (extra: Record<string, unknown>) => {
  const sources = new Map([["case", entity(extra)]]);
  return entityObjects("unused", "case", ["case"], new Map([["court", "unit_ref"], ["staff", "group_ref"]]), sources);
};

const body = (extra: Record<string, unknown>) => build(extra).objects.find(([key]) => key === "entity:case")![1] as Record<string, unknown>;

const classified = { requires_unit_classification: true };
const view = (extra: Record<string, unknown>) => ({ views: [{ key: "all", name: "All", ...extra }] });
const grant = (scope: unknown) => ({
  access: { mode: "restricted", grants: [{ principal: { kind: "group", id: "${param:staff}" }, operations: [{ operation: "read", scope }] }] },
});
const form = (property: Record<string, unknown>) => ({
  create_form: { name: "New case", schema: { type: "object", properties: { where: { type: "string", format: "entity", "x-entity": "org_unit", ...property } } } },
});

describe("an entity classified by unit", () => {
  it("copies the member to the body as written", () => {
    expect(body(classified).requires_unit_classification).toBe(true);
    expect(body({ requires_unit_classification: false }).requires_unit_classification).toBe(false);
    expect("requires_unit_classification" in body({})).toBe(false);
  });

  it.each(["true", 1, null, {}])("refuses %j as the member", (value) => {
    expect(() => build({ requires_unit_classification: value })).toThrow(
      "entities/case.json#/requires_unit_classification: true or false",
    );
  });

  it("gives the entity a read-only reference field named unit, and only then", () => {
    expect(fieldOf(entity(classified), "unit")).toEqual({
      type: "reference",
      target_entity_id: "ffffffff-0000-0000-0000-000000000003",
      readOnly: true,
    });
    expect(fieldOf(entity(), "unit")).toBeUndefined();
    expect(fieldOf(entity({ requires_unit_classification: false }), "unit")).toBeUndefined();
    expect(nameableKeysOf(entity(classified)).has("unit")).toBe(true);
    expect(nameableKeysOf(entity()).has("unit")).toBe(false);
  });

  it.each([
    ["a view column", view({ columns: ["title", "unit"] })],
    ["a view filter", view({ filters: [{ field: "unit", op: "eq", value: "x" }] })],
    ["a preset filter", view({ config: { presets: [{ id: "p", label: "P", rules: [{ field: "unit", op: "is_empty" }] }] } })],
  ])("accepts %s on unit only with the member", (_name, extra) => {
    expect(() => build({ ...classified, ...extra })).not.toThrow();
    expect(() => build(extra)).toThrow("is not a field of case");
  });

  it("lets a rule and a stage move name unit, but never as the stage model's status", () => {
    const rule = { rules: [{ key: "r", message: "m", condition: { join: "and", leaves: [{ kind: "field", rule: { field: "unit", op: "is_not_empty", value: null } }] } }] };
    expect(() => build({ ...classified, ...rule })).not.toThrow();
    expect(() => build(rule)).toThrow("unit is not a field of case");
    const model = (status_field: string) => ({
      fields: [{ key: "status", type: "enum", enum_values: ["todo", "done"] }],
      stage_model: { status_field, transitions: [{ from: "todo", to: "done", required_fields: ["unit"] }] },
    });
    expect(() => build({ ...classified, ...model("status") })).not.toThrow();
    expect(() => build({ ...classified, ...model("unit") })).toThrow();
  });

  it("refuses an operator that does not suit a reference", () => {
    expect(() => build({ ...classified, ...view({ filters: [{ field: "unit", op: "contains", value: "x" }] }) })).toThrow(
      "contains does not suit unit of case, a field of type reference",
    );
  });

  it("refuses a create form that binds unit, as AgentFlow does at install", () => {
    const bound = form({ "x-entityField": "unit" });
    expect(() => build({ ...classified, ...bound })).toThrow(
      "entities/case.json#/create_form/schema/properties/where/x-entityField: the property where is bound to unit, which is read-only: `unit` is set by the platform from the creator's unit or the step's destinationUnit; a package never writes it",
    );
    expect(() => build(bound)).toThrow("is bound to unit, which is not a field of case");
  });

  it.each([
    ["placement", "placement"],
    ["placement_subtree", "placement_subtree"],
    ["an anchored unit", { scope: "unit", anchor: "${param:court}" }],
    ["an anchored subtree", { scope: "subtree", anchor: "${param:court}" }],
  ])("refuses a %s grant without the member", (_name, scope) => {
    expect(() => build(grant(scope))).toThrow(
      "entities/case.json#/access/grants/0/operations/0/scope: a grant scoped to a unit needs `requires_unit_classification: true` on the entity, and entity:case does not declare it",
    );
    const { grants } = build({ ...classified, ...grant(scope) });
    expect(grants).toEqual([
      expect.objectContaining({ operations: { read: typeof scope === "string" ? scope : { scope: scope.scope, anchor: "@param:court" } } }),
    ]);
  });

  it.each([
    ["a bare string", "court", "a package never names an organization's unit: anchor the scope at a ${param:key} of a unit_ref parameter"],
    ["a unit's id", "8f6a0dd6-0e2f-4b3f-9d0e-2c1b7a4e5f10", "a package never names an organization's unit"],
    ["no anchor", undefined, "a package never names an organization's unit"],
    ["a group_ref parameter", "${param:staff}", "staff is not a unit_ref parameter"],
    ["a parameter the manifest lacks", "${param:ghost}", "ghost is not a unit_ref parameter"],
  ])("refuses an anchored scope whose anchor is %s", (_name, anchor, message) => {
    for (const kind of ["unit", "subtree"]) {
      expect(() => build({ ...classified, ...grant({ scope: kind, anchor }) })).toThrow(
        `entities/case.json#/access/grants/0/operations/0/scope/anchor: ${message}`,
      );
    }
  });

  it("grants a scope that names no unit on an unclassified entity", () => {
    expect(() => build(grant("organization"))).not.toThrow();
    expect(() => build(grant("own"))).not.toThrow();
  });

  it("refuses starter records", () => {
    const seed = { seed: [{ title: "A" }] };
    expect(() => build({ ...classified, ...seed })).toThrow(
      "entities/case.json#/seed: starter records cannot be filed in a unit the package does not know",
    );
    expect(body(seed).seed).toEqual([{ title: "A" }]);
    expect(() => build({ requires_unit_classification: false, ...seed })).not.toThrow();
  });

  it("refuses a field of its own named unit, and allows one on an unclassified entity", () => {
    const own = { fields: [{ key: "title", type: "text" }, { key: "unit", type: "text" }] };
    expect(() => build({ ...classified, ...own })).toThrow(
      "entities/case.json#/fields/1/key: `unit` is the field the platform adds to an entity classified by unit; rename your field",
    );
    expect(() => build(own)).not.toThrow();
  });
});

describe("a record step on an entity classified by unit", () => {
  const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
  // The mini config with contact classified by unit, or with a field of its own keyed unit instead.
  const config = (classified: boolean): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-units-"));
    fs.cpSync(mini, dir, { recursive: true });
    const file = path.join(dir, "entities", "contact.json");
    const contact = JSON.parse(fs.readFileSync(file, "utf8"));
    if (classified) contact.requires_unit_classification = true;
    else contact.fields.push({ key: "unit", label: "Unit", type: "text" });
    fs.writeFileSync(file, JSON.stringify(contact));
    return dir;
  };
  const body = [bind("name", lit("x")), bind("unit", lit("x"))];
  const steps = [
    ["create", create("w", "Write", "${entity:contact}", body)],
    ["upsert", upsert("w", "Write", "${entity:contact}", "email", body)],
    ["update", update("w", "Write", "${entity:contact}", "subject.record_id", body)],
    ["updateMany", updateMany("w", "Write", "${entity:contact}", [], body)],
    ["a step in a loop", node("w", "Each", "for_each", {
      listSource: "input.items", itemAlias: "item", mode: "sequential",
      body: graph("Each", [start(), create("c", "Write", "${entity:contact}", body), end("done", "Done")], edges(["b1", "start", "c"], ["b2", "c", "done"])),
    })],
  ] as const;
  const build = (dir: string, step: { id: string; node_type: string }) => {
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), step, end("done", "Done")], edges(["e1", "start", step.id], ["e2", step.id, "done"])),
    );
    return () => buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
  };

  it.each(steps)("refuses %s binding unit, as AgentFlow does when it verifies the package", (name, step) => {
    const at = name === "a step in a loop" ? "/graph/nodes/1/parameters/body/nodes/1/parameters/body/1" : "/graph/nodes/1/parameters/body/1";
    expect(build(config(true), step)).toThrow(
      `workflow one#${at}: \`unit\` is set by the platform from the creator's unit or the step's destinationUnit; a package never writes it`,
    );
  });

  it.each(steps)("lets %s bind a field of its own keyed unit on an entity not classified by unit", (_name, step) => {
    expect(build(config(false), step)).not.toThrow();
  });
});
