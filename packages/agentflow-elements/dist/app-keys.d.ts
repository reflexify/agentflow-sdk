import { type AgentFlowClient } from '@reflexify/agentflow-sdk';
export declare class AppKeyMissing extends Error {
    readonly kind: 'entity' | 'workflow';
    readonly key: string;
    constructor(kind: 'entity' | 'workflow', key: string);
}
export declare function resolveKey(client: AgentFlowClient, kind: 'entity' | 'workflow', key: string): Promise<string>;
//# sourceMappingURL=app-keys.d.ts.map