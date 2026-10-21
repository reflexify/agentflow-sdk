import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { at, checkReferences, objectPath, parameterOf, renderFiles, targetEntity, translate, writeFiles } from "../src/core.js";

describe("translate", () => {
  it("turns a whole reference into its sentinel", () => {
    expect(translate("${entity:task}", "f", "")).toBe("@obj:entity:task");
    expect(translate("${param:project_users}", "f", "")).toBe("@param:project_users");
    expect(translate("${skill:soan-thao}", "f", "")).toBe("@obj:skill:soan_thao");
  });
  it("translates dashboard and entity_view references", () => {
    expect(translate("${dashboard:projects_overview}", "f", "")).toBe("@obj:dashboard:projects_overview");
    expect(translate("${entity_view:task/open}", "f", "")).toBe("@obj:entity_view:task/open");
    expect(() => translate("${entity_view:task}", "f", "/x")).toThrow("f#/x: an authoring reference the builder does not know");
    expect(() => translate("${entity:task/open}", "f", "/x")).toThrow("f#/x: an authoring reference the builder does not know");
  });
  it("refuses a reference after the first character", () => {
    expect(() => translate("x ${entity:task}", "f.json", "/a")).toThrow("f.json#/a: an authoring reference the builder does not know");
  });
  it("refuses a string that reads as a sentinel", () => {
    expect(() => translate("@obj:entity:task", "f.json", "/a")).toThrow("f.json#/a: a string starting with @ reads as a sentinel");
  });
  it("refuses a hyphen in a non-skill key", () => {
    expect(() => translate("${entity:a-b}", "f.json", "/a")).toThrow("entity key a-b holds a hyphen");
  });
  it("walks arrays and objects, escaping pointers", () => {
    expect(translate({ "a/b": ["${entity:task}"] }, "f", "")).toEqual({ "a/b": ["@obj:entity:task"] });
    expect(at("/x", "a/b~c")).toBe("/x/a~1b~0c");
  });
});

describe("parameterOf and targetEntity", () => {
  it("requires a parameter", () => {
    expect(parameterOf("${param:p}", "f", "")).toBe("@param:p");
    expect(() => parameterOf("${entity:task}", "f.json", "/to")).toThrow("f.json#/to: must be a ${param:key}");
  });
  it("maps the reserved Users and Units ids", () => {
    expect(targetEntity("ffffffff-0000-0000-0000-000000000001", "f", "")).toBe("@req:entity:user");
    expect(targetEntity("ffffffff-0000-0000-0000-000000000003", "f", "")).toBe("@req:entity:org_unit");
    expect(targetEntity("${entity:project}", "f", "")).toBe("@obj:entity:project");
  });
});

describe("objectPath and checkReferences", () => {
  it("places an object by kind and key", () => {
    expect(objectPath("entity_field:task/title")).toBe("objects/entity_field/task__title.json");
  });
  it("refuses a sentinel naming nothing", () => {
    const manifest = { parameters: [{ key: "p" }], requires: { entities: [{ key: "user" }] } };
    expect(() => checkReferences([["entity:task", { x: "@obj:entity:nope" }]], manifest)).toThrow(
      "objects/entity/task.json#/x: @obj:entity:nope names no object, parameter or required entity of the package",
    );
    expect(() => checkReferences([["entity:task", { x: "@param:p", y: "@req:entity:user" }]], manifest)).not.toThrow();
  });
});

describe("renderFiles and writeFiles", () => {
  it("writes every file with a trailing newline, replacing a stale object", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "builder-"));
    try {
      fs.mkdirSync(path.join(dir, "objects/entity"), { recursive: true });
      fs.writeFileSync(path.join(dir, "objects/entity/stale.json"), "{}\n");
      const files = renderFiles({ id: "x" }, [["entity:task", { name: "Task" }]]);
      expect(writeFiles(dir, files)).toBe(Object.keys(files).length);
      for (const rel of Object.keys(files)) {
        const text = fs.readFileSync(path.join(dir, rel), "utf8");
        expect(text).toBe(files[rel]);
        expect(text.endsWith("\n")).toBe(true);
      }
      expect(fs.existsSync(path.join(dir, "objects/entity/stale.json"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
