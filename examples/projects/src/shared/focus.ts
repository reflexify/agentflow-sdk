import { useLayoutEffect, type RefObject } from 'react';

/**
 * Whether Escape belongs to something inside the drawer rather than to the drawer: a drag on the board, an open kit
 * overlay, or a field that took it to put back an edit. A closed person picker marks every Escape as handled although
 * it does nothing with it, so its mark alone keeps nothing open.
 */
export function escapeTaken(e: Event): boolean {
  // A drag in progress on the board takes Escape to cancel it; its listener is on the document, after this one.
  const scope = e.currentTarget as ParentNode | null;
  if (scope?.querySelector?.('.board[data-dragging]')) return true;
  const path = e.composedPath();
  const inKit = path.some((n) => n instanceof Element && n.tagName.startsWith('AF-'));
  // Only a popup's own trigger counts: an expanded fold or disclosure on the page behind keeps nothing open.
  const open = path.some((n) => n instanceof Element && (
    (n.getAttribute('aria-expanded') === 'true' && (n.hasAttribute('aria-haspopup') || n.getAttribute('role') === 'combobox'))
    || (inKit && n instanceof HTMLDialogElement && n.open)
    || (inKit && n.hasAttribute('popover') && n.getAttribute('data-state') === 'open')));
  if (open) return true;
  const origin = path[0];
  const closedPicker = origin instanceof Element && origin.getAttribute('role') === 'combobox' && origin.getAttribute('aria-expanded') !== 'true';
  return e.defaultPrevented && !closedPicker;
}

/** The element focus is really on, inside every shadow root on the way down. */
export function deepActive(root: Document | ShadowRoot): Element | null {
  let at = root.activeElement;
  while (at?.shadowRoot?.activeElement) at = at.shadowRoot.activeElement;
  return at;
}

/**
 * Leaves the field focus is in, if it is in the drawer, so the field saves what is typed while its listeners are still
 * there: the editor flushes its pending change on blur, and the title saves on blur.
 */
export function leaveField(drawer: HTMLElement | null): HTMLElement | null {
  if (!drawer) return null;
  const root = drawer.getRootNode() as Document | ShadowRoot;
  const host = root.activeElement;
  if (!host || !drawer.contains(host)) return null;
  const left = deepActive(root) as HTMLElement | null;
  left?.blur();
  return left ?? (host as HTMLElement);
}

/**
 * On a switch to another task, the field keyed by the old one goes before the kit has handed over what is typed, and
 * its listeners with it. Leaving it here, while it and its listeners are still there, saves the draft to its own task.
 */
export function useLeaveOnUnmount(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    return () => { leaveField(el); };
  }, [ref]);
}
