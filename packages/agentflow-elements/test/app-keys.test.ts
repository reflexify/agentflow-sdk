import { createAgentFlowClient, proxyAdapter } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { AppKeyMissing, resolveKey } from '../src/app-keys.js';
import { json, stubApi } from './support.js';

const E = '0190c0de-0000-7000-8000-0000000000e1';
const W = '0190c0de-0000-7000-8000-0000000000w1';
const obj = (logical_key: string, id: string | null, state = 'active') => ({
  logical_key, id, state, source: 'own', kind: logical_key.split(':')[0], key: logical_key.split(':')[1],
  contract: null, contract_version: null, customized: false, feature: null, parent: null,
});

function setup(objects: object[]) {
  const api = stubApi({ 'GET /app/objects': () => json(200, { revision: 1, objects }) });
  const client = createAgentFlowClient({ baseUrl: `${location.origin}/agentflow/api`, auth: proxyAdapter(), fetch: api.fetch });
  return { api, client };
}

describe('resolveKey', () => {
  it('resolves an own live entity to its id', async () => {
    const { client } = setup([obj('entity:ticket', E)]);
    expect(await resolveKey(client, 'entity', 'ticket')).toBe(E);
  });

  it('throws AppKeyMissing for an absent key and for an object that is off', async () => {
    const { client } = setup([obj('entity:gone', null, 'off')]);
    const absent = await resolveKey(client, 'workflow', 'nope').catch((e) => e);
    expect(absent).toBeInstanceOf(AppKeyMissing);
    expect([absent.kind, absent.key]).toEqual(['workflow', 'nope']);
    const off = await resolveKey(client, 'entity', 'gone').catch((e) => e);
    expect(off).toBeInstanceOf(AppKeyMissing);
    expect([off.kind, off.key]).toEqual(['entity', 'gone']);
  });

  it('makes one request for three resolutions on one client', async () => {
    const { api, client } = setup([obj('entity:ticket', E), obj('workflow:intake', W)]);
    const ids = await Promise.all([resolveKey(client, 'entity', 'ticket'), resolveKey(client, 'workflow', 'intake'), resolveKey(client, 'entity', 'ticket')]);
    expect(ids).toEqual([E, W, E]);
    expect(api.calls.filter((c) => c.path === '/app/objects')).toHaveLength(1);
  });
});
