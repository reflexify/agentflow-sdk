import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { fieldSecurityFindings } from "../src/sandbox/field-security.js";
import { stateFromCreated, writeState } from "../src/sandbox/state.js";
import { sealedApp } from "./app-fixture.js";
import { closeStubs, runCli, stub, type Reply, type Seen } from "./http-stub.js";
import { CREATED, envWith, noSecrets, OWNER, routes, sealedPath, SPEC } from "./sandbox-fixtures.js";

afterEach(closeStubs);

const fast = { sleep: async () => {}, onInterrupt: () => () => {} };
const VERA = `afs_${"veraToken9".repeat(5)}`;
const MADE = {
  ...CREATED,
  people: { ...CREATED.people, vera: { user_id: "u-vera", token: VERA } },
  ids: { ...CREATED.ids, principals: { bot: "sp-bot" } },
};
const GROUP = CREATED.ids.groups.users;
const PROFILE = {
  name: "Case figures",
  access: "read_write",
  fields: ["recommended", "case.title"],
  groups: ["users"],
  people: ["vera"],
  principals: ["bot"],
  agents: ["reader"],
};
const SECURED_SPEC = {
  ...SPEC,
  principals: [{ key: "bot", name: "Bot" }],
  people: [...SPEC.people, { handle: "vera", name: "Vera Viewer", roles: ["viewer"] }],
  field_security: { profiles: [PROFILE] },
};

const recommended = [{ installation_id: "inst-1", package: "rfx/mini", name: "Mini" }];
const GRANTS = [
  { entity_id: "e-1", field_key: "amount", can_create: true, can_update: true },
  { entity_id: "e-1", field_key: "total", can_create: false, can_update: false },
  { entity_id: "e-1", field_key: "title", can_create: true, can_update: true },
];
const HOLDERS = [
  { kind: "group", id: GROUP },
  { kind: "user", id: "u-vera" },
  { kind: "service_principal", id: "sp-bot" },
  { kind: "agent", id: "a-1" },
];
const read = (field_key: string) => ({ entity_id: "e-1", field_key, can_create: false, can_update: false });

type Grant = (typeof GRANTS)[number];
type Profile = { id: string; name: string; description: string | null; fields: Grant[]; holders: unknown[]; created_at: string; updated_at: string };
type Route = Reply | ((request: Seen) => Reply);

