export const STEP = 1024;
const MIN_GAP = 1e-6;

/** A position strictly between two neighbours, or `null` when they are too close to halve. */
export function between(prev: number | null, next: number | null): number | null {
  if (prev === null && next === null) return STEP;
  if (prev === null) return next! - STEP;
  if (next === null) return prev + STEP;
  if (next - prev < MIN_GAP) return null;
  return (prev + next) / 2;
}

export function byPosition<T extends { position: number | null; createdAt: string }>(a: T, b: T): number {
  if (a.position === null && b.position === null) return a.createdAt.localeCompare(b.createdAt);
  if (a.position === null) return 1;
  if (b.position === null) return -1;
  return a.position - b.position;
}

export function renumber<T extends { id: string }>(ordered: T[]): { id: string; position: number }[] {
  return ordered.map((t, i) => ({ id: t.id, position: (i + 1) * STEP }));
}

/**
 * Where a card lands when dropped at `index` of its column, which is in display order. Without room, or next to a card
 * that has no position yet, the rest of the column is renumbered and the card goes between the new numbers.
 */
export function placeAt<T extends { id: string; position: number | null }>(column: T[], movingId: string, index: number):
  { position: number } | { renumber: { id: string; position: number }[]; position: number } {
  const rest = column.filter((t) => t.id !== movingId);
  const at = Math.max(0, Math.min(index, rest.length));
  const prev = rest[at - 1] ?? null;
  const next = rest[at] ?? null;
  const unpositioned = (prev && prev.position === null) || (next && next.position === null);
  const position = unpositioned ? null : between(prev?.position ?? null, next?.position ?? null);
  if (position !== null) return { position };
  const fresh = renumber(rest);
  const before = at > 0 ? fresh[at - 1]!.position : null;
  const after = at < fresh.length ? fresh[at]!.position : null;
  return { renumber: fresh, position: between(before, after)! };
}
