<svelte:options customElement={{ shadow: { mode: 'open', delegatesFocus: true }, extend: formAssociate, props: { options: { type: 'Array' }, value: { attribute: 'value' }, multiple: { attribute: 'multiple', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' }, size: { attribute: 'size', type: 'String' } } }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';
</script>

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Select, createListCollection, useSelect } from '@ark-ui/svelte/select';
  import Direction from './Direction.svelte';
  import KitStyles from './KitStyles.svelte';
  import { on } from 'svelte/events';
  import { directionOf, emit, raise } from './environment.js';
  import { isClaimed } from './escape.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import Scroller, { revealItem } from './scroll/Scroller.svelte';
  import { kitText, orEnglish } from './text.js';
  import type { KitStrings, SelectOption } from './index.js';

  let {
    options = [], value = null, multiple = false, placeholder = null, label = null, disabled = false, locale = null, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false, size = null,
  }: {
    options?: SelectOption[] | null; value?: string | string[] | null; multiple?: boolean | null; placeholder?: string | null;
    label?: string | null; disabled?: boolean | null; locale?: string | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
    size?: string | null;
  } = $props();
  const self = $host();
  const dir = directionOf(self);
  const id = $props.id();
  const text = $derived(kitText(locale, strings ?? undefined));
  // A repeated value would break the keyed list, so the first option with a value wins and a value names each option once.
  const all = $derived.by(() => {
    const seen = new Set<string>();
    return (options ?? []).filter((o) => !seen.has(o.value) && !!seen.add(o.value));
  });
  const byValue = $derived(new Map(all.map((o) => [o.value, o])));
  const selected = $derived([...new Set(Array.isArray(value) ? value : value ? [value] : [])]);
  // A value the options do not hold shows nothing of its own: the placeholder stands in, never the raw value.
  const shown = $derived(selected.filter((v) => byValue.has(v)).map((v) => byValue.get(v)!.label).join(', '));
  const collection = $derived(createListCollection<SelectOption>({
    items: all, itemToValue: (o) => o.value, itemToString: (o) => o.label, isItemDisabled: (o) => !!o.disabled,
  }));

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const described = $derived([description, error].filter(Boolean).join(' '));

  const send = (next: string[]) => emit(self, 'change', { value: multiple ? next : (next[0] ?? null) });

  const api = useSelect(() => ({
    id,
    dir,
    getRootNode: () => self.shadowRoot!,
    collection,
    multiple: !!multiple,
    value: selected,
    disabled: locked,
    readOnly: !!readonly,
    invalid: !!invalid,
    required: !!required,
    positioning: { strategy: 'fixed' as const, placement: 'bottom-start' as const, sameWidth: true },
    scrollToIndexFn: revealItem,
    onValueChange: (d: { value: string[] }) => send(d.value),
  }));
  let positioner = $state<HTMLElement | null>(null);
  let content = $state<HTMLElement | null>(null);
  let trigger = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, api().open, self));
  // Zag's select takes no Escape callback and leaves a cancelled Escape alone, so an Escape a page's layer handed over
  // with claimEscape is heard on the host, after Zag's own document listener has passed it by.
  $effect(() => on(self, 'keydown', (e) => {
    if (e.key === 'Escape' && isClaimed(e) && e.defaultPrevented && api().open) api().setOpen(false);
  }));

  // Typing a letter on the closed trigger opens the list and hands the letter to the list's own type-ahead, which
  // highlights the first option it starts. The value changes only when the person picks the highlighted option. Focus
  // moves into the list a frame after it opens, so a letter typed on the trigger before then is handed over too.
  function onTriggerKey(e: KeyboardEvent) {
    if (locked || readonly || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1 || e.key === ' ') return;
    e.preventDefault();
    if (!api().open) api().setOpen(true);
    // Not composed: the list's own handler is in this shadow root, and a page's listeners heard the letter once already.
    content?.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, bubbles: true, composed: false }));
  }

  // `name`, `disabled` and `readonly` reflect to their attributes: the browser reads the host's attributes, not its
  // properties, to submit a string value, to leave a disabled control out, and to bar a read-only one from validation.
  $effect(() => {
    const missing = !!required && selected.length === 0;
    writeForm(self, {
      name,
      value: multiple ? selected : (selected[0] ?? null),
      validity: missing ? { valueMissing: true } : {},
      message: missing ? orEnglish(text, 'valueMissing') : '',
      anchor: trigger,
    });
  });
  // A controlled element cannot reset itself, so a form's reset asks the page for the value it was written with.
  onFormEvents(self, {
    reset() {
      const attribute = self.getAttribute('value');
      const initial = attribute ? [attribute] : [];
      if (initial.length !== selected.length || initial.some((v, i) => v !== selected[i])) send(initial);
    },
    disabled(next) { formDisabled = next; },
  });

  // Svelte's attribute types predate aria-description, so it goes in by spread.
  const reasoned = (reason: string | null | undefined): Record<string, string> => (reason ? { 'aria-description': reason } : {});
</script>

