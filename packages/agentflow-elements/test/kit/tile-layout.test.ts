import { describe, expect, it } from 'vitest';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import { chartPanels } from '../../src/kit/tile/chart-model.js';
import { layoutBars, layoutLines, valueDomain } from '../../src/kit/tile/layout.js';
import type { BarLayout, BarMark, Box, Size } from '../../src/kit/tile/layout.js';
import { kitText } from '../../src/kit/text.js';
import { modelOf } from './fixtures/chart.js';
import { TILE_FIELDS, bucketOf, chartResult, chartTile, measure, uuid } from './fixtures/tile.js';

const SIZE: Size = { width: 480, height: 240 };
const NONE: ReadonlySet<number> = new Set();
const CHAR = 6.2;

const marksOf = (layout: BarLayout, bucket: number) => layout.marks.filter((m) => m.bucket === bucket);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** The widths of shown labels are estimated, so two neighbours overlap when their centres are nearer than half of each. */
const overlaps = (ticks: BarLayout['categoryTicks']) =>
  ticks.flatMap((tick, i) => {
    const previous = ticks[i - 1];
    if (!previous) return [];
    const needed = ((tick.label.length + previous.label.length) / 2) * CHAR;
    return tick.at - previous.at < needed - 1e-6 ? [`${previous.label} | ${tick.label}`] : [];
  });
/** The shown labels whose estimated extent leaves the box, which clips them. */
const outside = (ticks: BarLayout['categoryTicks'], width: number) =>
  ticks.filter((t) => t.at - (t.label.length * CHAR) / 2 < 0 || t.at + (t.label.length * CHAR) / 2 > width).map((t) => t.label);
const finite = (layout: BarLayout) => {
  const numbers = [
    ...Object.values(layout.plot), layout.zero,
    ...layout.marks.flatMap((m) => [m.x, m.y, m.width, m.height, m.opacity]),
    ...layout.targets.flatMap((t) => [t.x1, t.y1, t.x2, t.y2]),
    ...layout.valueTicks.map((t) => t.at), ...layout.categoryTicks.map((t) => t.at),
  ];
  return numbers.every(Number.isFinite);
};

describe('the value domain', () => {
  it('holds every target and the earlier period', () => {
    const model = modelOf([[2], [3]], { compared: true }, [{ target: 10 }, { previous: 12, compared: true }]);
    const [lo, hi] = valueDomain(model, NONE);
    expect(lo, 'bars are anchored at zero').toBe(0);
    expect(hi).toBeGreaterThanOrEqual(12);

    const lowTarget = modelOf([[2]], {}, [{ target: -5 }]);
    expect(valueDomain(lowTarget, NONE)[0]).toBeLessThanOrEqual(-5);
  });

  it('counts the positive and the negative segments of a stack separately', () => {
    const [lo, hi] = valueDomain(modelOf([[3, -2, 4, -1], [1, 1, 1, 1]], { stacked: true }), NONE);
    expect(lo).toBeLessThanOrEqual(-3);
    expect(hi, 'not the net total of 4').toBeGreaterThanOrEqual(7);
    expect(hi).toBeLessThan(10);
  });

  it('is [0, 1] when nothing is finite, and nicely rounded otherwise', () => {
    const nulls = modelOf([[null], [null]]);
    for (const type of ['column', 'bar', 'line'] as const) expect(valueDomain({ ...nulls, type }, NONE), type).toEqual([0, 1]);
    expect(valueDomain(modelOf([[0], [0]]), NONE), 'all zero').toEqual([0, 1]);
    expect(valueDomain(modelOf([[Number.NaN], [Number.POSITIVE_INFINITY]]), NONE), 'not finite').toEqual([0, 1]);
    expect(valueDomain(modelOf([[7], [93]]), NONE)).toEqual([0, 100]);
  });

  it('is the extent of a line, with no zero anchor, over its values, earlier period and targets', () => {
    const line = modelOf([[50], [80]], { type: 'line', compared: true }, [{ previous: 40, compared: true }, { target: 97 }]);
    expect(valueDomain(line, NONE)).toEqual([40, 100]);
    expect(valueDomain(modelOf([[-20], [0]], { type: 'line' }), NONE)).toEqual([-20, 0]);
    expect(valueDomain(modelOf([[5], [5]], { type: 'line' }), NONE), 'a flat line has no extent to widen').toEqual([5, 5]);
  });
});

