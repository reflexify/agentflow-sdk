# Dashboards, the launcher and the `ui` member

## A dashboard: `config/dashboards/<key>.json`

`key` equals the file name. Members: `key`, `name`, `description`, `tiles`. It becomes `dashboard:<key>`.

- `tiles` is a list; each tile has a `kind` of `number`, `chart`, `list` or `text`, and the rest of the tile
  is carried to the platform. At most 24 tiles count (a `text` tile does not).
- Every tile has an `id` and a `position` `{ "row", "col", "w", "h" }` on a grid 24 columns wide
  (`col + w` at most 24), and each kind has a size range of its own (below). A tile outside its range builds, and
  `lint` reports it as `tile_position_invalid` at `/tiles/<n>/position/<member>`; an older AgentFlow passes the
  package and refuses the install plan instead.
- Every `entity_id` inside a tile is an entity: `${entity:<key>}` of the package, or a platform entity's id.
- Each tile, and each measure, has an `id` of its own: a UUID, fixed in the file.
- A `filter_bar` is refused (`a package cannot install a filter bar yet`): ship tiles only.
- "Due before today" is `{ "field": "due", "op": "within", "value": "before_today" }`, in a tile's filter as in a
  view's: an overdue count is a `count` Number tile with it and the open statuses, and no `compare`. Leave the
  comparison off an overdue count. `before_today` and `after_today` have no length, so `previous_period` over
  one alone is refused (a bounded window on the same field, such as `this_month`, gives it a length again).
  `previous_year` is accepted, but on a single number it counts the records overdue by more than a year, which
  is not "overdue a year ago"; it reads meaningfully only on a chart split by a date bucket. The "overdue"
  recipes are in `entities.md`, "Views".
- A packaged dashboard installs private to the installer. Tell installers to share it with the audience
  group, or nobody else sees it, nor the launcher entry that opens it.
