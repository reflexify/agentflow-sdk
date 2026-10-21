/** The first letters of the first and last word of a name. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = [...words[0]!][0]!;
  const last = words.length > 1 ? [...words[words.length - 1]!][0]! : '';
  return (first + last).toLocaleUpperCase();
}

/** `21/10`, and `21/10/2027` for a day in another year than `today`'s. */
export function formatDay(day: string, today: string): string {
  const [y = '', m = '', d = ''] = day.split('-');
  return y === today.slice(0, 4) ? `${d}/${m}` : `${d}/${m}/${y}`;
}

/** One of eight avatar hues, from the person's id (FNV-1a), so a rename keeps their colour. */
export function hueOf(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 8;
}

/** A count in the language's digits: "1.200" in Vietnamese, "1,200" in English. */
export function formatCount(n: number, lang: 'en' | 'vi'): string {
  return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(n);
}

const UNITS = ['KB', 'MB', 'GB', 'TB'] as const;

/** `512 B`, then one decimal from a kilobyte up, in the language's separator: "1,2 MB" in Vietnamese, "1.2 MB" in English. */
export function formatBytes(bytes: number, lang: 'en' | 'vi'): string {
  const number = new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (bytes < 1024) return `${new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(Math.max(0, Math.round(bytes)))} B`;
  let value = bytes / 1024;
  let unit = 0;
  // Rounded to one decimal, 1023.95 KB would read "1024.0 KB": that is the next unit's 1.0.
  while (unit < UNITS.length - 1 && Math.round(value * 10) / 10 >= 1024) {
    value /= 1024;
    unit++;
  }
  return `${number.format(value)} ${UNITS[unit]}`;
}

/** `01/10/2026 09:00`: day before month, a 24-hour clock, in `timeZone`. */
export function formatDateTime(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}`;
}

/** Markdown as the words a reader sees, on one line: for a tooltip or an accessible name, which show no formatting. */
export function plainText(markdown: string): string {
  let text = markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/gm, '');
  // Emphasis nests (`**_x_**`), so each pass takes off one layer.
  for (let pass = 0; pass < 3; pass++) text = text.replace(/(\*\*|__|~~|\*|_|`)(?=\S)([\s\S]*?\S)\1/g, '$2');
  return text.replace(/\\([\\`*_{}[\]()#+\-.!>~|])/g, '$1').replace(/\s+/g, ' ').trim();
}
