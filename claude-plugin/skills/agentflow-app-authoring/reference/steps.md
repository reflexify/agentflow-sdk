# The steps a workflow may use

A workflow is a graph of steps: `node(id, name, nodeType, params, settings)` in
`@reflexify/agentflow-app-builder/workflow`, with a helper for the common ones (`workflows.md`, "The helpers").
This page says, for every step kind, whether a package can carry it, how to write it, and what later steps read
from it. A step's output is read as `nodes.<id>.output.<member>` in a `ref(...)` or a `{{ … }}` template.

The builder checks a graph's shape (`workflows.md`, "What `merge` checks") and passes every step's own parameters
through unchecked, except that `signature()` and `signing()` check their own options (`signing.md`), `call()` refuses a `subjectSource` that is not a string, `create()` and `upsert()` refuse a `destinationUnit` that names a unit by id, `fork()`, `webhook()`, `extractText()`, `integration()` and `message()` check theirs (below), and a `notify` step's kind and source lists are checked against the manifest (`notifications.md`). AgentFlow checks
them all at `lint` and at install. So write a step the way this reference shows it, and run `lint` before you
believe it.

## Steps with a helper or a shipped example

| Step (`node_type`) | Write it with | Reads as | Example |
|---|---|---|---|
| `start` | `start({ subject?, params? })` | `input.<name>` (the run's input), `subject.record_id`, `subject.record.<field>` | the case desk's "Open a case" |
| `end` | `end(id, name, outcome?, outputs?)`; `outputs` is `{ name: ref(...) \| lit("...") }`: a `lit` here is a string (`lit("true")`, never `lit(true)`, which the build refuses), and a `ref` may carry a `label` | what a Call step or a trigger's caller reads | A For Each step, below |
| `decision` | `decision(id, name, [when(edge, condition), otherwise(edge)])` | picks the edge | `workflows.md`, "Decisions" |
| `human` | `node(id, name, "human", { assignment, actions })`; add `signing: signing({ … })` to make the holder sign a PDF, `visibleWhen` on an action to offer it only when a condition holds, `sla` and `escalation` for a deadline, and `page: { path, mode: "redirect" }` to work the task in the app's own screen | the person picks an action; each action names an edge; a later step reads `nodes.<id>.output.action`, the action's id (`__sla_timeout` after a timeout branch), and `nodes.<id>.output.actor_user_id`, who answered (null when the engine settled it) | `workflows.md`, "Human steps" and "A page for the step"; with `signing`, `signing.md` |
| `signature` | `signature(id, name, { documents, signers, method?, routing?, onDecline?, certVisible?, task? })`; each signer is one named person | `nodes.<id>.output.status` (`signingStatus(id)`), `.generated_files` (`signedFiles(id)`, the signed PDFs) and `.signed_documents` | `signing.md`, and `examples/signed-decision` |
| `entity_record`, `operation: "get"` | `getById(id, name, entity, idPath)` | `nodes.<id>.output.record` (`.id`, and each field by key) | `workflows.md`, "The helpers" |
| `entity_record`, `"get"` by key | `getByKey(id, name, entity, matchKey, [bind(...)])`: `matchKey` is the `id` of one of the entity's `natural_key` sets, and the body binds each field of that set; it reads one record and writes nothing. A step names Users, Groups or units by the reserved id (`ffffffff-0000-0000-0000-000000000001`, `…0002`, `…0003`); the entity goes in `requires.entities` with the field the step binds in `fields`. Users are found by `email` with `matchKey` `"__default__"`. A key member that is `null`, absent or blank fails the step (`INTEGRATION_MISSING_KEY`) | `nodes.<id>.output.found` (`true` or `false`) and `.record` (`null` when none matched) | `workflows.md`, "A person's profile in a path" |
| `entity_record`, `"search"` | `search(id, name, entity, [flt(field, op, binding)], { sort?, dir?, limit?, fields? })`; the filter value is a binding: `flt("status", "eq", lit("pending"))`; `flt("id", "eq", ref("vars.id"))` or `flt("id", "in", ref("vars.ids"))` narrows to those records, within what the step may read (only `eq` and `in` apply to `id`, and `build` refuses another on any Entity Record step); `op` takes a view filter's operators for the field's type (`entities.md`, "Views"), and a `within` window is a literal counted from the organization's today, `flt("due", "within", lit("before_today"))`, since publish refuses one read from the run (`entity_record.filter_window_invalid`); `fields: ["title"]` returns only those fields with each record's `id` and `metadata` | `nodes.<id>.output.records`, `.returnedCount`; each record holds its fields beside `id`, so `records[0].<field>` is the first one's (`null` when it found none) | A For Each step, below |
| `entity_record`, `"create"` | `create(id, name, entity, [bind(field, binding)], { destinationUnit? })`; `destinationUnit` is for an entity filed in a unit (below) | `nodes.<id>.output.record.id` | the case desk's "Open a case" |
| `entity_record`, `"update"` | `update(id, name, entity, idPath, [bind(field, binding)], { expect?, check? })`; `expect: { fields: { status: "pending" } }` makes the write skip when the stored values differ, and an expected value that renders empty (including a value read earlier that was empty) means the field is empty; a number field compares by value (`"3.0"` holds against `3`), a yes/no field takes only `true` or `false`, and a value that renders as neither fails the step (`VALIDATION_ERROR`) instead of skipping; `check` is the conversation check (`workflows.md`, "Saving from an agent's answer") | `.record`, and `.skipped` (true when `expect` did not hold) | A For Each step, below |
| `entity_record`, `"update_many"` | `updateMany(id, name, entity, [flt(...)], [bind(...)])` | | `workflows.md`, "The helpers" |
| `entity_record`, `"create_many"` | `createMany(id, name, entity, itemsPath, [bind(...)], { itemAlias?, indexAlias?, destinationUnit? })`: one record per element of the list at `itemsPath`; the body reads the element as `item.<field>`, or under `itemAlias`, and its position under `indexAlias` | `nodes.<id>.output.ids`, the created records' ids in list order (never their bodies); each record fires its own `record.created` | `workflows.md`, "The helpers" |
| `entity_record`, `"update_each"` | `updateEach(id, name, entity, itemsPath, idPath, [bind(...)], { itemAlias?, indexAlias?, expect? })`: each element of the list at `itemsPath` names one record, by `idPath` (`"item.id"`), and the values to write to it; `idPath`, the body and `expect` read the element as `item.<field>`, or under `itemAlias`. All or nothing: two elements naming one record, a record not found, or an `expect` that no longer holds fails the step, naming the element. No File field, no list append or remove, at most 5,000. A test run does not check that the records exist | `nodes.<id>.output.updatedCount` and `.ids`, the updated ids in list order; each record fires its own `record.updated` | `workflows.md`, "The helpers" |
| `entity_record`, `"upsert"` | `upsert(id, name, entity, matchKey, [bind(...)], { destinationUnit? })`: `matchKey` is the `id` of one of the entity's `natural_key` sets (`entities.md`); it finds the record that matches the bound fields, or creates it. Whichever it does, the run needs `read`, `update` and `create` on the entity, and `read` on every record of it, not a record scope (otherwise `UPSERT_REQUIRES_FULL_KEY_VISIBILITY`); a found record has the bound fields written as an update writes them, so the entity's rules and stage model judge it, and a found record outside the update scope is refused (`ENTITY_RECORD_ACCESS_DENIED`). It writes one record and reads no list ("Empty values, empty lists, and the list an upsert does not take", below) | `.record.id` | `workflows.md`, "The helpers" |
| `set_variable` | `setvar(id, name, [[variable, binding]])`, the variable's bare name (`"first_status"`, never `"vars.first_status"`); `readParameters(...names)` reads parameters | `vars.<variable>` / `{{ vars.<variable> }}` | `workflows.md`, "Variables: `setvar`" and "Parameters inside text" |
| `call_workflow` | `call(id, name, "${workflow:key}", subjectSource?, [[input, binding]], settings?)`; `subjectSource` is a path, as a string, to the record the callee's run is about (`"subject.record_id"`); the callee comes earlier in `ORDER` | the callee's End outputs, as `nodes.<id>.output.<name>` | `workflows.md`, "Calling another workflow" |
| `code` | `code(id, name, "code/file.js", [[input, binding]], outputSchema, { timeoutSecs? })`; the file defines `main(inputs)` | `nodes.<id>.output.<member>` of `outputSchema` | `workflows.md`, "Code steps" |
| `email` | `node(id, name, "email", { email: { connection, to, cc?, bcc?, replyTo?, subject, body, headers?, attachments?, delivery?, autoSubmitted? } })`, `connection` as in `workflows.md`, "Email steps"; `to`, `subject`, `body`, `replyTo` and each header value are templates; `to` may list addresses separated by `,` or `;`, each sent a message of its own unless `delivery: "together"` (which `cc` and `bcc` need); `body` is plain text, sent as both parts of the message; `headers` takes `In-Reply-To`, `References` and `X-` names; `autoSubmitted` is `auto-generated` (the default), `auto-replied` or `none` | `nodes.<id>.output.messages[]`, each `{ outbound_id, to, cc, message_id }` (`message_id` is `null` when the provider chooses it, as `.message_id_source: "provider"` says), `.delivered_count` | `workflows.md`, "A worked example: mail in, an answer out, and replies on the same thread" |
| `message` | `message(id, name, { connection, thread?, to?, text?, attachments?, typing? })`: `connection` is the key of a `connection_ref` parameter of category `messaging`; `thread` is the channel thread to reply on, such as `"{{ trigger.thread_id }}"` from a `message.received` trigger, and `to` whom to send to when there is no thread yet (an address, an E.164 number or a handle); `thread`, `to` and `text` are templates; a message carries text, `attachments` (as an Email step's) or both. A reply leaves through the step's connection, and a thread that belongs to another connection fails the step (`MESSAGE_THREAD_WRONG_CONNECTION`). AgentFlow refuses no `to` for never having written, and enforces no channel's reply window: on a webhook relay the step succeeds once the message is queued, and a send the relay refuses, or that fails after its retries, is recorded as `message.failed` with a `reason`, which the run is not told (a `message.failed` trigger hears it, `message-events.md`); a sandbox's loopback takes any `to`, so a test there cannot show a refusal. The package needs platform `2027.08`, which the builder writes (`manifest.md`) | `nodes.<id>.output.outbound_id`, `.thread_id`, `.provider_message_id` (`null` until the service names one) | the release skill's `sandbox-testing.md` (`message-in` starts the run, `message-out` lists the reply) |
| `agent` | `node(id, name, "agent", { agentRef: { agentId: "${agent:key}", overrides? }, promptTemplate, outputSchema, conversation?, memory?, knowledge?, toolSettings?, stream? })`; `overrides: { budget: { maxTokens }, maxIterations }` sets this step's answer length and number of model calls in place of the agent's (8192 tokens and 8 calls when neither sets them), and the same keys beside `agentRef` are refused (`agents-and-skills.md`, "How long an answer may be, and how many calls"). Or, to offer the package's own workflows as tools, no `agentRef` and the step's own `systemPrompt`, `model: "${param:…}"` and `workflowTools: [{ workflowKey: "${workflow:<key>}", alias }]`, with no `memory` (`workflows.md`, "Tools in a workflow a message starts"). `knowledge: { query?, topK?, searchTool? }` sends the passages of the agent's knowledge that best match `query` (the trigger's text by default) before the model starts; `searchTool: false` leaves `knowledge_search` off, and `memory: { searchTool: false }` leaves the memory tools off, which an agent is offered only when its `read_limit` lists memory types (`workflows.md`, "Agent steps that recall knowledge"); either needs platform `2027.08`. `toolSettings` is keyed by the name the model calls a workflow tool by, each `{ label?, requires }` with `requires` `"verified_sender"` or `"none"`: on a run that answers a sender (one a `message.received` started, or a run it calls or starts as a tool, which inherits the sender), a tool with no entry, or none with `requires`, runs only for a sender someone verified, and an anonymous one's call is answered `not_available` before anything starts; on a run with no sender it is ignored. Mark a tool anyone may use `requires: "none"`. A package that sets it needs platform `2027.08`, which the builder writes (`manifest.md`). `stream: { label?, text? }` says what to show while the step runs (its label, and its words to a chat's customer only from the reply step), and no step shows it yet; `text: true` with an `outputSchema`, or `stream` with `sensitiveFieldPaths`, is refused (`workflows.md`, "Agent steps that stream"). Leave `outputSchema` out for a text answer: offered no tool, as with `knowledge: { searchTool: false }` and `memory: { searchTool: false }`, it is one model call | `nodes.<id>.output.<member>` of `outputSchema`; with no `outputSchema`, `nodes.<id>.output.text` and `.usage` | `agents-and-skills.md`; `workflows.md`, "Agent steps that recall memory", "Agent steps that recall knowledge" and "Agent steps that stream" |
| `notify` | `notify(id, name, kind, [recipient.field(path) \| recipient.user(paramKey) \| recipient.group(paramKey) \| recipient.initiator()], { except? })`; `kind` is a key of the manifest's `notifications` | `nodes.<id>.output.sent`, `.excepted`, `.actor`, `.cannot_read`, `.muted`, `.suppressed`: counts only, never who | `notifications.md` |
| `fork`, `join` | `fork(id, name, [edgeIds])`, one edge per arm, and `join(id, name)` | every arm runs; the Join goes on once all have reached it | `workflows.md`, "Parallel arms: Fork and Join" |
| `webhook` | `webhook(id, name, { url, method?, headers?, body?, auth?, retries? }, settings?)`: `url` and header values are templates; `body` is a template string sent as text, or `{ name: ref(...) \| tpl(...) \| lit(...) }` sent as JSON; `auth` is `{ kind: "bearer", secret }`, `{ kind: "api_key_header", secret, header }` or `{ kind: "basic", secret, username }`, `secret` the key of a `secret_ref` parameter | `nodes.<id>.output.success`, `.status` (the HTTP status), `.response` (the JSON answer; null when it is not JSON or passes 1 MiB), `.attempts` | `examples/document-check` |
| `extract_text` | `extractText(id, name, source, { mode?, format?, onOversize? })`: `source` is the path of a file, such as `subject.record.<file field>` or `input.item`; `mode` is `single` (the default) or `multi`; `format` `markdown` (the default) or `text`; `onOversize` `fail` (the default) or `truncate`. Over a field of several files, `single` reads the first in the field's order (`filename` says which) and `multi` reads each, in that order; over no file `single` fails the step and `multi` gives `count: 0`. A record has no "main" file but its first: give the document a field of its own (`"format_options": { "max_files": 1 }`), or use the entity's `document` (`work.md`) | `single`: `nodes.<id>.output.text`, `.pageCount`, `.filename`, `.truncated`; `multi`: `.items[]` of those and `.count` | `examples/document-check` |
| `integration` | `integration(id, name, { connection, operation, objectType, identityField?, mappings?, delivery?, captureTo?, associations?, safeFieldPaths? })`: `connection` is the key of a `connection_ref` parameter with a `category`; `operation` is `get`, `search` or `upsert`; a `get` or `upsert` names `identityField` and maps the key's value to it, `mappings: [["external_ref", ref("vars.ref")]]` on a `get`; `captureTo` is a path under `vars.` or `input.`; a mapping is `[field, binding]`, and on a `search` `[field, binding, operator]` (`eq`, `neq`, `contains`, `starts_with`, `gt`, `lt`, `known`, `unknown`) | the provider's record, at `nodes.<id>.output` and in `captureTo`; an inline write's outcome (below) | below |
| `group_files` | `node(id, name, "group_files", { source, depth })`: `source` is the start form's file field as `input.<field>`, `depth` the levels below the picked folder that make one folder (1 by default) | `nodes.<id>.output.groups`: one list of file ids per folder, for a For Each | `examples/court-batches`, and "Looping over files", below |
| `for_each` | `node(id, name, "for_each", { listSource, itemAlias, mode, concurrency?, continueOnItemFailure, failOnItemFailure, body })`: `body` is a graph of its own (its own `start`, edges and ends) run once per item; `mode` is `parallel` or `sequential`; `concurrency` caps how many items run at once in `parallel` mode ("How many items run at once", below) | `nodes.<id>.output.items` (one entry per item, with its `status` and any `error`) | A For Each step, below |

