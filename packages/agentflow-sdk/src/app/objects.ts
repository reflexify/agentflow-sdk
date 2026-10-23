import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
import { ok } from '../errors.js';
import { tapOf } from './revision.js';
import { compareVersions } from './version.js';

export type AppObject = components['schemas']['AppObject'];
export type AppObjectsBody = components['schemas']['AppObjects'];

export interface AppObjectsOptions {
  /** How long after a fetch the page coming back into view rechecks. Default 30 000 ms; 0 turns the recheck off. */
  recheckAfterMs?: number;
}

export interface AppObjects {
  /** The last answer, or null before the first. */
  readonly current: AppObjectsBody | null;
  /** The cached answer while it is current; otherwise one fetch, shared by every caller waiting. */
  load(): Promise<AppObjectsBody>;
  /** Fetch now, whatever the cache holds. */
  refresh(): Promise<AppObjectsBody>;
  /** The object with this logical key (`'entity:ticket'`): the app's own first, then a bound one, then an exported one, unless `source` picks. Null when absent. Throws before the first load. */
  find(logicalKey: string, opts?: { source?: AppObject['source'] }): AppObject | null;
  /** The object's id, or null when it is absent, off, or has none (a field or a relationship). */
  id(logicalKey: string, opts?: { source?: AppObject['source'] }): string | null;
  /** Whether the object is present, not off, and its contract satisfies `version`. */
  satisfies(logicalKey: string, version: string, opts?: { source?: AppObject['source'] }): boolean;
  /** Told after each answer whose revision differs from the one before. Subscribing turns on the refetch on a greater revision and the recheck on return. */
  subscribe(listener: (body: AppObjectsBody) => void): () => void;
}

const DEFAULT_RECHECK_MS = 30_000;
const SOURCE_ORDER: AppObject['source'][] = ['own', 'bound', 'exported'];

const CACHES = new WeakMap<AgentFlowClient, AppObjects>();

/** The one cache for this client. Any client works; one made by `createAgentFlowClient` also refetches on a greater `AgentFlow-App-Revision`. `opts` apply to the first call per client only. */
export function getAppObjects(client: AgentFlowClient, opts: AppObjectsOptions = {}): AppObjects {
  const existing = CACHES.get(client);
  if (existing) return existing;
  const created = createAppObjects(client, opts.recheckAfterMs ?? DEFAULT_RECHECK_MS);
  CACHES.set(client, created);
  return created;
}

function createAppObjects(client: AgentFlowClient, recheckAfterMs: number): AppObjects {
  let current: AppObjectsBody | null = null;
  let stale = false;
  let inflight: Promise<AppObjectsBody> | null = null;
  let seen = -1;
  let lastFetch = 0;
  const listeners = new Set<(body: AppObjectsBody) => void>();

  const quietly = (p: Promise<unknown>) => void p.catch(() => {});

  function fetchOnce(followUp = false): Promise<AppObjectsBody> {
    if (inflight) return inflight;
    const run = (async () => {
      // A GET that throws synchronously would otherwise reach `finally` before `inflight = run` below.
      await Promise.resolve();
      try {
        const body = await ok<AppObjectsBody>(client.GET('/app/objects') as never);
        lastFetch = Date.now();
        let told: AppObjectsBody | null = null;
        if (body.revision >= (current?.revision ?? -1)) {
          if (body.revision !== current?.revision) told = body;
          current = body;
        }
        stale = seen > (current?.revision ?? -1);
        if (told) {
          for (const listener of [...listeners]) {
            try {
              listener(told);
            } catch (error) {
              console.error('getAppObjects: a subscriber threw', error);
            }
          }
        }
        return current ?? body;
      } finally {
        inflight = null;
        // One follow-up at most: a header ahead of what the server answers (an older replica) must not loop.
        if (!followUp && stale && listeners.size > 0) quietly(fetchOnce(true));
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
      if (listeners.size > 0) quietly(fetchOnce());
    }
  });

  const onVisible = () => {
    const doc = globalThis.document;
    if (doc?.visibilityState === 'visible' && Date.now() - lastFetch >= recheckAfterMs) quietly(fetchOnce());
  };

  function find(logicalKey: string, o?: { source?: AppObject['source'] }): AppObject | null {
    if (!current) throw new Error('getAppObjects: call load() first');
    const matches = current.objects.filter((x) => x.logical_key === logicalKey);
    if (o?.source) return matches.find((x) => x.source === o.source) ?? null;
    for (const source of SOURCE_ORDER) {
      const hit = matches.find((x) => x.source === source);
      if (hit) return hit;
    }
    return null;
  }

  return {
    get current() {
      return current;
    },
    load: () => (current && !stale ? Promise.resolve(current) : fetchOnce()),
    async refresh() {
      if (inflight) await inflight.catch(() => {});
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
      if (!hit || hit.state === 'off' || hit.contract_version == null) return false;
      try {
        return compareVersions(hit.contract_version, version) >= 0;
      } catch {
        return false;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && recheckAfterMs > 0) globalThis.document?.addEventListener('visibilitychange', onVisible);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) globalThis.document?.removeEventListener('visibilitychange', onVisible);
      };
    },
  };
}
