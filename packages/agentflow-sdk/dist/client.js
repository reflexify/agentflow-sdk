import createClient from 'openapi-fetch';
import { RevisionTap, registerTap } from './app/revision.js';
import { agentflowFetch } from './fetch.js';
export function createAgentFlowClient(opts) {
    const tap = new RevisionTap();
    const client = createClient({
        baseUrl: opts.baseUrl,
        fetch: agentflowFetch({
            baseUrl: opts.baseUrl,
            auth: opts.auth,
            fetch: opts.fetch ?? globalThis.fetch,
            maxRetries: opts.maxRetries ?? 3,
            onRevision: (h) => tap.observe(h),
        }),
    });
    registerTap(client, tap);
    return client;
}
//# sourceMappingURL=client.js.map