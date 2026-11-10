import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type BulkBar = HTMLElement & { count: number; total: number | null; label: string | null; locale: string | null };
type MenuElement = HTMLElement & { items: { id: string; label: string; disabled?: boolean }[] };

const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
// jsdom has no popover state of its own, so the bar's is read where the kit records it, on the host.
const shown = (el: HTMLElement) => el.dataset.raised === 'true';
const escape = (target: Element) => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));

async function bulkBar(attributes: Record<string, string>, actions: string[] = ['<button type="button">Assign</button>']) {
  document.body.innerHTML = '';
  const el = document.createElement('af-bulk-bar') as BulkBar;
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  el.innerHTML = actions.map((a) => a.replace('<button', '<button slot="actions"')).join('');
  document.body.append(el);
  await settle();
  return el;
}

// A ResizeObserver the test drives, and widths in place of a layout: each slotted action 100px, the overflow menu 32px,
// and everything else, the room the actions have among them, whatever `room` holds.
const observers: { callback: ResizeObserverCallback; targets: Set<Element> }[] = [];
class DrivenResizeObserver {
  private entry: { callback: ResizeObserverCallback; targets: Set<Element> };
  constructor(callback: ResizeObserverCallback) {
    this.entry = { callback, targets: new Set() };
    observers.push(this.entry);
  }
  observe(target: Element) { this.entry.targets.add(target); }
  unobserve(target: Element) { this.entry.targets.delete(target); }
  disconnect() { this.entry.targets.clear(); }
}
let room = 1000;
function layOut() {
  observers.length = 0;
  vi.stubGlobal('ResizeObserver', DrivenResizeObserver);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const width = this.getAttribute('slot') === 'actions' ? 100 : this.localName === 'af-menu' ? 32 : room;
    return new DOMRect(0, 0, width, 32);
  });
}
async function resize(el: Element, width: number) {
  room = width;
  const bar = part(el, 'bar')!;
  for (const o of observers) if (o.targets.has(bar)) o.callback([], o as unknown as ResizeObserver);
  await settle();
}

const FOUR = ['Assign', 'Export', 'Archive', 'Delete'].map((label) => `<button type="button"${label === 'Delete' ? ' aria-disabled="true"' : ''}>${label}</button>`);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  room = 1000;
});

describe('<af-bulk-bar>', () => {
  it('shows nothing and says nothing at zero, and the sentence for a count, a total, a label and in Vietnamese', async () => {
    const none = await bulkBar({ count: '0' });
    expect(shown(none)).toBe(false);
    expect(part(none, 'status')!.textContent).toBe('');

    const three = await bulkBar({ count: '3' });
    expect(shown(three)).toBe(true);
    expect(part(three, 'bar')!.getAttribute('popover')).toBe('manual');
    expect(part(three, 'count')!.textContent).toBe('3');
    expect(part(three, 'status')!.getAttribute('role')).toBe('status');
    expect(part(three, 'status')!.textContent).toBe('3 selected');
    expect(part(three, 'clear')!.textContent?.trim()).toBe('Clear selection');
    expect(shadow(three).activeElement).toBeNull();

    expect(part(await bulkBar({ count: '3', total: '40' }), 'status')!.textContent).toBe('3 of 40 selected');

    const labelled = await bulkBar({ count: '1240', label: 'All 1,240 in Overdue selected' });
    expect(part(labelled, 'status')!.textContent).toBe('All 1,240 in Overdue selected');
    expect(part(labelled, 'text')!.textContent?.trim()).toBe('All 1,240 in Overdue selected');
    expect(part(labelled, 'count')).toBeNull();

    const vi_ = await bulkBar({ count: '1240', total: '5000', locale: 'vi' });
    expect(part(vi_, 'status')!.textContent).toBe('Đã chọn 1.240 trên 5.000');
    expect(part(vi_, 'count')!.textContent).toBe('1.240');
    expect(part(vi_, 'clear')!.textContent?.trim()).toBe('Bỏ chọn');

    vi_.count = 0;
    await settle();
    expect(shown(vi_)).toBe(false);
    expect(part(vi_, 'status')!.textContent).toBe('');
  });

  it('emits clear for the clear button and for Escape on a slotted action, and focus() lands on the first enabled action', async () => {
    const el = await bulkBar({ count: '2' }, ['<button type="button" disabled>Assign</button>', '<button type="button" aria-disabled="true">Run</button>', '<button type="button">Export</button>']);
    const heard: unknown[] = [];
    el.addEventListener('clear', (e) => heard.push((e as CustomEvent).detail));
    part(el, 'clear')!.click();
    escape(el.querySelector('button:last-of-type')!);
    await settle();
    expect(heard).toEqual([{}, {}]);

    el.focus();
    expect(document.activeElement).toBe(el.querySelector('button:last-of-type'));

    const locked = await bulkBar({ count: '2' }, ['<button type="button" disabled>Assign</button>']);
    locked.focus();
    expect(shadow(locked).activeElement).toBe(part(locked, 'clear'));
  });

  it('moves the actions that do not fit into a menu that lists them and clicks the one chosen', async () => {
    layOut();
    const el = await bulkBar({ count: '3' }, FOUR);
    const buttons = [...el.querySelectorAll('button')];
    expect(buttons.filter((b) => b.hasAttribute('data-overflow'))).toEqual([]);

    await resize(el, 260);
    expect(buttons.map((b) => b.hasAttribute('data-overflow'))).toEqual([false, false, true, true]);
    const more = part(el, 'more') as MenuElement;
    expect(more.localName).toBe('af-menu');
    expect(more.items.map((i) => [i.label, !!i.disabled])).toEqual([['Archive', false], ['Delete', true]]);

    const archive = vi.spyOn(buttons[2]!, 'click');
    shadow(more).querySelector<HTMLElement>('[part="trigger"]')!.click();
    await settle();
    expect([...shadow(more).querySelectorAll('[part="item"]')].map((i) => i.textContent?.trim())).toEqual(['Archive', 'Delete']);
    shadow(more).querySelector<HTMLElement>('[part="item"]')!.click();
    await settle();
    expect(archive).toHaveBeenCalledTimes(1);

    await resize(el, 1000);
    expect(buttons.filter((b) => b.hasAttribute('data-overflow'))).toEqual([]);
  });

  it('gives focus back to the page when it empties under a focused action, and closes its open menu', async () => {
    const el = await bulkBar({ count: '2' }, ['<button type="button">Assign</button>', '<button type="button">Export</button>']);
    el.querySelector('button')!.focus();
    expect(document.activeElement).toBe(el.querySelector('button'));
    el.count = 0;
    await settle();
    expect(shown(el)).toBe(false);
    expect(document.activeElement).toBe(document.body);

    layOut();
    const crowded = await bulkBar({ count: '3' }, FOUR);
    await resize(crowded, 260);
    const more = part(crowded, 'more')!;
    shadow(more).querySelector<HTMLElement>('[part="trigger"]')!.click();
    await settle();
    expect(more.dataset.raised).toBe('true');
    crowded.count = 0;
    await settle();
    expect(more.isConnected).toBe(false);
    crowded.count = 3;
    await settle();
    expect(part(crowded, 'more')?.dataset.raised).not.toBe('true');
  });

  it('adds no key listener of its own to document or window, shown, crowded or cleared by Escape', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      layOut();
      const el = await bulkBar({ count: '3' }, FOUR);
      await resize(el, 260);
      shadow(part(el, 'more')!).querySelector<HTMLElement>('[part="trigger"]')!.click();
      await settle();
      escape(el.querySelector('button')!);
      await settle();
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });
});