describe('the bars layout', () => {
  it('extends a negative bar below the zero line, in a column and in a bar', () => {
    const model = modelOf([[5], [-3]]);
    const column = layoutBars(model, SIZE, NONE);
    const [up, down] = column.marks;
    expect(up!.y + up!.height, 'a positive column stands on the zero line').toBeCloseTo(column.zero);
    expect(down!.y, 'a negative one hangs from it').toBeCloseTo(column.zero);
    expect(down!.height).toBeGreaterThan(0);
    expect(down!.y + down!.height).toBeLessThanOrEqual(column.plot.y + column.plot.height + 1e-9);
    expect(valueDomain(model, NONE)[0]).toBeLessThan(0);

    const bar = layoutBars({ ...model, type: 'bar' }, SIZE, NONE);
    const [right, left] = bar.marks;
    expect(right!.x, 'a positive bar starts at zero and runs right').toBeCloseTo(bar.zero);
    expect(left!.x + left!.width, 'a negative one ends at zero').toBeCloseTo(bar.zero);
    expect(left!.width).toBeGreaterThan(0);
    expect(left!.x).toBeGreaterThanOrEqual(bar.plot.x - 1e-9);
  });

  it('stacks negatives downward from zero, and positives upward, in series order', () => {
    const layout = layoutBars(modelOf([[3, -2, 4, -1]], { stacked: true }), SIZE, NONE);
    const [a, b, c, d] = layout.marks as [BarMark, BarMark, BarMark, BarMark];
    expect(a.y + a.height, 'the first positive sits on zero').toBeCloseTo(layout.zero);
    expect(c.y + c.height, 'the next positive sits on it').toBeCloseTo(a.y);
    expect(b.y, 'the first negative hangs from zero').toBeCloseTo(layout.zero);
    expect(d.y, 'the next hangs from it').toBeCloseTo(b.y + b.height);
    expect(new Set(layout.marks.map((m) => m.x)).size, 'one column').toBe(1);
    expect(a.height / b.height, 'heights are in proportion').toBeCloseTo(3 / 2);
    expect(c.height / d.height).toBeCloseTo(4);
    expect(layout.marks.map((m) => m.series)).toEqual([0, 1, 2, 3]);
  });

  it('draws nothing for a null value and has no NaN', () => {
    for (const type of ['column', 'bar'] as const) {
      const layout = layoutBars(modelOf([[null], [null]], { type }), SIZE, NONE);
      expect(layout.marks, type).toEqual([]);
      expect(layout.targets).toEqual([]);
      expect(layout.valueTicks.map((t) => t.label)).toEqual(['0', '0.2', '0.4', '0.6', '0.8', '1']);
      expect(layout.categoryTicks).toHaveLength(2);
      expect(finite(layout), 'every coordinate is a number').toBe(true);
    }
    expect(finite(layoutBars(modelOf([]), SIZE, NONE)), 'no buckets').toBe(true);
    expect(finite(layoutBars(modelOf([[1]]), { width: 0, height: 0 }, NONE)), 'a box with no size').toBe(true);
    const partial = layoutBars(modelOf([[1, null], [null, 2]]), SIZE, NONE);
    expect(partial.marks.map((m) => [m.bucket, m.series])).toEqual([[0, 0], [1, 1]]);
  });

  it('draws one band for one bucket', () => {
    const layout = layoutBars(modelOf([[4]]), SIZE, NONE);
    const [mark] = layout.marks;
    expect(layout.marks).toHaveLength(1);
    expect(layout.categoryTicks).toHaveLength(1);
    expect(mark!.x + mark!.width / 2, 'centred in the plot').toBeCloseTo(layout.plot.x + layout.plot.width / 2);
    expect(mark!.width).toBeCloseTo(layout.plot.width * 0.8);
    expect(layout.categoryTicks[0]!.at).toBeCloseTo(layout.plot.x + layout.plot.width / 2);
    expect(finite(layout)).toBe(true);
  });

  it('keeps every bar at least 1 px wide and no two shown labels overlapping, over 400 daily buckets', () => {
    const days = Array.from({ length: 400 }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10));
    const model = modelOf(days.map((_, i) => [(i % 7) + 1]), {}, days.map((label) => ({ label, key: label })));
    const layout = layoutBars(model, SIZE, NONE);
    expect(layout.marks).toHaveLength(400);
    expect(Math.min(...layout.marks.map((m) => m.width))).toBeGreaterThanOrEqual(1);

    const ticks = layout.categoryTicks;
    expect(ticks.length).toBeLessThan(400);
    expect(ticks[0]!.full, 'the first label shows').toBe(days[0]);
    expect(ticks.at(-1)!.full, 'and the last').toBe(days[399]);
    expect(ticks.at(-1)!.at + (ticks.at(-1)!.label.length * CHAR) / 2, 'the last label stays inside the box').toBeLessThanOrEqual(SIZE.width);
    expect(overlaps(ticks)).toEqual([]);

    const bars = layoutBars({ ...model, type: 'bar' }, SIZE, NONE);
    expect(Math.min(...bars.marks.map((m) => m.height)), 'a bar chart of the same data').toBeGreaterThanOrEqual(1);
  });

  it('shows every column label that fits, the first and last always', () => {
    const labels = ['one', 'two', 'three', 'four', 'five'];
    const layout = layoutBars(modelOf(labels.map(() => [1]), {}, labels.map((label) => ({ label }))), SIZE, NONE);
    expect(layout.categoryTicks.map((t) => t.label)).toEqual(labels);

    const crowded = ['2026-01-01', '2026-01-08', '2026-01-15', '2026-01-22', '2026-01-29', '2026-02-05', '2026-02-12'];
    const narrow = layoutBars(modelOf(crowded.map(() => [1]), {}, crowded.map((label) => ({ label }))), { width: 200, height: 240 }, NONE);
    const shown = narrow.categoryTicks.map((t) => t.label);
    expect(shown[0]).toBe(crowded[0]);
    expect(shown.at(-1)).toBe(crowded.at(-1));
    expect(shown.length).toBeLessThan(crowded.length);
  });

  it('always shows the first and last column labels, each cut to the room it has', () => {
    const north = 'Northern region accounts';
    const south = 'Southern region accounts';
    for (const width of [240, 300, 360]) {
      const layout = layoutBars(modelOf([[1], [2]], {}, [{ label: north }, { label: south }]), { width, height: 240 }, NONE);
      const ticks = layout.categoryTicks;
      expect(ticks.map((t) => t.full), `${width} px wide`).toEqual([north, south]);
      expect(ticks.every((t) => t.label.endsWith('…')), 'neither fits whole, so both are cut').toBe(true);
      expect(overlaps(ticks), 'and they do not overlap').toEqual([]);
      expect(ticks[1]!.at - ticks[0]!.at, 'a band apart').toBeGreaterThan(0);
    }

    // The last label is never given up for a nearer neighbour: that neighbour goes instead, the first excepted.
    const labels = Array.from({ length: 5 }, (_, i) => `Account number ${i + 1} of five`);
    const five = layoutBars(modelOf(labels.map(() => [1]), {}, labels.map((label) => ({ label }))), { width: 300, height: 240 }, NONE);
    expect(five.categoryTicks.map((t) => t.full)).toEqual([labels[0], labels[4]]);
    expect(overlaps(five.categoryTicks)).toEqual([]);

    for (const count of [2, 3, 4, 5, 8, 13, 40]) {
      for (const width of [160, 240, 400, 480, 1200]) {
        for (const size of [4, 12, 30, 38, 60]) {
          const names = Array.from({ length: count }, (_, i) => `${i}`.padStart(size, 'x'));
          const ticks = layoutBars(modelOf(names.map(() => [1]), {}, names.map((label) => ({ label }))), { width, height: 240 }, NONE).categoryTicks;
          const where = `${count} labels of ${size} chars in ${width} px`;
          expect([ticks[0]!.full, ticks.at(-1)!.full], where).toEqual([names[0], names[count - 1]]);
          expect(overlaps(ticks), where).toEqual([]);
          expect(outside(ticks, width), `${where}: inside the box`).toEqual([]);
        }
      }
    }
  });

  it('keeps the first and last column labels inside the box, as they are cut', () => {
    const offices = ['Ho Chi Minh City Department of Finance', 'Hanoi Department of Planning and Investment', 'Da Nang Department of Transport', 'Can Tho Department of Health'];
    for (const width of [400, 480]) {
      const ticks = layoutBars(modelOf(offices.map(() => [1]), {}, offices.map((label) => ({ label }))), { width, height: 240 }, NONE).categoryTicks;
      expect(ticks.map((t) => t.full), `${width} px`).toEqual([offices[0], offices[3]]);
      expect(outside(ticks, width), `${width} px: inside the box`).toEqual([]);
      expect(overlaps(ticks)).toEqual([]);
    }
  });

  it('cuts a long label with … and keeps its full text', () => {
    const long = 'A very long account name that cannot possibly fit in a gutter';
    const buckets = [{ label: long }, { label: 'Short' }];
    const bar = layoutBars(modelOf([[1], [2]], { type: 'bar' }, buckets), SIZE, NONE);
    expect(bar.plot.x, 'the category gutter stops at 120').toBe(120);
    const [cut, whole] = bar.categoryTicks;
    expect(cut!.label.endsWith('…')).toBe(true);
    expect(cut!.full).toBe(long);
    expect(long.startsWith(cut!.label.slice(0, -1))).toBe(true);
    expect(cut!.label.length * CHAR, 'inside the gutter').toBeLessThanOrEqual(120 - 14);
    expect([whole!.label, whole!.full], 'a short label is whole').toEqual(['Short', 'Short']);

    const column = layoutBars(modelOf([[1], [2], [3]], {}, [{ label: long }, { label: 'Short' }, { label: 'Other' }]), { width: 240, height: 240 }, NONE);
    const first = column.categoryTicks[0]!;
    expect(first.label.endsWith('…')).toBe(true);
    expect(first.full).toBe(long);
  });

  it('sizes the gutters by the longest label, within their limits', () => {
    const tickWidth = (layout: BarLayout) => Math.max(...layout.valueTicks.map((t) => t.label.length)) * CHAR;
    const column = layoutBars(modelOf([[1_234_567], [2_000_000]]), SIZE, NONE);
    expect(column.plot.x).toBeCloseTo(clamp(tickWidth(column) + 14, 56, 120));
    expect(layoutBars(modelOf([[1]]), SIZE, NONE).plot.x, 'at least 56').toBe(56);
    expect(SIZE.height - (column.plot.y + column.plot.height), '24 px below, for the labels').toBe(24);
    expect(column.valueTicks.map((t) => t.label)).toEqual(['0', '500000', '1000000', '1500000', '2000000']);

    const bar = layoutBars(modelOf([[1], [2]], { type: 'bar' }, [{ label: 'Medium label' }, { label: 'Short' }]), SIZE, NONE);
    expect(bar.plot.x).toBeCloseTo(clamp('Medium label'.length * CHAR + 14, 48, 120));
    expect(layoutBars(modelOf([[1]], { type: 'bar' }, [{ label: 'a' }]), SIZE, NONE).plot.x, 'at least 48').toBe(48);
    expect(SIZE.height - (bar.plot.y + bar.plot.height)).toBe(24);
    expect(bar.valueTicks.every((t) => t.at >= bar.plot.x - 1e-9 && t.at <= bar.plot.x + bar.plot.width + 1e-9)).toBe(true);
  });

  it('puts the earlier period beside the primary, at 0.35, unlinked', () => {
    const model = modelOf([[10, 4], [8, 3]], { compared: true }, [{ previous: 6, compared: true }, { previous: null, compared: true }]);
    const layout = layoutBars(model, SIZE, NONE);
    const first = marksOf(layout, 0);
    expect(first.map((m) => [m.series, m.kind]), 'the primary, its earlier period, then the rest').toEqual([[0, 'value'], [0, 'previous'], [1, 'value']]);
    const [value, previous, second] = first as [BarMark, BarMark, BarMark];
    expect(previous.opacity).toBe(0.35);
    expect(value.opacity).toBe(1);
    expect(previous.fill, 'the primary colour').toBe('var(--k-chart-1)');
    expect(previous.drill, 'it opens nothing').toBeNull();
    expect(value.drill).not.toBeNull();
    expect(previous.x).toBeGreaterThanOrEqual(value.x + value.width);
    expect(second.x).toBeGreaterThanOrEqual(previous.x + previous.width);
    expect(previous.y + previous.height).toBeCloseTo(layout.zero);
    expect(previous.height / value.height).toBeCloseTo(6 / 10);
    expect(previous.summary).toBe('b0, S0 (earlier period): 6');
    expect(marksOf(layout, 1).map((m) => m.kind), 'no earlier figure, no bar').toEqual(['value', 'value']);
  });

  it('draws no earlier period for a stack', () => {
    const layout = layoutBars(modelOf([[3, 2]], { stacked: true, compared: true }, [{ previous: 9, compared: true }]), SIZE, NONE);
    expect(layout.marks.map((m) => m.kind)).toEqual(['value', 'value']);
    expect(valueDomain(modelOf([[3, 2]], { stacked: true, compared: true }, [{ previous: 900, compared: true }]), NONE)[1]).toBeLessThan(10);
  });

  it('draws a filled bucket as one dashed outline, at least 3 px', () => {
    const buckets = [{}, { filled: true }];
    const column = layoutBars(modelOf([[5], [null]], {}, buckets), SIZE, NONE);
    const [outline] = marksOf(column, 1);
    expect(marksOf(column, 1)).toHaveLength(1);
    expect(outline!.kind).toBe('filled');
    expect(outline!.height).toBeGreaterThanOrEqual(3);
    expect(outline!.y + outline!.height, 'on the zero line').toBeCloseTo(column.zero);
    expect(outline!.drill).toBeNull();
    expect(outline!.summary, 'a filled period is spoken as one, not as missing data').toBe('b1, S0: no records (filled)');

    const zero = layoutBars(modelOf([[0]], {}, [{ filled: true }]), SIZE, NONE);
    expect(zero.marks.map((m) => m.kind), 'a filled bucket with a zero is still one outline').toEqual(['filled']);

    const bar = layoutBars(modelOf([[5], [null]], { type: 'bar' }, buckets), SIZE, NONE);
    const [wide] = marksOf(bar, 1);
    expect(wide!.kind).toBe('filled');
    expect(wide!.width).toBeGreaterThanOrEqual(3);
    expect(wide!.x).toBeCloseTo(bar.zero);
  });

  it('removes a hidden series, and fits the domain to what is left', () => {
    const model = modelOf([[10, 1000], [20, 500]]);
    const all = layoutBars(model, SIZE, NONE);
    const hidden = layoutBars(model, SIZE, new Set([1]));
    expect(all.marks).toHaveLength(4);
    expect(hidden.marks.map((m) => m.series)).toEqual([0, 0]);
    expect(valueDomain(model, NONE)[1]).toBe(1000);
    expect(valueDomain(model, new Set([1]))[1]).toBe(20);
    expect(hidden.marks[0]!.width, 'the remaining series takes the band').toBeGreaterThan(all.marks[0]!.width);

    const stacked = modelOf([[10, 1000]], { stacked: true });
    expect(valueDomain(stacked, new Set([1]))[1]).toBe(10);
    expect(layoutBars(stacked, SIZE, new Set([1])).marks).toHaveLength(1);
    expect(layoutBars(model, SIZE, new Set([0, 1])).marks, 'all hidden').toEqual([]);
  });

  it('shares a band between the visible series', () => {
    const one = layoutBars(modelOf([[1]]), SIZE, NONE).marks[0]!;
    const [a, b, c] = layoutBars(modelOf([[1, 2, 3]]), SIZE, NONE).marks as [BarMark, BarMark, BarMark];
    expect(a.x).toBeGreaterThanOrEqual(one.x - 1e-9);
    expect(c.x + c.width).toBeLessThanOrEqual(one.x + one.width + 1e-9);
    expect(b.x).toBeGreaterThan(a.x + a.width);
    expect(c.x).toBeGreaterThan(b.x + b.width);
    expect(a.width).toBeCloseTo(b.width);
  });

  it('draws a target as a line across the middle 80% of its band', () => {
    const layout = layoutBars(modelOf([[10], [5]], {}, [{ target: 10 }, {}]), SIZE, NONE);
    const [target] = layout.targets;
    const [mark] = layout.marks;
    expect(layout.targets).toHaveLength(1);
    expect(target!.bucket).toBe(0);
    expect(target!.y1).toBe(target!.y2);
    expect(target!.y1, 'at the target value').toBeCloseTo(mark!.y);
    expect(target!.x1).toBeCloseTo(mark!.x + mark!.width * 0.1);
    expect(target!.x2).toBeCloseTo(mark!.x + mark!.width * 0.9);

    const bar = layoutBars(modelOf([[10]], { type: 'bar' }, [{ target: 10 }]), SIZE, NONE);
    const [t] = bar.targets;
    expect(t!.x1).toBe(t!.x2);
    expect(t!.x1).toBeCloseTo(bar.marks[0]!.x + bar.marks[0]!.width);
    expect(t!.y2 - t!.y1).toBeCloseTo(bar.marks[0]!.height * 0.8);
  });

  it('words a mark, links it and paints it', () => {
    const model = modelOf(
      [[5, 7], [2, 3], [4, 1]],
      { format: (v) => (v === null ? '—' : `$${v}`) },
      [{}, { other: true }, { restricted: true, drills: [null, null] }],
    );
    const layout = layoutBars(model, SIZE, NONE);
    const [first] = marksOf(layout, 0);
    expect([first!.summary, first!.fill, first!.pattern, first!.drill?.label]).toEqual(['b0, S0: $5', 'var(--k-chart-1)', null, 'b0.0']);
    expect(marksOf(layout, 0)[1]!.summary).toBe('b0, S1: $7');
    expect(marksOf(layout, 1).map((m) => m.pattern), 'an other bucket is hatched').toEqual(['other', 'other']);
    expect(marksOf(layout, 2).map((m) => [m.pattern, m.drill]), 'a restricted one differently, and opens nothing').toEqual([['restricted', null], ['restricted', null]]);

    const stacked = modelOf([[1, 2]], { stacked: true });
    stacked.series[1] = { ...stacked.series[1]!, color: { other: true }, pattern: 'other' };
    stacked.buckets[0] = { ...stacked.buckets[0]!, other: true };
    expect(layoutBars(stacked, SIZE, NONE).marks.map((m) => m.pattern), 'a stack keeps the segment pattern').toEqual([null, 'other']);
  });

  it('labels ticks by the model, for every tick the scale gives', () => {
    const layout = layoutBars(modelOf([[10], [20]], { format: (v) => `${v ?? '—'} items` }), SIZE, NONE);
    expect(layout.valueTicks.map((t) => t.label)).toEqual(['0 items', '5 items', '10 items', '15 items', '20 items']);
    expect(layout.valueTicks.every((t) => t.full === t.label)).toBe(true);
    expect(layout.valueTicks[0]!.at, 'zero is the bottom tick').toBeCloseTo(layout.zero);
    expect(layout.valueTicks[4]!.at).toBeCloseTo(layout.plot.y);
  });

  it('keeps the value labels up a short column chart at least 20 px apart, two or three of them', () => {
    // 72 px is 8 above the plot, 40 of plot and 24 below for the labels. At 240 px the five ticks above stand.
    const layout = layoutBars(modelOf([[18_000], [52_000], [33_000]]), { width: 480, height: 72 }, NONE);
    expect(layout.plot.height).toBe(40);
    expect(layout.valueTicks.length).toBeGreaterThanOrEqual(2);
    expect(layout.valueTicks.length).toBeLessThanOrEqual(3);
    expect(layout.valueTicks[0]!.label, 'zero stays').toBe('0');
    for (let i = 1; i < layout.valueTicks.length; i++) {
      expect(layout.valueTicks[i - 1]!.at - layout.valueTicks[i]!.at, layout.valueTicks[i]!.label).toBeGreaterThanOrEqual(20);
    }
  });

  it('labels zero and the top of a short column chart whose scale would offer zero alone', () => {
    // [0, 4000] asked for one tick gives [0]; between zero and the top there is no round step that fits 40 px twice.
    const model = modelOf([[1_500], [4_000]]);
    expect(valueDomain(model, NONE)).toEqual([0, 4000]);
    const layout = layoutBars(model, { width: 480, height: 72 }, NONE);
    expect(layout.plot.height).toBe(40);
    expect(layout.valueTicks.length).toBeGreaterThanOrEqual(2);
    expect(layout.valueTicks.length).toBeLessThanOrEqual(3);
    expect(layout.valueTicks[0]!.label, 'zero first').toBe('0');
    expect(layout.valueTicks.at(-1)!.label, 'the top labelled').toBe('4000');
    expect(layout.valueTicks.at(-1)!.at).toBeCloseTo(layout.plot.y);
  });

  it("thins a bar chart's value labels so none overprints another, at any width, and keeps zero", () => {
    const model = modelOf([[1_200_000], [650_000], [90_000]], { type: 'bar', format: (v) => `$${v ?? '—'}` });
    const shown = (width: number) => layoutBars(model, { width, height: 240 }, NONE).valueTicks;
    for (const width of [160, 200, 240, 300, 400, 480, 640, 900]) {
      const ticks = shown(width);
      expect(overlaps(ticks), `${width} px`).toEqual([]);
      expect(ticks.map((t) => t.label), `${width} px: zero stays`).toContain('$0');
      expect(ticks.length, `${width} px: at least one label`).toBeGreaterThan(0);
    }
    expect(shown(640).length, 'room for the whole set').toBeGreaterThanOrEqual(5);
    expect(shown(200).length, 'a narrow chart shows fewer').toBeLessThan(shown(640).length);
    const column = layoutBars({ ...model, type: 'column' }, { width: 200, height: 240 }, NONE).valueTicks;
    expect(column.length, 'a column chart stacks its labels, so it keeps them all').toBeGreaterThanOrEqual(5);
  });
});

