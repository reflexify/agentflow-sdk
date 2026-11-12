# The kit in React

The kit's elements are custom elements with properties in and DOM events out. This page shows how the starter
uses them from React; each element's properties, events and parts are in the kit README,
`node_modules/@reflexify/agentflow-elements/README.md`.

`examples/kit-showcase` in the SDK repository is working code for every element. Its
`examples/kit-showcase/src/module/kit.tsx` has a wrapper for each element, with the properties this page relies on (a
number's digits and percent, a date's mask, a list tile's rows and pager, the bulk bar's shortcut); the kit README lists
every property, and a wrapper takes another by adding it to the properties it sets. `examples/kit-showcase/src/module/FormSection.tsx`
is the form of "A form", below, with the file upload and the signature pad of "Files and signatures".
`examples/kit-showcase/src/module/Pickers.tsx` is "Pickers", and `examples/kit-showcase/src/module/Pages.tsx` raises the bulk
bar of "Bulk actions".

## Why a wrapper

Wrap each element in a small component that sets its properties through a ref and listens with
`addEventListener`. Then nothing depends on how a given React version treats custom elements: whether it sets a
prop as a property or an attribute, and which events it wires up. A handler is read when its event fires, so a
new function on every render costs no new listener.

The hook, from `src/module/kit.tsx`, with the imports it needs:

```tsx
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

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
```

One wrapper built on it, `Dialog`, from the same file. Every wrapper takes the locale and the theme. `af-dialog`
never closes itself: its `close` event calls `onClose`, which sets `open` to false.

```tsx
import type { DialogCloseDetail } from '@reflexify/agentflow-elements/jsx';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
type Common = { locale: string; theme: ThemeMode };

export function Dialog(p: Common & { open: boolean; heading: string; onClose(detail: DialogCloseDetail): void; children: ReactNode; actions: ReactNode }) {
  const ref = useElement<HTMLElement>({ open: p.open, heading: p.heading, locale: p.locale }, { close: p.onClose });
  return (
    <af-dialog ref={ref} data-theme={p.theme}>
      {p.children}
      <div slot="actions" className="slot">{p.actions}</div>
    </af-dialog>
  );
}
```

Import the kit once, for its side effect of defining the elements: `import '@reflexify/agentflow-elements/kit';`.

## Typings

```ts
import type { AfToastElement, DateChangeDetail, DialogCloseDetail } from '@reflexify/agentflow-elements/jsx';
```

`@reflexify/agentflow-elements/jsx` gives the JSX types of the kit's twenty-seven tags, so `<af-dialog ref={ref}>`
type-checks, and the `detail` type of each event (`DialogCloseDetail`, `DateChangeDetail`, `SelectChangeDetail` and the
rest), plus the element types with methods, such as `AfToastElement`, `AfBulkBarElement` and `AfSignaturePadElement`.

## Events

The kit's events bubble but are not composed: listen on the element itself, or on an ancestor in the same shadow
root. A listener on `document` never hears them, and must not be there anyway. Values are controlled: an element
that emits `change` shows the new value once you set it back.

## `busy` on `af-confirm`

Set `busy` to true when Confirm is pressed, keep it true across a render, and set it to false when the write
ends. Confirm stays locked from the press until `busy` goes from true to false, so a double press confirms once.
Setting it and clearing it in one flush is no change at all, and leaves Confirm locked.

## Boolean attributes

`open`, `danger`, `busy`, `dirty`, `clearable`, `disabled`, `multiple`, `range`, `readonly`, `required`, `invalid`,
`loading`, `steppers`, `drill`, `has-prev`, `has-next`, `has-more` and `focus-new` are true when the attribute is present,
whatever its value: `disabled="false"` is still disabled. Set the property to `false` through the wrapper, or leave the attribute out. Setting the property
does not write the attribute back, except `name`, `disabled` and `readonly` on the form inputs, and the properties of
`af-field`, `af-fieldset` and `af-form` that have an attribute, which read and write it.

## `af-tile`, a figure from a tile

`af-tile` takes objects, so set them as properties: the hook above does, and so does React 19 for a custom element.
Give it the tile, its result and the entity's fields, and a list tile the `rows` and `columns` `computeTiles` returns
beside its result (`records-api.md`, "Drawing a tile"). It sends `af-drill`, and a list row `af-open-record`, only
when `drill` is set, so set it from whether the screen handles the event. A paged list adds `paging` and the `af-page`
event, and a chart whose table toggle your screen draws takes `table`.

```tsx
import type { AfDrillDetail, AfTileResult, AfTileSpec } from '@reflexify/agentflow-elements/kit';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';

export function Tile(p: Common & { spec: AfTileSpec; result: AfTileResult | null; fields: FigureField[] | null; onDrill?(detail: AfDrillDetail): void }) {
  const ref = useElement<HTMLElement>(
    { spec: p.spec, result: p.result, fields: p.fields, drill: p.onDrill !== undefined, locale: p.locale },
    { 'af-drill': (detail: AfDrillDetail) => p.onDrill?.(detail) },
  );
  return <af-tile ref={ref} data-theme={p.theme} />;
}
```

Without the wrapper, on React 19 the typed element is `<af-tile spec={spec} result={result} fields={fields} drill
onaf-drill={(e) => onDrill(e.detail)} />`: `onaf-drill` is the listener for `af-drill`, and `e.detail` is an
`AfDrillDetail`. A list tile adds `rows={result.rows} columns={result.columns} onaf-open-record={(e) => openRecord(e.detail)}`:
`onaf-open-record` is the listener for `af-open-record`, and `e.detail` is an `AfOpenRecordDetail`,
`{ record, entity, newTab }`. In the wrapper above, add `rows` and `columns` to the properties and `'af-open-record'`
to the events. Pass a `null` `result` only before the first answer; the tile shows a skeleton until then, and a list tile
with `rows` or `columns` unset does the same. On a period switch keep the current `result` until the new one arrives: a
`null` unmounts the chart, and with it the series a person had isolated, the tab stop and the tooltip.

**`newTab`** is on `af-drill` and `af-open-record`. It is true when the person clicked with the middle button, or with
Ctrl, Meta or Shift held, as for a link, and the screen then opens what they asked for in a new tab
(`window.open(href, '_blank', 'noopener')`) instead of in this one. Enter or Space with Ctrl, Meta or Shift held is true
as well, on a chart mark, the number's value and a list row's button alike, so read the flag and do not assume it is
false for a key.

**`paging` and `onaf-page`.** A list tile pages when the screen sets `paging={{ prev, next, busy }}` and listens for
`onaf-page`, whose `e.detail` is an `AfPageDetail`, `{ direction: 'prev' | 'next' }`. The tile fetches nothing: the screen
reads that page (`records-api.md`, "Drawing a tile", has the query and an example), then sets the new `rows` and
`paging`. Build `paging` once for each page, in a memo or in state, and not in the JSX, so the tile is not handed a new
object on every render. Without `paging` there is no pager. In the wrapper above, add `paging` to the properties and
`'af-page'` to the events.

**`table` is a property.** `table={true}` shows a chart as its table and `table={false}` as its plot, and then the tile
draws no toggle of its own, so the screen draws the control and holds the choice. Leave `table` unset to keep the tile's
own toggle. Set the property (`table={on}` in JSX does) and never write the attribute: the kit reads a `table` attribute
by its presence, so `table="false"` is true.

## One `af-toast` per module

