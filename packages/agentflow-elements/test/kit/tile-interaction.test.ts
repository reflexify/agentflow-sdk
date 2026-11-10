import { afterEach, describe, expect, it } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import type { ChartModel } from '../../src/kit/tile/chart-model.js';
import { clampFocus, hasMark, isIsolated, keepIsolation, moveFocus, placeTooltip, stripDrill, toggleIsolation, tooltipOf } from '../../src/kit/tile/interaction.js';
import type { Focus } from '../../src/kit/tile/interaction.js';
import { layoutBars, layoutLines } from '../../src/kit/tile/layout.js';
import { KIT_TEXT } from '../../src/kit/text.js';
import type { AfDrillTarget } from '../../src/kit/tile/types.js';
import { modelOf } from './fixtures/chart.js';
import { DRILL, TILE_FIELDS, bucketOf, chartResult, chartTile, measure, uuid } from './fixtures/tile.js';

const EN = KIT_TEXT.en;
const NONE: ReadonlySet<number> = new Set();
const ON = { enabled: true, disabled: false };
const OFF = { enabled: false, disabled: false };
const at = (bucket: number, series: number): Focus => ({ bucket, series });
const drillOf = (count: number): AfDrillTarget => ({ drill: {} as AfDrillTarget['drill'], measure: 'm', bucket: 'k', segment: null, label: 'l', count, other: false });

