import { describe, expect, it } from 'vitest';
import { toNote, toReply, toTicket } from '../../src/model/records.js';
import type { DeskRecord } from '../../src/model/types.js';

const rec = (body: Record<string, unknown>, extra: Partial<DeskRecord> = {}): DeskRecord => ({
  id: 'r1', version: 3, updatedAt: '2026-10-06T10:00:00Z', createdAt: '2026-10-05T09:00:00Z', createdBy: null,
  body, refLabels: {}, fileLabels: {}, ...extra,
});

describe('record mappers', () => {
  it('reads a ticket, with the requester name from the reference labels', () => {
    const t = toTicket(rec(
      { number: 'TK-2026-0418', subject: 'Where is my order?', status: 'open', priority: 'high', requester: 'c1', summary: 'Late order.' },
      { refLabels: { requester: { c1: 'Ana Lima' } } },
    ));
    expect(t).toMatchObject({ number: 'TK-2026-0418', status: 'open', priority: 'high', requesterId: 'c1', requesterName: 'Ana Lima', summary: 'Late order.' });
    expect(t.lastCustomerAt).toBeNull();
  });

  it('defaults what a ticket may lack', () => {
    const t = toTicket(rec({ number: 'TK-1' }));
    expect(t).toMatchObject({ status: 'new', priority: 'normal', subject: '', requesterId: null, escalatedAt: null });
  });

  it('reads when a ticket was last escalated', () => {
    expect(toTicket(rec({ number: 'TK-1', escalated_at: '2026-10-06T08:00:00Z' })).escalatedAt).toBe('2026-10-06T08:00:00.000Z');
  });

  it('reads every datetime as UTC, whatever zone its writer rendered it in', () => {
    const t = toTicket(rec({
      number: 'TK-1', last_customer_at: '2026-10-06T17:51:00+07:00', pending_since: '2026-10-06T10:51:00Z',
      first_replied_at: '2026-10-06T05:51:00-05:00', escalated_at: '2026-10-06T17:51:00.123456+07:00',
    }));
    expect(t).toMatchObject({
      lastCustomerAt: '2026-10-06T10:51:00.000Z', pendingSince: '2026-10-06T10:51:00.000Z',
      firstRepliedAt: '2026-10-06T10:51:00.000Z', escalatedAt: '2026-10-06T10:51:00.123Z',
    });
    expect(toReply(rec({ ticket: 't1', posted_at: '2026-10-06T17:51:00+07:00' })).postedAt).toBe('2026-10-06T10:51:00.000Z');
  });

  it('keeps a datetime that is not one empty, and posts such a reply when it was created', () => {
    expect(toTicket(rec({ number: 'TK-1', last_customer_at: 'yesterday' })).lastCustomerAt).toBeNull();
    expect(toReply(rec({ ticket: 't1', posted_at: 'soon' })).postedAt).toBe('2026-10-05T09:00:00Z');
  });

  it('leaves the version stamp as the API wrote it, because a save must send it back exactly', () => {
    const stamp = '2026-10-06T10:00:00.123456Z';
    expect(toTicket(rec({ number: 'TK-1' }, { updatedAt: stamp })).updatedAt).toBe(stamp);
    expect(toReply(rec({ ticket: 't1' }, { updatedAt: stamp })).updatedAt).toBe(stamp);
  });

  it('reads a reply: files by label, citations from JSON text, held reason', () => {
    const r = toReply(rec(
      {
        ticket: 't1', posted_at: '2026-10-06T10:51:00Z', author_kind: 'unverified', status: 'received', body: 'hi',
        key: '<m@x>', attachments: ['a1'], citations: '[{"title":"Shipping","source_id":"k1"}]',
        held_reason: 'not_a_participant', matched_by: 'subject_token', autopilot: 'none',
      },
      { fileLabels: { attachments: { a1: 'receipt.pdf' } } },
    ));
    expect(r.attachments).toEqual([{ id: 'a1', name: 'receipt.pdf' }]);
    expect(r.citations).toEqual([{ title: 'Shipping', sourceId: 'k1' }]);
    expect(r.heldReason).toBe('not_a_participant');
    expect(r.matchedBy).toBe('subject_token');
  });

  it('survives citations that are not JSON', () => {
    expect(toReply(rec({ ticket: 't1', citations: 'not json' })).citations).toEqual([]);
  });

  it('reads note mentions from the comma-separated ids', () => {
    expect(toNote(rec({ ticket: 't1', kind: 'staff', body: '@Bo', mentions: 'u1, u2,' })).mentions).toEqual(['u1', 'u2']);
  });
});
