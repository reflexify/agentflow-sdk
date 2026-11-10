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
//# sourceMappingURL=environment.d.ts.map