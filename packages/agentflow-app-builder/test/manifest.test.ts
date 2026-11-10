import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";

const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };

describe("the manifest's members", () => {
  it("a manifest with mcp is refused", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "manifest-mcp-"));
    fs.cpSync(mini, dir, { recursive: true });
    const file = path.join(dir, "package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    expect("mcp" in manifest).toBe(false);
    expect(() => buildPackage({ configDir: dir, sections: empty })).not.toThrow();
    fs.writeFileSync(file, JSON.stringify({ ...manifest, mcp: { enabled: false } }));
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow(
      "package-manifest.json#/mcp: mcp is no longer a manifest member: set tool_enabled on a workflow to ship it switched on as a tool",
    );
  });
});
