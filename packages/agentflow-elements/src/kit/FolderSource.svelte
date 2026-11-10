<svelte:options customElement={{ shadow: 'open', props: { sources: { type: 'Object' }, workflow: { attribute: 'workflow', type: 'String' }, version: { attribute: 'version', type: 'String' }, field: { attribute: 'field', type: 'String' }, folder: { type: 'Object' }, resumeSet: { attribute: 'resume-set', type: 'String' }, offer: { type: 'Array' }, disabled: { attribute: 'disabled', type: 'Boolean', reflect: true }, locale: { attribute: 'locale', type: 'String' }, strings: { type: 'Object' } } }} />

<script module lang="ts">
  import type { KitStrings } from './text.js';

  type Mode = 'files' | 'computer' | 'watched';
  const MODES: readonly Mode[] = ['files', 'computer', 'watched'];
  // The codes a launch leaves a folder or a file out for that the kit has its own words for.
  const REASONS: Record<string, keyof KitStrings> = {
    NOT_IN_A_FOLDER: 'folderReasonNotInAFolder',
    NOT_SETTLED: 'folderReasonNotSettled',
    NO_MARKER: 'folderReasonNoMarker',
    TOO_MANY_FILES: 'folderReasonTooManyFiles',
    BELOW_MIN_ITEMS: 'folderReasonBelowMinItems',
    ABOVE_MAX_ITEMS: 'folderReasonAboveMaxItems',
    FILE_TOO_LARGE: 'folderReasonFileTooLarge',
  };
  // The codes a launch from a folder is refused with that the kit has its own words for.
  const REFUSALS: Record<string, keyof KitStrings> = {
    UPLOAD_SET_INCOMPLETE: 'folderReasonUploadSetIncomplete',
    FILE_SET_NO_READY_GROUPS: 'folderReasonNoReadyGroups',
    UPLOAD_SET_ALREADY_LAUNCHED: 'folderReasonAlreadyLaunched',
    FILE_SET_SLOT_HAS_OTHER_CONSUMERS: 'folderReasonOtherConsumers',
    FILE_SET_MARKER_NEEDS_FOLDER_GRAIN: 'folderReasonMarkerNeedsFolders',
    FILE_SET_IN_USE: 'folderReasonInUse',
  };
  const reasonKey = (code: string) => (Object.hasOwn(REASONS, code) ? REASONS[code]! : null);
  /** The kit's words for a refusal: its own for a code it knows, and one sentence for every other. The server's stay with the page. */
  const refusalKey = (code: string | null): keyof KitStrings => (code !== null && Object.hasOwn(REFUSALS, code) ? REFUSALS[code]! : 'folderRefused');
  // An upload set's name holds at most this many characters.
  const NAME_MAX = 200;
  /**
   * What went wrong, read by shape so the kit holds none of the SDK's code. `refused` says the server answered that the
   * request itself is wrong (a 4xx other than a timeout or a busy server): asking again changes nothing.
   */
  function problem(error: unknown): { status: number | null; code: string | null; message: string; refused: boolean } {
    const e = (typeof error === 'object' && error !== null ? error : {}) as { status?: unknown; code?: unknown; detail?: unknown; message?: unknown };
    const status = typeof e.status === 'number' ? e.status : null;
    const code = typeof e.code === 'string' && e.code !== '' ? e.code : null;
    const message = [e.detail, e.message].find((part): part is string => typeof part === 'string' && part !== '') ?? String(error);
    return { status, code, message, refused: status !== null && status >= 400 && status < 500 && status !== 408 && status !== 429 };
  }
  // What an operating system keeps in every folder it shows. An upload leaves these out, so a folder of only these is empty.
  const OS_FILE = /^(\.ds_store|thumbs\.db|desktop\.ini)$/i;
  /** Whether anything under these entries would be uploaded. An entry that cannot be read is left for the upload to judge. */
  async function holdsFile(entries: FileSystemEntry[]): Promise<boolean> {
    for (const entry of entries) {
      if (entry.isFile) {
        if (!OS_FILE.test(entry.name)) return true;
        continue;
      }
      const reader = (entry as Partial<FileSystemDirectoryEntry>).createReader?.();
      if (!reader) return true;
      try {
        // A browser hands a directory over a batch at a time, and an empty batch at the end.
        for (;;) {
          const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
          if (!batch.length) break;
          if (await holdsFile(batch)) return true;
        }
      } catch {
        return true;
      }
    }
    return false;
  }
  const named = (first: string, count: number) => (count > 1 ? `${first.slice(0, NAME_MAX - 8)} +${count - 1}` : first.slice(0, NAME_MAX));
