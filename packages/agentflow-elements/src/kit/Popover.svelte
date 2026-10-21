<svelte:options customElement={{ shadow: 'open', props: { open: { attribute: 'open', type: 'Boolean' }, placement: { attribute: 'placement', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Popover } from '@ark-ui/svelte/popover';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import type { KitStrings } from './index.js';

  type Placement = NonNullable<NonNullable<Popover.RootProps['positioning']>['placement']>;

  let { open = false, placement = 'bottom-start' }: { open?: boolean | null; placement?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  let positioner = $state<HTMLElement | null>(null);
  let reason: 'escape' | 'outside' = 'outside';
  $effect(() => raise(positioner, !!open, self));
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    <Popover.Root
      open={!!open}
      closeOnEscape
      portalled={false}
      positioning={{ strategy: 'fixed', placement: (placement || 'bottom-start') as Placement }}
      onEscapeKeyDown={() => (reason = 'escape')}
      onInteractOutside={() => (reason = 'outside')}
      onOpenChange={(d) => {
        if (d.open) return;
        emit(self, 'close', { reason });
        reason = 'outside';
      }}
    >
      <Popover.Anchor part="anchor"><slot name="anchor" /></Popover.Anchor>
      <Popover.Positioner bind:ref={positioner} popover="manual">
        <Popover.Content class="af-overlay popover" part="content"><slot name="content" /></Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  </div>
</EnvironmentProvider>

<style>
  :global([data-scope='popover'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='popover'][data-part='anchor']) { display: inline-block; }
  :global([data-scope='popover'][data-part='content']) { padding: 8px; }
  :global([data-scope='popover'][data-part='content']:focus-visible) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
</style>
