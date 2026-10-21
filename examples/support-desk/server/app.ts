import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import { createAgentFlowServer, describeError, MemorySessionStore, type AgentFlowServer } from '@reflexify/agentflow-sdk/server';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { appObjectsFor } from '../shared/app-objects.js';
import { publicConfig, serverOptions, type DeskConfig } from './config.js';

const UNAVAILABLE = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Support desk</title>
<p>Sign-in or this page is unavailable right now. Please try again in a moment.</p>
<p lang="vi">Không thể đăng nhập hoặc mở trang này lúc này. Vui lòng thử lại sau ít phút.</p>
</html>
`;

/** Why `staticDir` cannot be served, or `undefined` when it holds a build. */
export function missingBuild(staticDir: string): string | undefined {
  const index = join(staticDir, 'index.html');
  return existsSync(index) ? undefined : `Support desk has no build to serve (${index} is missing): run \`pnpm build\` first.`;
}

/** The path prefixes the server answers itself (the SDK's routes and the config). */
export const OWNED_PATHS = ['/agentflow', '/support-desk/'] as const;

export interface AppOptions {
  staticDir?: string;
  agentflow?: AgentFlowServer;
}

export function createApp(config: DeskConfig, opts: AppOptions = {}): Hono {
  const agentflow = opts.agentflow ?? createAgentFlowServer(serverOptions(config, new MemorySessionStore()));
  const app = new Hono();

  // Hono's default handler prints the whole error, cause included, and a failed token exchange keeps
  // the token response in the cause. The path only, since the callback's query carries the authorization
  // code, and still percent-encoded: c.req.path decodes it, which would print an ESC sequence raw.
  app.onError((error, c) => {
    if (error instanceof HTTPException) return error.getResponse();
    console.error(`[support-desk] ${new URL(c.req.url).pathname}: ${describeError(error)}`);
    return c.html(UNAVAILABLE, 500);
  });

  // This host signs in as a registration without a package, for which AgentFlow's /app/objects lists nothing, so
  // this server answers it from its own config, in the same shape. That is interim until a standalone host can
  // reach a packaged installation's objects. It is answered here, ahead of the proxy, which would otherwise forward
  // it to AgentFlow. The ids are those config.json serves.
  app.get('/agentflow/api/app/objects', (c) => {
    c.header('cache-control', 'no-store');
    return c.json(appObjectsFor(config.ids));
  });

  app.use('*', async (c, next) => {
    const answer = await agentflow.handle(c.req.raw);
    if (answer) return answer;
    await next();
  });

  app.get('/support-desk/config.json', (c) => {
    c.header('cache-control', 'no-store');
    return c.json(publicConfig(config));
  });

  if (opts.staticDir) {
    const staticDir = opts.staticDir;
    app.use('/*', serveStatic({ root: staticDir }));
    // A reload on a desk address such as /f/mine/t/… opens the desk, which reads its route from the address.
    // A path with a file extension, or one the server owns, that nothing answered stays a 404.
    app.get('*', async (c, next) => {
      if (/\.[a-z0-9]+$/i.test(c.req.path) || OWNED_PATHS.some((p) => c.req.path.startsWith(p))) return next();
      return c.html(await readFile(join(staticDir, 'index.html'), 'utf8'));
    });
  }
  return app;
}
