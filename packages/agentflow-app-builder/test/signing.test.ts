import { describe, expect, it } from "vitest";
import { doc, node, ref, signature, signedFiles, signer, signing, signingStatus } from "../src/workflow.js";

const letter = "${document_template:letter}";
const initiator = {
  kind: "dynamic",
  source: { type: "initiator" },
  relation: { type: "direct" },
};
const partyAt = (routingOrder: number, who: object = initiator) => ({
  roleKey: "party",
  routingOrder,
  recipient: { kind: "internal", assignment: { candidates: [who] } },
});
const minimal = (extra: object = {}, signers: object[] = [{ role: "party", who: signer.initiator() }]) =>
  signature("s", "Sign", { documents: [doc.template("d1", letter)], signers, ...extra } as never);

describe("signature()", () => {
  it("writes the node a hand-written node() would", () => {
    const built = signature("sign", "Sign the letter", {
      documents: [
        doc.template("letter", letter, {
          fieldMapping: { "/number": ref("subject.record.number") },
          filename: "Letter {{ subject.record.number }}",
        }),
      ],
      signers: [{ role: "party", who: signer.initiator() }],
      method: "client_cert",
      onDecline: { edge: "e_declined" },
      certVisible: false,
      task: { name: "Sign {{ subject.record.number }}", description: "Please sign" },
    });
    expect(built).toEqual(
      node("sign", "Sign the letter", "signature", {
        documents: [
          {
            id: "letter",
            source: "renderDocumentTemplate",
            documentTemplateId: letter,
            fieldMapping: { "/number": { kind: "reference", value: "subject.record.number" } },
            filenameTemplate: "Letter {{ subject.record.number }}",
          },
        ],
        signers: [partyAt(1)],
        signingMethod: "client_cert",
        routing: "parallel",
        certVisible: false,
        onDecline: { kind: "branch", edgeIds: ["e_declined"] },
        taskName: "Sign {{ subject.record.number }}",
        taskDescription: "Please sign",
      }),
    );

    const bare = minimal().parameters;
    expect(Object.keys(bare).sort()).toEqual(["documents", "id", "label", "routing", "signers", "signingMethod"]);
    expect(bare.signingMethod).toBe("server_email");
    expect(bare.routing).toBe("parallel");

    const ordered = minimal({ routing: "sequential" }, [
      { role: "party", who: signer.initiator(), order: 1 },
      { role: "other", who: signer.user("lead_user"), order: 2 },
    ]).parameters;
    expect(ordered.signers.map((s: { routingOrder: number }) => s.routingOrder)).toEqual([1, 2]);
    expect(ordered.signers[1].recipient.assignment.candidates).toEqual([{ kind: "user", id: "${param:lead_user}" }]);
  });
});

describe("signing()", () => {
  it("writes the block a Human step carries", () => {
    expect(signing({ documents: [doc.review("r1", "rd")], signedAction: "sign", onDecline: { action: "rework" } })).toEqual({
      documents: [{ id: "r1", source: "reviewDocument", reviewDocumentId: "rd" }],
      signingMethod: "server_email",
      signedActionId: "sign",
      onDecline: { kind: "action", actionId: "rework" },
    });
    expect(signing({ method: "client_cert", certVisible: false, onDecline: { edge: "e_declined" } })).toEqual({
      documents: [],
      signingMethod: "client_cert",
      certVisible: false,
      onDecline: { kind: "branch", edgeIds: ["e_declined"] },
    });
    expect(Object.keys(signing()).sort()).toEqual(["documents", "signingMethod"]);
    expect(Object.keys(signing({ onDecline: "fail" })).sort()).toEqual(["documents", "signingMethod"]);
  });
});

