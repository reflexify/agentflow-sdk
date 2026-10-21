export declare class AgentFlowError extends Error {
    readonly status: number;
    readonly code: string;
    readonly detail?: string | undefined;
    readonly requestId?: string | undefined;
    readonly fieldErrors?: unknown[] | undefined;
    constructor(status: number, code: string, detail?: string | undefined, requestId?: string | undefined, fieldErrors?: unknown[] | undefined);
}
export declare function ok<T>(result: Promise<{
    data?: T;
    error?: unknown;
    response: Response;
}>): Promise<T>;
//# sourceMappingURL=errors.d.ts.map