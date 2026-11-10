<script lang="ts">
  import Prose from './Prose.svelte';
  import { provideProseLinks } from './links.js';
  import { proseOf } from './prose.js';
  import type { MarkdownViewProps } from './types.js';
  import { emit } from '../environment.js';
  import { chipElement, readChip } from '../mention-chip.js';

  let { value, mentions, schemes, text, host }: MarkdownViewProps = $props();
  const blocks = $derived(proseOf(value ?? '', schemes ?? []));

  provideProseLinks({
    activate(href, event) {
      if (!emit(host, 'af-link', { href }, { cancelable: true })) event.preventDefault();
    },
    // The editor's chip, read from the page's map. It links nowhere itself: a press asks the page through `af-link`.
    chip: (ref, label) => (node) => {
      node.replaceChildren(chipElement(ref, { ...readChip(ref, label, mentions?.[ref], 'unresolved'), href: null }, text));
    },
  });
</script>

<div class="md" part="content"><Prose {blocks} /></div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The look is AgentFlow's MarkdownView at its 12.5px root. Lengths are pixels where its Tailwind spacing is rem, and em
    where its sizes are em. Every rule is under `.md`, which outranks the prose's own em-relative rules that the text
    tile keeps.
  - The chip is the editor's: the same markup from `chipElement`, the same rules as the editor's content. A target the
    map does not hold is `unresolved`, muted as a restricted one is but with the token's own label.
  - A chip is a button with nothing of a button's look, so it is a tab stop and Enter or Space presses it.
-->
<style>
  .md { color: var(--k-fg); font-size: 12.5px; line-height: 1.625; }
  .md :global(p) { margin: 4px 0; line-height: 1.625; }
  .md :global(p:first-child) { margin-top: 0; }
  .md :global(p:last-child) { margin-bottom: 0; }
  .md :global(:is(h1, h2, h3, h4, h5, h6)) { font-weight: 600; line-height: 1.625; }
  .md :global(h1) { margin: 8px 0 6px; font-size: 1.12em; }
  .md :global(h2) { margin: 8px 0 4px; font-size: 1.04em; }
  .md :global(:is(h3, h4, h5, h6)) { margin: 6px 0 4px; font-size: 1em; }
  .md :global(:is(ul, ol)) { margin: 4px 0 4px 16px; padding: 0; line-height: 1.625; }
  .md :global(li) { padding-inline-start: 2px; }
  .md :global(li + li) { margin-top: 0; }
  .md :global(li:not(:last-child)) { margin-bottom: 2px; }
  .md :global(strong) { font-weight: 600; }
  .md :global(a) { color: var(--k-primary); text-decoration: underline; }
  .md :global(code) { padding: 2px 4px; border-radius: 4px; background: var(--k-muted-bg);
    font-family: var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 0.92em; }
  .md :global(pre) { margin: 6px 0; padding: 8px; border-radius: 4px; background: var(--k-muted-bg);
    font-family: var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 0.88em; line-height: 1.375; }
  .md :global(pre code) { padding: 0; border-radius: 0; background: none; font-size: 1em; }
  .md :global(blockquote) { margin: 4px 0; padding-inline-start: 8px; border-inline-start: 2px solid var(--k-line); font-style: italic; }
  .md :global(hr) { margin: 8px 0; }
  .md :global(.scroll) { margin: 8px 0; }
  .md :global(table) { font-size: 0.92em; }
  .md :global(table code) { font-size: 1em; }
  .md :global(thead) { background: var(--k-muted-bg); }
  .md :global(:is(th, td)) { padding: 6px 8px; }
  .md :global(button.mention) { display: inline; margin: 0; padding: 0; border: 0; border-radius: 999px; background: none; color: inherit; font: inherit; cursor: pointer; }
  .md :global(button.mention:focus-visible) { outline: 2px solid var(--k-primary); outline-offset: 1px; }
  .md :global(.af-mention) { display: inline-flex; align-items: center; gap: 4px; padding: 0 6px; border-radius: 999px; vertical-align: baseline;
    background: color-mix(in oklab, var(--k-primary) 12%, transparent); color: var(--k-fg); font-size: 0.95em; line-height: 1.5; }
  .md :global(.af-mention:is([data-state='restricted'], [data-state='deleted'], [data-state='unresolved'])) { background: color-mix(in oklab, var(--k-fg) 7%, transparent); color: var(--k-muted); }
  .md :global(.af-mention[data-state='deleted'] .af-mention-label) { text-decoration: line-through; }
  .md :global(.af-mention-avatar) { width: 16px; height: 16px; font-size: 10px; }
</style>
