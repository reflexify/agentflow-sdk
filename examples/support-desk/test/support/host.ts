import { createAgentFlowClient, proxyAdapter, type AppHost, type AppTheme } from '@reflexify/agentflow-sdk';
import type { MemoryServer } from '../../src/api/memory-server.js';
import { fakeChannel, type FakeChannel } from './channel.js';

/** Where AgentFlow mounts the desk. */
export const BASE_PATH = '/apps/support-desk';
/** The base the fake host's client calls. */
export const MEMORY_API = 'http://desk.memory/agentflow/api';

/** An `AppHost` the test drives, over the in-memory AgentFlow. */
export interface FakeHost extends AppHost {
  /** The channel `realtime` hands out, every time. */
  readonly channel: FakeChannel;
  /** The paths the module asked to go to, in order. */
  readonly navigated: string[];
  /** The address bar moves without the module asking: back, forward, a link. */
  go(path: string): void;
  setLocale(locale: string): void;
  setTheme(theme: AppTheme): void;
  /** The listeners the module holds on the host now. */
  listening(): { location: number; theme: number; locale: number };
  /** How often the module has read `realtime`. */
  realtimeReads(): number;
}

export function fakeHost(opts: {
  server: MemoryServer;
  portalRoot: Element;
  /** The module's path when it mounts. Default `/`. */
  path?: string;
  /** Default `en-GB`. */
  locale?: string;
  /** Answers a request before the memory server does, or leaves it to the memory server with `undefined`. */
  intercept?: (request: Request) => Response | Promise<Response> | undefined;
  /** What `apiUrl` answers. Default: the base the client calls, plus the path. */
  apiUrl?: (path: string) => string;
}): FakeHost {
  const send = async (request: Request) => (await opts.intercept?.(request)) ?? opts.server.fetch(request);
  const api = createAgentFlowClient({ baseUrl: MEMORY_API, auth: proxyAdapter(), fetch: send, maxRetries: 0 });
  const places = new Set<(path: string) => void>();
  const themes = new Set<(theme: AppTheme) => void>();
  const locales = new Set<(locale: string) => void>();
  const tell = <T>(listeners: Set<(value: T) => void>, value: T) => { for (const l of [...listeners]) l(value); };
  const channel = fakeChannel();
  const navigated: string[] = [];
  let path = opts.path ?? '/';
  let reads = 0;
  const host: FakeHost = {
    contractVersion: 1,
    api,
    basePath: BASE_PATH,
    apiUrl: opts.apiUrl ?? ((path) => `${MEMORY_API}${path}`),
    navigate(next) {
      navigated.push(next);
      path = next;
      tell(places, path);
    },
    onLocationChange(listener) {
      places.add(listener);
      listener(path);
      return () => void places.delete(listener);
    },
    get realtime() {
      reads += 1;
      return channel.channel;
    },
    context: {
      person: { id: '10000000-0000-4000-8000-000000000001', name: 'Bo Tran', email: 'bo@lindenbooks.test' },
      org: { id: 'org', name: 'Linden Books' },
      locale: opts.locale ?? 'en-GB',
      theme: { mode: 'light', brand: 'azure' },
    },
    onThemeChange(listener) {
      themes.add(listener);
      return () => void themes.delete(listener);
    },
    onLocaleChange(listener) {
      locales.add(listener);
      return () => void locales.delete(listener);
    },
    portalRoot: opts.portalRoot,
    channel,
    navigated,
    go(next) {
      path = next;
      tell(places, path);
    },
    setLocale(locale) {
      host.context.locale = locale;
      tell(locales, locale);
    },
    setTheme(theme) {
      host.context.theme = theme;
      tell(themes, theme);
    },
    listening: () => ({ location: places.size, theme: themes.size, locale: locales.size }),
    realtimeReads: () => reads,
  };
  return host;
}
