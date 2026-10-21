import { describe, expect, it } from "vitest";
import { fieldBody } from "../src/entity.js";

const body = (f: Record<string, unknown>) => fieldBody("task", f, "entities/task.json", "/fields/0")[1] as Record<string, unknown>;

describe("field members", () => {
  it("carries a formula, a rollup and a list field", () => {
    expect(body({ key: "label_status", type: "formula", label: "Label status", formula_expression: "label.base_status", formula_result_type: "text" }))
      .toEqual({ type: "formula", label: "Label status", formula_expression: "label.base_status", formula_result_type: "text" });
    expect(body({ key: "open", type: "formula", label: "Open", formula_result_type: "number", rollup: { inverseKey: "tasks", agg: "count" } }).rollup)
      .toEqual({ inverseKey: "tasks", agg: "count" });
    const list = body({
      key: "checklist", type: "list", label: "Checklist", sortable: false,
      item_fields: [{ key: "text", label: "Text", type: "text", required: true }, { key: "done", label: "Done", type: "boolean", history: false }],
      format_options: { display: "checklist", done_field: "done" }, constraints: { max_items: 20 },
    });
    expect(list.item_fields).toHaveLength(2);
    expect(list.constraints).toEqual({ max_items: 20 });
  });
  it("carries format, on_target_delete and sortable", () => {
    expect(body({ key: "description", type: "text", format: "richtext", label: "Description" }).format).toBe("richtext");
    expect(body({ key: "section", type: "reference", label: "Section", target_entity_id: "${entity:section}", on_target_delete: "clear" }))
      .toMatchObject({ target_entity_id: "@obj:entity:section", on_target_delete: "clear" });
  });
  it("refuses an on_target_delete it does not know and an item column member", () => {
    expect(() => body({ key: "s", type: "reference", target_entity_id: "${entity:section}", on_target_delete: "nullify" }))
      .toThrow("entities/task.json#/fields/0/on_target_delete: one of restrict, clear, cascade");
    expect(() => body({ key: "c", type: "list", item_fields: [{ key: "t", label: "T", type: "text", colour: "red" }] }))
      .toThrow("entities/task.json#/fields/0/item_fields/0/colour: a member the builder has no rule for");
  });
  it("refuses a bad column type, a constraint and a rollup member it has no rule for", () => {
    expect(() => body({ key: "c", type: "list", item_fields: [{ key: "t", label: "T", type: "colour" }] }))
      .toThrow("entities/task.json#/fields/0/item_fields/0/type: one of text, number, boolean, date, enum");
    expect(() => body({ key: "c", type: "text", constraints: { max_size: 3 } }))
      .toThrow("entities/task.json#/fields/0/constraints/max_size: a member the builder has no rule for");
    expect(() => body({ key: "c", type: "formula", rollup: { inverseKey: "t", agg: "count", mode: "x" } }))
      .toThrow("entities/task.json#/fields/0/rollup/mode: a member the builder has no rule for");
  });
  it("refuses a field without a string key", () => {
    for (const key of [undefined, 3, ""]) {
      expect(() => body({ key, type: "text", label: "T" })).toThrow("entities/task.json#/fields/0/key: a non-empty string");
    }
  });
  it("refuses a sensitive field", () => {
    expect(() => body({ key: "t", type: "text", sensitive: true })).toThrow("not a member the package's entity_field lists");
  });
  it("refuses an item_fields, a constraints or a rollup of the wrong shape with a location", () => {
    for (const item_fields of [null, {}, "x"]) {
      expect(() => body({ key: "c", type: "list", item_fields })).toThrow("entities/task.json#/fields/0/item_fields: must be an array");
    }
    expect(() => body({ key: "c", type: "list", item_fields: [null] })).toThrow("entities/task.json#/fields/0/item_fields/0: must be an object");
    for (const value of [null, [], 3]) {
      expect(() => body({ key: "c", type: "text", constraints: value })).toThrow("entities/task.json#/fields/0/constraints: must be an object");
      expect(() => body({ key: "c", type: "formula", rollup: value })).toThrow("entities/task.json#/fields/0/rollup: must be an object");
    }
  });
});
