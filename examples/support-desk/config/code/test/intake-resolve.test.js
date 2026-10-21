"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load");
const main = load("intake-resolve.js");

const T1 = "11111111-1111-1111-1111-111111111111";
const T2 = "22222222-2222-2222-2222-222222222222";
const none = { message_ids: [], plus_numbers: [], subject_numbers: [], replies: [], tickets: [] };

test("our Message-ID wins, in the order the message gives", () => {
  const out = main({
    ...none,
    message_ids: ["<new@desk.test>", "<old@desk.test>"],
    replies: [
      { id: "r-old", key: "<old@desk.test>", ticket: T2, author_kind: "agent" },
      { id: "r-new", key: "<new@desk.test>", ticket: T1, author_kind: "bot" },
    ],
  });
  assert.deepEqual(out, { ticket_id: T1, signal: "our_message" });
});

test("the customer's own earlier message", () => {
  const out = main({
    ...none,
    message_ids: ["<c0@mail.test>"],
    replies: [{ id: "r", key: "<c0@mail.test>", ticket: { id: T1 }, author_kind: "customer" }],
  });
  assert.deepEqual(out, { ticket_id: T1, signal: "their_message" });
});

test("a plus tag before a subject token", () => {
  const out = main({
    ...none,
    plus_numbers: ["TK-2026-0002"],
    subject_numbers: ["TK-2026-0001"],
    tickets: [
      { id: T1, number: "TK-2026-0001" },
      { id: T2, number: "TK-2026-0002" },
    ],
  });
  assert.deepEqual(out, { ticket_id: T2, signal: "plus_tag" });
});

test("a subject token alone", () => {
  const out = main({
    ...none,
    subject_numbers: ["TK-2026-0001"],
    tickets: [{ id: T1, number: "TK-2026-0001" }],
  });
  assert.deepEqual(out, { ticket_id: T1, signal: "subject_token" });
});

test("no match", () => {
  assert.deepEqual(main({ ...none, message_ids: ["<x@y>"], subject_numbers: ["TK-2026-9"] }), {
    ticket_id: null,
    signal: null,
  });
});
