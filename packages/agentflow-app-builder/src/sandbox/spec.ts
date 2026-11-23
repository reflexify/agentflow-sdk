import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors.js";
import { canonicalJson } from "../seal/canonical.js";

export type SandboxSpec = Record<string, unknown>;
type Problem = { field: string; message: string };
type Rec = Record<string, unknown>;

// `open`: members it does not name are let through, as on a server type without `deny_unknown_fields`.
type Struct = { fields: Record<string, Field>; required: string[]; open?: true };
type Field =
  | "string"
  | "optstring"
  | "bool"
  | "optbool"
  | "int"
  | "strings"
  | "optstrings"
  | "stringorstrings"
  | "map"
  | "any"
  | "objects"
  | { variant: readonly string[] }
  | { list: Struct }
  | { object: Struct; notNull?: true };

const ROLE: Struct = { fields: { name: "string", permissions: "strings" }, required: ["name"] };
const KEYED: Struct = { fields: { key: "string", name: "string" }, required: ["key", "name"] };
const UNIT: Struct = { fields: { key: "string", name: "string", parent: "optstring" }, required: ["key", "name"] };
const PRINCIPAL: Struct = {
  fields: { key: "string", name: "string", roles: "strings", groups: "strings", owner_eligible: "bool" },
  required: ["key", "name"],
};
type Owner = "mail" | "odoo" | "chat";
const OWNER_NOUN: Record<Owner, string> = { mail: "an email connection", odoo: "an odoo connection", chat: "a chat connection" };
const SETTINGS: readonly (readonly [member: string, owner: Owner, field: Field])[] = [
  ["from", "mail", "optstring"],
  ["reply_to", "mail", "optstring"],
  ["base_url", "odoo", "optstring"],
  ["database", "odoo", "optstring"],
  ["login", "odoo", "optstring"],
  ["credential_expires_at", "odoo", "optstring"],
  ["origins", "chat", "optstrings"],
  ["languages", "chat", "optstrings"],
  ["greeting", "chat", "optstring"],
  ["verify_methods", "chat", "optstrings"],
  ["auto_typing", "chat", "optbool"],
  ["email_connection", "chat", "optstring"],
];
const CONNECTION_SETTINGS: Struct = { fields: Object.fromEntries(SETTINGS.map(([member, , field]) => [member, field])), required: [] };
const CONNECTION: Struct = {
  fields: { key: "string", kind: "string", secret_env: "optstring", settings: { object: CONNECTION_SETTINGS }, channel: "optstring" },
  required: ["key", "kind"],
};
const SLA_UNITS = ["minutes", "hours", "days", "business_hours", "business_days"] as const;
const DURATION: Struct = { fields: { value: "int", unit: { variant: SLA_UNITS } }, required: ["value", "unit"], open: true };
const PRIORITIES = ["urgent", "high", "normal", "low"] as const;
const TARGETS: Struct = {
  fields: Object.fromEntries(PRIORITIES.map((p) => [p, { object: DURATION, notNull: true }])),
  required: [...PRIORITIES],
};
const SLA_POLICY: Struct = {
  fields: { key: "string", name: "string", targets: { object: TARGETS, notNull: true } },
  required: ["key", "name", "targets"],
};
// Steps stay unchecked here beyond being objects: AgentFlow judges their shape at create, before any write.
const ESCALATION_POLICY: Struct = { fields: { key: "string", name: "string", steps: "objects" }, required: ["key", "name", "steps"] };
const ORG_SETTINGS: Struct = { fields: { timezone: "optstring", locale: "optstring" }, required: [] };
const PERSON: Struct = {
  fields: { handle: "string", name: "string", roles: "strings", groups: "strings", unit: "optstring" },
  required: ["handle", "name"],
};
const INSTALL: Struct = { fields: { parameters: "map", decisions: "map" }, required: [] };
const FIELD_ACCESS_LEVELS = ["read", "read_write"] as const;
const FIELD_PROFILE: Struct = {
  fields: {
    name: "string",
    access: { variant: FIELD_ACCESS_LEVELS },
    fields: "stringorstrings",
    groups: "strings",
    people: "strings",
    principals: "strings",
    agents: "strings",
  },
  required: ["name", "access", "fields"],
};
const FIELD_SECURITY: Struct = { fields: { profiles: { list: FIELD_PROFILE }, secure: "stringorstrings" }, required: [] };
const SPEC: Struct = {
  fields: {
    owner: "string",
    roles: { list: ROLE },
    groups: { list: KEYED },
    units: { list: UNIT },
    principals: { list: PRINCIPAL },
    connections: { list: CONNECTION },
    sla_policies: { list: SLA_POLICY },
    escalation_policies: { list: ESCALATION_POLICY },
    settings: { object: ORG_SETTINGS },
    people: { list: PERSON },
    install: { object: INSTALL },
    dependencies: "strings",
    field_security: { object: FIELD_SECURITY },
  },
  required: ["people"],
};

const BUILT_IN_ROLES = ["admin", "designer", "viewer"];
const FORBIDDEN_PERMISSIONS = ["sandbox.create", "deployment.admin", "retention.delete"];
const MAX_PER_LIST = 100;
const KEY = /^[a-z][a-z0-9_]{0,31}$/;
const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const LISTS = ["roles", "groups", "units", "principals", "connections", "sla_policies", "escalation_policies", "people"] as const;

