export declare const byKey: (a: string, b: string) => number;
export declare function quote(text: string): string;
export declare const propertyName: (key: string) => string;
export declare function literal(value: unknown): string;
export declare function docLine(text: string): string;
/** A JSON Schema as a TypeScript type, nested object lines indented one step past `indent`. */
export declare function schemaToTs(schema: unknown, indent: string): string;
//# sourceMappingURL=schema.d.ts.map