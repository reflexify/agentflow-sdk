// Every graph the app builds passes its checks (loading the app throws otherwise).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPackage, loadApp, triggerObject } from "@reflexify/agentflow-app-builder";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(configDir, "..");
const { app, options } = await loadApp(appDir);

const readJson = (...segments) => JSON.parse(fs.readFileSync(path.join(configDir, ...segments), "utf8"));

// A search and then a create lets two first emails from one new sender both
// find nothing, and the second create fails on the address being taken. An
// Upsert on the email key is one statement, so the second waits and finds the
// first's contact.
test("Intake and Move make a contact with an upsert on its email, never a search then a create", () => {
  const { workflows } = app.sections;
  for (const name of ["intake", "move_apply"]) {
    const nodes = workflows[name].graph.nodes.filter((n) => n.node_type === "entity_record");
    const writes = new Set(["create", "update", "upsert"]);
    const onContact = nodes.filter((n) => n.parameters.entityId === "${entity:contact}" && writes.has(n.parameters.operation));
    assert.deepEqual(
      onContact.map((n) => [n.id, n.parameters.operation]),
      [["contact_upsert", "upsert"], ["contact_name", "update"]],
      `${name}: the contact steps`,
    );
    const upsert = onContact[0].parameters;
    assert.equal(upsert.matchBy, "key");
    assert.equal(upsert.matchKey, "email");
    assert.deepEqual(upsert.body.map((b) => b.field), ["email"], "the name is written only when the upsert made the contact");
  }
});

// The automation principal acts through the support group, and the desk reads as each person: no service
// principal holds a grant of its own.
test("the ticket app names no service principal in a grant, and takes no relay principal", () => {
  for (const name of fs.readdirSync(path.join(configDir, "entities"))) {
    const entity = readJson("entities", name);
    assert.equal(JSON.stringify(entity).includes('"kind":"service_principal"'), false, `entities/${name} grants a service principal`);
  }
  const parameters = readJson("package-manifest.json").parameters.map((p) => p.key);
  assert.equal(parameters.includes("relay_principal_id"), false);
});

// An app package allows a parameter only as the whole of a string value, so no string of the authoring
// sources may hold a reference after its first character. A workflow takes a parameter through a first
// Set Variable step whose literal value is the whole reference, and a template reads the variable.
function configJsonFiles(dir = configDir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...configJsonFiles(full));
    else if (entry.name.endsWith(".json")) found.push(full);
  }
  return found.sort();
}

test("no string of the authoring sources holds a reference after its first character", () => {
  const found = [];
  const scan = (value, file, pointer) => {
    if (typeof value === "string") {
      if (value.indexOf("${") > 0) found.push(`${file}${pointer}`);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => scan(item, file, `${pointer}/${index}`));
    } else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) scan(item, file, `${pointer}/${key}`);
    }
  };
  for (const file of configJsonFiles()) scan(JSON.parse(fs.readFileSync(file, "utf8")), path.relative(configDir, file), "");
  const { workflows, triggers, actions } = app.sections;
  for (const [group, items] of Object.entries({ workflows, triggers, actions })) {
    for (const [name, item] of Object.entries(items)) scan(item, `build/${group}`, `/${name}`);
  }
  assert.deepEqual(found, []);
});

const packageDir = path.join(appDir, "package");

test("the manifest lists every object file and nothing else", () => {
  const files = buildPackage(options);
  const manifest = JSON.parse(files["manifest.json"]);
  const listed = manifest.objects.map(({ key, kind }) => {
    assert.equal(key.split(":")[0], kind, key);
    return `objects/${kind}/${key.slice(kind.length + 1).replace("/", "__")}.json`;
  });
  assert.deepEqual([...listed].sort(), Object.keys(files).filter((f) => f !== "manifest.json").sort());
});

// The operator copies this file and fills it in, so it names exactly the package's parameters, each in the
// shape its type takes. A Resend connection is named by its provider and account where the Email steps and
// the triggers take it.
test("the example parameters file is every parameter of the package, in the shape its type takes", () => {
  const { parameters } = readJson("package-manifest.json");
  const example = JSON.parse(fs.readFileSync(path.join(configDir, "..", "parameters.example.json"), "utf8"));
  assert.deepEqual(Object.keys(example).sort(), parameters.map((p) => p.key).sort());
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  for (const { key, type } of parameters) {
    const value = example[key];
    if (type === "connection_ref") {
      assert.deepEqual(Object.keys(value).sort(), ["externalAccountId", "provider"], key);
      assert.equal(value.provider, "resend", key);
      assert.equal(typeof value.externalAccountId, "string", key);
    } else if (type.endsWith("_ref")) {
      assert.match(value, uuid, key);
    } else {
      assert.equal(typeof value, "string", key);
    }
  }
});

