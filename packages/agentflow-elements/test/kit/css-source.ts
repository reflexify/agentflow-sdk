import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const kitDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/kit');

/** Every file under the kit's sources, as a path relative to them. */
export function kitFiles(): string[] {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  return walk(kitDir).map((file) => relative(kitDir, file).split(sep).join('/'));
}

export const kitSource = (file: string): string => readFileSync(join(kitDir, file), 'utf8');

/** The stylesheets the kit draws with: `kit.css` and the `<style>` block of each element. */
export function kitStyleSheets(): { file: string; css: string }[] {
  const sheets = [{ file: 'kit.css', css: kitSource('kit.css') }];
  for (const file of kitFiles().filter((f) => f.endsWith('.svelte'))) {
    const markup = kitSource(file).replace(/<!--[\s\S]*?-->/g, '');
    for (const block of markup.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)) sheets.push({ file, css: block[1]! });
  }
  return sheets;
}

export interface CssRule {
  selector: string;
  declarations: string;
  /** The at-rules around it, outermost first: `@media (hover: hover)`. */
  within: string[];
}

/** The style rules of a stylesheet, each with the at-rules it sits in. Keyframes and font faces are not style rules. */
export function cssRules(css: string): CssRule[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: CssRule[] = [];
  const open: { prelude: string; rule: CssRule | null }[] = [];
  let buffer = '';
  let quote = '';
  const inside = () => open.map((block) => block.prelude).filter((prelude) => prelude.startsWith('@'));
  for (const ch of text) {
    if (quote) {
      buffer += ch;
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      buffer += ch;
    } else if (ch === '{') {
      const prelude = buffer.trim();
      const style = !prelude.startsWith('@') && !open.some((block) => /^@(?:-\w+-)?(?:keyframes|font-face)/.test(block.prelude));
      const rule = style ? { selector: prelude, declarations: '', within: inside() } : null;
      if (rule) rules.push(rule);
      open.push({ prelude, rule });
      buffer = '';
    } else if (ch === '}') {
      const top = open.pop();
      if (top?.rule) top.rule.declarations += buffer;
      buffer = '';
    } else if (ch === ';' && !open.at(-1)?.rule) {
      buffer = '';
    } else buffer += ch;
  }
  return rules;
}

/** A selector list split at its top-level commas. */
export function selectorParts(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of list) {
    if ('(['.includes(ch)) depth++;
    else if (')]'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += ch;
  }
  return [...parts, current.trim()].filter(Boolean);
}
