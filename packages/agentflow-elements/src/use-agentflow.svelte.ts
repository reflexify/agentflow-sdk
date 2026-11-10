import { AGENTFLOW_CONTEXT, consumeContext, type AgentFlowContext } from './context.js';

/** The nearest provider's context, kept current; `null` until a provider answers. */
export function useAgentFlow(host: HTMLElement): { readonly current: AgentFlowContext | null } {
  // Raw: the provider replaces the context wholesale, so deep-proxying it, and the
  // client inside it, for every consumer buys nothing.
  let current = $state.raw<AgentFlowContext | null>(null);
  $effect(() => consumeContext<AgentFlowContext>(host, AGENTFLOW_CONTEXT, (value) => (current = value)));
  return {
    get current() {
      return current;
    },
  };
}
