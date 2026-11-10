import { describe, expect, it } from 'vitest';
import type { components } from '@reflexify/agentflow-sdk';
import { OPTION_COLOR_VALUES, categoryColors } from '@reflexify/agentflow-sdk/figures';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import { chartModel, paint, tableOf } from '../../src/kit/tile/chart-model.js';
import type { ChartModel } from '../../src/kit/tile/chart-model.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/tile/types.js';
import { kitText } from '../../src/kit/text.js';
import { DRILL, TILE_FIELDS, amount, bucketOf, chartResult, chartTile, measure, tileResult, uuid } from './fixtures/tile.js';

type Schemas = components['schemas'];

const EN = kitText('en');
const STAGE = TILE_FIELDS.find((f) => f.key === 'stage')!;

const build = (
  spec: AfTileSpec,
  result: AfTileResult,
  fields: readonly FigureField[] | null | undefined = TILE_FIELDS,
  drillable = false,
  locale: string | undefined = 'en',
): ChartModel => chartModel(spec, result, fields, EN, locale, drillable);

const compare = (previous: number | null, difference: number | null = null, percent_change: number | null = null): Schemas['Comparison'] => ({
  previous,
  difference,
  percent_change,
});

describe("a chart's model", () => {
  it('has series and colours, stacked and grouped', () => {
    const stacked = chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage' } });
    const segments = (list: [string, number][]) => list.map(([key, value]) => bucketOf(key, value));
    const result = chartResult({
      [uuid(1)]: [
        bucketOf('new', 10, { segments: segments([['lost', 4], ['won', 3], ['$restricted', 2], ['$other', 1]]) }),
        bucketOf('won', 6, { segments: segments([['won', 6]]) }),
      ],
    });
    const model = build(stacked, result);
    const keys = ['lost', 'won', '$other', '$restricted'];
    expect(model.stacked).toBe(true);
    expect(model.series.map((s) => s.segment), 'in segment order, the folds last').toEqual(keys);
    expect(model.series.map((s) => s.color)).toEqual(categoryColors(keys, STAGE));
    expect(model.series.map((s) => s.pattern)).toEqual([null, null, 'other', 'restricted']);
    expect(model.series.map((s) => s.label), 'an option by its label, a fold by its word, a stale key as itself').toEqual(['lost', 'Closed won', '(Other)', '(Restricted)']);
    expect(model.series.every((s) => s.measure === uuid(1))).toBe(true);

    const grouped = chartTile(
      'column',
      Array.from({ length: 9 }, (_, i) => measure(i + 1, { primary: i === 0, ...(i === 1 ? { color: 'rose' } : {}), ...(i === 2 ? { color: '#ff0000' } : {}), ...(i === 3 ? { label: 'Named' } : {}) })),
    );
    const wide = build(grouped, chartResult({}));
    expect(wide.stacked).toBe(false);
    expect(wide.series.map((s) => s.color)).toEqual([
      { slot: 1 }, { value: OPTION_COLOR_VALUES.rose }, { value: '#ff0000' }, { slot: 4 }, { slot: 5 }, { slot: 6 }, { slot: 7 }, { slot: 8 }, { other: true },
    ]);
    expect(wide.series.map((s) => s.pattern), 'a ninth measure is other, and hatched').toEqual([null, null, null, null, null, null, null, null, 'other']);
    expect(wide.series.map((s) => [s.label, s.measure, s.segment]).slice(2, 4)).toEqual([['count', uuid(3), null], ['Named', uuid(4), null]]);

    // The primary leads, and each measure keeps the colour its place in the authored list gave it.
    const reordered = build(chartTile('column', [measure(1), measure(2, { primary: true }), measure(3)]), chartResult({}));
    expect(reordered.series.map((s) => [s.measure, s.color])).toEqual([[uuid(2), { slot: 2 }], [uuid(1), { slot: 1 }], [uuid(3), { slot: 3 }]]);

    // A tile of two units draws its primary's unit.
    const mixed = build(chartTile('column', [measure(1, { primary: true }), amount(2)]), chartResult({}));
    expect(mixed.series.map((s) => s.measure)).toEqual([uuid(1)]);

    // A stack by a field on another entity has no field here: its keys colour by appearance.
    const across = build(chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage', via: 'reference:accounts:owner' } }), result);
    expect(across.series.map((s) => s.color)).toEqual(categoryColors(keys));
    expect(across.series.map((s) => s.label)).toEqual(['lost', 'won', '(Other)', '(Restricted)']);

    // A line is never stacked.
    expect(build(chartTile('line', [measure(1, { primary: true })], { stack_by: { field: 'stage' } }), result).stacked).toBe(false);
  });

  it('joins every measure by key', () => {
    const spec = chartTile('column', [measure(1, { primary: true }), measure(2)]);
    const result = chartResult({
      [uuid(1)]: [
        bucketOf('new', 5, { target: 8, drill: DRILL }),
        bucketOf('won', 7, { other: true, comparison: compare(4, 3, 0.75) }),
        bucketOf('$restricted', 2),
        bucketOf(null, 1, { filled: true }),
        bucketOf('x', null, { unmatched: true, comparison: compare(6) }),
      ],
      [uuid(2)]: [bucketOf('won', 70, { count: 9 }), bucketOf('new', 50, { count: 8 }), bucketOf(null, 10, { count: 3 })],
    });
    const model = build(spec, result, TILE_FIELDS, true);
    expect(model.buckets.map((b) => b.key), 'the primary measure sets the buckets and their order').toEqual(['new', 'won', '$restricted', null, 'x']);
    expect(model.buckets.map((b) => b.label)).toEqual(['new', 'Closed won', '(Restricted)', '(Empty)', 'x']);
    expect(model.buckets.map((b) => b.values), 'a bucket a measure lacks is null').toEqual([[5, 50], [7, 70], [2, null], [1, 10], [null, null]]);
    expect(model.buckets.map((b) => b.counts), 'with a count of 0').toEqual([[5, 8], [7, 9], [2, 0], [1, 3], [0, 0]]);
    expect(model.buckets.map((b) => b.drills.map((d) => d !== null)), 'and no drill').toEqual([[true, false], [false, false], [false, false], [false, false], [false, false]]);
    expect(model.buckets.map((b) => [b.other, b.restricted, b.filled, b.unmatched])).toEqual([
      [false, false, false, false],
      [true, false, false, false],
      [false, true, false, false],
      [false, false, true, false],
      [false, false, false, true],
    ]);
    expect(model.buckets.map((b) => b.target)).toEqual([8, null, null, null, null]);
    expect(model.buckets.map((b) => [b.compared, b.previous, b.difference, b.percentChange])).toEqual([
      [false, null, null, null],
      [true, 4, 3, 0.75],
      [false, null, null, null],
      [false, null, null, null],
      [true, 6, null, null],
    ]);
    expect(model.compared).toBe(true);
    expect(model.splitLabel).toBe('Stage');
    expect(model.type).toBe('column');
    expect(model.empty).toBe(false);
    expect(model.format(1234.5)).toBe('1,234.5');
    expect(model.format(null)).toBe('—');

    const plain = build(chartTile('bar', [measure(1, { primary: true })]), chartResult({ [uuid(1)]: [bucketOf('new', 5)] }));
    expect([plain.compared, plain.buckets[0]!.compared]).toEqual([false, false]);
  });

  it('labels a segment drill bucket · segment, and gates every drill as the number tile does', () => {
    const OTHER = { field_filters: [{ field: 'stage', op: 'eq', value: 'lost' }] } as Schemas['EntityRecordFilters'];
    const spec = chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage' } });
    const buckets = (over: Partial<Schemas['Bucket']> = {}) => [
      bucketOf('new', 10, { drill: DRILL, count: 10, segments: [bucketOf('won', 6, { drill: OTHER, count: 6 }), bucketOf('lost', 4, { count: 4 }), bucketOf('$other', 1, { drill: DRILL, count: 1, other: true })], ...over }),
    ];
    const model = build(spec, chartResult({ [uuid(1)]: buckets() }), TILE_FIELDS, true);
    expect(model.series.map((s) => s.segment)).toEqual(['won', 'lost', '$other']);
    expect(model.buckets[0]!.drills).toEqual([
      { drill: OTHER, measure: uuid(1), bucket: 'new', segment: 'won', label: 'new · Closed won', count: 6, other: false },
      null,
      { drill: DRILL, measure: uuid(1), bucket: 'new', segment: '$other', label: 'new · (Other)', count: 1, other: true },
    ]);

    const flat = build(chartTile('column', [measure(1, { primary: true }), measure(2)]), chartResult({
      [uuid(1)]: [bucketOf('won', 6, { drill: DRILL, count: 6 }), bucketOf('$other', 2, { drill: DRILL, count: 2, other: true })],
      [uuid(2)]: [bucketOf('won', 3, { drill: OTHER, count: 3 })],
    }), TILE_FIELDS, true);
    expect(flat.buckets.map((b) => b.drills)).toEqual([
      [
        { drill: DRILL, measure: uuid(1), bucket: 'won', segment: null, label: 'Closed won', count: 6, other: false },
        { drill: OTHER, measure: uuid(2), bucket: 'won', segment: null, label: 'Closed won', count: 3, other: false },
      ],
      [{ drill: DRILL, measure: uuid(1), bucket: '$other', segment: null, label: '(Other)', count: 2, other: true }, null],
    ]);

    const gated: [string, AfTileSpec, AfTileResult, boolean, { enabled: boolean; disabled: boolean }][] = [
      ['the element has no drill', spec, chartResult({ [uuid(1)]: buckets() }), false, { enabled: false, disabled: false }],
      ['the tile turns drilling off', { ...spec, drill_disabled: true } as AfTileSpec, chartResult({ [uuid(1)]: buckets() }), true, { enabled: false, disabled: true }],
      ['the tile turns it off and the element has none', { ...spec, drill_disabled: true } as AfTileSpec, chartResult({ [uuid(1)]: buckets() }), false, { enabled: false, disabled: false }],
      ['the result is not ok', spec, chartResult({ [uuid(1)]: buckets() }, { outcome: 'failed' }), true, { enabled: false, disabled: false }],
    ];
    for (const [name, gatedSpec, gatedResult, drillable, state] of gated) {
      const gatedModel = build(gatedSpec, gatedResult, TILE_FIELDS, drillable);
      expect(gatedModel.buckets[0]!.drills.every((d) => d === null), name).toBe(true);
      expect(gatedModel.drill, `${name}: what a tooltip may say`).toEqual(state);
    }
    expect(model.drill, 'open when nothing stops it').toEqual({ enabled: true, disabled: false });
  });

  it('lists its legend items in order: the series, the earlier period, the target, the filled periods', () => {
    const base = [measure(1, { primary: true }), measure(2, { label: 'Second' })];
    const plain = [bucketOf('new', 5), bucketOf('won', 7)];
    const withEarlier = [bucketOf('new', 5, { comparison: compare(4, 1, 0.25) }), bucketOf('won', 7)];
    const withTarget = [bucketOf('new', 5, { target: 6 }), bucketOf('won', 7)];
    const withFilled = [bucketOf('new', 5), bucketOf('won', null, { filled: true })];
    const legend = (chart: Schemas['ChartType'], buckets: Schemas['Bucket'][], extra: Record<string, unknown> = {}) =>
      build(chartTile(chart, base, extra), chartResult({ [uuid(1)]: buckets, [uuid(2)]: [bucketOf('new', 1)] })).legend.map((l) => [l.kind, l.label, l.series]);
    const series = [['series', 'count', 0], ['series', 'Second', 1]];

    expect(legend('column', plain)).toEqual(series);
    expect(legend('column', withEarlier)).toEqual([...series, ['earlier', 'earlier period', null]]);
    expect(legend('line', withEarlier)).toEqual([...series, ['earlier', 'earlier period', null]]);
    expect(legend('column', withTarget)).toEqual([...series, ['target', 'target', null]]);
    expect(legend('column', withFilled)).toEqual([...series, ['filled', 'no records (filled)', null]]);
    const all = [bucketOf('new', 5, { comparison: compare(4), target: 6 }), bucketOf('won', null, { filled: true })];
    expect(legend('bar', all)).toEqual([...series, ['earlier', 'earlier period', null], ['target', 'target', null], ['filled', 'no records (filled)', null]]);

    // A stack draws no earlier period.
    const stacked = [bucketOf('new', 5, { comparison: compare(4), segments: [bucketOf('won', 5)] })];
    expect(legend('column', stacked, { stack_by: { field: 'stage' } }).map((l) => l[0])).toEqual(['series']);
    expect(legend('line', stacked, { stack_by: { field: 'stage' } }).map((l) => l[0]), 'a line is not stacked').toEqual(['series', 'series', 'earlier']);

    const items = build(chartTile('column', base), chartResult({ [uuid(1)]: all })).legend;
    expect(items[0]).toEqual({ kind: 'series', label: 'count', series: 0, bucket: null, detail: null, color: { slot: 1 }, pattern: null });
    expect(items[2], 'the earlier period wears the primary series colour').toEqual({ kind: 'earlier', label: 'earlier period', series: null, bucket: null, detail: null, color: { slot: 1 }, pattern: null });
    expect(items[3], 'a target has no series colour').toMatchObject({ kind: 'target', color: null, pattern: null });
  });

  it('is empty with no buckets, and over a population of zero', () => {
    const spec = chartTile('column', [measure(1, { primary: true })]);
    expect(build(spec, chartResult({ [uuid(1)]: [] })).empty).toBe(true);
    expect(build(spec, tileResult({})).empty, 'no result for the measure').toBe(true);
    expect(build(spec, chartResult({ [uuid(1)]: [bucketOf('new', 0)] }, { population: { capped: false, count: 0, membership_rule: 'all' } })).empty).toBe(true);
    expect(build(spec, chartResult({ [uuid(1)]: [bucketOf('new', 0)] })).empty).toBe(false);
    expect(build(spec, chartResult({ [uuid(1)]: [bucketOf('new', 0)] }, { population: null })).empty, 'a result with no population').toBe(false);
  });

  it('draws with no fields: raw keys, plain numbers, colour by appearance', () => {
    const spec = chartTile('column', [amount(1, { primary: true }), amount(2, { fn: 'avg' })], { stack_by: undefined });
    const buckets = {
      [uuid(1)]: [bucketOf('won', 1234.5), bucketOf('zeta', 2)],
      [uuid(2)]: [bucketOf('won', 5)],
    };
    const lacking: FigureField[] = [{ key: 'rate', type: 'number', label: 'Rate', format: 'percent' }];
    for (const fields of [null, undefined, lacking]) {
      const model = chartModel(spec, chartResult(buckets), fields, EN, 'en', false);
      expect(model.series.map((s) => s.label), 'a measure is labelled by its field key').toEqual(['sum · amount', 'avg · amount']);
      expect(model.buckets.map((b) => b.label), 'a bucket by its raw key').toEqual(['won', 'zeta']);
      expect(model.splitLabel).toBe('stage');
      expect(model.format(1234.5), 'a plain number').toBe('1,234.5');
      expect(model.format(null)).toBe('—');
      expect(model.empty).toBe(false);
    }

    const stacked = chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage' } });
    const result = chartResult({ [uuid(1)]: [bucketOf('x', 3, { segments: [bucketOf('zeta', 1), bucketOf('won', 2)] })] });
    const model = build(stacked, result, null);
    expect(model.series.map((s) => [s.label, s.color]), 'by appearance, from the first slot').toEqual([['zeta', { slot: 1 }], ['won', { slot: 2 }]]);
  });

  it('is tolerant of a spec that is not a chart, and of a tile with no measures', () => {
    const number = { kind: 'number', id: uuid(90), position: { col: 0, row: 0, w: 1, h: 1 }, query: { entity_id: uuid(91), measures: [measure(1)] } } as AfTileSpec;
    expect(build(number, chartResult({ [uuid(1)]: [bucketOf('a', 1)] })).empty).toBe(true);
    const none = build(chartTile('column', []), chartResult({}));
    expect([none.series, none.buckets, none.empty]).toEqual([[], [], true]);
  });
});

describe('paint', () => {
  it('turns a colour into what a mark is painted with', () => {
    expect(paint({ slot: 3 })).toBe('var(--k-chart-3)');
    expect(paint({ value: 'oklch(0.55 0.22 285)' })).toBe('oklch(0.55 0.22 285)');
    expect(paint({ other: true })).toBe('');
    expect(paint(null)).toBe('');
  });
});

describe("a chart's table", () => {
  const spec = chartTile('column', [measure(1, { primary: true }), measure(2, { label: 'Second' })]);
  const compared = () =>
    build(
      spec,
      chartResult({
        [uuid(1)]: [
          bucketOf('new', 5, { target: 8, comparison: compare(4, 1, 0.25) }),
          bucketOf('won', 7, { comparison: compare(null) }),
          bucketOf('$other', null, { comparison: compare(3, null, null) }),
          bucketOf(null, 2, { comparison: compare(0, 2, null) }),
          bucketOf('x', null, { unmatched: true, comparison: compare(6) }),
          bucketOf('y', 1, { comparison: compare(2, -1, -0.5) }),
        ],
        [uuid(2)]: [bucketOf('new', 1500.5)],
      }),
    );

  it('is in order, with the comparison and target columns', () => {
    const table = tableOf([compared()], new Set(), EN);
    expect(table.head).toEqual(['Stage', 'count', 'Second', 'earlier period', 'difference', 'target']);
    expect(table.rows).toEqual([
      ['new', '5', '1,500.5', '4', '+25%', '8'],
      ['Closed won', '7', '—', '—', 'new', '—'],
      ['(Other)', '—', '—', '3', 'gone', '—'],
      ['(Empty)', '2', '—', '0', 'no earlier figure', '—'],
      ['x', '—', '—', '6', 'no matching day', '—'],
      ['y', '1', '—', '2', '−50%', '—'],
    ]);
  });

  it('words the percent change in the locale it is given', () => {
    expect(tableOf([compared()], new Set(), EN, 'vi').rows[0]![4]).toBe('+25%');
    const model = build(chartTile('column', [measure(1, { primary: true })]), chartResult({ [uuid(1)]: [bucketOf('new', 5, { comparison: compare(4, 1, 0.255) })] }));
    expect(tableOf([model], new Set(), EN, 'en').rows[0]![3]).toBe('+25.5%');
    expect(tableOf([model], new Set(), EN, 'vi').rows[0]![3]).toBe('+25,5%');
  });

  it('has neither extra column without a comparison or a target, and leaves out a hidden series', () => {
    const plain = build(spec, chartResult({ [uuid(1)]: [bucketOf('new', 5), bucketOf('won', 7)], [uuid(2)]: [bucketOf('won', 70)] }));
    expect(tableOf([plain], new Set(), EN)).toEqual({ head: ['Stage', 'count', 'Second'], rows: [['new', '5', '—'], ['Closed won', '7', '70']] });
    expect(tableOf([plain], new Set([0]), EN)).toEqual({ head: ['Stage', 'Second'], rows: [['new', '—'], ['Closed won', '70']] });

    const targeted = build(chartTile('column', [measure(1, { primary: true })]), chartResult({ [uuid(1)]: [bucketOf('new', 5, { target: 6 })] }));
    expect(tableOf([targeted], new Set(), EN).head).toEqual(['Stage', 'count', 'target']);
  });

  it('has a column for each segment of a stack', () => {
    const stacked = build(
      chartTile('column', [measure(1, { primary: true })], { stack_by: { field: 'stage' } }),
      chartResult({ [uuid(1)]: [bucketOf('new', 9, { segments: [bucketOf('won', 6), bucketOf('$other', 3)] }), bucketOf('won', 1, { segments: [bucketOf('won', 1)] })] }),
    );
    expect(tableOf([stacked], new Set(), EN)).toEqual({ head: ['Stage', 'Closed won', '(Other)'], rows: [['new', '6', '3'], ['Closed won', '1', '—']] });
  });
});
