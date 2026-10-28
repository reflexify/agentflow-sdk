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
| `conversation` | declares the entity a conversation (below); write `null` for any other entity |
| `rules`, `stage_model` | see `rules-and-stages.md` |
| `work` | see `work.md` |

A conversation is declared on the thread entity. It names the entity whose records are its messages, the
reference field on them that points at the thread (`via`), and the message fields that play each role; each
`speakers` value is `user`, `assistant` or `exclude`, and `attachments` is optional:

```json
{ "conversation": {
  "messages": { "entity_id": "${entity:message}", "via": "thread" },
  "order": "posted_at",
  "author": { "field": "author_kind", "speakers": { "person": "user", "bot": "assistant", "unverified": "exclude" } },
  "body": "body", "attachments": "attachments",
  "status": { "field": "status", "draft": "draft" },
  "key": "key"
} }
```

The fields have to fit, or the build is refused. `via` is a reference field that points at the thread entity.
`order` is a datetime, or an `auto_number` with no code format (a plain number). `author.field` and `status.field`
are enums, and `speakers` names every option of the author enum and nothing else. `draft` is one of the status
enum's options. `body` is a text field, `attachments` a file field, and `key` a text field that is the only member
of an alternate key. Each role needs a field of its own.

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
| `text` | `"format"`: `email`, `url`, `phone` or `richtext` (long text: `summary` above). `"format_options": { "mentions": true }` lets its value hold `@` mentions of people and records, never on the display field. Constraints: `min_length`, `max_length`, `pattern`, `enforce_format` |
| `number` | `"format"`: `currency` (with `format_options.currency_code`, three capital letters), `percent`, `duration` (`duration_unit` `seconds`, `minutes` or `hours`; `duration_format` `human`, `hh_mm` or `hh_mm_ss`) or `rating` (`rating_max` 1 to 10). `format_options`: `decimal_places` 0 to 8 (`"format_options": { "decimal_places": 2 }`), `separators`. Constraints: `minimum`, `maximum` |
| `boolean` | |
| `date`, `datetime` | `"format"`: `dd_mm_yyyy`, `mm_dd_yyyy`, `iso`, `long`, `month_year` or `relative`. A `datetime` also takes `format_options.time_style`: `12h` or `24h` |
| `enum` | one choice from `enum_values` of `{ "value", "label", "color"? }`; colours: `gray`, `sky`, `teal`, `amber`, `emerald`, `violet`, `indigo`, `rose`, `fuchsia`, or a custom `#RRGGBB` |
| `multi_select` | several choices from `enum_values`; stored as a list, filtered with `in` and `not_in`, never sortable. Constraints: `min_items`, `max_items` |
| `reference` | one record: `target_entity_id` (below), `inverse_key` and `inverse_label` name the list on the target |
| `reference_list` | many records; give it `"sortable": false`. Constraints: `min_items`, `max_items` |
| `list` | rows of `item_fields` (below). Constraint: `max_items` |
| `file` | `"format": "image"` for pictures; `"format_options": { "max_files": 20 }`, 1 to 500 |
| `formula` | a computed value: `formula_expression` and `formula_result_type` (`text`, `number`, `boolean`, `date` or `datetime`), or a `rollup` (below) |
| `auto_number` | `auto_number_scope` and `auto_number_format` (below) |

