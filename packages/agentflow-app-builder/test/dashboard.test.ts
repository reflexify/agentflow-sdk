import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dashboardObject } from "../src/dashboard.js";

const TILE = "0190f8f4-0000-7000-8000-0000000000a1";
const MEASURE = "0190f8f4-0000-7000-8000-0000000000b1";

const dashboard = (file: Record<string, unknown>, stem = file.key as string, entities = ["task"]) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-dash-"));
  fs.mkdirSync(path.join(dir, "dashboards"));
  fs.writeFileSync(path.join(dir, "dashboards", `${stem}.json`), JSON.stringify(file));
  return dashboardObject(dir, `${stem}.json`, entities);
};
const number = {
  kind: "number", id: TILE, label: "Open",
  query: { entity_id: "${entity:task}", measures: [{ id: MEASURE, fn: "count", primary: true }] },
  position: { row: 0, col: 0, w: 6, h: 5 },
};

describe("dashboardObject", () => {
  it("refuses a filter bar", () => {
    expect(() => dashboard({ key: "o", name: "O", tiles: [], filter_bar: { controls: [] } }))
      .toThrow("dashboards/o.json#/filter_bar: a package cannot install a filter bar yet");
  });
  it("translates a tile's entity and checks its kind", () => {
    const out = dashboard({ key: "o", name: "O", description: "Overview", tiles: [number] });
    expect(out[0]).toBe("dashboard:o");
    expect(JSON.stringify(out[1])).toContain('"entity_id":"@obj:entity:task"');
    expect(out[1]).toMatchObject({ name: "O", description: "Overview" });
    expect(() => dashboard({ key: "o", name: "O", tiles: [{ kind: "pivot" }] })).toThrow("dashboards/o.json#/tiles/0/kind: a tile kind the builder has no rule for: pivot");
  });
  it("accepts a chart, a list and a text tile", () => {
    for (const kind of ["chart", "list", "text"]) {
      expect(dashboard({ key: "o", name: "O", tiles: [{ kind, id: TILE }] })[1]).toMatchObject({ tiles: [{ kind }] });
    }
  });
  it("refuses a tile of the wrong shape and an entity the package lacks", () => {
    expect(() => dashboard({ key: "o", name: "O", tiles: {} })).toThrow("dashboards/o.json#/tiles: must be an array");
    expect(() => dashboard({ key: "o", name: "O", tiles: [3] })).toThrow("dashboards/o.json#/tiles/0: must be an object");
    expect(() => dashboard({ key: "o", name: "O", tiles: [number] }, "o", ["other"]))
      .toThrow("dashboards/o.json#/tiles/0/query/entity_id: task is not an entity of the package");
  });
  it("refuses a member it has no rule for and a stem that is not the key", () => {
    expect(() => dashboard({ key: "o", name: "O", tiles: [], colour: 1 })).toThrow("dashboards/o.json#/colour: a member the builder has no rule for");
    expect(() => dashboard({ key: "o", name: "O", tiles: [] }, "p")).toThrow("dashboards/p.json#/key: is o, not p");
  });
});
