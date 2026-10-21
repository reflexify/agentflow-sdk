import {
  SP, INITIATOR, NOBODY, SUPPORT, TICKET, REPLY, NOTE, CONTACT, RULE, NOW, ref, tpl, lit, bind, node, start, end,
  getById, search, flt, update, decision, when, otherwise, setvar, call, edges, graph, workflow,
  claimMailHeaderBindings, readParameters,
} from "./lib.mjs";
import { newestIn, IN_REPLY_TO, REFERENCES } from "./send.mjs";

const TRIAGE_SCHEMA = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: ["order_status", "refund_request", "invoice_request", "account_access", "product_question",
        "bug_report", "cancellation", "feedback", "other"],
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    needs_action: { type: "boolean" },
    wants_human: { type: "boolean" },
    language: { type: "string" },
    summary: { type: "string", maxLength: 240 },
  },
  required: ["intent", "confidence", "sentiment", "needs_action", "wants_human", "language", "summary"],
};

const SUPPORT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, source_id: { type: "string" } },
        required: ["title", "source_id"],
      },
    },
  },
  required: ["reply", "citations"],
};

// Every condition holds, or autopilot does nothing: the run was started by a
// customer's message, an enabled rule for the intent, a threshold and
// confidence that meets it, nothing a person must do, not unhappy, not asking
// for a person, and not a third AI reply in a row. Refunds and cancellations
// are never automatic, whatever a rule says or the model reports in
// `needs_action`. Rendered to the rule's mode (`shadow` or `live`) or `none`,
// because a Decision can't compare two values.
//
// A person's Generate reply, Regenerate and Accept/Move start this workflow
// without `automatic`, and never send: Triage reads only the conversation, so
// it cannot know what an instruction asked for, and an email can't be recalled.
// The flag is the string "yes" because an End or a designer round-trip retypes
// a boolean.
const NEVER_AUTOMATIC = "['refund_request', 'cancellation']";
const AUTOPILOT =
  "{%- set t = nodes.triage.output -%}" +
  "{%- set r = nodes.rule.output.records[0] if nodes.rule.output.returnedCount > 0 else none -%}" +
  "{%- set last = nodes.last_sent.output.records -%}" +
  "{%- set capped = (last | length) == 2 and last[0].author_kind == 'bot' and last[1].author_kind == 'bot' -%}" +
  `{%- if input.automatic == 'yes' and r and r.enabled and t.intent not in ${NEVER_AUTOMATIC}` +
  " and r.min_confidence is number and t.confidence >= r.min_confidence and not t.needs_action" +
  " and t.sentiment != 'negative' and not t.wants_human and not capped -%}{{ r.mode }}" +
  "{%- else -%}none{%- endif -%}";

// The agent reads the conversation, which is replies only. A fact a teammate
// put in a note (a tracking number, a promise made by phone) reaches it here,
// as context it must not quote. Rendered blank when there is nothing to add, so
// no extra turn is sent.
const PROMPT =
  "{%- set notes = nodes.notes.output.records -%}" +
  "{%- if notes -%}Internal notes from the support team about this ticket, newest first. Use them as context. " +
  "Never quote them, and never tell the customer they exist. Cite one you relied on as " +
  "{\"title\": \"Team note\", \"source_id\": \"<its id>\"}.\n" +
  "{%- for n in notes %}\n- [{{ n.id }}] {{ n.body }}{%- endfor %}{{ '\\n\\n' }}{%- endif -%}" +
  "{%- if input.instruction -%}Instruction for this draft: {{ input.instruction }}{%- endif -%}";

const DISCLOSURE = "This reply was written by {{ vars.company_name }}'s AI assistant. Reply to this email to reach a person.";

const outputs = {
  reply: { ...ref("nodes.draft.output.reply"), label: "Reply", showAs: "markdown" },
  draft: { ...ref("nodes.save.output.record.id"), label: "Draft", showAs: "record", entityId: REPLY },
  skipped: { ...ref("nodes.save.output.skipped"), showAs: "hidden" },
};

