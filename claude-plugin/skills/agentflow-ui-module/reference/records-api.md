# Reading records: one filtered, sorted query

The starter's `src/module/http-cases-api.ts` lists every case with no filter. Most screens need a filter, a sort
and the names of the records a field refers to. The types are in the SDK, which your project has installed: open
`node_modules/@reflexify/agentflow-sdk/dist/generated/public.d.ts` and read `RecordQueryRequest`,
`EntityRecordFilters`, `RecordFieldFilter`, `RecordFilterOp`, `EntityRecordPage` and `EntityRecord` there. Reach
them as `components['schemas']['RecordQueryRequest']`, as the starter does for `EntityRecord`.

## The query

`POST /entities/{entity_id}/records/query` through `host.api`. The entity's id comes from the SDK's objects cache
(`getAppObjects(host.api)`, `await load()`, then `id('entity:loan')`, as `caseEntityId` in the starter does). Loans due in the next
seven days that are not finished, soonest first, 200 at a time:

```ts
import { ok, type AppHost, type components } from '@reflexify/agentflow-sdk';

type Wire = components['schemas']['EntityRecord'];
type Page = components['schemas']['EntityRecordPage'];

async function dueSoon(host: Pick<AppHost, 'api'>, entity_id: string, from: string, to: string): Promise<Wire[]> {
  const items: Wire[] = [];
  let cursor: string | null = null;
  do {
    const page: Page = await ok(host.api.POST('/entities/{entity_id}/records/query', { // typed: `cursor` reads it
      params: { path: { entity_id } },
      body: {
        filter: { field_filters: [
          { field: 'status', op: 'in', value: ['requested', 'approved', 'out'] },
          { field: 'due_date', op: 'between', value: [from, to] }, // 'YYYY-MM-DD', both ends included
        ] },
        sort: 'due_date', dir: 'asc', limit: 200, cursor,
      },
    }));
    items.push(...page.items);
    cursor = page.next_cursor;
  } while (cursor);
  return items;
}
```

