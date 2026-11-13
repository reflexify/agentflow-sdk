# @reflexify/agentflow-app-builder

The user guide on your deployment explains how to build, seal and deploy an app: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/tong-quan` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/tong-quan`).

Where this README names a skill's page (the authoring skill's `reference/signing.md`, the release skill's
`reference/publishing.md`), the page is not in this package: it is in the SDK repository (reflexify/agentflow-sdk
on GitHub), under `claude-plugin/skills/<skill>/reference/`, as `agentflow-app-authoring` and
`agentflow-app-release`. A project's `AGENTS.md` says how to add them to Claude Code as a plugin.

The app builder turns an app package's hand-written `config/` into its `package/`: a `manifest.json` and
one JSON file per object under `objects/{kind}/`. You write entities, views, grants, rules, agents, skills,
dashboards, document templates and workflows in a form that is pleasant to edit and refers to other parts of the package by
name. The builder resolves those names, checks what it can, and writes the files the platform installs.
It also seals a built package into a signed `.afpkg` with a key you make yourself, checks `package/` against an AgentFlow deployment, and deploys the sealed file there.

**Status.** Version 0.12.0. It reads `configVersion` 1 and writes package `formatVersion` 1. The format is
documented below and may still change before the owner calls it stable; the stability policy says how a
change is announced:

- adding something optional keeps the version;
- renaming, removing, or changing what an existing field means raises it;
- each SDK release states the `configVersion` and package `formatVersion` it writes.

**What the builder is not.** It is not the authority. The platform's own package verification decides what
installs. The builder exists to fail early with a location, in the file you are editing, instead of at
install time. A config the builder accepts can still be refused by the platform. A config the builder
refuses is one it has no rule for, even when the platform might take it.

## The `agentflow-app` CLI

The package's `bin` is `agentflow-app`. Run it from a project with `pnpm exec agentflow-app <command>`
(a project made by `init` has scripts for `build`, `check` and `seal`), or without installing, from the SDK
repository's release tag:

```bash
pnpm dlx --package "github:reflexify/agentflow-sdk#sdk-v0.12.0&path:packages/agentflow-app-builder" \
  agentflow-app init my-app --prefix acme
```

| Command | Does |
|---|---|
| `init <dir> --prefix <prefix> [--key <key>] [--no-ui] [--no-site]` | Starts an app in `<dir>` (a new or empty folder) from the starter, the case desk: a package, an optional UI module and an optional standalone site. The package id is `<prefix>/<key>`; `<key>` defaults to the folder's name. `--no-ui` leaves out the module, `--no-site` the site; with both, the project is the package alone. The project's `package.json` carries the manifest's `version`. |
| `init <dir> --from <draft.zip>` | Turns a draft from Admin → Apps → Pack into a project (see "Converting a draft"). It takes no `--prefix`, `--key`, `--no-ui` or `--no-site`. |
| `build [--check]` | Writes `package/` from the config, and builds the UI module into `package/ui/` when the manifest declares one. `--check` writes nothing and fails when `package/` is not what the config builds; with a module, `pnpm check` compares package/ui with the module when package/ui exists, byte for byte with the `prebuilt` folder or a Vite build into a temporary `.agentflow/ui-check-*` folder, as deep as `package/ui` so source maps match; without `package/ui` it says nothing of the module. |
| `build --check --values` | Like `--check`, but compares each JSON file as a value: object members in any order, arrays in order, the manifest's `objects` and `grants` sorted by key, and `ui/` files byte for byte, as the draft conversion checks itself. Use it while rewriting a converted workflow with the `./workflow` helpers, before `build`: a refusal names each member that differs, as `<file>#<pointer>`. |
| `keygen --key-id <id> [--out <file>]` | Makes an ed25519 signing key (default `keys/<id>.pem`) and prints where it is and its key id. |
| `seal [--key <file>] [--key-id <id>] [--out <dir>]` | Signs `package/` into `<out>/<prefix>-<key>-<version>.afpkg` (default `dist-app/`). |
| `lint [--url <url>]` | Runs `build --check`, then zips `package/` as it stands (no key, no seal) and sends it to AgentFlow, which runs its own archive, manifest, platform-version and lint checks and stores nothing. Prints each problem as `<code>  <object>  <path>: <message>`. Exits `1` when there are problems. |
| `deploy [--file <afpkg>] [--parameters <file>] [--decisions <file>] [--wait] [--url <url>]` | Uploads the sealed `dist-app/<prefix>-<key>-<version>.afpkg` (or `--file`), then asks AgentFlow to install it with the answers to the manifest's parameters in `--parameters` (a JSON object by parameter key; a key the manifest does not declare is refused) and, in `--decisions`, only grants to decline (`{"grants": {"<package>": {"<grant key>": "declined"}}}`): the admin who approves decides everything else. Prints `awaiting approval: <link>`: an admin approves the install there. `--wait` waits until it is installed (`0`), or failed or cancelled (`DEPLOY_FAILED`); Ctrl-C stops the waiting (`130`), not the deployment. While it waits, it prints each finding of the last plan a person made of the setup, one a line (`<CODE> on <object key> at <pointer>: <message>`), each time they change. When the newest deployment of this version failed, it says so (`the last deployment of <id> <version> failed: <code> — <detail>; this is a new one`) before the new link; `--json` adds `previous: { deployment_id, problem }`. |
| `status [--url <url>]` | Reads only. Lists the newest deployments (up to 10) of the package in `package/manifest.json`, newest first, each with its version and status (a failed one with its code and detail), and a link (`approve:` while it awaits approval, `setup page:` otherwise; an installed one shows its installation id instead), and the sandbox in `.agentflow/sandbox.json`: `live` (its deploy key still works), `gone` (expired, or deleted from another folder or with `--id`: this folder's file stays), `elsewhere` (made on another deployment, not checked) or `unknown` (the check got another answer), and when it expires; with no file (never made, or `sandbox delete` removed it) it says `no sandbox here`. Under a deployment awaiting approval, it prints each finding of the last plan a person made of its setup, one a line. Exits `1` when the newest deployment failed. The key needs `integration.admin`. `--json` gives `{ "package_id", "version", "deployments": [{ "deployment_id", "version", "status", "problem", "approve_url", "installation_id", "created_at", "plan_findings"? }], "sandbox": { "id", "state", "expires_at" } \| null }`. |
| `publish [<file>] [--file <path>] [--url <url>]` | Sends the sealed package (found as `deploy` finds it, or the file named) to the deployment's app catalog. The key needs `app_catalog.publish` and `integration.admin`. It prints `published <id> <version>` (or `in review …`; or `rejected …`, `withdrawn …` or `revoked …` and exit `1`); `--json` prints AgentFlow's `{ "submission", "entry" }`. Publishing is not installing: each organization's admin installs from Admin → Apps → Install app → From the catalog. What the catalog shows, the review and the prefix claim: the release skill's `reference/publishing.md`. |
| `withdraw <prefix>/<slug>@<version> --reason <text> [--url <url>]` | Takes a version your organization published out of new setups; installations keep running. `--reason` is required, and only the organization that holds the prefix may withdraw. A withdrawn version is never published again: raise `version`. |
| `deploy --sandbox [--file <afpkg>] [--no-arm] [--url <url>]` | Replaces this folder's sandbox with a new one made from `sandbox.json`, installs the package there as the sandbox's owner and arms its triggers (unless `--no-arm`). It seals `package/` in memory with a key made for the deploy (or uploads `--file`), adds the sandbox defaults to `install.decisions` (every optional feature on, every client approved), waits at most 300 s for the install (`DEPLOY_STALLED`) and records the installation and its objects in `.agentflow/sandbox.json`. Before the package it uploads each sealed package `sandbox.json`'s `dependencies` names (such as `rfx/erp-core`), with `--upgrade` too, and `--json` lists them as `dependencies`. It takes no `--parameters` or `--decisions`: `sandbox.json` holds both. Exit `1` when refused, stalled or not armed, `130` on Ctrl-C. |
| `sandbox check` | Checks `sandbox.json` on your machine, calling nothing. When `package/manifest.json` exists it also compares `install.parameters` with the manifest's parameters: a key the manifest does not declare, a value of the wrong kind for the parameter's type (`@person:` for a `group_ref`, a string for a `number`), an explicit `null`, and an `@kind:` reference for a `secret_ref` (a sandbox holds no secret; an `sla_policy_ref` or `escalation_policy_ref` takes `@sla_policy:<key>` or `@escalation_policy:<key>`, a policy `sandbox.json` declares) are each refused (`SANDBOX_SPEC_INVALID`), naming the key. A required parameter with no default and no value is a warning, because AgentFlow refuses it only when an enabled object, a grant or the audience uses it. It is a refusal (`SANDBOX_SPEC_INVALID`, exit `1`) when the package shows the install cannot succeed: the parameter is a `secret_ref`, or a `connection_ref` whose `category` is `crm`, `database`, `data_warehouse` or `file_storage`, or `erp` when `sandbox.json` declares no `sandbox_erp` connection (a sandbox holds no secret, and only email connections, resend or loopback, and `sandbox_erp` ERP connections), and an object under `package/objects/` uses it, with no value in `sandbox.json` or with one (for a required parameter, or any `secret_ref`; a value for an optional connection is left alone); the message names the object. An `@connection:<key>` of the wrong kind is refused too: an `erp` parameter answered with an email connection, or an email one answered with a `sandbox_erp` connection. It reads each package `dependencies` names (refusing a file that cannot be read or holds no manifest, at `dependencies[i]`) and compares `install.decisions.parameters["<its id>"]` with that dependency's parameters: an unknown key, a value of the wrong kind, and a value a sandbox cannot hold for a required parameter are refused, and a required parameter with no default and no answer is a warning. Each entry of `requires.packages` that `dependencies` does not upload is a warning: `requires.packages: <id> is not among sandbox.json's dependencies, so the install looks for it in the deployment's app catalog, and AgentFlow refuses the install when the catalog does not hold it`. The comparison reads `package/manifest.json` and `package/objects/` as built, so run `build` first. `deploy --sandbox` makes the same comparison before it creates anything. |
| `sandbox create [--name <name>] [--ttl-days <n>]` | Makes a sandbox from `sandbox.json` (name defaults to the folder's; 1 to 30 days, 7 by default) and writes its keys to `.agentflow/sandbox.json`. |
| `sandbox list` | Lists your organization's live sandboxes. |
| `sandbox open --as <handle>` | Opens your browser signed in as one of the sandbox's people. It never prints the sign-in link (good once, for 5 minutes) and fails with `SANDBOX_OPEN_FAILED` where no browser can start. |
| `sandbox mail-in --connection <key> --file <message.json>` | Delivers the message in the file (`from`, `to`, `subject`, and optionally `cc`, `text`, `html` and `headers`) to the sandbox's `loopback` connection `<key>` as received mail, which starts the app's `email.received` workflows. Prints `recorded`, or `discarded (auto_submitted)` for a message carrying `Auto-Submitted`; `SANDBOX_NOT_LIVE` once the sandbox is gone. |
| `sandbox mail-out --connection <key>` | Lists what the sandbox's `loopback` connection `<key>` sent, newest first, one line each (time, recipient, subject, Message-ID); `--json` gives `{ "sends": [...] }`, never with blind copies. |
| `sandbox records-in --connection <key> --stream <stream> --file <records.json>` | Records the file's canonical ERP records on the sandbox's `sandbox_erp` connection `<key>` as an ERP read of `<stream>` would (`company`, `currency`, `uom`, `tax_code`, `vendor`, `item`, `purchase_order`, `goods_receipt` or `vendor_bill`), so erp-core's sources and the app's triggers read them. The file is a list of records, or `{ "stream", "records" }` (then `--stream` may be left out). A record's key defaults to its `company_erp_id` (or `""`) and `erp_id`, its stamp to its `source_changed_at`; an entry `{ "key", "stamp", "record" }` or `{ "key", "stamp", "deleted": true }` gives them. It sends at most 500 records, and under 2 MiB, per request, and prints one line each (`records 1-500: recorded 499, 1 already there`); the same record with the same stamp records nothing. `SANDBOX_NOT_LIVE` once the sandbox is gone. |
| `sandbox records-out --connection <key>` | Lists the draft bills apps wrote to the sandbox's `sandbox_erp` connection `<key>`, oldest first, one line each (time, object, `external_ref`, `erp_id`); `--json` gives `{ "writes": [{ "object_type", "external_ref", "erp_id", "written_at", "record" }] }`. |
| `sandbox delete [--id <id>]` | Deletes the sandbox in `.agentflow/sandbox.json`, or the one named, and removes the file. |
| `types [--out <file>] [--check]` | Writes TypeScript for the objects in `package/` to `src/generated/app.ts` (or `--out`); see "Typed keys". `--check` writes nothing and fails with `TYPES_STALE` when the file is not what `package/` generates. |

Every command takes `--json`.

**Connecting to AgentFlow.** `lint`, `deploy`, `status`, `publish` and `withdraw` read two environment variables:

- `AGENTFLOW_URL` is the address you open AgentFlow at, such as `https://agentflow.example.com`. `--url` overrides it. It must be `https://`, or `http://` on `localhost`, `127.0.0.1` or `[::1]`, and carry no user, query or fragment.
- `AGENTFLOW_TOKEN` is a service principal's key (`afk_…`). Deploying needs `integration.admin`; linting needs only a key of the organization; publishing needs `app_catalog.publish` and `integration.admin`, and withdrawing `app_catalog.publish`.

The key is sent only in the `Authorization` header to that address, a redirect is never followed, and the key is never printed, logged or written: an answer that echoes it shows `[redacted]`. A refusal from AgentFlow prints with AgentFlow's own code (`PLATFORM_TOO_OLD: …`) and exits `1`; when the key was refused (401 or 403) it gains a line saying to check `AGENTFLOW_TOKEN`. Running `deploy` again with the same file and the same answers returns the same deployment (its `Idempotency-Key` is derived from the release's digest and the answers), so retrying after a dropped connection makes no second one.

**Connecting to a sandbox.** `sandbox` and `deploy --sandbox` read `AGENTFLOW_URL` as above, and `AGENTFLOW_SANDBOX_KEY` instead of `AGENTFLOW_TOKEN`: a service principal's key of your real organization whose role holds `sandbox.create`. No built-in role has that permission, so an admin grants it to a role of their own. The key is never printed, nor are the sandbox's deploy key, its people's `afs_` tokens or a sign-in link. A connection's provider key is read from the variable its `secret_env` names in `sandbox.json` (`SANDBOX_SECRET_MISSING` when unset).

The sandbox's keys go to `.agentflow/sandbox.json`, written private (`0600` in a `0700` folder). The CLI adds `/.agentflow/` to `.gitignore` and refuses every `sandbox` command and `deploy --sandbox` while git tracks anything under `.agentflow/` (`SANDBOX_STATE_TRACKED`). The test kit, `@reflexify/agentflow-sdk/testing`, reads that file. The guide page is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/thu-trong-sandbox` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/thu-trong-sandbox`).

What `init` writes:

- **The two groups.** The starter's UI module (`src/module/`, `module.html`, `vite.module.config.ts`, the
  kit and React) and its standalone site (`server/`, the sign-in scripts, `.env.example`) each belong to a
  group that `--no-ui` or `--no-site` leaves out, with their files, dependencies, scripts, the manifest's
  `ui` member and the launcher entry. What is left builds, tests and seals. `README.md` and `AGENTS.md` are
  rewritten the same way: a passage about a group that is gone is dropped, and the starter's own names
  become the project's.