const isObject = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const join = (path: string, member: string): string => (path ? `${path}.${member}` : member);
const problem = (field: string, message: string): Problem => ({ field, message });
const list = (spec: Rec, name: string): Rec[] => (Array.isArray(spec[name]) ? (spec[name] as Rec[]) : []);
const strings = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);
const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

// What serde reads as an i64 from the JSON the CLI sends, which JSON.stringify writes.
const isI64 = (value: unknown): boolean =>
  typeof value === "number" && Number.isInteger(value) && value >= -(2 ** 63) && value < 2 ** 63;

function shapeStruct(value: unknown, struct: Struct, path: string): Problem | null {
  if (!isObject(value)) return problem(path || "spec", "expected an object");
  for (const member of Object.keys(value).sort()) {
    if (!Object.hasOwn(struct.fields, member)) {
      if (struct.open) continue;
      return problem(join(path, member), `unknown field \`${member}\``);
    }
    const found = shapeField(value[member], struct.fields[member]!, join(path, member));
    if (found) return found;
  }
  for (const member of struct.required) {
    if (!Object.hasOwn(value, member)) return problem(path || "spec", `missing field \`${member}\``);
  }
  return null;
}

function shapeField(value: unknown, field: Field, path: string): Problem | null {
  if (field === "string") return typeof value === "string" ? null : problem(path, "expected a string");
  if (field === "optstring") return value === null || typeof value === "string" ? null : problem(path, "expected a string");
  if (field === "bool") return typeof value === "boolean" ? null : problem(path, "expected a boolean");
  if (field === "optbool") return value === null ? null : shapeField(value, "bool", path);
  if (field === "optstrings") return value === null ? null : shapeField(value, "strings", path);
  if (field === "int") return isI64(value) ? null : problem(path, "expected an integer");
  if (field === "map") return isObject(value) ? null : problem(path, "expected an object");
  if (field === "any") return null;
  if (field === "objects") {
    if (!Array.isArray(value)) return problem(path, "expected a list");
    const bad = value.findIndex((item) => !isObject(item));
    return bad === -1 ? null : problem(`${path}[${bad}]`, "expected an object");
  }
  if (field === "stringorstrings") return typeof value === "string" ? null : shapeField(value, "strings", path);
  if (field === "strings") {
    if (!Array.isArray(value)) return problem(path, "expected a list");
    const bad = value.findIndex((item) => typeof item !== "string");
    return bad === -1 ? null : problem(`${path}[${bad}]`, "expected a string");
  }
  if ("variant" in field) {
    if (typeof value !== "string") return problem(path, "expected a string");
    return field.variant.includes(value)
      ? null
      : problem(path, `unknown variant \`${value}\`, expected one of ${field.variant.map((v) => `\`${v}\``).join(", ")}`);
  }
  if ("list" in field) {
    if (!Array.isArray(value)) return problem(path, "expected a list");
    for (let i = 0; i < value.length; i++) {
      const found = shapeStruct(value[i], field.list, `${path}[${i}]`);
      if (found) return found;
    }
    return null;
  }
  return value === null && !field.notNull ? null : shapeStruct(value, field.object, path);
}

function checkLengths(spec: Rec): Problem | null {
  for (const name of LISTS) {
    if (list(spec, name).length > MAX_PER_LIST) return problem(name, `at most ${MAX_PER_LIST} entries`);
  }
  return null;
}

function nameProblem(field: string, name: string): Problem | null {
  const length = [...name.trim()].length;
  return length === 0 || length > 120 ? problem(field, "a name of 1 to 120 characters") : null;
}

function checkKeys(name: string, member: string, entries: Rec[]): { found: Problem | null; keys: Set<string> } {
  const keys = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    const value = entries[i]![member] as string;
    const field = `${name}[${i}].${member}`;
    if (!KEY.test(value)) return { found: problem(field, `\`${value}\` must match [a-z][a-z0-9_]{0,31}`), keys };
    if (keys.has(value)) return { found: problem(field, `\`${value}\` is used twice`), keys };
    keys.add(value);
  }
  return { found: null, keys };
}

function checkRoles(roles: Rec[]): { found: Problem | null; declared: Set<string> } {
  const declared = new Set<string>();
  const lowered = new Set(BUILT_IN_ROLES);
  for (let i = 0; i < roles.length; i++) {
    const name = roles[i]!.name as string;
    const field = `roles[${i}].name`;
    const named = nameProblem(field, name);
    if (named) return { found: named, declared };
    const key = name.trim().toLowerCase();
    if (lowered.has(key)) return { found: problem(field, `\`${name}\` is already a role`), declared };
    lowered.add(key);
    declared.add(name);
    for (const permission of strings(roles[i]!.permissions)) {
      if (FORBIDDEN_PERMISSIONS.includes(permission)) {
        return { found: problem(`roles[${i}].permissions`, `role \`${name}\` may not hold \`${permission}\` in a sandbox`), declared };
      }
    }
  }
  return { found: null, declared };
}

function checkUnits(units: Rec[]): Problem | null {
  for (let i = 0; i < units.length; i++) {
    const named = nameProblem(`units[${i}].name`, units[i]!.name as string);
    if (named) return named;
    const parent = text(units[i]!.parent);
    if (parent !== undefined && !units.slice(0, i).some((earlier) => earlier.key === parent)) {
      return problem(`units[${i}].parent`, `\`${parent}\` is not an earlier unit`);
    }
  }
  return null;
}

