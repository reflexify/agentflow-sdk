import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Lexer, Marked } from 'marked';
import type { Tokens } from 'marked';
import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { proseOf, safeHref } from '../../src/kit/prose/prose.js';
import type { ProseBlock, ProseInline } from '../../src/kit/prose/prose.js';
import { kitText } from '../../src/kit/text.js';
import { tileResult } from './fixtures/tile.js';
import { TEXT } from './fixtures/tiles.js';
import { draw, drawn, items, mount, para, parts, textTile } from './fixtures/text-tile.js';

vi.mock('../../src/kit/prose/prose.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/kit/prose/prose.js')>();
  return { ...actual, proseOf: vi.fn(actual.proseOf) };
});

const EN = kitText('en');
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();

/** A body of every ordinary kind of block, with each kind of emphasis, a link, a code span and raw HTML. */
const ORDINARY = '# Title\n\nSome **bold** and *em* with [a link](https://x.example) and `code`, plus <b>html</b>.\n\n- one\n- two\n  - three\n\n> quote\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n';

// Every element a body can draw, links aside: nothing the author typed as HTML is among them.
const DRAWN_TAGS = new Set(['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del', 'code', 'pre', 'ul', 'ol', 'li', 'input', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br']);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('a text tile', () => {
  it('draws each block of a body it reads, and scrolls the body inside the frame', async () => {
    const el = await draw(ORDINARY.repeat(2));
    const region = parts(el, 'prose')[0]!;
    const drawnBlocks = [...region.querySelectorAll('.doc > *')].map((block) => (block.querySelector('table') ? 'table' : block.localName));
    expect(drawnBlocks).toEqual(Array(2).fill(['h1', 'p', 'ul', 'blockquote', 'table']).flat());
    expect(region.querySelector('[part~="viewport"] .doc'), 'the body scrolls inside the frame, in the kit\'s scroller').not.toBeNull();
  });

  it('turns a single newline into a line break', async () => {
    const el = await draw('first\nsecond');
    expect(parts(el, 'prose')[0]!.querySelectorAll('br')).toHaveLength(1);
    expect(drawn(el)).toBe(para('first<br>second'));
  });

  it('keeps the URL of a link the author typed and opens it in a new tab', async () => {
    const el = await draw('See [the runbook](https://example.com/runbook?a=1&b=2), or mail <a@b.co>.');
    const links = [...parts(el, 'prose')[0]!.querySelectorAll('a')];
    expect(links.map((a) => [a.getAttribute('href'), a.textContent])).toEqual([
      ['https://example.com/runbook?a=1&b=2', 'the runbook'],
      ['mailto:a@b.co', 'a@b.co'],
    ]);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noreferrer');
    }
  });

  it('keeps where a numbered list starts and which way a table column is aligned', async () => {
    const el = await draw('3. x\n4. y\n\n| a | b | c | d |\n| :-- | :-: | --: | --- |\n| 1 | 2 | 3 | 4 |');
    expect(drawn(el)).toBe(
      `<ol start="3">${items('x', 'y')}</ol><div><table><thead><tr><th align="left">a</th><th align="center">b</th><th align="right">c</th><th>d</th></tr></thead>` +
        '<tbody><tr><td align="left">1</td><td align="center">2</td><td align="right">3</td><td>4</td></tr></tbody></table></div>',
    );
  });

  it('draws from the spec alone, and has a title only when it has a label', async () => {
    const bare = await draw('Just prose');
    expect(parts(bare, 'title'), 'no label, no title').toHaveLength(0);
    expect(words(parts(bare, 'prose')[0])).toBe('Just prose');

    const titled = await draw('Just prose', 'Notes');
    expect(words(parts(titled, 'title')[0])).toBe('Notes');
    for (const name of ['table-toggle', 'notes', 'verdict', 'state']) expect(parts(titled, name), name).toHaveLength(0);
  });

  it('says what it could not draw in place of the body', async () => {
    // The shell's own placeholder has a state part too, so wait for the words only the tile's code writes.
    const unavailable = mount({ spec: textTile('hidden'), result: tileResult({}, { outcome: 'unavailable' }) });
    await expect.poll(() => words(parts(unavailable, 'state')[0])).toBe(`${EN.tileUnavailable} ${EN.tileUnavailableHint}`);
    expect(parts(unavailable, 'prose')).toHaveLength(0);

    const failed = mount({ spec: textTile('hidden'), result: tileResult({}, { outcome: 'failed', problem: { title: 'Gone', detail: 'No such text', status: 422, type: 'tile.failed' } }) });
    await expect.poll(() => words(parts(failed, 'state')[0])).toBe('Gone No such text');
    expect(parts(failed, 'prose')).toHaveLength(0);

    const waiting = mount({ spec: null });
    await expect.poll(() => words(parts(waiting, 'state')[0])).toBe(EN.tileLoading);
    expect(parts(waiting, 'state')[0]!.getAttribute('role')).toBe('status');
  });

  it('reads the body once for each body, not for each change of anything else', async () => {
    const el = await draw('one');
    const read = vi.mocked(proseOf);
    read.mockClear();
    el.drill = true;
    el.fields = [];
    el.locale = 'vi';
    el.result = tileResult({});
    el.spec = textTile('one');
    el.spec = textTile('one', 'Now titled');
    flushSync();
    expect(words(parts(el, 'title')[0]), 'the tile did redraw its frame').toBe('Now titled');
    expect(read).not.toHaveBeenCalled();

    el.spec = textTile('two');
    flushSync();
    expect(read.mock.calls).toEqual([['two']]);
    expect(words(parts(el, 'prose')[0])).toBe('two');
  });

  it('is the gallery case, drawn from its spec', async () => {
    const el = mount({ spec: TEXT.spec, result: TEXT.result, fields: TEXT.fields });
    await expect.poll(() => parts(el, 'prose').length).toBe(1);
    expect(words(parts(el, 'title')[0])).toBe('Quarter notes');
    expect(drawn(el)).toMatch(/^<h2>Q3 outlook<\/h2><p>Pipeline is <strong>up<\/strong>/);
    expect(parts(el, 'prose')[0]!.querySelectorAll('table, blockquote, code, ul')).toHaveLength(4);
  });
});

