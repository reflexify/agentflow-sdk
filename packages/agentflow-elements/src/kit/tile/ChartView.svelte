<script lang="ts">
  import { untrack } from 'svelte';
  import type { KitStrings } from '../text.js';
  import ChartPlot from './ChartPlot.svelte';
  import ChartTooltip from './ChartTooltip.svelte';
  import { panelsLegend, tableOf } from './chart-model.js';
  import type { ChartModel } from './chart-model.js';
  import DataTable from './DataTable.svelte';
  import { isPie } from './frame.js';
  import { keepIsolation, toggleIsolation, tooltipOf } from './interaction.js';
  import { panelGutter } from './layout.js';
  import type { PanelOptions, Size } from './layout.js';
  import Legend from './Legend.svelte';

  let { panels, table, text, locale, label, host }: {
    /** One model for each unit; a chart in one unit, or a pie, is one. */
    panels: ChartModel[];
    table: boolean;
    text: Required<KitStrings>;
    locale: string | null | undefined;
    label: string;
    host: HTMLElement;
  } = $props();

  /** Nothing isolated. A chart in several panels never isolates a series, since each panel has a scale of its own. */
  const NONE: ReadonlySet<number> = new Set();

  let box = $state<HTMLElement>();
  let measured = $state<Size | null>(null);
  let hidden = $state.raw<ReadonlySet<number>>(NONE);
  let tip = $state.raw<{ panel: number; bucket: number; anchor: Element } | null>(null);
  let emphasis = $state<number | null>(null);
  let seen: ChartModel[] | null = null;

  const lead = $derived(panels[0]!);
  const many = $derived(panels.length > 1);
  const sliced = $derived(isPie(lead.type));
  const bar = $derived(lead.type === 'bar');
  // What a panel takes when its host sets no height, and the least it is squeezed to in a cell that is shorter. The floor
  // is low so a short dashboard card still shows its axes, its legend and every bar; a bar chart's floor keeps a thin row
  // for each bucket.
  const natural = $derived(many ? (bar ? Math.max(120, 28 * lead.buckets.length + 40) : 160) : bar ? Math.max(160, 28 * lead.buckets.length + 40) : 240);
  const floor = $derived(Math.max(64, bar ? 16 * lead.buckets.length + 24 : 0));
  // The measured height is shared equally, and every panel is at least as tall as its floor. Before there is a measurement the box is drawn at the height it takes unconstrained.
  const size = $derived<Size>(measured ? { width: measured.width, height: Math.max(floor, measured.height / panels.length) } : { width: 480, height: natural });
  const gutter = $derived(many ? panelGutter(panels, hidden) : undefined);
  const options = $derived<(PanelOptions | undefined)[]>(
    panels.map((panel, i) => (many ? { valueGutter: gutter, categoryLabels: bar || i === panels.length - 1, unitLabel: panel.unitLabel } : undefined)),
  );
  const legend = $derived(panelsLegend(panels));
  const data = $derived(table ? tableOf(panels, hidden, text, locale ?? undefined) : null);
  const owner = $derived(tip ? panels[tip.panel] : undefined);
  const tipModel = $derived(tip && owner ? tooltipOf(owner, tip.bucket, hidden, text, owner.drill, locale ?? undefined) : null);

  // New panels are a new result, or new fields or strings for the same one: what was isolated or shown is held only where it still exists.
  $effect.pre(() => {
    const next = panels;
    const previous = seen;
    if (next === previous) return;
    seen = next;
    if (!previous) return;
    untrack(() => {
      hidden = next.length > 1 ? NONE : keepIsolation(hidden, previous[0]!, next[0]!);
      tip = null;
      emphasis = null;
    });
  });

  $effect.pre(() => {
    if (table) tip = null;
  });

  $effect(() => {
    const target = box;
    if (!target || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[entries.length - 1]?.contentRect;
      measured = rect && rect.width > 0 ? { width: rect.width, height: rect.height } : null;
    });
    observer.observe(target);
    return () => observer.disconnect();
  });

  function show(panel: number, next: { bucket: number; anchor: Element } | null) {
    if (next) tip = { panel, ...next };
    else if (tip?.panel === panel) tip = null;
  }
</script>

{#if lead.empty}
  <div class="state" part="state"><p class="lead">{text.tileNoBuckets}</p></div>
{:else}
  {#if data}
    <DataTable head={data.head} rows={data.rows} label={label || lead.splitLabel} />
  {:else}
    <div class="chart" style:flex-basis="{natural * panels.length}px" style:min-height="{floor * panels.length}px" bind:this={box}>
      <!-- A different number of panels is a different chart, so nothing that belongs to a panel by its place carries over. -->
      {#each panels as model, i (`${panels.length}:${i}`)}
        <ChartPlot
          {model}
          {size}
          options={options[i]}
          {hidden}
          {emphasis}
          active={tip?.panel === i ? tip.bucket : null}
          {text}
          {label}
          {host}
          ontip={(next) => show(i, next)}
        />
      {/each}
    </div>
  {/if}
  {#if legend.length > (sliced ? 0 : 1)}
    <Legend
      model={lead}
      items={legend}
      plain={many}
      {hidden}
      {text}
      onisolate={(series) => (hidden = toggleIsolation(hidden, series, lead.series.length))}
      onemphasis={(series) => (emphasis = series)}
    />
  {/if}
  <ChartTooltip model={tipModel} anchor={tip?.anchor ?? null} side={bar ? 'beside' : 'above'} line={lead.type === 'line'} {text} {host} />
{/if}

<style>
  .state { position: relative; display: grid; gap: 4px; padding: 16px 0; }
  .state p { margin: 0; }
  .lead { font-weight: 500; }
  .chart { position: relative; display: flex; flex-grow: 1; flex-shrink: 1; flex-direction: column; min-width: 0; }
</style>
