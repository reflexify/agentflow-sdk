# Designing an AgentFlow UI module

For teams, and their coding agents, who write the UI module of an AgentFlow app. It ships with the UI kit at the same
version, as `node_modules/@reflexify/agentflow-elements/DESIGN.md`, so the copy beside your kit is the one that applies.
A rule says "must" or "never" and gives its reason; the rest is the default. Read section 2 and section 10 first: they
are what a review checks. Each element's properties, events and parts are in the kit README,
[The UI kit](README.md#the-ui-kit).

## 0. Before you start

**A module is an ES module whose named export `mount(root, host)` renders into `root` and returns the function that
unmounts it.** `root` is inside a shadow root (`root.getRootNode()`), and `host` is an `AppHost` of contract version 1
(`APP_CONTRACT_VERSION` in `@reflexify/agentflow-sdk`). Only plain data and functions cross between the two, so the
module bundles its own framework.

**The same module runs in two hosts.** AgentFlow, at `/apps/<key>`, imports the package's `ui/index.js`; the app's own
site mounts it with `createStandaloneHost`, as the SDK README shows in
[App modules](../agentflow-sdk/README.md#app-modules). Three things differ, and a module must take each from the host:

| | Inside AgentFlow | On the app's own site |
|---|---|---|
| The API's base | AgentFlow's API, with the person's session | the SDK server's proxy |
| The theme | the person's light or dark mode and the organization's brand | the browser's colour scheme, with `AF_DEFAULT_PALETTE` |
| The language | AgentFlow's language switcher | `navigator.language` |

**AgentFlow mounts a module only when its module check answers `ready` for the signed-in person.** The states, in the
order they are checked, are `not_installed`, `disabled`, `not_assigned`, `no_ui` and `ready`;
for each of the others AgentFlow shows a notice in place of the module. A failed
import, or a `mount` that throws, shows a notice with Try again.

**Two worked examples.** The starter's module is the small one: one list screen and one create dialog, in
`src/module/` of a project `agentflow-app init` made (`examples/case-desk` in the SDK repository). Projects is the
large one, with a board, a side panel and drag and drop (`examples/projects`). A path such as `src/module/mount.tsx`
is in your own project; a Projects path is written in full, such as `examples/projects/src/mount.tsx`, and is in the
SDK repository at your release tag.

## 1. Principles

1. **Native to AgentFlow.** The module sits beside AgentFlow's sidebar and should read as one of its pages: the font
   through `--af-font-sans`, 13 px rows, 11 px chips, 16 px icons, neutral surfaces, and the brand colour only for
   primary actions, selection and focus. No colour is a literal unless the module owns it, so a customer's brand
   restyles the module with no change to its code.
2. **Calm.** At rest a screen shows content, not chrome. Borders are hairlines, a shadow means "raised" and nothing
   else, and colour carries meaning (overdue, refused, a status), never decoration.
3. **Dense but readable.** People scan forty rows, not four, so rows are 40 px and nothing is smaller than 11 px,
   avatar initials aside. Vietnamese diacritics always get their line height.
4. **Fast, and seen to be fast.** A press answers in the same frame (`:active`), and a write shows its result before
   the server replies. A skeleton waits 150 ms and a spinner 400 ms, so a quick answer never flashes either.
5. **Locked, not hidden.** A control the person may not use stays where it is, looks inert and says why: one that
   vanishes teaches nothing, and the layout jumps when it returns.
6. **One way to do each thing:** one card, one data-chip shape, one status-pill shape, one focus ring and one toast
   region. Two looks for one meaning make people wonder what the difference is.

## 2. Module rules

A module's own code follows these in both hosts. Each exists because breaking it failed somewhere.

1. **One `<style>` in the shadow root: `KIT_CSS` first, then the module's CSS.** Prepend it to the shadow root on
   mount and remove it on unmount. Import the CSS with Vite's `?inline`, so it lives in the script: the loader imports
   only the entry, and a `.css` file beside `index.js` would never load. Pattern: `mountCases` in
   `src/module/mount.tsx`, and `examples/projects/src/styles/inject.ts`.
2. **No selector on `:root`, `html` or `body`.** Inside a shadow root they match nothing, and on a standalone page
   they style the page around the module. `:host` may carry layout only (`display: block; position: relative`).
3. **Custom properties on the module's own root element, never on `:host`.** AgentFlow maps each `--af-*` token on the
   host element from one of its own names (`--af-ring: var(--ring)`). A module property of that name declared on
   `:host` too (`--ring: var(--af-ring, …)`) makes the two refer to each other; CSS then invalidates both, the fallback
   is not used, and the property computes to nothing. A focus ring vanished exactly that way.
4. **Width through container queries.** The root declares `container: <name> / inline-size`, and every responsive
   rule is `@container <name> (width < …)`. Never a width `@media`, a viewport unit (`vh`, `vw`, `dvh`),
   `window.innerWidth` or `matchMedia` for size: AgentFlow's sidebar takes part of the window, so the module's width
   is not the window's. `prefers-reduced-motion` is a preference and allowed; `prefers-color-scheme` is not, because
   the theme comes from the host.
5. **No listener on `document` or `window` in the module's own code.** Listen on the shadow root and read the real
   target with `composedPath()`. Keys typed in the host's page are the host's, and a `document` listener sees a key
   typed inside a shadow root as typed on the host element, so it cannot tell a field from a shortcut. Make the root
   focusable (`tabIndex = -1`) so a click inside gives the module focus. Libraries may keep these listeners, each live
   only during its own interaction and acting only on its keys: the overlay library's Escape listener while an overlay
   is open (Zag's dismissable layer); its focus-visible tracker (global and lasting, but it never acts on a key); its
   toast-group hotkey (inert); Svelte 5's delegated dispatcher; and dnd-kit's keyboard and pointer sensors during a
   drag. The last has a cost: the module's own Escape handler runs before dnd-kit's, so ask whether a drag is in progress
   before closing anything on Escape. `af-dialog` also adds one `pointerdown` listener on its document while it is open.
6. **Ids from `GET /app/objects`, once per mount.** `host.api.GET('/app/objects')` turns the logical keys the package
   ships with (`entity:case`) into this organization's ids, with the installation's parameters, in every host. Ask in
   `mount`, or in an API object made once per mount, never in an effect, which React's StrictMode runs twice in
   development. Ask again after a failed read, so Try again recovers. When a key the screen needs is missing, show a
   notice that names the missing key or the package instead of the screen. Never hard-code an id. Pattern:
   `src/module/http-cases-api.ts`, and `examples/projects/src/mount.tsx`.
7. **`host.apiUrl(path)` for anything the browser fetches itself**, such as a download link or an `<img src>`. The
   API's address differs between the hosts, and the typed client cannot make such a URL.
8. **Never call `close()` on `host.realtime`.** The host owns it: it opens it on the first read and closes it on
   unmount. A module that closed it would end live updates for good the second time an effect ran. Read it only if
   the screen needs live updates; a module that never reads it costs no stream.
9. **Locale and theme change in place.** `host.onLocaleChange` and `host.onThemeChange` do not call their listener as
   it subscribes, so read `host.context` first and again right after subscribing. Re-render, never remount: a remount
   loses an open dialog, what is typed in it, and the live stream. Set `data-theme` and `lang` on the root, and pass
   `locale` and `data-theme` to every kit element. Pattern: `Following` in `src/module/mount.tsx`.
10. **Overlays.** The kit's overlays rise into the browser's top layer from their own shadow root (dialogs with
    `showModal()`, the rest with `popover="manual"`), so content slotted into them keeps working and nothing clips
    them. The module's own overlays go into `host.portalRoot`, which is in the same shadow root. Never move slotted
    content into a portal: a `<slot>` does not follow it.
11. **Feature-detect any kit feature newer than the kit version you require.** Registration is global and guarded, so
    the first copy of a tag on the page wins, and another module's older copy may be the one yours gets. Test
    `'label' in el` or `typeof el.show === 'function'`; `customElements.get('af-date').kitVersion` names the copy.
12. **Bundle everything.** The Vite library build has one ES entry, `index.js`, ending `export { mount };`, with its
    chunks under `chunks/`, `process.env.NODE_ENV` defined, and React, the kit and the SDK bundled. Ship only the
    extensions AgentFlow serves under `ui/`: `.js`, `.mjs`, `.css`, `.json`, `.map`, `.svg`, `.png`, `.jpg`, `.webp`
    and `.woff2`, never HTML. Pattern: `vite.module.config.ts`.

## 3. Foundations

### 3.1 Tokens

The fourteen `--af-*` tokens (`AF_TOKENS`) are the whole theming contract. The host sets them, with `data-theme` and
`data-brand`, on the element that holds the shadow root. Read each with a fallback equal to `AF_DEFAULT_PALETTE`
(light values in the root rule, dark in the root's `[data-theme='dark']` rule), so the demo, the tests and a host
without tokens still look like AgentFlow. Derive every other colour with `color-mix(in oklab, …)` toward `--ink`: one
formula darkens in light mode and lightens in dark. Never invent a colour; the only module-owned hue is info,
declared in the root's block. The starter's `src/module/styles.css` holds the part of this block it uses and is the
file to copy; rename `.my-app` to your root's class.

```css
.my-app {
  /* From the host; each fallback is AF_DEFAULT_PALETTE.light */
  --bg: var(--af-bg, oklch(0.984 0.003 248));
  --surface: var(--af-surface, oklch(1 0 0));
  --ink: var(--af-fg, oklch(0.21 0.035 255));
  --muted: var(--af-muted-fg, oklch(0.5 0.035 257));
  --line: var(--af-border, oklch(0.922 0.013 255));
  --accent: var(--af-primary, oklch(0.55 0.17 254));
  --accent-ink: var(--af-primary-fg, oklch(0.99 0.004 250));
  --danger: var(--af-danger, oklch(0.577 0.245 27.325));
  --warn: var(--af-warning, oklch(0.666 0.179 58.318));
  --ok: var(--af-success, oklch(0.596 0.145 163.225));
  --r: var(--af-radius, 0.625rem);
  --font-ui: var(--af-font-sans, ui-sans-serif, system-ui, sans-serif);
  /* Owned by the module: AgentFlow has no info hue */
  --info: oklch(0.55 0.15 250);
  /* Derived: one formula for both themes */
  --raised: var(--surface);
  --sunk: color-mix(in oklab, var(--bg) 94%, var(--ink));
  --hover: color-mix(in oklab, var(--ink) 4%, transparent);
  --press: color-mix(in oklab, var(--ink) 9%, transparent);
  --faint: color-mix(in oklab, var(--muted) 65%, var(--bg));
  --line-strong: color-mix(in oklab, var(--line), var(--ink) 40%);
  --selected: color-mix(in oklab, var(--accent) 8%, var(--surface));
  --accent-soft: color-mix(in oklab, var(--accent) 12%, var(--surface));
  --focus: var(--accent);
  --danger-ink: color-mix(in oklab, var(--danger) 78%, var(--ink));
  --danger-soft: color-mix(in oklab, var(--danger) 12%, var(--surface));
  --warn-ink: color-mix(in oklab, var(--warn) 62%, var(--ink));
  --warn-soft: color-mix(in oklab, var(--warn) 14%, var(--surface));
  --ok-ink: color-mix(in oklab, var(--ok) 72%, var(--ink));
  --ok-soft: color-mix(in oklab, var(--ok) 12%, var(--surface));
  --info-ink: color-mix(in oklab, var(--info) 80%, var(--ink));
  --info-soft: color-mix(in oklab, var(--info) 12%, var(--surface));
  --neutral-soft: color-mix(in oklab, var(--ink) 7%, var(--surface));
  --elev-1: 0 1px 2px rgb(15 23 42 / .06);
  --elev-2: 0 1px 2px rgb(15 23 42 / .06), 0 4px 12px -2px rgb(15 23 42 / .10);
  --elev-3: 0 2px 6px rgb(15 23 42 / .08), 0 12px 28px -6px rgb(15 23 42 / .22);
  --elev-4: 0 24px 48px -12px rgb(15 23 42 / .28), 0 2px 8px rgb(15 23 42 / .08);
  --dur-1: 100ms; --dur-2: 160ms; --dur-3: 220ms; --dur-4: 300ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-move: cubic-bezier(0.25, 1, 0.5, 1);
  container: my-app / inline-size;
  background: var(--bg);
  color: var(--ink);
  font: 400 13px/20px var(--font-ui);
  color-scheme: light;
}
.my-app[data-theme='dark'] {
  --bg: var(--af-bg, oklch(0.18 0.022 255));
  --surface: var(--af-surface, oklch(0.218 0.024 255));
  --ink: var(--af-fg, oklch(0.962 0.006 250));
  --muted: var(--af-muted-fg, oklch(0.76 0.02 255));
  --line: var(--af-border, oklch(1 0 0 / 11%));
  --accent: var(--af-primary, oklch(0.74 0.13 248));
  --accent-ink: var(--af-primary-fg, oklch(0.2 0.035 252));
  --danger: var(--af-danger, oklch(0.704 0.191 22.216));
  --info: oklch(0.74 0.12 250);
  --raised: color-mix(in oklab, var(--surface) 94%, white);
  --elev-1: 0 1px 2px rgb(0 0 0 / .30);
  --elev-2: 0 1px 2px rgb(0 0 0 / .30), 0 4px 12px -2px rgb(0 0 0 / .45);
  --elev-3: 0 2px 6px rgb(0 0 0 / .40), 0 12px 28px -6px rgb(0 0 0 / .60);
  --elev-4: 0 24px 48px -12px rgb(0 0 0 / .65), 0 0 0 1px var(--line);
  color-scheme: dark;
}
```

### 3.2 Spacing

A 4 px grid, and only these steps: 2 px inside chips; 4 px between chips; 6 px for chip padding and meta gaps; 8 px
for the gap between cards and in toolbars; 12 px for card padding and between columns; 16 px for the screen gutter at
every width and for panel padding; 24 px between sections (with no divider line); 32 px and 48 px for an empty state's
padding, narrow and wide.

### 3.3 Radius

From `--af-radius`, read as `--r` with the fallback `0.625rem`: small, `max(0px, calc(var(--r) - 4px))`, for data
chips, checkboxes and menu items; medium, `max(0px, calc(var(--r) - 2px))`, for buttons, inputs and cards; large,
`var(--r)`, for panels; extra, `calc(var(--r) + 4px)`, for dialogs; full, `999px`, for status pills, filter chips,
avatars and bars.

### 3.4 Elevation

Four levels, in the block above: `--elev-1` a card at rest, `--elev-2` a card on hover, `--elev-3` a lifted card and a
toast, `--elev-4` an overlay panel. Every raised thing keeps its 1 px `--line` border, since a shadow alone barely
shows in dark mode, which also lifts raised things onto `--raised`. Z-order: sticky heads 1, an overlay panel
10, a drag overlay 20. The kit's overlays are in the top layer and need no z-index.

### 3.5 Type

| Size, line height | Weight | Use |
|---|---|---|
| 11 px, 16 px | 600 | data chips, status pills, counts |
| 12 px, 18 px | 400 to 500 | meta, field labels, table headers, help text |
| 13 px, 20 px | 400, titles 600 | rows, list items, menu items |
| 14 px, 22 px | 400, buttons 500 | dialogs, buttons, inputs, toasts |
| 16 px, 24 px and 20 px, 28 px | 600 | screen, card and dialog titles |

Weights 400, 500 and 600 only. Line height never below 1.35 on text that may be Vietnamese, with
`padding-block: 1px` on a single-line ellipsis: stacked marks (Ữ, Ế, Ộ) rise above the cap height, and
`overflow: hidden` clips them. Sentence case everywhere, table headers included, and no uppercase labels, which are
tall and hard to read in Vietnamese. `tabular-nums` on every count, ratio, date and size; no monospace for data.

### 3.6 Colour roles

Text takes an `-ink` mix and fills take a `-soft` one. Raw `--danger`, `--warn` and `--ok` are for icons and bars
only: as 12 px text on white they measure about 4.3, 3.0 and 4.0 to 1, while the `-ink` mixes reach about 6 to 1 in
both themes. `--faint` never colours text (about 3 to 1); placeholders use `--muted`. **Status and priority never use
`--accent`:** on a red brand the accent is red, and "in progress" would read as overdue. Check every screen with the
primary colour set to a red. Every status pairs its colour with a glyph and a word, so colour is never the only cue.

### 3.7 Icons

SVG in `currentColor`, never emoji: emoji ignore `currentColor` and dark mode and sit off the baseline. 16 px in
buttons, toolbars and field rows, 14 px in meta, 12 px in chips. Every icon is `aria-hidden`; an icon-only button has
an `aria-label` and an `af-tooltip` with the same words, wrapped as section 7 says for a control. lucide, AgentFlow's
own set (`lucide-react`, stroke 2), is recommended, not required; the starter draws its own in `src/module/icons.tsx`.

### 3.8 Motion

Use the duration and easing tokens of the block; leaving takes 0.7 of the entering time. A press has no transition:
the `:active` look applies at once and only the release eases. Animate `transform` and `opacity` only, plus
`grid-template-rows` for a fold, so nothing reflows mid-animation. Respect reduced motion with this block:

```css
@media (prefers-reduced-motion: reduce) {
  .my-app { --dur-2: 0ms; --dur-3: 0ms; --dur-4: 0ms; }
  .my-app *, .my-app *::before, .my-app *::after { animation-duration: 0ms !important; scroll-behavior: auto !important; }
}
```

## 4. Layout

**The frame has two shapes.** A page that scrolls as a whole lets its root grow (`min-height: 100%`, as the
starter's `.cases` does). A screen with a fixed header and panels fills its host and owns its scroller (Projects).
Either way the root is the size container, and each screen has one vertical scroller. The second shape's skeleton:

```css
:host { display: block; position: relative; }
.my-app { position: absolute; inset: 0; overflow: hidden; }
.app { display: grid; grid-template-rows: auto auto minmax(0, 1fr); height: 100%; } /* header, banners, body */
.body { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; min-height: 0; }
.screen { min-height: 0; overflow: auto; padding: 16px; } /* main.screen: the one vertical scroller */
```

**The header** has a stable height (56 px in the second shape) that never changes with state, `--surface` with a
hairline below, the title on the left at 16 or 20 px and 600, and the primary action on the right
(`af-button primary`, an icon and its label, never wrapping). Banners never go inside it.

**Content widths:** a list or reading page at most 960 to 1040 px, centred (the starter's `.screen` is 960 px); a grid
of cards at most 1320 px, `repeat(auto-fill, minmax(280px, 1fr))`; a board or a wide table full width; a side panel
`clamp(400px, 36cqi, 560px)`; dialogs keep the kit's own width (`min(480px, 100vw - 32px)`), never set by a module.

**Breakpoints,** as container queries in range syntax on the root:

| Name | Module width | What changes |
|---|---|---|
| wide | 1200 px and up | a side panel pushes the content; every column shows |
| medium | 720 to 1199 px | a side panel overlays; secondary columns fold into the title cell |
| narrow | below 720 px | rows stack; a side panel is full width; nothing may break |

A small screen may need only one breakpoint: the starter folds its table below 560 px.

**A side panel** pushes at wide (a grid column, no shadow) and overlays below wide at `--elev-4` with **no scrim**. It
is non-modal, so the page behind stays usable: Escape and its close button close it, and a click on another item
swaps what it shows. Its head is sticky and 48 px high.

```css
.side { width: clamp(400px, 36cqi, 560px); border-inline-start: 1px solid var(--line); background: var(--raised); overflow: auto; }
@container my-app (width < 1200px) { .side { position: absolute; inset-block: 0; inset-inline-end: 0; z-index: 10; box-shadow: var(--elev-4); } }
@container my-app (width < 720px) { .side { width: 100%; border-inline-start: 0; } }
```

For a full worked layout with a board and a panel, read Projects' board, `examples/projects/src/board/Board.tsx`.

## 5. Components

**Every interactive control meets this table.**

| State | Treatment |
|---|---|
| hover | `--hover`, over `--dur-1`; a card adds the border step and `--elev-2`. Never a recoloured title alone |
| focus-visible | `outline: 2px solid var(--focus); outline-offset: 2px` (`-2px` inside scrollers) |
| active | `--press`, at once |
| selected | `--selected` plus `box-shadow: inset 3px 0 0 var(--accent)` |
| locked | `aria-disabled="true"`, never `disabled`, so it keeps focus and its tooltip; opacity .55, `cursor: not-allowed`, no hover |
| in flight | `aria-busy`, locked by an in-flight flag set in the same tick; after 400 ms a 14 px spinner inside the control, at its width |
| error | the value returns to the server's; a toast with the reason; one flash (section 6) |

**Kit classes first,** inside an element with the class `af-kit`, which declares the tokens they read: `af-button`
with `primary`, `secondary`, `danger` (deletes only) or `ghost`, and `sm` (28 px) or `icon` (32 px square; `icon sm`
is 24 px); `af-avatar` with `sm` (20 px) or `lg` (32 px) and a `data-hue` from 0 to 7 chosen from the person's id, so
it survives a rename; `af-tabs` and `af-tabs segmented`; `af-banner` with `info`, `warning` or `danger`;
`af-skeleton`.

**Pills mean state; data chips mean data.** A pill has the full radius, is 20 px high, 11 px at 600, and never wraps;
a data chip has the small radius. The two shapes never share a meaning. Use `.pill` for a status and `.tag` for data.
`af-chip` has the pill's full radius, so a module never uses it for data, never beside `.pill`, and never without a
tone (`neutral`, `success`, `warning`, `info` or `danger`): untoned, its fill is a tint of the primary colour.

```css
.pill { display: inline-flex; align-items: center; gap: 2px; height: 20px; padding: 0 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; line-height: 16px; white-space: nowrap; }
.pill[data-status='todo'] { background: var(--neutral-soft); color: var(--muted); }
.pill[data-status='doing'] { background: var(--info-soft); color: var(--info-ink); }
.pill[data-status='done'] { background: var(--ok-soft); color: var(--ok-ink); }
.pill[data-status='cancelled'] { color: var(--muted); box-shadow: inset 0 0 0 1px var(--line-strong); }
.tag { display: inline-flex; align-items: center; gap: 2px; height: 20px; max-width: 140px; padding: 1px 6px;
  border-radius: max(0px, calc(var(--r) - 4px)); font-size: 11px; font-weight: 600; line-height: 16px;
  background: var(--neutral-soft); color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tag[data-tone='danger'] { background: var(--danger-soft); color: var(--danger-ink); }
.tag[data-tone='info'] { background: var(--info-soft); color: var(--info-ink); }
```

**Cards and list rows.** The title is a button stretched over the item
(`::after { content: ""; position: absolute; inset: 0; }`), so a click anywhere opens it; other controls sit above it
(`position: relative; z-index: 1`). The item's ring comes from `:has(:focus-visible)` on the item, not from the
invisible `::after`. Rows are 40 px (52 px when two lines). A table sits in a panel (`--surface`, a `--line` border,
the large radius, `overflow: clip`), with a header row 32 to 36 px high at 12 px and 500 in `--muted`, `scope="col"`
on each header, and a visually hidden `<caption>`. Patterns: the starter's table in `src/module/CasesScreen.tsx`, and
Projects' card in `examples/projects/src/board/TaskCard.tsx`.

**Filter chips** are toggles with `aria-pressed`: 28 px, the full radius, `0 12px` of padding, 12 px at 500, a
`--line-strong` border. Pressed, a chip takes `--accent-soft`, an `--accent` border, `--ink`, and a 12 px check
first, so "on" never rests on colour alone. Pattern: `examples/projects/src/shared/FilterChip.tsx`.

**Empty, loading and error.** Empty is centred with 48 px of padding (32 px narrow): a 32 px `--faint` icon, a title
at 14 px and 600, one optional `--muted` line, and at most one action. Loading is `af-skeleton` blocks shaped like
the real layout, shown after 150 ms (`opacity: 0; animation: appear 0s 150ms both` with
`@keyframes appear { to { opacity: 1; } }`) so a quick read never flashes, with `aria-busy` and a visually hidden
`role="status"` text, and nothing shifts when the data arrives. Error is the empty layout with an alert icon in
`--danger`, the server's reason (or a plain fallback) and Try again (`af-button secondary`), with `role="alert"`. The
starter's `src/module/CasesScreen.tsx` has all three.

**Toasts.** One `af-toast` per module. Toast a result the screen does not show: a refused write with the server's
reason, a create that left the view, a delete. Never toast what the screen already shows, such as a field edit, a
reorder or a claim. Success and info close after 4 s, an error after 8 s, and an error with an action stays.

**Strips.** Read-only and offline states are full-width strips under the header (radius 0, a `--line` border below,
`8px 16px` of padding, 12 px, `role="status"`), never inside the header and never moving it: read-only on
`--warn-soft`, offline on `--neutral-soft`. `af-banner` is for a message inside content, such as a form's refusal
that names no field.

**Forms in a dialog** have visible labels and ordinary bordered 40 px inputs. A field's error sits under it in
`--danger-ink` at 12 px; a reason that names no field goes in an `af-banner danger` at the top. The submit locks on
the first press, and the dialog closes only on success, so nothing typed is lost. Pattern:
`src/module/NewCaseDialog.tsx`.

## 6. Interaction

**Optimistic writes.** Change what is on screen first and keep a snapshot; send; on failure restore the snapshot,
flash the element once and toast the server's reason verbatim. On a conflict (409), reload and show the server's
values with an info toast and no flash, because it is not the person's mistake.

```css
[data-rolled-back] { animation: rolled-back 1.2s var(--ease-out) 1; } /* remove the attribute on animationend */
@keyframes rolled-back { from { box-shadow: 0 0 0 2px var(--danger); } to { box-shadow: 0 0 0 2px transparent; } }
```

Under reduced motion the ring holds for 1.2 s with no fade: the block in section 3.8 stops the animation, so set the
ring and clear it from a timer instead.

**Inline editing.** A ghost input in the text's own font, size and padding, so nothing moves. Enter or blur commits;
Escape restores and leaves; a blank value restores the old one and writes nothing. Long text saves on blur and after
1.5 s idle, never on every keystroke. A field in flight stays editable, and a second commit waits for the first.

**Confirmations only before what cannot be undone.** The button names the act, never OK or Confirm. The dismiss word
must not be the act's verb: beside "Cancel case" a dismiss reading "Cancel" means the opposite, so it reads "Go back"
in English and "Quay lại" in Vietnamese, passed to `af-confirm` through `strings`. `danger` is for a delete only.
`af-confirm` keeps Confirm locked after a press until `busy` goes from true to false.

**Escape closes the innermost layer first:** an open kit overlay, then an inline edit, then a side panel. A handler on
the shadow root ignores an event that is `defaultPrevented`, or whose `composedPath()` holds an open kit overlay
(`data-raised="true"` on the element, or an `af-dialog` or `af-confirm` whose `open` is true). One exception: a
closed `af-person-picker` marks every Escape as handled although it does nothing with it, so a plain
`defaultPrevented` test would keep a panel open while the picker has focus; ignore the mark when the event's first
target is a combobox that is not expanded. Pattern: `examples/projects/src/shared/focus.ts`.

**Focus.** Opening a panel moves focus to its heading (`tabindex="-1"`, focused with `preventScroll`); closing it moves
focus back to what opened it, or else to a stable fallback (the list's heading, then `main`). The kit's dialogs move
focus in and back themselves; to start on a field, focus it after the dialog opens, as the starter's `NewCaseDialog`
does.

**A press that feels instant:** `:active` with no transition; lock with an in-flight flag in the same tick, not with
framework state, which lands a render later; write locally first; no spinner before 400 ms; navigate first, then fetch.

**Drag and drop, only if the screen needs it.** It must work from the keyboard (Space or Enter lifts, the arrows
move, Space or Enter drops, Escape cancels), show a refusal on the target before the drop (a lock and the reason),
and announce each step in both languages; dnd-kit's `document` listener is the accepted one in section 2. Worked
example: `examples/projects/src/board/Board.tsx`.

## 7. Content

**Review every screen in both of AgentFlow's languages.** Vietnamese runs about 30% longer than English, and
AgentFlow may hand any module `vi`. Nothing that holds text has a fixed width; buttons pad `0 12px` and do not wrap;
toolbars and filter rows wrap.

**Truncation:** one line with an ellipsis, or a two-line clamp, with the full text in one `af-tooltip` and never a
native `title` as well, which would show a second tooltip. Never truncate status words, button labels, refusal reasons
or field labels: they wrap. Mount each `af-tooltip` lazily, never one
per row up front: on a non-interactive value, mount it the first time a pointer comes over it; on a control, use
Projects' `Tooltip` (`examples/projects/src/kit/elements.tsx`), which also arms on focus. a list of 1,000 rows would otherwise mount thousands of shadow roots. Patterns: the starter's
`LazyTooltip` in `src/module/kit.tsx` for text and marks; to wrap a control, Projects' `Tooltip` in
`examples/projects/src/kit/elements.tsx`, which keeps the control's nodes and replays the pointer's arrival.
`LazyTooltip` rebuilds its children when it arms, so it never wraps focusable content (a control, a link, anything
with `tabIndex`): focus inside it would drop. `af-tooltip` cannot describe what is slotted into it, so its text never
reaches a screen reader: a value shown shorter than it is (a date as Today, or without its year) carries its full form
as visually hidden text beside it, in the module's own tree. Text cut by an ellipsis is still whole in the page. A
tooltip on a non-interactive value only adds detail the visible text already implies (text cut by an ellipsis implies the rest, and stays whole in the
page for a screen reader); give the full form as visually
hidden text too, and never make the anchor focusable for its tooltip. What a person needs to act on is visible, or on
a control.

**Dates.** A timestamp shows in the viewer's time zone. A day (`yyyy-mm-dd`) is a calendar day: parse it as UTC and
format it with `timeZone: 'UTC'`, so it never moves. Format through `Intl.DateTimeFormat` as `af-date` does, so a
module's dates and its date picker agree: Vietnamese (`vi` or `vi-…`) with `vi-VN` and
`{ day: '2-digit', month: '2-digit', year: 'numeric' }`, giving 24/10/2026; anything else with `en-GB` and
`{ day: 'numeric', month: 'short', year: 'numeric' }`, giving 24 Oct 2026. In the current year leave the year out by
dropping the year and the separator before it from `formatToParts`, not by leaving `year` out of the options:
Vietnamese day and month alone format with a hyphen (02-10). Use relative words for at most yesterday, today and
tomorrow (Hôm qua, Hôm nay, Ngày mai), because "in 5 days" makes people count. Every date is a `<time dateTime>`, and
one shown relative or without its year carries its full form (`dateStyle: 'full'`) in an `af-tooltip` and as visually
hidden text. A date with a time uses the 24-hour clock. Projects writes day and month in figures in both languages,
which is one organization's choice (`examples/projects/src/model/dates.ts`); a module follows `af-date` unless its
owner decides otherwise. Pattern: `formatDay` in `src/module/CasesScreen.tsx`.

**Numbers** go through `Intl.NumberFormat(context.locale)`: 1,200 in English, 1.200 in Vietnamese. A ratio has no
spaces (2 of 5 is written 2/5). A count follows its name, in `--muted`. Zero shows as 0.

**People.** Initials are the first letters of the first and last words (one word: its first two letters), taken after
NFC normalisation and split into graphemes with `Intl.Segmenter`, then upper-cased in the locale, so a decomposed
name keeps Đ, Ư and Ơ whole. The avatar's hue comes from the id (`data-hue` on `af-avatar`). Avatars are 20, 24 and
32 px; a stack shows at most 3, then "+n", with a tooltip naming everyone.

**Voice.** Sentence case and no exclamation marks. A refusal names who may act ("Only the case's owner can close
it"), never just "Not allowed". Show the server's reason verbatim, with a leading code stripped. Keep both languages
in one file, `src/module/text.ts`, so a string cannot exist in one and not the other.

## 8. Accessibility

**Contrast,** measured in both themes on the real page:

| What | Target | Met by |
|---|---|---|
| text, and text on tints | 4.5 to 1 | `--ink`, `--muted`, an `-ink` on its `-soft` |
| large text (24 px, or 18.7 px at 600) | 3 to 1 | the same |
| input borders, rings, checkboxes, state glyphs | 3 to 1 against their neighbours | `--line-strong` (about 3.4 to 1), solid `--focus` |
| decorative borders | none | `--line` |
| locked controls | exempt, but never below .55 opacity | |

**The focus ring** is solid `--af-primary` (the block's `--focus`), 2 px, offset 2 px (`-2px` inside a scroller), drawn
through `:focus-visible` only. Never `--af-ring`: it is the primary at 40% alpha, about 1.6 to 1 on white, below the
3 to 1 a focus indicator needs. Never remove a ring without a replacement.

**Hit sizes:** 32 px; 24 px, with at least 4 px between them, only in dense rows. A small mark (a 20 px tick, a 16 px
box) is drawn inside a 32 px hit area (`::before { inset: -6px }`). `sm` buttons only inside rows and cards.

**Locked controls.** `aria-disabled="true"` keeps the control focusable, so its reason can be reached, and its press
handler returns early. The reason is a visually hidden `<span id="…">` beside the control, which its
`aria-describedby` names, plus an `af-tooltip` for sight: `af-tooltip` cannot describe what is slotted into it,
because an id reference does not cross a shadow boundary. The rule, from the starter's `src/module/styles.css`:

```css
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%);
  white-space: nowrap; border: 0; }
```

**Kit inputs** (`af-date`, `af-person-picker`, `af-rich-editor`) are named with their `label`, because a
`<label for>` cannot point into a shadow root. Native inputs in the module's own tree use `<label for>` as usual.

**Semantics.** A list's children are list items. Tables have a caption and `scope="col"`. Regions are
`<section aria-labelledby>`. A side panel is `<aside role="dialog" aria-modal="false" aria-labelledby>`. A fold is
`<details>` and `<summary>`.

**One live region, the toast's.** `af-toast` mirrors each toast into always-present `role="status"` and
`role="alert"` regions, so add no second one, and do not announce a live refresh, which would be noise. For a board's
ARIA and its drag announcements in both languages, read `examples/projects/src/board/Board.tsx`.

## 9. Testing a module

**Shim what jsdom lacks.** Every module test that renders kit elements starts with these lines, from
`test/module/cases-screen.test.tsx`:

```ts
// What jsdom lacks and the kit's elements use.
class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;
HTMLElement.prototype.showPopover ??= function (this: HTMLElement) { this.dataset.shown = 'true'; };
HTMLElement.prototype.hidePopover ??= function (this: HTMLElement) { this.dataset.shown = 'false'; };
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
```

**Test screens over an in-memory API.** Put the screen's data behind one interface (`src/module/cases-api.ts`), with
an HTTP implementation and an in-memory one (`src/module/memory-cases-api.ts`), and render the screen over the
in-memory one (`test/module/cases-screen.test.tsx`).

**Keep the styles test,** `test/module/styles.test.ts`. It refuses a selector on `:root`, `html` or `body`; a custom
property or a colour literal outside the root and its dark rule; a token read without a fallback;
`prefers-color-scheme`; a viewport unit; and a width `@media`. It finds the root as the class that declares the size
container, so renaming the root needs no edit.

**Keep the UI build test,** `test/module/ui-build.test.ts`. It builds with the builder's `buildUi`, as
`agentflow-app build` does, and `buildUi` itself refuses an `index.js` whose last statement is not `export { mount };`
(`UI_ENTRY_INVALID`). The test then checks for one `index.js` with every other script under `chunks/`, no `.css`
beside it, no bare import of React, the kit or the SDK, no `process.env.NODE_ENV` left, and no development JSX runtime.

**Test the host's changes** (mounting through a host, a theme and a language change in place) as Projects does in
`examples/projects/test/module-host.test.tsx`.

**Look at it.** `pnpm demo` serves the module over its in-memory data at `module.html`, with `?empty` (no data) and
`?fail` (the next create fails). It follows the browser's language and colour scheme. To review on a red primary,
pass `applyTheme` a palette whose `--af-primary` is a red, such as `oklch(0.55 0.2 25)`, in `src/module/demo.tsx`.
Every kit element, in both themes and both languages, is in the gallery, whose source is
`packages/agentflow-elements/gallery/main.ts` in the SDK repository.

## 10. Review checklist

Answer each question in English and in Vietnamese, in the light and the dark theme, at 1280 px and at 800 px of module width, and once with a red primary colour, as AgentFlow's crimson brand gives. Every answer must be yes.

1. Is every colour a token from the root's block, a `color-mix` of tokens, or a module-owned hue declared there, with no other hex, `rgb()` or `oklch()` literal?
2. Does coloured text use an `-ink` mix, with the raw status hues only on icons and bars?
3. Do status and priority avoid `--accent`, so the screen still reads when the primary colour is red?
4. Are spacing, radius, type and duration all from the scales in Foundations?
5. Does the module put one `<style>` in its shadow root, the kit's CSS first, with no selector on `:root`, `html` or `body` and no custom property on `:host`?
6. Are responsive rules `@container` queries only, with no width `@media`, no viewport unit and no window size?
7. Does the module's own code add no listener on `document` or `window`?
8. Does every id come from one `GET /app/objects` per mount, and every address the browser opens itself from `host.apiUrl`?
9. Does a change of language or theme re-render in place, keeping an open dialog and what is typed in it?
10. Does every interactive element have hover, focus-visible, active and locked states?
11. Is every focus ring 2 px, solid, in the primary colour, unclipped, and drawn on the card rather than on a stretched `::after`?
12. Is every control at least 32 px, or 24 px with 4 px between them in a dense row?
13. Is every locked control `aria-disabled`, with its reason in a tooltip and in hidden text that its `aria-describedby` names?
14. Does truncated text carry its full text in one `af-tooltip`, while status words, buttons and reasons wrap instead?
15. Does Vietnamese fit, with no clipped diacritics (line height at least 1.35) and no fixed-width box around text?
16. Are the icons SVG in `currentColor` at 16, 14 or 12 px with `aria-hidden`, and is there no emoji?
17. Are dates formatted through `Intl` as `af-date` formats them, relative only for the day before, of or after today, each a `<time dateTime>` with its full date in a tooltip?
18. Do numbers go through `Intl.NumberFormat`, with `tabular-nums`?
19. Does every change made in place show its result before the server answers, and roll back with the flash and the server's reason?
20. Does a confirmation come only before what cannot be undone, with the act's name on its button and a dismiss word that is not the act's verb?
21. Does loading show a skeleton shaped like the layout after 150 ms, and do empty states give an icon, a title and at most one action, and errors the reason and Try again?
22. Is all motion `transform` and `opacity`, with reduced motion respected, and does dark mode keep visible surface steps, borders beside shadows and legible tints?
23. Is every `af-tooltip` on a non-interactive value mounted on first pointer arrival, and does it only add detail the visible text implies, with the full form also visually hidden text?
