import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

async function tooltip(text = 'Chỉ quản lý được xoá') {
  document.body.innerHTML = '';
  const el = document.createElement('af-tooltip') as HTMLElement & { text: string };
  el.text = text;
  el.innerHTML = '<button data-testid="tooltip-target">Xoá</button>';
  document.body.append(el);
  await settle();
  return el;
}

const anchorOf = (el: HTMLElement) => shadow(el).querySelector('[part="anchor"]') as HTMLElement;
const tipOf = (el: HTMLElement) => shadow(el).querySelector('[role="tooltip"]') as HTMLElement | null;
const raised = (el: HTMLElement) => el.dataset.raised;
const escape = () => new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true });

describe('<af-tooltip>', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('shows its text after the hover delay', async () => {
    const el = await tooltip();
    anchorOf(el).dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true }));
    flushSync();
    expect(raised(el)).not.toBe('true');
    vi.advanceTimersByTime(300);
    await settle();
    expect(tipOf(el)?.textContent?.trim()).toBe('Chỉ quản lý được xoá');
    expect(tipOf(el)?.hidden).toBe(false);
    expect(raised(el)).toBe('true');
  });

  it('hides on pointer leave', async () => {
    const el = await tooltip();
    anchorOf(el).dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true }));
    vi.advanceTimersByTime(300);
    await settle();
    expect(raised(el)).toBe('true');
    anchorOf(el).dispatchEvent(new PointerEvent('pointerleave', { composed: true }));
    await settle();
    expect(raised(el)).toBe('false');
  });

  it('shows at once on focus within its anchor and hides on Escape there', async () => {
    const el = await tooltip();
    const target = el.querySelector('[data-testid="tooltip-target"]') as HTMLElement;
    target.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await settle();
    expect(raised(el)).toBe('true');
    expect(anchorOf(el).getAttribute('aria-describedby')).toBeTruthy();
    target.dispatchEvent(escape());
    await settle();
    expect(raised(el)).toBe('false');
  });

  it('lets the Escape it hides on reach the page', async () => {
    const el = await tooltip();
    const seen: KeyboardEvent[] = [];
    const onKey = (e: KeyboardEvent) => seen.push(e);
    document.body.addEventListener('keydown', onKey);
    try {
      anchorOf(el).dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      await settle();
      expect(raised(el)).toBe('true');
      anchorOf(el).dispatchEvent(escape());
      await settle();
      expect(raised(el)).toBe('false');
      expect(seen.map((e) => e.key)).toEqual(['Escape']);
      expect(seen[0]!.defaultPrevented).toBe(false);
    } finally {
      document.body.removeEventListener('keydown', onKey);
    }
  });

  it('renders only its anchor when it has no text', async () => {
    const el = await tooltip('');
    expect(shadow(el).querySelector('slot')).not.toBeNull();
    expect(tipOf(el)).toBeNull();
    expect(shadow(el).querySelector('[popover]')).toBeNull();
  });

  it('adds no key listener of its own to document or window while shown', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await tooltip();
      anchorOf(el).dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      await settle();
      expect(raised(el)).toBe('true');
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });
});
