import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComputedTile, components } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { chartPanels, panelsLegend } from '../../src/kit/tile/chart-model.js';
import { layoutBars, layoutLines, panelGutter, valueDomain } from '../../src/kit/tile/layout.js';
import { kitText } from '../../src/kit/text.js';
import { modelOf } from './fixtures/chart.js';
import { DRILL, TILE_FIELDS, amount, bucketOf, chartResult, chartTile, measure, uuid } from './fixtures/tile.js';
import { COLUMN_STACKED, FIELDS, LINE, MULTIPLES, PIE, WEEKS } from './fixtures/tiles.js';

// The functions are counted, not replaced: each calls through.
vi.mock('../../src/kit/tile/chart-model.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../src/kit/tile/chart-model.js')>();
  return { ...real, chartPanels: vi.fn(real.chartPanels), panelsLegend: vi.fn(real.panelsLegend) };
});
vi.mock('../../src/kit/tile/layout.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../src/kit/tile/layout.js')>();
  return { ...real, layoutBars: vi.fn(real.layoutBars), layoutLines: vi.fn(real.layoutLines), panelGutter: vi.fn(real.panelGutter) };
});

type Schemas = components['schemas'];
type Chart = 'bar' | 'column' | 'line';

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
}

const EN = kitText('en');
const VI = kitText('vi');
const NONE: ReadonlySet<number> = new Set();
const SIZE = { width: 480, height: 160 };
const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const plotsOf = (el: Element) => parts(el, 'plot');
const svgOf = (plot: Element) => (plot as unknown as SVGGElement).ownerSVGElement!;
// A mark is a button when the tile opens records and an image when it does not.
const marksIn = (plot: Element) => [...plot.querySelectorAll<SVGElement>('[data-bucket][tabindex]')];
const stopsOf = (el: Element) => [...el.shadowRoot!.querySelectorAll<SVGElement>('[data-bucket][tabindex="0"]')];
const at = (mark: SVGElement | undefined) => (mark ? `${mark.dataset.bucket}:${mark.dataset.series}` : null);
const heldBy = (el: Element) => el.shadowRoot!.activeElement;
const legendOf = (el: Element) => parts(el, 'legend-item');

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
const build = (spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] = TILE_FIELDS, text = EN, locale = 'en') => chartPanels(spec, result, fields, text, locale, true);

/** The case's tile as another kind of chart. */
const as = (chart: Chart, instead: Partial<{ spec: AfTileSpec; result: AfTileResult }> = {}) => ({ ...MULTIPLES, spec: { ...MULTIPLES.spec, chart } as AfTileSpec, ...instead });
const days = (count: number) => Array.from({ length: count }, (_, i) => new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10));

/** A count and a currency sum for each of `keys`, by day: the primary is the count. */
function daily(chart: Chart, keys: string[]) {
  const spec = chartTile(chart, [measure(1, { primary: true }), amount(2)], { split_by: { field: 'opened', bucket: 'day' } });
  const result = chartResult({
    [uuid(1)]: keys.map((k, i) => bucketOf(k, 5 + (i % 7), { target: 8, comparison: { previous: 4 + (i % 5), difference: 1, percent_change: 0.2 } })),
    [uuid(2)]: keys.map((k, i) => bucketOf(k, 90_000 + 1_000 * (i % 13))),
  });
  return { spec, result, fields: FIELDS };
}

/** One count by `count` buckets, drawn as bars: one panel. */
function bars(count: number) {
  const spec = chartTile('bar', [measure(1, { primary: true })]);
  const result = chartResult({ [uuid(1)]: Array.from({ length: count }, (_, i) => bucketOf(`k${i}`, 1 + i)) });
  return { spec, result, fields: TILE_FIELDS };
}

