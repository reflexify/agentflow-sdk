<svelte:options customElement={{ shadow: 'open', props: { locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } }, extend: (ce) => class extends ce {
  // The methods exist from construction, before the element connects: a toast shown that early waits in the store.
  show(input: ToastInput): string { return show(toasterOf(this), input); }
  dismiss(id: string): void { toasterOf(this).dismiss(id); }
} }} />

<script module lang="ts">
  import { createToaster } from '@ark-ui/svelte/toast';
  import type { ToastInput } from './index.js';

  type ToasterStore = ReturnType<typeof createToaster>;
  const toasters = new WeakMap<HTMLElement, ToasterStore>();

  function toasterOf(host: HTMLElement): ToasterStore {
    let toaster = toasters.get(host);
    // Zag's toast group keeps a document keydown for its hotkey for as long as the Toaster is mounted, which here is as long as the element.
    // It is accepted because the hotkey matches no key, so it never acts on the host page's keys. An empty hotkey would match every
    // key (`[].every(...)` is true) and move focus into the region on each keystroke.
    if (!toaster) toasters.set(host, (toaster = createToaster({ placement: 'bottom-end', overlap: false, gap: 8, hotkey: ['af-kit-no-hotkey'] })));
    return toaster;
  }

  function show(toaster: ToasterStore, input: ToastInput): string {
    return toaster.create({
      type: input.kind,
      description: input.text,
      // An error lasts long enough to read twice, and one that offers an action waits for the viewer to take it or close it.
      duration: input.kind === 'error' ? (input.action ? Infinity : 8000) : 4000,
      meta: { action: input.action ?? null },
    });
  }
</script>

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Toast, Toaster } from '@ark-ui/svelte/toast';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';

  let { locale = null, strings = null }: { locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const toaster = toasterOf(self);
  let region = $state<HTMLElement | null>(null);
  let count = $state(0);
  // The popover region is out of the accessibility tree while it is hidden, and it is shown in the same moment as the first
  // toast after a quiet spell, which a screen reader does not announce. Each toast's text is therefore also read from live
  // regions that are always present.
  let live = $state<{ id: string; error: boolean; text: string }[]>([]);

  // The store publishes before it records the toast, so the count is read a tick later.
  const sync = () => queueMicrotask(() => {
    const visible = toaster.getVisibleToasts();
    count = visible.length;
    live = visible.map((t) => ({ id: t.id!, error: t.type === 'error', text: String(t.description ?? '') }));
  });
  $effect(() => {
    sync();
    return toaster.subscribe(sync);
  });
  $effect(() => raise(region, count > 0, self));
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    <div class="live" role="status">{#each live.filter((t) => !t.error) as t (t.id)}<p>{t.text}</p>{/each}</div>
    <div class="live" role="alert">{#each live.filter((t) => t.error) as t (t.id)}<p>{t.text}</p>{/each}</div>
    <div class="region" popover="manual" bind:this={region}>
      <Toaster {toaster} aria-label={text.notifications} aria-live="off">
        {#snippet children(toast)}
          {@const action = (toast().meta as { action?: { id: string; label: string } | null } | undefined)?.action}
          <Toast.Root part="toast" class="af-overlay" aria-live="off">
            <svg part="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              {#if toast().type === 'error'}<circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
              {:else if toast().type === 'success'}<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              {:else}<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />{/if}
            </svg>
            <Toast.Description part="text">{toast().description}</Toast.Description>
            {#if action}
              <Toast.ActionTrigger part="action" class="af-button secondary" onclick={() => emit(self, 'action', { toast: toast().id, action: action.id })}>{action.label}</Toast.ActionTrigger>
            {/if}
            <Toast.CloseTrigger part="close" class="af-button ghost icon sm" aria-label={text.close}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </Toast.CloseTrigger>
          </Toast.Root>
        {/snippet}
      </Toaster>
    </div>
  </div>
</EnvironmentProvider>

<style>
  .live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .region[popover] { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; pointer-events: none; }
  :global([data-scope='toast'][data-part='root']) {
    position: relative; display: flex; align-items: flex-start; gap: 8px; width: min(360px, calc(100vw - 32px)); padding: 8px 8px 8px 14px; box-sizing: border-box;
    overflow: hidden; font-size: 14px; line-height: 22px; --k-tone: var(--k-info);
    translate: var(--x) var(--y); scale: var(--scale, 1); z-index: var(--z-index); opacity: var(--opacity); will-change: translate, opacity, scale;
    transition: translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);
  }
  :global([data-scope='toast'][data-part='root'][data-state='closed']) { transition: translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1); }
  :global([data-scope='toast'][data-part='root']:focus-visible) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
  /* The kind shows in a leading bar and an icon, not only in a colour of the border. */
  :global([data-scope='toast'][data-part='root'])::before { content: ''; position: absolute; inset-block: 0; left: 0; width: 3px; background: var(--k-tone); }
  :global([data-scope='toast'][data-part='root'][data-type='error']) { --k-tone: var(--k-danger); }
  :global([data-scope='toast'][data-part='root'][data-type='success']) { --k-tone: var(--k-success); }
  [part='icon'] { flex: none; width: 16px; height: 16px; margin-top: 3px; color: var(--k-tone); }
  :global([data-scope='toast'][data-part='description']) { flex: 1; min-width: 0; padding-block: 1px; overflow-wrap: anywhere; }
  :global([data-scope='toast'][data-part='action']) { flex: none; min-height: 28px; padding: 0 10px; font-size: 12px; }
  :global([data-scope='toast'][data-part='close']) { flex: none; color: var(--k-muted); }
  @media (prefers-reduced-motion: reduce) {
    :global([data-scope='toast'][data-part='root']), :global([data-scope='toast'][data-part='root'][data-state='closed']) { transition: none; }
  }
</style>
