import { describe, expect, it } from 'vitest';
import { isDeskError, type RunResult } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import type { Change } from '../../src/api/memory-server.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { withDraftText } from '../../src/model/text-tools.js';
import { draftOf, newestCustomerAt, threadItems } from '../../src/model/thread.js';

const NOW = new Date('2026-10-06T11:12:00Z');
const desk = (opts: Parameters<typeof createFakeDesk>[0] = {}) => createFakeDesk({ now: NOW, ...opts });
type Desk = ReturnType<typeof desk>;

async function ticketByNumber(api: Desk['api'], number: string) {
  const all = await api.tickets({ status: ['new', 'open', 'pending', 'solved', 'closed'] });
  const t = all.find((x) => x.number === number);
  if (!t) throw new Error(`no ${number}`);
  return t;
}

/** Starts a workflow the way the desk does, lets the worker finish it, and reads how it ended. */
async function ran(
  { api, server }: Desk, workflow: Parameters<Desk['api']['start']>[0], subjectId: string, params: Record<string, unknown> = {},
): Promise<Extract<RunResult, { state: 'done' }>> {
  const started = await api.start(workflow, subjectId, params, 8000);
  expect(started.state).toBe('running');
  await server.settle();
  const result = await api.run(started.runId);
  if (result.state !== 'done') throw new Error('the run is still going after settle()');
  return result;
}

describe('drafts', () => {
  it('refuses a save against a version someone else already replaced, and names who did', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const draft = draftOf((await api.thread(t.id)).replies, t.id)!;
    server.actAs(DEMO_PEOPLE.ha);
    await api.saveDraft(draft, { body: 'Hà was here' }, DEMO_PEOPLE.ha);
    server.actAs(DEMO_PEOPLE.bo);
    const error = await api.saveDraft(draft, { body: 'Bo too' }, DEMO_PEOPLE.bo).catch((e) => e);
    expect(isDeskError(error, 'stale')).toBe(true);
    const now = await api.reply(draft.id);
    expect(now).toMatchObject({ body: 'Hà was here', authorUserId: DEMO_PEOPLE.ha, authorUserName: 'Hà Nguyễn' });
  });

  it('keeps one draft per ticket', async () => {
    const { api } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const error = await api.createDraft({ ticketId: t.id, body: 'x', authorUserId: DEMO_PEOPLE.bo }).catch((e) => e);
    expect(isDeskError(error, 'conflict')).toBe(true);
    expect(error.code).toBe('ENTITY_NATURAL_KEY_CONFLICT');
  });
});

