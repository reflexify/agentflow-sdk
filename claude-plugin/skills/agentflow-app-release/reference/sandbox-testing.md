# Sandbox tests: where they live, and following a run a trigger starts

## Where the tests live

`.agentflow/sandbox.json` exists only after `agentflow-app deploy --sandbox`. The test kit's `readSandbox()`, `as()`,
`idsByKey()` and `signInAs()` read it and throw without it (`readSandbox().people[<handle>]` holds each person's
`user_id`, which a test writes into a person field, and `token`). So a sandbox test under `test/` makes `pnpm test` fail for
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
always, even after a failure). While you work, raise `version` after each change and run
`agentflow-app deploy --sandbox --upgrade`: it installs into the same sandbox, so its records, its people's sign-ins
and the organization settings you set there by hand (such as the business calendar) stay. It sends the app's parameters
again from the install answers recorded when the sandbox was made, replacing any changed on the setup page, and a dependency's answers only when the upgrade installs or upgrades that dependency (one the sandbox holds already is left as it is, and the CLI says so), so after changing `sandbox.json` (it warns when you did) start over with `deploy --sandbox --replace`; it refuses `SANDBOX_GONE` once the sandbox
expired or was deleted, and `SANDBOX_ELSEWHERE` when `AGENTFLOW_URL` names another AgentFlow than the one it was made on. A temporary patch version for each iteration (`0.10.101`,
`0.10.102`, …), restored before the commit, lets you upgrade all day; the version you release may be lower than
one the sandbox ran. Each test starts from `idsByKey()` (the installed objects' ids by logical key,
such as `entity:loan`) and acts through `as('<handle>')`, a client for one of `sandbox.json`'s people. Assert only
over records the test created, with a tag in a field to tell them apart.

## In CI

A GitHub Actions workflow for a release tag, every night and by hand. It needs `AGENTFLOW_URL` (a repository
variable) and `AGENTFLOW_SANDBOX_KEY` (a secret), and each `secret_env` of `sandbox.json` as a secret of the same name.
`deploy --sandbox` uploads `package/` as built and refuses one that `config/` has moved past (`PACKAGE_STALE`), and a
project with a UI module needs `package/ui`, which git ignores, so the job builds first. It writes
`.agentflow/sandbox.json` in the job's folder, where `pnpm test:sandbox` and `sandbox delete` read it, so all three
run in one job:

```yaml
# .github/workflows/sandbox.yml
name: sandbox
on:
  push: { tags: ["v*"] }
  schedule: [{ cron: "0 2 * * *" }]
  workflow_dispatch: {}
jobs:
  sandbox:
    runs-on: ubuntu-latest
    env:
      AGENTFLOW_URL: ${{ vars.AGENTFLOW_URL }}
      AGENTFLOW_SANDBOX_KEY: ${{ secrets.AGENTFLOW_SANDBOX_KEY }}
      # one line per secret_env of sandbox.json, such as:
      # SANDBOX_RESEND_API_KEY: ${{ secrets.SANDBOX_RESEND_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4        # the version in package.json's packageManager
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      # - run: pnpm exec playwright install --with-deps chromium   # only if a test signs in a page (signInAs)
      - run: pnpm exec agentflow-app deploy --sandbox
      - run: pnpm test:sandbox
      - if: always() && hashFiles('.agentflow/sandbox.json') != ''
        run: pnpm exec agentflow-app sandbox delete
```

The SDK and the builder install from GitHub at the tag in `package.json`, so the job needs network access to
GitHub, as `pnpm install` does on your machine; the committed `pnpm-lock.yaml` keeps the install frozen. A sandbox
that `delete` misses (a runner that dies, or a delete that fails) lives until it expires, 7 days by default, and counts against the
organization's live sandboxes (`SANDBOX_LIMIT_REACHED`): `sandbox list` shows them, `sandbox delete --id <id>` ends one.

## What a sandbox holds

