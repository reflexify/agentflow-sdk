import { afterEach, describe, expect, it } from "vitest";
import type { CliError } from "../src/errors.js";
import { Platform, problemLine, type Env } from "../src/platform.js";
import { closeStubs, deadUrl, stub, TOKEN } from "./http-stub.js";

afterEach(closeStubs);

function refusal(env: Env, url?: string): CliError {
  try {
    Platform.configure(env, url);
  } catch (error) {
    return error as CliError;
  }
  throw new Error("configure accepted it");
}

describe("Platform.configure", () => {
  it("names the variable that is not set", () => {
    expect(refusal({ AGENTFLOW_TOKEN: TOKEN })).toMatchObject({ code: "DEPLOY_NOT_CONFIGURED", message: expect.stringMatching(/^AGENTFLOW_URL is not set/) });
    expect(refusal({ AGENTFLOW_URL: "https://agentflow.example.com" })).toMatchObject({
      code: "DEPLOY_NOT_CONFIGURED",
      message: expect.stringMatching(/^AGENTFLOW_TOKEN is not set/),
    });
    expect(refusal({ AGENTFLOW_URL: "", AGENTFLOW_TOKEN: "" }).message).toMatch(/^AGENTFLOW_URL is not set/);
  });

  it("takes https anywhere and http only on this machine", () => {
    for (const url of ["http://localhost:8080", "http://127.0.0.1:8080/", "http://[::1]:8080", "https://agentflow.example.com"]) {
      expect(() => Platform.configure({ AGENTFLOW_TOKEN: TOKEN }, url), url).not.toThrow();
    }
    const plain = refusal({ AGENTFLOW_URL: "http://agentflow.example.com", AGENTFLOW_TOKEN: TOKEN });
    expect(plain).toMatchObject({ code: "DEPLOY_NOT_CONFIGURED", message: expect.stringContaining("AGENTFLOW_URL must start with https://") });
    expect(refusal({ AGENTFLOW_TOKEN: TOKEN }, "ftp://agentflow.example.com").message).toContain("--url must start with https://");
    expect(refusal({ AGENTFLOW_TOKEN: TOKEN }, "not a url").message).toBe("--url is not a URL");
  });

  it("refuses an address with a user, a query or a fragment", () => {
    for (const url of ["https://me:pw@agentflow.example.com", "https://agentflow.example.com/?a=1", "https://agentflow.example.com/#x"]) {
      expect(refusal({ AGENTFLOW_TOKEN: TOKEN }, url).message, url).toBe("--url must be the address alone, with no user, query or fragment");
    }
  });

  it("never echoes the address, which may carry a password", () => {
    for (const url of ["http://user:hunter2@agentflow.example.com", "ftp://user:hunter2@agentflow.example.com", "hunter2 is no url"]) {
      const message = refusal({ AGENTFLOW_TOKEN: TOKEN }, url).message;
      expect(message, url).not.toContain("hunter2");
      expect(message, url).not.toContain("agentflow.example.com");
    }
    expect(refusal({ AGENTFLOW_TOKEN: TOKEN }, "http://user:hunter2@agentflow.example.com").message).toBe(
      "--url must be the address alone, with no user, query or fragment",
    );
  });

  it("drops a trailing slash and a trailing /api/v1, and keeps a path the deployment is served under", () => {
    const root = (url: string) => Platform.configure({ AGENTFLOW_TOKEN: TOKEN }, url).root;
    expect(root("https://agentflow.example.com/")).toBe("https://agentflow.example.com");
    expect(root("https://agentflow.example.com/api/v1/")).toBe("https://agentflow.example.com");
    expect(root("https://example.com/agentflow")).toBe("https://example.com/agentflow");
  });
});

