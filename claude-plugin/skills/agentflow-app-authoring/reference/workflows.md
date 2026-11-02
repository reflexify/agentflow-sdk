# Workflows, triggers and actions

These are written in code, in modules under `config/build/`, because a graph is easier to build from
functions than to type as JSON. Each module exports any of `workflows`, `triggers` and `actions`; `merge` counts an export a module leaves out
as `{}`, so writing `export const triggers = {};` is optional (the starter does, for clarity). A name may be
defined in only one module (`defined twice` otherwise). `agentflow.app.mjs` combines the modules.

## `agentflow.app.mjs`

```js
import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as openCase from "./config/build/open-case.mjs";

export default defineApp({
  sections: merge([openCase], ["open_case"]),
  exposedSteps: { open_case: ["review"] },
});
```

- `merge(modules, ORDER)` combines the modules and checks every graph. `ORDER` lists the workflows by their
  name in the `workflows` map, in publish order: **a workflow comes after every workflow it calls.** A
  workflow missing from it is refused (`APP_FILE_INVALID: agentflow.app.mjs: add open_case to ORDER`). A name
  two modules define is refused (`sections#/workflows/intake: defined twice`).
- `exposedSteps` maps a workflow `key` to the ids of the Human steps it exposes as part of its contract
  (the case desk exposes `review`). Expose a step that something outside the workflow, such as a UI module,
  needs to find or complete. A step that is not a Human step is refused
  (`exposed step case is not a human step`).
- `entityOrder` (optional) lists the entity keys in the order the package lists them, and must name exactly
  the files in `config/entities/`. Without it they are sorted.
- `ui` (optional): `{ "viteConfig": "<file>" }` to build the UI module with another Vite config than
  `vite.module.config.ts`, or `{ "prebuilt": "<folder>" }` to copy a built module as it is.
- Any other member is refused (`exposed is not a member defineApp takes`).

## A workflow

The case desk's "Open a case" (`config/build/open-case.mjs`) starts from a form, creates a case, and asks
the person who started it to approve or reject it:

```js
import {
  INITIATOR, bind, create, edges, end, graph, lit, node, ref, restricted, start, tpl, update, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const CASE = "${entity:case}";
const THE_CASE = "nodes.case.output.record.id";

const review = node("review", "Review case", "human", {
  assignment: { candidates: [{ kind: "dynamic", source: { type: "initiator" }, relation: { type: "direct" },
    fallback: [{ kind: "group", id: "${param:app_users}" }] }] },
  actions: [
    { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
    { id: "reject", label: "Reject", edgeIds: ["e_reject"] },
  ],
});

export const workflows = {
  open_case: workflow(
    "open_case", "Open a case",
    "Opens a case from a summary and an amount, then asks whoever opened it to approve or reject it.",
    INITIATOR, restricted("app_users"),
    graph("Open a case", [
      start({ params: true }),
      create("case", "Create the case", CASE, [
        bind("title", ref("input.summary")), bind("summary", ref("input.summary")), bind("amount", ref("input.amount")),
        bind("opened_on", tpl("{{ today() }}")), bind("opened_by", ref("workflow.requester.id")),
      ]),
      review,
      update("approved", "Mark approved", CASE, THE_CASE, [bind("status", lit("approved"))]),
      update("rejected", "Mark rejected", CASE, THE_CASE, [bind("status", lit("rejected"))]),
      end("done_approved", "Approved", "approved"),
      end("done_rejected", "Rejected", "rejected"),
    ], edges(
      ["e_start", "start", "case"], ["e_created", "case", "review"],
      ["e_approve", "review", "approved"], ["e_reject", "review", "rejected"],
      ["e_approved", "approved", "done_approved"], ["e_rejected", "rejected", "done_rejected"],
    )),
    { type: "object", properties: { summary: { type: "string", title: "Summary" }, amount: { type: "number", title: "Amount" } },
      required: ["summary"] },
  ),
};

export const triggers = {};
export const actions = {};
```

`workflow(key, name, description, runAs, startAccess, graph, inputSchema?)` makes the source object
`{ key, name, description, run_as, start_access, input_schema, output_schema, graph }`. You may write that
object by hand instead; the helpers only save typing.

- **`key`** is what references use (`${workflow:open_case}`). The map's own name (`open_case:`) is what `ORDER`
  lists.
- **`runAs`**: `INITIATOR` runs as the person who starts it. `servicePrincipal("<service_principal_ref>")`
  runs as the package's service principal. Which one a workflow takes is not a choice: see Who a workflow runs as.
- **`startAccess`**: `restricted("<group_ref>", …)` lets those groups start it; each group becomes a start
  grant `start_<key>`, `start_<key>_2`, and so on. `NOBODY` lets no one start it by hand, for workflows only a
  trigger or another workflow starts. Everyone is refused (`a package cannot let everyone start a workflow`).
- **`inputSchema`**: a JSON Schema for the run's input, read as `input.<name>` (Input schema, below). It is
  checked when a run starts and installs with the package, but AgentFlow draws no launch form from it today.
  `start({ params: true })` declares that the run takes input; `start({ subject: "${entity:task}" })` starts the run on one record,
  read as `subject.record_id`.

### Who a workflow runs as

`runAs` decides whose rights every write of the run has: grants, a rule's actor tests and a stage model's movers
are all judged on it.

- **`INITIATOR`**: the person who started the run. Every workflow that people start (through its start grants,
  an entity action, or a Call from one of those) must run as it, and can do only what that person can: a status
  move the person may not make is refused with 422 `STAGE_TRANSITION_NOT_ALLOWED`.
- **`servicePrincipal("<key>")`**: the package's service principal. Every workflow a trigger starts must run as
  it. It owns no record, holds no work and is in no field, so it passes only `in_group` in rules and movers:
  give it an **automation group**, a `group_ref` parameter that holds the principal (and one dedicated account
  that never signs in, because setup counts only people as members), and grant that group what the steps do
  (`access.md`).
- `lint` enforces the split: `run_as_not_initiator`, `run_as_not_service_principal`, and `run_as_conflict` for a
  workflow that both people and a trigger start. Make two workflows instead.

So a workflow people start can never do what only one group may do. When a step of the app must (a decision only
IT may record), a **trigger starts the workflow that does it**, as the service principal. The worked example below
does exactly that.

### Start forms: `inputSchema`

