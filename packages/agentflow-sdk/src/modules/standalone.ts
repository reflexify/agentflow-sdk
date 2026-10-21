import { proxyAdapter } from '../auth.js';
import { createAgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import { createRealtimeChannel, type RealtimeChannel } from '../realtime/channel.js';
import { APP_CONTRACT_VERSION, hostPath, modulePath, type AppContext, type AppHost, type AppTheme } from './contract.js';
import { AF_DEFAULT_PALETTE, applyTheme, type AfPalette } from './tokens.js';

export interface StandaloneHostOptions {
  /** The element whose shadow root holds the module (see `createModuleContainer`); it carries the theme. */
  container: HTMLElement;
  portalRoot: Element;
  /** Where the SDK server is mounted, as `createAgentFlowServer` was given it. Default `/agentflow`. */
  sdkBasePath?: string;
  /** The module's place in the address bar. Default `/`. */
  basePath?: string;
  /** The app's brand, for `data-brand`. Default `agentflow`. */
  brand?: string;
  /** The token values for light and dark. Default AgentFlow's. */
  palette?: { light: AfPalette; dark: AfPalette };
  /** For tests: the window whose address bar, colour scheme and language the host follows. */
  window?: Window;
  /** For tests. */
  fetch?: (request: Request) => Promise<Response>;
}

export interface StandaloneHost extends AppHost {
  /** Stop following the address bar, the colour scheme and the language, and close the channel if it was opened. */
  close(): void;
}

/** Calls each listener in its own `try`: one that throws costs neither the others nor the host. */
function tell<T>(listeners: Set<(value: T) => void>, value: T): void {
  for (const listener of [...listeners]) {
    try {
      listener(value);
    } catch (error) {
      queueMicrotask(() => {
        throw error;
      });
    }
  }
}

/**
 * The host an app's own site gives its module: the SDK server's proxy for the API and the real-time
 * channel, the browser's history for navigation, and the colour scheme and language for the context.
 * Signed-in only: it reads `/caller` first, and refuses with `AgentFlowError` when there is no session.
 */
export async function createStandaloneHost(opts: StandaloneHostOptions): Promise<StandaloneHost> {
  const win = opts.window ?? window;
  const basePath = opts.basePath ?? '/';
  const baseUrl = `${win.location.origin}${(opts.sdkBasePath ?? '/agentflow').replace(/\/+$/, '')}/api`;
  const auth = proxyAdapter();
  const transport = opts.fetch ? { fetch: opts.fetch } : {};
  const api = createAgentFlowClient({ baseUrl, auth, ...transport });
  const caller = await ok(api.GET('/caller'));
  const palette = opts.palette ?? AF_DEFAULT_PALETTE;
  const brand = opts.brand ?? 'agentflow';
  const scheme = win.matchMedia('(prefers-color-scheme: dark)');
  const themeNow = (): AppTheme => ({ mode: scheme.matches ? 'dark' : 'light', brand });
  const context: AppContext = {
    person: { id: caller.id, name: caller.display_name, email: caller.email ?? null },
    org: { id: caller.org_id, name: caller.org_name ?? null },
    locale: win.navigator.language,
    theme: themeNow(),
  };
  applyTheme(opts.container, context.theme, palette);

  const themeListeners = new Set<(theme: AppTheme) => void>();
  const onScheme = () => {
    context.theme = themeNow();
    applyTheme(opts.container, context.theme, palette);
    tell(themeListeners, context.theme);
  };
  scheme.addEventListener('change', onScheme);

  const localeListeners = new Set<(locale: string) => void>();
  const onLanguage = () => {
    const locale = win.navigator.language;
    if (locale === context.locale) return;
    context.locale = locale;
    tell(localeListeners, locale);
  };
  win.addEventListener('languagechange', onLanguage);

  const locationListeners = new Set<(path: string) => void>();
  const pathNow = () =>
    modulePath(`${win.location.pathname}${win.location.search}${win.location.hash}`, basePath);
  let path = pathNow();
  // A link to `#…` fires both `popstate` and `hashchange`, and so does going back across a fragment:
  // each change is told once.
  const onMove = () => {
    const next = pathNow();
    if (next === path) return;
    path = next;
    tell(locationListeners, next);
  };
  win.addEventListener('popstate', onMove);
  win.addEventListener('hashchange', onMove);

  let channel: RealtimeChannel | undefined;
  let closed = false;
  return {
    contractVersion: APP_CONTRACT_VERSION,
    api,
    apiUrl: (path) => `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`,
    basePath,
    navigate(to) {
      win.history.pushState(null, '', hostPath(basePath, to));
      onMove();
    },
    onLocationChange(listener) {
      locationListeners.add(listener);
      tell(new Set([listener]), pathNow());
      return () => void locationListeners.delete(listener);
    },
    get realtime() {
      if (!channel) {
        channel = createRealtimeChannel({ baseUrl, auth, client: api, presence: true, ...transport });
        // A host that is already closed hands out a closed channel: nothing to reopen.
        if (closed) channel.close();
      }
      return channel;
    },
    context,
    onThemeChange(listener) {
      themeListeners.add(listener);
      return () => void themeListeners.delete(listener);
    },
    onLocaleChange(listener) {
      localeListeners.add(listener);
      return () => void localeListeners.delete(listener);
    },
    portalRoot: opts.portalRoot,
    close() {
      closed = true;
      scheme.removeEventListener('change', onScheme);
      win.removeEventListener('languagechange', onLanguage);
      win.removeEventListener('popstate', onMove);
      win.removeEventListener('hashchange', onMove);
      channel?.close();
      themeListeners.clear();
      localeListeners.clear();
      locationListeners.clear();
    },
  };
}
