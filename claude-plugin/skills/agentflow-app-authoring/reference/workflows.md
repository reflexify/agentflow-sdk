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
`{ key, name, description, run_as, start_access, input_schema, output_schema, graph }`. The object may also carry
`tool_enabled` (see below), which the helper has no parameter for. You may write that object by hand instead; the
helpers only save typing.

- **`key`** is what references use (`${workflow:open_case}`). The map's own name (`open_case:`) is what `ORDER`
  lists.
- **`runAs`**: `INITIATOR` runs as the person who starts it. `servicePrincipal("<service_principal_ref>")`
  runs as the package's service principal. Which one a workflow takes is not a choice: see Who a workflow runs as.
- **`startAccess`**: `restricted("<group_ref>", …)` lets those groups start it; each group becomes a start
  grant `start_<key>`, `start_<key>_2`, and so on. `NOBODY` lets no one start it by hand, for workflows only a
  trigger or another workflow starts. Everyone is refused (`a package cannot let everyone start a workflow`).
- **`inputSchema`**: a JSON Schema for the run's input, read as `input.<name>` (Input schema, below). It is
  checked when a run starts and installs with the package, but AgentFlow draws no launch form from it, beyond a
  folder choice for a file field that takes one.
  `start({ params: true })` declares that the run takes input; `start({ subject: "${entity:task}" })` starts the run on one record,
  read as `subject.record_id`.
- **`tool_enabled`**: `true` ships the workflow switched on as **Callable as a tool**. Leave it out for a workflow
  that is not a tool; `false` is the same as leaving it out, and any other value is refused at `/tool_enabled`.
  `workflow(...)` has no parameter for it, so spread its result: `{ ...workflow("approve_invoice", …), tool_enabled: true }`.
  What it asks of the workflow, and when it takes effect, is in "Shipping a workflow as a tool", below.

### Shipping a workflow as a tool

An organization turns a workflow into a tool with the **Callable as a tool** switch on the installed workflow.
Once it is on, agents bound to it can call it. It is also a tool of its own for MCP clients and a skill for A2A
clients, named by its installed key. Set `tool_enabled: true` and the workflow arrives with the switch already on.

`lint` refuses `tool_enabled` on a workflow that misses what the switch asks of it
(`workflow_tool_requirements_unmet`), and says every miss at once. The workflow needs:

- a `description` that is not blank (an agent reads it to decide when to call the workflow);
- an `outputs` mapping on every End step, with at least one output:
  `end("done", "Done", "approved", { result: ref("nodes.review.output.decision") })`, so a caller has a result to read;
- a start a person can use by hand: no trigger of the package may start it (`lint` refuses even though a trigger
  ships off, because arming the trigger would make the workflow start only from it);
- a start with no record or with one record: a workflow that runs over a set of records cannot be a tool.

**The package's value applies only when the workflow is first installed**: a fresh install, or a workflow that
first appears in an upgrade. After that the organization owns the switch. An upgrade never turns it on again, so
an organization that switched the tool off keeps it off, and one that switched a tool on by hand keeps it on. The
install summary lists the workflows a package switches on as tools, under **Tools**.

A workflow you give a new key arrives as a new workflow, switched on, while the old one stays in the organization
as a live tool until the organization switches it off: an upgrade leaves a workflow the release no longer ships
where it is. Changing only a workflow's `name` updates it in place and leaves the switch alone.

**Who calls it from outside.** An MCP or A2A client signs in as someone of the organization: a person, through the
client's OAuth sign-in, or a service principal, with an `afk_` key an admin issues it. An installed app's token is
refused there. The tool is listed to that caller, and runs, only when it may start the workflow: through the group
its `restricted("<group parameter>")` start grant names, or through a role holding `workflow.start.any`, which starts
every workflow (a start grant never names a principal itself, so the admin adds the principal to that group). A tool it may not start is not listed, and calling it by name answers as an
unknown tool. The workflow runs as `INITIATOR`, so as the caller, with the caller's own rights. A principal holds no
work and is in no people field, so a record scope that follows a person through a field or their work reaches nothing
for it: it reaches what its groups' grants give. To keep an outside partner's agent to that partner's records, give it a principal of its own,
with a role without `workflow.start.any`, whose groups are granted only those records, or have it sign in as a person whose grants already are.

**Keep the key short.** MCP and A2A clients are offered the tool under the workflow's installed key,
`<package id with / and - written _>__<key>`, such as `rfx_ap_match__approve_invoice` for the key `approve_invoice`
in the package rfx/ap-match. A key longer than 64 characters cannot be a tool's name there. The workflow still installs
switched on, and an MCP client can still start it with `start_workflow`, but `build` warns and the install summary
says it is not offered to MCP and A2A clients.

### Who a workflow runs as

`runAs` decides whose rights every write of the run has: grants, a rule's actor tests and a stage model's movers
are all judged on it.

- **`INITIATOR`**: the person who started the run. Every workflow that people start (through its start grants,
  an entity action, or a Call from one of those) must run as it, and can do only what that person can: a status
  move the person may not make is refused with 422 `STAGE_TRANSITION_NOT_ALLOWED`.
- **`servicePrincipal("<key>")`**: the package's service principal. Every workflow a trigger starts must run as
  it. It owns no record, holds no work and is in no field, so it passes only `in_group` in rules and movers:
  give it an **automation group**, a `group_ref` parameter that holds the principal and nobody else, and grant
  that group what the steps do (`access.md`). Setup counts the principal as the group's member because the group
  is used only for grants, rules and movers; when setup still reports it empty (`group_empty`), `pitfalls.md` says
  why and what to do.
- `lint` enforces the split: `run_as_not_initiator`, `run_as_not_service_principal`, and `run_as_conflict` for a
  workflow that both people and a trigger start. Make two workflows instead.

So a workflow people start can never do what only one group may do. When a step of the app must (a decision only
IT may record), a **trigger starts the workflow that does it**, as the service principal. The worked example below
does exactly that.

### Start forms: `inputSchema`

