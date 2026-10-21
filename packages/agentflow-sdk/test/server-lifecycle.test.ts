import { SignJWT, generateKeyPair } from 'jose';
import * as client from 'openid-client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { isRefusal } from '../src/server/access.js';
import { IdpUnavailable, NotSignedIn, createAgentFlowServer, describeError } from '../src/server/index.js';
import type { AgentFlowServer, AgentFlowServerOptions } from '../src/server/index.js';
import { MemorySessionStore } from '../src/server/sessions.js';
import type { SessionRecord, SessionStore } from '../src/server/sessions.js';
import { unseal } from '../src/server/seal.js';
import type { SessionPayload } from '../src/server/routes/callback.js';
import { appKeys } from './support/app-keys.js';
import { startMockApi } from './support/mock-api.js';
import type { MockApi } from './support/mock-api.js';
import { startMockIdp } from './support/mock-idp.js';
import type { IdpOutage, MockIdp, RefreshFailure } from './support/mock-idp.js';
import { signIn } from './support/sign-in.js';

const CLIENT_ID = 'case-desk-dev';
const RESOURCE = 'https://agentflow.example/api/v1/rest';
const REDIRECT_URI = 'https://app.test/agentflow/auth/callback';
const POST_LOGOUT_REDIRECT_URI = 'https://app.test/signed-out';
const SESSION_KEY = Buffer.alloc(32, 7).toString('base64url');
const ORIGIN = 'https://app.test';
const BACKCHANNEL_LOGOUT_EVENT = 'http://schemas.openid.net/event/backchannel-logout';
const SAME_ORIGIN = { 'sec-fetch-site': 'same-origin' };
/** Under 60 s of a 600 s access token left, so the next use refreshes it. */
const NEAR_EXPIRY_MS = 550_000;

function get(path: string, cookie?: string): Request {
  return new Request(`${ORIGIN}${path}`, { headers: cookie ? { cookie } : {} });
}

function logout(cookie: string | undefined, headers: Record<string, string>, method = 'POST'): Request {
  return new Request(`${ORIGIN}/agentflow/auth/logout`, { method, headers: { ...headers, ...(cookie ? { cookie } : {}) } });
}

function backchannel(
  body: string | ReadableStream<Uint8Array>,
  contentType = 'application/x-www-form-urlencoded',
  headers: Record<string, string> = {},
): Request {
  return new Request(`${ORIGIN}/agentflow/auth/backchannel-logout`, {
    method: 'POST',
    headers: { 'content-type': contentType, ...headers },
    body,
    ...(typeof body === 'string' ? {} : { duplex: 'half' }),
  } as RequestInit);
}

/** `text` as a stream of `chunkSize`-byte chunks, with no length known up front. */
function chunked(text: string, chunkSize: number): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.byteLength) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.slice(offset, offset + chunkSize));
      offset += chunkSize;
    },
  });
}