Render one `af-toast` and show every toast through it. Its `show({ kind, text })` returns the toast's id, which
`dismiss(id)` takes. Pattern: `useToasts` in `src/module/kit.tsx`. `af-toast` also holds the module's live
regions, so add no second one.

A toast shown while a modal `af-dialog` is still open is drawn above the dialog but cannot be pressed, its action and
its close button included: the dialog makes the rest of the page inert, and the toast region is outside it. Do not put a
Retry on a toast for a submit that leaves the dialog open; show that refusal inside the dialog, in an `af-banner danger`.
A toast shown after the dialog has closed is pressable.

## `af-tooltip` in a long list

For a few controls (a panel's Close, a toolbar), wrap the control in the starter's `Tooltip` (`src/module/kit.tsx`),
which mounts at once. Only a control repeated on every row of a long list needs the lazy, node-moving wrapper
below.

Every `af-tooltip` is a shadow root, so a list of 1,000 rows must not mount one per row up front. On a non-interactive
value, mount it the first time a pointer comes over it; on a control, use a wrapper that also arms on focus
(`pointerover` and `focusin`). Keep the full text, or a locked control's reason, as visually
hidden text in the page from the start, because the tooltip's text never reaches a screen reader. A tooltip on a
non-interactive value only adds detail the visible text already implies (text cut by an ellipsis implies the rest, and stays whole in the page
for a screen reader), and its anchor is never made focusable
for it. Patterns: `LazyTooltip` in `src/module/kit.tsx`, for text and marks; for a control, a wrapper that moves
the control's existing nodes into the tooltip when it arms rather than rendering them again, so focus stays where
it was, and dispatches the arming pointer event again once the tooltip can hear it.
Never wrap focusable content (a control, a link, anything with `tabIndex`) in `LazyTooltip`: it remounts its
children when it arms, and focus inside them would drop.

## A choice

The kit has `af-select` and `af-combobox` for a choice. Pick between the two by the list:
`af-select` for a short list the person can scan, at most about 15 options (a status, a priority, a queue), and
`af-combobox` for a long one, one loaded from the server, or one people search by name (a unit, a customer, a record).
Put each inside an `af-field` for its visible label, help and error ("A form", below). The wrappers, in the pattern
above:

```tsx
import type { ComboboxChangeDetail, SelectChangeDetail } from '@reflexify/agentflow-elements/jsx';
import type { ComboboxOption, PickerSource, SelectOption } from '@reflexify/agentflow-elements/kit';

/** `af-select` over a short list of `options`. `value` is an option's value, or an array of them with `multiple`. */
export function Select<V extends string | string[] | null>(p: Common & {
  options: SelectOption[]; value: V; label: string; placeholder?: string; multiple?: boolean; name?: string; onChange(value: V): void;
}) {
  const ref = useElement<HTMLElement>(
    { options: p.options, value: p.value, label: p.label, placeholder: p.placeholder ?? null, multiple: p.multiple ?? false, name: p.name ?? null, locale: p.locale },
    { change: (detail: SelectChangeDetail) => p.onChange(detail.value as V) },
  );
  return <af-select ref={ref} data-theme={p.theme} />;
}

/**
 * `af-combobox`, typed into to find a value: over `options` it filters itself, and over a `source` it asks the source.
 * The source must be one stable function, because a new function restarts the list, and must have a `resolve` when
 * `value` can start as a saved id.
 */
export function Combobox<V extends string | string[] | null>(p: Common & {
  options?: ComboboxOption[]; source?: PickerSource<ComboboxOption>; value: V; label: string; placeholder?: string;
  multiple?: boolean; name?: string; onChange(value: V): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      options: p.options ?? null, source: p.source ?? null, value: p.value, label: p.label, placeholder: p.placeholder ?? null,
      multiple: p.multiple ?? false, name: p.name ?? null, locale: p.locale,
    },
    { change: (detail: ComboboxChangeDetail) => p.onChange(detail.value as V) },
  );
  return <af-combobox ref={ref} data-theme={p.theme} />;
}
```

A combobox over a list the page writes the source for, here the organization's units (the SDK's `directory.units`
makes this source, and "Pickers", below, uses it; the shape is the pattern for any list of your own, such as a customer
query). `GET /units` pages with a cursor, and the combobox aborts a call it no longer wants through `signal`. The source also has a `resolve`, because the combobox
never looks an id up itself: without it, a `value` that starts as a saved id (an edit form, the usual case) shows
blank until the list has opened and loaded a page, and then as "Unknown value" if that page lacks it.

```tsx
import type { PickerQuery } from '@reflexify/agentflow-elements/kit';
import { ok, type AppHost } from '@reflexify/agentflow-sdk';
import { useMemo } from 'react';

type UnitWire = { id: string; name?: string | null; code?: string | null };
const asOption = (u: UnitWire): ComboboxOption => ({ value: u.id, label: u.name ?? '', description: u.code });

/** Units by name or code. `resolve` names the ids the field already holds. */
function unitSource(api: AppHost['api']): PickerSource<ComboboxOption> {
  return Object.assign(
    async ({ q, cursor, signal }: PickerQuery) => {
      const page = await ok(api.GET('/units', { params: { query: { q: q || undefined, cursor: cursor ?? undefined } }, signal }));
      const units: UnitWire[] = page.items;
      return { items: units.map(asOption), next: page.next_cursor };
    },
    {
      // A unit that is gone, or that the person may not read, names nothing and is left out.
      resolve: async (ids: string[], signal: AbortSignal) => {
        const found = await Promise.all(ids.map((unit_id) =>
          ok(api.GET('/units/{unit_id}', { params: { path: { unit_id } }, signal })).then(asOption, () => null)));
        return found.filter((option): option is ComboboxOption => option !== null);
      },
    },
  );
}

export function UnitField(p: Common & { api: AppHost['api']; label: string; value: string | null; onChange(id: string | null): void }) {
  // Made again only when the client changes: a function built in the render would restart the list each time.
  const source = useMemo(() => unitSource(p.api), [p.api]);
  return (
    <af-field label={p.label}>
      <Combobox locale={p.locale} theme={p.theme} source={source} label={p.label} value={p.value} onChange={p.onChange} />
    </af-field>
  );
}
```

- `value` is an option's value, `null` for none, or an array of values with `multiple`. Values are controlled: set `value`
  back on `change`. A value the options do not hold is still submitted, and the select shows its placeholder for it.
- A disabled option says why: `{ value, label, disabled: true, reason }` shows the reason in a tooltip and reads it aloud.
- `size="sm"` makes `af-select` a 32 px trigger, for a toolbar or a dense row. An older host's `af-select` ignores it:
  probe `'size' in document.createElement('af-select')`, as `pitfalls.md` shows.
- The combobox does not open on a click: typing or the arrow keys open it, as the person picker does. In single mode its
  clear button sends `{ value: null }`.
- A `source` is `({ q, cursor, signal }) => Promise<{ items, next }>`, with a `resolve(ids, signal)` that names options
  for ids the combobox holds and has not listed. Give it a `resolve` whenever `value` can start non-empty. Make the source
  a module constant, or `useMemo` over the client as above: the combobox asks again whenever the function changes, so
  one made on each render asks on every render.
- A source that rejects is not shown as an error yet; the list reads as "No matches". Catch the failure in the source
  if the screen has to say so.