**From `inputSchema`, AgentFlow draws only the folder fields.** A workflow started with `start({ params: true })`
has no form definition behind its start step, so the start page asks for none of its other inputs (with no folder
field it says the workflow has no start form), and the assistant's start-form verb finds none. The schema does three things: the API checks the input a caller
sends (`POST /workflows/{workflow_id}/instances`, a Call step, a trigger or an action's `input_map`), file fields
in it bind folders, and the steps read the values as `input.<name>`. So people reach a packaged workflow through
an entity action, a trigger, a UI module, a Call, or a screen of your own site that asks for the inputs and starts the run with `POST /workflows/{workflow_id}/instances` and `params` (the starter's `src/StartCase.tsx`), not through a form drawn from this schema. The one exception is a file field that takes a folder: AgentFlow's start page and record-action dialog, and `<agentflow-start-form>`, draw a folder choice for every such field of the schema, labelled with the property's `title`, so give it one. For the other params `<agentflow-start-form>` asks only when the start step binds a designer form; it can still launch an entity's record action for a workflow with no form, because the subject comes from the record (see "Actions", below).

A record picker is written the same way as in an entity's `create_form` (`entities.md`):
`{ "type": "string", "format": "entity", "x-entity": "equipment" }`, where `x-entity` is an entity key of the
package, `user`, `group` or `org_unit`, or `${dep:<package id>#entity:<key>}` of a required package's entity, at any
depth (an object's property, an array's items). The builder writes the key form, so the schema validates, `lint` accepts it and the package installs; a key that is not an entity of the
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
- **Records**: `getById(id, name, entity, idPath)`; `getByKey(id, name, entity, matchKey, body)`, which finds one
  record through a `natural_key` set and writes nothing; `search(id, name, entity, filters, { sort?, dir?, limit?, fields? })`
  with `flt(field, op, value)`; `create(id, name, entity, body)`; `update(id, name, entity, idPath, body)`;
  `updateMany(id, name, entity, filters, body)`; `createMany(id, name, entity, itemsPath, body, { itemAlias?, indexAlias? })`,
  one record per element of a list, at most 5,000, all written or none (`ENTITY_RECORD_CREATE_MANY_TOO_MANY` past
  the cap); it is allowed in an all-or-nothing workflow and in a For each body, and writes no File field;
  `updateEach(id, name, entity, itemsPath, idPath, body, { itemAlias?, indexAlias?, expect? })`, which updates each
  record a list names with that element's own values (`updateEach("close", "Close lines", "${entity:line}",
  "input.lines", "item.id", [bind("status", ref("item.status"))])`): all written or none, at most 5,000
  (`ENTITY_RECORD_UPDATE_MANY_TOO_MANY`); two elements naming one record (`ENTITY_RECORD_UPDATE_EACH_DUPLICATE`), a
  record not found, or an `expect` that no longer holds (`ENTITY_RECORD_UPDATE_EACH_EXPECTATION_UNMET`, where a single
  `update` skips) fails the step and names the element. It takes no filters, writes no File field and does no list
  append or remove; a test run does not look the records up. It is the way to set per-record values in an
  all-or-nothing workflow. It needs an AgentFlow release that runs it, and no platform month says so: an older one
  installs the package and fails the step when it runs, writing nothing, so check the AgentFlow you install on;
  `upsert(id, name, entity, matchKey, body)`.
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
- **Names**: `installedKey(packageId, key)` is the key an object of the package gets when it is installed
  (`installedKey("rfx/hrm", "employee")` is `"rfx_hrm__employee"`). A path needs it for a profile inverse
  ("A person's profile in a path", below) and for a field the package adds to another package's entity.
- **Constants**: `INITIATOR`, `NOBODY`, and `NOW` (the template `{{ now() }}`). `now()` renders the instant in the
  organization's time zone to the millisecond (`2026-11-03T18:54:44.945+07:00`; an older AgentFlow writes up
  to nine fractional digits), while a time AgentFlow writes itself is in UTC, and a date-time field keeps the text it was written with. So two times can be
  spelled differently: compare them as instants (`new Date(v)` in a Code step), never as text.

### A person's profile in a path

A profile (`entities.md`, "A person's profile") is read through any user value by the inverse's installed name:
`workflow.requester.<inverse>.<field>` for the person who started the run, and `<user field>.<inverse>.<field>` for
a reference to Users on a record (`subject.record.approver.<inverse>.job_title`).

```js
import { bind, getByKey, installedKey, ref, tpl } from "@reflexify/agentflow-app-builder/workflow";
import manifest from "../package-manifest.json" with { type: "json" };

const employee = installedKey(manifest.id, "employee"); // "rfx_hrm__employee"
bind("department", ref(`workflow.requester.${employee}.department`));
bind("employee", ref(`workflow.requester.${employee}`)); // a reference field gets the profile's id
tpl(`{{ subject.record.approver.${employee}.job_title }}`);
```

- **Write the installed name in full.** Nothing rewrites a key inside a path at install, so the bare handle
  (`workflow.requester.employee`) names nothing. Lint admits the package's own inverse on Users under its prefix
  and still reports any other own-prefixed word as `installed_key_literal`.
- **A person with no profile reads as empty**: the profile is `null`, so `{{ … .department }}` renders nothing and
  a Decision can test the profile itself. A profile the reader may not see reads as `null` too. A run nobody started
  (a schedule, an integration) has `workflow.requester` null, so a profile path through it reads as empty.
- **The requester keeps its start-time `id`, `name` and `email`** for the whole run; the profile is read live each
  time a step reads it.
- **A binding of the whole requester or of a whole record does not carry the profile**: `ref("workflow.requester")`
  is still `{ id, name, email }`. Bind the profile, or a field of it, by its own path.
- **It reads as the run's principal.** A person reads what their grants admit; a run of the app reads under the
  app's ceiling. Reading a profile through the requester needs `user` in `requires.entities`. Reading another
  package's profile needs that package in `requires.packages` with access to the entity and the field, or the step
  is refused.
- **Publish checks the inverse's name and one field below it** under `workflow.requester`, and every segment under
  `subject.record`. `workflow.requester.manager`, `.is_active` and `.gender` are not readable.
- **Or use a step**, when a later step needs to know whether a profile exists:

```js
getByKey("emp", "Find the employee", "${entity:employee}", "by_user", [bind("user", ref("workflow.requester.id"))]);
// nodes.emp.output.found, nodes.emp.output.record.department
```

Two limits. A draft packed from the designers keeps the organization's inverse name in its paths, so rewrite those
paths with `installedKey` after converting it. And AgentFlow does not refuse clearing or renaming an inverse that a
published workflow reads: the path then reads as empty.

### Human steps

A Human step opens a task about the run's record, and its own run settles it: no workflow reads who holds it, and
no other run ends it, except through the step's end condition (below). `work` on the entity makes the record itself
the task instead (`work.md`, "A record as a task, or a Human step's task").

A Human step is `node(id, name, "human", { assignment, actions })`. `assignment.candidates` takes a person
(`{ kind: "user", id }`), a group (below), a rule (`{ kind: "dynamic", source, relation, fallback }`, where
`{ type: "initiator" }` is the person who started the run) or a unit pool (below): not the same shapes as an entity's
work routing (`work.md`). Each
action names the edge it takes with `edgeIds`. A packaged Human step has no task form of its own (the
builder builds only an entity's create form), so in AgentFlow's task view the decision is the action the person
picks and a value to go with it goes on the record (below). A task page can collect a value at the step itself
(below, "A page for the step"). List the step in `exposedSteps` when something outside the workflow completes it.

**A comment with the decision** goes on the record, not on the step, when the task is worked in AgentFlow's view (a task
page's `setValues` can carry one too, below). Give the entity a text field
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

**A person named in a field of the record** is a rule whose source is `fieldUser`:

```js
{ kind: "dynamic", source: { type: "fieldUser", path: "subject.record.owner" }, relation: { type: "direct" },
  fallback: [{ kind: "group", id: "${param:reviewers}" }] }
```

The path must reach **ids**: a reference to the built-in Users entity (`@req:entity:user`), a reference list of them,
or a group. A text field holding an email, a name or a login never resolves, and the task always goes to the
fallback; so does a person who has been deactivated. To route by an email the record holds, find the person by email
first, then route on the id:

```js
import { bind, getByKey, ref } from "@reflexify/agentflow-app-builder/workflow";

const USERS = "ffffffff-0000-0000-0000-000000000001";
getByKey("who", "Find the person", USERS, "__default__", [bind("email", ref("subject.record.owner_email"))]);
// then a step that writes nodes.who.output.record.id to a reference field to Users, here `owner`,
// and the Human step routes on { type: "fieldUser", path: "subject.record.owner" }
```

- The step names Users by its reserved id; the builder writes `@req:entity:user`. `user` must be in
  `requires.entities` with `email` among its `fields` (`manifest.md`): the build refuses an entity not listed, and lint
  reports `ceiling_uncovered` for a field not listed. A group
  (`…0002`, matched by `name`) and a unit (`…0003`, by `code`) are found the same way.
- Users' natural key is `email`, and its `matchKey` is `"__default__"`. A search on Users cannot filter by email; it
  filters only `is_active`, `manager` and `member_of`.
- The output is `nodes.who.output.found` and `nodes.who.output.record`. Write `nodes.who.output.record.id` to the
  reference field. A person nobody has under that email is a normal result, not an error: `found` is `false`, `record`
  is `null`, the id reads as empty, the field stays empty and the Human step takes its `fallback`.
- A blank email **fails the step** (`INTEGRATION_MISSING_KEY`), so check the value before the step.

**A unit pool**, everyone placed in a unit, offered the task as a group's members are:

```js
{ kind: "unit", unit: { mode: "inherit_trigger" }, reach: "subtree", group: "${param:reviewers}",
  fallback: [{ kind: "group", id: "${param:reviewers}" }] }
```

- `unit.mode`: `inherit_trigger` is the unit of the record the run is about (`subject.record`), which needs
  `requires_unit_classification: true` on its entity (`entities.md`); `requester_primary`, the default, is the primary
  unit of the person who started the run, so a run a trigger starts has none; `unit` names one in `unitId`
  (`lit("${param:<unit_ref>}")`, or `ref("<path>")` to a value holding a unit).
- `reach`: `unit` (the default, that unit alone) or `subtree` (it and every unit beneath it). `group`: only people placed
  there who are also in that group. One pool per step (`human.assignee_unit_pool_single`).
- A pool whose unit comes from the run (`inherit_trigger`, `requester_primary`, or `unit` with `ref(...)`) is a rule: it
  resolves to nobody when there is no such unit, so give it a person or group `fallback`, unless a person or group sits
  beside it in `candidates` (a rule in the fallback is `human.assignee_fallback_not_static`); with neither, the install
  is refused as above. A pool at one named unit (`unit` with `lit("${param:<unit_ref>}")`) counts as a group does and
  installs without one. Any pool that finds nobody placed there (in its `group`) when the task opens takes its
  `fallback`; with none, and no one else among the candidates, the step fails, so a fallback is worth giving either way. The build does not check the shape.

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

- **`condition`** is JSONLogic over the run's own record, and every `var` is `subject.record.<field>`. Unlike a
  Decision's, it is not held to the designer's rows: any operator AgentFlow's conditions know may be used (`in`, an
  `and` inside an `or`), and AgentFlow's designer shows such a condition read only. A path through a reference
  (`subject.record.mechanic.name`), `id` or `metadata`, and any other namespace, are refused, by the build as by
  publish. The run needs a record subject, and a workflow about a set of records is refused.
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
- **The build refuses** an `endWhen` inside a For each body and a `var` that is not `subject.record.<field>`, naming
  the step (`review's endWhen reads subject.record.mechanic.name; …`). The rest below, an unknown operator included,
  only publish and the install refuse.
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

#### A page for the step

A Human step can name a page of the package's UI module, and the links that send a person to do its task (My Work, a
notification, the inbox landing) then open that page in place of AgentFlow's task panel. Give a step one when the task is
one part of a larger screen of the app. Leave it out otherwise: AgentFlow's own view draws the whole step.

