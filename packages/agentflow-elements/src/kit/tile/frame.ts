import type { components } from '@reflexify/agentflow-sdk';
import {
  capNote,
  coverageNotes,
  echoedMeasure,
  measureNotes,
  measureResult,
  primaryMeasure,
  tileTitle,
} from '@reflexify/agentflow-sdk/figures';
import type { CapNote, CoverageNote, FigureField, FigureMeasure, FigureText } from '@reflexify/agentflow-sdk/figures';
import { fill } from '../text.js';
import type { KitStrings } from '../text.js';
import type { AfTileResult, AfTileSpec } from './types.js';
import { verdictModel } from './verdict.js';
import type { VerdictModel } from './verdict.js';

export type TileState =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'failed'; title: string; detail: string | null }
  | { kind: 'not-drawn' }
  | { kind: 'number' }
  | { kind: 'text' }
  | { kind: 'list' }
  | { kind: 'chart'; chart: DrawnChart };

export const DRAWN_CHARTS = ['bar', 'column', 'line', 'pie', 'donut'] as const;
export type DrawnChart = (typeof DRAWN_CHARTS)[number];

export const isPie = (chart: DrawnChart) => chart === 'pie' || chart === 'donut';

/** The derived figures this build draws. A tile with any other `derive` kind, from a newer server, is not drawn. */
export const DERIVE_KINDS = ['share_of_total', 'running_total', 'rank', 'expression'] as const;
export type DeriveKind = (typeof DERIVE_KINDS)[number];
export type Derive = components['schemas']['DerivedShape'];

const authoredDerive = (spec: AfTileSpec): { kind: string } | null => (spec.kind === 'chart' ? (spec.transform?.derive ?? null) : null);

/** Whether this build knows how to draw the tile's derived figure, if it has one. */
export const drawsDerive = (spec: AfTileSpec): boolean => {
  const derive = authoredDerive(spec);
  return derive === null || (DERIVE_KINDS as readonly string[]).includes(derive.kind);
};

/** The tile's derived figure when it is one this build draws. */
export const deriveOf = (spec: AfTileSpec): Derive | null => (drawsDerive(spec) ? (authoredDerive(spec) as Derive | null) : null);

export interface FrameModel {
  title: string;
  state: TileState;
  /** What a chart says about its own buckets, drawn between the chart and the notes. */
  verdict: VerdictModel | null;
  notes: string[];
}

type Text = Required<KitStrings>;

const COVERAGE_TEXT = {
  unfiltered: 'tileUnfiltered',
  declined: 'tileDeclined',
  emptied: 'tileEmptied',
  targets_withheld: 'tileTargetsWithheld',
  partial: 'tilePartial',
} as const satisfies Record<CoverageNote, keyof KitStrings>;

/** The tile's measures as the server computed them: each read through its echoed definition. */
export function tileMeasures(spec: AfTileSpec, result: AfTileResult | null | undefined): FigureMeasure[] {
  if (!('query' in spec)) return [];
  const authored: readonly FigureMeasure[] = spec.query.measures;
  return authored.map((measure) => echoedMeasure(measure, measureResult(result, measure)?.metric));
}

/** The name a measure's result and a drill address go by: its key, else its id. */
export function measureId(measure: FigureMeasure): string {
  return measure.key || measure.id || '';
}

export function wordOf(label: FigureText, text: Text): string {
  if ('text' in label) return label.text;
  const words = { empty: text.tileBucketEmpty, restricted: text.tileBucketRestricted, other: text.tileBucketOther, yes: text.tileYes, no: text.tileNo };
  return words[label.code];
}

export function formatCount(count: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(count);
}

export function coverageLines(result: AfTileResult, text: Text): string[] {
  return coverageNotes(result.coverage).map((note) => text[COVERAGE_TEXT[note]]);
}

export function measureLines(result: { advisory?: string | null; skipped?: number | null } | undefined, text: Text, locale?: string): string[] {
  return measureNotes(result).map((note) =>
    note.code === 'skipped' ? fill(text.tileSkipped, { count: formatCount(note.count, locale) }) : text.tileUnweightedAverage,
  );
}

