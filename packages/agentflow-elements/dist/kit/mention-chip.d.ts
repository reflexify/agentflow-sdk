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
export declare function initial(name: string): string;
/** The outline of a record's icon, drawn at 24 by 24 with a stroke. */
export declare const RECORD_ICON_PATH = "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5";
export type ChipStrings = MentionStorage['strings'];
/** What a chip shows. `unresolved` is a target the map does not hold, drawn with the token's own label in the muted look. */
export interface ChipReading {
    state: 'ok' | 'restricted' | 'deleted' | 'unresolved';
    text: string;
    href: string | null;
}
/**
 * A chip's reading from what the server resolved for this viewer. `missing` is how a target the map does not hold reads:
 * restricted, its own label (the editor's chip the person inserted), or unresolved.
 */
export declare function readChip(ref: string, label: string, resolved: ResolvedMention | undefined, missing: 'restricted' | 'own' | 'unresolved'): ChipReading;
/** What a mention chip says and links to, for one reader, with its wording applied: what the list tile draws a token as. */
export interface MentionView {
    kind: string;
    state: 'ok' | 'restricted' | 'deleted';
    label: string;
    href: string | null;
}
/**
 * A token's reading, worded. A target the response's map does not hold is restricted, whatever label the token stores:
 * only a chip the person inserted in this editor (`inserted`) keeps its own label.
 */
export declare function resolveMention(ref: string, label: string, map: MentionMap, strings: ChipStrings, inserted?: boolean): MentionView;
/** The chip's markup for a reading: the kind's avatar or icon and the label, the restricted and deleted wording from `strings`. */
export declare function chipElement(ref: string, reading: ChipReading, strings: ChipStrings, root?: Document): HTMLElement;
/**
 * The editor's chip. A target the response's map does not hold is restricted, whatever label the token stores:
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