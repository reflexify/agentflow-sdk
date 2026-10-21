---
name: agentflow-app-authoring
description: Use when turning requirements into an AgentFlow app's config/ (manifest, parameters, entities, access, rules, stage model, work, workflows, agents and skills) with @reflexify/agentflow-app-builder.
---

# Authoring an AgentFlow app's `config/`

An AgentFlow app package is written by hand as `config/` plus `agentflow.app.mjs`. The builder,
`@reflexify/agentflow-app-builder`, turns them into `package/`: a `manifest.json` and one JSON file per object
under `objects/<kind>/`. That is what AgentFlow installs. You never write `package/` yourself.

The guide's page for writing an app, for readers without an agent, is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/viet-ung-dung` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/viet-ung-dung`).
`<AGENTFLOW_URL>` is the address your team opens AgentFlow at, the same one the `AGENTFLOW_URL` variable holds
(`agentflow-app-release` skill); ask your org admin if you do not have it yet.

This skill covers what goes in `config/`. Building, sealing, checking against AgentFlow (`lint`), deploying
(`deploy`, then an admin approves) and every CLI refusal code are in the `agentflow-app-release` skill. Converting an app made in AgentFlow's designers is in `agentflow-from-draft`.

## Before you start

You need a project. If there is none, make one from the starter (the `agentflow-app-release` skill explains
each flag and the pnpm settings):

```bash
pnpm dlx --package "github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-app-builder" \
  agentflow-app init my-app --prefix acme --no-site
cd my-app && pnpm install && pnpm build
```

`pnpm dlx` fetches the builder from GitHub, so it needs the network. Offline, in any project where `pnpm install`
has run, the builder is in `node_modules`: `pnpm exec agentflow-app init ../my-app --prefix acme --no-site` does the same.

Starting from a clone of the template repository instead? It is the same case desk, still named
`acme/case-desk`, with its standalone site. Do not rename or strip it by hand: "Starting from a copy of the
template instead" in the `agentflow-app-release` skill makes the project `init` would have made.

The starter is the case desk, an app with one of each piece. Read its files before you write your own, and
copy their patterns:

| File | What it shows |
|---|---|
| `config/package-manifest.json` | identity, one group parameter (`app_users`), `requires`, `audience`, `ui`, `launcher` |
| `config/entities/case.json` | fields, a view, a create form, a grant with a record scope, a rule, a stage model |
| `config/build/open-case.mjs` | the "Open a case" workflow, written with the builder's workflow helpers, with a Human step |
| `agentflow.app.mjs` | what the build reads: the workflow modules, their publish order, the exposed steps |
| `src/module/module.tsx` | the optional UI module's entry, `mount(root, host)` |

Two larger examples are in the SDK repository (reflexify/agentflow-sdk on GitHub, at the same release tag),
under `examples/`: Projects (`examples/projects`: record-scoped access, many rules, stage models, work,
triggers, a dashboard) and the support desk (`examples/support-desk`: agents, skills, Code steps, email,
actions). Their files are cited by path inside each example; read them there when a pattern is not in the
starter.

## What a ceiling takes from a standalone site

Decide this before you design how a person creates a record. A standalone site that an admin registers with a
ceiling (Admin → Apps, **Ceiling** on its row) reaches only the entities and workflows the ceiling covers, at the
level it names. A ceiling covers no form, so the site cannot fetch an entity's create form:
`GET /entities/{id}/create-form` answers `403 APP_CEILING_DENIED`, and `GET /entities/{id}` leaves `create_form`
out. A UI module inside AgentFlow calls as the person and never meets this.

What a site uses instead, by what it needs:

- **List or read an entity's records** (a picker's options, a table): the entity at **Read**.
- **Create or change a record**: the entity at **Write**. `POST /entities/{id}/records` still works without
  the form: AgentFlow maps `form_payload` through the create form the site never sees, so the site writes the
  form's property keys (those of `create_form.schema.properties`) into its own screen by hand. Properties bound
  to a field the ceiling does not let it create are left out of the form it would see; a key the site sends for
  such a field is refused when the record is written. Keys the form does not bind are dropped.
- **Ask for something, then let a workflow do it**: the workflow at **Start and work**, started with
  `POST /workflows/{workflow_id}/instances` and `params`. The run may create and set any field its steps bind,
  and it is not filtered by the create form. This is the choice when the record needs fields the form does
  not carry, or a person must approve it (`workflows.md`, "Start forms").

When you write the RUNBOOK or the admin message, name the ceiling you need in these words: the entities with
their level, and the workflows at **Start and work**.

## The loop

Work in small steps, and let the builder tell you what is wrong.