```js
const review = node("review", "Review the request", "human", {
  assignment: { candidates: [{ kind: "group", id: "${param:app_users}" }] },
  page: { path: "/review/{{ record_id }}", mode: "redirect" },
  actions: [
    { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
    { id: "reject", label: "Reject", edgeIds: ["e_reject"] },
  ],
});
```

- **`path`** is a page of this package's module: it starts with `/`, holds `{{ record_id }}` (spelt exactly so) at most once and no
  other `{{` or `}}`, the rule of an entity's `work.module_page` (`work.md`). **`{{ record_id }}` is the id of the Workflow task's
  record, not the subject's**: the module reads the task from it (the `agentflow-ui-module` skill's `task-pages.md`).
- **`mode`** is `redirect`. `embedded` is reserved and refused.
- **The package needs `ui`, and only a Human step takes a page.** A Signature step or an Agent step does not. A `page` in the
  organization's own workflow, or one built in the designer, does nothing: a page comes from the package's config.
- **The step stays whole.** Its form, review documents, actions, signing and deadline are still defined in the workflow, because the page
  draws them from the step and AgentFlow's view is the fallback where the task is always finishable. The page is another way to draw the same step.
- **Values the screen produces** (a note, a chosen option) are what the page's `setValues` holds. A packaged step has no form
  of its own, so they ride the submission unchecked by the server, and a later step reads them as `nodes.<step>.output.<key>`.
  Validate them in the workflow, or bind them to a typed field of the record, where the write is checked, as the example binds the
  note: `bind("decision_note", ref("nodes.review.output.note"))`. A task finished in AgentFlow's view carries none of these keys,
  so a step that reads one handles a missing value.
