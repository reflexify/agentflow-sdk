/** Lower case with accents off, so "Đỗ Đức" and "do duc" meet. "đ" has no canonical decomposition, so it is folded by hand. */
export declare function fold(text: string): string;
/** Whether the text holds the query, ignoring case and accents and the space around the query. An empty query matches anything. */
export declare function matches(text: string | null | undefined, query: string): boolean;
//# sourceMappingURL=match.d.ts.map