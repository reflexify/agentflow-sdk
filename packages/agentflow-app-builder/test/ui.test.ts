import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { CliError } from "../src/errors.js";
import { checkUi, MOUNT_EXPORT, UI_EXTENSIONS } from "../src/ui.js";
import { copyApp, withUi, writeApp } from "./app-fixture.js";

const workspaceModules = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../node_modules/.pnpm/node_modules");
const sections = JSON.stringify({ workflows: {}, order: [], triggers: {}, actions: {} });

const uiDir = (files: Record<string, string>): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-ui-"));
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  }
  return dir;
};

const refusal = (run: () => unknown): CliError => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(CliError);
    return error as CliError;
  }
  throw new Error("did not refuse");
};

describe("checkUi", () => {
  it("accepts a folder whose index.js ends by exporting mount", () => {
    expect(() => checkUi(uiDir({ "index.js": "function mount() {}\nexport { mount };\n", "style.css": "a{}", "chunks/a.mjs": "" }))).not.toThrow();
  });

  it("accepts a minified export and a renamed one", () => {
    expect(() => checkUi(uiDir({ "index.js": "var a=1;export{a as mount};" }))).not.toThrow();
    expect(() => checkUi(uiDir({ "index.js": "export {\n  m as mount\n};\n" }))).not.toThrow();
  });

  it("refuses a missing index.js", () => {
    expect(refusal(() => checkUi(uiDir({ "style.css": "" }))).code).toBe("UI_ENTRY_MISSING");
  });

  it("refuses an index.js that does not export mount", () => {
    expect(refusal(() => checkUi(uiDir({ "index.js": "export { unmount };\n" }))).code).toBe("UI_ENTRY_INVALID");
    expect(refusal(() => checkUi(uiDir({ "index.js": "export { mount };\nconsole.log(1);\n" }))).code).toBe("UI_ENTRY_INVALID");
  });

  it("refuses a file type the platform does not serve, naming it", () => {
    const error = refusal(() => checkUi(uiDir({ "index.js": "export { mount };", "page.html": "", "deep/notes.txt": "", Makefile: "" })));
    expect(error.code).toBe("UI_FILE_TYPE");
    expect(error.files).toEqual(["Makefile", "deep/notes.txt", "page.html"]);
    expect(error.message).toContain("page.html");
  });
});

describe("the module's file types", () => {
  it("mirror what the platform serves", () => {
    expect([...UI_EXTENSIONS]).toEqual([".js", ".mjs", ".css", ".json", ".map", ".svg", ".png", ".jpg", ".webp", ".woff2"]);
    expect(MOUNT_EXPORT.test("export { mount };")).toBe(true);
  });
});

describe("buildApp with a UI module", () => {
  it("copies a prebuilt folder over what package/ui held", async () => {
    const dir = copyApp();
    withUi(dir);
    writeApp(dir, `export default { sections: ${sections}, ui: { prebuilt: "ui" } };\n`);
    fs.mkdirSync(path.join(dir, "ui"));
    fs.writeFileSync(path.join(dir, "ui/index.js"), "function mount() {}\nexport { mount };\n");
    fs.mkdirSync(path.join(dir, "package/ui"), { recursive: true });
    fs.writeFileSync(path.join(dir, "package/ui/old.js"), "");
    const { ui } = await buildApp(dir);
    expect(ui).toBe("copied");
    expect(fs.readdirSync(path.join(dir, "package/ui"))).toEqual(["index.js"]);
  });

  it("leaves package/ui alone when the prebuilt folder is wrong", async () => {
    const dir = copyApp();
    withUi(dir);
    writeApp(dir, `export default { sections: ${sections}, ui: { prebuilt: "ui" } };\n`);
    fs.mkdirSync(path.join(dir, "ui"));
    fs.writeFileSync(path.join(dir, "ui/index.js"), "export { mount };");
    fs.writeFileSync(path.join(dir, "ui/page.html"), "");
    fs.mkdirSync(path.join(dir, "package/ui"), { recursive: true });
    fs.writeFileSync(path.join(dir, "package/ui/old.js"), "");
    await expect(buildApp(dir)).rejects.toMatchObject({ code: "UI_FILE_TYPE" });
    expect(fs.readdirSync(path.join(dir, "package/ui"))).toEqual(["old.js"]);
  });

  it("removes package/ui when the manifest no longer declares a module", async () => {
    const dir = copyApp();
    fs.mkdirSync(path.join(dir, "package/ui"), { recursive: true });
    fs.writeFileSync(path.join(dir, "package/ui/index.js"), "");
    expect((await buildApp(dir)).ui).toBe("none");
    expect(fs.existsSync(path.join(dir, "package/ui"))).toBe(false);
  });

  it("refuses when the manifest declares a module and vite is not installed, whatever NODE_PATH holds", async () => {
    const dir = copyApp();
    withUi(dir);
    const saved = process.env.NODE_PATH;
    process.env.NODE_PATH = workspaceModules;
    try {
      const error = await buildApp(dir).then(
        () => undefined,
        (e: unknown) => e as CliError,
      );
      expect(error).toBeInstanceOf(CliError);
      expect(error!.code).toBe("UI_TOOL_MISSING");
      expect(error!.message).toBe(`the manifest declares a UI module, but vite is not installed in ${dir}: run pnpm add -D vite`);
    } finally {
      if (saved === undefined) delete process.env.NODE_PATH;
      else process.env.NODE_PATH = saved;
    }
  });

  it("builds with the vite found in the app's own node_modules, given a relative folder", async () => {
    const dir = copyApp();
    withUi(dir);
    fs.mkdirSync(path.join(dir, "node_modules/vite"), { recursive: true });
    fs.writeFileSync(path.join(dir, "node_modules/vite/package.json"), JSON.stringify({ name: "vite", type: "module", exports: "./index.js" }));
    fs.writeFileSync(
      path.join(dir, "node_modules/vite/index.js"),
      `import fs from "node:fs";
import path from "node:path";
export async function build(options) {
  fs.mkdirSync(options.build.outDir, { recursive: true });
  fs.writeFileSync(path.join(options.build.outDir, "index.js"), "function mount() {}\\nexport { mount };\\n");
}
`,
    );
    const previous = process.cwd();
    process.chdir(path.dirname(dir));
    try {
      const { ui } = await buildApp(path.basename(dir));
      expect(ui).toBe("built");
    } finally {
      process.chdir(previous);
    }
    expect(fs.readdirSync(path.join(dir, "package/ui"))).toEqual(["index.js"]);
  });
});