A reference field reads as the id of the record it points at: `subject.record.item` is the item's id, so pass it
as an idPath (`update(…, ITEM, "subject.record.item", …)`). A longer path follows the reference into that
record: `subject.record.item.name` is the item's name, and `subject.record.item.id` is the id again, at the
cost of reading the item as the run's principal. Prefer the bare form. The same holds for
`nodes.<id>.output.record.<reference>`.

### Empty values, empty lists, and the list an upsert does not take

- **An empty reference is `null`, never `""`.** A reference field takes a record's id, a record (its `id` is read)
  or `null`. No write reads `""` as no record: a `create`, `update`, `upsert`, `createMany` or `updateEach` that puts
  `""` in a reference fails the step with `ENTITY_REFERENCE_INVALID` (on a required one, any write fails first as a
  missing field, `VALIDATION_ERROR`). One such element fails a whole `createMany` or `updateEach`, which then writes
  nothing. AgentFlow's own forms send `null` for an empty picker, or leave the field out, and the records API refuses
  `""` as a step does, so a Code step that builds the values of a write sends `null` for each empty member that is not
  text. `null` leaves the field empty, except on a single reference whose default is the creator
  (`"default": { "kind": "creator" }`): a `create` or `createMany` fills a `null` there with the run's person, when the
  run has one.
