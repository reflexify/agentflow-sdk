import type { FigureColor } from '@reflexify/agentflow-sdk/figures';
import type { KitStrings } from '../text.js';
import type { ChartModel, Pattern } from './chart-model.js';
import type { AfDrillTarget } from './types.js';
type Text = Required<KitStrings>;
export interface Focus {
    bucket: number;
    series: number;
}
/** What a mark offers the keyboard and the pointer: where it is, and what it opens. */
export interface Pressable {
    bucket: number;
    series: number;
    drill: AfDrillTarget | null;
}
export interface TooltipModel {
    title: string;
    rows: {
        label: string;
        value: string;
        color: FigureColor | null;
        pattern: Pattern;
    }[];
    target: string | null;
    earlier: string | null;
    change: string | null;
    total: string | null;
    /** A pie slice's share of the whole. */
    share: string | null;
    /** The derived figure of the bucket, under the name the chart gives it. */
    derived: {
        label: string;
        value: string;
    } | null;
    hint: string | null;
}
/** Whether a press asks for the record in a new tab, as for a link: the middle button, or ctrl, meta or shift held. Enter or Space on a chart mark asks by its held modifier too, as the browser's click for them does on a native button. */
export declare const asksNewTab: (e: Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'> & {
    button?: number;
}) => boolean;
/** Whether a press opens at all: a click, or the middle button's `auxclick`. Any other button's `auxclick` is not a press, as a right click is the context menu's. */
export declare const presses: (e: MouseEvent) => boolean;
/** A middle press on something that opens starts no autoscroll, as on a link: its `auxclick` opens it in a new tab. */
export declare function holdMiddle(e: MouseEvent): void;
/** Whether the chart draws a mark for this series in this bucket: the one a keyboard can reach. A period with no records is one outline, on the first series showing. A pie has a mark for each slice. */
export declare function hasMark(model: ChartModel, hidden: ReadonlySet<number>, bucket: number, series: number): boolean;
export declare const isNavigation: (key: string) => boolean;
/** Arrows step along the buckets (down the page for a bar chart) and across the series; Home and End go to the first and last bucket. A bucket with no mark for the series is skipped, and nothing wraps. Any other key, or no place to go, returns `focus` itself. */
export declare function moveFocus(focus: Focus, key: string, model: ChartModel, hidden: ReadonlySet<number>): Focus;
/** The mark that takes the tab stop: `focus` while it still has a mark, else the nearest one that does, by buckets first. With no focus yet it is the first mark. No marks at all gives null. */
export declare function clampFocus(focus: Focus | null, model: ChartModel, hidden: ReadonlySet<number>): Focus | null;
export declare const isIsolated: (hidden: ReadonlySet<number>, series: number, count: number) => boolean;
/** Hides every series but this one, or shows them all when this one is already alone. */
export declare function toggleIsolation(hidden: ReadonlySet<number>, series: number, count: number): Set<number>;
/** The legend only holds nothing hidden or all but one hidden, so a new model keeps the one series that was alone, found by measure and segment, and hides every other series, new ones included. When it is gone, or has nothing left to be isolated from, every series is shown. */
export declare function keepIsolation(hidden: ReadonlySet<number>, before: ChartModel, after: ChartModel): Set<number>;
/** The drill a click on a bucket's strip opens, and the one its tooltip hint counts: the first visible series with an address, in an unstacked chart; none in a stack, and none for a period with no records, whose marks open nothing though the server addresses it. */
export declare function stripDrill(model: ChartModel, bucket: number, hidden: ReadonlySet<number>): AfDrillTarget | null;
/** What a bucket's tooltip says. The count in the hint, and the percent change, follow `locale`. */
export declare function tooltipOf(model: ChartModel, bucket: number, hidden: ReadonlySet<number>, text: Text, drill: {
    enabled: boolean;
    disabled: boolean;
}, locale?: string): TooltipModel;
interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}
/** Where a tooltip goes: above its mark, or beside it for a bar chart, flipped to the other side where it would leave the viewport, then held inside it. */
export declare function placeTooltip(anchor: Rect, tip: {
    width: number;
    height: number;
}, view: {
    width: number;
    height: number;
}, side: 'above' | 'beside'): {
    left: number;
    top: number;
};
export {};
//# sourceMappingURL=interaction.d.ts.map