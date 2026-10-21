export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'new' | 'open' | 'pending' | 'solved' | 'closed';
export type AuthorKind = 'customer' | 'unverified' | 'agent' | 'bot';
export type ReplyStatus = 'draft' | 'sending' | 'sent' | 'failed' | 'received';
export type NoteKind = 'staff' | 'ai_summary' | 'held_message' | 'system' | 'event';
export type HeldReason = 'not_a_participant' | 'dmarc_failed' | 'our_address';
export type MatchedBy = 'our_message' | 'their_message' | 'plus_tag' | 'subject_token';

/** One record as the published API returns it, reduced to what the desk reads. */
export interface DeskRecord {
  id: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  createdBy: string | null;
  body: Record<string, unknown>;
  /** `{field: {recordId: label}}`; for a Users reference the label is the person's name. */
  refLabels: Record<string, Record<string, string | null>>;
  /** `{field: {attachmentId: filename}}`. */
  fileLabels: Record<string, Record<string, string | null>>;
}

export interface FileRef { id: string; name: string }
export interface Citation { title: string; sourceId: string }

export interface Ticket {
  id: string; version: number; updatedAt: string; createdAt: string;
  number: string; subject: string; status: TicketStatus; priority: Priority;
  requesterId: string | null; requesterName: string | null;
  lastCustomerAt: string | null; pendingSince: string | null; firstRepliedAt: string | null;
  escalatedAt: string | null;
  possibleDuplicateOf: string | null; summary: string | null; intent: string | null;
}

export interface Reply {
  id: string; version: number; updatedAt: string; createdAt: string;
  ticketId: string; postedAt: string; authorKind: AuthorKind;
  authorUserId: string | null; authorUserName: string | null;
  status: ReplyStatus; body: string; attachments: FileRef[]; key: string;
  subject: string | null; fromAddress: string | null; to: string | null; cc: string | null;
  outboundId: string | null; providerId: string | null;
  aiBody: string | null; citations: Citation[]; autopilot: 'none' | 'would_send' | 'sent';
  intent: string | null; intentConfidence: number | null; aiUnchanged: boolean | null;
  heldReason: HeldReason | null; matchedBy: MatchedBy | null;
}

export interface Note {
  id: string; version: number; updatedAt: string; createdAt: string;
  ticketId: string; authorUserId: string | null; authorUserName: string | null;
  kind: NoteKind; body: string; mentions: string[];
}

export interface Contact {
  id: string; version: number; updatedAt: string; createdAt: string;
  email: string; name: string | null; organization: string | null; locale: string | null; notes: string | null;
}

export interface CannedReply { id: string; name: string; category: string | null; body: string }

export interface AutopilotRule {
  id: string; version: number; updatedAt: string;
  intent: string; enabled: boolean; mode: 'shadow' | 'live'; minConfidence: number; disclose: boolean;
}

export interface Person { id: string; displayName: string; email: string | null }
