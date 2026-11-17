/** `<agentflow-record-activity>`'s element. `reload()` reads the newest page now and prepends what is new: call it after the page's own write to the record. */
export interface AgentFlowRecordActivityElement extends HTMLElement {
    reload(): Promise<void>;
}
/** `<agentflow-record-comments>`'s element. `reload()` reads the newest page now and merges it in: call it after the page's own write to the record, or to the thread. */
export interface AgentFlowRecordCommentsElement extends HTMLElement {
    reload(): Promise<void>;
}
//# sourceMappingURL=element-types.d.ts.map