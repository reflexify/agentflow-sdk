<svelte:options customElement={{ shadow: 'open', props: { items: { type: 'Array' }, label: { attribute: 'label', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Menu } from '@ark-ui/svelte/menu';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import type { KitStrings, MenuItem } from './index.js';

  let { items = [], label = '' }: { items?: MenuItem[] | null; label?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  let open = $state(false);
  let positioner = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, open, self));
  // Svelte's attribute types predate aria-description, so it goes in by spread.
  const described = (reason: string | null | undefined): Record<string, string> => (reason ? { 'aria-description': reason } : {});
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    <Menu.Root bind:open positioning={{ strategy: 'fixed', placement: 'bottom-end' }}
      onSelect={(d) => { const item = (items ?? []).find((i) => i.id === d.value); if (item && !item.disabled) emit(self, 'select', { id: item.id }); }}>
      <Menu.Trigger part="trigger" class="af-button ghost" aria-label={label ?? ''}><slot /></Menu.Trigger>
      <Menu.Positioner bind:ref={positioner} popover="manual">
        <Menu.Content class="af-overlay menu">
          <Menu.Context>
            {#snippet render(api)}
              {#each items ?? [] as item (item.id)}
                {#if item.disabled}
                  <af-tooltip text={item.reason ?? ''}>
                    <!-- The tooltip cannot describe across its shadow root, so the reason is the item's own description too. -->
                    <Menu.Item value={item.id} disabled part="item" aria-disabled="true" {...described(item.reason)} data-danger={item.danger ? '' : undefined}>{item.label}</Menu.Item>
                  </af-tooltip>
                {:else}
                  <!-- A click with no pointerdown before it (assistive technology, element.click()) leaves Zag nothing highlighted to select. -->
                  <Menu.Item value={item.id} part="item" data-danger={item.danger ? '' : undefined} onclickcapture={() => api().setHighlightedValue(item.id)}>{item.label}</Menu.Item>
                {/if}
              {/each}
            {/snippet}
          </Menu.Context>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  </div>
</EnvironmentProvider>

<style>
  af-tooltip { display: block; }
  :global([data-scope='menu'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='menu'][data-part='content']) { min-width: 180px; padding: 4px; }
  :global([data-scope='menu'][data-part='item']) { padding: 6px 10px; border-radius: max(0px, calc(var(--k-radius) - 4px)); font-size: 13px; line-height: 20px; cursor: pointer; }
  :global([data-scope='menu'][data-part='item'][data-highlighted]) { background: color-mix(in oklab, var(--k-fg) 6%, transparent); }
  :global([data-scope='menu'][data-part='item'][data-danger]) { color: color-mix(in oklab, var(--k-danger) 78%, var(--k-fg)); }
  :global([data-scope='menu'][data-part='item'][aria-disabled='true']) { opacity: 0.55; cursor: not-allowed; }
</style>
