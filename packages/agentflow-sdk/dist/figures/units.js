export function isCounting(fn) {
    return fn === 'count' || fn === 'count_distinct' || fn === 'count_filled' || fn === 'count_empty';
}
/** The type a field's values have: a formula's result type, an auto-number's stored shape. */
export function effectiveType(field) {
    if (field.type === 'formula')
        return field.formula_result_type ?? field.type;
    if (field.type === 'auto_number')
        return field.auto_number_format == null ? 'number' : 'text';
    return field.type;
}
/** The unit a measure's figure is in, by the same branches its value is formatted by. */
export function unitOf(measure, field) {
    if (measure.fn === 'ratio')
        return { kind: 'ratio' };
    // Two durations in different units are different axes.
    if (measure.duration)
        return { kind: 'elapsed', unit: measure.duration.unit };
    if (!measure.fn)
        return { kind: 'number' };
    if (isCounting(measure.fn))
        return { kind: 'count' };
    if (!field)
        return { kind: 'number' };
    const type = effectiveType(field);
    if ((type === 'date' || type === 'datetime') && (measure.fn === 'min' || measure.fn === 'max')) {
        return { kind: 'date' };
    }
    switch (field.format) {
        case 'currency': {
            const code = field.format_options?.currency_code;
            return { kind: 'currency', code: typeof code === 'string' ? code : 'XXX' };
        }
        case 'percent':
            return { kind: 'percent' };
        case 'duration':
            return { kind: 'duration' };
        case 'rating':
            return { kind: 'rating' };
        default:
            return { kind: 'number' };
    }
}
/** The key two measures share when they share a unit, such as `currency:USD` or `elapsed:hours`. */
export function unitKey(unit) {
    if (unit.kind === 'currency')
        return `currency:${unit.code}`;
    return unit.kind === 'elapsed' ? `elapsed:${unit.unit}` : unit.kind;
}
/** The field a measure's figure is formatted by: its own, or a ratio's numerator. A duration has
 *  none; it formats by its unit. */
export function formatFieldOf(measure, fields) {
    const key = measure.field ?? measure.ratio?.of;
    return key ? fields?.find((f) => f.key === key) : undefined;
}
//# sourceMappingURL=units.js.map