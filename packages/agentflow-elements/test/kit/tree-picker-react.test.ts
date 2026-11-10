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

describe('<af-tree-picker> in React 19', () => {
  it('shows each value the page sets, as React re-renders with a new nodes array', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    // A page writes its nodes inline, so React sets a new array every render.
    const view = (value: string) =>
      createElement('af-tree-picker', {
        nodes: [{ id: 'hq', parentId: null, label: 'HQ' }, { id: 'north', parentId: 'hq', label: 'North' }, { id: 'south', parentId: 'hq', label: 'South' }],
        value,
      });
    const input = () => container.querySelector('af-tree-picker')!.shadowRoot!.querySelector('[part~="input"]') as HTMLInputElement;
    for (const [value, name] of [['north', 'North'], ['south', 'South'], ['hq', 'HQ']] as const) {
      await act(async () => root!.render(view(value)));
      await tick();
      expect(input().value, `value ${value}`).toBe(name);
    }
  });

  it('unmounts cleanly', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(createElement('af-tree-picker', { nodes: [{ id: 'hq', parentId: null, label: 'HQ' }], value: 'hq' })));
    await tick();
    await act(async () => root!.unmount());
    root = null;
    expect(container.childNodes).toHaveLength(0);
  });
});