function unknownMember(values: string[], known: (value: string) => boolean): string | undefined {
  return values.find((value) => !known(value));
}

function checkPrincipals(principals: Rec[], roleKnown: (name: string) => boolean, groups: Set<string>): Problem | null {
  for (let i = 0; i < principals.length; i++) {
    const principal = principals[i]!;
    const named = nameProblem(`principals[${i}].name`, principal.name as string);
    if (named) return named;
    const role = unknownMember(strings(principal.roles), roleKnown);
    if (role !== undefined) return problem(`principals[${i}].roles`, `\`${role}\` is not a built-in or declared role`);
    const group = unknownMember(strings(principal.groups), (g) => groups.has(g));
    if (group !== undefined) return problem(`principals[${i}].groups`, `\`${group}\` is not a declared group`);
  }
  return null;
}

function isEmailAddress(value: string): boolean {
  const parts = value.split("@");
  if (parts.length !== 2 || parts[0]!.trim() === "") return false;
  const domain = parts[1]!.trim().replace(/>$/, "");
  return domain !== "" && !domain.startsWith("[") && domain.includes(".");
}

// The kinds a connection may be, as AgentFlow takes them: two email connections, the sandbox-only ERP connection, a
// real Odoo and website chat. A loopback with a channel is a messaging loopback instead of the email one.
export const CONNECTION_KINDS = ["resend", "loopback", "sandbox_erp", "odoo", "chat"] as const;
const TAKES_NO_SECRET = new Set(["loopback", "sandbox_erp", "chat"]);
// The channels a messaging loopback may carry: the contract's, but `chat`, which is a connection of its own.
export const LOOPBACK_CHANNELS = ["sms", "whatsapp", "slack", "teams", "voice", "webhook"] as const;
const SETTINGS_OWNER: Record<string, Owner> = { resend: "mail", loopback: "mail", odoo: "odoo", chat: "chat" };
export const EMAIL_KINDS: ReadonlySet<string> = new Set(["resend", "loopback"]);

const settingsOf = (connection: Rec): Rec => (isObject(connection.settings) ? connection.settings : {});
const present = (value: unknown): boolean => value !== undefined && value !== null;

function checkConnections(connections: Rec[]): Problem | null {
  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i]!;
    const kind = connection.kind as string;
    if (!(CONNECTION_KINDS as readonly string[]).includes(kind)) {
      return problem(
        `connections[${i}].kind`,
        `\`${kind}\` is not supported; only \`resend\`, \`loopback\`, \`sandbox_erp\`, \`odoo\` and \`chat\` are`,
      );
    }
    if (TAKES_NO_SECRET.has(kind) && present(connection.secret_env)) {
      return problem(`connections[${i}].secret_env`, `a ${kind} connection takes no secret`);
    }
    const channel = text(connection.channel);
    if (channel !== undefined) {
      if (kind !== "loopback") return problem(`connections[${i}].channel`, "only a loopback connection takes a channel");
      if (channel === "chat") {
        return problem(`connections[${i}].channel`, "`chat` is not a loopback channel: website chat is its own `chat` connection kind");
      }
      if (!(LOOPBACK_CHANNELS as readonly string[]).includes(channel)) {
        return problem(`connections[${i}].channel`, `\`${channel}\` is not a channel: write one of ${LOOPBACK_CHANNELS.join(", ")}`);
      }
      if (present(connection.settings)) {
        return problem(`connections[${i}].settings`, "a loopback connection with a channel takes no settings");
      }
      continue;
    }
    if (kind === "sandbox_erp") {
      if (present(connection.settings)) {
        return problem(`connections[${i}].settings`, "a sandbox_erp connection takes no settings");
      }
      continue;
    }
    const owner = SETTINGS_OWNER[kind]!;
    const settings = settingsOf(connection);
    const foreign = SETTINGS.find(([member, belongs]) => belongs !== owner && present(settings[member]));
    if (foreign) return problem(`connections[${i}].settings.${foreign[0]}`, `\`${foreign[0]}\` belongs to ${OWNER_NOUN[foreign[1]]}`);
    const found = OWNER_CHECKS[owner](i, connections);
    if (found) return found;
  }
  return null;
}

function checkMailSettings(i: number, connections: Rec[]): Problem | null {
  const settings = settingsOf(connections[i]!);
  const from = text(settings.from)?.trim();
  if (!from) return problem(`connections[${i}].settings.from`, `a ${String(connections[i]!.kind)} connection needs the address it sends from`);
  if (!isEmailAddress(from)) return problem(`connections[${i}].settings.from`, `\`${from}\` is not an email address`);
  const replyTo = text(settings.reply_to)?.trim();
  if (replyTo && !isEmailAddress(replyTo)) {
    return problem(`connections[${i}].settings.reply_to`, `\`${replyTo}\` is not an email address`);
  }
  return null;
}

