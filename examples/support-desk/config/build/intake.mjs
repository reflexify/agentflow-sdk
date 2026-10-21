import {
  SP, NOBODY, TICKET, REPLY, NOTE, CONTACT, NOW, ref, tpl, lit, bind, start, end, getById, search, flt,
  create, update, decision, when, otherwise, setvar, code, edges, graph, workflow, contactUpsert,
} from "./lib.mjs";

const STR_LIST = { type: "array", items: { type: "string" } };
const SIGNAL_WORDS =
  "{'our_message': 'replying to our email', 'their_message': 'replying to an earlier message on it', " +
  "'plus_tag': 'its reply address', 'subject_token': 'the ticket number in its subject'}";

const contact = contactUpsert({
  email: ref("input.from_address"),
  name: tpl("{{ nodes.candidates.output.sender_name or input.from_address }}"),
  next: "dupe_check",
});

const nodes = [
  start(),
  decision("has_sender", "Has a sender?", [
    when("e_sender", { "!!": [{ var: "input.from_address" }] }),
    otherwise("e_no_sender"),
  ]),
  code("candidates", "Read threading", "code/intake-candidates.js", [
    ["message_id", ref("input.message_id")],
    ["email_id", ref("input.email_id")],
    ["in_reply_to", ref("input.in_reply_to")],
    ["references", ref("input.references")],
    ["plus_tags", ref("input.plus_tags")],
    ["subject", ref("input.subject")],
    ["from", ref("input.from")],
    ["headers", ref("input.headers")],
  ], {
    type: "object",
    properties: {
      own_key: { type: "string" },
      message_ids: STR_LIST,
      ticket_numbers: STR_LIST,
      plus_numbers: STR_LIST,
      subject_numbers: STR_LIST,
      sender_name: { type: ["string", "null"] },
      clean_subject: { type: "string" },
      dmarc_failed: { type: "boolean" },
    },
    required: ["own_key", "message_ids", "ticket_numbers", "plus_numbers", "subject_numbers", "clean_subject", "dmarc_failed"],
  }),
  search("dup", "Already received?", REPLY, [flt("key", "eq", tpl("{{ nodes.candidates.output.own_key }}"))], { limit: 1 }),
  decision("is_dup", "Seen this email?", [
    when("e_dup", { ">": [{ var: "nodes.dup.output.returnedCount" }, 0] }),
    otherwise("e_fresh"),
  ]),
  search("by_message", "Replies it answers", REPLY, [flt("key", "in", ref("nodes.candidates.output.message_ids"))], { limit: 50 }),
  search("by_number", "Tickets it names", TICKET, [flt("number", "in", ref("nodes.candidates.output.ticket_numbers"))], { limit: 20 }),
  code("resolve", "Pick the ticket", "code/intake-resolve.js", [
    ["message_ids", ref("nodes.candidates.output.message_ids")],
    ["plus_numbers", ref("nodes.candidates.output.plus_numbers")],
    ["subject_numbers", ref("nodes.candidates.output.subject_numbers")],
    ["replies", ref("nodes.by_message.output.records")],
    ["tickets", ref("nodes.by_number.output.records")],
  ], {
    type: "object",
    properties: { ticket_id: { type: ["string", "null"] }, signal: { type: ["string", "null"] } },
    required: ["ticket_id", "signal"],
  }),
  decision("matched", "Matched a ticket?", [
    when("e_matched", { "!!": [{ var: "nodes.resolve.output.ticket_id" }] }),
    otherwise("e_new"),
  ]),
  getById("ticket", "Matched ticket", TICKET, "nodes.resolve.output.ticket_id"),
  getById("requester", "Its requester", CONTACT, "nodes.ticket.output.record.requester"),
  // Held messages are left out: a stranger's first message must not make them
  // a participant for their second.
  search("accepted", "Its accepted messages", REPLY, [
    flt("ticket", "eq", ref("nodes.resolve.output.ticket_id")),
    flt("author_kind", "in", lit(["customer", "agent", "bot"])),
  ], { sort: "posted_at", dir: "desc", limit: 500 }),
  code("participant", "Is the sender a participant?", "code/intake-participant.js", [
    ["sender", ref("input.from_address")],
    ["requester_email", ref("nodes.requester.output.record.email")],
    ["replies", ref("nodes.accepted.output.records")],
    ["our_domains", lit("${param:our_domains}")],
    ["dmarc_failed", ref("nodes.candidates.output.dmarc_failed")],
  ], {
    type: "object",
    properties: { participant: { type: "boolean" }, reason: { type: "string" } },
    required: ["participant", "reason"],
  }),
  setvar("set_matched", "On the matched ticket", [
    ["ticket_id", ref("nodes.resolve.output.ticket_id")],
    ["author_kind", tpl("{{ 'customer' if nodes.participant.output.participant else 'unverified' }}")],
  ]),
  ...contact.nodes,
  search("dupe_check", "Recent open ticket?", TICKET, [
    flt("requester", "eq", ref("vars.contact_id")),
    flt("status", "in", lit(["new", "open", "pending"])),
    flt("created_at", "within", lit("last_7_days")),
  ], { sort: "created_at", dir: "desc", limit: 1 }),
  create("ticket_create", "New ticket", TICKET, [
    bind("subject", ref("nodes.candidates.output.clean_subject")),
    bind("requester", ref("vars.contact_id")),
    bind("status", lit("new")),
    bind("priority", lit("normal")),
  ]),
  decision("is_dupe", "Possible duplicate?", [
    when("e_dupe", { ">": [{ var: "nodes.dupe_check.output.returnedCount" }, 0] }),
    otherwise("e_not_dupe"),
  ]),
  update("mark_dupe", "Flag the duplicate", TICKET, "nodes.ticket_create.output.record.id", [
    bind("possible_duplicate_of", ref("nodes.dupe_check.output.records[0].id")),
  ]),
  setvar("set_new_ticket", "On the new ticket", [
    ["ticket_id", ref("nodes.ticket_create.output.record.id")],
    ["author_kind", lit("customer")],
  ]),
  create("reply", "Save the message", REPLY, [
    bind("ticket", ref("vars.ticket_id")),
    bind("posted_at", NOW),
    bind("author_kind", ref("vars.author_kind")),
    bind("status", lit("received")),
    bind("body", tpl("{{ input.text or '' }}")),
    bind("attachments", ref("input.attachments")),
    bind("key", ref("nodes.candidates.output.own_key")),
    bind("subject", ref("input.subject")),
    bind("in_reply_to", ref("input.in_reply_to")),
    bind("references", tpl("{{ (input.references or []) | join(' ') }}")),
    bind("from_address", ref("input.from_address")),
    bind("to", tpl("{{ (input.to or []) | join(', ') }}")),
    bind("cc", tpl("{{ (input.cc or []) | join(', ') }}")),
    bind("autopilot", lit("none")),
  ]),
  decision("unreadable", "Attachments unreadable?", [
    when("e_unreadable", { "==": [{ var: "input.attachments_unreadable" }, true] }),
    otherwise("e_readable"),
  ]),
  create("note_unreadable", "Note: attachments lost", NOTE, [
    bind("ticket", ref("vars.ticket_id")),
    bind("kind", lit("system")),
    bind("body", lit("This email's attachments could not be read. Ask the customer to send them again.")),
  ]),
  decision("customer_or_held", "From a participant?", [
    when("e_customer", { "==": [{ var: "vars.author_kind" }, "customer"] }),
    otherwise("e_held"),
  ]),
  update("mark_held", "Record why it was held", REPLY, "nodes.reply.output.record.id", [
    bind("held_reason", ref("nodes.participant.output.reason")),
    bind("matched_by", ref("nodes.resolve.output.signal")),
  ]),
  create("note_held", "Note: held message", NOTE, [
    bind("ticket", ref("vars.ticket_id")),
    bind("kind", lit("held_message")),
    bind("body", tpl(
      `A message from {{ input.from_address }} matched this ticket by {{ ${SIGNAL_WORDS}[nodes.resolve.output.signal] }}. ` +
        "Accept it into the conversation, or move it to a new ticket.",
    )),
  ]),
  update("ticket_open", "Open the ticket", TICKET, "vars.ticket_id", [
    bind("status", lit("open")),
    bind("last_customer_at", NOW),
    bind("pending_token", tpl("customer:{{ nodes.reply.output.record.id }}")),
  ]),
  end("end_ok", "Filed", "Filed", {
    ticket: { ...ref("vars.ticket_id"), label: "Ticket", showAs: "record", entityId: TICKET },
    reply: { ...ref("nodes.reply.output.record.id"), showAs: "hidden" },
  }),
  end("end_dup", "Already received", "Already received"),
  end("end_held", "Held for a person", "Held for a person"),
  end("end_invalid", "No sender", "No sender"),
];

