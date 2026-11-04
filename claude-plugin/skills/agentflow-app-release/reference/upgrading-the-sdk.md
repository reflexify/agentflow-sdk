# Upgrading the SDK

Move a project to a newer SDK release in this order:

1. Change the tag in `package.json`: the builder's reference ends in `#sdk-vX.Y.Z&path:packages/agentflow-app-builder`
   (and the other `@reflexify/agentflow-*` references, if the project has them), to the same new tag. The reference
   changes with the tag: `#sdk-v0.4.1&path:…` becomes `#sdk-v0.9.0&path:…`, and every `@reflexify/agentflow-*` entry in
   `dependencies` and `devDependencies` names the same one.
2. `pnpm install`
3. `pnpm build`, which rewrites `package/` with the new builder.
4. `pnpm check` (`build --check` only), then `pnpm exec agentflow-app lint`. If the project commits generated types, also `pnpm exec agentflow-app types --check` (a project without them: see "Adopting the pieces a newer starter ships" below).
5. `pnpm seal`.

Step 5 can answer `SEAL_OUT_EXISTS`: a new SDK can build other values from the same `config/`, so the package's digest
changes and the `.afpkg` already in `dist-app/` for this `version` now differs. (A rebuild that changes only member order
or spacing in the JSON outside `ui/` keeps the digest, and `seal` prints `unchanged`.) What to do depends on whether that version ever reached AgentFlow:

- **Never uploaded** (only `seal` ran, or `lint`, which sends `package/` and stores nothing; a version is stored once it is uploaded, by `deploy`, `publish` or on the admin's packages page): delete the old
  `dist-app/<prefix>-<key>-<version>.afpkg` and seal again.
- **Uploaded** (a `deploy` reached AgentFlow, even one never approved, or an admin uploaded the file on the packages page): your organization holds that
  version, and an upload of other contents under it is refused with `APP_PACKAGE_VERSION_EXISTS`. A `publish` stores it the same way, so
  other contents under a published version are refused with the same `APP_PACKAGE_VERSION_EXISTS`. Deleting the file
  does not help. Raise `version` in `config/package-manifest.json`, build, seal, deploy.
- Unsure: raise `version`. It costs nothing.

## Adopting the pieces a newer starter ships

A project made from an older starter does not gain the new starter's files by upgrading. For the generated types
(the starter has had them since 0.4.0), a project that has a UI module does this once:

1. `pnpm build`, then `pnpm exec agentflow-app types`: it writes `src/generated/app.ts` from `package/`.
2. Commit `src/generated/app.ts`.
3. Append ` && agentflow-app types --check` to the `test` script in `package.json`, after `agentflow-app build --check`,
   as `init` writes it: `vitest run && agentflow-app build --check && agentflow-app types --check`. A file that falls behind
   `package/` then fails `pnpm test` with `TYPES_STALE`.

A project made before the starter had a `.gitattributes` gains one by adding the file at the root, `* text=auto eol=lf`,
and committing it: every checkout, a Windows one with `core.autocrlf` included, then writes LF. Keep it even though
the builder now reads line endings itself, from this release on:

- `build --check` and `types --check` compare text, so a `package/` or `src/generated/app.ts` whose line endings
  became CRLF is the same text.
- `build` reads a Code step's file (`config/code/*.js`) and a skill (`config/skills/*.SKILL.md`) with `\r\n` as `\n`, so
  a CRLF checkout builds the same objects and seals to the same digest. Those are the only text files it embeds in
  an object; the rest of `config/` is JSON, read as data, and `.mjs` modules that run, so their line endings change no value.
- A built UI module is compared and hashed as bytes. `package/ui/` is built on your machine and git ignores it, so
  nothing needs doing there. In a project converted from a draft, the committed `ui/built/` is copied into it as it is,
  and only `.gitattributes` keeps that LF.
- A `package/` built before this release from CRLF sources holds the CRLF text. After upgrading, step 3 (`pnpm build`)
  rewrites those objects once, and a `pnpm check` run before it would name them `PACKAGE_STALE`. Step 5 (`seal`) then
  gives another digest: treat it as that step does, deleting the file if the version never left your machine and raising
  `version` if it did.

A project with no UI module (`init --no-ui`) has no `src/generated/app.ts` and keeps `test` as it is: the starter gives
the file only to a project with a module, and `types --check` fails with `TYPES_STALE` when the file does not exist.
Skip step 3 there unless you run `types` and commit the file on purpose.