1. Change one thing under `config/`: one entity, one rule, one workflow.
2. Run `pnpm build` (it runs `agentflow-app build`).
3. If it prints `wrote N package files`, go on with the next change.
4. If it prints a refusal, read it (below), fix that one place, and go back to step 2.
5. Before you commit, run `pnpm check` (`agentflow-app build --check`). Commit `config/` and `package/` together.

Never edit `package/` to make a refusal go away: the next build overwrites it, and `pnpm check` fails.

## Reading a refusal

A refusal is one line on stderr, `<CODE>: <file>#<JSON pointer>: <reason>`, and the exit code is 1:

```
BUILD_REFUSED: entities/case.json#/views/0/columns/4: nope is not a field of case
BUILD_REFUSED: entities/case.json#/access/grants/0/principal/id: ghost is not a group_ref parameter
BUILD_REFUSED: workflow open_case#/start_access/mode: a package cannot let everyone start a workflow
APP_FILE_INVALID: agentflow.app.mjs: add open_case to ORDER
APP_FILE_INVALID: agentflow.app.mjs: open_case: case (entity_record) has 0 outbound edges
CONFIG_VERSION_MISSING: config/package-manifest.json has no configVersion: add "configVersion": 1
```

- The file is relative to `config/`, except in `CONFIG_VERSION_MISSING`, which names the file and what to add. For code it names the object instead: `workflow <key>`, `trigger <name>`,
  `action <name>`.
- The pointer is RFC 6901: `/views/0/columns/4` is the fifth column of the first view. `~1` stands for `/`.
- A reference that names nothing is reported against the output file, `objects/entity/case.json#/…`. Find the
  same pointer in the config file that makes that object.
- `BUILD_REFUSED` is a config problem. `APP_FILE_INVALID` is a problem in `agentflow.app.mjs` or in a workflow
  graph, which `merge` checks when that file loads.

The reasons fall into a few kinds. Each tells you what to do:

| The reason says | It means | Do |
|---|---|---|
| `a member the builder has no rule for`, `not a member the package's entity_field lists` | a misspelt or unsupported member | use a member the reference files list; the builder never drops one silently |
| `one of …`, `must be an array`, `1 to 20 leaves` | a value of the wrong shape | write the shape the message names |
| `x is not a field of case`, `x is not a group_ref parameter`, `… names no object, parameter or required entity of the package` | a name that does not resolve | add the field, parameter or object, or fix the name |
| `an authoring reference the builder does not know`, `holds a hyphen`, `a string starting with @ reads as a sentinel` | a malformed reference | see References below |
| `is kase, not case`, `notes.txt is not a .json file`, `missing` | a file problem | rename the file, remove it, or add the member |
| `a package grants to a group or everyone only`, `never carries design authority` | a policy no package may hold | see `reference/access.md` |
| `has 0 outbound edges`, `loop through a -> b`, `unreachable x` | a broken workflow graph | see `reference/workflows.md` |

## The layout

```
agentflow.app.mjs           what the build reads: the workflow modules, ORDER, entityOrder, exposedSteps, ui
config/
  package-manifest.json     the manifest's own members, starting with "configVersion": 1
  entities/<key>.json       one file per entity: fields, views, form, access, rules, stage model, work
  agents/<key>.json         one file per agent
  skills/<name>.SKILL.md    one file per skill an agent loads
  dashboards/<key>.json     one file per dashboard
  code/<name>.js            Code step sources, read by path from a workflow
  build/<name>.mjs          workflows, triggers and entity actions, in code
package/                    built output: never edit it
```

- `entities/`, `agents/` and `dashboards/` hold only `.json` files, and `skills/` only `.SKILL.md` files. Any
  other file is refused (`entities#: notes.txt is not a .json file`). Dotfiles are ignored.
- A file's name, without its extension, equals its `key`.
- `agentflow.app.mjs` default-exports `defineApp({ sections, entityOrder?, exposedSteps?, ui? })`. The case desk's:

```js
import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as openCase from "./config/build/open-case.mjs";

export default defineApp({
  sections: merge([openCase], ["open_case"]),
  exposedSteps: { open_case: ["review"] },
});
```

## References

Parts of the package refer to each other by name. In entity, agent and dashboard files and in workflow
modules, a string that is exactly one reference becomes the platform's sentinel for it:

| Write | Names |
|---|---|
| `${entity:case}` | an entity of the package |
| `${workflow:open_case}` | a workflow, by its `key` |
| `${agent:triage}` | an agent file's key |
| `${skill:account-access}` | a skill, by the `name` in its frontmatter |
| `${param:app_users}` | a parameter the manifest declares |
| `${dashboard:projects_overview}` | a dashboard file's key |
| `${entity_view:task/open}` | a view of an entity, written entity/view |

The rules:

