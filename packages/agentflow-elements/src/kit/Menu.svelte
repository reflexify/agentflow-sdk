<svelte:options customElement={{ shadow: 'open', props: { items: { type: 'Array' }, label: { attribute: 'label', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, reason: { attribute: 'reason', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Menu } from '@ark-ui/svelte/menu';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { isClaimed } from './escape.js';
  import Scroller, { revealItem } from './scroll/Scroller.svelte';
  import type { KitStrings, MenuEntry, MenuGroup, MenuItem } from './index.js';

  let { items = [], label = '', disabled = false, reason = '' }: {
    items?: MenuEntry[] | null; label?: string | null; disabled?: boolean | null; reason?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  let open = $state(false);
  let positioner = $state<HTMLElement | null>(null);
  // A locked menu cannot be open: Zag is handed `open` false and every request to change it is dropped, and a menu locked
  // while open closes and stays closed when unlocked.
  const shown = $derived(open && !disabled);
  $effect(() => {
    if (disabled) open = false;
  });
  $effect(() => raise(positioner, shown, self));
  // The trigger stays focusable while locked (aria-disabled, not disabled), so its reason can be reached by keyboard. A
  // reason wraps it in its tooltip, which draws the button again, so focus that was on it is put back. The tooltip's own
  // content renders a moment after it connects, and a button it has no slot for yet is not rendered, so cannot take focus.
  const wrapped = $derived(!!disabled && !!reason);
  let heldFocus = false;
  $effect.pre(() => {
    void wrapped;
    heldFocus = self.shadowRoot?.activeElement?.getAttribute('part') === 'trigger';
  });
  $effect(() => {
    void wrapped;
    if (!heldFocus) return;
    heldFocus = false;
    requestAnimationFrame(() => {
      const { activeElement, body } = self.ownerDocument;
      if (activeElement && activeElement !== body) return;
      self.shadowRoot?.querySelector<HTMLElement>('[part="trigger"]')?.focus();
    });
  });
  // Svelte's attribute types predate aria-description, so it goes in by spread.
  const described = (reason: string | null | undefined): Record<string, string> => (reason ? { 'aria-description': reason } : {});
  const TONES = ['success', 'warning', 'info', 'danger'];
  // The flag draws a danger item, and a tone wins over it on the same item.
  const toneOf = (item: MenuItem) => (item.tone && TONES.includes(item.tone) ? item.tone : item.danger ? 'danger' : undefined);
  const isGroup = (entry: MenuEntry): entry is MenuGroup => Array.isArray((entry as MenuGroup).items);
  const flat = $derived((items ?? []).flatMap((entry) => (isGroup(entry) ? entry.items : [entry])));
  // A checkable item emits the state it would take and draws nothing new until the page sets `checked` back.
  function selected(value: string) {
    const item = flat.find((i) => i.id === value);
    if (!item || item.disabled) return;
    if (item.type === 'checkbox') emit(self, 'select', { id: item.id, checked: !item.checked });
    else if (item.type === 'radio') emit(self, 'select', { id: item.id, checked: true });
    else emit(self, 'select', { id: item.id });
  }
  const checkedIn = (list: MenuItem[]) => list.find((i) => i.type === 'radio' && i.checked)?.id;
  // An empty group draws nothing, so the separator before a group counts only the entries that are drawn.
  const entries = $derived((items ?? []).filter((entry) => !isGroup(entry) || entry.items.length > 0));
  // What every item kind carries. The tooltip cannot describe across its shadow root, so a disabled item's reason is its
  // own description too. A click with no pointerdown before it (assistive technology, element.click()) leaves Zag
  // nothing highlighted to select, so the click highlights its item first.
  const rowProps = (item: MenuItem, highlight: (id: string) => void) => {
    const tone = toneOf(item);
    return {
      value: item.id,
      disabled: item.disabled,
      part: 'item',
      'data-danger': tone === 'danger' ? '' : undefined,
      'data-tone': tone === 'danger' ? undefined : tone,
      ...(item.disabled ? described(item.reason) : {}),
      onclickcapture: item.disabled ? undefined : () => highlight(item.id),
    };
  };
  // Zag scrolls a highlighted item into view only inside a content that scrolls itself; here the scroller's viewport
  // does, so the menu brings a highlight moved by a key into view itself, and leaves one the pointer moved alone.
  let content = $state<HTMLElement | null>(null);
  let byPointer = false;
  function reveal(value: string | null) {
    if (byPointer || !value) return;
    requestAnimationFrame(() => {
      const items = content?.querySelectorAll<HTMLElement>('[data-part="item"]') ?? [];
      const item = [...items].find((i) => i.dataset.value === value) ?? null;
      revealItem({ getElement: () => item });
    });
  }
</script>

<KitStyles />
{#snippet trigger()}
  <Menu.Trigger part="trigger" class="af-button ghost" aria-label={label ?? ''} aria-disabled={disabled ? 'true' : undefined} {...(disabled ? described(reason) : {})}><slot /></Menu.Trigger>
{/snippet}
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit" onpointermovecapture={() => (byPointer = true)} onkeydowncapture={() => (byPointer = false)}>
    <Menu.Root bind:open={() => shown, (value) => { if (!disabled) open = value; }} positioning={{ strategy: 'fixed', placement: 'bottom-end' }} onHighlightChange={(d) => reveal(d.highlightedValue)}
      onSelect={(d) => selected(d.value)} onEscapeKeyDown={(e) => { if (isClaimed(e) && e.defaultPrevented) open = false; }}>
      {#if wrapped}
        <af-tooltip class="lock" text={reason}>{@render trigger()}</af-tooltip>
      {:else}
        {@render trigger()}
      {/if}
      <Menu.Positioner bind:ref={positioner} popover="manual">
        <Menu.Content bind:ref={content} class="af-overlay menu">
          <Scroller tabStop={false}>
            <Menu.Context>
              {#snippet render(api)}
                {#snippet indicator(type: MenuItem['type'])}
                  <Menu.ItemIndicator part="indicator">
                    {#if type === 'checkbox'}
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    {:else}
                      <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
                    {/if}
                  </Menu.ItemIndicator>
                {/snippet}
                {#snippet row(item: MenuItem)}
                  {@const props = rowProps(item, (id) => api().setHighlightedValue(id))}
                  {#if item.type === 'checkbox'}
                    <Menu.CheckboxItem {...props} bind:checked={() => !!item.checked, () => {}}>{@render indicator(item.type)}{item.label}</Menu.CheckboxItem>
                  {:else if item.type === 'radio'}
                    <Menu.RadioItem {...props}>{@render indicator(item.type)}{item.label}</Menu.RadioItem>
                  {:else}
                    <Menu.Item {...props}>{item.label}</Menu.Item>
                  {/if}
                {/snippet}
                {#snippet loose(item: MenuItem)}
                  {#if item.disabled}
                    <af-tooltip text={item.reason ?? ''}>{@render row(item)}</af-tooltip>
                  {:else}
                    {@render row(item)}
                  {/if}
                {/snippet}
                {#snippet members(group: MenuGroup)}
                  {#if group.heading}<Menu.ItemGroupLabel part="heading">{group.heading}</Menu.ItemGroupLabel>{/if}
                  {#each group.items as item (item.id)}{@render loose(item)}{/each}
                {/snippet}
                <!-- Groups and items are keyed in namespaces of their own, so a group may share its id with an item. -->
                {#each entries as entry, index (isGroup(entry) ? `group:${entry.id}` : `item:${entry.id}`)}
                  {#if isGroup(entry)}
                    {#if index > 0}<Menu.Separator part="separator" />{/if}
                    <!-- A group with no heading names nothing, so it keeps no label reference to an element that is not there. -->
                    {#if entry.items.some((i) => i.type === 'radio')}
                      <Menu.RadioItemGroup part="group" bind:value={() => checkedIn(entry.items), () => {}} aria-labelledby={entry.heading ? undefined : null}>{@render members(entry)}</Menu.RadioItemGroup>
                    {:else}
                      <Menu.ItemGroup part="group" aria-labelledby={entry.heading ? undefined : null}>{@render members(entry)}</Menu.ItemGroup>
                    {/if}
                  {:else if entry.type === 'radio'}
                    <!-- A radio item outside a group is a group of one. -->
                    <Menu.RadioItemGroup class="lone" bind:value={() => (entry.checked ? entry.id : undefined), () => {}} aria-labelledby={null}>{@render loose(entry)}</Menu.RadioItemGroup>
                  {:else}
                    {@render loose(entry)}
                  {/if}
                {/each}
              {/snippet}
            </Menu.Context>
          </Scroller>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  </div>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's DropdownMenuContent and DropdownMenuItem: a highlighted item takes the accent, a danger item the
    danger colour and a tint of it when highlighted, a locked item half its strength.
  - AgentFlow's separator reaches across the content's 4px padding to its border. The scroller's viewport clips what
    leaves its padding box, so the scroller reaches out over the content's padding and its viewport pads the items back
    in: the separator's negative margins then fall inside the viewport's padding and are painted. The scrollbar sits
    against the border, where a native one would.
  - A toned item (success, warning, info) takes the text colour of the kit's chip in that tone, and when highlighted a
    tint of the tone, as a danger item does with the danger colour. A locked trigger is the ghost button at half
    strength, as a locked item is, and in the tooltip's inline-block host so the bubble anchors to the button alone.
  - Forced colours replace the highlight's background with the canvas, so the highlighted item is painted in the
    system's highlight instead, opting out of the adjustment so its text is not given a canvas plate. The separator,
    drawn as a background, would vanish the same way, so it is painted in the system's text colour.
-->
<style>
  af-tooltip { display: block; }
  af-tooltip.lock { display: inline-block; }
  :global([data-scope='menu'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='menu'][data-part='content']) { display: flex; flex-direction: column; min-width: 128px; max-height: var(--available-height, none); padding: 4px; }
  :global([data-scope='menu'][data-part='content'][hidden]) { display: none; }
  :global([data-scope='menu'][data-part='item']) { position: relative; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 6px 8px;
    border: 0 solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 4px)); outline: none;
    font-size: 14px; line-height: 20px; cursor: default; -webkit-user-select: none; user-select: none; }
  :global([data-scope='menu'][data-part='item'][data-highlighted]) { background-color: var(--k-accent); color: var(--k-accent-fg); }
  :global([data-scope='menu'][data-part='item'][data-danger]) { color: var(--k-danger); }
  :global([data-scope='menu'][data-part='item'][data-danger][data-highlighted]) {
    background-color: color-mix(in oklab, var(--k-danger) calc(10% + var(--k-dark, 0) * 10%), transparent); color: var(--k-danger); }
  :global([data-scope='menu'][data-part='item'][data-tone='success']) { --k-tone: var(--k-success); }
  :global([data-scope='menu'][data-part='item'][data-tone='warning']) { --k-tone: var(--k-warning); }
  :global([data-scope='menu'][data-part='item'][data-tone='info']) { --k-tone: var(--k-info); }
  :global([data-scope='menu'][data-part='item'][data-tone]) { color: color-mix(in oklab, var(--k-tone) 75%, var(--k-fg)); }
  :global([data-scope='menu'][data-part='item'][data-tone][data-highlighted]) {
    background-color: color-mix(in oklab, var(--k-tone) calc(10% + var(--k-dark, 0) * 10%), transparent); color: color-mix(in oklab, var(--k-tone) 75%, var(--k-fg)); }
  :global([data-scope='menu'][data-part='item'][aria-disabled='true']) { opacity: 0.5; }
  :global([data-scope='menu'][data-part='item'][data-type]) { padding-inline: 32px 8px; }
  :global([data-scope='menu'][data-part='item-indicator']) { position: absolute; inset-inline-start: 8px; display: flex; align-items: center; justify-content: center;
    width: 14px; height: 14px; pointer-events: none; }
  :global([data-scope='menu'][data-part='item-indicator'][hidden]) { display: none; }
  :global([data-scope='menu'][data-part='item-indicator'] svg) { flex-shrink: 0; }
  :global([data-scope='menu'][data-part='item-group-label']) { box-sizing: border-box; padding: 6px 8px; border: 0 solid var(--k-line); font-size: 14px; line-height: 20px; font-weight: 500; }
  :global([data-scope='menu'][data-part='content'] > [data-scope='scroll-area'][data-part='root']) { margin-inline: -4px; }
  :global([data-scope='menu'][data-part='content'] > [data-scope='scroll-area'] > [data-part='viewport']) { padding-inline: 4px; }
  :global([data-scope='menu'][data-part='separator']) { height: 1px; margin: 4px -4px; background-color: var(--k-line); }
  :global([data-scope='menu'][data-part='item-group'].lone) { display: contents; }
  @media (forced-colors: active) {
    :global([data-scope='menu'][data-part='item'][data-highlighted]), :global([data-scope='menu'][data-part='item'][data-tone][data-highlighted]) { forced-color-adjust: none; background-color: Highlight; color: HighlightText; }
    :global([data-scope='menu'][data-part='separator']) { forced-color-adjust: none; background-color: CanvasText; }
  }
</style>
