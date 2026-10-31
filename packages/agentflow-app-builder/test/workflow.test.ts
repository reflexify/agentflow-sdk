import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { actionObject, merge, triggerObject } from "../src/index.js";
import {
  bind, call, checkGraph, code, decision, edges, end, graph, lit, node, otherwise, ref, restricted, search, servicePrincipal, start, updateMany, when, workflow,
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
  it("builds the principal, restriction and update_many shapes", () => {
    expect(servicePrincipal("p")).toEqual({ policy: "service_principal", service_principal_id: "${param:p}" });
    expect(restricted("a", "b")).toEqual({ mode: "restricted", group_ids: ["${param:a}", "${param:b}"] });
    expect(updateMany("u", "Bulk", "${entity:note}", [], [])).toEqual(
      node("u", "Bulk", "entity_record", { operation: "update_many", entityId: "${entity:note}", filters: [], body: [] }),
    );
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
    node("mail", "Mail", "email", { email: { connection: { provider: "resend", externalAccountId: `\${param:${parameter}}` } } });
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
