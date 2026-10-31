import { describe, expect, it } from "vitest";
import { entityObjects } from "../src/entity.js";

const entity = (extra: Record<string, unknown> = {}) => ({
  key: "item",
  name: "Item",
  fields: [
    { key: "code", type: "text", label: "Code" },
    { key: "label", type: "text", label: "Label" },
    { key: "tags", type: "multi_select", label: "Tags", enum_values: ["a", "b"] },
  ],
  natural_key: [["code"]],
  views: [],
  access: { mode: "everyone", grants: [] },
  ...extra,
});

const build = (extra: Record<string, unknown>) => {
  const sources = new Map([["item", entity(extra) as never]]);
  const { objects } = entityObjects("unused", "item", ["item"], new Map(), sources);
  return objects.find(([key]) => key === "entity:item")![1] as Record<string, unknown>;
};

describe("entity seed", () => {
  it("copies seed into the entity body as written", () => {
    const seed = [{ code: "A-1", label: "First", tags: ["a", "b"] }, { code: "A-2" }];
    expect(build({ seed }).seed).toEqual(seed);
  });

  it("writes no seed member when the file has none", () => {
    expect("seed" in build({})).toBe(false);
  });

  it.each([
    ["a non-array", { code: "A-1" }, "#/seed"],
    ["a non-object item", ["A-1"], "#/seed/0"],
    ["a string containing ${", [{ code: "A-1", label: "x ${param:p} y" }], "#/seed/0/label"],
    ["a string starting with @", [{ code: "@obj:entity:item", label: "x" }], "#/seed/0/code"],
    ["a nested string containing ${", [{ code: "A-1", tags: ["a", "${b}"] }], "#/seed/0/tags/1"],
    ["more than 1,000 items", Array.from({ length: 1001 }, (_, i) => ({ code: `A-${i}` })), "#/seed"],
  ])("refuses a seed that is not literal: %s", (_name, seed, pointer) => {
    expect(() => build({ seed })).toThrow(`entities/item.json${pointer}: `);
  });

  it("accepts exactly 1,000 items", () => {
    const seed = Array.from({ length: 1000 }, (_, i) => ({ code: `A-${i}` }));
    expect(build({ seed }).seed).toHaveLength(1000);
  });
});
