<script lang="ts">
  import Scroller from '../scroll/Scroller.svelte';

  let { head, rows, label }: { head: string[]; rows: string[][]; label: string } = $props();
</script>

<!-- The box is as tall as the rows and shrinks with the tile, so the verdict and notes stay right beneath the table. -->
<div class="box"><Scroller axis="both" label={label || null}>
  <table part="table">
    {#if label}<caption class="sr">{label}</caption>{/if}
    <thead>
      <tr>
        {#each head as heading, i (i)}<th scope="col">{heading}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, r (r)}
        <tr>
          {#each row as cell, c (c)}
            {#if c === 0}<th scope="row">{cell}</th>{:else}<td>{cell}</td>{/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</Scroller></div>

<style>
  .box { display: flex; flex: 0 1 auto; flex-direction: column; min-height: 0; max-width: 100%; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; }
  th, td { padding: 4px 8px; border-bottom: 1px solid var(--k-line); text-align: end; white-space: nowrap; }
  th { color: var(--k-muted); font-weight: 600; }
  tbody th { color: var(--k-fg); font-weight: 400; }
  td { color: var(--k-fg); }
  th:first-child { text-align: start; }
  tbody tr:last-child > * { border-bottom: 0; }
</style>
