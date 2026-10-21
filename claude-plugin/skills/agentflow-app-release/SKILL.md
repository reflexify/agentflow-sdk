---
name: agentflow-app-release
description: Use when building, checking, sealing or deploying an AgentFlow app package with the agentflow-app CLI (build, seal, lint, deploy), or when one of them is refused.
---

# Building, checking, sealing and deploying an AgentFlow app

The `agentflow-app` CLI ships in `@reflexify/agentflow-app-builder`. It has six commands: `init` starts a
project, `build` turns `config/` into `package/`, `keygen` makes a signing key, `seal` signs `package/`
into an `.afpkg` file, `lint` checks `package/` against an AgentFlow deployment, and `deploy` uploads the
sealed file and asks for it to be installed, which an admin then approves. What goes in `config/` is the `agentflow-app-authoring` skill; converting a designer
draft is `agentflow-from-draft`.

The guide's pages are on your AgentFlow deployment, and the skills link them as `<AGENTFLOW_URL>/guides/…`.
`<AGENTFLOW_URL>` is the address your team opens AgentFlow at (what the `AGENTFLOW_URL` variable holds, below). If
you do not know it yet, ask your org admin.

## What you need

- Node 22.9 or later (the project's `engines` is `>=22.9.0`) and pnpm.
- The builder as a development dependency, from git at one SDK release tag. A project made by `init`
  already has it:

```bash
pnpm add -D "github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-app-builder"
```

- Two pnpm settings in the project's `pnpm-workspace.yaml`, which `init` writes:

```yaml
blockExoticSubdeps: false
allowBuilds:
  esbuild: true
```

  Without the first, pnpm refuses the SDK's packages, which refer to each other by git reference
  (`ERR_PNPM_EXOTIC_SUBDEP`). Without the second, it refuses to run esbuild's install script, which the
  starter's tooling needs (`ERR_PNPM_IGNORED_BUILDS`).

In a project, run the CLI through the package scripts (`pnpm build`, `pnpm check`, `pnpm seal`) or as
`pnpm exec agentflow-app <command>`.

## Starting a project: `init`

```bash
pnpm dlx --package "github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-app-builder" \
  agentflow-app init my-app --prefix acme
cd my-app && pnpm install && pnpm build
```

`pnpm dlx` fetches the builder from GitHub, so it needs the network. Offline, in any project where `pnpm install`
has run, the builder is in `node_modules`: `pnpm exec agentflow-app init ../my-app --prefix acme` does the same.

- `--prefix <prefix>` (required): your package prefix: you choose it (2 to 16
  lowercase letters and digits, starting with a letter).
- `--key <key>`: the package key; it defaults to the folder's name. 1 to 40 lowercase letters, digits and
  hyphens, starting with a letter, with no double or trailing hyphen. The package id is `<prefix>/<key>`.
- `--no-ui` leaves out the UI module, and `--no-site` the standalone site. With both, the project is the
  package alone.
- `--from <draft.zip>` converts a draft instead: see the `agentflow-from-draft` skill.

The project is the starter, the case desk, under your names. Its scripts:

| Script | Runs | Does |
|---|---|---|
| `pnpm build` | `agentflow-app build` | writes `package/` from `config/`, and builds the UI module into `package/ui` when the manifest declares one |
| `pnpm check` | `agentflow-app build --check` | compares `package/` with what `config/` builds, and changes nothing |
| `pnpm test` | the Vitest tests, if any, then the check | |
| `pnpm seal` | `agentflow-app seal` | signs `package/` into `dist-app/` |

### Starting from a copy of the template instead

A clone of the template repository (reflexify/agentflow-app-template on GitHub) is the case desk, named `acme/case-desk`,
with the standalone site. `init` is what renames it and what drops the site, so let `init` do both and
rename nothing by hand. Make the project `init` would make, then put your work in it:

1. In a scratch folder beside the copy, run `init` with your names and flags, as above: with the site by default,
   with `--no-site` if you do not want it.
2. Copy your own `config/`, `agentflow.app.mjs` and, if you have a module, `src/module/` and `test/module/` over
   the scratch project's. Run `pnpm install`, `pnpm build` and `pnpm test` there. That folder is your project;
   throw the copy away.

To keep the copy instead, compare it with the scratch project:

```bash
diff -rq ../scratch . --exclude node_modules --exclude .git --exclude package --exclude keys --exclude dist-app
```

- **With the site** (the default), copy from the scratch project only the files named
  here. A differing file under `config/` or `src/module/` (other than the manifest below) is your own work:
  keep it, or merge it by hand; never overwrite it. The files to copy are `README.md`, `AGENTS.md`,
  `config/package-manifest.json` (its `id`, `name`, `changelog`, and the `app_users` parameter's `label`),
  `src/module/text.ts` (it differs only by the rename; keep yours if you changed it) and every site file that
  named the starter (its name, key and `CASE_DESK_` variables are renamed); merge a site file you changed. Merge `package.json`, do not copy it: take its
  `name`, keep the dependencies and scripts you added. A file the diff lists as only in the copy is yours or the
  template's, and is kept. The site: the `agentflow-app-authoring` skill's page on it.
- **Without the site** (`--no-site`), also delete what the diff lists as only in the copy and belongs to the
  site: `server/`, `static/`, `scripts/`, `index.html`, `vite.config.ts`, `.env.example`, `RUNBOOK.md`,
  `src/App.tsx`, `src/StartCase.tsx`, `src/main.tsx`, `src/route.ts`, `src/styles.css`, `src/text.ts`, `src/vite-env.d.ts` and the
  site's tests under `test/` (every file except `test/module/`). Merge `package.json` (take its `name`, keep your dependencies and
  scripts; remove the site's `hono`, `jose`, Hono's Node server and scripts), and take the scratch project's
  `pnpm-workspace.yaml`, `README.md`, `AGENTS.md` and `tsconfig*.json`.

Then `pnpm install`, `pnpm build`, `pnpm test`.

## `build` and `build --check`

`pnpm build` prints `wrote 12 package files` and `ui: none`, `ui: built` or `ui: copied`. It deletes
`manifest.json` and `objects/` under `package/` and writes them again, so `package/` never holds a file the
config does not make. Never edit `package/` by hand: commit it with `config/`, so a reviewer reads what
ships.

`pnpm check` prints `package/ matches the config`, or refuses:

```
PACKAGE_STALE: package/ does not match the config (stale: objects/entity/case.json): run agentflow-app build
```

It names each file that is `stale` (differs), `missing`, or `not from the config` (a file the build does not
make). It compares `manifest.json` and `objects/` only, never `package/ui`. Run it in CI and before every
commit.

## Keys: `keygen`, once per publisher

```bash
pnpm exec agentflow-app keygen --key-id acme-2026
```

- It writes `keys/<id>.pem` (an ed25519 key in PKCS#8 PEM, mode `0600`, readable only by you) and prints the file
  and the key id. `--out <file>` writes the key elsewhere.
- Make one key per publisher, once, and use it for every package and every release. `keygen` never
  overwrites a key (`KEY_EXISTS`), so leave it out when you seal again.
- **Keep the key secret.** Git ignores `keys/`; never commit it, never paste it, never print it, and never
  copy it into a report, a log or a test. If its mode changes, `seal` refuses it until you run
  `chmod 600 keys/<id>.pem`.
- `keygen` accepts a key id of letters, digits, `.`, `_` and `-`, at most 64 characters, starting with a letter or digit (otherwise `KEY_ID_INVALID`). `seal` uses the file's name, without `.pem`, as the signer unless
  you pass `--key-id`.
- The key seals the package. AgentFlow checks that the package is intact, and records the key id it names on the release; that id and the package id's prefix are claims it does not check. **Nobody has to trust the key first**: there is no key to give an admin and nothing to enable for the key. The admin's approval is the gate, and a leaked key changes nothing (keep keys private anyway: they are how you seal).
- **What AgentFlow enforces about the prefix and the signer: nothing per publisher.** Any intact sealed package
  installs. Any organization may upload any prefix, a second publisher may use the same prefix, a package id's
  releases need not keep one key, and the signature is not checked against a key you registered (there is none).
  The key id is only recorded on the release. The gate is the admin's approval of each install and each upgrade.
  The one lock is on content: a package id and version hold one content, so a changed package under a version
  already uploaded is refused (raise `version`). The guide page on keys is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/khoa-ky` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/khoa-ky`).

## What to send your org admin

One message, before the first `deploy`. Everything an admin does for your app is on this list; none of it can
be done with a key from your side.

1. **The service keys for CI**: a deploy key (a service principal with `integration.admin`) and, for pull requests, a
   lint-only key. The steps are in the admin guide, `<AGENTFLOW_URL>/guides/en/quan-tri/cai-dat-ung-dung`
   ("The publisher's CI keys"). Ask also for the deployment address, `AGENTFLOW_URL`.
2. **The parameters**: for each one in `parameters`, what to choose and which role its members need (the parameter's
   `help` says so). Put the answers you know in `parameters.json` (below); the admin answers the rest on the setup page. Tell them to put a run-as service principal in its workflow's automation group (setup only warns it lacks record access; a stage move fails at run time).
3. **What to do after the install**: the triggers to turn on (a trigger always ships off), the dashboards to share
   with the audience group, and anything else the `changelog` or the app's README tells installers.
4. **Which release you mean**: the package id, the `version`, and the file `seal` printed.

The admin's own guide page is `<AGENTFLOW_URL>/guides/en/quan-tri/cai-dat-ung-dung` (approving); send it.

## Sealing a release

1. Raise `version` in `config/package-manifest.json` (SemVer), and write `changelog` for the release.
2. `pnpm build`. Fix every refusal (the `agentflow-app-authoring` skill reads them).
3. `pnpm test`, which ends with the check.
4. `pnpm exec agentflow-app keygen --key-id <id>`, the first time only. Keep the file private.
5. `pnpm seal`. It signs `package/` with the one ed25519 key in `keys/` (it ignores any other key there, such
   as the standalone site's RSA key) and prints:

```
sealed /path/to/my-app/dist-app/acme-my-app-0.1.0.afpkg
package acme/my-app 0.1.0
digest f1bd74c5…
signer acme-2026
```

6. Check it and deploy it: `pnpm exec agentflow-app lint`, then `pnpm exec agentflow-app deploy --wait`
   (Connecting to AgentFlow, below). An admin approves the install.

- The file is `dist-app/<prefix>-<key>-<version>.afpkg`. Git ignores `dist-app/`, which is not `dist/`: a Vite build empties `dist/`. `--out <dir>` writes elsewhere.
- The archive limits, the same in `seal` and on the server's upload: 2,000 entries (1,998 of yours plus `hashes.json`
  and `signature`), 5,000,000 bytes per file and 100,000,000 in all, uncompressed, and 20,000,000 bytes for the
  archive (checked when `seal` writes it, when a zip is read, and by the server). A module using the UI kit can
  come to about 1.5 MB; that is within them.
- Sealing the same package again succeeds: the first line is `unchanged: <file>` instead of `sealed <file>`, then
  `package`, `digest` and `signer`, and the file is not rewritten (`--json`: `"unchanged": true`). A changed package
  under a version already sealed is refused (`SEAL_OUT_EXISTS`): **raise `version` on every release** (after an SDK update: `reference/upgrading-the-sdk.md`).
- `seal` signs what is in `package/`; it does not rebuild. Run `pnpm build` first, so `package/ui` is current.
- With more than one ed25519 key in `keys/`, pass `--key keys/<id>.pem`.

## Connecting to AgentFlow: two variables

`lint` and `deploy` talk to one AgentFlow deployment, in your organization. They read:

| Variable | Holds |
|---|---|
| `AGENTFLOW_URL` | the address you open AgentFlow at, such as `https://agentflow.example.com`. `--url <url>` overrides it. It must be `https://`; `http://` works only on `localhost`, `127.0.0.1` and `[::1]`. |
| `AGENTFLOW_TOKEN` | a service principal's key, `afk_…`. An admin makes the principal under **Admin → Service principals**, gives it a role with `integration.admin` (deploy needs it; lint needs only a key of the organization) and makes a key. |

```bash
export AGENTFLOW_URL=https://agentflow.example.com
read -rs AGENTFLOW_TOKEN && export AGENTFLOW_TOKEN
```

`read -rs` takes the key without showing it, and keeps it out of your shell history. **Keep the key secret**: never write it into a file, a script, a report, a log or a test, and never pass it on a command line. The CLI sends it only in the `Authorization` header to `AGENTFLOW_URL`, never follows a redirect, and prints `[redacted]` wherever an answer would show it.

## Checking against AgentFlow: `lint`

```bash
pnpm exec agentflow-app lint
```

1. It runs `build --check` first: a stale `package/` is `PACKAGE_STALE`, so lint judges what `config/` says. Run `pnpm build`.
2. It zips `package/` as it stands (no key, no seal) and sends it. AgentFlow runs the archive limits, the manifest check, the platform-version check and every lint rule, with its own code, and stores nothing.
3. It prints each problem on one line, then a count:

```
run_as_not_initiator  workflow "workflow:request_loan"  /runAs: People can start this workflow, directly or through a Call, so it must run as its initiator, not @param:automation_principal (fix: Set runAs to "initiator".)
1 problem (AgentFlow 2026.10)
```

Exit `0`: `no problems`. Exit `1`: problems, or a refusal. Each problem's code is explained, with its fix, in `reference/lint-problems.md`. Fix each in `config/` (the pointer is into the built object under `package/objects/`: find the same place in the config file that makes it), `pnpm build`, and lint again. A package the builder accepts can still have problems here: AgentFlow is the authority. `lint` does not judge an entity's field values (a `type`, a `format`, an option colour): AgentFlow checks those when the package is installed, so keep to the values `entities.md` lists. `platform_too_old` means this deployment is older than `minPlatformVersion`: ask the AgentFlow team to upgrade the deployment, or deploy to one that runs that version. Lowering `minPlatformVersion` is possible only down to the value this SDK release states, never below it (edit `config/package-manifest.json`, build, seal, then deploy; raise `version`, or delete the sealed file, if this version was sealed before). `--json` prints AgentFlow's answer as it is.

## Deploying: `deploy`, then an admin approves

The guide page `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/kiem-tra-va-trien-khai` (Vietnamese `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/kiem-tra-va-trien-khai`) walks the same flow, with a CI example.

```bash
pnpm exec agentflow-app deploy --parameters parameters.json --wait
```

1. It finds the sealed file for the version in `package/manifest.json`, `dist-app/<prefix>-<key>-<version>.afpkg`, or the one `--file <file>` names. None is `SEAL_MISSING`: run `pnpm seal`.
2. It uploads it. AgentFlow checks that the archive is intact and sealed, the platform version and lint, then stores the release. Bytes uploaded before print `already uploaded` and carry on.
3. It asks AgentFlow to install that release in the key's organization, with the setup answers in `--parameters <file>`, a JSON object by parameter key such as `{"app_users":"<group id>"}` (The parameters file, below), and `--decisions <file>`. Both are optional: whatever they leave out, the admin fills in. An upgrade keeps the installed answers and asks only for new parameters; the setup page asks only for the new ones.
   - Every key in `parameters.json` must be one of the manifest's `parameters`. A key it does not declare, such as a typo, is refused with 422 `VALIDATION_ERROR`, which names each unknown key.
   - `--decisions` may only **decline** grants of this package: `{"grants": {"<prefix>/<key>": {"<grant key>": "declined"}}}`. A request may only narrow what the app gets. `deploy` checks the file's shape before anything is sent: a member other than `grants`, or a value other than `"declined"` (a grant sent to another principal, approved clients, features, choices), is `USAGE`. AgentFlow then refuses another package, or a grant key the manifest does not declare, with 422 `VALIDATION_ERROR` naming the path. The admin who approves decides all of that on the setup page.
4. It prints `awaiting approval: <link>` and exits `0`. **A key never installs.** Send the link to an admin of the organization. It opens the app's setup page with your answers filled in. They read what the app is, the access it asks for and what it creates, complete the setup, and press **Approve and activate**.
5. With `--wait` it waits as long as approval takes: `installed` exits `0`; a failed install or a cancelled deployment is `DEPLOY_FAILED` with the reason, exit `1`. Ctrl-C stops the waiting (exit `130`); the deployment stays, and the admin can still approve it.

The admin may finish what your answers leave open (a binding, a feature, a client) on the setup page; `--wait` ends when they approve and activate it, wherever they do. Approving is always a person's step: never try to approve with the key, and never ask for a person's session to do it.

- The CLI has no command to uninstall, detach or roll back an app. An admin does those in **Admin → Apps**; to go back to an earlier behaviour, raise `version` and deploy the change.
- When an admin has a change to the same app approved and not yet activated, the deployment waits until it is activated or withdrawn.
- If the admin discards the setup, the deployment is withdrawn; if they switch the setup to another version, it is cancelled as replaced, even though no newer deployment was sent. Both end `--wait` with `DEPLOY_FAILED`.
- When this version is installed already, it prints `installed` at once, and that answer leaves an upgrade still waiting for approval alone. So a CI job that re-runs `deploy` for the installed version does not cancel a waiting upgrade; withdraw the upgrade, or approve it.
- `deploy` again with the same file and the same answers returns the same deployment, so a retry after a dropped connection makes no second one. Other answers make a new one, which replaces the one still waiting (unless that answer is `installed` at once, above). After a deployment failed or was cancelled, `deploy` asks again.
- A new release: raise `version`, build, seal, deploy. An upload of a version your organization already holds with other contents is refused with 409 `APP_PACKAGE_VERSION_EXISTS`: raise `version`. `APP_VERSION_NOT_NEWER` is the install-side refusal: a higher version, or the same version with other contents, is already installed.

### The parameters file

`--parameters parameters.json` is a JSON object by parameter key, and **a parameter you leave out is answered by
the admin on the setup page**, so `{}` is a valid file. Write only what you know; a wrong id is a wrong install.

| Parameter `type` | Value in the file | Where a person finds it |
|---|---|---|
| `group_ref`, `user_ref`, `service_principal_ref` | the object's id, a UUID string | open it in **Admin → Groups**, **Users** or **Service principals**: the id is the last part of the page's address, such as `<AGENTFLOW_URL>/admin/groups/<id>` |
| `unit_ref` | a unit's id | `GET <AGENTFLOW_URL>/api/v1/units` with a key of the organization lists them with their ids (so do `/groups` and `/users`) |
| `secret_ref`, `sla_policy_ref`, `escalation_policy_ref` | the object's id | no page shows it: leave these out and let the admin choose on the setup page |
| `connection_ref` | only the pair `{"provider": "<provider>", "externalAccountId": "<account>"}`, with the provider of the connection (`resend` for an email step's connection, `hubspot` for a HubSpot integration or connected app): setup refuses a bare connection id where the parameter fills an email step's connection or `config.account` | no page shows the value. Leave it out: the admin picks the connection on the setup page, or copy the pair from the **Parameters file** that page downloads |
| `text`, `number` | a string, a number | you decide |
| `enum` | one of the parameter's `options` | you decide |

Ids are easiest from the admin: once they have chosen on the setup page, **Parameters file** downloads the same
object, which you can keep for CI.

```json
{ "app_users": "0190f8f4-aaaa-7000-8000-000000000001", "it_group": "0190f8f4-aaaa-7000-8000-000000000002" }
```

An id that names nothing in the organization shows on the setup page as an item that needs a fix.

## `--json` and exit codes

Every command takes `--json` and then prints exactly one JSON value on stdout:

| Command | Result |
|---|---|
| `init` | `{"dir":"/abs/my-app","id":"acme/my-app"}` |
| `build` | `{"files":12,"ui":"none"}` |
| `build --check` | `{"stale":[],"missing":[],"extra":[]}` |
| `keygen` | `{"file":"…","key_id":"acme-2026"}` |
| `seal` | `{"file":"…","package_id":"acme/my-app","version":"0.1.0","digest":"…","signer":"acme-2026","unchanged":false}` |
| `lint` | AgentFlow's answer: `{"platform_version":"2026.10","problems":[…]}` |
| `deploy` | `{"package":{"package_id":"acme/my-app","version":"0.1.0","digest":"…","signer":"acme-2026","uploaded":true},"deployment":{"deployment_id":"…","status":"awaiting_approval","kind":"install","approve_url":"…"}}` |
| a refusal | `{"error":{"code":"PACKAGE_STALE","message":"…","files":["package/objects/entity/case.json"]}}` |

Exit codes: `0` done, `1` refused (and `lint` with problems, `deploy --wait` failed or cancelled), `2` usage error, `130` when you stop `deploy --wait`. Without `--json`, a refusal prints `<CODE>: <message>` on
stderr.

## Every refusal

- `reference/refusals.md` has every code the CLI prints and every refusal AgentFlow sends back to `lint` and
  `deploy`: what it means and what to do.
- `reference/lint-problems.md` has every problem `lint` reports (`bare_key`, `run_as_not_initiator`,
  `egress_undeclared` and the rest), with the fix.
