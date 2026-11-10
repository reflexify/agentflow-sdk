import path from "node:path";
import { DEP_REFERENCE, at, clip, isObject, onlyMembers, parameterOf, readJson, refuse, targetEntity, translate } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
import { nearest } from "./suggest.js";
import { checkFilterRule } from "./view-filters.js";
import { classifiedByUnit, entityInvariants, fieldOf, grantRecordScope, nameableKeysOf } from "./invariants.js";
const OPERATIONS = ["read", "list", "create", "update", "delete", "assign"];
const FIELD_MEMBERS = new Set(CONFIG_MEMBERS.field);
const ACCESS_MODES = ["everyone", "restricted"];
const ON_TARGET_DELETE = ["restrict", "clear", "cascade"];
const COLUMN_TYPES = ["text", "number", "boolean", "date", "enum"];
const VIEW_TYPES = ["grid", "kanban", "calendar", "gallery", "timeline", "map", "inbox", "detail"];
const OPTION_COLORS = ["gray", "sky", "teal", "amber", "emerald", "violet", "indigo", "rose", "fuchsia"];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
// What AgentFlow's field definition takes, which it refuses otherwise at install: the types, the `format` each
// type's values take (a formula's by its result type; an auto number's depends on its pattern, so it is left to
// AgentFlow), and the names in `format_options`.
const FIELD_TYPES = [
    "text", "number", "boolean", "date", "datetime", "enum", "reference", "multi_select", "reference_list", "file",
    "formula", "auto_number", "list",
];
const DATE_FORMATS = ["dd_mm_yyyy", "mm_dd_yyyy", "iso", "long", "month_year", "relative"];
const FORMATS = {
    text: ["email", "url", "phone", "richtext"],
    number: ["currency", "percent", "duration", "rating"],
    date: DATE_FORMATS,
    datetime: DATE_FORMATS,
    file: ["image"],
};
const FORMAT_OPTIONS = [
    "currency_code", "rating_max", "duration_unit", "duration_format", "display", "done_field", "mentions", "bar",
    "bar_bands", "decimal_places", "separators", "time_style", "max_files",
];
const SEPARATORS = ["locale", "comma_dot", "dot_comma", "space_comma", "none"];
function checkTypeAndFormat(rest, where, stated) {
    const type = rest.type;
    if (typeof type !== "string" || !FIELD_TYPES.includes(type)) {
        const near = typeof type === "string" ? nearest(type, FIELD_TYPES) : undefined;
        refuse(where, stated("type"), `one of ${FIELD_TYPES.join(", ")}${near ? ` (did you mean ${near}?)` : ""}`);
    }
    const format = rest.format;
    if (format !== undefined && format !== null && type !== "auto_number") {
        const valuesOf = type === "formula" ? rest.formula_result_type : type;
        const allowed = typeof valuesOf === "string" ? FORMATS[valuesOf] ?? [] : [];
        if (typeof format !== "string" || !allowed.includes(format)) {
            const kind = type === "formula" ? `a formula field whose result is ${String(valuesOf)}` : `a ${type} field`;
            refuse(where, stated("format"), allowed.length ? `one of ${allowed.join(", ")} on ${kind}` : `none: ${kind} takes no format`);
        }
    }
    const options = rest.format_options;
    if (options === undefined || options === null)
        return;
    if (!isObject(options))
        refuse(where, stated("format_options"), "must be an object");
    for (const name of Object.keys(options)) {
        if (!FORMAT_OPTIONS.includes(name))
            refuse(where, at(stated("format_options"), name), `not a format option AgentFlow knows: one of ${FORMAT_OPTIONS.join(", ")}`);
    }
    if ("separators" in options && !SEPARATORS.includes(options.separators)) {
        refuse(where, at(stated("format_options"), "separators"), `one of ${SEPARATORS.join(", ")}`);
    }
    const places = options.decimal_places;
    if ("decimal_places" in options && !(Number.isInteger(places) && places >= 0 && places <= 8)) {
        refuse(where, at(stated("format_options"), "decimal_places"), "a whole number from 0 to 8");
    }
}
export function fieldBody(entityKey, field, where, pointer) {
    for (const member of Object.keys(field)) {
        if (member === "sensitive") {
            refuse(where, at(pointer, member), "a package never secures a field, the organization does: write recommendedSecured: true");
        }
        if (!FIELD_MEMBERS.has(member))
            refuse(where, at(pointer, member), "not a member the package's entity_field lists");
    }
    const { key, ...rest } = field;
    const stated = (member) => at(pointer, member);
    if (typeof key !== "string" || key === "")
        refuse(where, stated("key"), "a non-empty string");
    checkTypeAndFormat(rest, where, stated);
    if ("recommendedSecured" in rest && typeof rest.recommendedSecured !== "boolean")
        refuse(where, stated("recommendedSecured"), "true or false");
    if ("queriedByApp" in rest && typeof rest.queriedByApp !== "boolean")
        refuse(where, stated("queriedByApp"), "true or false");
    if ("on_target_delete" in rest && !ON_TARGET_DELETE.includes(rest.on_target_delete)) {
        refuse(where, stated("on_target_delete"), `one of ${ON_TARGET_DELETE.join(", ")}`);
    }
    if (rest.on_target_delete === "clear" && rest.required === true) {
        refuse(where, stated("on_target_delete"), "clear on a required field would leave records that every write refuses (AgentFlow refuses it at install): make the field optional, and require it on the stage move that needs it with required_fields, or choose restrict");
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
    if (Array.isArray(rest.enum_values)) {
        rest.enum_values.forEach((option, i) => {
            if (!isObject(option) || !("color" in option))
                return;
            const color = option.color;
            if (typeof color !== "string" || !(OPTION_COLORS.includes(color) || HEX_COLOR.test(color))) {
                refuse(where, at(at(stated("enum_values"), i), "color"), `one of ${OPTION_COLORS.join(", ")}, or #RRGGBB`);
            }
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
        const known = nameableKeysOf(file);
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
// A metric's object is its entry less the key, which names it. The platform's schema closes the members and requires a
// label and a function; the rest of the definition is judged when the package installs.
export function metricBody(entityKey, metric, where, pointer) {
    if (!isObject(metric))
        refuse(where, pointer, "must be an object");
    onlyMembers(metric, CONFIG_MEMBERS.metric, where, pointer);
    const stated = (member) => at(pointer, member);
    if (typeof metric.key !== "string" || metric.key === "")
        refuse(where, stated("key"), "a non-empty string");
    if (typeof metric.label !== "string" || !/\S/.test(metric.label))
        refuse(where, stated("label"), "a non-empty string");
    if (typeof metric.fn !== "string")
        refuse(where, stated("fn"), "a string, the function the metric computes");
    const { key, ...rest } = metric;
    return [`entity_metric:${entityKey}/${key}`, translate(rest, where, pointer)];
}
// A property of a create form (or a start form) that picks a record names its entity by key: one of the package's,
// a platform directory (`user`, `group`, `org_unit`: the Groups picker is `group`), or a required package's.
export function xEntity(entities) {
    return (value, where, pointer) => {
        if (value === "user" || value === "group" || value === "org_unit")
            return `@req.key:entity:${value}`;
        if (entities.includes(value))
            return `@obj.key:entity:${value}`;
        const dependency = DEP_REFERENCE.exec(String(value));
        if (dependency)
            return `@dep.key:${dependency[1]}#entity:${dependency[2]}`;
        return refuse(where, pointer, `x-entity names ${clip(String(value))}, which is not an entity of the package: write the key of one of its entities, user, group or org_unit, or \${dep:<package id>#entity:<key>} for an entity of a package in requires.packages`);
    };
}
// Every property of a create form that is bound to a field names a field the entity has. AgentFlow derives the form's
// contract when the package installs and refuses a binding to a field that is not there, so the build says so first.
// `known` holds `name`, which is always there: the install adds it when the file declares none. A field the form
// leaves unbound is fine (a field with a default, or one a workflow fills), so nothing here reads that direction.
// A property bound to a reference field must be a picker the install accepts: the entity-reference format on the
// property for one reference and under `items` for a list, and an `x-entity` naming the entity it picks from.
function checkFormBindings(schema, known, fieldOf, entityKey, where, pointer) {
    if (!isObject(schema))
        return;
    if ("x-entityField" in schema) {
        const bound = schema["x-entityField"];
        const property = pointer.split("/").at(-1).replaceAll("~1", "/").replaceAll("~0", "~");
        if (typeof bound !== "string") {
            refuse(where, at(pointer, "x-entityField"), `the property ${clip(property)} is bound to something that is not a field key`);
        }
        if (!known.has(bound)) {
            const near = nearest(bound, [...known]);
            refuse(where, at(pointer, "x-entityField"), `the property ${clip(property)} is bound to ${clip(bound)}, which is not a field of ${entityKey}${near ? ` (did you mean ${near}?)` : ""}; AgentFlow refuses a form bound to a field the entity does not have when the package installs`);
        }
        const field = fieldOf(bound);
        if (field?.readOnly === true) {
            refuse(where, at(pointer, "x-entityField"), `the property ${clip(property)} is bound to ${clip(bound)}, which is read-only: \`${clip(bound)}\` is set by the platform from the creator's unit or the step's destinationUnit; a package never writes it`);
        }
        const type = field?.type;
        const refused = "; AgentFlow refuses this create form when the package installs";
        if (type === "reference_list" && !(isObject(schema.items) && schema.items.format === "entity")) {
            refuse(where, pointer, `the property ${clip(property)} is bound to the list field ${clip(bound)}, so its "format": "entity" goes under "items": write "items": { "type": "string", "format": "entity" }${refused}`);
        }
        if (type === "reference" && schema.format !== "entity") {
            refuse(where, pointer, `the property ${clip(property)} is bound to the reference field ${clip(bound)} and needs "format": "entity"${refused}`);
        }
        if ((type === "reference" || type === "reference_list") && typeof schema["x-entity"] !== "string") {
            refuse(where, pointer, `the property ${clip(property)} is bound to the reference field ${clip(bound)} and names no x-entity, the entity it picks from${refused}`);
        }
    }
    if (isObject(schema.properties)) {
        for (const [key, child] of Object.entries(schema.properties)) {
            checkFormBindings(child, known, fieldOf, entityKey, where, at(at(pointer, "properties"), key));
        }
    }
    for (const member of ["items", "additionalProperties"]) {
        if (member in schema)
            checkFormBindings(schema[member], known, fieldOf, entityKey, where, at(pointer, member));
    }
}
const UNIT_PARAMETER = /^\$\{param:([a-z][a-z0-9_-]*)\}$/;
// A scope relative to a person's unit or anchored at one, which only an entity classified by unit can honour.
const namesAUnit = (scope) => scope === "placement" || scope === "placement_subtree" || (isObject(scope) && (scope.scope === "unit" || scope.scope === "subtree"));
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
            if ("scope" in op) {
                if (namesAUnit(op.scope) && !classifiedByUnit(file)) {
                    refuse(where, at(opAt, "scope"), `a grant scoped to a unit needs \`requires_unit_classification: true\` on the entity, and entity:${entityKey} does not declare it: add the member, or grant a scope that names no unit: own or organization`);
                }
                if (isObject(op.scope) && (op.scope.scope === "unit" || op.scope.scope === "subtree")) {
                    const anchorAt = at(at(opAt, "scope"), "anchor");
                    const anchor = typeof op.scope.anchor === "string" ? UNIT_PARAMETER.exec(op.scope.anchor)?.[1] : undefined;
                    if (!anchor)
                        refuse(where, anchorAt, "a package never names an organization's unit: anchor the scope at a ${param:key} of a unit_ref parameter");
                    if (params && params.get(anchor) !== "unit_ref")
                        refuse(where, anchorAt, `${anchor} is not a unit_ref parameter`);
                }
                operations[name] = translate(op.scope, where, at(opAt, "scope"));
            }
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
const SEED_LIMIT = 1000;
// A seed holds literals, so it is copied without `translate`: a reference or a leading `@` is refused, not resolved.
// Natural-key coverage and field types are the platform's verification.
function checkSeed(seed, where) {
    if (!Array.isArray(seed))
        refuse(where, "/seed", "must be an array of record bodies");
    if (seed.length > SEED_LIMIT)
        refuse(where, "/seed", `at most ${SEED_LIMIT} records, got ${seed.length}`);
    const literal = (value, pointer) => {
        if (typeof value === "string") {
            if (value.includes("${"))
                refuse(where, pointer, "a seed holds literals, not a ${...} reference");
            if (value.startsWith("@"))
                refuse(where, pointer, "a seed string cannot start with @, which would read as a platform sentinel");
        }
        else if (Array.isArray(value)) {
            value.forEach((item, i) => literal(item, at(pointer, i)));
        }
        else if (isObject(value)) {
            for (const [key, item] of Object.entries(value))
                literal(item, at(pointer, key));
        }
    };
    seed.forEach((body, i) => {
        const bodyAt = at("/seed", i);
        if (!isObject(body))
            refuse(where, bodyAt, "must be an object");
        literal(body, bodyAt);
    });
}
// The field a record is named by, which AgentFlow refuses at install unless it is one the file declares (`name`
// too: the verifier asks for it among the entity's fields), holds a scalar value, and allows no mentions, since it is
// shown wherever a record is named.
function checkDisplayField(file, entityKey, where) {
    const key = file.display_field;
    const field = (Array.isArray(file.fields) ? file.fields : []).find((f) => isObject(f) && f.key === key);
    if (!field)
        refuse(where, "/display_field", `${String(key)} is not a field of ${entityKey}: name one the file declares`);
    if (["reference", "reference_list", "file", "list"].includes(field.type)) {
        refuse(where, "/display_field", `${String(key)} is a ${String(field.type)} field, which AgentFlow refuses as the display field at install: a record is named by a scalar value. ` +
            "Name a text, auto_number or formula field; a formula can read a field of the record a reference points to");
    }
    if (field.type === "text" && isObject(field.format_options) && field.format_options.mentions === true) {
        refuse(where, "/display_field", `${String(key)} allows mentions, which AgentFlow refuses on the display field: its value is shown wherever a record is named`);
    }
}
export function entityObjects(configDir, entityKey, entities, params = new Map(), sources = new Map(), connections = new Map(), packages = new Set()) {
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
    if ("metrics" in file && !Array.isArray(file.metrics))
        refuse(where, "/metrics", "must be an array");
    if (!isObject(file.access))
        refuse(where, "/access", "an object with a mode and grants");
    onlyMembers(file.access, CONFIG_MEMBERS.access, where, "/access");
    if (!ACCESS_MODES.includes(file.access.mode))
        refuse(where, "/access/mode", `one of ${ACCESS_MODES.join(", ")}`);
    if ("grants" in file.access && !Array.isArray(file.access.grants))
        refuse(where, "/access/grants", "must be an array");
    if ("requires_unit_classification" in file && typeof file.requires_unit_classification !== "boolean") {
        refuse(where, "/requires_unit_classification", "true or false");
    }
    if (classifiedByUnit(file)) {
        file.fields.forEach((field, i) => {
            if (isObject(field) && field.key === "unit") {
                refuse(where, at(at("/fields", i), "key"), "`unit` is the field the platform adds to an entity classified by unit; rename your field");
            }
        });
        if ("seed" in file && !(Array.isArray(file.seed) && file.seed.length === 0)) {
            refuse(where, "/seed", "starter records cannot be filed in a unit the package does not know");
        }
    }
    const objects = [];
    const fieldKeys = [];
    const fields = [];
    file.fields.forEach((field, i) => {
        const here = at("/fields", i);
        const entry = fieldBody(entityKey, field, where, here);
        fieldKeys.push(`@obj:${entry[0]}`);
        fields.push(entry);
    });
    // A field a business key names cannot clear when its target is deleted: AgentFlow refuses the pair at install
    // (ENTITY_REF_DELETE_BEHAVIOUR_KEY_MEMBER), since the record would drop out of the key silently.
    const clears = new Set(file.fields.flatMap((field) => (isObject(field) && field.on_target_delete === "clear" ? [field.key] : [])));
    (Array.isArray(file.natural_key) ? file.natural_key : []).forEach((set, i) => {
        const names = isObject(set) && Array.isArray(set.fields) ? set.fields : [];
        names.forEach((name, j) => {
            if (!clears.has(name))
                return;
            refuse(where, at(at(at("/natural_key", i), "fields"), j), `${String(name)} is part of a business key and clears when its target is deleted, which AgentFlow refuses at install: use restrict, or leave it out of the key`);
        });
    });
    const entity = {};
    for (const member of ["name", "description", "icon", "accent"])
        if (member in file)
            entity[member] = file[member];
    entity.access = file.access.mode;
    entity.fields = fieldKeys;
    if ("natural_key" in file)
        entity.natural_key = translate(file.natural_key, where, "/natural_key");
    if ("display_field" in file) {
        checkDisplayField(file, entityKey, where);
        entity.display_field = file.display_field;
    }
    if ("seed" in file) {
        checkSeed(file.seed, where);
        entity.seed = file.seed;
    }
    if ("requires_unit_classification" in file)
        entity.requires_unit_classification = file.requires_unit_classification;
    if (file.create_form)
        entity.create_form = `@obj:form:${entityKey}`;
    if (file.conversation)
        entity.conversation = translate(file.conversation, where, "/conversation");
    Object.assign(entity, entityInvariants(file, params, new Map([...sources, [entityKey, file]]), where, connections, packages));
    objects.push([`entity:${entityKey}`, entity], ...fields);
    file.views.forEach((view, i) => {
        objects.push(viewBody(entityKey, view, file, where, at("/views", i), sources));
    });
    (file.metrics ?? []).forEach((metric, i) => {
        objects.push(metricBody(entityKey, metric, where, at("/metrics", i)));
    });
    if (file.create_form) {
        const form = file.create_form;
        onlyMembers(form, CONFIG_MEMBERS.create_form, where, "/create_form");
        checkFormBindings(form.schema, nameableKeysOf(file), (key) => fieldOf(file, key), entityKey, where, "/create_form/schema");
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