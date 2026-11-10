/** The editor's mention token, `@[label](mention:<kind>/<id>)`, read and written apart from the editor so the Markdown view and the list tile can read it without loading it. */
export interface ScannedMention {
    raw: string;
    ref: string;
    label: string;
}
export declare function escapeLabel(label: string): string;
export declare const tokenFor: (ref: string, label: string) => string;
/** The token at the very start of `src`, or null when what is there is not a well-formed one. */
export declare function scanToken(src: string): ScannedMention | null;
//# sourceMappingURL=mention-token.d.ts.map