<svelte:options customElement={{ shadow: 'open', props: { value: { attribute: 'value', type: 'String' }, readonly: { attribute: 'readonly', type: 'Boolean' }, placeholder: { attribute: 'placeholder', type: 'String' }, label: { attribute: 'label', type: 'String' }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } }, extend: (ce) => class extends ce { editor = null; } }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { Popover } from '@ark-ui/svelte/popover';
  import type { Editor } from '@tiptap/core';
  import { untrack } from 'svelte';
  import KitStyles from './KitStyles.svelte';
  import { emit, raise } from './environment.js';
  import { kitText } from './text.js';
  import type { KitStrings } from './index.js';

  let {
    value = '', readonly = false, placeholder = null, label = null, locale = null, strings = null,
  }: {
    value?: string | null; readonly?: boolean | null; placeholder?: string | null; label?: string | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host() as HTMLElement & { editor: Editor | null };
  const text = $derived(kitText(locale, strings ?? undefined));

  let mountPoint = $state<HTMLElement | null>(null);
  let editor = $state.raw<Editor | null>(null);
  let empty = $state(true);
  let active = $state({ bold: false, italic: false, bulletList: false, orderedList: false, link: false });
  let linkOpen = $state(false);
  let linkHref = $state('');
  let positioner = $state<HTMLElement | null>(null);
  $effect(() => raise(positioner, linkOpen, self));

  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastEmitted: string | null = null;
  // Only an edit is emitted: loading a non-canonical value (`_em_`) must not read as a change.
  let dirty = false;
  let held = false;

  // A space typed at the end of a line is held as U+00A0 until more text follows.
  const markdownOf = (ed: Editor) => ed.getMarkdown().replace(/\u00A0+$/gm, '').trimEnd();

  function flush() {
    clearTimeout(timer);
    timer = undefined;
    if (!editor || !dirty) return;
    dirty = false;
    const md = markdownOf(editor);
    if (md === (value ?? '') || md === lastEmitted) return;
    lastEmitted = md;
    emit(self, 'change', { value: md });
  }

  function load(ed: Editor, next: string) {
    held = false;
    if (markdownOf(ed) === next) return;
    ed.commands.setContent(next, { contentType: 'markdown', emitUpdate: false });
    dirty = false;
    lastEmitted = null;
  }

  function refresh(ed: Editor) {
    empty = ed.isEmpty;
    active = {
      bold: ed.isActive('bold'), italic: ed.isActive('italic'), bulletList: ed.isActive('bulletList'),
      orderedList: ed.isActive('orderedList'), link: ed.isActive('link'),
    };
  }

  $effect(() => {
    const element = mountPoint;
    if (!element) return;
    let cancelled = false;
    let created: Editor | null = null;
    void import('./markdown.js').then(({ createMarkdownEditor }) => {
      if (cancelled) return;
      const ed = createMarkdownEditor({
        element,
        content: untrack(() => value ?? ''),
        editable: untrack(() => !readonly),
        onUpdate() {
          dirty = true;
          clearTimeout(timer);
          timer = setTimeout(flush, 600);
        },
        onBlur() {
          flush();
          if (held) load(ed, value ?? '');
        },
        onFocus() {},
      });
      ed.on('transaction', () => refresh(ed));
      created = ed;
      refresh(ed);
      editor = ed;
      self.editor = ed;
    });
    return () => {
      cancelled = true;
      // An edit still waiting on its timer would be lost when, say, a drawer closes with focus inside.
      flush();
      created?.destroy();
      if (self.editor === created) self.editor = null;
      editor = null;
    };
  });

  $effect(() => {
    const next = value ?? '';
    const ed = editor;
    if (!ed) return;
    untrack(() => {
      if (ed.isFocused) held = true;
      else load(ed, next);
    });
  });

  $effect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;
    if (label) dom.setAttribute('aria-label', label);
    else dom.removeAttribute('aria-label');
  });

  $effect(() => {
    const editable = !readonly;
    if (editor && editor.isEditable !== editable) editor.setEditable(editable, false);
  });

  function openLink(open: boolean) {
    if (open && editor) linkHref = (editor.getAttributes('link').href as string | undefined) ?? '';
    linkOpen = open;
  }

  function applyLink() {
    if (!editor) return;
    const href = linkHref.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!href) chain.unsetLink().run();
    else if (editor.state.selection.empty && !editor.isActive('link')) chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run();
    else chain.setLink({ href }).run();
    linkOpen = false;
  }

  // Keeps the editor's focus and selection while a toolbar button is pressed.
  const keepFocus = (e: MouseEvent) => e.preventDefault();
