import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
import { getAppObjects } from '../app/objects.js';
import { AgentFlowError, ok } from '../errors.js';
import { newItemId } from '../lists/index.js';

type Schemas = components['schemas'];

/** An entity is named once: by its key in `entity`, or by its id (or `${entity:<key>}`) in `entity_id`. */
type OneEntity = { entity: string; entity_id?: never } | { entity?: never; entity_id: string };

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
export type ComputeMeasure =
  | (Omit<Schemas['TileMeasure'], 'id' | 'entity_metric_id'> & { id?: string; metric?: never })
  | ({ metric: string; key?: string | null; id?: string; primary?: boolean; color?: string | null } & NoDefinition);

export type ComputeQuery = Omit<Schemas['QuerySpec'], 'entity_id' | 'measures'> & { measures: ComputeMeasure[] } & OneEntity;

/** `Omit` on each member of a union, which a plain `Omit` over the union does not do. */
type Without<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type ChartedSpec = Without<Extract<Schemas['TileSpec'], { kind: 'number' | 'chart' }>, 'id' | 'position' | 'query'>;

/** A number, chart or text tile in a dashboard file's shape, or a list tile naming its saved view by key in `view`; `id` and `position` are optional, and an entity or a measure can be named by key. */
export type ComputeTile =
  | (ChartedSpec & { id?: string; position?: Schemas['TilePosition']; query: ComputeQuery })
  | ({ kind: 'list'; id?: string; position?: Schemas['TilePosition']; label?: string | null; view: string } & OneEntity)
  | { kind: 'text'; id?: string; position?: Schemas['TilePosition']; label?: string | null; body: string };

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
export const LIST_TILE_ROWS = 25;

/** The `records/query` body that reads a list tile's rows, without a page: a module adds its own `cursor` and `limit` for later pages. */
export type ListTileQuery = Omit<Schemas['RecordQueryRequest'], 'cursor' | 'before' | 'limit'>;

const FILTER_FAMILIES = ['field_filters', 'ref_filters', 'relative_dates'] as const;

/**
 * The query that reads a list tile's rows: its view, the view's sort, and in each predicate family the view's filter followed by the page's.
 * Every other member of the page's filter is kept, and `filter` is `{}` when neither holds a predicate. The server fingerprints the filter
 * into its cursors, so every page of one list is read with this same query.
 */
export function listTileQuery(list: Schemas['ListTileSource']): ListTileQuery {
  const filter: Schemas['EntityRecordFilters'] = { ...list.filter };
  for (const family of FILTER_FAMILIES) {
    const entries = [...(list.view_filter?.[family] ?? []), ...(list.filter?.[family] ?? [])];
    if (entries.length > 0) (filter as Record<string, unknown>)[family] = entries;
    else delete filter[family];
  }
  return { view_id: list.view_id, sort: list.sort.key, dir: list.sort.dir, filter };
}

/**
 * A tile the helper refuses before it sends the compute request, naming it in `tile`. Nothing is requested before
 * `ENTITY_TWICE`, `ENTITY_ID_INVALID`, `MEASURE_UNNAMED` and `PLACEHOLDER_UNRESOLVED`; an `ENTITY_NOT_FOUND` for a key that does not
 * resolve comes after the one read of the app's objects.
 */
export class ComputeTilesError extends Error {
  constructor(
    readonly code: 'ENTITY_NOT_FOUND' | 'ENTITY_TWICE' | 'ENTITY_ID_INVALID' | 'MEASURE_UNNAMED' | 'PLACEHOLDER_UNRESOLVED',
    readonly tile: string,
    message: string,
  ) {
    super(message);
    this.name = 'ComputeTilesError';
  }
}

type Json = Record<string, unknown>;

