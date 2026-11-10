# The steps a workflow may use

A workflow is a graph of steps: `node(id, name, nodeType, params, settings)` in
`@reflexify/agentflow-app-builder/workflow`, with a helper for the common ones (`workflows.md`, "The helpers").
This page says, for every step kind, whether a package can carry it, how to write it, and what later steps read
from it. A step's output is read as `nodes.<id>.output.<member>` in a `ref(...)` or a `{{ … }}` template.

The builder checks a graph's shape (`workflows.md`, "What `merge` checks") and passes every step's own parameters
through unchecked, except that `signature()` and `signing()` check their own options (`signing.md`), `call()` refuses a `subjectSource` that is not a string, `create()` and `upsert()` refuse a `destinationUnit` that names a unit by id, `fork()`, `webhook()`, `extractText()` and `integration()` check theirs (below), and a `notify` step's kind and source lists are checked against the manifest (`notifications.md`). AgentFlow checks
them all at `lint` and at install. So write a step the way this reference shows it, and run `lint` before you
believe it.

## Steps with a helper or a shipped example

| Step (`node_type`) | Write it with | Reads as | Example |
|---|---|---|---|
| `start` | `start({ subject?, params? })` | `input.<name>` (the run's input), `subject.record_id`, `subject.record.<field>` | the case desk's "Open a case" |
| `end` | `end(id, name, outcome?, outputs?)`; `outputs` is `{ name: ref(...) \| lit("...") }`: a `lit` here is a string (`lit("true")`, never `lit(true)`, which the build refuses and an older SDK let through to an install refused as `APP_CONTRACT_UNDERIVABLE`), and a `ref` may carry a `label` | what a Call step or a trigger's caller reads | A For Each step, below |
| `decision` | `decision(id, name, [when(edge, condition), otherwise(edge)])` | picks the edge | `workflows.md`, "Decisions" |
| `human` | `node(id, name, "human", { assignment, actions })`; add `signing: signing({ … })` to make the holder sign a PDF, `visibleWhen` on an action to offer it only when a condition holds, `sla` and `escalation` for a deadline, and `page: { path, mode: "redirect" }` to work the task in the app's own screen | the person picks an action; each action names an edge; a later step reads `nodes.<id>.output.action`, the action's id (`__sla_timeout` after a timeout branch), and nothing names who picked it | `workflows.md`, "Human steps" and "A page for the step"; with `signing`, `signing.md` |
| `signature` | `signature(id, name, { documents, signers, method?, routing?, onDecline?, certVisible?, task? })`; each signer is one named person | `nodes.<id>.output.status` (`signingStatus(id)`), `.generated_files` (`signedFiles(id)`, the signed PDFs) and `.signed_documents` | `signing.md`, and `examples/signed-decision` |
| `entity_record`, `operation: "get"` | `getById(id, name, entity, idPath)` | `nodes.<id>.output.record` (`.id`, and each field by key) | `workflows.md`, "The helpers" |
| `entity_record`, `"search"` | `search(id, name, entity, [flt(field, op, binding)], { sort?, dir?, limit?, fields? })`; the filter value is a binding: `flt("status", "eq", lit("pending"))`; `fields: ["title"]` returns only those fields with each record's `id` and `metadata` | `nodes.<id>.output.records`, `.returnedCount`; each record holds its fields beside `id`, so `records[0].<field>` is the first one's (`null` when it found none) | A For Each step, below |
| `entity_record`, `"create"` | `create(id, name, entity, [bind(field, binding)], { destinationUnit? })`; `destinationUnit` is for an entity filed in a unit (below) | `nodes.<id>.output.record.id` | the case desk's "Open a case" |
| `entity_record`, `"update"` | `update(id, name, entity, idPath, [bind(field, binding)], { expect?, check? })`; `expect: { fields: { status: "pending" } }` makes the write skip when the stored values differ, and an expected value that renders empty (including a value read earlier that was empty) means the field is empty; a number field compares by value (`"3.0"` holds against `3`), a yes/no field takes only `true` or `false`, and a value that renders as neither fails the step (`VALIDATION_ERROR`) instead of skipping; `check` is the conversation check (`workflows.md`, "Saving from an agent's answer") | `.record`, and `.skipped` (true when `expect` did not hold) | A For Each step, below |
| `entity_record`, `"update_many"` | `updateMany(id, name, entity, [flt(...)], [bind(...)])` | | `workflows.md`, "The helpers" |
| `entity_record`, `"upsert"` | `upsert(id, name, entity, matchKey, [bind(...)], { destinationUnit? })`: `matchKey` is the `id` of one of the entity's `natural_key` sets (`entities.md`); it finds the record that matches the bound fields, or creates it | `.record.id` | `workflows.md`, "The helpers" |
| `set_variable` | `setvar(id, name, [[variable, binding]])`, the variable's bare name (`"first_status"`, never `"vars.first_status"`); `readParameters(...names)` reads parameters | `vars.<variable>` / `{{ vars.<variable> }}` | `workflows.md`, "Variables: `setvar`" and "Parameters inside text" |
| `call_workflow` | `call(id, name, "${workflow:key}", subjectSource?, [[input, binding]], settings?)`; `subjectSource` is a path, as a string, to the record the callee's run is about (`"subject.record_id"`); the callee comes earlier in `ORDER` | the callee's End outputs, as `nodes.<id>.output.<name>` | `workflows.md`, "Calling another workflow" |
| `code` | `code(id, name, "code/file.js", [[input, binding]], outputSchema)`; the file defines `main(inputs)` | `nodes.<id>.output.<member>` of `outputSchema` | `workflows.md`, "Code steps" |
| `email` | `node(id, name, "email", { email: { connection, to, cc?, bcc?, replyTo?, subject, body, headers?, attachments?, delivery?, autoSubmitted? } })`, `connection` as in `workflows.md`, "Email steps"; `to`, `subject`, `body`, `replyTo` and each header value are templates; `to` may list addresses separated by `,` or `;`, each sent a message of its own unless `delivery: "together"` (which `cc` and `bcc` need); `body` is plain text, sent as both parts of the message; `headers` takes `In-Reply-To`, `References` and `X-` names; `autoSubmitted` is `auto-generated` (the default), `auto-replied` or `none` | `nodes.<id>.output.messages[]`, each `{ outbound_id, to, cc, message_id }` (`message_id` is `null` when the provider chooses it, as `.message_id_source: "provider"` says), `.delivered_count` | `workflows.md`, "A worked example: mail in, an answer out, and replies on the same thread" |
| `agent` | `node(id, name, "agent", { agentRef: { agentId: "${agent:key}" }, promptTemplate, outputSchema, conversation?, memory? })` | `nodes.<id>.output.<member>` of `outputSchema` | `agents-and-skills.md`; `workflows.md`, "Agent steps that recall memory" |
| `notify` | `notify(id, name, kind, [recipient.field(path) \| recipient.user(paramKey) \| recipient.group(paramKey) \| recipient.initiator()], { except? })`; `kind` is a key of the manifest's `notifications` | `nodes.<id>.output.sent`, `.excepted`, `.actor`, `.cannot_read`, `.muted`, `.suppressed`: counts only, never who | `notifications.md` |
| `fork`, `join` | `fork(id, name, [edgeIds])`, one edge per arm, and `join(id, name)` | every arm runs; the Join goes on once all have reached it | `workflows.md`, "Parallel arms: Fork and Join" |
| `webhook` | `webhook(id, name, { url, method?, headers?, body?, auth?, retries? }, settings?)`: `url` and header values are templates; `body` is a template string sent as text, or `{ name: ref(...) \| tpl(...) \| lit(...) }` sent as JSON; `auth` is `{ kind: "bearer", secret }`, `{ kind: "api_key_header", secret, header }` or `{ kind: "basic", secret, username }`, `secret` the key of a `secret_ref` parameter | `nodes.<id>.output.success`, `.status` (the HTTP status), `.response` (the JSON answer; null when it is not JSON or passes 1 MiB), `.attempts` | `examples/document-check` |
| `extract_text` | `extractText(id, name, source, { mode?, format?, onOversize? })`: `source` is the path of a file, such as `subject.record.<file field>` or `input.item`; `mode` is `single` (the default) or `multi`; `format` `markdown` (the default) or `text`; `onOversize` `fail` (the default) or `truncate`. Over a field of several files, `single` reads the first in the field's order (`filename` says which) and `multi` reads each, in that order; over no file `single` fails the step and `multi` gives `count: 0`. A record has no "main" file but its first: give the document a field of its own (`"format_options": { "max_files": 1 }`), or use `work.document` (`work.md`) | `single`: `nodes.<id>.output.text`, `.pageCount`, `.filename`, `.truncated`; `multi`: `.items[]` of those and `.count` | `examples/document-check` |
| `integration` | `integration(id, name, { connection, operation, objectType, identityField?, mappings?, delivery?, captureTo?, associations?, safeFieldPaths? })`: `connection` is the key of a `connection_ref` parameter with a `category`; `operation` is `get`, `search` or `upsert`; a `get` or `upsert` names `identityField`, and an `upsert` maps a value to it; `captureTo` is a path under `vars.` or `input.`; a mapping is `[field, binding]`, and on a `search` `[field, binding, operator]` (`eq`, `neq`, `contains`, `starts_with`, `gt`, `lt`, `known`, `unknown`) | the provider's record, at `nodes.<id>.output` and in `captureTo`; an inline write's outcome (below) | below |
| `group_files` | `node(id, name, "group_files", { source, depth })`: `source` is the start form's file field as `input.<field>`, `depth` the levels below the picked folder that make one folder (1 by default) | `nodes.<id>.output.groups`: one list of file ids per folder, for a For Each | `examples/court-batches`, and "Looping over files", below |
| `for_each` | `node(id, name, "for_each", { listSource, itemAlias, mode, continueOnItemFailure, failOnItemFailure, body })`: `body` is a graph of its own (its own `start`, edges and ends) run once per item; `mode` is `parallel` or `sequential` | `nodes.<id>.output.items` (one entry per item, with its `status` and any `error`) | A For Each step, below |

A reference field reads as the id of the record it points at: `subject.record.item` is the item's id, so pass it
as an idPath (`update(…, ITEM, "subject.record.item", …)`). A longer path follows the reference into that
record: `subject.record.item.name` is the item's name, and `subject.record.item.id` is the id again, at the
cost of reading the item as the run's principal. Prefer the bare form. The same holds for
`nodes.<id>.output.record.<reference>`.

### The unit a created record is filed in

On an entity that says `requires_unit_classification: true` (`entities.md`, "Records filed in a unit"), every record
sits in a unit, and the `unit` field is the platform's: a step never binds it. A `create` or `upsert` says where the
new record goes with a last argument, `{ destinationUnit }`, and writes nothing when it is left out:

```js
create("file", "File the case", "${entity:case}", [bind("title", ref("input.title"))])                   // the creator's unit
create("copy", "File the copy", "${entity:case}", [...], { destinationUnit: { from: "trigger" } })       // the trigger's record's unit
create("route", "File in a court", "${entity:case}", [...], { destinationUnit: { from: "unit", unit: "nodes.batch.output.record.unit" } })
create("fixed", "File in the registry", "${entity:case}", [...], { destinationUnit: { from: "unit", unit: "${param:registry}" } })
```

| `from` | The unit is | Written as | Fits |
|---|---|---|---|
| `"creator"` (the default) | the active primary unit of whoever the run acts as | nothing | a workflow a person starts, which runs as them |
| `"trigger"` | the unit of the record the run is about (`subject.record`; in a For Each body, the item when it is a record, else the looping run's record) | `{ mode: "inherit_trigger" }` | a workflow a trigger starts on a record, whose child record follows its parent, and a loop that files what it creates with the run's record |
| `"unit"` with a context path | the unit that path holds at run time, such as a unit field of an earlier step's record | `{ mode: "unit", unitId: ref(path) }` | a child record filed with the record the run read, and an import that names each record's unit |
| `"unit"` with `${param:key}` | one unit the admin picks when the app is installed, from a `unit_ref` parameter (`manifest.md`); the build cannot see the parameter's type, so `lint` checks that the `${param:…}` is a `unit_ref` | `{ mode: "unit", unitId: lit("${param:key}") }` | a workflow that runs as a service principal with no placement and files everything in one unit |

- **A service principal has no unit of its own** until an admin places it, so a workflow it runs files nothing with
  `"creator"`: the create is refused. An unattended import names the unit: a parameter when every record goes to one, a
  context path when each record carries its own.
- **A package never names an organization's unit.** A unit id written as the `unit` is refused at build
  (`a package never names an organization's unit: bind a context path or a unit_ref parameter`), as is any other
  `${…}` reference. A context path is not checked against the run: AgentFlow reads it when the step runs, and a run
  whose path holds no unit it may file in parks with `destination_ineligible`.
- **One destination per step.** A step reads its unit once, before it writes, so a For Each body's create files every
  element in the same unit, and a path that names the loop's item (`item.unit`) resolves to nothing.
- **Inside a For Each, `"trigger"` is the nearest record the loop is about.** A loop's child run carries no
  `subject` (`parent.subject.record_id` is readable, `subject.record` is not), so `{ from: "trigger" }` on the body's
  create looks outward. In a loop over records it is the item: the body files with the record it is handling, and so
  does a loop nested inside that body. In a loop over anything else (files, folders, values) it is the record of the
  run that looped, through nested loops. It stops at a Call step: a workflow another workflow called is about what
  the call's `subjectSource` named, and never about its caller's record. A run about nothing files in the creator's
  unit, the primary unit of whoever the run acts as. To file somewhere else from a body, read the record before the
  loop and name its unit: `{ destinationUnit: { from: "unit", unit: "parent.nodes.<id>.output.record.unit" } }`.
- **On an entity that is not filed in a unit the option is ignored**, so leave it out there.
- A step whose `body` binds `unit` is not a way to choose the unit: the build refuses it on an entity filed in a unit
  (`unit` is set by the platform from the creator's unit or the step's destinationUnit; a package never writes it), as
  `lint` (`unit_written`) and AgentFlow do.

`merge` checks a For Each body as a graph of its own. A graph that must be all-or-nothing takes `"atomic"` as `graph`'s last argument; an atomic run
refuses Human, Signature, Agent and Extract text steps.

### A For Each step

A search for idle items, a body that closes each one unless its status moved since the search, and an End
whose output carries a label. Inside the body the item is `input.<itemAlias>`:

```js
search("idle", "Idle items", ITEM, [flt("status", "eq", lit("pending"))], { limit: 500 }),
node("each", "Close each", "for_each", {
  listSource: "nodes.idle.output.records", itemAlias: "item", mode: "sequential",
  continueOnItemFailure: true, failOnItemFailure: false,
  body: { schemaVersion: "1.0", start: "bs", end: ["be"],
    nodes: [
      node("bs", "Item", "start", {}),
      update("close", "Close it", ITEM, "input.item.id", [bind("status", lit("closed"))],
        { expect: { fields: { status: "pending" } } }),
      node("be", "Done", "end", {}),
    ],
    edges: edges(["be0", "bs", "close"], ["be1", "close", "be"]) },
}),
end("done", "Done", "Done", { checked: { ...ref("nodes.idle.output.returnedCount"), label: "Items checked" } }),
```

#### Looping over files

Each item is the file's id. In the child's Agent prompt, `{{ input.<itemAlias> }}` is the file's text and
`content(input.<itemAlias>)` works only when the list source is typed as files:

- `subject.record.<file field>`, the run's own record;
- `nodes.<id>.output.record.<file field>` of a Get Record, Create or Update step;
- a Group Files step's `output.groups`, a start-form file field (`input.<field>`), and a Human step's form file field
  (`nodes.<id>.output.<field>`);
- a variable declared with `format: attachment`, and Agent or Code output whose `outputSchema` says `format: attachment`.

A Document or Image step's `generated_files` is not typed. Over it, the child's `{{ input.<itemAlias> }}` is the
bare id, `content(input.<itemAlias>)` in an Agent prompt is empty, and publish says nothing. (An AgentFlow build from
before 2026-10-30 does not type `subject.record.<file field>` either: there, read the subject's files through a
`getById(…, "subject.record_id")` step and loop over its `output.record.<file field>`.)

A For Each over `subject.record.<file field>` (or a record's `output.record.<file field>`) that writes each file to a
child record binds it with `bind("docs", ref("input.<itemAlias>"), { copy: true })`: the file belongs to the parent
record, and without `copy` the write fails `ENTITY_ATTACHMENT_INVALID`. An update that copies the source again on
every run gives the child a new copy, with a new file id, each time; to keep one, copy once and bind later runs to the
child's own copy.

Inside a child whose item is untyped, `content(input.<itemAlias>)` in a Set Variable value or a Code input `tpl(...)`
gives the text, without the file's wrapper; read it as `{{ vars.<name> }}`. A file with no text (an image) fails the
step with `FILE_CONTENT_FAILED`.

A folder of folders, such as a clerk's batch with one subfolder per prisoner, is a Group files step in front of the loop.
`node("files", "Group the files", "group_files", { source: "input.files", depth: 1 })` folds the start form's file field
(`input.files`) into one list of files per folder `depth` levels below the picked folder, and the For Each reads it as
`nodes.files.output.groups`: one item per subfolder, each item the list of that folder's file ids.

```js
const BATCH = "${entity:batch}";
const DOSSIER = "${entity:dossier}";

start({ subject: BATCH, params: true }),
node("files", "Group the files", "group_files", { source: "input.files", depth: 1 }),
node("each", "One dossier per folder", "for_each", {
  listSource: "nodes.files.output.groups", itemAlias: "item", mode: "parallel",
  body: { schemaVersion: "1.0", start: "bs", end: ["be"],
    nodes: [
      node("bs", "Folder", "start", {}),
      create("dossier", "Open the dossier", DOSSIER, [
        bind("batch", ref("parent.subject.record_id")),
        bind("files", ref("input.item")),
      ], { destinationUnit: { from: "trigger" } }),   // the batch's unit, whoever started the run
      node("be", "Done", "end", {}),
    ],
    edges: edges(["be0", "bs", "dossier"], ["be1", "dossier", "be"]) },
}),
```

- **The manifest must require the built-in `user` entity with `name` and `email`, or the loop is refused.** A loop's
  child is told who started the run, and the app's ceiling withholds that person unless both fields are within it. Put
  `{ "key": "user", "access": "read", "fields": { "name": "text", "email": "text" } }` in `requires.entities`. Without it
  a run a person started through the app fails at the For Each step with `APP_CEILING_DENIED` and no child is started.
  A Call Workflow step fails the same way, and so does an Agent step when its agent calls a workflow tool
  (`pitfalls.md`).
- **The same workflow serves a watched folder and a folder from the person's computer.** The launch freezes the folders
  either way; the browser only gets the files into AgentFlow (`agentflow-ui-module`, `records-api.md`, "Records from a
  folder"). The workflow never sees a folder's name or a file's path, only the groups.
- **Depth is the workflow's, the folder's path is the source's.** Depth 1 is the picked folder's own subfolders; a file
  directly in the picked folder belongs to no folder, so a run at folder grain leaves it out (`NOT_IN_A_FOLDER`), and the
  preview says so before the run starts. `maxItems` on the field and the entity's File field `max_files` bound a folder's
  files (a prisoner's dossier may hold up to 500, so raise `max_files` to fit).
- **The `bind("files", ref("input.item"))` above needs no `copy`.** `copy` is for a file another record holds. The group's
  files are the run's own, so the step gives the new record its own copy of them as it writes.
- **A loop of a few thousand folders needs the deployment's `FOREACH_FAN_OUT_MAX` raised** from its default of 1,000. That
  is the operator's setting, not the package's: the admin message asks the admin to have it raised (`agentflow-app-release`,
  `admin-message.md`, part 3), and until it is, a launch over it is refused naming the setting.
- **A plain file field with no Group files step or loop reading it takes no folder**, so a module cannot offer one there.
- `examples/court-batches` is a package that does this: its `add_dossiers` workflow creates a dossier per subfolder, filed
  in the batch's court, and the batch's `add_dossiers` entity action launches it.

#### What a child reads from its parent

- `parent.vars.<name>` is the parent's variable as it was when the child started; a later write is not seen.
- `parent.subject.record_id`, `parent.subject.entity_id` and `parent.subject.label` work in a top-level For Each;
  in a For Each nested in another they are refused too. `parent.subject.label` holds a value only when the
  parent's subject has a label: a run launched from a start form or through the API is given none, and the
  child then reads it as empty.
- `parent.subject.record.*` and `parent.subject.selection` are refused at publish: `reference.template_broken` in a
  template, `reference.unknown` in a binding or a `listSource`. In the child, read the record with
  `getById(…, "parent.subject.record_id")`, or have a parent step or variable carry what the child needs
  (`parent.nodes.<id>.output…`, `parent.vars.<name>`).

#### Children that create records under one record

Children run in `parallel` may each create a record that references the same record. On an AgentFlow build from
before 2026-10-30 such children failed intermittently and passed on a retry, so run that For Each `sequential` there.

## Steps that need something outside the package

A package can carry these, but they run only if the organization supplies what they name. Each shows in setup
as a required item that is *Invalid* until the deployment or the admin provides it.

| Step | Needs | `lint` |
|---|---|---|
| `email` | an email connection (`connection_ref` parameter, category `email`) and an `egress` entry naming it by connection, `{ "connection": "${param:…}" }`; the step does not say which provider | `email_egress_not_by_connection` (a warning) |
| `agent` | an AI provider on the deployment, and the agent's model parameter | `agent_parameter_optional` |
| `code` | a code runner for its language on the deployment | |
| `webhook` | a URL with a fixed host in `egress`, and a `secret_ref` parameter when it sends a secret | `egress_undeclared`, `destination_unknown` |
| `integration` | a connected account (`connection_ref`) and its host in `egress` | none: setup checks the host (`host_outside_egress`) |
| `signature` | the e-sign service on the deployment | |
| `document`, `extract_text` | document rendering and parsing on the deployment | |

A webhook that sends a secret declares its URL's host in `egress`, and the host must be written in the URL itself,
not in a template: `lint` cannot know where `https://{{ vars.host }}/…` sends the secret (`destination_unknown`).
AgentFlow refuses a private or internal address, does not follow a redirect and reads at most 1 MiB of the
answer. A non-2xx answer, or none, fails the step. With the error strategy `continue` (`workflows.md`, "When a
step fails") the run goes on, and a webhook that reached the send, unlike other steps, keeps its own output rather than a stand-in:
`success` is false and `status` is the HTTP status, or null when no answer came, so a Decision can tell a 404 from
a service that did not answer.

**A service may answer 200 and say in the body that it found nothing or failed**, such as `{ "error": "not found" }`.
`success` is then true, so branching on `status` alone sends that answer down the good path. Branch on the body's
shape too: test a member only a good answer carries, and never carries as 0, false or empty
(`{ "!!": [{ var: "nodes.<step>.output.response.<member>" }] }`), give each answer you know its own branch, and
send `otherwise` to the outcome for an answer you did not expect, such as "not checked", never to the outcome for a
good one: an `otherwise` that means "found nothing" records an unexpected body as that. `response` is the answer as
JSON, and null when the body is not JSON or runs over 1 MiB.

To put a file's text in a
template, `{{ content(<file>) }}` needs no step (`workflows.md`, "A file's text"); use `extractText` for the page
count, for a cap on long text, or for one read that several steps use.

There is no shipped example of an `image`, `entity_relationship` or `auto_number` step, and the
builder does not check their parameters. To get a
step's exact parameters, build it in AgentFlow's workflow designer, pack the app as a draft (**Admin → Apps → Pack**)
and read the step in the converted module (`agentflow-from-draft`); or ask your org admin or the AgentFlow team.
Write such a step with `node(id, name, "<kind>", params)` and run `lint`.

### An Integration step's write: queued or inline

An Integration `upsert` takes a `delivery` member: `"queued"` (the default; leave it out) or `"inline"`.

- **Queued** commits the write to an outbox and the run moves on. A refusal later dead-letters the write and **the
  run never hears of it**, so the step has nothing to branch on.
- **Inline** writes inside the step and waits for the answer. Nothing is queued. A retry after a timeout updates the
  record the first attempt made, because an `upsert` always names an `identityField`. `delivery: "inline"` on a `get`
  or `search` is refused at publish (`integration.delivery_invalid`).

An inline write's output, at `nodes.<id>.output` and also in `captureTo` when the step sets it, is one of:

- `{ "outcome": "written", "provider", "objectType", "externalId", "summary" }` (`externalId` is a string or null);
- `{ "outcome": "rejected", "provider", "objectType", "message" }`, the provider's definitive refusal. It is an
  outcome, not a failure: the run goes on and **branches on it with a Decision**.
- In a test run (a simulation) the write is captured by default and nothing reaches the provider: the output is the
  capture receipt with `"outcome": "captured"`. A sandbox is an ordinary organization with real connections, so **a
  sandbox's runs write for real** and get `written` or `rejected` like any other run.

**Match `written` and `rejected` each with a `when`, and send `otherwise` to a "not confirmed" path.** A Decision
takes its `otherwise` edge whenever no `when` matches, and two outputs match neither: a test run's `captured`, and,
during a rollout, a run on an older worker, which queues the write and outputs no `outcome` at all. With `otherwise`
on the written path, both would go on as if the write had landed.

Anything else fails the step: a transport error after 3 attempts is `INTEGRATION_PERMANENT_FAILURE` and a rate limit
is `PROVIDER_RATE_LIMITED`. The step writes on the connection the run started with: no connection then is
`NOT_CONNECTED`, and one since removed with nothing in its place, or now on a different account, is
`ACCOUNT_CHANGED`. A reconnect of the same account keeps the run going. A person without `instance.admin` reading the
run sees `outcome`, `provider`, `objectType`, `externalId` and `message`, and `summary` only when the step lists it in
`safeFieldPaths`.

```js
integration("post_bill", "Post the bill", {
  connection: "erp",
  operation: "upsert",
  delivery: "inline",
  objectType: "vendor_bill",
  identityField: "external_ref",
  mappings: [["external_ref", lit("BILL-1")]],
}),
decision("posted", "Did the ERP take it?", [
  when("e_posted", { "==": [{ var: "nodes.post_bill.output.outcome" }, "written"] }),
  when("e_refused", { "==": [{ var: "nodes.post_bill.output.outcome" }, "rejected"] }),
  otherwise("e_unconfirmed"),
]),
```

A `vendor_bill` write sets a custom ERP key on the draft bill as `{ "type": "string", "value": "AA/26E" }` (`type` is
`string`, `number`, `boolean` or `date`; a number's `value` is a decimal string, and an empty value is `null`) under
`custom` for the header or under `lines[n].custom` for a line, and only for a key the connection maps as writable at
that level. A bare scalar, a key the connection does not map and a read-only one are refused.

### A vendor bill

A write to `objectType: "vendor_bill"` is one `upsert` keyed on `identityField: "external_ref"`, and its `mappings` are the
members of the bill, flat (`lines` is one mapping that holds the whole list). `external_ref` is yours: the write is
idempotent on it, so a retry returns the bill the first attempt made. The ERP records themselves, `erp_id` of a vendor
included, are in `apps/erp-core/README.md` in the SDK.

| Member of the bill | |
|---|---|
| `external_ref`, `kind` (`invoice` or `credit`), `vendor_erp_id`, `invoice_date` (`YYYY-MM-DD`), `currency` (the ERP's code), `lines` | required |
| `vendor_invoice_number`, `due_date`, `company_erp_id`, `payment_term_erp_id`, `prices_include_tax`, `reverses` (the bill a credit reverses: `{ object, erp_id }`), `po_refs`, `receipt_refs`, `custom` | optional |

A line is `{ kind, description, qty, unit_price }`, with `kind` one of `item`, `service`, `account`, `charge` or `note`,
and optionally `discount_percent`, `uom`, `item_erp_id`, `account_erp_id`, `po_line` (`{ object: "purchase_order", erp_id,
line_erp_id }`), `taxes` (each `{ category }` with a `tax_code_erp_id` or a `rate`, and optionally a `code`) and `custom`. Amounts,
quantities and rates are decimal **strings** (`"400"`, `"21500.50"`). A note line sets a `description` and, as `qty` and
`unit_price` are required, `"0"` for both. **State each line's tax when the line has no `po_line`**: the Odoo connector gives
a line with an order line that line's taxes when `taxes` is empty, and a line without one no tax; an explicit tax is
found by `tax_code_erp_id`, else by `rate`, and the connector refuses a tax that names neither (a `code` alone is not
enough).

```js
integration("bill", "Raise a draft bill", {
  connection: "erp", operation: "upsert", objectType: "vendor_bill", identityField: "external_ref",
  delivery: "inline", // the answer is `written` or `rejected`: branch on it as the example above does
  mappings: [
    ["external_ref", tpl("bill-{{ subject.record_id }}")], ["kind", lit("invoice")],
    ["vendor_erp_id", ref("vars.vendor_erp_id")], ["invoice_date", ref("subject.record.document_date")],
    ["currency", ref("subject.record.currency")], ["lines", ref("vars.bill_lines")], // a list a Code step made
  ],
}),
```

- **The bill always comes out as a draft.** The write has no member for a status. The connector (Odoo, today) creates
  a draft and never posts, confirms or deletes a bill. The outcome's `summary` is `{ erp_id, company_erp_id,
  external_ref, status }`, with `status` `draft` for a bill just made. It looks the `external_ref` up before it writes:
  a bill it finds is returned as it is now (`posted`, if an accountant has posted it) and nothing is written. When that
  lookup missed, the repeated write updates the draft and the lines it names, and leaves lines it no longer names.
- **A member the ERP computes is not writable.** `amount_untaxed`, `amount_tax`, `amount_total`, `amount_due`,
  `number`, `status` and `payment_status` belong to the ERP, and so does a tax's amount: the write is refused at that path
  (`rejected` for an inline write), not dropped. `build` and `lint` do not look at the body, so a body that does not fit is refused when
  the step runs, naming the path (`lines[0].qty`) and never the value. A connector can refuse more of the shape: the
  Odoo connector does not hold `exchange_rate`, `fiscal_document`, `dimensions` or a line's `receipt_line`.

## A document step and its template

A `document` step renders a PDF or a Word file from a **document template** the package carries. Write the template as
`config/document_templates/<key>.json`; the file name equals `key`, and it becomes `document_template:<key>`:

```json config
{
  "key": "approval_letter",
  "name": "Approval letter",
  "description": "The letter an employee gets when their leave is approved.",
  "schema_json": {
    "type": "object",
    "properties": { "number": { "type": "string", "title": "Request number" } }
  },
  "template": {
    "version": 1,
    "blocks": [
      { "id": "0190f8f4-0000-7000-8000-000000000001", "type": "heading", "level": 1,
        "content": [{ "type": "text", "value": "Leave approved" }] },
      { "id": "0190f8f4-0000-7000-8000-000000000002", "type": "text",
        "content": [{ "type": "text", "value": "Request " }, { "type": "field_ref", "path": "number" }] }
    ]
  }
}
```

- Members: `key`, `name`, `description`, `schema_json` (the fields the layout reads), `sensitive_field_paths`,
  `template`. `name` and `schema_json` are required; a template without `template` installs but renders nothing.
- `template` is the bare block tree, `{ "version": 1, "blocks": [ … ] }`. It is **not** the designer export's
  `{ "mode", "kind", "block_tree" }` envelope: the build refuses that and says to move `block_tree`'s members up.
- Every block's `id` is a UUID of your choosing, unique in the template. A `field_ref`'s `path` (dotted for a nested
  property) must be a property of `schema_json`. A packaged template cannot hold an `image` block yet: the build
  refuses one, since AgentFlow renders no image from a submission field and a package carries no template asset.
- The step names the template with `${document_template:<key>}`; a key or an id written as it is is refused, here
  and wherever else a step names a template (a `signature` step's or a Human step's `signing` documents that
  render one, a Human step's `reviewDocuments`). `fieldMapping` keys are JSON pointers into
  `schema_json`; values are bindings. To keep the file on the record, bind the step's `generated_files` to a
  `file` field in an `update` step, **in the same update that sets the status the file belongs to**:

```js
node("letter", "Write the approval letter", "document", { documents: [{
  id: "letter", documentTemplateId: "${document_template:approval_letter}", format: "pdf",
  fieldMapping: { "/number": ref("subject.record.number") },
  filenameTemplate: "approval-{{ subject.record.number }}",
}] }),
update("approved", "Mark approved and attach the letter", "${entity:leave}", "subject.record_id", [
  bind("status", lit("approved")),
  bind("approval_letter", ref("nodes.letter.output.generated_files")),
]),
```

`format` is `pdf`, `docx` or `both`. With two updates, the status first and the file in a later "attach" step, the record
is `approved` for a moment with an empty file field, and a test or a person that waits for `approved` reads it empty.

The `update` writes a copy the record owns, and that copy is also how a UI module reaches the file: an installed
app's token is told nothing of the run's own files, and reads the record's copy as any file of the record, unless it
was rendered from a field the app may not read (UI module skill, `records-api.md`, "A file a workflow made").

## Steps a package cannot carry

- **`sql_query`**: `lint` refuses it (`sql_node`): it names one organization's database connection. A **`learn`**
  step is allowed; it names the package's own memory types and agent (`memory.md`).
