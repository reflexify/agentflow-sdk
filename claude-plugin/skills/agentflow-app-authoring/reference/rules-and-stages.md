# Rules and stage models

Grants say who may write a record at all. Rules refuse particular writes, and a stage model says who may
move a status field from one value to another. Both live in the entity file.

## Rules

`rules` is a list of at most 50 rules. **A rule refuses a write when its condition holds**, so describe the
write to refuse, not the write to allow. Members: `key`, `name`, `condition`, `message`, `field`, `enabled`. Only `key`,
`condition` and `message` are required: a rule with no
`name` installs, and AgentFlow names it from what its condition reads. A blank `name` is refused.

- `key`: lowercase, starts with a letter, at most 40 characters of letters, digits and single `_`; unique in
  the entity.
- `name`: 1 to 120 characters. `message`: 1 to 300, shown to the person refused.
- `field`: the field the message belongs to on a form. `enabled`: a boolean.
- `condition`: `{ "join"?: "and" | "or", "leaves": [...] }`, 1 to 20 leaves.

The case desk's one rule (`config/entities/case.json`):

```json config
{ "rules": [
  { "key": "title_required", "message": "A case needs a title", "field": "title",
    "condition": { "join": "and", "leaves": [ { "kind": "field", "rule": { "field": "title", "op": "is_empty" } } ] } }
] }
```

### Leaves

- **A field leaf**, `{ "kind": "field", "rule": { "field", "op", "value"? } }`, tests the value being written. `field` is an own field, a field the entity's `work` seeds, or one hop through a single
  reference to an entity of the package (`project.status`). `op` is one a view filter takes for that field's
  type (`entities.md`, "Views"): `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `contains`, `not_contains`,
  `starts_with`, `ends_with`, `between`, `is_empty`, `is_not_empty`; a rule refuses `within`.
  A `value` is a literal, `{ "$field": "<other field>" }` or
  `{ "$date": { "offset": -18, "unit": "years" } }` (`unit`: `days`, `weeks`, `months`, `years`). A `$bind` belongs
  in a view's preset only: a rule judges the record and its write, which have no viewer, so the build refuses
  `{ "$bind": "viewer.id" }` here. Test the writer with an actor leaf (below).
  - **`$date` is a day counted from today**, and `{ "offset": 0, "unit": "days" }` is today itself. Both members are
    required; a negative `offset` is in the past, and its size is at most 10,000. Today is the organization's
    today: the day it is now in the zone of the organization's business calendar (UTC when none is set), not the
    server's and not the person's. It is read once for each write, so a batch is judged against one day, and a
    stored value is never re-checked as days go by.
  - It is a bound: only `gt`, `gte`, `lt` and `lte`, on a `date` or `datetime` field (any other operator or field
    type is refused when the package installs). On a `date`, `lt` is before today and `gte` is today or later: the
    rule that refuses a due date in the past is `due_date lt { "$date": { "offset": 0, "unit": "days" } }`, with a
    `changed` leaf beside it when edits may keep an old date (the worked example below). On a `datetime`, today is the whole local day:
    `gte` and `lt` compare with today's midnight, `gt` means after today has ended and `lte` means before it ends.
- **A write leaf**, `{ "kind": "write", "write": { "op", … } }`, tests the write itself:
  - `{ "op": "is_new" }`: a create. `{ "op": "is_update" }`: a change to an existing record.
  - `{ "op": "changed", "field" }` and `{ "op": "changed_any", "fields": [...] }`: the write changes that field.
  - `{ "op": "was", "rule": { "field", "op", "value"? } }`: the value stored before the write (no hop).
  - `{ "op": "actor", "test": {…}, "negate"?: true }`: who is writing (below). `negate` exists only here.

### Actor tests

Used in an `actor` leaf and as a stage model's `movers`. `kind` is one of:

| `kind` | True when the writer | Needs |
|---|---|---|
| `is_owner` | owns the record | |
| `is_holder` | holds the record's work | `work.assignable` |
| `in_field` | is in a people field of the record | `field` |
| `in_parent_field` | is in a people field of the record's parent | `field`, `parent_field` |
| `in_group` | is in a group | `group_id`: a `${param:…}` of type `group_ref` |
| `is_elevated_run` | is a run with elevated rights; a trigger-started workflow's service principal does not pass it | |

**An actor test reads the record as it was stored before the write**, never the values being written, so a
payload cannot vouch for itself: writing yourself into `am` does not make you pass `in_field` on `am`. On a create
there is no stored record, so `is_owner`, `is_holder`, `in_field` and `in_parent_field` are all false. "The person
who creates an order is its `am`" is not a rule: give `am` a `creator` default and leave it out of the create
form, which keeps only the keys it binds (`entities.md`, "The create form").

A workflow a trigger starts runs as a service principal, which passes only `in_group`. To let its writes through
a rule, put its service principal in an automation group and negate `in_group` on that group. A workflow people
start runs as the person who started it (`INITIATOR`), and its writes are judged on that person like any
of theirs: see `workflows.md`, "Who a workflow runs as".

### Worked examples

Rules on an item that belongs to a team. Only the holder or a team manager may change the content, once the item exists. `is_holder` needs `work.assignable` on the entity, so the item's `work` declares it:

```json config
{ "key": "content_by_owner_or_manager", "message": "Only the owner or a team manager changes this", "field": "title",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "is_update" } },
    { "kind": "write", "write": { "op": "changed_any", "fields": ["title", "description", "due", "priority", "collaborators"] } },
    { "kind": "write", "write": { "op": "actor", "negate": true, "test": { "kind": "is_holder" } } },
    { "kind": "write", "write": { "op": "actor", "negate": true,
      "test": { "kind": "in_parent_field", "field": "team", "parent_field": "managers" } } } ] } }
