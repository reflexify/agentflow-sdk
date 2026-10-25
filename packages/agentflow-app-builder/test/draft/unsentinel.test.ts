import { describe, expect, it } from "vitest";
import { unsentinel } from "../../src/draft/unsentinel.js";
import { CliError } from "../../src/errors.js";
import { translate } from "../../src/core.js";

const refusal = (run: () => unknown): CliError => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(CliError);
    return error as CliError;
  }
  throw new Error("expected a refusal");
};

describe("unsentinel", () => {
  it.each([
    ["@obj:entity:task", "${entity:task}"],
    ["@obj:workflow:x", "${workflow:x}"],
    ["@obj:agent:x", "${agent:x}"],
    ["@obj:dashboard:x", "${dashboard:x}"],
    ["@obj:document_template:x", "${document_template:x}"],
    ["@obj:skill:account_access", "${skill:account_access}"],
    ["@obj:entity_view:task/open", "${entity_view:task/open}"],
    ["@param:x", "${param:x}"],
  ])("turns %s into %s, which translate turns back", (sentinel, reference) => {
    const out = unsentinel(sentinel, "objects/entity/task.json", "/a");
    expect(out).toBe(reference);
    expect(translate(out, "x", "")).toBe(sentinel);
  });

  it("leaves a plain string, a number and null as they are", () => {
    expect(unsentinel({ a: ["plain", 3, null, true] }, "f.json", "")).toEqual({ a: ["plain", 3, null, true] });
  });

  it("walks arrays and objects", () => {
    expect(unsentinel({ list: [{ entity: "@obj:entity:task" }] }, "f.json", "")).toEqual({ list: [{ entity: "${entity:task}" }] });
  });

  it.each([
    ["@@literal"],
    ["@req:entity:user"],
    ["@dep:acme/other:entity:x"],
    ["@sys:now"],
    ["@obj:form:task"],
  ])("refuses %s in a generic position, naming the file and the place", (value) => {
    const error = refusal(() => unsentinel({ nodes: [{ value }] }, "objects/workflow/w.json", ""));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.message.startsWith("objects/workflow/w.json#/nodes/0/value: ")).toBe(true);
    expect(error.files).toEqual(["objects/workflow/w.json"]);
  });

  it("refuses a string the builder would read as a reference", () => {
    expect(refusal(() => unsentinel("Hello ${name}", "f.json", "/x")).code).toBe("DRAFT_UNSUPPORTED");
  });

  it("hands a special member to its own function", () => {
    const out = unsentinel({ target_entity_id: "@req:entity:user", other: "@param:x" }, "f.json", "", {
      target_entity_id: (value) => `seen ${String(value)}`,
    });
    expect(out).toEqual({ target_entity_id: "seen @req:entity:user", other: "${param:x}" });
  });
});
