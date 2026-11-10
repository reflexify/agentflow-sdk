import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { actionObject, merge, triggerObject } from "../src/index.js";
import {
  bind, call, checkGraph, checkTaskPages, code, create, decision, doc, edges, end, extractText, fork, getById, graph, holdsTaskPage, integration, join, lit, node, notify, NOTIFICATIONS_PLATFORM, otherwise,
  recipient, ref, restricted, search, servicePrincipal, setvar, signature, signer, signing, start, TASK_PAGES_PLATFORM, tpl, update, updateMany, upsert, webhook, when, workflow,
  type SigningOptions,
} from "../src/workflow.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");

const tiny = (key: string) =>
  workflow(
    key,
    "Tiny",
    "A one step workflow",
    servicePrincipal("automation_principal_id"),
    restricted("support_group_id"),
    graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"])),
  );

describe("helpers", () => {
  it("writes End outputs as strings, and refuses a literal that is not one", () => {
    const outputs = { a: ref("x"), b: lit("y"), c: tpl("{{ 1 }}"), d: { ...ref("x"), label: "L" } };
    expect(end("e", "E", undefined, outputs).parameters.outputMapping).toEqual(outputs);
    expect(() => end("e", "E", undefined, { ok: lit(true) }))
      .toThrow(`end step e#/parameters/outputMapping/ok: an End output is a string, so write lit("true"), not lit(true)`);
    expect(() => end("e", "E", undefined, { ok: "x" }))
      .toThrow("end step e#/parameters/outputMapping/ok: ref(...), tpl(...) or a string lit(...)");
  });
  it("builds the principal, restriction and update_many shapes", () => {
    expect(servicePrincipal("p")).toEqual({ policy: "service_principal", service_principal_id: "${param:p}" });
    expect(restricted("a", "b")).toEqual({ mode: "restricted", group_ids: ["${param:a}", "${param:b}"] });
    expect(updateMany("u", "Bulk", "${entity:note}", [], [])).toEqual(
      node("u", "Bulk", "entity_record", { operation: "update_many", entityId: "${entity:note}", filters: [], body: [] }),
    );
  });
  it("writes the unit a created record is filed in only when the step names one", () => {
    const body = [bind("title", lit("x"))];
    const written = (opts?: Parameters<typeof create>[4]) => create("c", "Create", "${entity:case}", body, opts).parameters;
    expect("destinationUnit" in written()).toBe(false);
    expect("destinationUnit" in written({})).toBe(false);
    expect("destinationUnit" in written({ destinationUnit: { from: "creator" } })).toBe(false);
    expect(written({ destinationUnit: { from: "trigger" } }).destinationUnit).toEqual({ mode: "inherit_trigger" });
    expect(written({ destinationUnit: { from: "unit", unit: "nodes.batch.output.record.unit" } }).destinationUnit).toEqual({
      mode: "unit",
      unitId: { kind: "reference", value: "nodes.batch.output.record.unit" },
    });
    expect(written({ destinationUnit: { from: "unit", unit: "${param:court}" } }).destinationUnit).toEqual({
      mode: "unit",
      unitId: { kind: "literal", value: "${param:court}" },
    });
    expect(upsert("u", "Upsert", "${entity:case}", "code", body, { destinationUnit: { from: "trigger" } }).parameters).toMatchObject({
      operation: "upsert",
      matchKey: "code",
      destinationUnit: { mode: "inherit_trigger" },
    });
    expect("destinationUnit" in upsert("u", "Upsert", "${entity:case}", "code", body).parameters).toBe(false);
  });
  it("refuses an option it has no rule for rather than dropping it", () => {
    expect(() => create("c", "Create", "${entity:case}", [], { destination: { from: "trigger" } } as never)).toThrow("create step c#/destination: a member the builder has no rule for");
  });
  it.each([
    ["a unit's id", { from: "unit", unit: "8f6a0dd6-0e2f-4b3f-9d0e-2c1b7a4e5f10" }, "/parameters/destinationUnit/unit: a package never names an organization's unit: bind a context path or a unit_ref parameter"],
    ["an upper case id", { from: "unit", unit: "8F6A0DD6-0E2F-4B3F-9D0E-2C1B7A4E5F10" }, "/parameters/destinationUnit/unit: a package never names an organization's unit"],
    ["an empty unit", { from: "unit", unit: "" }, "/parameters/destinationUnit/unit: name the unit"],
    ["another reference", { from: "unit", unit: "${entity:case}" }, "/parameters/destinationUnit/unit: a unit is a context path or ${param:key}"],
    ["no unit", { from: "unit" }, "/parameters/destinationUnit/unit: name the unit"],
    ["an unknown source", { from: "elsewhere" }, "/parameters/destinationUnit/from: one of creator, trigger, unit"],
    ["a wire mode", { mode: "unit" }, "/parameters/destinationUnit: write { from: \"creator\" | \"trigger\" | \"unit\" }"],
  ])("refuses %s as a step's destination unit", (_name, destinationUnit, message) => {
    expect(() => create("c", "Create", "${entity:case}", [], { destinationUnit } as never)).toThrow(`create step c#${message}`);
    expect(() => upsert("u", "Upsert", "${entity:case}", "code", [], { destinationUnit } as never)).toThrow(`upsert step u#${message}`);
  });
  it("search sends the fields it names, and nothing when none are named", () => {
    expect(search("s", "Find", "${entity:case}", [], { fields: ["title", "status"] }).parameters.fields).toEqual(["title", "status"]);
    expect("fields" in search("s", "Find", "${entity:case}", []).parameters).toBe(false);
  });
  it("bind marks a copy only when asked", () => {
    expect(bind("docs", ref("input.item"), { copy: true })).toEqual({ field: "docs", kind: "reference", value: "input.item", copy: true });
    expect("copy" in bind("docs", ref("input.item"))).toBe(false);
    expect("copy" in bind("docs", ref("input.item"), { copy: false })).toBe(false);
  });
  it("writes every literal so AgentFlow reads it as a value, an empty string and null included", () => {
    expect(lit("a")).toEqual({ kind: "literal", value: "a" });
    expect(lit("")).toEqual({ kind: "literal", value: "", valueJson: "" });
    expect(JSON.parse(JSON.stringify(lit(null)))).toEqual({ kind: "literal", valueJson: null });
    expect(lit(0)).toEqual({ kind: "literal", valueJson: 0 });
  });
  it("refuses a path to a step its graph does not have, in a binding, a condition or a loop's list", () => {
    const ITEM = "${entity:item}";
    const flow = (...steps: any[]) => graph("Flow", [start(), getById("find", "Find", ITEM, "subject.record_id"), ...steps, end("z", "Z")],
      edges(["e0", "start", "find"], ["e1", "find", steps[0]?.id ?? "z"], ...(steps.length ? [["e2", steps[0].id, "z"] as [string, string, string]] : [])));
    const write = (path: string) => update("w", "Write", ITEM, "subject.record_id", [bind("title", ref(path))]);
    expect(() => checkGraph("ok", flow(write("nodes.find.output.record.title")))).not.toThrow();
    expect(() => checkGraph("bad", flow(write("nodes.fnd.output.record.title")))).toThrow("bad: w reads nodes.fnd.output.record.title, and fnd is not a step of this graph");
    expect(() => checkGraph("bad", flow(update("w", "Write", ITEM, "nodes.fid.output.record.id", [])))).toThrow("fid is not a step of this graph");
    const body = (path: string) => graph("Body", [start(), node("s", "Set", "set_variable", { assignments: [{ target: "t", ...ref(path) }] }), end("be", "Done")],
      edges(["b0", "start", "s"], ["b1", "s", "be"]));
    const loop = (list: string, path: string) => node("each", "Each", "for_each", { listSource: list, itemAlias: "item", mode: "parallel", body: body(path) });
    expect(() => checkGraph("ok", flow(loop("nodes.find.output.record.items", "parent.nodes.find.output.record.title")))).not.toThrow();
    expect(() => checkGraph("bad", flow(loop("nodes.found.output.record.items", "input.item")))).toThrow("bad: each reads nodes.found.output.record.items");
    expect(() => checkGraph("bad", flow(loop("nodes.find.output.record.items", "nodes.find.output.record.title"))))
      .toThrow("bad.each.body: s reads nodes.find.output.record.title, and find is not a step of this graph; a loop's body reads the step around it as parent.nodes.find");
    expect(() => checkGraph("bad", flow(loop("nodes.find.output.record.items", "parent.nodes.fnd.output.x")))).toThrow("fnd is not a step of the graph around the loop");
    const choose = decision("d", "Choose", [when("e_a", { "==": [{ var: "nodes.fnd.output.record.status" }, "x"] }), otherwise("e_b")]);
    const branched = graph("Flow", [start(), getById("find", "Find", ITEM, "subject.record_id"), choose, end("a", "A"), end("b", "B")],
      edges(["e0", "start", "find"], ["e1", "find", "d"], ["e_a", "d", "a"], ["e_b", "d", "b"]));
    expect(() => checkGraph("bad", branched)).toThrow("bad: d reads nodes.fnd.output.record.status");
    // Publish reads an Email step's list only when it sends one message per item: a single-mode step that kept the
    // list of a step since deleted publishes, and so builds.
    const mail = (perItemMode: boolean) => node("m", "Mail", "email", { email: { perItemMode, listSource: "nodes.gone.output.rows", to: "a@example.com" } });
    expect(() => checkGraph("ok", flow(mail(false)))).not.toThrow();
    expect(() => checkGraph("bad", flow(mail(true)))).toThrow("bad: m reads nodes.gone.output.rows, and gone is not a step of this graph");
    // A position publish judges loosely, such as a Document step's field mapping, is left to publish.
    expect(() => checkGraph("ok", flow(node("doc", "Doc", "document", { documents: [{ fieldMapping: { a: ref("nodes.gone.output.x") } }] })))).not.toThrow();
  });
  it("refuses a decision whose edges the node does not own", () => {
    const g = graph(
      "Bad",
      [start(), decision("d", "D", [when("e2", { "==": [{ var: "x" }, 1] }), otherwise("e3")]), end("a", "A"), end("b", "B")],
      edges(["e1", "start", "d"], ["e2", "d", "a"]),
    );
    expect(() => checkGraph("bad", g)).toThrow("bad: d owns e2,e3 but has e2");
  });
  it("counts the edges a Human step's end condition branches to as the step's own", () => {
    const review = (endWhen: unknown) => node("r", "Review", "human", {
      actions: [{ id: "ok", label: "OK", edgeIds: ["e2"] }],
      endWhen,
    });
    const steps = (endWhen: unknown) => [start(), review(endWhen), end("a", "A"), end("b", "B")];
    const branched = { condition: { "==": [{ var: "subject.record.status" }, "done"] }, then: { kind: "branch", edgeIds: ["e3"] } };
    expect(() => checkGraph("ok", graph("Ok", steps(branched), edges(["e1", "start", "r"], ["e2", "r", "a"], ["e3", "r", "b"])))).not.toThrow();
    expect(() => checkGraph("bad", graph("Bad", steps(branched), edges(["e1", "start", "r"], ["e2", "r", "a"])))).toThrow("bad: r owns e2,e3 but has e2");
    const acted = { condition: branched.condition, then: { kind: "action", actionId: "ok" } };
    expect(() => checkGraph("act", graph("Act", steps(acted), edges(["e1", "start", "r"], ["e2", "r", "a"], ["e3", "r", "b"])))).toThrow("act: r owns e2 but has e2,e3");
  });
  it("takes any operator in an end condition but refuses a read beyond the record's own fields, and one in a loop body", () => {
    const review = (condition: unknown) => node("r", "Review", "human", {
      actions: [{ id: "ok", label: "OK", edgeIds: ["e2"] }],
      endWhen: { condition, then: { kind: "action", actionId: "ok" } },
    });
    const flow = (condition: unknown) => graph("G", [start(), review(condition), end("a", "A")], edges(["e1", "start", "r"], ["e2", "r", "a"]));
    const within = { in: [{ var: "subject.record.status" }, ["done", "cancelled"]] };
    expect(() => checkGraph("ok", flow({ or: [within, { "!": { var: ["subject.record.open", true] } }] }))).not.toThrow();
    for (const path of ["subject.record.mechanic.name", "subject.record.id", "subject.record.metadata", "input.status", "status"]) {
      expect(() => checkGraph("bad", flow({ "==": [{ var: path }, "x"] }))).toThrow(`bad: r's endWhen reads ${path}; an end condition may read only a field of the run's record`);
    }
    const body = graph("Body", [start(), review(within), end("a", "A")], edges(["e1", "start", "r"], ["e2", "r", "a"]));
    const loop = node("each", "Each", "for_each", { items: "{{ input.items }}", body });
    const outer = graph("Outer", [start(), loop, end("z", "Z")], edges(["o1", "start", "each"], ["o2", "each", "z"]));
    expect(() => checkGraph("outer", outer)).toThrow("outer.each.body: r has an endWhen, which a step inside a For each body cannot have");
  });
  it("counts the edges a Human step's deadline times out to as the step's own", () => {
    const review = (target: unknown) => node("r", "Review", "human", {
      actions: [{ id: "ok", label: "OK", edgeIds: ["e2"] }],
      sla: { deadline: { value: 2, unit: "business_days" } },
      escalation: { levels: [
        { at: { kind: "pctOfDeadline", pct: 50 }, action: { kind: "notifyAssignees" } },
        { at: { kind: "onDue" }, interrupting: true, action: { kind: "autoAdvance", target } },
      ] },
    });
    const steps = (target: unknown) => [start(), review(target), end("a", "A"), end("b", "B")];
    const late = { kind: "timeoutBranch", edgeIds: ["e3"] };
    expect(() => checkGraph("ok", graph("Ok", steps(late), edges(["e1", "start", "r"], ["e2", "r", "a"], ["e3", "r", "b"])))).not.toThrow();
    expect(() => checkGraph("bad", graph("Bad", steps(late), edges(["e1", "start", "r"], ["e2", "r", "a"])))).toThrow("bad: r owns e2,e3 but has e2");
    const acted = { kind: "action", actionId: "ok" };
    expect(() => checkGraph("act", graph("Act", steps(acted), edges(["e1", "start", "r"], ["e2", "r", "a"], ["e3", "r", "b"])))).toThrow("act: r owns e2 but has e2,e3");
  });
});

