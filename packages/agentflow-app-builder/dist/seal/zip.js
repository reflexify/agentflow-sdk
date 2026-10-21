import { crc32, inflateRawSync } from "node:zlib";
import { SealError } from "../errors.js";
export const LIMITS = { entries: 2000, file: 5_000_000, total: 100_000_000, archive: 20_000_000 };
const DOS_DATE = 0x0021;
const UNIX_FILE_MODE = 0x81a40000;
export function pathValid(path) {
    if (path === "" || path.startsWith("/"))
        return false;
    for (let i = 0; i < path.length; i++) {
        const c = path.charCodeAt(i);
        if (c < 0x21 || c > 0x7e || c === 0x5c || c === 0x3a)
            return false;
    }
    return path.split("/").every((s) => s !== "" && s !== "." && s !== "..");
}
export function writeStoredZip(entries) {
    const locals = [];
    const centrals = [];
    let offset = 0;
    for (const [path, bytes] of entries) {
        if (!/^[\x20-\x7e]+$/.test(path)) {
            throw new SealError("SEAL_PATH_INVALID", `not an ASCII path: ${path}`, [path]);
        }
        const name = Buffer.from(path, "latin1");
        const crc = crc32(bytes) >>> 0;
        const local = Buffer.alloc(30);
        local.write("PK\x03\x04", 0, "latin1");
        local.writeUInt16LE(10, 4);
        local.writeUInt16LE(0, 6);
        local.writeUInt16LE(0, 8);
        local.writeUInt16LE(0, 10);
        local.writeUInt16LE(DOS_DATE, 12);
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(bytes.length, 18);
        local.writeUInt32LE(bytes.length, 22);
        local.writeUInt16LE(name.length, 26);
        local.writeUInt16LE(0, 28);
        const central = Buffer.alloc(46);
        central.write("PK\x01\x02", 0, "latin1");
        central.writeUInt16LE(0x030a, 4);
        central.writeUInt16LE(10, 6);
        central.writeUInt16LE(0, 8);
        central.writeUInt16LE(0, 10);
        central.writeUInt16LE(0, 12);
        central.writeUInt16LE(DOS_DATE, 14);
        central.writeUInt32LE(crc, 16);
        central.writeUInt32LE(bytes.length, 20);
        central.writeUInt32LE(bytes.length, 24);
        central.writeUInt16LE(name.length, 28);
        central.writeUInt16LE(0, 30);
        central.writeUInt16LE(0, 32);
        central.writeUInt16LE(0, 34);
        central.writeUInt16LE(0, 36);
        central.writeUInt32LE(UNIX_FILE_MODE, 38);
        central.writeUInt32LE(offset, 42);
        locals.push(local, name, Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length));
        centrals.push(central, name);
        offset += local.length + name.length + bytes.length;
    }
    const directory = Buffer.concat(centrals);
    const end = Buffer.alloc(22);
    end.write("PK\x05\x06", 0, "latin1");
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, directory, end]);
}
export function readZip(bytes, opts = {}) {
    const skipFolders = opts.skipFolders === true;
    const refuse = (what) => {
        throw new SealError(skipFolders ? "DRAFT_INVALID" : "SEAL_ARCHIVE_INVALID", `not a package archive: ${what}`);
    };
    const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length);
    const u16 = (at) => (at >= 0 && at + 2 <= buf.length ? buf.readUInt16LE(at) : refuse("truncated"));
    const u32 = (at) => (at >= 0 && at + 4 <= buf.length ? buf.readUInt32LE(at) : refuse("truncated"));
    const slice = (from, to) => from >= 0 && from <= to && to <= buf.length ? buf.subarray(from, to) : refuse("truncated");
    const signatureAt = (at, sig) => at >= 0 && at + 4 <= buf.length && buf.subarray(at, at + 4).equals(Buffer.from(sig, "latin1"));
    const checkExtra = (extra) => {
        let at = 0;
        while (at < extra.length) {
            if (at + 4 > extra.length)
                refuse("extra field");
            const tag = extra.readUInt16LE(at);
            if (tag === 0x0001 || tag === 0x7075)
                refuse("extra field");
            at += 4 + extra.readUInt16LE(at + 2);
            if (at > extra.length)
                refuse("extra field");
        }
    };
    if (buf.length > LIMITS.archive)
        refuse("too large");
    if (buf.length < 22)
        refuse("too short");
    const end = buf.length - 22;
    if (!signatureAt(end, "PK\x05\x06") || u16(end + 20) !== 0)
        refuse("end record");
    const count = u16(end + 10);
    if (count > LIMITS.entries)
        refuse("too many entries");
    if (u16(end + 4) !== 0 || u16(end + 6) !== 0 || u16(end + 8) !== count)
        refuse("end record");
    const size = u32(end + 12);
    const start = u32(end + 16);
    if (start + size !== end)
        refuse("directory");
    let at = start;
    let total = 0;
    const entries = new Map();
    const regions = [];
    for (let i = 0; i < count; i++) {
        if (!signatureAt(at, "PK\x01\x02"))
            refuse("directory entry");
        const flags = u16(at + 8);
        const method = u16(at + 10);
        const compressed = u32(at + 20);
        const uncompressed = u32(at + 24);
        if (uncompressed > LIMITS.file)
            refuse("a file is too large");
        total += uncompressed;
        if (total > LIMITS.total)
            refuse("too large");
        if ((flags & ~0x0806) !== 0 || (method !== 0 && method !== 8) || u16(at + 34) !== 0)
            refuse("unsupported entry");
        const nameLength = u16(at + 28);
        const extraLength = u16(at + 30);
        const commentLength = u16(at + 32);
        if (commentLength !== 0 || (method === 0 && compressed !== uncompressed))
            refuse("unsupported entry");
        const name = slice(at + 46, at + 46 + nameLength);
        const path = name.toString("latin1");
        const folder = skipFolders && path.endsWith("/") ? path.slice(0, -1) : undefined;
        if (!pathValid(folder ?? path))
            refuse(`path ${JSON.stringify(path)}`);
        const attrs = u32(at + 38);
        const unixKind = (attrs >>> 16) & 0o170000;
        if (folder !== undefined && uncompressed !== 0)
            refuse(`folder ${path} has content`);
        const kind = folder !== undefined ? 0o040000 : 0o100000;
        if ((unixKind !== 0 && unixKind !== kind) || ((attrs & 0x10) !== 0 && folder === undefined)) {
            refuse(`entry ${path}`);
        }
        checkExtra(slice(at + 46 + nameLength, at + 46 + nameLength + extraLength));
        const local = u32(at + 42);
        if (!signatureAt(local, "PK\x03\x04") || u16(local + 6) !== flags || u16(local + 8) !== method) {
            refuse("local header");
        }
        const localName = u16(local + 26);
        const localExtra = u16(local + 28);
        if (!slice(local + 30, local + 30 + localName).equals(name))
            refuse("local header");
        checkExtra(slice(local + 30 + localName, local + 30 + localName + localExtra));
        if (u32(local + 18) !== compressed ||
            u32(local + 22) !== uncompressed ||
            u32(local + 14) !== u32(at + 16)) {
            refuse("local header");
        }
        const data = local + 30 + localName + localExtra;
        const dataEnd = data + compressed;
        if (dataEnd > start)
            refuse("entry data");
        if (folder === undefined) {
            if (entries.has(path))
                refuse(`duplicate ${path}`);
            entries.set(path, { start: data, end: dataEnd, size: uncompressed, crc: u32(at + 16), method });
        }
        regions.push([local, dataEnd]);
        at += 46 + nameLength + extraLength + commentLength;
        if (at > end)
            refuse("directory");
    }
    if (at !== end)
        refuse("directory");
    regions.sort((a, b) => a[0] - b[0]);
    let next = 0;
    for (const [local, dataEnd] of regions) {
        if (local !== next)
            refuse("gaps between entries");
        next = dataEnd;
    }
    if (next !== start)
        refuse("gaps between entries");
    const files = new Map();
    let inflated = 0;
    for (const [path, entry] of entries) {
        const remaining = Math.min(LIMITS.file, LIMITS.total - inflated);
        const compressed = buf.subarray(entry.start, entry.end);
        let output;
        if (entry.method === 0)
            output = Buffer.from(compressed);
        else {
            try {
                output = inflateRawSync(compressed, { maxOutputLength: remaining + 1 });
            }
            catch {
                return refuse(`${path} does not inflate within the limits`);
            }
        }
        if (output.length > remaining)
            refuse(`${path} is too large`);
        if (output.length !== entry.size || crc32(output) >>> 0 !== entry.crc)
            refuse(`${path} does not match its header`);
        inflated += output.length;
        files.set(path, output);
    }
    return files;
}
//# sourceMappingURL=zip.js.map