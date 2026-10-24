import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APP_FILE, buildApp } from "../app.js";
import { objectPath } from "../core.js";
import { CliError } from "../errors.js";
import { draftProjectFiles } from "../init.js";
import { readZip } from "../seal/zip.js";
import { listFiles } from "../ui.js";
import { agentSource, dashboardSource, skillFile, UI_README, UI_SOURCE } from "./assets.js";
import { compareDraft, describeDifferences } from "./compare.js";
import { entitySource } from "./entities.js";
import { Draft, manifestConfig, type Json } from "./manifest.js";
import { actionSource, publishOrder, triggerSource, workflowSource } from "./sections.js";
import { unsupported } from "./unsentinel.js";

const BUILDER = "@reflexify/agentflow-app-builder";
const HANDLED = new Set(["entity", "entity_field", "entity_view", "form", "workflow", "trigger", "entity_action", "agent", "skill", "dashboard"]);

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const moduleText = (name: string, value: unknown): string => `export const ${name} = ${JSON.stringify(value, null, 2)};\n`;
const identifier = (prefix: string, key: string): string => `${prefix}_${key.replace(/[^A-Za-z0-9_$]/g, "_")}`;
const propertyName = (key: string): string => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key));

// A list or object literal with one entry per line, so a change to the app's objects is a one-line diff.
function lines(entries: string[], indent: string, brackets = "[]"): string {
  if (!entries.length) return brackets;
  return [brackets[0], ...entries.map((entry) => `${indent}  ${entry},`), `${indent}${brackets[1]}`].join("\n");
}

// The draft's files, refusing an archive that is not a draft.
function readDraft(bytes: Uint8Array): Map<string, Buffer> {
  let files: Map<string, Buffer>;
  try {
    files = readZip(bytes, { skipFolders: true });
  } catch (error) {
    if (error instanceof CliError) throw new CliError("DRAFT_INVALID", error.message, error.files);
    throw new CliError("DRAFT_INVALID", `not a draft: ${(error as Error).message}`);
  }
  if (files.has("hashes.json") || files.has("signature")) {
    throw new CliError("DRAFT_INVALID", "this is a sealed package, not a draft: use Admin → Apps → Pack with no key");
  }
  return files;
}

