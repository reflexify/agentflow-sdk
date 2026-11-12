---
name: agentflow-ui-module
description: "Use when writing, changing or reviewing an AgentFlow app's UI module (the package's ui/, mount(root, host) on an AppHost) with @reflexify/agentflow-elements/kit: its screens, styles and tokens, theme and language, kit elements, accessibility, and the module's tests and build."
---

# Writing an AgentFlow UI module

This skill starts where `agentflow-app-authoring` stops. Authoring owns the manifest's `ui` member, the launcher entries and the `ui`
option of `defineApp`; `agentflow-app-release` owns building and sealing. This skill names both and does not repeat them. It covers the
module's own code: its screens, styles, kit elements, language and theme, tests and review.

## What a module is

The guide's page for readers without an agent is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/mo-dun-giao-dien` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/mo-dun-giao-dien`). `<AGENTFLOW_URL>` is the address your team opens AgentFlow at.

- The package's `ui/index.js` is an ES module whose named export `mount(root, host)` renders into `root` and
  returns the function that unmounts it. `root` is inside a shadow root, and `host` is an `AppHost`
  (`@reflexify/agentflow-sdk`). Contract 2 added one optional member, `host.assistant`, which tells AgentFlow's
  docked assistant which record the module has open (contract 4: a list of items, and `open`); a host without an assistant (the app's own site, or an
  organization with AI mode off) leaves it out. Contract 3 added `host.signing?.sign({ entity, record })`, which opens AgentFlow's signing dialog for a record and is left out the same way: `reference/signing.md`. Contract 5 added `host.tasks?.open({ record })`, a handle on a Human step's task for the module's own task page, left out the same way: `reference/task-pages.md`. Contract 6 added `host.files?.preview(files, { start })`, AgentFlow's own file preview, left out the same way (step 6).
- The same module runs in two hosts: inside AgentFlow, which imports the package's `ui/index.js`, and on the
  app's own site, which mounts it with `createStandaloneHost`. The API's base, the theme and the language come
  from the host in both; never assume one of them.
- The rules are in the design guide, `node_modules/@reflexify/agentflow-elements/DESIGN.md`, which ships with
  the kit at the version you installed. When this skill and the guide differ, the guide is right.
- Paths: a starter path such as `src/module/mount.tsx` is in your project, copied from the case desk starter.

## Steps

### 1. Check that the project has a module

A project with a module has all three of these:

- the `ui` member in `config/package-manifest.json`: `"ui": { "kind": "module", "entry": "ui/index.js", "contract": 2 }`
  (1 to 6: 2 when the module calls `host.assistant`, 3 when it calls `host.signing`, 4 when it sends a list of items or calls `host.assistant.open`, 5 when it calls `host.tasks` or uses `<agentflow-task>`, 6 when it calls `host.files`, else 1; every module gets the same host; AgentFlow before its release `v0.4.0`, not the SDK's `sdk-v0.4.0`, refuses 2, and one built before contract 3, 4, 5 or 6 refuses it);
- `vite.module.config.ts`, the module's Vite build;
- `src/module/module.tsx`, the entry that exports `mount`.

If one is missing (a project made with `agentflow-app init --no-ui`), add the module from the starter. Make a
scratch project with a module, beside yours, with the builder your project already has, so its files and
versions match your release:

```bash
pnpm exec agentflow-app init ../ui-starter --prefix acme --no-site   # your own prefix
```

1. Copy from the scratch project into yours: `src/module/`, `test/module/`, `module.html`, `vite.module.config.ts`, and
   `tsconfig.json` and `tsconfig.node.json` when yours has none; copy `vitest.config.ts` too, **replacing yours if you
   have one** (a unit-test config never runs the module's `.test.tsx` tests, silently). What to keep: `reference/pitfalls.md`.
2. In your `package.json`, add every entry of the scratch project's `dependencies` and `devDependencies` that
   yours lacks, written exactly as there.
3. In its `scripts`, add `demo` and `typecheck`, and replace `test` with the scratch project's, which runs Vitest
   before the check; keep the other scripts:

```json
"demo": "vite --config vite.module.config.ts --open /module.html",
"test": "vitest run && agentflow-app build --check && agentflow-app types --check",
"typecheck": "tsc -p tsconfig.json --noEmit && tsc -p tsconfig.node.json --noEmit"
```

4. Add the `ui` member and a `module` launcher entry as `agentflow-app-authoring` says, run `pnpm install` and
   `pnpm build`, then delete the scratch project.

If you cannot run `init`, copy the same files from `examples/case-desk/` in the SDK repository at your release
tag instead. Its tsconfigs extend the repository's `tsconfig.base.json`: delete each `extends` line and add that
file's `compilerOptions` to the file's own, keeping its own where both set one. Then add the dependencies at the
starter's ranges, and the scripts as in step 3:

```bash
pnpm add "react@^19.3.0" "react-dom@^19.3.0"
pnpm add "github:reflexify/agentflow-sdk#sdk-v0.11.0&path:packages/agentflow-elements"
pnpm add "github:reflexify/agentflow-sdk#sdk-v0.11.0&path:packages/agentflow-sdk"
pnpm add -D "vite@^8.3.1" "@vitejs/plugin-react@^6.1.1" "jsdom@^30.1.1" "@testing-library/react@^16.3.3" \
  "@types/react@^19.3.0" "@types/react-dom@^19.3.0"
pnpm add -D "vitest@^5.0.1" "typescript@^7.0.2" "@types/node@^26.6.2"   # only those the project lacks
```

### 2. Read

1. `node_modules/@reflexify/agentflow-elements/DESIGN.md`: "Module rules" and "Review checklist" first, then the rest.
2. The starter's module, in this order: `src/module/module.tsx`, `src/module/mount.tsx`, `src/module/kit.tsx`,
   `src/module/styles.css`, `src/module/text.ts`, `src/module/CasesScreen.tsx`, `src/module/NewCaseDialog.tsx`,
   `src/module/demo.tsx`.

### 3. Write the screen's API as an interface

- Put everything the screen asks AgentFlow behind one interface, with two implementations: one over HTTP
  through `host.api`, and one in memory for the demo and the tests. Pattern: `src/module/cases-api.ts`,
  `src/module/http-cases-api.ts`, `src/module/memory-cases-api.ts`.
- The starter lists every case unfiltered. A filter, a sort, the names of referenced records (`ref_labels`), a file
  upload, where a field's value came from, and people, groups and units (the installation's `parameters` among them): `reference/records-api.md`.
- A screen that only reads, with no create dialog: `reference/read-only-screens.md` says what to delete and what
  the checks will not tell you.
- A refused call carries AgentFlow's own sentence, with any leading code stripped, as `toCasesError` in
  `src/module/http-cases-api.ts` does. Show that sentence; never show a raw code to a person. A settings screen for the person's own notification switches (`GET`/`PUT /app/notification-preferences`): `reference/notification-settings.md`.

### 4. Mount

Write the mount in the shape of `mountCases` in `src/module/mount.tsx`: one `<style>` holding `KIT_CSS` and then the
module's CSS, prepended to the shadow root; a root element with the class `<app> af-kit` and `tabIndex = -1`; an
unmount that removes the style. Here for a module whose root class is `intake`:

```tsx
import { KIT_CSS } from '@reflexify/agentflow-elements/kit';
import type { AppHost } from '@reflexify/agentflow-sdk';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import css from './styles.css?inline';
// Following and createHttpIntakeApi are your own, written as the starter's are (steps 3 and 7).

export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  const doc = root.ownerDocument;
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = doc.createElement('style');
  style.textContent = `${KIT_CSS}\n${css}`;
  (scope instanceof ShadowRoot ? scope : root).prepend(style);
  const element = doc.createElement('div');
  element.className = 'intake af-kit';
  element.tabIndex = -1;
  root.append(element);
  const react = createRoot(element);
  react.render(<StrictMode><Following host={host} api={createHttpIntakeApi(host)} element={element} /></StrictMode>);
  return () => {
    react.unmount();
    element.remove();
    style.remove();
  };
}
```

- **Routes.** The module's path comes from `host.onLocationChange` (called at once, then on each `navigate`) and
  moves with `host.navigate('/items/42')`. The starter's narrowed `ScreenHost` must be widened to use them or
  `host.assistant`. The `usePath` hook, the widening, and the record page a `work.module_page` opens (any status; never via `/inbox`): `reference/routes.md`.
- Tell the assistant what is open, when the module has records: call `host.assistant?.setContext({ entity, record })`
  with the entity's key in your package and the record's id, from an effect on the real route (the path above),
  and `null` when no record is open. The key is the one you wrote (`item`), not the key AgentFlow installed it under
  (`/app/objects` lists that one as `key`: `acme_items__item`) and not its id. Never pass a name: AgentFlow reads the record as the person and labels the button itself, so a
  module cannot label one record and attach another, and a record the person cannot read gets no button (a stale id
  does no harm: `reference/routes.md`). Never clear it on unmount (the host does). A list of items, text, an app kind and `open`: `reference/assistant.md`. It is optional: `host.assistant?.setContext(...)`:

  ```tsx
  const itemId = /^\/items\/([^/?#]+)/.exec(usePath(host))?.[1]; // usePath: reference/routes.md
  useEffect(() => {
    host.assistant?.setContext(itemId ? { entity: 'item', record: itemId } : null);
  }, [host, itemId]);
  ```
- Read ids through `getAppObjects(host.api)`, never in an effect: `await objects.load()`, then
  `objects.id('entity:case')`. The cache is one per client, so every screen shares one request, and a failed
  load is asked again by the next call, so Try again recovers (`src/module/http-cases-api.ts`).
- Keys are the package's logical keys (`entity:case`, `workflow:open_case`). The app's own object wins over a bound
  or exported one with the same key. `id` is null for a missing or switched-off object.
- Call `objects.subscribe(fn)` when a screen should follow an upgrade or a feature switched on: the cache then
  loads again when AgentFlow reports a newer revision, and when the person comes back to the tab. Call the
  function `subscribe` returns from the function `mount` returns: `host.close()` does not end the
  subscription, so a remount would otherwise leave a listener and a cache behind that keep fetching.
- Guard a feature a later release added with `objects.satisfies('entity:case', '<the version that added it>')`.
  Never guard it with the installed package version: an org that kept its own copy of the object still has the
  older contract.
- Generate the package's types with `pnpm build`, then `pnpm exec agentflow-app types` (it reads `package/`), and
  commit `src/generated/app.ts`. Put `agentflow-app types --check` after the build check in the app's test script, so
  a stale file fails the tests (`TYPES_STALE`). Use the keys and the field types in the module as
  `reference/generated-types.md` shows.
- When a key the screen needs is missing, show a notice that names it in place of the screen. Check every key
  the screen needs, so one notice names all the missing ones:

  ```ts
  const KEYS = ['entity:item', 'entity:team'] as const;

  // Runs in the async loader `mount` starts, not in `mount` itself.
  async function missingKeys(host: AppHost): Promise<string[]> {
    const objects = getAppObjects(host.api);
    await objects.load();
    return KEYS.filter((key) => objects.id(key) === null);
  }
  // A non-empty result: render a notice naming `missing.join(', ')` instead of the screen.
  ```

### 5. Tokens

- Copy the token block from the guide's section 3.1 (`DESIGN.md`), then the root rule and its dark rule from
  `src/module/styles.css`. The starter's block holds only what its screen uses (no `--warn`, `--selected`, `--press`,
  `--raised` or `--elev-*`). Amber is `--warn`, `--warn-soft` and `--warn-ink`; the only hue a module adds is `--info`.