- **An empty list writes nothing.** A `createMany` or an `updateEach` over `[]` succeeds and writes nothing
  (`nodes.<id>.output.ids` is `[]`). A missing or `null` list is not an empty list: `items` that resolves to `null` or
  to nothing fails the step with `ENTITY_RECORD_CREATE_MANY_NOT_A_LIST`, so a Code step with no elements returns `[]`.
- **An `upsert` writes one record, and each field of its `matchKey` needs a value.** It reads no list. A key member
  that is `null`, absent or blank (`""`, or only spaces) fails the step with `INTEGRATION_MISSING_KEY` and writes
  nothing, whether the field is required or not, and so does a get by key. An AgentFlow build from before that check
  reads `""` as a value, so every upsert keyed on it updates the same record: never bind `""` to a key. A key member
  bound to a list's element (`ref("input.shares[0].order")`) is empty when the list is. When the list may be empty,
  branch around the upsert with a `decision` on a value that says so, such as a flag the Code step that builds the list
  also returns: `when("e_share", { "===": [{ var: "nodes.decide.output.has_share" }, true] })`.
- **There is no list upsert.** `items`, `itemAlias` and `indexAlias` belong to `createMany` and `updateEach`, and
  install refuses them on any other step (`entity_record.items_unsupported`; an AgentFlow build from before that check
  refuses the body's `item.<field>` as `reference.unknown` instead). To write a list in which some records exist and
  some do not, split it: `createMany` the new ones and `updateEach` the ones that exist, each from its own list.

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

`merge` checks a For Each body as a graph of its own.

### An all-or-nothing graph

A graph that must be all-or-nothing takes `"atomic"` as `graph`'s last argument. Its steps run in one transaction, so it takes only `start`, `end`, `decision`, `set_variable`, `fork`, `join`,
`entity_record`, `entity_relationship`, `auto_number`, `email` and `message`. `merge` refuses every other kind there, as publish
does (`atomic.step_not_allowed`), naming the step and why:

| Refused in an atomic graph | Why | Instead |
|---|---|---|
| `human`, `signature`, `agent`, `extract_text`, `learn` | it waits | run it in a workflow that calls this one (and pass its result in, where it has one) |
| `for_each` | it runs every item as a run of its own | write the records in one step with `createMany`, `updateMany` or `updateEach` |
| `call_workflow` | the workflow it calls runs as a run of its own | call this workflow from that one instead |
| `webhook`, `integration`, `sql_query`, `code`, `document`, `image`, `group_files`, `notify` | a rollback cannot take it back | run it in a workflow that calls this one, after the call |

An `email` or `message` step in an atomic graph sends only once the pass commits: its message is written in the
pass's transaction, so a pass that rolls back takes it back with the records and tells nobody of a write that was not
saved.

A For Each body is never atomic: each item runs as a run of its own, so `merge` refuses a body graph given a
transaction other than `per_step` (`atomic.body_transaction`). Publish also refuses, in an atomic graph, a write to a File field
(`atomic.file_binding`) and a read of a file's text (`atomic.file_content`). The build does not check these two, so the
install plan is the first to report them.

A pass runs its steps one at a time. Judging each step's inputs costs about the same whatever its list holds, and a
step that writes adds a cost for each record it writes, so how many steps a run visits decides most of how long it
takes: `workflow-cost.md`, "All-or-nothing workflows".

### A For Each step

A search for idle items, a body that closes each one unless its status moved since the search, and an End
whose output carries a label. Inside the body the item is `input.<itemAlias>`. Over a search's records, or over a
`reference_list` field (`listSource: "subject.record.<field>"`), each item is a record, with its `id` and fields,
and the body's run is about that record:

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

Every step id is the workflow's own: a body's step may not take the id of a step around the loop, in another loop's
body or in a loop around it (`graph.duplicate_step_id`, which `build` and AgentFlow both refuse). `start()` and
`graph()` always write the id `start`, so write a body as an object whose start step has an id of its own, as `bs`
above, and give a second loop's body ids of its own.

#### How many items run at once

`mode: "parallel"`, the default, starts the items together. `concurrency` caps how many run at once, as a sliding
window: with `concurrency: 3`, three items start, and each time one ends the next one starts, so three are running
until the list runs out. Without it nothing in the package caps them, and only the deployment's workers limit how
many run at the same time. AgentFlow's designer writes `5` (it offers 1 to 16); a package can write any whole number
from 1. `mode: "sequential"` runs one item at a time in list order and ignores `concurrency`. `build` and AgentFlow
refuse `0` in either mode (`for_each.concurrency_invalid`): a loop with no slot runs no item, and its run would wait
forever.

`concurrency` caps one loop: two runs of the workflow at once each run their own window. To cap the items across
runs, start the workflow from a record trigger whose `group` key every event shares, such as a choice field that
every record holds the same value in, with `max_batch: 1`: one run works at a time, and each event waits for its
own run (`workflows.md`, the trigger's `group`). To let three work at once, keep `max_batch` above one and loop
over the batch: a For Each with `listSource: "trigger.events"` and `concurrency: 3`. Each entry holds its event's own
`trigger.*` keys, so `input.<itemAlias>.record_id` names the record that changed, and the events that arrive meanwhile wait
for the next batch's run. Two cases still run beside another run. A run paused by an
operator, or because its app is disabled, hands the key on, so the next run starts while it waits, unless the group
sets `hold_while_waiting`. And only the runs this trigger starts wait for the key: a Call or a record action that
starts the workflow runs at once.

Set it when each item calls something that limits how fast it may be called: an Agent step whose provider limits
requests per minute, a Webhook step to a service with a rate limit, or an Integration step to an ERP. A body with an
Agent step over a list of 200 records, with no cap, sends as many model calls at once as the workers allow, and
the provider may refuse them.

```js
node("each", "Classify each", "for_each", {
  listSource: "nodes.open.output.records", itemAlias: "item", mode: "parallel", concurrency: 3,
  continueOnItemFailure: true, failOnItemFailure: false,
  body: { … },
}),
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
bare id, `content(input.<itemAlias>)` in an Agent prompt is empty, and publish says nothing.

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

## Steps that need something outside the package

A package can carry these, but they run only if the organization supplies what they name. Each shows in setup
as a required item that is *Invalid* until the deployment or the admin provides it.

| Step | Needs | `lint` |
|---|---|---|
| `email` | an email connection (`connection_ref` parameter, category `email`) and an `egress` entry naming it by connection, `{ "connection": "${param:…}" }`; the step does not say which provider | `email_egress_not_by_connection` (a warning) |
| `message` | a messaging connection (`connection_ref` parameter, category `messaging`) and an `egress` entry naming it by connection, `{ "connection": "${param:…}" }`; the step does not say which service | `message_egress_not_by_connection` (a warning); a parameter of another category, or of none, is `connection_category_mismatch` or `connection_category_missing`, and the build refuses it too |
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
takes its `otherwise` edge whenever no `when` matches, and a test run's `captured` matches neither. With `otherwise`
on the written path, a test run would go on as if the write had landed.

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
  a bill it finds is returned as it is now, its `status` in erp-core's values as a read answers it (`posted` if an
  accountant has posted it, `cancelled` if one has cancelled it), and nothing is written. A cancelled bill therefore
  answers every later write of its `external_ref`: delete it in the ERP, and the next write makes a new draft. When that
  lookup missed, the repeated write updates the draft and the lines it names, and leaves lines it no longer names.
- **A member the ERP computes is not writable.** `amount_untaxed`, `amount_tax`, `amount_total`, `amount_due`,
  `number`, `status` and `payment_status` belong to the ERP, and so does a tax's amount: the write is refused at that path
  (`rejected` for an inline write), not dropped. `build` and `lint` do not look at the body, so a body that does not fit is refused when
  the step runs, naming the path (`lines[0].qty`) and never the value. A connector can refuse more of the shape: the
  Odoo connector does not hold `exchange_rate`, `fiscal_document`, `dimensions` or a line's `receipt_line`.
- **Reading a bill back.** A `get` of `vendor_bill` by `identityField: "external_ref"` that finds no bill **succeeds
  with a `null` output**: a miss is a normal read result, with no `found` flag and no error code. A bill it finds is
  the output, so its status is `nodes.<id>.output.status`. No step waits for the ERP to change a bill, so read it back
  in a later run, such as a scheduled one (a sandbox test fires it: the release skill's `sandbox-testing.md`, "Testing
  an app on `rfx/erp-core`"). A blank or missing
  `external_ref` **fails the step** before any call (`INTEGRATION_MISSING_KEY`), so check the value before the step. A
  transport failure (after three tries) or a refused key or access **fails the step** too (`INTEGRATION_PERMANENT_FAILURE`,
  `PROVIDER_RATE_LIMITED`), and the
  `rejected` outcome is an inline write's only. So branch on the output with a Decision
  (`{ "!": [{ var: "nodes.<id>.output" }] }` is "not in the ERP"), and never set
  `settings.error_handling.strategy: "continue"` on a get whose miss means something: a failure would then hand on
  an empty stand-in that reads exactly like a miss.

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
- Every other block and inline item is in `document-templates.md`: tables, and a row that repeats per item of a
  list (line items, with a row number and a total), columns, lists, display masks for dates and numbers, page
  setup and sections, the running header and footer with page numbers, Markdown text, expressions and show-when
  conditions, and what differs between the PDF and the Word file.
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
