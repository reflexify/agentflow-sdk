import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readPayloadDir } from "../src/seal/payload.js";
import { generateTypes, payloadObjects } from "../src/types/generate.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const desk = path.join(here, "../../../examples/support-desk/package");
const tsc = path.join(here, "../node_modules/.bin/tsc");

const PROBE = `import { OBJECTS, type EntityFields, type EntityKey, type WorkflowKey, type LogicalKey } from './app.js';
const ticket: EntityKey = 'ticket';
const handling: WorkflowKey = 'support_handling';
const key: LogicalKey = 'entity:ticket';
const subject: EntityFields['ticket']['subject'] = 'Help';
// @ts-expect-error not an entity of the desk
const nope: EntityKey = 'invoice';
void [ticket, handling, key, subject, nope, OBJECTS['entity:ticket'].contractVersion];
`;

// TypeScript 7 ships no in-process compiler API (its package exports only the version and an unstable RPC
// client), so the generated file is compiled by the same `tsc` the package typechecks with.
describe("the support desk's generated types", () => {
  it("compile, and refuse a key the desk does not have", () => {
    const { manifest, objects } = payloadObjects(readPayloadDir(desk));
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
