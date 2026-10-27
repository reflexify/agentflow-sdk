import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { CONFIG_VERSION, CONFIG_VERSIONS, SDK_VERSION } from "../src/config-version.js";

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };

function withManifest(change: (manifest: Record<string, unknown>) => void): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "config-version-"));
  fs.cpSync(fixture, dir, { recursive: true });
  const file = path.join(dir, "package-manifest.json");
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  change(manifest);
  fs.writeFileSync(file, JSON.stringify(manifest));
  return dir;
}

const build = (configVersion?: unknown) =>
  buildPackage({
    configDir: withManifest((m) => {
      if (configVersion === undefined) delete m.configVersion;
      else m.configVersion = configVersion;
    }),
    sections: empty,
  });

describe("configVersion", () => {
  it("reads the SDK version from the package", () => {
    expect(SDK_VERSION).toBe("0.5.0");
    expect(CONFIG_VERSION).toBe(1);
    expect(CONFIG_VERSIONS).toEqual({ 1: "0.2.0" });
  });
  it("is required", () => {
    expect(() => build()).toThrow('config/package-manifest.json has no configVersion: add "configVersion": 1');
  });
  it("refuses a version newer than the SDK reads", () => {
    expect(() => build(2)).toThrow(
      "package-manifest.json#/configVersion: 2 is newer than this SDK (0.5.0 reads up to 1); install a newer SDK release",
    );
  });
  it("refuses a version that is not a whole number", () => {
    expect(() => build("1")).toThrow("package-manifest.json#/configVersion: must be a whole number");
    expect(() => build(1.5)).toThrow("package-manifest.json#/configVersion: must be a whole number");
  });
  it("refuses a version below 1", () => {
    expect(() => build(0)).toThrow("package-manifest.json#/configVersion: 0 is not a config version (this SDK reads 1)");
  });
  it("builds at the current version and leaves it out of manifest.json", () => {
    const manifest = JSON.parse(build(1)["manifest.json"]!);
    expect("configVersion" in manifest).toBe(false);
    expect(manifest.formatVersion).toBe(1);
  });
});
