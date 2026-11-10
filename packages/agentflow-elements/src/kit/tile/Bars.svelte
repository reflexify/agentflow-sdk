<svelte:options namespace="svg" />

<script lang="ts">
  import type { Focus, Pressable } from './interaction.js';
  import type { BarLabel, BarMark, RunningLayout, TargetMark } from './layout.js';

  const FADED = 0.25;
  const RUNNING_OPACITY = 0.7;

  let { marks, targets, labels, running, ids, opens, tab, emphasis, onkey, onopen }: {
    marks: BarMark[];
    targets: TargetMark[];
    labels: BarLabel[];
    running: RunningLayout | null;
    ids: { other: string; restricted: string };
    /** Whether a mark can open records; if not, a mark is an image. */
    opens: boolean;
    tab: Focus | null;
    emphasis: number | null;
    onkey: (e: KeyboardEvent, mark: Pressable) => void;
    onopen: (mark: Pressable, click: MouseEvent) => void;
  } = $props();

  const fillOf = (mark: BarMark) => (mark.pattern ? `url(#${ids[mark.pattern]})` : mark.fill || 'var(--k-chart-other)');
  const fade = (mark: BarMark) => (emphasis !== null && mark.series !== emphasis ? Math.min(mark.opacity, FADED) : mark.opacity);
  const outline = (mark: BarMark) => (mark.pattern ? 'var(--k-chart-hatch)' : mark.fill || 'var(--k-chart-hatch)');
</script>

{#each marks as mark (`${mark.bucket}:${mark.series}:${mark.kind}`)}
  {#if mark.kind === 'previous'}
    <rect
      data-kind={mark.kind}
      data-bucket={mark.bucket}
      data-series={mark.series}
      x={mark.x}
      y={mark.y}
      width={mark.width}
      height={mark.height}
      aria-hidden="true"
      style:fill={fillOf(mark)}
      style:opacity={fade(mark)}
    />
  {:else}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (a mark that opens nothing is still a stop for the arrows, and focus brings its tooltip) -->
    <rect
      role={opens ? 'button' : 'img'}
      tabindex={tab?.bucket === mark.bucket && tab.series === mark.series ? 0 : -1}
      aria-label={mark.summary}
      aria-disabled={opens && !mark.drill ? 'true' : undefined}
      data-kind={mark.kind}
      data-bucket={mark.bucket}
      data-series={mark.series}
      x={mark.x}
      y={mark.y}
      width={mark.width}
      height={mark.height}
      stroke-width={mark.kind === 'filled' ? 1 : undefined}
      stroke-dasharray={mark.kind === 'filled' ? '3 2' : undefined}
      style:fill={mark.kind === 'filled' ? 'none' : fillOf(mark)}
      style:stroke={mark.kind === 'filled' ? outline(mark) : undefined}
      style:opacity={fade(mark)}
      onclick={(e) => onopen(mark, e)}
      onauxclick={(e) => onopen(mark, e)}
      onkeydown={(e) => onkey(e, mark)}
    />
  {/if}
{/each}
{#each targets as target (target.bucket)}
  <line data-kind="target" data-bucket={target.bucket} aria-hidden="true" x1={target.x1} y1={target.y1} x2={target.x2} y2={target.y2} stroke-width="2" style:stroke="var(--k-fg)" />
{/each}
{#if running}
  <path data-kind="running" aria-hidden="true" d={running.d} stroke-width="1.5" stroke-linejoin="round" style:fill="none" style:stroke="var(--k-fg)" style:opacity={RUNNING_OPACITY} />
  {#each running.dots as dot (dot.bucket)}
    <circle
      data-kind="running-dot"
      data-bucket={dot.bucket}
      aria-hidden="true"
      cx={dot.cx}
      cy={dot.cy}
      r="4"
      stroke-width="1.5"
      style:fill={dot.hollow ? 'var(--k-surface)' : 'var(--k-fg)'}
      style:stroke="var(--k-fg)"
    />
  {/each}
{/if}
{#if labels.length > 0}
  <g aria-hidden="true">
    {#each labels as label (label.bucket)}
      <!-- A figure past a bar is centred on it; one above a column sits on its baseline. -->
      <text class="figure" data-kind="label" data-bucket={label.bucket} x={label.x} y={label.y} text-anchor={label.anchor} dominant-baseline={label.anchor === 'start' ? 'central' : undefined} style:fill="var(--k-fg)">{label.text}</text>
    {/each}
  </g>
{/if}

<style>
  .figure { font-size: 11px; }
  rect { transition: opacity 120ms; }
  [aria-hidden='true'] { pointer-events: none; }
  [tabindex] { outline: none; -webkit-tap-highlight-color: transparent; }
  [role='button']:not([aria-disabled='true']) { cursor: pointer; }
  [tabindex]:focus-visible { outline: 2px solid var(--k-primary); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    rect { transition: none; }
  }
</style>
