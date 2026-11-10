import { afterEach, describe, expect, it } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import type { ChartBucket, ChartModel } from '../../src/kit/tile/chart-model.js';
import { layoutBars, layoutLines } from '../../src/kit/tile/layout.js';
import type { LineLayout, Size } from '../../src/kit/tile/layout.js';
import { modelOf } from './fixtures/chart.js';
import { DRILL, TILE_FIELDS, bucketOf, chartResult, chartTile, measure, uuid } from './fixtures/tile.js';

const SIZE: Size = { width: 480, height: 240 };
const NONE: ReadonlySet<number> = new Set();
const CHAR = 6.2;

const lineOf = (values: (number | null)[][], over: Partial<ChartModel> = {}, buckets: Partial<ChartBucket>[] = []) => modelOf(values, { type: 'line', ...over }, buckets);
const pathsOf = (layout: LineLayout, kind: 'value' | 'previous' | 'target') => layout.paths.filter((p) => p.kind === kind);
const moves = (d: string) => (d.match(/M/g) ?? []).length;
const dotAt = (layout: LineLayout, series: number, bucket: number) => layout.dots.find((d) => d.series === series && d.bucket === bucket);
const rightOfPlot = (layout: LineLayout, size: Size = SIZE) => size.width - (layout.plot.x + layout.plot.width);
const finite = (layout: LineLayout) =>
  [
    ...Object.values(layout.plot), layout.zero ?? 0, ...layout.bucketX,
    ...layout.dots.flatMap((d) => [d.cx, d.cy]),
    ...layout.labels.flatMap((l) => [l.x, l.y]),
    ...layout.paths.flatMap((p) => [p.opacity, ...(p.d.match(/-?[\d.e+-]+|NaN|Infinity/g) ?? []).map(Number)]),
    ...layout.valueTicks.map((t) => t.at), ...layout.categoryTicks.map((t) => t.at),
  ].every(Number.isFinite);