// AgentFlow's field access over the case entity, as far as deploy meets it. `total` is a formula over `amount`, and
// `amount` and `total` are marked recommendedSecured. Securing a field is refused while an unsecured formula reads it,
// a profile that grants such a formula needs a choice, a profile is replaced only under its current updated_at, and every
// change to a profile moves its updated_at.
function fieldAccess(start: { secured?: string[]; profiles?: Partial<Profile>[] } = {}) {
  let clock = 10;
  const stamp = () => `2026-11-${++clock}T00:00:00Z`;
  const fields = [
    { key: "amount", field_type: "number", recommended: true, reads: undefined as string | undefined },
    { key: "title", field_type: "text", recommended: false, reads: undefined },
    { key: "total", field_type: "formula", recommended: true, reads: "amount" },
  ].map((field) => ({ ...field, secured: start.secured?.includes(field.key) ?? false }));
  const profiles: Profile[] = (start.profiles ?? []).map((profile, i) => ({
    id: `p-${i + 1}`, name: "Case figures", description: "Kept", fields: [], holders: [], created_at: "2026-11-01T00:00:00Z", updated_at: stamp(), ...profile,
  }));
  const secured = () => fields.filter((field) => field.secured).map((field) => field.key).sort();
  const refused = (status: number, type: string, detail: string): Reply => ({ status, problem: { type, detail: `${type}: ${detail}` } });

  function secure(key: string, body: { grant_to?: string[]; remove_readers_from?: string[] }): Reply {
    const field = fields.find((f) => f.key === key)!;
    if (field.secured) return { status: 200, json: { secured: true, profiles: [], field_warnings: [] } };
    const reader = fields.find((f) => f.reads === key && !f.secured);
    if (reader) return refused(422, "ENTITY_FORMULA_SENSITIVE_INPUT", `formula \`${reader.key}\` reads \`${key}\` and would expose it; make the formula sensitive first`);
    const readers = fields.filter((f) => f.reads === key).map((f) => f.key);
    const [grantTo, removeFrom] = [body.grant_to ?? [], body.remove_readers_from ?? []];
    const unchosen = profiles.find((p) => p.fields.some((g) => readers.includes(g.field_key)) && !grantTo.includes(p.id) && !removeFrom.includes(p.id));
    if (unchosen) return refused(422, "FIELD_ACCESS_FORMULA_INPUT_NOT_GRANTED", `${unchosen.name} grants a formula over ${key}`);
    field.secured = true;
    for (const p of profiles) {
      const before = JSON.stringify(p.fields);
      if (grantTo.includes(p.id) && !p.fields.some((g) => g.field_key === key)) p.fields.push(read(key));
      if (removeFrom.includes(p.id)) p.fields = p.fields.filter((g) => !readers.includes(g.field_key));
      if (JSON.stringify(p.fields) !== before) p.updated_at = stamp();
    }
    return { status: 200, json: { secured: true, profiles: [], field_warnings: [] } };
  }

  function route(request: Seen): Reply | undefined {
    const name = `${request.method} ${request.path}`;
    const body = () => JSON.parse(request.body.toString());
    const securing = /^PUT \/api\/v1\/field-access\/entities\/e-1\/secured\?field_key=(\w+)$/.exec(name);
    if (securing) return secure(securing[1]!, body());
    const one = /^(GET|PUT) \/api\/v1\/field-access\/profiles\/([\w-]+)$/.exec(name);
    const profile = one && profiles.find((p) => p.id === one[2]);
    if (one && !profile) return refused(404, "NOT_FOUND", "no such profile");
    if (one?.[1] === "GET") return { status: 200, json: profile };
    if (one && profile) {
      const { expected_updated_at, ...content } = body();
      if (expected_updated_at !== profile.updated_at) return refused(409, "STALE_VERSION", "updated_at does not match");
      Object.assign(profile, content, { updated_at: stamp() });
      return { status: 200, json: profile };
    }
    switch (name) {
      case "GET /api/v1/field-access/fields":
        return {
          status: 200,
          json: {
            entities: [{
              entity_id: "e-1", entity_key: "rfx_mini__case", entity_name: "Case",
              fields: fields.map((f) => ({ key: f.key, label: f.key, field_type: f.field_type, secured: f.secured, system: false, profiles: [], recommended_by: f.recommended ? recommended : [] })),
            }],
          },
        };
      case "GET /api/v1/field-access/profiles":
        return { status: 200, json: { profiles: profiles.map(({ id, name, description, updated_at }) => ({ id, name, description, updated_at })) } };
      case "POST /api/v1/field-access/profiles": {
        const made = { description: null, ...body(), id: `p-${profiles.length + 1}`, created_at: stamp(), updated_at: stamp() };
        if (profiles.some((p) => p.name === made.name)) return refused(409, "FIELD_ACCESS_PROFILE_NAME_TAKEN", "taken");
        profiles.push(made);
        return { status: 201, json: made };
      }
      case "GET /api/v1/app-installations/inst-1/agents":
        return { status: 200, json: { agents: [{ logical_key: "agent:reader", id: "a-1" }] } };
    }
    return undefined;
  }
  return { route, secured, profiles };
}

type Fake = ReturnType<typeof fieldAccess>;

// The fake's operations answer only to the owner's token, as AgentFlow does; `over` answers first, and every other
// request goes to the sandbox routes.
function fieldRoutes(fake: Fake, over: Record<string, Route> = {}): (request: Seen) => Reply {
  const rest = routes({ "POST /api/v1/sandboxes": { status: 201, json: MADE } });
  return (request) => {
    const given = over[`${request.method} ${request.path}`];
    const own = given ? (typeof given === "function" ? given(request) : given) : fake.route(request);
    if (!own) return rest(request);
    if (request.headers.authorization !== `Bearer ${OWNER}`) return { status: 401, problem: { type: "UNAUTHENTICATED", detail: "wrong key" } };
    return own;
  };
}

