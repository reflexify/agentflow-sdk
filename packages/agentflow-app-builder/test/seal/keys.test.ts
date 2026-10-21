import { generateKeyPairSync } from "node:crypto";
import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { CliError } from "../../src/errors.js";
import { checkKeyId, findKey, keyFromSeed, keygen, readKeyFile } from "../../src/seal/keys.js";

const refusal = (code: string) => expect.objectContaining({ code });
const posix = process.platform !== "win32";

const made: string[] = [];
function scratch(): string {
  const dir = mkdtempSync(join(tmpdir(), "keys-"));
  made.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const rsaPem = () =>
  generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs8", format: "pem" }) as string;

describe("keygen and readKeyFile", () => {
  it.skipIf(!posix)("writes a private file that reads back", () => {
    const out = join(scratch(), "keys/acme-1.pem");
    const made = keygen("acme-1", out);
    expect(made.file).toBe(out);
    expect(made.keyId).toBe("acme-1");
    expect(statSync(out).mode & 0o777).toBe(0o600);
    const key = readKeyFile(out, "acme-1");
    expect(key.keyId).toBe("acme-1");
  });

  it("refuses to overwrite and leaves the file as it was", () => {
    const out = join(scratch(), "k.pem");
    keygen("k", out);
    const before = readFileSync(out, "utf8");
    expect(() => keygen("k", out)).toThrow(refusal("KEY_EXISTS"));
    expect(readFileSync(out, "utf8")).toBe(before);
  });

  it("refuses a key id that is not a name", () => {
    expect(() => keygen("a b", join(scratch(), "k.pem"))).toThrow(refusal("KEY_ID_INVALID"));
  });

  it.skipIf(!posix)("refuses a file other users can read, and says how to fix it", () => {
    const out = join(scratch(), "k.pem");
    keygen("k", out);
    for (const mode of [0o644, 0o640]) {
      chmodSync(out, mode);
      expect(() => readKeyFile(out, "k")).toThrow(refusal("KEY_PERMISSIONS"));
      expect(() => readKeyFile(out, "k")).toThrow(/chmod 600/);
    }
  });

  it("refuses a key that is not ed25519", () => {
    const file = join(scratch(), "rsa.pem");
    writeFileSync(file, rsaPem(), { mode: 0o600 });
    expect(() => readKeyFile(file, "k")).toThrow(refusal("KEY_INVALID"));
  });

  it("refuses a file that is not a key", () => {
    const file = join(scratch(), "junk.pem");
    writeFileSync(file, "not a key", { mode: 0o600 });
    expect(() => readKeyFile(file, "k")).toThrow(refusal("KEY_INVALID"));
  });

  it("refuses a file that is not there", () => {
    expect(() => readKeyFile(join(scratch(), "none.pem"), "k")).toThrow(refusal("KEY_MISSING"));
  });

  it("is a CliError", () => {
    expect(() => readKeyFile(join(scratch(), "none.pem"), "k")).toThrow(CliError);
  });
});

describe("findKey", () => {
  it("returns the ed25519 key among other files", () => {
    const keys = scratch();
    const ed = join(keys, "acme-1.pem");
    keygen("acme-1", ed);
    writeFileSync(join(keys, "private.pem"), rsaPem(), { mode: 0o600 });
    writeFileSync(join(keys, "public.jwk.json"), "{}");
    writeFileSync(join(keys, "broken.pem"), "nonsense");
    expect(findKey(keys)).toBe(ed);
  });

  it("refuses an empty or missing folder", () => {
    expect(() => findKey(scratch())).toThrow(refusal("KEY_MISSING"));
    expect(() => findKey(join(scratch(), "keys"))).toThrow(refusal("KEY_MISSING"));
  });

  it("refuses a folder with only keys of another type", () => {
    const keys = scratch();
    writeFileSync(join(keys, "private.pem"), rsaPem(), { mode: 0o600 });
    expect(() => findKey(keys)).toThrow(refusal("KEY_MISSING"));
  });

  it("refuses two ed25519 keys and names both", () => {
    const keys = scratch();
    keygen("one", join(keys, "one.pem"));
    keygen("two", join(keys, "two.pem"));
    let error: unknown;
    try {
      findKey(keys);
    } catch (e) {
      error = e;
    }
    expect(error).toEqual(refusal("KEY_AMBIGUOUS"));
    expect((error as CliError).message).toContain("one.pem");
    expect((error as CliError).message).toContain("two.pem");
  });
});

describe("checkKeyId", () => {
  it("refuses an empty id and one with whitespace", () => {
    for (const id of ["", "a b", "a\tb"]) {
      expect(() => checkKeyId(id)).toThrow(refusal("KEY_ID_INVALID"));
    }
  });

  it("accepts a name", () => {
    expect(() => checkKeyId("acme-1")).not.toThrow();
  });
});

describe("keyFromSeed", () => {
  it("refuses a seed of the wrong length", () => {
    expect(() => keyFromSeed("k", Buffer.alloc(31))).toThrow(refusal("KEY_INVALID"));
  });
});
