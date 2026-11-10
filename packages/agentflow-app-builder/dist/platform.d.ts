import { CliError } from "./errors.js";
export type Env = Readonly<Record<string, string | undefined>>;
export type Answer = {
    status: number;
    body: Record<string, unknown>;
};
export type KeyVar = "AGENTFLOW_TOKEN" | "AGENTFLOW_SANDBOX_KEY";
export declare const OFFLINE_CHECKS = "with no deployment to ask, agentflow-app build --check, types --check (with a UI module) and sandbox check (with a sandbox.json) still run offline (the release skill's \"Without a deployment\" says what stays unchecked)";
export declare const isRecord: (value: unknown) => value is Record<string, unknown>;
export declare function problemLine(problem: unknown): string;
export declare function planFindingLine(finding: unknown): string;
export declare function causeFirst(findings: unknown[]): string[];
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
    static configure(env: Env, url: string | undefined, keyVar?: KeyVar, offline?: string): Platform;
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