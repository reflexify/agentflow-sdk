import { flushSync } from 'svelte';
import '../src/index.js';

export type Handler = (req: Request, url: URL) => Response | Promise<Response>;

export interface StubApi {
  fetch: typeof fetch;
  calls: { method: string; path: string; search: string; body: unknown }[];
}

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': status >= 400 ? 'application/problem+json' : 'application/json',
      // The SDK retries a 429 or 503 after Retry-After, waiting a full second when it is
      // absent; zero keeps those retries inside settle().
      ...(status >= 400 ? { 'retry-after': '0' } : {}),
    },
  });

export const problem = (status: number, type: string, extra: Record<string, unknown> = {}) =>
  json(status, { type, title: type, status, request_id: 'req-test', ...extra });

/** Routes keyed `"<METHOD> <path under /agentflow/api>"`, e.g. `"GET /caller"`. */
export function stubApi(routes: Record<string, Handler>): StubApi {
  const calls: StubApi['calls'] = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/agentflow\/api/, '');
    const text = req.method === 'GET' ? '' : await req.clone().text();
    calls.push({ method: req.method, path, search: url.search, body: text ? JSON.parse(text) : undefined });
    const handler = routes[`${req.method} ${path}`];
    return handler ? handler(req, url) : problem(404, 'NOT_PUBLISHED');
  };
  return { fetch: fetchImpl as typeof fetch, calls };
}

export async function settle(): Promise<void> {
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 0));
    flushSync();
  }
}

/** Mount `inner` inside a provider wired to `api`; returns the provider. */
export async function mount(inner: string, api: StubApi, attrs: Record<string, string> = {}): Promise<HTMLElement> {
  document.body.innerHTML = '';
  const provider = document.createElement('agentflow-provider') as HTMLElement & { fetchImpl?: typeof fetch };
  for (const [k, v] of Object.entries(attrs)) provider.setAttribute(k, v);
  provider.fetchImpl = api.fetch;
  provider.innerHTML = inner;
  document.body.append(provider);
  await settle();
  return provider;
}

/** The provider's `report`, asked for through a `context-request` as any element asks for it. */
export function reportOf(provider: HTMLElement): (error: unknown) => unknown {
  let report: ((error: unknown) => unknown) | undefined;
  const request = Object.assign(new Event('context-request', { bubbles: true, composed: true }), {
    context: 'agentflow',
    subscribe: false,
    callback: (value: { report: (error: unknown) => unknown }) => (report = value.report),
  });
  provider.dispatchEvent(request);
  if (!report) throw new Error('the provider did not answer a context-request');
  return report;
}

export const shadow = (el: Element | null) => {
  if (!el?.shadowRoot) throw new Error('element has no shadow root');
  return el.shadowRoot;
};

export const CALLER = {
  kind: 'user',
  id: '0190c0de-0000-7000-8000-000000000001',
  display_name: 'Ann',
  org_id: '0190c0de-0000-7000-8000-0000000000aa',
  email: 'ann@example.com',
  org_name: 'Acme',
  permissions: [],
  app: { key: 'case-desk', name: 'Case desk' },
};

// Svelte's delegation dispatcher only runs Svelte handlers on elements in the event's own path, and goes when the last root unmounts.
const SVELTE_DISPATCH = /\bevent_handle\b.*svelte[\\/]src[\\/]internal[\\/]client[\\/]render\.js/;
const ZAG_HELPERS = /@zag-js[\\/](dom-query|utils)[\\/]/;
// toast: the group's document keydown lasts while af-toast is mounted, and is accepted because the kit's hotkey matches no key.
const ZAG_ACCEPTED = /@zag-js[\\/](dismissable|focus-visible|popover|toast)[\\/]/;

/** `frames[0]` is the code that called `addEventListener`. Only that caller counts, never a frame further up. */
export function acceptedCaller(frames: readonly string[]): boolean {
  if (SVELTE_DISPATCH.test(frames[0] ?? '')) return true;
  const caller = frames.find((f) => !ZAG_HELPERS.test(f));
  return caller !== undefined && ZAG_ACCEPTED.test(caller);
}

function callerFrames(skip: (...args: never[]) => unknown): string[] {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 50;
  const holder: { stack?: string } = {};
  Error.captureStackTrace(holder, skip);
  Error.stackTraceLimit = limit;
  return (holder.stack ?? '').split('\n').filter((line) => /^\s*at /.test(line));
}

export function watchDocumentKeyListeners(): { fromKit(): string[]; restore(): void } {
  const found: { target: string; type: string; frames: string[] }[] = [];
  const restores = ([['document', document], ['window', window]] as const).map(([name, target]) => {
    const original = target.addEventListener;
    const watched = function (this: EventTarget, type: string, ...rest: unknown[]) {
      if (type.startsWith('key')) found.push({ target: name, type, frames: callerFrames(watched) });
      return (original as (...args: unknown[]) => void).call(this, type, ...rest);
    };
    target.addEventListener = watched as typeof target.addEventListener;
    return () => { target.addEventListener = original; };
  });
  return {
    fromKit: () => found.filter((f) => !acceptedCaller(f.frames)).map((f) => `${f.target}:${f.type}`),
    restore: () => restores.forEach((r) => r()),
  };
}
