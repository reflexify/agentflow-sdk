import { mergeAttributes, type Editor, type MarkdownToken } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';
import type { MentionMenuSource } from '@reflexify/agentflow-sdk';
import { drawChip, storageOf, type Chip, type MentionController, type MentionStorage, type SuggestEntry, type SuggestState } from './mention-chip.js';

const KINDS = ['record', 'dashboard', 'entity', 'user'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ScannedMention { raw: string; ref: string; label: string }

export function escapeLabel(label: string): string {
  let out = '';
  for (const c of label) {
    if (c === '\\' || c === '[' || c === ']') out += `\\${c}`;
    else if (c === '\n' || c === '\r') out += ' ';
    else out += c;
  }
  return out;
}

export const tokenFor = (ref: string, label: string): string => `@[${escapeLabel(label)}](mention:${ref})`;

function normalTarget(raw: string): string | null {
  const [kind = '', ...ids] = raw.split('/');
  if (!(KINDS as readonly string[]).includes(kind)) return null;
  if (ids.length !== (kind === 'record' ? 2 : 1)) return null;
  if (!ids.every((id) => UUID.test(id))) return null;
  return [kind, ...ids.map((id) => id.toLowerCase())].join('/');
}

// Stops at an unescaped `[` or a line break so a stray `@[` cannot swallow a later token.
function readLabel(s: string): { label: string; end: number } | null {
  let label = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === '\\') {
      i += 1;
      if (i >= s.length) return null;
      const next = s[i]!;
      if (next === '\n' || next === '\r') return null;
      label += next;
    } else if (c === ']') return { label, end: i + 1 };
    else if (c === '[' || c === '\n' || c === '\r') return null;
    else label += c;
  }
  return null;
}

/** The token at the very start of `src`, or null when what is there is not a well-formed one. */
export function scanToken(src: string): ScannedMention | null {
  if (!src.startsWith('@[')) return null;
  const read = readLabel(src.slice(2));
  if (!read) return null;
  const afterLabel = 2 + read.end;
  if (!src.startsWith('(mention:', afterLabel)) return null;
  const targetAt = afterLabel + '(mention:'.length;
  const close = src.indexOf(')', targetAt);
  if (close < 0) return null;
  const ref = normalTarget(src.slice(targetAt, close));
  if (!ref) return null;
  return { raw: src.slice(0, close + 1), ref, label: read.label };
}

export interface MentionOptions {
  source(): MentionMenuSource | null;
  controller: MentionController;
  strings(): MentionStorage['strings'];
}

const pluginKey = new PluginKey('afMention');

export function flatten(menu: Awaited<ReturnType<MentionMenuSource>>): SuggestEntry[] {
  const out: SuggestEntry[] = [];
  for (const g of menu.groups) {
    for (const item of g.items) out.push({ kind: 'item', group: g.key, title: g.title, item });
    if (g.more) out.push({ kind: 'more', group: g.key, title: g.title, more: g.more });
  }
  for (const scope of menu.unsearched?.scopes ?? []) {
    out.push({ kind: 'scope', group: UNSEARCHED, title: menu.unsearched!.title, scope });
  }
  return out;
}

/** The section of the entities the menu did not search. */
export const UNSEARCHED = 'unsearched';

interface SuggestProps { query: string; items: SuggestEntry[]; clientRect?: (() => DOMRect | null) | null; command: (e: SuggestEntry) => void }

const stateOf = (p: SuggestProps): SuggestState => ({ query: p.query, entries: p.items, loading: false, rect: p.clientRect ?? null, command: p.command });

export function createMention(opts: MentionOptions) {
  let run = 0;
  const node = Mention.extend({
    addStorage() {
      return { map: null, strings: opts.strings(), inserted: new Set<string>(), views: new Set<Chip>() } satisfies MentionStorage;
    },

    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (el: HTMLElement) => el.getAttribute('data-mention'),
          renderHTML: (attrs: Record<string, unknown>) => (attrs.id ? { 'data-mention': attrs.id as string } : {}),
        },
        label: {
          default: '',
          parseHTML: (el: HTMLElement) => el.getAttribute('data-label') ?? '',
          renderHTML: (attrs: Record<string, unknown>) => ({ 'data-label': (attrs.label as string) ?? '' }),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'span[data-mention]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      return ['span', mergeAttributes({ class: 'af-mention' }, HTMLAttributes), `@${(node.attrs.label as string) ?? ''}`];
    },

    renderText({ node }) {
      return `@${(node.attrs.label as string) ?? ''}`;
    },

    addNodeView() {
      return ({ node: initialNode }) => {
        let current = initialNode;
        const storage = this.storage as MentionStorage;
        const holder = document.createElement('span');
        holder.className = 'af-mention-holder';
        const chip: Chip = {
          render() {
            holder.replaceChildren(drawChip(current.attrs.id as string, (current.attrs.label as string) ?? '', storage));
          },
        };
        chip.render();
        storage.views.add(chip);
        return {
          dom: holder,
          update(next) {
            if (next.type !== current.type) return false;
            current = next;
            chip.render();
            return true;
          },
          destroy() {
            storage.views.delete(chip);
          },
        };
      };
    },

    markdownTokenizer: {
      name: 'mention',
      level: 'inline',
      start: (src: string) => src.indexOf('@['),
      tokenize(src: string) {
        const found = scanToken(src);
        if (!found) return undefined;
        return { type: 'mention', raw: found.raw, ref: found.ref, label: found.label } as MarkdownToken;
      },
    },

    parseMarkdown(token) {
      const t = token as MarkdownToken & { ref: string; label: string };
      return { type: 'mention', attrs: { id: t.ref, label: t.label } };
    },

    renderMarkdown(node) {
      return tokenFor(String(node.attrs?.id ?? ''), String(node.attrs?.label ?? ''));
    },
  });

  return node.configure({
    deleteTriggerWithBackspace: false,
    suggestion: {
      char: '@',
      pluginKey,
      allowSpaces: true,
      allow: ({ editor }: { editor: Editor }) => editor.isEditable && opts.source() !== null,
      items: async ({ query }: { query: string; editor: Editor }) => {
        const source = opts.source();
        if (!source) return [];
        const mine = ++run;
        const menu = await source(query);
        return mine === run ? flatten(menu) : [];
      },
      command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: unknown }) => {
        const item = (props as SuggestEntry).item;
        if (!item) return;
        storageOf(editor).inserted.add(item.ref);
        editor
          .chain()
          .focus()
          .insertContentAt(range, [{ type: 'mention', attrs: { id: item.ref, label: item.label } }, { type: 'text', text: ' ' }])
          .run();
      },
      render: () => ({
        onStart: (props: unknown) => opts.controller.show(stateOf(props as SuggestProps)),
        onUpdate: (props: unknown) => opts.controller.update(stateOf(props as SuggestProps)),
        onKeyDown: ({ event }: { event: KeyboardEvent }) => opts.controller.key(event),
        onExit: () => opts.controller.hide(),
      }),
    },
  });
}

