# Changelog

Each release of the AgentFlow SDK is a tag `sdk-vX.Y.Z` on both
`reflexify/agentflow-sdk` and `reflexify/agentflow-app-template`. Its section says which
`configVersion` and package `formatVersion` it writes, the oldest AgentFlow platform version
it needs, and the result of running the skills on a fresh copy of the template.
Its `Skills dry run:` line names every skill the dry run covered, and the release check refuses a line that leaves out a skill the plugin ships.

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
