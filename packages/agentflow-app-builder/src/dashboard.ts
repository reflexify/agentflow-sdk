import path from "node:path";
import { at, clip, isObject, onlyMembers, readJson, refuse, targetEntity, translate, type ObjectEntry } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
import { nearest } from "./suggest.js";

const TILE_KINDS = ["number", "chart", "list", "text"];

// A measure follows a metric of its tile's entity by key. A package cannot know the id the organization will give the
// metric, so it names none, and the key must be a metric this build ships on that entity (`metrics` holds the logical
// keys, `entity_metric:<entity>/<key>`, of every one it does).
function checkFollowedMetrics(tiles: unknown, metrics: ReadonlySet<string>, where: string): void {
  if (!Array.isArray(tiles)) return;
  tiles.forEach((tile: unknown, t: number) => {
    if (!isObject(tile) || !isObject(tile.query) || !Array.isArray(tile.query.measures)) return;
    const entity = typeof tile.query.entity_id === "string" ? /^@obj:entity:(.+)$/.exec(tile.query.entity_id)?.[1] : undefined;
    const name = typeof tile.label === "string" && tile.label !== "" ? `the tile ${JSON.stringify(clip(tile.label))}` : `tile ${t}`;
    const measuresAt = at(at(at("/tiles", t), "query"), "measures");
    tile.query.measures.forEach((measure: unknown, m: number) => {
      if (!isObject(measure)) return;
      const here = at(measuresAt, m);
      if ("entity_metric_id" in measure) {
        refuse(where, at(here, "entity_metric_id"), "a package follows a metric by its key: write metric, since an id belongs to one organization's metric");
      }
      if (!("metric" in measure)) return;
      const keyAt = at(here, "metric");
      if (typeof measure.metric !== "string") refuse(where, keyAt, "must be a metric key");
      const follows = `${name} follows the metric ${clip(measure.metric)}`;
      if (entity === undefined) refuse(where, keyAt, `${follows}, but measures no entity of the package`);
      if (!metrics.has(`entity_metric:${entity}/${measure.metric}`)) {
        const prefix = `entity_metric:${entity}/`;
        const near = nearest(measure.metric, [...metrics].filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length)));
        refuse(where, keyAt, `${follows}, which ${entity} does not define${near ? ` (did you mean ${near}?)` : ""}`);
      }
      const extra = Object.keys(measure).find((member) => !CONFIG_MEMBERS.followed_measure!.includes(member));
      if (extra !== undefined) {
        refuse(where, at(here, extra), `${follows} in measure ${m}, which carries only id, primary, key and color beside it, not ${extra}`);
      }
    });
  });
}

export function dashboardObject(
  configDir: string,
  fileName: string,
  entities: readonly string[],
  metrics: ReadonlySet<string> = new Set(),
): ObjectEntry {
  const where = `dashboards/${fileName}`;
  const file = readJson(path.join(configDir, where));
  if (!isObject(file)) return refuse(where, "", "must be an object");
  onlyMembers(file, CONFIG_MEMBERS.dashboard!, where, "");
  if ("filter_bar" in file) refuse(where, "/filter_bar", "a package cannot install a filter bar yet");
  const stem = fileName.slice(0, -".json".length);
  if (file.key !== stem) refuse(where, "/key", `is ${String(file.key)}, not ${stem}`);
  if (!Array.isArray(file.tiles)) refuse(where, "/tiles", "must be an array");
  file.tiles.forEach((tile: unknown, i: number) => {
    const here = at("/tiles", i);
    if (!isObject(tile)) refuse(where, here, "must be an object");
    if (!TILE_KINDS.includes(tile.kind as string)) refuse(where, at(here, "kind"), `a tile kind the builder has no rule for: ${String(tile.kind)}`);
  });
  const entity = (value: unknown, w: string, pointer: string): string => {
    const out = targetEntity(value, w, pointer);
    const key = out.slice("@obj:entity:".length);
    if (out.startsWith("@obj:entity:") && !entities.includes(key)) refuse(w, pointer, `${key} is not an entity of the package`);
    return out;
  };
  const body: Record<string, unknown> = { name: file.name };
  if ("description" in file) body.description = file.description;
  body.tiles = translate(file.tiles, where, "/tiles", { entity_id: entity });
  checkFollowedMetrics(body.tiles, metrics, where);
  return [`dashboard:${stem}`, body];
}
