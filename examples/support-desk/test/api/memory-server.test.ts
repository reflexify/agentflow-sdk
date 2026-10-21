import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { DEMO_IDS } from '../../src/api/demo-ids.js';
import { cleanSubject, createMemoryServer, MEMORY_WORKFLOW_TASK_ENTITY_ID, redraftText, SEARCHABLE } from '../../src/api/memory-server.js';
import { createSeed, DEMO_PEOPLE } from '../../src/api/seed.js';
import { appObjectsFor, deskIdsFrom } from '../../shared/app-objects.js';

const NOW = new Date('2026-10-06T11:12:00Z');
const BASE = 'http://desk.memory/agentflow/api';
const E = DEMO_IDS.entities;
const W = DEMO_IDS.workflows;

const server = () => createMemoryServer(createSeed(NOW), { now: () => NOW });
const send = (s: ReturnType<typeof server>, method: string, route: string, body?: unknown) =>
  s.fetch(new Request(`${BASE}${route}`, {
    method, headers: { 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));
const problem = async (r: Response) => (await r.json()) as { type: string; detail: string | null };

// Plan 3's Code step is the source of truth for the subject a moved message gets.
function planThreeCleaner(): (subject: unknown) => string {
  const file = path.join(import.meta.dirname, '..', '..', 'config', 'code', 'clean-subject.js');
  const context = vm.createContext({});
  vm.runInContext(readFileSync(file, 'utf8'), context, { filename: 'clean-subject.js' });
  const main = vm.runInContext('main', context) as (inputs: { subject: unknown }) => { clean_subject: string };
  return (subject) => main({ subject }).clean_subject;
}

describe('cleanSubject', () => {
  it('takes off reply prefixes and the ticket number the sender guessed', () => {
    expect(cleanSubject('[TK-2026-0001] hi')).toBe('hi');
    expect(cleanSubject('RE: Fwd: [TK-2026-0418] Refund')).toBe('Refund');
  });

  it('is "(no subject)" when nothing is left', () => {
    for (const subject of ['  ', '', null, undefined, 'Re: [TK-2026-0001]']) expect(cleanSubject(subject)).toBe('(no subject)');
  });

  it('cleans exactly as Plan 3\'s Code step does', () => {
    const cleaner = planThreeCleaner();
    const subjects = [
      'Help', '[TK-2026-0001] hi', 'RE: Fwd: [TK-2026-0418] Refund', 'Re: re: [tk-2026-7] [TK-2026-8]  too   many spaces ',
      'Aw: Sv: Where is it?', '  ', '', null, undefined, 'Re: [TK-2026-0001]', 'Fw: x', 'Fwd:   y', 'Sv:Aw:z',
      'Re: [TK-2026-0418] Where is my order?',
    ];
    for (const subject of subjects) expect(cleanSubject(subject), JSON.stringify(subject)).toBe(cleaner(subject));
  });

  it('gives the seeded held message the subject of its own ticket', () => {
    const held = createSeed(NOW).records.reply!.find((r) => r.body.held_reason === 'not_a_participant')!;
    expect(cleanSubject(held.body.subject)).toBe('Where is my order?');
  });
});

describe('redraftText', () => {
  it('leaves the text alone when there is no instruction, as Accept and Move ask for none', () => {
    expect(redraftText('Hi Ana,\n\nIt ships today.\n\nBo', '')).toBe('Hi Ana,\n\nIt ships today.\n\nBo');
  });
  it('shortens to the opening, the first sentence and the sign-off', () => {
    expect(redraftText('Hi Ana,\n\nIt ships today. It is express.\n\nBo', 'Make it shorter.')).toBe('Hi Ana,\n\nIt ships today.\n\nBo');
  });
});

describe('creating records', () => {
  it('refuses a null in the payload, as optional text fields do, and lets a PATCH clear a value', async () => {
    const s = server();
    const refused = await send(s, 'POST', `/entities/${E.contact}/records`, { form_payload: { email: 'new@x.test', name: null } });
    expect(refused.status).toBe(422);
    expect((await problem(refused)).type).toBe('VALIDATION_ERROR');
    expect(s.records('contact').some((c) => c.body.email === 'new@x.test')).toBe(false);

    const ana = s.records('contact').find((c) => c.body.email === 'ana@example.com')!;
    const cleared = await send(s, 'PATCH', `/entities/${E.contact}/records/${ana.id}`, {
      changes: { notes: null }, expected_updated_at: ana.updated_at,
    });
    expect(cleared.status).toBe(200);
    expect(s.records('contact').find((c) => c.id === ana.id)!.body).not.toHaveProperty('notes');
  });

  it('compares alternate keys exactly, as storage does', async () => {
    const s = server();
    const create = (email: string) => send(s, 'POST', `/entities/${E.contact}/records`, { form_payload: { email } });
    const same = await create('ana@example.com');
    expect(same.status).toBe(409);
    expect((await problem(same)).type).toBe('ENTITY_NATURAL_KEY_CONFLICT');
    expect((await create('ANA@example.com')).status).toBe(201);
  });

  it('applies the entities\' defaults, and numbers a ticket', async () => {
    const s = server();
    const ticket = (await (await send(s, 'POST', `/entities/${E.ticket}/records`, { form_payload: { subject: 'Hello' } })).json()) as { body: Record<string, unknown> };
    expect(ticket.body).toMatchObject({ subject: 'Hello', status: 'new', priority: 'normal' });
    expect(ticket.body.number).toMatch(/^TK-2026-0\d+$/);
    const note = (await (await send(s, 'POST', `/entities/${E.note}/records`, { form_payload: { ticket: 'x', body: 'b' } })).json()) as { body: Record<string, unknown> };
    expect(note.body.kind).toBe('staff');
    s.actAs(DEMO_PEOPLE.bo);
    const rule = (await (await send(s, 'POST', `/entities/${E.autopilot_rule}/records`, { form_payload: { intent: 'other' } })).json()) as { body: Record<string, unknown> };
    expect(rule.body).toEqual({ intent: 'other', enabled: false, mode: 'shadow', min_confidence: 0.9, disclose: true });
  });
});

describe('runs', () => {
  const start = (s: ReturnType<typeof server>, workflow: string, subject: string, waitMs?: number) =>
    send(s, 'POST', `/workflows/${workflow}/instances`, {
      name: 'test', subject: { kind: 'record', record_id: subject }, params: {}, ...(waitMs ? { wait_ms: waitMs } : {}),
    });

  it('answers a start 201 when it did not wait, 202 when it did, and running either way', async () => {
    const s = server();
    const draft = s.records('reply').find((r) => r.body.status === 'draft')!;
    const plain = await start(s, W.send_reply, draft.id);
    const waited = await start(s, W.send_reply, draft.id, 8000);
    expect([plain.status, waited.status]).toEqual([201, 202]);
    expect(await plain.json()).toMatchObject({ status: 'running' });
    await s.settle();
  });

  it('serves a run\'s end under its id once settled, and 404s an unknown run', async () => {
    const s = server();
    const draft = s.records('reply').find((r) => r.body.status === 'draft')!;
    const started = (await (await start(s, W.send_reply, draft.id, 8000)).json()) as { id: string };
    await s.settle();
    const end = await (await send(s, 'GET', `/instances/${started.id}`)).json();
    expect(end).toMatchObject({ id: started.id, status: 'completed', output_payload: { status: 'sent' }, outcome_label: null });
    expect((await send(s, 'GET', '/instances/nope')).status).toBe(404);
  });

  it('refuses to start a workflow whose start access admits nobody', async () => {
    const s = server();
    const r = await start(s, W.handling, s.records('ticket')[0]!.id);
    expect(r.status).toBe(403);
    expect(s.runs()).toEqual([]);
  });

  it('keeps what each run was started with', async () => {
    const s = server();
    const draft = s.records('reply').find((r) => r.body.status === 'draft')!;
    const started = (await (await start(s, W.send_reply, draft.id, 8000)).json()) as { id: string };
    expect(s.runs()).toEqual([{ id: started.id, workflow: 'send_reply', subjectId: draft.id, params: {} }]);
    await s.settle();
  });

  it('settles runs that begin while it is settling', async () => {
    const s = createMemoryServer(createSeed(NOW), { now: () => NOW, atomicDelayMs: 60_000, draftDelayMs: 60_000 });
    const held = s.records('reply').find((r) => r.body.author_kind === 'unverified')!;
    const started = (await (await start(s, W.accept_message, held.id, 5000)).json()) as { id: string };
    await s.settle();
    expect(await (await send(s, 'GET', `/instances/${started.id}`)).json()).toMatchObject({ status: 'completed', outcome_label: 'Accepted' });
  });
});

describe('tasks', () => {
  it('leaves a task claimed when it is submitted with an action the step does not have', async () => {
    const s = server();
    const mine = s.tasks().find((t) => t.claimedBy === DEMO_PEOPLE.bo)!;
    const refused = await send(s, 'POST', `/entities/${MEMORY_WORKFLOW_TASK_ENTITY_ID}/records/${mine.id}/step/submit`, { payload: { _action: 'archive', by_user: DEMO_PEOPLE.bo } });
    expect(refused.status).toBe(400);
    expect((await refused.json()).type).toBe('HUMAN_ACTION_UNKNOWN');
    expect(s.tasks().find((t) => t.id === mine.id)).toMatchObject({ status: 'claimed', claimedBy: DEMO_PEOPLE.bo });
  });

  it('answers a write on a task already marked with WORK_NOT_ACTIVE, and an unknown task with 404', async () => {
    const s = server();
    const mine = s.tasks().find((t) => t.claimedBy === DEMO_PEOPLE.bo)!;
    const route = (id: string, verb: string) => `/entities/${MEMORY_WORKFLOW_TASK_ENTITY_ID}/records/${id}/${verb}`;
    expect((await send(s, 'POST', route(mine.id, 'step/submit'), { payload: { _action: 'waiting', by_user: DEMO_PEOPLE.bo } })).status).toBe(200);
    for (const verb of ['work/claim', 'work/release', 'step/submit']) {
      const late = await send(s, 'POST', route(mine.id, verb), { payload: { _action: 'solved' } });
      expect([late.status, (await late.json()).type], verb).toEqual([409, 'WORK_NOT_ACTIVE']);
    }
    expect((await send(s, 'POST', route('nobody', 'work/claim'))).status).toBe(404);
  });

  it('lists My Work as lines a step holds, and refuses another holder\'s release', async () => {
    const s = server();
    const listed = (await (await send(s, 'GET', '/work?view=all&live=true')).json()) as { items: Array<{ id: string; entity_id: string; step?: { workflow: { id: string } } }> };
    expect(listed.items.length).toBeGreaterThan(0);
    expect(listed.items.every((l) => l.entity_id === MEMORY_WORKFLOW_TASK_ENTITY_ID && l.step?.workflow.id === DEMO_IDS.workflows.handling)).toBe(true);
    // The seed holds no task claimed by anyone but Bo, so another person claims one from the pool first.
    const theirs = s.tasks().find((t) => t.status === 'open')!;
    s.actAs(DEMO_PEOPLE.ha);
    expect((await send(s, 'POST', `/entities/${MEMORY_WORKFLOW_TASK_ENTITY_ID}/records/${theirs.id}/work/claim`)).status).toBe(200);
    s.actAs(DEMO_PEOPLE.bo);
    const refused = await send(s, 'POST', `/entities/${MEMORY_WORKFLOW_TASK_ENTITY_ID}/records/${theirs.id}/work/release`);
    expect(refused.status).toBe(403);
    expect((await refused.json()).type).toBe('ENTITY_ACCESS_DENIED');
    const handed = await send(s, 'POST', `/entities/${MEMORY_WORKFLOW_TASK_ENTITY_ID}/records/${theirs.id}/work/reassign`, { user_id: DEMO_PEOPLE.bo });
    expect([handed.status, (await handed.json()).type]).toEqual([403, 'ENTITY_ACCESS_DENIED']);
    // Work nobody holds has no claimant to release it.
    const unheld = s.tasks().find((t) => t.status === 'open' && t.id !== theirs.id)!;
    const none = await send(s, 'POST', `/entities/${MEMORY_WORKFLOW_TASK_ENTITY_ID}/records/${unheld.id}/work/release`);
    expect([none.status, (await none.json()).type]).toEqual([403, 'WORK_NOT_CLAIMANT']);
  });
});

describe('starting a run', () => {
  const start = (s: ReturnType<typeof server>, workflow: string, subject: string) =>
    send(s, 'POST', `/workflows/${workflow}/instances`, { name: 'test', subject: { kind: 'record', record_id: subject }, params: {} });

  it('refuses a subject that is not a record of the workflow\'s entity, and creates no run', async () => {
    const s = server();
    const ticket = s.records('ticket')[0]!;
    const reply = s.records('reply').find((r) => r.body.status === 'draft')!;
    const refused = [
      await start(s, W.send_reply, 'missing'), await start(s, W.send_reply, ticket.id),
      await start(s, W.accept_message, ticket.id), await start(s, W.move_message, 'missing'),
      await start(s, W.draft_reply, reply.id), await start(s, W.draft_reply, 'missing'),
    ];
    expect(refused.map((r) => r.status)).toEqual([422, 422, 422, 422, 422, 422]);
    expect((await problem(refused[0]!)).type).toBe('SUBJECT_BINDING_MISMATCH');
    expect(s.runs()).toEqual([]);
    expect((await start(s, W.draft_reply, ticket.id)).status).toBe(201);
    await s.settle();
  });
});

describe('time', () => {
  const clockServer = () => {
    let clock = NOW.getTime();
    const s = createMemoryServer(createSeed(NOW), { now: () => new Date(clock) });
    return { s, advance: (ms: number) => { clock += ms; } };
  };

  it('stamps writes one millisecond apart while the clock stands still, and then follows the clock', () => {
    const { s, advance } = clockServer();
    const stamps = [0, 1, 2].map(() => s.write('note', null, { ticket: 't', body: 'n' }).updated_at);
    expect(stamps).toEqual([NOW.getTime(), NOW.getTime() + 1, NOW.getTime() + 2].map((t) => new Date(t).toISOString()));
    advance(5_000);
    expect(s.write('note', null, { ticket: 't', body: 'n' }).updated_at).toBe(new Date(NOW.getTime() + 5_000).toISOString());
  });

  it('never stamps behind a stamp it already gave, even if the clock steps back', () => {
    const { s, advance } = clockServer();
    const first = s.write('note', null, { ticket: 't', body: 'n' });
    advance(-60_000);
    const second = s.write('note', first.id, { body: 'again' });
    expect(second.updated_at > first.updated_at).toBe(true);
  });

  it('sorts and filters datetimes by the instant, whatever zone they were written in', async () => {
    const s = server();
    const query = async (body: unknown) => ((await (await send(s, 'POST', `/entities/${E.reply}/records/query`, body)).json()) as { items: { id: string; body: Record<string, unknown> }[] }).items;
    const stamped = s.records('reply').filter((r) => r.body.ticket === s.records('reply').find((x) => /\+07:00$/.test(String(x.body.posted_at)))!.body.ticket);
    const ordered = await query({ filter: { field_filters: [{ field: 'ticket', op: 'eq', value: stamped[0]!.body.ticket }] }, sort: 'posted_at', dir: 'asc' });
    const times = ordered.map((r) => Date.parse(String(r.body.posted_at)));
    expect(times).toEqual([...times].sort((a, b) => a - b));
    // 10:49Z is in the org's zone "17:49+07:00"; asking for what came after 10:52Z must leave it out.
    const since = new Date(NOW.getTime() - 20 * 60_000).toISOString();
    const later = await query({ filter: { field_filters: [{ field: 'posted_at', op: 'gte', value: since }] } });
    expect(later.every((r) => Date.parse(String(r.body.posted_at)) >= Date.parse(since))).toBe(true);
    expect(later.length).toBeGreaterThan(0);
  });
});

describe('searching', () => {
  /**
   * What the installer makes searchable from `config/entities/*.json` (`default_capabilities` in agentflow-core, applied
   * when the package installer creates the field): a field's own `searchable` wins, and otherwise a text field is
   * searchable, unless it is sensitive. Nothing else is: not a number, a date, an enum, a reference, a file or a formula.
   */
  function installedSearchable(entity: string): string[] {
    const file = path.join(import.meta.dirname, '..', '..', 'config', 'entities', `${entity}.json`);
    const fields = (JSON.parse(readFileSync(file, 'utf8')) as { fields: { key: string; type: string; searchable?: boolean; sensitive?: boolean }[] }).fields;
    return fields.filter((f) => f.searchable ?? (f.type === 'text' && f.sensitive !== true)).map((f) => f.key).sort();
  }

  it('looks in the fields the installer makes searchable, which is every text field the config does not turn off', () => {
    for (const entity of Object.keys(SEARCHABLE) as (keyof typeof SEARCHABLE)[]) {
      expect([...SEARCHABLE[entity]].sort(), entity).toEqual(installedSearchable(entity));
    }
    // The ones that surprised: a contact's notes and locale, a ticket's summary, a reply's addresses.
    expect(SEARCHABLE.contact).toEqual(expect.arrayContaining(['notes', 'locale']));
    expect(SEARCHABLE.ticket).toEqual(expect.arrayContaining(['summary']));
    expect(SEARCHABLE.reply).toEqual(expect.arrayContaining(['from_address', 'subject']));
  });

  it('does not look in a field that is not text, or in an auto number', async () => {
    const s = server();
    const search = async (entity: string, q: string) =>
      ((await (await send(s, 'POST', `/entities/${entity}/records/query`, { filter: { q } })).json()) as { items: unknown[] }).items.length;
    expect(await search(E.ticket, 'open')).toBe(0); // a status, not a subject
    expect(await search(E.ticket, 'TK-2026-0418')).toBe(0); // a number, not a subject
    expect(await search(E.ticket, 'where is my order')).toBe(1);
    expect(await search(E.contact, 'shop')).toBe(0);
    expect(await search(E.reply, 'received')).toBe(0); // a status
    expect(await search(E.reply, 'warehouse')).toBeGreaterThan(0); // body text
    expect(await search(E.note, 'mislabelled')).toBe(1);
  });

  it('finds a contact by their notes or their locale, as it does in production', async () => {
    const s = server();
    const search = async (q: string) =>
      ((await (await send(s, 'POST', `/entities/${E.contact}/records/query`, { filter: { q } })).json()) as { items: { body: Record<string, unknown> }[] }).items.map((i) => i.body.name);
    expect(await search('book club')).toEqual(['Ana Lima']); // notes
    expect(await search('vi')).toEqual(expect.arrayContaining(['Trần Minh Khoa', 'Lan Phạm', 'Đỗ Thị Mai'])); // locale
  });
});

describe('what it does not model', () => {
  it('answers an unmodelled filter 400, whichever route carries it, rather than as a dropped network', async () => {
    const s = server();
    const filter = { field_filters: [{ field: 'subject', op: 'starts_with', value: 'W' }] };
    const query = await send(s, 'POST', `/entities/${E.ticket}/records/query`, { filter });
    const count = await send(s, 'POST', `/entities/${E.ticket}/records/count`, { filter });
    expect([query.status, count.status]).toEqual([400, 400]);
    expect((await problem(query)).type).toBe('UNMODELLED_FILTER');
  });

  it('lets any other error through, so a test cannot pass on a mistake the server made', async () => {
    const s = server();
    const broken = new Request(`${BASE}/entities/${E.ticket}/records/query`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{not json' });
    await expect(s.fetch(broken)).rejects.toThrow(SyntaxError);
  });

  it('answers a route it does not know 404', async () => {
    expect((await send(server(), 'GET', '/nothing')).status).toBe(404);
  });
});

describe('the app\'s objects', () => {
  it('lists the desk\'s objects and the support group, as a standalone host\'s server does', async () => {
    const res = await send(server(), 'GET', '/app/objects');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(appObjectsFor(DEMO_IDS));
    expect(deskIdsFrom(body)).toEqual({ ids: DEMO_IDS, missing: [] });
  });
});
