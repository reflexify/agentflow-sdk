"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load");
const main = load("intake-participant.js");

const base = {
  sender: "ana@example.com",
  requester_email: "ana@example.com",
  replies: [],
  our_domains: "desk.test, help.desk.test",
  dmarc_failed: false,
};

test("the requester", () => {
  assert.deepEqual(main(base), { participant: true, reason: "requester" });
  assert.deepEqual(main({ ...base, sender: " ANA@Example.com " }), { participant: true, reason: "requester" });
});

test("an address an earlier accepted message was from, to or cc", () => {
  const out = main({
    ...base,
    sender: "bo@example.com",
    replies: [{ from_address: "ana@example.com", to: "support@desk.test", cc: "Bo <bo@example.com>; cy@x.test" }],
  });
  assert.deepEqual(out, { participant: true, reason: "earlier_message" });
});

test("a stranger who guessed the ticket number", () => {
  const out = main({
    ...base,
    sender: "eve@evil.test",
    replies: [{ from_address: "ana@example.com", to: "support@desk.test", cc: null }],
  });
  assert.deepEqual(out, { participant: false, reason: "not_a_participant" });
});

test("our own addresses never count, even when an earlier message names them", () => {
  const out = main({
    ...base,
    sender: "support@desk.test",
    replies: [{ from_address: "support@desk.test", to: "ana@example.com", cc: "" }],
  });
  assert.deepEqual(out, { participant: false, reason: "our_address" });
  assert.equal(main({ ...base, sender: "x@help.desk.test" }).reason, "our_address");
});

test("failed DMARC is not a participant, even as the requester", () => {
  assert.deepEqual(main({ ...base, dmarc_failed: true }), { participant: false, reason: "dmarc_failed" });
});
