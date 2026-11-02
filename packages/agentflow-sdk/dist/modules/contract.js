/**
 * The contract version this SDK's hosts implement. A module may declare 1, 2 or 3: 1 lacks `assistant`,
 * and 1 and 2 lack `signing`.
 */
export const APP_CONTRACT_VERSION = 3;
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