const wiring = [
  ...edges(
    ["e_start", "start", "has_sender"],
    ["e_sender", "has_sender", "candidates"],
    ["e_no_sender", "has_sender", "end_invalid"],
    ["e_cand", "candidates", "dup"],
    ["e_dup_q", "dup", "is_dup"],
    ["e_dup", "is_dup", "end_dup"],
    ["e_fresh", "is_dup", "by_message"],
    ["e_bm", "by_message", "by_number"],
    ["e_bn", "by_number", "resolve"],
    ["e_res", "resolve", "matched"],
    ["e_matched", "matched", "ticket"],
    ["e_new", "matched", contact.entry],
    ["e_t", "ticket", "requester"],
    ["e_r", "requester", "accepted"],
    ["e_a", "accepted", "participant"],
    ["e_p", "participant", "set_matched"],
    ["e_sm", "set_matched", "reply"],
  ),
  ...contact.edges,
  ...edges(
    ["e_dc", "dupe_check", "ticket_create"],
    ["e_tc", "ticket_create", "is_dupe"],
    ["e_dupe", "is_dupe", "mark_dupe"],
    ["e_not_dupe", "is_dupe", "set_new_ticket"],
    ["e_md", "mark_dupe", "set_new_ticket"],
    ["e_snt", "set_new_ticket", "reply"],
    ["e_reply", "reply", "unreadable"],
    ["e_unreadable", "unreadable", "note_unreadable"],
    ["e_readable", "unreadable", "customer_or_held"],
    ["e_nu", "note_unreadable", "customer_or_held"],
    ["e_customer", "customer_or_held", "ticket_open"],
    ["e_held", "customer_or_held", "mark_held"],
    ["e_mh", "mark_held", "note_held"],
    ["e_nh", "note_held", "end_held"],
    ["e_to", "ticket_open", "end_ok"],
  ),
];

