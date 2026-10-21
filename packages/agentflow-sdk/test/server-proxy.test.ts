import { gzipSync } from 'node:zlib';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ok } from '../src/errors.js';
import { createAgentFlowServer } from '../src/server/index.js';
import type { AgentFlowServer, AgentFlowServerOptions } from '../src/server/index.js';
import { MemorySessionStore } from '../src/server/sessions.js';
import { seal, unseal } from '../src/server/seal.js';
import type { SessionPayload } from '../src/server/routes/callback.js';
import { isUnsafeRawPath } from '../src/server/routes/proxy.js';
import { appKeys } from './support/app-keys.js';
import { startMockApi } from './support/mock-api.js';
import type { MockApi } from './support/mock-api.js';
import { startMockIdp } from './support/mock-idp.js';
import type { MockIdp } from './support/mock-idp.js';
import { signIn } from './support/sign-in.js';

const CLIENT_ID = 'case-desk-dev';
const RESOURCE = 'https://agentflow.example/api/v1/rest';
const REDIRECT_URI = 'https://app.test/agentflow/auth/callback';
const SESSION_KEY = Buffer.alloc(32, 7).toString('base64url');
const ORIGIN = 'https://app.test';
const RECORD_ID = '0190f0a8-1b2c-7d3e-8f40-123456789abc';
const ENTITY_ID = '0190f0a8-1b2c-7d3e-8f40-123456789abd';
const ATTACHMENT_ID = '0190f0a8-1b2c-7d3e-8f40-cba987654321';

function get(path: string, cookie?: string, headers: Record<string, string> = {}): Request {
  return new Request(`${ORIGIN}${path}`, { headers: { ...headers, ...(cookie ? { cookie } : {}) } });
}

function post(path: string, cookie: string | undefined, headers: Record<string, string>): Request {
  return new Request(`${ORIGIN}${path}`, {
    method: 'POST',
    headers: { ...headers, ...(cookie ? { cookie } : {}) },
  });
}

async function expectProblem(res: Response | undefined, status: number, type: string): Promise<void> {
  expect(res, type).toBeDefined();
  expect(res!.status, type).toBe(status);
  expect(res!.headers.get('content-type'), type).toBe('application/problem+json');
  const body = (await res!.json()) as { type: unknown; title: unknown; status: unknown };
  expect(body).toMatchObject({ type, status });
  expect(typeof body.title).toBe('string');
}

function sessionIdOf(cookie: string): string {
  return cookie.slice(cookie.indexOf('=') + 1);
}

function clearedSessionCookie(res: Response): string | undefined {
  return res.headers.getSetCookie().find((c) => c.startsWith('agentflow_session=;'));
}

