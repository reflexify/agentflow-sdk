import { type ObjectEntry } from "./core.js";
export declare function memoryTypeObject(configDir: string, key: string, params: Map<string, string>): ObjectEntry;
export declare function memoryRelationshipObject(configDir: string, key: string): ObjectEntry;
export declare function memoryReferences(list: unknown, where: string, pointer: string, prefix: string, max: number, what: string): void;
export declare function memorySaveOf(value: unknown, where: string, pointer: string): unknown;
export declare function checkMemory(objects: ObjectEntry[]): void;
//# sourceMappingURL=memory.d.ts.map