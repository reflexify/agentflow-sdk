import type { components } from '../generated/public.js';
import type { FigureField, FigureMeasure, FormatOptions, GoalDistance } from './types.js';
import { effectiveType, isCounting, unitOf } from './units.js';

type Schemas = components['schemas'];

/** The locales that pin the fixed separator presets. `locale` and `none` stay the viewer's. */
const SEPARATOR_LOCALE: Record<string, string> = {
  comma_dot: 'en-US',
  dot_comma: 'de-DE',
  space_comma: 'fr-FR',
};

/** A field's display options: an object reads as them, anything else as none. */
export function formatOptionsOf(field: Pick<FigureField, 'format_options'> | null | undefined): FormatOptions {
  const options: unknown = field?.format_options;
  return options !== null && typeof options === 'object' && !Array.isArray(options) ? (options as FormatOptions) : {};
}

/** Building a formatter costs about forty times what writing a number with one does, and a chart writes a
 *  label for every tick and mark each time it is resized. Each is kept under the locale and the options it
 *  was built with: its output is a function of those alone, and sharing one holds no state. */
const NUMBER_FORMATS = new Map<string, Intl.NumberFormat>();
const NUMBER_FORMATS_KEPT = 256;

/** `options` is always built with its members in the same order at each call site, so one reading of
 *  them has one key. Should two orders ever meet, they cost a second formatter, never a wrong one. */
function cachedNumberFormat(locale: string | undefined, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify([locale, options]);
  let format = NUMBER_FORMATS.get(key);
  if (!format) {
    // A formatter `Intl` refuses throws here and is not kept, so the caller's fallback runs as it always has.
    format = new Intl.NumberFormat(locale, options);
    if (NUMBER_FORMATS.size >= NUMBER_FORMATS_KEPT) NUMBER_FORMATS.clear();
    NUMBER_FORMATS.set(key, format);
  }
  return format;
}

/** `value` is passed only by a caller that writes a plain number (not a currency, whose minor unit decides its
 *  places): with no `decimal_places` set, a value between zero and one then keeps three significant digits, where the
 *  default of three fraction digits would round a small one to `0`. */
function numberFormatter(
  options: FormatOptions | null | undefined,
  extra: Intl.NumberFormatOptions = {},
  locale?: string,
  value?: number,
): Intl.NumberFormat {
  const sep = options?.separators ?? 'locale';
  const opts: Intl.NumberFormatOptions = { ...extra };
  if (sep === 'none') opts.useGrouping = false;
  if (options?.decimal_places != null) {
    opts.minimumFractionDigits = options.decimal_places;
    opts.maximumFractionDigits = options.decimal_places;
  } else if (value !== undefined && value !== 0 && Math.abs(value) < 1) {
    opts.maximumSignificantDigits = 3;
  }
  return cachedNumberFormat(SEPARATOR_LOCALE[sep] ?? locale, opts);
}

const pad2 = (n: number): string => String(n).padStart(2, '0');
const pad4 = (n: number): string => String(n).padStart(4, '0');

