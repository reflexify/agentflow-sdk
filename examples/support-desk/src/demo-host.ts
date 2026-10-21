import {
  APP_CONTRACT_VERSION, applyTheme, createAgentFlowClient, hostPath, modulePath, proxyAdapter,
  type AppContext, type AppHost, type AppTheme, type RealtimeChannel,
} from '@reflexify/agentflow-sdk';
import type { MemoryServer } from './api/memory-server.js';
import { DESK_BRAND, DESK_PALETTE } from './styles/palette.js';

export interface MemoryHost extends AppHost {
  /** Stops following the address bar, the colour scheme and the language. */
  close(): void;
}

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
const MEMORY_API = 'http://desk.memory/agentflow/api';

/** The page is the demo only while its address says `?demo`, so a path the desk goes to keeps the page's query. */
function keepQuery(path: string, search: string): string {
  if (!search || path.includes('?')) return path;
  const hash = path.indexOf('#');
  return hash < 0 ? `${path}${search}` : `${path.slice(0, hash)}${search}${path.slice(hash)}`;
}

/**
 * The host the demo mounts the desk on: the SDK's own client over the in-memory AgentFlow, the address bar under `/`,
 * and the browser's colour scheme and language, as the desk's own site has them.
 */
export function createMemoryHost(opts: {
  server: MemoryServer;
  /** Who the demo is signed in as: the person the memory server's `/caller` answers. */
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
  const themeNow = (): AppTheme => ({ mode: scheme.matches ? 'dark' : 'light', brand: DESK_BRAND });
  const context: AppContext = {
    person: opts.you,
    org: { id: 'org', name: 'Linden Books' },
    locale: win.navigator.language,
    theme: themeNow(),
  };
  applyTheme(opts.container, context.theme, DESK_PALETTE);

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
    applyTheme(opts.container, context.theme, DESK_PALETTE);
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
