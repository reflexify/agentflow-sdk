import type { ComputeTile, components } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { AfListColumn, AfListRow, AfTileResult, AfTileSpec } from '../../../src/kit/tile/types.js';
import { amount, bucketOf, chartResult, chartTile, measureResult, numberTile, populationOf, tileResult, uuid } from './tile.js';

type Schemas = components['schemas'];

/** A tile as an app holds it: what to draw, the result to draw it from, and the fields of its entity. The gallery and the tests share these. */
export interface TileCase {
  spec: AfTileSpec;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  /** A list tile's records and the columns it shows. */
  rows?: readonly AfListRow[];
  columns?: readonly AfListColumn[];
}

export const FIELDS: FigureField[] = [
  { key: 'amount', type: 'number', label: 'Amount', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 0 } },
  {
    key: 'stage',
    type: 'enum',
    label: 'Stage',
    enum_values: [{ value: 'new', label: 'New' }, { value: 'qualified', label: 'Qualified' }, { value: 'won', label: 'Closed won' }, { value: 'lost', label: 'Lost' }],
  },
  {
    key: 'region',
    type: 'enum',
    label: 'Region',
    enum_values: [{ value: 'north', label: 'North' }, { value: 'central', label: 'Central' }, { value: 'south', label: 'South' }, { value: 'online', label: 'Online' }],
  },
  { key: 'opened', type: 'date', label: 'Opened' },
  { key: 'name', type: 'text', label: 'Deal' },
  { key: 'owner', type: 'reference', label: 'Owner' },
  {
    key: 'tags',
    type: 'multi_select',
    label: 'Tags',
    enum_values: [{ value: 'renewal', label: 'Renewal' }, { value: 'strategic', label: 'Strategic' }, { value: 'partner', label: 'Partner' }],
  },
  { key: 'signed', type: 'boolean', label: 'Signed' },
  { key: 'updated', type: 'datetime', label: 'Updated' },
  { key: 'contract', type: 'file', label: 'Contract' },
];

const eq = (field: string, value: string) => ({ field, op: 'eq', value }) as Schemas['RecordFieldFilter'];
const within = (field: string, from: string, to: string) => ({ field, op: 'between', value: [from, to] }) as Schemas['RecordFieldFilter'];
export const drillOf = (...filters: Schemas['RecordFieldFilter'][]): Schemas['EntityRecordFilters'] => ({ field_filters: filters });

/** The Monday of each week charted, and the Sunday that closes it. */
export const WEEKS = ['2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'] as const;
const sunday = (monday: string) => new Date(Date.parse(`${monday}T00:00:00Z`) + 6 * 86_400_000).toISOString().slice(0, 10);
const weekDrill = (week: string, ...more: Schemas['RecordFieldFilter'][]) => drillOf(within('opened', week, sunday(week)), ...more);

const COMPUTED_AT = '2026-11-01T00:00:00Z';
const computed = (id: number, measures: Record<string, Schemas['MeasureResult']>, over: Partial<Schemas['TileResult']> = {}): AfTileResult =>
  ({ tile_id: uuid(id), computed_at: COMPUTED_AT, coverage: { partial: false }, outcome: 'ok', measures, ...over }) as AfTileResult;
const compare = (previous: number | null, value: number | null): Schemas['Comparison'] => ({
  previous,
  difference: previous === null || value === null ? null : value - previous,
  percent_change: previous === null || previous === 0 || value === null ? null : (value - previous) / previous,
});

/** A number tile as a module asks for it: named by key, with a goal and the figure's earlier period. */
export const NUMBER_GOAL: TileCase = {
  spec: {
    kind: 'number',
    label: 'Revenue this quarter',
    query: { entity: 'deal', measures: [{ key: 'revenue', fn: 'sum', field: 'amount', primary: true }] },
    transform: { target: { kind: 'constant', value: 1_500_000 } },
  } as AfTileSpec,
  result: computed(11, { revenue: measureResult({ value: 1_240_000, population: 38, comparison: compare(1_100_000, 1_240_000) }) }, {
    population: populationOf({ count: 38, drill: drillOf(eq('stage', 'won')) }),
  }),
  fields: FIELDS,
};

