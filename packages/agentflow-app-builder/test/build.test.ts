import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { EXTENSIONS_PLATFORM } from "../src/invariants.js";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };

describe("buildPackage", () => {
  it("discovers every entity file and emits a manifest without ui", () => {
    const files = buildPackage({ configDir, sections: empty });
    const manifest = JSON.parse(files["manifest.json"]!);
    expect("ui" in manifest).toBe(false);
    expect(manifest.objects.map((o: { key: string }) => o.key)).toContain("entity:contact");
    expect(Object.keys(files)).toContain("objects/entity/note.json");
  });
  it("refuses an entity member it has no rule for", () => {
    expect(() => buildPackage({ configDir: path.join(configDir, "../../bad-member/config"), sections: empty })).toThrow(
      "entities/note.json#/colour: a member the builder has no rule for",
    );
  });
});

describe("an entity's work.module_page", () => {
  const states = ["staff", "ai_summary", "held_message", "system", "event"];
  const buildNote = (ui: boolean): Record<string, string> => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const note = path.join(dir, "entities/note.json");
    const entity = JSON.parse(fs.readFileSync(note, "utf8"));
    entity.work = {
      lifecycle: { status_field: "kind", categories: Object.fromEntries(states.map((s) => [s, "active"])) },
      assignable: {},
      work_surface: {},
      module_page: "/notes/{{ record_id }}",
    };
    fs.writeFileSync(note, JSON.stringify(entity));
    if (ui) {
      const file = path.join(dir, "package-manifest.json");
      const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
      manifest.ui = { kind: "module", entry: "ui/index.js", contract: 2 };
      fs.writeFileSync(file, JSON.stringify(manifest));
    }
    return buildPackage({ configDir: dir, sections: empty });
  };
  it("is carried into the entity object when the package has a ui, and refused when it has none", () => {
    expect(JSON.parse(buildNote(true)["objects/entity/note.json"]!).work.module_page).toBe("/notes/{{ record_id }}");
    expect(() => buildNote(false)).toThrow("entities/note.json#/work/module_page: needs the package's ui");
  });
});

describe("entityOrder", () => {
  const keys = (files: Record<string, string>): string[] => JSON.parse(files["manifest.json"]!).objects.map((o: { key: string }) => o.key);
  it("lists entities sorted unless an order is given", () => {
    expect(keys(buildPackage({ configDir, sections: empty })).filter((k) => k.startsWith("entity:"))).toEqual(["entity:contact", "entity:note"]);
    const files = buildPackage({ configDir, sections: empty, entityOrder: ["note", "contact"] });
    expect(keys(files).filter((k) => k.startsWith("entity:"))).toEqual(["entity:note", "entity:contact"]);
  });
  it("refuses an order that does not name the entity files", () => {
    expect(() => buildPackage({ configDir, sections: empty, entityOrder: ["note"] })).toThrow("entities#: holds contact,note where entityOrder names note");
  });
});

describe("discovery", () => {
  const copy = (): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    return dir;
  };
  it.each(["entities", "agents", "skills"])("refuses a file in %s that is not .json (.SKILL.md for skills)", (where) => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, where, "stray.yaml"), "");
    const kind = where === "skills" ? ".SKILL.md" : ".json";
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow(`${where}#: stray.yaml is not a ${kind} file`);
  });
  it("refuses a file in dashboards that is not .json, and emits a dashboard after the entities", () => {
    const dir = copy();
    fs.mkdirSync(path.join(dir, "dashboards"));
    fs.writeFileSync(path.join(dir, "dashboards", "b.json"), JSON.stringify({ key: "b", name: "B", tiles: [] }));
    fs.writeFileSync(path.join(dir, "dashboards", "a.json"), JSON.stringify({ key: "a", name: "A", tiles: [] }));
    const files = buildPackage({ configDir: dir, sections: empty });
    const keys = JSON.parse(files["manifest.json"]!).objects.map((o: { key: string }) => o.key);
    expect(keys.slice(-2)).toEqual(["dashboard:a", "dashboard:b"]);
    expect(Object.keys(files)).toContain("objects/dashboard/a.json");
    fs.writeFileSync(path.join(dir, "dashboards", "stray.yaml"), "");
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow("dashboards#: stray.yaml is not a .json file");
  });
  it("ignores dotfiles", () => {
    const dir = copy();
    fs.writeFileSync(path.join(dir, "entities", ".DS_Store"), "");
    expect(Object.keys(buildPackage({ configDir: dir, sections: empty }))).toContain("objects/entity/note.json");
  });
});

