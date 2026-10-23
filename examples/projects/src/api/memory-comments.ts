import { personToken, scanMentions } from '../model/mentions.js';

export interface StoredComment {
  id: string; record: string; author: string; body: string; createdAt: string; editedAt: string | null; files: string[]; seq: number;
}

export const COMMENT_BODY_MAX = 10_000;
export const COMMENT_FILES_MAX = 10;

type Target = { state: 'ok'; kind: 'user'; id: string; label: string; href: string }
  | { state: 'ok'; kind: 'record'; id: string; entity_id: string; entity_label: string; href: string; label: string }
  | { state: 'restricted' | 'deleted'; kind: string };

export interface Resolver {
  /** The person's current name, or null when there is no such person. */
  person(id: string): string | null;
  /** A record the viewer may read: its entity's name and its display value; `'restricted'` or `'deleted'` otherwise. */
  record(entityId: string, recordId: string): { entityLabel: string; label: string } | 'restricted' | 'deleted';
}

/**
 * A body as a viewer may read it: a person's token carries their current name (a person who is gone keeps the stored
 * label), a record's carries its display value, and one the viewer may not read, or that is deleted, an empty label.
 */
export function renderBody(body: string, r: Resolver): { body: string; mentions: Record<string, Target> } {
  const mentions: Record<string, Target> = {};
  let out = '';
  let at = 0;
  for (const t of scanMentions(body)) {
    out += body.slice(at, t.start);
    at = t.end;
    if (t.kind === 'user') {
      const id = t.target.slice('user/'.length);
      const name = r.person(id);
      const label = name ?? t.label;
      mentions[t.target] = { state: 'ok', kind: 'user', id, label, href: `/directory/users/${id}` };
      out += personToken(label, id);
      continue;
    }
    const [, entityId = '', recordId = ''] = t.target.split('/');
    const found = r.record(entityId, recordId);
    if (typeof found === 'string') {
      mentions[t.target] = { state: found, kind: 'record' };
      out += `@[](mention:${t.target})`;
    } else {
      mentions[t.target] = {
        state: 'ok', kind: 'record', id: recordId, entity_id: entityId, entity_label: found.entityLabel, href: `/entities/${entityId}/records/${recordId}`, label: found.label,
      };
      out += `@[${found.label.replace(/[\\[\]]/g, '\\$&')}](mention:${t.target})`;
    }
  }
  return { body: out + body.slice(at), mentions };
}

/** A token sent with an empty label keeps the label the comment stored for the same target. */
export function restoreLabels(sent: string, stored: string): string {
  const kept = new Map(scanMentions(stored).map((t) => [t.target, t.label] as const));
  let out = '';
  let at = 0;
  for (const t of scanMentions(sent)) {
    out += sent.slice(at, t.start);
    at = t.end;
    const label = t.label === '' ? kept.get(t.target) : undefined;
    out += label === undefined ? sent.slice(t.start, t.end) : `@[${label.replace(/[\\[\]]/g, '\\$&')}](mention:${t.target})`;
  }
  return out + sent.slice(at);
}

/** The people a body names. */
export const peopleIn = (body: string): string[] =>
  [...new Set(scanMentions(body).filter((t) => t.kind === 'user').map((t) => t.target.slice('user/'.length)))];

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Whether every word typed begins a word of the name or the start of the email, accents and case ignored. */
export function matchesPerson(q: string, name: string, email: string | null): boolean {
  const typed = fold(q).split(/\s+/).filter(Boolean).slice(0, 8);
  const words = fold(name).split(/\s+/);
  const mail = email ? fold(email) : null;
  return typed.every((w) => words.some((x) => x.startsWith(w)) || (mail !== null && mail.startsWith(w)));
}
