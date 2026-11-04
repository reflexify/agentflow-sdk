/** The package version, stamped on each of the five element classes as `elementsVersion`. */
export declare const ELEMENTS_VERSION = "0.9.0";
/**
 * Defines each tag that is not defined yet. A tag another copy registered first stays, so a page can hold an older copy
 * than this one: that is reported once per tag, and a module feature-detects what it needs, such as `'client' in provider`.
 */
export declare function defineAgentFlowElements(registry?: CustomElementRegistry): void;
export { signIn, signOut } from './session.js';
export type * from './types.js';
export type { Locale, StringKey, Strings } from './i18n.js';
//# sourceMappingURL=index.d.ts.map