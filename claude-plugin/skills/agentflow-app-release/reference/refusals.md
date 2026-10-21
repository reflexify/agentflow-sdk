# Every refusal of the CLI, and of AgentFlow

The `agentflow-app` CLI prints a refusal as `<CODE>: <message>` on stderr (exit `1`; `2` for a usage error). Find the code below, read what it means, and do what the last column says. `lint` problems (lowercase codes such as `bare_key`) are in `lint-problems.md`.

## Printed by the CLI

| Code | Printed by | Means | Do |
|---|---|---|---|
| `USAGE` | any | an unknown command or flag, a missing argument, `--from` with `--prefix`, `--key`, `--no-ui` or `--no-site`, a `--parameters` or `--decisions` file that cannot be read or is not a JSON object, or a `--decisions` file holding anything but grant declines (exit 2) | read the usage it prints |
| `APP_FILE_MISSING` | `build` | no `agentflow.app.mjs` in this folder | run it in the project's folder |
| `APP_FILE_INVALID` | `build` | `agentflow.app.mjs` fails to load, takes a member `defineApp` does not, or a workflow graph is broken (`add open_case to ORDER`) | fix that file or that graph |
| `CONFIG_VERSION_MISSING` | `build` | no `configVersion` in `config/package-manifest.json` | add `"configVersion": 1` first |
| `CONFIG_VERSION_UNKNOWN` | `build` | a `configVersion` this SDK does not read | install the SDK release it names |
| `BUILD_REFUSED` | `build`, `lint` | a config problem, `<file>#<pointer>: <reason>`, or a file it cannot read | fix that place (the authoring skill) |
| `PACKAGE_STALE` | `build --check`, `lint` | `package/` is not what `config/` builds | run `pnpm build` and commit `package/` |
| `PACKAGE_MISSING` | `seal`, `deploy` | no `package/` | run `pnpm build` |
| `UI_TOOL_MISSING` | `build` | the manifest declares a UI module, and Vite is not installed | `pnpm add -D vite`, or remove `ui` |
| `UI_BUILD_FAILED` | `build` | Vite failed on the module | fix the module's error |
| `UI_ENTRY_MISSING` | `build`, `seal` | the built module has no `index.js`; from `seal`, the manifest declares `ui` and `package/ui/` was never built | make the Vite build write `index.js`; before `seal`, run `agentflow-app build` |
| `UI_ENTRY_INVALID` | `build` | `index.js` does not end with `export { mount };` | export `mount`, as the starter's module does |
| `UI_FILE_TYPE` | `build` | a built file the platform does not serve (it names the extensions allowed) | keep only those files, and no HTML |
| `KEY_EXISTS` | `keygen` | a key already exists there | keep it, or choose another `--key-id` |
| `KEY_ID_INVALID` | `keygen`, `seal` | an empty key id or one with whitespace; `keygen` also refuses an id outside letters, digits, `.`, `_`, `-` (at most 64, starting with a letter or digit) | use a plain name of that shape |
| `KEY_MISSING` | `seal` | no ed25519 key in `keys/`, or no file at `--key` | run `keygen`, or fix `--key` |
| `KEY_AMBIGUOUS` | `seal` | more than one ed25519 key in `keys/` | pass `--key <file>` |
| `KEY_PERMISSIONS` | `seal` | the key file can be read by others | run the `chmod 600` it prints |
| `KEY_INVALID` | `seal` | the file is not an ed25519 key in PKCS#8 PEM | pass the `.pem` that `keygen` wrote |
| `SEAL_FILE_UNLISTED` | `seal`, `lint` | `package/` holds a file outside `manifest.json`, `objects/` and `ui/`, or a dotfile such as a macOS `.DS_Store`, or a symlink | remove it (Finder adds a `.DS_Store` to any folder it opens) |
| `SEAL_PATH_INVALID` | `seal`, `lint` | a file path a package may not hold | rename it |
| `SEAL_MANIFEST_MISSING` | `seal` | no `package/manifest.json` | run `pnpm build` |
| `SEAL_MANIFEST_INVALID` | `seal`, `deploy` | the manifest is not JSON, or its `id` is not `<prefix>/<key>` | fix `id` in the config, then build |
| `SEAL_VERSION_INVALID` | `seal`, `deploy` | `version` is not SemVer 2.0 | write `1.0.0` style |
| `SEAL_JSON_INVALID` | `seal` | a file under `objects/` is not JSON | run `pnpm build`; never edit `package/` |
| `SEAL_LIMIT_EXCEEDED` | `seal` | more than 1998 files, a file over 5,000,000 bytes, over 100,000,000 bytes in all, or an archive over 20,000,000 bytes | make the package, usually its UI module, smaller |
| `SEAL_OUT_EXISTS` | `seal` | that version is sealed already, with other contents | raise `version`; if that version was never uploaded, you may delete the old `.afpkg` and seal again (`upgrading-the-sdk.md`) |
| `SEAL_ARCHIVE_INVALID` | none today | a sealed archive that cannot be read | |
| `INIT_DIR_NOT_EMPTY` | `init` | the folder exists and is not empty | name a new or empty folder |
| `INIT_NAME_INVALID` | `init` | the prefix or the key breaks the rule it prints | fix `--prefix` or `--key` |
| `INIT_DIR_UNWRITABLE` | `init` | the folder cannot be written | choose a folder you can write |
| `INIT_STARTER_INVALID` | `init` | this install of the builder has no usable starter | reinstall the builder at a release tag |
| `DRAFT_INVALID`, `DRAFT_UNSUPPORTED`, `DRAFT_REBUILD_DIFFERS` | `init --from` | see the `agentflow-from-draft` skill | |
| `SEAL_MISSING` | `deploy` | no sealed file for this version in `dist-app/`, or no file at `--file` | run `pnpm seal`, or fix `--file` |
| `DEPLOY_NOT_CONFIGURED` | `lint`, `deploy` | `AGENTFLOW_URL` or `AGENTFLOW_TOKEN` is not set, `AGENTFLOW_URL` is not a URL, the address is not `https://`, or holds a user, a query or a fragment | set what it names (Connecting to AgentFlow) |
| `DEPLOY_UNREACHABLE` | `lint`, `deploy` | nothing answered at the address, it redirected, or what answered is not AgentFlow (a proxy refusing the archive as too large shows here too); `--wait` gives up after five dropped answers in a row | check `AGENTFLOW_URL` and your network; after a redirect, use the address it names; for a 413, ask whoever runs the proxy to raise its limit |
| `DEPLOY_FAILED` | `deploy` | the install failed (it prints AgentFlow's problem), or the deployment was cancelled: withdrawn, or replaced by a newer one; or the last 20 deployments of this release with these settings all ended | read the problem, fix it or ask the admin, then deploy again; after 20 ended deployments, seal a new version, change the settings (`--parameters` or `--decisions`), or retry after their idempotency keys expire |
| `INTERNAL` | any | a fault in the builder, not in your app | run again with `AGENTFLOW_APP_DEBUG=1` to print its stack, and report it to the AgentFlow team |

## Refusals from AgentFlow

The guide's troubleshooting page, `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/khac-phuc-su-co` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/khac-phuc-su-co`), lists these for people reading without an agent.

`lint` and `deploy` print AgentFlow's own refusals with its code, `<CODE>: <message>`, exit `1`. A refused key (401 or 403) adds a line telling you to check `AGENTFLOW_TOKEN`.

| Code | Means | Do |
|---|---|---|
| `INVALID_TOKEN` | the key is unknown, revoked or expired | ask an admin for a new key, and set `AGENTFLOW_TOKEN` again |
| `FORBIDDEN` | the key's principal may not do this: `deploy` needs `integration.admin` | ask an admin to give the principal a role with it |
| `PLATFORM_TOO_OLD` | this deployment is older than the package's `minPlatformVersion` | ask the AgentFlow team to upgrade the deployment, or deploy to one that runs that version. Lowering `minPlatformVersion` works only down to the value this SDK release states, never below it: edit `minPlatformVersion` in `config/package-manifest.json`, build, seal (raise `version`, or delete the sealed file, if this version was sealed before: `SEAL_OUT_EXISTS`), then deploy |
| `APP_PACKAGE_PROBLEMS` | the upload has lint problems; it prints each one | run `lint`, fix them, raise `version` or delete the refused file from `dist-app/` (it was never stored), build, seal, deploy |
| `PACKAGE_SIGNATURE_INVALID` | the file changed after it was sealed | seal again |
| `PACKAGE_LIMIT_EXCEEDED`, `PACKAGE_ARCHIVE_INVALID`, `PACKAGE_MANIFEST_INVALID` | the archive breaks a limit, is not a package archive, or its manifest is refused; the message names which | as for the `SEAL_` code of the same meaning |
| `APP_PACKAGE_VERSION_EXISTS` | your organization already holds this version with other content. The same content signed again (a new key, say) is accepted. A version that already held two contents from before this rule cannot be uploaded again either | raise `version` in `config/package-manifest.json`, build, seal, deploy (deleting the sealed file does not help: the earlier release is stored) |
| `APP_GRANT_RECIPIENT_COLLISION` | the setup page lists it under "Problems the plan found" and the plan cannot be approved: the admin picked the same group for two parameters that each give a grant on the same entity | pick different groups for them (members may overlap); the parameter's `help` should say so (the authoring skill, `pitfalls.md`) |
| `STAGE_TRANSITION_NOT_ALLOWED` | after install, a run failed with `the move from 'X' to 'Y' is limited to: a member of group 'G'`: the workflow's run-as service principal is not in the group the stage move is limited to. Setup cannot see this (its only warning is that the principal needs record access, "gets it only once it is in one of: <groups>"); it shows at run time | an admin adds the principal to group G from the **Groups** card on the service principal's page (Admin → Service principals; Admin → Groups does not list service principals), then retries the run or starts it again |
| `APP_VERSION_NOT_NEWER` | a higher version is installed, or the same version with other content | raise `version` above it |
| `VALIDATION_ERROR` | the deploy request holds a parameter the manifest does not declare, or a decision other than declining one of this package's grants; the message names each | fix the key in `parameters.json`, or leave that decision to the admin who approves on the setup page |
| `APP_DEPLOYMENT_NOT_FOUND` | while waiting, the deployment is not in the key's organization | check `AGENTFLOW_URL` and `AGENTFLOW_TOKEN` did not change; open the link it printed |