- `label` goes on the wrapper and on the `af-field` with the same text: the field draws it, the control uses it as its
  name, and a wrapper that passed `null` would erase the one the field set.
- Your own import defines `af-select`, `af-combobox`, `af-number-input` and the form tags where the host's kit lacks
  them, so they need no check. A host with an older kit can keep an older `af-date` or `af-person-picker`, which ignores
  `range`, `name` and `required`: probe the property (`'range' in document.createElement('af-date')`) and fall back to a
  native control, as `pitfalls.md`, beside this file, shows under "A kit property or method is missing at run time".

The rest of a form has kit classes on native elements, drawn as AgentFlow's own controls are: `af-input`, `af-textarea`,
`af-checkbox`, `af-radio`, `af-switch`, `af-label`, `af-toggle` and `af-segmented`, with the markup under "Form controls"
in the kit README. A file is `af-file-upload` ("Files and signatures", below), not a native file input.

## Pickers

`af-person-picker`, `af-tree-picker` and `af-combobox` choose from a list the server holds, each through a `source`: a
function `({ q, cursor, signal }) => Promise<{ items, next }>`, with a `resolve(ids, signal)` on it that names a saved
value no page has listed ("A choice", above, writes one by hand). The SDK's `directory` makes the three sources for the
organization's directory, each searched by `q`, paged by `cursor` and carrying its `resolve`: `directory.people(client)`
goes into `af-person-picker`'s `source`, `directory.units(client)` into `af-tree-picker`'s, and
`directory.groups(client, { members })` into `af-combobox`'s, `members: (count) => string` wording a group's member count in
your language ("12 members" in English by default). A fixed list needs no source: `people`, `options` and `nodes` are
filtered by the element itself, and a `source` that is set wins over them. Each call of `directory.*` returns a new
function, and a new function restarts the list, so make each source once: a module constant, or `useMemo` over the client.

```tsx
import type { PersonChangeDetail, TreePickerChangeDetail } from '@reflexify/agentflow-elements/jsx';
import type { Person, PickerSource, TreeNode } from '@reflexify/agentflow-elements/kit';
import { directory, type AppHost } from '@reflexify/agentflow-sdk';
import { useMemo } from 'react';

/** `af-person-picker` over a `source`; over `people` it filters a fixed list itself. */
export function PersonPicker<V extends string | string[] | null>(p: Common & {
  people?: Person[]; source?: PickerSource<Person>; value: V; label: string; placeholder?: string; multiple?: boolean;
  name?: string; onChange(value: V): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      people: p.people ?? null, source: p.source ?? null, value: p.value, label: p.label, placeholder: p.placeholder ?? null,
      multiple: p.multiple ?? false, name: p.name ?? null, locale: p.locale,
    },
    { change: (detail: PersonChangeDetail) => p.onChange(detail.value as V) },
  );
  return <af-person-picker ref={ref} data-theme={p.theme} />;
}

/** `af-tree-picker` over a hierarchy: each node names its `parentId`, and one whose parent is not listed is a root. */
export function TreePicker<V extends string | string[] | null>(p: Common & {
  nodes?: TreeNode[]; source?: PickerSource<TreeNode>; value: V; label: string; placeholder?: string; multiple?: boolean;
  max?: number; name?: string; onChange(value: V): void;
}) {
  const ref = useElement<HTMLElement>(
    {
      nodes: p.nodes ?? null, source: p.source ?? null, value: p.value, label: p.label, placeholder: p.placeholder ?? null,
      multiple: p.multiple ?? false, max: p.max ?? null, name: p.name ?? null, locale: p.locale,
    },
    { change: (detail: TreePickerChangeDetail) => p.onChange(detail.value as V) },
  );
  return <af-tree-picker ref={ref} data-theme={p.theme} />;
}

export function OwnerFields(p: Common & { api: AppHost['api']; owner: string | null; unit: string | null; onOwner(id: string | null): void; onUnit(id: string | null): void }) {
  // Made again only when the client changes: a source built in the render would restart both lists on every render.
  const people = useMemo(() => directory.people(p.api), [p.api]);
  const units = useMemo(() => directory.units(p.api), [p.api]);
  const c = { locale: p.locale, theme: p.theme };
  return (
    <>
      <af-field label="Owner">
        <PersonPicker {...c} source={people} label="Owner" value={p.owner} onChange={p.onOwner} />
      </af-field>
      <af-field label="Unit">
        <TreePicker {...c} source={units} label="Unit" value={p.unit} onChange={p.onUnit} />
      </af-field>
    </>
  );
}
```

- **A person is `{ id, name, email }`, a group an option, a unit a node.** `value` is the id, `null` for none, or an
  array with `multiple`; values are controlled, so set `value` back on `change`. A group is `{ value, label, description }`,
  and a unit `{ id, parentId, label, code, archived }`.
- **The tree picker asks for every unit when it opens**, following the pages until the last, and filters them itself: typing
  never reaches the source, because a server's search would drop the ancestors a match needs. A search shows each match under
  its ancestors, opened. Picking a branch picks that unit alone, not the units beneath it. Archived units are left out of
  the list unless you pass `include_archived`, and `resolve` still names a saved one.
- **`nodes` must hold the parents.** A node whose `parentId` is not among them is drawn as a root: a list cut short, or
  one filtered by the page, flattens into roots (`pitfalls.md`, "Forms").
- **A source that rejects is not shown as an error**; the list reads as empty. Catch the failure in the source if the
  screen has to say so.
