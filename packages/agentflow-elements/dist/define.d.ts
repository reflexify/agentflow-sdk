export type Compiled = {
    element: CustomElementConstructor;
};
type Stamp = 'elementsVersion' | 'kitVersion';
/** Reports a copy of `tag` that another, older copy of this package registered first. The page keeps that copy. */
export declare function reportOlder(tag: string, existing: CustomElementConstructor, stamp: Stamp, loaded: string, name: string): void;
/** Defines each tag that is not defined yet, and leaves one another copy registered first. */
export declare function define(registry: CustomElementRegistry, tags: Record<string, Compiled>, stamp: Stamp, loaded: string, name: string): void;
export {};
//# sourceMappingURL=define.d.ts.map