import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage, toolWarnings } from "../src/build.js";
import { QUERIED_BY_APP_PLATFORM } from "../src/invariants.js";
import { holdsPercentileOrDuration, MEASURES_PLATFORM } from "../src/measures.js";
import { DOCUMENT_PLATFORM } from "../src/document-contract.js";
import { edges, end, graph, INITIATOR, node, restricted, start, TASK_PAGES_PLATFORM, workflow } from "../src/workflow.js";
import { copyApp, writeApp } from "./app-fixture.js";
import { runCli } from "./http-stub.js";

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

describe("a field the app queries", () => {
  const platform = (flag: unknown, declared?: string): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const note = path.join(dir, "entities/note.json");
    const entity = JSON.parse(fs.readFileSync(note, "utf8"));
    if (flag !== undefined) entity.fields[0].queriedByApp = flag;
    fs.writeFileSync(note, JSON.stringify(entity));
    if (declared !== undefined) {
      const file = path.join(dir, "package-manifest.json");
      fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), minPlatformVersion: declared }));
    }
    const files = buildPackage({ configDir: dir, sections: empty });
    expect(JSON.parse(files[`objects/entity_field/note__${entity.fields[0].key}.json`]!).queriedByApp).toBe(flag);
    return JSON.parse(files["manifest.json"]!).minPlatformVersion;
  };

  it("raises minPlatformVersion to the month that reads the member, and never lowers or invents one", () => {
    expect(QUERIED_BY_APP_PLATFORM).toBe("2027.01");
    expect(platform(undefined)).toBe("2026.10");
    expect(platform(true)).toBe(QUERIED_BY_APP_PLATFORM);
    expect(platform(false)).toBe(QUERIED_BY_APP_PLATFORM);
    expect(platform(true, "2027.03")).toBe("2027.03");
    expect(platform(true, "2026.12")).toBe(QUERIED_BY_APP_PLATFORM);
  });
});

describe("a percentile or a duration in a package's dashboards and views", () => {
  const tile = (measure: Record<string, unknown>) => ({
    kind: "number",
    id: "0190f8f4-0000-7000-8000-0000000000a1",
    label: "Open",
    query: { entity_id: "${entity:note}", measures: [{ id: "0190f8f4-0000-7000-8000-0000000000b1", primary: true, ...measure }] },
    position: { row: 0, col: 0, w: 6, h: 5 },
  });
  const duration = { from: "a", to: "b", unit: "hours" };
  const platform = (change: { tile?: Record<string, unknown>; summary?: Record<string, unknown>[]; minPlatformVersion?: string }): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    if (change.tile) {
      fs.mkdirSync(path.join(dir, "dashboards"));
      fs.writeFileSync(path.join(dir, "dashboards", "o.json"), JSON.stringify({ key: "o", name: "O", tiles: [tile(change.tile)] }));
    }
    if (change.summary) {
      const note = path.join(dir, "entities/note.json");
      const entity = JSON.parse(fs.readFileSync(note, "utf8"));
      entity.views[0].config = { summary: { metrics: change.summary } };
      fs.writeFileSync(note, JSON.stringify(entity));
    }
    if (change.minPlatformVersion) {
      const file = path.join(dir, "package-manifest.json");
      fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), minPlatformVersion: change.minPlatformVersion }));
    }
    return JSON.parse(buildPackage({ configDir: dir, sections: empty })["manifest.json"]!).minPlatformVersion;
  };

  it("raises minPlatformVersion for a tile or a view summary that holds one, and leaves a later month and a package without one alone", () => {
    expect(MEASURES_PLATFORM).toBe("2027.01");
    expect(platform({})).toBe("2026.10");
    expect(platform({ tile: { fn: "count" } })).toBe("2026.10");
    expect(platform({ tile: { fn: "percentile", field: "n", percentile: { p: 90 } } })).toBe(MEASURES_PLATFORM);
    expect(platform({ tile: { fn: "median", duration } })).toBe(MEASURES_PLATFORM);
    expect(platform({ summary: [{ id: "0190f8f4-0000-7000-8000-0000000000b2", fn: "avg", duration }] })).toBe(MEASURES_PLATFORM);
    expect(platform({ tile: { fn: "median", duration }, minPlatformVersion: "2027.03" })).toBe("2027.03");
  });

  it("reads only a member of a list of measures, not any member that happens to be named duration", () => {
    expect(holdsPercentileOrDuration({ tiles: [{ query: { measures: [{ fn: "sum", field: "n" }] } }] })).toBe(false);
    expect(holdsPercentileOrDuration({ tiles: [{ label: "x", duration: 3, query: { measures: [{ fn: "sum" }] } }] })).toBe(false);
    expect(holdsPercentileOrDuration({ config: { summary: { metrics: [{ fn: "percentile" }] } } })).toBe(true);
  });
});

