const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const TOKEN = new RegExp(`@\\[((?:\\\\.|[^\\]\\\\\\n])*)\\]\\(mention:(user/${UUID}|record/${UUID}/${UUID})\\)`, 'g');

export interface MentionToken {
  start: number;
  end: number;
  label: string;
  /** `user/<id>` or `record/<entity>/<record>`: the key the server's `mentions` map uses. */
  target: string;
  kind: 'user' | 'record';
}

const unescapeLabel = (label: string) => label.replace(/\\(.)/g, '$1');
const escapeLabel = (label: string) => label.replace(/[\\[\]]/g, '\\$&').replace(/[\r\n]+/g, ' ');

/** The `@[Label](mention:kind/id)` tokens of a text, in order. */
export function scanMentions(text: string): MentionToken[] {
  return [...text.matchAll(TOKEN)].map((m) => ({
    start: m.index, end: m.index + m[0].length, label: unescapeLabel(m[1]!), target: m[2]!, kind: m[2]!.startsWith('user/') ? 'user' : 'record',
  }));
}

export const personToken = (label: string, id: string) => `@[${escapeLabel(label)}](mention:user/${id})`;

/** A person chosen from the `@` menu: what the text shows, and who it names. */
export interface Picked { label: string; id: string }

/**
 * The text a person edits: each person's token as `@Name`, and the people they stand for. A token with no label (a
 * restricted record) and every record token stay as written, so saving them back keeps what they name.
 */
export function draftOf(body: string): { text: string; picks: Picked[] } {
  const tokens = scanMentions(body);
  // A label two people share cannot be told apart in the text, so those tokens stay as written and a save keeps who they name.
  const owners = new Map<string, Set<string>>();
  for (const t of tokens) {
    if (t.kind === 'user' && t.label) owners.set(t.label, (owners.get(t.label) ?? new Set()).add(t.target.slice('user/'.length)));
  }
  const picks: Picked[] = [];
  let text = '';
  let at = 0;
  for (const t of tokens) {
    text += body.slice(at, t.start);
    at = t.end;
    if (t.kind === 'user' && t.label && owners.get(t.label)!.size === 1) {
      text += `@${t.label}`;
      const id = t.target.slice('user/'.length);
      if (!picks.some((p) => p.id === id && p.label === t.label)) picks.push({ label: t.label, id });
    } else {
      text += body.slice(t.start, t.end);
    }
  }
  return { text: text + body.slice(at), picks };
}

/**
 * What the text shows for a person picked from the menu: their name, unless another person already holds that name in
 * this comment, then the name with the start of their email (or a piece of their id) in brackets.
 */
export function labelFor(person: { id: string; name: string; email?: string | null }, picks: readonly Picked[]): string {
  const taken = (label: string) => picks.some((p) => p.label === label && p.id !== person.id);
  if (!taken(person.name)) return person.name;
  const local = person.email?.split('@')[0]?.trim();
  const tagged = `${person.name} (${local || person.id.slice(0, 4)})`;
  return taken(tagged) ? `${person.name} (${person.id.slice(0, 8)})` : tagged;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The text sent: each `@Name` of a person picked from the menu becomes their token, longest names first. */
export function bodyOf(text: string, picks: readonly Picked[]): string {
  if (picks.length === 0) return text;
  const byLabel = new Map(picks.map((p) => [p.label, p] as const));
  const labels = [...byLabel.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const names = new RegExp(`(^|[^\\p{L}\\p{N}_])@(${labels.join('|')})(?![\\p{L}\\p{N}_])`, 'gu');
  return text.replace(names, (_, before: string, label: string) => `${before}${personToken(label, byLabel.get(label)!.id)}`);
}

/** The picks that the text still names, so a deleted `@Name` leaves nobody mentioned. */
export function stillPicked(text: string, picks: readonly Picked[]): Picked[] {
  return picks.filter((p) => text.includes(`@${p.label}`));
}