**AgentFlow does not draw a launch form from `inputSchema` today.** A workflow started with `start({ params: true })`
has no form definition behind its start step, so the start page says the workflow has no start form, and the
assistant's start-form verb finds none. The schema does three things: the API checks the input a caller
sends (`POST /workflows/{workflow_id}/instances`, a Call step, a trigger or an action's `input_map`), file fields
in it bind folders, and the steps read the values as `input.<name>`. So people reach a packaged workflow through
an entity action, a trigger, a UI module, a Call, or a screen of your own site that asks for the inputs and starts the run with `POST /workflows/{workflow_id}/instances` and `params` (the starter's `src/StartCase.tsx`), not through a form drawn from this schema. `<agentflow-start-form>` fits only a workflow whose start step binds a designer form.

A record picker is written the same way as in an entity's `create_form` (`entities.md`):
`{ "type": "string", "format": "entity", "x-entity": "equipment" }`, where `x-entity` is an entity key of the
package, `user` or `org_unit`, at any depth (an object's property, an array's items). The builder writes the key
form, so the schema validates, `lint` accepts it and the package installs; a key that is not an entity of the
package is refused at build time. Do not write `@obj.key:…` or `${entity:…}` yourself: the builder refuses the
first, and `${entity:…}` builds the id form, which `lint` refuses. Because nothing draws the form, a person cannot
pick a record there. To let a person choose a record, use one of these:

- **Start the run on the record.** `start({ subject: "${entity:equipment}" })` with an entity action on the
  Equipment records (`Actions`, below: a "Request" button on each row, `input_map: [{ from: "record.id", to: "subject" }]`);
  the run reads `subject.record_id`.
- **Make the request a record.** The person fills the entity's own create form, which has the picker, and a
  trigger on `created` starts the workflow as the service principal (the worked example below).
  A standalone site under a ceiling cannot fetch that form (`SKILL.md`, "What a ceiling takes from a standalone site"):
  it writes the form's keys by hand, or starts a workflow instead.
- **Ask in a UI module.** The module shows its own picker and starts the workflow with the chosen id as a plain
  `string` property, through `POST /workflows/{workflow_id}/instances` on `host.api`; it finds the workflow's id with
  `getAppObjects(host.api)` from the SDK (`id('workflow:<key>')`). See the `agentflow-ui-module` skill.

## The helpers

All from `@reflexify/agentflow-app-builder/workflow`.

- **Graph**: `graph(name, nodes, edges, transaction?)`; `edges(...[id, from, to])`. Pass `"atomic"` as
  `transaction` for an all-or-nothing run.
- **Steps**: `node(id, name, nodeType, params?, settings?)` for any step; `start({ subject?, params? })`;
  `end(id, name, outcome?, outputs?)`; `decision(id, name, branches)` with `when(edge, condition)` and
  `otherwise(edge)`; `setvar(id, name, [[target, binding]])`; `readParameters(...names)`;
  `call(id, name, workflow, subjectSource?, inputs?, settings?)` (Calling another workflow, below);
  `code(id, name, file, inputs, outputSchema)`.
- **Records**: `getById(id, name, entity, idPath)`; `search(id, name, entity, filters, { sort?, dir?, limit?, fields? })`
  with `flt(field, op, value)`; `create(id, name, entity, body)`; `update(id, name, entity, idPath, body)`;
  `updateMany(id, name, entity, filters, body)`; `upsert(id, name, entity, matchKey, body)`.
- **Notifying**: `notify(id, name, kind, recipients, { except? })` with `recipient.field(path)`, `recipient.user(paramKey)`,
  `recipient.group(paramKey)` and `recipient.initiator()`. `notifications.md` explains each.
- **Signing**: `signature(id, name, options)`, `signing(options)` for a Human step's `signing` block, `doc.template`,
  `doc.upstream` and `doc.review`, `signer.initiator()` and the other signers, `signedFiles(stepId)` and
  `signingStatus(stepId)`. `signing.md` explains each.
- **Values**: `ref(path)` reads a value (`input.summary`, `nodes.case.output.record.id`, `subject.record_id`,
  `workflow.requester.id`); `tpl(template)` renders one (`"{{ today() }}"`); `lit(value)` is a literal;
  `bind(field, value, { copy? })` sets a field in a record step's body; `copy: true` on a File field gives the record
  its own copy of a file another record holds (`entities.md`, "A file belongs to one record").
  A reference field reads as the id of the record it points at, so `ref("subject.record.item")` is a valid
  idPath; `subject.record.item.name` follows the reference and reads the item's name, and
  `subject.record.item.id` is the id again, at the cost of reading the item as the run's principal. Prefer the
  bare form. The same holds for `nodes.<id>.output.record.<reference>`.
- **Constants**: `INITIATOR`, `NOBODY`, and `NOW` (the template `{{ now() }}`).

### Human steps

A Human step opens a task about the run's record, and its own run settles it: no workflow reads who holds it, and
no other run ends it, except through the step's end condition (below). `work` on the entity makes the record itself
the task instead (`work.md`, "A record as a task, or a Human step's task").

A Human step is `node(id, name, "human", { assignment, actions })`. `assignment.candidates` takes the same
assignees as work routing (`work.md`); `{ type: "initiator" }` is the person who started the run. Each
action names the edge it takes with `edgeIds`. A packaged Human step has no task form of its own (the
builder builds only an entity's create form), so the decision is the action the person picks. List the
step in `exposedSteps` when something outside the workflow completes it.

**A comment with the decision** goes on the record, not on the step. Give the entity a text field
(`decision_note`), let the approver write it on the record before choosing an action, and guard it with a rule so only
the deciders may write it: a `write` leaf `changed` on the field, then `actor` with `"negate": true` and an `in_group`
test for each group that may (`rules-and-stages.md`). A later step reads the note as `subject.record.decision_note`.
Do not make the note required on the stage transition the next step makes: a write the stage model refuses fails
the run at that step, after the task is already finished, so an empty note ends the run instead of waiting for it.

**An action that needs a reason**, such as a decline that must say why, is gated on the record instead: give that
action a `visibleWhen` that tests the field, and the task offers it only once the record holds a value.

```js
actions: [
  { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
  { id: "decline", label: "Decline", edgeIds: ["e_decline"],
    visibleWhen: { "!!": [{ var: "subject.record.decision_note" }] } },
],
```

- AgentFlow reads the record as it is when it shows the task and again when an action is taken, so a Decline sent
  while the note is empty is refused (`HUMAN_ACTION_NOT_VISIBLE`), whoever sends it, and the task stays open. The
  decider writes the note on the record first.
- `visibleWhen` is written like a Decision's condition and reads the run's values (`subject.record.<field>`,
  `nodes.<id>.output.<member>`, `input.<name>`). Leave at least one action ungated: publish warns when every action
  has a rule (`human.all_actions_conditional`), since the task could then offer nothing.
- Inside AgentFlow, and in a module it embeds, the rule applies as written. An app's own token (a standalone site
  under its ceiling) is offered no action whose rule reads the run, and cannot take one.
- The rule binds people only: a deadline's or an end condition's `action` target takes the action whatever the rule
  says. Point those at a timeout branch or an end condition's branch, or at an ungated action.
- `work` on the entity is the other way: a stage transition's `required_fields` refuses the move while the field is
  empty, and the record is the task (`work.md`).

**What a later step reads** is `nodes.<id>.output.action`, the id of the action picked (`__condition_met` when the
end condition takes a branch, and `__sla_timeout` when a deadline's timeout branch does, below). Nothing in the output or the run's context names who picked it. When a later
step needs the decider, either give the entity `work` (`work.md`) and have the approver claim the record, so a step
reads the holder from the record's `claimed_by`, or give it a people field (`decided_by`) the approver sets on the
record before choosing, guarded like the note above, and read `subject.record.decided_by`.

**A group as the assignee**, `{ "kind": "group", "id": "${param:it_group}" }`:

- Every active person in the group sees the task in **My Work** while nobody holds it, and can open it. People
  only: a service principal in the group is not offered it.
- A member must **claim** it first (the Claim button, or `POST /entities/{entity_id}/records/{record_id}/work/claim`).
  Only the holder fills in the step and picks an action; from then on the other members no longer see it. The holder
  can release it back to the group, and someone with `assign` on the task can reassign it.
- A candidate list that names exactly one person gives that person the task already claimed.
- A UI module finds the group's open tasks with `GET /work?view=claimable` (a line's `step.workflow` is `{ id, name }` and its step is `step.step`, `{ key, label }`, so a step listed in
  `exposedSteps` is recognised by `step.step.key`; the line's `id` and `entity_id` are what the claim and step calls take), and works on one through
  `GET` and `POST …/records/{record_id}/step` and `…/step/submit`.
- A group with no active person leaves the task nobody can take: keep the group's members up to date.

A step whose only candidates are dynamic (the initiator, a field of the record, a manager) can resolve to
nobody, so give each such candidate a static `fallback`, as the example above does with a group parameter.
Without one the build passes and the install is refused with `human.assignee_fallback_required`.

**A task that ends when the record changes**, with `endWhen`. A Human step may declare a condition over the run's
record; when it holds, the step settles with no one pressing an action. This is the second way to let something
outside the run finish the task, beside `work` on the entity (`work.md`):

```js
node("review", "Review", "human", {
  assignment,
  actions,
  endWhen: {
    condition: { in: [{ var: "subject.record.status" }, ["done", "cancelled"]] },
    label: "No longer needed",
    then: { kind: "branch", edgeIds: ["e_ended"] },
  },
})
```

- **`condition`** is written like a Decision's (the same operators and rules), and every `var` is
  `subject.record.<field>`, a field of the run's own record. A path through a reference, `id` or `metadata`, and any
  other namespace, are refused. The run needs a record subject, and a workflow about a set of records is refused.
  A step inside a For each body cannot declare one: the body's run is about the item, or nothing, not the workflow's
  record.
- **`label`** is the outcome the task records. It defaults to `Ended`.
- **`then`** is one of two kinds. `{ kind: "action", actionId }` takes one of the step's actions, and what follows
  reads as if the person had picked it. `{ kind: "branch", edgeIds }` takes edges of its own that no action owns, and
  what follows reads `output.action == "__condition_met"`. A step with `signing` takes only a branch: an action
  there would follow the signed outcome with no signature.
- **When it is checked.** When the step opens, and again after every change to the record. A condition already true
  when the step opens settles it at once: no task is created and nobody is told. Otherwise the task opens as usual,
  and a later change that makes the condition true ends it, tells the holder (or the candidates while nobody holds
  it) that the task ended because its record changed, and clears the holder's draft. A submit, a deadline's advance
  and a condition race for the step, and one wins. A signed step is never ended by a condition.
- **A field the run cannot read reads as null**, as in a Decision, so write a condition that is false on null. An
  app that is paused leaves the step open, and the next change to the record after it resumes checks again.
- **The two choices.** `work` on the entity makes the record itself the task, so any write to its status ends the
  work, and a workflow can read who holds it; its outcome is the record's status. `endWhen` keeps the Human step and
  its actions, so the run's edges follow the action or the branch, and the condition is frozen when the step opens;
  a workflow cannot read who holds the task.
- **A condition that cannot work is refused at publish and at install** with `human.end_when_invalid`, naming
  `endWhen`, `endWhen.condition` or `endWhen.then`: no record subject, a set subject, a step inside a For each body,
  a path that is not `subject.record.<field>`, a condition that reads no field, an action the step lacks, an action on
  a step with `signing`, a branch with no edges, an edge that does not leave the step, or an edge an action already
  owns. A field the record's entity lacks is refused as `subject.record_path_unknown`.

**A deadline on the task**, with `sla` and `escalation`. `sla.deadline` is how long after the task opens it is due,
and `escalation.levels` say what happens around then: reminders, and at most one timeout that ends the task.

```js
node("review", "Review", "human", {
  assignment,
  actions,
  sla: { deadline: { value: 3, unit: "business_days" } },
  escalation: { levels: [
    { at: { kind: "pctOfDeadline", pct: 50 }, action: { kind: "notifyAssignees" } },
    { at: { kind: "afterDue", duration: { value: 1, unit: "business_days" } }, interrupting: true,
      action: { kind: "autoAdvance", target: { kind: "timeoutBranch", edgeIds: ["e_late"] } } },
  ] },
})
```

- **`unit`** is `minutes`, `hours`, `days`, `business_hours` or `business_days`; the business units follow the
  organization's business calendar (`work.md`, "Business time"). The deadline's `value` is above 0.
- **`at`** is `{ kind: "onDue" }`, `{ kind: "afterDue", duration }`, `{ kind: "beforeDue", duration }` or
  `{ kind: "pctOfDeadline", pct }` (1 to 100 percent of the time from open to due).
- **A reminder** is a level without `interrupting`, `{ kind: "notifyAssignees" }`: it tells whoever holds the task,
  or everyone it is offered to while nobody does, and the task stays open.
- **The timeout** is the one level with `interrupting: true`. It is `autoAdvance`, at `onDue` or `afterDue`. It ends
  the task, tells its holder (or its candidates) that the deadline ended it, and moves the run on:
  `{ kind: "action", actionId }` takes one of the step's actions, and what follows reads as if the person had picked
  it; `{ kind: "timeoutBranch", edgeIds }` takes edges of its own that no action owns, and what follows reads
  `output.action == "__sla_timeout"`. `merge` counts a timeout branch's edges as the step's own.
- **A signed task is never ended by its deadline.** On a Human step with `signing`, an `action` target must not be
  the signed action: publish refuses it when `signedAction` names it (`human.escalation_invalid`), but not the one
  action of a step that has only one, which is its signed action too. Target another action, or a timeout branch so
  the next step can tell a timeout from a person's choice. The timeout is then how the run moves on when nobody
  signs, or when the envelope failed and the holder never signed again (`signing.md`).
- A Signature step has no deadline; only a Human step does. Escalation needs `sla`. A broken ladder is
  `human.escalation_invalid` and a deadline of 0 `human.sla_invalid`, both at install: `build` and `lint` do not
  check them.

### Decisions

`decision("is_done", "Done?", [when("e_done", { "==": [{ var: "nodes.task.output.record.status" }, "done"] }), otherwise("e_not_done")])`.
A condition may use only `==`, `!=`, `<`, `<=`, `>`, `>=`, `!!` and `!`, must compare a `var`, and may never
compare two vars: copy one into a variable with `setvar` first.

### Code steps

`code("check", "Check the sender", "code/check-sender.js", inputs, outputSchema)` reads
`config/code/<name>.js`, relative to `config/`. The file defines `main(inputs)` and returns an object that
matches `outputSchema`:

```js
// config/code/check-sender.js
function main(inputs) {
  const sender = String(inputs.sender || "").trim().toLowerCase();
  if (sender === "") return { allowed: false, reason: "no_sender" };
  return { allowed: sender.endsWith("@example.com"), reason: "domain" };
}
```

A hand-written Code node's `parameters.source` must be `{ "$file": "code/<name>.js" }`.

Inputs are strict:

- Reading an input the step does not declare throws `CodeInputError: no input named 'x'. Declared inputs on this
  step: …`, and the step fails with `CODE_EXECUTION_FAILED`. `build` refuses such a read first (`BUILD_REFUSED`:
  `code/<file> reads x, which the step does not declare`): `inputs.x`, `inputs["x"]`, `inputs.get("x")`, and in
  JavaScript a destructuring of `inputs` or of `main`'s parameter. A file several steps share reads a name only one
  of them declares after asking `"x" in inputs`, which the check accepts. It matches patterns, so a computed name
  (`inputs[key]`) or a copy of `inputs` under another name still fails only at run time.
- Every declared input is present. One whose reference resolves to nothing arrives as `null`, so test the value, not
  whether the input exists. Where you do ask, `"x" in inputs` answers in both languages. In a Python step (a Code
  node not made by `code()`, which writes JavaScript), `inputs.get("x")` and `hasattr(inputs, "x")` raise for an
  undeclared name, as reading it does. (An AgentFlow build from before 2026-10-30 raises on Python's `in` too: use
  `"x" in list(inputs)` there.)
- `lit(null)` reaches the code as `null` and `lit("")` as an empty string. An input bound to nothing is refused at
  publish (`code.input_unbound`). (An AgentFlow build from before 2026-10-31 refuses `lit(null)` too, and an SDK
  before this release refuses `lit("")`: pass `lit([])`, `lit({})`, `lit(false)` or `lit(0)` there.)
- A `tpl(...)` input renders like any template, `content(...)` included ("A file's text"); a `lit(...)` input is
  passed as written.

### Email steps

An email step's `parameters.email.connection` is `{ provider: "resend", externalAccountId: "${param:<connection_ref>}" }`.
Define it once as a constant in a module of your own and import it into each workflow that sends.

### Integration steps

An integration step's `parameters.connection` is `"${param:<connection_ref>}"`, and the step carries no `provider` or
`externalAccountId`: the builder refuses both, because the installer writes them from the connection the admin
chooses. Declare `category` (`crm` or `erp`) on that parameter. Setup then offers only connections of that kind,
and refuses one that does not offer the step's object, operation or fields. The builder refuses a step bound to a
parameter with no `category`.

### Agent steps that recall memory

An `agent` step that names an agent can carry a `memory` block, and a package may ship it: it names record
paths, not memory types, so nothing in it is another organization's. An agent step with a block:

```js
const REPLY_SCHEMA = { type: "object", properties: { reply: { type: "string" } }, required: ["reply"] };
const PROMPT = "Draft a reply to {{ subject.record.title }}.";

node("draft", "Draft the reply", "agent", {
  agentRef: { agentId: "${agent:assistant}" },
  conversation: { thread: "{{ subject.record_id }}", window: 30 },
  memory: { about: ["{{ subject.record.requester.id }}"], hops: 2, maxNodes: 40 },
  promptTemplate: PROMPT,
  outputSchema: REPLY_SCHEMA,
}),
```

- Before the model starts, memory about these records (and, for a `conversation` step, the thread record)
  opens the user message. Pinned policies are recalled even without the block.
- Each `about` entry names a record **id**: `{{ subject.record.requester.id }}`, not
  `{{ subject.record.requester }}`, which publish refuses. `{{ subject.record.watchers.id }}` names every
  record of a multi-reference field. At most 10 entries, none blank.
- `hops` is 0 to 2 (default 2) and `maxNodes` 1 to 100 (default 40); leave both out for the defaults. Any
  other member is refused (`agent.memory_invalid`), and so is a block on a step without `agentRef`
  (`agent.memory_needs_agent`). These are checked when AgentFlow publishes the workflow, at install: `build` and
  `lint` pass a block that breaks them, and the install plan reports it as a finding on the workflow, such as
  `agent.memory_invalid on workflow:draft_reply at draft.memory.hops` (a Learn step is the same: `memory.md`).
- The agent reads memory through its `read_limit.memory_types`: installing grants the agent each listed type,
  so an installed step recalls what those types hold, as far as the agent may read **and list** the records
  each item is about and was learned from: give those entities both operations in `read_limit.entities`.
  An agent whose limit lists no type recalls nothing, and publish only warns (`agent.memory_no_types`). An
  admin who removes a type from the agent keeps it removed on upgrade. See `memory.md`.

### Agent steps that read a conversation

`conversation: { thread, window }` on an Agent step sends the thread's messages to the model ahead of the prompt,
each as a turn of its author's speaker (`user` or `assistant`). The thread's entity declares the conversation
(`entities.md`).

- `thread` names the thread record: `{{ subject.record_id }}` when the run is about the thread, or
  `{{ subject.record.<field> }}` when it is about a record whose single reference field points at the thread (a
  message, say). A field that reaches no entity with a conversation is refused at install
  (`agent.conversation_unavailable`).
- `window` is 1 to 200, default 30: the newest messages the model is shown, counted after drafts, `exclude`
  authors and messages with neither text nor a file are left out.
- The prompt may be `""`; the newest message is then what the agent answers. When that message is the agent's own
  reply, the step fails with `AGENT_CONVERSATION_EMPTY` before any model call: give the step a prompt, or start it
  only on a message from the other side.
- A message saved from one of the agent's earlier turns brings back that turn's tool calls, so the agent remembers
  what it looked up.
- Files on a message go with its turn; images go only on `user` turns.

### Saving from an agent's answer: the conversation check

A step that saves an agent's answer as a message can check it against what the agent read, so an answer is not
saved into a conversation that moved on while the model ran. On `update`, write `check: { step: "<agent step id>" }`;
a create or an upsert carries it as `conversationCheck` on the node:

```js
node("save", "Save the answer", "entity_record", {
  operation: "upsert", entityId: "${entity:message}", matchBy: "key", matchKey: "key",
  conversationCheck: { step: "answer" },
  body: [bind("body", ref("nodes.answer.output.reply"))],
}),
```

The write skips, writing nothing, when the thread or the record moved on since the agent's turn:
`nodes.save.output.skipped` is `true`, and `skip_reason` is `superseded` (a message joined the thread), `edited`
(the record being saved changed) or `changed` (an `expect` no longer held). Branch on `skipped`.

A later workflow with no Agent step of its own that acts on the saved message (sending it, say) writes
`check: { linked: true }` on its update: it checks the turn the message was saved from, and skips as `superseded`
when a message joined the thread since. With an `expect` on a field the update changes
(`expect: { fields: { status: "draft" } }`), two runs cannot both act on the message.

The checked step writes one record of the conversation's messages entity, on that thread, and the named Agent step
has run earlier in the same run; otherwise the step fails with `ENTITY_RECORD_CONVERSATION_CHECK_UNRESOLVED`.

### A file's text

A step's templates can read the text of a file the run holds, with `{{ content(<file>) }}` or
`{{ <file> | content }}` (the two are the same). A file reads as an object in a template, so
`{{ subject.record.contract.name }}` is its name and `.mime_type`, `.byte_size` and `.id` work too;
`content(...)` is its text.

```js
update("keep_text", "Keep the contract's text", CONTRACT, "subject.record_id", [
  bind("contract_text", tpl("{{ content(subject.record.contract) }}")),
]),
```

An email step's body takes the same template: `"{{ subject.record.contract.name }}:\n{{ subject.record.contract | content }}"`.

- **Where it works**: the templates a step renders inside the run. These are an email's addresses, subject and
  body, a webhook's URL and body, and a Document step's file name and field mapping. They also cover the values of
  Set Variable, record, relationship, integration, SQL and Call steps, a Code step's `tpl(...)` inputs, a Human or
  Signature task's name and
  description, an Auto Number's scope and code, and the End step's outputs. An Agent step's prompt reads files its
  own way and also accepts `content(...)`.
- **Where publish refuses it**:
  - a field that does not read text, such as a Decision's condition, a name or key beside a value, a record id, a
    timestamp, a signing step's documents (a Signature step's, or a Human step's `signing`, their `doc.template`
    field mapping included: a job renders them after the step), an agent's system prompt, memory's `about` or a
    Human review document's field mapping (`reference.content_not_available`). To sign a file's text, read it in a
    Document step and sign that step's PDF (`signing.md`, "A file a person uploaded");
  - an argument that is not a file, such as `content("abc")` or a text field (`reference.content_not_a_file`);
  - any step of an all-or-nothing workflow (`atomic.file_content`). Read the text in a workflow that calls it and
    pass it in.
  
  `build` and `lint` do not check these. The install plan reports them on the workflow, like the other publish
  checks.
- **The step waits, then runs again from the start.** The first `content()` whose text is not ready stops the
  step, nothing is sent or written, and the run waits while the file is read. Then the step renders again from
  the beginning, so a branch is never taken on missing text. `content(<list>)` over a whole file field or folder
  reads every file in one batch and joins the texts in order. A `{% for f in files %}{{ content(f) }}{% endfor %}`
  loop waits once per file, unless a line before it reads the list: `{% set _ = content(files) %}`.
- **An empty file field reads as empty text**, at once, with no wait: `content()` of a field with no file is
  `""`. A step started by a `created` trigger sees the files the record was created with; a file attached later
  is read only by a step that runs after it.
- **In an Agent step's prompt**, a bare `{{ subject.record.document }}` already renders the file's text, as
  `content(...)` does, and `{{ subject.record.document[0].name }}` its name. An image (PNG, JPEG, GIF or WebP, by
  default up to 5 MiB and 10 a step) is sent to the model as a picture beside the prompt, which reads
  `see the attached image` in its place: the model reads any text in the picture itself, with no OCR. Another image
  type (TIFF, SVG), an image over a limit, or a provider that cannot send images fails the step. A field with no
  file renders empty. An agent's `read_limit` does not judge
  the files themselves: the run's own access decides whether a file is read, and the limit needs `read` on the
  record's entity so the step can hand the agent the record.
- **A file that cannot be read fails the step, with no effect.** Outside an Agent step's prompt this covers an
  image, a type with no parser, a file over the limit, or a file the run may no longer read. The codes are
  `FILE_CONTENT_FAILED` or `FILE_NO_LONGER_READABLE`, and no error strategy turns the second into a skip.
- **Limits.** By default a file may hold 1 MiB of text, and one step 8 MiB and 200 files
  (`CONTENT_BUDGET_EXCEEDED`, `CONTENT_FILES_EXCEEDED`). A step's `settings.content_max_bytes` raises its own
  byte limit, up to 32 MiB. Text is never truncated.

### Parameters inside text

A reference must be a whole string, so a template cannot hold `${param:…}`. Read the parameter into a
variable with a first step, `readParameters("inbound_domain", "company_name")`, and use
`{{ vars.inbound_domain }}` in the template.

### Calling another workflow: `call`

`call(id, name, "${workflow:<key>}", subjectSource?, inputs?, settings?)` starts one run of another workflow of the
package, the callee, and waits for it to end. The callee comes earlier in `ORDER`.

```js
call("signing", "Have the contract signed", "${workflow:sign_contract}", "subject.record_id",
  [["reason", ref("input.reason")]]),
```

- **The callee's Start decides what its run is about.** With `start({ subject: "${entity:contract}" })` the callee's
  run is about one contract, and `subjectSource` names it: a path, as a string, that reads that record's id in the
  caller's run. `"subject.record_id"` is the caller's own record; a reference field, `"subject.record.contract"`, is
  the record it points at; `"nodes.<id>.output.record.id"` is a record an earlier step read or wrote; `"input.<name>"`
  is an id in the caller's input. Leave it out (pass `undefined`) and the callee takes the caller's own subject when
  that is a record of the callee's entity. A callee whose Start names no subject (`start()` or
  `start({ params: true })`) runs about nothing, whatever `subjectSource` says, so it can hold no Notify step.
- **`subjectSource` is never an object or a list.** The builder refuses any other shape (`call step <id>`). At run
  time the Call step fails when the path reads no record id, when the record is of another entity, or when it is left
  out and the caller is about something else (`… set subjectSource`).
- **`inputs`** are `[input, binding]` pairs, each the callee's `input.<input>`. Every input the callee's
  `inputSchema` requires must be mapped, or publish refuses the caller.
- **What the caller reads back** is the callee's End outputs, `nodes.<id>.output.<name>`, for the End that finished
  it: `end("done_signed", "Signed", "signed", { result: lit("signed") })` is read as `nodes.signing.output.result`.
- **A callee that fails or is cancelled fails the Call step**, after its own steps have had their retries. With
  `continue` on the Call step (its sixth argument, `{ error_handling: { strategy: "continue" } }`), the caller goes on
  with the stand-in, which reads as empty: "When a step fails", below. The stand-in also follows the Call step's own
  failures, before or after the callee ran, so a step after it should read what the callee wrote, such as the
  record, rather than the Call step's output. `signing.md`, "When the envelope fails", does this to route a signing
  failure and a decline together.
- **A callee with a trigger cannot be called once the trigger is on** (`SUBWORKFLOW_TARGET_INELIGIBLE`), and an
  archived one never. The callee runs as its own `runAs` (Who a workflow runs as), with the caller's principal as its
  initiator.

### When a step fails: an error strategy

A step that fails ends the run, unless its `settings` (the fifth argument of `node(...)`) hold an error strategy.
Without one, a transient failure (a service that does not answer, a database conflict) is first retried, and the run
fails only when it keeps failing. There is no failure edge: a step set to `continue` ends with a stand-in output and the run goes on along the step's
outbound edges, so a Decision right after it tells the two apart by a value only the real output carries:

```js
node("render", "Render the contract", "document", { documents: [/* … */] },
  { error_handling: { strategy: "continue" } }),
decision("rendered", "Rendered?", [
  when("e_rendered", { "!!": [{ var: "nodes.render.output.generated_files" }] }),
  otherwise("e_not_rendered"),
]),
```

- `strategy` is `fail` (the default) or `continue`. `default_output` sets the stand-in (`{ "error": true }` when
  left out), but in an installed app's run the stand-in reads as empty (`pitfalls.md`), so test the real output, as
  above, never the stand-in.
- `continue` does not wait for those retries. The first failure, transient or not, takes the stand-in. So the branch
  after it means "this step did not produce its output", never "the person refused" or "the file has no text". Write
  nothing on it that says more, such as a status `declined`.
- `continue` takes **every** outbound edge of the step. Use it on a step with one outbound edge.
- A refusal of access is never continued: a file the run may no longer read (`FILE_NO_LONGER_READABLE`), a ceiling,
  grant or field that refuses the step, or a paused app stops the run as it would without a strategy.
  `FILE_CONTENT_FAILED`, a step's own failure, is continued.
- `signature(...)` takes no settings: spread it, `{ ...signature("sign", "Sign", { … }), settings: { error_handling: { strategy: "continue" } } }`,
  and read `signing.md`, "When the envelope fails", first.

## What `merge` checks

Unique node and edge ids; every edge joins two nodes of the graph; an End has no outbound edge; a plain
step has exactly one; a Signature step with a decline route owns the route's edge and has exactly one more, the
signed path; a Decision or Human step owns exactly the edges its branches or actions name (a Human
step's `endWhen` branch, `signing` decline route and deadline's timeout branch included; an edge an action owns may not also be the route's,
and an `{ action }` route adds no edge);
everything is reachable from `start`; no loops (a For Each body is checked as a graph of its own). The
refusals name the workflow and the step: `open_case: case (entity_record) has 0 outbound edges`,
`loop through a -> b`, `unreachable x`, `d owns e2,e3 but has e2`.

## Triggers

`export const triggers = { <name>: { workflow, kind, enabled?, config } }`. `workflow` is a workflow `key`.

- **A workflow has at most one trigger.** Two triggers naming one workflow build, and the install fails
  (`APP_STEP_FAILED on trigger:<key>`). To start the same steps two ways, make one workflow per trigger from
  one helper: a function in `config/build/` that returns the workflow for what differs (its key, the condition it
  checks), called once per trigger.
- **A trigger always ships off.** The output has `enabled: false` whatever you write; an admin turns it on
  after installing. A trigger added in an upgrade also lands off, so tell installers which new triggers to
  turn on.
- **A workflow's write fires triggers too.** A record a step creates or updates fires the entity's triggers as a
  person's write does, so one workflow's `update` (a status moved to `awaiting_signature`) starts another workflow
  whose trigger matches it, as that workflow's service principal. Each run a trigger starts is one level deeper
  than the write that started it, and AgentFlow stops a chain past ten levels by default (the deployment's operator
  can change it) rather than loop: a trigger that
  matches its own workflow's writes needs a filter that stops it.
- `kind: "entity_record"`: `config` has `entity_id` (`${entity:…}`), `change_kind` (`created`, `updated`), a
  `filter`, `input_mappings` and, only to group events, `group` (below). Every mapping's `from` starts with `event.`: a field is `event.<field>`, a
  value before the change is `event.event.previous.<field>`, and the run reads it as `input.<to>`. A `filter`
  reads the changed fields as `event.changed` and a value before the change as `event.previous.<field>`; this
  one runs when an item's status enters or leaves `done`:

  ```js
  config: {
    entity_id: "${entity:item}", change_kind: "updated", input_mappings: [],
    filter: { and: [
      { in: ["status", { var: "event.changed" }] },
      { or: [{ "==": [{ var: "status" }, "done"] }, { "==": [{ var: "event.previous.status" }, "done"] }] },
    ] },
  },
  ```

  "A status becomes X" is the filter that names the field among the changed ones and tests the new value; this one
  starts a run when a request enters `submitted`:

  ```js
  filter: { and: [
    { in: ["status", { var: "event.changed" }] },
    { "==": [{ var: "status" }, "submitted"] },
  ] },
  ```

  **The record the event is about is always the run's `subject`**, with no mapping: `start({ subject: "${entity:x}" })`
  on the trigger's entity reads it as `subject.record_id` (and `subject.record.<field>`). Leave `input_mappings` empty
  when the run needs nothing else; map only extra values (`input.<to>`).

  **What the run knows about the write.** Every run a record trigger starts, grouped or not, carries `trigger.*`,
  metadata about the change: `trigger.record_id`, `trigger.entity_id`, `trigger.entity_key`, `trigger.change_kind`,
  `trigger.changed` (the names of the changed fields, never their values), `trigger.occurred_at` and
  `trigger.actor_user_id`, the person whose write fired it. A write by a person, or by a workflow that runs as its
  initiator, names that person; a write by a workflow that runs as a service principal, or made with a service key,
  names nobody. A Notify step's actor is read from it (`notifications.md`, "Who is the actor"). The values before
  the change are not there: map them (`event.event.previous.<field>`).

  **`group`** runs one run at a time per key instead of one run per event. `group: { by: { kind: "record" } }` keys
  by the record; `{ kind: "field", field: "<key>" }` by a field's value (a reference, plain text (not rich text),
  choice, number or auto-number field that is not `sensitive`). Events for a key that arrive while its run works wait, and when the run
  ends the next run takes up to `max_batch` of them (1 to 200, default 50) as one batch; `linger_ms` (0 to 10000)
  makes an idle key wait that long for company before its run starts. A batch's run is about the newest event's
  record, its `trigger.*` and `input.*` describe the newest event, and `trigger.events`, `trigger.batch_size` and
  `input.events` carry the whole batch, oldest first. An event whose key is blank runs on its own. A grouped workflow
  may not wait on people (a Human or Signature step, or a Call into a workflow that has one) unless the group sets
  `hold_while_waiting: true`, which keeps the key through the wait: `lint` reports `group_hold_missing`, and the
  install refuses it with `trigger.group_waiting_step`.
