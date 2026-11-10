<svelte:options namespace="svg" />

<script lang="ts">
  import type { Focus, Pressable } from './interaction.js';
  import type { PieLayout, SliceMark } from './layout.js';

  let { layout, ids, opens, tab, onkey, onopen }: {
    layout: PieLayout;
    ids: { other: string; restricted: string };
    /** Whether a slice can open records; if not, a slice is an image. */
    opens: boolean;
    tab: Focus | null;
    onkey: (e: KeyboardEvent, mark: Pressable) => void;
    onopen: (mark: Pressable, click: MouseEvent) => void;
  } = $props();

  const fillOf = (slice: SliceMark) => (slice.pattern ? `url(#${ids[slice.pattern]})` : slice.fill || 'var(--k-chart-other)');
  /** A pie is one series, so a slice is the mark of its bucket in series 0. */
  const markOf = (slice: SliceMark): Pressable => ({ bucket: slice.bucket, series: 0, drill: slice.drill });
</script>

<g transform="translate({layout.cx} {layout.cy})">
  {#each layout.slices as slice (slice.bucket)}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (a mark that opens nothing is still a stop for the arrows, and focus brings its tooltip) -->
    <path
      role={opens ? 'button' : 'img'}
      tabindex={tab?.bucket === slice.bucket ? 0 : -1}
      aria-label={slice.summary}
      aria-disabled={opens && !slice.drill ? 'true' : undefined}
      part="slice"
      data-kind="slice"
      data-bucket={slice.bucket}
      data-series="0"
      d={slice.d}
      stroke-width="2"
      stroke-linejoin="round"
      style:fill={fillOf(slice)}
      style:stroke="var(--k-surface)"
      onclick={(e) => onopen(markOf(slice), e)}
      onauxclick={(e) => onopen(markOf(slice), e)}
      onkeydown={(e) => onkey(e, markOf(slice))}
    />
  {/each}
</g>

<style>
  path { outline: none; -webkit-tap-highlight-color: transparent; }
  path[role='button']:not([aria-disabled='true']) { cursor: pointer; }
  path:focus-visible { outline: 2px solid var(--k-primary); outline-offset: 2px; }
</style>
