import { describe, expect, it } from 'vitest';
import { keyAction } from '../../src/keys/keymap.js';

const k = (key: string, mods: Partial<{ metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; code: string }> = {}) =>
  ({ key, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, code: '', ...mods });
const idle = { typing: false, afterG: false };
const typing = { typing: true, afterG: false };

describe('keyAction', () => {
  it('maps the single keys', () => {
    expect(['j', 'k', 'Enter', 'r', 'n', '/', 's', 'w', 'e', '?'].map((key) => keyAction(k(key), idle)))
      .toEqual(['next', 'prev', 'open', 'reply', 'note', 'saved', 'solved', 'waiting', 'escalate', 'help']);
    expect(keyAction(k('N', { shiftKey: true }), idle)).toBe('claimNext');
  });

  it('ignores single keys while typing, but not send, the palette or Escape', () => {
    expect(keyAction(k('s'), typing)).toBeNull();
    expect(keyAction(k('Enter', { metaKey: true }), typing)).toBe('send');
    expect(keyAction(k('Enter', { ctrlKey: true, shiftKey: true }), typing)).toBe('sendWaiting');
    expect(keyAction(k('k', { metaKey: true }), typing)).toBe('palette');
    expect(keyAction(k('Escape'), typing)).toBe('escape');
  });

  it('reads ⌥S by its physical key, since Option changes the character on a Mac', () => {
    expect(keyAction(k('ß', { altKey: true, code: 'KeyS' }), typing)).toBe('shorter');
  });

  it('goes to a folder with G then a letter', () => {
    expect(keyAction(k('g'), idle)).toBe('g');
    expect(keyAction(k('m'), { typing: false, afterG: true })).toBe('goMine');
    expect(keyAction(k('u'), { typing: false, afterG: true })).toBe('goUnclaimed');
    expect(keyAction(k('h'), { typing: false, afterG: true })).toBe('goHeld');
    expect(keyAction(k('x'), { typing: false, afterG: true })).toBeNull();
  });

  it('leaves the browser\'s own shortcuts alone', () => {
    expect(keyAction(k('r', { metaKey: true }), idle)).toBeNull();
    expect(keyAction(k('s', { ctrlKey: true }), idle)).toBeNull();
  });
});