export const workflows = {
  intake: workflow(
    "support_intake", "Support · Intake",
    "Files an inbound email on the ticket it belongs to, or opens a new ticket.",
    SP, NOBODY, graph("Support · Intake", nodes, wiring),
  ),
};

const MAPPED = [
  "message_id", "email_id", "in_reply_to", "references", "plus_tags", "subject", "from",
  "from_address", "to", "cc", "text", "headers", "attachments", "attachments_unreadable",
];

// One email to two of our addresses arrives as two deliveries at the same moment,
// and each would look for the message before the other has saved it. Grouping
// them by Message-ID (or the email id, when there is none) gives a key one run
// at a time, so the second delivery runs after the first and finds it filed.
// When a batch does carry both, the run's own input is the newest, which is the
// same email.
const ONE_RUN_PER_MESSAGE = {
  by: { kind: "template", template: "{{ event.properties.message_id or event.properties.email_id }}" },
};

export const triggers = {
  intake: {
    workflow: "support_intake",
    kind: "connected_app",
    enabled: true,
    config: {
      provider: "resend",
      external_account_id: "${param:resend_connection_id}",
      object_type: "email.received",
      change_kind: "created",
      filter: {},
      input_mappings: MAPPED.map((k) => ({ from: `event.properties.${k}`, to: k })),
      group: ONE_RUN_PER_MESSAGE,
    },
  },
};

export const actions = {};
