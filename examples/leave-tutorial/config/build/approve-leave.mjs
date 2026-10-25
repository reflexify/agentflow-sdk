import {
  NOBODY, bind, edges, end, graph, lit, node, ref, servicePrincipal, start, update, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const LEAVE = "${entity:leave_request}";

const decide = node("decide", "Approve or reject", "human", {
  assignment: { candidates: [{ kind: "group", id: "${param:approvers}" }] },
  actions: [
    { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
    { id: "reject", label: "Reject", edgeIds: ["e_reject"] },
  ],
});

export const workflows = {
  approve_leave: workflow(
    "approve_leave", "Approve leave",
    "Asks an approver to approve or reject a submitted leave request, then records the decision.",
    servicePrincipal("automation_principal"), NOBODY,
    graph("Approve leave", [
      start({ subject: LEAVE }),
      decide,
      node("letter", "Write the approval letter", "document", { documents: [{
        id: "letter", documentTemplateId: "${document_template:approval_letter}", format: "pdf",
        fieldMapping: {
          "/number": ref("subject.record.number"), "/leave_type": ref("subject.record.leave_type"),
          "/from_date": ref("subject.record.from_date"), "/to_date": ref("subject.record.to_date"),
          "/days": ref("subject.record.days"),
        },
        filenameTemplate: "approval-{{ subject.record.number }}",
      }] }),
      update("approved", "Mark approved and attach the letter", LEAVE, "subject.record_id", [
        bind("status", lit("approved")),
        bind("approval_letter", ref("nodes.letter.output.generated_files")),
      ]),
      update("rejected", "Mark rejected", LEAVE, "subject.record_id", [bind("status", lit("rejected"))]),
      end("done_approved", "Approved", "approved"),
      end("done_rejected", "Rejected", "rejected"),
    ], edges(
      ["e_start", "start", "decide"],
      ["e_approve", "decide", "letter"], ["e_reject", "decide", "rejected"],
      ["e_letter", "letter", "approved"],
      ["e_approved", "approved", "done_approved"], ["e_rejected", "rejected", "done_rejected"],
    )),
  ),
};

export const triggers = {
  on_submit: {
    workflow: "approve_leave",
    kind: "entity_record",
    config: {
      entity_id: LEAVE, change_kind: "updated", input_mappings: [],
      filter: { and: [
        { in: ["status", { var: "event.changed" }] },
        { "==": [{ var: "status" }, "submitted"] },
      ] },
    },
  },
};

export const actions = {};