const appWith = async (spec: unknown): Promise<string> => {
  const app = await sealedApp();
  fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(spec));
  return app;
};
const named = (seen: Seen[]) => seen.map((r) => `${r.method} ${r.path}`);
const fieldAccessCalls = (seen: Seen[]) => named(seen).filter((r) => r.includes("/field-access/") || r.endsWith("/arm"));
const bodies = (seen: Seen[], name: string) => seen.filter((r) => `${r.method} ${r.path}` === name).map((r) => JSON.parse(r.body.toString()));
const deploy = (app: string, url: string, ...more: string[]) =>
  runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app), ...more], { env: envWith(url), ...fast });
const recorded = (app: string, url: string, made: Record<string, unknown> = MADE) =>
  writeState(app, {
    ...stateFromCreated(url, made),
    installation: { id: "inst-0", deployment_id: "dep-0", package_id: "rfx/mini", version: "0.9.0", armed: [], objects: {}, parameters: {} },
  });
const STATE = (app: string) => JSON.parse(fs.readFileSync(path.join(app, ".agentflow", "sandbox.json"), "utf8"));
const SECURE = (key: string) => `PUT /api/v1/field-access/entities/e-1/secured?field_key=${key}`;
const NOT_ARMED = "the app is installed and its triggers are not armed";

