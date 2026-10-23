import type { AgentFlowClient } from '../client.js';
/** Hears every `AgentFlow-App-Revision` a client's responses carry. */
export declare class RevisionTap {
    #private;
    observe(header: string | null): void;
    listen(listener: (revision: number) => void): () => void;
}
export declare const registerTap: (client: AgentFlowClient, tap: RevisionTap) => WeakMap<import("openapi-fetch").Client<import("../generated/public.js").paths, `${string}/${string}`>, RevisionTap>;
export declare const tapOf: (client: AgentFlowClient) => RevisionTap | undefined;
//# sourceMappingURL=revision.d.ts.map