/** A count the server stopped at its cap: the figure is a floor, and says so. */
export const NUMBER_CAPPED: TileCase = {
  spec: numberTile([{ id: uuid(21), fn: 'count', primary: true }], { label: 'Open deals' }),
  result: tileResult({ [uuid(21)]: measureResult({ value: 20_000, population: 20_000, cap_bound: 'lower' }) }, {
    population: populationOf({ count: 20_000, capped: true, cap: 20_000, drill: drillOf(eq('stage', 'new')) }),
  }),
  fields: FIELDS,
};

/** A primary figure and three more beside it. */
export const NUMBER_SECONDARIES: TileCase = {
  spec: {
    kind: 'number',
    label: 'Pipeline',
    query: {
      entity: 'deal',
      measures: [
        { key: 'pipeline', fn: 'sum', field: 'amount', primary: true },
        { key: 'deals', fn: 'count', primary: false },
        { key: 'average', fn: 'avg', field: 'amount', primary: false, label: 'Average deal' },
        { key: 'largest', fn: 'max', field: 'amount', primary: false, label: 'Largest deal' },
      ],
    },
  } as AfTileSpec,
  result: computed(12, {
    pipeline: measureResult({ value: 2_310_000, population: 54 }),
    deals: measureResult({ value: 54, population: 54 }),
    average: measureResult({ value: 42_777, population: 54 }),
    largest: measureResult({ value: 310_000, population: 54 }),
  }, { population: populationOf({ count: 54, drill: drillOf(eq('stage', 'qualified')) }) }),
  fields: FIELDS,
};

type Piece = [key: string, value: number, count: number];
const piece = (week: string, [key, value, count]: Piece): Schemas['Bucket'] => {
  const drill = key === '$restricted' ? undefined : key === '$other' ? weekDrill(week) : weekDrill(week, eq('stage', key));
  return bucketOf(key, value, { count, drill, other: key === '$other' });
};
const week = (key: string, pieces: Piece[]): Schemas['Bucket'] => {
  const total = pieces.reduce((sum, [, value]) => sum + value, 0);
  return bucketOf(key, total, { count: pieces.reduce((sum, [, , count]) => sum + count, 0), segments: pieces.map((p) => piece(key, p)), drill: weekDrill(key) });
};

/** Weekly sums stacked by stage: the remainder fold in one week, a stage the reader may not see in another, a week with no records (filled) and a week whose sum is undefined (null). */
export const COLUMN_STACKED: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'column',
    label: 'Pipeline by week and stage',
    query: { entity: 'deal', measures: [{ key: 'pipeline', fn: 'sum', field: 'amount', primary: true }] },
    split_by: { field: 'opened', bucket: 'week' },
    stack_by: { field: 'stage' },
  } as AfTileSpec,
  result: computed(13, {
    pipeline: measureResult({
      population: 112,
      buckets: [
        week(WEEKS[0], [['new', 120_000, 6], ['qualified', 80_000, 4], ['won', 60_000, 2], ['lost', 20_000, 1]]),
        week(WEEKS[1], [['new', 140_000, 7], ['qualified', 95_000, 5], ['won', 70_000, 3], ['lost', 25_000, 2]]),
        week(WEEKS[2], [['new', 110_000, 5], ['qualified', 90_000, 4], ['won', 85_000, 4], ['lost', 15_000, 1], ['$other', 30_000, 3]]),
        week(WEEKS[3], [['new', 160_000, 8], ['qualified', 100_000, 5], ['won', 90_000, 4], ['lost', 30_000, 2]]),
        week(WEEKS[4], [['new', 130_000, 6], ['qualified', 85_000, 4], ['won', 75_000, 3], ['lost', 20_000, 1], ['$restricted', 40_000, 2]]),
        bucketOf(WEEKS[5], 0, { count: 0, filled: true }),
        bucketOf(WEEKS[6], null, { count: 3 }),
        week(WEEKS[7], [['new', 150_000, 7], ['qualified', 105_000, 5], ['won', 95_000, 4], ['lost', 25_000, 2]]),
      ],
    }),
  }, { population: populationOf({ count: 112, drill: drillOf(within('opened', WEEKS[0], sunday(WEEKS[7]))) }) }),
  fields: FIELDS,
};

const REGIONS = ['north', 'central', 'south', 'online'] as const;
const region = (key: (typeof REGIONS)[number], value: number, count: number, extra: Partial<Schemas['Bucket']> = {}) =>
  bucketOf(key, value, { count, drill: drillOf(eq('region', key)), ...extra });

