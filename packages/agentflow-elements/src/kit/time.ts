import { isVi } from './text.js';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60]];

export interface TimeFormats {
  /** `occurred` as a time relative to `now` (milliseconds), never in the future; an unparseable time is given back as written. */
  since(occurred: string, now: number): string;
  /** The exact moment, for a tooltip; undefined for an unparseable time. */
  moment(occurred: string): string | undefined;
}

/** The time follows the words' language, as the pager's numbers do, not the browser's. */
export function timeFormats(locale: string | null | undefined): TimeFormats {
  const relative = new Intl.RelativeTimeFormat(isVi(locale) ? 'vi' : 'en', { numeric: 'auto' });
  const exact = new Intl.DateTimeFormat(isVi(locale) ? 'vi-VN' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  return {
    // A clock a little ahead of the server's would otherwise read "in 3 seconds" for a line that has just happened.
    since(occurred, now) {
      const at = new Date(occurred).getTime();
      if (Number.isNaN(at)) return occurred;
      const diff = Math.min(0, (at - now) / 1000);
      for (const [unit, seconds] of UNITS) if (Math.abs(diff) >= seconds) return relative.format(Math.trunc(diff / seconds), unit);
      return relative.format(Math.trunc(diff), 'second');
    },
    moment(occurred) {
      const at = new Date(occurred);
      return Number.isNaN(at.getTime()) ? undefined : exact.format(at);
    },
  };
}
