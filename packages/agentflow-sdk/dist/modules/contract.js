/**
 * The contract version this SDK's hosts implement. A module may declare 1 to 6: 1 lacks `assistant`, 1 and 2
 * lack `signing`, 1 to 3 lack the item list, `kinds` and `open`, 1 to 4 lack `tasks`, and 1 to 5 lack `files`.
 */
export const APP_CONTRACT_VERSION = 6;
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
const PREVIEW_FILES_MAX = 200;
/**
 * The list `host.files.preview` was given as `AppPreviewFile`s, with each id trimmed and a `filename` kept
 * only when it is a string. A string or one object is a list of one. Throws a `TypeError` whose message
 * starts `files.preview:` for an empty list, more than 200 files, or an entry that is not a file id or an
 * object with a `file` that is a non-empty string once trimmed. Every host calls it first.
 */
export function normalizePreviewFiles(files) {
    const list = Array.isArray(files) ? files : [files];
    if (list.length === 0)
        throw new TypeError('files.preview: the list of files is empty');
    if (list.length > PREVIEW_FILES_MAX)
        throw new TypeError(`files.preview: ${list.length} files given, at most ${PREVIEW_FILES_MAX}`);
    return list.map((entry, index) => {
        const object = typeof entry === 'object' && entry !== null && !Array.isArray(entry) ? entry : undefined;
        const id = typeof entry === 'string' ? entry : object?.file;
        if (typeof id !== 'string')
            throw new TypeError(`files.preview: entry ${index} is neither a file id nor an object with a file id`);
        const file = id.trim();
        if (!file)
            throw new TypeError(`files.preview: entry ${index} has an empty file id`);
        return object && typeof object.filename === 'string' ? { file, filename: object.filename } : { file };
    });
}
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