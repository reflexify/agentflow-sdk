import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { sealedApp } from "./app-fixture.js";
import { parseRelease } from "../src/catalog.js";
import { closeStubs, envFor, filePart, runCli, stub, TOKEN, type Reply } from "./http-stub.js";

afterEach(closeStubs);

const entry = (state = "published") => ({ id: "e1", package_id: "acme/desk", version: "1.0.0", state });
const submission = (status: string) => ({ id: "s1", status, gate_result: "skipped", review_policy: "auto" });
const sealedPath = (app: string) => path.join(app, "dist-app", "rfx-mini-1.0.0.afpkg");

const submitStub = (reply: Reply) =>
  stub((r) =>
    r.method === "POST" && r.path === "/api/v1/app-catalog/submissions" ? reply : { status: 404, html: "nope" },
  );

describe("parseRelease", () => {
  it("splits at the last @", () => expect(parseRelease("acme/desk@1.2.0-rc.1")).toEqual({ package_id: "acme/desk", version: "1.2.0-rc.1" }));
  it("refuses a missing version", () => expect(() => parseRelease("acme/desk")).toThrow(/prefix\/slug@version/));
  it("refuses an empty version or id", () => {
    expect(() => parseRelease("acme/desk@")).toThrow(/prefix\/slug@version/);
    expect(() => parseRelease("@1.0.0")).toThrow(/prefix\/slug@version/);
  });
});

describe("agentflow-app publish", () => {
  const body = { submission: submission("approved"), entry: entry() };

  it("prints published and exits 0", async () => {
    const app = await sealedApp();
    const server = await submitStub({ status: 201, json: body });
    const out = await runCli(app, ["publish", "--file", sealedPath(app)], { env: envFor(server.url) });
    expect(out).toEqual({ code: 0, stdout: "published acme/desk 1.0.0\n", stderr: "" });
    const [seen] = server.seen;
    expect(seen!.headers.authorization).toBe(`Bearer ${TOKEN}`);
    expect(filePart(seen!, "package").equals(fs.readFileSync(sealedPath(app)))).toBe(true);
  });

  it("takes the file as a positional", async () => {
    const app = await sealedApp();
    const server = await submitStub({ status: 200, json: body });
    const out = await runCli(app, ["publish", sealedPath(app)], { env: envFor(server.url) });
    expect(out).toEqual({ code: 0, stdout: "published acme/desk 1.0.0\n", stderr: "" });
  });

  it("refuses the file given twice", async () => {
    const app = await sealedApp();
    const out = await runCli(app, ["publish", sealedPath(app), "--file", sealedPath(app)], { env: envFor("http://127.0.0.1:1") });
    expect(out.code).toBe(2);
  });

  it("prints the server's answer with --json", async () => {
    const app = await sealedApp();
    const server = await submitStub({ status: 201, json: body });
    const out = await runCli(app, ["publish", "--file", sealedPath(app), "--json"], { env: envFor(server.url) });
    expect(out.code).toBe(0);
    expect(JSON.parse(out.stdout)).toEqual(body);
  });

  it("says in review, naming the release from the manifest, when the review stage holds it", async () => {
    const app = await sealedApp();
    const server = await submitStub({ status: 201, json: { submission: submission("review"), entry: null } });
    const out = await runCli(app, ["publish", "--file", sealedPath(app)], { env: envFor(server.url) });
    expect(out).toEqual({ code: 0, stdout: "in review rfx/mini 1.0.0\n", stderr: "" });
  });

  it("prints rejected and exits 1", async () => {
    const app = await sealedApp();
    const server = await submitStub({
      status: 201,
      json: { submission: submission("rejected"), entry: null },
    });
    const out = await runCli(app, ["publish", "--file", sealedPath(app)], { env: envFor(server.url) });
    expect(out).toEqual({ code: 1, stdout: "rejected rfx/mini 1.0.0\n", stderr: "" });
  });

  it("says withdrawn and exits 1 when the bytes of a withdrawn version are resubmitted", async () => {
    const app = await sealedApp();
    const server = await submitStub({ status: 200, json: { submission: submission("approved"), entry: entry("withdrawn") } });
    const out = await runCli(app, ["publish", "--file", sealedPath(app)], { env: envFor(server.url) });
    expect(out).toEqual({
      code: 1,
      stdout: "withdrawn acme/desk 1.0.0\nthis version stays out of the catalog; publish a new version instead\n",
      stderr: "",
    });
  });

  it("refuses with the server's code", async () => {
    const app = await sealedApp();
    const problem = { type: "APP_CATALOG_PREFIX_HELD", detail: "another organization publishes under acme" };
    const server = await submitStub({ status: 409, problem });
    const out = await runCli(app, ["publish", "--file", sealedPath(app)], { env: envFor(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("APP_CATALOG_PREFIX_HELD: another organization publishes under acme");
    const json = await runCli(app, ["publish", "--file", sealedPath(app), "--json"], { env: envFor(server.url) });
    expect(json.code).toBe(1);
    expect(JSON.parse(json.stdout).error.code).toBe("APP_CATALOG_PREFIX_HELD");
  });

  it("needs AGENTFLOW_URL and AGENTFLOW_TOKEN", async () => {
    const app = await sealedApp();
    const out = await runCli(app, ["publish", "--file", sealedPath(app)], { env: {} });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("DEPLOY_NOT_CONFIGURED");
  });
});

describe("agentflow-app withdraw", () => {
  it("posts the release and the reason", async () => {
    const server = await stub((r) =>
      r.method === "POST" && r.path === "/api/v1/app-catalog/withdrawals"
        ? { status: 200, json: { entry: entry("withdrawn") } }
        : { status: 404, html: "nope" },
    );
    const out = await runCli(process.cwd(), ["withdraw", "acme/desk@1.0.0", "--reason", "broken"], { env: envFor(server.url) });
    expect(out).toEqual({ code: 0, stdout: "withdrawn acme/desk 1.0.0\n", stderr: "" });
    expect(JSON.parse(server.seen[0]!.body.toString("utf8"))).toEqual({ package_id: "acme/desk", version: "1.0.0", reason: "broken" });
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("needs a reason", async () => {
    const out = await runCli(process.cwd(), ["withdraw", "acme/desk@1.0.0"], { env: envFor("http://127.0.0.1:1") });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("USAGE");
  });

  it("needs a release", async () => {
    const out = await runCli(process.cwd(), ["withdraw", "--reason", "x"], { env: envFor("http://127.0.0.1:1") });
    expect(out.code).toBe(2);
  });

  it("refuses a non-publisher", async () => {
    const server = await stub(() => ({ status: 403, problem: { type: "APP_CATALOG_NOT_PUBLISHER", detail: "not yours" } }));
    const out = await runCli(process.cwd(), ["withdraw", "acme/desk@1.0.0", "--reason", "x"], { env: envFor(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("APP_CATALOG_NOT_PUBLISHER: not yours");
  });
});
