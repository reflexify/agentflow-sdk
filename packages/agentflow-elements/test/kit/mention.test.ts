import { describe, expect, it } from 'vitest';
import { escapeLabel, scanToken, tokenFor } from '../../src/kit/mention.js';
import { load, nodesOf } from './fixtures/mention-editor.js';

describe('mention tokens in the kit editor', () => {
  it('a bracketed label round-trips through markdown', () => {
    for (const label of ['x](mention:y', 'ends with \\', ']]]', 'has @[ inside', 'Đề xuất [mua] sắm']) {
      const ref = 'entity/0190f5a0-0000-7000-8000-000000000001';
      const editor = load(`hi ${tokenFor(ref, label)} there`);
      try {
        expect(nodesOf(editor)).toEqual([{ ref, label }]);
        const out = editor.getMarkdown().trimEnd();
        expect(out).toBe(`hi ${tokenFor(ref, label)} there`);
        const again = load(out);
        try {
          expect(nodesOf(again)).toEqual([{ ref, label }]);
        } finally {
          again.destroy();
        }
      } finally {
        editor.destroy();
      }
    }
  });

  it('escapes the three characters the grammar reserves and flattens a line break', () => {
    expect(escapeLabel('a\\b[c]d')).toBe('a\\\\b\\[c\\]d');
    expect(escapeLabel('two\nlines')).toBe('two lines');
  });

  it('scans only a token at the start of the text', () => {
    const id = '0190F5A0-0000-7000-8000-00000000000A';
    expect(scanToken(`@[a](mention:user/${id}) x`)).toEqual({ raw: `@[a](mention:user/${id})`, ref: `user/${id.toLowerCase()}`, label: 'a' });
    expect(scanToken(`x @[a](mention:user/${id})`)).toBeNull();
  });
});
