import type { AgentFlowClient } from '@reflexify/agentflow-sdk';
import type { Problem } from './errors.js';
import type { Locale, Translate } from './i18n.js';
import type { Caller, ProviderState } from './types.js';
export interface AgentFlowContext {
    state: ProviderState;
    caller: Caller | null;
    client: AgentFlowClient;
    locale: Locale;
    t: Translate;
    report(error: unknown): Problem | null;
}
export declare const CONTEXT_REQUEST = "context-request";
export declare const PROVIDER_READY = "agentflow-provider-ready";
export declare function consumeContext(host: HTMLElement, onValue: (ctx: AgentFlowContext) => void): () => void;
export declare function provideContext(host: HTMLElement, initial: AgentFlowContext): {
    set(next: AgentFlowContext): void;
    dispose(): void;
};
//# sourceMappingURL=context.d.ts.map