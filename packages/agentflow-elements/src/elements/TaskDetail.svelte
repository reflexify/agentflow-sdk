<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      entityId: { attribute: 'entity-id', type: 'String' },
      entityKey: { attribute: 'entity-key', type: 'String' },
      recordId: { attribute: 'record-id', type: 'String' },
    },
  }}
/>

<script lang="ts">
  import { ok } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import FieldList from '../FieldList.svelte';
  import { resolveKey } from '../app-keys.js';
  import { APP_KEY_MISSING, type Problem } from '../errors.js';
  import { blockingFields, errorsByField, fieldsOf, initialValues, missingRequired, toPayload, type FieldSpec } from '../form.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { entityId, entityKey, recordId }: { entityId?: string | null; entityKey?: string | null; recordId: string } = $props();

  /** The step's panel (`GET …/step`), as far as this element reads it. */
  type Step = {
    kind: string;
    signs: boolean;
    step_status: string;
    signed: boolean;
    run: { workflow_name: string; step_label: string; step_key: string };
    instance_name?: string | null;
    actions: { id: string; label: string }[];
    actions_gated_out: boolean;
    signed_action_id?: string | null;
    form_definition?: { schema_json: unknown; ui_schema_json?: unknown } | null;
    draft_payload?: unknown;
    prefill?: unknown;
    entity_view?: { mode?: string; min_selection?: number | null; view?: { type?: string } } | null;
  };
  /** Who holds the task, from its record: the work is the record's. */
  type Holder = { id: string | null; name: string | null; title: string | null };
  const NO_HOLDER: Holder = { id: null, name: null, title: null };

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');
  let keyedId = $state<string | null>(null);
  let keyMissing = $state<Problem | null>(null);
  // Its own counter: a new record-id must not strand a key that is still resolving.
  let keyGeneration = 0;
  const effectiveId = $derived(entityId || keyedId);

  let task = $state<Step | null>(null);
  let holder = $state<Holder>(NO_HOLDER);
  // The step answered 404: the reader may see that the task exists, not its form.
  let hidden = $state(false);
  let fields = $state<FieldSpec[]>([]);
  let values = $state<Record<string, unknown>>({});
  let fieldErrors = $state<Record<string, string>>({});
  let failure = $state<Problem | null>(null);
  const shown = $derived(failure ?? keyMissing);
  let busy = $state(false);
  let loading = $state(false);

  const mine = $derived(!!holder.id && holder.id === af.current?.caller?.id);
  // Only a step that is no longer open is complete. A recorded signature on an open step waits on
  // the workflow's owner to finish it: signing or deciding again would contradict what is signed.
  const finished = $derived(!!task && task.step_status !== 'open');
  const signedWaiting = $derived(!!task && task.step_status === 'open' && task.signed);
  const blocked = $derived(blockingFields(fields));
  // The signing action completes through AgentFlow's signing flow; a plain submit of it is refused.
  const signedAction = $derived(task?.actions.find((a) => a.id === task?.signed_action_id));
  const offered = $derived(task?.actions.filter((a) => a.id !== signedAction?.id) ?? []);
  // The records are chosen in the task's embedded view, which is not drawn here, and a submit
  // without them is refused. The server asks for a choice only from a selectable grid or kanban,
  // at least one record when no minimum is set.
  const choosesRecords = $derived.by(() => {
    const v = task?.entity_view;
    if (v?.mode !== 'selectable') return false;
    if (v.view?.type !== 'grid' && v.view?.type !== 'kanban') return false;
    return (v.min_selection ?? 1) > 0;
  });

  const emit = (type: string, detail: unknown) =>
    self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

  function show(next: Step) {
    task = next;
    fields = fieldsOf(next.form_definition?.schema_json, next.form_definition?.ui_schema_json);
    values = initialValues(fields, next.draft_payload ?? next.prefill ?? {});
    fieldErrors = {};
  }

  // Bumped whenever the host points the element at another task. Each request captures it, and
  // an answer that lands after it moved is about a task that is no longer shown.
  let generation = 0;

  async function load(entity: string, id: string) {
    const ctx = af.current;
    if (!ctx || !entity || !id) return;
    const at = generation;
    loading = true;
    try {
      const path = { entity_id: entity, record_id: id };
      const [stepRes, recordRes] = await Promise.all([
        ctx.client.GET('/entities/{entity_id}/records/{record_id}/step', { params: { path } }),
        ctx.client.GET('/entities/{entity_id}/records/{record_id}', { params: { path } }),
      ]);
      // The step answers only the people its work names: anyone else sees that it exists. A record
      // that is gone, or that the reader may not read, says so itself instead.
      if (stepRes.response.status === 404) {
        // Nothing is served for this step any more, so what was shown of it goes first.
        if (at === generation) {
          task = null;
          holder = NO_HOLDER;
        }
        await ok(Promise.resolve(recordRes));
        if (at === generation) hidden = true;
        return;
      }
      const next = (await ok(Promise.resolve(stepRes))) as unknown as Step;
      const rec = (await ok(Promise.resolve(recordRes))) as unknown as { body: Record<string, unknown>; ref_labels?: Record<string, string> };
      if (at !== generation) return;
      hidden = false;
      const claimedBy = typeof rec.body.claimed_by === 'string' ? rec.body.claimed_by : null;
      holder = {
        id: claimedBy,
        name: claimedBy ? (rec.ref_labels?.claimed_by ?? null) : null,
        title: typeof rec.body.title === 'string' ? rec.body.title : null,
      };
      show(next);
    } catch (error) {
      // Reported even when stale: a 401 or lost access ends the session whichever task is shown.
      const problem = ctx.report(error);
      if (at === generation) failure = problem;
    } finally {
      if (at === generation) loading = false;
    }
  }

  async function act(kind: 'claim' | 'release') {
    const ctx = af.current;
    if (!ctx || !task) return;
    const entity = effectiveId;
    const id = recordId;
    if (!entity) return;
    const at = generation;
    busy = true;
    failure = null;
    try {
      const path = kind === 'claim' ? '/entities/{entity_id}/records/{record_id}/work/claim' : '/entities/{entity_id}/records/{record_id}/work/release';
      await ok(ctx.client.POST(path, { params: { path: { entity_id: entity, record_id: id } } }));
      // The answer is the work, not the panel: what the person may now do is read again.
      if (at === generation) await load(entity, id);
      // The write happened whether or not the task is still shown, so the host hears of it either way.
      emit(kind === 'claim' ? 'task-claimed' : 'task-released', { recordId: id, entityId: entity });
    } catch (error) {
      const problem = ctx.report(error);
      if (at !== generation) return;
      failure = problem;
      if (problem) await load(entity, id);
    } finally {
      if (at === generation) busy = false;
    }
  }

  async function submit(actionId: string | null) {
    const ctx = af.current;
    if (!ctx || !task) return;
    const missing = missingRequired(fields, values);
    if (missing.length > 0) {
      fieldErrors = Object.fromEntries(missing.map((k) => [k, ctx.t('form.required')]));
      return;
    }
    const entity = effectiveId;
    const id = recordId;
    if (!entity) return;
    const at = generation;
    busy = true;
    failure = null;
    fieldErrors = {};
    try {
      const payload: Record<string, unknown> = toPayload(fields, values);
      if (actionId) payload._action = actionId;
      const finishedPanel = (await ok(
        ctx.client.POST('/entities/{entity_id}/records/{record_id}/step/submit', {
          params: { path: { entity_id: entity, record_id: id } },
          body: { payload },
        }),
      )) as unknown as Step;
      // Checked once the network has settled: the host may have moved on while the write was in flight.
      if (at === generation) show(finishedPanel);
      emit('task-submitted', { recordId: id, entityId: entity, actionId });
    } catch (error) {
      const problem = ctx.report(error);
      if (at !== generation) return;
      fieldErrors = errorsByField(problem?.fieldErrors);
      failure = problem;
    } finally {
      if (at === generation) busy = false;
    }
  }

  // Declared before the load so it runs first: Svelte runs sibling effects in declaration order.
  $effect(() => {
    void [entityId, entityKey];
    keyGeneration++;
    keyedId = null;
    keyMissing = null;
  });

  $effect(() => {
    void [effectiveId, entityKey, recordId];
    generation++;
    task = null;
    hidden = false;
    holder = NO_HOLDER;
    failure = null;
    fieldErrors = {};
    busy = false;
    loading = false;
  });

  $effect(() => {
    if (!ready || entityId || !entityKey) return;
    const key = entityKey;
    untrack(async () => {
      const ctx = af.current;
      if (!ctx) return;
      const at = keyGeneration;
      try {
        const id = await resolveKey(ctx.client, 'entity', key);
        if (at === keyGeneration) keyedId = id;
      } catch (error) {
        const problem = ctx.report(error);
        if (at === keyGeneration) keyMissing = problem;
      }
    });
  });

  $effect(() => {
    if (!ready || !effectiveId) return;
    const entity = effectiveId;
    const id = recordId;
    untrack(() => load(entity, id));
  });