```

A frozen item stays frozen, except for the automation group's workflow (the stored value, so `was`):

```json config
{ "key": "frozen_is_frozen", "message": "This item is frozen because its team is closed",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "is_update" } },
    { "kind": "write", "write": { "op": "was", "rule": { "field": "frozen", "op": "eq", "value": true } } },
    { "kind": "write", "write": { "op": "actor", "negate": true,
      "test": { "kind": "in_group", "group_id": "${param:automation_group}" } } } ] } }
```

A date in the past is refused on a create and on a change, by **one** rule: a condition is one `join` over one flat
list of leaves, so "a create, or a change of the date" cannot be written with `is_new` and `is_update` side by
side, but `changed` already covers both. On a create it holds for every field the new record holds, a default
included (there is no earlier record to differ from), and on an update only for a field the write moves. A create
that leaves the date empty, and an edit that keeps the stored date (closing the record after the date passed,
say), are not refused:

```json config
{ "key": "due_not_past", "message": "The due date cannot be in the past", "field": "due_date",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "changed", "field": "due_date" } },
    { "kind": "field", "rule": { "field": "due_date", "op": "lt", "value": { "$date": { "offset": 0, "unit": "days" } } } } ] } }
```

Write two rules only when the two cases need different messages. Put `is_new` in a rule only to confine it to
creates, and `is_update` only to confine it to edits.

**A field fixed once the record exists** (read-only after create, such as a key other records store): an item
cannot move to another team. And a closed team takes no new items:

```json config
{ "rules": [
  { "key": "team_is_fixed", "message": "A record cannot move to another team", "field": "team",
    "condition": { "join": "and", "leaves": [
      { "kind": "write", "write": { "op": "is_update" } },
      { "kind": "write", "write": { "op": "changed", "field": "team" } } ] } },
  { "key": "no_item_in_closed_team", "message": "A closed team takes no new items", "field": "team",
    "condition": { "join": "and", "leaves": [
      { "kind": "write", "write": { "op": "is_new" } },
      { "kind": "field", "rule": { "field": "team.status", "op": "eq", "value": "closed" } } ] } }
] }
```

On a record that exists, the record page shows a fixed field as not editable, with the rule's message, and a save
that changes it anyway is refused with the same message.

**A field the workflow or the creator default fills**, and no person types (`opened_by`, the person who opened the case),
is fixed the same way, because nothing else makes a field read-only: a person with `update` can rewrite it, and
`pitfalls.md` ("A new field is editable by everyone with `update`") lists the peers this also catches. A creator
default fills it on the create, so the rule needs `is_update` and no exception. A field a workflow writes needs the
writer let through, here the automation group of a workflow a trigger starts (a workflow people start writes as the
person, whom the rule locks like anyone):

```json config
{ "key": "opened_by_is_fixed", "message": "Who opened the case is filled in, not typed", "field": "opened_by",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "is_update" } },
    { "kind": "write", "write": { "op": "changed", "field": "opened_by" } },
    { "kind": "write", "write": { "op": "actor", "negate": true,
      "test": { "kind": "in_group", "group_id": "${param:automation_group}" } } } ] } }
