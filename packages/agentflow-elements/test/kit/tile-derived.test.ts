import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { chartPanels, tableOf } from '../../src/kit/tile/chart-model.js';
import type { ChartModel } from '../../src/kit/tile/chart-model.js';
import { frameModel } from '../../src/kit/tile/frame.js';
import { layoutBars, layoutLines, panelGutter, valueDomain } from '../../src/kit/tile/layout.js';
import { kitText } from '../../src/kit/text.js';
import { DRILL, TILE_FIELDS, amount, bucketOf, chartResult, chartTile, measure, uuid } from './fixtures/tile.js';
import { TILE_CASES } from './fixtures/tiles.js';
import type { TileCaseName } from './fixtures/tiles.js';

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
  locale: string | null;
}

const EN = kitText('en');
const VI = kitText('vi');
const NONE: ReadonlySet<number> = new Set();
const SIZE = { width: 480, height: 240 };
const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const plotsOf = (el: Element) => parts(el, 'plot');

function mount(props: Partial<TileElement>) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  return el;
}

const drawn = async (el: Element, name = 'plot') => expect.poll(() => part(el, name) !== null, { timeout: 5000 }).toBe(true);
const over = (target: Element) => target.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
const build = (spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] = TILE_FIELDS, text = EN, locale = 'en') => chartPanels(spec, result, fields, text, locale, true);
const first = (spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] = TILE_FIELDS) => build(spec, result, fields)[0]!;

/** What a plot draws for a derived series, in the order the buckets come. */
const labelsOf = (plot: Element) => [...plot.querySelectorAll<SVGTextElement>('text[data-kind="label"]')].map((t) => words(t));
const pathOf = (plot: Element) => plot.querySelector<SVGPathElement>('path[data-kind="running"]');
const dotsOf = (plot: Element) => [...plot.querySelectorAll<SVGCircleElement>('circle[data-kind="running-dot"]')];
const ranksOf = (el: Element) => [...el.shadowRoot!.querySelectorAll('.axes text')].map((t) => words(t)).filter((t) => t.startsWith('#'));

async function tooltipRows(el: TileElement, bucket: number) {
  const mark = plotsOf(el)[0]!.querySelector<SVGElement>(`[data-bucket="${bucket}"][tabindex]`)!;
  over(mark);
  await expect.poll(() => el.dataset.raised).toBe('true');
  return [...part(el, 'tooltip')!.querySelectorAll('.row')].map((r) => [words(r.querySelector('.name')), words(r.querySelector('.value'))]);
}

async function tableOfElement(el: TileElement) {
  (part(el, 'table-toggle') as HTMLButtonElement).click();
  await drawn(el, 'table');
  const table = part(el, 'table')!;
  return {
    head: [...table.querySelectorAll('thead th')].map((h) => words(h)),
    rows: [...table.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => words(c))),
  };
}