/** Two measures by region as AgentFlow's own dashboard holds them: ids, not keys. The first carries an earlier period and a target for each bucket, and the regions add up to the population's total. */
export const BAR_GROUPED: TileCase = {
  spec: chartTile('bar', [amount(31, { primary: true, label: 'Booked' }), amount(32, { label: 'Forecast' })], {
    label: 'Booked and forecast by region',
    split_by: { field: 'region' },
    transform: { target: { kind: 'field', key: 'quota' } },
  }),
  result: chartResult({
    [uuid(31)]: [
      region('north', 520_000, 21, { comparison: compare(480_000, 520_000), target: 500_000 }),
      region('central', 410_000, 17, { comparison: compare(430_000, 410_000), target: 450_000 }),
      region('south', 360_000, 14, { comparison: compare(300_000, 360_000), target: 350_000 }),
      region('online', 190_000, 9, { comparison: compare(null, 190_000), target: 250_000 }),
    ],
    [uuid(32)]: [region('north', 610_000, 21), region('central', 450_000, 17), region('south', 400_000, 14), region('online', 260_000, 9)],
  }, { verdict: { kind: 'partitions', total: 1_480_000 } }),
  fields: FIELDS,
};

const wk = (index: number) => WEEKS[index]!;
const point = (index: number, value: number | null, previous: number | null, extra: Partial<Schemas['Bucket']> = {}) =>
  bucketOf(wk(index), value, { count: value === null ? 0 : Math.round(value / 12_000), drill: weekDrill(wk(index)), comparison: compare(previous, value), target: 60_000, ...extra });
const NEW_BUSINESS = [52_000, 58_000, 61_000, 57_000, null, 66_000, 71_000, 69_000] as const;
const EARLIER = [48_000, 50_000, 55_000, 59_000, 54_000, 60_000, 62_000, 64_000] as const;
const RENEWALS = [30_000, 34_000, 33_000, 38_000, 41_000, 39_000, 44_000, 47_000] as const;

/** Two weekly lines: the first has a gap, an earlier period and a target; the second draws beside it. */
export const LINE: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'line',
    label: 'Revenue by week',
    query: {
      entity: 'deal',
      measures: [
        { key: 'new_business', fn: 'sum', field: 'amount', primary: true, label: 'New business' },
        { key: 'renewals', fn: 'sum', field: 'amount', primary: false, label: 'Renewals' },
      ],
    },
    split_by: { field: 'opened', bucket: 'week' },
    transform: { target: { kind: 'constant', value: 60_000 } },
  } as AfTileSpec,
  result: computed(14, {
    new_business: measureResult({ population: 96, buckets: NEW_BUSINESS.map((value, i) => point(i, value, EARLIER[i]!)) }),
    renewals: measureResult({ population: 64, buckets: RENEWALS.map((value, i) => bucketOf(wk(i), value, { count: Math.round(value / 12_000), drill: weekDrill(wk(i)) })) }),
  }, { population: populationOf({ count: 96, drill: drillOf(within('opened', WEEKS[0], sunday(WEEKS[7]))) }) }),
  fields: FIELDS,
};

const stage = (key: string, value: number, extra: Partial<Schemas['Bucket']> = {}): Schemas['Bucket'] =>
  bucketOf(key, value, {
    count: value,
    other: key === '$other',
    drill: key === '$restricted' ? undefined : key === '$other' ? drillOf({ field: 'stage', op: 'not_in', value: ['won', 'qualified', 'lost'] }) : drillOf(eq('stage', key)),
    ...extra,
  });

/** Deals by stage as a pie: the order is the server's, not the size's, and the remainder and the withheld slice are hatched. */
export const PIE: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'pie',
    label: 'Deals by stage',
    query: { entity: 'deal', measures: [{ key: 'deals', fn: 'count', primary: true }] },
    split_by: { field: 'stage' },
  } satisfies ComputeTile,
  result: computed(15, {
    deals: measureResult({
      population: 70,
      buckets: [stage('won', 42), stage('qualified', 14), stage('lost', 7), stage('$other', 4), stage('$restricted', 3)],
    }),
  }, { population: populationOf({ count: 70, drill: drillOf(within('opened', WEEKS[0], sunday(WEEKS[7]))) }) }),
  fields: FIELDS,
};

