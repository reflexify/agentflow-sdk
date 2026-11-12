# An entity file: `config/entities/<key>.json`

One file per entity. The file name, without `.json`, equals `key`. `name`, `fields`, `views` and `access` are
required; a file without one is refused with a location (`entities/note.json#/views: an array of views`).
Access, rules, stage models and work have their own reference files; `source` and an extension of another package's sourced entity are at the end of this one.

| Member | Meaning |
|---|---|
| `key` | the entity key; equals the file name |
| `name`, `description`, `icon`, `accent` | carried as written (not translated) |
| `icon`, `accent` (values) | `icon` is one of the 40 names listed under `icon` in `dashboards-and-launcher.md`; `accent` is `sky`, `amber`, `emerald`, `violet`, `orange`, `rose`, `indigo`, `teal`, `cyan` or `slate`. Anything else installs: an unknown `icon` draws the database icon, an unknown `accent` slate. A deployment older than the release that added the gear, `settings`, does not know it and draws the database icon |
| `fields` | the fields, in display order |
| `natural_key` | the field sets that identify a record; `[]` for none |
| `seed` | records the install creates, once per natural key (below, "Starter records: `seed`") |
| `display_field` | the field shown as the record's title: a scalar field the file declares ("The display field", below) |
| `views` | the record lists |
| `metrics` | the entity's metric catalogue: figures its views' summaries show and its dashboards' tiles follow by key (below, "Metrics") |
| `create_form` | the form for creating a record |
| `access` | `{ "mode", "grants" }`: see `access.md` |
| `conversation` | declares the entity a conversation (below); write `null` for any other entity |
| `rules`, `stage_model` | see `rules-and-stages.md` |
| `work` | see `work.md` |
| `source` | fills the entity from a synced stream; its records are then read-only (below) |
| `requires_unit_classification` | `true` files every record in an organizational unit: the platform adds a read-only `unit` field, and a grant may scope to a person's unit (below, "Records filed in a unit"). A boolean; anything else is refused at `/requires_unit_classification` |

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

**What declaring a conversation gives.** Declare one when an entity's records are threads whose messages are
records of another entity, written by people and by an agent. Then:

