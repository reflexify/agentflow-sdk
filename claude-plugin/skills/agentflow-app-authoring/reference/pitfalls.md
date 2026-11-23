# Pitfalls

Each of these was met building a real app. Most build cleanly and fail later, when the app is installed or
used, so read this list against your config before you hand it off. Each entry gives the symptom, the cause,
and what to write instead.

## References and text

- **A `${param:…}` shows up literally in a name or a description.**
  Cause: an entity's or a workflow's `name` and `description` are carried as written, not translated.
  Instead: write plain text there. Put parameter values in workflow templates through `readParameters`.
- **`an authoring reference the builder does not know: Case for ${param:app_users}`.**
  Cause: a reference inside a longer string. References are whole strings.
  Instead: read the parameter into a variable (`readParameters("company_name")`) and use
  `{{ vars.company_name }}` in the template (`workflows.md`).
- **`entity key my-case holds a hyphen`.**
  Cause: only a skill name may hold `-`.
  Instead: use `_` in every other key.
- **`…/enum_values/<i>/color: one of gray, sky, …, or #RRGGBB`.**
  Cause: a colour outside the platform palette, such as `green`, `red` or `slate` (`slate` is an entity `accent`,
  not an option colour). The build refuses it.
  Instead: use `gray`, `sky`, `teal`, `amber`, `emerald`, `violet`, `indigo`, `rose` or `fuchsia`, or `#RRGGBB`.

## Access

- **An organization admin cannot see or change records.**
  Cause: there is no admin bypass of record access.
  Instead: give admins a group parameter with `"scope": "organization"` grants, and add that group as a
  stage-model mover wherever admins move records.
- **Setup refuses with `APP_GRANT_RECIPIENT_COLLISION`.**
  Cause: two grants on the same entity give access to the same group, which happens when the admin picks one
  group for two group parameters that each carry a grant on that entity (`loan_users` and `it_staff`, both on
  `loan`). The setup page lists the code under the plan's problems, and the plan cannot be approved until two different groups are chosen.
  Instead: write each such parameter's `help` to say it must be a different group from the other, naming it, and
  that members may overlap (a person can belong to both groups). Example: `"help": "IT staff who approve
  equipment loans. Must be a different group from Loan desk users (the same person may be in both)."`
- **`grant purchase_requisition_procurement_reviewers is 42 characters, formed from entity purchase_requisition and parameter procurement_reviewers_group_id`.**
  Cause: AgentFlow takes a grant key of at most 40 lower-case letters, digits and single `_`, and refuses the whole
  manifest over a longer one. You never write the key: the build forms it, `<entity>_<recipient>` for an entity's
  grant (`access.md`) and `start_<workflow>` for a workflow's start grant (`start_<workflow>_2` for its second group).
  Instead: shorten the key the message names: the entity's, the group parameter's or the workflow's.
- **`entities/case.json#/access/mode: one of everyone, restricted`.**
  Cause: `access.mode` left out. The installer would have defaulted it to Everyone.
  Instead: always write `"mode": "restricted"` (or `everyone`, deliberately).
- **A person carries a record into another parent they manage.**
  Cause: grants judge the stored parent, so anyone who may update the record and manages another parent
  can move it there.
  Instead: unless moving is a feature, fix the parent after create with a rule: `is_update` and
  `changed` on the parent field (`team_is_fixed` in `rules-and-stages.md`).
- **A view for "my records" with `{ "$bind": "viewer.id" }` in `filters` is refused by `pnpm build`.**
  The message reads `entities/<entity>.json#/views/<n>/filters/<m>/value: a fixed filter compares as written and
  never resolves $bind: put the filter in a preset in config.presets`.
  Cause: only a preset (`config.presets`) reads the person looking; a fixed filter compares the value as text, so
  the view would list nothing. (A build from SDK 0.3.0 or earlier let it through, and the view listed nothing.)
  Instead: a preset, or a record scope in the grant (`entities.md`, "Views"). A preset is never preselected and
  a launcher entry cannot open one; a record scope does not narrow a person who also holds a wider grant. For
  "my X" that is mine for everyone, including people with organization scope, use a UI module screen.
- **An "overdue" view lists the wrong records.**
  Cause: a `within last_<n>_days` filter, which includes today and drops anything older than n days.
  Instead: the fixed filter `due within before_today` beside the open statuses, sorted by the due date ascending
  (`entities.md`, "Views").
- **A label or category that other rules depend on is edited, and records using it stop saving.**
  Cause: other rules compare against its meaning.
  Instead: fix that field after create with a rule, as above.

## Rules

- **A rule meant for edits refuses every create.**
  Cause: on a create, every test of the record is false and its negation true.
  Instead: start an edit-only rule with `{ "kind": "write", "write": { "op": "is_update" } }`.
- **A rule about the stored value never fires, or fires on the wrong write.**
  Cause: a field leaf reads the value being written.
  Instead: use a `was` leaf for "the stored value is …" (`frozen_is_frozen` in `rules-and-stages.md`).
