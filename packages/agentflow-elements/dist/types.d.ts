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
/** Detail of `agentflow-signed` and `agentflow-declined`. */
export interface TaskSignedDetail {
    recordId: string;
    entityId: string;
}
/** Detail of `agentflow-task-changed`: the signing dialog changed the task without signing or declining. */
export interface TaskChangedDetail {
    recordId: string;
    entityId: string;
}
/** Detail of the `agentflow-task-<kind>` events of `<agentflow-task>`; `actionId` rides with `submitted`. */
export interface TaskEventDetail {
    recordId: string;
    entityId: string;
    actionId?: string;
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
/** How a record action whose mode is `sync` came out; `started` when the run was still going, or could not be read, when the form stopped waiting. */
export type WorkflowStartedOutcome = 'completed' | 'failed' | 'rolled_back' | 'paused' | 'blocked' | 'started';
/** `outcome` rides only with a record action whose mode is `sync`, and the event then fires once the form stops waiting. */
export interface WorkflowStartedDetail {
    instanceId: string;
    workflowId: string;
    outcome?: WorkflowStartedOutcome;
}
//# sourceMappingURL=types.d.ts.map