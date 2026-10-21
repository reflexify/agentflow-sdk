import { createHash, sign as cryptoSign } from "node:crypto";
import { SealError } from "../errors.js";
import { canonicalJson } from "./canonical.js";
import type { SigningKey } from "./keys.js";
import { checkPayload, parseJsonFile } from "./payload.js";
import { LIMITS, writeStoredZip } from "./zip.js";

export type Sealed = {
  fileName: string;
  bytes: Buffer;
  digest: string;
  signer: string;
  id: string;
  version: string;
};

const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

export function sign(files: Map<string, Buffer>, key: SigningKey): Sealed {
  const { id, version, fileName } = checkPayload(files);
  const paths = [...files.keys()].sort();
  const hashes: Record<string, string> = {};
  for (const path of paths) {
    const bytes = files.get(path)!;
    const hashed = path.startsWith("ui/") ? bytes : Buffer.from(canonicalJson(parseJsonFile(path, bytes)), "utf8");
    hashes[path] = sha256(hashed);
  }
  const hashesBytes = Buffer.from(canonicalJson({ formatVersion: 1, files: hashes }), "utf8");
  const sig = cryptoSign(null, hashesBytes, key.privateKey).toString("base64");
  const signature = Buffer.from(JSON.stringify({ alg: "ed25519", keyId: key.keyId, sig }), "utf8");
  const bytes = writeStoredZip([
    ...paths.map((p) => [p, files.get(p)!] as const),
    ["hashes.json", hashesBytes],
    ["signature", signature],
  ]);
  if (bytes.length > LIMITS.archive) {
    throw new SealError("SEAL_LIMIT_EXCEEDED", `the archive is ${bytes.length} bytes; the limit is ${LIMITS.archive}`);
  }
  return { fileName, bytes, digest: sha256(hashesBytes), signer: key.keyId, id, version };
}