- **The builder raises `minPlatformVersion` to `2027.02`** for a package with a page, and refuses a defect at build as
  `BUILD_REFUSED`, `workflow <key>#/graph/nodes/<i>/parameters/page: <reason>`: `page belongs on a Human step`,
  `needs the package's ui`, `a module path such as /items/{{ record_id }}` or `mode must be redirect`. A module that calls
  `host.tasks` declares `ui.contract: 5` (`manifest.md`).
- **Links follow the installed release.** A release that moves or drops a page takes effect on a workflow the organization customized
  too. Only a live workflow's page is linked: a deprecated workflow's tasks open in AgentFlow's view, and so do tasks when modules
  are off or the person is outside the app's audience. The task's own record page offers "Open in <app>".

`examples/task-page` is the worked app: this step, a module that works it, and the `decision_note` binding.

### Decisions

`decision("is_done", "Done?", [when("e_done", { "==": [{ var: "nodes.task.output.record.status" }, "done"] }), otherwise("e_not_done")])`.
A condition may use only `==`, `!=`, `<`, `<=`, `>`, `>=`, `!!` and `!`, must compare a `var`, and may never
compare two vars: copy one into a variable with `setvar` first. **One `and` or one `or` may join such comparisons**:
`{ and: [{ "==": [{ var: "subject.record.status" }, "open"] }, { ">": [{ var: "subject.record.priority" }, 3] }] }`. The build
refuses anything else, such as `in`, an `and` inside an `or` or an `and` inside an `and`, because AgentFlow's workflow
designer shows a condition as rows of comparisons joined by one `and` or `or`, and cannot show those. (Trigger
filters are another grammar and take `and`, `or` and `in`, below.) A `var` or a `ref` may name a step on a branch the
run did not take: publish accepts it (a step upstream by any path resolves), and it reads as `null` in a Decision and
arrives as `null` in a Code step's input.

### Parallel arms: Fork and Join

`fork(id, name, [edgeIds])` starts every arm at once, one edge per arm, and `join(id, name)` waits until every arm
has reached it, then goes on along its one edge. You never pair them: publish pairs each Fork with the nearest
Join that every arm reaches.

```js
fork("split", "Review in parallel", ["e_first", "e_second"]),
node("first", "First review", "human", { assignment: FIRST, actions: [
  { id: "ok", label: "OK", edgeIds: ["e_first_ok"] }, { id: "no", label: "Not OK", edgeIds: ["e_first_no"] }] }),
setvar("first_done", "First review done", []),
node("second", "Second review", "human", { assignment: SECOND, actions: [{ id: "done", label: "Done", edgeIds: ["e_second_done"] }] }),
setvar("second_done", "Second review done", []),
join("both", "Both reviewed"),
// edges: e_first split→first, e_second split→second, e_first_ok and e_first_no first→first_done,
// e_second_done second→second_done, then first_done→both and second_done→both, and both→the next step
```

- **An arm may start with a Decision**, or a Human step with several actions: only the steps that feed the Join are
  restricted (next bullet). **Several actions of one Human step may lead to the same step**, as `e_first_ok` and
  `e_first_no` do above: each action carries one edge (publish refuses a second, `edge.handle_multiple`), and edges of
  different actions may end at one step. That shared step is how the Join gets one unconditional edge from the arm.
- **A Join waits for every arm.** There is no "go on when one arm is done". For "whoever answers first", give one
  Human step to all those people instead of one step each.
- **A Human or Decision step never feeds the Join directly**, even with one action: only one of its edges is
  taken, so the Join would wait for the other forever. Let the step's edges meet at one plain step, usually
  `setvar(id, name, [])`, which does nothing, and wire that step to the Join. The build refuses the direct edge.
- **A choice inside one arm**, such as a reviewer picked by a value on the record, is a Decision (or a Human step with several
  actions) in that arm. Its branches each go to their own steps and **meet at one plain step** before the Join, and
  that step feeds the Join. Only one branch runs, so the step they meet at runs once whatever was chosen, which is
  what the Join needs of it.
- **Each arm keeps to itself until the Join.** Two arms may not share a step before it, and the step that feeds
  the Join must run once whatever the arm decided. Publish refuses both at install (`graph.loop_join`,
  `graph.loop_fork`); the build does not check them.
- A Fork has at least two arms, and each goes to a step of its own. A Fork may sit inside an arm of another, and
  inside a loop. Inside a For Each body, give the body an End: publish pairs a Fork with its Join by the paths to an
  End, and refuses a body without one (`graph.loop_fork`).

