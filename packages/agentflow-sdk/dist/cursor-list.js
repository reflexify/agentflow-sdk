/**
 * Holds one cursor-paged list's current page for a Previous / Next pager.
 *
 * It keeps the stack of cursors the shown pages were fetched with, so Previous refetches the page before.
 * A new call aborts the one before it, and an answer that arrives after its call was aborted is dropped.
 */
export function cursorList(fetchPage) {
    let stack = [];
    let nextCursor = null;
    let running = null;
    let state = { items: [], hasPrev: false, hasNext: false, busy: false, error: undefined };
    const listeners = new Set();
    function set(change) {
        state = { ...state, ...change };
        for (const listener of [...listeners])
            listener(state);
    }
    // A server that hands back a cursor already in the stack would page in a circle, as `paginate` guards.
    const hasNextIn = (cursors, cursor) => cursor !== null && !cursors.includes(cursor);
    async function load(target, starting = {}) {
        running?.abort();
        const controller = new AbortController();
        running = controller;
        set({ ...starting, busy: true, error: undefined });
        try {
            const page = await fetchPage(target[target.length - 1], controller.signal);
            if (controller.signal.aborted)
                return;
            stack = target;
            nextCursor = page.next_cursor;
            set({ items: page.items, hasPrev: stack.length > 1, hasNext: hasNextIn(stack, nextCursor), busy: false });
        }
        catch (error) {
            if (controller.signal.aborted)
                return;
            set({ busy: false, error });
        }
        finally {
            if (running === controller)
                running = null;
        }
    }
    return {
        get state() {
            return state;
        },
        next() {
            if (stack.length === 0)
                return load([null]);
            if (!hasNextIn(stack, nextCursor))
                return Promise.resolve();
            return load([...stack, nextCursor]);
        },
        prev() {
            if (stack.length < 2)
                return Promise.resolve();
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
//# sourceMappingURL=cursor-list.js.map