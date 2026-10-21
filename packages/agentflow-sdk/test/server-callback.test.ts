import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAgentFlowServer, describeError } from '../src/server/index.js';
import type { AgentFlowServer } from '../src/server/index.js';
import { MemorySessionStore } from '../src/server/sessions.js';
import { seal, unseal } from '../src/server/seal.js';
import type { SessionPayload } from '../src/server/routes/callback.js';
import type { LoginCookiePayload } from '../src/server/routes/login.js';
import { appKeys } from './support/app-keys.js';
import { startMockApi } from './support/mock-api.js';
import type { MockApi } from './support/mock-api.js';
import { startMockIdp } from './support/mock-idp.js';
import type { MockIdp } from './support/mock-idp.js';
import { signIn } from './support/sign-in.js';

const CLIENT_ID = 'case-desk-dev';
const RESOURCE = 'https://agentflow.example/api/v1/rest';
const REDIRECT_URI = 'https://app.test/agentflow/auth/callback';
const SESSION_KEY = Buffer.alloc(32, 5).toString('base64url');
const ORIGIN = 'https://app.test';

/** Follows `auth/login`'s redirect to the IdP's real `/authorize` URL and back, without ever
 * hitting `auth/callback` — a shared first half for the tests that need the raw callback URL and
 * login cookie to manipulate before sending them on. */
async function authorize(server: AgentFlowServer): Promise<{ callbackUrl: string; loginCookie: string }> {
  const loginRes = await server.handle(new Request(`${ORIGIN}/agentflow/auth/login`));
  const authorizeUrl = loginRes!.headers.get('location')!;
  const loginCookie = loginRes!.headers.get('set-cookie')!.split(';')[0]!;
  const authorizeRes = await fetch(authorizeUrl, { redirect: 'manual' });
  const callbackUrl = authorizeRes.headers.get('location')!;
  return { callbackUrl, loginCookie };
}

function clearedLoginCookie(res: Response): string | undefined {
  return res.headers.getSetCookie().find((c) => c.startsWith('agentflow_login='));
}

