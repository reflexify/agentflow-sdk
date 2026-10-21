import { describe, expect, it } from 'vitest';
import { authorship, draftOf, newestCustomerAt, splitQuoted, threadItems } from '../../src/model/thread.js';
import type { Note, Reply } from '../../src/model/types.js';

const reply = (over: Partial<Reply>): Reply => ({
  id: 'r', version: 1, updatedAt: '', createdAt: '', ticketId: 't1', postedAt: '2026-10-06T10:00:00Z',
  authorKind: 'customer', authorUserId: null, authorUserName: null, status: 'received', body: 'x', attachments: [],
  key: '<k>', subject: null, fromAddress: null, to: null, cc: null, outboundId: null, providerId: null, aiBody: null,
  citations: [], autopilot: 'none', intent: null, intentConfidence: null, aiUnchanged: null, heldReason: null, matchedBy: null,
  ...over,
});
const note = (over: Partial<Note>): Note => ({
  id: 'n', version: 1, updatedAt: '', createdAt: '2026-10-06T10:30:00Z', ticketId: 't1', authorUserId: null,
  authorUserName: null, kind: 'staff', body: 'n', mentions: [], ...over,
});

describe('threadItems', () => {
  it('merges replies and notes by time, leaves the draft out, and tells the kinds apart', () => {
    const items = threadItems(
      [
        reply({ id: 'c1', postedAt: '2026-10-06T09:00:00Z' }),
        reply({ id: 'd', status: 'draft', authorKind: 'bot', key: 'draft:t1', postedAt: '2026-10-06T11:00:00Z' }),
        reply({ id: 'o1', authorKind: 'agent', status: 'sent', postedAt: '2026-10-06T10:00:00Z' }),
        reply({ id: 'h1', authorKind: 'unverified', postedAt: '2026-10-06T10:40:00Z' }),
      ],
      [note({ id: 'n1' }), note({ id: 'e1', kind: 'event', createdAt: '2026-10-06T10:35:00Z' })],
    );
    expect(items.map((i) => [i.kind, i.id])).toEqual([
      ['customer', 'c1'], ['ours', 'o1'], ['note', 'n1'], ['event', 'e1'], ['held', 'h1'],
    ]);
  });

  it('orders by the instant, not the text: a reply stamped in the org\'s zone sits among the UTC notes', () => {
    // 10:00Z, 10:30Z and 11:00Z. By text the +07:00 stamps would sort after the note.
    const items = threadItems(
      [
        reply({ id: 'o1', authorKind: 'agent', status: 'sent', postedAt: '2026-10-06T18:00:00+07:00' }),
        reply({ id: 'c1', postedAt: '2026-10-06T17:00:00+07:00' }),
      ],
      [note({ id: 'n1', createdAt: '2026-10-06T10:30:00Z' })],
    );
    expect(items.map((i) => i.id)).toEqual(['c1', 'n1', 'o1']);
  });

  it('breaks equal times by id so the order is stable', () => {
    const items = threadItems([reply({ id: 'b' }), reply({ id: 'a' })], []);
    expect(items.map((i) => i.id)).toEqual(['a', 'b']);
  });
});

describe('authorship', () => {
  it('names autopilot, unchanged and edited AI drafts', () => {
    expect(authorship(reply({ authorKind: 'bot', autopilot: 'sent', status: 'sent' }))).toBe('autopilot');
    expect(authorship(reply({ authorKind: 'agent', status: 'sent', aiBody: 'hi', aiUnchanged: true }))).toBe('ai_unchanged');
    expect(authorship(reply({ authorKind: 'agent', status: 'sent', aiBody: 'hi', aiUnchanged: false }))).toBe('ai_edited');
    expect(authorship(reply({ authorKind: 'agent', status: 'sent', aiBody: null }))).toBeNull();
  });
});

describe('splitQuoted', () => {
  it('splits at the first quote line or "On … wrote:"', () => {
    expect(splitQuoted('Thanks!\n\nOn Mon, Bo wrote:\n> hi')).toEqual({ visible: 'Thanks!', quoted: 'On Mon, Bo wrote:\n> hi' });
    expect(splitQuoted('a\n> b\n> c')).toEqual({ visible: 'a', quoted: '> b\n> c' });
    expect(splitQuoted('no quote')).toEqual({ visible: 'no quote', quoted: null });
  });
  it('keeps a long quoted chain out of the visible part', () => {
    const chain = Array.from({ length: 5000 }, (_, i) => `> line ${i}`).join('\n');
    const { visible, quoted } = splitQuoted(`New text\n${chain}`);
    expect(visible).toBe('New text');
    expect(quoted?.split('\n')).toHaveLength(5000);
  });
});

describe('newest customer message and the draft', () => {
  it('finds the newest accepted customer message, ignoring held ones', () => {
    const replies = [
      reply({ id: 'a', postedAt: '2026-10-06T09:00:00Z' }),
      reply({ id: 'h', authorKind: 'unverified', postedAt: '2026-10-06T12:00:00Z' }),
      reply({ id: 'b', postedAt: '2026-10-06T10:51:00Z' }),
    ];
    expect(newestCustomerAt(replies)).toBe('2026-10-06T10:51:00Z');
  });
  it('compares instants, so a later message in another zone is the newest', () => {
    const replies = [
      reply({ id: 'a', postedAt: '2026-10-06T10:30:00Z' }),
      reply({ id: 'b', postedAt: '2026-10-06T17:20:00+07:00' }), // 10:20Z: earlier, though its text sorts later
    ];
    expect(newestCustomerAt(replies)).toBe('2026-10-06T10:30:00Z');
  });
  it('finds the ticket draft by its key', () => {
    expect(draftOf([reply({ id: 'd', status: 'draft', key: 'draft:t1' })], 't1')?.id).toBe('d');
    expect(draftOf([reply({ id: 'd', status: 'sent', key: 'outbound:1' })], 't1')).toBeNull();
  });
});