describe("deploy --sandbox with field_security", () => {
  it("secures a formula before the field it reads, then creates the profile with its holders, after the install and before arming", async () => {
    const app = await appWith(SECURED_SPEC);
    const fake = fieldAccess();
    const server = await stub(fieldRoutes(fake));
    const out = await deploy(app, server.url);
    expect(out.code, out.stderr).toBe(0);
    noSecrets(out, VERA);
    expect(named(server.seen).slice(named(server.seen).indexOf("GET /api/v1/app-deployments/dep-1"))).toEqual([
      "GET /api/v1/app-deployments/dep-1",
      "GET /api/v1/app-installations/inst-1/objects",
      "GET /api/v1/field-access/fields",
      "GET /api/v1/app-installations/inst-1/agents",
      "GET /api/v1/field-access/profiles",
      SECURE("amount"),
      SECURE("total"),
      SECURE("title"),
      SECURE("amount"),
      "POST /api/v1/field-access/profiles",
      "POST /api/v1/app-installations/inst-1/arm",
    ]);
    expect(fake.secured()).toEqual(["amount", "title", "total"]);
    const [profile] = fake.profiles;
    expect(profile).toMatchObject({ name: "Case figures", holders: HOLDERS });
    expect(profile!.fields).toEqual(expect.arrayContaining(GRANTS));
    expect(profile!.fields).toHaveLength(3);
    expect(out.stdout).toContain("field security: secured 3 fields; created profile Case figures\narmed 1 triggers");
    expect(STATE(app).installation).toMatchObject({ armed: ["trigger:t"], objects: { "entity:case": "e-1" } });
  });

  it("names the formula when sandbox.json secures a field the formula reads but not the formula, and keeps the objects recorded", async () => {
    const app = await appWith({ ...SECURED_SPEC, field_security: { profiles: [{ ...PROFILE, fields: ["case.amount", "case.title"] }] } });
    const fake = fieldAccess();
    const server = await stub(fieldRoutes(fake));
    const out = await deploy(app, server.url);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain(
      [
        "ENTITY_FORMULA_SENSITIVE_INPUT: field_security: AgentFlow refused to secure this field, since a formula or rollup sandbox.json does not secure reads it:",
        "  case.amount: formula `total` reads `amount` and would expose it; make the formula sensitive first",
        "secure each formula or rollup named there too, in field_security.secure or a profile's fields, and deploy secures it before the fields it reads",
        NOT_ARMED,
      ].join("\n"),
    );
    expect(fake.secured()).toEqual(["title"]);
    expect(fake.profiles).toEqual([]);
    expect(server.seen.some((r) => r.path.endsWith("/arm"))).toBe(false);
    expect(STATE(app).installation).toMatchObject({ id: "inst-1", armed: [], objects: { "entity:case": "e-1" } });
  });

  it("changes nothing when the organization is already as sandbox.json says, on --upgrade and with --no-arm too", async () => {
    const app = await appWith(SECURED_SPEC);
    const fake = fieldAccess({ secured: ["amount", "title", "total"], profiles: [{ fields: [...GRANTS].reverse(), holders: [...HOLDERS].reverse() }] });
    const server = await stub(fieldRoutes(fake));
    recorded(app, server.url);
    const out = await deploy(app, server.url, "--upgrade", "--no-arm", "--json");
    expect(out.code).toBe(0);
    expect(fieldAccessCalls(server.seen)).toEqual([
      "GET /api/v1/field-access/fields",
      "GET /api/v1/field-access/profiles",
      "GET /api/v1/field-access/profiles/p-1",
    ]);
    expect(JSON.parse(out.stdout).field_security).toEqual({ secured: [], profiles: [{ name: "Case figures", id: "p-1", outcome: "unchanged" }] });
  });

  it("grants a field it secures to the profile sandbox.json names, then replaces that profile under the updated_at securing moved", async () => {
    const app = await appWith(SECURED_SPEC);
    const fake = fieldAccess({ secured: ["title", "total"], profiles: [{ fields: GRANTS.slice(1), holders: HOLDERS.slice(0, 1) }] });
    const server = await stub(fieldRoutes(fake));
    recorded(app, server.url);
    const before = fake.profiles[0]!.updated_at;
    const out = await deploy(app, server.url, "--upgrade");
    expect(out.code, out.stderr).toBe(0);
    expect(bodies(server.seen, SECURE("amount"))).toEqual([{ secured: true, grant_to: ["p-1"] }]);
    const [replaced] = bodies(server.seen, "PUT /api/v1/field-access/profiles/p-1");
    expect(replaced.expected_updated_at).not.toBe(before);
    expect(fake.profiles[0]).toMatchObject({ description: "Kept", holders: HOLDERS });
    expect(fake.profiles[0]!.fields).toEqual(expect.arrayContaining(GRANTS));
    expect(out.stdout).toContain("field security: secured 1 field; updated profile Case figures");
  });

  it("reports a profile that securing took a formula from as updated, though it then matches sandbox.json", async () => {
    const titles = { name: "Titles", access: "read", fields: ["case.title"] };
    const app = await appWith({ ...SECURED_SPEC, field_security: { profiles: [PROFILE, titles] } });
    const fake = fieldAccess({
      secured: ["title", "total"],
      profiles: [{ fields: GRANTS.slice(1), holders: HOLDERS }, { name: "Titles", fields: [read("title"), read("total")] }],
    });
    const server = await stub(fieldRoutes(fake));
    recorded(app, server.url);
    const out = await deploy(app, server.url, "--upgrade", "--json");
    expect(out.code, out.stderr).toBe(0);
    expect(bodies(server.seen, SECURE("amount"))).toEqual([{ secured: true, grant_to: ["p-1"], remove_readers_from: ["p-2"] }]);
    expect(fake.profiles[1]!.fields).toEqual([read("title")]);
    expect(named(server.seen)).not.toContain("PUT /api/v1/field-access/profiles/p-2");
    expect(JSON.parse(out.stdout).field_security.profiles).toEqual([
      { name: "Case figures", id: "p-1", outcome: "updated" },
      { name: "Titles", id: "p-2", outcome: "updated" },
    ]);
  });

  it("replaces the profile it finds by name when its create meets one made in between", async () => {
    const app = await appWith(SECURED_SPEC);
    const fake = fieldAccess({ secured: ["amount", "title", "total"], profiles: [{}] });
    let lists = 0;
    const server = await stub(
      fieldRoutes(fake, {
        "GET /api/v1/field-access/profiles": (request) => (lists++ === 0 ? { status: 200, json: { profiles: [] } } : fake.route(request)!),
      }),
    );
    const out = await deploy(app, server.url, "--json");
    expect(out.code, out.stderr).toBe(0);
    expect(JSON.parse(out.stdout).field_security.profiles).toEqual([{ name: "Case figures", id: "p-1", outcome: "updated" }]);
    expect(fake.profiles[0]!.fields).toEqual(expect.arrayContaining(GRANTS));
  });

  it("refuses a holder the recorded sandbox lacks before it uploads anything", async () => {
    const app = await appWith(SECURED_SPEC);
    const server = await stub(fieldRoutes(fieldAccess()));
    recorded(app, server.url, CREATED);
    const out = await deploy(app, server.url, "--upgrade");
    expect(out.code).toBe(1);
    expect(out.stderr).toContain(
      "SANDBOX_SPEC_INVALID: sandbox.json: field_security.profiles[0].people: the sandbox has no person vera; sandbox.json named it after the sandbox was made, and deploy --sandbox --replace makes one with it",
    );
    expect(out.stderr).not.toContain(NOT_ARMED);
    expect(named(server.seen)).not.toContain("POST /api/v1/app-packages");
  });

  it("refuses a field the installed app does not have before any change, and arms nothing", async () => {
    const app = await appWith({ ...SECURED_SPEC, field_security: { profiles: [{ ...PROFILE, fields: ["case.titl"] }] } });
    const server = await stub(fieldRoutes(fieldAccess()));
    const out = await deploy(app, server.url);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain(
      `SANDBOX_SPEC_INVALID: sandbox.json: field_security.profiles[0].fields: \`case.titl\`: entity case has no field titl; did you mean title?\n${NOT_ARMED}`,
    );
    expect(fieldAccessCalls(server.seen)).toEqual(["GET /api/v1/field-access/fields"]);
  });

  it("says so when the AgentFlow has no field access operations", async () => {
    const app = await appWith(SECURED_SPEC);
    const server = await stub(
      fieldRoutes(fieldAccess(), { "GET /api/v1/field-access/fields": { status: 404, problem: { type: "ROUTE_NOT_FOUND", detail: "no route" } } }),
    );
    const out = await deploy(app, server.url);
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_FIELD_SECURITY_UNSUPPORTED: this AgentFlow has no published field access operations/m);
    expect(server.seen.some((r) => r.path.endsWith("/arm"))).toBe(false);
  });
});