describe('auth/callback', () => {
  let idp: MockIdp;
  let api: MockApi;
  let privateKey: CryptoKey;
  let server: AgentFlowServer;
  let sessions: MemorySessionStore;

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

  // A fresh session store (and server) per test: these tests assert over the population of
  // sessions a single test creates, and idp.user.sid is the same constant across the whole file.
  beforeEach(() => {
    api.callerStatus = 200;
    api.callerType = undefined;
    api.callerRaw = undefined;
    sessions = new MemorySessionStore();
    server = createAgentFlowServer({
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
    });
  });

  it('creates a session only after GET /caller answers 200', async () => {
    const { cookie, location } = await signIn(server, idp, '/cases');
    expect(location).toBe('/cases');
    expect(cookie).toMatch(/^agentflow_session=[A-Za-z0-9_-]{43}/);
    expect(api.requests.at(-1)).toMatchObject({ path: '/api/v1/caller' });
    expect(api.requests.at(-1)!.authorization).toMatch(/^Bearer /);
  });

  it('redirects with the refusal code and creates no session when the app is not assigned', async () => {
    api.callerStatus = 403;
    api.callerType = 'APP_NOT_ASSIGNED';

    const { callbackUrl, loginCookie } = await authorize(server);
    const revokedBefore = idp.revoked.length;

    const res = await server.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));
    expect(res!.status).toBe(302);
    expect(res!.headers.get('location')).toBe('/?agentflow_error=APP_NOT_ASSIGNED');

    const issuedRefreshToken = idp.lastIssuedRefreshToken()!;
    expect(idp.revoked.length).toBe(revokedBefore + 1);
    expect(idp.revoked).toContain(issuedRefreshToken);

    expect(await sessions.deleteBySid(idp.user.sid!)).toBe(0);
    expect(clearedLoginCookie(res!)).toMatch(/^agentflow_login=;.*Max-Age=0/);
  });

  it('reads the refusal type before revoking, so a slow revoke cannot abort the body read', async () => {
    api.callerStatus = 403;
    api.callerType = 'APP_NOT_ASSIGNED';
    const revokedBefore = idp.revoked.length;
    // Stands in for the probe's 10 s timeout firing while a slow revocation runs: the /caller body
    // becomes unreadable once a revocation has reached the provider.
    const probeFetch: typeof fetch = async (input, init) => {
      const res = await fetch(input, init);
      const body = new Uint8Array(await res.arrayBuffer());
      const stream = new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            if (idp.revoked.length > revokedBefore) {
              controller.error(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
            } else {
              controller.enqueue(body);
              controller.close();
            }
          },
        },
        { highWaterMark: 0 },
      );
      return new Response(stream, { status: res.status, headers: res.headers });
    };
    const serverSlowRevoke = createAgentFlowServer({
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
      fetch: probeFetch,
    });

    const { callbackUrl, loginCookie } = await authorize(serverSlowRevoke);
    const res = await serverSlowRevoke.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));

    expect(res!.headers.get('location')).toBe('/?agentflow_error=APP_NOT_ASSIGNED');
    expect(idp.revoked).toContain(idp.lastIssuedRefreshToken());
    expect(sessions.size()).toBe(0);
  });

  it('refuses a callback whose state does not match the login cookie', async () => {
    const { callbackUrl, loginCookie } = await authorize(server);
    const tampered = new URL(callbackUrl);
    tampered.searchParams.set('state', 'tampered-state');

    const res = await server.handle(new Request(tampered, { headers: { cookie: loginCookie } }));
    expect(res!.status).toBe(400);
    expect(res!.headers.get('content-type')).toBe('application/problem+json');
    const body = (await res!.json()) as { type: string };
    expect(body.type).toBe('SIGN_IN_EXPIRED');

    expect(await sessions.deleteBySid(idp.user.sid!)).toBe(0);
    expect(clearedLoginCookie(res!)).toMatch(/^agentflow_login=;.*Max-Age=0/);
  });

  it('refuses a callback without the login cookie', async () => {
    const { callbackUrl } = await authorize(server);

    const res = await server.handle(new Request(callbackUrl));
    expect(res!.status).toBe(400);
    const body = (await res!.json()) as { type: string };
    expect(body.type).toBe('SIGN_IN_EXPIRED');

    expect(await sessions.deleteBySid(idp.user.sid!)).toBe(0);
    expect(clearedLoginCookie(res!)).toMatch(/^agentflow_login=;.*Max-Age=0/);
  });

  it('a_replayed_callback_creates_no_second_session', async () => {
    const { callbackUrl, loginCookie } = await authorize(server);
    const request = () => new Request(callbackUrl, { headers: { cookie: loginCookie } });

    const first = await server.handle(request());
    expect(first!.status).toBe(302);

    const second = await server.handle(request());
    expect(second!.status).toBe(400);

    expect(await sessions.deleteBySid(idp.user.sid!)).toBe(1);
  });

  it('signs in even when the callback request arrives on a different origin than redirectUri (TLS-terminating proxy)', async () => {
    const { callbackUrl, loginCookie } = await authorize(server);
    const real = new URL(callbackUrl);
    const proxied = new URL(`http://internal:8080${real.pathname}${real.search}`);

    const res = await server.handle(new Request(proxied, { headers: { cookie: loginCookie } }));
    expect(res!.status).toBe(302);
    expect(res!.headers.get('location')).toBe('/');
  });

  it('treats a missing sid ID Token claim as a post-grant failure: no session, refresh token revoked', async () => {
    const keys = await appKeys();
    const idpNoSid = await startMockIdp({
      clientId: CLIENT_ID,
      appPublicJwk: keys.publicJwk,
      resource: RESOURCE,
      user: { sub: 'user-no-sid', tid: 'org-no-sid', sid: undefined, email: 'nosid@example.test' },
    });
    try {
      const sessionsNoSid = new MemorySessionStore();
      const serverNoSid = createAgentFlowServer({
        issuer: idpNoSid.issuer,
        clientId: CLIENT_ID,
        privateKey: keys.privateKey,
        redirectUri: REDIRECT_URI,
        apiBaseUrl: `${api.baseUrl}/api/v1`,
        resource: RESOURCE,
        sessions: sessionsNoSid,
        sessionKey: SESSION_KEY,
        secureCookies: false,
        allowInsecureRequests: true,
      });

      const { callbackUrl, loginCookie } = await authorize(serverNoSid);
      const res = await serverNoSid.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));

      expect(res!.status).toBe(302);
      expect(res!.headers.get('location')).toBe('/?agentflow_error=SIGN_IN_FAILED');
      expect(idpNoSid.revoked).toEqual([idpNoSid.lastIssuedRefreshToken()]);
      expect(sessionsNoSid.size()).toBe(0);
      expect(clearedLoginCookie(res!)).toMatch(/^agentflow_login=;.*Max-Age=0/);
    } finally {
      await idpNoSid.close();
    }
  });

  it('a probe network failure routes through SIGN_IN_FAILED: no session, refresh token revoked, login cookie cleared', async () => {
    const deadApi = await startMockApi();
    const deadApiBaseUrl = `${deadApi.baseUrl}/api/v1`;
    await deadApi.close();

    const sessionsDead = new MemorySessionStore();
    const serverDeadApi = createAgentFlowServer({
      issuer: idp.issuer,
      clientId: CLIENT_ID,
      privateKey,
      redirectUri: REDIRECT_URI,
      apiBaseUrl: deadApiBaseUrl,
      resource: RESOURCE,
      sessions: sessionsDead,
      sessionKey: SESSION_KEY,
      secureCookies: false,
      allowInsecureRequests: true,
    });

    const { callbackUrl, loginCookie } = await authorize(serverDeadApi);
    const res = await serverDeadApi.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));

    expect(res!.status).toBe(302);
    expect(res!.headers.get('location')).toBe('/?agentflow_error=SIGN_IN_FAILED');
    expect(idp.revoked).toContain(idp.lastIssuedRefreshToken());
    expect(sessionsDead.size()).toBe(0);
    expect(clearedLoginCookie(res!)).toMatch(/^agentflow_login=;.*Max-Age=0/);
  });

  it('a non-JSON 200 from /caller routes through SIGN_IN_FAILED', async () => {
    api.callerRaw = 'not json';
    const { cookie, location } = await signIn(server, idp);
    expect(location).toBe('/?agentflow_error=SIGN_IN_FAILED');
    expect(cookie).toBe('');
    expect(await sessions.deleteBySid(idp.user.sid!)).toBe(0);
  });

  describe('onError', () => {
    it('receives the underlying error, the route and a safe summary on a post-grant failure', async () => {
      const calls: Array<{ error: unknown; context: { route: string; summary: string } }> = [];
      const sessionsX = new MemorySessionStore();
      const serverX = createAgentFlowServer({
        issuer: idp.issuer,
        clientId: CLIENT_ID,
        privateKey,
        redirectUri: REDIRECT_URI,
        apiBaseUrl: `${api.baseUrl}/api/v1`,
        resource: RESOURCE,
        sessions: sessionsX,
        sessionKey: SESSION_KEY,
        secureCookies: false,
        allowInsecureRequests: true,
        onError: (error, context) => {
          calls.push({ error, context });
        },
      });

      api.callerRaw = 'not json';
      const { location } = await signIn(serverX, idp);
      expect(location).toBe('/?agentflow_error=SIGN_IN_FAILED');
      expect(calls).toHaveLength(1);
      expect(calls[0]!.error).toBeInstanceOf(Error);
      expect(calls[0]!.context).toEqual({ route: 'auth/callback', summary: describeError(calls[0]!.error) });
      expect(calls[0]!.context.summary).toMatch(/^\w+: /);
    });

    it('receives the error on a code-grant failure (state mismatch) too', async () => {
      const calls: unknown[] = [];
      const sessionsW = new MemorySessionStore();
      const serverW = createAgentFlowServer({
        issuer: idp.issuer,
        clientId: CLIENT_ID,
        privateKey,
        redirectUri: REDIRECT_URI,
        apiBaseUrl: `${api.baseUrl}/api/v1`,
        resource: RESOURCE,
        sessions: sessionsW,
        sessionKey: SESSION_KEY,
        secureCookies: false,
        allowInsecureRequests: true,
        onError: (error) => {
          calls.push(error);
        },
      });

      const { callbackUrl, loginCookie } = await authorize(serverW);
      const tampered = new URL(callbackUrl);
      tampered.searchParams.set('state', 'tampered-state');

      const res = await serverW.handle(new Request(tampered, { headers: { cookie: loginCookie } }));
      expect(res!.status).toBe(400);
      expect(calls).toHaveLength(1);
    });

    it('a throwing onError does not break the response', async () => {
      const sessionsZ = new MemorySessionStore();
      const serverZ = createAgentFlowServer({
        issuer: idp.issuer,
        clientId: CLIENT_ID,
        privateKey,
        redirectUri: REDIRECT_URI,
        apiBaseUrl: `${api.baseUrl}/api/v1`,
        resource: RESOURCE,
        sessions: sessionsZ,
        sessionKey: SESSION_KEY,
        secureCookies: false,
        allowInsecureRequests: true,
        onError: () => {
          throw new Error('boom from onError');
        },
      });

      api.callerRaw = 'not json';
      const { location } = await signIn(serverZ, idp);
      expect(location).toBe('/?agentflow_error=SIGN_IN_FAILED');
    });

    // A rejected promise from an async reporter escapes a plain try/catch, and an unhandled
    // rejection terminates a Node >= 15 host by default.
    it('a rejecting async onError does not break the response or leak an unhandled rejection', async () => {
      const unhandled: unknown[] = [];
      const onUnhandled = (reason: unknown): void => {
        unhandled.push(reason);
      };
      process.on('unhandledRejection', onUnhandled);
      try {
        const serverR = createAgentFlowServer({
          issuer: idp.issuer,
          clientId: CLIENT_ID,
          privateKey,
          redirectUri: REDIRECT_URI,
          apiBaseUrl: `${api.baseUrl}/api/v1`,
          resource: RESOURCE,
          sessions: new MemorySessionStore(),
          sessionKey: SESSION_KEY,
          secureCookies: false,
          allowInsecureRequests: true,
          onError: async () => {
            throw new Error('reporter down');
          },
        });

        api.callerRaw = 'not json';
        const { callbackUrl, loginCookie } = await authorize(serverR);
        const res = await serverR.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));
        expect(res!.status).toBe(302);
        expect(res!.headers.get('location')).toBe('/?agentflow_error=SIGN_IN_FAILED');

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(unhandled).toEqual([]);
      } finally {
        process.off('unhandledRejection', onUnhandled);
      }
    });
  });

  it('signs in, proxies and serves clientFor when apiBaseUrl ends in a slash', async () => {
    const serverSlash = createAgentFlowServer({
      issuer: idp.issuer,
      clientId: CLIENT_ID,
      privateKey,
      redirectUri: REDIRECT_URI,
      apiBaseUrl: `${api.baseUrl}/api/v1/`,
      resource: RESOURCE,
      sessions,
      sessionKey: SESSION_KEY,
      secureCookies: false,
      allowInsecureRequests: true,
    });

    const { cookie, location } = await signIn(serverSlash, idp, '/cases');
    expect(api.requests.at(-1)!.path).toBe('/api/v1/caller');
    expect(location).toBe('/cases');

    const proxied = await serverSlash.handle(new Request(`${ORIGIN}/agentflow/api/work`, { headers: { cookie } }));
    expect(proxied!.status).toBe(200);
    expect(api.requests.at(-1)!.path).toBe('/api/v1/work');

    const direct = await serverSlash.clientFor(new Request(`${ORIGIN}/cases`, { headers: { cookie } }));
    await direct!.GET('/work');
    expect(api.requests.at(-1)!.path).toBe('/api/v1/work');
  });

  describe('returnTo', () => {
    /** The one session the browser was handed, and proof it is the only one in the store: a record
     * whose id never reached a cookie is a stranded session nothing can end. */
    async function expectOnlyTheCookiedSession(cookie: string): Promise<void> {
      expect(cookie).toMatch(/^agentflow_session=[A-Za-z0-9_-]{43}$/);
      expect(await sessions.get(cookie.slice('agentflow_session='.length))).toBeDefined();
      expect(sessions.size()).toBe(1);
    }

    // `?returnTo=/a%0Ab`, `?returnTo=/%00` and a code point `Headers` cannot carry. The URL
    // parser drops or percent-encodes each, so they used to pass the same-origin check and then
    // make `new Headers({ location })` throw at the callback, after the session was written.
    for (const [label, unsafe] of [
      ['/a%0Ab', '/a\nb'],
      ['/%00', '/\u0000'],
      ['/%E6%97%A5 (non-ASCII)', '/日本'],
    ] as const) {
      it(`falls back to afterSignIn for returnTo=${label}: no 500, no stranded session`, async () => {
        const { cookie, location } = await signIn(server, idp, unsafe);
        expect(location).toBe('/');
        await expectOnlyTheCookiedSession(cookie);
      });
    }

    it('emits returnTo=/.//evil.test as given, never normalised to the protocol-relative //evil.test', async () => {
      const { cookie, location } = await signIn(server, idp, '/.//evil.test');
      expect(location).toBe('/.//evil.test');
      expect(location.startsWith('//')).toBe(false);
      expect(new URL(location, ORIGIN).origin).toBe(ORIGIN);
      await expectOnlyTheCookiedSession(cookie);
    });

    it('re-checks returnTo at the callback: a login cookie sealed with a raw LF lands on afterSignIn', async () => {
      // What a login cookie minted before the check tightened can still carry for its 10 minutes.
      const { callbackUrl, loginCookie } = await authorize(server);
      const sealed = loginCookie.slice('agentflow_login='.length);
      const login = (await unseal<LoginCookiePayload>(SESSION_KEY, sealed))!;
      const crafted = await seal(SESSION_KEY, { ...login, returnTo: '/a\nb' });

      const res = await server.handle(new Request(callbackUrl, { headers: { cookie: `agentflow_login=${crafted}` } }));
      expect(res!.status).toBe(302);
      expect(res!.headers.get('location')).toBe('/');
      const sessionCookie = res!.headers.getSetCookie().find((c) => c.startsWith('agentflow_session='))!;
      await expectOnlyTheCookiedSession(sessionCookie.split(';')[0]!);
    });

    it('builds the redirect before writing the session: a Location Headers refuses fails sign-in, strands nothing', async () => {
      // A misconfigured afterSignIn is the only Location left that the callback does not vet.
      const serverBadLanding = createAgentFlowServer({
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
        afterSignIn: '/ho\nme',
      });

      const { callbackUrl, loginCookie } = await authorize(serverBadLanding);
      const res = await serverBadLanding.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));

      expect(res!.status).toBe(302);
      expect(res!.headers.get('location')).toBe('/home?agentflow_error=SIGN_IN_FAILED');
      expect(sessions.size()).toBe(0);
      expect(idp.revoked).toContain(idp.lastIssuedRefreshToken());
      expect(clearedLoginCookie(res!)).toMatch(/^agentflow_login=;.*Max-Age=0/);
    });
  });

  it('keeps tokens out of anything the browser receives', async () => {
    const loginRes = await server.handle(new Request(`${ORIGIN}/agentflow/auth/login`));
    const authorizeUrl = loginRes!.headers.get('location')!;
    const loginCookie = loginRes!.headers.get('set-cookie')!.split(';')[0]!;
    const loginBody = await loginRes!.clone().text();

    const authorizeRes = await fetch(authorizeUrl, { redirect: 'manual' });
    const callbackUrl = authorizeRes.headers.get('location')!;
    const callbackRes = await server.handle(new Request(callbackUrl, { headers: { cookie: loginCookie } }));
    const callbackBody = await callbackRes!.clone().text();

    const sessionCookie = callbackRes!.headers.getSetCookie().find((c) => c.startsWith('agentflow_session='))!;
    const sessionId = sessionCookie.split(';')[0]!.split('=')[1]!;
    const record = await sessions.get(sessionId);
    const payload = await unseal<SessionPayload>(SESSION_KEY, record!.sealed);

    const successHaystacks = [
      loginBody,
      ...loginRes!.headers.getSetCookie(),
      loginRes!.headers.get('location') ?? '',
      callbackBody,
      ...callbackRes!.headers.getSetCookie(),
      callbackRes!.headers.get('location') ?? '',
    ];
    for (const secret of [payload!.accessToken, payload!.refreshToken, payload!.idToken]) {
      for (const haystack of successHaystacks) {
        expect(haystack).not.toContain(secret);
      }
    }

    // No session is created on a refusal, so there's nothing to unseal — but the mock IdP still
    // minted real tokens for it, and the refusal redirect's Location carries a query string built
    // from user input (the upstream problem type); check that path leaks nothing either.
    api.callerStatus = 403;
    api.callerType = 'APP_NOT_ASSIGNED';
    const { callbackUrl: refusalCallbackUrl, loginCookie: refusalLoginCookie } = await authorize(server);
    const refusalRes = await server.handle(new Request(refusalCallbackUrl, { headers: { cookie: refusalLoginCookie } }));
    const refusalToken = idp.lastIssuedRefreshToken()!;

    expect(refusalRes!.headers.get('location')).not.toContain(refusalToken);
    for (const cookie of refusalRes!.headers.getSetCookie()) {
      expect(cookie).not.toContain(refusalToken);
    }
  });
});
