import type { KitStrings } from '../text.js';
/** A server's error: `path` is a JSON Pointer to the field (`/address/city`), or `''` for the form as a whole. */
export interface FormError {
    path: string;
    message: string;
}
export interface AfSubmitDetail {
    formData: FormData;
    submitter: HTMLElement | null;
}
/**
 * `<af-form>`: enhances the native `<form>` the page writes as its first child. Its submit becomes one `af-submit`,
 * locked against a second until the page has had its turn, and held while the page sets `busy`; a server's `errors` go on
 * the matching `af-field`s, with a summary for what matches none. It has no shadow root and moves none of the page's nodes.
 */
export declare class AfForm extends HTMLElement {
    #private;
    static observedAttributes: string[];
    busy: boolean;
    dirty: boolean;
    locale: string | null;
    constructor();
    get strings(): Partial<KitStrings> | null;
    set strings(value: Partial<KitStrings> | null);
    get errors(): FormError[];
    set errors(value: FormError[] | null);
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, before: string | null, after: string | null): void;
}
//# sourceMappingURL=form.d.ts.map