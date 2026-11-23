export interface SessionMarks {
  resentIds: string[];
  hasEmail: boolean;
  verified: boolean;
}

export interface SessionStore {
  readonly marksKey: string;
  load(): string | null;
  save(token: string): void;
  forget(): void;
  marks(): SessionMarks;
  mark(marks: SessionMarks): void;
}

const RESENT_KEPT = 20;

/**
 * The visitor's token in the site's `localStorage`, and in memory beside it: `window.localStorage` throws when the
 * browser's settings block site data, for the site or for a frame another site embeds, and the session then lasts
 * for the page's life.
 */
export function sessionStore(publicKey: string): SessionStore {
  const key = `agentflow-chat:${publicKey}`;
  const marksKey = `${key}:marks`;
  let memory: string | null = null;
  let marks: SessionMarks = { resentIds: [], hasEmail: false, verified: false };
  const attempt = <T>(use: (storage: Storage) => T): T | null => {
    try {
      return use(window.localStorage);
    } catch {
      return null;
    }
  };
  const stored = (): SessionMarks | null => {
    const parsed = attempt((storage) => JSON.parse(storage.getItem(marksKey) ?? 'null') as Partial<SessionMarks> | null);
    if (!parsed) return null;
    return {
      resentIds: Array.isArray(parsed.resentIds) ? parsed.resentIds.filter((id) => typeof id === 'string') : [],
      hasEmail: parsed.hasEmail === true,
      verified: parsed.verified === true,
    };
  };
  return {
    marksKey,
    load: () => attempt((storage) => storage.getItem(key)) ?? memory,
    save: (token) => {
      memory = token;
      attempt((storage) => storage.setItem(key, token));
    },
    forget: () => {
      memory = null;
      marks = { resentIds: [], hasEmail: false, verified: false };
      attempt((storage) => {
        storage.removeItem(key);
        storage.removeItem(marksKey);
      });
    },
    marks: () => stored() ?? marks,
    mark: (next) => {
      marks = { ...next, resentIds: next.resentIds.slice(-RESENT_KEPT) };
      attempt((storage) => storage.setItem(marksKey, JSON.stringify(marks)));
    },
  };
}
