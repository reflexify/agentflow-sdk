const STEPS = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
];
/// "5 minutes ago", "yesterday", in the viewer's language. A week or more
/// reads as a date, because "3 weeks ago" hides the day a decision was made.
export function relativeTime(iso, locale, now = Date.now()) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then))
        return '';
    const secs = Math.round((then - now) / 1000);
    const abs = Math.abs(secs);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (abs < 45)
        return rtf.format(0, 'second');
    if (abs >= 7 * 24 * 3600) {
        return new Date(then).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: new Date(then).getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric',
        });
    }
    for (const [unit, size] of STEPS) {
        if (abs >= size)
            return rtf.format(Math.trunc(secs / size), unit);
    }
    return rtf.format(Math.trunc(secs / 60) || -1, 'minute');
}
export function absoluteTime(iso, locale) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}
//# sourceMappingURL=times.js.map