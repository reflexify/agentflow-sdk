import type { Draft, Json } from "./manifest.js";
export interface WorkflowOut {
    key: string;
    source: Json;
    exposed: string[];
    code: Map<string, string>;
    calls: Set<string>;
}
export declare function workflowSource(draft: Draft, key: string, entities?: readonly string[]): WorkflowOut;
export declare function triggerSource(draft: Draft, name: string): Json;
export declare function actionSource(draft: Draft, scoped: string): Json;
export declare function publishOrder(workflows: WorkflowOut[]): string[];
//# sourceMappingURL=sections.d.ts.map