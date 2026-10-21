import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Not `new URL('…', import.meta.url)`: Vite rewrites that into an asset URL on its dev server.
export const BUNDLE = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist/agentflow-elements.js');
export const hasBundle = existsSync(BUNDLE);
if (!hasBundle && process.env.CI) throw new Error('The contract suite runs against the built bundle: run `pnpm build` first.');

export interface Entry { defineAgentFlowElements(): void; signIn(...args: unknown[]): void; signOut(...args: unknown[]): void }
export const loadBundle = () => import(/* @vite-ignore */ BUNDLE) as Promise<Entry>;

export const CALLER = {
  kind: 'user', id: '0190c0de-0000-7000-8000-000000000001', display_name: 'Ann', org_id: '0190c0de-0000-7000-8000-0000000000aa',
  email: 'ann@example.com', org_name: 'Acme', permissions: [], app: { key: 'case-desk', name: 'Case desk' },
};
export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/json' } });
export const problem = (status: number, type: string, extra: Record<string, unknown> = {}) =>
  json(status, { type, title: type, status, request_id: 'req-contract', ...extra });

export interface Call { method: string; pathname: string; path: string; query: URLSearchParams; body: unknown }
export type Stub = typeof fetch & { calls: Call[] };

/**
 * A fetch answering `"<METHOD> <path under {base-path}/api>"` routes, whatever the base path,
 * and recording every call.
 */
export function stub(routes: Record<string, (req: Request) => Response | Promise<Response>>): Stub {
  const calls: Call[] = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const url = new URL(req.url);
    const path = url.pathname.replace(/^.*?\/api(?=\/)/, '');
    const text = req.method === 'GET' ? '' : await req.clone().text();
    calls.push({ method: req.method, pathname: url.pathname, path, query: url.searchParams, body: text ? JSON.parse(text) : undefined });
    return (routes[`${req.method} ${path}`] ?? (() => problem(404, 'NOT_PUBLISHED')))(req);
  };
  return Object.assign(fetchImpl, { calls }) as Stub;
}

/** Wait for any library's scheduling: macrotasks flush every microtask queue. */
export async function settle(): Promise<void> {
  for (let i = 0; i < 30; i++) await new Promise((r) => setTimeout(r, 0));
}

/**
 * Mounts a provider holding `inner` inside another component's shadow root, as a host app's own
 * component would. An event heard on `document.body` has therefore crossed a shadow boundary,
 * which only a `composed` event does.
 */
export async function mount(
  inner: string,
  fetchImpl: typeof fetch | undefined,
  attrs: Record<string, string> = {},
  props: Record<string, unknown> = {},
) {
  document.body.innerHTML = '';
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const provider = document.createElement('agentflow-provider') as HTMLElement & Record<string, unknown>;
  for (const [k, v] of Object.entries(attrs)) provider.setAttribute(k, v);
  if (fetchImpl) provider.fetchImpl = fetchImpl;
  Object.assign(provider, props);
  provider.innerHTML = inner;
  root.append(provider);
  document.body.append(host);
  await settle();
  return provider;
}

export const parts = (el: Element, name: string) => [...(el.shadowRoot?.querySelectorAll<HTMLElement>(`[part~="${name}"]`) ?? [])];
export const button = (el: Element, label: string) =>
  parts(el, 'button').concat(parts(el, 'create-button')).find((b) => b.textContent?.trim() === label) as HTMLButtonElement | undefined;
/** The input of the field whose label reads `label`: found through parts, never through ids. */
export const input = (el: Element, label: string) =>
  parts(el, 'field').find((f) => f.querySelector('[part~="label"]')?.textContent?.includes(label))?.querySelector<HTMLInputElement>('[part~="input"]');
export function fill(field: HTMLInputElement | HTMLSelectElement, value: string) {
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}
export function events(target: EventTarget, ...types: string[]) {
  const seen: { type: string; detail: unknown }[] = [];
  for (const t of types) target.addEventListener(t, (e) => seen.push({ type: t, detail: (e as CustomEvent).detail }));
  return seen;
}

export interface ContextValue { state: string; caller: unknown; client: { GET: unknown }; locale: string; t: unknown; report: unknown }
/** A `context-request` as another build of these elements would send it. */
export const contextRequest = (callback: (value: ContextValue, unsubscribe: () => void) => void) =>
  Object.assign(new Event('context-request', { bubbles: true, composed: true }), { context: 'agentflow', subscribe: true, callback });

export const KIT_BUNDLE = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist/kit.js');
export const hasKitBundle = existsSync(KIT_BUNDLE);
if (!hasKitBundle && process.env.CI) throw new Error('The kit contract suite runs against the built dist/kit.js: run `pnpm build` first.');

export interface KitEntry { KIT_TAGS: readonly string[]; KIT_VERSION: string; KIT_CSS: string; defineKitElements(registry?: CustomElementRegistry): void }
export const loadKit = () => import(/* @vite-ignore */ KIT_BUNDLE) as Promise<KitEntry>;
