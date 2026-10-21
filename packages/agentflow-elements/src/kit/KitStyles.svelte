<svelte:options runes />

<script lang="ts">
  import { KIT_CSS } from './css.js';

  const markup = `<style>${KIT_CSS}</style>`;
</script>

{@html markup}
