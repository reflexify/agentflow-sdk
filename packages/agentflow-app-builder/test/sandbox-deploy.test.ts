import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readZip } from "../src/seal/zip.js";
import { stateFromCreated, writeState } from "../src/sandbox/state.js";
import { copyApp, sealedApp, sealedSigningApp, SERVER_EMAIL_ONLY, writeApp } from "./app-fixture.js";
import { edges, end, graph, INITIATOR, restricted, start, webhook, workflow } from "../src/workflow.js";
import { closeStubs, filePart, runCli, stub } from "./http-stub.js";
import {
  CREATED, DEPLOY_KEY_REFUSED, envWith, MINI_DEPLOYMENTS, noSecrets, OLD, routes, SANDBOX, FIRST_PLAN, sealedPath, SECOND_PLAN, SPEC,
} from "./sandbox-fixtures.js";

afterEach(closeStubs);

const fast = { sleep: async () => {}, onInterrupt: () => () => {} };
const STATE = (app: string) => JSON.parse(fs.readFileSync(path.join(app, ".agentflow", "sandbox.json"), "utf8"));
const withSpec = (app: string): string => {
  fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(SPEC));
  return app;
};

const FITTING = {
  ...SPEC,
  principals: [{ key: "bot", name: "Bot" }],
  install: { parameters: { support_group_id: "@group:users", automation_principal_id: "@principal:bot" } },
};