- **On the app's own site** the directory is what the package lists. A person whose name is not listed is shown by their
  email, then their id, and a unit by its code, then its id; `resolve` names a person only while the package lists the
  `user` entity's `name`. `GET /groups` is refused to an installed app's token (`APP_CEILING_DENIED`), so `directory.groups`
  rejects there and a group picker offers only the groups the installation names, as `options` (`records-api.md`, "People,
  groups and units"). Inside AgentFlow the module calls as the person, and anyone in the organization reads the directory.

## Files and signatures

`af-file-upload` draws a drop zone and the rows of `items` and never uploads. It hands the module the `File`s of each drop
or pick (`files-add` `{ files }`), the module adds a row for each and uploads it, and a row's remove button asks the
module to take its item out (`remove` `{ id }`). So `items` is the module's state: a file shows only once the module adds
it.

```tsx
import type { FileRemoveDetail, FilesAddDetail } from '@reflexify/agentflow-elements/jsx';
import type { FileItem } from '@reflexify/agentflow-elements/kit';
import type { AppHost } from '@reflexify/agentflow-sdk';
import { useState } from 'react';

export function FileUpload(p: Common & {
  items: FileItem[]; accept?: string; multiple?: boolean; maxFiles?: number; replace?: boolean; label?: string; name?: string;
  onAdd(files: File[]): void; onRemove(id: string): void;
}) {
  const ref = useElement<HTMLElement>(
    { items: p.items, accept: p.accept ?? null, multiple: p.multiple ?? false, maxFiles: p.maxFiles ?? null, replace: p.replace ?? false, label: p.label ?? null, name: p.name ?? null, locale: p.locale },
    { 'files-add': (detail: FilesAddDetail) => p.onAdd(detail.files), remove: (detail: FileRemoveDetail) => p.onRemove(detail.id) },
  );
  return <af-file-upload ref={ref} data-theme={p.theme} />;
}

/** `attach` is the upload of `records-api.md`, "A file into a File field". */
export function Attachments(p: Common & { host: Pick<AppHost, 'api'>; entityId: string; recordId: string; field: string }) {
  const [items, setItems] = useState<FileItem[]>([]);
  const patch = (id: string, change: Partial<FileItem>) => setItems((now) => now.map((it) => (it.id === id ? { ...it, ...change } : it)));
  // One file at a time: `attach` rewrites the field's whole list, so two at once meet 409 STALE_VERSION.
  const add = async (files: File[]) => {
    for (const file of files) {
      const id = crypto.randomUUID();
      setItems((now) => [...now, { id, name: file.name, size: file.size, status: 'uploading' }]);
      try {
        patch(id, { id: await attach(p.host, p.entityId, p.recordId, p.field, file), status: 'done' });
      } catch (error) {
        patch(id, { status: 'failed', error: error instanceof Error ? error.message : String(error) });
      }
    }
  };
  return (
    <FileUpload
      locale={p.locale}
      theme={p.theme}
      items={items}
      multiple
      maxFiles={5}
      accept="application/pdf,image/*"
      onAdd={add}
      onRemove={(id) => setItems((now) => now.filter((it) => it.id !== id))}
    />
  );
}
```

- **The module uploads, and sets `items` after each step.** Add the row as `uploading` (with `progress`, 0 to 100, if
  you have it), set it to `done` or `failed` (with `error`) when the upload ends, and take it out on `remove`. Every `id` in
  `items` is unique, and the module may change a row's `id` when it learns the stored file's (the example sets the
  attachment id). A remove of a file the record already holds is also a `PATCH` of the field without that id
  (`records-api.md`).
- **The files the record already holds are rows too**, `done` from the start. Their name and size come with the record:
  `{ id, name: record.file_labels?.[field]?.[id] ?? '', size: record.file_details?.[field]?.[id]?.byte_size, status: 'done' }`,
  with no read per file. A `null` there is a file this person may not be told of: leave its row out.
- **`accept` and `max-files` say what the field takes.** A drop that breaks either is refused whole, with the element's
  own notice, and raises no event: set them to what the File field holds (`max_files`) so the person hears it at the drop.
- **A stray drop beside the zone is the browser's** to open, in place of the page; the kit adds no listener on
  `document`, and nor may the module. Listen for `dragover` and `drop` on the shadow root and call `preventDefault` to stop it inside the module.
- **In a form** its value is one entry under `name` for each `done` item, its id.
- **One file the person swaps.** With `max-files="1"` and `replace`, a pick or drop while a file is held raises
  `files-add` instead of the element's "One file only." notice, so the module can replace the held file
  (`records-api.md`, "Replacing or renaming a file"). `label` names the drop zone for a screen reader.

`af-folder-source` chooses what a workflow's folder field reads (files, a folder from this computer or a watched folder) and
never fetches: its `sources` is `folderSources(client)` from the SDK, made once, like a picker's `source`:

```tsx
import type { FolderChangeDetail, FolderUploadStartedDetail } from '@reflexify/agentflow-elements/jsx';
import type { FolderSources, SlotFolder } from '@reflexify/agentflow-elements/kit';

export function FolderSource(p: Common & {
  sources: FolderSources; workflow: string; field: string; folder: SlotFolder; version?: string; resumeSet?: string | null; disabled?: boolean;
  onStarted?(detail: FolderUploadStartedDetail): void; onChange(detail: FolderChangeDetail): void;
}) {
  const ref = useElement<HTMLElement>(
    { sources: p.sources, workflow: p.workflow, field: p.field, folder: p.folder, version: p.version ?? null, resumeSet: p.resumeSet ?? null, disabled: p.disabled ?? false, locale: p.locale },
    { 'af-folder-change': p.onChange, ...(p.onStarted ? { 'af-folder-upload-started': p.onStarted } : {}) },
  );
  return <af-folder-source ref={ref} data-theme={p.theme} />;
}
```

- **`sources` is one object for the page's lifetime**: `useMemo(() => folderSources(host.api), [host.api])`, never built in a
  render. `folder` is the field's `folder` in the workflow's input contract (`records-api.md`, "Records from a folder").
- **`resume-set` is a property named `resumeSet`**: the id the last `af-folder-upload-started` announced, kept by the page.
  The `af-folder-progress` event follows each stored file, and the element draws its own progress bar and Cancel.
- **Lock your own Start on `preview.refusal` and on a `null` value**, and start with `value` as it is.
- The event names start `af-`, so a JSX `onaf-folder-change` prop is the typed way; the wrapper above uses
  `addEventListener`, as every wrapper does. `examples/kit-showcase/src/module/kit.tsx` has this wrapper with the progress
  event too.

`af-signature-pad` is a pad to sign on, and a signature is drawn in a dialog:

```tsx
import type { AfSignaturePadElement, SignatureChangeDetail } from '@reflexify/agentflow-elements/jsx';
import { useState } from 'react';

export function SignaturePad(p: Common & { value: string | null; label: string; onChange(value: string | null): void }) {
  const ref = useElement<AfSignaturePadElement>({ value: p.value, label: p.label, locale: p.locale }, { change: (detail: SignatureChangeDetail) => p.onChange(detail.value) });
  return <af-signature-pad ref={ref} data-theme={p.theme} />;
}

export function SignDialog(p: Common & { open: boolean; recordId: string; onCancel(): void; onSign(png: string): void }) {
  const [drawn, setDrawn] = useState<string | null>(null);
  return (
    <Dialog
      locale={p.locale}
      theme={p.theme}
      open={p.open}
      heading="Sign"
      onClose={p.onCancel}
      actions={
        <>
          <button type="button" className="af-button" onClick={p.onCancel}>Cancel</button>
          <button type="button" className="af-button primary" aria-disabled={!drawn} onClick={() => drawn && p.onSign(drawn)}>Sign</button>
        </>
      }
    >
      {/* Keyed by the record: a pad keeps its strokes, so another record gets a new pad (or the element's clear()). */}
      <SignaturePad key={p.recordId} locale={p.locale} theme={p.theme} label="Signature" value={drawn} onChange={setDrawn} />
    </Dialog>
  );
}
```

- **The strokes show as they are drawn**, before the module sets anything: the pad is the second kit element, after
  `af-splitter`, that shows a value ahead of the page. `change` `{ value }` carries a PNG data URL when a stroke ends, and
  `null` after Clear or `clear()`. Keep the last one in state, as above, and leave Sign locked until there is one.
- **`value` is shown as an image until a stroke is drawn over it, and the strokes stay when `value` is set.** A module that
  reuses one pad for another record calls the element's `clear()` before it sets the new `value`, or keys the wrapper by the
  record, as above, so React makes a new pad.
- **The pad is white with dark ink in both themes**, and the module does not recolour it: a signature is stored data that
  other people see in their own themes. The PNG is the ink alone on a transparent ground (the baseline is a border of the
  pad and is not in it), so show a stored signature on a white or light surface: the fixed dark ink would vanish on a dark
  one.
- **The data URL is a PNG.** To store it as a file, make a `File` of its bytes and attach it as above (`new File([bytes],
  'signature.png', { type: 'image/png' })`, the bytes from `atob` of the data after the comma). A document that goes
  through AgentFlow's own signing is `host.signing`: `signing.md`.

## A form

A form is `af-form` around a native `<form>`, `af-fieldset` around a native `<fieldset>`, and `af-field` around each
control, with the inputs inside. These three tags need no wrapper: they take their attributes as strings and Booleans,
so they are plain JSX, and they have no shadow root, so React renders their children as it does a `<div>`'s. Write the
control as the field's first child, with no wrapper of your own around it.

```tsx
import type { AfSubmitDetail, FormError } from '@reflexify/agentflow-elements/kit';
import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { useEffect, useRef, useState } from 'react';

/** The API's field errors as `af-form` takes them: a JSON Pointer to the field, and the message. */
function formErrors(error: unknown): FormError[] {
  if (!(error instanceof AgentFlowError)) return [];
  return (error.fieldErrors ?? []).flatMap((e) => {
    const { path, message } = (e ?? {}) as { path?: unknown; message?: unknown };
    return typeof path === 'string' && typeof message === 'string' ? [{ path, message }] : [];
  });
}

export function RequestForm(p: Common & { statuses: SelectOption[]; save(data: FormData): Promise<void> }) {
  const c = { locale: p.locale, theme: p.theme };
  const [status, setStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [span, setSpan] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const form = useRef<(HTMLElement & { busy: boolean; dirty: boolean; errors: FormError[] }) | null>(null);
  const save = useRef(p.save);
  save.current = p.save;
  useEffect(() => {
    const el = form.current;
    if (!el) return;
    const submit = (e: Event) => {
      const { formData } = (e as CustomEvent<AfSubmitDetail>).detail;
      el.busy = true; // set here, in the handler: a second press now sends nothing
      el.errors = [];
      save.current(formData)
        .then(() => { el.dirty = false; })
        .catch((error) => { el.errors = formErrors(error); })
        .finally(() => { el.busy = false; });
    };
    const edited = () => { el.dirty = true; }; // a native input's change and a kit control's both reach the element
    el.addEventListener('af-submit', submit);
    el.addEventListener('change', edited);
    return () => {
      el.removeEventListener('af-submit', submit);
      el.removeEventListener('change', edited);
    };
  }, []);

  return (
    <af-form ref={form} locale={p.locale}>
      <form>
        <af-fieldset heading="Request" description="What is being asked for" columns={2} locale={p.locale}>
          <fieldset>
            <af-field label="Title" required data-span={2}>
              <input className="af-input" name="title" />
            </af-field>
            <af-field label="Status" description="Who sees it">
              <Select {...c} name="status" label="Status" options={p.statuses} value={status} onChange={setStatus} />
            </af-field>
            <af-field label="Amount">
              <NumberInput {...c} name="amount" label="Amount" min={0} value={amount} onChange={setAmount} />
            </af-field>
            <af-field label="Window" data-span={2}>
              <DateRange {...c} name="window" label="Window" start={span.start} end={span.end} onChange={setSpan} />
            </af-field>
          </fieldset>
        </af-fieldset>
        <button type="submit" className="af-button primary">Save</button>
      </form>
    </af-form>
  );
}
```

`NumberInput` and `DateRange` are two more wrappers of the `Select` kind (`examples/kit-showcase/src/module/kit.tsx`
holds them): `af-number-input` sets `value` and sends `change` `{ value: number | null }`, and `af-date` with `range`
sets `start` and `end` (ISO `yyyy-mm-dd` strings, either `null` for an open end) and sends `change` `{ start, end }`.

- **A number input keeps only the digits it is told to.** With neither `precision` nor `fractional` (and not an unscaled
  percent, which keeps its digits), a commit rounds to no fraction digits for a whole step (the default step is 1) and
  otherwise to two, or to the step's own digits when it has more, so `0.000123` commits as `0`. Give a measured value
  `fractional` (up to 20 fraction digits, as typed), or `precision` for a fixed count. A `percent` field stores the
  percentage itself (`98.5`), so its input takes `format="percent"` with `unscaled`; without `unscaled` the kit reads
  `0.985` as 98.5%. A field's `decimal_places` is what AgentFlow's own form passes as `precision`, so it rounds what a
  person types: pass it as `precision` to match, and give `fractional` to a field that has none, as AgentFlow does.
  Pass the field's `format_options.separators` (`comma_dot`, `dot_comma`, `space_comma` or `none`) as `separators`
  too, as AgentFlow's form does, so `1.234,5` reads and shows the same in both whatever the language. To
  show such a value as text, format it yourself
  (`new Intl.NumberFormat(locale, { maximumFractionDigits: 20 })`): the SDK's `formatNumber` with no `decimal_places`,
  like AgentFlow's own tables and tiles, shows at most three fraction digits.
- **A date's mask is the module's.** No field carries one (a date field's `format` is one of the authoring skill's
  presets, `dd_mm_yyyy` draws 20/02/2026), so a screen that wants `DD.MM.YYYY` passes it as `af-date`'s `format` (a mask holds `DD`, `MM` and `YYYY` once each, with
  no letters between them; `af-date` ignores any other, such as `DD MMM YYYY`), and
  formats or reads text with the SDK's `formatMasked(iso, mask)`, `parseMasked(text, mask)` and `isDateMask(mask)`.
  `af-date` with `range` ignores the mask and uses the language's form. AgentFlow's own pages show the field their way.
