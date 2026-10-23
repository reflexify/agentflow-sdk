import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CONFIG_MEMBERS } from "../src/members.js";

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src");
const holders = ["assets", "assistant", "dashboard", "entity", "invariants", "launcher", "manifest", "workflow"];
const read = (name: string): string => fs.readFileSync(path.join(src, `${name}.ts`), "utf8");

describe("CONFIG_MEMBERS", () => {
  it("knows the assistant member and its skills key", () => {
    expect(CONFIG_MEMBERS.manifest).toContain("assistant");
    expect(CONFIG_MEMBERS.assistant).toContain("skills");
  });
  it("holds configVersion among the manifest's members", () => {
    expect(CONFIG_MEMBERS.manifest).toContain("configVersion");
  });
  it("names every context the builder checks", () => {
    for (const context of [
      "manifest", "entity", "field", "view", "column", "constraints", "rollup", "access", "grant", "operation",
      "create_form", "workflow", "trigger", "action", "agent", "dashboard", "skill_frontmatter", "rules",
      "stage_model", "work",
    ]) {
      expect(CONFIG_MEMBERS, context).toHaveProperty(context);
    }
  });
  it.each(holders)("%s.ts takes every member list from the catalogue", (name) => {
    const text = read(name)
      .split("\n")
      .filter((line) => !line.includes("DECOMPILABLE"))
      .join("\n");
    expect(text, "a list of members written out in the source").not.toMatch(
      /onlyMembers\([^;\n]*\[\s*"|\.object\([^;\n]*\[\s*"|new Set(<[^>]*>)?\(\[\s*"|_MEMBERS(: [^=]+)? = (\[|new Set(<[^>]*>)?\(\[)/,
    );
    if (/onlyMembers\(|\.object\(/.test(text)) expect(text).toContain("CONFIG_MEMBERS");
  });
  it("is read by the builder for every context but the agent's, which it passes through", () => {
    const used = holders.map(read).join("\n");
    for (const context of Object.keys(CONFIG_MEMBERS)) {
      if (context === "agent") continue;
      const [family, kind] = context.split(".");
      const reads = kind === undefined ? `CONFIG_MEMBERS.${context}` : `CONFIG_MEMBERS[\`${family}.`;
      expect(used, context).toContain(reads);
    }
  });
});
