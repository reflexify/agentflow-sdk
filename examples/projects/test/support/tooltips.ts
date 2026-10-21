import { fireEvent } from '@testing-library/react';

/**
 * What the pointer coming over them does: every tooltip under `root` that has not been shown yet mounts. Tooltips mount
 * only then, so a test reads one after this.
 */
export function hoverTooltips(root: ParentNode = document): void {
  for (const stand of [...root.querySelectorAll('span.tip')]) fireEvent.pointerOver(stand);
}
