import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import { runCli } from "./http-stub.js";

export const fixtureApp = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/app");

export function copyApp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-app-"));
  fs.cpSync(fixtureApp, dir, { recursive: true });
  return dir;
}

export function withUi(dir: string): void {
  const file = path.join(dir, "config/package-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  manifest.ui = { kind: "module", entry: "ui/index.js", contract: 1 };
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function writeApp(dir: string, app: string): void {
  fs.writeFileSync(path.join(dir, "agentflow.app.mjs"), app);
}

export async function sealedApp(): Promise<string> {
  const app = copyApp();
  for (const argv of [["build"], ["keygen", "--key-id", "acme-1"], ["seal"]]) expect((await runCli(app, argv)).code, argv[0]).toBe(0);
  return app;
}
