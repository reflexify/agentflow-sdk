import { emit } from '../environment.js';
import type { KitStrings } from '../text.js';
import { kitText } from '../text.js';
import { AfField } from './field.js';
import { OWNED, isOwned, keepOwned, reflect } from './owned.js';

/** A server's error: `path` is a JSON Pointer to the field (`/address/city`), or `''` for the form as a whole. */
export interface FormError { path: string; message: string }
export interface AfSubmitDetail { formData: FormData; submitter: HTMLElement | null }

const PROPS = {
  busy: { attribute: 'busy', type: 'Boolean' },
  dirty: { attribute: 'dirty', type: 'Boolean' },
  locale: { attribute: 'locale', type: 'String' },
} as const;

const SUBMIT_BUTTONS = 'button:not([type]), [type=submit]';

/** `/address/city` to `address.city`, the name the field's error is filed under. */
const keyOf = (path: string) => path.replace(/^\//, '').replace(/\//g, '.');

/** Focuses `field`'s control, or the first focusable element inside a control that is only a group. */
function focusControl(field: AfField): void {
  const control = field.control;
  if (!(control instanceof HTMLElement)) return;
  control.focus();
  const root = control.getRootNode() as Document | ShadowRoot;
  const active = root.activeElement;
  if (active && (active === control || control.contains(active))) return;
  control.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])')?.focus();
}

/**
 * `<af-form>`: enhances the native `<form>` the page writes as its first child. Its submit becomes one `af-submit`,
 * locked against a second until the page has had its turn, and held while the page sets `busy`; a server's `errors` go on
 * the matching `af-field`s, with a summary for what matches none. It has no shadow root and moves none of the page's nodes.
 */
export class AfForm extends HTMLElement {
  static observedAttributes = ['busy', 'dirty', 'locale'];

  declare busy: boolean;
  declare dirty: boolean;
  declare locale: string | null;

  #strings: Partial<KitStrings> | null = null;
  #errors: FormError[] = [];
  // Set between connectedCallback and disconnectedCallback; an upgrade reports attributes before it connects.
  #live = false;
  #locked = false;
  #observer: MutationObserver | null = null;
  /** Each field error the form wrote, with the field's error before it. */
  #set = new Map<AfField, { ours: string; before: string | null }>();
  /** The submit buttons the form marked aria-disabled. */
  #marked = new Set<Element>();
  readonly #summary: HTMLElement = document.createElement('div');
  #kept: { form: HTMLFormElement; stop: () => void } | null = null;
  /** What the summary lists: the messages that matched no field, and the fields that have an error. */
  #listed: { unmatched: string[]; matched: AfField[] } = { unmatched: [], matched: [] };
  /** What the summary's list was last drawn with. */
  #drawn: { unmatched: string[]; links: { field: AfField; label: string }[] } | null = null;
  readonly #title: HTMLElement = Object.assign(document.createElement('div'), { className: 'af-banner-title' });
  #unloading = false;

  constructor() {
    super();
    this.#summary.className = 'af-form-summary af-banner danger';
    this.#summary.setAttribute(OWNED, '');
    this.#summary.setAttribute('role', 'alert');
    this.#summary.tabIndex = -1;
    this.addEventListener('submit', this.#onSubmit);
  }

  get strings(): Partial<KitStrings> | null { return this.#strings; }
  set strings(value: Partial<KitStrings> | null) {
    this.#strings = value ?? null;
    this.#drawSummary();
  }

  get errors(): FormError[] { return this.#errors; }
  set errors(value: FormError[] | null) {
    const next = Array.isArray(value) ? value : [];
    // React sets the property again whenever the array is a new one, so only a list with other content moves focus.
    const same = next.length === this.#errors.length && next.every((e, i) => e.path === this.#errors[i]!.path && e.message === this.#errors[i]!.message);
    this.#errors = next;
    this.#showErrors(next.length > 0 && !same);
  }

  /** The first `<form>` child the page wrote. */
  get #form(): HTMLFormElement | null {
    for (const child of this.children) if (child instanceof HTMLFormElement && !isOwned(child)) return child;
    return null;
  }

  connectedCallback(): void {
    for (const prop of [...Object.keys(PROPS), 'strings', 'errors']) {
      // A property set before the tag was defined sits on the instance and hides the accessor.
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = (this as unknown as Record<string, unknown>)[prop];
        delete (this as unknown as Record<string, unknown>)[prop];
        (this as unknown as Record<string, unknown>)[prop] = value;
      }
    }
    this.#live = true;
    // A React re-render can add a submit button while busy, or swap the form.
    this.#observer = new MutationObserver(() => this.#tend());
    this.#observer.observe(this, { childList: true, subtree: true });
    this.#tend();
    this.#holdUnload();
    // Fields inside are upgraded after this element connects, so errors set before then are placed once they are.
    if (this.#errors.length) queueMicrotask(() => this.#showErrors(false));
  }

  disconnectedCallback(): void {
    this.#live = false;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#kept?.stop();
    this.#kept = null;
    this.#holdUnload();
  }

  attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (name === 'busy') {
      // The lock taken at a submit the page answered with busy is released when busy clears.
      if (before !== null && after === null) this.#locked = false;
      this.#markButtons();
    } else if (name === 'dirty') this.#holdUnload();
    else if (name === 'locale') this.#drawSummary();
  }

  #onSubmit = (e: Event): void => {
    const form = this.#form;
    if (!form || e.target !== form) return;
    e.preventDefault();
    if (this.#locked || this.busy) return;
    this.#locked = true;
    const submitter = (e as SubmitEvent).submitter ?? null;
    let formData: FormData;
    try {
      formData = new FormData(form, submitter);
    } catch {
      formData = new FormData(form);
    }
    emit<AfSubmitDetail>(this, 'af-submit', { formData, submitter });
    // A page that sets busy in its handler, or in a microtask from it, keeps the lock until it clears busy.
    setTimeout(() => {
      if (!this.busy) this.#locked = false;
    }, 0);
  };

  #onUnload = (e: Event): void => {
    e.preventDefault();
    // Older Safari asks before leaving only when returnValue is set.
    (e as BeforeUnloadEvent).returnValue = '';
  };

