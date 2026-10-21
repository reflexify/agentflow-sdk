export type Json = Record<string, any>;
export declare class Draft {
    readonly files: Map<string, Buffer>;
    readonly manifest: Json;
    readonly objects: {
        key: string;
        kind: string;
    }[];
    readonly grants: Json[];
    private readonly taken;
    private readonly takenGrants;
    constructor(files: Map<string, Buffer>);
    keys(kind: string): string[];
    has(key: string): boolean;
    take(key: string): Json;
    takeGrant(index: number): Json;
    leftovers(): void;
}
export declare function manifestConfig(draft: Draft): Json;
//# sourceMappingURL=manifest.d.ts.map