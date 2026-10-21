import { at, isObject, objectPath } from "../core.js";
import { fieldKeysOf } from "../invariants.js";
import { CONFIG_MEMBERS } from "../members.js";
import type { Draft, Json } from "./manifest.js";
import { entityTarget, parameter, unsentinel, unsupported, shown } from "./unsentinel.js";

const OPERATIONS = ["read", "list", "create", "update", "delete", "assign"];
const ENTITY_MEMBERS = [
  "name", "description", "icon", "accent", "access", "fields", "natural_key", "display_field", "create_form",
  "conversation", "rules", "stage_model", "work",
];
const VIEW_MEMBERS = ["name", "description", "type", "config", "columns", "filters", "sort"];
const FORM_MEMBERS = ["name", "description", "schema_json", "ui_schema_json", "bound_entity_id"];
const GRANT_MEMBERS = ["key", "to", "entity", "operations", "record_scopes"];
const M = "manifest.json";

const only = (body: Json, allowed: readonly string[], where: string): void => {
  for (const key of Object.keys(body)) if (!allowed.includes(key)) unsupported(where, at("", key), "a member the builder does not write");
};

// The inverse of `xEntity`.
function entityKeyOf(value: unknown, where: string, pointer: string): string {
  const m = typeof value === "string" ? /^@(req|obj)\.key:entity:([a-z][a-z0-9_]*)$/.exec(value) : null;
  if (!m || (m[1] === "req" && m[2] !== "user" && m[2] !== "org_unit")) {
    unsupported(where, pointer, `an x-entity the builder does not write: ${shown(value)}`);
  }
  return m[2]!;
}

function principalOf(to: unknown, where: string, pointer: string): Json {
  if (to === "everyone") return { kind: "everyone" };
  return { kind: "group", id: parameter(to, where, pointer) };
}

// The inverse of `entityGrants`: one operation entry per operation the grant names, in the builder's order.
function grantSource(grant: Json, index: number): Json {
  const here = `/grants/${index}`;
  for (const key of Object.keys(grant)) {
    if (!GRANT_MEMBERS.includes(key)) unsupported(M, at(here, key), "a grant member the builder does not write");
  }
  const operations = isObject(grant.operations) ? grant.operations : {};
  const scopes = isObject(grant.record_scopes) ? grant.record_scopes : {};
  for (const name of [...Object.keys(operations), ...Object.keys(scopes)]) {
    if (!OPERATIONS.includes(name)) unsupported(M, here, `an operation the builder does not write: ${name}`);
  }
  const entries = OPERATIONS.filter((name) => name in operations || name in scopes).map((name) => {
    const entry: Json = { operation: name };
    if (name in operations) entry.scope = unsentinel(operations[name], M, at(at(here, "operations"), name));
    if (name in scopes) entry.record_scopes = scopes[name];
    return entry;
  });
  return { principal: principalOf(grant.to, M, at(here, "to")), operations: entries };
}

// The inverse of `xEntity`, for a form's `x-entity` member: an entity of the package, or a reserved one.
export const entityPicker = (entities: readonly string[]) => (value: unknown, where: string, pointer: string): string => {
  const named = entityKeyOf(value, where, pointer);
  if (named !== "user" && named !== "org_unit" && !entities.includes(named)) {
    unsupported(where, pointer, `x-entity names ${named}, which is not an entity of the package`);
  }
  return named;
};

function formSource(draft: Draft, key: string, entities: readonly string[]): Json {
  const where = objectPath(`form:${key}`);
  const form = draft.take(`form:${key}`);
  only(form, FORM_MEMBERS, where);
  const layout = form.ui_schema_json;
  if (!isObject(layout) || Object.keys(layout).join() !== "type" || layout.type !== "VerticalLayout") {
    unsupported(where, "/ui_schema_json", `a form layout the builder does not write (it writes {"type": "VerticalLayout"}): ${shown(layout)}`);
  }
  if (form.bound_entity_id !== `@obj:entity:${key}`) unsupported(where, "/bound_entity_id", `a create form is bound to its own entity, ${key}`);
  const out: Json = { name: form.name };
  if ("description" in form) out.description = form.description;
  out.schema = unsentinel(form.schema_json, where, "/schema_json", { "x-entity": entityPicker(entities) });
  return out;
}