// An odoo connection's settings, by the rules of the Odoo credential form AgentFlow checks them against: the address, the
// database and the login are required, the address is an http or https URL, and an expiry is a date. The API key is the
// connection's secret, from secret_env.
function checkOdooSettings(i: number, connections: Rec[]): Problem | null {
  const settings = settingsOf(connections[i]!);
  for (const member of ["base_url", "database", "login"] as const) {
    if (!text(settings[member])?.trim()) return problem(`connections[${i}].settings.${member}`, `\`${member}\` is required`);
  }
  const baseUrl = text(settings.base_url)!.trim();
  let url: URL | undefined;
  try {
    url = new URL(baseUrl);
  } catch {
    url = undefined;
  }
  if (!url || !["http:", "https:"].includes(url.protocol) || url.hostname === "") {
    return problem(`connections[${i}].settings.base_url`, "`base_url` must be an http or https URL");
  }
  const expires = text(settings.credential_expires_at)?.trim();
  if (expires && !isCalendarDate(expires)) {
    return problem(`connections[${i}].settings.credential_expires_at`, "`credential_expires_at` must be a date written YYYY-MM-DD");
  }
  return null;
}

// A real day written YYYY-MM-DD, as AgentFlow's date parse takes it: 2026-13-45 is refused, not rolled over.
function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(day.getTime()) && day.toISOString().slice(0, 10) === value;
}

const MAX_ORIGINS = 20;
const MAX_GREETING_CHARS = 500;
const CHAT_LANGUAGES: readonly string[] = ["en", "vi"];
const VERIFY_METHODS: readonly string[] = ["site", "email_code", "agentflow"];

// WHATWG drops an empty query or fragment, which AgentFlow's parser keeps, so the text is read for those.
function originProblem(given: string): string | null {
  const raw = given.trim();
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return `\`${raw}\` is not an origin`;
  }
  const host = url.hostname;
  if (host === "" || (!host.startsWith("[") && (host.endsWith(".") || /[^A-Za-z0-9.-]/.test(host)))) {
    return `\`${raw}\` names no host an origin can have`;
  }
  if (url.username || url.password || !["", "/"].includes(url.pathname) || raw.includes("?") || raw.includes("#")) {
    return `\`${raw}\` is not an origin: write a scheme, a host and an optional port, with no path`;
  }
  const local = host === "localhost" || host === "127.0.0.1";
  if (url.protocol === "https:" || (url.protocol === "http:" && local)) return null;
  return `\`${raw}\` is not an \`https\` origin; \`http\` is accepted only on \`localhost\` and \`127.0.0.1\``;
}

function checkChatSettings(i: number, connections: Rec[]): Problem | null {
  const settings = settingsOf(connections[i]!);
  const at = `connections[${i}].settings`;
  if (Array.isArray(settings.origins)) {
    const origins = settings.origins as string[];
    if (origins.length === 0) return problem(`${at}.origins`, "list at least one origin the website is served from");
    if (origins.length > MAX_ORIGINS) return problem(`${at}.origins`, `a chat connection allows at most ${MAX_ORIGINS} origins`);
    for (const [n, raw] of origins.entries()) {
      const why = originProblem(raw);
      if (why) return problem(`${at}.origins[${n}]`, why);
    }
  }
  if (Array.isArray(settings.languages)) {
    const languages = settings.languages as string[];
    if (languages.length === 0) return problem(`${at}.languages`, "choose at least one language");
    const n = languages.findIndex((language) => !CHAT_LANGUAGES.includes(language));
    if (n !== -1) return problem(`${at}.languages[${n}]`, `\`${languages[n]}\` is not a chat language: write en or vi`);
  }
  const greeting = text(settings.greeting);
  if (greeting !== undefined && [...greeting.trim()].length > MAX_GREETING_CHARS) {
    return problem(`${at}.greeting`, `a greeting is at most ${MAX_GREETING_CHARS} characters`);
  }
  const methods = strings(settings.verify_methods);
  const n = methods.findIndex((method) => !VERIFY_METHODS.includes(method));
  if (n !== -1) {
    return problem(`${at}.verify_methods[${n}]`, `\`${methods[n]}\` is not a way to verify a visitor: write site, email_code or agentflow`);
  }
  const email = text(settings.email_connection);
  if (!methods.includes("email_code")) {
    return email === undefined ? null : problem(`${at}.email_connection`, "`email_connection` is used only with `email_code`");
  }
  if (email === undefined) {
    return problem(`${at}.email_connection`, "`email_code` sends its codes through an email connection: name an earlier one in `email_connection`");
  }
  const earlier = connections.slice(0, i).some((connection) => connection.key === email && EMAIL_KINDS.has(kindOf(connection)));
  return earlier ? null : problem(`${at}.email_connection`, `\`${email}\` is not an earlier email connection`);
}

const OWNER_CHECKS: Record<Owner, (i: number, connections: Rec[]) => Problem | null> = {
  mail: checkMailSettings,
  odoo: checkOdooSettings,
  chat: checkChatSettings,
};

// The CLI's own member: the sealed packages deploy --sandbox uploads before the folder's package. AgentFlow never sees it.
function checkDependencies(files: string[]): Problem | null {
  const seen = new Set<string>();
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    if (!file.endsWith(".afpkg")) return problem(`dependencies[${i}]`, `\`${file}\` is not a sealed package: name an .afpkg file`);
    const normal = path.normalize(file);
    if (seen.has(normal)) return problem(`dependencies[${i}]`, `\`${file}\` is named twice`);
    seen.add(normal);
  }
  return null;
}

