import { afterEach, describe, expect, it, vi } from 'vitest';
import { AF_DEFAULT_PALETTE } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import { KIT_CSS } from '../../src/kit/index.js';
import type { AfDrillDetail, AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import type { KitStrings } from '../../src/kit/text.js';
import {
  DRILL, REVENUE_SPEC, TILE_FIELDS, amount, listTile, measure, measureResult, numberTile, populationOf, revenueResult, tileResult, uuid,
} from './fixtures/tile.js';
import { FAILED, UNAVAILABLE } from './fixtures/tiles.js';

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
  locale: string | null;
  strings: Partial<KitStrings> | null;
}
interface Heard { detail: unknown; bubbles: boolean; composed: boolean }

const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const partNames = (node: Element) => [...node.querySelectorAll('[part]')].map((n) => n.getAttribute('part'));

/** Mounts a tile inside another component's shadow root, as a module would, and records the `af-drill` it sends. */
async function mount(props: Partial<TileElement> = {}, attributes: Record<string, string> = {}) {
  document.body.innerHTML = '';
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  const heard: Heard[] = [];
  const outside: Event[] = [];
  root.addEventListener('af-drill', (e) => {
    if (e.target === el) heard.push({ detail: (e as CustomEvent).detail, bubbles: e.bubbles, composed: e.composed });
  });
  document.body.addEventListener('af-drill', (e) => outside.push(e));
  return { el, heard, outside };
}

/** Waits for the lazily loaded drawing code to have rendered the tile. */
async function drawn(el: Element, name = 'figure') {
  await expect.poll(() => part(el, name) !== null, { timeout: 5000 }).toBe(true);
}

