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

async function dueSoon(host: Pick<AppHost, 'api'>, entity_id: string, from: string, to: string): Promise<Wire[]> {
  const items: Wire[] = [];
  let cursor: string | null = null;
  do {
    const page = await ok(host.api.POST('/entities/{entity_id}/records/query', {
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
- `filter.q` is a free-text search.
- `sort` is a sortable field's key (`ref.field` for one hop, or `created_at`, `updated_at`), `dir` is `asc` or
  `desc`. `limit` is 1 to 200; `next_cursor` is `null` on the last page.
- `view_id` (the id of one of the entity's views, other than a `detail` view) cuts each record to the view's
  `columns` and sends smaller pages. Leave it out unless you want that; with it, a field the view does not list is
  not in `body` or in `ref_labels`.
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

## Writing records, and doing work

All through `host.api`, as the signed-in person; each refusal is AgentFlow's own and comes back as an
`AgentFlowError` (below). The SDK sends an `Idempotency-Key` for you.

| To | Call | Notes |
|---|---|---|
| create | `POST /entities/{entity_id}/records`, body `{ form_payload: { … } }` | only the keys the entity's create form binds are kept (`http-cases-api.ts` in the starter) |
| change fields | `PATCH /entities/{entity_id}/records/{record_id}`, body `{ changes: { field: value }, expected_updated_at }` | `changes` is by field key; `null` clears a field; `expected_updated_at` is the record's `updated_at` as you last read it, and a stale one is 409 `STALE_VERSION` (read the record again) |
| move a status | the same `PATCH`, `changes: { status: 'approved' }` | 422 `STAGE_TRANSITION_NOT_ALLOWED` when the person is not a mover of that move; 422 `ENTITY_VALIDATION_RULE_FAILED` when a rule refuses it (the message is the rule's own) |
| delete | `DELETE /entities/{entity_id}/records/{record_id}?expected_updated_at=…` | |
| take a task | `POST /entities/{entity_id}/records/{record_id}/work/claim` | for a task offered to a group; `entity_id` is the line's `entity_id` and `record_id` is its `id`, as `GET /work?view=claimable` lists them |
| read a task | `GET /entities/{entity_id}/records/{record_id}/step` | the step's panel, with its `actions` (each an `id` and a `label`) |
| finish a task | `POST /entities/{entity_id}/records/{record_id}/step/submit`, body `{ payload: { _action: '<action id>' } }` | only the person who claimed it: `WORK_NOT_CLAIMANT` (403) otherwise; `HUMAN_ACTION_REQUIRED` or `HUMAN_ACTION_UNKNOWN` (400) for a missing or wrong action |
| start a workflow | `POST /workflows/{workflow_id}/instances`, body `{ name: '<a name for this run>', params: { …the run's input, as the workflow's inputSchema names it } }`, or `{ name, subject: { kind: 'record', record_id } }` for a workflow that starts on a record | `workflow_id` is `getAppObjects(host.api).id('workflow:<key>')` after `load()`; the person needs a start grant |

A 403 or 404 on any of these means the person has no grant for it: show the screen as read only for them rather
than a failure.

## Failures

A refused call is an `AgentFlowError`: show `error.detail` with its leading `CODE:` stripped, or the first of
`error.fieldErrors`, as `toCasesError` in the starter does. `404` on the entity or a record means the person may
not read it; `403` means no grant allows the operation. A person with no access to the entity gets an empty or
refused answer: the module shows its empty or error state, never a crash.
