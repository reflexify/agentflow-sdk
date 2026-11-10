<svelte:options namespace="svg" />

<script lang="ts">
  let { ids }: { ids: { other: string; restricted: string } } = $props();
</script>

<defs>
  <pattern id={ids.other} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="6" height="6" style:fill="var(--k-chart-other)" />
    <line x1="0" y1="0" x2="0" y2="6" stroke-width="2" style:stroke="var(--k-chart-hatch)" />
  </pattern>
  <pattern id={ids.restricted} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
    <rect width="6" height="6" style:fill="var(--k-chart-other)" />
    <line x1="0" y1="0" x2="0" y2="6" stroke-width="2" stroke-dasharray="2 2" style:stroke="var(--k-chart-hatch)" />
  </pattern>
</defs>
