import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readZip } from "../src/seal/zip.js";
import { stateFromCreated, writeState } from "../src/sandbox/state.js";
import { copyApp, sealedApp, sealedSigningApp, SERVER_EMAIL_ONLY } from "./app-fixture.js";
import { closeStubs, filePart, runCli, stub } from "./http-stub.js";
import {
  CREATED, CREATED_2, DEPLOY_2, envWith, noSecrets, OLD, OWNER_2, routes, SANDBOX, SANDBOX_2, FIRST_PLAN, sealedPath, SECOND_PLAN, SPEC,
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
  it("replaces the previous sandbox, installs as the owner with the sandbox defaults, arms and records the objects", async () => {
    const app = await sealedApp();
    fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(SPEC));
    const server = await stub(routes());
    writeState(app, { ...stateFromCreated(server.url, CREATED), id: OLD });
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app), "--json"], { env: envWith(server.url), sleep: async () => {} });
    expect(out.code).toBe(0);
    noSecrets(out);
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

  it("leaves the sandbox and its state file when approve is refused, and the next deploy replaces it", async () => {
    const app = withSpec(await sealedApp());
    const refusing = await stub(
      routes({ "POST /api/v1/app-deployments/dep-1/approve": { status: 409, problem: { type: "APP_SETUP_INCOMPLETE", detail: "setup is not done" } } }),
    );
    const first = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(refusing.url), ...fast });
    expect(first.code).toBe(1);
    expect(first.stderr).toContain("APP_SETUP_INCOMPLETE");
    expect(first.stderr).toContain("sandbox open --as admin");
    noSecrets(first);
    expect(STATE(app)).toMatchObject({ id: SANDBOX, installation: null });

    const again = await stub(routes({ "POST /api/v1/sandboxes": { status: 201, json: CREATED_2 } }, { deploy: DEPLOY_2, owner: OWNER_2 }));
    const second = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(again.url), ...fast });
    expect(second.code).toBe(0);
    noSecrets(second, DEPLOY_2, OWNER_2);
    expect(`${again.seen[0]!.method} ${again.seen[0]!.path}`).toBe(`DELETE /api/v1/sandboxes/${SANDBOX}`);
    expect(again.seen[1]!.path).toBe("/api/v1/sandboxes");
    expect(STATE(app).id).toBe(SANDBOX_2);
  });

  it("prints each finding of a plan that cannot be approved on its own line", async () => {
    const app = withSpec(await sealedApp());
    const plan_findings = [
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
]) expect(lines).toContain(line);
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

  it("ignores a previous sandbox AgentFlow no longer knows, and fails on any other refusal of its delete", async () => {
    const app = withSpec(await sealedApp());
    const gone = await stub(routes({ [`DELETE /api/v1/sandboxes/${OLD}`]: { status: 404, problem: { type: "SANDBOX_NOT_FOUND", detail: "no such sandbox" } } }));
    writeState(app, { ...stateFromCreated(gone.url, CREATED), id: OLD });
    const out = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(gone.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr).toContain(OLD);
    expect(STATE(app).id).toBe(SANDBOX);

    const forbidden = await stub(routes({ [`DELETE /api/v1/sandboxes/${SANDBOX}`]: { status: 403, problem: { type: "FORBIDDEN", detail: "not yours" } } }));
    const refused = await runCli(app, ["deploy", "--sandbox", "--file", sealedPath(app)], { env: envWith(forbidden.url), ...fast });
    expect(refused.code).toBe(1);
    expect(refused.stderr).toMatch(/^FORBIDDEN: /);
    expect(forbidden.seen).toHaveLength(1);
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
    ]);
    expect(JSON.parse(server.seen[2]!.body.toString()).parameters).toEqual(CREATED.install.parameters);
    const state = STATE(app);
    expect(state.id).toBe(SANDBOX);
    expect(state.installation).toMatchObject({ id: "inst-1", deployment_id: "dep-1", version: "1.0.0" });
    expect(out.stdout).toContain(`upgraded rfx/mini 0.9.0 to 1.0.0 in sandbox app (${SANDBOX})\n`);
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
    for (const answer of [
      { status: 404, problem: { type: "SANDBOX_NOT_FOUND", detail: "no such sandbox" } },
      { status: 200, json: { id: SANDBOX, name: "app", state: "deleted", expires_at: CREATED.expires_at } },
    ] as const) {
      const app = await sealedApp();
      const server = await stub(routes({ [`GET /api/v1/sandboxes/${SANDBOX}`]: answer }));
      writeState(app, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
      const out = await upgrade(app, server.url);
      expect(out.code).toBe(1);
      expect(out.stderr).toMatch(/^SANDBOX_GONE: .*deploy --sandbox without --upgrade makes a new one/m);
      noSecrets(out);
      expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([`GET /api/v1/sandboxes/${SANDBOX}`]);
    }
  });

  it("refuses SANDBOX_ELSEWHERE before any request when the sandbox was made on another AgentFlow", async () => {
    const app = await sealedApp();
    const server = await stub(routes());
    writeState(app, { ...stateFromCreated("https://other.example", CREATED), installation: INSTALLED });
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_ELSEWHERE: .*made on https:\/\/other\.example, not /m);
    expect(out.stderr).toContain("set AGENTFLOW_URL to https://other.example");
    // Deploying without --upgrade here would drop the only record of that sandbox's tokens.
    expect(out.stderr).toContain("sandbox delete with AGENTFLOW_URL=https://other.example");
    expect(out.stderr).not.toContain("without --upgrade");
    noSecrets(out);
    expect(server.seen).toEqual([]);
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

  it("refuses --upgrade without --sandbox", async () => {
    const out = await runCli(await sealedApp(), ["deploy", "--upgrade"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("--upgrade goes with --sandbox");
  });

  it("installs into a sandbox that has nothing installed", async () => {
    const app = await sealedApp();
    const server = await stub(routes());
    writeState(app, stateFromCreated(server.url, CREATED));
    const out = await upgrade(app, server.url);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(`installed rfx/mini 1.0.0 in sandbox app (${SANDBOX})\n`);
    expect(server.seen.some((r) => r.method === "DELETE" || r.path === "/api/v1/sandboxes")).toBe(false);
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
