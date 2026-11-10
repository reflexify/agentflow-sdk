import type { components } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { AfTileResult, AfTileSpec } from '../../../src/kit/tile/types.js';

type Schemas = components['schemas'];

export const TILE_FIELDS: FigureField[] = [
  { key: 'amount', type: 'number', label: 'Amount', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 2 } },
  { key: 'rate', type: 'number', label: 'Rate', format: 'percent' },
  { key: 'stage', type: 'enum', label: 'Stage', enum_values: [{ value: 'new' }, { value: 'won', label: 'Closed won' }] },
];

export const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const DRILL = { field_filters: [{ field: 'stage', op: 'eq', value: 'won' }] } as Schemas['EntityRecordFilters'];

const POSITION = { col: 0, row: 0, w: 4, h: 3 };

export const measure = (n: number, over: Partial<Schemas['TileMeasure']> = {}) =>
  ({ id: uuid(n), fn: 'count', primary: false, ...over }) as Schemas['TileMeasure'];
export const amount = (n: number, over: Partial<Schemas['TileMeasure']> = {}) => measure(n, { fn: 'sum', field: 'amount', ...over });

export const numberTile = (measures: Schemas['TileMeasure'][], extra: Record<string, unknown> = {}) =>
  ({ kind: 'number', id: uuid(90), position: POSITION, query: { entity_id: uuid(91), measures }, ...extra }) as AfTileSpec;
export const listTile = () => ({ kind: 'list', id: uuid(90), position: POSITION, entity_id: uuid(91), view_id: uuid(92) }) as AfTileSpec;

export const measureResult = (over: Partial<Schemas['MeasureResult']> = {}): Schemas['MeasureResult'] => ({ value: 0, population: 0, cap_bound: null, ...over });
export const populationOf = (over: Partial<Schemas['PopulationInfo']> = {}): Schemas['PopulationInfo'] => ({ capped: false, count: 0, membership_rule: 'all', ...over });
export const tileResult = (measures: Record<string, Schemas['MeasureResult']>, over: Partial<Schemas['TileResult']> = {}) =>
  ({ tile_id: uuid(90), computed_at: '2026-11-01T00:00:00Z', coverage: { partial: false }, outcome: 'ok', measures, ...over }) as AfTileResult;

/** A labelled number tile with a sum, a count beside it and a goal. */
export const REVENUE_SPEC = numberTile([amount(1, { primary: true }), measure(2)], {
  label: 'Revenue',
  transform: { target: { kind: 'constant', value: 1500 } },
});

/** Its result: the sum, 12 records behind it, and an earlier period to compare with. */
export function revenueResult(
  value = 1200,
  count = 12,
  over: Partial<Schemas['TileResult']> = {},
  primary: Partial<Schemas['MeasureResult']> = {},
): AfTileResult {
  return tileResult(
    {
      [uuid(1)]: measureResult({ value, population: count, comparison: { previous: 1000, difference: value - 1000, percent_change: (value - 1000) / 1000 }, ...primary }),
      [uuid(2)]: measureResult({ value: count, population: count }),
    },
    { population: populationOf({ count, drill: DRILL }), ...over },
  );
}

export const chartTile = (chart: Schemas['ChartType'], measures: Schemas['TileMeasure'][], extra: Record<string, unknown> = {}) =>
  ({ kind: 'chart', chart, id: uuid(90), position: POSITION, query: { entity_id: uuid(91), measures }, split_by: { field: 'stage' }, ...extra }) as AfTileSpec;

export const bucketOf = (key: string | null, value: number | null, over: Partial<Schemas['Bucket']> = {}): Schemas['Bucket'] => ({
  key,
  value,
  count: value ?? 0,
  ...over,
});

/** A chart's result: each measure's buckets by the measure's id, over a population that names its records. */
export function chartResult(
  buckets: Record<string, Schemas['Bucket'][]>,
  over: Partial<Schemas['TileResult']> = {},
  measures: Record<string, Partial<Schemas['MeasureResult']>> = {},
): AfTileResult {
  return tileResult(
    Object.fromEntries(Object.entries(buckets).map(([id, list]) => [id, measureResult({ buckets: list, population: list.length, ...measures[id] })])),
    { population: populationOf({ count: 100, drill: DRILL }), ...over },
  );
}
