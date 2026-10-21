<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      entityId: { attribute: 'entity-id', type: 'String' },
      columns: { attribute: 'columns', type: 'String' },
      pageSize: { attribute: 'page-size', type: 'Number' },
      // filter is property-only; see ../props.ts.
    },
  }}
/>

<script lang="ts">
  import { ok } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import FieldList from '../FieldList.svelte';
  import type { Problem } from '../errors.js';
  import { formatCell } from '../format.js';
  import { blockingFields, errorsByField, fieldsOf, initialValues, missingRequired, toPayload, type FieldSpec } from '../form.js';
  import { objectProp, pageSizeProp } from '../props.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { entityId, columns, pageSize, filter }: { entityId?: string | null; columns?: string | null; pageSize?: number | null; filter?: unknown } =
    $props();

  type EntityField = { key: string; label: string; system: boolean };
  type Entity = { fields: EntityField[]; effective_capabilities?: { write?: boolean } };
  type RecordRow = { id: string; body: Record<string, unknown> };
  type Page = { items: RecordRow[]; next_cursor: string | null };

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');
  const activeFilter = $derived(objectProp<object>(filter, 'filter'));
  // Compared by value: a React parent writing `filter={{…}}` hands over a new object on every
  // render, and each one must not send another query.
  const filterKey = $derived(activeFilter ? JSON.stringify(activeFilter) : '');
  const limit = $derived(pageSizeProp(pageSize));

  let entity = $state<Entity | null>(null);
  let rows = $state<RecordRow[]>([]);
  let next = $state<string | null>(null);
  let q = $state('');
  let loaded = $state(false);
  let loading = $state(false);
  let failure = $state<Problem | null>(null);
  let createFields = $state<FieldSpec[] | null>(null);
  let creating = $state(false);
  let saving = $state(false);
  let values = $state<Record<string, unknown>>({});
  let fieldErrors = $state<Record<string, string>>({});

  const blocked = $derived(blockingFields(createFields ?? []));

  const shown = $derived.by(() => {
    if (!entity) return [] as EntityField[];
    const wanted = columns?.split(',').map((c) => c.trim()).filter(Boolean);
    if (wanted?.length) return wanted.map((k) => entity!.fields.find((f) => f.key === k)).filter((f): f is EntityField => !!f);
    return entity.fields.filter((f) => !f.system).slice(0, 5);
  });

  const emit = (type: string, detail: unknown) =>
    self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

  // Bumped whenever the host points the element at another entity. Each request captures it,
  // and an answer that lands after it moved is about an entity that is no longer shown.
  let generation = 0;
  // Only the latest list load may touch the rows: a page still in flight when the search or
  // filter changes answers a question nobody is asking any more.
  let latest = 0;

  async function loadEntity(id: string) {
    const ctx = af.current;
    if (!ctx) return;
    const at = generation;
    let loadedEntity: Entity;
    try {
      loadedEntity = (await ok(ctx.client.GET('/entities/{entity_id}', { params: { path: { entity_id: id } } }))) as Entity;
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation) failure = problem;
      return;
    }
    if (at !== generation) return;
    entity = loadedEntity;
    if (!loadedEntity.effective_capabilities?.write) return;
    try {
      const form = (await ok(ctx.client.GET('/entities/{entity_id}/create-form', { params: { path: { entity_id: id } } }))) as {
        schema_json: unknown;
        ui_schema_json?: unknown;
      };
      if (at === generation) createFields = fieldsOf(form.schema_json, form.ui_schema_json);
    } catch (error) {
      // No create form (404), or no right to it (403): the button stays hidden, and nothing else is wrong.
      const status = (error as { status?: unknown } | null)?.status;
      if (status === 403 || status === 404) return;
      const problem = ctx.report(error);
      if (at === generation) failure = problem;
    }
  }

  async function loadRows(cursor?: string) {
    const ctx = af.current;
    const id = entityId;
    if (!ctx || !id || !entity) return;
    const call = ++latest;
    loading = true;
    failure = null;
    // A reload starts over: the old cursor walks the old search or filter, and old rows left
    // behind by a failed reload would read as the new one's answer.
    if (!cursor) next = null;
    try {
      const path = { entity_id: id };
      const page = (
        activeFilter
          ? await ok(ctx.client.POST('/entities/{entity_id}/records/query', { params: { path }, body: { filter: activeFilter, limit, cursor } as never }))
          : await ok(ctx.client.GET('/entities/{entity_id}/records', { params: { path, query: { limit, cursor, q: q || undefined } as never } }))
      ) as Page;
      if (call !== latest) return;
      rows = cursor ? [...rows, ...page.items] : page.items;
      next = page.next_cursor;
      loaded = true;
    } catch (error) {
      const problem = ctx.report(error);
      if (call === latest) {
        failure = problem;
        if (!cursor) rows = [];
      }
    } finally {
      if (call === latest) loading = false;
    }
  }

  function openCreate() {
    values = initialValues(createFields ?? [], {});
    fieldErrors = {};
    creating = true;
  }

  async function save() {
    const ctx = af.current;
    const id = entityId;
    if (!ctx || !id || !createFields || saving || blocked.length > 0) return;
    const missing = missingRequired(createFields, values);
    if (missing.length > 0) {
      fieldErrors = Object.fromEntries(missing.map((k) => [k, ctx.t('form.required')]));
      return;
    }
    const at = generation;
    saving = true;
    failure = null;
    fieldErrors = {};
    let created: RecordRow;
    try {
      created = (await ok(
        ctx.client.POST('/entities/{entity_id}/records', {
          params: { path: { entity_id: id } },
          body: { form_payload: toPayload(createFields, values) } as never,
        }),
      )) as RecordRow;
    } catch (error) {
      const problem = ctx.report(error);
      if (at !== generation) return;
      saving = false;
      fieldErrors = errorsByField(problem?.fieldErrors);
      failure = problem;
      return;
    }
    // The record exists whether or not its entity is still shown, so the host hears of it either way.
    emit('record-created', { recordId: created.id });
    if (at !== generation) return;
    saving = false;
    creating = false;
    await loadRows();
  }

  // Declared before the loads so it runs first: Svelte runs sibling effects in declaration order.
  $effect(() => {
    void entityId;
    generation++;
    latest++;
    entity = null;
    createFields = null;
    q = '';
    creating = false;
    saving = false;
    rows = [];
    next = null;
    loaded = false;
    loading = false;
    failure = null;
  });

  $effect(() => {
    // A page may set entity-id after the element connects (the plain page reads it from config first).
    if (!ready || !entityId) return;
    const id = entityId;
    untrack(() => loadEntity(id));
  });

  $effect(() => {
    if (!ready || !entity) return;
    void [filterKey, limit];
    untrack(() => loadRows());
  });
