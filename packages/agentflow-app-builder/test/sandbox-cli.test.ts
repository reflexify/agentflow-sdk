import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { closeStubs, runCli, stub, type Reply, type Seen } from "./http-stub.js";
import { tempPathFor } from "../src/sandbox/state.js";
import { readState, updateState, writeState, stateFromCreated, type ChatSession, type SandboxState } from "../src/sandbox/state.js";
import { appDir, CREATED, DEPLOY, envWith, noSecrets, OWNER, PARENT, SANDBOX, SPEC, writeFixtureState } from "./sandbox-fixtures.js";

afterEach(closeStubs);

describe("sandbox check", () => {
  it("says a valid file is valid and calls nothing", async () => {
    expect(await runCli(appDir(), ["sandbox", "check"], { env: {} })).toEqual({ code: 0, stdout: "sandbox.json is valid\n", stderr: "" });
  });

  it("refuses an invalid file naming the member", async () => {
    const out = await runCli(appDir({ ...SPEC, owner: "ghost" }), ["sandbox", "check", "--json"], { env: {} });
    expect(out.code).toBe(1);
    expect(JSON.parse(out.stdout)).toEqual({
      error: { code: "SANDBOX_SPEC_INVALID", message: "sandbox.json: owner: `ghost` is not one of the people", files: ["sandbox.json"] },
    });
  });

  it("refuses a folder with no sandbox.json", async () => {
    const out = await runCli(appDir(undefined), ["sandbox", "check"], { env: {} });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_SPEC_MISSING: /);
  });

  it("needs a known action and refuses flags the action does not take", async () => {
    expect((await runCli(appDir(), ["sandbox"], { env: {} })).code).toBe(2);
    expect((await runCli(appDir(), ["sandbox", "rename"], { env: {} })).code).toBe(2);
    const out = await runCli(appDir(), ["sandbox", "check", "--as", "admin"], { env: {} });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("sandbox check takes no --as");
  });
});

describe("sandbox create", () => {
  it("sends sandbox.json with its secrets, writes the keys to a private state file and ignores it in git", async () => {
    const server = await stub((req: Seen) =>
      req.method === "POST" && req.path === "/api/v1/sandboxes" ? { status: 201, json: CREATED } : { status: 404, problem: { type: "NOT_FOUND" } });
    const spec = { ...SPEC, connections: [{ key: "mail", kind: "resend", secret_env: "MAIL_KEY", settings: { from: "a@example.com" } }] };
    const dir = appDir(spec);
    fs.writeFileSync(path.join(dir, ".gitignore"), "node_modules/\n");
    const out = await runCli(dir, ["sandbox", "create", "--ttl-days", "3"], { env: envWith(server.url, { MAIL_KEY: "re_mailSecret123" }) });
    expect(out.code).toBe(0);
    expect(out.stdout).toBe(
      `created sandbox app (${SANDBOX}), expires 2026-10-29T00:00:00Z\npeople: admin\nkeys written to .agentflow/sandbox.json\n`,
    );
    noSecrets(out, "re_mailSecret123");
    const sent = JSON.parse(server.seen[0]!.body.toString());
    expect(sent).toEqual({ name: path.basename(dir), ttl_days: 3, spec, secrets: { mail: "re_mailSecret123" } });
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    const file = path.join(dir, ".agentflow", "sandbox.json");
    expect(fs.statSync(file).mode & 0o777).toBe(0o600);
    expect(fs.statSync(path.dirname(file)).mode & 0o777).toBe(0o700);
    expect(fs.readdirSync(path.dirname(file))).toEqual(["sandbox.json"]);
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(state).toMatchObject({ version: 1, url: server.url, id: SANDBOX, deploy_key: DEPLOY, people: CREATED.people, installation: null });
    expect(state.url).not.toBe(CREATED.base_url);
    expect(fs.readFileSync(path.join(dir, ".gitignore"), "utf8")).toBe("node_modules/\n/.agentflow/\n");
  });

  it("prints the made sandbox without a key in --json", async () => {
    const server = await stub(() => ({ status: 201, json: CREATED }));
    const dir = appDir();
    const out = await runCli(dir, ["sandbox", "create", "--json", "--name", "desk"], { env: envWith(server.url) });
    expect(out.code).toBe(0);
    expect(JSON.parse(out.stdout)).toEqual({
      id: SANDBOX, name: "app", created_at: CREATED.created_at, expires_at: CREATED.expires_at, owner: "admin", people: ["admin"],
      state_file: ".agentflow/sandbox.json",
    });
    expect(JSON.parse(server.seen[0]!.body.toString()).name).toBe("desk");
    noSecrets(out);
  });

  it("creates the .gitignore, and leaves one that already ignores the folder alone", async () => {
    const server = await stub(() => ({ status: 201, json: CREATED }));
    const fresh = appDir();
    await runCli(fresh, ["sandbox", "create"], { env: envWith(server.url) });
    expect(fs.readFileSync(path.join(fresh, ".gitignore"), "utf8")).toBe("/.agentflow/\n");
    for (const line of [".agentflow/", "/.agentflow/", ".agentflow", "/.agentflow"]) {
      const dir = appDir();
      fs.writeFileSync(path.join(dir, ".gitignore"), `dist/\n${line}\n`);
      await runCli(dir, ["sandbox", "create"], { env: envWith(server.url) });
      expect(fs.readFileSync(path.join(dir, ".gitignore"), "utf8"), line).toBe(`dist/\n${line}\n`);
    }
    const bare = appDir();
    fs.writeFileSync(path.join(bare, ".gitignore"), "dist/");
    await runCli(bare, ["sandbox", "create"], { env: envWith(server.url) });
    expect(fs.readFileSync(path.join(bare, ".gitignore"), "utf8")).toBe("dist/\n/.agentflow/\n");
  });

  it("refuses a missing secret before any request, naming the variable", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const spec = { ...SPEC, connections: [{ key: "mail", kind: "resend", secret_env: "MAIL_KEY", settings: { from: "a@example.com" } }] };
    const out = await runCli(appDir(spec), ["sandbox", "create"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_SECRET_MISSING: MAIL_KEY is not set: connection mail sends with it/);
    expect(server.seen).toEqual([]);
  });

  it("refuses a time to live outside 1 to 30 days", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    for (const ttl of ["0", "31", "x", "1.5", ""]) {
      const out = await runCli(appDir(), ["sandbox", "create", "--ttl-days", ttl], { env: envWith(server.url) });
      expect(out.code, ttl).toBe(2);
      expect(out.stderr).toContain("--ttl-days");
    }
    expect(server.seen).toEqual([]);
  });

  it("refuses a repo that tracks .agentflow/", async () => {
    const dir = appDir();
    execFileSync("git", ["init", "-q"], { cwd: dir });
    fs.mkdirSync(path.join(dir, ".agentflow"));
    fs.writeFileSync(path.join(dir, ".agentflow", "note"), "x");
    execFileSync("git", ["add", ".agentflow/note"], { cwd: dir });
    const out = await runCli(dir, ["sandbox", "create"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_STATE_TRACKED: /);
  });

  it("refuses to overwrite a state file that names a sandbox that has not expired, and replaces an expired one", async () => {
    const server = await stub(() => ({ status: 201, json: CREATED }));
    const dir = appDir();
    writeFixtureState(dir, server.url, { ...CREATED, expires_at: new Date(Date.now() + 3_600_000).toISOString() });
    const refused = await runCli(dir, ["sandbox", "create"], { env: envWith(server.url) });
    expect(refused.code).toBe(2);
    expect(refused.stderr).toContain(
      `.agentflow/sandbox.json already names sandbox ${SANDBOX}: pnpm exec agentflow-app deploy --sandbox installs into it; to start over, run pnpm exec agentflow-app sandbox delete first, or pnpm exec agentflow-app deploy --sandbox --replace`,
    );
    expect(server.seen).toEqual([]);
    writeFixtureState(dir, server.url, { ...CREATED, id: "00000000-0000-4000-8000-000000000000", expires_at: "2020-01-01T00:00:00Z" });
    const replaced = await runCli(dir, ["sandbox", "create"], { env: envWith(server.url) });
    expect(replaced.code).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(dir, ".agentflow", "sandbox.json"), "utf8")).id).toBe(SANDBOX);
  });

  it("passes the server's refusal through with its code", async () => {
    const server = await stub(() => ({ status: 409, problem: { type: "SANDBOX_LIMIT_REACHED", detail: "this organization has 10 live sandboxes" } }));
    const dir = appDir();
    const out = await runCli(dir, ["sandbox", "create"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("SANDBOX_LIMIT_REACHED: this organization has 10 live sandboxes");
    expect(fs.existsSync(path.join(dir, ".agentflow"))).toBe(false);
  });

  it("records a created sandbox whose decisions the server echoes as anything", async () => {
    for (const decisions of [null, [], "x"]) {
      const server = await stub(() => ({ status: 201, json: { ...CREATED, install: { ...CREATED.install, decisions } } }));
      const dir = appDir();
      const out = await runCli(dir, ["sandbox", "create"], { env: envWith(server.url) });
      expect(out.code).toBe(0);
      expect(JSON.parse(fs.readFileSync(path.join(dir, ".agentflow", "sandbox.json"), "utf8")).install.decisions).toEqual(decisions);
    }
  });

  it("refuses an answer that is not a sandbox", async () => {
    const server = await stub(() => ({ status: 201, json: { id: SANDBOX } }));
    const out = await runCli(appDir(), ["sandbox", "create"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^DEPLOY_UNREACHABLE: /);
  });

  it("needs AGENTFLOW_SANDBOX_KEY, not AGENTFLOW_TOKEN", async () => {
    const out = await runCli(appDir(), ["sandbox", "create"], { env: { AGENTFLOW_URL: "http://127.0.0.1:9", AGENTFLOW_TOKEN: "afk_x" } });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^DEPLOY_NOT_CONFIGURED: AGENTFLOW_SANDBOX_KEY is not set/);
  });
});