describe('sending', () => {
  it('sends the version the person saw, and skips a changed or already-sent draft as "changed"', async () => {
    const d = desk();
    const { api } = d;
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const draft = draftOf((await api.thread(t.id)).replies, t.id)!;
    const changed = await api.saveDraft(draft, { body: draft.body + ' Thanks!' }, DEMO_PEOPLE.bo);
    expect(await ran(d, 'send_reply', draft.id, { version: draft.version }))
      .toMatchObject({ status: 'completed', output: { status: 'skipped', skip_reason: 'changed' } });
    expect(await ran(d, 'send_reply', draft.id, { version: changed.version }))
      .toMatchObject({ status: 'completed', output: { status: 'sent' } });
    const sent = await api.reply(draft.id);
    expect(sent).toMatchObject({ status: 'sent', authorKind: 'agent', authorUserId: DEMO_PEOPLE.bo, aiUnchanged: false });
    expect(await ran(d, 'send_reply', draft.id, { version: sent.version }))
      .toMatchObject({ output: { status: 'skipped', skip_reason: 'changed', outbound_id: '' } });
  });

  it('records the answer on the ticket', async () => {
    const d = desk();
    const t = await ticketByNumber(d.api, 'TK-2026-0431');
    const draft = draftOf((await d.api.thread(t.id)).replies, t.id)!;
    const result = await ran(d, 'send_reply', draft.id, { version: draft.version });
    const after = d.server.records('ticket').find((r) => r.id === t.id)!;
    expect(after.body).toMatchObject({ pending_token: `outbound:${result.output.outbound_id}`, first_replied_at: NOW.toISOString() });
  });

  it('answers running at once: nothing is sent until a worker has run it', async () => {
    const d = desk({ atomicDelayMs: 60_000 });
    const t = await ticketByNumber(d.api, 'TK-2026-0418');
    const draft = draftOf((await d.api.thread(t.id)).replies, t.id)!;
    const started = await d.api.start('send_reply', draft.id, { version: draft.version }, 8000);
    expect(started).toMatchObject({ state: 'running' });
    expect((await d.api.reply(draft.id)).status).toBe('draft');
    expect(await d.api.run(started.runId)).toEqual({ state: 'running', runId: started.runId });
    await d.server.settle();
    expect(await d.api.run(started.runId)).toMatchObject({ state: 'done', status: 'completed', output: { status: 'sent' } });
    expect((await d.api.reply(draft.id)).status).toBe('sent');
  });

  it('finishes on its own a macrotask later, which a poll sees', async () => {
    const { api } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const draft = draftOf((await api.thread(t.id)).replies, t.id)!;
    const started = await api.start('send_reply', draft.id, { version: draft.version }, 8000);
    if (started.state !== 'running') throw new Error('expected running');
    expect(await api.waitForRun(started.runId, { timeoutMs: 2_000, intervalMs: 5 }))
      .toMatchObject({ state: 'done', output: { status: 'sent' } });
  });

  it('refuses to start on a record the workflow is not about, as the real start route does', async () => {
    const d = desk();
    const t = await ticketByNumber(d.api, 'TK-2026-0418');
    const draft = draftOf((await d.api.thread(t.id)).replies, t.id)!;
    const refusals = await Promise.all([
      d.api.start('send_reply', 'no-such-draft', { version: 1 }, 8000).catch((e) => e),
      d.api.start('send_reply', t.id, { version: 1 }, 8000).catch((e) => e), // a ticket, not a reply
      d.api.start('accept_message', t.id, {}, 5000).catch((e) => e),
      d.api.start('move_message', 'nobody', {}, 5000).catch((e) => e),
      d.api.start('draft_reply', draft.id, {}, null).catch((e) => e), // a reply, not a ticket
    ]);
    for (const error of refusals) {
      expect(isDeskError(error, 'invalid')).toBe(true);
      expect(error.code).toBe('SUBJECT_BINDING_MISMATCH');
    }
    expect(d.server.runs()).toEqual([]);
  });

  it('fails the run of a draft deleted while it was being sent, with a message and no output', async () => {
    const d = desk({ atomicDelayMs: 60_000 });
    const t = await ticketByNumber(d.api, 'TK-2026-0418');
    const draft = draftOf((await d.api.thread(t.id)).replies, t.id)!;
    const started = await d.api.start('send_reply', draft.id, { version: draft.version }, 8000);
    d.server.remove('reply', draft.id);
    await d.server.settle();
    const result = await d.api.run(started.runId);
    expect(result).toMatchObject({ state: 'done', status: 'failed', output: {}, outcome: null });
    expect(result.state === 'done' && result.error).toMatch(/not found/);
  });

  it('sends nothing for a draft someone changed after the send started', async () => {
    const d = desk({ atomicDelayMs: 60_000 });
    const t = await ticketByNumber(d.api, 'TK-2026-0418');
    const draft = draftOf((await d.api.thread(t.id)).replies, t.id)!;
    const started = await d.api.start('send_reply', draft.id, { version: draft.version }, 8000);
    d.server.write('reply', draft.id, { body: 'Hà rewrote it', author_user: DEMO_PEOPLE.ha });
    await d.server.settle();
    expect(await d.api.run(started.runId)).toMatchObject({ output: { status: 'skipped', skip_reason: 'changed' } });
    expect(await d.api.reply(draft.id)).toMatchObject({ status: 'draft', body: 'Hà rewrote it' });
  });
});

