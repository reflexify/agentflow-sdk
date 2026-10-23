import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors.js";
const ROLE = { fields: { name: "string", permissions: "strings" }, required: ["name"] };
const KEYED = { fields: { key: "string", name: "string" }, required: ["key", "name"] };
const UNIT = { fields: { key: "string", name: "string", parent: "optstring" }, required: ["key", "name"] };
const PRINCIPAL = {
    fields: { key: "string", name: "string", roles: "strings", groups: "strings", owner_eligible: "bool" },
    required: ["key", "name"],
};
const CONNECTION_SETTINGS = { fields: { from: "optstring", reply_to: "optstring" }, required: [] };
const CONNECTION = {
    fields: { key: "string", kind: "string", secret_env: "optstring", settings: { object: CONNECTION_SETTINGS } },
    required: ["key", "kind"],
};
const ORG_SETTINGS = { fields: { timezone: "optstring", locale: "optstring" }, required: [] };
const PERSON = {
    fields: { handle: "string", name: "string", roles: "strings", groups: "strings", unit: "optstring" },
    required: ["handle", "name"],
};
const INSTALL = { fields: { parameters: "map", decisions: "map" }, required: [] };
const SPEC = {
    fields: {
        owner: "string",
        roles: { list: ROLE },
        groups: { list: KEYED },
        units: { list: UNIT },
        principals: { list: PRINCIPAL },
        connections: { list: CONNECTION },
        settings: { object: ORG_SETTINGS },
        people: { list: PERSON },
        install: { object: INSTALL },
    },
    required: ["people"],
};
const BUILT_IN_ROLES = ["admin", "designer", "viewer"];
const FORBIDDEN_PERMISSIONS = ["sandbox.create", "deployment.admin", "retention.delete"];
const MAX_PER_LIST = 100;
const KEY = /^[a-z][a-z0-9_]{0,31}$/;
const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const LISTS = ["roles", "groups", "units", "principals", "connections", "people"];
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const join = (path, member) => (path ? `${path}.${member}` : member);
const problem = (field, message) => ({ field, message });
const list = (spec, name) => (Array.isArray(spec[name]) ? spec[name] : []);
const strings = (value) => (Array.isArray(value) ? value : []);
const text = (value) => (typeof value === "string" ? value : undefined);
function shapeStruct(value, struct, path) {
    if (!isObject(value))
        return problem(path || "spec", "expected an object");
    for (const member of Object.keys(value).sort()) {
        if (!Object.hasOwn(struct.fields, member))
            return problem(join(path, member), `unknown field \`${member}\``);
        const found = shapeField(value[member], struct.fields[member], join(path, member));
        if (found)
            return found;
    }
    for (const member of struct.required) {
        if (!Object.hasOwn(value, member))
            return problem(path || "spec", `missing field \`${member}\``);
    }
    return null;
}
function shapeField(value, field, path) {
    if (field === "string")
        return typeof value === "string" ? null : problem(path, "expected a string");
    if (field === "optstring")
        return value === null || typeof value === "string" ? null : problem(path, "expected a string");
    if (field === "bool")
        return typeof value === "boolean" ? null : problem(path, "expected a boolean");
    if (field === "map")
        return isObject(value) ? null : problem(path, "expected an object");
    if (field === "any")
        return null;
    if (field === "strings") {
        if (!Array.isArray(value))
            return problem(path, "expected a list");
        const bad = value.findIndex((item) => typeof item !== "string");
        return bad === -1 ? null : problem(`${path}[${bad}]`, "expected a string");
    }
    if ("list" in field) {
        if (!Array.isArray(value))
            return problem(path, "expected a list");
        for (let i = 0; i < value.length; i++) {
            const found = shapeStruct(value[i], field.list, `${path}[${i}]`);
            if (found)
                return found;
        }
        return null;
    }
    return value === null ? null : shapeStruct(value, field.object, path);
}
function checkLengths(spec) {
    for (const name of LISTS) {
        if (list(spec, name).length > MAX_PER_LIST)
            return problem(name, `at most ${MAX_PER_LIST} entries`);
    }
    return null;
}
function nameProblem(field, name) {
    const length = [...name.trim()].length;
    return length === 0 || length > 120 ? problem(field, "a name of 1 to 120 characters") : null;
}
function checkKeys(name, member, entries) {
    const keys = new Set();
    for (let i = 0; i < entries.length; i++) {
        const value = entries[i][member];
        const field = `${name}[${i}].${member}`;
        if (!KEY.test(value))
            return { found: problem(field, `\`${value}\` must match [a-z][a-z0-9_]{0,31}`), keys };
        if (keys.has(value))
            return { found: problem(field, `\`${value}\` is used twice`), keys };
        keys.add(value);
    }
    return { found: null, keys };
}
function checkRoles(roles) {
    const declared = new Set();
    const lowered = new Set(BUILT_IN_ROLES);
    for (let i = 0; i < roles.length; i++) {
        const name = roles[i].name;
        const field = `roles[${i}].name`;
        const named = nameProblem(field, name);
        if (named)
            return { found: named, declared };
        const key = name.trim().toLowerCase();
        if (lowered.has(key))
            return { found: problem(field, `\`${name}\` is already a role`), declared };
        lowered.add(key);
        declared.add(name);
        for (const permission of strings(roles[i].permissions)) {
            if (FORBIDDEN_PERMISSIONS.includes(permission)) {
                return { found: problem(`roles[${i}].permissions`, `role \`${name}\` may not hold \`${permission}\` in a sandbox`), declared };
            }
        }
    }
    return { found: null, declared };
}
function checkUnits(units) {
    for (let i = 0; i < units.length; i++) {
        const named = nameProblem(`units[${i}].name`, units[i].name);
        if (named)
            return named;
        const parent = text(units[i].parent);
        if (parent !== undefined && !units.slice(0, i).some((earlier) => earlier.key === parent)) {
            return problem(`units[${i}].parent`, `\`${parent}\` is not an earlier unit`);
        }
    }
    return null;
}
function unknownMember(values, known) {
    return values.find((value) => !known(value));
}
function checkPrincipals(principals, roleKnown, groups) {
    for (let i = 0; i < principals.length; i++) {
        const principal = principals[i];
        const named = nameProblem(`principals[${i}].name`, principal.name);
        if (named)
            return named;
        const role = unknownMember(strings(principal.roles), roleKnown);
        if (role !== undefined)
            return problem(`principals[${i}].roles`, `\`${role}\` is not a built-in or declared role`);
        const group = unknownMember(strings(principal.groups), (g) => groups.has(g));
        if (group !== undefined)
            return problem(`principals[${i}].groups`, `\`${group}\` is not a declared group`);
    }
    return null;
}
function isEmailAddress(value) {
    const parts = value.split("@");
    if (parts.length !== 2 || parts[0].trim() === "")
        return false;
    const domain = parts[1].trim().replace(/>$/, "");
    return domain !== "" && !domain.startsWith("[") && domain.includes(".");
}
function checkConnections(connections) {
    for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        const kind = connection.kind;
        if (kind !== "resend")
            return problem(`connections[${i}].kind`, `\`${kind}\` is not supported; only \`resend\` is`);
        const settings = isObject(connection.settings) ? connection.settings : {};
        const from = text(settings.from)?.trim();
        if (!from)
            return problem(`connections[${i}].settings.from`, "a resend connection needs the address it sends from");
        if (!isEmailAddress(from))
            return problem(`connections[${i}].settings.from`, `\`${from}\` is not an email address`);
        const replyTo = text(settings.reply_to)?.trim();
        if (replyTo && !isEmailAddress(replyTo)) {
            return problem(`connections[${i}].settings.reply_to`, `\`${replyTo}\` is not an email address`);
        }
    }
    return null;
}
function validTimezone(timeZone) {
    try {
        new Intl.DateTimeFormat("en-US", { timeZone });
        return true;
    }
    catch {
        return false;
    }
}
function validLocale(locale) {
    return (locale !== "" &&
        locale.length <= 35 &&
        locale.split("-").every((part) => part !== "" && part.length <= 8 && /^[A-Za-z0-9]+$/.test(part)));
}
function checkSettings(settings) {
    if (!isObject(settings))
        return null;
    const timezone = text(settings.timezone);
    if (timezone !== undefined && !validTimezone(timezone))
        return problem("settings.timezone", `\`${timezone}\` is not an IANA timezone`);
    const locale = text(settings.locale);
    if (locale !== undefined && !validLocale(locale))
        return problem("settings.locale", `\`${locale}\` is not a language tag`);
    return null;
}
function checkPeople(people, roleKnown, groups, units) {
    for (let i = 0; i < people.length; i++) {
        const person = people[i];
        const named = nameProblem(`people[${i}].name`, person.name);
        if (named)
            return named;
        const role = unknownMember(strings(person.roles), roleKnown);
        if (role !== undefined)
            return problem(`people[${i}].roles`, `\`${role}\` is not a built-in or declared role`);
        const group = unknownMember(strings(person.groups), (g) => groups.has(g));
        if (group !== undefined)
            return problem(`people[${i}].groups`, `\`${group}\` is not a declared group`);
        const unit = text(person.unit);
        if (unit !== undefined && !units.has(unit))
            return problem(`people[${i}].unit`, `\`${unit}\` is not a declared unit`);
    }
    return null;
}
function checkOwner(spec, people) {
    const owner = text(spec.owner) ?? "admin";
    const person = people.find((p) => p.handle === owner);
    if (!person)
        return problem("owner", `\`${owner}\` is not one of the people`);
    if (!strings(person.roles).includes("admin"))
        return problem("owner", `\`${owner}\` must hold the admin role`);
    return null;
}
const REFERENCE_KINDS = ["group", "unit", "principal", "person", "connection"];
function checkInstall(install, known) {
    if (!isObject(install) || !isObject(install.parameters))
        return null;
    for (const name of Object.keys(install.parameters).sort()) {
        const value = install.parameters[name];
        if (typeof value !== "string" || !value.startsWith("@"))
            continue;
        const at = value.indexOf(":");
        if (at === -1)
            continue;
        const kind = value.slice(1, at);
        if (!REFERENCE_KINDS.includes(kind))
            continue;
        if (!known[kind].has(value.slice(at + 1)))
            return problem(`install.parameters.${name}`, `\`${value}\` names no ${kind} in this file`);
    }
    return null;
}
function checkSecretEnvs(connections) {
    for (let i = 0; i < connections.length; i++) {
        const env = connections[i].secret_env;
        if (env === undefined || env === null)
            continue;
        if (typeof env !== "string" || !ENV_NAME.test(env))
            return problem(`connections[${i}].secret_env`, "an environment variable name");
    }
    return null;
}
export function checkSpec(spec) {
    const shaped = shapeStruct(spec, SPEC, "");
    if (shaped)
        return shaped;
    const value = spec;
    const tooLong = checkLengths(value);
    if (tooLong)
        return tooLong;
    const roles = checkRoles(list(value, "roles"));
    if (roles.found)
        return roles.found;
    const roleKnown = (name) => BUILT_IN_ROLES.includes(name) || roles.declared.has(name);
    const groups = checkKeys("groups", "key", list(value, "groups"));
    if (groups.found)
        return groups.found;
    for (const [i, group] of list(value, "groups").entries()) {
        const named = nameProblem(`groups[${i}].name`, group.name);
        if (named)
            return named;
    }
    const units = checkKeys("units", "key", list(value, "units"));
    if (units.found)
        return units.found;
    const unitProblem = checkUnits(list(value, "units"));
    if (unitProblem)
        return unitProblem;
    const principals = checkKeys("principals", "key", list(value, "principals"));
    if (principals.found)
        return principals.found;
    const principalProblem = checkPrincipals(list(value, "principals"), roleKnown, groups.keys);
    if (principalProblem)
        return principalProblem;
    const connections = checkKeys("connections", "key", list(value, "connections"));
    if (connections.found)
        return connections.found;
    const connectionProblem = checkConnections(list(value, "connections"));
    if (connectionProblem)
        return connectionProblem;
    const settingsProblem = checkSettings(value.settings);
    if (settingsProblem)
        return settingsProblem;
    const people = checkKeys("people", "handle", list(value, "people"));
    if (people.found)
        return people.found;
    const personProblem = checkPeople(list(value, "people"), roleKnown, groups.keys, units.keys);
    if (personProblem)
        return personProblem;
    const ownerProblem = checkOwner(value, list(value, "people"));
    if (ownerProblem)
        return ownerProblem;
    const installProblem = checkInstall(value.install, {
        group: groups.keys,
        unit: units.keys,
        principal: principals.keys,
        person: people.keys,
        connection: connections.keys,
    });
    if (installProblem)
        return installProblem;
    return checkSecretEnvs(list(value, "connections"));
}
export function requireValidSpec(spec) {
    const found = checkSpec(spec);
    if (found)
        throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${found.field}: ${found.message}`, ["sandbox.json"]);
}
export function readSpec(cwd) {
    const file = path.join(cwd, "sandbox.json");
    let raw;
    try {
        raw = fs.readFileSync(file, "utf8");
    }
    catch (error) {
        const code = error.code;
        if (code === "ENOENT") {
            throw new CliError("SANDBOX_SPEC_MISSING", `no sandbox.json in ${cwd}: it declares the sandbox's people, groups and install answers; see the agentflow-app-release skill`, ["sandbox.json"]);
        }
        throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: cannot read it (${code ?? "error"})`, ["sandbox.json"]);
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new CliError("SANDBOX_SPEC_INVALID", "sandbox.json: not JSON", ["sandbox.json"]);
    }
    if (!isObject(parsed))
        throw new CliError("SANDBOX_SPEC_INVALID", "sandbox.json: not a JSON object", ["sandbox.json"]);
    return parsed;
}
export function secretEnvs(spec) {
    const out = [];
    for (const connection of Array.isArray(spec.connections) ? spec.connections : []) {
        if (isObject(connection) && typeof connection.key === "string" && typeof connection.secret_env === "string") {
            out.push({ key: connection.key, env: connection.secret_env });
        }
    }
    return out;
}
//# sourceMappingURL=spec.js.map