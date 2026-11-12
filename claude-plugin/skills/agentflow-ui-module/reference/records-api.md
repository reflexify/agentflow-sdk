# Reading records: one filtered, sorted query

The starter's `src/module/http-cases-api.ts` lists every case with no filter. Most screens need a filter, a sort
and the names of the records a field refers to. The types are in the SDK, which your project has installed: open
`node_modules/@reflexify/agentflow-sdk/dist/generated/public.d.ts` and read `RecordQueryRequest`,
`EntityRecordFilters`, `RecordFieldFilter`, `RecordFilterOp`, `EntityRecordPage` and `EntityRecord` there. Reach
them as `components['schemas']['RecordQueryRequest']`, as the starter does for `EntityRecord`.

## The query

`POST /entities/{entity_id}/records/query` through `host.api`. The entity's id comes from the SDK's objects cache
(`getAppObjects(host.api)`, `await load()`, then `id('entity:loan')`, as `caseEntityId` in the starter does; a required package's entity
is `id('entity:<key>', { source: 'exported' })`, `generated-types.md`). Loans due in the next
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
- **Page controls.** A list the person pages through, with Previous and Next, a rows-per-page choice or a Load more, takes
  `af-pager` bound to the SDK's `cursorList`, not buttons of its own (for a Load more the page appends each page's items
  itself, since `cursorList` replaces `items` with each page). Make the list once for the screen, with this call as its
  page source: `cursorList((cursor, signal) => ok(host.api.POST('/entities/{entity_id}/records/query', { params, body: { ...query, cursor }, signal })))`.
  It returns each page's `items` and `next_cursor`, keeps the cursors behind Previous, aborts a stale call and drops a late
  answer; a new filter, sort or page size is its `reset()`. `kit-in-react.md`, "Lists and pages", writes the wrapper and
  the screen.