describe('tasks', () => {
  it('lets one person claim, refuses a second, and marks waiting with an event note by the person', async () => {
    const { api, server } = desk();
    const open = (await api.handlingTasks()).find((x) => x.status === 'open')!;
    await api.claim(open);
    server.actAs(DEMO_PEOPLE.ha);
    expect(isDeskError(await api.claim(open).catch((e) => e), 'conflict')).toBe(true);
    server.actAs(DEMO_PEOPLE.bo);
    await api.submit(open, 'waiting', DEMO_PEOPLE.bo);
    expect((await api.ticket(open.ticketId)).status).toBe('pending');
    const { notes } = await api.thread(open.ticketId);
    expect(notes.at(-1)).toMatchObject({ kind: 'event', body: 'Marked waiting on customer', authorUserId: DEMO_PEOPLE.bo });
    expect((await api.handlingTasks()).some((x) => x.id === open.id)).toBe(false);
  });

  it('escalates by raising the priority, stamping the escalation, and opening a task in the next pool', async () => {
    const { api } = desk();
    const mine = (await api.handlingTasks()).find((x) => x.claimedByUserId === DEMO_PEOPLE.bo && x.nodeId === 'handle_high')!;
    await api.submit(mine, 'escalate', DEMO_PEOPLE.bo);
    const ticket = await api.ticket(mine.ticketId);
    expect(ticket).toMatchObject({ priority: 'urgent', escalatedAt: NOW.toISOString() });
    expect((await api.thread(mine.ticketId)).notes.at(-1)).toMatchObject({ kind: 'event', body: 'Escalated: priority raised to urgent' });
    expect((await api.handlingTasks()).find((x) => x.ticketId === mine.ticketId)).toMatchObject({ nodeId: 'handle_urgent', status: 'open' });
  });

  it('escalates an urgent ticket by reopening it in the urgent pool, its priority unchanged', async () => {
    const { api } = desk();
    const mine = (await api.handlingTasks()).find((x) => x.claimedByUserId === DEMO_PEOPLE.bo && x.nodeId === 'handle_urgent')!;
    await api.submit(mine, 'escalate', DEMO_PEOPLE.bo);
    expect(await api.ticket(mine.ticketId)).toMatchObject({ priority: 'urgent', escalatedAt: NOW.toISOString() });
    expect((await api.thread(mine.ticketId)).notes.at(-1)).toMatchObject({
      kind: 'event', body: 'Escalated: already urgent, reopened in the urgent pool', authorUserId: DEMO_PEOPLE.bo,
    });
    expect((await api.handlingTasks()).find((x) => x.ticketId === mine.ticketId)).toMatchObject({ nodeId: 'handle_urgent', status: 'open' });
  });

  it('opens a Handle task for a ticket the customer wrote to again after it was marked, in its priority\'s pool', async () => {
    const d = desk();
    const held = (await d.api.heldMessages()).find((r) => r.heldReason === 'not_a_participant')!;
    const marked = (await d.api.handlingTasks()).find((x) => x.ticketId === held.ticketId)!;
    await d.api.submit(marked, 'waiting', DEMO_PEOPLE.bo);
    expect((await d.api.handlingTasks()).some((x) => x.ticketId === held.ticketId)).toBe(false);
    const queue: Change[] = [];
    d.server.onChange((c) => { if (c.kind === 'task') queue.push(c); });
    await ran(d, 'accept_message', held.id);
    expect((await d.api.handlingTasks()).filter((x) => x.ticketId === held.ticketId))
      .toMatchObject([{ nodeId: 'handle_high', status: 'open', claimedByUserId: null }]);
    expect(queue.length).toBeGreaterThan(0);
  });

  it('opens no second task while a ticket has one, and holds a priority change until it is marked', async () => {
    const d = desk();
    const forTicket = async (id: string) => (await d.api.handlingTasks()).filter((x) => x.ticketId === id);
    const dmarc = (await d.api.heldMessages()).find((r) => r.heldReason === 'dmarc_failed')!;
    await ran(d, 'accept_message', dmarc.id);
    expect(await forTicket(dmarc.ticketId)).toMatchObject([{ nodeId: 'handle_urgent', status: 'claimed', claimedByUserId: DEMO_PEOPLE.bo }]);
    const ana = await ticketByNumber(d.api, 'TK-2026-0418');
    d.server.write('ticket', ana.id, { priority: 'urgent' });
    expect(await forTicket(ana.id)).toMatchObject([{ nodeId: 'handle_high' }]);
  });

  it('opens no task for a ticket that was only just created: the trigger listens for updates', async () => {
    const d = desk();
    const created = d.server.write('ticket', null, { number: 'TK-2026-0998', status: 'open', priority: 'high', last_customer_at: NOW.toISOString() });
    expect((await d.api.handlingTasks()).some((x) => x.ticketId === created.id)).toBe(false);
    d.server.write('ticket', created.id, { last_customer_at: new Date(NOW.getTime() + 60_000).toISOString() });
    expect((await d.api.handlingTasks()).filter((x) => x.ticketId === created.id)).toMatchObject([{ nodeId: 'handle_high' }]);
  });

  it('opens a task in the new pool when the priority changes on a ticket with none', async () => {
    const d = desk();
    const normal = await ticketByNumber(d.api, 'TK-2026-0402'); // pending, no task
    d.server.write('ticket', normal.id, { status: 'open' }); // not one of the fields the trigger listens to
    expect((await d.api.handlingTasks()).filter((x) => x.ticketId === normal.id)).toEqual([]);
    d.server.write('ticket', normal.id, { priority: 'high' });
    expect((await d.api.handlingTasks()).filter((x) => x.ticketId === normal.id)).toMatchObject([{ nodeId: 'handle_high', status: 'open' }]);
  });

  describe('the Handling run behind a task', () => {
    const later = new Date(NOW.getTime() + 60_000).toISOString();
    const minesHigh = async (d: Desk) =>
      (await d.api.handlingTasks()).find((x) => x.claimedByUserId === DEMO_PEOPLE.bo && x.nodeId === 'handle_high')!;

    it('is the run the submit names: "Done" once the task is marked', async () => {
      const d = desk();
      const mine = await minesHigh(d);
      const runId = await d.api.submit(mine, 'solved', DEMO_PEOPLE.bo);
      expect(runId).toEqual(expect.any(String));
      expect(await d.api.run(runId)).toMatchObject({ state: 'done', status: 'completed', outcome: 'Done' });
      expect(await d.api.ticket(mine.ticketId)).toMatchObject({ status: 'solved' });
    });

    it.each(['solved', 'waiting'] as const)(
      'ends %s with "Customer wrote meanwhile" when the customer wrote after the task opened: nothing is written, and the held message opens a fresh task',
      async (action) => {
        const d = desk();
        const mine = await minesHigh(d);
        d.server.write('ticket', mine.ticketId, { last_customer_at: later });
        const runId = await d.api.submit(mine, action, DEMO_PEOPLE.bo); // the submit itself succeeds
        expect(await d.api.run(runId)).toMatchObject({ state: 'done', status: 'completed', outcome: 'Customer wrote meanwhile' });
        expect(await d.api.ticket(mine.ticketId)).toMatchObject({ status: 'open', pendingSince: null });
        expect((await d.api.thread(mine.ticketId)).notes.some((n) => n.kind === 'event' && /^Marked /.test(n.body))).toBe(false);
        const fresh = (await d.api.handlingTasks()).filter((x) => x.ticketId === mine.ticketId);
        expect(fresh).toMatchObject([{ nodeId: 'handle_high', status: 'open', claimedByUserId: null }]);
        expect(fresh[0]!.id).not.toBe(mine.id);
      },
    );

    it('lets Escalate through whatever the customer wrote, since only Solved and Waiting expect the ticket unchanged', async () => {
      const d = desk();
      const mine = await minesHigh(d);
      d.server.write('ticket', mine.ticketId, { last_customer_at: later });
      const runId = await d.api.submit(mine, 'escalate', DEMO_PEOPLE.bo);
      expect(await d.api.run(runId)).toMatchObject({ outcome: 'Done' });
      expect(await d.api.ticket(mine.ticketId)).toMatchObject({ priority: 'urgent' });
    });

    it('marks normally when the customer wrote before the task opened', async () => {
      const d = desk();
      const first = await minesHigh(d);
      d.server.write('ticket', first.ticketId, { last_customer_at: later });
      await d.api.submit(first, 'escalate', DEMO_PEOPLE.bo); // the escalation opens a task that has seen that message
      const second = (await d.api.handlingTasks()).find((x) => x.ticketId === first.ticketId)!;
      await d.api.claim(second);
      const runId = await d.api.submit(second, 'waiting', DEMO_PEOPLE.bo);
      expect(await d.api.run(runId)).toMatchObject({ outcome: 'Done' });
      expect(await d.api.ticket(first.ticketId)).toMatchObject({ status: 'pending' });
    });
  });

  it('shows a ticket that was escalated before as such', async () => {
    const { api } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    expect(t.escalatedAt).not.toBeNull();
  });

  it('never lets a person start the Handling workflow', async () => {
    const { api } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    expect(isDeskError(await api.start('handling', t.id, {}, null).catch((e) => e), 'forbidden')).toBe(true);
  });
});