describe('moveFocus', () => {
  const grid = (type: ChartModel['type'], over: Partial<ChartModel> = {}) => modelOf([[1, 2], [3, 4], [5, 6]], { type, ...over });

  it('moves by arrow, Home and End, for columns and bars', () => {
    const rows: [string, ChartModel, string, Focus, Focus][] = [
      ['column: Right is the next bucket', grid('column'), 'ArrowRight', at(0, 0), at(1, 0)],
      ['column: Left is the one before', grid('column'), 'ArrowLeft', at(2, 1), at(1, 1)],
      ['column: Down is the next series', grid('column'), 'ArrowDown', at(1, 0), at(1, 1)],
      ['column: Up is the one before', grid('column'), 'ArrowUp', at(1, 1), at(1, 0)],
      ['column: Home is the first bucket', grid('column'), 'Home', at(2, 1), at(0, 1)],
      ['column: End is the last', grid('column'), 'End', at(0, 1), at(2, 1)],
      ['line: the same keys as a column', grid('line'), 'ArrowRight', at(0, 1), at(1, 1)],
      ['stacked column: Up climbs the stack', grid('column', { stacked: true }), 'ArrowUp', at(1, 0), at(1, 1)],
      ['stacked column: Down comes back down it', grid('column', { stacked: true }), 'ArrowDown', at(1, 1), at(1, 0)],
      ['bar: Down is the next bucket, since buckets run down the page', grid('bar'), 'ArrowDown', at(0, 1), at(1, 1)],
      ['bar: Up is the one before', grid('bar'), 'ArrowUp', at(2, 0), at(1, 0)],
      ['bar: Right is the next series', grid('bar'), 'ArrowRight', at(1, 0), at(1, 1)],
      ['bar: Left is the one before', grid('bar'), 'ArrowLeft', at(1, 1), at(1, 0)],
      ['bar: Home', grid('bar'), 'Home', at(2, 0), at(0, 0)],
      ['bar: End', grid('bar'), 'End', at(0, 0), at(2, 0)],
    ];
    for (const [name, model, key, from, to] of rows) expect(moveFocus(from, key, model, NONE), name).toEqual(to);

    const from = at(1, 0);
    expect(moveFocus(from, 'a', grid('column'), NONE), 'any other key leaves the focus as it is').toBe(from);
    expect(moveFocus(from, 'Tab', grid('column'), NONE)).toBe(from);
    expect(moveFocus(from, 'ArrowDown', grid('column'), new Set([1])), 'a hidden series is not a place to go').toBe(from);
  });

  it('skips a missing mark and never wraps', () => {
    const model = modelOf([[1, null], [null, 2], [3, null], [4, 5]], { type: 'column' });
    const rows: [string, Focus, string, Focus][] = [
      ['over a bucket with nothing for the series', at(0, 0), 'ArrowRight', at(2, 0)],
      ['and back over it', at(2, 0), 'ArrowLeft', at(0, 0)],
      ['to the last mark', at(2, 0), 'ArrowRight', at(3, 0)],
      ['Home is the first bucket that has a mark for the series', at(3, 1), 'Home', at(1, 1)],
      ['End is the last', at(1, 1), 'End', at(3, 1)],
      ['into the one other series that has a mark', at(3, 0), 'ArrowDown', at(3, 1)],
    ];
    for (const [name, from, key, to] of rows) expect(moveFocus(from, key, model, NONE), name).toEqual(to);

    const stays: [string, Focus, string][] = [
      ['no bucket after the last', at(3, 0), 'ArrowRight'],
      ['none before the first', at(0, 0), 'ArrowLeft'],
      ['no series after the last', at(3, 1), 'ArrowDown'],
      ['none before the first', at(3, 0), 'ArrowUp'],
      ['a series with no mark beside it', at(2, 0), 'ArrowDown'],
      ['End on the last', at(3, 0), 'End'],
      ['Home on the first', at(0, 0), 'Home'],
    ];
    for (const [name, from, key] of stays) expect(moveFocus(from, key, model, NONE), name).toBe(from);

    const filled = modelOf([[1, 2], [null, null], [3, 4]], { type: 'bar' }, [{}, { filled: true }, {}]);
    expect(moveFocus(at(0, 0), 'ArrowDown', filled, NONE), 'a filled bucket is marked for the first series only').toEqual(at(1, 0));
    expect(moveFocus(at(0, 1), 'ArrowDown', filled, NONE), 'so the second series goes past it').toEqual(at(2, 1));
  });

  it('agrees with the marks the layouts draw', () => {
    const size = { width: 480, height: 240 };
    const shapes: [string, ChartModel][] = [
      ['column', modelOf([[1, null], [null, 2], [3, 4]], { type: 'column' }, [{}, {}, { filled: true }])],
      ['bar', modelOf([[1, null], [null, 2], [3, 4]], { type: 'bar' }, [{ filled: true }, {}, {}])],
      ['stacked', modelOf([[1, 2], [null, null], [3, null]], { type: 'column', stacked: true }, [{}, { filled: true }, {}])],
      ['compared', modelOf([[1, 2], [3, 4]], { type: 'column', compared: true }, [{ previous: 2, compared: true }, { previous: 1, compared: true }])],
      ['line', modelOf([[1, null], [null, 2], [3, 4]], { type: 'line' }, [{}, {}, { filled: true }])],
    ];
    for (const [name, model] of shapes) {
      for (const hidden of [NONE, new Set([0]), new Set([1])]) {
        const layout = model.type === 'line' ? layoutLines(model, size, hidden) : layoutBars(model, size, hidden);
        const drawn = (model.type === 'line' ? (layout as ReturnType<typeof layoutLines>).dots : (layout as ReturnType<typeof layoutBars>).marks.filter((m) => m.kind !== 'previous'))
          .map((m) => `${m.bucket}:${m.series}`)
          .sort();
        const named = model.buckets.flatMap((_, b) => model.series.flatMap((_s, s) => (hasMark(model, hidden, b, s) ? [`${b}:${s}`] : []))).sort();
        expect(named, `${name} without ${[...hidden].join('') || 'nothing'}`).toEqual(drawn);
      }
    }
  });
});

