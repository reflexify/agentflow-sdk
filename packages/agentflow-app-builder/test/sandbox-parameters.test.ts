import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { keyFromSeed } from "../src/seal/keys.js";
import { readPayloadDir } from "../src/seal/payload.js";
import { sign } from "../src/seal/seal.js";
import { afterEach, describe, expect, it } from "vitest";
import { closeStubs, runCli } from "./http-stub.js";
import { appDir } from "./sandbox-fixtures.js";

afterEach(closeStubs);

const PARAMETERS = [
  { key: "app_users", type: "group_ref", required: true, label: "App users" },
  { key: "approver", type: "user_ref", required: false, label: "Approver" },
  { key: "desk", type: "unit_ref", required: false, label: "Desk" },
  { key: "bot", type: "service_principal_ref", required: true, label: "Bot" },
  { key: "mail", type: "connection_ref", required: false, label: "Mail" },
  { key: "greeting", type: "text", required: true, label: "Greeting", default: "hello" },
  { key: "limit", type: "number", required: false, label: "Limit" },
  { key: "tier", type: "enum", required: false, label: "Tier", options: ["gold", "silver"] },
  { key: "vault", type: "secret_ref", required: false, label: "Vault" },
  { key: "sla", type: "sla_policy_ref", required: false, label: "SLA" },
  { key: "ladder", type: "escalation_policy_ref", required: false, label: "Ladder" },
];

const SPEC = {
  groups: [{ key: "users", name: "Users" }],
  units: [{ key: "hq", name: "HQ" }],
  principals: [{ key: "automation", name: "Automation" }],
  connections: [{ key: "mailer", kind: "resend", settings: { from: "a@example.com" } }],
  sla_policies: [
    {
      key: "reply",
      name: "Reply",
      targets: {
        urgent: { value: 1, unit: "hours" },
        high: { value: 4, unit: "hours" },
        normal: { value: 1, unit: "days" },
        low: { value: 3, unit: "days" },
      },
    },
  ],
  escalation_policies: [{ key: "late", name: "Late", steps: [{ at: { kind: "onDue" }, action: { kind: "notifyCandidates" } }] }],
  people: [{ handle: "admin", name: "Admin", roles: ["admin"], groups: ["users"] }],
  install: { parameters: { app_users: "@group:users", bot: "@principal:automation" } },
};

function project(parameters: unknown, install?: Record<string, unknown>): string {
  const dir = appDir({ ...SPEC, install: { parameters: { ...SPEC.install.parameters, ...install } } });
  if (parameters !== undefined) {
    fs.mkdirSync(path.join(dir, "package"));
    fs.writeFileSync(path.join(dir, "package/manifest.json"), JSON.stringify({ parameters }));
  }
  return dir;
}

const check = (dir: string) => runCli(dir, ["sandbox", "check", "--json"], { env: {} });
const refusal = async (dir: string): Promise<string> => {
  const out = await check(dir);
  expect(out.code).toBe(1);
  const { error } = JSON.parse(out.stdout);
  expect(error.code).toBe("SANDBOX_SPEC_INVALID");
  expect(error.files).toEqual(["sandbox.json"]);
  return error.message;
};

