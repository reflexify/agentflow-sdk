import type { Person, Priority } from './types.js';

export interface PlaceholderContext {
  contact: { name: string | null; email: string; locale?: string | null };
  ticket: { number: string };
  agent: { name: string };
}

/**
 * The word a person is greeted by: the first word of a name, except in Vietnamese, where the given
 * name comes last ("Trần Minh Khoa" is Khoa).
 */
export function givenName(name: string | null, locale?: string | null): string | null {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) return null;
  const vietnamese = locale?.toLowerCase().split(/[-_]/)[0] === 'vi';
  return (vietnamese ? words.at(-1) : words[0]) ?? null;
}

export function fillPlaceholders(body: string, ctx: PlaceholderContext): string {
  const values: Record<string, string> = {
    'contact.first_name': givenName(ctx.contact.name, ctx.contact.locale) ?? 'there',
    'contact.name': ctx.contact.name?.trim() || ctx.contact.email,
    'contact.email': ctx.contact.email,
    'ticket.number': ctx.ticket.number,
    'agent.name': ctx.agent.name,
  };
  return body.replace(/\{\{\s*([a-z_.]+)\s*\}\}/g, (whole, key: string) => values[key] ?? whole);
}

/** The `@name` being typed: an `@` at the start or after whitespace, then no whitespace up to the caret. */
export function mentionAt(text: string, caret: number): { query: string; start: number } | null {
  const before = text.slice(0, caret);
  const m = /(^|\s)@([^\s@]*)$/.exec(before);
  return m ? { query: m[2] ?? '', start: before.length - (m[2] ?? '').length - 1 } : null;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The people a note names with `@Name`. A name counts only when no letter follows it ("@Bob" is not
 * "@Bo"), and the longest names are matched first and cut out of the text, so "@Bo Tran" is Bo Tran
 * and not also Bo.
 */
export function mentionIds(text: string, people: Person[]): string[] {
  const ids = new Set<string>();
  let rest = text;
  for (const p of [...people].sort((a, b) => b.displayName.length - a.displayName.length)) {
    const named = new RegExp(`@${escapeRegExp(p.displayName)}(?![\\p{L}\\p{N}])`, 'gu');
    if (named.test(rest)) {
      ids.add(p.id);
      rest = rest.replace(named, ' ');
    }
  }
  return people.map((p) => p.id).filter((id) => ids.has(id));
}

export type DiffPart = { kind: 'same' | 'ins' | 'del'; text: string };

/** Word-level diff by longest common subsequence; fine for a reply's length. */
export function wordDiff(before: string, after: string): DiffPart[] {
  const a = before.match(/\S+\s*/g) ?? [];
  const b = after.match(/\S+\s*/g) ?? [];
  const n = a.length, m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const parts: DiffPart[] = [];
  const push = (kind: DiffPart['kind'], text: string) => {
    const last = parts.at(-1);
    if (last?.kind === kind) last.text += text;
    else parts.push({ kind, text });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { push('same', a[i]!); i++; j++; }
    else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) { push('del', a[i]!); i++; }
    else { push('ins', b[j]!); j++; }
  }
  while (i < n) push('del', a[i++]!);
  while (j < m) push('ins', b[j++]!);
  return parts;
}

export function nextPriority(p: Priority): Priority {
  return ({ low: 'normal', normal: 'high', high: 'urgent', urgent: 'urgent' } as const)[p];
}

export function firstLine(text: string, max = 120): string {
  const line = text.split('\n').find((l) => l.trim() !== '')?.trim() ?? '';
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

/**
 * What a redraft's instruction carries besides the person's words: the text to revise. Draft reply's agent never
 * reads the draft that is saved, so "make it shorter" shortens whatever the instruction hands it.
 */
const REDRAFT_MARKER = '\n\nThe draft to revise:\n';

export function withDraftText(instruction: string, draft: string): string {
  return draft.trim() ? `${instruction}${REDRAFT_MARKER}${draft}` : instruction;
}

/** The inverse of `withDraftText`; `draft` is null when the instruction carries none. */
export function splitRedraft(wire: string): { instruction: string; draft: string | null } {
  const at = wire.indexOf(REDRAFT_MARKER);
  return at < 0 ? { instruction: wire, draft: null } : { instruction: wire.slice(0, at), draft: wire.slice(at + REDRAFT_MARKER.length) };
}