function formatDuration(totalSeconds: number, style: 'human' | 'hh_mm' | 'hh_mm_ss'): string {
  const sign = totalSeconds < 0 ? '-' : '';
  const t = Math.abs(Math.round(totalSeconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (style === 'hh_mm') return `${sign}${h}:${pad2(m)}`;
  if (style === 'hh_mm_ss') return `${sign}${h}:${pad2(m)}:${pad2(s)}`;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s && !h) parts.push(`${s}s`);
  if (parts.length === 0) parts.push('0s');
  return sign + parts.join(' ');
}

/** A number under its field's display format. A percent is unscaled: the stored value is the
 *  percent. A currency code `Intl` refuses degrades to the plain number. */
export function formatNumber(
  value: number,
  format?: Schemas['FieldFormat'] | null,
  options?: FormatOptions | null,
  locale?: string,
): string {
  if (!Number.isFinite(value)) return String(value);
  switch (format) {
    case 'currency':
      try {
        return numberFormatter(options, { style: 'currency', currency: options?.currency_code ?? 'USD' }, locale).format(value);
      } catch {
        return numberFormatter(options, {}, locale).format(value);
      }
    case 'percent':
      return `${numberFormatter(options, {}, locale, value).format(value)}%`;
    case 'duration': {
      const unit = options?.duration_unit ?? 'seconds';
      const seconds = value * (unit === 'hours' ? 3600 : unit === 'minutes' ? 60 : 1);
      return formatDuration(seconds, options?.duration_format ?? 'human');
    }
    case 'rating': {
      const max = Math.min(Math.max(Math.round(options?.rating_max ?? 5), 1), 10);
      const filled = Math.min(Math.max(Math.round(value), 0), max);
      return '★'.repeat(filled) + '☆'.repeat(max - filled);
    }
    default:
      return numberFormatter(options, {}, locale, value).format(value);
  }
}

const ELAPSED_UNIT: Record<string, 'minute' | 'hour' | 'day'> = { minutes: 'minute', hours: 'hour', days: 'day' };

/** A span in the unit it was measured in, kept to two places so minutes do not vanish into days.
 *  A unit this build does not know renders as the plain number. */
function formatElapsed(value: number, unit: string, locale?: string): string {
  const known = ELAPSED_UNIT[unit];
  if (!known) return formatNumber(value, undefined, undefined, locale);
  return cachedNumberFormat(locale, { style: 'unit', unit: known, unitDisplay: 'short', maximumFractionDigits: 2 }).format(value);
}

/** The value a date or datetime column stores, from the epoch seconds an extremum returns. A
 *  date is a calendar day the server projects as UTC midnight, so it is rebuilt as that day
 *  rather than as an instant read in the viewer's zone. */
function epochToStored(seconds: number, type: 'date' | 'datetime'): string {
  const iso = new Date(seconds * 1000).toISOString();
  return type === 'datetime' ? iso : iso.slice(0, 10);
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A stored date or datetime as a local `Date`. A bare calendar date (or any value of a date
 *  field) is that day locally, never UTC midnight read in the viewer's offset. */
function parseForDisplay(raw: string, dateOnly: boolean): Date {
  const trimmed = raw.trim();
  const m = DATE_ONLY.exec(trimmed.slice(0, 10));
  if (!m || !(dateOnly || trimmed.length === 10)) return new Date(raw);
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(year, month - 1, day);
  // The constructor maps years 0–99 onto 1900 + y.
  d.setFullYear(year);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : new Date(Number.NaN);
}

function relativeFromNow(d: Date, now: Date, rtf: Intl.RelativeTimeFormat): string {
  const diffSec = (d.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diffSec);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (abs >= secs) return rtf.format(Math.trunc(diffSec / secs), unit);
  }
  return rtf.format(Math.trunc(diffSec), 'second');
}

/** Two instants half a year apart, whose offsets from UTC change with the viewer's time zone, summer time
 *  included. A browser hands an open page the new zone when the computer's changes. */
const JANUARY = new Date(Date.UTC(2026, 0, 1));
const JULY = new Date(Date.UTC(2026, 6, 1));
const zoneMark = (): number => JANUARY.getTimezoneOffset() * 2048 + JULY.getTimezoneOffset();

/** Writes a stored date or datetime under its field's display preset, as AgentFlow renders it.
 *  `toLocaleDateString` builds a formatter on every call, about a hundred times what writing with a
 *  built one costs, and a chart writes a label for every tick and mark each time it is resized; so each
 *  formatter is built on its first use and kept. A formatter reads the time zone when it is built and the
 *  rest of a date's text reads it when written, so the writer drops what it keeps when the zone moves. */
function dateTimeWriter(
  withTime: boolean,
  format: Schemas['FieldFormat'] | null | undefined,
  options: FormatOptions,
  locale: string | undefined,
  dateOnly: boolean,
): (value: string) => string {
  const made = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat>();
  let zone = zoneMark();
  const kept = <T extends Intl.DateTimeFormat | Intl.RelativeTimeFormat>(name: string, make: () => T): T => {
    let formatter = made.get(name) as T | undefined;
    if (!formatter) {
      formatter = make();
      made.set(name, formatter);
    }
    return formatter;
  };
  const time = () =>
    kept('time', () =>
      options.time_style === '12h'
        ? new Intl.DateTimeFormat(locale ?? 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : new Intl.DateTimeFormat(locale ?? 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
    );
  const long = () => kept('long', () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }));
  const month = () => kept('month', () => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }));
  const relative = () => kept('relative', () => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }));
  const day = () => kept('day', () => new Intl.DateTimeFormat(locale ?? 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  return (value) => {
    const now = zoneMark();
    if (now !== zone) {
      zone = now;
      made.clear();
    }
    const d = parseForDisplay(value, dateOnly);
    if (Number.isNaN(d.getTime())) return value;
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = pad4(d.getFullYear());
    let datePart: string;
    switch (format) {
      case 'dd_mm_yyyy':
        datePart = `${dd}/${mm}/${yyyy}`;
        break;
      case 'mm_dd_yyyy':
        datePart = `${mm}/${dd}/${yyyy}`;
        break;
      case 'iso':
        datePart = `${yyyy}-${mm}-${dd}`;
        break;
      case 'long':
        datePart = long().format(d);
        break;
      case 'month_year':
        return month().format(d);
      case 'relative':
        return relativeFromNow(d, new Date(), relative());
      default: {
        const base = day().format(d);
        return withTime ? `${base} · ${time().format(d)}` : base;
      }
    }
    return withTime ? `${datePart} ${time().format(d)}` : datePart;
  };
}

/** A measure's figure, rendered once at display time in its unit. `null` is `—`; zero is a value.
 *  A count is a plain integer whatever field it reads, a ratio is dimensionless, a duration is a
 *  span in its unit, and a date extremum is a date again. */
export function formatMeasureValue(
  measure: FigureMeasure,
  value: number | null,
  field?: FigureField,
  locale?: string,
): string {
  return value == null ? '—' : measureWriter(measure, field, locale)(value);
}

/** `formatMeasureValue` for one measure, decided once. The writer builds each formatter it needs on its
 *  first value and keeps it, so a chart that words every tick and mark on each resize builds none. */
export function measureFormatter(measure: FigureMeasure, field?: FigureField, locale?: string): (value: number | null) => string {
  const write = measureWriter(measure, field, locale);
  return (value) => (value == null ? '—' : write(value));
}

function measureWriter(measure: FigureMeasure, field: FigureField | undefined, locale: string | undefined): (value: number) => string {
  if (measure.fn === 'ratio') {
    const options = formatOptionsOf(field);
    return (value) => formatNumber(value, undefined, options, locale);
  }
  const duration = measure.duration;
  if (duration) return (value) => formatElapsed(value, duration.unit, locale);
  if (!measure.fn || !field || isCounting(measure.fn)) return (value) => formatNumber(value, undefined, undefined, locale);
  const type = effectiveType(field);
  const options = formatOptionsOf(field);
  if ((type === 'date' || type === 'datetime') && (measure.fn === 'min' || measure.fn === 'max')) {
    const write = dateTimeWriter(type === 'datetime', field.format, options, locale, type === 'date');
    return (value) => write(epochToStored(value, type));
  }
  const format = field.format;
  return (value) => formatNumber(value, format, options, locale);
}

/** A relative change: `+14.5%` or `−3.3%` (U+2212). No earlier figure, or one of zero, is null. */
export function formatPercentChange(fraction: number | null, locale?: string): string | null {
  if (fraction == null || !Number.isFinite(fraction)) return null;
  const pct = cachedNumberFormat(locale, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(fraction);
  return pct.replace('-', '−');
}

/** Above this many records one record is worth less than a tenth of a point. */
const SHARE_DECIMAL_FROM = 1000;

/** A share as a percentage, at the precision its population supports: no decimal below a thousand
 *  records. An unknown population keeps the decimal. */
export function formatShare(fraction: number | null, population?: number | null, locale?: string): string {
  if (fraction == null || !Number.isFinite(fraction)) return '—';
  const digits = population != null && population < SHARE_DECIMAL_FROM ? 0 : 1;
  return cachedNumberFormat(locale, { style: 'percent', maximumFractionDigits: digits }).format(fraction);
}

/** How far a figure sits from its goal, in the measure's unit, or in points for a percent. */
export function goalDistance(
  measure: FigureMeasure,
  field: FigureField | undefined,
  value: number | null,
  target: number | null,
  locale?: string,
): GoalDistance | null {
  if (value == null || target == null) return null;
  const delta = value - target;
  if (unitOf(measure, field).kind === 'percent') {
    return {
      distance: formatNumber(Math.abs(delta), undefined, { decimal_places: 1 }, locale),
      short: delta < 0,
      met: delta === 0,
      points: true,
    };
  }
  return { distance: formatMeasureValue(measure, Math.abs(delta), field, locale), short: delta < 0, met: delta === 0, points: false };
}