Fork and Join model work that splits and meets again in nested sections. Work whose order is a network of
prerequisites (this task after those two, that one after only the first) usually cannot be drawn that way. Make
each piece of work a record with `work` instead (`work.md`), and let a workflow on each record's change open the
pieces whose prerequisites are done.

### Sending work back: a loop

An edge back to an earlier step makes a loop, such as an action "Send back" on a review that returns to the step
before it. Publish runs a loop that:

- is **entered at one step**: every edge from outside the loop lands on the same step, the one the back edge
  returns to;
- holds **no second loop** inside it;
- holds only Human, Agent, Decision, Document, Email, Webhook, Set Variable, Fork, Join, Extract Text, Image, Learn,
  Entity Relationship, Code and Notify steps, and Entity Record steps that `get`, `search` or `update` one record.

The build refuses the same three. Call, Signature, For Each and Integration steps are refused inside a loop, and so is
an Entity Record step that creates (`create`, `create_many`, `upsert`), updates many (`update_many`, `update_each`) or carries a
conversation `check` (with its Agent step before the loop, every lap after the first would find the write already made
from that turn and write nothing).

**A step that writes inside a loop can run twice for one lap.** If a worker stops after the write and before the step
is marked done, the lap's step runs again, as it would outside a loop. Setting a value twice changes nothing, so an
update that only sets fields (status `returned`) needs no care. An update that adds to a list or counts (a history
line, `rounds + 1`) would do it twice: give it an `expect` on the value the lap starts from, which the same update
changes. The second run then finds the record moved and skips (`.skipped` is `true`), and the next lap, which sets the
value back, writes again:

```js
// in the loop: review → return → draft → review
update("return", "Mark returned", "${entity:request}", "subject.record_id",
  [bind("status", lit("returned")), { ...bind("history", ref("nodes.review.output.note")), listMode: "append" }],
  { expect: { fields: { status: "in_review" } } }),
// and the step that sends it to review again sets status back to in_review
```

After a guarded update, branch on `.skipped`, not on `.record`: a skipped run returns no `record` and writes no
capture, so in a loop a later step would read the previous lap's value.

A package whose loop holds an Entity Record step needs an AgentFlow release that admits it; an older one refuses the
workflow at install, and no platform month says so, so check the AgentFlow you install on. A run in which one step completes more often than the
deployment's cap (`WORKFLOW_MAX_LOOP_ITERATIONS`, 100 unless the operator changes it) fails with
`LOOP_LIMIT_EXCEEDED`. There is no cap per loop: end the loop with an action that leaves it.

```js
node("draft", "Prepare", "human", { assignment: AUTHOR, actions: [{ id: "submit", label: "Submit", edgeIds: ["e_submit"] }] }),
node("review", "Review", "human", { assignment: REVIEWERS, actions: [
  { id: "approve", label: "Approve", edgeIds: ["e_approve"], tone: "primary" },
  { id: "back", label: "Send back", edgeIds: ["e_back"] }] }),
// edges: e_start start→draft, e_submit draft→review, e_back review→draft (the back edge),
// e_approve review→the step after the loop
```

**A send-back that has a stage of its own** (`returned`, say) is written inside the loop by an update like the one
above, so the record shows the stage while the work is with the author. An older AgentFlow refused it, and these two
shapes remain for a package that must install there:

- **The stage stays put through the loop** and the step after the loop writes the outcome. One run holds the whole
  back and forth, with one history and one loop cap, but the record shows no `returned` stage while the work is with
  the author, so a view, a rule or a stage mover that keys on it sees nothing.
- **The send-back ends the run.** The action goes to an Entity Record step that writes `returned`, then to an End, and
  the person who owns the record fixes it and moves it back to the stage the workflow starts on (`submitted`, say), a
  move the stage model lets them make. **The workflow's one trigger starts the next run** on that write, the trigger
  that started the first one: a workflow has at most one trigger (`Triggers`, below), so do not add a second on
  `returned`. It must be the "a status becomes `submitted`" kind (`change_kind: "updated"` with the filter under `Triggers`, below, that names
  the status among the changed fields): a `created` trigger fires once, on the create, and not again on the move back. And the move back is the person's write, not the workflow's: a run started by a workflow's own write is one
  level deeper each lap, and dispatch stops past ten by default (`Triggers`, below), while a person's write starts each
  lap at depth 0. Each lap is a run of its own: nothing is carried in run variables (keep what the next run needs on the
  record), the loop cap starts again, and the trigger ships off until an admin turns it on.

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

A Code step's source is at most 256 KiB, counted in bytes, so Vietnamese text counts more than its length. The
build refuses a larger `code/` file. The limit is per step: a file two steps use counts for each. If you bundle a
library into a step with esbuild, keep the bundle well under it, and check its size in a unit test.

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
- **When a Code step fails.** `CODE_EXECUTION_FAILED` means your code raised (or defined no `main`).
  `CODE_EXECUTION_TIMEOUT` means it ran past its time limit, and `CODE_RUNNER_FAILED` is the runner's own failure;
  AgentFlow retries both, which runs your code again. Your message and traceback are stored, but in an installed
  app's run the step's `error` is `null` for every reader, and the run's `error_message` and the step's `input` only
  for readers who may not see them; `withheld` lists what was blanked. Read the run's `error_message` when
  `withheld` does not list it; otherwise run the same workflow outside an installed app as an `instance.admin`,
  the only reader shown a Code step's message there (`sandbox-testing.md` of the `agentflow-app-release` skill,
  "When a run fails").

**Test `main` offline, with the project's own Vitest.** `build` and `lint` do not run it, and a deployment may have no
code runner, so a wrong figure (a total rounded to two decimals, `Number(null)`, which is `0`) shows only when a test says
so. The runner treats the file as a plain script, finds `main` (`function`, `const` or `var`) and calls it with the
declared inputs and a context; the answer goes through JSON. A test that loads the same file, `config/code/<name>.js`,
and does the same:

```ts
// test/code-steps.test.ts
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { expect, it } from 'vitest';

// An input the step did not declare throws, as it does in AgentFlow.
const strict = (data: Record<string, unknown>) =>
  new Proxy(data, {
    get(target, prop, receiver) {
      if (typeof prop === 'symbol' || ['then', 'toJSON', 'constructor'].includes(prop) || Object.hasOwn(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }
      throw new Error(`no input named '${prop}'. Declared inputs on this step: ${Object.keys(target).join(', ')}`);
    },
  });

async function runCode(file: string, inputs: Record<string, unknown>, context: Record<string, unknown> = {}) {
  const source = fs.readFileSync(path.join(import.meta.dirname, '../config/code', file), 'utf8');
  // The runner's globals; add `require: createRequire(import.meta.url)` (from 'node:module') if the file calls require.
  const realm = vm.createContext({
    console, process, Buffer, setTimeout, clearTimeout, setInterval, clearInterval, URL, TextEncoder, TextDecoder,
  });
  vm.runInContext(source, realm, { filename: file });
  const main = vm.runInContext("typeof main === 'function' ? main : undefined", realm);
  // The runtime's context holds run_id, node_id, node_run_id and org_id; give the test the ones the file reads.
  const answer = await main(strict(JSON.parse(JSON.stringify(inputs))), strict(context));
  return JSON.parse(JSON.stringify(answer));
}

it('refuses a sender with no address', async () => {
  expect(await runCode('check-sender.js', { sender: null })).toEqual({ allowed: false, reason: 'no_sender' });
});
```

Pass `null` for an input that resolves to nothing, and every input the step declares. The test's `context` is empty
unless you fill it; the runtime passes the step's.

### Email steps

An email step's `parameters.email.connection` is `"${param:<connection_ref>}"`, a `connection_ref` parameter of the
package; give it `category: "email"` (a parameter of another category is refused). The step carries no provider: the admin binds the parameter to a connection of any
email provider the organization has, and the step sends through it. The builder refuses the object form
(`{ provider, externalAccountId }`) and any string that is not a `${param:…}`. Declare the parameter's hosts in the
manifest's `egress` by connection, `{ "connection": "${param:<connection_ref>}", "purpose": "…" }`, so setup admits
the hosts of whichever provider is chosen (see `manifest.md`). The step's other members, and a whole step, are in
"A worked example: mail in, an answer out, and replies on the same thread", below.

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
(the record being saved changed) or `changed` (an `expect` no longer held). Branch on `skipped`. The run's trace
shows the same reason as the step's `skip_reason`, so a skip is visible where the step's output is withheld.

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

### Variables: `setvar`

`setvar(id, name, [[target, binding]])` writes each binding into a variable. **The target is the bare name**: a
letter or underscore, then letters, digits and underscores. Not `"vars.first_status"`: a dot makes the target invalid
(`set_variable.target_invalid` at install, and `build` refuses it first). A later step reads it as `vars.<target>`.

```js
setvar("keep", "Keep the first status", [["first_status", ref("nodes.read.output.record.status")]]),
// later: { var: "vars.first_status" } in a Decision, {{ vars.first_status }} in a template, ref("vars.first_status")
```