describe("deploy --sandbox", () => {
  it("--replace deletes the recorded sandbox, naming it, then installs as the owner with the sandbox defaults, arms and records the objects", async () => {
    const app = await sealedApp();
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(SPEC));
    const server = await stub(routes());
    writeState(app, { ...stateFromCreated(server.url, CREATED), id: OLD });
    const out = await runCli(app, ["deploy", "--sandbox", "--replace", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    noSecrets(out);
    expect(out.stdout).toContain(`deleted sandbox app (${OLD}), as --replace asks\ncreated sandbox app (${SANDBOX})\n`);
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([
      `DELETE /api/v1/sandboxes/${OLD}`,
      "POST /api/v1/sandboxes",
      "POST /api/v1/app-packages",
      "POST /api/v1/app-deployments",
      "POST /api/v1/app-deployments/dep-1/plan",
      "POST /api/v1/app-deployments/dep-1/plan",
      "POST /api/v1/app-deployments/dep-1/approve",
      "GET /api/v1/app-deployments/dep-1",
      "POST /api/v1/app-installations/inst-1/arm",
      "GET /api/v1/app-installations/inst-1/objects",
    ]);
    const body = (i: number) => JSON.parse(server.seen[i]!.body.toString());
    expect(body(3)).toEqual({ package_id: "rfx/mini", version: "1.0.0", parameters: CREATED.install.parameters });
    expect(body(5)).toEqual({ decisions: { features: { "rfx/mini": ["extras"] } } });
    expect(body(6)).toEqual({ plan_hash: "h2", decisions: { features: { "rfx/mini": ["extras"] } } });
    const state = STATE(app);
    expect(state.id).toBe(SANDBOX);
    expect(state.installation).toEqual({
      id: "inst-1", deployment_id: "dep-1", package_id: "rfx/mini", version: "1.0.0",
      armed: ["trigger:t"], objects: { "entity:case": "e-1" }, parameters: { app_users: "g" },
    });
  });

  it("warns, before making the sandbox, when the deployment cannot sign as the package does", async () => {
    const app = await sealedSigningApp();
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(FITTING));
    const platform = { platform_version: "2026.11", format_versions: [1], esign: { methods: ["server_email"] } };
    const server = await stub(routes({ "GET /api/v1/platform": { status: 200, json: platform } }));
    const out = await runCli(app, ["deploy", "--sandbox"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr.startsWith(`${SERVER_EMAIL_ONLY}\n`)).toBe(true);
    expect(server.seen.slice(0, 2).map((r) => `${r.method} ${r.path}`)).toEqual(["GET /api/v1/platform", "POST /api/v1/sandboxes"]);
    const json = await runCli(app, ["deploy", "--sandbox", "--json"], { env: envWith(server.url), ...fast });
    expect(JSON.parse(json.stdout).signing_warnings).toEqual([SERVER_EMAIL_ONLY]);
  });

  it("prints what it did without a key", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    noSecrets(out);
    expect(out.stdout).toContain(`created sandbox app (${SANDBOX})`);
    expect(out.stdout).toContain(`installed rfx/mini 1.0.0 in sandbox app (${SANDBOX})\narmed 1 triggers\n`);
  });

  it("leaves the sandbox and its state file when approve is refused, and the next deploy installs into it", async () => {
    const app = withSpec(await sealedApp());
    let approvals = 0;
    const server = await stub(
      routes({
        "POST /api/v1/app-deployments/dep-1/approve": () =>
          approvals++ === 0
            ? { status: 409, problem: { type: "APP_SETUP_INCOMPLETE", detail: "setup is not done" } }
            : { status: 202, json: { deployment_id: "dep-1", status: "installing", approve_url: "u" } },
      }),
    );
    const first = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(first.code).toBe(1);
    expect(first.stderr).toContain("APP_SETUP_INCOMPLETE");
    expect(first.stderr).toContain("sandbox open --as admin");
    noSecrets(first);
    expect(STATE(app)).toMatchObject({ id: SANDBOX, installation: null });

    server.seen.length = 0;
    const second = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(second.code).toBe(0);
    noSecrets(second);
    expect(second.stdout).toContain(`installing into sandbox app (${SANDBOX})\n`);
    expect(server.seen.slice(0, 3).map((r) => `${r.method} ${r.path}`)).toEqual([
      `GET /api/v1/sandboxes/${SANDBOX}`,
      MINI_DEPLOYMENTS,
      "POST /api/v1/app-packages",
    ]);
    expect(server.seen.some((r) => r.method === "DELETE" || r.path === "/api/v1/sandboxes")).toBe(false);
    expect(STATE(app)).toMatchObject({ id: SANDBOX, installation: { id: "inst-1" } });
  });

  it("prints each finding of a plan that cannot be approved on its own line", async () => {
    const app = withSpec(await sealedApp());
    const plan_findings = [
  { code: "APP_DEPENDS_ON_FAILED", package_id: "rfx/mini", logical_key: "dashboard:summary", pointer: null, message: null },
  { code: "APP_STEP_FAILED", package_id: "rfx/mini", logical_key: "entity:leave_request", pointer: "VALIDATION_ERROR", message: "create form must bind every required field: employee" },
  { code: "APP_STEP_FAILED", package_id: "rfx/mini", logical_key: "dashboard:overview", pointer: "TILE_POSITION_INVALID", message: null },
];
    const refusing = await stub(
      routes({
        "POST /api/v1/app-deployments/dep-1/approve": {
          status: 409,
          problem: {
            type: "APP_PLAN_CHANGED",
            detail: "the plan cannot be approved: APP_STEP_FAILED on entity:leave_request of rfx/mini at VALIDATION_ERROR",
            extensions: { plan_findings },
          },
        },
      }),
    );
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(refusing.url), ...fast });
    expect(out.code).toBe(1);
    const lines = out.stderr.split("\n");
    for (const line of [
  "  APP_STEP_FAILED on entity:leave_request at VALIDATION_ERROR: create form must bind every required field: employee",
  "  APP_STEP_FAILED on dashboard:overview at TILE_POSITION_INVALID",
  "  APP_DEPENDS_ON_FAILED on 1 object skipped because an object it needs failed: dashboard:summary",
]) expect(lines).toContain(line);
    expect(lines.findIndex((line) => line.includes("APP_DEPENDS_ON_FAILED"))).toBeGreaterThan(
      lines.findIndex((line) => line.includes("APP_STEP_FAILED on dashboard:overview")),
    );
    noSecrets(out);
  });

  it("prints the plan's warnings and installs anyway", async () => {
    const app = withSpec(await sealedApp());
    const warned = {
      ...SECOND_PLAN,
      plan: {
        ...SECOND_PLAN.plan,
        warnings: [{ agent_read_limit: { package: "rfx/mini", agent: "triage", workflow: "open_case", step: "s", field: "case.salary", profiles: ["p1", "p2"] } }],
        grant_warnings: [{ read_limit_step_uncovered: { package: "rfx/mini", agent: "triage", workflow: "open_case", step: "s", entity: "case", operation: "read" } }],
      },
    };
    let plans = 0;
    const server = await stub(routes({ "POST /api/v1/app-deployments/dep-1/plan": () => ({ status: 200, json: plans++ === 0 ? FIRST_PLAN : warned }) }));
    const lines = [
      "warning: agent_read_limit: package rfx/mini, agent triage, workflow open_case, step s, field case.salary, profiles p1, p2",
      "warning: read_limit_step_uncovered: package rfx/mini, agent triage, workflow open_case, step s, entity case, operation read",
    ];
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    noSecrets(out);
    for (const line of lines) expect(out.stderr.split("\n")).toContain(line);
    plans = 0;
    const json = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app), "--json"], { env: envWith(server.url), ...fast });
    expect(json.code).toBe(0);
    expect(JSON.parse(json.stdout).plan_warnings).toEqual(lines);
  });

  it("--replace ignores a recorded sandbox AgentFlow no longer knows, and fails on any other refusal of its delete", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(
      routes({
        [`DELETE /api/v1/sandboxes/${OLD}`]: { status: 404, problem: { type: "SANDBOX_NOT_FOUND", detail: "no such sandbox" } },
        [`DELETE /api/v1/sandboxes/${SANDBOX}`]: { status: 403, problem: { type: "FORBIDDEN", detail: "not yours" } },
        "GET /api/v1/caller": DEPLOY_KEY_REFUSED,
      }),
    );
    writeState(app, { ...stateFromCreated(server.url, CREATED), id: OLD });
    const out = await runCli(app, ["deploy", "--sandbox", "--replace", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr).toContain(`the recorded sandbox ${OLD} is gone; making a new one\n`);
    expect(STATE(app).id).toBe(SANDBOX);

    server.seen.length = 0;
    const refused = await runCli(app, ["deploy", "--sandbox", "--replace", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(refused.code).toBe(1);
    expect(refused.stderr).toMatch(/^FORBIDDEN: /);
    expect(server.seen).toHaveLength(1);
    expect(STATE(app).id).toBe(SANDBOX);
  });

  it("sandbox create, then deploy --sandbox, installs into that sandbox and deletes nothing", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(routes());
    expect((await runCli(app, ["sandbox", "create"], { env: envWith(server.url) })).code).toBe(0);
    server.seen.length = 0;
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    noSecrets(out);
    expect(out.stdout).toContain(`installing into sandbox app (${SANDBOX})\nuploaded rfx/mini 1.0.0\ninstalled rfx/mini 1.0.0 in sandbox app (${SANDBOX})\n`);
    expect(out.stderr).not.toContain("older agentflow-app");
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([
      `GET /api/v1/sandboxes/${SANDBOX}`,
      MINI_DEPLOYMENTS,
      "POST /api/v1/app-packages",
      "POST /api/v1/app-deployments",
      "POST /api/v1/app-deployments/dep-1/plan",
      "POST /api/v1/app-deployments/dep-1/plan",
      "POST /api/v1/app-deployments/dep-1/approve",
      "GET /api/v1/app-deployments/dep-1",
      "POST /api/v1/app-installations/inst-1/arm",
      "GET /api/v1/app-installations/inst-1/objects",
    ]);
    expect(STATE(app)).toMatchObject({ id: SANDBOX, installation: { id: "inst-1", version: "1.0.0" } });
  });

  it("refuses a recorded sandbox that holds the package already, naming --upgrade and --replace, and deletes nothing", async () => {
    const app = withSpec(await sealedApp());
    const installed = { deployment_id: "dep-0", package_id: "rfx/mini", version: "0.9.0", status: "installed", approve_url: "u" };
    const server = await stub(routes({ [MINI_DEPLOYMENTS]: { status: 200, json: { items: [installed], next_cursor: null } } }));
    writeState(app, stateFromCreated(server.url, CREATED));
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    noSecrets(out);
    expect(out.stderr).toMatch(
      new RegExp(`^SANDBOX_HOLDS_PACKAGE: sandbox app \\(${SANDBOX}\\) already holds rfx/mini 0\\.9\\.0: deploy --sandbox --upgrade .*; deploy --sandbox --replace deletes it`, "m"),
    );
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([`GET /api/v1/sandboxes/${SANDBOX}`, MINI_DEPLOYMENTS]);
    expect(STATE(app).id).toBe(SANDBOX);
  });

  it("names --replace when the recorded sandbox holds an earlier upload of the version with other content", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(
      routes({
        "POST /api/v1/app-packages": {
          status: 409,
          problem: { type: "APP_PACKAGE_VERSION_EXISTS", detail: "rfx/mini 1.0.0 is already uploaded with other content" },
        },
      }),
    );
    writeState(app, stateFromCreated(server.url, CREATED));
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^APP_PACKAGE_VERSION_EXISTS: .*; deploy --sandbox --replace starts over in a new sandbox/m);
    expect(server.seen.some((r) => r.method === "DELETE" || r.path === "/api/v1/sandboxes")).toBe(false);
    expect(STATE(app).id).toBe(SANDBOX);
  });

  it("refuses a recorded sandbox made from another sandbox.json, and --upgrade warns that it sends the answers recorded then", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(routes());
    expect((await runCli(app, ["sandbox", "create"], { env: envWith(server.url) })).code).toBe(0);
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify({ ...SPEC, groups: [...SPEC.groups, { key: "leads", name: "Leads" }] }));
    server.seen.length = 0;
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(new RegExp(`^SANDBOX_SPEC_CHANGED: sandbox\\.json changed after sandbox app \\(${SANDBOX}\\) was made.*deploy --sandbox --replace`, "m"));
    expect(server.seen.some((r) => r.method !== "GET")).toBe(false);

    const upgraded = await runCli(app, ["deploy", "--sandbox", "--upgrade", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(upgraded.code).toBe(0);
    expect(upgraded.stderr).toContain(`warning: sandbox.json changed after sandbox app (${SANDBOX}) was made; this upgrade sends the answers recorded then`);
  });

  it("makes a new sandbox when the recorded one is gone, asking its deploy key when AgentFlow does not know it, without deleting anything", async () => {
    const deleted = { status: 200, json: { id: SANDBOX, name: "app", state: "deleted", expires_at: CREATED.expires_at } } as const;
    const unknown = { status: 404, problem: { type: "NOT_FOUND", detail: "no such sandbox" } } as const;
    for (const [answer, word, asked] of [
      [deleted, "deleted", []],
      [unknown, "gone", ["GET /api/v1/caller"]],
    ] as const) {
      const app = withSpec(await sealedApp());
      const server = await stub(routes({ [`GET /api/v1/sandboxes/${SANDBOX}`]: answer, "GET /api/v1/caller": DEPLOY_KEY_REFUSED }));
      writeState(app, stateFromCreated(server.url, CREATED));
      const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
      expect(out.code).toBe(0);
      expect(out.stdout).toContain(`the recorded sandbox ${SANDBOX} is ${word}; making a new one\n`);
      expect(server.seen.slice(0, 2 + asked.length).map((r) => `${r.method} ${r.path}`)).toEqual([
        `GET /api/v1/sandboxes/${SANDBOX}`,
        ...asked,
        "POST /api/v1/sandboxes",
      ]);
      expect(server.seen.some((r) => r.method === "DELETE")).toBe(false);
    }
  });

  it("refuses SANDBOX_KEY_MISMATCH and keeps the state file when the parent key cannot see a sandbox whose own key still works, with any flag", async () => {
    const unknown = { status: 404, problem: { type: "NOT_FOUND", detail: "no such sandbox" } } as const;
    for (const [flag, first] of [
      [undefined, `GET /api/v1/sandboxes/${SANDBOX}`],
      ["--upgrade", `GET /api/v1/sandboxes/${SANDBOX}`],
      ["--replace", `DELETE /api/v1/sandboxes/${SANDBOX}`],
    ] as const) {
      const app = withSpec(await sealedApp());
      const server = await stub(routes({ [`GET /api/v1/sandboxes/${SANDBOX}`]: unknown, [`DELETE /api/v1/sandboxes/${SANDBOX}`]: unknown }));
      writeState(app, stateFromCreated(server.url, CREATED));
      const before = fs.readFileSync(path.join(app, ".agentflow", "sandbox.json"), "utf8");
      const out = await runCli(app, ["deploy", "--sandbox", ...(flag ? [flag] : []), "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
      expect(out.code).toBe(1);
      noSecrets(out);
      expect(out.stderr).toMatch(
        new RegExp(`^SANDBOX_KEY_MISMATCH: AGENTFLOW_SANDBOX_KEY sees no sandbox app \\(${SANDBOX}\\), but the sandbox's own deploy key still works`, "m"),
      );
      expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([first, "GET /api/v1/caller"]);
      expect(fs.readFileSync(path.join(app, ".agentflow", "sandbox.json"), "utf8")).toBe(before);
    }
  });

  it("--replace keeps the state file when the deployment has no sandboxes at all", async () => {
    const app = withSpec(await sealedApp());
    const disabled = { status: 404, problem: { type: "ROUTE_NOT_FOUND", detail: "no such route" } } as const;
    const server = await stub(routes({ [`DELETE /api/v1/sandboxes/${SANDBOX}`]: disabled }));
    writeState(app, stateFromCreated(server.url, CREATED));
    const out = await runCli(app, ["deploy", "--sandbox", "--replace", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^ROUTE_NOT_FOUND: /m);
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([`DELETE /api/v1/sandboxes/${SANDBOX}`]);
    expect(STATE(app).id).toBe(SANDBOX);
  });

  it("says a state file an older agentflow-app wrote recorded no sandbox.json to compare with, and installs into its sandbox", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(routes());
    writeState(app, stateFromCreated(server.url, CREATED));
    expect(STATE(app)).not.toHaveProperty("spec_sha256");
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr).toContain(
      `sandbox app (${SANDBOX}) was made by an older agentflow-app, which recorded no sandbox.json to compare with; if sandbox.json changed since, deploy --sandbox --replace makes a new one from it\n`,
    );
    expect(out.stdout).toContain(`installing into sandbox app (${SANDBOX})\n`);
  });

  it("--replace refuses a missing secret before it deletes the recorded sandbox", async () => {
    const app = await sealedApp();
    fs.writeFileSync(
      path.join(app, "sandbox.json"),
      JSON.stringify({ ...SPEC, connections: [{ key: "mail", kind: "resend", secret_env: "MAIL_KEY", settings: { from: "a@example.com" } }] }),
    );
    const server = await stub(routes());
    writeState(app, stateFromCreated(server.url, CREATED));
    const out = await runCli(app, ["deploy", "--sandbox", "--replace", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_SECRET_MISSING: MAIL_KEY/);
    expect(server.seen).toEqual([]);
    expect(STATE(app).id).toBe(SANDBOX);
  });

  it("refuses an install answer the built package does not declare, before any request", async () => {
    const app = withSpec(copyApp());
    expect((await runCli(app, ["build"])).code).toBe(0);
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_SPEC_INVALID: sandbox\.json: install\.parameters\.app_users: the manifest declares no parameter app_users/);
    expect(server.seen).toEqual([]);
  });

  it("warns about a required parameter with no answer, and goes on", async () => {
    const app = copyApp();
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify({ ...FITTING, install: { parameters: { support_group_id: "@group:users" } } }));
    expect((await runCli(app, ["build"])).code).toBe(0);
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr).toContain("warning: install.parameters.automation_principal_id: the manifest requires parameter automation_principal_id");
    expect(server.seen.some((r) => r.path === "/api/v1/app-packages")).toBe(true);
  });

  it("refuses a package whose workflow needs a secret a sandbox cannot give, before any request", async () => {
    const app = copyApp();
    const file = path.join(app, "config/package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    manifest.parameters.push({ key: "api_key", type: "secret_ref", required: true, label: "API key" });
    manifest.egress = [{ host: "api.example.com", purpose: "Looking a record up" }];
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
    const lookup = workflow(
      "lookup", "Look up", "Looks a record up", INITIATOR, restricted("support_group_id"),
      graph(
        "Look up",
        [start(), webhook("call", "Call", { url: "https://api.example.com/v1/x", auth: { kind: "bearer", secret: "api_key" } }), end("done", "Done")],
        edges(["e1", "start", "call"], ["e2", "call", "done"]),
      ),
    );
    writeApp(app, `export default { sections: ${JSON.stringify({ workflows: { lookup }, order: ["lookup"], triggers: {}, actions: {} })}, entityOrder: ["note", "contact"] };\n`);
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify({ ...FITTING, install: { parameters: { support_group_id: "@group:users", automation_principal_id: "@principal:bot" } } }));
    expect((await runCli(app, ["build"])).code).toBe(0);
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_SPEC_INVALID: sandbox\.json: install\.parameters\.api_key: the manifest requires parameter api_key \(secret_ref\).*workflow:lookup uses it, so AgentFlow refuses the install/);
    expect(server.seen).toEqual([]);
    expect((await runCli(app, ["sandbox", "check"], { env: {} })).stderr).toMatch(/^SANDBOX_SPEC_INVALID: /);
  });

  it("does not compare the answers with package/ when --file names the package to upload", async () => {
    const app = withSpec(copyApp());
    expect((await runCli(app, ["build"])).code).toBe(0);
    expect((await runCli(app, ["keygen", "--key-id", "acme-1"])).code).toBe(0);
    expect((await runCli(app, ["seal"])).code).toBe(0);
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr).not.toContain("SANDBOX_SPEC_INVALID");
    expect(server.seen.some((r) => r.path === "/api/v1/app-packages")).toBe(true);
  });

  it("uploads each of sandbox.json's dependencies before the package, with the deploy key, and on --upgrade too", async () => {
    const app = await sealedApp();
    const dependency = path.join(app, "deps", "rfx-erp-core-1.0.0.afpkg");
    fs.mkdirSync(path.dirname(dependency));
    fs.copyFileSync(sealedPath(app), dependency);
    const spec = {
      ...SPEC,
      connections: [{ key: "erp", kind: "sandbox_erp" }],
      dependencies: ["deps/rfx-erp-core-1.0.0.afpkg"],
      install: { ...SPEC.install, decisions: { parameters: { "rfx/erp-core": { erp: "@connection:erp", erp_readers: "@group:users" } } } },
    };
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(spec));
    let uploads = 0;
    const upload = () =>
      uploads++ % 2 === 0
        ? { status: 201, json: { package_id: "rfx/erp-core", version: "1.0.0", digest: "e", signer: "s" } }
        : { status: 201, json: { package_id: "rfx/mini", version: "1.0.0", digest: "d", signer: "s" } };
    const server = await stub(routes({ "POST /api/v1/app-packages": upload }));
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app), "--json"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    noSecrets(out);
    expect(server.seen.map((r) => `${r.method} ${r.path}`).slice(0, 4)).toEqual([
      "POST /api/v1/sandboxes",
      "POST /api/v1/app-packages",
      "POST /api/v1/app-packages",
      "POST /api/v1/app-deployments",
    ]);
    expect(server.seen[1]!.body.toString("latin1")).toContain('filename="rfx-erp-core-1.0.0.afpkg"');
    const created = JSON.parse(server.seen[0]!.body.toString());
    expect(created.spec).not.toHaveProperty("dependencies");
    expect(created.spec.connections).toEqual(spec.connections);
    const printed = JSON.parse(out.stdout);
    expect(printed.dependencies).toEqual([{ package_id: "rfx/erp-core", version: "1.0.0", digest: "e", signer: "s" }]);
    expect(JSON.parse(server.seen[3]!.body.toString())).toMatchObject({ package_id: "rfx/mini" });

    const text = await runCli(app, ["deploy", "--sandbox", "--upgrade", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(text.code).toBe(0);
    expect(text.stdout).toContain("uploaded dependency rfx/erp-core 1.0.0\nuploaded rfx/mini 1.0.0\n");
  });

  it("stops at a refused dependency upload: no second upload and no deployment", async () => {
    const app = await sealedApp();
    const dependency = path.join(app, "deps", "rfx-erp-core-1.0.0.afpkg");
    fs.mkdirSync(path.dirname(dependency));
    fs.copyFileSync(sealedPath(app), dependency);
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify({ ...SPEC, dependencies: ["deps/rfx-erp-core-1.0.0.afpkg"] }));
    const refusing = { status: 422, problem: { type: "PACKAGE_MANIFEST_INVALID", detail: "the manifest is not valid" } };
    const server = await stub(routes({ "POST /api/v1/app-packages": refusing }));
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("PACKAGE_MANIFEST_INVALID");
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual(["POST /api/v1/sandboxes", "POST /api/v1/app-packages"]);
  });

  it("refuses a dependency it cannot read before any request", async () => {
    const app = await sealedApp();
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify({ ...SPEC, dependencies: ["deps/missing.afpkg"] }));
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("SANDBOX_SPEC_INVALID: sandbox.json: dependencies[0]: cannot read `deps/missing.afpkg` (ENOENT)");
    expect(server.seen).toEqual([]);
  });

  it("seals package/ in memory when no --file is given, and writes nothing to dist-app/", async () => {
    const app = copyApp();
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(FITTING));
    expect((await runCli(app, ["build"])).code).toBe(0);
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain("sealed rfx/mini 1.0.0 with a key made for this deploy");
    const upload = server.seen.find((r) => r.path === "/api/v1/app-packages")!;
    const signature = JSON.parse(readZip(filePart(upload, "package")).get("signature")!.toString("utf8"));
    expect(signature.keyId).toBe("sandbox");
    expect(fs.existsSync(path.join(app, "dist-app"))).toBe(false);
  });

  it("refuses a stale package/ before any request", async () => {
    const app = withSpec(copyApp());
    expect((await runCli(app, ["build"])).code).toBe(0);
    const file = path.join(app, "config/package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    fs.writeFileSync(file, JSON.stringify({ ...manifest, name: "Another desk" }, null, 2));
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox"], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^PACKAGE_STALE: /);
    expect(server.seen).toEqual([]);
  });

  it("refuses --parameters with --sandbox", async () => {
    const app = withSpec(await sealedApp());
    fs.writeFileSync(path.join(app, "parameters.json"), "{}");
    const out = await runCli(app, ["deploy", "--sandbox", "--parameters", "parameters.json"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("deploy --sandbox takes its answers from sandbox.json");
  });

  it("refuses --no-arm without --sandbox", async () => {
    const out = await runCli(await sealedApp(), ["deploy", "--no-arm"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(2);
  });

  it("reports an arm refusal and still records the installation", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(
      routes({
        "POST /api/v1/app-installations/inst-1/arm": {
          status: 409,
          problem: { type: "APP_ARM_REFUSED", detail: "a trigger is not ready", extensions: { findings: [{ trigger: "trigger:t", reason: "run_account_missing" }] } },
        },
      }),
    );
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("trigger:t: run_account_missing");
    noSecrets(out);
    expect(STATE(app).installation).toMatchObject({ armed: [], objects: { "entity:case": "e-1" } });
  });

  it("records the armed triggers when reading the objects fails afterwards", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(
      routes({ "GET /api/v1/app-installations/inst-1/objects": { status: 500, problem: { type: "INTERNAL", detail: "down" } } }),
    );
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).not.toBe(0);
    expect(STATE(app).installation).toMatchObject({ id: "inst-1", armed: ["trigger:t"], objects: {} });
  });

  it("refuses --wait with --sandbox before any request", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox", "--wait", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("deploy --sandbox always waits; drop --wait");
    expect(server.seen).toEqual([]);
  });

  it("--no-arm skips arm", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(routes());
    const out = await runCli(app, ["deploy", "--sandbox", "--no-arm", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(server.seen.some((r) => r.path.endsWith("/arm"))).toBe(false);
    expect(out.stdout).toContain("not armed (--no-arm)");
    expect(STATE(app).installation.armed).toEqual([]);
  });

  it("reports an install that never settles as DEPLOY_STALLED", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(
      routes({ "GET /api/v1/app-deployments/dep-1": { status: 200, json: { deployment_id: "dep-1", status: "installing", approve_url: "u" } } }),
    );
    let clock = 1_000_000;
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], {
      env: envWith(server.url),
      onInterrupt: () => () => {},
      now: () => clock,
      sleep: async (ms: number) => {
        clock += ms;
      },
    });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("installing; this usually takes a minute or two (300 s at most); Ctrl-C stops waiting, and the sandbox stays\n");
    expect(out.stderr).toMatch(/^DEPLOY_STALLED: /m);
    expect(out.stderr).toContain("APP_GRANT_SOURCE_WRITES_ENABLED");
    expect(STATE(app)).toMatchObject({ id: SANDBOX, installation: null });
  });

  it("returns 130 when Ctrl-C stops the wait, and keeps the sandbox", async () => {
    const app = withSpec(await sealedApp());
    const server = await stub(
      routes({ "GET /api/v1/app-deployments/dep-1": { status: 200, json: { deployment_id: "dep-1", status: "installing", approve_url: "u" } } }),
    );
    let interrupt = () => {};
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], {
      env: envWith(server.url),
      onInterrupt: (listener) => {
        interrupt = listener;
        return () => {};
      },
      sleep: async () => interrupt(),
    });
    expect(out.code).toBe(130);
    expect(out.stderr).toContain("stopped waiting");
    expect(STATE(app).id).toBe(SANDBOX);
  });
});

