<svelte:options customElement={{ shadow: 'open', props: { events: { type: 'Array' }, fields: { type: 'Object' }, hasMore: { attribute: 'has-more', type: 'Boolean' }, loading: { attribute: 'loading', type: 'Boolean' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { tick, untrack } from 'svelte';
  import type { ActivityEvent } from '@reflexify/agentflow-sdk';
  import KitStyles from './KitStyles.svelte';
  import { activityLabel, actorName, actorTone, changeLines, hasActivityLabel } from './activity-labels.js';
  import { deepActiveElement, emit } from './environment.js';
  import type { KitStrings } from './index.js';
  import { kitText } from './text.js';
  import { timeFormats } from './time.js';

  let {
    events = null, fields = null, hasMore = false, loading = false, locale = null, strings = null,
  }: {
    events?: ActivityEvent[] | null; fields?: Record<string, string> | null; hasMore?: boolean | null; loading?: boolean | null;
    locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const lines = $derived(Array.isArray(events) ? events : []);

  const clock = $derived(timeFormats(locale));
  const now = $derived.by(() => {
    void lines;
    return Date.now();
  });

  let moreButton = $state<HTMLElement | null>(null);
  let list = $state<HTMLElement | null>(null);
  // A press remembers how many lines the list held and whether the button had focus. When the lines that came leave no button to
  // hold it (the last page), focus goes to the first of them; otherwise it stays on the button, which stays.
  let pressed: { count: number; focused: boolean } | null = null;
  $effect(() => {
    const count = lines.length;
    const busy = !!loading;
    void hasMore;
    const drawn = !!moreButton?.isConnected;
    untrack(() => {
      if (!pressed || busy) return;
      const before = pressed;
      if (count <= before.count && drawn) return;
      pressed = null;
      if (drawn || !before.focused) return;
      tick().then(() => {
        const active = deepActiveElement();
        if (active && active !== document.body) return;
        const first = list?.children[before.count] ?? list?.lastElementChild;
        if (!(first instanceof HTMLElement)) return;
        first.setAttribute('tabindex', '-1');
        first.focus();
      });
    });
  });

  function more() {
    if (loading) return;
    pressed = { count: lines.length, focused: !!moreButton && self.shadowRoot?.activeElement === moreButton };
    emit(self, 'af-activity-more', {});
  }
</script>

<KitStyles />
<div class="af-kit">
  {#if lines.length > 0}
    <ol bind:this={list} class="af-timeline" aria-label={text.activity} aria-busy={loading ? 'true' : undefined}>
      {#each lines as line (line.id)}
        {@const known = hasActivityLabel(line.event_type)}
        {@const changes = changeLines(line.event_type, line.payload, fields, text)}
        {@const tone = actorTone(line.actor?.kind)}
        <li part="item" class="af-timeline-item" data-kind={tone} data-event-id={line.id} data-event-type={line.event_type}>
          <span class="af-timeline-dot" aria-hidden="true"></span>
          <div class="af-timeline-body">
            <div class="af-timeline-text"><b part="actor">{actorName(line.actor, text)}</b>{#if line.via === 'assistant'}{' '}<span class="via">{text.activityViaAssistant}</span>{/if}{#if known}{' '}{:else}<span class="sep" aria-hidden="true">{' · '}</span>{/if}<span part="label">{activityLabel(line.event_type, text, line.payload)}</span></div>
            {#if changes.length > 0}
              <div part="changes" class="changes">{#each changes as change}<div>{change}</div>{/each}</div>
            {/if}
            <time part="time" class="af-timeline-time" datetime={line.occurred_at} title={clock.moment(line.occurred_at)}>{clock.since(line.occurred_at, now)}</time>
          </div>
        </li>
      {/each}
    </ol>
  {:else if loading}
    <p class="loading" role="status"><span class="af-spinner" aria-hidden="true"></span> {text.loading}</p>
  {:else if !hasMore}
    <div class="af-empty"><p class="af-empty-title">{text.activityEmpty}</p></div>
  {/if}
  {#if hasMore}
    <div class="foot">
      <button bind:this={moreButton} type="button" part="more" class="af-button ghost sm more" aria-disabled={loading ? 'true' : undefined} onclick={more}>
        {#if loading}<span class="af-spinner" aria-hidden="true"></span>{/if}{text.loadMore}
      </button>
    </div>
  {/if}
</div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The list is the kit's timeline in the record page's feed: 12.5px text, the changes 11px and 2px under it, the time 11px.
  - The assistant mark is the page's chip: a muted pill of 10.5px type at 500, the foreground at 8% over the surface.
  - A line the kit has no phrase for reads "actor · Activity", the separator hidden from assistive technology.
  - Load more is the pager's ghost button in its 12px type, at the small button's height.
-->
<style>
  :host { display: block; }
  .changes { margin-top: 2px; color: var(--k-muted); font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
  .via { display: inline-block; padding: 1px 6px; border-radius: calc(infinity * 1px); vertical-align: middle;
    background-color: color-mix(in oklab, var(--k-fg) 8%, var(--k-surface)); color: var(--k-muted); font-size: 10.5px; font-weight: 500; line-height: 1.5; }
  .sep { opacity: 0.6; }
  .loading { display: flex; align-items: center; gap: 8px; margin: 0; padding: 16px 0; color: var(--k-muted); font-size: 12.5px; }
  .foot { display: flex; justify-content: center; margin-top: 12px; }
  button.af-button.sm.more { font-size: 12px; line-height: 16px; }
</style>
