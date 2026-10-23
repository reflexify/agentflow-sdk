# Projects

The signed app package `rfx/projects`: task and project management for a team. It holds five entities (project, section, task, task label, status update), a dashboard, and the access, rules and status moves that make each project's managers and members decide who reaches its tasks. Its screens are the package's UI module (`src/`, which `pnpm build` builds into `package/ui/`; see "The module" below).

- `config/` holds the sources: `package-manifest.json`, `entities/`, `dashboards/`, and `build/`, the modules of workflows and triggers. `agentflow.app.mjs`, at this directory's root, hands them to the app builder (`@reflexify/agentflow-app-builder`), whose `agentflow-app build` writes `package/`.
- `package/` is the generated package. Do not edit it by hand.
- `parameters.example.json` names the five install parameters.

## Build

Build the builder first (`cd sdk && pnpm --filter @reflexify/agentflow-app-builder build`; its `dist/` is not committed), then from this directory:

```bash
pnpm build:package    # writes package/ (and builds the module into package/ui/)
pnpm check:package    # compares package/ with what the config builds, writing nothing
pnpm test             # runs that comparison among its checks
```

After any change under `config/`, run the build first and commit `package/` with it.

## Seal, install and arm

[RUNBOOK.md](RUNBOOK.md) has the whole of it, from sealing with `pnpm pack:app` to a pass by hand as each role. In short, seal the package with `pnpm pack:app`, deploy it with `agentflow-app deploy`, have an admin approve it, then turn on its triggers as section 3 of the RUNBOOK says. The three workflows install off, and until they are armed a task's `completed_at` is not stamped, closing a project does not freeze its tasks, and reopening it does not unfreeze them. To upgrade from 1.0.0, deploy the 1.1.0 archive the same way, then press **Turn on triggers** on the install receipt: it lists `trigger:unfreeze_on_reopen`, because an upgrade never changes armed state and a new trigger lands off, and it turns on only the listed triggers. The operator's `arm --only trigger:unfreeze_on_reopen` does the same; a bare arm would also turn back on any trigger an admin turned off. To upgrade from 1.1.0, deploy the 1.2.0 archive the same way. It adds no trigger, so there is nothing to arm. It declares the `assistant` member (cards the assistant offers for Projects records expire after 15 minutes), which only an AgentFlow release that reads that member accepts. To upgrade from 1.2.0, deploy the 1.3.0 archive the same way. It adds no trigger. It offers two skills to the organization's assistant, `create_project` (a project with its sections and tasks on one card) and `bulk_update` (one change to many tasks), so installing or upgrading it needs `agent.publish`, and the Task create form gains `checklist` and `origin`. Only an AgentFlow release that reads `assistant.skills` accepts it.

**Rollups and your own automations.** 1.1.0 adds the task counts on Project and Section as rollups. While an entity carries a rollup, any field-enforcing workflow or agent step that reads a Project or Section record, your organization's own included, sees that record as Unknown and takes its default branch, with no error. Before you upgrade, find your own workflows and agents that branch on a Project's or Section's fields and check what their default branch does.

Fill in `parameters.example.json` for the install:

- `project_users`: the group of everyone who uses Projects. Give its members a role with `entity.read`, `entity.list`, `entity.write` and `entity.delete`.
- `project_creators`: the group that may create projects. A project's creator becomes its first manager.
- `automation_principal`: the service principal the app's workflows run as. Give it a role with `entity.read`, `entity.list` and `entity.write`, and issue it no credential.
- `automation_group`: a group holding the automation principal and one dedicated account that never signs in. Setup refuses a group with no person in it (agentflow-k9wq), and every member may change any task, including a frozen one, so add no one else.
- `project_admins`: the people who oversee every project; give them the same role as the project users.

All five are required. `parameters.example.json` shows the shape.

After the install:

1. Share the Projects overview dashboard with the Project users group. A packaged dashboard installs private to the installing admin, and everyone else gets a 404 on it until it is shared (`agentflow-jjp9.17`).
2. Put people in the groups. There is no organization-admin bypass of record access: only members of `project_admins` see every project, and everyone else reaches a project through its managers and members.

## The module

The screens are a React 19 module, built as the support desk's is: `src/module.ts` exports `mount(root, host)`, Vite builds it as a library into `ui/index.js` with React and the kit (`@reflexify/agentflow-elements/kit`) bundled, and the package's manifest names it (`"ui": {"kind": "module", "entry": "ui/index.js", "contract": 1}`). The committed `package/` never holds `ui/`: the build writes it into `package/ui/`, which git ignores, and `pnpm pack:app` seals it from there. The kit's rules are in the guide's page on UI modules (`<AGENTFLOW_URL>/guides/xay-dung-ung-dung/mo-dun-giao-dien`).

