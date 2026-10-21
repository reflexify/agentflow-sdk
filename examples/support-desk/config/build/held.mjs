import {
  INITIATOR, NOBODY, SUPPORT, TICKET, REPLY, NOW, ref, tpl, lit, bind, start, end, create, update, decision, when, otherwise,
  call, code, edges, graph, workflow, contactUpsert,
} from "./lib.mjs";

// A draft that can't be made (no model answer, a failed step) must not undo an
// accept or a move that already happened: the message is in, the person can
// press "Generate reply".
const DRAFT_CONTINUES = { error_handling: { strategy: "continue", default_output: { skipped: true } } };

const acceptNodes = [
  start({ subject: REPLY }),
  update("accept", "Accept it", REPLY, "subject.record_id", [bind("author_kind", lit("customer"))], {
    expect: { fields: { author_kind: "unverified" } },
  }),
  decision("accepted", "Accepted?", [
    when("e_skipped", { "==": [{ var: "nodes.accept.output.skipped" }, true] }),
    otherwise("e_ok"),
  ]),
  update("ticket_open", "Open the ticket", TICKET, "subject.record.ticket", [
    bind("status", lit("open")),
    bind("last_customer_at", NOW),
    bind("pending_token", tpl("customer:{{ subject.record_id }}")),
  ]),
  call("draft", "Draft a reply", "${workflow:support_draft_reply}", "subject.record.ticket", [], DRAFT_CONTINUES),
  end("end_accepted", "Accepted", "Accepted"),
  end("end_skipped", "Already decided", "Already decided"),
];

const contact = contactUpsert({
  email: ref("subject.record.from_address"),
  name: ref("subject.record.from_address"),
  next: "ticket_create",
});

// The first step takes the message's row lock by rewriting what it already is,
// under the same `expect` the move uses, and holds it until the run commits. A
// Move that finds the message decided ends cleanly before it makes anything,
// and one that gets past it cannot be raced: nothing else can decide the
// message until this run commits. Any failure after it is a real one, and
// rolls back the contact and ticket made so far.
const applyNodes = [
  start({ subject: REPLY, params: true }),
  update("lock", "Take the message", REPLY, "subject.record_id", [bind("author_kind", lit("unverified"))], {
    expect: { fields: { author_kind: "unverified" } },
  }),
  decision("still_held", "Still held?", [
    when("e_decided", { "==": [{ var: "nodes.lock.output.skipped" }, true] }),
    otherwise("e_held"),
  ]),
  ...contact.nodes,
  create("ticket_create", "New ticket", TICKET, [
    bind("subject", ref("input.clean_subject")),
    bind("requester", ref("vars.contact_id")),
    bind("status", lit("new")),
    bind("priority", lit("normal")),
  ]),
  update("move", "Move the message", REPLY, "subject.record_id", [
    bind("ticket", ref("nodes.ticket_create.output.record.id")),
    bind("author_kind", lit("customer")),
  ], { expect: { fields: { author_kind: "unverified" } } }),
  // The lock makes a skip here impossible. If one happens anyway, this has no
  // branch for it: the run fails and rolls back the ticket, rather than ending
  // "Moved" with the message left behind.
  decision("moved", "Moved?", [when("e_moved", { "==": [{ var: "nodes.move.output.skipped" }, false] })]),
  update("ticket_open", "Open the new ticket", TICKET, "nodes.ticket_create.output.record.id", [
    bind("status", lit("open")),
    bind("last_customer_at", NOW),
    bind("pending_token", tpl("customer:{{ subject.record_id }}")),
  ]),
  // An End's literal is text, so the flag is "true" or "false".
  end("end_moved", "Moved", "Moved", { moved: lit("true"), ticket_id: ref("nodes.ticket_create.output.record.id") }),
  end("end_decided", "Already decided", "Already decided", { moved: lit("false"), ticket_id: lit("") }),
];