describe('redrafting, held messages and rules', () => {
  it('redrafts in the background and announces the new text', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const changes: string[] = [];
    server.onChange((c) => { if (c.kind === 'record') changes.push(`${c.entity}:${c.ticketId}`); });
    const before = draftOf((await api.thread(t.id)).replies, t.id)!;
    const started = await api.start('draft_reply', t.id, { instruction: 'Make it shorter.' }, null);
    expect(started).toMatchObject({ state: 'running' });
    await server.settle();
    const after = draftOf((await api.thread(t.id)).replies, t.id)!;
    expect(after.body.length).toBeLessThan(before.body.length);
    expect(after.aiBody).toBe(after.body);
    expect(changes).toContain(`reply:${t.id}`);
    expect(await api.run(started.runId)).toMatchObject({ state: 'done', outcome: 'Drafted', output: { draft: before.id, skipped: false } });
  });

  it('saves a redraft the way the real workflow does, leaving the last editor as the draft\'s author', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const draft = draftOf((await api.thread(t.id)).replies, t.id)!;
    await api.saveDraft(draft, { body: draft.body }, DEMO_PEOPLE.ha);
    await api.start('draft_reply', t.id, { instruction: 'Make it friendlier.' }, null);
    await server.settle();
    const after = draftOf((await api.thread(t.id)).replies, t.id)!;
    expect(after).toMatchObject({
      status: 'draft', authorKind: 'bot', authorUserId: DEMO_PEOPLE.ha, autopilot: 'none', postedAt: NOW.toISOString(),
      intent: 'order_status', intentConfidence: 0.94,
    });
    expect(after.citations.map((c) => c.title)).toEqual(['Shipping times and carriers', 'Lost or delayed parcels', 'Team note']);
    expect(after.body).toContain('Thanks so much for your patience!');
  });

  it('revises the text a redraft carries, not the stored draft: the real agent never reads the draft', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const carried = 'Hi Ana,\n\nIt ships today. It is express. It will arrive Thursday.\n\nBo';
    await api.start('draft_reply', t.id, { instruction: withDraftText('Make it shorter.', carried) }, null);
    await server.settle();
    expect(draftOf((await api.thread(t.id)).replies, t.id)!.body).toBe('Hi Ana,\n\nIt ships today.\n\nBo');
  });

  it('ends a scripted run "Not saved", writing nothing, and only that one run', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const before = draftOf((await api.thread(t.id)).replies, t.id)!;
    server.nextDraftOutcome('Not saved');
    const skipped = await api.start('draft_reply', t.id, { instruction: 'Make it shorter.' }, null);
    await server.settle();
    expect(await api.run(skipped.runId)).toMatchObject({ state: 'done', status: 'completed', outcome: 'Not saved', output: { skipped: true } });
    expect(draftOf((await api.thread(t.id)).replies, t.id)).toMatchObject({ id: before.id, body: before.body, updatedAt: before.updatedAt });

    const next = await api.start('draft_reply', t.id, { instruction: 'Make it shorter.' }, null);
    await server.settle();
    expect(await api.run(next.runId)).toMatchObject({ outcome: 'Drafted' });
  });

  it('fails a scripted run, with a message the desk must not show', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    server.nextDraftOutcome('failed');
    const run = await api.start('draft_reply', t.id, {}, null);
    await server.settle();
    expect(await api.run(run.runId)).toMatchObject({ state: 'done', status: 'failed', outcome: null });
  });

  it('lists held messages, and accepting one makes it the customer\'s', async () => {
    const d = desk();
    const { api } = d;
    const held = await api.heldMessages();
    expect(held.map((r) => r.heldReason).sort()).toEqual(['dmarc_failed', 'not_a_participant']);
    const first = held[0]!;
    const before = draftOf((await api.thread(first.ticketId)).replies, first.ticketId)!;
    const accepted = await ran(d, 'accept_message', first.id);
    expect(accepted).toMatchObject({ status: 'completed', outcome: 'Accepted' });
    expect(accepted.output).toEqual({});
    expect((await api.reply(first.id)).authorKind).toBe('customer');
    expect(await api.heldMessages()).toHaveLength(1);
    expect((await api.ticket(first.ticketId)).status).toBe('open');
    // Accept asks the drafting workflow to read the conversation again.
    expect((await api.reply(before.id)).version).toBeGreaterThan(before.version);
  });

  it('ends a second accept "Already decided", without touching anything', async () => {
    const d = desk();
    const first = (await d.api.heldMessages())[0]!;
    await ran(d, 'accept_message', first.id);
    const version = (await d.api.reply(first.id)).version;
    const second = await ran(d, 'accept_message', first.id);
    expect(second).toMatchObject({ status: 'completed', outcome: 'Already decided' });
    expect(second.output).toEqual({});
    expect((await d.api.reply(first.id)).version).toBe(version);
  });

  it('keeps Accept going until its drafting child is done', async () => {
    const d = desk({ draftDelayMs: 60_000 });
    const first = (await d.api.heldMessages())[0]!;
    const started = await d.api.start('accept_message', first.id, {}, 5000);
    if (started.state !== 'running') throw new Error('expected running');
    expect(await d.api.waitForRun(started.runId, { timeoutMs: 50, intervalMs: 5 })).toEqual({ state: 'running', runId: started.runId });
    expect((await d.api.reply(first.id)).authorKind).toBe('customer');
    await d.server.settle();
    expect(await d.api.run(started.runId)).toMatchObject({ state: 'done', outcome: 'Accepted' });
  });

  it('moves a held message to a new ticket for its sender, named without the reply prefix or number', async () => {
    const d = desk();
    const { api } = d;
    const held = (await api.heldMessages()).find((r) => r.heldReason === 'not_a_participant')!;
    const result = await ran(d, 'move_message', held.id);
    expect(result).toMatchObject({ status: 'completed', outcome: 'Moved' });
    const ticketId = String(result.output.ticket_id);
    expect((await api.reply(held.id))).toMatchObject({ ticketId, authorKind: 'customer' });
    const ticket = await api.ticket(ticketId);
    expect(ticket).toMatchObject({ status: 'open', subject: 'Where is my order?', requesterName: 'eve@mailbox.test' });
    expect(ticket.number).toMatch(/^TK-2026-0\d+$/);
    // The new ticket gets a draft, as Plan 3's Move asks Draft reply for one.
    expect(draftOf((await api.thread(ticketId)).replies, ticketId)).toMatchObject({ authorKind: 'bot', body: expect.stringContaining('Thanks for writing') });
  });

  it('opens a Handle task for the ticket a message moved to, as Handling\'s trigger does', async () => {
    const d = desk();
    const held = (await d.api.heldMessages()).find((r) => r.heldReason === 'not_a_participant')!;
    const result = await ran(d, 'move_message', held.id);
    const ticketId = String(result.output.ticket_id);
    expect((await d.api.handlingTasks()).filter((x) => x.ticketId === ticketId))
      .toMatchObject([{ nodeId: 'handle_normal', status: 'open', claimedByUserId: null }]);
  });

  it('tells both conversations a moved message left one and joined the other', async () => {
    const d = desk();
    const held = (await d.api.heldMessages()).find((r) => r.heldReason === 'not_a_participant')!;
    const seen: Change[] = [];
    d.server.onChange((c) => seen.push(c));
    const result = await ran(d, 'move_message', held.id);
    const replyChanges = seen.filter((c) => c.kind === 'record' && c.entity === 'reply' && c.id === held.id);
    expect(replyChanges.map((c) => (c.kind === 'record' ? c.ticketId : null)).sort())
      .toEqual([held.ticketId, String(result.output.ticket_id)].sort());
  });

  it('ends a lost Move "Already decided", with no values and no new ticket', async () => {
    const d = desk();
    const held = (await d.api.heldMessages()).find((r) => r.heldReason === 'not_a_participant')!;
    await ran(d, 'move_message', held.id);
    const tickets = d.server.records('ticket').length;
    const second = await ran(d, 'move_message', held.id);
    expect(second).toMatchObject({ status: 'completed', outcome: 'Already decided' });
    expect(second.output).toEqual({});
    expect(d.server.records('ticket')).toHaveLength(tickets);
  });

  it('takes an upload and names it on the record', async () => {
    const { api } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    const draft = draftOf((await api.thread(t.id)).replies, t.id)!;
    const file = await api.upload(new File(['%PDF'], 'invoice.pdf', { type: 'application/pdf' }));
    await api.saveDraft(draft, { attachments: [file.id] }, DEMO_PEOPLE.bo);
    expect((await api.reply(draft.id)).attachments).toEqual([{ id: file.id, name: 'invoice.pdf' }]);
  });

  it('answers "forbidden" to anyone outside Support admins, who hold the same permissions', async () => {
    const { api, server } = desk();
    const rule = (await api.autopilotRules()).find((r) => r.intent === 'order_status')!;
    server.actAs(DEMO_PEOPLE.ha);
    expect((await api.me()).permissions).toEqual(['entity.read', 'entity.list', 'entity.write']);
    expect(isDeskError(await api.setAutopilotMode('order_status', 'live', rule).catch((e) => e), 'forbidden')).toBe(true);
    expect(isDeskError(await api.setAutopilotMode('bug_report', 'shadow', null).catch((e) => e), 'forbidden')).toBe(true);
    server.actAs(DEMO_PEOPLE.bo);
    expect((await api.me()).permissions).toEqual(['entity.read', 'entity.list', 'entity.write']);
    expect(await api.setAutopilotMode('order_status', 'live', rule)).toMatchObject({ enabled: true, mode: 'live' });
  });

  it('fills a new rule\'s threshold and disclosure from the entity\'s defaults', async () => {
    const { api } = desk();
    expect(await api.setAutopilotMode('bug_report', 'live', null)).toMatchObject({
      intent: 'bug_report', enabled: true, mode: 'live', minConfidence: 0.9, disclose: true,
    });
    const switchedOff = await api.setAutopilotMode('feedback', 'off', null);
    expect(switchedOff).toMatchObject({ enabled: false, mode: 'shadow' });
  });

  it('refuses a second rule for an intent', async () => {
    const { api } = desk();
    const error = await api.setAutopilotMode('order_status', 'live', null).catch((e) => e);
    expect(isDeskError(error, 'conflict')).toBe(true);
  });
});

