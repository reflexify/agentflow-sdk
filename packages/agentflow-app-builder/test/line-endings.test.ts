import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { merge } from "../src/index.js";
import { code, edges, end, graph, lit, restricted, servicePrincipal, start, workflow } from "../src/workflow.js";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");

const SOURCE = "function main(inputs) {\n  const total = inputs.body;\n  return { total };\n}\n";
const SKILL = "---\nname: triage-notes\ndescription: Use when sorting new notes\n---\n\nRead the note.\n\nThen file it.\n";

// The same project twice: once with the text files an editor saves with LF, once with CRLF.
function buildWith(eol: "\n" | "\r\n"): Record<string, string> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-eol-"));
  fs.cpSync(configDir, dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "code"), { recursive: true });
  fs.writeFileSync(path.join(dir, "code", "total.js"), SOURCE.replace(/\n/g, eol));
  fs.writeFileSync(path.join(dir, "skills", "triage_notes.SKILL.md"), SKILL.replace(/\n/g, eol));
  const w = workflow(
    "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
    graph("Tiny", [start(), code("c", "Code", "code/total.js", [["body", lit("x")]], { type: "object" }), end("done", "Done")], edges(["e1", "start", "c"], ["e2", "c", "done"])),
  );
  return buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
}

describe("text files the build embeds in an object", () => {
  it("build to the same package from LF and from CRLF: a Code step's source and a skill's body", () => {
    const lf = buildWith("\n");
    const crlf = buildWith("\r\n");
    expect(crlf).toEqual(lf);
    expect(lf["objects/workflow/one.json"]).toContain(JSON.stringify(SOURCE).slice(1, -1));
    expect(JSON.parse(lf["objects/skill/triage_notes.json"]!).body).toBe("\nRead the note.\n\nThen file it.\n");
  });
});
