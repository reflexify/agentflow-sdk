import {
  SP, NOBODY, TICKET, NOTE, ref, tpl, lit, bind, node, start, end, search, flt, create, update, decision, when,
  otherwise, edges, graph, workflow,
} from "./lib.mjs";

// The close compares the token it just read: a customer message (a new
// `customer:` token, status open) or a newer reply (a new `outbound:` token)
// between the read and the write makes it skip. `expect` cannot match a null,
// so a ticket with no token (one made by hand) is left out of the search, or it
// would be read and skipped every day and counted as checked each time.
const body = {
  schemaVersion: "1.0",
  start: "bs",
  end: ["be"],
  nodes: [
    node("bs", "Item", "start", {}),
    update("close", "Close it", TICKET, "input.item.id", [bind("status", lit("closed"))], {
      expect: { fields: { status: "pending", pending_token: "{{ input.item.pending_token }}" } },
    }),
    decision("closed", "Closed?", [
      when("be_closed", { "==": [{ var: "nodes.close.output.skipped" }, false] }),
      otherwise("be_kept"),
    ]),
    create("note", "Event: closed", NOTE, [
      bind("ticket", ref("input.item.id")),
      bind("kind", lit("event")),
      bind("body", lit("Closed: no reply from the customer for 7 business days")),
    ]),
    node("be", "Done", "end", {}),
  ],
  edges: edges(
    ["be0", "bs", "close"], ["be1", "close", "closed"], ["be_closed", "closed", "note"],
    ["be_kept", "closed", "be"], ["be2", "note", "be"],
  ),
};

const nodes = [
  start(),
  search("idle", "Idle pending tickets", TICKET, [
    flt("status", "eq", lit("pending")),
    flt("pending_token", "is_not_empty", lit("")),
    flt("pending_since", "lte", tpl("{{ now() | add_business_days(-7) }}")),
  ], { sort: "pending_since", dir: "asc", limit: 500 }),
  node("each", "Close each", "for_each", {
    listSource: "nodes.idle.output.records",
    itemAlias: "item",
    mode: "sequential",
    continueOnItemFailure: true,
    failOnItemFailure: false,
    body,
  }),
  end("end_done", "Done", "Done", { checked: { ...ref("nodes.idle.output.returnedCount"), label: "Tickets checked" } }),
];

export const workflows = {
  close_idle: workflow(
    "support_close_idle", "Support · Close idle tickets",
    "Daily: closes tickets waiting on the customer for 7 business days, unless anything moved since.",
    SP, NOBODY,
    graph("Support · Close idle tickets", nodes, edges(["e_start", "start", "idle"], ["e_i", "idle", "each"], ["e_e", "each", "end_done"])),
  ),
};

export const triggers = {
  close_idle: {
    workflow: "support_close_idle",
    kind: "schedule",
    enabled: true,
    config: { cron: "0 6 * * *", timezone: "${param:timezone}", input_template: {} },
  },
};

export const actions = {};
