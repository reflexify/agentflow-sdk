import type { Locale, Translate } from './i18n.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;

export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return '';
  if (DATE_ONLY.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y!, m! - 1, d!);
    // Date rolls an impossible day over (Feb 31 becomes Mar 3), so only a round trip proves it real.
    if (date.getFullYear() !== y || date.getMonth() !== m! - 1 || date.getDate() !== d) return '';
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function formatCell(value: unknown, locale: Locale, t: Translate): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
  // Significant rather than fraction digits: the default three fraction digits show 0.00012 as 0,
  // and more of them print float noise (0.1 + 0.2 as 0.30000000000000004).
  if (typeof value === 'number') return new Intl.NumberFormat(locale, { maximumSignificantDigits: 15 }).format(value);
  if (typeof value === 'string') return DATE_ONLY.test(value) || DATE_TIME.test(value) ? formatDate(value, locale) || value : value;
  if (Array.isArray(value)) return value.map((v) => formatCell(v, locale, t)).join(', ');
  const text = JSON.stringify(value);
  return text.length > 80 ? `${text.slice(0, 79)}…` : text;
}