- **Dependencies by git reference.** The starter's `workspace:*` dependencies on the SDK's packages become
  `github:reflexify/agentflow-sdk#sdk-vX.Y.Z&path:packages/<package>`, at this builder's version, so the
  packages installed together are the ones released together.
- **`pnpm-workspace.yaml`.** pnpm 12 refuses a git reference below a direct dependency, and the SDK's packages
  refer to each other that way, and it refuses to run esbuild's install script, which `tsx` needs. The file
  sets `blockExoticSubdeps: false` and allows esbuild's build, so the project's first `pnpm install` works.
- **Nothing half-written.** `init` works in a temporary folder next to the target and moves the result in, so
  a refusal leaves no partial project.

After `init`: `cd <dir> && pnpm install && pnpm build`.

- **Help.** `agentflow-app --help` and `-h` print the usage on stdout and exit `0` (with `--json`, `{ "usage" }`); `<command> --help` prints only that command's forms and flags, with the notes every command shares. No command at all prints it on stderr and exits `2`.
- **Exit codes.** `0` means done, `1` means the command refused (`lint` found problems, `status` found the newest deployment failed, or `deploy --wait` saw the install fail or the deployment cancelled), `2` means a usage error, `130` means you stopped `deploy --wait` with Ctrl-C.
- **A refusal** prints `<CODE>: <message>` on stderr. With `--json`, every outcome prints exactly one JSON
  value on stdout instead: the command's result, or `{ "error": { "code", "message", "files"? } }`. `files`
  lists the files the refusal is about.
- **Results under `--json`:** `init` gives `{ "dir", "id" }` (`init --from` gives `{ "dir", "files" }`);
  `build` gives `{ "files", "ui" }`, where `ui` is `built`, `copied` or `none`; both add `"warnings"` (a list of lines) only when there are some: a launcher entry whose `icon` is not one of AgentFlow's 40 icon names is a warning, not a refusal (the platform installs it and draws a dot), and so is a UI module that is an empty stub (a `mount` that draws nothing, such as a draft made without a screen carries), each printed as `warning: …` on stderr; `build --check` (with or without `--values`) gives
  `{ "stale", "missing", "extra" }`; `keygen` gives `{ "file", "key_id" }`; `seal` gives
  `{ "file", "package_id", "version", "digest", "signer", "unchanged" }`, where `unchanged` is `true` when the
  `.afpkg` was there already, sealing the same package with the same key, and `seal` left it alone, and adds `"warnings"` for an empty-stub UI module, which it still seals; `lint` gives AgentFlow's answer,
  `{ "platform_version", "problems" }`; `deploy` gives
  `{ "package": { "package_id", "version", "digest", "signer", "uploaded" }, "deployment": { "deployment_id", "status", "kind", "approve_url", … } }`,
  the deployment as it was last read; `publish` and `withdraw` give AgentFlow's answer (`{ "submission", "entry" }`, and `{ "entry" }`); `types` and `types --check` give `{ "file", "changed" }`, `file` relative to
  the folder.

### Error codes

| Code | From | Means |
|---|---|---|
| `USAGE` | any | An unknown command or flag, a missing argument, `--from` given with a flag it does not take, a `--parameters` or `--decisions` file that cannot be read or is not a JSON object, `--parameters` or `--decisions` with `--sandbox`, a `sandbox` action given a flag it does not take, or a `sandbox records-in` file it cannot send (no stream, a record with no key or stamp, one record larger than a request carries). Exit 2. |
| `APP_FILE_MISSING` | `build` | There is no `agentflow.app.mjs` in the folder. |
| `APP_FILE_INVALID` | `build` | `agentflow.app.mjs` does not load, takes a member `defineApp` does not, or a workflow graph is broken. |
| `CONFIG_VERSION_MISSING` | `build` | `config/package-manifest.json` has no `configVersion`. |
| `CONFIG_VERSION_UNKNOWN` | `build` | The `configVersion` is not a whole number of 1 or more, or is newer than this SDK reads. |
| `BUILD_REFUSED` | `build`, `lint` | A config problem, `<file>#<pointer>: <reason>`, or a file the build cannot read. |
| `PACKAGE_STALE` | `build --check`, `lint`, `deploy --sandbox` | `package/` is not what the config builds, `package/ui` included when the manifest declares a module and `package/ui` exists; `files` names the stale, missing and extra files. |
| `PACKAGE_DIFFERS` | `build --check --values` | The config builds other values than `package/` holds; the message names each member that differs as `<file>#<pointer>`, and `files` the files. `package/` is left as it was. |
| `PACKAGE_MISSING` | `seal`, `deploy`, `status`, `types` | There is no `package/`; from `types`, also a manifest object with no file in `objects/`. |
| `TYPES_STALE` | `types --check` | The generated file is missing or is not what `package/` generates: run `pnpm exec agentflow-app types`. |
| `UI_TOOL_MISSING` | `build` | The manifest declares a UI module and Vite is not installed in the project. |
| `UI_BUILD_FAILED` | `build` | Vite failed on the module. For a plain import of the UI kit's types-only `./jsx` entry, a second line says to write `import type {} from '@reflexify/agentflow-elements/jsx';`. |
| `UI_ENTRY_MISSING` | `build`, `seal` | The built module has no `index.js`; or, from `seal`, the manifest declares `ui` and `package/` holds no entry: run `pnpm build` first. |
| `UI_ENTRY_INVALID` | `build` | `index.js` does not end with `export { mount };`. |
| `UI_FILE_TYPE` | `build` | The built module holds a file the platform does not serve. |
| `KEY_EXISTS` | `keygen` | The key file exists; `keygen` never overwrites. |
| `KEY_ID_INVALID` | `keygen`, `seal` | A key id that is empty or holds whitespace or control characters; `keygen` also refuses one outside `[A-Za-z0-9][A-Za-z0-9._-]{0,63}`. |
| `KEY_MISSING` | `seal` | No ed25519 key in `keys/`, or no file at `--key`. |
| `KEY_AMBIGUOUS` | `seal` | More than one ed25519 key in `keys/`; pass `--key`. |
| `KEY_PERMISSIONS` | `seal` | The key file can be read by other users; the message gives the `chmod 600` to run. |
| `KEY_INVALID` | `seal` | The file is not an ed25519 private key in PKCS#8 PEM. |
| `SEAL_FILE_UNLISTED` | `seal`, `lint` | `package/` holds something other than `manifest.json`, `objects/` and `ui/`, or a dotfile such as `.DS_Store`, or a symlink. |
| `SEAL_PATH_INVALID` | `seal`, `lint` | A file path a package may not hold. |
| `SEAL_MANIFEST_MISSING` | `seal` | There is no `package/manifest.json`. |
| `SEAL_MANIFEST_INVALID` | `seal`, `deploy` | The manifest is not a JSON object, or its `id` is not `<prefix>/<key>`. |
| `SEAL_VERSION_INVALID` | `seal`, `deploy` | The manifest's `version` is not SemVer 2.0. |
| `SEAL_JSON_INVALID` | `seal` | A file under `objects/` is not JSON. |
| `SEAL_LIMIT_EXCEEDED` | `seal` | More than 1998 files, a file over 5,000,000 bytes, more than 100,000,000 bytes in all, or an archive over 20,000,000 bytes. |
| `SEAL_OUT_EXISTS` | `seal` | The `.afpkg` exists with other contents; raise `version`, or, if that version never reached a deployment or the catalog, delete the file and seal again. |
| `SEAL_ARCHIVE_INVALID` | none today | Reserved for an archive that cannot be read. |
| `INIT_DIR_NOT_EMPTY` | `init` | The folder exists and is not empty. |
| `INIT_NAME_INVALID` | `init` | The prefix or the key breaks the rule the message prints. |
| `INIT_DIR_UNWRITABLE` | `init` | The folder cannot be written. |
| `INIT_STARTER_INVALID` | `init` | This install of the builder has no usable starter. |
| `DRAFT_INVALID` | `init --from` | The file is not a draft: unreadable, not a zip, no manifest, or a sealed package. |
| `DRAFT_UNSUPPORTED` | `init --from` | The draft holds something the builder cannot write; the message names the file and the place. |
| `DRAFT_REBUILD_DIFFERS` | `init --from` | The converted project does not build the draft back; the message lists the files that differ. |
| `SEAL_MISSING` | `deploy` | No sealed file for the version in `package/manifest.json` under `dist-app/`, or no readable file at `--file`: run `pnpm seal`. |
| `DEPLOY_NOT_CONFIGURED` | `lint`, `deploy`, `status`, `publish`, `withdraw`, `sandbox`, `deploy --sandbox` | `AGENTFLOW_URL` or `AGENTFLOW_TOKEN` is not set, or the address is not `https://` (or `http://` on `localhost`, `127.0.0.1` or `[::1]`), or `AGENTFLOW_URL` is not a URL, or holds a user, a query or a fragment. The message names which; when a variable is not set it adds the checks that need no deployment: `lint` says `build --check`, the other commands `build --check`, `types --check` (with a UI module) and `sandbox check` (with a `sandbox.json`), and all point at the release skill's "Without a deployment". |
| `DEPLOY_UNREACHABLE` | `lint`, `deploy`, `status` | Nothing answered at the address, it answered with a redirect, or what answered is not AgentFlow (including a proxy in front of it that refuses an archive as too large). `deploy --wait` gives up after five dropped answers in a row. |
| `SANDBOX_SPEC_MISSING` | `sandbox`, `deploy --sandbox` | There is no `sandbox.json` in the folder. |
| `SANDBOX_SPEC_INVALID` | `sandbox`, `deploy --sandbox` | `sandbox.json` fails the offline check; the message is `sandbox.json: <field>: <message>`, in AgentFlow's wording. A parameter a sandbox cannot hold is refused at `install.parameters.<key>` (or a dependency's `install.decisions.parameters.<id>.<key>`), and a dependency file that cannot be read as a sealed package at `dependencies[i]`. |
| `SANDBOX_SECRET_MISSING` | `sandbox create`, `deploy --sandbox` | The environment variable a connection's `secret_env` names is unset or empty. |
| `SANDBOX_STATE_TRACKED` | `sandbox`, `deploy --sandbox` | Git tracks something under `.agentflow/`. |
| `SANDBOX_STATE_MISSING` | `sandbox` | There is no `.agentflow/sandbox.json` where the action needs one. |
| `SANDBOX_STATE_INVALID` | `sandbox`, `deploy --sandbox` | `.agentflow/sandbox.json` is not version 1 JSON. |
| `SANDBOX_OPEN_FAILED` | `sandbox open` | No browser could be started. |
| `DEPLOY_STALLED` | `deploy --sandbox` | The install was still running after 300 s. The sandbox stays. |
| `DEPLOY_FAILED` | `deploy` | While waiting, the install failed (the message carries AgentFlow's problem) or the deployment was cancelled (withdrawn, or replaced by a newer one). Also when the last 20 deployments of this release with these answers have all ended. |
| `INTERNAL` | any | A fault in the builder, not in your app. |

`INTERNAL` is listed in `ERROR_CODES` with the rest. Run the command again with `AGENTFLOW_APP_DEBUG=1` to print
its stack.

## `agentflow.app.mjs`

An app describes its build in one file at the project's root, which `build` and `build --check` read:

```js
import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as openCase from "./config/build/open-case.mjs";

export default defineApp({
  sections: merge([openCase], ["open_case"]),
  entityOrder: ["case"],
  exposedSteps: { open_case: ["review"] },
  ui: { viteConfig: "vite.module.config.ts" },
});
```

- `sections` (required) is what `merge` returns: the workflows, triggers and actions of your modules, and the
  order the workflows are published in (see "Workflows, triggers and actions").
- `entityOrder` is the entity keys in the order the package lists them. It must name exactly the files in
  `entities/`. Without it they are sorted.
- `exposedSteps` maps a workflow `key` to the ids of its Human steps that the workflow exposes.
- `ui` says how the UI module is made. It is optional, and used only when the manifest declares a `ui`
  member. The module's entry is not named here: it is the Vite config's `build.lib.entry`.
  - `{ "viteConfig": "<file>" }` builds the module with Vite and your config file (the default is
    `vite.module.config.ts`). Vite is not a dependency of the builder: it is resolved from your project, so
    add it (`pnpm add -D vite`) or `build` refuses with `UI_TOOL_MISSING`.
  - `{ "prebuilt": "<folder>" }` copies a folder of already-built files into `package/ui/` instead. A project
    converted from a draft uses it.

  Either way the result is checked: `index.js` must exist and end with `export { mount };`, and every file
  must be of a type the platform serves (`.js .mjs .css .json .map .svg .png .jpg .webp .woff2`; no HTML).
- Any other member is refused (`exposed is not a member defineApp takes`).

What `build` does, in order: loads `agentflow.app.mjs`, checks `configVersion`, writes `manifest.json` and
`objects/` under `package/` (deleting what it wrote before), and then, **exactly when the manifest declares
`ui`**, builds the module into `package/ui/`. A manifest without `ui` has any old `package/ui/` removed.

`package/manifest.json` and `package/objects/` are generated, committed and never edited by hand, so a
reviewer reads what ships. `package/ui/` is built output: git ignores it (`/package/ui/` in the project's
`.gitignore`), `build` writes it, and `build --check` leaves it out. `build --check` compares
`manifest.json` and `objects/` only: it reports `stale`, `missing` and `extra` files, so it catches an
edited, deleted or stray file but never an old module. Run `build`, not only `build --check`, before you seal.

## `configVersion`

`config/package-manifest.json` carries `"configVersion": 1`, the version of this `config/` format. It is not
`formatVersion`, which belongs to the sealed archive.

- It is required, and conventionally the first member. `build` refuses a file without it
  (`CONFIG_VERSION_MISSING: config/package-manifest.json has no configVersion: add "configVersion": 1`).
- It is config-only: the builder reads and checks it and leaves it out of `package/manifest.json`, whose
  members the platform closes. A committed `package/` does not change when `configVersion` is added.
- A `configVersion` that is not a whole number of 1 or more, or that is newer than this SDK reads, is refused
  with `CONFIG_VERSION_UNKNOWN`. A newer one cannot name the release that introduced it, since this SDK has
  never heard of it: the message names this SDK's version and the newest `configVersion` it reads, and says
  to install a newer SDK release.
- The stability policy above says when the version changes. Each release's notes (`CHANGELOG.md` in the SDK
  repository) give the `configVersion` and `formatVersion` it writes and the oldest platform version it needs.

