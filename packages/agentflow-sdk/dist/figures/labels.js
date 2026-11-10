/** A field's options, tolerating the bare strings older definitions stored. */
export function optionsOf(field) {
    const out = [];
    for (const o of (field?.enum_values ?? [])) {
        if (typeof o === 'string')
            out.push({ value: o });
        else if (o && typeof o === 'object' && typeof o.value === 'string')
            out.push(o);
    }
    return out;
}
/** A bucket's label: the three synthetic buckets and a boolean as codes, else a server label, an
 *  option's label, a period by its unit, or the raw key. A key no longer among the options is
 *  its raw key. */
export function bucketLabel(bucket, field, unit) {
    if (bucket.key === null || bucket.key === undefined)
        return { code: 'empty' };
    if (bucket.key === '$restricted')
        return { code: 'restricted' };
    if (bucket.key === '$other')
        return { code: 'other' };
    if (bucket.label)
        return { text: bucket.label };
    if (field) {
        const option = optionsOf(field).find((o) => o.value === bucket.key);
        if (option?.label)
            return { text: option.label };
        if (field.type === 'boolean')
            return { code: bucket.key === 'true' ? 'yes' : 'no' };
    }
    if (unit)
        return { text: formatPeriod(bucket.key, unit) };
    return { text: bucket.key };
}
/** A period key (its first day, ISO) rendered by its unit: `2026-04` for a month, `2026 Q2` for a
 *  quarter, and the key itself for a day or a week. */
export function formatPeriod(key, unit) {
    const [y, m, d] = key.split('-');
    if (!y || !m || !d)
        return key;
    switch (unit) {
        case 'month':
            return `${y}-${m}`;
        case 'quarter':
            return `${y} Q${Math.floor((Number(m) - 1) / 3) + 1}`;
        default:
            return key;
    }
}
/** A measure's label: the authored one, else `fn · field` (`p90 · Amount` for a percentile,
 *  `Amount / Qty` for a ratio, `median · Opened → Closed` for a duration). A field missing from
 *  `fields` is its key. A measure with no `fn` is its field's label, or nothing. */
export function measureLabel(measure, fields) {
    if (measure.label)
        return measure.label;
    const labelOf = (key) => fields?.find((f) => f.key === key)?.label ?? key;
    if (measure.fn === 'ratio' && measure.ratio)
        return `${labelOf(measure.ratio.of)} / ${labelOf(measure.ratio.per)}`;
    if (!measure.fn)
        return measure.field ? labelOf(measure.field) : '';
    const fn = measure.fn === 'percentile' && measure.percentile ? `p${measure.percentile.p}` : measure.fn;
    if (measure.duration)
        return `${fn} · ${labelOf(measure.duration.from)} → ${labelOf(measure.duration.to)}`;
    return measure.field ? `${fn} · ${labelOf(measure.field)}` : fn;
}
/** The measure a tile is about: the one marked primary, else the first. */
export function primaryMeasure(measures) {
    return measures.find((m) => m.primary) ?? measures[0];
}
/** A tile's heading: the authored label, else its primary measure's. A text or list tile without a
 *  label has none. */
export function tileTitle(tile, fields) {
    if (tile.label)
        return tile.label;
    if (tile.kind === 'text' || tile.kind === 'list')
        return '';
    const primary = primaryMeasure(tile.query?.measures ?? []);
    return primary ? measureLabel(primary, fields) : '';
}
export function echoedMeasure(measure, echoed) {
    if (!echoed)
        return measure;
    // The metric's own id names the metric, never this measure.
    const { id: _metricId, ...definition } = echoed;
    const next = { ...definition };
    if (measure.id !== undefined)
        next.id = measure.id;
    if (measure.color)
        next.color = measure.color;
    if (measure.primary !== undefined)
        next.primary = measure.primary;
    if (measure.key !== undefined)
        next.key = measure.key;
    if (measure.entity_metric_id !== undefined)
        next.entity_metric_id = measure.entity_metric_id;
    return next;
}
//# sourceMappingURL=labels.js.map