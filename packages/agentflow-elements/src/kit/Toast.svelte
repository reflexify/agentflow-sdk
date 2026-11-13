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
              {#if toast().type === 'error'}<path d="m15 9-6 6" /><path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z" /><path d="m9 9 6 6" />
              {:else if toast().type === 'success'}<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              {:else}<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />{/if}
            </svg>
            <Toast.Description part="text">{toast().description}</Toast.Description>
            {#if action}
              <Toast.ActionTrigger part="action" onclick={() => emit(self, 'action', { toast: toast().id, action: action.id })}>{action.label}</Toast.ActionTrigger>
            {/if}
            <Toast.CloseTrigger part="close" aria-label={text.close}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </Toast.CloseTrigger>
          </Toast.Root>
        {/snippet}
      </Toaster>
    </div>
  </div>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The host and the wrapper in its shadow root draw no box (display: contents), as kit.css has the tag before it is defined, so
    in a flex or grid parent it is no item and takes no gap. What it shows is in the top layer.
  - AgentFlow's toasts: Sonner's, in rich colours, with the close button at the leading top corner. The kind shows
    in the icon as well as the colour. Sonner's rich colours are its own, which no token holds, so each kind mixes
    its tone into the popover (the page's background in the dark) for the ground and the edge, and into the text
    colour for the text; the dark switch picks the mix.
  - Focus is the kit's ring, not Sonner's faint grey shadow, which does not show on a tinted ground. Forced colours
    drop box-shadow, so a focused toast or toast button falls back to an outline.
-->
<style>
  :host { display: contents; }
  .af-kit { display: contents; }
  .live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .region[popover] { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; pointer-events: none; }
  :global([data-scope='toast'][data-part='root']) {
    --k-toast-tone: var(--k-info); --k-toast-bg: 6%; --k-toast-bg-dark: 0%; --k-toast-edge: 14%; --k-toast-edge-dark: 19%; --k-toast-ink: 100%; --k-toast-ink-dark: 100%;
    --k-toast-ground: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),
      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg), var(--k-popover)));
    --k-toast-line: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),
      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge), var(--k-popover)));
    --k-toast-text: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink-dark), var(--k-fg)) calc(var(--k-dark, 0) * 100%),
      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink), var(--k-fg)));
    position: relative; display: flex; align-items: center; gap: 6px; width: min(356px, calc(100vw - 32px)); padding: 16px; box-sizing: border-box;
    border-color: var(--k-toast-line); border-radius: var(--k-radius); background-color: var(--k-toast-ground); color: var(--k-toast-text);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1); outline: none; font-size: 13px; line-height: 1.5;
    translate: var(--x) var(--y); scale: var(--scale, 1); z-index: var(--z-index); opacity: var(--opacity); will-change: translate, opacity, scale;
    transition: translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);
  }
  :global([data-scope='toast'][data-part='root'][data-state='closed']) { transition: translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1); }
  :global([data-scope='toast'][data-part='root']:focus-visible) { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring), 0 4px 12px rgb(0 0 0 / 0.1); }
  :global([data-scope='toast'][data-part='root'][data-type='error']) {
    --k-toast-tone: var(--k-danger); --k-toast-bg: 7%; --k-toast-bg-dark: 5%; --k-toast-edge: 14%; --k-toast-edge-dark: 16%; --k-toast-ink: 100%; --k-toast-ink-dark: 56%; }
  :global([data-scope='toast'][data-part='root'][data-type='success']) {
    --k-toast-tone: var(--k-success); --k-toast-bg: 7%; --k-toast-bg-dark: 0%; --k-toast-edge: 22%; --k-toast-edge-dark: 16%; --k-toast-ink: 67%; --k-toast-ink-dark: 55%; }
  [part='icon'] { flex: none; width: 16px; height: 16px; margin-inline: -4px 5px; color: inherit; }
  :global([data-scope='toast'][data-part='description']) { flex: 1; min-width: 0; font-weight: 500; overflow-wrap: anywhere; }
  :global([data-scope='toast'][data-part='action-trigger']) { display: flex; flex: none; align-items: center; height: 24px; margin-left: auto; padding: 0 8px; border: none;
    border-radius: 4px; background-color: var(--k-popover-fg); color: var(--k-popover); outline: none; font: inherit; font-size: 12px; font-weight: 500; cursor: pointer;
    transition: opacity 400ms, box-shadow 200ms; }
  :global([data-scope='toast'][data-part='action-trigger']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([data-scope='toast'][data-part='close-trigger']) { position: absolute; top: 0; left: 0; z-index: 1; display: flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; padding: 0; border: 1px solid var(--k-toast-line); border-radius: 50%; background-color: var(--k-toast-ground); color: var(--k-toast-text);
    transform: translate(-35%, -35%); outline: none; cursor: pointer; transition: opacity 100ms, background 200ms, border-color 200ms; }
  :global([data-scope='toast'][data-part='close-trigger']) svg { width: 12px; height: 12px; pointer-events: none; }
  :global([data-scope='toast'][data-part='close-trigger']:focus-visible) { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring); }
  @media (forced-colors: active) {
    :global([data-scope='toast'][data-part='root']:focus-visible), :global([data-scope='toast'][data-part='action-trigger']:focus-visible),
    :global([data-scope='toast'][data-part='close-trigger']:focus-visible) { outline: 2px solid; outline-offset: 2px; }
  }
  @media (prefers-reduced-motion: reduce) {
    :global([data-scope='toast'][data-part='root']), :global([data-scope='toast'][data-part='root'][data-state='closed']) { transition: none; }
  }
</style>
