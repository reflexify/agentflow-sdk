import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { inspect } from 'node:util';
import { serve, type ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AgentFlowServer } from '@reflexify/agentflow-sdk/server';
import { createApp, missingBuild } from '../../server/app.js';
import { appObjectsFor, projectIdsFrom } from '../../src/shared/app-objects.js';
import { testConfig } from '../support/server-config.js';

const passThrough: AgentFlowServer = { handle: async () => undefined, clientFor: async () => undefined };
const get = (app: Hono, path: string) => app.request(`http://localhost:5175${path}`);

describe('the projects server', () => {
  afterEach(() => vi.restoreAllMocks());

  it('serves the public config without caching', async () => {
    const app = createApp(await testConfig(), { agentflow: passThrough });
    const res = await app.request('http://localhost:5175/site/config.json');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(body.ids.entities.project).toMatch(/^[0-9a-f-]{36}$/);
    expect(Object.keys(body).sort()).toEqual(['agentflowUrl', 'basePath', 'ids']);
  });

  it('carries the AgentFlow address from AGENTFLOW_APP_URL, and localhost:4000 without it', async () => {
    const plain = createApp(await testConfig(), { agentflow: passThrough });
    expect((await (await get(plain, '/site/config.json')).json()).agentflowUrl).toBe('http://localhost:4000');
    const set = createApp(await testConfig({ AGENTFLOW_APP_URL: 'https://app.example.com' }), { agentflow: passThrough });
    expect(await (await get(set, '/site/config.json')).json()).toMatchObject({
      basePath: '/agentflow',
      agentflowUrl: 'https://app.example.com',
    });
  });

  it('answers a failure with the bilingual page, never the cause', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing: AgentFlowServer = { handle: async () => { throw new Error('token response: secret'); }, clientFor: async () => undefined };
    const app = createApp(await testConfig(), { agentflow: failing });
    const res = await app.request('http://localhost:5175/agentflow/auth/callback?code=x');
    expect(res.status).toBe(500);
    const html = await res.text();
    expect(html).toContain('Projects');
    expect(html).toContain('Dự án');
    expect(html).not.toContain('secret');
  });

  it('answers the objects of the Projects app from its config, ahead of the proxy', async () => {
    const config = await testConfig();
    const refusing: AgentFlowServer = {
      handle: async () => Response.json({ type: 'NOT_SIGNED_IN', title: 'Not signed in', status: 401 }, { status: 401 }),
      clientFor: async () => undefined,
    };
    const app = createApp(config, { agentflow: refusing });
    const res = await get(app, '/agentflow/api/app/objects');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(body).toEqual(appObjectsFor(config.ids));
    expect(projectIdsFrom(body)).toEqual({ ids: config.ids, missing: [] });
    // Only the read is the server's: anything else on that path is still the proxy's.
    expect((await app.request('http://localhost:5175/agentflow/api/app/objects', { method: 'POST' })).status).toBe(401);
  });

  it('streams an event stream through as it comes, and ends it upstream when the page goes', async () => {
    let cancelled = false;
    let push!: (text: string) => void;
    const encoder = new TextEncoder();
    const streaming: AgentFlowServer = {
      handle: async (request) => {
        if (new URL(request.url).pathname !== '/agentflow/api/events/stream') return undefined;
        const body = new ReadableStream<Uint8Array>({
          start: (controller) => {
            controller.enqueue(encoder.encode('retry: 3000\n\n'));
            push = (text) => controller.enqueue(encoder.encode(text));
          },
          cancel: () => { cancelled = true; },
        });
        return new Response(body, { headers: { 'content-type': 'text/event-stream' } });
      },
      clientFor: async () => undefined,
    };
    const app = createApp(await testConfig(), { agentflow: streaming });
    const server = await new Promise<ServerType>((resolve) => {
      const s = serve({ fetch: app.fetch, port: 0, hostname: '127.0.0.1' }, () => resolve(s));
    });
    try {
      const { port } = server.address() as AddressInfo;
      const page = new AbortController();
      const res = await fetch(`http://127.0.0.1:${port}/agentflow/api/events/stream`, { signal: page.signal });
      const reader = res.body!.getReader();
      const next = async () => new TextDecoder().decode((await reader.read()).value);
      expect(await next()).toContain('retry: 3000');
      push('id: 1\nevent: record.updated\ndata: {}\n\n');
      expect(await next()).toContain('id: 1');
      page.abort();
      await vi.waitFor(() => expect(cancelled).toBe(true));
    } finally {
      server.close();
    }
  });
});