interface Prepared {
  name: string;
  /** The copy that is sent. */
  sent: Json;
  /** The copy's object that holds `entity` / `entity_id`: the tile, or its query. Null for a text tile. */
  holder: Json | null;
  /** Where `holder` sits in the tile, for messages. */
  prefix: string;
  /** The entity key to look up, once the members are checked, and the member it was written in. */
  key: string | null;
  member: 'entity' | 'entity_id';
  /** Each measure's copy and the name its result is returned under. */
  measures: { json: Json; name: string }[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLACEHOLDER = /^\$\{entity:([^}]+)\}$/;

/** Compute tiles the module defines, by its own names: the helper fills missing ids, resolves an entity given by key, and returns each result under its tile's name with `measures` keyed by name. */
export async function computeTiles<K extends string>(client: AgentFlowClient, tiles: Record<K, ComputeTile>): Promise<Record<K, ComputedTile>> {
  const prepared = Object.entries<ComputeTile>(tiles).map(([name, tile]) => prepare(name, tile));

  if (prepared.some((p) => p.key !== null)) {
    const objects = getAppObjects(client);
    await objects.load();
    for (const p of prepared) {
      if (p.key === null || p.holder === null) continue;
      const id = objects.id(`entity:${p.key}`);
      if (id === null) {
        throw new ComputeTilesError('ENTITY_NOT_FOUND', p.name, `computeTiles: tile "${p.name}": no entity "${p.key}" in this app, or it is off (${p.prefix}${p.member})`);
      }
      delete p.holder.entity;
      p.holder.entity_id = id;
    }
  }

  const named = prepared.map((p) => {
    p.sent.id ??= newItemId();
    return { name: p.name, id: String(p.sent.id), measures: p.measures.map((m) => ({ name: m.name, id: String((m.json.id ??= newItemId())) })) };
  });

  let answer: Schemas['ComputeResponse'];
  try {
    answer = await ok<Schemas['ComputeResponse']>(
      client.POST('/analytics/tiles/compute', { body: { tiles: prepared.map((p) => p.sent) } }),
    );
  } catch (error) {
    throw withTileName(error, named.map((n) => n.name));
  }

  // The server writes a UUID in lower case, whatever case the module sent.
  const byId = new Map(answer.tiles.map((t) => [t.tile_id.toLowerCase(), t]));
  const out: Record<string, ComputedTile> = {};
  for (const n of named) {
    const result = byId.get(n.id.toLowerCase());
    if (!result) throw new Error(`computeTiles: the answer has no result for tile "${n.name}"`);
    const { measures: returned, ...rest } = result;
    const byMeasureId = new Map(Object.entries(returned ?? {}).map(([id, m]) => [id.toLowerCase(), m]));
    const measures: ComputedTile['measures'] = {};
    for (const m of n.measures) {
      const r = byMeasureId.get(m.id.toLowerCase());
      if (r) measures[m.name] = r;
    }
    out[n.name] = { ...rest, measures };
  }

  await Promise.all(named.map((n) => readRows(client, out, n.name)));
  return out as Record<K, ComputedTile>;
}

/** Reads a list tile's first page into its result. A refusal costs that tile alone, which then reads `failed` with the server's code. */
async function readRows(client: AgentFlowClient, out: Record<string, ComputedTile>, name: string): Promise<void> {
  const result = out[name]!;
  const list = result.outcome === 'ok' ? result.list : null;
  if (!list) return;
  // An AgentFlow older than the list's columns sends neither them nor the view's filter and sort, so the rows cannot be
  // read as the view shows them. The tile says so, rather than wait for rows that never come.
  if (!list.columns) {
    out[name] = failedTile(result, { type: 'LIST_ROWS_UNSUPPORTED', title: 'This AgentFlow does not tell a list tile its columns', status: 501 });
    return;
  }
  try {
    const page = await ok<Schemas['EntityRecordPage']>(
      client.POST('/entities/{entity_id}/records/query', {
        params: { path: { entity_id: list.entity_id } },
        body: { ...listTileQuery(list), limit: LIST_TILE_ROWS },
      }),
    );
    out[name] = { ...result, rows: page.items, columns: list.columns, next_cursor: page.next_cursor ?? null };
  } catch (error) {
    if (!(error instanceof AgentFlowError)) throw error;
    out[name] = failedTile(result, {
      type: error.code,
      title: 'The rows could not be read',
      status: error.status,
      ...(error.detail ? { detail: error.detail } : {}),
    });
  }
}

/** A list tile that answered, turned into a failed one: the server's own shape for a tile that did not compute. */
function failedTile(result: ComputedTile, problem: Schemas['TileProblem']): ComputedTile {
  return { tile_id: result.tile_id, outcome: 'failed', computed_at: result.computed_at, coverage: result.coverage, measures: {}, problem };
}

/** A copy of the tile that is safe to change, checked: its entity members, its measures' names, and that no placeholder is left that the helper does not resolve. */
function prepare(name: string, tile: ComputeTile): Prepared {
  const sent: Json = { ...tile };
  let holder: Json | null = null;
  let prefix = '';
  let copies: Json[] = [];
  if (tile.kind === 'list') {
    holder = sent;
  } else if (tile.kind !== 'text') {
    const query: Json = { ...tile.query };
    if (Array.isArray(tile.query.measures)) {
      copies = tile.query.measures.map((m) => ({ ...m }));
      query.measures = copies;
    }
    sent.query = query;
    holder = query;
    prefix = 'query.';
  }
  const prepared: Prepared = { name, sent, holder, prefix, key: null, member: 'entity', measures: [] };
  const refuse = (code: ComputeTilesError['code'], message: string) => new ComputeTilesError(code, name, `computeTiles: tile "${name}": ${message}`);

  if (holder !== null) {
    const { entity, entity_id: entityId } = holder;
    if (entity !== undefined && entityId !== undefined) {
      throw refuse('ENTITY_TWICE', `${prefix}entity and ${prefix}entity_id are both set; give one`);
    }
    if (entity !== undefined) {
      if (typeof entity !== 'string' || entity === '') {
        throw refuse('ENTITY_NOT_FOUND', `${prefix}entity must be an entity key, not ${JSON.stringify(entity)}`);
      }
      prepared.key = entity;
    } else if (entityId !== undefined) {
      const placeholder = typeof entityId === 'string' ? PLACEHOLDER.exec(entityId) : null;
      if (placeholder) {
        prepared.key = placeholder[1]!;
        prepared.member = 'entity_id';
      } else if (typeof entityId !== 'string' || !UUID.test(entityId)) {
        throw refuse(
          'ENTITY_ID_INVALID',
          `${prefix}entity_id is ${JSON.stringify(entityId)}, neither an id nor a "\${entity:<key>}" placeholder; to name an entity by its key, set ${prefix}entity`,
        );
      }
    }
  }

  prepared.measures = copies.map((m, index) => {
    const result = m.key ?? m.id;
    if (result === undefined || result === null) {
      throw refuse('MEASURE_UNNAMED', `query.measures[${index}] has no key and no id, so its result would have no name`);
    }
    return { json: m, name: String(result) };
  });

  // The one placeholder the helper resolves is the entity it is about to look up.
  const resolved = prepared.key !== null && prepared.member === 'entity_id' ? `${prefix === '' ? '' : '/query'}/entity_id` : null;
  const left = placeholderIn(sent, '', resolved);
  if (left) {
    throw refuse(
      'PLACEHOLDER_UNRESOLVED',
      `${left.pointer} is ${JSON.stringify(left.value)}, a placeholder the helper does not resolve; it resolves only the tile's own "\${entity:<key>}" in ${prefix}entity_id, so give the value itself`,
    );
  }
  return prepared;
}

/** The first string in a tile's copy that starts with `${`, with its JSON pointer (RFC 6901), leaving out the member `skip` names. */
function placeholderIn(value: unknown, pointer: string, skip: string | null): { pointer: string; value: string } | null {
  if (typeof value === 'string') return value.startsWith('${') && pointer !== skip ? { pointer, value } : null;
  if (typeof value !== 'object' || value === null) return null;
  for (const [member, item] of Object.entries(value)) {
    const found = placeholderIn(item, `${pointer}/${member.replaceAll('~', '~0').replaceAll('/', '~1')}`, skip);
    if (found) return found;
  }
  return null;
}

/** A 422 that points at `tiles[<n>]` also says which of the module's tiles that is. */
function withTileName(error: unknown, names: string[]): unknown {
  if (!(error instanceof AgentFlowError) || error.status !== 422 || !error.detail) return error;
  const at = /^tiles\[(\d+)\]/.exec(error.detail);
  const name = at ? names[Number(at[1])] : undefined;
  if (!at || name === undefined) return error;
  const detail = `${at[0]} (${name})${error.detail.slice(at[0].length)}`;
  return new AgentFlowError(error.status, error.code, detail, error.requestId, error.fieldErrors);
}