describe("deploy --sandbox --upgrade", () => {
  const INSTALLED = { id: "inst-0", deployment_id: "dep-0", package_id: "rfx/mini", version: "0.9.0", armed: [], objects: {}, parameters: {} };
  const upgrade = (app: string, url: string, ...more: string[]) =>
    runCli(app, ["deploy", "--sandbox", "--upgrade", "--file", sealedPath(app), ...more], { env: envWith(url), ...fast });

  it("installs into the recorded sandbox without deleting it or reading secrets", async () => {
    const app = await sealedApp();
    const server = await stub(
      routes({
        "GET /api/v1/app-deployments/dep-1": {
          status: 200,
          json: { deployment_id: "dep-1", status: "installed", installation_id: "inst-1", approve_url: "u", from_version: "0.9.0" },
        },
      }),
    );
    writeState(app, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(0);
    noSecrets(out);
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([
      `GET /api/v1/sandboxes/${SANDBOX}`,
      "POST /api/v1/app-packages",
      "POST /api/v1/app-deployments",
      "POST /api/v1/app-deployments/dep-1/plan",
      "POST /api/v1/app-deployments/dep-1/plan",
      "POST /api/v1/app-deployments/dep-1/approve",
      "GET /api/v1/app-deployments/dep-1",
      "POST /api/v1/app-installations/inst-1/arm",
      "GET /api/v1/app-installations/inst-1/objects",
      "GET /api/v1/app-installations/inst-1/retired",
    ]);
    expect(JSON.parse(server.seen[2]!.body.toString()).parameters).toEqual(CREATED.install.parameters);
    const state = STATE(app);
    expect(state.id).toBe(SANDBOX);
    expect(state.installation).toMatchObject({ id: "inst-1", deployment_id: "dep-1", version: "1.0.0" });
    expect(out.stdout).toContain(`upgraded rfx/mini 0.9.0 to 1.0.0 in sandbox app (${SANDBOX})\n`);
  });

  it("sends no recorded answer for a dependency the upgrade does not write, asking a plan with no answers first", async () => {
    const app = await sealedApp();
    const planned = { setup: FIRST_PLAN.plan.setup, document: { installations: [{ package_id: "rfx/mini", clients: [] }] } };
    let plans = 0;
    const server = await stub(
      routes({ "POST /api/v1/app-deployments/dep-1/plan": () => ({ status: 200, json: { plan: planned, plan_hash: `h${++plans}` } }) }),
    );
    const decisions = { parameters: { "rfx/mini": { app_users: "g" }, "rfx/erp-core": { erp: "c-1" } }, grants: { "rfx/erp-core": { read: "declined" } } };
    writeState(app, { ...stateFromCreated(server.url, CREATED), install: { ...CREATED.install, decisions }, installation: INSTALLED });
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(0);
    const plansAsked = server.seen.filter((r) => r.path.endsWith("/plan") || r.path.endsWith("/approve")).map((r) => JSON.parse(r.body.toString()));
    const own = { "rfx/mini": { app_users: "g" } };
    expect(plansAsked).toEqual([
      { decisions: {} },
      { decisions: { parameters: own } },
      { decisions: { parameters: own, features: { "rfx/mini": ["extras"] } } },
      { plan_hash: "h3", decisions: { parameters: own, features: { "rfx/mini": ["extras"] } } },
    ]);
    expect(out.stderr).toContain("rfx/erp-core is not part of this install");

    // An older CLI left the answers on the setup, so AgentFlow still refuses: the refusal says to discard it.
    const finding = { code: "APP_DECISION_UNMATCHED", package_id: "rfx/erp-core", logical_key: "entity:case", pointer: "decisions/parameters", message: null };
    const stuck = await stub(
      routes({
        "POST /api/v1/app-deployments/dep-1/plan": () => ({ status: 200, json: { plan: planned, plan_hash: "h" } }),
        "POST /api/v1/app-deployments/dep-1/approve": {
          status: 409,
          problem: {
            type: "APP_PLAN_CHANGED",
            detail: "the plan cannot be approved: APP_DECISION_UNMATCHED on entity:case of rfx/erp-core at decisions/parameters",
            extensions: { plan_findings: [finding] },
          },
        },
      }),
    );
    writeState(app, { ...stateFromCreated(stuck.url, CREATED), install: { ...CREATED.install, decisions }, installation: INSTALLED });
    const refused = await upgrade(app, stuck.url);
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain("answers for rfx/erp-core, which this install does not write, stay on the setup from an earlier deploy: choose Discard this setup");

    // An answer for the app's own key the release dropped is not the setup's to discard: no hint.
    const ownKey = await stub(
      routes({
        "POST /api/v1/app-deployments/dep-1/plan": () => ({ status: 200, json: { plan: planned, plan_hash: "h" } }),
        "POST /api/v1/app-deployments/dep-1/approve": {
          status: 409,
          problem: { type: "APP_PLAN_CHANGED", detail: "the plan cannot be approved: APP_DECISION_UNMATCHED on entity:case of rfx/mini at decisions/parameters/gone" },
        },
      }),
    );
    writeState(app, { ...stateFromCreated(ownKey.url, CREATED), installation: INSTALLED });
    const ownRefused = await upgrade(app, ownKey.url);
    expect(ownRefused.code).toBe(1);
    expect(ownRefused.stderr).not.toContain("Discard this setup");
  });

  it("warns, before any upload, when the deployment cannot sign as the package does", async () => {
    const app = await sealedSigningApp();
    const platform = { platform_version: "2026.11", format_versions: [1], esign: { methods: ["server_email"] } };
    const server = await stub(routes({ "GET /api/v1/platform": { status: 200, json: platform } }));
    writeState(app, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
    const out = await upgrade(app, server.url);
    expect(out.stderr.startsWith(`${SERVER_EMAIL_ONLY}\n`)).toBe(true);
    expect(server.seen.slice(0, 3).map((r) => `${r.method} ${r.path}`)).toEqual([
      `GET /api/v1/sandboxes/${SANDBOX}`,
      "GET /api/v1/platform",
      "POST /api/v1/app-packages",
    ]);
  });

  it("refuses SANDBOX_GONE before any upload when the sandbox is not live", async () => {
    for (const [answer, asked] of [
      [{ status: 404, problem: { type: "SANDBOX_NOT_FOUND", detail: "no such sandbox" } }, ["GET /api/v1/caller"]],
      [{ status: 200, json: { id: SANDBOX, name: "app", state: "deleted", expires_at: CREATED.expires_at } }, []],
    ] as const) {
      const app = await sealedApp();
      const server = await stub(routes({ [`GET /api/v1/sandboxes/${SANDBOX}`]: answer, "GET /api/v1/caller": DEPLOY_KEY_REFUSED }));
      writeState(app, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
      const out = await upgrade(app, server.url);
      expect(out.code).toBe(1);
      expect(out.stderr).toMatch(/^SANDBOX_GONE: .*deploy --sandbox without --upgrade makes a new one/m);
      noSecrets(out);
      expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([`GET /api/v1/sandboxes/${SANDBOX}`, ...asked]);
    }
  });

  it("refuses SANDBOX_ELSEWHERE before any request when the sandbox was made on another AgentFlow, with any flag", async () => {
    for (const [flag, verb] of [["--upgrade", "upgrade"], [undefined, "install into"], ["--replace", "replace"]] as const) {
      const app = withSpec(await sealedApp());
      const server = await stub(routes());
      writeState(app, { ...stateFromCreated("https://other.example", CREATED), installation: INSTALLED });
      const args = ["deploy", "--sandbox", ...(flag ? [flag] : []), "--file", sealedPath(app)];
      const out = await runCli(app, args, { env: envWith(server.url), ...fast });
      expect(out.code, verb).toBe(1);
      expect(out.stderr).toMatch(/^SANDBOX_ELSEWHERE: .*made on https:\/\/other\.example, not /m);
      expect(out.stderr).toContain(`set AGENTFLOW_URL to https://other.example to ${verb} it`);
      expect(out.stderr).toContain("sandbox delete with AGENTFLOW_URL=https://other.example");
      noSecrets(out);
      expect(server.seen).toEqual([]);
      expect(STATE(app).url).toBe("https://other.example");
    }
  });

  it("names the version the deployment replaced, not the one the state file recorded", async () => {
    for (const [from, line] of [
      ["0.8.0", "upgraded rfx/mini 0.8.0 to 1.0.0"],
      [null, "installed rfx/mini 1.0.0"],
    ] as const) {
      const app = await sealedApp();
      const server = await stub(
        routes({
          "GET /api/v1/app-deployments/dep-1": {
            status: 200,
            json: { deployment_id: "dep-1", status: "installed", installation_id: "inst-1", approve_url: "u", from_version: from },
          },
        }),
      );
      // The state file records 0.9.0.
      writeState(app, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
      const out = await upgrade(app, server.url);
      expect(out.code).toBe(0);
      expect(out.stdout).toContain(`${line} in sandbox app (${SANDBOX})\n`);
    }
  });

  it("refuses with no recorded sandbox", async () => {
    const app = await sealedApp();
    const server = await stub(routes());
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_STATE_MISSING: /);
    expect(server.seen).toEqual([]);
  });

  it("says to raise the version when the sandbox already holds it", async () => {
    const app = await sealedApp();
    const server = await stub(
      routes({ "POST /api/v1/app-packages": { status: 409, problem: { type: "APP_PACKAGE_VERSION_EXISTS", detail: "rfx/mini 1.0.0 is uploaded already" } } }),
    );
    writeState(app, { ...stateFromCreated(server.url, CREATED), installation: { ...INSTALLED, version: "1.0.0" } });
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^APP_PACKAGE_VERSION_EXISTS: .*raise version/m);
    expect(STATE(app).installation).toEqual({ ...INSTALLED, version: "1.0.0" });
  });

  it("waits on the deployment an unchanged package replays, without planning it again", async () => {
    for (const status of ["installed", "installing"]) {
      const app = await sealedApp();
      const server = await stub(
        routes({ "POST /api/v1/app-deployments": { status: 200, json: { deployment_id: "dep-1", status, installation_id: "inst-1", approve_url: "u" } } }),
      );
      writeState(app, stateFromCreated(server.url, CREATED));
      const out = await upgrade(app, server.url);
      expect(out.code).toBe(0);
      expect(server.seen.some((r) => r.path.endsWith("/plan") || r.path.endsWith("/approve"))).toBe(false);
      expect(STATE(app).installation).toMatchObject({ id: "inst-1", version: "1.0.0" });
      // A deployment that had already ended installed nothing in this run.
      const line = status === "installed" ? "rfx/mini 1.0.0 was already installed" : "installed rfx/mini 1.0.0";
      expect(out.stdout).toContain(`${line} in sandbox app (${SANDBOX})\n`);
    }
  });

  it("refuses --upgrade or --replace without --sandbox, and the two together", async () => {
    for (const [args, said] of [
      [["--upgrade"], "--upgrade goes with --sandbox"],
      [["--replace"], "--replace goes with --sandbox"],
      [["--sandbox", "--upgrade", "--replace"], "--upgrade keeps the recorded sandbox and --replace deletes it"],
    ] as const) {
      const out = await runCli(await sealedApp(), ["deploy", ...args], { env: envWith("http://127.0.0.1:9") });
      expect(out.code, said).toBe(2);
      expect(out.stderr).toContain(said);
    }
  });

  it("lists the objects the package retired and where to remove them, and says nothing on an AgentFlow without the list", async () => {
    const upgraded = { deployment_id: "dep-1", status: "installed", installation_id: "inst-1", approve_url: "u", from_version: "0.9.0" };
    const retired = [
      { logical_key: "workflow:probe", kind: "workflow" },
      { logical_key: "trigger:probe_daily", kind: "trigger" },
    ];
    for (const answer of [
      { status: 200, json: { objects: retired } },
      { status: 404, problem: { type: "ROUTE_NOT_FOUND", detail: "no operation matches this path" } },
    ] as const) {
      const app = await sealedApp();
      const server = await stub(
        routes({ "GET /api/v1/app-deployments/dep-1": { status: 200, json: upgraded }, "GET /api/v1/app-installations/inst-1/retired": answer }),
      );
      writeState(app, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
      const out = await upgrade(app, server.url);
      expect(out.code).toBe(0);
      expect(out.stderr).not.toContain("warning");
      const json = await upgrade(app, server.url, "--json");
      if (answer.status === 200) {
        expect(out.stdout).toContain(
          "2 objects that rfx/mini retired stay installed as deprecated: workflow:probe, trigger:probe_daily\n" +
            `remove each on the installed app's page, signed in as the owner (pnpm exec agentflow-app sandbox open --as admin): ${server.url}/admin/apps/installed/inst-1\n`,
        );
        expect(JSON.parse(json.stdout).retired).toEqual(["workflow:probe", "trigger:probe_daily"]);
      } else {
        expect(out.stdout).not.toContain("retired");
        expect(JSON.parse(json.stdout)).not.toHaveProperty("retired");
      }
    }
  });

  it("installs into a sandbox that has nothing installed, and a fresh install lists nothing retired", async () => {
    const app = await sealedApp();
    const server = await stub(routes());
    writeState(app, stateFromCreated(server.url, CREATED));
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(`installed rfx/mini 1.0.0 in sandbox app (${SANDBOX})\n`);
    expect(server.seen.some((r) => r.method === "DELETE" || r.path === "/api/v1/sandboxes")).toBe(false);
    const json = await upgrade(app, server.url, "--json");
    expect(json.code).toBe(0);
    expect(JSON.parse(json.stdout)).not.toHaveProperty("retired");
    expect(server.seen.some((r) => r.path.endsWith("/retired"))).toBe(false);
  });
});

describe("sandbox create and the .gitignore", () => {
  it("fails before any request when .gitignore cannot be updated", async () => {
    if (process.getuid?.() === 0) return;
    const app = withSpec(await sealedApp());
    const ignore = path.join(app, ".gitignore");
    fs.writeFileSync(ignore, "node_modules/\n");
    fs.chmodSync(ignore, 0o444);
    const server = await stub(routes());
    const created = await runCli(app, ["sandbox", "create"], { env: envWith(server.url) });
    expect(created.code).toBe(1);
    expect(server.seen).toEqual([]);
    const deployed = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(server.url), ...fast });
    expect(deployed.code).toBe(1);
    expect(server.seen).toEqual([]);
  });

  it("refuses a .gitignore it cannot read, or cannot write, as SANDBOX_STATE_TRACKED before any request", async () => {
    if (process.getuid?.() === 0) return;
    const server = await stub(routes());
    const unreadable = withSpec(await sealedApp());
    fs.mkdirSync(path.join(unreadable, ".gitignore"));
    const readable = withSpec(await sealedApp());
    const ignore = path.join(readable, ".gitignore");
    fs.writeFileSync(ignore, "node_modules/\n");
    fs.chmodSync(ignore, 0o000);
    const readonly = withSpec(await sealedApp());
    fs.writeFileSync(path.join(readonly, ".gitignore"), "node_modules/\n");
    fs.chmodSync(path.join(readonly, ".gitignore"), 0o444);
    for (const app of [unreadable, readable, readonly]) {
      for (const args of [["sandbox", "create"], ["deploy", "--sandbox", "--file", sealedPath(app)]]) {
        const out = await runCli(app, args, { env: envWith(server.url), ...fast });
        expect(out.code).toBe(1);
        expect(out.stderr).toMatch(/^SANDBOX_STATE_TRACKED: .*\.gitignore: cannot (read|write) it \(\w+\), so \.agentflow\/ cannot be kept out of git/);
      }
    }
    expect(server.seen).toEqual([]);
  });
});
