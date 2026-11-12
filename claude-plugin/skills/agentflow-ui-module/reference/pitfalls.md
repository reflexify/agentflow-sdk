# Pitfalls

Each of these was met in a real module, and most pass the demo and fail only inside AgentFlow or after a
release, so read this list against your module before you hand it off. Each entry gives the symptom, the cause,
and what to write instead.

## Styles and layout

- **The focus ring, or another style built on a token, vanishes inside AgentFlow but not in the demo.**
  Cause: custom properties declared on `:host`. AgentFlow maps each `--af-*` token on the host element from one
  of its own names (`--af-ring: var(--ring)`); a module property of that name on `:host` (`--ring: var(--af-ring, …)`)
  makes the two refer to each other, and both compute to nothing, fallback and all.
  Instead: declare every custom property on the module's root element and its `[data-theme='dark']` rule.
  `:host` carries layout only (`display: block; position: relative`).
- **The module's styles do nothing, or the page around the module changes.**
  Cause: a second stylesheet (a `<link>`, a `.css` file beside the entry, a second `<style>`), or a selector on
  `:root`, `html` or `body`. Inside a shadow root those selectors match nothing; on a standalone page they style
  the page.
  Instead: one `<style>` prepended to the shadow root, `KIT_CSS` first and then the module's CSS imported with
  `?inline`, as `mountCases` in `src/module/mount.tsx` does.
- **The layout breaks inside AgentFlow at a width that looked fine in the demo.**
  Cause: a width `@media`, a viewport unit such as `vh`, or `window.innerWidth`. AgentFlow's sidebar takes part of
  the window, so the module's width is not the window's.
  Instead: the root declares `container: <name> / inline-size`, and every responsive rule is an `@container`
  query on it.
- **A typeface declared with `@font-face` in the module's CSS never loads.**
  Cause: browsers ignore `@font-face` inside a shadow root.
  Instead: inside AgentFlow, use the host's faces through `--af-font-sans` and `--af-font-mono` (Geist and Geist
  Mono), with a fallback. For a face the host lacks, put the `.woff2` beside the module's source, reference it with
  `new URL(…, import.meta.url)` so the module build carries it, and register it on the document, which the shadow
  root shares, with the kit's `loadFonts`. The module build inlines the file into `index.js` as a `data:` URI,
  whatever its size, so `package/ui` holds no `.woff2` and the script grows by a third more than the file: subset the
  face to the weights and characters you use. AgentFlow's pages send no Content-Security-Policy, so a `data:` face
  loads:

  ```ts
  import { loadFonts } from '@reflexify/agentflow-elements/kit';

  await loadFonts([{ family: 'Display', url: new URL('./display.woff2', import.meta.url).href }]);
  ```

  It adds a face once per page, even when two modules ask for it, gives each weight (`descriptors: { weight: '700' }`)
  its own face, leaves a family the host already has alone, and warns rather than rejects when a face does not load.
  A family name belongs to the whole page, so another app's face under the same name can replace yours: name the
  family after your app.

  Then make the face the module's font, the kit's elements included: their tooltips, toasts and dialogs read
  `--af-font-sans`. Declare it on the module's root, as a stack that does not read itself:
  `--af-font-sans: 'Display', ui-sans-serif, system-ui, sans-serif;`. The kit's elements inside the root inherit it,
  in the top layer too. On `:host` it does nothing inside AgentFlow, whose own value on the host element wins.

  On the standalone page, declare the faces in the page's own CSS.
- **The focus ring is hard to see.**
  Cause: a ring drawn with `--af-ring` alone, the primary at 40% alpha, about 1.6 to 1 on white.
  Instead: `outline: 2px solid` in `--af-primary` (the starter's `--accent`), offset 2 px, through
  `:focus-visible` only. This is for a control of your own. A kit class or element draws AgentFlow's soft ring (a border in
  `--af-ring` and a 3 px ring of it at half strength, a 2 px outline in forced colours), which is also about 1.6 to 1: a
  known gap carried from AgentFlow, not a rule for your controls, so leave the kit's as it is.