- **A rule or a stage move refuses the app's own workflow.**
  Cause: a workflow a trigger starts runs as a service principal, which passes only `in_group`, not
  `is_elevated_run`. A workflow people start runs as the person who started it, so a rule that refuses that
  person refuses the workflow.
  Instead: put the service principal in an automation group, and negate `in_group` on it in the rule, or list
  it as a mover. For a move only one group may make, let a trigger start the workflow that records it
  (`workflows.md`, the worked example).
- **The automation group cannot be set up with only the service principal in it.**
  Cause: the group is also assigned work, or is the audience or an agent's access list, where setup counts only
  people; or the deployment is older than the rule that counts the principal, and counts only people everywhere.
  Instead: keep the automation group for grants, rules and movers alone and use another group for work. If setup
  still reports `group_empty` for a group used only that way, ask the admin to add one dedicated account that never
  signs in, and no one else.
- **A `$field` comparison never matches.**
  Cause: `$field` needs the same type on both sides, and a text formula is not an enum.
  Instead: compare through the reference (`label.base_status`) to the enum field.
- **A new field is editable by everyone with `update`.**
  Cause: `changed_any` names fields one by one, and the rule that guards its peers does not name it.
  Instead: add every new field to the rule that guards its peers. A field nobody types, because the creator default or
  a workflow fills it, needs a rule of its own that refuses a change (`rules-and-stages.md`, "A field fixed once the
  record exists").
- **Every create by a person is refused with `ENTITY_VALIDATION_RULE_FAILED`.**
  Cause: a rule refuses `changed` or `changed_any` on a field a default fills (a `status` that starts at `draft`)
  unless the workflow writes it, and on a create the default is a change like any other.
  Instead: add `{ "kind": "write", "write": { "op": "is_update" } }` to the rule, as `opened_by_is_fixed` in
  `rules-and-stages.md` does, so it guards the field only once the record exists.
- **A rule cannot express "at most 20 children".**
  Cause: rules may not read rollups.
  Instead: enforce it in the UI, or not at all.
- **Children are created under a closed parent.**
  Cause: nothing refuses them.
  Instead: a rule `is_new` and `parent.status` equals `closed` (`no_item_in_closed_team` in `rules-and-stages.md`).
- **A screen's write of a counter, an annotation or a copied list is refused, or silently dropped.**
  Cause: the field is behind a rule that lets only the automation group write it, so a person's write is refused
  on create and on update, or it is not on the entity's create form, so a create drops it without a word (a
  `PATCH` would still write it).
  Instead: derive such fields in the workflow that checks the record, as the service principal. When a person's
  edit copies a record and must keep what only automation wrote on it (evidence, quotes, provenance), have that
  workflow carry those over from the source record for each part the person left unchanged, comparing the
  stored text and not its mention labels, so a relabel is not a change.

## Fields and forms

