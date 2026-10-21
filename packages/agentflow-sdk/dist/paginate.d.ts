/**
 * Yields every item of a cursor-paged list, page by page.
 *
 * It stops, without an error or any other signal, when the server hands back a cursor it was already
 * given: that would walk the same pages for ever. A caller that must tell a complete list from one cut
 * short compares what it received with what it expected.
 */
export declare function paginate<T>(fetchPage: (c?: string) => Promise<{
    items: T[];
    next_cursor: string | null;
}>): AsyncGenerator<Awaited<T>, void, unknown>;
//# sourceMappingURL=paginate.d.ts.map