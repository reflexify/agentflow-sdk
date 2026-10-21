import { describe, expect, it } from 'vitest';
import { langOf, t, TEXT } from '../src/text.js';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();

describe('the module text', () => {
  it('has the same keys in both languages, none empty', () => {
    expect(Object.keys(TEXT.vi).sort()).toEqual(Object.keys(TEXT.en).sort());
    for (const lang of ['en', 'vi'] as const) {
      for (const [key, value] of Object.entries(TEXT[lang])) expect(value, `${lang}.${key}`).not.toBe('');
    }
  });

  it('keeps every placeholder of the English string in the Vietnamese one', () => {
    for (const key of Object.keys(TEXT.en) as (keyof typeof TEXT.en)[]) {
      expect(placeholders(TEXT.vi[key]), key).toEqual(placeholders(TEXT.en[key]));
    }
  });

  it('chooses Vietnamese for vi and vi-…, and English for anything else', () => {
    expect(langOf('vi-VN')).toBe('vi');
    expect(langOf('en-GB')).toBe('en');
    expect(langOf('vie')).toBe('en');
    expect(t('vi', 'appName')).toBe('Dự án');
  });

  it('fills placeholders and leaves an unknown one as written', () => {
    expect(t('en', 'missingObjects', { keys: 'entity:task' })).toContain('missing entity:task.');
    expect(t('en', 'missingObjects')).toContain('{keys}');
  });
});
