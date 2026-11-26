<svelte:options customElement={{ shadow: 'open', props: { source: { type: 'Object' }, steps: { type: 'Array' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { untrack } from 'svelte';
  import type { RunFollowItem } from '@reflexify/agentflow-sdk';
  import KitStyles from './KitStyles.svelte';
  import { emit } from './environment.js';
  import type { KitStrings } from './index.js';
  import { announcements, drawStream, outcomeText, readerOf, type DrawnStep, type RunDoneDetail, type RunFollowDetail, type RunSourceSnapshot, type RunStreamStep } from './run-stream.js';
  import { fill, kitText } from './text.js';

  let { source = null, steps = null, locale = null, strings = null }: {
    source?: AsyncIterable<RunFollowItem> | null; steps?: RunStreamStep[] | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  let snapshot = $state.raw<RunSourceSnapshot | null>(null);
  const view = $derived(snapshot ? drawStream(snapshot, Array.isArray(steps) ? steps : null, text, locale) : null);
  let spoken = $state.raw<string[]>([]);
  let said = new Set<string>();
  // Each announcement is drawn as new nodes, so one that reads as the one before is still a change a screen reader hears.
  let told = $state(0);

  // One reader per source, shared by every drawing of it, so a moved element neither reads the source twice nor loses an
  // item. Frames are folded as they arrive and drawn once a frame: 60 deltas a second redraw at most 60 times.
  $effect(() => {
    const src = source;
    if (!src || typeof (src as Partial<AsyncIterable<unknown>>)[Symbol.asyncIterator] !== 'function') {
      snapshot = null;
      return;
    }
    const reader = readerOf(src);
    const first = reader.snapshot;
    // What the reader held before this drawing is not news: it was said where it was drawn first.
    said = new Set();
    untrack(() => announcements(drawStream(first, null, text, locale), said, text));
    spoken = [];
    let doneSent = !!first.follow && first.state.runs[first.follow]?.status !== 'running' && !!first.state.runs[first.follow];
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const draw = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      timer = undefined;
      snapshot = reader.snapshot;
    };
    const off = reader.subscribe((item) => {
      if (item?.type === 'follow.ended' || item?.type === 'follow.refused' || item?.type === 'follow.lagged') {
        const detail: RunFollowDetail = item.type === 'follow.refused' ? { state: 'refused', reason: item.reason } : { state: item.type === 'follow.ended' ? 'ended' : 'lagged' };
        emit(self, 'af-run-follow', detail);
      }
      const now = reader.snapshot;
      const ended = now.follow ? now.state.runs[now.follow] : undefined;
      if (!doneSent && ended && ended.status !== 'running') {
        doneSent = true;
        emit<RunDoneDetail>(self, 'af-run-done', { status: ended.status });
      }
      // A hidden tab runs no animation frame, so the timer draws it anyway.
      if (!timer) {
        frame = requestAnimationFrame(draw);
        timer = setTimeout(draw, 100);
      }
    });
    snapshot = first;
    return () => {
      off();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  });

  $effect(() => {
    const now = view;
    if (!now) return;
    const lines = untrack(() => announcements(now, said, text));
    if (lines.length > 0) {
      spoken = lines;
      untrack(() => (told += 1));
    }
  });

  const stateWord = (step: DrawnStep) => (step.status === 'running' ? text.runStreamRunning : step.status === 'done' ? text.runStreamDone : text.runStreamStopped);
</script>

{#snippet list(items: DrawnStep[], label: string | undefined)}
  <ol class="steps" aria-label={label}>
    {#each items as step (step.key)}
      <li part="step" class="step" data-status={step.status}>
        <span class="marker" aria-hidden="true">{#if step.status === 'running'}<span class="af-spinner"></span>{:else}<span class="dot"></span>{/if}</span>
        <div class="body">
          <div class="head"><span part="title" class="title">{step.title}</span><span part="state" class="state">{stateWord(step)}</span></div>
          {#if step.activity}<div part="activity" class="activity">{step.activity}</div>{/if}
          {#if step.text !== null}
            <af-markdown part="words" class="words" value={step.text} locale={locale || undefined} strings={strings ?? undefined}></af-markdown>
          {/if}
          {#if step.items}
            <p part="items" class="items"><span class="count">{fill(text.runStreamItems, { count: step.items.total })}</span> {fill(text.runStreamItemsState, step.items)}</p>
          {:else}
            {#each step.runs as run (run.run)}
              <div part="child" class="child" data-status={run.status}>
                {#if run.item !== null}<div part="item" class="item">{fill(text.runStreamItem, { n: run.item + 1 })}</div>{/if}
                {@render list(run.steps, undefined)}
              </div>
            {/each}
          {/if}
        </div>
      </li>
    {/each}
  </ol>
{/snippet}

<KitStyles />
<div class="af-kit run">
  {#if snapshot?.ended === 'refused' && !view?.root}
    <p part="note" class="note">{text.runStreamUnavailable}</p>
  {:else if view && !view.root && view.loose.length === 0 && !snapshot?.ended}
    <p part="note" class="note"><span class="af-spinner" aria-hidden="true"></span> {text.runStreamWaiting}</p>
  {/if}
  {#if view?.root && view.root.steps.length > 0}{@render list(view.root.steps, text.runStream)}{/if}
  {#each view?.loose ?? [] as run (run.run)}
    <div part="child" class="child loose" data-status={run.status}>{@render list(run.steps, undefined)}</div>
  {/each}
  {#if view?.outcome}
    <p part="outcome" class="outcome" data-status={view.outcome}>{outcomeText(view.outcome, text)}</p>
  {/if}
  <div part="status" role="status" class="live">{#key told}{#each spoken as line}<p>{line}</p>{/each}{/key}</div>
</div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - A step is the kit's timeline row: an 11px marker on a 1px line that runs to the next marker, the title at 13px and 500, its
    state, activity and item counts 11.5px and muted. A running step's marker is the kit's spinner, which kit.css stills under
    prefers-reduced-motion; nothing else here moves.
  - Done is the success tone, stopped the warning tone, and the outcome takes the same tones, all from the --af-* tokens.
  - The words wrap anywhere and the rows shrink to their container, so the element fits 375px with no horizontal scroll.
  - The live region is visually hidden: it says each step's end and the run's end, never a word.
-->
<style>
  :host { display: block; min-width: 0; }
  .run { min-width: 0; font-size: 13px; line-height: 1.45; color: var(--k-fg); }
  .steps { margin: 0; padding: 0; list-style: none; }
  .step { position: relative; display: flex; gap: 10px; padding-bottom: 12px; min-width: 0; }
  .step:last-child { padding-bottom: 0; }
  .step:not(:last-child)::before { content: ""; position: absolute; top: 18px; bottom: 0; inset-inline-start: 7px; width: 1px; background-color: var(--k-line); }
  .marker { display: grid; flex: none; place-items: center; width: 16px; height: 18px; color: var(--k-primary); }
  .marker .af-spinner { width: 14px; height: 14px; }
  .dot { width: 9px; height: 9px; border-radius: calc(infinity * 1px); background-color: var(--k-muted); box-shadow: 0 0 0 3px var(--k-surface); }
  .step[data-status="done"] > .marker .dot { background-color: var(--k-success); }
  .step[data-status="stopped"] > .marker .dot { background-color: var(--k-warning); }
  .body { flex: 1 1 0%; min-width: 0; }
  .head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; min-width: 0; }
  .title { min-width: 0; font-weight: 500; overflow-wrap: anywhere; }
  .state, .activity, .items, .item, .note { color: var(--k-muted); font-size: 11.5px; }
  .activity { margin-top: 2px; overflow-wrap: anywhere; }
  .words { display: block; margin-top: 6px; padding: 8px 10px; border-radius: max(0px, calc(var(--k-radius) - 2px)); min-width: 0;
    background-color: color-mix(in oklab, var(--k-fg) 4%, var(--k-surface)); overflow-wrap: anywhere; }
  .items { margin: 6px 0 0; }
  .items .count { color: var(--k-fg); font-weight: 500; }
  .child { margin-top: 8px; padding-inline-start: 10px; border-inline-start: 1px solid var(--k-line); min-width: 0; }
  .child.loose { margin-top: 12px; }
  .item { margin-bottom: 4px; font-weight: 500; }
  .note { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; }
  .outcome { margin: 12px 0 0; padding: 6px 10px; border-radius: max(0px, calc(var(--k-radius) - 2px)); font-weight: 500;
    background-color: color-mix(in oklab, var(--k-muted) 10%, var(--k-surface)); }
  .outcome[data-status="completed"] { background-color: color-mix(in oklab, var(--k-success) 12%, var(--k-surface)); color: color-mix(in oklab, var(--k-success) 75%, var(--k-fg)); }
  .outcome[data-status="failed"] { background-color: color-mix(in oklab, var(--k-danger) 10%, var(--k-surface)); color: var(--k-danger); }
  .live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .live p { margin: 0; }
</style>
