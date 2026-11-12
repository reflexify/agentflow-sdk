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
  it("refuses a type, a format for the field's values and a format option AgentFlow does not know", () => {
    for (const ok of [
      { key: "n", type: "number", format: "percent", format_options: { decimal_places: 6, separators: "dot_comma" } },
      { key: "d", type: "date", format: "dd_mm_yyyy" },
      { key: "f", type: "formula", formula_result_type: "date", format: "iso" },
      { key: "a", type: "auto_number", format: "anything" },
      { key: "t", type: "text", format: null },
    ]) expect(() => body(ok), ok.key).not.toThrow();
    const refusal = (field: Record<string, unknown>) => () => body({ key: "x", ...field });
    expect(refusal({ type: "numbr" })).toThrow("entities/task.json#/fields/0/type: one of text, number, boolean, date, datetime, enum, reference, multi_select, reference_list, file, formula, auto_number, list (did you mean number?)");
    expect(refusal({})).toThrow("entities/task.json#/fields/0/type: one of text,");
    expect(refusal({ type: "date", format: "DD.MM.YYYY" })).toThrow("entities/task.json#/fields/0/format: one of dd_mm_yyyy, mm_dd_yyyy, iso, long, month_year, relative on a date field");
    expect(refusal({ type: "boolean", format: "iso" })).toThrow("entities/task.json#/fields/0/format: none: a boolean field takes no format");
    expect(refusal({ type: "formula", formula_result_type: "number", format: "iso" })).toThrow("format: one of currency, percent, duration, rating on a formula field whose result is number");
    expect(refusal({ type: "number", format_options: { decimals: 2 } })).toThrow("entities/task.json#/fields/0/format_options/decimals: not a format option AgentFlow knows");
    expect(refusal({ type: "number", format_options: { separators: "1.234,5" } })).toThrow("format_options/separators: one of locale, comma_dot, dot_comma, space_comma, none");
    expect(refusal({ type: "number", format_options: { decimal_places: 12 } })).toThrow("format_options/decimal_places: a whole number from 0 to 8");
  });
  it("judges format_options values and constraints by the field's effective type, as AgentFlow does", () => {
    const COLUMNS = [{ key: "text", label: "Text", type: "text" }, { key: "done", label: "Done", type: "boolean" }];
    const list = (extra: Record<string, unknown>) => ({ type: "list", item_fields: COLUMNS, ...extra });
    const number = (format: string | undefined, format_options: Record<string, unknown>) => ({ type: "number", format, format_options });
    const formula = (result: string, extra: Record<string, unknown>) => ({ type: "formula", formula_expression: "a", formula_result_type: result, ...extra });
    const autoNumber = (extra: Record<string, unknown>) => ({ type: "auto_number", auto_number_scope: "all", ...extra });
    const choices = (constraints: Record<string, unknown>) => ({ type: "multi_select", enum_values: ["a", "b"], constraints });
    // A refused row names the pointer the refusal carries; an accepted row names none.
    const rows: [Record<string, unknown>, string?][] = [
      [number("currency", { currency_code: "eur" }), "format_options/currency_code"],
      [number(undefined, { currency_code: "EUR" }), "format_options/currency_code"],
      [number("currency", { currency_code: "EUR" })],
      [number("rating", { rating_max: 11 }), "format_options/rating_max"],
      [number("rating", { rating_max: null }), "format_options/rating_max"],
      [number("percent", { rating_max: 5 }), "format_options/rating_max"],
      [formula("number", { format: "rating", format_options: { rating_max: 10 } })],
      [number("duration", { duration_unit: "days" }), "format_options/duration_unit"],
      [number("duration", { duration_format: "hh" }), "format_options/duration_format"],
      [number(undefined, { duration_unit: "hours" }), "format_options/duration_unit"],
      [number("duration", { duration_unit: "hours", duration_format: "hh_mm" })],
      [{ type: "text", format_options: { display: "table" } }, "format_options/display"],
      [list({ format_options: { display: "grid" } }), "format_options/display"],
      [list({ format_options: { display: "table" } })],
      [list({ format_options: { display: "table", done_field: "done" } }), "format_options/done_field"],
      [{ type: "text", format_options: { done_field: "done" } }, "format_options/done_field"],
      [list({ format_options: { display: "checklist", done_field: "done" } })],
      [{ type: "number", format_options: { mentions: true } }, "format_options/mentions"],
      [formula("text", { format_options: { mentions: true } }), "format_options/mentions"],
      [{ type: "text", format_options: { mentions: "yes" } }, "format_options/mentions"],
      [{ type: "number", format_options: { mentions: false } }],
      [{ type: "text", format_options: { mentions: true } }],
      [number("currency", { currency_code: "EUR", bar: true }), "format_options/bar"],
      [number("percent", { bar: "yes" }), "format_options/bar"],
      [number("currency", { currency_code: "EUR", bar: false, bar_bands: [{ at: "x" }] })],
      [number("percent", { bar_bands: [{ at: 50, color: "rose" }] }), "format_options/bar_bands"],
      [number("percent", { bar: true, bar_bands: {} }), "format_options/bar_bands"],
      [number("percent", { bar: true, bar_bands: Array.from({ length: 6 }, (_, i) => ({ at: i, color: "sky" })) }), "format_options/bar_bands"],
      [number("percent", { bar: true, bar_bands: [3] }), "format_options/bar_bands/0"],
      [number("percent", { bar: true, bar_bands: [{ at: 50, color: "red" }] }), "format_options/bar_bands/0/color"],
      [number("percent", { bar: true, bar_bands: [{ at: "50", color: "rose" }] }), "format_options/bar_bands/0/at"],
      [number("percent", { bar: true, bar_bands: [{ at: 50, color: "rose", label: "Low" }] }), "format_options/bar_bands/0/label"],
      [number("percent", { bar: true, bar_bands: [{ at: 90, color: "emerald" }, { at: 0, color: "rose" }] })],
      [number("percent", { bar: true, bar_bands: [] })],
      [number("rating", { decimal_places: 1 }), "format_options/decimal_places"],
      [number("duration", { separators: "none" }), "format_options/separators"],
      [{ type: "text", format_options: { separators: "none" } }, "format_options/separators"],
      [autoNumber({ auto_number_format: "SO-{n}", format_options: { decimal_places: 0 } }), "format_options/decimal_places"],
      [autoNumber({ format_options: { decimal_places: 0, separators: "none" } })],
      [formula("number", { format: "currency", format_options: { currency_code: "VND", decimal_places: 0 } })],
      [{ type: "date", format_options: { time_style: "24h" } }, "format_options/time_style"],
      [{ type: "datetime", format_options: { time_style: "24" } }, "format_options/time_style"],
      [formula("datetime", { format_options: { time_style: "12h" } })],
      [{ type: "text", format_options: { max_files: 3 } }, "format_options/max_files"],
      [{ type: "file", format_options: { max_files: 501 } }, "format_options/max_files"],
      [{ type: "file", format_options: { max_files: null } }],
      [{ type: "file", format: "image", format_options: { max_files: 500 } }],
      [{ type: "text", constraints: { minimum: 1 } }, "constraints/minimum"],
      [{ type: "number", constraints: { max_length: 3 } }, "constraints/max_length"],
      [list({ constraints: { min_items: 1 } }), "constraints/min_items"],
      [{ type: "boolean", constraints: { max_items: 1 } }, "constraints/max_items"],
      [formula("date", { constraints: { minimum: 0 } }), "constraints/minimum"],
      [{ type: "file", constraints: { max_items: 2 } }, "constraints/max_items"],
      [{ type: "boolean", constraints: { minimum: null } }],
      [{ type: "text", constraints: null }],
      [formula("number", { rollup: null })],
      [formula("number", { constraints: { minimum: 0, maximum: 1 } })],
      [autoNumber({ auto_number_format: "SO-{n}", constraints: { max_length: 20 } })],
      [autoNumber({ constraints: { max_length: 20 } }), "constraints/max_length"],
      [choices({ min_items: 1, max_items: 3 })],
      [list({ constraints: { max_items: 201 } }), "constraints/max_items"],
      [list({ constraints: { max_items: 0 } }), "constraints/max_items"],
      [list({ constraints: { max_items: 200 } })],
      [{ type: "text", format: "phone", constraints: { enforce_format: true } }, "constraints/enforce_format"],
      [{ type: "text", constraints: { enforce_format: true } }, "constraints/enforce_format"],
      [{ type: "text", format: "url", constraints: { enforce_format: true } }],
      [{ type: "number", constraints: { enforce_format: false } }],
      [{ type: "number", constraints: { minimum: 5, maximum: 1 } }, "constraints/minimum"],
      [{ type: "text", constraints: { min_length: 5, max_length: 1 } }, "constraints/min_length"],
      [choices({ min_items: 3, max_items: 1 }), "constraints/min_items"],
      [{ type: "number", constraints: { minimum: 1, maximum: 1 } }],
      [{ type: "text", constraints: { pattern: "a".repeat(501) } }, "constraints/pattern"],
      [{ type: "text", constraints: { pattern: "\u{1F600}".repeat(500) } }],
      [{ type: "text", constraints: { pattern: "(" } }],
      [{ type: "text", constraints: { min_length: -1 } }, "constraints/min_length"],
      [{ type: "text", constraints: { pattern: 3 } }, "constraints/pattern"],
      [{ type: "number", constraints: { minimum: "1" } }, "constraints/minimum"],
      [{ type: "text", format: "email", constraints: { enforce_format: "yes" } }, "constraints/enforce_format"],
      [{ type: "text", format: "email", constraints: { enforce_format: null } }, "constraints/enforce_format"],
    ];
    for (const [field, pointer] of rows) {
      const build = () => body({ key: "x", ...field });
      const label = JSON.stringify(field);
      if (pointer) expect(build, label).toThrow(`entities/task.json#/fields/0/${pointer}: `);
      else expect(build, label).not.toThrow();
    }
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
  it("carries queriedByApp, and refuses a value that is no boolean", () => {
    expect(body({ key: "status", type: "enum", label: "Status", queriedByApp: true }).queriedByApp).toBe(true);
    expect(body({ key: "status", type: "text", queriedByApp: false }).queriedByApp).toBe(false);
    expect(() => body({ key: "status", type: "text", queriedByApp: "yes" }))
      .toThrow("entities/task.json#/fields/0/queriedByApp: true or false");
  });
  it("refuses an item_fields, a constraints or a rollup of the wrong shape with a location", () => {
    for (const item_fields of [null, {}, "x"]) {
      expect(() => body({ key: "c", type: "list", item_fields })).toThrow("entities/task.json#/fields/0/item_fields: must be an array");
    }
    expect(() => body({ key: "c", type: "list", item_fields: [null] })).toThrow("entities/task.json#/fields/0/item_fields/0: must be an object");
    for (const value of [[], 3]) {
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

  it("refuses a create form whose list picker puts its format on the array, or names no entity", () => {
    expect(() => build({ visible_to: { type: "array", format: "entity", items: { type: "string" }, "x-entity": "group", "x-entityField": "visible_to" } }))
      .toThrow(/visible_to.*list field.*"items"/);
    expect(() => build({ queue: { type: "string", "x-entity": "request", "x-entityField": "queue" } }))
      .toThrow(/queue.*"format": "entity"/);
    expect(() => build({ queue: { type: "string", format: "entity", "x-entityField": "queue" } }))
      .toThrow(/queue.*x-entity/);
  });

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

describe("the display field", () => {
  const source = (display_field: string) => ({
    key: "request", name: "Request", access: { mode: "everyone", grants: [] }, views: [], display_field,
    fields: [
      { key: "number", type: "auto_number", label: "Number", auto_number_format: "RQ-{{ value }}" },
      { key: "summary", type: "text", label: "Summary" },
      { key: "notes", type: "text", label: "Notes", format_options: { mentions: true } },
      { key: "queue", type: "reference", label: "Queue", target_entity_id: "${entity:request}" },
      { key: "scan", type: "file", label: "Scan" },
      { key: "lines", type: "list", label: "Lines", item_fields: [{ key: "text", type: "text", label: "Text" }] },
      { key: "queue_name", type: "formula", label: "Queue name", formula_expression: "queue.summary", formula_result_type: "text" },
    ],
  });
  const build = (display_field: string) =>
    entityObjects("unused", "request", ["request"], new Map(), new Map([["request", source(display_field) as never]]));

  it("refuses a reference, file or list field, which AgentFlow refuses as the display field at install", () => {
    expect(() => build("queue")).toThrow(
      "entities/request.json#/display_field: queue is a reference field, which AgentFlow refuses as the display field at install: " +
        "a record is named by a scalar value. Name a text, auto_number or formula field; a formula can read a field of the record a reference points to",
    );
    for (const [field, type] of [["scan", "file"], ["lines", "list"]]) {
      expect(() => build(field)).toThrow(`${field} is a ${type} field`);
    }
  });

  it("refuses a field the file does not declare, name included, and one that allows mentions", () => {
    expect(() => build("nmber")).toThrow("entities/request.json#/display_field: nmber is not a field of request: name one the file declares");
    expect(() => build("name")).toThrow("name is not a field of request");
    expect(() => build("notes")).toThrow(
      "entities/request.json#/display_field: notes allows mentions, which AgentFlow refuses on the display field: its value is shown wherever a record is named",
    );
  });

  it("takes a text, auto_number or formula field", () => {
    for (const field of ["summary", "number", "queue_name"]) expect(() => build(field), field).not.toThrow();
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