- `kind: "schedule"`: `config` has `cron`, `timezone` and `input_template` (for example `"0 6 * * *"` with
  `"${param:timezone}"`).
- `kind: "connected_app"`: `config.provider` must be `"resend"` and `config.external_account_id` a
  `${param:…}`; without it the trigger is refused (`a connected_app trigger names no external_account_id`).
  It starts a run on each email the connection receives.

## Actions

A button on an entity's records that starts a workflow:
`export const actions = { <name>: { entity, action } }`. `entity` is an entity key; `action` has `workflow_id`
(`${workflow:…}`), `key` (required), `label`, `scope`, `mode`, `visible_when`, `input_map`, `tone`, `icon`.
A "Summarize" button on each row of an entity's list:

```js
export const actions = {
  summarize: { entity: "item", action: {
    workflow_id: "${workflow:summarize_item}", label: "Summarize", key: "summarize",
    scope: "row", mode: "sync", input_map: [{ from: "record.id", to: "subject" }], icon: "sparkles" } },
};
```

## A worked example: only one group moves the status

A loan desk: anyone in `app_users` asks to borrow equipment; **only `it_group` decides**, and nobody else may move
a loan out of `requested`, by workflow or by editing the record. This is the whole design; the files are an
excerpt of a package that builds and lints clean.

