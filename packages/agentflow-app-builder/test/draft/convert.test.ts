import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Writable } from "node:stream";
import { checkPackage } from "../../src/check.js";
import { main } from "../../src/cli.js";
import { compareDraft, describeDifferences } from "../../src/draft/compare.js";
import { convertDraft } from "../../src/draft/convert.js";
import { CliError } from "../../src/errors.js";
import { PROJECT_PNPM_WORKSPACE } from "../../src/init.js";
import { keyFromSeed } from "../../src/seal/keys.js";
import { readPayloadDir } from "../../src/seal/payload.js";
import { sign } from "../../src/seal/seal.js";
import { readZip, writeStoredZip } from "../../src/seal/zip.js";
import { listFiles } from "../../src/ui.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const builder = path.resolve(here, "../..");
const fixture = (name: string): Buffer => fs.readFileSync(path.join(here, "../fixtures/drafts", name));

const scratch = (): string => fs.mkdtempSync(path.join(os.tmpdir(), "agentflow-draft-test-"));

const refusal = async (promise: Promise<unknown>): Promise<CliError> => {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(CliError);
  return error as CliError;
};

const tree = (dir: string): Map<string, Buffer> => new Map(listFiles(dir).map((rel) => [rel, fs.readFileSync(path.join(dir, rel))]));

const linkBuilder = (project: string): void => {
  const link = path.join(project, "node_modules/@reflexify/agentflow-app-builder");
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(builder, link, "dir");
};

// The draft's files again, with an entry for every folder before its files, the way `zip -r` writes them.
function withFolders(zip: Buffer): Buffer {
  const files = [...readZip(zip, { skipFolders: true })];
  const folders = new Set<string>();
  for (const [rel] of files) {
    const parts = rel.split("/").slice(0, -1);
    parts.forEach((_, i) => folders.add(`${parts.slice(0, i + 1).join("/")}/`));
  }
  const entries: [string, Buffer][] = [...[...folders].sort().map((f): [string, Buffer] => [f, Buffer.alloc(0)]), ...files];
  const out = writeStoredZip(entries);
  let at = out.readUInt32LE(out.length - 22 + 16);
  for (const [name] of entries) {
    if (name.endsWith("/")) out.writeUInt32LE((((0o040755 << 16) | 0x10) >>> 0), at + 38);
    at += 46 + out.readUInt16LE(at + 28) + out.readUInt16LE(at + 30) + out.readUInt16LE(at + 32);
  }
  return out;
}

function rezip(zip: Buffer, edit: (files: Map<string, Buffer>) => void): Buffer {
  const files = readZip(zip, { skipFolders: true });
  edit(files);
  return writeStoredZip([...files]);
}

