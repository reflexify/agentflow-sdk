<svelte:options customElement={{ shadow: 'open', props: { count: { attribute: 'count', type: 'Number' }, total: { attribute: 'total', type: 'Number' }, label: { attribute: 'label', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } }, extend: (ce) => class extends ce {
  // The bar binds no shortcut of its own, since that would be a key listener on the document; the page binds one to this.
  focus(): void { focusAction(this); }
} }} />

<script module lang="ts">
  import { deepActiveElement, within } from './environment.js';

  const CONTROL = 'button, a[href], input, select, textarea, [role="button"], [tabindex]';
  // A slotted action is a control, or a wrapper around one (a popover's anchor, a tooltip's): its control is the first inside.
  function controlOf(action: Element): HTMLElement {
    return (action.matches(CONTROL) ? action : action.querySelector(CONTROL) ?? action) as HTMLElement;
  }
  const enabled = (control: HTMLElement) => !control.matches(':disabled') && control.getAttribute('aria-disabled') !== 'true';
  const nameOf = (control: HTMLElement) => (control.textContent ?? '').replace(/\s+/g, ' ').trim() || control.getAttribute('aria-label') || control.title;

  function focusAction(host: HTMLElement): void {
    const root = host.shadowRoot;
    for (const action of root?.querySelector('slot')?.assignedElements() ?? []) {
      const control = controlOf(action);
      if (action.hasAttribute('data-overflow') || !enabled(control)) continue;
      control.focus();
      const now = deepActiveElement();
      if (now && within(action, now)) return;
    }
    root?.querySelector<HTMLElement>('[part~="clear"]')?.focus();
  }
</script>

<script lang="ts">
  import { tick, untrack } from 'svelte';
  import { on } from 'svelte/events';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { fill, isVi, kitText } from './text.js';
  import type { KitStrings, MenuItem } from './index.js';

  let { count = 0, total = null, label = null, locale = null, strings = null }: {
    count?: number | null; total?: number | null; label?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const numbers = $derived(new Intl.NumberFormat(isVi(locale) ? 'vi-VN' : 'en-GB'));
  const shown = $derived(Number(count) > 0);
  const counted = $derived(numbers.format(Number(count) || 0));
  const template = $derived(fill(total != null && Number.isFinite(Number(total)) ? text.selectedOfTotal : text.selectedCount, { total: numbers.format(Number(total)) }));
  // The visible sentence holds the count as a pill, where the language puts it: before "selected" in English, after "Đã chọn".
  const pieces = $derived(template.split('{count}'));
  const sentence = $derived(label || fill(template, { count: counted }));

  let bar = $state<HTMLElement | null>(null);
  let actions = $state<HTMLElement | null>(null);
  let more = $state<HTMLElement | null>(null);
  let hasActions = $state(false);
  let hidden = $state.raw<HTMLElement[]>([]);
  let items = $state.raw<MenuItem[]>([]);

  // Svelte draws a custom element's <slot> only when the element already holds content for it as it connects; a native
  // one is there from the start, so actions a page adds later are slotted too.
  const ACTIONS_SLOT = '<slot name="actions"></slot>';
  const width = (el: Element | null) => el?.getBoundingClientRect().width ?? 0;
  const slot = () => actions?.querySelector('slot') ?? null;

  // Every action is shown and measured, and those past the room left beside the menu's button are hidden again, all
  // before the browser paints. While some are hidden the bar takes its whole width, so a wider window resizes it and
  // gives them back.
  function fit() {
    const box = actions;
    const all = (slot()?.assignedElements() ?? []) as HTMLElement[];
    for (const action of all) action.removeAttribute('data-overflow');
    if (!box) return;
    const room = width(box);
    const gap = parseFloat(getComputedStyle(box).columnGap) || 0;
    const widths = all.map(width);
    let keep = all.length;
    if (widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, all.length - 1) > room + 0.5) {
      const budget = room - width(more) - gap;
      let used = 0;
      for (keep = 0; keep < widths.length; keep++) {
        const next = used + (keep ? gap : 0) + widths[keep]!;
        if (next > budget) break;
        used = next;
      }
    }
    hidden = all.slice(keep);
    for (const action of hidden) action.setAttribute('data-overflow', '');
    describe();
  }
  // A hidden action's name and state are read again as its menu opens, since the page may have changed them since.
  function describe() {
    items = hidden.map((action, i) => {
      const control = controlOf(action);
      return { id: String(i), label: nameOf(control), disabled: !enabled(control) };
    });
  }
  function choose(e: Event) {
    if (!(e instanceof CustomEvent)) return;
    const action = hidden[Number((e as CustomEvent<{ id: string }>).detail?.id)];
    if (action) controlOf(action).click();
  }

  let observer: ResizeObserver | null = null;
  function observe() {
    if (!observer || !bar) return;
    observer.disconnect();
    observer.observe(bar);
    for (const action of slot()?.assignedElements() ?? []) observer.observe(action);
  }
  $effect(() => {
    // A module's own jsdom tests may have no ResizeObserver; the bar then fits its actions on each change of them alone.
    if (!bar || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fit());
    observer = ro;
    untrack(observe);
    return () => {
      ro.disconnect();
      observer = null;
    };
  });
  $effect(() => {
    const target = slot();
    if (!target) return;
    const changed = () => {
      hasActions = target.assignedElements().length > 0;
      observe();
      // The actions box is laid out only once it holds an action, so they are measured after it is drawn.
      void tick().then(fit);
    };
    untrack(changed);
    return on(target, 'slotchange', changed);
  });

  $effect(() => {
    const open = shown;
    // Focus left on a hidden action would sit where nothing can be seen; it goes back to the page.
    if (!open) {
      const active = deepActiveElement();
      if (active && within(self, active)) active.blur();
    }
    raise(bar, open, self);
    if (open) untrack(fit);
  });

  // Escape inside the bar asks the page to clear, except where an open overlay inside it, its menu or a slotted popover,
  // takes the key to close itself.
  $effect(() => {
    const el = bar;
    if (!el) return;
    return on(el, 'keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
      for (const node of e.composedPath()) {
        if (node === el) break;
        if (node instanceof HTMLElement && node.dataset.raised === 'true') return;
      }
      emit(self, 'clear', {});
    });
  });
