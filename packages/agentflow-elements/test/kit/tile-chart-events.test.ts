import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { DRILL, TILE_FIELDS, bucketOf, chartResult, chartTile, measure, revenueResult, uuid } from './fixtures/tile.js';
import { TILE_CASES } from './fixtures/tiles.js';
import type { TileCaseName } from './fixtures/tiles.js';

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
}

const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const plotOf = (el: Element) => part(el, 'plot')!;
// A mark is a button when the tile opens records and an image when it does not; either way it holds the tab stop.
const marksOf = (el: Element) => [...plotOf(el).querySelectorAll<SVGElement>('[data-bucket][tabindex]')];
const tabsOf = (el: Element) => marksOf(el).map((m) => m.getAttribute('tabindex'));
const stripsOf = (el: Element) => [...plotOf(el).querySelectorAll<SVGElement>('.strip')];
const legendOf = (el: Element) => parts(el, 'legend-item') as HTMLButtonElement[];
const live = (el: Element) => el.shadowRoot!.querySelectorAll('[role="status"], [aria-live]');
const heldBy = (el: Element) => el.shadowRoot!.activeElement;

/** Mounts a tile inside another component's shadow root, as a module would. */
function mount(props: Partial<TileElement>) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  return el;
}

const drawn = async (el: Element) => expect.poll(() => part(el, 'plot') !== null, { timeout: 5000 }).toBe(true);
const press = (target: Element, key: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const over = (target: Element) => target.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
const leave = (target: Element) => target.dispatchEvent(new MouseEvent('pointerleave'));

function listen(el: Element) {
  const heard: CustomEvent[] = [];
  el.addEventListener('af-drill', (e) => heard.push(e as CustomEvent));
  return heard;
}

const COLUMN = chartTile('column', [measure(1, { primary: true })], { label: 'Deals by stage' });
const THREE = () => chartResult({ [uuid(1)]: [bucketOf('new', 5, { drill: DRILL }), bucketOf('won', 8), bucketOf('lost', 3)] });
const TWO_MEASURES = chartTile('column', [measure(1, { primary: true }), measure(2, { label: 'Second' })]);
const TWO_RESULT = () =>
  chartResult({ [uuid(1)]: [bucketOf('new', 5), bucketOf('won', 8)], [uuid(2)]: [bucketOf('new', 2), bucketOf('won', 4)] });
const STACKED = chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage' } });
const segments = (...rows: [string, number][]) => rows.map(([key, value]) => bucketOf(key, value, { drill: DRILL }));
const STACK_RESULT = () =>
  chartResult({
    [uuid(1)]: [
      bucketOf('b1', 10, { segments: segments(['new', 5], ['won', 3], ['lost', 2]) }),
      bucketOf('b2', 7, { segments: segments(['new', 4], ['won', 2], ['lost', 1]) }),
    ],
  });

afterEach(() => {
  document.body.innerHTML = '';
});

describe("<af-tile>'s chart interaction", () => {
  it('holds one tab stop, moved by the arrows, with the tooltip of the mark that has it', async () => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    await drawn(el);
    expect(plotOf(el).getAttribute('role')).toBe('group');
    expect(plotOf(el).getAttribute('aria-label'), 'the plot is named by the title').toBe('Deals by stage');
    expect(marksOf(el).map((m) => m.getAttribute('aria-label')), 'each mark says what it is').toEqual(['new, count: 5', 'Closed won, count: 8', 'lost, count: 3']);
    expect(tabsOf(el), 'the first mark takes the tab stop until another is chosen').toEqual(['0', '-1', '-1']);
    expect(live(el), 'a mark says its own label, so no live region says it again').toHaveLength(0);

    marksOf(el)[0]!.focus();
    await expect.poll(() => el.dataset.raised, { message: 'focus shows the tooltip' }).toBe('true');
    expect(words(part(el, 'tooltip'))).toContain('new');
    expect(live(el)).toHaveLength(0);

    press(marksOf(el)[0]!, 'ArrowRight');
    expect(heldBy(el), 'focus moves with the key').toBe(marksOf(el)[1]);
    await expect.poll(() => words(part(el, 'tooltip'))).toContain('Closed won');
    expect(tabsOf(el), 'and so does the tab stop').toEqual(['-1', '0', '-1']);

    press(marksOf(el)[1]!, 'End');
    expect(heldBy(el)).toBe(marksOf(el)[2]);
    press(marksOf(el)[2]!, 'ArrowRight');
    expect(heldBy(el), 'it does not wrap').toBe(marksOf(el)[2]);
    press(marksOf(el)[2]!, 'ArrowDown');
    expect(heldBy(el), 'one series, nowhere to go').toBe(marksOf(el)[2]);
    press(marksOf(el)[2]!, 'Home');
    expect(heldBy(el)).toBe(marksOf(el)[0]);
    await expect.poll(() => tabsOf(el)).toEqual(['0', '-1', '-1']);
    await expect.poll(() => words(part(el, 'tooltip'))).toContain('new');

    const key = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    marksOf(el)[0]!.dispatchEvent(key);
    expect(key.defaultPrevented, 'an arrow never scrolls the page').toBe(true);
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    marksOf(el)[0]!.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
  });

  it('sends af-drill from a mark on Enter, Space or a click, only with the drill attribute', async () => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    const heard = listen(el);
    await drawn(el);
    press(marksOf(el)[0]!, 'Enter');
    marksOf(el)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard, 'without drill nothing opens').toEqual([]);

    el.setAttribute('drill', '');
    await expect.poll(() => marksOf(el)[0]!.hasAttribute('aria-disabled')).toBe(false);
    const detail = { drill: DRILL, measure: uuid(1), bucket: 'new', segment: null, label: 'new', count: 5, other: false, newTab: false };
    press(marksOf(el)[0]!, 'Enter');
    press(marksOf(el)[0]!, ' ');
    marksOf(el)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard.map((e) => e.detail)).toEqual([detail, detail, detail]);
    expect(heard.every((e) => e.type === 'af-drill' && e.bubbles && !e.composed)).toBe(true);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    marksOf(el)[0]!.dispatchEvent(enter);
    expect(enter.defaultPrevented, 'a key that opens is not also a scroll or a click').toBe(true);
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey'] as const)('asks for a new tab when a mark is clicked with %s', async (modifier) => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS, drill: true });
    const heard = listen(el);
    await drawn(el);
    await expect.poll(() => marksOf(el)[0]!.hasAttribute('aria-disabled')).toBe(false);
    const click = (target: Element, init: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));

    click(marksOf(el)[0]!, { [modifier]: true });
    click(stripsOf(el)[0]!, { [modifier]: true });
    expect(heard.map((e) => e.detail.newTab), 'a mark, and the strip beside it').toEqual([true, true]);

    heard.length = 0;
    click(marksOf(el)[0]!);
    click(stripsOf(el)[0]!);
    press(marksOf(el)[0]!, 'Enter');
    press(marksOf(el)[0]!, ' ');
    expect(heard.map((e) => e.detail.newTab), 'a plain click, and the keys').toEqual([false, false, false, false]);
  });

  it('asks for a new tab from a middle click, and from Enter or Space with ctrl, meta or shift held', async () => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS, drill: true });
    const heard = listen(el);
    await drawn(el);
    await expect.poll(() => marksOf(el)[0]!.hasAttribute('aria-disabled')).toBe(false);
    const aux = (target: Element, button: number) => target.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button }));
    const key = (init: KeyboardEventInit) => marksOf(el)[0]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));

    const middle = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 1 });
    marksOf(el)[0]!.dispatchEvent(middle);
    expect(middle.defaultPrevented, 'a middle press starts no autoscroll, as on a link').toBe(true);
    aux(marksOf(el)[0]!, 1);
    aux(stripsOf(el)[0]!, 1);
    expect(heard.map((e) => e.detail.newTab), 'a mark, and the strip beside it').toEqual([true, true]);

    heard.length = 0;
    aux(marksOf(el)[0]!, 2);
    aux(stripsOf(el)[0]!, 2);
    expect(heard, 'a right click is the context menu’s').toEqual([]);

    key({ key: 'Enter', ctrlKey: true });
    key({ key: ' ', metaKey: true });
    key({ key: 'Enter', shiftKey: true });
    expect(heard.map((e) => e.detail.newTab), 'as on a native button').toEqual([true, true, true]);
  });

  it.each([
    ['a line chart’s dot', () => chartTile('line', [measure(1, { primary: true })]), '[data-bucket][tabindex]'],
    ['a pie’s slice', () => chartTile('pie', [measure(1, { primary: true })]), '[data-bucket][tabindex]'],
    ['a bar chart’s bar', () => chartTile('bar', [measure(1, { primary: true })]), '[data-bucket][tabindex]'],
  ])('asks for a new tab from %s as it does from a column', async (_, spec, mark) => {
    const el = mount({ spec: spec(), result: THREE(), fields: TILE_FIELDS, drill: true });
    const heard = listen(el);
    await drawn(el);
    await expect.poll(() => plotOf(el).querySelector(mark)!.hasAttribute('aria-disabled')).toBe(false);
    plotOf(el).querySelector(mark)!.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    plotOf(el).querySelector(mark)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    plotOf(el).querySelector(mark)!.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(heard.map((e) => e.detail.newTab), 'a ctrl click, a plain click and a middle click').toEqual([true, false, true]);
  });

  it('drills the primary mark from a bucket strip, and the segment clicked in a stack', async () => {
    const column = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS, drill: true });
    const heard = listen(column);
    await drawn(column);
    await expect.poll(() => marksOf(column)[0]!.hasAttribute('aria-disabled')).toBe(false);
    expect(stripsOf(column), 'a strip for each bucket').toHaveLength(3);
    expect(stripsOf(column).every((s) => s.getAttribute('aria-hidden') === 'true'), 'they repeat what the marks offer').toBe(true);
    stripsOf(column)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    stripsOf(column)[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard.map((e) => e.detail.bucket), 'the second bucket has nothing to open').toEqual(['new']);

    const stack = mount({ spec: STACKED, result: STACK_RESULT(), fields: TILE_FIELDS, drill: true });
    const stacked = listen(stack);
    await drawn(stack);
    await expect.poll(() => marksOf(stack)[0]!.hasAttribute('aria-disabled')).toBe(false);
    stripsOf(stack)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(stacked, 'a bar of segments is not one thing to open').toEqual([]);
    marksOf(stack)[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(stacked.map((e) => e.detail)).toEqual([{ drill: DRILL, measure: uuid(1), bucket: 'b1', segment: 'won', label: 'b1 · Closed won', count: 3, other: false, newTab: false }]);
  });

  it('marks a mark with nothing to open aria-disabled when the tile opens records, and sends nothing from it', async () => {
    const roles = (el: Element) => marksOf(el).map((m) => m.getAttribute('role'));
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    const heard = listen(el);
    await drawn(el);
    expect(roles(el), 'with no drill on the element none opens, and each mark is an image').toEqual(['img', 'img', 'img']);
    expect(marksOf(el).map((m) => m.getAttribute('aria-disabled'))).toEqual([null, null, null]);

    el.drill = true;
    await expect.poll(() => marksOf(el).map((m) => m.getAttribute('aria-disabled'))).toEqual([null, 'true', 'true']);
    expect(roles(el)).toEqual(['button', 'button', 'button']);
    press(marksOf(el)[1]!, 'Enter');
    marksOf(el)[2]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard).toEqual([]);

    el.spec = chartTile('column', [measure(1, { primary: true })], { drill_disabled: true });
    await expect.poll(() => roles(el), { message: 'a tile whose records link is off opens none' }).toEqual(['img', 'img', 'img']);
    expect(marksOf(el).map((m) => m.getAttribute('aria-disabled'))).toEqual([null, null, null]);
    over(marksOf(el)[0]!);
    await expect.poll(() => words(part(el, 'tooltip'))).toContain('Records link is off for this tile');
  });

  it('isolates a series from the legend, releases it with a second click, and keeps every colour', async () => {
    const el = mount({ spec: TWO_MEASURES, result: TWO_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    const fills = () => marksOf(el).map((m) => m.style.fill);
    const states = () => legendOf(el).map((b) => [b.getAttribute('aria-pressed'), b.getAttribute('aria-label'), b.getAttribute('title')]);
    expect(el.shadowRoot!.querySelectorAll('[part~="legend"]')).toHaveLength(1);
    expect(legendOf(el).map((b) => [b.tagName, b.type, words(b)])).toEqual([['BUTTON', 'button', 'count'], ['BUTTON', 'button', 'Second']]);
    expect(states(), 'a name that holds its series, the same pressed or not').toEqual([['false', 'Show only count', null], ['false', 'Show only Second', null]]);
    const all = ['var(--k-chart-1)', 'var(--k-chart-2)', 'var(--k-chart-1)', 'var(--k-chart-2)'];
    expect(fills()).toEqual(all);

    legendOf(el)[1]!.click();
    await expect.poll(fills).toEqual(['var(--k-chart-2)', 'var(--k-chart-2)']);
    expect(states(), 'the one shown is pressed, keeps its name, and says in its title what a press does').toEqual([['false', 'Show only count', null], ['true', 'Show only Second', 'Show every series']]);
    expect(marksOf(el).map((m) => m.getAttribute('aria-label'))).toEqual(['new, Second: 2', 'Closed won, Second: 4']);

    legendOf(el)[1]!.click();
    await expect.poll(fills).toEqual(all);
    expect(states()).toEqual([['false', 'Show only count', null], ['false', 'Show only Second', null]]);

    legendOf(el)[0]!.click();
    await expect.poll(fills).toEqual(['var(--k-chart-1)', 'var(--k-chart-1)']);
    legendOf(el)[1]!.click();
    await expect.poll(fills, { message: 'another series takes the isolation over' }).toEqual(['var(--k-chart-2)', 'var(--k-chart-2)']);
  });

  it('fades the other series while a legend item is pointed at or focused, and nowhere else', async () => {
    const el = mount({ spec: TWO_MEASURES, result: TWO_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    const opacities = () => marksOf(el).map((m) => m.style.opacity);
    expect(opacities()).toEqual(['1', '1', '1', '1']);
    legendOf(el)[0]!.dispatchEvent(new MouseEvent('pointerenter'));
    await expect.poll(opacities).toEqual(['1', '0.25', '1', '0.25']);
    legendOf(el)[0]!.dispatchEvent(new MouseEvent('pointerleave'));
    await expect.poll(opacities).toEqual(['1', '1', '1', '1']);
    legendOf(el)[1]!.focus();
    await expect.poll(opacities).toEqual(['0.25', '1', '0.25', '1']);
    legendOf(el)[1]!.blur();
    await expect.poll(opacities).toEqual(['1', '1', '1', '1']);

    const css = [...el.shadowRoot!.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/\s+/g, '');
    expect(css, 'the fade is 120 ms').toContain('transition:opacity120ms');
    expect(css, 'and off under reduced motion').toMatch(/prefers-reduced-motion:reduce\)\{[^}]*transition:none/);
  });

  it('draws a legend only for two or more items, and lists the others as plain text', async () => {
    const single = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    await drawn(single);
    expect(parts(single, 'legend'), 'one series is named by the title').toHaveLength(0);

    const target = chartTile('column', [measure(1, { primary: true })]);
    const withTarget = mount({ spec: target, result: chartResult({ [uuid(1)]: [bucketOf('new', 5, { target: 6 }), bucketOf('won', 8)] }), fields: TILE_FIELDS });
    await drawn(withTarget);
    expect(parts(withTarget, 'legend')).toHaveLength(1);
    expect(parts(withTarget, 'legend-item').map((i) => [i.tagName, words(i)]), 'a series alone has nothing to be isolated from').toEqual([['SPAN', 'count'], ['SPAN', 'target']]);
  });

  it('hides the tooltip, releases a series that is gone and clamps the focus when a new result arrives', async () => {
    const el = mount({ spec: STACKED, result: STACK_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    expect(legendOf(el).map((b) => words(b))).toEqual(['new', 'Closed won', 'lost']);

    over(stripsOf(el)[0]!);
    await expect.poll(() => el.dataset.raised).toBe('true');
    el.result = STACK_RESULT();
    await expect.poll(() => el.dataset.raised, { message: 'a mark it was shown at is still there, and it is hidden all the same' }).toBe('false');
    expect(marksOf(el)).toHaveLength(6);

    legendOf(el)[2]!.click();
    await expect.poll(() => marksOf(el).length).toBe(2);
    marksOf(el)[0]!.focus();
    press(marksOf(el)[0]!, 'ArrowRight');
    await expect.poll(() => words(part(el, 'tooltip'))).toContain('b2');
    expect(el.dataset.raised).toBe('true');
    expect(tabsOf(el)).toEqual(['-1', '0']);

    el.result = chartResult({ [uuid(1)]: [bucketOf('b1', 9, { segments: segments(['new', 6], ['won', 3]) })] });
    await expect.poll(() => marksOf(el).length, { message: 'the isolated series is gone, so every series shows' }).toBe(2);
    expect(marksOf(el).map((m) => m.getAttribute('aria-label'))).toEqual(['b1, new: 6', 'b1, Closed won: 3']);
    expect(legendOf(el).map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false']);
    expect(el.dataset.raised, 'the tooltip is hidden').toBe('false');
    expect(tabsOf(el), 'the one tab stop is on a mark that exists, the nearest').toEqual(['-1', '0']);

    el.result = chartResult({ [uuid(1)]: [bucketOf('b1', 9, { segments: segments(['new', 6], ['won', 3]) }), bucketOf('b2', 9, { segments: segments(['new', 6], ['won', 3]) })] });
    await expect.poll(() => marksOf(el).length).toBe(4);
    expect(tabsOf(el), 'the tab stop stays where it was clamped to, and never doubles').toEqual(['-1', '0', '-1', '-1']);
  });

  it('releases the isolation when the series that was alone is gone, whatever new series arrive', async () => {
    const el = mount({ spec: STACKED, result: STACK_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    legendOf(el)[0]!.click();
    await expect.poll(() => marksOf(el).length).toBe(2);
    expect(legendOf(el).map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);

    el.result = chartResult({ [uuid(1)]: [bucketOf('b1', 9, { segments: segments(['won', 4], ['lost', 3], ['maybe', 2]) })] });
    await expect.poll(() => marksOf(el).map((m) => m.getAttribute('aria-label'))).toEqual(['b1, Closed won: 4', 'b1, lost: 3', 'b1, maybe: 2']);
    expect(legendOf(el).map((b) => b.getAttribute('aria-pressed')), 'nothing is pressed, and the new series is not alone').toEqual(['false', 'false', 'false']);
  });

  it('keeps an isolated series that the new result still has', async () => {
    const el = mount({ spec: STACKED, result: STACK_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    legendOf(el)[1]!.click();
    await expect.poll(() => marksOf(el).length).toBe(2);
    el.result = chartResult({ [uuid(1)]: [bucketOf('b1', 9, { segments: segments(['new', 6], ['won', 3]) }), bucketOf('b2', 9, { segments: segments(['new', 6], ['won', 3]) })] });
    await expect.poll(() => marksOf(el).map((m) => m.getAttribute('aria-label'))).toEqual(['b1, Closed won: 3', 'b2, Closed won: 3']);
    expect(legendOf(el).map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true']);

    el.result = chartResult({ [uuid(1)]: [bucketOf('b1', 9, { segments: segments(['won', 3], ['lost', 2], ['maybe', 1]) })] });
    await expect.poll(() => legendOf(el).map((b) => b.getAttribute('aria-pressed')), { message: 'new series arrive hidden: the legend still shows one pressed' }).toEqual(['true', 'false', 'false']);
    expect(marksOf(el).map((m) => m.getAttribute('aria-label'))).toEqual(['b1, Closed won: 3']);
  });

  it('raises the tooltip over a bucket, with its label, and hides it on leaving the plot', async () => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    await drawn(el);
    const tip = () => part(el, 'tooltip')!;
    expect(tip().getAttribute('role')).toBe('tooltip');
    expect(tip().getAttribute('popover')).toBe('manual');
    expect(el.dataset.raised, 'nothing is shown until the pointer is over a bucket').not.toBe('true');

    over(stripsOf(el)[1]!);
    await expect.poll(() => el.dataset.raised).toBe('true');
    expect(words(tip())).toContain('Closed won');
    expect(words(tip())).toContain('8');
    expect(el.shadowRoot!.querySelector('.crosshair'), 'a column chart has no crosshair').toBeNull();

    over(stripsOf(el)[2]!);
    await expect.poll(() => words(tip())).toContain('lost');
    expect(el.dataset.raised).toBe('true');

    over(marksOf(el)[0]!);
    await expect.poll(() => words(tip())).toContain('new');

    leave(plotOf(el));
    await expect.poll(() => el.dataset.raised).toBe('false');
  });

  it("sits a bucket's tooltip at the mark that reaches furthest toward it, not at the first", async () => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(800);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const [x, y, width, height] = ['x', 'y', 'width', 'height'].map((a) => Number(this.getAttribute(a) ?? 0));
      return { x: x!, y: y!, left: x!, top: y!, width: width!, height: height!, right: x! + width!, bottom: y! + height!, toJSON: () => ({}) };
    });
    try {
      const stack = mount({ spec: STACKED, result: STACK_RESULT(), fields: TILE_FIELDS });
      await drawn(stack);
      const tops = marksOf(stack).slice(3, 6).map((m) => Number(m.getAttribute('y')));
      expect(Math.min(...tops), 'the top of the stack is not the first segment').not.toBe(tops[0]);
      over(stripsOf(stack)[1]!);
      await expect.poll(() => (part(stack, 'tooltip') as HTMLElement).style.top).toBe(`${Math.min(...tops) - 8}px`);

      const bar = mount({
        spec: chartTile('bar', [measure(1, { primary: true }), measure(2, { label: 'Second' })]),
        result: chartResult({ [uuid(1)]: [bucketOf('new', 2)], [uuid(2)]: [bucketOf('new', 9)] }),
        fields: TILE_FIELDS,
      });
      await drawn(bar);
      const ends = marksOf(bar).map((m) => Number(m.getAttribute('x')) + Number(m.getAttribute('width')));
      expect(ends[1], 'the second bar is the longer').toBeGreaterThan(ends[0]!);
      over(stripsOf(bar)[0]!);
      await expect.poll(() => (part(bar, 'tooltip') as HTMLElement).style.left).toBe(`${ends[1]! + 8}px`);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('draws a crosshair over a line chart bucket, in the axis token', async () => {
    const spec = chartTile('line', [measure(1, { primary: true })]);
    const el = mount({ spec, result: THREE(), fields: TILE_FIELDS });
    await drawn(el);
    expect(el.shadowRoot!.querySelector('.crosshair')).toBeNull();
    over(stripsOf(el)[1]!);
    await expect.poll(() => el.shadowRoot!.querySelector('.crosshair') !== null).toBe(true);
    const cross = el.shadowRoot!.querySelector<SVGLineElement>('.crosshair')!;
    const dot = plotOf(el).querySelector<SVGCircleElement>('circle[data-bucket="1"]')!;
    expect(cross.style.stroke).toBe('var(--k-chart-axis)');
    expect(cross.getAttribute('x1'), 'at the bucket').toBe(dot.getAttribute('cx'));
    expect(cross.getAttribute('x2')).toBe(cross.getAttribute('x1'));
    expect(el.dataset.raised).toBe('true');
    leave(plotOf(el));
    await expect.poll(() => el.shadowRoot!.querySelector('.crosshair')).toBeNull();
  });

  it('draws a ring for keyboard focus only', async () => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    await drawn(el);
    const css = [...el.shadowRoot!.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/\s+/g, '');
    expect(css, 'every mark that holds the tab stop, a button or an image').toMatch(/\[tabindex\][^{]*:focus-visible\{outline:2pxsolidvar\(--k-primary\)/);
    expect(css, 'a plain focus has no rule of its own').not.toMatch(/\[tabindex\][^{]*:focus[^-]/);
  });

  it('decorative marks let a pointer through to the strip', async () => {
    const rows: [TileCaseName, string[]][] = [
      ['BAR_GROUPED', ['line:target', 'rect:previous']],
      ['LINE', ['g:', 'path:previous', 'path:target', 'path:value', 'text:']],
    ];
    for (const [name, expected] of rows) {
      const el = mount({ ...TILE_CASES[name] });
      await drawn(el);
      const decorative = [...plotOf(el).querySelectorAll<SVGElement>('[aria-hidden="true"], [aria-hidden="true"] *')].filter((e) => !e.classList.contains('strip'));
      const kinds = new Set(decorative.map((e) => `${e.localName}:${e.dataset.kind ?? ''}`));
      expect([...kinds].sort(), `${name} hides what it only decorates`).toEqual(expected);
      for (const mark of decorative) expect(getComputedStyle(mark).pointerEvents, `${name} ${mark.localName} ${mark.dataset.kind ?? ''}`).toBe('none');
    }
  });

  it('a chart removed with its tooltip open leaves data-raised false', async () => {
    const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
    await drawn(el);
    over(marksOf(el)[0]!);
    await expect.poll(() => el.dataset.raised).toBe('true');
    el.result = revenueResult();
    await expect.poll(() => part(el, 'plot'), { message: 'a result with no buckets draws no chart' }).toBeNull();
    await expect.poll(() => el.dataset.raised).toBe('false');
  });

  it("a line chart's filled legend item is a hollow ring, and a bar chart's an outline", async () => {
    const line = mount({
      spec: chartTile('line', [measure(1, { primary: true })]),
      result: chartResult({ [uuid(1)]: [bucketOf('new', 5), bucketOf('won', 0, { count: 0, filled: true }), bucketOf('lost', 3)] }),
      fields: TILE_FIELDS,
    });
    await drawn(line);
    const column = mount({ ...TILE_CASES.COLUMN_STACKED });
    await drawn(column);
    const swatchOf = (el: Element) => legendOf(el).find((item) => words(item).includes('no records'))?.querySelector('.swatch')?.classList.value ?? null;
    expect(swatchOf(line), 'a ring like the hollow dot it stands for').toMatch(/\bhollow\b/);
    expect(swatchOf(line)).not.toMatch(/\boutline\b/);
    expect(swatchOf(column), 'a dashed box like the outline bar').toMatch(/\boutline\b/);
    expect(swatchOf(column)).not.toMatch(/\bhollow\b/);
  });

  describe('the table', () => {
    const live = new Set<{ callback: ResizeObserverCallback; targets: Set<Element> }>();
    const widths = { scroll: 300, client: 300 };

    beforeEach(() => {
      class FakeObserver {
        readonly record = { callback: null as unknown as ResizeObserverCallback, targets: new Set<Element>() };
        constructor(callback: ResizeObserverCallback) {
          this.record.callback = callback;
          live.add(this.record);
        }
        observe(target: Element) {
          this.record.targets.add(target);
        }
        unobserve(target: Element) {
          this.record.targets.delete(target);
        }
        disconnect() {
          live.delete(this.record);
        }
      }
      vi.stubGlobal('ResizeObserver', FakeObserver);
      vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
        return this.getAttribute('part') === 'viewport' ? widths.scroll : 0;
      });
      vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
        return this.getAttribute('part') === 'viewport' ? widths.client : 0;
      });
    });

    afterEach(() => {
      live.clear();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    // The table's own viewport: the frame has one too, around everything the tile draws.
    const regionOf = (el: Element) => el.shadowRoot!.querySelector('[part~="table"]')?.closest<HTMLElement>('[part~="viewport"]') ?? null;
    const resize = (node: Element) => {
      for (const o of [...live]) if (o.targets.has(node)) o.callback([{ target: node } as ResizeObserverEntry], {} as ResizeObserver);
    };
    async function tabled(sizes: { scroll: number; client: number }) {
      Object.assign(widths, sizes);
      const el = mount({ spec: COLUMN, result: THREE(), fields: TILE_FIELDS });
      await drawn(el);
      part(el, 'table-toggle')!.click();
      await expect.poll(() => regionOf(el)).not.toBeNull();
      return el;
    }

    it('the table is a tab stop only when it scrolls', async () => {
      const wide = await tabled({ scroll: 600, client: 300 });
      expect(regionOf(wide)!.tabIndex, 'wider than its box, a keyboard needs it to scroll').toBe(0);
      const fits = await tabled({ scroll: 300, client: 300 });
      expect(regionOf(fits)!.hasAttribute('tabindex'), 'a table that fits is not one more stop').toBe(false);

      const region = regionOf(wide)!;
      Object.assign(widths, { scroll: 300 });
      resize(region);
      expect(region.hasAttribute('tabindex'), 'a resize that makes room takes the stop away').toBe(false);
      Object.assign(widths, { scroll: 600 });
      resize(region);
      expect(region.tabIndex, 'and one that takes the room back brings it back').toBe(0);

      part(wide, 'table-toggle')!.click();
      await expect.poll(() => regionOf(wide)).toBeNull();
      expect([...live].filter((o) => o.targets.has(region)), 'nothing watches a table that is gone').toEqual([]);
    });
  });
});