</script>

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit editor" data-readonly={readonly ? '' : undefined}>
    {#if !readonly}
      <div part="toolbar" class="toolbar">
        <button type="button" part="tool-bold" class="tool" aria-label={text.bold} title={text.bold} aria-pressed={active.bold} disabled={!editor} onmousedown={keepFocus} onclick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></button>
        <button type="button" part="tool-italic" class="tool" aria-label={text.italic} title={text.italic} aria-pressed={active.italic} disabled={!editor} onmousedown={keepFocus} onclick={() => editor?.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" part="tool-bullet-list" class="tool" aria-label={text.bulletList} title={text.bulletList} aria-pressed={active.bulletList} disabled={!editor} onmousedown={keepFocus} onclick={() => editor?.chain().focus().toggleBulletList().run()}>•</button>
        <button type="button" part="tool-numbered-list" class="tool" aria-label={text.numberedList} title={text.numberedList} aria-pressed={active.orderedList} disabled={!editor} onmousedown={keepFocus} onclick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</button>
        <Popover.Root
          open={linkOpen}
          portalled={false}
          positioning={{ strategy: 'fixed', placement: 'bottom-start' }}
          onOpenChange={(d) => openLink(d.open)}
        >
          <Popover.Trigger part="tool-link" class="tool" aria-label={text.link} title={text.link} aria-pressed={active.link} disabled={!editor}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg></Popover.Trigger>
          <Popover.Positioner bind:ref={positioner} popover="manual">
            <Popover.Content class="af-overlay link" part="link-popover">
              <form class="link-form" novalidate onsubmit={(e) => { e.preventDefault(); applyLink(); }}>
                <input part="link-input" type="url" inputmode="url" aria-label={text.link} placeholder="https://" bind:value={linkHref} />
                <button type="submit" class="af-button primary" part="link-apply">{text.confirm}</button>
              </form>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
      </div>
    {/if}
    <div class="surface">
      {#if empty && placeholder}<span part="placeholder" class="placeholder" aria-hidden="true">{placeholder}</span>{/if}
      <div part="content" class="content" bind:this={mountPoint}></div>
    </div>
  </div>
</EnvironmentProvider>

<style>
  .editor { display: flex; flex-direction: column; border: 1px solid var(--k-line); border-radius: var(--k-radius); background: var(--k-surface); }
  .editor:focus-within { outline: 2px solid var(--k-ring); outline-offset: 1px; }
  .editor[data-readonly] { border-color: transparent; background: transparent; }
  .toolbar { display: flex; gap: 2px; padding: 4px; border-bottom: 1px solid var(--k-line); }
  .tool, :global([data-scope='popover'][data-part='trigger'].tool) {
    min-width: 28px; height: 28px; padding: 0 6px; border: 0; border-radius: 4px; background: none; color: var(--k-fg); font: inherit; cursor: pointer;
  }
  .tool:not(:disabled):hover, :global([data-scope='popover'][data-part='trigger'].tool:hover) { background: color-mix(in oklab, var(--k-fg) 6%, transparent); }
  .tool:not(:disabled):active { background: color-mix(in oklab, var(--k-fg) 10%, transparent); }
  .tool[aria-pressed='true'], :global([data-scope='popover'][data-part='trigger'].tool[aria-pressed='true']) { background: color-mix(in oklab, var(--k-primary) 14%, transparent); }
  .tool:disabled { opacity: 0.55; cursor: default; }
  .tool:focus-visible { outline: 2px solid var(--k-ring); outline-offset: 1px; }
  .surface { position: relative; }
  .placeholder { position: absolute; inset: 8px 12px auto; color: var(--k-muted); pointer-events: none; }
  .content > :global([contenteditable]) { min-height: 4.5em; padding: 8px 12px; outline: none; white-space: pre-wrap; word-wrap: break-word; font-variant-ligatures: none; }
  .editor[data-readonly] .content > :global([contenteditable]) { min-height: 0; padding: 0; }
  .content :global(p) { margin: 0 0 0.5em; }
  .content > :global([contenteditable] > :last-child) { margin-bottom: 0; }
  .content :global(ul), .content :global(ol) { margin: 0 0 0.5em; padding-left: 1.5em; }
  .content :global(a) { color: var(--k-primary); }
  .content :global(table) { border-collapse: collapse; }
  .content :global(th), .content :global(td) { border: 1px solid var(--k-line); padding: 4px 8px; }
  .content :global(ul[data-type='taskList']) { list-style: none; padding-left: 0.25em; }
  .content :global(ul[data-type='taskList'] li) { display: flex; gap: 6px; }
  :global([data-scope='popover'][data-part='positioner'][popover]) { inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  .link-form { display: flex; gap: 6px; padding: 8px; }
  .link-form input { min-width: 240px; min-height: 32px; padding: 0 8px; border: 1px solid var(--k-line); border-radius: var(--k-radius); background: var(--k-bg); color: var(--k-fg); font: inherit; }
  .link-form input:focus-visible { outline: 2px solid var(--k-ring); outline-offset: 1px; }
</style>
