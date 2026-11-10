/**
 * Makes a scrolling region a tab stop while its content overflows, either way, and holds nothing a keyboard can reach by
 * Tab, and not otherwise. That is the browsers' own rule for a scroller, which Safari does not apply by itself: a region of
 * plain text needs the stop, or a keyboard could not scroll it, while one holding a field or a link is scrolled by tabbing
 * through what it holds, and a stop of its own would be one more, unnamed, before them.
 *
 * What it holds is read through slots and open shadow roots, so a page's slotted form or a kit element inside counts. It is
 * read again when the region or its first child resizes, when what is inside it changes (a node added or removed, or an
 * attribute that makes a node reachable by Tab or not), and when a slot inside it is given other nodes. Layout is read at
 * attach and in those callbacks, never while rendering. `onChange` hears whether the region is a stop, each time that is
 * decided.
 */
export function scrollStop(node: HTMLElement, onChange?: (stop: boolean) => void): () => void {
  const sync = () => {
    const overflows = node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight;
    const stop = overflows && !holdsTabbable(node);
    // Written only when it changes, since the region's own tabindex is among the attributes watched.
    if (stop && node.getAttribute('tabindex') !== '0') node.tabIndex = 0;
    else if (!stop && node.hasAttribute('tabindex')) node.removeAttribute('tabindex');
    onChange?.(stop);
  };
  sync();
  node.addEventListener('slotchange', sync);
  const changes = typeof MutationObserver === 'undefined' ? null : new MutationObserver(sync);
  changes?.observe(node, { subtree: true, childList: true, attributes: true, attributeFilter: REACHABLE });
  const sizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
  sizes?.observe(node);
  if (node.firstElementChild) sizes?.observe(node.firstElementChild);
  return () => {
    sizes?.disconnect();
    changes?.disconnect();
    node.removeEventListener('slotchange', sync);
  };
}

// The attributes that make a node reachable by Tab or not.
const REACHABLE = ['tabindex', 'disabled', 'href', 'contenteditable', 'inert', 'hidden'];

const tabbable = (el: Element): boolean => {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;
  const editable = el instanceof HTMLElement && el.isContentEditable && !el.parentElement?.isContentEditable;
  if (!editable && el.tabIndex < 0) return false;
  // A link with no href is no stop, though some engines give it a tabIndex of 0.
  if ((el instanceof HTMLAnchorElement || el instanceof HTMLAreaElement) && !el.hasAttribute('href') && !el.hasAttribute('tabindex')) return false;
  // :disabled also matches a control inside a disabled fieldset, whose own `disabled` stays false.
  if (el.matches(':disabled') || el.closest('[inert]')) return false;
  return typeof el.checkVisibility !== 'function' || el.checkVisibility({ visibilityProperty: true });
};

const reaches = (el: Element): boolean =>
  tabbable(el)
  || (el instanceof HTMLSlotElement && el.assignedElements({ flatten: true }).some((assigned) => reaches(assigned) || holdsTabbable(assigned)))
  || (!!el.shadowRoot && holdsTabbable(el.shadowRoot));

/** Whether anything under `root`, through slots and open shadow roots, is reached by Tab. */
export function holdsTabbable(root: ParentNode): boolean {
  for (const el of root.querySelectorAll('*')) if (reaches(el)) return true;
  return false;
}
