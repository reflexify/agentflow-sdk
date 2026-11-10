import type { KitStrings } from '../text.js';
/**
 * `<af-field>`: a label, a description and an error around one control the page writes as its child. It has no shadow
 * root: it inserts nodes of its own, each marked `data-af-owned`, and keeps them first and last as the page changes its
 * children, never moving one of the page's.
 */
export declare class AfField extends HTMLElement {
    #private;
    static observedAttributes: string[];
    label: string | null;
    description: string | null;
    error: string | null;
    invalid: boolean;
    required: boolean;
    readonly: boolean;
    edited: boolean;
    lockedReason: string | null;
    locale: string | null;
    constructor();
    get strings(): Partial<KitStrings> | null;
    set strings(value: Partial<KitStrings> | null);
    /** The field's own `name`, or else its control's: what a form files the field's error under. */
    get name(): string | null;
    set name(value: string | null);
    /** The first element child that is neither the field's own nor in a named slot. */
    get control(): Element | null;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
}
//# sourceMappingURL=field.d.ts.map