1. **The movers are the rule.** A stage model says who may move the status (`rules-and-stages.md`), judged on
   whoever writes. Here the only mover is the automation group, so no person can move a loan, whatever
   grants they hold.
2. **The decision is a Human step assigned to `it_group`.** Only its members can claim and complete it.
3. **The workflow that records the decision runs as the service principal**, which is in the automation group and so
   passes the mover. It is started by a **trigger**, not by people (`lint` would refuse a people-started workflow
   that runs as a service principal). People only create the loan record; they hold `create` and a read of their
   own loans, and no `update`.

Parameters (`package-manifest.json`; `requires.permissions` lists the groups whose members are people who sign in:
`app_users` and `it_group`, never the automation group):

```json config
{ "parameters": [
  { "key": "app_users", "type": "group_ref", "required": true, "label": "Loan desk users",
    "help": "Everyone who asks to borrow equipment. Give its members a role with entity.read, entity.list and entity.write." },
  { "key": "it_group", "type": "group_ref", "required": true, "label": "IT",
    "help": "The people who approve or decline loans. Give them the same role as Loan desk users." },
  { "key": "automation_principal", "type": "service_principal_ref", "required": true, "label": "Automation principal",
    "help": "The service principal the decision workflow runs as. Give it a role with entity.read, entity.list and entity.write, add it to the automation group, and issue it no credential." },
  { "key": "automation_group", "type": "group_ref", "required": true, "label": "Automation group",
    "help": "Holds the automation principal and one dedicated account that never signs in (setup needs a person in a group), and no one else: its members may move any loan." }
] }
```

