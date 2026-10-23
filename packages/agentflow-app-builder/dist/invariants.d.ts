export interface EntitySource {
    key: string;
    fields: Record<string, unknown>[];
    [member: string]: unknown;
}
export declare function fieldKeysOf(file: EntitySource): Set<string>;
export declare function entityInvariants(file: EntitySource, params: Map<string, string>, entities: Map<string, EntitySource>, where: string): {
    rules?: unknown;
    stage_model?: unknown;
    work?: unknown;
    comments?: unknown;
};
export declare function grantRecordScope(file: EntitySource, entities: Map<string, EntitySource>, where: string, operation: string, scope: unknown, pointer: string): unknown;
//# sourceMappingURL=invariants.d.ts.map