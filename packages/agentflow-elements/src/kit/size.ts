import { isVi } from './text.js';

/**
 * A byte count as AgentFlow's attachment rows write it: counted in 1,024s, and under a kilobyte "512 B". Nothing for a count
 * that is not a number or is negative.
 */
export function byteSizer(locale: string | null | undefined): (bytes: number | null | undefined) => string {
  const tag = isVi(locale) ? 'vi-VN' : 'en-GB';
  const unit = (name: string) => new Intl.NumberFormat(tag, { style: 'unit', unit: name, unitDisplay: 'short', maximumFractionDigits: 1 });
  // Intl's short byte is the word "byte", and its narrow form joins the letter to the number in English only.
  const byte = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
  const kilobyte = unit('kilobyte');
  const megabyte = unit('megabyte');
  return (bytes) => {
    if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '';
    if (bytes < 1024) return `${byte.format(bytes)} B`;
    if (bytes < 1024 * 1024) return kilobyte.format(bytes / 1024);
    return megabyte.format(bytes / 1024 / 1024);
  };
}
