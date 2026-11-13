import { describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';
import { cssRules, kitStyleSheets, selectorParts } from './css-source.js';

type PopoverElement = HTMLElement & { open: boolean; placement?: string };

async function popover(open = false) {
  document.body.innerHTML = '';
  const el = document.createElement('af-popover') as PopoverElement;
  el.open = open;
  el.innerHTML =
    '<button slot="anchor" data-testid="popover-anchor">Hạn</button>' +
    '<div slot="content" data-testid="popover-body"><button data-testid="popover-pick">Hôm nay</button></div>';
  document.body.append(el);
  await settle();
  return el;
}

async function popoverWith(inner: string, open = true) {
  document.body.innerHTML = '';
  const el = document.createElement('af-popover') as PopoverElement;
  el.open = open;
  el.innerHTML = inner;
  document.body.append(el);
  await settle();
  return el;
}

// Cancelable, as a key press is: a layer that keeps an Escape for itself calls preventDefault on it.
const escapeOn = (target: Element) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true }));
const pressOutside = () => {
  const outside = document.createElement('button');
  outside.textContent = 'elsewhere';
  document.body.append(outside);
  outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
  outside.focus();
  outside.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0 }));
  outside.click();
  return outside;
};
const closeOnRequest = (el: PopoverElement) => el.addEventListener('close', () => (el.open = false));

