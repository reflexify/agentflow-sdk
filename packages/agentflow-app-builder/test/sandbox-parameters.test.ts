import fs from "node:fs";
import path from "node:path";
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
    ["a secret written as a reference", { vault: "@secret:main" }, "install.parameters.vault: `@secret:main` cannot be resolved: the sandbox creates no secret, so give vault the id of one that exists"],
    ["an SLA policy written as a reference", { sla: "@sla:fast" }, "install.parameters.sla: `@sla:fast` cannot be resolved: the sandbox creates no SLA policy, so give sla the id of one that exists"],
    ["an escalation policy written as a reference", { ladder: "@escalation:l1" }, "install.parameters.ladder: `@escalation:l1` cannot be resolved: the sandbox creates no escalation policy, so give ladder the id of one that exists"],
    ["a name for a secret", { vault: "main" }, "install.parameters.vault: `main` is not an id, but vault is a secret_ref: give the id of a secret that exists"],
    ["an explicit null for a number", { limit: null }, "install.parameters.limit: null is not a value limit (number) takes: leave the key out to give it no value"],
    ["an explicit null for a reference", { approver: null }, "install.parameters.approver: null is not a value approver (user_ref) takes: leave the key out to give it no value"],
  ])("refuses %s", async (_name, answers, message) => {
    expect(await refusal(project(PARAMETERS, answers))).toBe(`sandbox.json: ${message}`);
  });

  it("accepts an id written out for a reference parameter", async () => {
    const dir = project(PARAMETERS, { approver: "1c1d6b0e-3a6c-4c43-9a0f-6b0c8f2e4d55" });
    expect((await check(dir)).code).toBe(0);
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