- **A pane or a list shows the browser's scrollbar, a splitter's pane cuts its content off, or an `af-scroll-area` is as
  tall as its content and never scrolls.**
  Cause: the pane, card or column scrolls itself, with `overflow: auto` or `overflow: scroll` in the module's CSS, which
  draws the browser's scrollbar among the kit's; or the content sits in a splitter's pane, which clips and does not
  scroll; or the `af-scroll-area` has no height to fill, because its holder has none or is a grid row left `auto`, which
  grows to the tallest content in it (a side panel's, say).
  Instead: keep the pane a sized box and put an `af-scroll-area` in it (`style={{ height: '100%' }}` in a pane). The box
  gives the area its height: a `height` or a `max-height`, a flex column, or a grid track written `minmax(0, 1fr)`. The
  module's CSS has no `overflow: auto` or `overflow: scroll`; `overflow: hidden` for a corner is fine.

## Behaviour

- **A module reads where a field's value came from through the cockpit or `/context/*`, and an app's token is refused.**
  Cause: those routes feed AgentFlow's own record page. They are internal: an app's token gets `403 APP_CEILING_DENIED`,
  and inside AgentFlow they carry no compatibility promise and fail on the standalone host.
  Instead: `GET /entities/{entity_id}/records/{record_id}/provenance`, read once and joined per field with
  `provenance.forField` (`records-api.md`, "Where a field's value came from").
- **The module says nothing was recorded for a field, when the organization has context queries off.**
  Cause: `origins` is `"unavailable"`, so every `origin` is `null`. It says the organization does not keep origins, not
  that this field has none; a citation is still told.
  Instead: read `answer.origins` first. When it is `unavailable`, draw no origin and no "unknown", and show the
  citation alone; when it is `available` and the field has no entry, the field has neither.
- **The provenance call answers 404 on an AgentFlow that has no such route.**
  Cause: the module reads `…/provenance` and the manifest still says an earlier month. Nothing in the package says what a
  module calls, so only `minPlatformVersion` keeps an older AgentFlow from taking the package.
  Instead: set `minPlatformVersion` to `2027.04`, as the `computeTiles` entry below does for its month, and show the
  origin and passages as unavailable, not as absent, for an installation that outlives a rollback.
- **Typing in a field fires one of the module's shortcuts, or keys typed in AgentFlow's own page reach the module.**
  Cause: a `keydown` listener on `document` (or `window`). It sees a key typed inside a shadow root as typed on
  the host element, so it cannot tell a field from a shortcut, and it hears the host's page too.
  Instead: listen on the shadow root and read the real target with `composedPath()`. The listeners a library may
  keep, each live only during its own interaction: Zag's dismissable layer (Escape while an overlay is open), its
  focus-visible tracker, its toast-group hotkey, Svelte 5's delegated dispatcher, dnd-kit's keyboard and pointer
  sensors during a drag, the signature pad's pointer tracking while a stroke is held, the one `pointerdown` listener
  `af-dialog` adds while it is open, and the one `beforeunload` listener `af-form` holds on `window` while its `dirty` is set.
- **The module shows nothing in another organization, or reads its objects twice.**
  Cause: a hard-coded id or API base, or `GET /app/objects` read in an effect, which React's StrictMode runs
  twice in development.
  Instead: read ids through `getAppObjects(host.api)` (`src/module/http-cases-api.ts`): one shared request, and
  a failed load is asked again by the next call. Make every address the browser opens itself, a download link or an
  `<img src>`, with `host.apiUrl`.
- **A newer feature is switched on for an org that has not got it, or off for one that has.**
  Cause: comparing `AppHost.contractVersion`, the host contract, with a package version. They are different
  numbers, and the installed version says nothing about an object an admin kept as their own copy.
  Instead: `getAppObjects(host.api).satisfies('<logical key>', '<the version that added the feature>')`.
- **The install is refused, or the module shows "needs a newer AgentFlow", after the manifest says `contract: 2`.**
  Cause: contract 2 (`host.assistant`) needs an AgentFlow that implements it; an older API refuses the package
  at `lint` and at upload as `manifest_invalid` at `manifest.json` (not `platform_too_old`; no platform version
  or route tells the two builds apart), and an older frontend will not mount it.
  Instead: declare `contract: 2` only when the module calls `host.assistant`. AgentFlow reads contract 2 from its
  release `v0.4.0` (AgentFlow's own tag, not the SDK's `sdk-v0.4.0`; a deployment reports a platform month such as
  `2026.10`, which `minPlatformVersion` compares and which does not tell the two apart). Run `lint` with `contract: 2` and then with `1`, and if only 1 passes the deployment predates
  contract 2, so declare 1. Keep `contract: 1` for a module that does not call `host.assistant`. Contract 3 adds `host.signing` in the same way: declare 3 only when the module calls it, and an AgentFlow built before contract 3 refuses the package like this. Contract 4 is the list of assistant items and `host.assistant.open`, the same way: declare 4 only when the module sends a list or calls `open`, and for one that offers a single record, declare 2. Contract 5 is `host.tasks` and `<agentflow-task>`, the same way: declare 5 only when the module works a Human step's task.
- **The assistant button shows the wrong record, or none, or the call throws in the app's own site.**
  Cause: a name or label passed to `setContext` (it takes only `{ entity, record }`), the entity's id instead of
  its key, a call that is not set from the route, or `host.assistant.setContext` without the `?.` where the host
  has no assistant.
  Instead: `host.assistant?.setContext(itemId ? { entity: 'item', record: itemId } : null)` from an effect
  that depends on the id parsed from the module's path (`host.onLocationChange`, SKILL.md step 4), and nothing else.
- **The module calls `setContext`, its tests pass, and AgentFlow still offers no button.**
  Cause: the console says `assistant.setContext: this app has no entity "item"`. Either the deployment's host
  predates matching the package key and took only the installed key (`acme_items__item`), or the tests' answer to
  `GET /app/objects` gives an object the same `key` and `logical_key`, which no installation does, so they never
  saw the difference.
  Instead: send the package key, give the test fixture installed keys (`routes.md`, "A test host"),
  and check the running build in the sandbox: the served `ui/index.js` should call `setContext`, and `GET /me`
  should answer `ai_mode_available: true` for the person.
- **`open` does nothing, and the console says `assistant.open: only a person's click or key press opens the assistant, so it was ignored`.**
  Cause: `host.assistant.open` was called from an effect, a timer, a fetch callback or a `setTimeout` long after the
  last click. AgentFlow opens the dock only on a person's gesture, which holds for a few seconds after a click or
  key press. A call from `mount` right after the person clicked into the app is within that time; a call that runs
  because a screen rendered is not.
  Instead: call `open` from the click or key handler of the button that asked for it, synchronously or within a
  few seconds of it, and render the button only where `host.assistant?.open` exists (`assistant.md`).
- **An item the module sent is missing from the assistant, and the console says `assistant.setContext: <reason>, so that item was ignored`** (`assistant.open:` for `attach`).
  Cause: the host drops an item it cannot take and keeps the rest. The reason says which:
  - `the item is not one this host takes`: a kind misspelled. Instead: send only `record`, `records`, `view`, `dashboard`, `text`, `file` and your own app kinds.
  - `the file is not an id`: `file` is a name, a URL or empty. Instead: send the attachment's id.
  - `the record is not an id`: a record that is a name, a route segment or empty. Instead: send the record's id.
  - `this app has no entity "<key>"` and `this app has no dashboard "<key>"`: the key is neither the package's own nor an installed key. Instead: send the key you wrote.
  - `the selection holds no ids`: `records` is empty. Instead: send nothing, or the record that is open.
  - `the filter is not an object of at most 2048 bytes`: a `view` whose `filter` is not an object, or is over 2048 bytes. Instead: send an object holding only the filter the screen applies (`field_filters`, `ref_filters`), not the whole query.
  - `the text is blank or longer than 12288 bytes`: Instead: cut the text where a sentence ends, to `APP_ASSISTANT_TEXT_MAX_BYTES` as `JSON.stringify` counts it.
  - `the data is not JSON of at most 4096 bytes`: Instead: send the values the skill needs, as plain JSON, to `APP_ASSISTANT_DATA_MAX_BYTES`.
  - `the label is blank or longer than 80 characters`: Instead: a short label in the person's language, to `APP_ASSISTANT_LABEL_MAX`.
  - `the kind "<kind>" is not this app's`: an app kind not named `<package>:<name>` after this module's own package. Instead: use your package's id, as the manifest has it.
  The host cannot see the manifest: an app kind the package does not declare in `assistant.context_kinds` passes the host and reaches the assistant as an unavailable reading, with no warning in the console (`assistant.md`).
- **Live updates never arrive in development, or stop after a reload.**
  Cause: `host.realtime.close()` in an effect's cleanup. React's StrictMode runs every effect twice in
  development, so the cleanup closes the stream right after it opens; the host owns the stream, and once closed
  it never reopens for that mount.
  Instead: never call `close()` on `host.realtime`. Unsubscribe your own listeners only.
- **Switching the language closes the open dialog and loses what was typed.**
  Cause: the module remounts on a language or theme change.
  Instead: subscribe with `host.onLocaleChange` and `host.onThemeChange` and re-render in place, as `Following`
  in `src/module/mount.tsx` does.
- **A dialog's fields are missing, or stay behind after it closes.**
  Cause: content slotted into a kit element moved into a portal. A `<slot>` does not follow it.
  Instead: keep slotted content where it is; the kit's overlays already rise into the top layer. Put the module's
  own overlays in `host.portalRoot`.
- **A toast's action or close button does nothing while a dialog is open.**
  Cause: the toast was shown while a modal `af-dialog` stayed open. The dialog makes the page inert, and the toast
  region, a sibling of the dialog, is drawn above it but cannot be pressed.
  Instead: show a refusal that keeps the dialog open inside it, in an `af-banner danger`; a toast shown after the dialog
  closes is pressable.
- **A kit property or method is missing at run time, though the types have it.**
  Cause: an older kit registered the tag first, another module's or, inside AgentFlow, AgentFlow's own copy, which every
  module opened there runs on. Registration is global, and the first copy wins.
  Instead: feature-detect anything newer than the kit version you require, on the upgraded element, not on the tag:
  `customElements.get('af-date')` is always defined once your own import has run, so it says nothing. A tag added in a
  release that an older host never had (`af-select`, `af-combobox`, `af-number-input`, `af-field`, `af-fieldset`,
  `af-form`, `af-scroll-area`, `af-tabs`, `af-splitter`, `af-pager`, `af-copy-button`, `af-markdown`, `af-tree-picker`,
  `af-bulk-bar`, `af-file-upload`, `af-signature-pad`) is defined by your own copy, and needs no check. A property added to
  a tag the host has (`range`, `name`, `required` on `af-date`; `name`, `required` and `source` on `af-person-picker`;
  `placement` on `af-dialog`; `size` on `af-select`) is missing when the host's older copy won, and is ignored without an
  error. Probe it, and fall back to a native control, or to `people` fetched by the module, where it is missing:

  ```ts
  const hasRange = 'range' in document.createElement('af-date'); // false: draw two af-date or two native date inputs
  const hasPanel = 'placement' in document.createElement('af-dialog'); // false: the dialog is always centred
  const hasSource = 'source' in document.createElement('af-person-picker'); // false: hand it `people`, fetched by the module
  ```

  `af-menu`'s groups and checkable items add no property to probe, and an older `af-menu` knows only plain items: keep to
  plain items, or compare `customElements.get('af-menu').kitVersion` with the release that has them.

  Read `customElements.get(tag).kitVersion` to see which copy you got.
- **A screen reader reads no reason for a locked control, or no name for a kit input.**
  Cause: `aria-describedby` pointed through `af-tooltip`, or a `<label for>` pointed at a kit input. Neither
  crosses a shadow boundary.
  Instead: a visually hidden `<span id="…">` with the reason beside the control, named by its `aria-describedby`,
  plus the `af-tooltip` for sight; name a kit input (`af-date`, `af-person-picker`, `af-tree-picker`, `af-number-input`,
  `af-select`, `af-combobox`, `af-signature-pad`, `af-rich-editor`) with its `label`, or put it in an `af-field`, which sets it.
- **A kit element stays disabled after `disabled="false"`.**
  Cause: the kit's Boolean attributes follow presence semantics: present means true, whatever the value.
  Instead: leave the attribute out, or set the property to `false` through the wrapper
  (`kit-in-react.md`, beside this file).
- **Every figure is missing, and `computeTiles` throws a 404.**
  Cause: the module computes its own tiles on an AgentFlow older than platform `2026.12`, the first with the
  operation (`POST /analytics/tiles/compute`, which `computeTiles` sends). Nothing in the package says it needs the
  operation unless `minPlatformVersion` does: the build and verification don't read what a module calls.
  Instead: set `minPlatformVersion` to `2026.12`, or to `2027.01` when a tile holds a `percentile` or a `duration`
  measure (a `2026.12` build answers those with a 422), so that an older AgentFlow refuses the package at upload. An
  installation that outlives a rollback still gets the 404, so handle it as "not supported here": show the figures as
  unavailable, not as zero.
- **Every total is refused on the app's own site, with `403 ENDPOINT_NOT_PUBLIC`.**
  Cause: the module sends `POST /entities/{entity_id}/records/stats` with the app's token on an AgentFlow release that
  served it to AgentFlow's own pages only. Inside AgentFlow the same call works, because the module calls as the
  person, so the fault shows only on the standalone site. No platform month marks the operation, so nothing refuses
  the package at upload.
  Instead: install on an AgentFlow that serves it to apps, and show the totals as unavailable, not as zero, where
  the call is refused.
- **A tile over a large entity shows zero.**
  Cause: a tile with no date window can run past its 10 second deadline and come back `failed` with
  `TILE_TIMEOUT`. A tile that did not compute has an empty `measures`, so a module that reads `r.<tile>.measures.<key>`
  without looking at `outcome` gets `undefined` and draws a zero.
  Instead: give a tile over a growing entity a date window (`within`, `last_<n>_days`), and show the failed state
  rather than a zero.
- **A splitter jumps back while it is dragged, or fights the pointer.**
  Cause: the page sets `size` while a drag is live. A drag moves the panes before the page hears of it, and every `size`
  the page sets moves them onto it, even the value they already held, so a wrapper that assigns `size` on every render, a
  resize observer or a timer pulls the panes off the pointer.
  Instead: set `size` from `size-change`, which arrives when the drag ends and after an arrow key, Home or End, and assign
  a property only when it differs from the element's, as `useElement` does (`kit-in-react.md`, "Layout"). Do not listen
  for `change`: a `change` from a control inside a pane bubbles through the element.
- **A `scroll` listener on `af-scroll-area` never fires, or a restored scroll position is not applied.**
  Cause: the element raises no events and does not scroll itself. The box that scrolls is its `viewport`, inside its
  shadow root, and `scroll` does not bubble; the `viewport` is `null` until a microtask after the element connects, so a
  read in the render or a layout effect finds nothing, and so does a passive effect when the area was mounted by a click or
  a key (React runs that effect before the microtask; an area mounted by the module's first render is ready by then).
  Instead: read `area.viewport` in an effect and, while it is `null`, look again on the next `requestAnimationFrame`,
  cancelling the pending frame in the cleanup; put the listener and the `scrollTop` on it once it is there
  (`kit-in-react.md`, "Lists and pages").
- **A task page blanks fields of the record, or lets a person act on a task they do not hold.**
  Cause: the page sends `…/step/submit` itself with only the fields it drew (the bound write reads a missing key as empty), or
  decides for itself which buttons are live instead of reading `state.actions`.
  Instead: act through the handle (`submit`, `claim`, `release`, `saveDraft`, `sign`) and draw `enabled` and `reason` as given; no other
  task route is the page's to call (`task-pages.md`).
- **A task page opens a task by the wrong id, or loops between the page and AgentFlow.**
  Cause: the id in the path is the Workflow task's record id and the page used it as the subject's, or the page links to
  `/inbox?record=…` for its own task, which the landing sends straight back.
  Instead: pass the path's id to `<agentflow-task record>`; read the subject from `handle.state.step`; link out to the task's record page,
  `/entities/<state.record.entity>/records/<state.record.id>`.
- **A task page shows nothing, or its buttons do nothing, inside an older AgentFlow or on the app's own site.**
  Cause: `host.tasks` is missing, or the provider is an older copy of the elements without a `tasks` property, so `<agentflow-task>` reads
  `unsupported` and makes no call.
  Instead: check `host.tasks` and `'tasks' in provider` before the wrapper, and show a notice with a link to AgentFlow otherwise.
- **A task page waits for ever on `loading`, or a failed call looks like success.**
  Cause: the page draws a spinner for every status that is not `ready`, so `error` (the task could not be read) spins for ever, and a rejected `submit` or `claim` was caught and dropped.
  Instead: draw a notice for `error` (from `state.problem`); show `error.problem.title` for every rejection (`status: 0` is the host refusing before it sends).

- **A folder upload through an app's token is refused, or lands nowhere.**
  Cause: the module sends the folder's files to `POST /attachments` as it would one file for a File field. An app's token
  uploads only for a record's File field or a comment, and a start form's file field is neither, so the call is refused
  `APP_CEILING_DENIED` or `VALIDATION_ERROR`.
  Instead: give the folder to `af-folder-source` (or `folderSources(client).uploadFolder`), which stores it in an upload set,
  and start the run with the `{ $fileSet }` value it hands back (`records-api.md`, "Records from a folder").
- **The second click on Add creates the dossiers twice, or the start answers `UPLOAD_SET_ALREADY_LAUNCHED`.**
  Cause: an upload set launches once; a run that took it marks it used under the set's lock. A retry with the same set after
  a start that did reach the server is refused, and a module that makes a new set for each click imports twice.
  Instead: lock Start while the call is out and until the run's answer, send the set once, and make a new set (a new pick)
  for another import. A watched folder is not used up: it feeds as many runs as it is launched with.
- **A reload or a closed tab in the middle of a big upload starts it over, or a half-made set is left behind.**
  Cause: the module did not keep the set's id where the page finds it again (`sessionStorage` dies with the tab), so
  `resume-set` was never given back, and the set stays one of the person's five unfinished sets.
  Instead: keep the id from `af-folder-upload-started` in `sessionStorage`, or in `localStorage` keyed by person for a
  closed tab (`records-api.md`, "Records from a folder"), and give it back as `resume-set`; the
  next pick of the same folder uploads only what the set lacks. On `workflow-started`, clear the stored id and the
  form's `resumeSets` entry: the run took that set, and it cannot be resumed or launched again.
- **Uploads stop being accepted: every new folder is refused, with no files uploaded.**
  Cause: each person may hold at most five unfinished upload sets. Taking `af-folder-source` off the page mid-upload stops
  the upload and deletes the set that upload made, so only a reload, or a screen that uses `folderSources` by hand and drops
  a set's id, leaves one behind. At five, a `create_upload_set` first deletes the person's unfinished set that has gone
  longest without a file, when that is at least an hour and no run reads it, and is refused (`VALIDATION_ERROR`) only when
  every one of the five was written within the hour. No operation lists a person's sets, so a module cannot delete one
  whose id it did not keep.
  Instead: delete a set the person abandons with `sources.deleteSet(setId)` (`delete_upload_set`) while you still hold its
  id, such as one kept for a resume that the person then walks away from; `af-folder-source` does it for a cancelled
  upload, a mismatched resume and a refusal, and the SDK for an aborted `signal`. A person refused at five waits for the
  oldest to pass the hour, or finishes one.
- **A folder call fails on a platform that has no folder sources, or an app's `version_id` is refused.**
  Cause: an AgentFlow built before the folder operations answers 404 to them, and an installed app's token may not name a
  version (`get_workflow_input_contract` and `preview_folder_launch` take `version_id` only from a first-party session).
  Instead: treat a 404 from `list_watched_folders` as "this AgentFlow cannot do folders" and show a notice; leave `version_id`
  and the element's `version` out in a module that an app's token serves.

## Forms

- **A combobox flickers, loses its list or asks the server again on every render.**
  Cause: a new `source` function each render, such as one written inline in the JSX or built in the component's body.
  The combobox asks again whenever the function changes, so each render restarts the list.
  Instead: one stable function, a module constant or `useCallback` (or `useMemo`) over the client, so it changes only
  when the client does (`kit-in-react.md`, "A choice").
- **A person, group or unit picker restarts its list, or a tree picker fetches every unit again, on every render.**
  Cause: `directory.people(client)`, `directory.groups(client)` or `directory.units(client)` called in the component's body
  or in the JSX. Each call returns a new function, and a picker restarts whenever its `source` changes; a tree picker asks
  for every page of units again.
  Instead: call it once, in a module constant or in `useMemo` over the client, and pass the result
  (`kit-in-react.md`, "Pickers").
- **A tree picker shows its units all at the top level, or a unit's branch is missing.**
  Cause: `nodes` whose `parentId`s name ids that are not in the list: a list the page cut down to what it wanted to show,
  a page of a longer list, or ids from another source. A node whose parent is not in the list is a root, so each such node
  becomes one, whatever its `parentId` says.
  Instead: give the picker the whole hierarchy and let its own search narrow it, or a `source` that lists every page, as
  `directory.units(client)` does. An archived parent that the list leaves out makes its children roots too.
- **A bulk bar measures its actions again on every render.**
  Cause: the actions are rebuilt each render, such as a button component defined inside the render function, a `key` that
  changes, or the buttons mapped from a new array of elements with new keys. The bar measures its actions again whenever
  they change, and hides those that do not fit in its menu, so the menu is remeasured each time and the actions that fit can
  move in and out of it as the page re-renders.
  Instead: define the buttons outside the render function with stable keys, and change only their props
  (`kit-in-react.md`, "Bulk actions").
- **A form saves twice on a double press, though it sets `busy`.**
  Cause: a listener for `submit` on `af-form`, or React's `onSubmit` on the `<form>`. The native `submit` bubbles through
  the element, so the listener hears every press, including those `af-form` withholds as `af-submit` while it is locked
  or `busy`.
  Instead: listen for `af-submit` on the `af-form`, set `busy` in the handler in the same tick (an element property, not
  React state, which lands a render later), and clear it when the save ends (`kit-in-react.md`, "A form").
- **A field's label points at nothing, its error never shows, or a grid cell is the wrong size.**
  Cause: the page moved or wrapped what `af-field` and `af-fieldset` lay out. `af-field` wires its first child that is
  neither its own nor in a slot, so a `<div>` around the control becomes that child and the input inside gets no label,
  `aria-describedby` or error. `af-fieldset` places the native `<fieldset>`'s direct children on its grid, so a wrapper
  around a field is one cell and its `data-span` is ignored. A `display`, `order`, `position` or `grid-column` rule on an
  `af-field`, an `af-fieldset` or the nodes they insert (`.af-field-row`, `.af-field-label` and the rest) fights the
  layout they draw.
  Instead: write the control as the field's first child and each field as a direct child of the `<fieldset>`; place a
  field with `data-span` and `data-col`; put the extra markup beside the field, or in a child with `slot="aside"`.
- **`form.reset()` leaves a kit control showing its old value.**
  Cause: kit controls are controlled, so a control cannot clear itself. On a reset each one sends `change` with its
  default (its `value` attribute if it has one, otherwise empty), and a module that ignores `change`, or does not set
  the value back, keeps the old value on screen. The form's `FormData` follows the controlled value too, so it also
  still holds the old value until the module sets the default back.
  Instead: handle `change` as for any edit, so the reset reaches the module's state, or reset that state yourself.

## Build and serving

- **AgentFlow cannot load the module, or `pnpm build` refuses it.**
  Cause: a library build that is not the shape AgentFlow loads.
  Instead: keep `vite.module.config.ts` as the starter has it: `process.env.NODE_ENV` defined as production; one
  ES entry, `index.js`, ending `export { mount };`; chunks under `chunks/`; no `.css` beside the entry; nothing
  imported bare (React, the kit and the SDK bundled); only the extensions AgentFlow serves, and no HTML. A package
  whose `ui/` holds another file type is refused on upload with `PACKAGE_UI_FILE_INVALID`.
- **`seal` refuses with `UI_ENTRY_MISSING`.**
  Cause: `package/ui` is built output, which git ignores, and it was never built in this checkout.
  Instead: run `pnpm build` before `pnpm seal`.
- **The sidebar entry opens a notice that apps do not open inside AgentFlow on this deployment.**
  Cause: the module check answers `off`: the deployment has `APP_MODULES_ENABLED` turned off.
  Instead: nothing in the package changes it. The deployment's operator decides; the package still installs and
  its workflows and records work.
- **A standalone site's upload or person lookup is refused with an app token.**
  Cause: a packaged ceiling holds both. `POST /attachments` needs a target the app may write (the paperclip,
  below). `GET /users`, `GET /groups/{id}`, `GET /identities`, `GET /units` and `GET /units/{id}` answer only for a
  platform entity the package lists in `requires.entities` (`user`, `group`, `org_unit`), and tell only the fields
  it lists there; `GET /users/{id}` and `GET /groups` are refused whatever it lists. An AgentFlow older than
  platform `2026.11` can refuse all of these but `GET /users`. An embedded module calls as the person, so it never
  meets this.
  Instead: list the entity and the fields the site reads (a package with no `ui` module is then refused
  `requirement_unused` at deploy unless an object uses the entity: `lint-problems.md` in the release skill), send the
  upload's target, and set `minPlatformVersion` to `2026.11`; or make those calls from the module inside AgentFlow,
  or as the signed-in person. A site registered outside the package has no ceiling.
- **A text with mentions shows raw `@[name](mention:…)` tokens, or a chip with a title the viewer may not read.**
  Cause: the editor was given the text but not the record's `mentions` map, or the module built the chip from the
  token's stored label. A record's response carries the map, keyed `<kind>/<id>`, and has already blanked the label of
  anything the viewer cannot read.
  Instead: pass `mentionMap` (the record's `mentions`) to every `<af-rich-editor>` that shows the text, read-only ones
  included, and let the kit draw a target the map lacks as restricted. Keep the `mentions` map on the module's own
  type for the record so an optimistic update spreads it along.
- **`@` does nothing in an editor, or reopens its menu on every render.**
  Cause: `mentions` is unset (the kit offers no menu without a source, and a read-only editor needs none), or it is a
  new function each render.
  Instead: build the source once with the SDK's `mentions.menuSource(client, { entity_id, record_id, copy })` inside
  `useMemo`, bound to the record being written about, and give it only to editors the viewer may write.
- **Enter or Escape in a one-line mention editor both saves and picks a person.**
  Cause: the editor keeps Enter and Escape for its menu while one is open, but a one-line editor also swallows Enter
  when it is not, so `defaultPrevented` tells nothing.
  Instead: treat the key as the field's own only when no element on the event's `composedPath()` has
  `aria-expanded="true"` (the editor's text field says so while the menu is open); commit the field on `focusout`.
- **A call to an operation the contract does not list yet fails the module's published-operations test.**
  Cause: that test replays every call against the repository's contract.
  Instead: keep the one call in a small adapter of its own, so the day the
  operation is published only the adapter and the test's allowance change.
- **A reload on one of the module's routes of a standalone site answers 404.**
  Cause: the route sits under a path the server answers itself, `/agentflow/` (the SDK's routes) or a prefix of
  the app's own, such as `/site/`, so the server never falls back to the page.
  Instead: keep the server's own files under prefixes the module never routes to.

## Tests

- **A test of the module's styles sees no CSS.**
  Cause: under Vitest a stylesheet imported with `?inline` is an empty string, so a screen or mount test renders
  without the module's CSS.
  Instead: read the file, as `test/module/styles.test.ts` does:
  `readFileSync(new URL('../../src/module/styles.css', import.meta.url), 'utf8')`.
- **A node test fails on import with `Class extends value undefined is not a constructor or null`.**
  Cause: it imports, directly or through `mount.tsx`, a file that imports the kit, and the kit's elements need a
  DOM. The starter's tests run in node unless a first line says `// @vitest-environment jsdom`.
  Instead: give the test that line, or move what a node test needs (a constant, a pure function) into a file that
  does not import the kit.
- **A screen test fails with `Test timed out in 5000ms`.**
  Cause: the kit's first render takes seconds on a busy machine or CI runner, and the screen test's waits allow 5 s
  (`asyncUtilTimeout`), as long as Vitest's default per-test limit, so the test is stopped before its wait can fail
  and say what it waited for.
  Instead: keep the starter's `vitest.config.ts`, which gives a test 30 s (`testTimeout: 30_000`). A project made
  from an older starter adds that member to its own `test` block.
- **`https://svelte.dev/e/derived_inert` is printed, and the test passes.**
  Cause: the page set an `af-popover`'s `open` to false and removed the element (or the React subtree holding it)
  in the same moment. A frame after closing, the popover's library asks where focus should go, and by then the
  element is gone, so Svelte warns that it read a value of a destroyed component. Nothing breaks: the popover is
  closed, and what it would focus is no longer on the page. A browser's console shows the same line.
  Instead: nothing is required. To keep the output clean, keep the `af-popover` mounted and drive it with `open`, or
  remove it a frame after closing it.

## Comments

- **A mention shows a name the reader may not see, or a name that has since changed.**
  Cause: the chip was drawn from the label inside the stored token (`@[Label](mention:user/<id>)`), which is what
  the author saw when they wrote it.
  Instead: draw every chip from the response's `mentions` map, keyed `user/<id>` or `record/<entity>/<record>`. A
  target missing from the map, or `restricted`, is drawn restricted with no name; `deleted` as a deleted record.
- **Editing a comment loses a mention, or leaks a record's name back.**
  Cause: the edit box showed raw tokens, or rebuilt them from the visible `@Name`.
  Instead: show `@Name` for a person's token and keep the picked people beside the text; write tokens again on send.
  Send a token whose label came back empty exactly as it came back (the server keeps the label it stored).
- **The section shows an error where the entity takes no comments.**
  Cause: `COMMENTS_DISABLED` (409) or a ceiling's refusal (403/404) treated as a load failure.
  Instead: those mean there is nothing to show. Render nothing and do not retry.
- **The paperclip works in the demo and is refused on the standalone site.**
  Cause: the upload names no target. An app's token uploads a file only for a comment on a record or a File field
  of one (`APP_CEILING_DENIED` or `VALIDATION_ERROR` otherwise), and an AgentFlow older than platform `2026.11`
  refuses every upload through an app's token.
  Instead: send the target as text parts beside `file`: `entity_id`, `record_id` and `comment=true` for a comment's
  file, or `field=<key>` in place of `comment` for a File field. The session under `/apps/` ignores them, so one
  request serves both hosts. Set `minPlatformVersion` to `2026.11`; a package that must install on an older
  AgentFlow hides the button where the host is standalone (not under `/apps/`: `!host.basePath.startsWith('/apps/')`).
- **Escape in a half-written comment closes the drawer and loses it.**
  Cause: the drawer's own Escape runs after the box's.
  Instead: with the `@` menu open, Escape closes the menu (the box is `role="combobox"` with `aria-expanded`, which
  the drawer reads as taken); with text typed and the menu closed, `preventDefault` and blur the box.

## Adding a module to a `--no-ui` project

Step 1 of the skill copies the scratch project's `src/module/` and `test/module/` whole, and they hold the case desk's
screens. Keep what is generic, keep the shape of the pattern files, and replace what reads `entity:case`:

| Keep as it is | Keep the shape, change the names | The case desk's own: replace with yours |
|---|---|---|
| `src/module/kit.tsx`, `test/module/styles.test.ts`, `test/module/ui-build.test.ts`, `vite.module.config.ts`, `vitest.config.ts` | `mount.tsx`, `module.tsx`, `demo.tsx`, `module.html`, and the token block at the top of `styles.css` (the `--bg` to `--info-soft` variables on the module's root class) | `CasesScreen.tsx`, `NewCaseDialog.tsx`, `cases-api.ts`, `http-cases-api.ts`, `memory-cases-api.ts`, `icons.tsx` (it imports `CaseStatus`), `text.ts`, the rest of `styles.css`, `test/module/cases-screen.test.tsx` and `test/module/http-cases-api.test.ts` |

`examples/leave-tutorial` copies `kit.tsx` and the two generic tests from the scratch project, writes the two config files
(`vite.module.config.ts`, `vitest.config.ts`, the second replacing the `--no-ui` project's own) and the middle and right
columns for a leave-request entity.
