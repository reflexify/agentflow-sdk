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
export declare function cursorList<T>(fetchPage: (cursor: string | null, signal: AbortSignal) => Promise<CursorPage<T>>): CursorList<T>;
//# sourceMappingURL=cursor-list.d.ts.map