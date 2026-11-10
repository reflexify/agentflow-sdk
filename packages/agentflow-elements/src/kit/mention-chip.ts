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

export function initial(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : '?';
}

/** The outline of a record's icon, drawn at 24 by 24 with a stroke. */
export const RECORD_ICON_PATH = 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5';

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
  path.setAttribute('d', RECORD_ICON_PATH);
  svg.append(path);
  return svg;
}

export type ChipStrings = MentionStorage['strings'];

/** What a chip shows. `unresolved` is a target the map does not hold, drawn with the token's own label in the muted look. */
export interface ChipReading { state: 'ok' | 'restricted' | 'deleted' | 'unresolved'; text: string; href: string | null }

/**
 * A chip's reading from what the server resolved for this viewer. `missing` is how a target the map does not hold reads:
 * restricted, its own label (the editor's chip the person inserted), or unresolved.
 */
export function readChip(ref: string, label: string, resolved: ResolvedMention | undefined, missing: 'restricted' | 'own' | 'unresolved'): ChipReading {
  const kind = ref.split('/')[0]!;
  if (resolved) {
    if (resolved.state === 'ok') return { state: 'ok', text: resolved.label, href: resolved.kind === 'record' ? resolved.href : null };
    if (resolved.state === 'deleted') return { state: 'deleted', text: kind === 'record' ? '' : label, href: null };
    return { state: 'restricted', text: '', href: null };
  }
  if (missing === 'own') return { state: 'ok', text: label, href: null };
  return { state: missing, text: missing === 'unresolved' ? label : '', href: null };
}

/** The words a chip shows for a reading: the restricted and deleted wording from `strings`, else the reading's own text. */
function wording(kind: string, reading: ChipReading, strings: ChipStrings): string {
  if (reading.state === 'restricted') return kind === 'user' ? strings.mentionRestrictedPerson : strings.mentionRestricted;
  if (reading.state === 'deleted' && reading.text === '') return strings.mentionDeleted;
  return reading.text;
}

/** What a mention chip says and links to, for one reader, with its wording applied: what the list tile draws a token as. */
export interface MentionView {
  kind: string;
  state: 'ok' | 'restricted' | 'deleted';
  label: string;
  href: string | null;
}

/**
 * A token's reading, worded. A target the response's map does not hold is restricted, whatever label the token stores:
 * only a chip the person inserted in this editor (`inserted`) keeps its own label.
 */
export function resolveMention(ref: string, label: string, map: MentionMap, strings: ChipStrings, inserted = false): MentionView {
  const kind = ref.split('/')[0]!;
  const reading = readChip(ref, label, map?.[ref], inserted ? 'own' : 'restricted');
  const state = reading.state === 'unresolved' ? 'restricted' : reading.state;
  return { kind, state, label: wording(kind, reading, strings), href: reading.href };
}

/** The chip's markup for a reading: the kind's avatar or icon and the label, the restricted and deleted wording from `strings`. */
export function chipElement(ref: string, reading: ChipReading, strings: ChipStrings, root: Document = document): HTMLElement {
  const kind = ref.split('/')[0]!;
  const { state, text, href } = reading;
  const el = root.createElement('span');
  el.className = 'af-mention';
  el.setAttribute('part', 'mention');
  el.setAttribute('data-mention', ref);
  el.setAttribute('data-kind', kind);
  el.setAttribute('data-state', state);
  const name = root.createElement('span');
  name.className = 'af-mention-label';
  name.textContent = wording(kind, reading, strings);

  if (state === 'restricted') {
    el.append(name);
    return el;
  }
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

/**
 * The editor's chip. A target the response's map does not hold is restricted, whatever label the token stores:
 * only a chip the person inserted in this editor keeps its own label.
 */
export function drawChip(ref: string, label: string, storage: MentionStorage, root: Document = document): HTMLElement {
  const reading = readChip(ref, label, storage.map?.[ref], storage.inserted.has(ref) ? 'own' : 'restricted');
  const el = chipElement(ref, reading, storage.strings, root);
  el.contentEditable = 'false';
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
