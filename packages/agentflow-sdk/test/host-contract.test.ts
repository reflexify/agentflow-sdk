// @vitest-environment jsdom
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createModuleContainer, createStandaloneHost, HOST_CONTRACT_CASES } from '../src/index.js';
import type { AppTheme, components, HostHarness } from '../src/index.js';

const CALLER = { id: 'u1', kind: 'person', display_name: 'Bo Tran', email: 'bo@example.com', org_id: 'o1', org_name: 'Acme' };

const APP_OBJECTS: components['schemas']['AppObjects'] = {
  revision: 7,
  objects: [
    {
      logical_key: 'entity:ticket',
      kind: 'entity',
      key: 'ticket',
      id: '0190f0a8-1b2c-7d3e-8f40-123456789abc',
      state: 'live',
      source: 'own',
      parent: null,
      feature: null,
      contract: null,
      contract_version: null,
      customized: false,
    },
  ],
  parameters: { support_group_id: '0190f0a8-1b2c-7d3e-8f40-123456789abd' },
};

/**
 * What the SDK server's proxy answers: who is signed in, the app's objects, and a stream that stays
 * open until its request is aborted. `streams.open` counts the streams answered and not yet aborted.
 */
function proxy(streams: { open: number }, objects: { current: components['schemas']['AppObjects'] }): (request: Request) => Promise<Response> {
  return async (request) => {
    const path = new URL(request.url).pathname;
    if (path === '/agentflow/api/caller') return Response.json(CALLER);
    if (path === '/agentflow/api/app/objects') return Response.json(objects.current, { headers: { 'agentflow-app-revision': String(objects.current.revision) } });
    if (path === '/agentflow/api/events/stream') {
      if (!request.signal.aborted) {
        streams.open += 1;
        request.signal.addEventListener('abort', () => (streams.open -= 1), { once: true });
      }
      return new Response(new ReadableStream<Uint8Array>(), { status: 200, headers: { 'content-type': 'text/event-stream' } });
    }
    return Response.json({ type: 'NOT_FOUND' }, { status: 404 });
  };
}

/** Resolves on the window's next `type` event, listening before `act` so the event cannot be missed. */
function next(type: string, act: () => void): Promise<void> {
  const fired = new Promise<void>((resolve) => window.addEventListener(type, () => resolve(), { once: true }));
  act();
  return fired;
}

/** The standalone host over jsdom's address bar, a colour scheme and a language the harness moves. */
async function standaloneHarness(): Promise<HostHarness> {
  window.history.replaceState(null, '', '/desk/');
  let dark = false;
  const schemeListeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return dark;
    },
    addEventListener: (_: string, listener: () => void) => schemeListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => schemeListeners.delete(listener),
  }));
  let language = 'en-US';
  Object.defineProperty(window.navigator, 'language', { configurable: true, get: () => language });
  const element = document.createElement('div');
  document.body.append(element);
  const { portalRoot } = createModuleContainer(element);
  const streams = { open: 0 };
  const objects = { current: APP_OBJECTS };
  const host = await createStandaloneHost({
    container: element,
    portalRoot,
    basePath: '/desk',
    brand: 'desk',
    fetch: proxy(streams, objects),
  });
  return {
    host,
    back: () => next('popstate', () => window.history.back()),
    forward: () => next('popstate', () => window.history.forward()),
    changeHash: (hash) =>
      next('hashchange', () => {
        window.location.hash = hash;
      }),
    // The standalone host's brand is the app's own; only the mode follows the colour scheme.
    async setTheme(theme: AppTheme) {
      dark = theme.mode === 'dark';
      for (const listener of [...schemeListeners]) listener();
    },
    async setLocale(locale) {
      language = locale;
      window.dispatchEvent(new Event('languagechange'));
    },
    appObjects: APP_OBJECTS,
    async setAppObjects(next) {
      objects.current = next;
    },
    apiBase: `${window.location.origin}/agentflow/api`,
    openStreams: () => streams.open,
    close() {
      host.close();
      element.remove();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window.navigator, 'language');
  window.history.replaceState(null, '', '/');
});

describe('the standalone host keeps the host contract', () => {
  for (const contractCase of HOST_CONTRACT_CASES) {
    it(contractCase.name, () => contractCase.run(standaloneHarness));
  }
});

describe('the host contract cases', () => {
  it('cover the path, the theme, the locale, /app/objects, apiUrl and a closed host, each named once', () => {
    const names = HOST_CONTRACT_CASES.map((contractCase) => contractCase.name);
    expect(new Set(names).size).toBe(names.length);
    for (const topic of ['navigate', 'back', 'forward', 'fragment', 'theme', 'locale', '/app/objects', 'apiUrl', 'closed']) {
      expect(names.some((name) => name.includes(topic)), topic).toBe(true);
    }
  });

  it('need no test framework: they import only the SDK\'s own modules', async () => {
    const source = await readFile(join(dirname(fileURLToPath(import.meta.url)), '../src/modules/contract-cases.ts'), 'utf8');
    const specifiers = [...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((match) => match[1]!);
    expect(specifiers.length).toBeGreaterThan(0);
    expect(specifiers.filter((specifier) => !specifier.startsWith('.'))).toEqual([]);
  });

  it('fail with an Error naming what was expected and what was seen', async () => {
    const locale = HOST_CONTRACT_CASES.find((contractCase) => contractCase.name.includes('locale'))!;
    // A host that calls a locale listener as it subscribes, which the contract says it must not.
    const eager = async (): Promise<HostHarness> => {
      const harness = await standaloneHarness();
      const { host } = harness;
      const subscribe = host.onLocaleChange;
      host.onLocaleChange = (listener) => {
        listener(host.context.locale);
        return subscribe(listener);
      };
      return harness;
    };
    await expect(locale.run(eager)).rejects.toThrow(
      new Error('expected onLocaleChange not to call its listener as it subscribes; saw ["en-US"]'),
    );
  });
});
