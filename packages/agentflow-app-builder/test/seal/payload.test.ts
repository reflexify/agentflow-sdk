import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkPayload, readPayloadDir } from "../../src/seal/payload.js";

const refusal = (code: string, files?: string[]) =>
  expect.objectContaining(files ? { code, files } : { code });

const made: string[] = [];
function payloadDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "payload-"));
  made.push(dir);
  mkdirSync(join(dir, "objects/entity"), { recursive: true });
  mkdirSync(join(dir, "ui"));
  writeFileSync(join(dir, "manifest.json"), "{}");
  writeFileSync(join(dir, "objects/entity/case.json"), "{}");
  writeFileSync(join(dir, "ui/index.js"), "export {};\n");
  return dir;
}
afterEach(() => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("readPayloadDir", () => {
  it("reads the manifest, objects and ui by published path", () => {
    expect([...readPayloadDir(payloadDir()).keys()]).toEqual([
      "manifest.json",
      "objects/entity/case.json",
      "ui/index.js",
    ]);
  });

  it("refuses a .DS_Store at the root and under objects, naming each path", () => {
    const dir = payloadDir();
    writeFileSync(join(dir, ".DS_Store"), "x");
    writeFileSync(join(dir, "objects/.DS_Store"), "x");
    expect(() => readPayloadDir(dir)).toThrow(
      refusal("SEAL_FILE_UNLISTED", [".DS_Store", "objects/.DS_Store"]),
    );
  });

  it("refuses a file at the root other than manifest.json", () => {
    const dir = payloadDir();
    writeFileSync(join(dir, "README.md"), "x");
    expect(() => readPayloadDir(dir)).toThrow(refusal("SEAL_FILE_UNLISTED", ["README.md"]));
  });

  it("refuses a symlink inside ui", () => {
    const dir = payloadDir();
    symlinkSync(join(dir, "manifest.json"), join(dir, "ui/link.js"));
    expect(() => readPayloadDir(dir)).toThrow(refusal("SEAL_FILE_UNLISTED", ["ui/link.js"]));
  });

  it("gives no entries for an empty folder", () => {
    const dir = payloadDir();
    mkdirSync(join(dir, "ui/empty"));
    expect([...readPayloadDir(dir).keys()]).not.toContain("ui/empty");
    expect(readPayloadDir(dir).size).toBe(3);
  });
});

describe("checkPayload", () => {
  const manifest = (over: Record<string, unknown> = {}) =>
    Buffer.from(JSON.stringify({ id: "acme/case-desk", version: "1.2.0", ...over }));
  const files = (over: Record<string, unknown> = {}) => new Map([["manifest.json", manifest(over)]]);

  it("names the archive after the id and the version", () => {
    expect(checkPayload(files())).toEqual({ id: "acme/case-desk", version: "1.2.0", fileName: "acme-case-desk-1.2.0.afpkg" });
    expect(checkPayload(files({ version: "1.0.0-rc.1+build.5" })).fileName).toBe("acme-case-desk-1.0.0-rc.1+build.5.afpkg");
  });

  it("refuses a missing or unparsable manifest", () => {
    expect(() => checkPayload(new Map())).toThrow(refusal("SEAL_MANIFEST_MISSING"));
    expect(() => checkPayload(new Map([["manifest.json", Buffer.from("{")]]))).toThrow(refusal("SEAL_MANIFEST_INVALID"));
    expect(() => checkPayload(new Map([["manifest.json", Buffer.from("[]")]]))).toThrow(refusal("SEAL_MANIFEST_INVALID"));
  });

  it("refuses an id the platform does not accept", () => {
    for (const id of ["acme", "Acme/case", "a/case", "acme/Case", "acme/case--desk", "acme/case-", "acme/1case", "acme-x/case", "acme/case_desk", "abcdefghijklmnopq/case", `acme/c${"a".repeat(40)}`, 7]) {
      expect(() => checkPayload(files({ id })), String(id)).toThrow(refusal("SEAL_MANIFEST_INVALID"));
    }
    expect(checkPayload(files({ id: `abcdefghijklmnop/c${"a".repeat(39)}` })).id).toContain("/");
  });

  it("refuses a version that is not SemVer", () => {
    for (const version of ["1.2", "01.2.3", "v1.2.3", "1.2.3-", "", 3]) {
      expect(() => checkPayload(files({ version })), String(version)).toThrow(refusal("SEAL_VERSION_INVALID"));
    }
  });

  it("refuses a path the platform refuses", () => {
    const bad = files();
    bad.set("objects/é.json", Buffer.from("{}"));
    expect(() => checkPayload(bad)).toThrow(refusal("SEAL_PATH_INVALID", ["objects/é.json"]));
  });

  it("refuses a non-ui file that is not JSON, naming it, and accepts any ui bytes", () => {
    const bad = files();
    bad.set("objects/entity/case.json", Buffer.from("{ nope"));
    expect(() => checkPayload(bad)).toThrow(refusal("SEAL_JSON_INVALID", ["objects/entity/case.json"]));
    const ok = files();
    ok.set("ui/index.js", Buffer.from([0xff, 0xfe, 0x00]));
    expect(checkPayload(ok).id).toBe("acme/case-desk");
  });

  it("refuses a byte order mark, as the platform does", () => {
    const bad = files();
    bad.set("objects/a.json", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("{}")]));
    expect(() => checkPayload(bad)).toThrow(refusal("SEAL_JSON_INVALID"));
  });

  it("holds the limits", () => {
    const tooMany = files();
    for (let i = 0; i < 1998; i++) tooMany.set(`ui/f${i}.js`, Buffer.alloc(0));
    expect(() => checkPayload(tooMany)).toThrow(refusal("SEAL_LIMIT_EXCEEDED"));
    const nearly = files();
    for (let i = 0; i < 1997; i++) nearly.set(`ui/f${i}.js`, Buffer.alloc(0));
    expect(checkPayload(nearly).id).toBe("acme/case-desk");

    const big = files();
    big.set("ui/big.js", Buffer.alloc(5_000_001));
    expect(() => checkPayload(big)).toThrow(refusal("SEAL_LIMIT_EXCEEDED", ["ui/big.js"]));

    const total = files();
    for (let i = 0; i < 21; i++) total.set(`ui/b${i}.js`, Buffer.alloc(5_000_000));
    expect(() => checkPayload(total)).toThrow(refusal("SEAL_LIMIT_EXCEEDED"));
  });
});
