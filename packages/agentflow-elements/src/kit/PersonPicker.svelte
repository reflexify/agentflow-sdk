<svelte:options customElement={{ shadow: 'open', props: { people: { type: 'Array' }, value: { attribute: 'value' }, multiple: { attribute: 'multiple', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, loading: { attribute: 'loading', type: 'Boolean' }, locale: { attribute: 'locale', type: 'String' }, disabled: { attribute: 'disabled', type: 'Boolean' }, strings: { type: 'Object' } } }} />

<script module lang="ts">
  // "đ" has no canonical decomposition, so it is folded by hand; an Intl.Collator at base sensitivity keeps it apart from "d".
  const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

  function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean).map((w) => Array.from(w)[0]!.toUpperCase());
    if (words.length === 0) return '';
    return words.length === 1 ? words[0]! : words[0]! + words[words.length - 1]!;
  }
</script>

<script lang="ts">
  import { Combobox, createListCollection } from '@ark-ui/svelte/combobox';
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { kitText } from './text.js';
  import type { KitStrings, Person } from './index.js';

  let {
    people = [], value = null, multiple = false, placeholder = null, label = null, loading = false, locale = null, disabled = false, strings = null,
  }: {
    people?: Person[] | null; value?: string | string[] | null; multiple?: boolean | null; placeholder?: string | null;
    label?: string | null; loading?: boolean | null; locale?: string | null; disabled?: boolean | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
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
  // An id the list does not hold shows as unknown, never as a raw id, and numbered when there are several. While `loading`
  // it shows as an ellipsis rather than a person the viewer would think is gone, and while the list is empty as nothing.
  const unknown = $derived(selected.filter((id) => !byId.has(id)));
  const nameOf = (id: string): string =>
    byId.get(id)?.name ?? (loading ? '…' : all.length === 0 ? '' : unknown.length > 1 ? `${text.unknownPerson} ${unknown.indexOf(id) + 1}` : text.unknownPerson);
  const inputText = $derived(typed ?? (multiple || !selected[0] ? '' : byId.has(selected[0]) ? byId.get(selected[0])!.name : loading ? '' : nameOf(selected[0])));
  const needle = $derived(fold((typed ?? '').trim()));
  const filtered = $derived(needle === '' ? all : all.filter((p) => fold(p.name).includes(needle) || fold(p.email ?? '').includes(needle)));
  const collection = $derived(createListCollection<Person>({ items: filtered, itemToValue: (p) => p.id, itemToString: (p) => p.name }));
  let open = $state(false);
  let positioner = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, open, self));

  const send = (next: string[]) => emit(self, 'change', { value: multiple ? next : (next[0] ?? null) });
</script>

{#snippet avatar(person: Person)}
  <span class="af-avatar">{#if person.avatar}<img src={person.avatar} alt="" />{:else if byId.has(person.id)}{initials(person.name)}{:else}?{/if}</span>
{/snippet}

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit">
    <Combobox.Root
      {collection}
      multiple={!!multiple}
      disabled={!!disabled}
      inputBehavior="autohighlight"
      positioning={{ strategy: 'fixed', placement: 'bottom-start' }}
      bind:open
      bind:value={() => selected, () => {}}
      bind:inputValue={() => inputText, () => {}}
      onValueChange={(d) => send(d.value)}
      onInputValueChange={(d) => {
        if (d.reason !== 'input-change') { typed = null; return; }
        typed = d.inputValue;
        emit(self, 'search', { query: d.inputValue });
      }}
      onOpenChange={(d) => { if (!d.open) typed = null; }}
    >
      <Combobox.Control part="control">
        {#if multiple}
          {#each selected as id (id)}
            {@const person = byId.get(id) ?? { id, name: nameOf(id) }}
            <span class="af-chip" part="chip">
              {@render avatar(person)}
              <span>{person.name}</span>
              <button type="button" part="remove" aria-label="{text.remove}: {person.name}" disabled={!!disabled}
                onclick={() => send(selected.filter((s) => s !== id))}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </span>
          {/each}
        {:else if selected[0]}
          {@const person = byId.get(selected[0]) ?? { id: selected[0], name: nameOf(selected[0]) }}
          <span class="lead">{@render avatar(person)}</span>
        {/if}
        <Combobox.Input part="input" autocomplete="off" spellcheck="false" placeholder={placeholder ?? ''} aria-label={label || undefined} />
        {#if !multiple && selected[0] && !disabled}
          <button type="button" part="clear" class="af-button ghost" aria-label={text.clear} onclick={() => send([])}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
        {/if}
      </Combobox.Control>
      <Combobox.Positioner bind:ref={positioner} popover="manual">
        <Combobox.Content class="af-overlay people" part="content">
          {#each collection.items as item (item.id)}
            <Combobox.Item {item} part="option">
              {@render avatar(item)}
              <span class="who">
                <span class="name">{item.name}</span>
                {#if item.email}<span class="mail">{item.email}</span>{/if}
              </span>
            </Combobox.Item>
          {/each}
          <Combobox.Empty part="empty">{text.noResults}</Combobox.Empty>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  </div>
</EnvironmentProvider>

<style>
  [part='chip'] button, [part='clear'] { display: inline-grid; flex: none; place-items: center; width: 24px; height: 24px; min-height: 0; padding: 0;
    border: 0; border-radius: max(0px, calc(var(--k-radius) - 4px)); background: transparent; color: var(--k-muted); cursor: pointer; }
  [part='chip'] button:hover:not(:disabled), [part='clear']:hover { background: color-mix(in oklab, var(--k-fg) 7%, transparent); color: var(--k-fg); }
  [part='chip'] button:focus-visible, [part='clear']:focus-visible { outline: 2px solid var(--k-ring); outline-offset: -2px; }
  [part='chip'] { padding-right: 2px; }
  .lead { display: inline-flex; }
  :global([data-scope='combobox'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='combobox'][hidden]) { display: none !important; }
  :global([data-scope='combobox'][data-part='control']) { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; min-width: 14em; min-height: 32px; padding: 2px 6px;
    border: 1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%); border-radius: max(0px, calc(var(--k-radius) - 2px)); background: var(--k-surface); }
  :global([data-scope='combobox'][data-part='control']:focus-within) { outline: 2px solid var(--k-ring); outline-offset: 2px; }
  :global([data-scope='combobox'][data-part='input']) { flex: 1; min-width: 6em; border: 0; outline: none; background: transparent; color: inherit; font: inherit; }
  :global([data-scope='combobox'][data-part='input']::placeholder) { color: var(--k-muted); }
  :global([data-scope='combobox'][data-part='content']) { max-height: 280px; overflow: auto; padding: 4px; }
  :global([data-scope='combobox'][data-part='item']) { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; cursor: pointer; }
  :global([data-scope='combobox'][data-part='item'][data-highlighted]) { background: color-mix(in oklab, var(--k-primary) 10%, transparent); }
  :global([data-scope='combobox'][data-part='item'][data-state='checked']) { font-weight: 600; }
  :global([data-scope='combobox'][data-part='item'] .who) { display: flex; flex-direction: column; min-width: 0; }
  :global([data-scope='combobox'][data-part='item'] .mail) { color: var(--k-muted); font-size: 12px; }
  :global([data-scope='combobox'][data-part='empty']) { padding: 8px; color: var(--k-muted); }
</style>