</script>

<KitStyles />
<div class="af-kit">
  <div part="status" role="status" class="live">{shown ? sentence : ''}</div>
  <div part="bar" class="bar" class:wide={hidden.length > 0} popover="manual" bind:this={bar}>
    <span part="text" class="summary">
      {#if label}{label}{:else}{pieces[0]}{#if pieces.length > 1}<span part="count" class="count">{counted}</span>{pieces.slice(1).join(counted)}{/if}{/if}
    </span>
    <div class="tail">
      <div class="actions" class:empty={!hasActions} bind:this={actions}>
        {@html ACTIONS_SLOT}
        {#if shown}
          <af-menu bind:this={more} part="more" class="more" class:idle={hidden.length === 0} items={items} label={text.moreActions}
            locale={locale || undefined} strings={strings ?? undefined} onselect={choose} onpointerdowncapture={describe} onkeydowncapture={describe}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </af-menu>
        {/if}
      </div>
      <button type="button" part="clear" class="af-button ghost sm clear" onclick={() => emit(self, 'clear', {})}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>{text.clearSelection}
      </button>
    </div>
  </div>
</div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's BulkActionBar: a rounded bar 24px above the bottom, centred, in its darkest neutral with white text,
    the count a pill in the card's colour with the dark text, and ghost buttons in three quarters of the text that
    lighten on hover. Neutral 900 is no token, so the bar is the foreground with the surface as its text, and the pill
    the surface with the foreground's: the same contrast, which also holds in the dark, where AgentFlow's turns light.
  - AgentFlow's bar wraps its actions onto a second line; this one keeps one line and moves the actions that do not fit
    into its menu. The bar is as wide as what it holds, up to the window less 1rem each side.
  - The slotted actions are the page's buttons, drawn by the page's kit classes, which no rule here can outrank. They
    inherit the colours they mix from the flat tree, so the tail sets those to the bar's: a ghost button takes its
    text and hover from here. The menu's button is styled through its part.
  - A page's rule outranks a ::slotted rule unless that is important, where the shadow tree's wins, so an action moved
    into the menu is hidden with !important: a kit button's own display would otherwise keep it on the bar.
  - The status is visually hidden and outside the bar, so it is in the tree before the bar appears, and a screen reader
    hears the count change.
-->
<style>
  .live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .bar[popover] { inset: auto 0 24px 0; box-sizing: border-box; width: max-content; max-width: calc(100vw - 2rem); margin: 0 auto; padding: 10px 12px 10px 16px;
    border: 0; border-radius: calc(var(--k-radius) + 4px); background: var(--k-fg); color: var(--k-surface); box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    overflow: visible; }
  .bar[popover]:popover-open { display: flex; align-items: center; gap: 12px; }
  .bar.wide { width: calc(100vw - 2rem); }
  .summary { display: flex; flex: none; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; line-height: 1.5; }
  .count { border-radius: calc(var(--k-radius) - 2px); padding: 2px 8px; background: var(--k-surface); color: var(--k-fg); font-variant-numeric: tabular-nums; }
  .tail { display: flex; flex: 0 1 auto; align-items: center; gap: 8px; min-width: 0; margin-left: auto;
    color: color-mix(in oklab, var(--k-surface) 75%, transparent);
    --k-accent: color-mix(in oklab, var(--k-surface) calc(10% + var(--k-dark, 0) * 10%), transparent); --k-accent-fg: var(--k-surface); }
  .actions { display: flex; flex: 0 1 auto; align-items: center; gap: 8px; min-width: 0; }
  .actions.empty { display: none; }
  .actions :global(::slotted([data-overflow])) { display: none !important; }
  .more { display: block; flex: none; width: 32px; height: 32px; }
  .more.idle { position: absolute; visibility: hidden; pointer-events: none; }
  .more::part(trigger) { width: 32px; height: 32px; padding: 0; color: color-mix(in oklab, var(--k-surface) 75%, transparent); }
  .more::part(trigger):hover { background: color-mix(in oklab, var(--k-surface) 10%, transparent); color: var(--k-surface); }
  button.af-button.sm.clear { gap: 4px; }
</style>
