import {
  axisGroups,
  bucketLabel,
  categoryColors,
  formatFieldOf,
  formatPercentChange,
  formatShare,
  measureColor,
  measureFormatter,
  measureLabel,
  measureResult,
  segmentOrder,
  unitOf,
} from '@reflexify/agentflow-sdk/figures';
import type { FigureColor, FigureField, FigureMeasure, MeasureUnit } from '@reflexify/agentflow-sdk/figures';
import type { components } from '@reflexify/agentflow-sdk';
import type { KitStrings } from '../text.js';
import { DRAWN_CHARTS, deriveOf, isPie, measureId, tileMeasures, wordOf } from './frame.js';
import type { Derive, DeriveKind, DrawnChart } from './frame.js';
import type { AfDrillTarget, AfTileResult, AfTileSpec } from './types.js';

type Schemas = components['schemas'];
type Bucket = Schemas['Bucket'];
type Text = Required<KitStrings>;

export type Pattern = 'other' | 'restricted' | null;

export interface ChartSeries {
  label: string;
  color: FigureColor;
  pattern: Pattern;
  measure: string;
  segment: string | null;
}

export interface ChartBucket {
  key: string | null;
  label: string;
  other: boolean;
  restricted: boolean;
  filled: boolean;
  unmatched: boolean;
  target: number | null;
  previous: number | null;
  difference: number | null;
  percentChange: number | null;
  compared: boolean;
  /** The derived figure the server gave the bucket. Only the first panel of a chart has one. */
  derived: number | null;
  /** The bucket's own value, which is a stack's total, for the figure written beside it. Set wherever `derived` can be. */
  total: number | null;
  /** One entry per series. */
  values: (number | null)[];
  counts: number[];
  drills: (AfDrillTarget | null)[];
}

export interface LegendItem {
  kind: 'series' | 'earlier' | 'target' | 'running' | 'formula' | 'filled' | 'slice';
  label: string;
  series: number | null;
  /** The bucket a slice item names. */
  bucket: number | null;
  /** What follows a slice's label: its value and share. */
  detail: string | null;
  color: FigureColor | null;
  pattern: Pattern;
}

/** What a pie paints a bucket with, and says of its share. A bucket keeps its colour whether or not it has a slice. */
export interface PieSlice {
  color: FigureColor;
  pattern: Pattern;
  /** The share as words, or `—` for a bucket with no slice. */
  share: string;
}

export interface ChartModel {
  type: DrawnChart;
  stacked: boolean;
  compared: boolean;
  series: ChartSeries[];
  buckets: ChartBucket[];
  /** Parallel to `buckets` for a pie, and empty for every other chart. */
  slices: PieSlice[];
  splitLabel: string;
  empty: boolean;
  legend: LegendItem[];
  /** Whether a mark opens records, and whether the tile switched that off while the element asked for it. */
  drill: { enabled: boolean; disabled: boolean };
  format: (value: number | null) => string;
  /** What the panel's scale is in: a currency's code, else the word for the unit. Null for a chart of one panel. */
  unitLabel: string | null;
  /** The tile's derived figure and the name it goes by, for the first panel of a chart that has one. */
  derive: { kind: DeriveKind; label: string } | null;
  /** A derived figure as words. Built once for the model, so wording a bucket's figure builds no formatter. */
  formatDerived: (value: number | null) => string;
  /** Parallel to `buckets` for a chart that writes a figure past its bars or above its columns, and empty for every other: the bucket's value and its share or formula, null where it has no figure. Worded here, once, so a resize only places it. */
  beside: (string | null)[];
  /** Parallel to `beside`, and empty when it is: the figure alone, without the bucket's value. A column chart writes it when the full text is wider than the room its bucket has, and the value is on the axis, in the tooltip and in the table. */
  alone: (string | null)[];
  /** Parallel to `buckets` for a bar or column chart whose figure is a rank, and empty for every other: `#n` for a bucket that has one. Every panel has them, not the first alone: a column chart labels its categories in the last panel, and the margins that hold a label must be the same in every panel. */
  ranks: (string | null)[];
}

const NONE = '—';

