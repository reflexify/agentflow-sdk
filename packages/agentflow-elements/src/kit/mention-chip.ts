import type { Editor } from '@tiptap/core';
import type { MentionMenuItem, ResolvedMention } from '@reflexify/agentflow-sdk';
import type { KitStrings } from './text.js';

export type MentionMap = Record<string, ResolvedMention> | null | undefined;

export interface SuggestEntry {
  /** A mention to insert, the rest of a group's hits, or an entity the menu did not search. */
  kind: 'item' | 'more' | 'scope';
  group: string;
  title: string;
  item?: MentionMenuItem;
  more?: { count: number; group: string; label: string };
  scope?: { group: string; label: string };
}

/** The `group` an entry that is not a mention asks the source for. */
export const groupAsked = (entry: SuggestEntry): string | null => entry.more?.group ?? entry.scope?.group ?? null;

export interface SuggestState {
  query: string;
  entries: SuggestEntry[];
  loading: boolean;
  rect: (() => DOMRect | null) | null;
  command(entry: SuggestEntry): void;
}

export interface MentionController {
  show(state: SuggestState): void;
  update(state: SuggestState): void;
  hide(): void;
  key(event: KeyboardEvent): boolean;
}

export interface Chip { render(): void }

export interface MentionStorage {
  map: MentionMap;
  strings: Pick<Required<KitStrings>, 'mentionRestricted' | 'mentionRestrictedPerson' | 'mentionDeleted'>;
  inserted: Set<string>;
  views: Set<Chip>;
}

function initial(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : '?';
}

const ICON = 'http://www.w3.org/2000/svg';
function recordIcon(): SVGElement {
  const svg = document.createElementNS(ICON, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('part', 'mention-icon');
  const path = document.createElementNS(ICON, 'path');
  path.setAttribute('d', 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5');
  svg.append(path);
  return svg;
}

/**
 * A chip's reading. A target the response's map does not hold is restricted, whatever label the token stores:
 * only a chip the person inserted in this editor keeps its own label.
 */
export function drawChip(ref: string, label: string, storage: MentionStorage, root: Document = document): HTMLElement {
  const kind = ref.split('/')[0]!;
  const resolved = storage.map?.[ref];
  const own = storage.inserted.has(ref);
  const el = root.createElement('span');
  el.className = 'af-mention';
  el.setAttribute('part', 'mention');
  el.setAttribute('data-mention', ref);
  el.setAttribute('data-kind', kind);
  el.contentEditable = 'false';
  const name = root.createElement('span');
  name.className = 'af-mention-label';

  let state: 'ok' | 'restricted' | 'deleted' = 'ok';
  let text = label;
  let href: string | null = null;
  if (resolved) {
    state = resolved.state;
    if (resolved.state === 'ok') {
      text = resolved.label;
      href = resolved.kind === 'record' ? resolved.href : null;
    } else if (resolved.state === 'deleted') {
      text = kind === 'record' ? '' : label;
    } else text = '';
  } else if (!own) {
    state = 'restricted';
    text = '';
  }

  el.setAttribute('data-state', state);
  if (state === 'restricted') {
    name.textContent = kind === 'user' ? storage.strings.mentionRestrictedPerson : storage.strings.mentionRestricted;
    el.append(name);
    return el;
  }
  if (state === 'deleted' && text === '') name.textContent = storage.strings.mentionDeleted;
  else name.textContent = text;

  if (kind === 'user') {
    const avatar = root.createElement('span');
    avatar.className = 'af-avatar af-mention-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initial(text);
    el.append(avatar, name);
    return el;
  }
  if (kind === 'record') el.append(recordIcon());
  if (href && state === 'ok') {
    const link = root.createElement('a');
    link.className = 'af-mention-link';
    link.setAttribute('href', href);
    link.append(name);
    el.append(link);
  } else el.append(name);
  return el;
}

export const storageOf = (editor: Editor) => (editor.storage as unknown as { mention: MentionStorage }).mention;

/** Points every drawn chip at a new map, and at new strings. */
export function setMentionContext(editor: Editor, ctx: { map: MentionMap; strings: MentionStorage['strings'] }): void {
  const storage = storageOf(editor);
  if (!storage) return;
  storage.map = ctx.map;
  storage.strings = ctx.strings;
  for (const view of storage.views) view.render();
}
