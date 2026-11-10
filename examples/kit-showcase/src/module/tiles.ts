import type { AfTileResult, AfTileSpec } from '@reflexify/agentflow-elements/kit';
import type { components } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';

// Two of the kit's own tile cases, a number and a stacked column chart, copied from its test fixtures: an example
// imports nothing from another package's tests.

type Schemas = components['schemas'];

export interface TileCase {
  spec: AfTileSpec;
  result: AfTileResult | null;
  fields: FigureField[] | null;
}

export const FIELDS: FigureField[] = [
  { key: 'amount', type: 'number', label: 'Amount', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 0 } },
  {
    key: 'stage',
    type: 'enum',
    label: 'Stage',
    enum_values: [{ value: 'new', label: 'New' }, { value: 'qualified', label: 'Qualified' }, { value: 'won', label: 'Closed won' }, { value: 'lost', label: 'Lost' }],
  },
  { key: 'opened', type: 'date', label: 'Opened' },
];

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const eq = (field: string, value: string) => ({ field, op: 'eq', value }) as Schemas['RecordFieldFilter'];
const within = (field: string, from: string, to: string) => ({ field, op: 'between', value: [from, to] }) as Schemas['RecordFieldFilter'];
const drillOf = (...filters: Schemas['RecordFieldFilter'][]): Schemas['EntityRecordFilters'] => ({ field_filters: filters });
const measureResult = (over: Partial<Schemas['MeasureResult']> = {}): Schemas['MeasureResult'] => ({ value: 0, population: 0, cap_bound: null, ...over });
const populationOf = (over: Partial<Schemas['PopulationInfo']> = {}): Schemas['PopulationInfo'] => ({ capped: false, count: 0, membership_rule: 'all', ...over });
const bucketOf = (key: string | null, value: number | null, over: Partial<Schemas['Bucket']> = {}): Schemas['Bucket'] => ({ key, value, count: value ?? 0, ...over });

/** The Monday of each week charted, and the Sunday that closes it. */
const WEEKS = ['2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'] as const;
const sunday = (monday: string) => new Date(Date.parse(`${monday}T00:00:00Z`) + 6 * 86_400_000).toISOString().slice(0, 10);
const weekDrill = (week: string, ...more: Schemas['RecordFieldFilter'][]) => drillOf(within('opened', week, sunday(week)), ...more);

const computed = (id: number, measures: Record<string, Schemas['MeasureResult']>, over: Partial<Schemas['TileResult']> = {}): AfTileResult =>
  ({ tile_id: uuid(id), computed_at: '2026-11-01T00:00:00Z', coverage: { partial: false }, outcome: 'ok', measures, ...over }) as AfTileResult;
const compare = (previous: number, value: number): Schemas['Comparison'] => ({ previous, difference: value - previous, percent_change: (value - previous) / previous });

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

type Piece = [key: string, value: number, count: number];
const piece = (week: string, [key, value, count]: Piece): Schemas['Bucket'] => {
  const drill = key === '$restricted' ? undefined : key === '$other' ? weekDrill(week) : weekDrill(week, eq('stage', key));
  return bucketOf(key, value, { count, drill, other: key === '$other' });
};
const week = (key: string, pieces: Piece[]): Schemas['Bucket'] => {
  const total = pieces.reduce((sum, [, value]) => sum + value, 0);
  return bucketOf(key, total, { count: pieces.reduce((sum, [, , count]) => sum + count, 0), segments: pieces.map((p) => piece(key, p)), drill: weekDrill(key) });
};

/** Weekly sums stacked by stage: the remainder fold in one week, a stage the reader may not see in another, a week with no records and a week whose sum is undefined. */
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
