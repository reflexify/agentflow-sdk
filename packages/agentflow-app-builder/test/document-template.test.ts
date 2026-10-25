import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { documentTemplateObject } from "../src/document-template.js";
import { copyApp, writeApp } from "./app-fixture.js";
import { runCli } from "./http-stub.js";

const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };
const id = (n: number): string => `0190f8f4-0000-7000-8000-${n.toString(16).padStart(12, "0")}`;

const letter = () => ({
  key: "approval_letter",
  name: "Approval letter",
  description: "The letter an employee gets when their leave is approved.",
  schema_json: {
    type: "object",
    properties: {
      number: { type: "string", title: "Request number" },
      person: { type: "object", properties: { name: { type: "string" } } },
      notes: { type: "string" },
    },
    "x-order": ["number", "person", "notes"],
  },
  template: {
    version: 1,
    blocks: [
      { id: id(1), type: "heading", level: 1, content: [{ type: "text", value: "Leave approved" }] },
      {
        id: id(2),
        type: "text",
        content: [
          { type: "text", value: "Your request " },
          { type: "field_ref", path: "number" },
          { type: "text", value: " for " },
          { type: "field_ref", path: "person.name" },
        ],
      },
      { id: id(3), type: "column_group", columns: [{ width: "1fr", blocks: [{ id: id(4), type: "rich_text", path: "notes" }] }] },
    ],
  },
});

const configWith = (files: Record<string, unknown>): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-doc-"));
  fs.cpSync(mini, dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "document_templates"));
  for (const [name, file] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, "document_templates", name), typeof file === "string" ? file : JSON.stringify(file));
  }
  return dir;
};

const template = (file: unknown, stem = "approval_letter", entities = ["contact", "note"]) =>
  documentTemplateObject(configWith({ [`${stem}.json`]: file }), `${stem}.json`, entities);

const edited = (edit: (file: any) => void) => {
  const file = letter();
  edit(file);
  return file;
};

const W = "document_templates/approval_letter.json#";