### `src/`

| Path | Holds |
|---|---|
| `module.ts`, `mount.tsx` | The entry point and the mount: the module's one `<style>` (its CSS and `KIT_CSS`), React Query, the unmount |
| `main.tsx`, `boot.tsx`, `demo.tsx`, `demo-host.ts` (and `index.html`) | The standalone page: `?demo` runs the module on the in-memory server with a persona picker above it; without it the page reads `/site/config.json`, signs the person in and mounts the module on the SDK's standalone host |
| `styles/` | `projects.css` and `inject.ts`, which puts it into the shadow root |
| `text.ts` | Every visible string, `{en, vi}`, chosen by `host.context.locale` |
| `kit/` | Thin React wrappers over the kit's elements (properties through a ref, `addEventListener`) |
| `shared/` | The ids from `GET /app/objects`, icons, the filter chip |
| `model/` | Pure logic: types, records, roles (what a control allows the viewer), dates, positions, grouping, status writes, formatting |
| `api/` | `ProjectsApi`, its implementation over `host.api` (`http-projects-api.ts`), and the in-memory AgentFlow the tests and the demo run on (`memory-server.ts`, `memory-rules.ts`, `fake.ts`, `seed.ts`, `demo-ids.ts`) |
| `data/`, `live/` | Caching and mutations over React Query; live updates from `host.realtime` |
| `shell/` | The app, header, routes (`route.ts`) and the shared states |
| `mywork/`, `projects/`, `board/`, `task/` | My Work; the project list, create project, the project menu and edit drawer, and the closed banner; the Tasks tab (board, list, drag and drop); the task drawer and quick create |
| `members/`, `labels/` | The Members tab; the sub-label settings |

### Build order

The module imports the SDK, the elements and the app builder from the workspace, built. From `sdk/`, once and after any change to them:

```bash
pnpm install
pnpm --filter @reflexify/agentflow-sdk build
pnpm --filter @reflexify/agentflow-elements build
pnpm --filter @reflexify/agentflow-app-builder build
```

(`pnpm build` from `sdk/` builds all of them.) Then from this directory:

```bash
pnpm dev             # http://localhost:5175/?demo: the module on the in-memory server
pnpm test            # Vitest over every screen and the model, then the package's drift gate
pnpm typecheck
pnpm test:ui         # builds ui/ into a temporary directory and checks it: index.js exports mount, no .css, no bare React or kit import
pnpm test:pack       # builds package/ plus ui/ in a temporary copy as pack:app does, checks the build and signs it with a key made for the check
pnpm e2e             # Playwright on ?demo in Chromium and WebKit (`pnpm exec playwright install chromium webkit` once)
pnpm e2e:screens     # the screenshots for a design review, into e2e/screens/
pnpm pack:app       # builds package/ with ui/ and seals it into dist-app/rfx-projects-1.3.0.afpkg (`pnpm exec agentflow-app keygen --key-id <id>` once, first)
```

`/?demo` asks who you are with the picker above the module (Lan the project admin, Minh a manager, Hoa a member, Tuấn a collaborator in no project, Khoa in no project at all, Mai a project creator) and follows the browser's language and colour scheme. The Vitest config pins `TZ` to `Asia/Ho_Chi_Minh`, and so does the Playwright config, so the seed's "today" is today in both.

## The standalone site

The same module on its own origin, with its own sign-in and a Node server (`server/`), as the support desk's site runs. It is registered under Admin → Apps outside the package, so it has no ceiling and every call acts as the person. [RUNBOOK.md](RUNBOOK.md) section 5 has the setup and a walkthrough; the commands, from this directory:

```bash
pnpm setup-keys   # keys/ and .env (a fresh session key and key id); then register keys/registration.json as the RUNBOOK says
cp projects.config.example.json projects.config.json   # fill in the installed entity and group ids
pnpm doctor       # one line per check: configuration, identity provider, private_key_jwt, AgentFlow API, projects config, live updates
pnpm server       # builds the site and serves it on http://localhost:5175 (PORT, PROJECTS_ORIGIN)
```

`.env.example` lists the variables. `AGENTFLOW_ISSUER` is required; `AGENTFLOW_APP_URL` (default `http://localhost:4000`) is AgentFlow's web app, which the site's links to notifications, the dashboard and Mở form leave for. The server answers `/site/config.json` (the base path, the package's ids and that address), `/agentflow/api/...` (the same-origin proxy to AgentFlow's published API) and `/agentflow/auth/...`; every other path is the module's. Sessions live in the server's memory, so run one instance. Git ignores `keys/`, `.env`, `projects.config.json` and `registration.json`.
