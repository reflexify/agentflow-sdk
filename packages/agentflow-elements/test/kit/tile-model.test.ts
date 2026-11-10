import { describe, expect, it } from 'vitest';
import type { components, ComputedTile, ComputeTile } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import { frameModel, measureId, wordOf, type TileState } from '../../src/kit/tile/frame.js';
import { numberModel, type FigureModel, type NumberModel } from '../../src/kit/tile/number.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/tile/types.js';
import { KIT_TEXT, fill, kitText } from '../../src/kit/text.js';

type Schemas = components['schemas'];

const EN = kitText('en');
const VI = kitText('vi');

const FIELDS: FigureField[] = [
  { key: 'amount', type: 'number', label: 'Amount', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 2 } },
  { key: 'rate', type: 'number', label: 'Rate', format: 'percent' },
  { key: 'stage', type: 'enum', label: 'Stage', enum_values: [{ value: 'new' }, { value: 'won', label: 'Closed won' }] },
  { key: 'opened', type: 'datetime', label: 'Opened' },
  { key: 'closed', type: 'datetime', label: 'Closed' },
];

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const POSITION = { col: 0, row: 0, w: 4, h: 3 };

const measure = (n: number, over: Partial<Schemas['TileMeasure']> = {}) =>
  ({ id: uuid(n), fn: 'count', primary: false, ...over }) as Schemas['TileMeasure'];
const amount = (n: number, over: Partial<Schemas['TileMeasure']> = {}) => measure(n, { fn: 'sum', field: 'amount', ...over });
const rate = (n: number, over: Partial<Schemas['TileMeasure']> = {}) => measure(n, { fn: 'avg', field: 'rate', ...over });

const numberTile = (measures: Schemas['TileMeasure'][], extra: Record<string, unknown> = {}) =>
  ({ kind: 'number', id: uuid(90), position: POSITION, query: { entity_id: uuid(91), measures }, ...extra }) as AfTileSpec;
const chartTile = (chart: Schemas['ChartType'], measures: Schemas['TileMeasure'][], extra: Record<string, unknown> = {}) =>
  ({ kind: 'chart', chart, id: uuid(90), position: POSITION, query: { entity_id: uuid(91), measures }, split_by: { field: 'stage' }, ...extra }) as AfTileSpec;

const measureResult = (over: Partial<Schemas['MeasureResult']> = {}): Schemas['MeasureResult'] => ({ value: 0, population: 0, cap_bound: null, ...over });
const populationOf = (over: Partial<Schemas['PopulationInfo']> = {}): Schemas['PopulationInfo'] => ({ capped: false, count: 0, membership_rule: 'all', ...over });
const tileResult = (measures: Record<string, Schemas['MeasureResult']>, over: Partial<Schemas['TileResult']> = {}) =>
  ({ tile_id: uuid(90), computed_at: '2026-11-01T00:00:00Z', coverage: { partial: false }, outcome: 'ok', measures, ...over }) as AfTileResult;

const frame = (spec: AfTileSpec | null, result: AfTileResult | null, fields: readonly FigureField[] | null = FIELDS) => frameModel(spec, result, fields, EN, 'en');
const figure = (value: number | null, over: Partial<Schemas['MeasureResult']> = {}, population: Partial<Schemas['PopulationInfo']> | null = {}): FigureModel =>
  numberModel(
    numberTile([amount(1, { primary: true })]),
    tileResult({ [uuid(1)]: measureResult({ value, ...over }) }, { population: population ? populationOf(population) : null }),
    FIELDS,
    EN,
    'en',
    false,
  ).primary;

