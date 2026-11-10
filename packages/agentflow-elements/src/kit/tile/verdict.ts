import { echoedMeasure, formatFieldOf, formatMeasureValue, measureResult, primaryMeasure } from '@reflexify/agentflow-sdk/figures';
import type { FigureField, FigureMeasure } from '@reflexify/agentflow-sdk/figures';
import { fill } from '../text.js';
import type { KitStrings } from '../text.js';
import type { AfTileResult, AfTileSpec } from './types.js';

export interface VerdictModel {
  kind: 'partitions' | 'fans_out' | 'overlaps' | 'not_applicable';
  tone: 'ok' | 'warning' | 'info';
  text: string;
}

const TONE = {
  partitions: 'ok',
  fans_out: 'warning',
  overlaps: 'info',
  not_applicable: 'info',
} as const satisfies Record<VerdictModel['kind'], VerdictModel['tone']>;

/** The measure the verdict's figures are in: the primary, read through its echoed definition. Not `tileMeasures`, since `frame.ts` imports this module. */
function primaryOf(spec: Extract<AfTileSpec, { kind: 'chart' }>, result: AfTileResult): FigureMeasure | undefined {
  const authored: readonly FigureMeasure[] = spec.query.measures;
  const primary = primaryMeasure(authored);
  return primary && echoedMeasure(primary, measureResult(result, primary)?.metric);
}

/** A chart tile's reconciliation verdict, worded with the primary measure's figures; null for a number tile, no verdict, or a kind this version does not know. */
export function verdictModel(
  spec: AfTileSpec,
  result: AfTileResult,
  fields: readonly FigureField[] | null | undefined,
  text: Required<KitStrings>,
  locale?: string,
): VerdictModel | null {
  if (spec.kind !== 'chart') return null;
  const verdict = result.verdict;
  if (!verdict) return null;

  const primary = primaryOf(spec, result);
  const field = primary ? formatFieldOf(primary, fields ?? undefined) : undefined;
  const figure = (value: number) => (primary ? formatMeasureValue(primary, value, field, locale) : String(value));
  const model = (words: string): VerdictModel => ({ kind: verdict.kind, tone: TONE[verdict.kind], text: words });

  switch (verdict.kind) {
    case 'partitions': {
      const stacked = !!spec.stack_by;
      if (typeof verdict.total !== 'number') return model(stacked ? text.tileVerdictPartitionsStackedNoTotal : text.tileVerdictPartitionsNoTotal);
      return model(fill(stacked ? text.tileVerdictPartitionsStacked : text.tileVerdictPartitions, { total: figure(verdict.total) }));
    }
    case 'fans_out':
      return model(fill(text.tileVerdictFansOut, { bucketSum: figure(verdict.bucket_sum), total: figure(verdict.total), gap: figure(Math.abs(verdict.gap)) }));
    case 'overlaps':
      return model(text.tileVerdictOverlaps);
    case 'not_applicable':
      return model(text.tileVerdictNotApplicable);
    default:
      return null;
  }
}
