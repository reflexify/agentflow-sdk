# Designing an AgentFlow UI module

For teams, and their coding agents, who write the UI module of an AgentFlow app. It ships with the UI kit at the same
version, as `node_modules/@reflexify/agentflow-elements/DESIGN.md`, so the copy beside your kit is the one that applies.
A rule says "must" or "never" and gives its reason; the rest is the default. Read section 2 and section 10 first: they
are what a review checks. Each element's properties, events and parts are in the kit README,
[The UI kit](README.md#the-ui-kit).

## 0. Before you start

**A module is an ES module whose named export `mount(root, host)` renders into `root` and returns the function that
unmounts it.** `root` is inside a shadow root (`root.getRootNode()`), and `host` is an `AppHost` of contract version 5
(`APP_CONTRACT_VERSION` in `@reflexify/agentflow-sdk`). AgentFlow gives every module that host, whichever `ui.contract`
the package declares. `host.assistant` is present only when the person has the assistant, so call it as
`host.assistant?.setContext(…)` (a list of items, and `host.assistant?.open?.(…)` where the host has `open`), and
`host.signing` is absent unless AgentFlow offers it, so call it as `host.signing?.sign(…)`. Declaring `ui.contract: 3`
or `4` is what makes an AgentFlow that predates that contract refuse the package, and a module that calls neither
`host.signing` nor the assistant's list and `open` can declare 2. Only plain data and functions cross between the
two, so the module bundles its own framework.

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

**The worked example.** The starter's module: one list screen and one create dialog, in `src/module/` of a project
`agentflow-app init` made (`examples/case-desk` in the SDK repository). A path such as `src/module/mount.tsx` is in
your own project.

## 1. Principles

1. **Native to AgentFlow.** The module sits beside AgentFlow's sidebar and should read as one of its pages: the font
   through `--af-font-sans`, 13 px rows, 11 px chips, 16 px icons, neutral surfaces, and the brand colour only for
   primary actions, selection and focus. No colour is a literal unless the module owns it, so a customer's brand
   restyles the module with no change to its code. The kit's classes and elements are AgentFlow's own look: each is
   drawn to compute the same styles as the AgentFlow component it stands for, in every brand and both themes, so the
   way to read as one of its pages is to use them, not to copy what they look like.
2. **Calm.** At rest a screen shows content, not chrome. Borders are hairlines, a shadow means "raised" and nothing
   else, and colour carries meaning (overdue, refused, a status), never decoration.
3. **Dense but readable.** People scan forty rows, not four, so rows are 40 px and nothing is smaller than 11 px,
   avatar initials aside. Vietnamese diacritics always get their line height.
4. **Fast, and seen to be fast.** A press answers in the same frame (`:active`), and a write shows its result before
   the server replies. A skeleton waits 150 ms and a spinner 400 ms, so a quick answer never flashes either.
5. **Locked, not hidden.** A control the person may not use stays where it is, looks inert and says why: one that
   vanishes teaches nothing, and the layout jumps when it returns. A control the host cannot offer at all, because the
   capability is absent (a button for `host.assistant.open` on a host that has none), falls outside this rule: there is
   nothing to lock, so leave it out. So does an action the person's access never gives them, as AgentFlow's record page
   draws no Delete for someone without `delete` and no move for someone who may not change the record. What is locked
   is what the person may do in general but this record, now, refuses: a move a rule blocks stays, inert, with the
   rule's message, as AgentFlow's move control shows it.
6. **One way to do each thing:** one card, one data-chip shape, one status-pill shape, one focus ring for the module's
   own controls (a kit control keeps the kit's, section 8) and one toast region. Two looks for one meaning make people wonder what the difference is.

## 2. Module rules

A module's own code follows these in both hosts. Each exists because breaking it failed somewhere.

1. **One `<style>` in the shadow root: `KIT_CSS` first, then the module's CSS.** Prepend it to the shadow root on
   mount and remove it on unmount. Import the CSS with Vite's `?inline`, so it lives in the script: the loader imports
   only the entry, and a `.css` file beside `index.js` would never load. Pattern: `mountCases` in
   `src/module/mount.tsx`.
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
   toast-group hotkey (inert); Svelte 5's delegated dispatcher; the signature pad's pointer tracking while a stroke is
   held (it acts on no key); and dnd-kit's keyboard and pointer sensors during a drag. The last has a cost: the module's own Escape handler runs before dnd-kit's, so ask whether a drag is in progress
   before closing anything on Escape. `af-dialog` also adds one `pointerdown` listener on its document while it is open,
   and `af-form` one `beforeunload` listener on `window` while its `dirty` is set.
6. **Keys, resolved through the SDK's objects cache.** `getAppObjects(client)` (and `host.api.GET('/app/objects')`) turns the logical keys the package
   ships with (`entity:case`) into this organization's ids, with the installation's parameters, in every host. Ask in
   `mount`, or in an API object made once per mount, never in an effect, which React's StrictMode runs twice in
   development. Ask again after a failed read, so Try again recovers. When a key the screen needs is missing, show a
   notice that names the missing key or the package instead of the screen. Never hard-code an id. Pattern:
   `src/module/http-cases-api.ts`.
7. **`host.apiUrl(path)` for anything the browser fetches itself**, such as a download link or an `<img src>`. The
   API's address differs between the hosts, and the typed client cannot make such a URL. A link to one of AgentFlow's
   own pages is not an API address: inside AgentFlow it is a path from the root (`/entities/<id>/records/<id>`), and
   elsewhere it needs AgentFlow's address, which the site passes in.
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
    `'label' in el`, `'range' in el` or `typeof el.show === 'function'` on an element you made, never whether the tag is
    defined, which your own import makes true; `customElements.get('af-date').kitVersion` names the copy.
12. **Bundle everything.** The Vite library build has one ES entry, `index.js`, ending `export { mount };`, with its
    chunks under `chunks/`, `process.env.NODE_ENV` defined, and React, the kit and the SDK bundled. Ship only the
    extensions AgentFlow serves under `ui/`: `.js`, `.mjs`, `.css`, `.json`, `.map`, `.svg`, `.png`, `.jpg`, `.webp`
    and `.woff2`, never HTML. Pattern: `vite.module.config.ts`.

## 3. Foundations

### 3.1 Tokens

The thirty-four `--af-*` tokens (`AF_TOKENS`) are the whole theming contract. Twelve of them are the chart palette
(`--af-chart-1` to `--af-chart-8`, `--af-chart-other`, `--af-chart-hatch`, `--af-chart-grid`, `--af-chart-axis`),
which colours a series by its identity and is the same under every brand. Eight are the surfaces AgentFlow's own
controls use (`--af-secondary` and `--af-secondary-fg`, `--af-accent` and `--af-accent-fg`, `--af-muted`, `--af-input`,
`--af-popover` and `--af-popover-fg`); the kit's classes and elements read them, and a module that needs the same
surface (a field's border, a menu's ground) reads them too, with their `AF_DEFAULT_PALETTE` values as fallbacks. A
palette of your own may leave them out. The host sets the tokens, with `data-theme` and
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
starter's `.cases` does). A screen with a fixed header and panels fills its host and owns its scroller.
Either way the root is the size container, and each screen has one vertical scroller. In the second shape that
scroller is an `af-scroll-area` around the screen. The skeleton:

```css
:host { display: block; position: relative; }
.my-app { position: absolute; inset: 0; overflow: hidden; }
.app { display: grid; grid-template-rows: auto auto minmax(0, 1fr); height: 100%; } /* header, banners, body */
.body { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: minmax(0, 1fr); min-height: 0; } /* the one row is as tall as the body */
.screen { padding: 16px; } /* <af-scroll-area label="Cases"><main class="screen">…</main></af-scroll-area>: the one vertical scroller */
```

The body's row is `minmax(0, 1fr)` on purpose: a grid's implicit row is `auto`, which grows to the tallest content in it
(the side panel's, say), so the `af-scroll-area` beside it would be as tall as that and nothing would scroll.

**What scrolls inside a module scrolls through `af-scroll-area`, and a pane's own area, never the pane.** In the first
shape AgentFlow's page does the scrolling and the module has none of its own; whatever a module scrolls itself goes in
one. Every kit scrollbar is one scroller, drawn as AgentFlow's `ScrollArea` is over the browser's own scrolling, so the
wheel, touch, the keys, find in page and `position: sticky` all behave as on a native scroller. A long list in a panel,
a table wider than its box, a column of cards and a splitter's pane scroll in an `af-scroll-area` the module puts around
the content, and the module's own CSS has no `overflow: auto` or `overflow: scroll`: a plain one draws the browser's
scrollbar among AgentFlow's. The box that holds the area gives it a height (a `height` or a `max-height`, a flex column,
or a grid track written `minmax(0, 1fr)`). A pane, a card or a column that scrolls is a box of that kind with the area
inside it, so the pane keeps its size and the area is what scrolls. A virtualised list, auto-scroll and a restored
scroll position use the area's `viewport`, and a `scroll` listener goes on the `viewport`, not on the element.
`overflow: hidden` and `overflow: clip` stay for clipping a corner.

**Tabs for the sections of a screen, a splitter for a list beside its detail.** The sections of one record or one
screen (overview, activity, files) are `af-tabs`, each section a panel slotted by its tab's value, so a panel keeps its
state while another shows; the tab changes only when the page sets `value` back from `tab-change`. A list beside the
detail it opens is an `af-splitter`, the list slotted as `start` and the detail as `end`, each in an `af-scroll-area` of
its own, because a pane does not scroll. Keep the `size` the person chose if it should outlast the visit, and set `size`
from `size-change`, which is raised when a drag ends; never set it while a drag is live, which moves the panes off the
pointer. `orientation="vertical"` stacks the panes for the narrow breakpoint.

**The header** has a stable height (56 px in the second shape) that never changes with state, `--surface` with a
hairline below, the title on the left at 16 or 20 px and 600, and the primary action on the right
(`af-button primary`, an icon and its label, never wrapping). Banners never go inside it.

**Content widths:** a list or reading page at most 960 to 1040 px, centred (the starter's `.screen` is 960 px); a grid
of cards at most 1320 px, `repeat(auto-fill, minmax(280px, 1fr))`; a board or a wide table full width; a side panel
`clamp(400px, 36cqi, 560px)`; dialogs keep the kit's own width (AgentFlow's: 512 px, or the viewport less 32 px below 640 px), never set by a module.

**Breakpoints,** as container queries in range syntax on the root:

| Name | Module width | What changes |
|---|---|---|
| wide | 1200 px and up | a side panel pushes the content; every column shows |
| medium | 720 to 1199 px | a side panel overlays; secondary columns fold into the title cell |
| narrow | below 720 px | rows stack; a side panel is full width; nothing may break |

A small screen may need only one breakpoint: the starter folds its table below 560 px.

**A side panel** pushes at wide (a grid column, no shadow) and overlays below wide at `--elev-4` with **no scrim**. It
is non-modal, so the page behind stays usable: Escape and its close button close it, and a click on another item
swaps what it shows. Its head is 48 px high and sits above the panel's own `af-scroll-area`, so it stays in view as the
body scrolls.

```css
.side { display: flex; flex-direction: column; width: clamp(400px, 36cqi, 560px);
  border-inline-start: 1px solid var(--line); background: var(--raised); }
.side > af-scroll-area { flex: 1 1 auto; }
@container my-app (width < 1200px) { .side { position: absolute; inset-block: 0; inset-inline-end: 0; z-index: 10; box-shadow: var(--elev-4); } }
@container my-app (width < 720px) { .side { width: 100%; border-inline-start: 0; } }
```

## 5. Components

**Every interactive control meets this table.**

| State | Treatment |
|---|---|
| hover | `--hover`, over `--dur-1`; a card adds the border step and `--elev-2`. Never a recoloured title alone |
| focus-visible | on a module's own control, `outline: 2px solid var(--focus); outline-offset: 2px` (`-2px` inside scrollers); a kit control keeps the kit's ring (section 8) |
| active | `--press`, at once |
| selected | `--selected` plus `box-shadow: inset 3px 0 0 var(--accent)` |
| locked | `aria-disabled="true"`, never `disabled`, so it keeps focus and its tooltip; opacity .55, `cursor: not-allowed`, no hover |
| in flight | `aria-busy`, locked by an in-flight flag set in the same tick; after 400 ms a 14 px spinner inside the control, at its width |
| error | the value returns to the server's; a toast with the reason; one flash (section 6) |

**Kit classes first,** inside an element with the class `af-kit`, which declares the tokens they read: `af-button`
(the outline button) with `primary`, `secondary`, `ghost`, `danger` (deletes only) or `link`, at 36 px, or `xs` (24 px),
`sm` (32 px) or `lg` (40 px), and `icon` for a square (36 px; `icon xs` 24, `icon sm` 32, `icon lg` 40);
`af-avatar` (32 px) with `sm` (24 px) or `lg` (40 px) and a `data-hue` from 0 to 7 chosen from the person's
id, so it survives a rename; `af-tabs`, `af-tabs line` and `af-tabs segmented`; `af-banner` with `info`, `success`,
`warning` or `danger`; `af-skeleton` with `row`, `card`, `column` or `block`; `af-progress`; `af-spinner`. The pieces of a record screen are
classes too: the state and piece classes `af-empty` (with `boxed` for a card), `af-error`, `af-file-chip`, `af-repeater`
(its row with `line` is a handle, the fields and a remove button in one grid row) and `af-drag-handle`; the table classes, below; the page structure classes `af-breadcrumb`, `af-disclosure`, `af-dl`,
`af-stat`, `af-timeline` and `af-steps`; the view classes `af-toolbar`, `af-card`, `af-board`, `af-list`, `af-list-row`,
`af-cal` and `af-event`; and the filter classes `af-filter-chip`, `af-search` and `af-facet`, with `af-chip` as a toggle
(`toggle`, `aria-pressed`) or a locked control (`aria-disabled`). The kit README gives the markup of each.

**Form controls are native elements with kit classes:** `af-input`, `af-textarea`, `af-checkbox`, `af-radio`,
`af-switch`, `af-label`, `af-toggle` and `af-segmented`, on a real `<input>`, `<textarea>`, `<label>` or `<button>`.
They stay native on purpose. A checkbox on every row of a table must cost one element, not a shadow root; `<label>`,
`required`, `FormData`, reset and server rendering then work as they do on any form, with nothing to wire; and a library's
checkbox, radio or switch would wrap a hidden native input of its own, adding layers and no behaviour. State is the
native attribute (`checked`, `disabled`, `aria-invalid="true"`, `aria-pressed`), never a class. A choice from a list
is not a native control with a class: it is `af-select` or `af-combobox` ("Forms and choices", below), and a file is
`af-file-upload`. The kit README's "Form controls" has the markup.

**Pills mean state; data chips mean data.** A pill has the full radius, is 20 px high, 11 px at 600, and never wraps;
a data chip has the small radius. The two shapes never share a meaning. Use `.pill` for a status and `.tag` for data.
`af-chip` has the pill's full radius, so a module never uses it for data, never beside `.pill`, and never without a
tone (`neutral`, `success`, `warning`, `info` or `danger`): untoned, it is AgentFlow's solid primary badge, and
`danger` is its solid destructive one.

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
invisible `::after`. Rows are 40 px (52 px when two lines). The kit's `af-card`, `af-list-row` and `af-board` draw
such cards, rows and columns when the screen is a record list.

**A table is native markup with the kit's classes.** `<table class="af-table">` draws the header row, the rows and their
states as AgentFlow's record table does: `aria-sort` on a `<th>`, `aria-selected` and `data-tone` on a `<tr>`, `compact`
for tighter cells, `check` and `num` cells. `af-table-sort` is a sortable header's button, `af-table-group` a `tbody`
under a group's header row, and `sticky`, in an `af-scroll-area` with `axis="both"`, keeps the header row, a group's header
and the first column in view. The classes only draw what the page sets: it sorts, selects, folds and pages, and it keeps
what they leave out, `scope="col"` on each header and a visually hidden `<caption>`. The kit README's "Tables" has the
markup. A module's table carries `af-table`, and may add a rule of its own on top, such as a marker on the first cell of
an urgent row, as the starter's table in `src/module/CasesScreen.tsx` does.

**A selection acts through `af-bulk-bar`.** When rows of a list or a table are selected, the actions on them go in the
bar raised over the page, not in a toolbar that moves the layout: `af-bulk-bar` with the page's own buttons as children,
each with `slot="actions"` and the classes `af-button ghost sm`, which take the bar's colours. The page keeps the
selection and sets `count` (with `total` when it knows it, or `label` for a selection that is not a count of rows, such
as every row of a filter); it answers `clear`, from the clear button and from Escape inside the bar, by emptying the
selection and setting `count` back to 0. List the actions in order of use, because the last ones that do not fit at the
module's width fold into the bar's "More actions" menu, and keep the same buttons from one render to the next, since the
bar measures them again whenever they change. The bar never takes focus when it appears and binds no key: the page binds
a shortcut (the kit README's example binds `Alt+Shift+A`) to the bar's `focus()`, which lands on the first enabled
action, in a handler on its shadow root and never on `document` (module rule 5). Escape follows the innermost-layer rule
of section 6: in the bar's open menu, or in a popover slotted into it, it closes that layer first. When an action ends
and the selection empties, the bar hides and focus that was in it falls to the page's body, so move it to the list's
heading or to the row that is left.

**A filter chip that turns a filter on and off is the kit's toggle chip**, `<button class="af-chip toggle"
aria-pressed>`, as AgentFlow's view preset bar draws it: 26 px tall (22 px with `compact`), the radius less 2 px, `0 10px`
of padding, 12 px at 500, no border, the muted text on nothing at rest and the primary at 8% with the primary text when
pressed. `aria-pressed` carries the state to assistive technology, so the look may rest on colour; a toggle whose words
alone do not say it is on (an icon, a count) gains a check of its own. A chip that says what a list is narrowed by, with
a remove button, is `af-filter-chip`. The kit README's "Filter classes" has the markup of both.

**Empty, loading and error.** Empty is `af-empty`: a centred column with a 28 px icon in the muted colour at half
strength, a title at 14 px and 500, one optional muted line at 12.5 px, and at most one action (`af-button sm`). For a
whole list or view that has nothing, `af-empty boxed` draws the same inside a dashed card with 48 px of padding, a 32 px
icon and the title 12 px under it, as AgentFlow's no-views card does; the plain column is for a panel or the foot of a
table. Loading is `af-skeleton` blocks shaped like
the real layout, shown after 150 ms (`opacity: 0; animation: appear 0s 150ms both` with
`@keyframes appear { to { opacity: 1; } }`) so a quick read never flashes, with `aria-busy` and a visually hidden
`role="status"` text, and nothing shifts when the data arrives. Error, for a screen, is `af-error` with `role="alert"`:
an alert icon in a 44 px round tile in the danger tone, a 16 px title, the server's reason (or a plain fallback) at
14 px, the actions (Try again as `af-button primary sm`, Reload page as `af-button sm`) and, when a trace helps support,
a native `<details>` of technical details whose trace sits in an `af-scroll-area`, as text and never markup. The
starter's `src/module/CasesScreen.tsx` has all three states, drawn with its own CSS, which is older than the classes.

**A list paged by cursor takes `af-pager`.** The SDK's `cursorList` keeps the state of a list the server pages with a
cursor: the cursors behind Previous, the next cursor, `busy` and `error`, with a stale call aborted and a late answer
dropped. The page binds that state to `af-pager` (`hasPrev`, `hasNext` and `busy` from the list, and the range when the
page knows it) and answers `prev` and `next` by calling the list; the pager never pages itself, and the module writes no
Previous and Next buttons of its own. A list that grows by a Load more button uses the pager's `more` mode (`hasMore`,
`shown`, with the rows the page has gathered), and `controls` naming the list with `focus-new` sends focus to the first
row that arrived. Set a new filter or page size with the list's `reset()`.

**A value that is Markdown is `af-markdown`.** A description, notes or a comment that is stored as Markdown is shown with
`af-markdown`, never by setting `innerHTML` from a parser of the module's own: the element is read-only, draws raw HTML as
its characters, opens a link in a new tab, and draws a mention token as a chip from the response's `mentions` map without
ever showing the target's id. A link the module routes itself (a record's page, a mention) is caught on its cancelable
`af-link` event. The same value is edited in `af-rich-editor`.

**A secondary task opens in the side panel, `af-dialog placement="end"`.** Editing a record's settings, a long form or a
set of filters is a task beside the page and not the page's own content, so it opens in the kit's side panel: the same
`<dialog>`, docked at the right edge, as tall as the viewport and `min(75vw, 384px)` wide, as AgentFlow's right Sheet is,
with the dialog's heading, body and `actions` footer, whose actions stack. It is modal like any `af-dialog`: the page
behind is inert, a click on the backdrop, Escape and the close button each ask to close it through `close`, and the page
sets `open` to false. A kit popup opened inside it, an `af-select` say, rises above it and takes the first Escape. The
module never sets its width. The side panel of section 4, which pushes the content and leaves the page usable, is the
other thing: use it for a detail the person keeps beside a list, and this one for something they should finish first.

**Toasts.** One `af-toast` per module. Toast a result the screen does not show: a refused write with the server's
reason, a create that left the view, a delete. Never toast what the screen already shows, such as a field edit, a
reorder or a claim. Success and info close after 4 s, an error after 8 s, and an error with an action stays. **A toast
raised while a modal `af-dialog` stays open is drawn above it but cannot be pressed**, its action and its close button
included, because the dialog makes everything outside it inert and the toast region is outside. So a refusal that keeps
a dialog open (a failed submit) goes in the dialog, as an `af-banner danger`, not in a toast with a Retry; a toast shown
once the dialog has closed works as any other.

**Strips.** Read-only and offline states are full-width strips under the header (radius 0, a `--line` border below,
`8px 16px` of padding, 12 px, `role="status"`), never inside the header and never moving it: read-only on
`--warn-soft`, offline on `--neutral-soft`. `af-banner` is for a message inside content, such as a form's refusal
that names no field.

**Forms in a dialog** have visible labels and ordinary bordered inputs, 36 px high as `af-input` is (32 px for `af-input sm`). A field's error sits under it in
`--danger-ink` at 12 px; a reason that names no field goes in an `af-banner danger` at the top. The submit locks on
the first press, and the dialog closes only on success, so nothing typed is lost. Pattern:
`src/module/NewCaseDialog.tsx`.

### Forms and choices

**Put every form control in an `af-field`.** It draws the label (12.5 px at 500), the help text above the control and
the error under it, as AgentFlow's forms do, and wires them to the control, so the module writes no CSS for them. A
native control gets a `<label for>`, an `aria-describedby` over the help and the error, `aria-invalid` and `required`.
A kit control gets `label`, `description`, `error`, `invalid`, `required` and `readonly` as its own properties,
because a `<label for>` cannot point into its shadow root, and a click on the label focuses it. A control that stands
alone, such as a filter in a toolbar, has no field to name it, so it carries its own `label`. Write the control as the
field's first child, with no wrapper: the field wires its first child, and a wrapper would be that child. Put `label`,
`required` and `error` on the field. It writes to a kit control only what it has and gives back only what it wrote, so
a `required` set on the control itself stands where the field has none. `locked-reason` is the locked control for a
field: it makes the control read-only and adds a lock whose tooltip gives the reason, which is also in the control's
description. `edited` on a field marks a value the person changed from a suggested one with a bar on its edge, the
same for any control, which it does not restyle. Group fields in an `af-fieldset` around a native `<fieldset>`, with
`columns` (one to four) and `data-span` to place them; the fieldset still disables every control inside it.

**A short list is `af-select`, a long or searched one `af-combobox`.** A list the person can scan, at most about 15
options, takes `af-select`: they pick by looking. A longer list, a list loaded from the server and a list people
search by name take `af-combobox`: they type to find. Both show a disabled option with its reason, are drawn in the
kit's look and submit by `name` in a form. A native `<select>` is not a third choice.

**A person, a group, a unit or a record is picked through a source the page owns.** People are `af-person-picker`, a
hierarchy such as the units is `af-tree-picker`, and groups and records are an `af-combobox`; none is a native `<select>`
holding the whole directory. Each takes a `source` (or, for a short fixed list, `people`, `options` or `nodes`; a set
`source` wins), and the page makes the source: the SDK's `directory.people(client)`, `directory.units(client)` and
`directory.groups(client)` are the three for the organization's directory, and a records source is the page's own, over
its own query. The tree picker asks for the whole forest when it opens and filters it itself, so a search shows each match
under its ancestors; archived units are left out of the list, and `resolve` still names one that a saved value holds.
Through an app's token the directory is what the package lists: a person or a unit whose name is not listed is shown by
their email or code, and the groups list is refused, so a group picker there offers the groups the installation names.

**A `source` is one stable function.** An `af-combobox`, `af-person-picker` or `af-tree-picker` over a `source` asks it as
the person types (the tree picker, when it opens) and aborts the previous call. A new function restarts the list and asks
afresh, so one written inline in a render asks on every render, and `directory.people(client)` called in a render is one.
Make it a module constant, or memoise it over the client for the page's lifetime, as the `mentions` source of
`af-rich-editor` is. Give it a `resolve(ids, signal)` whenever `value` can start non-empty, as an edit form's does: a
picker never looks an id up itself, so without `resolve` a saved value shows as unknown.

**A file is added through `af-file-upload`, and the page uploads it.** The element draws the drop zone and the rows and
keeps no file. It hands the page the `File`s of each drop or pick (`files-add`); the page adds an item with status
`uploading` for each, uploads it (the records API's attachment operation, for a File field) and sets the item to `done`
or `failed`; a row's remove button asks the page to take its item out (`remove`). So `items` is the page's state, every
`id` in it is unique, and a drop the field does not take (`accept`, `max-files`) is refused by the element with a notice,
not an event: set both to what the field holds, so the person hears it at the drop and not from a failed upload. A module
adds no listener on `document` (module rule 5), so a file dropped beside the zone is the browser's to open; the module can
stop a stray drop inside its own area with a `dragover` and `drop` listener on its shadow root. Give the zone a `label`
(or put it in an `af-field`, which sets one): the zone is a button, and its label is its name, with the text it shows read
as its description. A field that holds one file sets `replace`, so a pick while a file is held is handed to the page,
which swaps the items, instead of refused.

**A folder field is filled through `af-folder-source`, and the module writes no picker, upload or preview.** A
workflow's start-form field that takes a folder (the input contract's `folder`) gets one `af-folder-source`, given the
`workflow`, the `field`, that `folder` and `sources`, which is `folderSources(client)` made once for the page, as a
picker's `source` is. The element offers files, a folder from this computer or a watched folder, runs the upload and shows
what a launch would take, with every left-out reason and its count. The module keeps three things: the `value` of the last
`af-folder-change`, which is what the launch takes for the field; the set id from `af-folder-upload-started`, stored where
a reload finds it and passed back as `resume-set` so an interrupted upload continues; and a launch button that stays
locked while `value` is `null` or `preview.refusal` is set. Give it the width of the form's column: the drop zone, the list
and the preview fill it. It is not a form control, so put its heading in the `af-fieldset` or a plain label above it,
not an `af-field`.

**A signature is drawn in `af-signature-pad`, inside an `af-dialog`.** A pad needs room and the person's attention, so
the signing opens in a dialog whose actions hold Sign and Cancel, with Sign locked until the pad has a value. The page
keeps the last `change` and sends it when the person confirms; Clear and `clear()` empty the pad. The pad is white with
dark ink in both themes, and it is not recoloured, because a signature is stored data that other people see in their own
themes. The exported PNG is the ink alone on a transparent ground, so show a stored signature on a white or light surface. A page that reuses one pad for another record calls `clear()` before it sets the new `value`: the strokes stay
when `value` is set.

**Numbers and spans.** A quantity, an amount or a percentage is an `af-number-input`: it writes the number as
`Intl.NumberFormat` does for the language, keeps what the person types until they commit, and gives a percent as a
fraction (`0.15` shows as 15%); a percentage that is stored as itself (`12.5` for 12.5%) sets `unscaled`, and a number
with no fixed decimals sets `fractional` so what is typed is kept, where a whole step otherwise rounds to whole numbers.
A span between two dates that belong together is one `af-date range` with `start` and
`end`, either of which may be empty for an open end; two dates that mean different things (a start and a due date) are
two `af-date`.

**`af-form` leaves values, validation and saving to the page.** The page holds the values (every kit control is
controlled: set the value back on `change`, and handle the `change` a `form.reset()` sends), validates, and saves.
`af-form` around the native `<form>` does three things only. It turns the submit into one `af-submit`, sent once until
the page has had its turn and not at all while `busy` is set: set `busy` in the handler, in the same tick, and clear
it when the save ends, so a double press saves once. It puts the server's `errors` (`{ path, message }`) on the
`af-field`s whose `name` they name, and the rest in a summary banner, and moves focus to the summary or the first
field with an error. And it asks before leaving the page while `dirty` is set, so set `dirty` while the form holds
changes that are not saved. Listen for `af-submit` and never `submit`: the form's own `submit` bubbles through the
element too.

### Figures

**Draw a figure with `<af-tile>`.** A number, a bar, column, line, pie or donut chart, a text or a list, with its
legend, tooltip, table view and keyboard reading, is one element: give it the tile, the result `computeTiles`
returned for it and the entity's fields, and a list its rows and columns (kit README, "Drawing a tile"). Do not draw
those with a charting library of your own. The element does what goes wrong by hand: the hatched fill of `$other` and
`$restricted`, the gap where a value is missing, the earlier period and the target, the figure's unit, the
reconciliation line under a chart and a reading of every mark for a screen reader. A figure it does not know (a
chart type or a tile kind from a newer server) says so and draws nothing, so the module shows its own.

**A sparkline, or any figure of your own,** takes its numbers and colours from `@reflexify/agentflow-sdk/figures`,
the rules AgentFlow's dashboards draw by: `formatMeasureValue` for a value in its unit (`null` is `—` and zero is a
value), `measureColor` and `categoryColors` for colour, and `axisGroups` to find which measures may share an axis.
They are plain functions with no DOM and no requests.

**Colour follows identity, never rank.** A stage, an option or a measure keeps its colour whatever else is on the
screen, so a filter that removes one series repaints no other, and hiding a series in a legend leaves its
neighbours alone. An enum option keeps the slot of its place among the field's options, and a measure the slot of
its place among the tile's measures; a measure or option with its own colour keeps that. Never pick a colour from a
position in the list as drawn.

**The colours are the chart tokens.** `--af-chart-1` to `--af-chart-8` are eight categorical slots in a fixed order,
`--af-chart-other` and `--af-chart-hatch` are the hatched fill for `$other`, `$restricted` and a ninth identity, and
`--af-chart-grid` and `--af-chart-axis` are the recessive lines (section 3.1 has the fallbacks). They are checked as a
set for colour-blind separation and are the same under every brand, so a series never takes the primary colour, a
status colour or a literal. They paint marks only: a value, a label and a legend's words stay in `--ink` and
`--muted`, so a number is never tinted by its series. Three of the light slots measure under 3:1 against the surface,
so a figure also says what each mark is in words, in a legend, a label, a tooltip or a table, and never leaves colour
as the only cue.

**A pie only where the verdict says `partitions`.** A pie claims its slices are the parts of one whole, so use one
only when the result's `verdict` is `partitions`: every record is in exactly one bucket. Where it says `fans_out` or
`overlaps`, a record is counted in several buckets, the slices add up to more than the whole, and the share each one
shows is wrong; draw bars, which make no claim about the whole, and let the tile say so. A pie draws one measure, with
no labels on the slices: read the legend, which gives each slice's name, value and share.

**Small multiples, never a second value axis.** Two measures in different units, a count beside a sum, do not share
an axis, and a second axis that makes their lines look related claims what nothing backs. Draw one panel for each
unit, one above the other, each with a scale of its own and its unit named, and the same buckets in the same places.
`af-tile` does this itself for a chart whose measures are in more than one unit.

**A list tile's row opens a record only through `af-open-record`.** The tile draws the rows it is given (options as badges,
references and files as chips) and links nowhere: with the `drill` attribute set, a row sends `af-open-record` with its
record and entity ids and whether the click asked for a new tab, and the module decides what opens. Do not read a row's id
out of the markup, and do not set `drill` where nothing listens. A list pages only when the module gives it `paging` and
answers `af-page` with the next rows; the tile never fetches.

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
target is a combobox that is not expanded. A page's own layer that hears Escape on `document` before the kit, as AgentFlow's
Radix dialogs do, hands it to a kit overlay open inside it with `claimEscape` (the kit README, "Escape under a page's own
layer"); a module, listening on its shadow root, never needs it.

**Focus.** Opening a panel moves focus to its heading (`tabindex="-1"`, focused with `preventScroll`); closing it moves
focus back to what opened it, or else to a stable fallback (the list's heading, then `main`). The kit's dialogs move
focus in and back themselves; to start on a field, focus it after the dialog opens, as the starter's `NewCaseDialog`
does.

**A press that feels instant:** `:active` with no transition; lock with an in-flight flag in the same tick, not with
framework state, which lands a render later; write locally first; no spinner before 400 ms; navigate first, then fetch.

**Drag and drop, only if the screen needs it.** It must work from the keyboard (Space or Enter lifts, the arrows
move, Space or Enter drops, Escape cancels), show a refusal on the target before the drop (a lock and the reason),
and announce each step in both languages; dnd-kit's `document` listener is the accepted one in section 2.

## 7. Content

**Review every screen in both of AgentFlow's languages.** Vietnamese runs about 30% longer than English, and
AgentFlow may hand any module `vi`. Nothing that holds text has a fixed width; buttons pad `0 12px` and do not wrap;
toolbars and filter rows wrap.

**Truncation:** one line with an ellipsis, or a two-line clamp, with the full text in one `af-tooltip` and never a
native `title` as well, which would show a second tooltip. Never truncate status words, button labels, refusal reasons
or field labels: they wrap. Mount each `af-tooltip` lazily, never one
per row up front: on a non-interactive value, mount it the first time a pointer comes over it; on a control, use
a wrapper that also arms on focus. A list of 1,000 rows would otherwise mount thousands of shadow roots. Patterns: the starter's
`LazyTooltip` in `src/module/kit.tsx` for text and marks; to wrap a control, a wrapper that moves the control's
existing nodes into the tooltip when it arms, and dispatches the arming pointer event again once the tooltip can hear it.
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
hidden text. A date with a time uses the 24-hour clock. Writing day and month in figures in both languages is an
organization's choice to make; a module follows `af-date` unless its owner decides otherwise. The SDK's
`formatDate(iso, locale)` writes a day in those two forms, with the year, and `todayIsoDate()` is the viewer's today. Pattern: `formatDay` in `src/module/CasesScreen.tsx`.
When the owner has chosen a mask for a field (`DD.MM.YYYY`), the field's `af-date` takes it as `format`, and the module
writes that field's dates elsewhere with the SDK's `formatMasked(iso, mask)`, so the field and the page agree.

**Numbers** go through `Intl.NumberFormat(context.locale)`: 1,200 in English, 1.200 in Vietnamese. A ratio has no
spaces (2 of 5 is written 2/5). A count follows its name, in `--muted`. Zero shows as 0.

**People.** Initials are the first letters of the first and last words (one word: its first two letters), taken after
NFC normalisation and split into graphemes with `Intl.Segmenter`, then upper-cased in the locale, so a decomposed
name keeps Đ, Ư and Ơ whole. The avatar's hue comes from the id (`data-hue` on `af-avatar`). Avatars are 24, 32 and
40 px; a stack shows at most 3, then "+n", with a tooltip naming everyone.

**Voice.** Sentence case and no exclamation marks. A refusal names who may act ("Only the case's owner can close
it"), never just "Not allowed". Show the server's reason verbatim, with a leading code stripped. Keep both languages
in one file, `src/module/text.ts`, so a string cannot exist in one and not the other.

## 8. Accessibility

**Contrast,** measured in both themes on the real page:

| What | Target | Met by |
|---|---|---|
| text, and text on tints | 4.5 to 1 | `--ink`, `--muted`, an `-ink` on its `-soft` |
| large text (24 px, or 18.7 px at 600) | 3 to 1 | the same |
| input borders, rings, checkboxes, state glyphs | 3 to 1 against their neighbours | `--line-strong` (about 3.4 to 1), and on a module's own controls solid `--focus`; a kit control's ring does not meet it, as the next paragraph says |
| decorative borders | none | `--line` |
| locked controls | exempt, but never below .55 opacity | |

**The focus ring** of a control of the module's own is solid `--af-primary` (the block's `--focus`), 2 px, offset 2 px
(`-2px` inside a scroller), drawn through `:focus-visible` only. Never `--af-ring` alone: it is the primary at 40% alpha,
about 1.6 to 1 on white, below the 3 to 1 a focus indicator needs. Never remove a ring without a replacement.

**Kit controls use AgentFlow's soft focus ring, and it is below the target.** A kit class or element draws a border in
`--af-ring` and a 3 px ring of it at half strength, about 1.6 to 1 against white, below the 3 to 1 target and the same
as AgentFlow's own controls, with a 2 px outline under forced colours. That is a known gap carried from AgentFlow, not
a rule for the module's own controls: do not copy it, and do not restyle the kit's, so that it changes in one place when
AgentFlow's does.

**Hit sizes:** 32 px; 24 px, with at least 4 px between them, only in dense rows. A small mark (a 20 px tick, a 16 px
box) is drawn inside a 32 px hit area (`::before { inset: -6px }`). `xs` buttons (24 px) only inside dense rows.

**Locked controls.** `aria-disabled="true"` keeps the control focusable, so its reason can be reached, and its press
handler returns early. The reason is a visually hidden `<span id="…">` beside the control, which its
`aria-describedby` names, plus an `af-tooltip` for sight: `af-tooltip` cannot describe what is slotted into it,
because an id reference does not cross a shadow boundary. The rule, from the starter's `src/module/styles.css`:

```css
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%);
  white-space: nowrap; border: 0; }
```

An `af-menu` locks its own trigger, so the page adds no hidden span: `disabled` makes the trigger `aria-disabled` (it keeps
focus, and the menu cannot open), and `reason` puts it in an `af-tooltip` and gives it the same text as its
`aria-description`, which an id reference from the page could not reach. A menu action drawn in a status tone takes the
item's `tone` (`success`, `warning`, `info` or `danger`), not a class of the page's own.

**Kit inputs** (`af-date`, `af-person-picker`, `af-tree-picker`, `af-number-input`, `af-select`, `af-combobox`,
`af-file-upload`, `af-signature-pad`, `af-rich-editor`) are named with their `label`, or by the `af-field` around them, which sets it; a
`<label for>` cannot point into a shadow root. Native inputs in the module's own tree use `<label for>` as usual, or an `af-field`. A kit control's
`description`, `error` and `invalid` reach its inner input as `aria-describedby` and `aria-invalid`; an `af-field`
sets them.

**Semantics.** A list's children are list items. Tables have a caption and `scope="col"`. Regions are
`<section aria-labelledby>`. A side panel is `<aside role="dialog" aria-modal="false" aria-labelledby>`. A fold is
`<details>` and `<summary>`.

**One live region, the toast's.** `af-toast` mirrors each toast into always-present `role="status"` and
`role="alert"` regions, so add no second one, and do not announce a live refresh, which would be noise.

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

**Test the host's changes.** Mount through a test host and check that the module moves only through
`host.navigate`, follows a path the host reports through `host.onLocationChange`, re-renders in place when the theme
or the language changes, and lets go of `host.realtime` on unmount without closing it.

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
8. Does every id come from a key resolved through the SDK's objects cache, and every API address the browser opens itself (a download, an image) from `host.apiUrl`?
9. Does a change of language or theme re-render in place, keeping an open dialog and what is typed in it?
10. Does every interactive element have hover, focus-visible, active and locked states?
11. Is every focus ring of the module's own controls 2 px, solid, in the primary colour, unclipped, and drawn on the card rather than on a stretched `::after`, and does a kit class or element keep the ring the kit gives it?
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
24. Does every form control sit in an `af-field` with its label, help and error, or, standing alone (a filter in a toolbar), carry a `label` of its own?
25. Is the `source` of every `af-combobox`, `af-person-picker` and `af-tree-picker` one stable function, a module constant or one memoised for the page's lifetime, and never built inline in a render, `directory.people(client)` and the other directory sources included?
26. Does a form post through `af-form`'s `af-submit`, with `busy` set in the handler and cleared when the save ends, so that a double press saves once?
27. Do the API's field errors go to `af-form`'s `errors`, so that each lands on its field and the rest in the summary?
28. Does everything of the module's own that scrolls sit in an `af-scroll-area`, with no `overflow: auto` or `overflow: scroll` in the module's CSS?
29. Is every table native markup carrying the kit's `af-table` class, with a caption and `scope="col"` on each header?
30. Does every value that is Markdown render through `af-markdown`, and never by setting `innerHTML`?
31. If a selection has a shortcut, does the module bind it, on its shadow root, to the `af-bulk-bar`'s `focus()`, since the bar binds no key?
32. Does a module that uploads files keep the `items` of its `af-file-upload` itself, adding a row when `files-add` arrives and setting it `done` or `failed` when the upload ends, since the element keeps none?
33. Does a start-form field that takes a folder go through `af-folder-source`, with `sources` made once, the set id from `af-folder-upload-started` kept for `resume-set`, and the launch locked while the last `af-folder-change` has no `value` or its `preview` carries a `refusal`?
