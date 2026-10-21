import path from "node:path";
import { checkConfigVersion, SDK_VERSION } from "./config-version.js";
import { at, readJson, refuse } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";

export const MANIFEST_MEMBERS = CONFIG_MEMBERS.manifest!.filter((key) => key !== "configVersion");
const ADDED_MEMBERS = new Set(CONFIG_MEMBERS.manifest_added);
export const OPTIONAL_MEMBERS = new Set(CONFIG_MEMBERS.manifest_optional);

export function manifestSource(configDir: string): Record<string, unknown> & { parameters: { key: string; type: string }[] } {
  const where = "package-manifest.json";
  const source = readJson(path.join(configDir, where));
  checkConfigVersion(source, SDK_VERSION);
  delete source.configVersion;
  for (const key of Object.keys(source)) {
    if (!MANIFEST_MEMBERS.includes(key) || ADDED_MEMBERS.has(key)) refuse(where, at("", key), "a member the builder does not take from here");
  }
  for (const key of MANIFEST_MEMBERS) {
    if (!ADDED_MEMBERS.has(key) && !OPTIONAL_MEMBERS.has(key) && !(key in source)) refuse(where, at("", key), "missing");
  }
  return source;
}