describe("merge", () => {
  it("merges sections in publish order and checks each graph", () => {
    const sections = merge([{ workflows: { one: tiny("one") } }, { workflows: { two: tiny("two") } }], ["two", "one", "absent"]);
    expect(sections.order).toEqual(["two", "one"]);
  });
  it("refuses a workflow, trigger or action defined in two modules", () => {
    expect(() => merge([{ workflows: { one: tiny("one") } }, { workflows: { one: tiny("one") } }], ["one"])).toThrow("sections#/workflows/one: defined twice");
    const trigger = { workflow: "one", kind: "schedule", config: {} };
    expect(() => merge([{ triggers: { t: trigger } }, { triggers: { t: trigger } }], [])).toThrow("sections#/triggers/t: defined twice");
    const action = { entity: "note", action: { workflow_id: "${workflow:one}", key: "go" } };
    expect(() => merge([{ actions: { a: action } }, { actions: { a: action } }], [])).toThrow("sections#/actions/a: defined twice");
  });
  it("refuses a workflow missing from the order", () => {
    expect(() => merge([{ workflows: { one: tiny("one") } }], [])).toThrow("add one to ORDER");
  });
});

describe("workflows in a package", () => {
  it("emits the workflow, its start grant and an exposed-step check", () => {
    const sections = merge([{ workflows: { one: tiny("one") } }], ["one"]);
    const files = buildPackage({ configDir, sections });
    const manifest = JSON.parse(files["manifest.json"]!);
    expect(manifest.grants).toContainEqual({ key: "start_one", to: "@param:support_group_id", workflow: "@obj:workflow:one" });
    expect(JSON.parse(files["objects/workflow/one.json"]!).runAs).toBe("@param:automation_principal_id");
    expect(() => buildPackage({ configDir, sections, exposedSteps: { one: ["done"] } })).toThrow("exposed step done is not a human step");
  });
  it("writes a record picker in a start form as the key form, at every level", () => {
    const picker = (entity: string) => ({ type: "string", format: "entity", "x-entity": entity });
    const schema = {
      type: "object",
      properties: {
        note: picker("note"),
        who: picker("user"),
        nested: { type: "object", properties: { contact: picker("contact") } },
        many: { type: "array", items: picker("note") },
      },
    };
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"])), schema,
    );
    const files = buildPackage({ configDir, sections: merge([{ workflows: { one: w } }], ["one"]) });
    const written = JSON.parse(files["objects/workflow/one.json"]!).inputSchema.properties;
    expect(written.note["x-entity"]).toBe("@obj.key:entity:note");
    expect(written.who["x-entity"]).toBe("@req.key:entity:user");
    expect(written.nested.properties.contact["x-entity"]).toBe("@obj.key:entity:contact");
    expect(written.many.items["x-entity"]).toBe("@obj.key:entity:note");
  });
  it("refuses a start-form picker on an entity outside the package", () => {
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), end("done", "Done")], edges(["e1", "start", "done"])),
      { type: "object", properties: { x: { type: "string", format: "entity", "x-entity": "ghost" } } },
    );
    expect(() => buildPackage({ configDir, sections: merge([{ workflows: { one: w } }], ["one"]) })).toThrow(
      "x-entity names ghost, which is not an entity of the package",
    );
  });
  it("refuses a trigger on a workflow outside the package", () => {
    expect(() => triggerObject("t", { workflow: "x", kind: "schedule", config: {} }, new Set(["one"]))).toThrow(
      "trigger t#/workflow: x is not a workflow of the package",
    );
  });
  it("refuses an action on an entity outside the package", () => {
    const sections = merge(
      [{ workflows: { one: tiny("one") }, actions: { go: { entity: "ghost", action: { workflow_id: "${workflow:one}", key: "go" } } } }],
      ["one"],
    );
    expect(() => buildPackage({ configDir, sections })).toThrow("action go#/entity: ghost is not an entity of the package");
  });
  it("refuses an action without a string key", () => {
    for (const key of [undefined, 3, ""]) {
      expect(() => actionObject("go", { entity: "note", action: { workflow_id: "${workflow:one}", key } } as never, new Set(["one"]), ["note"]))
        .toThrow("action go#/action/key: a non-empty string");
    }
  });
  it("accepts a call step", () => {
    expect(call("c", "Call", "${workflow:one}", undefined, [["a", { kind: "literal", value: "x" }]]).parameters.workflowId).toBe("${workflow:one}");
  });
  it("writes a call step's subjectSource as the path it is given, and refuses any other shape", () => {
    expect(call("c", "Call", "${workflow:one}", "subject.record_id").parameters.subjectSource).toBe("subject.record_id");
    for (const absent of [undefined, null, ""]) {
      expect("subjectSource" in call("c", "Call", "${workflow:one}", absent).parameters, String(absent)).toBe(false);
    }
    for (const shape of [{ type: "subject" }, ["subject.record_id"], 1]) {
      expect(() => call("c", "Call", "${workflow:one}", shape as never), JSON.stringify(shape)).toThrow(
        "call step c#/parameters/subjectSource: subjectSource is the path of the called run's record id",
      );
    }
  });
});

