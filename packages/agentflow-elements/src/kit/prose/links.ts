import { getContext, setContext } from 'svelte';
import type { Attachment } from 'svelte/attachments';

/**
 * What a view around the prose does with its links and mentions. The text tile gives none: its links open as plain
 * anchors and a mention reads as `@label`. The Markdown view asks the page before a link opens and draws mention chips.
 */
export interface ProseLinks {
  /** A link's or a chip's activation, before the browser acts on it. */
  activate(href: string, event: MouseEvent): void;
  /** Draws the chip for a mention into the element it is attached to. */
  chip(ref: string, label: string): Attachment<HTMLElement>;
}

const KEY = Symbol('prose-links');

export const provideProseLinks = (links: ProseLinks): ProseLinks => setContext(KEY, links);
export const proseLinks = (): ProseLinks | undefined => getContext<ProseLinks | undefined>(KEY);
