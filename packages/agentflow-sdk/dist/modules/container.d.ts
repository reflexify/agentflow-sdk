export interface ModuleContainer {
    /** Where the module renders. */
    root: HTMLElement;
    /** Where its dialogs and popovers render: `AppHost.portalRoot`. */
    portalRoot: HTMLElement;
}
/**
 * Gives `element` the open shadow root a module renders in, holding the module's root and its portal
 * root. Calling it again on the same element empties and reuses the shadow root, since an element can
 * have only one: React's development double mount does exactly that.
 */
export declare function createModuleContainer(element: HTMLElement): ModuleContainer;
//# sourceMappingURL=container.d.ts.map