/** Pipeline by region as a donut, with an earlier period and a target for each region: they show in the tooltip and the table. */
export const DONUT: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'donut',
    label: 'Pipeline by region',
    query: { entity: 'deal', measures: [{ key: 'pipeline', fn: 'sum', field: 'amount', primary: true }] },
    split_by: { field: 'region' },
    transform: { target: { kind: 'field', key: 'quota' } },
  } satisfies ComputeTile,
  result: computed(16, {
    pipeline: measureResult({
      population: 61,
      buckets: [
        region('north', 520_000, 21, { comparison: compare(480_000, 520_000), target: 500_000 }),
        region('central', 410_000, 17, { comparison: compare(430_000, 410_000), target: 450_000 }),
        region('south', 360_000, 14, { comparison: compare(300_000, 360_000), target: 350_000 }),
        region('online', 190_000, 9, { comparison: compare(null, 190_000), target: 250_000 }),
      ],
    }),
  }, { population: populationOf({ count: 61, drill: drillOf(eq('stage', 'won')) }) }),
  fields: FIELDS,
};

const DEALS = [9, 11, 12, 10, 13, 8, 14, 12] as const;
const DEALS_EARLIER = [8, 10, 11, 12, 11, 9, 12, 13] as const;
const PIPELINE = [120_000, 150_000, 135_000, 140_000, 180_000, 95_000, 210_000, 175_000] as const;

/** A count and a currency sum by week: two units, so two panels. The count carries an earlier period and a goal of twelve, which only its panel draws. */
export const MULTIPLES: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'column',
    label: 'Deals and pipeline by week',
    query: {
      entity: 'deal',
      measures: [
        { key: 'deals', fn: 'count', primary: true, label: 'Deals' },
        { key: 'pipeline', fn: 'sum', field: 'amount', primary: false, label: 'Pipeline' },
      ],
    },
    split_by: { field: 'opened', bucket: 'week' },
    transform: { target: { kind: 'constant', value: 12 } },
  } satisfies ComputeTile,
  result: computed(17, {
    deals: measureResult({
      population: 89,
      buckets: DEALS.map((value, i) => bucketOf(wk(i), value, { count: value, drill: weekDrill(wk(i)), comparison: compare(DEALS_EARLIER[i]!, value), target: 12 })),
    }),
    pipeline: measureResult({
      population: 89,
      buckets: PIPELINE.map((value, i) => bucketOf(wk(i), value, { count: DEALS[i]!, drill: weekDrill(wk(i)) })),
    }),
  }, { population: populationOf({ count: 89, drill: drillOf(within('opened', WEEKS[0], sunday(WEEKS[7]))) }) }),
  fields: FIELDS,
};

/** Pipeline by region as bars, each with its share of the buckets shown: the remainder fold is a bucket too, so the shares add up to the whole, and 40 records are behind them. */
export const BAR_SHARE: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'bar',
    label: 'Pipeline share by region',
    query: { entity: 'deal', measures: [{ key: 'pipeline', fn: 'sum', field: 'amount', primary: true }] },
    split_by: { field: 'region' },
    transform: { derive: { kind: 'share_of_total' } },
  } satisfies ComputeTile,
  result: computed(18, {
    pipeline: measureResult({
      population: 40,
      buckets: [
        region('north', 480_000, 16, { derived: 0.4 }),
        region('central', 300_000, 12, { derived: 0.25 }),
        region('south', 240_000, 8, { derived: 0.2 }),
        bucketOf('$other', 180_000, { count: 4, other: true, derived: 0.15, drill: drillOf({ field: 'region', op: 'not_in', value: ['north', 'central', 'south'] }) }),
      ],
    }),
  }, { population: populationOf({ count: 40, drill: drillOf(eq('stage', 'won')) }) }),
  fields: FIELDS,
};

/** Weekly pipeline as columns with the running total on the same axis. The sixth week has no records (filled) and the total stands still through it. */
export const COLUMN_RUNNING: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'column',
    label: 'Pipeline built up by week',
    query: { entity: 'deal', measures: [{ key: 'pipeline', fn: 'sum', field: 'amount', primary: true }] },
    split_by: { field: 'opened', bucket: 'week' },
    transform: { derive: { kind: 'running_total' } },
  } satisfies ComputeTile,
  result: computed(19, {
    pipeline: measureResult({
      population: 89,
      buckets: PIPELINE.map((value, i) => {
        const total = PIPELINE.slice(0, i + 1).reduce((sum, v, k) => sum + (k === 5 ? 0 : v), 0);
        return i === 5
          ? bucketOf(wk(i), 0, { count: 0, filled: true, derived: total })
          : bucketOf(wk(i), value, { count: DEALS[i]!, drill: weekDrill(wk(i)), derived: total });
      }),
    }),
  }, { population: populationOf({ count: 89, drill: drillOf(within('opened', WEEKS[0], sunday(WEEKS[7]))) }) }),
  fields: FIELDS,
};

