import { at, isObject, kindOf, objectPath } from "../core.js";
import { CONFIG_VERSION } from "../config-version.js";
import { CONFIG_MEMBERS } from "../members.js";
import { MANIFEST_MEMBERS } from "../manifest.js";
import { invalid, unsentinel, unsupported } from "./unsentinel.js";
const M = "manifest.json";
const ADDED = new Set(CONFIG_MEMBERS.manifest_added);
// The draft's files, read as the builder's output: its manifest, and each listed object by key. Every
// object and grant a converter takes is marked, so what no converter took can be named.
export class Draft {
    files;
    manifest;
    objects;
    grants;
    taken = new Set();
    takenGrants = new Set();
    constructor(files) {
        this.files = files;
        const bytes = files.get(M);
        if (!bytes)
            invalid(M, "missing: a draft holds manifest.json at its top");
        const manifest = parse(M, bytes);
        if (!isObject(manifest))
            invalid(M, "must be an object");
        this.manifest = manifest;
        const objects = manifest.objects ?? [];
        const grants = manifest.grants ?? [];
        if (!Array.isArray(objects))
            invalid(M, "objects must be an array");
        if (!Array.isArray(grants) || !grants.every(isObject))
            invalid(M, "grants must be an array of objects");
        objects.forEach((entry, i) => {
            if (!isObject(entry) || typeof entry.key !== "string" || !entry.key.includes(":") || entry.kind !== kindOf(entry.key)) {
                invalid(M, `objects/${i} is not a {key, kind} entry`);
            }
        });
        this.objects = objects;
        this.grants = grants;
    }
    // The local keys of the listed objects of `kind`, in the manifest's order.
    keys(kind) {
        return this.objects.filter((o) => o.kind === kind).map((o) => o.key.slice(kind.length + 1));
    }
    has(key) {
        return this.objects.some((o) => o.key === key);
    }
    // The body of the listed object `key`, marked as taken.
    take(key) {
        if (!this.has(key))
            invalid(objectPath(key), `${key} is named but not listed in manifest.json's objects`);
        const file = objectPath(key);
        const bytes = this.files.get(file);
        if (!bytes)
            invalid(file, `missing: manifest.json lists ${key}`);
        const body = parse(file, bytes);
        if (!isObject(body))
            invalid(file, "must be an object");
        this.taken.add(key);
        return body;
    }
    takeGrant(index) {
        this.takenGrants.add(index);
        return this.grants[index];
    }
    // Every object and grant no converter took: a draft member the builder has no inverse for.
    leftovers() {
        for (const { key } of this.objects) {
            if (!this.taken.has(key))
                unsupported(objectPath(key), "", `the builder writes a ${kindOf(key)} only as part of another object, and nothing here holds it`);
        }
        this.grants.forEach((grant, i) => {
            if (!this.takenGrants.has(i))
                unsupported(M, `/grants/${i}`, `a grant the builder has no rule for: ${String(grant.key)}`);
        });
    }
}
function parse(file, bytes) {
    try {
        return JSON.parse(bytes.toString("utf8"));
    }
    catch (error) {
        return invalid(file, `not JSON: ${error.message}`);
    }
}
function launcherSource(launcher) {
    if (!isObject(launcher) || !Array.isArray(launcher.entries))
        return launcher;
    return {
        ...launcher,
        entries: launcher.entries.map((entry, i) => {
            if (!isObject(entry) || !isObject(entry.target) || !("object" in entry.target))
                return entry;
            const pointer = at(at("/launcher/entries", i), "target");
            return { ...entry, target: { ...entry.target, object: unsentinel(entry.target.object, M, at(pointer, "object")) } };
        }),
    };
}
// The inverse of `manifestSource` and `launcherOf`: the builder copies every member but the launcher's
// object targets as it is, and derives exports, features, objects and grants.
export function manifestConfig(draft) {
    const manifest = draft.manifest;
    for (const key of Object.keys(manifest)) {
        if (!MANIFEST_MEMBERS.includes(key))
            unsupported(M, at("", key), "a manifest member the builder does not write");
    }
    if (Array.isArray(manifest.exports) ? manifest.exports.length > 0 : manifest.exports !== undefined) {
        unsupported(M, "/exports", "a package that exports objects, which the builder does not write");
    }
    if (isObject(manifest.features) ? Object.keys(manifest.features).length > 0 : manifest.features !== undefined) {
        unsupported(M, "/features", "optional features, which the builder does not write");
    }
    const config = { configVersion: CONFIG_VERSION };
    for (const key of MANIFEST_MEMBERS) {
        if (ADDED.has(key) || !(key in manifest))
            continue;
        config[key] = key === "launcher" ? launcherSource(manifest.launcher) : manifest[key];
    }
    return config;
}
//# sourceMappingURL=manifest.js.map