describe("sandbox check against the package's parameters", () => {
  it("passes answers that fit every parameter", async () => {
    const dir = project(PARAMETERS, {
      approver: "@person:admin", desk: "@unit:hq", mail: "@connection:mailer", limit: 3, tier: "gold", greeting: "hi",
    });
    expect((await check(dir)).code).toBe(0);
  });

  it("checks nothing without package/manifest.json", async () => {
    expect((await check(project(undefined, { anything: "goes" }))).code).toBe(0);
  });

  it("refuses a key the manifest does not declare, suggesting the nearest parameter", async () => {
    const dir = appDir({ ...SPEC, install: { parameters: { app_user: "@group:users", bot: "@principal:automation" } } });
    fs.mkdirSync(path.join(dir, "package"));
    fs.writeFileSync(path.join(dir, "package/manifest.json"), JSON.stringify({ parameters: PARAMETERS }));
    expect(await refusal(dir)).toBe(
      "sandbox.json: install.parameters.app_user: the manifest declares no parameter app_user; did you mean app_users?",
    );
  });

  it("refuses an unknown key with no near match by listing the declared ones", async () => {
    const message = await refusal(project(PARAMETERS, { zzz: "x" }));
    expect(message).toBe(
      "sandbox.json: install.parameters.zzz: the manifest declares no parameter zzz (it declares app_users, approver, desk, bot, mail, greeting, limit, tier, vault, sla, ladder)",
    );
  });

  const WARNING_BOT =
    "install.parameters.bot: the manifest requires parameter bot (service_principal_ref), which has no default and no value in sandbox.json; AgentFlow refuses the install when an enabled object, a grant or the audience uses it";

  it("warns, and does not refuse, about a required parameter with no value and no default", async () => {
    const dir = appDir({ ...SPEC, install: { parameters: { app_users: "@group:users" } } });
    fs.mkdirSync(path.join(dir, "package"));
    fs.writeFileSync(path.join(dir, "package/manifest.json"), JSON.stringify({ parameters: PARAMETERS }));
    const out = await check(dir);
    expect(out.code).toBe(0);
    expect(out.stderr).toBe(`warning: ${WARNING_BOT}\n`);
    expect(JSON.parse(out.stdout)).toEqual({ valid: true, warnings: [WARNING_BOT] });
  });

  it("warns when sandbox.json has no install member at all, and says nothing when every answer is there", async () => {
    const { install: _install, ...bare } = SPEC;
    const dir = appDir(bare);
    fs.mkdirSync(path.join(dir, "package"));
    fs.writeFileSync(path.join(dir, "package/manifest.json"), JSON.stringify({ parameters: PARAMETERS }));
    const out = await check(dir);
    expect(out.code).toBe(0);
    expect(JSON.parse(out.stdout).warnings).toHaveLength(2);
    expect(out.stderr).toContain("warning: install.parameters.app_users: the manifest requires parameter app_users");
    const quiet = await check(project(PARAMETERS));
    expect(quiet.stderr).toBe("");
    expect(JSON.parse(quiet.stdout)).toEqual({ valid: true });
  });

  it("lets a required parameter with a default go unanswered", async () => {
    expect((await check(project(PARAMETERS))).code).toBe(0);
  });

  it.each([
    ["a person for a group_ref", { app_users: "@person:admin" }, "install.parameters.app_users: `@person:admin` is a person, but app_users is a group_ref: write @group:<key>"],
    ["a group for a user_ref", { approver: "@group:users" }, "install.parameters.approver: `@group:users` is a group, but approver is a user_ref: write @person:<handle>"],
    ["a principal for a unit_ref", { desk: "@principal:automation" }, "install.parameters.desk: `@principal:automation` is a principal, but desk is a unit_ref: write @unit:<key>"],
    ["a unit for a service_principal_ref", { bot: "@unit:hq" }, "install.parameters.bot: `@unit:hq` is a unit, but bot is a service_principal_ref: write @principal:<key>"],
    ["a group for a connection_ref", { mail: "@group:users" }, "install.parameters.mail: `@group:users` is a group, but mail is a connection_ref: write @connection:<key>"],
    ["a text for a group_ref", { app_users: "users" }, "install.parameters.app_users: `users` is not a reference, but app_users is a group_ref: write @group:<key>"],
    ["a number for a group_ref", { app_users: 3 }, "install.parameters.app_users: 3 is not a reference, but app_users is a group_ref: write @group:<key>"],
    ["a string for a number", { limit: "5" }, "install.parameters.limit: `5` is not a number, which limit takes"],
    ["a number for a text", { greeting: 5 }, "install.parameters.greeting: 5 is not a string, which greeting takes"],
    ["a reference for an enum", { tier: "@group:users" }, "install.parameters.tier: \"@group:users\" is not one of gold, silver, which tier takes"],
    ["an option that is not listed", { tier: "bronze" }, "install.parameters.tier: \"bronze\" is not one of gold, silver, which tier takes"],
    ["a secret written as a reference", { vault: "@secret:main" }, "install.parameters.vault: `@secret:main` cannot be resolved: a sandbox holds no secret for vault to name"],
    ["an unknown kind for an sla_policy_ref", { sla: "@sla:fast" }, "install.parameters.sla: `@sla:fast` is not a reference sandbox.json knows, and sla is a sla_policy_ref: write @sla_policy:<key>"],
    ["a group for an sla_policy_ref", { sla: "@group:users" }, "install.parameters.sla: `@group:users` is a group, but sla is a sla_policy_ref: write @sla_policy:<key>"],
    ["an SLA policy for a group_ref", { app_users: "@sla_policy:reply" }, "install.parameters.app_users: `@sla_policy:reply` is an SLA policy, but app_users is a group_ref: write @group:<key>"],
    ["an unknown kind for an escalation_policy_ref", { ladder: "@escalation:l1" }, "install.parameters.ladder: `@escalation:l1` is not a reference sandbox.json knows, and ladder is a escalation_policy_ref: write @escalation_policy:<key>"],
    ["a group for an escalation_policy_ref", { ladder: "@group:users" }, "install.parameters.ladder: `@group:users` is a group, but ladder is a escalation_policy_ref: write @escalation_policy:<key>"],
    ["an escalation policy for a group_ref", { app_users: "@escalation_policy:late" }, "install.parameters.app_users: `@escalation_policy:late` is an escalation policy, but app_users is a group_ref: write @group:<key>"],
    ["a name for a secret", { vault: "main" }, "install.parameters.vault: `main` is not an id, and vault is a secret_ref: a sandbox holds no secret an id could name"],
    ["an explicit null for a number", { limit: null }, "install.parameters.limit: null is not a value limit (number) takes: leave the key out to give it no value"],
    ["an explicit null for a reference", { approver: null }, "install.parameters.approver: null is not a value approver (user_ref) takes: leave the key out to give it no value"],
  ])("refuses %s", async (_name, answers, message) => {
    expect(await refusal(project(PARAMETERS, answers))).toBe(`sandbox.json: ${message}`);
  });

  it("accepts an id written out for a reference parameter", async () => {
    const dir = project(PARAMETERS, { approver: "1c1d6b0e-3a6c-4c43-9a0f-6b0c8f2e4d55" });
    expect((await check(dir)).code).toBe(0);
  });

  it("accepts a reference to a declared escalation policy for an escalation_policy_ref", async () => {
    expect((await check(project(PARAMETERS, { ladder: "@escalation_policy:late" }))).code).toBe(0);
  });

  it("accepts a reference to a declared SLA policy for an sla_policy_ref", async () => {
    expect((await check(project(PARAMETERS, { sla: "@sla_policy:reply" }))).code).toBe(0);
  });

  it("accepts an id for a secret, an SLA policy and an escalation policy", async () => {
    const id = "1c1d6b0e-3a6c-4c43-9a0f-6b0c8f2e4d55";
    expect((await check(project(PARAMETERS, { vault: id, sla: id, ladder: id }))).code).toBe(0);
  });

  it("leaves a package/manifest.json it cannot read to the commands that need it", async () => {
    const dir = appDir(SPEC);
    fs.mkdirSync(path.join(dir, "package"));
    fs.writeFileSync(path.join(dir, "package/manifest.json"), "{");
    expect((await check(dir)).code).toBe(0);
  });
});

