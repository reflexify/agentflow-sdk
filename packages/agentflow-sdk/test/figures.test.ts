import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  echoedMeasure,
  formatMeasureValue,
  formatNumber,
  formatPercentChange,
  formatShare,
  measureFormatter,
  type FigureField,
  type FigureMeasure,
} from '../src/figures/index.js';
import type { ComputeMeasure } from '../src/analytics/tiles.js';
import type { components } from '../src/generated/public.js';

type Schemas = components['schemas'];


describe('figures outside the golden table', () => {
  const zone = process.env.TZ;
  afterEach(() => {
    if (zone === undefined) delete process.env.TZ;
    else process.env.TZ = zone;
  });

  it('a datetime extremum renders in the viewer\'s zone', () => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const at: FigureField = { key: 'at', type: 'datetime', format: 'iso' };
    expect(formatMeasureValue({ fn: 'max', field: 'at' }, Date.UTC(2026, 2, 14, 20) / 1000, at, 'en')).toBe('2026-03-15 03:00');
  });

  it('a measure that names a metric is typed as its definition once echoed', () => {
    const measure: ComputeMeasure = { key: 'rev', metric: 'revenue' };
    const echoed = echoedMeasure(measure, { id: 'metric-9', fn: 'sum', field: 'amount_usd' });
    const fn: Schemas['MeasureFn'] = echoed.fn;
    expect(fn).toBe('sum');
    // @ts-expect-error the reference by key is replaced by the definition it names
    expect(echoed.metric).toBeUndefined();
    expect(echoedMeasure(measure, null).metric).toBe('revenue');
  });
});

describe('the number formatters', () => {
  /** How many `Intl.NumberFormat`s `run` builds, counting one that is refused. */
  function built(run: () => void): number {
    const Real = Intl.NumberFormat;
    let made = 0;
    Intl.NumberFormat = new Proxy(Real, { construct: (target, args) => (made++, Reflect.construct(target, args)) });
    try {
      run();
    } finally {
      Intl.NumberFormat = Real;
    }
    return made;
  }

  const hours = { fn: 'avg', duration: { from: 'opened', to: 'closed', unit: 'hours' } } as const;
  // Each pair differs in one thing only, so a formatter shared between them would show in the words.
  const table: { name: string; say: () => string; expect: string }[] = [
    { name: 'a plain number', say: () => formatNumber(1234.5, undefined, undefined, 'en'), expect: '1,234.5' },
    { name: 'the same number in another locale', say: () => formatNumber(1234.5, undefined, undefined, 'de'), expect: '1.234,5' },
    { name: 'dollars to the cent', say: () => formatNumber(1234.567, 'currency', { currency_code: 'USD', decimal_places: 2 }, 'en'), expect: '$1,234.57' },
    { name: 'dollars to the dollar', say: () => formatNumber(1234.567, 'currency', { currency_code: 'USD', decimal_places: 0 }, 'en'), expect: '$1,235' },
    { name: 'euros to the cent', say: () => formatNumber(1234.567, 'currency', { currency_code: 'EUR', decimal_places: 2 }, 'en'), expect: '€1,234.57' },
    { name: 'a number with no separators', say: () => formatNumber(1234.5, undefined, { separators: 'none' }, 'en'), expect: '1234.5' },
    { name: 'a number with the separators of a locale it is not in', say: () => formatNumber(1234.5, undefined, { separators: 'dot_comma' }, 'en'), expect: '1.234,5' },
    { name: 'a percent', say: () => formatNumber(12.5, 'percent', { decimal_places: 2 }, 'en'), expect: '12.50%' },
    { name: 'a share below a thousand records', say: () => formatShare(0.1234, 500, 'en'), expect: '12%' },
    { name: 'a share over a thousand', say: () => formatShare(0.1234, 5000, 'en'), expect: '12.3%' },
    { name: 'the share in another locale', say: () => formatShare(0.1234, 5000, 'de'), expect: '12,3\u00a0%' },
    { name: 'a change', say: () => formatPercentChange(0.145, 'en') ?? '', expect: '+14.5%' },
    { name: 'a span in hours', say: () => formatMeasureValue(hours, 2.5, undefined, 'en'), expect: '2.5 hr' },
    { name: 'the span in another locale', say: () => formatMeasureValue(hours, 2.5, undefined, 'vi'), expect: '2,5 giờ' },
  ];

  it('are never shared between different options or locales', () => {
    expect(table.map((c) => c.say())).toEqual(table.map((c) => c.expect));
  });

  it.each(table)('are built once for $name, however often it is written', ({ say, expect: words }) => {
    say();
    let last = '';
    expect(built(() => { for (let i = 0; i < 50; i++) last = say(); })).toBe(0);
    expect(last).toBe(words);
  });

  it('are all kept side by side, not one after another', () => {
    for (const c of table) c.say();
    expect(built(() => { for (let i = 0; i < 5; i++) for (const c of table) c.say(); })).toBe(0);
  });

  it('are not kept for a currency the platform refuses, which still reads as the plain number', () => {
    const refused = () => formatNumber(1234.5, 'currency', { currency_code: 'US' }, 'en');
    expect(refused()).toBe('1,234.5');
    expect(refused()).toBe('1,234.5');
    expect(formatNumber(1234.5, 'currency', { currency_code: 'USD' }, 'en')).toBe('$1,234.50');
  });

  it('keep reading right when more are asked for than are kept', () => {
    const at = (digits: number, code: string) => formatNumber(1.5, 'currency', { currency_code: code, decimal_places: digits }, 'en');
    const codes = ['USD', 'EUR', 'GBP', 'JPY', 'VND', 'CHF', 'CAD', 'AUD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'];
    const first = at(0, 'USD');
    for (let digits = 0; digits <= 20; digits++) for (const code of codes) at(digits, code);
    expect(at(0, 'USD')).toBe(first);
    expect(built(() => at(20, 'HUF'))).toBe(0);
  });
});

