import { afterEach, describe, expect, it } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { DRILL, TILE_FIELDS, bucketOf, chartResult, chartTile, measure, numberTile, tileResult, uuid } from './fixtures/tile.js';

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
}

const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const svgOf = (el: Element) => el.shadowRoot!.querySelector('svg')!;
const marksOf = (el: Element) => [...part(el, 'plot')!.querySelectorAll<SVGElement>('[data-kind]')];

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

const drawn = async (el: Element, name = 'plot') => expect.poll(() => part(el, name) !== null, { timeout: 5000 }).toBe(true);

const COLUMN = chartTile('column', [measure(1, { primary: true })], { label: 'Deals by stage' });
const COLUMN_RESULT = () => chartResult({ [uuid(1)]: [bucketOf('new', 5, { drill: DRILL }), bucketOf('won', 8)] });

afterEach(() => {
  document.body.innerHTML = '';
});

describe("<af-tile>'s bars and columns", () => {
  it('draws a column chart with token colours through style, never an attribute', async () => {
    const el = mount({ spec: COLUMN, result: COLUMN_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    const marks = marksOf(el);
    expect(marks.map((m) => m.dataset.kind)).toEqual(['value', 'value']);
    expect(marks.map((m) => (m as SVGElement).style.fill)).toEqual(['var(--k-chart-1)', 'var(--k-chart-1)']);
    expect(svgOf(el).querySelectorAll('[fill], [stroke]'), 'no presentation attribute for a colour').toHaveLength(0);

    const lines = [...svgOf(el).querySelectorAll('line')].map((l) => l.style.stroke);
    expect(lines, 'grid lines and axis lines in their tokens').toContain('var(--k-chart-grid)');
    expect(lines).toContain('var(--k-chart-axis)');
    expect([...svgOf(el).querySelectorAll('text')].map((t) => words(t)), 'the category labels, by option label').toEqual(expect.arrayContaining(['new', 'Closed won']));
    expect(svgOf(el).getAttribute('viewBox'), 'the fallback box: 480 wide, a column chart at least 240 tall').toBe('0 0 480 240');
    expect(words(part(el, 'title'))).toBe('Deals by stage');
    expect(part(el, 'state'), 'a drawn chart has no state').toBeNull();
    const css = [...el.shadowRoot!.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/\s+/g, '');
    expect(css, 'a rule of Axes.svelte').toContain('font-size:11px');
    expect(css, 'a rule of ChartView.svelte').toContain('.chart');
  });

  it('draws without fields, by raw keys and plain numbers, and keeps drawing when they arrive', async () => {
    const spec = chartTile('column', [measure(1, { primary: true, fn: 'sum', field: 'amount' })]);
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 1500), bucketOf('won', 8)] });
    const el = mount({ spec, result, fields: null });
    await drawn(el);
    const texts = () => [...svgOf(el).querySelectorAll('text')].map((t) => words(t));
    expect(marksOf(el)).toHaveLength(2);
    expect(texts(), 'raw keys and plain numbers').toEqual(expect.arrayContaining(['new', 'won', '1,500']));
    expect(texts()).not.toContain('Closed won');
    expect(words(part(el, 'title'))).toBe('sum · amount');

    el.fields = TILE_FIELDS;
    await expect.poll(texts).toContain('Closed won');
    expect(texts(), 'the currency format, from the field').toContain('$1,500.00');
  });

  it("points hatched marks at the element's own patterns", async () => {
    const stacked = chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage' } });
    const result = chartResult({
      [uuid(1)]: [bucketOf('new', 6, { segments: [bucketOf('won', 3), bucketOf('$other', 2), bucketOf('$restricted', 1)] })],
    });
    const a = mount({ spec: stacked, result, fields: TILE_FIELDS });
    const b = mount({ spec: stacked, result, fields: TILE_FIELDS });
    await drawn(a);
    await drawn(b);

    const ids = (el: Element) => [...el.shadowRoot!.querySelectorAll('pattern')].map((p) => p.id);
    // A browser serializes `url(#id)` with quotes, whichever way it was written.
    const fills = (el: Element) => marksOf(el).map((m) => (m as SVGElement).style.fill.replace(/^url\(["']?#([^"')]+)["']?\)$/, 'url(#$1)'));
    expect(ids(a)).toHaveLength(2);
    expect(new Set([...ids(a), ...ids(b)]).size, 'two tiles never share a pattern id').toBe(4);
    for (const el of [a, b]) {
      const [other, restricted] = ids(el);
      expect(fills(el)).toEqual(['var(--k-chart-2)', `url(#${other})`, `url(#${restricted})`]);
      const [first, second] = [...el.shadowRoot!.querySelectorAll('pattern')];
      expect(first!.querySelector('rect')!.style.fill, 'on the other tone').toBe('var(--k-chart-other)');
      expect(first!.querySelector('line')!.style.stroke).toBe('var(--k-chart-hatch)');
      expect(first!.getAttribute('patternTransform')).toBe('rotate(45)');
      expect(first!.querySelector('line')!.hasAttribute('stroke-dasharray'), 'solid').toBe(false);
      expect(second!.getAttribute('patternTransform')).toBe('rotate(-45)');
      expect(second!.querySelector('line')!.getAttribute('stroke-dasharray')).toBe('2 2');
      expect(el.shadowRoot!.querySelectorAll('[fill], [stroke]')).toHaveLength(0);
    }
  });

  it('says No buckets for an empty result, and offers no table', async () => {
    const rows: [string, AfTileResult][] = [
      ['no buckets', chartResult({ [uuid(1)]: [] })],
      ['a population of zero', chartResult({ [uuid(1)]: [bucketOf('new', 0)] }, { population: { capped: false, count: 0, membership_rule: 'all' } })],
    ];
    for (const [name, result] of rows) {
      const el = mount({ spec: COLUMN, result, fields: TILE_FIELDS });
      await expect.poll(() => words(part(el, 'state')), { timeout: 5000 }).toBe('No buckets over these records');
      expect(part(el, 'plot'), name).toBeNull();
      expect(part(el, 'table-toggle'), name).toBeNull();
    }
  });

  it('keeps the whole text of a cut axis label in its title', async () => {
    const long = 'A very long account name that cannot possibly fit in a gutter';
    const result = chartResult({ [uuid(1)]: [bucketOf(long, 5), bucketOf('Short', 8)] });
    for (const chart of ['column', 'bar'] as const) {
      const el = mount({ spec: chartTile(chart, [measure(1, { primary: true })]), result, fields: null });
      await drawn(el);
      // A <text> holds its label as a text node, and a <title> beside it whose text is not part of what is drawn.
      const shown = (t: Element) => [...t.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.nodeValue).join('');
      const labelled = [...svgOf(el).querySelectorAll('text')].filter((t) => /^(A very|Short)/.test(shown(t)));
      const [cut, whole] = labelled;
      expect(labelled, chart).toHaveLength(2);
      expect(shown(cut!).endsWith('…'), `${chart}: the long label is cut`).toBe(true);
      expect(long.startsWith(shown(cut!).slice(0, -1))).toBe(true);
      expect(cut!.querySelector('title')?.textContent, `${chart}: its title is the whole label`).toBe(long);
      expect(shown(whole!), chart).toBe('Short');
      expect(whole!.querySelector('title'), `${chart}: a label that fits has no title`).toBeNull();
    }
  });

  it('swaps the plot for a table, and back', async () => {
    const el = mount({ spec: COLUMN, result: COLUMN_RESULT(), fields: TILE_FIELDS });
    await drawn(el);
    const toggle = () => part(el, 'table-toggle') as HTMLButtonElement;
    expect([toggle().tagName, toggle().type, words(toggle())]).toEqual(['BUTTON', 'button', 'Show as table']);
    expect(part(el, 'table'), 'the chart first').toBeNull();

    toggle().click();
    await drawn(el, 'table');
    expect(part(el, 'plot')).toBeNull();
    expect(words(toggle()), 'the label says what a press shows next').toBe('Show as chart');
    const table = part(el, 'table')!;
    expect(table.tagName).toBe('TABLE');
    expect([...table.querySelectorAll('thead th')].map((h) => words(h))).toEqual(['Stage', 'count']);
    expect([...table.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => words(c)))).toEqual([['new', '5'], ['Closed won', '8']]);
    expect([...table.querySelectorAll('tbody th')].map((h) => h.getAttribute('scope')), 'a row is headed by its bucket').toEqual(['row', 'row']);
    expect(table.querySelector('thead th')!.getAttribute('scope')).toBe('col');

    el.result = chartResult({ [uuid(1)]: [bucketOf('won', 11)] });
    await expect.poll(() => [...part(el, 'table')!.querySelectorAll('tbody tr')].length).toBe(1);
    expect(part(el, 'plot'), 'a new result keeps the view').toBeNull();

    toggle().click();
    await drawn(el);
    expect(part(el, 'table')).toBeNull();
    expect(words(toggle())).toBe('Show as table');
    expect(toggle().hasAttribute('aria-pressed'), 'a label that changes is not also a pressed state').toBe(false);
  });

  it('names the table: a region with a caption', async () => {
    const untitled = { kind: 'chart', chart: 'column', split_by: { field: 'stage' }, query: { entity: 'deals', measures: [{ key: 'rev', metric: 'revenue' }] } } as AfTileSpec;
    const rows: [string, AfTileSpec, AfTileResult, string, string][] = [
      ["the tile's title", COLUMN, COLUMN_RESULT(), 'Deals by stage', 'Deals by stage'],
      ['the split field, when the tile has no title', untitled, chartResult({ rev: [bucketOf('new', 5), bucketOf('won', 8)] }), '', 'Stage'],
    ];
    for (const [name, spec, result, title, expected] of rows) {
      const el = mount({ spec, result, fields: TILE_FIELDS });
      await drawn(el);
      expect(words(part(el, 'title')), `${name}: the title`).toBe(title);
      (part(el, 'table-toggle') as HTMLButtonElement).click();
      await drawn(el, 'table');
      const region = part(el, 'table')!.closest('[part~="viewport"]')!;
      expect([region.getAttribute('role'), region.getAttribute('aria-label')], `${name}: the scroll area`).toEqual(['region', expected]);
      expect(words(part(el, 'table')!.querySelector('caption')), `${name}: the table's caption`).toBe(expected);
    }
  });

  it('offers a table for a chart only', async () => {
    const number = mount({ spec: numberTile([measure(1, { primary: true })]), result: tileResult({ [uuid(1)]: { value: 3, population: 3, cap_bound: null } }) });
    await drawn(number, 'figure');
    expect(part(number, 'table-toggle')).toBeNull();
    const unknown = mount({ spec: chartTile('area' as 'bar', [measure(1, { primary: true })]), result: COLUMN_RESULT(), fields: TILE_FIELDS });
    await expect.poll(() => words(part(unknown, 'state'))).toBe('This tile cannot be drawn here yet');
    expect(part(unknown, 'table-toggle'), 'a chart type it does not know is not drawn').toBeNull();
  });

  it('sizes a bar chart by its buckets and fills the box it is measured in', async () => {
    const original = globalThis.ResizeObserver;
    const callbacks: ResizeObserverCallback[] = [];
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    try {
      const keys = Array.from({ length: 10 }, (_, i) => `k${i}`);
      const bar = chartTile('bar', [measure(1, { primary: true })]);
      const el = mount({ spec: bar, result: chartResult({ [uuid(1)]: keys.map((k) => bucketOf(k, 1)) }), fields: TILE_FIELDS });
      await drawn(el);
      expect(svgOf(el).getAttribute('viewBox'), '28 px a bucket and 40 over').toBe('0 0 480 320');
      expect(marksOf(el)).toHaveLength(10);

      const measured = (width: number, height: number) => {
        const target = el.shadowRoot!.querySelector('.chart')!;
        for (const callback of callbacks) callback([{ target, contentRect: { width, height } } as unknown as ResizeObserverEntry], {} as ResizeObserver);
      };
      measured(600, 500);
      await expect.poll(() => svgOf(el).getAttribute('viewBox')).toBe('0 0 600 500');
      measured(600, 100);
      await expect.poll(() => svgOf(el).getAttribute('viewBox'), { message: 'never under the minimum height, 16 px a bucket and 24 over' }).toBe('0 0 600 184');
      measured(0, 0);
      await expect.poll(() => svgOf(el).getAttribute('viewBox'), { message: 'a box with no size is no measurement' }).toBe('0 0 480 320');
    } finally {
      globalThis.ResizeObserver = original;
    }
  });
});
