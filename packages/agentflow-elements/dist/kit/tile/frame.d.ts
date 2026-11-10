import type { components } from '@reflexify/agentflow-sdk';
import type { FigureField, FigureMeasure, FigureText } from '@reflexify/agentflow-sdk/figures';
import type { KitStrings } from '../text.js';
import type { AfTileResult, AfTileSpec } from './types.js';
import type { VerdictModel } from './verdict.js';
export type TileState = {
    kind: 'loading';
} | {
    kind: 'unavailable';
} | {
    kind: 'failed';
    title: string;
    detail: string | null;
} | {
    kind: 'not-drawn';
} | {
    kind: 'number';
} | {
    kind: 'text';
} | {
    kind: 'list';
} | {
    kind: 'chart';
    chart: DrawnChart;
};
export declare const DRAWN_CHARTS: readonly ['bar', 'column', 'line', 'pie', 'donut'];
export type DrawnChart = (typeof DRAWN_CHARTS)[number];
export declare const isPie: (chart: DrawnChart) => chart is "donut" | "pie";
/** The derived figures this build draws. A tile with any other `derive` kind, from a newer server, is not drawn. */
export declare const DERIVE_KINDS: readonly ['share_of_total', 'running_total', 'rank', 'expression'];
export type DeriveKind = (typeof DERIVE_KINDS)[number];
export type Derive = components['schemas']['DerivedShape'];
/** Whether this build knows how to draw the tile's derived figure, if it has one. */
export declare const drawsDerive: (spec: AfTileSpec) => boolean;
/** The tile's derived figure when it is one this build draws. */
export declare const deriveOf: (spec: AfTileSpec) => Derive | null;
export interface FrameModel {
    title: string;
    state: TileState;
    /** What a chart says about its own buckets, drawn between the chart and the notes. */
    verdict: VerdictModel | null;
    notes: string[];
}
type Text = Required<KitStrings>;
/** The tile's measures as the server computed them: each read through its echoed definition. */
export declare function tileMeasures(spec: AfTileSpec, result: AfTileResult | null | undefined): FigureMeasure[];
/** The name a measure's result and a drill address go by: its key, else its id. */
export declare function measureId(measure: FigureMeasure): string;
export declare function wordOf(label: FigureText, text: Text): string;
export declare function formatCount(count: number, locale?: string): string;
export declare function coverageLines(result: AfTileResult, text: Text): string[];
export declare function measureLines(result: {
    advisory?: string | null;
    skipped?: number | null;
} | undefined, text: Text, locale?: string): string[];
/** `listed` says a list tile's rows and columns have both arrived: until they do it is loading, and an empty list of rows is an answer. */
export declare function frameModel(spec: AfTileSpec | null | undefined, result: AfTileResult | null | undefined, fields: readonly FigureField[] | null | undefined, text: Text, locale?: string, listed?: boolean): FrameModel;
export {};
//# sourceMappingURL=frame.d.ts.map