describe("an entity's work.document", () => {
  const platform = (document: unknown, minPlatformVersion?: string): { month: string; carried: unknown } => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    if (document !== undefined) {
      const note = path.join(dir, "entities/note.json");
      const entity = JSON.parse(fs.readFileSync(note, "utf8"));
      entity.work = { document };
      fs.writeFileSync(note, JSON.stringify(entity));
    }
    if (minPlatformVersion) {
      const file = path.join(dir, "package-manifest.json");
      fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), minPlatformVersion }));
    }
    const built = buildPackage({ configDir: dir, sections: empty });
    return { month: JSON.parse(built["manifest.json"]!).minPlatformVersion, carried: JSON.parse(built["objects/entity/note.json"]!).work?.document };
  };
  const contract = { context_fields: [], extract_fields: ["kind"] };

  it("is carried as written and raises minPlatformVersion, which a later month and a package without one leave alone", () => {
    expect(DOCUMENT_PLATFORM).toBe("2027.05");
    expect(platform(undefined).month).toBe("2026.10");
    expect(platform(contract)).toEqual({ month: DOCUMENT_PLATFORM, carried: contract });
    expect(platform(contract, "2027.03").month).toBe(DOCUMENT_PLATFORM);
    expect(platform(contract, "2027.06").month).toBe("2027.06");
  });

  it("is refused when it is not an object", () => {
    expect(() => platform("yes")).toThrow("entities/note.json#/work/document: ");
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

describe("a workflow shipped switched on as a tool", () => {
  // acme_inbound_message_desk__ is 27 characters, so a local key of 37 makes the installed key 64.
  const id = "acme/inbound-message-desk";
  const prefix = "acme_inbound_message_desk__";
  const sections = (workflows: Record<string, { key: string; tool_enabled?: boolean }>) => ({
    workflows: workflows as never,
    order: Object.keys(workflows),
    triggers: {},
    actions: {},
  });
  const message = (local: string) =>
    `workflow "${local}": its installed key "${prefix}${local}" is longer than 64 characters, so MCP and A2A clients are not offered it as a tool of its own`;

  it("an installed key over 64 characters warns", () => {
    const at64 = "k".repeat(37);
    const at65 = "k".repeat(38);
    expect(toolWarnings(id, sections({ a: { key: at64, tool_enabled: true } }))).toEqual([]);
    expect(toolWarnings(id, sections({ a: { key: at65, tool_enabled: true } }))).toEqual([message(at65)]);
    // A long key that is not switched on is not offered, so there is nothing to warn about.
    expect(toolWarnings(id, sections({ a: { key: at65 }, b: { key: at65 + "b", tool_enabled: false } }))).toEqual([]);
    expect(toolWarnings(id, sections({ a: { key: at65, tool_enabled: true }, b: { key: "short", tool_enabled: true } }))).toEqual([message(at65)]);
  });

  it("build prints the warning, exits 0, and carries it in --json", async () => {
    const app = copyApp();
    const file = path.join(app, "config/package-manifest.json");
    fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), id }));
    const local = "k".repeat(38);
    const tiny = {
      ...workflow(local, "Tiny", "A tool", INITIATOR, restricted("support_group_id"), graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"]))),
      tool_enabled: true,
    };
    writeApp(app, `export default { sections: ${JSON.stringify({ workflows: { [local]: tiny }, order: [local], triggers: {}, actions: {} })}, entityOrder: ["note", "contact"] };\n`);
    const out = await runCli(app, ["build"]);
    expect(out.code).toBe(0);
    expect(out.stderr).toBe(`warning: ${message(local)}\n`);
    expect(JSON.parse(fs.readFileSync(path.join(app, `package/objects/workflow/${local}.json`), "utf8")).toolEnabled).toBe(true);
    expect(JSON.parse((await runCli(app, ["build", "--json"])).stdout).warnings).toEqual([message(local)]);
  });
});

describe("a Human step's page in a package", () => {
  const build = (page: unknown, ui: boolean, declared?: string): Record<string, string> => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const file = path.join(dir, "package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    if (ui) manifest.ui = { kind: "module", entry: "ui/index.js", contract: 2 };
    if (declared) manifest.minPlatformVersion = declared;
    fs.writeFileSync(file, JSON.stringify(manifest));
    const review = node("review", "Review", "human", page === undefined ? {} : { page });
    const w = workflow("one", "One", "A one step workflow", INITIATOR, restricted("support_group_id"), graph("One", [start(), review, end("done", "Done")], edges(["e1", "start", "review"], ["e2", "review", "done"])));
    return buildPackage({ configDir: dir, sections: { workflows: { one: w }, order: ["one"], triggers: {}, actions: {} } });
  };
  const page = { path: "/tasks/{{ record_id }}", mode: "redirect" };

  it("a package with a task page needs platform 2027.02, and a later month stays", () => {
    expect(TASK_PAGES_PLATFORM).toBe("2027.02");
    const month = (files: Record<string, string>): string => JSON.parse(files["manifest.json"]!).minPlatformVersion;
    expect(month(build(page, true))).toBe("2027.02");
    expect(month(build(page, true, "2027.04"))).toBe("2027.04");
    expect(month(build(undefined, true))).toBe("2026.10");
    expect(JSON.parse(build(page, true)["objects/workflow/one.json"]!).nodes[1].parameters.page).toEqual(page);
  });

  it("refuses a page without the package's ui, naming the step", () => {
    expect(() => build(page, false)).toThrow("workflow one#/graph/nodes/1/parameters/page: needs the package's ui");
  });
});
