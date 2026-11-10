<script lang="ts">
  import type { FigureColor } from '@reflexify/agentflow-sdk/figures';
  import { paint } from './chart-model.js';
  import type { Pattern } from './chart-model.js';

  let { color = null, pattern = null, shape = 'box', faint = false }: { color?: FigureColor | null; pattern?: Pattern; shape?: 'box' | 'line' | 'outline' | 'hollow' | 'rule' | 'dashed' | 'ink'; faint?: boolean } = $props();
</script>

<span class="swatch {shape}" class:other={pattern === 'other'} class:restricted={pattern === 'restricted'} class:faint style:--tone={paint(color) || 'var(--k-chart-other)'} aria-hidden="true">{#if shape === 'ink'}<span class="run"></span><span class="point"></span>{/if}</span>

<style>
  .swatch { display: inline-block; flex: none; width: 10px; height: 10px; border-radius: 2px; background: var(--tone); }
  .swatch.faint { opacity: 0.4; }
  .box.other { background: repeating-linear-gradient(45deg, var(--k-chart-hatch) 0 2px, var(--k-chart-other) 2px 6px); }
  .box.restricted { background: repeating-linear-gradient(-45deg, var(--k-chart-hatch) 0 2px, var(--k-chart-other) 2px 6px); }
  .line { width: 14px; height: 2px; border-radius: 1px; }
  /* The running total as the chart draws it: a line at 0.7 with a dot on it. A target's rule has neither. */
  .ink { position: relative; width: 14px; height: 2px; border-radius: 0; background: none; }
  .run { position: absolute; inset: 0; border-radius: 1px; background: var(--k-fg); opacity: 0.7; }
  .point { position: absolute; top: 50%; left: 50%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: var(--k-fg); }
  .rule { width: 14px; height: 2px; border-radius: 0; background: var(--k-fg); }
  .dashed { width: 14px; height: 0; border-top: 2px dashed var(--k-fg); border-radius: 0; background: none; }
  .outline { box-sizing: border-box; border: 1px dashed var(--tone); background: none; }
  .hollow { box-sizing: border-box; width: 8px; height: 8px; border: 2px solid var(--tone); border-radius: 50%; background: none; }
</style>
