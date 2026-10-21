import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { formatCell, formatDate } from '../src/format.js';
import { translator } from '../src/i18n.js';

// ICU versions differ on the space before AM/PM (U+202F or U+0020).
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('formatDate', () => {
  it('shows a date-only value as that calendar day', () => {
    expect(formatDate('2026-09-25', 'en')).toBe('Sep 25, 2026');
    expect(formatDate('2026-09-25', 'vi')).toBe('25 thg 9, 2026');
  });

  it('shows a date-time in the viewer’s zone', () => {
    expect(plain(formatDate('2026-09-25T20:30:00Z', 'en'))).toBe('Sep 26, 2026, 3:30 AM');
    expect(plain(formatDate('2026-09-25T03:30:00Z', 'vi'))).toBe('10:30 25 thg 9, 2026');
  });

  it('returns nothing for an empty or unparsable value', () => {
    for (const value of [null, undefined, '', 'soon']) expect(formatDate(value, 'en')).toBe('');
  });

  it('returns nothing for a date-only value that is no real day', () => {
    for (const value of ['2026-02-31', '2026-99-99', '2026-00-10', '2026-13-01', '2026-09-00']) expect(formatDate(value, 'en')).toBe('');
  });

  it('shows a date-only value as that calendar day in a zone behind UTC', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    onTestFinished(() => {
      vi.unstubAllEnvs();
    });
    expect(new Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Los_Angeles');
    expect(formatDate('2026-09-25', 'en')).toBe('Sep 25, 2026');
    expect(formatDate('2026-01-01', 'en')).toBe('Jan 1, 2026');
  });
});

describe('formatCell', () => {
  const en = translator('en', {});
  const vi = translator('vi', {});

  it('shows nothing for a missing value and yes or no for a boolean', () => {
    expect(formatCell(null, 'en', en)).toBe('');
    expect(formatCell(undefined, 'en', en)).toBe('');
    expect([formatCell(true, 'en', en), formatCell(false, 'en', en)]).toEqual(['Yes', 'No']);
    expect([formatCell(true, 'vi', vi), formatCell(false, 'vi', vi)]).toEqual(['Có', 'Không']);
  });

  it('formats numbers and dates for the locale and leaves other text alone', () => {
    expect(formatCell(1234.5, 'en', en)).toBe('1,234.5');
    expect(formatCell(1234.5, 'vi', vi)).toBe('1.234,5');
    expect(formatCell('2026-09-25', 'en', en)).toBe('Sep 25, 2026');
    expect(plain(formatCell('2026-09-25T03:30:00Z', 'en', en))).toBe('Sep 25, 2026, 10:30 AM');
    expect(formatCell('2026-99-99T00:00', 'en', en)).toBe('2026-99-99T00:00');
    expect(formatCell('2026-02-31', 'en', en)).toBe('2026-02-31');
    expect(formatCell('Hà Nội', 'en', en)).toBe('Hà Nội');
  });

  it('keeps a small fraction rather than rounding it away', () => {
    expect(formatCell(0.00012, 'en', en)).toBe('0.00012');
    expect(formatCell(0.00012, 'vi', vi)).toBe('0,00012');
    expect(formatCell(1e-7, 'en', en)).toBe('0.0000001');
  });

  it('shows a computed number without floating-point noise', () => {
    expect(formatCell(0.1 + 0.2, 'en', en)).toBe('0.3');
    expect(formatCell(1.1 * 3, 'en', en)).toBe('3.3');
  });

  it('joins a list and shortens a long object', () => {
    expect(formatCell([1, true, 'x'], 'en', en)).toBe('1, Yes, x');
    expect(formatCell({ a: 1 }, 'en', en)).toBe('{"a":1}');
    const long = formatCell({ text: 'x'.repeat(100) }, 'en', en);
    expect(long).toHaveLength(80);
    expect(long.endsWith('…')).toBe(true);
  });
});
