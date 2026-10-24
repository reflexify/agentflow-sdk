# Notes for coding agents

This project is an AgentFlow app, built with the AgentFlow SDK. `config/` describes an app package, and the builder turns
it into `package/`.
<!-- starter:ui+example -->
`src/module/` is the package's UI module.
<!-- /starter:ui+example -->
<!-- starter:site -->
A standalone site sits beside the package (`server/`).
<!-- /starter:site -->

## Skills

The AgentFlow plugin for Claude Code holds the skills for this work. Add it once:

```
/plugin marketplace add reflexify/agentflow-sdk
/plugin install agentflow@agentflow-sdk
```

- `agentflow-app-authoring`: turning requirements into `config/` (the manifest, parameters, entities, access, rules,
  stage models, work, workflows, agents and skills).
- `agentflow-app-release`: building, checking, sealing, linting against AgentFlow and deploying, and what each refusal means.
- `agentflow-from-draft`: moving an app built in AgentFlow's designers into code.
<!-- starter:ui -->
- `agentflow-ui-module`: the UI module's screens, styles, kit elements, tests and review, against the design guide
  `node_modules/@reflexify/agentflow-elements/DESIGN.md`.
<!-- /starter:ui -->

Without the plugin, read the builder's README: `node_modules/@reflexify/agentflow-app-builder/README.md` documents
every file under `config/`.

## Commands

- `pnpm build`: `agentflow-app build`: writes `package/` from `config/`.
<!-- starter:ui -->
- `pnpm build` also writes the UI module into `package/ui`: built with Vite, or copied as it is when `ui` in
  `agentflow.app.mjs` names a `prebuilt` folder.
<!-- /starter:ui -->
- `pnpm check`: `agentflow-app build --check`: fails when the committed `package/` is not what `config/` builds.
<!-- starter:ui -->
  `pnpm check` compares package/ui with the module when package/ui exists (git ignores that folder; `pnpm build`
  writes it).
<!-- /starter:ui -->
- `pnpm test`: the Vitest tests, if the project has any, then the check.
<!-- starter:typescript -->
- `pnpm typecheck`: TypeScript over the project's `.ts` and `.tsx` files.
- `pnpm exec agentflow-app types`: TypeScript for the package's objects (`LogicalKey`, `EntityFields`,
  `WorkflowInputs`), from `package/`: run `pnpm build` first.
<!-- /starter:typescript -->
<!-- starter:ui -->
- `src/generated/app.ts` is what `types` writes, and the project commits it. `pnpm test` ends with
  `agentflow-app types --check`, which fails with `TYPES_STALE` when the file is behind `package/`: after a change
  under `config/` that adds, renames or removes an object, run `pnpm build`, then `pnpm exec agentflow-app types`.
<!-- /starter:ui -->
<!-- starter:ui+example -->
- `pnpm demo`: the UI module on in-memory data, at `http://localhost:5174/module.html`.
<!-- /starter:ui+example -->
- `pnpm exec agentflow-app keygen --key-id <id>`: once per publisher, a signing key in `keys/`.
- `pnpm seal`: `agentflow-app seal`: signs `package/` into `dist-app/`.
- `pnpm exec agentflow-app lint`: checks `package/` against the AgentFlow at `AGENTFLOW_URL`, with the key in `AGENTFLOW_TOKEN`.
- `pnpm exec agentflow-app deploy --wait`: uploads the sealed package and asks for it to be installed; an admin approves it at the
  link it prints.

Every `agentflow-app` command takes `--json` for one JSON value on stdout. A refusal prints `<CODE>: <message>` and exits `1`.

## Where things are

- `config/package-manifest.json`: the package's identity and parameters; raise `version` for every release.
<!-- starter:ui -->
  Its `ui` and `launcher` members declare the module and its entry in AgentFlow's sidebar.
<!-- /starter:ui -->
<!-- starter:example -->
- `config/entities/case.json`: the `case` entity, with its fields, view, create form, access, rule and stage model.
- `config/build/open-case.mjs`: the "Open a case" workflow, written with the builder's workflow helpers.
<!-- /starter:example -->
- `agentflow.app.mjs`: what the build reads: the workflows, in publish order, and the exposed steps.
<!-- starter:ui+example -->
- `src/module/module.tsx`: the module's entry, `mount(root, host)`.
<!-- /starter:ui+example -->

## Rules

- Never commit `keys/`. It holds the signing key, and git ignores it.
- Never write the value of `AGENTFLOW_TOKEN` into a file, a command line or a log.
- Never edit `package/` by hand. Change `config/`, run `pnpm build`, and commit both.
<!-- starter:example -->
- `README.md` and this file describe the starter's own example objects. When your objects replace them, rewrite both:
  the objects, the parameters and the install notes (the starter has no trigger to turn on; an app with one needs the
  admin to turn it on after the install).
<!-- /starter:example -->
- After every change under `config/`, run `pnpm build` and fix what it refuses: it names the file and the place.
<!-- starter:ui -->
- In the module: one stylesheet in the shadow root, no listeners on `document`, sizes by container queries, every id
  read from `GET /app/objects`, and every link the browser opens itself made with `host.apiUrl`.
  `test/module/styles.test.ts` and `test/module/ui-build.test.ts` check this in `pnpm test`.
<!-- /starter:ui -->
