import fs from "node:fs";
import { at } from "./core.js";
import { CliError } from "./errors.js";

export const CONFIG_VERSION = 1;

// The first SDK release that reads each config version.
export const CONFIG_VERSIONS: Record<number, string> = { 1: "0.2.0" };

export const SDK_VERSION: string = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

export function checkConfigVersion(source: Record<string, unknown>, sdkVersion: string): void {
  const where = "package-manifest.json";
  const pointer = at("", "configVersion");
  function refuse(code: "CONFIG_VERSION_UNKNOWN", message: string): never {
    throw new CliError(code, `${where}#${pointer}: ${message}`);
  }
  if (!("configVersion" in source)) {
    throw new CliError(
      "CONFIG_VERSION_MISSING",
      `config/package-manifest.json has no configVersion: add "configVersion": ${CONFIG_VERSION}`,
    );
  }
  const version = source.configVersion;
  if (typeof version !== "number" || !Number.isInteger(version)) refuse("CONFIG_VERSION_UNKNOWN", "must be a whole number");
  if (version < 1) refuse("CONFIG_VERSION_UNKNOWN", `${version} is not a config version (this SDK reads ${CONFIG_VERSION})`);
  if (version > CONFIG_VERSION) {
    refuse(
      "CONFIG_VERSION_UNKNOWN",
      `${version} is newer than this SDK (${sdkVersion} reads up to ${CONFIG_VERSION}); install a newer SDK release`,
    );
  }
}
