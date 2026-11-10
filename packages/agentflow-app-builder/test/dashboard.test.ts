import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dashboardObject } from "../src/dashboard.js";

const TILE = "0190f8f4-0000-7000-8000-0000000000a1";
const MEASURE = "0190f8f4-0000-7000-8000-0000000000b1";

const dashboard = (file: Record<string, unknown>, stem = file.key as string, entities = ["task"], metrics: ReadonlySet<string> = new Set()) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-dash-"));
  fs.mkdirSync(path.join(dir, "dashboards"));
  fs.writeFileSync(path.join(dir, "dashboards", `${stem}.json`), JSON.stringify(file));
  return dashboardObject(dir, `${stem}.json`, entities, metrics);
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
  describe("a measure that follows a metric by key", () => {
    const follows = (measure: Record<string, unknown>, query: Record<string, unknown> = {}) => ({
      key: "o", name: "O",
      tiles: [{ ...number, label: "Open", query: { ...number.query, ...query, measures: [{ id: MEASURE, primary: true, ...measure }] } }],
    });
    const shipped = new Set(["entity_metric:task/open_count"]);

    it("is carried as it is when the entity of the build defines the key", () => {
      const out = dashboard(follows({ metric: "open_count" }), "o", ["task"], shipped);
      expect(out[1]).toMatchObject({ tiles: [{ query: { entity_id: "@obj:entity:task", measures: [{ id: MEASURE, metric: "open_count", primary: true }] } }] });
    });
    it("fails the build for a key the build does not define on the tile's entity, naming the tile and the key", () => {
      expect(() => dashboard(follows({ metric: "open_cont" }), "o", ["task"], shipped)).toThrow(
        'dashboards/o.json#/tiles/0/query/measures/0/metric: the tile "Open" follows the metric open_cont, which task does not define (did you mean open_count?)',
      );
      expect(() => dashboard(follows({ metric: "closed_count" }), "o", ["task"], shipped)).toThrow(
        /^dashboards\/o\.json#\/tiles\/0\/query\/measures\/0\/metric: the tile "Open" follows the metric closed_count, which task does not define$/,
      );
      expect(() => dashboard(follows({ metric: "open_count" }))).toThrow('the tile "Open" follows the metric open_count, which task does not define');
      expect(() => dashboard(follows({ metric: "open_count" }), "o", ["task", "other"], new Set(["entity_metric:other/open_count"]))).toThrow(
        "follows the metric open_count, which task does not define",
      );
    });
    it("fails the build for a tile that measures no entity of the package, or a key that is no string", () => {
      expect(() => dashboard(follows({ metric: "open_count" }, { entity_id: "ffffffff-0000-0000-0000-000000000001" }), "o", ["task"], shipped)).toThrow(
        'the tile "Open" follows the metric open_count, but measures no entity of the package',
      );
      expect(() => dashboard(follows({ metric: 3 }), "o", ["task"], shipped)).toThrow("tiles/0/query/measures/0/metric: must be a metric key");
    });
    it("refuses an entity_metric_id, which a package cannot know", () => {
      expect(() => dashboard(follows({ entity_metric_id: MEASURE }), "o", ["task"], shipped)).toThrow(
        "dashboards/o.json#/tiles/0/query/measures/0/entity_metric_id: a package follows a metric by its key",
      );
    });
    it("refuses a member beside the key that the installer would refuse, naming the tile, the measure and the member", () => {
      expect(() => dashboard(follows({ metric: "open_count", fn: "count" }), "o", ["task"], shipped)).toThrow(
        'dashboards/o.json#/tiles/0/query/measures/0/fn: the tile "Open" follows the metric open_count in measure 0, which carries only id, primary, key and color beside it, not fn',
      );
      expect(() => dashboard(follows({ metric: "open_count", color: "#123456", key: "k" }), "o", ["task"], shipped)).not.toThrow();
    });
  });
  it("refuses a member it has no rule for and a stem that is not the key", () => {
    expect(() => dashboard({ key: "o", name: "O", tiles: [], colour: 1 })).toThrow("dashboards/o.json#/colour: a member the builder has no rule for");
    expect(() => dashboard({ key: "o", name: "O", tiles: [] }, "p")).toThrow("dashboards/p.json#/key: is o, not p");
  });
});
