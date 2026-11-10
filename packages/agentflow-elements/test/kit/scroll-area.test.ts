import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { revealItem } from '../../src/kit/scroll/Scroller.svelte';
import { scrollStop } from '../../src/kit/scroll/scroll-stop.js';
import { settle, shadow } from '../support.js';

type ScrollAreaElement = HTMLElement & { axis: string | null; label: string | null; readonly viewport: HTMLElement | null };

async function area(attributes: Record<string, string> = {}, inner = '<p>One</p><p>Two</p>') {
  document.body.innerHTML = '';
  const el = document.createElement('af-scroll-area') as ScrollAreaElement;
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  el.innerHTML = inner;
  document.body.append(el);
  await settle();
  return el;
}

describe('<af-scroll-area>', () => {
  it('slots its content into the content part and hands out the viewport', async () => {
    const el = await area();
    const slot = shadow(el).querySelector('[part="content"] slot') as HTMLSlotElement;
    expect(slot.assignedNodes().map((n) => n.textContent)).toEqual(['One', 'Two']);
    expect(el.viewport).toBe(shadow(el).querySelector('[part="viewport"]'));
    expect(el.viewport).not.toBeNull();
  });

  it('scrolls one way by default and the way axis names', async () => {
    const root = (el: Element) => shadow(el).querySelector('[data-scope="scroll-area"][data-part="root"]');
    expect(root(await area())?.getAttribute('data-orientation')).toBe('vertical');
    expect(root(await area({ axis: 'horizontal' }))?.getAttribute('data-orientation')).toBe('horizontal');
    const both = await area({ axis: 'both' });
    expect([...shadow(both).querySelectorAll('[part="scrollbar"]')].map((s) => s.getAttribute('data-orientation'))).toEqual(['vertical', 'horizontal']);
    expect(shadow(both).querySelector('[part="corner"]')).not.toBeNull();
  });

  it('is a named region only with a label', async () => {
    const named = await area({ label: 'Facets' });
    expect([named.viewport!.getAttribute('role'), named.viewport!.getAttribute('aria-label')]).toEqual(['region', 'Facets']);
    const plain = await area();
    expect(plain.viewport!.hasAttribute('role')).toBe(false);
    expect(plain.viewport!.hasAttribute('aria-label')).toBe(false);
  });

  it('in another element: one content part, and a list inside a composite that is never a tab stop', async () => {
    const OPTIONS = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    const key = (target: Element) => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    const cases: [tag: string, props: Record<string, unknown>, open: (root: ShadowRoot) => void, listStop: boolean][] = [
      ['af-menu', { items: [{ id: 'a', label: 'A' }], label: 'Actions' }, (root) => (root.querySelector('[part="trigger"]') as HTMLElement).click(), false],
      ['af-select', { options: OPTIONS }, (root) => (root.querySelector('[part="trigger"]') as HTMLElement).click(), false],
      ['af-combobox', { options: OPTIONS }, (root) => {
        const input = root.querySelector('[part="input"]') as HTMLInputElement;
        input.focus();
        key(input);
      }, false],
      ['af-dialog', { open: true, heading: 'Edit' }, () => {}, true],
    ];
    for (const [tag, props, open, listStop] of cases) {
      document.body.innerHTML = '';
      const el = Object.assign(document.createElement(tag), props);
      document.body.append(el);
      await settle();
      open(shadow(el));
      await settle();
      const viewport = shadow(el).querySelector('[part~="viewport"]')!;
      expect(viewport, `${tag} scrolls in a scroller`).not.toBeNull();
      expect(shadow(el).querySelectorAll('[part~="content"]').length, `${tag} keeps its own content part and adds none`).toBe(tag === 'af-menu' ? 0 : 1);
      if (listStop) {
        expect(viewport.getAttribute('tabindex'), `${tag}: its body keeps the stop`).not.toBe('-1');
      } else {
        expect(viewport.getAttribute('tabindex'), `${tag}: Tab never lands in its list`).toBe('-1');
        expect(viewport.hasAttribute('role'), `${tag}: nothing between the list and its items`).toBe(false);
      }
    }
  });

  it.each(['IntersectionObserver', 'ResizeObserver'])('renders its boxes without Zag when %s is missing, as in a module\'s jsdom tests', async (observer) => {
    vi.stubGlobal(observer, undefined);
    try {
      const el = await area({ label: 'Facets', axis: 'both' });
      expect(el.viewport).toBe(shadow(el).querySelector('[part="viewport"]'));
      expect(el.viewport?.getAttribute('aria-label')).toBe('Facets');
      expect(shadow(el).querySelector('[data-scope="scroll-area"][data-part="root"]')?.getAttribute('data-orientation')).toBe('both');
      expect(shadow(el).querySelector('[part="scrollbar"]'), 'and draws no scrollbar').toBeNull();
      expect((shadow(el).querySelector('[part="content"] slot') as HTMLSlotElement).assignedNodes()).toHaveLength(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('without Zag, keeps a list inside a composite out of the tab order', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    try {
      document.body.innerHTML = '';
      const el = Object.assign(document.createElement('af-select'), { options: [{ value: 'a', label: 'A' }] });
      document.body.append(el);
      await settle();
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      const viewport = shadow(el).querySelector('[part~="viewport"]')!;
      expect(shadow(el).querySelector('[part="scrollbar"]'), 'the boxes without Zag').toBeNull();
      expect(viewport.getAttribute('tabindex')).toBe('-1');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('reveals an item by scrolling its own viewport, to the nearest edge, and never the page around it', () => {
    document.body.innerHTML = `<div id="page" style="height: 300px; overflow: auto"><div style="height: 2000px">
      <div data-scope="scroll-area" data-part="root" data-orientation="vertical"><div data-scope="scroll-area" data-part="viewport">
        <div id="item"></div></div></div></div></div>`;
    const page = document.getElementById('page')!;
    const item = document.getElementById('item')!;
    const viewport = item.parentElement!;
    const rect = (top: number, height: number) => ({ top, bottom: top + height, left: 0, right: 100, width: 100, height }) as DOMRect;
    Object.defineProperty(viewport, 'clientHeight', { value: 100 });
    viewport.getBoundingClientRect = () => rect(40, 100);
    page.scrollTop = 25;
    const native = vi.spyOn(item, 'scrollIntoView');
    const reveal = (top: number) => {
      item.getBoundingClientRect = () => rect(top, 20);
      revealItem({ getElement: () => item });
    };
    reveal(160);
    expect(viewport.scrollTop, 'below the viewport, it moves until the item meets its bottom edge').toBe(40);
    reveal(80);
    expect(viewport.scrollTop, 'an item that shows moves nothing').toBe(40);
    reveal(30);
    expect(viewport.scrollTop, 'above it, until the item meets its top edge').toBe(30);
    expect(page.scrollTop, 'the page around it stays where it was').toBe(25);
    expect(native).not.toHaveBeenCalled();
  });

  describe('the tab stop', () => {
    const live = new Set<{ callback: ResizeObserverCallback; targets: Set<Element> }>();
    beforeEach(() => {
      class FakeObserver {
        readonly record = { callback: null as unknown as ResizeObserverCallback, targets: new Set<Element>() };
        constructor(callback: ResizeObserverCallback) {
          this.record.callback = callback;
          live.add(this.record);
        }
        observe(target: Element) { this.record.targets.add(target); }
        unobserve(target: Element) { this.record.targets.delete(target); }
        disconnect() { live.delete(this.record); }
      }
      vi.stubGlobal('ResizeObserver', FakeObserver);
    });
    afterEach(() => {
      live.clear();
      vi.unstubAllGlobals();
    });

    const overflowing = (viewport: HTMLElement) => {
      const sizes = { scrollHeight: 400, clientHeight: 100 };
      Object.defineProperty(viewport, 'scrollHeight', { configurable: true, get: () => sizes.scrollHeight });
      Object.defineProperty(viewport, 'clientHeight', { configurable: true, get: () => sizes.clientHeight });
      const resize = () => {
        for (const o of [...live]) if (o.targets.has(viewport)) o.callback([{ target: viewport } as unknown as ResizeObserverEntry], {} as ResizeObserver);
      };
      resize();
      return { sizes, resize };
    };

    it('is the viewport while its content overflows, and not once it fits', async () => {
      const el = await area();
      const viewport = el.viewport!;
      const { sizes, resize } = overflowing(viewport);
      expect(viewport.getAttribute('tabindex'), 'taller than its box, a keyboard needs it to scroll').toBe('0');
      sizes.scrollHeight = 100;
      resize();
      expect(viewport.hasAttribute('tabindex'), 'a box that fits is not one more stop').toBe(false);
    });

    it('is no stop while it holds something Tab reaches, read through the slot and the shadow roots inside it', async () => {
      const el = await area({}, '<p>Plain</p><div><button disabled>Locked</button><a>No href</a><fieldset disabled><input></fieldset></div>');
      const viewport = el.viewport!;
      overflowing(viewport);
      expect(viewport.getAttribute('tabindex'), 'a disabled button, a link with no href and a field in a disabled fieldset are not reached by Tab').toBe('0');
      el.querySelector('div')!.insertAdjacentHTML('beforeend', '<input>');
      el.append(document.createElement('span'));
      await settle();
      expect(viewport.hasAttribute('tabindex'), 'a field inside is scrolled to by tabbing to it').toBe(false);

      const nested = await area({}, '<p>Plain</p>');
      const { resize } = overflowing(nested.viewport!);
      expect(nested.viewport!.getAttribute('tabindex')).toBe('0');
      const select = Object.assign(document.createElement('af-select'), { options: [{ value: 'a', label: 'A' }] });
      nested.append(select);
      await settle();
      // The select draws its trigger after the slot takes it, and the content grows as it does.
      resize();
      expect(nested.viewport!.hasAttribute('tabindex'), "a kit element's own trigger, inside its shadow root, counts").toBe(false);
    });

    it('reads what it holds again when that changes without a resize', async () => {
      document.body.innerHTML = '<div id="region"><p>Plain</p></div>';
      const region = document.getElementById('region')!;
      Object.defineProperty(region, 'scrollHeight', { configurable: true, get: () => 400 });
      Object.defineProperty(region, 'clientHeight', { configurable: true, get: () => 100 });
      const stop = scrollStop(region);
      expect(region.getAttribute('tabindex')).toBe('0');
      region.insertAdjacentHTML('beforeend', '<button disabled>Open</button>');
      await Promise.resolve();
      expect(region.getAttribute('tabindex'), 'a disabled button is not reached by Tab').toBe('0');
      region.querySelector('button')!.disabled = false;
      await Promise.resolve();
      expect(region.hasAttribute('tabindex'), 'enabled, it is').toBe(false);
      region.querySelector('button')!.remove();
      await Promise.resolve();
      expect(region.getAttribute('tabindex'), 'and gone, the region is the stop again').toBe('0');
      stop();
    });

    it("in a dialog: no stop around a form; a stop of plain text, named by the dialog's heading", async () => {
      const dialog = async (inner: string, heading = 'Notes') => {
        document.body.innerHTML = '';
        const el = Object.assign(document.createElement('af-dialog'), { open: true, heading });
        el.innerHTML = inner;
        document.body.append(el);
        await settle();
        const viewport = shadow(el).querySelector<HTMLElement>('[part~="viewport"]')!;
        overflowing(viewport);
        await settle();
        return { el, viewport };
      };
      const form = await dialog('<label>Title <input></label>');
      expect(form.viewport.hasAttribute('tabindex'), 'Tab reaches the field, so the body is no stop').toBe(false);
      expect(form.viewport.hasAttribute('role'), 'and no region').toBe(false);

      const text = await dialog('<p>A long note.</p>');
      expect(text.viewport.getAttribute('tabindex')).toBe('0');
      expect([text.viewport.getAttribute('role'), text.viewport.getAttribute('aria-label')], 'without element reflection, named by its text').toEqual(['region', 'Notes']);
      const untitled = await dialog('<p>A long note.</p>', '');
      expect([untitled.viewport.getAttribute('tabindex'), untitled.viewport.getAttribute('role')], 'an empty heading: a stop, but no region without a name').toEqual(['0', null]);

      const reflected = new WeakMap<Element, Element[] | null>();
      Object.defineProperty(HTMLElement.prototype, 'ariaLabelledByElements', {
        configurable: true,
        get(this: Element) { return reflected.get(this) ?? null; },
        set(this: Element, value: Element[] | null) { reflected.set(this, value); },
      });
      try {
        const linked = await dialog('<p>A long note.</p>');
        expect(reflected.get(linked.viewport), 'with it, linked to the heading itself').toEqual([shadow(linked.el).querySelector('[part="heading"]')]);
        expect(linked.viewport.hasAttribute('aria-label')).toBe(false);
      } finally {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).ariaLabelledByElements;
      }
    });
  });
});
