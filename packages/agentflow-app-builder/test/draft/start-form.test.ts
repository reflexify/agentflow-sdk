import { describe, expect, it } from "vitest";
import { workflowSource } from "../../src/draft/sections.js";
import type { Draft } from "../../src/draft/manifest.js";

const body = (x: string) => ({
  schemaVersion: 1, name: "W", description: "d", runAs: "initiator", exposedSteps: [], start: "start", end: ["done"],
  nodes: [], edges: [],
  inputSchema: { type: "object", properties: { a: { type: "string", format: "entity", "x-entity": x } } },
});
const draftOf = (b: object) => ({ take: () => structuredClone(b), grants: [], takeGrant: () => {} }) as unknown as Draft;

describe("a start form's record picker in a draft", () => {
  it("reads the key form back as the entity key", () => {
    for (const [written, key] of [["@obj.key:entity:note", "note"], ["@req.key:entity:user", "user"]]) {
      const out = workflowSource(draftOf(body(written!)), "w", ["note"]);
      expect((out.source.input_schema as any).properties.a["x-entity"]).toBe(key);
    }
  });
  it("refuses an entity outside the draft", () => {
    expect(() => workflowSource(draftOf(body("@obj.key:entity:ghost")), "w", ["note"])).toThrow("not an entity of the package");
  });
});
