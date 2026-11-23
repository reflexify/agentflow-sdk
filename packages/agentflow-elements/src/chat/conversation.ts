import type { LoggedMessage, ReplyEvent } from './transport.js';

export type PendingState = 'sending' | 'sent' | 'failed';

export interface Pending {
  clientId: string;
  text: string;
  state: PendingState;
}

export interface Reply {
  streamId: string;
  segment: number;
  afterPosition: number;
  label: string | null;
  text: string;
  done: boolean;
  shown: 'live' | 'unsent' | 'restUnsent';
  parkedSince: number | null;
  resumedSegment: number | null;
}

export interface Conversation {
  rows: LoggedMessage[];
  pending: Pending[];
  typingUntil: number | null;
  replies: Reply[];
}

export type ConversationAction =
  | { type: 'write'; clientId: string; text: string }
  | { type: 'posted' | 'failed' | 'retry'; clientId: string }
  | { type: 'logged'; row: LoggedMessage; now: number }
  | { type: 'reply'; event: ReplyEvent; now: number }
  | { type: 'typing'; until: number | null }
  | { type: 'reconnected' }
  | { type: 'reset' };

export const EMPTY_CONVERSATION: Conversation = { rows: [], pending: [], typingUntil: null, replies: [] };

const PENDING_STATE = { posted: 'sent', failed: 'failed', retry: 'sending' } as const;

// The stream marks no park: a stored row with no `reply.done` reads as one only after this long, since on the Postgres
// bus the Message step's row can beat the `reply.done` behind it by a few hundred milliseconds.
export const PARKED_LINE_MS = 1_000;

export const lineShows = (reply: Reply, now: number) => reply.parkedSince !== null && now - reply.parkedSince >= PARKED_LINE_MS;

export function storedRow(rows: readonly LoggedMessage[], streamId: string, segment: number): LoggedMessage | undefined {
  return rows.find((r) => r.stream_id === streamId && r.stream_segment === segment);
}

function highestStored(rows: readonly LoggedMessage[], streamId: string): number {
  return rows.reduce((top, r) => (r.stream_id === streamId && r.stream_segment !== undefined ? Math.max(top, r.stream_segment) : top), -1);
}

function withReply(c: Conversation, streamId: string, next: Reply | null): Conversation {
  if (!next) return { ...c, replies: c.replies.filter((r) => r.streamId !== streamId) };
  const known = c.replies.some((r) => r.streamId === streamId);
  return { ...c, replies: known ? c.replies.map((r) => (r.streamId === streamId ? next : r)) : [...c.replies, next] };
}

function onReply(c: Conversation, event: ReplyEvent, now: number): Conversation {
  const { stream_id: streamId, segment } = event;
  const reply = c.replies.find((r) => r.streamId === streamId);
  const put = (next: Reply | null) => withReply(c, streamId, next);
  switch (event.kind) {
    case 'started': {
      if (reply && segment < reply.segment) return c;
      const top = highestStored(c.rows, streamId);
      if (segment < top) return c;
      const parked = reply?.shown === 'live' && reply.parkedSince !== null;
      if (parked && segment > reply.segment) return put({ ...reply, label: event.label, resumedSegment: segment });
      const parkedSince = segment !== top ? null : parked && reply.segment === segment ? reply.parkedSince : now;
      const afterPosition = reply?.segment === segment ? reply.afterPosition : lastPosition(c);
      return put({ streamId, segment, afterPosition, label: event.label, text: '', done: false, shown: 'live', parkedSince, resumedSegment: null });
    }
    case 'activity':
      if (!reply || ![reply.segment, reply.resumedSegment].includes(segment) || reply.done || reply.shown !== 'live') return c;
      return put({ ...reply, label: event.label });
    case 'delta':
      if (reply?.shown === 'live' && reply.resumedSegment === segment) {
        return put({ ...reply, segment, afterPosition: lastPosition(c), text: event.text, parkedSince: null, resumedSegment: null });
      }
      if (!reply || reply.segment !== segment || reply.done || reply.shown !== 'live') return c;
      return put({ ...reply, text: reply.text + event.text });
    case 'done':
      if (!reply || ![reply.segment, reply.resumedSegment].includes(segment) || reply.shown !== 'live') return c;
      return put(reply.text === '' || storedRow(c.rows, streamId, segment) ? null : { ...reply, done: true });
    case 'abandoned':
      if (!reply || reply.shown !== 'live') return c;
      if (storedRow(c.rows, streamId, reply.segment)) {
        if (!lineShows(reply, now)) return put(null);
        return put({ ...reply, shown: 'restUnsent', label: null, parkedSince: null, resumedSegment: null });
      }
      return put(reply.done ? { ...reply, shown: 'unsent' } : null);
  }
}

function onStoredRow(c: Conversation, row: LoggedMessage, now: number): Conversation {
  if (row.stream_id === undefined || row.stream_segment === undefined) return c;
  const reply = c.replies.find((r) => r.streamId === row.stream_id);
  if (!reply || row.stream_segment < reply.segment) return c;
  const unfinished = [reply.segment, reply.resumedSegment].includes(row.stream_segment) && reply.shown === 'live' && !reply.done;
  return withReply(c, reply.streamId, unfinished ? { ...reply, segment: row.stream_segment, text: '', parkedSince: now, resumedSegment: null } : null);
}

export function reduce(c: Conversation, action: ConversationAction): Conversation {
  switch (action.type) {
    case 'write':
      return { ...c, pending: [...c.pending, { clientId: action.clientId, text: action.text, state: 'sending' }] };
    case 'posted':
    case 'failed':
    case 'retry': {
      const state = PENDING_STATE[action.type];
      if (!c.pending.some((p) => p.clientId === action.clientId && p.state !== state)) return c;
      return { ...c, pending: c.pending.map((p) => (p.clientId === action.clientId ? { ...p, state } : p)) };
    }
    case 'logged': {
      const { row } = action;
      if (c.rows.some((r) => r.position === row.position)) return c;
      let at = c.rows.length;
      while (at > 0 && c.rows[at - 1]!.position > row.position) at--;
      const next = {
        ...c,
        rows: [...c.rows.slice(0, at), row, ...c.rows.slice(at)],
        pending: row.client_message_id === null ? c.pending : c.pending.filter((p) => p.clientId !== row.client_message_id),
      };
      return onStoredRow(next, row, action.now);
    }
    case 'reply':
      return onReply(c, action.event, action.now);
    case 'typing':
      return c.typingUntil === action.until ? c : { ...c, typingUntil: action.until };
    case 'reconnected':
      return { ...c, replies: c.replies.filter((r) => r.shown !== 'live' || r.done) };
    case 'reset':
      return { rows: [], pending: c.pending.filter((p) => p.state !== 'sent'), typingUntil: null, replies: [] };
  }
}

export function lastPosition(c: Conversation): number {
  return c.rows.length === 0 ? 0 : c.rows[c.rows.length - 1]!.position;
}
