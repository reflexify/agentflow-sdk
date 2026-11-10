import type { KitStrings } from '../text.js';
import { OWNED, isOwned, keepOwned, reflect } from './owned.js';

const PROPS = {
  heading: { attribute: 'heading', type: 'String' },
  description: { attribute: 'description', type: 'String' },
  locale: { attribute: 'locale', type: 'String' },
} as const;

const MAX_COLUMNS = 4;
let seq = 0;

const columnsOf = (value: string | null) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(1, Math.min(MAX_COLUMNS, n)) : 1;
};

/** A child's grid column from its `data-span` and `data-col`, clamped as AgentFlow's form sections clamp a field's. */
function placement(child: Element, cols: number): string | null {
  const spanAttr = child.getAttribute('data-span');
  const colAttr = child.getAttribute('data-col');
  if (spanAttr === null && colAttr === null) return null;
  const whole = (value: string | null) => {
    const n = Math.trunc(Number(value ?? 1));
    return Number.isFinite(n) ? n : 1;
  };
  const span = Math.max(1, Math.min(cols, whole(spanAttr)));
  const col = Math.max(1, Math.min(cols, whole(colAttr)));
  return cols > 1 ? `${Math.min(col, cols - span + 1)} / span ${span}` : `span ${span} / span ${span}`;
}

/**
 * `<af-fieldset>`: a form section, a heading and a description over a grid of fields. Around a native `<fieldset>` the
 * page writes as its child, it heads that fieldset, which keeps disabling every control inside it; with none, it lays out
 * its own children and disables nothing. It has no shadow root and moves none of the page's nodes.
 */
export class AfFieldset extends HTMLElement {
  static observedAttributes = ['heading', 'description', 'columns', 'locale'];

  declare heading: string | null;
  declare description: string | null;
  declare locale: string | null;

  #strings: Partial<KitStrings> | null = null;
  readonly #base = `af-fieldset-${++seq}`;
  readonly #legend: HTMLElement = Object.assign(document.createElement('legend'), { className: 'af-fieldset-legend' });
  readonly #heading: HTMLElement = Object.assign(document.createElement('div'), { className: 'af-fieldset-legend' });
  readonly #description = Object.assign(document.createElement('p'), { className: 'af-fieldset-description' });
  #grid: Element | null = null;
  #kept: { grid: Element; first: Element[]; stop: () => void } | null = null;
  #observer: MutationObserver | null = null;
  // Set between connectedCallback and disconnectedCallback; an upgrade reports attributes before it connects.
  #live = false;
  #placed = new WeakSet<HTMLElement>();
  #labelled = false;

  constructor() {
    super();
    for (const el of [this.#legend, this.#heading, this.#description]) el.setAttribute(OWNED, '');
    this.#heading.id = `${this.#base}-heading`;
  }

  get strings(): Partial<KitStrings> | null { return this.#strings; }
  set strings(value: Partial<KitStrings> | null) { this.#strings = value ?? null; }

  /** 1 to 4, default 1. */
  get columns(): number { return columnsOf(this.getAttribute('columns')); }
  set columns(value: number | string | null) {
    if (value === null || value === undefined) this.removeAttribute('columns');
    else this.setAttribute('columns', String(value));
  }

  connectedCallback(): void {
    this.#live = true;
    for (const prop of [...Object.keys(PROPS), 'strings', 'columns']) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = (this as unknown as Record<string, unknown>)[prop];
        delete (this as unknown as Record<string, unknown>)[prop];
        (this as unknown as Record<string, unknown>)[prop] = value;
      }
    }
    this.#observer = new MutationObserver((records) => {
      if (records.some((r) => r.target === this)) this.#render();
      else this.#place();
    });
    this.#render();
  }

  disconnectedCallback(): void {
    this.#live = false;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#kept?.stop();
    this.#kept = null;
    this.#grid = null;
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  #render(): void {
    if (!this.#live) return;
    if (!this.classList.contains('af-fieldset')) this.classList.add('af-fieldset');
    this.setAttribute('data-af-columns', String(this.columns));

    let native: HTMLFieldSetElement | null = null;
    for (const child of this.children) {
      if (child instanceof HTMLFieldSetElement && !isOwned(child)) {
        native = child;
        break;
      }
    }
    const grid: Element = native ?? this;
    const heading = native ? this.#legend : this.#heading;
    (native ? this.#heading : this.#legend).remove();
    heading.textContent = this.heading ?? '';
    this.#description.textContent = this.description ?? '';
    const first = [...(this.heading ? [heading] : []), ...(this.description ? [this.#description] : [])];
    for (const node of [heading, this.#description]) if (!first.includes(node)) node.remove();

    // Without a native fieldset the element itself is the group, named by its heading.
    if (!native && this.heading) {
      if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
      this.setAttribute('aria-labelledby', this.#heading.id);
      this.#labelled = true;
    } else if (this.#labelled) {
      if (this.getAttribute('role') === 'group') this.removeAttribute('role');
      this.removeAttribute('aria-labelledby');
      this.#labelled = false;
    }

    const kept = this.#kept;
    if (!kept || kept.grid !== grid || kept.first.length !== first.length || kept.first.some((n, i) => n !== first[i])) {
      kept?.stop();
      this.#kept = { grid, first, stop: keepOwned(grid, first, []) };
    }
    if (this.#grid !== grid) {
      if (this.#grid) for (const child of this.#grid.children) this.#unplace(child);
      this.#grid = grid;
      this.#observer?.disconnect();
      this.#observer?.observe(this, { childList: true });
      if (native) this.#observer?.observe(native, { childList: true, attributes: true, subtree: true, attributeFilter: ['data-span', 'data-col'] });
      else this.#observer?.observe(this, { childList: true, attributes: true, subtree: true, attributeFilter: ['data-span', 'data-col'] });
    }
    this.#place();
  }

  /** Writes each grid child's column from its attributes, and takes back a column it wrote that no longer applies. */
  #place(): void {
    const grid = this.#grid;
    if (!grid) return;
    const cols = this.columns;
    for (const child of grid.children) {
      if (isOwned(child) || !(child instanceof HTMLElement)) continue;
      const column = placement(child, cols);
      if (column === null) this.#unplace(child);
      else if (child.style.getPropertyValue('grid-column') !== column) {
        child.style.setProperty('grid-column', column);
        this.#placed.add(child);
      }
    }
  }

  #unplace(child: Element): void {
    if (child instanceof HTMLElement && this.#placed.has(child)) {
      child.style.removeProperty('grid-column');
      this.#placed.delete(child);
    }
  }
}

reflect(AfFieldset, PROPS);