const legendItem = (kind: LegendItem['kind'], label: string, over: Partial<LegendItem> = {}): LegendItem => ({
  kind,
  label,
  series: null,
  bucket: null,
  detail: null,
  color: null,
  pattern: null,
  ...over,
});

function patternOf(key: string | null, color: FigureColor): Pattern {
  if (key === '$restricted') return 'restricted';
  return key === '$other' || 'other' in color ? 'other' : null;
}

function byKey(buckets: readonly Bucket[] | null | undefined): Map<string | null, Bucket> {
  const map = new Map<string | null, Bucket>();
  for (const bucket of buckets ?? []) if (!map.has(bucket.key)) map.set(bucket.key, bucket);
  return map;
}

const positive = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;

/** Whether a pie draws the bucket: it has a value above zero and was not filled in. */
export const hasSlice = (bucket: ChartBucket): boolean => !bucket.filled && positive(bucket.values[0]);

/** A pie's share for each bucket: its value over the sum of the drawn slices; null where the bucket has no slice. */
export function sliceShares(model: Pick<ChartModel, 'buckets'>): (number | null)[] {
  let sum = 0;
  for (const b of model.buckets) if (hasSlice(b)) sum += b.values[0]!;
  return model.buckets.map((b) => (hasSlice(b) ? b.values[0]! / sum : null));
}

const UNIT_TEXT = {
  count: 'tileUnitCount',
  ratio: 'tileUnitRatio',
  percent: 'tileUnitPercent',
  number: 'tileUnitNumber',
  duration: 'tileUnitDuration',
  rating: 'tileUnitRating',
  date: 'tileUnitDate',
} as const satisfies Record<Exclude<MeasureUnit['kind'], 'currency' | 'elapsed'>, keyof KitStrings>;

const ELAPSED_TEXT = {
  minutes: 'tileUnitMinutes',
  hours: 'tileUnitHours',
  days: 'tileUnitDays',
} as const satisfies Record<Schemas['DurationUnit'], keyof KitStrings>;

function unitWord(unit: MeasureUnit, text: Text): string {
  if (unit.kind === 'currency') return unit.code;
  return text[unit.kind === 'elapsed' ? ELAPSED_TEXT[unit.unit] : UNIT_TEXT[unit.kind]];
}

/** What every panel of a tile is built from. */
interface Source {
  result: AfTileResult;
  known: readonly FigureField[] | undefined;
  chart: Extract<AfTileSpec, { kind: 'chart' }> | null;
  type: DrawnChart;
  /** The tile's measures, in the order they were authored. */
  measures: FigureMeasure[];
  /** The measures that share a unit, the primary's group first. */
  groups: FigureMeasure[][];
  /** The derived figure, when it is one this build draws. */
  derive: Derive | null;
}

function sourceOf(spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] | null | undefined): Source {
  const known = fields ?? undefined;
  const chart = spec.kind === 'chart' ? spec : null;
  const measures = tileMeasures(spec, result);
  return {
    result,
    known,
    chart,
    type: DRAWN_CHARTS.find((t) => t === chart?.chart) ?? 'bar',
    measures,
    groups: chart ? axisGroups(measures, known) : [],
    derive: deriveOf(spec),
  };
}

/**
 * One model per unit, in `axisGroups` order, so the primary's panel comes first. Every panel has the primary's buckets, in its
 * order, with each measure's values joined by bucket key. Only the first panel carries the comparison and the targets. A pie,
 * or a chart in one unit, is one panel. Panels are never stacked.
 */
export function chartPanels(
  spec: AfTileSpec,
  result: AfTileResult,
  fields: readonly FigureField[] | null | undefined,
  text: Text,
  locale: string | undefined,
  drillable: boolean,
): ChartModel[] {
  const source = sourceOf(spec, result, fields);
  const count = isPie(source.type) ? 1 : Math.max(1, source.groups.length);
  return Array.from({ length: count }, (_, i) => panelModel(source, text, locale, drillable, i, count));
}

/** The chart drawn in one panel: the primary's unit, whatever else the tile measures. */
export function chartModel(
  spec: AfTileSpec,
  result: AfTileResult,
  fields: readonly FigureField[] | null | undefined,
  text: Text,
  locale: string | undefined,
  drillable: boolean,
): ChartModel {
  return panelModel(sourceOf(spec, result, fields), text, locale, drillable, 0, 1);
}