/** Two counts and a sum: the first panel holds two series, so the panels differ in how many series they name. */
function trio(chart: Chart) {
  const keys = days(12);
  const spec = chartTile(chart, [measure(1, { primary: true }), measure(2, { label: 'Won' }), amount(3)], { split_by: { field: 'opened', bucket: 'day' } });
  const result = chartResult(Object.fromEntries([1, 2, 3].map((n) => [uuid(n), keys.map((k, i) => bucketOf(k, n * 10 + (i % 4), { drill: DRILL }))])));
  return { spec, result, fields: FIELDS };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('chartPanels', () => {
  it("makes one panel for each unit, the primary's first, each measure joined to the primary's buckets by key", () => {
    const spec = chartTile('column', [measure(1), amount(2, { primary: true }), measure(3, { label: 'Won' })]);
    const result = chartResult({
      [uuid(2)]: [bucketOf('new', 70, { target: 90, comparison: { previous: 60, difference: 10, percent_change: 1 / 6 } }), bucketOf('won', 40, { filled: true }), bucketOf(null, 5)],
      [uuid(1)]: [bucketOf(null, 1, { count: 4, drill: DRILL }), bucketOf('new', 8, { count: 8, drill: DRILL })],
      [uuid(3)]: [bucketOf('won', 3), bucketOf('new', 2)],
    });
    const [primary, counts] = build(spec, result);

    expect(build(spec, result)).toHaveLength(2);
    expect([primary!.series.map((s) => s.measure), counts!.series.map((s) => s.measure)], 'the primary leads its panel, and the units are not mixed').toEqual([[uuid(2)], [uuid(1), uuid(3)]]);
    expect([primary!.unitLabel, counts!.unitLabel]).toEqual(['USD', 'count']);
    expect(counts!.buckets.map((b) => b.key), "the primary's buckets, in its order").toEqual(['new', 'won', null]);
    expect(counts!.buckets.map((b) => b.values), 'null where a measure lacks the bucket').toEqual([[8, 2], [null, 3], [1, null]]);
    expect(counts!.buckets.map((b) => b.counts), 'a count of 0 where a measure lacks the bucket').toEqual([[8, 2], [0, 3], [4, 0]]);
    expect(counts!.buckets.map((b) => b.drills.map((d) => d?.measure ?? null)), "each drill is its own measure's").toEqual([[uuid(1), null], [null, null], [uuid(1), null]]);
    expect(counts!.buckets.map((b) => b.filled), "the primary's flags").toEqual([false, true, false]);
    expect(counts!.format(8), "each panel formats its own unit").toBe('8');
    expect(primary!.format(8)).toBe('$8.00');

    expect([primary!.compared, counts!.compared]).toEqual([true, false]);
    expect(counts!.buckets.map((b) => [b.target, b.previous, b.difference, b.percentChange, b.compared, b.unmatched]), 'only the first panel carries the comparison and the targets').toEqual(
      Array(3).fill([null, null, null, null, false, false]),
    );
    expect(primary!.buckets[0]!.target).toBe(90);
    expect(counts!.legend.map((i) => i.kind), 'and its legend items').toEqual(['series', 'series', 'filled']);
    expect(primary!.legend.map((i) => i.kind)).toEqual(['series', 'earlier', 'target', 'filled']);
  });

  it('keeps a chart in one unit, and a pie, as one panel with no unit label', () => {
    const rows: [string, AfTileSpec][] = [
      ['one unit', chartTile('column', [measure(1, { primary: true }), measure(2)])],
      ['a pie over two units', chartTile('pie', [measure(1, { primary: true }), amount(2)])],
      ['a donut over two units', chartTile('donut', [measure(1, { primary: true }), amount(2)])],
      ['one measure', chartTile('line', [measure(1, { primary: true })])],
    ];
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 1)], [uuid(2)]: [bucketOf('new', 2)] });
    for (const [name, spec] of rows) {
      const panels = build(spec, result);
      expect(panels, name).toHaveLength(1);
      expect(panels[0]!.unitLabel, name).toBeNull();
    }
  });

  it("names a panel's unit: a currency by its code, every other by the word for it, in the language", () => {
    const fields: FigureField[] = [
      ...TILE_FIELDS,
      { key: 'qty', type: 'number', label: 'Quantity' },
      { key: 'span', type: 'number', label: 'Span', format: 'duration' },
      { key: 'score', type: 'number', label: 'Score', format: 'rating' },
      { key: 'opened', type: 'date', label: 'Opened' },
      { key: 'euro', type: 'number', label: 'Euro', format: 'currency', format_options: { currency_code: 'EUR' } },
    ];
    const rows: [string, Partial<Schemas['TileMeasure']>, string, string][] = [
      ['a count', { fn: 'count' }, 'count', 'số lượng'],
      ['a ratio', { fn: 'ratio', ratio: { of: 'qty', per: 'amount', using: 'sum' } }, 'ratio', 'tỷ lệ'],
      ['a percent', { fn: 'avg', field: 'rate' }, '%', '%'],
      ['a plain number', { fn: 'sum', field: 'qty' }, 'number', 'số'],
      ['a duration field', { fn: 'avg', field: 'span' }, 'duration', 'thời lượng'],
      ['minutes between two dates', { fn: 'avg', duration: { from: 'opened', to: 'opened', unit: 'minutes' } }, 'minutes', 'phút'],
      ['hours between two dates', { fn: 'avg', duration: { from: 'opened', to: 'opened', unit: 'hours' } }, 'hours', 'giờ'],
      ['days between two dates', { fn: 'avg', duration: { from: 'opened', to: 'opened', unit: 'days' } }, 'days', 'số ngày'],
      ['a rating', { fn: 'avg', field: 'score' }, 'rating', 'đánh giá'],
      ['a date', { fn: 'max', field: 'opened' }, 'date', 'ngày'],
      ['another currency', { fn: 'sum', field: 'euro' }, 'EUR', 'EUR'],
    ];
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 1)], [uuid(2)]: [bucketOf('new', 2)] });
    for (const [name, second, en, vi] of rows) {
      const spec = chartTile('column', [amount(1, { primary: true }), measure(2, second)]);
      expect(build(spec, result, fields).map((p) => p.unitLabel), name).toEqual(['USD', en]);
      expect(build(spec, result, fields, VI, 'vi').map((p) => p.unitLabel), `${name}, in Vietnamese`).toEqual(['USD', vi]);
    }
  });
});