**Long text.** A `text` field with `"format": "richtext"` is the only long-text kind: there is no plain multi-line
format (`text` takes `email`, `url`, `phone` and `richtext`). The value is stored, and arrives in a record's `body`,
as a **Markdown string** in the form AgentFlow's own editor and the kit's `af-rich-editor` both read and write
(`*em*`, `**bold**`, `- ` bullets, `[text](url)` links, a backslash for a hard break). To show it in a UI module,
use `af-rich-editor` with `readonly` and the Markdown as its `value` (`@reflexify/agentflow-elements/kit`; a
read-only editor has no toolbar and cannot be edited), and to edit it, the same element without `readonly`, which
reports the new Markdown in its `change` event. The kit exports no function that turns Markdown into HTML: if you
render it yourself, never put the result in `innerHTML`. For a plain note a person types in one go, a `text` field
with `max_length` and no `format` holds any string you put in it, but nothing in the config asks the record page
for a multi-line box.

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
  as the person who creates the record (`opened_by` above). **Only a person is a creator.** A record made with a
  service key (a deploy key, an import, a test script) has no `created_by`, so the default fills nothing: the field
  stays empty, a `required` one refuses the create (422), and a record scope on that field (`kind: "field"`)
  matches nobody, so that scope admits no one; only people another grant admits (organization-wide, a unit, their
  work, another field) can read the record. Make test and
  import records as a person (in a sandbox, `as(handle)`), or name the person in the field yourself.
- **`target_entity_id`**: `"${entity:<key>}"` for an entity of the package, or a platform entity by id:
  Users `ffffffff-0000-0000-0000-000000000001`, Units `ffffffff-0000-0000-0000-000000000003`. A reference or
  reference list to Users or Units is a **people field**, which grants, rules and stage models test. A package
  cannot name the Groups entity (`not an entity reference or a reserved entity id`): to involve a group, use a
  `group_ref` parameter in a grant, a rule or a mover, and a Users field for people.
- **`on_target_delete`**: `restrict`, `clear` or `cascade`, for what happens when the target is deleted.
  With `restrict` on an item's reference to its team, a team that has items cannot be deleted.
- **`natural_key`**: a list of `{ "id", "name", "fields" }`, such as
  `[{ "id": "by_name", "name": "Name in its team", "fields": ["team", "name"] }]` for a name unique within a team.
- **Order**: a formula after the fields it reads.
- **`auto_number`**: `"auto_number_scope": "item:{{ year() }}"` and
  `"auto_number_format": "IT-{{ year() }}-{{ value | pad(4) }}"` number items like `IT-2026-0001`.

A reference to another entity of the package, with its inverse:

```json config
{ "key": "team", "label": "Team", "type": "reference", "target_entity_id": "${entity:team}",
  "inverse_key": "items", "inverse_label": "Items" }
```

### A list field

`item_fields` is a list of columns: `key`, `label`, `type` (`text`, `number`, `boolean`, `date` or `enum`),
`required`, `history`, `enum_values`, `mentions` (a `text` column whose values may hold mentions: written on the column itself, not as `format_options`, which the builder refuses there). `constraints` takes `min_length`, `max_length`, `pattern`, `minimum`,
`maximum`, `min_items`, `max_items`, `enforce_format`. A checklist:

```json config
{ "key": "checklist", "label": "Checklist", "type": "list", "sortable": false,
  "item_fields": [
    { "key": "text", "label": "Text", "type": "text", "required": true, "mentions": true },
    { "key": "done", "label": "Done", "type": "boolean", "required": false, "history": false }
  ],
  "format_options": { "display": "checklist", "done_field": "done" },
  "constraints": { "max_items": 20 } }
```

### Formulas and rollups

