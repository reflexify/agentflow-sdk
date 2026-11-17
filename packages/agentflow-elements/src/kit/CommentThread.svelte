<svelte:options customElement={{ shadow: 'open', props: { comments: { type: 'Array' }, canComment: { attribute: 'can-comment', type: 'Boolean' }, closed: { attribute: 'closed', type: 'Boolean' }, hasEarlier: { attribute: 'has-earlier', type: 'Boolean' }, busy: { attribute: 'busy', type: 'Boolean' }, error: { attribute: 'error', type: 'String' }, unnotified: { type: 'Array' }, mentions: { type: 'Object' }, upload: { type: 'Object' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } }, extend: (ce) => class extends ce {
  // A method from construction: the page may call it before the element has connected, and then there is nothing to settle.
  settle(): void { settlers.get(this)?.(); }
} }} />

<script module lang="ts">
  const settlers = new WeakMap<HTMLElement, () => void>();

  const COMPOSER = 'composer';

  function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean).map((w) => Array.from(w)[0]!.toUpperCase());
    if (words.length === 0) return '?';
    return words.length === 1 ? words[0]! : words[0]! + words[words.length - 1]!;
  }

  // The tint comes from the person's id, so it survives a rename.
  function hue(id: string | null | undefined): number {
    let sum = 0;
    for (const ch of id ?? '') sum = (sum * 31 + ch.charCodeAt(0)) >>> 0;
    return sum % 8;
  }

  // The editor draws its content once Tiptap has loaded, so a person who pressed Edit is put in it when it appears. Focus is
  // taken only from the page's body or from this element: a person who has moved on in the meantime keeps where they are.
  function reveal(host: HTMLElement, options: { owner: HTMLElement; end: boolean }) {
    const root = host.shadowRoot;
    let watch: MutationObserver | null = null;
    const find = () => root?.querySelector<HTMLElement>('[contenteditable="true"]') ?? null;
    const take = (editable: HTMLElement) => {
      const active = deepActiveElement();
      if (active && active !== document.body && !within(options.owner, active)) return;
      editable.focus();
      if (!options.end) return;
      try {
        const selection = (root as unknown as { getSelection?: () => Selection | null }).getSelection?.() ?? document.getSelection();
        selection?.selectAllChildren(editable);
        selection?.collapseToEnd();
      } catch {
        // The caret stays where focus put it.
      }
    };
    const ready = find();
    if (ready) take(ready);
    else if (root) {
      watch = new MutationObserver(() => {
        const found = find();
        if (!found) return;
        watch?.disconnect();
        take(found);
      });
      watch.observe(root, { childList: true, subtree: true });
    }
    return { destroy: () => watch?.disconnect() };
  }
</script>

