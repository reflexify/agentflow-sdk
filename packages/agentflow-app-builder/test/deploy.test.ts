import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { copyApp, sealedApp } from "./app-fixture.js";
import { closeStubs, envFor, filePart, runCli, stub, TOKEN, type Reply, type Seen, type Stub } from "./http-stub.js";

afterEach(closeStubs);

const DIGEST = "d".repeat(64);
const released = { package_id: "rfx/mini", version: "1.0.0", digest: DIGEST, signer: "acme-1" };
const fast = { sleep: async () => {}, onInterrupt: () => () => {} };

const sealedFileOf = (app: string) => path.join(app, "dist-app", "rfx-mini-1.0.0.afpkg");
const approveUrl = (base: string, id: string) => `${base}/admin/apps/deployments/${id}`;

function deployment(base: string, id: string, status: string, extra: Record<string, unknown> = {}) {
  return { deployment_id: id, status, kind: "install", approve_url: approveUrl(base, id), ...extra };
}

type Script = { upload?: Reply; create?: (base: string, n: number) => Reply; polls?: (base: string) => Reply[] };

async function deploymentServer(script: Script = {}): Promise<Stub> {
  let base = "";
  let creates = 0;
  let polls = 0;
  const server = await stub((request) => {
    if (request.method === "POST" && request.path === "/api/v1/app-packages") return script.upload ?? { status: 201, json: released };
    if (request.method === "POST" && request.path === "/api/v1/app-deployments") {
      return script.create?.(base, creates++) ?? { status: 201, json: deployment(base, "dep-1", "awaiting_approval") };
    }
    if (request.method === "GET" && request.path === "/api/v1/app-deployments/dep-1") {
      const answers = script.polls?.(base) ?? [];
      const answer = answers[Math.min(polls++, answers.length - 1)];
      return answer ?? { status: 404, problem: { type: "APP_DEPLOYMENT_NOT_FOUND", detail: "no such deployment" } };
    }
    return { status: 404, html: "<h1>not found</h1>" };
  });
  base = server.url;
  return server;
}

const creates = (server: Stub): Seen[] => server.seen.filter((r) => r.method === "POST" && r.path === "/api/v1/app-deployments");
const gets = (server: Stub): Seen[] => server.seen.filter((r) => r.method === "GET");

