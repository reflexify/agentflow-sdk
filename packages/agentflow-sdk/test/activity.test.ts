import { describe, expect, it, vi } from 'vitest';
import { activity, ACTIVITY_KINDS, bearerAdapter, createAgentFlowClient, type PublicEvent } from '../src/index.js';

const ENTITY = '0190f5a0-0000-7000-8000-000000000001';
const RECORD = '0190f5a0-0000-7000-8000-000000000002';
const OTHER = '0190f5a0-0000-7000-8000-000000000003';
const RUN = '0190f5a0-0000-7000-8000-000000000004';

function clientAnswering(body: unknown) {
  const seen: URL[] = [];
  const fetchFn = vi.fn(async (req: Request) => {
    seen.push(new URL(req.url));
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: bearerAdapter(async () => 't'), fetch: fetchFn });
  return { client, seen };
}

const page = {
  items: [
    {
      id: '0190f5a0-0000-7000-8000-000000000010',
      event_type: 'record.updated',
      occurred_at: '2026-11-12T08:00:00Z',
      actor: { kind: 'user', id: OTHER, display_name: 'Nam' },
      payload: { changed: ['status'] },
    },
  ],
  next_cursor: 'c2',
  prev_cursor: null,
};

describe('activity.list', () => {
  it('asks the record activity route and joins kinds with commas', async () => {
    const { client, seen } = clientAnswering(page);
    const got = await activity.list(client, { entity_id: ENTITY, record_id: RECORD, kinds: ['field', 'stage'], cursor: 'c1', limit: 20 });
    expect(seen[0]!.pathname).toBe(`/api/v1/entities/${ENTITY}/records/${RECORD}/activity`);
    expect(Object.fromEntries(seen[0]!.searchParams)).toEqual({ kinds: 'field,stage', cursor: 'c1', limit: '20' });
    expect(got.items[0]!.event_type).toBe('record.updated');
    expect(got.next_cursor).toBe('c2');
  });

  it('leaves out kinds when none is given or the list is empty, so the server reads every kind', async () => {
    const { client, seen } = clientAnswering(page);
    await activity.list(client, { entity_id: ENTITY, record_id: RECORD });
    await activity.list(client, { entity_id: ENTITY, record_id: RECORD, kinds: [] });
    expect(seen[0]!.search).toBe('');
    expect(seen[1]!.search).toBe('');
  });
});

describe('activity.kindOf', () => {
  it.each([
    ['record.updated', 'field'],
    ['record.stage.transitioned', 'stage'],
    ['record.created', 'record'],
    ['record.series.raised', 'record'],
    ['instance.started', 'run'],
    ['task.opened', 'run'],
    ['node_run.failed', 'run'],
    ['agent.dispatched', 'run'],
    ['work.claimed', 'work'],
    ['work.breached', 'work'],
    ['record.deleted', null],
    ['comment.created', null],
    ['instancex.started', null],
    ['', null],
  ] as const)('%s is %s', (type, kind) => {
    expect(activity.kindOf(type)).toBe(kind);
  });

  it('names every kind the feed filters by', () => {
    expect([...ACTIVITY_KINDS]).toEqual(['field', 'stage', 'record', 'run', 'work']);
  });
});

describe('activity.isAbout', () => {
  const record = { entity_id: ENTITY, record_id: RECORD };
  const event = (type: string, kind: string, id: string): PublicEvent => ({
    id: '0190f5a0-0000-7000-8000-0000000000ff',
    type,
    occurred_at: '2026-11-12T08:00:00Z',
    org_id: OTHER,
    position: 1,
    subject: { kind, id, entity_id: ENTITY },
  });
  const runs = new Set([RUN]);

  it.each([
    ['a record event of the record', event('record.updated', 'record', RECORD), true],
    ['a work event of the record', event('work.claimed', 'work', RECORD), true],
    ['a record event of another record', event('record.updated', 'record', OTHER), false],
    ['a work event of another record', event('work.claimed', 'work', OTHER), false],
    ['an event of a run the record has', event('instance.started', 'instance', RUN), true],
    ['an event of a run it does not have', event('instance.started', 'instance', OTHER), false],
    ['an instance subject that is the record id', event('instance.started', 'instance', RECORD), false],
    ['an unknown subject kind', event('record.updated', 'thing', RECORD), false],
  ])('%s: %s', (_what, e, expected) => {
    expect(activity.isAbout(e, record, runs)).toBe(expected);
  });
});
