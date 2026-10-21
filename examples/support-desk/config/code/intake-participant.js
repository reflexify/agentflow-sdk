// Whether a matched message's sender may join the ticket's conversation: the
// requester, or anyone an earlier accepted message was from, to or copied to.
// Ticket numbers are guessable, so a match alone never admits a message.

function lower(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function addresses(field) {
  if (typeof field !== "string") return [];
  return field
    .split(/[,;]/)
    .map((part) => {
      const angled = part.match(/<([^>]+)>/);
      return lower(angled ? angled[1] : part);
    })
    .filter((a) => a.includes("@"));
}

function main(inputs) {
  const ours = new Set(String(inputs.our_domains || "").split(",").map(lower).filter(Boolean));
  const isOurs = (address) => ours.has(address.slice(address.lastIndexOf("@") + 1));
  const sender = lower(inputs.sender);

  if (inputs.dmarc_failed === true) return { participant: false, reason: "dmarc_failed" };
  if (isOurs(sender)) return { participant: false, reason: "our_address" };
  if (sender !== "" && sender === lower(inputs.requester_email)) {
    return { participant: true, reason: "requester" };
  }
  const known = new Set();
  for (const r of Array.isArray(inputs.replies) ? inputs.replies : []) {
    for (const a of [...addresses(r && r.from_address), ...addresses(r && r.to), ...addresses(r && r.cc)]) {
      if (!isOurs(a)) known.add(a);
    }
  }
  return known.has(sender)
    ? { participant: true, reason: "earlier_message" }
    : { participant: false, reason: "not_a_participant" };
}
