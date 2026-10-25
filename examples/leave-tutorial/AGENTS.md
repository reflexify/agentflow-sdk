# Notes for coding agents

This project is the `acme/leave` AgentFlow app. `config/` describes the package and the builder turns it into `package/`; the module in `src/module/` is built into `package/ui/`.

## Commands

- `pnpm build`, then `pnpm test`: after every change under `config/` or `src/`.
- `pnpm exec agentflow-app types`: after a build that changed an entity, a field or a workflow input.
- `pnpm exec agentflow-app lint`: checks `package/` against the AgentFlow at `AGENTFLOW_URL`.
- `pnpm exec agentflow-app deploy --sandbox`, then `pnpm test:sandbox`.

## Rules

- Never commit `keys/` or `.agentflow/`. Never print `AGENTFLOW_TOKEN`, `AGENTFLOW_SANDBOX_KEY`, an `afk_` or `afs_` value, or the contents of `.agentflow/sandbox.json`.
- Never edit `package/` by hand: change `config/`, build, and commit both.
- Raise `version` in `config/package-manifest.json` for every release.
