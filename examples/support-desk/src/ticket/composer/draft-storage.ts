// Everything a person has typed and not yet saved is kept per person and per ticket: on a shared workstation the next
// person to sign in to this tab must not find, or send, the last one's words.
const FAMILIES = ['draft', 'draft-base', 'note'] as const;
const key = (family: (typeof FAMILIES)[number], meId: string, ticketId: string) => `support-desk:${family}:${meId}:${ticketId}`;

/** Unsaved reply text for a ticket, kept in this tab until the server holds it. */
export function storedDraft(meId: string, ticketId: string): string | null {
  try {
    return window.sessionStorage.getItem(key('draft', meId, ticketId));
  } catch {
    return null;
  }
}

/**
 * The draft the unsaved text was written onto: its `updatedAt`, or null when the ticket had no draft then. Undefined
 * when nothing says (text kept by an older page), which is treated as "unchanged".
 */
export function storedBase(meId: string, ticketId: string): string | null | undefined {
  try {
    const v = window.sessionStorage.getItem(key('draft-base', meId, ticketId));
    return v === null ? undefined : v === '' ? null : v;
  } catch {
    return undefined;
  }
}

/** Keeps `text` for the ticket, with the version of the draft it stands on; null removes both. */
export function storeDraft(meId: string, ticketId: string, text: string | null, base: string | null = null): void {
  try {
    if (text === null) {
      window.sessionStorage.removeItem(key('draft', meId, ticketId));
      window.sessionStorage.removeItem(key('draft-base', meId, ticketId));
    } else {
      window.sessionStorage.setItem(key('draft', meId, ticketId), text);
      window.sessionStorage.setItem(key('draft-base', meId, ticketId), base ?? '');
    }
  } catch {
    // Storage refused (a private window): the text lives only in the composer.
  }
}

/** A note being written for a ticket, kept in this tab until it is added. */
export function storedNote(meId: string, ticketId: string): string | null {
  try {
    return window.sessionStorage.getItem(key('note', meId, ticketId));
  } catch {
    return null;
  }
}

export function storeNote(meId: string, ticketId: string, text: string | null): void {
  try {
    if (text === null || text === '') window.sessionStorage.removeItem(key('note', meId, ticketId));
    else window.sessionStorage.setItem(key('note', meId, ticketId), text);
  } catch {
    // Storage refused: the note lives only in the composer.
  }
}

/** Forgets every reply and note this person kept in this tab, for the moment they sign out. */
export function forgetKeptText(meId: string): void {
  try {
    const mine = FAMILIES.map((family) => `support-desk:${family}:${meId}:`);
    const keys = Array.from({ length: window.sessionStorage.length }, (_, i) => window.sessionStorage.key(i));
    for (const k of keys) if (k !== null && mine.some((prefix) => k.startsWith(prefix))) window.sessionStorage.removeItem(k);
  } catch {
    // Storage refused: nothing was kept.
  }
}