- **Whole strings only.** `"${param:app_users}"` is a reference. `"Case for ${param:app_users}"` is refused
  with `an authoring reference the builder does not know`. A workflow that needs a parameter's value inside
  text reads it into a variable first (`readParameters`, in `reference/workflows.md`).
- Text members that are carried unchanged (an entity's or a workflow's `name` and `description`) are not
  translated: a `${…}` there ships as literal text. Do not write one there.
- Keys are lowercase, start with a letter, and hold letters, digits and `_`. Only a skill name may hold `-`;
  any other key with a hyphen is refused (`entity key my-case holds a hyphen`).
- No string may start with `@`, and no member name may hold `${`.
- The two platform entities are written by id: Users `ffffffff-0000-0000-0000-000000000001`, Units
  `ffffffff-0000-0000-0000-000000000003`. List `user` or `org_unit` in the manifest's `requires.entities`
  when you use them, as the examples do.
- `package-manifest.json` is not translated, except its `launcher`. In its other members write the sentinel
  itself: `"audience": "@param:app_users"`.

## From requirements to `config/`

1. **Write the product down first.** List the entities and their fields; who may read, create, change, assign
   and delete each one; the status values and who makes each move; what happens automatically (workflows
   and their triggers); and what people see (views, the create form, a dashboard, launcher entries).
2. **Choose the parameters.** Every id that differs per organization is a parameter: the audience group, one
   group per role that needs organization-wide access, a service principal for the workflows a trigger starts and a
   group that holds it. See `reference/manifest.md`.
3. **Write `config/package-manifest.json`.** See `reference/manifest.md`.
4. **Write one `config/entities/<key>.json` per entity**: fields in an order where a formula comes after
   what it reads, views, the create form. See `reference/entities.md`.
5. **Write access as grants.** There is no admin bypass. See `reference/access.md`.
6. **Write rules** for what grants cannot say, and **stage models** for status fields. See
   `reference/rules-and-stages.md`.
7. **Write `work`** for an entity people are assigned to. See `reference/work.md`.
8. **Write workflows, triggers and actions** in `config/build/`, and list them in `agentflow.app.mjs`. See
   `reference/workflows.md`.
9. **Write agents and skills** if the app uses AI. See `reference/agents-and-skills.md`.
10. **Write dashboards and launcher entries.** See `reference/dashboards-and-launcher.md`.
11. **Build after each step**, as in The loop. Then read `reference/pitfalls.md` against what you wrote:
    each entry is a mistake that builds cleanly and fails later.
12. **Raise `version`** in `config/package-manifest.json` before you seal a release, then lint and deploy it:
    `deploy`, then an admin approves (the `agentflow-app-release` skill). Before the
    first deploy, send your org admin what "What to send your org admin" in the `agentflow-app-release` skill
    lists: the CI keys and the parameters. The guide's pages for this step are `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/kiem-tra-va-trien-khai` (deploying) and `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/khoa-ky` (your signing key); Vietnamese: the same without `en/`.

## Which reference to read

| You are writing | Read |
|---|---|
| `package-manifest.json`, parameters, `requires`, `audience`, `configVersion` | `reference/manifest.md` |
| an entity: fields, views, the create form | `reference/entities.md` |
| who may do what: `access`, grants, record scopes | `reference/access.md` |
| `rules`, `stage_model` | `reference/rules-and-stages.md` |
| `work`: lifecycle, assignment, priority, deadlines | `reference/work.md` |
| workflows, who they run as, start forms, Human steps, triggers, actions, `agentflow.app.mjs` | `reference/workflows.md` |
| each kind of step a workflow may use | `reference/steps.md` |
| agents and their skills | `reference/agents-and-skills.md` |
| dashboards, the `launcher` member, the `ui` member | `reference/dashboards-and-launcher.md` |
| the standalone site (`server/`, `src/`, `.env`, `RUNBOOK.md`) | `reference/site.md` |
| a final review, or a behaviour you did not expect | `reference/pitfalls.md` |

The builder's own README, `node_modules/@reflexify/agentflow-app-builder/README.md`, is the full contract
of the format.

## What the builder checks, and what it does not

The builder refuses what it has no rule for, so a config it accepts uses only real members, resolving
references and the policies a package may hold. It does not check every value against the platform: an
icon name, a formula expression or a field `type` is passed through. AgentFlow verifies the package again
when it is installed, and may refuse what the builder accepted. Write values the examples use, and keep
to the shapes in the reference files.

## Before you hand off

- `pnpm build` prints `wrote N package files`, and `pnpm check` prints `package/ matches the config`.
- Every parameter has a `label` and a `help` that tells the installer what to choose and what role its
  members need.
- You have read `reference/pitfalls.md` against your config.
- `version` is raised if the package changed since the last sealed release.
- When you can reach an AgentFlow deployment, `pnpm exec agentflow-app lint` prints `no problems`.