const draftNodes = [
  start({ subject: TICKET, params: true }),
  readParameters("inbound_domain", "company_name"),
  search("notes", "Team notes", NOTE, [
    flt("ticket", "eq", ref("subject.record_id")),
    flt("kind", "eq", lit("staff")),
  ], { sort: "created_at", dir: "desc", limit: 20 }),
  node("draft", "Draft the reply", "agent", {
    agentRef: { agentId: "${agent:support}" },
    conversation: { thread: "{{ subject.record_id }}", window: 30 },
    promptTemplate: PROMPT,
    outputSchema: SUPPORT_SCHEMA,
  }),
  // Triage reads after the Support turn, and the save checks only the Support
  // turn. A message that arrives after the Support turn read moves the
  // revision on and skips the save, so a save that passes means Triage read
  // the same conversation: autopilot never sends on the labels of an older one.
  node("triage", "Triage", "agent", {
    agentRef: { agentId: "${agent:triage}" },
    conversation: { thread: "{{ subject.record_id }}", window: 10 },
    promptTemplate: "",
    outputSchema: TRIAGE_SCHEMA,
  }, {
    error_handling: {
      strategy: "continue",
      default_output: {
        intent: "other", confidence: 0, sentiment: "neutral", needs_action: true, wants_human: true, language: "", summary: "",
      },
    },
  }),
  node("save", "Save the draft", "entity_record", {
    operation: "upsert",
    entityId: REPLY,
    matchBy: "key",
    matchKey: "key",
    conversationCheck: { step: "draft" },
    body: [
      bind("key", tpl("draft:{{ subject.record_id }}")),
      bind("ticket", ref("subject.record_id")),
      bind("status", lit("draft")),
      bind("author_kind", lit("bot")),
      bind("posted_at", NOW),
      bind("body", ref("nodes.draft.output.reply")),
      bind("ai_body", ref("nodes.draft.output.reply")),
      bind("citations", tpl("{{ nodes.draft.output.citations | tojson }}")),
      bind("intent", ref("nodes.triage.output.intent")),
      bind("intent_confidence", ref("nodes.triage.output.confidence")),
      bind("autopilot", lit("none")),
    ],
  }),
  decision("saved", "Saved?", [
    when("e_skipped", { "==": [{ var: "nodes.save.output.skipped" }, true] }),
    otherwise("e_saved"),
  ]),
  update("answered", "Remember what it answered", TICKET, "subject.record_id", [
    bind("answered_revision", ref("nodes.save.output.seen_revision")),
    bind("summary", ref("nodes.triage.output.summary")),
    bind("intent", ref("nodes.triage.output.intent")),
  ]),
  search("rule", "Autopilot rule", RULE, [flt("intent", "eq", ref("nodes.triage.output.intent"))], { limit: 1 }),
  search("last_sent", "Last two sent", REPLY, [
    flt("ticket", "eq", ref("subject.record_id")),
    flt("status", "in", lit(["sending", "sent"])),
  ], { sort: "posted_at", dir: "desc", limit: 2 }),
  setvar("decide", "Autopilot decision", [["autopilot", tpl(AUTOPILOT)]]),
  decision("route", "Send it?", [
    when("e_live", { "==": [{ var: "vars.autopilot" }, "live"] }),
    when("e_shadow", { "==": [{ var: "vars.autopilot" }, "shadow"] }),
    otherwise("e_person"),
  ]),
  update("would_send", "Mark: would have sent", REPLY, "nodes.save.output.record.id", [bind("autopilot", lit("would_send"))], {
    expect: { version: "{{ nodes.save.output.record.metadata.version }}" },
  }),
  getById("requester", "Read the requester", CONTACT, "subject.record.requester"),
  newestIn("subject.record_id"),
  call("autosend", "Send it", "${workflow:support_send_claim_autopilot}", "nodes.save.output.record.id", [
    ["version", ref("nodes.save.output.record.metadata.version")],
    ["body", tpl(`{{ nodes.save.output.record.body }}{% if nodes.rule.output.records[0].disclose %}\n\n${DISCLOSURE}{% endif %}`)],
    ["to", ref("nodes.requester.output.record.email")],
    ...claimMailHeaderBindings({ ticket: "subject.record", draft: "nodes.save.output.record" }),
    ["in_reply_to", IN_REPLY_TO],
    ["references", REFERENCES],
    ["ticket_id", ref("subject.record_id")],
  ], { error_handling: { strategy: "continue", default_output: { status: "error", outbound_id: "", skip_reason: "error" } } }),
  // The claim skips when the draft or the conversation moved, and the call's
  // `continue` default covers a claim that failed: only a sent reply is "Sent".
  decision("sent_ok", "Sent?", [
    when("e_sent", { "==": [{ var: "nodes.autosend.output.status" }, "sent"] }),
    otherwise("e_not_sent"),
  ]),
  end("end_drafted", "Drafted", "Drafted", outputs),
  end("end_sent", "Sent by autopilot", "Sent by autopilot", outputs),
  end("end_skipped", "Not saved", "Not saved", outputs),
];