describe("an entity file's required members", () => {
  const without = (member: string, value?: unknown): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "entities", "note.json");
    const entity = JSON.parse(fs.readFileSync(file, "utf8"));
    if (value === undefined) delete entity[member];
    else entity[member] = value;
    fs.writeFileSync(file, JSON.stringify(entity));
    return dir;
  };
  it.each([
    ["name", undefined, "/name: a non-empty string"],
    ["name", 3, "/name: a non-empty string"],
    ["fields", undefined, "/fields: an array of fields"],
    ["fields", {}, "/fields: an array of fields"],
    ["views", undefined, "/views: an array of views"],
    ["access", undefined, "/access: an object with a mode and grants"],
    ["access", { mode: "restricted", grants: {} }, "/access/grants: must be an array"],
    ["access", { grants: [] }, "/access/mode: one of everyone, restricted"],
    ["access", { mode: "open", grants: [] }, "/access/mode: one of everyone, restricted"],
  ])("refuses %s %j with a location", (member, value, message) => {
    expect(() => buildPackage({ configDir: without(member, value), sections: empty })).toThrow(`entities/note.json#${message}`);
  });
});

describe("entity invariants", () => {
  const withNote = (members: object): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "entities", "note.json");
    fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), ...members }));
    return dir;
  };
  const rules = (groupId: string) => ({ rules: [{ key: "frozen", message: "Frozen", condition: { join: "and", leaves: [
    { kind: "write", write: { op: "actor", negate: true, test: { kind: "in_group", group_id: groupId } } }] } }] });
  it("adds rules and a stage model after conversation, against the manifest's parameters", () => {
    const stage = { stage_model: { status_field: "kind", transitions: [] } };
    const conversation = { conversation: { messages: { entity_id: "${entity:contact}", via: "ticket" } } };
    const files = buildPackage({ configDir: withNote({ ...conversation, ...stage, ...rules("${param:support_group_id}") }), sections: empty });
    const note = JSON.parse(files["objects/entity/note.json"]!);
    expect(Object.keys(note).slice(-3)).toEqual(["conversation", "rules", "stage_model"]);
    expect(note.rules[0].condition.leaves[0].write.test.group_id).toBe("@param:support_group_id");
  });
  it("refuses a grant to a parameter that is not a group_ref of the manifest", () => {
    const access = (id: string) => ({ access: { mode: "restricted", grants: [{ principal: { kind: "group", id }, operations: [{ operation: "read", scope: "organization" }] }] } });
    expect(() => buildPackage({ configDir: withNote(access("${param:support_group_id}")), sections: empty })).not.toThrow();
    expect(() => buildPackage({ configDir: withNote(access("${param:automation_principal_id}")), sections: empty })).toThrow(
      "entities/note.json#/access/grants/0/principal/id: automation_principal_id is not a group_ref parameter",
    );
  });
  it("refuses a group that is not a group_ref parameter of the manifest", () => {
    expect(() => buildPackage({ configDir: withNote(rules("${param:automation_principal_id}")), sections: empty })).toThrow(
      "entities/note.json#/rules/0/condition/leaves/0/write/test/group_id: automation_principal_id is not a group_ref parameter",
    );
  });
  describe("a source", () => {
    const sourced = (sources: Record<string, object>): string => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
      fs.cpSync(configDir, dir, { recursive: true });
      const manifest = path.join(dir, "package-manifest.json");
      const source = JSON.parse(fs.readFileSync(manifest, "utf8"));
      source.parameters.push({ key: "erp", type: "connection_ref", required: true, label: "ERP" });
      fs.writeFileSync(manifest, JSON.stringify(source));
      for (const [key, member] of Object.entries(sources)) {
        const file = path.join(dir, "entities", `${key}.json`);
        fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), source: member }));
      }
      return dir;
    };
    const contact = { connection: "${param:erp}", stream: "contact", fields: { email: { from: "email" } }, on_delete: "delete" };
    const note = {
      connection: "${param:erp}",
      stream: "note",
      fields: { body: { from: "text" }, ticket: { ref: "${entity:contact}", key: ["contact_erp_id"] } },
      on_delete: "delete",
    };
    it("is written into the entity's body with its sentinels, after the members that precede it", () => {
      const files = buildPackage({ configDir: sourced({ contact, note }), sections: empty });
      const body = JSON.parse(files["objects/entity/note.json"]!);
      expect(Object.keys(body).at(-1)).toBe("source");
      expect(body.source.connection).toBe("@param:erp");
      expect(body.source.fields.ticket.ref).toBe("@obj:entity:contact");
    });
    it("is refused where verification would refuse it, before the package is written", () => {
      expect(() => buildPackage({ configDir: sourced({ note }), sections: empty })).toThrow(
        "entities/note.json#/source/fields/ticket/ref: contact is not read through the same connection as note",
      );
    });
  });
});