// The SDK project whose build is the draft, by project path.
function projectOf(draft: Draft): Map<string, string | Buffer> {
  const out = new Map<string, string | Buffer>();
  for (const { key, kind } of draft.objects) {
    if (!HANDLED.has(kind)) unsupported(objectPath(key), "", `the builder does not write a ${kind}`);
  }
  for (const file of draft.files.keys()) {
    if (file !== "manifest.json" && !file.startsWith("objects/") && !file.startsWith("ui/")) {
      unsupported(file, "", "a file the builder does not write");
    }
  }
  out.set("config/package-manifest.json", json(manifestConfig(draft)));

  const entities = draft.keys("entity");
  for (const key of entities) out.set(`config/entities/${key}.json`, json(entitySource(draft, key, entities)));

  const workflows = draft.keys("workflow").map((key) => workflowSource(draft, key, entities));
  const imports: string[] = [];
  const modules: string[] = [];
  const exposed: Record<string, string[]> = {};
  for (const w of workflows) {
    out.set(`config/build/workflows/${w.key}.mjs`, moduleText("workflows", { [w.key]: w.source }));
    for (const [file, text] of w.code) out.set(`config/${file}`, text);
    if (w.exposed.length) exposed[w.key] = w.exposed;
    modules.push(identifier("workflow", w.key));
    imports.push(`import * as ${modules.at(-1)} from "./config/build/workflows/${w.key}.mjs";`);
  }
  for (const name of draft.keys("trigger")) {
    out.set(`config/build/triggers/${name}.mjs`, moduleText("triggers", { [name]: triggerSource(draft, name) }));
    modules.push(identifier("trigger", name));
    imports.push(`import * as ${modules.at(-1)} from "./config/build/triggers/${name}.mjs";`);
  }
  for (const scoped of draft.keys("entity_action")) {
    const name = scoped.replace("/", "__");
    out.set(`config/build/actions/${name}.mjs`, moduleText("actions", { [name]: actionSource(draft, scoped) }));
    modules.push(identifier("action", name));
    imports.push(`import * as ${modules.at(-1)} from "./config/build/actions/${name}.mjs";`);
  }
  for (const key of draft.keys("agent")) out.set(`config/agents/${key}.json`, json(agentSource(draft, key)));
  for (const key of draft.keys("skill")) out.set(`config/skills/${key}.SKILL.md`, skillFile(draft, key));
  for (const key of draft.keys("dashboard")) out.set(`config/dashboards/${key}.json`, json(dashboardSource(draft, key)));
  draft.leftovers();

  const ui = [...draft.files.keys()].filter((file) => file.startsWith("ui/"));
  for (const file of ui) out.set(`${UI_SOURCE}/${file.slice("ui/".length)}`, draft.files.get(file)!);
  if (ui.length) out.set("ui/README.md", UI_README);

  const strings = (items: string[]): string[] => items.map((item) => JSON.stringify(item));
  const exposedLines = Object.entries(exposed).map(([key, steps]) => `${propertyName(key)}: ${JSON.stringify(steps)}`);
  const app: string[] = [`  sections: merge(${lines(modules, "  ")}, ORDER),`, `  entityOrder: ${lines(strings(entities), "  ")},`];
  if (exposedLines.length) app.push(`  exposedSteps: ${lines(exposedLines, "  ", "{}")},`);
  if ("ui" in draft.manifest) app.push(`  ui: { prebuilt: ${JSON.stringify(UI_SOURCE)} },`);
  out.set(
    APP_FILE,
    [
      `import { defineApp, merge } from "${BUILDER}";`,
      ...imports,
      "",
      "// Publish order: a workflow comes after every workflow it calls.",
      `const ORDER = ${lines(strings(publishOrder(workflows)), "")};`,
      "",
      "export default defineApp({",
      ...app,
      "});",
      "",
    ].join("\n"),
  );
  return out;
}

// The module a draft carries when its app has no screen: a `mount` that draws nothing and returns a no-op.
const EMPTY_MOUNT = /^(?:export\s+)?function\s+mount\s*\([^)]*\)\s*\{\s*return\s*\(\s*\)\s*=>\s*\{\s*\}\s*;?\s*\}\s*(?:export\s*\{\s*mount\s*\}\s*;?\s*)?$/;

function emptyModuleWarning(draft: Draft): string[] {
  const ui = draft.manifest.ui;
  const entry = typeof ui === "object" && ui !== null && typeof (ui as Json).entry === "string" ? ((ui as Json).entry as string) : "ui/index.js";
  const bytes = draft.files.get(entry);
  if (!bytes || !EMPTY_MOUNT.test(bytes.toString("utf8").trim())) return [];
  return [
    `the draft's UI module ${entry} (${bytes.length} bytes) is an empty stub: it opens a blank screen. Before you seal, replace it with a real module (the agentflow-ui-module skill), or remove ui and the launcher entries that open it`,
  ];
}

// This package's own folder, which the project's app file and section modules import while it is checked.
function builderRoot(): string {
  for (let dir = path.dirname(fileURLToPath(import.meta.url)); ; dir = path.dirname(dir)) {
    const file = path.join(dir, "package.json");
    if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, "utf8")).name === BUILDER) return dir;
    if (path.dirname(dir) === dir) throw new Error(`no ${BUILDER} folder above ${fileURLToPath(import.meta.url)}`);
  }
}

function readTree(dir: string): Map<string, Buffer> {
  return new Map(listFiles(dir).map((rel) => [rel, fs.readFileSync(path.join(dir, rel))]));
}

