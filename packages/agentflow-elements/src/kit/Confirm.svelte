<svelte:options customElement={{ shadow: 'open', props: { open: { type: 'Boolean' }, heading: { attribute: 'heading', type: 'String' }, message: { attribute: 'message', type: 'String' }, confirmLabel: { attribute: 'confirm-label', type: 'String' }, danger: { attribute: 'danger', type: 'Boolean' }, impact: { attribute: 'impact', type: 'String' }, busy: { type: 'Boolean' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Dialog } from '@ark-ui/svelte/dialog';
  import KitStyles from './KitStyles.svelte';
  import { emit, modalSync } from './environment.js';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';

  let {
    open = false, heading = '', message = '', confirmLabel = null, danger = false, impact = null, busy = false, locale = null, strings = null,
  }: {
    open?: boolean | null; heading?: string | null; message?: string | null; confirmLabel?: string | null; danger?: boolean | null;
    impact?: string | null; busy?: boolean | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  let el = $state<HTMLDialogElement | null>(null);
  let locked = $state(false);
  let wasBusy = false;

  const sync = modalSync(self);
  $effect(() => sync(el, !!open));
  $effect(() => {
    if (open) locked = false;
  });
  $effect(() => {
    const now = !!busy;
    if (wasBusy && !now) locked = false;
    wasBusy = now;
  });

  function confirm() {
    if (locked || busy) return;
    locked = true;
    emit(self, 'confirm', {});
  }
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <!-- The getter keeps Zag open while the app keeps `open` true: Ark would otherwise record its own close and leave a dead dialog. -->
  <Dialog.Root bind:open={() => !!open, () => {}} modal={false} preventScroll closeOnInteractOutside={false} role="alertdialog"
    onOpenChange={(d) => { if (!d.open) emit(self, 'cancel', { reason: 'escape' }); }}>
    <Dialog.Positioner>
      {#snippet asChild(props)}
        <!-- Esc must go through Zag, which reports the close, not through the native close. -->
        <dialog {...props()} bind:this={el} class="af-kit" oncancel={(e) => e.preventDefault()}>
          <Dialog.Content part="content" class="af-overlay dialog" aria-modal="true">
            <Dialog.Title part="heading">{heading ?? ''}</Dialog.Title>
            <!-- One description holds the impact too, so a screen reader reads it with the question. -->
            {#if message || impact}
              <Dialog.Description>
                {#snippet asChild(props)}
                  <div {...props()} class="description">
                    {#if message}<p part="message">{message}</p>{/if}
                    {#if impact}<p part="impact">{impact}</p>{/if}
                  </div>
                {/snippet}
              </Dialog.Description>
            {/if}
            <footer part="actions">
              <button type="button" part="cancel" class="af-button secondary" onclick={() => emit(self, 'cancel', { reason: 'close-button' })}>{text.cancel}</button>
              <button type="button" part="confirm" class={danger ? 'af-button danger' : 'af-button primary'}
                aria-disabled={locked || busy ? 'true' : undefined} onclick={confirm}>{confirmLabel || text.confirm}</button>
            </footer>
          </Dialog.Content>
        </dialog>
      {/snippet}
    </Dialog.Positioner>
  </Dialog.Root>
</EnvironmentProvider>

<style>
  dialog { border: 0; padding: 0; background: transparent; max-width: calc(100vw - 32px); overflow: visible; }
  dialog::backdrop { background: rgb(0 0 0 / 0.4); }
  p { margin: 0; }
  footer { display: flex; justify-content: flex-end; gap: 8px; }
  :global([data-scope='dialog'][data-part='content']) { display: grid; gap: 12px; width: min(420px, calc(100vw - 32px)); padding: 16px; border-radius: calc(var(--k-radius) + 4px); }
  :global([data-scope='dialog'][data-part='content']:focus-visible) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
  :global([data-scope='dialog'][data-part='title']) { margin: 0; font-size: 16px; font-weight: 600; line-height: 24px; }
  .description { display: grid; gap: 8px; font-size: 14px; line-height: 22px; }
  [part='message'] { color: var(--k-muted); }
  [part='impact'] { color: var(--k-fg); font-weight: 500; }
</style>
