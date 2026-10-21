import css from './desk.css?inline';

/**
 * Puts the desk's stylesheet where `root` renders: in its shadow root, so the page around it neither styles the desk
 * nor is styled by it. Returns how to take it out.
 */
export function addDeskStyles(root: ShadowRoot | Element): () => void {
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = root.ownerDocument.createElement('style');
  style.textContent = css;
  if (scope instanceof ShadowRoot) scope.prepend(style);
  else root.prepend(style);
  return () => style.remove();
}
