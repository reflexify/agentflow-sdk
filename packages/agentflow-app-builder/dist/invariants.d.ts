export interface EntitySource {
    key: string;
    fields: Record<string, unknown>[];
    [member: string]: unknown;
}
type Field = Record<string, unknown>;
type Json = Record<string, unknown>;
export type Connections = ReadonlyMap<string, string | undefined>;
export type PackageAccess = ReadonlyMap<string, ReadonlySet<string>>;
declare const USES: {
    readonly email_step: {
        readonly place: "an Email step";
        readonly verb: "send through";
        readonly categories: readonly ["email"];
    };
    readonly integration_step: {
        readonly place: "an Integration step";
        readonly verb: "call through";
        readonly categories: readonly ["crm", "erp"];
    };
    readonly trigger: {
        readonly place: "a connected_app trigger";
        readonly verb: "listen through";
        readonly categories: readonly ["crm", "email", "erp"];
    };
    readonly source: {
        readonly place: "a source";
        readonly verb: "read through";
        readonly categories: readonly ["crm", "erp"];
    };
};
export declare function checkConnectionUse(connections: Connections, use: keyof typeof USES, key: string, where: string, pointer: string): void;
export declare const classifiedByUnit: (file: EntitySource) => boolean;
export declare function fieldKeysOf(file: EntitySource): Set<string>;
export declare function nameableKeysOf(file: EntitySource): Set<string>;
export declare function fieldOf(file: EntitySource, key: string): Field | undefined;
interface Declared {
    rules?: unknown;
    stage_model?: unknown;
    work?: unknown;
    comments?: unknown;
    source?: unknown;
}
export declare function entityInvariants(file: EntitySource, params: Map<string, string>, entities: Map<string, EntitySource>, where: string, connections?: Connections, packages?: ReadonlySet<string>): Declared;
export declare const EXTENSIONS_PLATFORM = "2026.11";
export declare const QUERIED_BY_APP_PLATFORM = "2027.01";
export declare const usesQueriedByApp: (file: EntitySource) => boolean;
export declare function extensionBody(file: unknown, stem: string, where: string, access: PackageAccess): Json;
export declare function checkModulePage(file: EntitySource, hasUi: boolean, where: string): void;
export declare function grantRecordScope(file: EntitySource, entities: Map<string, EntitySource>, where: string, operation: string, scope: unknown, pointer: string): unknown;
export {};
//# sourceMappingURL=invariants.d.ts.map