describe("documentTemplateObject", () => {
  it("writes the body the platform installs: the bare block tree under template", () => {
    const [key, body] = template(letter());
    expect(key).toBe("document_template:approval_letter");
    const { key: _key, ...rest } = letter();
    expect(body).toEqual(rest);
  });
  it("keeps sensitive_field_paths and reads an x-entity in the schema as an entity of the package", () => {
    const [, body] = template(edited((f) => {
      f.sensitive_field_paths = ["notes"];
      f.schema_json.properties.contact = { type: "string", "x-entity": "contact" };
    }));
    expect(body).toMatchObject({ sensitive_field_paths: ["notes"], schema_json: { properties: { contact: { "x-entity": "@obj.key:entity:contact" } } } });
  });
  it("refuses the export's envelope, and says what the package carries instead", () => {
    const file = edited((f) => {
      f.template = { mode: "block", kind: "typst", block_tree: f.template };
    });
    expect(() => template(file)).toThrow(`${W}/template: the export's {mode, kind, block_tree} envelope: a package carries the bare block tree {version, blocks}; move block_tree's members up into template`);
  });
  it("refuses a block id that is not a UUID, wherever the block is", () => {
    expect(() => template(edited((f) => (f.template.blocks[0].id = "heading-1")))).toThrow(`${W}/template/blocks/0/id: must be a UUID, such as 0190f8f4-0000-7000-8000-000000000001`);
    expect(() => template(edited((f) => (f.template.blocks[2].columns[0].blocks[0].id = 4)))).toThrow(`${W}/template/blocks/2/columns/0/blocks/0/id: must be a UUID`);
    expect(() => template(edited((f) => (f.template.header = { blocks: [{ type: "spacer" }] })))).toThrow(`${W}/template/header/blocks/0/id: must be a UUID`);
  });
  it("refuses a field reference the schema does not hold", () => {
    expect(() => template(edited((f) => (f.template.blocks[1].content[1].path = "numbr")))).toThrow(`${W}/template/blocks/1/content/1/path: numbr is not a property of schema_json`);
    expect(() => template(edited((f) => (f.template.blocks[2].columns[0].blocks[0].path = "person.age")))).toThrow(`${W}/template/blocks/2/columns/0/blocks/0/path: person.age is not a property of schema_json`);
    expect(() => template(edited((f) => {
      f.template.blocks[1].content[1] = { type: "field_ref", path: "", expression: "number + 1" };
    }))).not.toThrow();
    // As the platform: any expression on a field_ref skips the check, a non-empty one on a rich_text block.
    expect(() => template(edited((f) => (f.template.blocks[1].content[1] = { type: "field_ref", path: "old_hint", expression: "" })))).not.toThrow();
    expect(() => template(edited((f) => Object.assign(f.template.blocks[2].columns[0].blocks[0], { path: "old_hint", expression: " " })))).not.toThrow();
    expect(() => template(edited((f) => Object.assign(f.template.blocks[2].columns[0].blocks[0], { path: "old_hint", expression: "" }))))
      .toThrow("old_hint is not a property of schema_json");
  });
  it("refuses a block type it has no rule for, and every image block", () => {
    expect(() => template(edited((f) => (f.template.blocks[0].type = "chart")))).toThrow(`${W}/template/blocks/0/type: a block type the builder has no rule for: chart`);
    const IMAGE = "a packaged template cannot hold an image yet: AgentFlow renders no image from a submission field, and a package carries no template asset";
    for (const source of [{ kind: "template_asset", asset_id: id(10) }, { kind: "submission_field", field_path: "number" }]) {
      expect(() => template(edited((f) => f.template.blocks.push({ id: id(9), type: "image", source })))).toThrow(`${W}/template/blocks/3/type: ${IMAGE}`);
    }
    expect(() => template(edited((f) => (f.template.header = { blocks: [{ id: id(9), type: "image", source: {} }] })))).toThrow(`${W}/template/header/blocks/0/type: ${IMAGE}`);
  });
  it("takes a template without a layout, as AgentFlow does, and null where AgentFlow takes it", () => {
    expect(template(edited((f) => delete f.template))[1]).not.toHaveProperty("template");
    const [, body] = template(edited((f) => {
      f.description = null;
      Object.assign(f.template, { settings: null, header: null, footer: null });
    }));
    expect(body).not.toHaveProperty("description");
    expect((body as any).template).toMatchObject({ settings: null, header: null, footer: null });
  });
  it("refuses a missing or misshapen required member, and a member it has no rule for", () => {
    expect(() => template(edited((f) => delete f.name))).toThrow(`${W}/name: a non-empty string`);
    expect(() => template(edited((f) => delete f.schema_json))).toThrow(`${W}/schema_json: must be an object (a JSON Schema whose properties the layout reads)`);
    expect(() => template(edited((f) => (f.template = [])))).toThrow(`${W}/template: must be a block tree {version, blocks}`);
    expect(() => template(edited((f) => (f.template.version = 2)))).toThrow(`${W}/template/version: must be 1`);
    expect(() => template(edited((f) => (f.template.blocks = {})))).toThrow(`${W}/template/blocks: must be an array`);
    expect(() => template(edited((f) => (f.layout = {})))).toThrow(`${W}/layout: a member the builder has no rule for`);
    expect(() => template(edited((f) => (f.template.title = "x")))).toThrow(`${W}/template/title: a member the builder has no rule for`);
    expect(() => template(letter(), "letter")).toThrow("document_templates/letter.json#/key: is approval_letter, not letter");
    expect(() => template(edited((f) => (f.key = "approval-letter")), "approval-letter")).toThrow("document_templates/approval-letter.json#/key: must be a key like approval_letter");
  });
});

