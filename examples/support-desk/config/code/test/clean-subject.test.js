"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load");
const main = load("clean-subject.js");
const candidates = load("intake-candidates.js");

const SUBJECTS = [
  "Help",
  "[TK-2026-0001] hi",
  "RE: Fwd: [TK-2026-0418] Refund",
  "Re: re: [tk-2026-7] [TK-2026-8]  too   many spaces ",
  "Aw: Sv: Where is it?",
  "  ",
  "",
  null,
  undefined,
];

test("the subject without reply prefixes or ticket tokens", () => {
  assert.equal(main({ subject: "[TK-2026-0001] hi" }).clean_subject, "hi");
  assert.equal(main({ subject: "RE: Fwd: [TK-2026-0418] Refund" }).clean_subject, "Refund");
});

test("a subject with nothing left is '(no subject)'", () => {
  for (const subject of ["  ", "", null, undefined, "Re: [TK-2026-0001]"]) {
    assert.equal(main({ subject }).clean_subject, "(no subject)");
  }
});

test("it cleans exactly as Intake does for a new ticket", () => {
  const intake = { message_id: "<m@x>", email_id: "e", in_reply_to: null, references: [], plus_tags: [], from: null, headers: {} };
  for (const subject of SUBJECTS) {
    assert.equal(main({ subject }).clean_subject, candidates({ ...intake, subject }).clean_subject, JSON.stringify(subject));
  }
});
