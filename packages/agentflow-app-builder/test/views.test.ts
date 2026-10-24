import { describe, expect, it } from "vitest";
import { viewBody } from "../src/entity.js";

const PRESET = "0190f8f4-0000-7000-8000-0000000000f1";
const task = {
  key: "task",
  fields: [{ key: "title", type: "text" }, { key: "status", type: "enum" }],
  work: { lifecycle: {}, assignable: {} },
};
const view = (v: Record<string, unknown>, file: Record<string, unknown> = task) =>
  viewBody("task", v, file as never, "entities/task.json", "/views/0")[1] as Record<string, unknown>;

describe("view bodies", () => {
  it("keeps today's view body and carries columns, filters and presets", () => {
    expect(view({ key: "all", name: "All" })).toEqual({ name: "All", type: "grid", sort: { key: "updated_at", dir: "desc" } });
    expect(view({ key: "all", name: "All", description: "Everything" })).toEqual({
      name: "All", description: "Everything", type: "grid", sort: { key: "updated_at", dir: "desc" },
    });
    const mine = view({
      key: "mine", name: "My tasks", columns: ["title", "status", "claimed_by"],
      filters: [{ field: "status", op: "eq", value: "open" }],
      sort: { key: "title", dir: "asc" },
      config: { presets: [{ id: PRESET, label: "Mine", rules: [{ field: "claimed_by", op: "eq", value: { $bind: "viewer.id" } }] }] },
    });
    expect(mine).toMatchObject({ name: "My tasks", type: "grid", columns: ["title", "status", "claimed_by"], sort: { key: "title", dir: "asc" } });
    expect(mine.filters).toEqual([{ field: "status", op: "eq", value: "open" }]);
    expect(JSON.stringify(mine.config)).toContain('"value":{"$bind":"viewer.id"}');
  });
  it("refuses a view without a string key", () => {
    for (const key of [undefined, 3, ""]) {
      expect(() => view({ key, name: "V" })).toThrow("entities/task.json#/views/0/key: a non-empty string");
    }
  });
  it("accepts every view type the platform installs", () => {
    for (const type of ["grid", "kanban", "calendar", "gallery", "timeline", "map", "inbox", "detail"]) {
      expect(view({ key: "v", name: "V", type })).toMatchObject({ type });
    }
  });
  it("refuses a dispatch view, a matrix view and a member it has no rule for", () => {
    expect(() => view({ key: "d", name: "D", type: "dispatch" })).toThrow("entities/task.json#/views/0/type: a view type the builder has no rule for: dispatch");
    expect(() => view({ key: "d", name: "D", type: "matrix" })).toThrow("a view type the builder has no rule for: matrix");
    expect(() => view({ key: "d", name: "D", colour: "red" })).toThrow("entities/task.json#/views/0/colour: a member the builder has no rule for");
  });
  it("refuses a column that is no field of the entity, or a work field it does not seed", () => {
    expect(() => view({ key: "v", name: "V", columns: ["title", "nope"] })).toThrow("entities/task.json#/views/0/columns/1: nope is not a field of task");
    expect(() => view({ key: "v", name: "V", columns: ["claimed_by"] }, { ...task, work: undefined }))
      .toThrow("entities/task.json#/views/0/columns/0: claimed_by is not a field of task");
    expect(() => view({ key: "v", name: "V", columns: "title" })).toThrow("entities/task.json#/views/0/columns: must be an array");
  });
  it("refuses a column, filters, config or sort of the wrong shape", () => {
    expect(() => view({ key: "v", name: "V", columns: [3] })).toThrow("entities/task.json#/views/0/columns/0: must be a field key");
    expect(() => view({ key: "v", name: "V", filters: {} })).toThrow("entities/task.json#/views/0/filters: must be an array");
    expect(() => view({ key: "v", name: "V", filters: [1] })).toThrow("entities/task.json#/views/0/filters/0: must be an object");
    expect(() => view({ key: "v", name: "V", config: [] })).toThrow("entities/task.json#/views/0/config: must be an object");
    expect(() => view({ key: "v", name: "V", sort: "title" })).toThrow("entities/task.json#/views/0/sort: must be an object");
  });
  it("translates a reference inside a view", () => {
    expect(view({ key: "v", name: "V", filters: [{ field: "title", op: "eq", value: "${param:x}" }] }).filters)
      .toEqual([{ field: "title", op: "eq", value: "@param:x" }]);
  });

  describe("filters and preset rules", () => {
    const loan = {
      key: "loan",
      fields: [
        { key: "title", type: "text" },
        { key: "status", type: "enum" },
        { key: "due", type: "date" },
        { key: "active", type: "boolean" },
        { key: "tags", type: "multi_select" },
        { key: "borrower", type: "reference", target_entity_id: "ffffffff-0000-0000-0000-000000000001" },
        { key: "item", type: "reference", target_entity_id: "${entity:item}" },
        { key: "code", type: "auto_number", auto_number_format: "L-{seq}" },
        { key: "serial", type: "auto_number" },
        { key: "age", type: "formula", formula_result_type: "number" },
        { key: "broken", type: "formula" },
      ],
      work: { assignable: {} },
    };
    const item = { key: "item", fields: [{ key: "name", type: "text" }, { key: "stock", type: "number" }] };
    const sources = new Map([["loan", loan], ["item", item]]);
    const make = (v: Record<string, unknown>) =>
      viewBody("loan", { key: "v", name: "V", ...v }, loan as never, "entities/loan.json", "/views/0", sources as never);
    const filter = (rule: Record<string, unknown>) => make({ filters: [rule] });
    const preset = (rule: Record<string, unknown>) => make({ config: { presets: [{ id: PRESET, label: "P", rules: [rule] }] } });

    it("accepts the filters the platform saves", () => {
      for (const rule of [
        { field: "status", op: "eq", value: "approved" },
        { field: "status", op: "in", value: ["a", "b"] },
        { field: "title", op: "contains", value: "x" },
        { field: "due", op: "within", value: "last_365_days" },
        { field: "due", op: "within", value: "this_quarter" },
        { field: "due", op: "within", value: "last_3660_days" },
        { field: "due", op: "between", value: ["2026-01-01", "2026-12-31"] },
        { field: "due", op: "is_empty" },
        { field: "active", op: "eq", value: true },
        { field: "tags", op: "in", value: ["a"] },
        { field: "borrower", op: "eq", value: "u1" },
        { field: "code", op: "starts_with", value: "L-" },
        { field: "serial", op: "gt", value: 3 },
        { field: "age", op: "gte", value: 3 },
        { field: "claimed_by", op: "eq", value: "u1" },
        { field: "claimed_at", op: "within", value: "today" },
        { field: "item.stock", op: "lt", value: 3 },
        { field: "item.name", op: "contains", value: "x" },
        { field: "due", op: "within", value: "${param:window}" },
      ]) {
        expect(() => filter(rule), JSON.stringify(rule)).not.toThrow();
      }
    });
    it("refuses a field the entity does not have, naming the filter", () => {
      expect(() => filter({ field: "nope", op: "eq", value: 1 })).toThrow("entities/loan.json#/views/0/filters/0/field: nope is not a field of loan");
      expect(() => filter({ field: "item.nope", op: "eq", value: 1 })).toThrow("filters/0/field: nope is not a field of item");
      expect(() => filter({ field: "title.name", op: "eq", value: 1 })).toThrow("filters/0/field: title is not a reference field of loan");
      expect(() => filter({ field: "ghost.name", op: "eq", value: 1 })).toThrow("filters/0/field: ghost is not a field of loan");
    });
    it("refuses a hop through users, groups or units, which the platform cannot join", () => {
      expect(() => filter({ field: "borrower.email", op: "eq", value: "x" })).toThrow("filters/0/field: borrower refers to users, groups or units");
    });
    it("refuses an operator the field's type does not take", () => {
      expect(() => filter({ field: "status", op: "gt", value: 1 })).toThrow(
        "filters/0/op: gt does not suit status of loan, a field of type enum: use eq, ne, in, not_in, is_empty, is_not_empty",
      );
      expect(() => filter({ field: "title", op: "within", value: "today" })).toThrow("filters/0/op: within does not suit title of loan, a field of type text");
      expect(() => filter({ field: "tags", op: "eq", value: "a" })).toThrow("filters/0/op: eq does not suit tags");
      expect(() => filter({ field: "code", op: "gt", value: 1 })).toThrow("filters/0/op: gt does not suit code of loan, a field of type text");
      expect(() => filter({ field: "broken", op: "eq", value: 1 })).toThrow("filters/0/op: eq does not suit broken");
      expect(() => filter({ field: "item.stock", op: "contains", value: "1" })).toThrow("filters/0/op: contains does not suit item.stock of item, a field of type number");
      expect(() => filter({ field: "status", op: "hop_blank" })).toThrow("filters/0/op: hop_blank does not suit status");
    });
    it("refuses a within value that is not a window the platform accepts", () => {
      for (const value of ["recently", "yesterday", "last_0_days", "last_007_days", "last_3661_days", "last_7_day", "Last_7_days", "", 7]) {
        expect(() => filter({ field: "due", op: "within", value }), String(value)).toThrow("entities/loan.json#/views/0/filters/0/value:");
      }
      expect(() => filter({ field: "due", op: "within", value: "recently" })).toThrow(
        "recently is not a date window: use today, this_month, this_quarter, this_year or last_<n>_days (n from 1 to 3660, no leading zero)",
      );
    });
    it("refuses a value of the wrong shape for in, between and range_any", () => {
      expect(() => filter({ field: "status", op: "in", value: "a" })).toThrow("filters/0/value: in takes an array of values");
      expect(() => filter({ field: "due", op: "between", value: ["2026-01-01"] })).toThrow("filters/0/value: between takes a [low, high] array");
      expect(() => filter({ field: "age", op: "range_any", value: [[1]] })).toThrow("filters/0/value/0: an interval is a [from, to] pair");
      expect(() => filter({ field: "age", op: "range_any", value: [[null, null]] })).toThrow("an interval needs at least one bound");
      expect(() => filter({ field: "age", op: "range_any", value: [[1, 2]] })).not.toThrow();
    });
    it("refuses a $bind in a fixed filter, and points at the presets", () => {
      expect(() => filter({ field: "due", op: "lt", value: { $bind: "today" } })).toThrow(
        "entities/loan.json#/views/0/filters/0/value: a fixed filter compares as written and never resolves $bind: put the filter in a preset in config.presets",
      );
      expect(() => filter({ field: "status", op: "in", value: { $bind: "viewer.groups" } })).toThrow("never resolves $bind");
    });
    it("checks a preset's rules the same way, and lets them carry $bind", () => {
      expect(() => preset({ field: "due", op: "lt", value: { $bind: "today" } })).not.toThrow();
      expect(() => preset({ field: "due", op: "within", value: "last_7_days" })).not.toThrow();
      expect(() => preset({ field: "nope", op: "eq", value: 1 })).toThrow("entities/loan.json#/views/0/config/presets/0/rules/0/field: nope is not a field of loan");
      expect(() => preset({ field: "status", op: "gt", value: 1 })).toThrow("presets/0/rules/0/op: gt does not suit status");
      expect(() => preset({ field: "due", op: "within", value: "recently" })).toThrow("presets/0/rules/0/value: recently is not a date window");
      expect(() => preset({ field: "due", op: "lt", value: { $bind: "today" } })).not.toThrow();
    });
    it("refuses a preset rule that hops through a reference", () => {
      expect(() => preset({ field: "item.stock", op: "lt", value: 1 })).toThrow(
        "presets/0/rules/0/field: item.stock goes through a reference: a preset filters the view's own fields, so put it on the view's filters",
      );
    });
    it("checks a filter without the other entities when none are given", () => {
      expect(() => viewBody("loan", { key: "v", name: "V", filters: [{ field: "item.nope", op: "eq", value: 1 }] }, loan as never, "e", "/views/0")).not.toThrow();
      expect(() => viewBody("loan", { key: "v", name: "V", filters: [{ field: "title", op: "gt", value: 1 }] }, loan as never, "e", "/views/0")).toThrow("gt does not suit title");
    });
  });
});
