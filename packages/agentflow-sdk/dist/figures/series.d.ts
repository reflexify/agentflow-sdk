import type { components } from '../generated/public.js';
import type { FigureField, FigureMeasure } from './types.js';
type Schemas = components['schemas'];
/** The categorical slots a chart colours by, `--af-chart-1` to `--af-chart-8`. Never cycled: an
 *  identity past the eighth is `other`. */
export declare const CHART_SLOTS = 8;
/** The palette an option or a measure may name as its own colour. */
export type OptionColor = 'violet' | 'sky' | 'teal' | 'emerald' | 'amber' | 'gray' | 'indigo' | 'rose' | 'fuchsia';
/** Each palette name as the literal colour AgentFlow paints it, never a `var()`, so it reads the
 *  same in any document. */
export declare const OPTION_COLOR_VALUES: Readonly<Record<OptionColor, string>>;
/** A series' colour: a categorical slot (1 to 8), a literal colour of its own, or `other`. */
export type FigureColor = {
    slot: number;
} | {
    value: string;
} | {
    other: true;
};
/** An authored colour as a literal: a palette name gives its value, `#rrggbb` gives itself, and
 *  anything else is no colour. */
export declare function colorOf(own: string | null | undefined): {
    value: string;
} | null;
/** A measure's colour: its own, else the slot its position in the tile's authored measure list
 *  gives it. Past the eighth it is `other`. */
export declare function measureColor(measure: Pick<FigureMeasure, 'color'>, position: number): FigureColor;
/** The colour of each key a chart splits by, following the identity rather than its rank, so a
 *  filter that removes a series does not repaint the rest. `$other` and `$restricted` are `other`;
 *  an option's own colour wins; on a field of at most eight options, an option takes the slot of
 *  its place in the list, and owns it whether or not it is in this chart. Every other key (a stale
 *  one, a null, any value of a wider field) takes, by appearance, the lowest slot no option owns
 *  and no key here holds; failing that, the lowest no key here holds; and `other` once none is
 *  left. */
export declare function categoryColors(keys: readonly (string | null)[], field?: FigureField): FigureColor[];
/** The segment keys across a chart's buckets, in order of first appearance, with `$other` and
 *  then `$restricted` last wherever they first appeared. */
export declare function segmentOrder(buckets: readonly Pick<Schemas['Bucket'], 'segments'>[]): (string | null)[];
/** The measures grouped by unit, the primary's group first: one group is one axis, more are small
 *  multiples. Within a group the primary leads, then the rest in authored order. */
export declare function axisGroups<M extends FigureMeasure>(measures: readonly M[], fields?: readonly FigureField[]): M[][];
/** A measure's result, by its `key` (as `computeTiles` returns them), else by its `id` (as the
 *  server does). */
export declare function measureResult(result: {
    measures?: Partial<Record<string, Schemas['MeasureResult']>> | null;
} | null | undefined, measure: Pick<FigureMeasure, 'id' | 'key'>): Schemas['MeasureResult'] | undefined;
export {};
//# sourceMappingURL=series.d.ts.map