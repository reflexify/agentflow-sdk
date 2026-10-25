# AgentFlow SDK

The user guide on your deployment explains how to build, seal and deploy an app: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/tong-quan` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/tong-quan`).

The AgentFlow SDK is what you need to build an app for AgentFlow outside AgentFlow: describe the app as code,
build it into a package, and seal that package with your own signing key. It needs only Node 22.9 or later and pnpm.

It has three packages:

| package | folder | what it is |
|---|---|---|
| `@reflexify/agentflow-app-builder` | `packages/agentflow-app-builder` | The `agentflow-app` CLI: `init`, `init --from`, `build`, `keygen` and `seal`. It turns an app's `config/` into its `package/` and signs that into an `.afpkg`. Build time only. |
| `@reflexify/agentflow-sdk` | `packages/agentflow-sdk` | A client for AgentFlow's public API, and a server-side handler for an app's own site (sign-in, sessions, a proxy). |
| `@reflexify/agentflow-elements` | `packages/agentflow-elements` | Web components that put AgentFlow work in your pages, and the UI kit for an app's screens inside AgentFlow. |

Each package's README documents it. The builder's README documents `config/`, the format you write.
To test an app in a disposable organization with no admin to approve it, run `agentflow-app deploy --sandbox`, then use the test kit, `@reflexify/agentflow-sdk/testing` (`packages/agentflow-sdk/README.md`, "Testing against a sandbox"); the guide page is `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/thu-trong-sandbox` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/thu-trong-sandbox`).
The UI kit's design guide, `packages/agentflow-elements/DESIGN.md`, is how an app's UI module should look and behave.

## The two repositories

- **`reflexify/agentflow-sdk`** (this one) holds the three packages, their built output (`dist/`), the
  examples and the Claude Code plugin. The built output is committed, so you install straight from git with no
  build step. Each release is one commit on `main`, tagged `sdk-vX.Y.Z`.
- **`reflexify/agentflow-app-template`** holds the starter app, ready to copy and change. Its `main` carries
  the same tag, and its dependencies point at the same release of this repository.

Both are public: pnpm fetches them over HTTPS with no login, SSH key, token or CI secret.

## Installing a package

Install a package by its folder in this repository, at a release tag:

```bash
pnpm add "github:reflexify/agentflow-sdk#sdk-v0.4.1&path:packages/agentflow-elements"
```

The form is `github:reflexify/agentflow-sdk#sdk-v<version>&path:packages/<folder>`, with the folders from the
table above. The builder is a development dependency:

```bash
pnpm add -D "github:reflexify/agentflow-sdk#sdk-v0.4.1&path:packages/agentflow-app-builder"
```

Inside this repository the packages refer to each other by the same form, at the same tag, so installing one
brings the matching release of the others. Use one tag for every package you install.

**Two pnpm settings.** Put these in your project's `pnpm-workspace.yaml` (`agentflow-app init` and the template write them for you):

```yaml
blockExoticSubdeps: false
allowBuilds:
  esbuild: true
```

- `blockExoticSubdeps: false`: our packages refer to each other by git reference, and pnpm refuses a git
  reference below a direct dependency unless this is off (`ERR_PNPM_EXOTIC_SUBDEP`).
- `allowBuilds`: the starter's tooling (`tsx`) needs esbuild's install script, which pnpm otherwise refuses to
  run (`ERR_PNPM_IGNORED_BUILDS`).

## Starting an app

Either run the builder's `init` straight from git:

```bash
pnpm dlx --package "github:reflexify/agentflow-sdk#sdk-v0.4.1&path:packages/agentflow-app-builder" \
  agentflow-app init my-app --prefix acme
cd my-app && pnpm install && pnpm build
```

`--prefix` is your package prefix: you choose it (2 to 16 lowercase letters and digits, starting with a letter). `--no-ui` leaves out the UI module
and `--no-site` the standalone site. The new project's `pnpm-workspace.yaml` holds the two settings above.

Or clone the template:

```bash
git clone git@github.com:reflexify/agentflow-app-template.git my-app
cd my-app && pnpm install && pnpm build
```

The template's package is `acme/case-desk`: set `id` to `<prefix>/<key>` in `config/package-manifest.json`, then
`pnpm build` again. A clone also carries the standalone site and the name `case-desk` in more places than `id`, so
prefer `agentflow-app init`, which renames and strips all of it: run it in a scratch folder with your names and copy
your own `config/` into the result.

Then make your signing key once, and seal:

```bash
pnpm exec agentflow-app keygen --key-id <your-key-id>
pnpm seal
```

`keygen` writes `keys/<id>.pem`, readable only by you. Never commit `keys/`. AgentFlow enforces nothing per publisher: any intact sealed package installs, with any prefix and any key (the key id is recorded on the release as a claim AgentFlow does not check; a leaked key changes nothing, but keep keys private, as they are how you seal), and the admin's approval of each install and upgrade is the gate. `pnpm seal` writes
`dist-app/<package>-<version>.afpkg`. To install it, run `agentflow-app deploy` (see the deploy section of the
builder's README); an admin of your organization then approves it on the setup page.

To move an app you built in AgentFlow's designers into code, download its draft from **Admin → Apps → Pack**
and run `agentflow-app init <dir> --from <draft.zip>` with `<dir>` a new, empty folder: `init --from` makes the
project. Run it with `pnpm dlx` (see the agentflow-from-draft skill) or from any project where the builder is
installed. It is not a step inside a copy of the template.

## The Claude Code plugin

The `agentflow` plugin gives a coding agent the skills to author an app's `config/`, to build and seal it,
to convert a draft, and to write its UI module against the kit's design guide. In Claude Code:

```
/plugin marketplace add reflexify/agentflow-sdk
/plugin install agentflow@agentflow-sdk
```

Or from a shell: `claude plugin marketplace add reflexify/agentflow-sdk`, then
`claude plugin install agentflow@agentflow-sdk`. The marketplace follows `main`, which is always the latest
release; each skill describes the release it ships with.

## The example

`examples/` holds the case desk, the starter `agentflow-app init` copies. It is here to read: it shows a whole app
built with the builder. Its RUNBOOK is written for a team that has the SDK and an AgentFlow deployment to connect
to. Its README describes how it is built; a few build steps use the SDK workspace's own scripts, so run those from
a checkout of the SDK.

## Versions

- **The SDK has one version for all three packages**, the tag's `X.Y.Z`. It is 0.x, and may change in any
  release until the format is called stable. Read [CHANGELOG.md](CHANGELOG.md) before you move to a new tag.
- **`configVersion`**, in `config/package-manifest.json`, is the version of the `config/` format your app is
  written in. The builder refuses a `config/` without it, or with one newer than it reads, and names the
  version it needs. SDK 0.4.1 writes and reads `configVersion` 1.
- **Each release's notes** in [CHANGELOG.md](CHANGELOG.md) give the `configVersion` and the package
  `formatVersion` it writes, and the oldest AgentFlow version (`minPlatformVersion`) that installs its
  packages.
- **Your package's own `version`**, in `config/package-manifest.json`, is yours: raise it on every release you
  seal.