describe("Platform requests", () => {
  it("sends the token in the Authorization header and nowhere else", async () => {
    const server = await stub(() => ({ status: 200, json: { platform_version: "2026.10", format_versions: [1] } }));
    const platform = Platform.configure({ AGENTFLOW_URL: server.url, AGENTFLOW_TOKEN: TOKEN }, undefined);
    expect(await platform.get("/platform")).toEqual({ status: 200, body: { platform_version: "2026.10", format_versions: [1] } });
    const [request] = server.seen;
    expect(request).toMatchObject({ method: "GET", path: "/api/v1/platform" });
    expect(request!.headers.authorization).toBe(`Bearer ${TOKEN}`);
    expect(request!.path).not.toContain(TOKEN);
  });

  it("turns a problem into a refusal with the platform's code, its detail and its lint problems", async () => {
    const server = await stub(() => ({
      status: 422,
      problem: {
        type: "APP_PACKAGE_PROBLEMS",
        detail: "the package has 1 lint problem",
        extensions: { problems: [{ code: "body_invalid", object: { kind: "entity", name: "note" }, path: "/fields/0/type", message: "unknown field type" }] },
      },
    }));
    const platform = Platform.configure({ AGENTFLOW_URL: server.url, AGENTFLOW_TOKEN: TOKEN }, undefined);
    await expect(platform.postPackage("/app-packages", new Uint8Array([1, 2, 3]), "x.afpkg")).rejects.toMatchObject({
      code: "APP_PACKAGE_PROBLEMS",
      message: 'the package has 1 lint problem\nbody_invalid  entity "note"  /fields/0/type: unknown field type',
    });
  });

  it("hides the token in a refusal that echoes it", async () => {
    const server = await stub(() => ({ status: 401, problem: { type: "INVALID_TOKEN", detail: `unknown credential ${TOKEN}` } }));
    const platform = Platform.configure({ AGENTFLOW_URL: server.url, AGENTFLOW_TOKEN: TOKEN }, undefined);
    await expect(platform.get("/platform")).rejects.toMatchObject({ code: "INVALID_TOKEN", message: "unknown credential [redacted]\ncheck AGENTFLOW_TOKEN: the key must be a current service principal key (deploy also needs integration.admin)" });
  });

  it("does not follow a redirect, so the key never reaches where it points", async () => {
    const target = await stub(() => ({ status: 200, json: {} }));
    const redirecting = await stub(() => ({ status: 307, html: "", headers: { location: `${target.url}/api/v1/platform` } }));
    const platform = Platform.configure({ AGENTFLOW_URL: redirecting.url, AGENTFLOW_TOKEN: TOKEN }, undefined);
    await expect(platform.get("/platform")).rejects.toMatchObject({
      code: "DEPLOY_UNREACHABLE",
      message: `${redirecting.url} answered with a redirect to ${target.url}/api/v1/platform: set AGENTFLOW_URL to the address AgentFlow is served at`,
    });
    expect(target.seen).toEqual([]);
  });

  it("says when what answers is not AgentFlow", async () => {
    const server = await stub((request) => (request.path.endsWith("/missing") ? { status: 404, html: "<h1>nope</h1>" } : { status: 200, html: "<h1>hi</h1>" }));
    const platform = Platform.configure({ AGENTFLOW_TOKEN: TOKEN }, server.url);
    await expect(platform.get("/missing")).rejects.toMatchObject({
      code: "DEPLOY_UNREACHABLE",
      message: `${server.url} answered, but not as AgentFlow does (404): check --url`,
    });
    await expect(platform.get("/platform")).rejects.toMatchObject({
      code: "DEPLOY_UNREACHABLE",
      message: `${server.url} answered, but not as AgentFlow does (200 without a JSON object): check --url`,
    });
  });

  it("says when nothing answers", async () => {
    const url = await deadUrl();
    const platform = Platform.configure({ AGENTFLOW_URL: url, AGENTFLOW_TOKEN: TOKEN }, undefined);
    await expect(platform.get("/platform")).rejects.toMatchObject({
      code: "DEPLOY_UNREACHABLE",
      message: `no answer from ${url} (ECONNREFUSED): check AGENTFLOW_URL and your network`,
    });
  });
});

describe("problemLine", () => {
  it("prints the code, the object, the path and the message, and the fix when there is one", () => {
    expect(problemLine({ code: "body_invalid", object: { kind: "entity", name: "case" }, path: "/fields/2", message: "bad", fix: "use text" })).toBe(
      'body_invalid  entity "case"  /fields/2: bad (fix: use text)',
    );
    expect(problemLine({ code: "platform_too_old", object: { kind: "manifest", name: "acme/x" }, path: "", message: "too\nold" })).toBe(
      'platform_too_old  manifest "acme/x": too old',
    );
    expect(problemLine({ code: "x", object: { kind: "ui" }, path: "ui/a.js", message: "m" })).toBe("x  ui  ui/a.js: m");
  });
});