describe("a step's connection is a parameter", () => {
  const withConnections = (): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const manifest = path.join(dir, "package-manifest.json");
    const source = JSON.parse(fs.readFileSync(manifest, "utf8"));
    source.parameters.push(
      { key: "erp", type: "connection_ref", required: true, label: "ERP", category: "erp" },
      { key: "any_account", type: "connection_ref", required: true, label: "Any" },
    );
    fs.writeFileSync(manifest, JSON.stringify(source));
    return dir;
  };
  const dir = withConnections();
  const lookup = (params: Record<string, unknown>) =>
    node("lookup", "Look up", "integration", { operation: "get", objectType: "purchase_order", identityField: "erp_id", ...params });
  const mail = (parameter: string) =>
    node("mail", "Mail", "email", { email: { connection: `\${param:${parameter}}` } });
  const build = (step: ReturnType<typeof node>) => {
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), step, end("done", "Done")], edges(["e1", "start", step.id], ["e2", step.id, "done"])),
    );
    return () => buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
  };
  const at_ = (pointer: string) => `workflow one#/graph/nodes/1/parameters${pointer}`;

  it("an Integration step names its connection by parameter", () => {
    const files = build(lookup({ connection: "${param:erp}" }))();
    const written = JSON.parse(files["objects/workflow/one.json"]!).nodes[1];
    expect(written.parameters.connection).toBe("@param:erp");
    expect(written.parameters).not.toHaveProperty("provider");
  });
  it("refuses an Integration step that names a provider or an account, or no parameter", () => {
    for (const member of ["provider", "externalAccountId"]) {
      expect(build(lookup({ connection: "${param:erp}", [member]: "x" }))).toThrow(
        `${at_("/" + member)}: a package names an Integration step's account with connection: \${param:…}, not ${member}`,
      );
    }
    expect(build(lookup({})))
      .toThrow(`${at_("/connection")}: an Integration step names its account with connection: \${param:…}`);
    expect(build(lookup({ connection: "acct" })))
      .toThrow(`${at_("/connection")}: an Integration step names its account with connection: \${param:…}`);
  });
  it("an Email step names its connection by parameter", () => {
    const files = build(mail("any_account"))();
    expect(JSON.parse(files["objects/workflow/one.json"]!).nodes[1].parameters.email.connection).toBe("@param:any_account");
  });
  it("refuses the provider pair on an Email step", () => {
    const pair = node("mail", "Mail", "email", { email: { connection: { provider: "resend", externalAccountId: "${param:any_account}" } } });
    expect(build(pair)).toThrow(`${at_("/email/connection")}: an Email step names its connection with connection: \${param:…}`);
  });
  it("a connected_app trigger names its connection by parameter", () => {
    const t = triggerObject("t", { workflow: "one", kind: "connected_app",
      config: { connection: "${param:mail}", object_type: "email.received", change_kind: "created" } }, new Set(["one"]));
    expect((t.config as any).account).toBe("@param:mail");
    expect(t.config).not.toHaveProperty("provider");
  });
  it("holds a record trigger's mappings to what the install accepts, and leaves a connected_app trigger's alone", () => {
    const record = (...froms: string[]) => () => triggerObject("t", { workflow: "one", kind: "entity_record",
      config: { entity_id: "${entity:item}", change_kind: "updated", filter: {}, input_mappings: froms.map((from, i) => ({ from, to: `v${i}` })) } }, new Set(["one"]));
    expect(record("event.status", " event.event.previous.status ", "event.event.changed", "event.event.record_id")).not.toThrow();
    for (const [from, message] of [
      ["status", "status does not start with event.: a field is event.<field>, as event.status"],
      ["event.", "event. does not start with event."],
      ["event.event", "event.event is not a value"],
      ["event.event.previous", "event.event.previous is not a value"],
      ["event.event.previous.", "event.event.previous. names no field, before-value or event metadata"],
      ["event.event.status", "event.event.status names no field, before-value or event metadata"],
      ["event.event.changed.x", "event.event.changed.x names no field, before-value or event metadata"],
    ] as const) {
      expect(record("event.title", from), from).toThrow(`trigger t#/config/input_mappings/1/from: ${message}`);
    }
    expect(() => triggerObject("t", { workflow: "one", kind: "connected_app", config: { connection: "${param:mail}",
      object_type: "email.received", change_kind: "created", input_mappings: [{ from: "properties.subject", to: "subject" }] } }, new Set(["one"])))
      .not.toThrow();
  });
  it("refuses provider and external_account_id on a connected_app trigger", () => {
    for (const member of ["provider", "external_account_id"]) {
      expect(() => triggerObject("t", { workflow: "one", kind: "connected_app",
        config: { connection: "${param:mail}", [member]: "x", object_type: "email.received", change_kind: "created" } }, new Set(["one"])))
        .toThrow(`trigger t#/config/${member}: a connected_app trigger names its connection with connection: \${param:…}, not ${member}`);
    }
    expect(() => triggerObject("t", { workflow: "one", kind: "connected_app", config: { object_type: "email.received" } }, new Set(["one"])))
      .toThrow("trigger t#/config: a connected_app trigger names its connection with connection: ${param:…}");
  });
  it("a parameter's uses must suit its category", () => {
    expect(build(mail("erp"))).toThrow(
      `${at_("/email/connection")}: erp is an erp connection, which an Email step cannot send through (email)`,
    );
    expect(build(mail("any_account"))).not.toThrow();
    expect(build(lookup({ connection: "${param:any_account}" }))).toThrow(
      `${at_("/connection")}: any_account declares no category, and an Integration step's object and operation mean something only on one kind of connection: give it category crm or erp`,
    );
  });
});