- an Agent step reads a thread as the conversation it answers (`workflows.md`, "Agent steps that read a
  conversation");
- a step that saves from an agent's answer can skip the write when a message joined the thread after the agent
  read it (`workflows.md`, "Saving from an agent's answer: the conversation check").

In an installed app the roles are the app's contract: the organization may add an option to `speakers`, but not
move a role to another field, map an option to another speaker, or clear the conversation (`APP_OBJECT_GUARDED`).

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
`rollup`, `item_fields`, `constraints`, `reference_filter`, `recommendedSecured`, `queriedByApp`. Anything else is
refused with `not a member the package's entity_field lists`. `sensitive` is refused with its own message: a package
never secures a field, so write `"recommendedSecured": true` to ask the organization to (`access.md`, "Fields only
some people may read").

**`queriedByApp`** says that your module filters or sorts on the field: set `"queriedByApp": true` on each field a
records query of the module names in a `filter` or a `sort`. AgentFlow does not read the module's code, so this is how
it learns. It changes nothing for the people who use the app. It lets AgentFlow warn an admin who is about to secure
the field that the app's screens fail to load for people who cannot read it, because a filter or sort on a field the
reader may not read is refused. The admin may still secure it. Only the package that owns the field can mark it: a
package that queries a field it borrows from another cannot, and an entity extension's field (below) does not take the
member. A field cannot carry `queriedByApp: true` and `"recommendedSecured": true` together: one says the app needs
the field to be readable and the other asks the organization to restrict it, so the build refuses the pair at
`/fields/<n>/queriedByApp`. A package whose fields carry the member, with either value, needs platform `2027.01`; the
builder writes that month in `minPlatformVersion` (`manifest.md`), and an older AgentFlow refuses the package.

**Every entity has a text field `name`** (label "Name"). When `fields` declares none, the install adds it first in
field order, and an entity with no `display_field` shows it as the record's title (below, "The display field").
Declare a field keyed `name` to give it your own label or settings; it must be a scalar. An entity whose title is
another field still has `name`, empty unless something writes it.

The builder refuses a `type` that is not one of the thirteen below, a `format` the type does not take (a formula's
by its `formula_result_type`; an `auto_number`'s is left to AgentFlow), and a `format_options` name or value or a
constraint that AgentFlow refuses: an option the field's type or format does not take (`separators` on a `rating`
number, `currency_code` without `format: currency`, `time_style` on a date), a value outside the ones below, and a
`minimum` above the `maximum`. An option and a constraint go by the type of the field's values: a formula's result
type, and an `auto_number`'s `number` without an `auto_number_format`, `text` with one. Two things wait for the
install, and `lint` checks neither: whether a constraint's `pattern` is a regular expression AgentFlow takes
(ECMA-262, no lookaround or backreference; the build refuses one over 500 characters), and a checklist's columns
(below). A mistake there shows on the admin's setup page or fails the activation, long after your build. The thirteen
types and what each takes:

| `type` | Notes, and what it accepts |
|---|---|
| `text` | `"format"`: `email`, `url`, `phone` or `richtext` (long text: `summary` above). `"format_options": { "mentions": true }` lets its value hold `@` mentions of people and records, never on the display field. Constraints: `min_length`, `max_length`, `pattern`, `enforce_format` |
| `number` | `"format"`: `currency` (with `format_options.currency_code`, three capital letters), `percent`, `duration` (`duration_unit` `seconds`, `minutes` or `hours`; `duration_format` `human`, `hh_mm` or `hh_mm_ss`) or `rating` (`rating_max` 1 to 10). `format_options`: `decimal_places` 0 to 8 (`"format_options": { "decimal_places": 2 }`), and `separators`: `locale` (the default: the reader's language), `comma_dot` (`1,234.5`), `dot_comma` (`1.234,5`), `space_comma` (`1 234,5`) or `none` (the language's decimal, no groups), in which AgentFlow's tables, record page, tiles and forms show and read the number whatever the reader's language; a module passes the same word to `af-number-input`'s `separators`. Neither option goes on `rating` or `duration`. Constraints: `minimum`, `maximum`. The server stores the number as sent and never rounds it. `decimal_places` fixes the fraction digits AgentFlow shows (`98.5` at 2 is `98.50`, a longer value rounded on screen), and AgentFlow's own forms round what a person types to that many. With none, its forms keep every digit, while its tables, record page and tiles show at most three, so `0.000123` reads as `0` there. A field that must keep more digits than it shows takes no `decimal_places`. A `percent` field stores the percentage itself (`98.5` is 98.5%). A value with more digits than that is the module's to draw (the UI skill's `kit-in-react.md`, "A form") |
| `boolean` | |
| `date`, `datetime` | `"format"`: `dd_mm_yyyy`, `mm_dd_yyyy`, `iso`, `long`, `month_year` or `relative`. A `datetime` also takes `format_options.time_style`: `12h` or `24h`. No field takes a mask of your own (`DD.MM.YYYY`): `dd_mm_yyyy` shows a date as 20/02/2026, and a module that wants another mask draws it itself |
| `enum` | one choice from `enum_values` of `{ "value", "label", "color"? }`; colours: `gray`, `sky`, `teal`, `amber`, `emerald`, `violet`, `indigo`, `rose`, `fuchsia`, or a custom `#RRGGBB`; `green` and `red` are refused, so a requirement that asks for green or red takes `emerald` or `rose`, or a `#RRGGBB` for an exact shade |
| `multi_select` | several choices from `enum_values`; stored as a list, filtered with `in` and `not_in`, never sortable. Constraints: `min_items`, `max_items` |
| `reference` | one record: `target_entity_id` (below), `inverse_key` and `inverse_label` name the list on the target |
| `reference_list` | many records; give it `"sortable": false`. Constraints: `min_items`, `max_items`. It keeps the order it is written in, duplicates included, and a step writes it whole (`listMode` is for `list` fields); a reverse lookup reads it without order |
| `list` | rows of `item_fields` (below). Constraint: `max_items`, 1 to 200 |
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

A `format` the type does not take, or a constraint it does not allow, is refused by the build, as at install (an
`auto_number`'s format at install). What a field can do in a list, a filter or a sort follows from its type unless you
set it:

| `type` | `filterable` | `sortable` | `searchable` | `facetable` |
|---|---|---|---|---|
| `text` | yes | yes | yes | no |
| `number`, `date`, `datetime`, `auto_number` | yes | yes | no | no |
| `boolean`, `enum`, `reference` | yes | yes | no | yes |
| `multi_select`, `reference_list` | yes | no | no | yes |
| `list` | yes (emptiness only) | no | no | no |
| `file` | no | no | no | no |
| `formula` | as its result type | as its result type | no | as its result type |

A view's `filters` need `filterable`, and its `sort` needs `sortable`. `searchable` is what a records query's free-text
`q` reads (`agentflow-ui-module`, `records-api.md`): leave it out and a `text` field is searched, so set
`"searchable": false` on one that holds what a search should not reach, such as a private note. A secured field is
never searched, and neither is the name of the record a reference points at.

- **`default`**: `{ "kind": "literal", "value": … }`, or `{ "kind": "creator" }` for a people field that starts
  as the person who creates the record (`opened_by` above). **Only a person is a creator.** A record made with a
  service key (a deploy key, an import, a test script) has no `created_by`, so the default fills nothing: the field
  stays empty, a `required` one refuses the create (422), and a record scope on that field (`kind: "field"`)
  matches nobody, so that scope admits no one; only people another grant admits (organization-wide, a unit, their
  work, another field) can read the record. Make test and
  import records as a person (in a sandbox, `as(handle)`), or name the person in the field yourself.
  On a reference to a profile entity (`"target_entity_id": "${entity:employee}"`) the same default fills the
  creator's own record there ("A person's profile" below). Any other reference takes no default, and
  `agentflow-app lint` reports `creator_default_invalid`.
- **`target_entity_id`**: `"${entity:<key>}"` for an entity of the package, or a platform entity by id:
  Users `ffffffff-0000-0000-0000-000000000001`, Groups `ffffffff-0000-0000-0000-000000000002`, Units
  `ffffffff-0000-0000-0000-000000000003`, each listed in the manifest's `requires.entities` (`user`, `group`,
  `org_unit`; `manifest.md`). The same ids are how a workflow step names them (`steps.md`, `getByKey`). A reference or reference list to Users or Units is a **people field**,
  which grants, rules and stage models test. One to Groups is a people field for record scopes, where a group in it
  stands for its members (`access.md`, "How to design access"). To involve a fixed group in a grant, a rule or a
  mover, use a `group_ref` parameter. A Groups field needs an AgentFlow build from 2026-10-14 or later.
- **`on_target_delete`**: `restrict`, `clear` or `cascade`, for what happens when the target is deleted.
  With `restrict` on an item's reference to its team, a team that has items cannot be deleted. `clear` is refused on a
  `required` field and on a field a `natural_key` names.
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
`required`, `history`, `enum_values`, `mentions` (a `text` column whose values may hold mentions: written on the column itself, not as `format_options`, which the builder refuses there). The list field's `constraints` takes only `max_items`, 1 to 200.
`format_options.display` is `table` or `checklist`; a checklist names its tick box in `done_field`, a `boolean` column,
and has exactly one `text` column and no other required column, which the install checks and the build does not. A checklist:

```json config
{ "key": "checklist", "label": "Checklist", "type": "list", "sortable": false,
  "item_fields": [
    { "key": "text", "label": "Text", "type": "text", "required": true, "mentions": true },
    { "key": "done", "label": "Done", "type": "boolean", "required": false, "history": false }
  ],
  "format_options": { "display": "checklist", "done_field": "done" },
  "constraints": { "max_items": 20 } }
```

### A file belongs to one record

A file field holds files that belong to its record, and a file belongs to exactly one record. A step that writes a
file another record already holds fails with `ENTITY_ATTACHMENT_INVALID`
(`attachment <id> is already attached to another record`), and the run fails on that first attempt (an AgentFlow
build from before 2026-10-30 retries the step three times first). A file the run itself holds, one uploaded through a start or Human form
or made by a Document or Image step, is copied on each write, so one run may put it on several records. To put a file
another record holds on a second record, mark the binding: `bind("docs", ref("input.item"), { copy: true })`. The
record gets its own copy. The run must be able to read the record that holds the file, as a Get of it would, and a
file in a secured field is copied only into a secured field. The copy is not automatic
because everyone who can read the new record can read it. To show one file in two places without copying it,
reference the record that holds it. `copy` needs an AgentFlow build from 2026-10-30 or later.

### Formulas and rollups

A formula reads the record's own fields: `{ "key": "checklist_done", "type": "formula",
"formula_expression": "count_if(checklist, \"done\")", "formula_result_type": "number" }`.

A formula also reads one field of the record a single reference points at: with a `customer` reference,
`customer.tier`, or `"VIP" if customer.is_vip else "Standard"`. One hop only (`customer.region.name` is refused),
never through a reference list or to Users, Groups or Units, and never a secured field. The value is stored, so a
change to the customer reaches this record on its next write, not at once. A workflow that reads the record needs
read on the referenced entity too (`workflows.md`, "Limits to design around").

Rates and thresholds an admin should be able to change go on a record the formula reaches through a reference,
not into the formula: with a `price_list` reference,
`amount * price_list.high_rate if amount >= price_list.threshold else amount * price_list.base_rate`. There is no
lookup function; a third tier is one more `if … else`. A formula reads no parameter, and nothing else of the
organization's.

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

A rule cannot read a rollup (`rules-and-stages.md`). A workflow reads a record's rollups as fields, a Decision
included, as long as its run-as principal may read what the record's formulas read through (`workflows.md`).

### The display field

`display_field` names the field whose value is the record's title: in pickers, in a reference's label
(`ref_labels`), in the inbox and in lists. Declare it for every entity.

- It must be one of the entity's own `fields`, a scalar and not a system field: `text`, `number`, `boolean`,
  `date`, `datetime`, `enum`, `multi_select`, `formula` and `auto_number` all work (use a `text`, `auto_number` or `formula` field for a title people read). A `reference`,
  `reference_list`, `file` or `list` field cannot be one, nor a text field that allows mentions: `pnpm build` refuses each,
  as the install does. To name a record after what it refers to, make a `formula` that reads through the reference.
- Without one, the title is `name` (Fields, above), which is empty unless something writes it.
- A secured field's value is withheld from people without access to it, so do not make one the title.
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
  | `date`, `datetime` | the number operators, and `within` (`today`, `last_<n>_days`, `this_month`, `this_quarter`, `this_year`, `before_today`, `after_today`) |
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

  `within` windows are days counted from the organization's today: `last_<n>_days` is the last n days counting
  today (n from 1 to 3660, no leading zero), and `this_month`, `this_quarter` and `this_year` run to the period's
  end. `before_today` is every day before today and `after_today` every day after it; neither includes today.
  An AgentFlow build older than the release that added those two refuses them at install, and
  `minPlatformVersion` is a month, so it cannot tell such a build from a later one in the same month: check the
  deployment's release before relying on them.

  **An "overdue" view.** Ship a view whose fixed filters are the open statuses and
  `{ "field": "due", "op": "within", "value": "before_today" }`, with `sort` `{ "key": "due", "dir": "asc" }` so
  the longest overdue come first. For loans the other fixed filter is `status eq approved`. Do not approximate
  with `within last_365_days`: it lists records due today and drops older ones.

  **An "overdue" list a person opens from the launcher.** An `object` entry opens the view itself
  (`${entity_view:loan/overdue}`), so the view above is the list; name the entry for what it lists ("Overdue
  loans"). A list that needs a preset or a query a fixed filter cannot say is a `module` entry instead
  (`"target": { "module": "/overdue" }`), whose screen sends the comparison through the records query (the
  `agentflow-ui-module` skill, "Reading records"). The entry needs the manifest's `ui`, it is listed to everyone
  in the app's audience, and what a person sees in it is still decided by their grants.
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

## Metrics

An entity's `metrics` are its metric catalogue, the figures over its records that the Metrics tab lists. Each becomes
an `entity_metric:<entity>/<key>` object. Members: `key`, `label` (required, with something in it) and `fn` (required),
and the members a dashboard measure takes besides: `field`, `filter`, `group_by`, `ratio`, `thresholds`, `color`,
`percentile` and `duration` (`dashboards-and-launcher.md` describes each `fn` and member). `deprecated: true` lets one go
in a later release, as for any object.

```json config
{ "metrics": [
  { "key": "open_items", "label": "Open items", "fn": "count",
    "filter": [{ "field": "status", "op": "in", "value": ["todo", "doing"] }] },
  { "key": "total_estimate", "label": "Total estimate", "fn": "sum", "field": "estimate" }
] }
```

- **A view's summary shows metrics by reference.** `config.summary.metric_ids` lists them, each
  `${entity_metric:<entity>/<key>}`; the build writes a sentinel and refuses one that names no metric of the package.
- **A related list's `summary_metrics` mixes two things.** It ticks from the summaries of the views the list is bound
  to: a view's own inline metric (in that view's `config.summary.metrics`) stays the id written there, and a metric of
  the catalogue is `${entity_metric:<entity>/<key>}`. Any other id is `uuid_literal` at lint, except on a list bound
  to a view the package does not carry (`@req:`, `@dep:` or a raw id): lint cannot read that view's metrics, so it
  accepts whatever ids the list ticks there.
- **A dashboard tile follows a metric by key, never by id**: `metric: "open_items"` in a measure, on a tile whose
  entity defines it (`dashboards-and-launcher.md`). An id differs in every organization.
- **Only the package's own metrics.** A package cannot export a metric or ask a dependency for one, so a tile follows a
  metric the same package ships on the tile's own entity.
- **It needs platform `2027.03`**: the build raises `minPlatformVersion` to it for a package that ships a metric.
- **The build checks the members and the references.** AgentFlow judges the definition when the package installs: that
  `field` and the fields in `filter` exist and suit `fn`, and at most 16 metrics on the entity, the organization's own
  included.
- **In an installed app the organization may rename a metric, recolour it and change its thresholds, and nothing
  else.** Changing its key or what it counts is refused (`APP_OBJECT_GUARDED`), and deleting it is refused while the
  app still uses it, so a module that follows the package's metric can rely on its meaning. An upgrade replaces the
  metric's definition, but **when the organization renamed it and the release changes what it counts, the install plan
  asks the admin**: keep the organization's label and the old definition, or take the release's label and definition.
  A release that changes only `label` or `color` renames the metric where the organization kept the package's label.

## The create form

`create_form` is `{ "name", "description"?, "schema" }` and becomes the `form:<entity>` object. `schema` is a
JSON Schema of `"type": "object"`; each property names the field it fills with `x-entityField`.

- **Every `required` field needs a property in the form**, or no `required`. A required field that no property
  binds cannot be filled in, and the install refuses the form; `lint` reports it as `required_field_unbound` on the
  field, at `/required`. A field with a `default` (the creator, a literal) is filled without the form, so drop
  `required` from it rather than bind it.
- An enum property repeats the field's values: `{ "type": "string", "enum": ["annual", "sick"], "x-entityField":
  "leave_type" }`. AgentFlow writes the options from the field when it reads the form, so a list that is missing or
  out of date is replaced, not refused.
- A `multi_select` property is a list of strings: `{ "type": "array", "items": { "type": "string" }, "x-entityField":
  "tags" }`. AgentFlow writes `items` from the field's options, and the value is the chosen options'
  values; the field's `min_items` and `max_items` apply.
- A reference property has `"format": "entity"` and `x-entity`: an entity key of the package, `user`, `group`,
  `org_unit`, or the field's `${dep:<package id>#entity:<key>}` when it targets a required package's entity. The
  builder refuses any other key and says which it takes.
- A people-list property puts `"format": "entity"` under `items`, and keeps `x-entity` on the array.
- **A field that references Groups** takes `"x-entity": "group"`, and AgentFlow draws its Groups picker for it. A
  reference list is a people-list property with `x-entity` on the array: `{ "type": "array", "items": { "type":
  "string", "format": "entity" }, "x-entity": "group", "x-entityField": "visible_to" }`. List `group` in the manifest's
  `requires.entities` (`manifest.md`). The picker is for the person creating the record; to set the groups from a
  workflow instead, leave the field off the form and bind it in a step (`access.md`, "How to design access").
- A `date` field's property is `{ "type": "string", "format": "date" }`, and a `datetime` field's is
  `{ "type": "string", "format": "date-time", "x-entityField": "start" }`. AgentFlow sets the `type` and
  `format` of a bound date or datetime property from the field itself, so a missing or wrong one is corrected,
  not refused. The value the form accepts for a `datetime` is an RFC 3339 timestamp with a time and an offset,
  such as `2026-03-01T09:00:00Z`; `2026-03-01` or `2026-03-01T09:00` is refused as a bad `format`.
- A `file` field's property is always a list of file ids, even when `max_files` is 1:
  `{ "type": "array", "items": { "type": "string", "format": "attachment" }, "x-entityField": "document" }`.
  `build` and `lint` do not check a property's shape, so write it as shown.
- A list field's property is `{ "type": "array", "x-entityField": "<key>" }`. AgentFlow writes its `items` from
  the list's columns, so an item carries the column keys and an optional `id`; an item with any other key is
  refused.
- The layout is always vertical; you write no UI schema.
- The form decides what a create **through the records API** may set (a person on AgentFlow's own create page,
  a UI module, a service principal): `POST /entities/{id}/records` keeps only the keys the form binds, and drops
  the others without an error or a warning (the `201` does not name them); a form edit (`PUT`) drops them the same
  way, while a `PATCH` writes any field of the entity by key. Bind
  every field a module or an API caller writes on create, and read the record back when a value matters. A
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

## Records filed in a unit

An entity that says `"requires_unit_classification": true` has every one of its records filed in one organizational
unit, and its grants may reach records by the person's unit (`access.md`, "Units: `placement`, `unit` and
`subtree`"). Use it when who may see a record depends on where in the organization it belongs: a court's cases, a
branch's requests. Do not use it for a department you could name in a group.

```json config
{ "key": "case", "name": "Case", "requires_unit_classification": true,
  "fields": [ { "key": "title", "label": "Title", "type": "text" } ],
  "views": [ { "key": "all", "name": "All cases", "columns": ["title", "unit"] } ],
  "access": { "mode": "restricted", "grants": [] } }
```

- **The platform adds a field `unit`.** It is a reference to units, and it is read-only: the platform sets it from the
  unit of whoever creates the record, or from the `destinationUnit` of the workflow step that creates it
  (`steps.md`, "The unit a created record is filed in"), and it moves only when someone transfers the record. Name
  it by the key `unit` in a view's `columns`, `filters` and presets, in a rule's condition and in a stage move's
  `required_fields`; the platform accepts a dashboard tile that groups by it, which the build does not check. You never declare it: a field of your own keyed `unit` is
  refused (`/fields/<n>/key`, `unit_field_key_taken` at `lint`), so name yours `court` or `branch`. It can never be
  secured, so a module that filters on it needs no `queriedByApp`. A module that creates a record names the unit with
  `unit_id` (the UI skill's `records-api.md`, "Writing records, and doing work").
- **A template reads the unit's name.** `{{ subject.record.unit.name }}` renders the name of the unit the run's record
  is filed in, once the manifest lists `name` of `org_unit` in `requires.entities`:
  `{ "key": "org_unit", "access": "read", "fields": { "name": "text" } }`; `lint` counts that entry as used while an
  entity declares the member, though no body names `org_unit`. Without it the step is outside the app's ceiling and
  every run fails there with `APP_CEILING_DENIED`: `lint` reports it as `ceiling_uncovered` at the step, and the
  install plan does not.
  `examples/court-batches` in the SDK repository writes a court's name into each dossier this way, and is a two-court
  app to deploy to a sandbox.
- **A package never writes it.** A create form whose property is bound to `unit` with `x-entityField` is refused
  (`the property … is bound to unit, which is read-only`), and so is an Entity Record step whose body binds it, in a
  For Each too (`workflow <key>#/graph/nodes/<n>/parameters/body/<i>: \`unit\` is set by the platform …`). In a
  package edited by hand, `lint` reports either as `unit_written`.
- **No seeds.** A starter record has no creator, so there would be no unit to file it in: `seed` on a classified
  entity is refused (`/seed`, `seed_on_classified_entity` at `lint`). Remove the seed, or fill the entity from the
  app's own screen (below, "Starter records the app creates itself"), where the person who confirms it files the
  records.
- **The install plan guards the member both ways.** Adding it to an entity the organization already holds
  unclassified is refused while any of its records has no unit (`APP_UNIT_CLASSIFICATION_HAS_UNASSIGNED_RECORDS`): the
  admin assigns units to those records (`POST /admin/entities/{id}/records/assign-units`), then plans again. It is
  refused too while the organization's entity has a field of its own keyed `unit`
  (`APP_UNIT_CLASSIFICATION_FIELD_KEY_TAKEN`): the admin renames or deletes that field. A release that drops the member from an entity the installed release classified is refused outright
  (`APP_UNIT_CLASSIFICATION_DROPPED`), whether or not anything depends on the entity: keep the member, or move the
  records to a new entity.
- **A person with no unit files nothing.** A record is filed in its creator's primary unit, so a person the
  organization has not placed in a unit cannot create one, and neither can a service principal an admin has not
  placed: a workflow that runs unattended names the unit with `destinationUnit` instead.

## A person's profile

A record tied to an AgentFlow user, such as an Employee, is an ordinary entity with one reference to Users that a key
covers alone and that names an inverse. Users itself takes no fields from a package.

```json config
{ "key": "employee", "name": "Employee",
  "fields": [
    { "key": "user", "label": "Account", "type": "reference", "target_entity_id": "ffffffff-0000-0000-0000-000000000001",
      "inverse_key": "employee", "inverse_label": "Employee" },
    { "key": "department", "label": "Department", "type": "text" },
    { "key": "salary", "label": "Salary", "type": "number", "recommendedSecured": true }
  ],
  "natural_key": [{ "id": "by_user", "name": "Account", "fields": ["user"] }],
  "display_field": "department" }
```

- **The link**: a single `reference` to Users with `inverse_key` and `inverse_label`, and a `natural_key` entry over
  that field alone. The manifest's `requires.entities` lists `user` (`manifest.md`). Never make `user` `required`: a
  worker with no account is a profile with an empty `user`, and any number of those may exist. The link field itself
  cannot be `recommendedSecured`; `agentflow-app lint` reports `profile_link_invalid` for each of these.
- **The installed name**: the inverse a package adds to Users is installed as `<prefix><handle>`, here
  `rfx_hrm__employee`, which is `installedKey("rfx/hrm", "employee")`. The body writes the handle (`employee`); a workflow path writes the
  installed name in full (`workflows.md`, "A person's profile in a path").
- **Access**: each person reads their own profile with the record scope `{ "kind": "field", "field": "user" }` on
  `read` and `list`; HR reads at organization scope. Mark a confidential field `"recommendedSecured": true`, since a
  package never secures a field (`access.md`).
- **Records about a person** (a leave request, a contract) reference the Employee, not the user, and each person
  reaches their own with `{ "kind": "parent_field", "field": "employee", "parent_field": "user" }`. HR can then file
  one for a person with no account.
- **Filling the creator's profile**: `"default": { "kind": "creator" }` on a reference (or a reference list) to
  `${entity:employee}` fills the Employee record of the person creating the record, as it fills the person on a
  Users field. The target must hold exactly one profile link, or `agentflow-app lint` reports
  `creator_default_invalid`. A person with no Employee record leaves the field empty, so a `required` one refuses
  their create (422) and an optional one stays empty; a service key fills nothing, as for any creator default. The
  create form leaves the field empty and says the person's own record fills it. It needs an AgentFlow build that
  has it: an older one fails the field at install.
- **Finding a profile from a user**: read it inline through a path, or with `getByKey` (`steps.md`).
- **Adding the link to an entity that already holds records takes two releases**: ship the `natural_key` in one
  release and the `inverse_key` in the next. The key a release adds is still building when the inverse is set, so
  the plan refuses the release with `APP_PROFILE_LINK_NEEDS_KEY_FIRST` at `/inverse_key` on the field, before any
  step runs. An entity with no records takes the key and the inverse in one release.
- **A creator default pins its link.** While a field's creator default fills from the profile entity, nothing may
  clear the link's inverse, add a second link or delete the link (`409 ENTITY_FIELD_IN_USE` naming the field). A
  release that drops the link drops the defaults that fill from it in the same release: the install takes them off
  first, whichever the manifest lists first. A default the organization added itself blocks the release the same
  way, naming its field.

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

## Starter records: `seed`

Some apps need records the moment they are installed: a list of categories that other records point at, say.
There are two ways to give them, and each fits a different kind of data:

- **A seed** (this section), for data that is the same in every organization: the same codes and names, chosen
  before anyone has looked at the organization. The install creates the records, the setup page shows how many each
  entity creates and which keys a record of the organization already holds before the admin approves, and nobody
  has to do anything else. It costs literals only, records fixed once seeded (a later release cannot change them),
  no owner or creator on them, and an AgentFlow deployment from before seeds refuses the whole package.
- **The app's own screen** (next section), for data that depends on the organization: names in the admin's
  language, values taken from records the organization already has, a choice the admin makes. It costs a screen
  and its code, and a person has to confirm it.

`seed` is a list of record bodies on the entity, each naming fields by key with literal values. An entity that
`requires_unit_classification` takes none: there is no unit to file a seed in. A `category`
entity keyed by its code:

```json config
{ "fields": [
    { "key": "code", "label": "Code", "type": "text", "required": true },
    { "key": "active", "label": "Active", "type": "boolean", "default": { "kind": "literal", "value": true } }
  ],
  "natural_key": [{ "id": "by_code", "name": "Code", "fields": ["code"] }],
  "seed": [
    { "code": "general", "name": "General" },
    { "code": "billing", "name": "Billing" }
  ] }
```

A seed may set `name` without declaring it (Fields, above). What a seed may hold:

- **Only on an entity with a `natural_key`.** Every body sets every field of the first key set (`by_code` here),
  and no two bodies share a key. The key is how the install tells a record it has already seeded from one it has
  not.
- **Literals for the entity's own fields**: a string for `text`, `date` and `datetime`, a number for `number`,
  `true` or `false` for `boolean`, one of the values for `enum`, a list of values for `multi_select`. A
  `reference`, `reference_list`, `file`, `list`, `formula` or `auto_number` field cannot be set, nor a rollup, nor a
  field the entity does not declare, the fields its `work` seeds included. A field the body leaves out takes its
  `default`, and an `auto_number` is drawn as for any record.
- **No references.** A seed is copied as written, never translated, so a string that contains `${` or starts with
  `@` is refused. A seed cannot point at another record or read a parameter.
- **At most 1,000 bodies in the package**, across all its entities.

`pnpm build` refuses a `seed` that is not a list, a body that is not an object, a `${`, a leading `@`, and more
than 1,000 bodies in one file. It does not check the key or the field types, and neither do `lint` and `seal`:
AgentFlow refuses those when the package is uploaded, with `PACKAGE_BODY_INVALID` and the place,
`objects/entity/<key>.json seed/<index>/<field>`. An AgentFlow deployment from before seeds existed refuses every
package that has one, with the same code.

**What the install does.** It creates each body as a record after the entity's rules and stage model are in place,
and they judge it as they judge any create: a rule about the record applies, a rule about the person writing does
not (nobody is writing), and the status must be one the stage model lets a record start in. A seed has **no owner
and no creator**. So a `creator` default fills nothing (and a `required` field with one refuses the seed), a grant
with `own` scope never reaches a seed, and a record scope on a people field matches nobody until someone fills the
field: give the people who use these records a grant with `organization` scope. A seed AgentFlow refuses (a rule,
a required field left empty, a status the stage model does not start in, a malformed date) shows on the setup page
as `APP_STEP_FAILED` on the entity at `<code>:/seed/<index>`, with AgentFlow's message, and the plan cannot be
approved while it stands. On an upgrade the organization's own rules on the entity judge a new seed too. The
setup page lists, under "Starter records", how many records each entity creates and which keys a record of the
organization already holds; the run page lists what was created.

**Upgrade, undo and reattach.**

- **An upgrade creates only the seeds whose key the app has never seeded in this organization.** A seed already
  created is never written again: an admin's edit stays, a record the admin deleted stays deleted, and new values
  for that key in a later release change nothing. A release that drops a seed leaves its record. To change records
  already seeded, change them another way: the admin, or a workflow a person starts.
- **A key a record of the organization already holds** is left as it is, and the setup page lists it as already
  there.
- **A seed an upgrade adds is a new record like any other**, so an armed trigger on the entity starts for it. A
  first install's seeds start nothing, because triggers install off.
- **Undo removes the seeds nobody changed**, with their entity. A seed someone edited or commented on blocks undo,
  as any record does, and so does a record of the organization that held a seed's key. After an undo, installing again seeds
  again.
- **Detach keeps what was seeded**, so a reattach seeds only keys the app has never seeded.
- **Seeds stay keyed by the key set the app's first seeds of the entity were recorded under**: the entity's first
  key set at that install. A later release may add key sets or list them in another order, but every seed must keep
  setting that key's fields; one that does not is refused at `VALIDATION_ERROR:/seed/<index>`.
- **An entity's first natural key and its first seeds may come in one release**, but when the entity already holds
  records its seeds wait: the key is built after the install, so the install creates none of them and the setup
  page and the run page say the entity waits for its key. The next upgrade (or a reattach) creates them, once the
  key has finished building. An entity with no records yet, or one that already has a key set, seeds at once.
  Only a later release (installing the same version again is refused, `APP_VERSION_NOT_NEWER`) or a detach and
  reattach seeds a waiting entity, so adding the key in one release and the seeds in the next seeds them sooner.
- **`agentflow-app init --from` does not carry seeds**, because AgentFlow's Pack does not write them: add them to
  the converted config by hand.

## Starter records the app creates itself

For data that depends on the organization, give the app a screen that proposes the records and creates them when
an admin confirms: a UI module (the `agentflow-ui-module` skill). A seed cannot do this: it is written at install,
before anyone has looked at the organization, and holds literals only. A screen can read what the organization
has, word the records in its language, and ask. What keeps pressing it again, or after a change, safe:

- **Show what will be created first.** List the records with their values, and the ones already there, and create
  nothing until the admin confirms.
- **Create each by its natural key.** Give the entity a `natural_key`, and send each record as a create,
  `POST /entities/{entity_id}/records` (`records-api.md` of the `agentflow-ui-module` skill). A `409` with
  `ENTITY_NATURAL_KEY_CONFLICT` means a record already holds that key: count it as already there and go on, so a
  second press creates nothing twice.
- **Use a create, not an `upsert`.** An upsert (a workflow's `upsert` step, say) finds the record by its key and
  writes its values over it, so a second press would undo whatever the admin changed. A create leaves a record that
  exists as it is.
- **Count a record the admin retired as present.** Give the entity a way to retire a record that keeps it, such as
  the `active` field above, and count a retired one as there, so the screen never brings it back. A deleted record
  frees its key: the next create of that key makes a new record, and the key alone cannot tell it from one never
  created. If deleted records must stay deleted, the screen has to remember what it created, in a record of the
  app's own.
- **Order the creates so a failure part-way leaves a safe state.** Each create is its own write, and nothing undoes
  the ones before a failure. Create the records others point at first (a team before the items under it), and
  anything that turns behaviour on last, so a stop half-way leaves records nothing uses yet; the next press
  creates the rest by key.
- **The create runs as the person who confirms.** They need a `create` grant on the entity, rules about the person
  writing judge them, and they are the record's creator. The create keeps only the fields the entity's create form
  binds ("The create form", above).

## A source: an entity filled from a synced stream

`source` fills an entity from a stream that a connection syncs: an ERP's `purchase_order`, HubSpot's `contacts`.
AgentFlow does the work itself, from the connection's changes: it creates and updates the records, removes the
lines the source dropped, resolves references between the entities you map, and honours deletes. You write only
the map:

```json
{ "source": {
  "connection": "${param:erp}", "stream": "purchase_order",
  "fields": {
    "po_number": { "from": "number" },
    "status": { "from": "status", "values": { "pending_approval": "draft" } },
    "vendor": { "ref": "${entity:vendor}", "key": ["company_erp_id", "vendor_erp_id"] },
    "taxes": { "from": "taxes", "items": { "rate": { "from": "rate" } } }
  },
  "lines": {
    "entity": "${entity:po_line}", "from": "lines", "key": ["erp_line_id"], "parent": "purchase_order",
    "fields": {
      "item": { "ref": "${entity:item}", "key": ["^company_erp_id", "item_erp_id"] },
      "qty": { "from": "qty_ordered" }
    }
  },
  "on_delete": "delete"
} }
```

- **`connection`** is a `${param:…}` of type `connection_ref` (`manifest.md`). The admin chooses the connection when
  installing, and the stream is read through it. Give a package one parameter per connection it maps from.
- **`stream`** is an ERP's object name (`purchase_order`, `vendor`) or a stream the connector offers (`contacts`,
  `deals`). Two entities in a package cannot read one stream through one connection.
- **`fields`** maps a field key of this entity to where its value comes from. `{ "from": "number" }` copies a
  path of the stream's record (dotted, `properties.<name>` for HubSpot). `values` maps an enum's source values
  to the field's options. `{ "from": "taxes", "items": { … } }` writes a list of objects into a `list` field,
  copying each item's paths into its columns. `{ "ref": "${entity:vendor}", "key": [ … ] }` points at the record
  of another mapped entity: `key` has one path per key part of the target's stream (an ERP record is keyed by
  `company_erp_id` and `erp_id`), and `""` stands for a part that stream leaves empty. Add `"line": [ … ]` to
  point at a line of a lines entity.
- **`custom.<key>`** is a path too, for a field the organization maps on its ERP connection (an Odoo `x_…` field):
  `{ "from": "custom.risk_rating" }` in `fields`, a line's own `custom.cost_center` inside `lines`, and
  `^custom.risk_rating` for the parent's. The key is lower-case letters, digits and single underscores, starting
  with a letter, at most 40 characters. It reads the value, not the `{ type, value }` entry that holds it, so it
  copies like any scalar, and an empty field is null. Every key you read is required: setup refuses a connection
  that has not mapped it, or has mapped it as a type the field cannot hold (a text key goes into a text, enum, date
  or datetime field, a number key into a number field, a boolean into a boolean, a date into a date or datetime).
  Those three are the only places a custom path is read: lint refuses `custom.<key>` inside a list mapping's `items`
  and a header path into a line's `custom` (`lines.custom.<key>`). The organization chooses which ERP field a key
  reads, so list the keys your package reads in its install notes.
- **`lines`** writes one list in the record to a child entity, a record to a line. `key` is the paths, inside a
  line, that identify it; `parent` is the lines entity's reference field that points back at this entity; `fields`
  is mapped as above, and `^path` reads the parent record. One level only: anything deeper is a `list` field.
- **`on_delete`** is `"delete"` (the record and its lines go to the trash) or `{ "flag": "<boolean field>" }`
  (the record stays and the field is set true, since records have no archive).

**The records are read-only.** Only AgentFlow writes a sourced entity and its lines entity. A person, a script, an
API call and a workflow step are all refused with `ENTITY_SOURCE_OWNED` (409); formula, rollup and auto-number
fields still compute. Keep what people add (notes, a decision, a flag) on an entity of your own that references
the synced record. If the admin detaches the app, the records become the organization's to edit.

**The build refuses**, at the pointer verification would name (so you learn at build, not at seal):
- a `connection` that is not a `connection_ref` parameter;
- `rules`, `stage_model`, `work` or `create_form` on a sourced entity or its lines entity: nothing but AgentFlow
  writes them, so there is nothing to govern;
- a mapped field the entity lacks; a copy into anything but a text, number, boolean, date, datetime or enum field;
  `values` onto a value that is not one of the field's options, or into a field that is not an enum; `items` into
  a field that is not a `list`, or into a column it lacks;
- a `ref` into a field that is not a reference to that entity, to an entity that is not read through the same
  connection, or from a field that is `required` (a reference is written after its record, and is empty until the
  target arrives);
- a `^` path outside `lines`; a `lines.parent` that is not a reference field of the lines entity to this entity;
  a flag that is not a boolean field;
- a lines entity that has a source of its own or that a second source names, and a second source on one stream of
  one connection.

A `ref` or a lines entity names an entity of this package, or `${dep:<package id>#entity:<key>}` of a package in
`requires.packages` (`manifest.md`, "Depending on another package"). The builder takes a required package's entity
on trust: it cannot see that package, so it does not check the key it exports, the fields of a lines entity it
owns, or the connection it is read through. A reference field to it names the same `${dep:…}` as its
`target_entity_id`.

**`lint` checks the rest against the stream** (`lint-problems.md` in the release skill): that the stream and every
path exist, that a path's type fits its field, that every enum option the stream can send has a place, and that a
`ref` has as many key parts as its target's stream. A custom HubSpot property and a `custom.<key>` are not judged by
`lint`: the setup page checks them against the connected account.

Things that build and then cost you:
- **A reference to a synced entity wants `"on_target_delete": "clear"`.** The default, `restrict`, refuses the
  ERP's delete of the target, and that version stays unapplied (`constraint_failed`) until someone intervenes.
  **`clear` and `required` do not go together**: clearing a required field would leave records every write refuses, so
  AgentFlow refuses the pair at install (`ENTITY_REF_DELETE_BEHAVIOUR_REQUIRED`) and `build` refuses it first. Leave the
  reference optional and ask for it where it matters: `required_fields` on the stage move that needs it
  (`rules-and-stages.md`) refuses the move while the field is empty. The same holds for a field a `natural_key` names
  (`ENTITY_REF_DELETE_BEHAVIOUR_KEY_MEMBER`): a record whose key part cleared would drop out of the key silently, so
  leave the field out of the key, or keep `restrict` and accept the parked delete.
- **A version that will not save is retried, then parked.** A `required` field the source leaves empty, or an enum
  value with no option, fails that record only; after 24 attempts it shows in the app's needs attention and an
  admin retries it. A newer version of the record clears it.
- **A freshly installed app loads what the ERP already holds.** The first poll of each stream a source reads runs its
  first full load: every open document (Odoo: open purchase orders not fully invoiced, their receipts, unpaid bills)
  and all master data. A closed or paid document arrives when it next changes, or when an admin loads the full
  history (`POST /api/v1/admin/integrations/connections/{id}/load` with `{"scope": "all"}`).
- **An installed source cannot move.** Choosing another connection once records exist is refused
  (`APP_SOURCE_CONNECTION_LOCKED`): undo and install again. An upgrade cannot change the stream or a lines `key`,
  or drop `lines` (`APP_SOURCE_INCOMPATIBLE`).

## An extension: fields on another package's sourced entity

A package that requires another package's sourced entity (`rfx/erp-core`'s vendor) can add fields to it and have
AgentFlow fill each from the ERP's custom fields: one file in `config/entity_extensions/`. Use it for a company's own
ERP field (an Odoo `x_…` field). Data that is not in the ERP stays in an entity of your own with a reference to the
record (`manifest.md`, "Building on another package").

