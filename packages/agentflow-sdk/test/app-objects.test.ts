// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bearerAdapter, createAgentFlowClient, getAppObjects, type AppObjectsBody } from '../src/index.js';

const BASE = 'http://af.test/api/v1';

function object(logical_key: string, over: Partial<AppObjectsBody['objects'][number]> = {}) {
  return {
    logical_key, kind: logical_key.split(':')[0], parent: null, key: null, id: crypto.randomUUID(),
    state: 'live', customized: false, contract: null, contract_version: '1.0.0', source: 'own', feature: null, ...over,
  } as AppObjectsBody['objects'][number];
}

function server(initial: AppObjectsBody) {
  let body = initial;
  let calls = 0;
  let hold: Promise<void> | null = null;
  const fetch = vi.fn(async (req: Request) => {
    const path = new URL(req.url).pathname;
    if (path.endsWith('/app/objects')) {
      calls++;
      const answer = body;
      if (hold) await hold;
      return Response.json(answer, { headers: { 'agentflow-app-revision': String(answer.revision) } });
    }
    return Response.json({}, { headers: { 'agentflow-app-revision': String(body.revision) } });
  });
  return {
    fetch,
    calls: () => calls,
    set(next: AppObjectsBody) { body = next; },
    holdNext() { let release!: () => void; hold = new Promise((r) => (release = r)); return () => { hold = null; release(); }; },
  };
}

const client = (fetch: (r: Request) => Promise<Response>) =>
  createAgentFlowClient({ baseUrl: BASE, auth: bearerAdapter(async () => 't'), fetch });

