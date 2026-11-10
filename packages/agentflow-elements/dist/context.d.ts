import type { AgentFlowClient, AppSigning, AppTasks } from '@reflexify/agentflow-sdk';
import type { Problem } from './errors.js';
import type { Locale, Translate } from './i18n.js';
import type { Caller, ProviderState } from './types.js';
export interface AgentFlowContext {
    state: ProviderState;
    caller: Caller | null;
    client: AgentFlowClient;
    /** The host's signing, or null when the host offers none. */
    signing: AppSigning | null;
    /** The host's tasks, or null when the host offers none. */
    tasks: AppTasks | null;
    locale: Locale;
    t: Translate;
    report(error: unknown): Problem | null;
}
export declare const CONTEXT_REQUEST = "context-request";
export declare const PROVIDER_READY = "agentflow-provider-ready";
export declare const AGENTFLOW_CONTEXT = "agentflow";
export declare const TASK_CONTEXT = "agentflow-task";
export declare function consumeContext<T>(host: HTMLElement, name: string, onValue: (value: T) => void): () => void;
export declare function provideContext<T>(host: HTMLElement, name: string, initial: T): {
    set(next: T): void;
    dispose(): void;
};
//# sourceMappingURL=context.d.ts.map