import {
  SP, INITIATOR, NOBODY, REPLY, NOTE, ref, tpl, lit, bind, start, end, search, flt, create, update, decision,
  when, otherwise, call, edges, graph, workflow,
} from "./lib.mjs";

const recordNodes = [
  start({ params: true }),
  // A blank id must never reach the search: it would compare against blank
  // values, not "nothing". An event from a send queued before the worker
  // tagged its row carries no id.
  decision("tagged", "Names our message?", [
    when("e_tagged", { "!!": [{ var: "input.outbound_id" }] }),
    otherwise("e_untagged"),
  ]),
  search("reply", "Find the reply", REPLY, [flt("outbound_id", "eq", ref("input.outbound_id"))], { limit: 1 }),
  decision("found", "Found?", [
    when("e_found", { ">": [{ var: "nodes.reply.output.returnedCount" }, 0] }),
    otherwise("e_missing"),
  ]),
  update("delivered", "Record delivery", REPLY, "nodes.reply.output.records[0].id", [
    bind("provider_id", ref("input.provider_id")),
    bind("key", tpl(
      "{{ input.message_id if (input.message_id and nodes.reply.output.records[0].key[:9] == 'outbound:') " +
        "else nodes.reply.output.records[0].key }}",
    )),
  ]),
  decision("outcome", "Delivered?", [
    when("e_ok", { "==": [{ var: "input.outcome" }, "delivered"] }),
    otherwise("e_failed"),
  ]),
  // A send that already failed reports it again (a bounce for each retry, then
  // a failure event): only the event that moves the reply from sent to failed
  // leaves the note. The expectation is read under the reply's row lock, so two
  // events handled at once cannot both see "sent".
  update("mark_failed", "Mark failed", REPLY, "nodes.reply.output.records[0].id", [bind("status", lit("failed"))], {
    expect: { fields: { status: "sent" } },
  }),
  decision("newly_failed", "Newly failed?", [
    when("e_already", { "==": [{ var: "nodes.mark_failed.output.skipped" }, true] }),
    otherwise("e_newly"),
  ]),
  create("note_failed", "Note: not delivered", NOTE, [
    bind("ticket", ref("nodes.reply.output.records[0].ticket")),
    bind("kind", lit("system")),
    bind("body", tpl("A reply was not delivered ({{ input.outcome }}): {{ input.reason or 'no reason given' }}.")),
  ]),
  end("end_recorded", "Recorded", "Recorded"),
  end("end_unmatched", "Not ours", "Not ours"),
];

// The event property that carries each event's reason; a delivery has none.
const REASON = { delivered: null, bounced: "bounce_message", failed: "failed_reason" };

// All or nothing: a failure between the reply's status and its note would leave
// a failed reply, which a retry then finds already failed and never notes.
export const workflows = {
  record_delivery: workflow(
    "support_record_delivery", "Support · Record delivery",
    "Finds the sent reply a delivery event names, and records what happened to it.",
    INITIATOR, NOBODY,
    graph("Support · Record delivery", recordNodes, edges(
      ["e_start", "start", "tagged"], ["e_tagged", "tagged", "reply"], ["e_untagged", "tagged", "end_unmatched"],
      ["e_r", "reply", "found"], ["e_found", "found", "delivered"], ["e_missing", "found", "end_unmatched"],
      ["e_d", "delivered", "outcome"], ["e_ok", "outcome", "end_recorded"], ["e_failed", "outcome", "mark_failed"],
      ["e_mf", "mark_failed", "newly_failed"], ["e_already", "newly_failed", "end_recorded"],
      ["e_newly", "newly_failed", "note_failed"], ["e_nf", "note_failed", "end_recorded"],
    ), "atomic"),
    {
      type: "object",
      properties: Object.fromEntries(
        ["outbound_id", "provider_id", "message_id", "outcome", "reason"].map((k) => [k, { type: "string" }]),
      ),
    },
  ),
};

export const triggers = {};

for (const [kind, reason] of Object.entries(REASON)) {
  const inputs = [
    ["outbound_id", tpl("{{ input.outbound_id or '' }}")],
    ["provider_id", ref("input.email_id")],
    ["message_id", tpl("{{ input.message_id or '' }}")],
    ["outcome", lit(kind)],
    ...(reason ? [["reason", tpl(`{{ input.${reason} or '' }}`)]] : []),
  ];
  workflows[`delivery_${kind}`] = workflow(
    `support_delivery_${kind}`, `Support · Delivery · ${kind}`,
    `Records an email.${kind} event on the reply it names.`,
    SP, NOBODY,
    graph(`Support · Delivery · ${kind}`, [
      start(),
      call("record", "Record it", "${workflow:support_record_delivery}", null, inputs),
      end("end", "Done", "Done"),
    ], edges(["e_start", "start", "record"], ["e_r", "record", "end"])),
  );
  triggers[`delivery_${kind}`] = {
    workflow: `support_delivery_${kind}`,
    kind: "connected_app",
    enabled: true,
    config: {
      provider: "resend",
      external_account_id: "${param:resend_connection_id}",
      object_type: `email.${kind}`,
      change_kind: "created",
      filter: {},
      input_mappings: ["outbound_id", "email_id", "message_id", ...(reason ? [reason] : [])]
        .map((k) => ({ from: `event.properties.${k}`, to: k })),
    },
  };
}

export const actions = {};
