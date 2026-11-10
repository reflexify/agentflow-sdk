import { KIT_TEXT } from '../text.js';

export interface FormState {
  name: string | null;
  /** null submits nothing; an array submits one entry per item under `name`. */
  value: string | string[] | null;
  validity: { valueMissing?: boolean; rangeUnderflow?: boolean; rangeOverflow?: boolean; badInput?: boolean };
  /** '' when valid. */
  message: string;
  /** The inner input the browser points at. */
  anchor?: HTMLElement | null;
}

interface FormHooks { reset(): void; disabled(disabled: boolean): void }

const internalsOf = new WeakMap<HTMLElement, ElementInternals>();
const hooksOf = new WeakMap<HTMLElement, FormHooks>();
// The browser can report a disabled fieldset before the component inside has mounted and registered its hooks.
const disabledOf = new WeakMap<HTMLElement, boolean>();

/** Svelte's customElement `extend`: adds formAssociated, `internals`, `form`, `validity`, `validationMessage`,
 *  `willValidate`, `checkValidity()`, `reportValidity()`, and the reset and disabled callbacks. */
export function formAssociate<T extends new () => HTMLElement>(base: T): T {
  const Base = base as unknown as new () => HTMLElement;
  return class extends Base {
    static formAssociated = true;
    readonly internals: ElementInternals;
    constructor() {
      super();
      this.internals = this.attachInternals();
      internalsOf.set(this, this.internals);
    }
    get form(): HTMLFormElement | null { return this.internals.form ?? null; }
    get validity(): ValidityState { return this.internals.validity; }
    get validationMessage(): string { return this.internals.validationMessage; }
    get willValidate(): boolean { return this.internals.willValidate; }
    checkValidity(): boolean { return this.internals.checkValidity(); }
    reportValidity(): boolean { return this.internals.reportValidity(); }
    // With delegatesFocus the browser would focus the shadow root's first focusable element, which in a multiple picker
    // holding a value is a chip's remove button. The control's input is where a label, a form or the page means focus.
    focus(options?: FocusOptions): void {
      const input = this.shadowRoot?.querySelector<HTMLElement>('[part~="input"]');
      if (input) input.focus(options);
      else super.focus(options);
    }
    formResetCallback(): void { hooksOf.get(this)?.reset(); }
    formDisabledCallback(disabled: boolean): void {
      disabledOf.set(this, disabled);
      hooksOf.get(this)?.disabled(disabled);
    }
  } as unknown as T;
}

/** Writes `state` to the host's internals; a no-op where internals lack the method (jsdom without the stub). */
export function writeForm(host: HTMLElement, state: FormState): void {
  const internals = internalsOf.get(host);
  if (!internals || typeof internals.setFormValue !== 'function') return;
  const { name, value } = state;
  if (Array.isArray(value)) {
    // Entries of a FormData value are submitted under their own names, so each carries `name`.
    if (name) {
      const data = new FormData();
      for (const item of value) data.append(name, item);
      internals.setFormValue(data);
    } else internals.setFormValue(null);
  } else internals.setFormValue(value);
  const invalid = Object.values(state.validity).some(Boolean);
  // The browser refuses a flag without a message, which a page's strings can blank.
  if (invalid) internals.setValidity(state.validity, state.message || KIT_TEXT.en.valueMissing, state.anchor ?? undefined);
  else internals.setValidity({});
}

/** Called by the class's formResetCallback and formDisabledCallback; a component registers them once. */
export function onFormEvents(host: HTMLElement, hooks: FormHooks): void {
  hooksOf.set(host, hooks);
  if (disabledOf.get(host)) hooks.disabled(true);
}
