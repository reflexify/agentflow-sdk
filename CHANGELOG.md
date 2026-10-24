# Changelog

Each release of the AgentFlow SDK is a tag `sdk-vX.Y.Z` on both
`reflexify/agentflow-sdk` and `reflexify/agentflow-app-template`. Its section says which
`configVersion` and package `formatVersion` it writes, the oldest AgentFlow platform version
it needs, and the result of running the skills on a fresh copy of the template.
Its `Skills dry run:` line names every skill the dry run covered, and the release check refuses a line that leaves out a skill the plugin ships.

## Unreleased

## sdk-v0.4.0

configVersion: 1
formatVersion: 1
minPlatformVersion: 2026.10
Skills dry run: 2026-10-24, three passes on fresh copies of the template — agentflow-app-authoring, agentflow-ui-module, agentflow-from-draft and agentflow-app-release (an equipment-loan and a room-booking app, each with a contract-2 module that calls `host.assistant`; `tracker.zip` and `case-desk.zip` through `init --from`; build, types, keygen, seal; lint; the sandbox loop with a black-box test through a Human step using `waitForTask` and `completeTask`; `status`; publish and withdraw in the app catalog; deploy to a local deployment, the admin's approval, the install and turning on its trigger); about 50 findings, the fixes are in this release.

App contract 2: `AppHost` gains an optional `assistant` member, `setContext({ entity, record } | null)`, which tells
AgentFlow's docked assistant which record the person has open; the module names its own entity key and the record id,
and AgentFlow reads the record's name itself. `APP_CONTRACT_VERSION` is 2 and `contractVersion` is typed `2`, so a
host written against 0.3.0 that sets `contractVersion: 1` no longer type-checks; set it from `APP_CONTRACT_VERSION`.
`defineModuleElement` forwards `assistant`; the standalone host has none, so call it as `host.assistant?.setContext(…)`.
A package whose module calls it declares `ui.contract: 2`, which an AgentFlow built before contract 2 refuses at `lint` and at upload (as `manifest_invalid` at `manifest.json`;
no platform version or route tells such a build apart, and contract 2 is in no tagged AgentFlow release yet: run `lint` with `contract: 2`, then with `1`, and if only 1 passes the deployment predates contract 2, so declare 1). An install of a contract-2 package makes the AgentFlow release that knows contract 2 the platform's rollback floor.

`build` (and `init --from`) now refuses a package that built on 0.3.0, so a project that builds there may stop building here. Each new refusal names the file and the place, as `entities/loan.json#/views/0/filters/1/op: <message>`:

- `ui`: `package-manifest.json#/ui/kind: must be module`, `package-manifest.json#/ui/contract: one of 1, 2`, and `ui` that is not an object.
- A view's `filters` entry or a preset rule: `<field> is not a field of <entity>`; `<field> is not a reference field of <entity>, so it has no target to filter through` (a `reference.field` hop through a field that is not a reference); `<field> refers to users, groups or units, whose fields a filter cannot reach`; `<op> does not suit <field> of <entity>, a field of type <type>: use <the operators the type takes>`; `<value> is not a date window: use today, this_month, this_quarter, this_year or last_<n>_days (n from 1 to 3660, no leading zero)` for a `within` value; and a value of the wrong shape (`in takes an array of values`, `between takes a [low, high] array`, `range_any takes an array of [from, to] intervals`).
- A preset rule that hops through a reference: `<field> goes through a reference: a preset filters the view's own fields, so put it on the view's filters`.
- **Breaking:** `{ "$bind": … }` in a fixed `filters` entry: `a fixed filter compares as written and never resolves $bind: put the filter in a preset in config.presets`. It built and installed on 0.3.0 (the 0.3.0 README said such a value is "compared as text"), and the view listed nothing; move the rule into a preset in `config.presets`, or use a record scope in the grant.
- `init --from` runs the same build on the converted project, so a draft that holds any of the above is refused as `DRAFT_UNSUPPORTED` and nothing is written.

`sandbox check` and `deploy --sandbox` now compare `install.parameters` in `sandbox.json` with the parameters of `package/manifest.json` (build first: they read the package as built) and refuse, as `SANDBOX_SPEC_INVALID` naming the key, a key the manifest does not declare, a value of the wrong kind (`@person:` for a `group_ref`, a string for a `number`, a value that is not one of an `enum`'s options), an explicit `null`, and an `@kind:` reference for a `secret_ref`, `sla_policy_ref` or `escalation_policy_ref` (the sandbox cannot create those; give an id). A required parameter with no default and no value is a warning. `deploy --sandbox --file` does not make the comparison.

`build` warns, and exits 0, about a launcher entry whose icon is not one of AgentFlow's icons (it installs and draws a dot), suggesting the nearest name. `build --json` and `init --from --json` carry the lines in a `warnings` member, which is absent when there are none. The starter template's README and AGENTS.md open with a note on making your project, and it now gives one command form: `pnpm exec agentflow-app init ../<your-app>`.

`init --from` warns, and exits 0, when the draft's UI module is the empty stub a draft without a screen carries (a `mount` that returns a no-op): the launcher entry that opens it would show a blank page. The line is in `warnings` of `init --from --json`, with the icon warnings. Replace the module, or remove `ui` and the entries that open it (the `agentflow-from-draft` skill).

A skill's frontmatter refusal (`BUILD_REFUSED: skills/<file>#: frontmatter line is not a plain "name: value" or "description: value"`) now names the rule that broke: a value that starts with a quote or other YAML syntax, holds `: ` or ` #`, or ends with `:`, or a key other than `name` and `description`. What it accepts is unchanged. The template's README and AGENTS note names `init --no-site` and `--no-ui`.

A failed deployment says why: its `problem.detail` reads `the install run <id> failed: <reason>`. `GET /app-deployments/{id}` no longer answers `409 APP_RELEASE_UNAVAILABLE` when the release cannot be loaded: it answers `200` with `release: null`, so `AppDeploymentDetailDto.release` is now nullable, and `deploy --wait` ends with `DEPLOY_FAILED` and that reason instead of stopping on the 409. A TypeScript client must handle a null `release`.

`agentflow-app status` reads where this package's deployments stand, and changes nothing: the newest 10 deployments of the package in `package/manifest.json`, a failed one's code and reason, and the sandbox in `.agentflow/sandbox.json`, `live` (its deploy key still works), `gone` (expired or deleted), `elsewhere` (made on another deployment, not checked) or `unknown` (the check got another answer); exit `1` when the newest failed. `deploy` says `the last deployment of <id> <version> failed: …; this is a new one` when the newest deployment of that version had failed, and `--json` carries it as `previous`.

`status` prints one more thing and one less. An installed deployment shows its installation id and no link (its approval page is long past); a deployment awaiting approval shows `approve: <link>`, and a failed, cancelled or installing one `setup page: <link>`. With no `.agentflow/sandbox.json` the last line says `no sandbox here` (`--json` still has `"sandbox": null`): `sandbox delete` removes the file for this folder's sandbox, so `gone` means the sandbox expired or was deleted from another folder or with `--id`, and the file is left. The `gone` line says so.

Every message that told you to run `agentflow-app <command>` now names a command a project can run, since the bare name is not on a project's PATH: `PACKAGE_STALE`, `PACKAGE_MISSING`, the missing UI entry and a package/ without an object's body say `run pnpm build`, `SEAL_MISSING` says `run pnpm seal`, and `TYPES_STALE`, the sandbox hints (`sandbox list`, `sandbox open`, `sandbox delete`, `deploy --sandbox`, in the CLI and in the test kit's errors) say `pnpm exec agentflow-app <command>`. The first line of `src/generated/app.ts` and the `test` script, which run it from a script, are unchanged.

The test kit's `idsByKey<K>()` takes the package's `LogicalKey`, and its result is then typed `Record<K, string>`; without `K` it is `Record<string, string>` as before. `getAppObjects<K>` works for module code only: from a sandbox test's `as(handle)` client it is refused with `APP_CALLER_REQUIRED`, so a test uses `idsByKey<LogicalKey>()`. `waitForTask` waits 120 s unless given `{ timeout }`; the sandbox-testing sample passes 60 s, so its `testTimeout` of 180 s holds the task wait, the record poll and 60 s of room.

`upgrading-the-sdk.md` gains the steps for a project made from an older starter to adopt the generated types: run `types`, commit `src/generated/app.ts`, and append `agentflow-app types --check` to `test` when the project has a UI module.

The test kit gains `waitForTask(client, stepKey, recordId)`, which polls the person's live work until the task at a step on a record is there, and `completeTask(client, task, action, { payload })`, which claims it when nobody holds it and submits the action (a payload `_action` never overrides it).

`getAppObjects<K>(client)` and `AppObjects<K>` take the package's logical keys (`LogicalKey` from `agentflow-app types`): `find`, `id` and `satisfies` then refuse another key at compile time, except with `{ source: 'bound' | 'exported' }`. Without `K` they take any string, as before, and an `AppObjects<K>` is assignable to a plain `AppObjects`.

The starter ships `src/generated/app.ts`, and its `test` script ends with `agentflow-app types --check`; `init` keeps both only when the project has the UI module, and writes the project's id into the file.

`build --check` (and so `lint` and `deploy --sandbox`) compares `package/ui` with the module as `build` writes it, byte for byte: the `prebuilt` folder, or a Vite build into a temporary `.agentflow/ui-check-*` folder, as deep as `package/ui` so source maps match. `pnpm check` compares package/ui with the module when package/ui exists, so a module that was changed and not built is `PACKAGE_STALE`; with no `package/ui` (git ignores it) the check reports nothing for the module, and `seal` still refuses a module never built. Without a declared module, a leftover `package/ui` is now extra (`PACKAGE_STALE`): `pnpm build` removes it.

The mirror no longer carries `examples/support-desk` or `examples/projects`: each is its own repository now. The skills no longer point into them.

## sdk-v0.3.0

configVersion: 1
formatVersion: 1
minPlatformVersion: 2026.10
Skills dry run: 2026-10-23, two passes on fresh copies of the template — agentflow-app-authoring, agentflow-ui-module, agentflow-from-draft and agentflow-app-release (build, types, keygen, seal; lint; the sandbox loop with a black-box test through a Human step; publish and withdraw in the app catalog; deploy to a local deployment, the admin's approval and the install); 29 findings, the fixes are in this release.

Sandboxes: `agentflow-app sandbox create | delete | list | open | check` and `agentflow-app deploy --sandbox`, which
replaces the app's sandbox, installs the app as the cast's owner with the sandbox defaults, arms its triggers and
writes `.agentflow/sandbox.json`. The test kit `@reflexify/agentflow-sdk/testing` (`readSandbox`, `as`, `signInAs`,
`idsByKey`, `waitForRun`). The client's types gain the sandbox routes and `arm` and `objects` on an installation.
A deployment needs `SANDBOX_ORGS_ENABLED=true` and a key whose role holds `sandbox.create`.

`agentflow-app publish` and `agentflow-app withdraw`: publish a sealed package to the deployment's app catalog, and withdraw a version you published.

`deploy --wait` and `deploy --sandbox` say, when the install starts, that it usually takes a minute or two.

`init` writes a `tsconfig.node.json` with no site paths under `--no-site`, `keygen` prints a reminder to keep the private key secret, and the `SEAL_OUT_EXISTS` message says when deleting the file is safe.

App objects by key: `getAppObjects(client)` is one cache per client (`load`, `refresh`, `find`, `id`, `satisfies`,
`subscribe`) and `compareVersions` orders package versions. A client made by `createAgentFlowClient` reads the
`AgentFlow-App-Revision` header, and a cache with subscribers loads again when it is greater. `Caller.app` gains
`version`, `generation` and `staged_version`. The elements take `entity-key` (`agentflow-task-detail`,
`agentflow-record-table`) and `workflow-key` (`agentflow-start-form`) in place of an id. `agentflow-app types`
writes `src/generated/app.ts` from the package, `--check` fails with `TYPES_STALE` when it is behind.

`HostHarness` gains a required `setAppObjects(next)`, and the new host contract case needs the harness's API to
send `AgentFlow-App-Revision` on `GET /app/objects`: a host's harness must add both to keep compiling and passing.

The UI kit pins every `@tiptap/*` package to one exact version (3.31.4), so a project that adds its own `@tiptap/*` package must use that same version.

## sdk-v0.2.0

configVersion: 1
formatVersion: 1
minPlatformVersion: 2026.10
Skills dry run: 2026-10-20, three passes on a fresh copy of the template — agentflow-app-authoring, agentflow-ui-module, agentflow-from-draft and agentflow-app-release (build, keygen, seal, lint and deploy to a local deployment, the admin's approval, the install and a workflow run); the fixes are in this release.

The first release: the agentflow-app CLI (init, init --from, build, keygen, seal, lint, deploy; lint and deploy read AGENTFLOW_URL and AGENTFLOW_TOKEN, and keygen refuses key ids outside letters, digits, `.`, `_` and `-`), the TypeScript seal, the case desk as the starter, the agentflow plugin's four skills, and the UI module design guide (packages/agentflow-elements/DESIGN.md). AgentFlow checks that a sealed package is intact and installs any that is: the key id a package names and its id's prefix are claims it does not check, the admin's approval of each install is the gate, and a leaked key changes nothing (keep keys private anyway, they are how you seal). The builder refuses a start form's or create form's `x-entity` that is not an entity of the package, `user` or `org_unit`.
