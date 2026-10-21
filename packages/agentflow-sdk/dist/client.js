import createClient from 'openapi-fetch';
import { agentflowFetch } from './fetch.js';
export function createAgentFlowClient(opts) {
    return createClient({
        baseUrl: opts.baseUrl,
        fetch: agentflowFetch({
            baseUrl: opts.baseUrl,
            auth: opts.auth,
            fetch: opts.fetch ?? globalThis.fetch,
            maxRetries: opts.maxRetries ?? 3,
        }),
    });
}
//# sourceMappingURL=client.js.map