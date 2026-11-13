<script lang="ts">
  import { emit } from '../environment.js';
  import { initial, RECORD_ICON_PATH } from '../mention-chip.js';
  import { fill } from '../text.js';
  import type { KitStrings } from '../text.js';
  import Scroller from '../scroll/Scroller.svelte';
  import { asksNewTab, presses } from './interaction.js';
  import { NO_VALUE } from './list.js';
  import type { ListCell, ListModel } from './list.js';
  import type { AfOpenRecordDetail } from './types.js';

  let { model, drill, text, label, host }: {
    model: ListModel;
    drill: boolean;
    text: Required<KitStrings>;
    label: string;
    host: HTMLElement;
  } = $props();

  /**
   * One listener for every row, on the body. A click on a cell, on the row or on the button in its first cell reaches it
   * the same way, and Enter or Space on the button is that button's click, so the keyboard and the pointer send one event each.
   * A middle click is an `auxclick`, which opens the row in a new tab as it would a link, and its press starts no autoscroll.
   */
  function opening(body: HTMLElement) {
    const rowOf = (event: Event) => (event.target instanceof Element ? event.target.closest<HTMLElement>('tr[data-record]') : null);
    const onclick = (event: MouseEvent) => {
      const row = presses(event) ? rowOf(event) : null;
      if (row?.dataset.record && row.dataset.entity) emit<AfOpenRecordDetail>(host, 'af-open-record', { record: row.dataset.record, entity: row.dataset.entity, newTab: asksNewTab(event) });
    };
    const onmousedown = (event: MouseEvent) => {
      if (event.button === 1 && rowOf(event)) event.preventDefault();
    };
    body.addEventListener('click', onclick);
    body.addEventListener('auxclick', onclick);
    body.addEventListener('mousedown', onmousedown);
    return () => {
      body.removeEventListener('click', onclick);
      body.removeEventListener('auxclick', onclick);
      body.removeEventListener('mousedown', onmousedown);
    };
  }

  // An option's colour as the badge wears it: tinted, with the text and the edge drawn from the same colour, over the surface and the ink of the page it is on.
  const tone = (color: string, share: number, base: string) => `color-mix(in oklab, ${color} ${share}%, ${base})`;

  // Said once for a table: the heading of the column the buttons are in, for a row whose first cell has no words to name its button.
  const openName = $derived(fill(text.tileOpenRecord, { label: model.head[0] ?? '' }));
</script>

