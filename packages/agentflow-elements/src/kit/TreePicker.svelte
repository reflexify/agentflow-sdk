<svelte:options customElement={{ shadow: { mode: 'open', delegatesFocus: true }, extend: formAssociate, props: { nodes: { type: 'Array' }, source: { type: 'Object' }, value: { attribute: 'value' }, multiple: { attribute: 'multiple', type: 'Boolean' }, max: { attribute: 'max', type: 'Number' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, loading: { attribute: 'loading', type: 'Boolean' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' } } }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';
  import type { Branch } from './picker/forest.js';

  // A search's view of the forest: the branches it shows, each holding only its shown children.
  function prune(branches: Branch[], shown: Set<string>): Branch[] {
    return branches.filter((b) => shown.has(b.node.id)).map((b) => ({ ...b, children: prune(b.children, shown) }));
  }
</script>

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Popover } from '@ark-ui/svelte/popover';
  import { TreeView, createTreeCollection } from '@ark-ui/svelte/tree-view';
  import type { PickerSource, TreeNode } from '@reflexify/agentflow-sdk';
  import { untrack, type Snippet } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import ComboboxStyles from './ComboboxStyles.svelte';
  import Scroller from './scroll/Scroller.svelte';
  import Direction from './Direction.svelte';
  import KitStyles from './KitStyles.svelte';
  import { directionOf, emit, raise } from './environment.js';
  import { isClaimed } from './escape.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { fill, kitText, orEnglish } from './text.js';
  import { forest, matching } from './picker/forest.js';
  import { followSource, paged } from './picker/paged.svelte.js';
  import type { KitStrings } from './index.js';

  let {
    nodes = [], source = null, value = null, multiple = false, max = null, placeholder = null, label = null, loading = false, disabled = false, locale = null, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
  }: {
    nodes?: TreeNode[] | null; source?: PickerSource<TreeNode> | null; value?: string | string[] | null; multiple?: boolean | null; max?: number | null;
    placeholder?: string | null; label?: string | null; loading?: boolean | null; disabled?: boolean | null; locale?: string | null; strings?: Partial<KitStrings> | null;
    name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null; invalid?: boolean | null;
  } = $props();
  const self = $host();
  const dir = directionOf(self);
  const text = $derived(kitText(locale, strings ?? undefined));
  const selected = $derived([...new Set(Array.isArray(value) ? value : value ? [value] : [])]);
  // What the person has typed since the popup opened; null shows the chosen name (single) or nothing (multiple).
  let typed = $state<string | null>(null);
  let open = $state(false);

  // With a source, the forest is every page of the empty query, asked for on each open. Typing never reaches the source:
  // a server's search would drop the ancestors a match needs to have a place in the tree.
  const pager = paged<TreeNode>((n) => n.id);
  // The cursor last asked for, so a page that fails is not asked for again at once; the load-more row asks again.
  let chased: string | null = null;
  // The forest of the last load that reached its end. A reopen's load starts again at page one, which would shrink the
  // tree under the person, so it is drawn in place of the pages until that load ends too.
  let complete = $state.raw<TreeNode[] | null>(null);
  let loadingForest = false;
  function loadForest() {
    if (loadingForest && pager.busy) return;
    loadingForest = true;
    chased = null;
    pager.now('');
  }
  followSource(pager, () => source, () => selected, () => {
    complete = null;
    loadingForest = false;
    if (open) loadForest();
  });
  $effect(() => {
    const at = pager.next;
    if (!open || !source || pager.busy) return;
    if (at === null) {
      if (loadingForest) {
        loadingForest = false;
        // An empty forest, or a first page that failed, leaves nothing worth holding over the next load's pages.
        complete = pager.items.length ? pager.items : null;
      }
      return;
    }
    if (at === chased) return;
    chased = at;
    untrack(() => pager.more());
  });

  const all = $derived(source ? (complete ?? pager.items) : (nodes ?? []));
  const roots = $derived(forest(all));
  const byId = $derived(new Map(all.map((n) => [n.id, n])));
  const query = $derived((typed ?? '').trim());
  const found = $derived(query ? matching(roots, query) : null);
  const view = $derived(found ? prune(roots, found.shown) : roots);

  // Branches start open at the roots and closed below them; what the person opens or closes is kept, apart from what
  // they do during a search, which a new search forgets and clearing it leaves behind.
  const toggled = new SvelteMap<string, boolean>();
  const searchToggled = new SvelteMap<string, boolean>();
  const isOpen = (b: Branch) => (found ? (searchToggled.get(b.node.id) ?? found.open.has(b.node.id)) : (toggled.get(b.node.id) ?? b.depth === 0));
  const branches = $derived.by(() => {
    const out: Branch[] = [];
    const walk = (bs: Branch[]) => {
      for (const b of bs) if (b.children.length) { out.push(b); walk(b.children); }
    };
    walk(view);
    return out;
  });
  const expanded = $derived(branches.filter(isOpen).map((b) => b.node.id));
  function setExpanded(next: string[]) {
    const now = new Set(next);
    const kept = found ? searchToggled : toggled;
    for (const b of branches) if (isOpen(b) !== now.has(b.node.id)) kept.set(b.node.id, now.has(b.node.id));
  }

  const collection = $derived(createTreeCollection<Branch>({
    rootNode: { node: { id: '', parentId: null, label: '' }, depth: -1, children: view, ancestry: [] },
    nodeToValue: (b) => b.node.id,
    nodeToString: (b) => b.node.label,
    nodeToChildren: (b) => b.children,
  }));

  const known = (id: string): TreeNode | undefined => (source ? pager.named.get(id) : byId.get(id));
  // A value nothing has named never shows as a raw id: an ellipsis while something that could name it runs, unknown
  // (numbered when there are several) once everything has answered, and nothing before anything was asked.
  const unknown = $derived(selected.filter((id) => !known(id)));
  function nameOf(id: string): string {
    const hit = known(id);
    if (hit) return hit.label;
    if (loading || (source && pager.pending(id))) return '…';
    const answered = source ? pager.answered(id) : all.length > 0;
    if (!answered) return '';
    return unknown.length > 1 ? `${text.unknownOption} ${unknown.indexOf(id) + 1}` : text.unknownOption;
  }
  const inputText = $derived(typed ?? (multiple || !selected[0] ? '' : nameOf(selected[0])));
  const waiting = $derived(!!loading || (!!source && pager.busy));

  const full = $derived(!!multiple && max != null && selected.length >= max);
  // A disabled node, and at `max` every node not picked, is drawn but cannot be picked. Ark is not told: it would also
  // refuse to open or close such a branch, which would leave everything under it out of reach at `max`.
  const unpickable = (n: TreeNode) => !!n.disabled || (full && !selected.includes(n.id));
  const reasonOf = (n: TreeNode): string => (n.disabled ? (n.reason ?? '') : full && !selected.includes(n.id) ? fill(text.maxPicked, { max: max! }) : '');

  const send = (next: string[]) => emit(self, 'change', { value: multiple ? next : (next[0] ?? null) });

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const fixed = $derived(locked || !!readonly);
  const described = $derived([description, error].filter(Boolean).join(' '));
  let input = $state<HTMLInputElement | null>(null);
  let control = $state<HTMLElement | null>(null);
  let tree = $state<HTMLElement | null>(null);
  let positioner = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, open, self));

  function setOpen(next: boolean) {
    if (next === open || (next && fixed)) return;
    open = next;
    if (next) {
      if (source) loadForest();
    } else {
      typed = null;
      searchToggled.clear();
      pager.stop();
      loadingForest = false;
    }
  }

  function pick(id: string) {
    const n = byId.get(id);
    if (!n || fixed || unpickable(n)) return;
    if (multiple) {
      send(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
      return;
    }
    if (selected[0] !== id) send([id]);
    setOpen(false);
    input?.focus();
  }

  // The tree's typeahead takes a Space as part of the text being typed, so a Space picks only when none is running. The
  // machine keeps no reading of that for the page, so it is followed here: a key the tree types begins it, each further
  // key, a Space among them, runs it on, and it ends when the tree forgets what was typed, 350 ms after the last.
  const TYPEAHEAD_MS = 350;
  let typingAhead = false;
  let typingTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => () => clearTimeout(typingTimer));
  const typeable = (e: KeyboardEvent) => e.key.length === 1 && e.key !== ' ' && e.key !== '*' && !e.ctrlKey && !e.metaKey;

  // Enter picks the node with focus, and so does Space once no typeahead runs; the arrows, Home, End and typeahead are the tree's own.
  function pickByKey(e: KeyboardEvent) {
    if (e.key === ' ' ? typingAhead : typeable(e)) {
      typingAhead = true;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => (typingAhead = false), TYPEAHEAD_MS);
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const id = (e.target as Element).closest<HTMLElement>('[data-part="item"], [data-part="branch-control"]')?.dataset.value;
    if (id === undefined) return;
    e.preventDefault();
    pick(id);
  }

  // ArrowDown from the input enters the tree, at the chosen node when it shows, else where the tree's focus was.
  function enterTree() {
    const shown = [...(tree?.querySelectorAll<HTMLElement>('[data-part="item"], [data-part="branch-control"]') ?? [])].filter((r) => !r.closest('[hidden]'));
    (shown.find((r) => r.dataset.value === selected[0]) ?? shown.find((r) => r.tabIndex === 0) ?? shown[0])?.focus();
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowDown' || fixed) return;
    e.preventDefault();
    if (open) enterTree();
    else setOpen(true);
  }

  function onInput(e: Event) {
    const q = (e.currentTarget as HTMLInputElement).value;
    typed = q;
    searchToggled.clear();
    emit(self, 'search', { query: q });
    setOpen(true);
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
  const refusal = (n: TreeNode): Record<string, string> => {
    if (!unpickable(n)) return {};
    const reason = reasonOf(n);
    return reason ? { 'aria-disabled': 'true', 'aria-description': reason } : { 'aria-disabled': 'true' };
  };
</script>

{#snippet row(branch: Branch)}
  {@const n = branch.node}
  {@const on = selected.includes(n.id)}
  {#if branch.children.length}
    <TreeView.BranchTrigger part="toggle" tabindex={-1} aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></TreeView.BranchTrigger>
  {:else}
    <span class="spacer" aria-hidden="true"></span>
  {/if}
  {#if multiple}
    <span part="check" data-state={on ? 'on' : 'off'} aria-hidden="true">{#if on}<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>{/if}</span>
  {/if}
  <span class="label">{n.label}</span>
  {#if branch.ancestry.length}<span part="ancestry">{branch.ancestry.join(' › ')}</span>{/if}
  {#if n.code}<code part="code">{n.code}</code>{/if}
  {#if n.archived}<span part="archived">{text.archived}</span>{/if}
{/snippet}

{#snippet branchRow(branch: Branch)}
  <TreeView.BranchControl part="node" style="padding-left: {8 + branch.depth * 18}px" data-archived={branch.node.archived ? '' : undefined} {...refusal(branch.node)}
    onclick={() => pick(branch.node.id)}>{@render row(branch)}</TreeView.BranchControl>
{/snippet}

{#snippet leafRow(branch: Branch)}
  <TreeView.Item part="node" style="padding-left: {8 + branch.depth * 18}px" data-archived={branch.node.archived ? '' : undefined} {...refusal(branch.node)}
    onclick={() => pick(branch.node.id)}>{@render row(branch)}</TreeView.Item>
{/snippet}

<!-- A node that cannot be picked for a reason carries it in a tooltip, and as its own description, since the tooltip
  cannot describe across its shadow root. -->
{#snippet withReason(branch: Branch, body: Snippet<[Branch]>)}
  {#if unpickable(branch.node) && reasonOf(branch.node)}
    <af-tooltip text={reasonOf(branch.node)}>{@render body(branch)}</af-tooltip>
  {:else}
    {@render body(branch)}
  {/if}
{/snippet}

{#snippet branchNode(branch: Branch, indexPath: number[])}
  <TreeView.NodeProvider node={branch} {indexPath}>
    {#if branch.children.length}
      <TreeView.Branch>
        {@render withReason(branch, branchRow)}
        <TreeView.BranchContent>
          {#each branch.children as child, i (child.node.id)}
            {@render branchNode(child, [...indexPath, i])}
          {/each}
        </TreeView.BranchContent>
      </TreeView.Branch>
    {:else}
      {@render withReason(branch, leafRow)}
    {/if}
  </TreeView.NodeProvider>
{/snippet}

<KitStyles />
<ComboboxStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
<Direction {dir}>
  <div class="af-kit">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    <!-- The input and the popup are a combobox whose popup is a tree. The control takes af-combobox's look from
      ComboboxStyles, so it carries that element's scope and part names. Its press keeps the popup open. -->
    <Popover.Root
      {open}
      autoFocus={false}
      restoreFocus={false}
      portalled={false}
      positioning={{ strategy: 'fixed', placement: 'bottom-start' }}
      persistentElements={[() => control]}
      onOpenChange={(d) => setOpen(d.open)}
      onEscapeKeyDown={(e) => {
        input?.focus();
        if (isClaimed(e) && e.defaultPrevented) setOpen(false);
      }}
    >
      <Popover.Anchor>
        <!-- svelte-ignore a11y_no_static_element_interactions (the press is moved to the input, which takes the keys) -->
        <div bind:this={control} part="control" data-scope="combobox" data-part="control" data-disabled={locked ? '' : undefined} onmousedown={pressControl}>
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
          <input bind:this={input} part="input" data-scope="combobox" data-part="input" role="combobox" aria-haspopup="tree" aria-expanded={open} aria-controls="af-tree"
            autocomplete="off" spellcheck="false" placeholder={placeholder ?? ''} aria-label={label || undefined} aria-describedby={described ? 'af-described' : undefined}
            aria-required={required ? 'true' : undefined} aria-invalid={invalid ? 'true' : undefined} disabled={locked} readonly={!!readonly} value={inputText}
            oninput={onInput} onkeydown={onInputKey} onclick={() => setOpen(true)} />
          {#if !multiple && selected[0] && !fixed}
            <button type="button" part="clear" class="af-button ghost icon xs" aria-label={text.clear} onclick={() => send([])}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
          {/if}
        </div>
      </Popover.Anchor>
      <Popover.Positioner bind:ref={positioner} popover="manual">
        <Popover.Content class="af-overlay" part="content">
          <Scroller tabStop={false}>
            <TreeView.Root
              {collection}
              ids={{ tree: 'af-tree' }}
              selectionMode={multiple ? 'multiple' : 'single'}
              expandOnClick={false}
              bind:selectedValue={() => selected, () => {}}
              bind:expandedValue={() => expanded, setExpanded}
            >
              <TreeView.Tree bind:ref={tree} part="tree" aria-label={label || placeholder || undefined} onkeydown={pickByKey}>
                {#each view as branch, i (branch.node.id)}
                  {@render branchNode(branch, [i])}
                {/each}
              </TreeView.Tree>
            </TreeView.Root>
            {#if waiting}
              <div part="loading">{text.loading}</div>
            {:else if source && pager.next}
              <!-- Shown only when a page failed: the forest asks for the rest itself. -->
              <button type="button" part="load-more" onclick={() => pager.more()}>{text.loadMore}</button>
            {:else if view.length === 0}
              <div part="empty">{query ? text.noMatches : text.noNodes}</div>
            {/if}
          </Scroller>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  </div>
</Direction>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The control is af-combobox's, in ComboboxStyles. The popup is AgentFlow's TreeSelect list in the kit's overlay: 6px
    in, at most 256px tall.
  - A row is TreeSelect's: 32px tall at 12.5px, 8px in at the end and 8px plus 18px a level at the start, rounded, a
    muted ground under the pointer, a 2px ring on focus. The chevron is a 16px box in the muted text, a leaf keeps the
    same room, and the check is a 14px box ringed in the input's edge, filled in the primary colour when on. After the
    label come the ancestry in the muted text at 11px, the code in the mono face at 10.5px pushed to the end, and the
    archived chip: 18px tall, fully round, 6px in, 10px semibold, muted on a muted ground with the border colour.
  - A chosen row is semibold on the accent ground (TreeSelect's violet, which no token holds), only while it can be
    picked: a chosen row that is disabled keeps the look of a disabled one. An archived row is
    italic unless chosen; its ancestry, code and chip never are. A row that cannot be picked is the muted text at 70%,
    with a not-allowed cursor; it keeps its pointer events, so its reason can show on hover.
  - The loading and empty rows are TreeSelect's empty row: muted, 12px, centred, 20px above and below.
  - Forced colours draw focus as an outline, and a chosen row in the system's highlight.
-->
<style>
  :host { display: inline-block; max-width: 100%; vertical-align: middle; }
  af-tooltip { display: block; }
  :global([data-scope='popover'][data-part='anchor']) { display: block; }
  :global([data-scope='popover'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  :global([data-scope='popover'][data-part='content']) { display: flex; flex-direction: column; box-sizing: border-box; width: var(--reference-width, auto); max-height: 256px;
    padding: 6px; outline: none; }
  :global([data-scope='tree-view'][data-part='tree']), :global([data-scope='tree-view'][data-part='branch']), :global([data-scope='tree-view'][data-part='branch-content']) {
    display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; outline: none; }
  :global([data-scope='tree-view'][data-part='branch-content'][hidden]) { display: none; }
  :global([part~='node']) { display: flex; box-sizing: border-box; align-items: center; gap: 8px; height: 32px; min-height: 0; padding-right: 8px; border: 0 solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px));
    font-size: 12.5px; line-height: 1.5; outline: none; cursor: pointer; -webkit-user-select: none; user-select: none; }
  @media (hover: hover) { :global([part~='node']:hover) { background-color: var(--k-muted-bg); } }
  :global([part~='node']:focus-visible) { box-shadow: 0 0 0 2px var(--k-focus-ring); }
  :global([part~='node'][data-selected]:not([aria-disabled='true'])) { background-color: var(--k-accent); color: var(--k-accent-fg); font-weight: 600; }
  :global([part~='node'][data-archived]:not([data-selected])) { font-style: italic; }
  :global([part~='node'][aria-disabled='true']) { color: color-mix(in oklab, var(--k-muted) 70%, transparent); cursor: not-allowed; }
  @media (hover: hover) { :global([part~='node'][aria-disabled='true']:hover) { background-color: transparent; } }
  :global([part~='toggle']) { display: grid; flex: none; place-items: center; width: 16px; height: 16px; padding: 0; border: 0; border-radius: 0.25rem; background: transparent;
    color: var(--k-muted); cursor: pointer; }
  :global([part~='toggle'] svg) { transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  :global([part~='toggle'][data-state='open'] svg) { transform: rotate(90deg); }
  .spacer { flex: none; width: 16px; height: 16px; }
  :global([part~='check']) { display: grid; flex: none; box-sizing: border-box; place-items: center; width: 14px; height: 14px; border: 1px solid var(--k-input); border-radius: 4px;
    background-color: var(--k-surface); }
  :global([part~='check'][data-state='on']) { border-color: var(--k-primary); background-color: var(--k-primary); color: var(--k-primary-fg); }
  .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  :global([part~='ancestry']) { min-width: 0; overflow: hidden; color: var(--k-muted); font-size: 11px; font-style: normal; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }
  :global([part~='code']) { flex: none; margin-left: auto; color: var(--k-muted); font-family: var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 10.5px; font-style: normal; font-weight: 400; }
  :global([part~='archived']) { display: inline-flex; flex: none; box-sizing: border-box; align-items: center; height: 18px; margin-left: auto; padding: 0 6px;
    border: 1px solid var(--k-line); border-radius: calc(infinity * 1px); background-color: var(--k-muted-bg); color: var(--k-muted); font-size: 10px; font-style: normal; font-weight: 600; }
  :global([part~='code'] + [part~='archived']) { margin-left: 0; }
  :global([part~='loading']), :global([part~='empty']) { padding: 20px 12px; color: var(--k-muted); font-size: 12px; line-height: 1.5; text-align: center; }
  :global([part~='load-more']) { display: flex; box-sizing: border-box; align-items: center; width: 100%; height: 32px; margin: 2px 0 0; padding: 0 8px; border: 0;
    border-radius: max(0px, calc(var(--k-radius) - 2px)); background: transparent; color: inherit; font: inherit; font-size: 12.5px; text-align: start; outline: none; cursor: pointer; }
  @media (hover: hover) { :global([part~='load-more']:hover) { background-color: var(--k-muted-bg); } }
  :global([part~='load-more']:focus-visible) { box-shadow: 0 0 0 2px var(--k-focus-ring); }
  @media (prefers-reduced-motion: reduce) { :global([part~='toggle'] svg) { transition: none; } }
  @media (forced-colors: active) {
    :global([part~='node']:focus-visible), :global([part~='load-more']:focus-visible) { outline: 2px solid; outline-offset: -2px; }
    :global([part~='node'][data-selected]:not([aria-disabled='true'])) { forced-color-adjust: none; background-color: Highlight; color: HighlightText; }
  }
</style>
