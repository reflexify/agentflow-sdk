import { type ObjectEntry } from "./core.js";
import { type EntitySource } from "./invariants.js";
export interface Grant {
    key: string;
    to: string;
    entity?: string;
    workflow?: string;
    operations?: Record<string, unknown>;
    record_scopes?: Record<string, unknown[]>;
}
export declare function fieldBody(entityKey: string, field: Record<string, unknown>, where: string, pointer: string): ObjectEntry;
export declare function viewBody(entityKey: string, view: any, file: EntitySource, where: string, pointer: string): ObjectEntry;
export declare function xEntity(entities: readonly string[]): (value: unknown, where: string, pointer: string) => string;
export declare function entityGrants(file: any, entityKey: string, where: string, entities?: Map<string, EntitySource>, params?: Map<string, string>): Grant[];
export declare const entitySource: (configDir: string, entityKey: string) => EntitySource;
export declare function entityObjects(configDir: string, entityKey: string, entities: readonly string[], params?: Map<string, string>, sources?: Map<string, EntitySource>): {
    objects: ObjectEntry[];
    grants: Grant[];
};
//# sourceMappingURL=entity.d.ts.map