const POLICY_NAME_MAX_CHARS = 80;
const BUSINESS_UNITS: readonly string[] = ["business_hours", "business_days"];
const UNIT_MAX: Record<string, number> = { minutes: 525_600, hours: 8_760, business_hours: 8_760, days: 365, business_days: 365 };

// The checks POST /admin/sla-policies makes, in its order and wording.
function checkSlaPolicies(policies: Rec[]): { found: Problem | null; keys: Set<string> } {
  const keyed = checkKeys("sla_policies", "key", policies);
  if (keyed.found) return keyed;
  const names = new Set<string>();
  for (let i = 0; i < policies.length; i++) {
    const named = checkPolicyName("sla_policies", i, policies[i]!.name as string, names);
    if (named) return { found: named, keys: keyed.keys };
    const targets = policies[i]!.targets as Record<string, { value: number; unit: string }>;
    for (const level of PRIORITIES) {
      const { value, unit } = targets[level]!;
      const max = UNIT_MAX[unit]!;
      if (value < 1 || value > max) {
        const words = unit.replace("_", " ");
        return { found: problem(`sla_policies[${i}].targets`, `the ${level} target must be between 1 and ${max} ${words}`), keys: keyed.keys };
      }
    }
    const business = PRIORITIES.map((level) => BUSINESS_UNITS.includes(targets[level]!.unit));
    if (business.some((b) => b !== business[0])) {
      return {
        found: problem(`sla_policies[${i}].targets`, "the four targets all run round the clock, or all on the business calendar"),
        keys: keyed.keys,
      };
    }
  }
  return keyed;
}

// A policy name as the admin routes take it, unique without case like the tables' `lower(name)` index.
function checkPolicyName(list: string, i: number, name: string, seen: Set<string>): Problem | null {
  const length = [...name.trim()].length;
  if (length === 0 || length > POLICY_NAME_MAX_CHARS) {
    return problem(`${list}[${i}].name`, `a policy name is 1 to ${POLICY_NAME_MAX_CHARS} characters`);
  }
  const folded = name.trim().toLowerCase();
  if (seen.has(folded)) return problem(`${list}[${i}].name`, `\`${name}\` is already a policy's name`);
  seen.add(folded);
  return null;
}

type Slot = "group" | "unit" | "person";
type Known = Record<Slot, Set<string>>;
const SLOT_WRITE: Record<Slot, string> = { group: "@group:<key>", unit: "@unit:<key>", person: "@person:<handle>" };
const KIND_NOUN: Record<string, string> = {
  group: "a group",
  unit: "a unit",
  principal: "a principal",
  person: "a person",
  connection: "a connection",
  sla_policy: "an SLA policy",
  escalation_policy: "an escalation policy",
};

function slotProblem(value: unknown, field: string, slot: Slot, known: Known): Problem | null {
  if (typeof value !== "string" || !value.startsWith("@")) return null;
  const at = value.indexOf(":");
  const kind = at === -1 ? "" : value.slice(1, at);
  if (!Object.hasOwn(KIND_NOUN, kind)) return problem(field, `\`${value}\` is not a reference sandbox.json knows: write ${SLOT_WRITE[slot]}`);
  if (kind !== slot) return problem(field, `\`${value}\` is ${KIND_NOUN[kind]}, but this names a ${slot}: write ${SLOT_WRITE[slot]}`);
  if (!known[slot].has(value.slice(at + 1))) return problem(field, `\`${value}\` names no ${slot} in this file`);
  return null;
}

function assigneeProblem(assignee: unknown, at: string, known: Known): Problem | null {
  if (!isObject(assignee)) return null;
  switch (assignee.kind) {
    case "user":
      return slotProblem(assignee.id, `${at}.id`, "person", known);
    case "group":
      return slotProblem(assignee.id, `${at}.id`, "group", known);
    case "unit": {
      const anchor = assignee.anchor;
      const unit = isObject(anchor) && anchor.type === "fixed" ? slotProblem(anchor.unit_id, `${at}.anchor.unit_id`, "unit", known) : null;
      return unit ?? slotProblem(assignee.group, `${at}.group`, "group", known);
    }
    case "dynamic": {
      const fallback = Array.isArray(assignee.fallback) ? assignee.fallback : [];
      for (let k = 0; k < fallback.length; k++) {
        const found = assigneeProblem(fallback[k], `${at}.fallback[${k}]`, known);
        if (found) return found;
      }
      return null;
    }
    default:
      return null;
  }
}

const MAX_ESCALATION_STEPS = 10;

