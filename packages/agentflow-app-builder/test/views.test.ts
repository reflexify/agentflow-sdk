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
});