describe("a document template in the package", () => {
  const step = (templateId: string) => ({
    key: "approve_leave",
    name: "Approve leave",
    description: "Writes the letter.",
    run_as: { policy: "initiator" },
    start_access: { mode: "restricted", group_ids: [] },
    input_schema: null,
    output_schema: null,
    graph: {
      schemaVersion: "1.0",
      name: "Approve leave",
      start: "start",
      end: ["done"],
      nodes: [
        { id: "start", name: "Start", node_type: "start", parameters: { id: "start" }, settings: {} },
        {
          id: "letter", name: "Letter", node_type: "document", settings: {},
          parameters: { id: "letter", documents: [{ id: "letter", documentTemplateId: templateId, format: "pdf", fieldMapping: { "/number": { kind: "literal", value: "1" } } }] },
        },
        { id: "done", name: "Done", node_type: "end", parameters: { id: "done" }, settings: {} },
      ],
      edges: [{ id: "e1", from: "start", to: "letter" }, { id: "e2", from: "letter", to: "done" }],
    },
  });
  const sections = (templateId: string) => ({ workflows: { approve: step(templateId) }, order: ["approve"], triggers: {}, actions: {} });

  it("lists the template before the workflows and resolves ${document_template:key} in a step", () => {
    const files = buildPackage({ configDir: configWith({ "approval_letter.json": letter() }), sections: sections("${document_template:approval_letter}") });
    const objects = JSON.parse(files["manifest.json"]!).objects;
    const keys = objects.map((o: { key: string }) => o.key);
    expect(objects).toContainEqual({ key: "document_template:approval_letter", kind: "document_template" });
    expect(keys.indexOf("document_template:approval_letter")).toBeLessThan(keys.indexOf("workflow:approve_leave"));
    expect(JSON.parse(files["objects/document_template/approval_letter.json"]!).template.blocks).toHaveLength(3);
    const workflow = JSON.parse(files["objects/workflow/approve_leave.json"]!);
    expect(workflow.nodes[1].parameters.documents[0].documentTemplateId).toBe("@obj:document_template:approval_letter");
  });
  it("refuses a document step that names its template other than by reference", () => {
    for (const value of ["approval_letter", "0190f8f4-0000-7000-8000-000000000001"]) {
      expect(() => buildPackage({ configDir: configWith({ "approval_letter.json": letter() }), sections: sections(value) }))
        .toThrow(`workflow approve_leave#/graph/nodes/1/parameters/documents/0/documentTemplateId: name the template with \${document_template:<key>}, not ${value}`);
    }
  });
  it.each([
    ["signature", { documents: [{ id: "d", source: "renderDocumentTemplate", documentTemplateId: "%" }] }, "documents/0/documentTemplateId"],
    ["human", { actions: [], reviewDocuments: [{ id: "d", documentTemplateId: "%" }] }, "reviewDocuments/0/documentTemplateId"],
    ["human", { actions: [], signing: { documents: [{ id: "d", source: "renderDocumentTemplate", documentTemplateId: "%" }] } }, "signing/documents/0/documentTemplateId"],
  ])("checks the template a %s step names (case %#)", (nodeType, params, where) => {
    const withStep = (value: string) => {
      const workflow = step("x");
      workflow.graph.nodes[1] = { id: "letter", name: "Letter", node_type: nodeType, settings: {},
        parameters: { id: "letter", ...JSON.parse(JSON.stringify(params).replace("%", value)) } } as any;
      return () => buildPackage({ configDir: configWith({ "approval_letter.json": letter() }), sections: { workflows: { approve: workflow }, order: ["approve"], triggers: {}, actions: {} } });
    };
    expect(withStep("approval_letter")).toThrow(`workflow approve_leave#/graph/nodes/1/parameters/${where}: name the template with \${document_template:<key>}, not approval_letter`);
    const files = withStep("${document_template:approval_letter}")();
    expect(files["objects/workflow/approve_leave.json"]).toContain('"documentTemplateId": "@obj:document_template:approval_letter"');
  });
  it("leaves a signing document that renders no template alone", () => {
    const workflow = step("x");
    workflow.graph.nodes[1] = { id: "letter", name: "Letter", node_type: "signature", settings: {},
      parameters: { id: "letter", documents: [{ id: "d", source: "upstreamFile", documentTemplateId: "anything" }] } } as any;
    expect(() => buildPackage({ configDir: configWith({}), sections: { workflows: { approve: workflow }, order: ["approve"], triggers: {}, actions: {} } })).not.toThrow();
  });
  it("refuses a reference to a template the package does not build, and a file that is not .json", () => {
    expect(() => buildPackage({ configDir: configWith({ "approval_letter.json": letter() }), sections: sections("${document_template:other}") }))
      .toThrow("@obj:document_template:other names no object, parameter or required entity of the package");
    expect(() => buildPackage({ configDir: configWith({ "letter.yaml": "x: 1" }), sections: empty })).toThrow("document_templates#: letter.yaml is not a .json file");
  });
});