The loan entity file, first its fields, display field, a view and its create form (the equipment entity is a
plain one with a `name`; formats are as in `entities.md`):

```json config
{
  "key": "loan", "name": "Loan", "icon": "package", "accent": "sky",
  "fields": [
    { "key": "number", "label": "Number", "type": "auto_number",
      "auto_number_scope": "loan:{{ year() }}", "auto_number_format": "LN-{{ year() }}-{{ value | pad(4) }}" },
    { "key": "item", "label": "Item", "type": "reference", "target_entity_id": "${entity:equipment}", "required": true },
    { "key": "due_date", "label": "Due date", "type": "date" },
    { "key": "status", "label": "Status", "type": "enum", "facetable": true,
      "enum_values": [ { "value": "requested", "label": "Requested", "color": "sky" },
                       { "value": "approved", "label": "Approved", "color": "emerald" },
                       { "value": "declined", "label": "Declined", "color": "rose" } ],
      "default": { "kind": "literal", "value": "requested" } },
    { "key": "borrower", "label": "Borrower", "type": "reference", "target_entity_id": "ffffffff-0000-0000-0000-000000000001",
      "default": { "kind": "creator" } }
  ],
  "natural_key": [], "display_field": "number",
  "views": [ { "key": "all", "name": "Loans", "columns": ["number", "item", "due_date", "status", "borrower"] } ],
  "create_form": { "name": "Loan", "schema": { "type": "object", "properties": {
    "item": { "type": "string", "format": "entity", "x-entity": "equipment", "x-entityField": "item" },
    "due_date": { "type": "string", "format": "date", "x-entityField": "due_date" } } } }
}
```

