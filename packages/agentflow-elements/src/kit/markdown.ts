import { Editor, Extension, parseIndentedBlocks, type AnyExtension, type Extensions, type MarkdownLexerConfiguration, type MarkdownToken, type Node } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Markdown } from '@tiptap/markdown';
import { Fragment } from '@tiptap/pm/model';
import { Plugin, type EditorState, type Transaction } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { createMention, type MentionOptions } from './mention.js';

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

// Tiptap's task list reads only an item's first line as its text: a line after a hard break became a
// paragraph of its own, or left the list, and the break a literal backslash. A line ending in a break is
// joined to the next with a stand-in for the newline, unless that line opens a block, so the item's
// pattern sees one line. The stand-in keeps every offset, so the raw text maps back character for character.
const TASK_ITEM = /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/;
const ENDS_IN_BREAK = /(?:^|[^\\])(?:\\\\)*\\$| {2,}$/;
const OPENS_BLOCK = /^\s*(?:$|[-+*](?:\s|$)|\d{1,9}[.)](?:\s|$)|#{1,6}(?:\s|$)|>|`{3}|~{3}|(?:[-*_][ \t]*){3,}$)/;
const JOINED = '\uE000';

function joinBreaks(src: string): string {
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (!TASK_ITEM.test(lines[i]!)) continue;
    while (i + 1 < lines.length && ENDS_IN_BREAK.test(lines[i]!) && !OPENS_BLOCK.test(lines[i + 1]!)) {
      lines.splice(i, 2, `${lines[i]}${JOINED}${lines[i + 1]}`);
    }
  }
  return lines.join('\n');
}

const unjoin = (text: string): string => text.replaceAll(JOINED, '\n');

function tokenizeTaskList(src: string, lexer: MarkdownLexerConfiguration): MarkdownToken | undefined {
  const config = {
    itemPattern: TASK_ITEM,
    extractItemData: (match: RegExpMatchArray) => ({
      indentLevel: match[1]!.length,
      mainContent: match[4]!.replace(new RegExp(`${JOINED}[ \\t]*`, 'g'), '\n'),
      checked: match[3]!.toLowerCase() === 'x',
    }),
    createToken: (data: { mainContent: string; indentLevel: number; checked: boolean }, nestedTokens?: MarkdownToken[]) => ({
      type: 'taskItem', raw: '', mainContent: data.mainContent, indentLevel: data.indentLevel, checked: data.checked,
      text: data.mainContent, tokens: lexer.inlineTokens(data.mainContent), nestedTokens,
    }),
    customNestedParser: (content: string) => nested(unjoin(content)),
  };
  const list = (text: string) => {
    const result = parseIndentedBlocks(joinBreaks(text), config, lexer);
    return result ? { type: 'taskList', raw: unjoin(result.raw), items: result.items } : undefined;
  };
  const nested = (content: string): MarkdownToken[] => {
    const token = list(content);
    if (!token) return lexer.blockTokens(content);
    const rest = content.slice(token.raw.length);
    return rest.trim() ? [token, ...lexer.blockTokens(rest)] : [token];
  };
  return list(src);
}

const taskListTokenizer = TaskList.config.markdownTokenizer!;

// Text that already holds the stand-in is read as Tiptap reads it, so no character of its own is lost.
const MarkdownTaskList = TaskList.extend({
  markdownTokenizer: {
    ...taskListTokenizer,
    tokenize: (src, tokens, lexer) => (src.includes(JOINED) ? taskListTokenizer.tokenize(src, tokens, lexer) : tokenizeTaskList(src, lexer)),
  },
});

function joinBlocks(state: EditorState): Transaction | null {
  if (state.doc.childCount <= 1) return null;
  const paragraph = state.schema.nodes.paragraph!;
  let line = Fragment.empty;
  state.doc.forEach((block, _offset, index) => {
    if (index > 0 && line.size > 0 && block.content.size > 0) line = line.addToEnd(state.schema.text(' '));
    line = line.append(block.content);
  });
  return state.tr.replaceWith(0, state.doc.content.size, paragraph.create(null, line));
}

// One line. Enter does nothing; a value or paste of several blocks is joined into one line with spaces.
const SingleLine = Extension.create({
  name: 'singleLine',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: { handleKeyDown: (_view, event) => event.key === 'Enter' },
        appendTransaction: (_trs, _old, state) => joinBlocks(state),
      }),
    ];
  },
});

export { exitSuggestion } from '@tiptap/suggestion';
export { flatten } from './mention.js';

const NO_SOURCE: MentionOptions = {
  source: () => null,
  controller: { show() {}, update() {}, hide() {}, key: () => false },
  strings: () => ({ mentionRestricted: '', mentionRestrictedPerson: '', mentionDeleted: '' }),
};

export function markdownExtensions(opts: { mention?: MentionOptions; singleLine?: boolean } = {}): Extensions {
  const mention = createMention(opts.mention ?? NO_SOURCE);
  if (opts.singleLine) {
    return [
      Kit.configure({
        trailingNode: false, link: { openOnClick: false, autolink: true },
        heading: false, bulletList: false, orderedList: false, listItem: false, listKeymap: false, blockquote: false,
        codeBlock: false, horizontalRule: false, hardBreak: false,
      } as never),
      mention,
      SingleLine,
      Markdown,
    ];
  }
  return [
    Kit.configure({ trailingNode: false, link: { openOnClick: false, autolink: true } }),
    mention,
    MarkdownTable.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    MarkdownTaskList,
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

export function createMarkdownEditor(opts: {
  element: HTMLElement; content: string; editable: boolean; onUpdate(): void; onBlur(): void; onFocus(): void;
  mention?: MentionOptions; singleLine?: boolean;
}): Editor {
  // injectCSS would add Tiptap's stylesheet to the host page's <head>, which a shadow root never sees.
  const editor = new Editor({
    element: opts.element, extensions: markdownExtensions({ mention: opts.mention, singleLine: opts.singleLine }), content: opts.content, contentType: 'markdown', editable: opts.editable, injectCSS: false,
    onUpdate: opts.onUpdate, onBlur: opts.onBlur, onFocus: opts.onFocus,
  });
  const joined = opts.singleLine ? joinBlocks(editor.state) : null;
  if (joined) editor.view.dispatch(joined.setMeta('addToHistory', false));
  return editor;
}
