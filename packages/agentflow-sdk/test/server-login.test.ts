import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createAgentFlowServer } from '../src/server/index.js';
import type { AgentFlowServer } from '../src/server/index.js';
import { MemorySessionStore } from '../src/server/sessions.js';
import { readCookie } from '../src/server/cookies.js';
import { unseal } from '../src/server/seal.js';
import type { LoginCookiePayload } from '../src/server/routes/login.js';
import { appKeys } from './support/app-keys.js';
import { startMockIdp } from './support/mock-idp.js';
import type { MockIdp } from './support/mock-idp.js';

const CLIENT_ID = 'case-desk-dev';
const RESOURCE = 'https://agentflow.example/api/v1/rest';
const REDIRECT_URI = 'https://app.test/agentflow/auth/callback';
const SESSION_KEY = Buffer.alloc(32, 9).toString('base64url');

describe('auth/login', () => {
  let idp: MockIdp;
  let server: AgentFlowServer;

  beforeAll(async () => {
    const keys = await appKeys();
    idp = await startMockIdp({ clientId: CLIENT_ID, appPublicJwk: keys.publicJwk, resource: RESOURCE });
    server = createAgentFlowServer({
      issuer: idp.issuer,
      clientId: CLIENT_ID,
      privateKey: keys.privateKey,
      redirectUri: REDIRECT_URI,
      apiBaseUrl: 'http://ignored.test/api/v1',
      resource: RESOURCE,
      orgHint: 'org-1',
      sessions: new MemorySessionStore(),
      sessionKey: SESSION_KEY,
      secureCookies: false,
      allowInsecureRequests: true,
    });
  });

  afterAll(() => idp.close());

  it('redirects to the identity provider with PKCE S256, state, nonce, resource and org_hint', async () => {
    const res = await server.handle(new Request('https://app.test/agentflow/auth/login?returnTo=/cases'));
    expect(res!.status).toBe(302);

    const to = new URL(res!.headers.get('location')!);
    expect(to.origin + to.pathname).toBe(idp.issuer + '/authorize');
    expect(to.searchParams.get('code_challenge_method')).toBe('S256');
    expect(to.searchParams.get('resource')).toBe(RESOURCE);
    expect(to.searchParams.get('org_hint')).toBe('org-1');
    expect(to.searchParams.get('scope')).toBe('openid offline_access');
    expect(to.searchParams.get('state')).toBeTruthy();
    expect(to.searchParams.get('nonce')).toBeTruthy();

    expect(res!.headers.get('set-cookie')).toMatch(
      /^agentflow_login=.+; Path=\/; HttpOnly; SameSite=Lax; Max-Age=600$/,
    );
  });

  it('ignores an absolute or protocol-relative returnTo, or one a Location header cannot carry', async () => {
    for (const evilReturnTo of ['https://evil.test', '//evil.test', '/\\evil.test', '/a\nb', '/\u0000', '/a\u007Fb', '/日本']) {
      const res = await server.handle(
        new Request(`https://app.test/agentflow/auth/login?returnTo=${encodeURIComponent(evilReturnTo)}`),
      );
      expect(res!.status).toBe(302);

      const setCookie = res!.headers.get('set-cookie')!;
      const sealed = readCookie(new Request('https://app.test/', { headers: { cookie: setCookie } }), 'agentflow_login')!;
      const payload = await unseal<LoginCookiePayload>(SESSION_KEY, sealed);
      expect(payload?.returnTo).toBe('/');
    }
  });

  it('returns undefined for paths it does not own', async () => {
    expect(await server.handle(new Request('https://app.test/other'))).toBeUndefined();
  });
});

interface FlakyIdp {
  issuer: string;
  close(): Promise<void>;
}

/** An identity provider whose discovery document 500s on the first request and succeeds after. */
async function startFlakyDiscoveryIdp(): Promise<FlakyIdp> {
  let requestCount = 0;
  let issuer = '';

  const app = new Hono();
  app.get('/.well-known/openid-configuration', (c) => {
    requestCount += 1;
    if (requestCount === 1) return c.text('discovery is down', 500);
    return c.json({
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks.json`,
      response_types_supported: ['code'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['private_key_jwt'],
      subject_types_supported: ['public'],
    });
  });

  const server = await new Promise<ServerType>((resolve) => {
    const s = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 }, () => resolve(s));
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('flaky discovery IdP failed to bind a TCP port');
  issuer = `http://127.0.0.1:${address.port}`;

  return {
    issuer,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

describe('discovery retry', () => {
  it('retries discovery after a failed attempt instead of caching the rejection', async () => {
    const flaky = await startFlakyDiscoveryIdp();
    try {
      const keys = await appKeys();
      const flakyServer = createAgentFlowServer({
        issuer: flaky.issuer,
        clientId: CLIENT_ID,
        privateKey: keys.privateKey,
        redirectUri: REDIRECT_URI,
        apiBaseUrl: 'http://ignored.test/api/v1',
        resource: RESOURCE,
        sessions: new MemorySessionStore(),
        sessionKey: SESSION_KEY,
        secureCookies: false,
        allowInsecureRequests: true,
      });

      await expect(flakyServer.handle(new Request('https://app.test/agentflow/auth/login'))).rejects.toThrow();

      const res = await flakyServer.handle(new Request('https://app.test/agentflow/auth/login'));
      expect(res!.status).toBe(302);
    } finally {
      await flaky.close();
    }
  });
});

describe('configuration', () => {
  it('refuses a sessionKey that does not decode from base64url to exactly 32 bytes', async () => {
    const keys = await appKeys();
    const withKey = (sessionKey: unknown) => () =>
      createAgentFlowServer({
        issuer: 'https://idp.invalid',
        clientId: CLIENT_ID,
        privateKey: keys.privateKey,
        redirectUri: REDIRECT_URI,
        apiBaseUrl: 'http://ignored.test/api/v1',
        resource: RESOURCE,
        sessions: new MemorySessionStore(),
        sessionKey: sessionKey as string,
      });

    for (const bad of [
      Buffer.alloc(16, 1).toString('base64url'),
      Buffer.alloc(31, 1).toString('base64url'),
      Buffer.alloc(33, 1).toString('base64url'),
      'not a base64url key!',
      '',
      undefined,
    ]) {
      expect(withKey(bad), String(bad)).toThrow(/sessionKey must be 32 random bytes, base64url-encoded/);
    }
    expect(withKey(SESSION_KEY)).not.toThrow();
  });
});
