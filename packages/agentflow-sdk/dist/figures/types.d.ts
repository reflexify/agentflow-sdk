import type { components } from '../generated/public.js';
type Schemas = components['schemas'];
/** The parts of an entity field a figure is formatted and labelled by. */
export type FigureField = Pick<Schemas['EntityField'], 'key' | 'type'> & Partial<Pick<Schemas['EntityField'], 'label' | 'format' | 'format_options' | 'enum_values' | 'formula_result_type' | 'auto_number_format'>>;
/** A tile's measure as a figure reads it. Every member is optional: a module's measure may only
 *  name a metric, and reads its definition through `echoedMeasure`. */
export type FigureMeasure = Partial<Pick<Schemas['TileMeasure'], 'id' | 'key' | 'primary' | 'fn' | 'field' | 'ratio' | 'percentile' | 'duration' | 'label' | 'color' | 'entity_metric_id'>>;
/** A field's display options, as AgentFlow authors them. */
export interface FormatOptions {
    currency_code?: string;
    rating_max?: number;
    duration_unit?: 'seconds' | 'minutes' | 'hours';
    duration_format?: 'human' | 'hh_mm' | 'hh_mm_ss';
    decimal_places?: number;
    separators?: 'locale' | 'comma_dot' | 'dot_comma' | 'space_comma' | 'none';
    time_style?: '12h' | '24h';
}
/** A label: text to show as it is, or a code the caller words in its own language. */
export type FigureText = {
    text: string;
} | {
    code: 'empty' | 'restricted' | 'other' | 'yes' | 'no';
};
/** The unit a measure's figure is in. Two measures share an axis only when they share a unit. */
export type MeasureUnit = {
    kind: 'count';
} | {
    kind: 'ratio';
} | {
    kind: 'percent';
} | {
    kind: 'currency';
    code: string;
} | {
    kind: 'duration';
} | {
    kind: 'elapsed';
    unit: Schemas['DurationUnit'];
} | {
    kind: 'rating';
} | {
    kind: 'date';
} | {
    kind: 'number';
};
/** What a capped figure claims: at least, at most, or a figure over a sample. */
export interface CapNote {
    kind: 'at_least' | 'at_most' | 'sample';
    cap: number | null;
}
/** How far a figure sits from its goal, in the measure's own unit, or in points for a percent. */
export interface GoalDistance {
    distance: string;
    short: boolean;
    met: boolean;
    points: boolean;
}
export {};
//# sourceMappingURL=types.d.ts.map