export interface Manifest {
    parameters: {
        key: string;
    }[];
    requires: {
        entities: {
            key: string;
        }[];
    };
    [k: string]: unknown;
}
export type ObjectEntry = [key: string, body: unknown];
export type Special = Record<string, (value: unknown, where: string, pointer: string) => unknown>;
export declare const REQUIRED_ENTITIES: Record<string, "user" | "org_unit">;
export declare function refuse(where: string, pointer: string, message: string): never;
export declare const clip: (text: string) => string;
export declare const at: (pointer: string, key: string | number) => string;
export declare const isObject: (value: unknown) => value is Record<string, unknown>;
export declare function readJson(file: string): any;
export declare function onlyMembers(value: object, allowed: readonly string[], where: string, pointer: string): void;
export declare function translate(value: unknown, where: string, pointer: string, special?: Special): unknown;
export declare function parameterOf(value: unknown, where: string, pointer: string): string;
export declare function targetEntity(value: unknown, where: string, pointer: string): string;
export declare const kindOf: (key: string) => string;
export declare const objectPath: (key: string) => string;
export declare function checkReferences(objects: ObjectEntry[], manifest: Manifest): void;
export declare function renderFiles(manifest: object, objects: ObjectEntry[]): Record<string, string>;
export declare function writeFiles(packageDir: string, files: Record<string, string>): number;
//# sourceMappingURL=core.d.ts.map