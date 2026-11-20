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
always, even after a failure). While you work, raise `version` after each change and run
`agentflow-app deploy --sandbox --upgrade`: it installs into the same sandbox, so its records, its people's sign-ins
and the organization settings you set there by hand (such as the business calendar) stay. It sends the app's parameters
again from the install answers recorded when the sandbox was made, replacing any changed on the setup page, so after changing `sandbox.json` deploy without `--upgrade`; it refuses `SANDBOX_GONE` once the sandbox
expired or was deleted, and `SANDBOX_ELSEWHERE` when `AGENTFLOW_URL` names another AgentFlow than the one it was made on. Each test starts from `idsByKey()` (the installed objects' ids by logical key,
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

`deploy --sandbox` without `--upgrade` deletes the sandbox the state file names and makes a new one, so such a deploy starts from a new
organization holding `sandbox.json`'s people, groups and connections, and then the app. The app's seeds arrive
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
created, and run `agentflow-app deploy --sandbox` again for a fresh sandbox.

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

How long that takes is "How long a sandbox run takes", below: wait on the run or the task with a deadline, never a fixed
delay, and run sandbox suites one at a time.

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
- A test that approves a task has two waits, the task and then the record, which is why the sample `testTimeout` is
  180 s: 60 s for each as the sample passes them (`{ timeout: 60_000 }`), and 60 s of room. Left at its default,
  `waitForTask` waits 120 s, and with a 60 s poll after it the sum is already 180 s with no room, so either pass
  `{ timeout: 60_000 }` or raise `testTimeout`. Keep `testTimeout` above the sum of the waits a test makes; the
  tutorial's example sets 300 s, which leaves more room and is as right. A test that times out is first a trigger that
  is off (look at the `armed` list in `deploy --sandbox`'s `--json` answer, or `.agentflow/sandbox.json`) or a worker
  that is not running.

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
[--verified-email <address>] [--file <path>]...` delivers a message to the sandbox's `loopback` connection `<key>` that
has a `channel` (`sandbox-json.md`, "Connections"), as a messaging provider would: it is recorded as
`message.received` on the connection's channel and starts the app's `message.received` workflows through the same
settle and dispatch as a message a webhook relay posts.

- **The thread.** Messages with one `--thread-key` share a channel thread while it is open, and each event carries its
  id as `thread_id`. Without `--thread-key`, the sender's value is the key, so one sender's messages share a thread. A
  blank key is refused.
- **The sender.** `--from` is required. A value with an `@` is an `email` identity, a `+` and up to 15 digits a
  `phone`, anything else a `handle`; `from_kind` and `from_value` repeat it. `--verified-email bob@example.com` puts
  `{"method": "channel", "email": "bob@example.com"}` on `from.verified`, as a relay that vouches for its sender does;
  without it `from.verified` is `null`. AgentFlow judges the address, and refuses one it cannot read as an email with
  `VALIDATION_ERROR` naming `verified_email`. Nothing marks a sender verified by phone (`{"method": "channel",
  "phone"}`), so a tool that matches `workflow.sender.verified.phone` cannot be tested in a sandbox: list it as
  unchecked.
- **The content.** `--text`, at least one `--file`, or both. Each `--file` is attached under its base name, with a
  content type read from its extension (a generic binary type when unknown), and their sizes add up to at most
  5 MiB. They are stored as files and listed in the event's `attachments` only when a trigger of the app will start on
  the message, as for `mail-in`.
- **The answer.** The command prints `recorded <event id> on thread <thread id>`; `--json` prints AgentFlow's answer,
  `{"event_id": "…", "thread_id": "…"}`. A connection that is not a loopback with a channel is `NOT_FOUND`, and a
  sandbox that is gone is `SANDBOX_NOT_LIVE`.

The route underneath is `POST /api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/messages`, called with
`AGENTFLOW_SANDBOX_KEY`, with the body `{"from", "thread_key"?, "text"?, "verified_email"?, "attachments"?}`
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
- **`agentflow-app sandbox records-out --connection <key>`** lists the draft bills apps wrote to the connection,
  oldest first; `--json` prints `{"writes": [...]}`, each with `object_type` (`vendor_bill`), `external_ref`, `erp_id`
  (`SBX-<external_ref>`), `written_at` and `record`, the bill as the connector reads it back (the body the step sent,
  with `status: "draft"`). A bill is kept once per `external_ref`: a second write of it changes nothing.

The routes underneath are `POST /api/v1/sandboxes/{sandbox_id}/connections/{connection_id}/records` and
`GET …/records-out`, called with `AGENTFLOW_SANDBOX_KEY`.

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
```

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

## When a run fails

`waitForRun` returns a failed run as it returns any settled one: it does not throw, and `run.status` is `'failed'`. The
run is what `GET /instances/{id}` answers.

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
   `field_not_found`, and for a Code step `code_not_run`, `code_outcome_unknown` and `code_program_failed`, which
   name no entity). Every person who may see the run and read the definition of each entity it names sees it, in an
   installed app's run too, and so does each For Each child in `for_each_children[]`; the app itself reads it in the answer to a start it made and that
   start's replay, and never where it would name a field the app's ceiling hides. It names no status a record held.
   A failure AgentFlow cannot state in names, such as a Code step's raised exception, has none. A Code step's other
   failures say whose they were: `code_program_failed` (with `CODE_EXECUTION_FAILED`, `cause` `out_of_memory`,
   `output_limit` or `no_result`) is your program's; `code_not_run` and `code_outcome_unknown` (with
   `CODE_RUNNER_FAILED`) are the runner's, the first when no attempt started the program and the second when one
   may have (`workflows.md` of the `agentflow-app-authoring` skill, "When a Code step fails").
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
`POST /admin/instances/{id}/authorization/resume` with the run's current `updated_at` as `expected_updated_at` (it needs `instance.admin`, which a sandbox's owner holds). `APP_RUN_STILL_BLOCKED` means the app is disabled or a
version it pins is revoked: repair the app, then resume the run.

