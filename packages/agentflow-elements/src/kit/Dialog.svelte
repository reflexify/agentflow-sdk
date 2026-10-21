<svelte:options customElement={{ shadow: 'open', props: { open: { type: 'Boolean' }, heading: { attribute: 'heading', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Dialog } from '@ark-ui/svelte/dialog';
  import { on } from 'svelte/events';
  import KitStyles from './KitStyles.svelte';
  import { emit, isTopModal, modalSync, within } from './environment.js';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';

  let { open = false, heading = '', locale = null, strings = null }: { open?: boolean | null; heading?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  let el = $state<HTMLDialogElement | null>(null);
  let reason: 'escape' | 'outside' = 'escape';
  let actions = $state<HTMLElement | null>(null);
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
    onEscapeKeyDown={() => (reason = 'escape')}
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
        <dialog {...props()} bind:this={el} class="af-kit" oncancel={(e) => e.preventDefault()}>
          <Dialog.Content part="content" class="af-overlay dialog" aria-modal="true">
            <header>
              <Dialog.Title part="heading">{heading ?? ''}</Dialog.Title>
              <button type="button" part="close" class="af-button ghost icon" aria-label={text.close} onclick={() => emit(self, 'close', { reason: 'close-button' })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </header>
            <div part="body"><slot /></div>
            <footer part="actions" bind:this={actions} hidden={!hasActions}><slot name="actions" /></footer>
          </Dialog.Content>
        </dialog>
      {/snippet}
    </Dialog.Positioner>
  </Dialog.Root>
</EnvironmentProvider>

<style>
  dialog { border: 0; padding: 0; background: transparent; max-width: calc(100vw - 32px); overflow: visible; }
  dialog::backdrop { background: rgb(0 0 0 / 0.4); }
  /* On a short window the body scrolls between a heading and a footer that stay in view. */
  header { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 12px; margin-right: -8px; }
  [part='body'] { flex: 1 1 auto; min-height: 0; margin: -4px -16px; padding: 4px 16px; overflow: auto; overscroll-behavior: contain; }
  footer { display: flex; flex: none; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
  footer[hidden] { display: none; }
  :global([data-scope='dialog'][data-part='content']) { display: flex; flex-direction: column; gap: 12px; width: min(480px, calc(100vw - 32px));
    max-height: calc(100dvh - 64px); padding: 16px; border-radius: calc(var(--k-radius) + 4px); box-sizing: border-box; }
  :global([data-scope='dialog'][data-part='content']:focus-visible) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
  :global([data-scope='dialog'][data-part='title']) { margin: 0; font-size: 16px; font-weight: 600; line-height: 24px; }
</style>
