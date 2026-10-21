# An entity file: `config/entities/<key>.json`

One file per entity. The file name, without `.json`, equals `key`. `name`, `fields`, `views` and `access` are
required; a file without one is refused with a location (`entities/note.json#/views: an array of views`).
Access, rules, stage models and work have their own reference files.

| Member | Meaning |
|---|---|
| `key` | the entity key; equals the file name |
| `name`, `description`, `icon`, `accent` | carried as written (not translated) |
| `icon`, `accent` (values) | `icon` is one of the 39 names listed under `icon` in `dashboards-and-launcher.md`; `accent` is `sky`, `amber`, `emerald`, `violet`, `orange`, `rose`, `indigo`, `teal`, `cyan` or `slate`. Anything else installs: an unknown `icon` draws the database icon, an unknown `accent` slate |
| `fields` | the fields, in display order |
| `natural_key` | the field sets that identify a record; `[]` for none |
| `display_field` | the field shown as the record's title |
| `views` | the record lists |
| `create_form` | the form for creating a record |
| `access` | `{ "mode", "grants" }`: see `access.md` |
| `conversation` | declares the entity a conversation; write `null` unless you copy the support desk's |
| `rules`, `stage_model` | see `rules-and-stages.md` |
| `work` | see `work.md` |

When you add an entity, add its key to `entityOrder` in `agentflow.app.mjs` if that file has one: an entity
file that `entityOrder` does not name is refused, and so is the reverse.

## The case desk's entity

`config/entities/case.json` in the starter, with its access as the starter has it. Its `rules` and `stage_model`
are left out here: they are in `rules-and-stages.md`, and an entity without them is valid as it stands.

```json config
{
  "key": "case", "name": "Case", "description": "A case someone opened, and how its review ended.", "icon": "inbox", "accent": "sky",
  "fields": [
    { "key": "title", "label": "Title", "type": "text", "required": true, "searchable": true },
    { "key": "urgent", "label": "Urgent", "type": "boolean", "default": { "kind": "literal", "value": false } },
    { "key": "opened_on", "label": "Opened on", "type": "date" },
    { "key": "summary", "label": "Summary", "type": "text", "format": "richtext" },
    { "key": "amount", "label": "Amount", "type": "number" },
    { "key": "status", "label": "Status", "type": "enum", "facetable": true,
      "enum_values": [ { "value": "open", "label": "Open", "color": "sky" }, { "value": "approved", "label": "Approved", "color": "emerald" },
                       { "value": "rejected", "label": "Rejected", "color": "rose" } ],
      "default": { "kind": "literal", "value": "open" } },
    { "key": "opened_by", "label": "Opened by", "type": "reference", "target_entity_id": "ffffffff-0000-0000-0000-000000000001",
      "default": { "kind": "creator" } }
  ],
  "natural_key": [], "display_field": "title",
  "views": [ { "key": "all", "name": "Cases", "columns": ["title", "urgent", "status", "opened_on"] } ],
  "create_form": { "name": "Case", "schema": { "type": "object", "properties": {
    "title": { "type": "string", "x-entityField": "title" },
    "urgent": { "type": "boolean", "x-entityField": "urgent" },
    "opened_on": { "type": "string", "format": "date", "x-entityField": "opened_on" } } } },
  "access": { "mode": "restricted", "grants": [
    { "principal": { "kind": "group", "id": "${param:app_users}" }, "design": false,
      "operations": [ { "operation": "read", "scope": "organization" }, { "operation": "list", "scope": "organization" },
                      { "operation": "create", "scope": "organization" },
                      { "operation": "update", "record_scopes": [ { "kind": "field", "field": "opened_by" } ] } ] } ] },
  "conversation": null
}
```

## Fields

Each field becomes an `entity_field:<entity>/<key>` object. A field takes these members and no other:
`key`, `type`, `label`, `description`, `required`, `searchable`, `filterable`, `facetable`, `sortable`,
`enum_values`, `default`, `format`, `format_options`, `inverse_key`, `inverse_label`, `target_entity_id`,
`on_target_delete`, `auto_number_scope`, `auto_number_format`, `formula_expression`, `formula_result_type`,
`rollup`, `item_fields`, `constraints`, `reference_filter`. Anything else, `sensitive` included, is refused
with `not a member the package's entity_field lists`.

The builder does not check `type`, `format`, `format_options` or `constraints`, and neither does `lint`:
AgentFlow checks them when the package is installed, so a mistake shows on the admin's setup page or fails the
activation, long after your build. Use only these. The thirteen types and what each takes:

