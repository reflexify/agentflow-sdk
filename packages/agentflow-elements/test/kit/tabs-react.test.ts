import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/kit/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const tick = () => new Promise((r) => setTimeout(r, 0));
const ITEMS = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];

describe('<af-tabs> in React 19', () => {
  it('keeps the chosen tab and panel while React re-renders with a new items array and swaps the slotted element', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    // A page writes its items inline, so React sets a new array every render, and a key that changes replaces the panel's element.
    const view = (n: number) =>
      createElement('af-tabs', { items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'b' },
        createElement('div', { slot: 'a' }, 'A'), createElement('div', { slot: 'b', key: `b-${n}`, 'data-render': n }, String(n)));
    const tabs = () => container.querySelector('af-tabs')!.shadowRoot!;
    const chosen = () => [...tabs().querySelectorAll('[part~="tab"]')].filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.textContent!.trim());
    const shown = () =>
      [...tabs().querySelectorAll<HTMLElement>('[part~="panel"]')].filter((p) => !p.hidden).map((p) => (p.querySelector('slot') as HTMLSlotElement).assignedElements());

    let previous: Element | null = null;
    for (const n of [1, 2, 3]) {
      await act(async () => root!.render(view(n)));
      await tick();
      expect(chosen(), `render ${n}: the chosen tab`).toEqual(['B']);
      const [panel] = shown();
      expect(panel?.map((el) => el.textContent), `render ${n}: the chosen panel alone, holding the new element`).toEqual([String(n)]);
      expect(panel![0], `render ${n}: a new element`).not.toBe(previous);
      expect(panel![0]!.isConnected).toBe(true);
      previous = panel![0]!;
    }
  });

  it('unmounts cleanly', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(createElement('af-tabs', { items: ITEMS, value: 'a' }, createElement('div', { slot: 'a' }, 'A'))));
    await tick();
    await act(async () => root!.unmount());
    root = null;
    expect(container.childNodes).toHaveLength(0);
  });
});
