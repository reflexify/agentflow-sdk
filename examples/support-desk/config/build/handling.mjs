import {
  SP, NOBODY, TICKET, NOTE, NOW, ref, tpl, lit, bind, node, start, end, getById, create, update, decision, when,
  otherwise, edges, graph, workflow,
} from "./lib.mjs";

// The write skips with `changed` when the customer wrote after the task opened.
// The run then just ends: the customer's message already queued a start on this
// ticket's lane, and that next run opens a fresh task.
const LAST_SEEN = { fields: { last_customer_at: "{{ nodes.ticket.output.record.last_customer_at }}" } };
const PRIORITIES = ["urgent", "high", "normal", "low"];
const NEXT = "{'low': 'normal', 'normal': 'high', 'high': 'urgent', 'urgent': 'urgent'}[nodes.ticket.output.record.priority]";
// Who acted, for the thread's event line. The desk adds `by_user` (the
// claimant, the only one who may submit) to what it submits; a task submitted
// elsewhere leaves the note without an author. Only one of the four ran.
const BY = `{{ ${PRIORITIES.map((p) => `nodes.handle_${p}.output.by_user`).join(" or ")} }}`;
const eventNote = (id, name, body) =>
  create(id, name, NOTE, [
    bind("ticket", ref("subject.record_id")),
    bind("kind", lit("event")),
    bind("author_user", tpl(BY)),
    bind("body", body),
  ]);
// Said from the priority as the run read it, before `raise_priority` wrote.
const ESCALATED =
  "{% if nodes.ticket.output.record.priority == 'urgent' %}Escalated: already urgent, reopened in the urgent pool" +
  `{% else %}Escalated: priority raised to {{ ${NEXT} }}{% endif %}`;
const SLA = { urgent: [1, "business_hours"], high: [4, "business_hours"], normal: [1, "business_days"], low: [3, "business_days"] };

function handleStep(p) {
  const [value, unit] = SLA[p];
  return node(`handle_${p}`, `Handle ticket (${p})`, "human", {
    taskName: "{{ subject.record.number }} · {{ subject.record.subject }}",
    taskDescription: "Reply to the customer from the desk, then mark the ticket.",
    assignment: {
      candidates: [{
        kind: "unit",
        unit: { mode: "unit", unitId: { kind: "literal", value: `\${param:unit_${p}}` } },
        reach: "unit",
        group: "${param:support_group_id}",
      }],
    },
    actions: [
      { id: "solved", label: "Solved", edgeIds: [`e_${p}_solved`], tone: "primary" },
      { id: "waiting", label: "Waiting on customer", edgeIds: [`e_${p}_waiting`] },
      { id: "escalate", label: "Escalate", edgeIds: [`e_${p}_escalate`], tone: "warning" },
    ],
    sla: { deadline: { value, unit } },
    escalation: { levels: [{ at: { kind: "onDue" }, interrupting: false, action: { kind: "notifyAssignees" } }] },
  });
}

const nodes = [
  start({ subject: TICKET }),
  getById("ticket", "Read the ticket", TICKET, "subject.record_id"),
  decision("needs_handling", "New or open?", [
    when("e_open", { or: [
      { "==": [{ var: "nodes.ticket.output.record.status" }, "new"] },
      { "==": [{ var: "nodes.ticket.output.record.status" }, "open"] },
    ] }),
    otherwise("e_nothing"),
  ]),
  decision("by_priority", "Which pool?", [
    when("e_urgent", { "==": [{ var: "nodes.ticket.output.record.priority" }, "urgent"] }),
    when("e_high", { "==": [{ var: "nodes.ticket.output.record.priority" }, "high"] }),
    when("e_low", { "==": [{ var: "nodes.ticket.output.record.priority" }, "low"] }),
    otherwise("e_normal"),
  ]),
  ...PRIORITIES.map(handleStep),
  update("mark_solved", "Mark solved", TICKET, "subject.record_id", [bind("status", lit("solved"))], { expect: LAST_SEEN }),
  update("mark_waiting", "Mark waiting on customer", TICKET, "subject.record_id", [
    bind("status", lit("pending")),
    bind("pending_since", NOW),
  ], { expect: LAST_SEEN }),
  // Handling's trigger listens for a change to the priority or to `escalated_at`,
  // so the next run opens the task again in the higher pool, with its SLA. At
  // urgent the priority stays as it is and the stamp is the change that
  // reopens the task in the urgent pool.
  update("raise_priority", "Raise the priority", TICKET, "subject.record_id", [
    bind("priority", tpl(`{{ ${NEXT} }}`)),
    bind("escalated_at", NOW),
  ]),
  decision("solved_stuck", "Marked solved?", [
    when("e_solved_changed", { "==": [{ var: "nodes.mark_solved.output.skipped" }, true] }),
    otherwise("e_solved_ok"),
  ]),
  decision("waiting_stuck", "Marked waiting?", [
    when("e_waiting_changed", { "==": [{ var: "nodes.mark_waiting.output.skipped" }, true] }),
    otherwise("e_waiting_ok"),
  ]),
  eventNote("note_solved", "Event: solved", lit("Marked solved")),
  eventNote("note_waiting", "Event: waiting", lit("Marked waiting on customer")),
  eventNote("note_escalated", "Event: escalated", tpl(ESCALATED)),
  end("end_done", "Done", "Done"),
  end("end_changed", "Customer wrote meanwhile", "Customer wrote meanwhile"),
  end("end_nothing", "Nothing to handle", "Nothing to handle"),
];

const wiring = edges(
  ["e_start", "start", "ticket"],
  ["e_t", "ticket", "needs_handling"],
  ["e_open", "needs_handling", "by_priority"],
  ["e_nothing", "needs_handling", "end_nothing"],
  ...PRIORITIES.flatMap((p) => [
    [`e_${p}`, "by_priority", `handle_${p}`],
    [`e_${p}_solved`, `handle_${p}`, "mark_solved"],
    [`e_${p}_waiting`, `handle_${p}`, "mark_waiting"],
    [`e_${p}_escalate`, `handle_${p}`, "raise_priority"],
  ]),
  ["e_ms", "mark_solved", "solved_stuck"],
  ["e_solved_changed", "solved_stuck", "end_changed"],
  ["e_solved_ok", "solved_stuck", "note_solved"],
  ["e_ns", "note_solved", "end_done"],
  ["e_mw", "mark_waiting", "waiting_stuck"],
  ["e_waiting_changed", "waiting_stuck", "end_changed"],
  ["e_waiting_ok", "waiting_stuck", "note_waiting"],
  ["e_nw", "note_waiting", "end_done"],
  ["e_rp", "raise_priority", "note_escalated"],
  ["e_ne", "note_escalated", "end_done"],
);

export const workflows = {
  handling: workflow(
    "support_handling", "Support · Handling",
    "One active run per ticket: a person handles it, then marks it solved, waiting, or escalated.",
    SP, NOBODY, graph("Support · Handling", nodes, wiring),
  ),
};

export const triggers = {
  handling: {
    workflow: "support_handling",
    kind: "entity_record",
    enabled: true,
    config: {
      entity_id: TICKET,
      change_kind: "updated",
      filter: { or: [
        { in: ["last_customer_at", { var: "event.changed" }] },
        { in: ["priority", { var: "event.changed" }] },
        { in: ["escalated_at", { var: "event.changed" }] },
      ] },
      input_mappings: [],
      group: { by: { kind: "record" }, linger_ms: 0, max_batch: 50, hold_while_waiting: true },
    },
  },
};

export const actions = {};
