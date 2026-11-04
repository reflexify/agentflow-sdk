import { at, DEP_REFERENCE, isObject, onlyMembers, refuse, translate } from "./core.js";
import { CONFIG_MEMBERS, kindsOf } from "./members.js";
const KEY = /^[a-z](?:[a-z0-9]|_(?!_)){0,39}$/;
const CLOCK_KEY = /^[a-z][a-z0-9_]{0,23}$/;
const PARAM = /^\$\{param:([a-z][a-z0-9_-]*)\}$/;
const ENTITY = /^\$\{entity:([a-z][a-z0-9_-]*)\}$/;
const STREAM = /^[a-z][a-z0-9_]{0,63}$/;
const SOURCE_PATH = /^\^?[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/;
const SOURCE_PART = /^(?:\^?[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*)?$/;
const USERS = "ffffffff-0000-0000-0000-000000000001";
const GROUPS = "ffffffff-0000-0000-0000-000000000002";
const UNITS = "ffffffff-0000-0000-0000-000000000003";
const LIFECYCLE_FIELDS = { work_state: "enum", work_started_at: "datetime", done_at: "datetime" };
const ASSIGNABLE_FIELDS = {
    assigned_users: "reference_list", assigned_groups: "reference_list", assigned_units: "reference_list",
    claimed_by: "reference", assigned_at: "datetime", claimed_at: "datetime", minutes_to_claim: "number",
    minutes_to_done: "number",
};
const CLOCK_FIELDS = { state: "enum", outcome: "enum", due_at: "datetime", breached_at: "datetime", stopped_at: "datetime", minutes: "number" };
const SEEDED_TARGETS = {
    assigned_users: USERS, claimed_by: USERS, assigned_groups: GROUPS, assigned_units: UNITS,
};
const WORK_CONTRACTS = ["lifecycle", "assignable", "work_surface", "deadline"];
const RECORD_ID_PLACEHOLDER = "{{ record_id }}";
// The field types a source copies a value into; the rest are written by another route or computed.
const COPY_TYPES = ["text", "number", "boolean", "date", "datetime", "enum"];
const CUSTOM_PREFIX = "custom.";
// The members that govern a write. A source's writes are the platform's, so an entity it fills declares none.
const GOVERNING = ["rules", "stage_model", "work", "create_form"];
const DATE_UNITS = ["days", "weeks", "months", "years"];
const CATEGORIES = ["none", "active", "waiting", "done", "cancelled"];
const PRIORITIES = ["urgent", "high", "normal", "low"];
// The categories of connection each place a connection parameter is bound can be served by.
const USES = {
    email_step: { place: "an Email step", verb: "send through", categories: ["email"] },
    integration_step: { place: "an Integration step", verb: "call through", categories: ["crm", "erp"] },
    trigger: { place: "a connected_app trigger", verb: "listen through", categories: ["crm", "email", "erp"] },
    source: { place: "a source", verb: "read through", categories: ["crm", "erp"] },
};
// A parameter whose declared category cannot serve the place it is bound is refused; one that declares none is
// accepted here, except where an Integration step's object and operation need a kind of connection to mean anything.
export function checkConnectionUse(connections, use, key, where, pointer) {
    if (!connections.has(key))
        return;
    const category = connections.get(key);
    const { place, verb, categories } = USES[use];
    const list = categories;
    if (category === undefined) {
        if (use === "integration_step") {
            refuse(where, pointer, `${key} declares no category, and ${place}'s object and operation mean something only on one kind of connection: give it category ${list.join(" or ")}`);
        }
        return;
    }
    if (!list.includes(category)) {
        refuse(where, pointer, `${key} is ${/^[aeio]/.test(category) ? "an" : "a"} ${category} connection, which ${place} cannot ${verb} (${list.join(" or ")})`);
    }
}
const oneOf = (options) => `one of ${options.join(", ")}`;
const named = (value) => (typeof value === "string" ? value : JSON.stringify(value));
// The fields the platform seeds on an entity for its `work`, each a system field of its type.
function seededFields(work) {
    const out = new Map();
    if (!isObject(work))
        return out;
    const add = (fields, prefix = "") => {
        for (const [key, type] of Object.entries(fields)) {
            const body = { type, system: true };
            if (Object.hasOwn(SEEDED_TARGETS, key))
                body.target_entity_id = SEEDED_TARGETS[key];
            out.set(`${prefix}${key}`, body);
        }
    };
    if (isObject(work.lifecycle))
        add(LIFECYCLE_FIELDS);
    if (isObject(work.assignable))
        add(ASSIGNABLE_FIELDS);
    const clocks = isObject(work.deadline) && Array.isArray(work.deadline.clocks) ? work.deadline.clocks : [];
    for (const clock of clocks)
        if (isObject(clock) && typeof clock.key === "string")
            add(CLOCK_FIELDS, `${clock.key}_`);
    return out;
}
// Every field key a record of the entity carries: the entity's own and the ones its work seeds.
export function fieldKeysOf(file) {
    const own = (Array.isArray(file.fields) ? file.fields : []).flatMap((f) => (isObject(f) && typeof f.key === "string" ? [f.key] : []));
    return new Set([...seededFields(file.work).keys(), ...own]);
}
// The keys a view column, a create-form binding or an assistant label may name: `fieldKeysOf`, and `name`, the text
// field every entity has (the install adds it first when the file declares none).
export function nameableKeysOf(file) {
    return new Set([...fieldKeysOf(file), "name"]);
}
// A field of the entity by key: its own, or one its work seeds.
export function fieldOf(file, key) {
    const own = (Array.isArray(file.fields) ? file.fields : []).find((f) => isObject(f) && f.key === key);
    return own ?? seededFields(file.work).get(key);
}
// Whether an entity member is declared: present, and holding something. A create form is declared by any value,
// as the builder writes a form for any.
const declares = (member, value) => {
    if (value === undefined || value === null)
        return false;
    if (member === "create_form")
        return Boolean(value);
    if (Array.isArray(value))
        return value.length > 0;
    return isObject(value) ? Object.keys(value).length > 0 : true;
};
// Whether a source path reads from the parent record.
const readsParent = (path) => typeof path === "string" && path.startsWith("^");
const people = (field) => (field.type === "reference" || field.type === "reference_list") &&
    [USERS, GROUPS, UNITS].includes(field.target_entity_id);
// A unit field names people too, but the platform routes no work through one.
const routes = (field) => people(field) && field.target_entity_id !== UNITS;
function enumValues(field) {
    const values = Array.isArray(field.enum_values) ? field.enum_values : [];
    return new Set(values
        .map((value) => (typeof value === "string" ? value : isObject(value) ? value.value : undefined))
        .filter((value) => typeof value === "string"));
}
class Invariants {
    file;
    params;
    entities;
    where;
    connections;
    packages;
    assignable;
    constructor(file, params, entities, where, connections = new Map(), packages = new Set()) {
        this.file = file;
        this.params = params;
        this.entities = entities;
        this.where = where;
        this.connections = connections;
        this.packages = packages;
        this.assignable = isObject(file.work) && isObject(file.work.assignable);
    }
    fail(pointer, message) {
        return refuse(this.where, pointer, message);
    }
    object(value, pointer, members) {
        if (!isObject(value))
            this.fail(pointer, "must be an object");
        onlyMembers(value, members, this.where, pointer);
        return value;
    }
    record(value, pointer) {
        if (!isObject(value))
            this.fail(pointer, "must be an object");
        return value;
    }
    array(value, pointer) {
        if (!Array.isArray(value))
            this.fail(pointer, "must be an array");
        return value;
    }
    text(value, pointer, max) {
        if (typeof value !== "string" || value.length < 1 || value.length > max) {
            this.fail(pointer, `a string of 1 to ${max} characters`);
        }
    }
    declared(entity) {
        const source = entity === this.file.key ? this.file : this.entities.get(entity);
        const fields = source && Array.isArray(source.fields) ? source.fields : [];
        return new Map(fields.filter((f) => isObject(f) && typeof f.key === "string").map((f) => [f.key, f]));
    }
    fieldsOf(entity) {
        const source = entity === this.file.key ? this.file : this.entities.get(entity);
        return new Map([...seededFields(source?.work), ...this.declared(entity)]);
    }
    fieldIn(entity, key, pointer) {
        if (typeof key !== "string")
            this.fail(pointer, "must be a field key");
        return this.fieldsOf(entity).get(key) ?? this.fail(pointer, `${key} is not a field of ${entity}`);
    }
    // An own field, or one the entity's work seeds.
    own(key, pointer) {
        return this.fieldIn(this.file.key, key, pointer);
    }
    // An own field the entity declares itself, never one its work seeds.
    declaredOwn(key, pointer) {
        if (typeof key !== "string")
            this.fail(pointer, "must be a field key");
        const field = this.declared(this.file.key).get(key);
        if (field)
            return field;
        if (seededFields(this.file.work).has(key))
            this.fail(pointer, `${key} is a field the work seeds, not one of the entity's own`);
        return this.fail(pointer, `${key} is not a field of ${this.file.key}`);
    }
    ownEnum(key, pointer) {
        const field = this.declaredOwn(key, pointer);
        if (field.type !== "enum")
            this.fail(pointer, `${key} is not an enum field of ${this.file.key}`);
        return enumValues(field);
    }
    valueOf(values, of, value, pointer) {
        if (typeof value !== "string" || !values.has(value))
            this.fail(pointer, `${named(value)} is not a value of ${of}`);
    }
    // The package entity that the own single reference `key` points at.
    parentOf(key, pointer) {
        const reference = this.own(key, pointer);
        const target = ENTITY.exec(reference.target_entity_id)?.[1];
        if (reference.type !== "reference" || !target || !this.entities.has(target)) {
            this.fail(pointer, `${key} is not a single reference to an entity of the package`);
        }
        return target;
    }
    ownOrHop(key, pointer) {
        if (typeof key !== "string" || !key.includes(".")) {
            this.own(key, pointer);
            return;
        }
        const dot = key.indexOf(".");
        this.fieldIn(this.parentOf(key.slice(0, dot), pointer), key.slice(dot + 1), pointer);
    }
    parameter(value, type, pointer) {
        const key = typeof value === "string" ? PARAM.exec(value)?.[1] : undefined;
        if (!key)
            this.fail(pointer, "must be a ${param:key}");
        if (this.params.get(key) !== type)
            this.fail(pointer, `${key} is not ${/^[aeio]/.test(type) ? "an" : "a"} ${type} parameter`);
    }
    filter(rule, pointer, mayHop) {
        const filter = this.object(rule, pointer, CONFIG_MEMBERS.filter);
        const check = (key, keyAt) => {
            if (mayHop)
                return this.ownOrHop(key, keyAt);
            if (typeof key === "string" && key.includes(".")) {
                this.fail(keyAt, `${key} reads through a reference, which only a field leaf may`);
            }
            this.own(key, keyAt);
        };
        check(filter.field, at(pointer, "field"));
        const value = filter.value;
        if (!isObject(value))
            return;
        const marker = Object.keys(value).find((name) => name.startsWith("$"));
        if (marker === undefined)
            return;
        const valueAt = at(pointer, "value");
        onlyMembers(value, [marker], this.where, valueAt);
        const payloadAt = at(valueAt, marker);
        const payload = value[marker];
        if (marker === "$field")
            check(payload, payloadAt);
        else if (marker === "$bind") {
            this.fail(payloadAt, "a condition on a record has no viewer, so a $bind belongs only in a view's preset");
        }
        else if (marker === "$date") {
            const date = this.object(payload, payloadAt, CONFIG_MEMBERS.date);
            if (!Number.isInteger(date.offset))
                this.fail(at(payloadAt, "offset"), "a whole number");
            if (!DATE_UNITS.includes(date.unit))
                this.fail(at(payloadAt, "unit"), oneOf(DATE_UNITS));
        }
        else
            this.fail(payloadAt, `a marker the platform does not read: ${oneOf(["$field", "$date"])}`);
    }
    actor(value, pointer) {
        if (!isObject(value))
            this.fail(pointer, "must be an object");
        const kind = value.kind;
        if (!kindsOf("actor").includes(kind))
            this.fail(at(pointer, "kind"), oneOf(kindsOf("actor")));
        if (kind === "is_holder" && !this.assignable)
            this.fail(at(pointer, "kind"), "is_holder needs work.assignable");
        onlyMembers(value, CONFIG_MEMBERS[`actor.${kind}`], this.where, pointer);
        if (kind === "in_field") {
            const fieldAt = at(pointer, "field");
            if (!people(this.own(value.field, fieldAt)))
                this.fail(fieldAt, `${value.field} is not a people field`);
        }
        else if (kind === "in_parent_field") {
            const parent = this.parentOf(value.field, at(pointer, "field"));
            const parentAt = at(pointer, "parent_field");
            if (!people(this.fieldIn(parent, value.parent_field, parentAt))) {
                this.fail(parentAt, `${value.parent_field} is not a people field`);
            }
        }
        else if (kind === "in_group")
            this.parameter(value.group_id, "group_ref", at(pointer, "group_id"));
    }
    leaf(value, pointer) {
        if (!isObject(value))
            this.fail(pointer, "must be an object");
        if (value.kind === "field") {
            onlyMembers(value, CONFIG_MEMBERS.leaf_field, this.where, pointer);
            return this.filter(value.rule, at(pointer, "rule"), true);
        }
        if (value.kind !== "write")
            this.fail(at(pointer, "kind"), oneOf(["field", "write"]));
        onlyMembers(value, CONFIG_MEMBERS.leaf_write, this.where, pointer);
        const writeAt = at(pointer, "write");
        if (!isObject(value.write))
            this.fail(writeAt, "must be an object");
        const write = value.write;
        const op = write.op;
        if (!kindsOf("write").includes(op))
            this.fail(at(writeAt, "op"), oneOf(kindsOf("write")));
        onlyMembers(write, CONFIG_MEMBERS[`write.${op}`], this.where, writeAt);
        if ("negate" in write && typeof write.negate !== "boolean")
            this.fail(at(writeAt, "negate"), "true or false");
        if (op === "changed")
            this.own(write.field, at(writeAt, "field"));
        else if (op === "changed_any") {
            const fieldsAt = at(writeAt, "fields");
            this.array(write.fields, fieldsAt).forEach((field, i) => this.own(field, at(fieldsAt, i)));
        }
        else if (op === "was")
            this.filter(write.rule, at(writeAt, "rule"), false);
        else if (op === "actor")
            this.actor(write.test, at(writeAt, "test"));
    }
    rules(value, pointer) {
        const rules = this.array(value, pointer);
        if (rules.length > 50)
            this.fail(pointer, "at most 50 rules");
        const keys = new Set();
        rules.forEach((item, i) => {
            const here = at(pointer, i);
            const rule = this.object(item, here, CONFIG_MEMBERS.rules);
            if (typeof rule.key !== "string" || !KEY.test(rule.key))
                this.fail(at(here, "key"), "not a key");
            if (keys.has(rule.key))
                this.fail(at(here, "key"), `${rule.key} is the key of an earlier rule`);
            keys.add(rule.key);
            if ("name" in rule)
                this.text(rule.name, at(here, "name"), 120);
            this.text(rule.message, at(here, "message"), 300);
            if ("enabled" in rule && typeof rule.enabled !== "boolean")
                this.fail(at(here, "enabled"), "true or false");
            if ("field" in rule)
                this.own(rule.field, at(here, "field"));
            const conditionAt = at(here, "condition");
            const condition = this.object(rule.condition, conditionAt, CONFIG_MEMBERS.condition);
            if ("join" in condition && !["and", "or"].includes(condition.join)) {
                this.fail(at(conditionAt, "join"), oneOf(["and", "or"]));
            }
            const leavesAt = at(conditionAt, "leaves");
            const leaves = this.array(condition.leaves, leavesAt);
            if (leaves.length < 1 || leaves.length > 20)
                this.fail(leavesAt, "1 to 20 leaves");
            leaves.forEach((leaf, j) => this.leaf(leaf, at(leavesAt, j)));
        });
    }
    // A routing rule's `when` is JSONLogic, where every object applies exactly one operator; a rule's
    // `{ join, leaves }` builds as an object and the install refuses it. Which operators exist is the engine's to say.
    routingCondition(value, pointer, root = true) {
        if (Array.isArray(value))
            return value.forEach((item, i) => this.routingCondition(item, at(pointer, i), false));
        if (!isObject(value)) {
            if (root)
                this.fail(pointer, "must be an object");
            return;
        }
        const operators = Object.keys(value);
        if (operators.length !== 1) {
            const found = operators.length === 0 ? "none" : `${operators.length} (${[...operators].sort().join(", ")})`;
            const hint = "join" in value && "leaves" in value ? ": a rule's condition is written differently" : "";
            this.fail(pointer, `one JSONLogic operator, such as {"==": [{"var": "<field>"}, <value>]}, not ${found}${hint}`);
        }
        const [operator] = operators;
        this.routingCondition(value[operator], at(pointer, operator), false);
    }
    // Whether the entity's records take comments, and the condition that closes a thread. Posting a comment
    // writes nothing, so the condition reads fields only.
    comments(value, pointer) {
        const comments = this.object(value, pointer, CONFIG_MEMBERS.comments);
        if (typeof comments.enabled !== "boolean")
            this.fail(at(pointer, "enabled"), "true or false");
        if (!("closed_when" in comments))
            return;
        const conditionAt = at(pointer, "closed_when");
        const condition = this.object(comments.closed_when, conditionAt, CONFIG_MEMBERS.condition);
        if ("join" in condition && !["and", "or"].includes(condition.join)) {
            this.fail(at(conditionAt, "join"), oneOf(["and", "or"]));
        }
        const leavesAt = at(conditionAt, "leaves");
        const leaves = this.array(condition.leaves, leavesAt);
        if (leaves.length < 1 || leaves.length > 20)
            this.fail(leavesAt, "1 to 20 leaves");
        leaves.forEach((leaf, i) => {
            const here = at(leavesAt, i);
            if (!isObject(leaf))
                this.fail(here, "must be an object");
            if (leaf.kind !== "field")
                this.fail(at(here, "kind"), "a field leaf: posting a comment writes nothing, so a test about the write has nothing to read");
            onlyMembers(leaf, CONFIG_MEMBERS.leaf_field, this.where, here);
            this.filter(leaf.rule, at(here, "rule"), false);
        });
    }
    // The package entities in the order the package lists them, this one in its place, with the source each declares.
    sourced() {
        const all = new Map(this.entities).set(this.file.key, this.file);
        return [...all].flatMap(([key, entity]) => (isObject(entity.source) ? [[key, entity.source]] : []));
    }
    entityFile(key) {
        return key === this.file.key ? this.file : this.entities.get(key);
    }
    whereOf(key) {
        return key === this.file.key ? this.where : `entities/${key}.json`;
    }
    // The package entity an `${entity:key}` token names, if the package has it.
    entityRef(value) {
        const key = typeof value === "string" ? ENTITY.exec(value)?.[1] : undefined;
        return key !== undefined && (key === this.file.key || this.entities.has(key)) ? key : undefined;
    }
    required(value, members, pointer) {
        for (const member of members)
            if (!(member in value))
                this.fail(pointer, `${member} is required`);
    }
    sourcePath(value, pointer) {
        if (typeof value !== "string" || !SOURCE_PATH.test(value)) {
            this.fail(pointer, "a dotted path of lower-case names, with a leading ^ to read the parent record");
        }
    }
    sourceParts(value, pointer) {
        const parts = this.array(value, pointer);
        if (parts.length < 1)
            this.fail(pointer, "at least one key part");
        parts.forEach((part, i) => {
            if (typeof part !== "string" || !SOURCE_PART.test(part)) {
                this.fail(at(pointer, i), "a path, or an empty string for a part the stream leaves empty");
            }
        });
    }
    sourceKey(value, pointer) {
        if (typeof value !== "string" || !KEY.test(value))
            this.fail(pointer, "not a field key");
    }
    sourceEntity(value, pointer) {
        if (typeof value === "string" && ENTITY.test(value))
            return;
        const dependency = typeof value === "string" ? DEP_REFERENCE.exec(value)?.[1] : undefined;
        if (dependency === undefined)
            this.fail(pointer, "must be an ${entity:key} or a ${dep:package#entity:key}");
        if (!this.packages.has(dependency))
            this.fail(pointer, `${dependency} is not in the manifest's requires.packages`);
    }
    // The package id of a required package's entity a `${dep:…}` token names, if the package is required.
    depRef(value) {
        const id = typeof value === "string" ? DEP_REFERENCE.exec(value)?.[1] : undefined;
        return id !== undefined && this.packages.has(id) ? id : undefined;
    }
    copyShape(value, pointer) {
        const copy = this.object(value, pointer, CONFIG_MEMBERS.source_copy);
        this.required(copy, ["from"], pointer);
        this.sourcePath(copy.from, at(pointer, "from"));
        if (!("values" in copy))
            return;
        const valuesAt = at(pointer, "values");
        for (const [from, to] of Object.entries(this.record(copy.values, valuesAt))) {
            if (typeof to !== "string")
                this.fail(at(valuesAt, from), "must be a string");
        }
    }
    mappingShape(value, pointer) {
        const mapping = this.record(value, pointer);
        if ("ref" in mapping) {
            this.object(mapping, pointer, CONFIG_MEMBERS.source_ref);
            this.required(mapping, ["key"], pointer);
            this.sourceEntity(mapping.ref, at(pointer, "ref"));
            this.sourceParts(mapping.key, at(pointer, "key"));
            if ("line" in mapping)
                this.sourceParts(mapping.line, at(pointer, "line"));
        }
        else if ("items" in mapping) {
            this.object(mapping, pointer, CONFIG_MEMBERS.source_list);
            this.required(mapping, ["from"], pointer);
            this.sourcePath(mapping.from, at(pointer, "from"));
            const itemsAt = at(pointer, "items");
            const items = this.record(mapping.items, itemsAt);
            if (Object.keys(items).length === 0)
                this.fail(itemsAt, "at least one item");
            for (const [item, copy] of Object.entries(items)) {
                this.sourceKey(item, at(itemsAt, item));
                this.copyShape(copy, at(itemsAt, item));
            }
        }
        else
            this.copyShape(mapping, pointer);
    }
    fieldsShape(value, pointer) {
        for (const [key, mapping] of Object.entries(this.record(value, pointer))) {
            this.sourceKey(key, at(pointer, key));
            this.mappingShape(mapping, at(pointer, key));
        }
    }
    // The source as the package's object schema reads it.
    sourceShape(value, pointer) {
        const source = this.object(value, pointer, CONFIG_MEMBERS.source);
        this.required(source, ["connection", "stream", "fields", "on_delete"], pointer);
        if (typeof source.connection !== "string" || !PARAM.test(source.connection)) {
            this.fail(at(pointer, "connection"), "must be a ${param:key}");
        }
        if (typeof source.stream !== "string" || !STREAM.test(source.stream)) {
            this.fail(at(pointer, "stream"), "a stream name: lower-case letters, digits and underscores, from a letter");
        }
        this.fieldsShape(source.fields, at(pointer, "fields"));
        if ("lines" in source) {
            const linesAt = at(pointer, "lines");
            const lines = this.object(source.lines, linesAt, CONFIG_MEMBERS.source_lines);
            this.required(lines, ["entity", "from", "key", "parent", "fields"], linesAt);
            this.sourceEntity(lines.entity, at(linesAt, "entity"));
            this.sourcePath(lines.from, at(linesAt, "from"));
            this.sourceParts(lines.key, at(linesAt, "key"));
            this.sourceKey(lines.parent, at(linesAt, "parent"));
            this.fieldsShape(lines.fields, at(linesAt, "fields"));
        }
        const onDeleteAt = at(pointer, "on_delete");
        if (source.on_delete !== "delete") {
            if (!isObject(source.on_delete))
                this.fail(onDeleteAt, `"delete" or {"flag": a boolean field}`);
            this.object(source.on_delete, onDeleteAt, CONFIG_MEMBERS.source_flag);
            this.required(source.on_delete, ["flag"], onDeleteAt);
            this.sourceKey(source.on_delete.flag, at(onDeleteAt, "flag"));
        }
        return source;
    }
    // The connection an entity is read through, as the parameter token its source names: its own, or the one its
    // parent's source reads its lines through.
    connectionOf(key) {
        const own = this.entityFile(key)?.source;
        if (isObject(own) && typeof own.connection === "string")
            return own.connection;
        for (const [, source] of this.sourced()) {
            if (isObject(source.lines) && this.entityRef(source.lines.entity) === key && typeof source.connection === "string") {
                return source.connection;
            }
        }
        return undefined;
    }
    // The entity declares nothing that governs a write.
    ungoverned(key, parent) {
        const file = this.entityFile(key);
        const member = GOVERNING.find((name) => declares(name, file?.[name]));
        if (member === undefined)
            return;
        const why = parent === undefined ? "a source fills it" : `${parent}'s source fills it as lines`;
        refuse(this.whereOf(key), `/${member}`, `${key} declares ${member}, which governs writes the platform makes: ${why}`);
    }
    // The lines entity a source names: one the package has, which is not the entity, which no source of its own
    // fills and which no earlier source already fills. An entity of a required package is taken on trust, and comes
    // back as undefined.
    linesEntity(lines, pointer) {
        const entityAt = at(pointer, "entity");
        if (this.depRef(lines.entity) !== undefined)
            return undefined;
        const key = this.entityRef(lines.entity);
        if (key === undefined)
            return this.fail(entityAt, `${named(lines.entity)} is not an entity of the package`);
        if (key === this.file.key)
            this.fail(entityAt, `${key} cannot be its own lines entity`);
        if (isObject(this.entityFile(key)?.source))
            this.fail(entityAt, `${key} has a source of its own, so it is no lines entity`);
        for (const [other, source] of this.sourced()) {
            if (other === this.file.key)
                break;
            if (isObject(source.lines) && this.entityRef(source.lines.entity) === key) {
                this.fail(entityAt, `${key} is already the lines entity of ${other}'s source`);
            }
        }
        return key;
    }
    // Every mapping writes a field of `entity` that the mapping's kind can write. `hasParent` is whether a path
    // may read the parent record, which only a line has.
    // The fields of an entity of a required package are not known (`entity` is undefined), so only what does not
    // depend on them is checked.
    sourceMappings(mappings, entity, pointer, hasParent) {
        for (const [key, mapping] of Object.entries(this.record(mappings, pointer))) {
            const here = at(pointer, key);
            const field = entity === undefined ? undefined : this.declared(entity).get(key) ?? this.fail(here, `${key} is not a field of ${entity}`);
            const body = this.record(mapping, here);
            if ("ref" in body)
                this.sourceRef(body, field, here, hasParent);
            else if ("items" in body)
                this.sourceList(body, field, here, hasParent);
            else
                this.sourceCopy(body, field, here, hasParent);
        }
    }
    sourceRef(mapping, field, pointer, hasParent) {
        const refAt = at(pointer, "ref");
        const target = this.entityRef(mapping.ref);
        const dependency = this.depRef(mapping.ref);
        if (target === undefined && dependency === undefined)
            this.fail(refAt, `${named(mapping.ref)} is not an entity of the package`);
        if (field !== undefined) {
            const key = field.key;
            const targets = field.target_entity_id === undefined ? dependency !== undefined : field.target_entity_id === mapping.ref;
            if (field.type !== "reference" || !targets)
                this.fail(refAt, `${key} is not a reference to ${target ?? named(mapping.ref)}`);
            if (field.required === true)
                this.fail(pointer, `${key} is required, and a source writes a reference after its record`);
        }
        if (target !== undefined && this.connectionOf(target) !== this.connectionOf(this.file.key)) {
            this.fail(refAt, `${target} is not read through the same connection as ${this.file.key}`);
        }
        if (hasParent)
            return;
        if (mapping.key.some(readsParent))
            this.fail(at(pointer, "key"), "reads from the parent record, which only a line has");
        if ((mapping.line ?? []).some(readsParent))
            this.fail(at(pointer, "line"), "reads from the parent record, which only a line has");
    }
    sourceList(mapping, field, pointer, hasParent) {
        const itemsAt = at(pointer, "items");
        if (field !== undefined && field.type !== "list")
            this.fail(itemsAt, `${field.key} is not a list field`);
        if (!hasParent && readsParent(mapping.from))
            this.fail(at(pointer, "from"), "reads from the parent record, which only a line has");
        const columns = field !== undefined && Array.isArray(field.item_fields) ? field.item_fields : [];
        for (const [item, copy] of Object.entries(mapping.items)) {
            const itemAt = at(itemsAt, item);
            let column;
            if (field !== undefined) {
                const found = columns.find((c) => isObject(c) && c.key === item);
                if (!isObject(found))
                    this.fail(itemAt, `${item} is not an item of ${field.key}`);
                column = found;
            }
            this.sourceCopy(copy, column, itemAt, false);
        }
    }
    // A copy writes a value of a type that pairs with its field's, and an enum copy maps onto options the field has.
    sourceCopy(mapping, field, pointer, hasParent) {
        const key = field?.key;
        if (field !== undefined && !COPY_TYPES.includes(field.type)) {
            this.fail(at(pointer, "from"), `${key} is ${/^[aeio]/.test(field.type) ? "an" : "a"} ${field.type} field, which no source copies into`);
        }
        if (!hasParent && readsParent(mapping.from))
            this.fail(at(pointer, "from"), "reads from the parent record, which only a line has");
        if (field === undefined || !isObject(mapping.values))
            return;
        const valuesAt = at(pointer, "values");
        if (field.type !== "enum")
            this.fail(valuesAt, `${key} is not an enum field`);
        const options = enumValues(field);
        for (const [from, to] of Object.entries(mapping.values)) {
            if (typeof to !== "string" || !options.has(to))
                this.fail(at(valuesAt, from), `${named(to)} is not a value of ${key}`);
        }
    }
    sourceLines(lines, entity, pointer) {
        if (entity !== undefined) {
            const parent = this.declared(entity).get(lines.parent);
            if (parent?.type !== "reference" || parent.target_entity_id !== `\${entity:${this.file.key}}`) {
                this.fail(at(pointer, "parent"), `${named(lines.parent)} is not a reference from ${entity} to ${this.file.key}`);
            }
        }
        if (readsParent(lines.from))
            this.fail(at(pointer, "from"), "a list of lines is read from the record, not from its parent");
        this.sourceMappings(lines.fields, entity, at(pointer, "fields"), true);
    }
    missing(value, members, pointer) {
        for (const member of members)
            if (!(member in value))
                this.fail(at(pointer, member), "is required");
    }
    // The entity an extension extends: an export of a required package whose entry in `requires.packages` declares
    // access to it. Read access is enough.
    extensionTarget(value, pointer, access) {
        const match = typeof value === "string" ? DEP_REFERENCE.exec(value) : null;
        if (match === null)
            this.fail(pointer, "must be a ${dep:package#entity:key}");
        const [, id, entity] = match;
        if (!KEY.test(entity))
            this.fail(pointer, `${entity} is not an entity key`);
        const declared = access.get(id);
        if (declared === undefined)
            this.fail(pointer, `${id} is not in the manifest's requires.packages`);
        if (!declared.has(`entity:${entity}`))
            this.fail(pointer, `${id} declares no access to entity:${entity} in requires.packages`);
    }
    // An extension's field: inline, of a type a source copies into, and written only by that source, so never
    // required and with no formula or default.
    extensionField(value, pointer) {
        const field = this.object(value, pointer, CONFIG_MEMBERS.extension_field);
        this.missing(field, ["key", "type"], pointer);
        this.sourceKey(field.key, at(pointer, "key"));
        if (!COPY_TYPES.includes(field.type))
            this.fail(at(pointer, "type"), oneOf(COPY_TYPES));
        for (const member of ["label", "description"]) {
            if (member in field && typeof field[member] !== "string")
                this.fail(at(pointer, member), "a string, or leave it out");
        }
        if ("recommendedSecured" in field && typeof field.recommendedSecured !== "boolean") {
            this.fail(at(pointer, "recommendedSecured"), "true or false");
        }
        const optionsAt = at(pointer, "enum_values");
        if (field.type !== "enum") {
            if ("enum_values" in field)
                this.fail(optionsAt, `${field.key} is not an enum field`);
            return field;
        }
        if (!Array.isArray(field.enum_values) || field.enum_values.length === 0) {
            this.fail(optionsAt, `${field.key} is an enum field: it needs at least one option`);
        }
        field.enum_values.forEach((option, i) => {
            if (typeof option === "string")
                return;
            const here = at(optionsAt, i);
            const body = this.object(option, here, CONFIG_MEMBERS.enum_option);
            if (typeof body.value !== "string")
                this.fail(at(here, "value"), "a string");
            for (const member of ["label", "color"]) {
                if (member in body && typeof body[member] !== "string")
                    this.fail(at(here, member), "a string, or leave it out");
            }
        });
        return field;
    }
    // An extension copies a custom field of the record the target holds, and nothing else.
    customPath(value, pointer) {
        if (typeof value !== "string" || !value.startsWith(CUSTOM_PREFIX) || !KEY.test(value.slice(CUSTOM_PREFIX.length))) {
            this.fail(pointer, "must be custom.<key>, a custom field of the record the target holds, with a key of lower-case letters, digits and single underscores");
        }
    }
    // The extension as the package's object schema and verification read it: its four members and no others, a
    // target of a required package, inline fields, and one copy of a `custom.<key>` path for each field and for
    // nothing else. It is not built from `sourceShape`: an extension has no connection, stream, lines or on_delete.
    extensionShape(value, stem, access) {
        const extension = this.object(value, "", CONFIG_MEMBERS.entity_extension);
        this.missing(extension, CONFIG_MEMBERS.entity_extension, "");
        if (typeof extension.key !== "string" || !KEY.test(extension.key))
            this.fail("/key", "not a key");
        if (extension.key !== stem)
            this.fail("/key", `is ${extension.key}, not ${stem}`);
        this.extensionTarget(extension.extends, "/extends", access);
        const fieldsAt = "/fields";
        const list = this.array(extension.fields, fieldsAt);
        if (list.length === 0)
            this.fail(fieldsAt, "at least one field");
        const fields = new Map();
        list.forEach((item, i) => {
            const field = this.extensionField(item, at(fieldsAt, i));
            const key = field.key;
            if (fields.has(key))
                this.fail(at(at(fieldsAt, i), "key"), `${key} is the key of an earlier field`);
            fields.set(key, field);
        });
        const source = this.object(extension.source, "/source", CONFIG_MEMBERS.extension_source);
        this.missing(source, CONFIG_MEMBERS.extension_source, "/source");
        const mappingsAt = "/source/fields";
        const mappings = this.record(source.fields, mappingsAt);
        if (Object.keys(mappings).length === 0)
            this.fail(mappingsAt, "at least one mapping");
        for (const [key, mapping] of Object.entries(mappings)) {
            const here = at(mappingsAt, key);
            const field = fields.get(key) ?? this.fail(here, `${key} is not a field of the extension`);
            const copy = this.record(mapping, here);
            if ("ref" in copy || "items" in copy)
                this.fail(here, "an extension copies a value: it maps no reference and no list");
            this.copyShape(copy, here);
            this.customPath(copy.from, at(here, "from"));
            this.sourceCopy(copy, field, here, false);
        }
        list.forEach((item, i) => {
            const key = item.key;
            if (!Object.hasOwn(mappings, key))
                this.fail(at(fieldsAt, i), `${key} has no mapping in source.fields`);
        });
    }
    // The source an entity is synced from, as the platform's package verification reads it. The returned value is
    // not translated.
    source(value, pointer) {
        const me = this.file.key;
        // Verification reads every body against the schema before any invariant, so another entity's malformed source
        // is reported at its own file, not as a connection or a field it fails to give this one.
        for (const [key, other] of this.sourced()) {
            if (key !== me)
                new Invariants(this.entityFile(key), this.params, this.entities, this.whereOf(key), this.connections, this.packages).sourceShape(other, pointer);
        }
        const source = this.sourceShape(value, pointer);
        this.parameter(source.connection, "connection_ref", at(pointer, "connection"));
        checkConnectionUse(this.connections, "source", PARAM.exec(source.connection)[1], this.where, at(pointer, "connection"));
        const lines = isObject(source.lines) ? source.lines : undefined;
        const linesAt = at(pointer, "lines");
        const target = lines === undefined ? undefined : this.linesEntity(lines, linesAt);
        this.ungoverned(me);
        if (target !== undefined)
            this.ungoverned(target, me);
        for (const [other, earlier] of this.sourced()) {
            if (other === me)
                break;
            if (earlier.connection === source.connection && earlier.stream === source.stream) {
                this.fail(at(pointer, "stream"), `${other} already reads stream ${source.stream} through this connection`);
            }
        }
        this.sourceMappings(source.fields, me, at(pointer, "fields"), false);
        if (lines !== undefined)
            this.sourceLines(lines, target, linesAt);
        if (isObject(source.on_delete)) {
            const flag = this.declared(me).get(source.on_delete.flag);
            if (flag?.type !== "boolean") {
                this.fail(at(at(pointer, "on_delete"), "flag"), `${named(source.on_delete.flag)} is not a boolean field of ${me}`);
            }
        }
    }
    stageModel(value, pointer) {
        const model = this.object(value, pointer, CONFIG_MEMBERS.stage_model);
        const status = model.status_field;
        const values = this.ownEnum(status, at(pointer, "status_field"));
        if ("initial_statuses" in model) {
            const initialAt = at(pointer, "initial_statuses");
            this.array(model.initial_statuses, initialAt).forEach((s, i) => this.valueOf(values, status, s, at(initialAt, i)));
        }
        const transitionsAt = at(pointer, "transitions");
        this.array(model.transitions, transitionsAt).forEach((item, i) => {
            const here = at(transitionsAt, i);
            const transition = this.object(item, here, CONFIG_MEMBERS.transition);
            this.valueOf(values, status, transition.from, at(here, "from"));
            this.valueOf(values, status, transition.to, at(here, "to"));
            if ("required_fields" in transition) {
                const requiredAt = at(here, "required_fields");
                this.array(transition.required_fields, requiredAt).forEach((f, j) => this.own(f, at(requiredAt, j)));
            }
            if ("movers" in transition) {
                const moversAt = at(here, "movers");
                this.array(transition.movers, moversAt).forEach((m, j) => this.actor(m, at(moversAt, j)));
            }
        });
    }
    work(value, pointer) {
        const parts = CONFIG_MEMBERS.work;
        const work = this.object(value, pointer, parts);
        if (Object.keys(work).length === 0)
            this.fail(pointer, `names at least one of ${WORK_CONTRACTS.join(", ")}`);
        for (const [part, needs] of [["assignable", "lifecycle"], ["work_surface", "assignable"], ["deadline", "lifecycle"], ["module_page", "work_surface"]]) {
            if (part in work && !(needs in work))
                this.fail(at(pointer, part), `needs work.${needs}`);
        }
        if ("module_page" in work) {
            const page = work.module_page;
            const rest = typeof page === "string" ? page.replace(RECORD_ID_PLACEHOLDER, "") : "";
            if (typeof page !== "string" || !page.startsWith("/") || rest.includes("{{") || rest.includes("}}")) {
                this.fail(at(pointer, "module_page"), `a module path such as /items/${RECORD_ID_PLACEHOLDER}`);
            }
        }
        if (!("lifecycle" in work))
            return;
        const lifecycleAt = at(pointer, "lifecycle");
        const lifecycle = this.object(work.lifecycle, lifecycleAt, CONFIG_MEMBERS.lifecycle);
        const status = lifecycle.status_field;
        const statuses = this.ownEnum(status, at(lifecycleAt, "status_field"));
        const categoriesAt = at(lifecycleAt, "categories");
        const categories = this.record(lifecycle.categories, categoriesAt);
        for (const [value, category] of Object.entries(categories)) {
            if (!CATEGORIES.includes(category))
                this.fail(at(categoriesAt, value), oneOf(CATEGORIES));
        }
        const categorized = Object.keys(categories);
        if (categorized.length !== statuses.size || !categorized.every((v) => statuses.has(v))) {
            this.fail(categoriesAt, `must name exactly the values of ${status}`);
        }
        const statusList = (list, listAt) => this.array(list, listAt).forEach((s, i) => this.valueOf(statuses, status, s, at(listAt, i)));
        if ("assignable" in work)
            this.assignableOf(work.assignable, at(pointer, "assignable"), statusList);
        if ("work_surface" in work) {
            const surfaceAt = at(pointer, "work_surface");
            const surface = this.object(work.work_surface, surfaceAt, CONFIG_MEMBERS.work_surface);
            if ("priority" in surface) {
                const priorityAt = at(surfaceAt, "priority");
                const priority = this.object(surface.priority, priorityAt, CONFIG_MEMBERS.priority);
                const options = this.ownEnum(priority.field, at(priorityAt, "field"));
                if ("values" in priority) {
                    const valuesAt = at(priorityAt, "values");
                    const values = this.record(priority.values, valuesAt);
                    for (const [option, mapped] of Object.entries(values)) {
                        this.valueOf(options, priority.field, option, at(valuesAt, option));
                        if (!PRIORITIES.includes(mapped))
                            this.fail(at(valuesAt, option), oneOf(PRIORITIES));
                    }
                }
            }
        }
        if ("deadline" in work)
            this.deadline(work.deadline, at(pointer, "deadline"), statusList);
    }
    assignableOf(value, pointer, statusList) {
        const assignable = this.object(value, pointer, CONFIG_MEMBERS.assignable);
        if ("claim" in assignable && !["candidates", "readers"].includes(assignable.claim)) {
            this.fail(at(pointer, "claim"), oneOf(["candidates", "readers"]));
        }
        if (!("rules" in assignable))
            return;
        const rulesAt = at(pointer, "rules");
        const rules = this.array(assignable.rules, rulesAt);
        if (rules.length > 50)
            this.fail(rulesAt, "at most 50 rules");
        rules.forEach((item, i) => {
            const here = at(rulesAt, i);
            const rule = this.object(item, here, CONFIG_MEMBERS.assign_rule);
            const onAt = at(here, "on");
            if (isObject(rule.on)) {
                onlyMembers(rule.on, CONFIG_MEMBERS.assign_on, this.where, onAt);
                const enter = rule.on.enter;
                if (!Array.isArray(enter) || enter.length === 0)
                    this.fail(at(onAt, "enter"), "a list of one or more statuses");
                statusList(enter, at(onAt, "enter"));
            }
            else if (rule.on !== "start")
                this.fail(onAt, `"start" or {"enter": [statuses]}`);
            if ("when" in rule)
                this.routingCondition(rule.when, at(here, "when"));
            const assignAt = at(here, "assign");
            const assign = this.array(rule.assign, assignAt);
            if (assign.length < 1 || assign.length > 50)
                this.fail(assignAt, "1 to 50 assignees");
            assign.forEach((assignee, j) => this.assignee(assignee, at(assignAt, j), true));
        });
    }
    assignee(value, pointer, mayBeDynamic) {
        if (!isObject(value))
            this.fail(pointer, "must be an object");
        const kinds = mayBeDynamic ? ["user", "group", "unit", "dynamic"] : ["user", "group", "unit"];
        if (!kinds.includes(value.kind))
            this.fail(at(pointer, "kind"), oneOf(kinds));
        if (value.kind === "user" || value.kind === "group") {
            onlyMembers(value, CONFIG_MEMBERS.assignee_principal, this.where, pointer);
            return this.parameter(value.id, `${value.kind}_ref`, at(pointer, "id"));
        }
        if (value.kind === "unit") {
            onlyMembers(value, CONFIG_MEMBERS.assignee_unit, this.where, pointer);
            const anchorAt = at(pointer, "anchor");
            const anchor = this.object(value.anchor, anchorAt, CONFIG_MEMBERS.anchor);
            if (anchor.type !== "fixed")
                this.fail(at(anchorAt, "type"), oneOf(["fixed"]));
            this.parameter(anchor.unit_id, "unit_ref", at(anchorAt, "unit_id"));
            if ("reach" in value && !["unit", "subtree"].includes(value.reach))
                this.fail(at(pointer, "reach"), oneOf(["unit", "subtree"]));
            if ("group" in value)
                this.parameter(value.group, "group_ref", at(pointer, "group"));
            return;
        }
        onlyMembers(value, CONFIG_MEMBERS.assignee_dynamic, this.where, pointer);
        const sourceAt = at(pointer, "source");
        if (!isObject(value.source))
            this.fail(sourceAt, "must be an object");
        const source = value.source;
        let field;
        if (source.type === "creator")
            onlyMembers(source, CONFIG_MEMBERS.source_creator, this.where, sourceAt);
        else if (source.type === "field") {
            onlyMembers(source, CONFIG_MEMBERS.source_field, this.where, sourceAt);
            field = this.declaredOwn(source.key, at(sourceAt, "key"));
            if (!routes(field))
                this.fail(at(sourceAt, "key"), `${source.key} is not a field work can be routed through`);
        }
        else
            this.fail(at(sourceAt, "type"), oneOf(["creator", "field"]));
        if ("relation" in value) {
            const relationAt = at(pointer, "relation");
            if (!isObject(value.relation))
                this.fail(relationAt, "must be an object");
            const relation = value.relation;
            if (relation.type === "direct")
                onlyMembers(relation, CONFIG_MEMBERS.relation_direct, this.where, relationAt);
            else if (relation.type === "manager") {
                onlyMembers(relation, CONFIG_MEMBERS.relation_manager, this.where, relationAt);
                const levels = relation.levels;
                if (!Number.isInteger(levels) || levels < 1 || levels > 5) {
                    this.fail(at(relationAt, "levels"), "a whole number from 1 to 5");
                }
                if (field && !(field.type === "reference" && field.target_entity_id === USERS)) {
                    this.fail(relationAt, "a manager is read through a single reference to a user");
                }
            }
            else
                this.fail(at(relationAt, "type"), oneOf(["direct", "manager"]));
        }
        if ("fallback" in value) {
            const fallbackAt = at(pointer, "fallback");
            const fallback = this.array(value.fallback, fallbackAt);
            if (fallback.length > 50)
                this.fail(fallbackAt, "at most 50 assignees");
            fallback.forEach((item, i) => this.assignee(item, at(fallbackAt, i), false));
        }
    }
    deadline(value, pointer, statusList) {
        const deadline = this.object(value, pointer, CONFIG_MEMBERS.deadline);
        const clocksAt = at(pointer, "clocks");
        const clocks = this.array(deadline.clocks, clocksAt);
        if (clocks.length < 1 || clocks.length > 5)
            this.fail(clocksAt, "1 to 5 clocks");
        clocks.forEach((item, i) => {
            const here = at(clocksAt, i);
            const clock = this.object(item, here, CONFIG_MEMBERS.clock);
            if (typeof clock.key !== "string" || !CLOCK_KEY.test(clock.key))
                this.fail(at(here, "key"), "not a clock key");
            this.text(clock.label, at(here, "label"), 80);
            const startAt = at(here, "start");
            if (!isObject(clock.start))
                this.fail(startAt, "must be an object");
            if (clock.start.on === "work_start")
                onlyMembers(clock.start, CONFIG_MEMBERS.clock_start_work, this.where, startAt);
            else if (clock.start.on === "enter") {
                onlyMembers(clock.start, CONFIG_MEMBERS.clock_start_enter, this.where, startAt);
                statusList(clock.start.statuses, at(startAt, "statuses"));
            }
            else
                this.fail(at(startAt, "on"), oneOf(["work_start", "enter"]));
            if ("pause_in" in clock)
                statusList(clock.pause_in, at(here, "pause_in"));
            if ("stop" in clock) {
                const stopAt = at(here, "stop");
                const stop = this.object(clock.stop, stopAt, CONFIG_MEMBERS.clock_stop);
                if ("statuses" in stop)
                    statusList(stop.statuses, at(stopAt, "statuses"));
                if ("field" in stop)
                    this.declaredOwn(stop.field, at(stopAt, "field"));
            }
            this.parameter(clock.sla_policy, "sla_policy_ref", at(here, "sla_policy"));
            if ("escalation_policy" in clock)
                this.parameter(clock.escalation_policy, "escalation_policy_ref", at(here, "escalation_policy"));
        });
    }
    // One record scope of a grant on this entity, as the platform's package verification reads it.
    recordScope(operation, value, pointer) {
        const scope = this.object(value, pointer, CONFIG_MEMBERS.record_scope);
        const kind = scope.kind;
        if (!kindsOf("record_scope").includes(kind))
            this.fail(at(pointer, "kind"), oneOf(kindsOf("record_scope")));
        onlyMembers(scope, CONFIG_MEMBERS[`record_scope.${kind}`], this.where, pointer);
        if (operation === "create" && kind !== "parent_field")
            this.fail(pointer, "on create only a parent_field scope");
        const fieldAt = at(pointer, "field");
        if (kind === "work") {
            if (!this.assignable)
                this.fail(at(pointer, "kind"), "a work scope needs work.assignable");
        }
        else if (kind === "field") {
            if (!people(this.declaredOwn(scope.field, fieldAt))) {
                this.fail(fieldAt, `${scope.field} is not a people field of ${this.file.key}`);
            }
        }
        else {
            const parent = this.parentOf(scope.field, fieldAt);
            const parentAt = at(pointer, "parent_field");
            const declared = typeof scope.parent_field === "string" ? this.declared(parent).get(scope.parent_field) : undefined;
            if (!declared || !people(declared)) {
                this.fail(parentAt, `${named(scope.parent_field)} is not a people field of ${parent}`);
            }
        }
        return { ...scope };
    }
    // No own field may take a key the entity's work seeds.
    seededClash() {
        const seeded = seededFields(this.file.work);
        const fields = Array.isArray(this.file.fields) ? this.file.fields : [];
        fields.forEach((field, i) => {
            if (isObject(field) && seeded.has(field.key))
                this.fail(at(at("/fields", i), "key"), `${field.key} is a field the work seeds`);
        });
    }
}
// The entity's rules, stage model, work, comments and source, checked as the platform's package verification
// checks them and translated. Only the members the entity declares come back. The source is checked first, as
// verification does: an entity it fills declares no rule, model or work, and says so before they are read.
export function entityInvariants(file, params, entities, where, connections = new Map(), packages = new Set()) {
    const check = new Invariants(file, params, entities, where, connections, packages);
    const out = {};
    if (file.source !== undefined)
        check.source(file.source, "/source");
    if (file.work !== undefined) {
        check.work(file.work, "/work");
        check.seededClash();
    }
    if (file.rules !== undefined)
        check.rules(file.rules, "/rules");
    if (file.stage_model !== undefined)
        check.stageModel(file.stage_model, "/stage_model");
    if (file.comments !== undefined)
        check.comments(file.comments, "/comments");
    if (file.rules !== undefined)
        out.rules = translate(file.rules, where, "/rules");
    if (file.stage_model !== undefined)
        out.stage_model = translate(file.stage_model, where, "/stage_model");
    if (file.work !== undefined)
        out.work = translate(file.work, where, "/work");
    if (file.comments !== undefined)
        out.comments = translate(file.comments, where, "/comments");
    if (file.source !== undefined)
        out.source = translate(file.source, where, "/source");
    return out;
}
// The first platform month whose builds read an entity extension; an older one refuses the kind at upload.
export const EXTENSIONS_PLATFORM = "2026.11";
// An extension body, checked as the platform's package verification checks it and translated: its target comes
// back as a `@dep:` sentinel. `stem` is the file's name without `.json`, which the extension's key must be.
export function extensionBody(file, stem, where, access) {
    new Invariants({ key: stem, fields: [] }, new Map(), new Map(), where).extensionShape(file, stem, access);
    return translate(file, where, "");
}
// Refuses an entity's work.module_page in a package without ui.
export function checkModulePage(file, hasUi, where) {
    if (!hasUi && isObject(file.work) && "module_page" in file.work)
        refuse(where, "/work/module_page", "needs the package's ui");
}
export function grantRecordScope(file, entities, where, operation, scope, pointer) {
    return new Invariants(file, new Map(), entities, where).recordScope(operation, scope, pointer);
}
//# sourceMappingURL=invariants.js.map