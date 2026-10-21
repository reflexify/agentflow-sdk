import { createAgentFlowClient, proxyAdapter } from '@reflexify/agentflow-sdk';
import type { DeskIds } from '../../shared/contract.js';
import type { DeskApi } from './desk-api.js';
import { createHttpDeskApi } from './http-desk-api.js';
import { createMemoryServer, type MemoryServer, type Seed } from './memory-server.js';
import { createSeed } from './seed.js';

/** The real HTTP desk API over an in-memory AgentFlow: demo mode, component tests and Playwright. */
export function createFakeDesk(opts: { now?: Date; draftDelayMs?: number; atomicDelayMs?: number; seed?: Seed } = {}): {
  api: DeskApi;
  server: MemoryServer;
  ids: DeskIds;
} {
  const start = opts.now ?? new Date();
  const seed = opts.seed ?? createSeed(start);
  // A fixed `now` keeps tests deterministic; the demo passes none and runs on the wall clock.
  const now = opts.now ? () => start : () => new Date();
  const server = createMemoryServer(seed, { now, draftDelayMs: opts.draftDelayMs, atomicDelayMs: opts.atomicDelayMs });
  const baseUrl = 'http://desk.memory/agentflow/api';
  const client = createAgentFlowClient({ baseUrl, auth: proxyAdapter(), fetch: server.fetch, maxRetries: 0 });
  const apiUrl = (path: string) => `${baseUrl}${path}`;
  return { api: createHttpDeskApi({ client, ids: seed.ids, apiUrl, now }), server, ids: seed.ids };
}
