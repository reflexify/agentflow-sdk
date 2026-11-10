// This module imports nothing and registers no tag, so a page's own layers can call it without loading the kit.

// Held under a registered symbol, so a claim made through one copy of the kit is read by every other copy.
const CLAIM = Symbol.for('af-kit.escape-claimed');

// The kit's hosts that close on Escape while they mark themselves raised. A raised toast region, bulk bar or chart
// tooltip does not close on Escape, so it claims nothing.
const RAISED = new Set(['af-menu', 'af-popover', 'af-select', 'af-combobox', 'af-date', 'af-person-picker', 'af-tree-picker', 'af-rich-editor']);
const MODAL = new Set(['af-dialog', 'af-confirm']);

function isOpen(el: Element, path: readonly EventTarget[]): boolean {
  const tag = el.localName;
  if (MODAL.has(tag)) return (el as Element & { open?: unknown }).open === true;
  if (el.getAttribute('data-raised') !== 'true') return false;
  // A tooltip closes only on an Escape pressed on its own anchor; one shown by hover must not keep an Escape pressed elsewhere.
  if (tag === 'af-tooltip') return path.includes(el);
  return RAISED.has(tag);
}

function holdsOpen(root: ParentNode, path: readonly EventTarget[]): boolean {
  for (const el of root.querySelectorAll('*')) {
    if (isOpen(el, path)) return true;
    if (el.shadowRoot && holdsOpen(el.shadowRoot, path)) return true;
  }
  return false;
}

/**
 * Asks whether an Escape belongs to an open kit overlay inside `within` (anywhere in the document when it is null or
 * omitted), across open shadow roots. When it does, the event is marked as claimed and `true` comes back: a page's own
 * layer that catches Escape before the kit then cancels the event to stay open, and the kit's topmost overlay closes on
 * it as on an Escape nobody cancelled.
 */
export function claimEscape(event: KeyboardEvent, within?: Element | null): boolean {
  if (event.key !== 'Escape' || event.isComposing) return false;
  const path = event.composedPath();
  const found = within
    ? (!!within.shadowRoot && holdsOpen(within.shadowRoot, path)) || holdsOpen(within, path)
    : holdsOpen((event.target as Node | null)?.ownerDocument ?? document, path);
  if (found) Object.defineProperty(event, CLAIM, { value: true, configurable: true });
  return found;
}

/** Whether a page's layer handed this Escape to the kit with `claimEscape`. */
export function isClaimed(event: Event): boolean {
  return (event as Event & { [CLAIM]?: unknown })[CLAIM] === true;
}
