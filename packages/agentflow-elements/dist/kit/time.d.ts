export interface TimeFormats {
    /** `occurred` as a time relative to `now` (milliseconds), never in the future; an unparseable time is given back as written. */
    since(occurred: string, now: number): string;
    /** The exact moment, for a tooltip; undefined for an unparseable time. */
    moment(occurred: string): string | undefined;
}
/** The time follows the words' language, as the pager's numbers do, not the browser's. */
export declare function timeFormats(locale: string | null | undefined): TimeFormats;
//# sourceMappingURL=time.d.ts.map