describe('isolation', () => {
  it('isolates a series and releases it', () => {
    const isolated = toggleIsolation(NONE, 1, 3);
    expect([...isolated].sort(), 'every other series is hidden').toEqual([0, 2]);
    expect(isIsolated(isolated, 1, 3)).toBe(true);
    expect([isIsolated(isolated, 0, 3), isIsolated(NONE, 0, 3)], 'a hidden series and a plain one are not isolated').toEqual([false, false]);
    expect([...toggleIsolation(isolated, 1, 3)], 'the same series again shows them all').toEqual([]);
    expect([...toggleIsolation(isolated, 2, 3)].sort(), 'another series takes over').toEqual([0, 1]);
    expect(isIsolated(toggleIsolation(NONE, 0, 1), 0, 1), 'one series has nothing to be isolated from').toBe(false);
    expect(toggleIsolation(NONE, 0, 1).size).toBe(0);
  });

  it('drops a series that is gone, and releases when none is left visible', () => {
    const named = (keys: [string, string | null][]) =>
      modelOf([[1, 2, 3]], { series: keys.map(([measure, segment], i) => ({ label: `S${i}`, color: { slot: i + 1 }, pattern: null, measure, segment })) });
    const before = named([['m', 'a'], ['m', 'b'], ['m', 'c']]);

    expect([...keepIsolation(new Set([0, 2]), before, before)], 'the same series, the same isolation').toEqual([0, 2]);
    expect([...keepIsolation(new Set([0, 2]), before, named([['m', 'c'], ['m', 'b'], ['m', 'a']]))].sort(), 'followed by name, not by place').toEqual([0, 2]);
    expect([...keepIsolation(new Set([0, 2]), before, named([['m', 'b'], ['m', 'c'], ['m', 'x']]))].sort(), 'the isolated series is kept alone: the rest, a new one included, are hidden').toEqual([1, 2]);
    expect([...keepIsolation(new Set([1, 2]), before, named([['m', 'b'], ['m', 'c']]))], 'with none left showing, they are all shown').toEqual([]);
    expect([...keepIsolation(new Set([1, 2]), before, named([['m', 'b'], ['m', 'c'], ['m', 'x']]))], 'the series that was alone is gone: a new one is not isolated in its place').toEqual([]);
    expect([...keepIsolation(new Set([0, 1]), before, named([['m', 'a'], ['m', 'b']]))], 'every series hidden is released').toEqual([]);
    expect([...keepIsolation(NONE, before, named([['n', null]]))]).toEqual([]);
    expect([...keepIsolation(new Set([0]), named([['m', null], ['n', null]]), named([['n', null], ['m', null]]))], 'a measure is a series as a segment is').toEqual([1]);
    expect([...keepIsolation(new Set([0]), named([['m', null], ['m', 'x']]), named([['m', 'x'], ['m', null]]))], 'no segment is not a segment').toEqual([1]);
    expect([...keepIsolation(new Set([0, 2]), before, named([['m', 'b']]))], 'a series with nothing to be isolated from').toEqual([]);
  });

  it('only ever holds nothing hidden or all but one hidden, over successive results', () => {
    const named = (...segments: string[]) => modelOf([segments.map(() => 1)], { series: segments.map((segment, i) => ({ label: segment, color: { slot: i + 1 }, pattern: null, measure: 'm', segment })) });
    const run = (steps: ReturnType<typeof named>[]) => {
      let hidden: ReadonlySet<number> = toggleIsolation(NONE, 1, steps[0]!.series.length);
      for (let i = 1; i < steps.length; i++) hidden = keepIsolation(hidden, steps[i - 1]!, steps[i]!);
      return [...hidden].sort();
    };
    const rows: [string, ReturnType<typeof named>[], number[]][] = [
      ['b leaves with the third result: nothing is isolated, and x is not drawn alone', [named('a', 'b', 'c'), named('b', 'c', 'x'), named('c', 'x')], []],
      ['b survives: it stays alone', [named('a', 'b', 'c'), named('b', 'c', 'x'), named('x', 'b')], [0]],
      ['b survives to the end among new series', [named('a', 'b', 'c'), named('b', 'c', 'x'), named('c', 'x', 'b', 'y')], [0, 1, 3]],
    ];
    for (const [name, steps, expected] of rows) expect(run(steps), name).toEqual(expected);
  });
});

describe('clampFocus', () => {
  it('moves to a mark that exists', () => {
    const model = modelOf([[1, 2], [3, null], [4, 5]]);
    const held = at(1, 0);
    expect(clampFocus(held, model, NONE), 'a mark that is there stays').toBe(held);
    expect(clampFocus(at(7, 1), model, NONE), 'past the last bucket, the last one').toEqual(at(2, 1));
    expect(clampFocus(at(1, 1), model, NONE), 'a bucket with no mark for the series, the nearest series in it').toEqual(at(1, 0));
    expect(clampFocus(at(0, 4), model, NONE), 'a series that is gone, the nearest').toEqual(at(0, 1));
    expect(clampFocus(at(2, 1), model, new Set([1])), 'a series that is hidden').toEqual(at(2, 0));
    expect(clampFocus(null, model, NONE), 'no focus yet, the first mark').toEqual(at(0, 0));
    expect(clampFocus(null, modelOf([[null, 1], [2, 3]]), NONE)).toEqual(at(0, 1));
    expect(clampFocus(at(0, 0), modelOf([[null]]), NONE), 'nothing to focus').toBeNull();
    expect(clampFocus(null, modelOf([]), NONE)).toBeNull();
    expect(clampFocus(at(1, 0), modelOf([[1], [2]]), new Set([0])), 'every series hidden').toBeNull();
  });
});

