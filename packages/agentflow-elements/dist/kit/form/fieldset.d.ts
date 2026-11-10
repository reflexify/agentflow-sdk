import type { KitStrings } from '../text.js';
/**
 * `<af-fieldset>`: a form section, a heading and a description over a grid of fields. Around a native `<fieldset>` the
 * page writes as its child, it heads that fieldset, which keeps disabling every control inside it; with none, it lays out
 * its own children and disables nothing. It has no shadow root and moves none of the page's nodes.
 */
export declare class AfFieldset extends HTMLElement {
    #private;
    static observedAttributes: string[];
    heading: string | null;
    description: string | null;
    locale: string | null;
    constructor();
    get strings(): Partial<KitStrings> | null;
    set strings(value: Partial<KitStrings> | null);
    /** 1 to 4, default 1. */
    get columns(): number;
    set columns(value: number | string | null);
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
}
//# sourceMappingURL=fieldset.d.ts.map