import { afterEach, describe, expect, it } from 'vitest';
import type { components } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { chartModel, sliceShares } from '../../src/kit/tile/chart-model.js';
import { layoutPie } from '../../src/kit/tile/layout.js';
import { kitText } from '../../src/kit/text.js';
import { DRILL, TILE_FIELDS, amount, bucketOf, chartResult, chartTile, measure, uuid } from './fixtures/tile.js';
import { BAR_GROUPED, DONUT, FIELDS, PIE } from './fixtures/tiles.js';

type Schemas = components['schemas'];

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
}

const EN = kitText('en');
const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const plotOf = (el: Element) => part(el, 'plot')!;
// A slice is a button when the tile opens records and an image when it does not; either way it holds the tab stop.
const slicesOf = (el: Element) => [...plotOf(el).querySelectorAll<SVGPathElement>('path[data-bucket][tabindex]')];
const tabsOf = (el: Element) => slicesOf(el).map((s) => s.getAttribute('tabindex'));
const buckets = (el: Element) => slicesOf(el).map((s) => Number(s.dataset.bucket));
const legendOf = (el: Element) => parts(el, 'legend-item');
const heldBy = (el: Element) => el.shadowRoot!.activeElement;
// A browser serializes `url(#id)` with quotes, whichever way it was written.
const fillOf = (slice: SVGElement) => slice.style.fill.replace(/^url\(["']?#([^"')]+)["']?\)$/, 'url(#$1)');

function mount(props: Partial<TileElement>) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  return el;
}

const drawn = async (el: Element, name = 'plot') => expect.poll(() => part(el, name) !== null, { timeout: 5000 }).toBe(true);
const press = (target: Element, key: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
const over = (target: Element) => target.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));

const PIE_SPEC = chartTile('pie', [measure(1, { primary: true })], { label: 'Deals by stage' });
const pieOf = (list: Schemas['Bucket'][]) => chartResult({ [uuid(1)]: list });
const build = (spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] = TILE_FIELDS) => chartModel(spec, result, fields, EN, 'en', true);

