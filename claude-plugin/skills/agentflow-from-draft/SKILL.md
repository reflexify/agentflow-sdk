---
name: agentflow-from-draft
description: "Use when moving an app built in AgentFlow's designers into code: converting a draft zip from Admin → Apps → Pack with agentflow-app init --from, then rewriting the converted workflows with the ./workflow helpers."
---

# Moving a designer-built app into code

The guide page for readers without an agent is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/tu-trinh-thiet-ke` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/tu-trinh-thiet-ke`). `<AGENTFLOW_URL>` is the address your team opens AgentFlow at.

An app made in AgentFlow's designers can be packed into a **draft**: a zip of the package's files, not
signed. `agentflow-app init --from` turns that draft into an SDK project whose `config/` builds the same
package. You then rewrite the converted workflows with the builder's helpers, one at a time, proving after
each one that the package has not changed.

What goes in `config/` is the `agentflow-app-authoring` skill; building and sealing is
`agentflow-app-release`.

## 1. Download the draft

In AgentFlow, an admin opens **Admin → Apps → Pack**, packs the app, and downloads it **with no signing
key**. That gives the draft zip. A package sealed with a key is refused:

```
DRAFT_INVALID: this is a sealed package, not a draft: use Admin → Apps → Pack with no key
```

## 2. Convert it

```bash
pnpm dlx --package "github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-app-builder" \
  agentflow-app init my-app --from ./draft.zip
cd my-app && pnpm install && pnpm build && pnpm check
```

`pnpm dlx` fetches the builder from GitHub, so it needs the network. Offline, in any project where `pnpm install`
has run, the builder is in `node_modules`: `pnpm exec agentflow-app init ../my-app --from ./draft.zip` does the same.

- The folder must be new or empty (`INIT_DIR_NOT_EMPTY` otherwise).
- `--from` takes no `--prefix`, `--key`, `--no-ui` or `--no-site`: the draft holds the package id, and a
  converted project has no standalone site. Passing one is a usage error (exit 2).
- **It checks itself.** It builds the converted project and compares the result with the draft. Only if
  every file comes back the same does it write the folder; on any refusal it writes nothing.
- It prints `created /abs/my-app from /abs/draft.zip (91 files)` and the next commands.

The folder is not a git repository. Run `git init` in it, then commit the converted project as it is, before you
change anything: it is your baseline.

## 3. What the project holds

| Draft | Project |
|---|---|
| `manifest.json` | `config/package-manifest.json`, with `"configVersion": 1` first and without the members the builder generates (`objects`, `grants`, `exports`, `features`) |
| an entity, its fields, views and create form, and its grants | `config/entities/<key>.json` |
| a workflow and its start grants | `config/build/workflows/<key>.mjs`, exporting `workflows` |
| a trigger | `config/build/triggers/<name>.mjs`, exporting `triggers` |
| an entity action | `config/build/actions/<entity>__<key>.mjs`, exporting `actions` |
| a Code step's source | `config/code/<workflow>-<step>.js`, which the step reads with `{ "$file": "code/<workflow>-<step>.js" }` |
| an agent | `config/agents/<key>.json` |
| a skill | `config/skills/<key>.SKILL.md`, whose `name` is the key |
| a dashboard | `config/dashboards/<key>.json` |
| the UI module, if any | `ui/built/`, byte for byte, with `ui/README.md` saying it is built output |

Beside them: `agentflow.app.mjs`, which imports every module, lists `ORDER` and `entityOrder`, and adds
`ui: { prebuilt: "ui/built" }` when there is a module; the built `package/`; and the project files from the
starter (`package.json`, `pnpm-workspace.yaml`, `.gitignore`, `README.md`, `AGENTS.md`, `CLAUDE.md`).

- Every `@obj:…` and `@param:…` in the draft comes back as a reference, `${entity:task}` or `${param:x}`.
- Each `.mjs` module is the graph as it was packed: `export const workflows = { … };` holding plain JSON.
  It is valid builder input, ready to be rewritten.
- The draft lists the manifest's objects and grants sorted by key, so the converted project keeps that
  order: `entityOrder` and the grants come out sorted, and `ORDER` is sorted with each workflow after the
  workflows it calls. That is expected.

## 4. When the conversion is refused

- **`DRAFT_INVALID`**: the file is not a draft. It cannot be read, it is not a zip, it has no `manifest.json`,
  or it is a sealed package. Download it again from Pack, with no key.
