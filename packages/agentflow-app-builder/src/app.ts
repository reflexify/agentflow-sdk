import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { writePackage, type BuildOptions, type Sections } from "./build.js";
import { isObject } from "./core.js";
import { CliError } from "./errors.js";
import { manifestSource } from "./manifest.js";
import { buildUi, checkUi } from "./ui.js";

export const APP_FILE = "agentflow.app.mjs";
const APP_MEMBERS = ["sections", "entityOrder", "exposedSteps", "ui"];
const DEFAULT_VITE_CONFIG = "vite.module.config.ts";

let loads = 0;

export interface AppDefinition {
  sections: Sections;
  entityOrder?: string[];
  exposedSteps?: Record<string, string[]>;
  ui?: { viteConfig: string } | { prebuilt: string };
}

const invalid = (message: string): never => {
  throw new CliError("APP_FILE_INVALID", `${APP_FILE}: ${message}`);
};

const isStrings = (value: unknown): boolean => Array.isArray(value) && value.every((item) => typeof item === "string");

function checkApp(app: unknown): asserts app is AppDefinition {
  if (!isObject(app)) invalid("must default-export what defineApp returns");
  const members = app as Record<string, unknown>;
  for (const member of Object.keys(members)) if (!APP_MEMBERS.includes(member)) invalid(`${member} is not a member defineApp takes`);
  const sections = members.sections;
  if (!isObject(sections) || !isObject(sections.workflows) || !isObject(sections.triggers) || !isObject(sections.actions) || !isStrings(sections.order)) {
    invalid("sections must be what merge returns");
  }
  if ("entityOrder" in members && !isStrings(members.entityOrder)) invalid("entityOrder must be a list of entity keys");
  if ("exposedSteps" in members) {
    const steps = members.exposedSteps;
    if (!isObject(steps) || !Object.values(steps).every(isStrings)) invalid("exposedSteps must map a workflow key to a list of step ids");
  }
  if ("ui" in members) {
    const ui = members.ui;
    const named = isObject(ui) ? Object.keys(ui) : [];
    const valid = named.length === 1 && (named[0] === "viteConfig" || named[0] === "prebuilt") && typeof (ui as Record<string, unknown>)[named[0]!] === "string";
    if (!valid) invalid("ui must be { viteConfig: <file> } or { prebuilt: <folder> }");
  }
}

export function defineApp(app: AppDefinition): AppDefinition {
  checkApp(app);
  return app;
}

export async function loadApp(dir: string): Promise<{ app: AppDefinition; options: BuildOptions; manifestDeclaresUi: boolean }> {
  const appDir = path.resolve(dir);
  const file = path.join(appDir, APP_FILE);
  if (!fs.existsSync(file)) {
    throw new CliError(
      "APP_FILE_MISSING",
      `no ${APP_FILE} in ${appDir}: an app describes its build there (see the builder README, "agentflow.app.mjs")`,
    );
  }
  let loaded: { default?: unknown };
  try {
    // Vite reads a `t` query as its own cache-busting stamp and drops it, so the reload stamp has another name.
    loaded = await import(`${pathToFileURL(file).href}?load=${Date.now()}-${(loads += 1)}`);
  } catch (error) {
    if (error instanceof CliError) throw error;
    return invalid((error as Error).message);
  }
  checkApp(loaded.default);
  const app = loaded.default;
  const configDir = path.join(appDir, "config");
  const options: BuildOptions = { configDir, sections: app.sections };
  if (app.exposedSteps) options.exposedSteps = app.exposedSteps;
  if (app.entityOrder) options.entityOrder = app.entityOrder;
  return { app, options, manifestDeclaresUi: "ui" in manifestSource(configDir) };
}

export async function buildApp(
  dir: string,
  opts: { log?: (line: string) => void } = {},
): Promise<{ files: number; ui: "built" | "copied" | "none" }> {
  const appDir = path.resolve(dir);
  const { app, options, manifestDeclaresUi } = await loadApp(appDir);
  const packageDir = path.join(appDir, "package");
  const files = writePackage(options, packageDir);
  opts.log?.(`wrote ${files} package files`);
  const uiDir = path.join(packageDir, "ui");
  if (!manifestDeclaresUi) {
    fs.rmSync(uiDir, { recursive: true, force: true });
    return { files, ui: "none" };
  }
  if (app.ui && "prebuilt" in app.ui) {
    const source = path.join(appDir, app.ui.prebuilt);
    checkUi(source);
    fs.rmSync(uiDir, { recursive: true, force: true });
    fs.cpSync(source, uiDir, { recursive: true });
    opts.log?.(`copied ${app.ui.prebuilt} to package/ui`);
    return { files, ui: "copied" };
  }
  await buildUi(appDir, app.ui?.viteConfig ?? DEFAULT_VITE_CONFIG, uiDir);
  opts.log?.("built package/ui");
  return { files, ui: "built" };
}
