import type { SlotFolder } from '@reflexify/agentflow-sdk';
export type FieldKind = 'text' | 'email' | 'date' | 'datetime' | 'number' | 'integer' | 'boolean' | 'choice' | 'folder' | 'unsupported';
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
    /** What a folder field's launch reads, as the workflow's input contract says. */
    folder?: SlotFolder;
}
/** A field of the workflow's input contract, as far as a form reads it. */
export interface ContractSlot {
    key: string;
    title?: string | null;
    required?: boolean;
    folder?: SlotFolder | null;
}
/** Whether a form has a field of several files, the only kind a workflow's contract can give a folder. */
export declare function takesFiles(schema: unknown): boolean;
export declare function fieldsOf(schema: unknown, uiSchema?: unknown, slots?: readonly ContractSlot[]): FieldSpec[];
/** The fields of a start that binds no form: the contract types no parameter, but a folder field needs only what its slot says. */
export declare function folderFieldsOf(slots: readonly ContractSlot[]): FieldSpec[];
export declare function initialValues(fields: FieldSpec[], source: unknown): Record<string, unknown>;
export declare function toPayload(fields: FieldSpec[], values: Record<string, unknown>): Record<string, unknown>;
export declare function missingRequired(fields: FieldSpec[], values: Record<string, unknown>): string[];
/** The required fields the form cannot take a value for. A folder field is one when its source could not be loaded. */
export declare function blockingFields(fields: FieldSpec[], foldersUnavailable?: boolean): FieldSpec[];
export declare function errorsByField(fieldErrors: {
    path: string;
    message: string;
}[] | undefined): Record<string, string>;
//# sourceMappingURL=form.d.ts.map