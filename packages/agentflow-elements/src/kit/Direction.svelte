<script lang="ts">
  import { LocaleProvider } from '@ark-ui/svelte/locale';
  import type { Snippet } from 'svelte';

  // Ark gives a machine built by one of its Root components the `dir` of its locale context, and drops a `dir` handed to
  // the Root. That context offers no way to set the direction alone, so it is given a locale of the direction asked for.
  // Its locale reaches none of the machines below a kit element: the two that read one, the number input and the date
  // picker, are built by hooks that take the element's own locale and `dir`.
  let { dir, children }: { dir: 'ltr' | 'rtl'; children: Snippet } = $props();
</script>

<LocaleProvider locale={dir === 'rtl' ? 'ar' : 'en-US'}>{@render children()}</LocaleProvider>
