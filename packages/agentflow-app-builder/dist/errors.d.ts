export declare class CliError extends Error {
    code: string;
    files?: string[] | undefined;
    constructor(code: string, message: string, files?: string[] | undefined);
}
export declare class SealError extends CliError {
}
//# sourceMappingURL=errors.d.ts.map