async function until(condition: () => boolean, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`condition not met within ${timeoutMs} ms`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('session state, the proxy and clientFor', () => {
  let idp: MockIdp;
  let api: MockApi;
  let privateKey: CryptoKey;
  let server: AgentFlowServer;
  let sessions: MemorySessionStore;
  let reported: Array<{ error: unknown; route: string }>;

  function options(): AgentFlowServerOptions {
    return {
      issuer: idp.issuer,
      clientId: CLIENT_ID,
      privateKey,
      redirectUri: REDIRECT_URI,
      apiBaseUrl: `${api.baseUrl}/api/v1`,
      resource: RESOURCE,
      sessions,
      sessionKey: SESSION_KEY,
      secureCookies: false,
      allowInsecureRequests: true,
      onError: (error, context) => {
        reported.push({ error, route: context.route });
      },
    };
  }

  async function storedPayload(cookie: string): Promise<SessionPayload | undefined> {
    const record = await sessions.get(sessionIdOf(cookie));
    return record ? unseal<SessionPayload>(SESSION_KEY, record.sealed) : undefined;
  }

  async function expireAccessTokenSoon(cookie: string): Promise<void> {
    const id = sessionIdOf(cookie);
    const record = (await sessions.get(id))!;
    const payload = (await unseal<SessionPayload>(SESSION_KEY, record.sealed))!;
    await sessions.set(id, {
      ...record,
      sealed: await seal(SESSION_KEY, { ...payload, accessExpiresAt: Date.now() + 30_000 }),
    });
  }

  beforeAll(async () => {
    const keys = await appKeys();
    privateKey = keys.privateKey;
    idp = await startMockIdp({ clientId: CLIENT_ID, appPublicJwk: keys.publicJwk, resource: RESOURCE });
    api = await startMockApi();
  });

  afterAll(async () => {
    await idp.close();
    await api.close();
  });

  beforeEach(() => {
    api.callerStatus = 200;
    api.callerType = undefined;
    api.callerRaw = undefined;
    api.respond = undefined;
    reported = [];
    sessions = new MemorySessionStore();
    server = createAgentFlowServer(options());
  });

  describe('GET session', () => {
    it('reports signed-out and signed-in state without tokens', async () => {
      const signedOut = await server.handle(get('/agentflow/session'));
      expect(await signedOut!.json()).toEqual({ signedIn: false });

      const { cookie } = await signIn(server, idp);
      const res = await server.handle(get('/agentflow/session', cookie));
      expect(res!.status).toBe(200);
      expect(res!.headers.get('cache-control')).toBe('no-store');
      const body = await res!.json();
      expect(body).toMatchObject({ signedIn: true, caller: { app: { key: 'case-desk' } } });
      expect(JSON.stringify(body)).not.toMatch(/eyJ/);

      const payload = (await storedPayload(cookie))!;
      const text = JSON.stringify(body);
      for (const secret of [payload.accessToken, payload.refreshToken, payload.idToken]) {
        expect(text).not.toContain(secret);
      }
    });

    it('reads the session cookie by the name secureCookies selects', async () => {
      const secureServer = createAgentFlowServer({ ...options(), secureCookies: true });
      const { cookie } = await signIn(secureServer, idp);
      expect(cookie).toMatch(/^__Host-agentflow_session=/);

      const signedIn = await secureServer.handle(get('/agentflow/session', cookie));
      expect(await signedIn!.json()).toMatchObject({ signedIn: true });

      const renamed = cookie.replace(/^__Host-/, '');
      const signedOut = await secureServer.handle(get('/agentflow/session', renamed));
      expect(await signedOut!.json()).toEqual({ signedIn: false });
    });
  });

  describe('proxy', () => {
    it('forwards a published GET with the bearer and without cookies', async () => {
      const { cookie } = await signIn(server, idp);
      const res = await server.handle(get('/agentflow/api/work?limit=5', cookie));
      expect(res!.status).toBe(200);

      const last = api.requests.at(-1)!;
      expect(last).toMatchObject({ method: 'GET', path: '/api/v1/work', search: '?limit=5' });
      expect(last.authorization).toMatch(/^Bearer /);
      expect(last.authorization).toBe(`Bearer ${(await storedPayload(cookie))!.accessToken}`);
      expect(last.cookie).toBeNull();
    });

    it("forwards only allow-listed request headers and never the browser's own authorization", async () => {
      const { cookie } = await signIn(server, idp);
      const res = await server.handle(
        get(`/agentflow/api/entities/${ENTITY_ID}/records/${RECORD_ID}/step`, `${cookie}; other=1`, {
          accept: 'application/json',
          'if-none-match': '"v1"',
          authorization: 'Bearer forged-by-the-browser',
          'x-forwarded-host': 'evil.test',
          'x-custom': 'nope',
        }),
      );
      expect(res!.status).toBe(200);

      const last = api.requests.at(-1)!;
      expect(last.path).toBe(`/api/v1/entities/${ENTITY_ID}/records/${RECORD_ID}/step`);
      expect(last.headers['accept']).toBe('application/json');
      expect(last.headers['if-none-match']).toBe('"v1"');
      expect(last.authorization).toBe(`Bearer ${(await storedPayload(cookie))!.accessToken}`);
      expect(last.headers['x-forwarded-host']).toBeUndefined();
      expect(last.headers['x-custom']).toBeUndefined();
      expect(last.cookie).toBeNull();
    });

    it('forwards Last-Event-ID so an event stream resumes through the proxy', async () => {
      const { cookie } = await signIn(server, idp);
      await server.handle(get('/agentflow/api/events/stream', cookie, { 'last-event-id': '42' }));
      const last = api.requests.at(-1)!;
      expect(last.path).toBe('/api/v1/events/stream');
      expect(last.headers['last-event-id']).toBe('42');
    });

    it('refuses an unpublished operation without forwarding it', async () => {
      const { cookie } = await signIn(server, idp);
      const before = api.requests.length;

      await expectProblem(await server.handle(get('/agentflow/api/admin/apps', cookie)), 404, 'NOT_PUBLISHED');
      // A literal internal route must not be taken for a published template's parameter.
      await expectProblem(await server.handle(get('/agentflow/api/work/counts', cookie)), 404, 'NOT_PUBLISHED');
      await expectProblem(await server.handle(get('/agentflow/api/entities/e1/records/r1/step', cookie)), 404, 'NOT_PUBLISHED');
      await expectProblem(await server.handle(get('/agentflow/api', cookie)), 404, 'NOT_PUBLISHED');
      const wrongMethod = new Request(`${ORIGIN}/agentflow/api/work`, {
        method: 'DELETE',
        headers: { cookie, 'sec-fetch-site': 'same-origin' },
      });
      await expectProblem(await server.handle(wrongMethod), 404, 'NOT_PUBLISHED');

      expect(api.requests.length).toBe(before);
    });

    it('refuses_traversal_before_matching', async () => {
      const { cookie } = await signIn(server, idp);
      const before = api.requests.length;

      for (const p of [
        '/agentflow/api/../admin/apps',
        '/agentflow/api/%2e%2e/admin/apps',
        '/agentflow/api/work%2Fx',
        '/agentflow/api//caller',
        '/agentflow/api/work\\x',
        '/agentflow/api/work/..%2Fcaller',
        '/agentflow/api//evil.test/caller',
        '/agentflow/api/http://evil.test/api/v1/caller',
        '/agentflow/api/@evil.test/caller',
      ]) {
        const res = await server.handle(get(p, cookie));
        if (res) expect(res.status, p).toBeGreaterThanOrEqual(400);
        expect(api.requests.length, p).toBe(before);
      }

      // What survives WHATWG normalisation into the request URL is refused outright.
      await expectProblem(await server.handle(get('/agentflow/api/work%2Fx', cookie)), 400, 'BAD_PATH');
      await expectProblem(await server.handle(get('/agentflow/api//caller', cookie)), 400, 'BAD_PATH');
      expect(api.requests.length).toBe(before);
    });

    it('checks the raw path, so a request URL nothing normalised is refused too', async () => {
      for (const raw of [
        '/agentflow/api/../admin/apps',
        '/agentflow/api/..',
        '/agentflow/api/%2e%2e/admin/apps',
        '/agentflow/api/%2E%2E/admin/apps',
        '/agentflow/api/.%2e/admin/apps',
        '/agentflow/api/work%2Fx',
        '/agentflow/api/work%2fx',
        '/agentflow/api/work%5Cx',
        '/agentflow/api/work\\x',
        '/agentflow/api//caller',
      ]) {
        expect(isUnsafeRawPath(raw), raw).toBe(true);
      }
      expect(isUnsafeRawPath('/agentflow/api/caller')).toBe(false);
      expect(isUnsafeRawPath(`/agentflow/api/entities/${ENTITY_ID}/records/${RECORD_ID}/work/claim`)).toBe(false);

      // A host adapter that builds its request object without URL normalisation: the path routes
      // to the proxy once normalised (…/caller), but the raw path it would forward is traversal.
      const { cookie } = await signIn(server, idp);
      const before = api.requests.length;
      const unnormalised = {
        url: `${ORIGIN}/agentflow/api/work/../caller`,
        method: 'GET',
        headers: new Headers({ cookie }),
        body: null,
      } as unknown as Request;
      await expectProblem(await server.handle(unnormalised), 400, 'BAD_PATH');
      expect(api.requests.length).toBe(before);
    });

    it('requires same-origin on unsafe methods', async () => {
      const { cookie } = await signIn(server, idp);
      const claim = `/agentflow/api/entities/${ENTITY_ID}/records/${RECORD_ID}/work/claim`;
      const before = api.requests.length;

      await expectProblem(await server.handle(post(claim, cookie, { origin: 'https://evil.test' })), 403, 'CROSS_SITE_REQUEST');
      await expectProblem(await server.handle(post(claim, cookie, { 'sec-fetch-site': 'cross-site' })), 403, 'CROSS_SITE_REQUEST');
      await expectProblem(await server.handle(post(claim, cookie, { 'sec-fetch-site': 'same-site' })), 403, 'CROSS_SITE_REQUEST');
      await expectProblem(await server.handle(post(claim, cookie, {})), 403, 'CROSS_SITE_REQUEST');
      expect(api.requests.length).toBe(before);

      const viaFetchMetadata = await server.handle(post(claim, cookie, { 'sec-fetch-site': 'same-origin' }));
      expect(viaFetchMetadata!.status).toBe(200);
      expect(api.requests.at(-1)).toMatchObject({ method: 'POST', path: `/api/v1/entities/${ENTITY_ID}/records/${RECORD_ID}/work/claim`, idempotencyKey: null });

      const viaOrigin = await server.handle(post(claim, cookie, { origin: ORIGIN, 'idempotency-key': 'key-1' }));
      expect(viaOrigin!.status).toBe(200);
      expect(api.requests.at(-1)).toMatchObject({ method: 'POST', idempotencyKey: 'key-1' });
    });

    it('an_unknown_session_id_is_signed_out', async () => {
      const forgedId = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
      expect(forgedId).toHaveLength(43);
      const before = api.requests.length;
      const lookups = vi.spyOn(sessions, 'get');

      for (const cookie of [`agentflow_session=${forgedId}`, 'agentflow_session=../../x%00', 'agentflow_session=']) {
        const proxied = await server.handle(get('/agentflow/api/work', cookie));
        await expectProblem(proxied, 401, 'NOT_SIGNED_IN');

        const session = await server.handle(get('/agentflow/session', cookie));
        expect(session!.status, cookie).toBe(200);
        expect(await session!.json()).toEqual({ signedIn: false });
      }

      const forged = `agentflow_session=${forgedId}`;
      expect(clearedSessionCookie((await server.handle(get('/agentflow/api/work', forged)))!)).toMatch(/Max-Age=0/);
      expect(clearedSessionCookie((await server.handle(get('/agentflow/session', forged)))!)).toMatch(/Max-Age=0/);

      await expectProblem(await server.handle(get('/agentflow/api/work')), 401, 'NOT_SIGNED_IN');
      expect(api.requests.length).toBe(before);
      expect(reported).toEqual([]);
      // Only a well-formed id is ever looked up; anything else never reaches a host's store as a key.
      expect(lookups).toHaveBeenCalledWith(forgedId);
      expect(lookups.mock.calls.every(([id]) => id === forgedId)).toBe(true);
    });

    it('streams an upload through unbuffered', async () => {
      const { cookie } = await signIn(server, idp);
      const boundary = '----agentflow-test-boundary';
      const encoder = new TextEncoder();
      const head = encoder.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="big.bin"\r\n` +
          'Content-Type: application/octet-stream\r\n\r\n',
      );
      const tail = encoder.encode(`\r\n--${boundary}--\r\n`);
      const fileBytes = 5 * 1024 * 1024;
      const chunk = new Uint8Array(64 * 1024).fill(0x61);
      const total = head.byteLength + fileBytes + tail.byteLength;

      const before = api.requests.length;
      let sent = 0;
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(head);
        },
        async pull(controller) {
          if (sent < fileBytes) {
            controller.enqueue(chunk);
            sent += chunk.byteLength;
            return;
          }
          // The last bytes are held back until the upstream has seen the request begin. A proxy
          // that buffered the body before forwarding would never get that far, and this times out.
          await until(() => api.requests.length > before, 2_000);
          controller.enqueue(tail);
          controller.close();
        },
      });

      const init = {
        method: 'POST',
        headers: {
          cookie,
          'sec-fetch-site': 'same-origin',
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        body,
        duplex: 'half' as const,
      };
      const res = await server.handle(new Request(`${ORIGIN}/agentflow/api/attachments`, init));
      expect(res!.status).toBe(200);

      expect(api.requests.length).toBe(before + 1);
      expect(api.requests.at(-1)).toMatchObject({
        method: 'POST',
        path: '/api/v1/attachments',
        contentType: `multipart/form-data; boundary=${boundary}`,
        bodyBytes: total,
      });
    });

    it('drops set-cookie from upstream responses and passes problem bodies through', async () => {
      const { cookie } = await signIn(server, idp);
      const problemBody = { type: 'WORK_ALREADY_CLAIMED', title: 'Work already claimed', status: 409, request_id: 'req-9' };
      api.respond = () => {
        const headers = new Headers({ 'content-type': 'application/problem+json', 'x-request-id': 'req-9' });
        headers.append('set-cookie', 'upstream=1; Path=/');
        headers.append('set-cookie', 'agentflow_session=hijack; Path=/');
        return new Response(JSON.stringify(problemBody), { status: 409, statusText: 'Conflict', headers });
      };

      const res = await server.handle(post(`/agentflow/api/entities/${ENTITY_ID}/records/${RECORD_ID}/work/claim`, cookie, { 'sec-fetch-site': 'same-origin' }));
      expect(res!.status).toBe(409);
      expect(res!.statusText).toBe('Conflict');
      expect(res!.headers.getSetCookie()).toEqual([]);
      expect(res!.headers.get('x-request-id')).toBe('req-9');
      expect(res!.headers.get('content-type')).toBe('application/problem+json');
      expect(await res!.json()).toEqual(problemBody);
      // Hop-by-hop headers describe the proxy's own upstream connection, not the browser's.
      expect(res!.headers.get('connection')).toBeNull();
      expect(res!.headers.get('keep-alive')).toBeNull();
      expect(res!.headers.get('transfer-encoding')).toBeNull();
    });

    it('marks a forwarded response private unless the API set its own cache-control', async () => {
      const { cookie } = await signIn(server, idp);
      const plain = await server.handle(get('/agentflow/api/work', cookie));
      expect(plain!.headers.get('cache-control')).toBe('private');

      api.respond = () => Response.json({ items: [] }, { headers: { 'cache-control': 'no-store' } });
      const own = await server.handle(get('/agentflow/api/work', cookie));
      expect(own!.headers.get('cache-control')).toBe('no-store');
    });

    it('passes an upstream redirect through instead of following it with the bearer', async () => {
      const { cookie } = await signIn(server, idp);
      const elsewhere = `${api.baseUrl}/api/v1/elsewhere`;
      api.respond = (request) =>
        new URL(request.url).pathname.endsWith('/download')
          ? new Response(null, { status: 302, headers: { location: elsewhere } })
          : undefined;
      const before = api.requests.length;

      const res = await server.handle(get(`/agentflow/api/attachments/${ATTACHMENT_ID}/download`, cookie));
      expect(res!.status).toBe(302);
      expect(res!.headers.get('location')).toBe(elsewhere);
      expect(api.requests.length).toBe(before + 1);
    });

    it('hides a content-encoding that fetch already decoded', async () => {
      const { cookie } = await signIn(server, idp);
      const json = JSON.stringify({ items: [], note: 'x'.repeat(2048) });
      api.respond = () => {
        const gzipped = gzipSync(json);
        return new Response(gzipped, {
          headers: {
            'content-type': 'application/json',
            'content-encoding': 'gzip',
            'content-length': String(gzipped.byteLength),
          },
        });
      };

      const res = await server.handle(get('/agentflow/api/work', cookie));
      expect(res!.status).toBe(200);
      expect(api.requests.at(-1)!.headers['accept-encoding']).toBe('identity');
      expect(res!.headers.get('content-encoding')).toBeNull();
      expect(res!.headers.get('content-length')).toBeNull();
      expect(await res!.text()).toBe(json);
    });

    it('refreshes the access token with the same resource when under 60 s remain', async () => {
      const { cookie } = await signIn(server, idp);
      const original = (await storedPayload(cookie))!;
      await expireAccessTokenSoon(cookie);
      const refreshesBefore = idp.refreshCount();

      const res = await server.handle(get('/agentflow/api/work', cookie));
      expect(res!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshesBefore + 1);
      expect(idp.lastTokenRequest()!.get('grant_type')).toBe('refresh_token');
      expect(idp.lastTokenRequest()!.get('resource')).toBe(RESOURCE);

      const refreshed = (await storedPayload(cookie))!;
      expect(refreshed.refreshToken).not.toBe(original.refreshToken);
      expect(refreshed.accessExpiresAt).toBeGreaterThan(Date.now() + 60_000);
      expect(refreshed.idToken).toBe(original.idToken);
      expect(refreshed.caller).toEqual(original.caller);
      expect(api.requests.at(-1)!.authorization).toBe(`Bearer ${refreshed.accessToken}`);

      // The rotated refresh token was persisted: the provider has already retired the first one.
      await expireAccessTokenSoon(cookie);
      const again = await server.handle(get('/agentflow/api/work', cookie));
      expect(again!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshesBefore + 2);
    });

    it('a failed refresh ends the session and is reported', async () => {
      const { cookie } = await signIn(server, idp);
      await expireAccessTokenSoon(cookie);
      idp.failNextRefresh();
      const before = api.requests.length;

      const res = await server.handle(get('/agentflow/api/work', cookie));
      await expectProblem(res, 401, 'NOT_SIGNED_IN');
      expect(clearedSessionCookie(res!)).toMatch(/Max-Age=0/);
      expect(api.requests.length).toBe(before);
      expect(sessions.size()).toBe(0);
      expect(reported).toHaveLength(1);
      expect(reported[0]!.route).toBe('api');

      const session = await server.handle(get('/agentflow/session', cookie));
      expect(await session!.json()).toEqual({ signedIn: false });
    });

    it('ends the session on an upstream SESSION_REVOKED or TOKEN_EXPIRED and passes the 401 through', async () => {
      for (const type of ['SESSION_REVOKED', 'TOKEN_EXPIRED']) {
        const { cookie } = await signIn(server, idp);
        api.respond = () =>
          new Response(JSON.stringify({ type, title: type, status: 401 }), {
            status: 401,
            headers: { 'content-type': 'application/problem+json' },
          });

        const res = await server.handle(get('/agentflow/api/work', cookie));
        await expectProblem(res, 401, type);
        expect(clearedSessionCookie(res!), type).toMatch(/Max-Age=0/);
        expect(await sessions.get(sessionIdOf(cookie)), type).toBeUndefined();
      }
    });

    it('keeps the session on any other upstream 401', async () => {
      const { cookie } = await signIn(server, idp);
      api.respond = () =>
        new Response(JSON.stringify({ type: 'INVALID_TOKEN', title: 'Invalid token', status: 401 }), {
          status: 401,
          headers: { 'content-type': 'application/problem+json' },
        });

      const res = await server.handle(get('/agentflow/api/work', cookie));
      await expectProblem(res, 401, 'INVALID_TOKEN');
      expect(res!.headers.getSetCookie()).toEqual([]);
      expect(await sessions.get(sessionIdOf(cookie))).toBeDefined();
    });
  });

  describe('clientFor', () => {
    it('clientFor returns a client that calls the API as the session', async () => {
      const { cookie } = await signIn(server, idp);
      const c = await server.clientFor(get('/', cookie));
      expect(c).toBeDefined();

      const caller = (await ok(c!.GET('/caller'))) as unknown;
      expect(caller).toMatchObject({ app: { key: 'case-desk' } });
      expect(api.requests.at(-1)!.authorization).toBe(`Bearer ${(await storedPayload(cookie))!.accessToken}`);
    });

    it('returns undefined without a live session', async () => {
      expect(await server.clientFor(get('/'))).toBeUndefined();
      const forgedId = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
      expect(await server.clientFor(get('/', `agentflow_session=${forgedId}`))).toBeUndefined();
    });
  });
});
