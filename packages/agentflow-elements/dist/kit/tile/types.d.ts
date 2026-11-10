import type { components, ComputedTile, ComputeTile } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { KitStrings } from '../text.js';
type Schemas = components['schemas'];
export type AfTileSpec = Schemas['TileSpec'] | ComputeTile;
export type AfTileResult = Schemas['TileResult'] | ComputedTile;
/** What a mark offers to open: the records' address and the words for it. The click that opens it adds `newTab`. */
export interface AfDrillTarget {
    drill: Schemas['EntityRecordFilters'];
    measure: string;
    bucket: string | null;
    segment: string | null;
    label: string;
    count: number;
    other: boolean;
}
/** `af-drill`'s detail. `newTab` is true for a middle click and for a click with ctrl, meta or shift held, and false for a plain click. Enter or Space on a chart mark asks by its held modifier, as on a native button, where the browser's click for Enter or Space carries it. */
export interface AfDrillDetail extends AfDrillTarget {
    newTab: boolean;
}
/** A column of a list tile: the field it reads from each record's body, and the heading over it. */
export interface AfListColumn {
    key: string;
    label: string;
}
/** A record as a list tile draws it: the body and the labels the server resolved for it. */
export type AfListRow = Pick<Schemas['EntityRecord'], 'id' | 'entity_id' | 'body'> & Partial<Pick<Schemas['EntityRecord'], 'ref_labels' | 'file_labels' | 'file_counts' | 'mentions'>>;
/** `af-open-record`'s detail. `newTab` is true for a middle click and for a click with ctrl, meta or shift held, and false for a plain click; Enter or Space on the row's button is a click that carries the held modifier. */
export interface AfOpenRecordDetail {
    record: string;
    entity: string;
    newTab: boolean;
}
/** Which pages a list tile has on either side of the one it shows. `busy` is set while the module reads another, and stops the buttons. */
export interface AfTilePaging {
    prev: boolean;
    next: boolean;
    busy?: boolean;
}
/** `af-page`'s detail: the page the reader asked for. The module reads it and sets new `rows` and `paging`. */
export interface AfPageDetail {
    direction: 'prev' | 'next';
}
export interface TileViewProps {
    spec: AfTileSpec | null | undefined;
    result: AfTileResult | null | undefined;
    fields: readonly FigureField[] | null | undefined;
    rows: readonly AfListRow[] | null | undefined;
    columns: readonly AfListColumn[] | null | undefined;
    paging: AfTilePaging | null | undefined;
    /** A chart shown as its table (`true`) or its plot (`false`) by the host, which then draws the toggle itself. Unset, the tile draws its own toggle. */
    table: boolean | null | undefined;
    drill: boolean;
    text: Required<KitStrings>;
    locale: string | null | undefined;
    host: HTMLElement;
}
export {};
//# sourceMappingURL=types.d.ts.map