// AgentFlow's checks of a policy that need no step schema: names, the references an assignee's id slots hold,
// the step count, and no step that starts a workflow (none exists until the install).
function checkEscalationPolicies(policies: Rec[], known: Known): { found: Problem | null; keys: Set<string> } {
  const keyed = checkKeys("escalation_policies", "key", policies);
  if (keyed.found) return keyed;
  const names = new Set<string>();
  for (let i = 0; i < policies.length; i++) {
    const at = `escalation_policies[${i}]`;
    const named = checkPolicyName("escalation_policies", i, policies[i]!.name as string, names);
    if (named) return { found: named, keys: keyed.keys };
    const steps = policies[i]!.steps as Rec[];
    for (let j = 0; j < steps.length; j++) {
      const action = steps[j]!.action;
      if (!isObject(action) || action.kind !== "assign" || !Array.isArray(action.to)) continue;
      for (let k = 0; k < action.to.length; k++) {
        const found = assigneeProblem(action.to[k], `${at}.steps[${j}].action.to[${k}]`, known);
        if (found) return { found, keys: keyed.keys };
      }
    }
    if (steps.length === 0 || steps.length > MAX_ESCALATION_STEPS) {
      return { found: problem(`${at}.steps`, `a policy has 1 to ${MAX_ESCALATION_STEPS} steps`), keys: keyed.keys };
    }
    const start = steps.findIndex((step) => isObject(step.action) && step.action.kind === "startWorkflow");
    if (start !== -1) {
      return {
        found: problem(`${at}.steps[${start}].action`, "a policy in a sandbox cannot start a workflow: none exists until the install"),
        keys: keyed.keys,
      };
    }
  }
  return keyed;
}

function validTimezone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function validLocale(locale: string): boolean {
  return (
    locale !== "" &&
    locale.length <= 35 &&
    locale.split("-").every((part) => part !== "" && part.length <= 8 && /^[A-Za-z0-9]+$/.test(part))
  );
}

function checkSettings(settings: unknown): Problem | null {
  if (!isObject(settings)) return null;
  const timezone = text(settings.timezone);
  if (timezone !== undefined && !validTimezone(timezone)) return problem("settings.timezone", `\`${timezone}\` is not an IANA timezone`);
  const locale = text(settings.locale);
  if (locale !== undefined && !validLocale(locale)) return problem("settings.locale", `\`${locale}\` is not a language tag`);
  return null;
}

function checkPeople(people: Rec[], roleKnown: (name: string) => boolean, groups: Set<string>, units: Set<string>): Problem | null {
  for (let i = 0; i < people.length; i++) {
    const person = people[i]!;
    const named = nameProblem(`people[${i}].name`, person.name as string);
    if (named) return named;
    const role = unknownMember(strings(person.roles), roleKnown);
    if (role !== undefined) return problem(`people[${i}].roles`, `\`${role}\` is not a built-in or declared role`);
    const group = unknownMember(strings(person.groups), (g) => groups.has(g));
    if (group !== undefined) return problem(`people[${i}].groups`, `\`${group}\` is not a declared group`);
    const unit = text(person.unit);
    if (unit !== undefined && !units.has(unit)) return problem(`people[${i}].unit`, `\`${unit}\` is not a declared unit`);
  }
  return null;
}

function checkOwner(spec: Rec, people: Rec[]): Problem | null {
  const owner = text(spec.owner) ?? "admin";
  const person = people.find((p) => p.handle === owner);
  if (!person) return problem("owner", `\`${owner}\` is not one of the people`);
  if (!strings(person.roles).includes("admin")) return problem("owner", `\`${owner}\` must hold the admin role`);
  return null;
}

const REFERENCE_KINDS = ["group", "unit", "principal", "person", "connection", "sla_policy", "escalation_policy"] as const;
const REFERENCE_WORDS: Record<(typeof REFERENCE_KINDS)[number], string> = {
  group: "group",
  unit: "unit",
  principal: "principal",
  person: "person",
  connection: "connection",
  sla_policy: "SLA policy",
  escalation_policy: "escalation policy",
};

type KnownKeys = Record<(typeof REFERENCE_KINDS)[number], Set<string>>;

// A string beginning `@kind:` with a kind sandbox.json knows must name something the file declares; any other value
// is a literal.
function checkReferences(at: string, values: Rec, known: KnownKeys): Problem | null {
  for (const name of Object.keys(values).sort()) {
    const value = values[name];
    if (typeof value !== "string" || !value.startsWith("@")) continue;
    const colon = value.indexOf(":");
    if (colon === -1) continue;
    const kind = value.slice(1, colon) as (typeof REFERENCE_KINDS)[number];
    if (!REFERENCE_KINDS.includes(kind)) continue;
    if (!known[kind].has(value.slice(colon + 1))) return problem(`${at}.${name}`, `\`${value}\` names no ${REFERENCE_WORDS[kind]} in this file`);
  }
  return null;
}

function checkInstall(install: unknown, known: KnownKeys): Problem | null {
  if (!isObject(install)) return null;
  if (isObject(install.parameters)) {
    const found = checkReferences("install.parameters", install.parameters, known);
    if (found) return found;
  }
  const decided = isObject(install.decisions) && isObject(install.decisions.parameters) ? install.decisions.parameters : {};
  for (const pkg of Object.keys(decided).sort()) {
    const values = decided[pkg];
    if (!isObject(values)) continue;
    const found = checkReferences(`install.decisions.parameters.${pkg}`, values, known);
    if (found) return found;
  }
  return null;
}

const RECOMMENDED = "recommended";
// An entity key, a dot, and a field key; an extension's field has an installed key, `<prefix>__<field>`.
const FIELD_PATH = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
const AGENT_KEY = /^[a-z][a-z0-9_]*$/;

export type FieldList = { recommended: boolean; paths: string[] };
export type FieldProfileSpec = {
  name: string;
  access: (typeof FIELD_ACCESS_LEVELS)[number];
  fields: FieldList;
  groups: string[];
  people: string[];
  principals: string[];
  agents: string[];
};
export type FieldSecuritySpec = { profiles: FieldProfileSpec[]; secure: FieldList };
type FieldSecurityKeys = { groups: Set<string>; people: Set<string>; principals: Set<string> };

