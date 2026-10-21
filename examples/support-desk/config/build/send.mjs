import {
  INITIATOR, NOBODY, SUPPORT, CONNECTION, TICKET, REPLY, CONTACT, NOW, ref, tpl, lit, bind, node, start, end,
  getById, search, flt, update, decision, when, otherwise, call, edges, graph, workflow, claimMailHeaderBindings,
  readParameters,
} from "./lib.mjs";

const SEND_INPUTS = {
  type: "object",
  properties: {
    version: { type: "integer" },
    ...Object.fromEntries(
      ["body", "to", "cc", "subject", "in_reply_to", "references", "reply_to", "ticket_id", "author_user"]
        .map((k) => [k, { type: "string" }]),
    ),
  },
  required: ["version", "body", "to", "subject", "reply_to", "ticket_id"],
};

// A person's claim and autopilot's differ in static configuration (the linked
// conversation check, the author, `Auto-Submitted`), so they are two atomic
// workflows built here from one definition.
function claimWorkflow(kind) {
  const autopilot = kind === "autopilot";
  const claimBody = [
    bind("status", lit("sending")),
    bind("author_kind", lit(autopilot ? "bot" : "agent")),
    ...(autopilot ? [] : [bind("author_user", ref("input.author_user"))]),
    bind("body", ref("input.body")),
    bind("posted_at", NOW),
  ];
  const sentBody = [
    bind("status", lit("sent")),
    bind("outbound_id", ref("nodes.email.output.messages[0].outbound_id")),
    bind("key", tpl(
      "{{ nodes.email.output.messages[0].message_id or ('outbound:' ~ nodes.email.output.messages[0].outbound_id) }}",
    )),
    bind("in_reply_to", ref("input.in_reply_to")),
    bind("references", ref("input.references")),
    bind("to", ref("input.to")),
    bind("cc", ref("input.cc")),
    // What the Autopilot screen counts: a person sending the AI's draft as
    // written. Autopilot's own sends add only the disclosure line.
    bind("ai_unchanged", autopilot ? lit(true) : tpl(
      "{{ (nodes.claim.output.record.ai_body or '') | trim != '' and " +
        "(nodes.claim.output.record.ai_body or '') | trim == (input.body or '') | trim }}",
    )),
    ...(autopilot ? [bind("autopilot", lit("sent"))] : []),
  ];
  const nodes = [
    start({ subject: REPLY, params: true }),
    update("claim", "Claim the draft", REPLY, "subject.record_id", claimBody, {
      expect: { version: "{{ input.version }}", fields: { status: "draft" } },
      check: autopilot ? { linked: true } : undefined,
    }),
    decision("claimed", "Claimed?", [
      when("e_skipped", { "==": [{ var: "nodes.claim.output.skipped" }, true] }),
      otherwise("e_claimed"),
    ]),
    // Read after the claim: moving the draft to `sending` made it visible,
    // which advanced the revision, and the claim holds the revision row, so
    // this is exactly the revision that includes this reply.
    getById("revision", "Revision with this reply", TICKET, "input.ticket_id"),
    node("email", "Send the email", "email", {
      email: {
        connection: CONNECTION,
        to: "{{ input.to }}",
        delivery: "together",
        cc: "{{ input.cc }}",
        replyTo: "{{ input.reply_to }}",
        subject: "{{ input.subject }}",
        body: "{{ input.body }}",
        headers: { "In-Reply-To": "{{ input.in_reply_to }}", References: "{{ input.references }}" },
        autoSubmitted: autopilot ? "auto-replied" : "none",
        // Read from the claimed record, not bound into a File field, which an
        // all-or-nothing run refuses: the send names attachments by id.
        attachments: [{ fromExpr: "nodes.claim.output.record.attachments" }],
      },
    }),
    update("sent", "Mark sent", REPLY, "subject.record_id", sentBody),
    update("ticket_sent", "Record the answer", TICKET, "input.ticket_id", [
      bind("pending_token", tpl("outbound:{{ nodes.email.output.messages[0].outbound_id }}")),
      bind("first_replied_at", tpl("{{ nodes.revision.output.record.first_replied_at or now() }}")),
      bind("answered_revision", ref("nodes.revision.output.conversation_revision")),
    ]),
    end("end_sent", "Sent", "Sent", {
      status: lit("sent"),
      outbound_id: ref("nodes.email.output.messages[0].outbound_id"),
      skip_reason: lit(""),
    }),
    end("end_skipped", "Not sent", "Not sent", {
      status: lit("skipped"),
      outbound_id: lit(""),
      skip_reason: ref("nodes.claim.output.skip_reason"),
    }),
  ];
  const wiring = edges(
    ["e_start", "start", "claim"],
    ["e_c", "claim", "claimed"],
    ["e_skipped", "claimed", "end_skipped"],
    ["e_claimed", "claimed", "revision"],
    ["e_rev", "revision", "email"],
    ["e_em", "email", "sent"],
    ["e_s", "sent", "ticket_sent"],
    ["e_ts", "ticket_sent", "end_sent"],
  );
  const label = autopilot ? "autopilot" : "person";
  return workflow(
    `support_send_claim_${label}`, `Support · Send reply · claim (${label})`,
    "All or nothing: claims the draft once, emails it, and records the answer on the ticket.",
    INITIATOR, NOBODY, graph(`Support · Send reply · claim (${label})`, nodes, wiring, "atomic"), SEND_INPUTS,
  );
}