describe("sandbox delete and list", () => {
  it("deletes the sandbox the state file names and removes the file", async () => {
    const server = await stub((req) => (req.method === "DELETE" ? { status: 204, html: "" } : { status: 404, problem: { type: "NOT_FOUND" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out).toEqual({ code: 0, stdout: `deleted sandbox ${SANDBOX}\n`, stderr: "" });
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    expect(fs.existsSync(path.join(dir, ".agentflow", "sandbox.json"))).toBe(false);
  });

  it("deletes another sandbox by --id and keeps the state file that names a different one", async () => {
    const server = await stub(() => ({ status: 204, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const other = "00000000-0000-4000-8000-000000000000";
    const out = await runCli(dir, ["sandbox", "delete", "--id", other, "--json"], { env: envWith(server.url) });
    expect(out.code).toBe(0);
    expect(JSON.parse(out.stdout)).toEqual({ id: other, deleted: true });
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${other}`);
    expect(fs.existsSync(path.join(dir, ".agentflow", "sandbox.json"))).toBe(true);
  });

  it("refuses an id that is not a uuid", async () => {
    const out = await runCli(appDir(), ["sandbox", "delete", "--id", "../x"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(2);
  });

  const gone = (caller: Reply) => (request: Seen): Reply =>
    request.path.endsWith("/caller")
      ? caller
      : { status: 404, problem: { type: "NOT_FOUND", detail: "no such sandbox" } };
  const stateFile = (dir: string) => path.join(dir, ".agentflow", "sandbox.json");

  it("removes the state file when the server has no such sandbox and its deploy key is refused", async () => {
    const server = await stub(gone({ status: 401, problem: { type: "UNAUTHENTICATED", detail: "unknown key" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("NOT_FOUND: no such sandbox");
    expect(out.stderr).toContain(`sandbox ${SANDBOX} is gone from ${server.url}; removed .agentflow/sandbox.json`);
    expect(fs.existsSync(stateFile(dir))).toBe(false);
    const probe = server.seen.find((seen) => seen.path.endsWith("/caller"));
    expect(probe?.headers.authorization).toBe(`Bearer ${DEPLOY}`);
  });

  it("keeps the state file when the sandbox's deploy key still works, naming the key as the cause", async () => {
    const server = await stub(gone({ status: 200, json: { id: "x", org_id: SANDBOX, kind: "service_principal", display_name: "d", email: null, app: null } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("NOT_FOUND: no such sandbox");
    expect(out.stderr).toContain(`sandbox ${SANDBOX} is still live; AGENTFLOW_SANDBOX_KEY belongs to an organization that does not own it`);
    expect(fs.existsSync(stateFile(dir))).toBe(true);
  });

  it("keeps the state file when the probe answers anything but 401", async () => {
    const server = await stub(gone({ status: 503, problem: { type: "UNAVAILABLE", detail: "busy" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(fs.existsSync(stateFile(dir))).toBe(true);
  });

  it("keeps the state file when sandboxes are off on the deployment", async () => {
    const server = await stub(() => ({ status: 404, problem: { type: "ROUTE_NOT_FOUND", detail: "no such route" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("ROUTE_NOT_FOUND");
    expect(fs.existsSync(stateFile(dir))).toBe(true);
    expect(server.seen.some((seen) => seen.path.endsWith("/caller"))).toBe(false);
  });

  it("keeps the state file when AGENTFLOW_URL is not the deployment that made the sandbox", async () => {
    const server = await stub(gone({ status: 401, problem: { type: "UNAUTHENTICATED", detail: "unknown key" } }));
    const dir = appDir();
    writeFixtureState(dir, "http://127.0.0.1:9");
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain(`.agentflow/sandbox.json names a sandbox made on http://127.0.0.1:9, not ${server.url}`);
    expect(fs.existsSync(stateFile(dir))).toBe(true);
    expect(server.seen.some((seen) => seen.path.endsWith("/caller"))).toBe(false);
  });

  it("keeps the state file when a page that is not AgentFlow answers 404", async () => {
    const server = await stub(() => ({ status: 404, html: "<h1>Not Found</h1>" }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(fs.existsSync(stateFile(dir))).toBe(true);
  });

  it("keeps the state file when --id names the sandbox and the server answers 404", async () => {
    const server = await stub(() => ({ status: 404, problem: { type: "NOT_FOUND", detail: "no such sandbox" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete", "--id", SANDBOX], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(fs.existsSync(path.join(dir, ".agentflow", "sandbox.json"))).toBe(true);
  });

  it("refuses with no state file and no --id", async () => {
    const out = await runCli(appDir(), ["sandbox", "delete"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_STATE_MISSING: /);
    expect(out.stderr).toContain("with pnpm exec agentflow-app deploy --sandbox (sandbox create makes one without the app)");
  });

  it("refuses a state file that is not version 1", async () => {
    const dir = appDir();
    fs.mkdirSync(path.join(dir, ".agentflow"), { mode: 0o700 });
    fs.writeFileSync(path.join(dir, ".agentflow", "sandbox.json"), JSON.stringify({ version: 2 }), { mode: 0o600 });
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_STATE_INVALID: /);
  });

  it("lists live sandboxes and marks this folder's", async () => {
    const server = await stub(() => ({ status: 200, json: { sandboxes: [{ id: SANDBOX, name: "app", created_at: "x", expires_at: "2026-10-29T00:00:00Z" }] } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "list"], { env: envWith(server.url) });
    expect(out).toEqual({ code: 0, stdout: `${SANDBOX}  app  expires 2026-10-29T00:00:00Z  (this folder)\n`, stderr: "" });
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
  });

  it("lists another folder's sandboxes unmarked, and says when there are none", async () => {
    let sandboxes: unknown[] = [{ id: SANDBOX, name: "app", created_at: "x", expires_at: "2026-10-29T00:00:00Z" }];
    const server = await stub(() => ({ status: 200, json: { sandboxes } }));
    const dir = appDir();
    expect((await runCli(dir, ["sandbox", "list"], { env: envWith(server.url) })).stdout).toBe(`${SANDBOX}  app  expires 2026-10-29T00:00:00Z\n`);
    sandboxes = [];
    expect(await runCli(dir, ["sandbox", "list"], { env: envWith(server.url) })).toEqual({ code: 0, stdout: "no live sandboxes\n", stderr: "" });
  });
});

describe("no secret is ever printed", () => {
  it("prints none in --json, on success or on a refusal", async () => {
    let refuse = false;
    const server = await stub(() => (refuse
      ? { status: 401, problem: { type: "INVALID_TOKEN", detail: `bad ${PARENT}` } }
      : { status: 201, json: CREATED }));
    const dir = appDir();
    noSecrets(await runCli(dir, ["sandbox", "create", "--json"], { env: envWith(server.url) }));
    refuse = true;
    const refused = await runCli(dir, ["sandbox", "delete", "--json"], { env: envWith(server.url) });
    expect(refused.code).toBe(1);
    noSecrets(refused);
  });

  it("hides a connection secret a server refusal echoes back", async () => {
    const server = await stub(() => ({ status: 422, problem: { type: "VALIDATION_ERROR", detail: "bad re_mailSecret123 in connection mail" } }));
    const spec = { ...SPEC, connections: [{ key: "mail", kind: "resend", secret_env: "MAIL_KEY", settings: { from: "a@example.com" } }] };
    const out = await runCli(appDir(spec), ["sandbox", "create"], { env: envWith(server.url, { MAIL_KEY: "re_mailSecret123" }) });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("VALIDATION_ERROR: bad [redacted] in connection mail");
    noSecrets(out, "re_mailSecret123");
  });

  it("hides the owner's token and the deploy key if a later answer echoes them", async () => {
    const server = await stub((req) =>
      req.method === "DELETE" ? { status: 404, problem: { type: "NOT_FOUND", detail: `${DEPLOY} ${OWNER}` } } : { status: 404, problem: { type: "NOT_FOUND" } });
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "delete"], { env: envWith(server.url) });
    noSecrets(out);
  });
});

describe("sandbox open", () => {
  const link = `http://127.0.0.1:1/api/v1/auth/sandbox-sign-in?code=${"c0de".repeat(11)}`;
  const answer = { status: 201, json: { url: link, expires_at: "2026-10-22T00:05:00Z" } };

  it("asks for a one-time link with the parent key and opens it without printing it", async () => {
    const server = await stub(() => answer);
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const opened: string[] = [];
    const out = await runCli(dir, ["sandbox", "open", "--as", "admin"], {
      env: envWith(server.url),
      openUrl: async (url) => void opened.push(url),
    });
    expect(out.code).toBe(0);
    expect(opened).toEqual([link]);
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/sign-in-links`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    expect(JSON.parse(server.seen[0]!.body.toString())).toEqual({ handle: "admin" });
    expect(out.stdout).toBe("opened a sign-in for admin in your browser (the link works once, until 2026-10-22T00:05:00Z)\n");
    noSecrets(out, link, "c0de".repeat(11));
  });

  it("prints the handle and expiry in --json, without the link", async () => {
    const server = await stub(() => answer);
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "open", "--as", "admin", "--json"], {
      env: envWith(server.url),
      openUrl: async () => {},
    });
    expect(out.code).toBe(0);
    expect(JSON.parse(out.stdout)).toEqual({ handle: "admin", expires_at: "2026-10-22T00:05:00Z" });
    noSecrets(out, link, "c0de".repeat(11));
  });

  it("refuses a handle that is not in the cast, before any request", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "open", "--as", "ghost"], { env: envWith(server.url) });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("ghost is not one of the sandbox's people: admin");
    expect(server.seen).toEqual([]);
  });

  it("needs --as", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "open"], { env: envWith(server.url) });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("sandbox open needs --as <handle>");
    expect(server.seen).toEqual([]);
  });

  it("needs a state file", async () => {
    const out = await runCli(appDir(), ["sandbox", "open", "--as", "admin"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_STATE_MISSING: /);
  });

  it("reports a browser that cannot start, without the link", async () => {
    const server = await stub(() => answer);
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "open", "--as", "admin"], {
      env: envWith(server.url),
      openUrl: async () => {
        throw new Error("spawn xdg-open ENOENT");
      },
    });
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^SANDBOX_OPEN_FAILED: /);
    expect(out.stderr).toContain("spawn xdg-open ENOENT");
    expect(out.stderr).toContain("expires unused in 5 minutes");
    noSecrets(out, link, "c0de".repeat(11));
  });

  it("hides the link even when the opener's own error repeats it", async () => {
    const server = await stub(() => answer);
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "open", "--as", "admin", "--json"], {
      env: envWith(server.url),
      openUrl: async (url) => {
        throw new Error(`spawn xdg-open ${url} ENOENT`);
      },
    });
    expect(out.code).toBe(1);
    expect(JSON.parse(out.stdout).error.code).toBe("SANDBOX_OPEN_FAILED");
    noSecrets(out, link, "c0de".repeat(11));
  });

  it("passes the server's refusal through", async () => {
    const server = await stub(() => ({ status: 409, problem: { type: "SANDBOX_NOT_LIVE", detail: "the sandbox is deleted" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url);
    const out = await runCli(dir, ["sandbox", "open", "--as", "admin"], { env: envWith(server.url), openUrl: async () => {} });
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("SANDBOX_NOT_LIVE: the sandbox is deleted");
  });
});

describe("secrets that need escaping, and empty ones", () => {
  it("hides a secret with a quote or backslash in --json, raw and escaped", async () => {
    const secret = 're_ma"il\\Sec\tret';
    const server = await stub(() => ({ status: 422, problem: { type: "VALIDATION_ERROR", detail: `bad ${secret} in connection mail` } }));
    const spec = { ...SPEC, connections: [{ key: "mail", kind: "resend", secret_env: "MAIL_KEY", settings: { from: "a@example.com" } }] };
    const out = await runCli(appDir(spec), ["sandbox", "create", "--json"], { env: envWith(server.url, { MAIL_KEY: secret }) });
    expect(out.code).toBe(1);
    expect(out.stdout).toContain("[redacted]");
    noSecrets(out, secret, JSON.stringify(secret).slice(1, -1));
  });

  it("does not fill the output with [redacted] when a person's token is empty", async () => {
    const dir = appDir();
    const created = { ...CREATED, people: { admin: { user_id: CREATED.people.admin.user_id, token: "" } } };
    const server = await stub(() => ({ status: 201, json: created }));
    const out = await runCli(dir, ["sandbox", "create"], { env: envWith(server.url) });
    expect(out.code).toBe(1);
    expect(out.stderr).not.toContain("[redacted]");
  });

  it("refuses a state file whose person has an empty token or whose deploy key is empty", async () => {
    for (const edit of [
      (state: Record<string, unknown>) => ({ ...state, people: { admin: { user_id: "u", token: "" } } }),
      (state: Record<string, unknown>) => ({ ...state, deploy_key: "" }),
    ]) {
      const dir = appDir();
      const state = stateFromCreated("http://127.0.0.1:9", CREATED);
      fs.mkdirSync(path.join(dir, ".agentflow"), { mode: 0o700 });
      fs.writeFileSync(path.join(dir, ".agentflow", "sandbox.json"), JSON.stringify(edit({ ...state })), { mode: 0o600 });
      const out = await runCli(dir, ["sandbox", "open", "--as", "admin"], { env: envWith("http://127.0.0.1:9") });
      expect(out.code).toBe(1);
      expect(out.stderr).toMatch(/^SANDBOX_STATE_INVALID: /);
      expect(out.stderr).not.toContain("[redacted]");
    }
  });
});

describe("sandbox mail-in and mail-out", () => {
  const MAIL = "3e1f0a2b-4c5d-4e6f-8a7b-9c0d1e2f3a4b";
  const WITH_MAIL = { ...CREATED, ids: { ...CREATED.ids, connections: { mail: MAIL } } };
  const MESSAGE = { from: "Ada <ada@example.test>", to: ["desk+t42@example.com"], subject: "Re: Your ticket", text: "Thanks" };
  const SENT = {
    outbound_id: "0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b", sent_at: "2026-11-10T00:00:00Z", to: "ada@example.test", extra_to: [],
    cc: [], subject: "Your ticket", text_body: "Body", html_body: "<p>Body</p>",
    message_id: "<0192a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b@example.com>", in_reply_to: null, references: null,
  };

  it("mail-in posts the file to the connection's inbound route", async () => {
    const server = await stub(() => ({ status: 200, json: { recorded: true, event_id: "0192a3b4-0000-7000-8000-000000000001" } }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_MAIL);
    fs.writeFileSync(path.join(dir, "reply.json"), JSON.stringify(MESSAGE));
    const out = await runCli(dir, ["sandbox", "mail-in", "--connection", "mail", "--file", "reply.json"], { env: envWith(server.url) });
    expect(out).toMatchObject({ code: 0, stdout: "recorded\n" });
    expect(server.seen[0]!.method).toBe("POST");
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/connections/${MAIL}/inbound`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    expect(JSON.parse(server.seen[0]!.body.toString())).toEqual(MESSAGE);

    const discarded = await stub(() => ({ status: 200, json: { recorded: false, reason: "auto_submitted" } }));
    writeFixtureState(dir, discarded.url, WITH_MAIL);
    const json = await runCli(dir, ["sandbox", "mail-in", "--connection", "mail", "--file", "reply.json"], { env: envWith(discarded.url) });
    expect(json).toMatchObject({ code: 0, stdout: "discarded (auto_submitted)\n" });
  });

  it("mail-in needs a connection of the sandbox and a JSON object in --file, before any request", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_MAIL);
    fs.writeFileSync(path.join(dir, "list.json"), "[]");
    fs.writeFileSync(path.join(dir, "reply.json"), JSON.stringify(MESSAGE));
    for (const [args, says] of [
      [["--connection", "inbox", "--file", "reply.json"], "inbox is not one of the sandbox's connections: mail"],
      [["--file", "list.json"], "sandbox mail-in needs --connection <key>"],
      [["--connection", "mail"], "sandbox mail-in needs --file <message.json>"],
      [["--connection", "mail", "--file", "missing.json"], "--file missing.json"],
      [["--connection", "mail", "--file", "list.json"], "--file list.json"],
    ] as const) {
      const out = await runCli(dir, ["sandbox", "mail-in", ...args], { env: envWith(server.url) });
      expect(out.code, args.join(" ")).toBe(2);
      expect(out.stderr).toContain(says);
    }
    expect(server.seen).toEqual([]);
  });

  it("mail-out lists the captured sends", async () => {
    const server = await stub(() => ({ status: 200, json: { sends: [SENT] } }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_MAIL);
    const out = await runCli(dir, ["sandbox", "mail-out", "--connection", "mail"], { env: envWith(server.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toBe(`${SENT.sent_at}  to ${SENT.to}  ${SENT.subject}  ${SENT.message_id}\n`);
    expect(server.seen[0]!.method).toBe("GET");
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/connections/${MAIL}/sent`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);

    const json = await runCli(dir, ["sandbox", "mail-out", "--connection", "mail", "--json"], { env: envWith(server.url) });
    expect(JSON.parse(json.stdout)).toEqual({ sends: [SENT] });

    const empty = await stub(() => ({ status: 200, json: { sends: [] } }));
    writeFixtureState(dir, empty.url, WITH_MAIL);
    const none = await runCli(dir, ["sandbox", "mail-out", "--connection", "mail"], { env: envWith(empty.url) });
    expect(none.stdout).toBe("nothing sent\n");
  });
});

describe("sandbox message-in", () => {
  const SMS = "4b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";
  const WITH_SMS = { ...CREATED, ids: { ...CREATED.ids, connections: { sms: SMS, mail: "3e1f0a2b-4c5d-4e6f-8a7b-9c0d1e2f3a4b" } } };
  const RECORDED = { event_id: "0192a3b4-0000-7000-8000-000000000001", thread_id: "0192a3b4-0000-7000-8000-000000000002" };

  it("posts the message to the connection's messages route, with each --file attached", async () => {
    const server = await stub(() => ({ status: 200, json: RECORDED }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_SMS);
    const out = await runCli(dir, ["sandbox", "message-in", "--connection", "sms", "--from", "+15550001", "--text", "hi"], { env: envWith(server.url) });
    expect(out).toMatchObject({ code: 0, stdout: `recorded ${RECORDED.event_id} on thread ${RECORDED.thread_id}\n` });
    expect(server.seen[0]!.method).toBe("POST");
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/connections/${SMS}/messages`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    expect(JSON.parse(server.seen[0]!.body.toString())).toEqual({ from: "+15550001", text: "hi" });

    fs.writeFileSync(path.join(dir, "invoice.pdf"), "%PDF-1.4");
    fs.writeFileSync(path.join(dir, "notes"), "plain");
    const json = await runCli(
      dir,
      [
        "sandbox", "message-in", "--connection", "sms", "--from", "+15550001", "--thread-key", "order-17", "--verified-email", "bob@example.com",
        "--verified-phone", "+15550001", "--file", "invoice.pdf", "--file", "notes", "--json",
      ],
      { env: envWith(server.url) },
    );
    expect(json.code).toBe(0);
    expect(JSON.parse(json.stdout)).toEqual(RECORDED);
    expect(JSON.parse(server.seen[1]!.body.toString())).toEqual({
      from: "+15550001",
      thread_key: "order-17",
      verified_email: "bob@example.com",
      verified_phone: "+15550001",
      attachments: [
        { filename: "invoice.pdf", content_type: "application/pdf", content_base64: Buffer.from("%PDF-1.4").toString("base64") },
        { filename: "notes", content_type: "application/octet-stream", content_base64: Buffer.from("plain").toString("base64") },
      ],
    });
  });

  it("refuses a message it cannot send before any request", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_SMS);
    fs.writeFileSync(path.join(dir, "big.bin"), Buffer.alloc(5 * 1024 * 1024 + 1));
    // Sized but never read: the cap is judged on every file's size before any file is opened. A directory has a size and
    // cannot be read by any user, root included, where a file with no read permission is readable by root.
    fs.mkdirSync(path.join(dir, "unreadable"));
    const base = ["--connection", "sms", "--from", "+15550001"];
    for (const [args, says] of [
      [["--from", "+15550001", "--text", "hi"], "sandbox message-in needs --connection <key>"],
      [["--connection", "inbox", "--from", "+15550001", "--text", "hi"], "inbox is not one of the sandbox's connections: sms, mail"],
      [["--connection", "sms", "--text", "hi"], "sandbox message-in needs --from <sender>"],
      [base, "sandbox message-in needs --text <text>, a --file, or both"],
      [[...base, "--text", "hi", "--thread-key", " "], "--thread-key must not be blank"],
      [[...base, "--file", "missing.pdf"], "--file missing.pdf cannot be read"],
      [[...base, "--file", "big.bin"], "add up to more than 5 MiB"],
      [[...base, "--file", "unreadable", "--file", "big.bin"], "add up to more than 5 MiB"],
      // AgentFlow's limit on the request that carries a message: 5 MiB of files as base64, and a megabyte more.
      [[...base, "--text", "x".repeat(8_039_084)], "--text is too long: the message would be more than 8039084 bytes"],
      [[...base, "--text", "hi", "--stream", "vendor"], "sandbox message-in takes no --stream"],
    ] as const) {
      const out = await runCli(dir, ["sandbox", "message-in", ...args], { env: envWith(server.url) });
      expect(out.code, args.join(" ")).toBe(2);
      expect(out.stderr).toContain(says);
    }
    // With no state the CLI cannot tell a chat from a loopback, so it names the state, not a flag one of them refuses.
    const none = await runCli(appDir(), ["sandbox", "message-in", "--connection", "site_chat", "--verified-email", "ada@example.com", "--text", "hi"], { env: envWith(server.url) });
    expect(none.stderr).toContain("SANDBOX_STATE_MISSING");
    expect(server.seen).toEqual([]);
  });

  it("message-out lists what Message steps sent on the connection", async () => {
    const REPLY = {
      outbound_id: "0192a3b4-0000-7000-8000-000000000003", sent_at: "2026-11-19T00:00:00Z", thread_id: RECORDED.thread_id,
      channel: "sms", to: null, text: "Thanks,\nwe are on it", attachment_ids: [], instance_id: "0192a3b4-0000-7000-8000-000000000004",
    };
    const FIRST = { ...REPLY, outbound_id: "0192a3b4-0000-7000-8000-000000000005", to: { kind: "phone", value: "+15550001" }, text: "Hello" };
    const server = await stub(() => ({ status: 200, json: { sends: [REPLY, FIRST] } }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_SMS);
    const out = await runCli(dir, ["sandbox", "message-out", "--connection", "sms"], { env: envWith(server.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toBe(
      `${REPLY.sent_at}  thread ${REPLY.thread_id}  Thanks, we are on it\n${FIRST.sent_at}  thread ${FIRST.thread_id}  to +15550001  Hello\n`,
    );
    expect(server.seen[0]!.method).toBe("GET");
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/connections/${SMS}/messages-out`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);

    const json = await runCli(dir, ["sandbox", "message-out", "--connection", "sms", "--json"], { env: envWith(server.url) });
    expect(JSON.parse(json.stdout)).toEqual({ sends: [REPLY, FIRST] });

    const empty = await stub(() => ({ status: 200, json: { sends: [] } }));
    writeFixtureState(dir, empty.url, WITH_SMS);
    const none = await runCli(dir, ["sandbox", "message-out", "--connection", "sms"], { env: envWith(empty.url) });
    expect(none.stdout).toBe("nothing sent\n");
    const missing = await runCli(dir, ["sandbox", "message-out"], { env: envWith(empty.url) });
    expect(missing.code).toBe(2);
    expect(missing.stderr).toContain("sandbox message-out needs --connection <key>");
  });

  it("leaves the other actions one --file, and lists message-in with its flags in --help", async () => {
    const dir = appDir();
    writeFixtureState(dir, "http://127.0.0.1:9", WITH_SMS);
    const out = await runCli(dir, ["sandbox", "mail-in", "--connection", "mail", "--file", "a.json", "--file", "b.json"], { env: envWith("http://127.0.0.1:9") });
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("sandbox mail-in takes one --file");
    const help = await runCli(dir, ["sandbox", "--help"], { env: {} });
    expect(help.stdout).toContain("sandbox message-in --connection <key> --from <sender> [--thread-key <key>] [--text <text>] [--verified-email <address>]");
    expect(help.stdout).toContain("[--verified-phone <number>] [--file <path>]...");
    expect(help.stdout).toContain("sandbox message-in --connection <key> --text <text> [--thread-key <key>] [--verified-email <address>]");
    expect(help.stdout).toContain("sandbox message-out --connection <key> [--thread-key <key>] [--follow]");
  });
});

describe("sandbox message-in and message-out on a chat connection", () => {
  const PUBLIC_KEY = "pub_siteChatPublicKey";
  const ORIGIN = "https://shop.example.com";
  const SECRET = "siteIdentitySecret_0123456789abcdefghijklmn";
  const NOW = Date.parse("2026-11-22T00:00:00Z");
  const LATER = "2026-11-23T00:00:00Z";
  const OPENED = `afv_${"openedTok9".repeat(4)}abc`;
  const STORED = `afv_${"storedTok9".repeat(4)}abc`;
  const ORDER = `afv_${"orderTok99".repeat(4)}abc`;
  const ENDED = `afv_${"endedTok99".repeat(4)}abc`;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const WITH_CHAT = {
    ...CREATED,
    ids: { ...CREATED.ids, connections: { site_chat: "2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f", plain_chat: "3d4e5f6a-7b8c-4d9e-8f0a-1b2c3d4e5f6a", sms: "4b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e" } },
    chat: {
      site_chat: { public_key: PUBLIC_KEY, identity_secret: SECRET, origins: [ORIGIN, "http://localhost:5173"] },
      plain_chat: { public_key: "pub_plainChatPublicKey", origins: [ORIGIN] },
    },
  };
  const base = `/api/v1/chat/${PUBLIC_KEY}`;
  const row = (position: number, author = "visitor", text = `message ${position}`, display: string | null = null) => ({
    position, author, author_display: display, text, client_message_id: null, created_at: `2026-11-22T00:00:${String(position % 60).padStart(2, "0")}Z`,
  });
  const LOGS: Record<string, ReturnType<typeof row>[]> = {
    [STORED]: Array.from({ length: 101 }, (_, i) => row(i + 1)),
    [ORDER]: [row(3, "agent", "We open\nat 9.", "Lan")],
  };
  const answer = (req: Seen): Reply => {
    const token = req.headers.authorization?.replace(/^Bearer /, "") ?? "";
    if (req.method === "POST" && req.path === `${base}/sessions`) return { status: 201, json: { token: OPENED, expires_at: LATER } };
    if (req.method === "POST" && req.path === `${base}/session/identity`) return { status: 204, html: "" };
    if (req.method === "POST" && req.path === `${base}/messages`) {
      if (token === ENDED) return { status: 409, problem: { type: "MESSAGE_THREAD_CLOSED", detail: "this chat has ended; start a new chat to keep writing" } };
      if (JSON.parse(req.body.toString()).text === "refused") return { status: 422, problem: { type: "VALIDATION_ERROR", detail: "no" } };
      return { status: 200, json: { position: 7 } };
    }
    if (req.method === "GET" && req.path.startsWith(`${base}/messages?`)) {
      if (token === ENDED) return { status: 401, problem: { type: "CHAT_SESSION_INVALID", detail: "this chat session is not valid" } };
      const query = new URL(req.path, "http://stub").searchParams;
      const after = Number(query.get("after"));
      return { status: 200, json: { messages: (LOGS[token] ?? []).filter((m) => m.position > after).slice(0, Number(query.get("limit"))) } };
    }
    return { status: 404, html: "" };
  };
  const posted = (text = "Hi") => ({ text, client_message_id: expect.stringMatching(UUID) });
  const opened = (session: Partial<ChatSession> = {}): ChatSession => ({ token: OPENED, expires_at: LATER, ...session });
  const logLine = (m: ReturnType<typeof row>, thread: string) =>
    `${m.created_at}  thread ${thread}  ${m.author}${m.author_display ? ` (${m.author_display})` : ""}  ${m.text.replace(/\s+/g, " ")}`;
  const FROM_ADDRESS = "a chat visitor has no sender address: leave out --from, and prove an email with --verified-email";

  type Sent = { method: string; path: string; token?: string; body?: unknown };
  const rows: {
    name: string;
    args: string[];
    before?: Record<string, ChatSession>;
    code?: number;
    stdout?: string;
    stderr?: string;
    sent: Sent[];
    after?: Record<string, ChatSession>;
    signedFor?: string;
  }[] = [
    {
      name: "a first message opens a chat from the first origin, records it, then posts",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi"],
      stdout: "posted at position 7 on chat thread default\n",
      sent: [
        { method: "POST", path: `${base}/sessions`, body: {} },
        { method: "POST", path: `${base}/messages`, token: OPENED, body: posted() },
      ],
      after: { default: opened() },
    },
    {
      name: "a thread key with a chat posts on it",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--thread-key", "order-17", "--json"],
      before: { "order-17": { token: ORDER, expires_at: LATER } },
      stdout: `${JSON.stringify({ thread_key: "order-17", position: 7, session: "reused" })}\n`,
      sent: [{ method: "POST", path: `${base}/messages`, token: ORDER, body: posted() }],
      after: { "order-17": { token: ORDER, expires_at: LATER } },
    },
    {
      name: "a chat whose time is up is not used: a new one opens",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi"],
      before: { default: { token: STORED, expires_at: "2026-11-21T00:00:00Z" } },
      stdout: "posted at position 7 on chat thread default\n",
      stderr: "the chat on thread default had ended; opened a new one\n",
      sent: [
        { method: "POST", path: `${base}/sessions`, body: {} },
        { method: "POST", path: `${base}/messages`, token: OPENED, body: posted() },
      ],
      after: { default: opened() },
    },
    {
      name: "--verified-email opens the chat with a token the identity secret signs",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--verified-email", "bob@example.com"],
      stdout: "posted at position 7 on chat thread default\n",
      sent: [
        { method: "POST", path: `${base}/sessions`, body: { identity_token: expect.any(String) } },
        { method: "POST", path: `${base}/messages`, token: OPENED, body: posted() },
      ],
      after: { default: opened({ verified_email: "bob@example.com" }) },
      signedFor: "bob@example.com",
    },
    {
      name: "--verified-email on a chat that has not proved it sets the identity first",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--verified-email", "bob@example.com"],
      before: { default: { token: STORED, expires_at: LATER } },
      stdout: "posted at position 7 on chat thread default\n",
      sent: [
        { method: "POST", path: `${base}/session/identity`, token: STORED, body: { identity_token: expect.any(String) } },
        { method: "POST", path: `${base}/messages`, token: STORED, body: posted() },
      ],
      after: { default: { token: STORED, expires_at: LATER, verified_email: "bob@example.com" } },
      signedFor: "bob@example.com",
    },
    {
      name: "a chat that ended is opened anew once, and said so",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--json"],
      before: { default: { token: ENDED, expires_at: LATER } },
      stdout: `${JSON.stringify({ thread_key: "default", position: 7, session: "opened" })}\n`,
      stderr: "the chat on thread default had ended; opened a new one\n",
      sent: [
        { method: "POST", path: `${base}/messages`, token: ENDED, body: posted() },
        { method: "POST", path: `${base}/sessions`, body: {} },
        { method: "POST", path: `${base}/messages`, token: OPENED, body: posted() },
      ],
      after: { default: opened() },
    },
    {
      name: "the chat is recorded before its message, so a refused message keeps it",
      args: ["message-in", "--connection", "site_chat", "--text", "refused"],
      code: 1,
      sent: [
        { method: "POST", path: `${base}/sessions`, body: {} },
        { method: "POST", path: `${base}/messages`, token: OPENED, body: posted("refused") },
      ],
      after: { default: opened() },
    },
    {
      name: "--file is refused",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--file", "a.pdf"],
      code: 2,
      stderr: "a chat visitor writes text only, so a chat connection takes no --file",
      sent: [],
    },
    {
      name: "--verified-phone is refused",
      args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--verified-phone", "+84900000000"],
      code: 2,
      stderr: "a chat visitor proves an email, not a phone, so a chat connection takes no --verified-phone",
      sent: [],
    },
    { name: "--from is refused", args: ["message-in", "--connection", "site_chat", "--text", "Hi", "--from", "bob"], code: 2, stderr: FROM_ADDRESS, sent: [] },
    {
      name: "a blank text is refused",
      args: ["message-in", "--connection", "site_chat", "--text", " "],
      code: 2,
      stderr: "sandbox message-in needs --text <text> on a chat connection",
      sent: [],
    },
    {
      name: "--verified-email is refused on a chat with no site verification",
      args: ["message-in", "--connection", "plain_chat", "--text", "Hi", "--verified-email", "bob@example.com"],
      code: 2,
      stderr: 'plain_chat does not offer site verification, so --verified-email cannot be signed: add "site" to its settings.verify_methods in sandbox.json and make the sandbox again',
      sent: [],
    },
    {
      name: "message-out prints every chat's log, a page of 100 at a time",
      args: ["message-out", "--connection", "site_chat"],
      before: { default: { token: STORED, expires_at: LATER }, "order-17": { token: ORDER, expires_at: LATER } },
      stdout: [...LOGS[STORED]!.map((m) => logLine(m, "default")), "2026-11-22T00:00:03Z  thread order-17  agent (Lan)  We open at 9."].join("\n") + "\n",
      sent: [
        { method: "GET", path: `${base}/messages?after=0&limit=100`, token: STORED },
        { method: "GET", path: `${base}/messages?after=100&limit=100`, token: STORED },
        { method: "GET", path: `${base}/messages?after=0&limit=100`, token: ORDER },
      ],
      after: { default: { token: STORED, expires_at: LATER }, "order-17": { token: ORDER, expires_at: LATER } },
    },
    {
      name: "message-out reports a thread whose chat has ended on its own line and prints the others",
      args: ["message-out", "--connection", "site_chat"],
      before: { gone: { token: ENDED, expires_at: LATER }, "order-17": { token: ORDER, expires_at: LATER } },
      stdout: [
        "thread gone: its chat has ended, so its log cannot be read (CHAT_SESSION_INVALID); message-in on it opens a new one",
        "2026-11-22T00:00:03Z  thread order-17  agent (Lan)  We open at 9.",
      ].join("\n") + "\n",
      sent: [
        { method: "GET", path: `${base}/messages?after=0&limit=100`, token: ENDED },
        { method: "GET", path: `${base}/messages?after=0&limit=100`, token: ORDER },
      ],
    },
    {
      name: "message-out --thread-key prints that chat alone, in --json with its thread",
      args: ["message-out", "--connection", "site_chat", "--thread-key", "order-17", "--json"],
      before: { default: { token: STORED, expires_at: LATER }, "order-17": { token: ORDER, expires_at: LATER } },
      stdout: `${JSON.stringify({ messages: [{ thread_key: "order-17", ...LOGS[ORDER]![0] }] })}\n`,
      sent: [{ method: "GET", path: `${base}/messages?after=0&limit=100`, token: ORDER }],
      after: { default: { token: STORED, expires_at: LATER }, "order-17": { token: ORDER, expires_at: LATER } },
    },
    {
      name: "message-out before any chat says how to start one",
      args: ["message-out", "--connection", "site_chat"],
      stdout: "no chat on site_chat yet: run sandbox message-in --connection site_chat first\n",
      sent: [],
    },
    {
      name: "--follow is refused on a connection that is not chat",
      args: ["message-out", "--connection", "sms", "--follow"],
      code: 2,
      stderr: "sms is not a chat connection, and only a chat thread has a live stream for --follow to print",
      sent: [],
    },
    {
      name: "--thread-key on message-out is refused on a connection that is not chat",
      args: ["message-out", "--connection", "sms", "--thread-key", "order-17"],
      code: 2,
      stderr: "sms is not a chat connection, and --thread-key names a chat thread: message-out on sms lists every thread",
      sent: [],
    },
  ];

  it.each(rows.map((r) => [r.name, r] as const))("%s", async (_name, r) => {
    const server = await stub(answer);
    const dir = appDir();
    writeState(dir, { ...stateFromCreated(server.url, WITH_CHAT), ...(r.before ? { chat_sessions: { site_chat: r.before } } : {}) });
    const out = await runCli(dir, ["sandbox", ...r.args], { env: envWith(server.url), now: () => NOW });
    expect(out.code, out.stderr).toBe(r.code ?? 0);
    if (r.stdout !== undefined) expect(out.stdout).toBe(r.stdout);
    if (r.stderr !== undefined) expect(out.stderr).toContain(r.stderr);
    expect(
      server.seen.map((seen) => ({
        method: seen.method,
        path: seen.path,
        ...(seen.headers.authorization === undefined ? {} : { token: seen.headers.authorization.replace(/^Bearer /, "") }),
        ...(seen.body.length ? { body: JSON.parse(seen.body.toString()) } : {}),
      })),
    ).toEqual(r.sent);
    for (const seen of server.seen) expect(seen.headers.origin).toBe(ORIGIN);
    const state = JSON.parse(fs.readFileSync(path.join(dir, ".agentflow", "sandbox.json"), "utf8"));
    expect(state.chat_sessions?.site_chat).toEqual(r.after ?? r.before);
    noSecrets(out, SECRET, OPENED, STORED, ORDER, ENDED);
    if (r.signedFor) {
      const token = server.seen.map((seen) => JSON.parse(seen.body.toString() || "{}").identity_token).find(Boolean) as string;
      const [header, claims, signature] = token.split(".");
      expect(createHmac("sha256", SECRET).update(`${header}.${claims}`).digest("base64url")).toBe(signature);
      expect(JSON.parse(Buffer.from(header!, "base64url").toString())).toEqual({ alg: "HS256", typ: "JWT" });
      expect(JSON.parse(Buffer.from(claims!, "base64url").toString())).toEqual({ sub: r.signedFor, email: r.signedFor, exp: NOW / 1000 + 300 });
    }
  });

  it("--follow prints the thread's stream as it comes, until the chat closes", async () => {
    const message = { ...row(1, "visitor", `my key is ${ORDER} and ${SECRET}`), position: 1 };
    const events = [
      ": keep-alive\n\n",
      `id: 1\nevent: message\ndata: ${JSON.stringify(message)}\n\n`,
      "event: typ",
      'ing\ndata: {"until":"2026-11-22T00:00:30Z"}\n\n',
      'event: typing\ndata: {"until":null}\n\n',
      "event: verify.requested\ndata: {}\n\n",
      'event: closed\ndata: {"reason":"thread_closed"}\n\n',
      `event: message\ndata: ${JSON.stringify({ ...message, position: 2 })}\n\n`,
    ];
    const server = await stub(() => ({ status: 200, events }));
    const dir = appDir();
    writeState(dir, { ...stateFromCreated(server.url, WITH_CHAT), chat_sessions: { site_chat: { "order-17": { token: ORDER, expires_at: LATER } } } });
    const follow = ["sandbox", "message-out", "--connection", "site_chat", "--thread-key", "order-17", "--follow"];
    const out = await runCli(dir, follow, { env: envWith(server.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toBe(
      [
        "2026-11-22T00:00:01Z  thread order-17  visitor  my key is [redacted] and [redacted]",
        "typing until 2026-11-22T00:00:30Z",
        "typing stopped",
        "verify.requested  {}",
        "closed (thread_closed)",
      ].join("\n") + "\n",
    );
    expect(server.seen[0]).toMatchObject({ method: "GET", path: `${base}/stream` });
    expect(server.seen[0]!.headers).toMatchObject({ authorization: `Bearer ${ORDER}`, origin: ORIGIN, accept: "text/event-stream" });

    const json = await runCli(dir, [...follow, "--json"], { env: envWith(server.url) });
    expect(json.stdout.trimEnd().split("\n").map((line) => JSON.parse(line))).toEqual([
      { event: "message", data: { ...message, text: "my key is [redacted] and [redacted]" } },
      { event: "typing", data: { until: "2026-11-22T00:00:30Z" } },
      { event: "typing", data: { until: null } },
      { event: "verify.requested", data: {} },
      { event: "closed", data: { reason: "thread_closed" } },
    ]);

    const none = await runCli(dir, ["sandbox", "message-out", "--connection", "site_chat", "--follow"], { env: envWith(server.url) });
    expect(none.code).toBe(2);
    expect(none.stderr).toContain("no chat on site_chat yet: run sandbox message-in --connection site_chat first");
    expect(server.seen).toHaveLength(2);
  });

  const say = (position: number) => `id: ${position}\nevent: message\ndata: ${JSON.stringify(row(position))}\n\n`;
  const followOrder = ["sandbox", "message-out", "--connection", "site_chat", "--thread-key", "order-17", "--follow"];
  const followingOrder = (url: string) => {
    const dir = appDir();
    writeState(dir, { ...stateFromCreated(url, WITH_CHAT), chat_sessions: { site_chat: { "order-17": { token: ORDER, expires_at: LATER } } } });
    return dir;
  };

  it("--follow carries on after the last message it printed when the stream drops, and prints nothing twice", async () => {
    const replies: Reply[] = [
      { status: 200, events: [say(1), say(2)] },
      { hangUp: true },
      { status: 200, events: ['event: typing\ndata: {"until":null}\n\n', say(3)], cut: true },
      { status: 200, events: [say(4), 'event: closed\ndata: {"reason":"thread_closed"}\n\n'] },
    ];
    const server = await stub(() => replies.shift()!);
    const out = await runCli(followingOrder(server.url), followOrder, { env: envWith(server.url), sleep: async () => {} });
    expect(out.code, out.stderr).toBe(0);
    const [one, two, three, four] = [1, 2, 3, 4].map((p) => logLine(row(p), "order-17"));
    expect(out.stdout).toBe([one, two, "typing stopped", three, four, "closed (thread_closed)"].join("\n") + "\n");
    expect(server.seen.map((seen) => seen.headers["last-event-id"])).toEqual([undefined, "2", "2", "3"]);
  });

  it("--follow exits 1 and says so when the stream does not come back", async () => {
    const replies: Reply[] = [{ status: 200, events: [say(1)] }];
    const server = await stub(() => replies.shift() ?? { hangUp: true });
    let clock = NOW;
    const out = await runCli(followingOrder(server.url), followOrder, {
      env: envWith(server.url),
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
    });
    expect(out.code).toBe(1);
    expect(out.stdout).toBe(`${logLine(row(1), "order-17")}\n`);
    expect(out.stderr).toContain(
      "the stream of chat thread order-17 on site_chat dropped after position 1 and did not come back within 30 s: check that AgentFlow is up, then run message-out --follow again",
    );
    expect(server.seen.length).toBeGreaterThan(3);
    expect(server.seen.length).toBeLessThan(20);
  });

  it("message-in calls that run at once each keep their thread's chat", async () => {
    const server = await stub(answer);
    const dir = appDir();
    writeState(dir, stateFromCreated(server.url, WITH_CHAT));
    const keys = ["a", "b", "c", "d", "e", "f"];
    const outs = await Promise.all(
      keys.map((key) => runCli(dir, ["sandbox", "message-in", "--connection", "site_chat", "--thread-key", key, "--text", "Hi"], { env: envWith(server.url), now: () => NOW })),
    );
    expect(outs.map((out) => out.code)).toEqual(keys.map(() => 0));
    const state = JSON.parse(fs.readFileSync(path.join(dir, ".agentflow", "sandbox.json"), "utf8"));
    expect(Object.keys(state.chat_sessions.site_chat).sort()).toEqual(keys);
  });
});

describe("sandbox records-in, records-out, record-status and record-remove", () => {
  const ERP = "6a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
  const WITH_ERP = { ...CREATED, ids: { ...CREATED.ids, connections: { erp: ERP } } };
  const ORDER = { erp_id: "PO-17", company_erp_id: "C-1", source_changed_at: "2026-11-11T08:00:00Z", number: "PO00017" };
  const VENDOR = { erp_id: "V-1", source_changed_at: "2026-11-11T07:00:00Z", name: "Thép Việt" };
  const answering = (recorded: (body: { records: unknown[] }) => number) =>
    stub((request) => {
      const body = JSON.parse(request.body.toString());
      return { status: 200, json: { recorded: recorded(body), event_ids: [] } };
    });

  it("records-in keys and stamps bare records from their own members, and wraps them with --stream", async () => {
    const server = await answering((body) => body.records.length);
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_ERP);
    const gone = { key: ["C-1", "PO-9"], stamp: "2026-11-11T09:00:00Z", deleted: true };
    const restamped = { stamp: "2026-11-11T10:00:00Z", record: VENDOR };
    fs.writeFileSync(path.join(dir, "orders.json"), JSON.stringify([ORDER, gone]));
    const out = await runCli(dir, ["sandbox", "records-in", "--connection", "erp", "--stream", "purchase_order", "--file", "orders.json"], { env: envWith(server.url) });
    expect(out).toMatchObject({ code: 0, stdout: "records 1-2: recorded 2, 0 already there\n" });
    expect(server.seen[0]!.method).toBe("POST");
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/connections/${ERP}/records`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    expect(JSON.parse(server.seen[0]!.body.toString())).toEqual({
      stream: "purchase_order",
      records: [{ key: ["C-1", "PO-17"], stamp: ORDER.source_changed_at, record: ORDER }, gone],
    });

    // The request body itself, with a record of no company and one stamped apart from its record.
    fs.writeFileSync(path.join(dir, "vendors.json"), JSON.stringify({ stream: "vendor", records: [VENDOR, restamped] }));
    const again = await runCli(dir, ["sandbox", "records-in", "--connection", "erp", "--file", "vendors.json", "--json"], { env: envWith(server.url) });
    expect(again.code).toBe(0);
    expect(JSON.parse(server.seen[1]!.body.toString()).records).toEqual([
      { key: ["", "V-1"], stamp: VENDOR.source_changed_at, record: VENDOR },
      { key: ["", "V-1"], stamp: restamped.stamp, record: VENDOR },
    ]);
    expect(JSON.parse(again.stdout)).toMatchObject({ stream: "vendor", sent: 2, recorded: 2 });
  });

  it("records-in sends at most 500 records and under the API's body limit in one request, and says what was already there", async () => {
    const server = await answering((body) => (body.records.length === 500 ? 499 : body.records.length));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_ERP);
    const many = Array.from({ length: 501 }, (_, i) => ({ ...VENDOR, erp_id: `V-${i}` }));
    fs.writeFileSync(path.join(dir, "many.json"), JSON.stringify(many));
    const out = await runCli(dir, ["sandbox", "records-in", "--connection", "erp", "--stream", "vendor", "--file", "many.json"], { env: envWith(server.url) });
    expect(out.code).toBe(0);
    expect(out.stdout).toBe("records 1-500: recorded 499, 1 already there\nrecords 501-501: recorded 1, 0 already there\n");
    expect(server.seen.map((r) => JSON.parse(r.body.toString()).records.length)).toEqual([500, 1]);

    const big = await answering((body) => body.records.length);
    writeFixtureState(dir, big.url, WITH_ERP);
    const padded = Array.from({ length: 5 }, (_, i) => ({ ...VENDOR, erp_id: `V-${i}`, name: "x".repeat(700 * 1024) }));
    fs.writeFileSync(path.join(dir, "big.json"), JSON.stringify(padded));
    expect((await runCli(dir, ["sandbox", "records-in", "--connection", "erp", "--stream", "vendor", "--file", "big.json"], { env: envWith(big.url) })).code).toBe(0);
    const sizes = big.seen.map((r) => r.body.length);
    expect(sizes.length).toBe(3);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(2 * 1024 * 1024);
    expect(big.seen.flatMap((r) => JSON.parse(r.body.toString()).records.map((x: { key: string[] }) => x.key[1]))).toEqual(
      ["V-0", "V-1", "V-2", "V-3", "V-4"],
    );
  });

  it("records-in refuses, before any request, what it cannot send", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_ERP);
    const write = (name: string, body: unknown) => fs.writeFileSync(path.join(dir, name), JSON.stringify(body));
    write("orders.json", [ORDER]);
    write("unstamped.json", [{ erp_id: "PO-1", company_erp_id: "C-1" }]);
    write("tombstone.json", [{ deleted: true, stamp: "2026-11-11T09:00:00Z" }]);
    write("stream.json", { stream: "vendor", records: [VENDOR] });
    write("huge.json", [{ ...VENDOR, name: "x".repeat(2 * 1024 * 1024) }]);
    for (const [args, says] of [
      [["--stream", "purchase_order", "--file", "orders.json"], "sandbox records-in needs --connection <key>"],
      [["--connection", "erp", "--file", "orders.json"], "sandbox records-in needs --stream <stream>"],
      [["--connection", "erp", "--stream", "sales_order", "--file", "orders.json"], "sales_order is not a stream of a sandbox ERP connection"],
      [["--connection", "erp", "--stream", "purchase_order", "--file", "stream.json"], "--stream purchase_order and the file's stream vendor differ"],
      [["--connection", "erp", "--stream", "purchase_order", "--file", "unstamped.json"], "records[0] has no stamp, and its record no source_changed_at"],
      [["--connection", "erp", "--stream", "purchase_order", "--file", "tombstone.json"], "records[0] has no key"],
      [["--connection", "erp", "--stream", "vendor", "--file", "huge.json"], "more than one request to AgentFlow carries"],
      [["--connection", "mail", "--stream", "vendor", "--file", "orders.json"], "mail is not one of the sandbox's connections: erp"],
    ] as const) {
      const out = await runCli(dir, ["sandbox", "records-in", ...args], { env: envWith(server.url) });
      expect(out.code, args.join(" ")).toBe(2);
      expect(out.stderr, args.join(" ")).toContain(says);
    }
    expect(server.seen).toEqual([]);
  });

  it("records-out lists the bills written to the connection", async () => {
    const WRITE = {
      object_type: "vendor_bill", external_ref: "L-1", erp_id: "SBX-L-1", written_at: "2026-11-11T08:05:00Z",
      record: { external_ref: "L-1", erp_id: "SBX-L-1", status: "draft", vendor_erp_id: "V-1", company_erp_id: "C-1" },
    };
    const server = await stub(() => ({ status: 200, json: { writes: [WRITE] } }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_ERP);
    const out = await runCli(dir, ["sandbox", "records-out", "--connection", "erp"], { env: envWith(server.url) });
    expect(out).toMatchObject({ code: 0, stdout: `${WRITE.written_at}  vendor_bill  L-1  SBX-L-1\n` });
    expect(server.seen[0]!.method).toBe("GET");
    expect(server.seen[0]!.path).toBe(`/api/v1/sandboxes/${SANDBOX}/connections/${ERP}/records-out`);
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    const json = await runCli(dir, ["sandbox", "records-out", "--connection", "erp", "--json"], { env: envWith(server.url) });
    expect(JSON.parse(json.stdout)).toEqual({ writes: [WRITE] });

    const empty = await stub(() => ({ status: 200, json: { writes: [] } }));
    writeFixtureState(dir, empty.url, WITH_ERP);
    expect((await runCli(dir, ["sandbox", "records-out", "--connection", "erp"], { env: envWith(empty.url) })).stdout).toBe("nothing written\n");
  });

  it("record-status sets the status a bill reads back with, and record-remove removes it, by its external_ref", async () => {
    const REF = "ap:inv/7";
    const BILL = {
      object_type: "vendor_bill", external_ref: REF, erp_id: `SBX-${REF}`, written_at: "2026-11-11T08:05:00Z",
      record: { external_ref: REF, erp_id: `SBX-${REF}`, status: "cancelled", company_erp_id: null },
    };
    const server = await stub((req) => (req.method === "PATCH" ? { status: 200, json: BILL } : { status: 204, html: "" }));
    const dir = appDir();
    writeFixtureState(dir, server.url, WITH_ERP);
    const route = `/api/v1/sandboxes/${SANDBOX}/connections/${ERP}/records-out?external_ref=ap%3Ainv%2F7`;

    const set = await runCli(dir, ["sandbox", "record-status", "--connection", "erp", "--external-ref", REF, "--status", "cancelled"], { env: envWith(server.url) });
    expect(set).toMatchObject({ code: 0, stdout: `${REF} reads back cancelled\n` });
    expect(server.seen[0]).toMatchObject({ method: "PATCH", path: route });
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    expect(JSON.parse(server.seen[0]!.body.toString())).toEqual({ status: "cancelled" });

    const removed = await runCli(dir, ["sandbox", "record-remove", "--connection", "erp", "--external-ref", REF, "--json"], { env: envWith(server.url) });
    expect(removed.code).toBe(0);
    expect(JSON.parse(removed.stdout)).toEqual({ external_ref: REF, removed: true });
    expect(server.seen[1]).toMatchObject({ method: "DELETE", path: route });

    for (const [args, says] of [
      [["record-status", "--connection", "erp", "--status", "posted"], "sandbox record-status needs --external-ref <ref>"],
      [["record-status", "--connection", "erp", "--external-ref", REF], "sandbox record-status needs --status <status>"],
      [["record-remove", "--external-ref", REF], "sandbox record-remove needs --connection <key>"],
      [["record-remove", "--connection", "erp", "--external-ref", REF, "--status", "posted"], "sandbox record-remove takes no --status"],
    ] as const) {
      const out = await runCli(dir, ["sandbox", ...args], { env: envWith(server.url) });
      expect(out.code, args.join(" ")).toBe(2);
      expect(out.stderr, args.join(" ")).toContain(says);
    }
    expect(server.seen).toHaveLength(2);
  });
});

describe("sandbox fire", () => {
  const TRIGGER = "3d4e5f6a-7b8c-4d9e-8f0a-1b2c3d4e5f6a";
  const FIRE = "7e8f9a0b-1c2d-4e3f-9a4b-5c6d7e8f9a0b";
  const INSTALLED = {
    id: "inst-1", deployment_id: "dep-1", package_id: "rfx/mini", version: "1.0.0", armed: ["trigger:daily"],
    objects: { "workflow:check": "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e", "trigger:daily": TRIGGER }, parameters: {},
  };

  it("fires the trigger the package names by its key, by the id the installation recorded", async () => {
    const server = await stub(() => ({ status: 202, json: { fire_id: FIRE } }));
    const dir = appDir();
    writeState(dir, { ...stateFromCreated(server.url, CREATED), installation: INSTALLED });
    const out = await runCli(dir, ["sandbox", "fire", "--trigger", "daily"], { env: envWith(server.url) });
    expect(out).toMatchObject({ code: 0, stdout: `fired trigger:daily (fire ${FIRE})\n` });
    expect(server.seen[0]).toMatchObject({ method: "POST", path: `/api/v1/sandboxes/${SANDBOX}/triggers/${TRIGGER}/fire` });
    expect(server.seen[0]!.headers.authorization).toBe(`Bearer ${PARENT}`);
    const json = await runCli(dir, ["sandbox", "fire", "--trigger", "daily", "--json"], { env: envWith(server.url) });
    expect(JSON.parse(json.stdout)).toEqual({ trigger_id: TRIGGER, fire_id: FIRE });

    for (const [args, says] of [
      [[], "sandbox fire needs --trigger <key>"],
      [["--trigger", "check"], "check is not one of the installation's triggers: daily"],
    ] as const) {
      const refused = await runCli(dir, ["sandbox", "fire", ...args], { env: envWith(server.url) });
      expect(refused.code, args.join(" ")).toBe(2);
      expect(refused.stderr, args.join(" ")).toContain(says);
    }
    writeFixtureState(dir, server.url);
    const undeployed = await runCli(dir, ["sandbox", "fire", "--trigger", "daily"], { env: envWith(server.url) });
    expect(undeployed.code).toBe(2);
    expect(undeployed.stderr).toContain("sandbox fire needs the installation that deploy --sandbox records");
    expect(server.seen).toHaveLength(2);
  });
});

describe("the escalation policy ids a sandbox answers", () => {
  it("keeps ids.escalation_policies and refuses one that is not a map of ids", () => {
    const policy = "4c2e8b1a-7d3f-4a9e-b6c5-1f0d2e3a4b5c";
    const answered = { ...CREATED, ids: { ...CREATED.ids, escalation_policies: { late: policy } } };
    expect(stateFromCreated("http://127.0.0.1:9", answered).ids.escalation_policies).toEqual({ late: policy });
    const bad = { ...CREATED, ids: { ...CREATED.ids, escalation_policies: { late: 3 } } };
    expect(() => stateFromCreated("http://127.0.0.1:9", bad)).toThrow(/ids\.escalation_policies is not a map of ids/);
  });
});

describe("the SLA policy ids a sandbox answers", () => {
  it("keeps ids.sla_policies and refuses one that is not a map of ids", () => {
    const policy = "9d1f6a2e-4b7c-4e1a-8f3d-2c5b7a9e0d14";
    const answered = { ...CREATED, ids: { ...CREATED.ids, sla_policies: { reply: policy } } };
    expect(stateFromCreated("http://127.0.0.1:9", answered).ids.sla_policies).toEqual({ reply: policy });
    const bad = { ...CREATED, ids: { ...CREATED.ids, sla_policies: { reply: 3 } } };
    expect(() => stateFromCreated("http://127.0.0.1:9", bad)).toThrow(/ids\.sla_policies is not a map of ids/);
  });
});

describe("writing the state file", () => {
  it("keeps mode 0600 when a stale temp file with a wider mode is in the way", () => {
    const dir = appDir();
    const state = stateFromCreated("http://127.0.0.1:9", CREATED);
    fs.mkdirSync(path.join(dir, ".agentflow"), { mode: 0o700 });
    const stale = tempPathFor(path.join(dir, ".agentflow", "sandbox.json"));
    fs.writeFileSync(stale, "old", { mode: 0o644 });
    fs.chmodSync(stale, 0o644);
    writeState(dir, state);
    expect(fs.statSync(path.join(dir, ".agentflow", "sandbox.json")).mode & 0o777).toBe(0o600);
    expect(fs.existsSync(stale)).toBe(false);
  });

  it("an update waits out a writer that holds the lock, and breaks a lock a crashed writer left", async () => {
    const dir = appDir();
    writeState(dir, stateFromCreated("http://127.0.0.1:9", CREATED));
    const lock = path.join(dir, ".agentflow", "sandbox.json.lock");
    fs.writeFileSync(lock, "");
    let done = false;
    const update = updateState(dir, (state) => ({ ...state, name: "renamed" })).then(() => {
      done = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(done).toBe(false);
    fs.rmSync(lock);
    await update;
    expect(readState(dir)!.name).toBe("renamed");
    expect(fs.existsSync(lock)).toBe(false);

    fs.writeFileSync(lock, "");
    const crashed = new Date(Date.now() - 60_000);
    fs.utimesSync(lock, crashed, crashed);
    await updateState(dir, (state) => ({ ...state, name: "again" }));
    expect(readState(dir)!.name).toBe("again");
  });

  it("keeps every session when another updater breaks a crashed writer's lock just after this one looked at it", async () => {
    const dir = appDir();
    writeState(dir, stateFromCreated("http://127.0.0.1:9", CREATED));
    const lock = path.join(dir, ".agentflow", "sandbox.json.lock");
    fs.writeFileSync(lock, "");
    const crashed = new Date(Date.now() - 60_000);
    fs.utimesSync(lock, crashed, crashed);
    const withSession = (state: SandboxState, key: string): SandboxState => ({
      ...state,
      chat_sessions: { x: { ...state.chat_sessions?.x, [key]: { token: key, expires_at: "2099-01-01T00:00:00Z" } } },
    });

    // The other updater runs in another process: it breaks the crashed lock, takes its own, and writes later.
    let otherRead: SandboxState | undefined;
    const statSync = fs.statSync;
    const spy = vi.spyOn(fs, "statSync").mockImplementation(((file: fs.PathLike, options?: fs.StatSyncOptions) => {
      const seen = statSync(file, options);
      if (otherRead === undefined && file === lock) {
        fs.rmSync(lock);
        fs.writeFileSync(lock, "");
        otherRead = readState(dir)!;
      }
      return seen;
    }) as typeof fs.statSync);
    try {
      const update = updateState(dir, (state) => withSession(state, "mine"));
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(otherRead).toBeDefined();
      writeState(dir, withSession(otherRead!, "other"));
      fs.rmSync(lock, { force: true });
      await update;
    } finally {
      spy.mockRestore();
    }
    expect(Object.keys(readState(dir)!.chat_sessions!.x).sort()).toEqual(["mine", "other"]);
  });

  it("leaves no state file behind when .gitignore cannot be updated", () => {
    if (process.getuid?.() === 0) return;
    const dir = appDir();
    const ignore = path.join(dir, ".gitignore");
    fs.writeFileSync(ignore, "node_modules/\n");
    fs.chmodSync(ignore, 0o444);
    expect(() => writeState(dir, stateFromCreated("http://127.0.0.1:9", CREATED))).toThrow();
    expect(fs.existsSync(path.join(dir, ".agentflow", "sandbox.json"))).toBe(false);
  });
});
