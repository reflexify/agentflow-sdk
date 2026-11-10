import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { KitStrings } from '../text.js';
import type { AfDrillTarget, AfTileResult, AfTileSpec } from './types.js';
export interface FigureModel {
    measure: string;
    label: string | null;
    value: string;
    muted: boolean;
    meta: string[];
    goal: {
        text: string;
        tone: 'short' | 'over' | 'met' | 'none';
    } | null;
    comparison: string | null;
    drill: AfDrillTarget | null;
}
export interface NumberModel {
    primary: FigureModel;
    secondaries: FigureModel[];
}
type Text = Required<KitStrings>;
export declare function numberModel(spec: AfTileSpec, result: AfTileResult, fields: readonly FigureField[] | null | undefined, text: Text, locale: string | undefined, drillable: boolean): NumberModel;
export {};
//# sourceMappingURL=number.d.ts.map