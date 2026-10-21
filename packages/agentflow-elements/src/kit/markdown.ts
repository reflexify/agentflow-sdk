import { Editor, type AnyExtension, type Extensions, type Node } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';

// Tiptap escapes inline syntax in text but not a line that would open a block, so a paragraph reading
// "1. x" came back as an ordered list on the next load. These are the escapes remark writes too. Any
// dash-only or equals-only line is escaped, since after a hard break it would be a setext underline.
const BLOCK_OPENERS: readonly [RegExp, string][] = [
  [/^(\d{1,9})([.)])(?=[ \t]|$)/gm, '$1\\$2'],
  [/^([-+]|#{1,6})(?=[ \t]|$)/gm, '\\$1'],
  [/^-(?=(?:[ \t]*-)+[ \t]*$)/gm, '\\-'],
  [/^=(?==*[ \t]*$)/gm, '\\='],
];

function escapeBlockOpeners(markdown: string): string {
  return BLOCK_OPENERS.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), markdown);
}

// AgentFlow's editor writes a hard break as a backslash, so both editors spell it one way. Two places
// need another form: a table cell turns the line break into <br>, which a backslash would escape, and a
// heading is one line, so a break there would end it. Rendering is synchronous, so the form is a variable.
const BACKSLASH_BREAK = '\\\n';
let hardBreak = BACKSLASH_BREAK;

function breaksAs(form: string, render: () => string): string {
  const outer = hardBreak;
  hardBreak = form;
  try {
    return render();
  } finally {
    hardBreak = outer;
  }
}

const Kit = StarterKit.extend({
  addExtensions() {
    return (this.parent?.() ?? []).map((ext: AnyExtension) => {
      if (ext.name === 'paragraph') {
        return (ext as Node).extend({
          renderMarkdown(node, helpers, ctx) {
            // At the end of a block CommonMark reads a trailing backslash as a literal one.
            const out = (this.parent?.(node, helpers, ctx) ?? '').replace(/(?:\\\n|  \n)+$/, '');
            return escapeBlockOpeners(out);
          },
        });
      }
      if (ext.name === 'heading') {
        return (ext as Node).extend({
          renderMarkdown(node, helpers, ctx) {
            return breaksAs(' ', () => this.parent?.(node, helpers, ctx) ?? '').replace(/[ \t]+$/, '');
          },
        });
      }
      if (ext.name === 'hardBreak') return (ext as Node).extend({ renderMarkdown: () => hardBreak });
      return ext;
    });
  },
});

// Tiptap wraps a table in its own line breaks on top of the block separator, so a table between
// paragraphs gained a blank line on each side at every save.
const MarkdownTable = Table.extend({
  renderMarkdown(node, helpers, ctx) {
    return breaksAs('  \n', () => this.parent?.(node, helpers, ctx) ?? '').replace(/^\n+|\n+$/g, '');
  },
});

export function markdownExtensions(): Extensions {
  return [
    Kit.configure({ trailingNode: false, link: { openOnClick: false, autolink: true } }),
    MarkdownTable.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown,
  ];
}

export function roundTrip(markdown: string): string {
  const editor = new Editor({ extensions: markdownExtensions(), content: markdown, contentType: 'markdown' });
  try {
    return editor.getMarkdown().trimEnd();
  } finally {
    editor.destroy();
  }
}

export function createMarkdownEditor(opts: { element: HTMLElement; content: string; editable: boolean; onUpdate(): void; onBlur(): void; onFocus(): void }): Editor {
  // injectCSS would add Tiptap's stylesheet to the host page's <head>, which a shadow root never sees.
  return new Editor({
    element: opts.element, extensions: markdownExtensions(), content: opts.content, contentType: 'markdown', editable: opts.editable, injectCSS: false,
    onUpdate: opts.onUpdate, onBlur: opts.onBlur, onFocus: opts.onFocus,
  });
}