  #holdUnload(): void {
    const want = this.#live && this.dirty;
    if (want === this.#unloading) return;
    this.#unloading = want;
    if (want) window.addEventListener('beforeunload', this.#onUnload);
    else window.removeEventListener('beforeunload', this.#onUnload);
  }

  #tend(): void {
    if (!this.#live) return;
    if (this.#kept && this.#kept.form !== this.#form) {
      this.#kept.stop();
      this.#kept = null;
      this.#summary.remove();
    }
    this.#markButtons();
  }

  #markButtons(): void {
    const form = this.#form;
    const want = new Set<Element>(this.busy && this.#live && form ? form.querySelectorAll(SUBMIT_BUTTONS) : []);
    for (const button of this.#marked) {
      if (want.has(button)) continue;
      if (button.getAttribute('aria-disabled') === 'true') button.removeAttribute('aria-disabled');
      this.#marked.delete(button);
    }
    for (const button of want) {
      if (button.getAttribute('aria-disabled') === 'true') continue;
      button.setAttribute('aria-disabled', 'true');
      this.#marked.add(button);
    }
  }

  #fields(): AfField[] {
    const form = this.#form;
    return form ? [...form.querySelectorAll('af-field')].filter((el): el is AfField => el instanceof AfField) : [];
  }

  #showErrors(focus: boolean): void {
    if (!this.#live) return;
    const form = this.#form;
    const fields = this.#fields();
    const byKey = new Map<string, string[]>();
    for (const { path, message } of this.#errors) {
      const key = keyOf(String(path ?? ''));
      byKey.set(key, [...(byKey.get(key) ?? []), String(message ?? '')]);
    }

    // What each matched field's error should be. A field that keeps the error the form wrote is left untouched, so a list
    // set again with the same content (React sets a new array on every render) changes nothing on the page.
    const want = new Map<AfField, string>();
    const used = new Set<string>();
    for (const field of fields) {
      const key = field.name;
      if (!key || !byKey.has(key)) continue;
      used.add(key);
      want.set(field, byKey.get(key)!.join(' '));
    }
    // Give back what the form wrote and no longer wants, unless the page has since written its own.
    for (const [field, entry] of this.#set) {
      const next = want.get(field);
      if (field.error !== entry.ours) this.#set.delete(field);
      else if (next === undefined) {
        field.error = entry.before;
        this.#set.delete(field);
      } else if (next !== entry.ours) {
        entry.ours = next;
        field.error = next;
      }
    }
    for (const [field, ours] of want) {
      if (this.#set.has(field)) continue;
      this.#set.set(field, { ours, before: field.error });
      field.error = ours;
    }
    const matched = [...want.keys()];
    const unmatched = [...byKey].filter(([key]) => !used.has(key)).flatMap(([, messages]) => messages);

    this.#listed = { unmatched, matched };
    if (unmatched.length && form) {
      this.#drawSummary();
      if (!this.#kept) this.#kept = { form, stop: keepOwned(form, [this.#summary], []) };
    } else {
      this.#kept?.stop();
      this.#kept = null;
      this.#summary.remove();
    }

    if (!focus) return;
    if (this.#kept) this.#summary.focus();
    else if (matched[0]) focusControl(matched[0]);
  }

  #drawSummary(): void {
    const { unmatched, matched } = this.#listed;
    if (!unmatched.length) return;
    const text = kitText(this.locale, this.#strings ?? undefined);
    // The title is set in place, so a change of language leaves the list, and a link that has focus, where they are.
    if (this.#title.textContent !== text.formErrors) this.#title.textContent = text.formErrors;
    const links = matched.map((field) => ({ field, label: field.label || field.name || '' }));
    // The list is drawn again only when what it says changed: a redraw makes a screen reader announce the alert again,
    // and drops the focus of a link in it.
    const drawn = this.#drawn;
    const same = drawn !== null
      && drawn.unmatched.length === unmatched.length && drawn.unmatched.every((m, i) => m === unmatched[i])
      && drawn.links.length === links.length && drawn.links.every((l, i) => l.field === links[i]!.field && l.label === links[i]!.label);
    if (!same) {
      const list = Object.assign(document.createElement('ul'), { className: 'af-banner-description' });
      for (const message of unmatched) list.append(Object.assign(document.createElement('li'), { textContent: message }));
      for (const { field, label } of links) {
        const link = Object.assign(document.createElement('a'), { href: '#', textContent: label });
        link.addEventListener('click', (e) => {
          e.preventDefault();
          focusControl(field);
        });
        const item = document.createElement('li');
        item.append(link);
        list.append(item);
      }
      this.#drawn = { unmatched, links };
      this.#summary.replaceChildren(this.#title, list);
    }
  }
}

reflect(AfForm, PROPS);
