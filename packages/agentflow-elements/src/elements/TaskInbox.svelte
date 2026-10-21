<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      view: { attribute: 'view', type: 'String' },
      pageSize: { attribute: 'page-size', type: 'Number' },
    },
  }}
/>

<script lang="ts">
  import { ok } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import type { Problem } from '../errors.js';
  import { formatDate } from '../format.js';
  import { pageSizeProp } from '../props.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { view, pageSize }: { view?: string | null; pageSize?: number | null } = $props();
  // The defaults live here rather than in $props: a removed attribute arrives as null, which a
  // $props default does not cover.
  const whose = $derived(view === 'mine' || view === 'claimable' ? view : 'all');
  const limit = $derived(pageSizeProp(pageSize));

  type Line = {
    id: string;
    entity_id: string;
    claimed_by_user_id?: string | null;
    due_at?: string | null;
    step?: { workflow: { name: string }; step: { key: string; label: string } } | null;
  };

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');

  let rows = $state<Line[]>([]);
  let next = $state<string | null>(null);
  let loaded = $state(false);
  let loading = $state(false);
  let failure = $state<Problem | null>(null);

  // Only the latest load may touch the list: a page still in flight when the host
  // changes a filter answers a question nobody is asking any more.
  let latest = 0;

  async function load(cursor?: string) {
    const ctx = af.current;
    if (!ctx) return;
    const call = ++latest;
    loading = true;
    failure = null;
    // A reload starts over: the old cursor walks the old filter, and old rows left behind by a
    // failed reload would read as the new filter's answer.
    if (!cursor) next = null;
    try {
      const query: { view: 'all' | 'mine' | 'claimable'; live: boolean; limit: number; cursor?: string } = { view: whose, live: true, limit };
      if (cursor) query.cursor = cursor;
      const page = await ok(ctx.client.GET('/work', { params: { query } }));
      if (call !== latest) return;
      // My Work lists every kind of work; this element lists what a workflow step holds.
      const lines = (page.items as Line[]).filter((l) => l.step);
      rows = cursor ? [...rows, ...lines] : lines;
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

  $effect(() => {
    if (!ready) return;
    void [whose, limit];
    untrack(() => load());
  });

  const select = (row: Line) =>
    self.dispatchEvent(new CustomEvent('task-select', { detail: { recordId: row.id, entityId: row.entity_id }, bubbles: true, composed: true }));
</script>

<!-- Keyed on ready: once the session ends or access is lost, what was listed is stale. -->
{#if af.current && ready}
  {@const t = af.current.t}
  {#if failure}
    <p part="error" class="error" role="alert">
      {t('common.error', { code: failure.code })}
      {#if failure.requestId}<br />{t('common.request_id', { id: failure.requestId })}{/if}
    </p>
  {/if}
  <!-- Pages are filtered to the lines a step holds, so a page can be empty with more behind it. -->
  {#if loaded && !loading && rows.length === 0 && !failure && !next}
    <p part="empty" class="muted">{t('inbox.empty')}</p>
  {:else if rows.length > 0}
    <table part="table">
      <thead>
        <tr>
          <th>{t('inbox.column.task')}</th>
          <th>{t('inbox.column.workflow')}</th>
          <th>{t('inbox.column.status')}</th>
          <th>{t('inbox.column.due')}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.id)}
          <tr part="row" tabindex="0" onclick={() => select(row)} onkeydown={(e) => e.key === 'Enter' && select(row)}>
            <td>{row.step?.step.label || row.step?.step.key}</td>
            <td>{row.step?.workflow.name ?? ''}</td>
            <td>{t(row.claimed_by_user_id ? 'status.claimed' : 'status.open')}</td>
            <td>{formatDate(row.due_at, af.current.locale)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  {#if loading}<p class="muted">{t('common.loading')}</p>{/if}
  {#if next && !loading}
    <button part="load-more" type="button" onclick={() => load(next ?? undefined)}>{t('common.load_more')}</button>
  {/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: start; padding: 8px; border-block-end: 1px solid var(--agentflow-border, #eaecf0); }
  tr[part='row'] { cursor: pointer; }
  tr[part='row']:hover, tr[part='row']:focus { background: color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent); }
  .muted { color: var(--agentflow-muted, #667085); }
  .error { color: var(--agentflow-danger, #b42318); }
  button {
    font: inherit; margin-block-start: var(--agentflow-gap, 12px); padding: 6px 12px; cursor: pointer;
    border: 1px solid var(--agentflow-border, #d0d5dd); border-radius: var(--agentflow-radius, 6px); background: transparent;
  }
</style>
