import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import type { FileItem } from '../../src/kit/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('<af-file-upload> in React 19', () => {
  it('draws the rows of each items array React sets, as a page appends a file', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const view = (items: FileItem[]) => createElement('af-file-upload', { items, multiple: true });
    const names = () => [...container.querySelector('af-file-upload')!.shadowRoot!.querySelectorAll('[part~="item"] [part~="name"]')].map((n) => n.textContent);
    const first: FileItem = { id: 'f1', name: 'contract.pdf', size: 1536, status: 'done' };
    await act(async () => root!.render(view([first])));
    await tick();
    expect(names()).toEqual(['contract.pdf']);
    await act(async () => root!.render(view([first, { id: 'f2', name: 'photo.png', size: 2048, status: 'uploading', progress: 10 }])));
    await tick();
    expect(names()).toEqual(['contract.pdf', 'photo.png']);
  });

  it('unmounts cleanly', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(createElement('af-file-upload', { items: [{ id: 'f1', name: 'contract.pdf', status: 'done' }] })));
    await tick();
    await act(async () => root!.unmount());
    root = null;
    expect(container.childNodes).toHaveLength(0);
  });
});