- **`DRAFT_UNSUPPORTED`**: the draft holds something the builder cannot write. The message names the draft
  file and the place, `<file>#<pointer>: <reason>`. For example:
  `objects/entity/case.json#/access: the entity has no access member; the builder writes access as "everyone" or "restricted": …`. The builder does
  not write a `relationship`, a `document_template` or a `client`; non-empty `exports` or `features`; a
  create form with a layout other than a plain vertical one; or a sentinel it never writes in that place.
  Change the app in the designers so that it no longer uses the form named (here, give the entity an access
  mode, `everyone` or `restricted`), pack it again, and convert again. The designers are an org admin's: ask
  the admin who packed the draft. Do not patch the zip yourself, since the converted app would then not be the
  admin's app.
- **`DRAFT_REBUILD_DIFFERS`**: the converted project builds, but not into the same package; the message
  lists where it differs, as `manifest.json#/grants` (a few members, then "and N more"). Nothing was written. Report it to the AgentFlow team with that list; do not
  try to convert by hand.

## 5. Rewrite one workflow with the helpers

The converted modules work, but they are hard to read and to change. Rewrite them with
`@reflexify/agentflow-app-builder/workflow`, one module at a time, keeping the package exactly the same.

**Before you start**, keep a copy of the package you will compare against:

```bash
pnpm build && cp -R package ../package-before
```

**Then, for one module:**

1. Open `config/build/workflows/<key>.mjs`.
2. Replace the JSON with helper calls (the table below). Keep every step id, step name, edge id, value and
   order exactly as they are.
3. Run `pnpm build`. Fix any refusal.
4. Compare the new `package/` with the copy, as JSON values. The builder writes members in the order your
   source gives them, so the bytes change while the values must not:

```bash
node -e '
const fs = require("fs"), path = require("path");
const [a, b] = process.argv.slice(1);
const files = (d, p = "") => fs.readdirSync(path.join(d, p), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? files(d, path.join(p, e.name)) : [path.join(p, e.name)]));
const norm = (v) => Array.isArray(v) ? v.map(norm) : v && typeof v === "object"
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])])) : v;
const read = (f) => JSON.stringify(norm(JSON.parse(fs.readFileSync(f, "utf8"))));
const all = new Set([...files(a), ...files(b)].filter((f) => f.endsWith(".json")));
const differ = [...all].filter((f) => !fs.existsSync(path.join(a, f)) || !fs.existsSync(path.join(b, f))
  || read(path.join(a, f)) !== read(path.join(b, f)));
console.log(differ.length ? "differ: " + differ.join(", ") : "same package");
' ../package-before package
```

5. `same package`: run `pnpm check` (it prints `package/ matches the config`), commit `config/` and
   `package/` together, and go on to the next module. `differ: objects/workflow/<key>.json`: compare that
   file with the copy, find the member that changed, fix the source, and go back to step 3.

| Converted JSON | Helper |
|---|---|
| `"run_as": { "policy": "initiator" }` | `INITIATOR` |
| `"run_as": { "policy": "service_principal", "service_principal_id": "${param:x}" }` | `servicePrincipal("x")` |
| `"start_access": { "mode": "restricted", "group_ids": [] }` | `NOBODY` |
| `"start_access": { "mode": "restricted", "group_ids": ["${param:a}"] }` | `restricted("a")` |
| a start step with an entity `subject` | `start({ subject: "${entity:task}" })` |
| a start step with `"params": { "kind": "schema" }` | `start({ params: true })`, and the `input_schema` as `workflow()`'s last argument |
| an `entity_record` step, `"operation": "get"` | `getById(id, name, entity, "subject.record_id")` |
| `"operation": "update"` with a `body` | `update(id, name, entity, idPath, [bind(field, …)])` |
| a body item `{ "field", "kind": "reference", "value" }` | `bind(field, ref(value))`; `template` is `tpl`, `literal` is `lit` |
| a body item `{ "field", "kind": "literal", "value": "text" }` (a string) | `bind(field, lit("text"))` |
| a body item `{ "field", "kind": "literal", "valueJson": 5 }` (a number, boolean, null, array or object) | `bind(field, lit(5))`: `lit` writes `value` for a string and `valueJson` for anything else, so write the JSON value, not its text |
| `"operation": "update_many"` with `filters` and a `body` | `updateMany(id, name, entity, [flt(field, op, ref(...))], [bind(field, …)])`; each filter is `{ "field", "op", "value" }` and `flt(field, op, value)` writes it as is, so a filter value read from the run is `ref(path)`'s object |
| a `decision` with branches | `decision(id, name, [when(edge, condition), otherwise(edge)])` |
| an `end` with `outcomeLabel` | `end(id, name, outcome)` |
| `"edges": [{ "id", "from", "to" }]` | `edges([id, from, to], …)` |
| any other step | `node(id, name, nodeType, parameters, settings)`, with `parameters` less its `id` and `label` |