A run parked on a field is stopped before the step starts. A step that names a field the run may not read or set
(one the manifest's ceiling leaves out, or a secured field the run's identity holds no profile for) is checked before it
starts. So it has no entry in `node_runs[]`, and nothing is failed. In an installed app's run, `GET /instances/{id}`
shows every reader `status: 'paused'` with `auth_blocked` `null`. It names the step and the fields in
`auth_blocked_detail`, keys read from the definitions and never a value:

```json
{ "step": "look_up", "reason": { "kind": "field_not_readable", "entity": "employee", "fields": ["salary"] } }
```

`kind` is `field_not_writable` for a field the step sets. The `instance.authorization_blocked` event in `timeline`
carries the step as `node_id` and the same detail as `blocked`. A reader who may not read the entity's definition is
told the step alone. No detail is recorded when the manifest's ceiling leaves the field out: the run names the step,
and `lint` names the field. The app's own token sees `paused` in `GET /instances` and is usually refused the run itself
(`APP_CEILING_DENIED`, as for any run that holds input), but the answer to the start it made carries
`auth_blocked_detail`. When a grouped trigger started the run, the run keeps its group's lane until it ends, so later
events for the same key wait behind it. To find the cause in a sandbox:

1. As the owner, read the run, `GET /instances/{id}`. `auth_blocked_detail` names the step and the fields. A person's
   row in `GET /instances`, which lists only runs nobody called, carries `auth_blocked_reason`.
2. With no `auth_blocked_detail`, run `pnpm exec agentflow-app lint`. `ceiling_uncovered` names the step and each
   field the manifest does not declare (`lint-problems.md`).
3. As the owner, read the app's needs attention, `GET /admin/app-installations/{installation_id}/attention`, with the
   id from `readSandbox().installation.id`. The answer is `{ installation_id, needs_attention, items }`, each item
   `{ item, package, label, problems, values, since, tasks, runs, acknowledged, open }`, with `item` the entry's key
   and each problem `{ code, … }`. The path is not in `@reflexify/agentflow-sdk`'s types, so give the answer that
   shape yourself. The `ceiling:<package>/<workflow>` entry lists the run in `runs`, and
   `run_details` gives `{ run, detail }` with the same detail for each paused run that recorded one. Its `problems`
   name the step, the entity, the operation and the field (`run_ceiling_uncovered`) when the approved ceiling is the
   cause. A periodic refresh writes the entry, every 5 minutes by default, so it can lag the run.

Then declare the field or grant the profile, deploy again, and cancel the parked run (`POST /instances/{id}/cancel`)
or resume it through `POST /admin/instances/{id}/authorization/resume` with the run's current `updated_at` as `expected_updated_at`,
which checks the fields again and refuses `AUTHORIZATION_STILL_BLOCKED` while one is still denied.
`POST /instances/{id}/resume` releases only a pause a person made, not this one. Outside a sandbox, an admin who holds
`deployment.admin` can also read Access health, `GET /admin/access/health`. Its `workflow_authorization_blocked`
finding names each parked run's workflow, operation, entity and reason, but no step and no field. A sandbox withholds
`deployment.admin` (`sandbox-json.md`), so nobody can read Access health there.

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

A test cannot fire a schedule, and while the app's triggers are armed it cannot start the scheduled workflow by hand
either: `deploy --sandbox` arms them, and a start of a workflow whose trigger is on is refused with 422
`WORKFLOW_STARTS_FROM_TRIGGER`. (`--no-arm` leaves the triggers off, and the scheduled workflow can then be started
by hand.) Build the workflow so its work can be started by hand:

1. Put the work in a workflow with no trigger, and give it the same `runAs` service principal parameter.
2. Make the scheduled workflow a Start, a `call` of that workflow passing what its schedule's `input_template`
   gives, and an End.
3. In the test, start the called workflow as the sandbox's owner with the input the schedule would pass, and follow
   the run with `waitForRun`. The owner holds the built-in `admin` role, whose `workflow.start.any` starts a workflow
   that grants nobody a start (`sandbox-json.md`).

The called workflow is not a test fixture. In every organization the app is installed in, anyone who holds
`workflow.start.any` can start it by hand, with any input they choose, and it runs as the service principal. Lint
does not report it, since it has no trigger and grants nobody a start. Validate the input inside the called
workflow, rather than trusting it to be what the schedule's `input_template` gives.

The scheduled workflow itself is still untested: its cron, its time zone and its input. The difference that remains
is the requester. A run the schedule starts, and a run it calls, has `workflow.requester` null; a run the owner
starts has the owner as its requester, so a path through `workflow.requester` reads differently. Keep the called
workflow off the requester, or test both values.

The requester also changes what a Call, a For Each or a workflow tool step needs. Each copies the requester into
the run it starts, and fails with `APP_CEILING_DENIED` when the manifest does not require the built-in `user`
entity's `name` and `email`, even when nothing in the started run reads them. A null requester is not copied, so it
is never refused. A run the owner starts can therefore fail at such a step where the scheduled run passes. Require
the two fields (`pitfalls.md` of the `agentflow-app-authoring` skill gives the line), or the test fails where the
schedule would not.

## The assistant and an offered skill

A sandbox test cannot check a skill the manifest offers to the assistant (`assistant.skills`): the test kit has no
helper for the assistant, and nothing checks the skill offline. Sign in as a person in the audience with
`sandbox open --as <handle>`, open the assistant and ask the skill's question. The skill is also listed on the
organization's default agent (Admin, then Agents).
