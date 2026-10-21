import { deflateRawSync, crc32 } from "node:zlib";
import { describe, expect, it } from "vitest";
import { SealError } from "../../src/errors.js";
import { readZip, writeStoredZip } from "../../src/seal/zip.js";

const bytes = (text: string) => Buffer.from(text, "utf8");
const refusal = (code: string) => expect.objectContaining({ code });

function centralOffset(zip: Buffer, entry = 0): number {
  let at = zip.indexOf("PK\x01\x02", 0, "latin1");
  for (let i = 0; i < entry; i++) at = zip.indexOf("PK\x01\x02", at + 4, "latin1");
  return at;
}

describe("the stored zip", () => {
  it("round-trips its entries in order", () => {
    const zip = writeStoredZip([
      ["manifest.json", bytes("{}")],
      ["ui/index.js", bytes("export {};\n")],
      ["empty", Buffer.alloc(0)],
    ]);
    const read = readZip(zip);
    expect([...read.keys()]).toEqual(["manifest.json", "ui/index.js", "empty"]);
    expect(read.get("ui/index.js")!.toString()).toBe("export {};\n");
    expect(read.get("empty")!.length).toBe(0);
  });

  it("writes the fixed time, the unix file mode and no extra fields", () => {
    const zip = writeStoredZip([["a", bytes("x")]]);
    expect(zip.readUInt16LE(10)).toBe(0);
    expect(zip.readUInt16LE(12)).toBe(0x0021);
    const central = centralOffset(zip);
    expect(zip.readUInt16LE(central + 4)).toBe(0x030a);
    expect(zip.readUInt32LE(central + 38)).toBe(0x81a40000);
    expect(zip.readUInt16LE(central + 30)).toBe(0);
  });

  it("refuses to write a path that is not ASCII", () => {
    expect(() => writeStoredZip([["objects/é.json", bytes("{}")]])).toThrow(refusal("SEAL_PATH_INVALID"));
  });

  it("reads a deflated entry", () => {
    const body = bytes("hello hello hello hello");
    const packed = deflateRawSync(body);
    const name = Buffer.from("a", "latin1");
    const local = Buffer.alloc(30);
    local.write("PK\x03\x04", 0, "latin1");
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc32(body) >>> 0, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(body.length, 22);
    local.writeUInt16LE(1, 26);
    const central = Buffer.alloc(46);
    central.write("PK\x01\x02", 0, "latin1");
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc32(body) >>> 0, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(body.length, 24);
    central.writeUInt16LE(1, 28);
    const end = Buffer.alloc(22);
    end.write("PK\x05\x06", 0, "latin1");
    end.writeUInt16LE(1, 8);
    end.writeUInt16LE(1, 10);
    end.writeUInt32LE(47, 12);
    end.writeUInt32LE(30 + 1 + packed.length, 16);
    const zip = Buffer.concat([local, name, packed, central, name, end]);
    expect(readZip(zip).get("a")!.equals(body)).toBe(true);
  });

  it("refuses an archive comment", () => {
    const zip = writeStoredZip([["a", bytes("x")]]);
    const commented = Buffer.concat([zip, bytes("comment")]);
    commented.writeUInt16LE(7, zip.length - 2);
    expect(() => readZip(commented)).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
    expect(() => readZip(Buffer.concat([zip, bytes("x")]))).toThrow(SealError);
  });

  it("refuses a method other than stored or deflated, in either header", () => {
    const zip = writeStoredZip([["a", bytes("x")]]);
    const both = Buffer.from(zip);
    both.writeUInt16LE(12, 8);
    both.writeUInt16LE(12, centralOffset(both) + 10);
    expect(() => readZip(both)).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
    const central = Buffer.from(zip);
    central.writeUInt16LE(12, centralOffset(central) + 10);
    expect(() => readZip(central)).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
  });

  it("refuses a path that leaves the archive, and others the platform refuses", () => {
    for (const path of ["../a", "a/../b", "/a", "a//b", "a\\b", "a:b", "./a"]) {
      expect(() => readZip(writeStoredZip([[path, bytes("x")]])), path).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
    }
  });

  it("refuses a duplicate name", () => {
    const zip = writeStoredZip([["a", bytes("x")], ["a", bytes("y")]]);
    expect(() => readZip(zip)).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
  });

  it("refuses a size or checksum that does not match", () => {
    const zip = writeStoredZip([["a", bytes("xyz")]]);
    const wrong = Buffer.from(zip);
    wrong[31] = 0x41;
    expect(() => readZip(wrong)).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
  });

  it("refuses a zip64 or Unicode path extra field", () => {
    const zip = writeStoredZip([["a", bytes("x")]]);
    const central = centralOffset(zip);
    const extra = Buffer.from([0x75, 0x70, 0x00, 0x00]);
    const withExtra = Buffer.concat([zip.subarray(0, central + 47), extra, zip.subarray(central + 47)]);
    withExtra.writeUInt16LE(4, central + 30);
    withExtra.writeUInt32LE(withExtra.readUInt32LE(withExtra.length - 10) + 4, withExtra.length - 10);
    expect(() => readZip(withExtra)).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
  });

  describe("skipFolders", () => {
    function withFolder(): Buffer {
      const zip = writeStoredZip([["a/", Buffer.alloc(0)], ["a/b", bytes("x")]]);
      zip.writeUInt32LE(0, centralOffset(zip, 0) + 38);
      return zip;
    }

    it("skips an empty folder entry", () => {
      expect([...readZip(withFolder(), { skipFolders: true }).keys()]).toEqual(["a/b"]);
    });

    it("refuses a folder entry otherwise", () => {
      expect(() => readZip(withFolder())).toThrow(refusal("SEAL_ARCHIVE_INVALID"));
    });

    it("refuses a folder with content, under the draft code", () => {
      const zip = writeStoredZip([["a/", bytes("x")]]);
      zip.writeUInt32LE(0, centralOffset(zip) + 38);
      expect(() => readZip(zip, { skipFolders: true })).toThrow(refusal("DRAFT_INVALID"));
    });

    it("refuses with the draft code for any other fault", () => {
      expect(() => readZip(Buffer.from("not a zip at all, not even close"), { skipFolders: true })).toThrow(
        refusal("DRAFT_INVALID"),
      );
    });
  });
});
