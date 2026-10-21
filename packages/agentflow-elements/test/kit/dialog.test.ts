import { describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { kitText } from '../../src/kit/text.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type DialogElement = HTMLElement & { open: boolean; heading: string; locale: string | null };

async function dialog(props: Partial<DialogElement> = {}) {
  const el = document.createElement('af-dialog') as DialogElement;
  Object.assign(el, { heading: 'Sửa hạng mục', ...props });
  el.innerHTML =
    '<p data-testid="dialog-body">Tên hạng mục</p>' +
    '<button slot="actions" data-testid="dialog-save">Lưu</button>';
  document.body.append(el);
  await settle();
  return el;
}

const nativeDialog = (el: HTMLElement) => shadow(el).querySelector('dialog') as HTMLDialogElement;
const closes = (el: HTMLElement) => {
  const seen: unknown[] = [];
  el.addEventListener('close', (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

describe('<af-dialog>', () => {
  it('opens a native dialog labelled by its heading, showing the app’s body and actions', async () => {
    document.body.innerHTML = '';
    const el = await dialog({ open: true });
    const root = shadow(el);
    expect(nativeDialog(el).hasAttribute('open')).toBe(true);
    expect(root.querySelector('[popover]')).toBeNull();
    const content = root.querySelector('[role="dialog"]') as HTMLElement;
    expect(nativeDialog(el).contains(content)).toBe(true);
    const heading = root.querySelector('[part="heading"]') as HTMLElement;
    expect(heading.textContent).toBe('Sửa hạng mục');
    expect(content.getAttribute('aria-labelledby')).toBe(heading.id);
    const body = root.querySelector('slot:not([name])') as HTMLSlotElement;
    const actions = root.querySelector('slot[name="actions"]') as HTMLSlotElement;
    expect(body.assignedElements()).toEqual([el.querySelector('[data-testid="dialog-body"]')]);
    expect(actions.assignedElements()).toEqual([el.querySelector('[data-testid="dialog-save"]')]);
    expect(root.querySelector('[part="actions"]')?.hasAttribute('hidden')).toBe(false);
  });

  it('emits close with the reason escape on Escape, and stays open until the app closes it', async () => {
    document.body.innerHTML = '';
    const el = await dialog({ open: true });
    const seen = closes(el);
    (shadow(el).querySelector('[part="content"]') as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }),
    );
    await settle();
    expect(seen).toEqual([{ reason: 'escape' }]);
    expect(el.open).toBe(true);
    expect(nativeDialog(el).hasAttribute('open')).toBe(true);
  });

  it('emits close with the reason close-button from its labelled close button', async () => {
    document.body.innerHTML = '';
    const el = await dialog({ open: true, locale: 'vi' });
    const seen = closes(el);
    const close = shadow(el).querySelector('[part="close"]') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe(kitText('vi').close);
    close.click();
    await settle();
    expect(seen).toEqual([{ reason: 'close-button' }]);
  });

  it('closes when the app clears open, and gives focus back to what held it', async () => {
    document.body.innerHTML = '';
    const before = document.createElement('button');
    before.textContent = 'Sửa';
    document.body.append(before);
    before.focus();
    const el = await dialog();
    el.open = true;
    await settle();
    expect(nativeDialog(el).hasAttribute('open')).toBe(true);
    el.open = false;
    await settle();
    expect(nativeDialog(el).hasAttribute('open')).toBe(false);
    await vi.waitFor(() => expect(document.activeElement).toBe(before), { timeout: 1000 });
  });

  it('adds no key listener of its own to document or window while open', async () => {
    document.body.innerHTML = '';
    const watch = watchDocumentKeyListeners();
    try {
      const el = await dialog({ open: true });
      expect(nativeDialog(el).hasAttribute('open')).toBe(true);
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });
});