describe("a tile's frame", () => {
  it('states, in order: loading, unavailable, failed, a text or list tile, not drawn, then number or chart', () => {
    const problem = { title: 'A field is gone', detail: 'Field "amount" no longer exists', status: 422, type: 'tile.failed' };
    const list = { kind: 'list', id: uuid(90), position: POSITION, entity_id: uuid(91), view_id: uuid(92) } as AfTileSpec;
    const text = { kind: 'text', id: uuid(90), position: POSITION, body: 'Hello' } as AfTileSpec;
    const unavailable = tileResult({}, { outcome: 'unavailable' });
    const rows: [string, AfTileSpec | null, AfTileResult | null, TileState][] = [
      ['no spec', null, tileResult({}), { kind: 'loading' }],
      ['no result', numberTile([measure(1)]), null, { kind: 'loading' }],
      ['unavailable', numberTile([measure(1)]), unavailable, { kind: 'unavailable' }],
      ['failed, with its problem', numberTile([measure(1)]), tileResult({}, { outcome: 'failed', problem }), { kind: 'failed', title: problem.title, detail: problem.detail }],
      ['failed, with a problem that has no detail', numberTile([measure(1)]), tileResult({}, { outcome: 'failed', problem: { ...problem, detail: null } }), { kind: 'failed', title: problem.title, detail: null }],
      ['failed, with no problem', numberTile([measure(1)]), tileResult({}, { outcome: 'failed' }), { kind: 'failed', title: EN.tileFailed, detail: null }],
      ['unavailable comes before not drawn', chartTile('area' as 'bar', [measure(1)]), unavailable, { kind: 'unavailable' }],
      ['unavailable, for a list tile', list, unavailable, { kind: 'unavailable' }],
      ['unavailable, for a text tile', text, unavailable, { kind: 'unavailable' }],
      ['failed comes before not drawn', text, tileResult({}, { outcome: 'failed' }), { kind: 'failed', title: EN.tileFailed, detail: null }],
      ['a list tile whose rows and columns have not come', list, tileResult({}), { kind: 'loading' }],
      ['a list tile whose result has not come', list, null, { kind: 'loading' }],
      ['a text tile', text, tileResult({}), { kind: 'text' }],
      ['a text tile whose result has not arrived', text, null, { kind: 'text' }],
      ['a chart type the element does not know', chartTile('area' as 'bar', [measure(1)]), tileResult({}), { kind: 'not-drawn' }],
      ['a tile kind the element does not know', { ...numberTile([measure(1)]), kind: 'map' } as unknown as AfTileSpec, tileResult({}), { kind: 'not-drawn' }],
      ['a chart with a share of the total', chartTile('bar', [measure(1)], { transform: { derive: { kind: 'share_of_total' } } }), tileResult({}), { kind: 'chart', chart: 'bar' }],
      ['a chart with a derive kind the element does not know', chartTile('bar', [measure(1)], { transform: { derive: { kind: 'moving_average' } } }), tileResult({}), { kind: 'not-drawn' }],
      ['a chart over two units is drawn in a panel for each', chartTile('column', [measure(1, { primary: true }), amount(2)]), tileResult({}), { kind: 'chart', chart: 'column' }],
      ['a chart over one unit twice', chartTile('column', [measure(1, { primary: true }), measure(2)]), tileResult({}), { kind: 'chart', chart: 'column' }],
      ['a number', numberTile([measure(1)]), tileResult({}), { kind: 'number' }],
      ['a number over two units', numberTile([measure(1, { primary: true }), amount(2)]), tileResult({}), { kind: 'number' }],
      ['a bar', chartTile('bar', [measure(1)]), tileResult({}), { kind: 'chart', chart: 'bar' }],
      ['a column', chartTile('column', [measure(1)]), tileResult({}), { kind: 'chart', chart: 'column' }],
      ['a line', chartTile('line', [measure(1)]), tileResult({}), { kind: 'chart', chart: 'line' }],
      ['a pie', chartTile('pie', [measure(1)]), tileResult({}), { kind: 'chart', chart: 'pie' }],
      ['a donut', chartTile('donut', [measure(1)]), tileResult({}), { kind: 'chart', chart: 'donut' }],
      ['a pie over two units draws its primary alone', chartTile('pie', [measure(1, { primary: true }), amount(2)]), tileResult({}), { kind: 'chart', chart: 'pie' }],
    ];
    for (const [name, spec, result, state] of rows) expect(frame(spec, result).state, name).toEqual(state);

    const listed = (spec: AfTileSpec | null, result: AfTileResult | null) => frameModel(spec, result, FIELDS, EN, 'en', true);
    expect(listed(list, tileResult({})).state, 'a list tile with its rows and columns').toEqual({ kind: 'list' });
    expect(listed(list, null).state, 'but not before its result').toEqual({ kind: 'loading' });
    expect(listed(list, unavailable).state, 'nor over a result that says unavailable').toEqual({ kind: 'unavailable' });
    expect(listed(list, tileResult({})).notes, 'a list with nothing to say about the page filter has no notes').toEqual([]);
    expect(
      listed(list, tileResult({}, { coverage: { partial: false, unfiltered_by_dashboard_filter: true } })).notes,
      'a list the page filter could not reach says so under its table',
    ).toEqual([EN.tileUnfiltered]);
    expect(listed(numberTile([measure(1)]), tileResult({})).state, 'rows are no concern of another kind').toEqual({ kind: 'number' });
  });

  it('titles a tile by its authored label, else by the measure the server echoed', () => {
    const echoed: ComputeTile = { kind: 'number', query: { entity: 'deals', measures: [{ key: 'rev', metric: 'revenue' }] } };
    const computed = (metric?: Schemas['MetricSpec']) =>
      ({ tile_id: uuid(90), computed_at: '2026-11-01T00:00:00Z', coverage: { partial: false }, outcome: 'ok', measures: { rev: measureResult({ metric }) } }) as ComputedTile;
    const sum = { id: uuid(7), fn: 'sum', field: 'amount' } as Schemas['MetricSpec'];
    const rows: [string, AfTileSpec | null, AfTileResult | null, FigureField[] | null, string][] = [
      ["the echoed metric's definition", echoed, computed(sum), FIELDS, 'sum · Amount'],
      ['a metric the server did not echo', echoed, computed(), FIELDS, ''],
      ['an authored label wins', { ...echoed, label: 'Revenue' } as ComputeTile, computed(sum), FIELDS, 'Revenue'],
      ['the primary measure, wherever it sits', numberTile([measure(1), amount(2, { primary: true })]), tileResult({}), FIELDS, 'sum · Amount'],
      ['the spec alone, while loading', numberTile([amount(1)]), null, FIELDS, 'sum · Amount'],
      ['no tile yet', null, null, FIELDS, ''],
      ['a text tile without a label', { kind: 'text', id: uuid(90), position: POSITION, body: 'Hi' } as AfTileSpec, tileResult({}), FIELDS, ''],
    ];
    for (const [name, spec, result, fields, title] of rows) expect(frame(spec, result, fields).title, name).toBe(title);
  });

  it("lists a chart's notes: the cap, the coverage, then the primary measure's", () => {
    const spec = chartTile('column', [measure(1, { primary: true })]);
    const result = tileResult(
      { [uuid(1)]: measureResult({ cap_bound: 'lower', advisory: 'unweighted_average', skipped: 3 }) },
      {
        population: populationOf({ capped: true, cap: 20000, count: 20000 }),
        coverage: { partial: true, targets_withheld: true, emptied_by_filter_intersection: true, declined_dashboard_filter: true, unfiltered_by_dashboard_filter: true },
      },
    );
    expect(frame(spec, result).notes).toEqual([
      'Counted up to 20,000 records: each figure is at least what is shown',
      EN.tileUnfiltered,
      EN.tileDeclined,
      EN.tileEmptied,
      EN.tileTargetsWithheld,
      EN.tilePartial,
      EN.tileUnweightedAverage,
      '3 skipped: missing a date',
    ]);
  });

  it("words a chart's cap by its bound, and by whether the server named one", () => {
    const rows: [string, Schemas['CapBound'] | null, number | undefined, string][] = [
      ['a lower bound', 'lower', 20000, 'Counted up to 20,000 records: each figure is at least what is shown'],
      ['an upper bound', 'upper', 20000, 'Counted up to 20,000 records: each figure is at most what is shown'],
      ['no bound', null, 20000, 'a sample of the first 20,000 records'],
      ['no cap named', null, undefined, 'incomplete — no bound'],
      ['a bound but no cap named', 'lower', undefined, 'incomplete — no bound'],
    ];
    for (const [name, bound, cap, note] of rows) {
      const result = tileResult({ [uuid(1)]: measureResult({ cap_bound: bound }) }, { population: populationOf({ capped: true, cap, count: 20000 }) });
      expect(frame(chartTile('bar', [measure(1)]), result).notes, name).toEqual([note]);
    }
    const uncapped = tileResult({ [uuid(1)]: measureResult({ cap_bound: 'lower' }) }, { population: populationOf({ capped: false, cap: 20000 }) });
    expect(frame(chartTile('bar', [measure(1)]), uncapped).notes, 'not capped').toEqual([]);
  });

  it("gives a number tile its coverage notes only, leaving the cap and the measure's notes to each figure", () => {
    const result = tileResult(
      { [uuid(1)]: measureResult({ cap_bound: 'lower', skipped: 3, advisory: 'unweighted_average' }) },
      { population: populationOf({ capped: true, cap: 20000, count: 20000 }), coverage: { partial: true } },
    );
    expect(frame(numberTile([measure(1)]), result).notes).toEqual([EN.tilePartial]);
    expect(frame(numberTile([measure(1)]), tileResult({}, { outcome: 'unavailable', coverage: { partial: true } })).notes).toEqual([]);
  });
});

