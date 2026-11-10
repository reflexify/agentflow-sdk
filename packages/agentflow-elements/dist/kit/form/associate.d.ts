export interface FormState {
    name: string | null;
    /** null submits nothing; an array submits one entry per item under `name`. */
    value: string | string[] | null;
    validity: {
        valueMissing?: boolean;
        rangeUnderflow?: boolean;
        rangeOverflow?: boolean;
        badInput?: boolean;
    };
    /** '' when valid. */
    message: string;
    /** The inner input the browser points at. */
    anchor?: HTMLElement | null;
}
interface FormHooks {
    reset(): void;
    disabled(disabled: boolean): void;
}
/** Svelte's customElement `extend`: adds formAssociated, `internals`, `form`, `validity`, `validationMessage`,
 *  `willValidate`, `checkValidity()`, `reportValidity()`, and the reset and disabled callbacks. */
export declare function formAssociate<T extends new () => HTMLElement>(base: T): T;
/** Writes `state` to the host's internals; a no-op where internals lack the method (jsdom without the stub). */
export declare function writeForm(host: HTMLElement, state: FormState): void;
/** Called by the class's formResetCallback and formDisabledCallback; a component registers them once. */
export declare function onFormEvents(host: HTMLElement, hooks: FormHooks): void;
export {};
//# sourceMappingURL=associate.d.ts.map