The same file's `access` and `stage_model`, the parts that decide who may do what:

```json config
{
  "access": { "mode": "restricted", "grants": [
    { "principal": { "kind": "group", "id": "${param:app_users}" }, "design": false, "operations": [
      { "operation": "create", "scope": "organization" },
      { "operation": "read", "record_scopes": [{ "kind": "field", "field": "borrower" }] },
      { "operation": "list", "record_scopes": [{ "kind": "field", "field": "borrower" }] } ] },
    { "principal": { "kind": "group", "id": "${param:it_group}" }, "design": false, "operations": [
      { "operation": "read", "scope": "organization" }, { "operation": "list", "scope": "organization" } ] },
    { "principal": { "kind": "group", "id": "${param:automation_group}" }, "design": false, "operations": [
      { "operation": "read", "scope": "organization" }, { "operation": "list", "scope": "organization" },
      { "operation": "update", "scope": "organization" } ] } ] },
  "stage_model": { "status_field": "status", "initial_statuses": ["requested"], "transitions": [
    { "from": "requested", "to": "approved", "required_fields": [], "movers": [{ "kind": "in_group", "group_id": "${param:automation_group}" }] },
    { "from": "requested", "to": "declined", "required_fields": [], "movers": [{ "kind": "in_group", "group_id": "${param:automation_group}" }] }
  ] }
}
```