</script>

<script lang="ts">
  import { tick, untrack } from 'svelte';
  import type { FileSetEnvelope, FolderPreview, FolderSources, RefusedFile, SlotFolder, Subfolder, UploadProgress, WatchedFolder } from '@reflexify/agentflow-sdk';
  import KitStyles from './KitStyles.svelte';
  import { emit } from './environment.js';
  import { fill, isVi, kitText } from './text.js';

  type Pick = { kind: 'uploadFolder'; payload: File[] | FileSystemEntry[]; name: string } | { kind: 'uploadFiles'; payload: File[]; name: string };

  let {
    sources = null, workflow = null, version = null, field = null, folder = null, resumeSet = null, offer = null, disabled = false, locale = null, strings = null,
  }: {
    sources?: FolderSources | null; workflow?: string | null; version?: string | null; field?: string | null; folder?: SlotFolder | null; resumeSet?: string | null;
    offer?: readonly string[] | null;
    disabled?: boolean | null; locale?: string | null; strings?: Partial<KitStrings> | null;
  } = $props();
  const self = $host();
  const id = $props.id();
  const text = $derived(kitText(locale, strings ?? undefined));
  const numbers = $derived(new Intl.NumberFormat(isVi(locale) ? 'vi-VN' : 'en-GB'));
  const n = (value: number) => numbers.format(value);

  // Until the person chooses, the source follows what the field takes: folders come from a folder, files from files.
  // The sources a page left in, in the element's own order. A list naming none of them offers them all, as no list does.
  const offered = $derived.by(() => {
    const named = MODES.filter((option) => offer?.includes(option));
    return named.length ? named : MODES;
  });
  let picked = $state<Mode | null>(null);
  const mode = $derived.by(() => {
    if (picked && offered.includes(picked)) return picked;
    const own: Mode = folder?.grain === 'file' ? 'files' : 'computer';
    return offered.includes(own) ? own : offered[0]!;
  });
  const labels = $derived<Record<Mode, string>>({ files: text.folderFromFiles, computer: text.folderFromComputer, watched: text.folderFromWatched });

  // `target` is what the person chose, from the moment they chose it; `value` is it once the launch has been checked.
  let target = $state.raw<FileSetEnvelope | null>(null);
  let value = $state.raw<FileSetEnvelope | null>(null);
  let chosen = $state('');
  let preview = $state.raw<FolderPreview | null>(null);
  let refused = $state.raw<RefusedFile[]>([]);
  let uploading = $state(false);
  let progress = $state.raw<UploadProgress | null>(null);
  let checking = $state(false);
  let failure = $state<'' | 'upload' | 'preview'>('');
  // The kit's words, by key, for a failure that asking again cannot pass; while set, nothing offers to try again.
  let refusedKey = $state<keyof KitStrings | ''>('');
  let notice = $state('');
  // What is said and not shown: the page already shows it, as the progress bar or the preview.
  let said = $state('');
  let noted = 0;
  // The quarter of the upload last spoken, so a folder of thousands of files is not read out file by file.
  let quarter = 0;
  let dragging = $state(false);

  // Each upload or check is a run; an answer that arrives for an earlier run is dropped.
  let run = 0;
  let abort: AbortController | null = null;
  let last: Pick | null = null;
  // A set this element announced whose upload has not completed, and whether the upload in flight is the one that made it.
  let open: string | null = null;
  let made = false;
  // Sets not to resume, whatever `resume-set` still says: one whose upload completed, and one an upload was refused for.
  let spent = $state.raw<string[]>([]);

  const locked = $derived(!!disabled || uploading);
  // From a pick or a choice until its value is known, or it is given up: a page that would launch now would launch without it.
  let told = false;
  function tellBusy() {
    const now = uploading || checking;
    if (now === told) return;
    told = now;
    emit(self, 'af-folder-busy', { busy: now });
  }
  // The end is told from an effect rather than at each place it can end, so no way out, a cancel included, goes untold.
  // The start is told where it happens, so it comes before anything else the upload or the check raises.
  $effect(tellBusy);
  const resuming = $derived(!!resumeSet && !spent.includes(resumeSet) && mode !== 'watched' && !uploading && !target);
  const grainHint = $derived(
    folder?.grain === 'folder' ? (folder.depth > 1 ? fill(text.folderGrainDeep, { depth: folder.depth }) : text.folderGrainFolder) : folder?.grain === 'file' ? text.folderGrainFile : '',
  );
  const hint = $derived([grainHint, resuming ? text.folderResumeHint : ''].filter(Boolean).join(' '));
  const progressText = $derived(progress ? fill(text.folderUploadProgress, { stored: n(progress.stored), total: n(progress.total) }) : text.folderUploadStarting);
  const status = $derived(
    refusedKey ? text[refusedKey] : failure === 'upload' ? text.folderUploadFailed : failure === 'preview' ? text.folderPreviewFailed : notice || (checking ? text.folderChecking : said),
  );
  const spoken = $derived(!failure && !notice && !checking && !!said);
  const refusedLine = $derived(refused.length ? fill(refused.length === 1 ? text.folderRefusedFilesOne : text.folderRefusedFiles, { count: n(refused.length) }) : '');

  function hush() {
    noted += 1;
    notice = '';
    said = '';
  }
  /** Says `message` through the live region, shown as a refusal of what the person did unless it is only `spoken`. */
  async function notify(message: string, spoken = false) {
    // A live region says nothing when its text is set to what it already holds, so a message repeated is cleared first.
    hush();
    const mine = noted;
    await tick();
    if (mine !== noted) return;
    if (spoken) said = message;
    else notice = message;
  }
  /** Whether there is anything to read through. A page that gave no `sources` is told so where the person acts. */
  function ready() {
    if (!sources) void notify(text.folderNoSources);
    return !!sources;
  }

  function withdraw() {
    abort?.abort();
    abort = null;
    run += 1;
    uploading = false;
    checking = false;
    progress = null;
    failure = '';
    refusedKey = '';
    hush();
    preview = null;
    refused = [];
    chosen = '';
    target = null;
    if (value) {
      value = null;
      emit(self, 'af-folder-change', { value: null, preview: null });
    }
  }

  /** Checks what a launch would take of `next`, and says what it found after `done`, the sentence for what led here. */
  async function check(next: FileSetEnvelope, done = '') {
    const mine = ++run;
    failure = '';
    refusedKey = '';
    // What an earlier check found is not left to be read beside what this one finds, which may be nothing to say.
    hush();
    checking = true;
    tellBusy();
    let found: FolderPreview | null = null;
    if (sources && workflow && field) {
      try {
        found = await sources.preview(workflow, field, next, version || undefined);
      } catch (error) {
        if (mine !== run) return;
        failure = 'preview';
        refusedKey = fail('preview', error);
      }
    }
    if (mine !== run) return;
    checking = false;
    value = next;
    preview = found;
    emit(self, 'af-folder-change', { value: next, preview: found });
    if (failure) return;
    // A refusal is an alert, which speaks for itself.
    const taken = found && !found.refusal ? `${text.folderPreview}: ${counts.map(([label, count]) => `${label} ${n(count)}`).join(', ')}.` : '';
    const outcome = [done, taken, refusedLine].filter(Boolean).join(' ');
    if (outcome) void notify(outcome, true);
  }

  /** Tells the page, in the server's words, and returns the key of the kit's own when asking again cannot help. */
  function fail(during: 'upload' | 'preview' | 'list', error: unknown): keyof KitStrings | '' {
    const { status, code, message, refused } = problem(error);
    emit(self, 'af-folder-error', { during, status, code, message });
    return refused ? refusalKey(code) : '';
  }
  const HOME = ['[part~="dropzone"]', '[part~="source"] input:checked'];
  /** Focus goes to the first of `selectors` that is drawn, once the change that removed its holder has been drawn. */
  async function refocus(selectors: string[]) {
    await tick();
    for (const selector of selectors) {
      const el = self.shadowRoot?.querySelector<HTMLElement>(selector);
      if (el) return el.focus();
    }
  }
  const onCancel = () => !!self.shadowRoot?.activeElement?.matches('[part~="cancel"]');

  async function upload(pick: Pick) {
    if (!sources) return;
    withdraw();
    last = pick;
    const mine = run;
    const controller = (abort = new AbortController());
    const resume = open ?? (resumeSet && !spent.includes(resumeSet) ? resumeSet : undefined);
    made = false;
    uploading = true;
    tellBusy();
    chosen = pick.name;
    quarter = 0;
    void notify(text.folderUploadStarting, true);
    const options = {
      name: pick.name,
      resumeSetId: resume,
      signal: controller.signal,
      onSetCreated: (setId: string) => {
        if (mine !== run) return;
        open = setId;
        made = true;
        emit(self, 'af-folder-upload-started', { setId });
      },
      onProgress: ({ stored, total }: UploadProgress) => {
        if (mine !== run) return;
        progress = { stored, total };
        emit(self, 'af-folder-progress', { stored, total });
        const reached = Math.floor((stored * 4) / Math.max(total, 1));
        if (reached !== quarter) {
          quarter = reached;
          void notify(progressText, true);
        }
      },
    };
    try {
      const result = pick.kind === 'uploadFolder' ? await sources.uploadFolder(pick.payload, options) : await sources.uploadFiles(pick.payload, options);
      if (mine !== run) return;
      // Cancel goes with the upload, so focus it held moves on before it is lost to the page.
      if (onCancel()) void refocus(HOME);
      open = null;
      spent = [...spent, result.value.$fileSet];
      last = null;
      uploading = false;
      progress = null;
      refused = result.refused;
      target = result.value;
      await check(result.value, text.folderUploadDone);
    } catch (error) {
      if (mine !== run) return;
      const held = onCancel();
      uploading = false;
      progress = null;
      failure = 'upload';
      const refusal = fail('upload', error);
      if (refusal) {
        refusedKey = refusal;
        last = null;
        chosen = '';
        // A set this element announced can never complete now, and would hold one of the person's few unfinished sets.
        const dead = open;
        open = null;
        // The set being resumed was refused with it. One the page named is the page's to delete, and is only not offered again.
        const over = [dead, resume].filter((setId): setId is string => !!setId && !spent.includes(setId));
        if (over.length) spent = [...spent, ...new Set(over)];
        if (dead) void sources.deleteSet(dead).catch(() => undefined);
      }
      if (held) void refocus(['[part~="retry"]', ...HOME]);
    }
  }

  function cancel() {
    // Aborting deletes the set when this upload made it, so there is nothing left of it to resume.
    if (made) open = null;
    withdraw();
    void refocus(HOME);
  }

  function retry() {
    if (failure === 'upload' && last) void upload(last);
    else if (failure === 'preview' && target) void check(target);
    // The button goes with the failure; focus moves to what stands where it was, or to the control the value came from.
    void refocus(['[part~="cancel"]', '[part~="choose"][aria-pressed="true"]', ...HOME]);
  }
  // An upload does not outlive the element: leaving the page mid-upload stops it, as Cancel does.
  $effect(() => () => {
    run += 1;
    abort?.abort();
  });

  // The launch is checked again when what it would launch changes under what was chosen, a check still out included:
  // the newer check drops the older answer, which was for another workflow, field or version.
  $effect(() => {
    void [workflow, field, version];
    untrack(() => {
      if (target && !uploading) void check(target);
    });
  });

  let input = $state<HTMLInputElement | null>(null);
  function browse() {
    if (!locked && ready()) input?.click();
  }
  function onPick(event: Event) {
    const el = event.currentTarget as HTMLInputElement;
    const files = Array.from(el.files ?? []);
    // Emptied so that picking the same folder again, to resume it, is still a change.
    el.value = '';
    if (locked || !ready()) return;
    if (mode === 'computer') {
      if (!files.some((file) => !OS_FILE.test(file.name))) void notify(text.folderEmpty);
      else void upload({ kind: 'uploadFolder', payload: files, name: named(files[0]!.webkitRelativePath.split('/')[0] || files[0]!.name, 1) });
    } else if (files.length) void upload({ kind: 'uploadFiles', payload: files, name: named(files[0]!.name, files.length) });
  }
  /** A dropped folder is read before it is uploaded: one that holds no file is said to, and the server is not asked. */
  async function takeFolders(payload: FileSystemEntry[], name: string) {
    const mine = run;
    const holds = await holdsFile(payload);
    if (mine !== run || locked) return;
    if (holds) void upload({ kind: 'uploadFolder', payload, name });
    else void notify(text.folderEmpty);
  }
  function onDragOver(event: DragEvent) {
    // Cancelled even while locked: a drop nobody cancels opens the file in place of the page.
    event.preventDefault();
    dragging = !locked;
  }
  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    if (locked || !ready()) return;
    // An entry can only be asked for while the drop is being handled.
    const items = Array.from(event.dataTransfer?.items ?? []).filter((item) => item.kind === 'file');
    const entries = items.map((item) => item.webkitGetAsEntry?.() ?? null);
    const folders = entries.filter((entry) => entry?.isDirectory);
    if (mode === 'computer') {
      if (!folders.length) void notify(text.folderNeedsFolder);
      else void takeFolders(entries.filter((entry) => entry !== null), named(folders[0]!.name, folders.length));
      return;
    }
    const files = items.map((item) => item.getAsFile()).filter((file) => file !== null);
    if (folders.length || !files.length) void notify(text.folderNeedsFiles);
    else void upload({ kind: 'uploadFiles', payload: files, name: named(files[0]!.name, files.length) });
  }

  // The watched folders, and where in one of them the list stands.
  let roots = $state.raw<WatchedFolder[] | null>(null);
  let at = $state.raw<{ set: WatchedFolder; trail: Subfolder[] } | null>(null);
  let inside = $state.raw<Subfolder[]>([]);
  let cursor = $state<string | null>(null);
  let listing = $state(false);
  let listFailed = $state(false);
  let listRefused = $state<keyof KitStrings | ''>('');
  let listed = 0;
  const here = $derived(at?.trail.at(-1)?.path);
  const nothing = $derived(!listing && !listFailed && (at ? inside.length === 0 : roots?.length === 0));

  async function page(more: boolean) {
    if (!sources) return;
    const mine = ++listed;
    const from = more ? cursor : null;
    listing = true;
    listFailed = false;
    listRefused = '';
    try {
      if (at) {
        const next = await sources.subfolders(at.set.id, here, from);
        if (mine !== listed) return;
        inside = more ? [...inside, ...next.items] : next.items;
        cursor = next.next_cursor;
      } else {
        const found = await sources.watched();
        if (mine !== listed) return;
        roots = found;
      }
    } catch (error) {
      if (mine !== listed) return;
      listFailed = true;
      listRefused = fail('list', error);
    }
    listing = false;
  }
  $effect(() => {
    if (mode !== 'watched' || !sources) return;
    untrack(() => {
      if (!roots && !listing && !listFailed) void page(false);
    });
  });
  /** Focus follows the list: the row at `index`, or the place in the path when the list has none. */
  async function land(index: number) {
    await tick();
    const root = self.shadowRoot;
    (root?.querySelectorAll<HTMLElement>('[part~="choose"]')[index] ?? root?.querySelector<HTMLElement>('[part~="crumb"][aria-current]'))?.focus();
  }
  async function go(next: { set: WatchedFolder; trail: Subfolder[] } | null) {
    at = next;
    inside = [];
    cursor = null;
    if (next || !roots) await page(false);
    else {
      listed += 1;
      listing = false;
      listFailed = false;
      listRefused = '';
    }
    await land(0);
  }
  async function more() {
    const from = inside.length;
    await page(true);
    await land(from);
  }
  function choose(set: WatchedFolder, trail: Subfolder[]) {
    withdraw();
    const path = trail.at(-1)?.path;
    const next: FileSetEnvelope = path === undefined ? { $fileSet: set.id } : { $fileSet: set.id, path };
    target = next;
    chosen = [set.name, ...trail.map((folder) => folder.name)].join(' / ');
    void check(next);
  }
  const isTarget = (set: string, path?: string) => target?.$fileSet === set && target.path === path;
  const fileCount = (count: number) => fill(count === 1 ? text.folderFileCountOne : text.folderFileCount, { count: n(count) });

  const shownGrain = $derived(preview?.grain ?? folder?.grain ?? null);
  const counts = $derived.by(() => {
    if (!preview) return [];
    const rows = shownGrain === 'folder' ? [[text.folderGroups, preview.group_count], [text.folderItems, preview.item_count]] : [[text.folderItems, preview.group_count]];
    if (preview.excluded_count > 0) rows.push([text.folderLeftOut, preview.excluded_count]);
    return rows as [string, number][];
  });
  const reasons = $derived.by(() => {
    if (!preview) return [];
    const tally = { ...preview.excluded_by_reason };
    // Loose files are one left-out unit however many there are, so their own count is the one worth showing.
    if (preview.loose_file_count > 0) tally.NOT_IN_A_FOLDER = preview.loose_file_count;
    return Object.entries(tally)
      .filter(([, count]) => count > 0)
      .map(([code, count]) => ({ code, count, label: reasonKey(code) ? text[reasonKey(code)!] : fill(text.folderReasonOther, { code }) }));
  });
  const refusal = $derived(preview?.refusal ? text[refusalKey(preview.refusal.code)] : '');
