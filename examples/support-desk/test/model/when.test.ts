import { describe, expect, it } from 'vitest';
import { formatWhen } from '../../src/model/when.js';

// Local time, so the test reads the same in any zone.
const now = new Date(2026, 9, 6, 11, 12);
const at = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).toISOString();

describe('formatWhen', () => {
  it('says today, yesterday, the weekday this week, then the date', () => {
    expect(formatWhen(at(6, 10, 51), now, 'en')).toBe('Today 10:51');
    expect(formatWhen(at(5, 9, 30), now, 'en')).toBe('Yesterday 09:30');
    expect(formatWhen(at(1, 14, 2), now, 'en')).toMatch(/^Thu 14:02$/);
    expect(formatWhen(at(1, 14, 2), new Date(2026, 9, 20), 'en')).toBe('1 Oct');
  });
  it('speaks Vietnamese', () => {
    expect(formatWhen(at(6, 10, 51), now, 'vi')).toBe('Hôm nay 10:51');
    expect(formatWhen(at(5, 9, 30), now, 'vi')).toBe('Hôm qua 09:30');
  });
});