describe("signer", () => {
  it("maps each signer to one Assignee, with a manager that never serializes", () => {
    const table: [{ kind: string }, object][] = [
      [signer.initiator(), initiator],
      [signer.field("subject.record.owner"), { ...initiator, source: { type: "fieldUser", path: "subject.record.owner" } }],
      [signer.stepActor("review"), { ...initiator, source: { type: "taskActor", nodeId: "review" } }],
      [signer.previousActor(), { ...initiator, source: { type: "previousTaskActor" } }],
      [signer.user("lead_user"), { kind: "user", id: "${param:lead_user}" }],
    ];
    for (const [built, expected] of table) expect(built).toEqual(expected);

    const manager = { type: "manager", levels: 2 };
    for (const dynamic of [signer.initiator(), signer.field("subject.record.owner"), signer.stepActor("review"), signer.previousActor()]) {
      const climbed = dynamic.manager(2);
      expect(climbed).toEqual({ ...dynamic, relation: manager });
      expect(dynamic.relation).toEqual({ type: "direct" });
      expect(JSON.stringify(climbed)).not.toContain('"manager":');
      expect(Object.keys(climbed)).toEqual(["kind", "source", "relation"]);
      expect(JSON.parse(JSON.stringify(climbed))).toEqual({ ...dynamic, relation: manager });
    }
    expect(signer.initiator().manager(5).relation).toEqual({ type: "manager", levels: 5 });
    expect("manager" in signer.user("lead_user")).toBe(false);
  });
});

describe("doc", () => {
  it("writes the source shapes", () => {
    expect(doc.template("t", letter)).toEqual({ id: "t", source: "renderDocumentTemplate", documentTemplateId: letter, fieldMapping: {} });
    expect("filenameTemplate" in doc.template("t", letter, { fieldMapping: { "/a": ref("x") } })).toBe(false);
    expect(doc.template("t", letter, { filename: "Letter" })).toEqual({
      id: "t",
      source: "renderDocumentTemplate",
      documentTemplateId: letter,
      fieldMapping: {},
      filenameTemplate: "Letter",
    });
    expect(doc.upstream("u", "render", "letter")).toEqual({ id: "u", source: "upstreamFile", attachment: { nodeId: "render", documentId: "letter" } });
    expect(doc.review("r", "rd")).toEqual({ id: "r", source: "reviewDocument", reviewDocumentId: "rd" });
  });
});

describe("outputs", () => {
  it("signedFiles and signingStatus read the step's output", () => {
    expect(signedFiles("sign")).toEqual({ kind: "reference", value: "nodes.sign.output.generated_files" });
    expect(signingStatus("sign")).toEqual({ kind: "reference", value: "nodes.sign.output.status" });
  });
});

