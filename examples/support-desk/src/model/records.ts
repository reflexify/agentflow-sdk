import { utcIso } from './instant.js';
import type {
  AutopilotRule, CannedReply, Citation, Contact, DeskRecord, FileRef, HeldReason, MatchedBy, Note, Reply, Ticket,
} from './types.js';

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const bool = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);
const oneOf = <T extends string>(v: unknown, values: readonly T[], fallback: T): T =>
  (values as readonly unknown[]).includes(v) ? (v as T) : fallback;
const maybeOneOf = <T extends string>(v: unknown, values: readonly T[]): T | null =>
  (values as readonly unknown[]).includes(v) ? (v as T) : null;

function label(r: DeskRecord, field: string): string | null {
  const id = str(r.body[field]);
  return id ? (r.refLabels[field]?.[id] ?? null) : null;
}

function files(r: DeskRecord, field: string): FileRef[] {
  const ids = Array.isArray(r.body[field]) ? (r.body[field] as unknown[]).filter((v): v is string => typeof v === 'string') : [];
  return ids.map((id) => ({ id, name: r.fileLabels[field]?.[id] ?? 'file' }));
}

function citations(v: unknown): Citation[] {
  if (typeof v !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(v);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((c) =>
      c && typeof c === 'object' && typeof (c as Record<string, unknown>).title === 'string'
        ? [{ title: (c as Record<string, string>).title, sourceId: String((c as Record<string, unknown>).source_id ?? '') }]
        : [],
    );
  } catch {
    return [];
  }
}

// Datetime fields are read as UTC (`utcIso`) so they order against each other and against `createdAt`.
// `updatedAt` is not touched: a save sends it back exactly as the API wrote it.
const base = (r: DeskRecord) => ({ id: r.id, version: r.version, updatedAt: r.updatedAt, createdAt: r.createdAt });

export function toTicket(r: DeskRecord): Ticket {
  const b = r.body;
  return {
    ...base(r),
    number: str(b.number) ?? '',
    subject: str(b.subject) ?? '',
    status: oneOf(b.status, ['new', 'open', 'pending', 'solved', 'closed'], 'new'),
    priority: oneOf(b.priority, ['low', 'normal', 'high', 'urgent'], 'normal'),
    requesterId: str(b.requester),
    requesterName: label(r, 'requester'),
    lastCustomerAt: utcIso(b.last_customer_at),
    pendingSince: utcIso(b.pending_since),
    firstRepliedAt: utcIso(b.first_replied_at),
    escalatedAt: utcIso(b.escalated_at),
    possibleDuplicateOf: str(b.possible_duplicate_of),
    summary: str(b.summary),
    intent: str(b.intent),
  };
}

export function toReply(r: DeskRecord): Reply {
  const b = r.body;
  return {
    ...base(r),
    ticketId: str(b.ticket) ?? '',
    postedAt: utcIso(b.posted_at) ?? r.createdAt,
    authorKind: oneOf(b.author_kind, ['customer', 'unverified', 'agent', 'bot'], 'customer'),
    authorUserId: str(b.author_user),
    authorUserName: label(r, 'author_user'),
    status: oneOf(b.status, ['draft', 'sending', 'sent', 'failed', 'received'], 'received'),
    body: typeof b.body === 'string' ? b.body : '',
    attachments: files(r, 'attachments'),
    key: str(b.key) ?? '',
    subject: str(b.subject),
    fromAddress: str(b.from_address),
    to: str(b.to),
    cc: str(b.cc),
    outboundId: str(b.outbound_id),
    providerId: str(b.provider_id),
    aiBody: typeof b.ai_body === 'string' ? b.ai_body : null,
    citations: citations(b.citations),
    autopilot: oneOf(b.autopilot, ['none', 'would_send', 'sent'], 'none'),
    intent: str(b.intent),
    intentConfidence: num(b.intent_confidence),
    aiUnchanged: bool(b.ai_unchanged),
    heldReason: maybeOneOf<HeldReason>(b.held_reason, ['not_a_participant', 'dmarc_failed', 'our_address']),
    matchedBy: maybeOneOf<MatchedBy>(b.matched_by, ['our_message', 'their_message', 'plus_tag', 'subject_token']),
  };
}

export function toNote(r: DeskRecord): Note {
  const b = r.body;
  return {
    ...base(r),
    ticketId: str(b.ticket) ?? '',
    authorUserId: str(b.author_user),
    authorUserName: label(r, 'author_user'),
    kind: oneOf(b.kind, ['staff', 'ai_summary', 'held_message', 'system', 'event'], 'staff'),
    body: typeof b.body === 'string' ? b.body : '',
    mentions: (str(b.mentions) ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  };
}

export function toContact(r: DeskRecord): Contact {
  const b = r.body;
  return {
    ...base(r), email: str(b.email) ?? '', name: str(b.name), organization: str(b.organization),
    locale: str(b.locale), notes: str(b.notes),
  };
}

export function toCanned(r: DeskRecord): CannedReply {
  const b = r.body;
  return { id: r.id, name: str(b.name) ?? '', category: str(b.category), body: typeof b.body === 'string' ? b.body : '' };
}

export function toRule(r: DeskRecord): AutopilotRule {
  const b = r.body;
  return {
    id: r.id, version: r.version, updatedAt: r.updatedAt, intent: str(b.intent) ?? '',
    enabled: b.enabled === true, mode: oneOf(b.mode, ['shadow', 'live'], 'shadow'),
    minConfidence: num(b.min_confidence) ?? 0.9, disclose: b.disclose !== false,
  };
}
