import { describe, expect, it } from "vitest";
import { entityObjects, fieldBody, xEntity } from "../src/entity.js";

const body = (f: Record<string, unknown>) => fieldBody("task", f, "entities/task.json", "/fields/0")[1] as Record<string, unknown>;

describe("field members", () => {
  it("refuses an option color the platform does not have", () => {
    const options = (color: unknown) => ({ key: "s", type: "enum", enum_values: ["plain", { value: "x", label: "X", color }] });
    for (const ok of ["emerald", "gray", "#1a2B3c"]) expect(() => body(options(ok)), ok).not.toThrow();
    for (const bad of ["slate", "green", "#fff", 3]) {
      expect(() => body(options(bad)), String(bad)).toThrow(
        "entities/task.json#/fields/0/enum_values/1/color: one of gray, sky, teal, amber, emerald, violet, indigo, rose, fuchsia, or #RRGGBB",
      );
    }
  });
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
  it("carries mentions on a text field and on a list text column", () => {
    expect(body({ key: "notes", type: "text", label: "Notes", format_options: { mentions: true } }).format_options)
      .toEqual({ mentions: true });
    const list = body({
      key: "checklist", type: "list", label: "Checklist",
      item_fields: [{ key: "text", label: "Text", type: "text", mentions: true }],
    });
    expect(list.item_fields).toEqual([{ key: "text", label: "Text", type: "text", mentions: true }]);
  });
  it("names the platform's Users, Groups and Units as required entities", () => {
    const target = (id: string) => body({ key: "who", type: "reference_list", target_entity_id: id }).target_entity_id;
    expect(target("ffffffff-0000-0000-0000-000000000001")).toBe("@req:entity:user");
    expect(target("ffffffff-0000-0000-0000-000000000002")).toBe("@req:entity:group");
    expect(target("ffffffff-0000-0000-0000-000000000003")).toBe("@req:entity:org_unit");
  });
  it("carries format, on_target_delete and sortable", () => {
    expect(body({ key: "description", type: "text", format: "richtext", label: "Description" }).format).toBe("richtext");
    expect(body({ key: "section", type: "reference", label: "Section", target_entity_id: "${entity:section}", on_target_delete: "clear" }))
      .toMatchObject({ target_entity_id: "@obj:entity:section", on_target_delete: "clear" });
  });
  it("refuses clear on a required field, which AgentFlow refuses at install", () => {
    const field = (extra: Record<string, unknown>) => ({ key: "parent", type: "reference", target_entity_id: "${entity:section}", on_target_delete: "clear", ...extra });
    expect(() => body(field({ required: true }))).toThrow(
      "entities/task.json#/fields/0/on_target_delete: clear on a required field would leave records that every write refuses",
    );
    for (const ok of [field({}), field({ required: false }), field({ required: true, on_target_delete: "restrict" })]) expect(() => body(ok)).not.toThrow();
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
  it("carries recommendedSecured, and refuses sensitive with the member that asks for it", () => {
    expect(body({ key: "price", type: "number", label: "Price", recommendedSecured: true }).recommendedSecured).toBe(true);
    expect(() => body({ key: "price", type: "number", recommendedSecured: "yes" }))
      .toThrow("entities/task.json#/fields/0/recommendedSecured: true or false");
    expect(() => body({ key: "t", type: "text", sensitive: true })).toThrow(
      "entities/task.json#/fields/0/sensitive: a package never secures a field, the organization does: write recommendedSecured: true",
    );
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

describe("a business key", () => {
  const source = (naturalKey: unknown, onTargetDelete?: string) => ({
    key: "request", name: "Request", access: { mode: "everyone", grants: [] }, views: [],
    fields: [
      { key: "number", type: "text", label: "Number" },
      { key: "queue", type: "reference", label: "Queue", target_entity_id: "${entity:request}", ...(onTargetDelete ? { on_target_delete: onTargetDelete } : {}) },
    ],
    natural_key: naturalKey,
  });
  const build = (file: Record<string, unknown>) => entityObjects("unused", "request", ["request"], new Map(), new Map([["request", file as never]]));
  const KEY = [{ id: "by_queue", name: "Number in its queue", fields: ["queue", "number"] }];

  it("refuses clear on a field it names, which AgentFlow refuses at install", () => {
    expect(() => build(source(KEY, "clear"))).toThrow(
      "entities/request.json#/natural_key/0/fields/0: queue is part of a business key and clears when its target is deleted",
    );
  });

  it("takes the same key over a field that restricts, cascades or says nothing, and clear on a field outside it", () => {
    for (const behaviour of [undefined, "restrict", "cascade"]) expect(() => build(source(KEY, behaviour)), String(behaviour)).not.toThrow();
    expect(() => build(source([{ id: "by_number", name: "Number", fields: ["number"] }], "clear"))).not.toThrow();
  });
});

describe("a create form", () => {
  const GROUPS = "ffffffff-0000-0000-0000-000000000002";
  const form = (properties: Record<string, unknown>) => ({
    key: "request",
    name: "Request",
    fields: [
      { key: "number", type: "text", label: "Number" },
      { key: "visible_to", type: "reference_list", label: "Visible to", target_entity_id: GROUPS, sortable: false },
      { key: "queue", type: "reference", label: "Queue", target_entity_id: "${entity:request}" },
    ],
    views: [],
    access: { mode: "everyone", grants: [] },
    create_form: { name: "Request", schema: { type: "object", properties } },
  });
  const build = (properties: Record<string, unknown>) => {
    const sources = new Map([["request", form(properties) as never]]);
    const { objects } = entityObjects("unused", "request", ["request"], new Map(), sources);
    return objects.find(([key]) => key === "form:request")![1] as { schema_json: { properties: Record<string, any> } };
  };

  it("writes a Groups picker as the key form, with the Users and Units pickers", () => {
    const written = build({
      visible_to: { type: "array", items: { type: "string", format: "entity" }, "x-entity": "group", "x-entityField": "visible_to" },
      queue: { type: "string", format: "entity", "x-entity": "request", "x-entityField": "queue" },
    });
    expect(written.schema_json.properties.visible_to["x-entity"]).toBe("@req.key:entity:group");
    expect(written.schema_json.properties.queue["x-entity"]).toBe("@obj.key:entity:request");
    for (const [key, entity] of [["user", "@req.key:entity:user"], ["org_unit", "@req.key:entity:org_unit"]] as const) {
      expect(xEntity([])(key, "w", "/p")).toBe(entity);
    }
  });

  it("names the forms an x-entity takes when it refuses another", () => {
    const refusal = () => xEntity(["request"])("groups", "entities/request.json", "/create_form/schema/properties/visible_to/x-entity");
    expect(refusal).toThrow(
      "entities/request.json#/create_form/schema/properties/visible_to/x-entity: x-entity names groups, which is not an entity of the package: " +
        "write the key of one of its entities, user, group or org_unit, or ${dep:<package id>#entity:<key>} for an entity of a package in requires.packages",
    );
  });

  it("refuses a property bound to a field the entity does not have, naming the property and the field", () => {
    expect(() => build({ number: { type: "string", "x-entityField": "nmber" } })).toThrow(
      "entities/request.json#/create_form/schema/properties/number/x-entityField: the property number is bound to nmber, " +
        "which is not a field of request (did you mean number?); AgentFlow refuses a form bound to a field the entity does not have when the package installs",
    );
    expect(() => build({ number: { type: "string", "x-entityField": 3 } })).toThrow(
      "properties/number/x-entityField: the property number is bound to something that is not a field key",
    );
    expect(() => build({ rows: { type: "array", items: { type: "object", properties: { x: { type: "string", "x-entityField": "ghost" } } } } })).toThrow(
      "properties/rows/items/properties/x/x-entityField: the property x is bound to ghost",
    );
  });

  it("takes the always-present name, and leaves a field the form does not bind alone", () => {
    expect(() => build({ name: { type: "string", "x-entityField": "name" } })).not.toThrow();
    expect(() => build({ number: { type: "string", "x-entityField": "number" } })).not.toThrow();
    expect(() => build({})).not.toThrow();
  });
});

describe("the name field every entity has", () => {
  const source = (extra: Record<string, unknown>) => ({
    key: "request", name: "Request", fields: [{ key: "number", type: "text", label: "Number" }], access: { mode: "everyone", grants: [] },
    views: [{ key: "all", name: "All", columns: ["name", "number"] }], ...extra,
  });
  const build = (file: Record<string, unknown>) => entityObjects("unused", "request", ["request"], new Map(), new Map([["request", file as never]]));

  it("is a column and a binding the build takes, though the file declares no field of that name", () => {
    expect(() => build(source({ create_form: { name: "Request", schema: { type: "object", properties: { name: { type: "string", "x-entityField": "name" } } } } }))).not.toThrow();
  });

  it("is still not a column when the view names another key that is no field", () => {
    expect(() => build(source({ views: [{ key: "all", name: "All", columns: ["name", "ghost"] }] }))).toThrow(
      "entities/request.json#/views/0/columns/1: ghost is not a field of request",
    );
  });
});