```json
{
  "key": "vendor_risk",
  "extends": "${dep:rfx/erp-core#entity:vendor}",
  "fields": [
    { "key": "risk_rating", "type": "enum", "label": "Risk rating",
      "enum_values": [{ "value": "low", "label": "Low" }, { "value": "high", "label": "High" }] }
  ],
  "source": {
    "fields": { "risk_rating": { "from": "custom.risk_rating", "values": { "L": "low", "H": "high" } } }
  }
}
```

- **The file** is named for its `key`. `extends` is `${dep:<package id>#entity:<key>}` of a package in
  `requires.packages` whose `access` entry names that entity (`"read"` is enough). The entity must be one the other
  package fills from a stream, as the source's entity or as its lines entity (a cost center on each line): setup
  refuses any other (`extension_target_not_sourced`). A package extends each entity once.
- **`fields`** are the new fields: `key`, `type` (`text`, `number`, `boolean`, `date`, `datetime` or `enum`, the
  types a source copies into), `label`, `description`, `enum_values` and `recommendedSecured`. An `enum` needs
  `enum_values` and any other type refuses them. A field is never `required` and has no formula and no default, and
  `label` and `description` are strings: leave them out rather than write null. `recommendedSecured` is advice that
  nothing reads yet, so say in your install notes which fields to secure.
