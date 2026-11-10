<script lang="ts">
  import { untrack } from 'svelte';
  import { emit } from '../environment.js';
  import type { KitStrings } from '../text.js';
  import Axes from './Axes.svelte';
  import Bars from './Bars.svelte';
  import type { ChartModel } from './chart-model.js';
  import { isPie } from './frame.js';
  import Hatch from './Hatch.svelte';
  import { asksNewTab, clampFocus, holdMiddle, isNavigation, moveFocus, presses, stripDrill } from './interaction.js';
  import type { Focus, Pressable } from './interaction.js';
  import { layoutBars, layoutLines, layoutPie } from './layout.js';
  import type { PanelOptions, Size } from './layout.js';
  import Lines from './Lines.svelte';
  import Pie from './Pie.svelte';
  import type { AfDrillDetail } from './types.js';

  let { model, size, options, hidden, emphasis, active, text, label, host, ontip }: {
    model: ChartModel;
    size: Size;
    /** Set when the plot is one panel among several. */
    options: PanelOptions | undefined;
    hidden: ReadonlySet<number>;
    emphasis: number | null;
    /** The bucket whose tooltip is open on this plot, if the open tooltip is one of its own. */
    active: number | null;
    text: Required<KitStrings>;
    label: string;
    host: HTMLElement;
    ontip: (tip: { bucket: number; anchor: Element } | null) => void;
  } = $props();

  const uid = $props.id();
  const ids = { other: `${uid}-other`, restricted: `${uid}-restricted` };

  let plot = $state<SVGGElement>();
  let focus = $state.raw<Focus | null>(null);
  let seen: ChartModel | null = null;

  const sliced = $derived(isPie(model.type));
  const bars = $derived(model.type === 'bar' || model.type === 'column' ? layoutBars(model, size, hidden, text, options) : null);
  const lines = $derived(model.type === 'line' ? layoutLines(model, size, hidden, text, options) : null);
  const pie = $derived(sliced ? layoutPie(model, size) : null);
  const strips = $derived((lines ?? bars)?.hits ?? []);
  const tab = $derived(clampFocus(focus, model, hidden));
  /** Whether a mark can open records. A tile that opens none draws its marks as images: a button nothing can press is only noise. */
  const opens = $derived(model.drill.enabled);
  const name = $derived(model.unitLabel ? `${label || model.splitLabel} · ${model.unitLabel}` : label || model.splitLabel);

  // A new model is a new result, or new fields or strings for the same one: what was focused is held only where it still exists.
  // Another kind of chart is not the same marks drawn another way, and a bucket's index names a bar in one and a slice in the other, so nothing is held across it.
  $effect.pre(() => {
    const next = model;
    const previous = seen;
    if (next === previous) return;
    seen = next;
    if (!previous) return;
    untrack(() => {
      focus = previous.type === next.type ? clampFocus(focus, next, hidden) : null;
    });
  });

  /** A mark is what holds the roving tab stop: a bucket's strip, its earlier-period twin and its figure carry the bucket too, and none can be focused. */
  const MARK = '[data-bucket][tabindex]';
  const markAt = (e: Event) => (e.target as Element | null)?.closest<SVGElement>(MARK) ?? null;
  /** The mark a bucket's tooltip sits at: the one reaching furthest toward where the tooltip goes, so it never covers the bucket's own marks. */
  function leadOf(bucket: number): Element | null {
    const edge = (el: Element) => {
      const r = el.getBoundingClientRect();
      return model.type === 'bar' ? r.right : -r.top;
    };
    let lead: Element | null = null;
    for (const el of plot?.querySelectorAll(`${MARK}[data-bucket="${bucket}"]`) ?? []) if (!lead || edge(el) > edge(lead)) lead = el;
    return lead;
  }

  function open(mark: Pressable | undefined, press: MouseEvent | KeyboardEvent) {
    if (press instanceof MouseEvent && !presses(press)) return;
    if (mark?.drill) emit<AfDrillDetail>(host, 'af-drill', { ...mark.drill, newTab: asksNewTab(press) });
  }

  function openStrip(bucket: number, click: MouseEvent) {
    const drill = presses(click) ? stripDrill(model, bucket, hidden) : null;
    if (drill) emit<AfDrillDetail>(host, 'af-drill', { ...drill, newTab: asksNewTab(click) });
  }

  /** A middle press on a plot that opens records starts no autoscroll: its `auxclick` on a mark or a strip opens them in a new tab. */
  function middle(node: SVGGElement) {
    const hold = (e: MouseEvent) => {
      if (opens) holdMiddle(e);
    };
    node.addEventListener('mousedown', hold);
    return () => node.removeEventListener('mousedown', hold);
  }

  function aim(e: PointerEvent) {
    const at = (e.target as Element | null)?.closest<SVGElement>('[data-bucket]');
    if (!at) return;
    const bucket = Number(at.dataset.bucket);
    if (active !== bucket) ontip({ bucket, anchor: leadOf(bucket) ?? at });
  }

  function arrive(e: FocusEvent) {
    const mark = markAt(e);
    if (!mark) return;
    const bucket = Number(mark.dataset.bucket);
    focus = { bucket, series: Number(mark.dataset.series) };
    ontip({ bucket, anchor: mark });
  }

  function depart(e: FocusEvent) {
    if (plot && e.relatedTarget instanceof Node && plot.contains(e.relatedTarget)) return;
    ontip(null);
  }

  function key(e: KeyboardEvent, mark: Pressable) {
    if (e.altKey) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(mark, e);
    } else if (isNavigation(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const from = { bucket: mark.bucket, series: mark.series };
      const to = moveFocus(from, e.key, model, hidden);
      if (to !== from) plot?.querySelector<SVGElement>(`${MARK}[data-bucket="${to.bucket}"][data-series="${to.series}"]`)?.focus();
    }
  }
</script>

<div class="panel">
  <svg viewBox="0 0 {size.width} {size.height}">
    <Hatch {ids} />
    {#if lines}
      <Axes layout={lines} horizontal={false} />
    {:else if bars}
      <Axes layout={bars} zero={bars.zero} horizontal={model.type === 'bar'} />
    {/if}
    <g
      part="plot"
      role="group"
      aria-label={name}
      bind:this={plot}
      onpointerover={aim}
      onpointerleave={() => ontip(null)}
      onfocusin={arrive}
      onfocusout={depart}
      {@attach middle}
    >
      {#each strips as strip, bucket (bucket)}
        <rect class="strip" aria-hidden="true" data-bucket={bucket} x={strip.x} y={strip.y} width={strip.width} height={strip.height} onclick={(e) => openStrip(bucket, e)} onauxclick={(e) => openStrip(bucket, e)} />
      {/each}
      {#if lines}
        {#if active !== null}
          <line class="crosshair" x1={lines.bucketX[active]} y1={lines.plot.y} x2={lines.bucketX[active]} y2={lines.plot.y + lines.plot.height} style:stroke="var(--k-chart-axis)" />
        {/if}
        <Lines layout={lines} {opens} {tab} {emphasis} onkey={key} onopen={open} />
      {:else if bars}
        <Bars marks={bars.marks} targets={bars.targets} labels={bars.labels} running={bars.running} {ids} {opens} {tab} {emphasis} onkey={key} onopen={open} />
      {:else if pie}
        <Pie layout={pie} {ids} {opens} {tab} onkey={key} onopen={open} />
      {/if}
    </g>
  </svg>
</div>

<style>
  .panel { position: relative; flex: 1 1 0; min-width: 0; min-height: 0; }
  svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
  .strip { fill: transparent; }
  .crosshair { stroke-width: 1; pointer-events: none; }
</style>
