import { afterEach, describe, expect, it } from 'vitest';
import type { components } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { kitText } from '../../src/kit/text.js';
import { verdictModel } from '../../src/kit/tile/verdict.js';
import { amount, bucketOf, chartResult, chartTile, uuid } from './fixtures/tile.js';
import { FIELDS, TILE_CASES } from './fixtures/tiles.js';
import type { TileCase, TileCaseName } from './fixtures/tiles.js';

type Verdict = NonNullable<components['schemas']['TileResult']['verdict']>;

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  drill: boolean;
  locale: string | null;
}

const EN = kitText('en');
const VI = kitText('vi');
const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
const follows = (a: Element, b: Element) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

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

/** A named case with the verdict the server gave it replaced. */
function withVerdict(name: TileCaseName, verdict: unknown, over: Partial<components['schemas']['TileResult']> = {}): TileCase {
  const base = TILE_CASES[name];
  return { ...base, result: { ...base.result, ...over, verdict } as AfTileResult };
}

/** A column chart over the amount, stacked by stage or not, whose result carries a verdict. */
const spec = (stacked: boolean) => chartTile('column', [amount(1, { primary: true })], stacked ? { stack_by: { field: 'stage' } } : {});
const resultOf = (verdict: Verdict | null) => chartResult({ [uuid(1)]: [bucketOf('new', 600), bucketOf('won', 400)] }, { verdict });
const say = (stacked: boolean, verdict: Verdict, text = EN, locale = 'en') => verdictModel(spec(stacked), resultOf(verdict), FIELDS, text, locale);

afterEach(() => {
  document.body.innerHTML = '';
});

