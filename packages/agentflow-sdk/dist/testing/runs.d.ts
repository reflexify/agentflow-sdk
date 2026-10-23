import type { AgentFlowClient } from '../client.js';
export type SettledRun = {
    id: string;
    status: 'completed' | 'failed' | 'cancelled' | string;
    [member: string]: unknown;
};
export declare function waitForRun(client: AgentFlowClient, runId: string, options?: {
    timeout?: number;
    interval?: number;
}): Promise<SettledRun>;
//# sourceMappingURL=runs.d.ts.map