function chartCapLine(note: CapNote, text: Text, locale?: string): string {
  if (note.cap === null) return text.tileCapIncomplete;
  const cap = formatCount(note.cap, locale);
  if (note.kind === 'sample') return fill(text.tileCapSample, { cap });
  return fill(note.kind === 'at_least' ? text.tileChartCapAtLeast : text.tileChartCapAtMost, { cap });
}

/** The platform's `derivedLine`: what the derived figure is, said once under the chart. */
function derivedNote(derive: Derive, buckets: readonly { other?: boolean | null }[], text: Text): string {
  switch (derive.kind) {
    case 'share_of_total':
      return buckets.some((b) => b.other === true) ? `${text.tileDerivedShare} — ${text.tileDerivedShareRemainder}` : text.tileDerivedShare;
    case 'running_total':
      return text.tileDerivedRunning;
    case 'rank':
      return fill(text.tileDerivedRank, {
        direction: derive.direction === 'asc' ? text.tileRankLowest : text.tileRankHighest,
        ties: derive.ties === 'dense' ? text.tileTiesDense : text.tileTiesCompetition,
      });
    case 'expression':
      return derive.label?.trim() || text.tileFormula;
  }
}

function stateOf(spec: AfTileSpec | null | undefined, result: AfTileResult | null | undefined, text: Text, listed: boolean): TileState {
  if (!spec) return { kind: 'loading' };
  if (result?.outcome === 'unavailable') return { kind: 'unavailable' };
  if (result?.outcome === 'failed') {
    const problem = result.problem;
    return { kind: 'failed', title: problem ? problem.title : text.tileFailed, detail: problem?.detail ?? null };
  }
  if (spec.kind === 'text') return { kind: 'text' };
  if (!result) return { kind: 'loading' };
  if (spec.kind === 'number') return { kind: 'number' };
  if (spec.kind === 'list') return listed ? { kind: 'list' } : { kind: 'loading' };
  if (spec.kind !== 'chart') return { kind: 'not-drawn' };
  const chart = DRAWN_CHARTS.find((type) => type === spec.chart);
  if (!chart || !drawsDerive(spec)) return { kind: 'not-drawn' };
  return { kind: 'chart', chart };
}

/** `listed` says a list tile's rows and columns have both arrived: until they do it is loading, and an empty list of rows is an answer. */
export function frameModel(
  spec: AfTileSpec | null | undefined,
  result: AfTileResult | null | undefined,
  fields: readonly FigureField[] | null | undefined,
  text: Text,
  locale?: string,
  listed = false,
): FrameModel {
  const known = fields ?? undefined;
  const measures = spec ? tileMeasures(spec, result) : [];
  const title = spec ? tileTitle({ kind: spec.kind, label: spec.label, query: { measures } }, known) : '';
  const state = stateOf(spec, result, text, listed);
  if (!result || (state.kind !== 'number' && state.kind !== 'chart' && state.kind !== 'list')) return { title, state, verdict: null, notes: [] };

  // A list says what a page's filter did to it as a figure does: a list whose entity has no such field is unfiltered.
  const notes = coverageLines(result, text);
  if (state.kind === 'number' || state.kind === 'list') return { title, state, verdict: null, notes };

  const primary = primaryMeasure(measures);
  const primaryResult = primary ? measureResult(result, primary) : undefined;
  const cap = capNote(result.population, primaryResult?.cap_bound);
  const derive = spec ? deriveOf(spec) : null;
  return {
    title,
    state,
    verdict: spec ? verdictModel(spec, result, fields, text, locale) : null,
    notes: [
      ...(derive ? [derivedNote(derive, primaryResult?.buckets ?? [], text)] : []),
      ...(cap ? [chartCapLine(cap, text, locale)] : []),
      ...notes,
      ...measureLines(primaryResult, text, locale),
    ],
  };
}
