import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { closeStubs, runCli, stub, type Reply, type Seen } from "./http-stub.js";
import { tempPathFor } from "../src/sandbox/state.js";
import { writeState, stateFromCreated } from "../src/sandbox/state.js";
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
      `.agentflow/sandbox.json already names sandbox ${SANDBOX}: run pnpm exec agentflow-app sandbox delete first, or pnpm exec agentflow-app deploy --sandbox, which replaces it`,
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