- **Columns and lines.** `af-fieldset`'s `columns` is 1 to 4, and each field fills the next cell unless `data-span`
  (columns it covers) or `data-col` (the column it starts in) places it, so four fields in `columns={4}` are one row.
  A repeated row, such as an item of a list the person adds to, laid out as a single line (a drag handle, its fields,
  a remove button) is the `af-repeater` classes from `KIT_CSS` with `af-repeater-row line`; the kit README's
  "State and piece classes" has the markup. Neither is a separate element.
- **A value changed from a suggestion.** `<af-field label="Cost" edited={cost !== suggested}>` draws a bar in the
  warning tone on the field's edge while the person's value differs from the suggested one, and changes nothing on the
  control. `edited` is a Boolean property, so pass `true` or `false`, never a string. Which value is the suggestion is
  the module's to know and keep, such as the value an AI step wrote, whose origin is `ai` in the record's provenance
  ([records-api.md](records-api.md)) until a person writes the field.

- **Values, validation and saving stay the module's.** The module holds the values (every kit control is controlled:
  set the value back on `change`), checks them, and sends them. `af-form` only submits, routes errors and guards
  unsaved changes.
- **Submit.** The form's native `submit` becomes `af-submit` on the `af-form`, with `{ formData, submitter }`; the
  `FormData` holds each control with a `name`, the kit's included. Listen to `af-submit`, never `submit` and never
  React's `onSubmit` on the `<form>`. Set `busy` in the handler, as above, and clear it when the save ends: a second
  press while `busy` is set sends nothing, so the form saves once. Setting it through React state would land a render
  later and let a double press through.
- **Errors.** Set `errors` through the ref, from the API's `fieldErrors` as `formErrors` shows. A path is a JSON
  Pointer (`/title`) and names the `af-field` whose `name` is `title`: the field's own `name`, or its control's. So name
  the controls by the field keys the API reports. The message becomes that field's error. A message that names no field
  goes in a summary at the top of the form, with a link to each field that has an error, and focus moves to the summary
  or to the first field with an error. Set `errors = []` to clear the form's errors; one you put on a field yourself
  stays.
- **Unsaved changes.** While `dirty` is set, leaving the page asks first. The example sets it on any `change` inside
  the form and clears it when the save succeeds.
- **`form.reset()`** does not clear a kit control, because its value is the module's: each sends `change` with its
  default (empty, unless the element has a `value` attribute), and the module sets the value back.
