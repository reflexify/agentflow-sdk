import { describe, expect, it, vi } from 'vitest';
import type { PickerPage, PickerQuery, PickerSource } from '@reflexify/agentflow-sdk';
import '../../src/kit/index.js';
import type { TreeNode } from '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

// Twelve nodes in three levels: three regions, two offices each, and one team under the first office of each region.
const NODES: TreeNode[] = [
  { id: 'hq', parentId: null, label: 'HQ', code: 'HQ' },
  { id: 'central', parentId: null, label: 'Central' },
  { id: 'west', parentId: null, label: 'West' },
  { id: 'north', parentId: 'hq', label: 'North', code: 'N' },
  { id: 'south', parentId: 'hq', label: 'South' },
  { id: 'dn', parentId: 'central', label: 'Đà Nẵng office' },
  { id: 'hue', parentId: 'central', label: 'Huế office', archived: true },
  { id: 'ct', parentId: 'west', label: 'Cần Thơ office', disabled: true, reason: 'Closed for refit' },
  { id: 'lx', parentId: 'west', label: 'Long Xuyên' },
  { id: 'sales', parentId: 'north', label: 'Sales', code: 'NS-1' },
  { id: 'support', parentId: 'dn', label: 'Support' },
  { id: 'store', parentId: 'ct', label: 'Warehouse' },
];
type TreeEl = HTMLElement & { nodes: unknown; source: unknown; value: unknown; multiple: boolean; max?: number; locale?: string };

