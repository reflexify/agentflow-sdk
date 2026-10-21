import type { PublicEvent } from '@reflexify/agentflow-sdk';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import type { DeskIds } from '../../shared/contract.js';
import { keys } from '../../src/data/keys.js';
import { applyChange, changesOf } from '../../src/data/live-events.js';

function seeded() {
  const qc = new QueryClient();
  for (const key of [keys.tasks, keys.ticket('k1'), keys.tickets(['new', 'open']), keys.thread('k1'), keys.thread('k2'),
    keys.drafts, keys.held, keys.mentions('u1'), keys.contact('c1'), keys.canned, keys.rules, keys.ticketCount(['pending'])]) {
    qc.setQueryData(key, []);
  }
  return qc;
}
const stale = (qc: QueryClient, key: readonly unknown[]) => qc.getQueryState(key)?.isInvalidated ?? false;

describe('applyChange', () => {
  it('refreshes a ticket wherever it shows', () => {
    const qc = seeded();
    applyChange(qc, { t: 'changed', ticket: 'k1', entity: 'ticket', id: 'k1' });
    expect([stale(qc, keys.ticket('k1')), stale(qc, keys.tickets(['new', 'open'])), stale(qc, keys.ticketCount(['pending']))]).toEqual([true, true, true]);
    expect(stale(qc, keys.thread('k1'))).toBe(false);
  });

  it('refreshes one thread, the drafts and the held list for a reply', () => {
    const qc = seeded();
    applyChange(qc, { t: 'changed', ticket: 'k1', entity: 'reply', id: 'r1' });
    expect([stale(qc, keys.thread('k1')), stale(qc, keys.drafts), stale(qc, keys.held)]).toEqual([true, true, true]);
    expect(stale(qc, keys.thread('k2'))).toBe(false);
  });

  it('refreshes every thread when it cannot tell which ticket a reply belongs to', () => {
    const qc = seeded();
    applyChange(qc, { t: 'changed', ticket: null, entity: 'reply', id: 'r9' });
    expect([stale(qc, keys.thread('k1')), stale(qc, keys.thread('k2'))]).toEqual([true, true]);
  });

  it('refreshes the thread and mentions for a note, and the queue for a task', () => {
    const qc = seeded();
    applyChange(qc, { t: 'changed', ticket: 'k1', entity: 'note', id: 'n1' });
    expect([stale(qc, keys.thread('k1')), stale(qc, keys.mentions('u1'))]).toEqual([true, true]);
    applyChange(qc, { t: 'queue' });
    expect(stale(qc, keys.tasks)).toBe(true);
  });
});

const IDS: DeskIds = {
  entities: { ticket: 'e-ticket', reply: 'e-reply', note: 'e-note', contact: 'e-contact', canned_reply: 'e-canned', autopilot_rule: 'e-rule' },
  workflows: { handling: 'w1', draft_reply: 'w2', send_reply: 'w3', accept_message: 'w4', move_message: 'w5' },
  supportGroupId: 'g',
};
const event = (type: string, subject: PublicEvent['subject']): PublicEvent => ({
  id: 'ev', type, occurred_at: '2026-10-08T10:00:00Z', org_id: 'o', position: 1, subject,
});

describe('changesOf', () => {
  it('refreshes a ticket wherever it shows, and the queue with it', () => {
    expect(changesOf(event('record.updated', { kind: 'record', id: 'k1', entity_id: 'e-ticket' }), IDS)).toEqual([
      { t: 'changed', ticket: 'k1', entity: 'ticket', id: 'k1' },
      { t: 'queue' },
    ]);
  });

  it('refreshes every thread for a reply or a note, since an event does not say whose ticket it is', () => {
    expect(changesOf(event('record.created', { kind: 'record', id: 'r1', entity_id: 'e-reply' }), IDS))
      .toEqual([{ t: 'changed', ticket: null, entity: 'reply', id: 'r1' }]);
    expect(changesOf(event('record.deleted', { kind: 'record', id: 'n1', entity_id: 'e-note' }), IDS))
      .toEqual([{ t: 'changed', ticket: null, entity: 'note', id: 'n1' }]);
  });

  it('refreshes saved replies and autopilot rules, which a person\'s own stream carries', () => {
    expect(changesOf(event('record.updated', { kind: 'record', id: 's1', entity_id: 'e-canned' }), IDS))
      .toEqual([{ t: 'changed', ticket: null, entity: 'canned_reply', id: 's1' }]);
    expect(changesOf(event('record.updated', { kind: 'record', id: 'a1', entity_id: 'e-rule' }), IDS))
      .toEqual([{ t: 'changed', ticket: null, entity: 'autopilot_rule', id: 'a1' }]);
  });

  it('refreshes the queue for a Handling task\'s record and work events', () => {
    const handling = IDS.workflows.handling;
    expect(changesOf(event('work.claimed', { kind: 'work', id: 't1', entity_id: 'e-wt', workflow_id: handling }), IDS)).toEqual([{ t: 'queue' }]);
    expect(changesOf(event('record.created', { kind: 'record', id: 't1', entity_id: 'e-wt', workflow_id: handling }), IDS)).toEqual([{ t: 'queue' }]);
    expect(changesOf(event('work.claimed', { kind: 'work', id: 'x', entity_id: 'e-wt', workflow_id: 'another' }), IDS)).toEqual([]);
  });

  it('ignores another app\'s records, a record event that names no entity, and anything else', () => {
    expect(changesOf(event('record.updated', { kind: 'record', id: 'x', entity_id: 'someone-elses' }), IDS)).toEqual([]);
    expect(changesOf(event('record.updated', { kind: 'record', id: 'x' }), IDS)).toEqual([]);
    expect(changesOf(event('instance.completed', { kind: 'instance', id: 'i1' }), IDS)).toEqual([]);
  });
});
