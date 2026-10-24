import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { checkPackage } from "../src/check.js";
import { listFiles } from "../src/ui.js";
import { copyApp, fixtureApp, withUi, writeApp } from "./app-fixture.js";
import { runCli } from "./http-stub.js";

const built = async (): Promise<string> => {
  const dir = copyApp();
  await buildApp(dir);
  return dir;
};

describe("buildApp", () => {
  it("writes the package and reports the count", async () => {
    const dir = copyApp();
    const lines: string[] = [];
    const { files, ui } = await buildApp(dir, { log: (line) => lines.push(line) });
    expect(ui).toBe("none");
    expect(files).toBeGreaterThan(1);
    expect(files).toBe(listFiles(path.join(dir, "package")).length);
    expect(lines).toEqual([`wrote ${files} package files`]);
  });

  it("builds the same files from the same app, run twice", async () => {
    const dir = await built();
    const first = fs.readFileSync(path.join(dir, "package/manifest.json"), "utf8");
    await buildApp(dir);
    expect(fs.readFileSync(path.join(dir, "package/manifest.json"), "utf8")).toBe(first);
  });
});

describe("checkPackage", () => {
  it("finds the package it just built clean", async () => {
    expect(await checkPackage(await built())).toEqual({ stale: [], missing: [], extra: [] });
  });

  it("finds the committed fixture package clean", async () => {
    expect(await checkPackage(fixtureApp)).toEqual({ stale: [], missing: [], extra: [] });
  });

  it("names a file that was edited as stale", async () => {
    const dir = await built();
    const file = path.join(dir, "package/objects/entity/note.json");
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('"Note"', '"Notes"'));
    expect(await checkPackage(dir)).toEqual({ stale: ["objects/entity/note.json"], missing: [], extra: [] });
  });

  it("names a file that was deleted as missing", async () => {
    const dir = await built();
    fs.rmSync(path.join(dir, "package/objects/entity/contact.json"));
    expect(await checkPackage(dir)).toEqual({ stale: [], missing: ["objects/entity/contact.json"], extra: [] });
  });

  it("names a file nothing builds as extra", async () => {
    const dir = await built();
    fs.writeFileSync(path.join(dir, "package/objects/entity/ghost.json"), "{}\n");
    expect(await checkPackage(dir)).toEqual({ stale: [], missing: [], extra: ["objects/entity/ghost.json"] });
  });

  it("names ui/ files as extra when the manifest declares no module", async () => {
    const dir = await built();
    fs.mkdirSync(path.join(dir, "package/ui"));
    fs.writeFileSync(path.join(dir, "package/ui/x.js"), "export {};\n");
    expect(await checkPackage(dir)).toEqual({ stale: [], missing: [], extra: ["ui/x.js"] });
  });

  describe("with a prebuilt module", () => {
    const sections = JSON.stringify({ workflows: {}, order: [], triggers: {}, actions: {} });
    const prebuilt = async (): Promise<string> => {
      const dir = copyApp();
      withUi(dir);
      writeApp(dir, `export default { sections: ${sections}, ui: { prebuilt: "ui" } };\n`);
      fs.mkdirSync(path.join(dir, "ui/chunks"), { recursive: true });
      fs.writeFileSync(path.join(dir, "ui/index.js"), "function mount() {}\nexport { mount };\n");
      fs.writeFileSync(path.join(dir, "ui/chunks/a.js"), "export const a = 1;\n");
      await buildApp(dir);
      return dir;
    };

    it("finds package/ui clean when it is the folder byte for byte", async () => {
      expect(await checkPackage(await prebuilt())).toEqual({ stale: [], missing: [], extra: [] });
    });

    it("names a ui/ file that differs as stale, one gone as missing, and one the folder lacks as extra", async () => {
      const dir = await prebuilt();
      fs.writeFileSync(path.join(dir, "ui/index.js"), "function mount() { return 1; }\nexport { mount };\n");
      fs.rmSync(path.join(dir, "package/ui/chunks/a.js"));
      fs.writeFileSync(path.join(dir, "package/ui/old.js"), "");
      expect(await checkPackage(dir)).toEqual({ stale: ["ui/index.js"], missing: ["ui/chunks/a.js"], extra: ["ui/old.js"] });
    });

    it("passes when package/ui is not there, since git ignores it and seal refuses a missing module", async () => {
      const dir = await prebuilt();
      fs.rmSync(path.join(dir, "package/ui"), { recursive: true });
      expect(await checkPackage(dir)).toEqual({ stale: [], missing: [], extra: [] });
      expect((await runCli(dir, ["build", "--check"])).code).toBe(0);
    });

    it("makes build --check refuse a stale module with PACKAGE_STALE", async () => {
      const dir = await prebuilt();
      fs.writeFileSync(path.join(dir, "package/ui/index.js"), "export { mount };\n");
      const out = await runCli(dir, ["build", "--check", "--json"]);
      expect(out.code).toBe(1);
      expect(JSON.parse(out.stdout).error).toMatchObject({ code: "PACKAGE_STALE", files: ["package/ui/index.js"] });
    });
  });

  it("reports everything missing when package/ does not exist", async () => {
    const dir = copyApp();
    fs.rmSync(path.join(dir, "package"), { recursive: true });
    const { missing, stale, extra } = await checkPackage(dir);
    expect(missing).toContain("manifest.json");
    expect([stale, extra]).toEqual([[], []]);
  });
});
