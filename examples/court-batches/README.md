# Court batches

`acme/court-batches` is a small AgentFlow app for one organization shared by several courts, each court an
organizational unit. A clerk opens a batch of cases, a workflow opens the batch's dossier, and each court sees only its
own batches and dossiers, while the court administrators see every court's. Nobody picks a court: a record is filed in
the unit of the clerk who opens it. A batch's dossiers can also be added from a folder: one dossier per folder inside
it, each with that folder's files, filed in the batch's court. It has no site. Its UI module is two screens: the
batches, and for one batch the start form of that action.

## What to read

| File | What it shows |
|---|---|
| `config/entities/batch.json` | `"requires_unit_classification": true`, grants at `placement` and `organization`, and `work` that offers each open batch to the people of its court. |
| `config/entities/dossier.json` | A second classified entity, with a reference to its batch and a `court` field the workflow fills. |
| `config/build/open-dossier.mjs` | The workflow a new batch starts. Its create step files the dossier in the batch's unit (`destinationUnit: { from: "trigger" }`) and writes the court's name from a template. |
| `config/build/add-dossiers.mjs` | The "Add dossiers" action on a batch and its workflow: read the batch, group the files by folder, and create one dossier per folder in the batch's unit (`destinationUnit: { from: "trigger" }`, which a loop's child follows to the batch). |
| `src/module.ts` | The module: the batches, and for one batch `<agentflow-start-form entity="batch" record="…" action="add_dossiers">` inside an `<agentflow-provider>` given `host.api`. |
| `test/module.test.ts` | The module's test: the start form's wiring, and an upload that goes on after a reload. |
| `config/package-manifest.json` | The four parameters, `org_unit` and `user` in `requires.entities`, which let the workflows read a unit's name and pass a loop's child what it needs, and the `ui` and `launcher` members. |
| `sandbox.json` | Two courts, a clerk placed in each, and an administrator: what `agentflow-app deploy --sandbox` builds. |
| `package/` | What `config/` builds into. Committed, so a reviewer reads what ships. |

What to notice:

- **The entity is filed by unit.** `requires_unit_classification: true` gives every batch and dossier a unit, in the
  read-only `unit` field the platform adds. The views name it as a column. The create form does not bind it, because a
  record takes its creator's primary unit.
- **`placement` is the person's own unit.** The clerks' grants read, list, create and update at `placement`, so each
  clerk reaches the records of the unit they are placed in, and the same package serves every court. The
  administrators' grant is at `organization`. A clerk the organization has not placed in a unit reaches nothing and
  cannot open a batch.
- **The workflow names the unit.** It runs as the automation principal, which is not placed in any unit, so the default
  destination (the creator's unit) would have nowhere to file the dossier. `from: "trigger"` files it in the unit of the
  batch that started the run. The automation group's grants are at `organization` for the same reason.
- **A template reads the unit's name.** `{{ subject.record.unit.name }}` renders the name of the batch's unit, because
  the manifest lists `org_unit` with its `name` in `requires.entities`. Without that, the step is outside the app's
  ceiling, and the run fails with `APP_CEILING_DENIED`.
- **Dossiers from a folder.** `add_dossiers` takes one input, `files`, a list of files. Because a Group files step
  reads it at depth 1 and a For Each runs over the groups, the field takes a folder: a watched folder (or one folder
  inside it), a folder from the person's computer, or plain files, which arrive as a single folder and so make one
  dossier. A folder named `PN-01` with three files becomes one dossier holding its own copies of those three files.
- **A loop's child files with the batch too.** A child run of the For Each has no subject of its own, and
  `from: "trigger"` there follows the loop out to the run that started it: the dossier is filed in the batch's unit
  even when an administrator placed in another court adds it. The child binds `batch` from `parent.subject.record_id`.
  The batch's title is not among what a child reads of the run's subject, so the workflow reads the batch before the
  loop and the child writes the title from `parent.nodes.batch.output.record.title`.
- **A loop's child is told about the person who started the run.** What a child reads under `parent.` was read by
  the loop's step, and so was the starter's name and email, which every run carries. Through the app's ceiling a
  value is withheld unless everything it was read with is within the ceiling, so the manifest requires `user` with
  `name` and `email`. Without them `parent.subject.record_id` reads as nothing in the child, and the create fails
  with `missing required fields: batch`.
- **The run acts as whoever started it**, as every workflow a person starts does. A clerk adds dossiers to a batch of
  their own court with their `placement` grant, and the administrators hold `create` on dossiers at `organization`
  so that they can add them to any court's batch.
- **The module writes no picker.** Its screen is AgentFlow's start form for the batch's action, so the folder
  sources, the upload and the preview are AgentFlow's. The module only keeps the id of an upload the form says it
  started (`af-folder-upload-started`) in `sessionStorage`, by batch and field, and hands it back through the form's
  `resumeSets` property after a reload, so the upload goes on where it stopped.
- **Work goes to the record's unit.** On `start`, a batch's work goes to a pool at `{ "type": "record_unit" }`, so the
  people of the batch's court find it in My Work and can claim it, and the other court's clerks do not see it.

## Commands

From the SDK's root folder, run `pnpm install && pnpm build` once, to build the builder and the elements this example
uses. Then run these in this folder:

| Command | What it does |
|---|---|
| `pnpm build` | Writes `package/` from `config/`, and builds the module into `package/ui/`, which git ignores. |
| `pnpm check` | Checks that the committed `package/` is what `config/` builds, and changes nothing. |
| `pnpm test` | Runs the module's test, then the same check. |
| `pnpm exec agentflow-app sandbox check` | Checks `sandbox.json` against the built manifest, without calling AgentFlow. |

## Two courts in a sandbox

`sandbox.json` makes an organization with two units, `hanoi` and `saigon`, and three people:

| Handle | Placed in | Groups | Sees |
|---|---|---|---|
| `hoa` | `hanoi` | `court_users` | Hà Nội's batches and dossiers |
| `son` | `saigon` | `court_users` | Sài Gòn's batches and dossiers |
| `admin` | nowhere | `court_admins` | every court's (`admin` is also the sandbox's owner, who installs the app) |

With `AGENTFLOW_URL` set to your AgentFlow and `AGENTFLOW_SANDBOX_KEY` to a key that may make sandboxes:

1. `pnpm exec agentflow-app deploy --sandbox` makes the sandbox, installs the app as `admin`, and arms the trigger that
   starts the workflow.
2. `pnpm exec agentflow-app sandbox open --as hoa`, and open a batch in Court batches. Its dossier appears beside it,
   with Hà Nội court in its Court column, and the batch is in Hoa's My Work.
3. `pnpm exec agentflow-app sandbox open --as son`, and open another batch. Sơn sees his batch and its dossier, and none
   of Hoa's, and Hoa's batch is not in his My Work.
4. `pnpm exec agentflow-app sandbox open --as admin`: the administrator lists both courts' batches and dossiers.
5. As `hoa` again, open **Add dossiers** in the app's section of the sidebar, choose her batch and give it a folder
   with a folder per prisoner. Each becomes a dossier of that batch in Hà Nội court, which Sơn does not see. The
   administrator starts the same action from a batch's own page (**Batches**), for either court.
6. `pnpm exec agentflow-app sandbox delete` when you are done.

The builder's README documents `config/` and the other commands (`seal`, `lint`, `deploy`).
