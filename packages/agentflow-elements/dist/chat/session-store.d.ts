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
/**
 * The visitor's token in the site's `localStorage`, and in memory beside it: `window.localStorage` throws when the
 * browser's settings block site data, for the site or for a frame another site embeds, and the session then lasts
 * for the page's life.
 */
export declare function sessionStore(publicKey: string): SessionStore;
//# sourceMappingURL=session-store.d.ts.map