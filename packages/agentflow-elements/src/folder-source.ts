import { define, reportOlder, type Compiled } from './define.js';
import { KIT_VERSION } from './kit/version.js';

export const FOLDER_SOURCE_TAG = 'af-folder-source';

/**
 * Defines `af-folder-source`, the one kit element these elements draw, loading its code the first time it is asked for.
 * A page whose own kit registered the tag keeps its copy, and then nothing is loaded.
 */
export async function defineFolderSource(registry: CustomElementRegistry = customElements): Promise<void> {
  const existing = registry.get(FOLDER_SOURCE_TAG);
  if (existing) return reportOlder(FOLDER_SOURCE_TAG, existing, 'kitVersion', KIT_VERSION, 'UI kit');
  const component = (await import('./kit/FolderSource.svelte')).default as unknown as Compiled;
  // The kit's own entry stamps the same class the same way, whichever of the two loads first.
  Object.defineProperty(component.element, 'kitVersion', { value: KIT_VERSION });
  // Asked again: the page's kit may have registered the tag while this copy was on its way.
  define(registry, { [FOLDER_SOURCE_TAG]: component }, 'kitVersion', KIT_VERSION, 'UI kit');
}