</script>

<!-- Keyed on ready: once the session ends or access is lost, the task shown is stale. -->
{#if af.current && ready}
  {@const t = af.current.t}
  {#if task && !hidden}
    <header part="header">
      <h2 part="title">{holder.title ?? task.run.step_label}</h2>
      <p part="meta" class="muted">{[task.run.workflow_name, task.instance_name].filter(Boolean).join(' · ')}</p>
    </header>
  {/if}
  <!-- Outside the task: a load that fails leaves no task to show it under. -->
  {#if shown}
    <p part="error" class="error" role="alert">
      {#if shown.code === APP_KEY_MISSING}{shown.detail}{:else}{t('common.error', { code: shown.code })}{/if}
      <!-- A refused form names its failing paths in the detail; the server sends no field errors with it. -->
      {#if shown.status === 422 && !shown.fieldErrors?.length && shown.detail}<br />{shown.detail}{/if}
      {#if shown.requestId}<br />{t('common.request_id', { id: shown.requestId })}{/if}
    </p>
  {/if}
  {#if loading}<p class="muted">{t('common.loading')}</p>{/if}
  {#if hidden}
    <p part="notice">{t('task.withheld')}</p>
  {:else if task}
    {#snippet release()}
      <button part="button" type="button" class="secondary" disabled={busy} onclick={() => act('release')}>{t('task.release')}</button>
    {/snippet}
    {#if finished}
      <p part="notice">{task.step_status === 'cancelled' ? t('task.cancelled') : t('task.done')}</p>
    {:else if signedWaiting}
      <p part="notice">{t('task.signed_waiting')}</p>
    {:else if !holder.id}
      <div part="actions"><button part="button" type="button" disabled={busy} onclick={() => act('claim')}>{t('task.claim')}</button></div>
    {:else if mine && (task.kind === 'signature' || (task.signs && !signedAction))}
      <!-- The server accepts a plain submit of a signature task, which would complete it unsigned. -->
      <p part="notice">{t('task.sign_elsewhere')}</p>
      <div part="actions">{@render release()}</div>
    {:else if mine && choosesRecords}
      <p part="notice">{t('task.select_elsewhere')}</p>
      <div part="actions">{@render release()}</div>
    {:else if mine}
      <form part="form" onsubmit={(e) => e.preventDefault()}>
        <FieldList {fields} bind:values errors={fieldErrors} disabled={busy} {t} />
        {#if blocked.length > 0}<p part="notice" class="error">{t('form.unsupported_required')}</p>{/if}
        {#if task.actions_gated_out}<p part="notice">{t('task.no_actions')}</p>{/if}
        {#if signedAction}<p part="notice">{t('task.sign_elsewhere')}</p>{/if}
        <div part="actions">
          {@render release()}
          {#if task.actions.length > 0}
            {#each offered as action (action.id)}
              <button part="button" type="button" disabled={busy || blocked.length > 0} onclick={() => submit(action.id)}>{action.label}</button>
            {/each}
          {:else if !task.actions_gated_out}
            <button part="button" type="button" disabled={busy || blocked.length > 0} onclick={() => submit(null)}>{t('task.submit')}</button>
          {/if}
        </div>
      </form>
    {:else}
      <p part="notice">{holder.name ? t('task.claimed_by', { name: holder.name }) : t('task.claimed_by_someone')}</p>
    {/if}
  {/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  h2 { margin: 0 0 4px; font-size: 1.25em; }
  .muted { color: var(--agentflow-muted, #667085); margin: 0 0 var(--agentflow-gap, 12px); }
  .error { color: var(--agentflow-danger, #b42318); }
  [part='actions'] { display: flex; gap: 8px; flex-wrap: wrap; }
  button {
    font: inherit; padding: 6px 14px; cursor: pointer; border-radius: var(--agentflow-radius, 6px);
    border: 1px solid var(--agentflow-accent, #1570ef); background: var(--agentflow-accent, #1570ef);
    color: var(--agentflow-accent-text, #fff);
  }
  button.secondary { background: transparent; color: var(--agentflow-accent, #1570ef); }
  button:disabled { opacity: 0.5; cursor: default; }
</style>
