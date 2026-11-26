import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { uiContractWarnings } from "../src/manifest.js";

const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };
const W = "package-manifest.json";

function buildWith(ui: unknown): Record<string, string> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "manifest-ui-"));
  fs.cpSync(mini, dir, { recursive: true });
  const file = path.join(dir, W);
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  manifest.ui = ui;
  fs.writeFileSync(file, JSON.stringify(manifest));
  return buildPackage({ configDir: dir, sections: empty });
}

describe("the ui member", () => {
  it("keeps a module at contract 1 to 7 as written", () => {
    for (const contract of [1, 2, 3, 4, 5, 6, 7]) {
      const ui = { kind: "module", entry: "ui/index.js", contract };
      expect(JSON.parse(buildWith(ui)["manifest.json"]!).ui).toEqual(ui);
    }
  });
  it("refuses a contract other than 1 to 7, naming the member and the allowed values", () => {
    for (const contract of [8, 0, "2", undefined]) {
      expect(() => buildWith({ kind: "module", entry: "ui/index.js", contract })).toThrow(`${W}#/ui/contract: one of 1, 2, 3, 4, 5, 6, 7`);
    }
  });
  it("refuses a kind other than module", () => {
    expect(() => buildWith({ kind: "iframe", entry: "ui/index.js", contract: 2 })).toThrow(`${W}#/ui/kind: must be module`);
    expect(() => buildWith({ entry: "ui/index.js", contract: 2 })).toThrow(`${W}#/ui/kind: must be module`);
  });
  it("refuses a ui that is not an object", () => {
    expect(() => buildWith("ui/index.js")).toThrow(`${W}#/ui: must be an object`);
  });
  it("warns for contract 7 below the month that follows a run, and only then", () => {
    const at = (contract: number, minPlatformVersion: string) => uiContractWarnings({ ui: { kind: "module", contract }, minPlatformVersion });
    expect(at(7, "2027.11")).toEqual([
      "ui.contract 7 is the contract of host.realtime.followRun, which needs AgentFlow 2028.01: set minPlatformVersion in package-manifest.json to 2028.01, not 2027.11",
    ]);
    expect(at(7, "2028.01")).toEqual([]);
    expect(at(6, "2026.10")).toEqual([]);
    expect(uiContractWarnings({ minPlatformVersion: "2026.10" })).toEqual([]);
  });
});
