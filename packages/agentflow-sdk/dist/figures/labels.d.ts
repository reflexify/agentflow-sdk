import type { components } from '../generated/public.js';
import type { FigureField, FigureMeasure, FigureText } from './types.js';
type Schemas = components['schemas'];
/** A field's options, tolerating the bare strings older definitions stored. */
export declare function optionsOf(field: Pick<FigureField, 'enum_values'> | undefined): Schemas['EnumOption'][];
/** A bucket's label: the three synthetic buckets and a boolean as codes, else a server label, an
 *  option's label, a period by its unit, or the raw key. A key no longer among the options is
 *  its raw key. */
export declare function bucketLabel(bucket: Pick<Schemas['Bucket'], 'key' | 'label'>, field?: FigureField, unit?: Schemas['DateBucket'] | null): FigureText;
/** A period key (its first day, ISO) rendered by its unit: `2026-04` for a month, `2026 Q2` for a
 *  quarter, and the key itself for a day or a week. */
export declare function formatPeriod(key: string, unit: Schemas['DateBucket']): string;
/** A measure's label: the authored one, else `fn · field` (`p90 · Amount` for a percentile,
 *  `Amount / Qty` for a ratio, `median · Opened → Closed` for a duration). A field missing from
 *  `fields` is its key. A measure with no `fn` is its field's label, or nothing. */
export declare function measureLabel(measure: FigureMeasure, fields?: readonly FigureField[]): string;
/** The measure a tile is about: the one marked primary, else the first. */
export declare function primaryMeasure<M extends FigureMeasure>(measures: readonly M[]): M | undefined;
/** A tile's heading: the authored label, else its primary measure's. A text or list tile without a
 *  label has none. */
export declare function tileTitle(tile: {
    kind: string;
    label?: string | null;
    query?: {
        measures: readonly FigureMeasure[];
    };
}, fields?: readonly FigureField[]): string;
/** What an echo replaces: a measure's definition, and `metric`, the reference by key that names one. */
type Definition = 'fn' | 'field' | 'ratio' | 'percentile' | 'duration' | 'filter' | 'group_by' | 'label' | 'thresholds' | 'metric';
/** A measure after `echoedMeasure`: the tile's envelope around the definition the server used. */
export type EchoedMeasure<M> = M extends unknown ? Omit<M, Definition> & Omit<Schemas['MetricSpec'], 'id'> : never;
/** The measure as the server computed it: a followed metric's definition in place of the tile's
 *  copy, which may be a version behind. The tile's envelope stays: its `id`, `key`, `primary` and
 *  `entity_metric_id`, and its own `color`, which the metric's only fills in. The definition is
 *  replaced, never merged, so a field the metric no longer reduces does not linger, and so is a
 *  reference by `metric` key, which the definition now stands in for. */
export declare function echoedMeasure<M extends FigureMeasure>(measure: M, echoed: null | undefined): M;
export declare function echoedMeasure<M extends FigureMeasure>(measure: M, echoed: Schemas['MetricSpec']): EchoedMeasure<M>;
export declare function echoedMeasure<M extends FigureMeasure>(measure: M, echoed: Schemas['MetricSpec'] | null | undefined): M | EchoedMeasure<M>;
export {};
//# sourceMappingURL=labels.d.ts.map