describe("a Code step reads only the inputs it declares", () => {
  const build = (language: "javascript" | "python", source: string) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    fs.mkdirSync(path.join(dir, "code"), { recursive: true });
    fs.writeFileSync(path.join(dir, "code", "step.src"), source);
    const step = code("c", "Code", "code/step.src", [["body", lit("x")]], { type: "object" });
    step.parameters.language = language;
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), step, end("done", "Done")], edges(["e1", "start", "c"], ["e2", "c", "done"])),
    );
    return () => buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
  };
  const at_ = "workflow one#/graph/nodes/1/parameters/source";

  it("refuses a read of a name the step does not declare, naming the step and the names", () => {
    const refused: ["javascript" | "python", string, string][] = [
      ["javascript", "function main(inputs) { return { a: inputs.typo, b: inputs?.other }; }", "typo, other"],
      ["javascript", "function main(inputs) { return { a: inputs['typo'] }; }", "typo"],
      ["javascript", "function main(inputs) { const { body, typo } = inputs; return { body, typo }; }", "typo"],
      ["javascript", "function main({ body, typo: renamed }) { return { body, renamed }; }", "typo"],
      ["javascript", "const main = (args) => ({ a: args.typo, b: inputs.body });", "typo"],
      ["python", "def main(inputs):\n    return {'a': inputs['typo'], 'b': inputs.get(\"other\"), 'c': inputs.third}", "typo, other, third"],
    ];
    for (const [language, source, names] of refused) {
      expect(build(language, source), source).toThrow(
        `${at_}: code/step.src reads ${names}, which the step does not declare (declared: body): ` +
          `declare each under inputs, or ask with "<name>" in inputs before reading it`,
      );
    }
  });

  it("accepts declared reads, reads an in test guards, comments, and the accessor's own members", () => {
    const accepted: ["javascript" | "python", string][] = [
      ["javascript", "function main(inputs) { return { body: inputs.body, b: inputs['body'] }; }"],
      ["javascript", "function main(inputs) { return { a: 'typo' in inputs ? inputs.typo : null }; }"],
      ["javascript", "// inputs.typo was renamed\n/* inputs.old */\nfunction main(inputs) { return { s: JSON.stringify(inputs), ...inputs }; }"],
      ["python", "# inputs['typo'] is gone\ndef main(inputs):\n    return {'keys': list(inputs.keys()), 'n': len(inputs.items()), 'x': inputs.get('typo') if 'typo' in inputs else None}"],
    ];
    for (const [language, source] of accepted) expect(build(language, source), source).not.toThrow();
  });
});