function fieldListProblem(value: unknown, at: string): Problem | null {
  if (typeof value === "string") {
    return value === RECOMMENDED ? null : problem(at, `\`${value}\` is neither \`recommended\` nor a list: write "recommended" or ["<entity>.<field>", ...]`);
  }
  const items = strings(value);
  if (items.length === 0) return problem(at, `list at least one field, or write "recommended"`);
  const seen = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (item !== RECOMMENDED && !FIELD_PATH.test(item)) {
      return problem(`${at}[${i}]`, `\`${item}\` is not a field: write <entity>.<field>, such as order.cost, or recommended`);
    }
    if (seen.has(item)) return problem(`${at}[${i}]`, `\`${item}\` is listed twice`);
    seen.add(item);
  }
  return null;
}

function holderProblem(values: string[], at: string, known: (value: string) => string | null): Problem | null {
  const seen = new Set<string>();
  for (let i = 0; i < values.length; i++) {
    const value = values[i]!;
    if (seen.has(value)) return problem(`${at}[${i}]`, `\`${value}\` is listed twice`);
    seen.add(value);
    const why = known(value);
    if (why) return problem(`${at}[${i}]`, why);
  }
  return null;
}

// The CLI's own member, which deploy --sandbox applies after the install. Its holders name the groups, people and
// principals the file declares, and agents by the package's key for them.
function checkFieldSecurity(member: unknown, keys: FieldSecurityKeys): Problem | null {
  if (!isObject(member)) return null;
  const profiles = Array.isArray(member.profiles) ? (member.profiles as Rec[]) : [];
  if (profiles.length > MAX_PER_LIST) return problem("field_security.profiles", `at most ${MAX_PER_LIST} entries`);
  const names = new Set<string>();
  for (let i = 0; i < profiles.length; i++) {
    const at = `field_security.profiles[${i}]`;
    const profile = profiles[i]!;
    const name = (profile.name as string).trim();
    const named = nameProblem(`${at}.name`, name);
    if (named) return named;
    if (names.has(name)) return problem(`${at}.name`, `\`${name}\` is already a profile's name`);
    names.add(name);
    const fields = fieldListProblem(profile.fields, `${at}.fields`);
    if (fields) return fields;
    const holders =
      holderProblem(strings(profile.groups), `${at}.groups`, (g) => (keys.groups.has(g) ? null : `\`${g}\` is not a declared group`)) ??
      holderProblem(strings(profile.people), `${at}.people`, (h) => (keys.people.has(h) ? null : `\`${h}\` is not one of the people`)) ??
      holderProblem(strings(profile.principals), `${at}.principals`, (p) => (keys.principals.has(p) ? null : `\`${p}\` is not a declared principal`)) ??
      holderProblem(strings(profile.agents), `${at}.agents`, (a) => (AGENT_KEY.test(a) ? null : `\`${a}\` is not an agent's key`));
    if (holders) return holders;
  }
  return member.secure === undefined || member.secure === null ? null : fieldListProblem(member.secure, "field_security.secure");
}

const keysOf = (spec: Rec, name: string, member: string): Set<string> =>
  new Set(list(spec, name).flatMap((entry) => (isObject(entry) && typeof entry[member] === "string" ? [entry[member] as string] : [])));

// The check of field_security alone, for deploy --sandbox --upgrade, which sends the answers recorded when the sandbox
// was made and so does not hold the rest of the file to them.
export function fieldSecurityProblem(spec: SandboxSpec): Problem | null {
  const member = spec.field_security;
  if (member === undefined) return null;
  const shaped = shapeField(member, SPEC.fields.field_security!, "field_security");
  if (shaped) return shaped;
  return checkFieldSecurity(member, { groups: keysOf(spec, "groups", "key"), people: keysOf(spec, "people", "handle"), principals: keysOf(spec, "principals", "key") });
}

const fieldListOf = (value: unknown): FieldList => {
  const items = typeof value === "string" ? [value] : strings(value);
  return { recommended: items.includes(RECOMMENDED), paths: items.filter((item) => item !== RECOMMENDED) };
};

// The member as deploy applies it, from a spec that passed the check; undefined when the file has none.
export function fieldSecurityOf(spec: SandboxSpec): FieldSecuritySpec | undefined {
  const member = spec.field_security;
  if (!isObject(member)) return undefined;
  const profiles = Array.isArray(member.profiles) ? (member.profiles as Rec[]) : [];
  return {
    profiles: profiles.map((profile) => ({
      name: (profile.name as string).trim(),
      access: profile.access as FieldProfileSpec["access"],
      fields: fieldListOf(profile.fields),
      groups: strings(profile.groups),
      people: strings(profile.people),
      principals: strings(profile.principals),
      agents: strings(profile.agents),
    })),
    secure: fieldListOf(member.secure),
  };
}

function checkSecretEnvs(connections: Rec[]): Problem | null {
  for (let i = 0; i < connections.length; i++) {
    const env = connections[i]!.secret_env;
    if (env === undefined || env === null) continue;
    if (typeof env !== "string" || !ENV_NAME.test(env)) return problem(`connections[${i}].secret_env`, "an environment variable name");
  }
  return null;
}

