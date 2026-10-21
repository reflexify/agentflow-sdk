import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { getRequestListener } from '@hono/node-server';
import { Hono } from 'hono';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MemorySessionStore, createAgentFlowServer } from '../src/server/index.js';
import type { AgentFlowServer, SessionStore } from '../src/server/index.js';
import { appKeys } from './support/app-keys.js';
import { startMockApi } from './support/mock-api.js';
import type { MockApi } from './support/mock-api.js';
import { startMockIdp } from './support/mock-idp.js';
import type { MockIdp } from './support/mock-idp.js';
import { signIn } from './support/sign-in.js';

const CLIENT_ID = 'case-desk-dev';
const RESOURCE = 'https://agentflow.example/api/v1/rest';
const ORIGIN = 'https://app.test';
const SESSION_KEY = Buffer.alloc(32, 9).toString('base64url');

describe('mounting /server in a framework', () => {
  let idp: MockIdp;
  let api: MockApi;
  let server: AgentFlowServer;

  beforeAll(async () => {
    const keys = await appKeys();
    idp = await startMockIdp({ clientId: CLIENT_ID, appPublicJwk: keys.publicJwk, resource: RESOURCE });
    api = await startMockApi();
    const sessions: SessionStore = new MemorySessionStore();
    server = createAgentFlowServer({
      issuer: idp.issuer,
      clientId: CLIENT_ID,
      privateKey: keys.privateKey,
      redirectUri: `${ORIGIN}/agentflow/auth/callback`,
      apiBaseUrl: `${api.baseUrl}/api/v1`,
      resource: RESOURCE,
      sessions,
      sessionKey: SESSION_KEY,
      secureCookies: false,
      allowInsecureRequests: true,
    });
  });

  afterAll(async () => {
    await idp.close();
    await api.close();
  });

  /** The Hono mount exactly as the README shows it, plus two host routes. */
  function honoApp(): Hono {
    const app = new Hono();
    app.use('*', async (c, next) => {
      const res = await server.handle(c.req.raw);
      if (res) return res;
      await next();
    });
    app.get('/', (c) => c.text('home'));
    app.get('/me', async (c) => {
      const client = await server.clientFor(c.req.raw);
      if (!client) return c.text('signed out', 401);
      const { data } = await client.GET('/caller');
      return c.json(data);
    });
    return app;
  }

  it('mounts in Hono as middleware and falls through for other routes', async () => {
    const app = honoApp();

    const session = await app.request(`${ORIGIN}/agentflow/session`);
    expect(session.status).toBe(200);
    expect(await session.json()).toEqual({ signedIn: false });

    const home = await app.request(`${ORIGIN}/`);
    expect(home.status).toBe(200);
    expect(await home.text()).toBe('home');
  });

  it('signs in, proxies and serves clientFor through the Hono mount', async () => {
    const app = honoApp();
    const viaHono: AgentFlowServer = {
      handle: async (request) => app.request(request),
      clientFor: (request) => server.clientFor(request),
    };

    const { cookie, location } = await signIn(viaHono, idp, '/cases');
    expect(location).toBe('/cases');
    expect(cookie).toMatch(/^agentflow_session=.+/);

    const session = await app.request(`${ORIGIN}/agentflow/session`, { headers: { cookie } });
    expect(await session.json()).toMatchObject({ signedIn: true, caller: { id: idp.user.sub } });

    const seen = api.requests.length;
    const proxied = await app.request(`${ORIGIN}/agentflow/api/caller`, { headers: { cookie } });
    expect(proxied.status).toBe(200);
    const forwarded = api.requests.slice(seen);
    expect(forwarded).toHaveLength(1);
    expect(forwarded[0]!.authorization).toMatch(/^Bearer /);
    expect(forwarded[0]!.cookie).toBeNull();

    const me = await app.request(`${ORIGIN}/me`, { headers: { cookie } });
    expect(me.status).toBe(200);
    expect(await me.json()).toMatchObject({ id: idp.user.sub });
    expect((await app.request(`${ORIGIN}/me`)).status).toBe(401);
  });

  it('mounts behind a Node request listener, as Express and Fastify use it', async () => {
    const agentflow = getRequestListener(
      async (request) => (await server.handle(request)) ?? new Response('Not Found', { status: 404 }),
    );
    const node = createServer((req, res) => {
      if (/^\/agentflow(?:[/?]|$)/.test(req.url ?? '')) {
        void agentflow(req, res);
        return;
      }
      res.end('home');
    });
    await new Promise<void>((resolve) => node.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(node.address() as AddressInfo).port}`;
    try {
      const session = await fetch(`${base}/agentflow/session`);
      expect(session.status).toBe(200);
      expect(await session.json()).toEqual({ signedIn: false });

      expect(await (await fetch(`${base}/`)).text()).toBe('home');
    } finally {
      await new Promise<void>((resolve, reject) => node.close((err) => (err ? reject(err) : resolve())));
    }
  });
});

describe('the browser export', () => {
  it('refuses to load', async () => {
    await expect(import('../src/server/refuse-browser.js')).rejects.toThrow(/server only/);
  });

  it('is what a browser bundler resolves ./server to', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      exports: Record<string, Record<string, string>>;
    };
    const conditions = manifest.exports['./server']!;
    expect(conditions.browser).toBe('./dist/server/refuse-browser.js');
    // Conditions match in key order: `browser` must win over `import` for a browser build.
    const keys = Object.keys(conditions);
    expect(keys.indexOf('browser')).toBeLessThan(keys.indexOf('import'));
  });
});