describe('the projects server over the SDK', () => {
  it('mounts the SDK routes', async () => {
    const res = await get(createApp(await testConfig()), '/agentflow/session');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ signedIn: false });
  });

  it('proxies only published operations, so an internal route never leaves the server', async () => {
    const res = await get(createApp(await testConfig()), '/agentflow/api/admin/apps');
    expect(res.status).toBe(404);
    expect((await res.json()).type).toBe('NOT_PUBLISHED');
  });

  it('answers 404 for an unknown path when no static directory is configured', async () => {
    expect((await get(createApp(await testConfig()), '/nope')).status).toBe(404);
  });
});

describe('the projects server with a built app', () => {
  let dist: string;
  beforeAll(async () => {
    dist = await mkdtemp(join(tmpdir(), 'projects-dist-'));
    await mkdir(join(dist, 'assets'));
    await writeFile(join(dist, 'index.html'), '<!doctype html><title>built app</title>');
    await writeFile(join(dist, 'assets', 'app.js'), 'console.log("built");');
    // Files at the paths the app and the SDK own, which must never be the answer.
    await mkdir(join(dist, 'site'));
    await writeFile(join(dist, 'site', 'config.json'), '{"from":"a file"}');
    await mkdir(join(dist, 'agentflow'));
    await writeFile(join(dist, 'agentflow', 'session'), '{"from":"a file"}');
  });
  afterAll(async () => {
    await rm(dist, { recursive: true, force: true });
  });

  it('serves index.html at / and the built assets', async () => {
    const app = createApp(await testConfig(), { staticDir: dist });
    const page = await get(app, '/');
    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toMatch(/^text\/html/);
    expect(await page.text()).toContain('<title>built app</title>');
    const asset = await get(app, '/assets/app.js');
    expect(asset.status).toBe(200);
    expect(asset.headers.get('content-type')).toMatch(/javascript/);
    expect(await asset.text()).toBe('console.log("built");');
  });

  it('answers the config and the SDK routes itself, never from a file', async () => {
    const app = createApp(await testConfig(), { staticDir: dist });
    expect(await (await get(app, '/site/config.json')).json()).toMatchObject({ basePath: '/agentflow' });
    expect(await (await get(app, '/agentflow/session')).json()).toEqual({ signedIn: false });
  });

  it('opens the app on a deep link, so a reload on a task or a members address works', async () => {
    const app = createApp(await testConfig(), { staticDir: dist });
    for (const path of ['/projects/t/6f1c2d3e-0000-4000-8000-000000000001', '/p/6f1c2d3e-0000-4000-8000-000000000002/members', '/mywork']) {
      const res = await get(app, path);
      expect(res.status, path).toBe(200);
      expect(res.headers.get('content-type'), path).toMatch(/^text\/html/);
      expect(await res.text(), path).toContain('<title>built app</title>');
    }
  });

  it('answers 404 for a missing file, or a path the server owns that it does not handle', async () => {
    const app = createApp(await testConfig(), { staticDir: dist });
    for (const path of ['/assets/missing.js', '/missing.css', '/agentflow/nope', '/site/nope', '/site/x', '/agentflow/x']) {
      expect((await get(app, path)).status, path).toBe(404);
    }
  });

  it('serves the app for a GET only', async () => {
    const app = createApp(await testConfig(), { staticDir: dist });
    expect((await app.request('http://localhost:5175/projects', { method: 'POST' })).status).toBe(404);
  });
});

