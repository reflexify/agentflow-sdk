// A held message's subject as its own ticket's: without reply prefixes and the
// ticket number the sender guessed. The same rule Intake applies to a new
// ticket's subject (intake-candidates.js); a test holds the two together.

const TOKEN = /\[(TK-\d{4}-\d+)\]/gi;

function main(inputs) {
  const subject = typeof inputs.subject === "string" ? inputs.subject.trim() : "";
  let clean = subject.replace(TOKEN, " ");
  for (;;) {
    const next = clean.replace(/^\s*(re|fwd?|aw|sv)\s*:\s*/i, "");
    if (next === clean) break;
    clean = next;
  }
  clean = clean.replace(/\s+/g, " ").trim();
  return { clean_subject: clean || "(no subject)" };
}