## The `config/` layout

```
agentflow.app.mjs           the build: sections, entity order, exposed steps, the UI module (above)
config/
  package-manifest.json     the manifest's own members, and configVersion
  entities/<key>.json       one file per entity: fields, views, form, access, rules, stage model, work
  entity_extensions/<key>.json  one file per extension: fields added to an entity another package owns
  memory_types/<key>.json   one file per memory type
  memory_relationships/<key>.json  one file per memory relationship
  agents/<key>.json         one file per agent
  skills/<name>.SKILL.md    one file per skill
  dashboards/<key>.json     one file per dashboard
  document_templates/<key>.json  one file per document template
  code/<name>.js            Code step sources, read by path from a workflow
  build/                    your code: the modules of workflows, triggers and actions
```

Workflows, triggers and entity actions are written in code (TypeScript or JavaScript modules) because a
graph is easier to build from functions than to type as JSON. Everything else is JSON, or Markdown for a
skill. `entities/`, `entity_extensions/`, `memory_types/`, `memory_relationships/`, `agents/`, `dashboards/` and `document_templates/` may hold only `.json` files, and
`skills/` only files ending in `.SKILL.md`. Dotfiles and notes (`.md` and `.txt` files) are ignored anywhere
under `config/`, except that in `skills/` a `.md` is skill content: there only `.txt` files are notes, and a
`.md` not named `<name>.SKILL.md` is refused like any other file
(`skills#: triage.md is not a .SKILL.md file: a skill's file is <name>.SKILL.md`). The files an operating
system leaves (`desktop.ini`, `Thumbs.db`) are ignored like dotfiles. A `.SKILL.md` file (in any case) is never
a note: anywhere but `skills/` it is refused (`config#: triage.SKILL.md is a skill: skills go in config/skills/`). A subfolder of one of these folders that
holds only notes is ignored; one holding anything else is refused as a folder
(`entities#: archive/ is a folder holding archive/old.json; entities/ holds .json files and notes only`).

Beside the folders above, `config/` may hold `package-manifest.json`, notes, and folders that hold only notes.
Anything else is refused rather than left out of the package unseen, naming the path:

- a file such as `config/letter.json`: `config#: letter.json is not a file the builder reads; the files are
  package-manifest.json and notes (.md, .txt)`;
- a misnamed folder holding such a file: `config#: templates/ is not a folder the builder reads (it holds
  templates/x.json); the folders are entities, entity_extensions, memory_types, memory_relationships, agents, skills, dashboards, document_templates, code and build`.
  Names are case-sensitive on every system, so `config/Entities/` is refused too, with
  `did you mean entities/? Names are case-sensitive`;
- one of those folder names used for a file: `config#: dashboards is a file, where the builder reads a folder`;
- a link to nothing: `config#: dangling is a link to nothing`.

`code/` and `build/` are not looked into.

## References

Inside `entities/`, `agents/`, `dashboards/`, `document_templates/` and the workflow sections, a string that is a whole reference
is replaced by the platform's sentinel for it:

| Write | Names | Becomes |
|---|---|---|
| `${entity:ticket}` | an entity of the package | `@obj:entity:ticket` |
| `${workflow:support_intake}` | a workflow's `key` | `@obj:workflow:support_intake` |
| `${agent:triage}` | an agent file's key | `@obj:agent:triage` |
| `${skill:account-access}` | a skill's name | `@obj:skill:account_access` |
| `${param:support_group_id}` | a parameter of the manifest | `@param:support_group_id` |
| `${dashboard:projects_overview}` | a dashboard file's key | `@obj:dashboard:projects_overview` |
| `${document_template:approval_letter}` | a document template file's key | `@obj:document_template:approval_letter` |
| `${entity_view:task/open}` | a view of an entity of the package, as `entity/view` | `@obj:entity_view:task/open` |
| `${entity_metric:task/open_count}` | a metric of an entity of the package, as `entity/metric` | `@obj:entity_metric:task/open_count` |
| `${dep:rfx/erp-core#entity:vendor}` | an entity another package exports, which `requires.packages` names | `@dep:rfx/erp-core#entity:vendor` |

`${dep:}` also appears in `entity_extensions/`, as a file's `extends`.

The rules:

- **Whole strings only.** `"${param:x}"` is a reference; `"hello ${param:x}"` is refused. A parameter that
  a template needs is read into a variable by a first workflow step (`readParameters`), and the template
  reads the variable.
- A key is lowercase, starts with a letter, and holds letters, digits, `_` and `-`. Only a skill key may
  hold a hyphen; the hyphen becomes `_` in the object key. Any other kind with a hyphen is refused.
- A member name may not hold `${`. A string starting with `@` is refused, so a literal cannot be mistaken
  for a sentinel.
- After translation, every sentinel must name an object the package builds, a parameter the manifest
  declares, or an entity the manifest requires. A sentinel that names nothing is refused.
- The two reserved entities are written by id: Users `ffffffff-0000-0000-0000-000000000001` becomes
  `@req:entity:user`, Units `ffffffff-0000-0000-0000-000000000003` becomes `@req:entity:org_unit`. A field's
  `target_entity_id` takes `${entity:key}` or one of those two ids.
- `package-manifest.json` is not translated, except its `launcher` member (see below). Write sentinels in
  the other members directly (`"@param:support_group_id"`).

## `package-manifest.json`

The members of the platform's manifest, and `configVersion` (above). The builder takes these from you:

`configVersion`, `formatVersion`, `id`, `version`, `name`, `summary`, `publisher`, `license`, `dataHandling`, `changelog`,
`contentLocale`, `minPlatformVersion`, `requires`, `parameters`, `audience`, `ceiling`, `egress`,
`tests`, and optionally `ui`, `launcher` and `assistant`.

All are required except `ui`, `launcher` and `assistant`. A member that is missing is refused (`package-manifest.json#/egress: missing`).
`ui`, `launcher` and `assistant` are left out of the output unless you give them. A package that ships a UI module
declares `"ui": { "kind": "module", "entry": "ui/index.js", "contract": 1 }` here; `build` then builds the
module into `package/ui/` (see `agentflow.app.mjs`). `ui.kind` must be `module` and `ui.contract` 1 to 6
(`package-manifest.json#/ui/contract: one of 1, 2, 3, 4, 5, 6`).
The builder checks that the members are present and that every sentinel in them resolves. It checks the contents
of `ui`, `launcher` and `assistant`; for the other members the platform does. `minPlatformVersion` below
`PLATFORM_FLOOR` (`2026.10`, exported) is refused.

`mcp` is no longer a manifest member, and a file that still has one is refused
(`package-manifest.json#/mcp: mcp is no longer a manifest member: set tool_enabled on a workflow to ship it switched on as a tool`):
delete it. To ship a workflow switched on as a tool for MCP and A2A clients, set `"tool_enabled": true` on that workflow
(only `true` writes anything, and a value that is not `true` or `false` is refused at `/tool_enabled`). The platform
takes the value only when the workflow is first installed; after that the organization owns the switch. `build` warns
when such a workflow's installed key (`<package id with / and - written _>__<workflow key>`) is longer than 64 characters:
the workflow still installs switched on, but MCP and A2A clients are not offered it as a tool.

Three members are generated and may not appear in your file: `features`, `objects`, `grants`.
Writing one is refused (`a member the builder does not take from here`). `exports` is yours and optional: list the
package's entities its dependents may use as `${entity:<key>}`, or leave it out for `[]`. The output lists the
members in the platform's order, whatever order you wrote them.