- Rename `.cases` to your root class everywhere, including `container: cases / inline-size` and every `@container cases` query.
- Derive, do not invent: every new colour is a `color-mix` of a token. The full set of roles, with each fallback, is in the guide's "Foundations".

### 6. Kit elements through a small wrapper

- Wrap each kit element in a component that sets its properties through a ref and listens with
  `addEventListener`, and pass `locale` and `data-theme` to every one. Pattern: `src/module/kit.tsx` (`Dialog`, `DateInput`, `useToasts`, `LazyTooltip`). `examples/kit-showcase` in the SDK repository is working code for every element: `examples/kit-showcase/src/module/kit.tsx` has a wrapper for each element (the kit README lists every property: add one to the wrapper's properties) and `examples/kit-showcase/src/module/FormSection.tsx` the form; `examples/kit-showcase/src/module/Structure.tsx` is the elements that lay a screen out and `examples/kit-showcase/src/module/Pages.tsx` the classes of a page.
- A form: `af-form` around a native `<form>`, `af-fieldset` around a `<fieldset>` and `af-field` around each control (label, help, error), with `af-number-input`, `af-select` (a short list), `af-combobox` (a long or searched one, over one stable `source`) and `af-date` with `range`. The three form tags need no wrapper. `reference/kit-in-react.md`, "A form".
- A list, sections and a value that is Markdown: whatever scrolls is an `af-scroll-area` (no `overflow: auto` in the module's CSS); a cursor-paged list is `cursorList` bound to `af-pager`; a table is `.af-table` markup; sections are `af-tabs`, a list beside its detail an `af-splitter` (resizable panes) or the module's own non-modal side panel (`reference/kit-in-react.md`, "A panel the module draws itself"), a secondary task `af-dialog` with `placement="end"` (modal); Markdown is `af-markdown`, never `innerHTML`. `reference/kit-in-react.md`, "Lists and pages", "Layout" and "Text".
- People, units, files, signatures and a selection: the SDK's `directory.people(client)` goes into `af-person-picker`'s `source`, `directory.units(client)` into `af-tree-picker`'s and `directory.groups(client, { members })` into `af-combobox`'s, each made once and never in a render (`GET /groups` is refused to an app's token); `directory.myUnits(client)` reads the person's own units for a header (`name` and `code` are `null` unless the package lists them of `org_unit`; `reference/records-api.md`); `af-file-upload` shows the `items` the module sets after each upload (`attach`, in `reference/records-api.md`); `af-signature-pad` sits in an `af-dialog`, and the module calls `clear()` before it reuses the pad for another record; `af-bulk-bar` holds the module's buttons in `slot="actions"`, and the module binds its own shortcut (`Alt+Shift+A`) to the bar's `focus()`. `reference/kit-in-react.md`, "Pickers", "Files and signatures" and "Bulk actions"; `examples/kit-showcase/src/module/Pickers.tsx`, `Pages.tsx` and `FormSection.tsx` are working code. A folder as a run's input (a watched folder or one from the person's computer, a record per subfolder): `<agentflow-start-form entity record action>`, or `af-folder-source` over `folderSources(client)` and `start_instance`. An app's token cannot upload into a start form, so the folder goes into an upload set, which launches once; keep its id so a reload resumes, and delete one the person abandons. `reference/records-api.md`, "Records from a folder".
- Preview a file in AgentFlow's own viewer rather than send the person to a download: `await host.files?.preview(ids.map((file) => ({ file })), { start })` (contract 6). `files` is a file id, an `{ file, filename? }` or a list of them, at most 200, and `start` is the index to open on. The preview steps through the list, shows PDFs and images, offers Download for any other kind, and opens above the module's own `af-dialog`; the promise resolves when it closes (the person's close or Escape, the module moving or unmounting, or a later `preview` call) and at once on a closed host. A bad list rejects with a `TypeError` that starts `files.preview:`, and a bad `start` warns and opens the first file. The app's own site and an AgentFlow built before contract 6 leave `files` out, so where it is missing link the file as before, with `host.apiUrl('/attachments/<id>/download')`.
- **Feature-detect a property the host's kit may lack.** The first copy of a tag on the page wins, so AgentFlow's older `af-date` or `af-person-picker` can ignore `range`, `name` and `required` (and `source` on the person picker), and an older `af-dialog` or `af-select` `placement` and `size`. Probe the upgraded element (`'range' in document.createElement('af-date')`, `'placement' in document.createElement('af-dialog')`, `'source' in document.createElement('af-person-picker')`), not `customElements.get`, which your own import makes true, and fall back to a native control where it is missing. The sixteen tags new in this release (the form tags, `af-select`, `af-combobox`, `af-number-input`, `af-scroll-area`, `af-tabs`, `af-splitter`, `af-pager`, `af-copy-button`, `af-markdown`, `af-tree-picker`, `af-bulk-bar`, `af-file-upload` and `af-signature-pad`) are defined by your own import and need no check: `reference/pitfalls.md`.
- The wrapper, the typings, `busy`, Boolean attributes and `af-tile`: `reference/kit-in-react.md`. A figure: `af-tile`, fed as `reference/records-api.md` says.
- The standalone site beside the module (`server/`, `src/` outside `src/module/`): the `agentflow-app-authoring` skill's page on the site.

### 7. Follow the locale and the theme in place

- Subscribe with `host.onLocaleChange` and `host.onThemeChange` and re-render; never remount.
- Neither calls its listener as it subscribes. Read `host.context` for the first render, and again right after subscribing, so a switch made in between is not lost.
- Pattern: `Following` in `src/module/mount.tsx`, which does both and sets `data-theme` and `lang` on the root.
- Keep every text in both languages in one file, `src/module/text.ts`, chosen with `langOf`.
- Review in Vietnamese, the longer language (about 30% longer than English).

### 8. States and locks

- Loading shows a skeleton after 150 ms; empty shows an icon, a title and at most one action; an error shows the
  reason and Try again. `src/module/CasesScreen.tsx` has all three.
- A locked control is `aria-disabled`, with its reason in visually hidden text that its `aria-describedby`
  names, and in an `af-tooltip` for sight (the guide's "Accessibility"). Lock what this record refuses now (a move a rule blocks); leave out what the person's access never gives (Delete without `delete`), as AgentFlow's record page does (`records-api.md`, "What the person may do").
- A dialog's submit locks on the first press, through `af-form`'s `busy` set in its `af-submit` handler: `src/module/NewCaseDialog.tsx`.
- A change made in place shows first and rolls back on failure, with one flash and the server's reason (the
  guide's "Interaction").
- Format dates as `formatDay` in `src/module/CasesScreen.tsx` does, and counts as `TEXT.en.count` in
  `src/module/text.ts` does.

### 9. Tests

- The screen tests, `test/module/cases-screen.test.tsx`: the jsdom shims first, then the screen imported after
  them, rendered over the in-memory API.
- The styles test, `test/module/styles.test.ts`, refuses a selector on `:root`, `html` or `body`, a custom
  property or colour literal outside the root, a token read without a fallback, `prefers-color-scheme`, a
  viewport unit and a width `@media`.
- The UI build test, `test/module/ui-build.test.ts`, builds as `agentflow-app build` does and refuses any script
  but `index.js` outside `chunks/`, a `.css` beside the entry, a bare import of React, the kit or the SDK, a
  leftover `process.env.NODE_ENV`, and React's development JSX runtime.
- Keep both; rename nothing in them when you rename the root. What trips a new test: `reference/pitfalls.md`, "Tests".
- Run `pnpm test`. With a browser, run `pnpm demo` (`http://localhost:5174/module.html`) and look at the screen, also
  with `?empty` (no data) and `?fail` (a failing create); with none, list that look as not checked (step 11).

### 10. Build

Run `pnpm build` (`agentflow-app build`). It prints `ui: built` when the module built. A refusal:

| Code | Fix |
|---|---|
| `UI_TOOL_MISSING` | Vite is not installed: `pnpm add -D vite`, with the React plugin, or remove `ui` |
| `UI_BUILD_FAILED` | Vite failed on the module: fix the error quoted after `the UI module did not build:` (`"./jsx" is not exported`: write `import type {} from '@reflexify/agentflow-elements/jsx';`; `tsc` passes a plain import too, so only the build shows it) |
| `UI_ENTRY_MISSING` | no `index.js`: keep `fileName: () => 'index.js'` in `vite.module.config.ts`; from `seal`, `pnpm build` first |
| `UI_ENTRY_INVALID` | `index.js` does not end with `export { mount };`: export `mount` from `src/module/module.tsx` |
| `UI_FILE_TYPE` | the build wrote a file AgentFlow does not serve: no HTML, keep `copyPublicDir: false` |

AgentFlow answers `PACKAGE_UI_FILE_INVALID` when a package's `ui/` holds a file type it does not serve. The
release skill has the rest. Then hand over to `agentflow-app-release` for sealing.

### 11. Review

- Answer every item of [reference/checklist.md](reference/checklist.md) in both themes and both languages, at
  1280 px and at 800 px of module width, and once on a red primary. For the red, give both `applyTheme` calls in
  `src/module/demo.tsx` this palette in place of `AF_DEFAULT_PALETTE`, and undo it after the review:

```ts
const RED = {
  light: { ...AF_DEFAULT_PALETTE.light, '--af-primary': 'oklch(0.55 0.2 25)' },
  dark: { ...AF_DEFAULT_PALETTE.dark, '--af-primary': 'oklch(0.7 0.17 25)' },
};
```

- In `pnpm demo` the module fills the window and follows the browser. Switch the theme with Chrome DevTools'
  Rendering panel (emulate `prefers-color-scheme`), or the system's appearance. Switch the language with the
  Sensors panel's locale, or the browser's language setting, then reload. Set the width with DevTools' device
  toolbar (responsive mode) to 1280 and to 800.
- Every answer must be yes. Fix what is not, and say in your hand-off which items you checked, and how.
- **No browser** (a sandbox, CI)? Do what needs none, and list the rest as **not checked**, never as yes:
  `pnpm test` (the styles test covers items 1, 5 and 6 as far as colour literals, selectors on `:root`, `html` and
  `body`, properties on `:host`, viewport units and width `@media` go); `pnpm typecheck`; `pnpm build`, which must
  print `ui: built`; and a search of your own code for item 7 (`document.`, `window.`), item 8 (one
  `GET /app/objects` per mount, `host.apiUrl`), item 13 (`aria-disabled`), item 16 (no emoji), item 24 (a control with no
  `af-field` or `label`), item 25 (a `source` written in a render), item 28 (`overflow: auto` or `overflow: scroll`), item 29 (a
  `<table` with no `af-table`) and item 30 (`innerHTML`). Screen tests over the in-memory API can show items 9, 17, 18, 21, 26 and
  27 in both languages. Items 2 to 4, 10 to 12, 14, 15, 19, 20, 22 and 23, and every condition (both themes as drawn, 800 px, the
  red primary), need someone to look: name them in the hand-off as not checked, so a person does it before release.

## Worked examples

The starter, the case desk (paths in your project):

- `src/module/module.tsx`, `src/module/mount.tsx`, `src/module/kit.tsx`, `src/module/styles.css`
- `src/module/text.ts`, `src/module/CasesScreen.tsx`, `src/module/NewCaseDialog.tsx`, `src/module/demo.tsx`
- `vite.module.config.ts`, `test/module/cases-screen.test.tsx`

## Pitfalls

Read `reference/pitfalls.md` before you hand off. The four met most often:

- Custom properties declared on `:host` compute to nothing inside AgentFlow: declare them on the module's root.
- A `keydown` on `document` sees keys typed in AgentFlow's page: listen on the shadow root.
- Ids read in an effect are read twice under StrictMode: read `GET /app/objects` once per mount.
- A width `@media` follows the window, not the module: use `@container` queries on the root.
- A text field with mentions needs the record's `mentions` map on every editor that shows it and a stable `mentions` source on the ones that write it: see the pitfalls file.

## Before you hand off

- `pnpm test` passes, the styles test and the UI build test included.
- `pnpm typecheck` passes.
- `pnpm build` prints `ui: built`.
- Every item of [reference/checklist.md](reference/checklist.md) is yes under every condition it names.
