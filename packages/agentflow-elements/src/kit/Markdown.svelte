<svelte:options customElement={{ shadow: 'open', props: { value: { attribute: 'value', type: 'String' }, mentions: { type: 'Object' }, schemes: { type: 'Array' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import type { Component } from 'svelte';
  import type { ResolvedMention } from '@reflexify/agentflow-sdk';
  import KitStyles from './KitStyles.svelte';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';
  import type { MarkdownViewProps } from './prose/types.js';

  let { value = null, mentions = null, schemes = null, locale = null, strings = null }: {
    value?: string | null; mentions?: Record<string, ResolvedMention> | null; schemes?: string[] | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  let View = $state.raw<Component<MarkdownViewProps> | null>(null);
  let failed = $state(false);

  // The parser and the view load on first use, as the tile's do, so a page without Markdown never loads them. A chunk
  // that cannot load (a redeploy, the network gone) leaves the person's text shown as it was written, and the next
  // connect tries again.
  $effect(() => {
    let live = true;
    import('./prose/markdown-view.js').then(
      (loaded) => {
        if (live) View = loaded.default;
      },
      () => {
        if (live) failed = true;
      },
    );
    return () => {
      live = false;
    };
  });
</script>

<KitStyles />
<div class="af-kit">
  {#if View}
    <View {value} {mentions} {schemes} {text} host={self} />
  {:else if failed}
    <div part="content" class="plain">{value ?? ''}</div>
  {:else}
    <div part="content" aria-busy="true"></div>
  {/if}
</div>

<style>
  :host { display: block; }
  .plain { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
