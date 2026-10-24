// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AF_DEFAULT_PALETTE, createModuleContainer, createStandaloneHost } from '../src/index.js';

const CALLER = { id: 'u1', kind: 'person', display_name: 'Bo Tran', email: 'bo@example.com', org_id: 'o1', org_name: 'Acme' };

/** A `prefers-color-scheme` query the test can flip. */
function scheme(dark: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: dark,
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  };
  vi.stubGlobal('matchMedia', () => query);
  return { set(next: boolean) { query.matches = next; for (const l of listeners) l(); } };
}

/** A `navigator.language` the test can change, announced as the browser does. */
function language(initial: string) {
  let current = initial;
  Object.defineProperty(window.navigator, 'language', { configurable: true, get: () => current });
  return {
    set(next: string) {
      current = next;
      window.dispatchEvent(new Event('languagechange'));
    },
  };
}

/** Moves the address bar's fragment as a link to `#…` does, and waits for the browser to say so. */
async function followFragment(hash: string): Promise<void> {
  const changed = new Promise((resolve) => window.addEventListener('hashchange', resolve, { once: true }));
  window.location.hash = hash;
  await changed;
}

function setup() {
  const requests: Request[] = [];
  const fetch = vi.fn(async (request: Request) => {
    requests.push(request);
    if (new URL(request.url).pathname.endsWith('/caller')) return Response.json(CALLER);
    return new Promise<Response>(() => {});
  });
  const element = document.createElement('div');
  const { portalRoot } = createModuleContainer(element);
  return { requests, fetch, element, portalRoot };
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window.navigator, 'language');
  window.history.replaceState(null, '', '/');
});

