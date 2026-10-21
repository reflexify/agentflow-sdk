# Support desk

Support desk is a ticket app for a support team, built from AgentFlow's own parts: six entities, two agents, three skills and fifteen workflows. A customer's email becomes a ticket. Every message the customer sends gets an AI draft reply. A person sends the draft, or autopilot sends it when a rule for that intent allows it. Delivery results come back onto the reply, and tickets nobody answered for seven business days close themselves.

It ships as the signed app package `rfx/support-desk`: `config/` holds the sources, `config/build/` turns them into `package/`, and `pnpm pack:app` builds that with the desk's UI and seals it into `rfx-support-desk-1.0.0.afpkg`, which the `app-package` command installs into one organization and then arms. The screens a support team works in (the desk) are the React app and server in this directory's `src/` and `server/`, which read and write only through the published API: see [The desk](#the-desk), below. [RUNBOOK.md](RUNBOOK.md) takes an empty organization to a working desk. The design record is [docs/design/support-desk.md](../../../docs/design/support-desk.md).

## Layout of the ticket app

- `config/package-manifest.json` holds the package manifest's hand-written members: its identity, the install parameters with their help, the audience, egress, ceiling and what the package requires of the organization.
- `package/` is the generated package: `manifest.json` and `objects/{kind}/{file}.json`. Do not edit it by hand. Its `ui/` is built output: `pnpm build:package` writes it and git ignores it.
- `parameters.example.json` is a parameters file to copy and fill in, for `app-package install --parameters`.
- `config/entities/` has one file per entity: Ticket, Reply, Note, Contact, Canned reply and Autopilot rule. Each carries its fields, its alternate key, a saved view, a create form and its access grants. Ticket's conversation (its messages are Replies) is declared in `ticket.json`.
- `config/agents/` and `config/skills/` hold the Support and Triage agents and the refunds, invoices and account-access skills.
- `config/code/` holds the JavaScript each Code step runs, with its tests in `config/code/test/`. The build inlines these files, so the tested source is the installed source.
- `config/build/` generates the workflows, triggers and actions in memory, and writes the package from them: one section per area (`intake`, `handling`, `send`, `draft`, `held`, `delivery`, `close-idle`), and the desk's own names and pieces in `lib.mjs`. `agentflow.app.mjs`, at this directory's root, hands them to `@reflexify/agentflow-app-builder` (the generic builders and checks, the package writer and the `agentflow-app` command).
- `scripts/check-pack.ts` builds the package and the desk's UI in a temporary copy, checks what the build writes and signs it with a key made for the check.
- `design/mockup-v3.html` is the desk design that the config was built to serve.

## Rebuild the generated files

After changing anything under `config/` (the sections in `config/build/`, an entity, an agent, a skill, a Code step's source or `config/package-manifest.json`), build the builder first (`cd sdk && pnpm --filter @reflexify/agentflow-app-builder build`; its `dist/` is not committed), then from this directory:

```bash
pnpm build:package
```

It writes `package/`, the app package `rfx/support-desk`, and nothing else: it is committed so a reviewer reads what ships, and never edited by hand. `config/package-manifest.json` holds the manifest's own members; the build adds its object list and grants. It refuses a graph with a dangling or extra edge, an unreachable step, a loop, or a Decision condition outside the designer's operators. It refuses a source it has no rule for, naming the file and the JSON pointer, and a reference that names no object, parameter or required entity of the package. It does not check how the designer retypes a literal: the designer round-trip test below does. `pnpm check:package` compares `package/` with what the config builds and writes nothing; `pnpm test` runs it. `package/` holds no committed `ui/`: the build writes the module into `package/ui/`, which git ignores.

## Seal the package

Make the publisher's key once, then seal:

```bash
pnpm exec agentflow-app keygen --key-id <id>    # writes keys/<id>.pem, mode 0600
pnpm pack:app
```

`pack:app` runs `agentflow-app build`, which writes `package/` and builds the desk's UI into `package/ui/` with `vite.module.config.ts`, and then `agentflow-app seal`, which signs `package/` with the one key in `keys/` and writes `dist-app/rfx-support-desk-1.0.0.afpkg`. To choose a key or a folder, add `--key FILE --key-id ID` or `--out DIR`. Sealing the same package again leaves the archive as it is; a changed package under the same version is refused (`SEAL_OUT_EXISTS`), so raise `version` in `config/package-manifest.json`. The key is the publisher's and never goes in the repository (git ignores `keys/`). `pnpm test:pack` does the same in a temporary copy, with a key made for the check, and checks the result. [RUNBOOK.md](RUNBOOK.md) step 8 takes the file from here to an installed desk.

## Tests

From this directory:

```bash
node --test config/code/test/*.test.js config/build/build.test.mjs
```

The Code step sources need nothing installed; the build test needs the builder built first, as above, and checks the config (the graphs, the grants, the parameters file). It does not compare `package/` with the config: `pnpm check:package` does, and `pnpm test` runs it.

The end-to-end tests are for AgentFlow's maintainers and run only in AgentFlow's own repository. They install `package/` into a fresh organization, with the code `app-package install` runs (a stand-in `ui/index.js`, the test signing key, every trigger armed afterwards), and drive it with a scripted model and a mock Resend. They need a database migrated to `main`'s schema and `node` on `PATH`. From `backend/`, with `DATABASE_URL` set:

```bash
AGENTFLOW_TEST_REQUIRE_DB=1 cargo test -p agentflow-api \
  --test support_desk_install --test support_desk_intake --test support_desk_handling \
  --test support_desk_send --test support_desk_draft --test support_desk_delivery \
  --test support_desk_held --test support_desk_close_idle --test support_desk_package \
  --test support_desk_cli --test desk_harness
```

`support_desk_package` plans the package in an organization set up as the RUNBOOK says, `support_desk_cli` installs it with the real `app-package` binary and arms it, and `desk_harness` tests the harness itself on two small packages.

Without `AGENTFLOW_TEST_REQUIRE_DB=1` a database test skips and reports green, which proves nothing.

The designer round-trip test imports every shipped workflow into the designer's own code and saves it again, and fails when a Decision's branches change. From `frontend/`:

```bash
pnpm vitest run tests/support-desk-decisions.test.ts
```

## The desk

The desk is the queue, the open conversation with the AI's draft waiting in the composer, who else has each ticket open, held messages, an Autopilot screen and contacts. It is an AgentFlow app module (`mount(root, host)`, in `src/module.ts`) written in React 19 and built with Vite. Its own site, a small Node server on one origin, and its demo both mount that module, and AgentFlow mounts the same file from the ticket app's package (`pnpm pack:app` builds it into the package's `ui/`). Its design record is the "The desk" section of [docs/design/support-desk.md](../../../docs/design/support-desk.md).

**Try it without a backend:**

```bash
cd sdk && pnpm install && pnpm --filter support-desk dev
```

Then open `http://localhost:5174/?demo`. Demo mode runs the whole desk on an in-memory AgentFlow with the design mockup's data. Hà is viewing TK-2026-0418, and 45 seconds in, Ana writes again, so you see presence and the send pause. Nothing is sent anywhere. `?demo&script=off` turns the script off, which is what the tests use.

**Commands**, all from `sdk/`:

| What | Command |
|---|---|
| Demo mode, no backend | `pnpm --filter support-desk dev`, then open `http://localhost:5174/?demo` |
| Unit and component tests (and the ticket app's Node tests) | `pnpm --filter support-desk test` |
| Type check (browser and server projects) | `pnpm --filter support-desk typecheck` |
| Build | `pnpm --filter support-desk build` |
| The module's `ui/` (`ui-dist/index.js`, the stylesheet inlined, React bundled) | `pnpm --filter support-desk build:ui` |
| Check that build (into a temporary directory; not part of `test`) | `pnpm --filter support-desk test:ui` |
| Build the package and seal it with the module (`dist-app/`) | `pnpm --filter support-desk pack:app` (`pnpm --filter support-desk exec agentflow-app keygen --key-id ID` once, first) |
| Check the build the sealing makes (not part of `test`) | `pnpm --filter support-desk test:pack` |
| End-to-end (demo mode, chromium) | `pnpm --filter support-desk e2e`. Needs `pnpm --filter support-desk exec playwright install chromium` once |
| Sign-in keys and `.env` | `pnpm --filter support-desk setup-keys` |
| Check a real setup | `pnpm --filter support-desk check-setup` |
| Run the built desk | `pnpm --filter support-desk start` |

CI's `sdk-check` job runs install, the peers check, build, typecheck and test for every workspace package, this one included. It does not run Playwright.

**Layout** of `src/`:

- `api/` holds `DeskApi`, the one interface between the screens and the network, its implementation over the SDK's typed client, and the in-memory AgentFlow (with the mockup's data) that demo mode, the component tests and Playwright run it against.
- `data/` holds the TanStack Query keys and hooks, live-update invalidation and the lost-session banner.
- `live/` holds the live layer over the channel the host hands the desk (live updates and presence), and the fake live layer for demo mode and tests.
- `model/` holds the typed records and the pure rules: SLA, thread, dates, autopilot figures, and the timing constants.
- `shell/` holds the routes, read and moved through the host, the rail, the palette and the shortcut sheet; `keys/` the keyboard map, heard on the desk's own shadow root.
- `queue/` holds the queue pane, Next ticket and the workspace frame.
- `ticket/` holds the conversation: header, thread, composer and side pane.
- `outbox/` holds the sends that outlive the ticket they began on: the countdown, Undo, and how each went.
- `screens/` holds held messages, Autopilot, contacts and the contact page.
- `styles/` holds the stylesheet, injected into the desk's shadow root and read from AgentFlow's `--af-*` tokens, and the desk's own palette for its site; `text.ts` every string, in English and Vietnamese.
- `mount.tsx` is `mountDesk`, the desk on any `AppHost`, and `module.ts` the entry AgentFlow imports; `demo-host.ts` and `demo.tsx` the demo's host and its script; `boot.tsx`, `main.tsx` and `page-keys.ts` the standalone page.

Beside it: `server/` is the desk's own server (the SDK's sign-in and proxy, the public config, its interim `/app/objects` answer from `desk.config.json` until a standalone host can reach a packaged installation's objects, and the setup checks), `shared/` is what browser and server both read (the package's keys, and how they map to `/app/objects`), `scripts/` the commands above, and `e2e/` and `test/` the Playwright and Vitest suites.

**Against a real stack:** the RUNBOOK's [The desk](RUNBOOK.md#the-desk) takes the installed ticket app to the desk inside AgentFlow at `/apps/rfx-support-desk` or, with an identity provider, to the desk's own site, with live updates and a walkthrough of the checks Playwright cannot make.
