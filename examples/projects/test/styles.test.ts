import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/projects.css', import.meta.url), 'utf8');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** The declarations of the rule whose selector is exactly `selector`, at the start of a line. */
function block(selector: string): string {
  const start = code.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const open = code.indexOf('{', start);
  return code.slice(open + 1, code.indexOf('}', open));
}

const selectors = [...code.matchAll(/([^{}]+)\{/g)]
  .flatMap((m) => m[1]!.split(','))
  .map((s) => s.trim())
  .filter((s) => s !== '' && !s.startsWith('@'));

describe('projects.css', () => {
  it('styles only its own shadow root: nothing on :root, html, body or #root', () => {
    expect(selectors.length).toBeGreaterThan(0);
    for (const s of selectors) expect(s, s).not.toMatch(/^(:root|html|body|#root)\b/);
  });

  it('reads every --af-* token with a fallback', () => {
    for (const m of code.matchAll(/var\((--af-[\w-]+)([^)]*)\)/g)) expect(m[2], m[1]).toMatch(/^,\s*\S/);
  });

  it('is not sized to the window or its colour scheme', () => {
    expect(code).not.toContain('prefers-color-scheme');
    expect(code).not.toMatch(/\d(vh|vw|dvh|svh)\b/);
    expect(code).not.toMatch(/@media[^{]*\((?:min-|max-)?(?:width|height)\b/);
  });

  it('declares its custom properties on .projects, light and dark, and never on the host element', () => {
    expect(block(':host')).not.toMatch(/--[\w-]+\s*:/);
    const elsewhere = code.replace(block('.projects'), '').replace(block(':host([data-theme="dark"]) .projects'), '');
    expect(elsewhere).not.toMatch(/--[\w-]+\s*:/);
  });

  it('fills its host and takes its width from a container', () => {
    expect(block(':host')).toMatch(/display: block; position: relative;/);
    expect(block('.projects')).toMatch(/position: absolute; inset: 0;/);
    expect(block('.projects')).toContain('container: projects / inline-size;');
  });
});

describe('the resets', () => {
  it('weigh nothing, so a class rule always wins over them', () => {
    const bare = selectors.filter((s) => /(^|\s)(\*|button|input|select|textarea|:focus-visible)\b|(^|\s)\*$/.test(s) || s.endsWith(':focus'));
    expect(bare.length).toBeGreaterThan(0);
    for (const s of bare) expect(s, s).toMatch(/^:where\(\.projects\)/);
  });
});