describe('getAppObjects', () => {
  afterEach(() => vi.useRealTimers());

  it('is one cache per client', () => {
    const c = client(server({ objects: [], parameters: {}, revision: 1 }).fetch);
    expect(getAppObjects(c)).toBe(getAppObjects(c));
  });

  it('concurrent loads share one request', async () => {
    const s = server({ objects: [object('entity:ticket')], parameters: {}, revision: 1 });
    const app = getAppObjects(client(s.fetch));
    const [a, b] = await Promise.all([app.load(), app.load()]);
    expect(a).toBe(b);
    expect(s.calls()).toBe(1);
    await app.load();
    expect(s.calls()).toBe(1);
  });

  it('prefers the app\'s own object over a bound or exported one', async () => {
    const own = object('entity:case', { id: 'own-id' });
    const exported = object('entity:case', { id: 'exp-id', source: 'exported' });
    const app = getAppObjects(client(server({ objects: [exported, own], parameters: {}, revision: 1 }).fetch));
    await app.load();
    expect(app.id('entity:case')).toBe('own-id');
    expect(app.id('entity:case', { source: 'exported' })).toBe('exp-id');
  });

  it('an object that is off has no id and satisfies nothing', async () => {
    const off = object('workflow:open_case', { state: 'off', id: null });
    const app = getAppObjects(client(server({ objects: [off], parameters: {}, revision: 1 }).fetch));
    await app.load();
    expect(app.id('workflow:open_case')).toBeNull();
    expect(app.satisfies('workflow:open_case', '1.0.0')).toBe(false);
  });

  it('satisfies compares the contract version', async () => {
    const app = getAppObjects(client(server({
      objects: [object('workflow:a', { contract_version: '1.3.0' }), object('workflow:b', { contract_version: null })],
      parameters: {}, revision: 1,
    }).fetch));
    await app.load();
    expect(app.satisfies('workflow:a', '1.3.0')).toBe(true);
    expect(app.satisfies('workflow:a', '1.2.0')).toBe(true);
    expect(app.satisfies('workflow:a', '1.4.0')).toBe(false);
    expect(app.satisfies('workflow:b', '1.0.0')).toBe(false);
    expect(app.satisfies('workflow:absent', '1.0.0')).toBe(false);
    expect(() => app.satisfies('workflow:a', 'latest')).toThrow(TypeError);
  });

  it('a deprecated object still has its id', async () => {
    const app = getAppObjects(client(server({ objects: [object('entity:old', { state: 'deprecated', id: 'old-id' })], parameters: {}, revision: 1 }).fetch));
    await app.load();
    expect(app.id('entity:old')).toBe('old-id');
  });

  it('throws when read before the first load', () => {
    const app = getAppObjects(client(server({ objects: [], parameters: {}, revision: 1 }).fetch));
    expect(() => app.id('entity:ticket')).toThrow(/load/);
  });

  it('a greater revision on any response refetches and tells subscribers once', async () => {
    const s = server({ objects: [object('entity:ticket')], parameters: {}, revision: 1 });
    const c = client(s.fetch);
    const app = getAppObjects(c);
    const heard: number[] = [];
    app.subscribe((b) => heard.push(b.revision));
    await app.load();
    s.set({ objects: [object('entity:ticket'), object('entity:note')], parameters: {}, revision: 2 });
    await c.GET('/caller');
    await vi.waitFor(() => expect(app.current?.revision).toBe(2));
    expect(s.calls()).toBe(2);
    expect(heard).toEqual([1, 2]);
  });

  it('ignores a smaller or unreadable revision', async () => {
    const s = server({ objects: [], parameters: {}, revision: 5 });
    const c = client(s.fetch);
    const app = getAppObjects(c);
    app.subscribe(() => {});
    await app.load();
    s.set({ objects: [], parameters: {}, revision: 4 });
    await c.GET('/caller');
    s.fetch.mockImplementationOnce(async () => Response.json({}, { headers: { 'agentflow-app-revision': 'x' } }));
    await c.GET('/caller');
    await new Promise((r) => setTimeout(r, 10));
    expect(s.calls()).toBe(1);
  });

  it('without a subscriber a greater revision only marks the cache stale', async () => {
    const s = server({ objects: [], parameters: {}, revision: 1 });
    const c = client(s.fetch);
    const app = getAppObjects(c);
    await app.load();
    s.set({ objects: [], parameters: {}, revision: 2 });
    await c.GET('/caller');
    await new Promise((r) => setTimeout(r, 10));
    expect(s.calls()).toBe(1);
    expect((await app.load()).revision).toBe(2);
    expect(s.calls()).toBe(2);
  });

  it('a greater revision seen during a fetch refetches once more', async () => {
    const s = server({ objects: [], parameters: {}, revision: 1 });
    const c = client(s.fetch);
    const app = getAppObjects(c);
    app.subscribe(() => {});
    await app.load();
    const release = s.holdNext();
    const pending = app.refresh();             // answers revision 1, held
    await vi.waitFor(() => expect(s.calls()).toBe(2)); // the request has reached the server
    s.set({ objects: [], parameters: {}, revision: 3 });
    await c.GET('/caller');                    // sees 3 while the fetch is held
    release();
    await pending;
    await vi.waitFor(() => expect(app.current?.revision).toBe(3));
    expect(s.calls()).toBe(3);
  });

  it('a failed refresh keeps the last answer', async () => {
    const s = server({ objects: [object('entity:ticket')], parameters: {}, revision: 1 });
    const app = getAppObjects(client(s.fetch));
    await app.load();
    s.fetch.mockImplementationOnce(async () => Response.json({ type: 'INTERNAL_ERROR' }, { status: 500 }));
    await expect(app.refresh()).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
    expect(app.current?.revision).toBe(1);
    expect(app.id('entity:ticket')).not.toBeNull();
  });

  it('a failed first load is retried by the next load', async () => {
    const s = server({ objects: [object('entity:ticket')], parameters: {}, revision: 1 });
    const app = getAppObjects(client(s.fetch));
    s.fetch.mockImplementationOnce(async () => Response.json({ type: 'INTERNAL_ERROR' }, { status: 500 }));
    await expect(app.load()).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
    expect(app.current).toBeNull();
    await expect(app.load()).resolves.toMatchObject({ revision: 1 });
    expect(s.fetch).toHaveBeenCalledTimes(2);
  });

  it('an answer older than the cache is dropped and the cache returned', async () => {
    const s = server({ objects: [object('entity:ticket')], parameters: {}, revision: 5 });
    const app = getAppObjects(client(s.fetch));
    const first = await app.load();
    s.set({ objects: [], parameters: {}, revision: 4 });
    const answer = await app.refresh();
    expect(answer).toBe(first);
    expect(answer).toBe(app.current);
    expect(answer.revision).toBe(5);
  });

  it('a client whose GET throws synchronously does not wedge the next load', async () => {
    let fail = true;
    const body: AppObjectsBody = { objects: [], parameters: {}, revision: 1 };
    const fake = {
      GET: () => {
        if (fail) throw new Error('sync boom');
        return Promise.resolve({ data: body, error: undefined, response: new Response(null, { status: 200 }) });
      },
    } as unknown as Parameters<typeof getAppObjects>[0];
    const app = getAppObjects(fake);
    await expect(app.load()).rejects.toThrow('sync boom');
    fail = false;
    await expect(app.load()).resolves.toBe(body);
  });

  it('rechecks when the page comes back into view, at most every recheckAfterMs', async () => {
    vi.useFakeTimers();
    const s = server({ objects: [], parameters: {}, revision: 1 });
    const app = getAppObjects(client(s.fetch), { recheckAfterMs: 30_000 });
    const off = app.subscribe(() => {});
    await app.load();
    const visible = () => document.dispatchEvent(new Event('visibilitychange'));
    visible();
    expect(s.calls()).toBe(1);
    vi.advanceTimersByTime(30_000);
    visible();
    await vi.waitFor(() => expect(s.calls()).toBe(2));
    off();
    vi.advanceTimersByTime(30_000);
    visible();
    expect(s.calls()).toBe(2);
  });

  it('a failing refetch after a greater revision is tried once, not in a loop', async () => {
    const s = server({ objects: [], parameters: {}, revision: 1 });
    const c = client(s.fetch);
    const app = getAppObjects(c);
    app.subscribe(() => {});
    await app.load();
    s.set({ objects: [], parameters: {}, revision: 2 });
    s.fetch.mockImplementation(async (req: Request) => {
      if (new URL(req.url).pathname.endsWith('/app/objects')) return Response.json({ type: 'INTERNAL_ERROR' }, { status: 500 });
      return Response.json({}, { headers: { 'agentflow-app-revision': '2' } });
    });
    await c.GET('/caller');
    await new Promise((r) => setTimeout(r, 50));
    const failed = s.fetch.mock.calls.filter(([r]) => new URL(r.url).pathname.endsWith('/app/objects')).length;
    expect(failed).toBe(1 + 2); // the load, the trigger, one follow-up
    expect(app.current?.revision).toBe(1);
  });

  it('a header ahead of what the server answers gets one follow-up, not a loop', async () => {
    const s = server({ objects: [], parameters: {}, revision: 1 });
    const c = client(s.fetch);
    const app = getAppObjects(c);
    app.subscribe(() => {});
    await app.load();
    s.fetch.mockImplementation(async (req: Request) => {
      const objects = new URL(req.url).pathname.endsWith('/app/objects');
      return Response.json(objects ? { objects: [], parameters: {}, revision: 4 } : {}, {
        headers: { 'agentflow-app-revision': objects ? '4' : '5' },
      });
    });
    await c.GET('/caller');
    await new Promise((r) => setTimeout(r, 50));
    const fetches = s.fetch.mock.calls.filter(([r]) => new URL(r.url).pathname.endsWith('/app/objects')).length;
    expect(fetches).toBe(1 + 2);
    expect(app.current?.revision).toBe(4);
  });

  it('a subscriber that throws does not break the fetch or the other subscribers', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const s = server({ objects: [], parameters: {}, revision: 1 });
    const app = getAppObjects(client(s.fetch));
    const heard: number[] = [];
    app.subscribe(() => { throw new Error('boom'); });
    app.subscribe((b) => heard.push(b.revision));
    await expect(app.load()).resolves.toMatchObject({ revision: 1 });
    expect(heard).toEqual([1]);
    err.mockRestore();
  });
});
