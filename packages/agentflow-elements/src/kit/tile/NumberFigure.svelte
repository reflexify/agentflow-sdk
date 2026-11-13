<script lang="ts">
  import { emit } from '../environment.js';
  import { fill } from '../text.js';
  import type { KitStrings } from '../text.js';
  import { formatCount } from './frame.js';
  import { asksNewTab, holdMiddle, presses } from './interaction.js';
  import type { FigureModel, NumberModel } from './number.js';
  import type { AfDrillDetail } from './types.js';

  let { model, text, locale, host }: { model: NumberModel; text: Required<KitStrings>; locale: string | null | undefined; host: HTMLElement } = $props();

  function openTitle(figure: FigureModel): string {
    const count = figure.drill?.count ?? 0;
    return fill(count === 1 ? text.tileOpenRecordsOne : text.tileOpenRecords, { count: formatCount(count, locale ?? undefined) });
  }

  function open(figure: FigureModel, click: MouseEvent) {
    if (figure.drill && presses(click)) emit<AfDrillDetail>(host, 'af-drill', { ...figure.drill, newTab: asksNewTab(click) });
  }
</script>

{#snippet body(figure: FigureModel, small: boolean)}
  {#if figure.label}<div class="label" part="label">{figure.label}</div>{/if}
  {#if figure.drill}
    <button type="button" class="value" class:muted={figure.muted} class:small part="value" title={openTitle(figure)} onclick={(e) => open(figure, e)} onauxclick={(e) => open(figure, e)} onmousedown={holdMiddle}>{figure.value}</button>
  {:else}
    <div class="value" class:muted={figure.muted} class:small part="value">{figure.value}</div>
  {/if}
  <div class="meta" part="meta">{figure.meta.join(' · ')}</div>
  {#if figure.goal}<div class="goal" part="goal" data-tone={figure.goal.tone}>{figure.goal.text}</div>{/if}
  {#if figure.comparison}<div class="comparison" part="comparison">{figure.comparison}</div>{/if}
{/snippet}

<div class="figure" part="figure">{@render body(model.primary, false)}</div>
{#if model.secondaries.length}
  <div class="secondaries">
    {#each model.secondaries as secondary, i (i)}
      <div class="figure" part="secondary">{@render body(secondary, true)}</div>
    {/each}
  </div>
{/if}

<style>
  .figure { display: grid; align-content: start; gap: 2px; min-width: 0; }
  .label, .meta, .comparison { color: var(--k-muted); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
  .goal { font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
  .value { margin: 0; padding: 0; border: 0; background: none; color: var(--k-fg); font: inherit; font-size: 32px; font-weight: 600; line-height: 38px;
    font-variant-numeric: tabular-nums; text-align: start; overflow-wrap: anywhere; }
  .value.small { font-size: 20px; line-height: 26px; }
  .value.muted { color: var(--k-muted); }
  button.value { justify-self: start; border-radius: 4px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  @media (hover: hover) { button.value:hover { text-decoration: underline; text-decoration-color: var(--k-muted); text-underline-offset: 4px; } }
  button.value:focus-visible { outline: 2px solid var(--k-primary); outline-offset: 2px; }
  .secondaries { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; padding-top: 12px; border-top: 1px solid var(--k-line); }
</style>
