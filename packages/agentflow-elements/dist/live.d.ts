import type { PublicEvent, RealtimeChannel } from '@reflexify/agentflow-sdk';
/** A burst of events is one reload: the first one starts this window, and the ones inside it add nothing. */
export declare const RELOAD_WINDOW_MS = 250;
export interface LiveReloadOptions {
    /** The host's channel, or null when the page gave none. */
    realtime: RealtimeChannel | null;
    /** Whether an event on the stream may change what is shown. */
    matches: (event: PublicEvent) => boolean;
    reload: () => void;
    /** Where focus is heard; the page's window by default. */
    win?: Window;
}
/**
 * Calls `reload` once per {@link RELOAD_WINDOW_MS} window in which an event matched or the channel asked for a refetch. With
 * no channel, or while its status reads `polling` (the stream is down and nothing is pushed), it calls `reload` when the
 * window regains focus instead; the status is read when the focus arrives, so a stream that comes back stops it.
 * Returns what stops all of it, a window still open included.
 */
export declare function liveReload({ realtime, matches, reload, win }: LiveReloadOptions): () => void;
//# sourceMappingURL=live.d.ts.map