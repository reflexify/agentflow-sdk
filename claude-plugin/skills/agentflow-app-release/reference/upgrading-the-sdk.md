# Upgrading the SDK

Move a project to a newer SDK release in this order:

1. Change the tag in `package.json`: the builder's reference ends in `#sdk-vX.Y.Z&path:packages/agentflow-app-builder`
   (and the other `@reflexify/agentflow-*` references, if the project has them), to the same new tag.
2. `pnpm install`
3. `pnpm build`, which rewrites `package/` with the new builder.
4. `pnpm check` (`build --check` and `lint`).
5. `pnpm seal`.

Step 5 can answer `SEAL_OUT_EXISTS`: a new SDK can write other bytes for the same package, so the `.afpkg` already in
`dist-app/` for this `version` now differs. What to do depends on whether that version ever reached AgentFlow:

- **Never uploaded** (only `seal` ran, or `lint`, which sends `package/` and stores nothing; a version is stored once it is uploaded, by `deploy` or on the admin's packages page): delete the old
  `dist-app/<prefix>-<key>-<version>.afpkg` and seal again.
- **Uploaded** (a `deploy` reached AgentFlow, even one never approved, or an admin uploaded the file on the packages page): your organization holds that
  version, and an upload of other contents under it is refused with `APP_PACKAGE_VERSION_EXISTS`. Deleting the file
  does not help. Raise `version` in `config/package-manifest.json`, build, seal, deploy.
- Unsure: raise `version`. It costs nothing.
