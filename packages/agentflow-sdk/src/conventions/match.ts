/** Lower case with accents off, so "Đỗ Đức" and "do duc" meet. "đ" has no canonical decomposition, so it is folded by hand. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

/** Whether the text holds the query, ignoring case and accents and the space around the query. An empty query matches anything. */
export function matches(text: string | null | undefined, query: string): boolean {
  return fold(text ?? '').includes(fold(query.trim()));
}