describe("decline routes", () => {
  const sign = (route?: string) =>
    signature("sig", "Sign", {
      documents: [doc.upstream("d1", "start", "file")],
      signers: [{ role: "party", who: signer.initiator() }],
      ...(route ? { onDecline: { edge: route } } : {}),
    });
  const ends = [end("ok", "Signed"), end("back", "Declined"), end("extra", "Extra")];
  const signedPath: [string, string, string] = ["e_ok", "sig", "ok"];
  const declinePath: [string, string, string] = ["e_back", "sig", "back"];
  const extraPath: [string, string, string] = ["e_extra", "sig", "extra"];
  const signatureGraph = (step: ReturnType<typeof node>, ...paths: [string, string, string][]) =>
    graph(
      "Sign",
      [start(), step, ...ends.filter((e) => paths.some(([, , to]) => to === e.id))],
      edges(["e1", "start", "sig"], ...paths),
    );

  it("a routed signature step owns its route and one other edge", () => {
    expect(() => checkGraph("ok", signatureGraph(sign("e_back"), signedPath, declinePath))).not.toThrow();
    expect(() => checkGraph("bad", signatureGraph(sign("e_back"), signedPath, declinePath, extraPath))).toThrow(
      "bad: sig (signature) has its decline route e_back and 2 other outbound edges; the signed path is exactly one",
    );
    expect(() => checkGraph("bad", signatureGraph(sign("e_back"), declinePath))).toThrow(
      "bad: sig (signature) has its decline route e_back and 0 other outbound edges; the signed path is exactly one",
    );
    expect(() => checkGraph("bad", signatureGraph(sign("e_gone"), signedPath, declinePath))).toThrow(
      "bad: sig routes a decline to e_gone, which is not an edge leaving it",
    );
  });

  it("a routed signature step in a loop body is checked against the body", () => {
    const loop = (...paths: [string, string, string][]) =>
      graph(
        "Outer",
        [
          start(),
          node("loop", "Each item", "for_each", { body: signatureGraph(sign("e_back"), ...paths) }),
          end("done", "Done"),
        ],
        edges(["e1", "start", "loop"], ["e2", "loop", "done"]),
      );
    expect(() => checkGraph("ok", loop(signedPath, declinePath))).not.toThrow();
    expect(() => checkGraph("bad", loop(signedPath, declinePath, extraPath))).toThrow(
      "bad.loop.body: sig (signature) has its decline route e_back and 2 other outbound edges",
    );
  });

  it("a hand-written signature node without a route keeps one outbound edge", () => {
    const written = () => node("sig", "Sign", "signature", { documents: [], signers: [], failOnSignerFailure: false });
    expect(() => checkGraph("ok", signatureGraph(written(), signedPath))).not.toThrow();
    expect(() => checkGraph("bad", signatureGraph(written(), signedPath, declinePath))).toThrow("bad: sig (signature) has 2 outbound edges");
  });

  describe("on a Human step", () => {
    const actions = [
      { id: "ok", label: "Signed", edgeIds: ["e_ok"] },
      { id: "redo", label: "Redo", edgeIds: ["e_redo"] },
    ];
    const review = (onDecline: SigningOptions["onDecline"]) =>
      node("sig", "Review", "human", { actions, signing: signing({ signedAction: "ok", onDecline }) });
    const toEnds: [string, string, string][] = [signedPath, ["e_redo", "sig", "extra"]];

    it("owns a decline branch's edge, and an action route adds no edge", () => {
      expect(() => checkGraph("ok", signatureGraph(review({ edge: "e_back" }), ...toEnds, declinePath))).not.toThrow();
      expect(() => checkGraph("bad", signatureGraph(review({ edge: "e_back" }), ...toEnds))).toThrow("bad: sig owns e_ok,e_redo,e_back but has e_ok,e_redo");
      expect(() => checkGraph("ok", signatureGraph(review({ action: "redo" }), ...toEnds))).not.toThrow();
      expect(() => checkGraph("bad", signatureGraph(review({ action: "redo" }), ...toEnds, declinePath))).toThrow(
        "bad: sig owns e_ok,e_redo but has e_ok,e_redo,e_back",
      );
    });

    it("refuses a decline branch that is also an action's edge", () => {
      expect(() => checkGraph("bad", signatureGraph(review({ edge: "e_redo" }), ...toEnds))).toThrow(
        "bad: sig routes a decline to e_redo, which an action already owns",
      );
    });
  });

  describe("the platform month", () => {
    const loopBody = () => node("loop", "Each item", "for_each", { body: signatureGraph(sign("e_back"), signedPath, declinePath) });
    const humanAction = () =>
      node("sig", "Review", "human", {
        actions: [{ id: "ok", label: "Signed", edgeIds: ["e_ok"] }, { id: "redo", label: "Redo", edgeIds: ["e_redo"] }],
        signing: signing({ signedAction: "ok", onDecline: { action: "redo" } }),
      });
    const graphs: Record<string, () => ReturnType<typeof graph>> = {
      "a routed signature step": () => signatureGraph(sign("e_back"), signedPath, declinePath),
      "a Human step declining to an action": () => signatureGraph(humanAction(), signedPath, ["e_redo", "sig", "extra"]),
      "a routed step in a loop body": () =>
        graph("Outer", [start(), loopBody(), end("done", "Done")], edges(["e1", "start", "loop"], ["e2", "loop", "done"])),
      "no route": () => signatureGraph(sign(), signedPath),
    };
    const built = (version: string, kind: string): unknown => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
      fs.cpSync(configDir, dir, { recursive: true });
      const manifest = path.join(dir, "package-manifest.json");
      fs.writeFileSync(manifest, JSON.stringify({ ...JSON.parse(fs.readFileSync(manifest, "utf8")), minPlatformVersion: version }));
      const w = workflow(
        "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"), graphs[kind]!(),
      );
      const files = buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
      return JSON.parse(files["manifest.json"]!).minPlatformVersion;
    };

    it("the build raises minPlatformVersion for a decline route, and never lowers or invents one", () => {
      const cases: [string, string, string][] = [
        ["2026.10", "a routed signature step", "2026.11"],
        ["2026.10", "a Human step declining to an action", "2026.11"],
        ["2026.10", "a routed step in a loop body", "2026.11"],
        ["2026.12", "a routed signature step", "2026.12"],
        ["2026.10", "no route", "2026.10"],
        ["2026.1", "a routed signature step", "2026.1"],
        ["2026.00", "a routed signature step", "2026.00"],
        ["2026.13", "a routed signature step", "2026.13"],
        ["next", "a routed signature step", "next"],
      ];
      for (const [version, kind, expected] of cases) expect(built(version, kind), `${version} with ${kind}`).toBe(expected);
    });
  });
});

describe("notifications in a package", () => {
  const declared = { kinds: [{ key: "assigned", label: "Assigned", title: "{actor} assigned {record}" }] };
  const built = (change: { minPlatformVersion?: string; notifications?: unknown }, nodes: ReturnType<typeof node>[] = []) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const manifest = path.join(dir, "package-manifest.json");
    fs.writeFileSync(manifest, JSON.stringify({ ...JSON.parse(fs.readFileSync(manifest, "utf8")), ...change }));
    const g = graph("Tiny", [start(), ...nodes, end("done", "Done")], edges(["e1", "start", nodes[0]?.id ?? "done"], ...(nodes[0] ? [["e2", nodes[0].id, "done"] as [string, string, string]] : [])));
    const w = workflow("one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"), g);
    return buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
  };

  it("a package with notifications needs 2026.11, and a later month stays", () => {
    expect(NOTIFICATIONS_PLATFORM).toBe("2026.11");
    for (const [version, expected] of [["2026.10", "2026.11"], ["2026.12", "2026.12"]]) {
      expect(JSON.parse(built({ minPlatformVersion: version, notifications: declared })["manifest.json"]!).minPlatformVersion, version).toBe(expected);
    }
    expect(JSON.parse(built({ minPlatformVersion: "2026.10" })["manifest.json"]!).minPlatformVersion).toBe("2026.10");
  });

  it("notify writes the step and the build refuses an undeclared kind", () => {
    const step = notify("tell", "Tell", "assigned", [recipient.field("subject.record.owner")]);
    expect(step.parameters).toEqual({
      id: "tell",
      label: "Tell",
      notification: "assigned",
      recipients: [{ type: "field", path: "subject.record.owner" }],
      except: [],
    });
    expect(step.node_type).toBe("notify");
    expect(recipient.user("owner_id")).toEqual({ type: "user", user_id: "${param:owner_id}" });
    expect(recipient.group("team_id")).toEqual({ type: "group", group_id: "${param:team_id}" });
    expect(recipient.initiator()).toEqual({ type: "initiator" });

    expect(() => built({ notifications: declared }, [step])).not.toThrow();
    const pointer = "workflow one#/graph/nodes/1/parameters/notification";
    expect(() => built({}, [step])).toThrow(`${pointer}: `);
    expect(() => built({ notifications: { kinds: [{ ...declared.kinds[0], key: "other" }] } }, [step])).toThrow(`${pointer}: `);
  });

  it("the build refuses a Notify step with no recipients or too many sources", () => {
    const eleven = Array.from({ length: 11 }, (_, i) => recipient.field(`subject.record.f${i}`));
    const rows: [string, ReturnType<typeof node>, string][] = [
      ["no recipients", notify("tell", "Tell", "assigned", []), "recipients"],
      ["11 recipients", notify("tell", "Tell", "assigned", eleven), "recipients"],
      ["11 exceptions", notify("tell", "Tell", "assigned", [recipient.initiator()], { except: eleven }), "except"],
    ];
    for (const [name, step, member] of rows) {
      expect(() => built({ notifications: declared }, [step]), name).toThrow(`workflow one#/graph/nodes/1/parameters/${member}: `);
    }
  });

  it("the build refuses a member a Notify step or its source does not have", () => {
    const step = () => notify("tell", "Tell", "assigned", [recipient.field("subject.record.owner")], { except: [recipient.initiator()] });
    const misspelt = step();
    misspelt.parameters.excpet = misspelt.parameters.except;
    delete misspelt.parameters.except;
    const fieldWithUser = step();
    fieldWithUser.parameters.recipients[0].user_id = "${param:owner_id}";
    const initiatorWithPath = step();
    initiatorWithPath.parameters.except[0].path = "subject.record.owner";
    const unknownType = step();
    unknownType.parameters.recipients[0] = { type: "role", role: "owner" };
    const rows: [string, ReturnType<typeof node>, string][] = [
      ["a misspelt except", misspelt, "excpet"],
      ["a field source naming a user", fieldWithUser, "recipients/0/user_id"],
      ["an initiator source naming a path", initiatorWithPath, "except/0/path"],
      ["a source of no known type", unknownType, "recipients/0/type"],
    ];
    for (const [name, refused, member] of rows) {
      expect(() => built({ notifications: declared }, [refused]), name).toThrow(`workflow one#/graph/nodes/1/parameters/${member}: `);
    }
    expect(() => built({ notifications: declared }, [step()])).not.toThrow();
  });
});

