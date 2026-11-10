<svelte:options customElement={{ shadow: 'open', props: { size: { attribute: 'size', type: 'Number' }, min: { attribute: 'min', type: 'Number' }, max: { attribute: 'max', type: 'Number' }, orientation: { attribute: 'orientation', type: 'String' }, label: { attribute: 'label', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } }, extend: (ce) => class extends (ce as new () => HTMLElement & { get size(): unknown; set size(value: unknown); attributeChangedCallback(name: string, old: string | null, value: string | null): void }) {
  // Svelte drops a set that repeats the value it holds; here every set of `size` puts the panes back on it, since a drag
  // may have moved them off it.
  get size(): unknown { return super.size; }
  set size(value: unknown) {
    super.size = value;
    (this as unknown as Record<symbol, (() => void) | undefined>)[SIZE_SET]?.();
  }
  attributeChangedCallback(name: string, old: string | null, value: string | null) {
    super.attributeChangedCallback(name, old, value);
    if (name === 'size') (this as unknown as Record<symbol, (() => void) | undefined>)[SIZE_SET]?.();
  }
} }} />

<script module lang="ts">
  // The element's setter calls the component through this key; unregistered, page code cannot reach it.
  const SIZE_SET = Symbol('af-splitter size set');
</script>

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Splitter } from '@ark-ui/svelte/splitter';
  import KitStyles from './KitStyles.svelte';
  import { untrack } from 'svelte';
  import { emit } from './environment.js';
  import type { KitStrings } from './index.js';
  import { kitText } from './text.js';

  let { size = 50, min = 20, max = 80, orientation = 'horizontal', label = null, locale = null, strings = null }: { size?: number | null; min?: number | null; max?: number | null; orientation?: string | null; label?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));

  const numberOr = (value: unknown, fallback: number) => {
    const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  };
  const low = $derived(Math.min(100, Math.max(0, numberOr(min, 20))));
  const high = $derived(Math.min(100, Math.max(low, numberOr(max, 80))));
  const requested = $derived(numberOr(size, 50));
  const clamp = (n: number) => Math.min(high, Math.max(low, n));
  const vertical = $derived(orientation === 'vertical');
  const panels = $derived([{ id: 'start', minSize: low, maxSize: high }, { id: 'end' }]);

  // The panes follow a drag before the page hears of it. Every set of `size` puts them on the page's value, and a new
  // range clamps where they are; neither is reported, being the page's own change.
  let sizes = $state([50, 50]);
  let reported = 50;
  let sets = $state(0);
  // The page's own code runs this, perhaps inside its effect; read tracked, `sets` would become that effect's dependency.
  (self as unknown as Record<symbol, () => void>)[SIZE_SET] = () => { sets = untrack(() => sets) + 1; };
  function place(at: number) {
    sizes = [at, 100 - at];
    reported = at;
  }
  $effect.pre(() => {
    const at = requested;
    void sets;
    untrack(() => place(clamp(at)));
  });
  $effect.pre(() => {
    void low;
    void high;
    untrack(() => place(clamp(sizes[0]!)));
  });

  // Zag calls this when a drag ends and after every key press, the presses that could not move the handle included.
  function settled() {
    const now = sizes[0]!;
    if (Math.abs(now - reported) < 1e-9) return;
    reported = now;
    emit(self, 'size-change', { size: Math.round(now * 100) / 100 });
  }
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <Splitter.Root orientation={vertical ? 'vertical' : 'horizontal'} {panels} keyboardResizeBy={5}
    bind:size={() => sizes, (next) => { if (next) sizes = next; }} onResizeEnd={settled}>
    <Splitter.Panel id="start" part="start"><slot name="start" /></Splitter.Panel>
    <!-- The handle is its own .af-kit for the tokens; the panes hold the page's content in the page's font and colour. -->
    <Splitter.ResizeTrigger id="start:end" part="handle" class="af-kit" type="button" aria-label={label || text.resizeHandle} />
    <Splitter.Panel id="end" part="end"><slot name="end" /></Splitter.Panel>
  </Splitter.Root>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The look is the inbox view's resize handle: 4px across in the border colour, the primary at 40% under the pointer,
    with a 150ms colour transition, dropped under reduced motion. It also keeps that colour while dragged, and draws the
    kit's focus ring.
  - Zag writes the handle's cursor and the panes' flex sizes inline; the rules here only add to them.
  - Flex items paint in order, so the end pane would cover the half of the focus ring that lies over it; the focused or
    dragged handle is lifted above both panes.
  - Forced colours replace the border colour with the canvas, which would hide the handle, so it is drawn in CanvasText.
-->
<style>
  :host { display: flex; min-height: 0; }
  :global([data-scope='splitter'][data-part='root']) { flex: 1 1 auto; min-width: 0; min-height: 0; }
  :global([data-scope='splitter'][data-part='panel']) { min-width: 0; min-height: 0; overflow: hidden; }
  :global([data-scope='splitter'][data-part='resize-trigger']) {
    box-sizing: border-box; width: 4px; margin: 0; padding: 0; border: 0; border-radius: 0; outline: none; appearance: none;
    background-color: var(--k-line); transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  :global([data-scope='splitter'][data-part='resize-trigger'][data-orientation='vertical']) { width: auto; height: 4px; }
  :global([data-scope='splitter'][data-part='resize-trigger']:hover), :global([data-scope='splitter'][data-part='resize-trigger'][data-dragging]) {
    background-color: color-mix(in oklab, var(--k-primary) 40%, transparent);
  }
  :global([data-scope='splitter'][data-part='resize-trigger']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([data-scope='splitter'][data-part='resize-trigger']:focus-visible), :global([data-scope='splitter'][data-part='resize-trigger'][data-dragging]) { position: relative; z-index: 1; }
  @media (prefers-reduced-motion: reduce) { :global([data-scope='splitter'][data-part='resize-trigger']) { transition: none; } }
  @media (forced-colors: active) {
    :global([data-scope='splitter'][data-part='resize-trigger']) { forced-color-adjust: none; background-color: CanvasText; }
    :global([data-scope='splitter'][data-part='resize-trigger']:hover), :global([data-scope='splitter'][data-part='resize-trigger'][data-dragging]) { background-color: Highlight; }
    :global([data-scope='splitter'][data-part='resize-trigger']:focus-visible) { outline: 2px solid CanvasText; outline-offset: 2px; }
  }
</style>
