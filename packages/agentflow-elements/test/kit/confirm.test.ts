import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type ConfirmEl = HTMLElement & { open: boolean; heading: string; message: string; confirmLabel: string; danger: boolean; impact: string | null; busy: boolean; locale: string; strings: Record<string, string> | null };

async function confirmEl(props: Partial<ConfirmEl>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-confirm') as ConfirmEl;
  Object.assign(el, props);
  document.body.append(el);
  await settle();
  return el;
}

describe('<af-confirm>', () => {
  it('shows the heading, message and impact, and a danger confirm', async () => {
    const el = await confirmEl({ open: true, heading: 'Xoá hạng mục?', message: 'Không hoàn tác được.', confirmLabel: 'Xoá', danger: true, impact: '12 task sẽ chuyển sang Chưa có hạng mục', locale: 'vi' });
    const root = shadow(el);
    expect(root.querySelector('[part="heading"]')?.textContent).toBe('Xoá hạng mục?');
    expect(root.querySelector('[part="impact"]')?.textContent).toBe('12 task sẽ chuyển sang Chưa có hạng mục');
    const ok = root.querySelector('[part="confirm"]') as HTMLButtonElement;
    expect(ok.textContent?.trim()).toBe('Xoá');
    expect(ok.classList.contains('danger')).toBe(true);
    expect(root.querySelector('[part="cancel"]')?.textContent?.trim()).toBe('Huỷ');
  });

  it('confirms once however many times it is pressed', async () => {
    const el = await confirmEl({ open: true, heading: 'Huỷ task?', message: '', confirmLabel: 'Huỷ task' });
    const seen: unknown[] = [];
    el.addEventListener('confirm', (e) => seen.push(e));
    const ok = shadow(el).querySelector('[part="confirm"]') as HTMLButtonElement;
    ok.click(); ok.click(); ok.click();
    await settle();
    expect(seen).toHaveLength(1);
    expect(ok.getAttribute('aria-disabled')).toBe('true');
  });

  it('unlocks when the app clears busy, and when it reopens', async () => {
    const el = await confirmEl({ open: true, heading: 'x', message: '', confirmLabel: 'OK' });
    const seen: unknown[] = [];
    el.addEventListener('confirm', (e) => seen.push(e));
    const ok = () => shadow(el).querySelector('[part="confirm"]') as HTMLButtonElement;
    ok().click(); await settle();
    el.busy = true; await settle();
    el.busy = false; await settle();
    ok().click(); await settle();
    el.open = false; await settle(); el.open = true; await settle();
    ok().click(); await settle();
    expect(seen).toHaveLength(3);
  });

  it('cancels on the cancel button and on Escape', async () => {
    const el = await confirmEl({ open: true, heading: 'x', message: '', confirmLabel: 'OK' });
    const seen: unknown[] = [];
    el.addEventListener('cancel', (e) => seen.push((e as CustomEvent).detail));
    (shadow(el).querySelector('[part="cancel"]') as HTMLElement).click();
    (shadow(el).querySelector('[part="content"]') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle();
    expect(seen).toEqual([{ reason: 'close-button' }, { reason: 'escape' }]);
  });

  it('takes its own text from strings', async () => {
    const el = await confirmEl({ open: true, heading: 'x', message: '', confirmLabel: 'OK', locale: 'vi', strings: { cancel: 'Thôi' } });
    expect(shadow(el).querySelector('[part="cancel"]')?.textContent?.trim()).toBe('Thôi');
  });

  it('opens as a native modal dialog and adds no key listener of its own to document or window', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await confirmEl({ open: true, heading: 'x', message: '', confirmLabel: 'OK' });
      const dialog = shadow(el).querySelector('dialog') as HTMLDialogElement;
      expect(dialog.hasAttribute('open')).toBe(true);
      expect(shadow(el).querySelector('[popover]')).toBeNull();
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });
});
