<svelte:options customElement={{ shadow: 'open', props: { open: { type: 'Boolean' }, heading: { attribute: 'heading', type: 'String' }, placement: { attribute: 'placement', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Dialog } from '@ark-ui/svelte/dialog';
  import { on } from 'svelte/events';
  import KitStyles from './KitStyles.svelte';
  import { emit, isTopModal, modalSync, within } from './environment.js';
  import { isClaimed } from './escape.js';
  import { fromShownTooltip } from './tooltip-escape.js';
  import Scroller from './scroll/Scroller.svelte';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';

  let { open = false, heading = '', placement = 'center', locale = null, strings = null }: { open?: boolean | null; heading?: string | null; placement?: 'center' | 'end' | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const docked = $derived(placement === 'end' ? 'end' : 'center');
  let el = $state<HTMLDialogElement | null>(null);
  let reason: 'escape' | 'outside' = 'escape';
  let actions = $state<HTMLElement | null>(null);
  let title = $state<HTMLElement | null>(null);
  let hasActions = $state(false);
  const sync = modalSync(self);
  $effect(() => sync(el, !!open));
  // Zag starts to listen for a press outside a task after the dialog opens, and a browser runs input before timers, so a
  // press on the backdrop right after the dialog shows could go unheard. The element listens from the moment it opens,
  // decides as Zag would, and marks the press so Zag's own report of it is ignored.
  let pressedOutside: Event | null = null;
  let zagClosedOn: Event | null = null;
  const isOutside = (target: EventTarget | null) => !(target instanceof Node && within(self, target)) && isTopModal(self);
  $effect(() => {
    if (!open || !el) return;
    return on(self.ownerDocument, 'pointerdown', (e) => {
      if (e === zagClosedOn || e.button !== 0 || e.pointerType === 'touch' || !isOutside(e.composedPath()[0] ?? null)) return;
      pressedOutside = e;
      emit(self, 'close', { reason: 'outside' });
    }, { capture: true });
  });
  $effect(() => {
    const slot = actions?.querySelector('slot');
    if (!slot) return;
    const check = () => (hasActions = slot.assignedNodes().length > 0);
    check();
    return on(slot, 'slotchange', check);
  });
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <!-- The getter keeps Zag open while the app keeps `open` true: Ark would otherwise record its own close and leave a dead dialog. -->
  <Dialog.Root bind:open={() => !!open, () => {}} modal={false} preventScroll closeOnInteractOutside
    onEscapeKeyDown={(e) => {
      if (fromShownTooltip(self, e)) e.preventDefault();
      else if (isClaimed(e) && e.defaultPrevented) emit(self, 'close', { reason: 'escape' });
      else reason = 'escape';
    }}
    onInteractOutside={(e) => {
      // Zag's containment check stops at the shadow boundary, so a pointerdown on a node the app slotted in counts as outside
      // whenever it lands beyond the content's box. A dialog with another kit modal over it leaves the click to that one.
      if (e.detail.originalEvent === pressedOutside || !isOutside(e.detail.target)) e.preventDefault();
      else {
        zagClosedOn = e.detail.originalEvent;
        reason = 'outside';
      }
    }}
    onOpenChange={(d) => {
      if (d.open) return;
      emit(self, 'close', { reason });
      reason = 'escape';
    }}>
    <Dialog.Positioner>
      {#snippet asChild(props)}
        <!-- Esc must go through Zag, which reports the close, not through the native close. -->
        <dialog {...props()} bind:this={el} class="af-kit" data-placement={docked} oncancel={(e) => e.preventDefault()}>
          <Dialog.Content part="content" class="af-overlay dialog" aria-modal="true" data-placement={docked}>
            <header>
              <Dialog.Title part="heading" bind:ref={title}>{heading ?? ''}</Dialog.Title>
              <button type="button" part="close" aria-label={text.close} onclick={() => emit(self, 'close', { reason: 'close-button' })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </header>
            <div part="body"><Scroller heading={{ element: title, text: heading ?? '' }}><slot /></Scroller></div>
            <footer part="actions" bind:this={actions} hidden={!hasActions}><slot name="actions" /></footer>
          </Dialog.Content>
        </dialog>
      {/snippet}
    </Dialog.Positioner>
  </Dialog.Root>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The host draws no box (display: contents), as kit.css has the tag before it is defined, so in a flex or grid parent it is no
    item and takes no gap. The dialog is a native one, in the top layer.
  - AgentFlow's DialogContent: the page's background, the large radius and shadow, 24px in, a 16px rhythm, and a
    close button at the corner that brightens on hover and rings on focus.
  - On a short window the body scrolls between a heading and a footer that stay in view. The body reaches 16px past
    the content's sides and 4px past its top and bottom, and its scroller's viewport pads it back in, so a slotted
    field's focus ring is drawn inside what scrolls rather than cut off at its edge, and the scrollbar sits at the
    dialog's padding.
  - Below 640px AgentFlow stacks the actions, the main one on top.
  - Forced colours drop box-shadow, so a focused close button or a focused dialog falls back to an outline.
  - placement="end" is AgentFlow's right Sheet: the dialog is pinned to the window's right edge, in every language, and
    fills its height; the content is up to 384px wide with a border on its left edge and no radius, and the header, body
    and footer each pad 16px on a 16px gap. The body keeps the centred dialog's 4px bleed above and below for focus
    rings, but not below when there are no actions, since the panel's foot is the window's. The footer stacks its actions
    as the Sheet's does. It slides in over 500ms and closes at once, since a native dialog closes as soon as it is told to.
  - The body is a tab stop only when it scrolls and holds nothing Tab reaches; it is then named by the heading.
-->
<style>
  :host { display: contents; }
  dialog { border: 0; padding: 0; background: transparent; max-width: calc(100vw - 32px); overflow: visible; }
  dialog::backdrop { background: rgb(0 0 0 / 0.5); }
  header { display: flex; flex: none; align-items: center; padding-right: 24px; }
  [part='body'] { display: flex; flex: 1 1 auto; flex-direction: column; min-height: 0; margin: -4px -16px; }
  [part='body'] :global([data-scope='scroll-area'][data-part='viewport']) { padding: 4px 16px; overscroll-behavior: contain; }
  footer { display: flex; flex: none; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
  footer[hidden] { display: none; }
  [part='close'] { position: absolute; top: 16px; right: 16px; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;
    padding: 0; border: 0 solid var(--k-line); border-radius: 2px; background: transparent; color: inherit; opacity: 0.7; outline: none; cursor: pointer;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  [part='close'] svg { flex: none; width: 16px; height: 16px; pointer-events: none; }
  @media (hover: hover) { [part='close']:hover { opacity: 1; } }
  [part='close']:focus-visible { box-shadow: 0 0 0 2px var(--k-bg), 0 0 0 4px var(--k-focus-border); }
  :global([data-scope='dialog'][data-part='content']) { position: relative; display: flex; flex-direction: column; gap: 16px; width: calc(100vw - 32px);
    max-height: calc(100dvh - 64px); padding: 24px; border-radius: var(--k-radius); background-color: var(--k-bg); color: var(--k-fg); outline: none;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
  :global([data-scope='dialog'][data-part='title']) { margin: 0; font-size: 18px; font-weight: 600; line-height: 1; }
  @media (min-width: 40rem) { :global([data-scope='dialog'][data-part='content']) { max-width: 512px; } }
  @media not (min-width: 40rem) { footer { flex-direction: column-reverse; } }
  dialog[data-placement='end'] { inset: 0 0 0 auto; height: 100dvh; max-width: none; max-height: none; margin: 0; }
  :global([data-scope='dialog'][data-part='content'][data-placement='end']) { width: min(75vw, 384px); max-width: none; height: 100%; max-height: none;
    padding: 0; border: 0 solid var(--k-line); border-left-width: 1px; border-radius: 0; }
  :global([data-scope='dialog'][data-part='content'][data-placement='end']) header { box-sizing: border-box; padding: 16px 40px 16px 16px; }
  :global([data-scope='dialog'][data-part='content'][data-placement='end']) [part='body'] { margin: -4px 0; }
  :global([data-scope='dialog'][data-part='content'][data-placement='end']:has(> footer[hidden])) [part='body'] { margin-bottom: 0; }
  :global([data-scope='dialog'][data-part='content'][data-placement='end']) footer { box-sizing: border-box; flex-direction: column; justify-content: normal; margin-top: auto; padding: 16px; }
  :global([data-scope='dialog'][data-part='content'][data-placement='end'] [data-scope='dialog'][data-part='title']) { font-size: 16px; line-height: 24px; }
  @keyframes -global-af-dialog-slide-in { from { transform: translateX(100%); } }
  @media (prefers-reduced-motion: no-preference) {
    :global([data-scope='dialog'][data-part='content'][data-placement='end']) { animation: af-dialog-slide-in 500ms cubic-bezier(0.4, 0, 0.2, 1); }
  }
  @media (prefers-reduced-motion: reduce) { [part='close'] { transition: none; } }
  @media (forced-colors: active) {
    [part='close']:focus-visible, :global([data-scope='dialog'][data-part='content']:focus-visible) { outline: 2px solid; outline-offset: 2px; }
  }
</style>
