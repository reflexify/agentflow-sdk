import { afterEach, describe, expect, it } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { TILE_CASES } from './fixtures/tiles.js';
import type { TileCaseName } from './fixtures/tiles.js';

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
}

const parts = (el: Element, name: string) => [...el.shadowRoot!.querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const marks = (el: Element, selector = '[data-kind]') => [...parts(el, 'plot')[0]!.querySelectorAll<SVGElement>(selector)];

async function draw(name: TileCaseName, part: string) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  Object.assign(el, TILE_CASES[name], { drill: true });
  root.append(el);
  document.body.append(host);
  await expect.poll(() => parts(el, part).length, { timeout: 5000 }).toBeGreaterThan(0);
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
});

// The gallery draws these cases, so each must be the picture its name promises, not a state that stands in for it.
describe('the named tile cases', () => {
  it('draw the figures a number tile is made of', async () => {
    const goal = await draw('NUMBER_GOAL', 'figure');
    expect(parts(goal, 'figure').map((f) => [words(f.querySelector('[part="value"]')), words(f.querySelector('[part="goal"]')), words(f.querySelector('[part="comparison"]'))])).toEqual([
      ['$1,240,000', 'goal $1,500,000 · $260,000 short', 'vs earlier period: $1,100,000 · +$140,000 · +12.7%'],
    ]);

    const capped = await draw('NUMBER_CAPPED', 'figure');
    expect(words(parts(capped, 'meta')[0])).toBe('20,000 records · at least');

    const secondaries = await draw('NUMBER_SECONDARIES', 'figure');
    expect(parts(secondaries, 'secondary').map((s) => words(s.querySelector('[part="label"]')))).toEqual(['count', 'Average deal', 'Largest deal']);
  });

  it('draw a stack with its remainder, its withheld segment, its empty week and its undefined week', async () => {
    const el = await draw('COLUMN_STACKED', 'plot');
    const kinds = (bucket: number) => marks(el, `[data-bucket="${bucket}"][data-kind]`).map((m) => m.dataset.kind);
    expect(kinds(0), 'a week of four stages').toEqual(['value', 'value', 'value', 'value']);
    expect(kinds(2), 'the remainder is a fifth segment').toHaveLength(5);
    expect(kinds(4), 'the withheld segment is a fifth').toHaveLength(5);
    expect(kinds(5), 'a week with no records is an outline').toEqual(['filled']);
    expect(kinds(6), 'a week whose sum is undefined draws nothing').toEqual([]);
    expect(marks(el, '[style*="url("]'), 'the remainder and the withheld segment are hatched').toHaveLength(2);
    expect(parts(el, 'legend-item').map((item) => words(item))).toEqual(['New', 'Qualified', 'Closed won', 'Lost', '(Other)', '(Restricted)', 'no records (filled)']);
  });

  it('draw two measures with their earlier period and their targets, keyed by id', async () => {
    const el = await draw('BAR_GROUPED', 'plot');
    const kinds = marks(el).map((m) => m.dataset.kind);
    expect(kinds.filter((k) => k === 'value'), 'a bar for each region and measure').toHaveLength(8);
    expect(kinds.filter((k) => k === 'previous'), 'an earlier period for the three regions that have one').toHaveLength(3);
    expect(kinds.filter((k) => k === 'target'), 'a target mark for each region').toHaveLength(4);
    expect(parts(el, 'legend-item').map((item) => words(item))).toEqual(['Booked', 'Forecast', 'earlier period', 'target']);
  });

  it('draw a line with a gap, the earlier period and a target', async () => {
    const el = await draw('LINE', 'plot');
    const paths = marks(el, 'path');
    expect(paths.map((p) => p.dataset.kind)).toEqual(['previous', 'target', 'value', 'value']);
    const runs = (p: SVGElement) => p.getAttribute('d')!.split('M').length - 1;
    expect(runs(paths[2]!), 'the undefined week breaks the first line in two').toBe(2);
    expect(runs(paths[3]!), 'the second has no gap').toBe(1);
    expect(marks(el, 'circle').filter((c) => c.dataset.series === '0'), 'no dot where the value is missing').toHaveLength(7);
  });

  it('say what could not be drawn, in place of a figure', async () => {
    // The shell's own placeholder has a title, a state and a frame too, so wait for the words only the drawing code writes.
    const said = (el: Element) => words(parts(el, 'state')[0]);
    const saying = async (name: TileCaseName, expected: string) => {
      const el = await draw(name, 'state');
      await expect.poll(() => said(el), { timeout: 5000 }).toBe(expected);
    };
    await saying('UNAVAILABLE', 'Not available to you This tile is over records you cannot list.');
    await saying('FAILED', 'A field is gone Field "cost" no longer exists');
    // The shell and the drawing code draw one loading frame, so this holds whichever has drawn it.
    const loading = await draw('LOADING', 'state');
    expect(parts(loading, 'state')[0]!.getAttribute('role')).toBe('status');
    expect(said(loading)).toBe('Loading…');
  });
});
