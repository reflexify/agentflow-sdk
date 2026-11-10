import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { METRICS_PLATFORM } from "../src/measures.js";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };

const definition = {
  label: "Open notes",
  fn: "count",
  filter: [{ field: "kind", op: "eq", value: "staff" }],
  thresholds: [{ at: 10, color: "amber" }],
  color: "teal",
};
const open = { key: "open_notes", ...definition };

const TILE = "0190f8f4-0000-7000-8000-0000000000a1";
const MEASURE = "0190f8f4-0000-7000-8000-0000000000b1";

interface Change {
  metrics?: unknown;
  view?: Record<string, unknown>;
  minPlatformVersion?: string;
}

const build = (change: Change): Record<string, string> => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-metrics-"));
  fs.cpSync(configDir, dir, { recursive: true });
  const note = path.join(dir, "entities/note.json");
  const entity = JSON.parse(fs.readFileSync(note, "utf8"));
  if ("metrics" in change) entity.metrics = change.metrics;
  if (change.view) entity.views[0].config = change.view;
  fs.writeFileSync(note, JSON.stringify(entity));
  if (change.minPlatformVersion !== undefined) {
    const file = path.join(dir, "package-manifest.json");
    fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), minPlatformVersion: change.minPlatformVersion }));
  }
  return buildPackage({ configDir: dir, sections: empty });
};

const platformOf = (files: Record<string, string>): string => JSON.parse(files["manifest.json"]!).minPlatformVersion;

describe("an entity file's metrics", () => {
  it("become entity_metric objects, each its definition less the key", () => {
    const files = build({ metrics: [open, { key: "slowest", label: "Slowest", fn: "percentile", field: "kind", percentile: { p: 90 }, deprecated: true }] });
    expect(JSON.parse(files["objects/entity_metric/note__open_notes.json"]!)).toEqual(definition);
    expect(JSON.parse(files["objects/entity_metric/note__slowest.json"]!)).toEqual({
      label: "Slowest", fn: "percentile", field: "kind", percentile: { p: 90 }, deprecated: true,
    });
    const listed = JSON.parse(files["manifest.json"]!).objects.filter((o: { kind: string }) => o.kind === "entity_metric");
    expect(listed).toEqual([
      { key: "entity_metric:note/open_notes", kind: "entity_metric" },
      { key: "entity_metric:note/slowest", kind: "entity_metric" },
    ]);
  });

  it("are absent when the file has none, and an empty list writes none", () => {
    expect(Object.keys(build({})).filter((file) => file.startsWith("objects/entity_metric/"))).toEqual([]);
    expect(Object.keys(build({ metrics: [] })).filter((file) => file.startsWith("objects/entity_metric/"))).toEqual([]);
  });

  it("are named by a view's summary through a reference that resolves to the object", () => {
    const files = build({ metrics: [open], view: { summary: { metric_ids: ["${entity_metric:note/open_notes}"] } } });
    const view = JSON.parse(files["objects/entity_view/note__all.json"]!);
    expect(view.config.summary.metric_ids).toEqual(["@obj:entity_metric:note/open_notes"]);
    expect(() => build({ view: { summary: { metric_ids: ["${entity_metric:note/open_notes}"] } } })).toThrow(
      "names no object, parameter or required entity of the package",
    );
  });

  it("are refused when they carry a member the schema does not, lack a label or a fn, or repeat a key", () => {
    const cases: [unknown, string][] = [
      [{}, "entities/note.json#/metrics: must be an array"],
      [[3], "entities/note.json#/metrics/0: must be an object"],
      [[{ ...open, colour: "red" }], "entities/note.json#/metrics/0/colour: a member the builder has no rule for"],
      [[{ ...open, key: "" }], "entities/note.json#/metrics/0/key: a non-empty string"],
      [[{ ...open, key: 4 }], "entities/note.json#/metrics/0/key: a non-empty string"],
      [[{ ...open, label: " " }], "entities/note.json#/metrics/0/label: a non-empty string"],
      [[{ key: "x", fn: "count" }], "entities/note.json#/metrics/0/label: a non-empty string"],
      [[{ key: "x", label: "X" }], "entities/note.json#/metrics/0/fn: a string, the function the metric computes"],
      [[open, open], "entity_metric:note/open_notes is built twice"],
    ];
    for (const [metrics, message] of cases) expect(() => build({ metrics }), message).toThrow(message);
  });
});

describe("the platform a package with metrics names", () => {
  it("is raised to 2027.03 by a metric, left alone for a later month, and never invented", () => {
    expect(METRICS_PLATFORM).toBe("2027.03");
    expect(platformOf(build({}))).toBe("2026.10");
    expect(platformOf(build({ metrics: [open] }))).toBe("2027.03");
    expect(platformOf(build({ metrics: [open], minPlatformVersion: "2027.01" }))).toBe("2027.03");
    expect(platformOf(build({ metrics: [open], minPlatformVersion: "2027.06" }))).toBe("2027.06");
  });
});

describe("a dashboard that follows a metric by key", () => {
  const dashboard = (metric: string, entity = "${entity:note}"): unknown => ({
    key: "o", name: "O",
    tiles: [{
      kind: "number", id: TILE, label: "Open notes",
      query: { entity_id: entity, measures: [{ id: MEASURE, metric, primary: true }] },
      position: { row: 0, col: 0, w: 6, h: 5 },
    }],
  });
  const built = (file: unknown, metrics: unknown[] = [open]): Record<string, string> => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-metrics-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const note = path.join(dir, "entities/note.json");
    fs.writeFileSync(note, JSON.stringify({ ...JSON.parse(fs.readFileSync(note, "utf8")), metrics }));
    fs.mkdirSync(path.join(dir, "dashboards"));
    fs.writeFileSync(path.join(dir, "dashboards/o.json"), JSON.stringify(file));
    return buildPackage({ configDir: dir, sections: empty });
  };

  it("builds when the key is a metric of the tile's entity in the build, and the measure keeps its key", () => {
    const files = built(dashboard("open_notes"));
    expect(JSON.parse(files["objects/dashboard/o.json"]!).tiles[0].query.measures).toEqual([{ id: MEASURE, metric: "open_notes", primary: true }]);
    expect(platformOf(files)).toBe("2027.03");
  });

  it("fails the build for a key the entity does not define, naming the tile and the key", () => {
    expect(() => built(dashboard("open_note"))).toThrow(
      'dashboards/o.json#/tiles/0/query/measures/0/metric: the tile "Open notes" follows the metric open_note, which note does not define (did you mean open_notes?)',
    );
    expect(() => built(dashboard("open_notes"), [])).toThrow("the tile \"Open notes\" follows the metric open_notes, which note does not define");
  });

  it("fails the build for a metric of another entity, and for a tile that measures no entity of the package", () => {
    expect(() => built(dashboard("open_notes", "${entity:contact}"))).toThrow("follows the metric open_notes, which contact does not define");
    expect(() => built(dashboard("open_notes", "ffffffff-0000-0000-0000-000000000001"))).toThrow(
      'the tile "Open notes" follows the metric open_notes, but measures no entity of the package',
    );
  });

  it("refuses a measure that names a metric by id, which only one organization's metric has", () => {
    const file = dashboard("open_notes") as { tiles: { query: { measures: Record<string, unknown>[] } }[] };
    file.tiles[0]!.query.measures[0] = { id: MEASURE, entity_metric_id: "0190f8f4-0000-7000-8000-0000000000c1", primary: true };
    expect(() => built(file)).toThrow("dashboards/o.json#/tiles/0/query/measures/0/entity_metric_id: a package follows a metric by its key");
  });
});
