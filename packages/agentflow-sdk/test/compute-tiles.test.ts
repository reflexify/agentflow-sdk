import { describe, expect, it, vi } from 'vitest';
import {
  type AgentFlowClient,
  AgentFlowError,
  bearerAdapter,
  computeTiles,
  ComputeTilesError,
  createAgentFlowClient,
  type ComputeTile,
  LIST_TILE_ROWS,
  listTileQuery,
} from '../src/index.js';

const BASE = 'http://af.test/api/v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const E1 = '0190f8f4-0000-7000-8000-0000000000e1';
const E2 = '0190f8f4-0000-7000-8000-0000000000e2';
const V1 = '0190f8f4-0000-7000-8000-0000000000c1';
const T1 = '0190f8f4-0000-7000-8000-0000000000a1';
const M1 = '0190f8f4-0000-7000-8000-0000000000b1';
const M2 = '0190f8f4-0000-7000-8000-0000000000b2';

type Json = any;

const OBJECTS = {
  objects: [
    { logical_key: 'entity:ticket', kind: 'entity', parent: null, key: null, id: E1, state: 'live', customized: false, contract: null, contract_version: '1.0.0', source: 'own', feature: null },
    { logical_key: 'entity:off', kind: 'entity', parent: null, key: null, id: null, state: 'off', customized: false, contract: null, contract_version: '1.0.0', source: 'own', feature: null },
  ],
  parameters: {},
  revision: 1,
};

/** What the server returns under a measure's id: distinct per id, so a mix-up shows. */
const measureResult = (id: string) => ({
  value: [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7),
  population: 3,
  cap_bound: null,
});

const resultFor = (tile: Json, over: Json = {}) => ({
  tile_id: tile.id,
  outcome: 'ok',
  computed_at: '2026-11-04T00:00:00Z',
  coverage: { partial: false },
  measures: Object.fromEntries((tile.query?.measures ?? []).map((m: Json) => [m.id, measureResult(m.id)])),
  ...(tile.kind === 'list'
    ? { list: { entity_id: tile.entity_id, view_id: V1, columns: [{ key: 'title', label: 'Title' }], sort: { key: 'updated_at', dir: 'desc' } } }
    : {}),
  ...over,
});

/** A record as `records/query` returns it, distinct per entity so a mix-up shows. */
const rowOf = (entityId: string) => ({ id: `${entityId.slice(0, -2)}r1`, entity_id: entityId, body: { title: 'First' } });
const ROW = rowOf(E1);

function fake(compute?: (tiles: Json[]) => Response, rows?: (entityId: string, body: Json) => Response | Promise<Response>) {
  const posts: Json[][] = [];
  const queries: { path: string; body: Json }[] = [];
  let objectRequests = 0;
  const fetch = vi.fn(async (req: Request) => {
    const path = new URL(req.url).pathname;
    if (path.endsWith('/app/objects')) {
      objectRequests++;
      return Response.json(OBJECTS);
    }
    if (path.endsWith('/analytics/tiles/compute') && req.method === 'POST') {
      const { tiles } = (await req.json()) as { tiles: Json[] };
      posts.push(tiles);
      return compute ? compute(tiles) : Response.json({ tiles: tiles.map((t) => resultFor(t)) });
    }
    const listed = /\/entities\/([^/]+)\/records\/query$/.exec(path);
    if (listed && req.method === 'POST') {
      const body = await req.json();
      queries.push({ path, body });
      const entityId = listed[1]!;
      return rows ? rows(entityId, body) : Response.json({ items: [rowOf(entityId)], next_cursor: null, prev_cursor: null });
    }
    return new Response('unexpected', { status: 500 });
  });
  const client = createAgentFlowClient({ baseUrl: BASE, auth: bearerAdapter(async () => 't'), fetch });
  return { client, posts, queries, objectRequests: () => objectRequests };
}