- `view_id` (the id of one of the entity's views, other than a `detail` view) cuts each record to the view's
  `columns` and sends smaller pages. Leave it out unless you want that; with it, a field the view does not list is
  not in `body` or in `ref_labels`. It does not filter or sort: a view's own filter and sort reach a module only on a
  list tile's result, and `listTileQuery` builds the query from them ("Drawing a tile", below).
- `include_capabilities: true` adds `capabilities` to each record: what the person may do with it ("What the person
  may do", below). It does not filter and it is not in the cursor.
- "Only my records" is a filter you send yourself, `{ field: 'borrower', op: 'eq', value: host.context.person.id }`.
  It is not a security boundary: what the person may read is decided by their grants.

## One record

`EntityRecord` is `{ id, entity_id, body, created_at, updated_at, ref_labels?, … }`, and `capabilities?` when the read
asked for it (`include_capabilities`).

- `body` holds the field values by key: text, number and boolean as they are; a `date` as `YYYY-MM-DD`; an `enum`
  as its `value`; a `multi_select` as a list of values; a `reference` as the target record's **id**; a
  `reference_list` as a list of ids; a `file` as a list of **attachment ids** (strings). A field the person may not
  read is redacted or left out.
- To let the person pick the record a `reference` or `reference_list` field names, use an `af-combobox` whose `value` is
  the record's id (an array with `multiple`, for the list) and whose one stable `source` asks the target entity with
  `POST /entities/{entity_id}/records/query`, sending `q` as `filter: { q }` and `cursor` as `cursor`, and answers
  `{ items, next: next_cursor }` with each record's `id` as `value` and, as `label`, the `body` field that the entity's
  `display_field` names (the field it shows as a record's title, on `GET /entities/{entity_id}`). **The source needs a
  `resolve(ids, signal)` whenever `value` can start non-empty**, which an edit form's saved reference always does: the
  combobox never looks an id up itself, so without `resolve` the saved record shows blank. Make `resolve` read each id
  with `GET /entities/{entity_id}/records/{record_id}` and label it the same way, leaving out one that answers 404 or
  403. A short, fixed set of targets can be an `af-select` instead. The shape of a source, with its `resolve`, is in
  `kit-in-react.md`, "A choice" (and "Pickers" for the person, unit and group sources the SDK makes).
- **A file panel needs no read per file.** The record read already describes each file in two members, keyed like
  `ref_labels` as `{ [fieldKey]: { [attachmentId]: … | null } }`:
  - `file_labels` gives each file's name.
  - `file_details` gives its `content_type`, `byte_size`, `uploaded_at` and `uploaded_by`.

  A file this person may not be told of is `null` in both, so show it as unavailable. Read them as
  `record.file_labels?.contract?.[id] ?? ''` and `record.file_details?.contract?.[id]?.uploaded_at`.
  `uploaded_by` has three cases:
  - a person's id, which you name with the people picker's `resolve` ("Pickers" in `kit-in-react.md`);
  - `null`: no person is on record (a workflow made the file, or its uploader was removed), so show no name;
  - left out: only on the app's own site (an installed app's token), when the package does not require the `user`
    entity. Inside AgentFlow the module calls as the person and always gets it, so test the standalone site too.

  `GET /attachments/{attachment_id}` answers the same facts for one file, flat: `original_filename`, `content_type`,
  `byte_size`, `uploaded_at` and `uploaded_by`. `GET /attachments/{attachment_id}/download`
  is for its bytes, as a person who can read the record (a test:
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
  `{ id, workflow: { id, key, name }, status, started_at, completed_at, outcome, subject, triggered_at }`. `outcome` is
  the run's outcome label, or `null` (no outcome yet, or the run holds captured values the person may not read).
  `triggered_at` is when the record change that started the run happened, `null` for a run anything else started.
- `GET /instances/{instance_id}/trace` answers `{ run, steps }`: `run` is the same header, and `steps` are the steps
  that ran, in order. Each is `{ node_id, label, kind, status, ready_at, started_at, completed_at, attempts }`;
  `attempts` counts how many times the step ran, and `ready_at` is when the step could first run.
  - Read the times as waits: `run.started_at − run.triggered_at` is how long the run took to start after the record
    changed, a step's `started_at − ready_at` how long it waited for a worker, and `completed_at − started_at` its own
    work (a Code step's includes starting its sandbox). `ready_at` and `triggered_at` are `null` on older runs.
  - An agent step adds `agent: { key, name, skills: [{ name, how }], tools: { name: count }, memory: { total, by_type } }`.
    `how` is `always_on` or `loaded`; `tools` counts each tool's calls; `by_type` counts the memory the step drew on by
    memory type key. A type the package does not declare counts as `other`, as does a tool name that is not a plain
    name. `key` and `name` are `null` for a step that sets its agent inline.
  - A Learn step adds `learn`, a map of the counts its last write reported.
  - A step whose last visit wrote nothing because the record had moved adds `skip_reason`: `edited`, `superseded` or
    `changed`, as its output's `skip_reason` says. It is how a module tells an Entity Record step that skipped from one
    that wrote, since the trace holds no output.
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

## Where a field's value came from

A module can show, for a field an AI step filled in, which passages of which file the agent cited, and, for any field,
who or what wrote the value and when. AgentFlow's own record page shows both: a chip naming who or what wrote the value
(none for an `unknown` or `pre_feature` one) and a chip for each passage an AI step cited. Read it with
`GET /entities/{entity_id}/records/{record_id}/provenance` (`get_record_provenance`). It answers the whole record in one
call, with no paging, and the SDK's `provenance.forField` joins one field to what the answer holds for it. Anyone who can
read the record can ask; through an installed app the answer is narrower, as below.

- The answer is `{ origins, fields, passages }`. `fields` is ordered by `field_key` and holds only a field the person may
  read, the entity still defines, and that has an origin, a citation or both; a field with neither is absent, so
  `forField` returns `undefined` for it.
- A field's `origin` is `{ category, confidence, redacted, reason, written_at, run }`, or `null`. `category` is `human`,
  `ai`, `integration`, `workflow`, `system`, `unknown` or `pre_feature`; `written_at` is when the value was written;
  `run` is `{ instance_id, workflow: { id, key, name } }` for the run that wrote it, or `null`. A person who edits a
  field after an AI step wrote it leaves a `human` origin and no citation.
- A field's `citation` is `{ run, step: { node_id }, sources }`, or `null`: the run and the agent step that cited
  passages for the value, and the chunk ids it cited. `step` is `null` whenever `run` is. `passages` holds each cited
  passage once, whatever number of fields cite it (`chunk_id`, `document_id`, `attachment_id`, `content_type`, `text`,
  `page_from`, `page_to`, `score`, `source_meta`); every id in any `sources` appears in it.
- `origins: "unavailable"` means the organization has context queries off, so every `origin` is `null`. It does not
  mean nothing was recorded: a citation is still told, and the organization may turn the queries on.
- Through an installed app's token the answer is told less than a person is told. A citation comes only from a
  workflow the package's ceiling covers, and a field the ceiling hides is left out. A passage is told only from a file
  the app may read (the check `get_attachment` makes), so one from a file the app cannot read is left out of
  `passages` and `sources`, and a citation left with no source is `null`.
- A run is named exactly when `GET /instances/{instance_id}/trace` would admit the caller. A run that is withheld
  leaves `run` (and `step`) `null` and changes nothing else in the entry, so every `instance_id` the answer holds
  opens in the trace. Follow `run.instance_id` there, and match `step.node_id` to a step's `node_id`, for the step's
  `label` and its times (above).
- The route needs platform `2027.04`: set the manifest's `minPlatformVersion` to it (`pitfalls.md`, "Behaviour").
  Nothing in the package says a module calls it, and an older AgentFlow answers `404`.

```ts
import { ok, provenance, type AppHost } from '@reflexify/agentflow-sdk';

async function showSources(host: Pick<AppHost, 'api'>, entity_id: string, record_id: string, fields: string[]) {
  const answer = await ok(host.api.GET('/entities/{entity_id}/records/{record_id}/provenance', {
    params: { path: { entity_id, record_id } },
  }));
  return fields.map((field) => {
    const evidence = provenance.forField(answer, field);
    return {
      field,
      writtenBy: evidence?.origin?.category ?? null, // null when origins are unavailable
      writtenAt: evidence?.origin?.written_at ?? null,
      cited: (evidence?.passages ?? []).map((p) => ({ text: p.text, page: p.page_from, attachment: p.attachment_id })),
    };
  });
}
```

Read the record's provenance once and ask `forField` for each field the screen draws. Never call the cockpit
(`GET …/cockpit`) or `/context/*` for this: they are internal, an app's token is refused them, and they are not
supported inside AgentFlow.

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
- `POST /entities/{entity_id}/records/stats` (`aggregate_records`), body `{ filter, metrics, scope? }`, totals the
  records `query` lists with the same `filter`, so a figure beside a list agrees with it. Use it for figures over what
  the module shows: a sum of a number field, an average, a count per status. `scope: { parent_entity_id, record_id,
  inverse_key }` limits it to one record's children, the way the record page's related list reads them, for an
  order's line total.
  - Send 1 to 8 `metrics`, each `{ id, fn, field? }`. `id` is a UUID of your choosing, and the answer comes back
    under it. `fn` is `count`, `sum`, `avg`, `median`, `min`, `max`, `count_distinct`, `count_filled` or
    `count_empty` (every `fn` but `count` names a `field`). A metric can add `group_by: { field, limit? }` to split it
    by a facetable enum, text, yes/no, number, date or date-time field (not a text field that takes mentions), and
    `filter` (rules `{ field, op, value }` on the entity's own fields) to narrow that metric alone.
  - The answer is `{ metrics: { <id>: { value, population, cap_bound, groups? } }, population, capped,
    membership_rule }`. `value` is
    `null` where the figure is undefined (the average of no records), never `0`: show it as empty. `groups` lists
    `{ key, value, count }` per bucket, with `key: null` for the records whose field is empty.
  - It measures at most 20,000 records, the ones with the lowest ids. Past that `capped` is `true` and every figure
    covers only those, so show it as partial: a capped `avg` or `median` is a sample. For a figure over a larger or
    growing entity, use a tile with a date window (next bullet), which no cap cuts unless the deployment sets one.
  - A metric over a field the person may not read is a 422 (`ENTITY_SENSITIVE_FILTER_DENIED`) that names the field.
    On the app's own site a field the package may not read is answered as one the entity does not have (422,
    `ENTITY_FIELD_NOT_FOUND`): list it in the package's access to total it. Through an app's token the
    Workflow task entity is a 403 (`APP_CEILING_DENIED`): count tasks with `count` instead.
  - On the app's own site the operation needs an AgentFlow release that serves it to apps; an older one answers
    `403 ENDPOINT_NOT_PUBLIC`, and no platform month says so (`pitfalls.md`, "Every total is refused"). Inside
    AgentFlow the module calls as the person and reached it already.
- A sum, an average, or a figure split by a field or by a date bucket is a tile the module computes itself:
  `computeTiles(host.api, tiles)`, which sends `POST /analytics/tiles/compute` for the signed-in person within their
  own access. `tiles` is an object of tiles keyed by the module's own names. Send 1 to 24 computing tiles (a `text`
  tile does not count, and an empty object is a 422), in the format of a dashboard file's tiles (the authoring
  skill's `dashboards-and-launcher.md`); a `position` is optional and the route ignores it. The answer is an object
  with one result under each name. The operation needs platform `2026.12`, and a `percentile` or `duration` measure
  needs `2027.01`: set the manifest's `minPlatformVersion` to the later month the module uses (`pitfalls.md`,
  "Every figure is missing").
  - **The entity is named by its key**: `query.entity: '<entity>'`, or `entity: '<entity>'` on a list tile. The helper
    looks the key up with `getAppObjects(host.api)` and sends its id as `entity_id`. `entity_id` itself holds an id,
    or `${entity:<key>}` as a dashboard file writes it, which the helper resolves the same way; a bare key there is
    refused. That placeholder, in the tile's own `entity_id`, is the only one the helper resolves
    (`PLACEHOLDER_UNRESOLVED`, below). `computeTiles` loads the same per-client `getAppObjects` cache the module uses,
    and creates it with the default options if it is the first caller, so a module that wants other options calls
    `getAppObjects(host.api, opts)` before its first `computeTiles`. `/app/objects` is read only when some tile names
    an entity by key.
  - **The module reads results by its own names.** The helper makes the tile and measure ids (UUIDs) the operation
    needs and reads the answer back by them, so a figure is `r.<tile>.measures.<key>`, with `<key>` the measure's
    `key`. A measure with no `key` is read by its `id`. An `id` the module gives is kept. It must be a UUID, because the
    server refuses anything else with a 422, and unique in the request (a measure's, within its tile). The helper never
    changes the tiles it is given, so one definition serves every period.
  - **A measure is defined inline**, as in a dashboard file's tile: `{ key, fn, field?, primary: true }` (a second
    measure of the tile takes `primary: false`, which its type requires), and
    `label`, `color`, `filter` as that page lists them. This is how a module defines a figure private to it; a
    figure the package's dashboards and the record browser share is an entity metric, which a measure follows by key
    (below). `fn: 'percentile'` takes `percentile: { p }`, a whole number from 1 to
    99, and a `duration: { from, to, unit }` replaces `field` to measure the time between two date fields (`unit` is
    `minutes`, `hours` or `days`; both fields are `datetime` fields, or both are `date` fields with `days`); that
    page lists the rules. A measure with a `duration` also answers `skipped`, the records that miss either date and
    are in no figure: its `population` counts only the records that have both, so show `skipped` beside the figure
    or it reads as covering every record. No other measure has `skipped`.
  - **A measure's `key` is its name in the result**: lowercase letters, digits and underscores, starting with a
    letter, at most 32 characters, unique within its tile, and not a word formulas reserve (`count`, `sum`, `avg`,
    `min`, `max`, `bucket` and `population` among them). Any other key is a 422. A measure with neither `key` nor `id` is
    refused before any request is made (`MEASURE_UNNAMED`, below), because its result would have no name.
  - `metric: "<metric key>"` in place of the definition follows the entity's metric with that key. It carries only
    that, its `id`, `primary`, `key` and `color`: a `fn` or `field` beside it is a type error and a 422, since the
    metric's definition would overwrite it.
    - **The package's own metric** is the one to follow. The package ships it in the entity file's `metrics`, as
      `entity_metric:<entity>/<key>` (the authoring skill's `entities.md`, "Metrics"), and its key is the same in
      every organization. Once installed it is guarded: the organization may rename it, recolour it and change its
      thresholds, but not change its key or what it counts, and cannot delete it while the app uses it, so its
      meaning holds under the module.
    - **An organization's own metric** can be followed by key too, but nothing guards it: the organization can change
      what it counts, rename its key or delete it after the module ships. Follow one only when the module can live
      with that.
    - An app is told only of metrics that read what it may read, so a key the entity does not have, or whose metric
      reads a field the app may not, is a `failed` tile (`TILE_METRIC_MISSING`). Draw that failure as an empty state.
  - A list tile names its view with `view: "<view key>"`, as `{ kind: 'list', entity: '<entity>', view: '<view key>' }`.
    A tile that sends `entity_metric_id` or `view_id` is refused with a 422: the helper copies both through, so a
    dashboard file's list tile, which holds a `view_id`, is refused too.
  - **A list tile comes back with its first page.** Its `list` says where the rows are (`entity_id`, `view_id`), how
    the view filters and sorts them (`view_filter`, `sort`), the page's own predicates (`filter`) and the view's
    `columns` the person may read. `computeTiles` reads the first `LIST_TILE_ROWS` (25) rows through
    `POST /entities/{entity_id}/records/query` in the person's own scope and returns them as `rows` beside `columns`,
    and the cursor after them as `next_cursor` (`null` when they are the last page).
    A refused read (the view sorts or filters by a field the person may not read, say) turns that one tile `failed`,
    with the server's code in `problem.type` and its status in `problem.status`. Through an app's token, a view that
    filters or sorts by a field the app may not read makes the tile `unavailable`.
  - A period switch changes the date entry in each tile's `query.filter.field_filters`:
    `{ field, op: 'within', value: 'last_30_days' }` (or `last_7_days`, `last_90_days`), or `op: 'between'` with
    two days. A team or category control adds its own entries to the same list. Build the tiles with a function of
    the period, as below, and call `computeTiles` again when the switch changes.
  - **The days are counted in two places.** `within last_<n>_days` (and `this_month` and the other windows) count from
    the organization's day, in the organization's time zone, on the server. The two days of a `between`, and any
    date the module makes itself (`new Date()`), come from the person's browser. Near midnight in another zone the two
    windows differ by a day, so a screen that mixes them shows figures for one window beside a label for another.
    Use `within` when the screen only needs "the last n days", and say which window a figure covers in words the
    person can check. `host.context` has no time zone (`person`, `org: { id, name }`, `locale` and `theme`), and no read
    of the published API gives it, except `org_timezone` in a task's `get_record_step` answer, which exists only where
    the record has an open step.
  - Each result's `outcome` says what the screen shows:
    - `ok`: draw `r.<tile>.measures.<key>?.value`, or for a chart its `?.buckets` (below). A value is `null` when the
      figure is undefined, such as an average over no records, so show a dash and never a zero.
    - `unavailable`: the person may not list the entity, or the app may not read what the tile reads, or the tile
      names a field, relationship or entity the app is not told of. Hide the tile. Through an app's token a
      misspelled field also answers `unavailable`, so a tile that is unavailable to everyone may name a field
      that isn't there.
    - `failed`, with a `problem`: a field the person may not read, a metric or view key that isn't there (a view
      hidden from the person answers the same), or `TILE_TIMEOUT`. Show the tile's empty state with
      `problem.detail`.
    - A tile that did not compute (`unavailable` or `failed`) has an empty `measures`, so every `measures.<key>` is
      `undefined` and the `?.` above is not optional: look at `outcome` first.
    - A 422 for the whole request is an `AgentFlowError`, and a bug in the module. When it is about one tile, its
      `detail` names the tile by the module's name for it (`tiles[1] (byWeek): …`).
  - Every figure is exact unless the deployment sets `ANALYTICS_POP_CAP`, and then `population.capped` says so.
  - Each tile has one deadline of 10 seconds. A tile that runs past it is `failed`; the others still answer.

```ts
import { computeTiles, type AppHost, type ComputeQuery, type ComputeTile, type ComputedTile } from '@reflexify/agentflow-sdk';

type Figure = { kind: 'value'; value: number | null } | { kind: 'hidden' } | { kind: 'failed'; detail: string };

// The tiles for one period. A function, because the date window is all a period switch changes.
function tilesFor(sum: string, dated: string, days: 7 | 30 | 90) {
  const query = {
    entity: '<entity>',
    measures: [{ key: 'total', fn: 'sum', field: sum, primary: true }],
    filter: { field_filters: [{ field: dated, op: 'within', value: `last_${days}_days` }] },
  } satisfies ComputeQuery;
  return {
    total: { kind: 'number', query },
    byMonth: { kind: 'chart', chart: 'column', split_by: { field: dated, bucket: 'month' }, query },
  } satisfies Record<string, ComputeTile>;
}

// What the screen draws for one measure of one tile.
function figureOf(tile: ComputedTile, key: string): Figure {
  if (tile.outcome === 'unavailable') return { kind: 'hidden' }; // hide the tile
  if (tile.outcome === 'failed') return { kind: 'failed', detail: tile.problem?.detail ?? '' }; // empty state
  return { kind: 'value', value: tile.measures[key]?.value ?? null }; // null: draw a dash
}

// The sum of a number field over the records whose date field falls in the last `days` days, and the same by month.
async function sums(host: Pick<AppHost, 'api'>, sum: string, dated: string, days: 7 | 30 | 90) {
  const r = await computeTiles(host.api, tilesFor(sum, dated, days));
  return { total: figureOf(r.total, 'total'), byMonth: r.byMonth }; // the chart: r.byMonth.measures.total?.buckets
}
// When the switch changes, the same call runs again: `await sums(host, '<field>', '<field>', 90)`.
```

Format a figure with `formatMeasureValue` from `@reflexify/agentflow-sdk`, not `toFixed`: it renders the value in its field's unit and draws `null` as `—`.

**A chart** is a `chart` tile: `kind: 'chart'`, `chart` (`bar`, `column`, `line`, `pie` or `donut`) and `split_by`,
`{ field, bucket? }`, beside the same `query`. `bucket` (`day`, `week`, `month` or `quarter`) is required for a
date or datetime field and refused for any other. The answer is `r.<tile>.measures.<key>?.buckets`, in the order
to draw them:

- `key` is a string, or `null` for the records whose split field is empty, and `value` a number or `null`;
  `count` is how many records the measure covered in the bucket. `label` is present only for a split by a reference
  (the target record's name, left out when the reader may not read it). For a date the `key` is the period (below),
  and for an enum it is the option's stored value, not its label: map it to the label yourself.
- **A date bucket's `key` is the first day of its period as `YYYY-MM-DD`**: `2026-03-01` is March 2026, a week's key
  is its Monday, a quarter's the first day of its first month. A datetime is placed in the organization's time zone
  first. The buckets run in date order, **every period between the first and the last (or the filter's window) is
  there**, and an empty one has `filled: true`, `count: 0`, and a `value` of `0` for an additive function (`count`,
  `sum`, `count_filled`, `count_empty`; a `sum` of a `duration` adds up like any other) and `null` for any other, a
  percentile included. The `null` key, if any, comes after them. A series
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
import type { components } from '@reflexify/agentflow-sdk';

type Bucket = components['schemas']['Bucket'];

// A month series for a column chart: the month as 'YYYY-MM', a null value where there is nothing to draw.
function monthSeries(buckets: Bucket[] | null | undefined): { month: string; value: number | null; filled: boolean }[] {
  return (buckets ?? []).flatMap((b) =>
    b.key !== null && /^\d{4}-\d{2}-\d{2}$/.test(b.key) ? [{ month: b.key.slice(0, 7), value: b.value, filled: b.filled === true }] : [],
  ); // the null key and '$restricted' are not months
}
// r.<tile>.measures.<key>?.buckets is what to pass in.
```

Draw a figure with the kit's `af-tile` ("Drawing a tile", below). Read the buckets yourself only for what it does not draw, or when a screen needs a figure of its own.

- Within the person's access means their row limits and their field access: a tile over records they cannot
  list is unavailable to them, and one over a field they cannot read fails. A rollup field is the exception: it
  is computed over every child, whatever the reader may see, so never let a rollup carry a figure meant for some
  readers only.
- A package can ship the same tiles as a dashboard (`POST /dashboards/{dashboard_id}/compute`, the id
  `getAppObjects(host.api).id('dashboard:<key>')`) for the installer's Dashboards list, and whoever they share it
  with. It installs private to the installer, so a module does not read it: it computes the tiles itself, from the
  same file if it likes (the authoring skill's `dashboards-and-launcher.md`).

**Typing the request.** `computeTiles` takes `ComputeTile`s, a union by `kind` built from the generated `TileSpec`, so
the compiler checks a tile before it is sent. Whatever object a tile comes from, these are type errors: a value the API
does not name (a misspelled `kind`, `fn`, `op`, `chart` or `bucket`), a `chart` tile with no `split_by`, a tile that
names no entity or names it twice, and a measure that holds both a `metric` and a definition of its own (`fn`, `field`,
`label` and the rest). A member the type does not have is a type error too, but only where the object is written: in
the call itself, or in an object that ends `satisfies Record<string, ComputeTile>` (`satisfies ComputeQuery` for a
query). That covers a `split_by` on a `number` tile, an `entity_metric_id` on a measure, a `view_id` on a list tile, and
a misspelled member (`drill_disabeld`, `filtre`, `lable`). A tile built in a variable and passed by name is not checked
for members it should not have, so end the object with `satisfies`. A field name is a plain string, so a misspelled
**field** gets past the compiler, and answers `unavailable` through an app's token. A result is a `ComputedTile`: the
generated `TileResult`, with `measures` keyed by the module's names and a measure possibly missing.

Keep a tile set the module reuses in a `const` that ends `satisfies Record<string, ComputeTile>`, or in a function that
returns one, as `tilesFor` does above: each `kind` stays a literal, a result is `r.total` rather than an entry of an
index signature, and every tile is still checked. Do not write `as const`: it makes `measures` readonly, and
`ComputeQuery.measures` is a mutable array, so the tile no longer type-checks.

**What fails, and how.**

- `ComputeTilesError` is thrown before the compute request is sent, and the whole call fails with it: no tile of that
  call computes. Its `tile` is the module's name for the tile at fault, and its `code` is one of five. Four are refused
  before any request is made; only `ENTITY_NOT_FOUND` can come after the one read of `/app/objects`.
  - `ENTITY_NOT_FOUND`: the key in `entity`, or in the `${entity:<key>}` of `entity_id`, names no entity the app has,
    or its object is switched off. This is the one a shipped module can meet: draw the screen's "not available here"
    state, and keep the tiles over an entity the screen can do without in a call of their own.
  - `ENTITY_TWICE`: a tile sets both `entity` and `entity_id`. A bug in the module, which the types refuse too.
  - `ENTITY_ID_INVALID`: `entity_id` is neither a UUID nor a `${entity:<key>}`, usually a key written where an id
    goes: set `entity` instead. A bug in the module.
  - `MEASURE_UNNAMED`: a measure has neither `key` nor `id`. A bug in the module.
  - `PLACEHOLDER_UNRESOLVED`: a string in the tile starts with `${` and is not the tile's own `entity_id`, the one
    placeholder the helper resolves. A `${param:<key>}` in a filter value, or a `${entity:<key>}` in a `ref_filters`
    entry's `inverse_entity_id`, would reach the server as that literal text, which is a 422 or a tile that counts
    nothing. The message gives the JSON pointer of the string in the tile. Pass the value itself. A bug in the module,
    usually a tile from a dashboard file that holds a placeholder the package build resolves.
- A failed `/app/objects` load comes as that route's own `AgentFlowError`, and does not name a tile.
- The server's 422 comes back as an `AgentFlowError` whose `detail` names the tile, `tiles[1] (byWeek): …`. Every
  other check, such as a malformed measure `key` or more than 24 tiles, is the server's, and is a bug in the module.

## Drawing a tile

`af-tile`, in the kit, draws a tile `computeTiles` computed: a number, a bar, column, line, pie or donut chart, a text
or a list, with its legend, tooltip, table view and keyboard reading. Pass it the tile, its result and the entity's
fields, and a list tile the rows and columns `computeTiles` read for it. It fetches nothing, so the module reads all
of them.

```ts
import { computeTiles, getAppObjects, ok, type AppHost, type ComputeTile } from '@reflexify/agentflow-sdk';
import type { AfDrillDetail, AfOpenRecordDetail } from '@reflexify/agentflow-elements/kit';

const tiles = {
  booked: { kind: 'number', label: 'Booked', query: { entity: 'deal', measures: [{ key: 'total', fn: 'sum', field: 'amount', primary: true }] } },
  byStage: { kind: 'chart', chart: 'column', split_by: { field: 'stage' }, query: { entity: 'deal', measures: [{ key: 'deals', fn: 'count', primary: true }] } },
} satisfies Record<string, ComputeTile>;

type Name = keyof typeof tiles;
type TileElement = HTMLElement & Record<string, unknown>;

// Once: read the entity for its fields, then mount each tile. Without a result a tile shows a skeleton.
async function mountTiles(host: Pick<AppHost, 'api'>, into: ParentNode, onDrill: (detail: AfDrillDetail, entity_id: string) => void) {
  const objects = getAppObjects(host.api);
  await objects.load();
  const entity_id = objects.id('entity:deal');
  if (!entity_id) return null; // the entity is not here: show the screen's "not available" state
  const entity = await ok(host.api.GET('/entities/{entity_id}', { params: { path: { entity_id } } }));
  const mounted = {} as Record<Name, TileElement>;
  for (const name of Object.keys(tiles) as Name[]) {
    const tile = document.createElement('af-tile') as TileElement;
    Object.assign(tile, { spec: tiles[name], fields: entity.fields, drill: true });
    tile.addEventListener('af-drill', (e) => onDrill((e as CustomEvent<AfDrillDetail>).detail, entity_id));
    into.append(tile);
    mounted[name] = tile;
  }
  return mounted;
}

// On the first load and on every refresh: only the results change, and each lands on the tile that is already there.
async function refresh(host: Pick<AppHost, 'api'>, mounted: Record<Name, TileElement>) {
  const results = await computeTiles(host.api, tiles);
  for (const name of Object.keys(mounted) as Name[]) mounted[name].result = results[name];
}
```

- **`spec`** is the tile you gave `computeTiles`, unchanged, and **`result`** is `r.<tile>`, the whole `ComputedTile`.
  Pass an `unavailable` or `failed` result as it is: the tile says so itself, `Not available to you` or the problem's
  title and detail. To hide an unavailable tile, as "Each result's `outcome`" above advises, test `outcome` and leave the
  tile out. While `result` is missing the tile shows a skeleton, so mount it before the answer and set `result` when
  it arrives: call `mountTiles` once, then `refresh` for the first answer and again whenever the figures should
  change. The tile loads its drawing code as soon as it is connected to the page, so mounting it early lets that
  code load while the request runs; a page that mounts no `af-tile` never fetches it.
- **`fields`** is `fields` of `GET /entities/{entity_id}`, the entity whose records the tile measures. It gives the
  labels, the formats (a currency, a percent, a duration) and the option labels and colours. Through the app's token
  it holds only the fields the app's ceiling admits. Read it once for each entity and share it among the tiles. A tile drawn without it still draws, with raw keys and plain numbers, and
  redraws when `fields` is set.
- **A period switch** is another `computeTiles` call and a new `result` (with the new `spec`, if the switch changed
  the tile) on the element that is already there, as `refresh` does, never a new element. The tile replaces its
  marks and hides its tooltip. A series a person had isolated stays alone if the new result still has it, and a
  series that arrives is hidden with the rest; if it is gone, every series shows again. Keep the current `result`
  on the element until the new one arrives: setting it to `null` unmounts the chart, and with it the isolation, the
  tab stop and the tooltip.
- **A list tile's `rows`, `columns` and `next_cursor` come from `computeTiles`.** On a list tile that answered, `rows`
  are its first `LIST_TILE_ROWS` (25) records as `POST /entities/{entity_id}/records/query` returns them (`id`,
  `entity_id`, `body` and `ref_labels`, with `file_labels`, `file_details`, `file_counts` and `mentions` when the response has them), and
  `columns` are the view's columns the person may read, in the view's order, each `{ key, label }` with the field's
  `label`. A column the person may not read is left out, never named. Pass `rows` and `columns` as they are, with
  `fields`: the tile draws an option as a badge in its colour, a boolean as a mark, a number bar, a reference as a chip, a
  file as its first file's chip with `+N`, and a mention as a chip that is not a link, and it needs the entity's fields to
  know which is which. A list tile with `rows` or `columns` unset shows `Loading…`; an empty `rows` is an answer (`No
  records match this view.`), not a wait. On an AgentFlow older than these members the tile comes back `failed`
  (`LIST_ROWS_UNSUPPORTED`, status 501) rather than load for good.
  ```ts
  const spec = { kind: 'list', entity: 'deal', view: 'open' } as const;
  const r = await computeTiles(host.api, { open: spec });
  Object.assign(tile, { spec, result: r.open, fields: entity.fields, rows: r.open.rows, columns: r.open.columns, drill: true });
  tile.addEventListener('af-open-record', (e) => openRecord((e as CustomEvent<AfOpenRecordDetail>).detail));
  ```
  A row sends `af-open-record` `{ record, entity, newTab }` only with `drill`, from a click on the row or Enter or Space on
  the button in its first cell, and a row with no `id` or `entity_id` is text. Open the record yourself with those two
  ids, in a new tab when `newTab` is true (the person middle-clicked, or clicked with Ctrl, Meta or Shift held).
- **Page a list tile with `paging` and `af-page`; the tile reads no cursor and fetches nothing.** Without `paging` the
  tile shows the rows it is given and has no pager, so say on the screen when there are more. Set `paging` as a
  property, `{ prev, next, busy }`, and the tile draws Previous and Next under the table. A press sends `af-page` with
  `detail.direction` `'prev'` or `'next'`; read that page, then set new `rows` and `paging`. `next_cursor` is the cursor
  to ask the second page with, and `{ ...listTileQuery(result.list), limit, cursor }` is the query, the view's filter
  before the page's, which every page of one list must send (a cursor is bound to the filter it came with). Set `busy`
  while a page is being read; Previous and Next send nothing then, and nothing when their direction has no page.
  ```ts
  import { computeTiles, listTileQuery, LIST_TILE_ROWS, ok, type AppHost, type components } from '@reflexify/agentflow-sdk';
  import type { AfListRow, AfPageDetail } from '@reflexify/agentflow-elements/kit';

  type Page = components['schemas']['EntityRecordPage'];
  type Entity = components['schemas']['EntityDefinition'];
  type TileElement = HTMLElement & Record<string, unknown>;

  // `tile` is an `af-tile` already on the page, and `entity` the deal entity from `GET /entities/{entity_id}`, read
  // once as `mountTiles` above reads it.
  async function mountOpenDeals(host: Pick<AppHost, 'api'>, tile: TileElement, entity: Entity) {
    const spec = { kind: 'list', entity: 'deal', view: 'open' } as const;
    const r = await computeTiles(host.api, { open: spec });
    const list = r.open.list;
    Object.assign(tile, { spec, result: r.open, fields: entity.fields, columns: r.open.columns, drill: true });
    if (r.open.outcome !== 'ok' || !list || !r.open.rows) return;
    // The pages read so far, so Previous steps back through them and asks for nothing.
    const pages: { rows: AfListRow[]; next: string | null }[] = [{ rows: r.open.rows, next: r.open.next_cursor ?? null }];
    let at = 0;
    const show = (busy = false) => Object.assign(tile, { rows: pages[at]!.rows, paging: { prev: at > 0, next: pages[at]!.next !== null, busy } });
    show();
    tile.addEventListener('af-page', async (e) => {
      if ((e as CustomEvent<AfPageDetail>).detail.direction === 'prev') {
        at -= 1;
        return show();
      }
      if (pages[at + 1]) {
        at += 1;
        return show();
      }
      show(true);
      // A failed read rejects here, unhandled, and the `finally` puts the pager back on the page being shown.
      try {
        const page: Page = await ok(host.api.POST('/entities/{entity_id}/records/query', {
          params: { path: { entity_id: list.entity_id } },
          body: { ...listTileQuery(list), limit: LIST_TILE_ROWS, cursor: pages[at]!.next },
        }));
        pages.push({ rows: page.items, next: page.next_cursor });
        at += 1;
      } finally {
        show();
      }
    });
  }
  ```
  A list whose filter your own control changes starts again from the first page: call `computeTiles` again and reset
  `pages`, since a cursor read under the old filter is refused under the new one.
- **`drill` is off until the module sets it.** Set it only where the module handles `af-drill`, so that no mark is
  offered as something to open when it opens nothing. A drill is a population, not a record. `detail.drill` is the
  same address as a bucket's `drill`, an `EntityRecordFilters`, so the module opens its own list or side panel and
  reads the records with it: send it as the `filter` of `POST /entities/{entity_id}/records/query` ("The query",
  above), or of `POST /entities/{entity_id}/records/count` for a number. `detail.count` is how many to expect, `detail.label` names what was
  pressed (`<bucket> · <segment>` for a segment of a stack), and `detail.bucket` and `detail.segment` are the keys of
  the bucket and the segment, `null` for a number. AgentFlow's own record browser is not a page a module can link to.
  A mark whose records the server could not name has no address, and sends nothing.
- **What it draws** is a number, a bar, column, line, pie or donut chart, a chart with a derived figure
  (`transform.derive`: a share, a running total, a rank or a formula), a chart whose measures are in more than one unit
  (one panel for each unit), the verdict line under a chart, a text tile (its Markdown, with raw HTML shown as text)
  and a list tile. A chart type, a derive kind or a tile kind it does not know shows `This tile cannot be drawn here
  yet` and no picture. Draw those from the result yourself, or leave them out. A pie shows no label on a slice: its
  legend gives each slice's name, value and share.
- **`af-tile` is in kit versions that ship it.** The first copy of a tag on the page wins (rule 11 of the design
  guide), so test `customElements.get('af-tile')` after importing the kit, and draw the figure yourself where it is
  missing.

## Writing records, and doing work

All through `host.api`, as the signed-in person; each refusal is AgentFlow's own and comes back as an
`AgentFlowError` (below). The SDK sends an `Idempotency-Key` for you.

| To | Call | Notes |
|---|---|---|
| create | `POST /entities/{entity_id}/records`, body `{ form_payload: { … } }` | only the keys the entity's create form binds are kept, and the others are dropped without an error (the `201` does not name them): bind every field the module sets, and read the record back when a value matters (`http-cases-api.ts` in the starter). On an entity filed in units, `unit_id` beside `form_payload` names the unit (a `directory.units` pick): left out, the record goes to the caller's primary unit (422 `UNIT_REQUIRED` when they have none); `null` is 422 `UNIT_NULL_REFUSED`; a named unit must be active (`UNIT_ARCHIVED`) and one the caller's create grant covers (`UNIT_DESTINATION_DENIED`), and a caller whose only create grant is on their own records files in their primary unit alone. A create grant that follows a parent files anywhere when the parent the record points to names the caller, and is 403 `ENTITY_ACCESS_DENIED` when it does not. The unit is never a key of `form_payload` |
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

A refused call is an `AgentFlowError`, and what a 403, 404, 409 or 422 means for the screen is in "Failures". Whether
the person may make a call is in "What the person may do": the record's own `capabilities`, and its `work` answers for
claiming, releasing and assigning.

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
- **So a File field the module fills is not `required`.** A create without its file would be refused. Where the
  file must be there, the package asks for it at the stage that needs it with a rule (authoring skill,
  `pitfalls.md`, "A UI module cannot create a record whose File field is `required`").
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

The UI that feeds `attach` is `af-file-upload`: it hands the module the files a person drops or picks, `attach` stores them
one at a time, and the module sets each row's status in the element's `items` as it goes (`kit-in-react.md`, "Files and
signatures"). Take the file back out of the field with a `PATCH` of the field without its id when `remove` arrives.

**Replacing or renaming a file.** To replace one, upload the new file and send the field's ids with the new one in
place of the old. No operation renames a stored file: its name is the one the upload gave it (the third argument of
`form.append`, `file.name` above). To rename, read its bytes (`GET /attachments/{attachment_id}/download`), upload
them again under the new name, and bind the new id in place of the old. Either way the file has a new id, and the
old one, bound to nothing, is removed later.

## Records from a folder

A workflow's file field can read a folder: a watched folder AgentFlow already indexes (an FTP or SFTP drop), or a folder on
the person's computer. A Group files step at depth 1 turns the folder into one item per first-level subfolder, a For Each
runs a body per item, and an Entity Record step in the body creates a record with that subfolder's files attached (the
authoring skill's `steps.md`, "Looping over files"; `examples/court-batches` is the package). The module never creates
those records and never holds a file of them: it gets the folder into AgentFlow and starts the run, and the server's bulk
queue does the rest, so a batch of a few thousand subfolders does not run in the browser.

`batchId` below is the id of the record the folder is for, here the batch the person is adding dossiers to. It is the run's
subject: the workflow reads `subject.record_id` and files each dossier with that batch. A workflow that is not about a record
leaves the subject out.

Why a folder is not a File field: an app's token uploads a file only into a record's File field or a comment
("A file into a File field", above), so it cannot upload into a start form's file field. A folder from the person's
computer goes into an **upload set** instead, a folder of stored files that only its creator can use, which the run then
reads. Pick the level by how much of the screen you want to own:

| Level | You write | Use it when |
|---|---|---|
| 1. `<agentflow-start-form entity record action>` | the element and a handler for `workflow-started` | the screen is the entity's record action, as AgentFlow's record page launches it |
| 2. `af-folder-source` and `start_instance` | the screen, the wrapper and one call | the screen has its own layout, or its own name and subject for the run |
| 3. The operations | everything, including the picker | the screen is not a kit screen (a standalone site's own page) |

### Level 1: the start form

```tsx
<agentflow-start-form entity="batch" record={batchId} action="add_dossiers" onworkflow-started={(e) => done(e.detail)} />
```

This tag is not in the kit: `import '@reflexify/agentflow-elements'` defines it, and it draws nothing without an
`<agentflow-provider>` above it whose `client` is `host.api`, set as a property **before the provider is appended**
(`task-pages.md`, "The wrapper and `consumeTask`", and `signing.md` show the setup). `entity` and `action` are package keys
(resolve them through `getAppObjects(host.api)`, never typed ids), and `record` is the record's id, here the batch's.

The element launches the entity's `add_dossiers` action on the batch exactly as AgentFlow's record page does: the
action's input map makes `record.id` the subject, the form asks for the params the map leaves open, and the server checks
the action's `visible_when`. A multi-file field that the workflow's input contract says takes a folder is drawn with
`af-folder-source`, so the person picks a watched folder or a folder from their computer and the form starts the run with
the chosen set. That holds whether or not the workflow's start step binds a form: a workflow that declares its input only
as an `inputSchema` (`start({ params: true })`) gets its folder fields from the contract, each labelled with the schema
property's `title`. Its other params are asked for only when the start step binds a form, because the contract carries no
field types; with nothing to ask the form shows a name and Start. The form also takes `subject-entity` and
`subject-record` for a workflow that is not a record action, and waits for an action whose `mode` is `sync`
(`workflow-started` then carries an `outcome`). The kit README, "Start form", has every attribute.

To resume an interrupted upload after a reload or a closed tab, the form takes a `resumeSets` property, an object keyed by the file field's
key whose value is the upload set's id (the id arrives as `af-folder-upload-started` `{ setId, field }`, which the form
fires from itself). On `workflow-started`, clear the id you stored and the field's `resumeSets` entry (set the property
to a new object without it): the run took that set, and a set launches once. The form does not offer a set a run it
started has taken, but a reload reads what you stored. Where to keep the id is the same as for level 2, below.

The form holds Start while a folder field is uploading or being checked, and while the launch of the chosen folder would
be refused; the folder source says why.

### Level 2: `af-folder-source` and `start_instance`

The element draws the three sources, uploads, lists and previews. It never fetches by itself: the page gives it
`sources`, made once with `folderSources(client)`, and what the person chose comes back as `af-folder-change`.

```tsx
import type { FolderChangeDetail, FolderUploadStartedDetail } from '@reflexify/agentflow-elements/jsx';
import { folderSources, getAppObjects, ok, type AppHost, type SlotFolder } from '@reflexify/agentflow-sdk';
import { useEffect, useMemo, useState } from 'react';
// `FolderSource` is the wrapper of `kit-in-react.md`, "Files and signatures".

// Kept in localStorage, so a closed tab resumes too; keyed by person, as a set is its creator's alone. Storage that
// throws (a blocked or private window) costs only the resume.
const remembered = {
  get: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* not kept */ } },
  drop: (key: string) => { try { localStorage.removeItem(key); } catch { /* nothing kept */ } },
};

export function AddDossiers(p: Common & { host: Pick<AppHost, 'api' | 'context'>; batchId: string; done(instanceId: string): void }) {
  // One object for the screen's lifetime: the element reads it once.
  const sources = useMemo(() => folderSources(p.host.api), [p.host.api]);
  const [target, setTarget] = useState<{ workflowId: string; folder: SlotFolder } | null>(null);
  const [chosen, setChosen] = useState<FolderChangeDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const resumeKey = `acme-court-batches:add-dossiers:${p.host.context.person.id}:${p.batchId}:files`;
  const [resumeSet] = useState(() => remembered.get(resumeKey));

  useEffect(() => {
    void (async () => {
      const objects = getAppObjects(p.host.api);
      await objects.load();
      const workflowId = objects.id('workflow:add_dossiers');
      if (!workflowId) return;
      const contract = await ok(p.host.api.GET('/workflows/{workflow_id}/input-contract', { params: { path: { workflow_id: workflowId } } }));
      const folder = contract.params_slots.find((slot) => slot.key === 'files')?.folder;
      if (folder) setTarget({ workflowId, folder });
    })();
  }, [p.host.api]);

  const start = async () => {
    if (!target || !chosen?.value || chosen.preview?.refusal) return;
    setBusy(true);
    try {
      const run = await ok(p.host.api.POST('/workflows/{workflow_id}/instances', {
        params: { path: { workflow_id: target.workflowId } },
        body: { name: 'Add dossiers', subject: { kind: 'record', record_id: p.batchId }, params: { files: chosen.value } },
      }));
      remembered.drop(resumeKey);
      p.done(run.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {target && (
        <FolderSource
          locale={p.locale}
          theme={p.theme}
          sources={sources}
          workflow={target.workflowId}
          field="files"
          folder={target.folder}
          resumeSet={resumeSet}
          onStarted={(detail: FolderUploadStartedDetail) => remembered.set(resumeKey, detail.setId)}
          onChange={(d: FolderChangeDetail) => {
            // A run already took that set: forget it, so the next pick starts a new one.
            if (d.preview?.refusal?.code === 'UPLOAD_SET_ALREADY_LAUNCHED') remembered.drop(resumeKey);
            setChosen(d);
          }}
        />
      )}
      <button type="button" disabled={busy || !chosen?.value || !!chosen.preview?.refusal} onClick={start}>Add</button>
    </>
  );
}
```

- **The workflow decides whether the field takes a folder.** Read the field's `folder` from `GET /workflows/{workflow_id}/input-contract`
  (`get_workflow_input_contract`): `{ grain: 'folder', depth }` is one unit per folder `depth` levels below the picked
  folder, `{ grain: 'file' }` one unit per file, and no `folder` means the field takes no folder, so draw no folder picker.
  Hand it to the element as `folder`. An installed app always starts the current published version, so it passes no
  `version_id` (an app token's request that names one is refused); `version` is for a page that launches a version it chose.
- **What comes back.** `af-folder-change` carries `{ value, preview }`: `value` is `{ $fileSet, path? }`, the object to put in
  the start form's file field, and `preview` is what the launch would take: the units, the files, how many are left out and
  why, and a `refusal` when the launch would not start. Lock the button on `value === null` and on `preview.refusal`, send
  `value` as it is, and never build the envelope yourself.
- **The files source** stores plain files in an upload set as one folder, `files/`, so a For Each over the field gets one
  item per file and a Group files step one group.
- **Resume across a reload or a closed tab.** `af-folder-upload-started` `{ setId }` fires as soon as an upload set exists,
  before any file is stored. Keep the id where the page finds it again and give it back as `resume-set`: `sessionStorage`
  lasts only while the tab is open, so keep it in `localStorage` for a closed tab, under a key that names the app, the
  person (a set is its creator's alone) and what the upload is for, as above. A kept id whose set is gone (deleted, or
  untouched past the deployment's cleanup, 7 days by default) makes the next pick start a new set. A set a run already
  took is refused `UPLOAD_SET_ALREADY_LAUNCHED`, which a closed tab or another tab's start leaves kept: when
  `af-folder-change`'s `preview.refusal.code` says so, drop the kept id and the `resume-set`. The person picks
  the same folder again and only the files the set lacks are uploaded; picking another folder deletes the old set and
  starts a new one, which fires `af-folder-upload-started` again, so overwrite what you kept. Clear it when the run starts.
- **An upload set launches once.** A run that took it marks it used, and a second start with the same set answers
  `UPLOAD_SET_ALREADY_LAUNCHED`; a second import is a new set. A set not yet complete answers `UPLOAD_SET_INCOMPLETE`: the
  preview says so first, so a button locked on `preview.refusal` never sends it. A watched folder feeds as many runs as it
  is launched with.
- **An error the element could not recover from** is also an event, `af-folder-error`, with `{ during, status, code, message }`
  (`during` is `upload`, `preview` or `list`; `status` and `code` are the server's, `null` when none answered, and `message`
  is its own sentence, in English). The element says a refusal in its own words and the page's language: its own for
  the codes it knows, such as `FILE_SET_NO_READY_GROUPS`, and one sentence for any other. A refusal (a 4xx other than
  408 and 429) is shown with no Try again, because asking again gets the same answer, and an upload set the element announced
  is deleted; a set named only by `resume-set` is not deleted, and is not offered again. Use the event for what the element
  does not draw, such as your own message or a log.
- **A person holds at most five unfinished upload sets.** At five, `create_upload_set` deletes the one that has gone longest
  without a file, when that is at least an hour and no run reads it, and makes the new set; when all five were written
  within the hour it is refused (`VALIDATION_ERROR`). So a set left by a closed tab stops counting after an hour, and
  nothing lists a person's sets for a module to delete. The element and `folderSources` delete a set they abandon (a
  cancelled upload, a mismatched resume); a module that drops the id some other way, such as a screen that closes
  mid-upload, calls `sources.deleteSet(setId)` itself while it still has the id.
- **`uploadFolder` leaves out the files an operating system keeps in a folder for itself**: `.DS_Store`, `Thumbs.db` and
  `desktop.ini`, in any case and at any depth, so none lands in a dossier.

### Level 3: the operations

`folderSources(client)` wraps eight operations, all open to an installed app's token and all acting as the signed-in person
(a service principal is refused `USER_IDENTITY_REQUIRED` on the upload operations). A watched folder the person may not
use answers 404, never 403, and using a folder never confers starting the workflow: the person needs its start grant too.

| Operation | Call | `folderSources` |
|---|---|---|
| `list_watched_folders` | `GET /watched-folders`: the folders the person may use, at most 200 | `watched()` |
| `list_watched_subfolders` | `GET /watched-folders/{file_set_id}/subfolders?path=`: the folders inside one, in name order, a page at a time, with file counts | `subfolders(setId, path?, cursor?)` |
| `create_upload_set` | `POST /upload-sets`, body `{ name, files: [{ path, byte_size }] }`: declares every file up front; answers the set and the `refused` files (`FILE_TOO_LARGE`) it will never hold | inside `uploadFolder`, `uploadFiles` |
| `upload_to_upload_set` | `POST /upload-sets/{file_set_id}/files`, multipart: a `path` part, then the `file` part | the same |
| `list_upload_set_files` | `GET /upload-sets/{file_set_id}/files`: the declared files in path order, each with whether it is stored | resume |
| `complete_upload_set` | `POST /upload-sets/{file_set_id}/complete`: refused (409) while a declared file is not stored | the end of an upload |
| `delete_upload_set` | `DELETE /upload-sets/{file_set_id}`: deletes the set and its stored files; refused (409 `FILE_SET_IN_USE`) while a run that has not finished reads it | `deleteSet(setId)` |
| `preview_folder_launch` | `POST /workflows/{workflow_id}/folder-preview`, body `{ field, file_set_id, path? }` | `preview(workflowId, field, value)` |

- **Declare, upload, complete, then start.** Nothing launches until the set is complete. The path is sent before the file,
  and a path the set did not declare, or a file of another size, is refused. Uploading a stored path again changes nothing,
  so an upload whose answer was lost can be sent again. Paths are relative to the picked folder and never start with its
  own name, so the folders directly inside it are the first level.
- **The preview is the launch's own rule.** It counts what the launch would take and what it would leave out, with each
  reason (`NOT_IN_A_FOLDER`, a folder over 500 files, a folder outside the field's `minItems` or `maxItems`), and carries the
  refusal the launch would answer. A later launch can differ for a watched folder, which keeps changing.
- **`uploadFolder(files, opts)` takes what `<input webkitdirectory>` selects or what a drop holds**
  (`DataTransferItem.webkitGetAsEntry()` entries), and rebuilds each path itself; never use a library's directory paths, which
  lose a slash. `uploadFiles(files, opts)` stores plain files under `files/`, numbering a repeated name
  (`scan.pdf`, `scan (2).pdf`). Both take `{ name, resumeSetId?, onSetCreated?, onProgress?, signal? }` and answer
  `{ value, refused }`; aborting the `signal` deletes a set this call created.
- **The value is `fileSetEnvelope(setId, path?)`**, `{ $fileSet, path? }`: put it in `params` under the file field's key.
  `path` names one folder inside a watched folder, so a standing drop with a folder per batch can be used one batch at a time.
- **A path is never a URL segment**: `path` is a query parameter or a body member, so a module writing its own calls keeps it
  out of the URL.

## A file a workflow made

A document a Document step renders, an image an Image step makes and a signed PDF are the run's own files, and an
installed app's token is told nothing of them (`404`), whichever workflow made them. To show one in a module, have
the workflow keep it on a record: an `update` step binds the step's `generated_files` to a `file` field (the
authoring skill's `steps.md`, "A document step and its template"). The step writes a copy the record owns, and the
module reads the copy as any file of that record ("One record", above): the field's ids, with each file's name and
details beside them on the record read, and a `null` uploader, since a workflow made it.

- **A copy made from a field the app may not read stays out of reach.** It keeps what it was rendered from, so where
  the ceiling hides one of those fields the app is told nothing of the copy (`404`), as it is told nothing of the field.
- **Inside AgentFlow the module calls as the person**, who reads the copy as any file of a record they may read.
- **The copy is in the field once the `update` step has run**, not when `start_instance` answers: follow the run
  ("A record's runs, and what a run did", above) or read the record again.

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
- **Picking one.** The SDK's `directory` makes the sources, each paged with `cursor`, searched with `q` and carrying a
  `resolve`: `directory.people(client)` into `af-person-picker`'s `source`, `directory.units(client)` into `af-tree-picker`'s
  and `directory.groups(client, { members })` into `af-combobox`'s, each made once (`kit-in-react.md`, "Pickers"). A
  short, fixed list needs no source: `af-person-picker`'s `people` are `{ id, name, email? }` made from `GET /users` (or a
  group's `members`), its `value` the id (an array with `multiple`), and a short set of units or groups can be an `af-select`
  with each `id` as `value` and `name` as `label`. Through an app's token the lists answer only for the entities and fields
  the package lists, as above, and `directory.groups` rejects, since `GET /groups` is refused.
- **The person's own units.** `directory.myUnits(client)` (`GET /me/units`) returns `{ id, name, code, primary }[]`: the units the person is placed in, archived ones left out, the primary first. Use it for a header that names the person's court or office. `name` and `code` are `null`, and never an error, while the package does not list them of the `org_unit` entity (`requires.entities`), so draw the name only when it is there; the list is empty for a person placed nowhere.
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

## What the person may do

An admin can change who may create, change or delete in an installed app, and which fields are secured, long after
the package was written. AgentFlow judges every write against the result, so a screen draws its controls from
AgentFlow's answer for the signed-in person. **Never draw a control from group membership, a role name or the
package's default grants.** A module that shows "New project" to the members of one group is wrong the day an admin
lets another group create, and wrong the other way when an admin takes create away.

`GET /entities/{entity_id}` (the id is `getAppObjects(host.api).id('entity:<key>')`) answers the entity's
definition, typed `components['schemas']['EntityDefinition']`, with two members that are about the person who is
signed in:

```json
{
  "effective_capabilities": {
    "read": true, "list": true, "write": true, "delete": false, "design": false,
    "create": true, "create_via_parent": false, "update": true, "assign": false
  },
  "field_access": { "budget": { "read": true, "create": false, "update": false } }
}
```

- **`effective_capabilities`** is what the person may do with the entity's records as a whole. `read` is opening a
  record and `list` is browsing them. `delete` is deleting. `design` is changing the entity itself, which a module
  seldom offers. Leave the control out when the flag is false, as AgentFlow's record page draws no Delete without
  `delete` (locked, not hidden, is for what one record refuses now: below). `write` is one answer for create and change
  together: it is true when the person may do either, so it cannot tell a screen that may create from one that may
  only edit, and it stays as it was for the modules that read it.
- **`create`, `create_via_parent`, `update` and `assign`** say what `write` cannot.
  - `create` is true when the person may create a record that names no parent. It decides a button that is not
    inside anything, such as "New project".
  - `create_via_parent` is true when some grant lets them create a record only under a parent record that names
    them, such as a task under a project they belong to. It does not draw a top-level button, and it does not say
    which parents: that is the parent record's own `capabilities.create` (below).
  - Both create answers already count what refuses every create of the entity: no create form, an archived entity,
    a built-in one, the Workflow task entity, and an entity whose records a connected system owns. Each is false
    there, whatever the person's grants.
  - `update` and `assign` say the person holds the operation on some records. They are hints, enough to decide
    whether a column of edit or assign controls is worth drawing at all: each record's own `capabilities` decides
    for that record.
  - **An AgentFlow from before these members leaves them out.** Test `'create' in effective_capabilities` before
    relying on any of the four (the generated type lists them as always present, but the test is about the server),
    and keep the module's own check where the member is missing. The same test tells whether `include_capabilities`
    is safe to send on a GET, below.
- **`field_access`** is by field key, `{ read, create, update }`: may the person see the field's value, set it when
  creating a record, and change it afterwards. Hide the column or the value where `read` is false, leave the field
  out of the create form where `create` is false, and show it read only in the edit form where `update` is false.
  It lists the fields that are secured, and the person has every level on a field it does not list. A call made
  with the app's own token on the app's own site lists every field the app may read instead, and a field it may not
  read is not in the entity at all.
- **Build a query from the fields the person can read.** A filter or sort that names a field where `read` is false is
  refused (`ENTITY_SENSITIVE_FILTER_DENIED`, 403), and a board or a list built on that field fails to load for them.
  Mark each field your module filters or sorts on `queriedByApp: true` in the package, so an admin is warned before
  securing it (`entities.md` of the authoring skill).
- **The app's ceiling is already in both.** Called with the app's token, each is the person's answer within what the
  app is approved for.

**These answers are advice.** They are taken when the screen asks, without a lock, and AgentFlow judges every write
again. A true flag means the control is worth offering, not that the write will succeed: the record may lie outside
the person's reach, a rule on the entity may refuse it, a status move may not be theirs to make, or a secured field
in the body may not be theirs to set.

**What the person may do with one record: `include_capabilities`.** The entity's answer cannot say whether the person
may change this record, assign it or make this status move. Ask the records. `GET /entities/{entity_id}/records` and
`GET /entities/{entity_id}/records/{record_id}` take the query parameter `include_capabilities=true`, and
`POST /entities/{entity_id}/records/query` takes `include_capabilities: true` in its body. Each record then carries
`capabilities`, typed `components['schemas']['RecordCapabilities']`. A task a manager reads, in a project they manage:

```json
{
  "id": "a6f1107c-…",
  "entity_id": "a469b507-…",
  "body": { "title": "manager", "status": "todo", "project": "5368bc95-…", "work_state": "active", "claimed_by": null, "…": "…" },
  "capabilities": {
    "update": true,
    "delete": true,
    "create": [],
    "work": { "can_claim": true, "can_release": false, "can_reassign": true, "can_assign": true, "can_unassign": true, "can_move": true },
    "rules": { "transitions": [ { "to": "doing", "allowed": true } ], "fields": [] }
  },
  "updated_at": "2026-11-05T00:46:29.181578Z",
  "version": 1
}
```

and the project the task belongs to, read by the same person:

```json
"capabilities": {
  "update": true,
  "delete": true,
  "create": [ { "entity_id": "a469b507-…", "reference": "project", "allowed": true } ]
}
```

- **It is off by default, and it is not a filter.** Without it no record has the member, and the same records come
  back with it. It is not part of the cursor, so a module may turn it on for the next page of a list it is already
  reading. AgentFlow reads a fixed number of things for a page, whatever the page's size (200 records at most), so
  ask for it on the page the screen draws and never record by record.
- **`update` and `delete`** are whether the person may change, or delete, this record.
- **`create`** has one entry for each single reference field, of any entity the person may open, that points at this
  record's entity: `{ entity_id, reference, allowed }`, and `allowed` is whether the person may create a record of
  that entity with that field set to this record. It is the answer to "may I add a task to this project", and it is
  the answer for the field named: a task that refers to its project through two fields has two entries. An entity
  that refers to itself (a folder in a folder) has entries for its own records. An entity the person may not open and
  a field they may not read are left out, so draw the control only for an entry that is there and allowed:
  `capabilities.create.some((c) => c.entity_id === taskId && c.reference === 'project' && c.allowed)`.
- **`work`** answers the record's work: `can_claim`, `can_release`, `can_reassign`, `can_assign`, `can_unassign` and
  `can_move`. It is there for a person, on an entity that follows Assignable, when the record has work (a record
  that has not reached a status that starts work has none). While the work is over, every flag but `can_move` is
  false.
- **`rules`** is there when the entity has a stage model or rules, and there is something to say: `transitions` is
  each move out of the record's current status, `{ to, allowed, reason? }`, and `fields` is each field the person may
  edit that a rule refuses to let them change, `{ field, rule_id, message }`. A `reason` is `{ kind: 'rule', rule_id,
  message }` (show the rule's own `message`), `{ kind: 'movers' }` (the move belongs to others; there is no list of
  who) or `{ kind: 'engine_only' }` (only a workflow makes it). Only what certainly refuses is listed, so a field
  that is not in `fields` is not known to be refused, and AgentFlow still judges the save. `rules` is left out when
  no move leaves the status and no field is refused.
- **Draw the moves when the person may write the record, and none when they may not.** Draw each entry of
  `rules.transitions`: one with `allowed` live, one without it locked (`aria-disabled`) with its `reason` as the
  tooltip, as AgentFlow's move control keeps a refused move in place. A status the stage model has no move to from
  here is not in the list and is never drawn. `allowed` says only that
  the stage model and the rules do not refuse the move. Whether the person may write is `work.can_move` when the
  record has `work`, and `update` when it has not (an entity that is not Assignable, or a record that has no work).
  `can_move` answers for the status `PATCH`, the call a module makes in every host, so it carries no exception for
  the work's holder: a holder who may not update the record has `can_move: false`, and the `PATCH` is refused for
  them. It also needs the person to read and change the status field.
- **With no `work`, check the status field yourself.** `work.can_move` includes the person's `read` and `update`
  levels on the status field, but `update` does not, so in the `update` branch also require both in the status
  field's `field_access` entry (on the entity read, above). A person has every level on a field that is not listed;
  called with the app's token, a field that is not listed is one the app may not read, so draw no move for it.

```ts
import type { components } from '@reflexify/agentflow-sdk';

type Caps = components['schemas']['RecordCapabilities'];
type Move = components['schemas']['RecordTransitionVerdict'];

/** The moves to draw on this record, as AgentFlow answered for it: live where `allowed`, locked with `reason` where not,
 *  and none for a person who may not write it. `status` is the status field's `field_access` entry. */
function movesOf(caps: Caps | null | undefined, status?: { read: boolean; update: boolean }): Move[] {
  if (!caps) return [];
  const mayWrite = caps.work ? caps.work.can_move : caps.update && (status?.read ?? true) && (status?.update ?? true);
  return mayWrite ? (caps.rules?.transitions ?? []) : [];
}

/** Whether to draw "Add task" on a project, from the project's own answer. */
function mayAddTask(caps: Caps | null | undefined, taskEntityId: string): boolean {
  return caps?.create.some((c) => c.entity_id === taskEntityId && c.reference === 'project' && c.allowed) ?? false;
}
```

**What an answer means.** Each answer is "would this write pass, as far as AgentFlow can know without the values you
would send". It counts what refuses every write:
- an archived entity (`update` is false, and so is any `create` entry for an archived child kind; a record of an
  archived entity can still have an allowed `create` entry for a child kind that is not archived; `delete` follows the
  delete, which ignores archive);
- an entity whose records a connected system owns (`update` and `delete` are false, and so is a `create` entry for a
  child of that kind);
- a built-in entity (`update` is false, and so is a `create` entry for a child of that kind);
- a child with no create form, or whose create form does not write the reference, and a reference field the person
  may not set when creating (the `create` entry is false).

The entity's own `create` and `create_via_parent` count the same: false on an archived, built-in or connected-system
entity, on the Workflow task entity and on one with no create form. Its `update` and `assign` stay hints, and the
record's answer decides.

It does not count what depends on the values or on other records. Required fields, the values a rule judges on an
edit (those are `rules.fields`) and a delete blocked because other records refer to the record (`record_in_use`) are
still refused by the write, so show that refusal when it comes.

**Through the app's token the answers are the app's.** On the app's own site each is narrowed by what the app is
approved for, as the write is. On an entity the app only borrows there is no `delete`, and the person cannot assign
others (`can_assign` and `can_unassign` are false, and `can_release` and `can_reassign` are true only for work they
hold themselves). A field the app may not read is not in `rules.fields`. Inside AgentFlow the module calls as the
person, and the answers are the person's own. The same code works in both.

**Records of the Workflow task entity have `capabilities: null`** when asked, because what a person may do with a
task a workflow made depends on its workflow. Treat `null` as "no answer", and use the task's own calls (claim, release
and the step, in "Writing records, and doing work").

**An AgentFlow from before these answers refuses `include_capabilities` on the two GETs.** Its query-parameter check
answers `400 UNKNOWN_QUERY_PARAMETER` for `GET /entities/{entity_id}/records?include_capabilities=true` and for the one
record, and it ignores the body member of `POST /entities/{entity_id}/records/query`, so that page comes back without
`capabilities`. The entity's four new members arrive in the same release, so test `'create' in effective_capabilities`
on the entity read the module already makes before sending the parameter on a GET, or ask through the `POST`. Where
`capabilities` is missing, keep the module's own fallback.

**After a refused write (403, 404, 409 or 422), read the record again with `include_capabilities`** before showing
anything else, and redraw from what you read: the current values and status, the controls its `capabilities` allow,
and for a 404 whether the record can still be reached. After a 403, read the entity again too, so the controls follow
the access as it is now and the person is not offered the same refused action twice.

## Failures

A refused call is an `AgentFlowError`, with the response's `status`, its stable `code` (the response's `type`), a
`detail`, `fieldErrors` and `requestId`. **Branch on `error.code` for the refusals the module handles, and show the
module's own sentence for each.** Show `error.detail` only as the fallback for a code the module does not handle,
with its leading `CODE:` stripped, or the first of `error.fieldErrors`, as `toCasesError` in the starter does.
Never show a raw code to a person.

| `code` | Status | The person was refused because | The module |
|---|---|---|---|
| `ENTITY_RECORD_NOT_FOUND` | 404 | the record does not exist, or they cannot reach it for what they asked, reading or changing it | says it does not exist or cannot be reached, and drops the record from the screen |
| `ENTITY_ACCESS_DENIED`, `APP_CEILING_DENIED` | 403 | no grant, or the app's approval, allows the operation | reads the entity again and redraws without the control |
| `ENTITY_SENSITIVE_WRITE_DENIED` | 403 | the write set a secured field they may not set; `fieldErrors` names each by `path` | shows those fields read only |
| `ENTITY_SENSITIVE_FILTER_DENIED` | 403 | a filter or sort named a field they may not read | drops it from the query |
| `STALE_VERSION` | 409 | the record changed since it was read | shows the record as it is now |
| `STAGE_TRANSITION_NOT_ALLOWED` | 422 | they may not make that status move | reads the record again and shows its current status |
| `ENTITY_VALIDATION_RULE_FAILED` | 422 | a rule on the entity refused the write | shows the rule's own message from `detail`, without the leading code |

**A missing record and one the person cannot reach are one answer on purpose.** The module cannot tell them apart,
so it never says "deleted" or "you have no permission". AgentFlow words that 404 as "This record doesn't exist, or
you can't reach it." on the routes that raise it in the usual way. A few routes word it differently (presence, a
record's comments and mentions among them), and an older AgentFlow put the record's id in it ("not found:
entity_record" and the id). So branch on `code`, and show the module's own sentence. A 404 with another
`code` on an entity means the person may not see it, or it does not exist, which is again one answer.

```ts
import { AgentFlowError } from '@reflexify/agentflow-sdk';

/** What the person reads: the module's own sentence for the refusals it handles, AgentFlow's as the fallback. */
function whatToSay(error: unknown): string {
  if (!(error instanceof AgentFlowError)) return 'AgentFlow could not be reached. Try again.';
  switch (error.code) {
    case 'ENTITY_RECORD_NOT_FOUND':
      return 'This case does not exist, or you cannot reach it.';
    case 'STALE_VERSION':
      return 'Someone changed this case. The latest version is shown.';
    case 'ENTITY_ACCESS_DENIED':
    case 'APP_CEILING_DENIED':
      return 'You cannot do that here.';
  }
  const field = (error.fieldErrors?.[0] as { message?: unknown } | undefined)?.message;
  const said = typeof field === 'string' ? field : error.detail;
  return said?.replace(/^[A-Z][A-Z0-9_]+:\s*/, '') ?? 'That did not work. Try again.';
}
```

A person with no access to the entity gets an empty or refused answer: the module shows its empty or error state,
never a crash.