describe('tooltipOf', () => {
  const rowsOf = (m: ReturnType<typeof tooltipOf>) => m.rows.map((r) => [r.label, r.value]);

  it('for grouped, stacked, compared and null buckets', () => {
    const grouped = modelOf([[5, 7], [null, 3]], {}, [{ label: 'Mon', target: 6 }, { label: 'Tue' }]);
    expect(tooltipOf(grouped, 0, NONE, EN, OFF)).toEqual({
      title: 'Mon',
      rows: [
        { label: 'S0', value: '5', color: { slot: 1 }, pattern: null },
        { label: 'S1', value: '7', color: { slot: 2 }, pattern: null },
      ],
      target: '6', earlier: null, change: null, total: null, share: null, derived: null, hint: null,
    });
    const tue = tooltipOf(grouped, 1, NONE, EN, OFF);
    expect(rowsOf(tue), 'a series with no figure says so').toEqual([['S0', 'No data'], ['S1', '3']]);
    expect(tue.target).toBeNull();
    expect(rowsOf(tooltipOf(grouped, 0, new Set([0]), EN, OFF)), 'a hidden series has no row').toEqual([['S1', '7']]);

    const hatched = modelOf([[5], [6]], {}, [{ other: true }, { restricted: true }]);
    expect([tooltipOf(hatched, 0, NONE, EN, OFF).rows[0]!.pattern, tooltipOf(hatched, 1, NONE, EN, OFF).rows[0]!.pattern], 'a bar the chart hatches is hatched here').toEqual(['other', 'restricted']);

    const stacked = modelOf([[3, 2, null], [null, null, null]], { stacked: true }, [{ counts: [3, 2, 0] }, {}]);
    const stack = tooltipOf(stacked, 0, NONE, EN, OFF);
    expect(rowsOf(stack), 'a segment is its value and its records').toEqual([['S0', '3 · 3'], ['S1', '2 · 2'], ['S2', 'No data']]);
    expect(stack.total, 'the bar total is the sum of the segments').toBe('5');
    expect(tooltipOf(stacked, 0, new Set([0]), EN, OFF).total, 'of those showing').toBe('2');
    expect(tooltipOf(stacked, 1, NONE, EN, OFF).total, 'no segment, no total').toBeNull();
    expect(tooltipOf(grouped, 0, NONE, EN, OFF).total, 'an unstacked chart has none').toBeNull();

    const compared = modelOf([[10], [null], [4], [7], [8]], { compared: true }, [
      { previous: 8, percentChange: 0.25, compared: true },
      { previous: 6, compared: true },
      { previous: null, compared: true },
      { previous: 3, unmatched: true, compared: true },
      { previous: 0, compared: true },
    ]);
    const earlier = (b: number) => {
      const m = tooltipOf(compared, b, NONE, EN, OFF, 'en');
      return [m.earlier, m.change];
    };
    expect(earlier(0), 'the earlier figure and the change').toEqual(['8', '+25%']);
    expect(earlier(1), 'an earlier figure and none now').toEqual(['6', 'gone']);
    expect(earlier(2), 'none then, and so nothing to compare with').toEqual(['new', 'no earlier figure']);
    expect(earlier(3), 'a day with no match, whatever else is said').toEqual(['3', 'no matching day']);
    expect(earlier(4), 'an earlier figure of zero has no change').toEqual(['0', 'no earlier figure']);
    const plain = tooltipOf(grouped, 0, NONE, EN, OFF);
    expect([plain.earlier, plain.change], 'not compared, not said').toEqual([null, null]);
  });

  it('says what a click opens by the drill state', () => {
    const drilled = (count: number) => modelOf([[5, 7]], {}, [{ drills: [drillOf(count), drillOf(99)] }]);
    const hint = (model: ChartModel, state: { enabled: boolean; disabled: boolean }) => tooltipOf(model, 0, NONE, EN, state, 'en').hint;
    expect(hint(drilled(12), ON), 'the count of the primary series').toBe('Click to open 12 records');
    expect(hint(drilled(1), ON), 'one record').toBe('Click to open 1 record');
    expect(hint(drilled(12000), ON), 'a count in the locale').toBe('Click to open 12,000 records');
    expect(tooltipOf(drilled(12), 0, new Set([0]), EN, ON).hint, 'with the primary hidden, the next series').toBe('Click to open 99 records');
    expect(hint(drilled(12), { enabled: false, disabled: true }), 'the tile switched its link off').toBe('Records link is off for this tile');
    expect(hint(drilled(12), OFF), 'no drill on the element, nothing to say').toBeNull();

    const none = modelOf([[5]], {}, [{ drills: [null] }]);
    expect(hint(none, ON), 'nothing to open').toBeNull();
    const stacked = modelOf([[3, 2, 1]], { stacked: true }, [{ drills: [drillOf(3), drillOf(2), null] }]);
    expect(hint(stacked, ON), 'a stack adds up the segments that open').toBe('Click to open 5 records');
    const spoken = { ...EN, tileOpenRecords: 'Mở {count} bản ghi', tileDrillOff: 'tắt' };
    expect(tooltipOf(drilled(12), 0, NONE, spoken, ON, 'en').hint, 'in the strings it is given').toBe('Mở 12 bản ghi');
  });
});

