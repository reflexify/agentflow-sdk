import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  absoluteTime,
  fold,
  formatDate,
  formatMasked,
  isDateMask,
  isoDate,
  matches,
  parseDateInput,
  parseMasked,
  relativeTime,
  todayIsoDate,
  validIsoDate,
} from '../src/index.js';
import type { PickerPage, PickerQuery, PickerSource } from '../src/index.js';

const NOW = Date.parse('2026-11-06T10:00:00Z');
const before = (ms: number) => new Date(NOW - ms).toISOString();
const SECOND = 1000;
const DAY = 24 * 3600 * SECOND;

describe('isoDate', () => {
  it.each([
    [2026, 11, 5, '2026-11-05'],
    [2024, 2, 29, '2024-02-29'],
    [2026, 2, 30, null],
    [2026, 2, 29, null],
    [2026, 13, 1, null],
    [2026, 0, 1, null],
    [2026, 4, 31, null],
    [99, 1, 1, '0099-01-01'],
  ])('isoDate(%j, %j, %j) is %j', (year, month, day, iso) => expect(isoDate(year, month, day)).toBe(iso));
});

describe('validIsoDate', () => {
  it.each([
    ['2026-11-05', '2026-11-05'],
    ['2026-02-30', null],
    ['2026-1-05', null],
    ['05/11/2026', null],
    ['', null],
    [null, null],
    [undefined, null],
  ])('validIsoDate(%j) is %j', (text, iso) => expect(validIsoDate(text)).toBe(iso));
});

describe('parseDateInput', () => {
  it.each([
    ['05/11/2026', '2026-11-05'],
    ['5/1/2026', '2026-01-05'],
    ['2026-11-05', '2026-11-05'],
    [' 05/11/2026 ', '2026-11-05'],
    ['30/02/2026', null],
    ['2026-13-01', null],
    ['tomorrow', null],
    ['', null],
  ])('parseDateInput(%j) is %j', (text, iso) => expect(parseDateInput(text)).toBe(iso));
});

describe('formatDate', () => {
  it.each([
    ['vi', '05/11/2026'],
    ['vi-VN', '05/11/2026'],
    ['en', '5 Nov 2026'],
    [null, '5 Nov 2026'],
  ])('formatDate in %s', (locale, shown) => expect(formatDate('2026-11-05', locale)).toBe(shown));
});

