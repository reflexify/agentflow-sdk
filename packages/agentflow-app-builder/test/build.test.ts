import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };

describe("buildPackage", () => {
  it("discovers every entity file and emits a manifest without ui", () => {
    const files = buildPackage({ configDir, sections: empty });
    const manifest = JSON.parse(files["manifest.json"]!);
    expect("ui" in manifest).toBe(false);
    expect(manifest.objects.map((o: { key: string }) => o.key)).toContain("entity:contact");
    expect(Object.keys(files)).toContain("objects/entity/note.json");
  });
  it("refuses an entity member it has no rule for", () => {
    expect(() => buildPackage({ configDir: path.join(configDir, "../../bad-member/config"), sections: empty })).toThrow(
      "entities/note.json#/colour: a member the builder has no rule for",
    );
  });
});

describe("entityOrder", () => {
  const keys = (files: Record<string, string>): string[] => JSON.parse(files["manifest.json"]!).objects.map((o: { key: string }) => o.key);
  it("lists entities sorted unless an order is given", () => {
    expect(keys(buildPackage({ configDir, sections: empty })).filter((k) => k.startsWith("entity:"))).toEqual(["entity:contact", "entity:note"]);
    const files = buildPackage({ configDir, sections: empty, entityOrder: ["note", "contact"] });
    expect(keys(files).filter((k) => k.startsWith("entity:"))).toEqual(["entity:note", "entity:contact"]);
  });
  it("refuses an order that does not name the entity files", () => {
    expect(() => buildPackage({ configDir, sections: empty, entityOrder: ["note"] })).toThrow("entities#: holds contact,note where entityOrder names note");
  });
});

describe("discovery", () => {
  const copy = (): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    return dir;
  };
  it.each(["entities", "agents", "skills"])("refuses a file in %s that is not .json (.SKILL.md for skills)", (where) => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, where, "stray.txt"), "");
    const kind = where === "skills" ? ".SKILL.md" : ".json";
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow(`${where}#: stray.txt is not a ${kind} file`);
  });
  it("refuses a file in dashboards that is not .json, and emits a dashboard after the entities", () => {
    const dir = copy();
    fs.mkdirSync(path.join(dir, "dashboards"));
    fs.writeFileSync(path.join(dir, "dashboards", "b.json"), JSON.stringify({ key: "b", name: "B", tiles: [] }));
    fs.writeFileSync(path.join(dir, "dashboards", "a.json"), JSON.stringify({ key: "a", name: "A", tiles: [] }));
    const files = buildPackage({ configDir: dir, sections: empty });
    const keys = JSON.parse(files["manifest.json"]!).objects.map((o: { key: string }) => o.key);
    expect(keys.slice(-2)).toEqual(["dashboard:a", "dashboard:b"]);
    expect(Object.keys(files)).toContain("objects/dashboard/a.json");
    fs.writeFileSync(path.join(dir, "dashboards", "stray.txt"), "");
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow("dashboards#: stray.txt is not a .json file");
  });
  it("ignores dotfiles", () => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, "entities", ".DS_Store"), "");
    expect(Object.keys(buildPackage({ configDir: dir, sections: empty }))).toContain("objects/entity/note.json");
  });
});

describe("an entity file's required members", () => {
  const without = (member: string, value?: unknown): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "entities", "note.json");
    const entity = JSON.parse(fs.readFileSync(file, "utf8"));
    if (value === undefined) delete entity[member];
    else entity[member] = value;
    fs.writeFileSync(file, JSON.stringify(entity));
    return dir;
  };
  it.each([
    ["name", undefined, "/name: a non-empty string"],
    ["name", 3, "/name: a non-empty string"],
    ["fields", undefined, "/fields: an array of fields"],
    ["fields", {}, "/fields: an array of fields"],
    ["views", undefined, "/views: an array of views"],
    ["access", undefined, "/access: an object with a mode and grants"],
    ["access", { mode: "restricted", grants: {} }, "/access/grants: must be an array"],
    ["access", { grants: [] }, "/access/mode: one of everyone, restricted"],
    ["access", { mode: "open", grants: [] }, "/access/mode: one of everyone, restricted"],
  ])("refuses %s %j with a location", (member, value, message) => {
    expect(() => buildPackage({ configDir: without(member, value), sections: empty })).toThrow(`entities/note.json#${message}`);
  });
});

describe("entity invariants", () => {
  const withNote = (members: object): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "entities", "note.json");
    fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), ...members }));
    return dir;
  };
  const rules = (groupId: string) => ({ rules: [{ key: "frozen", message: "Frozen", condition: { join: "and", leaves: [
    { kind: "write", write: { op: "actor", negate: true, test: { kind: "in_group", group_id: groupId } } }] } }] });
  it("adds rules and a stage model after conversation, against the manifest's parameters", () => {
    const stage = { stage_model: { status_field: "kind", transitions: [] } };
    const conversation = { conversation: { messages: { entity_id: "${entity:contact}", via: "ticket" } } };
    const files = buildPackage({ configDir: withNote({ ...conversation, ...stage, ...rules("${param:support_group_id}") }), sections: empty });
    const note = JSON.parse(files["objects/entity/note.json"]!);
    expect(Object.keys(note).slice(-3)).toEqual(["conversation", "rules", "stage_model"]);
    expect(note.rules[0].condition.leaves[0].write.test.group_id).toBe("@param:support_group_id");
  });
  it("refuses a grant to a parameter that is not a group_ref of the manifest", () => {
    const access = (id: string) => ({ access: { mode: "restricted", grants: [{ principal: { kind: "group", id }, operations: [{ operation: "read", scope: "organization" }] }] } });
    expect(() => buildPackage({ configDir: withNote(access("${param:support_group_id}")), sections: empty })).not.toThrow();
    expect(() => buildPackage({ configDir: withNote(access("${param:automation_principal_id}")), sections: empty })).toThrow(
      "entities/note.json#/access/grants/0/principal/id: automation_principal_id is not a group_ref parameter",
    );
  });
  it("refuses a group that is not a group_ref parameter of the manifest", () => {
    expect(() => buildPackage({ configDir: withNote(rules("${param:automation_principal_id}")), sections: empty })).toThrow(
      "entities/note.json#/rules/0/condition/leaves/0/write/test/group_id: automation_principal_id is not a group_ref parameter",
    );
  });
});

