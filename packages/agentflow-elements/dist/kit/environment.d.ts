export declare function shadowOf(host: HTMLElement): ShadowRoot;
/** Raises a kit event on `host`. A cancelable one returns false when a listener called `preventDefault()`. */
export declare function emit<T>(host: HTMLElement, type: string, detail: T, init?: {
    cancelable?: boolean;
}): boolean;
/** Shows or hides a `popover` layer, and records the state as `data-raised` on `host`, the element the app holds. */
export declare function raise(el: HTMLElement | null | undefined, open: boolean, host: HTMLElement): void;
/** The element that holds focus, inside whatever shadow roots it sits in. */
export declare function deepActiveElement(): HTMLElement | null;
/** Whether `node` is `host` or inside it, across shadow roots: the light DOM slotted into it and any nested element's shadow tree. */
export declare function within(host: Element, node: Node): boolean;
export declare function isTopModal(host: HTMLElement): boolean;
export declare function modalSync(host: HTMLElement): (el: HTMLDialogElement | null, open: boolean) => void;
/**
 * Whether `host` is drawn inside `layer`, walking the flattened tree: a slotted node climbs to its slot, a shadow root to
 * its host. Zag's layer stack takes every layer opened after another as nested in it, and dismisses it when that one
 * closes; a kit overlay asks this to tell a layer it really sits in from one that merely opened before it.
 */
export declare function drawnInside(layer: Node, host: Node): boolean;
/**
 * The text direction `host` is in: the value of its closest `dir` attribute, climbing out of shadow roots, else its
 * computed `direction`. A Zag machine takes it once, when it is created, for its arrow keys and its parts' `dir`.
 */
export declare function directionOf(host: Element): 'ltr' | 'rtl';
//# sourceMappingURL=environment.d.ts.map