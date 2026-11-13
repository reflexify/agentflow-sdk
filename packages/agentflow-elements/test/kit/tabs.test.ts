import { describe, expect, it, onTestFinished, vi } from 'vitest';
import '../../src/kit/index.js';
import type { TabItem } from '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type TabsElement = HTMLElement & { items: TabItem[]; value: string | null; label: string | null; variant: string | null };

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'files', label: 'Files' },
];

async function tabs(props: Partial<TabsElement> = {}, items: TabItem[] = ITEMS) {
  document.body.innerHTML = '';
  const el = document.createElement('af-tabs') as TabsElement;
  el.items = items;
  el.value = 'overview';
  Object.assign(el, props);
  el.innerHTML = items.map((i) => `<div slot="${i.value}">${i.label} panel</div>`).join('');
  document.body.append(el);
  await settle();
  const changes: unknown[] = [];
  el.addEventListener('tab-change', (e) => changes.push((e as CustomEvent).detail));
  return { el, changes };
}

const tabParts = (el: Element) => [...shadow(el).querySelectorAll<HTMLButtonElement>('[part~="tab"]')];
// The panel a test sees is the one whose slot holds that value's content and that is not hidden.
const shownPanels = (el: Element) =>
  [...shadow(el).querySelectorAll<HTMLElement>('[part~="panel"]')].filter((p) => !p.hidden).map((p) => p.querySelector('slot')?.getAttribute('name'));

// Zag records the focused tab in a microtask and selects it in the next frame. A browser checks for microtasks after each
// frame callback; jsdom runs a frame's callbacks in one task, so here each callback gets a task of its own.
function framesAsTasks() {
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(performance.now()), 0));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  onTestFinished(() => { vi.unstubAllGlobals(); });
}

// Focus first and let Zag record it, as a key pressed after tabbing in would.
async function pressRight(tab: HTMLElement) {
  tab.focus();
  await settle();
  tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
}

describe('<af-tabs>', () => {
  it('names each tab by its label, selects the value, and shows only that panel', async () => {
    const { el } = await tabs();
    const tabsShown = tabParts(el);
    expect(tabsShown.map((t) => t.textContent?.trim())).toEqual(['Overview', 'Activity', 'Files']);
    expect(tabsShown.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(shownPanels(el)).toEqual(['overview']);
    const panel = shadow(el).querySelector<HTMLElement>('[part~="panel"]:not([hidden])')!;
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tabsShown[0]!.id);
    expect((panel.querySelector('slot') as HTMLSlotElement).assignedNodes().map((n) => n.textContent)).toEqual(['Overview panel']);
  });

  it('asks for a clicked tab with tab-change, and shows it only once the page sets value', async () => {
    const { el, changes } = await tabs();
    tabParts(el)[1]!.click();
    await settle();
    expect(changes).toEqual([{ value: 'activity' }]);
    expect(shownPanels(el)).toEqual(['overview']);
    expect(tabParts(el)[0]!.getAttribute('aria-selected')).toBe('true');
    el.value = 'activity';
    await settle();
    expect(shownPanels(el)).toEqual(['activity']);
    expect(tabParts(el)[1]!.getAttribute('aria-selected')).toBe('true');
    expect(changes).toEqual([{ value: 'activity' }]);
  });

  it('moves focus to the next tab with ArrowRight and asks for it', async () => {
    framesAsTasks();
    const { el, changes } = await tabs();
    const [first, second] = tabParts(el);
    await pressRight(first!);
    await vi.waitFor(() => expect(shadow(el).activeElement).toBe(second));
    await vi.waitFor(() => expect(changes).toEqual([{ value: 'activity' }]));
    await settle();
    expect(changes).toEqual([{ value: 'activity' }]);
  });

  it('under a dir="rtl" ancestor moves to the next tab with ArrowLeft', async () => {
    framesAsTasks();
    document.body.innerHTML = '';
    const page = document.createElement('div');
    page.dir = 'rtl';
    document.body.append(page);
    const el = document.createElement('af-tabs') as TabsElement;
    el.items = ITEMS;
    el.value = 'overview';
    page.append(el);
    await settle();
    const changes: unknown[] = [];
    el.addEventListener('tab-change', (e) => changes.push((e as CustomEvent).detail));
    const [first] = tabParts(el);
    first!.focus();
    await settle();
    first!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
    await vi.waitFor(() => expect(changes).toEqual([{ value: 'activity' }]));
  });

  it.each([
    ['no value', null],
    ['a value no item holds', 'archived'],
    ['the locked item', 'audit'],
  ])('keeps the first enabled tab a tab stop for %s, until value names an enabled item', async (_, value) => {
    framesAsTasks();
    const items: TabItem[] = [{ value: 'audit', label: 'Audit', disabled: true, reason: 'Only admins' }, ...ITEMS];
    const { el, changes } = await tabs({ value }, items);
    const stops = () => tabParts(el).map((t) => t.getAttribute('tabindex'));
    expect(stops()).toEqual(['-1', '0', '-1', '-1']);
    await pressRight(tabParts(el)[1]!);
    await vi.waitFor(() => expect(changes).toEqual([{ value: 'activity' }]));
    el.value = 'files';
    await settle();
    expect(stops()).toEqual(['-1', '-1', '-1', '0']);
  });

  it('puts the variant on the list', async () => {
    const list = (el: Element) => shadow(el).querySelector('[part~="list"]')!;
    expect(list((await tabs()).el).classList.contains('af-tabs')).toBe(true);
    expect(list((await tabs({ variant: 'line' })).el).classList.contains('line')).toBe(true);
    expect(list((await tabs({ variant: 'segmented' })).el).classList.contains('segmented')).toBe(true);
  });

  it('locks a disabled tab, describes it by its reason, and never asks for it', async () => {
    const { el, changes } = await tabs({}, [ITEMS[0]!, { value: 'audit', label: 'Audit', disabled: true, reason: 'Only admins see the audit log' }]);
    const locked = tabParts(el)[1]!;
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    expect(locked.getAttribute('aria-description')).toBe('Only admins see the audit log');
    expect((locked.closest('af-tooltip') as unknown as { text: string }).text).toBe('Only admins see the audit log');
    locked.click();
    await settle();
    expect(changes).toEqual([]);
  });

  it('names the list by label', async () => {
    const { el } = await tabs({ label: 'Record sections' });
    const list = shadow(el).querySelector('[part~="list"]')!;
    expect(list.getAttribute('role')).toBe('tablist');
    expect(list.getAttribute('aria-label')).toBe('Record sections');
  });
});
