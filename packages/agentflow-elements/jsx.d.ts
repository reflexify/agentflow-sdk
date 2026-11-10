import type { AgentFlowClient, AppSigning, AppTasks } from '@reflexify/agentflow-sdk';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type {
  AccessLostDetail, RecordCreatedDetail, RecordSelectDetail, RequestFailedDetail, SessionReadyDetail, Strings,
  TaskChangedDetail, TaskClaimedDetail, TaskEventDetail, TaskReleasedDetail, TaskSelectDetail, TaskSignedDetail, TaskSubmittedDetail, WorkflowStartedDetail,
} from './dist/index.js';
import type {
  AfDrillDetail, AfListColumn, AfListRow, AfOpenRecordDetail, AfPageDetail, AfSubmitDetail, AfTilePaging, AfTileResult, AfTileSpec, ComboboxOption, FileItem, FileSetEnvelope, FolderPreview, FolderSources, FormError, KitStrings, MenuEntry, MentionMenuSource, Person, PickerSource, ResolvedMention, SelectOption, SlotFolder, TabItem, ToastInput, TreeNode,
} from './dist/kit/index.js';

type Base = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
type On<T> = (event: CustomEvent<T>) => void;
type Kit<T extends HTMLElement = HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T> & {
  part?: string;
  class?: string;
  locale?: string | null;
  strings?: Partial<KitStrings> | null;
};

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
export interface AfRichEditorElement extends HTMLElement {}
export interface DialogCloseDetail { reason: 'escape' | 'outside' | 'close-button' }
export interface ConfirmCancelDetail { reason: 'escape' | 'close-button' }
export interface PopoverCloseDetail { reason: 'escape' | 'outside' }
/** `checked` is the state a checkbox or radio item would take; the page sets it back. */
export interface MenuSelectDetail { id: string; checked?: boolean }
export interface ToastActionDetail { toast: string; action: string }
export interface DateChangeDetail { value: string | null }
export interface DateRangeChangeDetail { start: string | null; end: string | null }
/** The text an `af-date` with a `format` refused because it does not read as a date in that format. */
export interface DateUnparsedDetail { text: string }
export interface PersonChangeDetail { value: string | string[] | null }
export interface PersonSearchDetail { query: string }
export interface NumberChangeDetail { value: number | null }
/** The text an `af-number-input` refused because its separators cannot be a number in the element's language. */
export interface NumberUnparsedDetail { text: string }
export interface SelectChangeDetail { value: string | string[] | null }
export interface ComboboxChangeDetail { value: string | string[] | null }
export interface ComboboxSearchDetail { query: string }
/** An id, or the ids with `multiple`. */
export interface TreePickerChangeDetail { value: string | string[] | null }
export interface TreePickerSearchDetail { query: string }
export interface RichEditorChangeDetail { value: string }
export interface TabChangeDetail { value: string }
export interface SizeChangeDetail { size: number }
export interface PageSizeChangeDetail { pageSize: number }
/** `ok` is whether the text reached the clipboard. */
export interface AfCopyDetail { value: string; ok: boolean }
/** The files a drop or a pick gave, each fitting `accept` and `max-files`. The element keeps none of them. */
export interface FilesAddDetail { files: File[] }
export interface FileRemoveDetail { id: string }
/** A PNG data URL of the strokes when a stroke ends, and `null` after a clear. */
export interface SignatureChangeDetail { value: string | null }
/** An upload set exists: keep `setId` and pass it back as `resumeSet` to continue the upload after a reload. */
export interface FolderUploadStartedDetail { setId: string }
export interface FolderProgressDetail { stored: number; total: number }
/** `busy` from a pick or a choice until its value is known, the upload fails or the person cancels: a launch made meanwhile goes without it. */
export interface FolderBusyDetail { busy: boolean }
/** The value to launch with and what a launch would take; both `null` while the person is choosing again. */
export interface FolderChangeDetail { value: FileSetEnvelope | null; preview: FolderPreview | null }
/**
 * A call through `sources` failed. `status` and `code` are the server's, or `null` when none answered, and `message` its own
 * sentence, in English. The element has already said so to the person, in its own words and the page's language.
 */
