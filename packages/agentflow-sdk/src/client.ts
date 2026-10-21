import createClient from 'openapi-fetch';
import type { paths } from './generated/public.js';
import type { AuthAdapter } from './auth.js';
import { agentflowFetch, type RequestFetch } from './fetch.js';

export type AgentFlowClient = ReturnType<typeof createClient<paths>>;

export function createAgentFlowClient(opts: {
  baseUrl: string;
  auth: AuthAdapter;
  fetch?: RequestFetch;
  maxRetries?: number;
}): AgentFlowClient {
  return createClient<paths>({
    baseUrl: opts.baseUrl,
    fetch: agentflowFetch({
      baseUrl: opts.baseUrl,
      auth: opts.auth,
      fetch: opts.fetch ?? globalThis.fetch,
      maxRetries: opts.maxRetries ?? 3,
    }),
  });
}
