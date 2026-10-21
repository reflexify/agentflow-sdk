// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { markMentionsSeen, mentionsSeenAt } from '../../src/shell/mentions-seen.js';
import { avatarTone, initials } from '../../src/shell/people.js';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('initials', () => {
  it.each([
    ['Bo Tran', 'BT'],
    ['Trần Minh Khoa', 'TK'],
    ['  hà   nguyễn ', 'HN'],
    ['Bo', 'BO'],
    ['X', 'X'],
    ['', '?'],
    ['   ', '?'],
  ])('reads %j as %s', (name, expected) => expect(initials(name)).toBe(expected));
});

describe('avatarTone', () => {
  it('is stable per person and one of the mockup\'s four', () => {
    const tones = new Set(['', 'c2', 'c3', 'c4']);
    for (const id of ['a', 'b', 'c', '20000000-0000-4000-8000-000000000001']) {
      expect(tones.has(avatarTone(id))).toBe(true);
      expect(avatarTone(id)).toBe(avatarTone(id));
    }
    expect(new Set(['a', 'b', 'c', 'd'].map(avatarTone)).size).toBeGreaterThan(1);
  });
});

describe('mentions seen', () => {
  it('remembers, per person, how far they read', () => {
    expect(mentionsSeenAt('u1')).toBe('');
    markMentionsSeen('u1', '2026-10-06T10:00:00.000Z');
    expect(mentionsSeenAt('u1')).toBe('2026-10-06T10:00:00.000Z');
    expect(mentionsSeenAt('u2')).toBe('');
  });

  it('shows everything as new, and does not throw, when the browser refuses storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
    expect(mentionsSeenAt('u1')).toBe('');
    expect(() => markMentionsSeen('u1', '2026-10-06T10:00:00.000Z')).not.toThrow();
  });
});
