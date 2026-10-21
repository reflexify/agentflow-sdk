/** One server-sent event. A frame with only `retry` has empty `data`. */
export interface SseFrame {
    id?: string;
    event: string;
    data: string;
    retry?: number;
}
/**
 * The frames of a `text/event-stream` body: `id`, `event`, `data` (lines joined
 * by `\n`) and `retry`, with comment lines (the keep-alive) skipped. Read with
 * `fetch` rather than `EventSource`, which cannot send an `Authorization` header.
 * Aborting `signal` cancels the body and ends the frames, whether or not the `fetch`
 * that produced the body honours its own signal. `onActivity` is called whenever a chunk
 * arrives, a keep-alive comment included, so a caller can tell a quiet connection from a dead one.
 */
export declare function readSse(body: ReadableStream<Uint8Array>, signal?: AbortSignal, onActivity?: () => void): AsyncGenerator<SseFrame>;
//# sourceMappingURL=sse.d.ts.map