describe("the config/ layout", () => {
  const copy = (): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-layout-"));
    fs.cpSync(mini, dir, { recursive: true });
    return dir;
  };
  const FOLDERS = "the folders are entities, agents, skills, dashboards, document_templates, code and build";
  const build = (dir: string) => () => buildPackage({ configDir: dir, sections: empty });
  it("refuses a folder it does not read that holds more than notes, naming the file", () => {
    const dir = copy();
    fs.mkdirSync(path.join(dir, "templates"));
    fs.writeFileSync(path.join(dir, "templates", "README.md"), "");
    fs.writeFileSync(path.join(dir, "templates", "x.json"), "{}");
    expect(build(dir)).toThrow(`config#: templates/ is not a folder the builder reads (it holds templates/x.json); ${FOLDERS}`);
    fs.rmSync(path.join(dir, "templates"), { recursive: true });
    fs.mkdirSync(path.join(dir, "document_template", "deep"), { recursive: true });
    fs.writeFileSync(path.join(dir, "document_template", "deep", "letter.json"), "{}");
    expect(build(dir)).toThrow("config#: document_template/ is not a folder the builder reads (it holds document_template/deep/letter.json)");
  });
  it("says names are case-sensitive when a folder differs from one it reads only in case", () => {
    const dir = copy();
    fs.mkdirSync(path.join(dir, "Dashboards"));
    fs.writeFileSync(path.join(dir, "Dashboards", "o.json"), "{}");
    expect(build(dir)).toThrow("config#: Dashboards/ is not a folder the builder reads; did you mean dashboards/? Names are case-sensitive");
  });
  it.each(["approval_letter.json", "helpers.mjs", "stamp.js"])("refuses %s directly under config/", (name) => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, name), "");
    expect(build(dir)).toThrow(`config#: ${name} is not a file the builder reads; the files are package-manifest.json and notes (.md, .txt)`);
  });
  it("refuses a skill file outside skills/, pointing at config/skills/", () => {
    const at = (rel: string) => {
      const dir = copy();
      // On a case-insensitive disk Skills/ would be the fixture's skills/, so that one is removed first.
      fs.rmSync(path.join(dir, "skills"), { recursive: true });
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), "---\nname: triage\ndescription: Triage.\n---\n");
      return build(dir);
    };
    expect(at("skill/triage.SKILL.md")).toThrow("config#: skill/ is not a folder the builder reads (it holds skill/triage.SKILL.md, a skill: skills go in config/skills/)");
    expect(at("Skills/triage.SKILL.md")).toThrow("config#: Skills/ is not a folder the builder reads; did you mean skills/? Names are case-sensitive");
    expect(at("triage.SKILL.md")).toThrow("config#: triage.SKILL.md is a skill: skills go in config/skills/");
    expect(at("agents/triage.skill.md")).toThrow("agents#: triage.skill.md is a skill: skills go in config/skills/");
  });
  it("refuses a link to nothing, naming it", () => {
    const dir = copy();
    fs.symlinkSync(path.join(dir, "nowhere"), path.join(dir, "dangling"));
    expect(build(dir)).toThrow("config#: dangling is a link to nothing");
  });
  it("ignores the files an operating system leaves", () => {
    const dir = copy();
    for (const name of ["desktop.ini", "Thumbs.db"]) {
      fs.writeFileSync(path.join(dir, name), "");
      fs.writeFileSync(path.join(dir, "entities", name), "");
    }
    expect(build(dir)).not.toThrow();
  });
  it("ignores a folder of notes inside a folder it reads, and refuses one holding anything else as a folder", () => {
    const dir = copy();
    for (const folder of ["entities", "agents", "skills"]) {
      fs.mkdirSync(path.join(dir, folder, "drafts"));
      fs.writeFileSync(path.join(dir, folder, "drafts", "a.txt"), "");
    }
    fs.mkdirSync(path.join(dir, "entities", "notes"));
    fs.writeFileSync(path.join(dir, "entities", "notes", "a.md"), "");
    expect(Object.keys(build(dir)())).toEqual(Object.keys(buildPackage({ configDir: mini, sections: empty })));
    fs.writeFileSync(path.join(dir, "entities", "notes", "old.json"), "{}");
    expect(build(dir)).toThrow("entities#: notes/ is a folder holding notes/old.json; entities/ holds .json files and notes only");
    fs.rmSync(path.join(dir, "entities", "notes"), { recursive: true });
    fs.writeFileSync(path.join(dir, "skills", "drafts", "triage.md"), "");
    expect(build(dir)).toThrow("skills#: drafts/ is a folder holding drafts/triage.md; skills/ holds .SKILL.md files and .txt notes only");
  });
  it("ignores notes: .md and .txt files anywhere, and a folder that holds only notes", () => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, "README.md"), "# notes");
    fs.writeFileSync(path.join(dir, "todo.txt"), "");
    fs.mkdirSync(path.join(dir, "notes", "old"), { recursive: true });
    fs.writeFileSync(path.join(dir, "notes", "x.md"), "");
    fs.writeFileSync(path.join(dir, "notes", "old", "y.txt"), "");
    fs.writeFileSync(path.join(dir, "notes", ".DS_Store"), "");
    fs.writeFileSync(path.join(dir, "skills", "notes.txt"), "");
    for (const folder of ["entities", "agents"]) fs.writeFileSync(path.join(dir, folder, "README.md"), "");
    const files = buildPackage({ configDir: dir, sections: empty });
    expect(Object.keys(files)).toEqual(Object.keys(buildPackage({ configDir: mini, sections: empty })));
  });
  it.each(["triage.md", "README.md", "triage.skill.md"])("refuses skills/%s: a .md in skills/ is skill content", (name) => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, "skills", name), "");
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow(`skills#: ${name} is not a .SKILL.md file: a skill's file is <name>.SKILL.md`);
  });
  it("refuses a file where it reads a folder", () => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, "dashboards"), "");
    expect(build(dir)).toThrow("config#: dashboards is a file, where the builder reads a folder");
  });
  it("takes every folder it reads, and ignores dotfiles", () => {
    const dir = copy();
    for (const folder of ["dashboards", "document_templates", "code", "build"]) fs.mkdirSync(path.join(dir, folder));
    fs.writeFileSync(path.join(dir, ".DS_Store"), "");
    expect(() => buildPackage({ configDir: dir, sections: empty })).not.toThrow();
  });
});

