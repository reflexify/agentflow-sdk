import { Editor } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import fixture from '../../../../../shared/fixtures/markdown-cases.json';
import { markdownExtensions, roundTrip } from '../../src/kit/markdown.js';

describe('the kit editor returns the shared Markdown cases unchanged', () => {
  for (const c of fixture.cases) it(c.name, () => expect(roundTrip(c.markdown)).toBe(c.markdown));

  it('keeps the U+200B AgentFlow writes after a paragraph that ends in a link', () => {
    const fromPlate = `${fixture.cases.find((c) => c.name === 'link')!.markdown}\u200B`;
    expect(roundTrip(fromPlate)).toBe(fromPlate);
  });
});

function save(html: string): string {
  const editor = new Editor({ extensions: markdownExtensions(), content: html });
  try {
    return editor.getMarkdown().trimEnd();
  } finally {
    editor.destroy();
  }
}

describe('the kit editor saves hard breaks as Markdown that reloads as the same text', () => {
  const cases: [string, string, string][] = [
    ['a break that ends a paragraph', '<p>a<br></p>', 'a'],
    ['a break that ends a paragraph before another', '<p>a<br></p><p>b</p>', 'a\n\nb'],
    ['a break that ends a bold run', '<p><strong>a<br></strong></p>', '**a**'],
    ['a break that ends a list item', '<ul><li><p>a<br></p></li></ul>', '- a'],
    ['a break inside a heading', '<h2>a<br>b</h2>', '## a b'],
    ['a break that ends a heading', '<h2>a<br></h2>', '## a'],
    ['a dash line after a break', '<p>a<br>--</p>', 'a\\\n\\--'],
    ['an equals line after a break', '<p>a<br>==</p>', 'a\\\n\\=='],
    ['a break inside a table cell', '<table><tbody><tr><th><p>aaa</p></th><th><p>bbb</p></th></tr><tr><td><p>x<br>y</p></td><td><p>2</p></td></tr></tbody></table>', '| aaa    | bbb |\n| ------ | --- |\n| x<br>y | 2   |'],
  ];
  for (const [name, html, markdown] of cases) {
    it(name, () => {
      expect(save(html)).toBe(markdown);
      expect(roundTrip(markdown)).toBe(markdown);
    });
  }
});
