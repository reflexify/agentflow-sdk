export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
}

export interface CursorListState<T> {
  items: T[];
  hasPrev: boolean;
  hasNext: boolean;
  busy: boolean;
  error: unknown;
}

export interface CursorList<T> {
  readonly state: CursorListState<T>;
  /** The next page, the page before, the current page again, or the first page with the stack forgotten. */
  next(): Promise<void>;
  prev(): Promise<void>;
  reload(): Promise<void>;
  reset(): Promise<void>;
  subscribe(listener: (state: CursorListState<T>) => void): () => void;
}

/**
 * Holds one cursor-paged list's current page for a Previous / Next pager.
 *
 * It keeps the stack of cursors the shown pages were fetched with, so Previous refetches the page before.
 * A new call aborts the one before it, and an answer that arrives after its call was aborted is dropped.
 */
export function cursorList<T>(
  fetchPage: (cursor: string | null, signal: AbortSignal) => Promise<CursorPage<T>>,
): CursorList<T> {
  let stack: (string | null)[] = [];
  let nextCursor: string | null = null;
  let running: AbortController | null = null;
  let state: CursorListState<T> = { items: [], hasPrev: false, hasNext: false, busy: false, error: undefined };
  const listeners = new Set<(state: CursorListState<T>) => void>();

  function set(change: Partial<CursorListState<T>>) {
    state = { ...state, ...change };
    for (const listener of [...listeners]) listener(state);
  }

  // A server that hands back a cursor already in the stack would page in a circle, as `paginate` guards.
  const hasNextIn = (cursors: (string | null)[], cursor: string | null) => cursor !== null && !cursors.includes(cursor);

  async function load(target: (string | null)[], starting: Partial<CursorListState<T>> = {}) {
    running?.abort();
    const controller = new AbortController();
    running = controller;
    set({ ...starting, busy: true, error: undefined });
    try {
      const page = await fetchPage(target[target.length - 1], controller.signal);
      if (controller.signal.aborted) return;
      stack = target;
      nextCursor = page.next_cursor;
      set({ items: page.items, hasPrev: stack.length > 1, hasNext: hasNextIn(stack, nextCursor), busy: false });
    } catch (error) {
      if (controller.signal.aborted) return;
      set({ busy: false, error });
    } finally {
      if (running === controller) running = null;
    }
  }

  return {
    get state() {
      return state;
    },
    next() {
      if (stack.length === 0) return load([null]);
      if (!hasNextIn(stack, nextCursor)) return Promise.resolve();
      return load([...stack, nextCursor]);
    },
    prev() {
      if (stack.length < 2) return Promise.resolve();
      return load(stack.slice(0, -1));
    },
    reload() {
      return load(stack.length === 0 ? [null] : stack);
    },
    // A reset is for a new query, so nothing of the old one's stack outlives it, even when the reset fails.
    reset() {
      stack = [];
      nextCursor = null;
      return load([null], { hasPrev: false, hasNext: false });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
