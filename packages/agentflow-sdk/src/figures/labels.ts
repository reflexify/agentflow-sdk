import type { components } from '../generated/public.js';
import type { FigureField, FigureMeasure, FigureText } from './types.js';

type Schemas = components['schemas'];

/** A field's options, tolerating the bare strings older definitions stored. */
export function optionsOf(field: Pick<FigureField, 'enum_values'> | undefined): Schemas['EnumOption'][] {
  const out: Schemas['EnumOption'][] = [];
  for (const o of (field?.enum_values ?? []) as unknown[]) {
    if (typeof o === 'string') out.push({ value: o });
    else if (o && typeof o === 'object' && typeof (o as { value?: unknown }).value === 'string') out.push(o as Schemas['EnumOption']);
  }
  return out;
}

/** A bucket's label: the three synthetic buckets and a boolean as codes, else a server label, an
 *  option's label, a period by its unit, or the raw key. A key no longer among the options is
 *  its raw key. */
export function bucketLabel(
  bucket: Pick<Schemas['Bucket'], 'key' | 'label'>,
  field?: FigureField,
  unit?: Schemas['DateBucket'] | null,
): FigureText {
  if (bucket.key === null || bucket.key === undefined) return { code: 'empty' };
  if (bucket.key === '$restricted') return { code: 'restricted' };
  if (bucket.key === '$other') return { code: 'other' };
  if (bucket.label) return { text: bucket.label };
  if (field) {
    const option = optionsOf(field).find((o) => o.value === bucket.key);
    if (option?.label) return { text: option.label };
    if (field.type === 'boolean') return { code: bucket.key === 'true' ? 'yes' : 'no' };
  }
  if (unit) return { text: formatPeriod(bucket.key, unit) };
  return { text: bucket.key };
}

/** A period key (its first day, ISO) rendered by its unit: `2026-04` for a month, `2026 Q2` for a
 *  quarter, and the key itself for a day or a week. */
export function formatPeriod(key: string, unit: Schemas['DateBucket']): string {
  const [y, m, d] = key.split('-');
  if (!y || !m || !d) return key;
  switch (unit) {
    case 'month':
      return `${y}-${m}`;
    case 'quarter':
      return `${y} Q${Math.floor((Number(m) - 1) / 3) + 1}`;
    default:
      return key;
  }
}

/** A measure's label: the authored one, else `fn · field` (`p90 · Amount` for a percentile,
 *  `Amount / Qty` for a ratio, `median · Opened → Closed` for a duration). A field missing from
 *  `fields` is its key. A measure with no `fn` is its field's label, or nothing. */
export function measureLabel(measure: FigureMeasure, fields?: readonly FigureField[]): string {
  if (measure.label) return measure.label;
  const labelOf = (key: string) => fields?.find((f) => f.key === key)?.label ?? key;
  if (measure.fn === 'ratio' && measure.ratio) return `${labelOf(measure.ratio.of)} / ${labelOf(measure.ratio.per)}`;
  if (!measure.fn) return measure.field ? labelOf(measure.field) : '';
  const fn = measure.fn === 'percentile' && measure.percentile ? `p${measure.percentile.p}` : measure.fn;
  if (measure.duration) return `${fn} · ${labelOf(measure.duration.from)} → ${labelOf(measure.duration.to)}`;
  return measure.field ? `${fn} · ${labelOf(measure.field)}` : fn;
}

/** The measure a tile is about: the one marked primary, else the first. */
export function primaryMeasure<M extends FigureMeasure>(measures: readonly M[]): M | undefined {
  return measures.find((m) => m.primary) ?? measures[0];
}

/** A tile's heading: the authored label, else its primary measure's. A text or list tile without a
 *  label has none. */
export function tileTitle(
  tile: { kind: string; label?: string | null; query?: { measures: readonly FigureMeasure[] } },
  fields?: readonly FigureField[],
): string {
  if (tile.label) return tile.label;
  if (tile.kind === 'text' || tile.kind === 'list') return '';
  const primary = primaryMeasure(tile.query?.measures ?? []);
  return primary ? measureLabel(primary, fields) : '';
}

/** What an echo replaces: a measure's definition, and `metric`, the reference by key that names one. */
type Definition = 'fn' | 'field' | 'ratio' | 'percentile' | 'duration' | 'filter' | 'group_by' | 'label' | 'thresholds' | 'metric';

/** A measure after `echoedMeasure`: the tile's envelope around the definition the server used. */
export type EchoedMeasure<M> = M extends unknown ? Omit<M, Definition> & Omit<Schemas['MetricSpec'], 'id'> : never;

/** The measure as the server computed it: a followed metric's definition in place of the tile's
 *  copy, which may be a version behind. The tile's envelope stays: its `id`, `key`, `primary` and
 *  `entity_metric_id`, and its own `color`, which the metric's only fills in. The definition is
 *  replaced, never merged, so a field the metric no longer reduces does not linger, and so is a
 *  reference by `metric` key, which the definition now stands in for. */
export function echoedMeasure<M extends FigureMeasure>(measure: M, echoed: null | undefined): M;
export function echoedMeasure<M extends FigureMeasure>(measure: M, echoed: Schemas['MetricSpec']): EchoedMeasure<M>;
export function echoedMeasure<M extends FigureMeasure>(
  measure: M,
  echoed: Schemas['MetricSpec'] | null | undefined,
): M | EchoedMeasure<M>;
export function echoedMeasure<M extends FigureMeasure>(
  measure: M,
  echoed: Schemas['MetricSpec'] | null | undefined,
): M | EchoedMeasure<M> {
  if (!echoed) return measure;
  // The metric's own id names the metric, never this measure.
  const { id: _metricId, ...definition } = echoed;
  const next: Record<string, unknown> = { ...definition };
  if (measure.id !== undefined) next.id = measure.id;
  if (measure.color) next.color = measure.color;
  if (measure.primary !== undefined) next.primary = measure.primary;
  if (measure.key !== undefined) next.key = measure.key;
  if (measure.entity_metric_id !== undefined) next.entity_metric_id = measure.entity_metric_id;
  return next as EchoedMeasure<M>;
}