describe('the bucket strips', () => {
  const tiled = (strips: Box[], plot: Box, horizontal: boolean) => {
    const [start, extent, across, length] = horizontal ? (['y', 'height', 'x', 'width'] as const) : (['x', 'width', 'y', 'height'] as const);
    expect(strips[0]![start], 'from the start of the plot').toBeCloseTo(plot[start]);
    strips.forEach((strip, i) => {
      expect([strip[across], strip[length]], `strip ${i} spans the plot across`).toEqual([plot[across], plot[length]]);
      if (i > 0) expect(strip[start], `strip ${i} starts where the one before ends`).toBeCloseTo(strips[i - 1]![start] + strips[i - 1]![extent]);
    });
    const last = strips[strips.length - 1]!;
    expect(last[start] + last[extent], 'to its end').toBeCloseTo(plot[start] + plot[extent]);
  };

  it('tile the plot edge to edge, a strip to a bucket, in columns, bars and lines', () => {
    const values = [[1], [2], [3], [4]];
    const column = layoutBars(modelOf(values), SIZE, NONE);
    const bar = layoutBars(modelOf(values, { type: 'bar' }), SIZE, NONE);
    const line = layoutLines(modelOf(values, { type: 'line' }), SIZE, NONE);
    expect([column.hits.length, bar.hits.length, line.hits.length]).toEqual([4, 4, 4]);
    tiled(column.hits, column.plot, false);
    tiled(bar.hits, bar.plot, true);
    tiled(line.hits, line.plot, false);
    line.bucketX.forEach((x, b) => expect(line.hits[b]!.x + line.hits[b]!.width / 2, 'a strip is centred on its bucket').toBeCloseTo(x));

    const one = layoutBars(modelOf([[1]]), SIZE, NONE);
    expect([one.hits[0]!.x, one.hits[0]!.width], 'one bucket has the whole plot').toEqual([one.plot.x, one.plot.width]);
    expect(layoutBars(modelOf([]), SIZE, NONE).hits).toEqual([]);
    expect(layoutLines(modelOf([], { type: 'line' }), SIZE, NONE).hits).toEqual([]);
    expect(layoutBars(modelOf(values), { width: 0, height: 0 }, NONE).hits.every((h) => [h.x, h.y, h.width, h.height].every(Number.isFinite))).toBe(true);
  });
});

