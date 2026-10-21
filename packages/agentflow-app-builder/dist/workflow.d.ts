import { type ObjectEntry } from "./core.js";
import { type Grant } from "./entity.js";
export interface WorkflowSource {
    key: string;
    name: string;
    description: string;
    run_as: any;
    start_access: any;
    input_schema?: unknown;
    output_schema?: unknown;
    graph: any;
}
export interface TriggerSource {
    workflow: string;
    kind: string;
    enabled?: boolean;
    config: Record<string, unknown>;
}
export interface ActionSource {
    entity: string;
    action: Record<string, any>;
}
export declare const INITIATOR: {
    policy: string;
};
export declare const NOBODY: {
    mode: string;
    group_ids: never[];
};
export declare const servicePrincipal: (paramKey: string) => {
    policy: string;
    service_principal_id: string;
};
export declare const restricted: (...groupParams: string[]) => {
    mode: string;
    group_ids: string[];
};
export declare const ref: (value: string) => {
    kind: string;
    value: string;
};
export declare const tpl: (value: string) => {
    kind: string;
    value: string;
};
export declare const lit: (v: unknown) => {
    kind: string;
    value: string;
} | {
    kind: string;
    valueJson: unknown;
};
export declare const bind: (field: string, b: object) => {
    field: string;
};
export declare const NOW: {
    kind: string;
    value: string;
};
export declare function node(id: string, name: string, nodeType: string, params?: Record<string, unknown>, settings?: Record<string, unknown>): {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare function start({ subject, params }?: {
    subject?: string;
    params?: boolean;
}): {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare function end(id: string, name: string, outcome?: string, outputs?: unknown): {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const getById: (id: string, name: string, entity: string, idPath: string) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare function search(id: string, name: string, entity: string, filters: unknown, { sort, dir, limit }?: {
    sort?: unknown;
    dir?: unknown;
    limit?: number;
}): {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const flt: (field: string, op: string, value: unknown) => {
    field: string;
    op: string;
    value: unknown;
};
export declare const create: (id: string, name: string, entity: string, body: unknown) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare function update(id: string, name: string, entity: string, idPath: string, body: unknown, { expect, check }?: {
    expect?: unknown;
    check?: unknown;
}): {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const updateMany: (id: string, name: string, entity: string, filters: unknown, body: unknown) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const readParameters: (...names: string[]) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const decision: (id: string, name: string, branches: unknown[]) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const when: (edge: string, cond: unknown) => {
    edgeIds: string[];
    when: unknown;
};
export declare const otherwise: (edge: string) => {
    edgeIds: string[];
    default: boolean;
};
export declare const setvar: (id: string, name: string, assignments: [string, object][]) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare function call(id: string, name: string, workflow: string, subjectSource?: unknown, inputs?: [string, object][], settings?: Record<string, unknown>): {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const code: (id: string, name: string, file: string, inputs: [string, object][], outputSchema: unknown) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare const edges: (...triples: [string, string, string][]) => {
    id: string;
    from: string;
    to: string;
}[];
export declare const upsert: (id: string, name: string, entity: string, matchKey: string, body: unknown) => {
    id: string;
    name: string;
    node_type: string;
    parameters: Record<string, any>;
    settings: Record<string, unknown>;
};
export declare function graph(name: string, nodes: {
    id: string;
    node_type: string;
}[], edgeList: unknown[], transaction?: unknown): Record<string, unknown>;
export declare const workflow: (key: string, name: string, description: string, runAs: unknown, startAccess: unknown, g: unknown, inputSchema?: unknown) => WorkflowSource;
export declare function checkCondition(where: string, cond: any): void;
export declare function checkGraph(where: string, g: any): void;
export declare function workflowObject(w: WorkflowSource, configDir: string, exposed?: Record<string, string[]>, entities?: readonly string[]): Record<string, unknown>;
export declare function startGrants(w: WorkflowSource): Grant[];
export declare function triggerObject(name: string, trigger: TriggerSource, workflowKeys: ReadonlySet<string>): Record<string, unknown>;
export declare function actionObject(name: string, entry: ActionSource, workflowKeys: ReadonlySet<string>, entities: readonly string[]): ObjectEntry;
//# sourceMappingURL=workflow.d.ts.map