test("every Code step carries its file's text", () => {
  const files = buildPackage(options);
  let checked = 0;
  for (const w of Object.values(app.sections.workflows)) {
    for (const node of w.graph.nodes) {
      const file = node.parameters?.source?.$file;
      if (!file) continue;
      const packed = JSON.parse(files[`objects/workflow/${w.key}.json`]).nodes.find((n) => n.id === node.id);
      assert.equal(packed.parameters.source, fs.readFileSync(path.join(configDir, file), "utf8"), `${w.key}/${node.id}`);
      checked += 1;
    }
  }
  assert.ok(checked >= 4, "the desk has four Code steps");
});

const strings = function* (value) {
  if (typeof value === "string") yield value;
  else if (value && typeof value === "object") for (const v of Object.values(value)) yield* strings(v);
};

test("no package string holds a sentinel after its first character, or an authoring reference", () => {
  for (const [rel, text] of Object.entries(buildPackage(options))) {
    const json = JSON.parse(text);
    for (const s of strings(json)) {
      assert.ok(!/.@(?:obj|obj\.key|req|req\.key|dep|dep\.key|param|sys):/.test(s), `${rel}: ${s.slice(0, 80)}`);
    }
    const sources = new Set((json.nodes ?? []).map((n) => n.parameters?.source).filter((s) => typeof s === "string"));
    for (const s of strings(json)) {
      if (!sources.has(s)) assert.ok(!s.includes("${"), `${rel}: ${s.slice(0, 80)}`);
    }
  }
});

test("every grant of the config is a grant of the package", () => {
  const manifest = JSON.parse(buildPackage(options)["manifest.json"]);
  const entityGrants = fs.readdirSync(path.join(configDir, "entities"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(configDir, "entities", f), "utf8")).access.grants.length)
    .reduce((a, b) => a + b, 0);
  const startGrants = Object.values(app.sections.workflows)
    .map((w) => w.start_access.group_ids.length).reduce((a, b) => a + b, 0);
  assert.equal(manifest.grants.filter((g) => g.entity).length, entityGrants);
  assert.equal(manifest.grants.filter((g) => g.workflow).length, startGrants);
  assert.ok(manifest.grants.every((g) => g.to.startsWith("@param:")));
});

test("triggers ship off and name their connection by a parameter", () => {
  const files = buildPackage(options);
  for (const rel of Object.keys(files).filter((f) => f.startsWith("objects/trigger/"))) {
    const t = JSON.parse(files[rel]);
    assert.equal(t.enabled, false, rel);
    if (t.kind === "connected_app") {
      assert.equal(t.config.account, "@param:resend_connection_id", rel);
      assert.ok(!("provider" in t.config) && !("external_account_id" in t.config), rel);
    }
  }
});

// A rule the builder has no answer for throws, naming the file and the pointer, instead of dropping or guessing.
function refusedWith(change) {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "desk-config-"));
  try {
    fs.cpSync(configDir, copy, { recursive: true, filter: (src) => !src.includes("node_modules") });
    const file = path.join(copy, "entities", "ticket.json");
    const entity = JSON.parse(fs.readFileSync(file, "utf8"));
    change(entity);
    fs.writeFileSync(file, JSON.stringify(entity));
    let message = "";
    assert.throws(() => buildPackage({ ...options, configDir: copy }), (error) => {
      message = error.message;
      return true;
    });
    return message;
  } finally {
    fs.rmSync(copy, { recursive: true, force: true });
  }
}

test("a field member the package does not list is refused, naming where", () => {
  const message = refusedWith((entity) => { entity.fields[1].sensitive = true; });
  assert.match(message, /^entities\/ticket\.json#\/fields\/1\/sensitive: /);
});

test("a grant that carries design authority is refused", () => {
  const message = refusedWith((entity) => { entity.access.grants[0].design = true; });
  assert.match(message, /^entities\/ticket\.json#\/access\/grants\/0\/design: /);
});

test("a reference to an object the package does not have is refused", () => {
  const message = refusedWith((entity) => { entity.fields[4].target_entity_id = "${entity:nothing}"; });
  assert.match(message, /^objects\/entity_field\/ticket__requester\.json#\/target_entity_id: /);
});

test("a connected_app trigger on another provider than Resend is refused, naming where", () => {
  const keys = new Set(["support_intake"]);
  const trigger = (provider) => ({
    workflow: "support_intake",
    kind: "connected_app",
    config: { provider, external_account_id: "${param:resend_connection_id}", object_type: "email.received", change_kind: "created" },
  });
  assert.equal(triggerObject("intake", trigger("resend"), keys).config.account, "@param:resend_connection_id");
  assert.throws(
    () => triggerObject("intake", trigger("hubspot"), keys),
    (error) => /^trigger intake#\/config\/provider: /.test(error.message),
  );
});

test("the launcher opens the module's main pages", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "manifest.json"), "utf8"));
  assert.deepEqual(
    manifest.launcher.entries.map((e) => [e.key, e.target.module]),
    [["my_tickets", "/f/mine"], ["unclaimed", "/f/unclaimed"], ["held", "/held"], ["autopilot", "/autopilot"]],
  );
});
