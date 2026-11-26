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
  /** The stored row at `segment` ends a park, as the server marks it: the step waits on a tool and goes on later. */
  parked: boolean;
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
  | { type: 'logged'; row: LoggedMessage }
  | { type: 'reply'; event: ReplyEvent }
  | { type: 'typing'; until: number | null }
  | { type: 'reconnected' }
  | { type: 'reset' };

export const EMPTY_CONVERSATION: Conversation = { rows: [], pending: [], typingUntil: null, replies: [] };

const PENDING_STATE = { posted: 'sent', failed: 'failed', retry: 'sending' } as const;

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

function onReply(c: Conversation, event: ReplyEvent): Conversation {
  const { stream_id: streamId, segment } = event;
  const reply = c.replies.find((r) => r.streamId === streamId);
  const put = (next: Reply | null) => withReply(c, streamId, next);
  const parked = reply?.shown === 'live' && reply.parked;
  switch (event.kind) {
    case 'started': {
      if (reply && segment < reply.segment) return c;
      const top = highestStored(c.rows, streamId);
      if (segment < top) return c;
      // A start of a segment the log holds is a replay: only a park keeps its label under the row.
      if (segment === top) return parked && reply.segment === segment ? put({ ...reply, label: event.label }) : c;
      if (parked) return put({ ...reply, label: event.label, resumedSegment: segment });
      const afterPosition = reply?.segment === segment ? reply.afterPosition : lastPosition(c);
      return put({ streamId, segment, afterPosition, label: event.label, text: '', done: false, shown: 'live', parked: false, resumedSegment: null });
    }
    case 'activity':
      if (!reply || ![reply.segment, reply.resumedSegment].includes(segment) || reply.done || reply.shown !== 'live') return c;
      return put({ ...reply, label: event.label });
    case 'delta':
      if (reply?.shown === 'live' && reply.resumedSegment === segment) {
        return put({ ...reply, segment, afterPosition: lastPosition(c), text: event.text, parked: false, resumedSegment: null });
      }
      if (!reply || reply.segment !== segment || reply.done || reply.parked || reply.shown !== 'live') return c;
      return put({ ...reply, text: reply.text + event.text });
    case 'done':
      if (parked) return segment >= reply.segment ? put(null) : c;
      if (!reply || reply.segment !== segment || reply.shown !== 'live') return c;
      return put(reply.text === '' ? null : { ...reply, done: true });
    case 'abandoned':
      if (parked) return put({ ...reply, shown: 'restUnsent', label: null, resumedSegment: null });
      if (!reply || reply.shown !== 'live') return c;
      return put(reply.done ? { ...reply, shown: 'unsent' } : null);
  }
}

function onStoredRow(c: Conversation, row: LoggedMessage): Conversation {
  const { stream_id: streamId, stream_segment: segment } = row;
  if (streamId === undefined || segment === undefined) return c;
  const reply = c.replies.find((r) => r.streamId === streamId);
  if (reply && segment < reply.segment) return c;
  if (!row.stream_parked) return withReply(c, streamId, null);
  const label = reply?.shown === 'live' ? reply.label : null;
  return withReply(c, streamId, { streamId, segment, afterPosition: row.position, label, text: '', done: false, shown: 'live', parked: true, resumedSegment: null });
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
      return onStoredRow(next, row);
    }
    case 'reply':
      return onReply(c, action.event);
    case 'typing':
      return c.typingUntil === action.until ? c : { ...c, typingUntil: action.until };
    case 'reconnected':
      return { ...c, replies: c.replies.filter((r) => r.shown !== 'live' || r.done || r.parked) };
    case 'reset':
      return { rows: [], pending: c.pending.filter((p) => p.state !== 'sent'), typingUntil: null, replies: [] };
  }
}

export function lastPosition(c: Conversation): number {
  return c.rows.length === 0 ? 0 : c.rows[c.rows.length - 1]!.position;
}
