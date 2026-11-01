import { describe, expect, it } from "vitest";
import { checkSpec } from "../src/sandbox/spec.js";

const base = () => ({
  owner: "admin",
  roles: [{ name: "Support", permissions: ["entity.read"] }],
  groups: [{ key: "support", name: "Support" }],
  units: [{ key: "hq", name: "Head office" }, { key: "desk", name: "Desk", parent: "hq" }],
  principals: [{ key: "automation", name: "Desk automation", roles: ["Support"], groups: ["support"] }],
  connections: [{ key: "mail", kind: "resend", secret_env: "SANDBOX_RESEND_API_KEY", settings: { from: "desk@example.com" } }],
  sla_policies: [
    {
      key: "reply",
      name: "Reply deadlines",
      targets: {
        urgent: { value: 1, unit: "business_hours" },
        high: { value: 4, unit: "business_hours" },
        normal: { value: 1, unit: "business_days" },
        low: { value: 3, unit: "business_days" },
      },
    },
  ] as any[],
  escalation_policies: [
    {
      key: "late",
      name: "Late replies",
      steps: [
        { at: { kind: "onDue" }, action: { kind: "notifyCandidates" } },
        {
          at: { kind: "afterDue", duration: { value: 1, unit: "business_hours" } },
          action: {
            kind: "assign",
            to: [
              { kind: "group", id: "@group:support" },
              { kind: "dynamic", source: { type: "creator" }, relation: { type: "direct" }, fallback: [{ kind: "user", id: "@person:agent" }] },
              { kind: "unit", anchor: { type: "fixed", unit_id: "@unit:hq" }, group: "@group:support" },
            ],
          },
        },
      ],
    },
  ] as any[],
  settings: { timezone: "Asia/Ho_Chi_Minh", locale: "vi" },
  people: [
    { handle: "admin", name: "Sandbox Admin", roles: ["admin"] },
    { handle: "agent", name: "Anna Agent", roles: ["Support"], groups: ["support"], unit: "desk" },
  ],
  install: { parameters: { support_group_id: "@group:support", run_as: "@principal:automation", mail: "@connection:mail", sla: "@sla_policy:reply", escalation: "@escalation_policy:late", n: 3 }, decisions: {} },
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
    ["a policy key with a capital", (s: any) => { s.sla_policies[0].key = "Reply"; }, "sla_policies[0].key", "`Reply` must match [a-z][a-z0-9_]{0,31}"],
    ["a policy name used twice in another case", (s: any) => { s.sla_policies.push({ ...s.sla_policies[0], key: "other", name: " reply DEADLINES " }); }, "sla_policies[1].name", "` reply DEADLINES ` is already a policy's name"],
    ["a policy name of 81 characters", (s: any) => { s.sla_policies[0].name = "x".repeat(81); }, "sla_policies[0].name", "a policy name is 1 to 80 characters"],
    ["targets on two bases", (s: any) => { s.sla_policies[0].targets.urgent.unit = "hours"; }, "sla_policies[0].targets", "the four targets all run round the clock, or all on the business calendar"],
    ["a target past a year", (s: any) => { s.sla_policies[0].targets.low.value = 366; }, "sla_policies[0].targets", "the low target must be between 1 and 365 business days"],
    ["a unit AgentFlow does not know", (s: any) => { s.sla_policies[0].targets.high.unit = "weeks"; }, "sla_policies[0].targets.high.unit", "unknown variant `weeks`, expected one of `minutes`, `hours`, `days`, `business_hours`, `business_days`"],
    ["a target that is not a whole number", (s: any) => { s.sla_policies[0].targets.high.value = 1.5; }, "sla_policies[0].targets.high.value", "expected an integer"],
    ["a missing priority", (s: any) => { delete s.sla_policies[0].targets.low; }, "sla_policies[0].targets", "missing field `low`"],
    ["null targets", (s: any) => { s.sla_policies[0].targets = null; }, "sla_policies[0].targets", "expected an object"],
    ["a reference to an undeclared policy", (s: any) => { s.install.parameters.sla = "@sla_policy:nope"; }, "install.parameters.sla", "`@sla_policy:nope` names no SLA policy in this file"],
    ["a policy reference with no policies", (s: any) => { delete s.sla_policies; }, "install.parameters.sla", "`@sla_policy:reply` names no SLA policy in this file"],
    ["an escalation policy name used twice in another case", (s: any) => { s.escalation_policies.push({ ...s.escalation_policies[0], key: "other", name: "LATE replies" }); }, "escalation_policies[1].name", "`LATE replies` is already a policy's name"],
    ["a unit where a group goes", (s: any) => { s.escalation_policies[0].steps[1].action.to[0].id = "@unit:hq"; }, "escalation_policies[0].steps[1].action.to[0].id", "`@unit:hq` is a unit, but this names a group: write @group:<key>"],
    ["an undeclared group in a step", (s: any) => { s.escalation_policies[0].steps[1].action.to[0].id = "@group:sales"; }, "escalation_policies[0].steps[1].action.to[0].id", "`@group:sales` names no group in this file"],
    ["an undeclared person in a fallback", (s: any) => { s.escalation_policies[0].steps[1].action.to[1].fallback[0].id = "@person:ghost"; }, "escalation_policies[0].steps[1].action.to[1].fallback[0].id", "`@person:ghost` names no person in this file"],
    ["a reference kind sandbox.json does not know in a step", (s: any) => { s.escalation_policies[0].steps[1].action.to[0].id = "@team:x"; }, "escalation_policies[0].steps[1].action.to[0].id", "`@team:x` is not a reference sandbox.json knows: write @group:<key>"],
    ["a step that starts a workflow named by a key", (s: any) => { s.escalation_policies[0].steps[0].action = { kind: "startWorkflow", workflow_id: "@workflow:triage" }; }, "escalation_policies[0].steps[0].action", "a policy in a sandbox cannot start a workflow: none exists until the install"],
    ["a group where a pool's unit goes", (s: any) => { s.escalation_policies[0].steps[1].action.to[2].anchor.unit_id = "@group:support"; }, "escalation_policies[0].steps[1].action.to[2].anchor.unit_id", "`@group:support` is a group, but this names a unit: write @unit:<key>"],
    ["a unit where a pool's group goes", (s: any) => { s.escalation_policies[0].steps[1].action.to[2].group = "@unit:hq"; }, "escalation_policies[0].steps[1].action.to[2].group", "`@unit:hq` is a unit, but this names a group: write @group:<key>"],
    ["a policy with no steps", (s: any) => { s.escalation_policies[0].steps = []; }, "escalation_policies[0].steps", "a policy has 1 to 10 steps"],
    ["a step that starts a workflow", (s: any) => { s.escalation_policies[0].steps[0].action = { kind: "startWorkflow", workflow_id: "00000000-0000-0000-0000-000000000000" }; }, "escalation_policies[0].steps[0].action", "a policy in a sandbox cannot start a workflow: none exists until the install"],
    ["a reference to an undeclared escalation policy", (s: any) => { s.install.parameters.escalation = "@escalation_policy:nope"; }, "install.parameters.escalation", "`@escalation_policy:nope` names no escalation policy in this file"],
    ["a target past 64 bits", (s: any) => { s.sla_policies[0].targets.urgent.value = 1e21; }, "sla_policies[0].targets.urgent.value", "expected an integer"],
    ["a target past a year but inside 64 bits", (s: any) => { s.sla_policies[0].targets.urgent.value = 2 ** 62; }, "sla_policies[0].targets", "the urgent target must be between 1 and 8760 business hours"],
    ["an unknown member of targets", (s: any) => { s.sla_policies[0].targets.soon = { value: 1, unit: "hours" }; }, "sla_policies[0].targets.soon", "unknown field `soon`"],
  ])("refuses %s", (_name, change, field, message) => {
    const spec = base();
    change(spec);
    expect(checkSpec(spec)).toEqual({ field, message });
  });

  it("takes a member of a target it does not know, as AgentFlow does", () => {
    const spec = base();
    spec.sla_policies[0].targets.urgent.note = "first reply";
    expect(checkSpec(spec)).toBeNull();
  });

  it("treats a string that is not a reference as a literal", () => {
    const spec = base();
    (spec.install.parameters as Record<string, unknown>).note = "@not a reference";
    expect(checkSpec(spec)).toBeNull();
  });
});
