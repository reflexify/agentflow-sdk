import { EventEmitter } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportPKCS8, generateKeyPair } from 'jose';
import type { Connect, ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ownedByServer, projectsDevServer } from '../../server/vite-plugin.js';
import { idsReport } from '../support/server-config.js';

// What `.env` files would add to the shell's environment; each test says what it holds.
let dotenv: Record<string, string> = {};
vi.mock('vite', async (importOriginal) => ({ ...(await importOriginal<typeof import('vite')>()), loadEnv: () => dotenv }));

it('hands the server its own paths and leaves the rest to Vite', () => {
  for (const url of ['/agentflow/auth/login', '/agentflow/api/caller', '/agentflow/session', '/site/config.json']) {
    expect(ownedByServer(url), url).toBe(true);
  }
  for (const url of ['/', '/index.html', '/src/main.tsx', '/@vite/client', '/node_modules/.vite/deps/react.js', '/site', undefined]) {
    expect(ownedByServer(url), String(url)).toBe(false);
  }
});

describe('the dev server plugin', () => {
  let dir = '';
  let http: Server | undefined;
  beforeEach(() => {
    dotenv = {};
    for (const name of ['AGENTFLOW_ISSUER', 'AGENTFLOW_PRIVATE_KEY_ID', 'PROJECTS_SESSION_KEY']) vi.stubEnv(name, '');
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    http?.close();
    http = undefined;
    if (dir) await rm(dir, { recursive: true, force: true });
    dir = '';
  });

  const viteServer = (use: ViteDevServer['middlewares']['use']) => ({ config: { mode: 'development' }, middlewares: { use } }) as unknown as ViteDevServer;
  const configure = (server: ViteDevServer) => (projectsDevServer().configureServer as (s: ViteDevServer) => Promise<void>)(server);

  it('says so and mounts nothing when the server is not configured, so a fresh clone still serves demo mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const use = vi.fn();
    await configure(viteServer(use));
    expect(use).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    const line = String(warn.mock.calls[0]![0]);
    expect(line).toContain('Projects server not configured; only demo mode (/?demo) works:');
    expect(line).toContain('AGENTFLOW_ISSUER is required');
  });

  /** A Projects config on disk and in `.env`, as a configured checkout has it. */
  async function configured() {
    dir = await mkdtemp(join(tmpdir(), 'projects-plugin-'));
    await writeFile(join(dir, 'private.pem'), await exportPKCS8((await generateKeyPair('RS256', { extractable: true })).privateKey));
    await writeFile(join(dir, 'projects.config.json'), JSON.stringify(idsReport));
    dotenv = {
      AGENTFLOW_ISSUER: 'https://id.example',
      AGENTFLOW_PRIVATE_KEY_ID: 'k1',
      PROJECTS_SESSION_KEY: Buffer.alloc(32, 1).toString('base64url'),
      AGENTFLOW_PRIVATE_KEY_FILE: join(dir, 'private.pem'),
      PROJECTS_CONFIG_FILE: join(dir, 'projects.config.json'),
    };
  }

  it('answers the paths the server owns and passes the rest to Vite when it is configured', async () => {
    await configured();
    let middleware: Connect.NextHandleFunction | undefined;
    await configure(viteServer(((fn: Connect.NextHandleFunction) => { middleware = fn; }) as ViteDevServer['middlewares']['use']));
    expect(middleware).toBeTypeOf('function');

    http = createServer((req, res) =>
      middleware!(req, res, () => {
        res.statusCode = 418;
        res.end('vite');
      }),
    );
    await new Promise<void>((resolve) => http!.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(http.address() as AddressInfo).port}`;

    const config = await fetch(`${base}/site/config.json`);
    expect(config.status).toBe(200);
    expect(Object.keys(await config.json()).sort()).toEqual(['agentflowUrl', 'basePath', 'ids']);
    expect(await (await fetch(`${base}/agentflow/session`)).json()).toEqual({ signedIn: false });
    const page = await fetch(`${base}/src/main.tsx`);
    expect(page.status).toBe(418);
  });

  it('leaves every upgrade to Vite: the server has no socket of its own', async () => {
    await configured();
    const httpServer = new EventEmitter();
    const server = { config: { mode: 'development' }, middlewares: { use: () => {} }, httpServer } as unknown as ViteDevServer;
    await configure(server);
    expect(httpServer.listenerCount('upgrade')).toBe(0);
    expect(httpServer.listenerCount('close')).toBe(0);
  });
});
