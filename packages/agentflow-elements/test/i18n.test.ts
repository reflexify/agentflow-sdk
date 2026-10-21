import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import openapi from '../../../../openapi.json';
import { STRINGS, resolveLocale, translator } from '../src/i18n.js';

describe('strings', () => {
  it('has every key in both languages', () => {
    expect(Object.keys(STRINGS.vi).sort()).toEqual(Object.keys(STRINGS.en).sort());
  });
  it('labels every step status the API can send, and the claimed state the inbox shows', () => {
    for (const status of [...(openapi.components.schemas.StepStatus.enum as string[]), 'claimed']) {
      expect(STRINGS.en, status).toHaveProperty(`status.${status}`);
      expect(STRINGS.vi, status).toHaveProperty(`status.${status}`);
    }
  });
  it('publishes no key that nothing shows', () => {
    const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
    const source = readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter((f) => /\.(ts|svelte)$/.test(f) && !f.endsWith('i18n.ts'))
      .map((f) => readFileSync(join(dir, f), 'utf8'))
      .join('\n');
    // Status labels are looked up as `status.${row.status}`.
    const unused = Object.keys(STRINGS.en).filter((k) => !k.startsWith('status.') && !source.includes(`'${k}'`));
    expect(unused).toEqual([]);
  });
  it('picks the locale from the attribute, then the browser', () => {
    expect(resolveLocale('vi', 'en-US')).toBe('vi');
    expect(resolveLocale(undefined, 'vi-VN')).toBe('vi');
    expect(resolveLocale('fr', 'fr-FR')).toBe('en');
  });
  it('fills variables and lets the host override a string', () => {
    const t = translator('en', { 'task.claim': 'Take it' });
    expect(t('task.claim')).toBe('Take it');
    expect(t('task.claimed_by', { name: 'Ann' })).toBe('Claimed by Ann');
  });
  it('falls back to the key for a string it does not know', () => {
    expect(translator('en', {})('status.archived' as never)).toBe('status.archived');
  });
});