{#snippet drawn(cell: ListCell)}
  {#if cell.kind === 'options'}
    <span class="chips">
      {#each cell.options as option, o (o)}
        {#if option.color}
          <span part="badge" class="af-chip" style:background-color={tone(option.color, 14, 'var(--k-surface)')} style:color={tone(option.color, 70, 'var(--k-fg)')} style:border-color={tone(option.color, 35, 'var(--k-surface)')}>{option.label}</span>
        {:else}
          <span part="badge" class="af-chip neutral">{option.label}</span>
        {/if}
      {/each}
    </span>
  {:else if cell.kind === 'boolean'}
    {#if cell.value}
      <svg class="mark check" viewBox="0 0 16 16" width="14" height="14" role="img" aria-label={cell.text}><path d="M3 8.5l3.2 3.2L13 4.5" /></svg>
    {:else}
      <span class="mark none" role="img" aria-label={cell.text}>—</span>
    {/if}
  {:else if cell.kind === 'refs'}
    <span class="chips">
      {#each cell.refs as ref, r (r)}
        <span part="ref" class="af-chip neutral" class:raw={!ref.resolved}>{ref.label}</span>
      {/each}
    </span>
  {:else if cell.kind === 'file'}
    <span class="chips">
      <span part="file" class="af-chip outline" class:unavailable={cell.unavailable}>
        <svg class="icon clip" viewBox="0 0 24 24" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
        <span class="name">{cell.name}</span>
      </span>
      {#if cell.more > 0}<span class="more">+{cell.more}</span>{/if}
    </span>
  {:else if cell.kind === 'rich'}
    {#each cell.parts as piece, p (p)}
      {#if 'mention' in piece}
        <!-- A chip here is words, never a link: the row it sits in opens its record. -->
        <span part="mention" class="mention" data-kind={piece.mention.kind} data-state={piece.mention.state}>
          {#if piece.mention.state !== 'restricted' && piece.mention.kind === 'user'}
            <span class="af-avatar mention-avatar" aria-hidden="true">{initial(piece.mention.label)}</span>
          {:else if piece.mention.state !== 'restricted' && piece.mention.kind === 'record'}
            <svg part="mention-icon" class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d={RECORD_ICON_PATH} /></svg>
          {/if}
          <span class="label">{piece.mention.label}</span>
        </span>
      {:else}
        {piece.text}
      {/if}
    {/each}
  {:else if cell.kind === 'number' && cell.bar}
    <span class="bar">
      <span class="track" aria-hidden="true"><span class="fill" style:width="{cell.bar.percent}%" style:background-color={cell.bar.color ?? undefined}></span></span>
      <span class="figure">{cell.text}</span>
    </span>
  {:else if cell.kind === 'number' && cell.rating}
    <span class="rating">{cell.text}</span>
  {:else}
    {cell.text}
  {/if}
{/snippet}

<div class="ring">
<Scroller axis="both" label={label || null}>
  <table part="list" class:open={drill}>
    {#if label}<caption class="sr">{label}</caption>{/if}
    <thead>
      <tr>
        {#each model.head as heading, i (i)}<th scope="col">{heading}</th>{/each}
      </tr>
    </thead>
    <tbody {@attach drill ? opening : undefined}>
      {#each model.rows as row (row.key)}
        {@const opens = drill && row.record !== '' && row.entity !== ''}
        <tr data-record={opens ? row.record : undefined} data-entity={opens ? row.entity : undefined}>
          {#each row.cells as cell, c (c)}
            <td>{#if opens && c === 0}<button type="button" aria-label={cell.text === NO_VALUE ? openName : undefined}>{@render drawn(cell)}</button>{:else}{@render drawn(cell)}{/if}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</Scroller>
</div>

<style>
  /* The region's focus ring is drawn over it by a box that does not scroll, inside the region's edge. Outside the edge, a
     host that takes the frame's padding away, as a dashboard card does, leaves it no room, and the frame scrolls, so it
     would be cut off; as the viewport's own outline, inset, the sticky header row paints over its top, isolated viewport or
     not. Isolated, so the ring rises above nothing outside the tile. */
  .ring { position: relative; isolation: isolate; display: flex; flex: 1 1 auto; flex-direction: column; min-height: 0; min-width: 0; max-width: 100%; }
  .ring > :global([data-scope='scroll-area'][data-part='root'] > [data-part='viewport']:focus-visible) { outline: none; box-shadow: none; }
  .ring:has(:global([data-scope='scroll-area'][data-part='viewport']:focus-visible))::after { content: ''; position: absolute; inset: 0; z-index: 1; border: 2px solid var(--k-primary); pointer-events: none; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; line-height: 18px; }
  th, td { padding: 4px 8px; border-bottom: 1px solid var(--k-line); text-align: start; white-space: nowrap; }
  th { position: sticky; top: 0; border-bottom: 0; background: var(--k-surface); box-shadow: inset 0 -1px 0 var(--k-line); color: var(--k-muted); font-weight: 600; }
  td { color: var(--k-fg); }
  tbody tr:last-child > td { border-bottom: 0; }
  .open tbody tr[data-record] { cursor: pointer; }
  @media (hover: hover) { .open tbody tr[data-record]:hover { background: var(--k-hover); } }
  button { margin: 0; padding: 0; border: 0; border-radius: 2px; background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  @media (hover: hover) { button:hover { text-decoration: underline; text-decoration-color: var(--k-muted); text-underline-offset: 3px; } }
  button:focus-visible { outline: 2px solid var(--k-primary); outline-offset: 2px; }
  .chips { display: inline-flex; align-items: center; gap: 4px; vertical-align: middle; }
  /* A badge at the table's own density, so a row with one is no taller than a row with none. */
  .af-chip { padding-block: 0; }
  .mark { display: inline-block; vertical-align: middle; }
  .check { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; color: var(--k-success); }
  .none { color: var(--k-muted); }
  .bar { display: flex; align-items: center; gap: 8px; min-width: 7.5rem; }
  .track { flex: 1 1 auto; height: 5px; overflow: hidden; border-radius: 999px; background: color-mix(in oklab, var(--k-fg) 12%, var(--k-surface)); }
  .fill { display: block; height: 100%; border-radius: 999px; background: color-mix(in oklab, var(--k-fg) 40%, var(--k-surface)); }
  .figure { flex: none; min-width: 3.5rem; text-align: end; font-variant-numeric: tabular-nums; }
  .rating { color: var(--k-warning); }
  /* An id the server named no record for, and a file it named no file for, are chips in the muted ink. */
  .af-chip.raw, .af-chip.unavailable { --k-chip-fg: var(--k-muted); }
  .icon { flex: none; width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2; }
  .clip { stroke-linecap: round; stroke-linejoin: round; }
  .more { flex: none; color: var(--k-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
  /* The chip the editor draws for a mention, at the table's density. */
  .mention { display: inline-flex; align-items: center; gap: 4px; padding: 0 6px; border-radius: 999px; vertical-align: middle;
    background: color-mix(in oklab, var(--k-primary) 12%, transparent); color: var(--k-fg); font-size: 0.95em; }
  .mention[data-state='restricted'], .mention[data-state='deleted'] { background: color-mix(in oklab, var(--k-fg) 7%, transparent); color: var(--k-muted); }
  .mention[data-state='deleted'] .label { text-decoration: line-through; }
  .mention-avatar { width: 16px; height: 16px; font-size: 10px; line-height: 16px; }
</style>