describe('a measure formatter', () => {
  const zone = process.env.TZ;
  beforeEach(() => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.UTC(2026, 2, 8));
  });
  afterEach(() => {
    vi.useRealTimers();
    if (zone === undefined) delete process.env.TZ;
    else process.env.TZ = zone;
  });

  /** How many date formatters `run` builds, counting the one each `toLocale…String` call builds out of sight. */
  function built(run: () => void): number {
    const real = { DateTimeFormat: Intl.DateTimeFormat, RelativeTimeFormat: Intl.RelativeTimeFormat };
    const proto = Date.prototype as unknown as Record<string, (...args: unknown[]) => string>;
    const methods = ['toLocaleDateString', 'toLocaleTimeString', 'toLocaleString'];
    const saved = methods.map((name) => proto[name]!);
    let made = 0;
    const counted = <T extends object>(target: T): T =>
      new Proxy(target, {
        construct: (t, args) => (made++, Reflect.construct(t as new (...a: unknown[]) => object, args)),
        apply: (t, self, args) => (made++, Reflect.apply(t as (...a: unknown[]) => unknown, self, args)),
      });
    Object.assign(Intl, { DateTimeFormat: counted(real.DateTimeFormat), RelativeTimeFormat: counted(real.RelativeTimeFormat) });
    methods.forEach((name, i) => {
      proto[name] = function (this: Date, ...args: unknown[]) {
        made++;
        return saved[i]!.apply(this, args);
      };
    });
    try {
      run();
    } finally {
      Object.assign(Intl, real);
      methods.forEach((name, i) => (proto[name] = saved[i]!));
    }
    return made;
  }

  const day = Date.UTC(2026, 2, 5) / 1000;
  const moment = Date.UTC(2026, 2, 5, 6, 7) / 1000;
  const date = (over: Partial<FigureField> = {}): FigureField => ({ key: 'due', type: 'date', ...over });
  const datetime = (over: Partial<FigureField> = {}): FigureField => ({ key: 'at', type: 'datetime', ...over });
  // What AgentFlow writes for the latest of each, in Ho Chi Minh City three days after the day.
  const table: { name: string; field: FigureField; value: number; locale?: string; expect: string }[] = [
    { name: 'a date', field: date(), value: day, locale: 'en', expect: 'Mar 05, 2026' },
    { name: 'the date in another locale', field: date(), value: day, locale: 'vi', expect: '05 thg 3, 2026' },
    { name: 'a date written long', field: date({ format: 'long' }), value: day, locale: 'en', expect: 'Mar 5, 2026' },
    { name: 'a month', field: date({ format: 'month_year' }), value: day, locale: 'en', expect: 'Mar 2026' },
    { name: 'a date as day, month and year', field: date({ format: 'dd_mm_yyyy' }), value: day, locale: 'en', expect: '05/03/2026' },
    { name: 'a date relative to now', field: date({ format: 'relative' }), value: day, locale: 'en', expect: '3 days ago' },
    { name: 'a date and time', field: datetime(), value: moment, locale: 'en', expect: 'Mar 05, 2026 · 13:07' },
    { name: 'a date and time on a 12-hour clock', field: datetime({ format_options: { time_style: '12h' } }), value: moment, locale: 'en', expect: 'Mar 05, 2026 · 1:07 PM' },
    { name: 'a date and time as ISO', field: datetime({ format: 'iso' }), value: moment, locale: 'en', expect: '2026-03-05 13:07' },
    { name: 'a date and time with no locale', field: datetime(), value: moment, expect: '05 Mar 2026 · 13:07' },
  ];
  const latest = (field: FigureField): FigureMeasure => ({ fn: 'max', field: field.key });

  it('writes the latest date as formatMeasureValue does, in each display preset', () => {
    expect(table.map((c) => measureFormatter(latest(c.field), c.field, c.locale)(c.value))).toEqual(table.map((c) => c.expect));
    expect(table.map((c) => formatMeasureValue(latest(c.field), c.value, c.field, c.locale))).toEqual(table.map((c) => c.expect));
  });

  it.each(table)('builds its date formatter once for $name, however many values it writes', ({ field, value, locale, expect: words }) => {
    const write = measureFormatter(latest(field), field, locale);
    write(value);
    expect(built(() => { for (let i = 0; i < 50; i++) write(value + i * 86_400); })).toBe(0);
    expect(write(value)).toBe(words);
  });

  it.each([
    { name: 'a date', field: date(), from: 'America/Los_Angeles', to: 'Asia/Ho_Chi_Minh', expect: 'Mar 05, 2026' },
    { name: 'a date and time as ISO', field: datetime({ format: 'iso' }), from: 'America/Los_Angeles', to: 'Asia/Ho_Chi_Minh', expect: '2026-03-05 13:07' },
    { name: 'a date and time', field: datetime(), from: 'Asia/Ho_Chi_Minh', to: 'UTC', expect: 'Mar 05, 2026 · 06:07' },
  ])('writes $name in the zone the viewer is in now, even one it was made before', ({ field, from, to, expect: words }) => {
    process.env.TZ = from;
    const write = measureFormatter(latest(field), field, 'en');
    write(field.type === 'date' ? day : moment);
    process.env.TZ = to;
    expect(write(field.type === 'date' ? day : moment)).toBe(words);
    expect(measureFormatter(latest(field), field, 'en')(field.type === 'date' ? day : moment), 'and one made after').toBe(words);
  });

  it('writes no value as a dash, and every other measure in its unit', () => {
    const amount: FigureField = { key: 'amount', type: 'number', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 2 } };
    const measures: [FigureMeasure, FigureField | undefined, string][] = [
      [{ fn: 'count' }, undefined, '1,234.5'],
      [{ fn: 'sum', field: 'amount' }, amount, '$1,234.50'],
      [{ fn: 'ratio', field: 'amount' }, amount, '1,234.50'],
      [{ fn: 'avg', duration: { from: 'opened', to: 'closed', unit: 'hours' } }, undefined, '1,234.5 hr'],
    ];
    for (const [measure, field, words] of measures) {
      const write = measureFormatter(measure, field, 'en');
      expect(write(null)).toBe('—');
      expect(write(1234.5)).toBe(words);
    }
  });
});
