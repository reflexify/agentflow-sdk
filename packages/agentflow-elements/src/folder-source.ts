import { defineKitTag } from './kit-tag.js';

export const FOLDER_SOURCE_TAG = 'af-folder-source';

/**
 * Defines `af-folder-source`, the one kit element these elements draw, loading its code the first time it is asked for.
 * A page whose own kit registered the tag keeps its copy, and then nothing is loaded.
 */
export function defineFolderSource(registry: CustomElementRegistry = customElements): Promise<void> {
  return defineKitTag(FOLDER_SOURCE_TAG, () => import('./kit/FolderSource.svelte'), registry);
}
