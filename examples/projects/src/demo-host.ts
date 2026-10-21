import {
  AF_DEFAULT_PALETTE, APP_CONTRACT_VERSION, applyTheme, createAgentFlowClient, hostPath, modulePath, proxyAdapter,
  type AfPalette, type AppContext, type AppHost, type AppTheme, type RealtimeChannel,
} from '@reflexify/agentflow-sdk';
import type { MemoryServer } from './api/memory-server.js';

export interface MemoryHost extends AppHost {
  /** Stops following the address bar, the colour scheme and the language. */
  close(): void;
}

/** AgentFlow's own brand and palette, in its own font, so the demo looks as the module does inside AgentFlow. */
export const DEMO_BRAND = 'agentflow';
const FONT = "'Geist', ui-sans-serif, system-ui, sans-serif";
export const DEMO_PALETTE: { light: AfPalette; dark: AfPalette } = {
  light: { ...AF_DEFAULT_PALETTE.light, '--af-font-sans': FONT },
  dark: { ...AF_DEFAULT_PALETTE.dark, '--af-font-sans': FONT },
};

/** A channel that never connects: the demo's live layer is the memory server's own, so nothing listens to this one. */
function idleChannel(): RealtimeChannel {
  const none = () => () => undefined;
  return {
    status: () => 'polling',
    onStatus: none,
    onEvent: none,
    onRefetch: none,
    onPresence: none,
    onRevoked: none,
    watch: () => undefined,
    retry: () => undefined,
    close: () => undefined,
  };
}

/** The base the demo's client calls; the memory server answers any path under it. */
const MEMORY_API = 'http://projects.memory/agentflow/api';

/** The page's own query keys, as opposed to the module's: the demo stays the demo across the module's navigations. */
const PAGE_KEYS: readonly string[] = ['demo'];

/**
 * The page is the demo only while its address says `?demo`, so a path the module goes to keeps the page's own keys
 * from the current address, and only those: the rest of the query is the module's, and the path already says what it
 * wants of it (a default left out stays left out).
 */
export function keepQuery(path: string, search: string, keys: readonly string[] = PAGE_KEYS): string {
  const page = new URLSearchParams(search);
  const hashAt = path.indexOf('#');
  const hash = hashAt < 0 ? '' : path.slice(hashAt);
  const rest = hashAt < 0 ? path : path.slice(0, hashAt);
  const queryAt = rest.indexOf('?');
  const pathname = queryAt < 0 ? rest : rest.slice(0, queryAt);
  const own = new URLSearchParams(queryAt < 0 ? '' : rest.slice(queryAt));
  const parts = [...own].map(([k, v]) => [k, v] as const);
  for (const key of keys) if (page.has(key) && !own.has(key)) parts.push([key, page.get(key)!]);
  if (parts.length === own.size) return path;
  // A flag such as `demo` stays a bare word rather than becoming `demo=`.
  const query = parts.map(([k, v]) => (v === '' ? encodeURIComponent(k) : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)).join('&');
  return `${pathname}?${query}${hash}`;
}

/**
 * The host the demo mounts Projects on: the SDK's own client over the in-memory AgentFlow, the address bar under `/`,
 * and the browser's colour scheme and language, as AgentFlow's own page has them.
 */
export function createMemoryHost(opts: {
  server: MemoryServer;
  /** Who the demo is signed in as. The module takes its viewer from here, not from the server. */
  you: AppContext['person'];
  container: HTMLElement;
  portalRoot: Element;
  /** For tests. */
  window?: Window;
}): MemoryHost {
  const win = opts.window ?? window;
  const basePath = '/';
  const api = createAgentFlowClient({ baseUrl: MEMORY_API, auth: proxyAdapter(), fetch: opts.server.fetch, maxRetries: 0 });
  const scheme = win.matchMedia('(prefers-color-scheme: dark)');
  const themeNow = (): AppTheme => ({ mode: scheme.matches ? 'dark' : 'light', brand: DEMO_BRAND });
  const context: AppContext = {
    person: opts.you,
    org: { id: 'org', name: 'Công ty Demo' },
    locale: win.navigator.language,
    theme: themeNow(),
  };
  applyTheme(opts.container, context.theme, DEMO_PALETTE);

  const places = new Set<(path: string) => void>();
  const themes = new Set<(theme: AppTheme) => void>();
  const locales = new Set<(locale: string) => void>();
  const tell = <T>(listeners: Set<(value: T) => void>, value: T) => {
    for (const listener of [...listeners]) listener(value);
  };
  const here = () => modulePath(win.location.pathname + win.location.search + win.location.hash, basePath);
  let told = here();
  // A link to `#…` fires both `popstate` and `hashchange`, and so does going back across a fragment: each change is
  // told once.
  const onMove = () => {
    const next = here();
    if (next === told) return;
    told = next;
    tell(places, next);
  };
  const onScheme = () => {
    context.theme = themeNow();
    applyTheme(opts.container, context.theme, DEMO_PALETTE);
    tell(themes, context.theme);
  };
  const onLanguage = () => {
    const locale = win.navigator.language;
    if (locale === context.locale) return;
    context.locale = locale;
    tell(locales, locale);
  };
  scheme.addEventListener('change', onScheme);
  win.addEventListener('languagechange', onLanguage);
  win.addEventListener('popstate', onMove);
  win.addEventListener('hashchange', onMove);

  return {
    contractVersion: APP_CONTRACT_VERSION,
    api,
    basePath,
    // Under the same base the client calls. Nothing answers it in a browser: the demo sends nothing anywhere.
    apiUrl: (to) => `${MEMORY_API}${to.startsWith('/') ? to : `/${to}`}`,
    navigate(path) {
      win.history.pushState(null, '', hostPath(basePath, keepQuery(path, win.location.search)));
      onMove();
    },
    onLocationChange(listener) {
      places.add(listener);
      listener(here());
      return () => void places.delete(listener);
    },
    realtime: idleChannel(),
    context,
    onThemeChange(listener) {
      themes.add(listener);
      return () => void themes.delete(listener);
    },
    onLocaleChange(listener) {
      locales.add(listener);
      return () => void locales.delete(listener);
    },
    portalRoot: opts.portalRoot,
    close() {
      scheme.removeEventListener('change', onScheme);
      win.removeEventListener('languagechange', onLanguage);
      win.removeEventListener('popstate', onMove);
      win.removeEventListener('hashchange', onMove);
      places.clear();
      themes.clear();
      locales.clear();
    },
  };
}
