type Schema = Record<string, unknown>;
export interface Problem {
    pointer: string;
    message: string;
}
export declare class SchemaCheck {
    private readonly root;
    private readonly name;
    private constructor();
    static load(file: URL, name: string): SchemaCheck;
    static of(root: Schema, name: string): SchemaCheck;
    /** Every problem with `value`, in document order; the empty list when it fits. */
    problems(value: unknown, pointer?: string): Problem[];
    private located;
    private evaluate;
    private oneOf;
    private declaresMembers;
    private deref;
    private resolve;
}
export {};
//# sourceMappingURL=schema-check.d.ts.map