/** Pipeline by region ranked highest first: central and south tie, so the next is fourth, not third. */
export const BAR_RANK: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'bar',
    label: 'Regions by pipeline',
    query: { entity: 'deal', measures: [{ key: 'pipeline', fn: 'sum', field: 'amount', primary: true }] },
    split_by: { field: 'region' },
    transform: { derive: { kind: 'rank', direction: 'desc', ties: 'competition' } },
  } satisfies ComputeTile,
  result: computed(20, {
    pipeline: measureResult({
      population: 61,
      buckets: [
        region('north', 520_000, 21, { derived: 1 }),
        region('central', 410_000, 17, { derived: 2 }),
        region('south', 410_000, 14, { derived: 2 }),
        region('online', 190_000, 9, { derived: 4 }),
      ],
    }),
  }, { population: populationOf({ count: 61, drill: drillOf(eq('stage', 'won')) }) }),
  fields: FIELDS,
};

const BOOKED = [96_000, 120_000, 108_000, 112_000, 144_000, 76_000, 168_000, 140_000] as const;
const FORECAST = [120_000, 130_000, 120_000, 140_000, 150_000, null, 160_000, 175_000] as const;

/** Booked against forecast by week, with a formula for the attainment. The sixth week has no forecast, so the formula has no value there. */
export const COLUMN_FORMULA: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'column',
    label: 'Booked against forecast',
    query: {
      entity: 'deal',
      measures: [
        { key: 'booked', fn: 'sum', field: 'amount', primary: true, label: 'Booked' },
        { key: 'forecast', fn: 'sum', field: 'amount', primary: false, label: 'Forecast' },
      ],
    },
    split_by: { field: 'opened', bucket: 'week' },
    transform: { derive: { kind: 'expression', expression: 'booked / forecast', label: 'Attainment' } },
  } satisfies ComputeTile,
  result: computed(21, {
    booked: measureResult({
      population: 89,
      buckets: BOOKED.map((value, i) => {
        const forecast = FORECAST[i];
        return bucketOf(wk(i), value, { count: DEALS[i]!, drill: weekDrill(wk(i)), ...(forecast ? { derived: value / forecast } : {}) });
      }),
    }),
    forecast: measureResult({
      population: 89,
      buckets: FORECAST.flatMap((value, i) => (value === null ? [] : [bucketOf(wk(i), value, { count: DEALS[i]!, drill: weekDrill(wk(i)) })])),
    }),
  }, { population: populationOf({ count: 89, drill: drillOf(within('opened', WEEKS[0], sunday(WEEKS[7]))) }) }),
  fields: FIELDS,
};

/** Pipeline by region where a deal sold in two regions is in both bars: the bars add up to $250,000 more than the population holds. */
export const COLUMN_FANS_OUT: TileCase = {
  spec: {
    kind: 'chart',
    chart: 'column',
    label: 'Pipeline by region',
    query: { entity: 'deal', measures: [{ key: 'pipeline', fn: 'sum', field: 'amount', primary: true, label: 'Pipeline' }] },
    split_by: { field: 'region' },
  } satisfies ComputeTile,
  result: computed(22, {
    pipeline: measureResult({
      population: 74,
      buckets: [region('north', 480_000, 28), region('central', 360_000, 21), region('south', 280_000, 15), region('online', 130_000, 10)],
    }),
  }, {
    population: populationOf({ count: 74 }),
    verdict: { kind: 'fans_out', bucket_sum: 1_250_000, total: 1_000_000, gap: -250_000 },
  }),
  fields: FIELDS,
};

