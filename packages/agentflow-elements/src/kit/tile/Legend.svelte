<script lang="ts">
  import { fill } from '../text.js';
  import type { KitStrings } from '../text.js';
  import type { ChartModel, LegendItem } from './chart-model.js';
  import { isIsolated } from './interaction.js';
  import Swatch from './Swatch.svelte';

  let { model, items, plain, hidden, text, onisolate, onemphasis }: {
    /** The chart the items belong to, or the first panel of a set. */
    model: ChartModel;
    items: LegendItem[];
    /** Whether every item is a label alone: a legend that does not isolate a series. */
    plain: boolean;
    hidden: ReadonlySet<number>;
    text: Required<KitStrings>;
    onisolate: (series: number) => void;
    onemphasis: (series: number | null) => void;
  } = $props();

  const line = $derived(model.type === 'line');
  const count = $derived(model.series.length);

  function swatchOf(item: LegendItem) {
    switch (item.kind) {
      case 'target': return { shape: line ? 'dashed' : 'rule' } as const;
      case 'running': return { shape: 'ink' } as const;
      case 'filled': return { shape: line ? 'hollow' : 'outline', color: model.series[0]?.color ?? null } as const;
      case 'earlier': return { shape: line ? 'line' : 'box', color: item.color, pattern: item.pattern, faint: true } as const;
      default: return { shape: line ? 'line' : 'box', color: item.color, pattern: item.pattern, faint: item.series !== null && hidden.has(item.series) } as const;
    }
  }
</script>

<div class="legend" part="legend">
  {#each items as item, i (i)}
    {#if !plain && item.kind === 'series' && item.series !== null && count > 1}
      {@const index = item.series}
      {@const alone = isIsolated(hidden, index, count)}
      <button
        type="button"
        class="item"
        class:off={hidden.has(index)}
        part="legend-item"
        aria-pressed={alone}
        aria-label={fill(text.tileIsolate, { series: item.label })}
        title={alone ? text.tileShowAll : undefined}
        onclick={() => onisolate(index)}
        onpointerenter={() => onemphasis(index)}
        onpointerleave={() => onemphasis(null)}
        onfocus={() => onemphasis(index)}
        onblur={() => onemphasis(null)}
      ><Swatch {...swatchOf(item)} />{item.label}</button>
    {:else if item.kind === 'slice'}
      <span class="item slice" part="legend-item"><Swatch {...swatchOf(item)} />{item.label} <span class="detail">{item.detail}</span></span>
    {:else}
      <span class="item plain" part="legend-item">{#if item.kind !== 'formula'}<Swatch {...swatchOf(item)} />{/if}{item.label}</span>
    {/if}
  {/each}
</div>

<style>
  .legend { display: flex; flex-wrap: wrap; gap: 0 12px; font-size: 12px; line-height: 18px; }
  .item { display: inline-flex; align-items: center; gap: 6px; min-height: 24px; min-width: 0; margin: 0; padding: 0 4px; border: 0; border-radius: 4px; background: none; color: var(--k-fg); font: inherit; }
  .plain, .detail { color: var(--k-muted); }
  .detail { font-variant-numeric: tabular-nums; white-space: nowrap; }
  /* A figure that does not fit beside its slice's name goes under it whole, not broken between its value and its share. */
  .slice { flex-wrap: wrap; }
  button.item { cursor: pointer; -webkit-tap-highlight-color: transparent; }
  @media (hover: hover) { button.item:hover { background: var(--k-hover); } }
  button.item:focus-visible { outline: 2px solid var(--k-primary); outline-offset: 1px; }
  .off { color: var(--k-muted); }
</style>
