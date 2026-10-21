import type { components } from '../generated/public.js';
import type { RealtimeChannel } from '../realtime/channel.js';
import type { AppHost, AppTheme } from './contract.js';

/**
 * A host under test, with the controls a person has over what it follows. Its API answers
 * `GET /app/objects` with `appObjects`, and `GET /events/stream` with a stream that stays open until the
 * request is aborted, so a channel the host opens goes live and `openStreams` can tell when the host
 * lets it go. A control resolves once the change has happened; the host may tell its listeners later,
 * and the cases wait for that. The controls keep working after `close()`, so a case can check that a
 * closed host tells nobody.
 */
export interface HostHarness {
  host: AppHost;
  /** A person goes back one entry in the address bar's history. */
  back(): Promise<void>;
  /** A person goes forward one entry. */
  forward(): Promise<void>;
  /** A person follows a link to `hash` (`'#n3'`) on the current page. */
  changeHash(hash: string): Promise<void>;
  /** The person's theme becomes `theme`. The cases change only its `mode`. */
  setTheme(theme: AppTheme): Promise<void>;
  setLocale(locale: string): Promise<void>;
  /** What `host.api.GET('/app/objects')` answers in this harness. */
  appObjects: components['schemas']['AppObjects'];
  /** The absolute base of the API the host's `api` calls, e.g. `http://localhost/agentflow/api`. */
  apiBase: string;
  /** How many event streams the host's API is holding open right now. */
  openStreams(): number;
  /** What unmounting the module does to the host. */
  close(): void;
}

/**
 * Builds a fresh harness. Each case makes its own and closes it. Its host may start at any path but
 * one the cases navigate to; the module's `/` is simplest.
 */
export type HostHarnessFactory = () => Promise<HostHarness>;

export interface HostContractCase {
  readonly name: string;
  /** Resolves when the host keeps this part of the contract; otherwise rejects with an `Error` naming what it expected and what it saw. */
  run(make: HostHarnessFactory): Promise<void>;
}

/** How long a case waits for a host to tell its listeners. */
const WAIT_MS = 2000;
/** How long a case waits before deciding a host told nobody. */
const QUIET_MS = 50;

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function fail(expected: string, seen: unknown): never {
  throw new Error(`expected ${expected}; saw ${JSON.stringify(seen)}`);
}

/** Waits until `check` holds, then fails naming what it expected and what it saw. */
async function until(check: () => boolean, expected: string, seen: () => unknown): Promise<void> {
  const deadline = Date.now() + WAIT_MS;
  while (!check()) {
    if (Date.now() >= deadline) fail(expected, seen());
    await pause(5);
  }
}

/** Waits until `seen` holds as many values as `expected`, gives a late duplicate time to arrive, then compares. */
async function heard<T>(seen: readonly T[], expected: readonly T[], what: string): Promise<void> {
  const want = `${what} ${JSON.stringify(expected)}`;
  await until(() => seen.length >= expected.length, want, () => seen);
  await pause(QUIET_MS);
  if (JSON.stringify(seen) !== JSON.stringify(expected)) fail(want, seen);
}

/** Waits a moment, then fails if `seen` grew past `count`. */
async function nothingMore<T>(seen: readonly T[], count: number, what: string): Promise<void> {
  await pause(QUIET_MS);
  if (seen.length !== count) fail(what, seen.slice(count));
}

/** Subscribes to the location; the listener must be told one path, at once. */
function follow(host: AppHost): string[] {
  const seen: string[] = [];
  host.onLocationChange((path) => seen.push(path));
  const [first] = seen;
  if (seen.length !== 1 || typeof first !== 'string' || !first.startsWith('/')) {
    fail('onLocationChange to tell its listener one path starting with "/" as it subscribes', seen);
  }
  return seen;
}

async function withHarness(make: HostHarnessFactory, body: (harness: HostHarness) => Promise<void>): Promise<void> {
  const harness = await make();
  try {
    await body(harness);
  } finally {
    harness.close();
  }
}

const themeOf = (theme: AppTheme): AppTheme => ({ mode: theme.mode, brand: theme.brand });
const otherMode = (theme: AppTheme): AppTheme => ({ mode: theme.mode === 'dark' ? 'light' : 'dark', brand: theme.brand });
const otherLocale = (locale: string): string => (locale.toLowerCase().startsWith('vi') ? 'en' : 'vi');