/** The point a slice's path starts at, and where its group puts the origin. */
function startOf(slice: SVGElement): { x: number; y: number } {
  const first = /^M(-?[\d.]+),(-?[\d.]+)/.exec(slice.getAttribute('d') ?? '')!;
  const origin = /translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/.exec(slice.parentElement!.getAttribute('transform') ?? '')!;
  return { x: Number(first[1]) + Number(origin[1]), y: Number(first[2]) + Number(origin[2]) };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe("<af-tile>'s pie and donut", () => {
  it("draws the primary measure's buckets in the server's order, the folds hatched", async () => {
    const result = pieOf([bucketOf('won', 10), bucketOf('lost', 30), bucketOf('$other', 5), bucketOf('$restricted', 2)]);
    const el = mount({ spec: PIE_SPEC, result, fields: TILE_FIELDS });
    await drawn(el);
    expect(buckets(el), 'never sorted by size').toEqual([0, 1, 2, 3]);

    // 480 x 240 is the fallback box; the pie fills the height less 8 px, and starts at 12 o'clock.
    const start = startOf(slicesOf(el)[0]!);
    expect(start.x).toBeCloseTo(240, 1);
    expect(start.y).toBeCloseTo(120 - 112, 1);

    const ids = [...el.shadowRoot!.querySelectorAll('pattern')].map((p) => p.id);
    expect(ids).toHaveLength(2);
    expect(slicesOf(el).map(fillOf).slice(2)).toEqual([`url(#${ids[0]})`, `url(#${ids[1]})`]);
    expect(slicesOf(el).map((s) => s.style.stroke), 'a surface gap between fills').toEqual(Array(4).fill('var(--k-surface)'));
    expect(slicesOf(el).map((s) => s.getAttribute('stroke-width'))).toEqual(Array(4).fill('2'));
    expect(el.shadowRoot!.querySelectorAll('[fill], [stroke]'), 'no presentation attribute for a colour').toHaveLength(0);
    expect(el.shadowRoot!.querySelectorAll('.strip'), 'the slices are the hit targets').toHaveLength(0);
    expect([...el.shadowRoot!.querySelectorAll('svg line')].filter((l) => !l.closest('pattern')), 'a pie has no axes, targets or crosshair').toHaveLength(0);
  });

  it('draws the primary measure alone, whatever else the tile asks for', () => {
    const spec = chartTile('pie', [measure(1, { primary: true }), measure(2, { label: 'Second' })], { stack_by: { field: 'stage' } });
    const result = chartResult({
      [uuid(1)]: [bucketOf('new', 6, { segments: [bucketOf('won', 4), bucketOf('lost', 2)] }), bucketOf('won', 4)],
      [uuid(2)]: [bucketOf('new', 9), bucketOf('won', 1)],
    });
    const model = build(spec, result);
    expect(model.type).toBe('pie');
    expect(model.series.map((s) => [s.measure, s.segment])).toEqual([[uuid(1), null]]);
    expect(model.stacked).toBe(false);
    expect(model.buckets.map((b) => b.values)).toEqual([[6], [4]]);
    expect(model.slices).toHaveLength(2);
    expect(model.legend.map((item) => item.kind)).toEqual(['slice', 'slice']);
  });

  it("colours a slice by its option, not its rank", async () => {
    const spec = chartTile('pie', [measure(1, { primary: true })], { split_by: { field: 'region' } });
    const el = mount({ spec, result: pieOf([bucketOf('south', 3), bucketOf('north', 5)]), fields: FIELDS });
    await drawn(el);
    expect(slicesOf(el).map(fillOf), 'south is the third option, north the first').toEqual(['var(--k-chart-3)', 'var(--k-chart-1)']);

    el.result = pieOf([bucketOf('south', 3), bucketOf('online', 1)]);
    await expect.poll(() => slicesOf(el).map(fillOf)).toEqual(['var(--k-chart-3)', 'var(--k-chart-4)']);
  });

  it('gives a bucket a slice only where its value is above zero and it was not filled', async () => {
    const rows: [string, Schemas['Bucket'][], number[], (number | null)[]][] = [
      ['zero, negative and missing values', [5, 0, -2, null, 3].map((v, i) => bucketOf(`k${i}`, v)), [0, 4], [0.625, null, null, null, 0.375]],
      ['a filled bucket of zero', [bucketOf('a', 4), bucketOf('b', 0, { filled: true })], [0], [1, null]],
      ['a filled bucket that has a value', [bucketOf('a', 4), bucketOf('b', 7, { filled: true })], [0], [1, null]],
    ];
    for (const [name, list, drawnBuckets, shares] of rows) {
      const result = pieOf(list);
      expect(sliceShares(build(PIE_SPEC, result)), `${name}: shares`).toEqual(shares);
      const el = mount({ spec: PIE_SPEC, result, fields: TILE_FIELDS });
      await drawn(el);
      expect(buckets(el), `${name}: slices`).toEqual(drawnBuckets);
      expect(legendOf(el), `${name}: a legend item for each`).toHaveLength(drawnBuckets.length);
    }

    const none = mount({ spec: PIE_SPEC, result: pieOf([0, -1, null].map((v, i) => bucketOf(`k${i}`, v))), fields: TILE_FIELDS });
    await expect.poll(() => words(part(none, 'state')), { timeout: 5000 }).toBe('No buckets over these records');
    expect(part(none, 'plot')).toBeNull();
    expect(part(none, 'table-toggle'), 'nothing to switch to').toBeNull();
    expect([...none.shadowRoot!.querySelectorAll('path')].filter((p) => p.getAttribute('d')?.includes('NaN'))).toEqual([]);
  });

  it('draws one positive bucket as a full ring', async () => {
    const spec = chartTile('donut', [measure(1, { primary: true })]);
    const el = mount({ spec, result: pieOf([bucketOf('won', 9), bucketOf('new', 0)]), fields: TILE_FIELDS });
    await drawn(el);
    const [ring] = slicesOf(el);
    expect(slicesOf(el)).toHaveLength(1);
    const d = ring!.getAttribute('d')!;
    expect(d).not.toContain('NaN');
    // An outer circle and, wound the other way, the hole: 55% of 112.
    expect([...d.matchAll(/M0,(-[\d.]+)/g)].map((m) => Number(m[1]))).toEqual([-112, -61.6]);
    expect(legendOf(el).map((item) => words(item))).toEqual(['Closed won 9 · 100%']);
  });

  it("makes a donut's hole 55% of its radius", () => {
    const model = (type: 'pie' | 'donut') => build(chartTile(type, [measure(1, { primary: true })]), pieOf([bucketOf('won', 3), bucketOf('new', 1)]));
    const rows: [string, 'pie' | 'donut', { width: number; height: number }, { cx: number; cy: number; outer: number; inner: number }][] = [
      ['a donut', 'donut', { width: 300, height: 200 }, { cx: 150, cy: 100, outer: 92, inner: 0.55 * 92 }],
      ['a pie has no hole', 'pie', { width: 300, height: 200 }, { cx: 150, cy: 100, outer: 92, inner: 0 }],
      ['the narrow side decides', 'donut', { width: 100, height: 400 }, { cx: 50, cy: 200, outer: 42, inner: 0.55 * 42 }],
      ['no room', 'donut', { width: 10, height: 10 }, { cx: 5, cy: 5, outer: 0, inner: 0 }],
      ['no box', 'donut', { width: 0, height: 0 }, { cx: 0, cy: 0, outer: 0, inner: 0 }],
      ['a box that is not a number', 'donut', { width: Number.NaN, height: Number.NaN }, { cx: 0, cy: 0, outer: 0, inner: 0 }],
    ];
    for (const [name, type, size, expected] of rows) {
      const layout = layoutPie(model(type), size);
      expect({ cx: layout.cx, cy: layout.cy, outer: layout.outer, inner: layout.inner }, name).toEqual(expected);
      expect(layout.slices.map((s) => s.bucket), name).toEqual([0, 1]);
      expect(layout.slices.some((s) => s.d.includes('NaN')), `${name}: no NaN in a path`).toBe(false);
    }
  });

  it("names each slice in the legend with its value and share, and the legend is not a toggle", async () => {
    const el = mount({ ...PIE, drill: true });
    await drawn(el);
    const items = legendOf(el);
    expect(items.map((i) => i.tagName)).toEqual(Array(5).fill('SPAN'));
    expect(items.map((i) => words(i))).toEqual(['Closed won 42 · 60%', 'Qualified 14 · 20%', 'Lost 7 · 10%', '(Other) 4 · 6%', '(Restricted) 3 · 4%']);
    expect(el.shadowRoot!.querySelectorAll('[part="legend"] button, [aria-pressed]'), 'hiding a slice would change the whole').toHaveLength(0);

    const tones = items.map((i) => i.querySelector<HTMLElement>('.swatch')!.style.getPropertyValue('--tone'));
    expect(tones.slice(0, 3), 'the colour of the slice it names').toEqual(slicesOf(el).slice(0, 3).map(fillOf));
    expect(items.slice(3).map((i) => i.querySelector('.swatch')!.classList.contains('other') || i.querySelector('.swatch')!.classList.contains('restricted'))).toEqual([true, true]);

    expect(slicesOf(el).map((s) => s.getAttribute('aria-label'))).toEqual([
      'Closed won: 42 (60%)', 'Qualified: 14 (20%)', 'Lost: 7 (10%)', '(Other): 4 (6%)', '(Restricted): 3 (4%)',
    ]);
    const donut = mount({ ...DONUT });
    await drawn(donut);
    expect(legendOf(donut).map((i) => words(i)), 'a value in the measure\'s own format').toEqual([
      'North $520,000 · 35%', 'Central $410,000 · 28%', 'South $360,000 · 24%', 'Online $190,000 · 13%',
    ]);
  });

  it('holds one tab stop, and the arrows step through the slices without wrapping', async () => {
    const result = pieOf([bucketOf('new', 5, { drill: DRILL }), bucketOf('lost', 0), bucketOf('won', 8), bucketOf('x', 3, { drill: DRILL })]);
    const el = mount({ spec: PIE_SPEC, result, fields: TILE_FIELDS });
    await drawn(el);
    expect(buckets(el), 'a bucket with no slice is not a stop').toEqual([0, 2, 3]);
    expect(tabsOf(el)).toEqual(['0', '-1', '-1']);
    expect(slicesOf(el).map((s) => s.dataset.series)).toEqual(['0', '0', '0']);

    slicesOf(el)[0]!.focus();
    const steps: [string, number][] = [
      ['ArrowRight', 1], ['ArrowDown', 2], ['ArrowDown', 2], ['ArrowLeft', 1], ['ArrowUp', 0], ['ArrowUp', 0], ['ArrowLeft', 0], ['End', 2], ['ArrowRight', 2], ['Home', 0],
    ];
    for (const [key, at] of steps) {
      press(heldBy(el)!, key);
      expect(heldBy(el), key).toBe(slicesOf(el)[at]);
    }
    await expect.poll(() => tabsOf(el)).toEqual(['0', '-1', '-1']);
    press(heldBy(el)!, 'End');
    await expect.poll(() => tabsOf(el)).toEqual(['-1', '-1', '0']);
    expect(heldBy(el)!.getAttribute('aria-label'), 'the slice reads its own value and share').toBe('x: 3 (19%)');

    const arrow = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    heldBy(el)!.dispatchEvent(arrow);
    expect(arrow.defaultPrevented, 'an arrow never scrolls the page').toBe(true);
  });

  it('records an af-drill on Enter, Space or a click, for a slice that has an address', async () => {
    const result = pieOf([bucketOf('new', 5, { drill: DRILL }), bucketOf('won', 8)]);
    const el = mount({ spec: PIE_SPEC, result, fields: TILE_FIELDS });
    const heard: CustomEvent[] = [];
    el.addEventListener('af-drill', (e) => heard.push(e as CustomEvent));
    await drawn(el);
    press(slicesOf(el)[0]!, 'Enter');
    expect(heard, 'without the drill attribute nothing opens').toEqual([]);

    el.setAttribute('drill', '');
    await expect.poll(() => slicesOf(el)[0]!.hasAttribute('aria-disabled')).toBe(false);
    expect(slicesOf(el)[1]!.getAttribute('aria-disabled'), 'a slice with no address opens nothing').toBe('true');
    press(slicesOf(el)[0]!, 'Enter');
    press(slicesOf(el)[0]!, ' ');
    slicesOf(el)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    press(slicesOf(el)[1]!, 'Enter');
    const detail = { drill: DRILL, measure: uuid(1), bucket: 'new', segment: null, label: 'new', count: 5, other: false, newTab: false };
    expect(heard.map((e) => e.detail)).toEqual([detail, detail, detail]);
  });

  it("says a slice's value and share in its tooltip, and the earlier period and target when it has them", async () => {
    const rowsOf = (el: Element) => [...part(el, 'tooltip')!.querySelectorAll('.row')].map((r) => [words(r.querySelector('.name')), words(r.querySelector('.value'))]);

    const plain = mount({ spec: PIE_SPEC, result: pieOf([bucketOf('won', 42), bucketOf('new', 28)]), fields: TILE_FIELDS });
    await drawn(plain);
    over(slicesOf(plain)[0]!);
    await expect.poll(() => plain.dataset.raised).toBe('true');
    expect(words(part(plain, 'tooltip')!.querySelector('.title'))).toBe('Closed won');
    expect(rowsOf(plain)).toEqual([['count', '42'], ['share', '60%']]);

    const spec = chartTile('pie', [measure(1, { primary: true })], { transform: { target: { kind: 'constant', value: 50 } } });
    const result = pieOf([
      bucketOf('won', 42, { drill: DRILL, target: 50, comparison: { previous: 30, difference: 12, percent_change: 0.4 } }),
      bucketOf('new', 28, { target: 30, comparison: { previous: 30, difference: -2, percent_change: -0.0667 } }),
    ]);
    const full = mount({ spec, result, fields: TILE_FIELDS, drill: true });
    await drawn(full);
    over(slicesOf(full)[0]!);
    await expect.poll(() => full.dataset.raised).toBe('true');
    expect(rowsOf(full)).toEqual([['count', '42'], ['share', '60%'], ['target', '50'], ['earlier period', '30'], ['difference', '+40%']]);
    expect(words(part(full, 'tooltip')!.querySelector('.hint')), "the slice's own address, since a pie has no strip").toBe('Click to open 42 records');
    expect(part(full, 'tooltip')!.querySelector('.swatch')!.classList.contains('box'), 'a pie slice is a box').toBe(true);
  });

  it("tables the buckets: the split, the measure, the share, then the earlier period, its difference and the target", async () => {
    const readTable = async (el: Element) => {
      (part(el, 'table-toggle') as HTMLButtonElement).click();
      await drawn(el, 'table');
      const table = part(el, 'table')!;
      return {
        head: [...table.querySelectorAll('thead th')].map((h) => words(h)),
        rows: [...table.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => words(c))),
      };
    };

    const plain = mount({ spec: PIE_SPEC, result: pieOf([bucketOf('won', 6), bucketOf('new', 0), bucketOf('lost', -2), bucketOf('x', null), bucketOf('y', 2)]), fields: TILE_FIELDS });
    await drawn(plain);
    expect(await readTable(plain)).toEqual({
      head: ['Stage', 'count', 'share'],
      rows: [['Closed won', '6', '75%'], ['new', '0', '—'], ['lost', '-2', '—'], ['x', '—', '—'], ['y', '2', '25%']],
    });

    const result = pieOf([
      bucketOf('won', 6, { target: 5, comparison: { previous: 3, difference: 3, percent_change: 1 } }),
      bucketOf('new', 2, { target: 4, comparison: { previous: null, difference: null, percent_change: null } }),
    ]);
    const full = mount({ spec: chartTile('pie', [measure(1, { primary: true })], { transform: { target: { kind: 'constant', value: 4 } } }), result, fields: TILE_FIELDS });
    await drawn(full);
    expect(await readTable(full)).toEqual({
      head: ['Stage', 'count', 'share', 'earlier period', 'difference', 'target'],
      rows: [['Closed won', '6', '75%', '3', '+100%', '5'], ['new', '2', '25%', '—', 'new', '4']],
    });
  });

  it('changes bars into a pie on the same element, dropping what the bars held, the focus too', async () => {
    const el = mount({ ...BAR_GROUPED, drill: true });
    await drawn(el);
    (legendOf(el)[1] as HTMLButtonElement).click();
    await expect.poll(() => el.shadowRoot!.querySelectorAll('[part="plot"] [role="button"]').length, { message: 'Forecast alone' }).toBe(4);
    // A bucket past the first, so a focus kept by its index would land on a slice other than the first.
    const bar = el.shadowRoot!.querySelector<SVGElement>('[part="plot"] [role="button"][data-bucket="2"]')!;
    bar.focus();
    over(bar);
    await expect.poll(() => el.dataset.raised).toBe('true');
    expect(bar.getAttribute('tabindex'), 'the bar held the tab stop').toBe('0');

    const spec = chartTile('pie', [amount(31, { primary: true, label: 'Booked' }), amount(32, { label: 'Forecast' })], { split_by: { field: 'region' } });
    const result = chartResult({ [uuid(31)]: ['north', 'central', 'south', 'online'].map((key, i) => bucketOf(key, 40 - i * 10)) });
    Object.assign(el, { spec, result });
    await expect.poll(() => slicesOf(el).length).toBe(4);
    expect(tabsOf(el), 'the tab stop is on the first slice').toEqual(['0', '-1', '-1', '-1']);
    await expect.poll(() => el.dataset.raised, { message: 'no tooltip stays open' }).toBe('false');
    expect(legendOf(el).map((i) => i.tagName), 'the isolation is gone with the series').toEqual(Array(4).fill('SPAN'));
    expect(legendOf(el).map((i) => words(i))).toEqual(['North $40 · 40%', 'Central $30 · 30%', 'South $20 · 20%', 'Online $10 · 10%']);
  });
});
