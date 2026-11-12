import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors.js";
import { readZip } from "../seal/zip.js";
import type { SandboxSpec } from "./spec.js";

type Rec = Record<string, unknown>;

// A sealed package sandbox.json's `dependencies` names: deploy --sandbox uploads it before the folder's package, so
// the install finds it among the sandbox's uploads.
export interface Dependency {
  file: string;
  fileName: string;
  bytes: Buffer;
  id: string;
  version: string;
  manifest: Rec;
}

const isObject = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);

const refused = (i: number, message: string): CliError =>
  new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: dependencies[${i}]: ${message}`, ["sandbox.json"]);

// Reads each file `dependencies` names, relative to the folder; throws on one that is missing or not a sealed package.
export function readDependencies(spec: SandboxSpec, cwd: string): Dependency[] {
  const files = Array.isArray(spec.dependencies) ? spec.dependencies.filter((f): f is string => typeof f === "string") : [];
  return files.map((file, i) => {
    let bytes: Buffer;
    try {
      bytes = fs.readFileSync(path.resolve(cwd, file));
    } catch (error) {
      throw refused(i, `cannot read \`${file}\` (${(error as NodeJS.ErrnoException).code ?? "error"})`);
    }
    let manifest: unknown;
    try {
      const entry = readZip(bytes).get("manifest.json");
      manifest = entry ? JSON.parse(entry.toString("utf8")) : undefined;
    } catch {
      manifest = undefined;
    }
    if (!isObject(manifest) || typeof manifest.id !== "string" || typeof manifest.version !== "string") {
      throw refused(i, `\`${file}\` is not a sealed package: it holds no manifest.json with an id and a version`);
    }
    return { file, fileName: path.basename(file), bytes, id: manifest.id, version: manifest.version, manifest };
  });
}
