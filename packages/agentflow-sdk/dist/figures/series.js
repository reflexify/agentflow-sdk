import { optionsOf, primaryMeasure } from './labels.js';
import { formatFieldOf, unitKey, unitOf } from './units.js';
/** The categorical slots a chart colours by, `--af-chart-1` to `--af-chart-8`. Never cycled: an
 *  identity past the eighth is `other`. */
export const CHART_SLOTS = 8;
/** Each palette name as the literal colour AgentFlow paints it, never a `var()`, so it reads the
 *  same in any document. */
export const OPTION_COLOR_VALUES = {
    violet: 'oklch(0.55 0.22 285)',
    sky: 'oklch(0.60 0.15 245)',
    teal: 'oklch(0.64 0.12 190)',
    emerald: 'oklch(0.70 0.13 120)',
    amber: 'oklch(0.66 0.15 55)',
    gray: 'oklch(0.68 0.02 260)',
    indigo: 'oklch(0.55 0.19 275)',
    rose: 'oklch(0.64 0.20 15)',
    fuchsia: 'oklch(0.63 0.24 320)',
};
const HEX = /^#[0-9a-fA-F]{6}$/;
const SYNTHETIC = new Set(['$other', '$restricted']);
/** An authored colour as a literal: a palette name gives its value, `#rrggbb` gives itself, and
 *  anything else is no colour. */
export function colorOf(own) {
    if (!own)
        return null;
    if (HEX.test(own))
        return { value: own };
    return Object.hasOwn(OPTION_COLOR_VALUES, own) ? { value: OPTION_COLOR_VALUES[own] } : null;
}
/** A measure's colour: its own, else the slot its position in the tile's authored measure list
 *  gives it. Past the eighth it is `other`. */
export function measureColor(measure, position) {
    return colorOf(measure.color) ?? (position >= 0 && position < CHART_SLOTS ? { slot: position + 1 } : { other: true });
}
/** The colour of each key a chart splits by, following the identity rather than its rank, so a
 *  filter that removes a series does not repaint the rest. `$other` and `$restricted` are `other`;
 *  an option's own colour wins; on a field of at most eight options, an option takes the slot of
 *  its place in the list, and owns it whether or not it is in this chart. Every other key (a stale
 *  one, a null, any value of a wider field) takes, by appearance, the lowest slot no option owns
 *  and no key here holds; failing that, the lowest no key here holds; and `other` once none is
 *  left. */
export function categoryColors(keys, field) {
    const options = optionsOf(field);
    const placeable = options.length <= CHART_SLOTS;
    const owned = new Set();
    if (placeable)
        for (const [at, option] of options.entries())
            if (!colorOf(option.color))
                owned.add(at + 1);
    const decided = new Map();
    const held = new Set();
    for (const key of keys) {
        if (decided.has(key))
            continue;
        if (key !== null && SYNTHETIC.has(key)) {
            decided.set(key, { other: true });
            continue;
        }
        const at = key === null ? -1 : options.findIndex((o) => o.value === key);
        if (at < 0)
            continue;
        const own = colorOf(options[at].color);
        if (own)
            decided.set(key, own);
        else if (placeable) {
            decided.set(key, { slot: at + 1 });
            held.add(at + 1);
        }
    }
    const lowest = (taken) => {
        for (let slot = 1; slot <= CHART_SLOTS; slot++)
            if (!taken(slot))
                return slot;
        return null;
    };
    for (const key of keys) {
        if (decided.has(key))
            continue;
        const slot = lowest((n) => held.has(n) || owned.has(n)) ?? lowest((n) => held.has(n));
        if (slot === null) {
            decided.set(key, { other: true });
            continue;
        }
        decided.set(key, { slot });
        held.add(slot);
    }
    return keys.map((key) => decided.get(key));
}
/** The segment keys across a chart's buckets, in order of first appearance, with `$other` and
 *  then `$restricted` last wherever they first appeared. */
export function segmentOrder(buckets) {
    const seen = new Set();
    for (const bucket of buckets)
        for (const segment of bucket.segments ?? [])
            seen.add(segment.key);
    const kept = [...seen].filter((key) => key === null || !SYNTHETIC.has(key));
    return [...kept, ...['$other', '$restricted'].filter((key) => seen.has(key))];
}
/** The measures grouped by unit, the primary's group first: one group is one axis, more are small
 *  multiples. Within a group the primary leads, then the rest in authored order. */
export function axisGroups(measures, fields) {
    const primary = primaryMeasure(measures);
    const ordered = primary ? [primary, ...measures.filter((m) => m !== primary)] : [];
    const groups = new Map();
    for (const measure of ordered) {
        const key = unitKey(unitOf(measure, formatFieldOf(measure, fields)));
        const group = groups.get(key);
        if (group)
            group.push(measure);
        else
            groups.set(key, [measure]);
    }
    return [...groups.values()];
}
/** A measure's result, by its `key` (as `computeTiles` returns them), else by its `id` (as the
 *  server does). */
export function measureResult(result, measure) {
    const measures = result?.measures;
    if (!measures)
        return undefined;
    if (measure.key && measures[measure.key] !== undefined)
        return measures[measure.key];
    return measure.id ? measures[measure.id] : undefined;
}
//# sourceMappingURL=series.js.map