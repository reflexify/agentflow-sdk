import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
export type WorkTask = components['schemas']['WorkListItem'];
export declare function waitForTask(client: AgentFlowClient, stepKey: string, recordId: string, options?: {
    timeout?: number;
    interval?: number;
}): Promise<WorkTask>;
export declare function completeTask(client: AgentFlowClient, task: WorkTask, action: string, options?: {
    payload?: Record<string, unknown>;
}): Promise<void>;
//# sourceMappingURL=tasks.d.ts.map