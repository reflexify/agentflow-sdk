import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SealError } from "../errors.js";
import { LIMITS, pathValid } from "./zip.js";
const JUNK = /^(\..*|Thumbs\.db|desktop\.ini)$/;
export function readPayloadDir(dir) {
    const files = new Map();
    const unlisted = [];
    const walk = (abs, rel) => {
        for (const name of readdirSync(abs).sort()) {
            const published = rel ? `${rel}/${name}` : name;
            const stat = lstatSync(join(abs, name));
            if (JUNK.test(name))
                unlisted.push(published);
            else if (!rel && name === "manifest.json" && stat.isFile())
                files.set(published, readFileSync(join(abs, name)));
            else if (!rel && (name === "objects" || name === "ui") && stat.isDirectory())
                walk(join(abs, name), published);
            else if (rel && stat.isFile())
                files.set(published, readFileSync(join(abs, name)));
            else if (rel && stat.isDirectory())
                walk(join(abs, name), published);
            else
                unlisted.push(published);
        }
    };
    walk(dir, "");
    if (unlisted.length) {
        throw new SealError("SEAL_FILE_UNLISTED", `not part of a package (only manifest.json, objects/… and ui/…): ${unlisted.join(", ")}`, unlisted);
    }
    return files;
}
const utf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
export function parseJsonFile(path, bytes) {
    try {
        return JSON.parse(utf8.decode(bytes));
    }
    catch {
        throw new SealError("SEAL_JSON_INVALID", `${path} is not valid JSON`, [path]);
    }
}
const PREFIX = /^[a-z][a-z0-9]{1,15}$/;
const KEY = /^[a-z][a-z0-9-]{0,39}$/;
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
export const PACKAGE_PART = {
    prefixRule: "a prefix is 2 to 16 lowercase letters and digits, starting with a letter",
    keyRule: "a key is 1 to 40 lowercase letters, digits and hyphens, starting with a letter, with no double or trailing hyphen",
    prefixValid: (prefix) => PREFIX.test(prefix),
    keyValid: (key) => KEY.test(key) && !key.includes("--") && !key.endsWith("-"),
};
function packageIdValid(id) {
    const parts = id.split("/");
    if (parts.length !== 2)
        return false;
    const [prefix, key] = parts;
    return PACKAGE_PART.prefixValid(prefix) && PACKAGE_PART.keyValid(key);
}
export function checkPayload(files) {
    const manifestBytes = files.get("manifest.json");
    if (!manifestBytes)
        throw new SealError("SEAL_MANIFEST_MISSING", "manifest.json is missing", ["manifest.json"]);
    let manifest;
    try {
        manifest = JSON.parse(utf8.decode(manifestBytes));
    }
    catch {
        throw new SealError("SEAL_MANIFEST_INVALID", "manifest.json is not valid JSON", ["manifest.json"]);
    }
    const record = typeof manifest === "object" && manifest !== null && !Array.isArray(manifest)
        ? manifest
        : undefined;
    if (!record)
        throw new SealError("SEAL_MANIFEST_INVALID", "manifest.json is not an object", ["manifest.json"]);
    const { id, version } = record;
    if (typeof id !== "string" || !packageIdValid(id)) {
        throw new SealError("SEAL_MANIFEST_INVALID", "/id must be <prefix>/<key>, in lowercase letters, digits and hyphens", ["manifest.json"]);
    }
    if (typeof version !== "string" || !SEMVER.test(version)) {
        throw new SealError("SEAL_VERSION_INVALID", "/version must be a SemVer 2.0 version", ["manifest.json"]);
    }
    for (const path of files.keys()) {
        if (!pathValid(path))
            throw new SealError("SEAL_PATH_INVALID", `not a valid package path: ${path}`, [path]);
    }
    for (const [path, bytes] of files) {
        if (!path.startsWith("ui/"))
            parseJsonFile(path, bytes);
    }
    if (files.size + 2 > LIMITS.entries) {
        throw new SealError("SEAL_LIMIT_EXCEEDED", `${files.size} files; at most ${LIMITS.entries - 2} are allowed`);
    }
    let total = 0;
    for (const [path, bytes] of files) {
        if (bytes.length > LIMITS.file) {
            throw new SealError("SEAL_LIMIT_EXCEEDED", `${path} is ${bytes.length} bytes; the limit is ${LIMITS.file}`, [path]);
        }
        total += bytes.length;
    }
    if (total > LIMITS.total) {
        throw new SealError("SEAL_LIMIT_EXCEEDED", `the files total ${total} bytes; the limit is ${LIMITS.total}`);
    }
    return { id, version, fileName: `${id.replace("/", "-")}-${version}.afpkg` };
}
//# sourceMappingURL=payload.js.map