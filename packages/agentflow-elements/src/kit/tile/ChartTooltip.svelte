<script lang="ts">
  import { raise } from '../environment.js';
  import type { KitStrings } from '../text.js';
  import { placeTooltip } from './interaction.js';
  import type { TooltipModel } from './interaction.js';
  import Swatch from './Swatch.svelte';

  let { model, anchor, side, line, text, host }: {
    model: TooltipModel | null;
    anchor: Element | null;
    side: 'above' | 'beside';
    line: boolean;
    text: Required<KitStrings>;
    host: HTMLElement;
  } = $props();

  let el = $state<HTMLElement>();
  let at = $state({ left: 0, top: 0 });
  let raised = false;

  // A tooltip that goes with its chart is never raised to false: `raise` does nothing for a node that is no longer connected, so the flag would stay true.
  $effect(() => () => {
    if (raised) host.dataset.raised = 'false';
  });

  $effect(() => {
    const node = el;
    const open = model !== null && !!anchor?.isConnected;
    raise(node, open, host);
    raised = open && !!node?.isConnected;
    if (node && open && anchor) {
      const view = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
      at = placeTooltip(anchor.getBoundingClientRect(), { width: node.offsetWidth, height: node.offsetHeight }, view, side);
    }
  });
</script>

<div bind:this={el} class="tip" part="tooltip" role="tooltip" popover="manual" style:left="{at.left}px" style:top="{at.top}px">
  {#if model}
    <div class="body af-overlay">
      <div class="title">{model.title}</div>
      {#each model.rows as row, i (i)}
        <div class="row"><span class="name"><Swatch color={row.color} pattern={row.pattern} shape={line ? 'line' : 'box'} />{row.label}</span><span class="value">{row.value}</span></div>
      {/each}
      {#if model.share !== null}
        <div class="row"><span class="name">{text.tileShare}</span><span class="value">{model.share}</span></div>
      {/if}
      {#if model.target !== null}
        <div class="row muted"><span class="name">{text.tileTarget}</span><span class="value">{model.target}</span></div>
      {/if}
      {#if model.derived !== null}
        <div class="row muted"><span class="name">{model.derived.label}</span><span class="value">{model.derived.value}</span></div>
      {/if}
      {#if model.earlier !== null}
        <div class="row muted"><span class="name">{text.tileEarlier}</span><span class="value">{model.earlier}</span></div>
        <div class="row muted"><span class="name">{text.tileDifference}</span><span class="value">{model.change}</span></div>
      {/if}
      {#if model.total !== null}
        <div class="row strong"><span class="name">{text.tileBarTotal}</span><span class="value">{model.total}</span></div>
      {/if}
      {#if model.hint}<div class="hint">{model.hint}</div>{/if}
    </div>
  {/if}
</div>

<style>
  .tip { width: max-content; max-width: min(320px, calc(100vw - 8px)); pointer-events: none; font-size: 12px; line-height: 18px; }
  .body { padding: 6px 10px; }
  .title { margin-bottom: 2px; font-weight: 600; overflow-wrap: anywhere; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .name { display: inline-flex; align-items: center; gap: 6px; min-width: 0; overflow-wrap: anywhere; }
  .value { font-variant-numeric: tabular-nums; text-align: end; white-space: nowrap; }
  .muted { color: var(--k-muted); }
  .strong { font-weight: 600; }
  .hint { margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--k-line); color: var(--k-muted); }
</style>
