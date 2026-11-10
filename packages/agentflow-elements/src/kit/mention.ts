import { mergeAttributes, type Editor, type MarkdownToken } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';
import type { MentionMenuSource } from '@reflexify/agentflow-sdk';
import { drawChip, storageOf, type Chip, type MentionController, type MentionStorage, type SuggestEntry, type SuggestState } from './mention-chip.js';
import { scanToken, tokenFor } from './mention-token.js';

export { resolveMention, type MentionView } from './mention-chip.js';
export { escapeLabel, scanToken, tokenFor, type ScannedMention } from './mention-token.js';

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