function form(logoutToken: string): string {
  return new URLSearchParams({ logout_token: logoutToken }).toString();
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

/** Moves the faked clock forward; only `Date` is faked, so the mock servers keep running. */
function advance(ms: number): void {
  vi.setSystemTime(Date.now() + ms);
}

/** Polls on the monotonic clock: `Date` is frozen in these tests. */
async function until(condition: () => boolean, timeoutMs: number): Promise<void> {
  const deadline = performance.now() + timeoutMs;
  while (!condition()) {
    if (performance.now() > deadline) throw new Error(`condition not met within ${timeoutMs} ms`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

/** A host store that keeps a record until it is deleted and never looks at `expiresAt`. */
class NaiveSessionStore implements SessionStore {
  readonly records = new Map<string, SessionRecord>();

  async get(id: string): Promise<SessionRecord | undefined> {
    return this.records.get(id);
  }

  async set(id: string, r: SessionRecord): Promise<void> {
    this.records.set(id, r);
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  async deleteBySid(sid: string): Promise<number> {
    let count = 0;
    for (const [id, r] of this.records) {
      if (r.sid !== sid) continue;
      this.records.delete(id);
      count += 1;
    }
    return count;
  }
}

/** A memory store whose next `get` reads the record at once but answers only when released — a
 * store round trip that outlives someone else's refresh. */
class LaggingSessionStore extends MemorySessionStore {
  waiting = false;
  private lag: Promise<void> | undefined;

  lagNextGet(): () => void {
    let release!: () => void;
    this.lag = new Promise<void>((resolve) => {
      release = resolve;
    });
    return release;
  }

  override async get(id: string): Promise<SessionRecord | undefined> {
    const record = await super.get(id);
    const lag = this.lag;
    if (lag) {
      this.lag = undefined;
      this.waiting = true;
      await lag;
      this.waiting = false;
    }
    return record;
  }
}

describe('refresh, sign-out and back-channel logout', () => {
  let idp: MockIdp;
  let api: MockApi;
  let privateKey: CryptoKey;
  let server: AgentFlowServer;
  let sessions: MemorySessionStore;
  let reported: Array<{ error: unknown; route: string; summary: string }>;

  function options(): AgentFlowServerOptions {
    return {
      issuer: idp.issuer,
      clientId: CLIENT_ID,
      privateKey,
      redirectUri: REDIRECT_URI,
      postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
      apiBaseUrl: `${api.baseUrl}/api/v1`,
      resource: RESOURCE,
      sessions,
      sessionKey: SESSION_KEY,
      secureCookies: false,
      allowInsecureRequests: true,
      onError: (error, context) => {
        reported.push({ error, route: context.route, summary: context.summary });
      },
    };
  }

  async function storedPayload(cookie: string): Promise<SessionPayload | undefined> {
    const record = await sessions.get(sessionIdOf(cookie));
    return record ? unseal<SessionPayload>(SESSION_KEY, record.sealed) : undefined;
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
    vi.useFakeTimers({ toFake: ['Date'] });
    idp.outage = undefined;
    idp.omitExpiresIn = false;
    idp.endSessionSupported = true;
    idp.idTokenSigningAlgs = ['RS256'];
    idp.user.sid = 'sess-1';
    api.respond = undefined;
    reported = [];
    sessions = new MemorySessionStore();
    server = createAgentFlowServer(options());
  });

  afterEach(() => {
    vi.useRealTimers();
    idp.outage = undefined;
  });

  describe('refresh', () => {
    it('refreshes with the same resource when under 60 s remain', async () => {
      const { cookie } = await signIn(server, idp);
      const original = (await storedPayload(cookie))!;
      advance(NEAR_EXPIRY_MS);
      const refreshes = idp.refreshCount();

      const res = await server.handle(get('/agentflow/api/work', cookie));
      expect(res!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes + 1);
      expect(idp.lastTokenRequest()!.get('grant_type')).toBe('refresh_token');
      expect(idp.lastTokenRequest()!.get('refresh_token')).toBe(original.refreshToken);
      expect(idp.lastTokenRequest()!.get('resource')).toBe(RESOURCE);

      const refreshed = (await storedPayload(cookie))!;
      expect(refreshed.accessExpiresAt).toBe(Date.now() + 600_000);
      expect(refreshed.idToken).toBe(original.idToken);
      expect(api.requests.at(-1)!.authorization).toBe(`Bearer ${refreshed.accessToken}`);
    });

    it('concurrent_requests_share_one_refresh', async () => {
      const { cookie } = await signIn(server, idp);
      advance(NEAR_EXPIRY_MS);
      const refreshes = idp.refreshCount();
      const before = api.requests.length;

      const results = await Promise.all(
        Array.from({ length: 5 }, () => server.handle(get('/agentflow/api/work', cookie))),
      );
      expect(results.map((r) => r!.status)).toEqual([200, 200, 200, 200, 200]);
      expect(idp.refreshCount()).toBe(refreshes + 1);

      const bearer = `Bearer ${(await storedPayload(cookie))!.accessToken}`;
      expect(api.requests.slice(before).map((r) => r.authorization)).toEqual(Array(5).fill(bearer));

      // Once the shared refresh has settled, the next request uses what it stored.
      expect((await server.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes + 1);
    });

    it('a failed refresh ends the session', async () => {
      const { cookie } = await signIn(server, idp);
      advance(NEAR_EXPIRY_MS);
      idp.failNextRefresh();

      const res = await server.handle(get('/agentflow/api/work', cookie));
      await expectProblem(res, 401, 'NOT_SIGNED_IN');
      expect(clearedSessionCookie(res!)).toMatch(/Max-Age=0/);
      expect(sessions.size()).toBe(0);
      expect(reported).toHaveLength(1);
      expect(reported[0]!.route).toBe('api');
      expect((reported[0]!.error as Error).cause).toBeInstanceOf(client.ResponseBodyError);

      const session = await server.handle(get('/agentflow/session', cookie));
      expect(await session!.json()).toEqual({ signedIn: false });
    });

    it('keeps the session and answers 503 IDP_UNAVAILABLE while the provider is down', async () => {
      const unexpectedStatus = (cause: unknown) => expect(cause).toMatchObject({ code: 'OAUTH_RESPONSE_IS_NOT_CONFORM' });
      const cases: Array<[IdpOutage, (cause: unknown) => void]> = [
        ['http-500', unexpectedStatus],
        // An OAuth-style body on a 5xx is still an outage, not a verdict on the refresh token.
        ['oauth-500', unexpectedStatus],
        ['drop', (cause) => expect(cause).toBeInstanceOf(TypeError)],
      ];
      for (const [outage, expectCause] of cases) {
        reported = [];
        const { cookie } = await signIn(server, idp);
        const id = sessionIdOf(cookie);
        advance(NEAR_EXPIRY_MS);
        const sealedBefore = (await sessions.get(id))!.sealed;
        const before = api.requests.length;

        idp.outage = outage;
        const res = await server.handle(get('/agentflow/api/work', cookie));
        await expectProblem(res, 503, 'IDP_UNAVAILABLE');
        // The core client waits this long before retrying, instead of hammering a provider that is down.
        expect(res!.headers.get('retry-after'), outage).toBe('5');
        expect(res!.headers.getSetCookie(), outage).toEqual([]);
        expect((await sessions.get(id))?.sealed, outage).toBe(sealedBefore);
        expect(api.requests.length, outage).toBe(before);
        expect(reported, outage).toHaveLength(1);
        expect(reported[0]!.route).toBe('api');
        expect(reported[0]!.error).toBeInstanceOf(IdpUnavailable);
        expectCause((reported[0]!.error as Error).cause);

        idp.outage = undefined;
        const refreshes = idp.refreshCount();
        const recovered = await server.handle(get('/agentflow/api/work', cookie));
        expect(recovered!.status, outage).toBe(200);
        expect(idp.refreshCount(), outage).toBe(refreshes + 1);
        expect(api.requests.at(-1)!.authorization).toBe(`Bearer ${(await storedPayload(cookie))!.accessToken}`);
      }
    });

    it('keeps the session and answers 503 when the provider answers an OAuth error other than invalid_grant', async () => {
      const cases: Array<[string, RefreshFailure, new (...args: never[]) => Error]> = [
        ['a 429 rate limit', { status: 429, error: 'rate_limited' }, client.ResponseBodyError],
        ['invalid_client in a 400 body', { status: 400, error: 'invalid_client' }, client.ResponseBodyError],
        ['invalid_client in a 401 body', { status: 401, error: 'invalid_client' }, client.ResponseBodyError],
        [
          'invalid_client with a challenge',
          { status: 401, error: 'invalid_client', headers: { 'www-authenticate': 'Basic realm="idp"' } },
          client.WWWAuthenticateChallengeError,
        ],
        ['invalid_target', { status: 400, error: 'invalid_target' }, client.ResponseBodyError],
      ];
      for (const [why, failure, causeType] of cases) {
        reported = [];
        const { cookie } = await signIn(server, idp);
        const id = sessionIdOf(cookie);
        advance(NEAR_EXPIRY_MS);
        const sealedBefore = (await sessions.get(id))!.sealed;
        const before = api.requests.length;

        idp.failNextRefresh(failure);
        const res = await server.handle(get('/agentflow/api/work', cookie));
        await expectProblem(res, 503, 'IDP_UNAVAILABLE');
        expect(res!.headers.get('retry-after'), why).toBe('5');
        expect(res!.headers.getSetCookie(), why).toEqual([]);
        expect((await sessions.get(id))?.sealed, why).toBe(sealedBefore);
        expect(api.requests.length, why).toBe(before);
        expect(reported, why).toHaveLength(1);
        expect(reported[0]!.error, why).toBeInstanceOf(IdpUnavailable);
        expect((reported[0]!.error as Error).cause, why).toBeInstanceOf(causeType);

        const refreshes = idp.refreshCount();
        expect((await server.handle(get('/agentflow/api/work', cookie)))!.status, why).toBe(200);
        expect(idp.refreshCount(), why).toBe(refreshes + 1);
      }
    });

    it('only invalid_grant counts as the provider refusing a refresh', () => {
      const answer = (status: number, error: string) =>
        new client.ResponseBodyError('the provider answered an error', { cause: { error }, response: new Response(null, { status }) });
      expect(isRefusal(answer(400, 'invalid_grant'))).toBe(true);
      expect(isRefusal(answer(400, 'invalid_client'))).toBe(false);
      expect(isRefusal(answer(401, 'invalid_client'))).toBe(false);
      expect(isRefusal(answer(400, 'invalid_target'))).toBe(false);
      expect(isRefusal(answer(429, 'rate_limited'))).toBe(false);
      expect(isRefusal(answer(500, 'server_error'))).toBe(false);
      expect(isRefusal(new TypeError('fetch failed'))).toBe(false);
    });

    it('keeps the session when discovery fails during a refresh', async () => {
      const { cookie } = await signIn(server, idp);
      // Shares the session store but has not discovered the provider yet.
      const fresh = createAgentFlowServer(options());
      advance(NEAR_EXPIRY_MS);

      idp.outage = 'http-500';
      await expectProblem(await fresh.handle(get('/agentflow/api/work', cookie)), 503, 'IDP_UNAVAILABLE');
      expect(await sessions.get(sessionIdOf(cookie))).toBeDefined();
      expect(reported.map((r) => r.route)).toEqual(['api']);

      idp.outage = undefined;
      expect((await fresh.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
    });

    it('a request that read the session before a refresh landed does not refresh it again', async () => {
      const store = new LaggingSessionStore();
      const lagging = createAgentFlowServer({ ...options(), sessions: store });
      const { cookie } = await signIn(lagging, idp);
      advance(NEAR_EXPIRY_MS);
      const refreshes = idp.refreshCount();

      // Reads the near-expiry record, then stalls while another request refreshes and stores it.
      const release = store.lagNextGet();
      const late = lagging.handle(get('/agentflow/api/work', cookie));
      await until(() => store.waiting, 2_000);
      expect((await lagging.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes + 1);

      // Refreshing again from the stale read would spend a refresh token the provider has rotated.
      release();
      expect((await late)!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes + 1);
      expect(await store.get(sessionIdOf(cookie))).toBeDefined();
    });

    /**
     * Two replicas share the store, each with its own single-flight. Replica B sends its refresh
     * grant and the provider holds it; replica A refreshes the same session meanwhile, spending the
     * same refresh token first and storing the rotated one. `whileHeld` runs before B's grant is
     * answered — with `invalid_grant`, since the provider refuses a rotated-away refresh token.
     */
    async function loseRefreshRaceToAnotherReplica(whileHeld: () => void = () => {}) {
      const replicaA = createAgentFlowServer(options());
      const replicaB = createAgentFlowServer(options());
      const { cookie } = await signIn(replicaA, idp);
      advance(NEAR_EXPIRY_MS);
      const refreshes = idp.refreshCount();

      const release = idp.holdNextRefresh();
      let pending: Promise<Response | undefined>;
      try {
        pending = replicaB.handle(get('/agentflow/api/work', cookie));
        await until(() => idp.refreshCount() > refreshes, 2_000);
        expect((await replicaA.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
        expect(idp.refreshCount()).toBe(refreshes + 2);
        whileHeld();
      } finally {
        release();
      }
      const winner = (await storedPayload(cookie))!;
      return { cookie, refreshes, winner, res: await pending };
    }

    it('a refresh that lost the race to another replica uses the tokens that replica stored', async () => {
      const { cookie, refreshes, winner, res } = await loseRefreshRaceToAnotherReplica();

      expect(res!.status).toBe(200);
      expect(api.requests.at(-1)!.authorization).toBe(`Bearer ${winner.accessToken}`);
      expect(idp.refreshCount()).toBe(refreshes + 2);
      expect(await storedPayload(cookie)).toEqual(winner);
      expect(reported).toEqual([]);
    });

    it('a refresh that lost the race refreshes again when the stored tokens are near expiry too', async () => {
      const { cookie, refreshes, winner, res } = await loseRefreshRaceToAnotherReplica(() => advance(NEAR_EXPIRY_MS));

      expect(res!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes + 3);
      expect(idp.lastTokenRequest()!.get('refresh_token')).toBe(winner.refreshToken);
      const stored = (await storedPayload(cookie))!;
      expect(stored.accessToken).not.toBe(winner.accessToken);
      expect(stored.accessExpiresAt).toBe(Date.now() + 600_000);
      expect(api.requests.at(-1)!.authorization).toBe(`Bearer ${stored.accessToken}`);
      expect(reported).toEqual([]);
    });

    it('a session ended while its refresh is in flight stays ended', async () => {
      for (const end of ['sign-out', 'back-channel logout'] as const) {
        const { cookie } = await signIn(server, idp);
        advance(NEAR_EXPIRY_MS);
        const refreshes = idp.refreshCount();
        const release = idp.holdRefreshes();
        let pending: Promise<Response | undefined>;
        try {
          pending = server.handle(get('/agentflow/api/work', cookie));
          await until(() => idp.refreshCount() > refreshes, 2_000);
          if (end === 'sign-out') {
            expect((await server.handle(logout(cookie, SAME_ORIGIN)))!.status).toBe(303);
          } else {
            expect((await server.handle(backchannel(form(await idp.logoutToken('sess-1')))))!.status).toBe(200);
          }
        } finally {
          release();
        }

        // Sign-out revoked the held grant's refresh token, so that grant got invalid_grant. Either
        // way the session was ended on purpose: nothing to report.
        await expectProblem(await pending, 401, 'NOT_SIGNED_IN');
        expect(await sessions.get(sessionIdOf(cookie)), end).toBeUndefined();
        expect(sessions.size(), end).toBe(0);
        expect(reported, end).toEqual([]);
      }
    });

    it('an expired session is signed out even when the store ignores expiry', async () => {
      const store = new NaiveSessionStore();
      const naive = createAgentFlowServer({ ...options(), sessions: store, sessionTtlSeconds: 3_600 });
      const first = await signIn(naive, idp);
      const second = await signIn(naive, idp);

      advance(3_600_000 - 1);
      expect(await (await naive.handle(get('/agentflow/session', second.cookie)))!.json()).toMatchObject({ signedIn: true });

      advance(1);
      const refreshes = idp.refreshCount();
      const before = api.requests.length;
      await expectProblem(await naive.handle(get('/agentflow/api/work', first.cookie)), 401, 'NOT_SIGNED_IN');
      expect(idp.refreshCount()).toBe(refreshes);
      expect(api.requests.length).toBe(before);
      expect(store.records.has(sessionIdOf(first.cookie))).toBe(false);

      const session = await naive.handle(get('/agentflow/session', second.cookie));
      expect(await session!.json()).toEqual({ signedIn: false });
      expect(clearedSessionCookie(session!)).toMatch(/Max-Age=0/);
      expect(store.records.size).toBe(0);
    });

    it('a token response without expires_in is good for 300 s, not 0', async () => {
      idp.omitExpiresIn = true;
      const { cookie } = await signIn(server, idp);
      expect((await storedPayload(cookie))!.accessExpiresAt).toBe(Date.now() + 300_000);

      const refreshes = idp.refreshCount();
      expect((await server.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes);

      advance(240_001);
      expect((await server.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
      expect(idp.refreshCount()).toBe(refreshes + 1);
      expect((await storedPayload(cookie))!.accessExpiresAt).toBe(Date.now() + 300_000);
    });
  });

  describe('sign-out', () => {
    it('sign-out revokes, deletes the session, clears the cookie and goes to end_session', async () => {
      const { cookie } = await signIn(server, idp);
      const stored = (await storedPayload(cookie))!;

      const res = await server.handle(logout(cookie, SAME_ORIGIN));
      expect(res!.status).toBe(303);
      const location = new URL(res!.headers.get('location')!);
      expect(`${location.origin}${location.pathname}`).toBe(`${idp.issuer}/end_session`);
      expect(location.searchParams.get('id_token_hint')).toBe(stored.idToken);
      expect(location.searchParams.get('post_logout_redirect_uri')).toBe(POST_LOGOUT_REDIRECT_URI);
      expect(location.searchParams.get('client_id')).toBe(CLIENT_ID);
      expect(idp.revoked).toContain(stored.refreshToken);
      expect(clearedSessionCookie(res!)).toMatch(/Max-Age=0/);
      expect(await sessions.get(sessionIdOf(cookie))).toBeUndefined();

      const session = await server.handle(get('/agentflow/session', cookie));
      expect(await session!.json()).toEqual({ signedIn: false });
      expect(reported).toEqual([]);
    });

    it('sign-out after a refresh keeps the original ID token hint and revokes the rotated refresh token', async () => {
      const { cookie } = await signIn(server, idp);
      const original = (await storedPayload(cookie))!;
      advance(NEAR_EXPIRY_MS);
      expect((await server.handle(get('/agentflow/api/work', cookie)))!.status).toBe(200);
      const rotated = (await storedPayload(cookie))!.refreshToken;
      expect(rotated).not.toBe(original.refreshToken);

      const res = await server.handle(logout(cookie, SAME_ORIGIN));
      expect(new URL(res!.headers.get('location')!).searchParams.get('id_token_hint')).toBe(original.idToken);
      expect(idp.revoked).toContain(rotated);
    });

    it('sign-out refuses a cross-site POST', async () => {
      const { cookie } = await signIn(server, idp);
      const revokedBefore = idp.revoked.length;

      const crossSite: Array<Record<string, string>> = [
        { origin: 'https://evil.test' },
        { 'sec-fetch-site': 'cross-site' },
        { 'sec-fetch-site': 'same-site' },
        {},
      ];
      for (const headers of crossSite) {
        const res = await server.handle(logout(cookie, headers));
        await expectProblem(res, 403, 'CROSS_SITE_REQUEST');
        expect(res!.headers.getSetCookie()).toEqual([]);
      }
      // Sign-out is POST only: a GET, which a cross-site link or image can make, is not handled.
      expect(await server.handle(logout(cookie, SAME_ORIGIN, 'GET'))).toBeUndefined();
      expect(await sessions.get(sessionIdOf(cookie))).toBeDefined();
      expect(idp.revoked.length).toBe(revokedBefore);

      // An Origin equal to the request's own is same-origin too.
      expect((await server.handle(logout(cookie, { origin: ORIGIN })))!.status).toBe(303);
      expect(await sessions.get(sessionIdOf(cookie))).toBeUndefined();
    });

    it('sign-out without a session still ends the provider session', async () => {
      const res = await server.handle(logout(undefined, SAME_ORIGIN));
      expect(res!.status).toBe(303);
      const location = new URL(res!.headers.get('location')!);
      expect(`${location.origin}${location.pathname}`).toBe(`${idp.issuer}/end_session`);
      expect(location.searchParams.has('id_token_hint')).toBe(false);
    });

    it('sign-out goes to afterSignIn when the provider has no end_session endpoint', async () => {
      idp.endSessionSupported = false;
      const noEndSession = createAgentFlowServer({ ...options(), afterSignIn: '/home' });
      const { cookie } = await signIn(noEndSession, idp);
      const stored = (await storedPayload(cookie))!;

      const res = await noEndSession.handle(logout(cookie, SAME_ORIGIN));
      expect(res!.status).toBe(303);
      expect(res!.headers.get('location')).toBe('/home');
      expect(clearedSessionCookie(res!)).toMatch(/Max-Age=0/);
      expect(idp.revoked).toContain(stored.refreshToken);
      expect(await sessions.get(sessionIdOf(cookie))).toBeUndefined();
    });

    it('sign-out ends the session even when the provider is unreachable', async () => {
      const first = await signIn(server, idp);
      const second = await signIn(server, idp);
      // Shares the session store but has not discovered the provider yet.
      const fresh = createAgentFlowServer(options());
      idp.outage = 'drop';

      const res = await server.handle(logout(first.cookie, SAME_ORIGIN));
      expect(res!.status).toBe(303);
      expect(res!.headers.get('location')).toMatch(new RegExp(`^${idp.issuer}/end_session\\?`));
      expect(clearedSessionCookie(res!)).toMatch(/Max-Age=0/);
      expect(await sessions.get(sessionIdOf(first.cookie))).toBeUndefined();

      // Without discovery there is no end_session URL to build: the browser goes to afterSignIn.
      const undiscovered = await fresh.handle(logout(second.cookie, SAME_ORIGIN));
      expect(undiscovered!.status).toBe(303);
      expect(undiscovered!.headers.get('location')).toBe('/');
      expect(clearedSessionCookie(undiscovered!)).toMatch(/Max-Age=0/);
      expect(await sessions.get(sessionIdOf(second.cookie))).toBeUndefined();

      expect(reported.map((r) => r.route)).toEqual(['auth/logout', 'auth/logout']);
    });
  });

  describe('back-channel logout', () => {
    it('hands onError a one-line summary of a logout token whose header carries control characters', async () => {
      // jose names an unrecognised `crit` entry in its message before any key is checked, and
      // anyone can post to this route: a host printing the raw message would let them forge lines.
      const header = Buffer.from(
        JSON.stringify({ alg: 'RS256', crit: ['\u001b[2K\u001b[1G[agentflow] forged\n[host] second'] }),
      ).toString('base64url');
      const res = await server.handle(backchannel(form(`${header}.${Buffer.from('{}').toString('base64url')}.sig`)));

      expect(res!.status).toBe(400);
      expect(reported).toHaveLength(1);
      expect(reported[0]!.route).toBe('auth/backchannel-logout');
      expect(reported[0]!.summary).not.toMatch(/[\x00-\x1f\x7f-\x9f]/);
      expect(reported[0]!.summary).toContain('\\x1b[2K\\x1b[1G[agentflow] forged\\x0a[host] second');
      expect(reported[0]!.summary).toBe(describeError(reported[0]!.error));
    });

    it('backchannel_logout_ends_every_session_of_the_sid', async () => {
      const first = await signIn(server, idp);
      const second = await signIn(server, idp);
      idp.user.sid = 'sess-2';
      const other = await signIn(server, idp);

      const res = await server.handle(backchannel(form(await idp.logoutToken('sess-1'))));
      expect(res!.status).toBe(200);
      expect(res!.headers.get('cache-control')).toBe('no-store');
      expect(await sessions.get(sessionIdOf(first.cookie))).toBeUndefined();
      expect(await sessions.get(sessionIdOf(second.cookie))).toBeUndefined();
      expect(await sessions.get(sessionIdOf(other.cookie))).toBeDefined();

      // A typ header, when present, must be logout+jwt.
      const typed = await server.handle(backchannel(form(await idp.logoutToken('sess-2', {}, { typ: 'logout+jwt' }))));
      expect(typed!.status).toBe(200);
      expect(await sessions.get(sessionIdOf(other.cookie))).toBeUndefined();
      expect(reported).toEqual([]);
    });

    it('refuses a logout token with a wrong audience, a nonce, or no events', async () => {
      const first = await signIn(server, idp);
      const second = await signIn(server, idp);
      const now = Math.floor(Date.now() / 1000);
      const stranger = await generateKeyPair('RS256');

      const refused: Array<[string, string]> = [
        ['wrong audience', form(await idp.logoutToken('sess-1', { aud: 'someone-else' }))],
        ['a nonce', form(await idp.logoutToken('sess-1', { nonce: 'n-1' }))],
        ['no events', form(await idp.logoutToken('sess-1', { events: undefined }))],
        ['events without the logout event', form(await idp.logoutToken('sess-1', { events: { 'https://other.test/event': {} } }))],
        ['a logout event that is not an object', form(await idp.logoutToken('sess-1', { events: { [BACKCHANNEL_LOGOUT_EVENT]: 'yes' } }))],
        ['a null logout event', form(await idp.logoutToken('sess-1', { events: { [BACKCHANNEL_LOGOUT_EVENT]: null } }))],
        ['no sid', form(await idp.logoutToken('sess-1', { sid: undefined }))],
        ['a non-string sid', form(await idp.logoutToken('sess-1', { sid: 1 }))],
        ['no iat', form(await idp.logoutToken('sess-1', { iat: undefined }))],
        ['no jti', form(await idp.logoutToken('sess-1', { jti: undefined }))],
        // Signed by a key the JWKS publishes, with an algorithm discovery does not advertise.
        ['an unadvertised algorithm', form(await idp.logoutToken('sess-1', {}, { alg: 'RS512' }))],
        ['a wrong issuer', form(await idp.logoutToken('sess-1', { iss: 'https://evil.test' }))],
        ['an expired token', form(await idp.logoutToken('sess-1', { exp: now - 60 }))],
        ['another typ', form(await idp.logoutToken('sess-1', {}, { typ: 'JWT' }))],
        [
          'a stranger signature',
          form(
            await new SignJWT({ events: { [BACKCHANNEL_LOGOUT_EVENT]: {} }, sid: 'sess-1' })
              .setProtectedHeader({ alg: 'RS256' })
              .setIssuer(idp.issuer)
              .setAudience(CLIENT_ID)
              .setIssuedAt(now)
              .setJti('j-1')
              .sign(stranger.privateKey),
          ),
        ],
        ['a garbage token', form('not-a-jwt')],
        ['no logout_token', ''],
        ['two logout_tokens', `${form(await idp.logoutToken('sess-1'))}&${form(await idp.logoutToken('sess-1'))}`],
      ];
      for (const [why, body] of refused) {
        const res = await server.handle(backchannel(body));
        expect(res!.status, why).toBe(400);
        expect(res!.headers.get('cache-control'), why).toBe('no-store');
      }
      // A valid token in a form body, but not sent as a form.
      const notAForm = await server.handle(backchannel(form(await idp.logoutToken('sess-1')), 'text/plain'));
      expect(notAForm!.status).toBe(400);

      expect(await sessions.get(sessionIdOf(first.cookie))).toBeDefined();
      expect(await sessions.get(sessionIdOf(second.cookie))).toBeDefined();
      expect(reported).toHaveLength(refused.length + 1);
      expect(new Set(reported.map((r) => r.route))).toEqual(new Set(['auth/backchannel-logout']));
    });

    it('bounds a logout token by the age of its iat and needs no exp', async () => {
      // No exp, like Reflexify's: good while iat is at most 5 min old, give or take 30 s of skew.
      const first = await signIn(server, idp);
      const inTime = await idp.logoutToken('sess-1', { exp: undefined });
      advance(330_000);
      expect((await server.handle(backchannel(form(inTime))))!.status).toBe(200);
      expect(await sessions.get(sessionIdOf(first.cookie))).toBeUndefined();

      const second = await signIn(server, idp);
      const late = await idp.logoutToken('sess-1', { exp: undefined });
      advance(331_000);
      expect((await server.handle(backchannel(form(late))))!.status).toBe(400);
      expect(await sessions.get(sessionIdOf(second.cookie))).toBeDefined();
      expect(reported.map((r) => r.route)).toEqual(['auth/backchannel-logout']);
    });

    it('verifies with the algorithms the provider advertises, and RS256 when it advertises none', async () => {
      const first = await signIn(server, idp);
      idp.idTokenSigningAlgs = ['RS256', 'RS512'];
      const advertisesBoth = createAgentFlowServer(options());
      const rs512 = await idp.logoutToken('sess-1', {}, { alg: 'RS512' });
      expect((await advertisesBoth.handle(backchannel(form(rs512))))!.status).toBe(200);
      expect(await sessions.get(sessionIdOf(first.cookie))).toBeUndefined();

      const second = await signIn(server, idp);
      idp.idTokenSigningAlgs = undefined;
      const advertisesNone = createAgentFlowServer(options());
      expect((await advertisesNone.handle(backchannel(form(rs512))))!.status).toBe(400);
      expect(await sessions.get(sessionIdOf(second.cookie))).toBeDefined();
      const rs256 = await idp.logoutToken('sess-1');
      expect((await advertisesNone.handle(backchannel(form(rs256))))!.status).toBe(200);
      expect(await sessions.get(sessionIdOf(second.cookie))).toBeUndefined();
    });

    it('refuses a body over 16 KiB whatever content-length says', async () => {
      const { cookie } = await signIn(server, idp);
      const valid = form(await idp.logoutToken('sess-1'));
      // A valid logout token padded with an ignored parameter to exactly `bytes`.
      const padded = (bytes: number) => `${valid}&pad=${'x'.repeat(bytes - valid.length - '&pad='.length)}`;
      const oversize = padded(16 * 1024 + 1);

      const cases: Array<[string, string | ReadableStream<Uint8Array>, Record<string, string>]> = [
        ['a truthful content-length', oversize, { 'content-length': String(oversize.length) }],
        ['no content-length', oversize, {}],
        ['no content-length, in 1 KiB chunks', chunked(oversize, 1024), {}],
        ['a content-length that understates it', oversize, { 'content-length': '100' }],
        // Refused on the header alone.
        ['a content-length over 16 KiB on a small body', valid, { 'content-length': String(16 * 1024 + 1) }],
      ];
      for (const [why, body, headers] of cases) {
        const res = await server.handle(backchannel(body, undefined, headers));
        expect(res!.status, why).toBe(400);
        expect(res!.headers.get('cache-control'), why).toBe('no-store');
        expect(await sessions.get(sessionIdOf(cookie)), why).toBeDefined();
      }
      expect(reported).toHaveLength(cases.length);

      const atTheCap = padded(16 * 1024);
      const res = await server.handle(backchannel(chunked(atTheCap, 1024), undefined, { 'content-length': String(atTheCap.length) }));
      expect(res!.status).toBe(200);
      expect(await sessions.get(sessionIdOf(cookie))).toBeUndefined();
    });

    it('answers 400, never 500, when it cannot verify or cannot delete', async () => {
      const { cookie } = await signIn(server, idp);
      const token = await idp.logoutToken('sess-1');

      // The JWKS is unreachable.
      idp.outage = 'http-500';
      expect((await server.handle(backchannel(form(token))))!.status).toBe(400);
      // Discovery is unreachable.
      const fresh = createAgentFlowServer(options());
      expect((await fresh.handle(backchannel(form(token))))!.status).toBe(400);
      idp.outage = undefined;

      // The store fails.
      vi.spyOn(sessions, 'deleteBySid').mockRejectedValueOnce(new Error('store down'));
      expect((await server.handle(backchannel(form(token))))!.status).toBe(400);
      expect(await sessions.get(sessionIdOf(cookie))).toBeDefined();
      expect(reported.map((r) => r.route)).toEqual(Array(3).fill('auth/backchannel-logout'));

      // Every failure above was transient: the same token ends the session once they are over.
      expect((await server.handle(backchannel(form(token))))!.status).toBe(200);
      expect(await sessions.get(sessionIdOf(cookie))).toBeUndefined();
    });
  });

  describe('clientFor', () => {
    it('rejects with an exported NotSignedIn once the session has ended', async () => {
      const { cookie } = await signIn(server, idp);
      const c = (await server.clientFor(get('/', cookie)))!;
      expect((await server.handle(logout(cookie, SAME_ORIGIN)))!.status).toBe(303);
      await expect(c.GET('/work')).rejects.toBeInstanceOf(NotSignedIn);
    });

    it('rejects with an exported IdpUnavailable while the provider is down', async () => {
      const { cookie } = await signIn(server, idp);
      const c = (await server.clientFor(get('/', cookie)))!;
      advance(NEAR_EXPIRY_MS);
      idp.outage = 'drop';
      await expect(c.GET('/work')).rejects.toBeInstanceOf(IdpUnavailable);
      expect(await sessions.get(sessionIdOf(cookie))).toBeDefined();
    });
  });
});
