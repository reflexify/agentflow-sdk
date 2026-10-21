import { describe, expect, it } from 'vitest';
import { shortDuration, slaBadge, waitingSince } from '../../src/model/sla.js';

const now = new Date('2026-10-06T10:00:00Z');
const at = (min: number) => new Date(now.getTime() + min * 60_000).toISOString();

describe('slaBadge', () => {
  it('is overdue with a minus sign', () => expect(slaBadge(at(-18), now)).toEqual({ tone: 'over', text: '−18m' }));
  it('is soon under an hour', () => {
    expect(slaBadge(at(12), now)).toEqual({ tone: 'soon', text: '12m' });
    expect(slaBadge(at(42), now)).toEqual({ tone: 'soon', text: '42m' });
  });
  it('is calm otherwise, in the largest two units', () => {
    expect(slaBadge(at(310), now)).toEqual({ tone: 'ok', text: '5h 10m' });
    expect(slaBadge(at(26 * 60 + 5), now)).toEqual({ tone: 'ok', text: '1d 2h' });
  });
  it('is absent without a deadline', () => expect(slaBadge(null, now)).toBeNull());
});

describe('durations', () => {
  it('rounds to minutes and never shows zero units', () => {
    expect(shortDuration(59_000)).toBe('<1m');
    expect(shortDuration(60 * 60_000)).toBe('1h');
    expect(shortDuration(3 * 86_400_000)).toBe('3d');
  });
  it('reads waiting time from the last customer message', () => {
    expect(waitingSince(at(-23), now)).toBe('23m');
    expect(waitingSince(null, now)).toBeNull();
  });
});
