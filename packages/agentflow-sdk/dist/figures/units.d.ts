import type { components } from '../generated/public.js';
import type { FigureField, FigureMeasure, MeasureUnit } from './types.js';
type Schemas = components['schemas'];
export declare function isCounting(fn: Schemas['MeasureFn'] | undefined): boolean;
/** The type a field's values have: a formula's result type, an auto-number's stored shape. */
export declare function effectiveType(field: FigureField): Schemas['FieldType'] | Schemas['FormulaResultType'];
/** The unit a measure's figure is in, by the same branches its value is formatted by. */
export declare function unitOf(measure: FigureMeasure, field?: FigureField): MeasureUnit;
/** The key two measures share when they share a unit, such as `currency:USD` or `elapsed:hours`. */
export declare function unitKey(unit: MeasureUnit): string;
/** The field a measure's figure is formatted by: its own, or a ratio's numerator. A duration has
 *  none; it formats by its unit. */
export declare function formatFieldOf(measure: FigureMeasure, fields?: readonly FigureField[]): FigureField | undefined;
export {};
//# sourceMappingURL=units.d.ts.map