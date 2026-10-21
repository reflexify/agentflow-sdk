import type { QueueTask } from '../api/desk-api.js';
import { instantMs } from '../model/instant.js';
import type { Note, Reply, Ticket } from '../model/types.js';
import type { Folder } from '../shell/route.js';

export interface QueueRow {
  ticket: Ticket;
  task: QueueTask | null;
  hasDraft: boolean;
  /** Autopilot, in shadow mode, would have sent the draft. */
  wouldSend: boolean;
  heldCount: number;
}
export type SortKey = 'sla' | 'waiting' | 'newest';

const unique = (ids: string[]) => [...new Set(ids)];

/** An instant to order by; a missing or unreadable one sorts last. */
const at = (v: string | null | undefined) => instantMs(v) ?? Number.POSITIVE_INFINITY;
const compare = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

export function folderTicketIds(folder: Folder, d: {
  meId: string; tasks: QueueTask[]; pending: Ticket[]; open: Ticket[]; mentions: Note[];
}): string[] {
  switch (folder) {
    case 'mine': return unique(d.tasks.filter((t) => t.claimedByUserId === d.meId).map((t) => t.ticketId));
    case 'unclaimed': return unique(d.tasks.filter((t) => t.status === 'open').map((t) => t.ticketId));
    case 'mentions': return unique([...d.mentions].sort((a, b) => compare(at(b.createdAt), at(a.createdAt))).map((n) => n.ticketId));
    case 'waiting': return d.pending.map((t) => t.id);
    case 'open': return d.open.map((t) => t.id);
  }
}

export function buildRows(ids: string[], d: { tickets: Map<string, Ticket>; tasks: QueueTask[]; drafts: Reply[]; held: Reply[] }): QueueRow[] {
  return ids.flatMap((id) => {
    const ticket = d.tickets.get(id);
    if (!ticket) return [];
    const draft = d.drafts.find((r) => r.ticketId === id && r.key === `draft:${id}`);
    return [{
      ticket,
      task: d.tasks.find((t) => t.ticketId === id) ?? null,
      hasDraft: draft !== undefined,
      wouldSend: draft?.autopilot === 'would_send',
      heldCount: d.held.filter((r) => r.ticketId === id).length,
    }];
  });
}

export function sortRows(rows: QueueRow[], key: SortKey): QueueRow[] {
  const by = (f: (r: QueueRow) => number, desc = false) =>
    [...rows].sort((a, b) => (desc ? compare(f(b), f(a)) : compare(f(a), f(b))) || a.ticket.id.localeCompare(b.ticket.id));
  switch (key) {
    case 'sla': return by((r) => at(r.task?.dueAt));
    case 'waiting': return by((r) => at(r.ticket.lastCustomerAt));
    case 'newest': return by((r) => at(r.ticket.updatedAt), true);
  }
}

export function nextClaimable(tasks: QueueTask[]): QueueTask | null {
  return tasks.filter((t) => t.status === 'open').sort((a, b) => compare(at(a.dueAt), at(b.dueAt)))[0] ?? null;
}
