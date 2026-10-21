import { at, clip, REQUIRED_ENTITIES } from "../core.js";
import { CliError } from "../errors.js";
const OBJECT = /^@obj:(entity|workflow|agent|skill|dashboard):([a-z][a-z0-9_]*)$/;
const SCOPED_OBJECT = /^@obj:(entity_view):([a-z][a-z0-9_]*\/[a-z][a-z0-9_]*)$/;
const PARAMETER = /^@param:([a-z][a-z0-9_]*)$/;
export const shown = (value) => clip(JSON.stringify(value) ?? "nothing");
export function unsupported(where, pointer, message) {
    throw new CliError("DRAFT_UNSUPPORTED", `${where}#${pointer}: ${message}`, [where]);
}
export function invalid(where, message) {
    throw new CliError("DRAFT_INVALID", `${where}: ${message}`, [where]);
}
// The inverse of `translate`: a sentinel the builder writes for a `${kind:key}` reference becomes that
// reference again. Any other sentinel, and any string the builder would read as one, is a form the
// builder cannot write in this place.
export function unsentinel(value, where, pointer, special = {}) {
    if (typeof value === "string") {
        const object = OBJECT.exec(value) ?? SCOPED_OBJECT.exec(value);
        if (object)
            return `\${${object[1]}:${object[2]}}`;
        const parameter = PARAMETER.exec(value);
        if (parameter)
            return `\${param:${parameter[1]}}`;
        if (value.startsWith("@"))
            unsupported(where, pointer, `a sentinel the builder never writes here: ${clip(value)}`);
        if (value.includes("${"))
            unsupported(where, pointer, `a string the builder would read as a reference: ${clip(value)}`);
        return value;
    }
    if (Array.isArray(value))
        return value.map((item, index) => unsentinel(item, where, at(pointer, index), special));
    if (value && typeof value === "object") {
        const out = {};
        for (const [key, item] of Object.entries(value)) {
            if (key.includes("${"))
                unsupported(where, at(pointer, key), "a member name the builder would read as a reference");
            out[key] = Object.hasOwn(special, key)
                ? special[key](item, where, at(pointer, key))
                : unsentinel(item, where, at(pointer, key), special);
        }
        return out;
    }
    return value;
}
const REQUIRED_IDS = new Map(Object.entries(REQUIRED_ENTITIES).map(([id, key]) => [`@req:entity:${key}`, id]));
// The inverse of `targetEntity`.
export function entityTarget(value, where, pointer) {
    if (typeof value === "string" && REQUIRED_IDS.has(value))
        return REQUIRED_IDS.get(value);
    const out = unsentinel(value, where, pointer);
    if (typeof out !== "string" || !out.startsWith("${entity:")) {
        unsupported(where, pointer, `not an entity of the package or a required entity: ${shown(value)}`);
    }
    return out;
}
// A whole `@param:key`, as `parameterOf` writes it, back as `${param:key}`.
export function parameter(value, where, pointer) {
    const key = typeof value === "string" ? PARAMETER.exec(value)?.[1] : undefined;
    if (!key)
        unsupported(where, pointer, `must be a parameter: ${shown(value)}`);
    return `\${param:${key}}`;
}
//# sourceMappingURL=unsentinel.js.map