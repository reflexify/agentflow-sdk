import { describe, expect, it } from 'vitest';
import { langOf } from '../src/text.js';

describe('langOf', () => {
  it.each([
    ['vi', 'vi'], ['vi-VN', 'vi'], ['VI-vn', 'vi'],
    ['en', 'en'], ['en-GB', 'en'], ['fr-FR', 'en'], ['', 'en'], ['vie', 'en'],
  ] as const)('reads %j as %s', (locale, lang) => {
    expect(langOf(locale)).toBe(lang);
  });
});
