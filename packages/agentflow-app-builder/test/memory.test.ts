import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { convertDraft } from "../src/draft/convert.js";
import { writeStoredZip } from "../src/seal/zip.js";
import { listFiles } from "../src/ui.js";

const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };

const type = {
  key: "known_issue",
  name: "Known issue",
  describe: "A fault the support team already knows about",
  fields: { type: "object", properties: { symptom: { type: "string", title: "Symptom" } } },
  title: "{{ symptom }}",
  review: "changes",
  grants: [{ to: "everyone", level: "read" }, { to: "${param:support_group_id}", level: "review" }],
};
const relationship = {
  key: "affects",
  name: "Affects",
  description: "A known issue affects a ticket",
  from: { kind: "memory_type", id: "${memory_type:known_issue}" },
  to: { kind: "entity", id: "${entity:contact}" },
  review: "none",
};
const agent = {
  key: "triage",
  name: "Triage",
  profile: {
    model: "${param:support_group_id}",
    memorySave: { types: ["${memory_type:known_issue}"], orgWide: true },
  },
  read_limit: { entities: [], memory_types: ["${memory_type:known_issue}"] },
};

function app(files: Record<string, unknown>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-"));
  fs.cpSync(mini, path.join(dir, "config"), { recursive: true });
  for (const [rel, body] of Object.entries(files)) {
    const file = path.join(dir, "config", rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(body));
  }
  return path.join(dir, "config");
}

const build = (files: Record<string, unknown>) => buildPackage({ configDir: app(files), sections: empty });
const base = { "memory_types/known_issue.json": type, "memory_relationships/affects.json": relationship };

