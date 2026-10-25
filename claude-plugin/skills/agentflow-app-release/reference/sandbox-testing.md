# Sandbox tests: where they live, and following a run a trigger starts

## Where the tests live

`.agentflow/sandbox.json` exists only after `agentflow-app deploy --sandbox`. The test kit's `readSandbox()`, `as()`,
`idsByKey()` and `signInAs()` read it and throw without it, so a sandbox test under `test/` makes `pnpm test` fail for
everyone who has not made a sandbox, and in any offline CI job. Keep the sandbox tests in their own folder, with
their own Vitest configuration and script. The starter's `vitest.config.ts` includes only `test/**/*.test.{ts,tsx}`,
so `pnpm test` never sees them. (A project made with `--no-ui` has no Vitest at all: `pnpm add -D vitest` and
`pnpm add -D "github:reflexify/agentflow-sdk#<the builder's tag>&path:packages/agentflow-sdk"`, the SDK at the same tag
as the builder. If you add Vitest for unit tests, give its `vitest.config.ts` an `include` of `test/**/*.test.ts`: with no
config Vitest also runs `e2e/*.sandbox.test.ts` offline, and they fail. A module's screen tests need the starter's
config, which also includes `.tsx` and has the React plugin: `agentflow-ui-module`, step 1.)

```
e2e/<name>.sandbox.test.ts     the black-box tests
vitest.sandbox.config.ts       what runs them
package.json                   "test:sandbox": "vitest run --config vitest.sandbox.config.ts"
tsconfig.node.json             add "e2e/**/*.ts" and "vitest.sandbox.config.ts" to include, so pnpm typecheck covers them
```

```ts
// vitest.sandbox.config.ts
import { defineConfig } from 'vitest/config';

// A test that follows a trigger-started run waits twice, for the task and then for the record. `waitForTask` waits
// 120 s unless told otherwise, so the 60 s here is passed (`{ timeout: 60_000 }`, as in the sample below), and so is
// the record's `expect.poll(..., { timeout: 60_000 })`. The test timeout must hold both, with room to spare.
export default defineConfig({ test: { include: ['e2e/**/*.sandbox.test.ts'], environment: 'node', testTimeout: 180_000 } });
```

The loop is `agentflow-app deploy --sandbox`, `pnpm test:sandbox`, then `agentflow-app sandbox delete` (in CI,
always, even after a failure). Each test starts from `idsByKey()` (the installed objects' ids by logical key,
such as `entity:loan`) and acts through `as('<handle>')`, a client for one of `sandbox.json`'s people. Assert only
over records the test created, with a tag in a field to tell them apart.

## Typed keys: `idsByKey`, not `getAppObjects`

`getAppObjects<LogicalKey>(client)` is for module code: `GET /app/objects` answers an installed app's own code, so a
request that does not come through the installed app is refused with `APP_CALLER_REQUIRED`, and a test's
`as('<handle>')` client is a person's, not the app's. In a test, `idsByKey()` is the same list, read from the state file.
Type its keys with the same `LogicalKey` the module uses, from the file `agentflow-app types` writes:

```ts
import { idsByKey } from '@reflexify/agentflow-sdk/testing';
import type { LogicalKey } from '../src/generated/app.js';

const ids = idsByKey<LogicalKey>();
ids['entity:loan']; // a typo in the key fails the compile; without <LogicalKey> any string is accepted
```

## Checking a module without a browser

A module is served by three routes that answer a signed-in person, and a test can call them. Sign in as a sandbox person
the way a browser gets its cookie: `POST <url>/api/v1/auth/sandbox-session` with `{ "token": … }` from
`readSandbox().people[handle].token` answers `204`, and the `set-cookie` it returns goes on the next calls. The app's key
in the URL is `<prefix>-<key>` (`acme-case-desk` for `acme/case-desk`), which is also the `key` of the app in
`GET /api/v1/apps/launcher` whose entries have an `href` of `/apps/<key>/`. Then:

- `GET /api/v1/apps/<key>/module` answers `{ state, module? }`: `ready` (with `module: { digest, entry, contract }`),
  `not_installed`, or `not_assigned` (the person is outside the app's audience).
- `GET /api/v1/apps/<key>/ui/<digest>/<entry>` serves the module's files, the entry as JavaScript.
- `GET /api/v1/apps/<key>/objects` lists the app's objects by logical key with their state (`live`, among others), which
  is how the module finds its entity.

`examples/leave-tutorial/e2e/module.sandbox.test.ts` is the whole test. It proves the module is served and gated, not
that it draws: that needs a browser (`signInAs` and Playwright).

## Browser tests

`signInAs` posts to the sandbox's `url` for the session cookie, and `page.goto` opens pages at the same `url`, so
that address must serve the pages and `/api` on one origin. A hosted deployment does. Against a local stack, set
`AGENTFLOW_URL` to the web app (`http://localhost:4000`), which forwards `/api/v1` to the API when it runs with
`NEXT_PUBLIC_API_BASE=http://localhost:8080/api/v1`, and start it with `NEXT_PUBLIC_API_MOCKS=false`: with the
default, the web app's mock worker answers in the page and the test never reaches the API.

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

The test kit does both: `waitForTask(client, stepKey, recordId)` polls the person's live work, every page, until the
task at that step on that record is there (120 s by default; `{ timeout, interval }` as for `waitForRun`), and
`completeTask(client, task, action, { payload })` claims it only if nobody holds it, then submits
`{ payload: { ...payload, _action: action } }` (the action argument wins).

```ts
import { as, completeTask, waitForTask } from '@reflexify/agentflow-sdk/testing';

const manager = as('manager');
const task = await waitForTask(manager, 'approve', caseId, { timeout: 60_000 });
await completeTask(manager, task, 'approve');
```

A timeout says `no <step> task on record <id> after <ms> ms`: is the trigger armed, and is the task offered to this person?

- A task offered to a group is claimed first, then submitted (`WORK_NOT_CLAIMANT` if another person claimed it, and `WORK_ALREADY_CLAIMED` if the claim races one). The
  action ids are in `actions` of `GET /entities/{entity_id}/records/{record_id}/step`, with the line's two ids
  (`records-api.md` of the `agentflow-ui-module` skill has the call table).
- After the submit the run resumes on a worker, so what it writes shows a little later: wait for it with
  `expect.poll(() => ..., { timeout: 60_000 })` on the record, not a single read (Vitest's own poll gives up after 1 s).
- How long the run takes to reach the Human step depends on the deployment's queue, so poll for a minute or so,
  not seconds: a test that approves a task has two waits of that size, which is why the sample `testTimeout` is
  180 s: the task wait and the record poll, 60 s each as the sample passes them, and 60 s of room. Left at its
  default, `waitForTask` waits 120 s, and with a 60 s poll after it the sum is already 180 s with no room, so
  either pass `{ timeout: 60_000 }` or raise `testTimeout`. Keep `testTimeout` above the sum of the waits a test makes. A test that times out is first a trigger that is off (look at the `armed` list in `deploy --sandbox`'s
  `--json` answer, or `.agentflow/sandbox.json`) or a worker that is not running.

## The assistant and an offered skill

A sandbox test cannot check a skill the manifest offers to the assistant (`assistant.skills`): the test kit has no
helper for the assistant, and nothing checks the skill offline. Sign in as a person in the audience with
`sandbox open --as <handle>`, open the assistant and ask the skill's question. The skill is also listed on the
organization's default agent (Admin, then Agents).