describe("deploy", () => {
  it("uploads the sealed file, asks for the install with the parameters, and prints where to approve it", async () => {
    const app = await sealedApp();
    const server = await deploymentServer();
    fs.writeFileSync(path.join(app, "parameters.json"), JSON.stringify({ app_users: "group-1" }));
    const out = await runCli(app, ["deploy", "--parameters", "parameters.json"], { env: envFor(server.url) });
    expect(out).toEqual({ code: 0, stdout: `uploaded rfx/mini 1.0.0\nawaiting approval: ${approveUrl(server.url, "dep-1")}\n`, stderr: "" });
    expect(server.seen).toHaveLength(2);
    const [upload, create] = server.seen;
    expect(upload!.headers.authorization).toBe(`Bearer ${TOKEN}`);
    expect(filePart(upload!, "package").equals(fs.readFileSync(sealedFileOf(app)))).toBe(true);
    expect(create!.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(create!.body.toString("utf8"))).toEqual({ package_id: "rfx/mini", version: "1.0.0", parameters: { app_users: "group-1" } });
    expect(create!.headers["idempotency-key"]).toMatch(/^deploy-[0-9a-f]{64}$/);
  });

  it("sends one idempotency key for the same release and settings in any member order, and another when they change", async () => {
    const app = await sealedApp();
    const server = await deploymentServer();
    const write = (name: string, value: unknown) => fs.writeFileSync(path.join(app, name), JSON.stringify(value));
    write("a.json", { app_users: "group-1", region: "eu" });
    write("a-again.json", { region: "eu", app_users: "group-1" });
    write("b.json", { app_users: "group-2", region: "eu" });
    write("d.json", { grants: { "rfx/mini": { readers: "declined" } } });
    const runs = [["--parameters", "a.json"], ["--parameters", "a-again.json"], ["--parameters", "b.json"], ["--parameters", "a.json", "--decisions", "d.json"], []];
    for (const argv of runs) expect((await runCli(app, ["deploy", ...argv], { env: envFor(server.url) })).code).toBe(0);
    const keys = creates(server).map((r) => r.headers["idempotency-key"]);
    expect(keys[0]).toBe(keys[1]);
    expect(new Set(keys).size).toBe(4);
  });

  it("asks again under a new key when the deployment these settings made has ended", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({
      create: (base, n) =>
        n === 0
          ? { status: 201, json: deployment(base, "dep-0", "cancelled", { status_reason: "withdrawn" }) }
          : { status: 201, json: deployment(base, "dep-1", "awaiting_approval") },
    });
    const out = await runCli(app, ["deploy"], { env: envFor(server.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(`awaiting approval: ${approveUrl(server.url, "dep-1")}`);
    const keys = creates(server).map((r) => r.headers["idempotency-key"]);
    expect(keys).toHaveLength(2);
    expect(keys[0]).not.toBe(keys[1]);
  });

  it("says installed when this release is installed already, and does not wait", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({ create: (base) => ({ status: 201, json: deployment(base, "dep-1", "installed") }) });
    const out = await runCli(app, ["deploy", "--wait"], { env: envFor(server.url), ...fast });
    expect(out).toEqual({ code: 0, stdout: "uploaded rfx/mini 1.0.0\ninstalled\n", stderr: "" });
    expect(gets(server)).toEqual([]);
  });

  it("carries on when the same bytes were uploaded before", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({ upload: { status: 200, json: released } });
    const out = await runCli(app, ["deploy"], { env: envFor(server.url) });
    expect(out.code).toBe(0);
    expect(out.stdout.split("\n")[0]).toBe("already uploaded rfx/mini 1.0.0");
  });

  it("refuses with SEAL_MISSING when there is no sealed file, before sending anything", async () => {
    const app = copyApp();
    expect((await runCli(app, ["build"])).code).toBe(0);
    const server = await deploymentServer();
    const out = await runCli(app, ["deploy"], { env: envFor(server.url) });
    expect(out).toEqual({
      code: 1,
      stdout: "",
      stderr: `SEAL_MISSING: ${sealedFileOf(app)} is not there: run agentflow-app seal first, or pass --file\n`,
    });
    const elsewhere = path.join(app, "elsewhere.afpkg");
    const named = await runCli(app, ["deploy", "--file", "elsewhere.afpkg", "--json"], { env: envFor(server.url) });
    expect(JSON.parse(named.stdout)).toEqual({ error: { code: "SEAL_MISSING", message: `${elsewhere}: no such file`, files: [elsewhere] } });
    fs.rmSync(path.join(app, "package"), { recursive: true });
    expect((await runCli(app, ["deploy"], { env: envFor(server.url) })).stderr).toBe(`PACKAGE_MISSING: no package/ in ${app}: run agentflow-app build first\n`);
    expect(server.seen).toEqual([]);
  });

  it("deploys the file --file names", async () => {
    const app = await sealedApp();
    const moved = path.join(app, "release.afpkg");
    fs.renameSync(sealedFileOf(app), moved);
    const server = await deploymentServer();
    expect((await runCli(app, ["deploy", "--file", "release.afpkg"], { env: envFor(server.url) })).code).toBe(0);
    expect(filePart(server.seen[0]!, "package").equals(fs.readFileSync(moved))).toBe(true);
  });

  it("prints a platform refusal with its own code, and the lint problems an upload carries", async () => {
    const app = await sealedApp();
    const old = await deploymentServer({
      upload: { status: 422, problem: { type: "PLATFORM_TOO_OLD", detail: "this deployment is 2026.10; the package needs 2026.11" } },
    });
    expect(await runCli(app, ["deploy"], { env: envFor(old.url) })).toEqual({
      code: 1,
      stdout: "",
      stderr: "PLATFORM_TOO_OLD: this deployment is 2026.10; the package needs 2026.11\n",
    });
    const linted = await deploymentServer({
      upload: {
        status: 422,
        problem: {
          type: "APP_PACKAGE_PROBLEMS",
          detail: "the package has 1 lint problem",
          extensions: { problems: [{ code: "body_invalid", object: { kind: "entity", name: "note" }, path: "/fields/0/type", message: "unknown field type" }] },
        },
      },
    });
    const out = await runCli(app, ["deploy"], { env: envFor(linted.url) });
    expect(out.stderr).toBe('APP_PACKAGE_PROBLEMS: the package has 1 lint problem\nbody_invalid  entity "note"  /fields/0/type: unknown field type\n');
    expect(creates(old)).toEqual([]);
    expect(creates(linted)).toEqual([]);
  });

  it("--wait follows the deployment through approval to installed, polling every 3 s", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({
      polls: (base) => [
        { status: 200, json: deployment(base, "dep-1", "awaiting_approval") },
        { status: 200, json: deployment(base, "dep-1", "installing", { approved_by: { id: "u1", name: "Ana Admin" } }) },
        { status: 200, json: deployment(base, "dep-1", "installed", { installation_id: "inst-1" }) },
      ],
    });
    const slept: number[] = [];
    const out = await runCli(app, ["deploy", "--wait"], {
      env: envFor(server.url),
      onInterrupt: () => () => {},
      sleep: async (ms) => void slept.push(ms),
    });
    expect(out.code).toBe(0);
    expect(out.stdout).toBe(`uploaded rfx/mini 1.0.0\nawaiting approval: ${approveUrl(server.url, "dep-1")}\ninstalled\n`);
    expect(out.stderr).toContain("installing (approved by Ana Admin); this usually takes a minute or two\n");
    expect(gets(server)).toHaveLength(3);
    expect(slept).toEqual([3000, 3000, 3000]);
  });

  it("--wait --json prints one value: the release and the deployment as it ended", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({ polls: (base) => [{ status: 200, json: deployment(base, "dep-1", "installed", { installation_id: "inst-1" }) }] });
    const out = await runCli(app, ["deploy", "--wait", "--json"], { env: envFor(server.url), ...fast });
    expect(out.code).toBe(0);
    expect(out.stderr).toBe("");
    expect(out.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(out.stdout)).toEqual({
      package: { ...released, uploaded: true },
      deployment: deployment(server.url, "dep-1", "installed", { installation_id: "inst-1" }),
    });
  });

  it("--wait ends in DEPLOY_FAILED with the problem when the install fails, and with the reason when it is cancelled", async () => {
    const app = await sealedApp();
    const cases: [Record<string, unknown>, string][] = [
      [
        { status: "failed", problem: { type: "SOMETHING_BROKE", title: "x", status: 422, detail: "the group app_users has no members" } },
        "deployment dep-1 failed with SOMETHING_BROKE: the group app_users has no members",
      ],
      [{ status: "cancelled", status_reason: "superseded" }, "deployment dep-1 was cancelled: a newer deployment of this package replaced it"],
      [{ status: "cancelled", status_reason: "withdrawn" }, "deployment dep-1 was cancelled: it was withdrawn"],
    ];
    for (const [ending, message] of cases) {
      const server = await deploymentServer({
        polls: (base) => [{ status: 200, json: { ...deployment(base, "dep-1", "awaiting_approval"), ...ending } }],
      });
      const out = await runCli(app, ["deploy", "--wait"], { env: envFor(server.url), ...fast });
      expect(out.code).toBe(1);
      expect(out.stderr).toContain(`DEPLOY_FAILED: ${message}; see ${approveUrl(server.url, "dep-1")}\n`);
    }
  });

  it("--wait rides out dropped answers, and gives up after five in a row", async () => {
    const app = await sealedApp();
    const flaky = await deploymentServer({
      polls: (base) => [{ hangUp: true }, { hangUp: true }, { status: 200, json: deployment(base, "dep-1", "installed") }],
    });
    expect((await runCli(app, ["deploy", "--wait"], { env: envFor(flaky.url), ...fast })).code).toBe(0);
    const gone = await deploymentServer({ polls: () => [{ hangUp: true }] });
    const out = await runCli(app, ["deploy", "--wait"], { env: envFor(gone.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/DEPLOY_UNREACHABLE: no answer from /);
    expect(gets(gone)).toHaveLength(5);
  });

  it("Ctrl-C stops the waiting, not the deployment", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({ polls: (base) => [{ status: 200, json: deployment(base, "dep-1", "awaiting_approval") }] });
    let interrupt: (() => void) | undefined;
    let removed = false;
    let naps = 0;
    const out = await runCli(app, ["deploy", "--wait"], {
      env: envFor(server.url),
      onInterrupt: (listener) => {
        interrupt = listener;
        return () => {
          removed = true;
        };
      },
      sleep: async () => {
        if (++naps === 2) interrupt!();
      },
    });
    expect(out.code).toBe(130);
    expect(out.stderr).toContain(
      `stopped waiting: deployment dep-1 is awaiting approval; it goes on at ${approveUrl(server.url, "dep-1")}`,
    );
    expect(removed).toBe(true);
    expect(gets(server)).toHaveLength(1);
    expect(server.seen.some((r) => r.path.endsWith("/cancel"))).toBe(false);
  });

  it("refuses a --parameters or --decisions file that is not a JSON object as a usage error", async () => {
    const app = await sealedApp();
    const server = await deploymentServer();
    fs.writeFileSync(path.join(app, "list.json"), "[1]");
    fs.writeFileSync(path.join(app, "broken.json"), "{");
    const list = await runCli(app, ["deploy", "--parameters", "list.json"], { env: envFor(server.url) });
    expect(list.code).toBe(2);
    expect(list.stderr).toMatch(new RegExp(`^USAGE: --parameters ${path.join(app, "list.json").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: not a JSON object`));
    expect((await runCli(app, ["deploy", "--decisions", "broken.json"], { env: envFor(server.url) })).stderr).toMatch(/^USAGE: --decisions \S+: not JSON/);
    expect((await runCli(app, ["deploy", "--parameters", "none.json"], { env: envFor(server.url) })).stderr).toMatch(/^USAGE: --parameters \S+: cannot read it \(ENOENT\)/);
    expect(server.seen).toEqual([]);
  });

  it("sends grant declines as the decisions, and refuses anything else in --decisions before sending anything", async () => {
    const app = await sealedApp();
    const server = await deploymentServer();
    const write = (name: string, value: unknown) => fs.writeFileSync(path.join(app, name), JSON.stringify(value));
    const decline = { grants: { "rfx/mini": { readers: "declined" } } };
    write("decline.json", decline);
    expect((await runCli(app, ["deploy", "--decisions", "decline.json"], { env: envFor(server.url) })).code).toBe(0);
    expect(JSON.parse(creates(server)[0]!.body.toString("utf8")).decisions).toEqual(decline);
    const cases: [unknown, string][] = [
      [{ approved_clients: { "rfx/mini": [] } }, "approved_clients is not a grant decline"],
      [{ grants: { "rfx/mini": { readers: { to: { kind: "group", id: "g" } } } } }, 'grants.rfx/mini.readers is not "declined"'],
      [{ grants: { "rfx/mini": { readers: "suggested" } } }, 'grants.rfx/mini.readers is not "declined"'],
      [{ grants: ["readers"] }, "grants is not an object"],
    ];
    for (const [decisions, why] of cases) {
      write("d.json", decisions);
      const out = await runCli(app, ["deploy", "--decisions", "d.json"], { env: envFor(server.url) });
      expect(out.code, why).toBe(2);
      expect(out.stderr, why).toContain(`USAGE: --decisions d.json: ${why}; it may only decline grants`);
    }
    expect(creates(server)).toHaveLength(1);
  });

  it("stops after 20 ended deployments in a row, naming what to do instead", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({
      create: (base, n) => ({ status: 201, json: deployment(base, `dep-${n}`, "cancelled", { status_reason: "withdrawn" }) }),
    });
    const out = await runCli(app, ["deploy"], { env: envFor(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("DEPLOY_FAILED: the last 20 deployments of rfx/mini 1.0.0 with these settings all ended");
    expect(out.stderr).toContain("seal a new version, change the settings (--parameters or --decisions), or retry after their idempotency keys expire");
    expect(out.stderr).toContain(`see ${approveUrl(server.url, "dep-19")}`);
    const keys = creates(server).map((r) => r.headers["idempotency-key"]);
    expect(keys).toHaveLength(20);
    expect(new Set(keys).size).toBe(20);
  });

  it("--wait ends at once on a refusal from AgentFlow while polling", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({
      polls: () => [{ status: 404, problem: { type: "APP_DEPLOYMENT_NOT_FOUND", detail: "no deployment dep-1 in this organization" } }],
    });
    const out = await runCli(app, ["deploy", "--wait"], { env: envFor(server.url), ...fast });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("APP_DEPLOYMENT_NOT_FOUND: no deployment dep-1 in this organization");
    expect(gets(server)).toHaveLength(1);
  });

  it("names the variable that is not set", async () => {
    const app = await sealedApp();
    const out = await runCli(app, ["deploy"], { env: { AGENTFLOW_URL: "https://agentflow.example.com" } });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^DEPLOY_NOT_CONFIGURED: AGENTFLOW_TOKEN is not set/);
  });

  it("never prints the token or sends it anywhere but the Authorization header, whatever the deployment answers", async () => {
    const app = await sealedApp();
    const server = await deploymentServer({
      upload: { status: 201, json: { ...released, signer: TOKEN } },
      polls: (base) => [{ status: 200, json: deployment(base, "dep-1", "failed", { problem: { type: "SOMETHING_BROKE", detail: `bad key ${TOKEN}` } }) }],
    });
    for (const argv of [["deploy", "--wait"], ["deploy", "--wait", "--json"], ["deploy", "--json"]]) {
      const out = await runCli(app, argv, { env: envFor(server.url), ...fast });
      expect(out.stdout + out.stderr, argv.join(" ")).not.toContain(TOKEN);
    }
    for (const request of server.seen) {
      expect(request.path).not.toContain(TOKEN);
      expect(request.body.includes(TOKEN)).toBe(false);
      expect(request.headers.authorization).toBe(`Bearer ${TOKEN}`);
    }
  });

  it("an archive refused before AgentFlow names the status and the size", async () => {
    const app = await sealedApp();
    const size = fs.statSync(sealedFileOf(app)).size;
    const tooBig = await deploymentServer({
      upload: { status: 413, html: "<html><body>413 Request Entity Too Large</body></html>" },
    });
    const refused = await runCli(app, ["deploy"], { env: envFor(tooBig.url) });
    expect(refused.code).toBe(1);
    expect(refused.stderr).toMatch(/^DEPLOY_UNREACHABLE: /);
    expect(refused.stderr).toContain("413");
    expect(refused.stderr).toContain(`${size} bytes`);
    expect(refused.stderr).toContain("something in front of AgentFlow refused it");
    const gateway = await deploymentServer({ upload: { status: 502, html: "<html><body>502 Bad Gateway</body></html>" } });
    const bad = await runCli(app, ["deploy", "--json"], { env: envFor(gateway.url) });
    expect(bad.code).toBe(1);
    const { error } = JSON.parse(bad.stdout) as { error: { code: string; message: string } };
    expect(error.code).toBe("DEPLOY_UNREACHABLE");
    expect(error.message).toContain("502");
    expect(error.message).toContain("did not come from AgentFlow");
    expect(creates(tooBig)).toEqual([]);
    expect(creates(gateway)).toEqual([]);
  });
});