function panelModel(source: Source, text: Text, locale: string | undefined, drillable: boolean, index: number, count: number): ChartModel {
  const { result, known, chart, type, measures, groups } = source;
  const pie = isPie(type);
  const group = groups[index] ?? [];
  // A pie draws its primary measure alone, and ignores what it is stacked by.
  const drawn = pie ? group.slice(0, 1) : group;
  const lead = drawn[0];
  // Every panel has the buckets of the primary measure, which is the first of the first panel.
  const primary = groups[0]?.[0];
  const primaryBuckets = (primary && measureResult(result, primary)?.buckets) || [];
  const first = index === 0;
  // A derived figure belongs to the primary measure, so only the primary's panel has it.
  const derive = first ? source.derive : null;

  // A field named across a relationship belongs to the other entity, so it is not among `fields`.
  const split = chart?.split_by;
  const splitField = split && !split.via ? known?.find((f) => f.key === split.field) : undefined;
  const stack = chart && count === 1 && (type === 'bar' || type === 'column') ? (chart.stack_by ?? null) : null;
  const stackField = stack && !stack.via ? known?.find((f) => f.key === stack.field) : undefined;
  const stacked = stack !== null && lead !== undefined;

  let series: ChartSeries[];
  if (stacked) {
    const keys = segmentOrder(primaryBuckets);
    const colors = categoryColors(keys, stackField);
    series = keys.map((key, i) => {
      const sample = primaryBuckets.flatMap((b) => b.segments ?? []).find((segment) => segment.key === key);
      return {
        label: wordOf(bucketLabel(sample ?? { key }, stackField, stack.bucket), text),
        color: colors[i]!,
        pattern: patternOf(key, colors[i]!),
        measure: measureId(lead),
        segment: key,
      };
    });
  } else {
    series = drawn.map((measure) => {
      const color = measureColor(measure, measures.indexOf(measure));
      return { label: measureLabel(measure, known), color, pattern: patternOf(null, color), measure: measureId(measure), segment: null };
    });
  }

  // The primary's own buckets are the chart's, so only the other measures are joined to them, by key.
  const joined = stacked ? [] : drawn.map((measure, i) => (first && i === 0 ? null : byKey(measureResult(result, measure)?.buckets)));
  const drillOpen = drillable && result.outcome === 'ok' && !(chart?.drill_disabled === true);

  const buckets = primaryBuckets.map((b): ChartBucket => {
    const label = wordOf(bucketLabel(b, splitField, split?.bucket), text);
    const found = stacked
      ? series.map((s) => b.segments?.find((segment) => segment.key === s.segment))
      : drawn.map((_, i) => (first && i === 0 ? b : joined[i]!.get(b.key)));
    const drills = found.map((x, i): AfDrillTarget | null => {
      if (!drillOpen || !x?.drill) return null;
      return {
        drill: x.drill,
        measure: series[i]!.measure,
        bucket: b.key,
        segment: stacked ? x.key : null,
        label: stacked ? `${label} · ${series[i]!.label}` : label,
        count: x.count,
        other: x.other === true,
      };
    });
    const comparison = first ? (b.comparison ?? null) : null;
    return {
      key: b.key,
      label,
      other: b.other === true,
      restricted: b.key === '$restricted',
      filled: b.filled === true,
      unmatched: first && b.unmatched === true,
      target: first ? (b.target ?? null) : null,
      previous: comparison?.previous ?? null,
      difference: comparison?.difference ?? null,
      percentChange: comparison?.percent_change ?? null,
      compared: comparison !== null,
      derived: derive ? (b.derived ?? null) : null,
      total: derive ? (b.value ?? null) : null,
      values: found.map((x) => x?.value ?? null),
      counts: found.map((x) => x?.count ?? 0),
      drills,
    };
  });

  const compared = buckets.some((b) => b.compared);
  const leadMeasure = lead ?? {};
  const leadField = formatFieldOf(leadMeasure, known);
  const format = measureFormatter(leadMeasure, leadField, locale);

  const slices = pie ? slicesOf(buckets, splitField, locale) : [];
  const figures = derivedFigures(derive, type, count, buckets, format, primaryBuckets, text, locale);
  const ranks = source.derive?.kind === 'rank' && (type === 'bar' || type === 'column') ? primaryBuckets.map((b) => (typeof b.derived === 'number' && Number.isFinite(b.derived) ? rankWord(b.derived) : null)) : [];
  const legend: LegendItem[] = [];
  if (pie) {
    buckets.forEach((b, i) => {
      if (!hasSlice(b)) return;
      const slice = slices[i]!;
      legend.push(legendItem('slice', b.label, { bucket: i, detail: `${format(b.values[0]!)} · ${slice.share}`, color: slice.color, pattern: slice.pattern }));
    });
  } else {
    series.forEach((s, i) => legend.push(legendItem('series', s.label, { series: i, color: s.color, pattern: s.pattern })));
    if (compared && !stacked) legend.push(legendItem('earlier', text.tileEarlier, { color: series[0]?.color ?? null, pattern: series[0]?.pattern ?? null }));
    if (buckets.some((b) => b.target !== null)) legend.push(legendItem('target', text.tileTarget));
    if (figures.derive?.kind === 'running_total') legend.push(legendItem('running', text.tileRunningTotal));
    if (figures.derive?.kind === 'expression' && figures.beside.length > 0) legend.push(legendItem('formula', figures.derive.label));
    if (buckets.some((b) => b.filled)) legend.push(legendItem('filled', text.tileFilled));
  }

  return {
    type,
    stacked,
    compared,
    series,
    buckets,
    slices,
    splitLabel: splitField?.label || split?.field || '',
    empty: buckets.length === 0 || result.population?.count === 0 || (pie && !buckets.some(hasSlice)),
    legend,
    drill: { enabled: drillOpen, disabled: drillable && chart?.drill_disabled === true },
    format,
    unitLabel: count > 1 && lead ? unitWord(unitOf(lead, leadField), text) : null,
    ...figures,
    ranks,
  };
}

