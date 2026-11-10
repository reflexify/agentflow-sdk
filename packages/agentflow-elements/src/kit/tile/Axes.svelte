<svelte:options namespace="svg" />

<script lang="ts">
  import type { AxesLayout } from './layout.js';

  let { layout, horizontal, zero = null }: {
    layout: AxesLayout;
    horizontal: boolean;
    /** Where a bar chart's bars start; a line chart's axis is its bottom edge. */
    zero?: number | null;
  } = $props();
  const plot = $derived(layout.plot);
  const base = $derived(zero ?? plot.y + plot.height);
</script>

<g class="axes" aria-hidden="true">
  {#if layout.unit}
    <text class="unit" x={layout.unit.x} y={layout.unit.y} dominant-baseline="central" style:fill="var(--k-muted)">{layout.unit.text}</text>
  {/if}
  {#each layout.valueTicks as tick, i (i)}
    {#if horizontal}
      <line x1={tick.at} y1={plot.y} x2={tick.at} y2={plot.y + plot.height} style:stroke="var(--k-chart-grid)" />
      <text x={tick.at} y={plot.y + plot.height + 16} text-anchor="middle" style:fill="var(--k-muted)">{tick.label}</text>
    {:else}
      <line x1={plot.x} y1={tick.at} x2={plot.x + plot.width} y2={tick.at} style:stroke="var(--k-chart-grid)" />
      <text x={plot.x - 8} y={tick.at} text-anchor="end" dominant-baseline="central" style:fill="var(--k-muted)">{tick.label}</text>
    {/if}
  {/each}
  {#if horizontal}
    <line x1={base} y1={plot.y} x2={base} y2={plot.y + plot.height} style:stroke="var(--k-chart-axis)" />
  {:else}
    <line x1={plot.x} y1={base} x2={plot.x + plot.width} y2={base} style:stroke="var(--k-chart-axis)" />
  {/if}
  {#each layout.categoryTicks as tick, i (i)}
    {#if horizontal}
      <text x={plot.x - 8} y={tick.at} text-anchor="end" dominant-baseline="central" style:fill="var(--k-muted)">{#if tick.label !== tick.full}<title>{tick.full}</title>{/if}{tick.label}</text>
    {:else}
      <text x={tick.at} y={plot.y + plot.height + 16} text-anchor="middle" style:fill="var(--k-muted)">{#if tick.label !== tick.full}<title>{tick.full}</title>{/if}{tick.label}</text>
    {/if}
  {/each}
</g>

<style>
  text { font-size: 11px; }
  line { stroke-width: 1; }
</style>
