import {
  capNote,
  formatFieldOf,
  formatMeasureValue,
  formatPercentChange,
  goalDistance,
  measureLabel,
  measureResult,
  primaryMeasure,
} from '@reflexify/agentflow-sdk/figures';
import type { FigureField, FigureMeasure } from '@reflexify/agentflow-sdk/figures';
import { fill } from '../text.js';
import type { KitStrings } from '../text.js';
import { formatCount, measureId, measureLines, tileMeasures } from './frame.js';
import type { AfDrillTarget, AfTileResult, AfTileSpec } from './types.js';

export interface FigureModel {
  measure: string;
  label: string | null;
  value: string;
  muted: boolean;
  meta: string[];
  goal: { text: string; tone: 'short' | 'over' | 'met' | 'none' } | null;
  comparison: string | null;
  drill: AfDrillTarget | null;
}

export interface NumberModel {
  primary: FigureModel;
  secondaries: FigureModel[];
}

type Text = Required<KitStrings>;
type MeasureOutcome = NonNullable<ReturnType<typeof measureResult>>;

const SECONDARIES_MAX = 3;

function populationLines(outcome: MeasureOutcome, result: AfTileResult, text: Text, locale?: string): string[] {
  const note = capNote(result.population, outcome.cap_bound);
  if (note?.kind === 'sample') {
    return [note.cap === null ? text.tileCapIncomplete : fill(text.tileCapSample, { cap: formatCount(note.cap, locale) })];
  }
  const records = fill(outcome.population === 1 ? text.tileRecordsOne : text.tileRecords, { count: formatCount(outcome.population, locale) });
  if (!note) return [records];
  return [records, note.kind === 'at_least' ? text.tileCapAtLeast : text.tileCapAtMost];
}

function goalOf(
  spec: AfTileSpec,
  measure: FigureMeasure,
  outcome: MeasureOutcome | undefined,
  field: FigureField | undefined,
  text: Text,
  locale?: string,
): FigureModel['goal'] {
  const authored = spec.kind === 'number' || spec.kind === 'chart' ? spec.transform?.target : null;
  const target = outcome?.target ?? (authored?.kind === 'constant' ? authored.value : null);
  if (target == null) return null;
  const line = fill(text.tileGoal, { target: formatMeasureValue(measure, target, field, locale) });
  const distance = goalDistance(measure, field, outcome?.value ?? null, target, locale);
  if (!distance) return { text: line, tone: 'none' };
  if (distance.met) return { text: `${line} · ${text.tileGoalMet}`, tone: 'met' };
  const shown = distance.points ? fill(text.tilePoints, { value: distance.distance }) : distance.distance;
  const tail = fill(distance.short ? text.tileGoalShort : text.tileGoalOver, { distance: shown });
  return { text: `${line} · ${tail}`, tone: distance.short ? 'short' : 'over' };
}

function comparisonOf(measure: FigureMeasure, outcome: MeasureOutcome | undefined, field: FigureField | undefined, text: Text, locale?: string): string | null {
  const comparison = outcome?.comparison;
  if (!comparison) return null;
  const head = `${text.tileVsEarlier}: `;
  if (comparison.previous == null) return head + text.tileNoEarlier;
  const parts = [formatMeasureValue(measure, comparison.previous, field, locale)];
  if (comparison.difference != null) {
    const sign = comparison.difference < 0 ? '−' : '+';
    parts.push(sign + formatMeasureValue(measure, Math.abs(comparison.difference), field, locale));
  }
  const change = formatPercentChange(comparison.percent_change, locale);
  if (change !== null) parts.push(change);
  return head + parts.join(' · ');
}

function drillOf(
  spec: AfTileSpec,
  result: AfTileResult,
  measure: FigureMeasure,
  fields: readonly FigureField[] | undefined,
  drillable: boolean,
): AfDrillTarget | null {
  const off = (spec.kind === 'number' || spec.kind === 'chart') && spec.drill_disabled === true;
  const population = result.population;
  if (!drillable || off || result.outcome !== 'ok' || !population?.drill) return null;
  return { drill: population.drill, measure: measureId(measure), bucket: null, segment: null, label: measureLabel(measure, fields), count: population.count, other: false };
}

export function numberModel(
  spec: AfTileSpec,
  result: AfTileResult,
  fields: readonly FigureField[] | null | undefined,
  text: Text,
  locale: string | undefined,
  drillable: boolean,
): NumberModel {
  const known = fields ?? undefined;
  const measures = tileMeasures(spec, result);
  const lead = primaryMeasure(measures) ?? {};

  const figure = (measure: FigureMeasure, isPrimary: boolean): FigureModel => {
    const outcome = measureResult(result, measure);
    const field = formatFieldOf(measure, known);
    const value = outcome?.value ?? null;
    return {
      measure: measureId(measure),
      label: measures.length > 1 ? measureLabel(measure, known) : null,
      value: formatMeasureValue(measure, value, field, locale),
      muted: value === null,
      meta: [...(outcome && value !== null ? populationLines(outcome, result, text, locale) : [text.tileNoValue]), ...measureLines(outcome, text, locale)],
      goal: isPrimary ? goalOf(spec, measure, outcome, field, text, locale) : null,
      comparison: comparisonOf(measure, outcome, field, text, locale),
      drill: isPrimary ? drillOf(spec, result, measure, known, drillable) : null,
    };
  };

  return {
    primary: figure(lead, true),
    secondaries: measures.filter((measure) => measure !== lead).slice(0, SECONDARIES_MAX).map((measure) => figure(measure, false)),
  };
}
