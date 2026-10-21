import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readPayloadDir } from "../src/seal/payload.js";
import { readZip } from "../src/seal/zip.js";
import { copyApp } from "./app-fixture.js";
import { closeStubs, deadUrl, envFor, filePart, runCli, stub, TOKEN } from "./http-stub.js";

afterEach(closeStubs);

const clean = { platform_version: "2026.10", problems: [] };
const twoProblems = {
  platform_version: "2026.10",
  problems: [
    { code: "body_invalid", object: { kind: "entity", name: "note" }, path: "/fields/0/type", message: "unknown field type", fix: "use text" },
    { code: "platform_too_old", object: { kind: "manifest", name: "rfx/mini" }, path: "", message: "this deployment is 2026.10; the package needs 2026.11" },
  ],
};

async function built(): Promise<string> {
  const app = copyApp();
  expect((await runCli(app, ["build"])).code).toBe(0);
  return app;
}

describe("lint", () => {
  it("posts the unsealed package/ as a zip, with the key, and reports a clean result", async () => {
    const app = await built();
    const server = await stub(() => ({ status: 200, json: clean }));
    const out = await runCli(app, ["lint"], { env: envFor(server.url) });
    expect(out).toEqual({ code: 0, stdout: "no problems (AgentFlow 2026.10)\n", stderr: "" });
    expect(server.seen).toHaveLength(1);
    const [request] = server.seen;
    expect(request).toMatchObject({ method: "POST", path: "/api/v1/app-packages/lint" });
    expect(request!.headers.authorization).toBe(`Bearer ${TOKEN}`);
    const sent = readZip(filePart(request!, "package"));
    const onDisk = readPayloadDir(path.join(app, "package"));
    expect([...sent.keys()].sort()).toEqual([...onDisk.keys()].sort());
    for (const [rel, bytes] of onDisk) expect(sent.get(rel)!.equals(bytes), rel).toBe(true);
  });

  it("prints each problem on its own line, then the count, and exits 1", async () => {
    const app = await built();
    const server = await stub(() => ({ status: 200, json: twoProblems }));
    const out = await runCli(app, ["lint"], { env: envFor(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toBe("");
    expect(out.stdout.split("\n")).toEqual([
      'body_invalid  entity "note"  /fields/0/type: unknown field type (fix: use text)',
      'platform_too_old  manifest "rfx/mini": this deployment is 2026.10; the package needs 2026.11',
      "2 problems (AgentFlow 2026.10)",
      "",
    ]);
  });

  it("prints the route's body with --json: exit 0 when clean, 1 with problems", async () => {
    const app = await built();
    let body: unknown = twoProblems;
    const server = await stub(() => ({ status: 200, json: body }));
    const found = await runCli(app, ["lint", "--json"], { env: envFor(server.url) });
    expect(found.code).toBe(1);
    expect(found.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(found.stdout)).toEqual(twoProblems);
    body = clean;
    const none = await runCli(app, ["lint", "--json"], { env: envFor(server.url) });
    expect(none.code).toBe(0);
    expect(JSON.parse(none.stdout)).toEqual(clean);
  });

  it("refuses a stale package/ with PACKAGE_STALE before sending anything", async () => {
    const app = await built();
    const file = path.join(app, "package/manifest.json");
    fs.writeFileSync(file, `${fs.readFileSync(file, "utf8")} `);
    const server = await stub(() => ({ status: 200, json: clean }));
    const out = await runCli(app, ["lint"], { env: envFor(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^PACKAGE_STALE: package\/ does not match the config \(stale: manifest\.json\)/);
    expect(server.seen).toEqual([]);
  });

  it("names the variable that is not set, before building anything, and takes --url over AGENTFLOW_URL", async () => {
    const app = copyApp();
    const noToken = await runCli(app, ["lint"], { env: { AGENTFLOW_URL: "https://agentflow.example.com" } });
    expect(noToken.code).toBe(1);
    expect(noToken.stderr).toMatch(/^DEPLOY_NOT_CONFIGURED: AGENTFLOW_TOKEN is not set/);
    const noUrl = await runCli(app, ["lint", "--json"], { env: { AGENTFLOW_TOKEN: TOKEN } });
    expect(JSON.parse(noUrl.stdout).error).toMatchObject({ code: "DEPLOY_NOT_CONFIGURED", message: expect.stringMatching(/^AGENTFLOW_URL is not set/) });
    expect((await runCli(app, ["build"])).code).toBe(0);
    const server = await stub(() => ({ status: 200, json: clean }));
    const flagged = await runCli(app, ["lint", "--url", server.url], { env: { AGENTFLOW_URL: "https://nowhere.invalid", AGENTFLOW_TOKEN: TOKEN } });
    expect(flagged.code).toBe(0);
    expect(server.seen).toHaveLength(1);
  });

  it("prints a platform refusal with the platform's own code", async () => {
    const app = await built();
    const server = await stub(() => ({ status: 422, problem: { type: "PACKAGE_REFUSED", detail: "the package cannot be linted" } }));
    const out = await runCli(app, ["lint"], { env: envFor(server.url) });
    expect(out).toEqual({ code: 1, stdout: "", stderr: "PACKAGE_REFUSED: the package cannot be linted\n" });
    const asJson = await runCli(app, ["lint", "--json"], { env: envFor(server.url) });
    expect(JSON.parse(asJson.stdout)).toEqual({ error: { code: "PACKAGE_REFUSED", message: "the package cannot be linted" } });
  });

  it("says when nothing answers at the address", async () => {
    const app = await built();
    const out = await runCli(app, ["lint"], { env: envFor(await deadUrl()) });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^DEPLOY_UNREACHABLE: no answer from http:\/\/127\.0\.0\.1:\d+ \(ECONNREFUSED\): check AGENTFLOW_URL/);
  });

  it("never prints the token, even when the deployment echoes it", async () => {
    const app = await built();
    let refuse = true;
    const server = await stub(() =>
      refuse
        ? { status: 401, problem: { type: "INVALID_TOKEN", detail: `unknown credential ${TOKEN}` } }
        : { status: 200, json: { platform_version: "2026.10", problems: [{ code: "body_invalid", object: { kind: "entity", name: TOKEN }, path: "", message: TOKEN }] } },
    );
    const outputs = [await runCli(app, ["lint"], { env: envFor(server.url) }), await runCli(app, ["lint", "--json"], { env: envFor(server.url) })];
    refuse = false;
    outputs.push(await runCli(app, ["lint"], { env: envFor(server.url) }), await runCli(app, ["lint", "--json"], { env: envFor(server.url) }));
    for (const out of outputs) {
      expect(out.stdout + out.stderr).not.toContain(TOKEN);
      expect(out.stdout + out.stderr).toContain("[redacted]");
    }
  });

  it.each([
    [401, "UNAUTHENTICATED", "the credential is not valid"],
    [403, "PERMISSION_DENIED", "the key may not lint packages"],
  ])("a %i from AgentFlow says to check the key, under the platform's own code", async (status, type, detail) => {
    const app = await built();
    const server = await stub(() => ({ status, problem: { type, detail: `${detail} ${TOKEN}` } }));
    const out = await runCli(app, ["lint"], { env: envFor(server.url) });
    expect(out.code).toBe(1);
    expect(out.stdout).toBe("");
    expect(out.stderr).toMatch(new RegExp(`^${type}: ${detail} \\[redacted\\]\n`));
    expect(out.stderr).not.toContain("DEPLOY_UNREACHABLE");
    const hints = out.stderr.split("\n").filter((line) => line.includes("AGENTFLOW_TOKEN"));
    expect(hints).toHaveLength(1);
    expect(hints[0]).toContain("integration.admin");
    const asJson = await runCli(app, ["lint", "--json"], { env: envFor(server.url) });
    expect(asJson.code).toBe(1);
    const { error } = JSON.parse(asJson.stdout);
    expect(error.code).toBe(type);
    expect(error.message).toContain("AGENTFLOW_TOKEN");
    for (const stream of [out.stdout, out.stderr, asJson.stdout, asJson.stderr]) expect(stream).not.toContain(TOKEN);
  });
});
