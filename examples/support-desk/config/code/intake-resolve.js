// Picks the ticket a message belongs to, by the strongest signal it carries:
// a Message-ID it answers (ours, then the customer's own), then a ticket
// number in the plus address, then one in the subject.

const OURS = new Set(["agent", "bot"]);

function list(v) {
  return Array.isArray(v) ? v : [];
}

function idOf(ref) {
  if (typeof ref === "string") return ref;
  return ref && typeof ref.id === "string" ? ref.id : null;
}

function main(inputs) {
  const replies = list(inputs.replies);
  for (const id of list(inputs.message_ids)) {
    const reply = replies.find((r) => r && r.key === id);
    const ticket = reply && idOf(reply.ticket);
    if (ticket) {
      return { ticket_id: ticket, signal: OURS.has(reply.author_kind) ? "our_message" : "their_message" };
    }
  }
  const tickets = list(inputs.tickets);
  for (const [numbers, signal] of [
    [list(inputs.plus_numbers), "plus_tag"],
    [list(inputs.subject_numbers), "subject_token"],
  ]) {
    for (const number of numbers) {
      const ticket = tickets.find((t) => t && t.number === number);
      if (ticket && idOf(ticket.id)) return { ticket_id: idOf(ticket.id), signal };
    }
  }
  return { ticket_id: null, signal: null };
}
