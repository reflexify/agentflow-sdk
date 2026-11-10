import { arc, curveLinear, curveMonotoneX, line, pie } from 'd3-shape';
import type { CurveFactory, PieArcDatum } from 'd3-shape';
import { scaleBand, scaleLinear } from 'd3-scale';
import type { ScaleBand } from 'd3-scale';
import { KIT_TEXT } from '../text.js';
import type { KitStrings } from '../text.js';
import { hasSlice, paint } from './chart-model.js';
import type { ChartBucket, ChartModel, Pattern } from './chart-model.js';
import type { AfDrillTarget } from './types.js';

export interface Size {
  width: number;
  height: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Tick {
  at: number;
  label: string;
  full: string;
}

export interface BarMark extends Box {
  series: number;
  bucket: number;
  kind: 'value' | 'previous' | 'filled';
  fill: string;
  opacity: number;
  pattern: Pattern;
  drill: AfDrillTarget | null;
  summary: string;
}

export interface TargetMark {
  bucket: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** The name of a panel's unit, written above the top left of its plot. */
export interface UnitMark {
  x: number;
  y: number;
  text: string;
}

/** A bucket's value and its share or formula, written past the end of its bar or above its column. */
export interface BarLabel {
  bucket: number;
  x: number;
  y: number;
  text: string;
  anchor: 'start' | 'middle';
}

/** A running total drawn through the bars: one line, broken where a bucket has no figure, and a dot on each figure. */
export interface RunningLayout {
  d: string;
  dots: { bucket: number; cx: number; cy: number; hollow: boolean }[];
}

export interface BarLayout {
  plot: Box;
  marks: BarMark[];
  targets: TargetMark[];
  labels: BarLabel[];
  running: RunningLayout | null;
  valueTicks: Tick[];
  categoryTicks: Tick[];
  zero: number;
  hits: Box[];
  unit: UnitMark | null;
}

/** What the axes draw. */
export type AxesLayout = Pick<BarLayout, 'plot' | 'valueTicks' | 'categoryTicks' | 'unit'>;

export interface LinePath {
  series: number;
  kind: 'value' | 'previous' | 'target' | 'running';
  d: string;
  stroke: string;
  opacity: number;
  dashed: boolean;
}

export interface LineDot {
  series: number;
  bucket: number;
  cx: number;
  cy: number;
  hollow: boolean;
  stroke: string;
  drill: AfDrillTarget | null;
  summary: string;
}

export interface LineLabel {
  series: number;
  x: number;
  y: number;
  text: string;
}

export interface LineLayout {
  plot: Box;
  paths: LinePath[];
  dots: LineDot[];
  labels: LineLabel[];
  valueTicks: Tick[];
  categoryTicks: Tick[];
  bucketX: number[];
  /** The y of the value 0, when the axis runs from below it to above it. */
  zero: number | null;
  hits: Box[];
  unit: UnitMark | null;
}

/** What a panel of small multiples does differently from a chart that stands alone. */
export interface PanelOptions {
  /** The width of the value axis at the left of a column or line chart, so every panel puts its buckets at the same x. */
  valueGutter?: number;
  /** Whether a column or line chart labels its categories. A panel above another leaves them to the last, and takes a thinner margin. A bar chart labels every panel. */
  categoryLabels?: boolean;
  /** The name of the unit the panel's scale is in. */
  unitLabel?: string | null;
}

/** The estimated width of a character at the 11 px axis size. Text is never measured: jsdom has no layout. */
const CHAR = 6.2;
const MARGIN = 8;
const AXIS_BELOW = 24;
const UNIT_ROOM = 14;
const UNIT_BASELINE = 11;
const GUTTER_PAD = 14;
const GUTTER_MAX = 120;
const FILLED_LENGTH = 3;
const EARLIER_OPACITY = 0.35;
const LINE_EARLIER_OPACITY = 0.4;
const LABEL_GAP = 8;
/** The gap between a bar and the figure written past it, and the room a column chart keeps above its plot for one. */
const FIGURE_GAP = 4;
const FIGURE_ROOM = 14;
const RUNNING_OPACITY = 0.7;
const LABEL_SPACING = 12;
const TICK_GAP = 8;
/** The least room a value label stacked up the side of a plot takes: one 12 px line of text, with air. */
const TICK_ROOM = 20;

const finite = (v: number | null | undefined): v is number => v !== null && v !== undefined && Number.isFinite(v);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const length = (text: string) => [...text].length;
/** The centre nearest `at` that keeps something `half` wide on either side of it inside `0..room`. */
const within = (at: number, half: number, room: number) => Math.min(room - half, Math.max(half, at));

/** A derived figure belongs to the primary series, or to the whole stack, so it is drawn only while that is showing. */
const derivedShown = (model: ChartModel, hidden: ReadonlySet<number>) => (model.stacked ? hidden.size < model.series.length : !hidden.has(0));

/** The earlier period is drawn with the primary series, so long as that series is showing. A stack has none, and a line is never stacked. */
const earlierDrawn = (model: ChartModel, hidden: ReadonlySet<number>) =>
  model.compared && model.series.length > 0 && !hidden.has(0) && (model.type === 'line' || !model.stacked);

export function valueDomain(model: ChartModel, hidden: ReadonlySet<number>): [number, number] {
  const isLine = model.type === 'line';
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  const take = (v: number | null | undefined) => {
    if (!finite(v)) return;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  };
  if (!isLine) take(0);
  const visible = model.series.map((_, i) => i).filter((i) => !hidden.has(i));
  const previous = earlierDrawn(model, hidden);
  const running = model.derive?.kind === 'running_total' && derivedShown(model, hidden);
  for (const bucket of model.buckets) {
    if (model.stacked && !isLine) {
      let up = 0;
      let down = 0;
      for (const i of visible) {
        const v = bucket.values[i];
        if (!finite(v)) continue;
        if (v >= 0) up += v;
        else down += v;
      }
      take(up);
      take(down);
    } else {
      for (const i of visible) take(bucket.values[i]);
    }
    if (previous) take(bucket.previous);
    take(bucket.target);
    if (running) take(bucket.derived);
  }
  if (!Number.isFinite(lo)) return [0, 1];
  const [from, to] = scaleLinear().domain([lo, hi]).nice().domain() as [number, number];
  return from === 0 && to === 0 ? [0, 1] : [from, to];
}

/** Cuts a label to what `room` px holds, marking the cut with an ellipsis. */
function fit(label: string, room: number): string {
  const chars = Math.max(1, Math.floor(room / CHAR + 1e-9));
  const letters = [...label];
  return letters.length <= chars ? label : `${letters.slice(0, chars - 1).join('')}…`;
}

/** The indexes of the column labels to show: the first, the last, and every `every`-th between them. When the last is nearer than `every` to the label before it, that label gives way, unless it is the first. */
function shownLabels(count: number, every: number): number[] {
  const last = count - 1;
  const shown: number[] = [];
  for (let i = 0; i <= last; i += every) shown.push(i);
  if (shown[shown.length - 1] !== last) {
    if (shown.length > 1 && last - shown[shown.length - 1]! < every) shown.pop();
    shown.push(last);
  }
  return shown;
}

/**
 * The value axis: about five ticks. Along the bottom of a bar chart the labels sit side by side, so `along` gives the width the
 * axis has once its last label has hung out past the plot, and ticks are dropped until a label has its own width and a gap
 * to itself. Up the side of a column or line chart they stack, so `up` gives the plot's height and ticks are dropped until
 * each has `TICK_ROOM` of it, keeping two: zero and the top. The scale is asked for fewer ticks rather than having some
 * thrown away, so the labels stay round numbers. When no count gives at least two that fit (a scale asked for one tick over
 * `[0, 4000]` answers `[0]` alone), the axis shows the two ends of its domain, which are round once niced.
 */
function valueAxis(
  model: ChartModel,
  hidden: ReadonlySet<number>,
  along: ((widest: number) => number) | null = null,
  up: number | null = null,
) {
  const [lo, hi] = valueDomain(model, hidden);
  const scale = scaleLinear().domain([lo, hi]);
  const most = up === null ? Number.POSITIVE_INFINITY : Math.max(2, Math.floor(up / TICK_ROOM));
  for (let count = 5; ; count--) {
    let ticks = scale.ticks(count);
    if (up !== null && lo !== hi && (ticks.length > most || ticks.length < 2)) {
      if (count > 1) continue;
      ticks = [lo, hi];
    }
    const labels = ticks.map((t) => model.format(t));
    const widest = Math.max(0, ...labels.map(length));
    const done = { lo, hi, ticks, labels, widest };
    if (!along || count <= 1 || ticks.length < 2) return done;
    const step = (Math.abs(ticks[1]! - ticks[0]!) / (hi - lo)) * Math.max(0, along(widest));
    if (step >= CHAR * widest + TICK_GAP) return done;
  }
}

/** The gutter at the left of a column or line chart, sized by its widest value label. */
const valueGutter = (widest: number) => clamp(CHAR * widest + GUTTER_PAD, 56, GUTTER_MAX);

/** The widest value gutter across the panels, so a bucket sits at the same x in each. A bar chart's value axis runs along the bottom, so it has none. */
export function panelGutter(models: readonly ChartModel[], hidden: ReadonlySet<number>): number {
  let widest = -1;
  for (const model of models) if (model.type !== 'bar') widest = Math.max(widest, valueAxis(model, hidden).widest);
  return widest < 0 ? 0 : valueGutter(widest);
}

/** The top of a plot, below the margin and the name of its unit. */
const plotTop = (options: PanelOptions | undefined) => MARGIN + (options?.unitLabel ? UNIT_ROOM : 0);
const unitMark = (options: PanelOptions | undefined, plot: Box): UnitMark | null => (options?.unitLabel ? { x: plot.x, y: UNIT_BASELINE, text: options.unitLabel } : null);

/** The margin at the right of the axis along the bottom: its last label is centred on a band, so half of it can hang out past the plot. */
const hangingMargin = (chars: number) => Math.max(MARGIN, Math.ceil((CHAR * chars) / 2));
const lastLabelChars = (labels: string[]) => Math.min(length(labels[labels.length - 1] ?? ''), Math.floor((GUTTER_MAX - GUTTER_PAD) / CHAR));

const bandOf = (count: number, range: [number, number]) =>
  scaleBand<number>()
    .domain(Array.from({ length: count }, (_, i) => i))
    .range(range)
    .paddingInner(0.2)
    .paddingOuter(0.1);

/** The category ticks along the bottom of a column or line chart. */
function columnTicks(labels: string[], band: ScaleBand<number>): Tick[] {
  const step = band.step();
  const widest = Math.min(CHAR * Math.max(0, ...labels.map(length)), GUTTER_MAX - GUTTER_PAD);
  const every = step > 0 ? Math.max(1, Math.ceil(widest / step)) : Math.max(1, labels.length);
  const shown = labels.length > 0 ? shownLabels(labels.length, every) : [];
  // A label is centred on its band, so it has the distance to its nearest shown neighbour. It never has more than `every` bands,
  // which is what the margins at the ends of the axis were sized for.
  const roomOf = (k: number) => {
    const gaps = [every];
    if (k > 0) gaps.push(shown[k]! - shown[k - 1]!);
    if (k < shown.length - 1) gaps.push(shown[k + 1]! - shown[k]!);
    return Math.min(...gaps) * step;
  };
  return shown.map((i, k) => ({ at: (band(i) ?? 0) + band.bandwidth() / 2, label: fit(labels[i]!, roomOf(k)), full: labels[i]! }));
}

/** The strip of the plot each bucket answers a pointer over: its band and half the gap to each neighbour, so the strips meet. */
function stripsOf(band: ScaleBand<number>, count: number, plot: Box, horizontal: boolean): Box[] {
  const step = band.step();
  const pad = (step - band.bandwidth()) / 2;
  return Array.from({ length: count }, (_, b) => {
    const start = (band(b) ?? 0) - pad;
    return horizontal ? { x: plot.x, y: start, width: plot.width, height: step } : { x: start, y: plot.y, width: step, height: plot.height };
  });
}

type Point = readonly [x: number, y: number];
/** One straight line through the points, broken at a null. */
const polyline = line<Point | null>()
  .defined((p) => p !== null)
  .x((p) => p![0])
  .y((p) => p![1])
  .digits(3);

/** The widest text in `texts`, in characters. */
function widestOf(texts: readonly (string | null)[]): number {
  let widest = 0;
  for (const t of texts) if (t !== null) widest = Math.max(widest, length(t));
  return widest;
}

type Slot = { series: number; kind: 'value' | 'previous' };

export function layoutBars(
  model: ChartModel,
  size: Size,
  hidden: ReadonlySet<number>,
  text: Pick<Required<KitStrings>, 'tileEarlier' | 'tileFilled'> = KIT_TEXT.en,
  options?: PanelOptions,
): BarLayout {
  const horizontal = model.type === 'bar';
  const width = finite(size.width) ? Math.max(0, size.width) : 0;
  const height = finite(size.height) ? Math.max(0, size.height) : 0;

  // A rank is written before its category, in every panel, so every panel's margins are the same.
  const labels = model.buckets.map((b, i) => (model.ranks[i] ? `${model.ranks[i]} ${b.label}` : b.label));
  const categoryGutter = clamp(CHAR * Math.max(0, ...labels.map(length)) + GUTTER_PAD, 48, GUTTER_MAX);
  // The figure past a bar needs a margin of its own; one above a column a row above the plot. A column's right margin is the same in every panel, so a figure that reaches past the plot is moved in instead.
  const widest = widestOf(model.beside);
  const writes = widest > 0;
  const figureMargin = writes && horizontal ? Math.min(GUTTER_MAX, FIGURE_GAP + Math.ceil(CHAR * widest)) : 0;
  const labelled = horizontal || options?.categoryLabels !== false;
  const top = plotTop(options) + (writes && !horizontal ? FIGURE_ROOM : 0);
  const plotHeight = Math.max(0, height - top - (labelled ? AXIS_BELOW : MARGIN));
  const { lo, hi, ticks, labels: tickLabels, widest: longestTick } = valueAxis(
    model,
    hidden,
    horizontal ? (chars) => width - categoryGutter - Math.max(hangingMargin(chars), figureMargin) : null,
    horizontal ? null : plotHeight,
  );

  const left = horizontal ? categoryGutter : (options?.valueGutter ?? valueGutter(longestTick));
  const right = Math.max(hangingMargin(horizontal ? longestTick : lastLabelChars(labels)), figureMargin);
  const plot: Box = {
    x: left,
    y: top,
    width: Math.max(0, width - left - right),
    height: plotHeight,
  };

  const scale = scaleLinear()
    .domain([lo, hi])
    .range(horizontal ? [plot.x, plot.x + plot.width] : [plot.y + plot.height, plot.y]);
  const band = bandOf(model.buckets.length, horizontal ? [plot.y, plot.y + plot.height] : [plot.x, plot.x + plot.width]);
  const bandwidth = band.bandwidth();
  const zero = scale(0);
  // A column's figure is centred over its bar, so once the widest is wider than a bucket's share of the plot the labels run into each other. Each then writes its figure alone.
  const beside = !horizontal && CHAR * widest + FIGURE_GAP > band.step() ? model.alone : model.beside;

  const visible = model.series.map((_, i) => i).filter((i) => !hidden.has(i));
  const slots: Slot[] = [];
  if (model.stacked) slots.push({ series: -1, kind: 'value' });
  else {
    for (const i of visible) {
      slots.push({ series: i, kind: 'value' });
      if (i === 0 && earlierDrawn(model, hidden)) slots.push({ series: 0, kind: 'previous' });
    }
  }
  const sub = scaleBand<number>()
    .domain(slots.map((_, k) => k))
    .range([0, bandwidth])
    .paddingInner(0.1);

  /** A box over the value interval `[from, to]`, in the slot's share of the band that starts at `start`. */
  const boxOf = (from: number, to: number, start: number, offset: number, across: number): Box => {
    const a = scale(from);
    const b = scale(to);
    const thick = Math.max(1, across);
    const place = start + offset - (thick - across) / 2;
    const near = Math.min(a, b);
    const long = Math.abs(b - a);
    return horizontal ? { x: near, y: place, width: long, height: thick } : { x: place, y: near, width: thick, height: long };
  };

  const slotAt = (k: number) => (slots.length === 1 ? { offset: 0, across: bandwidth } : { offset: sub(k) ?? 0, across: sub.bandwidth() });
  const wording = (bucket: ChartBucket, label: string, value: number) => `${bucket.label}, ${label}: ${model.format(value)}`;
  const patternFor = (bucket: ChartBucket, own: Pattern): Pattern => (model.stacked ? own : bucket.restricted ? 'restricted' : bucket.other ? 'other' : own);

  const subject = derivedShown(model, hidden);
  const marks: BarMark[] = [];
  const targets: TargetMark[] = [];
  const written: BarLabel[] = [];
  model.buckets.forEach((bucket, b) => {
    const start = band(b) ?? 0;
    const from = marks.length;

    if (bucket.filled && visible.length > 0) {
      const first = model.series[visible[0]!]!;
      const share = slots.length > 1 && slots.some((s) => s.kind === 'previous') ? slotAt(0) : { offset: 0, across: bandwidth };
      const box = horizontal
        ? { x: zero, y: start + share.offset, width: FILLED_LENGTH, height: Math.max(1, share.across) }
        : { x: start + share.offset, y: zero - FILLED_LENGTH, width: Math.max(1, share.across), height: FILLED_LENGTH };
      marks.push({ ...box, series: visible[0]!, bucket: b, kind: 'filled', fill: paint(first.color), opacity: 1, pattern: null, drill: null, summary: `${bucket.label}, ${first.label}: ${text.tileFilled}` });
    }

    if (model.stacked) {
      let up = 0;
      let down = 0;
      const { offset, across } = slotAt(0);
      if (!bucket.filled) {
        for (const i of visible) {
          const v = bucket.values[i];
          if (!finite(v)) continue;
          const series = model.series[i]!;
          const [from, to] = v >= 0 ? [up, up + v] : [down + v, down];
          if (v >= 0) up += v;
          else down += v;
          marks.push({ ...boxOf(from, to, start, offset, across), series: i, bucket: b, kind: 'value', fill: paint(series.color), opacity: 1, pattern: series.pattern, drill: bucket.drills[i] ?? null, summary: wording(bucket, series.label, v) });
        }
      }
    } else {
      slots.forEach((slot, k) => {
        const { offset, across } = slotAt(k);
        const series = model.series[slot.series]!;
        if (slot.kind === 'previous') {
          const p = bucket.previous;
          if (!finite(p)) return;
          const summary = `${bucket.label}, ${series.label} (${text.tileEarlier}): ${model.format(p)}`;
          marks.push({ ...boxOf(Math.min(0, p), Math.max(0, p), start, offset, across), series: slot.series, bucket: b, kind: 'previous', fill: paint(series.color), opacity: EARLIER_OPACITY, pattern: patternFor(bucket, series.pattern), drill: null, summary });
          return;
        }
        const v = bucket.values[slot.series];
        if (!finite(v) || bucket.filled) return;
        marks.push({ ...boxOf(Math.min(0, v), Math.max(0, v), start, offset, across), series: slot.series, bucket: b, kind: 'value', fill: paint(series.color), opacity: 1, pattern: patternFor(bucket, series.pattern), drill: bucket.drills[slot.series] ?? null, summary: wording(bucket, series.label, v) });
      });
    }

    if (finite(bucket.target)) {
      const at = scale(bucket.target);
      const from = start + bandwidth * 0.1;
      const to = start + bandwidth * 0.9;
      targets.push(horizontal ? { bucket: b, x1: at, y1: from, x2: at, y2: to } : { bucket: b, x1: from, y1: at, x2: to, y2: at });
    }

    const figure = beside[b];
    if (figure && subject) {
      // Past the far end of the bucket's lead marks, or at the zero line when it has none.
      let end = zero;
      let mid = start + bandwidth / 2;
      for (let k = from; k < marks.length; k++) {
        const mark = marks[k]!;
        if (mark.kind === 'previous' || !(model.stacked || mark.series === 0)) continue;
        end = horizontal ? Math.max(end, mark.x + mark.width) : Math.min(end, mark.y);
        if (!model.stacked) mid = horizontal ? mark.y + mark.height / 2 : mark.x + mark.width / 2;
      }
      written.push(
        horizontal
          ? { bucket: b, x: end + FIGURE_GAP, y: mid, text: fit(figure, width - (end + FIGURE_GAP)), anchor: 'start' }
          : { bucket: b, x: within(mid, (CHAR * length(figure)) / 2, width), y: end - FIGURE_GAP, text: figure, anchor: 'middle' },
      );
    }
  });

  let running: RunningLayout | null = null;
  if (model.derive?.kind === 'running_total' && subject) {
    const at = (b: number) => (band(b) ?? 0) + bandwidth / 2;
    const dots = model.buckets.flatMap((bucket, b) =>
      finite(bucket.derived)
        ? [{ bucket: b, cx: horizontal ? scale(bucket.derived) : at(b), cy: horizontal ? at(b) : scale(bucket.derived), hollow: bucket.filled }]
        : [],
    );
    if (dots.length > 0) {
      const points = Array.from({ length: model.buckets.length }, (): Point | null => null);
      for (const dot of dots) points[dot.bucket] = [dot.cx, dot.cy];
      running = { d: polyline(points) ?? '', dots };
    }
  }

  const categoryTicks: Tick[] = horizontal
    ? labels.map((label, i) => ({ at: (band(i) ?? 0) + bandwidth / 2, label: fit(label, left - GUTTER_PAD), full: label }))
    : labelled
      ? columnTicks(labels, band)
      : [];

  return {
    plot,
    marks,
    targets,
    labels: written,
    running,
    valueTicks: ticks.map((t, i) => ({ at: scale(t), label: tickLabels[i]!, full: tickLabels[i]! })),
    categoryTicks,
    zero,
    hits: stripsOf(band, model.buckets.length, plot, horizontal),
    unit: unitMark(options, plot),
  };
}

const OTHER = 'var(--k-chart-other)';
const round = (v: number) => Math.round(v * 1000) / 1000;

/** Two to four visible series are named at their ends. Fewer need no name and more would crowd each other. */
const namedAtTheEnd = (visible: number[]) => visible.length >= 2 && visible.length <= 4;

export function layoutLines(
  model: ChartModel,
  size: Size,
  hidden: ReadonlySet<number>,
  text: Pick<Required<KitStrings>, 'tileFilled'> = KIT_TEXT.en,
  options?: PanelOptions,
): LineLayout {
  const width = finite(size.width) ? Math.max(0, size.width) : 0;
  const height = finite(size.height) ? Math.max(0, size.height) : 0;

  const labelled = options?.categoryLabels !== false;
  const top = plotTop(options);
  const plotHeight = Math.max(0, height - top - (labelled ? AXIS_BELOW : MARGIN));
  const axis = valueAxis(model, hidden, null, plotHeight);
  const labels = model.buckets.map((b) => b.label);
  const count = model.buckets.length;
  const visible = model.series.map((_, i) => i).filter((i) => !hidden.has(i));
  const valueAt = (b: number, series: number) => {
    const v = model.buckets[b]!.values[series];
    return finite(v) ? v : null;
  };
  const lastPoint = (series: number) => {
    for (let b = count - 1; b >= 0; b--) if (valueAt(b, series) !== null) return b;
    return -1;
  };

  // A panel leaves its series to the legend: a name at the end would widen the plot of that panel alone, and move its buckets off the others'.
  const named = !options && namedAtTheEnd(visible) ? visible.filter((i) => lastPoint(i) >= 0) : [];
  const gutter = named.length > 0 ? clamp(CHAR * Math.max(...named.map((i) => length(model.series[i]!.label))) + LABEL_GAP, 0, GUTTER_MAX) : 0;

  const left = options?.valueGutter ?? valueGutter(axis.widest);
  const right = Math.max(hangingMargin(lastLabelChars(labels)), gutter);
  const plot: Box = {
    x: left,
    y: top,
    width: Math.max(0, width - left - right),
    height: plotHeight,
  };

  const scale = scaleLinear().domain([axis.lo, axis.hi]).range([plot.y + plot.height, plot.y]);
  const band = bandOf(count, [plot.x, plot.x + plot.width]);
  const bucketX = model.buckets.map((_, b) => (band(b) ?? 0) + band.bandwidth() / 2);
  const colorOf = (series: number) => paint(model.series[series]!.color) || OTHER;

  const indexes = Array.from({ length: count }, (_, b) => b);
  const half = clamp(band.bandwidth() * 0.4, 3, 24);
  /** One path over the buckets that have a figure, broken at those that have none. With `ticked`, a figure with no neighbour has no line to show it, so it is a short tick. */
  const draw = (points: (number | null)[], ticked: boolean, curve: CurveFactory = curveMonotoneX): string => {
    const has = (b: number) => points[b] !== null && points[b] !== undefined;
    const alone = (b: number) => ticked && has(b) && !has(b - 1) && !has(b + 1);
    const run = line<number>()
      .defined((b) => has(b) && !alone(b))
      .x((b) => bucketX[b]!)
      .y((b) => scale(points[b]!))
      .curve(curve)(indexes);
    const ticks = indexes.filter(alone).map((b) => {
      const y = round(scale(points[b]!));
      return `M${round(bucketX[b]! - half)},${y}L${round(bucketX[b]! + half)},${y}`;
    });
    return `${run ?? ''}${ticks.join('')}`;
  };
  const orNull = (v: number | null) => (finite(v) ? v : null);

  const paths: LinePath[] = [];
  if (earlierDrawn(model, hidden)) {
    const d = draw(model.buckets.map((b) => orNull(b.previous)), true);
    if (d) paths.push({ series: 0, kind: 'previous', d, stroke: colorOf(0), opacity: LINE_EARLIER_OPACITY, dashed: false });
  }
  const goal = draw(model.buckets.map((b) => orNull(b.target)), true);
  if (goal) paths.push({ series: -1, kind: 'target', d: goal, stroke: 'var(--k-fg)', opacity: 1, dashed: true });
  const dots: LineDot[] = [];
  for (const i of visible) {
    const d = draw(model.buckets.map((_, b) => valueAt(b, i)), false);
    if (d) paths.push({ series: i, kind: 'value', d, stroke: colorOf(i), opacity: 1, dashed: false });
    const series = model.series[i]!;
    model.buckets.forEach((bucket, b) => {
      const v = valueAt(b, i);
      if (v === null) return;
      dots.push({
        series: i,
        bucket: b,
        cx: bucketX[b]!,
        cy: scale(v),
        hollow: bucket.filled,
        stroke: colorOf(i),
        drill: bucket.filled ? null : (bucket.drills[i] ?? null),
        summary: `${bucket.label}, ${series.label}: ${bucket.filled ? text.tileFilled : model.format(v)}`,
      });
    });
  }

  if (model.derive?.kind === 'running_total' && derivedShown(model, hidden)) {
    const d = draw(model.buckets.map((b) => orNull(b.derived)), true, curveLinear);
    if (d) paths.push({ series: -1, kind: 'running', d, stroke: 'var(--k-fg)', opacity: RUNNING_OPACITY, dashed: false });
  }

  const placed = named.map((i) => {
    const b = lastPoint(i);
    return { series: i, x: bucketX[b]! + LABEL_GAP, y: scale(valueAt(b, i)!), text: fit(model.series[i]!.label, gutter - LABEL_GAP) };
  });
  // Labels are spread from the top down, then drawn back up if the lowest has left the plot.
  const order = [...placed].sort((a, b) => a.y - b.y || a.series - b.series);
  for (let k = 1; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, order[k - 1]!.y + LABEL_SPACING);
  let limit = plot.y + plot.height;
  for (let k = order.length - 1; k >= 0; k--) {
    order[k]!.y = Math.min(order[k]!.y, limit);
    limit = order[k]!.y - LABEL_SPACING;
  }

  return {
    plot,
    paths,
    dots,
    labels: placed,
    valueTicks: axis.ticks.map((t, i) => ({ at: scale(t), label: axis.labels[i]!, full: axis.labels[i]! })),
    categoryTicks: labelled ? columnTicks(labels, band) : [],
    bucketX,
    // At an end of the axis, zero is the plot's own edge and already drawn as one.
    zero: axis.lo < 0 && axis.hi > 0 ? scale(0) : null,
    hits: stripsOf(band, count, plot, false),
    unit: unitMark(options, plot),
  };
}

export interface SliceMark {
  bucket: number;
  d: string;
  fill: string;
  pattern: Pattern;
  drill: AfDrillTarget | null;
  summary: string;
}

/** A pie drawn about `(cx, cy)`: each path is relative to that point. */
export interface PieLayout {
  cx: number;
  cy: number;
  outer: number;
  inner: number;
  slices: SliceMark[];
}

const PIE_INSET = 8;
const DONUT_HOLE = 0.55;
/** Angles run from 12 o'clock, clockwise, in the order the buckets come: a slice is never sorted by its size. */
const angles = pie<number>().sort(null);

export function layoutPie(model: ChartModel, size: Size): PieLayout {
  const width = finite(size.width) ? Math.max(0, size.width) : 0;
  const height = finite(size.height) ? Math.max(0, size.height) : 0;
  const outer = Math.max(0, Math.min(width, height) / 2 - PIE_INSET);
  const inner = model.type === 'donut' ? DONUT_HOLE * outer : 0;
  const shape = arc<PieArcDatum<number>>().innerRadius(inner).outerRadius(outer);

  const drawn: number[] = [];
  for (let b = 0; b < model.buckets.length; b++) if (hasSlice(model.buckets[b]!)) drawn.push(b);
  const slices = angles(drawn.map((b) => model.buckets[b]!.values[0]!)).map((angle, k): SliceMark => {
    const bucket = drawn[k]!;
    const b = model.buckets[bucket]!;
    const slice = model.slices[bucket]!;
    return {
      bucket,
      d: shape(angle) ?? '',
      fill: paint(slice.color),
      pattern: slice.pattern,
      drill: b.drills[0] ?? null,
      summary: `${b.label}: ${model.format(b.values[0]!)} (${slice.share})`,
    };
  });
  return { cx: width / 2, cy: height / 2, outer, inner, slices };
}
