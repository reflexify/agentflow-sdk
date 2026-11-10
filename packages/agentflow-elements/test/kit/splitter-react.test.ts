import { act, createElement, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('<af-splitter> in React 19', () => {
  it('keeps a moved handle where it is while React re-renders what is slotted into a pane', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 600, 160));
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    let bump: () => void = () => {};
    function Page() {
      const [n, setN] = useState(0);
      bump = () => setN((v) => v + 1);
      return createElement('af-splitter', { size: 38, label: 'Resize' },
        createElement('button', { slot: 'start' }, `Clicked ${n}`),
        createElement('article', { slot: 'end' }, 'Detail'));
    }
    await act(async () => root!.render(createElement(Page)));
    await tick();
    const el = container.querySelector('af-splitter')!;
    const handle = () => el.shadowRoot!.querySelector<HTMLElement>('[part~="handle"]')!;
    const endPane = () => (el.shadowRoot!.querySelector('[part~="end"] slot') as HTMLSlotElement).assignedNodes().map((n) => n.textContent);
    // The page does not set the moved size back, so a re-render that put the panes back on the prop would show 38.
    handle().focus();
    await tick();
    handle().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await tick();
    expect(handle().getAttribute('aria-valuenow')).toBe('43');

    for (const n of [1, 2]) {
      await act(async () => bump());
      await tick();
      expect(container.querySelector('button')!.textContent).toBe(`Clicked ${n}`);
      expect(handle().getAttribute('aria-valuenow')).toBe('43');
      expect(endPane()).toEqual(['Detail']);
    }
  });
});
