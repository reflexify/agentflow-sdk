---
name: agentflow-ui-module
description: "Use when writing, changing or reviewing an AgentFlow app's UI module (the package's ui/, mount(root, host) on an AppHost) with @reflexify/agentflow-elements/kit: its screens, styles and tokens, theme and language, kit elements, accessibility, and the module's tests and build."
---

# Writing an AgentFlow UI module

This skill starts where `agentflow-app-authoring` stops. Authoring owns the manifest's `ui` member, the
launcher entries and the `ui` option of `defineApp`; `agentflow-app-release` owns building and sealing. This
skill names both and does not repeat them. It covers the module's own code: its screens, styles, kit elements,
language and theme, tests and review.

## What a module is

The guide's page for readers without an agent is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/mo-dun-giao-dien` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/mo-dun-giao-dien`). `<AGENTFLOW_URL>` is the address your team opens AgentFlow at.

- The package's `ui/index.js` is an ES module whose named export `mount(root, host)` renders into `root` and
  returns the function that unmounts it. `root` is inside a shadow root, and `host` is an `AppHost`
  (`@reflexify/agentflow-sdk`).
- The same module runs in two hosts: inside AgentFlow, which imports the package's `ui/index.js`, and on the
  app's own site, which mounts it with `createStandaloneHost`. The API's base, the theme and the language come
  from the host in both; never assume one of them.
- The rules are in the design guide, `node_modules/@reflexify/agentflow-elements/DESIGN.md`, which ships with
  the kit at the version you installed. When this skill and the guide differ, the guide is right.
- Paths: a starter path such as `src/module/mount.tsx` is in your own project, which `agentflow-app init`
  copied from the starter, the case desk. A Projects path is written in full, such as
  `examples/projects/src/mount.tsx`, and is in the SDK repository (reflexify/agentflow-sdk on GitHub) at your
  release tag.

## Steps

### 1. Check that the project has a module

A project with a module has all three of these:

- the `ui` member in `config/package-manifest.json`: `"ui": { "kind": "module", "entry": "ui/index.js", "contract": 1 }`;
- `vite.module.config.ts`, the module's Vite build;
- `src/module/module.tsx`, the entry that exports `mount`.

If one is missing (a project made with `agentflow-app init --no-ui`), add the module from the starter. Make a
scratch project with a module, beside yours, with the builder your project already has, so its files and
versions match your release:

```bash
pnpm exec agentflow-app init ../ui-starter --prefix acme --no-site   # your own prefix
```

1. Copy from the scratch project into yours: `src/module/`, `test/module/`, `module.html` and
   `vite.module.config.ts`; and `vitest.config.ts`, `tsconfig.json` and `tsconfig.node.json` when your project
   has none.
2. In your `package.json`, add every entry of the scratch project's `dependencies` and `devDependencies` that
   yours lacks, written exactly as there.
3. In its `scripts`, add `demo` and `typecheck`, and replace `test` with the scratch project's, which runs Vitest
   before the check; keep the other scripts:

```json
"demo": "vite --config vite.module.config.ts --open /module.html",
"test": "vitest run && agentflow-app build --check",
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
pnpm add "github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-elements"
pnpm add "github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-sdk"
pnpm add -D "vite@^8.3.1" "@vitejs/plugin-react@^6.1.1" "jsdom@^30.1.1" "@testing-library/react@^16.3.3" \
  "@types/react@^19.3.0" "@types/react-dom@^19.3.0"
pnpm add -D "vitest@^5.0.1" "typescript@^7.0.2" "@types/node@^26.6.2"   # only those the project lacks
```

### 2. Read

1. `node_modules/@reflexify/agentflow-elements/DESIGN.md`: "Module rules" and "Review checklist" first, then
   the rest.
2. The starter's module, in this order: `src/module/module.tsx`, `src/module/mount.tsx`, `src/module/kit.tsx`,
   `src/module/styles.css`, `src/module/text.ts`, `src/module/CasesScreen.tsx`, `src/module/NewCaseDialog.tsx`,
   `src/module/demo.tsx`.

### 3. Write the screen's API as an interface

- Put everything the screen asks AgentFlow behind one interface, with two implementations: one over HTTP
  through `host.api`, and one in memory for the demo and the tests. Pattern: `src/module/cases-api.ts`,
  `src/module/http-cases-api.ts`, `src/module/memory-cases-api.ts`.
- The starter lists every case unfiltered. A filter, a sort and the names of referenced records (`ref_labels`),
  with the SDK's types: `reference/records-api.md`.
- A screen that only reads, with no create dialog: `reference/read-only-screens.md` says what to delete and what
  the checks will not tell you.
- A refused call carries AgentFlow's own sentence, with any leading code stripped, as `toCasesError` in
  `src/module/http-cases-api.ts` does. Show that sentence; never show a raw code to a person.

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

- Read `GET /app/objects` once per mount, never in an effect, and read it again after a failure so Try again
  recovers: `src/module/http-cases-api.ts` memoises it in the API object made once per mount.
- When a key the screen needs is missing, show a notice that names it in place of the screen:
  `examples/projects/src/mount.tsx` reads several keys and names the missing ones.

