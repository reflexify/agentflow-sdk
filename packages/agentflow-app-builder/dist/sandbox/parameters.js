import fs from "node:fs";
import path from "node:path";
import { clip } from "../core.js";
import { CliError } from "../errors.js";
import { nearest } from "../suggest.js";
import { readDependencies } from "./dependencies.js";
import { connectionKinds } from "./spec.js";
const REFERENCE_KINDS = {
    group_ref: { kind: "group", write: "@group:<key>" },
    user_ref: { kind: "person", write: "@person:<handle>" },
    unit_ref: { kind: "unit", write: "@unit:<key>" },
    service_principal_ref: { kind: "principal", write: "@principal:<key>" },
    connection_ref: { kind: "connection", write: "@connection:<key>" },
    sla_policy_ref: { kind: "sla_policy", write: "@sla_policy:<key>" },
    escalation_policy_ref: { kind: "escalation_policy", write: "@escalation_policy:<key>" },
};
// References the sandbox cannot create: there is no `@kind:` form for them, and a sandbox holds none an id could name.
const ID_ONLY = { secret_ref: "a secret" };
// The connection categories a sandbox cannot make a connection for: it makes email connections (resend or loopback)
// and ERP connections (sandbox_erp) only.
const NO_SANDBOX_CONNECTION = new Set(["crm", "database", "data_warehouse", "file_storage"]);
const SEE = `the release skill's reference/sandbox-json.md, "What a sandbox cannot hold"`;
const SEE_DEPENDENCIES = `the release skill's reference/sandbox-json.md, "Dependencies"`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHOWN_KINDS = {
    group: "a group",
    person: "a person",
    unit: "a unit",
    principal: "a principal",
    connection: "a connection",
    sla_policy: "an SLA policy",
    escalation_policy: "an escalation policy",
};
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const show = (value) => (typeof value === "string" ? `\`${clip(value)}\`` : clip(JSON.stringify(value) ?? String(value)));
function builtManifest(cwd) {
    try {
        const manifest = JSON.parse(fs.readFileSync(path.join(cwd, "package", "manifest.json"), "utf8"));
        return isObject(manifest) ? manifest : undefined;
    }
    catch {
        return undefined;
    }
}
function declaredParameters(manifest) {
    if (!manifest || !Array.isArray(manifest.parameters))
        return undefined;
    return manifest.parameters.flatMap((parameter) => isObject(parameter) && typeof parameter.key === "string" && typeof parameter.type === "string"
        ? [{
                key: parameter.key,
                type: parameter.type,
                ...(typeof parameter.category === "string" ? { category: parameter.category } : {}),
                required: parameter.required === true,
                hasDefault: "default" in parameter,
                options: Array.isArray(parameter.options) ? parameter.options.filter((o) => typeof o === "string") : [],
            }]
        : []);
}
const PARAM_SLOT = /^@param:(.+)$/;
function slotsIn(value, found) {
    if (typeof value === "string") {
        const key = PARAM_SLOT.exec(value)?.[1];
        if (key)
            found.add(key);
    }
    else if (Array.isArray(value)) {
        for (const item of value)
            slotsIn(item, found);
    }
    else if (isObject(value)) {
        for (const item of Object.values(value))
            slotsIn(item, found);
    }
}
// Each parameter some object under package/objects names, with the first such object's key (`workflow:review`; a
// file's `__` is the `/` of a key like `entity_field:case/title`). A sandbox turns every optional feature on, and the
// builder writes none, so every object is enabled. Undefined when package/ holds no objects folder to read.
function usersOfParameters(cwd) {
    const root = path.join(cwd, "package", "objects");
    const users = new Map();
    try {
        for (const kind of fs.readdirSync(root).sort()) {
            if (!fs.statSync(path.join(root, kind)).isDirectory())
                continue;
            for (const file of fs.readdirSync(path.join(root, kind)).sort()) {
                if (!file.endsWith(".json"))
                    continue;
                const found = new Set();
                slotsIn(JSON.parse(fs.readFileSync(path.join(root, kind, file), "utf8")), found);
                for (const key of found)
                    if (!users.has(key))
                        users.set(key, `${kind}:${file.slice(0, -".json".length).replaceAll("__", "/")}`);
            }
        }
    }
    catch {
        return undefined;
    }
    return users;
}
// Why no value in sandbox.json can work for this parameter, when none can: setup looks the value up among what the
// sandbox holds, and a sandbox holds no secret, and email connections (resend or loopback) and ERP connections
// (sandbox_erp) only, the latter only when sandbox.json declares one.
function ungivable(parameter, kinds) {
    if (parameter.type === "secret_ref")
        return "a sandbox holds no secret, so no id can name one there";
    if (parameter.type !== "connection_ref" || parameter.category === undefined)
        return undefined;
    if (parameter.category === "erp" && ![...kinds.values()].includes("sandbox_erp")) {
        return 'sandbox.json declares no sandbox_erp connection, so there is no erp connection to name: add { "key": "erp", "kind": "sandbox_erp" } to its connections';
    }
    if (NO_SANDBOX_CONNECTION.has(parameter.category)) {
        return `a sandbox holds email connections (resend or loopback) and sandbox_erp ERP connections only, so there is no ${parameter.category} connection to name`;
    }
    return undefined;
}
// A connection reference whose connection is of a kind the parameter's category cannot take.
function wrongKind(parameter, value, kinds) {
    if (parameter.type !== "connection_ref" || parameter.category === undefined || !value.startsWith("@connection:"))
        return undefined;
    const kind = kinds.get(value.slice("@connection:".length));
    if (kind === undefined)
        return undefined;
    if (parameter.category === "erp" && kind !== "sandbox_erp") {
        return `${show(value)} is a ${kind} connection, but ${parameter.key} is an erp connection: name the sandbox_erp connection`;
    }
    if (parameter.category === "email" && kind === "sandbox_erp") {
        return `${show(value)} is a sandbox_erp connection, but ${parameter.key} is an email connection: name a resend or loopback connection`;
    }
    return undefined;
}
function misfit(parameter, value, kinds) {
    if (value === null)
        return `null is not a value ${parameter.key} (${parameter.type}) takes: leave the key out to give it no value`;
    const idOnly = ID_ONLY[parameter.type];
    if (idOnly) {
        if (typeof value === "string" && UUID.test(value))
            return undefined;
        const written = typeof value === "string" && value.startsWith("@") && !value.startsWith("@@");
        return written
            ? `${show(value)} cannot be resolved: a sandbox holds no ${idOnly.replace(/^an? /, "")} for ${parameter.key} to name`
            : `${show(value)} is not an id, and ${parameter.key} is a ${parameter.type}: a sandbox holds no ${idOnly.replace(/^an? /, "")} an id could name`;
    }
    const reference = REFERENCE_KINDS[parameter.type];
    if (reference) {
        if (typeof value === "string" && value.startsWith("@") && !value.startsWith("@@")) {
            const given = value.slice(1, value.indexOf(":") === -1 ? undefined : value.indexOf(":"));
            if (given === reference.kind)
                return wrongKind(parameter, value, kinds);
            return Object.hasOwn(SHOWN_KINDS, given)
                ? `${show(value)} is ${SHOWN_KINDS[given]}, but ${parameter.key} is a ${parameter.type}: write ${reference.write}`
                : `${show(value)} is not a reference sandbox.json knows, and ${parameter.key} is a ${parameter.type}: write ${reference.write}`;
        }
        if (typeof value === "string" && UUID.test(value))
            return undefined;
        if (parameter.type === "connection_ref" && isObject(value))
            return undefined;
        return `${show(value)} is not a reference, but ${parameter.key} is a ${parameter.type}: write ${reference.write}`;
    }
    if (parameter.type === "text")
        return typeof value === "string" ? undefined : `${show(value)} is not a string, which ${parameter.key} takes`;
    if (parameter.type === "number")
        return typeof value === "number" ? undefined : `${show(value)} is not a number, which ${parameter.key} takes`;
    if (parameter.type === "enum") {
        return typeof value === "string" && parameter.options.includes(value)
            ? undefined
            : `${JSON.stringify(value)} is not one of ${parameter.options.join(", ")}, which ${parameter.key} takes`;
    }
    return undefined;
}
// The first way sandbox.json's answers disagree with the parameters package/manifest.json and each dependency's
// manifest declare, and the answers it leaves out. The platform refuses a required parameter with no default and no
// value only when an enabled object, a grant or the audience uses it, which the manifest alone cannot tell, so that is
// a warning. A secret, or a connection a sandbox cannot make, that an object uses is a refusal with a value as without
// one. Throws when a dependency's file cannot be read as a sealed package.
export function parameterFindings(spec, cwd) {
    const dependencies = readDependencies(spec, cwd);
    const kinds = connectionKinds(spec);
    const own = packageFindings(spec, cwd, kinds, dependencies);
    if (own.problem)
        return own;
    const theirs = dependencyFindings(spec, dependencies, kinds);
    return { problem: theirs.problem, warnings: [...own.warnings, ...theirs.warnings] };
}
function packageFindings(spec, cwd, kinds, dependencies) {
    const manifest = builtManifest(cwd);
    const declared = declaredParameters(manifest);
    const found = { problem: null, warnings: [] };
    if (!declared)
        return found;
    const install = isObject(spec.install) ? spec.install : {};
    const given = isObject(install.parameters) ? install.parameters : {};
    // Where sandbox.json answers a parameter other than install.parameters: install.decisions.parameters["<package id>"].
    const decided = (key) => {
        const decisions = decidedParameters(spec);
        const id = typeof manifest?.id === "string" ? manifest.id : undefined;
        return id !== undefined && isObject(decisions[id]) && Object.hasOwn(decisions[id], key)
            ? `install.decisions.parameters.${id}.${key}`
            : undefined;
    };
    const users = usersOfParameters(cwd);
    const keys = declared.map((parameter) => parameter.key);
    for (const name of Object.keys(given).sort()) {
        if (keys.includes(name))
            continue;
        const near = nearest(name, keys);
        found.problem = {
            field: `install.parameters.${name}`,
            message: near
                ? `the manifest declares no parameter ${name}; did you mean ${near}?`
                : `the manifest declares no parameter ${name} (it declares ${keys.join(", ") || "none"})`,
        };
        return found;
    }
    for (const parameter of declared) {
        const field = `install.parameters.${parameter.key}`;
        const supplied = Object.hasOwn(given, parameter.key) && given[parameter.key] !== undefined ? field : decided(parameter.key);
        // A value cannot help a parameter a sandbox cannot hold, whatever sandbox.json gives; an unset one is refused when it
        // is required without a default. Either way only when an object uses it: the other cases are the warning below.
        // A value for an optional connection is left alone: setup does not block on an optional parameter, and a secret is
        // refused at publish (`ref.secret_unknown`) whether or not it is required.
        const why = ungivable(parameter, kinds);
        const user = why ? users?.get(parameter.key) : undefined;
        const valueRefused = supplied !== undefined && (parameter.required || parameter.type === "secret_ref");
        if (why && user && (valueRefused || (supplied === undefined && parameter.required && !parameter.hasDefault))) {
            const kind = `${parameter.type}${parameter.category ? `, category ${parameter.category}` : ""}`;
            found.problem = {
                field: valueRefused ? supplied : field,
                message: valueRefused
                    ? `${parameter.key} (${kind}) is given a value, but ${why}; ${user} uses it, so AgentFlow refuses the install. Test what needs it on a real installation (${SEE})`
                    : `the manifest requires parameter ${parameter.key} (${kind}), which has no default and no value, and ${why}; ${user} uses it, so AgentFlow refuses the install. Test what needs it on a real installation (${SEE})`,
            };
            return found;
        }
        if (!Object.hasOwn(given, parameter.key)) {
            if (parameter.required && !parameter.hasDefault) {
                found.warnings.push(`${field}: the manifest requires parameter ${parameter.key} (${parameter.type}), which has no default and no value in sandbox.json; AgentFlow refuses the install when an enabled object, a grant or the audience uses it`);
            }
            continue;
        }
        const value = given[parameter.key];
        if (value === undefined)
            continue;
        const message = misfit(parameter, value, kinds);
        if (message) {
            found.problem = { field, message };
            return found;
        }
    }
    const required = manifest?.requires;
    const packages = isObject(required) && Array.isArray(required.packages) ? required.packages : [];
    const uploaded = new Set(dependencies.map((dependency) => dependency.id));
    for (const entry of packages) {
        if (!isObject(entry) || typeof entry.id !== "string" || uploaded.has(entry.id))
            continue;
        found.warnings.push(`requires.packages: ${entry.id} is not among sandbox.json's dependencies, so the install looks for it in the deployment's app catalog, and AgentFlow refuses the install when the catalog does not hold it (${SEE_DEPENDENCIES})`);
    }
    return found;
}
function decidedParameters(spec) {
    const install = isObject(spec.install) ? spec.install : {};
    return isObject(install.decisions) && isObject(install.decisions.parameters) ? install.decisions.parameters : {};
}
// A dependency's answers are install.decisions.parameters["<its id>"]: each is checked against its manifest as
// install.parameters is against the package's, except that what its objects use is not read, so a value a sandbox
// cannot hold is refused only for a required parameter.
function dependencyFindings(spec, dependencies, kinds) {
    const found = { problem: null, warnings: [] };
    const decisions = decidedParameters(spec);
    for (const dependency of dependencies) {
        const declared = declaredParameters(dependency.manifest) ?? [];
        const at = `install.decisions.parameters.${dependency.id}`;
        const given = isObject(decisions[dependency.id]) ? decisions[dependency.id] : {};
        const keys = declared.map((parameter) => parameter.key);
        for (const name of Object.keys(given).sort()) {
            if (keys.includes(name))
                continue;
            const near = nearest(name, keys);
            found.problem = {
                field: `${at}.${name}`,
                message: near
                    ? `${dependency.id} declares no parameter ${name}; did you mean ${near}?`
                    : `${dependency.id} declares no parameter ${name} (it declares ${keys.join(", ") || "none"})`,
            };
            return found;
        }
        for (const parameter of declared) {
            const field = `${at}.${parameter.key}`;
            if (!Object.hasOwn(given, parameter.key) || given[parameter.key] === undefined) {
                if (parameter.required && !parameter.hasDefault) {
                    found.warnings.push(`${field}: ${dependency.id} requires parameter ${parameter.key} (${parameter.type}), which has no default and no value in sandbox.json; AgentFlow refuses the install when an enabled object, a grant or the audience uses it`);
                }
                continue;
            }
            const why = ungivable(parameter, kinds);
            if (why && (parameter.required || parameter.type === "secret_ref")) {
                const kind = `${parameter.type}${parameter.category ? `, category ${parameter.category}` : ""}`;
                found.problem = { field, message: `${parameter.key} (${kind}) is given a value, but ${why}, so AgentFlow refuses the install (${SEE})` };
                return found;
            }
            const message = misfit(parameter, given[parameter.key], kinds);
            if (message) {
                found.problem = { field, message };
                return found;
            }
        }
    }
    return found;
}
// Throws on a refusal; returns the warnings otherwise.
export function requireParametersFit(spec, cwd) {
    const { problem, warnings } = parameterFindings(spec, cwd);
    if (problem)
        throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${problem.field}: ${problem.message}`, ["sandbox.json"]);
    return warnings;
}
//# sourceMappingURL=parameters.js.map