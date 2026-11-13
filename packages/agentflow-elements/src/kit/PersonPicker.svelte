<svelte:options customElement={{ shadow: { mode: 'open', delegatesFocus: true }, extend: formAssociate, props: { people: { type: 'Array' }, source: { type: 'Object' }, value: { attribute: 'value' }, multiple: { attribute: 'multiple', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, loading: { attribute: 'loading', type: 'Boolean' }, locale: { attribute: 'locale', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' } } }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';

  function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean).map((w) => Array.from(w)[0]!.toUpperCase());
    if (words.length === 0) return '';
    return words.length === 1 ? words[0]! : words[0]! + words[words.length - 1]!;
  }
</script>

<script lang="ts">
  import { Combobox, createListCollection } from '@ark-ui/svelte/combobox';
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { matches } from '@reflexify/agentflow-sdk';
  import type { PickerSource } from '@reflexify/agentflow-sdk';
  import ComboboxStyles from './ComboboxStyles.svelte';
  import Scroller, { revealItem } from './scroll/Scroller.svelte';
  import Direction from './Direction.svelte';
  import KitStyles from './KitStyles.svelte';
  import { deepActiveElement, directionOf, emit, raise } from './environment.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { kitText, orEnglish } from './text.js';
  import { followSource, paged } from './picker/paged.svelte.js';
  import type { KitStrings, Person } from './index.js';

  let {
    people = [], source = null, value = null, multiple = false, placeholder = null, label = null, loading = false, locale = null, disabled = false, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
  }: {
    people?: Person[] | null; source?: PickerSource<Person> | null; value?: string | string[] | null; multiple?: boolean | null; placeholder?: string | null;
    label?: string | null; loading?: boolean | null; locale?: string | null; disabled?: boolean | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
  } = $props();
  const self = $host();
  const dir = directionOf(self);
  const text = $derived(kitText(locale, strings ?? undefined));
  // A repeated id would break the keyed lists, so the first person with an id wins and a value names each id once.
  const all = $derived.by(() => {
    const seen = new Set<string>();
    return (people ?? []).filter((p) => !seen.has(p.id) && !!seen.add(p.id));
  });
  const byId = $derived(new Map(all.map((p) => [p.id, p])));
  const selected = $derived([...new Set(Array.isArray(value) ? value : value ? [value] : [])]);
  // What the user has typed since the list opened; null shows the chosen person's name (single) or nothing (multiple).
  let typed = $state<string | null>(null);
  let open = $state(false);

  // With a source, the list is its pages and every person a page or `resolve` has named stays named, so a chosen id keeps
  // its name after the list moves on.
  const pager = paged<Person>((p) => p.id);
  followSource(pager, () => source, () => selected, () => {
    if (open) pager.now(typed ?? '');
  });

  const known = (id: string): Person | undefined => (source ? pager.named.get(id) : byId.get(id));
  // An id nothing has named shows as unknown, never as a raw id, and numbered when there are several. While `loading`,
  // or while a call or lookup that could name it runs, it shows as an ellipsis rather than a person the viewer would
  // think is gone; before anything was asked, or while the list of people is empty, as nothing.
  const unknown = $derived(selected.filter((id) => !known(id)));
  function nameOf(id: string): string {
    const hit = known(id);
    if (hit) return hit.name;
    if (loading || (source && pager.pending(id))) return '…';
    const answered = source ? pager.answered(id) : all.length > 0;
    if (!answered) return '';
    return unknown.length > 1 ? `${text.unknownPerson} ${unknown.indexOf(id) + 1}` : text.unknownPerson;
  }
  const inputText = $derived(typed ?? (multiple || !selected[0] ? '' : !source && loading && !byId.has(selected[0]) ? '' : nameOf(selected[0])));
  const filtered = $derived(source ? pager.items : all.filter((p) => matches(p.name, typed ?? '') || matches(p.email, typed ?? '')));
  const collection = $derived(createListCollection<Person>({ items: filtered, itemToValue: (p) => p.id, itemToString: (p) => p.name }));
  const waiting = $derived(!!source && (!!loading || pager.busy));
  let positioner = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, open, self));

  const send = (next: string[]) => emit(self, 'change', { value: multiple ? next : (next[0] ?? null) });

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const fixed = $derived(locked || !!readonly);
  const described = $derived([description, error].filter(Boolean).join(' '));
  let input = $state<HTMLInputElement | null>(null);
  // When the input last lost focus and last took it, as event times, for telling a press outside from a label's click.
  let leftAt = -Infinity;
  let backAt = -Infinity;
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
      if (initial.length !== selected.length || initial.some((id, i) => id !== selected[i])) send(initial);
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
</script>

{#snippet avatar(person: Person)}
  <span class="af-avatar sm">{#if person.avatar}<img src={person.avatar} alt="" />{:else if known(person.id)}{initials(person.name)}{:else}?{/if}</span>
{/snippet}

<KitStyles />
<ComboboxStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
<Direction {dir}>
  <div class="af-kit">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    <!-- With a source, the first item is not highlighted as the person types: the list on screen may still be the
      answer to earlier text, and Enter would pick from it.
      The input's text is the element's own: `preserve` stops Ark writing the chosen names into it when `value`
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
      onInteractOutside={(e) => {
        // Zag judges a press outside a frame after it, so a quick click on the field's label, which focuses the input,
        // is judged after the first key typed there, and closing the list then would wipe that key. Only a press that
        // took focus from the input and gave it back keeps the list: focus merely left in the input is no sign, since a
        // tap on iOS or a press whose target keeps focus where it was leaves it there and must still close the list.
        const press = e.detail.originalEvent.timeStamp;
        if (input && deepActiveElement() === input && leftAt >= press && backAt >= leftAt) e.preventDefault();
      }}
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
            {@const person = known(id) ?? { id, name: nameOf(id) }}
            <span class="af-chip secondary" part="chip">
              {@render avatar(person)}
              <span>{person.name}</span>
              <button type="button" part="remove" aria-label="{text.remove}: {person.name}" disabled={fixed}
                onclick={() => send(selected.filter((s) => s !== id))}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </span>
          {/each}
        {:else if selected[0]}
          {@const person = known(selected[0]) ?? { id: selected[0], name: nameOf(selected[0]) }}
          <span class="lead">{@render avatar(person)}</span>
        {/if}
        <Combobox.Input bind:ref={input} onfocusout={(e: FocusEvent) => (leftAt = e.timeStamp)} onfocusin={(e: FocusEvent) => (backAt = e.timeStamp)} part="input" autocomplete="off" spellcheck="false" placeholder={placeholder ?? ''} aria-label={label || undefined}
          aria-describedby={described ? 'af-described' : undefined} aria-required={required ? 'true' : undefined} />
        {#if !multiple && selected[0] && !fixed}
          <button type="button" part="clear" class="af-button ghost icon xs" aria-label={text.clear} onclick={() => send([])}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
        {/if}
      </Combobox.Control>
      <Combobox.Positioner bind:ref={positioner} popover="manual">
        <Combobox.Content class="af-overlay people" part="content">
          <Scroller tabStop={false}>
            {#each collection.items as item (item.id)}
              <Combobox.Item {item} part="option">
                {@render avatar(item)}
                <span class="lines">
                  <span class="name">{item.name}</span>
                  {#if item.email}<span class="detail">{item.email}</span>{/if}
                </span>
              </Combobox.Item>
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
</Direction>
</EnvironmentProvider>

<!-- The control, the chips and the list share af-combobox's look, in ComboboxStyles. In single mode the chosen
  person's avatar leads the input. -->
<style>
  .lead { display: inline-flex; margin-right: 8px; }
</style>
