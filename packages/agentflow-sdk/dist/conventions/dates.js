const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const pad = (n) => String(n).padStart(2, '0');
const isVi = (locale) => /^vi(-|$)/i.test(locale ?? '');
/** `yyyy-mm-dd` for a real calendar day, null for one that does not exist (2026-02-30). */
export function isoDate(year, month, day) {
    const probe = new Date(Date.UTC(2000, month - 1, day));
    probe.setUTCFullYear(year);
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day)
        return null;
    return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
}
/** The text itself when it is a `yyyy-mm-dd` naming a real day, otherwise null. */
export function validIsoDate(text) {
    const m = ISO.exec(text ?? '');
    return m ? isoDate(Number(m[1]), Number(m[2]), Number(m[3])) : null;
}
/** A typed date, `dd/mm/yyyy` or `yyyy-mm-dd` with or without surrounding space, as `yyyy-mm-dd`; null when it is neither. */
export function parseDateInput(text) {
    const trimmed = text.trim();
    const dmy = DMY.exec(trimmed);
    return dmy ? isoDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1])) : validIsoDate(trimmed);
}
/** `05/11/2026` for Vietnamese, `5 Nov 2026` for anything else. */
export function formatDate(iso, locale) {
    const vi = isVi(locale);
    const options = vi
        ? { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }
        : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat(vi ? 'vi-VN' : 'en-GB', options).format(new Date(`${iso}T00:00:00Z`));
}
const MASK_PART = /DD|MM|YYYY/g;
/** The tokens of a date mask in order with the text between them, or null for a mask that is not exactly `DD`, `MM` and `YYYY` once each with no text before or after them and no letters between them; the text between two tokens may be empty. */
function readMask(mask) {
    if (!mask)
        return null;
    const tokens = mask.match(MASK_PART);
    const between = mask.split(MASK_PART);
    if (!tokens || tokens.length !== 3 || new Set(tokens).size !== 3)
        return null;
    const [lead, first, second, trail] = between;
    if (lead !== '' || trail !== '' || /\p{L}/u.test(first + second))
        return null;
    return { tokens, between: [first, second] };
}
/** Whether a mask is one `formatMasked` and `parseMasked` read: `DD`, `MM` and `YYYY` once each, with no letters between them (`DD/MM/YYYY`, `YYYY-MM-DD`) or with nothing between some or all of them (`YYYYMMDD`, `DDMMYYYY`). */
export function isDateMask(mask) {
    return readMask(mask) !== null;
}
/** A `yyyy-mm-dd` day written in a date mask, `20.02.2026` for `DD.MM.YYYY` and `20260220` for `YYYYMMDD`; null for a mask it cannot read or a day that does not exist. */
export function formatMasked(iso, mask) {
    const read = readMask(mask);
    const day = validIsoDate(iso);
    if (!read || !day)
        return null;
    const parts = { YYYY: day.slice(0, 4), MM: day.slice(5, 7), DD: day.slice(8, 10) };
    return read.tokens.map((token, i) => parts[token] + (read.between[i] ?? '')).join('');
}
/** Typed text in a date mask as `yyyy-mm-dd`, with surrounding space trimmed; null when it does not match or names no real day. A four-digit year, and a day or month of one or two digits, except that a day or month next to a token with nothing between them is exactly two digits (`2026022` is not a day in `YYYYMMDD`). */
export function parseMasked(text, mask) {
    const read = readMask(mask);
    if (!read)
        return null;
    const escape = (literal) => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const digits = (token, i) => {
        if (token === 'YYYY')
            return '(\\d{4})';
        const joined = read.between[i - 1] === '' || read.between[i] === '';
        return joined ? '(\\d{2})' : '(\\d{1,2})';
    };
    const pattern = read.tokens.map((token, i) => digits(token, i) + escape(read.between[i] ?? '')).join('');
    const m = new RegExp(`^${pattern}$`).exec(text.trim());
    if (!m)
        return null;
    const at = (token) => Number(m[read.tokens.indexOf(token) + 1]);
    return isoDate(at('YYYY'), at('MM'), at('DD'));
}
/** The calendar day it is where the reader is, as `yyyy-mm-dd`. */
export function todayIsoDate(now = new Date()) {
    return `${String(now.getFullYear()).padStart(4, '0')}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
//# sourceMappingURL=dates.js.map