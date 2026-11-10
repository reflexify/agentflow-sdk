import type { FigureColor, FigureField } from '@reflexify/agentflow-sdk/figures';
import type { KitStrings } from '../text.js';
import type { DeriveKind, DrawnChart } from './frame.js';
import type { AfDrillTarget, AfTileResult, AfTileSpec } from './types.js';
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
    drill: {
        enabled: boolean;
        disabled: boolean;
    };
    format: (value: number | null) => string;
    /** What the panel's scale is in: a currency's code, else the word for the unit. Null for a chart of one panel. */
    unitLabel: string | null;
    /** The tile's derived figure and the name it goes by, for the first panel of a chart that has one. */
    derive: {
        kind: DeriveKind;
        label: string;
    } | null;
    /** A derived figure as words. Built once for the model, so wording a bucket's figure builds no formatter. */
    formatDerived: (value: number | null) => string;
    /** Parallel to `buckets` for a chart that writes a figure past its bars or above its columns, and empty for every other: the bucket's value and its share or formula, null where it has no figure. Worded here, once, so a resize only places it. */
    beside: (string | null)[];
    /** Parallel to `beside`, and empty when it is: the figure alone, without the bucket's value. A column chart writes it when the full text is wider than the room its bucket has, and the value is on the axis, in the tooltip and in the table. */
    alone: (string | null)[];
    /** Parallel to `buckets` for a bar or column chart whose figure is a rank, and empty for every other: `#n` for a bucket that has one. Every panel has them, not the first alone: a column chart labels its categories in the last panel, and the margins that hold a label must be the same in every panel. */
    ranks: (string | null)[];
}
/** Whether a pie draws the bucket: it has a value above zero and was not filled in. */
export declare const hasSlice: (bucket: ChartBucket) => boolean;
/** A pie's share for each bucket: its value over the sum of the drawn slices; null where the bucket has no slice. */
export declare function sliceShares(model: Pick<ChartModel, 'buckets'>): (number | null)[];
/**
 * One model per unit, in `axisGroups` order, so the primary's panel comes first. Every panel has the primary's buckets, in its
 * order, with each measure's values joined by bucket key. Only the first panel carries the comparison and the targets. A pie,
 * or a chart in one unit, is one panel. Panels are never stacked.
 */
export declare function chartPanels(spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] | null | undefined, text: Text, locale: string | undefined, drillable: boolean): ChartModel[];
/** The chart drawn in one panel: the primary's unit, whatever else the tile measures. */
export declare function chartModel(spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] | null | undefined, text: Text, locale: string | undefined, drillable: boolean): ChartModel;
/** The legend of a set of panels: every panel's series, then the earlier period, the target and the filled period, which only the first panel draws. */
export declare function panelsLegend(panels: readonly ChartModel[]): LegendItem[];
/** What a mark is painted with: a token or a literal. Other and none are painted by the hatch. */
export declare function paint(color: FigureColor | null): string;
/** The panels' figures as a table: the split, each panel's visible series, a pie's share, then the first panel's earlier period, its difference, its derived figure and the target. */
export declare function tableOf(panels: readonly ChartModel[], hidden: ReadonlySet<number>, text: Text, locale?: string): {
    head: string[];
    rows: string[][];
};
export {};
//# sourceMappingURL=chart-model.d.ts.map