- `filter.field_filters` is a list of `{ field, op, value }`. The operators for each field type are the ones a
  view filter takes (the authoring skill's `entities.md`, "Views"); `in` takes a list, `between` a `[low, high]`
  pair, `is_empty` and `is_not_empty` no value. The filters are ANDed.
- Through one reference: `filter.ref_filters: [{ ref_field: 'item', target_field: 'kind', op: 'eq', value: 'laptop' }]`.
- `filter.q` is a free-text search: a record matches when a searched field holds any of the words typed, as a whole
  word (case and accents do not matter, and part of a word matches nothing). The fields searched are the entity's
  `text` and `auto_number` fields that are `searchable` (the authoring skill's `entities.md`): a `text` field is
  unless it says `searchable: false`, an `auto_number` field only if it says `searchable: true`, and a code is matched
  whole; a `formula` field with a text result is searched too when it says `searchable: true`. A secured field is not
  searched for anyone, and a field the person may not read is left out for them.
  Number, date, enum and reference fields are not searched, and a reference's target name is not: to find records by
  the name of what they point at, use `ref_filters`.
- `sort` is a sortable field's key (`ref.field` for one hop, or `created_at`, `updated_at`), `dir` is `asc` or
  `desc`. `limit` is 1 to 200; `next_cursor` is `null` on the last page.
- `view_id` (the id of one of the entity's views, other than a `detail` view) cuts each record to the view's
  `columns` and sends smaller pages. Leave it out unless you want that; with it, a field the view does not list is
  not in `body` or in `ref_labels`. It does not filter: to show a view's records, send the view's filters yourself.
- "Only my records" is a filter you send yourself, `{ field: 'borrower', op: 'eq', value: host.context.person.id }`.
  It is not a security boundary: what the person may read is decided by their grants.

## One record

`EntityRecord` is `{ id, entity_id, body, created_at, updated_at, ref_labels?, … }`.

- `body` holds the field values by key: text, number and boolean as they are; a `date` as `YYYY-MM-DD`; an `enum`
  as its `value`; a `multi_select` as a list of values; a `reference` as the target record's **id**; a
  `reference_list` as a list of ids; a `file` as a list of **attachment ids** (strings). A field the person may not
  read is redacted or left out.
- To read a file, call `GET /attachments/{attachment_id}` for its metadata (`original_filename`, `content_type`) and
  `GET /attachments/{attachment_id}/download` for its bytes, as a person who can read the record (a test:
  `client.GET('/attachments/{attachment_id}/download', { params: { path: { attachment_id } }, parseAs: 'arrayBuffer' })`).
  The id list is `(record.body.approval_letter ?? []) as string[]`; the generated `EntityFields` types a `file` field
  `unknown`, so narrow it yourself.
- `ref_labels` is `{ [fieldKey]: { [referencedId]: label | null } }`: for each readable reference field, the
  display label of each record it names. A label is `null` when the target is gone or its title is hidden from this
  person. Read a name as
  `record.ref_labels?.borrower?.[record.body.borrower as string] ?? ''`, and for a list field map over
  `body.<field>`. Never show a raw id.

```ts
const toLoan = (record: Wire) => {
  const body = record.body as Record<string, unknown>;
  const labels = record.ref_labels ?? {};
  const named = (field: string) => {
    const id = body[field];
    return typeof id === 'string' ? (labels[field]?.[id] ?? null) : null;
  };
  return {
    id: record.id,
    item: typeof body.item === 'string' ? body.item : '',
    borrower: named('borrower'),
    due: typeof body.due_date === 'string' ? body.due_date.slice(0, 10) : null,
    status: String(body.status ?? ''),
  };
};
```

## A record's runs, and what a run did

A module can list the workflow runs about a record and read what each one did, as counts and timings. Anyone who can
read the record can; through an installed app, only the runs of workflows the package's ceiling covers count. In the
list a run the ceiling does not cover is simply absent; the trace of one answers `404`. A run with no record behind it
(no record subject; a run about a set of records counts too) is its starter's and the admins'; a run about a record is
traced only if the app can read that record, whoever started it.

- `GET /entities/{entity_id}/records/{record_id}/runs`, with `cursor` and `limit` (1 to 200, 50 when absent), answers
  `{ items, next_cursor, prev_cursor }`, newest first, `next_cursor` `null` on the last page. It is a forward feed, so
  `prev_cursor` is always `null`. Each item is a run header:
  `{ id, workflow: { id, key, name }, status, started_at, completed_at, outcome, subject }`. `outcome` is the run's
  outcome label, or `null` (no outcome yet, or the run holds captured values the person may not read).
- `GET /instances/{instance_id}/trace` answers `{ run, steps }`: `run` is the same header, and `steps` are the steps
  that ran, in order. Each is `{ node_id, label, kind, status, started_at, completed_at, attempts }`; `attempts` counts
  how many times the step ran.
  - An agent step adds `agent: { key, name, skills: [{ name, how }], tools: { name: count }, memory: { total, by_type } }`.
    `how` is `always_on` or `loaded`; `tools` counts each tool's calls; `by_type` counts the memory the step drew on by
    memory type key. A type the package does not declare counts as `other`, as does a tool name that is not a plain
    name. `key` and `name` are `null` for a step that sets its agent inline.
  - A Learn step adds `learn`, a map of the counts its last write reported.
- A trace never holds error text, token counts, inputs, outputs, prompts, tool payloads or memory titles. A person who
  needs those opens the run's page in AgentFlow as an admin; a module cannot show them.

```ts
import { ok, type AppHost } from '@reflexify/agentflow-sdk';

async function newestRun(host: Pick<AppHost, 'api'>, entity_id: string, record_id: string): Promise<string[]> {
  const { items } = await ok(host.api.GET('/entities/{entity_id}/records/{record_id}/runs', {
    params: { path: { entity_id, record_id }, query: { limit: 1 } },
  }));
  if (items.length === 0) return [];
  const { steps } = await ok(host.api.GET('/instances/{instance_id}/trace', {
    params: { path: { instance_id: items[0].id } },
  }));
  return steps.map((step) => `${step.label}: ${step.status}`);
}
```

## An app's agents over a window

A module can show what each agent its package installed did over a period, as counts: how many of its steps succeeded
and failed, and what its Learn steps wrote. Only an installed app can ask; the first-party session and a service
principal are refused.

- `GET /app/agents/activity`, with `from` and `to` (date-times; `from` is inclusive, `to` exclusive). `to` is now and
  `from` is 30 days before `to` when absent. The window spans at most 92 days and `from` must come before `to`; any
  other window is `400 VALIDATION_ERROR`. The answer repeats the window:
  `{ from, to, agents: [{ agent: { key, name }, steps: { succeeded, failed }, learn: { proposed, created, confirmed, dropped } }] }`.
- `agents` lists every agent the package installed, sorted by `key`, with zeros for one that did nothing in the window,
  so a module can draw the whole roster. An agent of an optional feature that is off, an agent another package exports
  and the organization's own agents are not listed.
- `key` is the installed key, the same one a trace's `agent.key` carries, so a module can match an agent here to the
  steps of a run's trace.
- A step is one visit of a workflow step that calls the agent, as a trace shows it. A step that retried counts once, by
  how its last attempt ended: `succeeded` or `failed`. A step still waiting or running counts as neither. A step falls
  in the window of its first call, so a step that began before `from` belongs to the earlier window and two adjacent
  windows never count one step twice. A Learn step is a step too, so it is in `steps` and in `learn`.
- `learn` sums what the last write of each of the agent's Learn steps reported, and only a write that succeeded:
  `proposed` memory items and links left for a person to review, `created` items (links are not counted), `confirmed`
  items, and `dropped` candidates. An agent with no Learn step has zeros.

Only runs the person could see through the app count, so two people can get different numbers for the same window. A
run about a record counts only if the person holds `entity.read` and `entity.list` and may both list and read that record, through an
entity the app may read, and only for a workflow the package's ceiling covers. A run about a Workflow task record counts
only while the workflow that opened the task is covered. A run about no record (no subject, or a set of records) counts
only for a person who holds `instance.read.any` or `instance.admin`. A run whose record was deleted or is in the trash,
and a test run, never count. What the person may not see is left out without an error.

The counts say what the agents did, not what happened to the records. For a figure about the records themselves, such
as how many items were closed or how many sit in each status, count the app's own records with `count_records` or a
dashboard the package ships (below). Nothing here names a run or a record, and no prompt, output, tool, error text,
token count or memory title is told; a module cannot show them.

```ts
import { ok, type AppHost } from '@reflexify/agentflow-sdk';

async function agentFailures(host: Pick<AppHost, 'api'>, days: number): Promise<Record<string, number>> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const { agents } = await ok(host.api.GET('/app/agents/activity', {
    params: { query: { from: from.toISOString(), to: to.toISOString() } },
  }));
  return Object.fromEntries(agents.map((a) => [a.agent.key ?? a.agent.name, a.steps.failed]));
}
```

An answer for a package `acme_cases` with one agent, over a window in which it ran four steps, one of them failing,
reads `{ agent: { key: 'acme_cases__helper', name: 'Helper' }, steps: { succeeded: 3, failed: 1 }, learn: { proposed: 0, created: 0, confirmed: 0, dropped: 0 } }`.

## Counting, and figures over many records

Count on the server rather than paging records into the browser to count them:

- `POST /entities/{entity_id}/records/count`, body `{ filter }` (the query's `filter`), answers `{ count, capped }`:
  exact up to 100,000, and `capped` past that. One call per figure.
- A sum, an average, or a figure split by a field or by a date bucket is a tile the module computes itself:
  `POST /analytics/tiles/compute` through `host.api`, body `{ tiles }`, for the signed-in person within their own
  access. Send 1 to 24 computing tiles (a `text` tile does not count, and an empty list is a 422), in the
  format of a dashboard file's tiles (the authoring skill's `dashboards-and-launcher.md`) but with no `position`.
  The answer is one result per tile, in the order sent. The operation needs platform `2026.12`: set the manifest's
  `minPlatformVersion` to it (`pitfalls.md`, "Every figure is missing").
  - `entity_id` is `getAppObjects(host.api).id('entity:<key>')` after `await load()`.
  - **A measure is defined inline**, as in a dashboard file's tile: `{ id, fn, field?, primary: true }`, and
    `label`, `key`, `color`, `filter` as that page lists them. This is how a module gets a figure today, because a
    package cannot ship an entity metric yet.
  - `metric: "<metric key>"` in place of the definition follows a metric the **organization** defined on the entity,
    found by its key. It carries only that, its `id`, `primary`, `key` and `color`: a `fn` or `field` beside it is a
    422, since the metric's definition would overwrite it. The organization can rename or delete the metric after
    the module ships, and an app is told only of metrics that read what it may read, so a key the entity does not
    have is a `failed` tile (`TILE_METRIC_MISSING`). A module relies on `metric` only when it tells the installer
    which metric to make, and draws that failure as an empty state.
  - A list tile names its view with `view: "<view key>"`. A tile that sends `entity_metric_id` or `view_id` is
    refused with a 422.
  - Tile and measure ids are UUIDs the module fixes in its code, unique in the request (a measure's, within its
    tile). They point at nothing; they come back as each result's `tile_id` and as the keys of `measures`.
  - A period switch rewrites the date entry in each tile's `query.filter.field_filters`:
    `{ field, op: 'within', value: 'last_30_days' }` (or `last_7_days`, `last_90_days`), or `op: 'between'` with
    two days. A team or category control adds its own entries to the same list.
  - **The days are counted in two places.** `within last_<n>_days` (and `this_month` and the other windows) count from
    the organization's day, in the organization's time zone, on the server. The two days of a `between`, and any
    date the module makes itself (`new Date()`), come from the person's browser. Near midnight in another zone the two
    windows differ by a day, so a screen that mixes them shows figures for one window beside a label for another.
    Use `within` when the screen only needs "the last n days", and say which window a figure covers in words the
    person can check. `host.context` has no time zone (`person`, `org: { id, name }`, `locale` and `theme`), and no read
    of the published API gives it, except `org_timezone` in a task's `get_record_step` answer, which exists only where
    the record has an open step.
  - Each result's `outcome` says what the screen shows:
    - `ok`: draw `measures[<measure id>].value`, or for a chart its `buckets` (below). A value is `null` when the
      figure is undefined, such as an average over no records, so show a dash and never a zero.
    - `unavailable`: the person may not list the entity, or the app may not read what the tile reads, or the tile
      names a field, relationship or entity the app is not told of. Hide the tile. Through an app's token a
      misspelled field also answers `unavailable`, so a tile that is unavailable to everyone may name a field
      that isn't there.
    - `failed`, with a `problem`: a field the person may not read, a metric or view key that isn't there (a view
      hidden from the person answers the same), or `TILE_TIMEOUT`. Show the tile's empty state with
      `problem.detail`.
    - A 422 for the whole request names the bad tile's index (`tiles[2]: …`) and is a bug in the module.
  - Every figure is exact unless the deployment sets `ANALYTICS_POP_CAP`, and then `population.capped` says so.
  - Each tile has one deadline of 10 seconds. A tile that runs past it is `failed`; the others still answer.

```ts
import { getAppObjects, ok, type AppHost, type components } from '@reflexify/agentflow-sdk';

type Result = components['schemas']['TileResult'];

const TILE_ID = '0190f8f4-0000-7000-8000-0000000000a1'; // fixed UUIDs, chosen once
const MEASURE_ID = '0190f8f4-0000-7000-8000-0000000000b1';

type Figure = { kind: 'value'; value: number | null } | { kind: 'hidden' } | { kind: 'failed'; detail: string };

// The sum of a number field over the records whose date field falls in the last `days` days.
async function sumFigure(host: Pick<AppHost, 'api'>, sum: string, dated: string, days: 7 | 30 | 90): Promise<Figure> {
  const objects = getAppObjects(host.api);
  await objects.load();
  const { tiles } = await ok(host.api.POST('/analytics/tiles/compute', {
    body: { tiles: [{
      kind: 'number', id: TILE_ID,
      query: {
        entity_id: objects.id('entity:<key>'),
        measures: [{ id: MEASURE_ID, fn: 'sum', field: sum, primary: true }],
        filter: { field_filters: [{ field: dated, op: 'within', value: `last_${days}_days` }] },
      },
    }] },
  }));
  const result: Result = tiles[0]!;
  if (result.outcome === 'unavailable') return { kind: 'hidden' }; // hide the tile
  if (result.outcome === 'failed') return { kind: 'failed', detail: result.problem?.detail ?? '' }; // empty state
  return { kind: 'value', value: result.measures?.[MEASURE_ID]?.value ?? null }; // null: draw a dash
}
```

**A chart** is a `chart` tile: `kind: 'chart'`, `chart` (`bar`, `column`, `line`, `pie` or `donut`) and `split_by`,
`{ field, bucket? }`, beside the same `query`. `bucket` (`day`, `week`, `month` or `quarter`) is required for a
date or datetime field and refused for any other. The answer is `measures[<measure id>].buckets[]`, in the order
to draw them:

- `key` is a string, or `null` for the records whose split field is empty, and `value` a number or `null`;
  `count` is how many records the measure covered in the bucket. `label` is present only for a split by a reference
  (the target record's name, left out when the reader may not read it). For a date the `key` is the period (below),
  and for an enum it is the option's stored value, not its label: map it to the label yourself.
- **A date bucket's `key` is the first day of its period as `YYYY-MM-DD`**: `2026-03-01` is March 2026, a week's key
  is its Monday, a quarter's the first day of its first month. A datetime is placed in the organization's time zone
  first. The buckets run in date order, **every period between the first and the last (or the filter's window) is
  there**, and an empty one has `filled: true`, `count: 0`, and a `value` of `0` for an additive function (`count`,
  `sum`, `count_filled`, `count_empty`) and `null` for any other. The `null` key, if any, comes after them. A series
  of more than 400 periods fails the tile (`TILE_SPLIT_BUCKET_LIMIT`): use a coarser bucket or a narrower window.
- **Any other split** is ordered by the size of the primary measure's `value`, largest first, at most the split's
  `limit` buckets (20 unless it sets fewer). The rest are folded into one bucket keyed `$other`, with `other: true`
  and its `count`; its `value` is the sum for an additive function and `null` otherwise.
- `$restricted` is the one bucket for the records whose split value the reader may not read. It appears only for an
  additive function; for any other the result's `coverage.partial` is `true` instead. Draw it as "not readable",
  not as a category.
- `drill` is the address of the bucket's records in the record browser's filter grammar, and **every bucket has one**
  unless the tile sets `drill_disabled`, its entity has no saved view for the browser to land in, the grammar cannot
  name exactly those records, the bucket belongs to a comparison's earlier population, or the reader's record browser
  may not use the address (it filters on a field or relationship they may not read). `target`, `derived`,
  `comparison` and `segments` are present only for a tile that asks for a target, a derived shape, a comparison
  (`compare`) or a stack (`stack_by`); `unmatched` only with `compare`.

```ts
type Bucket = components['schemas']['Bucket'];

// A month series for a column chart: the month as 'YYYY-MM', a null value where there is nothing to draw.
function monthSeries(buckets: Bucket[] | null | undefined): { month: string; value: number | null; filled: boolean }[] {
  return (buckets ?? []).flatMap((b) =>
    b.key !== null && /^\d{4}-\d{2}-\d{2}$/.test(b.key) ? [{ month: b.key.slice(0, 7), value: b.value, filled: b.filled === true }] : [],
  ); // the null key and '$restricted' are not months
}
// result.measures?.[MEASURE_ID]?.buckets is what to pass in.
```

The kit has no chart element, so the module draws the buckets itself.

**Typing the request.** The generated request body is untyped: `ComputeTilesBody.tiles` is
`Record<string, unknown>[]`, so the compiler does not check a tile. A misspelled `fn` or member fails the parse and is
a 422 for every caller, before the app's field check, once the entity is one they may list (a misspelled filter key is
refused earlier still, before the entity is looked at); only a misspelled **field** answers `unavailable` through an
app's token. The result is typed (`TileResult`, `Bucket`). To check what you send, take the
dashboard tile types from the generated schemas and drop `position`, which the route supplies; `TileSpec` is a
union by `kind`, so drop it from each member:

```ts
type Schemas = components['schemas'];
type Without<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type SentTile = Without<Extract<Schemas['TileSpec'], { kind: 'number' | 'chart' }>, 'position'>;
const tiles: SentTile[] = [/* number and chart tiles, with an inline measure */];
```

That covers a number and a chart tile with inline measures. It does not describe `metric` on a measure (`TileMeasure` has
none) or a list tile's `view` (`TileSpec` has `view_id`): build those as plain objects.

- Within the person's access means their row limits and their field access: a tile over records they cannot
  list is unavailable to them, and one over a field they cannot read fails. A rollup field is the exception: it
  is computed over every child, whatever the reader may see, so never let a rollup carry a figure meant for some
  readers only.
- A package can ship the same tiles as a dashboard (`POST /dashboards/{dashboard_id}/compute`, the id
  `getAppObjects(host.api).id('dashboard:<key>')`) for the installer's Dashboards list, and whoever they share it
  with. Its tiles are fixed in the file and it installs private to the installer, so it is not how a module gets
  its own figures.

## Writing records, and doing work

All through `host.api`, as the signed-in person; each refusal is AgentFlow's own and comes back as an
`AgentFlowError` (below). The SDK sends an `Idempotency-Key` for you.

| To | Call | Notes |
|---|---|---|
| create | `POST /entities/{entity_id}/records`, body `{ form_payload: { … } }` | only the keys the entity's create form binds are kept, and the others are dropped without an error (the `201` does not name them): bind every field the module sets, and read the record back when a value matters (`http-cases-api.ts` in the starter) |
| change fields | `PATCH /entities/{entity_id}/records/{record_id}`, body `{ changes: { field: value }, expected_updated_at }` | `changes` is by field key; `null` clears a field; `expected_updated_at` is the record's `updated_at` as you last read it, and a stale one is 409 `STALE_VERSION` (read the record again) |
| move a status | the same `PATCH`, `changes: { status: 'approved' }` | 422 `STAGE_TRANSITION_NOT_ALLOWED` when the person is not a mover of that move; 422 `ENTITY_VALIDATION_RULE_FAILED` when a rule refuses it (the message is the rule's own) |
| delete | `DELETE /entities/{entity_id}/records/{record_id}?expected_updated_at=…` | |
| list the person's work | `GET /work?view=mine` (what they hold) or `GET /work?view=claimable` (offered to them) | a page `{ items, next_cursor, prev_cursor }`, typed `components["schemas"]["WorkListPage"]`; an item's `entity_id` and `id` name the record, with its `title`, `live`, `priority`, `due_at`, `claimed_by_user_id` and, for a Workflow task, its `step`; its `status` is the work state (`none`, `active`, `waiting`, `done`, `cancelled`), not the record's status field |
| take a task | `POST /entities/{entity_id}/records/{record_id}/work/claim` | for a task offered to a group; `entity_id` is the line's `entity_id` and `record_id` is its `id`, as `GET /work?view=claimable` lists them |
| give a task back | `POST /entities/{entity_id}/records/{record_id}/work/release` | the person releases what they hold; a Signature step's task can be released and claimed back by its signer, but never handed to someone else (`reassign` and `assign` answer 409 `SIGNATURE_TASK_NOT_REASSIGNABLE`) |
| tell who holds a record that is a task (its entity has `work`) | read its `claimed_by` (a user id, or empty) and `work_state` | `claimed_by` stays set after the work ends; the authoring skill's `work.md` says what each status does to the work |
| finish a record that is a task | move its status with the `PATCH` above | the holder needs `update` on it: an `update` grant with the `work` record scope gives it to whoever holds the record |
| read a task | `GET /entities/{entity_id}/records/{record_id}/step` | the step's panel: its `kind` (`human` or `signature`), `signs`, its `actions` (each an `id` and a `label`), and `signed_action_id`, the action that completes through signing |
| finish a task | `POST /entities/{entity_id}/records/{record_id}/step/submit`, body `{ payload: { <field key>: <value>, …, _action: '<action id>' } }`: the step form's values by field key, beside the action | only the person who claimed it: `WORK_NOT_CLAIMANT` (403) otherwise; `HUMAN_ACTION_REQUIRED` or `HUMAN_ACTION_UNKNOWN` (400) for a missing or wrong action; `STEP_PAYLOAD_INVALID` (422) when the form refuses a value, its `detail` naming each as `<path>: <message>`; `STEP_CONTENT_NOT_SHOWN` (403) when the person may not read the values the form writes; `HUMAN_ACTION_REQUIRES_SIGNATURE` (400) for the action that signs; `SIGNATURE_TASK_REQUIRES_SIGNING` (400) for a Signature step's task |
| start a workflow | `POST /workflows/{workflow_id}/instances`, body `{ name: '<a name for this run>', params: { …the run's input, as the workflow's inputSchema names it } }`, or `{ name, subject: { kind: 'record', record_id } }` for a workflow that starts on a record | `workflow_id` is `getAppObjects(host.api).id('workflow:<key>')` after `load()`; the person needs a start grant |

A 403 or 404 on any of these means the person has no grant for it: show the screen as read only for them rather
than a failure.

**A step that signs is finished by signing, never by `submit`.** Two kinds of task complete only through AgentFlow's
signing:

- the action a Human step ties to signing (`signed_action_id`), which `submit` refuses with
  `HUMAN_ACTION_REQUIRES_SIGNATURE`;
- a Signature step's task (`kind: 'signature'`). It has no action to submit. Never send it to `submit`: this release
  refuses it with `SIGNATURE_TASK_REQUIRES_SIGNING`, and an older AgentFlow takes it and closes the person's task
  unsigned, while the envelope stays out and the run waits. The task belongs to the person its envelope line was
  addressed to: `reassign` and `assign` of it answer 409 `SIGNATURE_TASK_NOT_REASSIGNABLE`, and only that person is
  given the signing frame.

Sign either one with `host.signing?.sign({ entity, record })`, passing the task's ids
([signing.md](signing.md)). The step's other actions, such as sending it back, go through `submit` as usual.

**A step's draft cannot be saved from a module.** Only reading a step and submitting it are published. Keep a
half-filled form in the module until the person submits, and tell them it is not saved in AgentFlow until then.

## A file into a File field

Three calls: `POST /attachments` stores the file, a read of the record gives the field's whole value, and a `PATCH`
of the field binds the file. The record must exist first.

```ts
import { ok, type AppHost, type components } from '@reflexify/agentflow-sdk';

type Upload = components['schemas']['AttachmentUpload'];

/** Uploads `file` for the File field `field` of the record, and adds it to the files the field holds. */
async function attach(host: Pick<AppHost, 'api'>, entity_id: string, record_id: string, field: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('entity_id', entity_id);
  form.append('record_id', record_id);
  form.append('field', field);
  // The generated type has `file` as a string (it is binary); the SDK sends a FormData as it is, with its boundary.
  const uploaded = await ok(host.api.POST('/attachments', { body: form as unknown as Upload }));
  const path = { entity_id, record_id };
  // Read whole, here: a list row read with `view_id` holds at most three ids of a File field.
  const record = await ok(host.api.GET('/entities/{entity_id}/records/{record_id}', { params: { path } }));
  const held = ((record.body as Record<string, unknown>)[field] ?? []) as string[];
  await ok(host.api.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path },
    body: { changes: { [field]: [...held, uploaded.id] }, expected_updated_at: record.updated_at },
  }));
  return uploaded.id;
}
```

- **Create the record, then upload.** On the app's own site the upload goes through the app's token, which must
  name the file's target: `entity_id`, `record_id` and `field` for a File field (or `comment` set to `true` for a
  comment on the record), so the record must already exist. A module inside AgentFlow calls as the person, whose
  target parts are ignored, so the same request serves both hosts. For the same reason a module does not put a new
  file in a create's `form_payload`: through an app's token there is no record yet to hold it to.
- **The upload binds nothing; the `PATCH` does.** A File field's value is a list of attachment ids, and the list you
  send replaces it: send the ids it holds and the new one, or the others are let go. More than the field's
  `max_files` is `ENTITY_FILE_LIMIT_EXCEEDED`. A file nothing binds is removed later.
- **Take the held ids from the record read whole**, as `attach` does, never from a list row. A list read with
  `view_id` keeps only the first three ids of a File field (`file_counts` holds the total) and leaves out a field the
  view does not show, so a `PATCH` built from such a row lets go of the rest. On `409 STALE_VERSION`, read the record
  again and send the `PATCH` again: the upload is still there to bind (and, through an app's token, still held to
  the field).
- **Through an app's token the file is held to its target until that bind.** Only a write of that field on that
  record takes it; any other write is refused `ENTITY_ATTACHMENT_INVALID`. Until then the app reads the file while it
  may read the record, so the screen can show what was just uploaded.
- **Refused before anything is stored:** a missing or wrong target (`VALIDATION_ERROR`), a record the person may not
  read or update (`ENTITY_RECORD_NOT_FOUND`), a field the app may not write (`APP_CEILING_DENIED`). A file over the
  deployment's upload limit (50 MB unless its operator changed it) is `413`. An AgentFlow older than platform
  `2026.11` refuses an app's upload: a package that relies on it sets `minPlatformVersion` to `2026.11`.

The picker that feeds `attach` is a native file input: `kit-in-react.md`, "A choice and a file".

## People, groups and units

- **The installation's answers.** `GET /app/objects` carries `parameters`: the value the installation holds for each
  parameter, by key. A `group_ref` holds the group's id, a `user_ref` the person's id, and a text, number or choice
  parameter its value; a secret or a connection is never listed. Read it from the cache's answer:
  `(await getAppObjects(host.api).load()).parameters`.
- **The directory.** `GET /groups/{group_id}` (a group with its members), `GET /users` (`q` searches the name and
  the email, `group_id` keeps a group's members), `GET /units` (`q` searches the name and the code) and
  `GET /units/{unit_id}`, and `GET /identities` (names for `user_ids` and `group_ids`). The lists page with `cursor`.
- **Inside AgentFlow** the module calls as the person, and anyone in the organization may read its directory: no
  role permission is needed, and nothing is cut.
- **On the app's own site** the app's token reads only the built-in entities the package lists in
  `requires.entities`, and only the fields listed there (`manifest.md` in the authoring skill): `user` for people and
  a group's members, `group` for a group, `org_unit` for units. `q` on `GET /users` needs `name` and `email` listed,
  on `GET /units` `name` and `code`. `GET /groups` and `GET /users/{user_id}` are refused whatever it lists, and
  anything else it does not list answers `APP_CEILING_DENIED`. An AgentFlow older than platform `2026.11` may refuse
  all of these but `GET /users`.
- **The answers differ by host.** Through the app's token a person is `AppDirectoryUser`, a group `AppDirectoryGroup`
  and a unit page `AppUnitPage`, each with only the listed members, which may be null. Read only the members both
  shapes have: a person's `id`, `display_name` and `email`; a group's `id`, `name` and `members`; a unit's `id`,
  `name`, `code` and `parent_id`.

```ts
import { getAppObjects, ok, type AppHost } from '@reflexify/agentflow-sdk';

/** The people of the group the installation's `legal_team` parameter names. */
async function legalTeam(host: Pick<AppHost, 'api'>): Promise<{ id: string; name: string }[]> {
  const group_id = (await getAppObjects(host.api).load()).parameters.legal_team;
  if (typeof group_id !== 'string') return [];
  const group = await ok(host.api.GET('/groups/{group_id}', { params: { path: { group_id } } }));
  const members: { id: string; display_name?: string | null }[] = group.members ?? [];
  return members.map((m) => ({ id: m.id, name: m.display_name ?? '' }));
}
```

## Failures

A refused call is an `AgentFlowError`: show `error.detail` with its leading `CODE:` stripped, or the first of
`error.fieldErrors`, as `toCasesError` in the starter does. `404` on the entity or a record means the person may
not read it; `403` means no grant allows the operation. A person with no access to the entity gets an empty or
refused answer: the module shows its empty or error state, never a crash.
