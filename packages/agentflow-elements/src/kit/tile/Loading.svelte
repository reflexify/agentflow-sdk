<script lang="ts">
  import type { KitStrings } from '../text.js';

  let { title, text }: { title: string; text: Required<KitStrings> } = $props();
</script>

{#if title}
  <div class="head" part="head"><div class="title" part="title">{title}</div></div>
{/if}
<div class="state" part="state" role="status">
  <div class="af-skeleton"></div>
  <span class="sr">{text.tileLoading}</span>
</div>

<style>
  .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .title { flex: 1 1 auto; min-width: 0; overflow: hidden; font-size: 13px; font-weight: 600; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
  .state { position: relative; padding: 16px 0; }
  .state .af-skeleton { height: 48px; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
