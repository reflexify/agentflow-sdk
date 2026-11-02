import { createHash, sign as cryptoSign } from "node:crypto";
import { SealError } from "../errors.js";
import { canonicalJson } from "./canonical.js";
import { checkPayload, parseJsonFile } from "./payload.js";
import { LIMITS, readZip, writeStoredZip } from "./zip.js";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
// `hashes.json` for a payload: a `ui/` file hashed as its bytes, any other over its canonical JSON.
function hashesOf(files) {
    const hashes = {};
    for (const path of [...files.keys()].sort()) {
        const bytes = files.get(path);
        const hashed = path.startsWith("ui/") ? bytes : Buffer.from(canonicalJson(parseJsonFile(path, bytes)), "utf8");
        hashes[path] = sha256(hashed);
    }
    return Buffer.from(canonicalJson({ formatVersion: 1, files: hashes }), "utf8");
}
export function sign(files, key) {
    const { id, version, fileName } = checkPayload(files);
    const paths = [...files.keys()].sort();
    const hashesBytes = hashesOf(files);
    const sig = cryptoSign(null, hashesBytes, key.privateKey).toString("base64");
    const signature = Buffer.from(JSON.stringify({ alg: "ed25519", keyId: key.keyId, sig }), "utf8");
    const bytes = writeStoredZip([
        ...paths.map((p) => [p, files.get(p)]),
        ["hashes.json", hashesBytes],
        ["signature", signature],
    ]);
    if (bytes.length > LIMITS.archive) {
        throw new SealError("SEAL_LIMIT_EXCEEDED", `the archive is ${bytes.length} bytes; the limit is ${LIMITS.archive}`);
    }
    return { fileName, bytes, digest: sha256(hashesBytes), signer: key.keyId, id, version };
}
// How an archive already on disk stands to a new seal of the same id and version. `same`: the same package (its
// files hash, as `sign` hashes them, to the new `hashes.json`; a JSON file outside `ui/` is hashed in its canonical
// form, so member order and spacing are not part of it) under the same signature, which AgentFlow takes as the
// same content. `resigned`: that package under another key, which AgentFlow also takes under one version.
// `different`: anything else, a file that is no archive or whose files do not match its own `hashes.json` included.
export function sealAgainst(existing, sealed) {
    try {
        const before = readZip(existing);
        const after = readZip(sealed);
        const payload = new Map([...before].filter(([path]) => path !== "hashes.json" && path !== "signature"));
        const hashes = after.get("hashes.json");
        if (!before.get("hashes.json")?.equals(hashes) || !hashesOf(payload).equals(hashes))
            return "different";
        return before.get("signature")?.equals(after.get("signature")) ? "same" : "resigned";
    }
    catch {
        return "different";
    }
}
//# sourceMappingURL=seal.js.map