{#snippet option(item: SelectOption, extra: Record<string, string>)}
  <Select.Item {item} part="option" {...extra}>
    <Select.ItemText>{item.label}</Select.ItemText>
    <span class="check"><Select.ItemIndicator><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg></Select.ItemIndicator></span>
  </Select.Item>
{/snippet}

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
<Direction {dir}>
  <div class="af-kit">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    <Select.RootProvider value={api}>
      <!-- No label element is drawn, so the trigger and the list are named from `label` rather than pointing at one. -->
      <Select.Trigger bind:ref={trigger} part="trigger" aria-label={label || undefined} aria-labelledby={null}
        aria-describedby={described ? 'af-described' : undefined} aria-readonly={readonly ? 'true' : undefined} data-placeholder={shown ? undefined : ''} data-size={size === 'sm' ? 'sm' : undefined} onkeydowncapture={onTriggerKey}>
        <span part="value">{shown || placeholder || ''}</span>
        <Select.Indicator part="indicator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></Select.Indicator>
      </Select.Trigger>
      <Select.Positioner bind:ref={positioner} popover="manual">
        <Select.Content bind:ref={content} class="af-overlay" part="content" aria-label={label || undefined} aria-labelledby={null}>
          <Scroller tabStop={false}>
            {#each collection.items as item (item.value)}
              {#if item.disabled}
                <af-tooltip text={item.reason ?? ''}>
                  <!-- The tooltip cannot describe across its shadow root, so the reason is the option's own description too. -->
                  {@render option(item, reasoned(item.reason))}
                </af-tooltip>
              {:else}
                {@render option(item, {})}
              {/if}
            {/each}
            {#if collection.items.length === 0}<div part="empty">{text.noOptions}</div>{/if}
          </Scroller>
        </Select.Content>
      </Select.Positioner>
    </Select.RootProvider>
  </div>
</Direction>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The trigger is AgentFlow's SelectTrigger at its default size: an Input's box at 14px with the chosen labels cut off
    by an ellipsis, the placeholder muted, and the chevron at half strength. Focus rings it and `invalid` turns its
    border and ring to the danger tone, as an Input does.
    `size="sm"` is SelectTrigger's small size: 32px high, the type and padding unchanged.
  - The list is AgentFlow's SelectContent, at least as wide as the trigger and wider for a longer label, as Radix's
    popper list is. Its options are SelectItem: the highlighted one in the accent, the chosen one marked by a check
    at the end, a disabled one at half strength. A disabled option keeps its pointer events, so its reason can show
    on hover.
  - Forced colours drop box-shadow and backgrounds: focus falls back to an outline and the highlighted option is
    painted in the system's highlight.
-->
<style>
  :host { display: inline-block; max-width: 100%; vertical-align: middle; }
  af-tooltip { display: block; }
  [part='value'] { flex: 1 1 auto; min-width: 0; overflow: hidden; text-align: start; text-overflow: ellipsis; white-space: nowrap; }
  .check { position: absolute; right: 8px; display: flex; align-items: center; justify-content: center; width: 14px; height: 14px; }
  svg { flex: none; width: 16px; height: 16px; pointer-events: none; }
  :global([data-scope='select'][hidden]) { display: none !important; }
  :global([data-scope='select'][data-part='trigger']) { display: flex; align-items: center; justify-content: space-between; gap: 8px; box-sizing: border-box;
    width: 100%; height: 36px; margin: 0; padding: 8px 12px; border: 1px solid var(--k-input); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); color: inherit; font: inherit; font-size: 14px; line-height: 20px; white-space: nowrap; outline: none; cursor: default;
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  :global([data-scope='select'][data-part='trigger'][data-size='sm']) { height: 32px; }
  @media (hover: hover) {
    :global([data-scope='select'][data-part='trigger']:hover:not(:disabled)) {
      background-color: color-mix(in oklab, color-mix(in oklab, var(--k-input) 50%, transparent) calc(var(--k-dark, 0) * 100%), transparent); }
  }
  :global([data-scope='select'][data-part='trigger'][data-placeholder]) { color: var(--k-muted); }
  :global([data-scope='select'][data-part='trigger']:focus-visible) { border-color: var(--k-focus-border);
    box-shadow: 0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='select'][data-part='trigger'][aria-invalid='true']) { border-color: var(--k-danger); }
  :global([data-scope='select'][data-part='trigger'][aria-invalid='true']:focus-visible) {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  :global([data-scope='select'][data-part='trigger']:disabled) { opacity: 0.5; cursor: not-allowed; }
  :global([data-scope='select'][data-part='indicator']) { display: flex; color: var(--k-muted); opacity: 0.5; }
  :global([data-scope='select'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='select'][data-part='content']) { box-sizing: border-box; display: flex; flex-direction: column; width: max-content; min-width: max(128px, 100%);
    max-width: var(--available-width, 100vw); max-height: var(--available-height, 300px); padding: 4px; outline: none; }
  :global([data-scope='select'][data-part='item']) { position: relative; box-sizing: border-box; display: flex; align-items: center; gap: 8px; width: 100%;
    padding: 6px 32px 6px 8px; border: 0 solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 4px)); outline: none; font-size: 14px; line-height: 20px;
    cursor: default; -webkit-user-select: none; user-select: none; }
  :global([data-scope='select'][data-part='item'][data-highlighted]) { background-color: var(--k-accent); color: var(--k-accent-fg); }
  :global([data-scope='select'][data-part='item'][data-disabled]) { opacity: 0.5; }
  :global([data-scope='select'][data-part='item'] .check) { color: var(--k-muted); }
  [part='empty'] { padding: 24px 0; font-size: 14px; line-height: 20px; text-align: center; }
  @media (prefers-reduced-motion: reduce) { :global([data-scope='select'][data-part='trigger']) { transition: none; } }
  @media (forced-colors: active) {
    :global([data-scope='select'][data-part='trigger']:focus-visible) { outline: 2px solid; outline-offset: 2px; }
    :global([data-scope='select'][data-part='item'][data-highlighted]) { forced-color-adjust: none; background-color: Highlight; color: HighlightText; }
  }
</style>