export const newestIn = (ticketPath) =>
  search("newest_in", "Customer's latest message", REPLY, [
    flt("ticket", "eq", ref(ticketPath)),
    flt("status", "eq", lit("received")),
    flt("author_kind", "eq", lit("customer")),
  ], { sort: "posted_at", dir: "desc", limit: 1 });

// A message that came with no Message-ID is filed under `email:<email id>`,
// which is not an id a mail client could answer, so there is nothing to reply
// to and the header is left off.
const NEWEST_KEY = "nodes.newest_in.output.records[0].key";
const HAS_REAL_ID = `nodes.newest_in.output.returnedCount > 0 and '@' in (${NEWEST_KEY} or '')`;
export const IN_REPLY_TO = tpl(`{{ ${NEWEST_KEY} if (${HAS_REAL_ID}) else '' }}`);
export const REFERENCES = tpl(
  `{{ (nodes.newest_in.output.records[0].references or '') | email_references(${NEWEST_KEY}) ` +
    "if nodes.newest_in.output.returnedCount > 0 else '' }}",
);

const sendNodes = [
  start({ subject: REPLY, params: true }),
  readParameters("inbound_domain"),
  getById("draft", "Read the draft", REPLY, "subject.record_id"),
  getById("ticket", "Read the ticket", TICKET, "nodes.draft.output.record.ticket"),
  getById("requester", "Read the requester", CONTACT, "nodes.ticket.output.record.requester"),
  newestIn("nodes.draft.output.record.ticket"),
  call("claim", "Claim and send", "${workflow:support_send_claim_person}", "subject.record_id", [
    ["version", tpl("{{ input.version or nodes.draft.output.record.metadata.version }}")],
    ["author_user", ref("workflow.requester.id")],
    ["body", ref("nodes.draft.output.record.body")],
    ["to", ref("nodes.requester.output.record.email")],
    ...claimMailHeaderBindings({ ticket: "nodes.ticket.output.record", draft: "nodes.draft.output.record" }),
    ["in_reply_to", IN_REPLY_TO],
    ["references", REFERENCES],
    ["ticket_id", ref("nodes.draft.output.record.ticket")],
  ]),
  end("end", "Done", null, {
    status: { ...ref("nodes.claim.output.status"), label: "Result" },
    skip_reason: { ...ref("nodes.claim.output.skip_reason"), label: "Why not sent" },
    outbound_id: { ...ref("nodes.claim.output.outbound_id"), showAs: "hidden" },
  }),
];

export const workflows = {
  send_claim_person: claimWorkflow("person"),
  send_claim_autopilot: claimWorkflow("autopilot"),
  send_reply: workflow(
    "support_send_reply", "Support · Send reply",
    "A person sends the draft they saw. A draft changed since, or already sent, is not sent.",
    INITIATOR, SUPPORT,
    graph("Support · Send reply", sendNodes, edges(
      ["e_start", "start", "params"], ["e_pa", "params", "draft"], ["e_d", "draft", "ticket"], ["e_t", "ticket", "requester"],
      ["e_r", "requester", "newest_in"], ["e_n", "newest_in", "claim"], ["e_c", "claim", "end"],
    )),
    { type: "object", properties: { version: { type: "integer" } } },
  ),
};

export const triggers = {};

export const actions = {
  send: {
    entity: "reply",
    action: {
      workflow_id: "${workflow:support_send_reply}",
      label: "Send",
      key: "send",
      scope: "row",
      mode: "sync",
      visible_when: { "==": [{ var: "status" }, "draft"] },
      input_map: [{ from: "record.id", to: "subject" }],
      tone: "primary",
      icon: "send",
    },
  },
};