(`borrower` is a reference to Users with `"default": { "kind": "creator" }`, so each loan names the person who
created it, and the record scope above lets them read it. A loan made with a service key has no creator, so
`borrower` stays empty and that scope matches nobody: `entities.md`, `default`.) The workflow module, in `config/build/`:

```js
import {
  NOBODY, bind, edges, end, graph, lit, node, servicePrincipal, start, update, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const LOAN = "${entity:loan}";

export const workflows = {
  decide_loan: workflow(
    "decide_loan", "Decide a loan",
    "Asks IT to approve or decline a new loan request, then records the decision.",
    servicePrincipal("automation_principal"), NOBODY,
    graph("Decide a loan", [
      start({ subject: LOAN }),
      node("decision", "IT decides", "human", {
        assignment: { candidates: [{ kind: "group", id: "${param:it_group}" }] },
        actions: [
          { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
          { id: "decline", label: "Decline", edgeIds: ["e_decline"] },
        ],
      }),
      update("approved", "Mark approved", LOAN, "subject.record_id", [bind("status", lit("approved"))]),
      update("declined", "Mark declined", LOAN, "subject.record_id", [bind("status", lit("declined"))]),
      end("done_approved", "Approved", "approved"),
      end("done_declined", "Declined", "declined"),
    ], edges(
      ["e_start", "start", "decision"],
      ["e_approve", "decision", "approved"], ["e_decline", "decision", "declined"],
      ["e_approved", "approved", "done_approved"], ["e_declined", "declined", "done_declined"],
    )),
  ),
};

// No input_mappings: the trigger itself hands the new loan to the run as `subject`.
export const triggers = {
  decide_loan: {
    workflow: "decide_loan",
    kind: "entity_record",
    config: { entity_id: LOAN, change_kind: "created", filter: {}, input_mappings: [] },
  },
};

export const actions = {};
```