describe("a number tile's figures", () => {
  it("describes a figure's population and cap in its meta", () => {
    const rows: [string, FigureModel, string[]][] = [
      ['one record', figure(1, { population: 1 }), ['1 record']],
      ['many records', figure(9, { population: 1234 }), ['1,234 records']],
      ['no records, where zero is a value', figure(0, { population: 0 }), ['0 records']],
      ['capped with a lower bound', figure(5, { population: 20000, cap_bound: 'lower' }, { capped: true, cap: 20000, count: 20000 }), ['20,000 records', 'at least']],
      ['capped with an upper bound', figure(5, { population: 20000, cap_bound: 'upper' }, { capped: true, cap: 20000, count: 20000 }), ['20,000 records', 'at most']],
      ['capped with no bound', figure(5, { population: 20000 }, { capped: true, cap: 20000, count: 20000 }), ['a sample of the first 20,000 records']],
      ['capped with no bound and no cap', figure(5, { population: 20000 }, { capped: true, count: 20000 }), ['incomplete — no bound']],
      ['a cap the tile did not reach', figure(5, { population: 10, cap_bound: 'lower' }, { capped: false, cap: 20000, count: 10 }), ['10 records']],
      ['no tile population at all', figure(5, { population: 10 }, null), ['10 records']],
      ['no value', figure(null, { population: 12 }), ['No value over this population']],
      ['no value, though capped', figure(null, { population: 12, cap_bound: 'lower' }, { capped: true, cap: 20000, count: 12 }), ['No value over this population']],
      ['notes after the population', figure(5, { population: 4, advisory: 'unweighted_average', skipped: 3 }), ['4 records', EN.tileUnweightedAverage, '3 skipped: missing a date']],
      ['notes after no value', figure(null, { population: 0, skipped: 3 }), ['No value over this population', '3 skipped: missing a date']],
    ];
    for (const [name, model, meta] of rows) expect(model.meta, name).toEqual(meta);
    expect(figure(null, { population: 12 }).muted).toBe(true);
    expect(figure(0, { population: 0 }).muted).toBe(false);
  });

  it('measures the primary figure against its goal', () => {
    const goal = (spec: AfTileSpec, value: number | null, extra: Partial<Schemas['MeasureResult']> = {}) =>
      numberModel(spec, tileResult({ [uuid(1)]: measureResult({ value, ...extra }) }), FIELDS, EN, 'en', false).primary.goal;
    const constant = (target: number) => ({ transform: { target: { kind: 'constant', value: target } } });
    const money = (extra: Record<string, unknown> = {}) => numberTile([amount(1, { primary: true })], extra);
    const rows: [string, ReturnType<typeof goal>, { text: string; tone: 'short' | 'over' | 'met' | 'none' } | null][] = [
      ['short of it', goal(money(constant(500)), 400), { text: 'goal $500.00 · $100.00 short', tone: 'short' }],
      ['over it', goal(money(constant(500)), 600), { text: 'goal $500.00 · $100.00 over', tone: 'over' }],
      ['met', goal(money(constant(500)), 500), { text: 'goal $500.00 · on goal', tone: 'met' }],
      ['a percent, in points', goal(numberTile([rate(1, { primary: true })], constant(50)), 42.5), { text: 'goal 50% · 7.5 pts short', tone: 'short' }],
      ["the result's target over the tile's", goal(money(constant(500)), 400, { target: 450 }), { text: 'goal $450.00 · $50.00 short', tone: 'short' }],
      ['a target only the result names', goal(money(), 400, { target: 450 }), { text: 'goal $450.00 · $50.00 short', tone: 'short' }],
      ['no value: the goal alone, with no tone to colour', goal(money(constant(500)), null), { text: 'goal $500.00', tone: 'none' }],
      ['a target read from a field is not a constant', goal(money({ transform: { target: { kind: 'field', key: 'goal' } } }), 400), null],
      ['no target', goal(money(), 400), null],
    ];
    for (const [name, got, want] of rows) expect(got, name).toEqual(want);

    const both = numberModel(
      numberTile([amount(1, { primary: true }), amount(2)], constant(500)),
      tileResult({ [uuid(1)]: measureResult({ value: 400 }), [uuid(2)]: measureResult({ value: 400 }) }),
      FIELDS,
      EN,
      'en',
      false,
    );
    expect(both.secondaries[0]!.goal, 'a secondary has no goal').toBeNull();
  });

  it("compares a figure with the earlier period, in the figure's own unit", () => {
    const compare = (value: number | null, comparison: Schemas['Comparison'] | null) =>
      figure(value, comparison ? { comparison } : {}).comparison;
    expect(compare(1000, { previous: 800, difference: 200, percent_change: 0.25 })).toBe('vs earlier period: $800.00 · +$200.00 · +25%');
    expect(compare(800, { previous: 1000, difference: -200, percent_change: -0.2 })).toBe('vs earlier period: $1,000.00 · −$200.00 · −20%');
    expect(compare(500, { previous: 0, difference: 500, percent_change: null })).toBe('vs earlier period: $0.00 · +$500.00');
    expect(compare(500, { previous: 500, difference: null, percent_change: null })).toBe('vs earlier period: $500.00');
    expect(compare(500, { previous: null, difference: null, percent_change: null })).toBe('vs earlier period: no earlier figure');
    expect(compare(500, null)).toBeNull();

    const both = numberModel(
      numberTile([measure(1, { primary: true }), amount(2)]),
      tileResult({
        [uuid(1)]: measureResult({ value: 10 }),
        [uuid(2)]: measureResult({ value: 10, comparison: { previous: 8, difference: 2, percent_change: 0.25 } }),
      }),
      FIELDS,
      EN,
      'en',
      false,
    );
    expect([both.primary.comparison, both.secondaries[0]!.comparison], 'every figure with a comparison shows it').toEqual([null, 'vs earlier period: $8.00 · +$2.00 · +25%']);
  });

  it('shows the primary and up to three more, in authored order, labelled when there are several', () => {
    const measures = [
      measure(1, { fn: 'count' }),
      amount(2),
      rate(3, { primary: true }),
      measure(4, { fn: 'count', field: 'stage', label: 'Stages' }),
      amount(5, { fn: 'max' }),
    ];
    const results = Object.fromEntries(measures.map((m, i) => [m.id, measureResult({ value: i + 1, population: 10 })]));
    const model = numberModel(numberTile(measures), tileResult(results), FIELDS, EN, 'en', false);
    expect(model.primary.measure).toBe(uuid(3));
    expect(model.secondaries.map((s) => s.measure)).toEqual([uuid(1), uuid(2), uuid(4)]);
    expect([model.primary.label, ...model.secondaries.map((s) => s.label)]).toEqual(['avg · Rate', 'count', 'sum · Amount', 'Stages']);
    expect([model.primary.value, model.secondaries[1]!.value]).toEqual(['3%', '$2.00']);

    const alone = numberModel(numberTile([amount(1)]), tileResult({ [uuid(1)]: measureResult({ value: 1 }) }), FIELDS, EN, 'en', false);
    expect(alone.primary.label, 'one measure needs no label').toBeNull();
    expect(alone.secondaries).toEqual([]);

    const first = numberModel(numberTile([amount(1), measure(2)]), tileResult({}), FIELDS, EN, 'en', false);
    expect(first.primary.measure, 'the first, when none is marked').toBe(uuid(1));
    expect(first.primary.value, 'a measure that did not compute').toBe('—');
    expect(first.primary.meta).toEqual([EN.tileNoValue]);
  });

  it('reads a result by its measure key, as computeTiles returns it, or by its id, as the server does', () => {
    const server = numberTile([measure(1, { primary: true }), amount(2)]);
    const serverResult = tileResult({ [uuid(1)]: measureResult({ value: 7, population: 7 }), [uuid(2)]: measureResult({ value: 90, population: 7 }) });
    const helper: ComputeTile = {
      kind: 'number',
      query: { entity: 'deals', measures: [{ id: uuid(1), key: 'n', fn: 'count', primary: true }, { id: uuid(2), key: 'rev', fn: 'sum', field: 'amount', primary: false }] },
    };
    const helperResult: ComputedTile = {
      tile_id: uuid(90),
      computed_at: '2026-11-01T00:00:00Z',
      coverage: { partial: false },
      outcome: 'ok',
      measures: { n: measureResult({ value: 7, population: 7 }), rev: measureResult({ value: 90, population: 7 }) },
    };
    expect(frame(helper, helperResult)).toEqual(frame(server, serverResult));
    const strip = (m: NumberModel) => ({ primary: { ...m.primary, measure: '' }, secondaries: m.secondaries.map((s) => ({ ...s, measure: '' })) });
    const fromServer = numberModel(server, serverResult, FIELDS, EN, 'en', false);
    const fromHelper = numberModel(helper, helperResult, FIELDS, EN, 'en', false);
    expect(strip(fromHelper)).toEqual(strip(fromServer));
    expect(strip(fromHelper).primary.value).toBe('7');
    expect([fromServer.primary.measure, fromHelper.primary.measure]).toEqual([uuid(1), 'n']);
  });

  it('draws a plain number and a key for a label when it has no fields', () => {
    const spec = numberTile([amount(1), measure(2, { fn: 'avg', field: 'rate' })]);
    const result = tileResult({ [uuid(1)]: measureResult({ value: 1234.5, population: 3 }), [uuid(2)]: measureResult({ value: 12.5, population: 3 }) });
    const lists: [string, FigureField[] | null | undefined][] = [
      ['null', null],
      ['undefined', undefined],
      ['empty', []],
      ['without the field', [{ key: 'other', type: 'text', label: 'Other' }]],
    ];
    for (const [name, fields] of lists) {
      const model = numberModel(spec, result, fields, EN, 'en', false);
      expect(model.primary.value, name).toBe('1,234.5');
      expect(model.secondaries[0]!.value, name).toBe('12.5');
      expect([model.primary.label, model.secondaries[0]!.label], name).toEqual(['sum · amount', 'avg · rate']);
      expect(frameModel(numberTile([amount(1)]), result, fields, EN, 'en').title, name).toBe('sum · amount');
    }
  });

  it('addresses the records behind the primary figure only when the tile may be drilled', () => {
    const drill = { field_filters: [{ field: 'stage', op: 'eq', value: 'won' }] } as Schemas['EntityRecordFilters'];
    const spec = (extra: Record<string, unknown> = {}) => numberTile([amount(1, { primary: true }), measure(2)], extra);
    const result = (over: Partial<Schemas['TileResult']> = {}, population: Partial<Schemas['PopulationInfo']> | null = { count: 12, drill }) =>
      tileResult({ [uuid(1)]: measureResult({ value: 5 }), [uuid(2)]: measureResult({ value: 5 }) }, { population: population ? populationOf(population) : null, ...over });
    const drilled = (s: AfTileSpec, r: AfTileResult, drillable: boolean) => numberModel(s, r, FIELDS, EN, 'en', drillable);

    expect(drilled(spec(), result(), true).primary.drill).toEqual({
      drill,
      measure: uuid(1),
      bucket: null,
      segment: null,
      label: 'sum · Amount',
      count: 12,
      other: false,
    });
    expect(drilled(spec(), result(), true).secondaries[0]!.drill, 'a secondary is not drilled').toBeNull();
    expect(drilled(spec(), result(), false).primary.drill, 'not drillable').toBeNull();
    expect(drilled(spec({ drill_disabled: true }), result(), true).primary.drill, 'the tile turned it off').toBeNull();
    expect(drilled(spec({ drill_disabled: false }), result(), true).primary.drill, 'the tile left it on').not.toBeNull();
    expect(drilled(spec(), result({}, { count: 12 }), true).primary.drill, 'no address').toBeNull();
    expect(drilled(spec(), result({}, null), true).primary.drill, 'no population').toBeNull();
    expect(drilled(spec(), result({ outcome: 'failed' }), true).primary.drill, 'not ok').toBeNull();
  });

  it('speaks Vietnamese in the meta, the goal, the comparison and the notes', () => {
    const percent = numberTile([rate(1, { primary: true })], { transform: { target: { kind: 'constant', value: 50 } } });
    const model = numberModel(
      percent,
      tileResult({ [uuid(1)]: measureResult({ value: 42.5, population: 1234, comparison: { previous: 40, difference: 2.5, percent_change: 0.06 } }) }),
      FIELDS,
      VI,
      'vi',
      false,
    ).primary;
    expect(model.meta).toEqual(['1.234 bản ghi']);
    expect(model.goal).toEqual({ text: 'mục tiêu 50% · thiếu 7,5 điểm', tone: 'short' });
    expect(model.comparison).toBe('so với kỳ trước: 40% · +2,5% · +6%');

    const capped = numberModel(
      numberTile([amount(1)]),
      tileResult({ [uuid(1)]: measureResult({ value: 5, population: 20000, cap_bound: 'upper' }) }, { population: populationOf({ capped: true, cap: 20000, count: 20000 }) }),
      FIELDS,
      VI,
      'vi',
      false,
    ).primary;
    expect(capped.meta).toEqual(['20.000 bản ghi', 'nhiều nhất']);

    const none = numberModel(numberTile([amount(1)]), tileResult({ [uuid(1)]: measureResult({ value: null, population: 0, skipped: 3 }) }), FIELDS, VI, 'vi', false).primary;
    expect(none.meta).toEqual(['Không có giá trị trên tập bản ghi này', '3 bản ghi bị bỏ qua: thiếu ngày']);

    const chart = chartTile('bar', [measure(1)]);
    const result = tileResult({ [uuid(1)]: measureResult({ cap_bound: 'lower' }) }, { population: populationOf({ capped: true, cap: 20000, count: 20000 }), coverage: { partial: true } });
    expect(frameModel(chart, result, FIELDS, VI, 'vi').notes).toEqual([
      'Chỉ đếm tối đa 20.000 bản ghi: mỗi số liệu ít nhất bằng mức hiển thị',
      'Một số bản ghi bị giữ lại với bạn và không hiển thị',
    ]);
  });
});

