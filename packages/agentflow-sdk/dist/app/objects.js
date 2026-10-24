import { ok } from '../errors.js';
import { tapOf } from './revision.js';
import { compareVersions } from './version.js';
const DEFAULT_RECHECK_MS = 30_000;
const SOURCE_ORDER = ['own', 'bound', 'exported'];
const CACHES = new WeakMap();
/** The one cache for this client. Any client works; one made by `createAgentFlowClient` also refetches on a greater `AgentFlow-App-Revision`. `opts` apply to the first call per client only. */
export function getAppObjects(client, opts = {}) {
    let cache = CACHES.get(client);
    if (!cache) {
        cache = createAppObjects(client, opts.recheckAfterMs ?? DEFAULT_RECHECK_MS);
        CACHES.set(client, cache);
    }
    // The key type only narrows what callers may ask; one cache serves every K.
    return cache;
}
function createAppObjects(client, recheckAfterMs) {
    let current = null;
    let stale = false;
    let inflight = null;
    let seen = -1;
    let lastFetch = 0;
    const listeners = new Set();
    const quietly = (p) => void p.catch(() => { });
    function fetchOnce(followUp = false) {
        if (inflight)
            return inflight;
        const run = (async () => {
            // A GET that throws synchronously would otherwise reach `finally` before `inflight = run` below.
            await Promise.resolve();
            try {
                const body = await ok(client.GET('/app/objects'));
                lastFetch = Date.now();
                let told = null;
                if (body.revision >= (current?.revision ?? -1)) {
                    if (body.revision !== current?.revision)
                        told = body;
                    current = body;
                }
                stale = seen > (current?.revision ?? -1);
                if (told) {
                    for (const listener of [...listeners]) {
                        try {
                            listener(told);
                        }
                        catch (error) {
                            console.error('getAppObjects: a subscriber threw', error);
                        }
                    }
                }
                return current ?? body;
            }
            finally {
                inflight = null;
                // One follow-up at most: a header ahead of what the server answers (an older replica) must not loop.
                if (!followUp && stale && listeners.size > 0)
                    quietly(fetchOnce(true));
            }
        })();
        inflight = run;
        return run;
    }
    const tap = tapOf(client);
    tap?.listen((revision) => {
        seen = Math.max(seen, revision);
        if (current && revision > current.revision) {
            stale = true;
            if (listeners.size > 0)
                quietly(fetchOnce());
        }
    });
    const onVisible = () => {
        const doc = globalThis.document;
        if (doc?.visibilityState === 'visible' && Date.now() - lastFetch >= recheckAfterMs)
            quietly(fetchOnce());
    };
    function find(logicalKey, o) {
        if (!current)
            throw new Error('getAppObjects: call load() first');
        const matches = current.objects.filter((x) => x.logical_key === logicalKey);
        if (o?.source)
            return matches.find((x) => x.source === o.source) ?? null;
        for (const source of SOURCE_ORDER) {
            const hit = matches.find((x) => x.source === source);
            if (hit)
                return hit;
        }
        return null;
    }
    return {
        get current() {
            return current;
        },
        load: () => (current && !stale ? Promise.resolve(current) : fetchOnce()),
        async refresh() {
            if (inflight)
                await inflight.catch(() => { });
            return fetchOnce();
        },
        find,
        id(logicalKey, o) {
            const hit = find(logicalKey, o);
            return hit && hit.state !== 'off' ? hit.id : null;
        },
        satisfies(logicalKey, version, o) {
            compareVersions(version, version);
            const hit = find(logicalKey, o);
            if (!hit || hit.state === 'off' || hit.contract_version == null)
                return false;
            try {
                return compareVersions(hit.contract_version, version) >= 0;
            }
            catch {
                return false;
            }
        },
        subscribe(listener) {
            listeners.add(listener);
            if (listeners.size === 1 && recheckAfterMs > 0)
                globalThis.document?.addEventListener('visibilitychange', onVisible);
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0)
                    globalThis.document?.removeEventListener('visibilitychange', onVisible);
            };
        },
    };
}
//# sourceMappingURL=objects.js.map