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
- **The focus ring is hard to see.**
  Cause: a ring drawn with `--af-ring`, the primary at 40% alpha, about 1.6 to 1 on white.
  Instead: `outline: 2px solid` in `--af-primary` (the starter's `--accent`), offset 2 px, through
  `:focus-visible` only.

## Behaviour

- **Typing in a field fires one of the module's shortcuts, or keys typed in AgentFlow's own page reach the module.**
  Cause: a `keydown` listener on `document` (or `window`). It sees a key typed inside a shadow root as typed on
  the host element, so it cannot tell a field from a shortcut, and it hears the host's page too.
  Instead: listen on the shadow root and read the real target with `composedPath()`. The listeners a library may
  keep, each live only during its own interaction: Zag's dismissable layer (Escape while an overlay is open), its
  focus-visible tracker, its toast-group hotkey, Svelte 5's delegated dispatcher, dnd-kit's keyboard and pointer
  sensors during a drag, and the one `pointerdown` listener `af-dialog` adds while it is open.
- **The module shows nothing in another organization, or reads its objects twice.**
  Cause: a hard-coded id or API base, or `GET /app/objects` read in an effect, which React's StrictMode runs
  twice in development.
  Instead: read `/app/objects` once per mount, in an API object made in `mount` (`src/module/http-cases-api.ts`),
  and again only after a failed read. Make every address the browser opens itself, a download link or an
  `<img src>`, with `host.apiUrl`.
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
- **A kit property or method is missing at run time, though the types have it.**
  Cause: another module's older kit registered the tag first. Registration is global, and the first copy wins.
  Instead: feature-detect anything newer than the kit version you require (`'label' in el`); read
  `customElements.get(tag).kitVersion` to see which copy you got.
- **A screen reader reads no reason for a locked control, or no name for a kit input.**
  Cause: `aria-describedby` pointed through `af-tooltip`, or a `<label for>` pointed at a kit input. Neither
  crosses a shadow boundary.
  Instead: a visually hidden `<span id="…">` with the reason beside the control, named by its `aria-describedby`,
  plus the `af-tooltip` for sight; name `af-date`, `af-person-picker` and `af-rich-editor` with their `label`.
- **A kit element stays disabled after `disabled="false"`.**
  Cause: the kit's Boolean attributes follow presence semantics: present means true, whatever the value.
  Instead: leave the attribute out, or set the property to `false` through the wrapper
  (`kit-in-react.md`, beside this file).

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
  Cause: `POST /attachments`, `GET /groups/{id}`, `GET /identities` and `GET /units` are refused under a packaged
  ceiling. An embedded module calls as the person, so it never meets this.
  Instead: make those calls from the module inside AgentFlow, or as the signed-in person. A site registered outside
  the package has no ceiling.
- **A reload on one of the module's routes of a standalone site answers 404.**
  Cause: the route sits under a path the server answers itself, `/agentflow/` (the SDK's routes) or `/site/`
  (Projects' config), so the server never falls back to the page.
  Instead: keep the server's own files under prefixes the module never routes to, as Projects' server does
  (`examples/projects/server/app.ts`).