</script>

<!-- Keyed on ready: once the session ends or access is lost, what was listed is stale. -->
{#if af.current && ready}
  {@const t = af.current.t}
  {#if entity}
    <div part="toolbar">
      {#if !activeFilter}
        <form part="search" role="search" onsubmit={(e) => { e.preventDefault(); loadRows(); }}>
          <input type="search" placeholder={t('records.search')} aria-label={t('records.search')} bind:value={q} />
        </form>
      {/if}
      {#if createFields && !creating}
        <button part="create-button" type="button" onclick={openCreate}>{t('records.create')}</button>
      {/if}
    </div>
  {/if}
  {#if creating && createFields}
    <form part="form" onsubmit={(e) => e.preventDefault()}>
      <FieldList fields={createFields} bind:values errors={fieldErrors} disabled={saving} {t} />
      {#if blocked.length > 0}<p part="notice" class="error">{t('form.unsupported_required')}</p>{/if}
      <div part="actions">
        <button part="button" type="button" class="secondary" onclick={() => (creating = false)}>{t('common.cancel')}</button>
        <button part="button" type="button" disabled={saving || blocked.length > 0} onclick={save}>{t('records.save')}</button>
      </div>
    </form>
  {/if}
  {#if failure}
    <p part="error" class="error" role="alert">
      {t('common.error', { code: failure.code })}
      {#if failure.requestId}<br />{t('common.request_id', { id: failure.requestId })}{/if}
    </p>
  {/if}
  {#if loaded && !loading && rows.length === 0 && !failure}
    <p part="empty" class="muted">{t('records.empty')}</p>
  {:else if rows.length > 0}
    <table part="table">
      <thead><tr>{#each shown as f (f.key)}<th>{f.label}</th>{/each}</tr></thead>
      <tbody>
        {#each rows as row (row.id)}
          <tr part="row" tabindex="0" onclick={() => emit('record-select', { recordId: row.id })} onkeydown={(e) => e.key === 'Enter' && emit('record-select', { recordId: row.id })}>
            {#each shown as f (f.key)}<td part="cell">{formatCell(row.body[f.key], af.current.locale, t)}</td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  {#if loading}<p class="muted">{t('common.loading')}</p>{/if}
  {#if next && !loading}<button part="load-more" type="button" onclick={() => loadRows(next ?? undefined)}>{t('common.load_more')}</button>{/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  [part='toolbar'] { display: flex; gap: 8px; justify-content: space-between; margin-block-end: var(--agentflow-gap, 12px); }
  input[type='search'] { font: inherit; padding: 6px 8px; border: 1px solid var(--agentflow-border, #d0d5dd); border-radius: var(--agentflow-radius, 6px); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: start; padding: 8px; border-block-end: 1px solid var(--agentflow-border, #eaecf0); }
  tr[part='row'] { cursor: pointer; }
  tr[part='row']:hover, tr[part='row']:focus { background: color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent); }
  .muted { color: var(--agentflow-muted, #667085); }
  .error { color: var(--agentflow-danger, #b42318); }
  [part='actions'] { display: flex; gap: 8px; }
  button {
    font: inherit; padding: 6px 14px; cursor: pointer; border-radius: var(--agentflow-radius, 6px);
    border: 1px solid var(--agentflow-accent, #1570ef); background: var(--agentflow-accent, #1570ef); color: var(--agentflow-accent-text, #fff);
  }
  button.secondary, [part='load-more'] { background: transparent; color: var(--agentflow-accent, #1570ef); }
  button:disabled { opacity: 0.5; cursor: default; }
</style>
