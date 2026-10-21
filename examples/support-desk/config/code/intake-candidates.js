// Builds what Intake looks a message up by: the Message-IDs it answers, newest
// first, and the ticket numbers in its plus address and subject. Inbound
// addresses arrive lowercased, so numbers are upper-cased to match ours.

const NUMBER = /^TK-\d{4}-\d+$/i;
const TOKEN = /\[(TK-\d{4}-\d+)\]/gi;

function list(v) {
  return Array.isArray(v) ? v : [];
}

function text(v) {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function unique(values) {
  return [...new Set(values)];
}

function main(inputs) {
  const ownId = text(inputs.message_id);
  const messageIds = unique(
    [text(inputs.in_reply_to), ...list(inputs.references).slice().reverse().map(text)].filter(
      (id) => id !== null && id !== ownId,
    ),
  );

  const plusNumbers = unique(
    list(inputs.plus_tags)
      .map((t) => text(t && t.tag))
      .filter((tag) => tag !== null && NUMBER.test(tag))
      .map((tag) => tag.toUpperCase()),
  );
  const subject = text(inputs.subject) || "";
  const subjectNumbers = unique([...subject.matchAll(TOKEN)].map((m) => m[1].toUpperCase()));

  const from = text(inputs.from);
  const named = from && from.match(/^\s*"?([^"<]*?)"?\s*<[^>]+>\s*$/);
  const senderName = named && named[1].trim() !== "" ? named[1].trim() : null;

  let clean = subject.replace(TOKEN, " ");
  for (;;) {
    const next = clean.replace(/^\s*(re|fwd?|aw|sv)\s*:\s*/i, "");
    if (next === clean) break;
    clean = next;
  }
  clean = clean.replace(/\s+/g, " ").trim();

  const headers = inputs.headers && typeof inputs.headers === "object" ? inputs.headers : {};
  const results = [].concat(headers["authentication-results"] || []);
  const dmarcFailed = results.some((r) => typeof r === "string" && /\bdmarc=fail\b/i.test(r));

  return {
    own_key: ownId || `email:${inputs.email_id}`,
    message_ids: messageIds,
    ticket_numbers: unique([...plusNumbers, ...subjectNumbers]),
    plus_numbers: plusNumbers,
    subject_numbers: subjectNumbers,
    sender_name: senderName,
    clean_subject: clean || "(no subject)",
    dmarc_failed: dmarcFailed,
  };
}
