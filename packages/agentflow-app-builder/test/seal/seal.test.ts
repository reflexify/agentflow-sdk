import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { keyFromSeed } from "../../src/seal/keys.js";
import { readPayloadDir } from "../../src/seal/payload.js";
import { sign } from "../../src/seal/seal.js";
import { readZip } from "../../src/seal/zip.js";

const vector = (name: string) => new URL(`../vectors/${name}/`, import.meta.url);
const key = () => keyFromSeed("vector-key", Buffer.alloc(32, 7));

describe.each(["basic", "unicode"])("the %s vector", (name) => {
  const expected = JSON.parse(readFileSync(new URL("expected.json", vector(name)), "utf8"));
  const files = () => readPayloadDir(new URL("payload", vector(name)).pathname);

  it("seals to the bytes the platform's sealer writes", () => {
    const sealed = sign(files(), key());
    expect(sealed.fileName).toBe(expected.fileName);
    expect(sealed.digest).toBe(expected.digest);
    expect(readZip(sealed.bytes).get("signature")!.toString("utf8")).toBe(expected.signature);
    expect(createHash("sha256").update(sealed.bytes).digest("hex")).toBe(expected.archiveSha256);
  });

  it("is deterministic and carries the payload files byte for byte", () => {
    const sealed = sign(files(), key());
    expect(sign(files(), key()).bytes.equals(sealed.bytes)).toBe(true);
    const read = readZip(sealed.bytes);
    for (const [path, bytes] of files()) expect(read.get(path)!.equals(bytes)).toBe(true);
    expect([...read.keys()].slice(-2)).toEqual(["hashes.json", "signature"]);
  });
});

describe("sign", () => {
  it("signs the hashes with the key and reports the key id", () => {
    const files = readPayloadDir(new URL("payload", vector("basic")).pathname);
    const sealed = sign(files, key());
    const read = readZip(sealed.bytes);
    const { alg, keyId, sig } = JSON.parse(read.get("signature")!.toString("utf8"));
    expect([alg, keyId, sealed.signer, sealed.id, sealed.version]).toEqual([
      "ed25519",
      "vector-key",
      "vector-key",
      "acme/case-desk",
      "1.2.0",
    ]);
    const publicKey = createPublicKey(key().privateKey);
    expect(verify(null, read.get("hashes.json")!, publicKey, Buffer.from(sig, "base64"))).toBe(true);
    expect(sealed.digest).toBe(createHash("sha256").update(read.get("hashes.json")!).digest("hex"));
  });

  it("hashes a JSON file in its canonical form and a ui file as it is", () => {
    const files = readPayloadDir(new URL("payload", vector("basic")).pathname);
    const hashes = JSON.parse(readZip(sign(files, key()).bytes).get("hashes.json")!.toString("utf8"));
    const sha = (text: string) => createHash("sha256").update(text).digest("hex");
    expect(hashes.formatVersion).toBe(1);
    expect(hashes.files["objects/entity/case.json"]).toBe(sha('{"count":100,"name":"Case","ratio":0.1}'));
    expect(hashes.files["ui/index.js"]).toBe(sha("export function mount() { return () => {}; }\n"));
  });

  it("refuses a seed or key id the platform's key refuses", () => {
    expect(() => keyFromSeed("", Buffer.alloc(32))).toThrow(expect.objectContaining({ code: "KEY_ID_INVALID" }));
    expect(() => keyFromSeed("a b", Buffer.alloc(32))).toThrow(expect.objectContaining({ code: "KEY_ID_INVALID" }));
    expect(() => keyFromSeed("k", Buffer.alloc(31))).toThrow(expect.objectContaining({ code: "KEY_INVALID" }));
  });
});
