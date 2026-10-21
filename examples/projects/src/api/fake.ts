import { createAgentFlowClient, proxyAdapter } from '@reflexify/agentflow-sdk';
import type { ProjectIds } from '../shared/app-objects.js';
import { createHttpProjectsApi } from './http-projects-api.js';
import { createMemoryServer, type MemoryServer, type MemoryServerOptions, type Seed } from './memory-server.js';
import type { ProjectsApi } from './projects-api.js';
import { createSeed } from './seed.js';

/** The real HTTP ProjectsApi over an in-memory AgentFlow: the demo, component tests and Playwright. */
export function createFakeProjects(opts: { you?: string; seed?: Seed; now?: () => Date; workflowDelay?: MemoryServerOptions['workflowDelay'] } = {}): {
  api: ProjectsApi;
  server: MemoryServer;
  ids: ProjectIds;
} {
  const now = opts.now ?? (() => new Date());
  const seed = opts.seed ?? createSeed(now());
  const you = opts.you ?? seed.people[0]?.id ?? '';
  const server = createMemoryServer(seed, { now, workflowDelay: opts.workflowDelay });
  server.actAs(you);
  const baseUrl = 'http://projects.memory/agentflow/api';
  const client = createAgentFlowClient({ baseUrl, auth: proxyAdapter(), fetch: server.fetch, maxRetries: 0 });
  const apiUrl = (path: string) => `${baseUrl}${path}`;
  return { api: createHttpProjectsApi({ client, ids: seed.ids, apiUrl, personId: you, now }), server, ids: seed.ids };
}
