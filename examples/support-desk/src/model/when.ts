import type { Lang } from '../text.js';

const WORDS = { en: { today: 'Today', yesterday: 'Yesterday' }, vi: { today: 'Hôm nay', yesterday: 'Hôm qua' } } as const;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today 10:51", "Yesterday 09:30", "Mon 14:02" within the week, then "6 Oct". */
export function formatWhen(iso: string, now: Date, lang: Lang): string {
  const d = new Date(iso);
  const locale = lang === 'vi' ? 'vi-VN' : 'en-GB';
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return `${WORDS[lang].today} ${time}`;
  if (days === 1) return `${WORDS[lang].yesterday} ${time}`;
  if (days > 1 && days < 7) return `${d.toLocaleDateString(locale, { weekday: 'short' })} ${time}`;
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