describe('what the desk reads back', () => {
  it('searches a contact\'s email, name, organisation, locale and notes, the text fields the installer makes searchable', async () => {
    const { api } = desk();
    const names = async (q: string) => (await api.contacts(q)).items.map((c) => c.name).sort();
    // "en" is in Lan's address and company, in Ana's notes ("often"), and is the locale of Ana and Priya.
    expect(await names('en')).toEqual(['Ana Lima', 'Lan Phạm', 'Priya Raman']);
    expect(await names('NGUYEN & co')).toEqual(['Lan Phạm']);
    expect(await names('ana@')).toEqual(['Ana Lima']);
    expect(await names('bellini libri')).toEqual(['Marco Bellini']);
    expect(await names('Prefers email')).toEqual(['Ana Lima']); // notes
    expect(await names('vi')).toEqual(['Trần Minh Khoa', 'Lan Phạm', 'Đỗ Thị Mai'].sort()); // locale
  });

  it('keeps a thread in the order things happened, though one reply was stamped in the org\'s zone', async () => {
    const { api, server } = desk();
    const t = await ticketByNumber(api, 'TK-2026-0418');
    expect(server.records('reply').some((r) => /\+07:00$/.test(String(r.body.posted_at)))).toBe(true);
    const { replies, notes } = await api.thread(t.id);
    expect(threadItems(replies, notes).map((i) => i.kind)).toEqual(['customer', 'ours', 'note', 'event', 'customer', 'held']);
    expect(newestCustomerAt(replies)).toBe(new Date(NOW.getTime() - 23 * 60_000).toISOString());
  });

  it('greets a new draft\'s customer by the name they go by', async () => {
    const d = desk();
    const ana = await ticketByNumber(d.api, 'TK-2026-0311'); // Ana, en, no draft
    const khoa = d.server.records('contact').find((c) => c.body.email === 'khoa.tran@gmail.com')!; // Trần Minh Khoa, vi
    const forKhoa = d.server.write('ticket', null, { number: 'TK-2026-0999', requester: khoa.id, status: 'open' });
    await d.api.start('draft_reply', ana.id, {}, null);
    await d.api.start('draft_reply', forKhoa.id, {}, null);
    await d.server.settle();
    const greeting = async (ticketId: string) => draftOf((await d.api.thread(ticketId)).replies, ticketId)!.body.split('\n')[0];
    expect(await greeting(ana.id)).toBe('Hi Ana,');
    expect(await greeting(forKhoa.id)).toBe('Hi Khoa,');
  });
});