A formula reads the record's own fields: `{ "key": "checklist_done", "type": "formula",
"formula_expression": "count_if(checklist, \"done\")", "formula_result_type": "number" }`.

Dates are the other common formula. `date_diff(from, to, "days")` is `to - from` in the unit you name (`days`,
`weeks`, `months` or `years`), and `date_add(value, 3, "months")` is the date that much later. The two operands are
field keys, not quoted strings; only the unit is quoted. So a leave request's length, counting both ends, is
`{ "key": "days", "type": "formula", "formula_expression": "date_diff(from_date, to_date, \"days\") + 1",
"formula_result_type": "number" }`, which is 3 for the 21st to the 23rd. A formula cannot call `today()`, `now()` or
`year()`: a stored value would drift between saves. The functions and filters a formula may use are listed in the
guide's "Variables & expressions" page, `<AGENTFLOW_URL>/guides/en/quy-trinh/bien-va-bieu-thuc`.

A rollup counts or sums child records. It is a `formula` with a `rollup` and no `formula_expression`.
`rollup` has `inverseKey` (camelCase, unlike every other member: the `inverse_key` of the child's reference
to this entity), `agg`, an optional `field`, and an optional `filter` of `{ field, op, value }`. A
team counts its done items:

```json config
{ "key": "items_done", "label": "Done", "type": "formula", "formula_result_type": "number",
  "rollup": { "inverseKey": "items", "agg": "count", "filter": [{ "field": "status", "op": "eq", "value": "done" }] } }
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
- **An entity with no natural title** (a loan, a visit, a request) gets an `auto_number` field and names it:
  `"display_field": "number"`.

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

  `pnpm build` checks each fixed filter and each preset rule against the entity: the field exists (a hop,
  `reference.field`, is checked against the package entity the reference points at), the `op` suits the field's type,
  a `within` value is a window and an `in`, `between` or `range_any` value has its shape, and `$bind` stands only in a
  preset. It does not check that the field is `filterable`, or a hop to an entity outside the package; AgentFlow
  refuses those at install (`pitfalls.md`, "What `build` does not check").

  A rule's field leaf takes the same operators, except `within` (use a `$date` value, `rules-and-stages.md`).

  `within` windows end today and include it: `last_<n>_days` is the last n days counting today (n from 1 to
  3660, no leading zero), and `this_month`, `this_quarter` and `this_year` run to the period's end. A `within`
  filter always includes today, so no fixed filter can say "before today": a view cannot list overdue records
  on its own.

  **An "overdue" view.** Ship a view of the open records sorted by the due date ascending, with a preset
  `{ "field": "due", "op": "lt", "value": { "$bind": "today" } }` named "Past due", and name the launcher
  entry for the view ("Loans out"), not "Overdue". For loans: the view's fixed filter is `status eq approved`
  and `sort` is `{ "key": "due", "dir": "asc" }`, so the late ones come first. Do not approximate with
  `within last_365_days`: it lists records due today and drops older ones.

  **An "overdue" list a person opens from the launcher.** A launcher entry cannot open a view with a preset
  or a query: its `object` target is the view's address and nothing more (`dashboards-and-launcher.md`). A
  `module` target can: it opens a route of the package's UI module, and the route may carry a query
  (`"target": { "module": "/overdue" }`). Give that route a screen that sends the comparison itself,
  `{ "field": "due", "op": "lt", "value": "<today as YYYY-MM-DD>" }` with the open statuses, sorted by `due`
  ascending, through the records query (the `agentflow-ui-module` skill, "Reading records"). The entry needs the
  manifest's `ui`, it is listed to everyone in the app's audience, and what a person sees in it is still decided
  by their grants. Name the entry for what it lists ("Overdue loans" is honest here, because the filter really
  compares with today).
- `sort` defaults to `{ "key": "updated_at", "dir": "desc" }`; `key` is a `sortable` field, `updated_at` or
  `created_at`.
- `config.presets`: quick filters a person picks from the view's toolbar, each `{ "id", "label", "rules" }`
  (`id` is a UUID, fixed in the file; `lint` does not count it as `uuid_literal`). Only here does a value read the person looking: `{ "$bind": "viewer.id" }`
  (with `eq`, `ne`, `in`, `not_in`), `{ "$bind": "viewer.groups" }` (with `in`, `not_in`) and
  `{ "$bind": "today" }` (a `date` field with `eq`, `ne`, `gt`, `gte`, `lt`, `lte`; a `datetime` field with `gt`, `gte`, `lt`, `lte`).

**`$bind` in a fixed `filters` entry is refused.** `pnpm build` stops with `entities/<entity>.json#/views/<n>/filters/<m>/value:
a fixed filter compares as written and never resolves $bind: put the filter in a preset in config.presets`. A package
built with SDK 0.3.0 or earlier got through, and the platform compared the value as the text
`{"$bind":"viewer.id"}`, so the view listed nothing, for everyone. For "my records":

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

An entity's views, one with a preset and one with a fixed filter:

```json config
{ "views": [
  { "key": "all", "name": "Items", "columns": ["title", "team", "status", "priority", "due", "claimed_by"],
    "config": { "presets": [{ "id": "0190f8f4-0000-7000-8000-0000000000f1", "label": "Mine",
      "rules": [{ "field": "claimed_by", "op": "eq", "value": { "$bind": "viewer.id" } }] }] } },
  { "key": "open", "name": "Open items", "columns": ["title", "team", "status", "priority", "due", "claimed_by"],
    "filters": [{ "field": "status", "op": "in", "value": ["todo", "doing"] }] }
] }
```

## The create form

`create_form` is `{ "name", "description"?, "schema" }` and becomes the `form:<entity>` object. `schema` is a
JSON Schema of `"type": "object"`; each property names the field it fills with `x-entityField`.

- **Every `required` field needs a property in the form**, or no `required`. A required field that no property
  binds cannot be filled in, and the install refuses the form; `lint` reports it as `required_field_unbound` on the
  field, at `/required`. A field with a `default` (the creator, a literal) is filled without the form, so drop
  `required` from it rather than bind it.
- An enum property repeats the field's values: `{ "type": "string", "enum": ["annual", "sick"], "x-entityField":
  "leave_type" }`.
- A reference property has `"format": "entity"` and `x-entity`: an entity key of the package, `user` or
  `org_unit`.
- A people-list property puts `"format": "entity"` under `items`, and keeps `x-entity` on the array.
- A `date` field's property is `{ "type": "string", "format": "date" }`, and a `datetime` field's is
  `{ "type": "string", "format": "date-time", "x-entityField": "start" }`. AgentFlow sets the `type` and
  `format` of a bound date or datetime property from the field itself, so a missing or wrong one is corrected,
  not refused. The value the form accepts for a `datetime` is an RFC 3339 timestamp with a time and an offset,
  such as `2026-03-01T09:00:00Z`; `2026-03-01` or `2026-03-01T09:00` is refused as a bad `format`.
- A `file` field's property is always a list of file ids, even when `max_files` is 1:
  `{ "type": "array", "items": { "type": "string", "format": "attachment" }, "x-entityField": "document" }`.
  `build` and `lint` do not check a property's shape, so write it as shown.
- The layout is always vertical; you write no UI schema.
- The form decides what a create **through the records API** may set (a person on AgentFlow's own create page,
  a UI module, a service principal): `POST /entities/{id}/records` keeps only the keys the form binds. A
  workflow's `create` step does not go through the form: it writes every field it binds (a status, a
  position, `opened_by`), whether or not the form shows it. A UI module that must set another field on create
  patches it in a second write, or starts a workflow that creates the record.

A create form with a people list:

```json config
{ "create_form": { "name": "Team", "schema": { "type": "object", "properties": {
  "name": { "type": "string", "x-entityField": "name" },
  "managers": { "type": "array", "items": { "type": "string", "format": "entity" }, "x-entity": "user", "x-entityField": "managers" }
} } } }
```

And a reference to another entity of the package:
`"team": { "type": "string", "format": "entity", "x-entity": "team", "x-entityField": "team" }`.

## Comments

`comments` makes an entity's records take a comment thread: `{ "enabled": true, "closed_when": { "join": "and",
"leaves": [{ "kind": "field", "rule": { "field": "frozen", "op": "eq", "value": true } }] } }`. `closed_when` is
optional and makes a record's thread read-only while it holds. Its leaves are field leaves over the entity's own
declared fields (no `reference.field` hop): posting a comment writes nothing, so a write leaf is refused. Once
installed the setting is the app's: an administrator's change is refused until the app is detached. A release
that drops `comments` turns comments off and keeps the comments already posted.

**A package that ships a `detail` view places the thread itself.** Installing never adds the block: the record
page draws the stored layout as written, so a layout without one shows no comments, and a comment notice links
to that page. Put `{ "kind": "comments" }` in the layout, at the bottom of the wide column (the generated default
puts it there). A package with no `detail` view gets the generated default, which already holds it.
