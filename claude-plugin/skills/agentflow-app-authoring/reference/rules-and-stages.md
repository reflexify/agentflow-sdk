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
  A `value` is a literal, `{ "$field": "<other field>" }`, `{ "$bind": "viewer.id" }` or
  `{ "$date": { "offset": -18, "unit": "years" } }` (`unit`: `days`, `weeks`, `months`, `years`).
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

A workflow a trigger starts runs as a service principal, which passes only `in_group`. To let its writes through
a rule, put its service principal in an automation group and negate `in_group` on that group. A workflow people
start runs as the person who started it (`INITIATOR`), and its writes are judged on that person like any
of theirs: see `workflows.md`, "Who a workflow runs as".

### Worked examples (Projects' `config/entities/task.json`)

Only the holder or a project manager may change the content, once the task exists:

```json config
{ "key": "content_by_owner_or_manager", "message": "Only the owner or a project manager changes this", "field": "title",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "is_update" } },
    { "kind": "write", "write": { "op": "changed_any", "fields": ["title", "description", "due", "priority", "collaborators"] } },
    { "kind": "write", "write": { "op": "actor", "negate": true, "test": { "kind": "is_holder" } } },
    { "kind": "write", "write": { "op": "actor", "negate": true,
      "test": { "kind": "in_parent_field", "field": "project", "parent_field": "managers" } } } ] } }
```

A frozen task stays frozen, except for the automation group's workflow (the stored value, so `was`):

```json config
{ "key": "frozen_is_frozen", "message": "This task is frozen because its project is closed",
  "condition": { "join": "and", "leaves": [
    { "kind": "write", "write": { "op": "is_update" } },
    { "kind": "write", "write": { "op": "was", "rule": { "field": "frozen", "op": "eq", "value": true } } },
    { "kind": "write", "write": { "op": "actor", "negate": true,
      "test": { "kind": "in_group", "group_id": "${param:automation_group}" } } } ] } }
```

A task cannot move to another project, and a closed project takes no new tasks:

```json config
{ "rules": [
  { "key": "project_is_fixed", "message": "A record cannot move to another project", "field": "project",
    "condition": { "join": "and", "leaves": [
      { "kind": "write", "write": { "op": "is_update" } },
      { "kind": "write", "write": { "op": "changed", "field": "project" } } ] } },
  { "key": "no_task_in_closed_project", "message": "A closed project takes no new tasks", "field": "project",
    "condition": { "join": "and", "leaves": [
      { "kind": "write", "write": { "op": "is_new" } },
      { "kind": "field", "rule": { "field": "project.status", "op": "eq", "value": "closed" } } ] } }
] }
```

A hop compared with an own field: `{ "field": "section.project", "op": "ne", "value": { "$field": "project" } }`
refuses a section of another project (`section_in_project`).

### How rules go wrong

- **On a create, every test of the stored record is false, and its negation true.** A rule meant for edits
  must start with `{ "op": "is_update" }`, or it refuses every create.
- **A field leaf reads the value being written.** For "the stored value is …", use a `was` leaf.
- **`$field` needs the same type on both sides.** Compare the hop (`label.base_status`) with the enum, not a
  text formula.
- **`changed_any` names fields one by one.** A field added later is open to everyone with `update` until you
  add it to the rule that guards its peers.
- **A rule cannot read a rollup** ("at most 20 children"). Enforce that in the UI, or not at all.

## Stage model

`stage_model` gates changes of one status field: `{ "status_field", "initial_statuses"?, "transitions" }`.

- `status_field`: an enum field the entity declares (not a seeded one).
- `initial_statuses`: the values a record may be created in.
- `transitions`: each `{ "from", "to", "required_fields"?, "condition"?, "movers"? }`. `from` and `to` are
  values of the field (`closed is not a value of status` otherwise). `required_fields` must be set for the
  move. `movers` is a list of actor tests: whoever passes any one may make the move.

A move that no transition allows is refused, and the running app answers 422 `STAGE_TRANSITION_NOT_ALLOWED`.
The mover also needs `update` on the record from a grant.

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

Projects' project (`config/entities/project.json`) lets its managers or the admin group move it:

```json config
{ "from": "active", "to": "closed", "required_fields": [],
  "movers": [{ "kind": "in_field", "field": "managers" }, { "kind": "in_group", "group_id": "${param:project_admins}" }] }
```

- Write one transition per pair of values a person may move between, both ways where both are allowed.
- Add the admin group as a mover wherever admins move records: they get no bypass.
- `is_holder` as a mover needs `work.assignable` (`is_holder needs work.assignable`).
