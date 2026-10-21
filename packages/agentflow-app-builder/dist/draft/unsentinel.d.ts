export type Inverse = Record<string, (value: unknown, where: string, pointer: string) => unknown>;
export declare const shown: (value: unknown) => string;
export declare function unsupported(where: string, pointer: string, message: string): never;
export declare function invalid(where: string, message: string): never;
export declare function unsentinel(value: unknown, where: string, pointer: string, special?: Inverse): unknown;
export declare function entityTarget(value: unknown, where: string, pointer: string): string;
export declare function parameter(value: unknown, where: string, pointer: string): string;
//# sourceMappingURL=unsentinel.d.ts.map