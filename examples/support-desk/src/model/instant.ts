/**
 * An instant as milliseconds, or null when the text isn't a date. Plan 3 writes `now()` in the
 * org's zone, so one org stores `…T15:00:00+07:00` where another stores `…T08:00:00Z`: two
 * values are comparable only as instants, never as text.
 */
export function instantMs(v: unknown): number | null {
  if (typeof v !== 'string' || v === '') return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

/** A datetime as UTC ISO text, or null when it's empty or not a date. */
export function utcIso(v: unknown): string | null {
  const t = instantMs(v);
  return t === null ? null : new Date(t).toISOString();
}