describe("an app's memory types and relationships", () => {
  it("builds a type and a relationship with sentinels", () => {
    const files = build({ ...base, "agents/triage.json": agent });
    const keys = JSON.parse(files["manifest.json"]!).objects.map((o: { key: string }) => o.key);
    expect(keys.indexOf("entity:note")).toBeLessThan(keys.indexOf("memory_type:known_issue"));
    expect(keys.indexOf("memory_type:known_issue")).toBeLessThan(keys.indexOf("memory_relationship:affects"));
    expect(keys.indexOf("memory_relationship:affects")).toBeLessThan(keys.indexOf("agent:triage"));
    expect(JSON.parse(files["objects/memory_type/known_issue.json"]!).grants).toEqual([
      { to: "everyone", level: "read" },
      { to: "@param:support_group_id", level: "review" },
    ]);
    expect(JSON.parse(files["objects/memory_relationship/affects.json"]!)).toMatchObject({
      from: { kind: "memory_type", id: "@obj:memory_type:known_issue" },
      to: { kind: "entity", id: "@obj:entity:contact" },
    });
    const body = JSON.parse(files["objects/agent/triage.json"]!);
    expect(body.profile.memorySave).toEqual({ types: ["@obj:memory_type:known_issue"], orgWide: true });
    expect(body.read_limit.memory_types).toEqual(["@obj:memory_type:known_issue"]);
  });

  const withType = (change: object) => ({ "memory_types/known_issue.json": { ...type, ...change } });
  const withEnd = (change: object) => ({ ...base, "memory_relationships/affects.json": { ...relationship, ...change } });
  const withAgent = (profile: object, limit: unknown = agent.read_limit) => ({
    ...base,
    "agents/triage.json": { ...agent, profile: { ...agent.profile, ...profile }, read_limit: limit },
  });
  const save = (change: object) => withAgent({ memorySave: { ...agent.profile.memorySave, ...change } });

  it.each<[string, Record<string, unknown>, string, string]>([
    ["a key in both folders", { ...base, "memory_relationships/known_issue.json": { ...relationship, key: "known_issue" } }, "memory_relationships#", "share one key space"],
    ["a grant to a literal group", withType({ grants: [{ to: "6f1c2f0e-0000-0000-0000-000000000001", level: "read" }] }), "memory_types/known_issue.json#/grants/0/to", "never names a group"],
    ["a grant to a parameter that is not a group", withType({ grants: [{ to: "${param:automation_principal_id}", level: "read" }] }), "#/grants/0/to", "not a group_ref"],
    ["a principal granted twice", withType({ grants: [{ to: "everyone", level: "read" }, { to: "everyone", level: "review" }] }), "#/grants/1/to", "named twice"],
    ["a grant level other than read or review", withType({ grants: [{ to: "everyone", level: "write" }] }), "#/grants/0/level", "read or review"],
    ["a title naming no field", withType({ title: "{{ nothing }}" }), "#/title", "not a field"],
    ["a field named about", withType({ fields: { type: "object", properties: { about: {} } } }), "#/fields/properties/about", "not a field key"],
    ["a search_on that names no field", withType({ search_on: ["nothing"] }), "#/search_on/0", "field of the type"],
    ["a search_on naming a number field after a text and a choice", withType({ fields: { type: "object", properties: { symptom: { type: "string", title: "Symptom" }, severity: { title: "Severity", oneOf: [{ const: "low", title: "Low" }] }, seen: { type: "number", title: "Seen" } } }, search_on: ["symptom", "severity", "seen"] }), "#/search_on/2", "not a text or choice field"],
    ["a search_on naming a date field", withType({ fields: { type: "object", properties: { on: { type: "string", format: "date", title: "On" } } }, title: "{{on}}", search_on: ["on"] }), "#/search_on/0", "not a text or choice field"],
    ["an unknown member of a type", withType({ colour: 1 }), "#/colour", "no rule for"],
    ["an unknown review mode", withType({ review: "sometimes" }), "#/review", "one of none, changes, all"],
    ["an end that is a memory type written as an entity", withEnd({ to: { kind: "entity", id: "${memory_type:known_issue}" } }), "#/to/id", "not an entity reference"],
    ["an end of kind memory_type naming an entity", withEnd({ from: { kind: "memory_type", id: "${entity:contact}" } }), "#/from/id", "${memory_type:"],
    ["an unknown member in memorySave", save({ colour: 1 }), "#/profile/memorySave/colour", "no rule for"],
    ["a memorySave saving nothing", save({ types: [] }), "#/profile/memorySave", "at least one"],
    ["a memorySave with no about and not orgWide", save({ orgWide: false }), "#/profile/memorySave/about", "orgWide"],
    ["a type named twice in memorySave", save({ types: ["${memory_type:known_issue}", "${memory_type:known_issue}"] }), "#/profile/memorySave/types/1", "named twice"],
    ["a memorySave type that is not a memory type", save({ types: ["${entity:contact}"] }), "#/profile/memorySave/types/0", "memory type"],
    ["instructions holding a carriage return", save({ instructions: "a\rb" }), "#/profile/memorySave/instructions", "plain text"],
    ["instructions holding a template", save({ instructions: "say {{ x }}" }), "#/profile/memorySave/instructions", "plain text"],
    ["a save the read limit does not cover", withAgent({}, { entities: [] }), "agents/triage.json#/read_limit/memory_types", "allowed to read"],
    ["a save into a deprecated type", { ...base, "memory_types/known_issue.json": { ...type, deprecated: true }, "agents/triage.json": agent }, "#/profile/memorySave/types/0", "deprecated"],
    ["a read limit memory type that is an entity", withAgent({}, { entities: [], memory_types: ["${entity:contact}"] }), "#/read_limit/memory_types/0", "memory type"],
  ])("refuses %s", (_name, files, where, message) => {
    expect(() => build(files)).toThrow(where);
    expect(() => build(files)).toThrow(message);
  });

  it("keeps line breaks in a definition's text and counts characters", () => {
    const files = build({ "memory_types/known_issue.json": { ...type, describe: "a\r\n\tb", never_store: ["x\ny"], name: "😀".repeat(200) } });
    expect(JSON.parse(files["objects/memory_type/known_issue.json"]!).describe).toBe("a\r\n\tb");
  });

  it("converts a draft with memory kinds back into the written folders", async () => {
    const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../fixtures/memory/package");
    const entries = listFiles(root).map((rel): [string, Buffer] => [rel, fs.readFileSync(path.join(root, rel))]);
    const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "memory-draft-")), "app");
    await convertDraft(writeStoredZip(entries), dir);
    const read = (rel: string) => JSON.parse(fs.readFileSync(path.join(dir, rel), "utf8"));
    expect(fs.readdirSync(path.join(dir, "config/memory_types"))).toEqual(["known_issue.json"]);
    expect(fs.readdirSync(path.join(dir, "config/memory_relationships"))).toEqual(["affects.json"]);
    expect(read("config/memory_types/known_issue.json").grants[1]).toEqual({ to: "${param:desk_users}", level: "review" });
    expect(read("config/memory_relationships/affects.json").to).toEqual({ kind: "entity", id: "${entity:ticket}" });
    const agent = read("config/agents/triage.json");
    expect(agent.profile.memorySave.types).toEqual(["${memory_type:known_issue}"]);
    expect(agent.read_limit.memory_types).toEqual(["${memory_type:known_issue}"]);
  }, 30_000);
});