<script lang="ts">
  import { tick } from 'svelte';
  import type { CommentDto, MentionMenuSource, ResolvedMention, UnnotifiedPerson } from '@reflexify/agentflow-sdk';
  import KitStyles from './KitStyles.svelte';
  import { deepActiveElement, emit, within } from './environment.js';
  import { byteSizer } from './size.js';
  import { fill, isVi, kitText } from './text.js';
  import { timeFormats } from './time.js';
  import type { FileItem, KitStrings } from './index.js';

  type Upload = (file: File) => Promise<{ id: string }>;
  // `text` is what the editor last reported, which the editor's own `value` is kept equal to: it reports a change only from
  // what it holds as its value, so a draft emptied back to that value would otherwise never be heard.
  // `version` is the comment's version when its edit opened: the edit started from it, whatever the comment has become since.
  interface Draft { initial: string; text: string; files: FileItem[]; version?: string }

  let {
    comments = null, canComment = false, closed = false, hasEarlier = false, busy = false, error = null, unnotified = null,
    mentions = null, upload = null, locale = null, strings = null,
  }: {
    comments?: CommentDto[] | null; canComment?: boolean | null; closed?: boolean | null; hasEarlier?: boolean | null; busy?: boolean | null;
    error?: string | null; unnotified?: UnnotifiedPerson[] | null; mentions?: MentionMenuSource | null; upload?: Upload | null;
    locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const text = $derived(kitText(locale, strings ?? undefined));
  const clock = $derived(timeFormats(locale));
  const bytes = $derived(byteSizer(locale));
  const listFormat = $derived(new Intl.ListFormat(isVi(locale) ? 'vi' : 'en', { style: 'long', type: 'conjunction' }));

  // A comment that is not an object, or whose id was already drawn, would break the keyed list.
  const rows = $derived.by(() => {
    const seen = new Set<string>();
    return (Array.isArray(comments) ? comments : []).filter((c) => c && typeof c === 'object' && typeof c.id === 'string' && !seen.has(c.id) && !!seen.add(c.id));
  });
  const now = $derived.by(() => {
    void rows;
    return Date.now();
  });
  const names = $derived((Array.isArray(unnotified) ? unnotified : []).map((p) => p?.name?.trim() || text.activityActorSomeone));
  const deletable = $derived(rows.some((c) => c.can_delete));

  const blank = (initial = '', files: FileItem[] = []): Draft => ({ initial, text: initial, files });
  let composing = $state(false);
  let composer = $state.raw<Draft>(blank());
  let edits = $state.raw<Record<string, Draft>>({});
  let confirming = $state<string | null>(null);
  // What the page was last told, so its `busy`, `error` and `settle()` are about the right place.
  let last = $state<{ kind: 'submit' | 'edit' | 'delete'; id?: string } | null>(null);
  let composerEditor = $state<HTMLElement | null>(null);

  const draftOf = (slot: string): Draft | undefined => (slot === COMPOSER ? composer : edits[slot]);
  const uploading = (draft: Draft | undefined) => !!draft?.files.some((f) => f.status === 'uploading');
  const stored = (draft: Draft) => draft.files.filter((f) => f.status === 'done').map((f) => f.id);

  function setFiles(slot: string, files: FileItem[]) {
    if (slot === COMPOSER) composer = { ...composer, files };
    else if (edits[slot]) edits = { ...edits, [slot]: { ...edits[slot]!, files } };
  }

  let serial = 0;
  async function store(slot: string, key: string, file: File) {
    const set = (item: FileItem) => {
      const draft = draftOf(slot);
      // A draft that was sent or closed meanwhile has no such file, and the answer is not wanted.
      if (draft?.files.some((f) => f.id === key)) setFiles(slot, draft.files.map((f) => (f.id === key ? item : f)));
    };
    try {
      const done = await upload!(file);
      if (!done || typeof done.id !== 'string' || !done.id) throw new Error();
      set({ id: done.id, name: file.name, size: file.size, status: 'done' });
    } catch (e) {
      set({ id: key, name: file.name, size: file.size, status: 'failed', error: e instanceof Error && e.message ? e.message : null });
    }
  }
  function add(slot: string, e: Event) {
    const files = (e as CustomEvent<{ files?: File[] }>).detail?.files;
    if (typeof upload !== 'function' || !Array.isArray(files)) return;
    for (const file of files) {
      const key = `upload-${++serial}`;
      setFiles(slot, [...(draftOf(slot)?.files ?? []), { id: key, name: file.name, size: file.size, status: 'uploading' }]);
      void store(slot, key, file);
    }
  }
  function drop(slot: string, e: Event) {
    const id = (e as CustomEvent<{ id?: string }>).detail?.id;
    const draft = draftOf(slot);
    if (draft) setFiles(slot, draft.files.filter((f) => f.id !== id));
  }

  function typed(slot: string, e: Event) {
    const md = (e as CustomEvent<{ value?: string }>).detail?.value;
    const draft = draftOf(slot);
    if (typeof md !== 'string' || !draft) return;
    draft.text = md;
    (e.currentTarget as HTMLElement & { value: string }).value = md;
  }

  // The editor reports its Markdown after 600 ms idle and when it loses focus. Losing focus is what a press on Send does, but a
  // shortcut is pressed inside the editor, so whatever editor holds focus is made to lose it, and what it had not yet reported
  // arrives before it is read.
  function flush() {
    for (const host of self.shadowRoot?.querySelectorAll('af-rich-editor') ?? []) {
      const inner = host.shadowRoot?.activeElement;
      if (inner instanceof HTMLElement) inner.blur();
    }
  }

  async function keep(selector: string) {
    await tick();
    const active = deepActiveElement();
    if (active && active !== document.body) return;
    self.shadowRoot?.querySelector<HTMLElement>(selector)?.focus();
  }

  function expand() {
    if (busy) return;
    composing = true;
  }

  function send() {
    if (busy) return;
    flush();
    const draft = composer;
    if (uploading(draft)) return;
    const attachment_ids = stored(draft);
    if (!draft.text.trim() && attachment_ids.length === 0) {
      composerEditor?.shadowRoot?.querySelector<HTMLElement>('[contenteditable="true"]')?.focus();
      return;
    }
    last = { kind: 'submit' };
    emit(self, 'af-comment-submit', { body: draft.text, attachment_ids });
  }

  function edit(c: CommentDto) {
    if (busy || edits[c.id]) return;
    const draft = blank(c.body ?? '', (c.files ?? []).map((f) => ({ id: f.id, name: f.name, size: f.byte_size, status: 'done' as const })));
    edits = { ...edits, [c.id]: { ...draft, version: c.edited_at ?? c.created_at } };
  }
  function save(id: string) {
    if (busy) return;
    flush();
    const draft = edits[id];
    if (!draft || uploading(draft)) return;
    last = { kind: 'edit', id };
    emit(self, 'af-comment-edit', { id, body: draft.text, attachment_ids: stored(draft), version: draft.version });
  }
  function cancel(id: string) {
    if (busy) return;
    const { [id]: gone, ...rest } = edits;
    void gone;
    edits = rest;
    void keep(`[data-comment-id="${CSS.escape(id)}"] [part~="edit"]`);
  }

  function remove() {
    const id = confirming;
    confirming = null;
    if (!id || busy) return;
    last = { kind: 'delete', id };
    emit(self, 'af-comment-delete', { id });
  }

  function earlier() {
    emit(self, 'af-comment-earlier', {});
  }
  function open(c: CommentDto, start: number) {
    emit(self, 'af-comment-open-file', { files: (c.files ?? []).map((f) => ({ file: f.id, filename: f.name })), start });
  }

  function shortcut(e: KeyboardEvent, act: () => void) {
    if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || e.isComposing) return;
    e.preventDefault();
    e.stopPropagation();
    act();
  }

  settlers.set(self, () => {
    const done = last;
    last = null;
    if (done?.kind === 'submit') {
      composer = blank();
      composing = false;
      void keep('[part~="prompt"]');
    } else if (done?.kind === 'edit' && done.id) {
      const { [done.id]: gone, ...rest } = edits;
      void gone;
      edits = rest;
      void keep(`[data-comment-id="${CSS.escape(done.id)}"] [part~="edit"]`);
    }
  });

  // The page's error is drawn where its action was raised, and at the foot of the thread where that place is no longer drawn.
  const errorAt = $derived.by((): { kind: 'comment'; id: string } | { kind: 'composer' } | { kind: 'thread' } | null => {
    if (!error) return null;
    const at = last;
    if (at?.id && (at.kind === 'edit' || at.kind === 'delete') && rows.some((c) => c.id === at.id) && (at.kind === 'delete' || edits[at.id])) return { kind: 'comment', id: at.id };
    if ((!at || at.kind === 'submit') && composing && canComment && !closed) return { kind: 'composer' };
    return { kind: 'thread' };
  });