async function picker(props: Record<string, unknown>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-tree-picker') as TreeEl;
  Object.assign(el, { nodes: NODES }, props);
  document.body.append(el);
  await settle();
  return el;
}
const input = (el: HTMLElement) => shadow(el).querySelector('[part~="input"]') as HTMLInputElement;
async function typeInto(el: HTMLElement, text: string) {
  input(el).focus();
  input(el).value = text;
  input(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await settle();
}
async function openTree(el: HTMLElement) {
  input(el).focus();
  input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
  await settle();
}
const rows = (el: HTMLElement) => [...shadow(el).querySelectorAll<HTMLElement>('[part~="node"]')];
const row = (el: HTMLElement, id: string) => rows(el).find((r) => r.dataset.value === id)!;
// A row shows when nothing around it is hidden.
const shownIds = (el: HTMLElement) => rows(el).filter((r) => !r.closest('[hidden]')).map((r) => r.dataset.value);
const heard = (el: HTMLElement, type = 'change') => {
  const seen: unknown[] = [];
  el.addEventListener(type, (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe('<af-tree-picker>', () => {
  it('opens with the roots open and the deeper branches closed', async () => {
    const el = await picker({ value: null });
    await openTree(el);
    expect(el.dataset.raised).toBe('true');
    expect(shownIds(el)).toEqual(['hq', 'north', 'south', 'central', 'dn', 'hue', 'west', 'ct', 'lx']);
    expect(row(el, 'hq').closest('[role="treeitem"]')!.getAttribute('aria-expanded')).toBe('true');
    expect(row(el, 'north').closest('[role="treeitem"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows a matching leaf with its ancestors and nothing else, and restores the opened branches when cleared', async () => {
    const el = await picker({ value: null });
    const searches = heard(el, 'search');
    await typeInto(el, 'sal');
    expect(shownIds(el)).toEqual(['hq', 'north', 'sales']);
    expect(searches).toEqual([{ query: 'sal' }]);
    await typeInto(el, '');
    expect(shownIds(el)).toEqual(['hq', 'north', 'south', 'central', 'dn', 'hue', 'west', 'ct', 'lx']);
  });

  it('shows a deeper node’s ancestry and code, and says when nothing matches', async () => {
    const el = await picker({ value: null });
    await typeInto(el, 'ns-1');
    expect(row(el, 'sales').querySelector('[part~="ancestry"]')!.textContent).toBe('HQ › North');
    expect(row(el, 'sales').querySelector('[part~="code"]')!.textContent).toBe('NS-1');
    expect(row(el, 'hq').querySelector('[part~="ancestry"]')).toBeNull();
    await typeInto(el, 'zzz');
    expect(shownIds(el)).toEqual([]);
    expect(shadow(el).querySelector('[part~="empty"]')!.textContent).toBe('No matches');
  });

  it('emits change once for a clicked leaf and shows the old value until the page sets the new one', async () => {
    const el = await picker({ value: 'south' });
    const seen = heard(el);
    await typeInto(el, 'sal');
    row(el, 'sales').click();
    await settle();
    expect(seen).toEqual([{ value: 'sales' }]);
    expect(el.dataset.raised).toBe('false');
    expect(input(el).value).toBe('South');
    el.value = 'sales';
    await settle();
    expect(input(el).value).toBe('Sales');
  });

  it('picks a branch alone, never what is under it', async () => {
    const el = await picker({ value: [], multiple: true });
    const seen = heard(el);
    await openTree(el);
    row(el, 'hq').click();
    await settle();
    expect(seen).toEqual([{ value: ['hq'] }]);
  });

  it('with multiple and max, stays open, draws chips and disables the rest at max with the reason', async () => {
    const el = await picker({ value: ['north'], multiple: true, max: 2 });
    const seen = heard(el);
    el.addEventListener('change', (e) => (el.value = (e as CustomEvent<{ value: string[] }>).detail.value));
    await openTree(el);
    expect(row(el, 'north').querySelector('[part~="check"]')).not.toBeNull();
    row(el, 'south').click();
    await settle();
    expect(seen).toEqual([{ value: ['north', 'south'] }]);
    expect(el.dataset.raised).toBe('true');
    expect([...shadow(el).querySelectorAll('[part~="chip"]')].map((c) => c.textContent?.trim())).toEqual(['North', 'South']);
    expect(row(el, 'dn').getAttribute('aria-disabled')).toBe('true');
    expect(row(el, 'dn').getAttribute('aria-description')).toBe('At most 2');
    row(el, 'dn').click();
    await settle();
    expect(seen).toHaveLength(1);
    row(el, 'north').click();
    await settle();
    expect(seen.at(-1)).toEqual({ value: ['south'] });
  });

  it('mutes an archived node with its chip, and keeps a disabled node unpickable with its reason', async () => {
    const el = await picker({ value: null });
    const seen = heard(el);
    await openTree(el);
    expect(row(el, 'hue').querySelector('[part~="archived"]')!.textContent).toBe('Archived');
    expect(row(el, 'dn').querySelector('[part~="archived"]')).toBeNull();
    expect(row(el, 'ct').getAttribute('aria-disabled')).toBe('true');
    expect(row(el, 'ct').getAttribute('aria-description')).toBe('Closed for refit');
    expect((row(el, 'ct').closest('af-tooltip') as unknown as { text: string }).text).toBe('Closed for refit');
    row(el, 'ct').click();
    await settle();
    expect(seen).toEqual([]);
    el.setAttribute('locale', 'vi');
    await settle();
    expect(row(el, 'hue').querySelector('[part~="archived"]')!.textContent).toBe('Đã lưu trữ');
  });

  it('picks with the keyboard: ArrowDown from the input enters the tree, Enter picks, Escape goes back to the input', async () => {
    const el = await picker({ value: null });
    const seen = heard(el);
    await openTree(el);
    await openTree(el);
    (shadow(el).activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle();
    expect(el.dataset.raised).toBe('false');
    expect(shadow(el).activeElement).toBe(input(el));
    await typeInto(el, 'sal');
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle();
    const focused = shadow(el).activeElement as HTMLElement;
    expect(focused.matches('[part~="node"]')).toBe(true);
    for (let i = 0; i < 2; i++) {
      (shadow(el).activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      await settle();
    }
    (shadow(el).activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle();
    expect(seen).toEqual([{ value: 'sales' }]);
  });

  // Zag's typeahead takes a Space as part of the text being typed, so "Ha N" must not pick a node at the space. It forgets what
  // was typed 350 ms after the last key, so the timers are the test's to move.
  it('picks with Enter always, and with Space only when no typeahead is running', async () => {
    const el = await picker({ value: [], multiple: true });
    const seen = heard(el);
    await openTree(el);
    const press = (id: string, key: string) => row(el, id).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }));
    press('south', ' ');
    expect(seen).toEqual([{ value: ['south'] }]);

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      press('north', 'h');
      press('north', ' ');
      press('north', 'a');
      press('north', ' ');
      expect(seen).toHaveLength(1);
      press('north', 'Enter');
      expect(seen).toEqual([{ value: ['south'] }, { value: ['north'] }]);
      // The space between two typed words keeps the typeahead going, so the window runs from the last key.
      vi.advanceTimersByTime(300);
      press('north', ' ');
      expect(seen).toHaveLength(2);
      vi.advanceTimersByTime(400);
      press('north', ' ');
      expect(seen).toEqual([{ value: ['south'] }, { value: ['north'] }, { value: ['north'] }]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('asks its source for every page of the empty query on open, and nothing more as the person types', async () => {
    const calls: { query: PickerQuery; answer: ReturnType<typeof deferred<PickerPage<TreeNode>>> }[] = [];
    const source = vi.fn((query: PickerQuery) => {
      const answer = deferred<PickerPage<TreeNode>>();
      calls.push({ query, answer });
      return answer.promise;
    }) as unknown as PickerSource<TreeNode>;
    const el = await picker({ nodes: [], source, value: null });
    expect(calls).toHaveLength(0);
    await openTree(el);
    expect(shadow(el).querySelector('[part~="loading"]')).not.toBeNull();
    expect(calls.map((c) => c.query.cursor)).toEqual([null]);
    calls[0]!.answer.resolve({ items: NODES.slice(0, 6), next: 'p2' });
    await settle();
    expect(calls.map((c) => [c.query.q, c.query.cursor])).toEqual([['', null], ['', 'p2']]);
    calls[1]!.answer.resolve({ items: NODES.slice(6), next: null });
    await settle();
    expect(calls).toHaveLength(2);
    expect(shadow(el).querySelector('[part~="loading"]')).toBeNull();
    await typeInto(el, 'sal');
    await new Promise((r) => setTimeout(r, 300));
    await settle();
    expect(calls).toHaveLength(2);
    expect(shownIds(el)).toEqual(['hq', 'north', 'sales']);
  });

  it('keeps drawing the last whole forest on reopen until the new load has every page', async () => {
    const calls: { query: PickerQuery; answer: ReturnType<typeof deferred<PickerPage<TreeNode>>> }[] = [];
    const source = ((query: PickerQuery) => {
      const answer = deferred<PickerPage<TreeNode>>();
      calls.push({ query, answer });
      return answer.promise;
    }) as PickerSource<TreeNode>;
    const el = await picker({ nodes: [], source, value: null });
    const answer = async (i: number, items: TreeNode[], next: string | null) => {
      calls[i]!.answer.resolve({ items, next });
      await settle();
    };
    await openTree(el);
    await answer(0, NODES.slice(0, 6), 'p2');
    await answer(1, NODES.slice(6), null);
    const whole = rows(el).map((r) => r.dataset.value);
    expect(whole).toHaveLength(NODES.length);

    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle();
    expect(el.dataset.raised).toBe('false');
    await openTree(el);
    expect(calls.map((c) => c.query.cursor)).toEqual([null, 'p2', null]);
    await answer(2, NODES.slice(0, 6), 'p2');
    expect(calls.map((c) => c.query.cursor)).toEqual([null, 'p2', null, 'p2']);
    expect(rows(el).map((r) => r.dataset.value)).toEqual(whole);
  });

  it('asks resolve to name a chosen id the forest does not hold', async () => {
    const resolve = vi.fn(async () => [{ id: 'old', parentId: null, label: 'Old office', archived: true }]);
    const source = Object.assign(async () => ({ items: NODES, next: null }), { resolve }) as PickerSource<TreeNode>;
    const el = await picker({ nodes: [], source, value: 'old' });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect((resolve.mock.calls[0] as unknown[])[0]).toEqual(['old']);
    expect(input(el).value).toBe('Old office');
  });

  it('shows an id nothing names as unknown, never the raw id', async () => {
    const el = await picker({ value: ['north', 'gone'], multiple: true });
    expect([...shadow(el).querySelectorAll('[part~="chip"]')].map((c) => c.textContent?.trim())).toEqual(['North', 'Unknown value']);
  });

  it('says it has nothing to choose from with no nodes', async () => {
    const el = await picker({ nodes: [], value: null });
    await openTree(el);
    expect(shadow(el).querySelector('[part~="empty"]')!.textContent).toBe('Nothing to choose from');
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await picker({ value: null });
      await openTree(el);
      await typeInto(el, 'h');
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  describe('in a form', () => {
    type Recorded = { __value?: unknown; __validity?: ValidityStateFlags };
    type FormTree = TreeEl & { internals: Recorded };

    it('submits the id, or each id under its name, as value says', async () => {
      const el = (await picker({ name: 'unit', value: 'north' })) as FormTree;
      expect(el.internals.__value).toBe('north');
      el.value = 'south';
      await settle();
      expect(el.internals.__value).toBe('south');
      const many = (await picker({ name: 'units', multiple: true, value: ['north', 'sales'] })) as FormTree;
      expect([...(many.internals.__value as FormData)]).toEqual([['units', 'north'], ['units', 'sales']]);
    });

    it('is missing a value when required and empty', async () => {
      const el = (await picker({ required: true, value: null })) as FormTree;
      expect(el.internals.__validity).toEqual({ valueMissing: true });
    });
  });
});