const NO_FIGURE = () => NONE;
const rankWord = (rank: number) => `#${rank}`;

/**
 * A chart's derived figure: what it is called, how a figure is worded, and the text written beside each bar. A share is worded
 * over the records of the buckets that have one, as the platform's `sharePopulation` does. The formatter of a formula is
 * made once, and a figure already worded is not worded again.
 */
function derivedFigures(
  derive: Derive | null,
  type: DrawnChart,
  panels: number,
  buckets: ChartBucket[],
  format: ChartModel['format'],
  primary: readonly Bucket[],
  text: Text,
  locale: string | undefined,
): Pick<ChartModel, 'derive' | 'formatDerived' | 'beside' | 'alone'> {
  if (!derive) return { derive: null, formatDerived: NO_FIGURE, beside: [], alone: [] };

  let word: (value: number) => string;
  let label: string;
  let missing = NONE;
  switch (derive.kind) {
    case 'share_of_total': {
      const population = primary.reduce((n, b) => n + (b.derived == null ? 0 : b.count), 0);
      word = (value) => formatShare(value, population, locale);
      // A pie has a share of its own, of the slices drawn, so the server's is named for what it is.
      label = isPie(type) ? text.tileDerivedShare : text.tileShare;
      break;
    }
    case 'running_total':
      word = format;
      label = text.tileDerivedRunning;
      break;
    case 'rank':
      word = rankWord;
      label = text.tileRank;
      break;
    case 'expression': {
      const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
      word = (value) => number.format(value);
      label = derive.label?.trim() || text.tileFormula;
      missing = text.tileFormulaNoValue;
      break;
    }
  }
  const worded = new Map<number | null, string>();
  const formatDerived = (value: number | null): string => {
    let said = worded.get(value);
    if (said === undefined) {
      said = value === null || !Number.isFinite(value) ? missing : word(value);
      worded.set(value, said);
    }
    return said;
  };

  // A formula in several panels would read as the unit of the one it is written in, so it stays in the tooltip.
  const writes = (derive.kind === 'share_of_total' || (derive.kind === 'expression' && panels === 1)) && (type === 'bar' || type === 'column');
  return {
    derive: { kind: derive.kind, label },
    formatDerived,
    beside: writes ? buckets.map((b) => (b.derived === null ? null : `${format(b.total)} · ${formatDerived(b.derived)}`)) : [],
    alone: writes ? buckets.map((b) => (b.derived === null ? null : formatDerived(b.derived))) : [],
  };
}

