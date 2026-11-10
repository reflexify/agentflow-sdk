# Kit showcase

`acme/kit-showcase` is an app package whose only content is a UI module: one page that uses every element and class
of the AgentFlow UI kit (`@reflexify/agentflow-elements/kit`) on made-up data. It has no entity, workflow, site or
server.

The kit's gallery (`packages/agentflow-elements/gallery/`) proves each element on its own page. The showcase proves
what only a module inside AgentFlow can:

- that a module runs on AgentFlow's copy of each tag;
- that its overlays rise above AgentFlow's page from inside the module's shadow root;
- that a `<form>` in that shadow root collects the kit controls' values;
- that the wrappers the `agentflow-ui-module` skill teaches (`src/module/kit.tsx`) work.

The page has six sections: **Overlays**, **Pickers**, **Structure**, **Pages**, **A form** and **Display**. Beside them, a list shows the last
ten events the page heard, as `tag type detail`. When the kit gains an element or a mode, add it to the right section,
through a wrapper in `src/module/kit.tsx` or as plain JSX for a class, and check one behaviour of it in
`frontend/e2e/kit-showcase.spec.ts`.

## Opening it

From `sdk/`, after `pnpm install && pnpm build`:

| Command | What it does |
|---|---|
| `pnpm --filter kit-showcase demo` | Opens the module on the standalone host at `http://localhost:5175/module.html`, following the browser's colour scheme and language. |
| `pnpm --filter kit-showcase build` | Writes `package/`. Its `ui/` is not committed. |
| `pnpm --filter kit-showcase test` | The module test, a test that the number, date, file upload and tile wrappers set the digits, mask, replace and list properties on the element, then a check that `package/` matches `config/`. |

Inside AgentFlow, with no backend: build the showcase, then run the frontend's `pnpm dev`. Its `predev` copies
`package/ui/` into `frontend/public/mock-modules/kit-showcase/`, and the mocked API serves it as the app
`kit-showcase` at `http://localhost:4000/apps/kit-showcase`. `frontend/e2e/kit-showcase.spec.ts` drives it there in
Chromium and WebKit.
