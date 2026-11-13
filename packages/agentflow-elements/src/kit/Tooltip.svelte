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
    <Tooltip.Root bind:open openDelay={300} closeDelay={0} closeOnEscape={false} positioning={{ strategy: 'fixed', gutter: 5 }}>
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
        <Tooltip.Arrow part="arrow"><Tooltip.ArrowTip /></Tooltip.Arrow>
        <Tooltip.Content class="af-overlay tooltip">{text}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  </EnvironmentProvider>
{:else}
  <slot />
{/if}

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's TooltipContent: the foreground as the bubble and the background as its text, 12px type, no border or
    shadow.
  - Its arrow is a 10px square turned 45 degrees, rounded 2px, in the bubble's colour, centred 2px inside the bubble's
    edge, so 5px of it shows. Zag centres the arrow on the edge, and writes that offset on the element itself, which only
    an important declaration beats. Zag also adds half the arrow's height to the gap (the 5px here), so with the arrow the
    bubble sits 10px from its anchor, as AgentFlow's does. An app restyles the arrow through ::part(arrow), whose custom
    properties (--arrow-size, --arrow-background) the tip inherits.
-->
<style>
  :host { display: inline-block; }
  [part='anchor'] { display: block; }
  :global([data-scope='tooltip'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='tooltip'][data-part='arrow']) { --arrow-size: 10px; --arrow-background: var(--k-fg); --arrow-offset: calc(var(--arrow-size-half) * -1 - 2px) !important; }
  :global([data-scope='tooltip'][data-part='arrow-tip']) { border-radius: 2px; }
  :global([data-scope='tooltip'][data-part='content']) { width: fit-content; max-width: 280px; padding: 6px 12px; border: 0 solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: var(--k-fg); color: var(--k-bg); box-shadow: none; font-size: 12px; line-height: 16px; text-wrap: balance; overflow-wrap: anywhere; }
</style>
