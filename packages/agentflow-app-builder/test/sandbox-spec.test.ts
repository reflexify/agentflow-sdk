import { describe, expect, it } from "vitest";
import { checkSpec } from "../src/sandbox/spec.js";

const base = () => ({
  owner: "admin",
  roles: [{ name: "Support", permissions: ["entity.read"] }],
  groups: [{ key: "support", name: "Support" }],
  units: [{ key: "hq", name: "Head office" }, { key: "desk", name: "Desk", parent: "hq" }],
  principals: [{ key: "automation", name: "Desk automation", roles: ["Support"], groups: ["support"] }],
  connections: [{ key: "mail", kind: "resend", secret_env: "SANDBOX_RESEND_API_KEY", settings: { from: "desk@example.com" } }],
  settings: { timezone: "Asia/Ho_Chi_Minh", locale: "vi" },
  people: [
    { handle: "admin", name: "Sandbox Admin", roles: ["admin"] },
    { handle: "agent", name: "Anna Agent", roles: ["Support"], groups: ["support"], unit: "desk" },
  ],
  install: { parameters: { support_group_id: "@group:support", run_as: "@principal:automation", mail: "@connection:mail", n: 3 }, decisions: {} },
});

describe("checkSpec", () => {
  it("accepts the spec's own example", () => {
    expect(checkSpec(base())).toBeNull();
  });

  it.each([
    ["an unknown member", (s: any) => { s.extra = 1; }, "extra", "unknown field `extra`"],
    ["no people", (s: any) => { delete s.people; }, "spec", "missing field `people`"],
    ["a handle with a capital", (s: any) => { s.people[1].handle = "Agent"; }, "people[1].handle", "`Agent` must match [a-z][a-z0-9_]{0,31}"],
    ["a key used twice", (s: any) => { s.units[1].key = "hq"; }, "units[1].key", "`hq` is used twice"],
    ["a parent declared later", (s: any) => { s.units.reverse(); }, "units[0].parent", "`hq` is not an earlier unit"],
    ["a role holding sandbox.create", (s: any) => { s.roles[0].permissions.push("sandbox.create"); }, "roles[0].permissions", "role `Support` may not hold `sandbox.create` in a sandbox"],
    ["a role named like a built-in", (s: any) => { s.roles[0].name = " Admin "; }, "roles[0].name", "` Admin ` is already a role"],
    ["an undeclared group on a person", (s: any) => { s.people[1].groups = ["sales"]; }, "people[1].groups", "`sales` is not a declared group"],
    ["an owner who is not admin", (s: any) => { s.owner = "agent"; }, "owner", "`agent` must hold the admin role"],
    ["an owner who is nobody", (s: any) => { s.owner = "ghost"; }, "owner", "`ghost` is not one of the people"],
    ["a reference to nothing", (s: any) => { s.install.parameters.support_group_id = "@group:sales"; }, "install.parameters.support_group_id", "`@group:sales` names no group in this file"],
    ["a non-resend connection", (s: any) => { s.connections[0].kind = "smtp"; }, "connections[0].kind", "`smtp` is not supported; only `resend` is"],
    ["a from that is not an address", (s: any) => { s.connections[0].settings.from = "desk"; }, "connections[0].settings.from", "`desk` is not an email address"],
    ["a bad timezone", (s: any) => { s.settings.timezone = "Mars/Olympus"; }, "settings.timezone", "`Mars/Olympus` is not an IANA timezone"],
    ["a bad locale", (s: any) => { s.settings.locale = "vi--VN"; }, "settings.locale", "`vi--VN` is not a language tag"],
    ["null decisions", (s: any) => { s.install.decisions = null; }, "install.decisions", "expected an object"],
    ["list decisions", (s: any) => { s.install.decisions = []; }, "install.decisions", "expected an object"],
    ["string decisions", (s: any) => { s.install.decisions = "x"; }, "install.decisions", "expected an object"],
    ["a bad secret_env", (s: any) => { s.connections[0].secret_env = "1KEY"; }, "connections[0].secret_env", "an environment variable name"],
  ])("refuses %s", (_name, change, field, message) => {
    const spec = base();
    change(spec);
    expect(checkSpec(spec)).toEqual({ field, message });
  });

  it("treats a string that is not a reference as a literal", () => {
    const spec = base();
    (spec.install.parameters as Record<string, unknown>).note = "@not a reference";
    expect(checkSpec(spec)).toBeNull();
  });
});
