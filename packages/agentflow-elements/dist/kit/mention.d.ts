import type { MentionMenuSource } from '@reflexify/agentflow-sdk';
import { type MentionController, type MentionStorage, type SuggestEntry } from './mention-chip.js';
export { resolveMention, type MentionView } from './mention-chip.js';
export { escapeLabel, scanToken, tokenFor, type ScannedMention } from './mention-token.js';
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