describe("convertDraft", { timeout: 30_000 }, () => {
  it.each(["tickets.zip", "tracker.zip", "case-desk.zip"])("converts %s into a project whose package/ is current", async (name) => {
    const parent = scratch();
    const dir = path.join(parent, "app");
    const made = await convertDraft(fixture(name), dir);
    expect(made.dir).toBe(dir);
    expect(made.files).toBe(listFiles(dir).length);
    expect(fs.readdirSync(parent)).toEqual(["app"]);
    for (const file of ["package.json", "pnpm-workspace.yaml", ".gitignore", "README.md", "AGENTS.md", "CLAUDE.md", "agentflow.app.mjs", "config/package-manifest.json"]) {
      expect(fs.existsSync(path.join(dir, file)), file).toBe(true);
    }
    expect(fs.existsSync(path.join(dir, "node_modules"))).toBe(false);
    const { id, name: title, version } = JSON.parse(fs.readFileSync(path.join(dir, "config/package-manifest.json"), "utf8"));
    expect(JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).version).toBe(version);
    for (const doc of ["README.md", "AGENTS.md"]) {
      const text = fs.readFileSync(path.join(dir, doc), "utf8");
      expect(text, doc).not.toContain("starter:");
      expect(text, doc).not.toMatch(/\b\d+\.\d+\.\d+\b/);
      if (id !== "acme/case-desk") expect(text, doc).not.toMatch(/case-desk|Case desk|`case`|Open a case|open-case|Cases screen|src\/module|pnpm demo/);
    }
    expect(fs.readFileSync(path.join(dir, "README.md"), "utf8")).toContain(`# ${title}\n`);
    linkBuilder(dir);
    expect(await checkPackage(dir)).toEqual({ stale: [], missing: [], extra: [] });
  });

  it("puts a draft's module in ui/built, with a note that it is built output", async () => {
    const dir = path.join(scratch(), "app");
    await convertDraft(fixture("tracker.zip"), dir);
    const module = readZip(fixture("tracker.zip"), { skipFolders: true }).get("ui/index.js")!;
    expect(fs.readFileSync(path.join(dir, "ui/built/index.js")).equals(module)).toBe(true);
    expect(fs.readFileSync(path.join(dir, "ui/README.md"), "utf8")).toContain("built output, not source");
    expect(fs.readFileSync(path.join(dir, "agentflow.app.mjs"), "utf8")).toContain('ui: { prebuilt: "ui/built" }');
    for (const doc of ["README.md", "AGENTS.md"]) {
      const text = fs.readFileSync(path.join(dir, doc), "utf8");
      expect(text, doc).toMatch(/writes the (UI )?module into `package\/ui/);
      expect(text, doc).not.toMatch(/builds the (UI )?module into/);
    }
  });

  it("warns when the draft's UI module is the empty stub, and not when it is a real module", async () => {
    const stub = "function mount() { return () => {}; }\nexport { mount };\n";
    const stubbed = await convertDraft(fixture("case-desk.zip"), path.join(scratch(), "stub"));
    expect(stubbed.warnings).toHaveLength(1);
    expect(stubbed.warnings[0]).toContain("ui/index.js");
    expect(stubbed.warnings[0]).toContain("empty stub");
    expect(stubbed.warnings[0]).toContain("remove ui");
    const reformatted = rezip(fixture("case-desk.zip"), (files) => {
      files.set("ui/index.js", Buffer.from(stub.replace(/\n/g, "\r\n").replace("() {", "( ) {")));
    });
    expect((await convertDraft(reformatted, path.join(scratch(), "spaced"))).warnings).toHaveLength(1);
    const real = rezip(fixture("case-desk.zip"), (files) => {
      files.set("ui/index.js", Buffer.from("function mount(root) { root.textContent = 'Cases'; return () => {}; }\nexport { mount };\n"));
    });
    expect((await convertDraft(real, path.join(scratch(), "real"))).warnings).toEqual([]);
  }, 30_000);

  it("writes the app file with one entry per line, so adding an object is a one-line change", async () => {
    const dir = path.join(scratch(), "app");
    await convertDraft(fixture("case-desk.zip"), dir);
    const text = fs.readFileSync(path.join(dir, "agentflow.app.mjs"), "utf8");
    expect(text).toContain('const ORDER = [\n  "open_case",\n];\n');
    expect(text).toContain(
      [
        "  sections: merge([",
        "    workflow_open_case,",
        "  ], ORDER),",
        "  entityOrder: [",
        '    "case",',
        "  ],",
        "  exposedSteps: {",
        '    open_case: ["review"],',
        "  },",
      ].join("\n"),
    );
  });

  it("writes the starter's project files without the site or the module's source", async () => {
    const dir = path.join(scratch(), "app");
    await convertDraft(fixture("tracker.zip"), dir);
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    expect(pkg.name).toBe("tracker");
    expect(pkg.scripts.test).toBe("agentflow-app build --check");
    expect(fs.readFileSync(path.join(dir, "pnpm-workspace.yaml"), "utf8")).toBe(PROJECT_PNPM_WORKSPACE);
    expect(pkg.scripts).not.toHaveProperty("dev");
    expect(pkg.scripts).not.toHaveProperty("demo");
    expect(fs.existsSync(path.join(dir, "src"))).toBe(false);
    expect(fs.existsSync(path.join(dir, "server"))).toBe(false);
  });

  it("refuses a hand-made draft the builder cannot write, naming files and leaving nothing behind", async () => {
    const parent = scratch();
    const error = await refusal(convertDraft(fixture("schedules.zip"), path.join(parent, "app")));
    expect(["DRAFT_REBUILD_DIFFERS", "DRAFT_UNSUPPORTED"]).toContain(error.code);
    expect(error.files?.length).toBeGreaterThan(0);
    expect(fs.readdirSync(parent)).toEqual([]);
  });

  it("refuses a sealed package", async () => {
    const vector = path.join(here, "../vectors/basic/payload");
    const sealed = sign(readPayloadDir(vector), keyFromSeed("vector-key", Buffer.alloc(32, 7)));
    const parent = scratch();
    const error = await refusal(convertDraft(sealed.bytes, path.join(parent, "app")));
    expect(error.code).toBe("DRAFT_INVALID");
    expect(error.message).toBe("this is a sealed package, not a draft: use Admin → Apps → Pack with no key");
    expect(fs.readdirSync(parent)).toEqual([]);
  });

  it("refuses a zip without manifest.json", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => files.delete("manifest.json"));
    expect((await refusal(convertDraft(zip, path.join(scratch(), "app")))).code).toBe("DRAFT_INVALID");
  });

  it("refuses something that is not a zip", async () => {
    expect((await refusal(convertDraft(Buffer.from("not a zip at all, not even close"), path.join(scratch(), "app")))).code).toBe("DRAFT_INVALID");
  });

  it("converts a draft re-zipped with folder entries the same as the original", async () => {
    const plain = path.join(scratch(), "app");
    const folders = path.join(scratch(), "app");
    await convertDraft(fixture("tickets.zip"), plain);
    await convertDraft(withFolders(fixture("tickets.zip")), folders);
    const a = tree(plain);
    const b = tree(folders);
    expect([...b.keys()]).toEqual([...a.keys()]);
    for (const [rel, bytes] of a) expect(b.get(rel)!.equals(bytes), rel).toBe(true);
  });

  it("converts a workflow start form with a record picker, and the rebuild matches", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => {
      const rel = "objects/workflow/stamp_completion.json";
      const body = JSON.parse(files.get(rel)!.toString("utf8"));
      body.inputSchema = {
        type: "object",
        properties: { item: { type: "string", format: "entity", "x-entity": "@obj.key:entity:item" }, by: { type: "string", format: "entity", "x-entity": "@req.key:entity:user" } },
      };
      files.set(rel, Buffer.from(JSON.stringify(body)));
    });
    const dir = path.join(scratch(), "app");
    await convertDraft(zip, dir);
    const source = fs.readFileSync(path.join(dir, "config/build/workflows/stamp_completion.mjs"), "utf8");
    expect(source).toContain('"x-entity": "item"');
    expect(source).toContain('"x-entity": "user"');
    linkBuilder(dir);
    expect(await checkPackage(dir)).toEqual({ stale: [], missing: [], extra: [] });
  });

  it("converts a view in Pack shape with a preset (id, label, icon, a $bind rule), a hop filter and a within", async () => {
    const preset = { id: "0190f8f4-0000-7000-8000-0000000000f1", label: "Mine", icon: "star", rules: [{ field: "claimed_by", op: "eq", value: { $bind: "viewer.id" } }] };
    const zip = rezip(fixture("tracker.zip"), (files) =>
      editJson(files, "objects/entity_view/item__open.json", (view) => {
        view.filters = [
          { field: "status", op: "in", value: ["todo", "doing"] },
          { field: "tag.name", op: "contains", value: "bug" },
          { field: "due", op: "within", value: "last_30_days" },
        ];
        view.config = { presets: [preset] };
      }),
    );
    const dir = path.join(scratch(), "app");
    await convertDraft(zip, dir);
    const entity = fs.readFileSync(path.join(dir, "config/entities/item.json"), "utf8");
    expect(JSON.parse(entity).views.find((v: { key: string }) => v.key === "open")).toMatchObject({
      filters: [{ field: "status" }, { field: "tag.name", op: "contains" }, { field: "due", op: "within", value: "last_30_days" }],
      config: { presets: [preset] },
    });
    linkBuilder(dir);
    expect(await checkPackage(dir)).toEqual({ stale: [], missing: [], extra: [] });
  });

  it("refuses a draft whose fixed filter carries a $bind, as DRAFT_UNSUPPORTED naming the filter", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) =>
      editJson(files, "objects/entity_view/item__open.json", (view) => {
        view.filters = [{ field: "due", op: "lt", value: { $bind: "today" } }];
      }),
    );
    const parent = scratch();
    const error = await refusal(convertDraft(zip, path.join(parent, "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.message).toContain("never resolves $bind");
    expect(fs.readdirSync(parent)).toEqual([]);
  });

  it("refuses an object kind the builder does not write, naming its file", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => {
      const manifest = JSON.parse(files.get("manifest.json")!.toString("utf8"));
      manifest.objects.push({ key: "relationship:item_links", kind: "relationship" });
      files.set("manifest.json", Buffer.from(JSON.stringify(manifest)));
      files.set("objects/relationship/item_links.json", Buffer.from("{}"));
    });
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.files).toEqual(["objects/relationship/item_links.json"]);
  });

  it("converts a document template, with a layout or without, into config/document_templates, and refuses one with an image", async () => {
    const blockId = "0190f8f4-0000-7000-8000-000000000001";
    const body = {
      name: "Letter",
      schema_json: { type: "object", properties: { number: { type: "string" } } },
      template: { version: 1, blocks: [{ id: blockId, type: "text", align: "left", content: [{ type: "field_ref", path: "number" }] }] },
    };
    const withTemplate = (template: unknown) => rezip(fixture("tracker.zip"), (files) => {
      const manifest = JSON.parse(files.get("manifest.json")!.toString("utf8"));
      manifest.objects.push({ key: "document_template:letter", kind: "document_template" });
      files.set("manifest.json", Buffer.from(JSON.stringify(manifest)));
      files.set("objects/document_template/letter.json", Buffer.from(JSON.stringify(template)));
    });
    const dir = path.join(scratch(), "app");
    await convertDraft(withTemplate(body), dir);
    expect(JSON.parse(fs.readFileSync(path.join(dir, "config/document_templates/letter.json"), "utf8"))).toEqual({ key: "letter", ...body });
    const { template: _layout, ...bare } = body;
    const noLayout = path.join(scratch(), "app");
    await convertDraft(withTemplate(bare), noLayout);
    expect(JSON.parse(fs.readFileSync(path.join(noLayout, "config/document_templates/letter.json"), "utf8"))).toEqual({ key: "letter", ...bare });
    const image = { id: "0190f8f4-0000-7000-8000-000000000002", type: "image", source: { kind: "template_asset", asset_id: blockId } };
    const error = await refusal(convertDraft(withTemplate({ ...body, template: { version: 1, blocks: [image] } }), path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.message).toContain("a packaged template cannot hold an image yet");
  });

  it("refuses a form layout the builder does not write", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => {
      files.set("objects/form/item.json", Buffer.from(JSON.stringify({
        ...JSON.parse(files.get("objects/form/item.json")!.toString("utf8")),
        ui_schema_json: { type: "HorizontalLayout" },
      })));
    });
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.message.startsWith("objects/form/item.json#/ui_schema_json: ")).toBe(true);
  });

  it("refuses a folder that is not empty", async () => {
    const dir = scratch();
    fs.writeFileSync(path.join(dir, "keep"), "x");
    expect((await refusal(convertDraft(fixture("tracker.zip"), dir))).code).toBe("INIT_DIR_NOT_EMPTY");
  });

  it("fills an empty folder", async () => {
    const dir = scratch();
    await convertDraft(fixture("tracker.zip"), dir);
    expect(fs.existsSync(path.join(dir, "agentflow.app.mjs"))).toBe(true);
  });
});

describe("compareDraft", () => {
  const files = (manifest: unknown, extra: Record<string, string> = {}): Map<string, Buffer> =>
    new Map([["manifest.json", JSON.stringify(manifest)], ...Object.entries(extra)].map(([k, v]) => [k, Buffer.from(v)]));
  const manifest = {
    id: "acme/x",
    parameters: [{ key: "a" }, { key: "b" }],
    objects: [{ key: "entity:b", kind: "entity" }, { key: "entity:a", kind: "entity" }],
    grants: [{ key: "b_everyone", to: "everyone" }, { key: "a_everyone", to: "everyone" }],
  };

  it("takes the manifest's objects and grants in any order, and member order anywhere", () => {
    const reordered = {
      grants: [...manifest.grants].reverse(),
      objects: [...manifest.objects].reverse(),
      parameters: manifest.parameters,
      id: "acme/x",
    };
    expect(compareDraft(files(manifest, { "objects/entity/a.json": '{"x":1,"y":2}' }), files(reordered, { "objects/entity/a.json": '{"y":2,"x":1}' }))).toEqual([]);
  });

  it("names a manifest whose set of objects differs", () => {
    const fewer = { ...manifest, objects: manifest.objects.slice(1) };
    expect(compareDraft(files(manifest), files(fewer))).toEqual(["manifest.json"]);
  });

  it("names a manifest whose other arrays are in another order", () => {
    const swapped = { ...manifest, parameters: [...manifest.parameters].reverse() };
    expect(compareDraft(files(manifest), files(swapped))).toEqual(["manifest.json"]);
  });

  it("keeps the order of an object's arrays", () => {
    expect(compareDraft(files(manifest, { "objects/entity/a.json": '{"fields":["x","y"]}' }), files(manifest, { "objects/entity/a.json": '{"fields":["y","x"]}' }))).toEqual(["objects/entity/a.json"]);
  });

  it("compares ui/ files byte for byte, and names a file only one side holds", () => {
    const draft = files(manifest, { "ui/index.json": '{"a":1}', "objects/entity/a.json": "{}" });
    const built = files(manifest, { "ui/index.json": '{ "a": 1 }' });
    expect(compareDraft(draft, built)).toEqual(["objects/entity/a.json", "ui/index.json"]);
  });
});

const editJson = (files: Map<string, Buffer>, name: string, edit: (value: any) => void): void => {
  const value = JSON.parse(files.get(name)!.toString("utf8"));
  edit(value);
  files.set(name, Buffer.from(`${JSON.stringify(value, null, 2)}\n`));
};

describe("refusal messages a reader outside AgentFlow can act on", { timeout: 30_000 }, () => {
  it("says an entity's access member is missing, and which values are accepted", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => editJson(files, "objects/entity/item.json", (e) => delete e.access));
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.message).toContain("objects/entity/item.json#/access: ");
    expect(error.message).toContain("has no access member");
    expect(error.message).toContain('"everyone" or "restricted"');
    expect(error.message).not.toContain("nothing");
  });

  it("lists the accepted access values when the mode is another value", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => editJson(files, "objects/entity/item.json", (e) => (e.access = { mode: "restricted" })));
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.message).toContain('"everyone" or "restricted"');
    expect(error.message).toContain('{"mode":"restricted"}');
  });

  it("names the draft's manifest.json, not a converted file, when a manifest member is missing", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => editJson(files, "manifest.json", (m) => delete m.audience));
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    expect(error.message).toContain("manifest.json#/audience: missing");
    expect(error.message).not.toContain("package-manifest.json");
    expect(error.message).toContain("pack the app again");
    expect(error.message).not.toContain("The builder requires");
    expect(error.files).toEqual(["manifest.json"]);
  });

  it("does not rename a launcher pointer to a draft member of the same name", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => editJson(files, "manifest.json", (m) => (m.launcher = { entries: [{ target: 5 }] })));
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_UNSUPPORTED");
    if (error.message.includes("package-manifest.json#/launcher")) {
      expect(error.message).toContain("converted config/package-manifest.json");
    } else {
      expect(error.message).not.toMatch(/ manifest\.json#\/(launcher|configVersion)/);
    }
  });

  it("names the members that differ, not only the files", async () => {
    const zip = rezip(fixture("tracker.zip"), (files) => editJson(files, "manifest.json", (m) => delete m.grants));
    const error = await refusal(convertDraft(zip, path.join(scratch(), "app")));
    expect(error.code).toBe("DRAFT_REBUILD_DIFFERS");
    expect(error.message).toContain("manifest.json#/grants");
    expect(error.files).toEqual(["package/manifest.json"]);
  });

  it("caps the differing members at a handful and counts the rest", () => {
    const many = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`m${i}`, i]));
    const draft = new Map([["manifest.json", Buffer.from(JSON.stringify(many))]]);
    const built = new Map([["manifest.json", Buffer.from("{}")]]);
    const lines = describeDifferences(draft, built);
    expect(lines).toEqual(["manifest.json#/m0, manifest.json#/m1, manifest.json#/m2, manifest.json#/m3, manifest.json#/m4 and 4 more"]);
  });

  it("says which side holds a file only one side has, and when bytes differ", () => {
    const json = (v: unknown) => Buffer.from(JSON.stringify(v));
    const draft = new Map([["only-draft.json", json({})], ["ui/index.js", Buffer.from("a")], ["notes.txt", Buffer.from("x")]]);
    const built = new Map([["only-built.json", json({})], ["ui/index.js", Buffer.from("b")], ["notes.txt", Buffer.from("y")]]);
    expect(describeDifferences(draft, built)).toEqual([
      "notes.txt (bytes differ)",
      "only-built.json (the draft does not have it, the build writes it)",
      "only-draft.json (the draft has it, the build does not write it)",
      "ui/index.js (bytes differ)",
    ]);
  });

  it("prints the next step the skill gives, with pnpm check", async () => {
    const cwd = scratch();
    const out = await run(cwd, ["init", "app", "--from", path.join(here, "../fixtures/drafts/tracker.zip")]);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain("cd app && pnpm install && pnpm build && pnpm check");
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "app/package.json"), "utf8"));
    expect(pkg.scripts.check).toBe("agentflow-app build --check");
  });
});

async function run(cwd: string, argv: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const chunks = { stdout: [] as string[], stderr: [] as string[] };
  const sink = (into: string[]) => new Writable({ write(chunk, _encoding, done) { into.push(String(chunk)); done(); } });
  const code = await main(argv, { cwd, stdout: sink(chunks.stdout), stderr: sink(chunks.stderr) });
  return { code, stdout: chunks.stdout.join(""), stderr: chunks.stderr.join("") };
}

describe("init --from", { timeout: 30_000 }, () => {
  it.each([["--prefix", "acme"], ["--key", "x"], ["--no-ui"], ["--no-site"]])("is a usage error with %s", async (...flag) => {
    const cwd = scratch();
    const out = await run(cwd, ["init", "app", "--from", path.join(here, "../fixtures/drafts/tracker.zip"), ...flag, "--json"]);
    expect(out.code).toBe(2);
    expect(JSON.parse(out.stdout).error.code).toBe("USAGE");
    expect(fs.readdirSync(cwd)).toEqual([]);
  });

  it("converts the draft into the folder", async () => {
    const cwd = scratch();
    const out = await run(cwd, ["init", "app", "--from", path.join(here, "../fixtures/drafts/tracker.zip"), "--json"]);
    expect(out.code).toBe(0);
    const data = JSON.parse(out.stdout);
    expect(data.dir).toBe(path.join(cwd, "app"));
    expect(data.files).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(cwd, "app/agentflow.app.mjs"))).toBe(true);
  });

  it("refuses a draft file it cannot read", async () => {
    const cwd = scratch();
    const out = await run(cwd, ["init", "app", "--from", "missing.zip"]);
    expect(out.code).toBe(1);
    expect(out.stderr.startsWith("DRAFT_INVALID: ")).toBe(true);
  });

  it("names the files a draft that does not rebuild differs at", async () => {
    const cwd = scratch();
    const out = await run(cwd, ["init", "app", "--from", path.join(here, "../fixtures/drafts/schedules.zip"), "--json"]);
    expect(out.code).toBe(1);
    const { error } = JSON.parse(out.stdout);
    expect(["DRAFT_REBUILD_DIFFERS", "DRAFT_UNSUPPORTED"]).toContain(error.code);
    expect(error.files.length).toBeGreaterThan(0);
    expect(fs.readdirSync(cwd)).toEqual([]);
  });
});
