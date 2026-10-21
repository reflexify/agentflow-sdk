import { describe, expect, it } from 'vitest';
import type { QueueTask } from '../../src/api/desk-api.js';
import { buildRows, folderTicketIds, nextClaimable, sortRows } from '../../src/queue/rows.js';
import type { Note, Reply, Ticket } from '../../src/model/types.js';

const task = (id: string, ticketId: string, over: Partial<QueueTask> = {}): QueueTask => ({
  id, entityId: 'e-wt', ticketId, nodeId: 'handle_normal', status: 'open', claimedByUserId: null, dueAt: null, createdAt: '2026-10-06T08:00:00Z', ...over,
});
const ticket = (id: string, over: Partial<Ticket> = {}): Ticket => ({
  id, version: 1, updatedAt: '2026-10-06T09:00:00Z', createdAt: '2026-10-06T08:00:00Z', number: id.toUpperCase(), subject: id,
  status: 'open', priority: 'normal', requesterId: null, requesterName: null, lastCustomerAt: null, pendingSince: null,
  firstRepliedAt: null, escalatedAt: null, possibleDuplicateOf: null, summary: null, intent: null, ...over,
});

describe('folderTicketIds', () => {
  const tasks = [task('t1', 'a', { status: 'claimed', claimedByUserId: 'me' }), task('t2', 'b'), task('t3', 'c', { status: 'claimed', claimedByUserId: 'me' })];
  const notes = [{ ticketId: 'x', createdAt: '2026-10-06T10:00:00Z' }, { ticketId: 'y', createdAt: '2026-10-06T11:00:00Z' }, { ticketId: 'x', createdAt: '2026-10-06T09:00:00Z' }] as Note[];
  const input = { meId: 'me', tasks, pending: [ticket('p')], open: [ticket('a'), ticket('o')], mentions: notes };
  it('reads each folder', () => {
    expect(folderTicketIds('mine', input)).toEqual(['a', 'c']);
    expect(folderTicketIds('unclaimed', input)).toEqual(['b']);
    expect(folderTicketIds('mentions', input)).toEqual(['y', 'x']);
    expect(folderTicketIds('waiting', input)).toEqual(['p']);
    expect(folderTicketIds('open', input)).toEqual(['a', 'o']);
  });
});

describe('buildRows and sortRows', () => {
  const tickets = new Map([
    ['a', ticket('a', { lastCustomerAt: '2026-10-06T10:00:00Z', updatedAt: '2026-10-06T09:00:00Z' })],
    ['b', ticket('b', { lastCustomerAt: '2026-10-06T07:00:00Z', updatedAt: '2026-10-06T11:00:00Z' })],
    ['c', ticket('c', { lastCustomerAt: null, updatedAt: '2026-10-06T10:00:00Z' })],
  ]);
  const tasks = [task('t1', 'a', { dueAt: '2026-10-06T12:00:00Z' }), task('t2', 'b', { dueAt: '2026-10-06T10:00:00Z' })];
  const drafts = [{ ticketId: 'a', key: 'draft:a', status: 'draft', autopilot: 'would_send' }] as Reply[];
  const held = [{ ticketId: 'b' }, { ticketId: 'b' }] as Reply[];
  const rows = buildRows(['a', 'b', 'c', 'missing'], { tickets, tasks, drafts, held });

  it('joins each ticket with its task, draft and held messages, and skips tickets not loaded yet', () => {
    expect(rows.map((r) => [r.ticket.id, r.task?.id ?? null, r.hasDraft, r.wouldSend, r.heldCount])).toEqual([
      ['a', 't1', true, true, 0], ['b', 't2', false, false, 2], ['c', null, false, false, 0],
    ]);
  });

  it('sorts by SLA (no deadline last), by longest wait, or by newest change', () => {
    expect(sortRows(rows, 'sla').map((r) => r.ticket.id)).toEqual(['b', 'a', 'c']);
    expect(sortRows(rows, 'waiting').map((r) => r.ticket.id)).toEqual(['b', 'a', 'c']);
    expect(sortRows(rows, 'newest').map((r) => r.ticket.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('deadlines written in different ways', () => {
  // As instants: c (07:30Z), then b (08:00:00Z), then a (08:00:00.5Z). As text they would come out a, b, c.
  const due = { a: '2026-10-06T08:00:00.500Z', b: '2026-10-06T08:00:00Z', c: '2026-10-06T14:30:00+07:00' };
  const tasks = Object.entries(due).map(([id, dueAt]) => task(`t-${id}`, id, { dueAt }));
  const tickets = new Map(Object.keys(due).map((id) => [id, ticket(id)]));

  it('sort and are claimed in order of the moment they fall due', () => {
    const rows = buildRows(['a', 'b', 'c'], { tickets, tasks, drafts: [], held: [] });
    expect(sortRows(rows, 'sla').map((r) => r.ticket.id)).toEqual(['c', 'b', 'a']);
    expect(nextClaimable(tasks)?.ticketId).toBe('c');
  });

  it('put the newest mention first by the moment too', () => {
    const mentions = [
      { ticketId: 'old', createdAt: '2026-10-06T08:00:00Z' },
      { ticketId: 'new', createdAt: '2026-10-06T08:00:00.250Z' },
    ] as Note[];
    expect(folderTicketIds('mentions', { meId: 'me', tasks: [], pending: [], open: [], mentions })).toEqual(['new', 'old']);
  });
});

describe('nextClaimable', () => {
  it('picks the open task due soonest', () => {
    expect(nextClaimable([
      task('late', 'a', { dueAt: '2026-10-06T15:00:00Z' }),
      task('mine', 'b', { dueAt: '2026-10-06T09:00:00Z', status: 'claimed', claimedByUserId: 'me' }),
      task('soon', 'c', { dueAt: '2026-10-06T12:00:00Z' }),
      task('none', 'd'),
    ])?.id).toBe('soon');
    expect(nextClaimable([])).toBeNull();
  });
});
