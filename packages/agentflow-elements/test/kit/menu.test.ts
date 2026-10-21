import { describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

async function menu(items: unknown) {
  document.body.innerHTML = '';
  const el = document.createElement('af-menu') as HTMLElement & { items: unknown; label: string };
  el.items = items;
  el.label = 'Task actions';
  el.textContent = '⋯';
  document.body.append(el);
  await settle();
  return el;
}

describe('<af-menu>', () => {
  it('names its trigger, lists items, and emits select with the id', async () => {
    const el = await menu([{ id: 'rename', label: 'Đổi tên' }, { id: 'delete', label: 'Xoá', danger: true }]);
    const trigger = shadow(el).querySelector('[part="trigger"]') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-label')).toBe('Task actions');
    trigger.click();
    await settle();
    const rows = [...shadow(el).querySelectorAll('[part="item"]')] as HTMLElement[];
    expect(rows.map((r) => r.textContent?.trim())).toEqual(['Đổi tên', 'Xoá']);
    expect(rows[1]!.hasAttribute('data-danger')).toBe(true);
    const picked: unknown[] = [];
    el.addEventListener('select', (e) => picked.push((e as CustomEvent).detail));
    rows[0]!.click();
    await settle();
    expect(picked).toEqual([{ id: 'rename' }]);
  });

  it('never selects a disabled item and shows its reason', async () => {
    const el = await menu([{ id: 'delete', label: 'Xoá', disabled: true, reason: 'Chỉ quản lý được xoá' }]);
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    const row = shadow(el).querySelector('[part="item"]') as HTMLElement;
    expect(row.getAttribute('aria-disabled')).toBe('true');
    expect((shadow(el).querySelector('af-tooltip') as unknown as { text: string }).text).toBe('Chỉ quản lý được xoá');
    const picked: unknown[] = [];
    el.addEventListener('select', (e) => picked.push(e));
    row.click();
    await settle();
    expect(picked).toHaveLength(0);
  });

  it('raises its content into the top layer while open', async () => {
    const el = await menu([{ id: 'a', label: 'A' }]);
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    expect(shadow(el).querySelector('[popover]')?.hasAttribute('data-raised')).toBe(false);
    expect(el.dataset.raised).toBe('true');
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await menu([{ id: 'a', label: 'A' }]);
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      expect(shadow(el).querySelector('[part="item"]')).not.toBeNull();
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  it('closes on Escape pressed inside its content and gives focus back to the trigger', async () => {
    const el = await menu([{ id: 'a', label: 'A' }]);
    const trigger = shadow(el).querySelector('[part="trigger"]') as HTMLElement;
    trigger.click();
    await vi.waitFor(() => expect(shadow(el).activeElement?.closest('[data-scope="menu"][data-part="content"]') ?? null).not.toBeNull());
    (shadow(el).querySelector('[part="item"]') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle();
    expect(el.dataset.raised).toBe('false');
    await vi.waitFor(() => expect(shadow(el).activeElement).toBe(trigger));
  });
});