describe('the production entry point', () => {
  let dir = '';
  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it('refuses to serve a directory with no build, and says to run pnpm build first', async () => {
    dir = await mkdtemp(join(tmpdir(), 'projects-unbuilt-'));
    expect(missingBuild(dir)).toBe(`Projects has no build to serve (${join(dir, 'index.html')} is missing): run \`pnpm server\`, which builds first.`);
    expect(missingBuild(join(dir, 'dist'))).toMatch(/run `pnpm server`, which builds first/);
  });

  it('serves a directory holding index.html', async () => {
    dir = await mkdtemp(join(tmpdir(), 'projects-built-'));
    await writeFile(join(dir, 'index.html'), '<!doctype html>');
    expect(missingBuild(dir)).toBeUndefined();
  });
});

describe('an error that escapes a route', () => {
  afterEach(() => vi.restoreAllMocks());

  const logged = (spy: { mock: { calls: unknown[][] } }) =>
    spy.mock.calls.map((args) => args.map((a) => (typeof a === 'string' ? a : inspect(a, { depth: Infinity }))).join(' ')).join('\n');

  const throwing = (error: unknown): AgentFlowServer => ({
    handle: async () => {
      throw error;
    },
    clientFor: async () => undefined,
  });

  it('answers a short bilingual 500 page and logs the path, name, message and code, never the cause or the query', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new TypeError('discovery of id.example failed'), {
      code: 'OAUTH_DISCOVERY_FAILED',
      cause: { body: { refresh_token: 'rt-secret-in-cause' } },
    });
    const res = await get(createApp(await testConfig(), { agentflow: throwing(error) }), '/agentflow/auth/callback?code=code-secret-in-query&state=s1');

    expect(res.status).toBe(500);
    expect(spy).toHaveBeenCalledTimes(1);
    const out = logged(spy);
    expect(out).toContain('/agentflow/auth/callback');
    expect(out).toContain('TypeError: discovery of id.example failed (OAUTH_DISCOVERY_FAILED)');
    expect(out).not.toContain('rt-secret-in-cause');
    expect(out).not.toContain('code-secret-in-query');
    expect(out).not.toContain('[object Object]');
    expect(out).not.toContain('\n');

    expect(res.headers.get('content-type')).toMatch(/^text\/html/);
    const body = await res.text();
    expect(body).toContain('Projects');
    expect(body).toContain('Dự án');
    expect(body).toMatch(/try again/i);
    expect(body).toMatch(/thử lại/);
    expect(body).not.toContain('discovery of id.example failed');
    expect(body).not.toContain('rt-secret-in-cause');
    expect(body).not.toContain('OAUTH_DISCOVERY_FAILED');
  });

  it('logs the path as the request wrote it, so an encoded control character never reaches the terminal', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createApp(await testConfig(), { agentflow: throwing(new Error('boom')) });
    for (const path of ['/agentflow/auth/login%1B[2K%1B[1Gforged', '/agentflow/auth/login%09forged']) {
      expect((await get(app, path)).status, path).toBe(500);
    }
    expect(spy.mock.calls).toEqual([
      ['[projects] /agentflow/auth/login%1B[2K%1B[1Gforged: Error: boom'],
      ['[projects] /agentflow/auth/login%09forged: Error: boom'],
    ]);
  });

  it('names why AgentFlow could not be reached, from the code fetch keeps in the cause', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cause = Object.assign(new AggregateError([], 'connect ECONNREFUSED 127.0.0.1:8080'), { code: 'ECONNREFUSED' });
    const app = createApp(await testConfig(), { agentflow: throwing(new TypeError('fetch failed', { cause })) });
    expect((await get(app, '/agentflow/api/caller')).status).toBe(500);
    expect(spy.mock.calls).toEqual([['[projects] /agentflow/api/caller: TypeError: fetch failed (ECONNREFUSED)']]);
  });

  it('answers an HTTPException with its own response, not the 500 page, and logs nothing', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createApp(await testConfig(), { agentflow: throwing(new HTTPException(403, { message: 'not for you' })) });
    const res = await get(app, '/agentflow/session');
    expect(res.status).toBe(403);
    expect(await res.text()).toBe('not for you');
    expect(spy).not.toHaveBeenCalled();
  });
});