```

A hop compared with an own field: `{ "field": "folder.team", "op": "ne", "value": { "$field": "team" } }`
refuses a folder of another team (`folder_in_team`).

**A count the workflow keeps**, such as how often a record entered the `review` stage, is a number field that no person
types. Nothing counts stage entries for you: a formula or a rollup reads fields, not history. Keep the count in a
field, leave it out of the create form, and let a workflow add one:

```json config
{ "key": "review_entries", "label": "Times in review", "type": "number", "default": { "kind": "literal", "value": 0 } }
```

```js
// the one step of a workflow whose trigger is "a status becomes review" (workflows.md, Triggers)
update("count", "Count the entry", "${entity:request}", "subject.record_id",
  [bind("review_entries", tpl("{{ (subject.record.review_entries or 0) + 1 }}"))]),
```

- **No Code step is needed.** A template that is only one `{{ … }}` is evaluated, not rendered as text, so
  `tpl("{{ … + 1 }}")` writes a number. `subject.record` is read when the step runs, and `or 0` covers a record
  with no count yet.
- **A trigger on the status counts every way in**, a person's edit as much as a workflow's write. The step changes
  only `review_entries`, so its own write does not start the trigger again.
- **Lock the field for people** with the `opened_by_is_fixed` rule above, naming `review_entries`: the trigger starts the
  workflow as a service principal, which the automation group lets through.
- It is a read and then a write, not an atomic increment: two runs for one record at the same moment can count once.

### How rules go wrong

- **On a create, every test of the stored record is false, and its negation true.** A rule meant for edits
  must start with `{ "op": "is_update" }`, or it refuses every create.
- **A field leaf reads the value being written.** For "the stored value is …", use a `was` leaf.
- **`$field` needs the same type on both sides.** Compare the hop (`label.base_status`) with the enum, not a
  text formula.
- **`changed_any` names fields one by one.** A field added later is open to everyone with `update` until you
  add it to the rule that guards its peers. A field only the workflow or the creator default fills has a rule of its
  own, above.
- **A rule cannot read a rollup** ("at most 20 children"). Enforce that in the UI, or not at all.
- **A rule never judges a delete.** Rules run on a create and an update only. A delete is gated by the grant's
  `delete` operation and its record scope, by `restrict` references, by the app's ceiling and by open tasks on the
  record, never by the record's state. To make removal depend on the state ("only AP, and only while the invoice is
  held"), do not delete: mark the record removed with an update (a `removed` boolean or a status), guard that update
  with a rule, and grant `delete` to nobody. The history stays too.

## Stage model

`stage_model` gates changes of one status field: `{ "status_field", "initial_statuses"?, "transitions" }`.

- `status_field`: an enum field the entity declares (not a seeded one).
- `initial_statuses`: the values a record may be created in.
- `transitions`: each `{ "from", "to", "required_fields"?, "condition"?, "movers"? }`. `from` and `to` are
  values of the field (`closed is not a value of status` otherwise). `required_fields` must be set for the
  move. `movers` is a list of actor tests: whoever passes any one may make the move. A transition with no `movers`
  (left out or `[]`) lets anyone who may update the record make it, a workflow's run included, once its `required_fields` and
  `condition` hold. A package cannot keep
  a move for the workflow engine alone: only entities AgentFlow manages have such moves.
- `condition` is a JSONLogic test of the record as the write leaves it, reading its fields with `var`, not a rule's
  `{ join, leaves }`: `{ "<": [{ "var": "estimate" }, 1000] }` allows the move only for an estimate under 1000.
  `build` does not check it. The install fails with `APP_STEP_FAILED` at `VALIDATION_ERROR` on a condition that does
  not parse or reads a field by a path it builds rather than writes out, and at `ENTITY_FIELD_NOT_FOUND` on one that
  names a field the entity lacks, a path through a reference included. A condition, a `required_fields` entry or a
  mover that names a field the organization has secured fails the install, or an upgrade whose release changes the
  stage model, at `ENTITY_SENSITIVE_FILTER_DENIED` (`VALIDATION_ERROR` for an `in_parent_field` mover whose
  `parent_field` is secured); an upgrade that keeps the model as it was is not judged again. A move whose condition does not
  hold is refused with 422 `STAGE_CONDITION_FAILED`. Of a move a write makes, AgentFlow checks the movers, then
  `required_fields`, then the condition, against the record as the write leaves it. A move made on the record page
  checks the condition first, against the record before the move's values, then that those values fill
  `required_fields`, and then the write checks all three as above.

A move that no transition allows is refused, and the running app answers 422 `STAGE_TRANSITION_NOT_ALLOWED`,
naming the stored and the requested status (`no transition from 'approved' to 'draft'`) to a writer who may read
the field. Writing the status a record already has is not a move, and the stage model never refuses it (a rule or
a missing grant still may), so `STAGE_TRANSITION_NOT_ALLOWED` on a write of the same status means the stored status
was not the one you expected: something wrote it first.
The mover also needs `update` on the record from a grant.

A record created in a status that `initial_statuses` does not list, or with no status and no default, is refused with
422 `STAGE_INITIAL_STATUS_INVALID`, and so is a record without a status that is given its first one outside the list.
A model with no transition, or with no `initial_statuses`, admits any. The refusal names the allowed statuses
(`a record can enter the stage model only in: open`) to a writer who may read the field. In a workflow it fails the
step, and one element of a `createMany` in such a status fails the whole step, which writes nothing. In an installed
app's run the failure's text is withheld from every reader, so the run's `error_detail` says it instead:
`{ step, reason: { kind: "initial_status_not_allowed", entity, field, allowed } }` names the entity, the status
field and the statuses a record may start in, and a refused move is `transition_not_allowed` with the entity and the
status field. It names no status, and not whether the model lacks the move or keeps it for the engine or for movers:
the status the record held is its value, so read the model for the moves it has (`pitfalls.md`, "A
failed step's `error`, or the run's `error_message`, reads `null`"). An app whose ceiling hides the status field is
told no detail for a stage refusal, since the detail would name the field. Neither `build`, `lint` nor install checks the status a
step writes. To bring in records that are further along (an import of finished tasks), create them in an initial
status and move each one by a transition its writer may make, or list the status in `initial_statuses`.

The case desk (`config/entities/case.json`): a case starts `open`, and its opener may approve or reject it.
The "Open a case" workflow is started by people, so it runs as them and makes the same moves as the person who
started it. When only one group may move the status, the workflow that records the decision is started by a
trigger and runs as a service principal that is a mover through the automation group: the worked example in
`workflows.md`.

```json config
{ "stage_model": { "status_field": "status", "initial_statuses": ["open"], "transitions": [
  { "from": "open", "to": "approved", "required_fields": [], "movers": [ { "kind": "in_field", "field": "opened_by" } ] },
  { "from": "open", "to": "rejected", "required_fields": [], "movers": [ { "kind": "in_field", "field": "opened_by" } ] }
] } }
```

A team that its managers or the admin group may close:

```json config
{ "from": "active", "to": "closed", "required_fields": [],
  "movers": [{ "kind": "in_field", "field": "managers" }, { "kind": "in_group", "group_id": "${param:admin_group}" }] }
