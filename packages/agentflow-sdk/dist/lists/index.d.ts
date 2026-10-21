/** The item operations of a `list` field, with the server's exact rules, so a
 *  client can apply them locally before the server answers and roll back if
 *  it refuses. The server is the authority; this mirrors it. */
export declare const LIST_MAX_OPS = 100;
export type ListItem = {
    id: string;
} & Record<string, unknown>;
export type ListOp = {
    op: 'add';
    id?: string;
    values: Record<string, unknown>;
    after?: string | null;
} | {
    op: 'set';
    id: string;
    values: Record<string, unknown>;
} | {
    op: 'move';
    id: string;
    after: string | null;
} | {
    op: 'remove';
    id: string;
};
export type ListOpErrorCode = 'LIST_ITEM_NOT_FOUND' | 'ID_TAKEN' | 'ID_IN_VALUES' | 'TOO_MANY_OPS';
export declare class ListOpError extends Error {
    readonly code: ListOpErrorCode;
    constructor(code: ListOpErrorCode, message: string);
}
/** A UUIDv7: 48 bits of milliseconds, then random bits, so ids sort by time. */
export declare function newItemId(now?: number): string;
/** Apply `ops` in order. Returns a new array; never mutates `current`. */
export declare function applyListOps(current: ListItem[] | null | undefined, ops: ListOp[], mint?: () => string): ListItem[];
//# sourceMappingURL=index.d.ts.map