const positionerOf = (el: HTMLElement) => shadow(el).querySelector('[popover]') as HTMLElement;
const closes = (el: HTMLElement) => {
  const seen: unknown[] = [];
  el.addEventListener('close', (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

describe('<af-popover>', () => {
  it('is never wider than the screen it is on: its least width gives way to the margin its greatest width keeps', () => {
    // A least width above the greatest wins, and the popover would run past a narrow screen's edge.
    const length = (expression: string, viewport: number): number => {
      const text = expression.trim();
      const min = /^min\((.*)\)$/.exec(text);
      if (min) return Math.min(...selectorParts(min[1]!).map((part) => length(part, viewport)));
      const calc = /^calc\(100vw\s*-\s*([\d.]+)px\)$/.exec(text);
      if (calc) return viewport - Number(calc[1]);
      const rem = /^([\d.]+)rem$/.exec(text);
      if (rem) return Number(rem[1]) * 16;
      throw new Error(`cannot read ${expression}`);
    };
    const content = kitStyleSheets()
      .filter((sheet) => sheet.file === 'Popover.svelte')
      .flatMap((sheet) => cssRules(sheet.css))
      .find((rule) => rule.selector.includes("[data-part='content']") && /min-width/.test(rule.declarations))!;
    const declared = (name: string) => new RegExp(`(?:^|[;\\s])${name}\\s*:\\s*([^;]+)`).exec(content.declarations)![1]!;
    for (const viewport of [300, 320, 360, 600]) {
      expect(length(declared('min-width'), viewport), `${viewport}px wide`).toBeLessThanOrEqual(length(declared('max-width'), viewport));
    }
    expect(length(declared('min-width'), 1280), 'AgentFlow\'s own 288px on a wide screen').toBe(288);
    expect(length(declared('min-width'), 300)).toBe(268);
  });

  it('raises nothing while closed', async () => {
    const el = await popover(false);
    expect(positionerOf(el)).not.toBeNull();
    expect(el.dataset.raised).not.toBe('true');
  });

  it('raises its content when the app opens it, showing the app’s own node', async () => {
    const el = await popover(false);
    el.open = true;
    await settle();
    expect(el.dataset.raised).toBe('true');
    const slot = shadow(el).querySelector('slot[name="content"]') as HTMLSlotElement;
    expect(slot.assignedElements()[0]).toBe(el.querySelector('[data-testid="popover-body"]'));
  });

  it('emits close with the reason escape on Escape pressed in its content', async () => {
    const el = await popover(true);
    const seen = closes(el);
    const body = el.querySelector('[data-testid="popover-body"]') as HTMLElement;
    body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle();
    expect(seen).toEqual([{ reason: 'escape' }]);
  });

  it('emits close with the reason outside on a click outside it', async () => {
    const el = await popover(true);
    const outside = document.createElement('button');
    document.body.append(outside);
    const seen = closes(el);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
    outside.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0 }));
    outside.click();
    await vi.waitFor(() => expect(seen).toEqual([{ reason: 'outside' }]), { timeout: 500 });
  });

  it('never sets open itself; only the app closes it', async () => {
    const el = await popover(true);
    const seen = closes(el);
    (el.querySelector('[data-testid="popover-body"]') as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }),
    );
    await settle();
    expect(seen).toHaveLength(1);
    expect(el.open).toBe(true);
    expect(el.dataset.raised).toBe('true');
    el.open = false;
    await settle();
    expect(el.dataset.raised).toBe('false');
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await popover(false);
      expect(watch.fromKit()).toEqual([]);
      el.open = true;
      await settle();
      expect(el.dataset.raised).toBe('true');
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  describe('focus and Escape', () => {
    const FIELDS = '<div slot="content"><input data-testid="field" /><button data-testid="done">Xong</button></div>';

    it('returns focus to the anchor when Escape closes it', async () => {
      const el = await popoverWith('<button slot="anchor" data-testid="anchor">Lọc</button>' + FIELDS);
      closeOnRequest(el);
      const field = el.querySelector('[data-testid="field"]') as HTMLElement;
      field.focus();
      escapeOn(field);
      await settle();
      expect(el.open).toBe(false);
      expect(document.activeElement).toBe(el.querySelector('[data-testid="anchor"]'));
    });

    it('returns focus to the control inside a wrapped anchor', async () => {
      const el = await popoverWith(
        '<af-tooltip slot="anchor" text="Bộ lọc"><button data-testid="anchor">Lọc</button></af-tooltip>' + FIELDS,
      );
      closeOnRequest(el);
      const field = el.querySelector('[data-testid="field"]') as HTMLElement;
      field.focus();
      escapeOn(field);
      await settle();
      expect(document.activeElement).toBe(el.querySelector('[data-testid="anchor"]'));
    });

    it('returns focus to the anchor inside another element’s shadow root, as in a module', async () => {
      document.body.innerHTML = '';
      const host = document.createElement('div');
      document.body.append(host);
      const root = host.attachShadow({ mode: 'open' });
      const el = document.createElement('af-popover') as PopoverElement;
      el.open = true;
      el.innerHTML = '<button slot="anchor" data-testid="anchor">Lọc</button>' + FIELDS;
      root.append(el);
      await settle();
      closeOnRequest(el);
      const field = el.querySelector('[data-testid="field"]') as HTMLElement;
      field.focus();
      escapeOn(field);
      await settle();
      expect(root.activeElement).toBe(el.querySelector('[data-testid="anchor"]'));
    });

    it('returns focus to the anchor when the page closes it from inside', async () => {
      const el = await popoverWith('<button slot="anchor" data-testid="anchor">Lọc</button>' + FIELDS);
      (el.querySelector('[data-testid="done"]') as HTMLElement).focus();
      el.open = false;
      await settle();
      expect(document.activeElement).toBe(el.querySelector('[data-testid="anchor"]'));
    });

    it('keeps focus where an outside press put it', async () => {
      const el = await popoverWith('<button slot="anchor" data-testid="anchor">Lọc</button>' + FIELDS);
      const seen = closes(el);
      closeOnRequest(el);
      (el.querySelector('[data-testid="field"]') as HTMLElement).focus();
      const outside = pressOutside();
      await vi.waitFor(() => expect(seen).toEqual([{ reason: 'outside' }]), { timeout: 500 });
      await settle();
      expect(document.activeElement).toBe(outside);
    });

    it('a held press on its anchor while open emits no close, so the anchor can toggle it', async () => {
      const el = await popoverWith('<button slot="anchor" data-testid="anchor">Lọc</button>' + FIELDS);
      const seen = closes(el);
      const anchor = el.querySelector('[data-testid="anchor"]') as HTMLElement;
      anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
      // A person holds a press for longer than a frame; the outside check runs a frame after pointerdown.
      await new Promise((resolve) => setTimeout(resolve, 100));
      anchor.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0 }));
      anchor.click();
      await settle();
      expect(seen).toEqual([]);
    });

    it('leaves focus on the page after an outside press on something that takes no focus', async () => {
      const el = await popoverWith('<button slot="anchor" data-testid="anchor">Lọc</button>' + FIELDS);
      const seen = closes(el);
      closeOnRequest(el);
      (el.querySelector('[data-testid="field"]') as HTMLElement).focus();
      const text = document.createElement('p');
      text.textContent = 'plain text';
      document.body.append(text);
      text.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
      // A press on text moves focus to the page at mousedown.
      (document.activeElement as HTMLElement | null)?.blur();
      text.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0 }));
      text.click();
      await vi.waitFor(() => expect(seen).toEqual([{ reason: 'outside' }]), { timeout: 500 });
      await settle();
      expect(document.activeElement).toBe(document.body);
    });

    const TIPPED =
      '<button slot="anchor" data-testid="anchor">Lọc</button>' +
      '<div slot="content"><af-tooltip text="Gọn"><button data-testid="compact">C</button></af-tooltip></div>';

    it('lets a shown tooltip inside take the first Escape', async () => {
      const el = await popoverWith(TIPPED);
      const seen = closes(el);
      closeOnRequest(el);
      const tip = el.querySelector('af-tooltip') as HTMLElement;
      const compact = el.querySelector('[data-testid="compact"]') as HTMLElement;
      compact.focus();
      await settle();
      expect(tip.dataset.raised).toBe('true');
      escapeOn(compact);
      await settle();
      expect(seen).toEqual([]);
      expect(el.dataset.raised).toBe('true');
      expect(tip.dataset.raised).not.toBe('true');
      escapeOn(compact);
      await settle();
      expect(seen).toEqual([{ reason: 'escape' }]);
    });

    it('closes on an Escape from outside a shown tooltip', async () => {
      const el = await popoverWith(TIPPED.replace('</af-tooltip>', '</af-tooltip><input data-testid="field" />'));
      const seen = closes(el);
      const tip = el.querySelector('af-tooltip') as HTMLElement;
      (el.querySelector('[data-testid="compact"]') as HTMLElement).focus();
      await settle();
      expect(tip.dataset.raised).toBe('true');
      escapeOn(el.querySelector('[data-testid="field"]') as HTMLElement);
      await settle();
      expect(seen).toEqual([{ reason: 'escape' }]);
    });

    it('reports outside after a kept Escape', async () => {
      const el = await popoverWith(TIPPED);
      const seen = closes(el);
      const compact = el.querySelector('[data-testid="compact"]') as HTMLElement;
      compact.focus();
      await settle();
      escapeOn(compact);
      await settle();
      expect(seen).toEqual([]);
      pressOutside();
      await vi.waitFor(() => expect(seen).toEqual([{ reason: 'outside' }]), { timeout: 500 });
    });
  });
});
