import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { flushSync } from 'svelte';
import { describe, expect, it, onTestFinished } from 'vitest';
import { consumeContext, type AgentFlowContext } from '../src/context.js';
import type { Strings } from '../src/i18n.js';
import { useAgentFlow } from '../src/use-agentflow.svelte.js';
import { CALLER, json, mount, reportOf, settle, stubApi } from './support.js';

function consume(el: Element): { readonly current: AgentFlowContext | null } {
  let agentflow!: { readonly current: AgentFlowContext | null };
  const stop = $effect.root(() => {
    agentflow = useAgentFlow(el as HTMLElement);
  });
  onTestFinished(stop);
  flushSync();
  return agentflow;
}

const ready = () => mount('<span></span>', stubApi({ 'GET /caller': () => json(200, CALLER) }));

describe("the provider's context", () => {
  it('reaches a child through useAgentFlow and follows the state', async () => {
    const p = await ready();
    const child = p.querySelector('span')!;
    const agentflow = consume(child);
    const pushed: AgentFlowContext[] = [];
    consumeContext(child as HTMLElement, (value) => pushed.push(value));
    expect(agentflow.current?.state).toBe('ready');
    expect(agentflow.current?.caller).toEqual(CALLER);
    // The pushed object itself, not a deep proxy of it (and of the client inside it).
    expect(agentflow.current).toBe(pushed.at(-1));

    reportOf(p)(new AgentFlowError(401, 'NOT_SIGNED_IN'));
    await settle();
    expect(agentflow.current?.state).toBe('signed-out');
    expect(agentflow.current).toBe(pushed.at(-1));
  });

  it('a strings property set after connect reaches t', async () => {
    const p = await ready();
    const agentflow = consume(p.querySelector('span')!);
    expect(agentflow.current?.t('inbox.empty')).toBe('No tasks to show.');

    (p as HTMLElement & { strings?: Strings }).strings = { 'inbox.empty': 'Nothing waiting' };
    await settle();
    expect(agentflow.current?.t('inbox.empty')).toBe('Nothing waiting');
  });
});
