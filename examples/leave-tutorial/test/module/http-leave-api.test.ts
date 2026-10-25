import { describe, expect, it, vi } from 'vitest';
import type { AppHost } from '@reflexify/agentflow-sdk';
import { LeaveError } from '../../src/module/leave-api.js';
import { createHttpLeaveApi } from '../../src/module/http-leave-api.js';

const ENTITY = '11111111-1111-4111-8111-111111111111';

const object = (over: Record<string, unknown>) => ({
  contract: null, contract_version: null, customized: false, feature: null, id: ENTITY, key: 'leave_request',
  kind: 'entity', logical_key: 'entity:leave_request', parent: null, source: 'own', state: 'live', ...over,
});

const answer = (objects: unknown[]) => ({ data: { revision: 1, objects }, response: new Response() });
const record = (body: Record<string, unknown>) => ({ id: 'r1', entity_id: ENTITY, updated_at: '2026-10-25T00:00:00Z', body });

function host(objects: () => Promise<unknown>, post?: (path: string, init: unknown) => Promise<unknown>) {
  const GET = vi.fn(objects);
  const POST = vi.fn(post ?? (async () => ({ data: { items: [], next_cursor: null }, response: new Response() })));
  const PATCH = vi.fn(async () => ({ data: record({ number: 'LV-2026-0001', leave_type: 'sick', from_date: '2027-01-04', to_date: '2027-01-04', days: 1, status: 'submitted' }), response: new Response() }));
  return { api: { GET, POST, PATCH } as unknown as AppHost['api'], GET, POST, PATCH };
}

describe('the leave requests over the published operations', () => {
  it('finds the entity by its logical key and queries its records', async () => {
    const h = host(async () => answer([object({})]));
    await expect(createHttpLeaveApi(h).list()).resolves.toEqual([]);
    expect(h.POST).toHaveBeenCalledWith('/entities/{entity_id}/records/query', expect.objectContaining({ params: { path: { entity_id: ENTITY } } }));
  });

  it('says NOT_INSTALLED when the package has no leave request entity', async () => {
    const h = host(async () => answer([object({ state: 'off', id: null })]));
    await expect(createHttpLeaveApi(h).list()).rejects.toMatchObject({ code: 'NOT_INSTALLED' });
  });

  it('asks again after a failed load, so Try again recovers', async () => {
    let calls = 0;
    const h = host(async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('offline');
      return answer([object({})]);
    });
    const api = createHttpLeaveApi(h);
    expect(await api.list().catch((e: unknown) => e)).toBeInstanceOf(LeaveError);
    await expect(api.list()).resolves.toEqual([]);
  });

  it('creates the request with the create form keys, then moves it to submitted', async () => {
    const h = host(async () => answer([object({})]), async () => ({ data: record({}), response: new Response() }));
    const sent = await createHttpLeaveApi(h).send({ type: 'sick', from: '2027-01-04', to: '2027-01-04', reason: '' });
    expect(h.POST).toHaveBeenCalledWith('/entities/{entity_id}/records', expect.objectContaining({
      body: { form_payload: { leave_type: 'sick', from_date: '2027-01-04', to_date: '2027-01-04', reason: null } },
    }));
    expect(h.PATCH).toHaveBeenCalledWith('/entities/{entity_id}/records/{record_id}', expect.objectContaining({
      body: { changes: { status: 'submitted' }, expected_updated_at: '2026-10-25T00:00:00Z' },
    }));
    expect(sent).toMatchObject({ number: 'LV-2026-0001', status: 'submitted', days: 1 });
  });
});