export interface FolderErrorDetail { during: 'upload' | 'preview' | 'list'; status: number | null; code: string | null; message: string }
/** A link's href, or `mention:<ref>` for a mention chip. The event is cancelable: `preventDefault()` keeps the link from opening. */
export interface AfLinkDetail { href: string }

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'agentflow-provider': Base & {
        'base-path'?: string;
        locale?: 'en' | 'vi';
        strings?: Strings;
        fetchImpl?: typeof fetch;
        signing?: AppSigning;
        tasks?: AppTasks;
        client?: AgentFlowClient;
        'onsession-ready'?: On<SessionReadyDetail>;
        'onsigned-out'?: On<Record<string, never>>;
        'onaccess-lost'?: On<AccessLostDetail>;
        'onrequest-failed'?: On<RequestFailedDetail>;
      };
      'agentflow-task': Base & {
        record: string;
        entity?: string;
        'onagentflow-task-submitted'?: On<TaskEventDetail>;
        'onagentflow-task-claimed'?: On<TaskEventDetail>;
        'onagentflow-task-released'?: On<TaskEventDetail>;
        'onagentflow-task-signed'?: On<TaskEventDetail>;
        'onagentflow-task-declined'?: On<TaskEventDetail>;
        'onagentflow-task-changed'?: On<TaskEventDetail>;
      };
      'agentflow-task-inbox': Base & {
        view?: 'all' | 'mine' | 'claimable';
        'page-size'?: number;
        signs?: 'true' | 'false';
        'ontask-select'?: On<TaskSelectDetail>;
      };
      'agentflow-task-detail': Base &
        ({ 'entity-id': string; 'entity-key'?: never } | { 'entity-key': string; 'entity-id'?: never }) & {
        'record-id': string;
        'ontask-claimed'?: On<TaskClaimedDetail>;
        'ontask-released'?: On<TaskReleasedDetail>;
        'ontask-submitted'?: On<TaskSubmittedDetail>;
        'onagentflow-signed'?: On<TaskSignedDetail>;
        'onagentflow-declined'?: On<TaskSignedDetail>;
        'onagentflow-task-changed'?: On<TaskChangedDetail>;
      };
      'agentflow-record-table': Base &
        ({ 'entity-id': string; 'entity-key'?: never } | { 'entity-key': string; 'entity-id'?: never }) & {
        columns?: string;
        'page-size'?: number;
        filter?: object;
        'onrecord-select'?: On<RecordSelectDetail>;
        'onrecord-created'?: On<RecordCreatedDetail>;
      };
      'agentflow-start-form': Base & {
        'workflow-id'?: string;
        'workflow-key'?: string;
        entity?: string;
        record?: string;
        action?: string;
        'subject-entity'?: string;
        'subject-record'?: string;
        /** An upload set to continue, by folder field key: the `setId` an `af-folder-upload-started` carried for that `field`. */
        resumeSets?: Record<string, string>;
        'onworkflow-started'?: On<WorkflowStartedDetail>;
        'onaf-folder-upload-started'?: On<{ setId: string; field: string }>;
      };
      'af-dialog': Kit & {
        open?: boolean | null;
        heading?: string | null;
        placement?: 'center' | 'end' | null;
        onclose?: On<DialogCloseDetail>;
      };
      'af-confirm': Kit & {
        open?: boolean | null;
        heading?: string | null;
        message?: string | null;
        'confirm-label'?: string | null;
        danger?: boolean | null;
        impact?: string | null;
        busy?: boolean | null;
        onconfirm?: On<Record<string, never>>;
        oncancel?: On<ConfirmCancelDetail>;
      };
      'af-menu': Kit & {
        items?: MenuEntry[] | null;
        label?: string | null;
        /** Locks the trigger: it is `aria-disabled`, the menu cannot open, and one that is open closes. */
        disabled?: boolean | null;
        /** Why the menu is locked, shown in a tooltip on the trigger. */
        reason?: string | null;
        onselect?: On<MenuSelectDetail>;
      };
      'af-popover': Kit & {
        open?: boolean | null;
        placement?: string | null;
        onclose?: On<PopoverCloseDetail>;
      };
      'af-tooltip': Kit & {
        text?: string | null;
      };
      'af-toast': Kit<AfToastElement> & {
        onaction?: On<ToastActionDetail>;
      };
      'af-date': Kit & {
        value?: string | null;
        min?: string | null;
        max?: string | null;
        clearable?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        start?: string | null;
        end?: string | null;
        /** A mask of `DD`, `MM` and `YYYY` once each with non-letters between (`DD.MM.YYYY`): shows and reads the date in it in every language, keeps typed text it cannot read and marks it. Any other mask, and range mode, ignore it. */
        format?: string | null;
        onunparsed?: On<DateUnparsedDetail>;
      } & (
        | { range?: false | null; onchange?: On<DateChangeDetail> }
        | { range: true; onchange?: On<DateRangeChangeDetail> }
      );
      'af-person-picker': Kit & {
        people?: Person[] | null;
        source?: PickerSource<Person> | null;
        value?: string | string[] | null;
        multiple?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        loading?: boolean | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        onchange?: On<PersonChangeDetail>;
        onsearch?: On<PersonSearchDetail>;
      };
      'af-number-input': Kit & {
        value?: number | null;
        min?: number | null;
        max?: number | null;
        step?: number | null;
        precision?: number | null;
        /** With no `precision`, keeps up to 20 fraction digits as typed and shows as many as the value has, rather than rounding to the step's. */
        fractional?: boolean | null;
        /** With `format="percent"`, the value is the percentage itself (12.5 is 12.5%), not a fraction (0.125); `min`, `max` and `step` are in points. */
        unscaled?: boolean | null;
        format?: 'plain' | 'currency' | 'percent' | null;
        currency?: string | null;
        /** The separators the number is shown and typed with: `comma_dot` 1,234.5, `dot_comma` 1.234,5, `space_comma` 1 234,5, `none` 1234.5 with the language's decimal, or `locale` (the default) the language's own. */
        separators?: 'locale' | 'comma_dot' | 'dot_comma' | 'space_comma' | 'none' | null;
        steppers?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        onchange?: On<NumberChangeDetail>;
        onunparsed?: On<NumberUnparsedDetail>;
      };
      'af-select': Kit & {
        options?: SelectOption[] | null;
        value?: string | string[] | null;
        multiple?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        /** `sm` is the 32px trigger. */
        size?: 'sm' | null;
        onchange?: On<SelectChangeDetail>;
      };
      'af-combobox': Kit & {
        options?: ComboboxOption[] | null;
        source?: PickerSource<ComboboxOption> | null;
        value?: string | string[] | null;
        multiple?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        loading?: boolean | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        onchange?: On<ComboboxChangeDetail>;
        onsearch?: On<ComboboxSearchDetail>;
      };
      'af-rich-editor': Kit<AfRichEditorElement> & {
        value?: string | null;
        readonly?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        /** Where the `@` menu's suggestions come from; without it `@` is plain text. */
        mentions?: MentionMenuSource | null;
        /** One line: Enter does nothing and the toolbar is not drawn. */
        'single-line'?: boolean | null;
        /** The response's `mentions` map, which the chips read. */
        'mention-map'?: Record<string, ResolvedMention> | null;
        onchange?: On<RichEditorChangeDetail>;
      };
      'af-tile': Kit & {
        /** A dashboard's tile, or a module's `ComputeTile`. */
        spec?: AfTileSpec | null;
        /** The tile's result, or a `ComputedTile`. */
        result?: AfTileResult | null;
        /** The entity's fields, from `GET /entities/{entity_id}`; they label and format the figures. */
        fields?: readonly FigureField[] | null;
        /** A list tile's records, as `POST /entities/{entity_id}/records/query` returns them. Unset, the tile is loading; an empty array is a view that matched nothing. */
        rows?: readonly AfListRow[] | null;
        /** A list tile's columns: the field each reads from a record's body, and its heading. */
        columns?: readonly AfListColumn[] | null;
        /** A list tile's pager: which pages lie either side of `rows`, and `busy` while the module reads another. Unset, there is no pager. */
        paging?: AfTilePaging | null;
        /** A chart as its table (`true`) or its plot (`false`), for a host that draws its own toggle; the tile then draws none. Unset, the tile draws its own. */
        table?: boolean | null;
        /** Opens the records behind a figure, and a list's record: a mark then sends `af-drill`, and a row `af-open-record`. */
        drill?: boolean | null;
        'onaf-drill'?: On<AfDrillDetail>;
        'onaf-open-record'?: On<AfOpenRecordDetail>;
        'onaf-page'?: On<AfPageDetail>;
      };
      /** A label, a description and an error around the one control written as its child; it has no shadow root. */
      'af-field': Kit & {
        label?: string | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        required?: boolean | null;
        readonly?: boolean | null;
        /** Marks the field as changed from a suggested value: a bar on its inline-start edge, the control untouched. */
        edited?: boolean | null;
        /** Makes the control read-only, with a lock that shows this reason. */
        lockedReason?: string | null;
        'locked-reason'?: string | null;
        name?: string | null;
      };
      /** A form section around a native `<fieldset>` written as its child, or around its own children; it has no shadow root. */
      'af-fieldset': Kit & {
        heading?: string | null;
        description?: string | null;
        columns?: 1 | 2 | 3 | 4 | null;
      };
      /** Enhances the native `<form>` written as its first child; it has no shadow root. */
      'af-form': Kit & {
        /** A server's errors: each goes on the `af-field` its path names, and the rest into a summary. */
        errors?: FormError[] | null;
        busy?: boolean | null;
        /** While set, leaving the page asks first. */
        dirty?: boolean | null;
        'onaf-submit'?: On<AfSubmitDetail>;
      };
      'af-scroll-area': Kit<AfScrollAreaElement> & {
        /** Which way it scrolls; default `vertical`. */
        axis?: 'vertical' | 'horizontal' | 'both' | null;
        /** Names the viewport, which then is a region. */
        label?: string | null;
      };
      /** Tabs over panels the page slots in by value (`<div slot="activity">`). */
      'af-tabs': Kit & {
        items?: TabItem[] | null;
        /** The shown tab; a click or an arrow key asks for another with `tab-change`, and the page sets it back. */
        value?: string | null;
        /** Names the tab list. */
        label?: string | null;
        /** Default `pill`. */
        variant?: 'pill' | 'line' | 'segmented' | null;
        'ontab-change'?: On<TabChangeDetail>;
      };
      /** Two panes the page slots in (`slot="start"`, `slot="end"`) with a handle between them. */
      'af-splitter': Kit & {
        /** The start pane's share in percent, default 50, held within `min` and `max`. A drag moves the panes at once and `size-change` tells the page where it ended; every set moves them back onto it. */
        size?: number | null;
        /** Default 20. */
        min?: number | null;
        /** Default 80. */
        max?: number | null;
        /** Default `horizontal`, panes side by side. */
        orientation?: 'horizontal' | 'vertical' | null;
        /** Names the handle; default `Resize panes` in the element's language. */
        label?: string | null;
        'onsize-change'?: On<SizeChangeDetail>;
      };
      /** Previous and Next over a cursor-paged list, or `more` mode's Load more. Every value is the page's; a press asks with an event. */
      'af-pager': Kit & {
        /** Default `pages`, Previous and Next; `more` is a Load more button. */
        mode?: 'pages' | 'more' | null;
        hasPrev?: boolean | null;
        hasNext?: boolean | null;
        /** In `more` mode, whether Load more shows. */
        hasMore?: boolean | null;
        /** Locks the buttons, which keep their focus; Load more shows a spinner. */
        busy?: boolean | null;
        /** With `pageSizes`, draws the rows-per-page select. */
        pageSize?: number | null;
        pageSizes?: number[] | null;
        rangeStart?: number | null;
        rangeEnd?: number | null;
        total?: number | null;
        /** In `more` mode, how many rows the list shows. */
        shown?: number | null;
        /** With `controls`, moves focus to the first row that arrived after Load more. */
        focusNew?: boolean | null;
        /** The id of the list it pages, in the same root. */
        controls?: string | null;
        onprev?: On<Record<string, never>>;
        onnext?: On<Record<string, never>>;
        onmore?: On<Record<string, never>>;
        'onpage-size-change'?: On<PageSizeChangeDetail>;
      };
      /** An icon button that copies `value` to the clipboard and says whether it did. */
      'af-copy-button': Kit & {
        /** The text to copy. */
        value?: string | null;
        /** Names the button; default `Copy` in the element's language. */
        label?: string | null;
        /** Raised once per press, after the outcome is known; `ok` is false when the browser refused. Named `af-copy` because the native `copy` shares the shorter name. */
        'onaf-copy'?: On<AfCopyDetail>;
      };
      /** Markdown, read-only: GFM with a single newline as a line break, raw HTML as text, mention tokens as chips. */
      'af-markdown': Kit & {
        value?: string | null;
        /** The response's `mentions` map, which the chips read. */
        mentions?: Record<string, ResolvedMention> | null;
        /** URL schemes kept as links beside http, https, irc, ircs, mailto and xmpp, such as `af-mention:`. */
        schemes?: string[] | null;
        /** Raised before a link opens or when a mention chip is pressed; cancelable. */
        'onaf-link'?: On<AfLinkDetail>;
      };
      'af-tree-picker': Kit & {
        nodes?: TreeNode[] | null;
        /** Asked for every page of the empty query on open; a set source wins over `nodes`. */
        source?: PickerSource<TreeNode> | null;
        value?: string | string[] | null;
        multiple?: boolean | null;
        /** With `multiple`, the most that may be picked. */
        max?: number | null;
        placeholder?: string | null;
        label?: string | null;
        loading?: boolean | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        onchange?: On<TreePickerChangeDetail>;
        onsearch?: On<TreePickerSearchDetail>;
      };
      /** A bar raised over the page while `count` is above zero, holding the page's own buttons in the `actions` slot. */
      'af-bulk-bar': Kit<AfBulkBarElement> & {
        count?: number | null;
        /** Shown as "of N" when known. */
        total?: number | null;
        /** The sentence shown and announced in place of "N selected", for a selection that is not a count of rows. */
        label?: string | null;
        /** Raised by the clear button and by Escape inside the bar; the page empties its selection and sets `count` back. */
        onclear?: On<Record<string, never>>;
      };
      /** A drop zone and the rows of the page's files. It never uploads: it hands the page the files, and draws the `items` the page sets. */
      'af-file-upload': Kit & {
        items?: FileItem[] | null;
        /** As the native attribute: types and extensions, comma-separated. */
        accept?: string | null;
        multiple?: boolean | null;
        /** In a one-file element, a pick while an item is held fits (its one file matching `accept`) and raises `files-add`; the page swaps the items. */
        replace?: boolean | null;
        /** The drop zone's accessible name; the text it shows becomes its description. Without it, the shown text names it. */
        label?: string | null;
        /** The most files the field holds, counting the items not failed; without it, one file a pick unless `multiple`. */
        maxFiles?: number | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        'onfiles-add'?: On<FilesAddDetail>;
        onremove?: On<FileRemoveDetail>;
      };
      /** A pad to sign on with a mouse, a finger or a pen. The strokes show as they are drawn, and each one ends in `change`. */
      'af-signature-pad': Kit<AfSignaturePadElement> & {
        /** A PNG data URL, shown as an image until a stroke is drawn. */
        value?: string | null;
        /** The pad's accessible name; without it, `Signature`. */
        label?: string | null;
        disabled?: boolean | null;
        name?: string | null;
        required?: boolean | null;
        /** Shows `value` and nothing to draw with. */
        readonly?: boolean | null;
        description?: string | null;
        error?: string | null;
        invalid?: boolean | null;
        onchange?: On<SignatureChangeDetail>;
      };
      /** Chooses what a workflow's folder field reads: files, a folder from this computer, or a watched folder. It uploads through `sources` and shows what a launch would take. */
      'af-folder-source': Kit & {
        /** `folderSources(client)` from `@reflexify/agentflow-sdk`, one object for the page's lifetime. A property only. */
        sources?: FolderSources | null;
        /** The workflow's id, and the key of its start form's file field. */
        workflow?: string | null;
        field?: string | null;
        /** A version the page chose to launch; the current published one without it. */
        version?: string | null;
        /** What one unit is for the field, as the workflow's input contract says it. A property only. */
        folder?: SlotFolder | null;
        /** An upload set an interrupted upload announced: picking the same folder continues it. */
        resumeSet?: string | null;
        /** The sources to offer, when not all three: a page that takes plain files its own way leaves `files` out. A property only. */
        offer?: readonly ('files' | 'computer' | 'watched')[] | null;
        disabled?: boolean | null;
        'onaf-folder-upload-started'?: On<FolderUploadStartedDetail>;
        'onaf-folder-progress'?: On<FolderProgressDetail>;
        'onaf-folder-busy'?: On<FolderBusyDetail>;
        'onaf-folder-change'?: On<FolderChangeDetail>;
        'onaf-folder-error'?: On<FolderErrorDetail>;
      };
    }
  }
}