describe('a text tile never makes an element out of what the author typed as HTML', () => {
  const HOSTILE: [name: string, markdown: string, text: string][] = [
    ['a script, an anchor and an image with a handler', '<script>alert(1)</script>\n\n<a href="http://evil.example">click</a>\n\n<img src=x onerror="alert(1)">', '<script>alert(1)</script><a href="http://evil.example">click</a><img src=x onerror="alert(1)">'],
    ['bold inside a sentence', 'a <b>bold</b> c', 'a <b>bold</b> c'],
    ['an inline handler', 'a <span onclick="alert(1)">span</span> c', 'a <span onclick="alert(1)">span</span> c'],
    ['a script inside a sentence', 'before <script>alert(1)</script> after', 'before <script>alert(1)</script> after'],
    ['a style and a textarea', 'x <style>a{}</style> *y* <textarea> *z* </textarea>', 'x <style>a{}</style> y <textarea> z </textarea>'],
    ['a comment', 'x <!-- c --> y', 'x <!-- c --> y'],
    ['a handler in a block quote', '> <img src=x onerror=alert(1)>', '<img src=x onerror=alert(1)>'],
    ['a handler in a list item', '- <script>alert(1)</script>\n- b', '<script>alert(1)</script>b'],
    ['a tag in a heading', '# <u onmouseover=alert(1)>h</u>', '<u onmouseover=alert(1)>h</u>'],
    ['a tag in a table cell', '| <b>x</b> |\n|---|\n| <i onclick=alert(1)>y</i> |', '<b>x</b><i onclick=alert(1)>y</i>'],
    ['an anchor with a script URL', '<a href="javascript:alert(1)">x</a>', '<a href="javascript:alert(1)">x</a>'],
    ['markup inside a block of HTML', '<div>\n**not bold**\n</div>', '<div> **not bold** </div>'],
    ['an entity for a tag', '&lt;script&gt;alert(1)&lt;/script&gt;', '<script>alert(1)</script>'],
    ['a numeric entity for a tag', '&#60;img src=x onerror=alert(1)&#62;', '<img src=x onerror=alert(1)>'],
  ];
  for (const [name, markdown, text] of HOSTILE) {
    it(name, async () => {
      const el = await draw(markdown);
      const region = parts(el, 'prose')[0]!;
      const everything = [...region.querySelectorAll('*')];
      expect([...new Set(everything.map((node) => node.localName))].filter((tag) => !DRAWN_TAGS.has(tag)), 'only the elements the tree is made of').toEqual([]);
      expect(everything.flatMap((node) => node.getAttributeNames().filter((name) => name.startsWith('on'))), 'no handler').toEqual([]);
      expect(words(region)).toBe(text.replace(/\s+/g, ' ').trim());
    });
  }
});

describe('a text tile shows the characters of the text, not an escaped copy of them', () => {
  it('shows an ampersand, a less-than, a code span, an escape and a fence as written', async () => {
    const el = await draw(['a & b < c > d "q"', '', '`<b>`', '', '\\*not em\\*', '', '```', '<script>x</script> & "y"', '```'].join('\n'));
    const region = parts(el, 'prose')[0]!;
    expect(region.querySelectorAll('p')[0]!.textContent).toBe('a & b < c > d "q"');
    expect(region.querySelector('p code')!.textContent).toBe('<b>');
    expect(region.querySelectorAll('p')[2]!.textContent).toBe('*not em*');
    expect(region.querySelector('pre code')!.textContent).toBe('<script>x</script> & "y"');
    expect(region.innerHTML, 'the page escapes them once, on its way out').not.toContain('&amp;amp;');
  });
});

