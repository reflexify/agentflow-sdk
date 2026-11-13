export function shadowOf(host: HTMLElement): ShadowRoot {
  if (!host.shadowRoot) throw new Error(`${host.localName} has no shadow root`);
  return host.shadowRoot;
}

/** Raises a kit event on `host`. A cancelable one returns false when a listener called `preventDefault()`. */
export function emit<T>(host: HTMLElement, type: string, detail: T, init: { cancelable?: boolean } = {}): boolean {
  return host.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: false, cancelable: init.cancelable ?? false }));
}

/** Shows or hides a `popover` layer, and records the state as `data-raised` on `host`, the element the app holds. */
export function raise(el: HTMLElement | null | undefined, open: boolean, host: HTMLElement): void {
  if (!el || !el.isConnected) return;
  host.dataset.raised = String(open);
  let shown: boolean;
  try {
    shown = el.matches(':popover-open');
  } catch {
    // jsdom has no :popover-open; its stub records the state in data-shown.
    shown = el.dataset.shown === 'true';
  }
  if (open && !shown) el.showPopover?.();
  else if (!open && shown) el.hidePopover?.();
}

/** The element that holds focus, inside whatever shadow roots it sits in. */
export function deepActiveElement(): HTMLElement | null {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a instanceof HTMLElement ? a : null;
}

/** Whether `node` is `host` or inside it, across shadow roots: the light DOM slotted into it and any nested element's shadow tree. */
export function within(host: Element, node: Node): boolean {
  for (let n: Node | null = node; n; ) {
    if (n === host) return true;
    const root = n.getRootNode();
    n = n.parentNode ?? (root instanceof ShadowRoot ? root.host : null);
  }
  return false;
}

// The kit's open modals, oldest first. With modal={false} no Zag layer blocks pointers, so a lower dialog would also take a
// click meant for a dialog stacked over it; a dialog asks this stack whether it is the top one.
const openModals: HTMLElement[] = [];

export function isTopModal(host: HTMLElement): boolean {
  for (let i = openModals.length - 1; i >= 0; i--) {
    if (openModals[i]!.isConnected) return openModals[i] === host;
    openModals.splice(i, 1);
  }
  return false;
}

// The dialogs leave Zag's focus trap off, because it cannot see slotted nodes; the modal <dialog> keeps focus off the page
// instead. So the element itself remembers what held focus before showModal() and gives it back on close.
export function modalSync(host: HTMLElement): (el: HTMLDialogElement | null, open: boolean) => void {
  let returnTo: HTMLElement | null = null;
  return (el, open) => {
    if (!el) return;
    if (open && !el.open) {
      returnTo = deepActiveElement();
      el.showModal();
      openModals.push(host);
    } else if (!open && el.open) {
      el.close();
      const at = openModals.lastIndexOf(host);
      if (at >= 0) openModals.splice(at, 1);
      const target = returnTo;
      returnTo = null;
      const now = deepActiveElement();
      if (target?.isConnected && (!now || now === document.body || within(host, now))) target.focus({ preventScroll: true });
    }
  };
}

/**
 * Whether `host` is drawn inside `layer`, walking the flattened tree: a slotted node climbs to its slot, a shadow root to
 * its host. Zag's layer stack takes every layer opened after another as nested in it, and dismisses it when that one
 * closes; a kit overlay asks this to tell a layer it really sits in from one that merely opened before it.
 */
export function drawnInside(layer: Node, host: Node): boolean {
  for (let n: Node | null = host; n; ) {
    if (n === layer) return true;
    n = (n instanceof Element && n.assignedSlot) || n.parentNode || (n instanceof ShadowRoot ? n.host : null);
  }
  return false;
}

/**
 * The text direction `host` is in: the value of its closest `dir` attribute, climbing out of shadow roots, else its
 * computed `direction`. A Zag machine takes it once, when it is created, for its arrow keys and its parts' `dir`.
 */
export function directionOf(host: Element): 'ltr' | 'rtl' {
  for (let n: Node | null = host; n; n = n.parentNode ?? (n instanceof ShadowRoot ? n.host : null)) {
    if (!(n instanceof Element) || !n.hasAttribute('dir')) continue;
    const value = n.getAttribute('dir')!.toLowerCase();
    if (value === 'rtl' || value === 'ltr') return value;
    break;
  }
  return getComputedStyle(host).direction === 'rtl' ? 'rtl' : 'ltr';
}
