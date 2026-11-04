/**
 * The contract version this SDK's hosts implement. A module may declare 1 to 4: 1 lacks `assistant`, 1 and 2
 * lack `signing`, and 1 to 3 lack the item list, `kinds` and `open`.
 */
export const APP_CONTRACT_VERSION = 4;
/** What a host takes of the assistant's items; over any of these the question is refused. */
export const APP_ASSISTANT_ITEMS_MAX = 5;
export const APP_ASSISTANT_RECORDS_MAX = 50;
/** UTF-8 bytes of `JSON.stringify(text)`, quotes included. */
export const APP_ASSISTANT_TEXT_MAX_BYTES = 12288;
/** UTF-8 bytes of `JSON.stringify(data)`. */
export const APP_ASSISTANT_DATA_MAX_BYTES = 4096;
/** Characters. */
export const APP_ASSISTANT_LABEL_MAX = 80;
/** Characters. */
export const APP_ASSISTANT_PROMPT_MAX = 2000;
/**
 * The module's own path for an address-bar `href` (`pathname + search + hash`) under `basePath`. It
 * always starts with `/` and keeps the query and fragment; a pathname outside `basePath` gives `/`.
 */
export function modulePath(href, basePath) {
    const cut = href.search(/[?#]/);
    const pathname = cut === -1 ? href : href.slice(0, cut);
    const rest = cut === -1 ? '' : href.slice(cut);
    const base = basePath.replace(/\/+$/, '');
    if (!base)
        return `${pathname || '/'}${rest}`;
    if (pathname === base || pathname === `${base}/`)
        return `/${rest}`;
    return pathname.startsWith(`${base}/`) ? `${pathname.slice(base.length)}${rest}` : '/';
}
/** The address-bar `href` for the module's own `path` under `basePath`, query and fragment kept. */
export function hostPath(basePath, path) {
    const base = basePath.replace(/\/+$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
//# sourceMappingURL=contract.js.map