const props = (over: Partial<TileElement> = {}): Partial<TileElement> => ({ spec: REVENUE_SPEC, result: revenueResult(), fields: TILE_FIELDS, ...over });

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<af-tile>', () => {
  it('shows loading until it has a spec and a result', async () => {
    const { el } = await mount({ fields: TILE_FIELDS });
    expect(part(el, 'state')?.getAttribute('role')).toBe('status');
    expect(words(part(el, 'state'))).toBe('Loading…');

    el.spec = REVENUE_SPEC;
    el.result = revenueResult();
    await drawn(el);
    expect(part(el, 'state'), 'the figure replaces loading').toBeNull();

    el.result = null;
    await expect.poll(() => part(el, 'figure')).toBeNull();
    expect(words(part(el, 'state')), 'a spec without a result').toBe('Loading…');
    el.result = revenueResult();
    await drawn(el);
    el.spec = null;
    await expect.poll(() => part(el, 'figure')).toBeNull();
    expect(words(part(el, 'state')), 'a result without a spec').toBe('Loading…');
  });

  it("draws a number tile's figure, meta, goal and comparison", async () => {
    const capped = populationOf({ count: 20000, capped: true, cap: 20000, drill: DRILL });
    const { el } = await mount(props({ result: revenueResult(1200, 20000, { population: capped }, { cap_bound: 'lower' }) }));
    await drawn(el);
    expect(words(part(el, 'title'))).toBe('Revenue');
    const figure = part(el, 'figure')!;
    expect(partNames(figure), 'in order').toEqual(['label', 'value', 'meta', 'goal', 'comparison']);
    expect(words(part(figure, 'label'))).toBe('sum · Amount');
    expect(words(part(figure, 'value'))).toBe('$1,200.00');
    expect(words(part(figure, 'meta')), 'the lines of the meta, joined').toBe('20,000 records · at least');
    expect(words(part(figure, 'goal'))).toBe('goal $1,500.00 · $300.00 short');
    expect(part(figure, 'goal')?.dataset.tone).toBe('short');
    expect(words(part(figure, 'comparison'))).toBe('vs earlier period: $1,000.00 · +$200.00 · +20%');
    expect(part(el, 'value')!.style.color, 'a value is text, never tinted').toBe('');
  });

  it('puts a missing value in the muted colour and the goal, over no value, in text tokens', async () => {
    const spec = numberTile([amount(1, { primary: true })], { transform: { target: { kind: 'constant', value: 500 } } });
    const { el } = await mount({ spec, result: tileResult({ [uuid(1)]: measureResult({ value: null, population: 0 }) }), fields: TILE_FIELDS });
    await drawn(el);
    expect(words(part(el, 'value'))).toBe('—');
    expect(part(el, 'value')!.classList.contains('muted')).toBe(true);
    expect(words(part(el, 'meta'))).toBe('No value over this population');
    expect(words(part(el, 'goal'))).toBe('goal $500.00');
    expect(part(el, 'goal')!.dataset.tone, 'a goal over no value has no tone, and is never drawn in a success colour').toBe('none');
  });

  it('draws up to three secondaries', async () => {
    const measures = [measure(1, { primary: true }), amount(2), measure(3, { field: 'stage', label: 'Stages' }), amount(4, { fn: 'max' }), amount(5, { fn: 'min' })];
    const result = tileResult(Object.fromEntries(measures.map((m, i) => [m.id, measureResult({ value: (i + 1) * 100, population: 7 })])));
    const { el } = await mount({ spec: numberTile(measures), result, fields: TILE_FIELDS });
    await drawn(el);
    const secondaries = parts(el, 'secondary');
    expect(secondaries.map((s) => [words(part(s, 'label')), words(part(s, 'value'))])).toEqual([
      ['sum · Amount', '$200.00'],
      ['Stages', '300'],
      ['max · Amount', '$400.00'],
    ]);
    expect(words(part(secondaries[0]!, 'meta'))).toBe('7 records');
    expect(secondaries.every((s) => !part(s, 'goal')), 'a secondary has no goal').toBe(true);
    expect(words(part(el, 'value')), 'the primary comes first').toBe('100');
  });

  it('says unavailable, failed and not drawn, and a title bar only when there is a title', async () => {
    const problem = { title: 'A field is gone', detail: 'Field "amount" no longer exists', status: 422, type: 'tile.failed' };
    const rows: [string, AfTileSpec, AfTileResult, string, string][] = [
      ['unavailable', UNAVAILABLE.spec, UNAVAILABLE.result!, 'Not available to you This tile is over records you cannot list.', 'Payroll'],
      ['failed, with its detail', FAILED.spec, FAILED.result!, 'A field is gone Field "cost" no longer exists', 'Margin'],
      ['failed, with none', REVENUE_SPEC, tileResult({}, { outcome: 'failed', problem: { ...problem, detail: null } }), 'A field is gone', 'Revenue'],
      ['failed, with no problem', REVENUE_SPEC, tileResult({}, { outcome: 'failed' }), 'This tile cannot be computed', 'Revenue'],
      ['not drawn', { ...listTile(), kind: 'map' } as unknown as AfTileSpec, tileResult({}), 'This tile cannot be drawn here yet', ''],
    ];
    for (const [name, spec, result, said, title] of rows) {
      const { el } = await mount({ spec, result, fields: TILE_FIELDS });
      await drawn(el, 'frame');
      await expect.poll(() => words(part(el, 'state')), { timeout: 5000 }).toBe(said);
      expect(words(part(el, 'title')), `${name}: the title`).toBe(title);
      expect(part(el, 'title') === null, `${name}: a bar only with a title`).toBe(title === '');
      for (const gone of ['figure', 'value', 'notes']) expect(part(el, gone), `${name}: no ${gone}`).toBeNull();
    }
  });

  it('lists its notes under the figure, one to a line', async () => {
    const coverage = { partial: true, declined_dashboard_filter: true };
    const { el } = await mount(props({ result: revenueResult(1200, 12, { coverage }) }));
    await drawn(el, 'notes');
    const notes = part(el, 'notes')!;
    expect([...notes.children].map((n) => words(n))).toEqual([
      "Shows everything: this tile does not follow the page's filter.",
      'Some records are withheld from you and not shown',
    ]);
    expect(part(el, 'figure')!.compareDocumentPosition(notes) & Node.DOCUMENT_POSITION_FOLLOWING, 'after the figure').toBeTruthy();

    const none = await mount(props());
    await drawn(none.el);
    expect(part(none.el, 'notes'), 'no notes, no list').toBeNull();
  });

  it('emits af-drill from the value only with the drill attribute', async () => {
    const detail: AfDrillDetail = { drill: DRILL, measure: uuid(1), bucket: null, segment: null, label: 'sum · Amount', count: 12, other: false, newTab: false };

    const off = await mount(props());
    await drawn(off.el);
    expect(part(off.el, 'value')!.tagName, 'text without the attribute').not.toBe('BUTTON');
    part(off.el, 'value')!.click();
    expect(off.heard).toEqual([]);

    const on = await mount(props(), { drill: '' });
    await drawn(on.el);
    const value = part(on.el, 'value')!;
    expect(value.tagName, 'a native button: Enter and Space press it').toBe('BUTTON');
    expect(value.getAttribute('type')).toBe('button');
    expect(value.title).toBe('Click to open 12 records');
    expect(parts(on.el, 'value').filter((v) => v.tagName === 'BUTTON'), 'the primary only').toHaveLength(1);
    value.click();
    expect(on.heard).toEqual([{ detail, bubbles: true, composed: false }]);
    expect(on.outside, 'not composed, so a page above the shadow root hears nothing').toEqual([]);

    on.heard.length = 0;
    value.dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }));
    const middle = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 1 });
    value.dispatchEvent(middle);
    expect(middle.defaultPrevented, 'a middle press starts no autoscroll, as on a link').toBe(true);
    value.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    value.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    expect(on.heard.map((h) => (h.detail as AfDrillDetail).newTab), 'a click with a modifier, and a middle click, ask for a new tab').toEqual([true, true]);

    on.el.removeAttribute('drill');
    await expect.poll(() => part(on.el, 'value')!.tagName).not.toBe('BUTTON');
    on.el.drill = true;
    await expect.poll(() => part(on.el, 'value')!.tagName).toBe('BUTTON');

    const one = await mount(props({ result: revenueResult(1200, 1), drill: true }));
    await drawn(one.el);
    expect(part(one.el, 'value')!.title).toBe('Click to open 1 record');

    const unaddressed = await mount(props({ result: revenueResult(1200, 12, { population: populationOf({ count: 12 }) }), drill: true }));
    await drawn(unaddressed.el);
    expect(part(unaddressed.el, 'value')!.tagName, 'with no address there is nothing to open').not.toBe('BUTTON');
  });

  it('redraws when result changes', async () => {
    const { el } = await mount(props());
    await drawn(el);
    expect(words(part(el, 'value'))).toBe('$1,200.00');
    el.result = revenueResult(1800, 30);
    await expect.poll(() => words(part(el, 'value'))).toBe('$1,800.00');
    expect(words(part(el, 'goal'))).toBe('goal $1,500.00 · $300.00 over');
    expect(words(part(el, 'meta'))).toBe('30 records');
    el.result = tileResult({}, { outcome: 'unavailable' });
    await expect.poll(() => part(el, 'figure')).toBeNull();
    expect(words(part(el, 'state'))).toContain('Not available to you');
  });

  it('speaks Vietnamese with locale vi, and takes strings over it', async () => {
    const { el } = await mount(props({ result: revenueResult(1200, 1234), drill: true }), { locale: 'vi' });
    await drawn(el);
    expect(words(part(el, 'meta'))).toBe('1.234 bản ghi');
    expect(words(part(el, 'goal'))).toMatch(/^mục tiêu .+ · thiếu .+$/);
    expect(part(el, 'value')!.title).toBe('Nhấn để mở 1.234 bản ghi');

    el.result = tileResult({}, { outcome: 'unavailable' });
    await expect.poll(() => words(part(el, 'state'))).toContain('Không khả dụng với bạn');
    el.strings = { tileUnavailable: 'Bị ẩn' };
    await expect.poll(() => words(part(el, 'state'))).toContain('Bị ẩn');
    el.locale = 'en';
    el.strings = null;
    await expect.poll(() => words(part(el, 'state'))).toContain('Not available to you');
  });

  it('carries its styles in its shadow root', async () => {
    const { el } = await mount(props());
    await drawn(el);
    const css = [...el.shadowRoot!.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n').replace(/\s+/g, '');
    expect(css, 'a rule of NumberFigure.svelte').toContain('font-variant-numeric:tabular-nums');
    expect(css, 'the kit layer').toContain('.af-skeleton');
    expect(css, 'a rule of TileView.svelte').toContain('.title');
  });
});