describe('a resize', () => {
  /** How many date formatters `run` builds, counting the one each `toLocale…String` call builds out of sight. */
  function dateFormattersBuilt(run: () => void): number {
    const Real = Intl.DateTimeFormat;
    const proto = Date.prototype as unknown as Record<string, (...args: unknown[]) => string>;
    const methods = ['toLocaleDateString', 'toLocaleTimeString', 'toLocaleString'];
    const saved = methods.map((name) => proto[name]!);
    let made = 0;
    Intl.DateTimeFormat = new Proxy(Real, {
      construct: (target, args) => (made++, Reflect.construct(target, args)),
      apply: (target, self, args) => (made++, Reflect.apply(target, self, args)),
    });
    methods.forEach((name, i) => {
      proto[name] = function (this: Date, ...args: unknown[]) {
        made++;
        return saved[i]!.apply(this, args);
      };
    });
    try {
      run();
    } finally {
      Intl.DateTimeFormat = Real;
      methods.forEach((name, i) => (proto[name] = saved[i]!));
    }
    return made;
  }

  it('of a chart of the latest date builds no date formatter once the chart is drawn, however many labels it writes', () => {
    const fields: FigureField[] = [...TILE_FIELDS, { key: 'due', type: 'date', label: 'Due' }];
    const day = (n: number) => Date.UTC(2026, 0, 1 + n) / 1000;
    const result = chartResult({ [uuid(1)]: Array.from({ length: 40 }, (_, i) => bucketOf(`k${i}`, day(i * 3))) });
    const latest = [measure(1, { fn: 'max', field: 'due', primary: true })];
    const [columns] = chartPanels(chartTile('column', latest), result, fields, kitText('en'), 'en', true);
    const [lines] = chartPanels(chartTile('line', latest), result, fields, kitText('en'), 'en', true);
    layoutBars(columns!, SIZE, NONE);
    for (const tick of layoutLines(lines!, SIZE, NONE).valueTicks) expect(tick.label, 'its scale is in dates').toMatch(/^[A-Z][a-z]{2} \d{2}, \d{4}$/);

    const resized = dateFormattersBuilt(() => {
      for (const width of [320, 480, 640, 800]) {
        layoutBars(columns!, { width, height: 240 }, NONE);
        layoutLines(lines!, { width, height: 240 }, NONE);
      }
    });
    expect(resized).toBe(0);
  });
});
