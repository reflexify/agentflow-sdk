<script lang="ts">
  import type { FieldSpec } from './form.js';
  import type { Translate } from './i18n.js';

  let {
    fields,
    values = $bindable({}),
    errors = {},
    disabled = false,
    t,
  }: { fields: FieldSpec[]; values?: Record<string, unknown>; errors?: Record<string, string>; disabled?: boolean; t: Translate } =
    $props();

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
    <label part="label" for={`f-${field.key}`}>
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
    {:else if field.kind === 'unsupported'}
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
    {#if errors[field.key]}<p part="field-error" class="error" role="alert">{errors[field.key]}</p>{/if}
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
</style>
