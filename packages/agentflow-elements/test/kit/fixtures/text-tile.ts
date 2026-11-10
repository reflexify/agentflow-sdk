import { expect } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { ComputeTile } from '@reflexify/agentflow-sdk';
import type { AfTileResult, AfTileSpec } from '../../../src/kit/index.js';

export interface TileElement extends HTMLElement {
  locale: string | null;
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
}

export const parts = (node: Element, name: string) => [...node.shadowRoot!.querySelectorAll<HTMLElement>(`[part~="${name}"]`)];

export function mount(props: Partial<TileElement>) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  return el;
}

export const textTile = (body: string, label?: string): ComputeTile => ({ kind: 'text', body, ...(label ? { label } : {}) });

/** A text tile with this body, drawn. */
export async function draw(body: string, label?: string) {
  const el = mount({ spec: textTile(body, label) });
  await expect.poll(() => parts(el, 'prose').length, { timeout: 5000 }).toBe(1);
  return el;
}

const ATTRIBUTES = ['href', 'start', 'align'] as const;

// Ark's environment provider, around the kit's scroller, leaves a space after it, which draws nothing beside a block.
function blankAfterScroller(node: Node): boolean {
  if (node.textContent?.trim()) return false;
  let before = node.previousSibling;
  while (before && before.nodeType !== Node.ELEMENT_NODE) before = before.previousSibling;
  return (before as HTMLElement | null)?.dataset.scope === 'scroll-area';
}

/** A node as the elements it is made of, with the attributes that carry meaning and none of the styling hooks. */
export function shape(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return blankAfterScroller(node) ? '' : (node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  // The kit's scroller is how a block scrolls, not what the body drew: its boxes are looked through, its bars left out.
  if (el.dataset.scope === 'scroll-area') return el.dataset.part === 'scrollbar' || el.dataset.part === 'corner' ? '' : [...el.childNodes].map(shape).join('');
  const tag = el.localName;
  const flags = [
    ...ATTRIBUTES.flatMap((name) => {
      const value = name === 'align' ? el.style.textAlign : el.getAttribute(name);
      return value ? [`${name}="${value}"`] : [];
    }),
    ...(el instanceof HTMLInputElement ? [`type=${el.type}`, ...(el.disabled ? ['disabled'] : []), ...(el.checked ? ['checked'] : [])] : []),
  ];
  const open = [tag, ...flags].join(' ');
  if (el.childNodes.length === 0 && ['br', 'hr', 'input'].includes(tag)) return `<${open}>`;
  return `<${open}>${[...el.childNodes].map(shape).join('')}</${tag}>`;
}

/** The elements a body drew, without the wrapper that holds them. */
export const drawn = (el: Element) => [...parts(el, 'prose')[0]!.querySelector('.doc')!.childNodes].map(shape).join('');

export const para = (inner: string) => `<p>${inner}</p>`;
export const items = (...each: string[]) => each.map((inner) => `<li>${para(inner)}</li>`).join('');
