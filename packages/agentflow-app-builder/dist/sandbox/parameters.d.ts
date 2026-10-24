import type { SandboxSpec } from "./spec.js";
export interface ParameterFindings {
    problem: {
        field: string;
        message: string;
    } | null;
    warnings: string[];
}
export declare function parameterFindings(spec: SandboxSpec, cwd: string): ParameterFindings;
export declare function requireParametersFit(spec: SandboxSpec, cwd: string): string[];
//# sourceMappingURL=parameters.d.ts.map