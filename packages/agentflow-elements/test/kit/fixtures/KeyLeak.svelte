<svelte:options customElement={{ shadow: 'open' }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Popover } from '@ark-ui/svelte/popover';
  import { onDestroy } from 'svelte';

  const self = $host();
  const onKey = () => {};
  if (self.hasAttribute('data-leak-in-script')) document.addEventListener('keydown', onKey);
  onDestroy(() => document.removeEventListener('keydown', onKey));
</script>

<EnvironmentProvider value={() => self.shadowRoot!}>
  <Popover.Root open portalled={false} onOpenChange={() => document.addEventListener('keydown', onKey)}>
    <Popover.Anchor><span>anchor</span></Popover.Anchor>
    <Popover.Positioner>
      <Popover.Content><button data-testid="leak-inside">inside</button></Popover.Content>
    </Popover.Positioner>
  </Popover.Root>
</EnvironmentProvider>