/** A text tile: Markdown in the spec and nothing else, so it needs no result. */
export const TEXT: TileCase = {
  spec: {
    kind: 'text',
    label: 'Quarter notes',
    body: [
      '## Q3 outlook',
      '',
      'Pipeline is **up** on last quarter, with *three* large deals still open. See the [forecast notes](https://example.com/forecast).',
      '',
      '- Close the two **legal reviews** this week',
      '- Hand `enterprise` renewals to the new team',
      '- [x] Share the board pack',
      '',
      '| Region | Target | Status |',
      '| :--- | ---: | :--- |',
      '| North | $480k | on track |',
      '| South | $280k | behind |',
      '',
      "> Numbers are from Monday's snapshot.",
    ].join('\n'),
  } satisfies ComputeTile,
  result: null,
  fields: FIELDS,
};

/** A list tile: the records of a saved view, as text, with the labels the server resolved for each reference and file. Nine columns are wider than a tile in the gallery, so it scrolls. */
export const LIST: TileCase = {
  spec: { kind: 'list', label: 'Open deals', entity: 'deal', view: 'open' } satisfies ComputeTile,
  result: computed(16, {}),
  fields: FIELDS,
  columns: [
    { key: 'name', label: 'Deal' },
    { key: 'stage', label: 'Stage' },
    { key: 'amount', label: 'Amount' },
    { key: 'owner', label: 'Owner' },
    { key: 'opened', label: 'Opened' },
    { key: 'tags', label: 'Tags' },
    { key: 'signed', label: 'Signed' },
    { key: 'updated', label: 'Updated' },
    { key: 'contract', label: 'Contract' },
  ] satisfies AfListColumn[],
  rows: [
    {
      id: uuid(201),
      entity_id: uuid(200),
      body: {
        name: 'Acme renewal', stage: 'won', amount: 48_000, owner: uuid(301), tags: ['renewal', 'strategic'], signed: true, opened: '2026-09-14',
        updated: '2026-10-02T09:15:00Z', contract: [uuid(401), uuid(402)],
      },
      ref_labels: { owner: { [uuid(301)]: 'Hoa Tran' } },
      file_labels: { contract: { [uuid(401)]: 'acme-renewal.pdf', [uuid(402)]: 'annex.pdf' } },
    },
    {
      id: uuid(202),
      entity_id: uuid(200),
      body: {
        name: 'Globex expansion', stage: 'qualified', amount: 125_000, owner: uuid(302), tags: ['partner'], signed: false, opened: '2026-10-05',
        updated: '2026-10-20T14:40:00Z', contract: [uuid(403), uuid(404), uuid(405)],
      },
      ref_labels: { owner: { [uuid(302)]: 'Binh Nguyen' } },
      file_labels: { contract: { [uuid(403)]: 'globex-msa.pdf', [uuid(404)]: null, [uuid(405)]: 'order-form.pdf' } },
      file_counts: { contract: 5 },
    },
    {
      id: uuid(203),
      entity_id: uuid(200),
      body: { name: '', stage: 'new', amount: null, owner: null, tags: [], signed: false, opened: '2026-10-26', updated: null, contract: [] },
    },
  ] satisfies AfListRow[],
};

/** A tile the caller may not read. */
export const UNAVAILABLE: TileCase = {
  spec: numberTile([amount(41, { primary: true })], { label: 'Payroll' }),
  result: tileResult({}, { outcome: 'unavailable' }),
  fields: FIELDS,
};

/** A tile the server could not compute. */
export const FAILED: TileCase = {
  spec: numberTile([amount(42, { primary: true })], { label: 'Margin' }),
  result: tileResult({}, { outcome: 'failed', problem: { title: 'A field is gone', detail: 'Field "cost" no longer exists', status: 422, type: 'tile.failed' } }),
  fields: FIELDS,
};

/** A tile whose result has not arrived. */
export const LOADING: TileCase = {
  spec: numberTile([amount(43, { primary: true })], { label: 'Open pipeline' }),
  result: null,
  fields: FIELDS,
};

/** Every case, in the order the gallery draws them. */
export const TILE_CASES = { NUMBER_GOAL, NUMBER_CAPPED, NUMBER_SECONDARIES, COLUMN_STACKED, BAR_GROUPED, LINE, PIE, DONUT, MULTIPLES, BAR_SHARE, COLUMN_RUNNING, BAR_RANK, COLUMN_FORMULA, COLUMN_FANS_OUT, TEXT, LIST, UNAVAILABLE, FAILED, LOADING } satisfies Record<string, TileCase>;
export type TileCaseName = keyof typeof TILE_CASES;