- A module computes the same tile format itself with `computeTiles` (the UI module skill's `records-api.md`), which
  fills the tile and measure ids, takes an entity by key and a list tile's view by key, and needs no `position`. Its
  measures are defined inline as here, or follow a metric by key with `metric` (below): the package's own, whose meaning is guarded, or one the organization made, which nothing guards. A
  packaged dashboard is for the installer's Dashboards list, and whoever they share it with, not the way a module gets
  its figures; but a module can compute the same file's tiles (below), so one file serves both.

The four kinds (the whole file builds and lints clean):

| `kind` | Members besides `id`, `label`, `position` |
|---|---|
| `number` | `query`: `{ "entity_id", "measures", "filter"? }`. One figure. |
| `chart` | `query` as above, `chart` (`bar`, `column`, `line`, `pie` or `donut`), `split_by` (`{ "field", "bucket"? }`: `bucket` is `day`, `week`, `month` or `quarter` and is required for a date field, refused for any other), and for a bar or column `stack_by` (a second `split_by`) |
| `list` | `entity_id` and `view_id`: `${entity_view:<entity>/<key>}`, the records of a view of this package |
| `text` | `body`, a string |

A tile's size, in grid units, by kind:

| `kind` | `w` (width) | `h` (height) |
|---|---|---|
| `text` | 4 to 24 | 3 to 12 |
| `number` | 3 to 12 | 5 to 10 |
| `list` | 6 to 24 | 5 to 40 |
| `chart` | 6 to 24 | 6 to 30 |

A `measures` entry is `{ "id", "key"?, "fn", "field"?, "primary"?, "label"? }`: exactly one measure of a tile has
`"primary": true`, and each other one leaves it out or says `false` (a module's typed tile writes `false`). `key` is
the measure's name in a tile, which a module reads its result by, under the rule the UI module skill's `records-api.md`
gives. `fn` is `count` (no `field`), `sum`, `avg`, `median`, `min`, `max`, `count_distinct`, `count_filled`,
`count_empty` (each with a `field`), `percentile` (a number `field` and `"percentile": { "p": 90 }`, a whole number from 1 to 99) or `ratio`
(`"ratio": { "of": "<field>", "per": "<field>", "using": "count_filled" }`, for a figure such as "% complete"). A
percentile is the value that share of the records fall at or below, interpolated between the two nearest values as a
spreadsheet's `PERCENTILE.INC` does, so `p` 50 is the median.

The time between two date fields takes the place of `field`: `"duration": { "from": "<field>", "to": "<field>", "unit": "minutes" }`,
with `unit` `minutes`, `hours` or `days` and an `fn` of `avg`, `median`, `percentile`, `min`, `max` or `sum` (a count
reads no value and is refused). The figure is `to` minus `from` in that unit, kept as a fraction, and negative when `to`
falls before `from`. Both fields are `datetime` fields (any unit) or both are `date` fields (`days` only); a formula
counts by its result type. A record missing either date is left out of the figure and counted in the result's
`skipped`, and the measure's `population` counts only the records that have both dates. Every record has two
datetime fields AgentFlow writes, `created_at` and `updated_at`, so a time from a record's creation is
`"from": "created_at"` with no field or workflow of your own; an end such as a closing time is a field something
writes, and a trigger-started workflow writes nothing until an admin turns its trigger on (`workflows.md`, "Triggers").

A dashboard or a view that holds a percentile or a duration needs platform `2027.01`: the build raises
`minPlatformVersion` to it, and an older AgentFlow refuses the package at upload.

**A measure can follow one of the package's metrics by key** instead of defining one: `{ "id", "metric": "<key>",
"primary"?: true, "key"?, "color"? }`, with no `fn` or other definition, on a tile whose `query.entity_id` is
`${entity:<entity>}` of the entity that defines the metric (`entities.md`, "Metrics"). AgentFlow fills in the metric's
definition when it installs the dashboard and stores the organization's id, so the tile shows whatever the metric
counts in that organization. The build refuses a key that entity does not define in the package, naming the tile and
the key, a measure that carries `entity_metric_id` (an id differs in every organization, so a package follows by
key), and any member beside `metric` other than `id`, `primary`, `key` and `color`, which AgentFlow's install would
refuse. A followed measure with no `color` of its own is drawn in the metric's colour, and the dashboard stores none.
The metric needs platform `2027.03`, which covers the tile. A module's `computeTiles` follows a metric the same
way, the organization's own included; an organization's metric can change meaning under the module, and the
package's own cannot.

A tile's `filter` is `{ "field_filters": [{ "field", "op", "value" }], "relative_dates": [{ "field", "window" }] }`: the
operators are a view filter's (`entities.md`), and `window` is `today`, `last_<n>_days`, `this_month`,
`this_quarter`, `this_year`, `before_today` or `after_today`.

```json config
{ "tiles": [
  { "kind": "text", "id": "0190f8f4-0000-7000-8000-0000000000c1", "label": "How to read this", "body": "Counts exclude declined loans.",
    "position": { "row": 0, "col": 0, "w": 24, "h": 3 } },
  { "kind": "chart", "id": "0190f8f4-0000-7000-8000-0000000000c3", "label": "Loans per month", "chart": "line",
    "query": { "entity_id": "${entity:loan}", "measures": [{ "id": "0190f8f4-0000-7000-8000-0000000000d3", "fn": "count", "primary": true }] },
    "split_by": { "field": "due_date", "bucket": "month" },
    "position": { "row": 3, "col": 0, "w": 12, "h": 8 } },
  { "kind": "list", "id": "0190f8f4-0000-7000-8000-0000000000c4", "label": "All loans",
    "entity_id": "${entity:loan}", "view_id": "${entity_view:loan/all}",
    "position": { "row": 11, "col": 0, "w": 24, "h": 10 } }
] }
```

A dashboard file with its first tile:

```json config
{
  "key": "team_overview", "name": "Team overview",
  "description": "Open, blocked and completed items across the teams you can see.",
  "tiles": [
    { "kind": "number", "id": "0190f8f4-0000-7000-8000-0000000000a1", "label": "Open items",
      "query": { "entity_id": "${entity:item}", "measures": [ { "id": "0190f8f4-0000-7000-8000-0000000000b1", "fn": "count", "primary": true } ],
        "filter": { "field_filters": [ { "field": "status", "op": "in", "value": ["todo", "doing"] }, { "field": "frozen", "op": "ne", "value": true } ] } },
      "position": { "row": 0, "col": 0, "w": 6, "h": 5 } }
  ]
}
```

**One file for a screen and for the installer.** A package can keep a screen's tiles in one dashboard file that its
module imports and computes as it is, while the file still ships as a dashboard. The helper resolves a tile's
own `entity_id` placeholder, `${entity:<key>}`, at runtime and no other, so a file a module computes holds no other
placeholder: `computeTiles` refuses a `${param:<key>}` in a filter value, or a `${entity:<key>}` in a `ref_filters`
entry's `inverse_entity_id`, with `PLACEHOLDER_UNRESOLVED`. `position` is ignored, and results come back by measure
`key`, or by `id` where a measure has no `key`. This holds for the number, chart and text tiles. A list tile is the
exception: its `view_id: "${entity_view:<entity>/<key>}"` is one the operation refuses, so the module leaves the
file's list tiles out and, if it wants one, writes it as `{ kind: 'list', entity: '<entity>', view: '<view key>' }`.

```ts
import { computeTiles, type AppHost, type ComputeTile } from '@reflexify/agentflow-sdk';
import dashboard from '../../config/dashboards/team_overview.json'; // the file above

async function openItems(host: Pick<AppHost, 'api'>) {
  // The file holds a list of tiles: name each by its id, and leave its list tiles out.
  const tiles = Object.fromEntries(dashboard.tiles.filter((t) => t.kind !== 'list').map((t) => [t.id, t])) as Record<string, ComputeTile>;
  const r = await computeTiles(host.api, tiles);
  return r['0190f8f4-0000-7000-8000-0000000000a1'].measures['0190f8f4-0000-7000-8000-0000000000b1']?.value; // the tile's id, then the measure's
}
```

## How many records a figure covers

Every count and tile figure is computed on the server over the records the reader may read, up to the limits
below. Past a limit the answer says so; it never stops silently.

| What | Limit | At the limit |
|---|---|---|
| `POST /entities/{entity_id}/records/count` | 100,000 records | `capped: true`, and the true count is at least `count`. A count with `q` (a text search) is not capped. |
| `POST /entities/{entity_id}/records/stats` (a module's totals) | 20,000 records, the ones with the lowest ids | `capped: true`, every figure covers only those records, and each metric's `cap_bound` says which way it is off (`lower`, `upper`, or `null` for no bound). |
| A tile's figures (`compute` on a dashboard) | Every record the tile covers, unless the deployment sets `ANALYTICS_POP_CAP` | With no cap every figure is exact and `population.capped` is `false`. Under a cap the tile computes over that many of the lowest record ids and its `population.capped` is `true`, with `population.cap` naming the cap. Each measure's `cap_bound` says which way it can be wrong: `lower` for `count`, `count_distinct`, `count_filled`, `count_empty` and `max` (the truth is at least it), `upper` for `min`, and `null` for `avg`, `median`, `percentile`, `ratio` and `sum` (a `sum` is `lower` only over a rating field or a field formatted as a duration; a `sum` of a `duration` input is `null`, because a span can be negative). |
| The Entity Record step's `search` | 5,000 records (`limit`, default 10) | `hasMore` is `true` and `nextCursor` is set, but the step cannot follow the cursor, and it returns no total. Don't count records with it. |

- **A capped `avg`, `median` or `percentile` is a sample, not the figure.** Record ids are random, so the lowest ones a cap keeps
  are an arbitrary subset, and the figure has no bound in either direction. Narrow the population instead: a tile's own
  `relative_dates` window (`last_30_days`) filters the records before the cap applies. Raising the cap is the
  deployment's setting, not the package's.
- **Platform-managed fields count like any other.** The work and clock fields an entity's `work` seeds are ordinary
  filterable, sortable fields, so a count, a tile's filter and a tile's `split_by` take them: `work_state`,
  `claimed_by`, `done_at`, `minutes_to_done`, and per clock `<clock>_state`, `<clock>_outcome`, `<clock>_due_at` and
  the rest. A clock's fields are named after its key, so `sla_outcome` exists only for a clock keyed `sla`. A
  `claimed_by` split shows names when the app may read `user.name`, and ids otherwise.

## The `launcher` member

The entries the package adds to AgentFlow's sidebar, which gives each app a section of its own under an "Apps"
caption. It sits in `config/package-manifest.json`, and it is the one manifest member the builder translates, so
its object targets are written as references.

What the app's section lists depends on whether its module opens: the package ships `ui` and the deployment has
app modules on.

- **A package whose module opens** is reached only through its launcher entries (with none, one row that opens
  the module). The sidebar lists none of its entities, for anyone, in its audience or not, even one an admin put
  in a group. Give an `${entity:…}` or `${entity_view:…}` entry for every entity people must browse, or a module
  screen that lists it. This is navigation only: a record still opens from a link, search and My Work.
- **A package without pages** (data-only, or a deployment with app modules off) lists its entities under its
  own heading, after its entries: each one with a view the person is offered, A–Z, leaving out one an entry
  already opens.

```json config
{ "launcher": {
  "launch_url": "https://app.example.com",
  "entries": [
    { "key": "my_work", "label": { "en": "My Work", "vi": "Việc của tôi" }, "icon": "inbox", "target": { "module": "/" } },
    { "key": "dashboard", "label": { "en": "Dashboard", "vi": "Tổng quan" }, "icon": "layout-dashboard",
      "target": { "object": "${dashboard:team_overview}" } },
    { "key": "open_items", "label": "Open items", "icon": "list-checks", "target": { "object": "${entity_view:item/open}" } }
  ]
} }
```

(The case desk has one module entry, `cases`.)

- **`entries`**: at most 12. Each has `key`, `label`, `icon` and `target`.
- **`key`**: `^[a-z](?:[a-z0-9]|_(?!_)){0,39}$`: letters, digits and single underscores, no hyphen; unique
  among the entries.
- **`label`**: a string, or a map from language tag to string, each 1 to 40 characters. The sidebar uses the
  person's language, then its base language, then the package's `contentLocale`, then the first tag in
  alphabetical order (not the first written). Give every language you need, `contentLocale` among them.
- **`icon`**: optional, one of AgentFlow's 40 icon names, written exactly as listed (they are AgentFlow's own,
  not Lucide's names: `building`, `group`, `pin`, `bank`, `cart`, `card`, `file`, `contract`, `boxes`):
  `database`, `building`, `users`, `group`, `contact`, `truck`, `package`, `cart`, `receipt`, `card`, `wallet`, `file`, `contract`, `clipboard`, `folder`, `tags`, `box`, `boxes`, `briefcase`, `calendar`, `factory`, `bank`, `pin`, `phone`, `wrench`, `shield`, `ticket`, `rocket`, `globe`, `star`, `flag`, `bell`, `bookmark`, `archive`, `layout-dashboard`, `list-checks`, `inbox`, `bot`, `pause`, `settings` (a gear). An unknown name installs, and draws a dot; a name that is not lowercase letters, digits and hyphens (starting with a letter, at most 64 characters) is refused at upload.
  A deployment older than the release that added the gear, `settings`, does not know it and draws a dot.
- **`target`**: exactly one of `module` and `object`.
  - `module`: a path inside the package's UI module (`"/"`, `"/board"`), at most 200 characters, with no
    `//` (even after `?` or `#`: percent-encode a URL inside a query), no backslash, no control character
    and no `.` or `..` segment. It needs the manifest's `ui` member. A module entry is listed to everyone in
    the app's audience.
  - `object`: `${dashboard:<key>}`, `${entity:<key>}` (its record list) or `${entity_view:<entity>/<key>}`,
    of this package. A workflow, or an object the package does not build, is refused. An `object` entry opens the
    record list or view itself: it cannot name a preset or a query. A list that needs one is a `module` entry
    whose route sends it (`entities.md`, "Views").
- **`launch_url`**: optional, the address of the app's own site, if it has one. It must be `https://`
  (lowercase), with no user or password. It is a suggestion: an admin may override it, and an upgrade
  never changes an admin's value. A package whose app runs on its own site may give `launch_url` and no
  entries.

The builder's refusals for the launcher:

```
package-manifest.json#/launcher/entries/0/target/module: a module target needs the package's ui
package-manifest.json#/launcher/entries/0/target: exactly one of module or object
package-manifest.json#/launcher/entries/0/target/object: must be a ${dashboard:key}, ${entity:key} or ${entity_view:entity/key}
```

## The `ui` member

A UI module is a screen the package ships, which AgentFlow opens in its own pages. The manifest declares it
with `"ui": { "kind": "module", "entry": "ui/index.js", "contract": 1 }`, `2` for a module that
calls `host.assistant`, `3` for one that calls `host.signing`, `4` for one that sends the assistant a list of items or
calls `host.assistant.open`, `5` for one that works a Human step's task page with `host.tasks`, or `6` for one that previews files with `host.files` (`manifest.md`, "`ui`", has the contracts 1 to 6 and what an older AgentFlow does with each).

- `pnpm build` then builds the module into `package/ui` with Vite (the starter's `vite.module.config.ts`,
  whose entry is `src/module/module.tsx`). Without Vite installed it refuses with `UI_TOOL_MISSING`.
- `package/ui` is built output, and git ignores it. `pnpm check` compares package/ui with the module when package/ui
  exists, so a module change not yet built is `PACKAGE_STALE` until `pnpm build`; without the folder it says nothing of it.
- Without a module, remove `ui` and every `module` launcher entry. `agentflow-app init --no-ui` makes such a
  project.
- The module's screens, styles, tests and review: the `agentflow-ui-module` skill.
