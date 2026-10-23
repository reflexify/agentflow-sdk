<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      workflowId: { attribute: 'workflow-id', type: 'String' },
      workflowKey: { attribute: 'workflow-key', type: 'String' },
    },
  }}
/>

<script lang="ts">
  import { ok, paginate } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import FieldList from '../FieldList.svelte';
  import { resolveKey } from '../app-keys.js';
  import { APP_KEY_MISSING, type Problem } from '../errors.js';
  import { blockingFields, errorsByField, fieldsOf, initialValues, missingRequired, toPayload, type FieldSpec } from '../form.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { workflowId, workflowKey }: { workflowId?: string | null; workflowKey?: string | null } = $props();

  type Startable = { id: string; name: string; version_id: string };
  const NAME = '__name';

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');
  let keyedId = $state<string | null>(null);
  const effectiveId = $derived(workflowId || keyedId);
  // A key names a workflow, so the picker is not offered while it resolves or when it names nothing.
  const named = $derived(!!workflowId || !!workflowKey);
  let keyMissing = $state<Problem | null>(null);

  let catalog = $state<Startable[]>([]);
  let picked = $state('');
  let notStartable = $state(false);
  // Set together with its fields, once its start form has loaded.
  let chosen = $state<Startable | null>(null);
  let fields = $state<FieldSpec[]>([]);
  let values = $state<Record<string, unknown>>({});
  let fieldErrors = $state<Record<string, string>>({});
  let failure = $state<Problem | null>(null);
  let busy = $state(false);
  let started = $state(false);
  let loading = $state(false);

  const blocked = $derived(blockingFields(fields));

  const emit = (type: string, detail: unknown) =>
    self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

  // Bumped whenever the shown workflow changes: when the host names another, and on every pick.
  // Each request captures it, and an answer that lands after it moved is about a workflow that
  // is no longer shown.
  let generation = 0;

  function forgetChosen() {
    generation++;
    chosen = null;
    fields = [];
    values = {};
    fieldErrors = {};
    failure = null;
    busy = false;
    started = false;
    loading = false;
  }

  async function loadCatalog(id: string | null | undefined) {
    const ctx = af.current;
    if (!ctx) return;
    const at = generation;
    loading = true;
    const all: Startable[] = [];
    try {
      for await (const w of paginate((cursor) =>
        ok(ctx.client.GET('/workflows/startable', { params: { query: cursor ? { limit: 100, cursor } : { limit: 100 } } })),
      ))
        all.push(w);
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation) {
        failure = problem;
        loading = false;
      }
      return;
    }
    if (at !== generation) return;
    loading = false;
    catalog = all;
    if (!id) return;
    const hit = all.find((w) => w.id === id);
    if (hit) await choose(hit);
    else notStartable = true;
  }

  const freshValues = (w: Startable) => ({ ...initialValues(fields, {}), [NAME]: w.name });

  async function choose(w: Startable | null) {
    const ctx = af.current;
    if (!ctx) return;
    forgetChosen();
    if (!w) return;
    const at = generation;
    loading = true;
    let form: { form_definition?: { schema_json: unknown; ui_schema_json?: unknown } | null };
    try {
      form = await ok(ctx.client.GET('/workflow-versions/{version_id}/start-form', { params: { path: { version_id: w.version_id } } }));
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation) {
        failure = problem;
        loading = false;
      }
      return;
    }
    if (at !== generation) return;
    loading = false;
    const nameField: FieldSpec = { key: NAME, label: ctx.t('start.name'), kind: 'text', required: true };
    fields = [nameField, ...fieldsOf(form.form_definition?.schema_json, form.form_definition?.ui_schema_json)];
    values = freshValues(w);
    chosen = w;
  }

  // The picker binds its value rather than handling onchange: Svelte delegates `change` to the
  // shadow root, which a change event dispatched without `bubbles` never reaches.
  function pick(id: string) {
    picked = id;
    choose(catalog.find((w) => w.id === id) ?? null);
  }

  async function start() {
    const ctx = af.current;
    const w = chosen;
    if (!ctx || !w || busy || blocked.length > 0) return;
    started = false;
    const name = String(values[NAME] ?? '').trim();
    const missing = missingRequired(fields, { ...values, [NAME]: name });
    if (missing.length > 0) {
      fieldErrors = Object.fromEntries(missing.map((k) => [k, ctx.t('form.required')]));
      return;
    }
    const at = generation;
    busy = true;
    failure = null;
    fieldErrors = {};
    let created: { id: string };
    try {
      created = await ok(
        ctx.client.POST('/workflows/{workflow_id}/instances', {
          params: { path: { workflow_id: w.id } },
          body: {
            name,
            version_id: w.version_id,
            input_payload: toPayload(fields.filter((f) => f.key !== NAME), values),
          },
        }),
      );
    } catch (error) {
      const problem = ctx.report(error);
      if (at !== generation) return;
      busy = false;
      fieldErrors = errorsByField(problem?.fieldErrors);
      failure = problem;
      return;
    }
    // The run exists whether or not its workflow is still shown, so the host hears of it either way.
    emit('workflow-started', { instanceId: created.id, workflowId: w.id });
    if (at !== generation) return;
    // Reset rather than left armed: with the values still there, a second click starts a second run.
    busy = false;
    values = freshValues(w);
    started = true;
  }

  // Declared before the load so it runs first: Svelte runs sibling effects in declaration order.
  $effect(() => {
    void [workflowId, workflowKey];
    keyedId = null;
    keyMissing = null;
  });

  $effect(() => {
    void [effectiveId, workflowKey];
    forgetChosen();
    catalog = [];
    picked = '';
    notStartable = false;
  });

  $effect(() => {
    if (!ready || workflowId || !workflowKey) return;
    const key = workflowKey;
    untrack(async () => {
      const ctx = af.current;
      if (!ctx) return;
      const at = generation;
      try {
        const id = await resolveKey(ctx.client, 'workflow', key);
        if (at === generation) keyedId = id;
      } catch (error) {
        const problem = ctx.report(error);
        if (at === generation) keyMissing = problem;
      }
    });
  });

  $effect(() => {
    if (!ready) return;
    if (workflowKey && !workflowId && !effectiveId) return;
    const id = effectiveId;
    untrack(() => loadCatalog(id));
  });