describe("refusals", () => {
  const party = { role: "party", who: signer.initiator() };
  const cases: [string, () => unknown, string][] = [
    ["no documents", () => minimal({ documents: [] }), "signature step s#/parameters/documents: a Signature step signs at least one document"],
    ["no signers", () => minimal({}, []), "signature step s#/parameters/signers: a Signature step needs at least one signer"],
    [
      "two documents with one id",
      () => minimal({ documents: [doc.template("d1", letter), doc.upstream("d1", "render", "pdf")] }),
      "signature step s#/parameters/documents/1/id: document id d1 is used twice",
    ],
    [
      "two signers with one role",
      () => minimal({}, [party, { role: "party", who: signer.user("lead_user") }]),
      "signature step s#/parameters/signers/1/roleKey: role party is used twice",
    ],
    ["an empty role", () => minimal({}, [{ role: "", who: signer.initiator() }]), "signature step s#/parameters/signers/0/roleKey: a signer's role"],
    ["a blank role", () => minimal({}, [{ role: "  ", who: signer.initiator() }]), "signature step s#/parameters/signers/0/roleKey: a signer's role"],
    [
      "signingMethod on signature()",
      () => minimal({ signingMethod: "client_cert" }),
      "signature step s#/parameters/signingMethod: write method, not signingMethod",
    ],
    [
      "failOnSignerFailure on signature()",
      () => minimal({ method: "client_cert", failOnSignerFailure: false }),
      "signature step s#/parameters/failOnSignerFailure: the builder never writes failOnSignerFailure",
    ],
    ["an option nothing reads", () => minimal({ onFailure: "fail" }), "signature step s#/parameters/onFailure: a member the builder has no rule for"],
    [
      "a task member under its wire name",
      () => minimal({ task: { taskName: "Sign" } }),
      "signature step s#/parameters/task/taskName: a member the builder has no rule for",
    ],
    [
      "a signer entry with signer: for who:",
      () => minimal({}, [{ role: "party", signer: signer.initiator() }]),
      "signature step s#/parameters/signers/0/signer: write who, not signer",
    ],
    ["a signer entry without who", () => minimal({}, [{ role: "party" }]), "signature step s#/parameters/signers/0/recipient: a signer's who is signer.initiator()"],
    [
      "a who that is not a signer",
      () => minimal({}, [{ role: "party", who: { kind: "group", id: "g" } }]),
      'signature step s#/parameters/signers/0/recipient: a signer\'s who is signer.initiator()',
    ],
    ["a method outside the set", () => minimal({ method: "client-cert" }), 'signature step s#/parameters/signingMethod: method must be "server_email" or "client_cert", not "client-cert"'],
    ["a routing outside the set", () => minimal({ routing: "serial" }), 'routing must be "parallel" or "sequential", not "serial"'],
    ["onDecline continue", () => minimal({ onDecline: "continue" }), 'onDecline must be "fail" or { edge: "<edge id>" }, not "continue"; the builder has no "continue"'],
    ["an empty decline edge", () => minimal({ onDecline: { edge: "" } }), "signature step s#/parameters/onDecline: onDecline { edge } names an edge id"],
    ["a decline action", () => minimal({ onDecline: { action: "x" } }), "{ action } belongs to a Human step's signing()"],
    [
      "a review document",
      () => minimal({ documents: [doc.review("r", "rd")] }),
      "signature step s#/parameters/documents/0: doc.review reads a Human step's review document",
    ],
    [
      "sequential routing without an order",
      () => minimal({ routing: "sequential" }, [{ role: "party", who: signer.initiator(), order: 1 }, { role: "other", who: signer.initiator() }]),
      "signature step s#/parameters/signers/1/routingOrder: sequential routing needs each signer's order",
    ],
    [
      "an order that is not a positive whole number",
      () => minimal({}, [{ role: "party", who: signer.initiator(), order: 0 }]),
      "signature step s#/parameters/signers/0/routingOrder: order must be a positive whole number",
    ],
    ["a method in signing()", () => signing({ onDecline: { edge: "e" }, method: "x" as never }), 'signing#/signingMethod: method must be "server_email" or "client_cert", not "x"'],
    [
      "a duplicate document in signing()",
      () => signing({ documents: [doc.review("r", "a"), doc.review("r", "b")] }),
      "signing#/documents/1/id: document id r is used twice",
    ],
    ["an empty decline action", () => signing({ onDecline: { action: "" } }), "signing#/onDecline: onDecline { action } names an action id"],
    ["signingMethod on signing()", () => signing({ signingMethod: "client_cert" } as never), "signing#/signingMethod: write method, not signingMethod"],
    [
      "a decline action that is the signed action",
      () => signing({ signedAction: "signed", onDecline: { action: "signed" } }),
      "signing#/onDecline: onDecline { action } names \"signed\", which is the signedAction",
    ],
    ["a mapping option on doc.template", () => doc.template("d", letter, { mapping: {} } as never), "doc.template#/mapping: a member the builder has no rule for"],
    [
      "filenameTemplate on doc.template",
      () => doc.template("d", letter, { filenameTemplate: "x" } as never),
      "doc.template#/filenameTemplate: write filename, not filenameTemplate",
    ],
    ["an empty field path", () => signer.field(""), "signer#/source/path: signer.field needs the path of a person field"],
    ["a blank field path", () => signer.field("  "), "signer#/source/path: signer.field needs the path of a person field"],
    ["an empty step id", () => signer.stepActor(""), "signer#/source/nodeId: signer.stepActor needs the id of an earlier step"],
    ["levels of zero", () => signer.initiator().manager(0), "signer#/relation/levels: levels must be a whole number from 1 to 5, not 0"],
    ["levels past the platform's limit", () => signer.initiator().manager(6), "signer#/relation/levels: levels must be a whole number from 1 to 5, not 6"],
    ["levels that are not whole", () => signer.initiator().manager(1.5), "signer#/relation/levels: levels must be a whole number from 1 to 5, not 1.5"],
  ];
  it("refuses what the step alone shows wrong", () => {
    for (const [name, call, message] of cases) expect(call, name).toThrow(message);
  });
});
