/**
 * Yields every item of a cursor-paged list, page by page.
 *
 * It stops, without an error or any other signal, when the server hands back a cursor it was already
 * given: that would walk the same pages for ever. A caller that must tell a complete list from one cut
 * short compares what it received with what it expected.
 */
export async function* paginate(fetchPage) {
    // A cursor the server hands back after it was already sent would walk the same pages for ever.
    const sent = new Set();
    let cursor;
    do {
        const p = await fetchPage(cursor);
        yield* p.items;
        cursor = p.next_cursor ?? undefined;
        if (cursor !== undefined && sent.has(cursor))
            break;
        if (cursor !== undefined)
            sent.add(cursor);
    } while (cursor);
}
//# sourceMappingURL=paginate.js.map