```json
{ "configVersion": 1, "formatVersion": 1, "id": "rfx/support-desk", "version": "1.0.0", "audience": "@param:support_group_id",
  "parameters": [{ "key": "support_group_id", "type": "group_ref", "required": true, "label": "Support group", "help": "…" }],
  "ceiling": { "narrow": {} }, "egress": [], "tests": [] }
```
(Abridged: the other required members are not shown.)

An `egress` entry is `{ "host", "purpose" }`, or `{ "connection": "${param:<key>}", "purpose" }` for the hosts of whatever
connection the admin binds to a `connection_ref` parameter (the builder writes `@param:<key>` and refuses a parameter that
is not a `connection_ref`). A package that sends or receives email names the parameter its Email steps and email
triggers use this way and lists no provider's host: `{ "connection": "${param:mail_connection_id}", "purpose": "Reading and
sending mail through the chosen connection" }`. `lint` warns `email_egress_not_by_connection` when it does not.

A parameter's `type` matters to the builder: it checks the type wherever a config file names a parameter
for a purpose (see Rules and Work).

## An entity file

`entities/<key>.json`. The file name, without `.json`, must equal `key`. `name` (a non-empty string),
`fields` (an array), `views` (an array) and `access` (an object) are required; a file without one is refused
with a location (`entities/note.json#/views: an array of views`), as is `access.grants` that is not an array.

| Member | Meaning |
|---|---|
| `key` | The entity key; equals the file name. |
| `name`, `description`, `icon`, `accent` | Carried to the entity unchanged. |
| `fields` | An array of fields (below). |
| `natural_key` | The field keys that identify a record. `[]` for none. References are translated. |
| `display_field` | The field key shown as the record's title. |
| `views` | An array of views (below). |
| `metrics` | An array of metrics (below). Optional. |
| `create_form` | `{ "name", "description"?, "schema" }`: the form for creating a record (below). |
| `access` | `{ "mode", "grants" }`: the entity's access mode and its grants (below). |
| `conversation` | Declares the entity a conversation. Carried unchanged, references translated. Omitted when null. |
| `rules` | Record rules (below). |
| `stage_model` | Stage gates on a status field (below). |
| `work` | Work contracts: lifecycle, assignable, work surface, deadline (below). |
| `requires_unit_classification` | `true` files each record in one of the organization's units. AgentFlow then adds a read-only `unit` field, which views, rules and stage moves may name and nothing of the package writes: the build refuses a field of your own keyed `unit`, a `seed` on the entity, a create form that binds `unit` and an Entity Record step whose body does. Grants may then use the unit scopes (below), and `create` and `upsert` take a `destinationUnit` (the workflow helpers). Anything but a boolean is refused. |

```json
{
  "key": "note",
  "name": "Note",
  "icon": "sticky-note",
  "accent": "amber",
  "fields": [
    { "key": "ticket", "label": "Ticket", "type": "reference", "target_entity_id": "${entity:ticket}",
      "inverse_key": "notes", "inverse_label": "Notes" },
    { "key": "body", "label": "Note", "type": "text", "searchable": true }
  ],
  "natural_key": [],
  "display_field": "body",
  "views": [{ "name": "All", "key": "all" }],
  "access": { "mode": "restricted", "grants": [] }
}
```

### A field

Each field becomes an `entity_field:<entity>/<key>` object. Members:

`key`, `type`, `label`, `description`, `required`, `searchable`, `filterable`, `facetable`, `sortable`,
`enum_values`, `default`, `format`, `format_options`, `inverse_key`, `inverse_label`, `target_entity_id`,
`on_target_delete`, `auto_number_scope`, `auto_number_format`, `formula_expression`, `formula_result_type`,
`rollup`, `item_fields`, `constraints`, `reference_filter`, `recommendedSecured`, `queriedByApp`.

The builder gives meaning to a few of them and passes the rest to the platform, which defines them:

- `type`: one of `text`, `number`, `boolean`, `date`, `datetime`, `enum`, `reference`, `multi_select`,
  `reference_list`, `file`, `formula`, `auto_number`, `list`.
- `format`: one the field's values take: `email`, `url`, `phone` or `richtext` on text; `currency`, `percent`,
  `duration` or `rating` on a number; `dd_mm_yyyy`, `mm_dd_yyyy`, `iso`, `long`, `month_year` or `relative` on a date
  or datetime; `image` on a file; none on the other types. A formula takes its `formula_result_type`'s; an
  `auto_number`'s is not checked.
- `format_options`: its names are `currency_code`, `rating_max`, `duration_unit`, `duration_format`, `display`,
  `done_field`, `mentions`, `bar`, `bar_bands`, `decimal_places` (a whole number from 0 to 8), `separators` (`locale`,
  `comma_dot`, `dot_comma`, `space_comma` or `none`), `time_style` and `max_files`. Each one's value, and which type
  and format take it, are checked as the platform checks them (a formula by its `formula_result_type`, an
  `auto_number` as `number` without `auto_number_format` and as `text` with one); a checklist's columns are the
  platform's to check.
- `on_target_delete`: one of `restrict`, `clear`, `cascade`.
- `item_fields`: for a list field, an array of columns. A column has `key`, `label`, `type`, `required`,
  `history`, `enum_values`; its `type` is one of `text`, `number`, `boolean`, `date`, `enum`.
- `constraints`: `min_length`, `max_length`, `pattern`, `minimum`, `maximum`, `min_items`, `max_items`,
  `enforce_format`. Each one's value, and which type takes it, are checked as the platform checks them, by the same
  type as `format_options`; whether a `pattern` is a regular expression the platform takes is left to it.
- `rollup`: `inverseKey`, `agg`, `field`, `filter`.

A `null` `constraints` or `rollup` is read as none, as the platform reads it.
- `target_entity_id`: a `${entity:key}` or a reserved id, as above.
- `recommendedSecured`: `true` or `false`. A package never secures a field: the organization does, on its Field
  access page. `true` asks it to, and the install plan warns about the field until it is secured.
- `queriedByApp`: `true` or `false`. `true` says the app's module filters or sorts on the field, so securing it
  would break the module's screens for people who cannot read it. Write it only for the fields the module queries.
  A field cannot carry `queriedByApp: true` and `recommendedSecured: true` together: the build refuses the pair at
  `/fields/<n>/queriedByApp`. A package whose fields carry the member, with either value, needs platform `2027.01`
  (below).

`key` is required and must be a non-empty string. Any other member is refused, and so is `sensitive`, with a
message that names `recommendedSecured`.

```json
{ "key": "checklist", "type": "list", "label": "Checklist", "sortable": false,
  "item_fields": [
    { "key": "text", "label": "Text", "type": "text", "required": true },
    { "key": "done", "label": "Done", "type": "boolean", "history": false }
  ],
  "format_options": { "display": "checklist", "done_field": "done" },
  "constraints": { "max_items": 20 } }
```

An entity whose `work` seeds fields (below) may not declare a field with one of those keys.

### A view

Each view becomes an `entity_view:<entity>/<key>` object. Members: `key`, `name`, `description`, `type`,
`config`, `columns`, `filters`, `sort`. `key` is required and must be a non-empty string.

- `type` is one of `grid` (the default), `kanban`, `calendar`, `gallery`, `timeline`, `map`, `inbox`,
  `detail`. Other types (`dispatch`, `matrix`) are refused.
- `columns` is an array of field keys. Each must be a field of the entity, including the fields its `work`
  seeds.
- `filters` is an array of objects. Each filter's `field` must be a field of the entity (or `<reference field>.<field>` through a reference field: a hop to another entity of the package is checked against that entity's fields, and a hop to an entity outside the package is allowed but not checked here, so AgentFlow checks it at install), its `op` must suit the field's type, a `within` value must be `today`, `this_month`, `this_quarter`, `this_year`, `before_today`, `after_today` or `last_<n>_days` (n from 1 to 3660, no leading zero), and a `$bind` value is refused. The same checks apply to a preset's `rules`, which may carry `$bind` and may not go through a reference.
- `config` and `sort` are objects. `sort` defaults to
  `{ "key": "updated_at", "dir": "desc" }`.
- References inside `config`, `filters` and `sort` are translated.

A view's `config.presets` holds saved filters; a `$bind` value (`viewer.id`, `viewer.groups`, `today`) reads the viewer, and it does so only there. A `filters` entry is fixed: the platform would compare a `$bind` in it as text and the view would list nothing, so the build refuses it.

```json
{ "key": "mine", "name": "My tasks", "type": "grid",
  "columns": ["title", "status", "claimed_by"],
  "filters": [{ "field": "status", "op": "eq", "value": "open" }],
  "sort": { "key": "title", "dir": "asc" },
  "config": { "presets": [{ "id": "0190f8f4-0000-7000-8000-0000000000f1", "label": "Mine",
    "rules": [{ "field": "claimed_by", "op": "eq", "value": { "$bind": "viewer.id" } }] }] } }
```

### A metric

Each entry of `metrics` becomes an `entity_metric:<entity>/<key>` object: a measure of the entity's records that its
views' summaries and its dashboards' tiles can show, kept in the entity's metric catalogue (the Metrics tab). Members:
`key`, `label`, `fn`, `field`, `filter`, `group_by`, `ratio`, `thresholds`, `color`, `percentile`, `duration`,
`deprecated`. `key` must be a non-empty string, `label` a string with something in it, and `fn` a string. The object is
the entry less its `key`, translated as a view is, so it takes no member beyond these.

```json
"metrics": [
  { "key": "open_items", "label": "Open items", "fn": "count",
    "filter": [{ "field": "status", "op": "in", "value": ["todo", "doing"] }],
    "thresholds": [{ "at": 20, "color": "amber" }] },
  { "key": "p90_age", "label": "Slowest 10%", "fn": "percentile", "field": "age_days", "percentile": { "p": 90 } }
]
```

A package names a metric in two places, and neither by id, because an organization's metric ids do not exist until the
package installs:

- **A view's summary** lists the metrics it shows as `config.summary.metric_ids`, each a
  `${entity_metric:<entity>/<key>}` that the build writes as a sentinel. A sentinel that names no metric of the package is
  refused as any other is.
- **A related list's `summary_metrics`** mixes two kinds of entry: the inline metric of a view the list is bound to (an
  id in that view's `config.summary.metrics`) stays as written, and a catalogue metric is
  `${entity_metric:<entity>/<key>}`. `agentflow-app lint` refuses any other id there as `uuid_literal`.
- **A dashboard tile's measure** follows a metric by key: `{ "id": "<uuid>", "metric": "open_items", "primary": true }`, on a
  tile whose `query.entity_id` is the entity that defines the key. The build refuses a key that entity does not define in
  the same build, naming the tile and the key (`dashboards/o.json#/tiles/0/query/measures/0/metric: the tile "Open"
  follows the metric closed_items, which task does not define`), and a tile whose entity is not one of the package's. A
  measure that carries `entity_metric_id` is refused too: write `metric`.

A package that ships a metric needs platform `2027.03` (`METRICS_PLATFORM`), because an older deployment refuses the
kind. The build raises `minPlatformVersion` to it, and a later month stays.

A package ships and follows only its own metrics: a manifest cannot export one or ask a dependency for one. Installed,
the organization may relabel a metric, recolour it and change its thresholds, and AgentFlow refuses a change to its key
or to what it counts. An organization that relabels a metric is asked at the next upgrade that changes the metric's
definition whether to keep its label and the old definition or take the release's.

The build checks the members and the references above. The definition itself (that `field` and the fields in `filter`
exist and suit `fn`, a `ratio`, a `percentile` or a `duration`, and at most 16 metrics on an entity) is judged by
AgentFlow when the package installs.

### The create form