describe('createStandaloneHost', () => {
  it('reads who is signed in through the SDK proxy and carries it as context', async () => {
    scheme(false);
    const { fetch, element, portalRoot, requests } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch, brand: 'desk' });
    expect(new URL(requests[0]!.url).pathname).toBe('/agentflow/api/caller');
    expect(requests[0]!.credentials).toBe('same-origin');
    expect(host.context.person).toEqual({ id: 'u1', name: 'Bo Tran', email: 'bo@example.com' });
    expect(host.context.org).toEqual({ id: 'o1', name: 'Acme' });
    expect(host.contractVersion).toBe(2);
    expect(host.portalRoot).toBe(portalRoot);
    host.close();
  });

  it('offers no assistant', async () => {
    scheme(false);
    const { fetch, element, portalRoot } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch, brand: 'desk' });
    expect(host.assistant).toBeUndefined();
    host.close();
  });

  it('themes the container from the colour scheme, and follows it when it changes', async () => {
    const media = scheme(false);
    const { fetch, element, portalRoot } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch, brand: 'desk' });
    expect(element.dataset.theme).toBe('light');
    expect(element.style.getPropertyValue('--af-primary')).toBe(AF_DEFAULT_PALETTE.light['--af-primary']);
    const seen: string[] = [];
    host.onThemeChange((theme) => seen.push(`${theme.mode} ${theme.brand}`));
    media.set(true);
    expect(seen).toEqual(['dark desk']);
    expect(host.context.theme.mode).toBe('dark');
    expect(element.dataset.theme).toBe('dark');
    expect(element.style.getPropertyValue('--af-primary')).toBe(AF_DEFAULT_PALETTE.dark['--af-primary']);
    host.close();
    media.set(false);
    expect(seen).toEqual(['dark desk']);
  });

  it('navigates under its base path and tells listeners, the browser\'s back button included', async () => {
    scheme(false);
    window.history.replaceState(null, '', '/desk/t/1');
    const { fetch, element, portalRoot } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch, basePath: '/desk' });
    const seen: string[] = [];
    host.onLocationChange((path) => seen.push(path));
    expect(seen).toEqual(['/t/1']);
    host.navigate('/t/2');
    expect(window.location.pathname).toBe('/desk/t/2');
    window.history.replaceState(null, '', '/desk/t/1');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(seen).toEqual(['/t/1', '/t/2', '/t/1']);
    host.close();
  });

  it('makes absolute URLs under the SDK proxy\'s API for the browser to open, query kept', async () => {
    scheme(false);
    const { fetch, element, portalRoot } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch });
    const api = `${window.location.origin}/agentflow/api`;
    expect(host.apiUrl('/attachments/a1/download?inline=1')).toBe(`${api}/attachments/a1/download?inline=1`);
    expect(host.apiUrl('attachments/a1/download')).toBe(`${api}/attachments/a1/download`);
    const mounted = await createStandaloneHost({ container: element, portalRoot, fetch, sdkBasePath: '/af/' });
    expect(mounted.apiUrl('/attachments/a1/download')).toBe(`${window.location.origin}/af/api/attachments/a1/download`);
    host.close();
    mounted.close();
  });

  it('reports the query and the fragment, and a fragment change once, then nothing after close', async () => {
    scheme(false);
    window.history.replaceState(null, '', '/desk/t/1?tab=notes');
    const { fetch, element, portalRoot } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch, basePath: '/desk' });
    const seen: string[] = [];
    host.onLocationChange((path) => seen.push(path));
    expect(seen).toEqual(['/t/1?tab=notes']);
    host.navigate('/t/2?tab=notes#n3');
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe('/desk/t/2?tab=notes#n3');
    await followFragment('#n4');
    expect(seen).toEqual(['/t/1?tab=notes', '/t/2?tab=notes#n3', '/t/2?tab=notes#n4']);
    host.close();
    await followFragment('#n5');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(seen).toEqual(['/t/1?tab=notes', '/t/2?tab=notes#n3', '/t/2?tab=notes#n4']);
  });

  it('follows the browser\'s language, telling listeners only when it changed, and not after close', async () => {
    scheme(false);
    const lang = language('en-US');
    const { fetch, element, portalRoot } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch });
    const context = host.context;
    expect(context.locale).toBe('en-US');
    const seen: string[] = [];
    host.onLocaleChange((locale) => seen.push(locale));
    expect(seen).toEqual([]);
    lang.set('en-US');
    expect(seen).toEqual([]);
    lang.set('vi-VN');
    expect(seen).toEqual(['vi-VN']);
    expect(host.context).toBe(context);
    expect(context.locale).toBe('vi-VN');
    host.close();
    lang.set('en-US');
    expect(seen).toEqual(['vi-VN']);
    expect(context.locale).toBe('vi-VN');
  });

  it('opens the real-time channel only when it is read, once, and closes it on close', async () => {
    scheme(false);
    const { fetch, element, portalRoot, requests } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch });
    const streams = () => requests.filter((r) => new URL(r.url).pathname.endsWith('/events/stream'));
    await vi.waitFor(() => expect(requests).toHaveLength(1));
    expect(streams()).toHaveLength(0);
    const channel = host.realtime;
    expect(host.realtime).toBe(channel);
    await vi.waitFor(() => expect(streams()).toHaveLength(1));
    expect(new URL(streams()[0]!.url).searchParams.get('presence')).toBe('true');
    host.close();
    expect(streams()[0]!.signal.aborted).toBe(true);
  });

  it('keeps the channel closed once the host is closed: a later read is the same channel, not a new stream', async () => {
    scheme(false);
    const { fetch, element, portalRoot, requests } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch });
    const streams = () => requests.filter((r) => new URL(r.url).pathname.endsWith('/events/stream'));
    const channel = host.realtime;
    await vi.waitFor(() => expect(streams()).toHaveLength(1));
    host.close();
    expect(host.realtime).toBe(channel);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(streams()).toHaveLength(1);
  });

  it('hands out a closed channel when the host was closed before the channel was ever read', async () => {
    scheme(false);
    const { fetch, element, portalRoot, requests } = setup();
    const host = await createStandaloneHost({ container: element, portalRoot, fetch });
    host.close();
    const channel = host.realtime;
    expect(host.realtime).toBe(channel);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(requests.filter((r) => new URL(r.url).pathname.endsWith('/events/stream'))).toHaveLength(0);
  });
});
