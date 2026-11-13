<svelte:options customElement={{ shadow: 'open', props: { items: { type: 'Array' }, accept: { attribute: 'accept', type: 'String' }, multiple: { attribute: 'multiple', type: 'Boolean' }, replace: { attribute: 'replace', type: 'Boolean' }, label: { attribute: 'label', type: 'String' }, maxFiles: { attribute: 'max-files', type: 'Number' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' }, name: { attribute: 'name', type: 'String', reflect: true }, required: { attribute: 'required', type: 'Boolean' }, readonly: { attribute: 'readonly', type: 'Boolean', reflect: true }, description: { attribute: 'description', type: 'String' }, error: { attribute: 'error', type: 'String' }, invalid: { attribute: 'invalid', type: 'Boolean' } }, extend: (ce) => class extends formAssociate(ce) {
  // The drop zone is the control a label, a form or the page means; it has no input part for formAssociate to find.
  focus(options?: FocusOptions): void {
    const zone = this.shadowRoot?.querySelector<HTMLElement>('[part~="dropzone"]');
    if (zone) zone.focus(options);
    else super.focus(options);
  }
} }} />

<script module lang="ts">
  import { formAssociate } from './form/associate.js';

  // The element holds no file: Ark's machine is told it holds none, so each drop is judged alone and handed on whole.
  const NONE: File[] = [];
  const NOTICE_MS = 5000;

  type Kind = 'text' | 'image' | 'file';
  function kindOf(name: string): Kind {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'text';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    return 'file';
  }
</script>

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { FileUpload, useFileUpload } from '@ark-ui/svelte/file-upload';
  import { tick } from 'svelte';
  import KitStyles from './KitStyles.svelte';
  import { emit } from './environment.js';
  import { onFormEvents, writeForm } from './form/associate.js';
  import { fill, isVi, kitText, orEnglish } from './text.js';
  import type { FileItem, KitStrings } from './index.js';

  type Rejection = { file: File; errors: string[] };

  let {
    items = [], accept = null, multiple = false, replace = false, label = null, maxFiles = null, disabled = false, locale = null, strings = null,
    name = null, required = false, readonly = false, description = null, error = null, invalid = false,
  }: {
    items?: FileItem[] | null; accept?: string | null; multiple?: boolean | null; replace?: boolean | null; label?: string | null; maxFiles?: number | null; disabled?: boolean | null; locale?: string | null;
    strings?: Partial<KitStrings> | null; name?: string | null; required?: boolean | null; readonly?: boolean | null; description?: string | null; error?: string | null;
    invalid?: boolean | null;
  } = $props();
  const self = $host();
  const id = $props.id();
  const text = $derived(kitText(locale, strings ?? undefined));
  const rows = $derived(items ?? []);
  const capped = $derived(maxFiles != null && Number(maxFiles) >= 1);
  // Without max-files a pick is one file, which the page may put in place of the one it holds, or any number with multiple.
  const limit = $derived(capped ? Math.floor(Number(maxFiles)) : multiple ? Infinity : 1);
  const lead = $derived(limit > 1 ? text.dropFiles : text.dropFile);
  // A one-file element with `replace` holds nothing back from a pick: the page swaps the item it holds for the file.
  const replacing = $derived(!!replace && limit === 1);
  const visible = $derived(`${lead} ${text.browse}`);

  // An ancestor <fieldset disabled> disables the control without touching its own `disabled`.
  let formDisabled = $state(false);
  const locked = $derived(!!disabled || formDisabled);
  const described = $derived([description, error].filter(Boolean).join(' '));
  let zone = $state<HTMLElement | null>(null);
  let picker = $state<HTMLInputElement | null>(null);

  let notice = $state('');
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  async function notify(message: string) {
    clearTimeout(noticeTimer);
    // A live region says nothing when its text is set to what it already holds, so a refusal repeated is cleared first.
    if (notice === message) {
      notice = '';
      await tick();
    }
    notice = message;
    noticeTimer = setTimeout(() => (notice = ''), NOTICE_MS);
  }
  $effect(() => () => clearTimeout(noticeTimer));

  // Ark reports a drop's accepted and refused files in two calls of the same turn; the drop is judged once both are in.
  let batch: { accepted: File[]; rejected: Rejection[] } | null = null;
  function collect() {
    if (!batch) {
      batch = { accepted: [], rejected: [] };
      queueMicrotask(decide);
    }
    return batch;
  }
  function decide() {
    const { accepted, rejected } = batch!;
    batch = null;
    // The element holds no file, so the native input must not either: it keeps its last pick's list until the next click.
    if (picker) picker.value = '';
    // Ark reports refused files only when they differ from the last it refused; forgetting them lets the same refusal speak again.
    if (rejected.length) fileUpload().clearRejectedFiles();
    // Every file the person offered counts toward the limit, the wrong type among them, so a drop too big says so first.
    // A file Ark found twice in the drop counts once.
    const held = capped && !replacing ? rows.filter((item) => item.status !== 'failed').length : 0;
    const offered = accepted.length + rejected.filter((r) => !r.errors.includes('FILE_EXISTS')).length;
    if (held + offered > limit) {
      void notify(limit === 1 ? text.oneFileOnly : fill(text.fileCountRefused, { max: limit }));
      return;
    }
    const wrongType = rejected.find((r) => r.errors.includes('FILE_INVALID_TYPE'));
    if (wrongType) {
      void notify(fill(text.fileTypeRefused, { name: wrongType.file.name }));
      return;
    }
    // Of a file found twice in the drop, the first is added and the rest left out; the notice tells the person which.
    const repeated = rejected.find((r) => r.errors.includes('FILE_EXISTS'));
    if (repeated) void notify(fill(text.fileDuplicate, { name: repeated.file.name }));
    if (accepted.length) emit(self, 'files-add', { files: accepted });
  }

  const fileUpload = useFileUpload(() => ({
    id,
    getRootNode: () => self.shadowRoot!,
    accept: accept || undefined,
    maxFiles: limit,
    disabled: locked,
    readOnly: !!readonly,
    invalid: !!invalid,
    acceptedFiles: NONE,
    // Ark's default listens on the whole document to stop a stray drop from opening the file; the page guards its own document.
    preventDocumentDrop: false,
    translations: { dropzone: label || visible },
    onFileAccept: (d) => {
      if (d.files.length) collect().accepted.push(...d.files);
    },
    onFileReject: (d) => {
      if (d.files.length) collect().rejected.push(...(d.files as Rejection[]));
    },
  }));

  // A locked zone is skipped by Ark's drag handlers, so nothing would cancel the drop and, with no document guard, the
  // browser would open the file in place of the page.
  $effect(() => {
    const el = zone;
    if (!el || !(locked || readonly)) return;
    const refuse = (e: Event) => e.preventDefault();
    el.addEventListener('dragover', refuse);
    el.addEventListener('drop', refuse);
    return () => {
      el.removeEventListener('dragover', refuse);
      el.removeEventListener('drop', refuse);
    };
  });

  const units = $derived.by(() => {
    const tag = isVi(locale) ? 'vi-VN' : 'en-GB';
    const unit = (name: string) => new Intl.NumberFormat(tag, { style: 'unit', unit: name, unitDisplay: 'short', maximumFractionDigits: 1 });
    // Intl's short byte is the word "byte", and its narrow form joins the letter to the number in English only.
    return { byte: new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }), kilobyte: unit('kilobyte'), megabyte: unit('megabyte') };
  });
  // Counted in 1,024s, as AgentFlow's attachment rows count them, and a byte count written "512 B" as AgentFlow writes it.
  function sizeText(bytes: number | null | undefined): string {
    if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '';
    if (bytes < 1024) return `${units.byte.format(bytes)} B`;
    if (bytes < 1024 * 1024) return units.kilobyte.format(bytes / 1024);
    return units.megabyte.format(bytes / 1024 / 1024);
  }
  const percent = (item: FileItem) => Math.min(100, Math.max(0, Number(item.progress) || 0));

  // `name`, `disabled` and `readonly` reflect to their attributes: the browser reads the host's attributes to submit, to
  // leave a disabled control out, and to bar a read-only one from validation.
  $effect(() => {
    const done = rows.filter((item) => item.status === 'done').map((item) => item.id);
    const missing = !!required && done.length === 0;
    writeForm(self, {
      name,
      value: done,
      validity: missing ? { valueMissing: true } : {},
      message: missing ? orEnglish(text, 'valueMissing') : '',
      anchor: zone,
    });
  });
  onFormEvents(self, {
    // The items are the page's, so a form's reset leaves them as the page holds them.
    reset() {},
    disabled(next) { formDisabled = next; },
  });
