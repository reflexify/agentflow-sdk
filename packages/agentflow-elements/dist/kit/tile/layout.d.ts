import type { KitStrings } from '../text.js';
import type { ChartModel, Pattern } from './chart-model.js';
import type { AfDrillTarget } from './types.js';
export interface Size {
    width: number;
    height: number;
}
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface Tick {
    at: number;
    label: string;
    full: string;
}
export interface BarMark extends Box {
    series: number;
    bucket: number;
    kind: 'value' | 'previous' | 'filled';
    fill: string;
    opacity: number;
    pattern: Pattern;
    drill: AfDrillTarget | null;
    summary: string;
}
export interface TargetMark {
    bucket: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
/** The name of a panel's unit, written above the top left of its plot. */
export interface UnitMark {
    x: number;
    y: number;
    text: string;
}
/** A bucket's value and its share or formula, written past the end of its bar or above its column. */
export interface BarLabel {
    bucket: number;
    x: number;
    y: number;
    text: string;
    anchor: 'start' | 'middle';
}
/** A running total drawn through the bars: one line, broken where a bucket has no figure, and a dot on each figure. */
export interface RunningLayout {
    d: string;
    dots: {
        bucket: number;
        cx: number;
        cy: number;
        hollow: boolean;
    }[];
}
export interface BarLayout {
    plot: Box;
    marks: BarMark[];
    targets: TargetMark[];
    labels: BarLabel[];
    running: RunningLayout | null;
    valueTicks: Tick[];
    categoryTicks: Tick[];
    zero: number;
    hits: Box[];
    unit: UnitMark | null;
}
/** What the axes draw. */
export type AxesLayout = Pick<BarLayout, 'plot' | 'valueTicks' | 'categoryTicks' | 'unit'>;
export interface LinePath {
    series: number;
    kind: 'value' | 'previous' | 'target' | 'running';
    d: string;
    stroke: string;
    opacity: number;
    dashed: boolean;
}
export interface LineDot {
    series: number;
    bucket: number;
    cx: number;
    cy: number;
    hollow: boolean;
    stroke: string;
    drill: AfDrillTarget | null;
    summary: string;
}
export interface LineLabel {
    series: number;
    x: number;
    y: number;
    text: string;
}
export interface LineLayout {
    plot: Box;
    paths: LinePath[];
    dots: LineDot[];
    labels: LineLabel[];
    valueTicks: Tick[];
    categoryTicks: Tick[];
    bucketX: number[];
    /** The y of the value 0, when the axis runs from below it to above it. */
    zero: number | null;
    hits: Box[];
    unit: UnitMark | null;
}
/** What a panel of small multiples does differently from a chart that stands alone. */
export interface PanelOptions {
    /** The width of the value axis at the left of a column or line chart, so every panel puts its buckets at the same x. */
    valueGutter?: number;
    /** Whether a column or line chart labels its categories. A panel above another leaves them to the last, and takes a thinner margin. A bar chart labels every panel. */
    categoryLabels?: boolean;
    /** The name of the unit the panel's scale is in. */
    unitLabel?: string | null;
}
export declare function valueDomain(model: ChartModel, hidden: ReadonlySet<number>): [number, number];
/** The widest value gutter across the panels, so a bucket sits at the same x in each. A bar chart's value axis runs along the bottom, so it has none. */
export declare function panelGutter(models: readonly ChartModel[], hidden: ReadonlySet<number>): number;
export declare function layoutBars(model: ChartModel, size: Size, hidden: ReadonlySet<number>, text?: Pick<Required<KitStrings>, 'tileEarlier' | 'tileFilled'>, options?: PanelOptions): BarLayout;
export declare function layoutLines(model: ChartModel, size: Size, hidden: ReadonlySet<number>, text?: Pick<Required<KitStrings>, 'tileFilled'>, options?: PanelOptions): LineLayout;
export interface SliceMark {
    bucket: number;
    d: string;
    fill: string;
    pattern: Pattern;
    drill: AfDrillTarget | null;
    summary: string;
}
/** A pie drawn about `(cx, cy)`: each path is relative to that point. */
export interface PieLayout {
    cx: number;
    cy: number;
    outer: number;
    inner: number;
    slices: SliceMark[];
}
export declare function layoutPie(model: ChartModel, size: Size): PieLayout;
//# sourceMappingURL=layout.d.ts.map