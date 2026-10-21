import { KIT_CSS } from '@reflexify/agentflow-elements/kit';
import css from './projects.css?inline';

/**
 * Puts the module's stylesheet, with the kit's, where `root` renders: in its shadow root, so the page around it neither
 * styles the module nor is styled by it. Returns how to take it out.
 */
export function addProjectsStyles(root: ShadowRoot | Element): () => void {
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = root.ownerDocument.createElement('style');
  style.textContent = `${KIT_CSS}\n${css}`;
  if (scope instanceof ShadowRoot) scope.prepend(style);
  else root.prepend(style);
  return () => style.remove();
}