</script>

<!-- Keyed on ready: once the session ends or access is lost, nothing here can be started. -->
{#if af.current && ready}
  {@const t = af.current.t}
  {#if keyMissing}
    <p part="error" class="error" role="alert">
      {#if keyMissing.code === APP_KEY_MISSING}{keyMissing.detail}{:else}{t('common.error', { code: keyMissing.code })}{/if}
      {#if keyMissing.requestId}<br />{t('common.request_id', { id: keyMissing.requestId })}{/if}
    </p>
  {:else if notStartable}
    <p part="error" class="error" role="alert">{t('start.not_startable')}</p>
  {:else}
    {#if !named}
      <label part="picker">
        {t('start.choose')}
        <select bind:value={() => picked, pick}>
          <option value="">—</option>
          {#each catalog as w (w.id)}<option value={w.id}>{w.name}</option>{/each}
        </select>
      </label>
    {/if}
    {#if loading}<p class="muted">{t('common.loading')}</p>{/if}
    {#if failure}
      <p part="error" class="error" role="alert">
        {#if failure.code === APP_KEY_MISSING}{failure.detail}{:else}{t('common.error', { code: failure.code })}{/if}
        {#if failure.requestId}<br />{t('common.request_id', { id: failure.requestId })}{/if}
      </p>
    {/if}
    {#if started}<p part="notice" role="status">{t('start.started')}</p>{/if}
    {#if chosen}
      <form part="form" onsubmit={(e) => e.preventDefault()}>
        <FieldList {fields} bind:values errors={fieldErrors} disabled={busy} {t} />
        {#if blocked.length > 0}<p part="notice" class="error">{t('form.unsupported_required')}</p>{/if}
        <div part="actions">
          <button part="button" type="button" disabled={busy || blocked.length > 0} onclick={start}>{t('start.submit')}</button>
        </div>
      </form>
    {/if}
  {/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  [part='picker'] { display: grid; gap: 4px; margin-block-end: var(--agentflow-gap, 12px); font-weight: 600; }
  select { font: inherit; padding: 6px 8px; border: 1px solid var(--agentflow-border, #d0d5dd); border-radius: var(--agentflow-radius, 6px); }
  .muted { color: var(--agentflow-muted, #667085); }
  .error { color: var(--agentflow-danger, #b42318); }
  button {
    font: inherit; padding: 6px 14px; cursor: pointer; border-radius: var(--agentflow-radius, 6px);
    border: 1px solid var(--agentflow-accent, #1570ef); background: var(--agentflow-accent, #1570ef); color: var(--agentflow-accent-text, #fff);
  }
  button:disabled { opacity: 0.5; cursor: default; }
</style>
