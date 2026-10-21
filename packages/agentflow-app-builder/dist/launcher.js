import { at, isObject, onlyMembers, refuse, translate } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
const W = "package-manifest.json";
const OBJECT_TARGET = /^@obj:(dashboard|entity|entity_view):/;
export function launcherOf(source, hasUi) {
    const pointer = "/launcher";
    if (!isObject(source))
        refuse(W, pointer, "must be an object");
    onlyMembers(source, CONFIG_MEMBERS.launcher, W, pointer);
    const out = {};
    if ("launch_url" in source)
        out.launch_url = source.launch_url;
    if ("entries" in source) {
        if (!Array.isArray(source.entries))
            refuse(W, at(pointer, "entries"), "must be an array");
        out.entries = source.entries.map((entry, index) => entryOf(entry, hasUi, at(at(pointer, "entries"), index)));
    }
    return out;
}
function entryOf(entry, hasUi, pointer) {
    if (!isObject(entry))
        refuse(W, pointer, "must be an object");
    onlyMembers(entry, CONFIG_MEMBERS.launcher_entry, W, pointer);
    const where = at(pointer, "target");
    const target = entry.target;
    if (!isObject(target))
        refuse(W, where, "must be an object");
    onlyMembers(target, CONFIG_MEMBERS.launcher_target, W, where);
    if (("module" in target) === ("object" in target))
        refuse(W, where, "exactly one of module or object");
    let built;
    if ("module" in target) {
        if (!hasUi)
            refuse(W, at(where, "module"), "a module target needs the package's ui");
        built = { module: target.module };
    }
    else {
        const object = translate(target.object, W, at(where, "object"));
        if (typeof object !== "string" || !OBJECT_TARGET.test(object)) {
            refuse(W, at(where, "object"), "must be a ${dashboard:key}, ${entity:key} or ${entity_view:entity/key}");
        }
        built = { object };
    }
    return { ...entry, target: built };
}
//# sourceMappingURL=launcher.js.map