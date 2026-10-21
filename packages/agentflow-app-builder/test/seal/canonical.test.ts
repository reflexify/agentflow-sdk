import { describe, expect, it } from "vitest";
import { SealError } from "../../src/errors.js";
import { canonicalJson } from "../../src/seal/canonical.js";

describe("canonicalJson", () => {
  it("writes numbers in their shortest ECMAScript form", () => {
    expect(canonicalJson(JSON.parse("1e2"))).toBe("100");
    expect(canonicalJson(0.1)).toBe("0.1");
    expect(canonicalJson(-0)).toBe("0");
    expect(canonicalJson(1e21)).toBe("1e+21");
    expect(canonicalJson(5e-324)).toBe("5e-324");
    expect(canonicalJson([333333333.33333329, 1e30, 4.5, 2e-3, 1e-27])).toBe(
      "[333333333.3333333,1e+30,4.5,0.002,1e-27]",
    );
  });

  it("escapes control characters and writes the rest as it is", () => {
    const text = "\u0000\u0008\t\n\u000c\r\u001f\u007f \"\\/é😀";
    expect(canonicalJson(text)).toBe('"\\u0000\\b\\t\\n\\f\\r\\u001f\u007f \\"\\\\/é😀"');
  });

  it("sorts members by UTF-16 code units, not by code point", () => {
    expect(canonicalJson({ "ﬁ": 2, "😀": 1, b: 3, a: 4, "10": 5, "9": 6 })).toBe(
      '{"10":5,"9":6,"a":4,"b":3,"😀":1,"ﬁ":2}',
    );
  });

  it("sorts nested members and keeps array order", () => {
    expect(canonicalJson({ z: [{ b: 1, a: 2 }, null, true], a: {} })).toBe('{"a":{},"z":[{"a":2,"b":1},null,true]}');
  });

  it("refuses a number that is not finite", () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(() => canonicalJson({ value })).toThrow(SealError);
      expect(() => canonicalJson(value)).toThrow(expect.objectContaining({ code: "SEAL_JSON_INVALID" }));
    }
  });

  it("refuses a value that is not JSON", () => {
    expect(() => canonicalJson(undefined)).toThrow(expect.objectContaining({ code: "SEAL_JSON_INVALID" }));
    expect(() => canonicalJson(() => 1)).toThrow(expect.objectContaining({ code: "SEAL_JSON_INVALID" }));
  });
});
