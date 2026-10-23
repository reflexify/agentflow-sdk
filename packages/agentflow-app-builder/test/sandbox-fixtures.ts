import { expect } from "vitest";
import { stateFromCreated, writeState } from "../src/sandbox/state.js";
import type { Reply, Seen } from "./http-stub.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const SPEC = {
  groups: [{ key: "users", name: "Users" }],
  people: [{ handle: "admin", name: "Sandbox Admin", roles: ["admin"], groups: ["users"] }],
  install: { parameters: { app_users: "@group:users" } },
};

export function appDir(...given: [spec?: unknown]): string {
  const spec = given.length === 0 ? SPEC : given[0];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sandbox-cli-"));
  if (spec !== undefined) fs.writeFileSync(path.join(dir, "sandbox.json"), JSON.stringify(spec));
  return dir;
}

export const PARENT = `afk_${"parentKey9".repeat(5)}`;
export const DEPLOY = `afk_${"deployKey9".repeat(5)}`;
export const OWNER = `afs_${"ownerTok9".repeat(5)}`;
export const SANDBOX = "5f0c9a52-8f0e-4b8e-9a43-0c7f1d2e3b4a";
export const CREATED = {
  id: SANDBOX,
  name: "app",
  base_url: "https://public.example",
  created_at: "2026-10-22T00:00:00Z",
  expires_at: "2026-10-29T00:00:00Z",
  deploy_key: DEPLOY,
  owner: "admin",
  people: { admin: { user_id: "7b0b4c47-6f6e-4a0e-8d1e-2b8c6d4f0a11", token: OWNER } },
  ids: { groups: { users: "1c1d6b0e-3a6c-4c43-9a0f-6b0c8f2e4d55" }, units: {}, principals: {}, connections: {} },
  install: { parameters: { app_users: "1c1d6b0e-3a6c-4c43-9a0f-6b0c8f2e4d55" }, decisions: {} },
};

export const envWith = (url: string, extra: Record<string, string> = {}): Record<string, string> => ({
  AGENTFLOW_URL: url,
  AGENTFLOW_SANDBOX_KEY: PARENT,
  ...extra,
});

export function noSecrets(out: { stdout: string; stderr: string }, ...secrets: string[]): void {
  for (const secret of [PARENT, DEPLOY, OWNER, ...secrets]) {
    expect(out.stdout).not.toContain(secret);
    expect(out.stderr).not.toContain(secret);
  }
}

export function writeFixtureState(dir: string, url: string, created: Record<string, unknown> = CREATED): void {
  writeState(dir, stateFromCreated(url, created));
}

export const OLD = "0e5b7d1a-2c4f-4a8b-9d3e-6f1a2b3c4d5e";
export const SANDBOX_2 = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
export const DEPLOY_2 = `afk_${"deployKey8".repeat(5)}`;
export const OWNER_2 = `afs_${"ownerTok8".repeat(5)}`;
export const CREATED_2 = {
  ...CREATED,
  id: SANDBOX_2,
  deploy_key: DEPLOY_2,
  people: { admin: { user_id: CREATED.people.admin.user_id, token: OWNER_2 } },
};

export const sealedPath = (app: string): string => path.join(app, "dist-app", "rfx-mini-1.0.0.afpkg");

export const FIRST_PLAN = {
  plan: { setup: { features: [{ package: "rfx/mini", key: "extras", optional: true }] }, document: { installations: [] } },
  plan_hash: "h1",
};
export const SECOND_PLAN = { ...FIRST_PLAN, plan_hash: "h2" };
export const OBJECTS = {
  revision: 1,
  objects: [{ logical_key: "entity:case", id: "e-1" }, { logical_key: "entity_field:case.title", id: null }],
  parameters: { app_users: "g" },
};

type Route = Reply | ((request: Seen) => Reply);

// Every route answers only to the key the real API would want for it, so a request sent with the wrong one fails loudly.
export function routes(over: Record<string, Route> = {}, keys = { deploy: DEPLOY, owner: OWNER }): (request: Seen) => Reply {
  let plans = 0;
  const table: Record<string, [string, Route]> = {
    "POST /api/v1/sandboxes": [PARENT, { status: 201, json: CREATED }],
    "POST /api/v1/app-packages": [keys.deploy, { status: 201, json: { package_id: "rfx/mini", version: "1.0.0", digest: "d", signer: "s" } }],
    "POST /api/v1/app-deployments": [keys.deploy, { status: 201, json: { deployment_id: "dep-1", status: "awaiting_approval", approve_url: "u" } }],
    "POST /api/v1/app-deployments/dep-1/plan": [keys.owner, () => ({ status: 200, json: plans++ === 0 ? FIRST_PLAN : SECOND_PLAN })],
    "POST /api/v1/app-deployments/dep-1/approve": [keys.owner, { status: 202, json: { deployment_id: "dep-1", status: "installing", approve_url: "u" } }],
    "GET /api/v1/app-deployments/dep-1": [
      keys.owner,
      { status: 200, json: { deployment_id: "dep-1", status: "installed", installation_id: "inst-1", approve_url: "u" } },
    ],
    "POST /api/v1/app-installations/inst-1/arm": [keys.owner, { status: 200, json: { triggers: ["trigger:t"], activated_at: "x" } }],
    "GET /api/v1/app-installations/inst-1/objects": [keys.owner, { status: 200, json: OBJECTS }],
  };
  return (request) => {
    const name = `${request.method} ${request.path}`;
    const deleting = request.method === "DELETE" && request.path.startsWith("/api/v1/sandboxes/");
    const [key, fallback] = deleting ? [PARENT, { status: 204, html: "" } as Reply] : table[name] ?? ["", undefined];
    const route = over[name] ?? fallback;
    if (!route) return { status: 404, html: "<h1>not found</h1>" };
    if (request.headers.authorization !== `Bearer ${key}`) return { status: 401, problem: { type: "UNAUTHENTICATED", detail: "wrong key" } };
    return typeof route === "function" ? route(request) : route;
  };
}