- **`source.fields`** has one copy for each field and nothing else: `{ "from": "custom.<key>" }`, with `values` for
  an enum to map the ERP's values to the field's options. `custom.<key>` is a key the admin maps in the ERP
  connection's Custom fields (`A source`, above): the header's for the source's entity, a line's own for its lines
  entity. There is no `ref`, `items`, `^` path or canonical path: a standard ERP field belongs in `rfx/erp-core`.
- **The field's key on the entity is yours plus a prefix.** It is installed as `<prefix>__<key>`, the package id with
  `/` and `-` written `_`, then `__` (`rfx_ap_match__risk_rating` for the package rfx/ap-match). Name it by that key in
  your own formulas, views and workflows: a formula on an entity of yours that reads through a reference to the
  vendor is `vendor.rfx_ap_match__risk_rating`. The installed key is the same on every organization. `lint` accepts
  your prefix only before one of your extension fields' keys; any other word that starts with it is refused as
  `installed_key_literal`. Such a formula follows the rules of "Formulas and rollups": the value is stored on your
  record at its last write, so a change to the vendor's rating reaches it on that record's next write, and a workflow
  that decides on your record needs its principal to read the vendor (`manifest.md`, "Building on another package").
- **Where the field shows.** It is an ordinary field of the vendor entity, so it is among the entity's filters, and on
  a record's page whenever the page is the generated one, which lists every field the reader may read. A page or a
  list the base package ships is the base package's: a `detail` view draws the layout it was written with, and a list
  view shows the fields in its `columns`, so the extension adds no column or layout slot to them, and a dependent
  cannot change them (`rfx/erp-core` ships one `all` list view per entity and no `detail` view). A view the
  organization makes of the entity can list the field.
