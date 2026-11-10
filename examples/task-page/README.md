# Task page

`acme/task-page` is a small AgentFlow app that shows a **task page**: a Human step worked in the app's own screen instead of AgentFlow's task panel. It has no site. It is the app package, described by `config/`, and a small UI module that is the page.

A person records a request. The **Send for review** action on a pending request starts the "Review a request" workflow, which:

1. opens a review task for the Request users group, in a Human step that names a page of the module;
2. waits for a member to claim it, add a note and press **Approve** or **Reject**;
3. sets the request's status and keeps the note on it.

AgentFlow's task links (My Work, a notification, the record) open the page, `/apps/<key>/review/<task id>`, in place of the task panel.

## What to read

| File | What it shows |
|---|---|
| `config/build/review-request.mjs` | The workflow, and the Human step's `page: { path: "/review/{{ record_id }}", mode: "redirect" }`. `{{ record_id }}` is the id of the task itself. |
| `config/entities/request.json` | The `request` entity: a title, a status (`pending`, `approved`, `rejected`) and the decision note. |
| `config/package-manifest.json` | The manifest. Its `ui` member declares the module with app contract 5, the first that gives a module `host.tasks`. The built manifest's `minPlatformVersion` is raised to `2027.02` by the builder, the first platform month that reads a step's page. |
| `src/module.ts`, `src/module.css` | The UI module: `mount(root, host)` and its stylesheet. |
| `test/module.test.ts` | Mounts the module under jsdom on a fake host whose `tasks.open` returns a scripted handle. |
| `package/` | What `config/` builds into. Committed, so a reviewer reads what ships. |

## The page

AgentFlow hands over the interface and the data; the page renders. `src/module.ts`:

- reads the task's id from the path with `host.onLocationChange` (`/review/<id>`);
- puts an `<agentflow-provider>` in the page, with `client = host.api` and, when the host offers them, `signing` and `tasks`. It checks `'tasks' in provider` first: an older elements build has no such property, and the page then shows the notice to open the task in AgentFlow;
- puts `<agentflow-task record="…">` in the provider, around the page's own markup. The element opens the task through `host.tasks` and closes it when it leaves the page;
- gets the handle with `consumeTask(element, callback)` from an element inside it, and draws from `handle.state`: `status`, `actions` (each with `enabled` and, when it is not, a `reason`), `values`, `work`, `taken` and `busy`;
- acts through the handle: `setValues({ note })` as the person types, `submit(actionId)` for a decision, `claim()` for **Claim**.

Things to notice:

- **A locked action keeps its place.** The button is `aria-disabled="true"` with its reason in text beside it, `aria-describedby` naming that text. The page translates each reason (`claim_first`, `held_by_other`, …) itself, in English and Vietnamese.
- **The page can get from locked to enabled without leaving.** A group task is unclaimed, so its actions are locked with `claim_first` until the person presses **Claim**.
- **A refusal is shown, not swallowed.** A rejected `submit` or `claim` carries `problem`: the server's `title`, or, with `status` 0, the reason the host refused before sending.
- **The note travels in the step's output.** A packaged Human step has no form of its own, so what `setValues` holds is submitted with the decision and the workflow reads it as `nodes.review.output.note`.
- **Four notices** stand in for the form: the task is not one of this app's (`not_found`), it is already decided (`finished`, naming the action when it is known), AgentFlow could not load it (`error`; the handle keeps trying on focus and on the task-list nudge), or the host offers no tasks.

The module uses no framework: it creates the elements with `document.createElement`, and the buttons, the notices and the textarea are the kit's classes (`@reflexify/agentflow-elements/kit`), whose stylesheet goes into the module's shadow root before its own.

The module runs inside AgentFlow, so try it through a sandbox or an install of the package; it has no page of its own.

## Commands

From the SDK's root folder, run `pnpm install` once, then build the packages this example uses (`pnpm --filter @reflexify/agentflow-sdk build`, `pnpm --filter @reflexify/agentflow-elements build`, `pnpm --filter @reflexify/agentflow-app-builder build`). Then run these in this folder:

| Command | What it does |
|---|---|
| `pnpm build` | Writes `package/` from `config/`, and builds the module into `package/ui/`. |
| `pnpm check` | Checks that the committed `package/` is what `config/` builds, and that the module builds, and changes nothing. |
| `pnpm test` | The module's tests, then the same check. |

The builder's README documents `config/` and the other commands (`seal`, `lint`, `deploy`).
