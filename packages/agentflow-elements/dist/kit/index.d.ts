import { KIT_VERSION } from './version.js';
export declare const KIT_TAGS: readonly string[];
export { KIT_VERSION };
/**
 * Defines each kit tag that is not defined yet. A tag another copy of the kit registered first stays, so a page can hold an
 * older copy than this one: that is reported once per tag, and a module feature-detects anything newer than what it requires.
 */
export declare function defineKitElements(registry?: CustomElementRegistry): void;
export { KIT_CSS } from './css.js';
export type { KitStrings } from './text.js';
export type { KitLocale } from './text.js';
export interface MenuItem {
    id: string;
    label: string;
    disabled?: boolean;
    reason?: string;
    danger?: boolean;
}
export interface Person {
    id: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
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
//# sourceMappingURL=index.d.ts.map