describe("sandbox check against what a sandbox cannot hold", () => {
  const ERP = { key: "erp", type: "connection_ref", required: true, label: "ERP", category: "erp" };
  const KEY = { key: "api_key", type: "secret_ref", required: true, label: "API key" };
  const MAIL = { key: "mail", type: "connection_ref", required: true, label: "Mail", category: "email" };
  const SEE = `(the release skill's reference/sandbox-json.md, "What a sandbox cannot hold")`;
  const ID = "1c1d6b0e-3a6c-4c43-9a0f-6b0c8f2e4d55";

  // A built package: its manifest, and one object file for each `kind/file` given, each naming `@param:` slots.
  function built(manifest: Record<string, unknown>, objects: Record<string, unknown> = {}, install: Record<string, unknown> = {}): string {
    const dir = appDir({ ...SPEC, install: { parameters: install } });
    fs.mkdirSync(path.join(dir, "package/objects"), { recursive: true });
    fs.writeFileSync(path.join(dir, "package/manifest.json"), JSON.stringify({ id: "acme/desk", parameters: [], ...manifest }));
    for (const [rel, body] of Object.entries(objects)) {
      fs.mkdirSync(path.join(dir, "package/objects", path.dirname(rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, "package/objects", rel), JSON.stringify(body));
    }
    return dir;
  }
  const decide = (dir: string, decisions: unknown): void => {
    const spec = JSON.parse(fs.readFileSync(path.join(dir, "sandbox.json"), "utf8"));
    fs.writeFileSync(path.join(dir, "sandbox.json"), JSON.stringify({ ...spec, install: { ...spec.install, decisions } }));
  };
  const ENTITY = { key: "contact", source: { connection: "@param:erp", stream: "contacts" } };
  const WORKFLOW = { key: "lookup", graph: { nodes: [{ id: "call", parameters: { auth: { secretId: "@param:api_key" } } }] } };
  const NO_SECRET = "a sandbox holds no secret, so no id can name one there";
  const NO_ERP =
    'sandbox.json declares no sandbox_erp connection, so there is no erp connection to name: add { "key": "erp", "kind": "sandbox_erp" } to its connections';

  it("refuses a connection parameter of a kind a sandbox cannot make that an object uses, naming the object", async () => {
    const dir = built({ parameters: [ERP] }, { "entity/contact.json": ENTITY });
    expect(await refusal(dir)).toBe(
      "sandbox.json: install.parameters.erp: the manifest requires parameter erp (connection_ref, category erp), which has no default and no value, " +
        `and ${NO_ERP}; entity:contact uses it, so AgentFlow refuses the install. Test what needs it on a real installation ${SEE}`,
    );
  });

  it("refuses a secret parameter that an object uses, and a file's __ reads as the / of its key", async () => {
    const dir = built({ parameters: [KEY] }, { "entity_field/contact__region.json": { type: "text" }, "workflow/lookup.json": WORKFLOW });
    expect(await refusal(dir)).toContain(
      "install.parameters.api_key: the manifest requires parameter api_key (secret_ref), which has no default and no value, " +
        `and ${NO_SECRET}; workflow:lookup uses it, so AgentFlow refuses the install.`,
    );
    const field = built({ parameters: [KEY] }, { "entity_field/contact__region.json": { default: "@param:api_key" } });
    expect(await refusal(field)).toContain("entity_field:contact/region uses it");
  });

  it("refuses a value for one of them as well, from install.parameters or from install.decisions, whatever it is", async () => {
    const given = (value: unknown) => built({ parameters: [KEY] }, { "workflow/lookup.json": WORKFLOW }, { api_key: value });
    for (const value of [ID, "@secret:main", "main", null]) {
      expect(await refusal(given(value)), String(value)).toBe(
        `sandbox.json: install.parameters.api_key: api_key (secret_ref) is given a value, but ${NO_SECRET}; workflow:lookup uses it, so AgentFlow refuses the install. Test what needs it on a real installation ${SEE}`,
      );
    }
    for (const value of [ID, "@connection:mailer", { provider: "odoo", externalAccountId: "x" }]) {
      const dir = built({ parameters: [ERP] }, { "entity/contact.json": ENTITY }, { erp: value });
      expect(await refusal(dir), JSON.stringify(value)).toBe(
        `sandbox.json: install.parameters.erp: erp (connection_ref, category erp) is given a value, but ${NO_ERP}; entity:contact uses it, so AgentFlow refuses the install. Test what needs it on a real installation ${SEE}`,
      );
    }
    const decided = built({ parameters: [KEY] }, { "workflow/lookup.json": WORKFLOW });
    decide(decided, { parameters: { "acme/desk": { api_key: ID } } });
    expect(await refusal(decided)).toContain("sandbox.json: install.decisions.parameters.acme/desk.api_key: api_key (secret_ref) is given a value");
  });

  it("refuses a value for an optional secret, and leaves a value for an optional connection alone, since setup does not block on it", async () => {
    const optionalKey = built({ parameters: [{ ...KEY, required: false }] }, { "workflow/lookup.json": WORKFLOW }, { api_key: ID });
    expect(await refusal(optionalKey)).toContain("api_key (secret_ref) is given a value");
    const optionalErp = built({ parameters: [{ ...ERP, required: false }] }, { "entity/contact.json": ENTITY }, { erp: ID });
    expect((await check(optionalErp)).code).toBe(0);
  });

  it("only warns, or says nothing, when no object uses the parameter, when it has a default, or when it is optional and unset", async () => {
    const message = (key: string, type: string) =>
      `install.parameters.${key}: the manifest requires parameter ${key} (${type}), which has no default and no value in sandbox.json; AgentFlow refuses the install when an enabled object, a grant or the audience uses it`;
    const unused = await check(built({ parameters: [ERP] }, { "entity/contact.json": { key: "contact" } }));
    expect(unused.code).toBe(0);
    expect(JSON.parse(unused.stdout).warnings).toEqual([message("erp", "connection_ref")]);
    const optional = built({ parameters: [{ ...KEY, required: false }] }, { "workflow/lookup.json": WORKFLOW });
    expect(JSON.parse((await check(optional)).stdout)).toEqual({ valid: true });
    const defaulted = built({ parameters: [{ ...KEY, default: "x" }] }, { "workflow/lookup.json": WORKFLOW });
    expect(JSON.parse((await check(defaulted)).stdout)).toEqual({ valid: true });
    // A value for a secret nothing uses is harmless.
    expect((await check(built({ parameters: [KEY] }, { "entity/contact.json": { key: "contact" } }, { api_key: ID }))).code).toBe(0);
  });

  it("leaves a connection a sandbox can make, and one with no category, to the general warning", async () => {
    const objects = { "workflow/send.json": { graph: { nodes: [{ parameters: { email: { connection: { externalAccountId: "@param:mail" } } } }] } } };
    const mail = await check(built({ parameters: [MAIL] }, objects));
    expect(mail.code).toBe(0);
    expect(JSON.parse(mail.stdout).warnings).toHaveLength(1);
    const { category: _category, ...bare } = MAIL;
    expect((await check(built({ parameters: [bare] }, objects))).code).toBe(0);
    expect((await check(built({ parameters: [MAIL] }, objects, { mail: "@connection:mailer" }))).code).toBe(0);
  });

  it("keeps refusing when package/objects holds a file that is not a folder, such as a .DS_Store", async () => {
    const dir = built({ parameters: [ERP] }, { "entity/contact.json": ENTITY });
    fs.writeFileSync(path.join(dir, "package/objects/.DS_Store"), "x");
    fs.writeFileSync(path.join(dir, "package/objects/entity/.DS_Store"), "x");
    expect(await refusal(dir)).toContain("entity:contact uses it");
  });

  it("warns about each required package sandbox.json's dependencies do not upload", async () => {
    const dir = built({ parameters: [], requires: { packages: [{ id: "acme/base", access: {} }, { id: "acme/more", access: {} }] } });
    const out = await check(dir);
    expect(out.code).toBe(0);
    expect(JSON.parse(out.stdout).warnings).toEqual(
      ["acme/base", "acme/more"].map(
        (id) =>
          `requires.packages: ${id} is not among sandbox.json's dependencies, so the install looks for it in the deployment's app catalog, and AgentFlow refuses the install when the catalog does not hold it (the release skill's reference/sandbox-json.md, "Dependencies")`,
      ),
    );
    expect((await check(built({ parameters: [], requires: { packages: [] } }))).stderr).toBe("");
  });

  it("refuses a value for a connection of a category a sandbox makes none of", async () => {
    const crm = { key: "crm", type: "connection_ref", required: true, label: "CRM", category: "crm" };
    const dir = built({ parameters: [crm] }, { "entity/contact.json": { source: { connection: "@param:crm" } } }, { crm: "@connection:mailer" });
    expect(await refusal(dir)).toContain(
      "crm (connection_ref, category crm) is given a value, but a sandbox holds email connections (resend or loopback) and sandbox_erp ERP connections only, so there is no crm connection to name",
    );
  });

});

describe("sandbox check of a package that requires rfx/erp-core", () => {
  const ERP_CORE = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../apps/erp-core/package");
  const CONSUMER = {
    id: "acme/erp-consumer",
    parameters: [
      { key: "erp", type: "connection_ref", category: "erp", required: true, label: "ERP" },
      { key: "note_takers", type: "group_ref", required: true, label: "Note takers" },
    ],
    requires: { packages: [{ id: "rfx/erp-core", range: "^1.0.0", access: {} }] },
  };
  const FITTING = {
    groups: [{ key: "readers", name: "ERP readers" }],
    connections: [{ key: "erp", kind: "sandbox_erp" }, { key: "mailer", kind: "loopback", settings: { from: "a@example.com" } }],
    people: [{ handle: "admin", name: "Admin", roles: ["admin"], groups: ["readers"] }],
    dependencies: ["deps/rfx-erp-core-1.0.0.afpkg"],
    install: {
      parameters: { erp: "@connection:erp", note_takers: "@group:readers" },
      decisions: { parameters: { "rfx/erp-core": { erp: "@connection:erp", erp_readers: "@group:readers" } } },
    },
  };

  // A project whose built package is CONSUMER, beside erp-core sealed at deps/.
  function consumer(spec: Record<string, unknown>): string {
    const dir = appDir(spec);
    fs.mkdirSync(path.join(dir, "package/objects/entity"), { recursive: true });
    fs.writeFileSync(path.join(dir, "package/manifest.json"), JSON.stringify(CONSUMER));
    fs.writeFileSync(path.join(dir, "package/objects/entity/vendor_profile.json"), JSON.stringify({ source: { connection: "@param:erp" } }));
    fs.mkdirSync(path.join(dir, "deps"));
    const sealed = sign(readPayloadDir(ERP_CORE), keyFromSeed("test", new Uint8Array(32)));
    fs.writeFileSync(path.join(dir, "deps", sealed.fileName), sealed.bytes);
    return dir;
  }
  const withInstall = (decided: Record<string, unknown>) => ({
    ...FITTING,
    install: { ...FITTING.install, decisions: { parameters: { "rfx/erp-core": decided } } },
  });

  it("passes with a sandbox_erp connection, erp-core among the dependencies and its answers as @ references", async () => {
    const out = await check(consumer(FITTING));
    expect(out.stderr).toBe("");
    expect(JSON.parse(out.stdout)).toEqual({ valid: true });
  });

  it("refuses an erp answer that names no sandbox_erp connection, or no ERP connection at all", async () => {
    expect(await refusal(consumer(withInstall({ erp: "@connection:mailer", erp_readers: "@group:readers" })))).toBe(
      "sandbox.json: install.decisions.parameters.rfx/erp-core.erp: `@connection:mailer` is a loopback connection, but erp is an erp connection: name the sandbox_erp connection",
    );
    const noErp = {
      ...FITTING,
      connections: [FITTING.connections[1]],
      install: { parameters: { note_takers: "@group:readers" }, decisions: { parameters: { "rfx/erp-core": { erp_readers: "@group:readers" } } } },
    };
    expect(await refusal(consumer(noErp))).toContain(
      "install.parameters.erp: the manifest requires parameter erp (connection_ref, category erp), which has no default and no value, and sandbox.json declares no sandbox_erp connection",
    );
    expect(await refusal(consumer(withInstall({ erp_readers: "@group:readers", erp_reader: "@group:readers" })))).toBe(
      "sandbox.json: install.decisions.parameters.rfx/erp-core.erp_reader: rfx/erp-core declares no parameter erp_reader; did you mean erp_readers?",
    );
  });

  it("warns about an answer erp-core needs and sandbox.json leaves out, and about erp-core when no dependency uploads it", async () => {
    const unanswered = await check(consumer(withInstall({ erp: "@connection:erp" })));
    expect(unanswered.code).toBe(0);
    expect(JSON.parse(unanswered.stdout).warnings).toEqual([
      "install.decisions.parameters.rfx/erp-core.erp_readers: rfx/erp-core requires parameter erp_readers (group_ref), which has no default and no value in sandbox.json; AgentFlow refuses the install when an enabled object, a grant or the audience uses it",
    ]);
    const { dependencies: _dependencies, ...catalog } = FITTING;
    const fromCatalog = await check(consumer(catalog));
    expect(JSON.parse(fromCatalog.stdout).warnings).toEqual([
      `requires.packages: rfx/erp-core is not among sandbox.json's dependencies, so the install looks for it in the deployment's app catalog, and AgentFlow refuses the install when the catalog does not hold it (the release skill's reference/sandbox-json.md, "Dependencies")`,
    ]);
  });

  it("refuses a dependency it cannot read as a sealed package", async () => {
    const dir = consumer({ ...FITTING, dependencies: ["deps/missing.afpkg"] });
    expect(await refusal(dir)).toBe("sandbox.json: dependencies[0]: cannot read `deps/missing.afpkg` (ENOENT)");
    fs.writeFileSync(path.join(dir, "deps/missing.afpkg"), "not a zip");
    expect(await refusal(dir)).toBe("sandbox.json: dependencies[0]: `deps/missing.afpkg` is not a sealed package: it holds no manifest.json with an id and a version");
  });
});