const VIEW_CHUNK = '../../src/kit/tile/tile-view.js';
const shadowText = (el: Element) => words(part(el, 'frame'));
/** The frame's inside as markup, without the comment anchors Svelte leaves where a block may draw, or the whitespace around them. */
const frameMarkup = (el: Element) => (part(el, 'frame')?.innerHTML ?? '').replace(/<!--.*?-->/g, '').replace(/\s+/g, ' ').trim();

describe('<af-tile> before and without its drawing code', () => {
  afterEach(() => {
    vi.doUnmock(VIEW_CHUNK);
  });

  it('says the tile could not be loaded when its drawing code fails to arrive', async () => {
    vi.doMock(VIEW_CHUNK, () => {
      throw new Error('chunk gone');
    });
    const { el } = await mount(props());
    await expect.poll(() => shadowText(el), { timeout: 5000 }).toContain('This tile could not be loaded. Reload the page to try again.');
    expect(el.shadowRoot!.querySelector('[role="status"]'), 'a failed load is not announced as loading').toBeNull();
    expect(shadowText(el)).not.toContain('Loading…');
  });

  it('is not busy after its drawing code fails, and loads it on the next connect', async () => {
    let calls = 0;
    vi.doMock(VIEW_CHUNK, async (importOriginal) => {
      calls += 1;
      if (calls === 1) throw new TypeError('Failed to fetch dynamically imported module');
      return importOriginal();
    });
    const { el } = await mount(props());
    await expect.poll(() => shadowText(el), { timeout: 5000 }).toContain('This tile could not be loaded.');
    expect(el.shadowRoot!.querySelector('[aria-busy="true"]')).toBeNull();
    el.remove();
    await new Promise((r) => setTimeout(r, 0));
    document.body.append(el);
    await drawn(el);
    expect(shadowText(el)).not.toContain('could not be loaded');
  });

  it('draws the loading frame the drawing code draws, so the tile does not jump when it arrives', async () => {
    // A title that is derived, not authored, so the shell has to work it out from the spec and the fields.
    const spec = { ...REVENUE_SPEC, label: undefined } as AfTileSpec;
    vi.doMock(VIEW_CHUNK, () => new Promise(() => {}));
    const { el: shell } = await mount({ spec, result: null, fields: TILE_FIELDS });
    await expect.poll(() => part(shell, 'frame')).not.toBeNull();
    const shellMarkup = frameMarkup(shell);
    const shellClass = part(shell, 'frame')!.className;
    expect(shellMarkup).toContain('sum · Amount');
    expect(part(shell, 'state')?.getAttribute('role')).toBe('status');
    expect(words(part(shell, 'head')), 'a host that hides the head hides the loading title with it').toBe('sum · Amount');

    vi.doUnmock(VIEW_CHUNK);
    const { el: view } = await mount({ spec, result: null, fields: TILE_FIELDS });
    await expect.poll(() => {
      const frame = part(view, 'frame');
      return frame !== null && frame.className !== shellClass;
    }, { timeout: 5000 }).toBe(true);
    expect(frameMarkup(view)).toBe(shellMarkup);
  });
});

describe("the kit's chart tokens", () => {
  const CHART = ['1', '2', '3', '4', '5', '6', '7', '8', 'other', 'hatch', 'grid', 'axis'];

  it("have fallbacks that are the SDK's palette, in the light block and the dark one", () => {
    const blocks = {
      light: /^\.af-kit \{([^}]*)\}/m.exec(KIT_CSS)?.[1] ?? '',
      dark: /^:host\(\[data-theme="dark"\]\) \.af-kit,[^{]*\{([^}]*)\}/m.exec(KIT_CSS)?.[1] ?? '',
    };
    for (const mode of ['light', 'dark'] as const) {
      const declared = Object.fromEntries(
        [...blocks[mode].matchAll(/--k-chart-([a-z0-9]+):\s*var\(--af-chart-\1,\s*([^)]+)\)/g)].map((m) => [m[1]!, m[2]!.trim()]),
      );
      expect(Object.keys(declared), mode).toEqual(CHART);
      for (const name of CHART) expect(declared[name], `${mode} ${name}`).toBe(AF_DEFAULT_PALETTE[mode][`--af-chart-${name}` as keyof typeof AF_DEFAULT_PALETTE.light]);
    }
  });
});
