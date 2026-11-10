import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
type Schemas = components['schemas'];
/** An entity is named once: by its key in `entity`, or by its id (or `${entity:<key>}`) in `entity_id`. */
type OneEntity = {
    entity: string;
    entity_id?: never;
} | {
    entity?: never;
    entity_id: string;
};
/** What a measure that follows a metric cannot hold: the metric is the definition. */
type NoDefinition = {
    fn?: never;
    field?: never;
    duration?: never;
    ratio?: never;
    percentile?: never;
    filter?: never;
    group_by?: never;
    label?: never;
    thresholds?: never;
};
/** A definition of its own, or a metric the organization defined, followed by its key. The two are exclusive. */
export type ComputeMeasure = (Omit<Schemas['TileMeasure'], 'id' | 'entity_metric_id'> & {
    id?: string;
    metric?: never;
}) | ({
    metric: string;
    key?: string | null;
    id?: string;
    primary?: boolean;
    color?: string | null;
} & NoDefinition);
export type ComputeQuery = Omit<Schemas['QuerySpec'], 'entity_id' | 'measures'> & {
    measures: ComputeMeasure[];
} & OneEntity;
/** `Omit` on each member of a union, which a plain `Omit` over the union does not do. */
type Without<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type ChartedSpec = Without<Extract<Schemas['TileSpec'], {
    kind: 'number' | 'chart';
}>, 'id' | 'position' | 'query'>;
/** A number, chart or text tile in a dashboard file's shape, or a list tile naming its saved view by key in `view`; `id` and `position` are optional, and an entity or a measure can be named by key. */
export type ComputeTile = (ChartedSpec & {
    id?: string;
    position?: Schemas['TilePosition'];
    query: ComputeQuery;
}) | ({
    kind: 'list';
    id?: string;
    position?: Schemas['TilePosition'];
    label?: string | null;
    view: string;
} & OneEntity) | {
    kind: 'text';
    id?: string;
    position?: Schemas['TilePosition'];
    label?: string | null;
    body: string;
};
/**
 * The server's result, with `measures` keyed by each measure's `key`, or its `id` when it has none. A measure may be missing (the tile did not compute), so read it with `?.`.
 * A list tile that answered also carries its first page of `rows`, the `columns` its reader may read and the `next_cursor` after that page, which `<af-tile>` takes as they are (the cursor is for the module's own request for the next page).
 */
export type ComputedTile = Omit<Schemas['TileResult'], 'measures'> & {
    measures: Partial<Record<string, Schemas['MeasureResult']>>;
    /** The first `LIST_TILE_ROWS` records of a list tile, read in the reader's own scope. Set with `columns`, and only on a list tile whose rows were read. */
    rows?: Schemas['EntityRecord'][];
    /** The view's columns the reader may read, in the view's order. Set with `rows`. */
    columns?: Schemas['ListTileColumn'][];
    /** The cursor `records/query` gave after `rows`, to ask for the next page with; `null` when `rows` is the last page. Set with `rows`. */
    next_cursor?: string | null;
};
/** How many rows `computeTiles` reads for each list tile that answered. */
export declare const LIST_TILE_ROWS = 25;
/** The `records/query` body that reads a list tile's rows, without a page: a module adds its own `cursor` and `limit` for later pages. */
export type ListTileQuery = Omit<Schemas['RecordQueryRequest'], 'cursor' | 'before' | 'limit'>;
/**
 * The query that reads a list tile's rows: its view, the view's sort, and in each predicate family the view's filter followed by the page's.
 * Every other member of the page's filter is kept, and `filter` is `{}` when neither holds a predicate. The server fingerprints the filter
 * into its cursors, so every page of one list is read with this same query.
 */
export declare function listTileQuery(list: Schemas['ListTileSource']): ListTileQuery;
/**
 * A tile the helper refuses before it sends the compute request, naming it in `tile`. Nothing is requested before
 * `ENTITY_TWICE`, `ENTITY_ID_INVALID`, `MEASURE_UNNAMED` and `PLACEHOLDER_UNRESOLVED`; an `ENTITY_NOT_FOUND` for a key that does not
 * resolve comes after the one read of the app's objects.
 */
export declare class ComputeTilesError extends Error {
    readonly code: 'ENTITY_NOT_FOUND' | 'ENTITY_TWICE' | 'ENTITY_ID_INVALID' | 'MEASURE_UNNAMED' | 'PLACEHOLDER_UNRESOLVED';
    readonly tile: string;
    constructor(code: 'ENTITY_NOT_FOUND' | 'ENTITY_TWICE' | 'ENTITY_ID_INVALID' | 'MEASURE_UNNAMED' | 'PLACEHOLDER_UNRESOLVED', tile: string, message: string);
}
/** Compute tiles the module defines, by its own names: the helper fills missing ids, resolves an entity given by key, and returns each result under its tile's name with `measures` keyed by name. */
export declare function computeTiles<K extends string>(client: AgentFlowClient, tiles: Record<K, ComputeTile>): Promise<Record<K, ComputedTile>>;
export {};
//# sourceMappingURL=tiles.d.ts.map