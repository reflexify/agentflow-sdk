<script lang="ts">
  import { emit } from '../environment.js';
  import { chartPanels } from './chart-model.js';
  import ChartView from './ChartView.svelte';
  import { frameModel } from './frame.js';
  import { listModel } from './list.js';
  import ListTable from './ListTable.svelte';
  import Loading from './Loading.svelte';
  import { numberModel } from './number.js';
  import NumberFigure from './NumberFigure.svelte';
  import Prose from '../prose/Prose.svelte';
  import { proseOf } from '../prose/prose.js';
  import Scroller from '../scroll/Scroller.svelte';
  import type { AfPageDetail, TileViewProps } from './types.js';
  import Verdict from './Verdict.svelte';

  let { spec, result, fields, rows, columns, paging, table: chosen, drill, text, locale, host }: TileViewProps = $props();
  // A boolean, so the frame is not made again for each page of rows.
  const listed = $derived(!!rows && !!columns);
  const frame = $derived(frameModel(spec, result, fields, text, locale ?? undefined, listed));
  const figures = $derived(spec && result && frame.state.kind === 'number' ? numberModel(spec, result, fields, text, locale ?? undefined, drill) : null);
  const panels = $derived(spec && result && frame.state.kind === 'chart' ? chartPanels(spec, result, fields, text, locale ?? undefined, drill) : null);
  const body = $derived(frame.state.kind === 'text' && spec?.kind === 'text' ? spec.body : null);
  const prose = $derived(body === null ? null : proseOf(body));
  // A view none of whose columns the reader may read is told so, never shown an empty table.
  const unreadable = $derived(frame.state.kind === 'list' && !!columns && columns.length === 0);
  const list = $derived(frame.state.kind === 'list' && rows && columns?.length ? listModel(rows, columns, fields, text, locale ?? undefined) : null);
  // A host that says which a chart shows draws its own toggle, so the tile draws none; otherwise the tile holds the choice.
  const hosted = $derived(typeof chosen === 'boolean');
  let own = $state(false);
  const table = $derived(hosted ? chosen === true : own);
  const toggle = $derived(!!panels && !panels[0]!.empty && !hosted);

  // A button that is disabled sends no click, but a script can dispatch one, and a page already being read must not be asked for again.
  function turn(direction: AfPageDetail['direction']) {
    if (!paging || paging.busy || !paging[direction]) return;
    emit<AfPageDetail>(host, 'af-page', { direction });
  }
</script>

<div class="frame" part="frame">
  {#if frame.state.kind !== 'loading' && (frame.title || toggle)}
    <div class="head" part="head">
      {#if frame.title}<div class="title" part="title">{frame.title}</div>{/if}
      {#if toggle}
        <button type="button" class="af-button secondary sm toggle" part="table-toggle" onclick={() => (own = !own)}>
          {table ? text.tileShowChart : text.tileShowTable}
        </button>
      {/if}
    </div>
  {/if}
  {#if frame.state.kind === 'loading'}
    <Loading title={frame.title} {text} />
  {:else if frame.state.kind === 'unavailable'}
    <div class="state" part="state">
      <p class="lead">{text.tileUnavailable}</p>
      <p class="hint">{text.tileUnavailableHint}</p>
    </div>
  {:else if frame.state.kind === 'failed'}
    <div class="state" part="state">
      <p class="lead">{frame.state.title}</p>
      {#if frame.state.detail}<p class="hint">{frame.state.detail}</p>{/if}
    </div>
  {:else if prose}
    <div class="prose" part="prose">
      <Scroller label={frame.title || null}><div class="doc"><Prose blocks={prose} /></div></Scroller>
    </div>
  {:else if unreadable}
    <div class="state" part="state"><p class="lead">{text.tileListNoColumns}</p></div>
  {:else if list}
    {#if list.rows.length}
      <ListTable model={list} {drill} {text} label={frame.title} {host} />
    {:else}
      <div class="state" part="state"><p class="lead">{text.tileListEmpty}</p></div>
    {/if}
    {#if paging}
      <nav class="pager" part="pager" aria-label={frame.title || undefined} aria-busy={paging.busy ? 'true' : undefined}>
        <button type="button" class="af-button secondary sm" disabled={!paging.prev || !!paging.busy} onclick={() => turn('prev')}>{text.tilePrevious}</button>
        <button type="button" class="af-button secondary sm" disabled={!paging.next || !!paging.busy} onclick={() => turn('next')}>{text.tileNext}</button>
      </nav>
    {/if}
  {:else if figures}
    <NumberFigure model={figures} {text} {locale} {host} />
  {:else if panels}
    <ChartView {panels} {table} {text} {locale} label={frame.title} {host} />
  {:else}
    <div class="state" part="state"><p class="lead">{text.tileNotDrawn}</p></div>
  {/if}
  {#if frame.verdict}<Verdict model={frame.verdict} />{/if}
  {#if frame.notes.length}
    <ul class="notes" part="notes">
      {#each frame.notes as note, i (i)}<li>{note}</li>{/each}
    </ul>
  {/if}
</div>

<!-- Every scroll region of the tile (the list, the data table, a prose table or code block, the text body) shows focus as
  the tile always has, a solid outline in the primary, drawn inside the region, where its frame or the body's own
  viewport cannot cut it off. -->
<style>
  .frame { display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; height: 100%; min-height: 0; min-width: 0; overflow: auto; padding: 12px 16px; border: 1px solid var(--k-line);
    border-radius: var(--k-radius); background: var(--k-surface); font-size: 14px; line-height: 20px; scrollbar-width: thin; scrollbar-color: var(--k-line) transparent; }
  /* The frame's last-resort scroll, for a host card shorter than the figure's floors, is the browser's own, drawn thin in the
     kit's line colour: the kit's scroller on every tile cost WebKit about six seconds more to draw a page of forty tiles (9.0 s
     against 3.0 s in the gallery), for a case a page rarely meets. It is the one exception test/kit/no-plain-scroll.test.ts names. */
  .frame::-webkit-scrollbar { width: 10px; height: 10px; }
  .frame::-webkit-scrollbar-thumb { border: 1px solid transparent; border-radius: 999px; background-clip: padding-box; background-color: var(--k-line); }
  .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .title { flex: 1 1 auto; min-width: 0; overflow: hidden; font-size: 13px; font-weight: 600; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
  .toggle { flex: none; margin-inline-start: auto; }
  .pager { display: flex; flex: none; justify-content: flex-end; gap: 8px; }
  .state { position: relative; display: grid; gap: 4px; padding: 16px 0; }
  .state p { margin: 0; }
  .lead { font-weight: 500; }
  .hint { color: var(--k-muted); font-size: 12px; line-height: 18px; }
  .prose { display: flex; flex: 1 1 auto; flex-direction: column; min-height: 0; overflow-wrap: anywhere; }
  .frame :global([data-scope='scroll-area'][data-part='viewport']:focus-visible) { outline: 2px solid var(--k-primary); outline-offset: -2px; box-shadow: none; }
  .notes { display: grid; gap: 2px; margin: 0; padding: 8px 0 0; border-top: 1px solid var(--k-line); list-style: none; color: var(--k-muted);
    font-size: 12px; line-height: 18px; }
</style>
