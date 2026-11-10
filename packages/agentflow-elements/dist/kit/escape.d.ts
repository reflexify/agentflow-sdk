/**
 * Asks whether an Escape belongs to an open kit overlay inside `within` (anywhere in the document when it is null or
 * omitted), across open shadow roots. When it does, the event is marked as claimed and `true` comes back: a page's own
 * layer that catches Escape before the kit then cancels the event to stay open, and the kit's topmost overlay closes on
 * it as on an Escape nobody cancelled.
 */
export declare function claimEscape(event: KeyboardEvent, within?: Element | null): boolean;
/** Whether a page's layer handed this Escape to the kit with `claimEscape`. */
export declare function isClaimed(event: Event): boolean;
//# sourceMappingURL=escape.d.ts.map