describe("a document template through the CLI", () => {
  it("builds, checks clean and lists the template in the generated types", async () => {
    const app = copyApp();
    fs.mkdirSync(path.join(app, "config/document_templates"));
    fs.writeFileSync(path.join(app, "config/document_templates/approval_letter.json"), JSON.stringify(letter(), null, 2));
    const sections = {
      workflows: {
        approve: {
          key: "approve_leave", name: "Approve leave", description: "Writes the letter.",
          run_as: { policy: "initiator" }, start_access: { mode: "restricted", group_ids: [] },
          graph: {
            schemaVersion: "1.0", name: "Approve leave", start: "start", end: ["done"],
            nodes: [
              { id: "start", name: "Start", node_type: "start", parameters: { id: "start" }, settings: {} },
              { id: "letter", name: "Letter", node_type: "document", settings: {}, parameters: { id: "letter", documents: [{ id: "letter", documentTemplateId: "${document_template:approval_letter}", format: "pdf", fieldMapping: {} }] } },
              { id: "done", name: "Done", node_type: "end", parameters: { id: "done" }, settings: {} },
            ],
            edges: [{ id: "e1", from: "start", to: "letter" }, { id: "e2", from: "letter", to: "done" }],
          },
        },
      },
      order: ["approve"], triggers: {}, actions: {},
    };
    writeApp(app, `export default { sections: ${JSON.stringify(sections)}, entityOrder: ["note", "contact"] };\n`);
    expect((await runCli(app, ["build"])).code).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(app, "package/objects/document_template/approval_letter.json"), "utf8")).name).toBe("Approval letter");
    expect(fs.readFileSync(path.join(app, "package/objects/workflow/approve_leave.json"), "utf8")).toContain('"documentTemplateId": "@obj:document_template:approval_letter"');
    expect(await runCli(app, ["build", "--check"])).toMatchObject({ code: 0 });
    expect((await runCli(app, ["types"])).code).toBe(0);
    expect(fs.readFileSync(path.join(app, "src/generated/app.ts"), "utf8"))
      .toContain("'document_template:approval_letter': { kind: 'document_template', contractVersion: '1.0.0' },");
  });
});
