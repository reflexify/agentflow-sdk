/** The package version, stamped on each element class as `elementsVersion`. */
export declare const ELEMENTS_VERSION = "0.12.0";
/**
 * Defines each tag that is not defined yet. A tag another copy registered first stays, so a page can hold an older copy
 * than this one: that is reported once per tag, and a module feature-detects what it needs, such as `'client' in provider`.
 * The kit's `af-folder-source`, which a start form draws a folder field with, is not among them: `defineFolderSource` loads
 * and defines it when a folder field first appears.
 */
export declare function defineAgentFlowElements(registry?: CustomElementRegistry): void;
export { defineFolderSource } from './folder-source.js';
export { signIn, signOut } from './session.js';
export { consumeTask } from './task-context.js';
export type * from './types.js';
export type { Locale, StringKey, Strings } from './i18n.js';
//# sourceMappingURL=index.d.ts.map