describe('the lines layout', () => {
  it('keeps the value labels up a short line chart at least 20 px apart, two or three of them', () => {
    // 72 px is 8 above the plot, 40 of plot and 24 below for the labels. At 240 px the six ticks of [0, 1] stand.
    const layout = layoutLines(lineOf([[18_000], [52_000], [33_000], [41_000]]), { width: 480, height: 72 }, NONE);
    expect(layout.plot.height).toBe(40);
    expect(layout.valueTicks.length).toBeGreaterThanOrEqual(2);
    expect(layout.valueTicks.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < layout.valueTicks.length; i++) {
      expect(layout.valueTicks[i - 1]!.at - layout.valueTicks[i]!.at, layout.valueTicks[i]!.label).toBeGreaterThanOrEqual(20);
    }
  });

  it('breaks the line at a null bucket, and puts no dot there', () => {
    const out = layoutLines(lineOf([[1], [2], [null], [4], [5]]), SIZE, NONE);
    const [path] = pathsOf(out, 'value');
    expect(pathsOf(out, 'value')).toHaveLength(1);
    expect(moves(path!.d), 'two runs, so two moves').toBe(2);
    expect(out.dots.map((d) => d.bucket), 'a dot for each value and none for the gap').toEqual([0, 1, 3, 4]);
    expect(path!.d, 'a null is a gap, never a zero').not.toContain('NaN');
    expect([path!.series, path!.opacity, path!.dashed, path!.stroke]).toEqual([0, 1, false, 'var(--k-chart-1)']);
    expect(out.dots.every((d) => d.stroke === 'var(--k-chart-1)' && !d.hollow)).toBe(true);
    expect(finite(out)).toBe(true);
  });

  it('draws the earlier period in the primary colour at 0.4, without dots', () => {
    const model = lineOf([[10, 5], [20, 6], [30, 7], [25, 8]], { compared: true }, [{ previous: 8 }, { previous: 9 }, { previous: null }, { previous: 22 }].map((b) => ({ ...b, compared: true })));
    const out = layoutLines(model, SIZE, NONE);
    const [previous] = pathsOf(out, 'previous');
    expect(pathsOf(out, 'previous')).toHaveLength(1);
    expect([previous!.series, previous!.stroke, previous!.opacity, previous!.dashed]).toEqual([0, 'var(--k-chart-1)', 0.4, false]);
    expect(moves(previous!.d), 'broken where the earlier figure is missing').toBe(2);
    expect(out.dots.map((d) => `${d.series}:${d.bucket}`), 'dots for the values only').toEqual(['0:0', '0:1', '0:2', '0:3', '1:0', '1:1', '1:2', '1:3']);

    const hidden = layoutLines(model, SIZE, new Set([0]));
    expect(pathsOf(hidden, 'previous'), 'it follows the primary series').toEqual([]);
    expect(pathsOf(layoutLines(lineOf([[1], [2]]), SIZE, NONE), 'previous'), 'nothing to compare').toEqual([]);

    const high = layoutLines(lineOf([[10], [12]], { compared: true }, [{ previous: 100, compared: true }, {}]), SIZE, NONE);
    expect(high.valueTicks.at(-1)!.label, 'the domain holds the earlier period').toBe('100');
  });

  it('draws the target dashed, and breaks it where a bucket has none', () => {
    const model = lineOf([[1], [2], [3], [4], [5]], {}, [{ target: 10 }, { target: 10 }, {}, { target: 12 }, { target: 12 }]);
    const out = layoutLines(model, SIZE, NONE);
    const [target] = pathsOf(out, 'target');
    expect(pathsOf(out, 'target')).toHaveLength(1);
    expect([target!.dashed, target!.stroke, target!.opacity, target!.series]).toEqual([true, 'var(--k-fg)', 1, -1]);
    expect(moves(target!.d)).toBe(2);
    expect(out.dots.every((d) => d.series === 0), 'it has no dots').toBe(true);
    expect(out.valueTicks.at(-1)!.label, 'the domain holds it').toBe('12');

    const none = layoutLines(lineOf([[1], [2]]), SIZE, NONE);
    expect(pathsOf(none, 'target')).toEqual([]);
  });

  it('draws an earlier or target figure with no neighbour as a short tick, since nothing else shows it', () => {
    const model = lineOf([[1], [2], [3]], { compared: true }, [{ target: 5 }, { previous: 4, compared: true }, { target: 5 }]);
    const out = layoutLines(model, SIZE, NONE);
    const tick = /^M(-?[\d.]+),(-?[\d.]+)L(-?[\d.]+),(-?[\d.]+)$/;
    const [previous] = pathsOf(out, 'previous');
    const [x1, y1, x2, y2] = tick.exec(previous!.d)!.slice(1).map(Number) as [number, number, number, number];
    expect(y1, 'level').toBe(y2);
    expect((x1 + x2) / 2, 'centred on its bucket').toBeCloseTo(out.bucketX[1]!);
    expect(x2 - x1).toBeGreaterThan(0);
    expect(moves(pathsOf(out, 'target')[0]!.d), 'the two lone targets').toBe(2);

    const one = layoutLines(lineOf([[4]], {}, [{ target: 4 }]), SIZE, NONE);
    expect(tick.test(pathsOf(one, 'target')[0]!.d), 'a single bucket still shows its target').toBe(true);
    expect(finite(out) && finite(one)).toBe(true);
  });

  it('draws nothing for a series of nulls, with no NaN', () => {
    const rows: [string, LineLayout][] = [
      ['every value null', layoutLines(lineOf([[null], [null], [null]]), SIZE, NONE)],
      ['two series of nulls', layoutLines(lineOf([[null, null], [null, null]]), SIZE, NONE)],
      ['no buckets', layoutLines(lineOf([]), SIZE, NONE)],
      ['a box with no size', layoutLines(lineOf([[1], [2]], {}, [{ target: 3 }]), { width: 0, height: 0 }, NONE)],
      ['a value that is not a number', layoutLines(lineOf([[Number.NaN], [Number.POSITIVE_INFINITY], [3]]), SIZE, NONE)],
    ];
    for (const [name, layout] of rows) expect(finite(layout), name).toBe(true);
    const nulls = rows[0]![1];
    expect([nulls.paths, nulls.dots, nulls.labels]).toEqual([[], [], []]);
    expect(nulls.valueTicks.map((t) => t.label), 'the domain is [0, 1]').toEqual(['0', '0.2', '0.4', '0.6', '0.8', '1']);
    expect(nulls.categoryTicks, 'the categories still show').toHaveLength(3);
    expect(nulls.bucketX).toHaveLength(3);
    expect(rows[1]![1].labels, 'a series with no point has nothing to label').toEqual([]);
    expect(rows[4]![1].dots.map((d) => d.bucket), 'only the finite value has a dot').toEqual([2]);
    const withTarget = layoutLines(lineOf([[null], [null]], {}, [{}, {}]), SIZE, NONE);
    expect(withTarget.paths).toEqual([]);
  });

  it('centres one bucket, and draws a flat line across the middle of the plot', () => {
    const one = layoutLines(lineOf([[4]]), SIZE, NONE);
    expect(one.dots).toHaveLength(1);
    expect(one.dots[0]!.cx, 'centred in the plot').toBeCloseTo(one.plot.x + one.plot.width / 2);
    expect(one.categoryTicks).toHaveLength(1);
    expect(finite(one)).toBe(true);

    const flat = layoutLines(lineOf([[5], [5], [5]]), SIZE, NONE);
    expect(flat.dots.map((d) => d.cy), 'one height').toEqual([flat.dots[0]!.cy, flat.dots[0]!.cy, flat.dots[0]!.cy]);
    expect(flat.dots[0]!.cy, 'a flat line has no extent to scale, so it runs through the middle').toBeCloseTo(flat.plot.y + flat.plot.height / 2);
    expect(flat.valueTicks.map((t) => t.label)).toEqual(['5']);
    expect(finite(flat)).toBe(true);
  });

  it('gives two to four series direct labels at their last point, pushed 12 px apart', () => {
    const model = lineOf([[5, 5, 5], [8, 8, 9], [30, 30.5, 10]]);
    const out = layoutLines(model, SIZE, NONE);
    expect(out.labels.map((l) => [l.series, l.text])).toEqual([[0, 'S0'], [1, 'S1'], [2, 'S2']]);
    for (const label of out.labels) {
      const dot = dotAt(out, label.series, 2)!;
      expect(label.x, 'right of its last point').toBeCloseTo(dot.cx + 8);
      expect(label.y, 'only ever pushed down').toBeGreaterThanOrEqual(dot.cy - 1e-9);
      expect(label.x + label.text.length * CHAR, 'inside the box').toBeLessThanOrEqual(SIZE.width);
    }
    const byY = [...out.labels].sort((a, b) => a.y - b.y);
    expect(byY.map((l) => l.series), 'S1 ends highest, then S0, then S2').toEqual([1, 0, 2]);
    expect(byY[0]!.y, 'the top label stays at its point').toBeCloseTo(dotAt(out, 1, 2)!.cy);
    byY.slice(1).forEach((l, i) => expect(l.y - byY[i]!.y, `label ${i + 1}`).toBeGreaterThanOrEqual(12 - 1e-9));
    expect(Math.abs(dotAt(out, 0, 2)!.cy - dotAt(out, 1, 2)!.cy), 'the points themselves are closer than that').toBeLessThan(12);
    expect(rightOfPlot(out), 'the plot gives up 6.2 px a character and 8').toBeCloseTo(CHAR * 2 + 8);

    const trailing = layoutLines(lineOf([[1, 1], [2, null], [null, null]]), SIZE, NONE);
    expect(trailing.labels.find((l) => l.series === 1)!.x, 'a series that stops early is labelled where it stops').toBeCloseTo(dotAt(trailing, 1, 0)!.cx + 8);

    const bottom = layoutLines(lineOf([[0, 0, 0, 0], [0, 0, 0, 0]]), SIZE, NONE);
    const ys = bottom.labels.map((l) => l.y).sort((a, b) => a - b);
    ys.slice(1).forEach((y, i) => expect(y - ys[i]!).toBeGreaterThanOrEqual(12 - 1e-9));
    expect(ys.at(-1)!, 'the stack of labels is pulled back inside the plot').toBeLessThanOrEqual(bottom.plot.y + bottom.plot.height);
    expect(finite(out) && finite(bottom)).toBe(true);
  });

  it('cuts a long series label to the gutter, which stops at 120', () => {
    const model = lineOf([[1, 2], [3, 4]]);
    model.series[0] = { ...model.series[0]!, label: 'Quarterly recurring revenue from enterprise accounts' };
    const out = layoutLines(model, SIZE, NONE);
    expect(rightOfPlot(out)).toBeCloseTo(120);
    const [cut, whole] = out.labels;
    expect(cut!.text.endsWith('…')).toBe(true);
    expect(model.series[0]!.label.startsWith(cut!.text.slice(0, -1))).toBe(true);
    expect(cut!.text.length * CHAR).toBeLessThanOrEqual(120 - 8);
    expect(whole!.text).toBe('S1');
    expect(cut!.x + cut!.text.length * CHAR, 'inside the box').toBeLessThanOrEqual(SIZE.width);
  });

  it('labels from two to four visible series, and from no other number', () => {
    const grid = (n: number) => [Array.from({ length: n }, (_, i) => i + 1), Array.from({ length: n }, (_, i) => i + 2)];
    const rows: [string, (number | null)[][], number[], number[]][] = [
      ['one series', [[1], [2]], [], []],
      ['two', grid(2), [], [0, 1]],
      ['four', grid(4), [], [0, 1, 2, 3]],
      ['five', grid(5), [], []],
      ['six', grid(6), [], []],
      ['five, one hidden', grid(5), [2], [0, 1, 3, 4]],
      ['five, two hidden', grid(5), [0, 4], [1, 2, 3]],
      ['three, two hidden', grid(3), [0, 1], []],
      ['three, one of them all null', [[1, null, 3], [2, null, 4]], [], [0, 2]],
    ];
    for (const [name, values, hide, labelled] of rows) {
      const out = layoutLines(lineOf(values), SIZE, new Set(hide));
      expect(out.labels.map((l) => l.series), name).toEqual(labelled);
      if (labelled.length === 0) expect(rightOfPlot(out), `${name}: no gutter`).toBe(8);
    }
  });

  it('puts the buckets at the centres of a band, and the axes follow the column rules', () => {
    const days = Array.from({ length: 400 }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10));
    const long = ['A very long account name that cannot possibly fit in a gutter', 'Short', 'Other', 'Northern region accounts', 'Southern region accounts'];
    const rows: [string, (number | null)[][], string[], Size][] = [
      ['five buckets', [[0], [40], [100], [60], [20]], ['one', 'two', 'three', 'four', 'five'], SIZE],
      ['400 daily buckets', days.map((_, i) => [(i % 7) * 10]), days, SIZE],
      ['long names', long.map((_, i) => [i * 20]), long, { width: 300, height: 240 }],
      ['a large number', [[0], [1_234_567]], ['a', 'b'], SIZE],
    ];
    for (const [name, values, labels, size] of rows) {
      const buckets = labels.map((label) => ({ label }));
      const line = layoutLines(lineOf(values, {}, buckets), size, NONE);
      const column = layoutBars(modelOf(values, { type: 'column' }, buckets), size, NONE);
      expect(line.plot, name).toEqual(column.plot);
      expect(line.valueTicks, name).toEqual(column.valueTicks);
      expect(line.categoryTicks, name).toEqual(column.categoryTicks);
      expect(line.bucketX, `${name}: a band's centre`).toHaveLength(values.length);
      line.bucketX.forEach((x, i) => {
        expect(x, name).toBeCloseTo(column.marks[i]!.x + column.marks[i]!.width / 2);
        expect(x, name).toBeGreaterThan(line.bucketX[i - 1] ?? -Infinity);
      });
      expect(line.dots.map((d) => d.cx), `${name}: a dot on its bucket`).toEqual(line.bucketX);
    }
  });

  it("scales the value axis to the extent of what is drawn, with no zero anchor", () => {
    const out = layoutLines(lineOf([[50], [80]]), SIZE, NONE);
    const [first, last] = [out.valueTicks[0]!, out.valueTicks.at(-1)!];
    expect([first.label, last.label]).toEqual(['50', '80']);
    expect(first.at, 'the lowest value sits on the bottom edge').toBeCloseTo(out.plot.y + out.plot.height);
    expect(last.at).toBeCloseTo(out.plot.y);
    expect(out.dots.map((d) => d.cy)).toEqual([first.at, last.at]);

    const negative = layoutLines(lineOf([[-20], [30]]), SIZE, NONE);
    expect(negative.valueTicks.map((t) => t.label)).toContain('0');
    expect(negative.dots[0]!.cy).toBeGreaterThan(negative.dots[1]!.cy);
  });

  it('names the y of zero when the axis spans it, and none when every value is on one side', () => {
    const crossing = layoutLines(lineOf([[-3], [5]]), SIZE, NONE);
    expect(crossing.zero, 'where the scale puts 0').toBeCloseTo(crossing.valueTicks.find((t) => t.label === '0')!.at);
    expect(crossing.zero!, 'between the dots').toBeGreaterThan(dotAt(crossing, 0, 1)!.cy);
    expect(crossing.zero!).toBeLessThan(dotAt(crossing, 0, 0)!.cy);
    expect(layoutLines(lineOf([[2], [5]]), SIZE, NONE).zero, 'every value above it').toBeNull();
    expect(layoutLines(lineOf([[-5], [-2]]), SIZE, NONE).zero, 'every value below it').toBeNull();
    expect(layoutLines(lineOf([[-3, 5], [4, 6]]), SIZE, new Set([0])).zero, 'a hidden series does not widen the axis').toBeNull();
    expect(finite(crossing)).toBe(true);
  });

  it("draws a filled bucket's dot hollow, and keeps the line through it", () => {
    const model = lineOf([[5], [0], [7], [null], [9]], {}, [{}, { filled: true }, {}, { filled: true }, {}]);
    const out = layoutLines(model, SIZE, NONE);
    expect(out.dots.map((d) => [d.bucket, d.hollow]), 'a filled bucket with no value has no dot').toEqual([[0, false], [1, true], [2, false], [4, false]]);
    expect(moves(pathsOf(out, 'value')[0]!.d), 'a zero is a value: the line runs through it, and breaks at the null').toBe(2);
    expect(dotAt(out, 0, 1)!.drill, 'no records behind it').toBeNull();
    expect(dotAt(out, 0, 0)!.drill).not.toBeNull();
    expect(dotAt(out, 0, 1)!.stroke, 'a ring in the series colour').toBe('var(--k-chart-1)');
    expect(dotAt(out, 0, 1)!.summary, 'spoken as a bar of the same period is').toBe('b1, S0: no records (filled)');
    expect(dotAt(out, 0, 0)!.summary).toBe('b0, S0: 5');
    expect(layoutLines(model, SIZE, NONE, { tileFilled: 'rỗng' }).dots[1]!.summary, 'in the strings it is given').toBe('b1, S0: rỗng');
  });

  it('removes a hidden series, and fits the domain to what is left', () => {
    const model = lineOf([[10, 1000], [20, 500]]);
    const hidden = layoutLines(model, SIZE, new Set([1]));
    expect(hidden.paths.map((p) => p.series)).toEqual([0]);
    expect(hidden.dots.map((d) => d.series)).toEqual([0, 0]);
    expect(hidden.valueTicks.at(-1)!.label).toBe('20');
    expect(layoutLines(model, SIZE, NONE).valueTicks.at(-1)!.label).toBe('1000');
    expect(layoutLines(model, SIZE, new Set([0, 1])).paths, 'all hidden').toEqual([]);
  });

  it('words a dot, links it and colours it by its series', () => {
    const model = lineOf([[5, 7], [2, 3]], { format: (v) => (v === null ? '—' : `$${v}`) });
    model.series[1] = { ...model.series[1]!, color: { value: '#123456' } };
    model.series[0] = { ...model.series[0]!, color: { other: true } };
    const out = layoutLines(model, SIZE, NONE);
    const dot = dotAt(out, 1, 0)!;
    expect([dot.summary, dot.stroke, dot.drill?.label]).toEqual(['b0, S1: $7', '#123456', 'b0.1']);
    expect(dotAt(out, 0, 0)!.stroke, 'an unnamed colour is the other tone, never empty').toBe('var(--k-chart-other)');
    expect(out.paths.map((p) => p.stroke)).toEqual(['var(--k-chart-other)', '#123456']);
  });
});

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  table: boolean | null;
}

