import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const kit = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/kit');
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]));

// In CSS: `overflow`, `overflow-x`, `overflow-y`, `overflow-block` or `overflow-inline` with a value that scrolls, the
// two-value shorthand (`overflow: hidden auto`) included. In script: a style property or object key set to one.
const PLAIN = [
  /overflow(?:-[xy]|-block|-inline)?\s*:\s*(?:[a-z]+\s+)?(?:auto|scroll)\b/,
  /overflow(?:[XY]|Block|Inline)?['"]?\s*[:=]\s*['"](?:auto|scroll)\b/,
];

// The tile frame's last-resort scroll (a host card shorter than the figure's floors) stays the browser's: the kit's scroller on
// every tile cost WebKit about six seconds more to draw a page of forty tiles.
// The folder source's list of folders is the browser's too: the elements bundle carries that element for the start form, and
// the kit's scroller would bring Ark's scroll area into a bundle that holds no other part of the kit.
// Named here so that these stay the only exceptions.
const ALLOWED = ['FolderSource.svelte', 'tile/TileView.svelte'];

describe('scrolling in the kit', () => {
  it('goes through the kit scroller: no plain overflow auto or scroll outside it', () => {
    const scanned = files(kit).filter((file) => /\.(?:svelte|ts|css)$/.test(file));
    expect(scanned.length, 'the scan found the kit\'s sources').toBeGreaterThanOrEqual(20);
    const found = scanned
      .map((file) => relative(kit, file).split(sep).join('/'))
      .filter((path) => !path.startsWith('scroll/'))
      .filter((path) => PLAIN.some((re) => re.test(readFileSync(join(kit, path), 'utf8'))));
    expect(found, 'these files scroll on their own instead of through src/kit/scroll').toEqual(ALLOWED);
  });

  it('catches every way of writing it', () => {
    const caught = (text: string) => PLAIN.some((re) => re.test(text));
    for (const text of ['overflow: auto', 'overflow-y:scroll', 'overflow: hidden auto', 'overflow-block: auto', 'overflow-inline: scroll',
      "el.style.overflowY = 'auto'", "style.overflow = 'scroll'", "{ overflowX: 'auto' }", "{ 'overflow': \"scroll\" }"]) {
      expect(caught(text), text).toBe(true);
    }
    for (const text of ['overflow: hidden', 'overflow-wrap: anywhere', 'text-overflow: ellipsis', "overflowY = 'hidden'"]) {
      expect(caught(text), text).toBe(false);
    }
  });
});