- **A locked field.** `<af-field label="Owner" locked-reason="Set by the workflow">` makes its control read-only and
  shows a lock whose tooltip gives the reason. A native `<select>` or a `role="radiogroup"` is only marked
  `aria-readonly="true"`, which cannot stop a person changing it, so the module ignores its `onChange` while locked.

## Lists and pages

Anything that scrolls goes in an `af-scroll-area`, a list the server pages by cursor is a `cursorList` bound to an
`af-pager`, a table is native markup with the `af-table` classes, and an empty list or a failed screen is `af-empty`
or `af-error`. `examples/kit-showcase/src/module/Structure.tsx` and `examples/kit-showcase/src/module/Pages.tsx` are working
code for this section and the next two, with the wrappers in `examples/kit-showcase/src/module/kit.tsx`.

**A scroll area.** `af-scroll-area` holds its content in the default slot. It takes `label`, which names the scrolling box
(a region a screen reader finds), and `axis` (`vertical`, the default, `horizontal` or `both`), and it fills the box that
holds it: give that box a `height` or a `max-height`, or make it a flex column, or a grid track written `minmax(0, 1fr)`
(an `auto` row grows to the tallest content in it, a side panel's say, and nothing scrolls). Its wrapper, in the pattern above:

```tsx
import type { AfScrollAreaElement } from '@reflexify/agentflow-elements/jsx';
import type { CSSProperties, ReactNode } from 'react';

export function ScrollArea(p: Common & { label: string; axis?: 'vertical' | 'horizontal' | 'both'; slot?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useElement<AfScrollAreaElement>({ label: p.label, axis: p.axis ?? 'vertical', locale: p.locale }, {});
  return <af-scroll-area ref={ref} slot={p.slot} data-theme={p.theme} style={p.style}>{p.children}</af-scroll-area>;
}
```

- **There is no `overflow: auto` or `overflow: scroll` in the module's CSS.** A plain one draws the browser's scrollbar
  among the kit's. A pane, a card or a column that scrolls is a box with an `af-scroll-area` inside it, and the box keeps
  its size.
- **The element that scrolls is `viewport`**, a property of the scroll area. The element raises no events of its own, so a
  restored position and a `scroll` listener go on the `viewport`, which is `null` until a microtask after the element
  connects. An area mounted by the module's first render has its viewport by the time a passive effect runs; one mounted
  by a click or a key does not, because React runs that effect before the microtask. So the effect tries again on the
  next frame until the viewport is there, and cancels the pending frame when it cleans up. All of the scroll area's
  properties are strings, so with a ref of your own it needs no wrapper:

  ```tsx
  import type { AfScrollAreaElement } from '@reflexify/agentflow-elements/jsx';
  import { useEffect, useRef, type ReactNode } from 'react';

  function KeptPosition(p: Common & { top: number; onTop(top: number): void; children: ReactNode }) {
    const area = useRef<AfScrollAreaElement>(null);
    const onTop = useRef(p.onTop); // the latest callback, so a parent may pass a new one each render
    onTop.current = p.onTop;
    useEffect(() => {
      let frame = 0;
      let release = () => {};
      const attach = () => {
        const viewport = area.current?.viewport;
        if (!viewport) {
          frame = requestAnimationFrame(attach); // not rendered yet: look again on the next frame
          return;
        }
        viewport.scrollTop = p.top; // where the screen was when it was last left
        const keep = () => onTop.current(viewport.scrollTop);
        viewport.addEventListener('scroll', keep, { passive: true });
        release = () => viewport.removeEventListener('scroll', keep);
      };
      attach();
      return () => {
        cancelAnimationFrame(frame);
        release();
      };
    }, []);
    return <af-scroll-area ref={area} label="Cases" locale={p.locale} data-theme={p.theme} style={{ height: 480 }}>{p.children}</af-scroll-area>;
  }
  ```

- A sticky header inside it sticks to the viewport's top, not the page's. The viewport is a tab stop while its content
  overflows and holds nothing Tab reaches (plain text, figures), so a keyboard can scroll it; one holding links, buttons
  or fields is scrolled by tabbing through them and is no stop. `label` is its name: give one to every area that may be
  a stop.

**A pager over `cursorList`.** `af-pager` draws Previous, Next and a rows-per-page select for a list the page pages
itself, and `cursorList` from the SDK keeps that list's state: the cursors behind Previous, the next cursor, `busy` and
`error`. A new call aborts the one before it and a late answer is dropped. The wrapper, in the same pattern; `pageSizes`
is compared by identity, so pass one array that lives as long as the page:

```tsx
import type { PageSizeChangeDetail } from '@reflexify/agentflow-elements/jsx';

export function Pager(p: Common & {
  hasPrev: boolean; hasNext: boolean; busy: boolean; pageSize: number; pageSizes: readonly number[]; controls?: string;
  onPrev(): void; onNext(): void; onPageSize(size: number): void;
}) {
  const ref = useElement<HTMLElement>(
    { hasPrev: p.hasPrev, hasNext: p.hasNext, busy: p.busy, pageSize: p.pageSize, pageSizes: p.pageSizes, controls: p.controls ?? null, locale: p.locale },
    { prev: () => p.onPrev(), next: () => p.onNext(), 'page-size-change': (detail: PageSizeChangeDetail) => p.onPageSize(detail.pageSize) },
  );
  return <af-pager ref={ref} data-theme={p.theme} />;
}
```

The list is made once for the page's life, and its state goes into React state from `subscribe`:

```tsx
import { cursorList, ok, type AppHost, type components } from '@reflexify/agentflow-sdk';
import { useEffect, useRef, useState } from 'react';

type Line = components['schemas']['WorkListPage']['items'][number];
const PAGE_SIZES = [25, 50, 100];

function WorkList(p: Common & { api: AppHost['api'] }) {
  const [pageSize, setPageSize] = useState(25);
  const size = useRef(pageSize); // the list reads the size when it fetches
  const [list] = useState(() => cursorList<Line>((cursor, signal) =>
    ok(p.api.GET('/work', { params: { query: { cursor: cursor ?? undefined, limit: size.current } }, signal }))));
  const [state, setState] = useState(list.state);
  useEffect(() => {
    setState(list.state);
    const stop = list.subscribe(setState); // list.state is a new object on every change
    void list.next(); // the first page
    return stop;
  }, [list]);
  return (
    <>
      <ScrollArea locale={p.locale} theme={p.theme} label="Work" style={{ height: 480 }}>
        <ol id="work-rows">{state.items.map((line) => <li key={line.id}>{line.title}</li>)}</ol>
      </ScrollArea>
      <Pager
        locale={p.locale} theme={p.theme} hasPrev={state.hasPrev} hasNext={state.hasNext} busy={state.busy}
        pageSize={pageSize} pageSizes={PAGE_SIZES} controls="work-rows"
        onPrev={() => void list.prev()} onNext={() => void list.next()}
        onPageSize={(next) => { size.current = next; setPageSize(next); void list.reset(); }}
      />
    </>
  );
}
```

- **A new filter or page size is `list.reset()`**: the first page again, with the cursors forgotten. `reload()` fetches
  the current page again, after a write.
- **`state.error`** holds the last failure; show it as the screen's error with Try again calling `reload()`.
- A cursor does not say where a page starts, so the range (`26–50 of 1,240`) shows only when the page sets `rangeStart`,
  `rangeEnd` and `total` itself; without them the pager shows Previous, Next and the page size.
- A list that grows by a Load more button uses `mode="more"` with `hasMore`, `busy` and `shown`, and the page appends the
  rows it gets (`cursorList` pages, it does not append). With `controls` and `focus-new`, focus goes to the first row that
  arrived, the first child the list did not hold at the press; set `shown` no later than `busy` goes false. `controls`
  names the element whose direct children are the rows: a `ul` or `ol`, or in a table the group's `tbody`, never the
  `table`, which leaves the pager no row to find.

**A table** is native markup with the kit's classes (the kit README's "Tables" has them all): `af-table` for the table,
`af-table-sort` on a sortable header's button with `aria-sort` on its `<th>`, and `af-table-group` on a `tbody` under a
group header. `sticky` in an `af-scroll-area` with `axis="both"` keeps the header row, a group's header and the first column
in view. The classes draw the state the page sets (`aria-sort`, `aria-selected`, `data-tone`, `data-collapsed`); sorting,
folding and selecting stay in the page:

