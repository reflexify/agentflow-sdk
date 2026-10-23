import type { Editor } from '@tiptap/core';
import type { MentionMenuItem, ResolvedMention } from '@reflexify/agentflow-sdk';
import type { KitStrings } from './text.js';
export type MentionMap = Record<string, ResolvedMention> | null | undefined;
export interface SuggestEntry {
    /** A mention to insert, the rest of a group's hits, or an entity the menu did not search. */
    kind: 'item' | 'more' | 'scope';
    group: string;
    title: string;
    item?: MentionMenuItem;
    more?: {
        count: number;
        group: string;
        label: string;
    };
    scope?: {
        group: string;
        label: string;
    };
}
/** The `group` an entry that is not a mention asks the source for. */
export declare const groupAsked: (entry: SuggestEntry) => string | null;
export interface SuggestState {
    query: string;
    entries: SuggestEntry[];
    loading: boolean;
    rect: (() => DOMRect | null) | null;
    command(entry: SuggestEntry): void;
}
export interface MentionController {
    show(state: SuggestState): void;
    update(state: SuggestState): void;
    hide(): void;
    key(event: KeyboardEvent): boolean;
}
export interface Chip {
    render(): void;
}
export interface MentionStorage {
    map: MentionMap;
    strings: Pick<Required<KitStrings>, 'mentionRestricted' | 'mentionRestrictedPerson' | 'mentionDeleted'>;
    inserted: Set<string>;
    views: Set<Chip>;
}
/**
 * A chip's reading. A target the response's map does not hold is restricted, whatever label the token stores:
 * only a chip the person inserted in this editor keeps its own label.
 */
export declare function drawChip(ref: string, label: string, storage: MentionStorage, root?: Document): HTMLElement;
export declare const storageOf: (editor: Editor) => MentionStorage;
/** Points every drawn chip at a new map, and at new strings. */
export declare function setMentionContext(editor: Editor, ctx: {
    map: MentionMap;
    strings: MentionStorage['strings'];
}): void;
//# sourceMappingURL=mention-chip.d.ts.map