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

export const CONTEXT_REQUEST = 'context-request';
export const PROVIDER_READY = 'agentflow-provider-ready';
const CONTEXT_NAME = 'agentflow';

type Callback = (value: AgentFlowContext, unsubscribe: () => void) => void;

interface ContextRequest extends Event {
  context: string;
  callback: Callback;
  subscribe: boolean;
}

// Duck-typed rather than `instanceof`: two copies of this bundle on one page
// (an app bundle and a plain script) must still answer each other.
function isRequest(e: Event): e is ContextRequest {
  const r = e as Partial<ContextRequest>;
  return r.context === CONTEXT_NAME && typeof r.callback === 'function';
}

export function consumeContext(host: HTMLElement, onValue: (ctx: AgentFlowContext) => void): () => void {
  let unsubscribe: (() => void) | undefined;
  const request = () => {
    const event = Object.assign(new Event(CONTEXT_REQUEST, { bubbles: true, composed: true }), {
      context: CONTEXT_NAME,
      subscribe: true,
      callback: (value: AgentFlowContext, unsub: () => void) => {
        unsubscribe = unsub;
        onValue(value);
      },
    });
    host.dispatchEvent(event);
  };
  const onProviderReady = () => {
    if (!unsubscribe) request();
  };
  window.addEventListener(PROVIDER_READY, onProviderReady);
  request();
  return () => {
    window.removeEventListener(PROVIDER_READY, onProviderReady);
    unsubscribe?.();
  };
}

// Browsers have reportError; jsdom and Node do not.
function reportUncaught(error: unknown) {
  if (typeof reportError === 'function') reportError(error);
  else console.error(error);
}

// A consumer that throws is reported, not propagated: one broken element must not stop
// the others hearing that the session was signed out or lost access.
function deliver(cb: Callback, value: AgentFlowContext, unsubscribe: () => void) {
  try {
    cb(value, unsubscribe);
  } catch (error) {
    reportUncaught(error);
  }
}

export function provideContext(host: HTMLElement, initial: AgentFlowContext) {
  let value = initial;
  const subscribers = new Set<Callback>();
  const onRequest = (e: Event) => {
    if (!isRequest(e)) return;
    e.stopPropagation();
    const cb = e.callback;
    const unsubscribe = () => subscribers.delete(cb);
    if (e.subscribe) subscribers.add(cb);
    deliver(cb, value, unsubscribe);
  };
  host.addEventListener(CONTEXT_REQUEST, onRequest);
  window.dispatchEvent(new Event(PROVIDER_READY));
  return {
    set(next: AgentFlowContext) {
      value = next;
      for (const cb of [...subscribers]) deliver(cb, value, () => subscribers.delete(cb));
    },
    dispose() {
      host.removeEventListener(CONTEXT_REQUEST, onRequest);
      subscribers.clear();
    },
  };
}
