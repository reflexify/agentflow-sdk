export type PublishedOperation = {
    method: string;
    path: string;
    idempotent: boolean;
};
/** The published operation a request targets, or undefined. `path` is relative to /api/v1. */
export declare function matchOperation(method: string, path: string): PublishedOperation | undefined;
//# sourceMappingURL=operations.d.ts.map