describe("a package that depends on another", () => {
  const DEP = "${dep:rfx/erp-core#entity:purchase_order_line}";
  const requires = [{ id: "rfx/erp-core", range: "^1.0.0", access: { "entity:purchase_order_line": { access: "read", fields: [] } } }];
  const build = (change: (manifest: any, entity: any) => void): Record<string, string> => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "package-manifest.json");
    const note = path.join(dir, "entities/note.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    const entity = JSON.parse(fs.readFileSync(note, "utf8"));
    manifest.parameters.push(
      { key: "erp", type: "connection_ref", category: "erp", required: true, label: "ERP connection", help: "The ERP." },
      { key: "title", type: "text", required: false, label: "Title", help: "A title." },
    );
    change(manifest, entity);
    fs.writeFileSync(file, JSON.stringify(manifest));
    fs.writeFileSync(note, JSON.stringify(entity));
    return buildPackage({ configDir: dir, sections: empty });
  };
  const withLine = (m: any, e: any): void => {
    e.fields.push({ key: "po_line", label: "Line", type: "reference", target_entity_id: DEP });
    m.requires.packages = requires;
  };

  it("writes exports as logical keys and refuses one that names no entity", () => {
    expect(JSON.parse(build((m) => { m.exports = ["${entity:note}"]; })["manifest.json"]!).exports).toEqual(["entity:note"]);
    expect(JSON.parse(build(() => {})["manifest.json"]!).exports).toEqual([]);
    expect(() => build((m) => { m.exports = ["${entity:ghost}"]; })).toThrow(/names no entity/);
    expect(() => build((m) => { m.exports = ["${entity:note}", "${entity:note}"]; })).toThrow(/twice/);
  });
  it("passes requires.packages through and translates a dep reference", () => {
    const files = build(withLine);
    expect(JSON.parse(files["manifest.json"]!).requires.packages).toEqual(requires);
    expect(JSON.parse(files["objects/entity_field/note__po_line.json"]!).target_entity_id).toBe("@dep:rfx/erp-core#entity:purchase_order_line");
  });
  it("names a required package's entity in a create form's picker", () => {
    const withForm = (m: any, e: any): void => {
      withLine(m, e);
      e.create_form = { name: "Note", schema: { type: "object", properties: {
        po_line: { type: "string", format: "entity", "x-entity": DEP, "x-entityField": "po_line" } } } };
    };
    const form = JSON.parse(build(withForm)["objects/form/note.json"]!);
    expect(form.schema_json.properties.po_line["x-entity"]).toBe("@dep.key:rfx/erp-core#entity:purchase_order_line");
    expect(() => build((m, e) => { withForm(m, e); m.requires.packages = []; })).toThrow(/rfx\/erp-core/);
  });
  it("refuses a dep reference to a package the manifest does not require", () => {
    expect(() => build((m, e) => { withLine(m, e); m.requires.packages = []; })).toThrow(/rfx\/erp-core/);
    expect(() => build((m, e) => { withLine(m, e); delete m.requires.packages; })).toThrow(/rfx\/erp-core/);
  });
  it("refuses a dep reference that is not a package id and an entity key", () => {
    for (const bad of ["${dep:erp-core#entity:x}", "${dep:rfx/erp--core#entity:x}", "${dep:rfx/erp-core-#entity:x}", "${dep:RFX/erp#entity:x}", "${dep:rfx/erp-core#entity:x-y}", "${dep:r/erp#entity:x}"]) {
      expect(() => build((m, e) => { withLine(m, e); e.fields.at(-1).target_entity_id = bad; }), bad).toThrow(/authoring reference the builder does not know/);
    }
  });
  it("translates an egress connection entry and refuses one naming no connection parameter", () => {
    const egress = (connection: string) => (m: any) => { m.egress = [{ connection, purpose: "Reading the ERP" }]; };
    expect(JSON.parse(build(egress("${param:erp}"))["manifest.json"]!).egress).toEqual([{ connection: "@param:erp", purpose: "Reading the ERP" }]);
    expect(() => build(egress("${param:title}"))).toThrow(/title is not a connection_ref parameter/);
    expect(() => build(egress("${param:nope}"))).toThrow(/nope is not a connection_ref parameter/);
    expect(() => build(egress("erp"))).toThrow(/must be a \$\{param:key\}/);
    const written = (m: any) => { m.egress = [{ host: "api.example.com", purpose: "Sends ${total} to ops" }, { connection: "${param:erp}", purpose: "Reads ${all}" }]; };
    expect(JSON.parse(build(written)["manifest.json"]!).egress).toEqual([
      { host: "api.example.com", purpose: "Sends ${total} to ops" },
      { connection: "@param:erp", purpose: "Reads ${all}" },
    ]);
  });
});

