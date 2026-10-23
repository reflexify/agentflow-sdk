import { describe, expect, it, vi } from 'vitest';
import { bearerAdapter, createAgentFlowClient, ok, PUBLISHED_OPERATIONS } from '../src/index.js';

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('sandbox operations', () => {
  it('are published operations the client can call', () => {
    const rows = PUBLISHED_OPERATIONS.map((op) => `${op.method} ${op.path}`);
    expect(rows).toEqual(
      expect.arrayContaining([
        'GET /sandboxes',
        'POST /sandboxes',
        'GET /sandboxes/{sandbox_id}',
        'DELETE /sandboxes/{sandbox_id}',
        'POST /sandboxes/{sandbox_id}/sign-in-links',
        'POST /app-installations/{installation_id}/arm',
        'GET /app-installations/{installation_id}/objects',
      ]),
    );
  });

  it('arms an installation and reads its objects with a person token', async () => {
    const installation = '0b9e3f7c-2a51-4c0e-9d7f-1f2e3d4c5b6a';
    const fetchFn = vi.fn(async (req: Request) => {
      expect(req.headers.get('authorization')).toBe('Bearer afs_owner');
      const path = new URL(req.url).pathname;
      if (path === `/api/v1/app-installations/${installation}/arm`) {
        expect(await req.json()).toEqual({});
        return json(200, { triggers: ['trigger:new_ticket'], activated_at: '2026-10-22T00:00:00Z' });
      }
      expect(path).toBe(`/api/v1/app-installations/${installation}/objects`);
      return json(200, { revision: 1, objects: [], parameters: {} });
    });
    const client = createAgentFlowClient({
      baseUrl: 'https://af.test/api/v1',
      auth: bearerAdapter(async () => 'afs_owner'),
      fetch: fetchFn,
    });
    const armed = await ok(client.POST('/app-installations/{installation_id}/arm', {
      params: { path: { installation_id: installation } },
      body: {},
    }));
    expect(armed.triggers).toEqual(['trigger:new_ticket']);
    const objects = await ok(client.GET('/app-installations/{installation_id}/objects', {
      params: { path: { installation_id: installation } },
    }));
    expect(objects.revision).toBe(1);
  });
});
