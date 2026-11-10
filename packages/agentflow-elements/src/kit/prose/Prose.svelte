<script lang="ts">
  import Self from './Prose.svelte';
  import ProseInline from './ProseInline.svelte';
  import Scroller from '../scroll/Scroller.svelte';
  import type { ProseBlock } from './prose.js';

  let { blocks }: { blocks: readonly ProseBlock[] } = $props();
</script>

{#each blocks as block, i (i)}
  {#if block.kind === 'paragraph'}
    <p><ProseInline runs={block.children} /></p>
  {:else if block.kind === 'heading'}
    <svelte:element this={`h${block.level}`}><ProseInline runs={block.children} /></svelte:element>
  {:else if block.kind === 'list'}
    <svelte:element this={block.ordered ? 'ol' : 'ul'} start={block.ordered ? block.start : undefined}>
      {#each block.items as item, n (n)}
        <li class:task={item.checked !== null}>{#if item.checked !== null}<input type="checkbox" disabled checked={item.checked} />{/if}<Self blocks={item.children} /></li>
      {/each}
    </svelte:element>
  {:else if block.kind === 'quote'}
    <blockquote><Self blocks={block.children} /></blockquote>
  {:else if block.kind === 'code'}
    <pre><Scroller axis="horizontal"><code>{block.text}</code></Scroller></pre>
  {:else if block.kind === 'rule'}
    <hr />
  {:else if block.kind === 'plain'}
    <div class="plain">{block.text}</div>
  {:else}
    <div class="scroll"><Scroller axis="horizontal">
      <table>
        <thead>
          <tr>
            {#each block.head as cell, c (c)}<th scope="col" style:text-align={block.align[c] ?? undefined}><ProseInline runs={cell} /></th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each block.rows as row, r (r)}
            <tr>
              {#each row as cell, c (c)}<td style:text-align={block.align[c] ?? undefined}><ProseInline runs={cell} /></td>{/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </Scroller></div>
  {/if}
{/each}

<style>
  p { margin: 4px 0; }
  h1, h2, h3, h4, h5, h6 { margin: 0.5em 0 0.375em; font-weight: 600; line-height: 1.3; }
  h1 { font-size: 1.12em; }
  h2 { font-size: 1.04em; }
  h3, h4, h5, h6 { font-size: 1em; }
  ul, ol { margin: 4px 0; padding-inline-start: 1.25em; }
  ul { list-style: disc; }
  ol { list-style: decimal; }
  li { padding-inline-start: 2px; }
  li + li { margin-top: 2px; }
  li.task { list-style: none; }
  li > :global(p:first-child), blockquote > :global(p:first-child) { margin-top: 0; }
  li > :global(p:last-child), blockquote > :global(p:last-child) { margin-bottom: 0; }
  li.task > :global(p:first-of-type) { display: inline; }
  input { margin: 0 0.4em 0 0; vertical-align: -1px; }
  blockquote { margin: 4px 0; padding-inline-start: 0.5em; border-inline-start: 2px solid var(--k-line); font-style: italic; }
  .plain { margin: 4px 0; white-space: pre-wrap; }
  hr { margin: 0.5em 0; border: 0; border-top: 1px solid var(--k-line); }
  /* The code keeps its own line breaks; the scroller's boxes inside the pre do not add any. */
  pre { margin: 6px 0; padding: 0.5em; border-radius: 4px; background: var(--k-hover); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.88em; line-height: 1.4; white-space: normal; }
  code { white-space: pre; }
  /* The tile breaks a long word anywhere. A table keeps its words whole instead and scrolls, as one with a long cell would. */
  .scroll { max-width: 100%; margin: 8px 0; overflow-wrap: normal; }
  table { width: 100%; border-collapse: collapse; font-size: 0.92em; }
  th, td { padding: 0.375em 0.5em; border-bottom: 1px solid var(--k-line); text-align: start; vertical-align: top; }
  th { font-weight: 600; }
  tbody tr:last-child > * { border-bottom: 0; }
</style>
