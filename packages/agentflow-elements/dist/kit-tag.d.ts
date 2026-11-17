/**
 * Defines one kit tag these elements draw, loading its code the first time it is asked for. A page whose own kit registered
 * the tag keeps its copy, and then nothing is loaded.
 */
export declare function defineKitTag(tag: string, load: () => Promise<{
    default: unknown;
}>, registry?: CustomElementRegistry): Promise<void>;
//# sourceMappingURL=kit-tag.d.ts.map