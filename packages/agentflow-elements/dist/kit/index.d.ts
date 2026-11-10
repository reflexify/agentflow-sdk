import { KIT_VERSION } from './version.js';
export declare const KIT_TAGS: readonly string[];
export { KIT_VERSION };
/**
 * Defines each kit tag that is not defined yet. A tag another copy of the kit registered first stays, so a page can hold an
 * older copy than this one: that is reported once per tag, and a module feature-detects anything newer than what it requires.
 */
export declare function defineKitElements(registry?: CustomElementRegistry): void;
export { KIT_CSS } from './css.js';
export { loadFonts } from './fonts.js';
export { claimEscape } from './escape.js';
export type { KitFontFace } from './fonts.js';
export type { KitStrings } from './text.js';
export type { AfSubmitDetail, FormError } from './form/form.js';
export type { KitLocale } from './text.js';
export type { AfDrillDetail, AfListColumn, AfListRow, AfOpenRecordDetail, AfPageDetail, AfTilePaging, AfTileResult, AfTileSpec } from './tile/types.js';
export interface MenuItem {
    id: string;
    label: string;
    disabled?: boolean;
    reason?: string;
    danger?: boolean;
    tone?: 'success' | 'warning' | 'info' | 'danger';
    type?: 'checkbox' | 'radio';
    checked?: boolean;
}
export interface MenuGroup {
    id: string;
    heading?: string;
    items: MenuItem[];
}
/** An entry of `af-menu`'s `items`: a group is an entry with `items`. */
export type MenuEntry = MenuItem | MenuGroup;
export interface TabItem {
    value: string;
    label: string;
    disabled?: boolean;
    reason?: string;
}
/** A row of `af-file-upload`: a file the page is uploading, has stored, or failed to upload. */
export interface FileItem {
    id: string;
    name: string;
    size?: number | null;
    status: 'uploading' | 'done' | 'failed';
    /** 0 to 100, while uploading. */
    progress?: number | null;
    error?: string | null;
    /** The name opens it in a new tab. */
    href?: string | null;
    /** An image drawn as the row's thumbnail. */
    preview?: string | null;
}
export interface ToastInput {
    kind: 'success' | 'error' | 'info';
    text: string;
    action?: {
        id: string;
        label: string;
    };
}
export type { MentionMenu, MentionMenuGroup, MentionMenuItem, MentionMenuSource, ResolvedMention } from '@reflexify/agentflow-sdk';
export type { FileSetEnvelope, FolderPreview, FolderSources, SlotFolder } from '@reflexify/agentflow-sdk';
export type { ComboboxOption, Person, PickerPage, PickerQuery, PickerSource, SelectOption, TreeNode } from '@reflexify/agentflow-sdk';
//# sourceMappingURL=index.d.ts.map