/** The legend of a set of panels: every panel's series, then the earlier period, the target and the filled period, which only the first panel draws. */
export function panelsLegend(panels: readonly ChartModel[]): LegendItem[] {
  const [first, ...rest] = panels;
  if (!first || rest.length === 0) return first?.legend ?? [];
  return [...panels.flatMap((p) => p.legend.filter((item) => item.kind === 'series')), ...first.legend.filter((item) => item.kind !== 'series')];
}

/** A slice for each bucket, coloured by the bucket's identity. The share is worded once here, over the records the drawn slices hold, so nothing downstream formats it again. */
function slicesOf(buckets: ChartBucket[], field: FigureField | undefined, locale: string | undefined): PieSlice[] {
  const colors = categoryColors(buckets.map((b) => b.key), field);
  const shares = sliceShares({ buckets });
  const population = buckets.reduce((n, b) => n + (hasSlice(b) ? (b.counts[0] ?? 0) : 0), 0);
  return buckets.map((b, i) => ({
    color: colors[i]!,
    pattern: b.restricted ? 'restricted' : b.other ? 'other' : patternOf(b.key, colors[i]!),
    share: shares[i] === null ? NONE : formatShare(shares[i]!, population, locale),
  }));
}

/** What a mark is painted with: a token or a literal. Other and none are painted by the hatch. */
export function paint(color: FigureColor | null): string {
  if (!color) return '';
  if ('slot' in color) return `var(--k-chart-${color.slot})`;
  return 'value' in color ? color.value : '';
}

function differenceCell(bucket: ChartBucket, hasValue: boolean, text: Text, locale: string | undefined): string {
  if (bucket.unmatched) return text.tileUnmatched;
  if (!hasValue && bucket.previous !== null) return text.tileGone;
  if (hasValue && bucket.previous === null) return text.tileNew;
  return formatPercentChange(bucket.percentChange, locale) ?? text.tileNoEarlier;
}

/** The panels' figures as a table: the split, each panel's visible series, a pie's share, then the first panel's earlier period, its difference, its derived figure and the target. */
export function tableOf(
  panels: readonly ChartModel[],
  hidden: ReadonlySet<number>,
  text: Text,
  locale?: string,
): { head: string[]; rows: string[][] } {
  const lead = panels[0];
  if (!lead) return { head: [], rows: [] };
  const shown = panels.map((p) => p.series.flatMap((_, i) => (hidden.has(i) ? [] : [i])));
  const hasTarget = lead.buckets.some((b) => b.target !== null);
  const cell = (model: ChartModel, value: number | null) => (value === null ? NONE : model.format(value));
  const pie = isPie(lead.type);
  const head = [lead.splitLabel, ...panels.flatMap((p, k) => shown[k]!.map((i) => p.series[i]!.label))];
  if (pie) head.push(text.tileShare);
  if (lead.compared) head.push(text.tileEarlier, text.tileDifference);
  if (lead.derive) head.push(lead.derive.label);
  if (hasTarget) head.push(text.tileTarget);

  const rows = lead.buckets.map((bucket, b) => {
    const row = [bucket.label, ...panels.flatMap((p, k) => shown[k]!.map((i) => cell(p, p.buckets[b]?.values[i] ?? null)))];
    if (pie) row.push(lead.slices[b]?.share ?? NONE);
    if (lead.compared) {
      const hasValue = lead.stacked ? bucket.values.some((v) => v !== null) : bucket.values[0] !== null && bucket.values[0] !== undefined;
      row.push(cell(lead, bucket.previous), differenceCell(bucket, hasValue, text, locale));
    }
    if (lead.derive) row.push(lead.formatDerived(bucket.derived));
    if (hasTarget) row.push(cell(lead, bucket.target));
    return row;
  });
  return { head, rows };
}
