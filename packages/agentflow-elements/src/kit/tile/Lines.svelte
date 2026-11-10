<svelte:options namespace="svg" />

<script lang="ts">
  import type { Focus, Pressable } from './interaction.js';
  import type { LineLayout } from './layout.js';

  const FADED = 0.25;

  let { layout, opens, tab, emphasis, onkey, onopen }: {
    layout: LineLayout;
    /** Whether a dot can open records; if not, a dot is an image. */
    opens: boolean;
    tab: Focus | null;
    emphasis: number | null;
    onkey: (e: KeyboardEvent, mark: Pressable) => void;
    onopen: (mark: Pressable, click: MouseEvent) => void;
  } = $props();

  /** A series other than the one pointed at in the legend is faded; the target belongs to none. */
  const fade = (series: number, own = 1) => (emphasis !== null && series >= 0 && series !== emphasis ? Math.min(own, FADED) : own);
</script>

{#if layout.zero !== null}
  <line part="zero" aria-hidden="true" x1={layout.plot.x} y1={layout.zero} x2={layout.plot.x + layout.plot.width} y2={layout.zero} stroke-width="1.5" style:stroke="var(--k-chart-axis)" />
{/if}
{#each layout.paths as path (`${path.kind}:${path.series}`)}
  <path
    aria-hidden="true"
    data-kind={path.kind}
    data-series={path.series}
    d={path.d}
    stroke-width={path.kind === 'target' || path.kind === 'running' ? 1.5 : 2}
    stroke-linejoin="round"
    stroke-linecap={path.dashed ? 'butt' : 'round'}
    stroke-dasharray={path.dashed ? '4 3' : undefined}
    style:fill="none"
    style:stroke={path.stroke}
    style:opacity={fade(path.series, path.opacity)}
  />
{/each}
{#each layout.dots as dot (`${dot.series}:${dot.bucket}`)}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (a mark that opens nothing is still a stop for the arrows, and focus brings its tooltip) -->
  <circle
    role={opens ? 'button' : 'img'}
    tabindex={tab?.bucket === dot.bucket && tab.series === dot.series ? 0 : -1}
    aria-label={dot.summary}
    aria-disabled={opens && !dot.drill ? 'true' : undefined}
    data-kind="dot"
    data-bucket={dot.bucket}
    data-series={dot.series}
    cx={dot.cx}
    cy={dot.cy}
    r="3.5"
    stroke-width="2"
    style:fill={dot.hollow ? 'var(--k-surface)' : dot.stroke}
    style:stroke={dot.stroke}
    style:opacity={fade(dot.series)}
    onclick={(e) => onopen(dot, e)}
    onauxclick={(e) => onopen(dot, e)}
    onkeydown={(e) => onkey(e, dot)}
  />
{/each}
<g aria-hidden="true">
  {#each layout.labels as label (label.series)}
    <text class="name" x={label.x} y={label.y} dominant-baseline="central" style:fill="var(--k-fg)" style:opacity={fade(label.series)}>{label.text}</text>
  {/each}
</g>

<style>
  .name { font-size: 11px; font-weight: 500; }
  path, circle, .name { transition: opacity 120ms; }
  [aria-hidden='true'] { pointer-events: none; }
  [tabindex] { outline: none; -webkit-tap-highlight-color: transparent; }
  [role='button']:not([aria-disabled='true']) { cursor: pointer; }
  [tabindex]:focus-visible { outline: 2px solid var(--k-primary); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    path, circle, .name { transition: none; }
  }
</style>
