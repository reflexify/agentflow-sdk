# Sandbox tests: where they live, and following a run a trigger starts

## Where the tests live

`.agentflow/sandbox.json` exists only after `agentflow-app deploy --sandbox`. The test kit's `readSandbox()`, `as()`,
`idsByKey()` and `signInAs()` read it and throw without it, so a sandbox test under `test/` makes `pnpm test` fail for
everyone who has not made a sandbox, and in any offline CI job. Keep the sandbox tests in their own folder, with
their own Vitest configuration and script. The starter's `vitest.config.ts` includes only `test/**/*.test.{ts,tsx}`,
so `pnpm test` never sees them:

```
e2e/<name>.sandbox.test.ts     the black-box tests
vitest.sandbox.config.ts       what runs them
package.json                   "test:sandbox": "vitest run --config vitest.sandbox.config.ts"
tsconfig.node.json             add "e2e/**/*.ts" and "vitest.sandbox.config.ts" to include, so pnpm typecheck covers them
```

```ts
// vitest.sandbox.config.ts
import { defineConfig } from 'vitest/config';

// A test that follows a trigger-started run waits twice, for the task and then for the record, 60 s each at most
// (`taskFor` below, and `expect.poll(..., { timeout: 60_000 })`). The timeout must hold both, with room to spare.
export default defineConfig({ test: { include: ['e2e/**/*.sandbox.test.ts'], environment: 'node', testTimeout: 180_000 } });
```

The loop is `agentflow-app deploy --sandbox`, `pnpm test:sandbox`, then `agentflow-app sandbox delete` (in CI,
always, even after a failure). Each test starts from `idsByKey()` (the installed objects' ids by logical key,
such as `entity:loan`) and acts through `as('<handle>')`, a client for one of `sandbox.json`'s people. Assert only
over records the test created, with a tag in a field to tell them apart.

## Following a run a trigger starts

`deploy --sandbox` arms every trigger the package ships (they ship off) unless you pass `--no-arm`; if arming is
refused it exits `1` and the app stays installed with its triggers off (`APP_ARM_REFUSED`).

`waitForRun(client, runId)` needs the run's id, and a run a trigger starts gives the test none. Follow the work it
opens instead: when the run reaches a Human step, AgentFlow lists a task for the people it is offered to, in
`GET /work`. A line of `items` carries:

- `id` and `entity_id`: the task's own record and entity. The claim and step calls take these two;
- `step.step.key` and `step.step.label`: the step in the workflow, so the step's `key` finds the task;
- `step.subject.record_id` (and `entity_id`): the record the run is about, or `null` when the run has none;
- `step.workflow.id` and `step.workflow.name`.

A task offered to exactly one named person (an `initiator` step, or a person-field assignee) is claimed for them as
it opens, so it is already theirs: it shows in `view=mine` (and in `view=all`, the default, with `live=true`), never in
`view=claimable`, and they submit it without a claim. `view=claimable` lists only live work nobody holds that the
caller may claim, because a group or unit it is offered to, or several people named on it, include them. `line.claimed_by_user_id`
is `null` for work nobody holds. Claiming needs `entity.read`, so the person needs a role holding it (`sandbox-json.md`).

```ts
import { ok } from '@reflexify/agentflow-sdk';
import { as } from '@reflexify/agentflow-sdk/testing';

type Client = ReturnType<typeof as>;

/** The task a trigger-started run opened on `recordId` at the step `stepKey`, once it is waiting for `client`'s person, claimed or not. */
export async function taskFor(client: Client, stepKey: string, recordId: string, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const page = await ok(client.GET('/work', { params: { query: { view: 'all', live: true, limit: 200 } } }));
    const line = page.items.find((item) => item.step?.step.key === stepKey && item.step.subject?.record_id === recordId);
    if (line) return line;
    if (Date.now() >= deadline) throw new Error(`no ${stepKey} task for ${recordId} after ${timeoutMs} ms: is the trigger armed, and is the person it is offered to this one?`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/** Finish that task with one of its actions, claiming it first only if nobody holds it. */
export async function decide(client: Client, stepKey: string, recordId: string, action: string) {
  const task = await taskFor(client, stepKey, recordId);
  const path = { entity_id: task.entity_id, record_id: task.id };
  if (task.claimed_by_user_id === null) {
    await ok(client.POST('/entities/{entity_id}/records/{record_id}/work/claim', { params: { path } }));
  }
  await ok(client.POST('/entities/{entity_id}/records/{record_id}/step/submit', {
    params: { path },
    body: { payload: { _action: action } },
  }));
}
```

- A task offered to a group is claimed first, then submitted (`WORK_NOT_CLAIMANT` if another person claimed it, and `WORK_ALREADY_CLAIMED` if the claim races one). The
  action ids are in `actions` of `GET /entities/{entity_id}/records/{record_id}/step`, with the line's two ids
  (`records-api.md` of the `agentflow-ui-module` skill has the call table).
- After the submit the run resumes on a worker, so what it writes shows a little later: wait for it with
  `expect.poll(() => ..., { timeout: 60_000 })` on the record, not a single read (Vitest's own poll gives up after 1 s).
- How long the run takes to reach the Human step depends on the deployment's queue, so poll for a minute or so,
  not seconds: a test that approves a task has two waits of that size, which is why the sample `testTimeout` is
  180 s, three times one poll. Keep `testTimeout` above the sum of the polls a test makes. A test that times out is first a trigger that is off (look at the `armed` list in `deploy --sandbox`'s
  `--json` answer, or `.agentflow/sandbox.json`) or a worker that is not running.
