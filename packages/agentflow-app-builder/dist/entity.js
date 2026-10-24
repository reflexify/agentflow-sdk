import path from "node:path";
import { at, clip, isObject, onlyMembers, parameterOf, readJson, refuse, targetEntity, translate } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
import { checkFilterRule } from "./view-filters.js";
import { entityInvariants, fieldKeysOf, grantRecordScope } from "./invariants.js";
const OPERATIONS = ["read", "list", "create", "update", "delete", "assign"];
const FIELD_MEMBERS = new Set(CONFIG_MEMBERS.field);
const ACCESS_MODES = ["everyone", "restricted"];
const ON_TARGET_DELETE = ["restrict", "clear", "cascade"];
const COLUMN_TYPES = ["text", "number", "boolean", "date", "enum"];
const VIEW_TYPES = ["grid", "kanban", "calendar", "gallery", "timeline", "map", "inbox", "detail"];
export function fieldBody(entityKey, field, where, pointer) {
    for (const member of Object.keys(field)) {
        if (!FIELD_MEMBERS.has(member))
            refuse(where, at(pointer, member), "not a member the package's entity_field lists");
    }
    const { key, ...rest } = field;
    const stated = (member) => at(pointer, member);
    if (typeof key !== "string" || key === "")
        refuse(where, stated("key"), "a non-empty string");
    if ("on_target_delete" in rest && !ON_TARGET_DELETE.includes(rest.on_target_delete)) {
        refuse(where, stated("on_target_delete"), `one of ${ON_TARGET_DELETE.join(", ")}`);
    }
    if ("item_fields" in rest) {
        if (!Array.isArray(rest.item_fields))
            refuse(where, stated("item_fields"), "must be an array");
        rest.item_fields.forEach((column, i) => {
            const columnAt = at(stated("item_fields"), i);
            if (!isObject(column))
                refuse(where, columnAt, "must be an object");
            onlyMembers(column, CONFIG_MEMBERS.column, where, columnAt);
            if (!COLUMN_TYPES.includes(column.type))
                refuse(where, at(columnAt, "type"), `one of ${COLUMN_TYPES.join(", ")}`);
        });
    }
    for (const [member, allowed] of [["constraints", CONFIG_MEMBERS.constraints], ["rollup", CONFIG_MEMBERS.rollup]]) {
        if (!(member in rest))
            continue;
        if (!isObject(rest[member]))
            refuse(where, stated(member), "must be an object");
        onlyMembers(rest[member], allowed, where, stated(member));
    }
    return [`entity_field:${entityKey}/${key}`, translate(rest, where, pointer, { target_entity_id: targetEntity })];
}
// `sources` maps each entity of the package to its file, which a filter through a reference is checked against.
function checkPresets(config, surface, pointer) {
    if (!Array.isArray(config.presets))
        return;
    config.presets.forEach((preset, i) => {
        if (!isObject(preset) || !Array.isArray(preset.rules))
            return;
        const rulesAt = at(at(at(pointer, "presets"), i), "rules");
        preset.rules.forEach((rule, j) => checkFilterRule(rule, surface, at(rulesAt, j)));
    });
}
export function viewBody(entityKey, view, file, where, pointer, sources = new Map()) {
    onlyMembers(view, CONFIG_MEMBERS.view, where, pointer);
    const stated = (member) => at(pointer, member);
    if (typeof view.key !== "string" || view.key === "")
        refuse(where, stated("key"), "a non-empty string");
    const type = view.type ?? "grid";
    if (!VIEW_TYPES.includes(type))
        refuse(where, stated("type"), `a view type the builder has no rule for: ${clip(String(type))}`);
    const body = { name: view.name };
    if ("description" in view)
        body.description = view.description;
    body.type = type;
    if ("config" in view) {
        if (!isObject(view.config))
            refuse(where, stated("config"), "must be an object");
        checkPresets(view.config, { entityKey, file, sources, where, preset: true }, stated("config"));
        body.config = translate(view.config, where, stated("config"));
    }
    if ("columns" in view) {
        if (!Array.isArray(view.columns))
            refuse(where, stated("columns"), "must be an array");
        const known = fieldKeysOf(file);
        view.columns.forEach((column, i) => {
            const columnAt = at(stated("columns"), i);
            if (typeof column !== "string")
                refuse(where, columnAt, "must be a field key");
            if (!known.has(column))
                refuse(where, columnAt, `${clip(column)} is not a field of ${entityKey}`);
        });
        body.columns = view.columns;
    }
    if ("filters" in view) {
        if (!Array.isArray(view.filters))
            refuse(where, stated("filters"), "must be an array");
        view.filters.forEach((filter, i) => {
            if (!isObject(filter))
                refuse(where, at(stated("filters"), i), "must be an object");
            checkFilterRule(filter, { entityKey, file, sources, where, preset: false }, at(stated("filters"), i));
        });
        body.filters = translate(view.filters, where, stated("filters"));
    }
    if ("sort" in view && !isObject(view.sort))
        refuse(where, stated("sort"), "must be an object");
    body.sort = "sort" in view ? translate(view.sort, where, stated("sort")) : { key: "updated_at", dir: "desc" };
    return [`entity_view:${entityKey}/${view.key}`, body];
}
export function xEntity(entities) {
    return (value, where, pointer) => {
        if (value === "user" || value === "org_unit")
            return `@req.key:entity:${value}`;
        if (entities.includes(value))
            return `@obj.key:entity:${value}`;
        return refuse(where, pointer, `x-entity names ${clip(String(value))}, which is not an entity of the package`);
    };
}
// `params` maps each manifest parameter to its type; when given, a group grant must name a group_ref.
export function entityGrants(file, entityKey, where, entities = new Map(), params) {
    const grants = [];
    const known = new Map([...entities, [entityKey, file]]);
    let everyoneAt;
    (file.access.grants ?? []).forEach((grant, i) => {
        const here = `/access/grants/${i}`;
        const principalAt = at(here, "principal");
        onlyMembers(grant, CONFIG_MEMBERS.grant, where, here);
        onlyMembers(grant.principal ?? {}, CONFIG_MEMBERS.principal, where, principalAt);
        const kind = grant.principal?.kind;
        if (kind !== "group" && kind !== "everyone")
            refuse(where, principalAt, "a package grants to a group or everyone only");
        if ("design" in grant && grant.design !== false)
            refuse(where, at(here, "design"), "a package grant never carries design authority");
        let to = "everyone";
        let recipient = "everyone";
        if (kind === "group") {
            const idAt = at(principalAt, "id");
            to = parameterOf(grant.principal.id, where, idAt);
            const parameter = to.slice("@param:".length);
            if (params && params.get(parameter) !== "group_ref")
                refuse(where, idAt, `${parameter} is not a group_ref parameter`);
            recipient = to.slice("@param:".length).replace(/_group_id$/, "");
        }
        else {
            if ("id" in grant.principal)
                refuse(where, at(principalAt, "id"), "an Everyone grant names no id");
            if (everyoneAt !== undefined)
                refuse(where, here, `a second Everyone grant on ${entityKey}`);
            everyoneAt = here;
        }
        if (!Array.isArray(grant.operations) || grant.operations.length === 0) {
            refuse(where, at(here, "operations"), "an array of at least one operation");
        }
        const operations = {};
        const recordScopes = {};
        const listed = new Set();
        grant.operations.forEach((op, j) => {
            const opAt = at(at(here, "operations"), j);
            if (!isObject(op))
                refuse(where, opAt, "must be an object");
            onlyMembers(op, CONFIG_MEMBERS.operation, where, opAt);
            if (!OPERATIONS.includes(op.operation))
                refuse(where, at(opAt, "operation"), `one of ${OPERATIONS.join(", ")}`);
            const name = op.operation;
            if (listed.has(name))
                refuse(where, opAt, `operation ${name} is listed twice`);
            listed.add(name);
            if (!("scope" in op) && !("record_scopes" in op))
                refuse(where, opAt, "an operation needs a scope, record_scopes or both");
            if ("scope" in op)
                operations[name] = translate(op.scope, where, at(opAt, "scope"));
            if ("record_scopes" in op) {
                const scopesAt = at(opAt, "record_scopes");
                if (!Array.isArray(op.record_scopes) || op.record_scopes.length === 0)
                    refuse(where, scopesAt, "an array of at least one scope");
                recordScopes[name] = op.record_scopes.map((scope, k) => grantRecordScope(file, known, where, name, scope, at(scopesAt, k)));
            }
        });
        const out = { key: `${entityKey}_${recipient}`, to, entity: `@obj:entity:${entityKey}` };
        if (Object.keys(operations).length > 0)
            out.operations = operations;
        if (Object.keys(recordScopes).length > 0)
            out.record_scopes = recordScopes;
        grants.push(out);
    });
    return grants;
}
export const entitySource = (configDir, entityKey) => readJson(path.join(configDir, `entities/${entityKey}.json`));
// `params` maps each manifest parameter to its type and `sources` each entity of the package to its file,
// which the entity's rules, stage model and work are checked against.
export function entityObjects(configDir, entityKey, entities, params = new Map(), sources = new Map()) {
    const where = `entities/${entityKey}.json`;
    const file = sources.get(entityKey) ?? entitySource(configDir, entityKey);
    if (!isObject(file))
        refuse(where, "", "must be an object");
    onlyMembers(file, CONFIG_MEMBERS.entity, where, "");
    if (file.key !== entityKey)
        refuse(where, "/key", `is ${file.key}, not ${entityKey}`);
    if (typeof file.name !== "string" || file.name === "")
        refuse(where, "/name", "a non-empty string");
    if (!Array.isArray(file.fields))
        refuse(where, "/fields", "an array of fields");
    if (!Array.isArray(file.views))
        refuse(where, "/views", "an array of views");
    if (!isObject(file.access))
        refuse(where, "/access", "an object with a mode and grants");
    onlyMembers(file.access, CONFIG_MEMBERS.access, where, "/access");
    if (!ACCESS_MODES.includes(file.access.mode))
        refuse(where, "/access/mode", `one of ${ACCESS_MODES.join(", ")}`);
    if ("grants" in file.access && !Array.isArray(file.access.grants))
        refuse(where, "/access/grants", "must be an array");
    const objects = [];
    const fieldKeys = [];
    const fields = [];
    file.fields.forEach((field, i) => {
        const here = at("/fields", i);
        const entry = fieldBody(entityKey, field, where, here);
        fieldKeys.push(`@obj:${entry[0]}`);
        fields.push(entry);
    });
    const entity = {};
    for (const member of ["name", "description", "icon", "accent"])
        if (member in file)
            entity[member] = file[member];
    entity.access = file.access.mode;
    entity.fields = fieldKeys;
    if ("natural_key" in file)
        entity.natural_key = translate(file.natural_key, where, "/natural_key");
    if ("display_field" in file)
        entity.display_field = file.display_field;
    if (file.create_form)
        entity.create_form = `@obj:form:${entityKey}`;
    if (file.conversation)
        entity.conversation = translate(file.conversation, where, "/conversation");
    Object.assign(entity, entityInvariants(file, params, new Map([...sources, [entityKey, file]]), where));
    objects.push([`entity:${entityKey}`, entity], ...fields);
    file.views.forEach((view, i) => {
        objects.push(viewBody(entityKey, view, file, where, at("/views", i), sources));
    });
    if (file.create_form) {
        const form = file.create_form;
        onlyMembers(form, CONFIG_MEMBERS.create_form, where, "/create_form");
        const body = { name: form.name };
        if ("description" in form)
            body.description = form.description;
        body.schema_json = translate(form.schema, where, "/create_form/schema", { "x-entity": xEntity(entities) });
        body.ui_schema_json = { type: "VerticalLayout" };
        body.bound_entity_id = `@obj:entity:${entityKey}`;
        objects.push([`form:${entityKey}`, body]);
    }
    return { objects, grants: entityGrants(file, entityKey, where, sources, params) };
}
//# sourceMappingURL=entity.js.map