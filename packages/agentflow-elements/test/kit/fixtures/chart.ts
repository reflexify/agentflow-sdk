import type { ChartBucket, ChartModel, ChartSeries } from '../../../src/kit/tile/chart-model.js';
import type { AfDrillTarget } from '../../../src/kit/tile/types.js';

const drill = (label: string): AfDrillTarget => ({ drill: {} as AfDrillTarget['drill'], measure: 'm', bucket: label, segment: null, label, count: 1, other: false });

/** A model by hand: `values[bucket][series]`, a bucket's own members overriding the defaults. */
export function modelOf(values: (number | null)[][], over: Partial<ChartModel> = {}, buckets: Partial<ChartBucket>[] = []): ChartModel {
  const width = Math.max(1, ...values.map((row) => row.length));
  const series: ChartSeries[] = Array.from({ length: width }, (_, i) => ({ label: `S${i}`, color: { slot: i + 1 }, pattern: null, measure: `m${i}`, segment: null }));
  return {
    type: 'column',
    stacked: false,
    compared: false,
    series,
    slices: [],
    buckets: values.map((row, b) => ({
      key: `k${b}`, label: `b${b}`, other: false, restricted: false, filled: false, unmatched: false,
      target: null, previous: null, difference: null, percentChange: null, compared: false, derived: null, total: null,
      values: row, counts: row.map((v) => (v === null ? 0 : 1)), drills: row.map((_, i) => drill(`b${b}.${i}`)),
      ...buckets[b],
    })),
    splitLabel: 'Split',
    empty: values.length === 0,
    legend: [],
    drill: { enabled: true, disabled: false },
    format: (value) => (value === null ? '—' : String(value)),
    unitLabel: null,
    derive: null,
    formatDerived: () => '—',
    beside: [],
    alone: [],
    ranks: [],
    ...over,
  };
}
