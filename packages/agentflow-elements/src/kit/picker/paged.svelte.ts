import type { PickerPage, PickerSource } from '@reflexify/agentflow-sdk';
import { untrack } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

// How long typing must pause before the source is asked.
const DEBOUNCE_MS = 250;

/** A picker's side of a source: the pages of the last query, every name it has been given, and the calls in flight. */
export interface Paged<T> {
  /** The pages of the last query, each item once by key. */
  readonly items: T[];
  /** The cursor after them, null at the end. */
  readonly next: string | null;
  /** The pause is running or a call is in flight. */
  readonly busy: boolean;
  /** A call for page one has answered since the last new source. */
  readonly listed: boolean;
  /** Every item a page or resolve named, by key, kept across queries. */
  readonly named: ReadonlyMap<string, T>;
  /** Keys resolve was asked for and did not name. */
  readonly unnamed: ReadonlySet<string>;
  /** A call, the pause before one, or a lookup could still name this unnamed key. */
  pending(key: string): boolean;
  /** Everything that could name this unnamed key has answered without it: resolve, or page one when there is no resolve. */
  answered(key: string): boolean;
  /** Asks for page one of `q`, 250 ms after the last keystroke. */
  search(q: string): void;
  /** Asks at once, as on open. */
  now(q: string): void;
  /** Asks for the page after `next`, appending; nothing when `next` is null or busy. */
  more(): void;
  /** Asks resolve once for the keys no page named; nothing without resolve. */
  resolve(keys: string[]): void;
  /** Ends the pause and aborts the call in flight, as when the list closes; lookups go on. */
  stop(): void;
  /** The same function is a no-op; a new one drops calls, pages and next, keeps named. */
  reset(source: PickerSource<T> | null): void;
  /** Aborts everything in flight. */
  destroy(): void;
}

// A source that throws instead of rejecting is treated as one that rejected.
function attempt<R>(run: () => Promise<R>): Promise<R> {
  try {
    return Promise.resolve(run());
  } catch (e) {
    return Promise.reject(e);
  }
}

export function paged<T>(key: (item: T) => string): Paged<T> {
  // State, so what `pending` and `answered` say changes for whoever reads them when a new source arrives.
  let source = $state.raw<PickerSource<T> | null>(null);
  let pages = $state.raw<T[]>([]);
  let next = $state<string | null>(null);
  // The query the pages answer, so "load more" continues it even after the text has moved on.
  let pagesQuery = '';
  let calling = $state(false);
  let pending = $state(false);
  let listed = $state(false);
  const named = new SvelteMap<string, T>();
  const unnamed = new SvelteSet<string>();
  let asked = new Set<string>();
  let call: AbortController | null = null;
  const lookups = new Set<AbortController>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function stop() {
    clearTimeout(timer);
    pending = false;
    call?.abort();
    call = null;
    calling = false;
  }

  // Each call aborts the one before it, and an answer to an aborted call is dropped, so answers that arrive out of
  // order never show a stale list.
  function ask(cursor: string | null, q: string) {
    const from = source;
    if (!from) return;
    if (cursor === null) {
      clearTimeout(timer);
      pending = false;
    }
    call?.abort();
    const controller = new AbortController();
    call = controller;
    calling = true;
    attempt<PickerPage<T>>(() => from({ q, cursor, signal: controller.signal }))
      .then((page) => {
        if (controller.signal.aborted) return;
        const answered = page?.items ?? [];
        for (const item of answered) named.set(key(item), item);
        const kept = new Set(cursor === null ? [] : pages.map(key));
        const fresh = answered.filter((item) => !kept.has(key(item)) && !!kept.add(key(item)));
        pages = cursor === null ? fresh : [...pages, ...fresh];
        pagesQuery = q;
        next = page?.next ?? null;
      }, () => {})
      .finally(() => {
        if (call !== controller) return;
        call = null;
        calling = false;
        if (cursor === null) listed = true;
      });
  }

  function dropLookups() {
    for (const lookup of lookups) lookup.abort();
    lookups.clear();
  }

  return {
    get items() { return pages; },
    get next() { return next; },
    get busy() { return pending || calling; },
    get listed() { return listed; },
    named,
    unnamed,
    pending(k) {
      return pending || calling || (!!source?.resolve && !unnamed.has(k));
    },
    answered(k) {
      return unnamed.has(k) || (!source?.resolve && listed);
    },
    search(q) {
      if (!source) return;
      clearTimeout(timer);
      pending = true;
      timer = setTimeout(() => ask(null, q), DEBOUNCE_MS);
    },
    now(q) {
      ask(null, q);
    },
    more() {
      if (next === null || pending || calling) return;
      ask(next, pagesQuery);
    },
    resolve(keys) {
      const from = source;
      if (!from?.resolve) return;
      const missing = [...new Set(keys)].filter((k) => !named.has(k) && !asked.has(k));
      if (missing.length === 0) return;
      for (const k of missing) asked.add(k);
      const controller = new AbortController();
      lookups.add(controller);
      // A rejected lookup names nothing: its keys count as asked and unnamed, and are not asked again.
      attempt<T[]>(() => from.resolve!(missing, controller.signal))
        .then((found) => {
          if (controller.signal.aborted) return;
          for (const item of found ?? []) named.set(key(item), item);
        }, () => {})
        .finally(() => {
          lookups.delete(controller);
          if (controller.signal.aborted) return;
          for (const k of missing) if (!named.has(k)) unnamed.add(k);
        });
    },
    stop,
    reset(to) {
      if (to === source) return;
      source = to;
      stop();
      dropLookups();
      asked = new Set();
      unnamed.clear();
      pages = [];
      next = null;
      pagesQuery = '';
      listed = false;
    },
    destroy() {
      stop();
      dropLookups();
    },
  };
}

/**
 * Ties a picker's pager to its `source` property, called while the picker is created: a new source function restarts the
 * list and then `restarted` runs, the chosen `keys` a page has not named are resolved, and everything in flight stops when
 * the picker goes.
 */
export function followSource<T>(pager: Paged<T>, source: () => PickerSource<T> | null | undefined, keys: () => string[], restarted: () => void): void {
  let current: PickerSource<T> | null | undefined;
  // Declared before the lookup below, which asks through the source this hands the pager.
  $effect(() => {
    const from = source() ?? null;
    untrack(() => {
      if (from === current) return;
      current = from;
      pager.reset(from);
      if (from) restarted();
    });
  });
  $effect(() => {
    const from = source();
    const ids = keys();
    if (!from?.resolve) return;
    untrack(() => pager.resolve(ids));
  });
  $effect(() => () => pager.destroy());
}