function writeTree(dir: string, files: Map<string, string | Buffer>): void {
  for (const [rel, content] of files) {
    const target = path.join(dir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}

// A refusal of the converted project's build is a form the builder cannot write.
function buildRefusal(error: unknown): CliError {
  if (error instanceof CliError && error.code.startsWith("DRAFT_")) return error;
  const message = error instanceof CliError ? `${error.code}: ${error.message}` : (error as Error).message;
  const named = /^([^\s#:]+)#/.exec((error as Error).message)?.[1];
  if (named === "package-manifest.json") {
    const text = (error as Error).message;
    // The converted manifest reshapes the draft's launcher and drops configVersion, so those pointers
    // have no member of the same name in the draft.
    if (/^package-manifest\.json#\/(launcher|configVersion)(\/|:)/.test(text)) {
      return new CliError(
        "DRAFT_UNSUPPORTED",
        `the converted project does not build: ${text}. This is the converted config/package-manifest.json, made from the draft's manifest.json (its launcher member, for a launcher pointer): fix it in the designers and pack the app again`,
        ["manifest.json"],
      );
    }
    return new CliError(
      "DRAFT_UNSUPPORTED",
      `the converted project does not build: ${text.replace(/^package-manifest\.json/, "manifest.json")}. Check this member of the draft's manifest.json: fix it in the designers and pack the app again`,
      ["manifest.json"],
    );
  }
  return new CliError("DRAFT_UNSUPPORTED", `the converted project does not build: ${message}`, named ? [`config/${named}`] : undefined);
}

async function checkRebuild(staging: string, files: Map<string, Buffer>): Promise<string[]> {
  const modules = path.join(staging, "node_modules");
  const link = path.join(modules, ...BUILDER.split("/"));
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(builderRoot(), link, "dir");
  let warnings: string[];
  try {
    ({ warnings } = await buildApp(staging));
  } catch (error) {
    throw buildRefusal(error);
  } finally {
    fs.rmSync(modules, { recursive: true, force: true });
  }
  const built = readTree(path.join(staging, "package"));
  const differs = compareDraft(files, built);
  if (differs.length) {
    throw new CliError(
      "DRAFT_REBUILD_DIFFERS",
      `the converted project does not build the draft back; it differs at ${describeDifferences(files, built).join("; ")}`,
      differs.map((rel) => `package/${rel}`),
    );
  }
  fs.rmSync(path.join(staging, "package", "ui"), { recursive: true, force: true });
  return warnings;
}

// Turns a draft zip from the Pack page into an SDK project in `dir`, a new or empty folder. The project is
// kept only when building it gives every file of the draft back; otherwise nothing is written.
export async function convertDraft(zip: Uint8Array, dir: string): Promise<{ dir: string; files: number; warnings: string[] }> {
  const files = readDraft(zip);
  const draft = new Draft(files);
  const project = projectOf(draft);
  const id = draft.manifest.id;
  if (typeof id !== "string" || !/^[^/]+\/[^/]+$/.test(id)) unsupported("manifest.json", "/id", "a package id is <prefix>/<key>");
  const name = typeof draft.manifest.name === "string" ? draft.manifest.name : id;

  const target = path.resolve(dir);
  const existing = fs.existsSync(target);
  if (existing && (!fs.statSync(target).isDirectory() || fs.readdirSync(target).length > 0)) {
    throw new CliError("INIT_DIR_NOT_EMPTY", `${target} exists and is not an empty folder: name a new folder, or an empty one`, [target]);
  }
  const parent = path.dirname(target);
  fs.mkdirSync(parent, { recursive: true });
  const staging = fs.mkdtempSync(path.join(parent, ".agentflow-draft-"));
  try {
    writeTree(staging, project);
    const warnings = await checkRebuild(staging, files);
    writeTree(staging, draftProjectFiles(id, name, [...files.keys()].some((file) => file.startsWith("ui/"))));
    const count = listFiles(staging).length;
    if (existing) fs.rmdirSync(target);
    fs.renameSync(staging, target);
    return { dir: target, files: count, warnings: [...warnings, ...emptyModuleWarning(draft)] };
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}
