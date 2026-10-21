import createClient from 'openapi-fetch';
import type { paths } from './generated/public.js';
import type { AuthAdapter } from './auth.js';
import { type RequestFetch } from './fetch.js';
export type AgentFlowClient = ReturnType<typeof createClient<paths>>;
export declare function createAgentFlowClient(opts: {
    baseUrl: string;
    auth: AuthAdapter;
    fetch?: RequestFetch;
    maxRetries?: number;
}): AgentFlowClient;
//# sourceMappingURL=client.d.ts.map