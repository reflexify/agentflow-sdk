<svelte:options customElement={{ shadow: 'open', props: { spec: { type: 'Object' }, result: { type: 'Object' }, fields: { type: 'Array' }, rows: { type: 'Array' }, columns: { type: 'Array' }, paging: { type: 'Object' }, table: { type: 'Boolean' }, drill: { attribute: 'drill', type: 'Boolean' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import type { Component } from 'svelte';
  import { tileTitle } from '@reflexify/agentflow-sdk/figures';
  import type { FigureField } from '@reflexify/agentflow-sdk/figures';
  import KitStyles from './KitStyles.svelte';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';
  import Loading from './tile/Loading.svelte';
  import type { AfListColumn, AfListRow, AfTilePaging, AfTileResult, AfTileSpec, TileViewProps } from './tile/types.js';

  let {
    spec = null, result = null, fields = null, rows = null, columns = null, paging = null, table = null, drill = false, locale = null, strings = null,
  }: {
    spec?: AfTileSpec | null; result?: AfTileResult | null; fields?: FigureField[] | null; rows?: AfListRow[] | null; columns?: AfListColumn[] | null; paging?: AfTilePaging | null;
    table?: boolean | null; drill?: boolean | null;
    locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  // Worked out as the drawing code does, so the title does not change when that code arrives.
  const title = $derived(spec ? tileTitle(spec, fields ?? undefined) : '');
  let View = $state.raw<Component<TileViewProps> | null>(null);
  let failed = $state(false);

  $effect(() => {
    let live = true;
    void import('./tile/tile-view.js').then(
      (loaded) => {
        if (live) View = loaded.default;
      },
      () => {
        if (live) failed = true;
      },
    );
    return () => {
      live = false;
    };
  });
</script>

<KitStyles />
<div class="af-kit">
  {#if View}
    <View {spec} {result} {fields} {rows} {columns} {paging} {table} drill={!!drill} {text} {locale} host={self} />
  {:else}
    <div class="frame" part="frame">
      {#if failed}
        <div class="state" part="state"><p class="lead">{text.tileLoadFailed}</p></div>
      {:else}
        <Loading {title} {text} />
      {/if}
    </div>
  {/if}
</div>

<style>
  :host { display: block; }
  .af-kit { height: 100%; }
  .frame { display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; height: 100%; min-width: 0; padding: 12px 16px; border: 1px solid var(--k-line);
    border-radius: var(--k-radius); background: var(--k-surface); font-size: 14px; line-height: 20px; }
  .state { padding: 16px 0; }
  .lead { margin: 0; font-weight: 500; }
</style>