describe("<af-tile>'s verdict chip", () => {
  it('each verdict reads as the platform words it', () => {
    const fanOut: Verdict = { kind: 'fans_out', bucket_sum: 1250, total: 1000, gap: -250 };
    const rows: [string, boolean, Verdict, { tone: string; text: string }][] = [
      ['partitions', false, { kind: 'partitions', total: 1000 }, { tone: 'ok', text: 'Bars add up to $1,000' }],
      ['partitions without a total', false, { kind: 'partitions', total: null }, { tone: 'ok', text: 'Bars add up to the total' }],
      ['partitions, stacked', true, { kind: 'partitions', total: 1000 }, { tone: 'ok', text: 'Segments add up to each bar; bars add up to $1,000' }],
      ['partitions, stacked, without a total', true, { kind: 'partitions', total: null }, { tone: 'ok', text: 'Segments add up to each bar; bars add up to the total' }],
      ['fans out', false, fanOut, { tone: 'warning', text: 'Bars sum to $1,250; the population total is $1,000. $250 is counted more than once.' }],
      ['fans out, whichever way the gap is signed', false, { ...fanOut, gap: 250 }, { tone: 'warning', text: 'Bars sum to $1,250; the population total is $1,000. $250 is counted more than once.' }],
      ['overlaps', false, { kind: 'overlaps' }, { tone: 'info', text: 'Buckets overlap and cannot be combined' }],
      ['not applicable', false, { kind: 'not_applicable' }, { tone: 'info', text: 'No total to reconcile against' }],
    ];
    for (const [name, stacked, verdict, expected] of rows) {
      expect(say(stacked, verdict), name).toEqual({ kind: verdict.kind, ...expected });
    }
  });

  it('a fan-out is a warning with its icon in the warning token', async () => {
    const fans = mount({ ...TILE_CASES.COLUMN_FANS_OUT });
    await drawn(fans);
    const chip = part(fans, 'verdict')!;
    expect(chip.dataset.verdict).toBe('fans_out');
    expect(words(chip)).toBe('Bars sum to $1,250,000; the population total is $1,000,000. $250,000 is counted more than once.');
    expect(chip.querySelector<SVGElement>('svg')!.style.color).toBe('var(--k-warning)');

    const calm = mount({ ...TILE_CASES.BAR_GROUPED });
    await drawn(calm);
    const ok = part(calm, 'verdict')!;
    expect(ok.dataset.verdict).toBe('partitions');
    expect(words(ok)).toBe('Bars add up to $1,480,000');
    expect(ok.querySelector<SVGElement>('svg')!.style.color, 'only the warning icon is in the warning token').toBe('');
  });

  it('the chip shows under every chart type, the pie and small multiples included, and never on a number tile', async () => {
    const partitions = { kind: 'partitions', total: 100 };
    const cases: [string, TileCase, string | null][] = [
      ['bar', TILE_CASES.BAR_GROUPED, 'partitions'],
      ['column', TILE_CASES.COLUMN_FANS_OUT, 'fans_out'],
      ['stacked column', withVerdict('COLUMN_STACKED', partitions), 'partitions'],
      ['line', withVerdict('LINE', { kind: 'overlaps' }), 'overlaps'],
      ['pie', withVerdict('PIE', partitions), 'partitions'],
      ['donut', withVerdict('DONUT', { kind: 'not_applicable' }), 'not_applicable'],
      ['small multiples', withVerdict('MULTIPLES', partitions), 'partitions'],
      ['number', withVerdict('NUMBER_GOAL', partitions), null],
    ];
    for (const [name, tile, kind] of cases) {
      const el = mount({ ...tile });
      await drawn(el, kind === null ? 'figure' : 'plot');
      expect(parts(el, 'verdict').map((chip) => chip.dataset.verdict), name).toEqual(kind === null ? [] : [kind]);
    }
  });

  it('the chip sits between the chart and the notes, in chart and table view alike', async () => {
    // A tile with a partial result has a note, and the chip must not repeat it.
    const tile = withVerdict('BAR_GROUPED', { kind: 'partitions', total: 1_480_000 }, { coverage: { partial: true } });
    const el = mount({ ...tile });
    await drawn(el);
    const order = (view: string) => {
      const chip = part(el, 'verdict')!;
      expect(follows(part(el, view)!, chip), `${view} comes first`).toBe(true);
      expect(follows(part(el, 'legend') ?? part(el, view)!, chip), 'and so does its legend').toBe(true);
      expect(follows(chip, part(el, 'notes')!), 'the notes come last').toBe(true);
    };
    order('plot');
    expect(words(part(el, 'verdict')), 'the partial-coverage line stays a note').not.toMatch(/withheld/);
    expect(parts(el, 'notes')[0]!.textContent).toMatch(/withheld/);

    (part(el, 'table-toggle') as HTMLButtonElement).click();
    await drawn(el, 'table');
    expect(parts(el, 'verdict')).toHaveLength(1);
    order('table');
  });

  it('no verdict, or an unknown kind, draws no chip', async () => {
    const unknown = { kind: 'weighted', ratio: 2 };
    for (const verdict of [undefined, null, unknown]) {
      const tile = withVerdict('BAR_GROUPED', verdict);
      expect(verdictModel(tile.spec, tile.result!, tile.fields, EN, 'en'), String(verdict)).toBeNull();
      const el = mount({ ...tile });
      await drawn(el);
      expect(parts(el, 'verdict'), `${JSON.stringify(verdict)} draws no chip`).toEqual([]);
      expect(part(el, 'legend'), 'and the rest of the tile is drawn').not.toBeNull();
    }
  });

  it('a Vietnamese tile words the verdict in Vietnamese', async () => {
    expect(say(false, { kind: 'partitions', total: null }, VI, 'vi')?.text).toBe('Các cột cộng lại bằng tổng');
    expect(say(true, { kind: 'partitions', total: null }, VI, 'vi')?.text).toBe('Các phân đoạn cộng lại bằng mỗi cột; các cột cộng lại bằng tổng');
    expect(say(false, { kind: 'overlaps' }, VI, 'vi')?.text).toBe('Các nhóm chồng lấn và không thể gộp lại');
    expect(say(false, { kind: 'not_applicable' }, VI, 'vi')?.text).toBe('Không có tổng để đối chiếu');

    const el = mount({ ...TILE_CASES.COLUMN_FANS_OUT, locale: 'vi' });
    await drawn(el);
    const chip = words(part(el, 'verdict'));
    expect(chip).toMatch(/^Các cột cộng lại là 1\.250\.000 .+; tổng của tập bản ghi là 1\.000\.000 .+\. 250\.000 .+ được đếm nhiều hơn một lần\.$/);
    expect(chip, 'the figures are in the tile language, not left as placeholders').not.toMatch(/[{}]/);
  });
});
