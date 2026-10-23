# Workflows, triggers and actions

These are written in code, in modules under `config/build/`, because a graph is easier to build from
functions than to type as JSON. Each module exports `workflows`, `triggers` and `actions` (an empty `{}`
where it has none), and `agentflow.app.mjs` combines them.

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

The support desk's `agentflow.app.mjs` has 15 workflows in `ORDER`, `entityOrder` and `exposedSteps`.

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
  read as `subject.record_id` (Projects' `config/build/stamp-completion.mjs`).

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
  `transaction` for an all-or-nothing run (the support desk's `config/build/send.mjs`).
- **Steps**: `node(id, name, nodeType, params?, settings?)` for any step; `start({ subject?, params? })`;
  `end(id, name, outcome?, outputs?)`; `decision(id, name, branches)` with `when(edge, condition)` and
  `otherwise(edge)`; `setvar(id, name, [[target, binding]])`; `readParameters(...names)`;
  `call(id, name, workflow, subjectSource?, inputs?, settings?)`; `code(id, name, file, inputs, outputSchema)`.
- **Records**: `getById(id, name, entity, idPath)`; `search(id, name, entity, filters, { sort?, dir?, limit? })`
  with `flt(field, op, value)`; `create(id, name, entity, body)`; `update(id, name, entity, idPath, body)`;
  `updateMany(id, name, entity, filters, body)`; `upsert(id, name, entity, matchKey, body)`.
- **Values**: `ref(path)` reads a value (`input.summary`, `nodes.case.output.record.id`, `subject.record_id`,
  `workflow.requester.id`); `tpl(template)` renders one (`"{{ today() }}"`); `lit(value)` is a literal;
  `bind(field, value)` sets a field in a record step's body.
- **Constants**: `INITIATOR`, `NOBODY`, and `NOW` (the template `{{ now() }}`).

Where each is used: Projects' `config/build/stamp-completion.mjs` (`getById`, `decision`, `update`, `NOW`)
and `config/build/freeze-on-close.mjs` (`updateMany`); the support desk's `config/build/intake.mjs` (`code`,
`setvar`), `config/build/close-idle.mjs` (`search`, a For Each step) and `config/build/held.mjs` (`call`).

### Human steps

A Human step is `node(id, name, "human", { assignment, actions })`. `assignment.candidates` takes the same
assignees as work routing (`work.md`); `{ type: "initiator" }` is the person who started the run. Each
action names the edge it takes with `edgeIds`. A packaged Human step has no task form of its own (the
builder builds only an entity's create form), so the decision is the action the person picks. List the
step in `exposedSteps` when something outside the workflow completes it.

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

### Decisions

`decision("is_done", "Done?", [when("e_done", { "==": [{ var: "nodes.task.output.record.status" }, "done"] }), otherwise("e_not_done")])`.
A condition may use only `==`, `!=`, `<`, `<=`, `>`, `>=`, `!!` and `!`, must compare a `var`, and may never
compare two vars: copy one into a variable with `setvar` first.

### Code steps

`code("candidates", "Read threading", "code/intake-candidates.js", inputs, outputSchema)` reads
`config/code/intake-candidates.js` (the support desk), relative to `config/`. The file defines
`main(inputs)` and returns an object that matches `outputSchema` (see `config/code/intake-participant.js`).
A hand-written Code node's `parameters.source` must be `{ "$file": "code/<name>.js" }`.

### Email steps

An email step's `parameters.email.connection` is `{ provider: "resend", externalAccountId: "${param:<connection_ref>}" }`
(the support desk's `config/build/lib.mjs` defines it as `CONNECTION`, and `config/build/send.mjs` uses it).

### Agent steps that recall memory

An `agent` step that names an agent can carry a `memory` block, and a package may ship it: it names record
paths, not memory types, so nothing in it is another organization's. The support desk's draft step
(`config/build/draft.mjs`) with a block added:

```js
// A simplified stand-in for the desk's schema in config/build/draft.mjs.
const SUPPORT_SCHEMA = { type: "object", properties: { reply: { type: "string" } }, required: ["reply"] };
const PROMPT = "Draft a reply to {{ subject.record.title }}.";

node("draft", "Draft the reply", "agent", {
  agentRef: { agentId: "${agent:support}" },
  conversation: { thread: "{{ subject.record_id }}", window: 30 },
  memory: { about: ["{{ subject.record.requester.id }}"], hops: 2, maxNodes: 40 },
  promptTemplate: PROMPT,
  outputSchema: SUPPORT_SCHEMA,
}),
```

- Before the model starts, memory about these records (and, for a `conversation` step, the thread record)
  opens the user message. Pinned policies are recalled even without the block.
- Each `about` entry names a record **id**: `{{ subject.record.requester.id }}`, not
  `{{ subject.record.requester }}`, which publish refuses. `{{ subject.record.watchers.id }}` names every
  record of a multi-reference field. At most 10 entries, none blank.
- `hops` is 0 to 2 (default 2) and `maxNodes` 1 to 100 (default 40); leave both out for the defaults. Any
  other member is refused (`agent.memory_invalid`), and so is a block on a step without `agentRef`
  (`agent.memory_needs_agent`).
- The agent reads memory only through grants on memory types, and a package cannot declare those yet. So an
  installed app's step recalls nothing until an admin grants the agent memory types on each type's Access
  tab; publish only warns (`agent.memory_no_types`), so the install is not refused. Say so in the app's
  install notes.

### Parameters inside text

A reference must be a whole string, so a template cannot hold `${param:…}`. Read the parameter into a
variable with a first step, `readParameters("inbound_domain", "company_name")`, and use
`{{ vars.inbound_domain }}` in the template (the support desk's `config/build/draft.mjs`).

## What `merge` checks

Unique node and edge ids; every edge joins two nodes of the graph; an End has no outbound edge; a plain
step has exactly one; a Decision or Human step owns exactly the edges its branches or actions name;
everything is reachable from `start`; no loops (a For Each body is checked as a graph of its own). The
refusals name the workflow and the step: `open_case: case (entity_record) has 0 outbound edges`,
`loop through a -> b`, `unreachable x`, `d owns e2,e3 but has e2`.

## Triggers

`export const triggers = { <name>: { workflow, kind, enabled?, config } }`. `workflow` is a workflow `key`.

- **A trigger always ships off.** The output has `enabled: false` whatever you write; an admin turns it on
  after installing. A trigger added in an upgrade also lands off, so tell installers which new triggers to
  turn on.
- `kind: "entity_record"`: `config` has `entity_id` (`${entity:…}`), `change_kind` (`created`, `updated`), a
  `filter` and `input_mappings`. Every mapping's `from` starts with `event.`: a field is `event.<field>`, a
  value before the change is `event.event.previous.<field>`, and the run reads it as `input.<to>`. Projects'
  `config/build/stamp-completion.mjs` runs on a task whose status enters or leaves `done`.
  **The record the event is about is always the run's `subject`**, with no mapping: `start({ subject: "${entity:x}" })`
  on the trigger's entity reads it as `subject.record_id` (and `subject.record.<field>`). Leave `input_mappings` empty
  when the run needs nothing else; map only extra values (`input.<to>`). A batch of grouped events starts one run
  whose subject is the newest event's record.
- `kind: "schedule"`: `config` has `cron`, `timezone` and `input_template` (the support desk's
  `config/build/close-idle.mjs`, `"0 6 * * *"` with `"${param:timezone}"`).
- `kind: "connected_app"`: `config.provider` must be `"resend"` and `config.external_account_id` a
  `${param:…}`; without it the trigger is refused (`a connected_app trigger names no external_account_id`).
  The support desk's `config/build/intake.mjs` starts on each received email.

## Actions

A button on an entity's records that starts a workflow:
`export const actions = { <name>: { entity, action } }`. `entity` is an entity key; `action` has `workflow_id`
(`${workflow:…}`), `key` (required), `label`, `scope`, `mode`, `visible_when`, `input_map`, `tone`, `icon`.
The support desk's "Generate reply" (`config/build/draft.mjs`):

```js
export const actions = {
  generate_reply: { entity: "ticket", action: {
    workflow_id: "${workflow:support_draft_reply}", label: "Generate reply", key: "generate_reply",
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

- A workflow can replace a list field or append to it, but not remove one item.
- A workflow must not read a record that has rollup fields: its decisions see none of the record's fields
  and take the default branch. This holds for a get step and for trigger input mapped from the record. Branch
  in the trigger's `filter` instead, which is evaluated before the run starts: one workflow per branch, each
  with its own trigger (Projects splits closing and reopening into `freeze_on_close` and
  `unfreeze_on_reopen`). A record id in a filter or a query is not affected.
- A workflow a trigger starts runs as a service principal, which passes only `in_group` in rules and movers: see
  Who a workflow runs as, and `rules-and-stages.md`.
- A package cannot carry a Learn step (`node_type: "learn"`) yet. It names memory types and relationships by
  id, and memory types are not package objects, so an id written here would be another organization's. The
  builder takes any step kind as a string and will not stop you, but `app-package lint` (and the lint pass in
  `pack`) refuses it as `learn_step`, at the step's path. Leave the step out of a package until memory types
  can be packaged; a workflow an organization builds itself, outside any package, can have one.
