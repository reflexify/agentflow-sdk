import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { copyApp } from "./app-fixture.js";
import { closeStubs, envFor, runCli, stub, TOKEN, type Reply, type Seen } from "./http-stub.js";
import { CREATED, DEPLOY, OWNER, SANDBOX, writeFixtureState } from "./sandbox-fixtures.js";

afterEach(closeStubs);

const approveUrl = (base: string, id: string) => `${base}/admin/apps/deployments/${id}`;

function row(base: string, id: string, packageId: string, version: string, status: string, extra: Record<string, unknown> = {}) {
  return {
    deployment_id: id,
    status,
    status_reason: null,
    kind: "install",
    package_id: packageId,
    name: "Mini",
    version,
    from_version: null,
    parameters: {},
    decisions: {},
    requested_by: { kind: "service_principal", id: "sp-1", name: "ci" },
    approved_by: null,
    problem: null,
    installation_id: null,
    app_key: null,
    created_at: `2026-10-2${id.slice(-1)}T10:00:00Z`,
    updated_at: `2026-10-2${id.slice(-1)}T10:00:00Z`,
    approve_url: approveUrl(base, id),
    ...extra,
  };
}

const FAILURE = { type: "APP_RELEASE_UNAVAILABLE", title: "Conflict", status: 409, detail: "the install run run-1 failed: the stored archive changed" };

async function builtApp(): Promise<string> {
  const app = copyApp();
  expect((await runCli(app, ["build"])).code).toBe(0);
  return app;
}

type Rows = (base: string) => unknown[];

async function server(rows: Rows, caller?: Reply) {
  let base = "";
  const made = await stub((request: Seen): Reply => {
    if (request.method === "GET" && request.path.startsWith("/api/v1/app-deployments?")) {
      return { status: 200, json: { items: rows(base), next_cursor: null, prev_cursor: null } };
    }
    if (request.method === "GET" && request.path === "/api/v1/caller" && caller) return caller;
    return { status: 404, html: "<h1>not found</h1>" };
  });
  base = made.url;
  return made;
}

const mixed: Rows = (base) => [
  row(base, "dep-3", "rfx/mini-extra", "2.0.0", "awaiting_approval"),
  row(base, "dep-2", "rfx/mini", "1.0.1", "installed", { installation_id: "inst-1", app_key: "mini" }),
  row(base, "dep-1", "rfx/mini", "1.0.0", "failed", { problem: FAILURE }),
];