describe('isDateMask', () => {
  it.each([
    ['DD/MM/YYYY', true],
    ['DD-MM-YYYY', true],
    ['DD.MM.YYYY', true],
    ['YYYY-MM-DD', true],
    ['MM/DD/YYYY', true],
    ['DD / MM / YYYY', true],
    ['D MMM', false],
    ['DD/MM/YY', false],
    ['DD/MM/YYYY/DD', false],
    ['YYYYMMDD', true],
    ['DDMMYYYY', true],
    ['YYYY-MMDD', true],
    ['DD de MM de YYYY', false],
    ['xDDMMYYYY', false],
    ['DDMMYYYYx', false],
    ['/DD/MM/YYYY', false],
    ['DD/MM/YYYY HH:mm', false],
    ['dd/mm/yyyy', false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('isDateMask(%j) is %j', (mask, readable) => expect(isDateMask(mask)).toBe(readable));
});

describe('formatMasked', () => {
  it.each([
    ['DD/MM/YYYY', '05/02/2026'],
    ['DD.MM.YYYY', '05.02.2026'],
    ['YYYY-MM-DD', '2026-02-05'],
    ['MM/DD/YYYY', '02/05/2026'],
    ['DD / MM / YYYY', '05 / 02 / 2026'],
    ['YYYYMMDD', '20260205'],
    ['DDMMYYYY', '05022026'],
  ])('writes 2026-02-05 in %s as %s', (mask, shown) => expect(formatMasked('2026-02-05', mask)).toBe(shown));
  it('is null for a mask it cannot read or a day that does not exist', () => {
    expect(formatMasked('2026-02-05', 'D MMM')).toBeNull();
    expect(formatMasked('2026-02-30', 'DD/MM/YYYY')).toBeNull();
  });
});

describe('parseMasked', () => {
  it.each([
    ['20/02/2026', 'DD/MM/YYYY', '2026-02-20'],
    ['20-02-2026', 'DD-MM-YYYY', '2026-02-20'],
    ['20.2.2026', 'DD.MM.YYYY', '2026-02-20'],
    ['2026-02-20', 'YYYY-MM-DD', '2026-02-20'],
    ['2026-2-5', 'YYYY-MM-DD', '2026-02-05'],
    ['02/20/2026', 'MM/DD/YYYY', '2026-02-20'],
    ['  5/1/2026 ', 'DD/MM/YYYY', '2026-01-05'],
    ['31/02/2026', 'DD/MM/YYYY', null],
    ['20/02/26', 'DD/MM/YYYY', null],
    ['20-02-2026', 'DD/MM/YYYY', null],
    ['020/02/2026', 'DD/MM/YYYY', null],
    ['2026-02-20', 'DD/MM/YYYY', null],
    ['99/99/9999', 'DD/MM/YYYY', null],
    ['', 'DD/MM/YYYY', null],
    ['20/02/2026', 'D MMM', null],
    ['20260220', 'YYYYMMDD', '2026-02-20'],
    ['2026022', 'YYYYMMDD', null],
    ['20022026', 'DDMMYYYY', '2026-02-20'],
    ['20261320', 'YYYYMMDD', null],
    ['2026-0220', 'YYYY-MMDD', '2026-02-20'],
    ['2026-020', 'YYYY-MMDD', null],
  ])('parseMasked(%j, %j) is %j', (text, mask, iso) => expect(parseMasked(text, mask)).toBe(iso));
});

describe('todayIsoDate', () => {
  it('is the local calendar day, not the UTC one', () => {
    expect(process.env.TZ).toBe('Asia/Ho_Chi_Minh');
    expect(todayIsoDate(new Date('2026-11-05T20:00:00Z'))).toBe('2026-11-06');
    expect(todayIsoDate(new Date('2026-11-05T16:59:59Z'))).toBe('2026-11-05');
  });
  it('reads the clock when it is not given a date', () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('fold', () => {
  it.each([
    ['Đỗ Đức', 'do duc'],
    ['Nguyễn Văn Bình', 'nguyen van binh'],
    ['ĐÀ NẴNG', 'da nang'],
  ])('fold(%j)', (text, folded) => expect(fold(text)).toBe(folded));
});

describe('matches', () => {
  it.each([
    ['Đỗ Đức', 'duc', true],
    ['Đỗ Đức', ' đô ', true],
    ['Trần Hoa', 'binh', false],
    [null, '', true],
    [null, 'a', false],
  ])('matches(%j, %j)', (text, q, hit) => expect(matches(text, q)).toBe(hit));
});

describe('relativeTime', () => {
  it.each([
    ['20 seconds before', 'en', before(20 * SECOND), 'now'],
    ['5 minutes before', 'en', before(5 * 60 * SECOND), '5 minutes ago'],
    ['1 day before', 'en', before(DAY), 'yesterday'],
    ['10 days before', 'en', before(10 * DAY), 'Oct 27'],
    ['10 days before', 'en-GB', before(10 * DAY), '27 Oct'],
    ['the same date in 2025', 'en', '2025-11-06T10:00:00Z', 'Nov 6, 2025'],
    ['the same date in 2025', 'en-GB', '2025-11-06T10:00:00Z', '6 Nov 2025'],
    ['5 minutes before', 'vi', before(5 * 60 * SECOND), '5 phút trước'],
    ['an invalid string', 'en', 'not a date', ''],
  ])('%s in %s', (_, locale, iso, shown) => expect(relativeTime(iso, locale, NOW)).toBe(shown));
});

describe('absoluteTime', () => {
  it('is empty for an invalid string and text otherwise', () => {
    expect(absoluteTime('not a date', 'en')).toBe('');
    expect(absoluteTime('2026-11-06T10:00:00Z', 'en')).not.toBe('');
  });
});

describe('picker types', () => {
  it('describe a source that pages and resolves', () => {
    expectTypeOf<PickerQuery>().toEqualTypeOf<{ q: string; cursor: string | null; signal: AbortSignal }>();
    expectTypeOf<PickerPage<string>>().toEqualTypeOf<{ items: string[]; next: string | null }>();
    expectTypeOf<PickerSource<string>>().toBeCallableWith({ q: '', cursor: null, signal: new AbortController().signal });
    expectTypeOf<NonNullable<PickerSource<string>['resolve']>>().toEqualTypeOf<
      (ids: string[], signal: AbortSignal) => Promise<string[]>
    >();
  });
});
