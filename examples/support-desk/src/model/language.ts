import type { Lang } from '../text.js';

/** "English" for `en`, in the desk's language; the code itself when the browser can't name it. */
export function languageName(locale: string | null, lang: Lang): string | null {
  if (!locale) return null;
  try {
    return new Intl.DisplayNames([lang], { type: 'language' }).of(locale) ?? locale;
  } catch {
    return locale;
  }
}