describe('the panel options of a layout', () => {
  it('moves the plot down for a unit label, drops the category labels, and takes the gutter it is given', () => {
    for (const [name, lay] of [
      ['columns', (o?: Parameters<typeof layoutBars>[4]) => layoutBars(modelOf([[1], [2], [3]]), SIZE, NONE, EN, o)],
      ['lines', (o?: Parameters<typeof layoutLines>[4]) => layoutLines(modelOf([[1], [2], [3]], { type: 'line' }), SIZE, NONE, EN, o)],
    ] as const) {
      const plain = lay();
      expect(plain.unit, `${name}: no label, no mark`).toBeNull();

      const labelled = lay({ unitLabel: 'USD' });
      expect(labelled.unit, name).toEqual({ x: labelled.plot.x, y: 11, text: 'USD' });
      expect([labelled.plot.y - plain.plot.y, plain.plot.height - labelled.plot.height], `${name}: 14 px down`).toEqual([14, 14]);

      const bare = lay({ categoryLabels: false });
      expect(bare.categoryTicks, name).toEqual([]);
      expect(plain.categoryTicks.length, name).toBeGreaterThan(0);
      expect(bare.plot.height - plain.plot.height, `${name}: a bottom margin of 8 for 24`).toBe(16);

      const wide = lay({ valueGutter: 100 });
      expect(wide.plot.x, name).toBe(100);
      expect(wide.plot.x + wide.plot.width, `${name}: the right edge does not move`).toBeCloseTo(plain.plot.x + plain.plot.width, 6);
    }

    const bars = layoutBars(modelOf([[1], [2]], { type: 'bar' }), { width: 480, height: 200 }, NONE, EN, { unitLabel: 'USD' });
    expect(bars.unit, 'a bar chart too').toEqual({ x: bars.plot.x, y: 11, text: 'USD' });
  });

  it("sizes the shared gutter by the widest panel, and by nothing for a bar chart", () => {
    const wide = modelOf([[1_000_000], [2_000_000]], { type: 'column', format: (v) => `$${v}` });
    const narrow = modelOf([[1], [2]], { type: 'column' });
    const alone = (m: typeof wide) => layoutBars(m, SIZE, NONE).plot.x;
    expect(alone(narrow)).toBeLessThan(alone(wide));
    expect(panelGutter([narrow, wide], NONE)).toBe(alone(wide));
    expect(panelGutter([wide, narrow], NONE)).toBe(alone(wide));
    expect(panelGutter([narrow], NONE), 'one panel is its own').toBe(alone(narrow));
    expect(panelGutter([modelOf([[1_000_000]], { type: 'bar' })], NONE), 'a bar chart has no value gutter').toBe(0);
    expect(panelGutter([modelOf([[1, 1_000_000]], { type: 'line' })], new Set([1])), 'a hidden series is not measured').toBe(layoutLines(modelOf([[1, 1_000_000]], { type: 'line' }), SIZE, new Set([1])).plot.x);
  });
});

