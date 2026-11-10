/** The attribute on every node a light-DOM kit element inserts, and the only nodes it ever moves. */
export const OWNED = 'data-af-owned';

export const isOwned = (node: Node): boolean => node instanceof Element && node.hasAttribute(OWNED);

/**
 * Puts `first` at the start of `host`'s children and `last` at the end, each in order, moving only those nodes, which must
 * be marked `data-af-owned`. A page's framework keeps its own children where it put them and never finds one of them
 * moved, so React can add, swap and remove its children around these without throwing.
 */
function place(host: Element, first: readonly Element[], last: readonly Element[]): void {
  let ref: ChildNode | null = host.firstChild;
  for (const node of first) {
    if (node === ref) ref = node.nextSibling;
    else host.insertBefore(node, ref);
  }
  let inPlace = true;
  let at: ChildNode | null = host.lastChild;
  for (let i = last.length - 1; i >= 0; i--) {
    if (at !== last[i]) {
      inPlace = false;
      break;
    }
    at = at.previousSibling;
  }
  if (!inPlace) for (const node of last) host.append(node);
}

/** Keeps `nodes` (marked data-af-owned) at the start or end of `host`'s children as the page changes them. */
export function keepOwned(host: Element, first: Element[], last: Element[]): () => void {
  const head = [...first];
  const tail = [...last];
  place(host, head, tail);
  const observer = new MutationObserver(() => place(host, head, tail));
  observer.observe(host, { childList: true });
  return () => observer.disconnect();
}

type Reflected = Record<string, { attribute: string; type: 'String' | 'Boolean' }>;

/**
 * Gives `element`'s prototype a property for each entry that reads and writes its attribute: a String is the attribute's
 * value or `null` when it is absent, and a Boolean follows presence, as `disabled` does on an `<input>`.
 */
export function reflect(element: CustomElementConstructor, props: Reflected): void {
  for (const [prop, { attribute, type }] of Object.entries(props)) {
    Object.defineProperty(element.prototype, prop, {
      configurable: true,
      enumerable: true,
      get(this: HTMLElement) {
        return type === 'Boolean' ? this.hasAttribute(attribute) : this.getAttribute(attribute);
      },
      set(this: HTMLElement, value: unknown) {
        if (type === 'Boolean' ? !value : value === null || value === undefined) this.removeAttribute(attribute);
        else this.setAttribute(attribute, type === 'Boolean' ? '' : String(value));
      },
    });
  }
}