- **The records stay read-only.** The sync fills the field in the same write that creates or updates the vendor, and
  nobody else writes it (`ENTITY_SOURCE_OWNED`). While the app is installed the organization cannot delete the field
  or narrow its options (`APP_OBJECT_GUARDED`).
- **Setup judges each extension** as one checklist item: the connection must map every `custom.<key>` the extension
  copies, at the level of the entity (header or lines), with a type the field can hold (`custom_field_not_mapped`,
  `custom_field_type_mismatch`), and the entity must have a source. List the keys in your install notes, since the
  admin maps them first. An admin cannot remove a key an installed extension copies (`CONNECTION_CUSTOM_FIELD_IN_USE`).
- **An install fills the records that already exist.** Installing, an upgrade that changes the copies, a reattach and
  turning the app on again queue every record the source has applied, so a vendor synced before the install gets its
  value when the job runs. A record whose last version predates the key being mapped gets its value at its next
  change in the ERP, or when an admin loads the stream.
- **A value the field cannot take holds the record.** An enum value the ERP sends that `values` and the options do
  not take fails that whole update, the base fields of the vendor with it, until you ship the option or the ERP
  changes. List every value the ERP can send, or use a text field.
- **An upgrade** adds a new field, and a field's label, description and options follow the release. **A field's type
  cannot change**: the plan is blocked (`extension_field_type_changed`), so ship the new type as a field of another
  key. A field you drop stays on the entity as the organization's, with its values, and is no longer filled; dropping
  the whole extension does the same, and declaring it again takes the fields back by their installed key. Pointing
  `extends` at another entity adds the fields there and leaves the old entity's fields to the organization the
  same way.
- **Undo and detach.** Undo deletes the extension's fields with their values, and is refused while a view, rule or
  metric of the organization's uses one. Detach leaves the fields as the organization's, with their last values, no
  longer guarded or filled; reattach takes them back.
- **The build refuses**, at the pointer verification would name: a member beyond `key`, `extends`, `fields` and
  `source`; an `extends` whose package is not in `requires.packages` or has no `access` entry for the entity; a
  field with no copy and a copy that names no field; a `from` that is not `custom.<key>`; `values` onto a value
  that is not an option; and a second extension of one entity.
- **A package with an extension needs platform `2026.11`.** The builder raises `minPlatformVersion` to it, and an
  older build refuses the package at upload.
