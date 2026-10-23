import type { MentionMenuSource } from '@reflexify/agentflow-sdk';
import { type MentionController, type MentionStorage, type SuggestEntry } from './mention-chip.js';
export interface ScannedMention {
    raw: string;
    ref: string;
    label: string;
}
export declare function escapeLabel(label: string): string;
export declare const tokenFor: (ref: string, label: string) => string;
/** The token at the very start of `src`, or null when what is there is not a well-formed one. */
export declare function scanToken(src: string): ScannedMention | null;
export interface MentionOptions {
    source(): MentionMenuSource | null;
    controller: MentionController;
    strings(): MentionStorage['strings'];
}
export declare function flatten(menu: Awaited<ReturnType<MentionMenuSource>>): SuggestEntry[];
/** The section of the entities the menu did not search. */
export declare const UNSEARCHED = "unsearched";
export declare function createMention(opts: MentionOptions): import("@tiptap/core").Node<import("@tiptap/extension-mention").MentionOptions<any, import("@tiptap/extension-mention").MentionNodeAttrs>, any>;
//# sourceMappingURL=mention.d.ts.map