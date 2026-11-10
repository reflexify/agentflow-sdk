import type {
  AfBulkBarElement, AfScrollAreaElement, AfSignaturePadElement, AfToastElement, ConfirmCancelDetail, AfCopyDetail, DateChangeDetail, DateRangeChangeDetail, DialogCloseDetail, MenuSelectDetail, NumberChangeDetail, PersonChangeDetail, PersonSearchDetail,
  AfLinkDetail, DateUnparsedDetail, NumberUnparsedDetail, PageSizeChangeDetail, PopoverCloseDetail, RichEditorChangeDetail, SelectChangeDetail, SizeChangeDetail, TabChangeDetail, ToastActionDetail, ComboboxChangeDetail, ComboboxSearchDetail, TreePickerChangeDetail, TreePickerSearchDetail, FilesAddDetail, FileRemoveDetail, SignatureChangeDetail, FolderBusyDetail, FolderChangeDetail, FolderErrorDetail, FolderProgressDetail, FolderUploadStartedDetail,
} from '@reflexify/agentflow-elements/jsx';
import '@reflexify/agentflow-elements/kit';
import type {
  AfDrillDetail, AfListColumn, AfListRow, AfOpenRecordDetail, AfPageDetail, AfTilePaging, AfTileResult, AfTileSpec, ComboboxOption, FileItem, FolderSources, MenuEntry, Person, PickerSource, ResolvedMention, SelectOption, SlotFolder, TabItem, ToastInput, TreeNode,
} from '@reflexify/agentflow-elements/kit';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import type { Text } from './text.js';

export type ThemeMode = 'light' | 'dark';
export type Common = { locale: string; theme: ThemeMode };

/**
 * Sets `props` on a kit element as properties and listens for its `events`, so nothing depends on how a React version
 * treats custom elements. A handler is read when its event fires, so a new function each render costs no listener.
 */
function useElement<E extends HTMLElement>(props: Record<string, unknown>, events: Record<string, (detail: never) => void>): RefObject<E | null> {
  const ref = useRef<E | null>(null);
  useLayoutEffect(() => {
    const el = ref.current as unknown as Record<string, unknown> | null;
    if (el) for (const [key, value] of Object.entries(props)) if (el[key] !== value) el[key] = value;
  });
  const latest = useRef(events);
  latest.current = events;
  const names = Object.keys(events).join(',');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const offs = names.split(',').filter(Boolean).map((type) => {
      const listener = (e: Event) => latest.current[type]?.((e as CustomEvent).detail as never);
      el.addEventListener(type, listener);
      return () => el.removeEventListener(type, listener);
    });
    return () => offs.forEach((off) => off());
  }, [names]);
  return ref;
}

/**
 * `af-dialog`: the body in the default slot, the buttons in `actions`. It never closes itself: `onClose` sets `open` false.
 * `placement="end"` docks it at the end as a side panel.
 */
export function Dialog(p: Common & {
  open: boolean; heading: string; placement?: 'center' | 'end'; onClose(detail: DialogCloseDetail): void; children: ReactNode; actions: ReactNode;
}) {
  const ref = useElement<HTMLElement>({ open: p.open, heading: p.heading, placement: p.placement ?? 'center', locale: p.locale }, { close: p.onClose });
  return (
    <af-dialog ref={ref} data-theme={p.theme}>
      {p.children}
      <div slot="actions" className="slot">{p.actions}</div>
    </af-dialog>
  );
}

