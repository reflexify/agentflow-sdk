<script lang="ts">
  import type { VerdictModel } from './verdict.js';

  let { model }: { model: VerdictModel } = $props();
</script>

<div class="verdict" part="verdict" data-verdict={model.kind} data-tone={model.tone}>
  <svg class="icon" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style:color={model.tone === 'warning' ? 'var(--k-warning)' : undefined}>
    {#if model.kind === 'partitions'}
      <path d="M3 8.5 6.5 12 13 4.5" />
    {:else if model.kind === 'fans_out'}
      <path d="M8 2.5 14.5 13.5H1.5Z" />
      <path d="M8 6.5v3.2M8 11.8v.01" />
    {:else}
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25V11.5M8 4.8v.01" />
    {/if}
  </svg>
  <span class="words">{model.text}</span>
</div>

<style>
  .verdict { display: flex; align-items: flex-start; gap: 6px; min-width: 0; color: var(--k-muted); font-size: 12px; line-height: 18px; }
  .verdict[data-tone='warning'] { color: var(--k-fg); }
  .icon { flex: none; margin-top: 2px; }
  .words { min-width: 0; overflow-wrap: anywhere; }
</style>