```tsx
<ScrollArea locale={locale} theme={theme} label="Invoices" axis="both" style={{ height: 420 }}>
  <table className="af-table sticky">
    <caption className="sr-only">Invoices</caption>
    <thead>
      <tr>
        <th scope="col" aria-sort={sort}>
          <button type="button" className="af-table-sort" onClick={nextSort}>Name {ARROW}</button>
        </th>
        <th scope="col" className="num">Amount</th>
      </tr>
    </thead>
    <tbody className="af-table-group" data-collapsed={folded ? '' : undefined}>
      <tr className="af-table-group-header">
        <th scope="rowgroup" colSpan={2}>
          <div className="af-table-group-row">
            <button type="button" className="af-table-group-toggle" aria-expanded={!folded} aria-controls="open-first" onClick={fold}>
              {CHEVRON}<span>Open</span>
            </button>
            <span className="af-table-group-count">{open.length}</span>
          </div>
        </th>
      </tr>
      {open.map((row, i) => (
        <tr key={row.id} id={i === 0 ? 'open-first' : undefined} aria-selected={chosen.has(row.id) ? 'true' : undefined}>
          <td>{row.name}</td>
          <td className="num">{amount.format(row.amount)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</ScrollArea>
```

`ARROW` and `CHEVRON` are the module's own `<svg>` icons: the classes size an `<svg>` that is the button's direct child. Keep
`aria-expanded` and `aria-controls` on the toggle in step with `data-collapsed`. The README says what each part draws, and
when a table is a `compact` one or has a check column.

**Empty and error.** `af-empty` is a centred column and `af-error` a screen's failure; both are markup, with your own
icons:

```tsx
<div className="af-empty">
  {SEARCH}
  <p className="af-empty-title">{t.emptyTitle}</p>
  <p className="af-empty-body">{t.emptyBody}</p>
  <button type="button" className="af-button sm" onClick={clearSearch}>{t.clearSearch}</button>
</div>

<div className="af-error" role="alert">
  <span className="af-error-icon">{ALERT}</span>
  <h2 className="af-error-title">{t.errorTitle}</h2>
  <p className="af-error-body">{reason}</p>
  <div className="af-error-actions">
    <button type="button" className="af-button primary sm" onClick={tryAgain}>{t.tryAgain}</button>
  </div>
</div>
```

`af-empty boxed` is the same in a dashed card, for a whole list that has nothing. `af-error` can end in a native
`<details className="af-error-details">` whose trace sits in an `af-scroll-area` around a `<pre>`, as text.

## Bulk actions

While rows are selected, the actions on them sit in `af-bulk-bar`, AgentFlow's bulk action bar, raised over the page in the top
layer, so a scroll area or a card around it does not clip it. The module keeps the selection and sets `count`; the buttons
are its own, each in the `actions` slot; and the bar raises `clear` from its clear button and from Escape, which the module
answers by emptying the selection. The bar clears nothing itself.

```tsx
import type { AfBulkBarElement } from '@reflexify/agentflow-elements/jsx';
import { useEffect, type ReactNode } from 'react';

export function BulkBar(p: Common & { count: number; total?: number | null; label?: string | null; onClear(): void; children: ReactNode }) {
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
  return <af-bulk-bar ref={ref} data-theme={p.theme}>{p.children}</af-bulk-bar>;
}

// In the list, beside the rows:
<BulkBar locale={locale} theme={theme} count={selected.size} onClear={() => setSelected(new Set())}>
  <button slot="actions" type="button" className="af-button ghost sm" onClick={remind}>Send a reminder</button>
  <button slot="actions" type="button" className="af-button ghost sm" onClick={exportRows}>Export</button>
</BulkBar>
```

- **The sentence** is `3 selected`, or `3 of 40 selected` with `total`; `label` replaces it for a selection that is not a
  count of rows (`All 1,240 in Overdue selected`).
- **The actions are `af-button ghost sm`**, which take the bar's colours, in the order of use: when they are wider than the
  room, the last ones that do not fit move into a "More actions" menu. Keep the same buttons from one render to the next:
  the bar measures them again whenever they change, so actions rebuilt on every render are measured on every render
  (`pitfalls.md`).
- **Empty the selection when an action ends**, and set `count` back to 0: the bar hides, and focus that was inside it falls
  to the page's body, so move it to the list.
- **`focus()` is the bar's only keyboard hook.** It lands on the first enabled action, else the clear button. The shortcut
  that calls it is the module's, on its shadow root, as above.

## Layout

**Tabs.** `af-tabs` draws the tab list from `items` (`TabItem[]`: `{ value, label, disabled?, reason? }`) and shows the
panel slotted by the shown tab's value, so the panels stay in your tree and keep their state while another shows. A click
or an arrow key asks for a tab with `tab-change`; the element does not change tab itself, the page sets `value`. A tab with
a `reason` and `disabled` is locked, and says why in a tooltip. `variant` is `pill`, `line` or `segmented`.

```tsx
import type { TabChangeDetail } from '@reflexify/agentflow-elements/jsx';
import type { TabItem } from '@reflexify/agentflow-elements/kit';

export function Tabs(p: Common & { items: TabItem[]; value: string; label: string; onChange(value: string): void; children: ReactNode }) {
  const ref = useElement<HTMLElement>(
    { items: p.items, value: p.value, label: p.label, locale: p.locale },
    { 'tab-change': (detail: TabChangeDetail) => p.onChange(detail.value) },
  );
  return <af-tabs ref={ref} data-theme={p.theme}>{p.children}</af-tabs>;
}

// <Tabs {...c} label="Sections" items={SECTIONS} value={tab} onChange={setTab}>
//   <div slot="overview">…</div>
//   <div slot="activity">…</div>
// </Tabs>
```

Listen for `tab-change`, never `change`: a `change` from a control inside a panel bubbles through the element too, and
would read as the tab's. Pass `items` as a module constant, or memoise it when it is built from data: the wrapper sets
the property whenever the array is a new one.

**A splitter** puts two panes side by side, the list in `slot="start"` and the detail in `slot="end"`. A pane does not
scroll, so each holds an `af-scroll-area` that fills it. A drag moves the panes at once, and `size-change` `{ size }` tells
the page where it ended, so the page remembers the `size` and sets it back:

