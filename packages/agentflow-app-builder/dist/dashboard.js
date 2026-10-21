import path from "node:path";
import { at, isObject, onlyMembers, readJson, refuse, targetEntity, translate } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
const TILE_KINDS = ["number", "chart", "list", "text"];
export function dashboardObject(configDir, fileName, entities) {
    const where = `dashboards/${fileName}`;
    const file = readJson(path.join(configDir, where));
    if (!isObject(file))
        return refuse(where, "", "must be an object");
    onlyMembers(file, CONFIG_MEMBERS.dashboard, where, "");
    if ("filter_bar" in file)
        refuse(where, "/filter_bar", "a package cannot install a filter bar yet");
    const stem = fileName.slice(0, -".json".length);
    if (file.key !== stem)
        refuse(where, "/key", `is ${String(file.key)}, not ${stem}`);
    if (!Array.isArray(file.tiles))
        refuse(where, "/tiles", "must be an array");
    file.tiles.forEach((tile, i) => {
        const here = at("/tiles", i);
        if (!isObject(tile))
            refuse(where, here, "must be an object");
        if (!TILE_KINDS.includes(tile.kind))
            refuse(where, at(here, "kind"), `a tile kind the builder has no rule for: ${String(tile.kind)}`);
    });
    const entity = (value, w, pointer) => {
        const out = targetEntity(value, w, pointer);
        const key = out.slice("@obj:entity:".length);
        if (out.startsWith("@obj:entity:") && !entities.includes(key))
            refuse(w, pointer, `${key} is not an entity of the package`);
        return out;
    };
    const body = { name: file.name };
    if ("description" in file)
        body.description = file.description;
    body.tiles = translate(file.tiles, where, "/tiles", { entity_id: entity });
    return [`dashboard:${stem}`, body];
}
//# sourceMappingURL=dashboard.js.map