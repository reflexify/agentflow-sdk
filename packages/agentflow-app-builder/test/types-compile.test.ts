import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readPayloadDir } from "../src/seal/payload.js";
import { generateTypes, payloadObjects } from "../src/types/generate.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const tickets = path.join(here, "../../../fixtures/tickets/package");
const tsc = path.join(here, "../node_modules/.bin/tsc");
const sdk = path.join(here, "../../agentflow-sdk/src/index.ts");

const PROBE = `import { getAppObjects, type AgentFlowClient } from '@reflexify/agentflow-sdk';
import { OBJECTS, type EntityFields, type EntityKey, type WorkflowKey, type LogicalKey } from './app.js';
const item: EntityKey = 'item';
const handling: WorkflowKey = 'handle';
const key: LogicalKey = 'entity:item';
const subject: EntityFields['item']['subject'] = 'Help';
const status: EntityFields['item']['status'] = 'open';
// @ts-expect-error not an entity of the app
const nope: EntityKey = 'invoice';
// @ts-expect-error not a value of the status enum
const badStatus: EntityFields['item']['status'] = 'escalated';
void [item, handling, key, subject, status, nope, badStatus, OBJECTS['entity:item'].contractVersion];
declare const client: AgentFlowClient;
const objects = getAppObjects<LogicalKey>(client);
const itemId: string | null = objects.id('entity:item');
const bound = objects.find('entity:invoice', { source: 'bound' });
// @ts-expect-error not a logical key of the app
const wrong = objects.id('entity:invoice');
void [itemId, bound, wrong];
`;

// TypeScript 7 ships no in-process compiler API (its package exports only the version and an unstable RPC
// client), so the generated file is compiled by the same `tsc` the package typechecks with.
describe("a desk-shaped app's generated types", () => {
  it("compile, and refuse a key the app does not have", () => {
    const { manifest, objects } = payloadObjects(readPayloadDir(tickets));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-types-"));
    fs.writeFileSync(path.join(dir, "app.ts"), generateTypes(manifest, objects));
    fs.writeFileSync(path.join(dir, "probe.ts"), PROBE);
    const compilerOptions = {
      strict: true,
      noEmit: true,
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      noUnusedLocals: true,
      types: [],
      paths: { "@reflexify/agentflow-sdk": [sdk] },
      allowImportingTsExtensions: true,
    };
    fs.writeFileSync(path.join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions, files: ["app.ts", "probe.ts"] }));
    let diagnostics = "";
    try {
      execFileSync(tsc, ["-p", path.join(dir, "tsconfig.json"), "--pretty", "false"], { cwd: dir, encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      diagnostics = String((error as { stdout?: string }).stdout ?? error);
    }
    expect(diagnostics).toBe("");
  });
});
