export type FieldKind = 'text' | 'email' | 'date' | 'datetime' | 'number' | 'integer' | 'boolean' | 'choice' | 'unsupported';
export interface FieldSpec {
    key: string;
    label: string;
    description?: string;
    kind: FieldKind;
    required: boolean;
    options?: {
        value: string;
        label: string;
    }[];
}
export declare function fieldsOf(schema: unknown, uiSchema?: unknown): FieldSpec[];
export declare function initialValues(fields: FieldSpec[], source: unknown): Record<string, unknown>;
export declare function toPayload(fields: FieldSpec[], values: Record<string, unknown>): Record<string, unknown>;
export declare function missingRequired(fields: FieldSpec[], values: Record<string, unknown>): string[];
export declare function blockingFields(fields: FieldSpec[]): FieldSpec[];
export declare function errorsByField(fieldErrors: {
    path: string;
    message: string;
}[] | undefined): Record<string, string>;
//# sourceMappingURL=form.d.ts.map