import { describe, expect, it } from 'vitest';
import { doneSince, dueBucket, isOverdue, todayIn, weekEnd } from '../../src/model/dates.js';

describe('dates in the viewer time zone', () => {
  it('is already tomorrow in Hanoi while UTC is still today', () => {
    const now = new Date('2026-10-18T18:30:00Z');
    expect(todayIn('Asia/Ho_Chi_Minh', now)).toBe('2026-10-19');
    expect(todayIn('UTC', now)).toBe('2026-10-18');
  });
  it('ends a week on Sunday', () => {
    expect(weekEnd('2026-10-19')).toBe('2026-10-25');
    expect(weekEnd('2026-10-25')).toBe('2026-10-25');
    expect(weekEnd('2026-10-26')).toBe('2026-11-01');
  });
  it('buckets by due date: Sunday is this week, Monday next is later', () => {
    const today = '2026-10-21';
    const b = (due: string | null) => dueBucket({ due, status: 'todo' }, today);
    expect([b('2026-10-20'), b('2026-10-21'), b('2026-10-25'), b('2026-10-26'), b(null)]).toEqual(['overdue', 'today', 'this_week', 'later', 'none']);
  });
  it('counts a task due today as today when UTC is still yesterday, and keeps the week edge in that zone', () => {
    const now = new Date('2026-10-24T20:00:00Z');
    const today = todayIn('Asia/Ho_Chi_Minh', now);
    expect(today).toBe('2026-10-25');
    const b = (due: string) => dueBucket({ due, status: 'doing' }, today);
    expect([b('2026-10-24'), b('2026-10-25'), b('2026-10-26')]).toEqual(['overdue', 'today', 'later']);
    expect(dueBucket({ due: '2026-10-25', status: 'doing' }, todayIn('UTC', now))).toBe('this_week');
  });
  it('never calls a finished task overdue', () => {
    expect(isOverdue({ due: '2026-10-01', status: 'done' }, '2026-10-21')).toBe(false);
    expect(isOverdue({ due: '2026-10-01', status: 'cancelled' }, '2026-10-21')).toBe(false);
    expect(isOverdue({ due: '2026-10-01', status: 'doing' }, '2026-10-21')).toBe(true);
    expect(dueBucket({ due: '2026-10-01', status: 'done' }, '2026-10-21')).toBe('later');
  });
  it('measures the done window back from now', () => {
    expect(doneSince('7', new Date('2026-10-21T10:00:00Z'))).toBe('2026-10-14T10:00:00.000Z');
    expect(doneSince('30', new Date('2026-10-31T10:00:00Z'))).toBe('2026-10-01T10:00:00.000Z');
  });
});