`graph(name, nodes, edges)` writes `start: "start"` and lists every End step as `end`, so it fits a graph
whose start step's id is `start`. `workflow()` writes `output_schema: null`; for a workflow with an output
schema, spread its result and set `output_schema`. When a helper cannot say what the JSON says, keep that
part as JSON: the comparison is what counts.

**Keep a whole module as converted when** its start step's id is not `start` (a draft's may be `s`: the helpers
cannot write another, and the comparison says `differ` with the id changed); or the workflow has no `name` or
`description` (`workflow()` always writes both, so the comparison says `differ` with them added; AgentFlow names
such a workflow by its key, which is what the converted JSON gives it); or its start step carries members `start()`
does not write; or any other step or member has no helper. A module left as JSON is valid builder input and builds
the same package. You may still replace a single step inside it with `node(...)` once the comparison says `same
package` for that edit.

### Before and after: "Stamp completion"

Converted from Projects' draft, `config/build/workflows/<key>.mjs` for the key `stamp_completion` begins
like this (abridged):

```js
export const workflows = {
  "stamp_completion": {
    "key": "stamp_completion",
    "name": "Stamp completion",
    "description": "Sets a task's completed_at when it enters done, and clears it when it leaves done.",
    "run_as": { "policy": "service_principal", "service_principal_id": "${param:automation_principal}" },
    "start_access": { "mode": "restricted", "group_ids": [] },
    "input_schema": null,
    "output_schema": null,
    "graph": {
      "schemaVersion": "1.0",
      "start": "start",
      "end": ["finish"],
      "nodes": [
        { "id": "task", "name": "Read the task", "node_type": "entity_record",
          "parameters": { "entityId": "${entity:task}", "id": "task", "label": "Read the task", "operation": "get",
            "recordIdExpr": { "kind": "reference", "value": "subject.record_id" } }, "settings": {} }
      ]
    }
  }
};
```

Rewritten with the helpers, as Projects writes it (its `config/build/stamp-completion.mjs`):

```js
import {
  NOBODY, NOW, bind, decision, edges, end, getById, graph, otherwise, ref, servicePrincipal, start, update, when, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const TASK = "${entity:task}";
const CLEAR = ref("");

export const workflows = {
  stamp_completion: workflow(
    "stamp_completion", "Stamp completion",
    "Sets a task's completed_at when it enters done, and clears it when it leaves done.",
    servicePrincipal("automation_principal"), NOBODY,
    graph("Stamp completion", [
      start({ subject: TASK }),
      getById("task", "Read the task", TASK, "subject.record_id"),
      decision("is_done", "Done?", [
        when("e_done", { "==": [{ var: "nodes.task.output.record.status" }, "done"] }),
        otherwise("e_not_done"),
      ]),
      update("stamp", "Stamp completion", TASK, "subject.record_id", [bind("completed_at", NOW)]),
      update("clear", "Clear completion", TASK, "subject.record_id", [bind("completed_at", CLEAR)]),
      end("finish", "Finish", "completed"),
    ], edges(
      ["e_start", "start", "task"], ["e_read", "task", "is_done"],
      ["e_done", "is_done", "stamp"], ["e_not_done", "is_done", "clear"],
      ["e_stamped", "stamp", "finish"], ["e_cleared", "clear", "finish"],
    )),
  ),
};
```

The comparison prints `same package`. Once every module is rewritten, you may move a workflow's trigger into
its module (Projects' file also exports `triggers`) and rename the files: update the imports in
`agentflow.app.mjs`, and the comparison must still say `same package`.

## 6. The prebuilt UI module

A draft carries its UI module only as built files, so the project copies `ui/built/` into `package/ui` on
every build (`ui: { prebuilt: "ui/built" }` in `agentflow.app.mjs`). It is not source: do not edit it.

To change the module, replace it with source:

1. Write the module's source in the project, with a Vite config that builds it as one ES entry named
   `index.js` ending in `export { mount };`. The starter's `src/module/` and `vite.module.config.ts` are a
   working example: make a project with `agentflow-app init` to copy them from, with their dependencies.
2. `pnpm add -D vite`, and the module's own dependencies.
3. In `agentflow.app.mjs`, remove `ui: { prebuilt: "ui/built" }` (the build then uses
   `vite.module.config.ts`), or write `ui: { viteConfig: "<your config>" }`.
4. Delete `ui/built/` and `ui/README.md`, then `pnpm build`.

This is the one change that is meant to alter the package: the module is now yours. Raise `version` before
you seal it.
