export interface Problem {
    code: string;
    status: number;
    detail?: string;
    requestId?: string;
    fieldErrors?: {
        path: string;
        message: string;
    }[];
}
export declare const APP_KEY_MISSING = "APP_KEY_MISSING";
export type Classified = {
    type: 'signed-out';
} | {
    type: 'access-lost';
    code: string;
} | {
    type: 'other';
    problem: Problem;
};
export declare function classify(error: unknown): Classified;
//# sourceMappingURL=errors.d.ts.map