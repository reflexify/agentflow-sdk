# Changelog

Each release of the AgentFlow SDK is a tag `sdk-vX.Y.Z` on both
`reflexify/agentflow-sdk` and `reflexify/agentflow-app-template`. Its section says which
`configVersion` and package `formatVersion` it writes, the oldest AgentFlow platform version
it needs, and the result of running the skills on a fresh copy of the template.
Its `Skills dry run:` line names every skill the dry run covered, and the release check refuses a line that leaves out a skill the plugin ships.

## sdk-v0.2.0

configVersion: 1
formatVersion: 1
minPlatformVersion: 2026.10
Skills dry run: 2026-10-20, three passes on a fresh copy of the template — agentflow-app-authoring, agentflow-ui-module, agentflow-from-draft and agentflow-app-release (build, keygen, seal, lint and deploy to a local deployment, the admin's approval, the install and a workflow run); the fixes are in this release.

The first release: the agentflow-app CLI (init, init --from, build, keygen, seal, lint, deploy; lint and deploy read AGENTFLOW_URL and AGENTFLOW_TOKEN, and keygen refuses key ids outside letters, digits, `.`, `_` and `-`), the TypeScript seal, the case desk as the starter, the agentflow plugin's four skills, and the UI module design guide (packages/agentflow-elements/DESIGN.md). AgentFlow checks that a sealed package is intact and installs any that is: the key id a package names and its id's prefix are claims it does not check, the admin's approval of each install is the gate, and a leaked key changes nothing (keep keys private anyway, they are how you seal). The builder refuses a start form's or create form's `x-entity` that is not an entity of the package, `user` or `org_unit`.
