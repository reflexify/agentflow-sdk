import type { components } from '../generated/public.js';
import type { FigureField, FigureMeasure, FormatOptions, GoalDistance } from './types.js';
type Schemas = components['schemas'];
/** A field's display options: an object reads as them, anything else as none. */
export declare function formatOptionsOf(field: Pick<FigureField, 'format_options'> | null | undefined): FormatOptions;
/** A number under its field's display format. A percent is unscaled: the stored value is the
 *  percent. A currency code `Intl` refuses degrades to the plain number. */
export declare function formatNumber(value: number, format?: Schemas['FieldFormat'] | null, options?: FormatOptions | null, locale?: string): string;
/** A measure's figure, rendered once at display time in its unit. `null` is `—`; zero is a value.
 *  A count is a plain integer whatever field it reads, a ratio is dimensionless, a duration is a
 *  span in its unit, and a date extremum is a date again. */
export declare function formatMeasureValue(measure: FigureMeasure, value: number | null, field?: FigureField, locale?: string): string;
/** `formatMeasureValue` for one measure, decided once. The writer builds each formatter it needs on its
 *  first value and keeps it, so a chart that words every tick and mark on each resize builds none. */
export declare function measureFormatter(measure: FigureMeasure, field?: FigureField, locale?: string): (value: number | null) => string;
/** A relative change: `+14.5%` or `−3.3%` (U+2212). No earlier figure, or one of zero, is null. */
export declare function formatPercentChange(fraction: number | null, locale?: string): string | null;
/** A share as a percentage, at the precision its population supports: no decimal below a thousand
 *  records. An unknown population keeps the decimal. */
export declare function formatShare(fraction: number | null, population?: number | null, locale?: string): string;
/** How far a figure sits from its goal, in the measure's unit, or in points for a percent. */
export declare function goalDistance(measure: FigureMeasure, field: FigureField | undefined, value: number | null, target: number | null, locale?: string): GoalDistance | null;
export {};
//# sourceMappingURL=format.d.ts.map