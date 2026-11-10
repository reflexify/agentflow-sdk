import type { KitStrings } from '../text.js';
import { kitText } from '../text.js';
import { OWNED, isOwned, keepOwned, reflect } from './owned.js';

const PROPS = {
  label: { attribute: 'label', type: 'String' },
  description: { attribute: 'description', type: 'String' },
  error: { attribute: 'error', type: 'String' },
  invalid: { attribute: 'invalid', type: 'Boolean' },
  required: { attribute: 'required', type: 'Boolean' },
  readonly: { attribute: 'readonly', type: 'Boolean' },
  edited: { attribute: 'edited', type: 'Boolean' },
  lockedReason: { attribute: 'locked-reason', type: 'String' },
  locale: { attribute: 'locale', type: 'String' },
} as const;

// lucide's Lock.
const LOCK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

let seq = 0;

type KitControl = HTMLElement & Record<'label' | 'description' | 'error', string | null> & Record<'invalid' | 'required' | 'readonly', boolean>;

const isKit = (el: Element): el is KitControl => (el.constructor as { kitVersion?: unknown }).kitVersion !== undefined;
const isGroup = (el: Element) => /^(radiogroup|group)$/.test(el.getAttribute('role') ?? '');
const isNative = (el: Element): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
  el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;

function owned<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.className = className;
  el.setAttribute(OWNED, '');
  return el;
}

type KitKey = 'label' | 'description' | 'error' | 'invalid' | 'required' | 'readonly';

/** What the field set on a control of the page's, so that it gives back only that. */
interface Wired {
  control: Element;
  labelledBy: boolean;
  required: boolean;
  readOnly: boolean;
  ariaReadonly: boolean;
  ariaInvalid: boolean;
  ariaRequired: boolean;
  /** A kit control's properties the field wrote, each with the value the control had before. */
  kit: Partial<Record<KitKey, unknown>>;
}

/**
 * `<af-field>`: a label, a description and an error around one control the page writes as its child. It has no shadow
 * root: it inserts nodes of its own, each marked `data-af-owned`, and keeps them first and last as the page changes its
 * children, never moving one of the page's.
 */
export class AfField extends HTMLElement {
  static observedAttributes = ['label', 'description', 'error', 'invalid', 'required', 'readonly', 'edited', 'locked-reason', 'name', 'locale'];

  declare label: string | null;
  declare description: string | null;
  declare error: string | null;
  declare invalid: boolean;
  declare required: boolean;
  declare readonly: boolean;
  declare edited: boolean;
  declare lockedReason: string | null;
  declare locale: string | null;

  #strings: Partial<KitStrings> | null = null;
  readonly #base = `af-field-${++seq}`;
  readonly #row = owned('div', 'af-field-row');
  readonly #label = owned('label', 'af-field-label');
  readonly #description = owned('p', 'af-field-description');
  readonly #error = owned('p', 'af-field-error');
  readonly #star = Object.assign(document.createElement('span'), { className: 'af-field-required', textContent: '*' });
  readonly #tooltip = document.createElement('af-tooltip');
  readonly #lock = Object.assign(document.createElement('button'), { type: 'button', className: 'af-button ghost icon xs af-field-lock', innerHTML: LOCK_ICON });
  #kept: { first: Element[]; last: Element[]; stop: () => void } | null = null;
  #observer: MutationObserver | null = null;
  // Set between connectedCallback and disconnectedCallback; an upgrade reports attributes before it connects.
  #live = false;
  #wired: Wired | null = null;
  #waiting = new WeakSet<Element>();

