import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { KitStrings } from '../text.js';
import type { AfTileResult, AfTileSpec } from './types.js';
export interface VerdictModel {
    kind: 'partitions' | 'fans_out' | 'overlaps' | 'not_applicable';
    tone: 'ok' | 'warning' | 'info';
    text: string;
}
/** A chart tile's reconciliation verdict, worded with the primary measure's figures; null for a number tile, no verdict, or a kind this version does not know. */
export declare function verdictModel(spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] | null | undefined, text: Required<KitStrings>, locale?: string): VerdictModel | null;
//# sourceMappingURL=verdict.d.ts.map