describe('character references in a text tile', () => {
  const text = (value: string): ProseInline => ({ kind: 'text', text: value });
  const strong = (value: string): ProseInline => ({ kind: 'strong', children: [text(value)] });
  const read = (markdown: string) => proseOf(markdown);
  const one = (...children: ProseInline[]): ProseBlock[] => [{ kind: 'paragraph', children }];

  it('are read as the platform reads them, which is how its editor writes a space, a digit or a letter next to markup', () => {
    expect(read('**Total:**&#x31;2 deals')).toEqual(one(strong('Total:'), text('12 deals')));
    expect(read('**bold&#x20;**&#x6E;ext')).toEqual(one(strong('bold '), text('next')));
    expect(read('&#x20; indented')).toEqual(one(text('  indented')));
    expect(read('&#x9;x')).toEqual(one(text('\tx')));
    expect(read('&#65;&#X42;&#x1F600;')).toEqual(one(text('AB\u{1F600}')));
  });

  it('turn the code point 0, a surrogate and anything past U+10FFFF into U+FFFD, and leave a number of the wrong length as typed', () => {
    expect(read('&#0; &#xD800; &#xdfff; &#x110000; &#1114112; &#x0;')).toEqual(one(text('\ufffd \ufffd \ufffd \ufffd \ufffd \ufffd')));
    expect(read('&#12345678; &#x1234567; &#; &#x; &#65')).toEqual(one(text('&#12345678; &#x1234567; &#; &#x; &#65')));
  });

  it('name the characters of a short list and leave every other name as typed', () => {
    const named: [string, string][] = [
      ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', '\u00a0'], ['copy', '\u00a9'], ['reg', '\u00ae'],
      ['trade', '\u2122'], ['hellip', '\u2026'], ['mdash', '\u2014'], ['ndash', '\u2013'], ['lsquo', '\u2018'], ['rsquo', '\u2019'],
      ['ldquo', '\u201c'], ['rdquo', '\u201d'], ['laquo', '\u00ab'], ['raquo', '\u00bb'], ['middot', '\u00b7'], ['times', '\u00d7'],
      ['deg', '\u00b0'], ['euro', '\u20ac'],
    ];
    for (const [name, character] of named) expect(read(`a &${name}; b`), name).toEqual(one(text(`a ${character} b`)));
    for (const typed of ['&bogus;', '&Amp;', '&AMP;', '&hearts;', '&constructor;', '&toString;', '&valueOf;', '&amp', '& amp;', '&amp ;']) expect(read(`x ${typed} y`), typed).toEqual(one(text(`x ${typed} y`)));
  });

  it('are read in text and in an image alt, and in nothing that is not text', () => {
    const code = (value: string): ProseInline => ({ kind: 'code', text: value });
    expect(read('`&amp;` and \\&amp; and <b title="&amp;">')).toEqual(one(code('&amp;'), text(' and &amp; and <b title="&amp;">')));
    expect(read('```\n&amp; &#65;\n```')).toEqual([{ kind: 'code', text: '&amp; &#65;' }]);
    expect(read('    &amp; &#65;')).toEqual([{ kind: 'code', text: '&amp; &#65;' }]);
    expect(read('![a &amp; b `&amp;` c](https://x.example/c.png)')).toEqual(one(text('a & b &amp; c')));
    expect(read('x &lt;b&gt; y')).toEqual(one(text('x <b> y')));
  });

  it('are read in a link address before it is checked, so one cannot hide a scheme', () => {
    expect(read('[a](https://x.example/?a=1&amp;b=2)')).toEqual(one({ kind: 'link', href: 'https://x.example/?a=1&b=2', children: [text('a')] }));
    expect(read('[a](javascript&#58;alert(1))')).toEqual(one(text('a')));
    expect(read('[a](&#x6A;avascript:alert(1))')).toEqual(one(text('a')));
    expect(read('[a](java&#9;script:alert(1))')).toEqual(one(text('a')));
  });

  it('are drawn as the characters they name and never as markup', async () => {
    const el = await draw('**Total:**&#x31;2 deals &lt;b&gt;x&lt;/b&gt; &#60;script&#62;');
    expect(drawn(el)).toBe(para('<strong>Total:</strong>12 deals <b>x</b> <script>'));
    expect(parts(el, 'prose')[0]!.querySelectorAll('b, script')).toHaveLength(0);
  });
});

describe('safeHref', () => {
  // react-markdown's defaultUrlTransform, which the platform's MarkdownView uses: a scheme survives only as one of its list.
  const TABLE: [url: string, kept: boolean][] = [
    ['javascript:alert(1)', false],
    ['JaVaScRiPt:x', false],
    ['data:text/html,x', false],
    ['vbscript:x', false],
    ['file:///etc/passwd', false],
    ['tel:+84', false],
    [' javascript:x', false],
    ['java\tscript:x', false],
    ['\njavascript:x', false],
    ['https://a.example', true],
    ['HTTP://A.EXAMPLE', true],
    ['mailto:a@b.c', true],
    ['irc://host/chan', true],
    ['ircs://host/chan', true],
    ['xmpp:a@b.c', true],
    ['/records/1', true],
    ['#top', true],
    ['?q=a:b', true],
    ['a/b:c', true],
    ['records', true],
    ['//host.example/x', true],
  ];
  it('keeps a scheme it knows and a URL without one, and nothing else', () => {
    for (const [url, kept] of TABLE) expect(safeHref(url), url).toBe(kept ? url : null);
  });

  it('never keeps a URL a browser would resolve to a script', () => {
    const base = 'https://base.example/page';
    const urls = [...TABLE.map(([url]) => url), 'javascript&#58;alert(1)', '&#x6A;avascript:alert(1)', 'java&#9;script:alert(1)', '\\javascript:alert(1)', 'jav%61script:alert(1)'];
    for (const url of urls) {
      const href = safeHref(url);
      if (href !== null) expect(['http:', 'https:', 'mailto:', 'irc:', 'ircs:', 'xmpp:'], url).toContain(new URL(href, base).protocol);
    }
  });
});