describe("an assistant label for the name field", () => {
  it("is taken, since every entity has a name field the install adds", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    manifest.assistant = { labels: { vi: { note: { fields: { name: "Tên" } } } } };
    fs.writeFileSync(file, JSON.stringify(manifest));
    expect(JSON.parse(buildPackage({ configDir: dir, sections: empty })["manifest.json"]!).assistant.labels.vi.note.fields).toEqual({ name: "Tên" });
    manifest.assistant = { labels: { vi: { note: { fields: { ghost: "Ma" } } } } };
    fs.writeFileSync(file, JSON.stringify(manifest));
    expect(() => buildPackage({ configDir: dir, sections: empty })).toThrow(/ghost/);
  });
});

describe("a Groups picker in a create form", () => {
  const GROUPS = "ffffffff-0000-0000-0000-000000000002";
  const build = (listed: boolean): Record<string, string> => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "package-manifest.json");
    const note = path.join(dir, "entities/note.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    const entity = JSON.parse(fs.readFileSync(note, "utf8"));
    if (listed) manifest.requires.entities.push({ key: "group", access: "read", fields: {} });
    entity.fields.push({ key: "visible_to", label: "Visible to", type: "reference_list", target_entity_id: GROUPS, sortable: false });
    entity.create_form = { name: "Note", schema: { type: "object", properties: {
      visible_to: { type: "array", items: { type: "string", format: "entity" }, "x-entity": "group", "x-entityField": "visible_to" } } } };
    fs.writeFileSync(file, JSON.stringify(manifest));
    fs.writeFileSync(note, JSON.stringify(entity));
    return buildPackage({ configDir: dir, sections: empty });
  };
  it("builds as the key form once the manifest lists group, and is refused until then", () => {
    const form = JSON.parse(build(true)["objects/form/note.json"]!);
    expect(form.schema_json.properties.visible_to["x-entity"]).toBe("@req.key:entity:group");
    expect(JSON.parse(build(true)["objects/entity_field/note__visible_to.json"]!).target_entity_id).toBe("@req:entity:group");
    expect(() => build(false)).toThrow("@req:entity:group names no object, parameter or required entity of the package");
  });
});