/** The same value with every object's keys sorted, so two bodies compare by content. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return Object.fromEntries(entries.map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}

/**
 * The contract v1 cases, framework-neutral: run each against a host, and a failure is the `Error` its
 * `run` rejects with. The SDK runs them against its standalone host, and AgentFlow's frontend against
 * its own, so the two cannot drift.
 */
export const HOST_CONTRACT_CASES: readonly HostContractCase[] = [
  {
    name: 'onLocationChange tells the current path at once, then each navigate, query and fragment included',
    run: (make) =>
      withHarness(make, async ({ host }) => {
        const seen = follow(host);
        const start = seen[0];
        host.navigate('/t/42?tab=notes#n3');
        await heard(seen, [start, '/t/42?tab=notes#n3'], 'onLocationChange to tell');
        host.navigate('/?view=mine');
        await heard(seen, [start, '/t/42?tab=notes#n3', '/?view=mine'], 'onLocationChange to tell');
        const late: string[] = [];
        const stop = host.onLocationChange((path) => late.push(path));
        if (JSON.stringify(late) !== JSON.stringify(['/?view=mine'])) {
          fail('a later listener to be told the current path, ["/?view=mine"], at once', late);
        }
        stop();
        host.navigate('/t/7');
        await heard(seen, [start, '/t/42?tab=notes#n3', '/?view=mine', '/t/7'], 'onLocationChange to tell');
        if (late.length !== 1) fail('a listener that unsubscribed to be told nothing more', late.slice(1));
      }),
  },
  {
    name: 'onLocationChange tells going back and going forward, each once',
    run: (make) =>
      withHarness(make, async (harness) => {
        const { host } = harness;
        const seen = follow(host);
        const start = seen[0];
        host.navigate('/t/1?tab=notes');
        await heard(seen, [start, '/t/1?tab=notes'], 'onLocationChange to tell');
        host.navigate('/t/2#n2');
        await heard(seen, [start, '/t/1?tab=notes', '/t/2#n2'], 'onLocationChange to tell');
        await harness.back();
        await heard(seen, [start, '/t/1?tab=notes', '/t/2#n2', '/t/1?tab=notes'], 'going back to tell');
        await harness.forward();
        await heard(seen, [start, '/t/1?tab=notes', '/t/2#n2', '/t/1?tab=notes', '/t/2#n2'], 'going forward to tell');
      }),
  },
  {
    name: 'onLocationChange tells a fragment change',
    run: (make) =>
      withHarness(make, async (harness) => {
        const { host } = harness;
        const seen = follow(host);
        const start = seen[0];
        host.navigate('/t/42?tab=notes');
        await heard(seen, [start, '/t/42?tab=notes'], 'onLocationChange to tell');
        await harness.changeHash('#n3');
        await heard(seen, [start, '/t/42?tab=notes', '/t/42?tab=notes#n3'], 'a fragment change to tell');
        await harness.changeHash('#n4');
        await heard(
          seen,
          [start, '/t/42?tab=notes', '/t/42?tab=notes#n3', '/t/42?tab=notes#n4'],
          'a fragment change to tell',
        );
      }),
  },
  {
    name: 'the theme follows live: context.theme changes in place, and onThemeChange says so, not as it subscribes',
    run: (make) =>
      withHarness(make, async (harness) => {
        const { host } = harness;
        const context = host.context;
        const next = otherMode(context.theme);
        const seen: AppTheme[] = [];
        host.onThemeChange((theme) => seen.push(themeOf(theme)));
        await nothingMore(seen, 0, 'onThemeChange not to call its listener as it subscribes');
        await harness.setTheme(next);
        await heard(seen, [next], 'onThemeChange to tell');
        if (host.context !== context) fail('host.context to stay the same object', 'another object');
        if (JSON.stringify(themeOf(context.theme)) !== JSON.stringify(next)) {
          fail(`context.theme to read ${JSON.stringify(next)}`, context.theme);
        }
        const again = otherMode(next);
        await harness.setTheme(again);
        await heard(seen, [next, again], 'onThemeChange to tell');
      }),
  },
  {
    name: 'the locale follows live: context.locale changes in place, and onLocaleChange says so, not as it subscribes nor when it stays the same',
    run: (make) =>
      withHarness(make, async (harness) => {
        const { host } = harness;
        const context = host.context;
        const before = context.locale;
        const next = otherLocale(before);
        const seen: string[] = [];
        host.onLocaleChange((locale) => seen.push(locale));
        await nothingMore(seen, 0, 'onLocaleChange not to call its listener as it subscribes');
        await harness.setLocale(before);
        await nothingMore(seen, 0, `onLocaleChange not to call its listener when the locale stays ${before}`);
        await harness.setLocale(next);
        await heard(seen, [next], 'onLocaleChange to tell');
        if (host.context !== context) fail('host.context to stay the same object', 'another object');
        if (context.locale !== next) fail(`context.locale to read ${JSON.stringify(next)}`, context.locale);
        await harness.setLocale(before);
        await heard(seen, [next, before], 'onLocaleChange to tell');
      }),
  },
  {
    name: "host.api.GET('/app/objects') answers the app's own objects and parameters",
    run: (make) =>
      withHarness(make, async ({ host, appObjects }) => {
        const { data, error, response } = await host.api.GET('/app/objects');
        if (!response.ok || error !== undefined) fail('GET /app/objects to answer 200', { status: response.status, error });
        if (JSON.stringify(canonical(data)) !== JSON.stringify(canonical(appObjects))) {
          fail(`GET /app/objects to answer ${JSON.stringify(appObjects)}`, data);
        }
      }),
  },
  {
    name: "host.apiUrl makes an absolute URL under the API's base that the browser can open, query kept, with or without a leading slash",
    run: (make) =>
      withHarness(make, async ({ host, apiBase }) => {
        const href = host.apiUrl('/attachments/a1/download?inline=1');
        let url: URL;
        try {
          url = new URL(href);
        } catch {
          fail("apiUrl('/attachments/a1/download?inline=1') to be an absolute URL", href);
        }
        if (!url.pathname.endsWith('/attachments/a1/download') || url.search !== '?inline=1') {
          fail("apiUrl('/attachments/a1/download?inline=1') to end with /attachments/a1/download?inline=1", href);
        }
        const under = `${apiBase}/attachments/a1/download?inline=1`;
        if (href !== under) fail(`apiUrl('/attachments/a1/download?inline=1') to be ${JSON.stringify(under)}`, href);
        const slashed = host.apiUrl('/attachments/a1/download');
        const bare = host.apiUrl('attachments/a1/download');
        if (bare !== slashed) fail(`apiUrl('attachments/a1/download') to be ${JSON.stringify(slashed)}`, bare);
      }),
  },
  {
    name: 'a closed host tells no listener, ends the stream its channel held open, and hands out a closed channel that never opens one',
    async run(make) {
      // An open host's channel goes live and holds a stream against this harness, and closing the host
      // lets that stream go. A closed channel's status does not change, so the stream count is what shows
      // it. Checked first, so the check that a closed host's channel never opens one cannot pass merely
      // because nothing answers the stream or the harness counts none.
      const open = await make();
      let opened: RealtimeChannel;
      try {
        const channel = open.host.realtime;
        opened = channel;
        await until(() => channel.status() === 'live', "an open host's channel to go live", () => channel.status());
        await until(
          () => open.openStreams() > 0,
          "an open host's channel to hold an event stream open",
          () => ({ openStreams: open.openStreams() }),
        );
      } finally {
        open.close();
      }
      await until(
        () => open.openStreams() === 0,
        'a host that is closed to end the event stream its channel held open',
        () => ({ openStreams: open.openStreams() }),
      );
      if (open.host.realtime !== opened) {
        fail('a read of realtime after close to hand out the channel already opened', 'another channel');
      }

      const harness = await make();
      const { host } = harness;
      let closed = false;
      try {
        const paths = follow(host);
        const start = paths[0];
        host.navigate('/t/9?closing=1');
        await heard(paths, [start, '/t/9?closing=1'], 'onLocationChange to tell');
        const themes: AppTheme[] = [];
        const locales: string[] = [];
        host.onThemeChange((theme) => themes.push(themeOf(theme)));
        host.onLocaleChange((locale) => locales.push(locale));
        harness.close();
        closed = true;
        await harness.changeHash('#closed');
        await harness.back();
        await harness.forward();
        await harness.setTheme(otherMode(host.context.theme));
        await harness.setLocale(otherLocale(host.context.locale));
        await pause(QUIET_MS);
        if (paths.length !== 2 || themes.length !== 0 || locales.length !== 0) {
          fail('a closed host to tell no listener', { paths: paths.slice(2), themes, locales });
        }
        const channel = host.realtime;
        if (host.realtime !== channel) fail('every read of realtime after close to hand out the same channel', 'another channel');
        await pause(QUIET_MS);
        if (harness.openStreams() !== 0) {
          fail('the channel a closed host hands out never to open an event stream', { openStreams: harness.openStreams() });
        }
      } finally {
        if (!closed) harness.close();
      }
    },
  },
];
