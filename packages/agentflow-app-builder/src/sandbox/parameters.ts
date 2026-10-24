import fs from "node:fs";
import path from "node:path";
import { clip } from "../core.js";
import { CliError } from "../errors.js";
import { nearest } from "../suggest.js";
import type { SandboxSpec } from "./spec.js";

type Rec = Record<string, unknown>;
type Declared = { key: string; type: string; required: boolean; hasDefault: boolean; options: string[] };

const REFERENCE_KINDS: Record<string, { kind: string; write: string }> = {
  group_ref: { kind: "group", write: "@group:<key>" },
  user_ref: { kind: "person", write: "@person:<handle>" },
  unit_ref: { kind: "unit", write: "@unit:<key>" },
  service_principal_ref: { kind: "principal", write: "@principal:<key>" },
  connection_ref: { kind: "connection", write: "@connection:<key>" },
};
// References the sandbox cannot create: there is no `@kind:` form for them, so the answer is an id.
const ID_ONLY: Record<string, string> = { secret_ref: "a secret", sla_policy_ref: "an SLA policy", escalation_policy_ref: "an escalation policy" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHOWN_KINDS = new Set(["group", "person", "unit", "principal", "connection"]);

const isObject = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const show = (value: unknown): string => (typeof value === "string" ? `\`${clip(value)}\`` : clip(JSON.stringify(value) ?? String(value)));

function declaredParameters(cwd: string): Declared[] | undefined {
  let manifest: unknown;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(cwd, "package", "manifest.json"), "utf8"));
  } catch {
    return undefined;
  }
  if (!isObject(manifest) || !Array.isArray(manifest.parameters)) return undefined;
  return manifest.parameters.flatMap((parameter: unknown): Declared[] =>
    isObject(parameter) && typeof parameter.key === "string" && typeof parameter.type === "string"
      ? [{
          key: parameter.key,
          type: parameter.type,
          required: parameter.required === true,
          hasDefault: "default" in parameter,
          options: Array.isArray(parameter.options) ? parameter.options.filter((o): o is string => typeof o === "string") : [],
        }]
      : [],
  );
}

function misfit(parameter: Declared, value: unknown): string | undefined {
  if (value === null) return `null is not a value ${parameter.key} (${parameter.type}) takes: leave the key out to give it no value`;
  const idOnly = ID_ONLY[parameter.type];
  if (idOnly) {
    if (typeof value === "string" && UUID.test(value)) return undefined;
    const written = typeof value === "string" && value.startsWith("@") && !value.startsWith("@@");
    return written
      ? `${show(value)} cannot be resolved: the sandbox creates no ${idOnly.replace(/^an? /, "")}, so give ${parameter.key} the id of one that exists`
      : `${show(value)} is not an id, but ${parameter.key} is a ${parameter.type}: give the id of ${idOnly} that exists`;
  }
  const reference = REFERENCE_KINDS[parameter.type];
  if (reference) {
    if (typeof value === "string" && value.startsWith("@") && !value.startsWith("@@")) {
      const given = value.slice(1, value.indexOf(":") === -1 ? undefined : value.indexOf(":"));
      if (given === reference.kind) return undefined;
      return SHOWN_KINDS.has(given)
        ? `${show(value)} is a ${given}, but ${parameter.key} is a ${parameter.type}: write ${reference.write}`
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
// enabled object, a grant or the audience uses it, which the manifest alone cannot tell, so that is a warning.
export function parameterFindings(spec: SandboxSpec, cwd: string): ParameterFindings {
  const declared = declaredParameters(cwd);
  const found: ParameterFindings = { problem: null, warnings: [] };
  if (!declared) return found;
  const install = isObject(spec.install) ? spec.install : {};
  const given = isObject(install.parameters) ? install.parameters : {};
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
  return found;
}

// Throws on a refusal; returns the warnings otherwise.
export function requireParametersFit(spec: SandboxSpec, cwd: string): string[] {
  const { problem, warnings } = parameterFindings(spec, cwd);
  if (problem) throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${problem.field}: ${problem.message}`, ["sandbox.json"]);
  return warnings;
}
