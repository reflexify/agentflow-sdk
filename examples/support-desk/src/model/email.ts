/** Shaped like an address: something, `@`, something, a dot, something. It does not try to be RFC 5322. */
export const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/**
 * A contact is found by its address (Plan 3's Contact key), and keys compare exactly, so the desk writes
 * every address the one way Intake looks it up: trimmed and in lower case.
 */
export const cleanEmail = (s: string) => s.trim().toLowerCase();