describe('a link in a text tile', () => {
  // [markdown, the text it shows, the hrefs it draws]
  const LINKS: [name: string, markdown: string, text: string, hrefs: string[]][] = [
    ['an unsafe scheme', '[tap me](javascript:alert(1))', 'tap me', []],
    ['a reference to an unsafe scheme', '[x][r]\n\n[r]: javascript:alert(1)', 'x', []],
    ['a shortcut reference to an unsafe scheme', '[x]\n\n[x]: javascript:alert(1)', 'x', []],
    ['an autolink to an unsafe scheme', '<javascript:alert(1)>', 'javascript:alert(1)', []],
    ['a scheme in capitals', '[a](JAVASCRIPT:alert(1))', 'a', []],
    ['a space before the scheme', '[a]( javascript:alert(1))', 'a', []],
    ['spaces before the scheme in angle brackets', '[a](<  javascript:alert(1)>)', 'a', []],
    ['a tab inside the scheme', '[a](<java\tscript:alert(1)>)', 'a', []],
    ['a data URL', '[a](data:text/html;base64,PHNjcmlwdD4=)', 'a', []],
    ['an image that links to an unsafe scheme', '[![alt](https://x.example/c.png)](javascript:alert(1))', 'alt', []],
    ['an empty destination', '[a]()', 'a', []],
    ['a safe link around an unsafe one', '[[a](javascript:alert(1))](https://ok.example)', 'a', ['https://ok.example']],
    ['a safe link around a safe one', '[[a](https://in.example)](https://out.example)', 'a', ['https://out.example']],
    ['an entity for the colon', '[a](javascript&#58;alert(1))', 'a', []],
    ['an entity for the first letter', '[a](&#x6A;avascript:alert(1))', 'a', []],
    ['a named entity for the colon', '[a](javascript&colon;alert(1))', 'a', ['javascript&colon;alert(1)']],
    ['an entity in a query string', '[a](https://x.example/?a=1&amp;b=2)', 'a', ['https://x.example/?a=1&b=2']],
    ['a scheme-relative URL', '[a](//evil.example/x)', 'a', ['//evil.example/x']],
    ['a mailto, an address and a path', '[a](mailto:a@b.c) www.example.com [b](/records/1)', 'a www.example.com b', ['mailto:a@b.c', 'http://www.example.com', '/records/1']],
  ];
  for (const [name, markdown, text, hrefs] of LINKS) {
    it(`${name} ${hrefs.length ? 'draws only a link that cannot run script' : 'is its text and no link'}`, async () => {
      const el = await draw(markdown);
      const region = parts(el, 'prose')[0]!;
      expect(words(region)).toBe(text);
      const anchors = [...region.querySelectorAll('a')];
      expect(anchors.map((a) => a.getAttribute('href'))).toEqual(hrefs);
      expect(region.querySelectorAll('a a'), 'a link never holds a link').toHaveLength(0);
      for (const a of anchors) {
        expect(a.getAttribute('href')).not.toMatch(/^\s*javascript:/i);
        expect(['http:', 'https:', 'mailto:'], a.getAttribute('href')!).toContain(new URL(a.getAttribute('href')!, 'https://base.example/').protocol);
      }
    });
  }
});

