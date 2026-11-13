import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type SplitterElement = HTMLElement & { size: number; min: number; max: number; orientation: string | null; label: string | null; locale: string | null };

afterEach(() => vi.restoreAllMocks());

// jsdom lays nothing out, and Zag sizes the panes only once the root has a size, so every box here is 600 by 160.
function layout() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 600, 160));
}

async function splitter(props: Partial<SplitterElement> = {}) {
  layout();
  document.body.innerHTML = '';
  const el = document.createElement('af-splitter') as SplitterElement;
  Object.assign(el, { label: 'Resize the list', ...props });
  el.innerHTML = '<ul slot="start"><li>Row</li></ul><article slot="end">Detail</article>';
  document.body.append(el);
  await settle();
  const changes: unknown[] = [];
  el.addEventListener('size-change', (e) => changes.push((e as CustomEvent).detail));
  return { el, changes };
}

const handle = (el: Element) => shadow(el).querySelector<HTMLElement>('[part~="handle"]')!;

async function press(el: Element, key: string) {
  handle(el).focus();
  await settle();
  handle(el).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
  await settle();
}

describe('<af-splitter>', () => {
  it('puts the start and end slots in the start and end parts', async () => {
    const { el } = await splitter();
    const slotted = (name: string) =>
      (shadow(el).querySelector(`[part~="${name}"] slot`) as HTMLSlotElement).assignedNodes().map((n) => (n as Element).localName);
    expect(slotted('start')).toEqual(['ul']);
    expect(slotted('end')).toEqual(['article']);
  });

  it('names the handle and gives its value and range', async () => {
    const { el } = await splitter({ size: 38 });
    const h = handle(el);
    expect(h.getAttribute('role')).toBe('separator');
    expect(h.getAttribute('aria-valuenow')).toBe('38');
    expect(h.getAttribute('aria-valuemin')).toBe('20');
    expect(h.getAttribute('aria-valuemax')).toBe('80');
    expect(h.getAttribute('aria-label')).toBe('Resize the list');
  });

  it('keeps its size the start pane’s share under a dir="rtl" ancestor, where ArrowLeft grows the start pane', async () => {
    layout();
    document.body.innerHTML = '<div dir="rtl"></div>';
    const el = document.createElement('af-splitter') as SplitterElement;
    el.size = 30;
    el.innerHTML = '<ul slot="start"><li>Row</li></ul><article slot="end">Detail</article>';
    document.body.firstElementChild!.append(el);
    await settle();
    const changes: unknown[] = [];
    el.addEventListener('size-change', (e) => changes.push((e as CustomEvent).detail));
    await press(el, 'ArrowLeft');
    expect(changes).toEqual([{ size: 35 }]);
    expect(handle(el).getAttribute('aria-valuenow')).toBe('35');
  });

  it('reports a key press that moved the handle with size-change, and nothing for one that could not', async () => {
    const moved = await splitter({ size: 38 });
    await press(moved.el, 'ArrowRight');
    expect(moved.changes).toEqual([{ size: 43 }]);
    expect(handle(moved.el).getAttribute('aria-valuenow')).toBe('43');

    const atMax = await splitter({ size: 80 });
    await press(atMax.el, 'ArrowRight');
    expect(atMax.changes).toEqual([]);
  });

  it('moves the handle for a size the page sets, without reporting it', async () => {
    const { el, changes } = await splitter({ size: 38 });
    el.size = 60;
    await settle();
    expect(handle(el).getAttribute('aria-valuenow')).toBe('60');
    expect(changes).toEqual([]);
  });

  it('puts the handle back on a size the page sets again after a key moved it, by property or attribute', async () => {
    const { el, changes } = await splitter({ size: 38 });
    await press(el, 'ArrowRight');
    el.size = 38;
    await settle();
    expect(handle(el).getAttribute('aria-valuenow')).toBe('38');
    el.setAttribute('size', '38');
    await press(el, 'ArrowLeft');
    el.setAttribute('size', '38');
    await settle();
    expect(handle(el).getAttribute('aria-valuenow')).toBe('38');
    expect(changes).toEqual([{ size: 43 }, { size: 33 }]);
  });

  it.each([
    ['min', { min: 60 }, '60', 'aria-valuemin'],
    ['max', { max: 30 }, '30', 'aria-valuemax'],
  ] as const)('moves the handle into a new %s without reporting it', async (_, range, value, bound) => {
    const { el, changes } = await splitter({ size: 38 });
    Object.assign(el, range);
    await settle();
    expect(handle(el).getAttribute('aria-valuenow')).toBe(value);
    expect(handle(el).getAttribute(bound)).toBe(value);
    expect(changes).toEqual([]);
  });

  it.each([
    ['en', 'Resize panes'],
    ['vi', 'Thay đổi kích thước khung'],
  ])('names the handle in %s when the page gives no label', async (locale, name) => {
    const { el } = await splitter({ label: null, locale });
    expect(handle(el).getAttribute('aria-label')).toBe(name);
  });

  it('clamps size into its range', async () => {
    const { el } = await splitter({ size: 5 });
    expect(handle(el).getAttribute('aria-valuenow')).toBe('20');
    el.min = 30;
    await settle();
    expect(handle(el).getAttribute('aria-valuenow')).toBe('30');
  });

  it('stacks the panes when vertical, and moves the handle with ArrowDown', async () => {
    const { el, changes } = await splitter({ orientation: 'vertical' });
    expect(shadow(el).querySelector('[data-scope="splitter"][data-part="root"]')!.getAttribute('data-orientation')).toBe('vertical');
    await press(el, 'ArrowDown');
    expect(changes).toEqual([{ size: 55 }]);
  });
});
