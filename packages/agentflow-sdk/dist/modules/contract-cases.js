import { getAppObjects } from '../app/objects.js';
/** How long a case waits for a host to tell its listeners. */
const WAIT_MS = 2000;
/** How long a case waits before deciding a host told nobody. */
const QUIET_MS = 50;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function fail(expected, seen) {
    throw new Error(`expected ${expected}; saw ${JSON.stringify(seen)}`);
}
/** Waits until `check` holds, then fails naming what it expected and what it saw. */
async function until(check, expected, seen) {
    const deadline = Date.now() + WAIT_MS;
    while (!check()) {
        if (Date.now() >= deadline)
            fail(expected, seen());
        await pause(5);
    }
}
/** Waits until `seen` holds as many values as `expected`, gives a late duplicate time to arrive, then compares. */
async function heard(seen, expected, what) {
    const want = `${what} ${JSON.stringify(expected)}`;
    await until(() => seen.length >= expected.length, want, () => seen);
    await pause(QUIET_MS);
    if (JSON.stringify(seen) !== JSON.stringify(expected))
        fail(want, seen);
}
/** Waits a moment, then fails if `seen` grew past `count`. */
async function nothingMore(seen, count, what) {
    await pause(QUIET_MS);
    if (seen.length !== count)
        fail(what, seen.slice(count));
}
/** Subscribes to the location; the listener must be told one path, at once. */
function follow(host) {
    const seen = [];
    host.onLocationChange((path) => seen.push(path));
    const [first] = seen;
    if (seen.length !== 1 || typeof first !== 'string' || !first.startsWith('/')) {
        fail('onLocationChange to tell its listener one path starting with "/" as it subscribes', seen);
    }
    return seen;
}
async function withHarness(make, body) {
    const harness = await make();
    try {
        await body(harness);
    }
    finally {
        harness.close();
    }
}
const themeOf = (theme) => ({ mode: theme.mode, brand: theme.brand });
const otherMode = (theme) => ({ mode: theme.mode === 'dark' ? 'light' : 'dark', brand: theme.brand });
const otherLocale = (locale) => (locale.toLowerCase().startsWith('vi') ? 'en' : 'vi');
/** The same value with every object's keys sorted, so two bodies compare by content. */
function canonical(value) {
    if (Array.isArray(value))
        return value.map(canonical);
    if (value !== null && typeof value === 'object') {
        const entries = Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
        return Object.fromEntries(entries.map(([key, item]) => [key, canonical(item)]));
    }
    return value;
}
/**
 * The contract v1 cases, framework-neutral: run each against a host, and a failure is the `Error` its
 * `run` rejects with. The SDK runs them against its standalone host, and AgentFlow's frontend against
 * its own, so the two cannot drift.
 */
