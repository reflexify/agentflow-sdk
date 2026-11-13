<script lang="ts">
  import type { FileSetEnvelope, FolderPreview, FolderSources } from '@reflexify/agentflow-sdk';
  import type { FieldSpec } from './form.js';
  import type { Translate } from './i18n.js';

  let {
    fields,
    values = $bindable({}),
    errors = {},
    disabled = false,
    t,
    folders = null,
    foldersReady = true,
    foldersFailed = false,
    foldersRetrying = false,
    onFolderRetry,
    uploading = $bindable({}),
    refusing = $bindable({}),
  }: {
    fields: FieldSpec[];
    values?: Record<string, unknown>;
    errors?: Record<string, string>;
    disabled?: boolean;
    t: Translate;
    /** What a folder field's source needs, from the form that starts the workflow. A new `round` draws each source afresh. */
    folders?: {
      sources: FolderSources;
      workflow: string;
      locale: string;
      round: number;
      /** An upload set to continue, by field key. */
      resumeSets?: Record<string, string>;
      uploadStarted(field: string, setId: string): void;
    } | null;
    /**
     * Whether `af-folder-source` is defined. Its tag is not drawn before: an element not yet defined is given its props as
     * attributes, and `disabled="false"` would read as disabled once it is.
     */
    foldersReady?: boolean;
    /** Its code could not be loaded, so no folder field can be filled. */
    foldersFailed?: boolean;
    /** A Try again is loading the code: the failure stays drawn and its button is marked `aria-disabled` (a `disabled` button would lose focus), so focus stays on it. */
    foldersRetrying?: boolean;
    /** Asks for the folder source's code again after a failed load. */
    onFolderRetry?: () => void;
    /** The folder fields whose source is uploading or checking, by key: the form must not submit while one is. */
    uploading?: Record<string, boolean>;
    /** The folder fields whose chosen folder a launch would refuse, by key. The source says why, so nothing is drawn for it here. */
    refusing?: Record<string, boolean>;
  } = $props();

  const inputType: Record<string, string> = {
    text: 'text',
    email: 'email',
    date: 'date',
    datetime: 'datetime-local',
    number: 'number',
    integer: 'number',
  };
</script>

{#each fields as field (field.key)}
  <div part="field" class="field">
    <label part="label" id={`l-${field.key}`} for={field.kind === 'folder' ? undefined : `f-${field.key}`}>
      {field.label}{#if field.required}<span class="req" title={t('form.required')}> *</span>{/if}
    </label>
    {#if field.kind === 'boolean'}
      <input part="input" id={`f-${field.key}`} type="checkbox" {disabled} bind:checked={values[field.key] as boolean} />
    {:else if field.kind === 'choice'}
      <select part="input" id={`f-${field.key}`} {disabled} bind:value={values[field.key]}>
        <option value="">—</option>
        {#each field.options ?? [] as option (option.value)}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {:else if field.kind === 'folder' && folders && (foldersFailed || foldersRetrying)}
      <p part="field-error" class="error" role="alert">{t('form.folder_unavailable')}</p>
      {#if onFolderRetry}<button part="field-retry" type="button" data-field={field.key} aria-disabled={foldersRetrying ? "true" : "false"} onclick={onFolderRetry}>{t('form.folder_retry')}</button>{/if}
    {:else if field.kind === 'folder' && folders && !foldersReady}
      <p part="notice" class="muted" role="status">{t('common.loading')}</p>
    {:else if field.kind === 'folder' && folders}
      {#key folders.round}
        <af-folder-source
          part="folder-source"
          id={`f-${field.key}`}
          role="group"
          aria-labelledby={`l-${field.key}`}
          resumeSet={folders.resumeSets?.[field.key] ?? null}
          sources={folders.sources}
          workflow={folders.workflow}
          field={field.key}
          folder={field.folder}
          locale={folders.locale}
          {disabled}
          onaf-folder-upload-started={(e: CustomEvent<{ setId: string }>) => folders.uploadStarted(field.key, e.detail.setId)}
          onaf-folder-busy={(e: CustomEvent<{ busy: boolean }>) => (uploading[field.key] = e.detail.busy)}
          onaf-folder-change={(e: CustomEvent<{ value: FileSetEnvelope | null; preview: FolderPreview | null }>) => {
            values[field.key] = e.detail.value;
            refusing[field.key] = !!e.detail.preview?.refusal;
          }}
        ></af-folder-source>
      {/key}
    {:else if field.kind === 'unsupported' || field.kind === 'folder'}
      <p part="notice" class="muted">{t('form.unsupported')}</p>
    {:else}
      <input
        part="input"
        id={`f-${field.key}`}
        type={inputType[field.kind]}
        step={field.kind === 'integer' ? '1' : field.kind === 'number' ? 'any' : undefined}
        {disabled}
        bind:value={values[field.key]}
      />
    {/if}
    {#if field.description}<p class="muted">{field.description}</p>{/if}
    {#if uploading[field.key]}
      <p part="notice" class="muted">{t('form.uploading')}</p>
    {:else if errors[field.key]}
      <p part="field-error" class="error" role="alert">{errors[field.key]}</p>
    {/if}
  </div>
{/each}

<style>
  .field { display: grid; gap: 4px; margin-block-end: var(--agentflow-gap, 12px); }
  label { font-weight: 600; }
  .req { color: var(--agentflow-danger, #b42318); }
  .muted { color: var(--agentflow-muted, #667085); margin: 0; font-size: 0.9em; }
  .error { color: var(--agentflow-danger, #b42318); margin: 0; }
  input, select {
    font: inherit; padding: 6px 8px; border: 1px solid var(--agentflow-border, #d0d5dd);
    border-radius: var(--agentflow-radius, 6px);
  }
  /* Marked unavailable while its retry loads, but still focusable: a disabled button would drop focus. */
  [part='field-retry'][aria-disabled='true'] {
    opacity: 0.6;
    cursor: progress;
  }
</style>
