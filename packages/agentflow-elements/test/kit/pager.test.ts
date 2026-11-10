import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type PagerElement = HTMLElement & Record<string, unknown>;
const EVENTS = ['prev', 'next', 'more', 'page-size-change'];

async function pager(props: Record<string, unknown>, around = '') {
  document.body.innerHTML = around;
  const el = document.createElement('af-pager') as PagerElement;
  Object.assign(el, props);
  document.body.append(el);
  await settle();
  const heard: { type: string; detail: unknown }[] = [];
  for (const type of EVENTS) el.addEventListener(type, (e) => heard.push({ type, detail: (e as CustomEvent).detail }));
  return { el, heard };
}

const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const rows = (n: number) => `<ul id="list">${'<li>Row</li>'.repeat(n)}</ul>`;

async function click(el: Element, name: string) {
  part(el, name)!.click();
  await settle();
}

describe('<af-pager>', () => {
  it.each([
    ['en', { total: 1240 }, '26–50 of 1,240'],
    ['vi', { total: 1240 }, '26–50 trên 1.240'],
    ['en', {}, '26–50'],
    [null, { total: 1240 }, '26–50 of 1,240'],
  ])('in %s reads the range %j as %s', async (locale, extra, expected) => {
    const { el } = await pager({ hasPrev: true, hasNext: true, rangeStart: 26, rangeEnd: 50, locale, ...extra });
    expect(part(el, 'range')!.textContent!.trim()).toBe(expected);
  });

  it('reads its range, pages and size from attributes', async () => {
    document.body.innerHTML = '<af-pager has-prev has-next range-start="26" range-end="50" total="1240" locale="en"></af-pager>';
    await settle();
    const el = document.querySelector('af-pager')!;
    expect(part(el, 'range')!.textContent!.trim()).toBe('26–50 of 1,240');
    expect(part(el, 'prev')!.hasAttribute('aria-disabled')).toBe(false);
  });

  it('renders nothing while there is neither a page either way nor a range', async () => {
    const { el } = await pager({});
    expect(part(el, 'prev')).toBeNull();
    expect(shadow(el).querySelector('[part]')).toBeNull();
  });

  it('emits prev and next, and nothing from a button locked by busy or by no page its way', async () => {
    const { el, heard } = await pager({ hasPrev: true, hasNext: true, rangeStart: 1, rangeEnd: 25 });
    await click(el, 'prev');
    await click(el, 'next');
    expect(heard).toEqual([{ type: 'prev', detail: {} }, { type: 'next', detail: {} }]);

    el.busy = true;
    await settle();
    for (const name of ['prev', 'next']) {
      expect(part(el, name)!.getAttribute('aria-disabled')).toBe('true');
      expect(part(el, name)!.hasAttribute('disabled')).toBe(false);
      await click(el, name);
    }
    el.busy = false;
    el.hasPrev = false;
    await settle();
    expect(part(el, 'prev')!.getAttribute('aria-disabled')).toBe('true');
    await click(el, 'prev');
    expect(heard).toHaveLength(2);
  });

  it('keeps focus on a button that locks while busy', async () => {
    const { el } = await pager({ hasPrev: true, hasNext: true, rangeStart: 1, rangeEnd: 25 });
    part(el, 'next')!.focus();
    el.busy = true;
    await settle();
    expect(shadow(el).activeElement).toBe(part(el, 'next'));
  });

  it('draws a small af-select over the page sizes whose change emits page-size-change with a number', async () => {
    const strings = { noOptions: 'Trống' };
    const { el, heard } = await pager({ hasNext: true, rangeStart: 1, rangeEnd: 25, pageSize: 25, pageSizes: [25, 50, 100], strings });
    const select = part(el, 'page-size')!.querySelector('af-select') as HTMLElement & { value: unknown; options: unknown; size: unknown; strings: unknown };
    expect(select.strings).toEqual(strings);
    expect(select.size).toBe('sm');
    expect(shadow(select).querySelector('[part="trigger"]')!.getAttribute('data-size')).toBe('sm');
    expect(select.value).toBe('25');
    expect(select.options).toEqual([25, 50, 100].map((n) => ({ value: String(n), label: String(n) })));
    expect(part(el, 'page-size')!.textContent).toContain('Rows per page');
    select.dispatchEvent(new CustomEvent('change', { detail: { value: '50' }, bubbles: true }));
    await settle();
    expect(heard).toEqual([{ type: 'page-size-change', detail: { pageSize: 50 } }]);
  });

  it('draws no page-size control without both the size and the sizes', async () => {
    const { el } = await pager({ hasNext: true, pageSize: 25 });
    expect(part(el, 'page-size')).toBeNull();
  });

  it('in more mode shows how many are shown and emits more, and nothing while busy', async () => {
    const { el, heard } = await pager({ mode: 'more', shown: 50, total: 1240, hasMore: true, locale: 'en' });
    expect(shadow(el).textContent).toContain('Showing 50 of 1,240');
    expect(part(el, 'prev')).toBeNull();
    await click(el, 'more');
    expect(heard).toEqual([{ type: 'more', detail: {} }]);
    expect(part(el, 'more')!.classList.contains('ghost')).toBe(true);

    el.busy = true;
    await settle();
    expect(part(el, 'more')!.querySelector('.af-spinner')).not.toBeNull();
    expect(part(el, 'more')!.getAttribute('aria-disabled')).toBe('true');
    await click(el, 'more');
    expect(heard).toHaveLength(1);
  });

  it('in more mode renders nothing without more to load and without a count', async () => {
    const { el } = await pager({ mode: 'more' });
    expect(shadow(el).querySelector('[part]')).toBeNull();
    const counted = await pager({ mode: 'more', shown: 12 });
    expect(shadow(counted.el).textContent).toContain('Showing 12');
    expect(part(counted.el, 'more')).toBeNull();
  });

  it('after more, announces only the rows that arrived and leaves focus on the button', async () => {
    const { el } = await pager({ mode: 'more', shown: 50, hasMore: true });
    el.shown = 60;
    await settle();
    expect(part(el, 'status')!.textContent).toBe('');
    part(el, 'more')!.focus();
    await click(el, 'more');
    el.shown = 85;
    await settle();
    expect(part(el, 'status')!.getAttribute('role')).toBe('status');
    expect(part(el, 'status')!.textContent).toBe('25 more loaded');
    expect(shadow(el).activeElement).toBe(part(el, 'more'));
  });

  it('with focus-new and controls, moves focus to the first row that arrived', async () => {
    const { el } = await pager({ mode: 'more', shown: 50, hasMore: true, focusNew: true, controls: 'list' }, rows(50));
    await click(el, 'more');
    document.getElementById('list')!.insertAdjacentHTML('beforeend', '<li>Row</li>'.repeat(25));
    el.shown = 75;
    await settle();
    const first = document.querySelectorAll('#list > li')[50] as HTMLElement;
    expect(document.activeElement).toBe(first);
    expect(first.getAttribute('tabindex')).toBe('-1');
    expect(part(el, 'status')!.textContent).toBe('25 more loaded');
  });

  it.each([1, 3])('with focus-new, moves focus to the first of %i rows that arrive before a foot row that stays last', async (arrive) => {
    const group = '<table><tbody id="group"><tr><td>One</td></tr><tr><td>Two</td></tr><tr class="af-table-more"><td>Load more</td></tr></tbody></table>';
    const { el } = await pager({ mode: 'more', shown: 2, hasMore: true, focusNew: true, controls: 'group' }, group);
    part(el, 'more')!.focus();
    await click(el, 'more');
    document.querySelector('.af-table-more')!.insertAdjacentHTML('beforebegin', '<tr class="new"><td>New</td></tr>'.repeat(arrive));
    el.shown = 2 + arrive;
    await settle();
    expect(document.activeElement).toBe(document.querySelector('#group > tr.new'));
  });

  it('announces every Load more as a change of its own, when the page sets shown inside its more listener', async () => {
    const { el } = await pager({ mode: 'more', shown: 20, hasMore: true, locale: 'en' });
    el.addEventListener('more', () => { el.shown = (el.shown as number) + 20; });
    let changes = 0;
    const observer = new MutationObserver((records) => { changes += records.length; });
    observer.observe(part(el, 'status')!, { childList: true, subtree: true, characterData: true });
    for (let press = 0; press < 2; press++) {
      const before = changes;
      await click(el, 'more');
      expect(changes, `press ${press + 1} changed the status`).toBeGreaterThan(before);
      expect(part(el, 'status')!.textContent).toBe('20 more loaded');
    }
    observer.disconnect();
  });

  it.each([
    ['busy rises and falls', { busy: true }, { busy: false }],
    ['has-more turns false', { busy: false }, { hasMore: false }],
  ])('forgets a press whose load ends without rows when %s, so a later growth says nothing', async (_name, during, after) => {
    const { el } = await pager({ mode: 'more', shown: 20, hasMore: true });
    await click(el, 'more');
    Object.assign(el, during);
    await settle();
    Object.assign(el, after);
    await settle();
    el.shown = 25;
    await settle();
    expect(part(el, 'status')!.textContent).toBe('');
  });

  it('keeps a press for a page that never sets busy, until shown grows', async () => {
    const { el } = await pager({ mode: 'more', shown: 20, hasMore: true });
    await click(el, 'more');
    el.shown = 19;
    await settle();
    el.shown = 40;
    await settle();
    expect(part(el, 'status')!.textContent).toBe('20 more loaded');
  });

  it('announces the rows of a press made while shown was unset', async () => {
    const { el } = await pager({ mode: 'more', hasMore: true });
    await click(el, 'more');
    el.shown = 20;
    await settle();
    expect(part(el, 'status')!.textContent).toBe('20 more loaded');
  });

  describe('where focus goes after Load more', () => {
    async function lastPage(props: Record<string, unknown>, arrive = 20) {
      const { el } = await pager({ mode: 'more', shown: 80, total: 100, hasMore: true, ...props }, rows(80) + '<input id="search">');
      part(el, 'more')!.focus();
      await click(el, 'more');
      return {
        el,
        async land(extra: Record<string, unknown> = {}) {
          document.getElementById('list')!.insertAdjacentHTML('beforeend', '<li>Row</li>'.repeat(arrive));
          Object.assign(el, { shown: 80 + arrive, hasMore: false, ...extra });
          await settle();
        },
      };
    }
    const row = (i: number) => document.querySelectorAll('#list > li')[i] as HTMLElement;

    it('to the first new row when the last page removes the focused button and controls names the list', async () => {
      const { land } = await lastPage({ controls: 'list' });
      await land();
      expect(document.activeElement).toBe(row(80));
    });

    it('to the status when the last page removes the focused button and there is no list', async () => {
      const { el, land } = await lastPage({});
      await land();
      expect(shadow(el).activeElement).toBe(part(el, 'status'));
      expect(part(el, 'status')!.getAttribute('tabindex')).toBe('-1');
    });

    it('to the status with focus-new when shown grows but no row arrives in the list', async () => {
      const { el, land } = await lastPage({ controls: 'list', focusNew: true }, 0);
      await land({ shown: 100, hasMore: true });
      expect(shadow(el).activeElement).toBe(part(el, 'status'));
    });

    it.each([
      ['on the Load more button', true],
      ['on the page while the button is still drawn', false],
    ])('nowhere with focus-new when a load ends without rows and focus is %s', async (_name, onButton) => {
      const { el } = await pager({ mode: 'more', shown: 80, hasMore: true, focusNew: true, controls: 'list' }, rows(80));
      part(el, 'more')!.click();
      if (onButton) part(el, 'more')!.focus();
      else (document.activeElement as HTMLElement | null)?.blur();
      Object.assign(el, { busy: true });
      await settle();
      Object.assign(el, { busy: false });
      await settle();
      expect(onButton ? shadow(el).activeElement : document.activeElement).toBe(onButton ? part(el, 'more') : document.body);
      expect(part(el, 'status')!.hasAttribute('tabindex')).toBe(false);
    });

    it('nowhere when the person moved focus elsewhere during the load', async () => {
      const { land } = await lastPage({ controls: 'list', focusNew: true });
      const search = document.getElementById('search') as HTMLInputElement;
      search.focus();
      await land({ hasMore: true });
      expect(document.activeElement).toBe(search);
    });
  });

  it('names the list it pages on every button with controls, by the attribute and by element reflection across the shadow root', async () => {
    const reflected = new WeakMap<Element, Element[] | null>();
    Object.defineProperty(HTMLElement.prototype, 'ariaControlsElements', {
      configurable: true,
      get(this: Element) { return reflected.get(this) ?? null; },
      set(this: Element, value: Element[] | null) { reflected.set(this, value); },
    });
    try {
      const pages = await pager({ hasPrev: true, hasNext: true, controls: 'list' }, rows(1));
      const list = document.getElementById('list');
      for (const name of ['prev', 'next']) {
        expect(part(pages.el, name)!.getAttribute('aria-controls')).toBe('list');
        expect(reflected.get(part(pages.el, name)!), `${name} reaches the list itself`).toEqual([list]);
      }
      const more = await pager({ mode: 'more', hasMore: true, controls: 'list' }, rows(1));
      expect(part(more.el, 'more')!.getAttribute('aria-controls')).toBe('list');
      expect(reflected.get(part(more.el, 'more')!)?.[0]).toBe(document.getElementById('list'));
    } finally {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).ariaControlsElements;
    }
  });
});
