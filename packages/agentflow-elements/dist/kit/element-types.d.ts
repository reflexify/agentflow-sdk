import type { FileSetEnvelope, FolderPreview, FollowRefusal, RunDoneStatus } from '@reflexify/agentflow-sdk';
import type { ToastInput } from './index.js';
export interface AfToastElement extends HTMLElement {
    show(input: ToastInput): string;
    dismiss(id: string): void;
}
/** The scroll area's element. `viewport` is the element that scrolls: listen for `scroll` on it, or set its `scrollTop`. */
export interface AfScrollAreaElement extends HTMLElement {
    readonly viewport: HTMLElement | null;
}
/** The bulk bar's element. `focus()` moves focus to its first enabled action, else its clear button: bind your page's shortcut to it. */
export interface AfBulkBarElement extends HTMLElement {
    focus(): void;
}
/** The signature pad's element. `clear()` empties the pad and its image, and raises `change` with `null`. */
export interface AfSignaturePadElement extends HTMLElement {
    clear(): void;
}
/** The editor's element. Its Tiptap instance is not part of the contract, and has no type here. */
export interface AfRichEditorElement extends HTMLElement {
}
export interface DialogCloseDetail {
    reason: 'escape' | 'outside' | 'close-button';
}
export interface ConfirmCancelDetail {
    reason: 'escape' | 'close-button';
}
export interface PopoverCloseDetail {
    reason: 'escape' | 'outside';
}
/** `checked` is the state a checkbox or radio item would take; the page sets it back. */
export interface MenuSelectDetail {
    id: string;
    checked?: boolean;
}
export interface ToastActionDetail {
    toast: string;
    action: string;
}
export interface DateChangeDetail {
    value: string | null;
}
export interface DateRangeChangeDetail {
    start: string | null;
    end: string | null;
}
/** The text an `af-date` with a `format` refused because it does not read as a date in that format. */
export interface DateUnparsedDetail {
    text: string;
}
export interface PersonChangeDetail {
    value: string | string[] | null;
}
export interface PersonSearchDetail {
    query: string;
}
export interface NumberChangeDetail {
    value: number | null;
}
/** The text an `af-number-input` refused because its separators cannot be a number in the element's language. */
export interface NumberUnparsedDetail {
    text: string;
}
export interface SelectChangeDetail {
    value: string | string[] | null;
}
export interface ComboboxChangeDetail {
    value: string | string[] | null;
}
export interface ComboboxSearchDetail {
    query: string;
}
/** An id, or the ids with `multiple`. */
export interface TreePickerChangeDetail {
    value: string | string[] | null;
}
export interface TreePickerSearchDetail {
    query: string;
}
export interface RichEditorChangeDetail {
    value: string;
}
export interface TabChangeDetail {
    value: string;
}
export interface SizeChangeDetail {
    size: number;
}
export interface PageSizeChangeDetail {
    pageSize: number;
}
/** `ok` is whether the text reached the clipboard. */
export interface AfCopyDetail {
    value: string;
    ok: boolean;
}
/** The files a drop or a pick gave, each fitting `accept` and `max-files`. The element keeps none of them. */
export interface FilesAddDetail {
    files: File[];
}
export interface FileRemoveDetail {
    id: string;
}
/** A PNG data URL of the strokes when a stroke ends, and `null` after a clear. */
export interface SignatureChangeDetail {
    value: string | null;
}
/** An upload set exists: keep `setId` and pass it back as `resumeSet` to continue the upload after a reload. */
export interface FolderUploadStartedDetail {
    setId: string;
}
export interface FolderProgressDetail {
    stored: number;
    total: number;
}
/** `busy` from a pick or a choice until its value is known, the upload fails or the person cancels: a launch made meanwhile goes without it. */
export interface FolderBusyDetail {
    busy: boolean;
}
/** The value to launch with and what a launch would take; both `null` while the person is choosing again. */
export interface FolderChangeDetail {
    value: FileSetEnvelope | null;
    preview: FolderPreview | null;
}
/**
 * A call through `sources` failed. `status` and `code` are the server's, or `null` when none answered, and `message` its own
 * sentence, in English. The element has already said so to the person, in its own words and the page's language.
 */
export interface FolderErrorDetail {
    during: 'upload' | 'preview' | 'list';
    status: number | null;
    code: string | null;
    message: string;
}
/** The Markdown the composer holds and the ids of the files it uploaded, the page's to send. The draft stays until the page calls `settle()`. */
export interface CommentSubmitDetail {
    body: string;
    attachment_ids: string[];
}
/** An edited comment: its new Markdown, its files in full (the ones kept and the ones added), as `comments.update` takes them, and `version`, the comment's version (`edited_at`, else `created_at`) when the edit opened, to send as `If-Match` so a change made since is a conflict. */
export interface CommentEditDetail {
    id: string;
    body: string;
    attachment_ids: string[];
    version: string;
}
/** The person confirmed deleting this comment. */
export interface CommentDeleteDetail {
    id: string;
}
/** A file chip was pressed: the comment's files in order, as `host.files.preview` takes them, and the index of the one pressed. */
export interface CommentOpenFileDetail {
    files: {
        file: string;
        filename: string;
    }[];
    start: number;
}
/** The thread's element. The page calls `settle()` after a send or an edit succeeded: the composer is cleared, or the edit closed. After a failure it sets `error` instead. */
export interface AfCommentThreadElement extends HTMLElement {
    settle(): void;
}
/** A link's href, or `mention:<ref>` for a mention chip. The event is cancelable: `preventDefault()` keeps the link from opening. */
export interface AfLinkDetail {
    href: string;
}
/** The followed run ended: read its outputs from the stored run now, not at a step's end, which can arrive before the output is stored. */
export interface RunDoneDetail {
    status: RunDoneStatus;
}
/** The follow's own news, as the source yielded it. After `lagged` frames were lost and the follow goes on; after `ended` or `refused` nothing more comes. */
export interface RunFollowDetail {
    state: 'ended' | 'refused' | 'lagged';
    reason?: FollowRefusal;
}
//# sourceMappingURL=element-types.d.ts.map