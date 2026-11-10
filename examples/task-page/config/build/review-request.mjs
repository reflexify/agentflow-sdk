import {
  INITIATOR, bind, edges, end, graph, lit, node, ref, restricted, start, update, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const REQUEST = "${entity:request}";

// The Human step names a page of the app's UI module. AgentFlow's task links (My Work, a notification, the
// record) then open that page instead of its own task panel, and the page works the task through host.tasks.
// `{{ record_id }}` is the id of the task itself, which is the id the module's path carries.
const review = node("review", "Review the request", "human", {
  assignment: { candidates: [{ kind: "group", id: "${param:app_users}" }] },
  page: { path: "/review/{{ record_id }}", mode: "redirect" },
  actions: [
    { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
    { id: "reject", label: "Reject", edgeIds: ["e_reject"] },
  ],
});

export const workflows = {
  review_request: workflow(
    "review_request",
    "Review a request",
    "A member of the request users group claims the review task, adds a note and approves or rejects the request.",
    INITIATOR,
    restricted("app_users"),
    graph(
      "Review a request",
      [
        start({ subject: REQUEST }),
        review,
        // A packaged step has no form, so what the page sets with setValues is passed on as the step's output.
        update("approved", "Mark approved", REQUEST, "subject.record_id", [
          bind("status", lit("approved")),
          bind("decision_note", ref("nodes.review.output.note")),
        ]),
        update("rejected", "Mark rejected", REQUEST, "subject.record_id", [
          bind("status", lit("rejected")),
          bind("decision_note", ref("nodes.review.output.note")),
        ]),
        end("done_approved", "Approved", "approved"),
        end("done_rejected", "Rejected", "rejected"),
      ],
      edges(
        ["e_start", "start", "review"],
        ["e_approve", "review", "approved"], ["e_reject", "review", "rejected"],
        ["e_approved", "approved", "done_approved"], ["e_rejected", "rejected", "done_rejected"],
      ),
    ),
  ),
};

export const triggers = {};

export const actions = {
  send_for_review: {
    entity: "request",
    action: {
      workflow_id: "${workflow:review_request}",
      label: "Send for review",
      key: "send_for_review",
      scope: "row",
      mode: "async",
      visible_when: { "==": [{ var: "status" }, "pending"] },
      input_map: [{ from: "record.id", to: "subject" }],
      icon: "clipboard-check",
    },
  },
};