const notesOf = (el: Element) => [...(part(el, 'notes')?.querySelectorAll('li') ?? [])].map((li) => words(li));

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe("<af-tile>'s derived series", () => {
  it('each derive kind is drawn as the platform draws it', async () => {
    interface Expected {
      /** The text written past each bar or above each column. */
      labels: string[];
      /** The running total's dots, by bucket, and whether each is hollow; null for a chart with no running total. */
      running: { dots: number[]; hollow: number[] } | null;
      ranks: string[];
      /** The tooltip's derived row for the first bucket. */
      row: string[];
      /** The table's columns from the derived one on. */
      column: string[];
      note: string;
      legend: string[];
    }
    const rows: [TileCaseName, Expected][] = [
      [
        'BAR_SHARE',
        {
          labels: ['$480,000 · 40%', '$300,000 · 25%', '$240,000 · 20%', '$180,000 · 15%'],
          running: null,
          ranks: [],
          row: ['share', '40%'],
          column: ['share', '40%', '25%', '20%', '15%'],
          note: 'Share of the buckets shown — shares of the buckets shown, remainder included',
          legend: [],
        },
      ],
      [
        'COLUMN_RUNNING',
        {
          labels: [],
          running: { dots: [0, 1, 2, 3, 4, 5, 6, 7], hollow: [5] },
          ranks: [],
          row: ['Running total', '$120,000'],
          column: ['Running total', '$120,000', '$270,000', '$405,000', '$545,000', '$725,000', '$725,000', '$935,000', '$1,110,000'],
          note: 'Running total',
          legend: ['no records (filled)', 'running total', 'sum · Amount'],
        },
      ],
      [
        'BAR_RANK',
        {
          labels: [],
          running: null,
          ranks: ['#1 North', '#2 Central', '#2 South', '#4 Online'],
          row: ['Rank', '#1'],
          column: ['Rank', '#1', '#2', '#2', '#4'],
          note: 'Rank, highest first, competition ties',
          legend: [],
        },
      ],
      [
        'COLUMN_FORMULA',
        {
          // The element is 480 px wide here, so each bucket is too narrow for its full text and the figure stands alone.
          labels: ['0.8', '0.92', '0.9', '0.8', '0.96', '1.05', '0.8'],
          running: null,
          ranks: [],
          row: ['Attainment', '0.8'],
          column: ['Attainment', '0.8', '0.92', '0.9', '0.8', '0.96', 'no value', '1.05', '0.8'],
          note: 'Attainment',
          legend: ['Attainment', 'Booked', 'Forecast'],
        },
      ],
    ];
    for (const [name, want] of rows) {
      const el = mount({ ...TILE_CASES[name], drill: true });
      await drawn(el);
      const plot = plotsOf(el)[0]!;
      expect(labelsOf(plot), `${name}: the figure written beside each bar`).toEqual(want.labels);
      expect(ranksOf(el), `${name}: the rank in front of each category`).toEqual(want.ranks);
      if (want.running) {
        expect(pathOf(plot)!.getAttribute('d'), `${name}: a line through the totals`).toMatch(/^M[\d.]+,[\d.]+(L[\d.]+,[\d.]+)+$/);
        expect(dotsOf(plot).map((d) => Number(d.dataset.bucket)), `${name}: a dot for each bucket that has a figure`).toEqual(want.running.dots);
        expect(dotsOf(plot).flatMap((d, i) => (d.style.fill === 'var(--k-surface)' ? [want.running!.dots[i]] : [])), `${name}: a period with no records is a hollow dot`).toEqual(want.running.hollow);
      } else {
        expect(pathOf(plot), `${name}: no running line`).toBeNull();
        expect(dotsOf(plot)).toEqual([]);
      }
      expect(legendNames(el), `${name}: the legend`).toEqual(want.legend);

      expect((await tooltipRows(el, 0)).find(([label]) => label === want.row[0]), `${name}: the tooltip's derived row`).toEqual(want.row);
      expect(notesOf(el)[0], `${name}: the first note`).toBe(want.note);

      const table = await tableOfElement(el);
      const at = table.head.indexOf(want.column[0]!);
      expect(at, `${name}: a column headed by the figure's name`).toBeGreaterThan(0);
      expect([table.head[at], ...table.rows.map((r) => r[at])], `${name}: the table's derived column`).toEqual(want.column);
      document.body.innerHTML = '';
    }
  });

  it("words the share of a bucket with 25% of 40 records without a decimal, and of 4,000 with one", () => {
    const spec = chartTile('bar', [amount(1, { primary: true })], { transform: { derive: { kind: 'share_of_total' } } });
    const small = first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 30, { count: 10, derived: 0.25 }), bucketOf('won', 90, { count: 30, derived: 0.75 })] }));
    expect([small.beside[0], small.formatDerived(0.256)]).toEqual(['$30.00 · 25%', '26%']);
    const large = first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 30, { count: 1000, derived: 0.255 }), bucketOf('won', 90, { count: 3000, derived: 0.745 })] }));
    expect(large.beside[0]).toBe('$30.00 · 25.5%');
    expect(first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 30, { count: 10, derived: 0.25 }), bucketOf('won', 90, { count: 9999 })] })).beside[0], 'a bucket without a figure is not in the population').toBe('$30.00 · 25%');
  });

  it('a running total widens the value axis to hold it', () => {
    const buckets = [bucketOf('new', 10, { derived: 10 }), bucketOf('won', 30, { derived: 40 }), bucketOf('lost', 25, { derived: 65 })];
    const plain = chartTile('column', [measure(1, { primary: true })]);
    const running = chartTile('column', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } });
    const result = chartResult({ [uuid(1)]: buckets });
    expect(valueDomain(first(plain, result), NONE)[1], 'without the total the axis stops at the tallest column').toBeLessThan(65);
    expect(valueDomain(first(running, result), NONE)[1]).toBeGreaterThanOrEqual(65);

    const line = chartTile('line', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } });
    expect(valueDomain(first(line, result), NONE)[1], 'and a line chart').toBeGreaterThanOrEqual(65);
  });

  it('draws the running total of a line chart as a solid ink line without dots, and leaves share and formula to the tooltip', async () => {
    const buckets = [bucketOf('new', 10, { derived: 10 }), bucketOf('won', 30, { derived: 40 }), bucketOf('lost', 25, { derived: 65 })];
    const result = chartResult({ [uuid(1)]: buckets });
    const running = mount({ spec: chartTile('line', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } }), result, fields: TILE_FIELDS });
    await drawn(running);
    const path = pathOf(plotsOf(running)[0]!)!;
    expect([path.style.stroke, path.style.opacity, path.getAttribute('stroke-width'), path.getAttribute('stroke-dasharray')], 'ink, 0.7, 1.5 wide, solid').toEqual(['var(--k-fg)', '0.7', '1.5', null]);
    expect(dotsOf(plotsOf(running)[0]!), 'a line has dots of its own and none for the total').toEqual([]);
    expect(legendNames(running)).toEqual(['count', 'running total']);

    for (const derive of [{ kind: 'share_of_total' }, { kind: 'expression', expression: 'a / b', label: 'Ratio' }] as const) {
      const shared = chartResult({ [uuid(1)]: buckets.map((b) => ({ ...b, derived: 0.5 })) });
      const el = mount({ spec: chartTile('line', [measure(1, { primary: true })], { transform: { derive } }), result: shared, fields: TILE_FIELDS });
      await drawn(el);
      expect(labelsOf(plotsOf(el)[0]!), `${derive.kind} on a line writes nothing beside the points`).toEqual([]);
      expect(legendNames(el), 'and names nothing in the legend').toEqual([]);
      expect((await tooltipRows(el, 1)).map((r) => r[0]), `${derive.kind}: the tooltip says it`).toContain(derive.kind === 'expression' ? 'Ratio' : 'share');
    }
  });

  it('a bucket with no derived figure draws no label and no dot, and its tooltip and table say so', async () => {
    const buckets = (kind: string) => [bucketOf('new', 10, { derived: kind === 'rank' ? 2 : 0.25 }), bucketOf('won', 30)];
    const rows: [string, 'bar' | 'column', Record<string, unknown>, { label: string; labels: number; dots: number; figure: string }][] = [
      ['a share', 'bar', { kind: 'share_of_total' }, { label: 'share', labels: 1, dots: 0, figure: '—' }],
      ['a running total', 'column', { kind: 'running_total' }, { label: 'Running total', labels: 0, dots: 1, figure: '—' }],
      ['a rank', 'bar', { kind: 'rank', direction: 'desc', ties: 'dense' }, { label: 'Rank', labels: 0, dots: 0, figure: '—' }],
      ['a formula', 'column', { kind: 'expression', expression: 'a / b', label: 'Ratio' }, { label: 'Ratio', labels: 1, dots: 0, figure: 'no value' }],
    ];
    for (const [name, chart, derive, want] of rows) {
      const kind = derive.kind as string;
      const el = mount({ spec: chartTile(chart, [measure(1, { primary: true })], { transform: { derive } }), result: chartResult({ [uuid(1)]: buckets(kind) }), fields: TILE_FIELDS });
      await drawn(el);
      const plot = plotsOf(el)[0]!;
      expect(labelsOf(plot), `${name}: only the first bucket has a label, if any is drawn`).toHaveLength(want.labels);
      expect(dotsOf(plot).map((d) => d.dataset.bucket), `${name}: and a dot`).toHaveLength(want.dots);
      expect(ranksOf(el), `${name}: and a rank before its category`).toHaveLength(kind === 'rank' ? 1 : 0);
      expect((await tooltipRows(el, 1)).find((r) => r[0] === want.label), `${name}: the tooltip`).toEqual([want.label, want.figure]);
      const table = await tableOfElement(el);
      expect(table.rows[1]!.at(-1), `${name}: the table`).toBe(want.figure);
      document.body.innerHTML = '';
    }
  });

  it('puts the derived column after the difference and before the target, on every chart', () => {
    const buckets = (n: number) => [bucketOf('new', 8, { derived: n, target: 9, comparison: { previous: 4, difference: 4, percent_change: 1 } }), bucketOf('won', 2, { derived: n, target: 3, comparison: { previous: 4, difference: -2, percent_change: -0.5 } })];
    const rows: [string, 'bar' | 'pie', string[]][] = [
      ['a bar chart', 'bar', ['Stage', 'count', 'earlier period', 'difference', 'Rank', 'target']],
      ['a pie', 'pie', ['Stage', 'count', 'share', 'earlier period', 'difference', 'Rank', 'target']],
    ];
    for (const [name, chart, head] of rows) {
      const spec = chartTile(chart, [measure(1, { primary: true })], { transform: { target: { kind: 'constant', value: 9 }, derive: { kind: 'rank', direction: 'desc', ties: 'dense' } } });
      const table = tableOf(build(spec, chartResult({ [uuid(1)]: buckets(1) })), NONE, EN, 'en');
      expect(table.head, name).toEqual(head);
      expect(table.rows[0]!.slice(-2), `${name}: the derived cell, then the target`).toEqual(['#1', '9']);
    }
  });

  it('a formula draws no label in small multiples, and a share keeps its label in the primary panel', async () => {
    const counts = [bucketOf('new', 8, { derived: 0.8 }), bucketOf('won', 2, { derived: 0.2 })];
    const sums = [bucketOf('new', 800), bucketOf('won', 200)];
    const result = chartResult({ [uuid(1)]: counts, [uuid(2)]: sums });
    const rows: [string, Record<string, unknown>, { labels: number; running: number; legend: string[] }][] = [
      ['a formula', { kind: 'expression', expression: 'a / b', label: 'Ratio' }, { labels: 0, running: 0, legend: ['count', 'sum · Amount'] }],
      ['a share', { kind: 'share_of_total' }, { labels: 2, running: 0, legend: ['count', 'sum · Amount'] }],
      ['a running total', { kind: 'running_total' }, { labels: 0, running: 1, legend: ['count', 'sum · Amount', 'running total'] }],
    ];
    for (const [name, derive, want] of rows) {
      const spec = chartTile('column', [measure(1, { primary: true }), amount(2)], { transform: { derive } });
      const panels = build(spec, result);
      expect(panels, name).toHaveLength(2);
      expect(panels.map((p) => p.derive?.kind ?? null), `${name}: only the primary's panel has it`).toEqual([derive.kind, null]);
      expect(panels[1]!.buckets.map((b) => b.derived), `${name}: the other panel's buckets carry none`).toEqual([null, null]);

      const el = mount({ spec, result, fields: TILE_FIELDS });
      await drawn(el);
      const [one, two] = plotsOf(el);
      expect([labelsOf(one!).length, labelsOf(two!).length], `${name}: labels`).toEqual([want.labels, 0]);
      expect([pathOf(one!) ? 1 : 0, pathOf(two!) ? 1 : 0], `${name}: the running line`).toEqual([want.running, 0]);
      expect(legendNames(el), `${name}: the legend`).toEqual(want.legend.slice().sort());
      expect((await tooltipRows(el, 0)).length, `${name}: the primary panel's tooltip still carries it`).toBeGreaterThan(1);
      document.body.innerHTML = '';
    }
  });

  it('a derived pie keeps its figure in the tooltip and the table only', async () => {
    const buckets = [bucketOf('won', 6, { derived: 0.6 }), bucketOf('new', 0, { derived: 0 }), bucketOf('lost', 2, { derived: 0.2 })];
    const rows: [string, Record<string, unknown>, string[], string[]][] = [
      ['a share', { kind: 'share_of_total' }, ['Share of the buckets shown', '60%'], ['60%', '0%', '20%']],
      ['a running total', { kind: 'running_total' }, ['Running total', '6'], ['6', '6', '8']],
      ['a formula', { kind: 'expression', expression: 'a / b' }, ['Formula', '0.6'], ['0.6', '0', '0.2']],
    ];
    for (const [name, derive, row, column] of rows) {
      const spec = chartTile('pie', [measure(1, { primary: true })], { transform: { derive } });
      const withFigure = chartResult({ [uuid(1)]: derive.kind === 'running_total' ? [bucketOf('won', 6, { derived: 6 }), bucketOf('new', 0, { derived: 6 }), bucketOf('lost', 2, { derived: 8 })] : buckets });
      const model = first(spec, withFigure);
      expect(model.beside, `${name}: nothing is written on a pie`).toEqual([]);
      expect(model.legend.map((i) => i.kind), `${name}: the legend names slices alone`).toEqual(['slice', 'slice']);

      const el = mount({ spec, result: withFigure, fields: TILE_FIELDS });
      await drawn(el);
      const plot = plotsOf(el)[0]!;
      expect([labelsOf(plot).length, pathOf(plot) ? 1 : 0, dotsOf(plot).length, ranksOf(el).length], `${name}: nothing derived on the pie`).toEqual([0, 0, 0, 0]);
      expect((await tooltipRows(el, 0)).slice(-1)[0], `${name}: the tooltip`).toEqual(row);
      const table = await tableOfElement(el);
      expect(table.head.slice(-2), `${name}: the table's last columns`).toEqual(['share', row[0]]);
      expect(table.rows.map((r) => r.at(-1)), `${name}: the table's derived column`).toEqual(column);
      document.body.innerHTML = '';
    }
  });

  it('names a pie share of the buckets shown apart from the slice share, in the tooltip and the table', async () => {
    const buckets = [bucketOf('won', 6, { derived: 0.5, count: 6 }), bucketOf('new', -2, { derived: 0.25, count: 2 }), bucketOf('lost', 2, { derived: 0.25, count: 2 })];
    const spec = chartTile('pie', [measure(1, { primary: true })], { transform: { derive: { kind: 'share_of_total' } } });
    const el = mount({ spec, result: chartResult({ [uuid(1)]: buckets }), fields: TILE_FIELDS });
    await drawn(el);
    expect(await tooltipRows(el, 0), "the slice's own share and the server's differ, and say which is which").toEqual([['count', '6'], ['share', '75%'], ['Share of the buckets shown', '50%']]);
    const table = await tableOfElement(el);
    expect(table.head).toEqual(['Stage', 'count', 'share', 'Share of the buckets shown']);
    expect(table.rows.map((r) => r.slice(-2))).toEqual([['75%', '50%'], ['—', '25%'], ['25%', '25%']]);
  });

  it('shows the derived note first, in the language, and for a rank the direction and the ties', () => {
    const note = (derive: Record<string, unknown>, buckets = [bucketOf('new', 1)], text = EN, locale = 'en') => {
      const spec = chartTile('bar', [measure(1, { primary: true })], { transform: { derive } });
      return frameModel(spec, chartResult({ [uuid(1)]: buckets }, { coverage: { partial: true } }), TILE_FIELDS, text, locale).notes;
    };
    expect(note({ kind: 'share_of_total' })).toEqual(['Share of the buckets shown', 'Some records are withheld from you and not shown']);
    expect(note({ kind: 'share_of_total' }, [bucketOf('new', 1), bucketOf('$other', 1, { other: true })])[0]).toBe('Share of the buckets shown — shares of the buckets shown, remainder included');
    expect(note({ kind: 'running_total' })[0]).toBe('Running total');
    expect(note({ kind: 'expression', expression: 'a', label: '  Margin  ' })[0], 'a formula by its trimmed label').toBe('Margin');
    expect(note({ kind: 'expression', expression: 'a', label: ' ' })[0], 'else by the word for it').toBe('Formula');
    expect(note({ kind: 'expression', expression: 'a' })[0]).toBe('Formula');
    const ranks: [string, string][] = [
      ['asc', 'dense'], ['desc', 'competition'],
    ];
    expect(ranks.map(([direction, ties]) => note({ kind: 'rank', direction, ties })[0])).toEqual(['Rank, lowest first, dense ties', 'Rank, highest first, competition ties']);
    expect(note({ kind: 'rank', direction: 'desc', ties: 'dense' }, [bucketOf('new', 1)], VI, 'vi')[0]).toBe('Xếp hạng, cao nhất trước, đồng hạng liền');
    expect(note({ kind: 'share_of_total' }, [bucketOf('new', 1), bucketOf('$other', 1, { other: true })], VI, 'vi')[0]).toBe('Tỷ trọng trên các nhóm hiển thị — tỷ trọng trên các nhóm hiển thị, gồm cả phần còn lại');

    const plain = chartTile('bar', [measure(1, { primary: true })]);
    expect(frameModel(plain, chartResult({ [uuid(1)]: [bucketOf('new', 1)] }), TILE_FIELDS, EN, 'en').notes, 'a chart with no derived figure has no such note').toEqual([]);
  });

  it('writes a rank before each category, and keeps the whole of a cut one in its title', () => {
    const spec = chartTile('bar', [measure(1, { primary: true })], { transform: { derive: { kind: 'rank', direction: 'desc', ties: 'dense' } } });
    const long = 'A very long category name that cannot fit';
    const model = first(spec, chartResult({ [uuid(1)]: [bucketOf(long, 9, { derived: 1 }), bucketOf('short', 4, { derived: 2 }), bucketOf('none', 1)] }));
    const ticks = layoutBars(model, SIZE, NONE).categoryTicks;
    expect(ticks.map((t) => t.full), 'the full text is the rank and the label').toEqual([`#1 ${long}`, '#2 short', 'none']);
    expect(ticks[0]!.label.endsWith('…'), 'a long one is cut as ever').toBe(true);
    expect(ticks[1]!.label).toBe('#2 short');

    const column = first({ ...spec, chart: 'column' } as AfTileSpec, chartResult({ [uuid(1)]: [bucketOf('a', 9, { derived: 1 }), bucketOf('b', 4, { derived: 2 })] }));
    expect(layoutBars(column, SIZE, NONE).categoryTicks.map((t) => t.full), 'on columns too').toEqual(['#1 a', '#2 b']);
  });

  it('places a bar chart label 4 px past the bar, and widens the margin for the longest, to at most 120 px', () => {
    const spec = chartTile('bar', [amount(1, { primary: true })], { transform: { derive: { kind: 'share_of_total' } } });
    const model = first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 30, { count: 10, derived: 0.25 }), bucketOf('won', 90, { count: 30, derived: 0.75 })] }));
    const shown = layoutBars(model, SIZE, NONE);
    const bar = shown.marks.find((m) => m.bucket === 1)!;
    const label = shown.labels.find((l) => l.bucket === 1)!;
    expect(label).toEqual({ bucket: 1, x: bar.x + bar.width + 4, y: bar.y + bar.height / 2, text: '$90.00 · 75%', anchor: 'start' });
    expect(shown.labels.map((l) => l.text)).toEqual(['$30.00 · 25%', '$90.00 · 75%']);

    const plain = layoutBars(first(chartTile('bar', [amount(1, { primary: true })]), chartResult({ [uuid(1)]: [bucketOf('new', 30), bucketOf('won', 90)] })), SIZE, NONE);
    const room = (l: typeof shown) => SIZE.width - (l.plot.x + l.plot.width);
    expect(room(shown), 'the margin holds the longest label and its gap').toBeGreaterThanOrEqual(4 + 6.2 * 12);
    expect(room(shown)).toBeGreaterThan(room(plain));
    expect(plain.labels).toEqual([]);

    const huge = first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 123_456_789_012, { count: 10, derived: 0.25 }), bucketOf('won', 5, { count: 30, derived: 0.75 })] }));
    const capped = layoutBars(huge, SIZE, NONE);
    expect(room(capped), 'at most the gutter limit').toBe(120);
    const end = capped.labels.find((l) => l.bucket === 0)!;
    expect(end.text.endsWith('…'), 'a label the margin cannot hold is cut, not clipped').toBe(true);
    expect(end.x + 6.2 * [...end.text].length, 'and ends inside the drawing').toBeLessThanOrEqual(SIZE.width);
  });

  it('places a column label 4 px above the column, centred, and makes room for it above the plot', () => {
    const spec = chartTile('column', [amount(1, { primary: true })], { transform: { derive: { kind: 'share_of_total' } } });
    const model = first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 30, { count: 10, derived: 0.25 }), bucketOf('won', 90, { count: 30, derived: 0.75 })] }));
    const shown = layoutBars(model, SIZE, NONE);
    const plain = layoutBars(first(chartTile('column', [amount(1, { primary: true })]), chartResult({ [uuid(1)]: [bucketOf('new', 30), bucketOf('won', 90)] })), SIZE, NONE);
    expect([shown.plot.y - plain.plot.y, plain.plot.height - shown.plot.height], 'the top margin grows by 14').toEqual([14, 14]);
    const bar = shown.marks.find((m) => m.bucket === 0)!;
    expect(shown.labels[0]).toEqual({ bucket: 0, x: bar.x + bar.width / 2, y: bar.y - 4, text: '$30.00 · 25%', anchor: 'middle' });
    expect(shown.labels.every((l) => l.y >= 0), 'inside the drawing').toBe(true);
  });

  it('keeps a bucket at the same x in every panel when a share is written above the columns or a rank before the categories, and a figure at the edge inside the drawing', () => {
    const keys = ['2025-01-01', '2025-01-02', '2025-01-03'];
    const rows: [string, Record<string, unknown>, number[]][] = [
      ['a share', { kind: 'share_of_total' }, [0.2, 0.5, 0.3]],
      ['a rank', { kind: 'rank', direction: 'desc', ties: 'dense' }, [2, 3, 1]],
    ];
    for (const [name, derive, figures] of rows) {
      const result = chartResult({
        [uuid(1)]: keys.map((k, i) => bucketOf(k, 100_000 + i, { count: 100, derived: figures[i] })),
        [uuid(2)]: keys.map((k, i) => bucketOf(k, 90_000 + i)),
      });
      const spec = chartTile('column', [measure(1, { primary: true }), amount(2)], { transform: { derive } });
      const panels = build(spec, result);
      const gutter = panelGutter(panels, NONE);
      for (const width of [480, 160]) {
        const size = { width, height: 240 };
        const laid = panels.map((p, i) => layoutBars(p, size, NONE, EN, { valueGutter: gutter, categoryLabels: i === panels.length - 1, unitLabel: p.unitLabel }));
        expect([laid[0]!.plot.x, laid[0]!.plot.width], `${name}, ${width}: the plot of the primary is where the other's is`).toEqual([laid[1]!.plot.x, laid[1]!.plot.width]);
        expect(laid[1]!.labels, `${name}: the other panel writes no figure`).toEqual([]);
        for (const l of laid[0]!.labels) {
          const half = (6.2 * [...l.text].length) / 2;
          expect([l.x - half >= 0, l.x + half <= width], `${name}, ${width}: ${l.text} stays inside the drawing`).toEqual([true, true]);
        }
        if (derive.kind === 'rank') {
          // A narrow drawing shows some of the labels, and each of those is ranked.
          const ticks = laid[1]!.categoryTicks.map((t) => t.full);
          expect(ticks.length, `${name}, ${width}: the panel that labels the categories`).toBeGreaterThan(0);
          expect(ticks, `${name}, ${width}: writes the ranks`).toEqual(['#2 2025-01-01', '#3 2025-01-02', '#1 2025-01-03'].slice(0, 3).filter((t) => ticks.includes(t)));
          if (width === 480) expect(ticks).toHaveLength(3);
        }
      }
    }
  });

  it("writes a rank before the categories of the panel that labels them, on columns and on bars, and the figure itself only in the first", async () => {
    const result = chartResult({
      [uuid(1)]: [bucketOf('new', 8, { derived: 2 }), bucketOf('won', 5, { derived: 1 })],
      [uuid(2)]: [bucketOf('new', 800), bucketOf('won', 500)],
    });
    for (const chart of ['column', 'bar'] as const) {
      const spec = chartTile(chart, [measure(1, { primary: true }), amount(2)], { transform: { derive: { kind: 'rank', direction: 'desc', ties: 'dense' } } });
      const panels = build(spec, result);
      expect(panels.map((p) => p.derive?.kind ?? null), `${chart}: the figure is the primary's`).toEqual(['rank', null]);
      expect(panels.map((p) => p.ranks), `${chart}: the rank text is in every panel`).toEqual([['#2', '#1'], ['#2', '#1']]);
      expect(panels[1]!.buckets.map((b) => b.derived), `${chart}: and the figure in none but the first`).toEqual([null, null]);

      const el = mount({ spec, result, fields: TILE_FIELDS });
      await drawn(el);
      expect(ranksOf(el), `${chart}: what the axes draw`).toEqual(chart === 'column' ? ['#2 new', '#1 Closed won'] : ['#2 new', '#1 Closed won', '#2 new', '#1 Closed won']);
      document.body.innerHTML = '';
    }
  });

  it('draws no label for a series that is not showing, and anchors a stack label at the top of the stack', () => {
    const spec = chartTile('column', [amount(1, { primary: true }), amount(2, { label: 'Second' })], { transform: { derive: { kind: 'share_of_total' } } });
    const model = first(spec, chartResult({ [uuid(1)]: [bucketOf('new', 30, { derived: 0.5 })], [uuid(2)]: [bucketOf('new', 60)] }));
    expect(layoutBars(model, SIZE, NONE).labels, 'beside the primary column').toHaveLength(1);
    expect(layoutBars(model, SIZE, new Set([0])).labels, 'the primary is hidden, and so is its figure').toEqual([]);

    const running = first(chartTile('column', [amount(1, { primary: true }), amount(2, { label: 'Second' })], { transform: { derive: { kind: 'running_total' } } }), chartResult({ [uuid(1)]: [bucketOf('new', 30, { derived: 300 })], [uuid(2)]: [bucketOf('new', 60)] }));
    expect([layoutBars(running, SIZE, NONE).running !== null, valueDomain(running, NONE)[1]], 'a running total is drawn, and held by the axis').toEqual([true, 300]);
    expect([layoutBars(running, SIZE, new Set([0])).running, valueDomain(running, new Set([0]))[1]], "and goes with the primary it totals, so the axis lets go of it").toEqual([null, 60]);

    const stacked = chartTile('column', [amount(1, { primary: true })], { stack_by: { field: 'stage' }, transform: { derive: { kind: 'share_of_total' } } });
    const stack = first(stacked, chartResult({ [uuid(1)]: [bucketOf('k', 50, { derived: 1, segments: [bucketOf('new', 20), bucketOf('won', 30)] })] }));
    const laid = layoutBars(stack, SIZE, NONE);
    expect(laid.labels[0]!.text, "the stack's total").toBe('$50.00 · 100%');
    expect(laid.labels[0]!.y, 'above the highest segment').toBe(Math.min(...laid.marks.map((m) => m.y)) - 4);
  });

  it('draws the running total through the bars and lines with one point for each bucket that has a figure', () => {
    const buckets = [bucketOf('a', 10, { derived: 10 }), bucketOf('b', 30), bucketOf('c', 25, { derived: 65 }), bucketOf('d', 5, { derived: 70 })];
    const bars = layoutBars(first(chartTile('column', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } }), chartResult({ [uuid(1)]: buckets })), SIZE, NONE);
    expect(bars.running!.dots.map((d) => d.bucket), 'no dot for the bucket with no figure').toEqual([0, 2, 3]);
    expect(bars.running!.d.split('M').length - 1, 'and the line breaks there').toBe(2);
    const horizontal = layoutBars(first(chartTile('bar', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } }), chartResult({ [uuid(1)]: buckets })), SIZE, NONE);
    const along = (dots: { cx: number; cy: number }[], axis: 'cx' | 'cy') => dots.map((d) => d[axis]);
    const rises = (values: number[]) => values.every((v, i) => i === 0 || v > values[i - 1]!);
    expect([rises(along(horizontal.running!.dots, 'cx')), rises(along(horizontal.running!.dots, 'cy'))], 'on a bar chart the total grows along the value axis, one category after the next').toEqual([true, true]);
    expect([rises(along(bars.running!.dots, 'cx')), rises(along(bars.running!.dots, 'cy').map((y) => -y))], 'on a column chart it climbs').toEqual([true, true]);

    const lines = layoutLines(first(chartTile('line', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } }), chartResult({ [uuid(1)]: buckets })), SIZE, NONE);
    expect(lines.paths.map((p) => p.kind)).toEqual(['value', 'running']);
    expect(lines.paths[1]).toMatchObject({ series: -1, stroke: 'var(--k-fg)', opacity: 0.7, dashed: false });
    expect(layoutBars(first(chartTile('column', [measure(1, { primary: true })]), chartResult({ [uuid(1)]: buckets })), SIZE, NONE).running).toBeNull();
  });

  it('draws the running total in the legend as the chart draws it, a line at 0.7 with a dot, which the target rule is not', async () => {
    const spec = chartTile('column', [measure(1, { primary: true })], { transform: { target: { kind: 'constant', value: 9 }, derive: { kind: 'running_total' } } });
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 8, { target: 9, derived: 8 }), bucketOf('won', 2, { target: 9, derived: 10 })] });
    const el = mount({ spec, result, fields: TILE_FIELDS });
    await drawn(el);
    const swatchOf = (name: string) => parts(el, 'legend-item').find((i) => words(i) === name)!.querySelector<HTMLElement>('.swatch')!;
    const ink = swatchOf('running total');
    const rule = swatchOf('target');
    expect([ink.classList.contains('ink'), rule.classList.contains('rule')], 'two shapes').toEqual([true, true]);
    expect(getComputedStyle(ink.querySelector('.run')!).opacity, "the line's own opacity").toBe('0.7');
    expect(ink.querySelector('.point'), 'and a dot on it, as the bars draw').not.toBeNull();
    expect(rule.children.length, 'a target rule is a plain line').toBe(0);
    expect(getComputedStyle(rule).opacity, 'at full strength').not.toBe('0.7');
  });

  it("names a running total in the legend with an ink swatch and a formula with a label alone, in the language", async () => {
    const entry = (el: Element, name: string) => parts(el, 'legend-item').find((i) => words(i) === name);
    const running = mount({ ...TILE_CASES.COLUMN_RUNNING });
    await drawn(running);
    expect(entry(running, 'running total')!.querySelector('.swatch.ink'), 'a 14 by 2 line in ink').not.toBeNull();

    const formula = mount({ ...TILE_CASES.COLUMN_FORMULA });
    await drawn(formula);
    expect(entry(formula, 'Attainment'), 'a formula is a label').not.toBeUndefined();
    expect(entry(formula, 'Attainment')!.querySelector('.swatch'), 'with no swatch').toBeNull();

    const viet = mount({ ...TILE_CASES.COLUMN_RUNNING, locale: 'vi' });
    await drawn(viet);
    expect(entry(viet, 'tổng luỹ kế')).not.toBeUndefined();
    expect(notesOf(viet)[0]).toBe('Tổng luỹ kế');
  });

  it('words a formula figure with the one formatter its model built, and the share once for all', () => {
    const spec = TILE_CASES.COLUMN_FORMULA.spec;
    const result = TILE_CASES.COLUMN_FORMULA.result!;
    const made = vi.spyOn(Intl, 'NumberFormat');
    const model = first(spec, result, TILE_CASES.COLUMN_FORMULA.fields!);
    made.mockClear();
    const said = [0.8, 0.923, 1.05, 0.8, 0.923].map((v) => model.formatDerived(v));
    expect(said).toEqual(['0.8', '0.92', '1.05', '0.8', '0.92']);
    expect(made, 'wording a figure builds no formatter').not.toHaveBeenCalled();
    expect(model.formatDerived(null)).toBe('no value');
  });

  it('lays the labels out from the words the model has, and a resize words nothing again', () => {
    const { spec, result, fields } = TILE_CASES.BAR_SHARE;
    const model = first(spec, result!, fields!);
    const formatDerived = vi.fn(model.formatDerived);
    // A format that says something else: the label text can only be the model's.
    const counted: ChartModel = { ...model, formatDerived, format: () => 'X' };
    const narrow = layoutBars(counted, { width: 320, height: 200 }, NONE);
    const wide = layoutBars(counted, { width: 800, height: 400 }, NONE);
    expect(narrow.labels.map((l) => l.text)).toEqual(model.beside);
    expect(wide.labels.map((l) => l.text)).toEqual(model.beside);
    expect(formatDerived, 'the layout places the words and does not make them').not.toHaveBeenCalled();
  });

  it('a column writes its figure alone when its full text is wider than its bucket, and a bar never does', () => {
    const { spec, result, fields } = TILE_CASES.COLUMN_FORMULA;
    const model = first(spec, result!, fields!);
    const written = (m: ChartModel, width: number) => layoutBars(m, { width, height: 300 }, NONE).labels.map((l) => l.text);
    expect(model.alone, 'the figure on its own, null where there is none').toEqual(['0.8', '0.92', '0.9', '0.8', '0.96', null, '1.05', '0.8']);
    expect(written(model, 1400), 'room for the whole text').toEqual(model.beside.filter((b) => b !== null));
    expect(written(model, 320), 'no room: one figure for each bucket that has one').toEqual(model.alone.filter((b) => b !== null));

    const share = first(TILE_CASES.BAR_SHARE.spec, TILE_CASES.BAR_SHARE.result!, TILE_CASES.BAR_SHARE.fields!);
    expect(written(share, 140).map((t) => t.slice(0, 8)), 'a bar is cut at the edge of the tile, and never has its value taken off').toEqual(share.beside.map((b) => b!.slice(0, 8)));
  });

  it('keeps the layouts of a chart with no derived figure as they were', () => {
    const model = first(chartTile('column', [measure(1, { primary: true })]), chartResult({ [uuid(1)]: [bucketOf('new', 3), bucketOf('won', 5)] }));
    const laid = layoutBars(model, SIZE, NONE);
    expect([laid.labels, laid.running]).toEqual([[], null]);
    expect(model.derive).toBeNull();
    expect(model.formatDerived(1)).toBe('—');
  });

  it('an unknown derive kind is not drawn', async () => {
    const spec = chartTile('bar', [measure(1, { primary: true })], { transform: { derive: { kind: 'moving_average', window: 3 } } });
    const result = chartResult({ [uuid(1)]: [bucketOf('new', 5, { derived: 4.5, drill: DRILL }), bucketOf('won', 8)] });
    expect(frameModel(spec, result, TILE_FIELDS, EN, 'en')).toMatchObject({ state: { kind: 'not-drawn' }, notes: [] });

    const el = mount({ spec, result, fields: TILE_FIELDS });
    // The shell's own placeholder is a state too, so wait for the words of this one.
    await expect.poll(() => words(part(el, 'state'))).toBe(EN.tileNotDrawn);
    expect(plotsOf(el)).toEqual([]);
    expect(part(el, 'table-toggle'), 'nothing to switch to').toBeNull();

    // A spec that gains a derive kind later: the element redraws to what it now knows.
    el.spec = chartTile('bar', [measure(1, { primary: true })], { transform: { derive: { kind: 'running_total' } } });
    await drawn(el);
    expect(plotsOf(el)).toHaveLength(1);
  });

  it('draws the four known kinds, and a tile with no derive or a null one as a chart', () => {
    const rows: [string, Record<string, unknown> | null | undefined][] = [
      ['a share', { kind: 'share_of_total' }],
      ['a running total', { kind: 'running_total' }],
      ['a rank', { kind: 'rank', direction: 'asc', ties: 'dense' }],
      ['a formula', { kind: 'expression', expression: 'a' }],
      ['null', null],
      ['none', undefined],
    ];
    for (const [name, derive] of rows) {
      const spec = chartTile('column', [measure(1)], { transform: { derive } });
      expect(frameModel(spec, chartResult({}), TILE_FIELDS, EN, 'en').state, name).toEqual({ kind: 'chart', chart: 'column' });
    }
  });
});

/** The legend's entries, sorted: the order a legend lists them in is not what these tests are about. */
function legendNames(el: Element): string[] {
  return parts(el, 'legend-item').map((i) => words(i)).sort();
}
