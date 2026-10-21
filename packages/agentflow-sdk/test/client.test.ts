import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentFlowError, bearerAdapter, createAgentFlowClient, ok, proxyAdapter } from '../src/index.js';

const ENTITY_ID = '0190f0a8-1b2c-7d3e-8f40-123456789abd';

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/json', ...headers },
  });

describe('createAgentFlowClient', () => {
  it('sends the bearer token and returns typed data', async () => {
    const fetchFn = vi.fn(async (req: Request) => {
      expect(req.headers.get('authorization')).toBe('Bearer t1');
      expect(new URL(req.url).pathname).toBe('/api/v1/caller');
      return json(200, { kind: 'user', id: 'u1' });
    });
    const client = createAgentFlowClient({
      baseUrl: 'https://af.test/api/v1',
      auth: bearerAdapter(async () => 't1'),
      fetch: fetchFn,
    });
    const caller = await ok(client.GET('/caller'));
    expect(caller.id).toBe('u1');
  });

  it('calls the global fetch without a receiver, as browsers require', async () => {
    const browserFetch = vi.fn(function (this: unknown, _req: Request) {
      if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(json(200, { kind: 'user', id: 'u1' }));
    });
    vi.stubGlobal('fetch', browserFetch);
    try {
      const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: proxyAdapter() });
      expect((await ok(client.GET('/caller'))).id).toBe('u1');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('adds one Idempotency-Key to an idempotent operation and reuses it on retry', async () => {
    const keys: (string | null)[] = [];
    const fetchFn = vi.fn(async (req: Request) => {
      keys.push(req.headers.get('idempotency-key'));
      return keys.length === 1
        ? json(503, { type: 'SERVICE_UNAVAILABLE', title: 'x', status: 503, request_id: 'r' }, { 'retry-after': '0' })
        : json(200, { id: 't' });
    });
    const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: proxyAdapter(), fetch: fetchFn });
    await ok(client.POST('/entities/{entity_id}/records', { params: { path: { entity_id: ENTITY_ID } }, body: {} }));
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  it('does not retry a non-idempotent write', async () => {
    const fetchFn = vi.fn(async () =>
      json(503, { type: 'SERVICE_UNAVAILABLE', title: 'x', status: 503, request_id: 'r' }, { 'retry-after': '0' }));
    const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: proxyAdapter(), fetch: fetchFn });
    await expect(
      ok(client.POST('/entities/{entity_id}/records/query', { params: { path: { entity_id: ENTITY_ID } }, body: {} })),
    ).rejects.toBeInstanceOf(AgentFlowError);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('turns a problem body into AgentFlowError with code and request id', async () => {
    const fetchFn = vi.fn(async () =>
      json(403, { type: 'APP_NOT_ASSIGNED', title: 'Forbidden', status: 403, request_id: 'req-1', detail: 'no' }));
    const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: proxyAdapter(), fetch: fetchFn });
    const err = await ok(client.GET('/caller')).catch((e) => e);
    expect(err).toMatchObject({ status: 403, code: 'APP_NOT_ASSIGNED', requestId: 'req-1', detail: 'no' });
  });

  describe('the wait before a retry', () => {
    // Only setTimeout is faked: the retry's wait is the one timer, and Response bodies still settle.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout'] });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    /** Yields to the real event loop until the client has scheduled its wait. */
    async function untilRetryScheduled(): Promise<void> {
      for (let i = 0; i < 100 && vi.getTimerCount() === 0; i++) await new Promise((r) => setImmediate(r));
      expect(vi.getTimerCount()).toBe(1);
    }

    const cases: Array<[string, string | undefined, number]> = [
      ['absent', undefined, 1000],
      ['empty', '', 1000],
      ['an HTTP date', 'Wed, 21 Oct 2015 07:28:00 GMT', 1000],
      ['2 seconds', '2', 2000],
      ['over the 30 s cap', '120', 30_000],
    ];
    for (const [label, retryAfter, waitMs] of cases) {
      it(`waits ${waitMs} ms when Retry-After is ${label}`, async () => {
        const fetchFn = vi.fn(async () =>
          fetchFn.mock.calls.length === 1
            ? json(
                503,
                { type: 'SERVICE_UNAVAILABLE', title: 'x', status: 503, request_id: 'r' },
                retryAfter === undefined ? {} : { 'retry-after': retryAfter },
              )
            : json(200, { kind: 'user', id: 'u1' }));
        const client = createAgentFlowClient({ baseUrl: 'https://af.test/api/v1', auth: proxyAdapter(), fetch: fetchFn });

        const pending = ok(client.GET('/caller'));
        await untilRetryScheduled();
        vi.advanceTimersByTime(waitMs - 1);
        expect(vi.getTimerCount()).toBe(1);
        vi.advanceTimersByTime(1);
        expect(vi.getTimerCount()).toBe(0);

        await expect(pending).resolves.toMatchObject({ id: 'u1' });
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('gives up after maxRetries on 429', async () => {
    const fetchFn = vi.fn(async () =>
      json(429, { type: 'RATE_LIMITED', title: 'x', status: 429, request_id: 'r' }, { 'retry-after': '0' }));
    const client = createAgentFlowClient({
      baseUrl: 'https://af.test/api/v1', auth: proxyAdapter(), fetch: fetchFn, maxRetries: 2,
    });
    await expect(ok(client.GET('/caller'))).rejects.toMatchObject({ status: 429 });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });
});
