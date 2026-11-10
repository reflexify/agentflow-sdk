/** `yyyy-mm-dd` for a real calendar day, null for one that does not exist (2026-02-30). */
export declare function isoDate(year: number, month: number, day: number): string | null;
/** The text itself when it is a `yyyy-mm-dd` naming a real day, otherwise null. */
export declare function validIsoDate(text: string | null | undefined): string | null;
/** A typed date, `dd/mm/yyyy` or `yyyy-mm-dd` with or without surrounding space, as `yyyy-mm-dd`; null when it is neither. */
export declare function parseDateInput(text: string): string | null;
/** `05/11/2026` for Vietnamese, `5 Nov 2026` for anything else. */
export declare function formatDate(iso: string, locale: string | null | undefined): string;
/** Whether a mask is one `formatMasked` and `parseMasked` read: `DD`, `MM` and `YYYY` once each, with no letters between them (`DD/MM/YYYY`, `YYYY-MM-DD`) or with nothing between some or all of them (`YYYYMMDD`, `DDMMYYYY`). */
export declare function isDateMask(mask: string | null | undefined): boolean;
/** A `yyyy-mm-dd` day written in a date mask, `20.02.2026` for `DD.MM.YYYY` and `20260220` for `YYYYMMDD`; null for a mask it cannot read or a day that does not exist. */
export declare function formatMasked(iso: string, mask: string): string | null;
/** Typed text in a date mask as `yyyy-mm-dd`, with surrounding space trimmed; null when it does not match or names no real day. A four-digit year, and a day or month of one or two digits, except that a day or month next to a token with nothing between them is exactly two digits (`2026022` is not a day in `YYYYMMDD`). */
export declare function parseMasked(text: string, mask: string): string | null;
/** The calendar day it is where the reader is, as `yyyy-mm-dd`. */
export declare function todayIsoDate(now?: Date): string;
//# sourceMappingURL=dates.d.ts.map