- **A UI module cannot create a record whose File field is `required`.**
  Cause: a module creates the record first and uploads the file for it afterwards (an app's token uploads only for a
  record that exists: the UI module skill's `records-api.md`, "A file into a File field"), so the create has no file.
  Instead: leave the field optional, and ask for the file at the stage that needs it with a rule: two field leaves,
  `{ "field": "status", "op": "eq", "value": "signed" }` and `{ "field": "contract", "op": "is_empty" }`, refuse a
  signed record with no file, and `is_empty` holds for a File field that holds none.
- **A people list on a create form does not show a person picker.**
  Cause: `"format": "entity"` written on the array.
  Instead: put `"format": "entity"` under `items`, and keep `x-entity` on the array (`entities.md`).
- **A create through the records API drops fields it set.**
  Cause: `POST /entities/{id}/records` (a UI module, a service principal, a person on the create page) keeps
  only the fields the create form binds, and drops the rest silently. A workflow's `create` step is not
  filtered: it writes every field it binds.
  Instead: patch the other fields in a second write, or have a workflow create the record. Treat a failed
  second write as a partial create (the record exists): do not retry the create. Binding a field only to set it
  also shows it on AgentFlow's own create page.
- **A rollup does not count what you meant.**
  Cause: a rollup written like a formula, or an `inverseKey` that no child reference declares.
  Instead: `"type": "formula"`, `"formula_result_type": "number"`, no `formula_expression`, and a `rollup`
  of `inverseKey` (camelCase: the child reference's `inverse_key`), `agg` and an optional `filter`.
- **A formula that reads through a reference (`label.base_status`) shows an old value, or a workflow's decisions on the
  record take the default branch.**
  Cause: the value is stored when the record is written, so a change to the referenced record reaches it on the next
  write. And a run whose principal cannot read the entity the formula reads through is given none of the record's
  fields (the entry under "Workflows and triggers", below). An empty reference is not a cause: it reads as nothing,
  except for an auto-number read through it, and for any read while the entity's formulas are being recomputed.
  Instead: use the formula, and give the principal's group read on that entity. When a decision needs the live
  value, read the referenced record in a step. `entities.md`, "Formulas and rollups", has the rules of the formula.
- **Deleting a target with `on_target_delete: clear` is refused.**
  Cause: a clearing delete is all or nothing. The deleter needs `update` on every record that points at the
  target, or the platform answers 403 `ENTITY_RECORD_CASCADE_FORBIDDEN`; and more than 499 records pointing
  at it answers 422 `ENTITY_RECORD_CASCADE_TOO_LARGE`.
  Instead: say so in the UI with the count, and offer a rename.
- **Comments are on, but the record page shows no thread.**
  Cause: the package ships a `detail` view whose layout has no `comments` block. Installing does not add one,
  and a comment notice opens that page.
  Instead: put `{ "kind": "comments" }` at the bottom of the layout's wide column (`entities.md`, Comments).
- **AgentFlow's record form lets an admin change a field your app never changes (a key other records store).**
  Cause: a field is editable by everyone with `update` unless a rule says otherwise. There is no read-only flag.
  Instead: a rule that refuses changing it once the record exists (`rules-and-stages.md`, "A field fixed once the
  record exists"). The record page then shows the field as not editable, with the rule's message.
- **The app needs records the moment it is installed (a list of categories, say), and has none.**
  Cause: the entity has no `seed`, and nothing else creates records at install.
  Instead: for records that are the same in every organization, give the entity a `seed`: the install creates
  them once per natural key (`entities.md`, "Starter records: `seed`"). For records that depend on the
  organization, give the app a screen that creates them by natural key when an admin confirms (`entities.md`,
  "Starter records the app creates itself"). Until that screen has run, what depends on the records has nothing
  to work with: show that, and tell installers in the `changelog`.

## Workflows and triggers

- **A workflow's decisions take the default branch, as if the record had no fields.**
  Cause: the workflow's run-as principal cannot read something the record carries: most often a formula
  that reads through a reference to an entity the principal has no grant on. Everyone never covers a service
  principal, so a grant to Everyone alone does not count. (On an AgentFlow release before rollups were read
  as fields, a record with a rollup was withheld the same way.)
  Instead: give the principal's group read on every entity a formula of the record reads through (an automation
  group that reads `tag` for a formula `tag_status` on `item`). Give a decision an `otherwise` branch that writes
  nothing, and test `==` on the values you act on, never `!=`: a withheld value reads as null.
- **The build refuses a record trigger's mapping (`status does not start with event.`), or the run's input arrives empty.**
  Cause: an `input_mappings` entry written `{ "from": "status" }`, which the install would refuse too; or one whose
  field is misspelled (`event.stauts`), which nothing checks and the run reads as `null`.
  Instead: every `from` starts with `event.`: `event.<field>`, or `event.event.previous.<field>` for the value
  before the change, with the field's key as the entity file spells it. The run reads it as `input.<to>`.
- **`lint` says `workflow_invalid` with `reference.template_expr_invalid`, or the install is refused with it.**
  Cause: a template that is not Jinja, most often a conditional written `{{ urgent ? "High" : "Low" }}`.
  Instead: write it as Jinja does, `{{ "High" if urgent else "Low" }}`.
- **`lint` says `workflow_invalid` with `atomic.step_not_allowed`.**
  Cause: an all-or-nothing workflow holds a step that cannot be rolled back or that waits (a Code, Agent, Human,
  Signature, Webhook, Integration, Document, Learn or Notify step, a For Each or a Call).
  Instead: move the step to a workflow that calls this one, or run it after this workflow finishes.
- **`lint` says `run_as_not_initiator`.**
  Cause: a workflow that people start (a start grant, an entity action, a Call from one of those) runs as a
  service principal.
  Instead: run it as `INITIATOR`. What only a group may do belongs to a workflow a trigger starts. To let a person
  start such work, on one record or a selection, have their run write a value on each record and trigger the
  service principal's workflow on it (`workflows.md`, "Handing work to the service principal: a record, then a
  trigger").
- **`lint` says `bare_key` in a workflow.**
  Cause: a position that takes a key holds a bare key or an id-form reference. A start form's `x-entity` is
  not one of these: the builder writes its key form. A workflow variable's `entity` or a relationship step's key
  is, when written as a plain string or `${entity:…}` by hand.
  Instead: write `"x-entity": "<entity key>"` and let the builder translate it. That only makes the schema
  valid: AgentFlow draws no record picker from `inputSchema` (only a folder choice for a file field that takes
  one), so to let a person choose a record use an entity
  action with `subject`, or make the request a record (`workflows.md`, "Start forms").
- **`build` refuses an `x-entity`.**
  Cause: a start form's or a create form's `x-entity` names something that is not an entity of the package, `user`,
  `group`, `org_unit` or a `${dep:<package id>#entity:<key>}` of a package in `requires.packages` (a typo, or another package's
  entity written by its bare key in place of `${dep:…}`, which is refused even when `requires.packages` lists that
  package). One of `user`, `group` and `org_unit` also needs its
  entry in the manifest's `requires.entities`, or the build refuses with `… names no object, parameter or required
  entity of the package`.
  Instead: name an entity key of this package, `user`, `group` or `org_unit` (listed in `requires.entities`), or the
  `${dep:…}` of a required package's entity.
- **A Human step's task stays in a person's list after another workflow finished the record.**
  Cause: only the run that opened a Human step's task settles it, and no step reads it or ends it from another run,
  unless the step declares an end condition.
  Instead: when the work may be finished from outside that run, either make the record the task with `work`: writing
  its status then ends the work, whoever writes it (`work.md`, "A record as a task, or a Human step's task"); or give
  the Human step an `endWhen` over the run's record, which ends the step when a write makes it true and keeps its
  actions and edges (`workflows.md`, "Human steps").
- **A Human step's bound fields show read-only and empty, and a submit that sets one is refused with
  `WORKFLOW_TASK_SUBJECT_WITHHELD`.**
  Cause: the step's form is bound to the run's record, and the run was handed that record from a value the app may
  not read: a child run whose caller, or whose `subjectSource`, took the record from a field outside the app's access,
  or a loop body over such a list. A step the builder writes has no form (`workflows.md`, "Human steps"), so only a
  step packed by hand or from AgentFlow's designer, with a bound form, meets this. Such a step is told nothing of the
  record, records `VALUE_WITHHELD` against `task.prefill.<field>`, and locks every bound field the step would write
  (a bound File field, and a read-only or computed one, are not locked; a file attached stays on the step): the
  step's `locked_fields` names them, the form offers them read-only with no default and not required, and nothing
  (a default, a computed value, a `prefillFrom` or agent `prefill`) is filled into them, in the live preview either.
  The holder finishes the step with one of its decisions and the submit leaves the record alone; AgentFlow's task
  view, `host.tasks`, `<agentflow-task-detail>` and the assistant leave locked fields out of what they send, and a
  page that sends a value for one itself is refused. The step cannot be signed: its sign action is disabled with
  `content_not_shown`. The record never receives what the step would have written.
  Instead: choose the record from values the app may read (give the package access to the field the choice reads,
  or pass the record's id from a value built from readable fields).
- **A step after one set to `continue` reads the substituted output as empty.**
  Cause: in an installed app's run, a step that fails and continues hands later steps its `default_output` as a
  value of unknown origin, which reads as null, and so does everything computed from it. A record write from it
  writes empty values.
  Instead: right after the step, a Decision that tests a value only its real output carries
  (`{ "!!": [{ var: "nodes.<step>.output.<field>" }] }`), and an `otherwise` branch that skips the writes.
  A Webhook step that reached the send is the exception: it keeps its own output, `success` false and `status` the
  HTTP status (null when nothing answered), even when AgentFlow refused the address or a redirect (`status` is then
  null or the 3xx code), so a Decision tests `nodes.<step>.output.success` or `.status` (`steps.md`). Only a failure
  while preparing the request takes the stand-in: a template that does not render, a raw body that is not exactly one
  file, or a secret it cannot read.
- **Every call of an Agent step fails with `model … is not permitted for this deployment's LLM gateway credential`.**
  Cause: the deployment routes models through its LLM gateway, and the model is not registered there. Another
  model of the same provider may work.
  Instead: set the model parameter to a model the deployment offers, or ask its operator to register this one.
  The package does not change.
- **An Agent step that reads a conversation fails with `AGENT_CONVERSATION_EMPTY`.**
  Cause: its prompt is blank and the thread's newest message is the agent's own reply, so there is nothing to
  answer. A trigger that also fires on the agent's own messages starts it there.
  Instead: start the step only on a message from the other side (filter the trigger on the author), or give it a
  prompt (`workflows.md`, "Agent steps that read a conversation").
- **A Human step assigned to a group is never done.**
  Cause: nobody claimed it, or the group has no active person. A member must claim it before filling it in.
  Instead: tell the group's members to claim it from Team queue on Home, and keep the group's membership up to date.
- **A step that removes a list item fails with `VALIDATION_ERROR`, or the package is refused at upload.**
  Cause: `listMode: "remove"` is only for an `update` step on a `list` field (publish refuses it elsewhere), and its
  value must be one item id or an array of them (an item stands for its `id`). A deployment without list removes
  refuses the package (`body_invalid`), and its designer saves the step as a replace.
  Instead: bind the item's id on an update step (`workflows.md`, "Limits to design around"), and name the release
  that has remove in the `changelog`.
- **A trigger added or renamed in an upgrade never runs.**
  Cause: an upgrade never turns a trigger on. AgentFlow follows a trigger by its key, so a renamed key is a new
  trigger, and a new trigger, like one moved to another workflow, lands off. The old key's trigger is turned off or
  deleted.
  Instead: keep each trigger's key from release to release, and change its filter or mappings under that key. Tell
  installers, in the `changelog`, which new, renamed or moved triggers to turn on (`workflows.md`, "Changing a
  trigger in an upgrade").
- **The install fails with `APP_STEP_FAILED on trigger:<key>`: "the workflow already has a trigger the
  organization added".**
  Cause: a workflow has at most one trigger, and the organization gave the installed workflow one of its own.
  (`build` refuses two of the package's triggers on one workflow.)
  Instead: the admin deletes the organization's trigger or moves it to another workflow, then plans again. To
  start the same steps two ways yourself, make one workflow per trigger, both built by one helper that takes what
  differs between them (`freeze_on_close` and `unfreeze_on_reopen`, say).
- **An Agent step fails with `AGENT_CEILING_DENIED: <agent> cannot read <entity>`, and nothing reaches the model.**
  Cause: the agent declares a `read_limit` that leaves out an entity the step gives it, usually the run's subject.
  `"read_limit": { "entities": [] }` leaves out every entity. `lint` reports a step that gives the agent its subject
  (`agent_read_limit_uncovered`); any other record a step hands over is caught only by the install plan, which warns
  `read_limit_step_uncovered` and installs anyway. `cannot read <Entity>.<field>, a computed field …` means a
  rollup or formula over an entity the limit leaves out, reached through a search, even one passed through a Code step
  (`agents-and-skills.md`, "What a search hands the agent").
  Instead: leave `read_limit` out unless you mean to restrict the agent, or list every entity its steps hand it
  (`agents-and-skills.md`, "What the agent may read"). Once installed, dropping `read_limit` in a later release does
  not lift the limit: release a limit that lists the entities, or have an admin grant them on the entity's Access
  tab.
- **A failed step's `error`, or the run's `error_message`, reads `null` in an installed app's run, and nothing says why.**
  Cause: an installed app's run blanks a failure's text, the step's `error` and the run's `error_message` (an
  all-or-nothing run's "Nothing was saved …" included), for every reader: AgentFlow keeps no record of what the text
  was built from, so it cannot tell whether a reader may see it. The run's input and output, and a step's `input`
  and `output`, are blanked only for a reader who may not see them. The `error_code` and `error_meaning` of a step
  and of the run stay, since they are platform text, and so does the run's `error_detail`.
  Instead: read the run's `error_detail` first. For the failures AgentFlow can state in names it says why: the
  step (`step`), the record's position in a list write (`item`), and a `reason` by `kind`, such as
  `initial_status_not_allowed` with the statuses a record may start in, `transition_not_allowed` with the status
  field, `reference_invalid` with
  the field, `key_member_missing` with the key and its empty fields, or `field_not_found` with each entity and field a
  step names that does not exist; each names its entity. It holds names from your config and never a record's value
  or a status, and AgentFlow leaves it out where it would name a field your app's ceiling hides, or for any reader,
  an entity whose definition that reader may not read (a restricted entity that grants them nothing). Your app reads it
  in the answer to a start it made with `wait_ms`, and in that start's replay; a person reads it on the run. Where
  it is absent, read the step's `error_code` and
  `error_meaning` in `node_runs[]` (the run has its own), and `withheld`, which lists each field that was blanked
  while it held a value; a `null` it does not list is really empty. The code's page in this reference says what
  to change (`STAGE_INITIAL_STATUS_INVALID` in `rules-and-stages.md`, `ENTITY_REFERENCE_INVALID` and
  `INTEGRATION_MISSING_KEY` in `steps.md`). A step coded `STEP_FAILED` names no more specific code: run the same
  workflow outside an installed app, where the text is shown (`sandbox-testing.md` of the
  `agentflow-app-release` skill, "When a run fails").
- **A run stays `paused` on a field.**
  Cause: a step names a field the run may not read or set: one the manifest's ceiling leaves out, or a secured field
  the run's identity holds no profile for. The step is checked before it starts, so it has no entry in `node_runs[]`.
  In an installed app's run `GET /instances/{id}` shows `status: 'paused'` with `auth_blocked` `null`, and names the
  step and the fields in `auth_blocked_detail`: `{ step, reason: { kind, entity, fields } }`, `kind` being
  `field_not_readable` or `field_not_writable`. A field the ceiling leaves out is named nowhere on the run, which
  names only the step (the park event's `node_id`). The app's token sees `paused` in `GET /instances` and is usually
  refused the run itself, but the answer to the start it made carries the detail. The run holds its trigger group's
  lane until it ends, so later events for the same key wait behind it.
  Instead: read `auth_blocked_detail` as the owner, or run `lint`, whose `ceiling_uncovered` names the step and a field
  the ceiling leaves out. The app's needs attention lists the run under the workflow's `ceiling:` entry, with the same
  detail in `run_details`. Declare the field, or grant the profile, then cancel the run or resume it through
  `POST /instances/{id}/authorization/resume` (not `POST /instances/{id}/resume`, which releases a person's pause
  or the app's hold, never a block on access) (`sandbox-testing.md` of the `agentflow-app-release` skill, "When a
  run fails").
- **A run fails at a Call step with a code only a write raises, such as `ENTITY_REFERENCE_INVALID`.**
  Cause: the workflow it called failed with that code. The Call step carries the callee's `error_code`, and the
  calling run carries that code and the callee's `error_detail`, whose `step` is the Call step's id. A cancelled
  callee is `SUBWORKFLOW_CANCELLED`, and a code passes up a chain of calls unchanged.
  Instead: read the detail's `reason` for what was refused. For the callee's own step and the record's position,
  read the called run: the entry of the calling run's `for_each_children[]` whose `parent_node_id` is the Call step's
  id (`workflows.md`, "Calling another workflow: `call`").
- **`APP_FILE_INVALID: agentflow.app.mjs: add open_case to ORDER`.**
  Cause: a workflow in a module that `ORDER` does not list.
  Instead: add it to `ORDER`, after every workflow it calls.
- **A template prints a file's details as JSON, not its id.**
  Cause: a file in free text (`See {{ subject.record.contract }}`) reads as the file object. A field holding
  nothing but the file still stores or sends its id.
  Instead: write `.name` for its name, `.id` for its id, or `| content` for its text (`workflows.md`, "A file's
  text").
- **The install plan reports `reference.content_not_available` or `atomic.file_content`.**
  Cause: `content()` is in a field that does not read file text (a Decision's condition, a review document's
  field mapping, a name or id), or in an all-or-nothing workflow. `build` passes it; `lint` reports it as
  `workflow_invalid`.
  Instead: move the read to a field that allows it, for example a Set Variable step before the Decision, and test
  `vars.<name>`. For an all-or-nothing workflow, read the text in the workflow that calls it and pass it in.
- **`<step> (<kind>) can't run in an all-or-nothing workflow`.**
  Cause: a graph built with `"atomic"` runs its steps in one transaction, and AgentFlow refuses there every step that
  waits (`human`, `signature`, `agent`, `extract_text`, `learn`), runs as a run of its own (`for_each`,
  `call_workflow`) or does something a rollback cannot take back (`webhook`, `integration`, `sql_query`, `code`,
  `document`, `image`, `group_files`, `notify`), as `atomic.step_not_allowed`. Only `start`, `end`, `decision`,
  `set_variable`, `fork`, `join`, `entity_record`, `entity_relationship`, `auto_number`, `email` and `message` run there.
  Instead: keep the atomic workflow to the writes that must succeed or fail together, and put the rest in a workflow
  that calls it: an approval or an agent before the call, a webhook or a notice after it (`steps.md`, "An
  all-or-nothing graph").
- **A step that reads a file's text fails with `FILE_CONTENT_FAILED`.**
  Cause: the file has no text to read: an image, a scan with no text layer, an unsupported type, or more than
  1 MiB of text.
  Instead: send files that may be images or scans to an Agent step's prompt, which sends a PNG, JPEG, GIF or WebP to
  the model as a picture (`workflows.md`, "A file's text"). Or give the step the error strategy `continue` and a
  Decision after it that routes the failure (`workflows.md`, "When a step fails"), since `FILE_CONTENT_FAILED` goes
  through it. That branch also takes a failure that a retry would have cured, so it means "the step did not run",
  not "the file has no text".
- **A record write fails `ENTITY_ATTACHMENT_INVALID`: `attachment <id> is already attached to another record`.**
  Cause: the file belongs to another record, typically a For Each over a parent's file field writing each file to a
  child record.
  Instead: mark the binding `bind("docs", ref("input.item"), { copy: true })` to give the record its own copy, or
  reference the record that holds the file. With `copy`, the
  write still fails when the run cannot read the record that holds the file (`belongs to a record this run cannot
  read`), or when the file is in a secured field and the field it is copied to is not.
- **A For Each over files hands its Agent step an id, or empty text.**
  Cause: the list source is not typed as files (a Document or Image step's `generated_files`, or
  `subject.record.<file field>`), so each child's item is a bare id, and
  publish says nothing.
  Instead: loop over a typed source, or read the text with `content(input.<itemAlias>)` in a Set Variable inside the
  child (`steps.md`, "Looping over files").
- **A For Each child's `parent.subject.record.…` is refused at publish (`reference.template_broken`,
  `reference.unknown`).**
  Cause: a child may not read the parent run's record body.
  Instead: `getById(…, "parent.subject.record_id")` in the child, or a parent step or variable that carries the value
  (`steps.md`, "What a child reads from its parent").
- **A run a person started through the app fails with `APP_CEILING_DENIED` at a For Each step, a Call Workflow step or
  an Agent step whose agent calls a workflow tool, and no child run exists.**
  Cause: a child is told who started the run, and the app's ceiling withholds that person. The manifest does not require
  the built-in `user` entity's `name` and `email` (`fields: {}` is not enough), so the step refuses to start a child
  without them. The build, the publish and the install all pass, the same workflow started by a person in AgentFlow
  runs, and so does a run nobody requested (a trigger, a schedule), which has no requester to withhold.
  Instead: add `{ "key": "user", "access": "read", "fields": { "name": "text", "email": "text" } }` to the manifest's
  `requires.entities` (`steps.md`, "Looping over files"; `examples/court-batches` does it).
- **A Human step's page never opens, or the build refuses it.**
  Cause: a `page` whose path the module does not serve (the module reads `/review/<id>` and the step says `/reviews/…`), a `page` on a
  Signature step, an Agent step or a step of a workflow built in the designer, a package with no `ui`, `mode: "embedded"`, or a
  deprecated workflow, whose tasks open in AgentFlow's view. The build refuses a page on a step that is not Human, a package
  with no `ui` and `embedded`; it cannot see what the module serves.
  Instead: make the module's route match the step's `page.path`, put the page on a Human step of the package's own workflow, declare
  `ui`, and use `mode: "redirect"` (`workflows.md`, "A page for the step").
- **A task page's note or choice is lost, or arrives empty.**
  Cause: the value rides the submission unchecked (a packaged Human step has no form), the workflow reads a key the page never set, or the
  task was finished in AgentFlow's view, which carries none.
  Instead: have the workflow handle a missing `nodes.<step>.output.<key>`, validate the value there or bind it to a typed record field,
  and never make the page the only way to finish the task.
- **A run a person started ends with no write, or its Agent step is told nothing of a record, for some people
  only.**
  Cause: a workflow that runs as the initiator reads as that person (`access.md`), so a value built from records
  of a scope they cannot read (a collection, a workspace, a record they just created when the scope hides it) is
  withheld. A Code or Entity Record step's input records `VALUE_WITHHELD` against the slot and reads nothing
  there; an Agent step's prompt and a `subject.record` read say nothing and read as empty. The run goes on and
  writes nothing or an empty value. A participant outside the scope meets it on every turn.
  Instead: split the work as "Handing work to the service principal" in `workflows.md` does. The person's run
  checks and writes the person's own input. A trigger on that record, running as the service principal, reads
  the rest, calls the model and writes the reply; it narrows what it reads to what every participant may read
  (filter in a Code step), and checks that the record is still the one it answered, so a stale reply is dropped.

## Dashboards and the launcher

- **`dashboards/o.json#/filter_bar: a package cannot install a filter bar yet`.**
  Instead: ship tiles only.
- **`... is open-ended, so it has no previous period to compare with`.**
  Cause: a tile compares with `previous_period` over `before_today` or `after_today` alone, which have no length.
  Instead: leave the comparison off; for an overdue count that is the answer. A bounded window on the same field
  (`this_month`) gives the comparison a length. `previous_year` over an open window means something only on a
  chart split by a date bucket: on a single number it counts the records overdue by more than a year.
- **Nobody but the installer sees the dashboard, or its launcher entry.**
  Cause: a packaged dashboard installs private, and an entry is hidden from anyone who cannot open its target.
  Instead: tell installers to share the dashboard with the audience group after installing.
- **`a module target needs the package's ui`.**
  Cause: a `module` launcher entry in a package with no `ui` member.
  Instead: add `ui`, or target an object.
- **An object target is refused.**
  Cause: it names a workflow, an object the package does not build, or uses a form other than a reference.
  Instead: `${dashboard:…}`, `${entity:…}` or `${entity_view:…}` of this package.
- **A launcher label appears in an unexpected language.**
  Cause: with neither the person's language nor `contentLocale` given, AgentFlow takes the first tag in
  alphabetical order, not the first written.
  Instead: give every language you need, `contentLocale` among them.
- **A module path is refused.**
  Cause: `//` anywhere (even after `?` or `#`), a backslash, a control character, or a `.` or `..` segment.
  Instead: percent-encode a URL inside a query, and write plain paths.
- **A `launch_url` is refused, or the package's value does not show.**
  Cause: anything but lowercase `https://`, or a user or password in it; or an admin's override, which wins
  and which an upgrade never changes.
  Instead: write a plain `https://` address.
- **The package's entities are gone from the app's tabs and the Records page once it ships a module.**
  Cause: an app whose module opens (the package ships `ui` and the deployment has app modules on) is reached only
  through its launcher entries. The Records page lists none of its entities, for anyone, in its audience or not,
  even one an admin put in a group; without `ui` each was a tab of the app's own.
  Instead: give an `${entity:…}` or `${entity_view:…}` entry for every entity people must browse, or a module
  screen that lists it. A record still opens from a link, search and Home.
- **A module entry is listed to someone who can read no record.**
  Cause: a module entry is listed to everyone in the app's audience; what they may open inside it is the
  module's business.
  Instead: have the module handle a person with no access.

## What `build` does not check

`pnpm build` refuses a view `filters` entry or a preset rule whose field is not a field of the entity (or, with
`reference.field`, of the package entity the reference points at), whose `op` does not suit the field's type, whose
`within` value is not a window, or whose value has the wrong shape for its `op`; a `$bind` in a fixed filter; a field's
`format`, `format_options` value or constraint its type does not take (`entities.md`, "Fields"); a
`ui.kind` other than `module` and a `ui.contract` other than 1 to 6. It warns about a launcher icon AgentFlow does
not have. A green build still does not prove the package installs. These are refused only when the package is
installed, so the first place they run is `deploy --sandbox`:

- a view's role field of the wrong type (`group_by_field`, `date_field` and the others in `entities.md`);
- a filter on a field that is not `filterable`;
- a `$bind` token that is not one AgentFlow knows, or one used with an operator it does not take;
- a filter that hops through a reference to an entity outside the package;
- a rule's fields and operators;
- a constraint's `pattern` that is not a regular expression AgentFlow takes (ECMA-262, without lookaround or a
  backreference), and a checklist's columns: exactly one text column, `done_field` naming a boolean column, and no
  other column required;
- in a workflow, a `{{ }}` template that names a step or a variable the graph does not have, or an input its `inputSchema` does not declare
  (`reference.template_broken` at install), and a path elsewhere that names a step that is missing or not upstream of
  its reader (`reference.unknown`). The build refuses a path in an Entity Record step's record id, body, filters or
  `q`, a Set Variable step, a Decision's condition, or a loop's or a per-item Email step's list when it names a step
  its graph does not have (`<step> reads nodes.fnd…, and fnd is not a step of this graph`) or one no path of edges
  leads from, a loop's back edge included (`<step> reads nodes.later…, but no edge path leads from later to <step>`);
  in a loop's body, `parent.nodes.<id>` must be upstream of the For each step;
- in a workflow, a `bind`, `flt` or `sort` key that is not a field of the entity: at the latest the step fails
  when it runs (`ENTITY_FIELD_NOT_FOUND`), so only a run that reaches the step shows it. A search's `fields` on an
  entity of the package is refused by the build, as at install (`entity_record.fields_invalid`), unless each key is a
  field the entity declares or its work adds, `name`, `created_at`, `updated_at`, `created_by`, `owner` or, on an
  entity classified by unit, `unit`; never `id`, which every returned record carries anyway; on a dependency's
  entity it is judged at install;
- a record trigger's `event.<field>` that names no field of the entity: neither the build nor the install checks it,
  and the run reads it as `null`;
- in a document template, a data table's `array_path` and columns, a repeated row's source, cell paths and shape, a
  header grid, a length without a unit AgentFlow takes, and an expression that does not parse. The build checks
  the layout's members and values against the platform's schema, not these (`document-templates.md`, "What checks a
  template").

A record trigger's `input_mappings` are checked for their shape by the build as by the install: each `from` is
`event.<field>`, `event.event.previous.<field>` or one of `event.event.record_id`, `entity_id`, `change_kind`,
`changed`, `occurred_at`, `trigger_depth`. A `connected_app` trigger's mapping reads `event.properties.<field>` and
is read with or without `event.`; neither the build nor the install checks the field's name.

A `ui.contract` the AgentFlow you deploy to does not know is refused earlier, at `lint` and at upload, as
`manifest_invalid` at `manifest.json`, and the message does not name `ui.contract`.

## The project

- **`config/build/` is missing from a commit.**
  Cause: a repository `.gitignore` that ignores `build/`.
  Instead: add an exception for the app's `config/build/`.
- **The install is refused with `human.assignee_fallback_required`.**
  Cause: a Human step whose every candidate is a rule (the initiator, a field, a manager, or a unit pool whose unit
  comes from the run) and none has a `fallback`. The build does not report it; `lint` reports it as
  `workflow_invalid`.
  Instead: add `fallback: [{ kind: "group", id: "${param:app_users}" }]` to the candidate (`workflows.md`).
- **`pnpm check` names `ui/…` files `stale`, `missing` or extra in a project with a UI module.**
  Cause: `pnpm check` compares package/ui with the module when package/ui exists, and a module change is in it
  only after a build. Without `package/ui` (git ignores it) the check says nothing of the module, and `seal` refuses.
  Instead: run `pnpm build`, then `pnpm check`.
- **A module's `@` menu offers no people once the app runs under a ceiling.**
  Cause: `GET /mentions` offers people only while the package requires the `user` entity and lists its `name` (the
  people-only `GET /mentions/people` is refused with `403 APP_CEILING_DENIED` without them; the email is told, and
  matched, only while `email` is listed too). `fields: {}` tells nothing. A record is offered only where the ceiling
  covers its entity for listing and reading: the package's own entities, what a required package exports to it, or an organization entity an admin bound a requirement to at setup.
  Instead: `requires.entities: [{ "key": "user", "access": "read", "fields": { "name": "text", "email": "text" } }]`.
  An embedded module calls as the person and is not cut.