</script>

{#snippet folderGlyph()}
  <svg class="icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
{/snippet}

{#snippet folderRow(name: string, meta: string, pressed: boolean, onChoose: () => void, onOpen: () => void)}
  <li part="folder" class="af-list-row compact" data-chosen={pressed ? '' : undefined}>
    <button type="button" part="choose" aria-pressed={pressed} disabled={locked} onclick={onChoose}>
      {@render folderGlyph()}
      <span class="name">{name}</span> <span class="meta">{meta}</span>
    </button>
    <button type="button" part="open" class="af-button ghost icon xs" aria-label={fill(text.folderOpen, { name })} title={fill(text.folderOpen, { name })} disabled={locked} onclick={onOpen}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    </button>
  </li>
{/snippet}

<KitStyles />
<div class="af-kit source">
  <div part="sources" class="af-segmented" role="radiogroup" aria-label={text.folderSource}>
    {#each offered as option (option)}
      <label part="source"><input type="radio" name="{id}-source" value={option} checked={mode === option} disabled={locked} onchange={() => { picked = option; hush(); }} /><span>{labels[option]}</span></label>
    {/each}
  </div>
  {#if hint}<p part="hint" id="af-hint">{hint}</p>{/if}

  {#if mode === 'watched'}
    <div class="browser">
      <nav part="path" class="af-breadcrumb" aria-label={text.folderWatchedRoot}>
        <ol>
          <li><button type="button" part="crumb" disabled={locked} aria-current={at ? undefined : 'location'} onclick={() => go(null)}>{text.folderWatchedRoot}</button></li>
          {#if at}
            {@const { set, trail } = at}
            <li><button type="button" part="crumb" disabled={locked} aria-current={trail.length ? undefined : 'location'} onclick={() => go({ set, trail: [] })}>{set.name}</button></li>
            {#each trail as crumb, i (crumb.path)}
              <li><button type="button" part="crumb" disabled={locked} aria-current={i === trail.length - 1 ? 'location' : undefined} onclick={() => go({ set, trail: trail.slice(0, i + 1) })}>{crumb.name}</button></li>
            {/each}
          {/if}
        </ol>
      </nav>
      {#if at ? inside.length : roots?.length}
        <ul part="list" class="af-list">
          {#if at}
            {@const { set, trail } = at}
            {#each inside as row (row.path)}
              {@render folderRow(
                row.name,
                row.settled_count < row.file_count ? fill(text.folderFilesReady, { ready: n(row.settled_count), count: n(row.file_count) }) : fileCount(row.file_count),
                isTarget(set.id, row.path),
                () => choose(set, [...trail, row]),
                () => go({ set, trail: [...trail, row] }),
              )}
            {/each}
          {:else}
            {#each roots ?? [] as set (set.id)}
              {@render folderRow(set.name, fileCount(set.entry_count), isTarget(set.id), () => choose(set, []), () => go({ set, trail: [] }))}
            {/each}
          {/if}
        </ul>
      {/if}
      {#if listing}
        <p class="loading" role="status"><span class="af-spinner" aria-hidden="true"></span> {text.loading}</p>
      {:else if listFailed}
        <p class="failed" role="alert"><span>{listRefused ? text[listRefused] : text.folderLoadFailed}</span>{#if !listRefused} <button type="button" class="af-button link xs" disabled={locked} onclick={() => page(false)}>{text.folderRetry}</button>{/if}</p>
      {:else if !sources}
        <p part="empty">{text.folderNoSources}</p>
      {:else if nothing}
        <p part="empty">{at ? text.folderNoSubfolders : text.folderWatchedEmpty}</p>
      {:else if at && cursor}
        <button type="button" part="more" class="af-button secondary xs" disabled={locked} onclick={more}>{text.loadMore}</button>
      {/if}
    </div>
  {:else}
    <button type="button" part="dropzone" aria-describedby={hint ? 'af-hint' : undefined} aria-disabled={locked ? 'true' : undefined} data-dragging={dragging ? '' : undefined}
      onclick={browse} ondragenter={onDragOver} ondragover={onDragOver} ondragleave={() => (dragging = false)} ondrop={onDrop}>
      <svg class="glyph" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m17 8-5-5-5 5" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /></svg>
      <span class="lead">{mode === 'computer' ? text.folderDrop : text.dropFiles} <span part="trigger">{mode === 'computer' ? text.folderBrowse : text.browse}</span></span>
    </button>
    <!-- The directory flag is written in the markup, not bound: a bound one is set as a property, which not every DOM reflects. -->
    {#if mode === 'computer'}
      <input bind:this={input} type="file" webkitdirectory hidden tabindex="-1" onchange={onPick} />
    {:else}
      <input bind:this={input} type="file" multiple hidden tabindex="-1" onchange={onPick} />
    {/if}
  {/if}

  {#if uploading}
    <div class="upload">
      {#if progress}
        <progress part="progress" class="af-progress" max={Math.max(progress.total, 1)} value={progress.stored} aria-label={text.uploading} aria-valuetext={progressText}></progress>
      {:else}
        <progress part="progress" class="af-progress" aria-label={text.uploading} aria-valuetext={progressText}></progress>
      {/if}
      <span class="progress-text" aria-hidden="true">{progressText}</span>
      <button type="button" part="cancel" class="af-button ghost xs" onclick={cancel}>{text.cancel}</button>
    </div>
  {/if}
  <div class="status">
    <div part="notice" role="status" aria-live="polite" data-tone={failure || notice ? 'danger' : undefined} data-spoken={spoken ? '' : undefined}>{status}</div>
    {#if failure && !refusedKey}<button type="button" part="retry" class="af-button secondary xs" disabled={!!disabled} onclick={retry}>{text.folderRetry}</button>{/if}
  </div>

  {#if chosen}<p part="chosen">{@render folderGlyph()}<span class="name">{chosen}</span></p>{/if}
  {#if value && (preview || refused.length)}
    <section part="preview" aria-label={text.folderPreview}>
      {#if preview?.refusal}
        <div part="refusal" class="af-banner danger" role="alert"><div class="af-banner-title">{text.folderRefusal}</div> <div class="af-banner-description">{refusal}</div></div>
      {/if}
      {#if counts.length}
        <dl class="counts">
          {#each counts as [label, count] (label)}
            <div part="count"><dt>{label}</dt> <dd>{n(count)}</dd></div>
          {/each}
        </dl>
      {/if}
      {#if preview?.sample_keys.length}
        <p part="sample"><span class="label">{text.folderSample}</span> <span class="keys">{preview.sample_keys.join(', ')}</span></p>
      {/if}
      {#if reasons.length}
        <ul class="reasons" aria-label={text.folderLeftOut}>
          {#each reasons as reason (reason.code)}
            <li part="reason" data-code={reason.code}><span>{reason.label}</span> <span class="count">{n(reason.count)}</span></li>
          {/each}
        </ul>
      {/if}
      {#if refused.length}
        <p class="refused">{refusedLine}</p>
      {/if}
    </section>
  {/if}
</div>

<!-- Notes on the styles below, kept out of the style element because a custom element ships its CSS as written.
  - The drop zone is af-file-upload's: a centred column 16px tall and 12px in, a 2px dashed edge, the upload glyph at
    16px, the sentence at 12px with the browse words in the primary at 500, and the primary's tint while something is
    dragged over it. Its greys are the foreground and the muted text mixed into the surface, as there.
  - The source switch is the kit's segmented control, the path its breadcrumb with buttons for links, a row the kit's
    compact list row inside the card's edge, and the refusal its danger banner.
  - What the drop zone holds takes no pointer, so a drag moving over its words does not leave and re-enter the zone.
  - The notice takes no room while it is empty or holds what is only spoken (the progress and the outcome, which the bar
    and the preview already show): its row's margin takes back the gap before it, and the spoken text is clipped to a
    pixel, since a live region left out of the layout would not be heard.
  - The list of folders scrolls inside itself past seven rows, so a long watched folder does not push the preview away.
    The scroll is the browser's own, drawn thin in the kit's line colour, and not the kit's scroller: the elements bundle
    carries this element, and the scroller would bring Ark's scroll area with it. Every row is a tab stop, so a keyboard
    scrolls it by moving through it. test/kit/no-plain-scroll.test.ts names the exception.
  - A row's file count is the muted text at full strength: mixed into the surface it fell under 4.5:1.
-->
<style>
  :host { display: block; }
  .source { display: flex; flex-direction: column; align-items: stretch; gap: 8px; font-size: 12px; line-height: 1.5;
    --fs-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));
    --fs-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface)); }
  [part~='sources'] { align-self: flex-start; }
  [part~='hint'] { margin: 0; color: var(--k-muted); font-size: 11.5px; }
  [part~='dropzone'] { display: flex; box-sizing: border-box; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 100%;
    padding: 16px 12px; border: 2px dashed var(--fs-edge); border-radius: max(0px, calc(var(--k-radius) - 2px));
    background-color: color-mix(in oklab, var(--k-muted-bg) 40%, transparent); color: var(--k-fg); font: inherit; text-align: center; outline: none; cursor: pointer;
    transition-property: color, background-color, border-color, box-shadow; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
  [part~='dropzone']:hover { border-color: var(--fs-soft); }
  [part~='dropzone'][data-dragging] { border-color: color-mix(in oklab, var(--k-primary) 60%, var(--k-surface)); background-color: color-mix(in oklab, var(--k-primary) 4%, transparent); }
  [part~='dropzone']:focus-visible { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  [part~='dropzone'][aria-disabled='true'] { opacity: 0.5; cursor: not-allowed; }
  .glyph { flex: none; color: var(--fs-soft); }
  [part~='trigger'] { color: var(--k-primary); font-weight: 500; }
  [part~='dropzone']:not([aria-disabled='true']):hover [part~='trigger'] { text-decoration-line: underline; }
  [part~='dropzone'] > * { pointer-events: none; }
  .browser { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
  [part~='crumb'] { padding: 0; border: 0; border-radius: 2px; background: none; color: var(--k-muted); font: inherit; outline: none; cursor: pointer; }
  [part~='crumb']:hover, [part~='crumb'][aria-current] { color: var(--k-fg); }
  [part~='crumb']:disabled { cursor: not-allowed; }
  [part~='crumb']:disabled:not([aria-current]) { color: var(--k-muted); }
  [part~='crumb']:focus-visible { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  [part~='list'] { box-sizing: border-box; align-self: stretch; max-height: 224px; overflow: auto; scrollbar-width: thin; scrollbar-color: var(--k-line) transparent; border: 1px solid var(--k-line); border-radius: max(0px, calc(var(--k-radius) - 2px)); background-color: var(--k-surface); }
  [part~='folder'] { padding-block: 2px; padding-inline: 4px; gap: 4px; }
  [part~='folder'][data-chosen] { background-color: color-mix(in oklab, var(--k-primary) 6%, var(--k-surface)); }
  [part~='choose'] { display: flex; flex: 1 1 0%; align-items: center; gap: 8px; min-width: 0; min-height: 28px; padding: 2px 8px; border: 0; border-radius: 4px; background: none; color: var(--k-fg);
    font: inherit; text-align: start; outline: none; cursor: pointer; }
  [part~='choose']:focus-visible { box-shadow: 0 0 0 3px var(--k-focus-ring); }
  [part~='choose'][aria-pressed='true'] .name { color: var(--k-primary); font-weight: 500; }
  [part~='choose']:disabled { opacity: 0.5; cursor: not-allowed; }
  .icon { flex: none; width: 14px; height: 14px; color: var(--k-muted); }
  .name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta { flex: none; margin-inline-start: auto; color: var(--k-muted); font-size: 10.5px; font-variant-numeric: tabular-nums; }
  .loading, .failed, [part~='empty'] { margin: 0; color: var(--k-muted); font-size: 11.5px; }
  .loading { display: flex; align-items: center; gap: 6px; }
  .failed { color: var(--k-danger); }
  [part~='empty'] { font-style: italic; }
  .upload { display: flex; align-items: center; gap: 8px; }
  .upload [part~='progress'] { flex: 1 1 0%; min-width: 0; }
  .progress-text { flex: none; color: var(--k-muted); font-size: 11.5px; font-variant-numeric: tabular-nums; }
  .status { display: flex; position: relative; align-items: center; gap: 8px; }
  .status:has([part~='notice']:empty), .status:has([part~='notice'][data-spoken]) { margin-top: -8px; }
  [part~='notice'][data-spoken] { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  [part~='notice'] { color: var(--k-muted); font-size: 11.5px; }
  [part~='notice'][data-tone='danger'] { color: var(--k-danger); }
  [part~='chosen'] { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--k-fg); font-weight: 500; }
  [part~='preview'] { display: flex; box-sizing: border-box; flex-direction: column; gap: 8px; padding: 10px 12px; border: 1px solid var(--k-line);
    border-radius: max(0px, calc(var(--k-radius) - 2px)); background-color: var(--k-surface); }
  .counts { display: flex; flex-wrap: wrap; gap: 4px 24px; margin: 0; }
  [part~='count'] { display: flex; align-items: baseline; gap: 6px; }
  [part~='count'] dt { color: var(--k-muted); font-size: 10.5px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
  [part~='count'] dd { margin: 0; color: var(--k-fg); font-size: 13.5px; font-weight: 500; font-variant-numeric: tabular-nums; }
  [part~='sample'] { margin: 0; color: var(--k-fg); overflow-wrap: anywhere; }
  .label { color: var(--k-muted); }
  .reasons { margin: 0; padding: 6px 0 0; border-top: 1px solid var(--k-line); list-style: none; }
  [part~='reason'] { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-block: 2px; color: var(--k-fg); }
  .count { flex: none; color: var(--k-muted); font-variant-numeric: tabular-nums; }
  .refused { margin: 0; color: var(--k-warning); }
  @media (prefers-reduced-motion: reduce) { [part~='dropzone'] { transition: none; } }
  @media (forced-colors: active) {
    [part~='dropzone']:focus-visible, [part~='crumb']:focus-visible, [part~='choose']:focus-visible { outline: 2px solid; outline-offset: 2px; }
    [part~='folder'][data-chosen] { forced-color-adjust: none; background-color: Highlight; }
    [part~='folder'][data-chosen] [part~='choose'] { color: HighlightText; }
  }
</style>
