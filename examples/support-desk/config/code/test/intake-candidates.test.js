"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { load } = require("./load");
const main = load("intake-candidates.js");

const base = {
  message_id: "<c1@mail.gmail.com>",
  email_id: "re_in_1",
  in_reply_to: null,
  references: [],
  plus_tags: [],
  subject: "Help",
  from: "Ana Lima <ana@example.com>",
  headers: {},
};

test("in_reply_to first, then references newest first, without repeats or our own id", () => {
  const out = main({
    ...base,
    in_reply_to: "<r3@desk.test>",
    references: ["<r1@desk.test>", "<r2@desk.test>", "<r3@desk.test>", "<c1@mail.gmail.com>"],
  });
  assert.deepEqual(out.message_ids, ["<r3@desk.test>", "<r2@desk.test>", "<r1@desk.test>"]);
});

test("a lowercased plus tag becomes a ticket number", () => {
  const out = main({
    ...base,
    plus_tags: [{ address: "support+tk-2026-0418@desk.test", tag: "tk-2026-0418" }],
  });
  assert.deepEqual(out.plus_numbers, ["TK-2026-0418"]);
  assert.deepEqual(out.ticket_numbers, ["TK-2026-0418"]);
});

test("a plus tag that is not a ticket number is ignored", () => {
  const out = main({ ...base, plus_tags: [{ address: "support+billing@desk.test", tag: "billing" }] });
  assert.deepEqual(out.plus_numbers, []);
});

test("subject tokens, any case, after plus tags, without repeats", () => {
  const out = main({
    ...base,
    subject: "Re: [tk-2026-0007] [TK-2026-0418] still broken",
    plus_tags: [{ address: "support+TK-2026-0418@desk.test", tag: "TK-2026-0418" }],
  });
  assert.deepEqual(out.subject_numbers, ["TK-2026-0007", "TK-2026-0418"]);
  assert.deepEqual(out.ticket_numbers, ["TK-2026-0418", "TK-2026-0007"]);
});

test("the key falls back to the email id when there is no Message-ID", () => {
  assert.equal(main({ ...base, message_id: null }).own_key, "email:re_in_1");
  assert.equal(main({ ...base, message_id: "  " }).own_key, "email:re_in_1");
  assert.equal(main(base).own_key, "<c1@mail.gmail.com>");
});

test("the sender's display name, unquoted, or null", () => {
  assert.equal(main(base).sender_name, "Ana Lima");
  assert.equal(main({ ...base, from: '"Lima, Ana" <ana@example.com>' }).sender_name, "Lima, Ana");
  assert.equal(main({ ...base, from: "ana@example.com" }).sender_name, null);
  assert.equal(main({ ...base, from: null }).sender_name, null);
});

test("the subject without reply prefixes or ticket tokens", () => {
  assert.equal(main({ ...base, subject: "RE: Fwd: [TK-2026-0418] Refund" }).clean_subject, "Refund");
  assert.equal(main({ ...base, subject: "  " }).clean_subject, "(no subject)");
  assert.equal(main({ ...base, subject: null }).clean_subject, "(no subject)");
});

test("dmarc=fail in Authentication-Results, as a string or a repeated header", () => {
  const fail = "mx.resend.com; spf=pass smtp.mailfrom=x.test; dmarc=fail header.from=x.test";
  assert.equal(main({ ...base, headers: { "authentication-results": fail } }).dmarc_failed, true);
  assert.equal(
    main({ ...base, headers: { "authentication-results": ["mx; dkim=pass", fail] } }).dmarc_failed,
    true,
  );
  assert.equal(
    main({ ...base, headers: { "authentication-results": "mx; dmarc=pass" } }).dmarc_failed,
    false,
  );
  assert.equal(main({ ...base, headers: null }).dmarc_failed, false);
});

test("missing lists are empty, not errors", () => {
  const out = main({ ...base, references: null, plus_tags: null });
  assert.deepEqual(out.message_ids, []);
  assert.deepEqual(out.ticket_numbers, []);
});