describe('an image in a text tile', () => {
  it('is its alt text and is never requested', async () => {
    const el = await draw('![a chart](https://x.example/c.png)');
    const region = parts(el, 'prose')[0]!;
    expect(region.querySelectorAll('img, picture, source, object, embed, iframe, video, audio')).toHaveLength(0);
    expect(words(region)).toBe('a chart');
    expect(region.innerHTML).not.toContain('x.example');
  });

  it('is its alt text with the markup taken out, or nothing, or the text of the link it is in', async () => {
    const el = await draw('![the *new* chart](https://x.example/c.png) ![](https://x.example/d.png)\n\n![ref][r]\n\n[![inside](https://x.example/e.png)](https://l.example)\n\n[r]: https://x.example/f.png');
    const region = parts(el, 'prose')[0]!;
    expect([...region.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['the new chart ', 'ref', 'inside']);
    expect(region.querySelectorAll('img')).toHaveLength(0);
    expect(region.querySelector('a')!.textContent).toBe('inside');
  });
});

describe('proseOf', () => {
  const blocksText = (blocks: ReturnType<typeof proseOf>) => JSON.stringify(blocks);
  const hasStrong = (block: ReturnType<typeof proseOf>[number]) => block.kind === 'paragraph' && block.children.some((run) => run.kind === 'strong');
  /** How many quotes and lists a block sits in at its deepest. */
  const depth = (blocks: ReturnType<typeof proseOf>): number =>
    Math.max(0, ...blocks.map((b) => (b.kind === 'quote' ? 1 + depth(b.children) : b.kind === 'list' ? 1 + Math.max(0, ...b.items.map((i) => depth(i.children))) : 0)));
  /** The text of the paragraph at the bottom of the first quote or item of each level. */
  const innermost = (blocks: ReturnType<typeof proseOf>): string => {
    let block = blocks[0];
    while (block && (block.kind === 'quote' || block.kind === 'list')) block = block.kind === 'quote' ? block.children[0] : block.items[0]!.children[0];
    return block?.kind === 'paragraph' ? block.children.map((run) => (run.kind === 'text' ? run.text : '')).join('') : '';
  };

  it('shows the body as written when the lexer fails, whatever the browser calls the failure', () => {
    for (const error of [new RangeError('Maximum call stack size exceeded'), new Error('too much recursion')]) {
      const lex = vi.spyOn(Lexer.prototype, 'lex').mockImplementation(() => {
        throw error;
      });
      try {
        expect(proseOf('> quoted\n\nbody')).toEqual([{ kind: 'code', text: '> quoted\n\nbody' }]);
      } finally {
        lex.mockRestore();
      }
    }
  });

  it('stops a line of container marks at a depth no author writes, so neither marked nor a component recurses without bound', () => {
    const MAX = 24;
    const oneLine: [string, string][] = [
      ['bullets', '- '.repeat(9_000) + 'x'],
      ['numbers', '1. '.repeat(6_666) + 'x'],
      ['quotes with a space', '> '.repeat(9_000) + 'x'],
      ['quotes with none', '>'.repeat(19_000) + 'x'],
      ['a mix', '> - 1. '.repeat(500) + 'x'],
    ];
    for (const [name, body] of oneLine) {
      const blocks = proseOf(body);
      expect(blocks[0]!.kind, `${name}: drawn, not given up on`).not.toBe('code');
      expect(depth(blocks), name).toBe(MAX);
      expect(innermost(blocks).endsWith('x'), `${name}: the rest is the text of the innermost paragraph`).toBe(true);
    }
    const acrossLines: [string, string][] = [
      ['a quote on each line, one deeper than the last', Array.from({ length: 150 }, (_, i) => `${'>'.repeat(i + 1)} x`).join('\n')],
      ['a list nested by its indent', Array.from({ length: 140 }, (_, i) => `${'  '.repeat(i)}- x`).join('\n')],
    ];
    for (const [name, body] of acrossLines) expect(depth(proseOf(body)), name).toBe(MAX);
  });

  it('leaves a line of bullets that is a rule, and ordinary nesting, as they were', () => {
    expect(proseOf('- '.repeat(10_000))).toEqual([{ kind: 'rule' }]);
    expect(proseOf('* '.repeat(30))).toEqual([{ kind: 'rule' }]);
    expect(depth(proseOf('> - 1. deep'))).toBe(3);
    expect(proseOf('2 > 1 and 1. x and - y')).toEqual([{ kind: 'paragraph', children: [{ kind: 'text', text: '2 > 1 and 1. x and - y' }] }]);
  });

  it('reads only the first 20,000 characters as Markdown and draws the rest as one block of plain text', () => {
    const body = '**bold** para\n\n'.repeat(13_400);
    const end = body.lastIndexOf('\n', 20_000);
    const blocks = proseOf(body);
    const read = body.slice(0, end).split('\n\n').length;
    expect(blocks, 'the paragraphs read, then one block for everything after').toHaveLength(read + 1);
    expect(blocks.filter(hasStrong), 'bold only where the body was read').toHaveLength(read);
    expect(blocks.slice(0, read).every(hasStrong)).toBe(true);
    expect(blocks.at(-1), 'its text is the rest as typed, from its first line to its last').toEqual({ kind: 'plain', text: body.slice(end).replace(/^\n+/, '').trimEnd() });
  });

  it('draws the rest of a long body as one text run, however many lines it has', () => {
    for (const body of ['a\n'.repeat(1_000_000), 'a\n'.repeat(100_000), 'a\r\n'.repeat(100_000), ('word '.repeat(40) + '\n\n').repeat(1_000)]) {
      const blocks = proseOf(body);
      const plain = blocks.filter((block) => block.kind === 'plain');
      expect(plain, `${body.length} characters`).toHaveLength(1);
      expect(blocks.at(-1)).toBe(plain[0]);
      expect(blocks.length, 'the part read is bounded by what 20,000 characters can hold').toBeLessThan(10_001);
      expect(plain[0]!.kind === 'plain' && plain[0].text.includes('\r'), 'a line break is one character').toBe(false);
    }
    expect(proseOf('a'.repeat(19_990) + '\n' + '\n\n   \n\t\n'.repeat(3)).map((block) => block.kind), 'a tail that is only blank lines draws nothing').toEqual(['paragraph']);
  });

  it('cuts at the end of a line, and a body with no line to cut at is cut where the limit falls', () => {
    const [first, second] = proseOf('x'.repeat(30_000)) as [{ kind: 'paragraph'; children: { kind: 'text'; text: string }[] }, { kind: 'plain'; text: string }];
    expect([first.children[0]!.text.length, second.text.length]).toEqual([20_000, 10_000]);
    const [heading, read, rest] = proseOf('# Head\n\n' + 'a line\n'.repeat(5_000)) as [{ kind: string }, { kind: string; children: { kind: string; text?: string }[] }, { kind: 'plain'; text: string }];
    expect(heading.kind).toBe('heading');
    expect(read.children.at(-1), 'the last line read is whole').toEqual({ kind: 'text', text: 'a line' });
    expect(rest.text.startsWith('a line\na line\n'), 'and the next is the first line of the rest, its line breaks kept').toBe(true);
    const linesRead = read.children.filter((run) => run.kind === 'text').length;
    expect(linesRead + rest.text.split('\n').length, 'no line lost or drawn twice').toBe(5_000);
  });

  it('does not read a table whose padded cells would be many, so its lines are ordinary paragraphs', () => {
    const wide = (columns: number, rows: number) => `${'a|'.repeat(columns)}\n${'-|'.repeat(columns)}\n${'a\n'.repeat(rows)}`;
    const cellsOf = (blocks: ReturnType<typeof proseOf>) => blocks.flatMap((b) => (b.kind === 'table' ? [b.head.length * (b.rows.length + 1)] : []));
    const runsOf = (blocks: ReturnType<typeof proseOf>) => blocks.reduce((sum, b) => sum + (b.kind === 'paragraph' ? b.children.length : 0), 0);

    for (const [columns, rows] of [[500, 8_999], [200, 9_000], [50, 9_000], [2_500, 4_999]] as const) {
      const blocks = proseOf(wide(columns, rows));
      expect(blocks.map((b) => b.kind), `${columns} columns by ${rows} rows`).not.toContain('table');
      expect(runsOf(blocks), 'and what it is instead has about a run for a line').toBeLessThan(2 * rows + 10);
    }

    // The cap counts the header row's cells, and the header and the rows read as a table at or under it.
    const rows: [columns: number, rows: number, table: boolean][] = [[3, 100, true], [20, 99, true], [20, 100, false], [1_000, 1, true], [1_001, 1, false], [2_000, 0, true], [2_001, 0, false]];
    for (const [columns, count, table] of rows) {
      const blocks = proseOf(wide(columns, count));
      expect(blocks[0]!.kind, `${columns} columns by ${count} rows`).toBe(table ? 'table' : 'paragraph');
      if (table) expect(blocks[0]!.kind === 'table' && [blocks[0].head.length, blocks[0].rows.length, blocks[0].rows[0]?.length ?? columns]).toEqual([columns, count, columns]);
    }

    // Tables that are each under the cap are held to what 20,000 characters can hold between them.
    const many = ('a|'.repeat(40) + '\n' + '-|'.repeat(40) + '\n' + 'a\n'.repeat(49) + '\n').repeat(80);
    const kept = cellsOf(proseOf(many));
    expect(kept.length, 'some of them are read').toBeGreaterThan(0);
    expect(kept.length, 'and not all of the 77 in the part read').toBeLessThan(77);
    expect(kept.reduce((sum, cells) => sum + cells, 0)).toBeLessThanOrEqual(10_000);
  });

  it('counts the columns of a table from its delimiter row, which no backslash can fool', () => {
    // Marked splits at a pipe unless an odd number of backslashes come before it, so these headers are as wide as the delimiter says.
    const headers: [string, string][] = [
      ['two backslashes before each pipe', '\\\\|'.repeat(3_000)],
      ['four backslashes', ('a' + '\\\\\\\\' + '|').repeat(1_001)],
      ['two, with a space', ' \\\\ |'.repeat(1_500)],
    ];
    for (const [name, header] of headers) {
      const columns = header.split('|').length - 1;
      const body = `${header}\n${'-|'.repeat(columns)}\n${'a\n'.repeat(1_999)}`;
      const blocks = proseOf(body);
      expect(blocks.map((b) => b.kind), name).toEqual(['paragraph']);
    }
    // And a header whose pipes are all escaped is one column, however long, so it is read.
    const escaped = proseOf(`${'a \\| '.repeat(500)}\n|-|\nx\n`);
    expect(escaped[0]!.kind).toBe('table');
  });

  it('takes a table it leaves unread whole, as one paragraph, instead of one paragraph for each line', () => {
    const pipes = ('a|'.repeat(40) + '\n' + '-|'.repeat(40) + '\n' + 'a\n'.repeat(49) + '\n').repeat(5);
    const bodies: [string, string, string[]][] = [
      ['a one-column table of 6,666 rows', '-|\n'.repeat(6_666), ['paragraph']],
      ['a two-column table of 5,000 rows', '-|-\n'.repeat(5_000), ['paragraph']],
      ['a header and a delimiter of different widths, repeated', '-|-|-\n-|-\n'.repeat(1_900), ['paragraph']],
      ['the same in a quote', '> -|\n'.repeat(4_000), ['quote']],
      ['five tables that spend the body, then lines that look like one', pipes + '-|\n'.repeat(6_000), ['table', 'table', 'table', 'table', 'table', 'paragraph']],
    ];
    for (const [name, body, kinds] of bodies) expect(proseOf(body.slice(0, 20_000)).map((b) => b.kind), name).toEqual(kinds);
    const [paragraph] = proseOf('-|\n'.repeat(6_666)) as [{ kind: 'paragraph'; children: { kind: string }[] }];
    expect(paragraph.children.filter((run) => run.kind === 'text'), 'every line is still there, as a line').toHaveLength(6_666);
    expect(paragraph.children.filter((run) => run.kind === 'break')).toHaveLength(6_665);
  });

  it('reads an ordinary table as marked builds it, and leaves what marked does not read as a table', () => {
    const reference = new Marked({ gfm: true, breaks: true });
    const cellText = (runs: ReturnType<typeof proseOf> extends (infer B)[] ? (B extends { kind: 'table'; head: (infer C)[] } ? C : never) : never): string =>
      runs.map((run) => (run.kind === 'text' ? run.text : run.kind === 'code' ? '`' + run.text + '`' : '')).join('');
    const tables = [
      '| a | b |\n|---|---|\n| 1 | 2 |',
      'a | b\n--|--\n1 | 2',
      '| a | b | c |\n|:--|:-:|--:|\n| 1 | 2 | 3 |',
      '| a \\| b | c |\n|---|---|\n| 1 | 2 |',
      '| `x\\|y` | b |\n|-|-|\n| `x\\|y` | 2 |\n| z \\| w | 3 |',
      '| a | b |\n|-|-|\n| 1 |\n| 1 | 2 | 3 |',
      '| | b |\n|-|-|\n| 1 | 2 |',
      '| a | |\n|-|-|\n| 1 | 2 |',
      '| | |\n|-|-|\n| 1 | 2 |',
      '   | a | b |\n|---|---|\n| 1 | 2 |',
      '| a |\n|---|\n| 1 |',
      'a|\n-|\n1|',
      '|a|\n|-|\n|1|\n|2|\n\nafter',
      '| a | b |\n| --- | --- |\n| 1 | 2 |\n\n- next',
      'a \\\\| b | c\n--|--\n1 | 2',
      'a \\\\\\| b | c\n--|--\n1 | 2',
      'a \\\\\\\\| b | c | d\n--|--|--\n1 | 2 | 3',
      '| a | b | c |\n|-|-|\n| 1 | 2 |',
      '| a |\n|-|-|\n| 1 | 2 |',
      '| a | b |\n|-|-|-|\n| 1 | 2 |',
      '| a | b |\n|---|---|',
      'a\n---\nb',
      'a\n:\nb',
      'a\n-\nb\n-',
      'a | b\n---\n1 | 2',
    ];
    for (const markdown of tables) {
      const expected = reference.lexer(markdown).find((token): token is Tokens.Table => token.type === 'table');
      const table = proseOf(markdown).find((block) => block.kind === 'table');
      expect(table !== undefined, JSON.stringify(markdown)).toBe(expected !== undefined);
      if (!expected || table?.kind !== 'table') continue;
      expect(table.align, JSON.stringify(markdown)).toEqual(expected.align);
      // A backslash in a cell is raw in marked's `text` and read in ours, so those cells are compared by position only.
      const same = (ours: (typeof table.head)[number][], theirs: { text: string }[]) =>
        ours.map((cell, i) => (theirs[i]!.text.includes('\\') ? '' : cellText(cell))).join('|') === theirs.map((cell) => (cell.text.includes('\\') ? '' : cell.text)).join('|') && ours.length === theirs.length;
      expect(same(table.head, expected.header), JSON.stringify(markdown)).toBe(true);
      expect(table.rows.length, JSON.stringify(markdown)).toBe(expected.rows.length);
      table.rows.forEach((row, i) => expect(same(row, expected.rows[i]!), JSON.stringify(markdown)).toBe(true));
    }
  });

  it('keeps a paragraph that would take seconds as the text it is, with its line breaks', () => {
    const body = '*a '.repeat(700) + '\n' + '*a '.repeat(700);
    const [paragraph] = proseOf(body);
    expect(paragraph!.kind === 'paragraph' && paragraph.children.map((run) => run.kind)).toEqual(['text', 'break', 'text']);
    expect(blocksText(proseOf('*a '.repeat(6_666)))).toContain('*a *a *a');
  });

  it('stops reading emphasis once a body has spent what marked may spend on it, and keeps the rest as text', () => {
    const body = Array.from({ length: 15 }, () => 'a **b** c '.repeat(100)).join('\n\n');
    const blocks = proseOf(body);
    const read = blocks.filter(hasStrong).length;
    expect(blocks).toHaveLength(15);
    expect(read, 'some paragraphs were read').toBeGreaterThan(0);
    expect(read, 'and the ones past the budget were not').toBeLessThan(15);
    expect(blocks.slice(0, read).every(hasStrong), 'the budget runs out once, in order').toBe(true);
    for (const block of blocks.slice(read)) expect(block.kind === 'paragraph' && block.children.map((run) => run.kind)).toEqual(['text']);
    expect(blocksText(blocks.slice(read))).toContain('**b**');
  });

  it('still reads emphasis in a long paragraph that closes its marks', () => {
    const body = Array.from({ length: 40 }, (_, i) => `word **bold${i}** and *it${i}* here`).join(' ');
    const [paragraph] = proseOf(body);
    expect(paragraph!.kind === 'paragraph' && paragraph.children.filter((run) => run.kind === 'strong' || run.kind === 'em')).toHaveLength(80);
  });

  it('reads every part of a long ordinary body as Markdown, to its last emphasis, without a stall', () => {
    const copies = Math.floor(20_000 / ORDINARY.length);
    const blocks = proseOf(ORDINARY.repeat(copies));
    const of = (kind: ProseBlock['kind']) => blocks.filter((block) => block.kind === kind);
    expect(blocks.filter((block) => block.kind === 'plain' || block.kind === 'code'), 'nothing is left unread, and the lexer did not fail').toHaveLength(0);
    expect([of('heading').length, of('list').length, of('quote').length, of('table').length]).toEqual([copies, copies, copies, copies]);
    const paragraphs = of('paragraph');
    expect(paragraphs).toHaveLength(copies);
    const runs = ['strong', 'em', 'link', 'code'];
    const flat = paragraphs.filter((block) => block.kind === 'paragraph' && !runs.every((kind) => block.children.some((run) => run.kind === kind)));
    expect(flat, 'every paragraph keeps its emphasis, its link and its code span').toHaveLength(0);
  });
});

describe('the elements a text tile draws', () => {
  // What 20,000 characters can make is about 10,000 elements; this leaves room for the wrapper and the frame.
  const ELEMENTS_MAX = 25_000;

  it('are bounded by the part of the body that is read, however long the body is or what it holds', async () => {
    const table = `${'a|'.repeat(500)}\n${'-|'.repeat(500)}\n${'a\n'.repeat(3_000)}`;
    const bodies: [string, string][] = [
      ['200 KB of one-letter lines', 'a\n'.repeat(100_000)],
      ['a 500-column table over short rows', table],
      ['200 KB of lines', ('word '.repeat(19) + 'end\n').repeat(2_000)],
    ];
    for (const [name, body] of bodies) {
      const el = mount({ spec: textTile(body) });
      await expect.poll(() => parts(el, 'prose').length, { timeout: 20_000 }).toBe(1);
      const region = parts(el, 'prose')[0]!;
      expect(region.querySelectorAll('*').length, name).toBeLessThan(ELEMENTS_MAX);
      expect(region.querySelectorAll('table, td'), `${name}: no padded cells`).toHaveLength(0);
      document.body.innerHTML = '';
    }
  }, 60_000);

  it('hold the rest of a long body in one element with one text node, and let the style show its line breaks', async () => {
    const el = await draw('x'.repeat(19_990) + '\n' + 'a\n'.repeat(100_000));
    const plain = [...parts(el, 'prose')[0]!.querySelectorAll('.plain')];
    expect(plain).toHaveLength(1);
    expect(plain[0]!.childNodes).toHaveLength(1);
    expect(plain[0]!.textContent!.split('\n').length, 'its line breaks are the body\'s').toBeGreaterThan(80_000);
    const css = [...el.shadowRoot!.querySelectorAll('style')].map((style) => style.textContent).join('');
    expect(css).toMatch(/\.plain\b[^{]*\{[^}]*white-space: pre-wrap/);
  }, 30_000);
});

describe('the text region is a tab stop only when it scrolls', () => {
  const live = new Set<{ callback: ResizeObserverCallback; targets: Set<Element> }>();
  const sizes = { scrollHeight: 100, clientHeight: 100 };

  beforeEach(() => {
    class FakeObserver {
      readonly record = { callback: null as unknown as ResizeObserverCallback, targets: new Set<Element>() };
      constructor(callback: ResizeObserverCallback) {
        this.record.callback = callback;
        live.add(this.record);
      }
      observe(target: Element) {
        this.record.targets.add(target);
      }
      unobserve(target: Element) {
        this.record.targets.delete(target);
      }
      disconnect() {
        live.delete(this.record);
      }
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    const mine = (node: Element) => node.getAttribute('part') === 'viewport' && node.parentElement?.parentElement?.getAttribute('part') === 'prose';
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
      return mine(this) ? sizes.scrollHeight : 0;
    });
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return mine(this) ? sizes.clientHeight : 0;
    });
  });

  afterEach(() => {
    live.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('takes the stop when the body is taller than its box and gives it back when it fits', async () => {
    Object.assign(sizes, { scrollHeight: 400, clientHeight: 100 });
    const tall = await draw('long');
    const region = parts(tall, 'prose')[0]!.querySelector<HTMLElement>('[part~="viewport"]')!;
    expect(region.tabIndex, 'taller than its box, a keyboard needs it to scroll').toBe(0);

    Object.assign(sizes, { scrollHeight: 100 });
    for (const o of live) for (const target of o.targets) if (target === region) o.callback([{ target } as ResizeObserverEntry], {} as ResizeObserver);
    expect(region.hasAttribute('tabindex'), 'a body that fits is not one more stop').toBe(false);

    Object.assign(sizes, { scrollHeight: 100, clientHeight: 100 });
    const fits = await draw('short');
    expect(parts(fits, 'prose')[0]!.querySelector('[part~="viewport"]')!.hasAttribute('tabindex')).toBe(false);
  });
});

describe('the text tile in the kit', () => {
  // The tile's own files and the prose it draws a text body with.
  const kitDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/kit');
  const sources = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? sources(join(dir, entry.name)) : /\.(ts|svelte)$/.test(entry.name) ? [join(dir, entry.name)] : []));
  const files = [...sources(join(kitDir, 'tile')), ...sources(join(kitDir, 'prose'))].map((file) => ({ file, code: readFileSync(file, 'utf8') }));

  it('never loads the editor and never writes HTML', () => {
    expect(files.length).toBeGreaterThan(10);
    const offenders = files.filter(({ code }) => /\{@html\b/.test(code) || /\binnerHTML\b|\bouterHTML\b|insertAdjacentHTML|\bDOMParser\b|createContextualFragment/.test(code) || /(?:from|import\()\s*['"](?:[^'"]*\/markdown\.js|@tiptap\/[^'"]*)['"]/.test(code) || /RichEditor/.test(code));
    expect(offenders.map(({ file }) => file)).toEqual([]);
  });

  it('keeps the parser out of every file but the one that reads Markdown', () => {
    const readers = files.filter(({ code }) => /from\s+['"]marked['"]/.test(code)).map(({ file }) => file.slice(kitDir.length + 1));
    expect(readers).toEqual(['prose/prose.ts']);
  });
});