| `type` | Notes, and what it accepts |
|---|---|
| `text` | `"format"`: `email`, `url`, `phone` or `richtext` (long text: `summary` above). Constraints: `min_length`, `max_length`, `pattern`, `enforce_format` |
| `number` | `"format"`: `currency` (with `format_options.currency_code`, three capital letters), `percent`, `duration` (`duration_unit` `seconds`, `minutes` or `hours`; `duration_format` `human`, `hh_mm` or `hh_mm_ss`) or `rating` (`rating_max` 1 to 10). `format_options`: `decimal_places` 0 to 8 (`"format_options": { "decimal_places": 2 }`), `separators`. Constraints: `minimum`, `maximum` |
| `boolean` | |
| `date`, `datetime` | `"format"`: `dd_mm_yyyy`, `mm_dd_yyyy`, `iso`, `long`, `month_year` or `relative`. A `datetime` also takes `format_options.time_style`: `12h` or `24h` |
| `enum` | one choice from `enum_values` of `{ "value", "label", "color"? }`; colours: `gray`, `sky`, `teal`, `amber`, `emerald`, `violet`, `indigo`, `rose`, `fuchsia`, or a custom `#RRGGBB` |
| `multi_select` | several choices from `enum_values`; stored as a list, filtered with `in` and `not_in`, never sortable. Constraints: `min_items`, `max_items` |
| `reference` | one record: `target_entity_id` (below), `inverse_key` and `inverse_label` name the list on the target |
| `reference_list` | many records; give it `"sortable": false` (Projects' `managers`, `collaborators`). Constraints: `min_items`, `max_items` |
| `list` | rows of `item_fields` (below). Constraint: `max_items` |
| `file` | `"format": "image"` for pictures; `"format_options": { "max_files": 20 }`, 1 to 500 (Projects' `attachments`) |
| `formula` | a computed value: `formula_expression` and `formula_result_type` (`text`, `number`, `boolean`, `date` or `datetime`), or a `rollup` (below) |
| `auto_number` | `auto_number_scope` and `auto_number_format` (below) |

A `format` the type does not take, or a constraint it does not allow, is refused at install. What a
field can do in a list, a filter or a sort follows from its type unless you set it:

| `type` | `filterable` | `sortable` | `searchable` | `facetable` |
|---|---|---|---|---|
| `text` | yes | yes | yes | no |
| `number`, `date`, `datetime`, `auto_number` | yes | yes | no | no |
| `boolean`, `enum`, `reference` | yes | yes | no | yes |
| `multi_select`, `reference_list` | yes | no | no | yes |
| `list` | yes (emptiness only) | no | no | no |
| `file` | no | no | no | no |
| `formula` | as its result type | as its result type | no | as its result type |

A view's `filters` need `filterable`, and its `sort` needs `sortable`.

- **`default`**: `{ "kind": "literal", "value": … }`, or `{ "kind": "creator" }` for a people field that starts
  as the person who creates the record (`opened_by` above).
- **`target_entity_id`**: `"${entity:<key>}"` for an entity of the package, or a platform entity by id:
  Users `ffffffff-0000-0000-0000-000000000001`, Units `ffffffff-0000-0000-0000-000000000003`. A reference or
  reference list to Users or Units is a **people field**, which grants, rules and stage models test. A package
  cannot name the Groups entity (`not an entity reference or a reserved entity id`): to involve a group, use a
  `group_ref` parameter in a grant, a rule or a mover, and a Users field for people.
- **`on_target_delete`**: `restrict`, `clear` or `cascade`, for what happens when the target is deleted.
  Projects' `task.project` is `restrict`: a project with tasks cannot be deleted.
- **`natural_key`**: a list of `{ "id", "name", "fields" }`. Projects' section has
  `[{ "id": "by_name", "name": "Name in its project", "fields": ["project", "name"] }]`.
- **Order**: a formula after the fields it reads.
- **`auto_number`**: the support desk's ticket `number` (`config/entities/ticket.json`) has
  `"auto_number_scope": "ticket:{{ year() }}"` and `"auto_number_format": "TK-{{ year() }}-{{ value | pad(4) }}"`,
  which numbers tickets like `TK-2026-0001`.

A reference to another entity of the package, with its inverse (the support desk's `config/entities/note.json`):

```json config
{ "key": "ticket", "label": "Ticket", "type": "reference", "target_entity_id": "${entity:ticket}",
  "inverse_key": "notes", "inverse_label": "Notes" }
```

### A list field

`item_fields` is a list of columns: `key`, `label`, `type` (`text`, `number`, `boolean`, `date` or `enum`),
`required`, `history`, `enum_values`. `constraints` takes `min_length`, `max_length`, `pattern`, `minimum`,
`maximum`, `min_items`, `max_items`, `enforce_format`. Projects' checklist (`config/entities/task.json`):

```json config
{ "key": "checklist", "label": "Checklist", "type": "list", "sortable": false,
  "item_fields": [
    { "key": "text", "label": "Text", "type": "text", "required": true },
    { "key": "done", "label": "Done", "type": "boolean", "required": false, "history": false }
  ],
  "format_options": { "display": "checklist", "done_field": "done" },
  "constraints": { "max_items": 20 } }
```

### Formulas and rollups

A formula reads the record's own fields: `{ "key": "checklist_done", "type": "formula",
"formula_expression": "count_if(checklist, \"done\")", "formula_result_type": "number" }` (Projects' task).

A rollup counts or sums child records. It is a `formula` with a `rollup` and no `formula_expression`.
`rollup` has `inverseKey` (camelCase, unlike every other member: the `inverse_key` of the child's reference
to this entity), `agg`, an optional `field`, and an optional `filter` of `{ field, op, value }`. Projects'
project counts its done tasks (`config/entities/project.json`):

```json config
{ "key": "tasks_done", "label": "Done", "type": "formula", "formula_result_type": "number",
  "rollup": { "inverseKey": "tasks", "agg": "count", "filter": [{ "field": "status", "op": "eq", "value": "done" }] } }
```

A rule cannot read a rollup, and a workflow should not read a record that has one: see `pitfalls.md`.

### The display field

`display_field` names the field whose value is the record's title: in pickers, in a reference's label
(`ref_labels`), in the inbox and in lists. Declare it for every entity.

- It must be one of the entity's own `fields`, a scalar and not a system field: `text`, `number`, `boolean`,
  `date`, `datetime`, `enum`, `multi_select`, `formula` and `auto_number` all work (use a `text`, `auto_number` or `formula` field for a title people read). A `reference`,
  `reference_list`, `file` or `list` field cannot be one (the install refuses it).
- Without one, the title is the first field in `fields` order that is not a reference, reference list, file,
  list or system field, else the record's id: an entity with only references, reference lists, files and lists reads as ids.
- A sensitive field's value is withheld from people without access to it, so do not make one the title.
- **An entity with no natural title** (a loan, a visit, a request) gets an `auto_number` field and names it. The
  support desk's ticket does: `"display_field": "number"`.

```json config
{ "fields": [
    { "key": "number", "label": "Number", "type": "auto_number",
      "auto_number_scope": "loan:{{ year() }}", "auto_number_format": "LN-{{ year() }}-{{ value | pad(4) }}" },
    { "key": "item", "label": "Item", "type": "reference", "target_entity_id": "${entity:equipment}", "required": true }
  ],
  "display_field": "number" }
```

A person cannot type the number: it is minted when the record is created, so leave it out of the create form.

## Views

Each view becomes an `entity_view:<entity>/<key>` object. Members: `key`, `name`, `description`, `type`,
`config`, `columns`, `filters`, `sort`.

- `type`: `grid` (the default), `kanban`, `calendar`, `gallery`, `timeline`, `map`, `inbox` or `detail`.
  Others are refused (`a view type the builder has no rule for: matrix`). Most types need a field in `config`:

  | `type` | `config` member | Field it takes |
  |---|---|---|
  | `grid` | `group_by_field` (optional) | an enum, reference, boolean or text field |
  | `kanban` | `group_by_field` (required) | an enum field |
  | `calendar` | `date_field` (required), `end_field` | a date or datetime field |
  | `timeline` | `start_field`, `end_field` (both required) | date or datetime fields |
  | `inbox` | `sort_field` (required) | a number, date or datetime field |
  | `gallery` | `cover_field` (required) | a file field |
  | `detail`, `map` | none; no field can fill a `map` yet | |

  AgentFlow refuses a view whose role field has the wrong type when the package is installed, not at `lint`.
- `columns`: field keys of the entity, including those its `work` seeds. A key that is not a field is
  refused (`nope is not a field of case`).
- `filters`: a list of `{ "field", "op", "value" }`, **fixed**: each `value` is a literal and is compared as
  written. `field` may be `reference.field` to filter through one reference. `op` depends on the field's type:

  | Field type | `op` |
  |---|---|
  | `text` | `eq`, `ne`, `contains`, `not_contains`, `starts_with`, `ends_with` |
  | `number` | `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `between` (`[low, high]`) |
  | `date`, `datetime` | the number operators, and `within` (`today`, `last_<n>_days`, `this_month`, `this_quarter`, `this_year`) |
  | `enum`, `reference` | `eq`, `ne`, `in`, `not_in` (a list value) |
  | `boolean` | `eq`, `ne` |
  | `multi_select`, `reference_list` | `in`, `not_in` |
  | any | `is_empty`, `is_not_empty` (no value) |

  A rule's field leaf takes the same operators, except `within` (use a `$date` value, `rules-and-stages.md`).
- `sort` defaults to `{ "key": "updated_at", "dir": "desc" }`; `key` is a `sortable` field, `updated_at` or
  `created_at`.
- `config.presets`: quick filters a person picks from the view's toolbar, each `{ "id", "label", "rules" }`
  (`id` is a UUID, fixed in the file). Only here does a value read the person looking: `{ "$bind": "viewer.id" }`
  (with `eq`, `ne`, `in`, `not_in`), `{ "$bind": "viewer.groups" }` (with `in`, `not_in`) and
  `{ "$bind": "today" }` (a `date` field with `eq`, `ne`, `gt`, `gte`, `lt`, `lte`; a `datetime` field with `gt`, `gte`, `lt`, `lte`).

**`$bind` in a fixed `filters` entry does nothing useful.** It saves, but the value is compared as the text
`{"$bind":"viewer.id"}`, so the view lists nothing, for everyone. For "my records":

- a **preset** `Mine`, as below, when the person may choose it;
- a **record scope** in the grant (`{ "kind": "field", "field": "borrower" }`, `access.md`) when a person may see
  only their own records whatever they pick: the view then lists exactly those;
- in a UI module, a filter the module sends itself, with `host.context.person.id` (`agentflow-ui-module`).

**A preset is never the default, and a launcher entry cannot open one.** A view opens with no preset chosen: a
view has no "default preset" member, and a launcher entry's `object` target opens the view itself
(`/entities/<id>/records?view=<view id>`), with no way to name a preset. So a `Mine` preset is a click the
person makes, for everyone. A record scope, the other way to get "my records", **narrows only the people it is
the sole grant for**: a person who also holds a wider grant (an IT group with organization scope) sees every
record in the same view, because grants add up. To give those people "my X" too, give them a UI module screen
that sends the filter itself with `host.context.person.id`, or tell them to pick the preset. Do not promise a
"My X" launcher entry that is mine for everyone.

Projects' task views (`config/entities/task.json`), one with a preset and one with a fixed filter:

```json config
{ "views": [
  { "key": "all", "name": "Tasks", "columns": ["title", "project", "section", "status", "priority", "due", "claimed_by"],
    "config": { "presets": [{ "id": "0190f8f4-0000-7000-8000-0000000000f1", "label": "Mine",
      "rules": [{ "field": "claimed_by", "op": "eq", "value": { "$bind": "viewer.id" } }] }] } },
  { "key": "open", "name": "Open tasks", "columns": ["title", "project", "status", "priority", "due", "claimed_by"],
    "filters": [{ "field": "status", "op": "in", "value": ["todo", "doing"] }] }
] }
```

## The create form

`create_form` is `{ "name", "description"?, "schema" }` and becomes the `form:<entity>` object. `schema` is a
JSON Schema of `"type": "object"`; each property names the field it fills with `x-entityField`.

- A reference property has `"format": "entity"` and `x-entity`: an entity key of the package, `user` or
  `org_unit`.
- A people-list property puts `"format": "entity"` under `items`, and keeps `x-entity` on the array.
- A `date` field's property is `{ "type": "string", "format": "date" }`.
- The layout is always vertical; you write no UI schema.
- The form decides what a create **through the records API** may set (a person on AgentFlow's own create page,
  a UI module, a service principal): `POST /entities/{id}/records` keeps only the keys the form binds. A
  workflow's `create` step does not go through the form: it writes every field it binds (a status, a
  position, `opened_by`), whether or not the form shows it. A UI module that must set another field on create
  patches it in a second write, or starts a workflow that creates the record.

Projects' project form, abridged to two of its properties, with a people list (`config/entities/project.json`):

```json config
{ "create_form": { "name": "Project", "schema": { "type": "object", "properties": {
  "name": { "type": "string", "x-entityField": "name" },
  "managers": { "type": "array", "items": { "type": "string", "format": "entity" }, "x-entity": "user", "x-entityField": "managers" }
} } } }
```

And a reference to another entity of the package (Projects' task form):
`"project": { "type": "string", "format": "entity", "x-entity": "project", "x-entityField": "project" }`.
