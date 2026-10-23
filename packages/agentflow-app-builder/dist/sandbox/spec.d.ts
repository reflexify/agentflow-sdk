export type SandboxSpec = Record<string, unknown>;
type Problem = {
    field: string;
    message: string;
};
export declare function checkSpec(spec: unknown): Problem | null;
export declare function requireValidSpec(spec: unknown): void;
export declare function readSpec(cwd: string): SandboxSpec;
export declare function secretEnvs(spec: SandboxSpec): {
    key: string;
    env: string;
}[];
export {};
//# sourceMappingURL=spec.d.ts.map