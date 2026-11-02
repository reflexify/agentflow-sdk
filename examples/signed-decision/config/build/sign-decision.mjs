import {
  INITIATOR, bind, doc, edges, end, graph, lit, ref, restricted, signature, signedFiles, signer, start, update, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const DECISION = "${entity:decision}";

export const workflows = {
  sign_decision: workflow(
    "sign_decision",
    "Sign a decision",
    "The person who starts it signs a letter for the decision, and the signed file is kept on the record. A refused signature marks the decision declined.",
    INITIATOR,
    restricted("app_users"),
    graph(
      "Sign a decision",
      [
        start({ subject: DECISION }),
        signature("sign", "Sign the letter", {
          documents: [
            doc.template("letter", "${document_template:decision_letter}", {
              fieldMapping: { "/title": ref("subject.record.title") },
              filename: "decision",
            }),
          ],
          signers: [{ role: "approver", who: signer.initiator() }],
          onDecline: { edge: "e_declined" },
        }),
        update("signed", "Mark signed and keep the file", DECISION, "subject.record_id", [
          bind("status", lit("signed")),
          bind("signed_file", signedFiles("sign")),
        ]),
        update("declined", "Mark declined", DECISION, "subject.record_id", [bind("status", lit("declined"))]),
        end("done_signed", "Signed", "signed"),
        end("done_declined", "Declined", "declined"),
      ],
      edges(
        ["e_start", "start", "sign"],
        ["e_signed", "sign", "signed"], ["e_declined", "sign", "declined"],
        ["e_signed_done", "signed", "done_signed"], ["e_declined_done", "declined", "done_declined"],
      ),
    ),
  ),
};

export const triggers = {};

export const actions = {
  sign: {
    entity: "decision",
    action: {
      workflow_id: "${workflow:sign_decision}",
      label: "Sign",
      key: "sign",
      scope: "row",
      mode: "async",
      visible_when: { "==": [{ var: "status" }, "draft"] },
      input_map: [{ from: "record.id", to: "subject" }],
      icon: "file-signature",
    },
  },
};
