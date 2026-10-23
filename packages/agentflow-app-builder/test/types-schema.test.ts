import { describe, expect, it } from "vitest";
import { schemaToTs } from "../src/types/schema.js";

describe("schemaToTs", () => {
  it("maps each scalar type to its TypeScript type", () => {
    expect(schemaToTs({ type: "string" }, "")).toBe("string");
    expect(schemaToTs({ type: "number" }, "")).toBe("number");
    expect(schemaToTs({ type: "integer" }, "")).toBe("number");
    expect(schemaToTs({ type: "boolean" }, "")).toBe("boolean");
    expect(schemaToTs({ type: "null" }, "")).toBe("null");
  });

  it("writes an enum as the union of its literals", () => {
    expect(schemaToTs({ enum: ["a", "it's", 2, true, null] }, "")).toBe("'a' | 'it\\'s' | 2 | true | null");
  });

  it("writes an array as its items' type, and unknown[] without items", () => {
    expect(schemaToTs({ type: "array", items: { type: "string" } }, "")).toBe("string[]");
    expect(schemaToTs({ type: "array", items: { type: ["string", "null"] } }, "")).toBe("(string | null)[]");
    expect(schemaToTs({ type: "array" }, "")).toBe("unknown[]");
  });

  it("writes an object as a literal type, its required properties without ?", () => {
    const schema = {
      type: "object",
      properties: { urgent: { type: "boolean" }, title: { type: "string" }, "two words": { type: "string" } },
      required: ["title"],
    };
    expect(schemaToTs(schema, "  ")).toBe("{\n    title: string;\n    'two words'?: string;\n    urgent?: boolean;\n  }");
  });

  it("nests an object one level deeper", () => {
    const schema = { type: "object", properties: { inner: { type: "object", properties: { n: { type: "integer" } } } } };
    expect(schemaToTs(schema, "")).toBe("{\n  inner?: {\n    n?: number;\n  };\n}");
  });

  it("writes an object with no properties as {}", () => {
    expect(schemaToTs({ type: "object" }, "")).toBe("{}");
  });

  it("adds an index signature for additionalProperties", () => {
    expect(schemaToTs({ type: "object", additionalProperties: true }, "")).toBe("{\n  [key: string]: unknown;\n}");
    expect(schemaToTs({ type: "object", additionalProperties: { type: "number" } }, "")).toBe("{\n  [key: string]: number;\n}");
    expect(schemaToTs({ type: "object", additionalProperties: false }, "")).toBe("{}");
  });

  it("keeps an index signature of a schema unknown beside properties, which it could not be assigned from", () => {
    const schema = { type: "object", properties: { a: { type: "string" } }, additionalProperties: { type: "number" } };
    expect(schemaToTs(schema, "")).toBe("{\n  a?: string;\n  [key: string]: unknown;\n}");
  });

  it("writes a list of types as their union", () => {
    expect(schemaToTs({ type: ["string", "null"] }, "")).toBe("string | null");
  });

  it("writes anyOf and oneOf as the union", () => {
    expect(schemaToTs({ anyOf: [{ type: "string" }, { type: "integer" }] }, "")).toBe("string | number");
    expect(schemaToTs({ oneOf: [{ const: "a" }, { type: "boolean" }] }, "")).toBe("'a' | boolean");
  });

  it("writes const as its literal", () => {
    expect(schemaToTs({ const: "fixed" }, "")).toBe("'fixed'");
    expect(schemaToTs({ const: 3 }, "")).toBe("3");
  });

  it("writes anything else as unknown, $ref included", () => {
    expect(schemaToTs({ $ref: "#/$defs/x" }, "")).toBe("unknown");
    expect(schemaToTs({}, "")).toBe("unknown");
    expect(schemaToTs(true, "")).toBe("unknown");
    expect(schemaToTs({ type: "tuple" }, "")).toBe("unknown");
    expect(schemaToTs({ not: { type: "string" } }, "")).toBe("unknown");
  });

  it("writes a description as a JSDoc line above its property", () => {
    const schema = { type: "object", properties: { title: { type: "string", description: "What it is about. */ Short\nplease." } } };
    expect(schemaToTs(schema, "")).toBe("{\n  /** What it is about. *\\/ Short please. */\n  title?: string;\n}");
  });
});
