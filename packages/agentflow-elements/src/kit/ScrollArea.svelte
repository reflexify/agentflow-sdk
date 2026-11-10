<svelte:options customElement={{ shadow: 'open', props: { axis: { attribute: 'axis', type: 'String' }, label: { attribute: 'label', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } }, extend: (ce) => class extends ce {
  // The element that scrolls crosses the shadow boundary on purpose: a virtualised list, auto-scroll and a restored
  // scroll position all need it.
  get viewport(): HTMLElement | null { return this.shadowRoot?.querySelector<HTMLElement>('[data-scope="scroll-area"][data-part="viewport"]') ?? null; }
} }} />

<script lang="ts">
  import KitStyles from './KitStyles.svelte';
  import Scroller from './scroll/Scroller.svelte';
  import type { KitStrings } from './index.js';

  let { axis = 'vertical', label = null }: { axis?: string | null; label?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const shown = $derived(axis === 'horizontal' || axis === 'both' ? axis : 'vertical');
</script>

<KitStyles />
<div class="af-kit">
  <Scroller axis={shown} label={label || null} contentPart><slot /></Scroller>
</div>

<!-- The scroll area holds the page's own content, so the text inside takes the page's font and colour, not the kit's. -->
<style>
  :host { display: block; min-height: 0; }
  .af-kit { display: flex; flex-direction: column; box-sizing: border-box; height: 100%; max-height: inherit; color: inherit; font: inherit; }
</style>