  constructor() {
    super();
    this.#label.id = `${this.#base}-label`;
    this.#description.id = `${this.#base}-description`;
    this.#error.id = `${this.#base}-error`;
    this.#row.append(this.#label);
    this.#star.setAttribute('aria-hidden', 'true');
    this.#tooltip.append(this.#lock);
    // A label cannot point into a shadow root, so a kit control is focused from the label by hand.
    this.#label.addEventListener('click', () => {
      const control = this.#wired?.control;
      if (control && isKit(control)) control.focus();
    });
  }

  get strings(): Partial<KitStrings> | null { return this.#strings; }
  set strings(value: Partial<KitStrings> | null) {
    this.#strings = value ?? null;
    this.#render();
  }

  /** The field's own `name`, or else its control's: what a form files the field's error under. */
  get name(): string | null {
    const own = this.getAttribute('name');
    if (own !== null) return own;
    const control = this.control;
    return control?.getAttribute('name') ?? control?.querySelector('[name]')?.getAttribute('name') ?? null;
  }
  set name(value: string | null) {
    if (value === null || value === undefined) this.removeAttribute('name');
    else this.setAttribute('name', String(value));
  }

  /** The first element child that is neither the field's own nor in a named slot. */
  get control(): Element | null {
    for (const child of this.children) if (!isOwned(child) && !child.hasAttribute('slot')) return child;
    return null;
  }

  connectedCallback(): void {
    this.#live = true;
    for (const prop of [...Object.keys(PROPS), 'strings', 'name']) {
      // A property set before the tag was defined sits on the instance and hides the accessor.
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = (this as unknown as Record<string, unknown>)[prop];
        delete (this as unknown as Record<string, unknown>)[prop];
        (this as unknown as Record<string, unknown>)[prop] = value;
      }
    }
    this.#observer = new MutationObserver(() => this.#tend());
    this.#observer.observe(this, { childList: true, attributes: true, attributeFilter: ['class'] });
    this.#render();
  }

  disconnectedCallback(): void {
    this.#live = false;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#kept?.stop();
    this.#kept = null;
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  #tend(): void {
    // React writes `class` whole when its className changes.
    if (!this.classList.contains('af-field')) this.classList.add('af-field');
    this.#wire();
  }

  #render(): void {
    if (!this.#live) return;
    if (!this.classList.contains('af-field')) this.classList.add('af-field');
    const text = kitText(this.locale, this.#strings ?? undefined);
    const reason = this.lockedReason || null;

    this.#label.replaceChildren(this.label ?? '');
    if (this.required) this.#label.append(this.#star);
    if (reason) {
      this.#tooltip.setAttribute('text', reason);
      this.#lock.setAttribute('aria-label', text.locked);
      if (this.#tooltip.parentNode !== this.#row) this.#row.append(this.#tooltip);
    } else this.#tooltip.remove();

    // The reason is in the description too, hidden, because the tooltip's bubble is in its shadow root, where the
    // control's aria-describedby cannot reach.
    const description = this.description || null;
    this.#description.replaceChildren(description ?? '');
    if (reason) {
      const hidden = document.createElement('span');
      hidden.setAttribute('data-af-hidden', '');
      hidden.textContent = description ? ` ${reason}` : reason;
      this.#description.append(hidden);
    }
    this.#description.toggleAttribute('data-af-hidden', !description && !!reason);
    this.#error.textContent = this.error ?? '';

    const first = this.label || reason || this.required ? [this.#row] : [];
    const last = [...(description || reason ? [this.#description] : []), ...(this.error ? [this.#error] : [])];
    for (const node of [this.#row, this.#description, this.#error]) if (![...first, ...last].includes(node)) node.remove();
    const same = (a: Element[], b: Element[]) => a.length === b.length && a.every((n, i) => n === b[i]);
    if (!this.#kept || !same(this.#kept.first, first) || !same(this.#kept.last, last)) {
      this.#kept?.stop();
      this.#kept = { first, last, stop: keepOwned(this, first, last) };
    }
    this.#wire();
  }

  #wire(): void {
    if (!this.#live) return;
    const control = this.control;
    if (this.#wired && this.#wired.control !== control) {
      this.#unwire(this.#wired);
      this.#wired = null;
    }
    if (!control) {
      this.#label.removeAttribute('for');
      return;
    }
    const wired: Wired = this.#wired ?? { control, labelledBy: false, required: false, readOnly: false, ariaReadonly: false, ariaInvalid: false, ariaRequired: false, kit: {} };
    this.#wired = wired;
    const reason = this.lockedReason || null;
    const readonly = this.readonly || !!reason;
    const describedBy = [...(this.description || reason ? [this.#description.id] : []), ...(this.error ? [this.#error.id] : [])];

    const defined = control.localName.includes('-') ? customElements.get(control.localName) : undefined;
    if (control.localName.includes('-') && !(defined && control instanceof defined)) {
      // A custom element not yet upgraded may be a kit control, and properties set on it now would hide its accessors;
      // it is wired once it upgrades.
      if (!this.#waiting.has(control)) {
        this.#waiting.add(control);
        void customElements.whenDefined(control.localName).then(() => this.#wire());
      }
      return;
    }

    if (isKit(control)) {
      this.#label.removeAttribute('for');
      // Only what the field has is written, so a control's own `required` or `label` stands inside a field without one;
      // what the field wrote and no longer has goes back to the control's own value.
      const want: Record<KitKey, unknown> = {
        label: this.label,
        description: [this.description, reason].filter(Boolean).join(' ') || null,
        error: this.error,
        invalid: this.invalid || !!this.error || null,
        required: this.required || null,
        readonly: readonly || null,
      };
      const props = control as unknown as Record<KitKey, unknown>;
      for (const key of Object.keys(want) as KitKey[]) {
        const value = want[key];
        if (value !== null) {
          if (props[key] === value) continue;
          if (!(key in wired.kit)) wired.kit[key] = props[key];
          props[key] = value;
        } else if (key in wired.kit) {
          props[key] = wired.kit[key];
          delete wired.kit[key];
        }
      }
      return;
    }

    if (isGroup(control)) {
      this.#label.removeAttribute('for');
      control.setAttribute('aria-labelledby', this.#label.id);
      wired.labelledBy = true;
    } else {
      if (!control.id) control.id = `${this.#base}-control`;
      this.#label.htmlFor = control.id;
    }

    const ours = new Set([this.#description.id, this.#error.id]);
    const kept = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && !ours.has(id));
    const ids = [...kept, ...describedBy];
    if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
    else control.removeAttribute('aria-describedby');

    if (this.invalid || this.error) {
      if (control.getAttribute('aria-invalid') !== 'true') {
        control.setAttribute('aria-invalid', 'true');
        wired.ariaInvalid = true;
      }
    } else if (wired.ariaInvalid) {
      control.removeAttribute('aria-invalid');
      wired.ariaInvalid = false;
    }

    if (this.required) {
      if (control.getAttribute('aria-required') !== 'true') {
        control.setAttribute('aria-required', 'true');
        wired.ariaRequired = true;
      }
      if (isNative(control) && !control.required) {
        control.required = true;
        wired.required = true;
      }
    } else {
      if (wired.ariaRequired) control.removeAttribute('aria-required');
      if (wired.required && isNative(control)) control.required = false;
      wired.ariaRequired = false;
      wired.required = false;
    }

    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
      if (readonly && !control.readOnly) {
        control.readOnly = true;
        wired.readOnly = true;
      } else if (!readonly && wired.readOnly) {
        control.readOnly = false;
        wired.readOnly = false;
      }
    } else if (control instanceof HTMLSelectElement || control.getAttribute('role') === 'radiogroup') {
      // A select or a radio group has no read-only state; it is said to be one, and the page keeps its value.
      if (readonly && control.getAttribute('aria-readonly') !== 'true') {
        control.setAttribute('aria-readonly', 'true');
        wired.ariaReadonly = true;
      } else if (!readonly && wired.ariaReadonly) {
        control.removeAttribute('aria-readonly');
        wired.ariaReadonly = false;
      }
    }
  }

  /** Takes back what the field set on a control that is no longer its control. */
  #unwire(wired: Wired): void {
    const { control } = wired;
    if (isKit(control)) {
      for (const [key, before] of Object.entries(wired.kit)) (control as unknown as Record<string, unknown>)[key] = before;
      return;
    }
    if (wired.labelledBy && control.getAttribute('aria-labelledby') === this.#label.id) control.removeAttribute('aria-labelledby');
    const ours = new Set([this.#description.id, this.#error.id]);
    const kept = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && !ours.has(id));
    if (kept.length) control.setAttribute('aria-describedby', kept.join(' '));
    else control.removeAttribute('aria-describedby');
    if (wired.ariaInvalid) control.removeAttribute('aria-invalid');
    if (wired.ariaRequired) control.removeAttribute('aria-required');
    if (wired.required && isNative(control)) control.required = false;
    if (wired.readOnly && (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) control.readOnly = false;
    if (wired.ariaReadonly) control.removeAttribute('aria-readonly');
  }
}

reflect(AfField, PROPS);
