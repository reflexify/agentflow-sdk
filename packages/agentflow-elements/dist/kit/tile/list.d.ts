import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { MentionView } from '../mention-chip.js';
import type { KitStrings } from '../text.js';
import type { AfListColumn, AfListRow } from './types.js';
type Text = Required<KitStrings>;
/** A stretch of a rich cell: plain words, or a mention as this reader may see it. */
export type RichPart = {
    text: string;
} | {
    mention: MentionView;
};
/**
 * What a cell draws. Every kind keeps `text`, the words the cell holds: the row button's name, and what a reader of the table is told.
 * A `color` is a CSS colour, or `null` for the neutral one.
 */
export type ListCell = {
    kind: 'text';
    text: string;
} | {
    kind: 'options';
    text: string;
    options: {
        label: string;
        color: string | null;
    }[];
} | {
    kind: 'boolean';
    text: string;
    value: boolean;
} | {
    kind: 'number';
    text: string;
    bar: {
        percent: number;
        color: string | null;
    } | null;
    rating: boolean;
} | {
    kind: 'refs';
    text: string;
    refs: {
        label: string;
        resolved: boolean;
    }[];
} | {
    kind: 'file';
    text: string;
    name: string;
    unavailable: boolean;
    more: number;
} | {
    kind: 'rich';
    text: string;
    parts: RichPart[];
};
export interface ListModel {
    head: string[];
    /** A row's `key` is its record's id, or its place for a row with no id; `record` and `entity` are empty when the row cannot say which record it is. */
    rows: {
        key: string;
        record: string;
        entity: string;
        cells: ListCell[];
    }[];
}
/** What a cell with no value says. */
export declare const NO_VALUE = "\u2014";
/** One cell of a record, worded as the record table words it. A value of a shape its field does not hold is shown as text, and an empty one as a dash. */
export declare function cellText(row: AfListRow, key: string, field: FigureField | undefined, text: Text, locale?: string): string;
/** The table a list tile draws. Each column is read by its field once, however many rows there are. */
export declare function listModel(rows: readonly AfListRow[], columns: readonly AfListColumn[], fields: readonly FigureField[] | null | undefined, text: Text, locale?: string): ListModel;
export {};
//# sourceMappingURL=list.d.ts.map