A new sandbox, made by `deploy --sandbox` with no state file or by `deploy --sandbox --replace` (which deletes the
recorded one first), starts as an organization holding `sandbox.json`'s people, groups and connections, and then the
app. A plain `deploy --sandbox` never deletes one: into a recorded sandbox that holds the app it is refused
(`SANDBOX_HOLDS_PACKAGE`), naming both flags. It reads "holds the app" off the deployments of the package's id that
the sandbox's deploy key lists, which has two known limits. After you undo or detach the app in the sandbox, its
deployments still read `installed`, so a plain deploy is still refused: `--upgrade` installs into the sandbox all the
same, with a raised `version` as every `--upgrade` needs (the same version with other content is refused
`409 APP_PACKAGE_VERSION_EXISTS`, and unchanged it replays the earlier deployment and installs nothing while AgentFlow still holds that deployment's idempotency key, 24 hours by default, after which it installs again), and
`--replace` starts over. A package whose `id` you changed installs beside the old one, which stays:
`--replace` gives a sandbox that holds only the new one. The app's seeds arrive
with the install, as in any organization (`entities.md` of the `agentflow-app-authoring` skill, "Starter records:
`seed`"), and nothing else seeds it: `sandbox.json` has no member for records, and there is no setup hook. Every
other record comes from one of three places:

- **A test.** Each test creates what it needs, through `as('<handle>')`. Where the entity has a natural key, create
  by it and read a `409` `ENTITY_NATURAL_KEY_CONFLICT` as already there, so a rerun against the same sandbox is
  harmless. Data several test files share can go in a Vitest `globalSetup` file, which runs once before them.
- **A person**, signed in with `agentflow-app sandbox open --as <handle>`.
- **The app's triggers**, which `deploy --sandbox` arms, so a record a test creates can start runs that create
  more. `--no-arm` leaves them off, and the sandbox then holds only its seeds until the tests act.

Records an earlier test run made stay until the sandbox expires or is deleted: assert only over what the test
created, and run `agentflow-app deploy --sandbox --replace` for a fresh sandbox.

An upgrade leaves the objects a release dropped (a probe workflow and its trigger, an entity) installed as
deprecated, and deprecated triggers are off. `deploy --sandbox --upgrade` lists them by key after the upgrade, with
the installed app's page where a person removes each; the CLI removes nothing, since those removals are not
published to a key or a person's token.

A new sandbox secures no field unless `sandbox.json` says which. Without that, an app whose fields are
`recommendedSecured` shows every value to every person there, and a workflow that runs as a service principal reads
them all, so most tests pass while proving nothing about access. Give `sandbox.json` a `field_security` member
(`sandbox-json.md`, "Field security"): `deploy --sandbox` then secures the fields and grants the profiles as the
owner, after the install and before it arms the triggers, on every deploy, so the sandbox holds the access production
has. "Field security in a test", below, changes it on purpose.

## Typed keys: `idsByKey`, or `getAppObjects` through `as`

`GET /app/objects` answers an installed app's own code, and refuses anyone else with `APP_CALLER_REQUIRED`. A test's
`as('<handle>')` client is a person's, so it answers that request itself: it reads the installation's objects with the
sandbox owner's token, which is the same answer, revision included. So module code that takes its `api` and calls
`getAppObjects<LogicalKey>(api)` runs in a test given `as('<handle>')` as `api`, and finds what the installed app finds.
The answer is live: an admin's change in the sandbox shows on the next fetch. Every other request goes out as the person.
The kit has no client that sends the installed app's own token, so what a site using that token is answered under the
app's ceiling (a record query, a directory list) cannot be tested through it: test the person's answer, and say so in
the test.

For the ids alone, `idsByKey()` reads them from the state file, as `deploy --sandbox` last wrote them. Type its keys with
the same `LogicalKey` the module uses, from the file `agentflow-app types` writes:

```ts
import { idsByKey } from '@reflexify/agentflow-sdk/testing';
import type { LogicalKey } from '../src/generated/app.js';

const ids = idsByKey<LogicalKey>();
ids['entity:loan']; // a typo in the key fails the compile; without <LogicalKey> any string is accepted
```

## Field security in a test

`sandbox.json`'s `field_security` sets the sandbox up on every deploy. A test that changes that setup on purpose uses
the kit's helpers, which act as the sandbox's owner and name everything as `sandbox.json` does:

- `grantFieldProfile(profile, holder)` and `revokeFieldProfile(profile, holder)` add or remove one holder of the
  profile named `profile`, which must exist, and save it whole. `holder` is `{ group: '<key>' }`,
  `{ person: '<handle>' }`, `{ principal: '<key>' }` or `{ agent: '<key>' }`.
- `secureField('<entity>.<field>')` and `unsecureField('<entity>.<field>')` secure or unsecure one field.
  Unsecuring takes the field out of every profile, and securing it again does not put it back.
- `expectFieldHidden(client, '<entity>.<field>', recordId)` throws unless the client's person reads the record but not
  the field: the field is secured, the entity's `field_access` says they may not read it, and the record they are
  answered with leaves it out. A person who may not read the record at all makes it throw too, so the test proves
  what it says.

Each one converges: a holder already granted, or a field already secured, sends nothing or changes nothing. A change
outlives the test, so put it back in a `finally`, or run `deploy --sandbox --upgrade`, which applies
`field_security` again: after `unsecureField` it secures the field again and grants it to the profiles that name it.
What `--upgrade` cannot undo is a `secureField` of a field the file does not list, since it never unsecures one: undo
that with `unsecureField`, or start over with `--replace`.

One person reads a secured field and another does not. The value goes in through a person the profile lets set it:

```ts
import { ok } from '@reflexify/agentflow-sdk';
import { as, expectFieldHidden, idsByKey } from '@reflexify/agentflow-sdk/testing';
import type { LogicalKey } from '../src/generated/app.js';

it('shows the cost of an order to sales only', async () => {
  const entity_id = idsByKey<LogicalKey>()['entity:order'];
  const order = await ok(as('am1').POST('/entities/{entity_id}/records', {
    params: { path: { entity_id } },
    body: { form_payload: { title: 'PO-1', cost: 1_000_000 } },
  }));
  const seen = await ok(as('am1').GET('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id, record_id: order.id } },
  }));
  expect(seen.body.cost).toBe(1_000_000);
  await expectFieldHidden(as('outsider'), 'order.cost', order.id);
});
```

A run that reads a secured field parks while its identity holds no profile for it, and goes on once it is granted and
the run is resumed (a grant never resumes a parked run by itself). Here the workflow runs as a principal in the
`automation` group, which `sandbox.json` grants the profile:

```ts
import { ok } from '@reflexify/agentflow-sdk';
import { as, grantFieldProfile, readSandbox, revokeFieldProfile, waitForRun } from '@reflexify/agentflow-sdk/testing';

const PROFILE = 'P&L · Số đơn hàng';

it('parks without the profile of the automation group, and goes on once it is granted', async () => {
  const owner = as(readSandbox().owner);
  const read = (instance_id: string) => ok(owner.GET('/instances/{instance_id}', { params: { path: { instance_id } } }));
  await revokeFieldProfile(PROFILE, { group: 'automation' });
  try {
    // Your helper: create the order whose trigger starts the review, then poll
    // GET /entities/{entity_id}/records/{record_id}/runs for the run's id.
    const runId = await startCostReview();
    // reason.entity is the installed key, such as acme_pl__order, so the match leaves it out.
    await expect.poll(async () => (await read(runId)).auth_blocked_detail, { timeout: 60_000 }).toMatchObject({
      reason: { kind: 'field_not_readable', fields: ['cost'] },
    });
    await grantFieldProfile(PROFILE, { group: 'automation' });
    const resumed = await ok(owner.POST('/instances/{instance_id}/authorization/resume', {
      params: { path: { instance_id: runId } },
      body: { expected_updated_at: (await read(runId)).updated_at },
    }));
    expect(resumed.status).toBe('running');
    expect((await waitForRun(owner, runId, { timeout: 60_000 })).status).toBe('completed');
  } finally {
    await grantFieldProfile(PROFILE, { group: 'automation' });
  }
});
```

Before the grant, the resume is refused `AUTHORIZATION_STILL_BLOCKED` ("Resuming a parked run", below, and "When a
run fails" for reading `auth_blocked_detail`).

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

`sandbox open --as <handle>` opens a link AgentFlow builds from its own `HTTP_FRONTEND_BASE` (the web app's address
as the API knows it, `http://localhost:4000` by default), not from `AGENTFLOW_URL` or `--url`, which only choose
which AgentFlow the CLI asks. When the browser lands on the API's own address, or on your organization's pages
instead of the sandbox's, that variable on the local API names the wrong host: set it to the web app and restart
the API. The command hands the link to the system's opener (`open`, `xdg-open`, `start`), so it reaches the
default browser, never one a test is driving. The sign-in replaces the session cookie of any AgentFlow on the
same host, since a cookie knows no port: expect to sign back in to your own account on `localhost` afterwards.

## Following a run a trigger starts

`deploy --sandbox` arms every trigger the package ships (they ship off) unless you pass `--no-arm`; if arming is
refused it exits `1` and the app stays installed with its triggers off (`APP_ARM_REFUSED`).

How long that takes is "How long a sandbox run takes", below: wait on the run or the task with a deadline, never a fixed
delay, and run sandbox suites one at a time.

`waitForRun(client, runId)` needs the run's id, and a run a trigger starts gives the test none. Follow the work it
opens instead: when the run reaches a Human step, AgentFlow lists a task for the people it is offered to, in
`GET /work`. A line of `items` carries:

- `id` and `entity_id`: the task's own record and entity. The claim and step calls take these two, and `id` is a
  task page's `{{ record_id }}`;
- `step.step.key` and `step.step.label`: the step in the workflow, so the step's `key` finds the task;
- `step.subject.record_id` (and `entity_id`): the record the run is about, or `null` when the run has none;
- `step.workflow.id` and `step.workflow.name`.

A run that opens no task is among its record's runs. A record trigger's run is about the record whose change started
it (a grouped run, its batch's newest record), and `GET /entities/{entity_id}/records/{record_id}/runs` lists a
record's runs newest first, each with its `id`, `status` and `workflow` (`key` is the installed key,
`acme_case_desk__<key>`). The `agentflow-ui-module` skill's `records-api.md`, "A record's runs, and what a run did",
describes the whole answer. Right after the write that fires the trigger the run may not exist yet, so poll that list with
a deadline until a run of the workflow shows, then pass its `id` to `waitForRun`. `GET /instances` takes no workflow
to filter by.

A task offered to exactly one named person (an `initiator` step, or a person-field assignee) is claimed for them as
it opens, so it is already theirs: it shows in `view=mine` (and in `view=all`, the default, with `live=true`), never in
`view=claimable`, and they submit it without a claim. `view=claimable` lists only live work nobody holds that the
caller may claim, because a group or unit it is offered to, or several people named on it, include them. `line.claimed_by_user_id`
is `null` for work nobody holds. Claiming needs `entity.read`, so the person needs a role holding it (`sandbox-json.md`).

The test kit does both: `waitForTask(client, stepKey, recordId)` polls the person's live work, every page, until the
task at that step on that record is there (120 s by default; `{ timeout, interval }` as for `waitForRun`); `stepKey`
is the Human step's id, and the step need not be in the workflow's `exposedSteps`. And
`completeTask(client, task, action, { payload })` claims it only if nobody holds it, then submits
`{ payload: { ...payload, _action: action } }` (the action argument wins).

```ts
import { as, completeTask, waitForTask } from '@reflexify/agentflow-sdk/testing';

const manager = as('manager');
const task = await waitForTask(manager, 'approve', caseId, { timeout: 60_000 });
await completeTask(manager, task, 'approve');
```

`caseId` is the work line's `step.subject.record_id`.

A timeout says `no <step> task on record <id> after <ms> ms`: is the trigger armed, and is the task offered to this person?

- A task offered to a group is claimed first, then submitted (`WORK_NOT_CLAIMANT` if another person claimed it, and `WORK_ALREADY_CLAIMED` if the claim races one). The
  action ids are in `actions` of `GET /entities/{entity_id}/records/{record_id}/step`, with the line's two ids
  (`records-api.md` of the `agentflow-ui-module` skill has the call table).
- After the submit the run resumes on a worker, so what it writes shows a little later: wait for it with
  `expect.poll(() => ..., { timeout: 60_000 })` on the record, not a single read (Vitest's own poll gives up after 1 s).
- A test that approves a task has two waits, the task and then the record, which is why the sample `testTimeout` is
  180 s: 60 s for each as the sample passes them (`{ timeout: 60_000 }`), and 60 s of room. Left at its default,
  `waitForTask` waits 120 s, and with a 60 s poll after it the sum is already 180 s with no room, so either pass
  `{ timeout: 60_000 }` or raise `testTimeout`. Keep `testTimeout` above the sum of the waits a test makes; the
  tutorial's example sets 300 s, which leaves more room and is as right. A test that times out is first a trigger that
  is off (look at the `armed` list in `deploy --sandbox`'s `--json` answer, or `.agentflow/sandbox.json`) or a worker
  that is not running.

**Wait for the write, not for the run.** When the person's run only hands work to a trigger (a record, then a
trigger: the authoring skill's `workflows.md`), the run the screen or the test started ends before the reply
exists: it wrote the person's half, and the triggered run writes the rest. A screen or a test that waits on the
first run says "no reply" seconds after the person acted, and the reply lands later. Wait on the record for the
field the second run writes, with a deadline, and read the first run's end as the end of the wait only when it
wrote nothing.

## Testing what an Email step sends

Give `sandbox.json` a `loopback` connection (`sandbox-json.md`, "Connections") and answer the app's email
`connection_ref` with it. It needs no Resend account and no secret, mails nobody, and accepts every message an Email
step sends through it. Each send then fires `email.sent` on the connection, as a Resend send does, with the Message-ID
AgentFlow set (`message_id_source: "ours"`), so a workflow the app starts from `email.sent` runs in the sandbox and a
test follows it as any run a trigger starts (above). The step's own result, and the record the workflow writes, are
read as in any other test. A message sent through a loopback connection is never delivered, so a test cannot read it
in an inbox: `agentflow-app sandbox mail-out --connection <key>` lists it instead (below).

## Testing inbound mail

`agentflow-app sandbox mail-in --connection <key> --file <message.json>` delivers a message to the sandbox's `loopback`
connection `<key>` (its key in `sandbox.json`) as a mail provider would: it is recorded as `email.received` and starts
the app's `email.received` workflows through the same settle and dispatch as real received mail, with the threading
fields (`in_reply_to`, `references`, `plus_tags`) read by the same parser. The file holds `from`, `to` (at least one
address), `subject`, and optionally `cc`, `text`, `html` and `headers` (names in any case; a value is a string or a
list of strings). A `Message-ID` header becomes the event's `message_id`. `attachments` is a list of
`{"filename", "content_type", "content_base64"}` (standard base64) whose decoded sizes add up to at most 5 MiB; they are
stored as files, as a received email's are, and listed in the event's `attachments` (and so in a trigger's mapping of
`event.properties.attachments`) only when a trigger of the app will start on the message. A message
carrying `Auto-Submitted` with any keyword but `no` is not recorded, and the command prints
`discarded (auto_submitted)`. `sandbox mail-out --connection <key>` lists what the connection sent, newest first;
`--json` prints `{"sends": [...]}`, each send holding `outbound_id` (the id of the send's outbound row), `sent_at`
(an RFC 3339 time), `to`, `extra_to`, `cc`, `subject`, `text_body`, `html_body`, `message_id`, `in_reply_to` and
`references` (never a blind copy; the last three are `null` when absent). The routes underneath are `POST`
`/api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/inbound` and `GET …/sent`, called with
`AGENTFLOW_SANDBOX_KEY`; the CLI finds the connection's id under `ids.connections.<key>` in `.agentflow/sandbox.json`.

A reply to the app's own mail, and the app's answer to it:

```json
{
  "from": "Ada <ada@example.test>",
  "to": ["desk+t42@example.com"],
  "subject": "Re: Your ticket",
  "text": "It still fails after the update.",
  "headers": { "In-Reply-To": "<0192f3a1-0000-7000-8000-000000000001@example.com>" }
}
```

```ts
import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

const cli = (...args: string[]) =>
  execFileSync('pnpm', ['exec', 'agentflow-app', 'sandbox', ...args], { encoding: 'utf8' });

it('answers a reply on the ticket it threads to', async () => {
  expect(cli('mail-in', '--connection', 'mail', '--file', 'test/mail/reply.json').trim()).toBe('recorded');
  await expect
    .poll(
      () => JSON.parse(cli('mail-out', '--connection', 'mail', '--json')).sends,
      { timeout: 120_000, interval: 3_000 },
    )
    .toContainEqual(expect.objectContaining({ to: 'ada@example.test', subject: 'Re: Your ticket' }));
});
```

The run the injected mail starts is followed as any run a trigger starts (above), and its answer is asserted on its
structure (who it goes to, its subject, that its `in_reply_to` names the message it answers), never a model's wording.

## Testing inbound messages

`agentflow-app sandbox message-in --connection <key> --from <sender> [--thread-key <key>] [--text <text>]
[--verified-email <address>] [--verified-phone <number>] [--file <path>]...` delivers a message to the sandbox's `loopback` connection `<key>` that
has a `channel` (`sandbox-json.md`, "Connections"), as a messaging provider would: it is recorded as
`message.received` on the connection's channel and starts the app's `message.received` workflows through the same
settle and dispatch as a message a webhook relay posts.

- **The thread.** Messages with one `--thread-key` share a channel thread while it is open, and each event carries its
  id as `thread_id`. Without `--thread-key`, the sender's value is the key, so one sender's messages share a thread. A
  blank key is refused.
- **The sender.** `--from` is required. A value with an `@` is an `email` identity, a `+` and up to 15 digits a
  `phone`, anything else a `handle`; `from_kind` and `from_value` repeat it. `--verified-email bob@example.com` puts
  `{"method": "channel", "email": "bob@example.com"}` on `from.verified`, and `--verified-phone +15550001` puts
  `{"method": "channel", "phone": "+15550001"}`, as a relay that vouches for its sender does. Give both and
  `from.verified` carries `email` and `phone`; give neither and it is `null`. The run's `workflow.sender.verified` is
  the same object, so a tool that matches `workflow.sender.verified.phone` and a `verified_sender` tool both run for a
  sender verified by phone. AgentFlow judges both values, and refuses an address it cannot read as an email, or a
  number that is not a `+` and up to 15 digits, with `VALIDATION_ERROR` naming `verified_email` or `verified_phone`.
  An AgentFlow older than this flag refuses `verified_phone` as a member it does not take.
- **The content.** `--text`, at least one `--file`, or both. Each `--file` is attached under its base name, with a
  content type read from its extension (a generic binary type when unknown), and their sizes add up to at most
  5 MiB. They are stored as files and listed in the event's `attachments` only when a trigger of the app will start on
  the message, as for `mail-in`. The request that carries the message is at most 8,039,084 bytes, the files' 5 MiB as
  base64 and a megabyte more, so a `--text` that would pass that is refused before anything is sent. Files over
  5 MiB together are refused the same way, and both are usage errors (exit 2, `USAGE`). The system refuses a command
  line as long as that `--text` before the CLI starts (Linux takes 128 KiB in one argument, macOS 1 MiB in all of
  them), so a test of a message too big to send gives `--file` attachments over 5 MiB.
- **The answer.** The command prints `recorded <event id> on thread <thread id>`; `--json` prints AgentFlow's answer,
  `{"event_id": "…", "thread_id": "…"}`. A connection that is not a loopback with a channel is `NOT_FOUND`, and a
  sandbox that is gone is `SANDBOX_NOT_LIVE`.

The route underneath is `POST /api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/messages`, called with
`AGENTFLOW_SANDBOX_KEY`, with the body `{"from", "thread_key"?, "text"?, "verified_email"?, "verified_phone"?, "attachments"?}`
(`attachments` as for `mail-in`).

```ts
import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

const cli = (...args: string[]) =>
  execFileSync('pnpm', ['exec', 'agentflow-app', 'sandbox', ...args], { encoding: 'utf8' });

it('starts the intake workflow on the sender\'s thread', async () => {
  const sent = JSON.parse(cli('message-in', '--connection', 'sms', '--from', '+15550001', '--text', 'Where is my order?', '--json'));
  const again = JSON.parse(cli('message-in', '--connection', 'sms', '--from', '+15550001', '--text', 'Any news?', '--json'));
  expect(again.thread_id).toBe(sent.thread_id);
});
```

**What the app sent back.** `agentflow-app sandbox message-out --connection <key>` lists what the app's Message steps
sent on that connection, newest first, one line each: the time, `thread <thread id>`, `to <value>` when the step named
someone rather than replying on a thread, and the text on one line; `nothing sent` when there is none. With `--json`
it prints `{"sends": [...]}`, each send holding `outbound_id`, `sent_at`, `thread_id`, `channel`, `to` (`{kind, value}`,
or `null` for a reply), `text`, `attachment_ids` and `instance_id` (the run that sent it). A reply that a workflow on
`message.received` sends with `thread: "{{ trigger.thread_id }}"` (or an input mapped from the event's `thread_id`) is
listed on the thread `message-in` printed. A step sends once per visit, so a retried run does not list a reply twice,
and a test run sends nothing. The route underneath is
`GET /api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/messages-out`.

```ts
it('replies on the sender\'s thread', async () => {
  const sent = JSON.parse(cli('message-in', '--connection', 'sms', '--from', '+15550001', '--text', 'Where is my order?', '--json'));
  await expect
    .poll(
      () => JSON.parse(cli('message-out', '--connection', 'sms', '--json')).sends,
      { timeout: 120_000, interval: 3_000 },
    )
    .toContainEqual(expect.objectContaining({ thread_id: sent.thread_id }));
});
```

## Testing website chat

A `chat` connection in `sandbox.json` (`sandbox-json.md`, "Connections") is tested as a visitor uses it: the CLI calls
AgentFlow's public chat routes, `/api/v1/chat/<public key>/…`, with the connection's first origin as `Origin`, as a
website's `<agentflow-chat>` does. Nothing goes through the parent key, so the test covers the routes a real page
uses.

- **`agentflow-app sandbox message-in --connection <key> --text <text> [--thread-key <key>] [--verified-email <address>]`**
  writes `<text>` as the visitor. The first use of a thread key opens a chat session and keeps its `afv_` token under
  `chat_sessions` in `.agentflow/sandbox.json`; later uses write on the same thread while it is open. Without
  `--thread-key` the key is `default`, so a new key is a new visitor. A thread that has ended or expired is opened
  again under the same key, and the CLI says so on stderr. It prints `posted at position <n> on chat thread <key>`;
  `--json` prints `{"thread_key", "position", "session": "opened" | "reused"}`. The message starts the app's
  `message.received` workflows on the connection, as one a website's visitor sends does. Calls on different thread keys
  may run at once, as parallel test files do: each keeps its own thread's session.
- **`--verified-email bob@example.com`** signs a `site` identity token with the chat's identity secret, `sub` and
  `email` both the address, so the run's `workflow.sender.verified` is `{"method": "site", "email": "bob@example.com",
  …}`. It is sent when the thread opens, or on the next message of a thread that has none. It needs `site` in the
  chat's `verify_methods`, and a thread verified as one address refuses another (`CHAT_IDENTITY_ALREADY_SET`), so use a
  new thread key for a second visitor.
- **Refused on chat**, before anything is sent: `--from` (a visitor has no sender address), `--file` (a chat carries
  text only) and `--verified-phone` (a visitor proves an email, not a phone).
- **`agentflow-app sandbox message-out --connection <key> [--thread-key <key>]`** prints each thread's log as the
  visitor reads it, one line per row: the time, `thread <key>`, the author (`visitor`, `agent`, `person` or `system`)
  with the name a Message step's `authorDisplay` gave it, and the text on one line. `--json` prints
  `{"messages": [...]}`, each row with its `thread_key`, `position`, `author`, `author_display`, `text` and
  `created_at`. A thread whose chat has ended, so that its log can no longer be read, gets one line saying so in place
  of its log and is listed under `ended_threads`; the other threads still print.
- **`--follow`** prints the thread's stream as it arrives: every row of its log, `typing until <time>` and
  `typing stopped`, each `reply.started`, `reply.activity`, `reply.delta`, `reply.done` and `reply.abandoned` event
  of the run's streamed steps and, when the chat's `verify_methods` lists a method, a `verify.requested` after a
  tool refused an anonymous visitor, each as
  `<event>  <data>` (the authoring skill's `workflows.md`, "Agent steps that stream"), and `closed (<reason>)`,
  where it ends with exit 0. `--json` prints one `{"event", "data"}` object
  per line. When the stream drops, as it does while AgentFlow restarts, it opens it again after the last row it printed,
  so no row is lost or printed twice; `reply.*`, `typing` and `verify.requested` events it printed before the drop can print again. If the
  stream has not come back within 30 s it exits 1 and says so on stderr.
- The parent-key route `GET /api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/messages-out` lists a chat's
  replies across all its threads, as for a messaging loopback.

```ts
it('answers the visitor on the chat thread', async () => {
  cli('message-in', '--connection', 'site_chat', '--thread-key', 'ada', '--text', 'Where is my order?');
  await expect
    .poll(
      () => JSON.parse(cli('message-out', '--connection', 'site_chat', '--thread-key', 'ada', '--json')).messages,
      { timeout: 120_000, interval: 3_000 },
    )
    .toContainEqual(expect.objectContaining({ author: 'agent' }));
});
```

## Testing an app on `rfx/erp-core`

Give `sandbox.json` a `sandbox_erp` connection, erp-core's sealed file in `dependencies`, and erp-core's answers in
`install.decisions.parameters["rfx/erp-core"]` (`sandbox-json.md`, "Connections" and "Dependencies"). `deploy --sandbox`
then uploads erp-core and your package and installs both. The connection reads nothing by itself, so erp-core's
records come from the test:

- **`agentflow-app sandbox records-in --connection <key> --stream <stream> --file <records.json>`** records the file's
  records on the connection as an ERP read of `<stream>` would hand them over (one of `company`, `currency`, `uom`,
  `tax_code`, `vendor`, `item`, `purchase_order`, `goods_receipt`, `vendor_bill`). erp-core's sources map them into its
  records, and the triggers on those records start, as on a real connection. Inject what a record references before
  or with it (a purchase order's company, currency, vendor and items), or its reference waits for its target.
- **The file** is a list of canonical records (the shapes in the authoring skill's ERP reference), or
  `{ "stream": …, "records": [...] }`, in which case `--stream` may be left out. A record's key is taken from its
  `company_erp_id` (or `""`) and `erp_id`, and its stamp, the time the ERP changed it, from its `source_changed_at`; the
  two should match, as they do when a real ERP stamps a record, so give each record a `source_changed_at`. An entry may
  instead be `{ "key": [company, id], "stamp": …, "record": … }`, and a deletion is
  `{ "key": [company, id], "stamp": …, "deleted": true }`.
- **A version is the stamp and the record's content.** Sending the same record with the same stamp again records
  nothing, so a rerun is harmless: the command prints one line per request, `records 1-3: recorded 0, 3 already there`.
  To change a record, send it with a later stamp. A member the canonical object does not define is dropped without a
  word, so check a record that does not arrive for a misspelt member.
- **Large files** are sent in requests of at most 500 records and under 2 MiB each, in order.
- **`agentflow-app sandbox records-out --connection <key>`** lists the bills apps wrote to the connection,
  oldest first; `--json` prints `{"writes": [...]}`, each with `object_type` (`vendor_bill`), `external_ref`, `erp_id`
  (`SBX-<external_ref>`), `written_at` and `record`, the bill as the connector reads it back (the body the step sent,
  with its `status`, `draft` until the test sets another). A bill is kept once per `external_ref`: a second write of it
  changes nothing and answers the bill as it is, status included.
- **`agentflow-app sandbox record-status --connection <key> --external-ref <ref> --status <status>`** sets the status
  the bill written under `<ref>` reads back with: `draft`, `posted` or `cancelled`. A `get` of the bill then answers that
  status, the value erp-core's Odoo read answers for a posted or cancelled bill, and so does a later write of `<ref>`. It
  prints `<ref> reads back <status>`, and `--json` prints the bill as `records-out` lists it.
- **`agentflow-app sandbox record-remove --connection <key> --external-ref <ref>`** removes the bill, as deleting a
  draft in the ERP does: a `get` of `<ref>` then answers `null`, and the next write of `<ref>` makes a new draft.

Both refuse a `<ref>` the connection holds no bill under with `NOT_FOUND`, and `record-status` refuses any other status
with `MALFORMED_JSON`. Together they make the three branches of a check that reads a bill back:

1. Let the app write the bill, and wait until `records-out` lists its `external_ref`.
2. Set it `posted` or `cancelled` with `record-status`, or take it away with `record-remove`.
3. Start the check and follow its run. Fire a check that runs on a schedule with `sandbox fire` ("A scheduled
   workflow" below).

The routes underneath are `POST /api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/records`,
`GET …/records-out`, and `PATCH` and `DELETE …/records-out?external_ref=<ref>`, called with `AGENTFLOW_SANDBOX_KEY`.

```json
[
  { "erp_id": "C-1", "company_erp_id": "C-1", "source_changed_at": "2026-11-11T08:00:00Z", "name": "Thép Việt" }
]
```

```ts
import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

const cli = (...args: string[]) =>
  execFileSync('pnpm', ['exec', 'agentflow-app', 'sandbox', ...args], { encoding: 'utf8' });

it('bills a received purchase order line', async () => {
  for (const stream of ['company', 'currency', 'vendor', 'item', 'purchase_order']) {
    cli('records-in', '--connection', 'erp', '--stream', stream, '--file', `test/erp/${stream}.json`);
  }
  await expect
    .poll(() => JSON.parse(cli('records-out', '--connection', 'erp', '--json')).writes, { timeout: 120_000, interval: 3_000 })
    .toContainEqual(expect.objectContaining({ external_ref: 'L-1' }));
});

it('rejects a line whose bill was deleted in the ERP', async () => {
  cli('record-remove', '--connection', 'erp', '--external-ref', 'L-1');
  // Start the check that reads the bill back, then follow its run with waitForRun.
});
```

**Against a real Odoo**, give `sandbox.json` an `odoo` connection in place of the `sandbox_erp` one (`sandbox-json.md`,
"Connections"). erp-core's polls then read Odoo's own records, so the test makes them in Odoo, and an Integration
step's bill lands in Odoo as a real draft. `records-in`, `records-out`, `record-status` and `record-remove` work on a
`sandbox_erp` connection only: read and change the bills in Odoo instead. The drafts stay in Odoo after the sandbox is
gone, each naming its sandbox in its notes.

## How long a sandbox run takes

No time is promised: a run takes its steps and the waits between them, on the job queue a sandbox shares with every
other organization on the deployment, so the same run is quicker on an idle deployment than on a busy one. What is
fixed:

- **The install** that `deploy --sandbox` waits for is "usually a minute or two", and the CLI gives up at 300 s
  (`DEPLOY_STALLED`).
- **A Code step** starts a fresh code sandbox and is cut at the deployment's budget, 20 s unless the operator changed
  it. An Agent step waits for a model, and a Human step for your test.
- **The kit's waits**, `waitForRun` and `waitForTask`, give up after 120 s unless you pass `{ timeout }`; Vitest's own
  `expect.poll` after 1 s.

So wait with a deadline and plan **a minute for each wait**: the run to reach its Human step, then the record to show
what the run wrote. Never wait a fixed time. A sandbox itself lives 7 days (`sandbox create --ttl-days` sets 1 to 30).

Times and failures taken on a loaded machine reproduce for nobody. Check the load average in the command that
starts the deploy or the test run, and wait until it is under a threshold you set.

## When a run fails

`waitForRun` returns a failed run as it returns any settled one: it does not throw, and `run.status` is `'failed'`. The
run is what `GET /instances/{id}` answers. A long run's detail carries every step's input and output; to read only
its state and each step's outcome, ask for `GET /instances/{id}?view=compact` (`runtime.md` of the
`agentflow-app-authoring` skill, "Reading a long run without its content").

First check which version ran: `workflow_version_number` is the published version of the workflow the run used, and
it keeps it for its whole life. It counts the workflow's own published versions; it is not the package version. A run
started while a deployment waits for approval runs the version installed before (`after-deploy.md`, "Reading a
deployment's state"). Then read the failure in this order:

1. The failed step: the entry of `node_runs[]` with `status: 'failed'`. Its `error_code` is a stable catalogue code
   (`AGENT_CEILING_DENIED`, `CODE_RUNNER_FAILED`, `ENTITY_ATTACHMENT_INVALID`), and its `error_meaning` is a one-line
   explanation of the code. Both are platform text and never hold run data, so every reader sees them. The step's
   `error`, its failure text, is always `null` in a run of an installed app (item 4). Each entry of
   `for_each_children[]` has an `error_code` too: a For Each child, or the run a Call step started, whose
   `parent_node_id` is the Call step's id. A Call step whose callee failed carries that entry's `error_code`, and
   its run carries the code and the entry's `error_detail`, with the Call step as the detail's step;
   `SUBWORKFLOW_CANCELLED` is a callee that was cancelled (`workflows.md` of the `agentflow-app-authoring` skill,
   "Calling another workflow: `call`").
2. The run's `error_code` and `error_meaning`. When the failed step named a code, the run carries the same one,
   except an all-or-nothing run that rolled back for contention or time, which carries `ATOMIC_CONTENTION` or
   `ATOMIC_BUDGET_EXCEEDED`. `RUN_TICK_FAILED` means the run stopped after its retries on a step that named no more
   specific code, or on a fault in the engine itself; the failed step's code says which. A run that failed with no failed step has only its own code.
   The run's `error_detail`, where it has one, says why in names from your config and never a record's value: the
   step, the record's position in a list write (`item`), and a `reason` by `kind`
   (`initial_status_not_allowed`, `transition_not_allowed`, `reference_invalid`, `key_member_missing`,
   `field_not_found`, for a Code step `code_not_run`, `code_outcome_unknown` and `code_program_failed`, and for an
   Agent step `agent_output_ceiling_reached` with `AGENT_OUTPUT_TRUNCATED`, which name no entity). Every person who may see the run and read the definition of each entity it names sees it, in an
   installed app's run too, and so does each For Each child in `for_each_children[]`; the app itself reads it in the answer to a start it made and that
   start's replay, and never where it would name a field the app's ceiling hides. It names no status a record held.
   A failure AgentFlow cannot state in names, such as a Code step's raised exception, has none. A Code step's other
   failures say whose they were: `code_program_failed` (with `CODE_EXECUTION_FAILED`, `cause` `out_of_memory`,
   `output_limit` or `no_result`) is your program's; `code_not_run` and `code_outcome_unknown` (with
   `CODE_RUNNER_FAILED`) are the runner's, the first when no attempt started the program and the second when one
   may have (`workflows.md` of the `agentflow-app-authoring` skill, "When a Code step fails").
   `agent_output_ceiling_reached` means the Agent step's model stopped at the agent's `budget.maxTokens` before it
   gave a whole answer, or any answer: raise `maxTokens` (`agents-and-skills.md` of the authoring skill).
3. `STEP_FAILED` on a step means its kind does not name a more specific code yet, so the code cannot tell you more.
   The step's `error` and the run's `error_message` are both withheld in an installed app's run (item 4): run the
   same workflow outside an installed app, where a step's `error` is shown.
4. `withheld`, on the run and on each step. It names each field AgentFlow replaced with `null` while the field held a
   value, so a `null` it does not list is really empty. A run of an installed app, which is what a sandbox test
   follows, replaces fields under these rules:
   - A step's `error` is always `null`, for every reader, and `withheld` lists `error` when the step had text. A
     step's `input` and `output` are `null` only for a reader who may not see them, and `withheld` lists the ones
     it replaced.
   - The run's `error_message` is always `null` too, for every reader, an all-or-nothing run's "Nothing was saved …"
     included: AgentFlow keeps no record of what a failure's text was built from, so it cannot tell whether a reader
     may see it. `withheld` lists `error_message` when the run had text.
   - The run's `input_payload`, `output_payload` and `name` are replaced only for a reader who may not see them
     (`name` reads as an empty string). `withheld` lists the ones it replaced.

   A For Each child's `error_message` is always `null` in such a run and its entry has no `withheld`, so its
   `error_code` is what it tells.

A step that is blocked does not fail its run: the run is parked as `paused`, so `waitForRun` times out saying the run
is still `paused`. A step refused while it runs is failed in `node_runs[]` and names why. (A run paused
because its app is disabled or a version it pins is revoked has no failed step; its `app_pause` says why.)
`STEP_ACCESS_BLOCKED` means the run's identity was denied what the step needs (a grant, a role, a record outside its
scope, or a secured field): grant it, then resume the run through
`POST /instances/{id}/authorization/resume` with the run's current `updated_at` as `expected_updated_at` (it needs `instance.admin`, which a sandbox's owner holds: see "Resuming a parked run" below). `APP_RUN_STILL_BLOCKED` means the app is disabled or a
version it pins is revoked: repair the app, then resume the run.

A run parked on a field is stopped before the step starts. A step that names a field the run may not read or set
(one the manifest's ceiling leaves out, or a secured field the run's identity holds no profile for) is checked before it
starts. So it has no entry in `node_runs[]`, and nothing is failed. In an installed app's run, `GET /instances/{id}`
shows every reader `status: 'paused'` with `auth_blocked` `null`. It names the step and the fields in
`auth_blocked_detail`, keys read from the definitions and never a value:

```json
{ "step": "look_up", "reason": { "kind": "field_not_readable", "entity": "acme_hr__employee", "fields": ["salary"] } }
```

`entity` is the entity's installed key (`<prefix>__<key>` for one of the app's own), not the package's key, and `kind`
is `field_not_writable` for a field the step sets. The `instance.authorization_blocked` event in `timeline`
carries the step as `node_id` and the same detail as `blocked`. A reader who may not read the entity's definition is
told the step alone. No detail is recorded when the manifest's ceiling leaves the field out: the run names the step,
and `lint` names the field. The app's own token sees `paused` in `GET /instances` and is usually refused the run itself
(`APP_CEILING_DENIED`, as for any run that holds input), but the answer to the start it made carries
`auth_blocked_detail`. When a grouped trigger started the run, the run keeps its group's lane until it ends, so later
events for the same key wait behind it.

A run whose identity may do the step's operation on no record of the entity is parked too, and tells it the same way.
This is the usual cause when a workflow runs as `initiator` and the person who starts it holds no grant for what a step
does, such as an Entity Record step that creates a record no group of theirs may create:

```json
{ "step": "create_order", "reason": { "kind": "operation_not_permitted", "entity": "order", "operation": "create",
  "cause": "no_applicable_grant" } }
```

`operation` is `create`, `update`, `read`, `list`, `delete` or `assign`. `cause` is `no_applicable_grant` when no grant
the person holds admits the operation on the entity, or `coarse_permission_missing` when their role lacks the
permission (`entity.write` for a create or an update). For `no_applicable_grant`, grant the operation (in your
manifest's `grants`, or as the organization); for `coarse_permission_missing`, give the person a role that carries the
permission, since a grant narrows a role and never raises it. Then resume the run. In a sandbox nothing a test calls
changes a grant, a role or a group (`sandbox-json.md`, "The cast"): fix a grant or a field in the package, raise
`version` and run `deploy --sandbox --upgrade`, which keeps the sandbox and the parked run, then resume it. Roles and
groups come from `sandbox.json`, which only a new sandbox reads, so a test of that cause stops at the diagnosis and
cancels the run. Read the run as the owner: a person
with no grant on a restricted entity usually may not read its definition either, so they are told the step alone.
A record outside the grant's scope (`scope_mismatch`) or a unit the record may not be created in
(`destination_ineligible`) records no detail, since the record decided it. To find the cause in a sandbox:

1. As the owner, read the run, `GET /instances/{id}`. `auth_blocked_detail` names the step and the fields, or the
   operation. A person's
   row in `GET /instances`, which lists only runs nobody called, carries `auth_blocked_reason`.
2. With no `auth_blocked_detail`, run `pnpm exec agentflow-app lint`. `ceiling_uncovered` names the step and each
   field the manifest does not declare (`lint-problems.md`).
3. As the owner, read the app's needs attention, `GET /app-installations/{installation_id}/attention`, with the id
   from `readSandbox().installation.id`. The answer is the SDK's `AppAttentionDto` (below): `items` holds one entry
   per broken setup item or workflow, each with `item` its key, `open`, and `problems`, each a `code` and the members
   that code carries. The `ceiling:<package>/<workflow>` entry lists the run in `runs`, and `run_details` gives
   `{ run, detail }` with the same detail for each paused run that recorded one. Its `problems` name the step, the
   entity, the operation and the field (`run_ceiling_uncovered`) when the approved ceiling is the cause. A periodic
   refresh writes the entry, every 5 minutes by default, so it can lag the run. An AgentFlow without the route
   answers `404`.

```ts
import type { components } from '@reflexify/agentflow-sdk';
import { as, readSandbox } from '@reflexify/agentflow-sdk/testing';

type AttentionItem = components['schemas']['AppAttentionItemDto'];

const sandbox = readSandbox();
const { data: attention, error } = await as(sandbox.owner).GET('/app-installations/{installation_id}/attention', {
  params: { path: { installation_id: sandbox.installation!.id } },
});
expect(error?.type).toBeUndefined();
const ceiling = attention?.items.find((entry: AttentionItem) => entry.item.endsWith('/workflow:book'));
expect(ceiling?.run_details?.map((paused) => paused.run)).toContain(runId);
```

Then declare the field or grant the profile, deploy again, and cancel the parked run (`POST /instances/{id}/cancel`)
or resume it through `POST /instances/{id}/authorization/resume` with the run's current `updated_at` as `expected_updated_at`,
which checks the fields again and refuses `AUTHORIZATION_STILL_BLOCKED` while one is still denied.
`POST /instances/{id}/resume` releases a person's pause or the app's hold, never a block on access.

### Resuming a parked run

The owner's token reaches the resume through `as(sandbox.owner)`. It needs `instance.admin`, which a sandbox's owner
holds. The answer's `status` is `running`, or `paused` while a person's pause or the app's hold still holds the run.
Release that hold with `POST /instances/{id}/resume`, sending the run's `updated_at` read again, since this resume
changed it.
An installed app's token is refused (`APP_CEILING_DENIED`), and an AgentFlow without the operation answers `404`.

```ts
import { as, readSandbox } from '@reflexify/agentflow-sdk/testing';

const sandbox = readSandbox();
const owner = as(sandbox.owner);
const { data: run } = await owner.GET('/instances/{instance_id}', {
  params: { path: { instance_id: runId } },
});
const { data: resumed, error } = await owner.POST('/instances/{instance_id}/authorization/resume', {
  params: { path: { instance_id: runId } },
  body: { expected_updated_at: run!.updated_at },
});
// The code a refusal carries, such as AUTHORIZATION_STILL_BLOCKED, in place of an undefined status.
expect(error?.type).toBeUndefined();
expect(resumed?.status).toBe('running');
```

Outside a sandbox, an admin who holds `deployment.admin` can also read Access health, `GET /admin/access/health`.
Its `workflow_authorization_blocked` finding names each parked run's workflow, operation, entity and reason, but no
step and no field. A sandbox withholds `deployment.admin` (`sandbox-json.md`), so nobody can read Access health there.

The run page shows a person a failed run the same way: the code and its meaning, a note that details are hidden, and "Name hidden" where the name is withheld.

```ts
import type { components } from '@reflexify/agentflow-sdk';
import { as, waitForRun } from '@reflexify/agentflow-sdk/testing';

type NodeRun = components['schemas']['NodeRunDto'];

const run = await waitForRun(as('manager'), runId);
const step = ((run.node_runs ?? []) as NodeRun[]).find((nodeRun) => nodeRun.status === 'failed');
// With no failed step (a cancelled run, or a failure of the run itself), the run's own code is what there is.
const code = step?.error_code ?? run.error_code ?? 'no code';
const meaning = step?.error_meaning ?? run.error_meaning ?? 'no meaning';
// Names from your config, such as the statuses a record may start in; absent for a failure it cannot name.
const detail = run.error_detail ? JSON.stringify(run.error_detail) : 'no detail';
const texts = [step?.withheld?.includes('error') ? 'step text withheld' : step?.error, run.error_message].filter(Boolean);
expect(run.status, `${step?.label ?? 'run'} failed with ${code}: ${meaning}; ${detail} (${texts.join('; ') || 'no text'})`).toBe('completed');
```

When the code, its meaning and `error_detail` do not say enough and the text is withheld, add a diagnostic step
before the one that fails, deploy, and run again:

- A Code step whose `main(inputs)` returns its inputs shows what the failing step receives. Declare every input it
  reads: reading an undeclared one throws (`workflows.md`, "Code steps").
- A Set Variable step whose value is the failing step's template (an Agent step's prompt, say) shows it rendered; a
  bare file path renders there as the file, not its text.
- Shorten the prompt or drop inputs until the step passes; the last part removed is the cause.

A diagnostic step's output is run content too: a reader sees it only if they may read every record and field it was
built from, and `withheld` lists it otherwise. Read it as a sandbox person whose groups grant those entities, or run
the workflow outside an installed app.

## An all-or-nothing run that rolled back

A failed all-or-nothing run keeps no steps: `node_runs[]` is empty and its trace has none. `waitForRun` still
returns it `failed`, with `error_code` (the failed step's code, `ATOMIC_BUDGET_EXCEEDED` or `ATOMIC_CONTENTION`) and
`error_meaning`. The step it failed at is the `node_id` of the `instance.failed` event in the run's `timeline`; in an
installed app's run that event, `error_code`, `error_meaning` and `error_detail` are all the run tells. A run it was called by
waits, then fails at its Call step with the same code, and with the same detail naming the Call step. What each
part means, and where a called run is listed: `runtime.md` of the `agentflow-app-authoring` skill, "What a
rolled-back run keeps".

## A scheduled workflow

Fire the schedule from the test. **`agentflow-app sandbox fire --trigger <key>`** fires the trigger the package's
`triggers` export names `<key>` now, as its cron would: the run starts on a worker from that instant, as the
schedule's own run does, with the trigger's run-as principal, its `input_template`, and `workflow.requester` null.
The schedule's next occurrence stays where it was. It prints `fired trigger:<key> (fire <fire id>)`, and `--json`
prints `{ "trigger_id", "fire_id" }`. The trigger's id comes from `.agentflow/sandbox.json`, which `deploy --sandbox`
fills, so run that first.

- **The trigger must be armed.** `deploy --sandbox` arms every trigger; after `--no-arm`, or for a trigger that is
  off, the fire is refused with `TRIGGER_DISABLED`, since a schedule that is off never fires. A trigger that is not a
  schedule is refused with `TRIGGER_NOT_SCHEDULE`.
- **Each fire is one run.** Two fires a moment apart start two runs, and the cron still fires at its own time, so a
  test that counts runs counts its own fires.
- **Follow the run by what it does**, as for any run a trigger starts ("Following a run a trigger starts"): the fire
  gives no run id, because the run starts after the command returns.

The route underneath is `POST /api/v1/sandboxes/{sandbox_id}/triggers/{trigger_id}/fire`, called with
`AGENTFLOW_SANDBOX_KEY`; it answers `202` with `{ "fire_id" }`.

```ts
it('holds an invoice whose bill was cancelled in the ERP', async () => {
  cli('record-status', '--connection', 'erp', '--external-ref', 'L-1', '--status', 'cancelled');
  cli('fire', '--trigger', 'bill_check_daily');
  // Follow what the check does: a record it changes, or a task it opens.
});
```

A deployment without the route answers `404`. There, start the work by hand instead: put it in a workflow with no
trigger and the same `runAs` service principal parameter, make the scheduled workflow a Start, a `call` of it and an
End, and start the called workflow as the sandbox's owner. That run has the owner as its requester, where the
schedule's has none, and anyone who holds `workflow.start.any` can start the called workflow in every organization
the app is installed in, so validate its input inside it.

## The assistant and an offered skill

A sandbox test cannot check a skill the manifest offers to the assistant (`assistant.skills`): the test kit has no
helper for the assistant, and nothing checks the skill offline. Sign in as a person in the audience with
`sandbox open --as <handle>`, open the assistant and ask the skill's question. The skill is also listed on the
organization's default agent (Admin, then Agents).
