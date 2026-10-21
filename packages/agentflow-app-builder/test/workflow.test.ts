import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { actionObject, merge, triggerObject } from "../src/index.js";
import {
  call, checkGraph, decision, edges, end, graph, node, otherwise, restricted, servicePrincipal, start, updateMany, when, workflow,
} from "../src/workflow.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");

const tiny = (key: string) =>
  workflow(
    key,
    "Tiny",
    "A one step workflow",
    servicePrincipal("automation_principal_id"),
    restricted("support_group_id"),
    graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"])),
  );

describe("helpers", () => {
  it("builds the principal, restriction and update_many shapes", () => {
    expect(servicePrincipal("p")).toEqual({ policy: "service_principal", service_principal_id: "${param:p}" });
    expect(restricted("a", "b")).toEqual({ mode: "restricted", group_ids: ["${param:a}", "${param:b}"] });
    expect(updateMany("u", "Bulk", "${entity:note}", [], [])).toEqual(
      node("u", "Bulk", "entity_record", { operation: "update_many", entityId: "${entity:note}", filters: [], body: [] }),
    );
  });
  it("refuses a decision whose edges the node does not own", () => {
    const g = graph(
      "Bad",
      [start(), decision("d", "D", [when("e2", { "==": [{ var: "x" }, 1] }), otherwise("e3")]), end("a", "A"), end("b", "B")],
      edges(["e1", "start", "d"], ["e2", "d", "a"]),
    );
    expect(() => checkGraph("bad", g)).toThrow("bad: d owns e2,e3 but has e2");
  });
});

describe("merge", () => {
  it("merges sections in publish order and checks each graph", () => {
    const sections = merge([{ workflows: { one: tiny("one") } }, { workflows: { two: tiny("two") } }], ["two", "one", "absent"]);
    expect(sections.order).toEqual(["two", "one"]);
  });
  it("refuses a workflow, trigger or action defined in two modules", () => {
    expect(() => merge([{ workflows: { one: tiny("one") } }, { workflows: { one: tiny("one") } }], ["one"])).toThrow("sections#/workflows/one: defined twice");
    const trigger = { workflow: "one", kind: "schedule", config: {} };
    expect(() => merge([{ triggers: { t: trigger } }, { triggers: { t: trigger } }], [])).toThrow("sections#/triggers/t: defined twice");
    const action = { entity: "note", action: { workflow_id: "${workflow:one}", key: "go" } };
    expect(() => merge([{ actions: { a: action } }, { actions: { a: action } }], [])).toThrow("sections#/actions/a: defined twice");
  });
  it("refuses a workflow missing from the order", () => {
    expect(() => merge([{ workflows: { one: tiny("one") } }], [])).toThrow("add one to ORDER");
  });
});

describe("workflows in a package", () => {
  it("emits the workflow, its start grant and an exposed-step check", () => {
    const sections = merge([{ workflows: { one: tiny("one") } }], ["one"]);
    const files = buildPackage({ configDir, sections });
    const manifest = JSON.parse(files["manifest.json"]!);
    expect(manifest.grants).toContainEqual({ key: "start_one", to: "@param:support_group_id", workflow: "@obj:workflow:one" });
    expect(JSON.parse(files["objects/workflow/one.json"]!).runAs).toBe("@param:automation_principal_id");
    expect(() => buildPackage({ configDir, sections, exposedSteps: { one: ["done"] } })).toThrow("exposed step done is not a human step");
  });
  it("writes a record picker in a start form as the key form, at every level", () => {
    const picker = (entity: string) => ({ type: "string", format: "entity", "x-entity": entity });
    const schema = {
      type: "object",
      properties: {
        note: picker("note"),
        who: picker("user"),
        nested: { type: "object", properties: { contact: picker("contact") } },
        many: { type: "array", items: picker("note") },
      },
    };
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"])), schema,
    );
    const files = buildPackage({ configDir, sections: merge([{ workflows: { one: w } }], ["one"]) });
    const written = JSON.parse(files["objects/workflow/one.json"]!).inputSchema.properties;
    expect(written.note["x-entity"]).toBe("@obj.key:entity:note");
    expect(written.who["x-entity"]).toBe("@req.key:entity:user");
    expect(written.nested.properties.contact["x-entity"]).toBe("@obj.key:entity:contact");
    expect(written.many.items["x-entity"]).toBe("@obj.key:entity:note");
  });
  it("refuses a start-form picker on an entity outside the package", () => {
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"])),
      { type: "object", properties: { x: { type: "string", format: "entity", "x-entity": "ghost" } } },
    );
    expect(() => buildPackage({ configDir, sections: merge([{ workflows: { one: w } }], ["one"]) })).toThrow(
      "x-entity names ghost, which is not an entity of the package",
    );
  });
  it("refuses a trigger on a workflow outside the package", () => {
    expect(() => triggerObject("t", { workflow: "x", kind: "schedule", config: {} }, new Set(["one"]))).toThrow(
      "trigger t#/workflow: x is not a workflow of the package",
    );
  });
  it("refuses an action on an entity outside the package", () => {
    const sections = merge(
      [{ workflows: { one: tiny("one") }, actions: { go: { entity: "ghost", action: { workflow_id: "${workflow:one}", key: "go" } } } }],
      ["one"],
    );
    expect(() => buildPackage({ configDir, sections })).toThrow("action go#/entity: ghost is not an entity of the package");
  });
  it("refuses an action without a string key", () => {
    for (const key of [undefined, 3, ""]) {
      expect(() => actionObject("go", { entity: "note", action: { workflow_id: "${workflow:one}", key } } as never, new Set(["one"]), ["note"]))
        .toThrow("action go#/action/key: a non-empty string");
    }
  });
  it("accepts a call step", () => {
    expect(call("c", "Call", "${workflow:one}", undefined, [["a", { kind: "literal", value: "x" }]]).parameters.workflowId).toBe("${workflow:one}");
  });
});