`create_form` has `name`, `description` and `schema`, and becomes a `form:<entity>` object bound to the
entity. `schema` is a JSON Schema whose properties name entity fields with `x-entityField`; a name that is not a
field of the entity is refused at build, because AgentFlow refuses the install (`name` is always a field). An `x-entity`
names the entity a reference property picks from: a key of the package, `user`, `group` (AgentFlow's Groups picker) or
`org_unit`, or a `${dep:…}` of a required package. The form's UI schema is always a vertical layout.

```json
{ "name": "Note",
  "schema": { "type": "object", "properties": {
    "ticket": { "type": "string", "format": "entity", "x-entity": "ticket", "x-entityField": "ticket" },
    "body": { "type": "string", "x-entityField": "body" } } } }
```

### Access and grants

`access` has `mode` and `grants`. `mode` is required and is `everyone` or `restricted`; anything else, or
no mode, is refused (`entities/note.json#/access/mode: one of everyone, restricted`), because the installer
would default a missing mode to Everyone. The starter, the case desk, uses `restricted`. A grant has
`principal`, `design` and `operations`:

- `principal` is `{ "kind": "group", "id": "${param:…}" }` or `{ "kind": "everyone" }`. Nothing else may be
  granted to: not a service principal, not a user. A group grant's `id` must be a `${param:key}` that the manifest declares with type `group_ref`. An
  Everyone grant has no `id`, and an entity may have only one.
- `design` may be absent or `false`. A package grant never carries design authority.
- `operations` is a non-empty array of `{ "operation", "scope"?, "record_scopes"? }`. `operation` is one of
  `read`, `list`, `create`, `update`, `delete`, `assign`, each at most once per grant. An entry needs
  `scope`, `record_scopes`, or both. `scope` is a string such as `organization` or `own`, carried as given.
  On an entity with `requires_unit_classification: true` it may also follow the organization's units:
  `placement` (the records in the unit the person acting is placed in), `placement_subtree` (that unit and the units
  below it), or `{ "scope": "unit" | "subtree", "anchor": "${param:…}" }` (one unit, or it and the units below it,
  named by a `unit_ref` parameter). The build refuses each of the four on an entity without the member, and an
  anchor that is not a `${param:…}` of a `unit_ref` parameter.
- `record_scopes` is a non-empty array that limits an operation to records the caller is tied to:
  - `{ "kind": "field", "field": "collaborators" }`: a people field of this entity (a reference or
    reference list to Users, Groups or Units). It must be a field the entity declares, not one the work
    seeds.
  - `{ "kind": "parent_field", "field": "project", "parent_field": "managers" }`: `field` is a single
    reference to another entity of the package, and `parent_field` a people field that entity declares.
  - `{ "kind": "work" }`: the records the caller holds work on. The entity needs `work.assignable`.
  - On `create`, only a `parent_field` scope is allowed.

```json
"access": { "mode": "restricted", "grants": [
  { "principal": { "kind": "group", "id": "${param:staff_group_id}" }, "design": false,
    "operations": [{ "operation": "read", "scope": "organization" }, { "operation": "update", "scope": "organization" }] },
  { "principal": { "kind": "everyone" },
    "operations": [
      { "operation": "read", "record_scopes": [
        { "kind": "parent_field", "field": "project", "parent_field": "managers" },
        { "kind": "field", "field": "collaborators" }] },
      { "operation": "list", "scope": "organization" }] }
] }
```

Each grant becomes an entry of the manifest's `grants`, keyed `<entity>_<recipient>`: the parameter's key
without a trailing `_group_id` (`staff_group_id` gives `task_staff`), or `everyone`.

### Rules

`rules` is an array of at most 50 record rules. A rule refuses a write when its condition holds. Members:
`key`, `name`, `condition`, `message`, `field`, `enabled`. `key`, `condition` and `message` are required;
the rest are optional.

- `key` is lowercase, starts with a letter, at most 40 characters of letters, digits and single `_`; unique
  in the entity. `name` is 1 to 120 characters, `message` 1 to 300. `field` names a field of the entity;
  `enabled` is a boolean.
- `condition` is `{ "join"?: "and" | "or", "leaves": [...] }` with 1 to 20 leaves.
- A field leaf, `{ "kind": "field", "rule": { "field", "op", "value"? } }`, tests a record's value. `field` is
  an own or seeded field, or one hop through a single reference to a package entity (`project.name`).
  A `value` may be a literal, `{ "$field": "other_field" }` or
  `{ "$date": { "offset": -18, "unit": "years" } }` (`unit`: `days`, `weeks`, `months`, `years`). A `$bind` is
  refused: a rule judges the record and its write, which have no viewer (test the writer with an actor leaf).
- A write leaf, `{ "kind": "write", "write": { "op", … } }`, tests the write. `op` is one of `is_new`,
  `is_update`, `changed` (`field`), `changed_any` (`fields`), `was` (`rule`, a field test with no hop),
  `actor` (`test`, and `negate`: a boolean, only on `actor`).
- An actor `test` has a `kind`: `is_owner`, `is_elevated_run`, `is_holder` (needs `work.assignable`),
  `in_field` (`field`, a people field), `in_parent_field` (`field`, `parent_field`) or `in_group`
  (`group_id`, a `${param:…}` of type `group_ref`).

```json
"rules": [{
  "key": "frozen_is_frozen", "message": "A frozen record is read only",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "is_update" } },
    { "kind": "write", "write": { "op": "actor", "negate": true,
      "test": { "kind": "in_group", "group_id": "${param:automation_group}" } } } ] }
}]
```

### Stage model

`stage_model` gates status changes. Members: `status_field`, `initial_statuses`, `transitions`.
`status_field` and `transitions` are required; `initial_statuses` is optional.
`status_field` is an enum field the entity declares (not a seeded one). `initial_statuses` are values of
it. Each transition has `from` and `to` (values of the field; both required), and optionally `required_fields` (field keys
that must be set) and `condition` and `movers`. `movers` is an array of actor tests, the same as in a rule.

```json
"stage_model": { "status_field": "status", "initial_statuses": ["todo"], "transitions": [
  { "from": "doing", "to": "done", "required_fields": ["title"], "movers": [{ "kind": "is_holder" }] }
] }
```

### Work

`work` has at least one of `lifecycle`, `assignable`, `work_surface`, `deadline`. `assignable` and
`deadline` need `lifecycle`; `work_surface` needs `assignable`.

- `lifecycle`: `{ "status_field", "categories" }`, both required. `status_field` is an own enum field. `categories` maps
  every value of it, and no other, to one of `none`, `active`, `waiting`, `done`, `cancelled`.
- `assignable`: `{ "claim"?: "candidates" | "readers", "rules"?: [...] }`. A routing rule is
  `{ "on", "when"?, "assign" }` (`on` and `assign` required). `on` is `"start"` or `{ "enter": [statuses] }`; `when` is JSONLogic in which every object applies exactly one operator (`{ "==": [{ "var": "role" }, "tm"] }`), so a rule's `{ join, leaves }` is refused;
  `assign` is 1 to 50 assignees (at most 50 rules):
  - `{ "kind": "user", "id": "${param:…}" }`: a `user_ref` parameter. A `group` assignee takes a `group_ref` parameter in `id`.
  - `{ "kind": "unit", "anchor": { "type": "fixed", "unit_id": "${param:…}" }, "reach"?: "unit" | "subtree", "group"? }`:
    `anchor` is required and `unit_id` is a `unit_ref` parameter; an optional `group` is a `group_ref` parameter.
    `{ "type": "record_unit" }` anchors the pool at the record's own unit instead, on an entity with
    `requires_unit_classification: true`, and names no unit.
  - `{ "kind": "dynamic", "source", "relation"?, "fallback"? }`: `source` is `{ "type": "creator" }` or
    `{ "type": "field", "key" }` (a people field the entity declares, not Units); `relation` is
    `{ "type": "direct" }` or `{ "type": "manager", "levels": 1-5 }` (a manager needs a single reference to
    Users); `fallback` is up to 50 `user`, `group` or `unit` assignees.
- `work_surface`: `{ "priority": { "field", "values"? } }`. `field` is an own enum field; `values` maps
  its values to `urgent`, `high`, `normal` or `low`.
- `deadline`: `{ "clocks": [...] }`, 1 to 5 clocks. A clock has `key` (`^[a-z][a-z0-9_]{0,23}$`), `label`
  (1 to 80 characters), `start`, `pause_in`, `stop`, `sla_policy`, `escalation_policy`; `key`, `label`,
  `start` and `sla_policy` are required. `start` is
  `{ "on": "work_start" }` or `{ "on": "enter", "statuses": [...] }`; `pause_in` is a list of statuses;
  `stop` is `{ "statuses"?, "field"? }` (`field` is a field the entity declares itself, not a seeded one); `sla_policy` is a `sla_policy_ref` parameter and
  `escalation_policy` an `escalation_policy_ref` parameter.

`work` holds no `document`: the document contract is the entity's own member (below). The build refuses
`work.document`, whatever its value, with
`entities/<key>.json#/work/document: DOCUMENT_CONTRACT_MOVED: The document contract is the entity's own "document" member since platform 2027.06, not part of "work".`,
the code and text AgentFlow's lint and package verification refuse it with.

Work seeds fields on the entity, which rules, views, scopes and stage models may name:

- `lifecycle`: `work_state`, `work_started_at`, `done_at`.
- `assignable`: `assigned_users`, `assigned_groups`, `assigned_units`, `claimed_by`, `assigned_at`,
  `claimed_at`, `minutes_to_claim`, `minutes_to_done`.
- each clock: `<key>_state`, `<key>_outcome`, `<key>_due_at`, `<key>_breached_at`, `<key>_stopped_at`,
  `<key>_minutes`.

The document contract seeds `document_file` (a File field of one file), `document_status` and
`document_page_count`.

```json
"work": {
  "lifecycle": { "status_field": "status", "categories": { "todo": "active", "doing": "active", "done": "done" } },
  "assignable": { "claim": "readers", "rules": [
    { "on": "start", "assign": [{ "kind": "dynamic", "source": { "type": "creator" } }] },
    { "on": { "enter": ["doing"] }, "assign": [{ "kind": "group", "id": "${param:automation_group}" }] }
  ] },
  "work_surface": { "priority": { "field": "priority", "values": { "high": "urgent", "low": "low" } } },
  "deadline": { "clocks": [{ "key": "due", "label": "Due", "start": { "on": "work_start" },
    "pause_in": ["doing"], "sla_policy": "${param:sla}" }] }
}
```

### Document contract

`document` is the entity's own member, beside `work`:
`{ "context_fields"?: [...], "extract_fields"?: [...] }`, the contract that reads each record's one file and fills
fields from it; it needs no work contract. The build refuses what package verification refuses: `extract_fields`
names fields the entity declares, of type `text`, `number`, `boolean`, `date`, `datetime`, `enum` or
`multi_select`, never the lifecycle's status field, a seeded field, `unit` or a system field (`created_at`,
`updated_at`, `created_by`, `owner`); `context_fields` names a declared field, a seeded one, one of those four
system fields or `unit` on an entity that says `requires_unit_classification: true` (`unit` is a reference, which
the model is never shown, so naming it shows the model nothing). It seeds `document_file`, `document_status` and
`document_page_count`, which no own field may take. An entity a source fills declares none. An older deployment
refuses the member, so a package whose entity holds it needs platform `2027.06`: the build raises
`minPlatformVersion` to `DOCUMENT_PLATFORM` (`2027.06`) for one, and a later month stays.

```json
"document": { "extract_fields": ["title", "priority"], "context_fields": ["status"] }
```

## Agents and skills

`agents/<key>.json` holds the agent's `key`, which must equal the file name, and any other members, which
are carried to the `agent:<key>` object with references translated. An agent usually carries `name`,
`description`, `profile` (`systemPrompt`, `skills`, `model`), `access` and `read_limit`; the platform defines them.

`read_limit` is the records the agent may read: `{ "entities": [{ "entity": "${entity:ticket}", "operations": ["read", "list"] }] }`.
The builder refuses an entity that is not a `${entity:<key>}` reference, an entity named twice, an `operations` list that
is empty, repeats or names anything but `read` and `list`, and any other member at either level.

A `read_limit` may also list `memory_types` (`["${memory_type:known_issue}"]`), the package's own memory types the agent
may read, and `profile.memorySave` names the types and relationships it saves into; the limit must cover every type it
saves into. See "Memory types" below.

```json
{ "key": "triage", "name": "Triage agent", "description": "Labels each conversation.",
  "profile": { "systemPrompt": "…", "skills": ["${skill:refunds}"], "model": "${param:triage_model}" },
  "access": { "mode": "restricted", "groups": ["${param:support_group_id}"] } }
```

`skills/<name>.SKILL.md` is read as the installer reads it: a frontmatter between the first two `---`
lines, then the body, kept exactly (a CRLF file is read as LF, so a Windows checkout builds the same object). The frontmatter holds exactly `name` and `description`, each a plain
`name: value` line (no quotes, no YAML syntax, no `: ` or ` #` inside the value). The file must be named
for the skill with each `-` in `name` written `_`: `name: account-access` is `account_access.SKILL.md`, the
object `skill:account_access`, and `${skill:account-access}` in references.

```
---
name: refunds
description: How to answer a customer who asks for a refund, and what you may promise.
---

# Refunds and returns
```

## Memory types