describe("parallel arms", () => {
  const human = (id: string, ...acts: [string, string][]) =>
    node(id, id, "human", { actions: acts.map(([action, edge]) => ({ id: action, label: action, edgeIds: [edge] })) });
  const diamond = (left: ReturnType<typeof node>, more: ReturnType<typeof node>[] = [], extra: [string, string, string][] = []) =>
    graph(
      "Split",
      [start(), fork("f", "Split", ["e2", "e3"]), left, setvar("b", "B", []), join("j", "Meet"), end("done", "Done"), ...more],
      edges(["e1", "start", "f"], ["e2", "f", left.id], ["e3", "f", "b"], ["e5", "b", "j"], ["e6", "j", "done"], ...extra),
    );

  it("fork names its arms as the designer does, one edge each, and join carries nothing else", () => {
    expect(fork("f", "Split", ["e2", "e3"]).parameters.arms).toEqual([
      { id: "arm_1", edgeIds: ["e2"] },
      { id: "arm_2", edgeIds: ["e3"] },
    ]);
    expect(join("j", "Meet")).toEqual(node("j", "Meet", "join"));
    expect(() => fork("f", "Split", ["e2"])).toThrow("fork step f#/parameters/arms: a Fork has at least two arms, each one edge id");
    expect(() => fork("f", "Split", ["e2", "e2"])).toThrow("fork step f#/parameters/arms: edge e2 is named twice");
  });

  it("a Fork owns its arm edges and reconverges at a Join, nested in an arm or inside a loop", () => {
    expect(() => checkGraph("ok", diamond(setvar("a", "A", []), [], [["e4", "a", "j"]]))).not.toThrow();
    // An inner Fork/Join in the first arm.
    const nested = diamond(fork("a", "Inner", ["e7", "e8"]), [setvar("x", "X", []), setvar("y", "Y", []), join("k", "Inner meet")],
      [["e7", "a", "x"], ["e8", "a", "y"], ["e9", "x", "k"], ["e10", "y", "k"], ["e4", "k", "j"]]);
    expect(() => checkGraph("ok", nested)).not.toThrow();
    // The whole region inside a loop a Decision closes, and a Decision that loops on itself.
    const looped = graph(
      "Again",
      [start(), fork("f", "Split", ["e2", "e3"]), setvar("a", "A", []), setvar("b", "B", []), join("j", "Meet"),
        decision("d", "Again?", [when("e_back", { "==": [{ var: "vars.again" }, true] }), otherwise("e_end")]), end("done", "Done")],
      edges(["e1", "start", "f"], ["e2", "f", "a"], ["e3", "f", "b"], ["e4", "a", "j"], ["e5", "b", "j"], ["e6", "j", "d"], ["e_back", "d", "f"], ["e_end", "d", "done"]),
    );
    expect(() => checkGraph("ok", looped)).not.toThrow();
    const spin = graph("Spin", [start(), decision("d", "Again?", [when("e_back", { "==": [{ var: "vars.again" }, true] }), otherwise("e_end")]), end("done", "Done")],
      edges(["e1", "start", "d"], ["e_back", "d", "d"], ["e_end", "d", "done"]));
    expect(() => checkGraph("ok", spin)).not.toThrow();
    // An approval in an arm meets at one plain step before the Join.
    const approve = human("a", ["yes", "e7"], ["no", "e8"]);
    const met = diamond(approve, [setvar("m", "Met", [])], [["e7", "a", "m"], ["e8", "a", "m"], ["e4", "m", "j"]]);
    expect(() => checkGraph("ok", met)).not.toThrow();
  });

  it("refuses the regions publish refuses that the build can see", () => {
    const plain = () => setvar("a", "A", []);
    const hand = (arms: unknown) => graph(
      "Split",
      [start(), node("f", "Split", "fork", { arms }), plain(), setvar("b", "B", []), join("j", "Meet"), end("done", "Done")],
      edges(["e1", "start", "f"], ["e2", "f", "a"], ["e3", "f", "b"], ["e4", "a", "j"], ["e5", "b", "j"], ["e6", "j", "done"]),
    );
    const rows: [string, unknown, string][] = [
      ["one arm", hand([{ id: "arm_1", edgeIds: ["e2"] }]), "bad: Fork f has 1 arm; a Fork has at least two"],
      ["an arm with two edges", hand([{ id: "arm_1", edgeIds: ["e2", "e3"] }, { id: "arm_2", edgeIds: [] }]), "bad: Fork f arm arm_1 wires 2 edges; an arm wires exactly one"],
      ["two arms to one step", graph(
        "Split",
        [start(), fork("f", "Split", ["e2", "e3"]), plain(), join("j", "Meet"), end("done", "Done")],
        edges(["e1", "start", "f"], ["e2", "f", "a"], ["e3", "f", "a"], ["e4", "a", "j"], ["e6", "j", "done"]),
      ), "bad: Fork f sends arms arm_1 and arm_2 to a; each arm goes to a step of its own"],
      ["a person feeding the Join", diamond(human("a", ["yes", "e4"]), [], [["e4", "a", "j"]]), "bad: a (human) feeds Join j directly on e4; let its edges meet at one plain step, such as a Set Variable, before the Join"],
      ["a Join no Fork reaches", graph(
        "Meet",
        [start(), join("j", "Meet"), end("done", "Done")],
        edges(["e1", "start", "j"], ["e2", "j", "done"]),
      ), "bad: Join j has no Fork before it"],
      ["a Fork no Join follows", graph(
        "Split",
        [start(), fork("f", "Split", ["e2", "e3"]), end("a", "A"), end("b", "B")],
        edges(["e1", "start", "f"], ["e2", "f", "a"], ["e3", "f", "b"]),
      ), "bad: Fork f reaches no Join; a Fork's arms meet again at a Join"],
      ["a Join told how to wait", (() => {
        const g = diamond(plain(), [], [["e4", "a", "j"]]);
        (g.nodes as any[]).find((n) => n.id === "j").parameters.wait = "any";
        return g;
      })(), "bad: Join j takes no wait; a Join waits for every arm"],
    ];
    for (const [name, g, message] of rows) expect(() => checkGraph("bad", g), name).toThrow(message);
  });
});

