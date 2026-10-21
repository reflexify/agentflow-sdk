import { getRequestListener } from '@hono/node-server';
import { loadEnv, type Plugin } from 'vite';
import { createApp, OWNED_PATHS } from './app.js';
import { ConfigError, loadConfig, type DeskConfig } from './config.js';

export const ownedByServer = (url: string | undefined) => OWNED_PATHS.some((p) => url?.startsWith(p));

export function supportDeskDevServer(): Plugin {
  return {
    name: 'support-desk-server',
    async configureServer(server) {
      const env = { ...process.env, ...loadEnv(server.config.mode, process.cwd(), '') };
      let config: DeskConfig;
      try {
        config = await loadConfig(env);
      } catch (error) {
        if (!(error instanceof ConfigError)) throw error;
        // A fresh clone has no keys or desk config yet; the demo still runs without the server.
        console.warn(`Support desk server not configured; only demo mode (/?demo) works:\n${error.message}`);
        return;
      }
      const listener = getRequestListener(createApp(config).fetch);
      server.middlewares.use((req, res, next) => {
        if (ownedByServer(req.url)) void listener(req, res);
        else next();
      });
    },
  };
}