describe('what the live layer hears', () => {
  it('announces saved replies and Autopilot rules like every other record, since the stream carries their events', async () => {
    const { api, server } = desk();
    const seen: Change[] = [];
    server.onChange((c) => seen.push(c));
    const rule = (await api.autopilotRules()).find((r) => r.intent === 'order_status')!;
    await api.setAutopilotMode('order_status', 'live', rule);
    await api.setAutopilotMode('bug_report', 'shadow', null);
    server.write('canned_reply', 'cr-1', { name: 'Renamed' });
    server.write('canned_reply', null, { name: 'Brand new', body: 'Hi' });
    server.write('autopilot_rule', 'ap-3', { enabled: false });
    expect(seen.map((c) => (c.kind === 'record' ? c.entity : c.kind)))
      .toEqual(['autopilot_rule', 'autopilot_rule', 'canned_reply', 'canned_reply', 'autopilot_rule']);
    expect(seen.every((c) => c.kind === 'record' && c.ticketId === null)).toBe(true);
    // And they change.
    expect((await api.autopilotRules()).find((r) => r.intent === 'order_status')).toMatchObject({ mode: 'live' });
    expect((await api.cannedReplies()).map((c) => c.name)).toContain('Brand new');
  });

  it('announces the other records too', async () => {
    const { server } = desk();
    const seen: Change[] = [];
    server.onChange((c) => seen.push(c));
    server.write('contact', null, { email: 'new@x.test' });
    server.write('note', null, { ticket: 'k', kind: 'staff', body: 'b' });
    expect(seen.map((c) => (c.kind === 'record' ? c.entity : c.kind))).toEqual(['contact', 'note']);
  });
});