`memory_types/<key>.json` and `memory_relationships/<key>.json` declare what an agent may learn or save; they build to
`memory_type:<key>` and `memory_relationship:<key>`, after the entities and before the skills and agents. The key is
the file name, and one key cannot be in both folders. A type has `name`, `describe`, `fields` (one to 30 single-valued
fields), `title` (with `{{ field }}` references to its fields), `review`, and optionally `search_on` (text or choice
fields only; `app-package lint` judges the rest of each field's shape), `recall`,
`max_per_about`, `expire_after_days`, `never_store`, `grants` and `deprecated`. A grant's `to` is `everyone` or a
`${param:<key>}` of a `group_ref` parameter, each principal once, at most 200; leave `grants` out and the type is
readable by everyone. A relationship has `name`, `description`, `from`, `to` (each `{kind: "entity" | "memory_type", id}`
with a matching `${entity:…}` or `${memory_type:…}` reference), `review`, and optionally `attributes` and `deprecated`.
`profile.memorySave` is `{types, relationships?, about?, orgWide?, review?, instructions?}`; the builder refuses a save
into a deprecated definition and one the agent's `read_limit.memory_types` does not cover. Memory content never ships.
The authoring skill's `reference/memory.md` is the full description, with what an upgrade, a drop and an undo do.

## Dashboards

`dashboards/<key>.json`; the file name equals `key`. Members: `key`, `name`, `description`, `tiles`.
`tiles` is an array of objects, each with a `kind` of `number`, `chart`, `list` or `text`; the rest of a tile
is carried to the platform. Every `entity_id` inside a tile is read as an entity: `${entity:key}` of the
package, or a reserved id. The dashboard becomes `dashboard:<key>`.

A `filter_bar` is refused: the installer cannot install a dashboard filter bar yet.

A tile's measure may follow a metric of its entity by key instead of defining one: `{ "id": …, "metric": "open_items",
"primary": true }`. The key must be a metric the build ships for the tile's entity (see "A metric" under an entity
file), the build refuses one that is not, and the dashboard then needs platform `2027.03`, which the metric already
raised.

A tile whose `measures` hold a `fn: "percentile"` or a `duration` member needs platform `2027.01`, because an older
deployment accepts the package and then fails when it plans the release. The build raises `minPlatformVersion` to
`MEASURES_PLATFORM` (`2027.01`) for such a dashboard, and for a view in an entity file whose `config` holds one in a
`metrics` list; a later month stays. It does not read what a module calls, so a module that sends either to
`POST /analytics/tiles/compute` sets the month by hand.

```json
{ "key": "overview", "name": "Overview", "description": "Open work",
  "tiles": [{
    "kind": "number", "id": "0190f8f4-0000-7000-8000-0000000000a1", "label": "Open",
    "query": { "entity_id": "${entity:task}",
      "measures": [{ "id": "0190f8f4-0000-7000-8000-0000000000b1", "fn": "count", "primary": true }] },
    "position": { "row": 0, "col": 0, "w": 6, "h": 5 } }] }
```

## Document templates

`document_templates/<key>.json`; the file name equals `key`, a lowercase key of letters, digits and `_`. It
becomes `document_template:<key>`, listed after the agents and before the workflows, and a `document` step
names it with `${document_template:<key>}` in `documentTemplateId`. Members: `key`, `name` (required),
`description`, `schema_json` (required: the JSON Schema of the values the layout reads), `sensitive_field_paths`
and `template` (the layout). A template without `template` builds and installs, as AgentFlow allows, but
renders nothing until it is laid out. `description`, and a layout's `settings`, `header` and `footer`, may be
`null`; a `null` description is left out.

`template` is the bare block tree, `{ "version": 1, "blocks": [ … ] }`, with optional `settings`, `header` and
`footer` (`{ "blocks": [ … ] }`). It is not the designer export's envelope
(`{ "mode": "block", "kind": "typst", "block_tree": … }`): that is refused with a message saying to move
`block_tree`'s members up. The builder checks what the platform would refuse when it installs the layout:

- every block, nested ones included (in a `column_group`'s columns, a `static_table`'s cells, the header and
  the footer), has a UUID `id` (`…#/template/blocks/0/id: must be a UUID, such as …`);
- its `type` is one of `text`, `heading`, `blockquote`, `column_group`, `table`, `static_table`,
  `page_break`, `spacer` and `rich_text`. An `image` block is refused: a packaged template cannot hold an image
  yet, because AgentFlow renders no image from a submission field and a package carries no template asset;
- a `field_ref`'s `path`, and a `rich_text` block's, is a property of `schema_json`, dotted for a nested one
  (`…#/template/blocks/1/content/1/path: numbr is not a property of schema_json`). A reference with an
  `expression` (any, on a `field_ref`; a non-empty one, on a `rich_text` block), and one in a
  `static_table`'s repeated row (which reads the row's item), is left to the platform.

Every `documentTemplateId` a step names a template with must be a `${document_template:<key>}` reference: a
`document` step's `documents`, a `signature` step's `documents` and a Human step's `signing.documents` (each when
its `source` is `renderDocumentTemplate`), and a Human step's `reviewDocuments`. A key or an id written as it is is
refused (`workflow approve_leave#/graph/nodes/1/parameters/documents/0/documentTemplateId: name the
template with ${document_template:<key>}, not approval_letter`).

An `x-entity` in `schema_json` is read as an entity of the package, as in a workflow's `input_schema`. The rest
of a block is carried to the platform as written.

```json
{ "key": "approval_letter", "name": "Approval letter",
  "schema_json": { "type": "object", "properties": { "number": { "type": "string", "title": "Request number" } } },
  "template": { "version": 1, "blocks": [
    { "id": "0190f8f4-0000-7000-8000-000000000001", "type": "heading", "level": 1,
      "content": [{ "type": "text", "value": "Leave approved" }] },
    { "id": "0190f8f4-0000-7000-8000-000000000002", "type": "text",
      "content": [{ "type": "text", "value": "Request " }, { "type": "field_ref", "path": "number" }] }] } }
```

In the step, `fieldMapping` keys are JSON pointers into `schema_json` and values are bindings; `format` is
`pdf`, `docx` or `both`. The rendered file is the step's `generated_files` output: bind it to a `file` field
in a later Entity Record step to keep it on the record.

```js
node("letter", "Write the approval letter", "document", { documents: [{
  id: "letter", documentTemplateId: "${document_template:approval_letter}", format: "pdf",
  fieldMapping: { "/number": ref("subject.record.number") } }] })
```

## Workflows, triggers and actions

These are objects in code, in any number of modules. Each module exports some of `workflows`, `triggers`
and `actions`. `merge` combines the modules and checks every graph. Only `merge` runs the graph checks: a
`Sections` value built another way gets none.

```js
import { call, edges, end, graph, restricted, servicePrincipal, start, workflow } from "@reflexify/agentflow-app-builder/workflow";

export const workflows = {
  intake: workflow(
    "support_intake", "Support: Intake", "Files an inbound email as a ticket.",
    servicePrincipal("automation_principal_id"), restricted("support_group_id"),
    graph("Support: Intake", [start(), end("done", "Done")], edges(["e1", "start", "done"])),
  ),
};
```

A **workflow** is `{ key, name, description, run_as, start_access, input_schema?, output_schema?, tool_enabled?, graph }`.
`input_schema` and `output_schema` are optional JSON Schemas, references translated.
The workflows map is keyed by a build-local name (`intake` above), which is what `order` lists; the
workflow's own `key` is what references use.

- `run_as` (required) is `{ "policy": "initiator" }` or `{ "policy": "service_principal", "service_principal_id": "${param:…}" }`.
  `lint` requires the first for a workflow that people start (a start grant, an entity action, or a Call from one of
  those) and the second for a workflow a trigger starts (`run_as_not_initiator`, `run_as_not_service_principal`,
  `run_as_conflict`).
- `input_schema` describes the run's input, read as `input.<name>`. A record picker (`format: "entity"` with an
  `x-entity`: an entity key of the package, `user`, `group` or `org_unit`) is written as in an entity's `create_form`, and the
  builder writes the key form, so the schema validates, lints and installs. AgentFlow draws no launch form from
  `input_schema`, so a person cannot pick a record there. To let a person choose a record, use an entity action
  (`subject`), a record whose `created` trigger starts the workflow, or a UI module.
- `start_access` is `{ "mode": "restricted", "group_ids": ["${param:…}"] }`. `everyone` is refused. Each
  group becomes a start grant `start_<key>`, then `start_<key>_2`, and so on. An empty `group_ids`
  (`NOBODY`) grants no one.
- `tool_enabled` (optional) is `true` or `false`. `true` ships the workflow switched on as a tool for agents and for
  MCP and A2A clients, and the output carries `toolEnabled: true`; `false` or no member writes nothing, and any other
  value is refused at `/tool_enabled`. The `workflow(...)` helper has no parameter for it, so spread its result:
  `{ ...workflow("approve_invoice", …), tool_enabled: true }`. `lint` refuses it on a workflow that has no description,
  has an End step that maps no output, is started by a trigger of the package, or runs over a set of records
  (`workflow_tool_requirements_unmet`). The platform takes the value only when the workflow is first installed (a fresh
  install, or a workflow that first appears in an upgrade); after that the organization owns the switch.
- `graph` has `schemaVersion`, `name`, `start`, `end`, `nodes`, `edges`, and optionally `transaction` and
  `variables`. A node is `{ id, name, node_type, parameters, settings }`.
- A `code` node's `parameters.source` must be `{ "$file": "code/name.js" }`; the builder reads the file
  (relative to `configDir`) into the source, with CRLF line endings read as LF.
- An `email` node's `parameters.email.connection`, when present, must be `"${param:…}"`, a `connection_ref` parameter
  (category `email`, or none), and becomes `@param:…`. It names no provider: the admin binds the parameter to any email
  connection the organization has. The object form `{ provider, externalAccountId }` and a string that is not a
  `${param:…}` are refused (`an Email step names its connection with connection: ${param:…}, a connection_ref parameter of the package`).

