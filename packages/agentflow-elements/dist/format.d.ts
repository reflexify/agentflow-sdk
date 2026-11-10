import type { Locale, Translate } from './i18n.js';
/** A bare calendar date as that day in the viewer's zone, or null when the text is not a real day. */
export declare function parseDateOnly(value: string): Date | null;
export declare function formatDate(value: string | null | undefined, locale: Locale): string;
export declare function formatCell(value: unknown, locale: Locale, t: Translate): string;
//# sourceMappingURL=format.d.ts.map