describe('stripDrill', () => {
  it("opens the mark the tooltip's hint counts: the first visible series with an address, never a stack's", () => {
    const seven = drillOf(7);
    const unstacked = modelOf([[5, 7], [5, 7], [0, 0]], {}, [{ drills: [null, seven] }, { drills: [drillOf(3), seven] }, { filled: true, drills: [drillOf(0), drillOf(0)] }]);
    const stacked = modelOf([[3, 2]], { stacked: true }, [{ drills: [drillOf(3), drillOf(2)] }]);
    const rows: [string, ChartModel, number, ReadonlySet<number>, AfDrillTarget | null][] = [
      ['series 0 has no address, series 1 has one', unstacked, 0, NONE, seven],
      ['series 0 is hidden, and series 1 has one', unstacked, 1, new Set([0]), seven],
      ['both have one, and the first is the one', unstacked, 1, NONE, unstacked.buckets[1]!.drills[0]!],
      ['a period with no records opens nothing, though the server addresses it: its mark is disabled', unstacked, 2, NONE, null],
      ['a stack is not one thing to open', stacked, 0, NONE, null],
      ['no bucket there', unstacked, 5, NONE, null],
    ];
    for (const [name, model, bucket, hidden, expected] of rows) {
      const opened = stripDrill(model, bucket, hidden);
      expect(opened, name).toBe(expected);
      if (!model.stacked) expect(tooltipOf(model, bucket, hidden, EN, ON, 'en').hint, `${name}: the hint says what the click opens`).toBe(opened ? `Click to open ${opened.count} records` : null);
    }
  });
});

describe('placeTooltip', () => {
  const view = { width: 1000, height: 800 };
  const tip = { width: 80, height: 40 };
  const box = (left: number, top: number, width = 20, height = 50) => ({ left, top, width, height });

  it('goes above a mark, or beside it, and stays inside the viewport', () => {
    const rows: [string, ReturnType<typeof placeTooltip>, { left: number; top: number }][] = [
      ['above, centred', placeTooltip(box(100, 200), tip, view, 'above'), { left: 70, top: 152 }],
      ['above, flipped below when there is no room', placeTooltip(box(100, 10), tip, view, 'above'), { left: 70, top: 68 }],
      ['above, held off the left edge', placeTooltip(box(0, 200, 10), tip, view, 'above'), { left: 4, top: 152 }],
      ['above, held off the right edge', placeTooltip(box(990, 200, 10), tip, view, 'above'), { left: 916, top: 152 }],
      ['beside, to the right', placeTooltip(box(100, 200), tip, view, 'beside'), { left: 128, top: 205 }],
      ['beside, flipped to the left at the edge', placeTooltip(box(150, 200), tip, { width: 240, height: 800 }, 'beside'), { left: 62, top: 205 }],
      ['beside, held inside the top', placeTooltip(box(100, 0, 20, 10), tip, view, 'beside'), { left: 128, top: 4 }],
      ['below the viewport, held inside the bottom', placeTooltip(box(100, 790, 20, 10), { width: 80, height: 100 }, view, 'beside'), { left: 128, top: 696 }],
    ];
    for (const [name, got, want] of rows) expect(got, name).toEqual(want);
  });
});