describe("fieldSecurityFindings", () => {
  function packageDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "field-security-"));
    const write = (file: string, body: unknown) => {
      fs.mkdirSync(path.dirname(path.join(dir, "package", file)), { recursive: true });
      fs.writeFileSync(path.join(dir, "package", file), JSON.stringify(body));
    };
    write("manifest.json", { id: "acme/desk", version: "1.0.0" });
    write("objects/entity/order.json", { name: "Order" });
    write("objects/entity_field/order__cost.json", { type: "number", label: "Cost", recommendedSecured: true });
    write("objects/entity_field/order__title.json", { type: "text", label: "Title" });
    write("objects/agent/contract_reader.json", { name: "Contract reader" });
    write("objects/entity_extension/vendor.json", { extends: "x", fields: [{ key: "risk", type: "text", recommendedSecured: true }] });
    return dir;
  }
  const spec = (profile: Record<string, unknown>) => ({ field_security: { profiles: [{ name: "P", access: "read", ...profile }] } });

  it.each([
    ["a field the package's entity lacks", { fields: ["order.costs"] }, { field: "field_security.profiles[0].fields", message: "`order.costs`: the package's entity order has no field costs; did you mean cost?" }],
    ["an agent the package does not ship", { fields: ["order.cost"], agents: ["contract_reeder"] }, { field: "field_security.profiles[0].agents", message: "`contract_reeder` is not one of the package's agents (it ships contract_reader); did you mean contract_reader?" }],
    ["a field of an entity the package does not own, left to deploy", { fields: ["vendor.acme_desk__risk"] }, null],
  ])("%s", (_, profile, problem) => {
    expect(fieldSecurityFindings(spec(profile), packageDir()).problem).toEqual(problem);
  });

  it("warns that recommended leaves out the extension fields the package marks", () => {
    expect(fieldSecurityFindings(spec({ fields: "recommended" }), packageDir()).warnings).toEqual([
      "field_security.profiles[0].fields: recommended leaves out the extension fields the package marks recommendedSecured (acme_desk__risk): name each as <entity>.<installed key> (the release skill's reference/sandbox-json.md, \"Field security\")",
    ]);
  });
});