export const HOST_CONTRACT_CASES = [
    {
        name: 'onLocationChange tells the current path at once, then each navigate, query and fragment included',
        run: (make) => withHarness(make, async ({ host }) => {
            const seen = follow(host);
            const start = seen[0];
            host.navigate('/t/42?tab=notes#n3');
            await heard(seen, [start, '/t/42?tab=notes#n3'], 'onLocationChange to tell');
            host.navigate('/?view=mine');
            await heard(seen, [start, '/t/42?tab=notes#n3', '/?view=mine'], 'onLocationChange to tell');
            const late = [];
            const stop = host.onLocationChange((path) => late.push(path));
            if (JSON.stringify(late) !== JSON.stringify(['/?view=mine'])) {
                fail('a later listener to be told the current path, ["/?view=mine"], at once', late);
            }
            stop();
            host.navigate('/t/7');
            await heard(seen, [start, '/t/42?tab=notes#n3', '/?view=mine', '/t/7'], 'onLocationChange to tell');
            if (late.length !== 1)
                fail('a listener that unsubscribed to be told nothing more', late.slice(1));
        }),
    },
    {
        name: 'onLocationChange tells going back and going forward, each once',
        run: (make) => withHarness(make, async (harness) => {
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
        run: (make) => withHarness(make, async (harness) => {
            const { host } = harness;
            const seen = follow(host);
            const start = seen[0];
            host.navigate('/t/42?tab=notes');
            await heard(seen, [start, '/t/42?tab=notes'], 'onLocationChange to tell');
            await harness.changeHash('#n3');
            await heard(seen, [start, '/t/42?tab=notes', '/t/42?tab=notes#n3'], 'a fragment change to tell');
            await harness.changeHash('#n4');
            await heard(seen, [start, '/t/42?tab=notes', '/t/42?tab=notes#n3', '/t/42?tab=notes#n4'], 'a fragment change to tell');
        }),
    },
    {
        name: 'the theme follows live: context.theme changes in place, and onThemeChange says so, not as it subscribes',
        run: (make) => withHarness(make, async (harness) => {
            const { host } = harness;
            const context = host.context;
            const next = otherMode(context.theme);
            const seen = [];
            host.onThemeChange((theme) => seen.push(themeOf(theme)));
            await nothingMore(seen, 0, 'onThemeChange not to call its listener as it subscribes');
            await harness.setTheme(next);
            await heard(seen, [next], 'onThemeChange to tell');
            if (host.context !== context)
                fail('host.context to stay the same object', 'another object');
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
        run: (make) => withHarness(make, async (harness) => {
            const { host } = harness;
            const context = host.context;
            const before = context.locale;
            const next = otherLocale(before);
            const seen = [];
            host.onLocaleChange((locale) => seen.push(locale));
            await nothingMore(seen, 0, 'onLocaleChange not to call its listener as it subscribes');
            await harness.setLocale(before);
            await nothingMore(seen, 0, `onLocaleChange not to call its listener when the locale stays ${before}`);
            await harness.setLocale(next);
            await heard(seen, [next], 'onLocaleChange to tell');
            if (host.context !== context)
                fail('host.context to stay the same object', 'another object');
            if (context.locale !== next)
                fail(`context.locale to read ${JSON.stringify(next)}`, context.locale);
            await harness.setLocale(before);
            await heard(seen, [next, before], 'onLocaleChange to tell');
        }),
    },
    {
        name: "host.api.GET('/app/objects') answers the app's own objects and parameters",
        run: (make) => withHarness(make, async ({ host, appObjects }) => {
            const { data, error, response } = await host.api.GET('/app/objects');
            if (!response.ok || error !== undefined)
                fail('GET /app/objects to answer 200', { status: response.status, error });
            if (JSON.stringify(canonical(data)) !== JSON.stringify(canonical(appObjects))) {
                fail(`GET /app/objects to answer ${JSON.stringify(appObjects)}`, data);
            }
        }),
    },
    {
        name: "a response with a greater revision makes the getAppObjects(host.api) cache refetch",
        run: (make) => withHarness(make, async (harness) => {
            const app = getAppObjects(harness.host.api);
            const first = await app.load();
            if (first.revision !== harness.appObjects.revision)
                fail('load() to answer the first revision', first);
            if (getAppObjects(harness.host.api) !== app)
                fail('getAppObjects(host.api) to be one cache per host', null);
            const told = new Promise((resolve) => {
                const off = app.subscribe(() => {
                    off();
                    resolve();
                });
            });
            const next = { ...harness.appObjects, revision: harness.appObjects.revision + 1 };
            await harness.setAppObjects(next);
            // A call that bypasses the cache: only its response header can tell the cache the objects moved.
            const { response } = await harness.host.api.GET('/app/objects');
            if (!response.ok)
                fail('GET /app/objects to answer 200', response.status);
            await Promise.race([
                told,
                new Promise((_, reject) => setTimeout(() => reject(new Error('the cache to refetch on a greater revision header, but it never did')), 2000)),
            ]);
            if (app.current?.revision !== next.revision)
                fail('the cache to hold the new revision', app.current);
            if (JSON.stringify(canonical(app.current)) !== JSON.stringify(canonical(next)))
                fail('the cache to hold the new answer', app.current);
        }),
    },
    {
        name: "host.apiUrl makes an absolute URL under the API's base that the browser can open, query kept, with or without a leading slash",
        run: (make) => withHarness(make, async ({ host, apiBase }) => {
            const href = host.apiUrl('/attachments/a1/download?inline=1');
            let url;
            try {
                url = new URL(href);
            }
            catch {
                fail("apiUrl('/attachments/a1/download?inline=1') to be an absolute URL", href);
            }
            if (!url.pathname.endsWith('/attachments/a1/download') || url.search !== '?inline=1') {
                fail("apiUrl('/attachments/a1/download?inline=1') to end with /attachments/a1/download?inline=1", href);
            }
            const under = `${apiBase}/attachments/a1/download?inline=1`;
            if (href !== under)
                fail(`apiUrl('/attachments/a1/download?inline=1') to be ${JSON.stringify(under)}`, href);
            const slashed = host.apiUrl('/attachments/a1/download');
            const bare = host.apiUrl('attachments/a1/download');
            if (bare !== slashed)
                fail(`apiUrl('attachments/a1/download') to be ${JSON.stringify(slashed)}`, bare);
        }),
    },
    {
        name: 'an assistant, when offered, takes a context and null',
        run: (make) => withHarness(make, async ({ host }) => {
            const { assistant } = host;
            if (!assistant)
                return;
            for (const context of [{ entity: 'x', record: '00000000-0000-0000-0000-000000000000' }, null]) {
                try {
                    assistant.setContext(context);
                }
                catch (error) {
                    fail(`assistant.setContext(${JSON.stringify(context)}) not to throw`, String(error));
                }
            }
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
            let opened;
            try {
                const channel = open.host.realtime;
                opened = channel;
                await until(() => channel.status() === 'live', "an open host's channel to go live", () => channel.status());
                await until(() => open.openStreams() > 0, "an open host's channel to hold an event stream open", () => ({ openStreams: open.openStreams() }));
            }
            finally {
                open.close();
            }
            await until(() => open.openStreams() === 0, 'a host that is closed to end the event stream its channel held open', () => ({ openStreams: open.openStreams() }));
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
                const themes = [];
                const locales = [];
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
                if (host.realtime !== channel)
                    fail('every read of realtime after close to hand out the same channel', 'another channel');
                await pause(QUIET_MS);
                if (harness.openStreams() !== 0) {
                    fail('the channel a closed host hands out never to open an event stream', { openStreams: harness.openStreams() });
                }
            }
            finally {
                if (!closed)
                    harness.close();
            }
        },
    },
];
//# sourceMappingURL=contract-cases.js.map