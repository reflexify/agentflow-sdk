<script lang="ts">
  import Self from './ProseInline.svelte';
  import { proseLinks } from './links.js';
  import type { ProseInline } from './prose.js';

  let { runs }: { runs: readonly ProseInline[] } = $props();
  const links = proseLinks();
</script>

{#each runs as run, i (i)}
  {#if run.kind === 'text'}
    {run.text}
  {:else if run.kind === 'break'}
    <br />
  {:else if run.kind === 'code'}
    <code>{run.text}</code>
  {:else if run.kind === 'link'}
    {#if links}
      <!-- A middle-click opens a link in a new tab through auxclick, not click. -->
      <a href={run.href} target="_blank" rel="noreferrer noopener" onclick={(e) => links.activate(run.href, e)}
        onauxclick={(e) => e.button === 1 && links.activate(run.href, e)}><Self runs={run.children} /></a>
    {:else}
      <a href={run.href} target="_blank" rel="noreferrer"><Self runs={run.children} /></a>
    {/if}
  {:else if run.kind === 'mention'}
    {#if links}
      <!-- The chip drawn into the button is its text. -->
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button type="button" class="mention" onclick={(e) => links.activate(`mention:${run.ref}`, e)} {@attach links.chip(run.ref, run.label)}></button>
    {:else}
      @{run.label}
    {/if}
  {:else if run.kind === 'strong'}
    <strong><Self runs={run.children} /></strong>
  {:else if run.kind === 'em'}
    <em><Self runs={run.children} /></em>
  {:else}
    <del><Self runs={run.children} /></del>
  {/if}
{/each}

<style>
  strong { font-weight: 600; }
  a { color: var(--k-primary); text-decoration: underline; }
  a:focus-visible { border-radius: 2px; outline: 2px solid var(--k-primary); outline-offset: 1px; }
  code { padding: 0 0.25em; border-radius: 0.25em; background: var(--k-hover); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; }
</style>
