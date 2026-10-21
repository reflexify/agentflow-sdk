import { readFileSync } from 'node:fs';
import { AF_TOKENS } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { DESK_PALETTE } from '../src/styles/palette.js';

const css = readFileSync(new URL('../src/styles/desk.css', import.meta.url), 'utf8');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** The desk's variables a host's tokens stand for. The others (notes, AI, held messages, status pills) stay the desk's. */
const TOKEN_OF = {
  '--bg': '--af-bg', '--surface': '--af-surface', '--ink': '--af-fg', '--muted': '--af-muted-fg', '--line': '--af-border',
  '--accent': '--af-primary', '--accent-ink': '--af-primary-fg', '--danger': '--af-danger', '--warn': '--af-warning',
  '--ok': '--af-success', '--ring': '--af-ring', '--r': '--af-radius', '--font-ui': '--af-font-sans', '--font-mono': '--af-font-mono',
} as const;
/** The same in both themes, so only the light block declares them. */
const THEMELESS = new Set(['--r', '--font-ui', '--font-mono']);
/** Where the desk's variables are declared: on its own element, light and dark, and never on the host element. */
const LIGHT = '.desk';
const DARK = ':host([data-theme="dark"]) .desk';

/** The declarations of the rule whose selector is exactly `selector`, at the start of a line. */
function block(selector: string): string {
  const start = code.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const open = code.indexOf('{', start);
  return code.slice(open + 1, code.indexOf('}', open));
}

/** Every `--x: var(--af-y, fallback);` of a block, by variable. */
function mapped(body: string): Map<string, { token: string; fallback: string }> {
  const out = new Map<string, { token: string; fallback: string }>();
  for (const m of body.matchAll(/(--[\w-]+): var\((--af-[\w-]+), ([^;]+)\);/g)) out.set(m[1]!, { token: m[2]!, fallback: m[3]! });
  return out;
}

describe('desk.css', () => {
  it('styles only its own shadow root: no :root, html, body or #root, no colour-scheme query, nothing sized to the window', () => {
    const selectors = [...code.matchAll(/([^{}]+)\{/g)]
      .flatMap((m) => m[1]!.split(','))
      .map((s) => s.trim())
      .filter((s) => s !== '' && !s.startsWith('@'));
    for (const s of selectors) expect(s, s).not.toMatch(/^(:root|html|body|#root)\b/);
    expect(code).not.toContain('prefers-color-scheme');
    expect(code).not.toMatch(/\d(vh|vw|dvh|svh)\b/);
    expect(code).not.toMatch(/@media \((max|min)-width/);
  });

  it('declares its custom properties on its own element and never on the host element, where a host maps its own', () => {
    expect(block(':host')).not.toMatch(/--[\w-]+\s*:/);
    // Every other rule, the dark :host(...) selectors included, declares none either.
    const elsewhere = code.replace(block(LIGHT), '').replace(block(DARK), '');
    expect(elsewhere).not.toMatch(/--[\w-]+\s*:/);
  });

  it('maps each colour a host publishes onto its --af-* token, with today\'s colour as the fallback, in both themes', () => {
    const light = mapped(block(LIGHT));
    const dark = mapped(block(DARK));
    for (const [name, token] of Object.entries(TOKEN_OF)) {
      expect(light.get(name), name).toEqual({ token, fallback: DESK_PALETTE.light[token] });
      if (!THEMELESS.has(name)) expect(dark.get(name), name).toEqual({ token, fallback: DESK_PALETTE.dark[token] });
    }
    expect(new Set(Object.values(TOKEN_OF))).toEqual(new Set(AF_TOKENS));
  });

  it('keeps the desk\'s own colours, and puts the dark ones under the host\'s data-theme', () => {
    for (const token of ['--note', '--ai', '--held', '--view', '--st-new']) {
      expect(block(LIGHT), token).toContain(`${token}:`);
      expect(block(DARK), token).toContain(`${token}:`);
    }
    expect(block(LIGHT)).toContain('--font-mail:');
    expect(code).toContain(':host([data-theme="dark"]) .av.c2');
  });

  it('fills its host, not the window, and scrolls itself instead of the panes when narrow', () => {
    expect(block(':host')).toMatch(/display: block; position: relative;/);
    expect(block('.desk')).toMatch(/position: absolute; inset: 0;/);
    expect(block('.desk')).toContain('container: desk / inline-size;');
    expect(code).toMatch(/^\.app \{ height: 100%; border-radius: 0; border: 0; \}$/m);
    // After the mockup's own narrow rules, so it is the one that wins.
    expect(code.lastIndexOf('@container desk (max-width: 860px) { .app { height: auto; } }'))
      .toBeGreaterThan(code.indexOf('.app { height: 100%; border-radius: 0; border: 0; }'));
  });

  it('drops the reviewer-only rules', () => {
    expect(css).not.toMatch(/^\.review/m);
    expect(css).not.toMatch(/^\.notes/m);
    expect(css).not.toMatch(/^\.tabs?\b/m);
    expect(css).not.toMatch(/^\.states\b/m);
  });

  it('wraps long words in messages instead of widening the page', () => {
    expect(css).toMatch(/\.card \.tx[^{]*\{[^}]*overflow-wrap: anywhere/);
  });
});
