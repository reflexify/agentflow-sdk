/** The package version, stamped on each element class as `elementsVersion`. */
export declare const ELEMENTS_VERSION = "0.14.0";
/**
 * Defines each tag that is not defined yet. A tag another copy registered first stays, so a page can hold an older copy
 * than this one: that is reported once per tag, and a module feature-detects what it needs, such as `'client' in provider`.
 * The kit's `af-folder-source`, which a start form draws a folder field with, `af-activity-feed`, which the record activity
 * draws its lines with, and `af-comment-thread`, which the record comments draw a thread with (and the editor, Markdown view, file
 * picker and confirmation that thread draws), are not among them: each is loaded and defined when an element first needs it.
 */
export declare function defineAgentFlowElements(registry?: CustomElementRegistry): void;
export { defineFolderSource } from './folder-source.js';
export { signIn, signOut } from './session.js';
export { consumeTask } from './task-context.js';
export type * from './types.js';
export type * from './element-types.js';
export type { Locale, StringKey, Strings } from './i18n.js';
//# sourceMappingURL=index.d.ts.map