export function checkSpec(spec: unknown): Problem | null {
  const shaped = shapeStruct(spec, SPEC, "");
  if (shaped) return shaped;
  const value = spec as Rec;
  const tooLong = checkLengths(value);
  if (tooLong) return tooLong;

  const roles = checkRoles(list(value, "roles"));
  if (roles.found) return roles.found;
  const roleKnown = (name: string): boolean => BUILT_IN_ROLES.includes(name) || roles.declared.has(name);

  const groups = checkKeys("groups", "key", list(value, "groups"));
  if (groups.found) return groups.found;
  for (const [i, group] of list(value, "groups").entries()) {
    const named = nameProblem(`groups[${i}].name`, group.name as string);
    if (named) return named;
  }

  const units = checkKeys("units", "key", list(value, "units"));
  if (units.found) return units.found;
  const unitProblem = checkUnits(list(value, "units"));
  if (unitProblem) return unitProblem;

  const principals = checkKeys("principals", "key", list(value, "principals"));
  if (principals.found) return principals.found;
  const principalProblem = checkPrincipals(list(value, "principals"), roleKnown, groups.keys);
  if (principalProblem) return principalProblem;

  const connections = checkKeys("connections", "key", list(value, "connections"));
  if (connections.found) return connections.found;
  const connectionProblem = checkConnections(list(value, "connections"));
  if (connectionProblem) return connectionProblem;

  const policies = checkSlaPolicies(list(value, "sla_policies"));
  if (policies.found) return policies.found;

  const settingsProblem = checkSettings(value.settings);
  if (settingsProblem) return settingsProblem;

  const people = checkKeys("people", "handle", list(value, "people"));
  if (people.found) return people.found;
  const personProblem = checkPeople(list(value, "people"), roleKnown, groups.keys, units.keys);
  if (personProblem) return personProblem;

  const ownerProblem = checkOwner(value, list(value, "people"));
  if (ownerProblem) return ownerProblem;

  const escalations = checkEscalationPolicies(list(value, "escalation_policies"), { group: groups.keys, unit: units.keys, person: people.keys });
  if (escalations.found) return escalations.found;

  const dependencyProblem = checkDependencies(strings(value.dependencies));
  if (dependencyProblem) return dependencyProblem;

  const installProblem = checkInstall(value.install, {
    group: groups.keys,
    unit: units.keys,
    principal: principals.keys,
    person: people.keys,
    connection: connections.keys,
    sla_policy: policies.keys,
    escalation_policy: escalations.keys,
  });
  if (installProblem) return installProblem;

  const fieldSecurity = checkFieldSecurity(value.field_security, { groups: groups.keys, people: people.keys, principals: principals.keys });
  if (fieldSecurity) return fieldSecurity;

  return checkSecretEnvs(list(value, "connections"));
}

export function requireValidSpec(spec: unknown): void {
  const found = checkSpec(spec);
  if (found) throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${found.field}: ${found.message}`, ["sandbox.json"]);
}

export function readSpec(cwd: string): SandboxSpec {
  const file = path.join(cwd, "sandbox.json");
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new CliError(
        "SANDBOX_SPEC_MISSING",
        `no sandbox.json in ${cwd}: it declares the sandbox's people, groups and install answers; see the agentflow-app-release skill`,
        ["sandbox.json"],
      );
    }
    throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: cannot read it (${code ?? "error"})`, ["sandbox.json"]);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CliError("SANDBOX_SPEC_INVALID", "sandbox.json: not JSON", ["sandbox.json"]);
  }
  if (!isObject(parsed)) throw new CliError("SANDBOX_SPEC_INVALID", "sandbox.json: not a JSON object", ["sandbox.json"]);
  return parsed;
}

// The spec as AgentFlow takes it: without the members only the CLI reads. AgentFlow refuses a member it does not know,
// and the digest that tells a changed sandbox.json is of this, so a change to field_security needs no new sandbox.
export function serverSpec(spec: SandboxSpec): SandboxSpec {
  const { dependencies: _dependencies, field_security: _fieldSecurity, ...rest } = spec;
  return rest;
}

export const specDigest = (spec: SandboxSpec): string => createHash("sha256").update(canonicalJson(serverSpec(spec))).digest("hex");

export const LOOPBACK_MESSAGING = "loopback_messaging";
function kindOf(connection: Rec): string {
  return connection.kind === "loopback" && typeof connection.channel === "string" ? LOOPBACK_MESSAGING : String(connection.kind);
}

export function connectionKinds(spec: SandboxSpec): Map<string, string> {
  const kinds = new Map<string, string>();
  for (const connection of Array.isArray(spec.connections) ? (spec.connections as Rec[]) : []) {
    if (isObject(connection) && typeof connection.key === "string" && typeof connection.kind === "string") {
      kinds.set(connection.key, kindOf(connection));
    }
  }
  return kinds;
}

export function secretEnvs(spec: SandboxSpec): { key: string; env: string }[] {
  const out: { key: string; env: string }[] = [];
  for (const connection of Array.isArray(spec.connections) ? (spec.connections as Rec[]) : []) {
    if (isObject(connection) && typeof connection.key === "string" && typeof connection.secret_env === "string") {
      out.push({ key: connection.key, env: connection.secret_env });
    }
  }
  return out;
}
