<svelte:options customElement={{ shadow: 'open', props: { text: { attribute: 'text', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Tooltip } from '@ark-ui/svelte/tooltip';
  import { on } from 'svelte/events';
  import KitStyles from './KitStyles.svelte';
  import { raise } from './environment.js';
  import type { KitStrings } from './index.js';

  type TooltipApi = () => { open: boolean; setOpen(open: boolean): void };

  let { text = '' }: { text?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  let open = $state(false);
  let positioner = $state<HTMLElement | null>(null);
  // A click focuses the anchor right after Zag closes the tooltip on pointerdown; that focus must not reopen it.
  let pressed = false;
  $effect(() => raise(positioner, open, self));

  const closeOnEscape = (api: TooltipApi) => (node: HTMLElement) =>
    on(node, 'keydown', (e) => {
      if (e.key === 'Escape' && api().open) api().setOpen(false);
    });

  function focusIn(api: TooltipApi) {
    const byPointer = pressed;
    pressed = false;
    if (!byPointer) api().setOpen(true);
  }

  function focusOut(api: TooltipApi, e: FocusEvent, anchor: EventTarget | null) {
    const next = e.relatedTarget as Node | null;
    if (next && (self.contains(next) || (anchor instanceof Node && anchor.contains(next)))) return;
    api().setOpen(false);
  }
</script>

{#if text}
  <KitStyles />
  <EnvironmentProvider value={() => self.shadowRoot!}>
    <!-- Only the bubble takes the kit's colours and font. The anchor stays outside .af-kit, so what the app slots in
         inherits from the page around the tooltip, whatever theme that page is in. -->
    <Tooltip.Root bind:open openDelay={300} closeDelay={0} closeOnEscape={false} positioning={{ strategy: 'fixed' }}>
      <Tooltip.Context>
        {#snippet render(api)}
          <Tooltip.Trigger
            onfocusin={() => focusIn(api)}
            onfocusout={(e: FocusEvent) => focusOut(api, e, e.currentTarget)}
            onpointerdown={() => (pressed = true)}
            onpointerleave={() => (pressed = false)}
          >
            {#snippet asChild(props)}<span part="anchor" {...props()} {@attach closeOnEscape(api)}><slot /></span>{/snippet}
          </Tooltip.Trigger>
        {/snippet}
      </Tooltip.Context>
      <Tooltip.Positioner bind:ref={positioner} popover="manual" class="af-kit">
        <Tooltip.Content class="af-overlay tooltip">{text}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  </EnvironmentProvider>
{:else}
  <slot />
{/if}

<style>
  :host { display: inline-block; }
  [part='anchor'] { display: block; }
  :global([data-scope='tooltip'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='tooltip'][data-part='content']) { max-width: 280px; padding: 4px 8px; border-radius: max(0px, calc(var(--k-radius) - 4px));
    font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
</style>