describe("loops", () => {
  const human = (id: string, ...acts: [string, string][]) =>
    node(id, id, "human", { actions: acts.map(([action, edge]) => ({ id: action, label: action, edgeIds: [edge] })) });
  // draft -> review, and review sends it back to draft.
  const sendBack = (draft: ReturnType<typeof node>) =>
    graph(
      "Review",
      [start(), draft, human("review", ["approve", "e3"], ["back", "e4"]), end("done", "Done")],
      edges(["e1", "start", "draft"], ["e2", "draft", "review"], ["e3", "review", "done"], ["e4", "review", "draft"]),
    );

  it("takes a loop publish takes: one entry, not nested, of steps a loop may hold", () => {
    expect(() => checkGraph("ok", sendBack(human("draft", ["submit", "e2"])))).not.toThrow();
  });

  it("refuses the loops publish refuses", () => {
    const twoEntries = graph(
      "Two",
      [start(), decision("d", "D", [when("e2", { "==": [{ var: "x" }, 1] }), otherwise("e3")]), human("a", ["go", "e4"]), human("b", ["go", "e5"], ["stop", "e6"]), end("done", "Done")],
      edges(["e1", "start", "d"], ["e2", "d", "a"], ["e3", "d", "b"], ["e4", "a", "b"], ["e5", "b", "a"], ["e6", "b", "done"]),
    );
    const nested = graph(
      "Nested",
      [start(), human("h1", ["go", "e2"]), human("h2", ["on", "e3"], ["top", "e4"]), human("h3", ["again", "e5"], ["stop", "e6"]), end("done", "Done")],
      edges(["e1", "start", "h1"], ["e2", "h1", "h2"], ["e3", "h2", "h3"], ["e4", "h2", "h1"], ["e5", "h3", "h2"], ["e6", "h3", "done"]),
    );
    const rows: [string, unknown, string][] = [
      ["a record step in the loop", sendBack(update("draft", "Draft", "${entity:case}", "subject.record_id", [])),
        "bad: draft (entity_record) is inside the loop through draft, review; a loop holds only"],
      ["two entries", twoEntries, "bad: the loop through a, b is entered at a, b; route every entry through one step"],
      ["a loop in a loop", nested, "bad: the loop through h1, h2, h3 holds another loop; loops do not nest"],
    ];
    for (const [name, g, message] of rows) expect(() => checkGraph("bad", g), name).toThrow(message);
  });
});

describe("steps that reach outside the package", () => {
  it("webhook writes the designer's config: a method, rows for an object body, a secret by its parameter", () => {
    const step = webhook("lookup", "Look up the tax id", {
      url: "https://api.example.com/v1/tax/{{ subject.record.tax_id }}",
      method: "GET",
      headers: { Accept: "application/json" },
      auth: { kind: "api_key_header", secret: "lookup_key", header: "X-Api-Key" },
      retries: 2,
    });
    expect(step.parameters).toEqual({
      id: "lookup",
      label: "Look up the tax id",
      webhook: {
        url: "https://api.example.com/v1/tax/{{ subject.record.tax_id }}",
        method: "GET",
        headers: { Accept: "application/json" },
        bodyMode: "none",
        auth: { kind: "api_key_header", secretId: "${param:lookup_key}", headerName: "X-Api-Key" },
      },
      retries: 2,
    });
    const posted = webhook("post", "Post", {
      url: "https://hooks.example.com/in",
      body: { id: ref("subject.record_id"), note: tpl("Case {{ subject.record.title }}"), count: lit(3) },
    });
    expect(posted.parameters.webhook).toMatchObject({
      method: "POST",
      bodyMode: "object",
      bodyTemplate: [
        { key: "id", kind: "variable", value: "subject.record_id" },
        { key: "note", kind: "literal", value: "Case {{ subject.record.title }}" },
        { key: "count", kind: "literal_json", value: "3", valueJson: 3 },
      ],
    });
    expect(webhook("t", "T", { url: "https://x.example.com", body: "plain {{ vars.a }}" }).parameters.webhook)
      .toMatchObject({ bodyMode: "text", body: "plain {{ vars.a }}" });
  });

  it("extractText and integration write their kinds' parameters", () => {
    expect(extractText("read", "Read the quote", "subject.record.quote", { format: "text", onOversize: "truncate" }).parameters).toEqual({
      id: "read", label: "Read the quote", source: "subject.record.quote", mode: "single", format: "text", onOversize: "truncate",
    });
    expect(integration("find", "Find the vendor", {
      connection: "erp",
      operation: "search",
      objectType: "vendor",
      mappings: [["vat", ref("subject.record.tax_id")]],
      captureTo: "vars.vendor",
    }).parameters).toEqual({
      id: "find", label: "Find the vendor", connection: "${param:erp}", operation: "search", objectType: "vendor",
      mappings: [{ target: "vat", kind: "reference", value: "subject.record.tax_id" }], captureTo: "vars.vendor",
    });
  });

  it("builds them into a package, with the secret and the connection as its parameters", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-"));
    fs.cpSync(configDir, dir, { recursive: true });
    const manifestFile = path.join(dir, "package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    manifest.parameters.push(
      { key: "lookup_key", type: "secret_ref", required: true, label: "Lookup key" },
      { key: "erp", type: "connection_ref", category: "erp", required: true, label: "ERP" },
    );
    fs.writeFileSync(manifestFile, JSON.stringify(manifest));
    const steps = [
      extractText("read", "Read", "subject.record.attachment"),
      webhook("lookup", "Look up", { url: "https://api.example.com/v1/{{ subject.record.code }}", method: "GET", auth: { kind: "bearer", secret: "lookup_key" } }),
      integration("find", "Find", { connection: "erp", operation: "search", objectType: "vendor", mappings: [["vat", ref("subject.record.code"), "eq"]] }),
    ];
    const g = graph("Out", [start(), ...steps, end("done", "Done")], edges(["e1", "start", "read"], ["e2", "read", "lookup"], ["e3", "lookup", "find"], ["e4", "find", "done"]));
    const w = workflow("one", "Out", "Reaches out", servicePrincipal("automation_principal_id"), restricted("support_group_id"), g);
    const files = buildPackage({ configDir: dir, sections: merge([{ workflows: { one: w } }], ["one"]) });
    const nodes: any[] = JSON.parse(files["objects/workflow/one.json"]!).nodes;
    expect(nodes.find((n) => n.id === "lookup").parameters.webhook.auth.secretId).toBe("@param:lookup_key");
    expect(nodes.find((n) => n.id === "find").parameters.connection).toBe("@param:erp");
  });

  it("refuses what publish refuses and values outside each kind's set", () => {
    const rows: [string, () => unknown, string][] = [
      ["a webhook with no url", () => webhook("w", "W", { url: " " }), "webhook step w#/parameters/webhook/url: a webhook sends to a URL"],
      ["a method it has no rule for", () => webhook("w", "W", { url: "https://x.example.com", method: "get" as any }),
        'webhook step w#/parameters/webhook/method: method must be "GET" or "POST" or "PUT" or "PATCH" or "DELETE", not "get"'],
      ["an auth kind it has no rule for", () => webhook("w", "W", { url: "https://x.example.com", auth: { kind: "oauth" } as any }),
        "webhook step w#/parameters/webhook/auth/kind: "],
      ["a header key without its header", () => webhook("w", "W", { url: "https://x.example.com", auth: { kind: "api_key_header", secret: "k" } as any }),
        "webhook step w#/parameters/webhook/auth: "],
      ["a wire name", () => webhook("w", "W", { url: "https://x.example.com", bodyMode: "text" } as any),
        "webhook step w#/parameters/bodyMode: write body, not bodyMode"],
      ["an extract with no source", () => extractText("x", "X", ""), "extract_text step x#/parameters/source: "],
      ["an extract mode it has no rule for", () => extractText("x", "X", "input.item", { mode: "many" } as any),
        'extract_text step x#/parameters/mode: mode must be "single" or "multi", not "many"'],
      ["an operation it has no rule for", () => integration("i", "I", { connection: "erp", operation: "delete" as any, objectType: "vendor" }),
        'integration step i#/parameters/operation: operation must be "get" or "search" or "upsert", not "delete"'],
      ["an inline read", () => integration("i", "I", { connection: "erp", operation: "get", objectType: "vendor", identityField: "vat", delivery: "inline" }),
        "integration step i#/parameters/delivery: only an upsert has a delivery"],
      ["a get with no identity field", () => integration("i", "I", { connection: "erp", operation: "get", objectType: "vendor" }),
        "integration step i#/parameters/identityField: a get and an upsert name the field they key on"],
      ["an upsert that maps no value to its identity field", () => integration("i", "I", {
        connection: "erp", operation: "upsert", objectType: "vendor", identityField: "vat", mappings: [["name", lit("A")]],
      }), "integration step i#/parameters/mappings: an upsert maps a value to its identity field vat"],
      ["a capture outside vars and input", () => integration("i", "I", { connection: "erp", operation: "search", objectType: "vendor", captureTo: "vendor" }),
        'integration step i#/parameters/captureTo: captureTo is a path under vars. or input., such as "vars.vendor", not "vendor"'],
    ];
    for (const [name, make, message] of rows) expect(make, name).toThrow(message);
  });
});

