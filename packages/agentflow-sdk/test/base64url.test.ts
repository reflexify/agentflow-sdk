import { describe, expect, it } from 'vitest';
import { fromBase64Url, toBase64Url } from '../src/base64url.js';

// Buffer is the reference here only: src/ may not use it (see portability.test.ts).
describe('base64url', () => {
  it('round-trips every byte value, unpadded, in the URL-safe alphabet', () => {
    const bytes = new Uint8Array(256).map((_, i) => i);
    const encoded = toBase64Url(bytes);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(encoded).toBe(Buffer.from(bytes).toString('base64url'));
    expect(fromBase64Url(encoded)).toEqual(bytes);
  });

  it('matches Buffer for every length modulo 3, and past one String.fromCharCode chunk', () => {
    for (const length of [0, 1, 2, 3, 31, 32, 33, 70_000]) {
      const bytes = new Uint8Array(length).map((_, i) => (i * 131 + 7) & 0xff);
      const expected = Buffer.from(bytes).toString('base64url');
      expect(toBase64Url(bytes), `length ${length}`).toBe(expected);
      expect(fromBase64Url(expected), `length ${length}`).toEqual(bytes);
    }
  });

  it('throws on a character outside the alphabet', () => {
    expect(() => fromBase64Url('not base64url!')).toThrow();
  });
});
