/** The editor's mention token, `@[label](mention:<kind>/<id>)`, read and written apart from the editor so the Markdown view and the list tile can read it without loading it. */

const KINDS = ['record', 'dashboard', 'entity', 'user'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ScannedMention { raw: string; ref: string; label: string }

export function escapeLabel(label: string): string {
  let out = '';
  for (const c of label) {
    if (c === '\\' || c === '[' || c === ']') out += `\\${c}`;
    else if (c === '\n' || c === '\r') out += ' ';
    else out += c;
  }
  return out;
}

export const tokenFor = (ref: string, label: string): string => `@[${escapeLabel(label)}](mention:${ref})`;

function normalTarget(raw: string): string | null {
  const [kind = '', ...ids] = raw.split('/');
  if (!(KINDS as readonly string[]).includes(kind)) return null;
  if (ids.length !== (kind === 'record' ? 2 : 1)) return null;
  if (!ids.every((id) => UUID.test(id))) return null;
  return [kind, ...ids.map((id) => id.toLowerCase())].join('/');
}

// Stops at an unescaped `[` or a line break so a stray `@[` cannot swallow a later token.
function readLabel(s: string): { label: string; end: number } | null {
  let label = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === '\\') {
      i += 1;
      if (i >= s.length) return null;
      const next = s[i]!;
      if (next === '\n' || next === '\r') return null;
      label += next;
    } else if (c === ']') return { label, end: i + 1 };
    else if (c === '[' || c === '\n' || c === '\r') return null;
    else label += c;
  }
  return null;
}

/** The token at the very start of `src`, or null when what is there is not a well-formed one. */
export function scanToken(src: string): ScannedMention | null {
  if (!src.startsWith('@[')) return null;
  const read = readLabel(src.slice(2));
  if (!read) return null;
  const afterLabel = 2 + read.end;
  if (!src.startsWith('(mention:', afterLabel)) return null;
  const targetAt = afterLabel + '(mention:'.length;
  const close = src.indexOf(')', targetAt);
  if (close < 0) return null;
  const ref = normalTarget(src.slice(targetAt, close));
  if (!ref) return null;
  return { raw: src.slice(0, close + 1), ref, label: read.label };
}
