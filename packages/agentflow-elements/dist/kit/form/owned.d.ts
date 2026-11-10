/** The attribute on every node a light-DOM kit element inserts, and the only nodes it ever moves. */
export declare const OWNED = "data-af-owned";
export declare const isOwned: (node: Node) => boolean;
/** Keeps `nodes` (marked data-af-owned) at the start or end of `host`'s children as the page changes them. */
export declare function keepOwned(host: Element, first: Element[], last: Element[]): () => void;
type Reflected = Record<string, {
    attribute: string;
    type: 'String' | 'Boolean';
}>;
/**
 * Gives `element`'s prototype a property for each entry that reads and writes its attribute: a String is the attribute's
 * value or `null` when it is absent, and a Boolean follows presence, as `disabled` does on an `<input>`.
 */
export declare function reflect(element: CustomElementConstructor, props: Reflected): void;
export {};
//# sourceMappingURL=owned.d.ts.map