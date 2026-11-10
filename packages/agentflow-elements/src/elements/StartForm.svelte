<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      workflowId: { attribute: 'workflow-id', type: 'String' },
      workflowKey: { attribute: 'workflow-key', type: 'String' },
      entity: { attribute: 'entity', type: 'String' },
      record: { attribute: 'record', type: 'String' },
      action: { attribute: 'action', type: 'String' },
      subjectEntity: { attribute: 'subject-entity', type: 'String' },
      subjectRecord: { attribute: 'subject-record', type: 'String' },
      // resumeSets is property-only; see ../props.ts.
    },
  }}
/>

<script lang="ts">
  import { folderSources, manualParamKeys, ok, paginate, resolveRowInputMap, type AgentFlowClient, type FolderSources, type GenericLaunchSubject } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import FieldList from '../FieldList.svelte';
  import { resolveKey } from '../app-keys.js';
  import { FOLDER_SOURCE_TAG, defineFolderSource } from '../folder-source.js';
  import { APP_KEY_MISSING, classify, type Problem } from '../errors.js';
  import { objectProp } from '../props.js';
  import { blockingFields, errorsByField, fieldsOf, folderFieldsOf, initialValues, missingRequired, takesFiles, toPayload, type ContractSlot, type FieldSpec } from '../form.js';
  import type { StringKey } from '../i18n.js';
  import type { WorkflowStartedOutcome } from '../types.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let {
    workflowId,
    workflowKey,
    entity,
    record,
    action,
    subjectEntity,
    subjectRecord,
    resumeSets,
  }: {
    workflowId?: string | null;
    workflowKey?: string | null;
    entity?: string | null;
    record?: string | null;
    action?: string | null;
    subjectEntity?: string | null;
    subjectRecord?: string | null;
    resumeSets?: unknown;
  } = $props();

  type Startable = { id: string; name: string; version_id: string };
  // A record action being launched: what the record supplies, and what the server re-checks the action against.
  type Launch = {
    subject: GenericLaunchSubject;
    params: Record<string, unknown>;
    context: { entity_id: string; action_id: string; record_id: string };
    // A sync action's start waits for the run, and the form then shows how it came out.
    sync: boolean;
  };
  type Run = {
    id: string;
    status: string;
    auth_blocked?: unknown;
    last_rollback?: { node_id: string; node_label: string; message: string } | null;
    outcome_label?: string | null;
    error_message?: string | null;
  };
  type Result = { outcome: WorkflowStartedOutcome; detail?: string | null; step?: string };
  const NAME = '__name';
  // How long the start request itself waits for a sync action's run.
  const SYNC_WAIT_MS = 5000;
  // A run that outlives the request is read again this often, for this long at most.
  const POLL_INTERVAL_MS = 2000;
  const POLL_DEADLINE_MS = 30_000;
  const BAD: ReadonlySet<WorkflowStartedOutcome> = new Set(['failed', 'rolled_back', 'blocked']);
  // A map rather than a key built from the outcome, so an outcome added later has to be given its sentence here.
  const SAYS = {
    completed: 'start.completed',
    failed: 'start.failed',
    rolled_back: 'start.rolled_back',
    paused: 'start.paused',
    blocked: 'start.blocked',
    started: 'start.started',
  } as const satisfies Record<WorkflowStartedOutcome, StringKey>;

  // Null while the run is still going. A run blocked on authorization is paused like one waiting on a
  // person, so the block is read first.
  function resultOf(run: Run): Result | null {
    if (run.auth_blocked) return { outcome: 'blocked' };
    if (run.status === 'completed') return { outcome: 'completed', detail: run.outcome_label };
    if (run.status === 'failed' && run.last_rollback) {
      const { node_label, node_id, message } = run.last_rollback;
      return { outcome: 'rolled_back', step: node_label || node_id, detail: message };
    }
    if (run.status === 'failed' || run.status === 'cancelled') return { outcome: 'failed', detail: run.error_message };
    if (run.status === 'paused') return { outcome: 'paused' };
    return null;
  }

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');
  let keyedId = $state<string | null>(null);
  const effectiveId = $derived(workflowId || keyedId);
  // A key names a workflow, so the picker is not offered while it resolves or when it names nothing.
  const actionMode = $derived(!!entity || !!record || !!action);
  const named = $derived(!!workflowId || !!workflowKey || actionMode);
  let keyMissing = $state<Problem | null>(null);
  let subjectMissing = $state<Problem | null>(null);
  const unresolved = $derived(keyMissing ?? subjectMissing);

  let catalog = $state<Startable[]>([]);
  let picked = $state('');
  let notStartable = $state(false);
  // Set together with its fields, once its start form has loaded.
  let chosen = $state<Startable | null>(null);
  let launch = $state<Launch | null>(null);
  let refused = $state(false);
  let fields = $state<FieldSpec[]>([]);
  let values = $state<Record<string, unknown>>({});
  let fieldErrors = $state<Record<string, string>>({});
  let failure = $state<Problem | null>(null);
  let busy = $state(false);
  let result = $state<Result | null>(null);
  let waiting = $state(false);
  let loading = $state(false);

  // Bumped when the form resets itself, so a folder field's source forgets the set that launch took.
  let round = $state(0);
  // A folder field whose upload or check is still out has no value yet, and a start now would go without its files.
  let uploading = $state<Record<string, boolean>>({});
  // A folder the launch would refuse is held the same way: the start would only be refused in its turn.
  let refusing = $state<Record<string, boolean>>({});
  // The upload sets a run started here has taken. The page may still hold one as a set to continue, and one set feeds one run.
  let taken = $state.raw<string[]>([]);
  // The page's word on which sets to continue is newer than anything remembered about the last.
  $effect(() => {
    void resumeSets;
    taken = [];
  });
  // One sources object for as long as the client is the same, as the folder source expects of its page.
  let made: { client: AgentFlowClient; sources: FolderSources } | null = null;
  const sourcesOf = (client: AgentFlowClient) => (made?.client === client ? made : (made = { client, sources: folderSources(client) })).sources;
  const folders = $derived.by(() => {
    const ctx = af.current;
    if (!ctx || !chosen || !fields.some((f) => f.kind === 'folder')) return null;
    const named = objectProp<Record<string, string>>(resumeSets, 'resumeSets');
    const resume = named && Object.fromEntries(Object.entries(named).filter(([, setId]) => !taken.includes(setId)));
    // No version is named: the form starts the current one, which a check reads unasked, and an app may name none.
    return { sources: sourcesOf(ctx.client), workflow: chosen.id, locale: ctx.locale, round, resumeSets: resume, uploadStarted };
  });
  // The folder source's code loads when a folder field first appears, so a form without one never pays for it. A page whose
  // own kit defined the tag has it from the start.
  let foldersReady = $state(customElements.get(FOLDER_SOURCE_TAG) !== undefined);
  let foldersFailed = $state(false);
  const wantsFolders = $derived(folders !== null);
  $effect(() => {
    if (!wantsFolders) return;
    // Each time a folder field appears the code is asked for again, so a load that failed once is not final.
    foldersFailed = false;
    defineFolderSource().then(
      () => (foldersReady = true),
      (error: unknown) => {
        foldersFailed = true;
        // The page hears why (`request-failed`): a refused or missing chunk is its to fix, and the field only says that it failed.
        af.current?.report(error);
      },
    );
  });
  const foldersLoading = $derived(wantsFolders && !foldersReady && !foldersFailed);
  // A required folder field whose source cannot be loaded can never be filled, like a field of a kind the form cannot draw.
  const blocked = $derived(blockingFields(fields, wantsFolders && foldersFailed));
  // While the source loads its field cannot be filled either, and a start then would leave it empty for good.
  const held = $derived(Object.values(uploading).some(Boolean) || Object.values(refusing).some(Boolean) || foldersLoading);

  const emit = (type: string, detail: unknown) =>
    self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

  // Bumped whenever the shown workflow changes: when the host names another, and on every pick.
  // Each request captures it, and an answer that lands after it moved is about a workflow that
  // is no longer shown.
  let generation = 0;

  // The sync run being waited on, which its host hears of once, when the wait ends.
  let watched: { timer: ReturnType<typeof setTimeout> | undefined; announce: (outcome: WorkflowStartedOutcome) => void } | null = null;

  // The run goes on whether or not anything still waits for it, so the host hears that it started.
  function stopWatching() {
    const run = watched;
    if (!run) return;
    watched = null;
    clearTimeout(run.timer);
    run.announce('started');
  }

  function forgetChosen() {
    generation++;
    stopWatching();
    chosen = null;
    launch = null;
    refused = false;
    fields = [];
    values = {};
    uploading = {};
    refusing = {};
    fieldErrors = {};
    failure = null;
    busy = false;
    result = null;
    waiting = false;
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

  const freshValues = (w: Startable) => (launch ? initialValues(fields, launch.params) : { ...initialValues(fields, {}), [NAME]: w.name });

  async function loadAction(entityKey: string, recordId: string, actionKey: string) {
    const ctx = af.current;
    if (!ctx) return;
    const at = generation;
    loading = true;
    try {
      const entityId = await resolveKey(ctx.client, 'entity', entityKey);
      const [definition, row] = await Promise.all([
        ok(ctx.client.GET('/entities/{entity_id}', { params: { path: { entity_id: entityId } } })),
        ok(ctx.client.GET('/entities/{entity_id}/records/{record_id}', { params: { path: { entity_id: entityId, record_id: recordId } } })),
      ]);
      if (at !== generation) return;
      const found = definition.actions.find((a) => a.key === actionKey);
      if (!found) {
        loading = false;
        refused = true;
        return;
      }
      const contract = await ok(ctx.client.GET('/workflows/{workflow_id}/input-contract', { params: { path: { workflow_id: found.workflow_id } } }));
      if (at !== generation) return;
      if (!contract.version_id) {
        loading = false;
        notStartable = true;
        return;
      }
      const resolved = resolveRowInputMap(found, row);
      const manual = new Set(manualParamKeys(contract, resolved.contextKeys, resolved.defaultKeys));
      // A field the record fills keeps the record's files, which no folder source could show.
      const open = contract.params_slots.filter((slot) => resolved.params[slot.key] == null);
      // The contract names the keys to ask for but carries no field types, which the version's start form does.
      // With no form bound, only a folder field can be drawn, since its slot says all there is to it.
      let offered = folderFieldsOf(open);
      if (manual.size > 0 && contract.form_definition_id) {
        const form = await ok(ctx.client.GET('/workflow-versions/{version_id}/start-form', { params: { path: { version_id: contract.version_id } } }));
        if (at !== generation) return;
        offered = fieldsOf(form.form_definition?.schema_json, form.form_definition?.ui_schema_json, open);
      }
      const asked = offered.filter((f) => manual.has(f.key));
      const display = definition.browser_config?.display_field;
      const shown = display ? row.body[display] : undefined;
      const recordName = (typeof shown === 'string' && shown.trim()) || typeof shown === 'number' ? String(shown) : row.id;
      loading = false;
      fields = asked;
      launch = {
        subject: resolved.subject,
        params: resolved.params,
        context: { entity_id: entityId, action_id: found.id, record_id: row.id },
        sync: found.mode === 'sync',
      };
      values = initialValues(asked, resolved.params);
      chosen = { id: found.workflow_id, name: `${found.label} · ${recordName}`, version_id: contract.version_id };
    } catch (error) {
      const problem = ctx.report(error);
      if (at !== generation) return;
      failure = problem;
      loading = false;
    }
  }

  async function choose(w: Startable | null) {
    const ctx = af.current;
    if (!ctx) return;
    forgetChosen();
    if (!w) return;
    const at = generation;
    loading = true;
    let form: { form_definition?: { schema_json: unknown; ui_schema_json?: unknown } | null };
    let slots: ContractSlot[] = [];
    try {
      form = await ok(ctx.client.GET('/workflow-versions/{version_id}/start-form', { params: { path: { version_id: w.version_id } } }));
      // Only the contract says which field takes a folder. A form with no field of files asks for none, and a
      // start that binds no form has nothing but the contract to say so.
      if (at === generation && (!form.form_definition || takesFiles(form.form_definition.schema_json))) {
        slots = (await ok(ctx.client.GET('/workflows/{workflow_id}/input-contract', { params: { path: { workflow_id: w.id } } }))).params_slots;
      }
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
    const bound = form.form_definition;
    fields = [nameField, ...(bound ? fieldsOf(bound.schema_json, bound.ui_schema_json, slots) : folderFieldsOf(slots))];
    values = freshValues(w);
    chosen = w;
  }

  // A kit event stops at this element's shadow root, so the page is told again from the element itself. The page
  // keeps the id if it wants to clear away a set whose upload the person walked away from.
  const uploadStarted = (field: string, setId: string) => emit('af-folder-upload-started', { setId, field });

  // The picker binds its value rather than handling onchange: Svelte delegates `change` to the
  // shadow root, which a change event dispatched without `bubbles` never reaches.
  function pick(id: string) {
    picked = id;
    choose(catalog.find((w) => w.id === id) ?? null);
  }

  async function start() {
    const ctx = af.current;
    const w = chosen;
    if (!ctx || !w || busy || held || blocked.length > 0) return;
    result = null;
    const act = launch;
    const name = act ? w.name : String(values[NAME] ?? '').trim();
    const missing = missingRequired(fields, act ? values : { ...values, [NAME]: name });
    if (missing.length > 0) {
      fieldErrors = Object.fromEntries(missing.map((k) => [k, ctx.t('form.required')]));
      return;
    }
    const at = generation;
    busy = true;
    failure = null;
    fieldErrors = {};
    let created: Run;
    try {
      created = await ok(
        ctx.client.POST('/workflows/{workflow_id}/instances', {
          params: { path: { workflow_id: w.id } },
          body: act
            ? {
                name,
                subject: act.subject,
                // A field on screen answers for its key, so one the person emptied is not sent with the record's value.
                params: {
                  ...Object.fromEntries(Object.entries(act.params).filter(([k]) => !fields.some((f) => f.key === k))),
                  ...toPayload(fields, values),
                },
                version_id: w.version_id,
                action_context: act.context,
                ...(act.sync ? { wait_ms: SYNC_WAIT_MS } : {}),
              }
            : {
                name,
                version_id: w.version_id,
                input_payload: toPayload(fields.filter((f) => f.key !== NAME), values),
                ...(subjectRecord ? { subject: { kind: 'record' as const, record_id: subjectRecord } } : {}),
              },
        }),
      );
    } catch (error) {
      const problem = ctx.report(error);
      if (at !== generation) return;
      busy = false;
      // The record changed since the action was offered, so the same start would be refused again.
      if (problem?.code === 'ACTION_NOT_VISIBLE') {
        chosen = null;
        refused = true;
        return;
      }
      fieldErrors = errorsByField(problem?.fieldErrors);
      failure = problem;
      return;
    }
    const announce = (outcome?: WorkflowStartedOutcome) =>
      emit('workflow-started', { instanceId: created.id, workflowId: w.id, ...(outcome ? { outcome } : {}) });
    const sets = fields.flatMap((f) => (f.kind === 'folder' ? [(values[f.key] as { $fileSet?: string } | null)?.$fileSet] : [])).filter((setId) => setId !== undefined);
    if (sets.length) taken = [...taken, ...sets];
    const settled = act?.sync ? resultOf(created) : { outcome: 'started' as const };
    // The run exists whether or not its workflow is still shown, so the host hears of it either way.
    if (!act?.sync) announce();
    else if (settled || at !== generation) announce(settled?.outcome ?? 'started');
    if (at !== generation) return;
    const show = (shown: Result) => {
      // Reset rather than left armed: with the values still there, a second click starts a second run.
      busy = false;
      waiting = false;
      values = freshValues(w);
      uploading = {};
      refusing = {};
      round++;
      result = shown;
    };
    if (settled) return show(settled);

    waiting = true;
    const run: NonNullable<typeof watched> = { timer: undefined, announce };
    watched = run;
    let waited = 0;
    const poll = async () => {
      waited += POLL_INTERVAL_MS;
      let now: Result | null;
      try {
        now = resultOf(await ok(ctx.client.GET('/instances/{instance_id}', { params: { path: { instance_id: created.id } } })));
      } catch (error) {
        // An app may be refused a run that holds content, and the run started all the same. Only a
        // session that ended is the provider's to hear of.
        if (classify(error).type !== 'other') ctx.report(error);
        now = { outcome: 'started' };
      }
      if (watched !== run) return;
      now ??= waited >= POLL_DEADLINE_MS ? { outcome: 'started' } : null;
      if (!now) {
        run.timer = setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }
      watched = null;
      announce(now.outcome);
      show(now);
    };
    run.timer = setTimeout(poll, POLL_INTERVAL_MS);
  }

  // A start still held when the element goes must not begin a wait on its answer, so it is made stale as well.
  $effect(() => () => {
    generation++;
    stopWatching();
  });

  // Declared before the load so it runs first: Svelte runs sibling effects in declaration order.
  $effect(() => {
    void [workflowId, workflowKey];
    keyedId = null;
    keyMissing = null;
  });

  $effect(() => {
    void [effectiveId, workflowKey, entity, record, action];
    forgetChosen();
    catalog = [];
    picked = '';
    notStartable = false;
  });

  $effect(() => {
    if (!ready || actionMode || workflowId || !workflowKey) return;
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
    if (!ready || actionMode) return;
    if (workflowKey && !workflowId && !effectiveId) return;
    const id = effectiveId;
    untrack(() => loadCatalog(id));
  });

  // The three name one launch together, so nothing loads until all of them are set.
  $effect(() => {
    if (!ready || !entity || !record || !action) return;
    const [entityKey, recordId, actionKey] = [entity, record, action];
    untrack(() => loadAction(entityKey, recordId, actionKey));
  });

  // The subject sent is the record alone; its entity is only checked to be one this app has.
  $effect(() => {
    subjectMissing = null;
    if (!ready || actionMode || !subjectEntity) return;
    const key = subjectEntity;
    untrack(async () => {
      const ctx = af.current;
      if (!ctx) return;
      try {
        await resolveKey(ctx.client, 'entity', key);
      } catch (error) {
        const problem = ctx.report(error);
        if (subjectEntity === key) subjectMissing = problem;
      }
    });
  });
</script>

<!-- Keyed on ready: once the session ends or access is lost, nothing here can be started. -->
{#if af.current && ready}
  {@const t = af.current.t}
  {#if unresolved}
    <p part="error" class="error" role="alert">
      {#if unresolved.code === APP_KEY_MISSING}{unresolved.detail}{:else}{t('common.error', { code: unresolved.code })}{/if}
      {#if unresolved.requestId}<br />{t('common.request_id', { id: unresolved.requestId })}{/if}
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
    {#if waiting}<p part="notice" class="muted" role="status">{t('start.running')}</p>{/if}
    {#if result}
      {@const bad = BAD.has(result.outcome)}
      <p part="notice" class:error={bad} role={bad ? 'alert' : 'status'}>
        {#if result.outcome === 'rolled_back'}{t(SAYS.rolled_back, { step: result.step ?? '', message: result.detail ?? '' })}{:else}{result.detail || t(SAYS[result.outcome])}{/if}
      </p>
    {/if}
    {#if refused}<p part="notice" class="error" role="alert">{t('start.action_unavailable')}</p>{/if}
    {#if chosen}
      <form part="form" onsubmit={(e) => e.preventDefault()}>
        {#if launch}<p class="run">{chosen.name}</p>{/if}
        <FieldList {fields} bind:values bind:uploading bind:refusing errors={fieldErrors} disabled={busy} {t} {folders} {foldersReady} {foldersFailed} />
        {#if blocked.length > 0}<p part="notice" class="error">{t('form.unsupported_required')}</p>{/if}
        <div part="actions">
          <button part="button" type="button" disabled={busy || held || blocked.length > 0} onclick={start}>{t('start.submit')}</button>
        </div>
      </form>
    {/if}
  {/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  [part='picker'] { display: grid; gap: 4px; margin-block-end: var(--agentflow-gap, 12px); font-weight: 600; }
  select { font: inherit; padding: 6px 8px; border: 1px solid var(--agentflow-border, #d0d5dd); border-radius: var(--agentflow-radius, 6px); }
  .run { margin-block: 0 var(--agentflow-gap, 12px); font-weight: 600; }
  .muted { color: var(--agentflow-muted, #667085); }
  .error { color: var(--agentflow-danger, #b42318); }
  button {
    font: inherit; padding: 6px 14px; cursor: pointer; border-radius: var(--agentflow-radius, 6px);
    border: 1px solid var(--agentflow-accent, #1570ef); background: var(--agentflow-accent, #1570ef); color: var(--agentflow-accent-text, #fff);
  }
  button:disabled { opacity: 0.5; cursor: default; }
</style>
