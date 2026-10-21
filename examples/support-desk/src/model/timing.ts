export const AUTOSAVE_MS = 800;
export const UNDO_SEND_MS = 10_000;
export const SEND_WAIT_MS = 8_000;
export const ACTION_WAIT_MS = 5_000;
export const REDRAFT_TIMEOUT_MS = 60_000;
export const POLL_MS = 30_000;
/** Between reads of one run the desk is waiting on (Send, Accept, Move, a redraft). */
export const POLL_INTERVAL_MS = 500;
export const SLA_SOON_MS = 60 * 60_000;
/** How long G waits for the letter of "go to" (G, then M, U or H). */
export const G_CHORD_MS = 1_200;
/** How often the queue's clock moves on, so SLA badges and waiting times stay current. */
export const CLOCK_TICK_MS = 30_000;
/** How long a save that couldn't reach the server waits before it tries again on its own. */
export const OFFLINE_RETRY_MS = 10_000;
/** A send that outlasted its wait is looked at this often... */
export const PENDING_POLL_MS = 2_000;
/** ...for this long, after which the person is left to close it and look at the thread. */
export const PENDING_WATCH_MS = 10 * 60_000;
/** A send that went well stays in the outbox bar this long, for the person who has gone to another ticket; then it goes by itself. */
export const OUTBOX_DONE_LINGER_MS = 8_000;
/** How long typing in a search box pauses before the search is made. */
export const SEARCH_PAUSE_MS = 250;
