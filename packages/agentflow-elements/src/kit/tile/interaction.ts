import { formatPercentChange } from '@reflexify/agentflow-sdk/figures';
import type { FigureColor } from '@reflexify/agentflow-sdk/figures';
import { fill } from '../text.js';
import type { KitStrings } from '../text.js';
import { hasSlice } from './chart-model.js';
import type { ChartModel, ChartSeries, Pattern } from './chart-model.js';
import { formatCount, isPie } from './frame.js';
import type { AfDrillTarget } from './types.js';

type Text = Required<KitStrings>;

export interface Focus {
  bucket: number;
  series: number;
}

/** What a mark offers the keyboard and the pointer: where it is, and what it opens. */
export interface Pressable {
  bucket: number;
  series: number;
  drill: AfDrillTarget | null;
}

export interface TooltipModel {
  title: string;
  rows: { label: string; value: string; color: FigureColor | null; pattern: Pattern }[];
  target: string | null;
  earlier: string | null;
  change: string | null;
  total: string | null;
  /** A pie slice's share of the whole. */
  share: string | null;
  /** The derived figure of the bucket, under the name the chart gives it. */
  derived: { label: string; value: string } | null;
  hint: string | null;
}

/** Whether a press asks for the record in a new tab, as for a link: the middle button, or ctrl, meta or shift held. Enter or Space on a chart mark asks by its held modifier too, as the browser's click for them does on a native button. */
export const asksNewTab = (e: Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'> & { button?: number }): boolean => e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey;

/** Whether a press opens at all: a click, or the middle button's `auxclick`. Any other button's `auxclick` is not a press, as a right click is the context menu's. */
export const presses = (e: MouseEvent): boolean => e.type !== 'auxclick' || e.button === 1;

/** A middle press on something that opens starts no autoscroll, as on a link: its `auxclick` opens it in a new tab. */
export function holdMiddle(e: MouseEvent): void {
  if (e.button === 1) e.preventDefault();
}

const finite = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

const visibleOf = (model: ChartModel, hidden: ReadonlySet<number>) => model.series.flatMap((_, i) => (hidden.has(i) ? [] : [i]));

/** Whether the chart draws a mark for this series in this bucket: the one a keyboard can reach. A period with no records is one outline, on the first series showing. A pie has a mark for each slice. */
export function hasMark(model: ChartModel, hidden: ReadonlySet<number>, bucket: number, series: number): boolean {
  const b = model.buckets[bucket];
  if (!b || !model.series[series] || hidden.has(series)) return false;
  if (isPie(model.type)) return hasSlice(b);
  if (b.filled && model.type !== 'line') return visibleOf(model, hidden)[0] === series;
  return finite(b.values[series]);
}

export const isNavigation = (key: string) => key.startsWith('Arrow') || key === 'Home' || key === 'End';

/** The first index from `from` in direction `by` that `ok` accepts, never wrapping. */
function seek(from: number, by: 1 | -1, count: number, ok: (n: number) => boolean): number | null {
  for (let n = from + by; n >= 0 && n < count; n += by) if (ok(n)) return n;
  return null;
}

/** A pie is one series, so up and down step through its slices as left and right do. */
const alongPie = (key: string) => (key === 'ArrowUp' ? 'ArrowLeft' : key === 'ArrowDown' ? 'ArrowRight' : key);

/** Arrows step along the buckets (down the page for a bar chart) and across the series; Home and End go to the first and last bucket. A bucket with no mark for the series is skipped, and nothing wraps. Any other key, or no place to go, returns `focus` itself. */
export function moveFocus(focus: Focus, key: string, model: ChartModel, hidden: ReadonlySet<number>): Focus {
  const bars = model.type === 'bar';
  const [before, after]: [string, string] = bars ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
  const [lower, higher]: [string, string] = bars ? ['ArrowLeft', 'ArrowRight'] : model.stacked ? ['ArrowDown', 'ArrowUp'] : ['ArrowUp', 'ArrowDown'];
  const buckets = model.buckets.length;
  const bucketHas = (n: number) => hasMark(model, hidden, n, focus.series);
  const seriesHas = (n: number) => hasMark(model, hidden, focus.bucket, n);
  const toBucket = (n: number | null): Focus => (n === null || n === focus.bucket ? focus : { bucket: n, series: focus.series });
  const toSeries = (n: number | null): Focus => (n === null || n === focus.series ? focus : { bucket: focus.bucket, series: n });

  switch (isPie(model.type) ? alongPie(key) : key) {
    case before: return toBucket(seek(focus.bucket, -1, buckets, bucketHas));
    case after: return toBucket(seek(focus.bucket, 1, buckets, bucketHas));
    case lower: return toSeries(seek(focus.series, -1, model.series.length, seriesHas));
    case higher: return toSeries(seek(focus.series, 1, model.series.length, seriesHas));
    case 'Home': return toBucket(seek(-1, 1, buckets, bucketHas));
    case 'End': return toBucket(seek(buckets, -1, buckets, bucketHas));
    default: return focus;
  }
}

/** The mark that takes the tab stop: `focus` while it still has a mark, else the nearest one that does, by buckets first. With no focus yet it is the first mark. No marks at all gives null. */
export function clampFocus(focus: Focus | null, model: ChartModel, hidden: ReadonlySet<number>): Focus | null {
  if (focus && hasMark(model, hidden, focus.bucket, focus.series)) return focus;
  const from = focus ?? { bucket: 0, series: 0 };
  let best: Focus | null = null;
  let near: [number, number] = [Infinity, Infinity];
  for (let bucket = 0; bucket < model.buckets.length; bucket++) {
    for (let series = 0; series < model.series.length; series++) {
      if (!hasMark(model, hidden, bucket, series)) continue;
      const away: [number, number] = [Math.abs(bucket - from.bucket), Math.abs(series - from.series)];
      if (away[0] < near[0] || (away[0] === near[0] && away[1] < near[1])) {
        best = { bucket, series };
        near = away;
      }
    }
  }
  return best;
}

export const isIsolated = (hidden: ReadonlySet<number>, series: number, count: number) => count > 1 && hidden.size === count - 1 && !hidden.has(series);

/** Hides every series but this one, or shows them all when this one is already alone. */
export function toggleIsolation(hidden: ReadonlySet<number>, series: number, count: number): Set<number> {
  if (isIsolated(hidden, series, count)) return new Set();
  return new Set(Array.from({ length: count }, (_, i) => i).filter((i) => i !== series));
}

const identity = (s: ChartSeries) => JSON.stringify([s.measure, s.segment]);

/** The legend only holds nothing hidden or all but one hidden, so a new model keeps the one series that was alone, found by measure and segment, and hides every other series, new ones included. When it is gone, or has nothing left to be isolated from, every series is shown. */
export function keepIsolation(hidden: ReadonlySet<number>, before: ChartModel, after: ChartModel): Set<number> {
  const count = before.series.length;
  const alone = count > 1 && hidden.size === count - 1 ? before.series.findIndex((_, i) => !hidden.has(i)) : -1;
  const kept = alone < 0 || after.series.length < 2 ? -1 : after.series.findIndex((s) => identity(s) === identity(before.series[alone]!));
  return kept < 0 ? new Set() : new Set(after.series.flatMap((_, i) => (i === kept ? [] : [i])));
}

/** The drill a click on a bucket's strip opens, and the one its tooltip hint counts: the first visible series with an address, in an unstacked chart; none in a stack, and none for a period with no records, whose marks open nothing though the server addresses it. */
export function stripDrill(model: ChartModel, bucket: number, hidden: ReadonlySet<number>): AfDrillTarget | null {
  const b = model.buckets[bucket];
  if (!b || model.stacked || b.filled) return null;
  for (let i = 0; i < model.series.length; i++) if (!hidden.has(i) && b.drills[i]) return b.drills[i]!;
  return null;
}

/** What a bucket's tooltip says. The count in the hint, and the percent change, follow `locale`. */
export function tooltipOf(
  model: ChartModel,
  bucket: number,
  hidden: ReadonlySet<number>,
  text: Text,
  drill: { enabled: boolean; disabled: boolean },
  locale?: string,
): TooltipModel {
  const b = model.buckets[bucket];
  const shown = visibleOf(model, hidden);
  if (!b) return { title: '', rows: [], target: null, earlier: null, change: null, total: null, share: null, derived: null, hint: null };

  const slice = isPie(model.type) ? model.slices[bucket] : undefined;
  const rows = shown.map((i) => {
    const series = model.series[i]!;
    const value = b.values[i] ?? null;
    const own = model.stacked ? series.pattern : b.restricted ? 'restricted' : b.other ? 'other' : series.pattern;
    const said = value === null ? text.tileNoData : model.stacked ? `${model.format(value)} · ${formatCount(b.counts[i] ?? 0, locale)}` : model.format(value);
    return { label: series.label, value: said, color: slice?.color ?? series.color, pattern: slice ? slice.pattern : own };
  });

  let earlier: string | null = null;
  let change: string | null = null;
  if (model.compared || b.compared) {
    const hasValue = model.stacked ? shown.some((i) => b.values[i] != null) : b.values[0] != null;
    earlier = b.previous === null ? text.tileNew : model.format(b.previous);
    change = b.unmatched ? text.tileUnmatched : !hasValue && b.previous !== null ? text.tileGone : (formatPercentChange(b.percentChange, locale) ?? text.tileNoEarlier);
  }

  const sums = model.stacked ? shown.map((i) => b.values[i]).filter(finite) : [];

  let hint: string | null = null;
  let count: number | null = null;
  if (model.stacked) {
    const opens = shown.flatMap((i) => (b.drills[i] ? [b.drills[i]!] : []));
    if (opens.length > 0) count = opens.reduce((sum, d) => sum + d.count, 0);
  } else if (slice) count = b.drills[0]?.count ?? null;
  else count = stripDrill(model, bucket, hidden)?.count ?? null;
  if (drill.enabled && count !== null) hint = fill(count === 1 ? text.tileOpenRecordsOne : text.tileOpenRecords, { count: formatCount(count, locale) });
  else if (drill.disabled) hint = text.tileDrillOff;

  return {
    title: b.label,
    rows,
    target: finite(b.target) ? model.format(b.target) : null,
    earlier,
    change,
    total: sums.length > 0 ? model.format(sums.reduce((a, v) => a + v, 0)) : null,
    share: slice ? slice.share : null,
    derived: model.derive ? { label: model.derive.label, value: model.formatDerived(b.derived) } : null,
    hint,
  };
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const GAP = 8;
const EDGE = 4;
const within = (v: number, size: number, room: number) => Math.min(Math.max(EDGE, v), Math.max(EDGE, room - size - EDGE));

/** Where a tooltip goes: above its mark, or beside it for a bar chart, flipped to the other side where it would leave the viewport, then held inside it. */
export function placeTooltip(anchor: Rect, tip: { width: number; height: number }, view: { width: number; height: number }, side: 'above' | 'beside'): { left: number; top: number } {
  let left: number;
  let top: number;
  if (side === 'above') {
    left = anchor.left + anchor.width / 2 - tip.width / 2;
    top = anchor.top - GAP - tip.height;
    if (top < EDGE) top = anchor.top + anchor.height + GAP;
  } else {
    left = anchor.left + anchor.width + GAP;
    if (left + tip.width > view.width - EDGE) left = anchor.left - GAP - tip.width;
    top = anchor.top + anchor.height / 2 - tip.height / 2;
  }
  return { left: within(left, tip.width, view.width), top: within(top, tip.height, view.height) };
}