and `agentflow.app.mjs`:

```js
export default defineApp({
  sections: merge([decideLoan], ["decide_loan"]),
  exposedSteps: { decide_loan: ["decision"] },
});
```

What happens: a person creates a loan (status `requested`); the trigger starts `decide_loan` on that record; the
task appears in My Work for every active member of IT; one claims it and presses Approve or Decline; the
workflow, as the service principal, moves the status. A person cannot edit a loan at all (no `update`: 403), and
anyone who is later given `update` still cannot move the status: 422 `STAGE_TRANSITION_NOT_ALLOWED`, which names the
group. Tell installers to **turn the trigger on** after installing:
a trigger always ships off.

If IT should also be able to move a loan by hand, add `{ "kind": "in_group", "group_id": "${param:it_group}" }` to
each mover list **beside** the automation group's, and give `it_group` `update`. A person group may be a mover
alongside the automation group: movers are alternatives, and whoever passes any one makes the move. Keep the
automation group in every transition the workflow's update step makes, because a run's write is judged like a
person's, on the service principal, which passes only `in_group`; without it that step fails with
`STAGE_TRANSITION_NOT_ALLOWED`. (A transition with no movers lets anyone who may update the record make the move, the
workflow included, so there is nothing to list; the point of the model above is that it names who may.) A person
in `it_group` who edits `status` in the record then passes the mover and, holding `update`, the move is made; a
person who holds `update` but is in neither group is refused with 422 `STAGE_TRANSITION_NOT_ALLOWED`; anyone without `update`, a mover-group member included, is refused with 403.

## Limits to design around

- A workflow replaces a list field, appends to it, or removes items from it by id. Append and remove are for an
  `update` step on a `list` field only: `{ ...bind("checklist", tpl("{{ subject.record.checklist[0].id }}")),
  listMode: "remove" }` (or `listMode: "append"` with one item or an array of items). A remove's value is one item
  id or an array of them, and an item stands for its `id`; `null` or `[]` removes nothing and an id already gone is
  not an error. In one step a replace of the field comes first, then the removes, then the appends. Remove needs an
  AgentFlow release that has it on the API, the workers and the frontend: an older build refuses the package, and
  an older designer saves the step as a replace, so name that release in the `changelog`.
- A workflow reads a record's rollups as fields, shown as is. Its run-as principal must be able to read every
  entity a formula of the record reads through: otherwise the whole record is withheld from its decisions,
  which take the default branch, for a get step and for trigger input alike. Grant that principal's group
  read on those entities (an automation group reads `tag` for a formula through `item.tag`). A workflow that acts on a status
  should read the record and decide on the status it has when it runs, not on the change that started it, so
  a run that lands late still leaves the record right (a `freeze_on_close` and an `unfreeze_on_reopen` that
  both read the team before they act). An AgentFlow release before rollups were read as fields withheld any record with a
  rollup, so a package that reads one names the release it needs in its changelog.
- A workflow a trigger starts runs as a service principal, which passes only `in_group` in rules and movers: see
  Who a workflow runs as, and `rules-and-stages.md`.
- A package can carry a Learn step (`node_type: "learn"`). It learns the package's own memory types and
  relationships, written `${memory_type:<key>}` and `${memory_relationship:<key>}` in `learn.types` and
  `learn.relationships`, and it uses the package's own agent, whose `read_limit` covers what the step reads
  including each type it learns. See `memory.md`.