// The inverse of `entityObjects`: the entity, its fields, views and create form, and its grants, as one
// config/entities/<key>.json.
export function entitySource(draft: Draft, key: string, entities: readonly string[]): Json {
  const where = objectPath(`entity:${key}`);
  const entity = draft.take(`entity:${key}`);
  only(entity, ENTITY_MEMBERS, where);
  if (entity.access !== "everyone" && entity.access !== "restricted") {
    const got = "access" in entity ? `the entity has ${shown(entity.access)}` : "the entity has no access member";
    unsupported(where, "/access", `${got}; the builder writes access as "everyone" or "restricted": set one in the designers and pack the app again`);
  }
  if (!Array.isArray(entity.fields)) unsupported(where, "/fields", "an entity's fields are a list of its field objects");

  const work = "work" in entity ? unsentinel(entity.work, where, "/work") : undefined;
  const seeded = fieldKeysOf({ key, fields: [], work });
  const fields: Json[] = [];
  entity.fields.forEach((ref: unknown, i: number) => {
    const m = typeof ref === "string" ? /^@obj:entity_field:([a-z][a-z0-9_]*)\/(.+)$/.exec(ref) : null;
    if (!m || m[1] !== key) unsupported(where, at("/fields", i), `not a field object of ${key}: ${shown(ref)}`);
    const fieldKey = m[2]!;
    if (seeded.has(fieldKey)) return;
    const fieldWhere = objectPath(`entity_field:${key}/${fieldKey}`);
    const body = draft.take(`entity_field:${key}/${fieldKey}`);
    if ("key" in body) unsupported(fieldWhere, "/key", "a field body never names its key");
    fields.push({ key: fieldKey, ...(unsentinel(body, fieldWhere, "", { target_entity_id: entityTarget }) as Json) });
  });

  const views = draft.keys("entity_view").filter((k) => k.startsWith(`${key}/`)).map((scoped) => {
    const viewWhere = objectPath(`entity_view:${scoped}`);
    const view = draft.take(`entity_view:${scoped}`);
    only(view, VIEW_MEMBERS, viewWhere);
    const out: Json = { key: scoped.slice(key.length + 1) };
    for (const member of VIEW_MEMBERS) {
      if (!(member in view)) continue;
      out[member] = member === "columns" || member === "name" || member === "description" || member === "type"
        ? view[member]
        : unsentinel(view[member], viewWhere, at("", member));
    }
    return out;
  });

  const grants: Json[] = [];
  draft.grants.forEach((grant, i) => {
    if (grant.entity === `@obj:entity:${key}`) grants.push(grantSource(draft.takeGrant(i), i));
  });

  const source: Json = { key };
  for (const member of CONFIG_MEMBERS.entity!) {
    if (member === "key") continue;
    if (member === "fields") source.fields = fields;
    else if (member === "views") source.views = views;
    else if (member === "access") source.access = { mode: entity.access, grants };
    else if (member === "create_form") {
      if (!("create_form" in entity)) continue;
      if (entity.create_form !== `@obj:form:${key}`) unsupported(where, "/create_form", `an entity's create form is form:${key}`);
      source.create_form = formSource(draft, key, entities);
    } else if (member === "work") {
      if (work !== undefined) source.work = work;
    } else if (member in entity) {
      source[member] = ["name", "description", "icon", "accent", "display_field"].includes(member)
        ? entity[member]
        : unsentinel(entity[member], where, at("", member));
    }
  }
  return source;
}