describe("status", () => {
  it("lists this package's deployments newest first, asking for the newest ten by created_at", async () => {
    const app = await builtApp();
    const api = await server(mixed);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stderr).toBe("");
    const lines = out.stdout.trimEnd().split("\n");
    expect(lines[0]).toBe("rfx/mini (package/ is 1.0.0)");
    expect(lines[1]).toContain("1.0.1  installed");
    expect(lines[1]).toContain("installation inst-1");
    expect(lines[1]).not.toContain(approveUrl(api.url, "dep-2"));
    expect(lines[1]).not.toContain("approve");
    expect(lines[2]).toContain(`1.0.0  failed: APP_RELEASE_UNAVAILABLE — ${FAILURE.detail}`);
    expect(lines[2]).toContain(`setup page: ${approveUrl(api.url, "dep-1")}`);
    expect(out.stdout).not.toContain("mini-extra");
    expect(lines).toHaveLength(4);
    expect(lines[3]).toBe("no sandbox here: .agentflow/sandbox.json is absent (none was made in this folder, or sandbox delete removed it); a sandbox's own deployment is not in the list above");
    const [list] = api.seen;
    const query = new URL(list!.path, api.url).searchParams;
    expect(Object.fromEntries(query)).toEqual({ q: "rfx/mini", sort: "created_at", dir: "desc", limit: "200" });
    expect(api.seen.every((seen) => seen.method === "GET")).toBe(true);
  });

  it("labels the link of a deployment still awaiting approval", async () => {
    const app = await builtApp();
    const api = await server((base) => [row(base, "dep-1", "rfx/mini", "1.0.0", "awaiting_approval")]);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.stdout).toContain(`awaiting approval  approve: ${approveUrl(api.url, "dep-1")}`);
  });

  it("prints each finding of the last plan of a waiting deployment on its own line, under it", async () => {
    const app = await builtApp();
    const plan_findings = [
  { code: "APP_STEP_FAILED", package_id: "rfx/mini", logical_key: "entity:leave_request", pointer: "VALIDATION_ERROR", message: "create form must bind every required field: employee" },
  { code: "APP_STEP_FAILED", package_id: "rfx/mini", logical_key: "dashboard:overview", pointer: "TILE_POSITION_INVALID", message: null },
];
    const api = await server((base) => [row(base, "dep-1", "rfx/mini", "1.0.0", "awaiting_approval", { plan_findings })]);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    const lines = out.stdout.trimEnd().split("\n");
    expect(lines[1]).toContain("awaiting approval");
    expect(lines[2]).toBe("  when a person last planned its setup, this stopped its approval (some findings depend on what that person may grant):");
    expect(lines.slice(3, 5)).toEqual([
  "    APP_STEP_FAILED on entity:leave_request at VALIDATION_ERROR: create form must bind every required field: employee",
  "    APP_STEP_FAILED on dashboard:overview at TILE_POSITION_INVALID",
]);
    const json = await runCli(app, ["status", "--json"], { env: envFor(api.url) });
    expect(JSON.parse(json.stdout).deployments[0].plan_findings).toEqual(plan_findings);
  });

  it("follows the pages past other packages whose id contains this one, and stops at ten of its own", async () => {
    const app = await builtApp();
    let base = "";
    const api = await stub((request) => {
      const cursor = new URL(request.path, base).searchParams.get("cursor");
      const others = Array.from({ length: 10 }, (_, n) => row(base, `dep-o${n}`, "rfx/mini-servicing", "3.0.0", "installed"));
      if (cursor === null) return { status: 200, json: { items: others, next_cursor: "p2", prev_cursor: null } };
      if (cursor === "p2") {
        const own = Array.from({ length: 12 }, (_, n) => row(base, `dep-${n}`, "rfx/mini", "1.0.0", n === 0 ? "failed" : "cancelled", n === 0 ? { problem: FAILURE } : {}));
        return { status: 200, json: { items: own, next_cursor: "p3", prev_cursor: "p1" } };
      }
      return { status: 500, html: "no third page should be read" };
    });
    base = api.url;
    const out = await runCli(app, ["status", "--json"], { env: envFor(api.url) });
    expect(out.code).toBe(1);
    const report = JSON.parse(out.stdout);
    expect(report.deployments).toHaveLength(10);
    expect(report.deployments[0]).toMatchObject({ deployment_id: "dep-0", status: "failed" });
    expect(api.seen).toHaveLength(2);
  });

  it("stops after five pages", async () => {
    const app = await builtApp();
    let base = "";
    let pages = 0;
    const api = await stub(() => {
      pages++;
      return { status: 200, json: { items: [row(base, "dep-x", "rfx/mini-servicing", "3.0.0", "installed")], next_cursor: `p${pages + 1}`, prev_cursor: null } };
    });
    base = api.url;
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain("no deployments of rfx/mini");
    expect(pages).toBe(5);
  });

  it("exits 1 when the newest deployment failed", async () => {
    const app = await builtApp();
    const api = await server((base) => [row(base, "dep-1", "rfx/mini", "1.0.0", "failed", { problem: FAILURE })]);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(1);
    expect(out.stdout).toContain(`failed: APP_RELEASE_UNAVAILABLE — ${FAILURE.detail}`);
  });

  it("says so when the package has no deployment yet, and exits 0", async () => {
    const app = await builtApp();
    const api = await server((base) => [row(base, "dep-1", "rfx/mini-extra", "1.0.0", "installed")]);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stdout.split("\n").slice(0, 2)).toEqual(["rfx/mini (package/ is 1.0.0)", "no deployments of rfx/mini"]);
  });

  it("--json prints one value: the package and its deployments", async () => {
    const app = await builtApp();
    const api = await server(mixed);
    const out = await runCli(app, ["status", "--json"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(out.stdout)).toEqual({
      package_id: "rfx/mini",
      version: "1.0.0",
      deployments: [
        {
          deployment_id: "dep-2",
          version: "1.0.1",
          status: "installed",
          problem: null,
          approve_url: approveUrl(api.url, "dep-2"),
          installation_id: "inst-1",
          created_at: "2026-10-22T10:00:00Z",
        },
        {
          deployment_id: "dep-1",
          version: "1.0.0",
          status: "failed",
          problem: { type: FAILURE.type, detail: FAILURE.detail },
          approve_url: approveUrl(api.url, "dep-1"),
          installation_id: null,
          created_at: "2026-10-21T10:00:00Z",
        },
      ],
      sandbox: null,
    });
  });

  it("shows the sandbox in .agentflow/sandbox.json as live when its deploy key still works", async () => {
    const app = await builtApp();
    const api = await server(mixed, { status: 200, json: { id: "x", org_id: SANDBOX, kind: "service_principal", display_name: "d", email: null, app: null } });
    writeFixtureState(app, api.url);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(`sandbox ${SANDBOX}: live, expires ${CREATED.expires_at}`);
    const probe = api.seen.find((seen) => seen.path === "/api/v1/caller");
    expect(probe?.headers.authorization).toBe(`Bearer ${DEPLOY}`);
    const json = JSON.parse((await runCli(app, ["status", "--json"], { env: envFor(api.url) })).stdout);
    expect(json.sandbox).toEqual({ id: SANDBOX, state: "live", expires_at: CREATED.expires_at });
  });

  it("says the sandbox is gone when its deploy key is refused, keeps the file, and does not fail", async () => {
    const app = await builtApp();
    const api = await server(mixed, { status: 401, problem: { type: "UNAUTHENTICATED", detail: "unknown key" } });
    writeFixtureState(app, api.url);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(`sandbox ${SANDBOX}: gone (it expired, or was deleted from another folder or with --id; this folder's .agentflow/sandbox.json is left; it was to expire ${CREATED.expires_at})`);
    expect(fs.existsSync(path.join(app, ".agentflow", "sandbox.json"))).toBe(true);
    const json = JSON.parse((await runCli(app, ["status", "--json"], { env: envFor(api.url) })).stdout);
    expect(json.sandbox).toEqual({ id: SANDBOX, state: "gone", expires_at: CREATED.expires_at });
  });

  it("says no sandbox in plain words after sandbox delete removed the state file, and --json has null", async () => {
    const app = await builtApp();
    const api = await server(mixed);
    writeFixtureState(app, api.url);
    fs.rmSync(path.join(app, ".agentflow", "sandbox.json"));
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.stdout).toContain("no sandbox here: .agentflow/sandbox.json is absent");
    expect(out.stdout).not.toContain("gone");
    expect(JSON.parse((await runCli(app, ["status", "--json"], { env: envFor(api.url) })).stdout).sandbox).toBeNull();
  });

  it("does not call an unreadable state file absent", async () => {
    const app = await builtApp();
    const api = await server(mixed);
    fs.mkdirSync(path.join(app, ".agentflow"), { recursive: true });
    fs.writeFileSync(path.join(app, ".agentflow", "sandbox.json"), "{");
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.stdout).toContain("sandbox: .agentflow/sandbox.json could not be read (above)");
    expect(out.stdout).not.toContain("is absent");
    expect(out.stderr).toContain("is not a sandbox state file");
  });

  it("does not probe a sandbox made on another deployment", async () => {
    const app = await builtApp();
    const api = await server(mixed, { status: 401, problem: { type: "UNAUTHENTICATED", detail: "unknown key" } });
    writeFixtureState(app, "http://127.0.0.1:9");
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(`sandbox ${SANDBOX}: on http://127.0.0.1:9, not this deployment; expires ${CREATED.expires_at}`);
    expect(api.seen.some((seen) => seen.path === "/api/v1/caller")).toBe(false);
  });

  it("gives a key that cannot list deployments the server's code and the remedy", async () => {
    const app = await builtApp();
    const api = await stub(() => ({ status: 403, problem: { type: "FORBIDDEN", detail: "missing integration.admin" } }));
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("FORBIDDEN: missing integration.admin");
    expect(out.stderr).toContain("check AGENTFLOW_TOKEN");
  });

  it("refuses with PACKAGE_MISSING when there is no package/, before sending anything", async () => {
    const app = copyApp();
    fs.rmSync(path.join(app, "package"), { recursive: true });
    const api = await server(mixed);
    const out = await runCli(app, ["status"], { env: envFor(api.url) });
    expect(out).toEqual({ code: 1, stdout: "", stderr: `PACKAGE_MISSING: no package/ in ${app}: run pnpm build first\n` });
    expect(api.seen).toEqual([]);
  });

  it("never prints a token, with or without --json, whatever the deployment answers", async () => {
    const app = await builtApp();
    const api = await server(
      (base) => [row(base, "dep-1", "rfx/mini", "1.0.0", "failed", { problem: { type: "SOMETHING_BROKE", detail: `bad key ${TOKEN} ${DEPLOY} ${OWNER}` } })],
      { status: 200, json: { id: "x", display_name: DEPLOY } },
    );
    writeFixtureState(app, api.url);
    for (const argv of [["status"], ["status", "--json"]]) {
      const out = await runCli(app, argv, { env: envFor(api.url) });
      for (const secret of [TOKEN, DEPLOY, OWNER]) expect(out.stdout + out.stderr, argv.join(" ")).not.toContain(secret);
    }
  });
});
