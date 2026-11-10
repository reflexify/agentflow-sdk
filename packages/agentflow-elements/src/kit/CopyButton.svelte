<svelte:options customElement={{ shadow: 'open', props: { value: { attribute: 'value', type: 'String' }, label: { attribute: 'label', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import KitStyles from './KitStyles.svelte';
  import { deepActiveElement, emit } from './environment.js';
  import type { KitStrings } from './index.js';
  import { kitText } from './text.js';

  let { value = null, label = null, locale = null, strings = null }: { value?: string | null; label?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));

  // After a press the icon and the status show the outcome for two seconds. Each announcement is a node of its own, so a
  // second press that ends as the first did is still a change a screen reader hears.
  let outcome = $state<'copied' | 'failed' | null>(null);
  let said = $state(0);
  let trigger = $state<HTMLElement | null>(null);
  // Presses can overlap while a write is pending. Each one reports its own outcome, and only the latest shows it.
  let presses = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let alive = true;
  $effect(() => () => {
    alive = false;
    clearTimeout(timer);
  });
  const status = $derived(outcome === 'copied' ? text.copied : outcome === 'failed' ? text.copyFailed : '');

  // The clipboard write starts inside the click, before anything is awaited: a browser honours a write only while the
  // gesture that asked for it is current.
  async function write(copy: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copy);
        return true;
      }
    } catch {
      // Refused: no permission, an insecure page or a frame the policy shuts out. The selection route is next.
    }
    return viaSelection(copy);
  }

  function viaSelection(copy: string): boolean {
    const root = self.shadowRoot;
    if (!root) return false;
    // The page's focus, wherever it sits: in a browser where a click does not focus a button, it is not on this element.
    const before = deepActiveElement();
    const area = document.createElement('textarea');
    area.value = copy;
    area.readOnly = true;
    area.tabIndex = -1;
    area.setAttribute('aria-hidden', 'true');
    area.style.cssText = 'position: fixed; top: 0; left: 0; width: 1px; height: 1px; margin: 0; padding: 0; border: 0; opacity: 0; pointer-events: none';
    // A browser raises its own copy event on the selection, and that one is composed. It is not the kit's `af-copy`, which
    // carries a detail, and a page's bubbling `copy` listener on the element or above it must not hear it from inside.
    area.addEventListener('copy', (e) => e.stopPropagation());
    root.append(area);
    try {
      // Focusing without scrolling first, so that selecting does not scroll an ancestor to a textarea it has fixed in place.
      area.focus({ preventScroll: true });
      area.select();
      area.setSelectionRange(0, copy.length);
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
      // Selecting moved focus onto the textarea; it goes back to where it was, or to the button when nothing had it.
      const back = before && before !== document.body && before.isConnected ? before : trigger;
      back?.focus({ preventScroll: true });
    }
  }

  async function press() {
    const mine = ++presses;
    const copy = value ?? '';
    // Nothing to copy is a failure the page should hear of, not an emptied clipboard reported as copied.
    const ok = copy === '' ? false : await write(copy);
    emit(self, 'af-copy', { value: copy, ok });
    if (!alive || mine !== presses) return;
    outcome = ok ? 'copied' : 'failed';
    said += 1;
    clearTimeout(timer);
    timer = setTimeout(() => (outcome = null), 2000);
  }
</script>

<KitStyles />
<span class="af-kit">
  <button bind:this={trigger} type="button" part="trigger" class="af-button ghost icon xs" aria-label={label || text.copy} onclick={press}>
    {#if outcome === 'copied'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
    {/if}
  </button>
  <div part="status" role="status" class="live">{#key said}<span>{status}</span>{/key}</div>
</span>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The look is the kit's extra-small ghost icon button, 24px square with a 12px icon, as AgentFlow's icon-xs button.
  - The status is visually hidden but always in the tree, so a screen reader hears it when its text changes. The host
    anchors it, so it cannot widen a scroller the element sits in.
-->
<style>
  :host { position: relative; display: inline-flex; vertical-align: middle; }
  .af-kit { display: inline-flex; }
  .live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
</style>
