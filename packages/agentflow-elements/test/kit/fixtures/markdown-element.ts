import { expect } from 'vitest';
import type { ResolvedMention } from '../../../src/kit/index.js';

export type MarkdownElement = HTMLElement & { value: string | null; mentions: Record<string, ResolvedMention> | null; schemes: string[] | null; locale: string | null };

export const content = (el: Element) => el.shadowRoot!.querySelector<HTMLElement>('[part~="content"]');

/** An `af-markdown` with these properties, in a module's shadow root, once its view has landed. */
export async function draw(props: Partial<MarkdownElement>) {
  document.body.innerHTML = '';
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-markdown') as MarkdownElement;
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  await expect.poll(() => content(el)?.getAttribute('aria-busy') ?? 'missing', { timeout: 5000 }).toBe('missing');
  return { el, root, body: content(el)! };
}