describe("<af-tile>'s small multiples", () => {
  it("draws measures in two units as two panels, the primary's first, each with its own scale", async () => {
    const el = mount({ ...MULTIPLES });
    await drawn(el);
    const plots = plotsOf(el);
    expect(plots).toHaveLength(2);
    const svgs = plots.map(svgOf);
    expect(svgs.map((s) => words(s.querySelector('.unit')))).toEqual(['count', 'USD']);
    expect(svgs.map((s) => s.querySelectorAll('.unit').length), 'one label each').toEqual([1, 1]);

    const ticks = (svg: SVGElement) => [...svg.querySelectorAll('text[text-anchor="end"]')].map((t) => words(t));
    expect(ticks(svgs[0]!).length).toBeGreaterThan(1);
    expect(ticks(svgs[0]!).every((t) => /^\d+$/.test(t)), 'the count panel has counts').toBe(true);
    expect(ticks(svgs[1]!).every((t) => /^\$[\d,]+$/.test(t)), 'the currency panel has dollars').toBe(true);

    expect(marksIn(plots[0]!).map((m) => m.dataset.series), 'a column for each week').toEqual(Array(8).fill('0'));
    expect(marksIn(plots[1]!)).toHaveLength(8);
    expect(el.shadowRoot!.querySelectorAll('svg')).toHaveLength(2);
    expect(part(el, 'state'), 'a chart over two units is drawn now').toBeNull();
  });

  async function sameStrips(rows: [string, Chart, ReturnType<typeof as>][]) {
    for (const [name, chart, tile] of rows) {
      const el = mount({ ...tile });
      await drawn(el);
      const strips = plotsOf(el).map((plot) => [...plot.querySelectorAll<SVGRectElement>('.strip')].map((s) => (chart === 'bar' ? [s.getAttribute('y'), s.getAttribute('height')] : [s.getAttribute('x'), s.getAttribute('width')])));
      expect(strips, name).toHaveLength(2);
      expect(strips[0]!.length, name).toBeGreaterThan(7);
      expect(strips[1], `${name}: the same strips`).toEqual(strips[0]);
      expect(el.shadowRoot!.innerHTML, `${name}: no NaN`).not.toContain('NaN');
    }
  }

  it('puts a bucket at the same x in every panel, in columns and in lines', async () => {
    await sameStrips([
      ['weekly columns', 'column', as('column')],
      ['weekly lines', 'line', as('line')],
      ['weekly bars', 'bar', as('bar')],
      ['lines with two series in one panel and one in the other', 'line', trio('line')],
      ['columns with two series in one panel and one in the other', 'column', trio('column')],
    ]);

    // Left to itself, each panel would put its plot where its own value labels end.
    const panels = build(as('column').spec, as('column').result!, FIELDS);
    const natural = panels.map((p) => layoutBars(p, SIZE, NONE).plot.x);
    expect(natural[0]).toBeLessThan(natural[1]!);
    expect(panelGutter(panels, NONE)).toBe(natural[1]);
  });

  // Three charts of 400 buckets in two panels each: the slowest rows in the suite, given room on a loaded machine.
  it('puts a bucket at the same x in every panel at 400 daily buckets', async () => {
    await sameStrips([
      ['400 daily columns', 'column', daily('column', days(400))],
      ['400 daily lines', 'line', daily('line', days(400))],
      ['400 daily bars', 'bar', daily('bar', days(400))],
    ]);
  }, 20_000);

  it('puts the category labels on the last panel of a column or line chart, and on every panel of a bar chart', async () => {
    const rows: [Chart, string, number[]][] = [
      ['column', 'text[text-anchor="middle"]', [0, 1]],
      ['line', 'text[text-anchor="middle"]', [0, 1]],
      ['bar', 'text[text-anchor="end"]', [1, 1]],
    ];
    for (const [chart, labels, drawnOn] of rows) {
      const el = mount({ ...as(chart) });
      await drawn(el);
      const svgs = plotsOf(el).map(svgOf);
      const found = svgs.map((s) => [...s.querySelectorAll(labels)].map((t) => words(t)));
      expect(found.map((f) => (f.length > 0 ? 1 : 0)), chart).toEqual(drawnOn);
    }

    const el = mount({ ...as('column') });
    await drawn(el);
    const [first, last] = plotsOf(el).map(svgOf);
    const weeks = build(as('column').spec, as('column').result!, FIELDS)[0]!.buckets.map((b) => b.label);
    expect([...last!.querySelectorAll('text')].map((t) => words(t)), 'the weeks, by their labels').toEqual(expect.arrayContaining([weeks[0], weeks[7]]));
    expect([...first!.querySelectorAll('text')].map((t) => words(t))).not.toContain(weeks[0]);
  });

  it("draws the earlier period and the targets in the primary's panel alone", async () => {
    const column = mount({ ...MULTIPLES });
    await drawn(column);
    const kinds = (plot: Element, selector = '[data-kind]') => [...plot.querySelectorAll<SVGElement>(selector)].map((m) => m.dataset.kind);
    const [first, second] = plotsOf(column);
    expect(kinds(first!).filter((k) => k === 'previous')).toHaveLength(8);
    expect(kinds(first!).filter((k) => k === 'target')).toHaveLength(8);
    expect(kinds(second!), 'the currency panel has its columns and nothing else').toEqual(Array(8).fill('value'));

    const line = mount({ ...as('line') });
    await drawn(line);
    const [lead, other] = plotsOf(line);
    expect(kinds(lead!, 'path'), 'the earlier period and the goal, then the line').toEqual(['previous', 'target', 'value']);
    expect(kinds(other!, 'path')).toEqual(['value']);
  });

  it('draws a panel whose values are all null with no mark and no NaN, over a domain of 0 to 1', async () => {
    const full = MULTIPLES.result as ComputedTile;
    const withPipeline = (pipeline?: Schemas['MeasureResult']): AfTileResult => ({ ...full, measures: { deals: full.measures.deals, ...(pipeline ? { pipeline } : {}) } });
    const nulls = withPipeline({ ...full.measures.pipeline!, buckets: WEEKS.map((w) => bucketOf(w, null)) });
    const rows: [string, Chart, AfTileResult][] = (['column', 'line', 'bar'] as const).flatMap((chart) => [
      [`${chart} with a null for each week`, chart, nulls] as [string, Chart, AfTileResult],
      [`${chart} with no result for the measure`, chart, withPipeline()] as [string, Chart, AfTileResult],
    ]);
    for (const [name, chart, result] of rows) {
      const tile = as(chart, { result });
      const [, empty] = build(tile.spec, result, FIELDS);
      expect(valueDomain(empty!, NONE), name).toEqual([0, 1]);

      const el = mount({ ...tile });
      await drawn(el);
      const [lead, bare] = plotsOf(el);
      expect(marksIn(bare!), `${name}: no mark`).toHaveLength(0);
      expect(marksIn(lead!).length, `${name}: the other panel keeps its marks`).toBe(8);
      expect(svgOf(bare!).outerHTML, name).not.toContain('NaN');
      expect(stopsOf(el), `${name}: nothing to tab to in it`).toHaveLength(1);
    }
  });

  it('keeps a measure its colour, whichever panel it lands in', async () => {
    const result = (ids: number[]) => chartResult(Object.fromEntries(ids.map((n) => [uuid(n), [bucketOf('new', n), bucketOf('won', n + 1)]])));
    // The measure at authored position 2 is the second series of the primary's panel, then the second series of the other.
    const rows: [string, AfTileSpec, number, string[]][] = [
      ['in the primary panel', chartTile('column', [measure(1, { primary: true }), amount(2), measure(3)]), 0, ['var(--k-chart-1)', 'var(--k-chart-3)']],
      ['in the other panel', chartTile('column', [amount(1, { primary: true }), measure(2), measure(3)]), 1, ['var(--k-chart-2)', 'var(--k-chart-3)']],
    ];
    for (const [name, spec, panel, colours] of rows) {
      const el = mount({ spec, result: result([1, 2, 3]), fields: TILE_FIELDS });
      await drawn(el);
      const fills = (series: number) => marksIn(plotsOf(el)[panel]!).filter((m) => m.dataset.series === String(series)).map((m) => m.style.fill);
      expect(fills(0), `${name}: the first series of the panel`).toEqual(Array(2).fill(colours[0]));
      expect(fills(1), `${name}: authored position 2`).toEqual(Array(2).fill(colours[1]));
    }

    const panels = build(rows[0]![1], result([1, 2, 3]));
    expect(panels.map((p) => p.series.map((s) => s.color)), 'and the model says the same').toEqual([[{ slot: 1 }, { slot: 3 }], [{ slot: 2 }]]);
  });

  it('draws unstacked panels when a stacked chart spans units', async () => {
    const spec = chartTile('column', [measure(1, { primary: true }), amount(2)], { stack_by: { field: 'stage' } });
    const result = chartResult({
      [uuid(1)]: [bucketOf('new', 6, { segments: [bucketOf('won', 4), bucketOf('new', 2)] }), bucketOf('won', 3, { segments: [bucketOf('won', 3)] })],
      [uuid(2)]: [bucketOf('new', 600), bucketOf('won', 300)],
    });
    const panels = build(spec, result);
    expect(panels.map((p) => p.stacked)).toEqual([false, false]);
    expect(panels.map((p) => p.series.map((s) => [s.measure, s.segment]))).toEqual([[[uuid(1), null]], [[uuid(2), null]]]);

    const el = mount({ spec, result, fields: TILE_FIELDS });
    await drawn(el);
    const [lead, other] = plotsOf(el);
    expect(marksIn(lead!).map((m) => m.dataset.bucket), 'one column for each week, not one for each segment').toEqual(['0', '1']);
    expect(marksIn(other!)).toHaveLength(2);
    expect(legendOf(el).map((i) => words(i)), 'the measures, not the segments').toEqual(panels.map((p) => p.series[0]!.label));
  });

  it("holds one tab stop for each panel, keeps the arrows in their panel, and opens its own measure's records", async () => {
    const el = mount({ ...MULTIPLES, drill: true });
    const heard: CustomEvent[] = [];
    el.addEventListener('af-drill', (e) => heard.push(e as CustomEvent));
    await drawn(el);
    const [first, second] = plotsOf(el);
    expect(plotsOf(el).map((p) => p.getAttribute('role'))).toEqual(['group', 'group']);
    expect(plotsOf(el).map((p) => p.getAttribute('aria-label')), 'the tile, then the unit').toEqual(['Deals and pipeline by week · count', 'Deals and pipeline by week · USD']);
    expect(stopsOf(el).map((s) => plotsOf(el).indexOf(s.closest<HTMLElement>('[part="plot"]')!)), 'the tab order visits panel 1, then panel 2').toEqual([0, 1]);
    expect(stopsOf(el).map(at)).toEqual(['0:0', '0:0']);

    // Arrows move along the weeks in one panel and never into the next.
    marksIn(first!)[0]!.focus();
    const inFirst = () => heldBy(el)!.closest('[part="plot"]') === first;
    for (const [key, week] of [['ArrowRight', 1], ['ArrowRight', 2], ['ArrowDown', 2], ['ArrowUp', 2], ['End', 7], ['ArrowRight', 7], ['ArrowDown', 7], ['Home', 0]] as const) {
      press(heldBy(el)!, key);
      expect([key, inFirst(), at(heldBy(el) as SVGElement)]).toEqual([key, true, `${week}:0`]);
    }
    press(heldBy(el)!, 'End');
    await expect.poll(() => stopsOf(el).map(at), { message: 'each panel has its own tab stop' }).toEqual(['7:0', '0:0']);

    marksIn(second!)[3]!.focus();
    await expect.poll(() => stopsOf(el).map(at)).toEqual(['7:0', '3:0']);
    expect(heldBy(el)!.getAttribute('aria-label'), 'the mark reads its own figures').toContain('$140,000');
    expect(el.shadowRoot!.querySelectorAll('[role="status"]'), 'and no live region reads them again').toHaveLength(0);

    press(heldBy(el)!, 'Enter');
    expect(heard.map((e) => [e.detail.measure, e.detail.bucket, e.detail.count])).toEqual([['pipeline', WEEKS[3], 10]]);
    press(marksIn(first!)[0]!, 'Enter');
    expect(heard.map((e) => e.detail.measure)).toEqual(['pipeline', 'deals']);
  });

  it('names every measure once in a legend that is not a toggle', async () => {
    const el = mount({ ...MULTIPLES, drill: true });
    await drawn(el);
    expect(legendOf(el).map((i) => words(i)), "both panels' measures, then the primary's earlier period and goal").toEqual(['Deals', 'Pipeline', 'earlier period', 'target']);
    expect(legendOf(el).map((i) => i.tagName)).toEqual(Array(4).fill('SPAN'));
    expect(el.shadowRoot!.querySelectorAll('[part="legend"] button, [aria-pressed]')).toHaveLength(0);
    legendOf(el)[1]!.click();
    expect(plotsOf(el).map((p) => marksIn(p).length), 'a click isolates nothing').toEqual([8, 8]);

    // With two series in the first panel, the legend of a chart in one panel would be a toggle.
    const crowded = trio('column');
    const labels = build(crowded.spec, crowded.result, FIELDS).flatMap((p) => p.series.map((s) => s.label));
    const busy = mount({ ...crowded });
    await drawn(busy);
    expect(labels).toHaveLength(3);
    expect(legendOf(busy).map((i) => [i.tagName, words(i)])).toEqual(labels.map((label) => ['SPAN', label]));
    expect(busy.shadowRoot!.querySelectorAll('[part="legend"] button, [aria-pressed]')).toHaveLength(0);
    legendOf(busy)[1]!.click();
    expect(plotsOf(busy).map((p) => marksIn(p).length), 'nothing is isolated').toEqual([24, 12]);
  });

  it("tips a bucket with its own panel's figures, one tooltip at a time", async () => {
    const el = mount({ ...MULTIPLES, drill: true });
    await drawn(el);
    const rowsOf = () => [...part(el, 'tooltip')!.querySelectorAll('.row')].map((r) => [words(r.querySelector('.name')), words(r.querySelector('.value'))]);
    const week = build(MULTIPLES.spec, MULTIPLES.result!, FIELDS)[0]!.buckets[2]!.label;

    over(marksIn(plotsOf(el)[1]!)[2]!);
    await expect.poll(() => el.dataset.raised).toBe('true');
    expect(words(part(el, 'tooltip')!.querySelector('.title'))).toBe(week);
    expect(rowsOf(), "the pipeline alone, with nothing of the primary's").toEqual([['Pipeline', '$135,000']]);

    over(marksIn(plotsOf(el)[0]!)[2]!);
    await expect.poll(() => rowsOf().map((r) => r[0])).toEqual(['Deals', 'target', 'earlier period', 'difference']);
    expect(part(el, 'tooltip')!.querySelectorAll('.title')).toHaveLength(1);

    // The pointer may reach the next panel before the last one hears it leave.
    over(marksIn(plotsOf(el)[1]!)[4]!);
    plotsOf(el)[0]!.dispatchEvent(new MouseEvent('pointerleave'));
    await expect.poll(() => rowsOf()).toEqual([['Pipeline', '$180,000']]);
    plotsOf(el)[1]!.dispatchEvent(new MouseEvent('pointerleave'));
    await expect.poll(() => el.dataset.raised).toBe('false');
  });

  it("tables every measure's column, in panel order, then the earlier period, its difference and the target", async () => {
    const el = mount({ ...MULTIPLES });
    await drawn(el);
    (part(el, 'table-toggle') as HTMLButtonElement).click();
    await drawn(el, 'table');
    const table = part(el, 'table')!;
    expect([...table.querySelectorAll('thead th')].map((h) => words(h))).toEqual(['Opened', 'Deals', 'Pipeline', 'earlier period', 'difference', 'target']);
    const rows = [...table.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => words(c)));
    expect(rows).toHaveLength(8);
    expect(rows[0]!.slice(1), 'each cell in its own panel\'s unit').toEqual(['9', '$120,000', '8', '+12.5%', '12']);
    expect(rows[5]!.slice(1)).toEqual(['8', '$95,000', '9', '\u221211.1%', '12']);
  });

  it('recomputes no model and no layout for a pointer, a focus or a tooltip, only for a new result', async () => {
    const watched = [chartPanels, panelsLegend, panelGutter, layoutBars, layoutLines].map((f) => vi.mocked(f));
    const calls = () => watched.map((w) => w.mock.calls.length);
    for (const chart of ['column', 'line'] as const) {
      const el = mount({ ...as(chart), drill: true });
      await drawn(el);
      watched.forEach((w) => w.mockClear());
      const [first, second] = plotsOf(el);

      over(marksIn(first!)[3]!);
      await expect.poll(() => el.dataset.raised).toBe('true');
      over(marksIn(second!)[5]!);
      marksIn(first!)[0]!.focus();
      press(heldBy(el)!, 'ArrowRight');
      press(heldBy(el)!, 'End');
      marksIn(second!)[1]!.focus();
      await expect.poll(() => stopsOf(el).map(at)).toEqual(['7:0', '1:0']);
      for (const plot of plotsOf(el)) plot.dispatchEvent(new MouseEvent('pointerleave'));
      (el.shadowRoot!.activeElement as HTMLElement).blur();
      await expect.poll(() => el.dataset.raised).toBe('false');
      expect(calls(), `${chart}: nothing is computed again`).toEqual([0, 0, 0, 0, 0]);

      el.result = { ...(as(chart).result as object) } as AfTileResult;
      await expect.poll(() => calls()[0]).toBe(1);
      expect(calls().slice(1, 3), `${chart}: a new result computes the legend and the gutter once`).toEqual([1, 1]);
      expect(calls()[3]! + calls()[4]!, `${chart}: and each panel's layout once`).toBe(2);
    }
  });

  it.each([
    ['a column chart', 240, 64, COLUMN_STACKED],
    ['a line chart', 240, 64, LINE],
    ['a pie', 240, 64, PIE],
    ['a bar chart of 3 buckets, whose floor wants 16 px each and 24 over', 160, 72, bars(3)],
    ['a bar chart of 10 buckets', 320, 184, bars(10)],
    ['small multiples of 2 column panels', 320, 128, MULTIPLES],
  ])('gives %s a natural height of %ipx and a floor of %ipx', async (_, natural, floor, fixture) => {
    const el = mount({ ...fixture });
    await drawn(el);
    const box = el.shadowRoot!.querySelector<HTMLElement>('.chart')!;
    expect(box.style.flexBasis, 'the height it takes when its host sets none').toBe(`${natural}px`);
    expect(box.style.minHeight, 'and the least it shrinks to in a cell that is shorter').toBe(`${floor}px`);
  });

  it('shares the measured height between the panels, never under a panel\'s floor', async () => {
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
      const boxes = (el: Element) => [...el.shadowRoot!.querySelectorAll('svg')].map((s) => s.getAttribute('viewBox'));
      const measured = (el: Element, width: number, height: number) => {
        const target = el.shadowRoot!.querySelector('.chart')!;
        for (const callback of callbacks) callback([{ target, contentRect: { width, height } } as unknown as ResizeObserverEntry], {} as ResizeObserver);
      };

      const column = mount({ ...MULTIPLES });
      await drawn(column);
      expect(boxes(column), 'a column panel is 160 tall at least').toEqual(['0 0 480 160', '0 0 480 160']);
      measured(column, 600, 500);
      await expect.poll(() => boxes(column)).toEqual(['0 0 600 250', '0 0 600 250']);
      measured(column, 600, 300);
      await expect.poll(() => boxes(column), { message: 'a cell shorter than the natural height is filled, not overflowed' }).toEqual(['0 0 600 150', '0 0 600 150']);
      measured(column, 600, 100);
      await expect.poll(() => boxes(column), { message: 'never under the floor' }).toEqual(['0 0 600 64', '0 0 600 64']);

      // A bar chart wants 28 px a bucket and 40 over, and no less than 120.
      const few = mount({ ...daily('bar', days(2)) });
      await drawn(few);
      expect(boxes(few)).toEqual(['0 0 480 120', '0 0 480 120']);
      const many = mount({ ...as('bar') });
      await drawn(many);
      expect(boxes(many)).toEqual(['0 0 480 264', '0 0 480 264']);

      // One unit is one panel, as tall as plan 2 drew it.
      const one = mount({ spec: chartTile('column', [measure(1, { primary: true }), measure(2)]), result: chartResult({ [uuid(1)]: [bucketOf('a', 1)], [uuid(2)]: [bucketOf('a', 2)] }), fields: TILE_FIELDS });
      await drawn(one);
      expect(boxes(one)).toEqual(['0 0 480 240']);
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  it('changes one panel into two on the same element, with nothing hidden, focused or shown from the one', async () => {
    const counts = chartTile('column', [measure(1, { primary: true }), measure(2, { label: 'Won' })]);
    const apart = chartTile('column', [measure(1, { primary: true }), measure(2, { label: 'Won' }), amount(3)]);
    const weeks = ['a', 'b', 'c'];
    const result = chartResult(Object.fromEntries([1, 2, 3].map((n) => [uuid(n), weeks.map((k, i) => bucketOf(k, n * 10 + i, { drill: DRILL }))])));
    const rows: [string, { change: (el: TileElement) => void; back: (el: TileElement) => void; marks: number[]; start: Partial<TileElement> }][] = [
      // The isolated series is still in the first panel, so only what the panels do with it can drop it.
      ['a new spec over the same result', { start: { spec: counts, result, fields: TILE_FIELDS }, change: (el) => { el.spec = apart; }, back: (el) => { el.spec = counts; }, marks: [6, 3] }],
      ['a new spec, result and fields', {
        start: { spec: counts, result, fields: TILE_FIELDS },
        change: (el) => Object.assign(el, { spec: MULTIPLES.spec, result: MULTIPLES.result, fields: MULTIPLES.fields }),
        back: (el) => Object.assign(el, { spec: counts, result, fields: TILE_FIELDS }),
        marks: [8, 8],
      }],
    ];
    for (const [name, { start, change, back, marks }] of rows) {
      const el = mount({ ...start, drill: true });
      await drawn(el);
      expect(plotsOf(el), name).toHaveLength(1);
      expect(legendOf(el).map((i) => i.tagName)).toEqual(['BUTTON', 'BUTTON']);

      (legendOf(el)[1] as HTMLButtonElement).click();
      await expect.poll(() => marksIn(plotsOf(el)[0]!).map((m) => m.dataset.series), { message: `${name}: Won alone` }).toEqual(['1', '1', '1']);
      const lone = marksIn(plotsOf(el)[0]!)[2]!;
      lone.focus();
      over(lone);
      await expect.poll(() => el.dataset.raised).toBe('true');
      await expect.poll(() => at(stopsOf(el)[0]), { message: `${name}: the tab stop follows the focus` }).toBe('2:1');

      change(el);
      await expect.poll(() => plotsOf(el).length, { message: name }).toBe(2);
      expect(plotsOf(el).map((p) => marksIn(p).length), `${name}: no series is hidden, so no panel is blank`).toEqual(marks);
      expect(stopsOf(el).map(at), `${name}: each panel's stop is on its first mark`).toEqual(['0:0', '0:0']);
      expect(stopsOf(el).map((s) => plotsOf(el).indexOf(s.closest<HTMLElement>('[part="plot"]')!)), `${name}: one in each`).toEqual([0, 1]);
      await expect.poll(() => el.dataset.raised, { message: `${name}: no tooltip stays open` }).toBe('false');
      expect(part(el, 'tooltip')!.querySelector('.body'), 'and none is drawn').toBeNull();
      expect(legendOf(el).map((i) => i.tagName)).toEqual(Array(legendOf(el).length).fill('SPAN'));
      expect(el.shadowRoot!.querySelectorAll('[aria-pressed]')).toHaveLength(0);

      // And back: the panels give way to one, whole, with every series showing.
      back(el);
      await expect.poll(() => plotsOf(el).length, { message: `${name}: back` }).toBe(1);
      expect(marksIn(plotsOf(el)[0]!).map((m) => m.dataset.series), 'every series shows').toEqual(['0', '1', '0', '1', '0', '1']);
      expect(stopsOf(el).map(at)).toEqual(['0:0']);
      expect(legendOf(el).map((i) => i.tagName)).toEqual(['BUTTON', 'BUTTON']);
      expect(el.shadowRoot!.querySelectorAll('.unit'), 'one panel has no unit label').toHaveLength(0);
      document.body.innerHTML = '';
    }
  });
});
