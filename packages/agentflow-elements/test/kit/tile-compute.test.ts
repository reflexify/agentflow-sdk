import { bearerAdapter, computeTiles, createAgentFlowClient, type ComputeTile, type ComputedTile } from '@reflexify/agentflow-sdk';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/kit/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ENTITY = '0190f8f4-0000-7000-8000-0000000000e1';
const VIEW = '0190f8f4-0000-7000-8000-0000000000c1';

// What a module asks for, as computeTiles takes it: a number and a list.
const TILES = {
  open: { kind: 'number', query: { entity_id: ENTITY, measures: [{ key: 'open', fn: 'count', primary: true }] } },
  deals: { kind: 'list', entity_id: ENTITY, view: 'open-deals', label: 'Open deals' },
} satisfies Record<string, ComputeTile>;

type Json = any;

/** The server: the tiles operation answers each tile under the ids computeTiles sent, and records/query reads a list's first page. */
const fetch = async (req: Request) => {
  const path = new URL(req.url).pathname;
  if (path.endsWith('/analytics/tiles/compute')) {
    const { tiles } = (await req.json()) as { tiles: Json[] };
    return Response.json({
      tiles: tiles.map((t) => ({
        tile_id: t.id,
        outcome: 'ok',
        computed_at: '2026-11-08T00:00:00Z',
        coverage: { partial: false },
        measures: Object.fromEntries((t.query?.measures ?? []).map((m: Json) => [m.id, { value: 42, population: 42, cap_bound: null }])),
        ...(t.kind === 'list' ? { list: { entity_id: ENTITY, view_id: VIEW, columns: [{ key: 'title', label: 'Deal' }], sort: { key: 'updated_at', dir: 'desc' } } } : {}),
      })),
    });
  }
  if (path.endsWith(`/entities/${ENTITY}/records/query`)) {
    const record = (n: number, title: string) => ({ id: `0190f8f4-0000-7000-8000-00000000000${n}`, entity_id: ENTITY, body: { title } });
    return Response.json({ items: [record(1, 'Acme renewal'), record(2, 'Globex expansion')], next_cursor: null, prev_cursor: null });
  }
  return new Response('unexpected', { status: 500 });
};

type Props = { spec: ComputeTile; result: ComputedTile; fields: null; rows?: unknown; columns?: unknown };
type Host = (props: Props) => Promise<HTMLElement>;

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const plainPage: Host = async (props) => {
  const el = Object.assign(document.createElement('af-tile'), props);
  document.body.append(el);
  return el;
};

const reactModule: Host = async (props) => {
  const container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(async () => root!.render(createElement('af-tile', props)));
  return container.querySelector<HTMLElement>('af-tile')!;
};

const shadow = (el: Element, selector: string) => [...(el.shadowRoot?.querySelectorAll<HTMLElement>(selector) ?? [])].map((n) => n.textContent!.trim());

// The path the README documents: the tile as sent is `spec`, what computeTiles returned is `result`, and a list's `rows`
// and `columns` are passed as they came. A change to either side's shape breaks one of these.
describe('<af-tile> from computeTiles output', () => {
  it.each([
    ['a plain-HTML page', plainPage],
    ['a React module', reactModule],
  ])('draws a number and a list in %s', async (_, host) => {
    const client = createAgentFlowClient({ baseUrl: 'http://af.test/api/v1', auth: bearerAdapter(async () => 't'), fetch });
    const results = await computeTiles(client, TILES);

    const number = await host({ spec: TILES.open, result: results.open, fields: null });
    await expect.poll(() => shadow(number, '[part~="value"]'), { timeout: 5000 }).toEqual(['42']);

    const { rows, columns } = results.deals;
    const list = await host({ spec: TILES.deals, result: results.deals, fields: null, rows, columns });
    await expect.poll(() => shadow(list, '[part~="list"] tbody tr'), { timeout: 5000 }).toEqual(['Acme renewal', 'Globex expansion']);
    expect(shadow(list, '[part~="list"] thead th')).toEqual(['Deal']);
  });
});
