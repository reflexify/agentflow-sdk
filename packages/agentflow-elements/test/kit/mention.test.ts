import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Editor } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { markdownExtensions } from '../../src/kit/markdown.js';
import { escapeLabel, scanToken, tokenFor } from '../../src/kit/mention.js';

interface Case {
  name: string;
  content: string;
  malformed?: boolean;
  mentions?: { ref: string; label: string }[];
}

const FIXTURE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../backend/crates/agentflow-api/tests/fixtures/mention_tokens.json',
);
// Malformed cases the editor still reads one token from: the bad token is only the one after it.
const ONE_TOKEN_SURVIVES = new Set(['malformed: a bad token after a good one']);

const { cases } = JSON.parse(readFileSync(FIXTURE, 'utf8')) as { cases: Case[] };

function load(markdown: string): Editor {
  return new Editor({ extensions: markdownExtensions(), content: markdown, contentType: 'markdown' });
}

function nodesOf(editor: Editor): { ref: string; label: string }[] {
  const found: { ref: string; label: string }[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'mention') found.push({ ref: node.attrs.id as string, label: node.attrs.label as string });
  });
  return found;
}

const firstOfEach = (list: { ref: string; label: string }[]) => list.filter((m, i) => list.findIndex((o) => o.ref === m.ref) === i);

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

  describe('every fixture case parses as the server does', () => {
    for (const c of cases) {
      it(c.name, () => {
        const editor = load(c.content);
        try {
          const found = nodesOf(editor);
          if (c.malformed) {
            expect(found).toHaveLength(ONE_TOKEN_SURVIVES.has(c.name) ? 1 : 0);
            return;
          }
          expect(firstOfEach(found)).toEqual(c.mentions ?? []);
          const again = load(editor.getMarkdown().trimEnd());
          try {
            expect(nodesOf(again)).toEqual(found);
          } finally {
            again.destroy();
          }
        } finally {
          editor.destroy();
        }
      });
    }
  });

  it('scans only a token at the start of the text', () => {
    const id = '0190F5A0-0000-7000-8000-00000000000A';
    expect(scanToken(`@[a](mention:user/${id}) x`)).toEqual({ raw: `@[a](mention:user/${id})`, ref: `user/${id.toLowerCase()}`, label: 'a' });
    expect(scanToken(`x @[a](mention:user/${id})`)).toBeNull();
  });
});