describe("a Set Variable target is a bare variable name", () => {
  const build = (targets: unknown[]) => {
    const step = setvar("keep", "Keep", targets.map((target) => [target as string, lit("x")]));
    const w = workflow(
      "one", "Tiny", "A one step workflow", servicePrincipal("automation_principal_id"), restricted("support_group_id"),
      graph("Tiny", [start(), step, end("done", "Done")], edges(["e1", "start", "keep"], ["e2", "keep", "done"])),
    );
    return () => buildPackage({ configDir, sections: merge([{ workflows: { one: w } }], ["one"]) });
  };
  const at_ = (i: number) => `workflow one#/graph/nodes/1/parameters/assignments/${i}/target`;

  it("refuses the vars. prefix, naming the bare name, as publish refuses it (set_variable.target_invalid)", () => {
    expect(build(["first_status", "vars.first_status"])).toThrow(
      `${at_(1)}: "vars.first_status" names the variable with its prefix: write "first_status", which a later step reads as vars.first_status`,
    );
  });

  it("refuses any other name publish would, with the rule", () => {
    for (const bad of ["a.b", "1st", "two words", "", "né"]) {
      expect(build([bad]), bad).toThrow(`${at_(0)}: ${JSON.stringify(bad)} is not a variable name: a letter or underscore, then letters, digits and underscores, and no dot`);
    }
  });

  it("builds names publish accepts", () => {
    expect(build(["first_status", "_x1", "Total2", " padded "])).not.toThrow();
  });
});

describe("a workflow shipped switched on as a tool", () => {
  const built = (extra: Record<string, unknown>) => {
    const sections = merge([{ workflows: { one: { ...tiny("one"), ...extra } } }], ["one"]);
    return JSON.parse(buildPackage({ configDir, sections })["objects/workflow/one.json"]!);
  };

  it("tool_enabled writes toolEnabled and only when true", () => {
    expect(built({ tool_enabled: true }).toolEnabled).toBe(true);
    expect("toolEnabled" in built({ tool_enabled: false })).toBe(false);
    expect("toolEnabled" in built({})).toBe(false);
  });

  it("a non-boolean tool_enabled is refused", () => {
    for (const bad of ["true", 1, null, {}, []]) {
      expect(() => built({ tool_enabled: bad }), JSON.stringify(bad)).toThrow("workflow one#/tool_enabled: must be true or false");
    }
  });
});

describe("a Human step's page", () => {
  const page = { path: "/tasks/{{ record_id }}", mode: "redirect" };
  const human = (parameters: Record<string, unknown>) => node("h", "Review", "human", parameters);
  const where = "workflow w";

  it("is refused on a step that is not Human, without the package's ui, with a mode other than redirect, and with a path the platform refuses", () => {
    const cases: [ReturnType<typeof node>, boolean, string][] = [
      [node("a", "Ask", "agent", { page }), true, "page belongs on a Human step"],
      [human({ page }), false, "needs the package's ui"],
      [human({ page: { ...page, mode: "embedded" } }), true, "mode must be redirect"],
      [human({ page: { path: "/tasks/{{ record_id }}" } }), true, "mode must be redirect"],
      [human({ page: { ...page, path: "tasks" } }), true, "a module path such as /items/{{ record_id }}"],
    ];
    for (const [step, hasUi, message] of cases) {
      expect(() => checkTaskPages([step], hasUi, where), message).toThrow(`${where}#/graph/nodes/0/parameters/page: ${message}`);
    }
  });

  it("points into a loop body, and accepts a good page there", () => {
    const loop = (inner: ReturnType<typeof node>) => [node("loop", "Each", "for_each", { body: { nodes: [start(), inner] } })];
    expect(() => checkTaskPages(loop(human({ page })), true, where)).not.toThrow();
    expect(() => checkTaskPages(loop(human({ page: { ...page, mode: "embedded" } })), true, where)).toThrow(
      `${where}#/graph/nodes/0/parameters/body/nodes/1/parameters/page: mode must be redirect`,
    );
    expect(() => checkTaskPages([human({})], false, where)).not.toThrow();
  });

  it("raises the platform month only for a graph that holds one", () => {
    expect(TASK_PAGES_PLATFORM).toBe("2027.02");
    expect(holdsTaskPage({ nodes: [human({ page })] })).toBe(true);
    expect(holdsTaskPage({ nodes: [node("loop", "Each", "for_each", { body: { nodes: [human({ page })] } })] })).toBe(true);
    expect(holdsTaskPage({ nodes: [human({})] })).toBe(false);
  });
});