</script>

{#snippet spinner()}<span class="af-spinner" aria-hidden="true"></span>{/snippet}

{#snippet fault(message: string)}
  <p part="error" class="fault" role="alert">{message}</p>
{/snippet}

{#snippet hint()}
  <span class="hint">{mentions ? `${text.commentHintMention} · ` : ''}{text.commentHintSend}</span>
{/snippet}

{#snippet attachments(slot: string, draft: Draft)}
  {#if typeof upload === 'function'}
    <af-file-upload multiple items={draft.files} label={text.commentAttach} locale={locale || undefined} strings={strings ?? undefined}
      onfiles-add={(e: Event) => add(slot, e)} onremove={(e: Event) => drop(slot, e)}></af-file-upload>
  {/if}
{/snippet}

{#snippet item(c: CommentDto)}
  {@const name = c.author?.name?.trim() || text.activityActorSomeone}
  {@const draft = edits[c.id]}
  {@const files = c.files ?? []}
  <li part="comment" class="comment" data-comment-id={c.id}>
    <span class="af-avatar sm" data-hue={hue(c.author?.id)} aria-hidden="true">{c.author?.name?.trim() ? initials(c.author.name) : '?'}</span>
    <div class="main">
      <div class="head">
        <b part="author" class="author">{name}</b>
        <time part="time" class="when" datetime={c.created_at} title={clock.moment(c.created_at)}>{clock.since(c.created_at, now)}</time>
        {#if c.edited_at}
          <span part="edited" class="edited" title={fill(text.commentEditedAt, { when: clock.moment(c.edited_at) ?? c.edited_at })}>· {text.commentEdited}</span>
        {/if}
      </div>
      {#if draft}
        <div class="fields" inert={busy || undefined}>
          <af-rich-editor class="editor" value={draft.initial} mentionMap={c.mentions} mentions={mentions} label={text.commentEditLabel}
            locale={locale || undefined} strings={strings ?? undefined} use:reveal={{ owner: self, end: true }}
            onchange={(e: Event) => typed(c.id, e)} onkeydowncapture={(e: KeyboardEvent) => shortcut(e, () => save(c.id))}></af-rich-editor>
          {@render attachments(c.id, draft)}
        </div>
        <div class="bar">
          {@render hint()}
          <span class="buttons">
            <button type="button" part="cancel" class="af-button ghost sm" aria-disabled={busy ? 'true' : undefined} onclick={() => cancel(c.id)}>{text.cancel}</button>
            <button type="button" part="save" class="af-button primary sm" aria-disabled={busy || uploading(draft) ? 'true' : undefined} onclick={() => save(c.id)}>
              {#if busy && last?.id === c.id}{@render spinner()}{/if}{text.commentSave}
            </button>
          </span>
        </div>
      {:else}
        {#if c.body?.trim()}
          <af-markdown part="body" class="body" value={c.body} mentions={c.mentions as Record<string, ResolvedMention>} locale={locale || undefined} strings={strings ?? undefined}></af-markdown>
        {/if}
        {#if files.length > 0}
          <div class="files">
            {#each files as f, i (i)}
              <span part="file" class="af-file-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                <button type="button" class="af-file-chip-name" aria-label={fill(text.commentOpenFile, { name: f.name })} onclick={() => open(c, i)}>{f.name}</button>
                <span class="size">{bytes(f.byte_size)}</span>
              </span>
            {/each}
          </div>
        {/if}
      {/if}
      {#if errorAt?.kind === 'comment' && errorAt.id === c.id}{@render fault(error!)}{/if}
    </div>
    {#if !draft && (c.can_edit || c.can_delete)}
      <div class="actions">
        {#if c.can_edit}
          <button type="button" part="edit" class="af-button ghost icon xs" aria-label={fill(text.commentEditBy, { name })} aria-disabled={busy ? 'true' : undefined} onclick={() => edit(c)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
          </button>
        {/if}
        {#if c.can_delete}
          <button type="button" part="delete" class="af-button ghost icon xs" aria-label={fill(text.commentDeleteBy, { name })} aria-disabled={busy ? 'true' : undefined} onclick={() => { if (!busy) confirming = c.id; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          </button>
        {/if}
      </div>
    {/if}
  </li>
{/snippet}

<KitStyles />
<div class="af-kit thread" aria-busy={busy ? 'true' : undefined}>
  {#if hasEarlier}
    <div class="earlier"><button type="button" part="earlier" class="af-button ghost xs" onclick={earlier}>{text.commentEarlier}</button></div>
  {/if}
  {#if rows.length > 0}
    <ol class="list" aria-label={text.comments}>
      {#each rows as c (c.id)}{@render item(c)}{/each}
    </ol>
  {:else}
    <p class="empty">{text.commentsEmpty}</p>
  {/if}
  <div class="live" role="status">
    {#if names.length > 0}<p part="unnotified" class="note">{fill(text.commentUnnotified, { names: listFormat.format(names) })}</p>{/if}
  </div>
  {#if closed}
    <div part="closed" class="closed">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      <div><b>{text.commentClosed}</b>{' '}<span>{text.commentClosedHint}</span></div>
    </div>
  {:else if canComment}
    <div part="composer" class="composer">
      {#if !composing}
        <button type="button" part="prompt" class="prompt" onclick={expand}>{text.commentPlaceholder}</button>
      {:else}
        <div class="fields" inert={busy || undefined}>
          <af-rich-editor bind:this={composerEditor} class="editor" value={composer.initial} mentions={mentions} label={text.commentComposerLabel}
            locale={locale || undefined} strings={strings ?? undefined} use:reveal={{ owner: self, end: false }}
            onchange={(e: Event) => typed(COMPOSER, e)} onkeydowncapture={(e: KeyboardEvent) => shortcut(e, send)}></af-rich-editor>
          {@render attachments(COMPOSER, composer)}
        </div>
        <div class="bar">
          {@render hint()}
          <button type="button" part="send" class="af-button primary sm" aria-disabled={busy || uploading(composer) ? 'true' : undefined} onclick={send}>
            {#if busy && last?.kind === 'submit'}{@render spinner()}{/if}{text.commentSend}
          </button>
        </div>
      {/if}
      {#if errorAt?.kind === 'composer'}{@render fault(error!)}{/if}
    </div>
  {/if}
  {#if errorAt?.kind === 'thread'}{@render fault(error!)}{/if}
  {#if deletable}
    <af-confirm open={confirming !== null} danger heading={text.commentDeleteTitle} message={text.commentDeleteBody} confirmLabel={text.commentDeleteConfirm}
      locale={locale || undefined} strings={strings ?? undefined} onconfirm={remove} oncancel={() => (confirming = null)}></af-confirm>
  {/if}
</div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - A comment is AgentFlow's: a 24px avatar tinted from the author's id, the name at 600 and the time and the edited mark muted at
    12px, the body at 13px under them, and the file chips 6px below. The row takes 8px of padding and gives it back as a negative
    margin, so the hover ground reaches past the text and the text lines up with the composer's edge.
  - Edit and Delete sit in the row's corner and show while the row is hovered or holds focus, and always where there is no hover.
  - The composer is a one-line prompt in the look of a text input until it is pressed, so a thread nobody writes in never loads
    the editor.
  - The closed note and the unnotified note are AgentFlow's: a muted ground with a lock for the first, 11.5px muted text for the second.
-->
<style>
  :host { display: block; }
  .thread { display: flex; flex-direction: column; gap: 12px; }
  .earlier { display: flex; }
  .list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }
  .empty { margin: 0; color: var(--k-muted); font-size: 12.5px; }
  .comment { position: relative; display: flex; gap: 12px; margin-inline: -8px; padding: 8px; border-radius: 8px; }
  .comment .af-avatar { margin-top: 2px; }
  .main { flex: 1 1 0%; min-width: 0; }
  .head { display: flex; align-items: baseline; gap: 8px; font-size: 12px; line-height: 1.5; }
  .author { min-width: 0; overflow: hidden; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .when, .edited { flex: none; color: var(--k-muted); }
  .edited { font-style: italic; }
  .body { display: block; margin-top: 2px; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
  .files { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .files .size { flex: none; color: var(--k-muted); }
  .actions { position: absolute; top: 4px; inset-inline-end: 8px; display: flex; gap: 2px; opacity: 0; }
  .comment:focus-within .actions { opacity: 1; }
  @media (hover: hover) { .comment:hover .actions { opacity: 1; } }
  @media (hover: none) { .actions { opacity: 1; } }
  .fields { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
  .fields[inert] { opacity: 0.6; }
  af-rich-editor, af-file-upload, af-markdown { display: block; }
  .composer { display: flex; flex-direction: column; }
  .prompt { box-sizing: border-box; width: 100%; min-height: 36px; padding: 0 12px; border: 1px solid var(--k-line); border-radius: var(--k-radius);
    background: var(--k-surface); color: var(--k-muted); font: inherit; font-size: 13px; text-align: start; cursor: text; }
  .prompt:focus-visible { outline: none; border-color: var(--k-focus-border); box-shadow: 0 0 0 3px var(--k-focus-ring); }
  @media (forced-colors: active) { .prompt:focus-visible { outline: 2px solid; outline-offset: 1px; } }
  .bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
  .hint { color: var(--k-muted); font-size: 11px; }
  .buttons { display: flex; gap: 8px; margin-inline-start: auto; }
  .fault { margin: 6px 0 0; color: var(--k-danger); font-size: 12.5px; }
  .live { display: contents; }
  .note { margin: 0; color: var(--k-muted); font-size: 11.5px; }
  .closed { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border: 1px solid var(--k-line); border-radius: 12px;
    background: color-mix(in oklab, var(--k-muted-bg) 40%, transparent); color: var(--k-muted); font-size: 12.5px; }
  .closed svg { flex: none; width: 14px; height: 14px; margin-top: 3px; }
  .closed b { color: var(--k-fg); font-weight: 500; }
</style>