</script>

{#snippet glyph(kind: Kind)}
  <svg part="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {#if kind === 'image'}
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    {:else}
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
      {#if kind === 'text'}<path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />{/if}
    {/if}
  </svg>
{/snippet}

<KitStyles />
<EnvironmentProvider value={() => self.shadowRoot!}>
  <div class="af-kit upload">
    {#if described}<span id="af-described" hidden>{described}</span>{/if}
    <!-- A label takes the drop zone's name, so what the zone shows is read as its description; the browse word stands apart only by its margin. -->
    {#if label}<span id="af-lead" hidden>{visible}</span>{/if}
    <FileUpload.RootProvider value={fileUpload} class="root">
      {#if !readonly}
        <FileUpload.Dropzone bind:ref={zone} part="dropzone" aria-describedby={[label ? 'af-lead' : '', 'af-hint', described ? 'af-described' : ''].filter(Boolean).join(' ')}>
          <svg class="glyph" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m17 8-5-5-5 5" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /></svg>
          <span class="lead">{lead}<span part="trigger">{text.browse}</span><FileUpload.HiddenInput bind:ref={picker} /></span>
          <span part="hint" id="af-hint">{limit > 1 ? text.multipleAllowed : text.oneFileOnly}</span>
        </FileUpload.Dropzone>
      {/if}
    </FileUpload.RootProvider>
    <div part="notice" role="status" aria-live="polite">{#if notice}{notice}{/if}</div>
    {#if rows.length}
      <ul part="list">
        {#each rows as item (item.id)}
          {@const size = sizeText(item.size)}
          <li part="item" data-status={item.status}>
            {#if item.preview}
              {#if item.href}
                <a class="thumb" href={item.href} target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img part="preview" src={item.preview} alt="" /></a>
              {:else}
                <img part="preview" src={item.preview} alt="" />
              {/if}
            {:else}
              {@render glyph(kindOf(item.name))}
            {/if}
            {#if item.href}
              <a part="name" class="name" href={item.href} target="_blank" rel="noopener">{item.name}</a>
            {:else}
              <span part="name" class="name">{item.name}</span>
            {/if}
            {#if size}<span part="size">{size}</span>{/if}
            {#if item.status === 'uploading'}
              <div part="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent(item)} aria-label={text.uploading}>
                <div class="fill" style="transform: translateX(-{100 - percent(item)}%)"></div>
              </div>
            {:else if item.status === 'failed'}
              <span part="status" title={item.error || undefined}>{text.uploadFailed}</span>
            {/if}
            {#if !readonly}
              <button type="button" part="remove" aria-label="{text.removeFile}: {item.name}" disabled={locked || item.status === 'uploading'}
                onclick={() => emit(self, 'remove', { id: item.id })}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg></button>
            {/if}
          </li>
        {/each}
      </ul>
    {:else if readonly}
      <p class="none">{text.noFiles}</p>
    {/if}
  </div>
</EnvironmentProvider>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - AgentFlow's attachment field in BlockRenderer: a centred column 16px tall and 12px in, a 2px dashed edge, the upload
    glyph at 16px, the sentence at 12px with the browse word in the primary at 500, underlined on hover, and the hint at
    10px; the drop zone, the notice and the list stand 8px apart.
  - AgentFlow draws these in Tailwind's neutral, violet and rose ramps, which no token holds. Neutral 300 and 400 (the
    edge, its hover, the glyph, a row's size and the remove button) are the foreground or the muted text mixed into the
    surface by the amounts that land on them, and neutral 700 and 500 the foreground and the muted text. Violet 400 and
    its wash, while a file is dragged over, are the primary at reduced strength; rose 700 and 50 are the danger tone.
  - A row is AgentFlow's AttachmentRow: 8px and 12px in, 8px gaps, the 14px type icon or a 32px thumbnail, the name taking
    the room left (the primary at 500 when it is a link), the size at 10px, a 6px bar 64px wide in the primary over the
    primary at 20%, the failed word at 10px in the danger tone, and a 20px remove button with a 12px bin. The list is
    the card's edge and ground, rows split by the edge. AgentFlow's list stays white in the dark; the kit's is the surface.
  - The notice speaks a refusal in the danger tone at 11.5px, and takes no room while it is empty: its margin takes back the gap
    before it, since a live region left out of the layout would not be heard.
-->
<style>
  :host { display: block; }
  .upload { display: flex; flex-direction: column; gap: 8px; font-size: 12px; line-height: 1.5;
    --fu-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));
    --fu-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface)); }
  .upload > :global(.root) { display: contents; }
  :global([part~='dropzone']) { display: flex; box-sizing: border-box; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    padding: 16px 12px; border: 2px dashed var(--fu-edge); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, var(--k-muted-bg) 40%, transparent); text-align: center; outline: none; cursor: pointer;
    transition-property: color, background-color, border-color, box-shadow; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
  @media (hover: hover) { :global([part~='dropzone']:hover) { border-color: var(--fu-soft); } }
  :global([part~='dropzone'][data-dragging]) { border-color: color-mix(in oklab, var(--k-primary) 60%, var(--k-surface));
    background-color: color-mix(in oklab, var(--k-primary) 4%, transparent); }
  :global([part~='dropzone'][data-invalid]) { border-color: var(--k-danger); }
  :global([part~='dropzone']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([part~='dropzone'][data-disabled]) { opacity: 0.5; cursor: not-allowed; }
  .glyph { flex: none; color: var(--fu-soft); }
  .lead { color: var(--k-fg); }
  :global([part~='trigger']) { margin-left: 4px; color: var(--k-primary); font-weight: 500; }
  @media (hover: hover) { :global([part~='dropzone']:not([data-disabled]) [part~='trigger']:hover) { text-decoration-line: underline; } }
  :global([part~='hint']) { color: var(--k-muted); font-size: 10px; }
  :global([part~='notice']) { color: var(--k-danger); font-size: 11.5px; }
  :global([part~='notice']:empty) { margin-top: -8px; }
  :global([part~='list']) { box-sizing: border-box; margin: 0; padding: 0; border: 1px solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px)); background-color: var(--k-surface);
    list-style: none; }
  :global([part~='item']) { display: flex; box-sizing: border-box; align-items: center; gap: 8px; padding: 8px 12px; }
  :global([part~='item'] + [part~='item']) { border-top: 1px solid var(--k-line); }
  :global([part~='icon']) { flex: none; width: 14px; height: 14px; color: var(--k-muted); }
  .thumb { display: block; flex: none; }
  :global([part~='preview']) { display: block; box-sizing: border-box; flex: none; width: 32px; height: 32px; border: 1px solid var(--k-line); border-radius: 0.25rem;
    background-color: var(--k-surface); object-fit: cover; }
  .name { flex: 1 1 0%; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  a.name { color: var(--k-primary); font-weight: 500; text-decoration-line: none; border-radius: 2px; outline: none; }
  @media (hover: hover) { a.name:hover { text-decoration-line: underline; } }
  a.name:focus-visible { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([part~='size']) { flex: none; color: var(--fu-soft); font-size: 10px; }
  :global([part~='progress']) { position: relative; flex: none; width: 64px; height: 6px; overflow: hidden; border-radius: calc(infinity * 1px);
    background-color: color-mix(in oklab, var(--k-primary) 20%, transparent); }
  .fill { width: 100%; height: 100%; background-color: var(--k-primary); transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  :global([part~='status']) { flex: none; color: var(--k-danger); font-size: 10px; }
  :global([part~='remove']) { display: flex; box-sizing: border-box; flex: none; align-items: center; justify-content: center; width: 20px; height: 20px; padding: 0; border: 0;
    border-radius: 0.25rem; background: none; color: var(--fu-soft); outline: none; cursor: pointer; }
  @media (hover: hover) { :global([part~='remove']:not(:disabled):hover) { background-color: color-mix(in oklab, var(--k-danger) 6%, var(--k-surface)); color: var(--k-danger); } }
  :global([part~='remove']:focus-visible) { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  :global([part~='remove']:disabled) { opacity: 0.5; cursor: not-allowed; }
  .none { box-sizing: border-box; margin: 0; padding: 8px 12px; border: 1px solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px)); background-color: var(--k-surface);
    color: var(--fu-soft); font-size: 11.5px; font-style: italic; }
  @media (prefers-reduced-motion: reduce) { :global([part~='dropzone']), .fill { transition: none; } }
  @media (forced-colors: active) {
    :global([part~='dropzone']:focus-visible), a.name:focus-visible, :global([part~='remove']:focus-visible) { outline: 2px solid; outline-offset: 2px; }
  }
</style>