describe("<af-tile>'s marks", () => {
  interface TileElement extends HTMLElement {
    spec: AfTileSpec | null;
    result: AfTileResult | null;
    fields: FigureField[] | null;
    drill: boolean;
  }

  const MARK = '[part~="plot"] [data-bucket][tabindex]';
  const marksOf = (el: Element) => [...el.shadowRoot!.querySelectorAll<SVGElement>(MARK)];
  const stopsOf = (el: Element) => marksOf(el).map((m) => m.getAttribute('tabindex'));
  const heldBy = (el: Element) => el.shadowRoot!.activeElement;
  const press = (target: Element, key: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  const drawn = async (el: Element) => expect.poll(() => el.shadowRoot!.querySelector('[part~="plot"]') !== null, { timeout: 5000 }).toBe(true);
  const words = (node: Element) => (node.textContent ?? '').replace(/\s+/g, ' ').trim();

  function mount(props: Partial<TileElement>) {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const el = document.createElement('af-tile') as TileElement;
    Object.assign(el, props);
    root.append(el);
    document.body.append(host);
    return el;
  }

  // The first bucket is addressed and the others are not, so a tile that opens records still has marks with nothing to open.
  const result = () => chartResult({ [uuid(1)]: [bucketOf('new', 5, { drill: DRILL }), bucketOf('stalled', 8), bucketOf('lost', 3)] });
  const CHARTS = ['column', 'bar', 'line', 'pie'] as const;
  const tile = (chart: (typeof CHARTS)[number], over: Partial<TileElement> = {}) =>
    mount({ spec: chartTile(chart, [measure(1, { primary: true })], { label: 'Deals by stage' }), result: result(), fields: TILE_FIELDS, ...over });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each(CHARTS)('leaves the live region empty when focus moves to a %s mark, which already says its own label', async (chart) => {
    const el = tile(chart, { drill: true });
    await drawn(el);
    marksOf(el)[0]!.focus();
    await expect.poll(() => el.dataset.raised, { message: 'focus shows the tooltip, which is what the focus announced besides' }).toBe('true');

    const held = heldBy(el)!;
    expect(held.getAttribute('aria-label'), 'the mark says what it is').toMatch(/^new\b.*5/);
    expect([...el.shadowRoot!.querySelectorAll('[role="status"], [aria-live]')].map(words), 'and nothing says it a second time').toEqual([]);
  });

  it.each(CHARTS)('draws a %s mark as an image that reads its summary, not an unavailable button, when the tile opens no records', async (chart) => {
    const el = tile(chart);
    await drawn(el);
    const marks = () => marksOf(el);
    expect(marks().map((m) => m.getAttribute('role')), 'drill off').toEqual(['img', 'img', 'img']);
    const labels = marks().map((m) => m.getAttribute('aria-label'));
    expect(labels.map((l) => l?.split(/\W/)[0]), 'each says what it is').toEqual(['new', 'stalled', 'lost']);
    expect(marks().map((m) => m.hasAttribute('aria-disabled')), 'and nothing disabled to announce').toEqual([false, false, false]);
    expect(stopsOf(el)).toEqual(['0', '-1', '-1']);

    marks()[0]!.focus();
    press(heldBy(el)!, chart === 'bar' ? 'ArrowDown' : 'ArrowRight');
    expect(heldBy(el), 'the arrows still move focus').toBe(marks()[1]);
    await expect.poll(() => stopsOf(el), { message: 'and the one tab stop with it' }).toEqual(['-1', '0', '-1']);

    el.drill = true;
    await expect.poll(() => marks().map((m) => m.getAttribute('role'))).toEqual(['button', 'button', 'button']);
    expect(marks().map((m) => m.getAttribute('aria-disabled')), 'a mark with nothing to open is still disabled').toEqual([null, 'true', 'true']);
    expect(marks().map((m) => m.getAttribute('aria-label')), 'and every mark keeps its label').toEqual(labels);
    expect(stopsOf(el), 'the tab stop stays where it was').toEqual(['-1', '0', '-1']);

    el.spec = chartTile(chart, [measure(1, { primary: true })], { drill_disabled: true });
    await expect.poll(() => marks().map((m) => m.getAttribute('role')), { message: 'a tile that switches records off opens none either' }).toEqual(['img', 'img', 'img']);
    expect(marks().some((m) => m.hasAttribute('aria-disabled'))).toBe(false);
  });
});