// The subject is cleaned here because a Code step can't run inside the atomic
// apply. It takes off the reply prefixes and the ticket number the sender
// guessed, the way Intake does for a new ticket.
const moveNodes = [
  start({ subject: REPLY }),
  code("clean", "Clean the subject", "code/clean-subject.js", [["subject", ref("subject.record.subject")]], {
    type: "object",
    properties: { clean_subject: { type: "string" } },
    required: ["clean_subject"],
  }),
  call("apply", "Move it", "${workflow:support_move_apply}", "subject.record_id", [
    ["clean_subject", ref("nodes.clean.output.clean_subject")],
  ]),
  // A new ticket's id means the message moved. The apply's `moved` flag is text,
  // and the designer retypes a "true" it finds in a condition to a boolean.
  decision("did_move", "Moved?", [
    when("e_moved", { "!!": [{ var: "nodes.apply.output.ticket_id" }] }),
    otherwise("e_not_moved"),
  ]),
  call("draft", "Draft a reply", "${workflow:support_draft_reply}", "nodes.apply.output.ticket_id", [], DRAFT_CONTINUES),
  end("end_moved", "Moved", "Moved", {
    ticket_id: { ...ref("nodes.apply.output.ticket_id"), label: "New ticket", showAs: "record", entityId: TICKET },
  }),
  end("end_not_moved", "Not moved", "Already decided"),
];

export const workflows = {
  accept_message: workflow(
    "support_accept_message", "Support · Accept into conversation",
    "A person accepts a held message: it joins the conversation, the ticket opens, and a reply is drafted.",
    INITIATOR, SUPPORT,
    graph("Support · Accept into conversation", acceptNodes, edges(
      ["e_start", "start", "accept"], ["e_a", "accept", "accepted"], ["e_skipped", "accepted", "end_skipped"],
      ["e_ok", "accepted", "ticket_open"], ["e_to", "ticket_open", "draft"], ["e_d", "draft", "end_accepted"],
    )),
  ),
  move_apply: workflow(
    "support_move_apply", "Support · Move to a new ticket · apply",
    "All or nothing: a new ticket for the sender, and the held message moved onto it. Ends \"Already decided\" if another person got there first.",
    INITIATOR, NOBODY,
    graph("Support · Move to a new ticket · apply", applyNodes, [
      ...edges(["e_start", "start", "lock"], ["e_lock", "lock", "still_held"], ["e_decided", "still_held", "end_decided"]),
      ...edges(["e_held", "still_held", contact.entry]),
      ...contact.edges,
      ...edges(
        ["e_tc", "ticket_create", "move"], ["e_mv", "move", "moved"],
        ["e_moved", "moved", "ticket_open"], ["e_to", "ticket_open", "end_moved"],
      ),
    ], "atomic"),
    { type: "object", properties: { clean_subject: { type: "string" } }, required: ["clean_subject"] },
  ),
  move_message: workflow(
    "support_move_message", "Support · Move to a new ticket",
    "A person moves a held message to a new ticket for its sender, and a reply is drafted there.",
    INITIATOR, SUPPORT,
    graph("Support · Move to a new ticket", moveNodes, edges(
      ["e_start", "start", "clean"], ["e_c", "clean", "apply"], ["e_a", "apply", "did_move"],
      ["e_moved", "did_move", "draft"], ["e_not_moved", "did_move", "end_not_moved"], ["e_d", "draft", "end_moved"],
    )),
  ),
};

export const triggers = {};

const heldOnly = { "==": [{ var: "author_kind" }, "unverified"] };

const heldAction = (workflowKey, label, key, icon) => ({
  entity: "reply",
  action: {
    workflow_id: `\${workflow:${workflowKey}}`, label, key,
    scope: "row", mode: "async", visible_when: heldOnly, input_map: [{ from: "record.id", to: "subject" }], icon,
  },
});

export const actions = {
  accept: heldAction("support_accept_message", "Accept into conversation", "accept", "check"),
  move: heldAction("support_move_message", "Move to a new ticket", "move", "split"),
};
