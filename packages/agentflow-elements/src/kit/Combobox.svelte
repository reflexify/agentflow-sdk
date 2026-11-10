<svelte:options customElement={{ shadow: { mode: 'open', delegatesFocus: true }, extend: formAssociate, props: { options: { type: 'Array' }, source: { type: 'Object' }, value: { attribute: 'value' }, multiple: { attribute: 'multiple', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, loading: { attribute: 'loading', type: 'Boolean' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' } } }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';
  import type { ComboboxOption } from './index.js';

  // A repeated value would break the keyed list, so the first item with a value wins.
  function unique(items: readonly ComboboxOption[]): ComboboxOption[] {
    const seen = new Set<string>();
    return items.filter((o) => !seen.has(o.value) && !!seen.add(o.value));
  }
</script>

<script lang="ts">
  import { Combobox, createListCollection } from '@ark-ui/svelte/combobox';
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { matches } from '@reflexify/agentflow-sdk';
  import type { PickerSource } from '@reflexify/agentflow-sdk';
  import ComboboxStyles from './ComboboxStyles.svelte';
  import Scroller, { revealItem } from './scroll/Scroller.svelte';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { kitText, orEnglish } from './text.js';
  import { followSource, paged } from './picker/paged.svelte.js';
  import type { KitStrings } from './index.js';

  let {
    options = [], source = null, value = null, multiple = false, placeholder = null, label = null, loading = false, disabled = false, locale = null, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
  }: {
    options?: ComboboxOption[] | null; source?: PickerSource<ComboboxOption> | null; value?: string | string[] | null; multiple?: boolean | null;
    placeholder?: string | null; label?: string | null; loading?: boolean | null; disabled?: boolean | null; locale?: string | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const given = $derived(unique(options ?? []));
  const byValue = $derived(new Map(given.map((o) => [o.value, o])));
  const selected = $derived([...new Set(Array.isArray(value) ? value : value ? [value] : [])]);
  // What the person has typed since the list opened; null shows the chosen name (single) or nothing (multiple).
  let typed = $state<string | null>(null);
  let open = $state(false);

  // The source's side. Every item a page or `resolve` has named stays named, so a chosen value keeps its name after the
  // list moves on.
  const pager = paged<ComboboxOption>((o) => o.value);
  // A new source function restarts the list, and it is asked afresh if the list is open.
  followSource(pager, () => source, () => selected, () => {
    if (open) pager.now(typed ?? '');
  });

  const named = (id: string): ComboboxOption | undefined => (source ? pager.named.get(id) : byValue.get(id));
  // A value nothing has named never shows as a raw id. While a call or a lookup that could name it runs, or typing
  // waits to ask, it shows as an ellipsis; once they have answered, as unknown, numbered when there are several; and
  // before anything was asked, as nothing.
  const unknown = $derived(selected.filter((id) => !named(id)));
  function nameOf(id: string): string {
    const hit = named(id);
    if (hit) return hit.label;
    if (loading || (source && pager.pending(id))) return '…';
    const answered = source ? pager.answered(id) : given.length > 0;
    if (!answered) return '';
    return unknown.length > 1 ? `${text.unknownOption} ${unknown.indexOf(id) + 1}` : text.unknownOption;
  }
  const inputText = $derived(typed ?? (multiple || !selected[0] ? '' : nameOf(selected[0])));
  const items = $derived(source ? pager.items : given.filter((o) => matches(o.label, typed ?? '') || matches(o.description, typed ?? '')));
  const collection = $derived(createListCollection<ComboboxOption>({
    items, itemToValue: (o) => o.value, itemToString: (o) => o.label, isItemDisabled: (o) => !!o.disabled,
  }));
  const waiting = $derived(!!loading || pager.busy);

  let positioner = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, open, self));

  const send = (next: string[]) => emit(self, 'change', { value: multiple ? next : (next[0] ?? null) });

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const fixed = $derived(locked || !!readonly);
  const described = $derived([description, error].filter(Boolean).join(' '));
  let input = $state<HTMLInputElement | null>(null);
  // `name`, `disabled` and `readonly` reflect to their attributes: the browser reads the host's attributes, not its
  // properties, to submit a string value, to leave a disabled control out, and to bar a read-only one from validation.
  $effect(() => {
    const missing = !!required && selected.length === 0;
    writeForm(self, {
      name,
      value: multiple ? selected : (selected[0] ?? null),
      validity: missing ? { valueMissing: true } : {},
      message: missing ? orEnglish(text, 'valueMissing') : '',
      anchor: input,
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

  // With delegatesFocus a press on a chip's text or the control's padding would focus the first remove button, where
  // Space or Enter would drop a value; it focuses the input instead. A press on a button is the button's.
  function pressControl(e: MouseEvent) {
    const target = e.target as Element;
    if (target === input || target.closest('button')) return;
    e.preventDefault();
    input?.focus();
  }

  // Svelte's attribute types predate aria-description, so it goes in by spread.
  const reasoned = (reason: string | null | undefined): Record<string, string> => (reason ? { 'aria-description': reason } : {});
</script>

{#snippet option(item: ComboboxOption, extra: Record<string, string>)}
  <Combobox.Item {item} part="option" {...extra}>
    <span class="lines">
      <span>{item.label}</span>
      {#if item.description}<span class="detail">{item.description}</span>{/if}
    </span>
  </Combobox.Item>
{/snippet}

<KitStyles />
<ComboboxStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    <!-- With a source, the first item is not highlighted as the person types: the list on screen may still be the
      answer to earlier text, and Enter would pick from it.
      The input's text is the element's own: `preserve` stops Ark writing the chosen labels into it when `value`
      changes, which, with the page setting `value` back a moment after a pick, would wipe what the person has typed
      since. A pick clears the typed text here instead. -->
    <Combobox.Root
      {collection}
      multiple={!!multiple}
      disabled={locked}
      readOnly={!!readonly}
      invalid={!!invalid}
      inputBehavior={source ? 'none' : 'autohighlight'}
      selectionBehavior="preserve"
      positioning={{ strategy: 'fixed', placement: 'bottom-start' }}
      scrollToIndexFn={revealItem}
      bind:open
      bind:value={() => selected, () => {}}
      bind:inputValue={() => inputText, () => {}}
      onValueChange={(d) => {
        // Text cleared by a pick in a list that stays open asks the source for the unfiltered list again.
        if (typed !== null && source && open) pager.search('');
        typed = null;
        send(d.value);
      }}
      onInputValueChange={(d) => {
        if (d.reason !== 'input-change') return;
        typed = d.inputValue;
        emit(self, 'search', { query: d.inputValue });
        if (source) pager.search(d.inputValue);
      }}
      onOpenChange={(d) => {
        if (!d.open) {
          typed = null;
          pager.stop();
        } else if (source && d.reason !== 'input-change') pager.now(typed ?? '');
      }}
    >
      <Combobox.Control part="control" onmousedown={pressControl}>
        {#if multiple}
          {#each selected as id (id)}
            {@const shown = nameOf(id)}
            <span class="af-chip secondary" part="chip">
              <span>{shown}</span>
              <button type="button" part="remove" aria-label="{text.remove}: {shown}" disabled={fixed}
                onclick={() => send(selected.filter((s) => s !== id))}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </span>
          {/each}
        {/if}
        <Combobox.Input bind:ref={input} part="input" autocomplete="off" spellcheck="false" placeholder={placeholder ?? ''} aria-label={label || undefined}
          aria-describedby={described ? 'af-described' : undefined} aria-required={required ? 'true' : undefined} />
        {#if !multiple && selected[0] && !fixed}
          <button type="button" part="clear" class="af-button ghost icon xs" aria-label={text.clear} onclick={() => send([])}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
        {/if}
      </Combobox.Control>
      <Combobox.Positioner bind:ref={positioner} popover="manual">
        <Combobox.Content class="af-overlay" part="content">
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
            {#if waiting}
              <div part="loading">{text.loading}</div>
            {:else}
              {#if source && pager.next}
                <!-- Pressing it keeps the focus in the input, so typing on and the list's keys still work. -->
                <button type="button" part="load-more" onpointerdown={(e) => e.preventDefault()} onclick={() => pager.more()}>{text.loadMore}</button>
              {/if}
              <Combobox.Empty part="empty">{text.noResults}</Combobox.Empty>
            {/if}
          </Scroller>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  </div>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The control, chips and list are af-person-picker's, in ComboboxStyles. An option is a row of AgentFlow's
    searchable-select: CommandItem with 12px each side, its description muted beneath the label. A disabled option is at
    half strength and keeps its pointer events, so its reason can show on hover.
-->
<style>
  :host { display: inline-block; max-width: 100%; vertical-align: middle; }
  af-tooltip { display: block; }
  :global([data-scope='combobox'][data-part='item'][part='option']) { padding: 6px 12px; }
  :global([data-scope='combobox'][data-part='item'][part='option'][data-disabled]) { opacity: 0.5; }
</style>