const draftWiring = edges(
  ["e_start", "start", "params"], ["e_pa", "params", "notes"], ["e_no", "notes", "draft"], ["e_dr", "draft", "triage"], ["e_tr", "triage", "save"],
  ["e_sv", "save", "saved"], ["e_skipped", "saved", "end_skipped"], ["e_saved", "saved", "answered"],
  ["e_an", "answered", "rule"], ["e_ru", "rule", "last_sent"], ["e_ls", "last_sent", "decide"],
  ["e_de", "decide", "route"], ["e_live", "route", "requester"], ["e_shadow", "route", "would_send"],
  ["e_person", "route", "end_drafted"], ["e_ws", "would_send", "end_drafted"],
  ["e_rq", "requester", "newest_in"], ["e_ni", "newest_in", "autosend"], ["e_as", "autosend", "sent_ok"],
  ["e_sent", "sent_ok", "end_sent"], ["e_not_sent", "sent_ok", "end_drafted"],
);

// A queued run for messages the last answer already read ends here,
// before any model call. An accepted older message moves the revision, so it
// is never skipped. The flag is "yes" or "no" because the designer retypes a
// "true" it finds in a condition, and a saved Decision must keep its routing.
const gateNodes = [
  start({ subject: REPLY }),
  getById("ticket", "Read the ticket", TICKET, "subject.record.ticket"),
  setvar("gate", "Already answered?", [[
    "answered",
    tpl("{{ 'yes' if nodes.ticket.output.conversation_revision == nodes.ticket.output.record.answered_revision else 'no' }}"),
  ]]),
  decision("is_answered", "Answered?", [
    when("e_answered", { "==": [{ var: "vars.answered" }, "yes"] }),
    otherwise("e_unanswered"),
  ]),
  call("draft", "Draft a reply", "${workflow:support_draft_reply}", "subject.record.ticket", [["automatic", lit("yes")]]),
  end("end_drafted", "Drafted", "Drafted"),
  end("end_answered", "Already answered", "Already answered"),
];

export const workflows = {
  draft_reply: workflow(
    "support_draft_reply", "Support · Draft reply",
    "Drafts a reply to the ticket's conversation, and sends it when an autopilot rule allows.",
    INITIATOR, SUPPORT, graph("Support · Draft reply", draftNodes, draftWiring),
    { type: "object", properties: { instruction: { type: "string" }, automatic: { type: "string" } } },
  ),
  draft_on_message: workflow(
    "support_draft_on_message", "Support · Draft on customer message",
    "Drafts a reply when a customer writes, once per burst, unless the conversation was already answered.",
    SP, NOBODY,
    graph("Support · Draft on customer message", gateNodes, edges(
      ["e_start", "start", "ticket"], ["e_t", "ticket", "gate"], ["e_g", "gate", "is_answered"],
      ["e_answered", "is_answered", "end_answered"], ["e_unanswered", "is_answered", "draft"],
      ["e_d", "draft", "end_drafted"],
    )),
  ),
};

export const triggers = {
  draft_on_message: {
    workflow: "support_draft_on_message",
    kind: "entity_record",
    enabled: true,
    config: {
      entity_id: REPLY,
      change_kind: "created",
      filter: { "==": [{ var: "author_kind" }, "customer"] },
      input_mappings: [],
      group: { by: { kind: "field", field: "ticket" }, linger_ms: 2000, max_batch: 50 },
    },
  },
};

export const actions = {
  generate_reply: {
    entity: "ticket",
    action: {
      workflow_id: "${workflow:support_draft_reply}",
      label: "Generate reply",
      key: "generate_reply",
      scope: "row",
      mode: "sync",
      input_map: [{ from: "record.id", to: "subject" }],
      icon: "sparkles",
    },
  },
};
