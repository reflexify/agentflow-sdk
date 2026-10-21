import { describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

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

const positionerOf = (el: HTMLElement) => shadow(el).querySelector('[popover]') as HTMLElement;
const closes = (el: HTMLElement) => {
  const seen: unknown[] = [];
  el.addEventListener('close', (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

describe('<af-popover>', () => {
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
});
