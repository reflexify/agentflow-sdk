import { instantMs } from './instant.js';
import type { Note, Reply } from './types.js';

export type ThreadItem =
  | { kind: 'customer' | 'ours' | 'bot' | 'held'; id: string; at: string; reply: Reply }
  | { kind: 'note' | 'system' | 'event' | 'held_note'; id: string; at: string; note: Note };

function replyKind(r: Reply): 'customer' | 'ours' | 'bot' | 'held' {
  if (r.authorKind === 'unverified') return 'held';
  if (r.authorKind === 'customer') return 'customer';
  return r.authorKind === 'bot' ? 'bot' : 'ours';
}

const NOTE_KIND = { staff: 'note', ai_summary: 'note', held_message: 'held_note', system: 'system', event: 'event' } as const;

/** Replies and notes in one timeline, oldest first. Drafts stay in the composer. */
export function threadItems(replies: Reply[], notes: Note[]): ThreadItem[] {
  const items: ThreadItem[] = [
    ...replies.filter((r) => r.status !== 'draft').map((r) => ({ kind: replyKind(r), id: r.id, at: r.postedAt, reply: r })),
    ...notes.map((n) => ({ kind: NOTE_KIND[n.kind], id: n.id, at: n.createdAt, note: n })),
  ];
  const ms = (at: string) => instantMs(at) ?? 0;
  return items.sort((a, b) => ms(a.at) - ms(b.at) || a.id.localeCompare(b.id));
}

export function authorship(r: Reply): 'autopilot' | 'ai_unchanged' | 'ai_edited' | null {
  if (r.autopilot === 'sent') return 'autopilot';
  if (r.status === 'draft' || !r.aiBody) return null;
  return r.aiUnchanged ? 'ai_unchanged' : 'ai_edited';
}

const QUOTE_START = /^(>|On .+ wrote:\s*$|Vào .+ đã viết:\s*$|-----Original Message-----)/;

/**
 * A message that is all quote (the first line starts it) keeps the whole body visible and
 * offers nothing to collapse: `quoted` is then the body itself, so the thread shows a
 * "Show quoted text" toggle only when `quoted` differs from the body.
 */
export function splitQuoted(body: string): { visible: string; quoted: string | null } {
  const lines = body.split('\n');
  const at = lines.findIndex((l) => QUOTE_START.test(l.trim()));
  if (at <= 0) return { visible: body.trimEnd(), quoted: at === 0 ? body : null };
  return { visible: lines.slice(0, at).join('\n').trimEnd(), quoted: lines.slice(at).join('\n') };
}

export function newestCustomerAt(replies: Reply[]): string | null {
  return replies
    .filter((r) => r.authorKind === 'customer' && r.status === 'received')
    .reduce<string | null>((max, r) => (max === null || (instantMs(r.postedAt) ?? 0) > (instantMs(max) ?? 0) ? r.postedAt : max), null);
}

export function draftOf(replies: Reply[], ticketId: string): Reply | null {
  return replies.find((r) => r.status === 'draft' && r.key === `draft:${ticketId}`) ?? null;
}
