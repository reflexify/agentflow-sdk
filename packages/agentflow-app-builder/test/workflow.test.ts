import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { actionObject, merge, triggerObject } from "../src/index.js";
import {
  bind, call, checkGraph, code, decision, doc, edges, end, graph, lit, node, notify, NOTIFICATIONS_PLATFORM, otherwise, recipient, ref, restricted, search,
  servicePrincipal, signature, signer, signing, start, updateMany, when, workflow, type SigningOptions,
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
