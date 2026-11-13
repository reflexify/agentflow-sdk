import { describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

async function menu(items: unknown) {
  document.body.innerHTML = '';
  const el = document.createElement('af-menu') as HTMLElement & { items: unknown; label: string; disabled: boolean; reason: string };
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

  const checkable = (sort = 'due', archived = true) => [
    { id: 'rename', label: 'Rename' },
    { id: 'sort', heading: 'Sort by', items: [
      { id: 'due', label: 'Due date', type: 'radio', checked: sort === 'due' },
      { id: 'priority', label: 'Priority', type: 'radio', checked: sort === 'priority' },
    ] },
    { id: 'view', items: [{ id: 'archived', label: 'Show archived', type: 'checkbox', checked: archived }] },
  ];

  async function opened(items: unknown) {
    const el = await menu(items);
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    const picked: unknown[] = [];
    el.addEventListener('select', (e) => picked.push((e as CustomEvent).detail));
    return { el, picked, radio: (id: string) => shadow(el).querySelector(`[role="menuitemradio"][data-value="${id}"]`) as HTMLElement };
  }

  it('draws groups with their heading and separators, and radio and checkbox items with their state', async () => {
    const { el } = await opened(checkable());
    const root = shadow(el);
    expect([...root.querySelectorAll('[part="heading"]')].map((h) => h.textContent?.trim())).toEqual(['Sort by']);
    expect(root.querySelectorAll('[part="group"]')).toHaveLength(2);
    expect(root.querySelectorAll('[part="separator"]')).toHaveLength(2);
    const radios = [...root.querySelectorAll('[role="menuitemradio"]')];
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    const boxes = [...root.querySelectorAll('[role="menuitemcheckbox"]')];
    expect(boxes.map((b) => b.getAttribute('aria-checked'))).toEqual(['true']);
    expect(root.querySelectorAll('[part="indicator"]')).toHaveLength(3);
  });

  it('emits select with checked: true for a radio item once, and moves no check until the page sets it', async () => {
    const { el, picked, radio } = await opened(checkable());
    radio('priority').click();
    await settle();
    expect(picked).toEqual([{ id: 'priority', checked: true }]);
    expect(el.dataset.raised).toBe('false');
    expect(radio('priority').getAttribute('aria-checked')).toBe('false');
    expect(radio('due').getAttribute('aria-checked')).toBe('true');
    (el as unknown as { items: unknown }).items = checkable('priority');
    await settle();
    expect(radio('priority').getAttribute('aria-checked')).toBe('true');
    expect(radio('due').getAttribute('aria-checked')).toBe('false');
  });

  it('emits select with the state a checkbox item would take, and keeps its own until the page sets it', async () => {
    const { el, picked } = await opened(checkable());
    const box = () => shadow(el).querySelector('[role="menuitemcheckbox"]') as HTMLElement;
    box().click();
    await settle();
    expect(picked).toEqual([{ id: 'archived', checked: false }]);
    expect(box().getAttribute('aria-checked')).toBe('true');
    (el as unknown as { items: unknown }).items = checkable('due', false);
    await settle();
    expect(box().getAttribute('aria-checked')).toBe('false');
  });

  it('renders a group whose id an item also has, and selecting the item emits its id', async () => {
    const { el, picked } = await opened([
      { id: 'sort', label: 'Sort' },
      { id: 'sort', heading: 'Sort by', items: [{ id: 'due', label: 'Due date', type: 'radio', checked: true }] },
    ]);
    expect(shadow(el).querySelector('[part="heading"]')?.textContent?.trim()).toBe('Sort by');
    (shadow(el).querySelector('[part="item"][data-value="sort"]') as HTMLElement).click();
    await settle();
    expect(picked).toEqual([{ id: 'sort' }]);
  });

  it('never selects a disabled checkable item, which says why, and selects an enabled one on Enter once', async () => {
    const { el, picked } = await opened([
      { id: 'archived', label: 'Show archived', type: 'checkbox' },
      { id: 'sort', items: [{ id: 'locked', label: 'Locked', type: 'radio', disabled: true, reason: 'Only a manager can sort' }] },
    ]);
    const locked = shadow(el).querySelector('[role="menuitemradio"]') as HTMLElement;
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    expect(locked.getAttribute('aria-description')).toBe('Only a manager can sort');
    expect((locked.closest('af-tooltip') as unknown as { text: string } | null)?.text).toBe('Only a manager can sort');
    locked.click();
    await settle();
    expect(picked).toEqual([]);
    const content = shadow(el).querySelector('[data-scope="menu"][data-part="content"]') as HTMLElement;
    await vi.waitFor(() => expect(shadow(el).activeElement?.closest('[data-scope="menu"][data-part="content"]') ?? null).not.toBeNull());
    for (const key of ['ArrowDown', 'Enter']) content.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
    await settle();
    expect(picked).toEqual([{ id: 'archived', checked: true }]);
  });

  const triggerOf = (el: HTMLElement) => shadow(el).querySelector('[part="trigger"]') as HTMLButtonElement;
  const tipOf = (el: HTMLElement) => triggerOf(el).closest('af-tooltip') as unknown as { text: string } | null;

  it('a disabled menu does not open and says why', async () => {
    const el = await menu([{ id: 'a', label: 'A' }]);
    el.disabled = true;
    el.reason = 'Saving the step';
    await settle();
    expect(el.hasAttribute('disabled')).toBe(true);
    const trigger = triggerOf(el);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.getAttribute('aria-description')).toBe('Saving the step');
    expect(tipOf(el)?.text).toBe('Saving the step');
    trigger.click();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle();
    expect(el.dataset.raised).not.toBe('true');
    expect(shadow(el).querySelector('[data-scope="menu"][data-part="content"]')?.hasAttribute('hidden')).toBe(true);
    expect(triggerOf(el).getAttribute('aria-expanded')).toBe('false');
    el.disabled = false;
    await settle();
    expect(el.hasAttribute('disabled')).toBe(false);
    expect(triggerOf(el).hasAttribute('aria-disabled')).toBe(false);
    expect(triggerOf(el).hasAttribute('aria-description')).toBe(false);
    expect(tipOf(el)).toBeNull();
    triggerOf(el).click();
    await settle();
    expect(el.dataset.raised).toBe('true');
  });

  it('a menu locked while open closes, and stays closed when unlocked', async () => {
    const { el } = await opened([{ id: 'a', label: 'A' }]);
    expect(el.dataset.raised).toBe('true');
    el.disabled = true;
    await settle();
    expect(el.dataset.raised).toBe('false');
    el.disabled = false;
    await settle();
    expect(el.dataset.raised).toBe('false');
  });

  it('a menu locked without a reason is still disabled and draws no tooltip', async () => {
    const el = await menu([{ id: 'a', label: 'A' }]);
    el.disabled = true;
    await settle();
    expect(triggerOf(el).getAttribute('aria-disabled')).toBe('true');
    expect(triggerOf(el).hasAttribute('aria-description')).toBe(false);
    expect(tipOf(el)).toBeNull();
    triggerOf(el).click();
    await settle();
    expect(el.dataset.raised).not.toBe('true');
  });

  it('keeps focus on the trigger when it is locked with a reason', async () => {
    const el = await menu([{ id: 'a', label: 'A' }]);
    triggerOf(el).focus();
    expect(shadow(el).activeElement).toBe(triggerOf(el));
    el.disabled = true;
    el.reason = 'Saving the step';
    await settle();
    expect(tipOf(el)).not.toBeNull();
    await vi.waitFor(() => expect(shadow(el).activeElement).toBe(triggerOf(el)));
  });

  it('an unlocked menu draws its trigger as it did before', async () => {
    const el = await menu([{ id: 'a', label: 'A' }]);
    expect(triggerOf(el).hasAttribute('aria-disabled')).toBe(false);
    expect(tipOf(el)).toBeNull();
    expect(el.hasAttribute('disabled')).toBe(false);
  });

  it('items take their tone, and a danger tone draws as the danger flag does', async () => {
    const { el } = await opened([
      { id: 'ok', label: 'Approve', tone: 'success' },
      { id: 'hold', label: 'Hold', tone: 'warning' },
      { id: 'fyi', label: 'Note', tone: 'info' },
      { id: 'no', label: 'Reject', tone: 'danger' },
      { id: 'old', label: 'Delete', danger: true },
      { id: 'plain', label: 'Open' },
      { id: 'odd', label: 'Odd', tone: 'purple' },
    ]);
    const row = (id: string) => shadow(el).querySelector(`[part="item"][data-value="${id}"]`) as HTMLElement;
    expect(['ok', 'hold', 'fyi'].map((id) => row(id).getAttribute('data-tone'))).toEqual(['success', 'warning', 'info']);
    for (const id of ['ok', 'hold', 'fyi']) expect(row(id).hasAttribute('data-danger'), id).toBe(false);
    expect(row('no').hasAttribute('data-danger')).toBe(true);
    expect(row('no').hasAttribute('data-tone')).toBe(false);
    expect(row('no').getAttributeNames().filter((n) => n.startsWith('data-') && n !== 'data-value')).toEqual(
      row('old').getAttributeNames().filter((n) => n.startsWith('data-') && n !== 'data-value'),
    );
    for (const id of ['plain', 'odd']) {
      expect(row(id).hasAttribute('data-tone'), id).toBe(false);
      expect(row(id).hasAttribute('data-danger'), id).toBe(false);
    }
  });

  it('a tone wins over the danger flag on the same item, and a toned item still selects', async () => {
    const { el, picked } = await opened([{ id: 'ok', label: 'Approve', tone: 'success', danger: true }]);
    const row = shadow(el).querySelector('[part="item"]') as HTMLElement;
    expect(row.getAttribute('data-tone')).toBe('success');
    expect(row.hasAttribute('data-danger')).toBe(false);
    row.click();
    await settle();
    expect(picked).toEqual([{ id: 'ok' }]);
  });

  it('draws nothing for an empty group, neither its separator nor the group', async () => {
    const { el } = await opened([{ id: 'a', label: 'A' }, { id: 'empty', heading: 'Nothing', items: [] }, { id: 'b', label: 'B' }]);
    for (const name of ['separator', 'group', 'heading']) expect(shadow(el).querySelector(`[part="${name}"]`), name).toBeNull();
  });
});

describe('two <af-menu>s', () => {
  it('a press on the second trigger while the first is open closes the first and opens the second', async () => {
    document.body.innerHTML = '';
    const make = (label: string) => {
      const el = document.createElement('af-menu') as HTMLElement & { items: unknown; label: string };
      el.items = [{ id: `${label}-a`, label: `${label} A` }];
      el.label = label;
      el.textContent = '⋯';
      document.body.append(el);
      return el;
    };
    const first = make('First');
    const second = make('Second');
    await settle();
    const triggerOf = (el: HTMLElement) => shadow(el).querySelector('[part="trigger"]') as HTMLButtonElement;
    // A real click: the press first, then focus, then the click.
    const press = (target: HTMLElement) => {
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0, pointerType: 'mouse' }));
      target.focus();
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0, pointerType: 'mouse' }));
      target.click();
    };
    press(triggerOf(first));
    await settle();
    expect(first.dataset.raised).toBe('true');
    press(triggerOf(second));
    await vi.waitFor(() => expect(first.dataset.raised).not.toBe('true'), { timeout: 500 });
    await settle();
    expect(second.dataset.raised).toBe('true');
    expect(triggerOf(second).getAttribute('aria-expanded')).toBe('true');
  });
});
