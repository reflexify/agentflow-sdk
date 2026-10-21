export declare function shadowOf(host: HTMLElement): ShadowRoot;
export declare function emit<T>(host: HTMLElement, type: string, detail: T): void;
/** Shows or hides a `popover` layer, and records the state as `data-raised` on `host`, the element the app holds. */
export declare function raise(el: HTMLElement | null | undefined, open: boolean, host: HTMLElement): void;
/** Whether `node` is `host` or inside it, across shadow roots: the light DOM slotted into it and any nested element's shadow tree. */
export declare function within(host: Element, node: Node): boolean;
export declare function isTopModal(host: HTMLElement): boolean;
export declare function modalSync(host: HTMLElement): (el: HTMLDialogElement | null, open: boolean) => void;
//# sourceMappingURL=environment.d.ts.map