```tsx
import type { SizeChangeDetail } from '@reflexify/agentflow-elements/jsx';

export function Splitter(p: Common & { size: number; label: string; style?: CSSProperties; onChange(size: number): void; children: ReactNode }) {
  const ref = useElement<HTMLElement>(
    { size: p.size, label: p.label, locale: p.locale },
    { 'size-change': (detail: SizeChangeDetail) => p.onChange(detail.size) },
  );
  return <af-splitter ref={ref} data-theme={p.theme} style={p.style}>{p.children}</af-splitter>;
}

const KEY = 'cases:split';
const storedSize = (): number => {
  try { return Number(localStorage.getItem(KEY)) || 40; } catch { return 40; } // storage can be blocked
};

function CasesAndDetail(p: Common) {
  const [size, setSize] = useState(storedSize);
  return (
    <Splitter {...p} label="Resize the list" size={size} style={{ height: 480 }} onChange={(next) => {
      setSize(next);
      try { localStorage.setItem(KEY, String(next)); } catch { /* not kept this visit */ }
    }}>
      <ScrollArea slot="start" {...p} label="Cases" style={{ height: '100%' }}>{/* the list */}</ScrollArea>
      <ScrollArea slot="end" {...p} label="Detail" style={{ height: '100%' }}>{/* the detail */}</ScrollArea>
    </Splitter>
  );
}
```

- **Set `size` from `size-change`, and from nothing that fires during a drag.** Every `size` the page sets moves the panes
  onto it, even the value they already held, so one written on a timer, from a resize observer or on every render pulls them
  off the pointer. The hook above assigns a property only when it differs from the element's, which is why a render in the
  middle of a drag leaves it be.
- `size` is the start pane's share in percent (50 by default) within `min` (20) and `max` (80);
  `orientation="vertical"` stacks the panes.

**A side panel for a secondary task** is the dialog docked at the right edge: `placement="end"`. Add `placement` to the
`Dialog` wrapper above (`placement: p.placement ?? 'center'`, with `placement?: 'center' | 'end'` among its props, as the
showcase's `Dialog` has it) and it is the same element, with the same `heading`, body, `actions` slot and `close` reasons.
It is modal and `min(75vw, 384px)` wide, and the module never sets its width. A kit popup opened inside it rises above it,
and Escape closes the popup first. An older AgentFlow's `af-dialog` ignores `placement` and shows the centred dialog: probe
`'placement' in document.createElement('af-dialog')`, as `pitfalls.md` shows, when the screen cannot do with that.

**A panel the module draws itself** is the other shape, for a detail a person keeps beside a list: non-modal, so the page
behind stays usable (an `<aside role="dialog" aria-modal="false" aria-labelledby>`, a grid column at wide widths and an
overlay with no scrim below them; the kit guide, `node_modules/@reflexify/agentflow-elements/DESIGN.md`, has its sizes).
The kit draws no such panel, so its Escape and focus are the module's:

- **Escape closes the innermost layer first**: an open kit overlay inside the panel (a popover, a select), then the
  panel. Listen for `keydown` on the module's shadow root, never on `document`, and leave an Escape that is
  `defaultPrevented` or whose `composedPath()` holds an open kit overlay (an element with `data-raised="true"`, or an
  `af-dialog` or `af-confirm` whose `open` is true). A closed `af-person-picker` marks every Escape handled, so ignore the
  mark when the event's first target is a combobox that is not expanded. `claimEscape` is for a layer listening on
  `document`; a module does not need it.
- **Focus**: opening the panel moves focus to its heading (`tabindex="-1"`, `focus({ preventScroll: true })`); closing it
  moves focus back to what opened it, or to a stable fallback inside the module (the list's heading). An
  `af-popover` returns focus to its anchor when Escape closes it. Find the fallback through the module's root, never
  `document.querySelector`, which does not reach into the shadow root.

## `@` mentions in `af-rich-editor`

Give the editor a `mentions` property to turn `@` on: an async source `(q, group?) => Promise<MentionMenu>`. Without
it `@` is plain text. Build one for a record with the SDK's helper, which asks for the people who can read it:

```ts
import { mentions } from '@reflexify/agentflow-sdk';
const source = mentions.menuSource(client, { entity_id, record_id });   // set as el.mentions
```

- The editor reads and writes the token `@[label](mention:kind/id)` in its Markdown `value`; the label is what the
  person saw, and the server rewrites it on save.
- `single-line` makes it a one-line input (a list item's text): Enter does nothing and no toolbar is drawn.
- Chips are drawn from `mention-map`, the `mentions` map of the response that carried the value. A token whose
  target is missing from the map reads as restricted, never under its stored label, so pass the map whenever you show a
  value the server sent. A person's chip never links; a record's opens `href`.
- After a record write, read `mentions.unnotifiedOf(response)`: `unnotified` is null when nobody was refused.
- The popover is a native `popover` inside the editor's shadow root with listbox semantics (↑/↓, Enter or Tab, Esc).
- "Mentioned in" for a record is `mentions.mentionedIn(client, { entity_id, record_id, cursor?, limit? })`: one row per
  source the viewer can read, newest first, `last_author` null when the app is not told names. A page can be short while
  `next_cursor` is set, so keep paging until it is null or you have enough rows. It lists field mentions only for an installed
  app: comments are never reported to one.

## Text

`af-markdown` draws a value that is Markdown, read-only: GFM (tables, task lists), a single newline as a line break, raw HTML
as its own characters, an image as its alt text. Never set a Markdown value as `innerHTML`; set it as `value`. A mention
token (`@[label](mention:kind/id)`) is drawn as a chip from the `mentions` map of the response that carried the value, and
never as an id, so pass the map as for the editor ("`@` mentions", above). A link opens in a new tab. A link of your own
(a case in a note, `[Case 42](acme-case:42)`) uses a scheme that must be listed in `schemes`, or it is drawn as text, and
the module catches it on `af-link`, which is raised before any link opens, cancelable, and by a pressed mention chip as
`mention:<ref>`:

```tsx
import type { AfLinkDetail } from '@reflexify/agentflow-elements/jsx';
import type { ResolvedMention } from '@reflexify/agentflow-elements/kit';

const SCHEMES = ['acme-case:']; // one array, for the wrapper compares it by identity

/** `onLink` returns true when the module opens the link itself, and the element then does not. */
export function Markdown(p: Common & { value: string; mentions?: Record<string, ResolvedMention> | null; onLink(href: string): boolean }) {
  const ref = useElement<HTMLElement>({ value: p.value, mentions: p.mentions ?? null, schemes: SCHEMES, locale: p.locale }, {});
  const onLink = useRef(p.onLink);
  onLink.current = p.onLink;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listener = (e: Event) => {
      if (onLink.current((e as CustomEvent<AfLinkDetail>).detail.href)) e.preventDefault();
    };
    el.addEventListener('af-link', listener);
    return () => el.removeEventListener('af-link', listener);
  }, [ref]);
  return <af-markdown ref={ref} data-theme={p.theme} />;
}

// <Markdown {...c} value={record.notes} mentions={response.mentions} onLink={(href) => {
//   const id = /^acme-case:(.+)$/.exec(href)?.[1];
//   if (id) host.navigate(`/cases/${id}`);
//   return id !== undefined;
// }} />
```

The element loads its code on first use, as `af-tile` does, so until it lands the text is empty and the element is
`aria-busy="true"`. Only the first 20,000 characters are read as Markdown; the rest is plain text.
