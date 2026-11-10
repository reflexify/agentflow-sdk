import { Editor } from '@tiptap/core';
import { markdownExtensions } from '../../../src/kit/markdown.js';

export function load(markdown: string): Editor {
  return new Editor({ extensions: markdownExtensions(), content: markdown, contentType: 'markdown' });
}

export function nodesOf(editor: Editor): { ref: string; label: string }[] {
  const found: { ref: string; label: string }[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'mention') found.push({ ref: node.attrs.id as string, label: node.attrs.label as string });
  });
  return found;
}

export const firstOfEach = (list: { ref: string; label: string }[]) => list.filter((m, i) => list.findIndex((o) => o.ref === m.ref) === i);
