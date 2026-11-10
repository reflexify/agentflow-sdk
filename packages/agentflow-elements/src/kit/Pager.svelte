<svelte:options customElement={{ shadow: 'open', props: { mode: { attribute: 'mode', type: 'String' }, hasPrev: { attribute: 'has-prev', type: 'Boolean' }, hasNext: { attribute: 'has-next', type: 'Boolean' }, hasMore: { attribute: 'has-more', type: 'Boolean' }, busy: { attribute: 'busy', type: 'Boolean' }, pageSize: { attribute: 'page-size', type: 'Number' }, pageSizes: { type: 'Array' }, rangeStart: { attribute: 'range-start', type: 'Number' }, rangeEnd: { attribute: 'range-end', type: 'Number' }, total: { attribute: 'total', type: 'Number' }, shown: { attribute: 'shown', type: 'Number' }, focusNew: { attribute: 'focus-new', type: 'Boolean' }, controls: { attribute: 'controls', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { untrack } from 'svelte';
  import KitStyles from './KitStyles.svelte';
  import { deepActiveElement, emit } from './environment.js';
  import type { KitStrings } from './index.js';
  import { fill, isVi, kitText } from './text.js';

  let {
    mode = 'pages', hasPrev = false, hasNext = false, hasMore = false, busy = false, pageSize = null, pageSizes = null,
    rangeStart = null, rangeEnd = null, total = null, shown = null, focusNew = false, controls = null, locale = null, strings = null,
  }: {
    mode?: string | null; hasPrev?: boolean | null; hasNext?: boolean | null; hasMore?: boolean | null; busy?: boolean | null;
    pageSize?: number | null; pageSizes?: number[] | null; rangeStart?: number | null; rangeEnd?: number | null; total?: number | null;
    shown?: number | null; focusNew?: boolean | null; controls?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));

  const numberOf = (value: unknown): number | null => {
    const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    return typeof n === 'number' && Number.isFinite(n) ? n : null;
  };
  // The numbers follow the words' language, as the number input's do, not the browser's.
  const numbers = $derived(new Intl.NumberFormat(isVi(locale) ? 'vi-VN' : 'en-GB'));
  const format = (n: number) => numbers.format(n);

  const more = $derived(mode === 'more');
  const start = $derived(numberOf(rangeStart));
  const end = $derived(numberOf(rangeEnd));
  const all = $derived(numberOf(total));
  const count = $derived(numberOf(shown));
  const size = $derived(numberOf(pageSize));
  const sizes = $derived((pageSizes ?? []).map(numberOf).filter((n): n is number => n !== null));

  const range = $derived(start === null || end === null ? ''
    : fill(all === null ? text.pageRangeOpen : text.pageRange, { start: format(start), end: format(end), total: all === null ? '' : format(all) }));
  const shownText = $derived(count === null ? ''
    : fill(all === null ? text.shownOnly : text.shownOf, { shown: format(count), total: all === null ? '' : format(all) }));
  const drawn = $derived(more ? !!hasMore || count !== null : !!hasPrev || !!hasNext || range !== '');
  const prevLocked = $derived(!hasPrev || !!busy);
  const nextLocked = $derived(!hasNext || !!busy);

  // A press waits for its load to end. Rows that arrived are announced, counted from `shown` at the press (none when it
  // was unset); a load that ends without rows, as `busy` falls after rising or `hasMore` turns false, is forgotten. Each
  // property set flushes on its own, so a page setting `busy`, `shown` and `hasMore` one after another would show the
  // effect each step; the decision is taken at the first microtask after the first of them and reads all three as they
  // then stand, so a page that sets them one after another with no await between is read once.
  let status = $state('');
  // Each announcement is a node of its own, so one whose text equals the last is still a change a screen reader hears.
  let said = $state(0);
  let pending = false;
  let base = 0;
  let sawBusy = false;
  let deciding = false;
  let moreButton = $state<HTMLElement | null>(null);
  let statusPart = $state<HTMLElement | null>(null);
  $effect(() => {
    void count;
    void hasMore;
    const loading = !!busy;
    untrack(() => {
      if (!pending) return;
      if (loading) sawBusy = true;
      if (!deciding) {
        deciding = true;
        queueMicrotask(decide);
      }
    });
  });

  function decide() {
    deciding = false;
    if (!pending) return;
    const now = count;
    const more = !!hasMore;
    if (now !== null && now > base) {
      pending = false;
      status = fill(text.moreLoaded, { count: format(now - base) });
      said += 1;
      placeFocus(now - base);
    } else if (!busy && (sawBusy || !more)) {
      pending = false;
      placeFocus(0);
    }
  }

  // Focus moves only while it is still the pager's. With `focus-new`, rows that arrived take it from Load more or from the
  // page. Otherwise, and after a load without rows, it moves only once Load more is gone and focus has fallen to the page.
  // It goes to the first row that arrived, or to the status when there is no such row, never to the page.
  function placeFocus(arrived: number) {
    const active = deepActiveElement();
    const onPage = !active || active === document.body;
    const drawn = !!moreButton?.isConnected;
    const onButton = drawn && active === moreButton;
    const row = arrived > 0 ? arrivedRow() : null;
    if (arrived > 0 && focusNew && controls && (onButton || onPage)) focusOn(row ?? statusPart);
    else if (onPage && !drawn) focusOn(row ?? statusPart);
  }

  function focusOn(target: HTMLElement | SVGElement | null) {
    if (!target?.isConnected) return;
    if (!target.hasAttribute('tabindex') && target.tabIndex < 0) target.setAttribute('tabindex', '-1');
    target.focus();
  }

  function listOf(id: string | null | undefined): HTMLElement | null {
    if (!id) return null;
    const root = self.getRootNode() as Partial<Document | ShadowRoot>;
    return (typeof root.getElementById === 'function' ? root as Document | ShadowRoot : document).getElementById(id);
  }

  // The rows the list held at the press, so the first row that arrived is found wherever the page put it: before a foot
  // row or a loading row that stays last, or in the middle.
  let before: Set<Element> | null = null;
  function arrivedRow(): HTMLElement | SVGElement | null {
    const list = listOf(controls);
    if (!list || !before) return null;
    const first = [...list.children].find((child) => !before!.has(child));
    return first instanceof HTMLElement || first instanceof SVGElement ? first : null;
  }

  // An id names an element only inside its own tree, and the buttons are in the shadow root, so their `aria-controls`
  // reaches nothing for assistive technology. Element reflection crosses the boundary; the attribute stays for the page's
  // own tooling. The list may be drawn after the pager, so the link is renewed on focus and on a press as well.
  type Reflecting = HTMLButtonElement & { ariaControlsElements: Element[] | null };
  function linkButtons() {
    const list = listOf(controls);
    for (const button of self.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[part="prev"], button[part="next"], button[part="more"]') ?? []) {
      if ('ariaControlsElements' in button) (button as Reflecting).ariaControlsElements = list ? [list] : null;
    }
  }
  $effect(() => {
    void [controls, drawn, more, hasMore];
    linkButtons();
  });

  function press(locked: boolean, type: 'prev' | 'next' | 'more') {
    linkButtons();
    if (locked) return;
    if (type === 'more') {
      before = new Set(listOf(controls)?.children ?? []);
      pending = true;
      base = count ?? 0;
      sawBusy = false;
      status = '';
    }
    emit(self, type, {});
  }

  function pick(e: Event) {
    const value = numberOf((e as CustomEvent<{ value: unknown }>).detail?.value);
    if (value !== null) emit(self, 'page-size-change', { pageSize: value });
  }
</script>

<KitStyles />
{#if drawn}
  <div class="af-kit row" onfocusin={linkButtons}>
    {#if more}
      {#if shownText}<span class="note">{shownText}</span>{/if}
      {#if hasMore}
        <button bind:this={moreButton} type="button" part="more" class="af-button ghost sm more" aria-controls={controls || undefined}
          aria-disabled={busy ? 'true' : undefined} onclick={() => press(!!busy, 'more')}>
          {#if busy}<span class="af-spinner" aria-hidden="true"></span>{/if}{text.loadMore}
        </button>
      {/if}
    {:else}
      {#if size !== null && sizes.length > 0}
        <div part="page-size" class="size">
          <span class="note" aria-hidden="true">{text.rowsPerPage}</span>
          <af-select size="sm" label={text.rowsPerPage} value={String(size)} options={sizes.map((n) => ({ value: String(n), label: format(n) }))}
            locale={locale || undefined} strings={strings ?? undefined} onchange={pick}></af-select>
        </div>
      {/if}
      {#if range}<span part="range" class="note">{range}</span>{/if}
      <button type="button" part="prev" class="af-button sm step" aria-controls={controls || undefined}
        aria-disabled={prevLocked ? 'true' : undefined} onclick={() => press(prevLocked, 'prev')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>{text.previous}
      </button>
      <button type="button" part="next" class="af-button sm step" aria-controls={controls || undefined}
        aria-disabled={nextLocked ? 'true' : undefined} onclick={() => press(nextLocked, 'next')}>
        {text.next}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    {/if}
  </div>
  <div bind:this={statusPart} part="status" role="status" class="live">{#key said}<span>{status}</span>{/key}</div>
{/if}

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The row is AgentFlow's Pager: centred, 8px apart. Previous and Next are its outline small buttons with a 4px gap.
    Their chevrons ask for 14px, but the button's own 16px icon rule outranks that, so they are the kit button's 16px.
  - The page-size control is AgentFlow's PageSizeSelect: the label 12px muted, 8px from a 76px small select. The range
    and the count are in the label's type; AgentFlow draws no counterpart of either.
  - Load more is the comment thread's ghost button in its 12px type, at the small button's height.
  - The status is visually hidden but always in the tree, so a screen reader hears it when its text changes.
-->
<style>
  :host { display: block; }
  .row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
  .size { display: flex; align-items: center; gap: 8px; }
  .note { font-size: 12px; line-height: 16px; color: var(--k-muted); white-space: nowrap; }
  .size af-select { width: 76px; }
  button.af-button.sm.step { gap: 4px; }
  button.af-button.sm.more { font-size: 12px; line-height: 16px; }
  .live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
</style>
