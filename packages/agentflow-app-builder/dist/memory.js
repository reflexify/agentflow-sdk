import path from "node:path";
import { at, isObject, onlyMembers, readJson, refuse, targetEntity, translate, REQUIRED_ENTITIES } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
const MAX_GRANTS = 200;
const MAX_FIELDS = 30;
const MAX_ATTRIBUTES = 10;
const MAX_FIELD_KEY = 40;
const FIELD_KEY = /^[a-z][a-z0-9_]*$/;
const REVIEW = ["none", "changes", "all"];
const control = (text) => /[\p{Cc}]/u.test(text);
// A definition's text keeps its line breaks; an agent's instructions keep newline and tab only.
const plain = (text) => !control(text.replaceAll("\n", "").replaceAll("\t", ""));
const definitionText = (text) => !control(text.replace(/[\t\n\r]/g, ""));
function text(value, where, pointer, max) {
    if (typeof value !== "string" || value.trim() === "")
        refuse(where, pointer, "must be text that is not blank");
    if ([...value].length > max)
        refuse(where, pointer, `is longer than ${max} characters`);
    if (!definitionText(value))
        refuse(where, pointer, "holds a control character");
    return value;
}
function review(value, where) {
    if (typeof value !== "string" || !REVIEW.includes(value))
        refuse(where, "/review", `must be one of ${REVIEW.join(", ")}`);
}
// A text or choice field, as the platform reads one: a string, or options with no type, and no format.
function searchable(schema, key) {
    const field = isObject(schema) && isObject(schema.properties) ? schema.properties[key] : undefined;
    return isObject(field) && (field.type === "string" || field.type === undefined) && field.format === undefined;
}
function fieldKeys(schema, where, pointer, min, max) {
    if (!isObject(schema))
        refuse(where, pointer, "must be a schema object");
    const properties = schema.properties ?? {};
    if (!isObject(properties))
        refuse(where, at(pointer, "properties"), "must be an object");
    const keys = Object.keys(properties);
    if (keys.length < min || keys.length > max) {
        refuse(where, at(pointer, "properties"), `must hold ${min === max ? min : `${min} to ${max}`} fields`);
    }
    for (const key of keys) {
        if (!FIELD_KEY.test(key) || key.length > MAX_FIELD_KEY || key === "about") {
            refuse(where, at(at(pointer, "properties"), key), `is not a field key: lower case letters, digits and underscores, starting with a letter, at most ${MAX_FIELD_KEY} characters, and not "about"`);
        }
    }
    return keys;
}
function integer(value, where, pointer, max) {
    if (!Number.isInteger(value) || value < 1 || value > max)
        refuse(where, pointer, `must be a whole number from 1 to ${max}`);
}
export function memoryTypeObject(configDir, key, params) {
    const where = `memory_types/${key}.json`;
    const { key: own, ...rest } = readJson(path.join(configDir, where));
    if (own !== key)
        refuse(where, "/key", `is ${own}, not ${key}`);
    onlyMembers(rest, CONFIG_MEMBERS.memory_type.filter((member) => member !== "key"), where, "");
    for (const member of ["name", "describe", "fields", "title", "review"]) {
        if (!(member in rest))
            refuse(where, at("", member), "missing");
    }
    const body = translate(rest, where, "");
    text(body.name, where, "/name", 200);
    text(body.describe, where, "/describe", 4000);
    const fields = fieldKeys(body.fields, where, "/fields", 1, MAX_FIELDS);
    const title = text(body.title, where, "/title", Number.MAX_SAFE_INTEGER);
    for (const m of title.matchAll(/\{\{([^}]*)\}\}/g)) {
        if (!fields.includes(m[1].trim()))
            refuse(where, "/title", `names ${m[1].trim()}, which is not a field of the type`);
    }
    if (/\{\{/.test(title.replace(/\{\{[^}]*\}\}/g, "")))
        refuse(where, "/title", "has a {{ that is never closed");
    review(body.review, where);
    if (body.recall !== undefined && body.recall !== "always" && body.recall !== "search")
        refuse(where, "/recall", "must be always or search");
    if (body.max_per_about !== undefined)
        integer(body.max_per_about, where, "/max_per_about", 1000);
    if (body.expire_after_days !== undefined)
        integer(body.expire_after_days, where, "/expire_after_days", 3650);
    if (body.search_on !== undefined) {
        const list = body.search_on;
        if (!Array.isArray(list) || list.length === 0)
            refuse(where, "/search_on", "must name at least one field");
        list.forEach((name, i) => {
            if (typeof name !== "string" || !fields.includes(name))
                refuse(where, at("/search_on", i), "must name a field of the type");
            if (!searchable(body.fields, name))
                refuse(where, at("/search_on", i), `${name} is not a text or choice field; app-package lint checks each field's shape`);
            if (list.indexOf(name) !== i)
                refuse(where, at("/search_on", i), `${name} is named twice`);
        });
    }
    if (body.never_store !== undefined) {
        if (!Array.isArray(body.never_store) || body.never_store.length > 20)
            refuse(where, "/never_store", "must be a list of at most 20 entries");
        body.never_store.forEach((entry, i) => text(entry, where, at("/never_store", i), 200));
    }
    if (body.deprecated !== undefined && typeof body.deprecated !== "boolean")
        refuse(where, "/deprecated", "must be true or false");
    if (body.grants !== undefined)
        grantsOf(body.grants, params, where);
    return [`memory_type:${key}`, body];
}
// A grant's `to` is everyone or a group_ref parameter, written ${param:key}: a group is the installing organization's choice.
function grantsOf(grants, params, where) {
    if (!Array.isArray(grants))
        refuse(where, "/grants", "must be a list");
    if (grants.length > MAX_GRANTS)
        refuse(where, "/grants", `holds more than ${MAX_GRANTS} grants`);
    const seen = new Set();
    grants.forEach((grant, i) => {
        const here = at("/grants", i);
        if (!isObject(grant))
            refuse(where, here, "must be an object");
        onlyMembers(grant, CONFIG_MEMBERS.memory_grant, where, here);
        const toAt = at(here, "to");
        const to = grant.to;
        if (to !== "everyone") {
            if (typeof to !== "string" || !to.startsWith("@param:"))
                refuse(where, toAt, "must be everyone or a ${param:key} of a group_ref parameter: a package never names a group itself");
            if (params.get(to.slice("@param:".length)) !== "group_ref")
                refuse(where, toAt, `${to.slice("@param:".length)} is not a group_ref parameter`);
        }
        if (seen.has(to))
            refuse(where, toAt, "is named twice: a principal appears once");
        seen.add(to);
        if (grant.level !== "read" && grant.level !== "review")
            refuse(where, at(here, "level"), "must be read or review");
    });
}
function end(value, where, pointer) {
    if (!isObject(value))
        refuse(where, pointer, "must be an object");
    onlyMembers(value, CONFIG_MEMBERS.memory_end, where, pointer);
    const idAt = at(pointer, "id");
    if (typeof value.id !== "string")
        refuse(where, idAt, "must be a reference");
    if (value.kind === "entity")
        return { kind: "entity", id: targetEntity(value.id, where, idAt) };
    if (value.kind !== "memory_type")
        refuse(where, at(pointer, "kind"), "must be entity or memory_type");
    const id = translate(value.id, where, idAt);
    if (typeof id !== "string" || !id.startsWith("@obj:memory_type:"))
        refuse(where, idAt, "must be a memory type of the package, written ${memory_type:<key>}");
    return { kind: "memory_type", id };
}
export function memoryRelationshipObject(configDir, key) {
    const where = `memory_relationships/${key}.json`;
    const { key: own, ...rest } = readJson(path.join(configDir, where));
    if (own !== key)
        refuse(where, "/key", `is ${own}, not ${key}`);
    onlyMembers(rest, CONFIG_MEMBERS.memory_relationship.filter((member) => member !== "key"), where, "");
    for (const member of ["name", "description", "from", "to", "review"]) {
        if (!(member in rest))
            refuse(where, at("", member), "missing");
    }
    const body = translate(rest, where, "", { from: end, to: end });
    text(body.name, where, "/name", 200);
    text(body.description, where, "/description", 4000);
    review(body.review, where);
    if (body.attributes !== undefined)
        fieldKeys(body.attributes, where, "/attributes", 0, MAX_ATTRIBUTES);
    if (body.deprecated !== undefined && typeof body.deprecated !== "boolean")
        refuse(where, "/deprecated", "must be true or false");
    return [`memory_relationship:${key}`, body];
}
// A list of distinct references to the package's own definitions, as sentinels with `prefix`.
export function memoryReferences(list, where, pointer, prefix, max, what) {
    if (!Array.isArray(list))
        refuse(where, pointer, "must be a list");
    if (list.length > max)
        refuse(where, pointer, `names more than ${max} ${what}`);
    list.forEach((item, i) => {
        const here = at(pointer, i);
        if (typeof item !== "string" || !item.startsWith(prefix)) {
            refuse(where, here, `must be ${prefix === "@obj:memory_type:" ? "a memory type" : "a memory relationship"} of the package, written \${${prefix.slice("@obj:".length, -1)}:<key>}`);
        }
        if (list.indexOf(item) !== i)
            refuse(where, here, "is named twice");
    });
}
// A profile's `memorySave`, translated: the same rules the package verifier applies.
export function memorySaveOf(value, where, pointer) {
    if (!isObject(value))
        refuse(where, pointer, "must be an object");
    onlyMembers(value, CONFIG_MEMBERS.memory_save, where, pointer);
    const save = translate({ ...value, about: undefined }, where, pointer);
    if (!Array.isArray(value.types))
        refuse(where, at(pointer, "types"), "must be a list, empty when only relationships are saved");
    memoryReferences(save.types, where, at(pointer, "types"), "@obj:memory_type:", 20, "memory types");
    if (save.relationships !== undefined) {
        memoryReferences(save.relationships, where, at(pointer, "relationships"), "@obj:memory_relationship:", 10, "memory relationships");
    }
    if (save.types.length === 0 && !(save.relationships ?? []).length)
        refuse(where, pointer, "must save at least one memory type or relationship");
    if (value.about !== undefined) {
        if (!Array.isArray(value.about))
            refuse(where, at(pointer, "about"), "must be a list");
        save.about = value.about.map((entry, i) => {
            const here = at(at(pointer, "about"), i);
            const out = typeof entry === "string" && Object.hasOwn(REQUIRED_ENTITIES, entry) ? targetEntity(entry, where, here) : translate(entry, where, here);
            if (typeof out !== "string" || !/^@(obj:(entity|memory_type)|req:entity):/.test(out)) {
                refuse(where, here, "must be an entity or a memory type of the package, written ${entity:<key>} or ${memory_type:<key>}");
            }
            if (value.about.indexOf(entry) !== i)
                refuse(where, here, "is named twice");
            return out;
        });
    }
    else
        delete save.about;
    if (value.orgWide !== undefined && typeof value.orgWide !== "boolean")
        refuse(where, at(pointer, "orgWide"), "must be true or false");
    if (value.review !== undefined && typeof value.review !== "boolean")
        refuse(where, at(pointer, "review"), "must be true or false");
    if (!(save.about ?? []).length && value.orgWide !== true)
        refuse(where, at(pointer, "about"), "must name what the agent saves about, or set orgWide to true");
    if (value.instructions !== undefined) {
        const instructions = value.instructions;
        if (typeof instructions !== "string" || [...instructions].length > 4000)
            refuse(where, at(pointer, "instructions"), "must be text of at most 4000 characters");
        if (instructions.includes("{{") || !plain(instructions))
            refuse(where, at(pointer, "instructions"), "must be plain text: no {{ and no control character other than a newline or tab");
    }
    return save;
}
// What spans objects: a save names no definition the package ships deprecated, and the agent's read limit covers every type
// it saves into, directly or as the type end of a relationship it saves.
export function checkMemory(objects) {
    const bodies = new Map(objects);
    for (const [key, body] of objects) {
        const save = body?.profile?.memorySave;
        if (key.startsWith("agent:") && save)
            agentSave(key.slice("agent:".length), body, save, bodies);
    }
}
function agentSave(agent, body, save, bodies) {
    const where = `agents/${agent}.json`;
    const base = "/profile/memorySave";
    const needed = new Set(save.types);
    for (const [member, kind] of [["types", "memory_type"], ["relationships", "memory_relationship"]]) {
        (save[member] ?? []).forEach((sentinel, i) => {
            const target = bodies.get(`${kind}:${sentinel.slice(`@obj:${kind}:`.length)}`);
            if (target?.deprecated === true) {
                refuse(where, at(at(base, member), i), `${sentinel} is shipped deprecated, and the platform refuses to save into an archived definition`);
            }
            if (kind === "memory_relationship") {
                for (const e of [target?.from, target?.to])
                    if (e?.kind === "memory_type")
                        needed.add(e.id);
            }
        });
    }
    const covered = new Set(body.read_limit?.memory_types ?? []);
    for (const sentinel of needed) {
        if (!covered.has(sentinel)) {
            refuse(where, "/read_limit/memory_types", `must list ${sentinel}: an agent that saves into a memory type has to be allowed to read it`);
        }
    }
}
//# sourceMappingURL=memory.js.map