describe("an entity extension", () => {
  const consumer = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../fixtures/erp-consumer/config");
  const vendorRisk = {
    key: "vendor_risk",
    extends: "${dep:rfx/erp-core#entity:vendor}",
    fields: [
      {
        key: "risk_rating",
        type: "enum",
        label: "Risk rating",
        enum_values: [{ value: "low", label: "Low" }, { value: "high", label: "High" }],
      },
    ],
    source: { fields: { risk_rating: { from: "custom.risk_rating", values: { L: "low", H: "high" } } } },
  };
  const build = (extensions: Record<string, unknown>, change: (manifest: any) => void = () => {}): Record<string, string> => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(consumer, dir, { recursive: true });
    if (Object.keys(extensions).length > 0) fs.mkdirSync(path.join(dir, "entity_extensions"));
    for (const [name, body] of Object.entries(extensions)) {
      fs.writeFileSync(path.join(dir, "entity_extensions", name), typeof body === "string" ? body : JSON.stringify(body));
    }
    const file = path.join(dir, "package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    change(manifest);
    fs.writeFileSync(file, JSON.stringify(manifest));
    return buildPackage({ configDir: dir, sections: empty });
  };
  const objectKeys = (files: Record<string, string>): { key: string; kind: string }[] => JSON.parse(files["manifest.json"]!).objects;

  it("builds config/entity_extensions/<key>.json into objects/entity_extension/<key>.json with @dep: and lists it in the manifest", () => {
    const files = build({ "vendor_risk.json": vendorRisk });
    expect(JSON.parse(files["objects/entity_extension/vendor_risk.json"]!)).toEqual({
      ...vendorRisk,
      extends: "@dep:rfx/erp-core#entity:vendor",
    });
    expect(objectKeys(files)).toContainEqual({ key: "entity_extension:vendor_risk", kind: "entity_extension" });
    expect(JSON.parse(files["manifest.json"]!).exports).toEqual([]);
  });

  it("is no entity: it adds no entity, field or view object and changes none of the package's other files", () => {
    const base = build({});
    const files = build({ "vendor_risk.json": vendorRisk });
    const added = Object.keys(files).filter((name) => !(name in base));
    expect(added).toEqual(["objects/entity_extension/vendor_risk.json"]);
    for (const name of Object.keys(base)) if (name !== "manifest.json") expect(files[name], name).toBe(base[name]);
    const [{ kind }] = objectKeys(files).filter(({ key }) => key === "entity_extension:vendor_risk");
    expect(kind).toBe("entity_extension");
    expect(objectKeys(files).filter((o) => !objectKeys(base).some((b) => b.key === o.key))).toEqual([
      { key: "entity_extension:vendor_risk", kind: "entity_extension" },
    ]);
  });

  it("builds one extension for each target and refuses a second extension of one, naming its file", () => {
    const item = (key: string, entity: string) => ({ ...vendorRisk, key, extends: `\${dep:rfx/erp-core#entity:${entity}}` });
    const both = (m: any): void => {
      m.requires.packages[0].access["entity:item"] = { access: "read", fields: [] };
    };
    expect(() => build({ "a_vendor.json": item("a_vendor", "vendor"), "b_item.json": item("b_item", "item") }, both)).not.toThrow();
    expect(() => build({ "a_vendor.json": item("a_vendor", "vendor"), "b_vendor.json": item("b_vendor", "vendor") }, both)).toThrow(
      "entity_extensions/b_vendor.json#/extends: @dep:rfx/erp-core#entity:vendor is already extended by a_vendor",
    );
  });

  it("refuses a target whose package the manifest does not require or declares no access to", () => {
    const extending = (target: string) => ({ "vendor_risk.json": { ...vendorRisk, extends: target } });
    expect(() => build(extending("${dep:rfx/missing#entity:vendor}"))).toThrow(
      "entity_extensions/vendor_risk.json#/extends: rfx/missing is not in the manifest's requires.packages",
    );
    expect(() => build(extending("${dep:rfx/erp-core#entity:item}"))).toThrow(
      "entity_extensions/vendor_risk.json#/extends: rfx/erp-core declares no access to entity:item",
    );
  });

  it("refuses a file that holds another key, one that is no .json, and a body the form refuses", () => {
    expect(() => build({ "other.json": vendorRisk })).toThrow("entity_extensions/other.json#/key: is vendor_risk, not other");
    expect(() => build({ "vendor_risk.yaml": "key: vendor_risk" })).toThrow("entity_extensions#: vendor_risk.yaml is not a .json file");
    expect(() => build({ "vendor_risk.json": { ...vendorRisk, fields: [{ key: "risk_rating", type: "list" }] } })).toThrow(
      "entity_extensions/vendor_risk.json#/fields/0/type",
    );
    expect(() => build({ "vendor_risk.json": "{" })).toThrow("vendor_risk.json");
  });

  it("raises minPlatformVersion to the month that reads extensions, and leaves a package without one as it was", () => {
    const platform = (files: Record<string, string>): string => JSON.parse(files["manifest.json"]!).minPlatformVersion;
    expect(platform(build({}))).toBe("2026.10");
    expect(platform(build({ "vendor_risk.json": vendorRisk }))).toBe(EXTENSIONS_PLATFORM);
    expect(EXTENSIONS_PLATFORM >= "2026.11").toBe(true);
    expect(platform(build({ "vendor_risk.json": vendorRisk }, (m) => { m.minPlatformVersion = "2027.01"; }))).toBe("2027.01");
  });

  it("leaves a note beside the files alone", () => {
    const files = build({ "vendor_risk.json": vendorRisk, "notes.md": "why" });
    expect(Object.keys(files).filter((name) => name.startsWith("objects/entity_extension/"))).toEqual(["objects/entity_extension/vendor_risk.json"]);
  });
});