```

- Write one transition per pair of values a person may move between, both ways where both are allowed.
- Add the admin group as a mover wherever admins move records: they get no bypass.
- `is_holder` as a mover needs `work.assignable` (`is_holder needs work.assignable`).

## Which refusal a write meets first

A write is judged in two parts, and the first check that refuses ends it with its code. The payload's own checks
come first, before the write begins:

- An update through `PATCH`: a key the entity has no field for (`ENTITY_FIELD_NOT_FOUND`), then a value of the
  wrong shape for its field (`VALIDATION_ERROR`), then a required field the update clears (`VALIDATION_ERROR`).
- A create: a required field left empty (`VALIDATION_ERROR`). The field defaults are filled before this check, so a
  required field a default answers passes.

Then the write itself judges the record, in one order on every entity and for every writer, a person, a key or a
workflow step:

1. The fields the writer may not write: `ENTITY_SENSITIVE_WRITE_DENIED`.
2. The stage model, when an update moves the status: no transition between the two values, a move only the
   workflow engine makes, or a writer no mover describes (`STAGE_TRANSITION_NOT_ALLOWED`); then the move's
   `required_fields` (`STAGE_REQUIRED_FIELDS_MISSING`); then its `condition` (`STAGE_CONDITION_FAILED`). A create
   checks its status against `initial_statuses` (`STAGE_INITIAL_STATUS_INVALID`).
3. A required field an update empties, then the fields' own constraints: `VALIDATION_ERROR`.
4. The rules: `ENTITY_VALIDATION_RULE_FAILED`.

A workflow step never gets `ENTITY_SENSITIVE_WRITE_DENIED`. Its write is rolled back and its run is paused on the
fields it may not write, until they are granted and the run is resumed (`sandbox-testing.md` of the
`agentflow-app-release` skill, "When a run fails"). A step that names a field its entity does not have fails its
run with `ENTITY_FIELD_NOT_FOUND`, unless the app's access hides that key: the run then pauses, as it does for a
field it may not write.

So when both a stage model and a rule would refuse one write, the stage model's code comes back. A write that one
entity refuses with `STAGE_TRANSITION_NOT_ALLOWED` and another with `ENTITY_VALIDATION_RULE_FAILED` met different
facts, not a different order. The stage model refused nothing on the second because:

- the write did not move the status: it wrote the value the record already had, or did not write the status field;
- the transition exists, the writer is one of its movers, and the record as the write leaves it fills the move's
  `required_fields` and meets its `condition`, so only a rule was left to refuse. When either of those fails,
  `STAGE_REQUIRED_FIELDS_MISSING` or `STAGE_CONDITION_FAILED` comes back, not the rule's code;
- the record's status was empty and the write set one that `initial_statuses` lists. A status set on a record with
  no status is judged as a create is: one the list leaves out fails `STAGE_INITIAL_STATUS_INVALID`, and one it
  lists leaves the rest to the rules. An empty `initial_statuses` admits any status;
- the entity's stage model has no `transitions`, which gates no move at all.

The opposite write, one that empties a status the record had, fails `STAGE_TRANSITION_NOT_ALLOWED` on any model with
`transitions`: no transition leads to no status.

An `updateMany` or `updateEach` step writes several records at once. It takes every record through steps 1 to 3
first, and runs the rules only once all of them have passed. So any record's stage refusal comes back before any
record's rule refusal, wherever the two records sit in the list.

A grant comes before all of these: a writer with no `create` or `update` grant for the write is refused before any
of them, a person with 403.