### 5. Tokens

- Copy the token block, the root rule and its `[data-theme='dark']` rule, from `src/module/styles.css`.
- Rename `.cases` to your root class everywhere, including `container: cases / inline-size` and every
  `@container cases` query.
- Derive, do not invent: every new colour is a `color-mix` of a token. The full set of roles, with each
  fallback, is in the guide's "Foundations".

### 6. Kit elements through a small wrapper

- Wrap each kit element in a component that sets its properties through a ref and listens with
  `addEventListener`. Pattern: `src/module/kit.tsx` (`Dialog`, `DateInput`, `useToasts`, `LazyTooltip`),
  `examples/projects/src/kit/use-element.ts`, `examples/projects/src/kit/elements.tsx`.
- Pass `locale` and `data-theme` to every kit element.
- The wrapper, the typings, `busy` and Boolean attributes: `reference/kit-in-react.md`.
- The standalone site beside the module (`server/`, `src/` outside `src/module/`): the `agentflow-app-authoring` skill's page on the site.

### 7. Follow the locale and the theme in place

- Subscribe with `host.onLocaleChange` and `host.onThemeChange` and re-render; never remount.
- Neither calls its listener as it subscribes. Read `host.context` for the first render, and again right after
  subscribing, so a switch made in between is not lost.
- Pattern: `Following` in `src/module/mount.tsx`, which does both and sets `data-theme` and `lang` on the root.
- Keep every text in both languages in one file, `src/module/text.ts`, chosen with `langOf`.
- Review in Vietnamese, the longer language (about 30% longer than English).

### 8. States and locks

- Loading shows a skeleton after 150 ms; empty shows an icon, a title and at most one action; an error shows the
  reason and Try again. `src/module/CasesScreen.tsx` has all three.
- A locked control is `aria-disabled`, with its reason in visually hidden text that its `aria-describedby`
  names, and in an `af-tooltip` for sight (the guide's "Accessibility").
- A dialog's submit locks on the first press, through a flag set in the same tick: `src/module/NewCaseDialog.tsx`.
- A change made in place shows first and rolls back on failure, with one flash and the server's reason (the
  guide's "Interaction"; the flash: `examples/projects/src/board/TaskCard.tsx`).
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
- Both came from Projects' `examples/projects/test/styles.test.ts` and `examples/projects/scripts/check-ui-build.ts`.
  Keep them; rename nothing in them when you rename the root.
- Run `pnpm test`. Then run `pnpm demo`, which opens `http://localhost:5174/module.html`, and look at the screen,
  also with `?empty` (no data) and `?fail` (the next create fails) on the URL.

### 10. Build

Run `pnpm build` (`agentflow-app build`). It prints `ui: built` when the module built. A refusal:

| Code | Fix |
|---|---|
| `UI_TOOL_MISSING` | Vite is not installed: `pnpm add -D vite`, with the React plugin, or remove `ui` |
| `UI_BUILD_FAILED` | Vite failed on the module: fix the error quoted after `the UI module did not build:` |
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
  `GET /app/objects` per mount, `host.apiUrl`), item 13 (`aria-disabled`) and item 16 (no emoji). Screen tests
  over the in-memory API can show items 9, 17, 18 and 21 in both languages. Items 2 to 4, 10 to 12, 14, 15, 19, 20,
  22 and 23, and every condition (both themes as drawn, 800 px, the red primary), need someone to look: name them
  in the hand-off as not checked, so a person does it before release.

## Worked examples

The starter, the case desk (paths in your project):

- `src/module/module.tsx`, `src/module/mount.tsx`, `src/module/kit.tsx`, `src/module/styles.css`
- `src/module/text.ts`, `src/module/CasesScreen.tsx`, `src/module/NewCaseDialog.tsx`, `src/module/demo.tsx`
- `vite.module.config.ts`, `test/module/cases-screen.test.tsx`

Projects (in the SDK repository at your release tag):

- `examples/projects/src/module.ts`, `examples/projects/src/mount.tsx`
- `examples/projects/src/styles/inject.ts`, `examples/projects/src/styles/projects.css`
- `examples/projects/src/kit/elements.tsx`, `examples/projects/src/shared/focus.ts`
- `examples/projects/src/board/TaskCard.tsx`, `examples/projects/src/model/dates.ts`
- `examples/projects/test/styles.test.ts`, `examples/projects/test/module-host.test.tsx`
- `examples/projects/scripts/check-ui-build.ts`

## Pitfalls

Read `reference/pitfalls.md` before you hand off. The four met most often:

- Custom properties declared on `:host` compute to nothing inside AgentFlow: declare them on the module's root.
- A `keydown` on `document` sees keys typed in AgentFlow's page: listen on the shadow root.
- Ids read in an effect are read twice under StrictMode: read `GET /app/objects` once per mount.
- A width `@media` follows the window, not the module: use `@container` queries on the root.

## Before you hand off

- `pnpm test` passes, the styles test and the UI build test included.
- `pnpm typecheck` passes.
- `pnpm build` prints `ui: built`.
- Every item of [reference/checklist.md](reference/checklist.md) is yes under every condition it names.
