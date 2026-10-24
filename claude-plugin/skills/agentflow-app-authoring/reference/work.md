# Work: lifecycle, assignment, priority and deadlines

Write `work` on an entity that people are assigned to and finish, like a task or a ticket. It puts the
records in people's work lists, routes them to people, and runs clocks on them. It has at least one of
`lifecycle`, `assignable`, `work_surface`, `deadline`:

- `assignable` and `deadline` need `lifecycle` (`needs work.lifecycle`);
- `work_surface` needs `assignable`.

## An example

```json config
{ "work": {
  "lifecycle": { "status_field": "status", "categories": { "todo": "active", "doing": "active", "done": "done", "cancelled": "cancelled" } },
  "assignable": { "claim": "readers", "rules": [{ "on": "start", "assign": [{ "kind": "dynamic", "source": { "type": "creator" } }] }] },
  "work_surface": { "priority": { "field": "priority", "values": { "low": "low", "medium": "normal", "high": "high", "urgent": "urgent" } } }
} }
```

An item is active while `todo` or `doing`; its creator gets it when work starts; anyone who can read it may
claim it; its `priority` field drives its priority in work lists.

## `lifecycle`

`{ "status_field", "categories" }`, both required. `status_field` is an own enum field. `categories` maps
every value of it, and no other, to `none`, `active`, `waiting`, `done` or `cancelled`.

## `assignable`

`{ "claim"?, "rules"? }`.

- `claim`: who may claim unassigned work: `candidates` (the people a rule assigned it to) or `readers`
  (anyone who can read the record).
- `rules`: at most 50 routing rules, each `{ "on", "when"?, "assign" }`:
  - `on`: `"start"` (when work starts) or `{ "enter": ["<status>", …] }` (when the record enters a status);
  - `when`: an optional condition object;
  - `assign`: 1 to 50 assignees.

The assignees:

| Assignee | Shape |
|---|---|
| a person | `{ "kind": "user", "id": "${param:<user_ref>}" }` |
| a group | `{ "kind": "group", "id": "${param:<group_ref>}" }` |
| a unit | `{ "kind": "unit", "anchor": { "type": "fixed", "unit_id": "${param:<unit_ref>}" }, "reach"?: "unit" or "subtree", "group"?: "${param:<group_ref>}" }` |
| from the record | `{ "kind": "dynamic", "source", "relation"?, "fallback"? }` |

For `dynamic`:

- `source`: `{ "type": "creator" }`, or `{ "type": "field", "key": "<people field>" }` (a field the entity
  declares, not a Units field);
- `relation`: `{ "type": "direct" }`, or `{ "type": "manager", "levels": 1 }` to `5` (a manager needs a single
  reference to Users);
- `fallback`: up to 50 `user`, `group` or `unit` assignees, for when the source gives no one.

A second rule that hands a record to a group when it enters a status (from the builder's README):

```json config
{ "on": { "enter": ["doing"] }, "assign": [{ "kind": "group", "id": "${param:automation_group}" }] }
```

## `work_surface`

`{ "priority": { "field", "values"? } }`: `field` is an own enum field, and `values` maps its values to
`urgent`, `high`, `normal` or `low`.

## `deadline`

`{ "clocks": [...] }`, 1 to 5 clocks. A clock is `{ "key", "label", "start", "pause_in"?, "stop"?,
"sla_policy", "escalation_policy"? }`:

- `key`: `^[a-z][a-z0-9_]{0,23}$`. `label`: 1 to 80 characters.
- `start`: `{ "on": "work_start" }` or `{ "on": "enter", "statuses": [...] }`.
- `pause_in`: statuses in which the clock stops running.
- `stop`: `{ "statuses"?, "field"? }`; `field` is a field the entity declares itself.
- `sla_policy`: a `${param:…}` of type `sla_policy_ref`. `escalation_policy`: one of type
  `escalation_policy_ref`.

```json config
{ "deadline": { "clocks": [{ "key": "due", "label": "Due", "start": { "on": "work_start" },
  "pause_in": ["doing"], "sla_policy": "${param:sla}" }] } }
```

## The fields work seeds

Work adds fields to the entity. Views, rules, scopes and stage models may name them, but the entity may not
declare a field with one of these keys:

- `lifecycle`: `work_state`, `work_started_at`, `done_at`;
- `assignable`: `assigned_users`, `assigned_groups`, `assigned_units`, `claimed_by`, `assigned_at`,
  `claimed_at`, `minutes_to_claim`, `minutes_to_done`;
- each clock: `<key>_state`, `<key>_outcome`, `<key>_due_at`, `<key>_breached_at`, `<key>_stopped_at`,
  `<key>_minutes`.

The views in `entities.md` show `claimed_by`, and their "Mine" preset filters on it.

## With access and stage models

- `{ "kind": "work" }` as a record scope gives the people who hold work on a record access to it.
- `is_holder` is an actor test for the holder, in rules and as a stage-model mover. A transition to `done` whose
  only mover is `is_holder` lets only the holder finish the record.
- Both need `assignable`.