/** `af-confirm`: a question with Cancel and a confirm button. Like the dialog, it closes only when `open` goes false. */
export function Confirm(p: Common & {
  open: boolean; heading: string; message: string; impact?: string; confirmLabel: string; danger?: boolean;
  onConfirm(): void; onCancel(detail: ConfirmCancelDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    { open: p.open, heading: p.heading, message: p.message, impact: p.impact ?? null, confirmLabel: p.confirmLabel, danger: p.danger ?? false, locale: p.locale },
    { confirm: () => p.onConfirm(), cancel: p.onCancel },
  );
  return <af-confirm ref={ref} data-theme={p.theme} />;
}

/** `af-menu`: `children` draw the trigger, a disabled item says why in its `reason`, and a checkable item's `checked` is the page's. */
export function Menu(p: Common & { items: MenuEntry[]; label: string; onSelect(detail: MenuSelectDetail): void; children: ReactNode }) {
  const ref = useElement<HTMLElement>({ items: p.items, label: p.label, locale: p.locale }, { select: p.onSelect });
  return <af-menu ref={ref} data-theme={p.theme}>{p.children}</af-menu>;
}

/** `af-popover` around an anchor, opened and closed through `open`. */
export function Popover(p: Common & { open: boolean; onClose(detail: PopoverCloseDetail): void; anchor: ReactNode; children: ReactNode }) {
  const ref = useElement<HTMLElement>({ open: p.open, locale: p.locale }, { close: p.onClose });
  return (
    <af-popover ref={ref} data-theme={p.theme}>
      <div slot="anchor">{p.anchor}</div>
      <div slot="content" className="slot-content">{p.children}</div>
    </af-popover>
  );
}

/** `af-tooltip` around `children`: `text` shows after a short hover, or at once when the anchor takes keyboard focus. */
export function Tooltip(p: Common & { text: string; children: ReactNode }) {
  const ref = useElement<HTMLElement>({ text: p.text, locale: p.locale }, {});
  return <af-tooltip ref={ref} data-theme={p.theme}>{p.children}</af-tooltip>;
}

/** The module's one `af-toast`, and a function that shows a toast in it. */
export function useToasts(p: Common & { onAction?(detail: ToastActionDetail): void }): { region: ReactNode; show(input: ToastInput): void } {
  const ref = useElement<AfToastElement>({ locale: p.locale }, p.onAction ? { action: p.onAction } : {});
  const show = useCallback((input: ToastInput) => void ref.current?.show(input), [ref]);
  return { region: <af-toast ref={ref} data-theme={p.theme} />, show };
}

/**
 * `af-date`, named by `label` because a `<label for>` cannot reach the input inside its shadow root. With `name` it takes
 * part in the `<form>` around it, and a form reset sends `change` with the empty value, which `onChange` sets back.
 * `format` is a mask of `DD`, `MM` and `YYYY` such as `DD.MM.YYYY` (others are ignored), shown and typed in every language; text it cannot read stays in the input and
 * is told to `onUnparsed`.
 */
export function DateInput(p: Common & {
  value: string | null; label: string; name?: string; required?: boolean; format?: string; testId?: string;
  onChange(value: string | null): void; onUnparsed?(text: string): void;
}) {
  const ref = useElement<HTMLElement>(
    { value: p.value, label: p.label, clearable: true, name: p.name ?? null, required: p.required ?? false, format: p.format ?? null, locale: p.locale },
    {
      change: (detail: DateChangeDetail) => p.onChange(detail.value),
      ...(p.onUnparsed ? { unparsed: (detail: DateUnparsedDetail) => p.onUnparsed?.(detail.text) } : {}),
    },
  );
  return <af-date ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-date range`: a start and an end, either of which may be null, an open end. The calendar emits once both ends are
 * picked, and the form sends `start/end` under `name`.
 */
export function DateRange(p: Common & {
  start: string | null; end: string | null; label: string; name?: string; testId?: string; onChange(detail: DateRangeChangeDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    { range: true, start: p.start, end: p.end, label: p.label, clearable: true, name: p.name ?? null, locale: p.locale },
    { change: (detail: DateRangeChangeDetail) => p.onChange(detail) },
  );
  return <af-date ref={ref} range data-theme={p.theme} data-testid={p.testId} />;
}

/** `af-person-picker` over a fixed list of `people`, which it filters itself as the person types, or over a `source`, which it asks a page at a time; a set `source` wins. */
export function PersonPicker<V extends string | string[] | null>(p: Common & {
  people?: Person[]; source?: PickerSource<Person>; value: V; label: string; placeholder?: string; multiple?: boolean; name?: string; testId?: string;
  onChange(value: V): void; onSearch?(detail: PersonSearchDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    { people: p.people ?? null, source: p.source ?? null, value: p.value, label: p.label, placeholder: p.placeholder ?? null, multiple: p.multiple ?? false, name: p.name ?? null, locale: p.locale },
    { change: (detail: PersonChangeDetail) => p.onChange(detail.value as V), ...(p.onSearch ? { search: p.onSearch } : {}) },
  );
  return <af-person-picker ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-number-input`: a number or null in `value`, and each committed number back through `onChange`. With neither
 * `precision` nor `fractional` (and not an unscaled percent, which keeps its digits), a commit rounds to no fraction digits
 * for a whole step (the default step is 1) and otherwise to two, or to the step's own digits when it has more: give a
 * measured value `fractional`, and a percent field `format="percent"` with `unscaled`, since AgentFlow stores the
 * percentage itself.
 */
export function NumberInput(p: Common & {
  value: number | null; label: string; name?: string; min?: number; max?: number; step?: number; precision?: number; fractional?: boolean;
  format?: 'plain' | 'currency' | 'percent'; unscaled?: boolean; currency?: string; separators?: 'locale' | 'comma_dot' | 'dot_comma' | 'space_comma' | 'none';
  steppers?: boolean; testId?: string; onChange(value: number | null): void; onUnparsed?(text: string): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      value: p.value, label: p.label, name: p.name ?? null, min: p.min ?? null, max: p.max ?? null, step: p.step ?? null, precision: p.precision ?? null,
      fractional: p.fractional ?? false, format: p.format ?? 'plain', unscaled: p.unscaled ?? false, currency: p.currency ?? 'VND',
      separators: p.separators ?? 'locale', steppers: p.steppers ?? false, locale: p.locale,
    },
    {
      change: (detail: NumberChangeDetail) => p.onChange(detail.value),
      ...(p.onUnparsed ? { unparsed: (detail: NumberUnparsedDetail) => p.onUnparsed?.(detail.text) } : {}),
    },
  );
  return <af-number-input ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/** `af-select` over a short list of `options`; a disabled option says why in its `reason`. */
export function Select<V extends string | string[] | null>(p: Common & {
  options: SelectOption[]; value: V; label: string; placeholder?: string; multiple?: boolean; name?: string; testId?: string; onChange(value: V): void;
}) {
  const ref = useElement<HTMLElement>(
    { options: p.options, value: p.value, label: p.label, placeholder: p.placeholder ?? null, multiple: p.multiple ?? false, name: p.name ?? null, locale: p.locale },
    { change: (detail: SelectChangeDetail) => p.onChange(detail.value as V) },
  );
  return <af-select ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-combobox`, typed into to find a value: over `options` it filters itself, and over a `source` it asks the source.
 * The source must be one stable function, such as a module constant: a new function restarts the list.
 */
export function Combobox<V extends string | string[] | null>(p: Common & {
  options?: ComboboxOption[]; source?: PickerSource<ComboboxOption>; value: V; label: string; placeholder?: string; multiple?: boolean; name?: string;
  testId?: string; onChange(value: V): void; onSearch?(detail: ComboboxSearchDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      options: p.options ?? null, source: p.source ?? null, value: p.value, label: p.label, placeholder: p.placeholder ?? null,
      multiple: p.multiple ?? false, name: p.name ?? null, locale: p.locale,
    },
    { change: (detail: ComboboxChangeDetail) => p.onChange(detail.value as V), ...(p.onSearch ? { search: p.onSearch } : {}) },
  );
  return <af-combobox ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/** `af-tree-picker` over a hierarchy of `nodes`, each naming its `parentId`; it filters the tree itself as the person types. */
export function TreePicker<V extends string | string[] | null>(p: Common & {
  nodes?: TreeNode[]; source?: PickerSource<TreeNode>; value: V; label: string; placeholder?: string; multiple?: boolean; max?: number; name?: string;
  testId?: string; onChange(value: V): void; onSearch?(detail: TreePickerSearchDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      nodes: p.nodes ?? null, source: p.source ?? null, value: p.value, label: p.label, placeholder: p.placeholder ?? null,
      multiple: p.multiple ?? false, max: p.max ?? null, name: p.name ?? null, locale: p.locale,
    },
    { change: (detail: TreePickerChangeDetail) => p.onChange(detail.value as V), ...(p.onSearch ? { search: p.onSearch } : {}) },
  );
  return <af-tree-picker ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-file-upload`: a drop zone over the rows of `items`, which are the module's. It never uploads: `onAdd` hears the
 * files dropped or picked, the module adds a row for each and uploads it, and `onRemove` hears a row's remove button.
 */
export function FileUpload(p: Common & {
  items: FileItem[]; accept?: string; multiple?: boolean; maxFiles?: number; replace?: boolean; label?: string; name?: string; testId?: string;
  onAdd(files: File[]): void; onRemove(id: string): void;
}) {
  const ref = useElement<HTMLElement>(
    { items: p.items, accept: p.accept ?? null, multiple: p.multiple ?? false, maxFiles: p.maxFiles ?? null, replace: p.replace ?? false, label: p.label ?? null, name: p.name ?? null, locale: p.locale },
    { 'files-add': (detail: FilesAddDetail) => p.onAdd(detail.files), remove: (detail: FileRemoveDetail) => p.onRemove(detail.id) },
  );
  return <af-file-upload ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-folder-source`: what a workflow's folder field reads, from files, a folder from this computer or a watched folder.
 * `sources` is `folderSources(client)`, one object for the module's lifetime. `onStarted` hears an upload set's id as soon
 * as it exists, to keep for `resumeSet`; `onChange` hears the value to launch with and what the launch would take;
 * `onError` hears a failed call, which the element has already told the person about.
 */
export function FolderSource(p: Common & {
  sources: FolderSources; workflow: string; field: string; version?: string; folder: SlotFolder; resumeSet?: string | null; disabled?: boolean; testId?: string;
  onStarted?(detail: FolderUploadStartedDetail): void; onProgress?(detail: FolderProgressDetail): void; onChange(detail: FolderChangeDetail): void;
  onError?(detail: FolderErrorDetail): void; onBusy?(detail: FolderBusyDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    { sources: p.sources, workflow: p.workflow, field: p.field, version: p.version ?? null, folder: p.folder, resumeSet: p.resumeSet ?? null, disabled: p.disabled ?? false, locale: p.locale },
    { 'af-folder-change': p.onChange, ...(p.onStarted ? { 'af-folder-upload-started': p.onStarted } : {}), ...(p.onProgress ? { 'af-folder-progress': p.onProgress } : {}),
      ...(p.onError ? { 'af-folder-error': p.onError } : {}), ...(p.onBusy ? { 'af-folder-busy': p.onBusy } : {}) },
  );
  return <af-folder-source ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-signature-pad`: the strokes show as they are drawn, and `onChange` hears a PNG data URL of them when each stroke
 * ends, or `null` after Clear. `value` is shown as an image until a stroke is drawn.
 */
export function SignaturePad(p: Common & { value: string | null; label: string; testId?: string; onChange(value: string | null): void }) {
  const ref = useElement<AfSignaturePadElement>({ value: p.value, label: p.label, locale: p.locale }, { change: (detail: SignatureChangeDetail) => p.onChange(detail.value) });
  return <af-signature-pad ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/** `af-rich-editor`: Markdown in `value`, and each edit back through `onChange`. */
export function RichEditor(p: Common & { value: string; label: string; placeholder: string; onChange(value: string): void }) {
  const ref = useElement<HTMLElement>(
    { value: p.value, label: p.label, placeholder: p.placeholder, locale: p.locale },
    { change: (detail: RichEditorChangeDetail) => p.onChange(detail.value) },
  );
  return <af-rich-editor ref={ref} data-theme={p.theme} />;
}

/**
 * `af-tile` drawing a result the module already holds; with `onDrill`, a figure or a mark opens its records, and with
 * `onOpenRecord` a list tile's row opens its record. A list tile takes the `rows` and `columns` the module read, and `paging`
 * with `onPage` to page them; `table` is set only when the screen draws its own table toggle.
 */
export function Tile(p: Common & {
  spec: AfTileSpec; result: AfTileResult | null; fields: FigureField[] | null; rows?: readonly AfListRow[] | null; columns?: readonly AfListColumn[] | null;
  paging?: AfTilePaging | null; table?: boolean; onDrill?(detail: AfDrillDetail): void; onOpenRecord?(detail: AfOpenRecordDetail): void; onPage?(detail: AfPageDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      spec: p.spec, result: p.result, fields: p.fields, rows: p.rows ?? null, columns: p.columns ?? null, paging: p.paging ?? null,
      table: p.table ?? null, drill: !!(p.onDrill || (p.onOpenRecord && p.spec.kind === 'list')), locale: p.locale,
    },
    {
      ...(p.onDrill ? { 'af-drill': p.onDrill } : {}),
      ...(p.onOpenRecord ? { 'af-open-record': p.onOpenRecord } : {}),
      ...(p.onPage ? { 'af-page': p.onPage } : {}),
    },
  );
  return <af-tile ref={ref} data-theme={p.theme} />;
}

/**
 * `af-scroll-area` around `children`: its height comes from `style` or the layout, and `label` makes it a named region.
 * `axis="both"` scrolls sideways as well, for a table wider than its box.
 */
export function ScrollArea(p: Common & { label: string; axis?: 'vertical' | 'horizontal' | 'both'; slot?: string; style?: CSSProperties; testId?: string; children: ReactNode }) {
  const ref = useElement<AfScrollAreaElement>({ label: p.label, axis: p.axis ?? 'vertical', locale: p.locale }, {});
  return <af-scroll-area ref={ref} slot={p.slot} data-theme={p.theme} style={p.style} data-testid={p.testId}>{p.children}</af-scroll-area>;
}

/**
 * `af-tabs` over panels slotted by their item's value. A click or an arrow key asks for a tab through `onChange`; the
 * panel moves once `value` follows.
 */
export function Tabs(p: Common & { items: TabItem[]; value: string; label: string; testId?: string; onChange(value: string): void; children: ReactNode }) {
  const ref = useElement<HTMLElement>(
    { items: p.items, value: p.value, label: p.label, locale: p.locale },
    { 'tab-change': (detail: TabChangeDetail) => p.onChange(detail.value) },
  );
  return <af-tabs ref={ref} data-theme={p.theme} data-testid={p.testId}>{p.children}</af-tabs>;
}

/**
 * `af-splitter` over the panes slotted as `start` and `end`. A drag moves the panes at once and `onChange` hears where it
 * ended; every `size` the page sets moves them onto it.
 */
export function Splitter(p: Common & { size: number; label: string; style?: CSSProperties; testId?: string; onChange(size: number): void; children: ReactNode }) {
  const ref = useElement<HTMLElement>(
    { size: p.size, label: p.label, locale: p.locale },
    { 'size-change': (detail: SizeChangeDetail) => p.onChange(detail.size) },
  );
  return <af-splitter ref={ref} data-theme={p.theme} style={p.style} data-testid={p.testId}>{p.children}</af-splitter>;
}

/**
 * `af-pager`: Previous and Next over a list the page pages, with its range and a rows-per-page select. A press asks with
 * an event; the buttons and the range follow what the page sets back. `pageSizes` is compared by identity, so pass one
 * array that lives as long as the page.
 */
export function Pager(p: Common & {
  hasPrev: boolean; hasNext: boolean; busy: boolean; rangeStart?: number | null; rangeEnd?: number | null; total?: number | null;
  pageSize: number; pageSizes: readonly number[]; controls?: string; testId?: string; onPrev(): void; onNext(): void; onPageSize(size: number): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      hasPrev: p.hasPrev, hasNext: p.hasNext, busy: p.busy, rangeStart: p.rangeStart ?? null, rangeEnd: p.rangeEnd ?? null, total: p.total ?? null,
      pageSize: p.pageSize, pageSizes: p.pageSizes, controls: p.controls ?? null, locale: p.locale,
    },
    { prev: () => p.onPrev(), next: () => p.onNext(), 'page-size-change': (detail: PageSizeChangeDetail) => p.onPageSize(detail.pageSize) },
  );
  return <af-pager ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-copy-button`: an icon button that copies `value` and says so for two seconds. `onCopy` hears each press once its
 * outcome is known; `ok` is false when the browser refused both the clipboard and the selection fallback.
 */
export function CopyButton(p: Common & { value: string; label: string; testId?: string; onCopy(detail: AfCopyDetail): void }) {
  const ref = useElement<HTMLElement>({ value: p.value, label: p.label, locale: p.locale }, { 'af-copy': (detail: AfCopyDetail) => p.onCopy(detail) });
  return <af-copy-button ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/** `af-markdown`: read-only Markdown, its mention tokens drawn as chips from `mentions`. A link opens in a new tab; `af-link` tells the module first. */
export function Markdown(p: Common & { value: string; mentions?: Record<string, ResolvedMention> | null; testId?: string; onLink(detail: AfLinkDetail): void }) {
  const ref = useElement<HTMLElement>({ value: p.value, mentions: p.mentions ?? null, locale: p.locale }, { 'af-link': (detail: AfLinkDetail) => p.onLink(detail) });
  return <af-markdown ref={ref} data-theme={p.theme} data-testid={p.testId} />;
}

/**
 * `af-bulk-bar`: raised over the page while `count` is above zero, with the page's own buttons, each given
 * `slot="actions"`, as `children`. The selection is the page's: `onClear` hears the clear button and Escape, and the bar
 * hides once `count` is set back to 0.
 */
export function BulkBar(p: Common & { count: number; total?: number | null; label?: string | null; testId?: string; onClear(): void; children: ReactNode }) {
  const ref = useElement<AfBulkBarElement>({ count: p.count, total: p.total ?? null, label: p.label ?? null, locale: p.locale }, { clear: () => p.onClear() });
  // The shortcut is the module's, since the bar binds none: Alt+Shift+A moves focus to the first action. A listener on the
  // shadow root, never on `document`.
  useEffect(() => {
    const root = ref.current?.getRootNode();
    if (!root || p.count === 0) return;
    const onKey = (e: Event) => {
      const k = e as KeyboardEvent;
      if (k.altKey && k.shiftKey && k.code === 'KeyA') {
        k.preventDefault();
        ref.current?.focus();
      }
    };
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, [ref, p.count]);
  return <af-bulk-bar ref={ref} data-theme={p.theme} data-testid={p.testId}>{p.children}</af-bulk-bar>;
}

/** Records an event the page heard, for the list of the last ones. */
export type Log = (tag: string, type: string, detail: unknown) => void;

/** What every section of the page is given. */
export type SectionProps = Common & { t: Text; log: Log };