const part = (el: Element, name: string) => el.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`);
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const svgOf = (el: Element) => el.shadowRoot!.querySelector('svg')!;
const inPlot = (el: Element, selector: string) => [...part(el, 'plot')!.querySelectorAll<SVGElement>(selector)];

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

afterEach(() => {
  document.body.innerHTML = '';
});

describe("<af-tile>'s lines", () => {
  it('draws the series, the earlier period, the target, the dots and the labels with token colours through style', async () => {
    const spec = chartTile('line', [measure(1, { primary: true }), measure(2)], { transform: { target: { kind: 'constant', value: 9 } } });
    const comparison = (previous: number) => ({ previous, difference: 0, percent_change: 0 });
    const result = chartResult({
      [uuid(1)]: [bucketOf('new', 5, { drill: DRILL, comparison: comparison(4), target: 9 }), bucketOf('won', 8, { comparison: comparison(6), target: 9 }), bucketOf('lost', 3, { comparison: comparison(5), target: 9 })],
      [uuid(2)]: [bucketOf('new', 2), bucketOf('won', 4), bucketOf('lost', 6)],
    });
    const el = mount({ spec, result, fields: TILE_FIELDS });
    await drawn(el);

    const paths = inPlot(el, 'path');
    expect(paths.map((p) => p.dataset.kind), 'under the series: the earlier period, then the target').toEqual(['previous', 'target', 'value', 'value']);
    const [previous, target, first, second] = paths as [SVGElement, SVGElement, SVGElement, SVGElement];
    expect([previous.style.stroke, previous.style.opacity, previous.style.fill]).toEqual(['var(--k-chart-1)', '0.4', 'none']);
    expect([target.style.stroke, target.getAttribute('stroke-dasharray'), target.getAttribute('stroke-width')]).toEqual(['var(--k-fg)', '4 3', '1.5']);
    expect([first.style.stroke, first.getAttribute('stroke-width'), first.hasAttribute('stroke-dasharray')]).toEqual(['var(--k-chart-1)', '2', false]);
    expect(second.style.stroke).toBe('var(--k-chart-2)');
    expect(first.getAttribute('d')).toMatch(/^M[\d.]+,[\d.]+C/);

    const dots = inPlot(el, 'circle');
    expect(dots, 'one for each value of each series').toHaveLength(6);
    expect(new Set(dots.map((d) => d.getAttribute('r')))).toEqual(new Set(['3.5']));
    expect(dots.slice(0, 3).map((d) => [d.style.fill, d.style.stroke]), 'a solid dot').toEqual(Array(3).fill(['var(--k-chart-1)', 'var(--k-chart-1)']));
    expect(svgOf(el).querySelectorAll('[fill], [stroke]'), 'no presentation attribute for a colour').toHaveLength(0);
    expect(svgOf(el).getAttribute('viewBox')).toBe('0 0 480 240');
    expect(part(el, 'state')).toBeNull();

    const named = inPlot(el, 'text');
    expect(named.map((t) => words(t)), 'two labels at the line ends').toEqual(['count', 'count']);
    expect(named.map((t) => t.style.fill)).toEqual(['var(--k-fg)', 'var(--k-fg)']);
    expect(Number(named[0]!.getAttribute('x')), 'right of the last point').toBeGreaterThan(Number(dots[2]!.getAttribute('cx')));
    const css = [...el.shadowRoot!.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/\s+/g, '');
    expect(css, 'a rule of Lines.svelte').toMatch(/\.name[^{]*\{font-size:11px;font-weight:500/);
  });

  it('draws an emphasised zero line when a line chart crosses zero, and none when every value is positive', async () => {
    const tileOf = (...values: number[]) => ({
      spec: chartTile('line', [measure(1, { primary: true })]),
      result: chartResult({ [uuid(1)]: values.map((v, i) => bucketOf(`k${i}`, v)) }),
      fields: TILE_FIELDS,
    });

    const crossing = mount(tileOf(-3, 5));
    await drawn(crossing);
    const zero = part(crossing, 'zero')!;
    expect(zero, 'present for values of both signs').not.toBeNull();
    expect(zero.tagName.toLowerCase()).toBe('line');
    expect([zero.style.stroke, zero.getAttribute('stroke-width')], 'the axis tone, heavier than a grid line').toEqual(['var(--k-chart-axis)', '1.5']);
    expect(zero.getAttribute('aria-hidden'), 'decoration the marks do not need').toBe('true');
    expect(svgOf(crossing).querySelectorAll('[fill], [stroke]'), 'no presentation attribute for a colour').toHaveLength(0);

    // The grid line of the tick labelled 0 runs across the plot at the same y: the zero line lies on it.
    const grid = [...svgOf(crossing).querySelectorAll<SVGLineElement>('.axes line')].filter((l) => l.style.stroke === 'var(--k-chart-grid)');
    const onZero = grid.filter((l) => Math.abs(Number(l.getAttribute('y1')) - Number(zero.getAttribute('y1'))) < 0.01);
    expect(onZero, 'one grid line at the same y').toHaveLength(1);
    expect([zero.getAttribute('x1'), zero.getAttribute('x2'), zero.getAttribute('y2')], 'across the plot, level').toEqual([onZero[0]!.getAttribute('x1'), onZero[0]!.getAttribute('x2'), zero.getAttribute('y1')]);
    const marks = inPlot(crossing, 'circle');
    expect(Number(zero.getAttribute('y1')), 'between the two dots').toBeLessThan(Number(marks[0]!.getAttribute('cy')));
    expect(Number(zero.getAttribute('y1'))).toBeGreaterThan(Number(marks[1]!.getAttribute('cy')));

    const positive = mount(tileOf(2, 5));
    await drawn(positive);
    expect(part(positive, 'zero'), 'every value above zero').toBeNull();
  });

  it('draws a gap and a hollow dot, and offers the table', async () => {
    const spec = chartTile('line', [measure(1, { primary: true })], { label: 'Deals over time' });
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 5), bucketOf('won', null), bucketOf('lost', 0, { filled: true }), bucketOf('new', 7)] });
    const el = mount({ spec, result, fields: TILE_FIELDS });
    await drawn(el);
    expect(inPlot(el, 'path').map((p) => p.getAttribute('d')!.split('M').length - 1), 'a gap, so two runs').toEqual([2]);
    const dots = inPlot(el, 'circle');
    expect(dots.map((d) => d.dataset.bucket), 'no dot in the gap').toEqual(['0', '2', '3']);
    expect(dots.map((d) => d.style.fill), 'the filled bucket is a ring').toEqual(['var(--k-chart-1)', 'var(--k-surface)', 'var(--k-chart-1)']);
    expect(dots.map((d) => d.style.stroke)).toEqual(Array(3).fill('var(--k-chart-1)'));
    expect(words(part(el, 'title'))).toBe('Deals over time');

    const toggle = part(el, 'table-toggle') as HTMLButtonElement;
    expect(words(toggle)).toBe('Show as table');
    toggle.click();
    await drawn(el, 'table');
    expect(part(el, 'plot')).toBeNull();
    expect([...part(el, 'table')!.querySelectorAll('tbody tr')].map((r) => words(r.lastElementChild))).toEqual(['5', '—', '0', '7']);
  });

  it('draws no toggle of its own when the host says which it shows, and shows what the host says', async () => {
    const spec = chartTile('line', [measure(1, { primary: true })], { label: 'Deals over time' });
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 5), bucketOf('won', 8)] });
    const el = mount({ spec, result, fields: TILE_FIELDS, table: false });
    await drawn(el);
    expect(part(el, 'table-toggle'), 'the host draws the toggle').toBeNull();
    expect(part(el, 'table')).toBeNull();
    expect(words(part(el, 'head')), 'the head holds only the title').toBe('Deals over time');

    el.table = true;
    await drawn(el, 'table');
    expect(part(el, 'plot')).toBeNull();
    expect(part(el, 'table-toggle')).toBeNull();

    el.table = false;
    await drawn(el);
    expect(part(el, 'table')).toBeNull();
  });
});
