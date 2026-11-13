<svelte:options customElement={{ shadow: 'open', props: { items: { type: 'Array' }, value: { attribute: 'value', type: 'String' }, label: { attribute: 'label', type: 'String' }, variant: { attribute: 'variant', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Tabs } from '@ark-ui/svelte/tabs';
  import Direction from './Direction.svelte';
  import KitStyles from './KitStyles.svelte';
  import { directionOf, emit } from './environment.js';
  import type { KitStrings, TabItem } from './index.js';

  let { items = [], value = null, label = null, variant = 'pill' }: { items?: TabItem[] | null; value?: string | null; label?: string | null; variant?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null } = $props();
  const self = $host();
  const dir = directionOf(self);
  const look = $derived(variant === 'line' || variant === 'segmented' ? variant : 'pill');
  // Zag makes only the selected tab a tab stop. With a value that names no enabled item, none would be, and the list
  // could not be reached from the keyboard; the first enabled tab is the stop then, as in AgentFlow's tabs.
  const fallbackStop = $derived.by(() => {
    const enabled = (items ?? []).filter((i) => !i.disabled);
    return enabled.some((i) => i.value === value) ? null : (enabled[0]?.value ?? null);
  });
  const tabindex = (item: TabItem) => (fallbackStop === null ? undefined : item.value === fallbackStop ? 0 : -1);
  // Svelte's attribute types predate aria-description, so it goes in by spread.
  const described = (reason: string | null | undefined): Record<string, string> => (reason ? { 'aria-description': reason } : {});
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
<Direction {dir}>
  <!-- The getter keeps Zag on the page's value: a click or an arrow key only asks for a tab, and the panel moves when the page sets `value`. -->
  <Tabs.Root bind:value={() => value ?? null, () => {}} activationMode="automatic" loopFocus
    onValueChange={(d) => { if (d.value != null) emit(self, 'tab-change', { value: d.value }); }}>
    <!-- The list is its own .af-kit, so the kit's font and colour stop at the tabs and a panel's content keeps the page's. -->
    <Tabs.List part="list" class="af-kit af-tabs {look}" aria-label={label || undefined}>
      {#each items ?? [] as item (item.value)}
        {#if item.disabled && item.reason}
          <af-tooltip text={item.reason}>
            <!-- The tooltip cannot describe across its shadow root, so the reason is the tab's own description too. -->
            <Tabs.Trigger value={item.value} disabled part="tab" tabindex={tabindex(item)} {...described(item.reason)}>{item.label}</Tabs.Trigger>
          </af-tooltip>
        {:else}
          <Tabs.Trigger value={item.value} disabled={!!item.disabled} part="tab" tabindex={tabindex(item)}>{item.label}</Tabs.Trigger>
        {/if}
      {/each}
    </Tabs.List>
    {#each items ?? [] as item (item.value)}
      <!-- Svelte refuses a dynamic name on its own slot, so each panel holds a native one named by the item's value. -->
      <Tabs.Content value={item.value} part="panel"><svelte:element this={"slot"} name={item.value} /></Tabs.Content>
    {/each}
  </Tabs.Root>
</Direction>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's Tabs: a column with 8px between the list and the panel; its TabsContent fills the rest and draws no
    focus outline.
  - The list's border is AgentFlow's reset, none wide in the border colour, which a shadow root does not inherit.
  - A locked tab with a reason sits inside af-tooltip, which kit.css's tab rules reach through. The wrapper takes the
    tab's place in the list instead: a flex item stretched to the list's full height, since kit.css takes the tab's 1px
    off inside it, with its anchor a flex box the tab fills, centred as the list centres its tabs. In the segmented look
    it is sized to its content, as a segmented tab is.
  - Zag marks a disabled tab both `disabled` and `aria-disabled="true"`, and kit.css's not-allowed cursor is for a tab
    locked with aria-disabled alone, which keeps its focus. A disabled tab takes no pointer, so its cursor is AgentFlow's
    default.
-->
<style>
  :host { display: block; }
  :global([data-scope='tabs'][data-part='root']) { display: flex; flex-direction: column; gap: 8px; }
  :global([data-scope='tabs'][data-part='content']) { flex: 1; outline: none; }
  :global([data-scope='tabs'][data-part='list']) { border: 0 solid var(--k-line); }
  :global(.af-tabs > af-tooltip) { display: flex; flex: 1 1 0%; align-self: stretch; }
  :global(.af-tabs > af-tooltip::part(anchor)) { display: flex; flex: 1 1 0%; align-items: center; }
  :global(.af-tabs.segmented > af-tooltip) { flex: 0 1 auto; }
  :global(.af-tabs [role='tab'][aria-disabled='true']:disabled) { cursor: default; }
</style>