A binding is `ref(path)`, `tpl(template)` or `lit(value)`, and a `lit([1, 2])` or `lit({ a: 1 })` stores the list or
object. Two assignments to one target keep the later one.

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
  above, never the stand-in. A Webhook step that reached the send keeps its own output instead: `success` is false and
  `status` is the HTTP status, or null when nothing answered (null, or the 3xx code, when AgentFlow refused the
  address or a redirect), so test `nodes.<step>.output.success` or `.status` (`steps.md`, "Steps that need something
  outside the package"). Only a failure while preparing the request takes the stand-in: a template that does not
  render, a raw body that is not exactly one file, or a secret it cannot read.
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
a Fork owns exactly its arms' edges, one per arm, each to a step of its own; everything is reachable from `start`;
a loop is one publish runs ("Sending work back: a loop"; a For Each body is checked as a graph of its own); a Fork
reaches a Join, a Join has a Fork before it, and no Human, Decision or routed Signature step feeds a Join directly
("Parallel arms: Fork and Join"); a Human step's `endWhen` reads only `subject.record.<field>` and sits outside a For
each body. The refusals name the workflow and the step:
`open_case: case (entity_record) has 0 outbound edges`, `unreachable x`, `d owns e2,e3 but has e2`,
`x (entity_record) is inside the loop through a, x`, `the loop through a, b is entered at a, b`,
`h (human) feeds Join j directly on e4`.

## Triggers

`export const triggers = { <name>: { workflow, kind, enabled?, config } }`. `workflow` is a workflow `key`.

**Every trigger arrives off.** The output has `enabled: false` whatever you write, the install leaves it off, and an
admin turns it on after installing (the install's receipt page, **Turn on triggers**). Until then the workflow does
not start, and a trigger reacts only to changes made after it is on. Design for that window: a field only a
trigger-started workflow writes (a "closed at" stamp) stays empty, so a figure over it counts nothing (a duration
leaves such records in `skipped`); a time a record already has needs no workflow (every record has `created_at`
and `updated_at`, `dashboards-and-launcher.md`). Put the triggers to turn on in the app's README and the message to
the admin (the release skill's "What to send your org admin"). Only a trigger arrives off: a person with start
access, a record action (`actions`), a Call step and a module's start work from the install, and `tool_enabled: true`
arrives on as written. So a stamp a person's action sets can be written by a record action's workflow, or by the
module itself, with no admin step.

- **A workflow has at most one trigger.** Two triggers naming one workflow build, and the install fails
  (`APP_STEP_FAILED on trigger:<key>`). To start the same steps two ways, make one workflow per trigger from
  one helper: a function in `config/build/` that returns the workflow for what differs (its key, the condition it
  checks), called once per trigger.
- **A trigger added in an upgrade also lands off**, and one already on stays on, unless the release moves it to
  another workflow, which lands it off as a new one. Tell installers which triggers to turn on.
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

  `event.previous` holds **only the fields that changed**: on any other update `event.previous.<field>` is absent, and
  an absent value reads as `0` in a comparison, so always pair a test of a before-value with the field's `in` over
  `event.changed`. A filter may compare two variables, the new value with the old one; this one starts a run only when
  `qty_reserved` falls:

  ```js
  filter: { and: [
    { in: ["qty_reserved", { var: "event.changed" }] },
    { "<": [{ var: "qty_reserved" }, { var: "event.previous.qty_reserved" }] },
  ] },
  ```

  A rollup fires the parent's `updated` trigger too: its recompute writes the rollup with the field in `changed` and its
  old value in `previous`, and only when the value moved.

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
  choice, number or auto-number field that is not secured). Events for a key that arrive while its run works wait, and when the run
  ends the next run takes up to `max_batch` of them (1 to 200, default 50) as one batch; `linger_ms` (0 to 10000)
  makes an idle key wait that long for company before its run starts. A batch's run is about the newest event's
  record, its `trigger.*` and `input.*` describe the newest event, and `trigger.events`, `trigger.batch_size` and
  `input.events` carry the whole batch, oldest first. An event whose key is blank runs on its own. A grouped workflow
  may not wait on people (a Human or Signature step, or a Call into a workflow that has one) unless the group sets
  `hold_while_waiting: true`, which keeps the key through the wait: `lint` reports `group_hold_missing`, and the
  install refuses it with `trigger.group_waiting_step`.
- `kind: "schedule"`: `config` has `cron`, `timezone` and `input_template` (for example `"0 6 * * *"` with
  `"${param:timezone}"`).
- `kind: "connected_app"`: `config.connection` is a `${param:…}`, the same `connection_ref` parameter an Email
  step names (category `email`); without it the trigger is refused. The builder writes it as the trigger's `account`.
  `config.provider` and `config.external_account_id` are refused, naming `connection`. It starts a run on an email event of the connection: `email.received`, `email.sent`, `email.delivered`,
  `email.bounced`, `email.complained`, `email.suppressed` or `email.failed`. `email.sent` fires once per message
  the provider accepts (a send that goes out as separate messages fires once for each). `email-events.md`
  lists each event's fields and which provider sends which event. Its `config` also takes `object_type` (the event),
  `change_kind: "created"`, `filter` and `input_mappings`; "A worked example: mail in, an answer out, and replies on
  the same thread", below, writes one and says what a mapping and a filter read.

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

An action that adds records from a folder is the same shape: the workflow starts on the record (`start({ subject: BATCH, params: true })`),
and the action's input map makes the record the subject.

```js
export const actions = {
  add_dossiers: { entity: "batch", action: {
    workflow_id: "${workflow:add_dossiers}", label: "Add dossiers", key: "add_dossiers",
    scope: "row", mode: "async", input_map: [{ from: "record.id", to: "subject" }], icon: "folder" } },
};
```

- **One declaration, two screens.** AgentFlow's batch page shows the button, and a UI module launches the same action with
  `<agentflow-start-form entity="batch" record="…" action="add_dossiers">`. Both read the action's workflow contract and
  start the run with the record as the subject. A file field that takes a folder is asked for on both, as a choice of
  files, a folder from the person's computer or a watched folder, whether the workflow's start step binds a form or its
  input is only an `inputSchema`, as here. The other params of an `inputSchema` are not asked for, so bind them in the
  `input_map` or leave them optional. The app writes no picker (`agentflow-ui-module`, `records-api.md`, "Records from a
  folder").
- **The file field says whether it takes a folder.** A start-form file field that a Group files step or a For Each reads
  takes a folder, at the Group files step's depth (`steps.md`, "Looping over files"); the workflow's published input
  contract tells the screens, and neither draws a folder choice for a field nothing groups.
- **File what the loop creates with `destinationUnit: { from: "trigger" }`**: inside a For Each over folders or files it
  follows the loop out to the record the run is about (in a loop over records it is the item: `steps.md`), so each
  dossier lands in the batch's unit whoever started the run. Name a unit with
  `from: "unit"` only to file somewhere else (`steps.md`, "The unit a created record is filed in").
- `examples/court-batches` is the package; its `batch` entity declares `add_dossiers` as above.

## A worked example: mail in, an answer out, and replies on the same thread

A desk takes requests by email. Each new message opens a request and is answered at once; a reply on the same thread
is added to the request it answers, not opened as a new one. Every received message is kept as a `message` record
(`body` text, `files` a File field, `request` a reference to the request), so a reply's attachments have a place
without replacing the request's own. The request has a `title` and a `thread_id` text field. The package declares
`mail` (`connection_ref`, `category: "email"`, also named in `egress` by connection) and the automation principal
and group of "Who a workflow runs as".

**The trigger.** A run of a `connected_app` trigger reads each mapped field as `input.<to>`; a mapping's `from` is
`event.properties.<field>` (`email-events.md` lists the fields). A `filter` reads the same fields without
`event.`, as `{ "var": "properties.subject" }`, and cannot read `attachments`, which are stored only after a filter
admits the message:

```js
export const triggers = {
  mail_in: { workflow: "take_mail", kind: "connected_app", config: {
    connection: "${param:mail}",
    object_type: "email.received", change_kind: "created", filter: {},
    input_mappings: [
      { from: "event.properties.from_address", to: "from_address" },
      { from: "event.properties.subject", to: "subject" },
      { from: "event.properties.text", to: "text" },
      { from: "event.properties.message_id", to: "message_id" },
      { from: "event.properties.in_reply_to", to: "in_reply_to" },
      { from: "event.properties.references", to: "references" },
      { from: "event.properties.attachments", to: "attachments" },
    ] } },
};
```

**How a reply finds its request.** A mail client writes a reply's `References` as the parent's `References` followed
by the parent's Message-ID, so its first entry is the message that started the thread, even when the first message
the desk sees was itself a reply. A Code step reads that root, and the request stores it as `thread_id`. The answer's
`References` is the incoming chain followed by the message's own id, so every reply to the answer, or to the message,
starts with the same root. `references` and `in_reply_to` hold ids with their angle brackets (`<id@host>`), and
`message_id` holds the header as it came, so the step puts the brackets on it before comparing:

```js
// config/code/thread-root.js
function main(inputs) {
  const references = Array.isArray(inputs.references) ? inputs.references : [];
  const raw = typeof inputs.message_id === "string" ? inputs.message_id.trim() : "";
  const own = raw === "" ? null : raw.startsWith("<") ? raw : `<${raw}>`;
  const chain = [...new Set([...references, own].filter(Boolean))];
  return { root: references[0] || inputs.in_reply_to || own, own, references: chain.join(" ") };
}
```

Do not wait for the answer's own Message-ID: with Resend it is chosen by the provider (the step's output
says `message_id_source: "provider"` and `messages[].message_id` is `null`), and only an `email.sent` event tells it.

**The workflow:**

```js
const REQUEST = "${entity:request}", MESSAGE = "${entity:message}";

export const workflows = {
  take_mail: workflow(
    "take_mail", "Take a mail",
    "Opens a request for a new email and answers it, or adds a reply to the request it answers.",
    servicePrincipal("automation_principal"), NOBODY,
    graph("Take a mail", [
      start({ params: true }),
      code("thread", "Find the thread", "code/thread-root.js", [
        ["references", ref("input.references")], ["in_reply_to", ref("input.in_reply_to")],
        ["message_id", ref("input.message_id")],
      ], { type: "object", properties: {
        root: { type: ["string", "null"] }, own: { type: ["string", "null"] }, references: { type: "string" },
      } }),
      search("find", "Find its request", REQUEST,
        [flt("thread_id", "eq", ref("nodes.thread.output.root"))], { limit: 1 }),
      decision("known", "A reply?", [
        when("e_reply", { ">": [{ var: "nodes.find.output.returnedCount" }, 0] }),
        otherwise("e_new"),
      ]),
      setvar("is_reply", "Its request", [["request", ref("nodes.find.output.records[0].id")]]),
      create("open", "Open a request", REQUEST, [
        bind("title", ref("input.subject")), bind("thread_id", ref("nodes.thread.output.root")),
      ]),
      node("answer", "Answer the sender", "email", { email: {
        connection: "${param:mail}",
        to: "{{ input.from_address }}",
        subject: "Re: {{ input.subject }}",
        body: "We have your request and will answer on this thread.",
        headers: { "In-Reply-To": "{{ nodes.thread.output.own }}", "References": "{{ nodes.thread.output.references }}" },
        autoSubmitted: "auto-replied",
      } }),
      setvar("is_new", "The new request", [["request", ref("nodes.open.output.record.id")]]),
      create("keep", "Keep the message", MESSAGE, [
        bind("request", ref("vars.request")), bind("body", ref("input.text")),
        bind("files", ref("input.attachments")),
      ]),
      end("done", "Done"),
    ], edges(
      ["e0", "start", "thread"], ["e1", "thread", "find"], ["e2", "find", "known"],
      ["e_reply", "known", "is_reply"], ["e_new", "known", "open"],
      ["e3", "open", "answer"], ["e4", "answer", "is_new"],
      ["e5", "is_reply", "keep"], ["e6", "is_new", "keep"], ["e7", "keep", "done"],
    )),
    { type: "object", properties: {
      from_address: { type: "string" }, subject: { type: "string" }, text: { type: "string" },
      message_id: { type: ["string", "null"] }, in_reply_to: { type: ["string", "null"] },
      references: { type: "array", items: { type: "string" } }, attachments: { type: "array" },
    } },
  ),
};
```

- **The Email step's members.** `to` is one template; it may name several addresses, separated by `,` or `;`, and
  each gets a message of its own unless `delivery: "together"` sends one message to all, which `cc` and `bcc` need
  (`email.copy_requires_together` otherwise). `replyTo` renders to one address. `headers` maps a name to a template:
  only `In-Reply-To`, `References` and names starting with `X-` (`email.header_not_allowed` otherwise).
  `autoSubmitted` is `auto-generated` (the default), `auto-replied` or `none`, written as the message's
  `Auto-Submitted` header. AgentFlow records no received message whose `Auto-Submitted` is anything but `no`, so two
  desks answering each other stop at the first answer; send `none` only to a mailbox that must take the message in
  as a person's. `attachments`
  lists files as `{ fromExpr: "<path to a file or a list of files>" }`, or a Document step's file as
  `{ nodeId, documentId }`.
- **`body` goes out as written, as both the text and the HTML part of the message.** Write plain text: there is no
  separate HTML body, and a client that shows the HTML part may run the lines together.
- **Unit:** the run is about no record, so on an entity filed in a unit `from: "trigger"` has nothing to follow and
  the principal has no unit of its own. File what it creates with a `unit_ref` parameter the admin answers:
  `{ destinationUnit: { from: "unit", unit: "${param:mail_office}" } }`. Nothing reads who owns the mailbox.
- **Plus addresses.** `plus_tags` lists each recipient address with a `+` as `{ "address", "tag" }` (`desk+t42@…`
  gives the tag `t42`), an empty list when none has one. It finds a record only when the address people write to
  carries the tag, such as a `replyTo` the package builds from its own address with `readParameters`.
- **Test it** in a sandbox with a `loopback` connection and `sandbox mail-in` (`agentflow-app-release`,
  `sandbox-testing.md`, "Testing inbound mail"), giving the message a `Message-ID` header written `<id@host>`, and a
  second message, as a reply, an `In-Reply-To` and a `References` naming it.

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
    "help": "Holds the automation principal and no one else: its members may move any loan." }
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
- **One item of a list field reads wherever a path or a template reads**, not only in an update step: the record's
  field is a list of objects, each with its columns' keys and an `id`. `ref("nodes.<step>.output.record.<list field>[0].<member>")`
  reads the first item's member, and so does `{{ nodes.<step>.output.record.<list field>[0].<member> }}` in a Webhook
  URL, a Code step's `tpl(...)` input or a Set Variable (`subject.record.<list field>[0].<member>` the same). Counting
  starts at 0, in the stored order. **A list with no item at that index reads as nothing, and nothing fails**: a
  `ref(...)` and a template that is only `{{ … }}` give `null`, and a template with text around the hole renders it
  as empty text, so a URL loses that part. Test the list before the step that needs the item
  (`{ "!!": [{ var: "nodes.<step>.output.record.<list field>" }] }` in a Decision), or pass the list to a Code step;
  for every item, loop with a For Each.
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