describe("the tile's words", () => {
  it('names a measure by its key, else its id, else nothing', () => {
    expect(measureId({ key: 'rev', id: uuid(1) })).toBe('rev');
    expect(measureId({ key: '', id: uuid(1) })).toBe(uuid(1));
    expect(measureId({ key: null, id: uuid(1) })).toBe(uuid(1));
    expect(measureId({ id: uuid(1) })).toBe(uuid(1));
    expect(measureId({})).toBe('');
  });

  it("words a label as its text, or its code in the reader's language", () => {
    expect(wordOf({ text: 'Closed won' }, EN)).toBe('Closed won');
    const codes = ['empty', 'restricted', 'other', 'yes', 'no'] as const;
    expect(codes.map((code) => wordOf({ code }, EN))).toEqual(['(Empty)', '(Restricted)', '(Other)', 'Yes', 'No']);
    expect(codes.map((code) => wordOf({ code }, VI))).toEqual(['(Trống)', '(Bị hạn chế)', '(Khác)', 'Có', 'Không']);
  });

  it('fills {name} from the values, keeping a name it has no value for', () => {
    expect(fill('{count} records', { count: 3 })).toBe('3 records');
    expect(fill('{count} of {total}', { count: 0, total: '1,000' })).toBe('0 of 1,000');
    expect(fill('{a} and {b}', { a: 'x' })).toBe('x and {b}');
    expect(fill('no names', { a: 'x' })).toBe('no names');
  });

  it('holds every string in both languages, with the same placeholders', () => {
    const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const tile = Object.keys(KIT_TEXT.en).filter((key) => key.startsWith('tile'));
    expect(tile.length).toBeGreaterThanOrEqual(49);
    expect(Object.keys(KIT_TEXT.vi).sort()).toEqual(Object.keys(KIT_TEXT.en).sort());
    for (const key of tile) {
      const k = key as keyof typeof EN;
      expect(placeholders(KIT_TEXT.vi[k]), key).toEqual(placeholders(KIT_TEXT.en[k]));
      expect(KIT_TEXT.en[k].trim(), key).not.toBe('');
      expect(KIT_TEXT.vi[k].trim(), key).not.toBe('');
    }
  });
});
