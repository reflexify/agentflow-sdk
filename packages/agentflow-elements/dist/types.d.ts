import type { components } from '@reflexify/agentflow-sdk';
export interface Caller {
    kind: string;
    id: string;
    display_name: string;
    org_id: string;
    email: string | null;
    org_name: string | null;
    permissions: string[];
    app: components['schemas']['CallerApp'] | null;
}
export type ProviderState = 'loading' | 'ready' | 'signed-out' | 'access-lost' | 'error';
export interface SessionReadyDetail {
    caller: Caller;
}
export interface AccessLostDetail {
    code: string;
}
export interface RequestFailedDetail {
    code: string;
    status: number;
    detail?: string;
    requestId?: string;
}
export interface TaskSelectDetail {
    recordId: string;
    entityId: string;
}
export interface TaskClaimedDetail {
    recordId: string;
    entityId: string;
}
export interface TaskReleasedDetail {
    recordId: string;
    entityId: string;
}
export interface TaskSubmittedDetail {
    recordId: string;
    entityId: string;
    actionId: string | null;
}
export interface RecordSelectDetail {
    recordId: string;
}
export interface RecordCreatedDetail {
    recordId: string;
}
export interface WorkflowStartedDetail {
    instanceId: string;
    workflowId: string;
}
//# sourceMappingURL=types.d.ts.map