const count = (over: Json = {}) => ({ fn: 'count', primary: true, ...over });
const numberTile = (query: Json, over: Json = {}) => ({ kind: 'number', query: { measures: [count({ key: 'n' })], ...query }, ...over });

describe('computeTiles', () => {
  it('fills_ids_and_returns_results_by_name', async () => {
    const { client, posts } = fake();
    const r = await computeTiles(client, {
      open: { kind: 'number', query: { entity_id: E1, measures: [{ key: 'n', fn: 'count', primary: true }] } },
    });
    const sent = posts[0]![0]!;
    expect(sent.id).toMatch(UUID);
    expect(sent.query.measures[0].id).toMatch(UUID);
    expect(r.open.tile_id).toBe(sent.id);
    expect(r.open.measures.n).toEqual(measureResult(sent.query.measures[0].id));
  });

  it('keeps_the_ids_it_is_given', async () => {
    const { client, posts } = fake();
    const r = await computeTiles(client, {
      open: { id: T1, kind: 'number', query: { entity_id: E1, measures: [{ id: M1, key: 'n', fn: 'count', primary: true }] } },
    });
    expect(posts[0]![0]!.id).toBe(T1);
    expect(posts[0]![0]!.query.measures[0].id).toBe(M1);
    expect(r.open.tile_id).toBe(T1);
    expect(r.open.measures.n).toEqual(measureResult(M1));
  });

  it('resolves_an_entity_key_and_calls_app_objects_only_when_needed', async () => {
    const keyed = fake();
    await computeTiles(keyed.client, { a: numberTile({ entity: 'ticket' }) as ComputeTile });
    const query = keyed.posts[0]![0]!.query;
    expect(query.entity_id).toBe(E1);
    expect('entity' in query).toBe(false);
    expect(keyed.objectRequests()).toBe(1);

    const plain = fake();
    await computeTiles(plain.client, { a: numberTile({ entity_id: E1 }) as ComputeTile });
    expect(plain.posts).toHaveLength(1);
    expect(plain.objectRequests()).toBe(0);
  });

  it('resolves_a_placeholder_entity_id', async () => {
    const { client, posts } = fake();
    await computeTiles(client, {
      n: numberTile({ entity_id: '${entity:ticket}' }) as ComputeTile,
      l: { kind: 'list', entity: 'ticket', view: 'open', label: 'Open' },
    });
    expect(posts[0]![0]!.query.entity_id).toBe(E1);
    expect(posts[0]![1]).toMatchObject({ kind: 'list', entity_id: E1, view: 'open', label: 'Open' });
    expect('entity' in posts[0]![1]!).toBe(false);
  });

  it('refuses_an_entity_key_it_cannot_resolve_before_sending', async () => {
    for (const key of ['nope', 'off']) {
      const { client, posts } = fake();
      const failure = await computeTiles(client, { fine: numberTile({ entity: 'ticket' }) as ComputeTile, lost: numberTile({ entity: key }) as ComputeTile }).catch((e) => e);
      expect(failure).toBeInstanceOf(ComputeTilesError);
      expect(failure).toMatchObject({ code: 'ENTITY_NOT_FOUND', tile: 'lost' });
      expect(failure.message).toContain(`"${key}"`);
      expect(failure.message).toContain('"lost"');
      expect(posts).toHaveLength(0);
    }
  });

  it('refuses_an_ambiguous_or_malformed_entity', async () => {
    const cases: [string, Json, ComputeTilesError['code']][] = [
      ['both set', { entity: 'ticket', entity_id: E1 }, 'ENTITY_TWICE'],
      ['a key in entity_id', { entity_id: 'ticket' }, 'ENTITY_ID_INVALID'],
      ['another placeholder', { entity_id: '${entity_view:ticket/all}' }, 'ENTITY_ID_INVALID'],
    ];
    for (const [, query, code] of cases) {
      const { client, posts } = fake();
      const failure = await computeTiles(client, { bad: numberTile(query) as ComputeTile }).catch((e) => e);
      expect(failure).toBeInstanceOf(ComputeTilesError);
      expect(failure).toMatchObject({ code, tile: 'bad' });
      expect(failure.message).toContain('"bad"');
      expect(posts).toHaveLength(0);
    }

    // @ts-expect-error a tile names its entity once
    const both: ComputeTile = { kind: 'number', query: { entity: 'ticket', entity_id: E1, measures: [count({ key: 'n' })] } };
    expect(both.kind).toBe('number');
  });

  it('types_a_chart_tile_by_its_kind', () => {
    const chart: ComputeTile = { kind: 'chart', chart: 'line', split_by: { field: 'created_at', bucket: 'week' }, query: { entity: 'ticket', measures: [count({ key: 'n' })] } };
    // @ts-expect-error a chart tile needs its split
    const unsplit: ComputeTile = { kind: 'chart', chart: 'line', query: { entity: 'ticket', measures: [count({ key: 'n' })] } };
    // @ts-expect-error a number tile has no chart type
    const typed: ComputeTile = { kind: 'number', chart: 'line', query: { entity: 'ticket', measures: [count({ key: 'n' })] } };
    expect([chart.kind, unsplit.kind, typed.kind]).toEqual(['chart', 'chart', 'number']);
  });

  it('types_a_measure_result_as_possibly_missing', () => {
    type Computed = Awaited<ReturnType<typeof computeTiles<'x'>>>;
    // @ts-expect-error a tile that did not compute has no measures, so a read needs `?.`
    const unguarded = (r: Computed) => r.x.measures.p90.value;
    const guarded = (r: Computed) => r.x.measures.p90?.value;
    expect(guarded({ x: { measures: {} } } as Computed)).toBeUndefined();
    expect(unguarded).toBeTypeOf('function');
  });

  it('refuses_in_the_types_what_an_inline_tile_cannot_hold', () => {
    const never = (c: AgentFlowClient) => {
      // @ts-expect-error a number tile has no split
      void computeTiles(c, { a: { kind: 'number', split_by: { field: 'created_at', bucket: 'week' }, query: { entity: 'ticket', measures: [{ key: 'n', fn: 'count', primary: true }] } } });
      // @ts-expect-error a list tile names its view by key, in `view`
      void computeTiles(c, { a: { kind: 'list', entity: 'ticket', view: 'open', view_id: E1 } });
      // @ts-expect-error a measure follows a metric by key, so it has no entity_metric_id
      void computeTiles(c, { a: { kind: 'number', query: { entity: 'ticket', measures: [{ key: 'n', fn: 'count', primary: true, entity_metric_id: E1 }] } } });
      // @ts-expect-error a tile member misspelled
      void computeTiles(c, { a: { kind: 'number', drill_disabeld: true, query: { entity: 'ticket', measures: [{ key: 'n', fn: 'count', primary: true }] } } });
      // @ts-expect-error a query member misspelled
      void computeTiles(c, { a: { kind: 'number', query: { entity: 'ticket', filtre: {}, measures: [{ key: 'n', fn: 'count', primary: true }] } } });
      // @ts-expect-error a measure member misspelled
      void computeTiles(c, { a: { kind: 'number', query: { entity: 'ticket', measures: [{ key: 'n', fn: 'count', primary: true, lable: 'Open' }] } } });
      // @ts-expect-error a measure that follows a metric holds no definition of its own
      void computeTiles(c, { a: { kind: 'number', query: { entity: 'ticket', measures: [{ key: 'n', metric: 'won_deals', fn: 'count' }] } } });
      // @ts-expect-error a measure that defines itself does not follow a metric
      void computeTiles(c, { a: { kind: 'number', query: { entity: 'ticket', measures: [{ key: 'n', fn: 'count', primary: true, metric: 'won_deals' }] } } });
    };
    expect(never).toBeTypeOf('function');
  });

  it('types_the_names_of_inline_tiles_in_the_result', async () => {
    const { client } = fake();
    const r = await computeTiles(client, {
      total: { kind: 'number', query: { entity: 'ticket', measures: [{ key: 'n', fn: 'count', primary: true }, { key: 'won', metric: 'won_deals' }] } },
      open: { kind: 'list', entity: 'ticket', view: 'open', label: 'Open' },
    });
    const n: number | null | undefined = r.total.measures.n?.value;
    // @ts-expect-error no tile is named so
    void r.nope;
    expect([typeof n, r.open.tile_id]).toEqual(['number', expect.stringMatching(UUID)]);
  });

  it('refuses_a_measure_with_no_key_and_no_id_before_any_request', async () => {
    const { client, posts, objectRequests } = fake();
    const failure = await computeTiles(client, {
      keyed: numberTile({ entity: 'ticket' }) as ComputeTile,
      nameless: numberTile({ entity_id: E1, measures: [count()] }) as ComputeTile,
    }).catch((e) => e);
    expect(failure).toBeInstanceOf(ComputeTilesError);
    expect(failure).toMatchObject({ code: 'MEASURE_UNNAMED', tile: 'nameless' });
    expect(failure.message).toContain('"nameless"');
    expect(objectRequests()).toBe(0);
    expect(posts).toHaveLength(0);
  });

  it('refuses_a_placeholder_it_does_not_resolve_before_any_request', async () => {
    const filter = (value: unknown) => ({ filter: { all: [{ field: 'owner', op: 'eq', value }] } });
    const cases: [Json, string][] = [
      [numberTile({ entity: 'ticket', ...filter('${param:owner}') }), '/query/filter/all/0/value'],
      [numberTile({ entity_id: E1, ...filter('${dep:rfx/erp-core#entity:bill}') }), '/query/filter/all/0/value'],
      [numberTile({ entity: 'ticket', ref_filters: [{ inverse_entity_id: '${entity:order}' }] }), '/query/ref_filters/0/inverse_entity_id'],
      [{ kind: 'list', entity: 'ticket', view: 'open', label: '${param:title}' }, '/label'],
      [{ kind: 'text', body: '${param:note}' }, '/body'],
    ];
    for (const [tile, pointer] of cases) {
      const { client, posts, objectRequests } = fake();
      const failure = await computeTiles(client, { bad: tile as ComputeTile }).catch((e) => e);
      expect(failure).toBeInstanceOf(ComputeTilesError);
      expect(failure).toMatchObject({ code: 'PLACEHOLDER_UNRESOLVED', tile: 'bad' });
      expect(failure.message).toContain('"bad"');
      expect(failure.message).toContain(pointer);
      expect(objectRequests()).toBe(0);
      expect(posts).toHaveLength(0);
    }
  });

  it('does_not_take_the_entity_placeholder_it_resolves_for_one_it_does_not', async () => {
    const { client, posts } = fake();
    await computeTiles(client, {
      n: numberTile({ entity_id: '${entity:ticket}', filter: { all: [{ field: 'status', op: 'eq', value: '$not-a-placeholder' }] } }) as ComputeTile,
      l: { kind: 'list', entity_id: '${entity:ticket}', view: 'open' } as ComputeTile,
    });
    expect(posts[0]![0]!.query.entity_id).toBe(E1);
    expect(posts[0]![1]!.entity_id).toBe(E1);
  });

  it('computes_a_dashboard_files_tiles_unchanged', async () => {
    const { client, posts } = fake();
    const position = { col: 0, row: 0, w: 3, h: 2 };
    const r = await computeTiles(client, {
      open: { id: T1, kind: 'number', label: 'Open', position, query: { entity_id: '${entity:ticket}', measures: [{ id: M1, fn: 'count', primary: true }] } },
    });
    expect(posts[0]![0]).toEqual({
      id: T1, kind: 'number', label: 'Open', position,
      query: { entity_id: E1, measures: [{ id: M1, fn: 'count', primary: true }] },
    });
    expect(r.open.measures[M1]).toEqual(measureResult(M1));
  });

  it('follows_a_metric_by_key_unchanged', async () => {
    const { client, posts } = fake();
    await computeTiles(client, {
      won: { kind: 'number', query: { entity_id: E1, measures: [{ key: 'won', metric: 'won_deals', primary: true }] } },
    });
    expect(posts[0]![0]!.query.measures[0]).toEqual({ key: 'won', metric: 'won_deals', primary: true, id: expect.stringMatching(UUID) });
  });

  it('matches_results_by_tile_id', async () => {
    const { client } = fake((tiles) => Response.json({ tiles: tiles.map((t) => resultFor(t)).reverse() }));
    const r = await computeTiles(client, {
      a: { id: T1, kind: 'number', query: { entity_id: E1, measures: [{ id: M1, key: 'n', fn: 'count', primary: true }] } },
      b: { kind: 'number', query: { entity_id: E1, measures: [{ id: M2, key: 'n', fn: 'count', primary: true }] } },
    });
    expect(r.a.tile_id).toBe(T1);
    expect(r.a.measures.n).toEqual(measureResult(M1));
    expect(r.b.tile_id).not.toBe(T1);
    expect(r.b.measures.n).toEqual(measureResult(M2));
  });

  it('reads_a_result_back_when_the_server_writes_an_id_in_lower_case', async () => {
    const lower = (id: string) => id.toLowerCase();
    const { client } = fake((tiles) =>
      Response.json({
        tiles: tiles.map((t) => {
          const r = resultFor(t);
          return { ...r, tile_id: lower(r.tile_id), measures: Object.fromEntries(Object.entries(r.measures).map(([id, m]) => [lower(id), m])) };
        }),
      }),
    );
    const r = await computeTiles(client, {
      a: { id: T1.toUpperCase(), kind: 'number', query: { entity_id: E1, measures: [{ id: M1.toUpperCase(), key: 'n', fn: 'count', primary: true }] } },
    });
    expect(r.a.measures.n).toEqual(measureResult(M1.toUpperCase()));
  });

  it('a_tile_that_did_not_compute_has_no_measures', async () => {
    const problem = { status: 422, title: 'No field', type: 'TILE_FIELD_MISSING', detail: 'field "x" is not on the entity' };
    const { client } = fake((tiles) =>
      Response.json({
        tiles: [
          { tile_id: tiles[0].id, outcome: 'unavailable', computed_at: '2026-11-04T00:00:00Z', coverage: { partial: false } },
          { tile_id: tiles[1].id, outcome: 'failed', computed_at: '2026-11-04T00:00:00Z', coverage: { partial: false }, problem },
        ],
      }),
    );
    const r = await computeTiles(client, {
      x: numberTile({ entity_id: E1 }) as ComputeTile,
      f: numberTile({ entity_id: E1 }) as ComputeTile,
    });
    expect(r.x.outcome).toBe('unavailable');
    expect(r.x.measures).toEqual({});
    expect(r.x.measures.y).toBeUndefined();
    expect(r.f.outcome).toBe('failed');
    expect(r.f.problem).toEqual(problem);
    expect(r.f.measures).toEqual({});
  });

  it('names_the_tile_a_422_points_at', async () => {
    const { client } = fake(() =>
      Response.json({ type: 'TILE_SPEC_INVALID', detail: 'tiles[1]: measure 1 needs a field', request_id: 'req-1' }, { status: 422 }),
    );
    const failure = await computeTiles(client, {
      byStatus: numberTile({ entity_id: E1 }) as ComputeTile,
      byWeek: numberTile({ entity_id: E1 }) as ComputeTile,
    }).catch((e) => e);
    expect(failure).toBeInstanceOf(AgentFlowError);
    expect(failure).toMatchObject({
      status: 422,
      code: 'TILE_SPEC_INVALID',
      detail: 'tiles[1] (byWeek): measure 1 needs a field',
      requestId: 'req-1',
    });
  });

  it('rethrows_any_other_error_as_it_is', async () => {
    const { client } = fake(() => Response.json({ type: 'INTERNAL_ERROR', detail: 'tiles[0] is on fire' }, { status: 500 }));
    await expect(computeTiles(client, { a: numberTile({ entity_id: E1 }) as ComputeTile })).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
      detail: 'tiles[0] is on fire',
    });
  });

  it('does_not_change_the_tiles_it_is_given', async () => {
    const { client, posts } = fake();
    const tiles = {
      n: numberTile({ entity: 'ticket', measures: [count({ key: 'n' }), { key: 'won', metric: 'won_deals' }] }) as ComputeTile,
      l: { kind: 'list', entity: 'ticket', view: 'open' } as const,
      t: { kind: 'text', body: 'Hello' } as const,
    };
    const before = structuredClone(tiles);
    await computeTiles(client, tiles);
    await computeTiles(client, tiles);
    expect(tiles).toEqual(before);
    expect(posts[0]![0]!.id).not.toBe(posts[1]![0]!.id);
    expect(posts[0]![0]!.query.measures[0].id).not.toBe(posts[1]![0]!.query.measures[0].id);
  });

  it('reads_a_list_tiles_first_page_with_the_views_columns', async () => {
    const { client, queries } = fake();
    const r = await computeTiles(client, {
      open: { kind: 'list', entity_id: E1, view: 'open' },
      total: numberTile({ entity_id: E1 }) as ComputeTile,
    });
    expect(r.open.rows).toEqual([ROW]);
    expect(r.open.columns).toEqual([{ key: 'title', label: 'Title' }]);
    expect(r.open.columns).toEqual(r.open.list?.columns);
    expect(r.open.next_cursor, 'the last page: nothing after it').toBeNull();
    expect(queries).toEqual([
      { path: `/api/v1/entities/${E1}/records/query`, body: { filter: {}, sort: 'updated_at', dir: 'desc', view_id: V1, limit: LIST_TILE_ROWS } },
    ]);
    expect(LIST_TILE_ROWS).toBe(25);
    expect('rows' in r.total).toBe(false);
    expect('columns' in r.total).toBe(false);
    expect('next_cursor' in r.total).toBe(false);
  });

  it('returns_the_cursor_after_a_list_tiles_first_page', async () => {
    const { client } = fake(undefined, (entityId) => Response.json({ items: [rowOf(entityId)], next_cursor: 'c2', prev_cursor: null }));
    const r = await computeTiles(client, { open: { kind: 'list', entity_id: E1, view: 'open' } });
    expect(r.open.rows).toEqual([ROW]);
    expect(r.open.next_cursor).toBe('c2');
  });

  it('gives_a_list_tile_that_failed_no_cursor', async () => {
    const { client } = fake(undefined, () => Response.json({ type: 'ENTITY_SENSITIVE_FILTER_DENIED', title: 'Unprocessable Entity', status: 422 }, { status: 422 }));
    const r = await computeTiles(client, { open: { kind: 'list', entity_id: E1, view: 'open' } });
    expect(r.open.outcome).toBe('failed');
    expect('next_cursor' in r.open).toBe(false);
  });

  it('puts_the_views_filter_before_the_pages', () => {
    const A = { field: 'amount', op: 'gt', value: 0 };
    const B = { field: 'state', op: 'eq', value: 'open' };
    const R = { ref_field: 'vendor', target_field: 'status', op: 'eq', value: 'approved' };
    const D = { field: 'created_at', window: 'last_7_days' };
    const list: Json = {
      entity_id: E1,
      view_id: V1,
      columns: [],
      sort: { key: 'amount', dir: 'asc' },
      view_filter: { field_filters: [A], ref_filters: [R] },
      filter: { field_filters: [B], relative_dates: [D], q: 'x' },
    };
    expect(listTileQuery(list)).toEqual({
      view_id: V1,
      sort: 'amount',
      dir: 'asc',
      filter: { field_filters: [A, B], ref_filters: [R], relative_dates: [D], q: 'x' },
    });
    expect(list.view_filter).toEqual({ field_filters: [A], ref_filters: [R] });
    expect(list.filter).toEqual({ field_filters: [B], relative_dates: [D], q: 'x' });
  });

  it('a_refused_rows_request_fails_only_its_tile', async () => {
    const refusal = { type: 'ENTITY_SENSITIVE_FILTER_DENIED', title: 'Unprocessable Entity', status: 422, detail: 'field "secret" is sensitive', request_id: 'req-2' };
    const { client } = fake(undefined, (entityId) =>
      entityId === E1 ? Response.json(refusal, { status: 422 }) : Response.json({ items: [rowOf(entityId)], next_cursor: null, prev_cursor: null }),
    );
    const r = await computeTiles(client, {
      denied: { kind: 'list', entity_id: E1, view: 'open' },
      fine: { kind: 'list', entity_id: E2, view: 'open' },
    });
    expect(r.denied.outcome).toBe('failed');
    expect(r.denied.problem).toEqual({ type: 'ENTITY_SENSITIVE_FILTER_DENIED', title: 'The rows could not be read', status: 422, detail: 'field "secret" is sensitive' });
    expect('rows' in r.denied).toBe(false);
    expect('columns' in r.denied).toBe(false);
    expect(r.fine.outcome).toBe('ok');
    expect(r.fine.rows).toEqual([rowOf(E2)]);
  });

  it('sends_no_rows_request_for_a_list_tile_that_did_not_answer', async () => {
    const problem = { status: 422, title: 'No view', type: 'TILE_VIEW_MISSING', detail: 'no saved view "open"' };
    const { client, queries } = fake((tiles) =>
      Response.json({
        tiles: [
          { tile_id: tiles[0].id, outcome: 'unavailable', computed_at: '2026-11-04T00:00:00Z', coverage: { partial: false } },
          { tile_id: tiles[1].id, outcome: 'failed', computed_at: '2026-11-04T00:00:00Z', coverage: { partial: false }, problem },
        ],
      }),
    );
    const r = await computeTiles(client, {
      hidden: { kind: 'list', entity_id: E1, view: 'open' },
      missing: { kind: 'list', entity_id: E1, view: 'open' },
    });
    expect(queries).toHaveLength(0);
    for (const result of [r.hidden, r.missing]) {
      expect('rows' in result).toBe(false);
      expect('columns' in result).toBe(false);
    }
    expect(r.missing.problem).toEqual(problem);
  });

  it('fails_a_list_tile_from_an_older_platform_rather_than_leave_it_loading', async () => {
    const { client, queries } = fake((tiles) => Response.json({ tiles: tiles.map((t) => resultFor(t, { list: { entity_id: t.entity_id, view_id: V1 } })) }));
    const r = await computeTiles(client, { open: { kind: 'list', entity_id: E1, view: 'open' } });
    expect(queries).toHaveLength(0);
    expect(r.open.outcome).toBe('failed');
    expect(r.open.problem).toEqual({ type: 'LIST_ROWS_UNSUPPORTED', title: 'This AgentFlow does not tell a list tile its columns', status: 501 });
    expect('rows' in r.open).toBe(false);
  });

  it('reads_every_list_tiles_rows_at_once', async () => {
    let arrived = 0;
    let release!: () => void;
    const both = new Promise<void>((resolve) => (release = resolve));
    const { client } = fake(undefined, async (entityId) => {
      arrived += 1;
      if (arrived === 2) release();
      await both;
      return Response.json({ items: [rowOf(entityId)], next_cursor: null, prev_cursor: null });
    });
    const r = await computeTiles(client, {
      a: { kind: 'list', entity_id: E1, view: 'open' },
      b: { kind: 'list', entity_id: E2, view: 'open' },
    });
    expect(r.a.rows).toEqual([rowOf(E1)]);
    expect(r.b.rows).toEqual([rowOf(E2)]);
  });
});
