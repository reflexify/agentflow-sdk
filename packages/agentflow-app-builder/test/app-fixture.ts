import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import { doc, edges, end, graph, INITIATOR, restricted, signature, signer, start, workflow } from "../src/workflow.js";
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

// The fixture app with one workflow that signs by server_email and, in a second step, by client_cert.
export function withSigningWorkflow(dir: string): string {
  const step = (id: string, method: "server_email" | "client_cert") =>
    signature(id, "Sign", {
      documents: [doc.upstream("d1", "start", "file")],
      signers: [{ role: "party", who: signer.initiator() }],
      method,
    });
  const signs = workflow(
    "signs",
    "Signs",
    "A workflow that signs twice",
    INITIATOR,
    restricted("support_group_id"),
    graph(
      "Signs",
      [start(), step("by_email", "server_email"), step("by_cert", "client_cert"), end("done", "Done")],
      edges(["e1", "start", "by_email"], ["e2", "by_email", "by_cert"], ["e3", "by_cert", "done"]),
    ),
  );
  writeApp(dir, `export default { sections: ${JSON.stringify({ workflows: { signs }, order: ["signs"], triggers: {}, actions: {} })} };\n`);
  return dir;
}

export async function signingApp(): Promise<string> {
  const app = withSigningWorkflow(copyApp());
  expect((await runCli(app, ["build"])).code).toBe(0);
  return app;
}

export async function sealedSigningApp(): Promise<string> {
  const app = withSigningWorkflow(copyApp());
  for (const argv of [["build"], ["keygen", "--key-id", "acme-1"], ["seal"]]) expect((await runCli(app, argv)).code, argv[0]).toBe(0);
  return app;
}

export const SERVER_EMAIL_ONLY = "warning: this package signs with client_cert, which the deployment does not offer (it offers server_email), so its setup will refuse to install the package";
