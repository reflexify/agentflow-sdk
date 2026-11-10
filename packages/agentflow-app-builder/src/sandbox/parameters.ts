import fs from "node:fs";
import path from "node:path";
import { clip } from "../core.js";
import { CliError } from "../errors.js";
import { nearest } from "../suggest.js";
import type { SandboxSpec } from "./spec.js";

type Rec = Record<string, unknown>;
type Declared = { key: string; type: string; category?: string; required: boolean; hasDefault: boolean; options: string[] };

const REFERENCE_KINDS: Record<string, { kind: string; write: string }> = {
  group_ref: { kind: "group", write: "@group:<key>" },
  user_ref: { kind: "person", write: "@person:<handle>" },
  unit_ref: { kind: "unit", write: "@unit:<key>" },
  service_principal_ref: { kind: "principal", write: "@principal:<key>" },
  connection_ref: { kind: "connection", write: "@connection:<key>" },
  sla_policy_ref: { kind: "sla_policy", write: "@sla_policy:<key>" },
  escalation_policy_ref: { kind: "escalation_policy", write: "@escalation_policy:<key>" },
};
// References the sandbox cannot create: there is no `@kind:` form for them, and a sandbox holds none an id could name.
const ID_ONLY: Record<string, string> = { secret_ref: "a secret" };
// The connection categories a sandbox cannot make a connection for: it makes email connections only (resend or loopback).
const NO_SANDBOX_CONNECTION = new Set(["crm", "database", "data_warehouse", "file_storage", "erp"]);
const SEE = `the release skill's reference/sandbox-json.md, "What a sandbox cannot hold"`;
// Required packages whose install needs what no sandbox can give a dependency, so a sandbox install of a package that
// requires one always fails. A dependency's answers go in install.decisions, where no `@` reference is resolved.
const NEVER_IN_A_SANDBOX: Record<string, string> = {
  "rfx/erp-core":
    "its required erp parameter is an ERP connection, and a sandbox holds email connections only (nor can install.decisions name a sandbox group for its erp_readers)",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHOWN_KINDS: Record<string, string> = {
  group: "a group",
  person: "a person",
  unit: "a unit",
  principal: "a principal",
  connection: "a connection",
  sla_policy: "an SLA policy",
  escalation_policy: "an escalation policy",
};

const isObject = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const show = (value: unknown): string => (typeof value === "string" ? `\`${clip(value)}\`` : clip(JSON.stringify(value) ?? String(value)));

function builtManifest(cwd: string): Rec | undefined {
  try {
    const manifest: unknown = JSON.parse(fs.readFileSync(path.join(cwd, "package", "manifest.json"), "utf8"));
    return isObject(manifest) ? manifest : undefined;
  } catch {
    return undefined;
  }
}

function declaredParameters(manifest: Rec | undefined): Declared[] | undefined {
  if (!manifest || !Array.isArray(manifest.parameters)) return undefined;
  return manifest.parameters.flatMap((parameter: unknown): Declared[] =>
    isObject(parameter) && typeof parameter.key === "string" && typeof parameter.type === "string"
      ? [{
          key: parameter.key,
          type: parameter.type,
          ...(typeof parameter.category === "string" ? { category: parameter.category } : {}),
          required: parameter.required === true,
          hasDefault: "default" in parameter,
          options: Array.isArray(parameter.options) ? parameter.options.filter((o): o is string => typeof o === "string") : [],
        }]
      : [],
  );
}

const PARAM_SLOT = /^@param:(.+)$/;

function slotsIn(value: unknown, found: Set<string>): void {
  if (typeof value === "string") {
    const key = PARAM_SLOT.exec(value)?.[1];
    if (key) found.add(key);
  } else if (Array.isArray(value)) {
    for (const item of value) slotsIn(item, found);
  } else if (isObject(value)) {
    for (const item of Object.values(value)) slotsIn(item, found);
  }
}

// Each parameter some object under package/objects names, with the first such object's key (`workflow:review`; a
// file's `__` is the `/` of a key like `entity_field:case/title`). A sandbox turns every optional feature on, and the
// builder writes none, so every object is enabled. Undefined when package/ holds no objects folder to read.
function usersOfParameters(cwd: string): Map<string, string> | undefined {
  const root = path.join(cwd, "package", "objects");
  const users = new Map<string, string>();
  try {
    for (const kind of fs.readdirSync(root).sort()) {
      if (!fs.statSync(path.join(root, kind)).isDirectory()) continue;
      for (const file of fs.readdirSync(path.join(root, kind)).sort()) {
        if (!file.endsWith(".json")) continue;
        const found = new Set<string>();
        slotsIn(JSON.parse(fs.readFileSync(path.join(root, kind, file), "utf8")), found);
        for (const key of found) if (!users.has(key)) users.set(key, `${kind}:${file.slice(0, -".json".length).replaceAll("__", "/")}`);
      }
    }
  } catch {
    return undefined;
  }
  return users;
}

// Why no value in sandbox.json can work for this parameter, when none can: setup looks the value up among what the
// sandbox holds, and a sandbox holds no secret and email connections only (resend or loopback).
function ungivable(parameter: Declared): string | undefined {
  if (parameter.type === "secret_ref") return "a sandbox holds no secret, so no id can name one there";
  if (parameter.type === "connection_ref" && parameter.category !== undefined && NO_SANDBOX_CONNECTION.has(parameter.category)) {
    return `a sandbox holds email connections only (resend or loopback), so there is no ${parameter.category} connection to name`;
  }
  return undefined;
}

function misfit(parameter: Declared, value: unknown): string | undefined {
  if (value === null) return `null is not a value ${parameter.key} (${parameter.type}) takes: leave the key out to give it no value`;
  const idOnly = ID_ONLY[parameter.type];
  if (idOnly) {
    if (typeof value === "string" && UUID.test(value)) return undefined;
    const written = typeof value === "string" && value.startsWith("@") && !value.startsWith("@@");
    return written
      ? `${show(value)} cannot be resolved: a sandbox holds no ${idOnly.replace(/^an? /, "")} for ${parameter.key} to name`
      : `${show(value)} is not an id, and ${parameter.key} is a ${parameter.type}: a sandbox holds no ${idOnly.replace(/^an? /, "")} an id could name`;
  }
  const reference = REFERENCE_KINDS[parameter.type];
  if (reference) {
    if (typeof value === "string" && value.startsWith("@") && !value.startsWith("@@")) {
      const given = value.slice(1, value.indexOf(":") === -1 ? undefined : value.indexOf(":"));
      if (given === reference.kind) return undefined;
      return Object.hasOwn(SHOWN_KINDS, given)
        ? `${show(value)} is ${SHOWN_KINDS[given]}, but ${parameter.key} is a ${parameter.type}: write ${reference.write}`
        : `${show(value)} is not a reference sandbox.json knows, and ${parameter.key} is a ${parameter.type}: write ${reference.write}`;
    }
    if (typeof value === "string" && UUID.test(value)) return undefined;
    if (parameter.type === "connection_ref" && isObject(value)) return undefined;
    return `${show(value)} is not a reference, but ${parameter.key} is a ${parameter.type}: write ${reference.write}`;
  }
  if (parameter.type === "text") return typeof value === "string" ? undefined : `${show(value)} is not a string, which ${parameter.key} takes`;
  if (parameter.type === "number") return typeof value === "number" ? undefined : `${show(value)} is not a number, which ${parameter.key} takes`;
  if (parameter.type === "enum") {
    return typeof value === "string" && parameter.options.includes(value)
      ? undefined
      : `${JSON.stringify(value)} is not one of ${parameter.options.join(", ")}, which ${parameter.key} takes`;
  }
  return undefined;
}

export interface ParameterFindings {
  problem: { field: string; message: string } | null;
  warnings: string[];
}

// The first way sandbox.json's install.parameters disagree with the parameters package/manifest.json declares, and
// the answers it leaves out. The platform refuses a required parameter with no default and no value only when an
// enabled object, a grant or the audience uses it, which the manifest alone cannot tell, so that is a warning. A
// secret, or a connection a sandbox cannot make, that an object uses is a refusal with a value as without one. A
// required package no sandbox can install is refused before this, by refuseUnsandboxablePackages.
export function parameterFindings(spec: SandboxSpec, cwd: string): ParameterFindings {
  const manifest = builtManifest(cwd);
  const declared = declaredParameters(manifest);
  const found: ParameterFindings = { problem: null, warnings: [] };
  if (!declared) return found;
  const install = isObject(spec.install) ? spec.install : {};
  const given = isObject(install.parameters) ? install.parameters : {};
  // Where sandbox.json answers a parameter other than install.parameters: install.decisions.parameters["<package id>"].
  const decided = (key: string): string | undefined => {
    const decisions = isObject(install.decisions) && isObject(install.decisions.parameters) ? install.decisions.parameters : {};
    const id = typeof manifest?.id === "string" ? manifest.id : undefined;
    return id !== undefined && isObject(decisions[id]) && Object.hasOwn(decisions[id], key)
      ? `install.decisions.parameters.${id}.${key}`
      : undefined;
  };
  const users = usersOfParameters(cwd);
  const keys = declared.map((parameter) => parameter.key);
  for (const name of Object.keys(given).sort()) {
    if (keys.includes(name)) continue;
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
    const why = ungivable(parameter);
    const user = why ? users?.get(parameter.key) : undefined;
    const valueRefused = supplied !== undefined && (parameter.required || parameter.type === "secret_ref");
    if (why && user && (valueRefused || (supplied === undefined && parameter.required && !parameter.hasDefault))) {
      const kind = `${parameter.type}${parameter.category ? `, category ${parameter.category}` : ""}`;
      found.problem = {
        field: valueRefused ? supplied! : field,
        message:
          valueRefused
            ? `${parameter.key} (${kind}) is given a value, but ${why}; ${user} uses it, so AgentFlow refuses the install. Test what needs it on a real installation (${SEE})`
            : `the manifest requires parameter ${parameter.key} (${kind}), which has no default and no value, and ${why}; ${user} uses it, so AgentFlow refuses the install. Test what needs it on a real installation (${SEE})`,
      };
      return found;
    }
    if (!Object.hasOwn(given, parameter.key)) {
      if (parameter.required && !parameter.hasDefault) {
        found.warnings.push(
          `${field}: the manifest requires parameter ${parameter.key} (${parameter.type}), which has no default and no value in sandbox.json; AgentFlow refuses the install when an enabled object, a grant or the audience uses it`,
        );
      }
      continue;
    }
    const value = given[parameter.key];
    if (value === undefined) continue;
    const message = misfit(parameter, value);
    if (message) {
      found.problem = { field, message };
      return found;
    }
  }
  const required = manifest?.requires;
  const packages = isObject(required) && Array.isArray(required.packages) ? required.packages : [];
  for (const entry of packages) {
    if (!isObject(entry) || typeof entry.id !== "string") continue;
    if (Object.hasOwn(NEVER_IN_A_SANDBOX, entry.id)) continue;
    found.warnings.push(
      `requires.packages: a sandbox uploads this package alone, so ${entry.id} comes from the deployment's app catalog and must need no group, unit, person, principal, connection or secret, or AgentFlow refuses the install (${SEE})`,
    );
  }
  return found;
}

// Refuses a manifest (`file` names where it was read) that requires a package no sandbox can install: nothing in
// sandbox.json can change that, so the refusal names the manifest's requires.packages.
export function refuseUnsandboxablePackages(manifest: unknown, file: string): void {
  const required = isObject(manifest) && isObject(manifest.requires) ? manifest.requires : {};
  for (const entry of Array.isArray(required.packages) ? required.packages : []) {
    if (!isObject(entry) || typeof entry.id !== "string" || !Object.hasOwn(NEVER_IN_A_SANDBOX, entry.id)) continue;
    throw new CliError(
      "SANDBOX_SPEC_INVALID",
      `${file}: requires.packages: the package requires ${entry.id}, which cannot be installed in a sandbox: ${NEVER_IN_A_SANDBOX[entry.id]}, so AgentFlow refuses the install whatever sandbox.json says. Test what needs ${entry.id} on a real installation that has it, and the rest offline; a project that requires it keeps no sandbox.json and runs no sandbox check, deploy --sandbox or test:sandbox (${SEE})`,
      [file],
    );
  }
}

// Throws on a refusal; returns the warnings otherwise.
export function requireParametersFit(spec: SandboxSpec, cwd: string): string[] {
  refuseUnsandboxablePackages(builtManifest(cwd), "package/manifest.json");
  const { problem, warnings } = parameterFindings(spec, cwd);
  if (problem) throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${problem.field}: ${problem.message}`, ["sandbox.json"]);
  return warnings;
}