`merge` checks each graph (the build does not repeat it): unique node and edge ids; every edge joins two nodes of the graph;
an End has no outbound edge; a plain step has exactly one; a Fork owns exactly its arms' edges, has at least two
arms, wires one edge per arm and sends each arm to a step of its own; a Signature step with a decline route
(`onDecline: { kind: "branch" }`) owns the route's edges and has exactly one more, the signed path; a Decision or
Human step owns exactly the edges its branches or actions name, and a Human step's `signing` decline route, `endWhen`
branch and escalation timeout branch (`timeoutBranch`) as well
(an `{ kind: "action" }` route adds no edge, and an edge an action owns may not also be the route's);
everything is reachable from `start`; a loop (a For Each body is checked as a graph of its own) is entered
at one step, holds no second loop, and holds only Human, Agent, Decision, Document, Email, Webhook, Set Variable,
Fork, Join, Extract Text, Image, Learn, Entity Relationship, Code and Notify steps, the kinds publish admits; a
Fork reaches a Join, a Join has a Fork before it, and no Decision, Human or routed Signature step feeds a Join
directly; a Join carries no member but `id` and `label` (the builder's own rule: AgentFlow would ignore one, `wait`
included); a Decision condition uses only `==`, `!=`, `<`, `<=`, `>`, `>=`, `!!`, `!`, compares a
`var`, and never compares two vars.

A Human step can name the page of the package's own UI module that its tasks open at, in its parameters:
`node("review", "Review", "human", { assignment, page: { path: "/review/{{ record_id }}", mode: "redirect" }, actions })`.
`{{ record_id }}` is the id of the **task**, not of the record the run is about, and it may appear once. AgentFlow's task links
(My Work, a notification, the task's record) then open `/apps/<key>/review/<task id>` in place of the task panel, which stays
the fallback and where the task can always be finished. `build` refuses, naming the pointer
(`workflow <key>#/graph/nodes/<i>/parameters/page: …`), a page on a step that is not a Human step, a page in a package with no
`ui` member in `package-manifest.json`, a path that is not a module path (it starts with `/`, holds `{{ record_id }}` at most
once and no other `{{`, and passes the platform's path rule), and any `mode` but `redirect` (`embedded` is reserved). It checks
these at any For Each depth, in that order, as verification and `agentflow-app lint` do, and raises `minPlatformVersion` to
`2027.02` (`TASK_PAGES_PLATFORM`) when any workflow holds a page. The module reads the task through `host.tasks` or
`<agentflow-task>` (see `@reflexify/agentflow-sdk` and `@reflexify/agentflow-elements`); `sdk/examples/task-page` is the worked
example. Only a package sets a page, and an organization's own workflow ignores one.

A **trigger** is `{ workflow, kind, enabled?, config }`. `workflow` is a workflow `key` of the package.
A trigger always ships off: the output carries `enabled: false` whatever you write, and arming the package
turns it on. For `kind: "connected_app"`, `config.connection` must be a `${param:…}`, the `connection_ref` parameter the
trigger listens through (it becomes `config.account`; no provider is written). `config.provider` and
`config.external_account_id` are refused, naming `connection`, and a connected_app trigger with no `connection` is refused
(`trigger intake#/config: a connected_app trigger names its connection with connection: ${param:…}`). Triggers are written under their own name, sorted by name.

```js
export const triggers = {
  intake: { workflow: "support_intake", kind: "connected_app", config: {
    connection: "${param:mail_connection_id}",
    object_type: "email.received", change_kind: "created", filter: {} } },
};
```

An **action** is `{ entity, action }`, a button on an entity's records that starts a workflow. `entity` is
a key of the package; `action` has `workflow_id` (`${workflow:key}` of the package), `key`, `label`,
`scope`, `mode`, `visible_when`, `input_map`, `tone`, `icon`. It becomes `entity_action:<entity>/<key>`;
`key` is required and must be a non-empty string (`action <name>#/action/key: a non-empty string`).

```js
export const actions = {
  generate_reply: { entity: "ticket", action: {
    workflow_id: "${workflow:support_draft_reply}", label: "Generate reply", key: "generate_reply",
    scope: "row", mode: "sync", input_map: [{ from: "record.id", to: "subject" }], icon: "sparkles" } },
};
```

### The `./workflow` helpers

`@reflexify/agentflow-app-builder/workflow` exports the pieces to build a graph. A node is the plain object
above; these only save typing.

- Names: `installedKey(packageId, key)`, the key an object of the package gets when it is installed
  (`installedKey("rfx/hrm", "employee")` is `"rfx_hrm__employee"`), which a path writes for a profile inverse or for a
  field the package adds to another package's entity. It refuses a package id with no `/`.
- Constants: `INITIATOR` (a run-as of the initiator), `NOBODY` (a start access that grants no one), `NOW`
  (`{{ now() }}` as a template binding).
- Workflow: `workflow(key, name, description, runAs, startAccess, graph, inputSchema?)`,
  `servicePrincipal(paramKey)`, `restricted(...groupParamKeys)`, `graph(name, nodes, edges, transaction?)`,
  `edges(...[id, from, to])`.
- Steps: `node(id, name, nodeType, params?, settings?)`, `start({ subject?, params? })`,
  `end(id, name, outcome?, outputs?)`, `decision(id, name, branches)` with `when(edge, condition)` and
  `otherwise(edge)`, `setvar(id, name, [[target, binding]])`, `readParameters(...names)`,
  `call(id, name, workflow, subjectSource?, inputs?, settings?)`, `code(id, name, file, inputs, outputSchema)`,
  `fork(id, name, [edgeIds])` (arms `arm_1`, `arm_2`, …, one edge each) and `join(id, name)`.
  `subjectSource` is a path, as a string, that reads the id of the record the called run is about, such as
  `"subject.record_id"`; left out, the called run takes the caller's own record when it is of the callee's entity.
  `call` refuses any other shape at build.
- Entity steps: `getById`, `getByKey` (one record through a `natural_key` set, without a write), `search` (with
  `flt(field, op, value)`), `create`, `update`, `updateMany`, `createMany` (one record per element of a list), `updateEach` (each record a list
  names, with that element's own values, all or nothing; no platform month marks it, and an older AgentFlow fails the
  step when it runs), `upsert`.
  `create`, `createMany` and `upsert` take a last argument `{ destinationUnit }`, where a record of an entity filed in
  units goes: `{ from: "creator" }` (the default, written as nothing), `{ from: "trigger" }` (the unit of the record
  the run is about) or `{ from: "unit", unit }` with a context path or a `${param:…}` of a `unit_ref` parameter; a
  unit id is refused.
- A Human step's `assignment.candidates` may hold one unit pool, everyone placed in a unit:
  `{ kind: "unit", unit: { mode, unitId? }, reach?, group?, fallback? }`, `mode` one of `requester_primary` (the
  default), `inherit_trigger` and `unit` (with `unitId`), and a person or group `fallback` unless one sits beside it
  in `candidates`. It is not the `work` routing pool's shape, and the build does not check it; the authoring skill's
  `reference/workflows.md`, "A unit pool", has the rest.
- Signing: `signature(id, name, options)` is a Signature step and `signing(options)` a Human step's `signing`
  block. They take documents from `doc.template(id, templateRef, { fieldMapping?, filename? })`,
  `doc.upstream(id, nodeId, documentId)` and `doc.review(id, reviewDocumentId)`, and signers from
  `signer.initiator()`, `signer.field(path)`, `signer.stepActor(nodeId)`, `signer.previousActor()` and
  `signer.user(paramKey)` (the first four take `.manager(levels)`). `signedFiles(stepId)` and
  `signingStatus(stepId)` read a signing step's output. Each helper refuses at build an option it has no rule for,
  and a value outside `method`, `routing` and `onDecline`'s allowed values. The authoring skill's
  `reference/signing.md` has the options and the decline route.
- Steps that reach outside the package, each with `settings?` last:
  `webhook(id, name, { url, method?, headers?, body?, auth?, retries? })` writes the designer's `webhook`
  config: `method` is `GET`, `POST` (the default), `PUT`, `PATCH` or `DELETE`; a string `body` is sent as text and
  an object of bindings as JSON; `auth` is `{ kind: "bearer", secret }`, `{ kind: "api_key_header", secret, header }`
  or `{ kind: "basic", secret, username }`, `secret` the key of a `secret_ref` parameter.
  `extractText(id, name, source, { mode?, format?, onOversize? })` reads the file at the path `source`.
  `integration(id, name, { connection, operation, objectType, identityField?, mappings?, delivery?, captureTo?,
  associations?, safeFieldPaths? })` names its account by the key of a `connection_ref` parameter; a mapping is
  `[field, binding]`, and on a `search` `[field, binding, operator]`. Each refuses a value outside its kind's set and
  what publish refuses: an empty `url` or `source`, a `get` or `upsert` with no `identityField`, an `upsert` that
  maps no value to it, a `captureTo` outside `vars.` and `input.`, and an inline `delivery` on a read. They also
  refuse any `delivery` on a read and an `operator` outside a `search`, which AgentFlow would ignore.
- Bindings: `ref(path)`, `tpl(template)`, `lit(value)`, `bind(field, binding)`.
- Checks: `checkGraph(where, graph)` and `checkCondition(where, condition)`, which `merge` runs. `checkGraph`
  counts a decline route's and a Fork's edges as the merge paragraph above says, at any For Each depth, and refuses
  a Human step's `endWhen` inside a For Each body or reading anything but `subject.record.<field>`. Publish
  also pairs each Fork with the Join every arm reaches and refuses arms that share a step before it; the build
  leaves that to publish.
- Object builders, also exported by the root module: `workflowObject`, `startGrants`, `triggerObject`,
  `actionObject`, and the types `WorkflowSource`, `TriggerSource`,
  `ActionSource`.

## What is generated

The builder writes three manifest members itself, writes a fourth, `exports`, from your list, and raises a fifth. A decline route on a signing step needs platform
`2026.11`, because an older deployment drops the route unread, so the build raises `minPlatformVersion` to `2026.11`
when any workflow, at any For Each depth, has a route. A Human step that carries a `page` needs `2027.02`, because an older deployment would drop the page unread and open every task in AgentFlow's own view; the build raises it at any For Each depth. A field that carries `queriedByApp` needs `2027.01`, as does a
dashboard or a view that holds a percentile or a duration measure (above), and the build raises it the same way. An entity file that
carries `metrics` needs `2027.03`, which covers a dashboard tile that follows one. A later month stays as written, and a value that is not a month is left for
verification to refuse. `agentflow-app build` prints one line when it raises the month, naming the month, the config's own and the feature that needs it
(`minPlatformVersion: 2027.03, raised from 2026.10 for an entity metric`; with `--json`, the same text as `platform`), and prints nothing about it otherwise.

The three it writes, and `exports`:

- `objects`: every object the build produces, as `{ key, kind }`, in this order: for each entity (in
  `entityOrder`, else sorted) its `entity`, its `entity_field`s, its `entity_view`s, its `entity_metric`s and its `form`; then the
  skills, the agents, the document templates, the workflows (in `order`), the triggers, the actions, the
  dashboards.
- `grants`: the entities' grants, then each workflow's start grants.
- `features`: always `{}`.
- `exports`: the entities the file's `exports` lists, as logical keys (`${entity:item}` is written
  `entity:item`); `[]` when the file has no `exports`. Each must be an entity of the package, and none twice.

Each object is written to `objects/<kind>/<name>.json`, where `<name>` is the key without its kind, with `/`
written `__` (`entity_field:task/title` is `objects/entity_field/task__title.json`). Files are JSON with two
spaces of indentation and a final newline. An entity's own object lists its fields as sentinels and carries
its `access` mode, `natural_key`, `display_field`, `create_form`, `conversation`, `rules`, `stage_model` and
`work` when the file has them.

A key that two objects share, or two grants that share a key, is an error (`entity:task is built twice`).

### `launcher`

The entries the package adds to the app launcher. Unlike the other manifest members it is translated: an
object target is written as a reference.

```json
{
  "launcher": {
    "launch_url": "https://projects.example.com",
    "entries": [
      { "key": "overview", "label": { "en": "Overview", "vi": "Tổng quan" }, "icon": "layout-dashboard",
        "target": { "object": "${dashboard:projects_overview}" } },
      { "key": "tasks", "label": "Tasks", "icon": "list-checks", "target": { "object": "${entity_view:task/open}" } },
      { "key": "board", "label": "Board", "target": { "module": "/board" } }
    ]
  }
}
```

- The members are `launch_url` and `entries`, both optional. An entry has `key`, `label`, `icon` and `target`.
  `label` is a string or a map of locale to string. The builder copies them as written; the platform checks
  keys, labels, icons and paths when it verifies the package.
- `target` holds exactly one of `module` and `object`.
- A `module` target is a path inside the package's `ui` (`"/"`, `"/board"`) and needs `ui` in the manifest.
- An `object` target is a `${dashboard:key}`, `${entity:key}` or `${entity_view:entity/key}` of the package
  itself. A sentinel that names nothing the package builds is refused like any other.
- `launch_url` is a suggestion: an admin can override it, and clearing the override falls back to this value.

## Refusals

The builder throws an `Error` for what it cannot accept. For a config file the message is
`<file>#<json pointer>: <reason>`, with the pointer in RFC 6901 form (`~` as `~0`, `/` as `~1`):

```
entities/task.json#/fields/3/on_target_delete: one of restrict, clear, cascade
entities/task.json#/views/0/columns/1: nope is not a field of task
dashboards/o.json#/filter_bar: a package cannot install a filter bar yet
```

For code the file is the object being built: `workflow <key>#/run_as`, `trigger <name>#/workflow`,
`action <name>#/entity`. After translation a sentinel that names nothing is reported against the output
file (`objects/entity/task.json#/x: …`). The classes:

1. **A member it has no rule for**: `a member the builder has no rule for`, or for a field member
   `not a member the package's entity_field lists`. This is the allow-list: every member this file names,
   and no other, is accepted. An unknown member, a misspelling or a platform
   feature the builder does not yet carry is refused rather than dropped.
2. **A value of the wrong shape**: `must be an array`, `must be an object`, `one of …`, `a string of 1 to
   300 characters`, `1 to 20 leaves`.
3. **A reference that does not resolve**: `nope is not a field of task`, `x is not a group_ref
   parameter`, `ghost is not an entity of the package`, a sentinel naming no object.
4. **A malformed reference**: a reference that is part of a string, a hyphen in a non-skill key, a string
   starting with `@`, a member name holding `${`.
5. **A file problem**: a file in `config/`, or in a folder there the builder does not read, that is not a note; a file in `entities/`,
   `agents/`, `dashboards/` or `document_templates/` that is not `.json`, or in `skills/` that is not `.SKILL.md`; an entity file without `name`, `fields`, `views` or `access`; an entity
   file that `entityOrder` does not name, or the reverse; a file name that is not its `key`; a skill file
   whose name or frontmatter does not follow the rules above; a missing manifest member.
6. **A policy the package may not hold**: a grant to anything but a group or Everyone, design authority,
   a second Everyone grant, a workflow anyone may start, a dashboard filter bar.
7. **A broken graph**, from `merge` or the build: `<workflow>: d owns e2,e3 but has e2`,
   `<workflow>: unreachable x`, `<workflow>: x (entity_record) is inside the loop through a, x; …`,
   `<workflow>: h (human) feeds Join j directly on e4; …`. These name the workflow and the node,
   not a pointer. So does `add <name> to ORDER` (a workflow missing from the order). An exposed step that is
   not a Human step is reported as `workflow <key>#/graph/nodes: exposed step <id> is not a human step`, and a path
   to a step that is missing or not upstream as `workflow <key>#/graph/nodes/…`, from the workflow's root even in a
   loop's body.

Three refusals belong to `launcher`:

- `package-manifest.json#/launcher/entries/0/target/module: a module target needs the package's ui`
- `package-manifest.json#/launcher/entries/0/target: exactly one of module or object`
- `package-manifest.json#/launcher/entries/0/target/object: must be a ${dashboard:key}, ${entity:key} or ${entity_view:entity/key}`

These are early checks. The platform's package verification stays the authority, and the builder does not
duplicate all of it.

## Sealing

`agentflow-app keygen` makes a signing key and `agentflow-app seal` signs `package/` with it. Both are written
in TypeScript on Node's built-in `crypto`, with no other dependency, and a sealed archive is byte for byte
what the platform's own signer writes for the same files and key.

```bash
pnpm exec agentflow-app keygen --key-id acme-2026   # writes keys/acme-2026.pem, mode 0600
pnpm build && pnpm seal                              # writes dist-app/acme-my-app-1.0.0.afpkg
```

- **`keygen`** writes an ed25519 key as PKCS#8 PEM with mode `0600` and never overwrites a file
  (`KEY_EXISTS`). It prints the file and the key id. `keygen` refuses a key id outside letters, digits, `.`, `_` and `-` (at most 64, starting with a letter or digit) with `KEY_ID_INVALID`. The key id is recorded on each release you seal. The key itself is
  never printed. The starter's `.gitignore` ignores `keys/`; keep the key out of version control.
- **`seal`** reads the key from `--key`, or else the single ed25519 key in `keys/` (`KEY_MISSING` if there is
  none, `KEY_AMBIGUOUS` if there are several; a PEM that is not ed25519 is skipped). It looks in no other
  project's `keys/`: to seal a publisher's other packages with the same key, keep the key in one private place and
  pass `--key <file>` (`keygen --out <file>` writes it there). The key id is
  `--key-id`, or else the key file's name without its extension: that is the signer id recorded
  on the release. It refuses a key file that any group or other user can read (`KEY_PERMISSIONS`, and the
  message gives the `chmod 600` to run).
- **It reads `package/` as it stands.** It does not rebuild: run `build` first, so `manifest.json`, `objects/`
  and `ui/` are current. Only those three are taken. Any other file or folder at the package root, any symlink,
  and any dotfile (a macOS `.DS_Store`, a dotfile backup such as `.swp`) is refused by name with
  `SEAL_FILE_UNLISTED`, and nothing is written.
- **It writes** `<out>/<prefix>-<key>-<version>.afpkg`, where `--out` defaults to `dist-app/`. The id and the
  version come from `package/manifest.json`: `acme/my-app` at `1.0.0` is `acme-my-app-1.0.0.afpkg`. It prints the
  file, package id, version, digest and signer. `dist-app/` is not `dist/`, which Vite empties when the app
  has a site.
- **Sealing again** into a file that exists is fine when it seals the same package with the same key (its first line is
  `unchanged: <file>` instead of `sealed <file>`, and the file is left as it is). The same package means the same
  digest: a JSON file outside `ui/` (the manifest and `objects/`) is hashed in its canonical form, so a rebuild that
  changes only member order or spacing there (a workflow rewritten with the helpers, say) is the same package, and
  AgentFlow takes it as the same content; a `ui/` file is hashed as its bytes. `seal` also checks that the old
  archive's files still match its `hashes.json`. The same package under another key is refused (`SEAL_OUT_EXISTS`,
  `… holds this package sealed by another key`): delete the file and seal again, even after a deploy, since AgentFlow
  takes the same package re-signed under one version. Another digest is refused (`SEAL_OUT_EXISTS`, `… exists with
  other contents`): raise `version` in `config/package-manifest.json`, or, if that version never reached a
  deployment or the catalog (`deploy` and `publish` never stored it; a stored version refuses other contents with `APP_PACKAGE_VERSION_EXISTS`, `publish` included, because it uploads before it submits), delete the file and seal again.
- **It checks the cheap things locally:** the manifest exists and parses, the id is `<prefix>/<key>`, the
  version is SemVer, every file under `objects/` is JSON, and the archive limits hold. It does not verify the
  package against the platform's schemas: the deployment does that, with its own version, when the package
  reaches it.
- **Entries are stored, not deflated,** in a fixed order with a fixed time, so the same files and key give
  the same bytes on every machine.

Then `deploy` uploads the `.afpkg`.

The same steps are functions: `keygen(keyId, out)`, `readKeyFile`, `findKey`, `readPayloadDir(dir)`,
`checkPayload(files)`, `sign(files, key)` and `canonicalJson(value)`.

## Converting a draft

An app built in AgentFlow's designers can be packed from Admin → Apps → Pack into a **draft**, a zip of the
package's files with no signature. `agentflow-app init <dir> --from draft.zip` turns it into a project that
builds the same package, so you can continue as code.

- **A package sealed with a key is refused** (`DRAFT_INVALID`); pack with no key. Convert the draft as the Pack
  page downloads it. If you must zip one again, use `zip -r -X` on a folder with no `.DS_Store` in it: folder
  entries are skipped, but a zip made by macOS Finder (with its `__MACOSX/` and `.DS_Store` entries) is refused
  today.
- **The project it writes:**
  - the manifest becomes `config/package-manifest.json`, with `configVersion` first and without the members
    the builder generates;
  - each entity, with its fields, views, metrics, create form and grants, becomes `config/entities/<key>.json`;
    agents, skills, dashboards and document templates become `config/agents/<key>.json`,
    `config/skills/<key>.SKILL.md`, `config/dashboards/<key>.json` and `config/document_templates/<key>.json`;
    memory types and relationships become `config/memory_types/<key>.json` and
    `config/memory_relationships/<key>.json` (definitions only: a draft carries no memory);
  - each workflow, trigger and entity action becomes one module under `config/build/workflows/`,
    `triggers/` and `actions/`, exporting the graph as it was packed (valid builder input, ready to be
    rewritten with the `./workflow` helpers, checked with `build --check --values`); a Code step's source goes to
    `config/code/`;
  - `@obj:` and `@param:` sentinels come back as `${entity:x}` and `${param:x}`;
  - a UI module goes, byte for byte, to `ui/built/`, with a `ui/README.md` saying it is built output, and
    `agentflow.app.mjs` says `ui: { prebuilt: "ui/built" }`;
  - `agentflow.app.mjs`, `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `README.md`, `AGENTS.md`,
    `CLAUDE.md`, and the built `package/`.
- **It checks itself.** It builds the project and compares every file with the draft, as parsed JSON: object
  members in any order, arrays in order, except that the manifest's `objects` and `grants` are compared sorted by key (the
  draft lists them that way) and `ui/` files are compared byte for byte. Only a project that builds the
  draft back is written, to a new or empty folder, and on any refusal nothing is.
- **Its refusals:** `DRAFT_INVALID`; `DRAFT_UNSUPPORTED`, when the draft holds something the builder cannot
  write (a relationship, a client, non-empty `exports` or `features`, a create form with a layout other than a
  plain vertical one, a document template with an image), naming the file and the place; and `DRAFT_REBUILD_DIFFERS`,
  naming the files that differ.

The same conversion is the function `convertDraft(zipBytes, dir)`.

## Building

```ts
import { buildPackage, merge, writePackage, type BuildOptions } from "@reflexify/agentflow-app-builder";
```

`agentflow-app build` and `build --check` are the way to build a project. These functions are what they
call, and what a script or a test can call directly:

- `defineApp(app)`, `loadApp(dir)` and `buildApp(dir)`: the `agentflow.app.mjs` of a project, and the whole
  of `build`. `checkPackage(dir)` is `build --check`, returning `{ stale, missing, extra }`; `checkPackage(dir, { values: true })`
  is `build --check --values`, adding `where`, the `<file>#<pointer>` of each member that differs.
- `merge(sectionModules, order)`: combines the modules' `workflows`, `triggers` and `actions` into a
  `Sections` value, `{ workflows, order, triggers, actions }`. `order` lists the workflows' build-local
  names in publish order: a workflow comes after every workflow it calls. A workflow the order omits is
  refused; a name in the order that no module defines is ignored. A workflow, trigger or action name that
  two modules define is refused (`sections#/workflows/intake: defined twice`). The graphs are checked
  here, and only here.
- `buildPackage(options)`: returns the package as a map from relative path to file text
  (`manifest.json`, `objects/…`). It writes nothing.
- `writePackage(options, packageDir)`: builds, deletes `manifest.json` and `objects/` under `packageDir`,
  writes the files, and returns the number written. Anything else in `packageDir` (such as `ui/`) is left.
- `BuildOptions`:
  - `configDir`: the `config/` directory.
  - `sections`: the result of `merge`.
  - `entityOrder?`: the entity keys in the order the package lists them. It must name exactly the files in
    `entities/`. Without it they are sorted.
  - `exposedSteps?`: a map from a workflow `key` to the ids of its Human steps that the workflow exposes,
    for example `{ support_handling: ["handle_urgent", "handle_high"] }`. A listed step that is not a Human
    step is refused.

## Holding `package/` to `config/`

`package/` is generated and committed, so a reviewer reads what ships. It is never edited by hand.
`agentflow-app build --check` is the test that it cannot drift from `config/`; the starter runs it as part of
`pnpm test`, and a continuous-integration job should run it too.

```bash
pnpm exec agentflow-app build --check   # exit 1, PACKAGE_STALE, and the files that differ
```

It fails when a built file differs from the committed one, when one is missing, and when `package/` holds a
file the build does not make; `package/ui` is compared with the module when the manifest declares one and the folder exists, and without a declared module any `package/ui` file is extra (`build` removes it). To check more, in a test of your own, compare `buildPackage(options)` with
the files, or load the app with `loadApp(dir)`, which runs every graph check.

## Typed keys

`agentflow-app types` reads `package/` and writes `src/generated/app.ts`, so the app's own code names the
package's objects with types the compiler checks. Commit the file and run `agentflow-app types --check` in
`pnpm test` beside `build --check`: a renamed entity, field or workflow then fails the typecheck of the code
that still uses the old key, instead of failing at run time in an org. A project `init` makes with its UI module ships the file, under the project's id, and a `test` script that ends with `agentflow-app types --check`.

The file holds:

- `PACKAGE`, the package's `id` and `version`.
- `OBJECTS`, every object the manifest lists by logical key (`entity:ticket`, `entity_field:ticket/subject`),
  with its `kind` and `contractVersion`: the version of the package the file was generated from, the
  contract this code was written against. `LogicalKey` is the union of its keys. Agents, skills, memory types and
  memory relationships are left out, because `GET /app/objects` never lists them, so `getAppObjects` could never
  answer for one; the file's opening comment names memory types and relationships only when the package has some. A
  dashboard, an entity metric, a trigger or a client has no contract, so its `contractVersion` is `null` and `satisfies` is
  always false for it: check that it is there with `id()` or `find()` instead.
- `EntityKey` and `WorkflowKey`, the package's local keys (`ticket`, not the key an installation gives it).
- `EntityFields`, each entity's fields as a record carries them. Every field is optional and may be `null`.
  `text`, `date`, `datetime` and `reference` are `string`; `number` is `number`; `boolean` is `boolean`;
  `enum` is the union of its values and `multi_select` an array of them; `reference_list` is `string[]`; a
  `formula` is its result type; an `auto_number` is `string` with `auto_number_format` and `number` without;
  `file`, `list` and a type the builder does not know are `unknown`.
- `WorkflowInputs`, what starting each workflow takes, from its `inputSchema`: `Record<string, never>`
  without one. Types, `enum`, `const`, arrays, objects (`required`, `additionalProperties`), lists of types,
  `anyOf` and `oneOf` are followed; anything else, `$ref` included, is `unknown`.

An object, entity, field or workflow whose body has `deprecated: true` is marked `@deprecated`. Every list is
sorted by key, so the file changes only when the package does. The same text comes from
`generateTypes(manifest, objects)`, given the manifest and each body by logical key, which
`payloadObjects(readPayloadDir(dir))` reads from a `package/`; `schemaToTs(schema, indent)` is the
JSON Schema step on its own.
