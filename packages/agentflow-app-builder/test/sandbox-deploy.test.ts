import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readZip } from "../src/seal/zip.js";
import { stateFromCreated, writeState } from "../src/sandbox/state.js";
import { copyApp, sealedApp } from "./app-fixture.js";
import { closeStubs, filePart, runCli, stub } from "./http-stub.js";
import {
  CREATED, CREATED_2, DEPLOY_2, envWith, noSecrets, OLD, OWNER_2, routes, SANDBOX, SANDBOX_2, sealedPath, SPEC,
} from "./sandbox-fixtures.js";

afterEach(closeStubs);

const fast = { sleep: async () => {}, onInterrupt: () => () => {} };
const STATE = (app: string) => JSON.parse(fs.readFileSync(path.join(app, ".agentflow", "sandbox.json"), "utf8"));
const withSpec = (app: string): string => {
  fs.writeFileSync(path.join(app, "sandbox.json"), JSON.stringify(SPEC));
  return app;
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

  it("seals package/ in memory when no --file is given, and writes nothing to dist-app/", async () => {
    const app = withSpec(copyApp());
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
