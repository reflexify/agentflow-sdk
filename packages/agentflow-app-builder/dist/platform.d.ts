import { CliError } from "./errors.js";
export type Env = Readonly<Record<string, string | undefined>>;
export type Answer = {
    status: number;
    body: Record<string, unknown>;
};
export type KeyVar = "AGENTFLOW_TOKEN" | "AGENTFLOW_SANDBOX_KEY";
export declare const isRecord: (value: unknown) => value is Record<string, unknown>;
export declare function problemLine(problem: unknown): string;
export declare class Refusal extends CliError {
    readonly status: number;
    constructor(code: string, message: string, status: number);
}
export declare class Platform {
    readonly root: string;
    private readonly token;
    private readonly source;
    private readonly keyHint;
    private readonly tokens;
    private constructor();
    static configure(env: Env, url: string | undefined, keyVar?: KeyVar): Platform;
    as(token: string, label: string): Platform;
    get(path: string, signal?: AbortSignal): Promise<Answer>;
    delete(path: string, signal?: AbortSignal): Promise<Answer>;
    postJson(path: string, body: unknown, headers?: Record<string, string>, signal?: AbortSignal): Promise<Answer>;
    postPackage(path: string, bytes: Uint8Array, fileName: string, signal?: AbortSignal): Promise<Answer>;
    unexpected(what: string): CliError;
    private hide;
    private refusal;
    private send;
    private refusedInFront;
}
//# sourceMappingURL=platform.d.ts.map